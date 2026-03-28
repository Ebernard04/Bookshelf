const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.*, a.name as creator_name 
      FROM universes u
      LEFT JOIN authors a ON u.creator_id = a.id
      ORDER BY u.name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.*, a.name as creator_name 
      FROM universes u
      LEFT JOIN authors a ON u.creator_id = a.id
      WHERE u.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Universe not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { name, creator_id, themes, status, notes } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO universes (name, creator_id, themes, status, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, creator_id, themes, status, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { name, creator_id, themes, status, notes } = req.body;
  try {
    const result = await db.query(
      'UPDATE universes SET name=$1, creator_id=$2, themes=$3, status=$4, notes=$5 WHERE id=$6 RETURNING *',
      [name, creator_id, themes, status, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Universe not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM universes WHERE id = $1', [req.params.id]);
    res.json({ message: 'Universe deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;