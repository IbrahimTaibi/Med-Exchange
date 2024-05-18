const express = require("express");
const medicationController = require("../Controllers/medicationController");
const authController = require("../Controllers/authController");
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
  .post(authController.isAuthenticated, medicationController.addNewMedication);

router
  .route("/:id")
  .get(medicationController.getMedicationById)
  .patch(medicationController.updateMedication)
  .delete(
    authController.isAuthenticated,
    medicationController.deleteMedication,
  );

module.exports = router;
