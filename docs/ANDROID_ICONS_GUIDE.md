# Android Icons Setup Guide

## Overview
This guide explains how to manage and update app icons for the Android version of Marucs Diet using Capacitor.

## Current Icon Structure

### Source Files
- `marucs-diet.png` - Main app icon (1024x1024 recommended)
- `assets/icon-only.png` - Foreground icon for adaptive icons
- `res/` - Generated Android icon resources

### Generated Android Resources
```
android/app/src/main/res/
├── mipmap-hdpi/         # 72x72 icons
├── mipmap-mdpi/         # 48x48 icons  
├── mipmap-xhdpi/        # 96x96 icons
├── mipmap-xxhdpi/       # 144x144 icons
├── mipmap-xxxhdpi/      # 192x192 icons
├── mipmap-anydpi-v26/   # Adaptive icon XML definitions
└── values/
    └── ic_launcher_background.xml  # Background color for adaptive icons
```

## Icon Types Included

### Standard Icons
- `ic_launcher.png` - Standard app icon (all densities)
- `ic_launcher_round.png` - Round app icon (all densities)

### Adaptive Icons (Android 8.0+)
- `ic_launcher_foreground.png` - Foreground layer
- `ic_launcher_background` - Background color (#FFFFFF)
- `ic_launcher.xml` - Adaptive icon configuration
- `ic_launcher_round.xml` - Round adaptive icon configuration

## How to Update Icons

### Method 1: Manual Update (Current Working Method)

1. **Generate new icons** using online tools:
   - [Icon Kitchen](https://icon.kitchen/) - Recommended
   - [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/)

2. **Update source files**:
   ```bash
   # Replace main icon
   cp your-new-icon.png marucs-diet.png
   
   # Replace foreground icon (for adaptive icons)
   cp your-foreground-icon.png assets/icon-only.png
   ```

3. **Generate Android resources** (using external tool):
   - Upload `marucs-diet.png` to Icon Kitchen
   - Download generated Android resources
   - Extract to `res/` directory

4. **Copy to Android project**:
   ```bash
   npm run update:icons
   # or manually:
   cp -r res/* android/app/src/main/res/
   ```

5. **Build APK with new icons**:
   ```bash
   npm run build:android
   ```

### Method 2: Capacitor Assets (✅ Working)

With the Sharp dependency issue resolved, you can now use the automatic generation:

```bash
# Generate icons automatically from source files
npx @capacitor/assets generate

# Then build APK with new icons
npm run build:android
```

**Source files needed:**
- `resources/icon.png` - Main app icon (1024x1024)
- `resources/icon-foreground.png` - Foreground for adaptive icons (optional)

## Customization Options

### Background Color
Edit `android/app/src/main/res/values/ic_launcher_background.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#FFFFFF</color>
</resources>
```

### Adaptive Icon Configuration
Edit `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
```

## Scripts Available

### Update Icons
```bash
npm run update:icons
```
Copies icons from `res/` to Android project.

### Build Android with Icons
```bash
npm run build:android
```
Builds complete APK with current icons.

## Testing Icons

### Verify Icon Installation
1. Build and install APK on device/emulator
2. Check app launcher for icon appearance
3. Test both normal and adaptive icon behaviors
4. Verify icon appears in different system themes (light/dark)

### Icon Checklist
- [ ] Icon appears correctly in launcher
- [ ] Round icon works on supported launchers
- [ ] Adaptive icon animates properly
- [ ] Icon is visible in both light and dark themes
- [ ] No artifacts or distortion at different sizes

## Troubleshooting

### Common Issues

**Icons not updating after build**
- Clear app data and reinstall APK
- Check if `res/` directory has all required files
- Verify `update:icons` script copied files correctly

**Sharp dependency errors with @capacitor/assets** ✅ **RESOLVED**
- Add Sharp override to package.json:
  ```json
  "pnpm": {
    "overrides": {
      "sharp": "^0.34.2"
    }
  }
  ```
- Reinstall @capacitor/assets after adding override
- Clear pnpm cache if needed: `pnpm store prune`

**Adaptive icons not working**
- Check XML configuration in `mipmap-anydpi-v26/`
- Verify foreground icon exists in all density folders
- Ensure background color is properly defined

## Recommended Icon Specifications

### Source Icon (marucs-diet.png)
- **Size**: 1024x1024 pixels
- **Format**: PNG with transparency
- **Content**: Full app icon with background

### Foreground Icon (icon-only.png)  
- **Size**: 1024x1024 pixels
- **Format**: PNG with transparency
- **Content**: Icon content only, no background
- **Safe area**: Keep important content within 66% of canvas

### Colors
- **Background**: #FFFFFF (white) or brand color
- **Foreground**: High contrast with background
- **Theme support**: Consider both light and dark system themes

## References
- [Android Icon Design Guidelines](https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive)
- [Capacitor Icons Documentation](https://capacitorjs.com/docs/guides/splash-screens-and-icons)
- [Icon Kitchen Tool](https://icon.kitchen/)
