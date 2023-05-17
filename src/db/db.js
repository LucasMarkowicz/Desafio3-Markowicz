const { /*MongoClient,*/ ObjectId } = require('mongodb');
const mongoose = require("mongoose");
const dotenv = require('dotenv');
dotenv.config();
const mongoErrors = require('../errors/mongoErrors.js');



mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
  console.log('Conexión exitosa a MongoDB.');
});

mongoose.connection.on('error', (error) => {
  console.error(mongoErrors.CONNECTION_FAILED, error);
});


/*let client;


async function connect() {
  const uri = process.env.DB_URI;
  client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    console.log('Conectado a la db');
  } catch (err) {
    console.error(err);
  }
}

function getConnection() {
  return client.db('store');
}*/

module.exports = { /*connect, getConnection,*/ ObjectId };
