import Appointment from "../database/models/appointments.js";
import DoctorAvailability from "../database/models/doctorAvailability.js";
import User from "../database/models/users.js";




  // Normalizes a time slot string so "14:00 - 15:00" and "14:00-15:00"
 
 
const normalizeSlot = (value) => {
  if (value == null) return "";
  return String(value).trim().replace(/\s*-\s*/g, "-").replace(/\s+/g, " ");
};


  // Safely parses availableTimeSlots, which may be stored as a JSON string
  // or already be a plain array.

const parseSlots = (raw) => {
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

// Returns true if a string looks like a UUID. 
const looksLikeUUID = (value) =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim()
  );


//   Finds the doctor's canonical slot string that matches the requested time.
//  Returns null if no match is found.
 
const findMatchingSlot = (requestedTime, availabilityRows) => {
  const wanted = normalizeSlot(requestedTime);
  if (!wanted) return null;

  for (const row of availabilityRows) {
    for (const slot of parseSlots(row.availableTimeSlots)) {
      if (normalizeSlot(slot) === wanted) return String(slot).trim();
    }
  }
  return null;
};

//  Can this user see the appointment details? 
const canViewAppointment = (user, appointment) => {
  if (user.role === "admin") return true;
  if (user.role === "doctor") return appointment.doctorId === user.id;
  if (user.role === "patient") return appointment.patientId === user.id;
  return false;
};

//  Can this user approve or cancel the appointment? 
const canManageAppointment = (user, appointment) =>
  user.role === "admin" ||
  (user.role === "doctor" && appointment.doctorId === user.id);



export const listAppointments = async (req, res) => {
  try {
    const { role, id: userId } = req.user;

    const filter = {};
    if (role === "doctor") filter.doctorId = userId;
    else if (role === "patient") filter.patientId = userId;
    else if (role !== "admin") return res.status(403).json({ message: "Forbidden" });

    const appointments = await Appointment.findAll({
      where: filter,
      order: [
        ["appointmentDate", "ASC"],
        ["appointmentTime", "ASC"],
      ],
    });

    return res.status(200).json(appointments);
  } catch (err) {
    console.error("listAppointments failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    if (!canViewAppointment(req.user, appointment)) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.status(200).json(appointment);
  } catch (err) {
    console.error("getAppointmentById failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const createAppointment = async (req, res) => {
  const { availabilityId, appointmentTime, patientId, status } = req.body;

  try {
    
    if (!availabilityId || appointmentTime == null || appointmentTime === "") {
      return res.status(400).json({
        error: "availabilityId and appointmentTime are required",
      });
    }

    if (!looksLikeUUID(availabilityId)) {
      return res.status(400).json({ error: "availabilityId must be a valid UUID" });
    }

    
    const availabilityRow = await DoctorAvailability.findByPk(availabilityId);
    if (!availabilityRow) {
      return res.status(404).json({ error: "Availability slot not found" });
    }

    const { doctorId, availableDate } = availabilityRow;

    let finalPatientId = patientId;
    let finalStatus = status;

    if (req.user.role === "patient") {
      // Patients always book for themselves
      finalPatientId = req.user.id;
      if (patientId && patientId !== req.user.id) {
        return res.status(403).json({
          message: "Patients can only book appointments for themselves",
        });
      }

      // Patients can't pre-set status — always starts as pending
      if (status && status !== "pending") {
        return res.status(403).json({ message: "Patients cannot set appointment status" });
      }
      finalStatus = "pending";

      // Confirm the doctor is still active
      const doctor = await User.findByPk(doctorId);
      if (!doctor || doctor.role !== "doctor") {
        return res.status(400).json({ error: "Invalid or inactive doctor" });
      }

      // Validate the requested time against the availability row's slots
      const matchedSlot = findMatchingSlot(appointmentTime, [availabilityRow]);
      if (!matchedSlot) {
        return res.status(400).json({
          error: "The requested time doesn't match any available slot for this availability",
          availableSlots: parseSlots(availabilityRow.availableTimeSlots),
        });
      }

      const appointment = await Appointment.create({
        doctorId,
        patientId: finalPatientId,
        appointmentDate: availableDate,
        appointmentTime: matchedSlot,
        status: finalStatus,
      });

      return res.status(201).json(appointment);

    } else if (req.user.role === "admin") {
      if (!finalPatientId) {
        return res.status(400).json({ error: "patientId is required" });
      }

      finalStatus = finalStatus || "pending";

      // Admins also get slot validation to keep data consistent
      const matchedSlot = findMatchingSlot(appointmentTime, [availabilityRow]);
      if (!matchedSlot) {
        return res.status(400).json({
          error: "The requested time doesn't match any available slot for this availability",
          availableSlots: parseSlots(availabilityRow.availableTimeSlots),
        });
      }

      const appointment = await Appointment.create({
        doctorId,
        patientId: finalPatientId,
        appointmentDate: availableDate,
        appointmentTime: matchedSlot,
        status: finalStatus,
      });

      return res.status(201).json(appointment);

    } else {
      return res.status(403).json({ message: "Forbidden" });
    }

  } catch (err) {
    console.error("createAppointment failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Strip the primary key so the caller can't accidentally overwrite it
    const { id: _ignored, ...safeUpdates } = req.body;
    await appointment.update(safeUpdates);

    return res.status(200).json(appointment);
  } catch (err) {
    console.error("updateAppointment failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const approveAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    if (!canManageAppointment(req.user, appointment)) {
      return res.status(403).json({ message: "Access denied" });
    }
    if (appointment.status !== "pending") {
      return res.status(400).json({ error: "Only pending appointments can be approved" });
    }

    await appointment.update({ status: "scheduled" });
    return res.status(200).json(appointment);
  } catch (err) {
    console.error("approveAppointment failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    if (!canManageAppointment(req.user, appointment)) {
      return res.status(403).json({ message: "Access denied" });
    }
    if (["completed", "cancelled"].includes(appointment.status)) {
      return res.status(400).json({ error: "This appointment cannot be cancelled" });
    }

    await appointment.update({ status: "cancelled" });
    return res.status(200).json(appointment);
  } catch (err) {
    console.error("cancelAppointment failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    await appointment.destroy();
    return res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (err) {
    console.error("deleteAppointment failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};