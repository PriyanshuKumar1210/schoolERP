const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    marks: {
      type: Number,
      required: true,
      min: 0,
    },
    outOfMarks: {
      type: Number,
      required: true,
    },
    percentage: Number,
    grade: String,
    passStatus: {
      type: String,
      enum: ['Pass', 'Fail'],
    },
    remarks: String,
    enteredBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'enteredByModel',
    },
    enteredByModel: {
      type: String,
      enum: ['User', 'Teacher'],
      default: 'Teacher',
    },
  },
  { timestamps: true }
);

marksSchema.index({ schoolId: 1, examId: 1, studentId: 1, subjectId: 1 }, { unique: true });

module.exports = mongoose.model('Marks', marksSchema);
