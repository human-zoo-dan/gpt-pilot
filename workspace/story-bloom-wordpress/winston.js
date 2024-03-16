const winston = require('winston');

winston.loggers.add('newCategories', {
  format: winston.format.simple(),
  transports: [
    new winston.transports.File({ filename: 'action-logs/new-categories.log' }),
  ],
});
winston.loggers.add('updatedCategories', {
  format: winston.format.simple(),
  transports: [
    new winston.transports.File({ filename: 'action-logs/updated-categories.log' }),
  ],
});
winston.loggers.add('deletedCategories', {
  format: winston.format.simple(),
  transports: [
    new winston.transports.File({ filename: 'action-logs/deleted-categories.log' }),
  ],
});

winston.loggers.add('newStories', {
  format: winston.format.simple(),
  transports: [
    new winston.transports.File({ filename: 'action-logs/new-stories.log' }),
  ],
});
winston.loggers.add('updatedStories', {
  format: winston.format.simple(),
  transports: [
    new winston.transports.File({ filename: 'action-logs/updated-stories.log' }),
  ],
});
winston.loggers.add('deletedStories', {
  format: winston.format.simple(),
  transports: [
    new winston.transports.File({ filename: 'action-logs/deleted-stories.log' }),
  ],
});

winston.loggers.add('index', {
  format: winston.format.simple(),
  transports: [
    new winston.transports.File({ filename: 'info-logs/index.log' })
  ]
});

module.exports = winston;