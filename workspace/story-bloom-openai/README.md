# Story-Bloom-OpenAI

Story-Bloom-OpenAI is a Node.js application script that utilizes MongoDB and OpenAI's GPT-3 model to generate and store storytelling content. The app is designed to stimulate creative writing and support various genres of storytelling on digital platforms.

## Overview

The app interacts with a MongoDB database for storage and uses the OpenAI API to generate various components of a story, including categories, titles, and plots. Furthermore, the app’s structure follows the module pattern, encapsulating each function into its distinct module. This makes the code maintainable, scalable, and aids in easy deployments with Docker.

## Features

The app generates unique and captivating stories in a simplified format. The process involves:

1. Generation of a unique category for a story.
2. Creation of a compelling title.
3. Construction of an engaging plot.
4. Combining all these elements and storing them as complete stories in MongoDB for future reference.

## Getting Started

### Requirements

To effectively run this project, you'll need:

1. Node.js
2. MongoDB
3. OpenAI API Key

### Quickstart

- Clone this repository.
- Install the dependencies by running `npm install` in the terminal.
- Create a `.env` file at the project root and fill in the appropriate keys according to the `.env.example` file.
- Start the application by entering 'npm start' in the command line interface.

Now, the Story-Bloom-OpenAI is ready to serve unique and engaging stories.

### License

Copyright (c) 2024. This project is proprietary and not open-source.