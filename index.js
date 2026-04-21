import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from './src/config/db.js';
import dotenv from 'dotenv/config';
import UserRouter from './src/routes/user.js';
import AuthRoutes from './src/routes/auth.js';
import AppointmentRouter from './src/routes/appointments.js';
import DoctorAvailabilityRouter from './src/routes/doctorAvailability.js';
import NotificationRouter from './src/routes/notifications.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Serve the frontend
app.use(express.static(path.join(__dirname, 'santech-frontend')));

app.use('/user', UserRouter);
app.use("/", AuthRoutes);
app.use("/user", AuthRoutes);
app.use("/", AppointmentRouter);
app.use("/", DoctorAvailabilityRouter);
app.use("/", NotificationRouter);
app.use("/user", AppointmentRouter);
app.use("/user", DoctorAvailabilityRouter);
app.use("/user", NotificationRouter);

// Catch-all for Express 5
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'santech-frontend', 'index.html'));
});

sequelize.authenticate()
  .then(() => sequelize.sync())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log("Database connected successfully");
    });
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  });