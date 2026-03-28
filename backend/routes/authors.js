const express = require('express');
const router = express.Router();
const db = require('../db');

//get all authors
router.get('/', async (req, res) => {
    try {
        const authors = await db.query('SELECT * FROM authors ORDER BY name ASC');
        res.json(authors.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// get single author
router.get('/:id', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM authors WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Author not found' });
            res.json(result.rows[0]);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//Post create author
router.post('/', async (req, res) => {
    const { name, nationality, notes, trusted_author } = req.body;
    try {
        const result = await db.query(
            'insert into authors (name, nationality, notes, trusted_author) values ($1, $2, $3, $4) returning *',
            [name, nationality, notes, trusted_author]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// pu update author
router.put('/:id', async (req, res) => {
    const { name, nationality, notes, trusted_author } = req.body;
    try {
        const result = await db.query(
            'update authors set name = $1, nationality = $2, notes = $3, trusted_author = $4 where id = $5 returning *',    
            [name, nationality, notes, trusted_author, req.params.id]
            );
            if (result.rows.length === 0) return res.status(404).json({ error: 'Author not found' });
            res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message }); 
    }     
});


// delete author
router.delete('/:id', async (req, res) => {
    try {
        await db.query('delete from authors where id = $1', [req.params.id]);
        res.json({ message: 'Author deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;