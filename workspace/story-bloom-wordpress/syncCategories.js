const axios = require('axios');
const moment = require('moment');
const mongoose = require('./config/mongoose');
const Category = require('./models/Category');
const winston = require('winston');
require('dotenv').config();

const wpUsername = process.env.STORY_BLOOM_WORDPRESS_WP_USERNAME;
const wpPassword = process.env.STORY_BLOOM_WORDPRESS_WP_PASSWORD;
const baseURL = process.env.STORY_BLOOM_WORDPRESS_WP_BASEURL;
const connectionString = process.env.STORY_BLOOM_WORDPRESS_MONGODB_CONNECTIONSTRING;
const dbName = process.env.STORY_BLOOM_WORDPRESS_MONGODB_DBNAME;

console.log('baseURL is:', baseURL);

const token = Buffer.from(`${wpUsername}:${wpPassword}`, 'utf8').toString('base64');
const auth = {
  headers: { 'Authorization': `Basic ${token}` }
};

let wpCategoriesNames = [];

async function getWpCategories() {
  try {
    const wpCategoriesRes = await axios.get(`${baseURL}/categories`, auth);
    const wpCategories = wpCategoriesRes.data;
    
    wpCategoriesNames = wpCategories.map((wpCategory) => wpCategory.name.toLowerCase());
  
    console.log('Fetched categories from WordPress:', wpCategoriesNames.join(', '));
    winston.loggers.get('index').info('Fetched categories from WordPress. Names:', wpCategoriesNames.join(', '));
  } catch (error) {
    console.error(`Error fetching categories from WordPress: ${error.message}`);
    console.error(`Stack trace: ${error.stack}`);
    winston.error(`Error fetching categories from WordPress: ${error.message}\nStack trace: ${error.stack}`);
  }
}

async function syncCategories() {
  let allowedMethodsCategories = ['GET', 'POST', 'PUT', 'DELETE'];
  console.log('Allowed methods for /categories: ', allowedMethodsCategories.join(', '));
  
  await getWpCategories();

  try {
    await mongoose.connect(connectionString, { dbName: dbName });
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}\n${error.stack}`);
    winston.error(`MongoDB connection error: ${error.message}\n${error.stack}`);
    return;
  }

  let categories;
  try {
    console.log('Fetching categories from MongoDB...');
    categories = await Category.find({}).exec();
    console.log(`Fetched ${categories.length} categories from MongoDB.`);
    console.log('MongoDB Categories:', categories.map(category => category.name).join(', '));
  } catch(error) {
    winston.error(`Error fetching categories from MongoDB: ${error.message}\n ${error.stack}`);
  }
  
  const dbCategoriesNames = categories.map(category => category.name.toLowerCase());

  for (const dbCategory of categories) {
    try {
      const wpCategories = await axios.get(`${baseURL}/categories?search=${dbCategory.name}`, auth);
      const wpCategory = wpCategories.data[0];

      if (!wpCategory) {
        if (allowedMethodsCategories.includes('POST')) {
          await axios.post(`${baseURL}/categories`, { name: dbCategory.name }, auth);
          console.log(`Created new category: ${dbCategory.name}`);
          winston.loggers.get('newCategories').info(`Created new category: ${dbCategory.name}`);
        } else {
          console.log(`Cannot create a new category due to communication restrictions with WordPress API for ${dbCategory.name}`);
        }
        
      } else {
        if (moment(dbCategory.created_at).isAfter(moment(wpCategory.date))) {
          if (allowedMethodsCategories.includes('PUT')) {
            await axios.put(`${baseURL}/categories/${wpCategory.id}`, { name: dbCategory.name }, auth);
          } else {
            console.log(`Cannot update category ${dbCategory.name} due to communication restrictions with WordPress API`);
          }
          winston.loggers.get('updatedCategories').info(`Updated category: ${dbCategory.name}`);
        }
      }
    } catch (error) {
      console.error(`HTTP Response:\n${error.response.statusText}\n${error.response.headers}\nError synchronizing category '${dbCategory.name}': ${error.message}\n${error.stack}`);
      winston.error(`HTTP Response:\n${error.response.statusText}\n${error.response.headers}\nError synchronizing category '${dbCategory.name}': ${error.message}\n${error.stack}`);
    }
  }

  let wpCategories;
  try {
    console.log('Fetching categories from WordPress...');
    const wpCategoriesRes = await axios.get(`${baseURL}/categories`, auth);
    wpCategories = wpCategoriesRes.data;
    console.log(`Fetched ${wpCategories.length} categories from WordPress.`);
    console.log('WordPress categories:', wpCategories.map(category => category.name).join(', '));
  } catch (error) {
    console.error(`HTTP Response:\n${error.response.statusText}\n${error.response.headers}\nError managing WordPress categories: ${error.message}\n${error.stack}`);
    winston.error(`HTTP Response:\n${error.response.statusText}\n${error.response.headers}\nError managing WordPress categories: ${error.message}\n${error.stack}`);
  }

  for (const wpCategory of wpCategories) {
    const wpCategoryName = wpCategory.name.toLowerCase();
    if (!dbCategoriesNames.includes(wpCategoryName) && wpCategoryName !== 'uncategorized') {
      console.log(`Deleting WordPress category '${wpCategory.name}', reason: not found in MongoDB`); // gpt_pilot_debugging_log
      winston.loggers.get('deletedCategories').info(`Deleting WP category '${wpCategory.name}', reason: not found in MongoDB`); // gpt_pilot_debugging_log
      try {
        await axios.delete(`${baseURL}/categories/${wpCategory.id}?force=true`, auth);
        console.log(`Deleted WordPress category: ${wpCategory.name}`); // gpt_pilot_debugging_log
        winston.loggers.get('deletedCategories').info(`Deleted category: ${wpCategory.name}`); 
      } catch (error) {
        if (error.response && error.response.status === 404) {
          winston.loggers.get('deletedCategories').info(`Category: ${wpCategory.name} does not exist in WP.`);
        } else {
          console.error(`HTTP Response:\n${error.response.statusText}\n${error.response.headers}\nError deleting WordPress category: ${error.message}\n${error.stack}`);
          winston.error(`HTTP Response:\n${error.response.statusText}\n${error.response.headers}\nError cleaning WordPress categories: ${error.message}\n${error.stack}`);
        }
      }
    }
  }

  try {
    await mongoose.connection.close();
    console.log('Connection closed'); 
  } catch (error) {
    console.error(`Error while closing MongoDB connection: ${error.message}\n${error.stack}`);
    winston.loggers.get('index').error(`HTTP Response:\n${error.response.statusText}\n${error.response.headers}\nError while closing MongoDB connection: ${error.message}\n${error.stack}`);
  }
}

module.exports = syncCategories;