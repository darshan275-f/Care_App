const mongoose = require('mongoose');

const HealthDataSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    heartRate: { type: Number, required: true },
    steps: { type: Number, required: true },
  },
  { timestamps: true }
);

HealthDataSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('HealthData', HealthDataSchema);


