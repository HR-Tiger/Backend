const { Client } = require('pg');

const DB_HOST = process.env.DB_HOST || '3.239.52.75';
const DB_PORT = process.env.DB_PORT || 5432;
const DB_USER = process.env.DB_USER || 'postgres';
const DB_NAME = process.env.DB_NAME || 'coffee_shop_db';
const DB_PASS = process.env.DB_PASS || 'mysecretpassword';

const client = new Client({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  database: DB_NAME,
  password: DB_PASS,
});

client.connect();

module.exports = client;
