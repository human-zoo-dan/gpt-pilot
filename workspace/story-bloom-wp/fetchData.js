const { getDB } = require('./db');
const winston = require('winston');
const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.Console()
  ]
});

const fetchCategories = async () => {
  try {
    const categories = await getDB().collection('Categories').find().toArray();
    logger.info('Fetched Categories Data');
    return categories;
  } catch (error) {
    logger.error('Categories Fetch Error: ' + error.message);
  }
};

const fetchStories = async () => {
  try {
    const stories = await getDB().collection('Stories').find().toArray();
    logger.info('Fetched Stories Data');
    return stories;
  } catch (error) {
    logger.error('Stories Fetch Error: ' + error.message);
  }
};

module.exports = { fetchCategories, fetchStories };