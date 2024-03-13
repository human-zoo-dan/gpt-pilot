const mongodb = require('mongodb');

let connection;

async function connectToDatabase() {
  if (connection) return { db: connection, client: null };

  const client = new mongodb.MongoClient(process.env.SB_MONGO_CONNECTION_STRING);

  try {
    await client.connect();
    connection = client.db(process.env.SB_DB_NAME);
    console.log('Connected to MongoDB database: ' + process.env.SB_DB_NAME + ' successfully.');
    return { db: connection, client: client };

  } catch (err) {
    console.error('Failed to connect to MongoDB database: ', err); // gpt_pilot_debugging_log
    console.error(err.stack);
    process.exit(1);
  }
}

module.exports = connectToDatabase;