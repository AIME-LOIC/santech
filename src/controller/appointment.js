import Appointment from "../database/models/appointments.js";
import DoctorAvailability from "../database/models/doctorAvailability.js";
import User from "../database/models/users.js";

/** Compare slots loosely: trims and treats "14:00 - 15:00" same as "14:00-15:00". */
const normalizeSlotKey = (value) => {
  if (value == null) return "";
  return String(value)
    .trim()
    .replace(/\s*-\s*/g, "-")
    .replace(/\s+/g, " ");
};

const parseSlotArray = (raw) => {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const isUuidLike = (value) =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim()
  );

/** Returns the doctor's canonical slot string if request matches, else null. */
const resolvePatientSlot = (requestedTime, availabilityRows) => {
  const wanted = normalizeSlotKey(requestedTime);
  if (!wanted) return null;
  for (const row of availabilityRows) {
    for (const slot of parseSlotArray(row.availableTimeSlots)) {
      if (normalizeSlotKey(slot) === wanted) {
        return String(slot).trim();
      }
    }
  }
  return null;
};

const canViewAppointment = (user, appointment) => {
  if (user.role === "admin") return true;
  if (user.role === "doctor" && appointment.doctorId === user.id) return true;
  if (user.role === "patient" && appointment.patientId === user.id) return true;
  return false;
};

const isDoctorForAppointment = (user, appointment) =>
  user.role === "admin" ||
  (user.role === "doctor" && appointment.doctorId === user.id);

export const listAppointments = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    let where = {};

    if (role === "doctor") {
      where.doctorId = userId;
    } else if (role === "patient") {
      where.patientId = userId;
    } else if (role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const appointments = await Appointment.findAll({
      where,
      order: [["appointmentDate", "ASC"], ["appointmentTime", "ASC"]],
    });
    return res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getAppointmentById = async (req, res) => {
  const { id } = req.params;
  try {
    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    if (!canViewAppointment(req.user, appointment)) {
      return res.status(403).json({ message: "Access denied" });
    }
    return res.status(200).json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const createAppointment = async (req, res) => {
  const { doctorId, patientId, appointmentDate, appointmentTime, status } =
    req.body;

  try {
    if (!doctorId || !appointmentDate || appointmentTime == null || appointmentTime === "") {
      return res.status(400).json({
        error: "doctorId, appointmentDate, and appointmentTime are required",
      });
    }

    let resolvedPatientId = patientId;
    let resolvedStatus = status;
    let resolvedTime = appointmentTime;
    let resolvedAppointmentDate = appointmentDate;

    if (req.user.role === "patient") {
      resolvedPatientId = req.user.id;
      if (patientId && patientId !== req.user.id) {
        return res.status(403).json({
          message: "Patients can only book appointments for themselves",
        });
      }
      if (resolvedStatus && resolvedStatus !== "pending") {
        return res.status(403).json({
          message: "Patients cannot set appointment status",
        });
      }
      resolvedStatus = "pending";

      const doctor = await User.findByPk(doctorId);
      if (!doctor || doctor.role !== "doctor") {
        return res.status(400).json({ error: "Invalid or inactive doctor" });
      }

      let resolvedDate = appointmentDate;
      let availabilityRows = [];

      // Allow passing a DoctorAvailability row id in appointmentDate.
      if (isUuidLike(appointmentDate)) {
        const availabilityById = await DoctorAvailability.findByPk(
          appointmentDate
        );
        if (!availabilityById || availabilityById.doctorId !== doctorId) {
          return res.status(400).json({
            error:
              "appointmentDate as docava id must reference an availability row for this doctor",
          });
        }
        resolvedDate = availabilityById.availableDate;
        availabilityRows = [availabilityById];
      } else {
        availabilityRows = await DoctorAvailability.findAll({
          where: { doctorId, availableDate: appointmentDate },
        });
      }

      if (!availabilityRows.length) {
        return res.status(400).json({
          error: "Doctor has no published availability on this date",
        });
      }
      const matchedSlot = resolvePatientSlot(appointmentTime, availabilityRows);
      if (!matchedSlot) {
        const allowedSlots = availabilityRows.flatMap((row) =>
          parseSlotArray(row.availableTimeSlots)
        );
        return res.status(400).json({
          error:
            "appointmentTime must match one of the doctor's slots for this date (spacing around '-' is ignored)",
          allowedSlots,
        });
      }
      resolvedTime = matchedSlot;
      resolvedAppointmentDate = resolvedDate;
    } else if (req.user.role === "admin") {
      if (!resolvedPatientId) {
        return res.status(400).json({ error: "patientId is required" });
      }
      resolvedStatus = resolvedStatus || "pending";
    }

    const appointment = await Appointment.create({
      doctorId,
      patientId: resolvedPatientId,
      appointmentDate: resolvedAppointmentDate,
      appointmentTime: resolvedTime,
      status: resolvedStatus,
    });
    return res.status(201).json(appointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateAppointment = async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };
  delete updates.id;
  try {
    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    await appointment.update(updates);
    return res.status(200).json(appointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const approveAppointment = async (req, res) => {
  const { id } = req.params;
  try {
    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    if (!isDoctorForAppointment(req.user, appointment)) {
      return res.status(403).json({ message: "Access denied" });
    }
    if (appointment.status !== "pending") {
      return res.status(400).json({
        error: "Only pending appointments can be approved",
      });
    }
    await appointment.update({ status: "scheduled" });
    return res.status(200).json(appointment);
  } catch (error) {
    console.error("Error approving appointment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const cancelAppointment = async (req, res) => {
  const { id } = req.params;
  try {
    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    if (!isDoctorForAppointment(req.user, appointment)) {
      return res.status(403).json({ message: "Access denied" });
    }
    if (["completed", "cancelled"].includes(appointment.status)) {
      return res.status(400).json({
        error: "This appointment cannot be cancelled",
      });
    }
    await appointment.update({ status: "cancelled" });
    return res.status(200).json(appointment);
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteAppointment = async (req, res) => {
  const { id } = req.params;
  try {
    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    await appointment.destroy();
    return res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
