import sequelize from "../../config/db";
import User from "../models/users.js"

export const createUserTable = async () => {
    await sequelize.authenticate()
    await User.sync({alter: true});
    console.log("User table created successfully");
}