import DoctorAvailability from "../database/models/doctorAvailability.js";

export const getAllDoctorAvailability = async (req, res) => {
    try {
        const availability = await DoctorAvailability.findAll();
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
        return res.status(200).json(availability);
    } catch (error) {
        console.error("Error fetching doctor availability:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const createDoctorAvailability = async (req, res) => {
    const { doctorId, availableDate, availableTimeSlots } = req.body;
    try {
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
    try {
        const availability = await DoctorAvailability.findByPk(id);
        if (!availability) {
            return res.status(404).json({ error: "Doctor availability not found" });
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
        await availability.destroy();
        return res.status(200).json({ message: "Doctor availability deleted successfully" });
    } catch (error) {
        console.error("Error deleting doctor availability:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
