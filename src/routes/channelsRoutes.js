const express = require('express');
const router = express.Router();
const client = require('../config/db');

// ---------------------------------------------
// POST /api/channels
// Skapa en ny kanal
// Body (JSON):
// {
//   "name": "Kanalnamn",
//   "owner_id": 1
// }
// OBS! Skapar automatiskt en prenumeration för ägaren
// ---------------------------------------------

// Skapa ny kanal
router.post('/', async (req, res) => {
  const { name, owner_id } = req.body;
  
  if (!name || !owner_id) {
    return res.status(400).json({ error: 'Name and owner ID required' });
  }
  
  try {
    await client.query('BEGIN');
    const result = await client.query(
      'INSERT INTO Channel (name, owner_id) VALUES ($1, $2) RETURNING *',
      [name, owner_id]
    );
    await client.query(
      'INSERT INTO Subscription (user_id, channel_id) VALUES ($1, $2)',
      [owner_id, result.rows[0].id]
    );
    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------------
// GET /api/channels
// Hämta alla kanaler
// Ingen body behövs
// ---------------------------------------------

// Hämta alla kanaler
router.get('/', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM Channel');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------------
// GET /api/channels/:id
// Hämta en specifik kanal
// Ingen body behövs
// ---------------------------------------------

// Hämta specifik kanal
router.get('/:id', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM Channel WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------------
// GET /api/channels/:id/messages?user_id=
// Hämta alla meddelanden från en kanal
// Query parameter:
// user_id (valfritt) - för att kontrollera prenumeration
// OBS! Om user_id anges kontrolleras att användaren prenumererar på kanalen
// ---------------------------------------------

// Hämta meddelanden från en kanal
router.get('/:id/messages', async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.query;
  
  try {
    // Kontrollera prenumeration om user_id är angiven
    if (user_id) {
      const subCheck = await client.query(
        'SELECT 1 FROM Subscription WHERE user_id = $1 AND channel_id = $2',
        [user_id, id]
      );
      if (subCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Not subscribed' });
      }
    }
    
    const messages = await client.query(
      'SELECT * FROM Message WHERE channel_id = $1 ORDER BY id DESC',
      [id]
    );
    res.json(messages.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------------
// PATCH /api/channels/:id
// Uppdatera en kanals namn
// Body (JSON):
// {
//   "name": "Nytt kanalnamn",
//   "user_id": 1
// }
// OBS! Endast kanalens ägare kan uppdatera namnet
// ---------------------------------------------

// Uppdatera kanalnamn
router.patch('/:id', async (req, res) => {
  const { name, user_id } = req.body;
  
  try {
    const result = await client.query(
      'UPDATE Channel SET name = $1 WHERE id = $2 AND owner_id = $3 RETURNING *',
      [name, req.params.id, user_id]
    );
    if (result.rows.length === 0) return res.status(403).json({ error: 'Not authorized' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------------
// DELETE /api/channels/:id
// Ta bort en kanal
// Body (JSON):
// {
//   "user_id": 1
// }
// OBS! Endast kanalens ägare kan ta bort kanalen
// ---------------------------------------------

// Ta bort kanal
router.delete('/:id', async (req, res) => {
  const { user_id } = req.body;
  
  try {
    const result = await client.query(
      'DELETE FROM Channel WHERE id = $1 AND owner_id = $2 RETURNING *',
      [req.params.id, user_id]
    );
    if (result.rows.length === 0) return res.status(403).json({ error: 'Not authorized' });
    res.status(200).json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
