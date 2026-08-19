// this schema is used to keep track of the sequence value for generating unique IDs for different collections in the database. 
// It is used in conjunction with the Counter model to generate unique IDs for different collections.

const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  sequenceValue: {
    type: Number,
    default: 999,
  },
});

module.exports = mongoose.model('Counter', counterSchema);