import HealthNewsCategory from '../models/HealthNewsCategory.js';
import slugify from 'slugify';

// Get all categories (public)
export const getAll = async (req, res) => {
  try {
    const categories = await HealthNewsCategory.find({ isActive: true })
      .sort({ order: 1, name: 1 });
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

// Get single category
export const getById = async (req, res) => {
  try {
    const category = await HealthNewsCategory.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category', error: error.message });
  }
};

// Create category (admin)
export const create = async (req, res) => {
  try {
    const { name, description, icon, order } = req.body;
    
    // Generate slug from name
    const slug = slugify(name, { lower: true, strict: true, locale: 'vi' });
    
    const category = new HealthNewsCategory({
      name,
      slug,
      description,
      icon,
      order
    });
    
    await category.save();
    
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Category with this slug already exists' });
    }
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
};

// Update category (admin)
export const update = async (req, res) => {
  try {
    const { name, description, icon, order, isActive } = req.body;
    
    const category = await HealthNewsCategory.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Update fields
    if (name) {
      category.name = name;
      category.slug = slugify(name, { lower: true, strict: true, locale: 'vi' });
    }
    if (description !== undefined) category.description = description;
    if (icon) category.icon = icon;
    if (order !== undefined) category.order = order;
    if (isActive !== undefined) category.isActive = isActive;
    
    await category.save();
    
    res.json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Category with this slug already exists' });
    }
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
};

// Delete category (admin)
export const deleteCategory = async (req, res) => {
  try {
    const category = await HealthNewsCategory.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if category has any news articles
    const HealthNews = (await import('../models/HealthNews.js')).default;
    const newsCount = await HealthNews.countDocuments({ category: req.params.id });
    
    if (newsCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. It has ${newsCount} news article(s). Please reassign or delete them first.` 
      });
    }
    
    await category.deleteOne();
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  delete: deleteCategory
};
