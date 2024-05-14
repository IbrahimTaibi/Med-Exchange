const express = require("express");
const medicationController = require("../Controllers/medicationController");
const router = express.Router();

router
  .route("/medication-by-indication/:indication")
  .get(medicationController.medicationByIndication);

router.route("/medication-stats").get(medicationController.medicationsStats);

router
  .route("/highest-strength")
  .get(
    medicationController.HighestStrength,
    medicationController.getMedications,
  );

router
  .route("/")
  .get(medicationController.getMedications)
  .post(medicationController.addNewMedication);

router
  .route("/:id")
  .get(medicationController.getMedicationById)
  .patch(medicationController.updateMedication)
  .delete(medicationController.deleteMedication);

module.exports = router;
