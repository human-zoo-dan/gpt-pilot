const { connectDB } = require('./db');
const { fetchCategories, fetchStories } = require('./fetchData');

// Start App
const startApp = async() => {
  await connectDB();
  const categories = await fetchCategories();
  const stories = await fetchStories();
  console.log(categories, stories);
};

startApp();