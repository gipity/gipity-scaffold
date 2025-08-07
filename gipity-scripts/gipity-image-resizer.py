#!/usr/bin/env python3

#==============================================================================
# Gipity Scaffold - Image Asset Generator
#
# Processes master images and generates all required sizes for multi-platform deployment
#
# Copyright (c) 2025 Gipity. Licensed under the MIT License.
#
# This script is part of the Gipity Scaffold:
# https://github.com/gipity/gipity-scaffold
#
# For additional support:
# https://www.gipity.com
#
# MIT licensed – free to use in your own apps.
# Please do not resell or repackage as part of a commercial toolkit unless you're building on it in good faith and contributing back.
# ===========================================================

"""
INSTRUCTIONS: Gipity Scaffold Image Asset Generator

This script processes master images and generates all required sizes for:
- Web PWA icons and logos
- Native iOS app icons and splash screens
- Native Android app icons and splash screens

Usage:
    python3 gipity-image-resizer.py

Requirements:
    pip install Pillow

Master Image Requirements (in master-images/ folder):

1. icon-master.png: 1024x1024px PNG
   - Transparency: REQUIRED (transparent background)
   - Padding: 100px minimum safe area from edges
   - Usage: App icons for iOS, Android, and web platforms

2. logo-master.png: 480x128px PNG
   - Transparency: REQUIRED (transparent background)
   - Aspect ratio: Landscape rectangle (3.75:1 ratio)
   - Usage: Header logo for web, iOS, and Android applications

3. logo-inverted-master.png: 480x128px PNG
   - Transparency: REQUIRED (transparent background)
   - Aspect ratio: Landscape rectangle (3.75:1 ratio)
   - Usage: Inverted color variant of header logo for optional use in apps

4. splash-square-master.png: 2732x2732px PNG
   - Transparency: OPTIONAL (can use solid color background)
   - Padding: 400px safe area from edges
   - Usage: iOS splash screens (resized to various dimensions)

5. splash-android-portrait-master.png: 1280x1920px PNG
   - Transparency: OPTIONAL (can use solid color background)
   - Padding: 200px horizontal, 300px vertical safe areas
   - Usage: Android portrait splash screens

6. splash-android-landscape-master.png: 1920x1280px PNG
   - Transparency: OPTIONAL (can use solid color background)
   - Padding: 300px horizontal, 200px vertical safe areas
   - Usage: Android landscape splash screens

7. splash-icon-square-master.png: 1024x1024px PNG
   - Transparency: REQUIRED (transparent background)
   - Padding: 200px minimum safe area from edges
   - Usage: Android 12+ centered splash screen icons
"""

import os
import sys
import shutil
import json
from PIL import Image, ImageOps

#==============================================================================
# CONFIGURATION
#==============================================================================

# Get the project root directory (parent of gipity-scripts folder)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)

#==============================================================================
# UTILITY FUNCTIONS
#==============================================================================

def ensure_directory(path):
    """Create directory if it doesn't exist"""
    os.makedirs(path, exist_ok=True)

def get_project_path(relative_path):
    """Get absolute path relative to project root"""
    return os.path.join(PROJECT_ROOT, relative_path)

