import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Script is in backend/scripts
// Frontend is in ../../frontend/src relative to scripts folder
const frontendSrc = path.join(__dirname, '../../frontend/src');

console.log(`Targeting frontend source: ${frontendSrc}`);

const filesToProcess = [
  'utils/imageUtils.js',
  'pages/VNPayReturn.jsx',
  'pages/healthNews/HealthNewsDetail.jsx',
  'pages/healthNews/HealthNews.jsx',
  'pages/admin/healthNews/HealthNewsManagement.jsx',
  'pages/admin/healthNews/HealthNewsEditor.jsx',
  'pages/admin/healthNews/HealthNewsAnalytics.jsx',
  'pages/admin/healthNews/CategoryManagement.jsx',
  'hooks/useHealthNewsCategories.js',
  'hooks/admin/useUsers.js',
  'hooks/admin/useProducts.js',
  'hooks/admin/useCategories.js',
  'components/products/SubcategoriesGrid.jsx',
  'components/landing/FavoriteBrandsSection.jsx',
  'components/landing/FeaturedCategoriesSection.jsx',
  'components/Chatbot.jsx',
  'components/CategorySidebar.jsx',
  'App.jsx',
  'api/client.js'
];

function bulkReplace() {
  console.log('Starting bulk replace of http://localhost:5000...');
  
  filesToProcess.forEach(relPath => {
    const fullPath = path.join(frontendSrc, relPath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`File not found: ${fullPath}`);
      return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    const originalContent = content;
    // Replace http://localhost:5000 with empty string
    content = content.replace(/http:\/\/localhost:5000/g, '');
    
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Refactored: ${relPath}`);
    } else {
      console.log(`ℹ️  No changes needed (or already refactored): ${relPath}`);
    }
  });
  
  console.log('\nBulk refactoring completed!');
}

bulkReplace();
