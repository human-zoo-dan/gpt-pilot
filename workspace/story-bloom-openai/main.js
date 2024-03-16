const dotenv = require('dotenv');
const connectToDatabase = require('./db/connection');
const generateCategory = require('./generateCategory');
const generateStoryElements = require('./generateStoryElements');
const saveStory = require('./saveStory');
const axios = require('axios');

dotenv.config();

// function to generate content using OpenAI API
async function generateContent(prompt) {
  try {
    const response = await axios.post(process.env.SB_OPENAI_API_URL, {
      model: process.env.SB_OPENAI_MODEL,
      messages: [{ role: 'system', content: prompt }],
      max_tokens: process.env.SB_OPENAI_TOKENS
    }, {
      headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SB_OPENAI_API_KEY}`
      }
    });

    return response.data.choices[0].message.content;
  } catch (err) {
    console.error('Error occurred with OpenAI API: ', err); // gpt_pilot_debugging_log
    console.error(err.stack);
    throw err;
  }
}

async function startApp(tests = false) {
  let connection = null;
  
  try {
    connection = await connectToDatabase();
    const db = connection.db;

    if (db) {
      console.log('Atlas MongoDB connection established!');
    }

    const currentCategoryId = await generateCategory(db, generateContent);
    console.log('Category generated or selected with ID: ' + currentCategoryId);

    const storyElements = await generateStoryElements(db, generateContent, currentCategoryId);
    console.log('Story Elements generated ' + JSON.stringify(storyElements));

    await saveStory(db, storyElements);
    console.log('Story saved successfully.');

    // If tests parameter is true, run test cases
    if (tests) {
      const runTestCase = require('./testCases'); // Require testCases.js only when tests==true
      await runTestCase(db);
      console.log('Test cases run successfully.');
    }
    
  } catch (err) {
    console.error('An error occurred: ', err);
    console.error(err.stack);
  } finally {
    // Close the MongoDB client connection
    if (connection && connection.client) {
      await connection.client.close().catch((err) => {
        console.error('Error occurred while closing the MongoDB client: ', err);
        console.error(err.stack);
      });
      console.log('MongoDB client connection closed.');
    }
  }
}

startApp(false);