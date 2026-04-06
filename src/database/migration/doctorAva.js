import sequelize from "../../config/db";
import DoctorAvailability from "../models/doctorAvailability";

export const createDoctorAvailabilityTable = async () => {
    await sequelize.authenticate()
    await DoctorAvailability.sync({alter: true});
    console.log("Doctor Availability table created successfully");
}