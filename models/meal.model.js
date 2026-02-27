const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  ingredients: {
    type: [String],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  instructions: {
    type: [String],
    required: true,
  },
}, { timestamps: true });

const Meal = mongoose.model('Meal', mealSchema);

module.exports = Meal;
