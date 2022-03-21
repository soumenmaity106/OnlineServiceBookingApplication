const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const userServiceSchema = mongoose.Schema(
  {
    services_type: {
      type: String,
      enum: ['cleaning', 'gardening', 'plumbing'],
    },
    user_address: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Address',
      required: true,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    service_date: {
      type: Date,
    },
    service_start_time: {
      type: Number,
    },
    number_of_hours: {
      type: Number,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    service_status: {
      type: String,
      enum: ['open', 'accept', 'complete'],
      default: 'open',
    },
    apply_professional: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: false,
      },
    ],
    accept_professional: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userServiceSchema.plugin(toJSON);
userServiceSchema.plugin(paginate);

/**
 * @typedef UserService
 */
const UserService = mongoose.model('UserService', userServiceSchema);

module.exports = UserService;
