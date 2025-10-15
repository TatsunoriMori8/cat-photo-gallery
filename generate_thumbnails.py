#!/usr/bin/env python3
"""
背景タイル用サムネイル生成スクリプト
- ぽんちょねこ + Nohn から縦長画像を抽出
- 200x200pxの正方形サムネイルを生成（JPEGで圧縮）
"""

from PIL import Image
import os
import json
from pathlib import Path

# 設定
ALBUMS = [
    "albums/ぽんちょねこ",
    "albums/Nohn"
]
THUMBNAIL_SIZE = 200
THUMBNAIL_DIR = "albums/thumbnails"
OUTPUT_FORMAT = "JPEG"
QUALITY = 85  # JPEG圧縮品質（85 = 高品質だが軽量）

def is_portrait(image_path):
    """縦長画像かどうかを判定"""
    try:
        with Image.open(image_path) as img:
            width, height = img.size
            return height > width
    except Exception as e:
        print(f"❌ 画像読み込みエラー: {image_path} - {e}")
        return False

def create_thumbnail(image_path, output_path):
    """正方形サムネイルを生成"""
    try:
        with Image.open(image_path) as img:
            # RGBに変換（PNGのアルファチャンネル対応）
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')

            # 正方形にクロップ（中央を切り出し）
            width, height = img.size
            min_side = min(width, height)
            left = (width - min_side) // 2
            top = (height - min_side) // 2
            right = left + min_side
            bottom = top + min_side
            img_cropped = img.crop((left, top, right, bottom))

            # リサイズ
            img_thumb = img_cropped.resize((THUMBNAIL_SIZE, THUMBNAIL_SIZE), Image.Resampling.LANCZOS)

            # 保存
            img_thumb.save(output_path, OUTPUT_FORMAT, quality=QUALITY, optimize=True)

            # ファイルサイズを取得
            size_kb = os.path.getsize(output_path) / 1024
            return size_kb
    except Exception as e:
        print(f"❌ サムネイル生成エラー: {image_path} - {e}")
        return None

def main():
    print("🖼️  背景タイル用サムネイル生成開始")
    print(f"📁 出力先: {THUMBNAIL_DIR}")
    print(f"📐 サイズ: {THUMBNAIL_SIZE}x{THUMBNAIL_SIZE}px")
    print("-" * 50)

    # サムネイルディレクトリ作成
    Path(THUMBNAIL_DIR).mkdir(parents=True, exist_ok=True)

    all_thumbnails = []
    total_size = 0
    portrait_count = 0
    landscape_count = 0

    for album_path in ALBUMS:
        print(f"\n📂 処理中: {album_path}")

        if not os.path.exists(album_path):
            print(f"⚠️  アルバムが見つかりません: {album_path}")
            continue

        # 画像ファイルを取得
        image_files = []
        for ext in ['*.PNG', '*.png', '*.jpg', '*.jpeg', '*.JPG', '*.JPEG']:
            image_files.extend(Path(album_path).glob(ext))

        print(f"   画像数: {len(image_files)}枚")

        # 縦長画像のみ処理
        for img_path in image_files:
            if is_portrait(str(img_path)):
                portrait_count += 1

                # サムネイルファイル名
                album_name = Path(album_path).name
                thumb_filename = f"{album_name}_{img_path.stem}.jpg"
                thumb_path = os.path.join(THUMBNAIL_DIR, thumb_filename)

                # サムネイル生成
                size_kb = create_thumbnail(str(img_path), thumb_path)

                if size_kb:
                    all_thumbnails.append(thumb_filename)
                    total_size += size_kb
                    print(f"   ✅ {thumb_filename} ({size_kb:.1f} KB)")
            else:
                landscape_count += 1

    # manifest.json生成
    manifest = {
        "images": all_thumbnails,
        "count": len(all_thumbnails),
        "size": f"{THUMBNAIL_SIZE}x{THUMBNAIL_SIZE}",
        "format": OUTPUT_FORMAT,
        "total_size_mb": round(total_size / 1024, 2)
    }

    manifest_path = os.path.join(THUMBNAIL_DIR, "manifest.json")
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    print("\n" + "=" * 50)
    print(f"✨ 完了！")
    print(f"📊 統計:")
    print(f"   - 縦長画像: {portrait_count}枚 → サムネイル生成")
    print(f"   - 横長画像: {landscape_count}枚 → スキップ")
    print(f"   - 合計サイズ: {total_size / 1024:.2f} MB")
    print(f"   - 平均サイズ: {total_size / len(all_thumbnails):.1f} KB/枚")
    print(f"📄 manifest.json: {manifest_path}")
    print("=" * 50)

if __name__ == "__main__":
    main()
