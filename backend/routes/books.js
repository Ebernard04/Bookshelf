const express = require('express');
const router = express.Router();
const db = require('../db');

let enrichmentStatus = { running: false, total: 0, completed: 0, failed: 0, done: false };

router.get('/enrich-status', (req, res) => {
  res.json(enrichmentStatus);
});

router.post('/enrich-all', async (req, res) => {
  if (enrichmentStatus.running) {
    return res.json({ message: 'Enrichment already running', ...enrichmentStatus });
  }

  try {
    const API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
    const result = await db.query(`
      SELECT b.id, b.title, a.name as author_name
      FROM books b
      LEFT JOIN authors a ON b.author_id = a.id
      WHERE b.cover_url IS NULL OR b.pages IS NULL
      ORDER BY b.title ASC
    `);

    const bookList = result.rows;
    enrichmentStatus = { running: true, total: bookList.length, completed: 0, failed: 0, done: false };

    res.json({ message: `Starting enrichment for ${bookList.length} books`, total: bookList.length });

    (async () => {
      for (const book of bookList) {
        try {
          const q = book.author_name
            ? `intitle:${book.title}+inauthor:${book.author_name}`
            : `intitle:${book.title}`;
          const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&key=${API_KEY}&maxResults=1`;
          const response = await fetch(url);
          const data = await response.json();

          if (data.items && data.items.length > 0) {
            const info = data.items[0].volumeInfo;
            const cover_url = info.imageLinks?.thumbnail?.replace('http://', 'https://') || null;
            const pages = info.pageCount || null;
            const isbn = info.industryIdentifiers?.find(i => i.type === 'ISBN_13')?.identifier || null;

            await db.query(
              `UPDATE books SET
                cover_url = COALESCE(cover_url, $1),
                pages = COALESCE(pages, $2),
                isbn = COALESCE(isbn, $3)
              WHERE id = $4`,
              [cover_url, pages, isbn, book.id]
            );
            enrichmentStatus.completed++;
          } else {
            enrichmentStatus.failed++;
          }
        } catch (err) {
          console.error(`Failed to enrich ${book.title}:`, err.message);
          enrichmentStatus.failed++;
        }
        await new Promise(r => setTimeout(r, 1000));
      }
      enrichmentStatus.running = false;
      enrichmentStatus.done = true;
      console.log('✅ Enrichment complete');
    })();

  } catch (err) {
    enrichmentStatus.running = false;
    res.status(500).json({ error: err.message });
  }
});

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

router.post('/enrich-all', async (req, res) => {
  try {
    const API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
    
    const result = await db.query(`
      SELECT b.id, b.title, a.name as author_name
      FROM books b
      LEFT JOIN authors a ON b.author_id = a.id
      WHERE b.cover_url IS NULL OR b.pages IS NULL
      ORDER BY b.title ASC
    `);

    const books = result.rows;
    res.json({ message: `Starting enrichment for ${books.length} books`, total: books.length });

    // Run enrichment in background
    (async () => {
      for (const book of books) {
        try {
          const q = book.author_name
            ? `intitle:${book.title}+inauthor:${book.author_name}`
            : `intitle:${book.title}`;
          const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&key=${API_KEY}&maxResults=1`;
          const response = await fetch(url);
          const data = await response.json();

          if (data.items && data.items.length > 0) {
            const info = data.items[0].volumeInfo;
            const cover_url = info.imageLinks?.thumbnail?.replace('http://', 'https://') || null;
            const pages = info.pageCount || null;
            const isbn = info.industryIdentifiers?.find(i => i.type === 'ISBN_13')?.identifier || null;

            await db.query(
              `UPDATE books SET
                cover_url = COALESCE(cover_url, $1),
                pages = COALESCE(pages, $2),
                isbn = COALESCE(isbn, $3)
              WHERE id = $4`,
              [cover_url, pages, isbn, book.id]
            );
          }
        } catch (err) {
          console.error(`Failed to enrich ${book.title}:`, err.message);
        }
        await new Promise(r => setTimeout(r, 1000));
      }
      console.log('✅ Background enrichment complete');
    })();

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;