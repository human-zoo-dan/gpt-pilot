const mongoose = require('../config/mongoose');

const CategorySchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  created_at: Date
});

module.exports = mongoose.model('Category', CategorySchema, 'Categories');