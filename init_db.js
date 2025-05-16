require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function initializeDatabase() {
    try {
        await client.connect();
        await client.query('BEGIN');  // Starta transaktion

        await client.query(`
            CREATE TABLE IF NOT EXISTS Users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL
            );
            CREATE TABLE IF NOT EXISTS Channel (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                owner_id INT REFERENCES Users(id) ON DELETE CASCADE
            );
            CREATE TABLE IF NOT EXISTS Subscription (
                id SERIAL PRIMARY KEY,
                user_id INT REFERENCES Users(id) ON DELETE CASCADE,
                channel_id INT REFERENCES Channel(id) ON DELETE CASCADE
            );
            CREATE TABLE IF NOT EXISTS Message (
                id SERIAL PRIMARY KEY,
                content TEXT NOT NULL,
                user_id INT REFERENCES Users(id) ON DELETE CASCADE,
                channel_id INT REFERENCES Channel(id) ON DELETE CASCADE
            );
        `);

        await client.query('COMMIT');  // Bekräfta ändringar
        console.log("Database tables created successfully!");

    } catch (err) {
        await client.query('ROLLBACK');  // Ångra transaktionen vid fel
        console.error("Error initializing database:", err.message);
    } finally {
        await client.end();  // Stäng anslutningen
    }
}

initializeDatabase();