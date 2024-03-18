const axios = require('axios');
const mongoose = require('mongoose');
const chai = require('chai');
const expect = chai.expect;
const mocha = require('mocha');
const { deleteWPStoriesById } = require('../syncStories');
const Story = require('../models/Story');

const axiosInstance = axios.create({
  baseURL: process.env.STORY_BLOOM_WORDPRESS_WP_BASEURL,
  headers: {
    'Authorization': `Basic ${Buffer.from(`${process.env.STORY_BLOOM_WORDPRESS_WP_USERNAME}:${process.env.STORY_BLOOM_WORDPRESS_WP_PASSWORD}`, 'utf8').toString('base64')}`
  }
});

mocha.describe('deleteWPStoriesById Function Test', () => {
  mocha.it('should delete story in WordPress if it does not exist in MongoDB', async () => {
    await mongoose.connect(process.env.STORY_BLOOM_WORDPRESS_MONGODB_CONNECTIONSTRING, { dbName: process.env.STORY_BLOOM_WORDPRESS_MONGODB_DBNAME });
    const story = await Story.findOne();
    await Story.deleteOne({ _id: story._id });
    await deleteWPStoriesById(story._id);
    const response = await axiosInstance.get(`/posts/${story._id}`);
    expect(response.data).to.be.null;
    await mongoose.disconnect();
  });

  mocha.it('should return an error if the story to be deleted does not exist in WordPress', async () => {
    const fakeId = mongoose.Types.ObjectId();
    try {
      await deleteWPStoriesById(fakeId);
    } catch (error) {
      expect(error.message).to.equal(`Failed to delete the post with ID ${fakeId}`);
    }
  });
});