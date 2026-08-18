const mongoose = require('mongoose');

const studentFeeSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    q1Status: {
      type: String,
      enum: ['Paid', 'Pending'],
      default: 'Pending',
    },
    q2Status: {
      type: String,
      enum: ['Paid', 'Pending'],
      default: 'Pending',
    },
    q3Status: {
      type: String,
      enum: ['Paid', 'Pending'],
      default: 'Pending',
    },
    q4Status: {
      type: String,
      enum: ['Paid', 'Pending'],
      default: 'Pending',
    },
    q1PaidDate: {
      type: Date,
    },
    q2PaidDate: {
      type: Date,
    },
    q3PaidDate: {
      type: Date,
    },
    q4PaidDate: {
      type: Date,
    },
    paidInstallments: {
      type: [Number],
      default: [],
    },
    paidDates: {
      type: Map,
      of: Date,
      default: {},
    },
  },
  { timestamps: true }
);

studentFeeSchema.index({ schoolId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('StudentFee', studentFeeSchema);
