const Medication = require("../Models/medicationModel");
const GlobalError = require("../Utils/ErrorClass");
const MedexFeatures = require("./../Utils/medexFeatures");
const asyncErrorHandler = require("./../Utils/asyncErrorHandler");

// Middleware for highest strength
exports.HighestStrength = (req, res, next) => {
  (req.query.limit = "5"), (req.query.sort = "-strength");
  next();
};

// Get All medications
exports.getMedications = asyncErrorHandler(async (req, res, next) => {
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
});

// Get medication by ID
exports.getMedicationById = asyncErrorHandler(async (req, res, next) => {
  const medication = await Medication.findById(req.params.id); // i must not forget the await ...

  if (!medication) {
    const error = new GlobalError(
      `${req.params.id} is not a valid id : NOT FOUND`,
      404,
    );
    return next(error);
  }

  //Send Result
  res.status(200).json({
    status: "success",
    medication,
  });
  //Catch Error
});

// Add new medication
exports.addNewMedication = asyncErrorHandler(async (req, res, next) => {
  const newMedication = await Medication.create(req.body); // i must not forget the await ..
  res.status(201).json({
    status: "success",
    newMedication,
  });
});

// Update Medicaiton
exports.updateMedication = asyncErrorHandler(async (req, res, next) => {
  const medicationToUpdate = await Medication.findByIdAndUpdate(
    // i must not forget the await ...
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  );
  if (!medicationToUpdate) {
    const error = new GlobalError(
      `${req.params.id} is not a valid id : NOT FOUND`,
      404,
    );
    return next(error);
  }
  res.status(200).json({
    status: "success",
    medicationToUpdate,
  });
});

// Delete Medication
exports.deleteMedication = asyncErrorHandler(async (req, res, next) => {
  const medicationToDelete = await Medication.findByIdAndDelete(req.params.id); // i must not forget the await ...
  if (!medicationToDelete) {
    const error = new GlobalError(
      `${req.params.id} is not a valid id : NOT FOUND`,
      404,
    );
    return next(error);
  }
  res.status(200).json({
    status: "success",
    medicationToDelete,
  });
});

// Testing Aggregation
exports.medicationsStats = asyncErrorHandler(async (req, res, next) => {
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
    status: "success",
    length: stats.length,
    stats,
  });
});

exports.medicationByIndication = asyncErrorHandler(async (req, res, next) => {
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
