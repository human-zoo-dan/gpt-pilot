const axios = require('axios');
const winston = require('./winston');
const syncCategories = require('./syncCategories');
const syncStories = require('./syncStories');

const wpUsername = process.env.STORY_BLOOM_WORDPRESS_WP_USERNAME;
const wpPassword = process.env.STORY_BLOOM_WORDPRESS_WP_PASSWORD;
const baseURL = process.env.STORY_BLOOM_WORDPRESS_WP_BASEURL;

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
   const authenticationSuccessful = await authenticateWP();
   if(!authenticationSuccessful) {
     return;
   }

   winston.loggers.get('index').info('Started categories synchronization.');
   await syncCategories();
   winston.loggers.get('index').info('Finished categories synchronization.');

//    winston.loggers.get('index').info('Started stories synchronization.');
//    await syncStories();
//    winston.loggers.get('index').info('Finished stories synchronization.');

 } catch(error) {
   winston.loggers.get('index').error(`Synchronization error: ${error.message}\n ${error.stack}`);
 }
}

startSync();