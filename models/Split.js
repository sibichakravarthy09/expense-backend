const mongoose = require('mongoose');

const splitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  color: {
    type: String,
    default: '#3498db'
  }
}, { timestamps: true });

module.exports = mongoose.model('Split', splitSchema);
