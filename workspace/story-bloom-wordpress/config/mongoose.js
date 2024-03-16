const mongoose = require('mongoose');
const winston = require('winston');

require('dotenv').config();

let connectionString = process.env.STORY_BLOOM_WORDPRESS_MONGODB_CONNECTIONSTRING;
let dbName = process.env.STORY_BLOOM_WORDPRESS_MONGODB_DBNAME;

if (!connectionString || !dbName) {
  console.log('MongoDB connection string is:', connectionString); // gpt_pilot_debugging_log
  console.log('DB Name is:', dbName); // gpt_pilot_debugging_log
  throw new Error('Missing MongoDB connection string or Database name! Check your .env file');
}

console.log('MongoDB connection string is:', connectionString); // gpt_pilot_debugging_log
console.log('DB Name is:', dbName); // gpt_pilot_debugging_log

winston.loggers.add('mongodb-connection', {
    format: winston.format.simple(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'info-logs/mongodb-connection.log' })
    ]
});

mongoose.connection.on('connecting', ()=> {
  console.log('Connecting to MongoDB...');
  winston.loggers.get('mongodb-connection').info('Connecting to MongoDB...');
});
  
mongoose.connection.on('connected', ()=> {
  console.log('MongoDB connection established successfully.')
  winston.loggers.get('mongodb-connection').info('MongoDB connection established successfully.')
});

mongoose.connection.on('error', (error) => {
  winston.error(`Failed to establish connection with MongoDB: ${error.message}\n ${error.stack}`);
  winston.loggers.add('connection-errors', {
    format: winston.format.simple(),
    transports: [
      new winston.transports.File({ filename: 'error-logs/connection-errors.log' })
    ]
  });
  winston.loggers.get('connection-errors').error(error);
});
  
mongoose.connection.on('disconnected', ()=> {
  console.log('MongoDB connection closed.')
  winston.loggers.get('mongodb-connection').info('MongoDB connection closed.')
});

module.exports = mongoose;