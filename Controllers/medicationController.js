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
    const Features = new MedexFeatures(Medication.find(), req.query)
      .filter()
      .sort()
      .fields()
      .pagination();

    const medications = await Features.query; // i must not forget the await ...
    //Send Result
    res.status(200).json({
      status: "success",
      count: medications.length,
      medications,
    });
    //Catch Error
  } catch (err) {
    // console.log(err);
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
