import Appointment from "../database/models/appointments.js";

export const getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.findAll();
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
        return res.status(200).json(appointment);
    } catch (error) {
        console.error("Error fetching appointment:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const createAppointment = async (req, res) => {
    const { doctorId, patientId, appointmentDate, appointmentTime, status } = req.body;
    try {
        const appointment = await Appointment.create({
            doctorId,
            patientId,
            appointmentDate,
            appointmentTime,
            status,
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
