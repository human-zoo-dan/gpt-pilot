const mongoose = require('../config/mongoose');

const StorySchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  category: String,
  title: {
    type: String,
    unique: true
  },
  plot: String,
  created_at: Date
});

module.exports = mongoose.model('Story', StorySchema, 'Stories'); // gpt_pilot_debugging_log