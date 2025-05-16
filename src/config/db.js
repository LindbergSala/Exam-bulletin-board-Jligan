const { Client } = require('pg');

const client = new Client({
  user: 'dittAnvändarnamn',
  host: 'localhost',
  database: 'dittDatabasNamn',
  password: 'dittLösenord',
  port: 5432
});

client.connect();

module.exports = client;