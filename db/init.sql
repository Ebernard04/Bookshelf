CREATE TABLE authors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    nationality VARCHAR(100),
    notes TEXT,
    trusted_author BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE universes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    creator_id INTEGER REFERENCES authors(id),
    themes TEXT,
    status VARCHAR(20) DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE series (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    universe_id INTEGER REFERENCES universes(id),
    series_type VARCHAR(50) DEFAULT 'main',
    status VARCHAR(20) DEFAULT 'ongoing',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author_id INTEGER REFERENCES authors(id),
    series_id INTEGER REFERENCES series(id),
    universe_id INTEGER REFERENCES universes(id),
    status VARCHAR(20) CHECK (status IN ('To Read', 'Reading', 'Finished', 'Abandoned')) DEFAULT 'To Read',
    rating_overall INTEGER CHECK (rating_overall BETWEEN 1 AND 5),
    would_reread BOOLEAN,
    start_date DATE,
    end_date DATE,
    format_read VARCHAR(50),
    tags TEXT[],
    library TEXT[],
    isbn VARCHAR(20),
    cover_url TEXT,
    pages INTEGER,
    current_page INTEGER DEFAULT 0,
    reading_notes TEXT,
    post_read_synthesis TEXT,
    strengths_weaknesses TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reading_log (
    id SERIAL PRIMARY KEY,
    log_date DATE NOT NULL,
    event_type VARCHAR(20) CHECK (event_type IN ('started', 'finished', 'note')),
    book_id INTEGER REFERENCES books(id),
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER books_updated_at
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();