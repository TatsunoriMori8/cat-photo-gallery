#!/usr/bin/env python3
"""
PWA用のアイコンを生成
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, output_path):
    """シンプルな猫アイコンを作成"""
    # 黒背景
    img = Image.new('RGB', (size, size), color='#000000')
    draw = ImageDraw.Draw(img)

    # 中央に猫の絵文字風デザイン
    # 猫顔を描く（シンプルな円形）
    center = size // 2
    face_radius = int(size * 0.35)

    # 顔（白色）
    draw.ellipse(
        [center - face_radius, center - face_radius,
         center + face_radius, center + face_radius],
        fill='#FFFFFF'
    )

    # 左耳（三角形）
    ear_size = int(face_radius * 0.6)
    left_ear_points = [
        (center - face_radius * 0.7, center - face_radius * 0.7),
        (center - face_radius * 0.3, center - face_radius * 1.1),
        (center - face_radius * 0.9, center - face_radius * 1.1),
    ]
    draw.polygon(left_ear_points, fill='#FFFFFF')

    # 右耳（三角形）
    right_ear_points = [
        (center + face_radius * 0.7, center - face_radius * 0.7),
        (center + face_radius * 0.3, center - face_radius * 1.1),
        (center + face_radius * 0.9, center - face_radius * 1.1),
    ]
    draw.polygon(right_ear_points, fill='#FFFFFF')

    # 目（黒点）
    eye_y = center - int(face_radius * 0.2)
    eye_x_offset = int(face_radius * 0.4)
    eye_radius = int(face_radius * 0.15)

    # 左目
    draw.ellipse(
        [center - eye_x_offset - eye_radius, eye_y - eye_radius,
         center - eye_x_offset + eye_radius, eye_y + eye_radius],
        fill='#000000'
    )

    # 右目
    draw.ellipse(
        [center + eye_x_offset - eye_radius, eye_y - eye_radius,
         center + eye_x_offset + eye_radius, eye_y + eye_radius],
        fill='#000000'
    )

    # 鼻（小さな三角形）
    nose_y = center + int(face_radius * 0.1)
    nose_size = int(face_radius * 0.2)
    nose_points = [
        (center, nose_y + nose_size),
        (center - nose_size, nose_y - nose_size),
        (center + nose_size, nose_y - nose_size),
    ]
    draw.polygon(nose_points, fill='#FF69B4')

    # 口（2本の線）
    mouth_y = nose_y + nose_size + int(face_radius * 0.1)
    mouth_width = int(face_radius * 0.5)
    draw.line(
        [(center, nose_y + nose_size), (center - mouth_width, mouth_y)],
        fill='#000000',
        width=max(2, size // 100)
    )
    draw.line(
        [(center, nose_y + nose_size), (center + mouth_width, mouth_y)],
        fill='#000000',
        width=max(2, size // 100)
    )

    # 保存
    img.save(output_path, 'PNG')
    print(f"✅ Created {output_path} ({size}x{size})")

def main():
    # 192x192と512x512のアイコンを作成
    create_icon(192, 'icon-192.png')
    create_icon(512, 'icon-512.png')
    print("\n✨ All icons created successfully!")

if __name__ == '__main__':
    main()
