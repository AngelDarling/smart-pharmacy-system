import jwt from "jsonwebtoken";

export async function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    // Try Staff first
    let user = await (await import("../models/Staff.js")).default.findById(payload.sub);
    
    // If not found, try Customer
    if (!user) {
      const Customer = (await import("../models/Customer.js")).default;
      user = await Customer.findById(payload.sub);
      // Set role to customer if found in Customer collection
      if (user) {
        user.role = 'customer';
      }
    }
    
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
      
      // Try Staff first
      let user = await (await import("../models/Staff.js")).default.findById(payload.sub);
      
      // If not found, try Customer
      if (!user) {
        const Customer = (await import("../models/Customer.js")).default;
        user = await Customer.findById(payload.sub);
        // Set role to customer if found in Customer collection
        if (user) {
          user.role = 'customer';
        }
      }
      
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

// New granular permission middleware (resource-based)
export function requireResourcePermission(resource, action) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Admin has all permissions
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Check granular permissions (Map-based)
    if (req.user.permissions) {
      // Convert Map to object if needed
      const perms = req.user.permissions instanceof Map 
        ? Object.fromEntries(req.user.permissions)
        : req.user.permissions;
      
      const resourcePerms = perms[resource] || [];
      
      if (resourcePerms.includes(action) || resourcePerms.includes('manage')) {
        return next();
      }
    }
    
    return res.status(403).json({ 
      message: `Không có quyền ${action} cho ${resource}` 
    });
  };
}

// Legacy permission middleware (for backward compatibility)
export function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Admin has all permissions
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Map legacy permissions to new resource-based permissions
    const legacyPermissionMap = {
      'manage_content': { resource: 'healthNews', action: 'view' },
      'read_products': { resource: 'products', action: 'view' },
      'write_products': { resource: 'products', action: 'edit' },
      'delete_products': { resource: 'products', action: 'delete' },
      // User management permissions (general)
      'read_users': { resource: 'users', action: 'view' },
      'write_users': { resource: 'users', action: 'edit' },
      'delete_users': { resource: 'users', action: 'delete' },
      // Customer-specific permissions
      'read_customers': { resource: 'customers', action: 'view' },
      'write_customers': { resource: 'customers', action: 'edit' },
      'delete_customers': { resource: 'customers', action: 'delete' },
      // Staff-specific permissions
      'read_staff': { resource: 'staff', action:'view' },
      'write_staff': { resource: 'staff', action: 'edit' },
      'delete_staff': { resource: 'staff', action: 'delete' },
      // Reports permissions
      'read_reports': { resource: 'reports', action: 'view' },
      // Inventory permissions
      'read_inventory': { resource: 'inventory', action: 'view' },
      'write_inventory': { resource: 'inventory', action: 'edit' }
    };
    
    // Check if user has permissions
    if (!req.user.permissions) {
      return res.status(403).json({ 
        message: `Không có quyền truy cập: ${permission}` 
      });
    }
    
    // Check old array-based permissions
    if (Array.isArray(req.user.permissions)) {
      if (req.user.permissions.includes(permission)) {
        return next();
      }
      return res.status(403).json({ 
        message: `Không có quyền truy cập: ${permission}` 
      });
    }
    
    // Check new object-based permissions
    if (typeof req.user.permissions === 'object') {
      // Convert Map to object if needed
      const perms = req.user.permissions instanceof Map 
        ? Object.fromEntries(req.user.permissions)
        : req.user.permissions;
      
      // Check if legacy permission can be mapped to new format
      const mapping = legacyPermissionMap[permission];
      if (mapping) {
        const resourcePerms = perms[mapping.resource] || [];
        if (resourcePerms.includes(mapping.action) || resourcePerms.includes('manage')) {
          return next();
        }
      }
    }
    
    return res.status(403).json({ 
      message: `Không có quyền truy cập: ${permission}` 
    });
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

// Require staff (not customer)
export function requireStaff(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  if (req.user.role === 'customer') {
    return res.status(403).json({ message: "Chỉ nhân viên mới có quyền truy cập" });
  }
  
  next();
}
