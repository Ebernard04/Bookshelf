const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const { status, author_id, series_id } = req.query;
    let query = `
      SELECT b.*, 
        a.name as author_name,
        s.name as series_name,
        u.name as universe_name
      FROM books b
      LEFT JOIN authors a ON b.author_id = a.id
      LEFT JOIN series s ON b.series_id = s.id
      LEFT JOIN universes u ON b.universe_id = u.id
      WHERE 1=1
    `;
    const params = [];
    if (status) { params.push(status); query += ` AND b.status = $${params.length}`; }
    if (author_id) { params.push(author_id); query += ` AND b.author_id = $${params.length}`; }
    if (series_id) { params.push(series_id); query += ` AND b.series_id = $${params.length}`; }
    query += ' ORDER BY b.title ASC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT b.*,
        a.name as author_name,
        s.name as series_name,
        u.name as universe_name
      FROM books b
      LEFT JOIN authors a ON b.author_id = a.id
      LEFT JOIN series s ON b.series_id = s.id
      LEFT JOIN universes u ON b.universe_id = u.id
      WHERE b.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Book not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const {
    title, author_id, series_id, universe_id, status, rating_overall,
    would_reread, start_date, end_date, format_read, tags, library,
    isbn, cover_url, pages, current_page, reading_notes,
    post_read_synthesis, strengths_weaknesses
  } = req.body;
  try {
    const result = await db.query(`
      INSERT INTO books (
        title, author_id, series_id, universe_id, status, rating_overall,
        would_reread, start_date, end_date, format_read, tags, library,
        isbn, cover_url, pages, current_page, reading_notes,
        post_read_synthesis, strengths_weaknesses
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
      RETURNING *
    `, [
      title, author_id, series_id, universe_id, status, rating_overall,
      would_reread, start_date, end_date, format_read, tags, library,
      isbn, cover_url, pages, current_page, reading_notes,
      post_read_synthesis, strengths_weaknesses
    ]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const {
    title, author_id, series_id, universe_id, status, rating_overall,
    would_reread, start_date, end_date, format_read, tags, library,
    isbn, cover_url, pages, current_page, reading_notes,
    post_read_synthesis, strengths_weaknesses
  } = req.body;
  try {
    const result = await db.query(`
      UPDATE books SET
        title=$1, author_id=$2, series_id=$3, universe_id=$4, status=$5,
        rating_overall=$6, would_reread=$7, start_date=$8, end_date=$9,
        format_read=$10, tags=$11, library=$12, isbn=$13, cover_url=$14,
        pages=$15, current_page=$16, reading_notes=$17,
        post_read_synthesis=$18, strengths_weaknesses=$19
      WHERE id=$20 RETURNING *
    `, [
      title, author_id, series_id, universe_id, status, rating_overall,
      would_reread, start_date, end_date, format_read, tags, library,
      isbn, cover_url, pages, current_page, reading_notes,
      post_read_synthesis, strengths_weaknesses, req.params.id
    ]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Book not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM books WHERE id = $1', [req.params.id]);
    res.json({ message: 'Book deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;