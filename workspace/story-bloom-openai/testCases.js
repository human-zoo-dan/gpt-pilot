const mongodb = require('mongodb');
const generateCategory = require('./generateCategory');

const runTestCase = async function(db) {
  try {
    let uniqueCategories = new Set();

    for (let i = 0; i < 10; i++) {  
      const currentCategoryId = await generateCategory(db, generateContent);
      console.log(`Category iteration ${i + 1}: Generated or selected category with ID: ${currentCategoryId}`);
      
      const categoriesCollection = db.collection('Categories');
      let categoryData;
      try {
        categoryData = await categoriesCollection.findOne({ _id: new mongodb.ObjectId(currentCategoryId) });
        uniqueCategories.add(categoryData.name);
        console.log(`Iteration ${i + 1}: Category "${categoryData.name}" added to the set.`);
      } catch (error) {
        console.error('An error occurred while fetching the category from the database:', error);
        console.error(error.stack);
        throw error;
      }
    }

    console.log(`Generated ${uniqueCategories.size} unique categories from 10 iterations.`);
  } catch (e) {
    console.error('An error occurred during the test case execution:', e);
    console.error(e.stack);
    process.exit(1);
  } 
};

module.exports = runTestCase;