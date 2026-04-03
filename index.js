import express from 'express';
import sequelize from './src/config/db.js';
import dotenv from 'dotenv/config';

// dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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


