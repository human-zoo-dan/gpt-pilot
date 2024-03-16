const mongodb = require('mongodb');
const removeQuotes = require('./helpers');

async function generateCategory(db, generateContent) {
  const categories = db.collection('Categories');
  const existingCategoryCount = await categories.countDocuments({});
  let currentCategoryId = null;

  const percentage = Math.random();

  if (existingCategoryCount === 0 || percentage < 0.5) {
    let categoryName;
    let isUnique = false;

    while (!isUnique) {
      try {
        categoryName = removeQuotes(await generateContent(
          'Generate a single unique and creative category name for a Wordpress blog that encompasses a wide variety of storytelling genres, themes, and styles, catering to a general web user audience. The category name should be broad enough to accommodate a diverse array of stories, while still being user-friendly and intuitive.'
        ));

        // Check if category already exists
        const exists = await categories.findOne({ name: categoryName });

        // If category does not exist in the database, break the loop
        if (!exists) {
          isUnique = true;
        } else {
          console.log(`Category with name "${categoryName}" already exists in the database. Generating a new category name...`); // gpt_pilot_debugging_log
        }
      } catch (error) {
        console.error('Error generating unique category name:', error); // gpt_pilot_debugging_log
        console.error(error.stack);
        throw error;
      }
    }

    const newCategory = { created_at: new Date(), name: categoryName };

    try {
      currentCategoryId = (await categories.insertOne(newCategory)).insertedId;
      console.log(`New category generated with ID: ${currentCategoryId}`);
    } catch (error) {
      console.error('Error saving new category:', error);
      console.error(error.stack);
      throw error;
    }
  } else {
    const random = Math.floor(Math.random() * existingCategoryCount);
    let result;
    try {
      result = await categories.find().skip(random).limit(1).toArray();
    } catch (error) {
      console.error('Error fetching category from database:', error);
      console.error(error.stack);
      throw error;
    }

    if(result.length > 0) {
      currentCategoryId = result[0]._id;
      console.log(`Existing category selected with ID: ${currentCategoryId}`);
    } else {
      console.error('Error retrieving category from the database.');
      throw new Error('RetrievalError: Failed to retrieve category from database.');
    }
  }

  return currentCategoryId;
}

module.exports = generateCategory;