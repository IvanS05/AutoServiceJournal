import { open } from '@op-engineering/op-sqlite';

// Открываем БД
let db;

export const initDatabase = async () => {
  try {
    db = await open({
      name: 'autoservice.db',
      location: 'default',
    });

    // Создаем таблицу
    await db.execute(`
      CREATE TABLE IF NOT EXISTS records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workType TEXT NOT NULL,
        mileage INTEGER NOT NULL,
        date TEXT NOT NULL
      );
    `);

    console.log('Database initialized');
  } catch (error) {
    console.error('Database error:', error);
  }
};

// Получить все записи
export const getRecords = async () => {
  try {
    const result = await db.execute('SELECT * FROM records ORDER BY date DESC');
    return result.rows || [];
  } catch (error) {
    console.error('Error getting records:', error);
    return [];
  }
};

// Добавить запись
export const addRecord = async (record) => {
  try {
    await db.execute(
      'INSERT INTO records (workType, mileage, date) VALUES (?, ?, ?)',
      [record.workType, record.mileage, record.date]
    );
  } catch (error) {
    console.error('Error adding record:', error);
  }
};

// Обновить запись
export const updateRecord = async (record) => {
  try {
    await db.execute(
      'UPDATE records SET workType = ?, mileage = ?, date = ? WHERE id = ?',
      [record.workType, record.mileage, record.date, record.id]
    );
  } catch (error) {
    console.error('Error updating record:', error);
  }
};

// Удалить запись
export const deleteRecord = async (id) => {
  try {
    await db.execute('DELETE FROM records WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting record:', error);
  }
};

// Добавить тестовые данные
export const insertSampleData = async () => {
  try {
    const result = await db.execute('SELECT COUNT(*) as count FROM records');
    if (result.rows[0].count === 0) {
      const sampleData = [
        ['Замена масла', 15200, '2025-10-01'],
        ['Замена фильтра', 15800, '2025-11-15'],
        ['Шиномонтаж', 16300, '2025-12-05'],
      ];
      
      for (const [workType, mileage, date] of sampleData) {
        await db.execute(
          'INSERT INTO records (workType, mileage, date) VALUES (?, ?, ?)',
          [workType, mileage, date]
        );
      }
    }
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
};