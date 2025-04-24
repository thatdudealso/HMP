const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  question: String,
  response: Object,
  type: {
    type: String,
    enum: ['initial', 'followUp'],
    default: 'initial'
  }
});

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientInfo: {
    type: Object,
    required: true
  },
  clinicalExamination: Object,
  vitals: Object,
  interactions: [interactionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
sessionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Session', sessionSchema); 