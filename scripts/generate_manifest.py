#!/usr/bin/env python3
"""
画像マニフェスト生成スクリプト

albums/配下のすべてのアルバムをスキャンし、
各アルバムの画像ファイルリストをdata/images.jsonに出力します。

使い方:
    python3 scripts/generate_manifest.py
"""

import os
import json
import unicodedata
from pathlib import Path
from typing import Dict, List

# 対応する画像拡張子
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'}


def scan_albums(albums_dir: Path) -> Dict[str, List[str]]:
    """
    アルバムディレクトリをスキャンして画像ファイルリストを取得

    Args:
        albums_dir: albumsディレクトリのパス

    Returns:
        {アルバム名: [画像ファイル名のリスト]} の辞書
    """
    manifest = {}

    if not albums_dir.exists():
        print(f"Error: {albums_dir} が見つかりません")
        return manifest

    # アルバムディレクトリを走査
    for album_path in sorted(albums_dir.iterdir()):
        # ディレクトリのみ対象（隠しファイル除外）
        if not album_path.is_dir() or album_path.name.startswith('.'):
            continue

        # アルバム名をNFC形式に正規化（濁点・半濁点の統一）
        album_name = unicodedata.normalize('NFC', album_path.name)
        images = []

        # 画像ファイルを収集
        for file_path in sorted(album_path.iterdir()):
            if file_path.is_file() and file_path.suffix.lower() in IMAGE_EXTENSIONS:
                # ファイル名もNFC形式に正規化
                filename = unicodedata.normalize('NFC', file_path.name)
                images.append(filename)

        manifest[album_name] = images
        print(f"✓ {album_name}: {len(images)}枚")

    return manifest


def main():
    """メイン処理"""
    # プロジェクトルートディレクトリ
    project_root = Path(__file__).parent.parent
    albums_dir = project_root / 'albums'
    output_dir = project_root / 'data'
    output_file = output_dir / 'images.json'

    print("画像マニフェスト生成を開始...")
    print(f"アルバムディレクトリ: {albums_dir}")

    # アルバムをスキャン
    manifest = scan_albums(albums_dir)

    if not manifest:
        print("Error: 画像が見つかりませんでした")
        return

    # data/ディレクトリが無ければ作成
    output_dir.mkdir(exist_ok=True)

    # JSONファイルに出力
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    # 統計情報
    total_albums = len(manifest)
    total_images = sum(len(images) for images in manifest.values())

    print(f"\n✅ 完了!")
    print(f"出力ファイル: {output_file}")
    print(f"アルバム数: {total_albums}")
    print(f"総画像数: {total_images}")


if __name__ == '__main__':
    main()
