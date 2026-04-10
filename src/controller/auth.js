import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../database/models/users.js";

// Register
export const Register = async (req, res) => {
  try {
    const { password, ...userData } = req.body;

    const existing = await User.findOne({
      where: { email: userData.email },
    });

    if (existing) {
      return res.status(409).json({ message: "Account already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userAccount = await User.create({
      ...userData,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User created successfully",
      user: userAccount,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: "Account not found. Please register.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        fullname: user.fullname,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user,
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};