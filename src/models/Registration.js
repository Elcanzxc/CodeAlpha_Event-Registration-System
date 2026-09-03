const mongoose = require('mongoose');
const crypto = require('crypto');
const registrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required']
    },
    ticketCode: {
      type: String,
      unique: true
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed'
    },
    notes: {
      type: String,
      maxlength: [200, 'Notes cannot exceed 200 characters']
    }
  },
  {
    timestamps: true
  }
);

registrationSchema.pre('save', function () {
  if (!this.ticketCode) {
    this.ticketCode = 'TKT-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  }
});

registrationSchema.index({ user: 1, event: 1, status: 1 });
module.exports = mongoose.model('Registration', registrationSchema);
