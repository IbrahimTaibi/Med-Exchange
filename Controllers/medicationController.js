const Medication = require("../Models/medicationModel");
const GlobalError = require("../Utils/ErrorClass");
const MedexFeatures = require("./../Utils/medexFeatures");

// Middleware for highest strength
exports.HighestStrength = (req, res, next) => {
  (req.query.limit = "5"), (req.query.sort = "-strength");
  next();
};

// Get All medications
exports.getMedications = async (req, res) => {
  try {
    const Features = new MedexFeatures(Medication.find(), req.query)
      .filter()
      .sort()
      .fields()
      .paginate();

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
// Testing Aggregation
exports.medicationsStats = async (req, res) => {
  try {
    const stats = await Medication.aggregate([
      {
        $group: {
          _id: "$indication",
          averageQuantity: { $avg: "$quantity" },
          maxQuantity: { $max: "$quantity" },
          minQuantity: { $min: "$quantity" },
          expiryDate: { $max: "$expiryDate" },
          count: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json({
      status: "succes",
      length: stats.length,
      stats,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.medicationByIndication = async (req, res) => {
  try {
    const indication = req.params.indication;
    const medications = await Medication.aggregate([
      { $unwind: "$indication" },
      {
        $group: {
          _id: "$indication",
          medicationCount: { $sum: 1 },
          medications: { $push: "$name" },
        },
      },
      { $addFields: { indication: "$_id" } },
      { $project: { _id: 0 } },
      { $match: { indication: indication } },
    ]);

    // let filteredMedication = medications.filter((el) => {
    //   return el.indication === indication;
    // });
    res.status(200).json({
      status: "succes",
      length: medications.length,
      medications,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

// Error Page not found

exports.pageNotFound = (req, res, next) => {
  // res.status(404).json({
  //   status: "fail",
  //   message: "Page Not found",
  // });
  const err = new GlobalError(
    `Can't find ${req.originalUrl} in our application`,
    404,
  );
  next(err);
};

// Error Global Middleware
