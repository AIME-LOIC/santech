import express from 'express';
import sequelize from './src/config/db.js';
import dotenv from 'dotenv/config';
import UserRouter from './src/routes/user.js';
import AuthRoutes from './src/routes/auth.js';
import AppointmentRouter from './src/routes/appointments.js';
import DoctorAvailabilityRouter from './src/routes/doctorAvailability.js';
import NotificationRouter from './src/routes/notifications.js';

// dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json())
app.use('/user',UserRouter)
app.use("/", AuthRoutes)
// Same auth routes under /user so POST /user/api/register works (matches /user/api/users)
app.use("/user", AuthRoutes)
app.use("/", AppointmentRouter)
app.use("/", DoctorAvailabilityRouter)
app.use("/", NotificationRouter)
app.use("/user", AppointmentRouter)
app.use("/user", DoctorAvailabilityRouter)
app.use("/user", NotificationRouter)
sequelize.authenticate()
.then(() => sequelize.sync())
.then(()=>{
    
    app.listen(PORT, () => {
        console.log(`Server is running on port http://localhost:${PORT}`);
        console.log("Database connected successfully");
    })
    
    

})
.catch((error) => {
        console.error("Error connecting to the database:", error);
        process.exit(1);
    })

