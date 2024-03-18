# Story-Bloom-WordPress

Story-Bloom-WordPress is a Node.js script designed for synchronizing data between a MongoDB database and a self-hosted WordPress instance. The script operates in a read-only mode for MongoDB but has full access to WordPress. Since the MongoDB database serves as the source of truth, the script mirrors its changes to WordPress, including creating, updating, and deleting of categories and posts.

## Overview

The 'index.js' serves as the entrance to the application, calling 'syncStories.js' and 'syncCategories.js' scripts while handling the authentication process for the WordPress API and logging mechanisms. These scripts use a combination of Axios for HTTP requests, Mongoose for MongoDB object modeling, and Winston for logging. Error handling, data security measures and API rate limiting are in place for robust script execution.

Separate 'models' directory files define the MongoDB schema for the 'Categories' and 'Stories' collections. Files under the 'config' directory set up Mongoose with MongoDB and Winston for different types of log outputs.

Finally, the '.env' file holds environment variables, which include sensitive data such as API keys and login credentials.

## Features

- One-way synchronization from MongoDB to WordPress
- Efficient handling of large datasets with comparison methods
- Conflict resolution by deleting the conflicting WordPress item and re-uploading it from MongoDB
- Error handling and logging mechanisms, storing full logs in a separate log file while keeping console log output compressed

## Getting started

### Requirements

- Node.js
- A MongoDB instance
- A self-hosted WordPress instance

### Quickstart

Clone the repository and install dependencies:

    git clone <repository_url>
    cd story-bloom-wordpress
    npm install

Create a '.env' file in the root directory and fill it with your environment variables using '.env.example' as a template.

Run the script:

    npm start

### License

This project is proprietary and not open for distribution.

Copyright (c) 2024.