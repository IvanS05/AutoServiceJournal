const express = require('express');
const { ImageKit, toFile } = require('@imagekit/nodejs');
const db = require('../db');
require('dotenv').config();

const router = express.Router();

const imagekit = new ImageKit({
  publicKey:   process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey:  process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  timeout:     60000, // 60 с на загрузку в ImageKit
});

// Загрузить изображение в ImageKit из base64-строки
async function uploadBase64(base64, mime, name) {
  const buffer = Buffer.from(base64, 'base64');
  const fileName = name || `photo_${Date.now()}.jpg`;
  const result = await imagekit.files.upload({
    file:     await toFile(buffer, fileName, { type: mime || 'image/jpeg' }),
    fileName,
    folder:   '/autoservice',
  });
  return result.url;
}

// Приводит ISO / JS datetime → 'YYYY-MM-DD HH:mm:ss' для MySQL DATETIME
function toMySqlDateTime(value) {
  if (!value) return null;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

// ── GET /api/records ──────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM records ORDER BY date DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/records/:id ──────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM records WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/records ─────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { workType, mileage, date, reminder_time,
            imageBase64, imageMime, imageName } = req.body;

    if (!workType || !mileage || !date) {
      return res.status(400).json({ error: 'workType, mileage and date are required' });
    }

    let image_url = null;
    if (imageBase64) {
      image_url = await uploadBase64(imageBase64, imageMime, imageName);
    }

    const [result] = await db.query(
      'INSERT INTO records (workType, mileage, date, reminder_time, image_url) VALUES (?, ?, ?, ?, ?)',
      [workType, Number(mileage), date, toMySqlDateTime(reminder_time), image_url]
    );
    const [rows] = await db.query('SELECT * FROM records WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/records/:id ──────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { workType, mileage, date, reminder_time, keep_image,
            imageBase64, imageMime, imageName } = req.body;

    if (!workType || !mileage || !date) {
      return res.status(400).json({ error: 'workType, mileage and date are required' });
    }

    const [existing] = await db.query('SELECT * FROM records WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ error: 'Not found' });

    // keep_image приходит как boolean (JSON) или строка (FormData) — оба случая
    const shouldKeep = keep_image === true || keep_image === 'true';
    let image_url = shouldKeep ? existing[0].image_url : null;

    if (imageBase64) {
      image_url = await uploadBase64(imageBase64, imageMime, imageName);
    }

    await db.query(
      'UPDATE records SET workType=?, mileage=?, date=?, reminder_time=?, image_url=? WHERE id=?',
      [workType, Number(mileage), date, toMySqlDateTime(reminder_time), image_url, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM records WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/records/:id ───────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM records WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
