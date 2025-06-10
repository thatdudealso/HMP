const mongoose = require('mongoose');

const conversationEntrySchema = new mongoose.Schema({
  timestamp: {
    type: Date,
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
  type: {
    type: String,
    enum: ['initial', 'followUp'],
    required: true
  },
  clinicalInfo: {
    patientInfo: Object,
    clinicalExamination: Object,
    presentingComplaints: Object
  }
});

const historySchema = new mongoose.Schema({
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
    required: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  patientInfo: {
    type: Object,
    required: function() {
      // Only require patientInfo for non-educational queries
      return this.agentType === 'senior_doctor_ai';
    }
  },
  clinicalExamination: Object,
  presentingComplaints: Object,
  conversationHistory: [conversationEntrySchema]
});

module.exports = mongoose.model('History', historySchema); 