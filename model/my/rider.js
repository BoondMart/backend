const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  houseNumber: { type: String, required: false },
  floor: { type: String, required: false },
  area: { type: String, required: true },
  landmark: { type: String, required: false },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  isDefault: { type: Boolean, default: false },
});

const riderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone_number: { type: String, required: true, unique: true },
  vehicle_details: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: {
    type: String,
    required: false,
  },
  dateOfBirth: {
    type: Date,
    required: false,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: false,
  },
  addresses: [addressSchema],
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  reviewIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false, // Password won't be returned in queries by default
  },
  current_status: {
    type: String,
    enum: ["Available", "Busy", "Inactive", "Suspended"],
    default: "Available",
  },
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  joinDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Rider", riderSchema);
