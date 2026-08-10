import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AuthRequest } from "../middleware/auth.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
};

export async function login(req: Request, res: Response) {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ message: "Username and password are required" });
    return;
  }

  const user = await User.findOne({ username: username.toLowerCase().trim() });
  if (!user) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const secret = process.env.JWT_SECRET || "tv_log_super_secret_jwt_key_2026";
  const token = jwt.sign({ userId: user._id }, secret, { expiresIn: "30d" });

  res.cookie("token", token, COOKIE_OPTIONS);
  res.json({
    _id: user._id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    token
  });
}

export async function logout(req: Request, res: Response) {
  res.clearCookie("token", COOKIE_OPTIONS);
  res.json({ message: "Logged out successfully" });
}

export async function getMe(req: AuthRequest, res: Response) {
  const user = await User.findById(req.userId).select("-passwordHash");
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json(user);
}

export async function updateProfile(req: AuthRequest, res: Response) {
  const { displayName, avatarUrl } = req.body;
  const user = await User.findById(req.userId);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  if (displayName) user.displayName = displayName;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
  await user.save();

  res.json({
    _id: user._id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl
  });
}
