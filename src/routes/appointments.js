import express from "express";
import protect from "../middleware/auth.js";
import { requireRoles } from "../middleware/roles.js";
import {
  listAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  approveAppointment,
  cancelAppointment,
} from "../controller/appointment.js";

const router = express.Router();

router.get("/api/appointments", protect, listAppointments);
router.get("/api/appointments/:id", protect, getAppointmentById);
router.post(
  "/api/appointments",
  protect,
  requireRoles("patient", "admin"),
  createAppointment
);
router.put(
  "/api/appointments/:id",
  protect,
  requireRoles("admin"),
  updateAppointment
);
router.patch(
  "/api/appointments/:id/approve",
  protect,
  requireRoles("doctor", "admin"),
  approveAppointment
);
router.patch(
  "/api/appointments/:id/cancel",
  protect,
  requireRoles("doctor", "admin"),
  cancelAppointment
);
router.delete(
  "/api/appointments/:id",
  protect,
  requireRoles("admin"),
  deleteAppointment
);

export default router;
