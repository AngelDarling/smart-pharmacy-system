import { z } from "zod";
import Category from "../models/Category.js";

// Helper function to cascade deactivate children
async function cascadeDeactivateChildren(parentId) {
  try {
    // Find all direct children
    const children = await Category.find({ parent: parentId });
    
    // Deactivate all direct children
    for (const child of children) {
      await Category.findByIdAndUpdate(child._id, { isActive: false });
      
      // Recursively deactivate grandchildren
      await cascadeDeactivateChildren(child._id);
    }
  } catch (error) {
    console.error('Error cascading deactivation:', error);
  }
}

// Helper function to cascade delete children
async function cascadeDeleteChildren(parentId) {
  try {
    // Find all direct children
    const children = await Category.find({ parent: parentId });
    
    // Delete all direct children recursively
    for (const child of children) {
      // First delete all grandchildren
      await cascadeDeleteChildren(child._id);
      
      // Then delete the child itself
      await Category.findByIdAndDelete(child._id);
    }
  } catch (error) {
    console.error('Error cascading deletion:', error);
  }
}

// Helper function to count children recursively
async function countChildrenRecursively(parentId) {
  try {
    let count = 0;
    const children = await Category.find({ parent: parentId });
    
    for (const child of children) {
      count += 1; // Count the child itself
      count += await countChildrenRecursively(child._id); // Count its children
    }
    
    return count;
  } catch (error) {
    console.error('Error counting children:', error);
    return 0;
  }
}

// Recompute level, ancestors, path for a node and all descendants
async function recomputeNodeAndDescendants(categoryId) {
  const node = await Category.findById(categoryId);
  if (!node) return;

  // compute for node
  let ancestors = [];
  let level = 0;
  let path = node.slug;
  if (node.parent) {
    const parent = await Category.findById(node.parent);
    if (parent) {
      ancestors = [...(parent.ancestors || []), parent._id];
      level = (parent.level || 0) + 1;
      path = parent.path ? `${parent.path}/${node.slug}` : node.slug;
    }
  }
  const updateSelf = { ancestors, level, path };
  await Category.updateOne({ _id: node._id }, { $set: updateSelf });

  // children
  const children = await Category.find({ parent: node._id });
  for (const child of children) {
    await recomputeNodeAndDescendants(child._id);
  }
}

const upsertSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  parent: z.string().nullable().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  // chấp nhận cả đường dẫn tương đối (VD: /uploads/...) nên không dùng url()
  iconUrl: z.string().optional().or(z.literal("")),
  imageUrl: z.string().optional().or(z.literal("")),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional()
});

export async function list(req, res) {
  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "10", 10)));
  const skip = (page - 1) * limit;

  const q = (req.query.q || "").trim();
  const filter = q ? { name: { $regex: q, $options: "i" } } : {};

  const [items, total] = await Promise.all([
    Category.find(filter).sort({ sortOrder: 1, createdAt: 1 }).skip(skip).limit(limit),
    Category.countDocuments(filter)
  ]);
  // Ensure default icon if missing
  const withIcon = items.map((c) => ({
    ...c.toObject(),
    iconUrl: c.iconUrl || "/uploads/default.png"
  }));
  res.json({ items: withIcon, total, page, limit });
}

export async function tree(req, res) {
  const docs = await Category.find({}).sort({ sortOrder: 1, createdAt: 1 });
  const byId = new Map(docs.map((d) => [d._id.toString(), { ...d.toObject(), children: [] }]));
  const roots = [];
  for (const d of byId.values()) {
    if (d.parent) {
      const parent = byId.get(d.parent.toString());
      if (parent) parent.children.push(d);
      else roots.push(d);
    } else {
      roots.push(d);
    }
  }
  
  // Sort children by sortOrder
  const sortByOrder = (items) => {
    return items.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return (a.sortOrder || 0) - (b.sortOrder || 0);
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    }).map(item => ({
      ...item,
      children: item.children ? sortByOrder(item.children) : []
    }));
  };
  
  const sortedRoots = sortByOrder(roots);

  // Annotate level, ancestors and path on-the-fly to ensure correctness
  const annotate = (nodes, level = 0, ancestors = [], ancestorPath = "") => {
    for (const node of nodes) {
      node.level = level;
      node.ancestors = ancestors.map(id => id);
      node.path = ancestorPath ? `${ancestorPath}/${node.slug}` : node.slug;
      if (node.children && node.children.length > 0) {
        annotate(node.children, level + 1, [...ancestors, node._id], node.path);
      }
    }
  };

  annotate(sortedRoots, 0, [], "");
  
  // Count products for each category
  const Product = (await import("../models/Product.js")).default;
  const addProductCount = async (nodes) => {
    for (const node of nodes) {
      // Count products in this category
      const productCount = await Product.countDocuments({ categoryId: node._id, isActive: true });
      node.productCount = productCount;
      
      if (node.children && node.children.length > 0) {
        await addProductCount(node.children);
      }
    }
  };
  
  await addProductCount(sortedRoots);
  res.json(sortedRoots);
}

