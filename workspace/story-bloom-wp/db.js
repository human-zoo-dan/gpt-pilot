const MongoClient = require('mongodb').MongoClient;
const winston = require('winston');
const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.Console()
  ]
});

const url = process.env.STORY_BLOOM_WP_MONGODB_CONNECTION_STRING;
const dbName = process.env.STORY_BLOOM_WP_MONGODB_DB_NAME;

let db;

const connectDB = async () => {
  if (db) return { db: db, client: null };
  const client = new MongoClient(url, { useUnifiedTopology: true });
  try {
    await client.connect();
    db = client.db(dbName);
    logger.info('Connected to MongoDB database: ' + dbName + ' successfully.');
    return { db: db, client: client };
  } catch (err) {
    logger.error('Failed to connect to MongoDB database: ', err);
    logger.error(err.stack);
    process.exit(1);
  }
};

const getDB = () => db;

module.exports = { connectDB, getDB };