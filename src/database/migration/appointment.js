import sequelize from "../../config/db";
import appointment from "../models/appointments";

export const createAppointmentTable = async () => {
    await sequelize.authenticate()
    await appointment.sync({alter: true});
    console.log("Appointment table created successfully");
}