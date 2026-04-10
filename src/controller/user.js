import User from "../database/models/users.js";
import bcrypt from "bcrypt";

// =====================
// Get All Users (Admin Only)
// =====================
export const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admin only.",
      });
    }

    const users = await User.findAll();

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// =====================
// Get User By ID (Admin or Owner)
// =====================
export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    if (req.user.id != id && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// =====================
// Create User (Public)
// =====================
export const createUser = async (req, res) => {
  try {
    const {
      fullname,
      email,
      password,
      dob,
      gender,
      profilePicture,
      emergencyContact,
      PhoneNumber,
      location,
      role,
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullname,
      email,
      password: hashedPassword,
      dob,
      gender,
      profilePicture,
      emergencyContact,
      PhoneNumber,
      location,
      role,
    });

    return res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

// =====================
// Update User (Admin or Owner)
// =====================
export const updateUser = async (req, res) => {
  const { id } = req.params;

  try {
    if (req.user.id != id && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    await user.update(req.body);

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// =====================
// Delete User (Admin Only)
// =====================
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Admin only",
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    await user.destroy();

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// =====================
// Reset Password (Logged-in User)
// =====================
export const resetpassword = async (req, res) => {
  const { password, newpassword } = req.body;

  try {
    const user = await User.findByPk(req.user.id);

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        message: "Current password incorrect",
      });
    }

    const newHash = await bcrypt.hash(newpassword, 10);

    await user.update({
      password: newHash,
    });

    return res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// =====================
// Forgot Password (Simple Version)
// =====================
export const forgotPassword = async (req, res) => {
  const { email, newpassword } = req.body;

  try {
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const hashedPassword = await bcrypt.hash(newpassword, 10);

    await user.update({
      password: hashedPassword,
    });

    return res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};