const mongoose = require('mongoose');

const CareerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  requiredSkills: {
    type: [String],
    default: []
  },
  recommendedCourses: {
    type: [String],
    default: []
  },
  averageSalary: {
    type: String,
    default: ''
  },
  jobDemand: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  }
});

module.exports = mongoose.model('Career', CareerSchema);