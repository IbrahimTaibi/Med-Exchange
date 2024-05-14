const mongoose = require("mongoose");
const Medication = require("../Models/medicationModel");

// Get All medications
exports.getMedications = async (req, res) => {
  try {
    const medications = await Medication.find(); // i must not forget the await ...
    //Send Result
    res.status(200).json({
      status: "success",
      count: medications.length,
      medications,
    });
    //Catch Error
  } catch (err) {
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
