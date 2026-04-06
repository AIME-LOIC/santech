import sequelize from "../config/db.js";
import "../database/index.js"
import { seedUsers } from "../database/seeds/user.js";

const syncDatabase = async () => {
    try {
        console.log("Synchronizing the database...");
        await sequelize.authenticate();

        console.log("Database synchronized successfully");
        await sequelize.sync({ alter: true });
        await seedUsers();
        console.log("Database seeding completed successfully");
       
        process.exit(0);
    } catch (error) {
        console.error("Error synchronizing the database:", error);
        process.exit(1);
    }
}
// export default syncDatabase;

syncDatabase();