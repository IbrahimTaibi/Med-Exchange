const mongoose = require("mongoose");
const Medication = require("../Models/medicationModel");
const MedexFeatures = require("./../Utils/medexFeatures");

// Middleware for highest strength
exports.HighestStrength = (req, res, next) => {
  (req.query.limit = "5"), (req.query.sort = "-strength");
  next();
};

// Get All medications
exports.getMedications = async (req, res) => {
  try {
    /* Excluding these fields from the req.query 
    without modifying the req.query itself -----
    a middleware in some way */
    // FILTRING
    const Features = new MedexFeatures(Medication.find(), req.query);
    let query = Features.filter();
    // const excludedArray = ["sort", "page", "limit", "fields"];
    // const shallowCopy = { ...req.query };
    // excludedArray.forEach((el) => {
    //   delete shallowCopy[el];
    // });
    // // console.log(shallowCopy);
    // let queryStr = JSON.stringify(shallowCopy);
    // // console.log(queryStr);
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => {
    //   return `$${match}`;
    // });
    // // console.log(queryStr);
    // const queryObj = JSON.parse(queryStr);
    // // console.log(queryObj);
    // // Sorting the data using the original query in the request --

    // let query = Medication.find(queryObj);

    // SORTING

    // if (req.query.sort) {
    //   let sortBy = req.query.sort.split(",").join(" ");
    //   // console.log(sortBy);
    //   query = query.sort(sortBy);
    // } else {
    //   query = query.sort("createdAt");
    // }

    // // Filering Fields
    // if (req.query.fields) {
    //   let fields = req.query.fields.split(",").join(" ");
    //   query = query.select(fields - "strength");
    // } else {
    //   query = query.select("-__v");
    // }

    // // Pagination

    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 10;
    // const skip = (page - 1) * limit;

    // query = query.skip(skip).limit(limit);

    // if (req.query.page) {
    //   const medicationCount = await Medication.countDocuments();
    //   if (medicationCount <= skip) {
    //     throw new Error("Page not found");
    //   }
    // }
    const medications = await query.query; // i must not forget the await ...
    //Send Result

    res.status(200).json({
      status: "success",
      count: medications.length,
      medications,
    });
    //Catch Error
  } catch (err) {
    console.log(err);
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

// Get medication by ID
exports.getMedicationById = async (req, res) => {
  try {
    const medicationById = await Medication.findById(req.params.id); // i must not forget the await ...
    //Send Result
    res.status(200).json({
      status: "success",
      medicationById,
    });
    //Catch Error
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};
// Add new medication
exports.addNewMedication = async (req, res) => {
  try {
    const newMedication = await Medication.create(req.body); // i must not forget the await ...

    //Send Result
    res.status(201).json({
      status: "success",
      newMedication,
    });
    //Catch Error
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// Update Medicaiton
exports.updateMedication = async (req, res) => {
  try {
    const medicationToUpdate = await Medication.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    ); // i must not forget the await ...
    res.status(200).json({
      status: "success",
      medicationToUpdate,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// Delete Medication
exports.deleteMedication = async (req, res) => {
  try {
    const medicationToDelete = await Medication.findByIdAndDelete(
      req.params.id,
    ); // i must not forget the await ...
    res.status(200).json({
      status: "success",
      medicationToDelete,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
