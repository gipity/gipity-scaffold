#!/bin/bash

#==============================================================================
# Gipity Scaffold - Mobile App Deployment Script
#
# Prepares mobile app build with dev/prod variants for Ionic Appflow
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
#==============================================================================

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BUILD_DIR="gipity-appflow"
TEMP_REPO_DIR="temp-appflow-repo"

#==============================================================================
# PARAMETER VALIDATION
#==============================================================================

if [ $# -eq 0 ]; then
    echo "❌ Error: Build variant required. Usage:"
    echo "  ./gipity-appflow-prepare.sh prod   # Production build"
    echo "  ./gipity-appflow-prepare.sh dev    # Development build"
    exit 1
fi

# Determine build variant
BUILD_VARIANT=""
if [ "$1" == "prod" ]; then
    BUILD_VARIANT=""  # No suffix for production
    echo "✅ Building PRODUCTION variant"
elif [ "$1" == "dev" ]; then
    BUILD_VARIANT="dev"
    echo "✅ Building DEVELOPMENT variant with dev suffix"
else
    echo "❌ Error: Invalid variant '$1'. Use 'prod' or 'dev'"
    exit 1
fi

#==============================================================================
# ENVIRONMENT VARIABLES
#==============================================================================

# GitHub Configuration
GITHUB_USERNAME="${GITHUB_USERNAME:-YOUR-USERNAME}"
APPFLOW_REPO_URL="${APPFLOW_REPO_URL:-mobile-repo}"
CUSTOM_DOMAIN="${CUSTOM_DOMAIN:-your-domain.com}"
PROD_BACKEND_URL="${PROD_BACKEND_URL:-}"

# App Identity Variables (with optional dev suffix)
APP_ID="${APP_ID:-com.yourcompany.yourapp}${BUILD_VARIANT}"
APP_NAME="${APP_NAME:-Your App Name}${BUILD_VARIANT}"
APP_SCHEME="${APP_SCHEME:-YourApp}${BUILD_VARIANT}"
APP_USER_AGENT="${APP_USER_AGENT:-YourApp}${BUILD_VARIANT}"
CACHE_NAME="${CACHE_NAME:-yourapp-v1}${BUILD_VARIANT}"

# Technical Configuration
APP_VERSION="${APP_VERSION:-1.0}"
APP_DESCRIPTION="${APP_DESCRIPTION}"

# Theme Colors
APP_PRIMARY_COLOR="${APP_PRIMARY_COLOR:-#476a92}"
APP_PRIMARY_DARK_COLOR="${APP_PRIMARY_DARK_COLOR:-#2d4a6b}"
APP_ACCENT_COLOR="${APP_ACCENT_COLOR:-#476a92}"
APP_SPLASH_BACKGROUND_COLOR="${APP_SPLASH_BACKGROUND_COLOR:-#ffffff}"

# Determine which domain to use based on build variant
if [ "$1" == "prod" ] && [ -n "$PROD_BACKEND_URL" ]; then
    DOMAIN_TO_USE="$PROD_BACKEND_URL"
else
    DOMAIN_TO_USE="$CUSTOM_DOMAIN"
fi

#==============================================================================
# UTILITY FUNCTIONS
#==============================================================================

# Template replacement function
replace_template_tokens() {
    local file="$1"
    sed -i "s|{{APP_ID}}|$APP_ID|g" "$file"
    sed -i "s|{{APP_NAME}}|$APP_NAME|g" "$file"
    sed -i "s|{{APP_SCHEME}}|$APP_SCHEME|g" "$file"
    sed -i "s|{{APP_USER_AGENT}}|$APP_USER_AGENT|g" "$file"
    sed -i "s|{{CACHE_NAME}}|$CACHE_NAME|g" "$file"
    sed -i "s|{{APP_VERSION}}|$APP_VERSION|g" "$file"
    sed -i "s|{{APP_DESCRIPTION}}|$APP_DESCRIPTION|g" "$file"
    sed -i "s|{{CUSTOM_DOMAIN}}|$DOMAIN_TO_USE|g" "$file"
    sed -i "s|{{APP_PRIMARY_COLOR}}|$APP_PRIMARY_COLOR|g" "$file"
    sed -i "s|{{APP_PRIMARY_DARK_COLOR}}|$APP_PRIMARY_DARK_COLOR|g" "$file"
    sed -i "s|{{APP_ACCENT_COLOR}}|$APP_ACCENT_COLOR|g" "$file"
    sed -i "s|{{APP_SPLASH_BACKGROUND_COLOR}}|$APP_SPLASH_BACKGROUND_COLOR|g" "$file"
    # iOS PWA Camera Fix: Native apps always use standalone mode
    # PWA middleware handles iOS detection dynamically for web builds
    sed -i "s|{{DISPLAY_MODE}}|standalone|g" "$file"
}

#==============================================================================
# INITIALIZATION
#==============================================================================

FULL_APPFLOW_URL="https://github.com/${GITHUB_USERNAME}/${APPFLOW_REPO_URL}.git"

# Cleanup and setup
cd "$PROJECT_ROOT"
rm -rf "$BUILD_DIR" "$TEMP_REPO_DIR" >/dev/null 2>&1
mkdir -p "$BUILD_DIR"

# Copy essential files
for file in client shared public components.json postcss.config.js tailwind.config.ts tsconfig.json; do
    if [ -e "$file" ]; then
        cp -r "$file" "$BUILD_DIR/" 2>/dev/null || echo "❌ Error: Failed to copy $file"
    fi
done

# Clean up Supabase frontend files (backend-only architecture)
if [ -f "$BUILD_DIR/client/src/lib/supabase.ts" ]; then
    rm -f "$BUILD_DIR/client/src/lib/supabase.ts" >/dev/null 2>&1
fi

find "$BUILD_DIR/client" -name "*.ts" -o -name "*.tsx" | xargs grep -l "supabase\|@supabase" 2>/dev/null | while read file; do
    rm -f "$file" >/dev/null 2>&1
done

# Copy package files
cp package.json "$BUILD_DIR/package.json"
cp package-lock.json "$BUILD_DIR/package-lock.json"

#==============================================================================
# CONFIGURATION GENERATION
#==============================================================================

# Generate capacitor.config.json from template
if [ -f "capacitor.config.template.json" ]; then
    cp "capacitor.config.template.json" "$BUILD_DIR/capacitor.config.json"
    replace_template_tokens "$BUILD_DIR/capacitor.config.json"
    echo "✅ Generated capacitor.config.json"
else
    echo "⚠️ Warning: capacitor.config.template.json not found"
fi

# Generate manifest.json files from templates
if [ -f "client/public/manifest.template.json" ]; then
    cp "client/public/manifest.template.json" "$BUILD_DIR/client/public/manifest.json"
    replace_template_tokens "$BUILD_DIR/client/public/manifest.json"
    echo "✅ Generated client manifest.json"
fi

if [ -f "public/manifest.template.json" ]; then
    cp "public/manifest.template.json" "$BUILD_DIR/public/manifest.json"
    replace_template_tokens "$BUILD_DIR/public/manifest.json"
    echo "✅ Generated public manifest.json"
fi

# Generate service worker files from templates
if [ -f "client/public/sw.template.js" ]; then
    cp "client/public/sw.template.js" "$BUILD_DIR/client/public/sw.js"
    replace_template_tokens "$BUILD_DIR/client/public/sw.js"
    echo "✅ Generated client service worker"
fi

if [ -f "public/sw.template.js" ]; then
    cp "public/sw.template.js" "$BUILD_DIR/public/sw.js"
    replace_template_tokens "$BUILD_DIR/public/sw.js"
    echo "✅ Generated public service worker"
fi

#==============================================================================
# PACKAGE.JSON CONFIGURATION
#==============================================================================

# Update package.json for mobile build
MOBILE_APP_NAME=$(echo "$APP_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g')
sed -i "s/\"name\": \"rest-express\"/\"name\": \"$MOBILE_APP_NAME-mobile\"/" "$BUILD_DIR/package.json"

# Add appflow:build script for Appflow builds
if command -v jq >/dev/null 2>&1; then
    jq '.scripts["appflow:build"] = "npx patch-package && npm run build"' "$BUILD_DIR/package.json" > "$BUILD_DIR/package.json.tmp" && mv "$BUILD_DIR/package.json.tmp" "$BUILD_DIR/package.json"
    echo "✅ Added appflow:build script"
else
    sed -i '/"scripts": {/,/}/ s/\("db:push"[^,]*\)/\1,\n    "appflow:build": "npx patch-package \&\& npm run build"/' "$BUILD_DIR/package.json"
    echo "✅ Added appflow:build script"
fi

# Simplify build command for mobile
sed -i 's/"build": "vite build && esbuild[^"]*"/"build": "vite build"/' "$BUILD_DIR/package.json"


#==============================================================================
# VITE CONFIGURATION
#==============================================================================

# Create vite config
cat > "$BUILD_DIR/vite.config.ts" << 'EOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client/src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
});
EOF

