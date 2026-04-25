require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const recordsRouter = require('./routes/records');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/records', recordsRouter);

app.listen(PORT, () => {
  console.log(`AutoService backend running on http://localhost:${PORT}`);
});
