#!/usr/bin/env python3
"""
Script để tải font Noto Sans và tạo subset chỉ chứa ký tự tiếng Việt
"""

import os
import urllib.request
from pathlib import Path
from fontTools.subset import Subsetter, Options
from fontTools.ttLib import TTFont

def download_font(url, output_path):
    """Tải font từ URL"""
    print(f"Downloading font from {url}...")
    urllib.request.urlretrieve(url, output_path)
    print(f"✅ Downloaded to {output_path}")

def create_font_subset(input_font_path, output_font_path):
    """Tạo font subset chỉ chứa ký tự tiếng Việt"""
    
    # Định nghĩa các ký tự cần giữ lại
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
    vietnamese_with_accents = (
        'à', 'á', 'ạ', 'ả', 'ã', 'â', 'ầ', 'ấ', 'ậ', 'ẩ', 'ẫ', 'ă', 'ằ', 'ắ', 'ặ', 'ẳ', 'ẵ',
        'è', 'é', 'ẹ', 'ẻ', 'ẽ', 'ê', 'ề', 'ế', 'ệ', 'ể', 'ễ',
        'ì', 'í', 'ị', 'ỉ', 'ĩ',
        'ò', 'ó', 'ọ', 'ỏ', 'õ', 'ô', 'ồ', 'ố', 'ộ', 'ổ', 'ỗ', 'ơ', 'ờ', 'ớ', 'ợ', 'ở', 'ỡ',
        'ù', 'ú', 'ụ', 'ủ', 'ũ', 'ư', 'ừ', 'ứ', 'ự', 'ử', 'ữ',
        'ỳ', 'ý', 'ỵ', 'ỷ', 'ỹ',
        'đ',
        'À', 'Á', 'Ạ', 'Ả', 'Ã', 'Â', 'Ầ', 'Ấ', 'Ậ', 'Ẩ', 'Ẫ', 'Ă', 'Ằ', 'Ắ', 'Ặ', 'Ẳ', 'Ẵ',
        'È', 'É', 'Ẹ', 'Ẻ', 'Ẽ', 'Ê', 'Ề', 'Ế', 'Ệ', 'Ể', 'Ễ',
        'Ì', 'Í', 'Ị', 'Ỉ', 'Ĩ',
        'Ò', 'Ó', 'Ọ', 'Ỏ', 'Õ', 'Ô', 'Ồ', 'Ố', 'Ộ', 'Ổ', 'Ỗ', 'Ơ', 'Ờ', 'Ớ', 'Ợ', 'Ở', 'Ỡ',
        'Ù', 'Ú', 'Ụ', 'Ủ', 'Ũ', 'Ư', 'Ừ', 'Ứ', 'Ự', 'Ử', 'Ữ',
        'Ỳ', 'Ý', 'Ỵ', 'Ỷ', 'Ỹ',
        'Đ'
    )
    vietnamese_chars.update(ord(c) for c in vietnamese_with_accents)
    
    # Đọc font
    print(f"Reading font from {input_font_path}...")
    font = TTFont(input_font_path)
    
    # Tạo subsetter
    options = Options()
    options.layout_features = ['*']
    options.hinting = True
    options.desubroutinize = False
    
    subsetter = Subsetter(options)
    subsetter.populate(unicodes=vietnamese_chars)
    subsetter.subset(font)
    
    # Lưu font subset
    print(f"Saving subset to {output_font_path}...")
    font.save(output_font_path)
    
    # Tính kích thước
    original_size = os.path.getsize(input_font_path)
    subset_size = os.path.getsize(output_font_path)
    reduction = (1 - subset_size / original_size) * 100
    
    print(f"✅ Font subset created!")
    print(f"   Original: {original_size / 1024:.2f} KB")
    print(f"   Subset: {subset_size / 1024:.2f} KB")
    print(f"   Reduction: {reduction:.1f}%")
    
    return subset_size

if __name__ == '__main__':
    script_dir = Path(__file__).parent
    fonts_dir = script_dir.parent / 'public' / 'fonts'
    subset_dir = fonts_dir / 'subset'
    
    subset_dir.mkdir(parents=True, exist_ok=True)
    
    # Sử dụng font đã tải từ Google Fonts CDN
    temp_regular = subset_dir / 'temp-regular.ttf'
    temp_bold = subset_dir / 'temp-bold.ttf'
    
    if not temp_regular.exists() or not temp_bold.exists():
        print("❌ Font files not found. Please download them first.")
        print("   Run: curl -L 'https://fonts.gstatic.com/s/notosans/v42/o-0mIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyD9A99d.ttf' -o public/fonts/subset/temp-regular.ttf")
        print("   Run: curl -L 'https://fonts.gstatic.com/s/notosans/v42/o-0mIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyAaBN9d.ttf' -o public/fonts/subset/temp-bold.ttf")
        exit(1)
    
    try:
        
        print()
        print("=" * 60)
        print("Creating font subsets...")
        print("=" * 60)
        
        regular_output = subset_dir / 'NotoSans-Regular-Subset.ttf'
        bold_output = subset_dir / 'NotoSans-Bold-Subset.ttf'
        
        create_font_subset(temp_regular, regular_output)
        print()
        create_font_subset(temp_bold, bold_output)
        
        print()
        print("=" * 60)
        print("✅ All font subsets created successfully!")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

