console.log('Loading index module...');

const axios = require('axios');
const winston = require('./winston');
const syncCategories = require('./syncCategories').syncCategories;  
const syncStories = require('./syncStories').syncStories;  

console.log('Required modules loaded.');

const wpUsername = process.env.STORY_BLOOM_WORDPRESS_WP_USERNAME;
const wpPassword = process.env.STORY_BLOOM_WORDPRESS_WP_PASSWORD;
const baseURL = process.env.STORY_BLOOM_WORDPRESS_WP_BASEURL;

console.log("Base URL for WordPress is:", baseURL);
console.log("WP Username is:", wpUsername);
console.log("WP Password is:", wpPassword);

const authenticateWP = async () => {
  winston.loggers.get('index').info('Authenticating with WP instance.');
  try {
    const auth = 'Basic ' + Buffer.from(wpUsername + ':' + wpPassword, 'utf8').toString('base64');
    const response = await axios.get(`${baseURL}/users/me`, {
      headers: {
        'Authorization': auth
      }
    });
    const isValidAuthentication = (response && response.status === 200);
    winston.loggers.get('index').info(isValidAuthentication ? 'Authentication successful.' : 'Authentication failed.');
    return isValidAuthentication;
  } catch (error) {
    winston.error('Authentication error: ', error.message);
    return false;
  }
}

async function startSync() {
  try {
    console.log('Calling startSync...');
    const authenticationSuccessful = await authenticateWP();
    if (!authenticationSuccessful) {
      return;
    }

    winston.loggers.get('index').info('Started execution of categories script.');
    await syncCategories();  
    winston.loggers.get('index').info('Categories script execution completed successfully.');

    winston.loggers.get('index').info('Started execution of stories script.');
    await syncStories();
    winston.loggers.get('index').info('Stories script execution completed successfully.');
  } catch (error) {
    winston.loggers.get('index').error(`Synchronization error: ${error.message}\n ${error.stack}`);
  }
}

console.log('Triggering startSync...');

startSync();

console.log('startSync triggered.');