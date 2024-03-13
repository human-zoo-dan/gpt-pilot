const mongodb = require('mongodb');
const generateCategory = require('./generateCategory');
const generateStoryElements = require('./generateStoryElements');

// The runTestCase function previously in main.js
const runTestCase = async function(db) {
  try {
    const currentCategoryId = await generateCategory(db, generateContent);
    console.log(`Category generated or selected with ID: ${currentCategoryId}`);

    // Generate 5 story plots for the selected category
    for (let i = 0; i < 5; i++) {
      const storyElements = await generateStoryElements(db, generateContent, currentCategoryId);
      console.log(`Test Case ${i + 1}: Story Plot - ${storyElements.plot}`);
    }
  } catch (e) {
    console.error('An error occurred:', e);
    console.error(e.stack);
    process.exit(1);
  } 
};

module.exports = runTestCase;