export async function create(req, res, next) {
  try {
    const parsed = upsertSchema.parse(req.body);
    const doc = await Category.create({
      name: parsed.name,
      slug: parsed.slug,
      parent: parsed.parent || null,
      description: parsed.description || "",
      isActive: parsed.isActive ?? true,
      sortOrder: 0, // Default sort order
      iconUrl: parsed.iconUrl || "",
      imageUrl: parsed.imageUrl || "",
      seoTitle: parsed.metaTitle || "",
      seoDescription: parsed.metaDescription || ""
    });
    // Ensure level/ancestors/path are correct, and recompute for descendants if needed
    await recomputeNodeAndDescendants(doc._id);
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const parsed = upsertSchema.partial().parse(req.body);
    
    // Map frontend fields to backend fields
    const updateData = {};
    if (parsed.name) updateData.name = parsed.name;
    if (parsed.slug) updateData.slug = parsed.slug;
    if (parsed.parent !== undefined) updateData.parent = parsed.parent;
    if (parsed.description !== undefined) updateData.description = parsed.description;
    if (parsed.isActive !== undefined) updateData.isActive = parsed.isActive;
    if (parsed.iconUrl !== undefined) updateData.iconUrl = parsed.iconUrl;
    if (parsed.imageUrl !== undefined) updateData.imageUrl = parsed.imageUrl;
    if (parsed.metaTitle !== undefined) updateData.seoTitle = parsed.metaTitle;
    if (parsed.metaDescription !== undefined) updateData.seoDescription = parsed.metaDescription;
    
    const doc = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!doc) return res.status(404).json({ message: "Không tìm thấy" });
    
    // Cascading status: If parent is deactivated, deactivate all children
    if (parsed.isActive === false) {
      await cascadeDeactivateChildren(req.params.id);
      // Refresh the document to get updated data
      const updatedDoc = await Category.findById(req.params.id);
      return res.json(updatedDoc);
    }
    
    // Always recompute current node and descendants after updates that may affect hierarchy
    await recomputeNodeAndDescendants(doc._id);
    const refreshed = await Category.findById(doc._id);
    res.json(refreshed);
  } catch (err) {
    next(err);
  }
}

// Get category info including children count for deletion confirmation
export async function getDeleteInfo(req, res) {
  try {
    const doc = await Category.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Không tìm thấy" });
    
    const childrenCount = await countChildrenRecursively(req.params.id);
    
    res.json({
      category: doc,
      childrenCount,
      totalToDelete: childrenCount + 1,
      hasChildren: childrenCount > 0
    });
  } catch (error) {
    console.error('Error getting delete info:', error);
    res.status(500).json({ message: "Lỗi khi lấy thông tin xóa" });
  }
}

export async function remove(req, res) {
  try {
    const doc = await Category.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Không tìm thấy" });
    
    // Count children to inform frontend
    const childrenCount = await countChildrenRecursively(req.params.id);
    
    // Delete all children recursively first
    await cascadeDeleteChildren(req.params.id);
    
    // Then delete the parent category
    await Category.findByIdAndDelete(req.params.id);
    
    res.json({ 
      success: true, 
      message: `Đã xóa danh mục "${doc.name}" và ${childrenCount} danh mục con`,
      deletedCount: childrenCount + 1
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: "Lỗi khi xóa danh mục" });
  }
}


