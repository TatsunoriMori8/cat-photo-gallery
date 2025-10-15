#!/usr/bin/env python3
"""
HEIC to WebP Converter
======================
Scans all albums for .heic/.HEIC files and converts them to WebP format.

Features:
- High-quality WebP conversion (85% quality)
- Preserves EXIF metadata
- Archives original HEIC files in .heic_archive/
- Generates images.json after conversion
- Progress bar for batch conversion

Requirements:
    pip install pillow pillow-heif

Usage:
    python3 scripts/convert_heic_to_webp.py
"""

import json
import shutil
from pathlib import Path
from typing import List, Dict

try:
    from PIL import Image
    import pillow_heif
except ImportError:
    print("❌ Required libraries not found!")
    print("Please install: pip install pillow pillow-heif")
    exit(1)

# Register HEIF opener with Pillow
pillow_heif.register_heif_opener()

# Configuration
ALBUMS_DIR = Path("albums")
ARCHIVE_DIR_NAME = ".heic_archive"
WEBP_QUALITY = 85
WEBP_METHOD = 6  # 0-6, higher = better compression but slower

def find_heic_files(albums_dir: Path) -> Dict[str, List[Path]]:
    """
    Scan all albums for HEIC files.

    Returns:
        Dict mapping album name to list of HEIC file paths
    """
    heic_files = {}

    for album_path in sorted(albums_dir.iterdir()):
        if not album_path.is_dir() or album_path.name.startswith('.'):
            continue

        album_heic = []
        for file_path in album_path.iterdir():
            if file_path.suffix.lower() in ['.heic', '.heif']:
                album_heic.append(file_path)

        if album_heic:
            heic_files[album_path.name] = sorted(album_heic)

    return heic_files


def convert_heic_to_webp(heic_path: Path, webp_path: Path) -> bool:
    """
    Convert a single HEIC file to WebP.

    Args:
        heic_path: Source HEIC file path
        webp_path: Destination WebP file path

    Returns:
        True if conversion successful, False otherwise
    """
    try:
        # Open HEIC file
        img = Image.open(heic_path)

        # Convert to RGB if necessary (WebP doesn't support some color modes)
        if img.mode not in ('RGB', 'RGBA'):
            img = img.convert('RGB')

        # Save as WebP with high quality
        img.save(
            webp_path,
            'WEBP',
            quality=WEBP_QUALITY,
            method=WEBP_METHOD,
            exif=img.info.get('exif', b'')  # Preserve EXIF metadata
        )

        return True

    except Exception as e:
        print(f"   ❌ Error converting {heic_path.name}: {e}")
        return False


def archive_heic_file(heic_path: Path, album_path: Path) -> None:
    """
    Move original HEIC file to .heic_archive/ subdirectory.

    Args:
        heic_path: HEIC file to archive
        album_path: Album directory containing the file
    """
    archive_dir = album_path / ARCHIVE_DIR_NAME
    archive_dir.mkdir(exist_ok=True)

    archive_path = archive_dir / heic_path.name
    shutil.move(str(heic_path), str(archive_path))


def run_generate_manifest() -> None:
    """
    Execute generate_manifest.py to update images.json.
    """
    import subprocess

    print("\n📋 Regenerating images.json manifest...")
    result = subprocess.run(
        ["python3", "scripts/generate_manifest.py"],
        capture_output=True,
        text=True
    )

    if result.returncode == 0:
        print("✅ images.json updated successfully")
    else:
        print(f"❌ Error regenerating manifest: {result.stderr}")


def main():
    """
    Main conversion workflow.
    """
    print("🔄 HEIC to WebP Converter")
    print("=" * 50)

    # Check if albums directory exists
    if not ALBUMS_DIR.exists():
        print(f"❌ Albums directory not found: {ALBUMS_DIR}")
        return

    # Find all HEIC files
    heic_files = find_heic_files(ALBUMS_DIR)

    if not heic_files:
        print("✅ No HEIC files found. All images are already in supported formats.")
        return

    # Display summary
    total_files = sum(len(files) for files in heic_files.values())
    print(f"\n📁 Found {total_files} HEIC file(s) across {len(heic_files)} album(s):")
    for album, files in heic_files.items():
        print(f"   • {album}: {len(files)} file(s)")

    # Confirm conversion
    print(f"\n⚙️  Conversion settings:")
    print(f"   • WebP quality: {WEBP_QUALITY}%")
    print(f"   • Original files will be moved to: [album]/{ARCHIVE_DIR_NAME}/")

    response = input("\n❓ Proceed with conversion? [y/N]: ").strip().lower()
    if response not in ('y', 'yes'):
        print("❌ Conversion cancelled.")
        return

    # Convert files
    print("\n🚀 Starting conversion...")
    converted = 0
    failed = 0

    for album_name, files in heic_files.items():
        album_path = ALBUMS_DIR / album_name
        print(f"\n📂 Album: {album_name}")

        for heic_path in files:
            # Generate WebP filename
            webp_path = heic_path.with_suffix('.webp')

            print(f"   🔄 {heic_path.name} → {webp_path.name}...", end=" ")

            # Convert
            if convert_heic_to_webp(heic_path, webp_path):
                print("✅")

                # Archive original HEIC file
                archive_heic_file(heic_path, album_path)
                converted += 1
            else:
                print("❌")
                failed += 1

    # Summary
    print("\n" + "=" * 50)
    print(f"✅ Conversion complete!")
    print(f"   • Converted: {converted} file(s)")
    if failed > 0:
        print(f"   • Failed: {failed} file(s)")

    # Regenerate images.json
    if converted > 0:
        run_generate_manifest()

    print("\n💡 Tips:")
    print("   • Original HEIC files are in [album]/.heic_archive/")
    print("   • You can safely delete .heic_archive/ folders if WebP looks good")
    print("   • Run git add and git commit to save changes")


if __name__ == "__main__":
    main()
