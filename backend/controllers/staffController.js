import { z } from "zod";
import Staff from "../models/Staff.js";

const staffSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().or(z.literal('')).optional(),
  phone: z.string().optional(),
  role: z.enum(["staff", "admin", "manager", "pharmacist"]),
  isActive: z.boolean().optional(),
  employeeId: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  hireDate: z.string().optional(),
  salary: z.number().min(0).optional(),
  permissions: z.array(z.string()).optional(),
  avatar: z.string().optional()
});

const updateStaffSchema = staffSchema.partial();

// Get all staff with pagination and filters
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

    const [staff, total] = await Promise.all([
      Staff.find(query)
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Staff.countDocuments(query)
    ]);

    res.json({
      items: staff,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Staff list error:", error);
    res.status(500).json({ message: "Lỗi khi tải danh sách nhân viên" });
  }
}

// Get staff by ID
export async function getById(req, res) {
  try {
    const staff = await Staff.findById(req.params.id).select('-passwordHash');
    if (!staff) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    }
    res.json(staff);
  } catch (error) {
    console.error("Staff getById error:", error);
    res.status(500).json({ message: "Lỗi khi tải thông tin nhân viên" });
  }
}

// Create new staff
export async function create(req, res) {
  try {
    const parsed = staffSchema.parse(req.body);
    
    // Check if email already exists
    if (parsed.email && parsed.email.trim() !== '') {
      const existingEmail = await Staff.findOne({ email: parsed.email });
      if (existingEmail) {
        return res.status(409).json({ message: "Email đã tồn tại" });
      }
    }
    
    // Check if phone already exists
    if (parsed.phone) {
      const existingPhone = await Staff.findOne({ phone: parsed.phone });
      if (existingPhone) {
        return res.status(409).json({ message: "Số điện thoại đã tồn tại" });
      }
    }
    
    // Check if employeeId already exists
    if (parsed.employeeId) {
      const existingEmployee = await Staff.findOne({ employeeId: parsed.employeeId });
      if (existingEmployee) {
        return res.status(409).json({ message: "Mã nhân viên đã tồn tại" });
      }
    }

    // Hash password if provided
    let passwordHash = null;
    if (req.body.password) {
      passwordHash = await Staff.hashPassword(req.body.password);
    } else {
      // Default password if not provided
      passwordHash = await Staff.hashPassword("123456");
    }

    const staffData = {
      ...parsed,
      passwordHash,
      hireDate: parsed.hireDate ? new Date(parsed.hireDate) : undefined
    };

    const staff = await Staff.create(staffData);
    const staffResponse = staff.toObject();
    delete staffResponse.passwordHash;
    
    res.status(201).json(staffResponse);
  } catch (error) {
    console.error("Staff create error:", error);
    if (error.name === 'ZodError') {
      res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: error.errors });
    } else {
      res.status(500).json({ message: "Lỗi khi tạo nhân viên" });
    }
  }
}

// Update staff
export async function update(req, res) {
  try {
    const parsed = updateStaffSchema.parse(req.body);
    
    // Find current staff
    const currentStaff = await Staff.findById(req.params.id);
    if (!currentStaff) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    }

    // Check if email already exists (if changed and not empty)
    if (parsed.email && parsed.email !== currentStaff.email) {
      const existingEmail = await Staff.findOne({ 
        email: parsed.email,
        _id: { $ne: req.params.id }
      });
      if (existingEmail) {
        return res.status(409).json({ message: "Email đã tồn tại" });
      }
    }
    
    // Check if phone already exists (if changed)
    if (parsed.phone && parsed.phone !== currentStaff.phone) {
      const existingPhone = await Staff.findOne({ 
        phone: parsed.phone,
        _id: { $ne: req.params.id }
      });
      if (existingPhone) {
        return res.status(409).json({ message: "Số điện thoại đã tồn tại" });
      }
    }
    
    // Check if employeeId already exists
    if (parsed.employeeId && parsed.employeeId !== currentStaff.employeeId) {
      const existingEmployee = await Staff.findOne({ 
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
      updateData.passwordHash = await Staff.hashPassword(req.body.password);
    }

    const staff = await Staff.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    ).select('-passwordHash');
    
    res.json(staff);
  } catch (error) {
    console.error("Staff update error:", error);
    if (error.name === 'ZodError') {
      res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: error.errors });
    } else {
      res.status(500).json({ message: "Lỗi khi cập nhật nhân viên" });
    }
  }
}

