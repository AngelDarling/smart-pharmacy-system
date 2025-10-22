import jwt from "jsonwebtoken";
import { z } from "zod";
import User from "../models/User.js";

const registerSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z.union([z.string().email("Email không hợp lệ"), z.literal(""), z.undefined()]).optional(),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  phone: z.string().min(9, "Số điện thoại phải có ít nhất 9 ký tự"),
  address: z.string().optional(),
  role: z.enum(["customer", "admin"]).optional()
});

const loginSchema = z.object({
  phone: z.string().min(9, "Số điện thoại phải có ít nhất 9 ký tự").optional(),
  email: z.string().email("Email không hợp lệ").optional(),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự")
}).refine((data) => !!(data.phone || data.email), {
  message: "Cần nhập email hoặc số điện thoại",
  path: ["phone"]
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
    
    // Check if phone already exists
    const existedPhone = await User.findOne({ phone: parsed.phone });
    if (existedPhone) {
      return res.status(409).json({ message: "Số điện thoại đã tồn tại" });
    }
    
    // Check if email already exists (if provided and not empty)
    if (parsed.email && parsed.email.trim() !== "") {
      const existedEmail = await User.findOne({ email: parsed.email });
      if (existedEmail) {
        return res.status(409).json({ message: "Email đã tồn tại" });
      }
    }
    
    const passwordHash = await User.hashPassword(parsed.password);
    const userData = {
      name: parsed.fullName,
      passwordHash,
      phone: parsed.phone,
      address: parsed.address || "",
      role: parsed.role || "customer"
    };
    
    // Only add email if it's provided and not empty
    if (parsed.email && parsed.email.trim() !== "") {
      userData.email = parsed.email;
    }
    
    const user = await User.create(userData);
    const token = signToken(user);
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        fullName: user.name,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role
      }
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ 
        message: err.errors[0]?.message || "Dữ liệu không hợp lệ" 
      });
    }
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const parsed = loginSchema.parse(req.body);
    const query = parsed.phone ? { phone: parsed.phone } : { email: parsed.email };
    const user = await User.findOne(query);
    if (!user) {
      return res.status(401).json({ message: "Tài khoản hoặc mật khẩu không đúng" });
    }
    const ok = await user.comparePassword(parsed.password);
    if (!ok) {
      return res.status(401).json({ message: "Tài khoản hoặc mật khẩu không đúng" });
    }
    const token = signToken(user);
    res.json({
      token,
      user: {
        _id: user._id,
        fullName: user.name,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        permissions: user.permissions,
        isActive: user.isActive,
        employeeId: user.employeeId,
        department: user.department,
        position: user.position,
        salary: user.salary,
        hireDate: user.hireDate,
        lastLogin: user.lastLogin,
        loginCount: user.loginCount
      }
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ 
        message: err.errors[0]?.message || "Dữ liệu không hợp lệ" 
      });
    }
    next(err);
  }
}

export async function me(req, res) {
  const user = req.user;
  res.json({
    _id: user._id,
    fullName: user.name,
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    role: user.role,
    permissions: user.permissions,
    isActive: user.isActive,
    employeeId: user.employeeId,
    department: user.department,
    position: user.position,
    salary: user.salary,
    hireDate: user.hireDate,
    lastLogin: user.lastLogin,
    loginCount: user.loginCount
  });
}

export async function updateProfile(req, res, next) {
  try {
    const { fullName, email, address } = req.body;
    const user = req.user;
    
    // Update user fields
    if (fullName) user.name = fullName;
    if (email) user.email = email;
    if (address) user.address = address;
    
    await user.save();
    
    res.json({
      _id: user._id,
      fullName: user.name,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role
    });
  } catch (err) {
    next(err);
  }
}


