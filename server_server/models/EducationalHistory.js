const mongoose = require('mongoose');

const educationalHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  prompt: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  agentType: {
    type: String,
    required: true,
    enum: ['professor_ai', 'senior_technician_ai']
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  type: {
    type: String,
    required: true,
    default: 'educational'
  }
});

module.exports = mongoose.model('EducationalHistory', educationalHistorySchema); 