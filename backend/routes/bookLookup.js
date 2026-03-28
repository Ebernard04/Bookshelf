const express = require('express');
const router = express.Router();

const API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Query required' });

  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&key=${API_KEY}&maxResults=5`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.items) return res.json([]);

    const results = data.items.map(item => {
      const info = item.volumeInfo;
      return {
        google_id: item.id,
        title: info.title,
        authors: info.authors || [],
        series: info.series || null,
        publisher: info.publisher || null,
        published_date: info.publishedDate || null,
        description: info.description || null,
        page_count: info.pageCount || null,
        categories: info.categories || [],
        cover_url: info.imageLinks?.thumbnail?.replace('http://', 'https://') || null,
        isbn: info.industryIdentifiers?.find(i => i.type === 'ISBN_13')?.identifier || null,
      };
    });

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/lookup', async (req, res) => {
  const { title, author } = req.query;
  if (!title) return res.status(400).json({ error: 'Title required' });

  try {
    const q = author ? `intitle:${title}+inauthor:${author}` : `intitle:${title}`;
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&key=${API_KEY}&maxResults=1`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.items || data.items.length === 0) return res.json(null);

    const item = data.items[0];
    const info = item.volumeInfo;

    res.json({
      google_id: item.id,
      title: info.title,
      authors: info.authors || [],
      publisher: info.publisher || null,
      published_date: info.publishedDate || null,
      description: info.description || null,
      page_count: info.pageCount || null,
      categories: info.categories || [],
      cover_url: info.imageLinks?.thumbnail?.replace('http://', 'https://') || null,
      isbn: info.industryIdentifiers?.find(i => i.type === 'ISBN_13')?.identifier || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;