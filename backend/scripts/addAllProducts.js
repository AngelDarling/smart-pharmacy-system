import mongoose from 'mongoose';
import fs from 'fs';
import slugify from 'slugify';

// Read category analysis
const categoryData = JSON.parse(fs.readFileSync('category_analysis.json', 'utf8'));

// Comprehensive product database - organized by category name
const productDatabase = {
  // === MEDICINES (Thuốc) ===
  'Thuốc kháng viêm': [
    { name: 'Ibuprofen 400mg', price: 45000, unit: 'hộp', desc: 'Thuốc giảm đau, hạ sốt, kháng viêm hiệu quả. Hộp 100 viên' },
    { name: 'Diclofenac Gel 1%', price: 35000, unit: 'tuýp', desc: 'Gel bôi ngoài da giảm đau, kháng viêm. Tuýp 30g' }
  ],
  'Thuốc tra mắt': [
    { name: 'Rohto V Premium', price: 85000, unit: 'chai', desc: 'Thuốc nhỏ mắt giảm mỏi mắt, làm mát mắt. Chai 13ml' },
    { name: 'Visine Classic', price: 65000, unit: 'chai', desc: 'Thuốc nhỏ mắt giảm đỏ mắt, khô mắt. Chai 15ml' }
  ],
  'Thuốc nhỏ tai': [
    { name: 'Otilin', price: 42000, unit: 'chai', desc: 'Thuốc nhỏ tai kháng khuẩn, giảm viêm tai. Chai 10ml' }
  ],
  'Thuốc xịt mũi': [
    { name: 'Otrivin 0.1%', price: 78000, unit: 'chai', desc: 'Xịt mũi giảm nghẹt mũi, viêm mũi dị ứng. Chai 10ml' },
    { name: 'Physiomer', price: 125000, unit: 'chai', desc: 'Nước biển sinh lý rửa mũi, làm sạch mũi. Chai 135ml' }
  ],
  'Thuốc sát khuẩn': [
    { name: 'Betadine 10%', price: 38000, unit: 'chai', desc: 'Dung dịch sát khuẩn vết thương. Chai 30ml' }
  ],
  'Thuốc bôi ngoài da': [
    { name: 'Fucicort Cream', price: 95000, unit: 'tuýp', desc: 'Kem bôi trị viêm da, dị ứng da. Tuýp 10g' }
  ],
  'Thuốc trị mụn': [
    { name: 'Acnes Spot Care', price: 55000, unit: 'tuýp', desc: 'Gel trị mụn, giảm viêm mụn hiệu quả. Tuýp 25g' }
  ],
  'Thuốc bôi sẹo - liền sẹo': [
    { name: 'Dermatix Ultra', price: 285000, unit: 'tuýp', desc: 'Gel trị sẹo lồi, sẹo phì đại. Tuýp 15g' }
  ],
  'Thuốc tai mũi họng': [
    { name: 'Strepsils Original', price: 48000, unit: 'hộp', desc: 'Viên ngậm giảm đau họng, kháng khuẩn. Hộp 24 viên' }
  ],
  'Thuốc trị đau nhức dầu': [
    { name: 'Paracetamol 500mg', price: 25000, unit: 'hộp', desc: 'Thuốc giảm đau, hạ sốt an toàn. Hộp 100 viên' }
  ],
  'Thuốc trị viêm xoang': [
    { name: 'Sinumax', price: 95000, unit: 'hộp', desc: 'Viên uống hỗ trợ giảm viêm xoang. Hộp 30 viên' }
  ],
  'Thuốc trị tăng nhãn áp': [
    { name: 'Timolol 0.5%', price: 125000, unit: 'chai', desc: 'Thuốc nhỏ mắt điều trị tăng nhãn áp. Chai 5ml' }
  ],
  'Thuốc xịt hen suyễn': [
    { name: 'Ventolin Inhaler', price: 185000, unit: 'chai', desc: 'Thuốc xịt điều trị hen suyễn. Chai xịt' }
  ],
  'Thuốc bôi răng miệng': [
    { name: 'Tantum Verde Gel', price: 72000, unit: 'tuýp', desc: 'Gel bôi giảm đau loét miệng. Tuýp 20g' }
  ],
  'Dung dịch súc miệng': [
    { name: 'Garglin', price: 45000, unit: 'chai', desc: 'Dung dịch súc miệng kháng khuẩn. Chai 250ml' }
  ],
  'Ống hít mũi': [
    { name: 'Poy-Sian', price: 15000, unit: 'ống', desc: 'Dầu lăn thông mũi, giảm nghẹt mũi. Ống 2ml' }
  ],
  
  // === VITAMINS & SUPPLEMENTS ===
  'Bổ xương khớp': [
    { name: 'Glucosamine 1500mg', price: 320000, unit: 'hộp', desc: 'Viên uống bổ xương khớp, giảm đau khớp. Hộp 60 viên' },
    { name: 'Move Free Advanced', price: 485000, unit: 'hộp', desc: 'Viên uống hỗ trợ xương khớp chắc khỏe. Hộp 80 viên' }
  ],
  'Thuốc bổ': [
    { name: 'Multivitamin Centrum', price: 385000, unit: 'hộp', desc: 'Vitamin tổng hợp cho người lớn. Hộp 100 viên' }
  ],
  'Thuốc bổ điện giải': [
    { name: 'Oresol', price: 35000, unit: 'hộp', desc: 'Bổ sung điện giải, phòng mất nước. Hộp 20 gói' }
  ],
  'Siro bổ': [
    { name: 'Siro Apeton', price: 125000, unit: 'chai', desc: 'Siro bổ sung vitamin, kích thích ăn ngon. Chai 200ml' },
    { name: 'Siro Pediakid', price: 185000, unit: 'chai', desc: 'Siro bổ sung vitamin cho trẻ em. Chai 125ml' }
  ],
  'Thuốc tăng cường sức đề kháng': [
    { name: 'Vitamin C 1000mg', price: 145000, unit: 'hộp', desc: 'Viên sủi bổ sung vitamin C, tăng đề kháng. Hộp 20 viên' }
  ],
  'Dinh dưỡng': [
    { name: 'Ensure Gold', price: 625000, unit: 'hộp', desc: 'Sữa dinh dưỡng cho người lớn tuổi. Hộp 850g' }
  ],
  
  // === DIGESTIVE ===
  'Khó tiêu': [
    { name: 'Motilium 10mg', price: 65000, unit: 'hộp', desc: 'Thuốc điều trị khó tiêu, đầy hơi. Hộp 30 viên' }
  ],
  'Táo bón': [
    { name: 'Duphalac', price: 95000, unit: 'chai', desc: 'Siro nhuận tràng, điều trị táo bón. Chai 200ml' }
  ],
  'Đại tràng': [
    { name: 'Smecta', price: 85000, unit: 'hộp', desc: 'Thuốc điều trị tiêu chảy cấp. Hộp 30 gói' }
  ],
  
  // === CARDIOVASCULAR ===
  'Huyết áp': [
    { name: 'Amlodipine 5mg', price: 45000, unit: 'hộp', desc: 'Thuốc điều trị tăng huyết áp. Hộp 100 viên' }
  ],
  'Suy dãn tĩnh mạch': [
    { name: 'Daflon 500mg', price: 285000, unit: 'hộp', desc: 'Thuốc điều trị suy giãn tĩnh mạch. Hộp 60 viên' }
  ],
  'Tuần hoàn máu': [
    { name: 'Ginkgo Biloba 120mg', price: 280000, unit: 'hộp', desc: 'Viên uống hỗ trợ tuần hoàn não. Hộp 60 viên' }
  ],
  
  // === PERSONAL CARE - HAIR ===
  'Dầu gội trị gàu': [
    { name: 'Clear Men', price: 125000, unit: 'chai', desc: 'Dầu gội trị gàu cho nam giới. Chai 630ml' }
  ],
  'Dầu mù u': [
    { name: 'Dầu Mù U Sơn Tùng', price: 45000, unit: 'chai', desc: 'Dầu mù u nguyên chất, giảm ngứa da đầu. Chai 50ml' }
  ],
  'Dầu gội giúp giảm nám và ngứa da đầu': [
    { name: 'Selsun', price: 95000, unit: 'chai', desc: 'Dầu gội trị nấm da đầu, giảm ngứa. Chai 100ml' }
  ],
  'Dầu gội đầu xả': [
    { name: 'Dove Shampoo', price: 135000, unit: 'chai', desc: 'Dầu gội dưỡng ẩm, mềm mượt. Chai 650ml' }
  ],
  'Dưỡng tóc, ủ tóc': [
    { name: 'Tresemme Hair Mask', price: 145000, unit: 'hũ', desc: 'Kem ủ tóc phục hồi hư tổn. Hũ 180ml' }
  ],
  'Chăm sóc chuyên sâu cho tóc': [
    { name: 'Loreal Serum', price: 185000, unit: 'chai', desc: 'Serum dưỡng tóc chuyên sâu. Chai 50ml' }
  ],
  
  // === PERSONAL CARE - SKIN ===
  'Chăm sóc da nứt nẻ': [
    { name: 'Vaseline Intensive Care', price: 85000, unit: 'chai', desc: 'Sữa dưỡng thể cho da khô, nứt nẻ. Chai 400ml' }
  ],
  'Chăm sóc ngực': [
    { name: 'Palmer\'s Bust Cream', price: 195000, unit: 'tuýp', desc: 'Kem săn chắc vùng ngực. Tuýp 125g' }
  ],
  'Chăm sóc răng': [
    { name: 'Sensodyne Repair', price: 95000, unit: 'tuýp', desc: 'Kem đánh răng cho răng nhạy cảm. Tuýp 100g' }
  ],
  'Chăm sóc vết thương': [
    { name: 'Băng cá nhân 3M Nexcare', price: 35000, unit: 'hộp', desc: 'Băng cá nhân chống thấm nước. Hộp 20 miếng' },
    { name: 'Gạc y tế vô trùng', price: 25000, unit: 'hộp', desc: 'Gạc y tế vô trùng, thấm hút tốt. Hộp 100 miếng' }
  ],
  'Chỉ nha khoa': [
    { name: 'Oral-B Floss', price: 45000, unit: 'hộp', desc: 'Chỉ nha khoa làm sạch kẽ răng. Hộp 50m' }
  ],
  'Chống nắng toàn thân': [
    { name: 'Nivea Sun SPF50', price: 185000, unit: 'chai', desc: 'Kem chống nắng toàn thân. Chai 200ml' }
  ],
  'Kem dưỡng da tay, chân': [
    { name: 'Neutrogena Hand Cream', price: 125000, unit: 'tuýp', desc: 'Kem dưỡng da tay chuyên sâu. Tuýp 75ml' }
  ],
  'Kem chống nắng da mặt': [
    { name: 'La Roche-Posay SPF50+', price: 385000, unit: 'tuýp', desc: 'Kem chống nắng da mặt. Tuýp 50ml' }
  ],
  'Lăn khử mùi, xịt khử mùi': [
    { name: 'Rexona Men', price: 65000, unit: 'chai', desc: 'Lăn khử mùi nam giới. Chai 50ml' }
  ],
  'Massage': [
    { name: 'Dầu massage thảo dược', price: 95000, unit: 'chai', desc: 'Dầu massage thư giãn cơ bắp. Chai 100ml' }
  ],
  'Sữa dưỡng thể, kem dưỡng thể': [
    { name: 'Vaseline Body Lotion', price: 125000, unit: 'chai', desc: 'Sữa dưỡng thể dưỡng ẩm. Chai 400ml' }
  ],
  
  // === PERSONAL CARE - FACE ===
  'Dưỡng da mắt': [
    { name: 'Innisfree Eye Cream', price: 285000, unit: 'tuýp', desc: 'Kem dưỡng mắt giảm quầng thâm. Tuýp 30ml' }
  ],
  'Hỗ trợ cải thiện nếp nhăn vùng mắt': [
    { name: 'Olay Regenerist Eye', price: 385000, unit: 'tuýp', desc: 'Kem mắt chống lão hóa. Tuýp 15ml' }
  ],
  'Hỗ trợ cải thiện quầng thâm, bọng mắt': [
    { name: 'Garnier Eye Roll-On', price: 145000, unit: 'chai', desc: 'Lăn mắt giảm quầng thâm. Chai 15ml' }
  ],
  'Mặt nạ': [
    { name: 'Innisfree Sheet Mask', price: 25000, unit: 'miếng', desc: 'Mặt nạ giấy dưỡng da. 1 miếng' }
  ],
  'Nước tẩy trang, dầu tẩy trang': [
    { name: 'Bioderma Sensibio H2O', price: 385000, unit: 'chai', desc: 'Nước tẩy trang dịu nhẹ. Chai 500ml' }
  ],
  'Serum, Essence hoặc Ampoule': [
    { name: 'The Ordinary Niacinamide', price: 285000, unit: 'chai', desc: 'Serum se khít lỗ chân lông. Chai 30ml' }
  ],
  'Toner (nước hoa hồng) / Lotion': [
    { name: 'Hada Labo Lotion', price: 245000, unit: 'chai', desc: 'Nước hoa hồng dưỡng ẩm. Chai 170ml' }
  ],
  'Tẩy tế bào chết': [
    { name: 'St.Ives Scrub', price: 125000, unit: 'tuýp', desc: 'Tẩy tế bào chết mặt. Tuýp 170g' }
  ],
  'Xịt khoáng': [
    { name: 'Avene Thermal Water', price: 285000, unit: 'chai', desc: 'Xịt khoáng dưỡng da. Chai 300ml' }
  ],
  
  // === COSMETICS ===
  'Trang điểm mắt': [
    { name: 'Maybelline Mascara', price: 185000, unit: 'cây', desc: 'Mascara làm dày mi. 1 cây' }
  ],
  
  // === MEDICAL SUPPLIES ===
  'Bàn chải điện': [
    { name: 'Oral-B Electric', price: 485000, unit: 'cái', desc: 'Bàn chải đánh răng điện. 1 cái' }
  ],
  'Bông y tế': [
    { name: 'Bông gạc y tế', price: 25000, unit: 'gói', desc: 'Bông gạc y tế vô trùng. Gói 100g' }
  ],
  'Băng y tế': [
    { name: 'Băng cuộn y tế', price: 15000, unit: 'cuộn', desc: 'Băng cuộn y tế. Cuộn 5cm x 5m' }
  ],
  'Cồn, nước sát trùng, nước muối': [
    { name: 'Cồn 70 độ', price: 25000, unit: 'chai', desc: 'Cồn sát trùng y tế. Chai 100ml' },
    { name: 'Nước muối sinh lý', price: 15000, unit: 'chai', desc: 'Nước muối sinh lý 0.9%. Chai 100ml' }
  ],
  'Khẩu trang vải': [
    { name: 'Khẩu trang vải kháng khuẩn', price: 50000, unit: 'hộp', desc: 'Khẩu trang vải có thể tái sử dụng. Hộp 10 cái' }
  ],
  'Miếng dán giảm đau, hạ sốt': [
    { name: 'Kool Fever', price: 45000, unit: 'hộp', desc: 'Miếng dán hạ sốt nhanh. Hộp 6 miếng' },
    { name: 'Salonpas Patch', price: 55000, unit: 'hộp', desc: 'Miếng dán giảm đau cơ, xương khớp. Hộp 10 miếng' }
  ],
  'Xịt giảm đau, kháng viêm': [
    { name: 'Salonpas Spray', price: 95000, unit: 'chai', desc: 'Xịt giảm đau nhanh, kháng viêm. Chai 80ml' }
  ],
  
  // === PATCHES & OILS ===
  'Cao xoa': [
    { name: 'Cao Sao Vàng', price: 25000, unit: 'hộp', desc: 'Cao xoa giảm đau, thông kinh lạc. Hộp 4g' }
  ],
  'Dầu gió': [
    { name: 'Dầu Gió Xanh Con Ó', price: 18000, unit: 'chai', desc: 'Dầu gió thơm mát, giảm đau đầu. Chai 12ml' }
  ],
  'Dầu nóng xoa bóp': [
    { name: 'Dầu Nóng Thái Lan', price: 45000, unit: 'chai', desc: 'Dầu nóng xoa bóp giảm đau. Chai 120ml' }
  ],
  'Miếng dán hạ sốt': [
    { name: 'Miếng dán hạ sốt trẻ em', price: 38000, unit: 'hộp', desc: 'Miếng dán hạ sốt cho trẻ. Hộp 4 miếng' }
  ],
  'Miếng dán say tàu xe': [
    { name: 'Miếng dán say tàu xe', price: 25000, unit: 'hộp', desc: 'Miếng dán phòng say tàu xe. Hộp 6 miếng' }
  ],
  'Miếng dán thu giãn': [
    { name: 'Miếng dán thư giãn cơ', price: 65000, unit: 'hộp', desc: 'Miếng dán giảm căng cơ. Hộp 8 miếng' }
  ],
  
  // === MEDICAL DEVICES ===
  'Các dụng cụ và sản phẩm khác': [
    { name: 'Bơm tiêm y tế', price: 5000, unit: 'cái', desc: 'Bơm tiêm dùng một lần. 1 cái' }
  ],
  'Dụng cụ cạo râu': [
    { name: 'Dao cạo râu Gillette', price: 85000, unit: 'hộp', desc: 'Dao cạo râu 3 lưỡi. Hộp 4 cái' }
  ],
  'Dụng cụ tẩy lông': [
    { name: 'Kem tẩy lông Veet', price: 95000, unit: 'tuýp', desc: 'Kem tẩy lông an toàn. Tuýp 100ml' }
  ],
  'Dụng cụ vệ sinh mũi': [
    { name: 'Máy hút mũi trẻ em', price: 185000, unit: 'cái', desc: 'Máy hút mũi điện cho bé. 1 cái' }
  ],
  'Dụng cụ vệ sinh tai': [
    { name: 'Tăm bông y tế', price: 15000, unit: 'hộp', desc: 'Tăm bông vệ sinh tai. Hộp 100 cái' }
  ],
  'Găng tay': [
    { name: 'Găng tay y tế', price: 35000, unit: 'hộp', desc: 'Găng tay cao su y tế. Hộp 100 cái' }
  ],
  'Kim các loại': [
    { name: 'Kim tiêm y tế', price: 5000, unit: 'cái', desc: 'Kim tiêm dùng một lần. 1 cái' }
  ],
  'Máy massage': [
    { name: 'Máy massage cầm tay', price: 385000, unit: 'cái', desc: 'Máy massage thư giãn cơ bắp. 1 cái' }
  ],
  'Máy xông khí dung': [
    { name: 'Máy xông mũi họng', price: 685000, unit: 'cái', desc: 'Máy xông khí dung điều trị hô hấp. 1 cái' }
  ],
  'Máy đo SpO2': [
    { name: 'Máy đo nồng độ oxy', price: 485000, unit: 'cái', desc: 'Máy đo SpO2 kẹp ngón tay. 1 cái' }
  ],
  'Máy, que thử đường huyết': [
    { name: 'Máy đo đường huyết', price: 485000, unit: 'cái', desc: 'Máy đo đường huyết tại nhà. 1 cái' }
  ],
  'Nhiệt kế': [
    { name: 'Nhiệt kế điện tử', price: 85000, unit: 'cái', desc: 'Nhiệt kế đo trán không tiếp xúc. 1 cái' }
  ],
  'Thử thai': [
    { name: 'Que thử thai', price: 25000, unit: 'hộp', desc: 'Que thử thai chính xác cao. Hộp 2 que' }
  ],
  'Kit Test Covid': [
    { name: 'Test nhanh COVID-19', price: 45000, unit: 'hộp', desc: 'Que test nhanh COVID-19. Hộp 1 test' }
  ],
  'Túi chườm': [
    { name: 'Túi chườm nóng lạnh', price: 65000, unit: 'cái', desc: 'Túi chườm đa năng. 1 cái' }
  ],
  'Vớ ngăn tĩnh mạch': [
    { name: 'Vớ y khoa ngăn giãn tĩnh mạch', price: 185000, unit: 'đôi', desc: 'Vớ y khoa hỗ trợ tuần hoàn. 1 đôi' }
  ],
  'Đai lưng': [
    { name: 'Đai lưng cột sống', price: 285000, unit: 'cái', desc: 'Đai lưng hỗ trợ cột sống. 1 cái' }
  ],
  'Đai nẹp': [
    { name: 'Đai nẹp cổ tay', price: 125000, unit: 'cái', desc: 'Đai nẹp hỗ trợ cổ tay. 1 cái' }
  ],
  
  // === HOUSEHOLD ===
  'Chống muỗi & côn trùng': [
    { name: 'Xịt chống muỗi Soffell', price: 45000, unit: 'chai', desc: 'Xịt chống muỗi an toàn. Chai 80ml' },
    { name: 'Tinh dầu đuổi muỗi', price: 35000, unit: 'chai', desc: 'Tinh dầu tự nhiên đuổi muỗi. Chai 10ml' }
  ],
  'Đồ dùng cho bé': [
    { name: 'Bình sữa Pigeon', price: 180000, unit: 'cái', desc: 'Bình sữa nhựa PP an toàn. 240ml' },
    { name: 'Tã bỉm Pampers Newborn', price: 120000, unit: 'gói', desc: 'Tã bỉm siêu thấm cho bé. Gói 22 miếng' }
  ],
  'Đồ dùng cho mẹ': [
    { name: 'Miếng lót thấm sữa', price: 65000, unit: 'hộp', desc: 'Miếng lót thấm sữa dùng một lần. Hộp 60 miếng' }
  ],
  
  // === FOOD & BEVERAGE ===
  'Kẹo cứng': [
    { name: 'Kẹo ngậm Ricola', price: 35000, unit: 'hộp', desc: 'Kẹo ngậm thảo dược. Hộp 40g' }
  ],
  'Kẹo dẻo': [
    { name: 'Kẹo dẻo Vitamin C', price: 85000, unit: 'hộp', desc: 'Kẹo dẻo bổ sung vitamin C. Hộp 60 viên' }
  ],
  'Nước Yến': [
    { name: 'Nước yến sào Khánh Hòa', price: 185000, unit: 'hộp', desc: 'Nước yến sào nguyên chất. Hộp 6 lọ' }
  ],
  'Nước uống không gas': [
    { name: 'Nước khoáng Lavie', price: 8000, unit: 'chai', desc: 'Nước khoáng tinh khiết. Chai 500ml' }
  ],
  'Trà thảo dược': [
    { name: 'Trà giảm cân Lipton', price: 65000, unit: 'hộp', desc: 'Trà thảo dược giảm cân. Hộp 25 túi lọc' }
  ],
  'Tổ Yến': [
    { name: 'Tổ yến sào cao cấp', price: 1850000, unit: 'hộp', desc: 'Tổ yến sào nguyên tổ. Hộp 50g' }
  ],
  'Đường ăn kiêng': [
    { name: 'Đường ăn kiêng Stevia', price: 85000, unit: 'hộp', desc: 'Đường ăn kiêng không calo. Hộp 100 gói' }
  ],
  
  // === NATURAL PRODUCTS ===
  'Dầu dừa': [
    { name: 'Dầu dừa nguyên chất', price: 95000, unit: 'chai', desc: 'Dầu dừa ép lạnh nguyên chất. Chai 100ml' }
  ]
};

