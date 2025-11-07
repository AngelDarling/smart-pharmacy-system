import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đường dẫn đến font subset files (nhỏ hơn nhiều - chỉ ~29KB mỗi font)
const regularFontPath = path.join(__dirname, '../public/fonts/subset/NotoSans-Regular-Subset.ttf');
const boldFontPath = path.join(__dirname, '../public/fonts/subset/NotoSans-Bold-Subset.ttf');

// Đọc font files và convert sang base64
const regularFont = fs.readFileSync(regularFontPath);
const boldFont = fs.readFileSync(boldFontPath);

const regularBase64 = regularFont.toString('base64');
const boldBase64 = boldFont.toString('base64');

// Tạo file JavaScript chứa font base64
const fontFileContent = `// Font Noto Sans - Base64 encoded
// Generated automatically - DO NOT EDIT MANUALLY

export const NotoSansRegularBase64 = '${regularBase64}';
export const NotoSansBoldBase64 = '${boldBase64}';
`;

// Ghi file
const outputPath = path.join(__dirname, '../src/fonts/notoSansBase64.js');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, fontFileContent);

console.log('✅ Font converted to base64 successfully!');
console.log(`📁 Output: ${outputPath}`);
console.log(`📊 Regular font size: ${(regularBase64.length / 1024).toFixed(2)} KB (base64)`);
console.log(`📊 Bold font size: ${(boldBase64.length / 1024).toFixed(2)} KB (base64)`);

