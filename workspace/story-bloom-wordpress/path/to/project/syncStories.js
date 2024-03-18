const axios = require('axios');
const moment = require('moment');
const mongoose = require('./config/mongoose');
const Story = require('./models/Story');
const getCategories = require('./syncCategories').getCategories;  
const winston = require('./winston');
const deleteErrorsLogger = winston.loggers.get('deleteErrors');
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

let allowedMethodsPosts = ['GET', 'POST', 'PUT', 'DELETE'];

function validateDbStory(story) {
  if (!story) {
    console.log('dbStory is required');
    throw new Error('dbStory is required');
  }
  if (!story.title || !story.plot || !story.category) {
    console.log('dbStory must include title, plot, and category');
    throw new Error('dbStory must include title, plot, and category');
  }
}

function validateWpPostId(id) {
  if (!id || typeof id !== 'number') {
    console.log('A valid wpPostId is required (must be a number)');
    throw new Error('A valid wpPostId is required (must be a number)');
  }
}

// The rest of the code ...

async function deleteWPStoriesById(wpPostId) {
  try {
    validateWpPostId(wpPostId);
    // ...existing code...
  } catch(error) {
    console.error(`Validation failed for deleteWPStoriesById: ${error.message}\n${error.stack}`);
    deleteErrorsLogger.error(`Validation failed for deleteWPStoriesById: ${error}`);
  }
}

async function updateWPStory(dbStory, wpPostId) {
  try {
    validateDbStory(dbStory);
    validateWpPostId(wpPostId);
    
    const wpCategoriesRes = await axios.get(`${baseURL}/categories?search=${encodeURIComponent(dbStory.category)}`, auth);
    const wpCategoryId = wpCategoriesRes.data[0].id; 

    await axios.put(`${baseURL}/posts/${wpPostId}`, { title: dbStory.title, content: dbStory.plot, categories: [wpCategoryId] }, auth)
      .catch((error) => {
        console.error('Axios put request error:', error.response.data); // gpt_pilot_debugging_log
        console.error('Axios put request config:', error.config); // gpt_pilot_debugging_log
        throw error;
    });
    
    updatedStoriesLogger.info(`Updated WP Story '${dbStory.title}' with ID : ${wpPostId}`);

  } catch(error) {
    console.error('Error in updating WP Story:', error.message); // gpt_pilot_debugging_log
    console.error(error.stack); // gpt_pilot_debugging_log
    throw error;
  }
}

// Architecture Code ...