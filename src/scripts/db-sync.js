import sequelize from "../config/db.js";
import "../database/index.js"
// import { seedUsers } from "../database/seeds/user.js";
// import { seedAppointments } from "../database/seeds/appointment.js";
import { seedNotifications } from "../database/seeds/notification.js";
import { doctorAvaSeed } from "../database/seeds/doctorAva.js";

const syncDatabase = async () => {
    try {
        console.log("Synchronizing the database...");
        await sequelize.authenticate();

        console.log("Database synchronized successfully");
        await sequelize.sync({ alter: true });
        // await seedUsers();
        // console.log("Database seeding completed successfully");
        // await seedAppointments();
        // console.log("Appointments seeding completed successfully");
        await seedNotifications();
        console.log("Notifications seeding completed successfully");
        await doctorAvaSeed();
        console.log("Doctor availability seeding completed successfully");


       
        process.exit(0);
    } catch (error) {
        console.error("Error synchronizing the database:", error);
        process.exit(1);
    }
}
// export default syncDatabase;

syncDatabase();
