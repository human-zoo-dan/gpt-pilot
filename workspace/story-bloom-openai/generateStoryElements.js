const mongodb = require('mongodb');
const removeQuotes = require('./helpers');

async function generateStoryElements(db, generateContent, currentCategoryId) {
  const categories = db.collection('Categories');
  let categoryData;

  try {
    categoryData = await categories.findOne({ _id: new mongodb.ObjectId(currentCategoryId) });
  } catch (error) {
    console.error('Error fetching category from database:', error); // gpt_pilot_debugging_log
    console.error(error.stack);
    throw error;
  }

  const categoryName = removeQuotes(categoryData.name); 

  let storyTitle;
  const stories = db.collection('Stories');
  let titleExists = true;

  while(titleExists) {
    try {
      storyTitle = removeQuotes(await generateContent(
        `Generate a compelling title for a story falling under the ${categoryName} genre, ensuring it captures the essence of the narrative and intrigues potential readers.`
      )); // gpt_pilot_debugging_log

      const exists = await stories.findOne({ title: storyTitle });

      if (exists) {
        console.log(`Title "${storyTitle}" already exists. Generating a new title...`); // gpt_pilot_debugging_log
      } else {
        titleExists = false;
      }

    } catch (error) {
      console.error('Error generating unique title:', error); // gpt_pilot_debugging_log
      console.error(error.stack);
      throw error;
    }
  }

  let storyPlot;
  try {
    storyPlot = await generateContent(
      `Given a specific title (${storyTitle}) and a genre (${categoryName}), generate a creative story plot that aligns with the given title and genre, ensuring it does not start with a heading or title.`
    );
  } catch (error) {
    console.error('Error generating story plot:', error); // gpt_pilot_debugging_log
    console.error(error.stack);
    throw error;
  }

  console.log(`Generated unique title "${storyTitle}"`); // gpt_pilot_debugging_log

  return {
    category: categoryName,
    title: storyTitle,
    plot: storyPlot
  };
}

module.exports = generateStoryElements;