#==============================================================================
# PLATFORM ADDITION
#==============================================================================

cd "$BUILD_DIR"
if command -v npx >/dev/null 2>&1; then
    # Remove any incomplete platforms first
    rm -rf android ios >/dev/null 2>&1
    
    # Add platforms fresh
    if npx cap add android >/dev/null 2>&1 && npx cap add ios >/dev/null 2>&1; then
        # Verify critical files exist
        if [ -f "android/gradlew" ] && [ -f "ios/App/App.xcodeproj/project.pbxproj" ]; then
            echo "✅ Added Android and iOS platforms"
        else
            echo "❌ Error: Platform files incomplete after addition"
        fi
    else
        echo "❌ Error: Failed to add platforms"
    fi
    
    # Copy iOS Privacy Manifest
    if [ -f "$PROJECT_ROOT/ios/App/App/PrivacyInfo.xcprivacy" ]; then
        mkdir -p "ios/App/App/" >/dev/null 2>&1
        if cp "$PROJECT_ROOT/ios/App/App/PrivacyInfo.xcprivacy" "ios/App/App/PrivacyInfo.xcprivacy"; then
            echo "✅ iOS Privacy Manifest copied"
        else
            echo "❌ Error: Failed to copy iOS Privacy Manifest"
        fi
    else
        echo "⚠️ Warning: iOS Privacy Manifest not found"
    fi
    
    # Copy Android network security config
    if [ -f "$PROJECT_ROOT/android/app/src/main/res/xml/network_security_config.xml" ]; then
        mkdir -p "android/app/src/main/res/xml/" >/dev/null 2>&1
        cp "$PROJECT_ROOT/android/app/src/main/res/xml/network_security_config.xml" "android/app/src/main/res/xml/" || echo "❌ Error: Failed to copy Android network config"
        replace_template_tokens "android/app/src/main/res/xml/network_security_config.xml"
        echo "✅ Android network security config copied"
    fi
    
    # Copy customized MainActivity
    if [ -f "$PROJECT_ROOT/android/MainActivity.java.template" ]; then
        PACKAGE_PATH=$(echo "$APP_ID" | tr '.' '/')
        JAVA_DIR="android/app/src/main/java/$PACKAGE_PATH"
        
        if [ -d "$JAVA_DIR" ]; then
            cp "$PROJECT_ROOT/android/MainActivity.java.template" "$JAVA_DIR/MainActivity.java"
            replace_template_tokens "$JAVA_DIR/MainActivity.java"
            echo "✅ Custom MainActivity.java copied"
        fi
    fi
    
    # Copy AndroidManifest.xml
    if [ -f "$PROJECT_ROOT/android/app/src/main/AndroidManifest.xml" ]; then
        mkdir -p "android/app/src/main/" >/dev/null 2>&1
        cp "$PROJECT_ROOT/android/app/src/main/AndroidManifest.xml" "android/app/src/main/" || echo "❌ Error: Failed to copy AndroidManifest.xml"
        replace_template_tokens "android/app/src/main/AndroidManifest.xml"
        echo "✅ AndroidManifest.xml copied"
    else
        echo "⚠️ Warning: AndroidManifest.xml not found"
    fi
    
    # Copy Android strings.xml
    if [ -f "$PROJECT_ROOT/android/app/src/main/res/values/strings.xml" ]; then
        mkdir -p "android/app/src/main/res/values/" >/dev/null 2>&1
        cp "$PROJECT_ROOT/android/app/src/main/res/values/strings.xml" "android/app/src/main/res/values/" || echo "❌ Error: Failed to copy Android strings.xml"
        replace_template_tokens "android/app/src/main/res/values/strings.xml"
        echo "✅ Android strings.xml copied"
    else
        echo "⚠️ Warning: Android strings.xml not found"
    fi
    
    # Copy Android colors.xml
    if [ -f "$PROJECT_ROOT/android/app/src/main/res/values/colors.xml" ]; then
        mkdir -p "android/app/src/main/res/values/" >/dev/null 2>&1
        cp "$PROJECT_ROOT/android/app/src/main/res/values/colors.xml" "android/app/src/main/res/values/" || echo "❌ Error: Failed to copy Android colors.xml"
        replace_template_tokens "android/app/src/main/res/values/colors.xml"
        echo "✅ Android colors.xml copied"
    else
        echo "⚠️ Warning: Android colors.xml not found"
    fi
    
    # Copy Android styles.xml
    if [ -f "$PROJECT_ROOT/android/app/src/main/res/values/styles.xml" ]; then
        mkdir -p "android/app/src/main/res/values/" >/dev/null 2>&1
        cp "$PROJECT_ROOT/android/app/src/main/res/values/styles.xml" "android/app/src/main/res/values/" || echo "❌ Error: Failed to copy Android styles.xml"
        replace_template_tokens "android/app/src/main/res/values/styles.xml"
        echo "✅ Android styles.xml copied"
    else
        echo "⚠️ Warning: Android styles.xml not found"
    fi
    

    
    # Copy iOS Info.plist
    if [ -f "$PROJECT_ROOT/ios/App/App/Info.plist" ]; then
        mkdir -p "ios/App/App/" >/dev/null 2>&1
        cp "$PROJECT_ROOT/ios/App/App/Info.plist" "ios/App/App/" || echo "❌ Error: Failed to copy iOS Info.plist"
        replace_template_tokens "ios/App/App/Info.plist"
        echo "✅ iOS Info.plist copied"
    else
        echo "⚠️ Warning: iOS Info.plist not found"
    fi
    
    # Copy iOS AppDelegate.swift
    if [ -f "$PROJECT_ROOT/ios/App/App/AppDelegate.swift" ]; then
        cp "$PROJECT_ROOT/ios/App/App/AppDelegate.swift" "ios/App/App/" || echo "❌ Error: Failed to copy iOS AppDelegate.swift"
        echo "✅ iOS AppDelegate.swift copied"
    else
        echo "⚠️ Warning: iOS AppDelegate.swift not found"
    fi
    

