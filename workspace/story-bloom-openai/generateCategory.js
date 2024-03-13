const mongodb = require('mongodb');

async function generateCategory(db, generateContent) {
  const categories = db.collection('Categories');
  const existingCategoryCount = await categories.countDocuments({});
  let currentCategoryId = null;

  const percentage = Math.random();

  if (existingCategoryCount === 0 || percentage < 0.5) {
    const categoryName = await generateContent(
      'Generate a single unique and creative category name for a Wordpress blog that encompasses a wide variety of storytelling genres, themes, and styles, catering to a general web user audience. The category name should be broad enough to accommodate a diverse array of stories, while still being user-friendly and intuitive.'
    ).catch(error => {
      console.error('Error generating category name:', error);
      throw error;
    });
    const newCategory = { created_at: new Date(), name: categoryName };
    currentCategoryId = (await categories.insertOne(newCategory)).insertedId;
    console.log(`New category generated with ID: ${currentCategoryId}`);
  } else {
    const random = Math.floor(Math.random() * existingCategoryCount);
    const result = await categories.find().skip(random).limit(1).toArray();
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