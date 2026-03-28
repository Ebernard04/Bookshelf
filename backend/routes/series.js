const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT s.*, u.name as universe_name
      FROM series s
      LEFT JOIN universes u ON s.universe_id = u.id
      ORDER BY s.name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT s.*, u.name as universe_name
      FROM series s
      LEFT JOIN universes u ON s.universe_id = u.id
      WHERE s.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Series not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { name, universe_id, series_type, status, notes } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO series (name, universe_id, series_type, status, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, universe_id, series_type, status, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { name, universe_id, series_type, status, notes } = req.body;
  try {
    const result = await db.query(
      'UPDATE series SET name=$1, universe_id=$2, series_type=$3, status=$4, notes=$5 WHERE id=$6 RETURNING *',
      [name, universe_id, series_type, status, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Series not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM series WHERE id = $1', [req.params.id]);
    res.json({ message: 'Series deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;