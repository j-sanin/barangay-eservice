const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  documentType: {
    type: String,
    required: true,
    enum: [
      'barangay_clearance',
      'certificate_residency',
      'certificate_indigency',
      'business_permit',
      'barangay_id',
      'cedula',
      'good_moral',
      'facade_permit',
      'blotter_clearance',
      'death_cert',
      'marriage_contract',
      'transfer_residency',
    ],
  },
  purpose:     { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'approved', 'completed', 'rejected'],
    default: 'pending',
  },
  remarks:     { type: String, default: '' },
  releaseDate: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
