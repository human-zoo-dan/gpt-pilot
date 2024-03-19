const axios = require('axios');
const moment = require('moment');
const mongoose = require('./config/mongoose');
const Story = require('./models/Story');
const { getWpCategories } = require('./syncCategories');
const winston = require('./winston');
const updatedStoriesLogger = winston.loggers.get('updatedStories');
const _ = require('lodash');
const { validateDbStory, validateWpPostId } = require('./validation');
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

const { AllHtmlEntities } = require('html-entities');
const entities = new AllHtmlEntities();

async function getWpStories() {
  let page = 1;
  const perPage = parseInt(process.env.STORY_SYNC_PER_PAGE) || 100;
  let wpStories = {};

  while (true) {
    try {
      const wpStoriesRes = await axios.get(`${baseURL}/posts?page=${page}&per_page=${perPage}`, auth);
      const wpStoriesPage = wpStoriesRes.data;

      // Update wpStories before checking totalPages and breaking the loop
      wpStories = {
        ...wpStories,
        ...wpStoriesPage.reduce((acc, wpStory) => {
          acc[entities.decode(wpStory.title.rendered).toLowerCase()] = wpStory.id;
          return acc;
        }, {})
      };

      const totalPages = parseInt(wpStoriesRes.headers['x-wp-totalpages']);

      console.log('Page number:', page, 'Total Pages:', totalPages); // gpt_pilot_debugging_log 

      if (page >= totalPages) {
        break;
      }

      page++;
    } catch (error) {
      // debug logs
      console.error('Request Details:', error.config); // gpt_pilot_debugging_log 
      console.error('Server Response:', error.response.data); // gpt_pilot_debugging_log 

      console.error(`Error fetching Stories from WordPress: ${error.message}\n ${error.stack}`); // gpt_pilot_debugging_log
      throw error;
    }
  }

  return wpStories;
}

async function getWPStoryIds() {
  let page = 1;
  const perPage = parseInt(process.env.STORY_SYNC_PER_PAGE) || 100;
  let wpStoriesIds = [];

  while (true) {
    try {
      const wpStoriesRes = await axios.get(`${baseURL}/posts?page=${page}&per_page=${perPage}`, auth);
      const wpStoriesPage = wpStoriesRes.data;

      const totalPages = parseInt(wpStoriesRes.headers['x-wp-totalpages']);

      wpStoriesIds = [
        ...wpStoriesIds,
        ...wpStoriesPage.map((story) => story.id),
      ];

      if (page >= totalPages) {
        break;
      }

      page++;
    } catch (error) {
      console.error('Request Details:', error.config); 
      console.error('Server Response:', error.response.data); 

      console.error(`Error fetching Stories from WordPress: ${error.message}\n ${error.stack}`);
      throw error;
    }
  }

  return wpStoriesIds;
}

async function getAllDbStories() {
  let dbStories;
  try {
    dbStories = await Story.find({}).exec();
    console.log('MongoDB stories fetched successfully');
    winston.loggers.get('index').info('MongoDB stories fetched successfully');
  } catch (error) {
    console.error(`Error fetching stories from MongoDB: ${error.message}\n ${error.stack}`);
    winston.error(`Error fetching stories from MongoDB: ${error.message}\n ${error.stack}`);
    throw error;
  }
  return dbStories; 
}

async function deleteWPStoriesById(wpId) {
  try {
    validateWpPostId(wpId);
    await axios.delete(`${baseURL}/posts/${wpId}?force=true`, auth);
    winston.loggers.get('index').info(`Deleted Story with ID ${wpId}`);
  } catch (error) {
    console.error(`Error in deleting WP Story by ID: ${error.message}\n${error.stack}`);
    winston.loggers.get('index').error(`Error in deleting WP Story by ID: ${error.message}\n${error.stack}`);
    throw error;
  }
}

