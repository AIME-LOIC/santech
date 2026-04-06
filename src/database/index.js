import sequelize from "../config/db.js";
import User from "./models/users.js"
import Notification from "./models/notification.js";
import DoctorAvailability from "./models/doctorAvailability.js";
import appointment from "./models/appointments.js";
const db={
    sequelize,
    User,
    Notification,
    DoctorAvailability,
    appointment
}
export default db;  
