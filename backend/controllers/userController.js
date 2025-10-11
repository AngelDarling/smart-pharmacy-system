import { z } from "zod";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(["customer", "admin", "staff", "manager", "pharmacist"]),
  isActive: z.boolean().optional(),
  employeeId: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  hireDate: z.string().optional(),
  salary: z.number().min(0).optional(),
  permissions: z.array(z.string()).optional(),
  avatar: z.string().optional()
});

const updateUserSchema = userSchema.partial().omit({ email: true });

// Simple profile update schema (no validation for profile updates)
const profileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  employeeId: z.string().optional(),
  salary: z.number().min(0).optional(),
  hireDate: z.string().nullable().optional(),
  isActive: z.boolean().optional()
});

// Get all users with pagination and filters
export async function list(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "20", 10)));
    const skip = (page - 1) * limit;

    const query = {};
    
    // Filter by role
    if (req.query.role) {
      query.role = req.query.role;
    }
    
    // Filter by status
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }
    
    // Filter by department
    if (req.query.department) {
      query.department = req.query.department;
    }
    
    // Search by name or email
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { employeeId: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);

    res.json({
      items: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tải danh sách người dùng" });
  }
}

// Get user by ID
export async function getById(req, res) {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tải thông tin người dùng" });
  }
}

// Create new user
export async function create(req, res) {
  try {
    const parsed = userSchema.parse(req.body);
    
    // Check if email already exists
    const existingUser = await User.findOne({ email: parsed.email });
    if (existingUser) {
      return res.status(409).json({ message: "Email đã tồn tại" });
    }
    
    // Check if employeeId already exists (for staff)
    if (parsed.employeeId) {
      const existingEmployee = await User.findOne({ employeeId: parsed.employeeId });
      if (existingEmployee) {
        return res.status(409).json({ message: "Mã nhân viên đã tồn tại" });
      }
    }

    // Hash password if provided
    let passwordHash = null;
    if (req.body.password) {
      passwordHash = await User.hashPassword(req.body.password);
    }

    const userData = {
      ...parsed,
      passwordHash,
      hireDate: parsed.hireDate ? new Date(parsed.hireDate) : undefined
    };

    const user = await User.create(userData);
    const userResponse = user.toObject();
    delete userResponse.passwordHash;
    
    res.status(201).json(userResponse);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: "Dữ liệu không hợp lệ" });
    } else {
      res.status(500).json({ message: "Lỗi khi tạo người dùng" });
    }
  }
}

// Update user (admin function with full validation)
export async function update(req, res) {
  try {
    const parsed = updateUserSchema.parse(req.body);
    
    // Check if employeeId already exists (for staff)
    if (parsed.employeeId) {
      const existingEmployee = await User.findOne({ 
        employeeId: parsed.employeeId,
        _id: { $ne: req.params.id }
      });
      if (existingEmployee) {
        return res.status(409).json({ message: "Mã nhân viên đã tồn tại" });
      }
    }

    const updateData = {
      ...parsed,
      hireDate: parsed.hireDate ? new Date(parsed.hireDate) : undefined
    };

    // Hash new password if provided
    if (req.body.password) {
      updateData.passwordHash = await User.hashPassword(req.body.password);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    ).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    
    res.json(user);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: "Dữ liệu không hợp lệ" });
    } else {
      res.status(500).json({ message: "Lỗi khi cập nhật người dùng" });
    }
  }
}

// Update user profile (simplified validation)
export async function updateProfile(req, res) {
  try {
    const parsed = profileUpdateSchema.parse(req.body);
    
    // Check if employeeId already exists (for staff)
    if (parsed.employeeId) {
      const existingEmployee = await User.findOne({ 
        employeeId: parsed.employeeId,
        _id: { $ne: req.params.id }
      });
      if (existingEmployee) {
        return res.status(409).json({ message: "Mã nhân viên đã tồn tại" });
      }
    }

    const updateData = {
      ...parsed,
      hireDate: parsed.hireDate ? new Date(parsed.hireDate) : undefined
    };

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: false }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: "Dữ liệu không hợp lệ" });
    } else {
      res.status(500).json({ message: "Lỗi khi cập nhật thông tin cá nhân" });
    }
  }
}

// Delete user
export async function remove(req, res) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.json({ success: true, message: "Xóa người dùng thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa người dùng" });
  }
}

// Toggle user status
export async function toggleStatus(req, res) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.json({ 
      success: true, 
      message: `Người dùng đã ${user.isActive ? 'kích hoạt' : 'tạm dừng'}`,
      isActive: user.isActive
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi thay đổi trạng thái người dùng" });
  }
}

// Get user statistics
export async function getStats(req, res) {
  try {
    const [
      totalUsers,
      activeUsers,
      customers,
      staff,
      admins,
      managers,
      pharmacists
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'staff' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'manager' }),
      User.countDocuments({ role: 'pharmacist' })
    ]);

    res.json({
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      usersByRole: {
        customer: customers,
        staff: staff,
        admin: admins,
        manager: managers,
        pharmacist: pharmacists
      },
      recentUsers: [] // Placeholder for future recent users
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tải thống kê người dùng" });
  }
}

// Bulk update users
export async function bulkUpdate(req, res) {
  try {
    const { userIds, updateData } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "Danh sách người dùng không hợp lệ" });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      updateData
    );

    res.json({
      success: true,
      message: `Đã cập nhật ${result.modifiedCount} người dùng`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật hàng loạt" });
  }
}

// Change user password
export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.params.id;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự" });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.findByIdAndUpdate(userId, { passwordHash: hashedNewPassword });

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi đổi mật khẩu" });
  }
}