async function deleteWPStoriesMissingInDB(wpPostIds) {
  let wpPostCount = wpPostIds.length;
  let dbStoryCount = await Story.countDocuments();
  
  if (wpPostCount != dbStoryCount) {
    const dbStories = await Story.find({});
    const dbStoryTitles = dbStories.map(dbStory => dbStory.title);
    
    for (let i = 0; i < wpPostCount; i++) {
      const wpPostTitle = wpPostIds[i];
      if (!dbStoryTitles.includes(wpPostTitle)) {
        await deleteWPStoriesById(wpPostTitle);
        wpPostCount--;
        if (wpPostCount === dbStoryCount) {
          break;
        }
      }
    }
  }
}

async function createWPStory(dbStory) {
  validateDbStory(dbStory);

  const wpStoriesRes = await axios.get(`${baseURL}/posts?search=${encodeURIComponent(dbStory.title)}`);
  const wpStory = wpStoriesRes.data[0];
  
  if (wpStory) {
    updatedStoriesLogger.info(`Story '${dbStory.title}' already exists in WordPress. Skipping creation.`); // gpt_pilot_debugging_log
    return;
  }

  const wpCategories = await getWpCategories().catch((error) => { throw error; });
  const categoryId = wpCategories[dbStory.category.toLowerCase()];

  if(categoryId === undefined) {
    console.error(`Category ID for '${dbStory.category}' not found in WP.`);
    throw new Error(`Category ID for '${dbStory.category}' not found in WP.`);
  }

  await axios.post(
    `${baseURL}/posts`, 
    {
      title: dbStory.title, 
      content: dbStory.plot,
      status: 'publish',
      categories: [categoryId]
    },
    auth
  ).catch((error) => {
   console.error('Error during the POST request to WordPress API:', error.message);
   throw error;
  });
}

async function updateWPStory(dbStory, wpPostId) {

  validateDbStory(dbStory);
  validateWpPostId(wpPostId);

  const wpStoriesRes = await axios.get(`${baseURL}/posts?search=${encodeURIComponent(dbStory.title)}`, auth);
  const wpStory = wpStoriesRes.data[0];

  if (wpStory && wpStory.title.rendered === dbStory.title) {
    updatedStoriesLogger.info(`Story with title '${dbStory.title}' already exists in WordPress. Skipping update.`); // gpt_pilot_debugging_log
    return; 
  }

  const wpCategories = await getWpCategories();
  const categoryId = wpCategories[dbStory.category.toLowerCase()];

  await axios.put(`${baseURL}/posts/${wpPostId}`,
    {
      title: dbStory.title, 
      content: dbStory.plot, 
      categories: [categoryId]
    }, auth).catch((error) => {
      if (error.response) {
        console.error('Axios put request error:', error.response.data);
        throw new Error(`Axios put request error: ${error.response.data} \n${error.stack}`);
      }
    });

  updatedStoriesLogger.info(`Updated WP Story '${dbStory.title}' with ID : ${wpPostId}`);
}

async function syncStories() {
  try {
    await mongoose.connect(connectionString, { dbName: dbName });
    winston.loggers.get('index').info('MongoDB connection established successfully.');

    let dbStories = await getAllDbStories();
    let wpStories = await getWpStories().catch((error) => { throw error; });

    for (const dbStory of dbStories) {
      const wpStoryTitleLower = dbStory.title.toLowerCase();
      if (_.includes(Object.keys(wpStories), wpStoryTitleLower)) {
        const wpPostId = wpStories[wpStoryTitleLower];
        await updateWPStory(dbStory, wpPostId).catch((error) => { throw error; });
      } else {
        await createWPStory(dbStory).catch((error) => { throw error; });
      }
    }
    
    await deleteWPStoriesMissingInDB(await getWPStoryIds());

    await mongoose.connection.close();
    winston.loggers.get('index').info('Connection to MongoDB closed.');
  } catch (error) {
    console.error(`Error in synchronization process: ${error.message}\n${error.stack}`);
    winston.loggers.get('index').error(`Error in synchronization process: ${error.message} AT ${moment().utc().format('YYYY-MM-DD HH:mm:ss')}\nStack trace: ${error.stack}`);
  }
}

module.exports = {
  syncStories,
  getWpStories,
  deleteWPStoriesById,
  deleteWPStoriesMissingInDB,
};