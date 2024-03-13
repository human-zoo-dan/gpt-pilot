
async function saveStory(db, storyElements) {
  const stories = db.collection('Stories');
  const story = {...storyElements, created_at: new Date()};
  const {insertedId} = await stories.insertOne(story);

  if(insertedId) {
    console.log(`Story saved successfully with ID: ${insertedId}`);
  } else {
    console.error('Failed to save story.'); // gpt_pilot_debugging_log
    throw new Error('SaveError: Failed to save story to database.');
  }
}

module.exports = saveStory;
