const mongoose = require("mongoose");
const medicationSchema = new mongoose.Schema(
  {
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
    expired: {
      type: Boolean,
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
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

// mongoose middleware
medicationSchema.pre("save", function (next) {
  const today = new Date();
  if (this.expiryDate <= today) {
    this.expired = true;
  } else this.expired = false;
  next();
});

// Define a virtual property for expiresIn
medicationSchema.virtual("expiresIn").get(function () {
  const now = new Date();
  const expiryDate = this.expiryDate;
  const expiresInMilliseconds = expiryDate - now;
  const expiresInDays = expiresInMilliseconds / (1000 * 60 * 60 * 24); // Convert  to days
  return Math.ceil(expiresInDays); // nearest day
});

const Medication = mongoose.model("Medication", medicationSchema);

module.exports = Medication;
