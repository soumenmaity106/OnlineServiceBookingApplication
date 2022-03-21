const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const addressSchema = mongoose.Schema(
  {
    address_for: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    address_default: {
      type: Number,
      enum: [1, 2],
      default: 2,
    },
    street_address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    postal_code: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
addressSchema.plugin(toJSON);

/**
 * @typedef Address
 */
const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
