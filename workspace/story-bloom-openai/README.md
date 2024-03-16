# Story-Bloom-OpenAI

Story-Bloom-OpenAI is an application that uses MongoDB and OpenAI's GPT-3 to generate and store creative storytelling content. This Node.js application anchors creative writing and storytelling on digital platforms. It is designed to establish a seamless and user-friendly interaction with the system.

## Overview

The application leverages MongoDB as its data storage solution and integrates with the OpenAI API to generate various elements of a story. These include categories, story titles and plots which are consequently stored in MongoDB. The application's structure follows a module pattern where each functionality is encapsulated in its own module, thus promoting code maintainability and scalability.

The repo contains a Dockerfile for containerization, facilitating easy deployment and scaling of the application. Lastly, a `.gitignore` file is included to exclude files and directories like `node_modules`, logs, caches and environment variables which should not be tracked by Git.

## Features

The application is designed to create unique and engaging stories. It offers the following features:

1. Generates a unique category for a story.
2. Comes up with a compelling title.
3. Crafts a captivating plot.
4. Curates all these elements and stores them as a complete story in MongoDB. It can retain a collection of myriad stories over time.

## Getting Started

### Requirements

The following technologies must be installed on your machine to run this project:

1. Node.js
2. MongoDB
3. OpenAI API Key

### Quickstart

To set up the project, follow these steps:

1. Clone this repository.
2. Install the dependencies by running `npm install` in your terminal.
3. Create a `.env` file at the root of your project and fill in the appropriate values as shown in the `.env.example` file.
4. Run the application by entering `npm start` in your terminal.

The application is now up and able to create and store unique, engaging stories.

### License

Copyright (c) 2024. This project is proprietary and not open source.