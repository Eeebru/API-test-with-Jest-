const { Client } = require("pg");
require("dotenv").config();

const client = new Client({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.NODE_ENV === 'test' ? process.env.DATABASE2 : process.env.DATABASE1,
  password: process.env.PASSWORD,
  port: process.env.PORT,
});

client.connect();

module.exports = client;
