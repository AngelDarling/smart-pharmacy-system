#!/usr/bin/env python3
"""
Script để tạo font subset chỉ chứa ký tự tiếng Việt và các ký tự cơ bản
Giảm kích thước font từ ~292KB xuống còn vài chục KB
"""

import os
from fontTools.subset import Subsetter, Options
from fontTools.ttLib import TTFont

def create_font_subset(input_font_path, output_font_path):
    """Tạo font subset từ font gốc"""
    
    # Định nghĩa các ký tự cần giữ lại
    # Bao gồm: chữ cái tiếng Việt, số, ký tự đặc biệt cơ bản
    vietnamese_chars = set()
    
    # Chữ cái Latinh cơ bản (A-Z, a-z)
    vietnamese_chars.update(range(ord('A'), ord('Z') + 1))
    vietnamese_chars.update(range(ord('a'), ord('z') + 1))
    
    # Số (0-9)
    vietnamese_chars.update(range(ord('0'), ord('9') + 1))
    
    # Ký tự đặc biệt cơ bản
    basic_chars = " .,;:!?()[]{}\"'/-+=*&%$#@~`|\\_<>"
    vietnamese_chars.update(ord(c) for c in basic_chars)
    
    # Ký tự tiếng Việt đầy đủ
    # Bao gồm tất cả các ký tự có dấu
    vietnamese_with_accents = (
        # Chữ thường
        'à', 'á', 'ạ', 'ả', 'ã', 'â', 'ầ', 'ấ', 'ậ', 'ẩ', 'ẫ', 'ă', 'ằ', 'ắ', 'ặ', 'ẳ', 'ẵ',
        'è', 'é', 'ẹ', 'ẻ', 'ẽ', 'ê', 'ề', 'ế', 'ệ', 'ể', 'ễ',
        'ì', 'í', 'ị', 'ỉ', 'ĩ',
        'ò', 'ó', 'ọ', 'ỏ', 'õ', 'ô', 'ồ', 'ố', 'ộ', 'ổ', 'ỗ', 'ơ', 'ờ', 'ớ', 'ợ', 'ở', 'ỡ',
        'ù', 'ú', 'ụ', 'ủ', 'ũ', 'ư', 'ừ', 'ứ', 'ự', 'ử', 'ữ',
        'ỳ', 'ý', 'ỵ', 'ỷ', 'ỹ',
        'đ',
        # Chữ hoa
        'À', 'Á', 'Ạ', 'Ả', 'Ã', 'Â', 'Ầ', 'Ấ', 'Ậ', 'Ẩ', 'Ẫ', 'Ă', 'Ằ', 'Ắ', 'Ặ', 'Ẳ', 'Ẵ',
        'È', 'É', 'Ẹ', 'Ẻ', 'Ẽ', 'Ê', 'Ề', 'Ế', 'Ệ', 'Ể', 'Ễ',
        'Ì', 'Í', 'Ị', 'Ỉ', 'Ĩ',
        'Ò', 'Ó', 'Ọ', 'Ỏ', 'Õ', 'Ô', 'Ồ', 'Ố', 'Ộ', 'Ổ', 'Ỗ', 'Ơ', 'Ờ', 'Ớ', 'Ợ', 'Ở', 'Ỡ',
        'Ù', 'Ú', 'Ụ', 'Ủ', 'Ũ', 'Ư', 'Ừ', 'Ứ', 'Ự', 'Ử', 'Ữ',
        'Ỳ', 'Ý', 'Ỵ', 'Ỷ', 'Ỹ',
        'Đ'
    )
    vietnamese_chars.update(ord(c) for c in vietnamese_with_accents)
    
    # Đọc font gốc
    font = TTFont(input_font_path)
    
    # Tạo subsetter
    options = Options()
    options.layout_features = ['*']  # Giữ tất cả layout features
    options.hinting = True  # Giữ hinting
    options.desubroutinize = False
    
    subsetter = Subsetter(options)
    
    # Thêm các ký tự cần giữ lại
    subsetter.populate(unicodes=vietnamese_chars)
    
    # Áp dụng subset
    subsetter.subset(font)
    
    # Lưu font subset
    font.save(output_font_path)
    
    # Tính kích thước
    original_size = os.path.getsize(input_font_path)
    subset_size = os.path.getsize(output_font_path)
    reduction = (1 - subset_size / original_size) * 100
    
    print(f"✅ Font subset created successfully!")
    print(f"📁 Input: {input_font_path} ({original_size / 1024:.2f} KB)")
    print(f"📁 Output: {output_font_path} ({subset_size / 1024:.2f} KB)")
    print(f"📊 Reduction: {reduction:.1f}%")
    
    return subset_size

if __name__ == '__main__':
    import sys
    from pathlib import Path
    
    # Đường dẫn
    script_dir = Path(__file__).parent
    fonts_dir = script_dir.parent / 'public' / 'fonts'
    output_dir = script_dir.parent / 'public' / 'fonts' / 'subset'
    
    # Tạo thư mục output
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Tạo subset cho Regular và Bold
    regular_input = fonts_dir / 'NotoSans-Regular.ttf'
    regular_output = output_dir / 'NotoSans-Regular-Subset.ttf'
    
    bold_input = fonts_dir / 'NotoSans-Bold.ttf'
    bold_output = output_dir / 'NotoSans-Bold-Subset.ttf'
    
    if not regular_input.exists():
        print(f"❌ Error: {regular_input} not found!")
        sys.exit(1)
    
    if not bold_input.exists():
        print(f"❌ Error: {bold_input} not found!")
        sys.exit(1)
    
    print("Creating font subsets...")
    print("=" * 50)
    
    create_font_subset(regular_input, regular_output)
    print()
    create_font_subset(bold_input, bold_output)
    
    print()
    print("=" * 50)
    print("✅ All font subsets created successfully!")

