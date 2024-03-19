const chai = require('chai');
const chaiHttp = require('chai-http');
const syncStories = require('../syncStories').syncStories;
const syncCategories = require('../syncCategories').syncCategories;
const { expect } = chai;
chai.use(chaiHttp);
const mongoose = require('mongoose');
const Story = require('../models/Story');
const axiosInstance = axios.create({ baseURL: process.env.STORY_BLOOM_WORDPRESS_WP_BASEURL });
const { deleteWPStoriesMissingInDB, getWpStories } = require('../syncStories');

const { AllHtmlEntities } = require('html-entities');
const entities = new AllHtmlEntities();

describe('syncStories Function Test', () => {
    it('Story synchronization should occur without error', (done) => {
        syncStories()
            .then(() => {
                done();
            })
            .catch((err) => {
                done(err);
            });
    });
});

describe('syncCategories Function Test', () => {
    it('Category synchronization should occur without error', (done) => {
        syncCategories()
            .then(() => {
                done();
            })
            .catch((err) => {
                done(err);
            });
    });
});

describe('createWPStory Function Test', () => {
    it('Should create a story in WP when a new story is created in MongoDB', async () => {
        const newStory = new Story({
            category: 'New Category',
            title: 'New Story',
            plot: 'New Story Plot',
            created_at: new Date()
        });
        await new Promise(resolve => setTimeout(resolve, 5000));
        const response = await axiosInstance.get(`${baseURL}/posts?search=${entities.encode(newStory.title)}`);
        expect(response.data[0].title).to.equal(entities.encode(newStory.title));
    });
});

describe('updateWPStory Function Test', () => {
    it('Should update a story in WP when a story is updated in MongoDB', async () => {
        const updatedStory = await Story.findOne();
        updatedStory.title = 'Updated Title';
        await updatedStory.save();
        await syncStories();
        await new Promise(resolve => setTimeout(resolve, 5000));
        const response = await axiosInstance.get(`${baseURL}/posts?search=${entities.encode(updatedStory.title)}`);
        expect(response.data[0].title).to.equal(entities.encode(updatedStory.title));
    });
});

describe('deleteWPStoriesById Function Test', () => {
    it('Should delete a story in WP when a story is deleted in MongoDB', async () => {
        const deleteStory = await Story.findOne();
        const deleteId = deleteStory.id;
        await Story.deleteOne({_id: deleteId});
        await deleteWPStoriesById(deleteId);
        await new Promise(resolve => setTimeout(resolve, 5000));
        const response = await axiosInstance.get(`${baseURL}/posts/${deleteId}`);
        expect(response.data).to.be.null;
    });
});

describe('deleteWPStoriesMissingInDB Function Test', () => {
  it('should delete story in WordPress if it does not exist in MongoDB', async () => {
    await mongoose.connect(process.env.STORY_BLOOM_WORDPRESS_MONGODB_CONNECTIONSTRING, { dbName: process.env.STORY_BLOOM_WORDPRESS_MONGODB_DBNAME });
    const story = await Story.findOne();
    await Story.deleteOne({ _id: story._id });

    const wpStories = await getWpStories();
    await deleteWPStoriesMissingInDB(wpStories);

    const response = await axiosInstance.get(`/posts/?search=${entities.encode(story.title)}`);
    expect(response.data.length).to.equal(0);

    await mongoose.connection.close();
  });
});