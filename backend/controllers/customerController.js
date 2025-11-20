import { z } from "zod";
import Customer, { PointHistory } from "../models/Customer.js";

const customerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().or(z.literal('')).optional(),
  phone: z.string().min(9),
  address: z.string().optional(),
  isActive: z.boolean().optional(),
  avatar: z.string().optional(),
  loyaltyPoints: z.number().min(0).optional()
});

const updateCustomerSchema = customerSchema.partial();

// Get all customers with pagination and filters
export async function list(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "20", 10)));
    const skip = (page - 1) * limit;

    const query = {};
    
    // Filter by status
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }
    
    // Search by name, email or phone
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { phone: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const [customers, total] = await Promise.all([
      Customer.find(query)
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Customer.countDocuments(query)
    ]);

    res.json({
      items: customers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Customer list error:", error);
    res.status(500).json({ message: "Lỗi khi tải danh sách khách hàng" });
  }
}

// Get customer by ID
export async function getById(req, res) {
  try {
    const customer = await Customer.findById(req.params.id).select('-passwordHash');
    if (!customer) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    }
    res.json(customer);
  } catch (error) {
    console.error("Customer getById error:", error);
    res.status(500).json({ message: "Lỗi khi tải thông tin khách hàng" });
  }
}

// Create new customer
export async function create(req, res) {
  try {
    const parsed = customerSchema.parse(req.body);
    
    // Check if phone already exists
    const existingPhone = await Customer.findOne({ phone: parsed.phone });
    if (existingPhone) {
      return res.status(409).json({ message: "Số điện thoại đã tồn tại" });
    }
    
    // Check if email already exists (if provided and not empty)
    if (parsed.email && parsed.email.trim() !== '') {
      const existingEmail = await Customer.findOne({ email: parsed.email });
      if (existingEmail) {
        return res.status(409).json({ message: "Email đã tồn tại" });
      }
    }

    // Hash password if provided
    let passwordHash = null;
    if (req.body.password) {
      passwordHash = await Customer.hashPassword(req.body.password);
    } else {
      // Default password if not provided
      passwordHash = await Customer.hashPassword("123456");
    }

    const customerData = {
      ...parsed,
      passwordHash
    };

    const customer = await Customer.create(customerData);
    const customerResponse = customer.toObject();
    delete customerResponse.passwordHash;
    
    res.status(201).json(customerResponse);
  } catch (error) {
    console.error("Customer create error:", error);
    if (error.name === 'ZodError') {
      res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: error.errors });
    } else {
      res.status(500).json({ message: "Lỗi khi tạo khách hàng" });
    }
  }
}

// Update customer
export async function update(req, res) {
  try {
    const parsed = updateCustomerSchema.parse(req.body);
    
    // Find current customer
    const currentCustomer = await Customer.findById(req.params.id);
    if (!currentCustomer) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    }

    // Check if email already exists (if changed and not empty)
    if (parsed.email && parsed.email !== currentCustomer.email) {
      const existingEmail = await Customer.findOne({ 
        email: parsed.email,
        _id: { $ne: req.params.id }
      });
      if (existingEmail) {
        return res.status(409).json({ message: "Email đã tồn tại" });
      }
    }
    
    // Check if phone already exists (if changed)
    if (parsed.phone && parsed.phone !== currentCustomer.phone) {
      const existingPhone = await Customer.findOne({ 
        phone: parsed.phone,
        _id: { $ne: req.params.id }
      });
      if (existingPhone) {
        return res.status(409).json({ message: "Số điện thoại đã tồn tại" });
      }
    }

    // Handle point history
    if (parsed.loyaltyPoints !== undefined && parsed.loyaltyPoints !== currentCustomer.loyaltyPoints) {
      const diff = parsed.loyaltyPoints - (currentCustomer.loyaltyPoints || 0);
      if (diff !== 0) {
        await PointHistory.create({
          userId: currentCustomer._id,
          points: diff,
          description: 'Admin cập nhật thủ công',
          orderCode: 'ADMIN_UPDATE'
        });
      }
    }

    const updateData = parsed;

    // Hash new password if provided
    if (req.body.password) {
      updateData.passwordHash = await Customer.hashPassword(req.body.password);
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    ).select('-passwordHash');
    
    res.json(customer);
  } catch (error) {
    console.error("Customer update error:", error);
    if (error.name === 'ZodError') {
      res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: error.errors });
    } else {
      res.status(500).json({ message: "Lỗi khi cập nhật khách hàng" });
    }
  }
}

// Update customer points
export async function updatePoints(req, res) {
  try {
    const { points, description } = req.body;
    
    if (typeof points !== 'number') {
      return res.status(400).json({ message: "Điểm không hợp lệ" });
    }
    
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    }
    
    // Update points
    customer.loyaltyPoints += points;
    await customer.save();
    
    // Log point history
    await PointHistory.create({
      userId: customer._id,
      points,
      description: description || 'Admin cập nhật điểm',
      orderCode: 'ADMIN_POINT_UPDATE'
    });
    
    res.json({ 
      success: true,
      message: "Cập nhật điểm thành công",
      loyaltyPoints: customer.loyaltyPoints
    });
  } catch (error) {
    console.error("Customer updatePoints error:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật điểm" });
  }
}

// Delete customer
export async function remove(req, res) {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    }
    res.json({ success: true, message: "Xóa khách hàng thành công" });
  } catch (error) {
    console.error("Customer remove error:", error);
    res.status(500).json({ message: "Lỗi khi xóa khách hàng" });
  }
}

// Toggle customer status
export async function toggleStatus(req, res) {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    }
    
    customer.isActive = !customer.isActive;
    await customer.save();
    
    res.json({ 
      success: true, 
      message: `Khách hàng đã ${customer.isActive ? 'kích hoạt' : 'tạm dừng'}`,
      isActive: customer.isActive
    });
  } catch (error) {
    console.error("Customer toggleStatus error:", error);
    res.status(500).json({ message: "Lỗi khi thay đổi trạng thái khách hàng" });
  }
}

// Get customer statistics
export async function getStats(req, res) {
  try {
    const [
      totalCustomers,
      activeCustomers
    ] = await Promise.all([
      Customer.countDocuments(),
      Customer.countDocuments({ isActive: true })
    ]);

    res.json({
      totalCustomers,
      activeCustomers,
      inactiveCustomers: totalCustomers - activeCustomers
    });
  } catch (error) {
    console.error("Customer getStats error:", error);
    res.status(500).json({ message: "Lỗi khi tải thống kê khách hàng" });
  }
}

// Bulk update customers
export async function bulkUpdate(req, res) {
  try {
    const { customerIds, updateData } = req.body;
    
    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return res.status(400).json({ message: "Danh sách khách hàng không hợp lệ" });
    }

    const result = await Customer.updateMany(
      { _id: { $in: customerIds } },
      updateData
    );

    res.json({
      success: true,
      message: `Đã cập nhật ${result.modifiedCount} khách hàng`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Customer bulkUpdate error:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật hàng loạt" });
  }
}

// Get point history for a customer (admin function)
export async function getPointHistory(req, res) {
  try {
    const customerId = req.params.id;
    const logs = await PointHistory.find({ userId: customerId }).sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    console.error("Customer getPointHistory error:", err);
    res.status(500).json({ message: "Không lấy được lịch sử nhận điểm", error: err.message });
  }
}
