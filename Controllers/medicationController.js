const Medication = require("../Models/medicationModel");
const GlobalError = require("../Utils/ErrorClass");
const MedexFeatures = require("./../Utils/medexFeatures");

// Middleware for highest strength
exports.HighestStrength = (req, res, next) => {
  (req.query.limit = "5"), (req.query.sort = "-strength");
  next();
};

// Asynchronus Error handling
const asyncErrorHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
    // next();
  };
};
// Get All medications
exports.getMedications = asyncErrorHandler(async (req, res) => {
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
});

// Get medication by ID
exports.getMedicationById = asyncErrorHandler(async (req, res) => {
  const medicationById = await Medication.findById(req.params.id); // i must not forget the await ...
  //Send Result
  res.status(200).json({
    status: "success",
    medicationById,
  });
  //Catch Error
});

// Add new medication
exports.addNewMedication = asyncErrorHandler(async (req, res) => {
  const newMedication = await Medication.create(req.body); // i must not forget the await ..
  res.status(201).json({
    status: "success",
    newMedication,
  });
});

// Update Medicaiton
exports.updateMedication = asyncErrorHandler(async (req, res) => {
  const medicationToUpdate = await Medication.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  ); // i must not forget the await ...
  res.status(200).json({
    status: "success",
    medicationToUpdate,
  });
});

// Delete Medication
exports.deleteMedication = asyncErrorHandler(async (req, res) => {
  const medicationToDelete = await Medication.findByIdAndDelete(req.params.id); // i must not forget the await ...
  res.status(200).json({
    status: "success",
    medicationToDelete,
  });
});
// Testing Aggregation
exports.medicationsStats = asyncErrorHandler(async (req, res) => {
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
});

exports.medicationByIndication = asyncErrorHandler(async (req, res) => {
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
  res.status(200).json({
    status: "succes",
    length: medications.length,
    medications,
  });
});

// Error Page not found

exports.pageNotFound = (req, res, next) => {
  const err = new GlobalError(
    `Can't find ${req.originalUrl} in our application`,
    404,
  );
  next(err);
};
