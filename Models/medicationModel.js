const mongoose = require("mongoose");
const medicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "name is a required field"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "description is a required field"],
    trim: true,
  },
  quantity: {
    type: Number,
  },
  strength: Number,
  expiryDate: {
    type: Date,
    required: [true, "expiration is a required field"],
  },
  prescription: {
    type: Boolean,
    required: [true, "prescription is a required field"],
  },
  indication: {
    type: [String],
    required: [true, "indication is a required field"],
  },
  image: String,
  route: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const Medication = mongoose.model("Medication", medicationSchema);

module.exports = Medication;
