const express = require('express');
const router = express.Router();
const client = require('../config/db');

// ---------------------------------------------
// POST /api/subscriptions
// Skapa en ny prenumeration
// Body (JSON):
// {
//   "user_id": 1,
//   "channel_id": 2
// }
// ---------------------------------------------
router.post('/', async (req, res) => {
    const { user_id, channel_id } = req.body;
    if (!user_id || !channel_id) {
        return res.status(400).json({ error: "user_id and channel_id is required" });
    }
    try {
        const result = await client.query(
            'INSERT INTO Subscription (user_id, channel_id) VALUES ($1, $2) RETURNING *',
            [user_id, channel_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------------------------------------------
// DELETE /api/subscriptions/:user_id/:channel_id
// Avsluta (ta bort) en prenumeration
// Ingen body behövs
// ---------------------------------------------
router.delete('/:user_id/:channel_id', async (req, res) => {
    const { user_id, channel_id } = req.params;
    try {
        const result = await client.query(
            'DELETE FROM Subscription WHERE user_id = $1 AND channel_id = $2 RETURNING *',
            [user_id, channel_id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Subscription not found.' });
        }
        res.json({ message: 'Subscription ended', subscription: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------------------------------------------
// GET /api/subscriptions
// Hämta alla aktiva prenumerationer
// Ingen body behövs
// ---------------------------------------------
router.get('/', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM Subscription');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------------------------------------------
// GET /api/subscriptions/:user_id
// Hämta alla prenumerationer för en viss användare
// Ingen body behövs
// ---------------------------------------------
router.get('/:user_id', async (req, res) => {
    const { user_id } = req.params;
    try {
        const result = await client.query(
            'SELECT * FROM Subscription WHERE user_id = $1',
            [user_id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
