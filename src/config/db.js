const { Client } = require('pg');

const client = new Client({
  host: '3.239.52.75',
  port: 5432,
  user: 'postgres',
  database: 'coffee_shop_db',
  password: 'mysecretpassword',
});

client.connect();

module.exports = client;
