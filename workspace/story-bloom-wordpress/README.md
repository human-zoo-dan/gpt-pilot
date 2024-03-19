# Story-Bloom-WordPress

Story-Bloom-WordPress is a script developed in Node.js, designed to synchronize data from a MongoDB database to a self-hosted WordPress instance. The script operates in a read-only mode for MongoDB treating it as the source of truth, and applies all corresponding changes to WordPress including creating, updating, and deleting categories and posts.

## Overview

This script is utilizing Axios for making HTTP requests, Mongoose for MongoDB object modeling, JWT for authentication, Joi for validation, and Winston for logging. A robust error handling mechanism, data security measures, and API rate limiting are all part of the system.

The script works with a MongoDB database containing two collections: 'Categories' and 'Stories', and a WordPress instance with 'Categories' and 'Posts' endpoints. A one-way sync logic has been implemented where changes in MongoDB are replicated in WordPress.

The repository contains multiple directories each with their specific purposes. The 'models' directory contains files that define the MongoDB schema for both 'Categories' and 'Stories' collections. The 'config' directory is responsible for setting up Mongoose with MongoDB and Winston loggers for different levels of log outputs. An '.env' file hosts all the environment variables including API keys, database credentials, WordPress username, and password.

## Features

- One-way synchronization from MongoDB to WordPress
- Efficient comparison method for large data sets
- Conflict resolution by deleting conflict item on WordPress and re-upload from MongoDB
- Error handling and logging mechanisms

## Getting started

### Requirements

- Node.js 
- A MongoDB instance
- A self-hosted WordPress instance

### Quickstart

Clone the repository.

```bash
    git clone <repository_url>
npm install
```
Create a '.env' file in the root directory of the project. Use the '.env.example' file as a template to fill in your environment variables.

Run the script.

```bash
npm start
```

### License

This project is proprietary and not open for distribution.

Copyright (c) 2024 - All rights reserved.