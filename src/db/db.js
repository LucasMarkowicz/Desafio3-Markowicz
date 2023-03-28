const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

let client;

async function connect() {
  const uri = process.env.DB_URI;
  client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    console.log('Connected to the database!');
  } catch (err) {
    console.error(err);
  }
}

function getConnection() {
  return client.db('webstore');
}

module.exports = { connect, getConnection };
