# Story-Bloom-OpenAI 

This is a Node.js application that interacts with MongoDB and also utilizes OpenAI's GPT-3 AI model to automatically generate diverse storytelling content with various categories.

## Overview

Built on Node.js framework this application makes use of MongoDB for storing all the generated content. OpenAI's API is used to generate the stories and each unique element in these stories. The application consists of several key scripts that handle tasks like connecting to MongoDB (`db/connection.js`), generating story categories (`generateCategory.js`), creating elements like title and plot for these stories (`generateStoryElements.js`), and saving these generated stories to the MongoDB database (`saveStory.js`).

## Features

The application has the ability to:

- Generate diverse and unique categories using AI.
- Create enthralling and engaging story titles based on the category that was selected.
- Construct an appealing and enticing story plot that aligns with the story's title and its category.

## Getting Started

### Requirements

To run the application, you would need Node.js and MongoDB installed on your machine. You would also need an OpenAI API Key. Moreover, a stable internet connection is required.

### Quickstart

- First, clone the repository to a preferred directory.
- After cloning, run `npm install` to fetch all the necessary dependencies.
- Once the above step is completed without any errors, replace the placeholders in the `.env` file with your actual MongoDB Connection String, OpenAI API URL, OpenAI API Key, your preferred OpenAI Model, the maximum tokens allowed for OpenAI API request, the preferred database name and the app port.
- Once all of the replacements are done correctly, run `node main.js` to spin up the application.

## License

The software is proprietary and is copyright. It comes without any warranty, expressed or implied, of any kind. There's no warranty of merchantability, fitness for a specific purpose, title, and non-infringement. In no event shall the authors or copyright holders be held liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from the software or the use or other dealing in the software.