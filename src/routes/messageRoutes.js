const express = require('express');
const router = express.Router();
const client = require('../config/db'); // Din befintliga client

// CREATE
router.post('/', async (req, res) => {
    const { content, user_id, channel_id } = req.body;
    try {
        // Kontrollera om användaren är prenumerant på kanalen
        const subResult = await client.query(
            'SELECT * FROM Subscription WHERE user_id = $1 AND channel_id = $2',
            [user_id, channel_id]
        );
        if (subResult.rows.length === 0) {
            return res.status(403).json({ error: 'User is not subscribed to this channel.' });
        }

        const result = await client.query(
            'INSERT INTO Message (content, user_id, channel_id) VALUES ($1, $2, $3) RETURNING *',
            [content, user_id, channel_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// READ ALL
router.get('/', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM Message');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// READ ONE
router.get('/:id', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM Message WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE
router.put('/:id', async (req, res) => {
    const { content } = req.body;
    try {
        const result = await client.query(
            'UPDATE Message SET content = $1 WHERE id = $2 RETURNING *',
            [content, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        const result = await client.query('DELETE FROM Message WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted', deleted: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;