fi

# Verify network configs are in place
[ ! -f "android/app/src/main/res/xml/network_security_config.xml" ] && echo "❌ Error: Missing Android network security config"

#==============================================================================
# ASSET COPYING
#==============================================================================

cd "$PROJECT_ROOT"

# Copy public assets
if [ -d "$PROJECT_ROOT/public" ]; then
    mkdir -p "$BUILD_DIR/public" >/dev/null 2>&1
    
    if command -v rsync >/dev/null 2>&1; then
        rsync -av "$PROJECT_ROOT/public/" "$BUILD_DIR/public/" >/dev/null 2>&1
    else
        cp -r "$PROJECT_ROOT/public"/* "$BUILD_DIR/public/" 2>/dev/null || echo "⚠️ Warning: Some public assets may not have copied"
    fi
    
    if [ -f "$BUILD_DIR/public/manifest.json" ]; then
        replace_template_tokens "$BUILD_DIR/public/manifest.json"
    fi
    if [ -f "$BUILD_DIR/public/sw.js" ]; then
        replace_template_tokens "$BUILD_DIR/public/sw.js"
    fi
    
    echo "✅ Public assets copied"
else
    echo "⚠️ Warning: Public directory not found"
fi

# Copy Android native icons
if [ -d "$PROJECT_ROOT/android/app/src/main/res" ]; then
    if command -v rsync >/dev/null 2>&1; then
        rsync -av "$PROJECT_ROOT/android/app/src/main/res/mipmap"* "$BUILD_DIR/android/app/src/main/res/" >/dev/null 2>&1
        rsync -av "$PROJECT_ROOT/android/app/src/main/res/drawable"* "$BUILD_DIR/android/app/src/main/res/" >/dev/null 2>&1
    else
        cp -r "$PROJECT_ROOT/android/app/src/main/res/mipmap"* "$BUILD_DIR/android/app/src/main/res/" 2>/dev/null
        cp -r "$PROJECT_ROOT/android/app/src/main/res/drawable"* "$BUILD_DIR/android/app/src/main/res/" 2>/dev/null
    fi
    
    find "$BUILD_DIR/android/app/src/main/res/drawable"* -name "*.xml" -type f 2>/dev/null | while read xml_file; do
        if [ -f "$xml_file" ]; then
            replace_template_tokens "$xml_file"
        fi
    done
    echo "✅ Android native icons copied"
else
    echo "⚠️ Warning: Android native resources not found"
fi

# Copy iOS native icons
if [ -d "$PROJECT_ROOT/ios/App/App/Assets.xcassets" ]; then
    mkdir -p "$BUILD_DIR/ios/App/App/Assets.xcassets" >/dev/null 2>&1
    if command -v rsync >/dev/null 2>&1; then
        rsync -av "$PROJECT_ROOT/ios/App/App/Assets.xcassets/" "$BUILD_DIR/ios/App/App/Assets.xcassets/" >/dev/null 2>&1
    else
        cp -r "$PROJECT_ROOT/ios/App/App/Assets.xcassets"/* "$BUILD_DIR/ios/App/App/Assets.xcassets/" 2>/dev/null
    fi
    echo "✅ iOS native icons copied"
else
    echo "⚠️ Warning: iOS native assets not found"
fi

#==============================================================================
# VALIDATION
#==============================================================================

# Check capacitor.config.json for unreplaced tokens
if [ -f "$BUILD_DIR/capacitor.config.json" ]; then
    if grep -q "{{" "$BUILD_DIR/capacitor.config.json"; then
        echo "❌ Error: Unreplaced template tokens found in capacitor.config.json"
        echo "Missing environment variables. Check your Replit secrets:"
        grep -o "{{[^}]*}}" "$BUILD_DIR/capacitor.config.json" | sort -u
        echo "Required secrets: APP_ID, APP_SCHEME, APP_USER_AGENT, CUSTOM_DOMAIN, PROD_BACKEND_URL, APP_SPLASH_BACKGROUND_COLOR"
        exit 1
    else
        echo "✅ Configuration validated"
    fi
else
    echo "❌ Error: capacitor.config.json not found"
    exit 1
fi

#==============================================================================
# GIT SYNCHRONIZATION
#==============================================================================

if timeout 60 git clone "$FULL_APPFLOW_URL" "$TEMP_REPO_DIR" >/dev/null 2>&1; then
    cd "$TEMP_REPO_DIR"
    git config user.email "appflow-sync@yourapp.com" >/dev/null 2>&1
    if [ -n "$BUILD_VARIANT" ]; then
        git config user.name "App Appflow Sync ($BUILD_VARIANT)" >/dev/null 2>&1
    else
        git config user.name "App Appflow Sync (prod)" >/dev/null 2>&1
    fi
    
    # Remove all files except .git
    find . -mindepth 1 -maxdepth 1 -not -name '.git' -exec rm -rf {} + >/dev/null 2>&1
    
    # Copy all new files
    if command -v rsync >/dev/null 2>&1; then
        rsync -av "$PROJECT_ROOT/$BUILD_DIR/" . --exclude='.git' >/dev/null 2>&1
    else
        (cd "$PROJECT_ROOT/$BUILD_DIR" && tar -cf - .) | tar -xf - 2>/dev/null
    fi
    
    git add -A >/dev/null 2>&1
    
    if ! git diff --cached --quiet; then
        git commit -m "Auto-sync from main repo - $(date '+%Y-%m-%d %H:%M:%S')" >/dev/null 2>&1
        if timeout 60 git push origin main >/dev/null 2>&1; then
            echo "✅ Mobile package synced to GitHub"
        else
            echo "❌ Error: Git push failed - check credentials and network"
        fi
    else
        echo "✅ No changes needed - repository up to date"
    fi
else
    echo "❌ Error: Git clone failed - check repository access and credentials"
fi

#==============================================================================
# CLEANUP AND FINAL CHECK
#==============================================================================

cd "$PROJECT_ROOT"
rm -rf "$TEMP_REPO_DIR" >/dev/null 2>&1

if [ -f "$BUILD_DIR/package.json" ] && [ -f "$BUILD_DIR/capacitor.config.json" ]; then
    echo "✅ Mobile package ready for Appflow"
else
    echo "❌ Error: Mobile package preparation failed"
    exit 1
fi