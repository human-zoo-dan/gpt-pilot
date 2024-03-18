const winston = require('winston');
const moment = require('moment');

const logFormat = winston.format.printf(({ level, message }) => {
  return `${moment().utc().format('YYYY-MM-DD HH:mm:ss')} - ${level}: ${message}`;
});

winston.loggers.add('newCategories', {
  format: logFormat,
  transports: [
    new winston.transports.File({ filename: 'action-logs/new-categories.log' }),
  ],
});

winston.loggers.add('updatedCategories', {
  format: logFormat,
  transports: [
    new winston.transports.File({ filename: 'action-logs/updated-categories.log' }),
  ],
});

winston.loggers.add('deletedCategories', {
  format: logFormat,
  transports: [
    new winston.transports.File({ filename: 'action-logs/deleted-categories.log' }),
  ],
});

winston.loggers.add('newStories', {
  format: logFormat,
  transports: [
    new winston.transports.File({ filename: 'action-logs/new-stories.log' }),
  ],
});

winston.loggers.add('updatedStories', {
  format: logFormat,
  transports: [
    new winston.transports.File({ filename: 'action-logs/updated-stories.log' }),
  ],
});

winston.loggers.add('deletedStories', {
  format: logFormat,
  transports: [
    new winston.transports.File({ filename: 'action-logs/deleted-stories.log' }),
  ],
});

winston.loggers.add('index', {
  format: logFormat,
  transports: [
    new winston.transports.File({ filename: 'info-logs/index.log' })
  ]
});

winston.loggers.add('deleteErrors', {
  format: logFormat,
  transports: [
    new winston.transports.File({ filename: 'error-logs/delete-errors.log' })
  ]
});

module.exports = winston;