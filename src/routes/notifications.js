import express from "express";
import protect from "../middleware/auth.js";
import { requireRoles } from "../middleware/roles.js";
import {
  getAllNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
} from "../controller/notification.js";

const router = express.Router();

// Admin gets all notifications; non-admin gets their own notifications
router.get("/api/notifications", protect, getAllNotifications);
router.get("/api/notifications/:id", protect, getNotificationById);

// Only admin can create arbitrary notifications
router.post(
  "/api/notifications",
  protect,
  requireRoles("admin"),
  createNotification
);

// Owner can mark read/unread; admin can update anything
router.patch("/api/notifications/:id", protect, updateNotification);

// Owner can delete their notification; admin can delete any
router.delete("/api/notifications/:id", protect, deleteNotification);

export default router;

