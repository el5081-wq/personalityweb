const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema(
  {
    personalityType: {
      type: String,
      required: true,
      enum: ['VISIONARY', 'PROTECTOR', 'EXPLORER', 'ACHIEVER', 'CONNECTOR', 'ANALYST', 'CREATOR', 'LEADER'],
    },
    scores: {
      type: Map,
      of: Number,
    },
    answers: [
      {
        questionId: Number,
        selectedOption: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('QuizResult', quizResultSchema);
