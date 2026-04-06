import sequelize from "../../config/db";
import Notification from "../models/notification.js"

export const createNotificationTable = async () => {
    await sequelize.authenticate()
    await Notification.sync({alter: true});
    console.log("Notification table created successfully");
}