import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) return res.status(401).json({ message: "Unauthorized" });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

// Optional auth - sets user if token is valid, but doesn't require it
export async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    
    if (token) {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.sub);
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (err) {
    // Continue without user if token is invalid
    next();
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

// New granular permission middleware
export function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Admin has all permissions
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Check if user has the specific permission
    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      return res.status(403).json({ 
        message: `Không có quyền truy cập: ${permission}` 
      });
    }
    
    next();
  };
}

// Multiple permissions (user needs ANY of the permissions)
export function requireAnyPermission(...permissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Admin has all permissions
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Check if user has ANY of the permissions
    const hasPermission = permissions.some(permission => 
      req.user.permissions && req.user.permissions.includes(permission)
    );
    
    if (!hasPermission) {
      return res.status(403).json({ 
        message: `Không có quyền truy cập. Cần một trong các quyền: ${permissions.join(', ')}` 
      });
    }
    
    next();
  };
}

// All permissions (user needs ALL of the permissions)
export function requireAllPermissions(...permissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Admin has all permissions
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Check if user has ALL of the permissions
    const hasAllPermissions = permissions.every(permission => 
      req.user.permissions && req.user.permissions.includes(permission)
    );
    
    if (!hasAllPermissions) {
      return res.status(403).json({ 
        message: `Không có đủ quyền truy cập. Cần tất cả các quyền: ${permissions.join(', ')}` 
      });
    }
    
    next();
  };
}