// Update staff role
export async function updateRole(req, res) {
  try {
    const { role } = req.body;
    
    if (!role || !["staff", "admin", "manager", "pharmacist"].includes(role)) {
      return res.status(400).json({ message: "Vai trò không hợp lệ" });
    }
    
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-passwordHash');
    
    if (!staff) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    }
    
    res.json(staff);
  } catch (error) {
    console.error("Staff updateRole error:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật vai trò" });
  }
}

// Update staff permissions
export async function updatePermissions(req, res) {
  try {
    const { permissions } = req.body;
    
    if (!permissions || typeof permissions !== 'object') {
      return res.status(400).json({ message: "Dữ liệu permissions không hợp lệ" });
    }
    
    // Convert permissions object to Map
    const permissionsMap = new Map(Object.entries(permissions));
    
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      { permissions: permissionsMap },
      { new: true }
    ).select('-passwordHash');
    
    if (!staff) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    }
    
    res.json({
      success: true,
      message: "Cập nhật quyền thành công",
      staff
    });
  } catch (error) {
    console.error("Staff updatePermissions error:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật quyền" });
  }
}

// Delete staff
export async function remove(req, res) {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    }
    res.json({ success: true, message: "Xóa nhân viên thành công" });
  } catch (error) {
    console.error("Staff remove error:", error);
    res.status(500).json({ message: "Lỗi khi xóa nhân viên" });
  }
}

// Toggle staff status
export async function toggleStatus(req, res) {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    }
    
    staff.isActive = !staff.isActive;
    await staff.save();
    
    res.json({ 
      success: true, 
      message: `Nhân viên đã ${staff.isActive ? 'kích hoạt' : 'tạm dừng'}`,
      isActive: staff.isActive
    });
  } catch (error) {
    console.error("Staff toggleStatus error:", error);
    res.status(500).json({ message: "Lỗi khi thay đổi trạng thái nhân viên" });
  }
}

// Get staff statistics
export async function getStats(req, res) {
  try {
    const [
      totalStaff,
      activeStaff,
      staffByRole,
      admins,
      managers,
      pharmacists
    ] = await Promise.all([
      Staff.countDocuments(),
      Staff.countDocuments({ isActive: true }),
      Staff.countDocuments({ role: 'staff' }),
      Staff.countDocuments({ role: 'admin' }),
      Staff.countDocuments({ role: 'manager' }),
      Staff.countDocuments({ role: 'pharmacist' })
    ]);

    res.json({
      totalStaff,
      activeStaff,
      inactiveStaff: totalStaff - activeStaff,
      staffByRole: {
        staff: staffByRole,
        admin: admins,
        manager: managers,
        pharmacist: pharmacists
      }
    });
  } catch (error) {
    console.error("Staff getStats error:", error);
    res.status(500).json({ message: "Lỗi khi tải thống kê nhân viên" });
  }
}

// Bulk update staff
export async function bulkUpdate(req, res) {
  try {
    const { staffIds, updateData } = req.body;
    
    if (!staffIds || !Array.isArray(staffIds) || staffIds.length === 0) {
      return res.status(400).json({ message: "Danh sách nhân viên không hợp lệ" });
    }

    const result = await Staff.updateMany(
      { _id: { $in: staffIds } },
      updateData
    );

    res.json({
      success: true,
      message: `Đã cập nhật ${result.modifiedCount} nhân viên`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Staff bulkUpdate error:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật hàng loạt" });
  }
}

// Change staff password
export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const staffId = req.params.id;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự" });
    }

    // Get staff
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    }

    // Verify current password
    const isCurrentPasswordValid = await staff.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    // Hash new password
    const hashedNewPassword = await Staff.hashPassword(newPassword);

    // Update password
    await Staff.findByIdAndUpdate(staffId, { passwordHash: hashedNewPassword });

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Staff changePassword error:", error);
    res.status(500).json({ message: "Lỗi khi đổi mật khẩu" });
  }
}