// Generate slug
function generateSlug(name) {
  return slugify(name, {
    lower: true,
    strict: true,
    locale: 'vi',
    remove: /[*+~.()'"!:@]/g
  });
}

// Generate SKU
function generateSKU(index) {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PRD-${timestamp}-${random}`;
}

async function addAllProducts() {
  try {
    await mongoose.connect('mongodb://localhost:27017/smart-pharmacy');
    console.log('Connected to MongoDB\n');
    
    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    
    const emptyCategories = categoryData.emptyCategories;
    const brands = categoryData.brands;
    
    console.log(`Processing ${emptyCategories.length} empty categories...\n`);
    
    const productsToInsert = [];
    let brandIndex = 0;
    let processedCount = 0;
    let skippedCount = 0;
    
    for (const category of emptyCategories) {
      const template = productDatabase[category.name];
      
      if (!template) {
        console.log(`⚠️  No template: ${category.name}`);
        skippedCount++;
        continue;
      }
      
      console.log(`✅ ${category.name}`);
      processedCount++;
      
      for (const productData of template) {
        const brand = brands[brandIndex % brands.length];
        brandIndex++;
        
        const product = {
          name: productData.name,
          slug: generateSlug(productData.name + '-' + Date.now()),
          description: productData.desc,
          shortDescription: productData.desc.substring(0, 100),
          categoryId: new mongoose.Types.ObjectId(category._id),
          brandId: new mongoose.Types.ObjectId(brand._id),
          price: productData.price,
          unit: productData.unit,
          totalStock: Math.floor(Math.random() * 51) + 50,
          sku: generateSKU(productsToInsert.length),
          imageUrls: ['https://via.placeholder.com/400x400?text=Product'],
          thumbnailUrl: 'https://via.placeholder.com/200x200?text=Thumb',
          isActive: true,
          isFeatured: Math.random() > 0.9,
          minStockLevel: 10,
          maxStockLevel: 200,
          variants: [],
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        productsToInsert.push(product);
        console.log(`   + ${product.name} (${brand.name}) - ${product.price.toLocaleString()}đ`);
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   Processed: ${processedCount} categories`);
    console.log(`   Skipped: ${skippedCount} categories`);
    console.log(`   Products to insert: ${productsToInsert.length}`);
    
    if (productsToInsert.length > 0) {
      console.log('\n📦 Inserting products...');
      const result = await Product.insertMany(productsToInsert);
      console.log(`✅ Successfully inserted ${result.length} products!`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addAllProducts();
