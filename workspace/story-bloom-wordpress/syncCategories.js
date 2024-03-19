const axios = require('axios');
const moment = require('moment');
const mongoose = require('./config/mongoose');
const Category = require('./models/Category');
const winston = require('./winston');
const { AllHtmlEntities } = require('html-entities');
const entities = new AllHtmlEntities();
require('dotenv').config();

const wpUsername = process.env.STORY_BLOOM_WORDPRESS_WP_USERNAME;
const wpPassword = process.env.STORY_BLOOM_WORDPRESS_WP_PASSWORD;
const baseURL = process.env.STORY_BLOOM_WORDPRESS_WP_BASEURL;
const connectionString = process.env.STORY_BLOOM_WORDPRESS_MONGODB_CONNECTIONSTRING;
const dbName = process.env.STORY_BLOOM_WORDPRESS_MONGODB_DBNAME;

const token = Buffer.from(`${wpUsername}:${wpPassword}`, 'utf8').toString('base64');
const auth = {
  headers: { 'Authorization': `Basic ${token}` }
};

// Fetches WordPress categories
async function getWpCategories() {
  let page = 1;
  const perPage = 100;
  let totalPages = null; 
  let categories = {};

  while (totalPages === null || page <= totalPages) { 
    try {
      const wpCategoriesRes = await axios.get(`${baseURL}/categories?page=${page}&per_page=${perPage}`, auth);
      const wpCategoriesPage = wpCategoriesRes.data;

      if (wpCategoriesPage.length === 0) {
        break;
      }

      wpCategoriesPage.forEach((wpCategory) => (categories[entities.decode(wpCategory.name).toLowerCase()] = wpCategory.id));
      totalPages = parseInt(wpCategoriesRes.headers['x-wp-totalpages']);

      winston.loggers.get('index').info(`Fetched categories from WordPress page ${page}. Names:`, Object.keys(categories).join(', '));
      page++;
    } catch (error) {
      winston.error(`Error fetching Categories from WordPress page ${page}: ${error.message} AT ${moment().utc().format('YYYY-MM-DD HH:mm:ss')}\nStack trace: ${error.stack}`);
    }
  }
  return categories;
}

// Function that synchronizes MongoDB categories with WordPress
async function syncCategories() {
  let allowedMethodsCategories = ['GET', 'POST', 'PUT', 'DELETE'];

  let categories;
  try {
    categories = await getWpCategories().catch((error) => {
      console.error(`Error in getWpCategories: ${error.message}\n${error.stack}`);
      winston.error(`Error in getWpCategories: ${error.message}\n${error.stack}`);
    });

    await mongoose.connect(connectionString, { dbName: dbName });

  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}\n${error.stack}`);
    winston.error(`MongoDB connection error: ${error.message}\n${error.stack}`);
    return;
  }

  let dbCategories;
  try {
    dbCategories = await Category.find({}).exec();
  } catch(error) {
    winston.error(`Error fetching categories from MongoDB: ${error.message}\n ${error.stack}`);
  }

  try {
    // Get all WP category names
    let wpCategoryNames = Object.keys(categories);
  
    // Get all MongoDB category names
    let dbCategoryNames = dbCategories.map(dbCat => dbCat.name.toLowerCase());
  
    // Find WP categories that are missing in db
    let wpCategoriesToDelete = wpCategoryNames.filter(wpCatName => !dbCategoryNames.includes(wpCatName));
    
    // Iterate through WP categories to delete
    for (const categoryName of wpCategoriesToDelete) {
      // Skip deleting the 'Uncategorized' category
      if (categoryName.toLowerCase() === 'uncategorized') {
        console.log(`Skip deleting category '${categoryName}' in WordPress as it is the default category and cannot be deleted.`); // gpt_pilot_debugging_log
        winston.loggers.get('index').info(`Skip deleting category '${categoryName}' in WordPress as it is the default category and cannot be deleted.`);
        continue;
      }

      let wpCategoryId = categories[categoryName];
      axios.delete(`${baseURL}/categories/${wpCategoryId}?force=true`, auth).then((response) => {
        console.log(`Deleted category '${categoryName}' in WordPress`); // gpt_pilot_debugging_log
      }).catch((error) => {
        console.error(`Error deleting category '${categoryName}' in WordPress: ${error.message}`); // gpt_pilot_debugging_log
        winston.error(`Error deleting category '${categoryName}' in WordPress: ${error.message}\n ${error.stack}`);
      });
    }
  } catch (error) {
    console.error(`Error comparing or deleting categories: ${error.message}\n ${error.stack}`);
    winston.error(`Error comparing or deleting categories: ${error.message}\n ${error.stack}`);
  }

  for (const dbCategory of dbCategories) {
    try {
      if (!categories.hasOwnProperty(dbCategory.name.toLowerCase())) {
        if (allowedMethodsCategories.includes('POST')) {
          await axios.post(`${baseURL}/categories`, { name: dbCategory.name }, auth);
          winston.loggers.get('newCategories').info(`Created new category: ${dbCategory.name}`);
        } else {
          winston.loggers.get('newCategories').info(`Cannot create a new category due to communication restrictions with WordPress API for ${dbCategory.name}`);
        }
      } else {
        winston.loggers.get('newCategories').info(`Category already exists in WordPress: ${dbCategory.name}`);
      }
    } catch (error) {
      winston.error(`Error synchronizing category '${dbCategory.name}': ${error.message} AT ${moment().utc().format('YYYY-MM-DD HH:mm:ss')}\n${error.stack}`);
    }
  }

  try {
    await mongoose.connection.close();
    winston.loggers.get('index').info('Connection to MongoDB closed.');
  } catch (error) {
    winston.loggers.get('index').error(`Error while closing MongoDB connection: ${error.message} AT ${moment().utc().format('YYYY-MM-DD HH:mm:ss')}\n${error.stack}`);
  }
}

module.exports = { syncCategories, getWpCategories };