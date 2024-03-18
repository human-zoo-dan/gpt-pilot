const mongoose = require('mongoose');
const winston = require('winston');
const moment = require('moment');

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
    format: winston.format.printf(({level, message}) => {
        return `${moment().utc().format('YYYY-MM-DD HH:mm:ss')} - ${level}: ${message}`;
    }),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'info-logs/mongodb-connection.log' })
    ]
});

mongoose.connection.on('connecting', ()=> {
  const logMessage = 'Connecting to MongoDB...';
  console.log(logMessage);
  winston.loggers.get('mongodb-connection').info(logMessage);
});
  
mongoose.connection.on('connected', ()=> {
  const logMessage = 'MongoDB connection established successfully.';
  console.log(logMessage);
  winston.loggers.get('mongodb-connection').info(logMessage);
});

mongoose.connection.on('error', (error) => {
  const errorMessage = `Failed to establish connection with MongoDB: ${error.message}\n ${error.stack}`;
  winston.error(errorMessage);

  winston.loggers.add('connection-errors', {
    format: winston.format.printf(({level, message}) => {
        return `${moment().utc().format('YYYY-MM-DD HH:mm:ss')} - ${level}: ${message}`;
    }),
    transports: [
      new winston.transports.File({ filename: 'error-logs/connection-errors.log' })
    ]
  });
  winston.loggers.get('connection-errors').error(errorMessage);
});
  
mongoose.connection.on('disconnected', ()=> {
  const logMessage = 'MongoDB connection closed.';
  console.log(logMessage);
  winston.loggers.get('mongodb-connection').info(logMessage);
});

module.exports = mongoose;