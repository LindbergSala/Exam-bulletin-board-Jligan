const express = require('express');
const router = express.Router();
const { Client } = require('pg');

function getClient() {
  return new Client({ connectionString: process.env.DATABASE_URL });
}

// Skapa en prenumeration.
// Postman: 
//      POST http://localhost:3000/subscriptions 
//      Body: (JSON)  "user_id": 1, "channel_id": 2

router.post('/', async (req, res) => {
  const { user_id, channel_id } = req.body;
  if (!user_id || !channel_id) {
    return res.status(400).json({ error: "user_id och channel_id krävs" });
  }

  const client = getClient();
  try {
    await client.connect();
    const result = await client.query(
      'INSERT INTO Subscription (user_id, channel_id) VALUES ($1, $2) RETURNING *',
      [user_id, channel_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await client.end();
  }
});

// Avsluta en prenumeration.
// DELETE http://localhost:3000/subscriptions/1/2
router.delete('/:user_id/:channel_id', async (req, res) => {
  const { user_id, channel_id } = req.params;
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    const result = await client.query(
      'DELETE FROM Subscription WHERE user_id = $1 AND channel_id = $2 RETURNING *',
      [user_id, channel_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Prenumeration hittades inte' });
    }

    res.json({ message: 'Prenumeration avslutad', subscription: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await client.end();
  }
});

// Hämta alla prenumerationer för en User.
// GET http://localhost:3000/subscriptions/1
router.get('/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const client = getClient();
  try {
    await client.connect();
    const result = await client.query(
      'SELECT * FROM Subscription WHERE user_id = $1',
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await client.end();
  }
});

module.exports = router;
