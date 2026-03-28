const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const VAULT_PATH = process.argv[2];

if (!VAULT_PATH) {
  console.error('Usage: node importObsidian.js /path/to/vault');
  process.exit(1);
}

function stripWikilink(str) {
  if (!str) return null;
  return str.replace(/\[\[([^\]]+)\]\]/g, '$1').replace(/"/g, '').trim();
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { frontmatter: {}, body: content };
  
  const frontmatter = {};
  const lines = match[1].split('\n');
  
  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    if (value) frontmatter[key] = value;
  }
  
  const body = content.slice(match[0].length).trim();
  return { frontmatter, body };
}

function extractSection(body, heading) {
  const regex = new RegExp(`##+ ${heading}[\\s\\S]*?(?=##+ |$)`, 'i');
  const match = body.match(regex);
  if (!match) return null;
  return match[0].replace(/##+ [^\n]+\n/, '').trim() || null;
}

async function importAuthors() {
  console.log('\n📚 Importing authors...');
  const authorsDir = path.join(VAULT_PATH, 'Authors');
  if (!fs.existsSync(authorsDir)) return {};

  const files = fs.readdirSync(authorsDir).filter(f => f.endsWith('.md'));
  const authorMap = {};

  for (const file of files) {
    const content = fs.readFileSync(path.join(authorsDir, file), 'utf8');
    const { frontmatter } = parseFrontmatter(content);
    const name = frontmatter.name || file.replace('.md', '');

    try {
      const res = await pool.query(
        `INSERT INTO authors (name, nationality, notes, trusted_author)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (name) DO UPDATE SET nationality=EXCLUDED.nationality
         RETURNING id`,
        [
          name,
          frontmatter.nationality || null,
          frontmatter.notes || null,
          frontmatter.trusted_author === 'true' || false
        ]
      );
      authorMap[name] = res.rows[0].id;
      console.log(`  ✓ ${name}`);
    } catch (err) {
      console.error(`  ✗ ${name}: ${err.message}`);
    }
  }

  return authorMap;
}

async function importUniverses(authorMap) {
  console.log('\n🌌 Importing universes...');
  const universesDir = path.join(VAULT_PATH, 'Universes');
  if (!fs.existsSync(universesDir)) return {};

  const files = fs.readdirSync(universesDir).filter(f => f.endsWith('.md'));
  const universeMap = {};

  for (const file of files) {
    const content = fs.readFileSync(path.join(universesDir, file), 'utf8');
    const { frontmatter } = parseFrontmatter(content);
    const name = frontmatter.name || file.replace('.md', '');
    const creatorName = stripWikilink(frontmatter.creator);
    const creatorId = creatorName ? authorMap[creatorName] : null;

    try {
      const res = await pool.query(
        `INSERT INTO universes (name, creator_id, themes, status, notes)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (name) DO UPDATE SET creator_id=EXCLUDED.creator_id
         RETURNING id`,
        [
          name,
          creatorId,
          frontmatter.themes || null,
          frontmatter.status || 'active',
          frontmatter.notes || null
        ]
      );
      universeMap[name] = res.rows[0].id;
      console.log(`  ✓ ${name}`);
    } catch (err) {
      console.error(`  ✗ ${name}: ${err.message}`);
    }
  }

  return universeMap;
}

async function importSeries(universeMap) {
  console.log('\n📖 Importing series...');
  const seriesDir = path.join(VAULT_PATH, 'Series');
  if (!fs.existsSync(seriesDir)) return {};

  const files = fs.readdirSync(seriesDir).filter(f => f.endsWith('.md'));
  const seriesMap = {};

  for (const file of files) {
    const content = fs.readFileSync(path.join(seriesDir, file), 'utf8');
    const { frontmatter } = parseFrontmatter(content);
    const name = frontmatter.name || file.replace('.md', '');
    const universeName = stripWikilink(frontmatter.universe);
    const universeId = universeName ? universeMap[universeName] : null;

    try {
      const res = await pool.query(
        `INSERT INTO series (name, universe_id, series_type, status, notes)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (name) DO UPDATE SET universe_id=EXCLUDED.universe_id
         RETURNING id`,
        [
          name,
          universeId,
          frontmatter.series_type || 'main',
          frontmatter.status || 'ongoing',
          frontmatter.notes || null
        ]
      );
      seriesMap[name] = res.rows[0].id;
      console.log(`  ✓ ${name}`);
    } catch (err) {
      console.error(`  ✗ ${name}: ${err.message}`);
    }
  }

  return seriesMap;
}

async function importBooks(authorMap, seriesMap, universeMap) {
  console.log('\n📗 Importing books...');
  const booksDir = path.join(VAULT_PATH, 'Books');
  if (!fs.existsSync(booksDir)) return;

  function getAllMdFiles(dir) {
    let results = [];
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const full = path.join(dir, item);
      if (fs.statSync(full).isDirectory()) {
        results = results.concat(getAllMdFiles(full));
      } else if (item.endsWith('.md')) {
        results.push(full);
      }
    }
    return results;
  }

  const files = getAllMdFiles(booksDir);

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const { frontmatter, body } = parseFrontmatter(content);

    if (frontmatter.type !== 'book') continue;

    const title = frontmatter.title || path.basename(file, '.md');
    const authorName = stripWikilink(frontmatter.author);
    const seriesName = stripWikilink(frontmatter.series);
    const universeName = stripWikilink(frontmatter.universe);

    const authorId = authorName ? authorMap[authorName] : null;
    const seriesId = seriesName ? seriesMap[seriesName] : null;
    const universeId = universeName ? universeMap[universeName] : null;

    const readingNotes = extractSection(body, 'Reading Notes');
    const postReadSynthesis = extractSection(body, 'Post-Read Synthesis');
    const strengthsWeaknesses = extractSection(body, 'Strengths / Weaknesses');

    const rating = frontmatter.rating_overall
      ? parseInt(frontmatter.rating_overall.replace(/"/g, ''))
      : null;

    const wouldReread = frontmatter.would_reread
      ? frontmatter.would_reread.replace(/"/g, '').toLowerCase() === 'true'
      : null;

    try {
      await pool.query(
        `INSERT INTO books (
          title, author_id, series_id, universe_id, status,
          rating_overall, would_reread, start_date, end_date,
          format_read, reading_notes, post_read_synthesis, strengths_weaknesses
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
        ON CONFLICT DO NOTHING`,
        [
          title,
          authorId,
          seriesId,
          universeId,
          frontmatter.status || 'To Read',
          rating,
          wouldReread,
          frontmatter.start_date || null,
          frontmatter.end_date || null,
          frontmatter.format_read || null,
          readingNotes,
          postReadSynthesis,
          strengthsWeaknesses
        ]
      );
      console.log(`  ✓ ${title}`);
    } catch (err) {
      console.error(`  ✗ ${title}: ${err.message}`);
    }
  }
}

async function importReadingLog() {
  console.log('\n📅 Importing reading log...');
  const logDir = path.join(VAULT_PATH, 'Reading_Log/Years');
  if (!fs.existsSync(logDir)) return;

  function getAllMdFiles(dir) {
    let results = [];
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const full = path.join(dir, item);
      if (fs.statSync(full).isDirectory()) {
        results = results.concat(getAllMdFiles(full));
      } else if (item.endsWith('.md')) {
        results.push(full);
      }
    }
    return results;
  }

  const files = getAllMdFiles(logDir);

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Matches both — and - separators, with or without colon
      const match = line.match(/\*\*(\d{4}-\d{2}-\d{2})\*\*\s*[—-]\s*(Started|Finished):?\s*\[\[([^\]]+)\]\]/i);
      if (!match) continue;

      const [, date, eventRaw, bookTitle] = match;
      const event_type = eventRaw.toLowerCase();

      // grab note from indented next line if present
      let note = null;
      if (i + 1 < lines.length && lines[i + 1].match(/^\s+[-*]/)) {
        note = lines[i + 1].replace(/^\s+[-*]\s*/, '').trim() || null;
      }

      try {
        const bookRes = await pool.query(
          'SELECT id FROM books WHERE title ILIKE $1 LIMIT 1',
          [bookTitle]
        );
        const bookId = bookRes.rows[0]?.id || null;

        await pool.query(
          `INSERT INTO reading_log (log_date, event_type, book_id, note)
           VALUES ($1, $2, $3, $4)`,
          [date, event_type, bookId, note]
        );
        console.log(`  ✓ ${date} ${event_type} ${bookTitle}`);
      } catch (err) {
        console.error(`  ✗ ${date} ${bookTitle}: ${err.message}`);
      }
    }
  }
}

async function main() {
  console.log('🚀 Starting Obsidian vault import...');
  console.log(`Vault path: ${VAULT_PATH}`);

  try {
    const authorMap = await importAuthors();
    const universeMap = await importUniverses(authorMap);
    const seriesMap = await importSeries(universeMap);
    await importBooks(authorMap, seriesMap, universeMap);
    await importReadingLog();
    console.log('\n✅ Import complete!');
  } catch (err) {
    console.error('Import failed:', err);
  } finally {
    await pool.end();
  }
}

main();