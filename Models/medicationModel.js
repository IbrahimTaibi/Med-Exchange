const mongoose = require("mongoose");
const fs = require("fs");

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
    createdBy: {
      type: String,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

// mongoose middleware "Pre"
medicationSchema.pre("save", function (next) {
  const today = new Date();
  if (this.expiryDate <= today) {
    this.expired = true;
  } else this.expired = false;
  this.createdBy = "Ibrahim Taibi";
  next();
});

// Dont show expired medicaments

medicationSchema.pre(/^find/, function (next) {
  this.find({ expired: false });
  this.startTime = new Date();
  next();
});

medicationSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { expired: false } });
  next();
});

// mongoose middleware "Post"

medicationSchema.post(/^find/, function (docs, next) {
  this.find({ expired: false });
  this.endTime = new Date();
  let content = `Search : A new search operation has took ${
    this.endTime - this.startTime
  } ms\n `;
  fs.writeFile("./Log/log.txt", content, { flag: "a" }, (e) => {
    console.log(e);
  });
  next();
});

medicationSchema.post("save", function (doc, next) {
  let content = `Creation : A new medication with the name ${doc.name} has been created by ${doc.createdBy}\n`;
  fs.writeFile("./Log/log.txt", content, { flag: "a" }, (e) => {
    console.log(e);
  });
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
