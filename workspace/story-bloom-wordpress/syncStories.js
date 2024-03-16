const axios = require('axios');
const moment = require('moment');
const mongoose = require('./config/mongoose');
const Story = require('./models/Story');
const winston = require('./winston');
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

let allowedMethodsPosts;

async function syncStories() {
  try {
    const optionsStoriesRes = await axios.options(`${baseURL}/posts`, auth);
    allowedMethodsPosts = optionsStoriesRes.headers['Access-Control-Allow-Methods'].split(', ');

    console.log('Allowed methods for /posts: ', allowedMethodsPosts.join(', ')); // gpt_pilot_debugging_log
  } catch (error) {
    console.error('Error fetching options for /posts: ', error.message); // gpt_pilot_debugging_log
    winston.error('Error fetching options for /posts: ', error.message); // gpt_pilot_debugging_log
  }

  try {
    await mongoose.connect(connectionString, { dbName: dbName });
    winston.loggers.get('index').info('MongoDB connection established successfully.');
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}\n${error.stack}`);
    winston.error(`MongoDB connection error: ${error.message}\n${error.stack}`);
    return;
  }

  const stories = await Story.find({}).exec();
  winston.loggers.get('index').info(`Retrieved ${stories.length} stories from MongoDB.`);
  const dbStoriesTitles = stories.map(story => story.title);

  for (const dbStory of stories) {
    try {
      const wpPosts = await axios.get(`${baseURL}/posts?search=${dbStory.title}`, auth);
      const wpPost = wpPosts.data[0];

      if (!wpPost) {
        await axios.post(`${baseURL}/posts`, { title: dbStory.title, content: dbStory.plot }, auth);
        winston.loggers.get('newStories').info(`Created new story: ${dbStory.title}`);
      } else {
        if (moment(dbStory.created_at).isAfter(moment(wpPost.date))) {
          if (allowedMethodsPosts.includes('PUT')) {
            await axios.put(`${baseURL}/posts/${wpPost.id}`, { title: dbStory.title, content: dbStory.plot }, auth); // gpt_pilot_debugging_log
          } else if (allowedMethodsPosts.includes('POST')) {
            await axios.post(`${baseURL}/posts/${wpPost.id}`, { title: dbStory.title, content: dbStory.plot }, auth); // gpt_pilot_debugging_log
          }
          winston.loggers.get('updatedStories').info(`Updated story: ${dbStory.title}`);
        }
      }
    } catch (error) {
      console.error(`Error synchronizing story '${dbStory.title}': ${error.message}\n${error.stack}`); // gpt_pilot_debugging_log
      winston.error(`Error synchronizing story '${dbStory.title}': ${error.message}\n${error.stack}`); // gpt_pilot_debugging_log
    }
  }

  try {
    const wpPostsRes = await axios.get(`${baseURL}/posts`, auth);
    const wpPosts = wpPostsRes.data;

    for (const wpPost of wpPosts) {
      const wpPostTitle = wpPost.title.rendered;
      if (!dbStoriesTitles.includes(wpPostTitle)) {
        try {
          if (allowedMethodsPosts.includes('DELETE')) {
            await axios.delete(`${baseURL}/posts/${wpPost.id}?force=true`, auth); // gpt_pilot_debugging_log
          }
          winston.loggers.get('deletedStories').info(`Deleted story: ${wpPostTitle}`);
        } catch (error) {
          if (error.response && error.response.status === 404) {
            winston.loggers.get('deletedStories').info(`Story: ${wpPostTitle} does not exist in WP.`);
          } else {
            console.error(`Error managing WordPress stories: ${error.message}\n${error.stack}`); // gpt_pilot_debugging_log
            winston.error(`Error managing WordPress stories: ${error.message}\n${error.stack}`); // gpt_pilot_debugging_log
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error managing WordPress stories: ${error.message}\n${error.stack}`); // gpt_pilot_debugging_log
    winston.error(`Error managing WordPress stories: ${error.message}\n${error.stack}`); // gpt_pilot_debugging_log
  }

  try {
    await mongoose.connection.close();
    winston.loggers.get('index').info('MongoDB connection closed.');
  } catch (error) {
    console.error(`Error closing MongoDB connection: ${error.message}\n${error.stack}`); // gpt_pilot_debugging_log
    winston.loggers.get('index').error(`Error closing MongoDB connection: ${error.message}\n${error.stack}`); // gpt_pilot_debugging_log
  }
}

module.exports = syncStories;