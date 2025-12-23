/**
 * Utility functions for handling product images
 */

/**
 * Get the correct image URL for a product
 * @param {string} imagePath - The image path from the database
 * @param {string} fallback - Fallback image path if no image provided
 * @returns {string} - The complete image URL
 */
export function getImageUrl(imagePath, fallback = "/default-product.svg") {
  if (!imagePath) {
    return fallback;
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it starts with /uploads/, prepend the backend URL
  if (imagePath.startsWith('/uploads/')) {
    return `${imagePath}`;
  }
  
  // If it doesn't start with /, assume it's a relative path from uploads
  if (!imagePath.startsWith('/')) {
    return `/uploads/${imagePath}`;
  }
  
  // For other cases, prepend backend URL
  return `${imagePath}`;
}

/**
 * Handle image load error by setting fallback
 * @param {Event} event - The error event
 * @param {string} fallback - Fallback image path
 */
export function handleImageError(event, fallback = "/default-product.svg") {
  try {
    if (event && event.target) {
      event.target.onerror = null;
      event.target.src = fallback;
    }
  } catch {}
}
