const mongodb = require('mongodb');

async function generateStoryElements(db, generateContent, currentCategoryId) {
  const categories = db.collection('Categories');
  const category = await categories.findOne({ _id: new mongodb.ObjectId(currentCategoryId) });

  const storyTitle = await generateContent(
    `Generate a compelling title for a story falling under the ${category.name} genre, ensuring it captures the essence of the narrative and intrigues potential readers.`
  ).catch(error => {
    console.error('Error generating story title:', error); 
    console.error(error.stack);
    throw error;
  });

  const storyPlot = await generateContent(
    `Given a specific title (${storyTitle}) and a genre (${category.name}), generate a creative story plot that aligns with the given title and genre, ensuring it does not start with a heading or title.`
  ).catch(error => {
    console.error('Error generating story plot:', error); 
    console.error(error.stack);
    throw error;
  });

  return {
    category: category.name,
    title: storyTitle,
    plot: storyPlot
  };
}

module.exports = generateStoryElements;