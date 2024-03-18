// Require the necessary libraries
const mongoose = require("mongoose");

// Function to connect to the database
const connectToDB = async () => {
  const dbUri = "mongodb://newProvidedConnectionString";  // the new connection string
  try {
    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to the database successfully");
  } catch (error) {
    console.error("Error in database connection:");
    console.error(error.message);
    console.error(error.stack);
  }
};

// Call the function to establish connection
connectToDB();

// .. rest of the code goes here ..