def resize_image(source_path, output_path, size, maintain_aspect=True, adaptive_icon_safe_margin=False):
    """
    Resize image to specified size with quality preservation
    
    Args:
        source_path: Path to source image
        output_path: Path for output image
        size: Target size tuple (width, height)
        maintain_aspect: Whether to maintain aspect ratio
        adaptive_icon_safe_margin: Apply 70% safe margin for Android adaptive icons
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        with Image.open(source_path) as source_img:
            # Handle None size (keep original dimensions)
            if size is None:
                size = source_img.size
            
            # True direct copy optimization for exact size matches
            if source_img.size == size:
                ensure_directory(os.path.dirname(output_path))
                shutil.copy2(source_path, output_path)
                print(f"✅ Direct copy: {output_path} ({size[0]}x{size[1]})")
                return True
            
            # Convert to RGBA if not already
            img = source_img.convert('RGBA') if source_img.mode != 'RGBA' else source_img.copy()
            
            if maintain_aspect:
                # Apply safe margin for Android adaptive icons (70% of canvas)
                if adaptive_icon_safe_margin:
                    target_size = (int(size[0] * 0.7), int(size[1] * 0.7))
                    img.thumbnail(target_size, Image.Resampling.LANCZOS)
                else:
                    img.thumbnail(size, Image.Resampling.LANCZOS)
                
                # Create new image with transparent background and center the resized image
                new_img = Image.new('RGBA', size, (0, 0, 0, 0))
                x = (size[0] - img.width) // 2
                y = (size[1] - img.height) // 2
                new_img.paste(img, (x, y), img)
                img = new_img
            else:
                # Stretch to exact size
                img = img.resize(size, Image.Resampling.LANCZOS)
            
            # Save as PNG with transparency and quality preservation
            ensure_directory(os.path.dirname(output_path))
            img.save(output_path, 'PNG', optimize=False)
            print(f"✅ Created: {output_path} ({size[0]}x{size[1]})")
            return True
            
    except Exception as e:
        print(f"❌ Error creating {output_path}: {e}")
        return False

#==============================================================================
# WEB PWA ASSET GENERATION
#==============================================================================

def generate_web_icons(icon_master_path):
    """Generate web PWA icons"""
    print("Generating Web PWA icons...")
    
    web_sizes = [
        (192, 192),  # PWA manifest standard
        (512, 512),  # PWA manifest large
    ]
    
    ensure_directory(get_project_path("public/icons"))
    
    success_count = 0
    for size in web_sizes:
        output_path = get_project_path(f"public/icons/icon-{size[0]}x{size[1]}.png")
        if resize_image(icon_master_path, output_path, size):
            success_count += 1
    
    print(f"✅ Web PWA icons: {success_count}/{len(web_sizes)} generated")
    return success_count

def generate_web_logos(logo_master_path):
    """Generate web header logos and responsive icon assets"""
    print("Generating Web header logos and responsive assets...")
    
    ensure_directory(get_project_path("public/icons"))
    ensure_directory(get_project_path("client/src/assets"))
    
    success_count = 0
    
    # Logo variants at different DPI levels
    logo_variants = [
        ((120, 32), get_project_path("public/icons/logo.png")),           # 1x for public folder
        ((120, 32), get_project_path("client/src/assets/logo.png")),      # 1x for Vite assets
        ((240, 64), get_project_path("client/src/assets/logo@2x.png")),   # 2x for high-DPI
        ((360, 96), get_project_path("client/src/assets/logo@3x.png")),   # 3x for very high-DPI
    ]
    
    # Icon variants at different DPI levels
    icon_master_path = get_project_path("master-images/icon-master.png")
    icon_variants = [
        ((64, 64), get_project_path("client/src/assets/icon-64x64.png")),     # 1x for standard displays
        ((128, 128), get_project_path("client/src/assets/icon-128x128.png")), # 2x for retina displays
    ]
    
    # Generate logo variants
    for size, output_path in logo_variants:
        if resize_image(logo_master_path, output_path, size, maintain_aspect=True):
            success_count += 1
    
    # Generate icon variants from icon master
    if os.path.exists(icon_master_path):
        for size, output_path in icon_variants:
            if resize_image(icon_master_path, output_path, size, maintain_aspect=True):
                success_count += 1
    else:
        print("Warning: icon-master.png not found - skipping icon variants")
    
    # Copy 192x192 icon to assets folder for import consistency
    icon_192_path = get_project_path("public/icons/icon-192x192.png")
    if os.path.exists(icon_192_path):
        try:
            shutil.copy2(icon_192_path, get_project_path("client/src/assets/icon-192x192.png"))
            print("✅ Copied: icon-192x192.png to assets folder")
            success_count += 1  # Count copy operations as files placed in destinations
        except Exception as e:
            print(f"❌ Error copying icon to assets: {e}")
    
    total_expected = len(logo_variants) + len(icon_variants) + 1  # Include copy operation
    print(f"✅ Web logos and assets: {success_count}/{total_expected} generated")
    return success_count

def generate_web_logos_inverted(logo_inverted_master_path):
    """Generate web header inverted logos and responsive icon assets"""
    print("Generating Web header inverted logos and responsive assets...")
    
    ensure_directory(get_project_path("public/icons"))
    ensure_directory(get_project_path("client/src/assets"))
    
    success_count = 0
    
    # Logo variants at different DPI levels
    logo_variants = [
        ((120, 32), get_project_path("public/icons/logo-inverted.png")),           # 1x for public folder
        ((120, 32), get_project_path("client/src/assets/logo-inverted.png")),      # 1x for Vite assets
        ((240, 64), get_project_path("client/src/assets/logo-inverted@2x.png")),   # 2x for high-DPI
        ((360, 96), get_project_path("client/src/assets/logo-inverted@3x.png")),   # 3x for very high-DPI
    ]
    
    # Generate logo variants
    for size, output_path in logo_variants:
        if resize_image(logo_inverted_master_path, output_path, size, maintain_aspect=True):
            success_count += 1
    
    print(f"✅ Web inverted logos and assets: {success_count}/{len(logo_variants)} generated")
    return success_count

#==============================================================================
# iOS ASSET GENERATION
#==============================================================================

def generate_ios_icons(icon_master_path):
    """Generate iOS app icons - complete set to override Capacitor defaults"""
    print("Generating iOS app icons...")
    
    # Standard iOS icon sizes
    ios_sizes = [
        (1024, 1024), # App Store
        (180, 180),   # iPhone home screen @3x
        (167, 167),   # iPad Pro home screen
        (152, 152),   # iPad home screen @2x
        (120, 120),   # iPhone spotlight @3x / iPhone home screen @2x
        (114, 114),   # iPhone 4/4S home screen @2x
        (87, 87),     # iPhone settings @3x
        (80, 80),     # iPad spotlight @2x
        (76, 76),     # iPad home screen @1x
        (60, 60),     # iPhone notification @3x
        (58, 58),     # iPhone/iPad settings @2x
        (57, 57),     # iPhone home screen @1x (legacy)
        (40, 40),     # iPad spotlight @1x / iPad notification @2x
        (29, 29),     # iPad settings @1x / iPhone settings @1x
        (20, 20),     # iPad notification @1x
        (144, 144),   # iPad retina
        (72, 72),     # iPad @1x (legacy)
    ]
    
    # Capacitor default naming convention (overrides Capacitor defaults)
    capacitor_appicon_defaults = [
        ("AppIcon-20x20@1x.png", (20, 20)),
        ("AppIcon-20x20@2x-1.png", (40, 40)),
        ("AppIcon-20x20@2x.png", (40, 40)),
        ("AppIcon-20x20@3x.png", (60, 60)),
        ("AppIcon-29x29@1x.png", (29, 29)),
        ("AppIcon-29x29@2x-1.png", (58, 58)),
        ("AppIcon-29x29@2x.png", (58, 58)),
        ("AppIcon-29x29@3x.png", (87, 87)),
        ("AppIcon-40x40@1x.png", (40, 40)),
        ("AppIcon-40x40@2x-1.png", (80, 80)),
        ("AppIcon-40x40@2x.png", (80, 80)),
        ("AppIcon-40x40@3x.png", (120, 120)),
        ("AppIcon-512@2x.png", (512, 512)),
        ("AppIcon-60x60@2x.png", (120, 120)),
        ("AppIcon-60x60@3x.png", (180, 180)),
        ("AppIcon-76x76@1x.png", (76, 76)),
        ("AppIcon-76x76@2x.png", (152, 152)),
        ("AppIcon-83.5x83.5@2x.png", (167, 167)),
    ]
    
    ensure_directory("ios/App/App/Assets.xcassets/AppIcon.appiconset")
    
    success_count = 0
    
    # Generate standard iOS icons
    for size in ios_sizes:
        output_path = f"ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-{size[0]}x{size[1]}.png"
        if resize_image(icon_master_path, output_path, size):
            success_count += 1
    
    # Generate Capacitor default naming convention to override defaults
    for filename, size in capacitor_appicon_defaults:
        output_path = f"ios/App/App/Assets.xcassets/AppIcon.appiconset/{filename}"
        if resize_image(icon_master_path, output_path, size):
            success_count += 1
    
    total_expected = len(ios_sizes) + len(capacitor_appicon_defaults)
    print(f"✅ iOS app icons: {success_count}/{total_expected} generated")
    return success_count

def generate_ios_logos(logo_master_path):
    """Generate iOS header logos"""
    print("Generating iOS header logos...")
    
    ios_logo_sizes = [
        ("logo.png", (120, 32)),      # 1x density
        ("logo@2x.png", (240, 64)),   # 2x density
        ("logo@3x.png", (360, 96)),   # 3x density
        ("logo@4x.png", (480, 128)),  # 4x density (direct from master)
    ]
    
    ensure_directory("ios/App/App/Assets.xcassets/Logo.imageset")
    
    success_count = 0
    for filename, size in ios_logo_sizes:
        output_path = f"ios/App/App/Assets.xcassets/Logo.imageset/{filename}"
        if resize_image(logo_master_path, output_path, size, maintain_aspect=True):
            success_count += 1
    
    print(f"✅ iOS header logos: {success_count}/{len(ios_logo_sizes)} generated")
    return success_count

def generate_ios_logos_inverted(logo_inverted_master_path):
    """Generate iOS header inverted logos"""
    print("Generating iOS header inverted logos...")
    
    ios_logo_sizes = [
        ("logo-inverted.png", (120, 32)),      # 1x density
        ("logo-inverted@2x.png", (240, 64)),   # 2x density
        ("logo-inverted@3x.png", (360, 96)),   # 3x density
        ("logo-inverted@4x.png", (480, 128)),  # 4x density (direct from master)
    ]
    
    ensure_directory("ios/App/App/Assets.xcassets/LogoInverted.imageset")
    
    success_count = 0
    for filename, size in ios_logo_sizes:
        output_path = f"ios/App/App/Assets.xcassets/LogoInverted.imageset/{filename}"
        if resize_image(logo_inverted_master_path, output_path, size, maintain_aspect=True):
            success_count += 1
    
    print(f"✅ iOS header inverted logos: {success_count}/{len(ios_logo_sizes)} generated")
    return success_count

#==============================================================================
# ANDROID ASSET GENERATION
#==============================================================================

def generate_android_icons(icon_master_path):
    """Generate Android app icons - complete set to override Capacitor defaults"""
    print("Generating Android app icons...")
    
    android_densities = [
        ("ldpi", 36),     # Low density
        ("mdpi", 48),     # Medium density
        ("hdpi", 72),     # High density
        ("xhdpi", 96),    # Extra high density
        ("xxhdpi", 144),  # Extra extra high density
        ("xxxhdpi", 192), # Extra extra extra high density
    ]
    
    success_count = 0
    for density, size in android_densities:
        dir_path = f"android/app/src/main/res/mipmap-{density}"
        ensure_directory(dir_path)
        
        # Standard launcher icon
        output_path = f"{dir_path}/ic_launcher.png"
        if resize_image(icon_master_path, output_path, (size, size)):
            success_count += 1
        
        # Round launcher icon
        output_path_round = f"{dir_path}/ic_launcher_round.png"
        if resize_image(icon_master_path, output_path_round, (size, size)):
            success_count += 1
        
        # Foreground for adaptive icons (apply 70% safe margin)
        output_path_fg = f"{dir_path}/ic_launcher_foreground.png"
        if resize_image(icon_master_path, output_path_fg, (size, size), maintain_aspect=True, adaptive_icon_safe_margin=True):
            success_count += 1
        
        # Background for adaptive icons (transparent background)
        output_path_bg = f"{dir_path}/ic_launcher_background.png"
        try:
            bg_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
            bg_img.save(output_path_bg, 'PNG', optimize=True)
            success_count += 1
        except Exception as e:
            print(f"❌ Error creating {output_path_bg}: {e}")
    
    # Create Play Store icon
    ensure_directory("android/app/src/main/res/mipmap-xxxhdpi")
    play_store_path = "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_playstore.png"
    if resize_image(icon_master_path, play_store_path, (512, 512)):
        success_count += 1
    
    # Create adaptive icon XML files
    create_android_adaptive_icon_xmls()
    success_count += 2  # For the 2 XML files
    
    print(f"✅ Android app icons: {success_count}/{len(android_densities) * 4 + 3} generated")
    return success_count

def generate_android_logos(logo_master_path):
    """Generate Android header logos"""
    print("Generating Android header logos...")
    
    android_densities = [
        ("ldpi", 0.75),    # 90x24
        ("mdpi", 1.0),     # 120x32
        ("hdpi", 1.5),     # 180x48
        ("xhdpi", 2.0),    # 240x64
        ("xxhdpi", 3.0),   # 360x96
        ("xxxhdpi", 4.0),  # 480x128 (matches master)
    ]
    
    success_count = 0
    for density, scale in android_densities:
        dir_path = get_project_path(f"android/app/src/main/res/drawable-{density}")
        ensure_directory(dir_path)
        
        # Calculate scaled dimensions from 120x32 base
        scaled_width = int(120 * scale)
        scaled_height = int(32 * scale)
        
        output_path = f"{dir_path}/logo.png"
        if resize_image(logo_master_path, output_path, (scaled_width, scaled_height), maintain_aspect=True):
            success_count += 1
    
    # Create base logo in drawable folder at 1x size
    ensure_directory(get_project_path("android/app/src/main/res/drawable"))
    base_logo_path = get_project_path("android/app/src/main/res/drawable/logo.png")
    if resize_image(logo_master_path, base_logo_path, (120, 32), maintain_aspect=True):
        success_count += 1
    
    print(f"✅ Android header logos: {success_count}/{len(android_densities) + 1} generated")
    return success_count

def generate_android_logos_inverted(logo_inverted_master_path):
    """Generate Android header inverted logos"""
    print("Generating Android header inverted logos...")
    
    android_densities = [
        ("ldpi", 0.75),    # 90x24
        ("mdpi", 1.0),     # 120x32
        ("hdpi", 1.5),     # 180x48
        ("xhdpi", 2.0),    # 240x64
        ("xxhdpi", 3.0),   # 360x96
        ("xxxhdpi", 4.0),  # 480x128 (matches master)
    ]
    
    success_count = 0
    for density, scale in android_densities:
        dir_path = get_project_path(f"android/app/src/main/res/drawable-{density}")
        ensure_directory(dir_path)
        
        # Calculate scaled dimensions from 120x32 base
        scaled_width = int(120 * scale)
        scaled_height = int(32 * scale)
        
        output_path = f"{dir_path}/logo-inverted.png"
        if resize_image(logo_inverted_master_path, output_path, (scaled_width, scaled_height), maintain_aspect=True):
            success_count += 1
    
    # Create base inverted logo in drawable folder at 1x size
    ensure_directory(get_project_path("android/app/src/main/res/drawable"))
    base_logo_path = get_project_path("android/app/src/main/res/drawable/logo-inverted.png")
    if resize_image(logo_inverted_master_path, base_logo_path, (120, 32), maintain_aspect=True):
        success_count += 1
    
    print(f"✅ Android header inverted logos: {success_count}/{len(android_densities) + 1} generated")
    return success_count

def create_android_adaptive_icon_xmls():
    """Create Android adaptive icon XML files"""
    print("Creating Android adaptive icon XML files...")
    
    # Create adaptive icon directory
    ensure_directory(get_project_path("android/app/src/main/res/mipmap-anydpi-v26"))
    
    # Standard adaptive icon XML
    ic_launcher_xml = '''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>'''
    
    # Round adaptive icon XML
    ic_launcher_round_xml = '''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>'''
    
    # Write XML files
    with open(get_project_path("android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml"), 'w') as f:
        f.write(ic_launcher_xml)
    
    with open(get_project_path("android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml"), 'w') as f:
        f.write(ic_launcher_round_xml)

#==============================================================================
# SPLASH SCREEN GENERATION
#==============================================================================

def generate_splash_screens():
    """Generate splash screen images using platform-specific masters"""
    print("Generating splash screens...")
    
    # Master image paths
    ios_master = get_project_path("master-images/splash-square-master.png")
    android_portrait_master = get_project_path("master-images/splash-android-portrait-master.png")
    android_landscape_master = get_project_path("master-images/splash-android-landscape-master.png")
    
    # Verify master images exist
    for master_path in [ios_master, android_portrait_master, android_landscape_master]:
        if not os.path.exists(master_path):
            print(f"❌ Master image not found: {master_path}")
            return
    
    # iOS splash sizes
    ios_splash_sizes = [
        (2732, 2732), # Universal splash (iPad Pro 12.9")
        (1920, 1920), # Alternative universal
        (1024, 1024), # Smaller devices
    ]
    
    # Android splash densities and dimensions
    android_splash_densities = [
        ("ldpi", 240, 320),      # Low density - 0.75x multiplier
        ("mdpi", 320, 480),      # Medium density - 1.0x multiplier (base)
        ("hdpi", 480, 720),      # High density - 1.5x multiplier
        ("xhdpi", 640, 960),     # Extra high density - 2.0x multiplier
        ("xxhdpi", 960, 1440),   # Extra extra high density - 3.0x multiplier
        ("xxxhdpi", 1280, 1920), # Extra extra extra high density - 4.0x multiplier
    ]
    
    ensure_directory(get_project_path("public/splash"))
    ensure_directory(get_project_path("ios/App/App/Assets.xcassets/Splash.imageset"))
    ensure_directory(get_project_path("android/app/src/main/res/drawable"))
    
    success_count = 0
    
    # Generate web splash screens using iOS master
    for size in ios_splash_sizes:
        web_path = get_project_path(f"public/splash/splash-{size[0]}x{size[1]}.png")
        if resize_image(ios_master, web_path, size, maintain_aspect=True):
            success_count += 1
    
    # Generate iOS splash screens using square master
    for size in ios_splash_sizes:
        ios_path = get_project_path(f"ios/App/App/Assets.xcassets/Splash.imageset/splash-{size[0]}x{size[1]}.png")
        if resize_image(ios_master, ios_path, size, maintain_aspect=True):
            success_count += 1
    
    # Generate Capacitor default splash screen filenames (override defaults)
    capacitor_splash_defaults = [
        "splash-2732x2732-1.png",
        "splash-2732x2732-2.png", 
        "splash-2732x2732.png",
    ]
    
    for filename in capacitor_splash_defaults:
        ios_default_path = get_project_path(f"ios/App/App/Assets.xcassets/Splash.imageset/{filename}")
        if resize_image(ios_master, ios_default_path, (2732, 2732), maintain_aspect=True):
            success_count += 1
    
    # Generate Android splash screens using platform-specific masters
    for density, width, height in android_splash_densities:
        # Portrait splash screens using Android portrait master
        port_dir = get_project_path(f"android/app/src/main/res/drawable-port-{density}")
        ensure_directory(port_dir)
        port_path = f"{port_dir}/splash.png"
        if resize_image(android_portrait_master, port_path, (width, height), maintain_aspect=True):
            success_count += 1
        
        # Landscape splash screens using Android landscape master
        land_dir = get_project_path(f"android/app/src/main/res/drawable-land-{density}")
        ensure_directory(land_dir)
        land_path = f"{land_dir}/splash.png"
        if resize_image(android_landscape_master, land_path, (height, width), maintain_aspect=True):
            success_count += 1
    
    # Base Android splash (main drawable folder) using portrait master
    android_path = get_project_path("android/app/src/main/res/drawable/splash.png")
    if resize_image(android_portrait_master, android_path, (1280, 1920), maintain_aspect=True):
        success_count += 1
    
    total_expected = len(ios_splash_sizes) * 2 + len(capacitor_splash_defaults) + len(android_splash_densities) * 2 + 1
    print(f"✅ Splash screens: {success_count}/{total_expected} generated")
    
    # Generate Android 12+ splash icon from splash-icon-square-master.png
    splash_icons = generate_android_splash_icons()
    success_count += splash_icons if splash_icons else 0
    
    return success_count

def generate_android_splash_icons():
    """Generate Android 12+ splash icons"""
    splash_icon_master = get_project_path("master-images/splash-icon-square-master.png")
    if not os.path.exists(splash_icon_master):
        print("Warning: splash-icon-square-master.png not found - skipping Android 12+ splash icons")
        return 0
    
    print("Generating Android 12+ splash icons...")
    splash_icon_sizes = [
        ("mdpi", 96),
        ("hdpi", 144),
        ("xhdpi", 192),
        ("xxhdpi", 288),
        ("xxxhdpi", 384),
    ]
    
    icon_success_count = 0
    for density, size in splash_icon_sizes:
        icon_dir = get_project_path(f"android/app/src/main/res/drawable-{density}")
        ensure_directory(icon_dir)
        icon_path = f"{icon_dir}/splash_icon_center.png"
        if resize_image(splash_icon_master, icon_path, (size, size), maintain_aspect=True):
            icon_success_count += 1
    
    print(f"✅ Android 12+ splash icons: {icon_success_count}/{len(splash_icon_sizes)} generated")
    return icon_success_count

#==============================================================================
# CONFIGURATION FILE GENERATION
#==============================================================================

def create_ios_contents_json():
    """Create iOS Contents.json files for Xcode"""
    print("Creating iOS Contents.json files...")
    
    # AppIcon Contents.json - comprehensive mapping for all iOS contexts
    appicon_contents = {
        "images": [
            # iPhone - All contexts including multitasking
            {"size": "20x20", "idiom": "iphone", "filename": "AppIcon-20x20@2x.png", "scale": "2x"},
            {"size": "20x20", "idiom": "iphone", "filename": "AppIcon-20x20@3x.png", "scale": "3x"},
            {"size": "29x29", "idiom": "iphone", "filename": "AppIcon-29x29@2x.png", "scale": "2x"},
            {"size": "29x29", "idiom": "iphone", "filename": "AppIcon-29x29@3x.png", "scale": "3x"},
            {"size": "40x40", "idiom": "iphone", "filename": "AppIcon-40x40@2x.png", "scale": "2x"},
            {"size": "40x40", "idiom": "iphone", "filename": "AppIcon-40x40@3x.png", "scale": "3x"},
            {"size": "60x60", "idiom": "iphone", "filename": "AppIcon-60x60@2x.png", "scale": "2x"},
            {"size": "60x60", "idiom": "iphone", "filename": "AppIcon-60x60@3x.png", "scale": "3x"},
            # iPad - All contexts including multitasking
            {"size": "20x20", "idiom": "ipad", "filename": "AppIcon-20x20@1x.png", "scale": "1x"},
            {"size": "20x20", "idiom": "ipad", "filename": "AppIcon-20x20@2x.png", "scale": "2x"},
            {"size": "29x29", "idiom": "ipad", "filename": "AppIcon-29x29@1x.png", "scale": "1x"},
            {"size": "29x29", "idiom": "ipad", "filename": "AppIcon-29x29@2x.png", "scale": "2x"},
            {"size": "40x40", "idiom": "ipad", "filename": "AppIcon-40x40@1x.png", "scale": "1x"},
            {"size": "40x40", "idiom": "ipad", "filename": "AppIcon-40x40@2x.png", "scale": "2x"},
            {"size": "76x76", "idiom": "ipad", "filename": "AppIcon-76x76@1x.png", "scale": "1x"},
            {"size": "76x76", "idiom": "ipad", "filename": "AppIcon-76x76@2x.png", "scale": "2x"},
            {"size": "83.5x83.5", "idiom": "ipad", "filename": "AppIcon-83.5x83.5@2x.png", "scale": "2x"},
            # App Store - Critical for distribution
            {"size": "1024x1024", "idiom": "ios-marketing", "filename": "icon-1024x1024.png", "scale": "1x"}
        ],
        "info": {"version": 1, "author": "xcode"}
    }
    
    # Splash Contents.json
    splash_contents = {
        "images": [
            {"idiom": "universal", "filename": "splash-2732x2732.png", "scale": "1x"},
            {"idiom": "universal", "filename": "splash-1920x1920.png", "scale": "2x"},
            {"idiom": "universal", "filename": "splash-1024x1024.png", "scale": "3x"}
        ],
        "info": {"version": 1, "author": "xcode"}
    }
    
    # Write AppIcon Contents.json
    appicon_dir = get_project_path("ios/App/App/Assets.xcassets/AppIcon.appiconset")
    ensure_directory(appicon_dir)
    with open(f"{appicon_dir}/Contents.json", 'w') as f:
        json.dump(appicon_contents, f, indent=2)
    
    # Write Splash Contents.json
    splash_dir = get_project_path("ios/App/App/Assets.xcassets/Splash.imageset")
    ensure_directory(splash_dir)
    with open(f"{splash_dir}/Contents.json", 'w') as f:
        json.dump(splash_contents, f, indent=2)

def update_manifest_json():
    """Update web manifest with new icon paths"""
    print("Updating web manifest...")
    
    manifest_path = get_project_path("public/manifest.json")
    if not os.path.exists(manifest_path):
        print("Warning: manifest.json not found - skipping update")
        return
    
    try:
        with open(manifest_path, 'r') as f:
            manifest = json.load(f)
        
        # Update icons array
        manifest["icons"] = [
            {
                "src": "/icons/icon-192x192.png",
                "sizes": "192x192",
                "type": "image/png"
            },
            {
                "src": "/icons/icon-512x512.png",
                "sizes": "512x512",
                "type": "image/png"
            }
        ]
        
        with open(manifest_path, 'w') as f:
            json.dump(manifest, f, indent=2)
        
        print("✅ Web manifest updated")
    except Exception as e:
        print(f"❌ Error updating manifest: {e}")

#==============================================================================
# MAIN EXECUTION
#==============================================================================

def main():
    """Main function - processes master images and generates all platform assets"""
    
    print("Gipity Scaffold - Image Asset Generator")
    print("=" * 50)
    
    # Initialize total image counter
    total_images_generated = 0
    
    # Define master image paths
    master_images = {
        "icon": get_project_path("master-images/icon-master.png"),
        "logo": get_project_path("master-images/logo-master.png"),
        "logo_inverted": get_project_path("master-images/logo-inverted-master.png"),
        "splash_square": get_project_path("master-images/splash-square-master.png"),
        "splash_portrait": get_project_path("master-images/splash-android-portrait-master.png"),
        "splash_landscape": get_project_path("master-images/splash-android-landscape-master.png"),
        "splash_icon": get_project_path("master-images/splash-icon-square-master.png"),
    }
    
    # Verify all required master images exist
    missing_images = [path for path in master_images.values() if not os.path.exists(path)]
    
    if missing_images:
        print("❌ Missing required master images:")
        for img in missing_images:
            print(f"   {img}")
        print("\nRequired master images in master-images/ folder:")
        print("   - icon-master.png (1024x1024)")
        print("   - logo-master.png (480x128)")
        print("   - logo-inverted-master.png (480x128)")
        print("   - splash-square-master.png (2732x2732)")
        print("   - splash-android-portrait-master.png (1280x1920)")
        print("   - splash-android-landscape-master.png (1920x1280)")
        print("   - splash-icon-square-master.png (1024x1024)")
        sys.exit(1)
    
    print("Master images verified:")
    for name, path in master_images.items():
        print(f"   {name}: {os.path.basename(path)}")
    print("=" * 50)
    
    # Generate all asset categories and track totals
    print("\n" + "=" * 50)
    print("WEB PWA ASSETS")
    print("=" * 50)
    web_icons = generate_web_icons(master_images["icon"]) or 0
    web_logos = generate_web_logos(master_images["logo"]) or 0
    web_logos_inverted = generate_web_logos_inverted(master_images["logo_inverted"]) or 0
    total_images_generated += web_icons + web_logos + web_logos_inverted
    
    print("\n" + "=" * 50)
    print("iOS ASSETS")
    print("=" * 50)
    ios_icons = generate_ios_icons(master_images["icon"]) or 0
    ios_logos = generate_ios_logos(master_images["logo"]) or 0
    ios_logos_inverted = generate_ios_logos_inverted(master_images["logo_inverted"]) or 0
    total_images_generated += ios_icons + ios_logos + ios_logos_inverted
    
    print("\n" + "=" * 50)
    print("ANDROID ASSETS")
    print("=" * 50)
    android_icons = generate_android_icons(master_images["icon"]) or 0
    android_logos = generate_android_logos(master_images["logo"]) or 0
    android_logos_inverted = generate_android_logos_inverted(master_images["logo_inverted"]) or 0
    total_images_generated += android_icons + android_logos + android_logos_inverted
    
    print("\n" + "=" * 50)
    print("SPLASH SCREENS")
    print("=" * 50)
    splash_total = generate_splash_screens() or 0
    total_images_generated += splash_total
    
    print("\n" + "=" * 50)
    print("TOTAL ASSETS DEPLOYED")
    print("=" * 50)
    print(f"✅ Total image assets placed in destination folders: {total_images_generated}")
    print("   (Includes generated, resized, and copied image files)")
    
    print("\n" + "=" * 50)
    print("CONFIGURATION FILES")
    print("=" * 50)
    create_ios_contents_json()
    update_manifest_json()
    print("✅ iOS Contents.json files created")
    
    print("\n" + "=" * 50)
    print("GENERATION COMPLETE")
    print("=" * 50)
    print("✅ All image assets generated successfully")
    print("✅ Platform configurations updated")
    
    print("\n" + "=" * 50)
    print("NEXT STEPS")
    print("=" * 50)
    print("To deploy these assets to your mobile app:")
    print("1. Run: ./gipity-scripts/gipity-appflow-prepare.sh prod")
    print("   (or 'dev' for development builds)")
    print("2. This will copy all generated assets and configuration files")
    print("   to the mobile build directory and sync to GitHub")
    print("3. Ionic Appflow will then build your mobile app with the new assets")
    print("\nNote: The generated iOS Contents.json files are required")
    print("      for proper icon and splash screen display on iOS devices")

if __name__ == "__main__":
    main()