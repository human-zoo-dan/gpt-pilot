const axios = require('axios');
const dotenv = require('dotenv');
const winston = require('winston');

dotenv.config();

const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.Console()
  ]
});

const wpAPIEndPoint = process.env.STORY_BLOOM_WP_WORDPRESS_API_ENDPOINT;
const wpAPIKey = process.env.STORY_BLOOM_WP_API_KEY;

axios.defaults.headers.common['Authorization'] = `Bearer ${wpAPIKey}`;
axios.defaults.baseURL = wpAPIEndPoint;

const createUpdateWP = async (type, data) => {
  try {
    switch (type.toLowerCase()) {
      case 'category':
        const categoryData = {
          description: data.name,
        };
        await axios.post('/wp/v2/categories', categoryData);
        logger.info(`Category ${data._id} created/updated successfully on WordPress.`);
        break;

      case 'post':
        const postData = {
          title: data.title,
          content: data.plot,
          categories: [data.category],
        };
        await axios.post('/wp/v2/posts', postData);
        logger.info(`Post ${data._id} created/updated successfully on WordPress.`);
        break;

      default:
        logger.warn(`Invalid type ${type} passed to createUpdateWP function.`);
    }
  } catch (error) {
    logger.error(`Error while creating/updating ${type}: `, error);
    logger.error(error.stack);
  }
};

const deleteEntryWP = async (type, id) => {
  try {
    switch (type.toLowerCase()) {
      case 'category':
        await axios.delete(`/wp/v2/categories/${id}`);
        logger.info(`Category ${id} deleted successfully from WordPress.`);
        break;

      case 'post':
        await axios.delete(`/wp/v2/posts/${id}`);
        logger.info(`Post ${id} deleted successfully from WordPress.`);
        break;

      default:
        logger.warn(`Invalid type ${type} passed to deleteEntryWP function.`);
    }
  } catch (error) {
    logger.error(`Error while deleting ${type}: `, error);
    logger.error(error.stack);
  }
};

module.exports = {createUpdateWP, deleteEntryWP};
