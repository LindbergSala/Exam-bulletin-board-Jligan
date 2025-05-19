const express = require('express');
const router = express.Router();
const client = require('../config/db');

// ---------------------------------------------
// POST /api/users
// Skapa en ny användare
// Body (JSON):
// {
//   "name": "Ditt namn"
// }
// ---------------------------------------------
router.post('/', async (req, res) => {
    const { name } = req.body;
    try {
        const result = await client.query(
            'INSERT INTO Users (name) VALUES ($1) RETURNING *',
            [name]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------------------------------------------
// GET /api/users
// Hämta alla användare
// Ingen body behövs
// ---------------------------------------------
router.get('/', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM Users');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------------------------------------------
// GET /api/users/:id
// Hämta en specifik användare
// Ingen body behövs
// ---------------------------------------------
router.get('/:id', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM Users WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------------------------------------------
// PUT /api/users/:id
// Uppdatera en användare
// Body (JSON):
// {
//   "name": "Nytt namn"
// }
// ---------------------------------------------
router.put('/:id', async (req, res) => {
    const { name } = req.body;
    try {
        const result = await client.query(
            'UPDATE Users SET name = $1 WHERE id = $2 RETURNING *',
            [name, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------------------------------------------
// DELETE /api/users/:id
// Ta bort en användare
// Ingen body behövs
// ---------------------------------------------
router.delete('/:id', async (req, res) => {
    try {
        const result = await client.query('DELETE FROM Users WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted', deleted: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;