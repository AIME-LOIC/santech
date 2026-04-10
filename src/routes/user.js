import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetpassword,
  forgotPassword
} from "../controller/user.js";

import protect from "../middleware/auth.js";

const UserRouter = express.Router();

// get all users
UserRouter.get("/api/users", protect, getAllUsers);

// get user by id
UserRouter.get("/api/users/:id", protect, getUserById);

// create user
UserRouter.post("/api/users", createUser);

// update user
UserRouter.put("/api/users/:id", protect, updateUser);

// delete user
UserRouter.delete("/api/users/:id", protect, deleteUser);

// reset password
UserRouter.post("/api/users/reset-password", protect, resetpassword);

UserRouter.post("/api/users/forgot-password",forgotPassword)

export default UserRouter;