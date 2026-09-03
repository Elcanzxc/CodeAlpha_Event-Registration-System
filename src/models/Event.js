const mongoose = require('mongoose');
const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Technology', 'Business', 'Design', 'Music', 'Sports', 'Workshop', 'Other'],
      default: 'Other'
    },
    date: {
      type: Date,
      required: [true, 'Event date and time is required']
    },
    location: {
      type: String,
      required: [true, 'Location or Online link is required'],
      trim: true
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity (total seats) is required'],
      min: [1, 'Capacity must be at least 1']
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: 0
    },
    price: {
      type: Number,
      default: 0, 
      min: [0, 'Price cannot be negative']
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80'
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['upcoming', 'cancelled', 'completed'],
      default: 'upcoming'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

eventSchema.virtual('availableSeats').get(function () {
  return Math.max(0, this.capacity - this.registeredCount);
});
module.exports = mongoose.model('Event', eventSchema);