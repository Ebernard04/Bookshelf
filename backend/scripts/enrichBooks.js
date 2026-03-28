const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

async function lookupBook(title, authorName) {
  try {
    const q = authorName ? `intitle:${title}+inauthor:${authorName}` : `intitle:${title}`;
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&key=${API_KEY}&maxResults=1`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.items || data.items.length === 0) return null;

    const info = data.items[0].volumeInfo;
    return {
      cover_url: info.imageLinks?.thumbnail?.replace('http://', 'https://') || null,
      pages: info.pageCount || null,
      isbn: info.industryIdentifiers?.find(i => i.type === 'ISBN_13')?.identifier || null,
    };
  } catch (err) {
    return null;
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🔍 Enriching books with Google Books data...\n');

  const result = await pool.query(`
    SELECT b.id, b.title, a.name as author_name
    FROM books b
    LEFT JOIN authors a ON b.author_id = a.id
    WHERE b.cover_url IS NULL OR b.pages IS NULL
    ORDER BY b.title ASC
  `);

  console.log(`Found ${result.rows.length} books to enrich\n`);

  let success = 0;
  let failed = 0;

  for (const book of result.rows) {
    const data = await lookupBook(book.title, book.author_name);

    if (!data) {
      console.log(`  ✗ ${book.title} — not found`);
      failed++;
    } else {
      await pool.query(
        `UPDATE books SET
          cover_url = COALESCE(cover_url, $1),
          pages = COALESCE(pages, $2),
          isbn = COALESCE(isbn, $3)
        WHERE id = $4`,
        [data.cover_url, data.pages, data.isbn, book.id]
      );
      console.log(`  ✓ ${book.title} — cover: ${data.cover_url ? 'yes' : 'no'}, pages: ${data.pages || 'N/A'}`);
      success++;
    }

    // Rate limit — Google Books allows ~100 requests per 100 seconds
    await sleep(1000);
  }

  console.log(`\n✅ Done — ${success} enriched, ${failed} not found`);
  await pool.end();
}

main();