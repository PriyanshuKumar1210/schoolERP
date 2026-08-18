const mongoose = require('mongoose');

const feeStructureSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    standard: {
      type: String,
      required: [true, 'Standard is required'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total Fee Amount is required'],
    },
    totalMonths: {
      type: Number,
      default: 12,
    },
    totalInstallments: {
      type: Number,
      default: 4,
    },
    academicYear: {
      type: String,
      default: '',
    },
    q1Amount: {
      type: Number,
      required: true,
    },
    q2Amount: {
      type: Number,
      required: true,
    },
    q3Amount: {
      type: Number,
      required: true,
    },
    q4Amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

feeStructureSchema.index({ schoolId: 1, standard: 1 }, { unique: true });

module.exports = mongoose.model('FeeStructure', feeStructureSchema);
