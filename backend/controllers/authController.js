import jwt from "jsonwebtoken";
import { z } from "zod";
import User from "../models/User.js";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(["customer", "admin"]).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export async function register(req, res, next) {
  try {
    const parsed = registerSchema.parse(req.body);
    const existed = await User.findOne({ email: parsed.email });
    if (existed) {
      return res.status(409).json({ message: "Email đã tồn tại" });
    }
    const passwordHash = await User.hashPassword(parsed.password);
    const user = await User.create({
      name: parsed.name,
      email: parsed.email,
      passwordHash,
      phone: parsed.phone,
      address: parsed.address,
      role: parsed.role || "customer"
    });
    const token = signToken(user);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const parsed = loginSchema.parse(req.body);
    const user = await User.findOne({ email: parsed.email });
    if (!user) {
      return res.status(401).json({ message: "Sai thông tin đăng nhập" });
    }
    const ok = await user.comparePassword(parsed.password);
    if (!ok) {
      return res.status(401).json({ message: "Sai thông tin đăng nhập" });
    }
    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res) {
  const user = req.user;
  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  });
}


