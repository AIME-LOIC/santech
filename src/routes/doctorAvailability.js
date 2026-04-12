import express from "express";
import protect from "../middleware/auth.js";
import { requireRoles } from "../middleware/roles.js";
import {
  listDoctorAvailability,
  getDoctorAvailabilityById,
  createDoctorAvailability,
  updateDoctorAvailability,
  deleteDoctorAvailability,
} from "../controller/doctorAvailability.js";

const router = express.Router();

router.get("/api/doctor-availability", protect, listDoctorAvailability);
router.get("/api/doctor-availability/:id", protect, getDoctorAvailabilityById);
router.post(
  "/api/doctor-availability",
  protect,
  requireRoles("doctor", "admin"),
  createDoctorAvailability
);
router.put(
  "/api/doctor-availability/:id",
  protect,
  requireRoles("doctor", "admin"),
  updateDoctorAvailability
);
router.delete(
  "/api/doctor-availability/:id",
  protect,
  requireRoles("doctor", "admin"),
  deleteDoctorAvailability
);

export default router;
