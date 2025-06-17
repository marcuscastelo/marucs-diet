#!/bin/bash

# Capacitor Android Build Script
# This script builds the web app and generates an Android APK

set -e

echo "🏗️  Building Marucs Diet for Android..."

# Step 1: Build the web application
echo "📦 Building web application..."
npm run build

# Step 2: Remove gzipped files to avoid duplicate resources in Android
echo "🧹 Removing gzipped files to prevent Android build conflicts..."
find .vercel/output/static -name "*.gz" -delete

# Step 3: Sync with Capacitor
echo "🔄 Syncing with Capacitor..."
npx cap sync android

# Step 4: Build the Android APK
echo "📱 Building Android APK..."
cd android
export ANDROID_HOME="$(pwd)/../android-sdk"
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/tools/bin:$ANDROID_HOME/platform-tools"
./gradlew assembleDebug
cd ..

# Step 5: Show the result
APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
    APK_SIZE=$(ls -lh "$APK_PATH" | awk '{print $5}')
    echo "✅ APK successfully generated!"
    echo "📍 Location: $APK_PATH"
    echo "📏 Size: $APK_SIZE"
else
    echo "❌ APK generation failed!"
    exit 1
fi
