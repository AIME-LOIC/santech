import DoctorAvailability from "../database/models/doctorAvailability.js";

const canManageAvailabilityRow = (user, row) =>
  user.role === "admin" ||
  (user.role === "doctor" && row.doctorId === user.id);

const canReadAvailability = (user, row) =>
  user.role === "admin" ||
  user.role === "patient" ||
  (user.role === "doctor" && row.doctorId === user.id);

export const listDoctorAvailability = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    let where = {};

    if (role === "admin") {
      where = {};
    } else if (role === "doctor") {
      where.doctorId = userId;
    } else if (role === "patient") {
      const { doctorId } = req.query;
      if (!doctorId) {
        return res.status(400).json({
          error: "Query parameter doctorId is required for patients",
        });
      }
      where.doctorId = doctorId;
    } else {
      return res.status(403).json({ message: "Forbidden" });
    }

    const availability = await DoctorAvailability.findAll({
      where,
      order: [["availableDate", "ASC"]],
    });
    return res.status(200).json(availability);
  } catch (error) {
    console.error("Error fetching doctor availability:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getDoctorAvailabilityById = async (req, res) => {
  const { id } = req.params;
  try {
    const availability = await DoctorAvailability.findByPk(id);
    if (!availability) {
      return res.status(404).json({ error: "Doctor availability not found" });
    }
    if (canManageAvailabilityRow(req.user, availability)) {
      return res.status(200).json(availability);
    }
    if (canReadAvailability(req.user, availability)) {
      return res.status(200).json(availability);
    }
    return res.status(403).json({ message: "Access denied" });
  } catch (error) {
    console.error("Error fetching doctor availability:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const createDoctorAvailability = async (req, res) => {
  const { doctorId, availableDate, availableTimeSlots } = req.body;
  try {
    if (!doctorId || !availableDate || !availableTimeSlots) {
      return res.status(400).json({
        error: "doctorId, availableDate, and availableTimeSlots are required",
      });
    }

    if (req.user.role === "doctor" && doctorId !== req.user.id) {
      return res.status(403).json({
        message: "Doctors can only add availability for themselves",
      });
    }

    const availability = await DoctorAvailability.create({
      doctorId,
      availableDate,
      availableTimeSlots,
    });
    return res.status(201).json(availability);
  } catch (error) {
    console.error("Error creating doctor availability:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateDoctorAvailability = async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };
  delete updates.id;

  try {
    const availability = await DoctorAvailability.findByPk(id);
    if (!availability) {
      return res.status(404).json({ error: "Doctor availability not found" });
    }
    if (!canManageAvailabilityRow(req.user, availability)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (
      req.user.role === "doctor" &&
      updates.doctorId &&
      updates.doctorId !== req.user.id
    ) {
      return res.status(403).json({
        message: "Doctors cannot reassign availability to another doctor",
      });
    }

    await availability.update(updates);
    return res.status(200).json(availability);
  } catch (error) {
    console.error("Error updating doctor availability:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteDoctorAvailability = async (req, res) => {
  const { id } = req.params;
  try {
    const availability = await DoctorAvailability.findByPk(id);
    if (!availability) {
      return res.status(404).json({ error: "Doctor availability not found" });
    }
    if (!canManageAvailabilityRow(req.user, availability)) {
      return res.status(403).json({ message: "Access denied" });
    }
    await availability.destroy();
    return res.status(200).json({ message: "Doctor availability deleted successfully" });
  } catch (error) {
    console.error("Error deleting doctor availability:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
