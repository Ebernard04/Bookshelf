const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT rl.*, b.title as book_title
      FROM reading_log rl
      LEFT JOIN books b ON rl.book_id = b.id
      ORDER BY rl.log_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { log_date, event_type, book_id, note } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO reading_log (log_date, event_type, book_id, note) VALUES ($1, $2, $3, $4) RETURNING *',
      [log_date, event_type, book_id, note]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM reading_log WHERE id = $1', [req.params.id]);
    res.json({ message: 'Log entry deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;