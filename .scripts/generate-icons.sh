#!/bin/bash
# Script para gerar ícones automaticamente com @capacitor/assets
# Uso: ./generate-icons.sh

echo "🎨 Generating app icons with Capacitor Assets..."

# Verifica se os arquivos fonte existem
if [ ! -f "resources/icon.png" ]; then
    echo "❌ Error: 'resources/icon.png' not found!"
    echo "   Please provide a 1024x1024 PNG icon in the resources/ directory."
    exit 1
fi

echo "📂 Source files found:"
echo "   ✓ resources/icon.png"

if [ -f "resources/icon-foreground.png" ]; then
    echo "   ✓ resources/icon-foreground.png"
else
    echo "   ⚠  resources/icon-foreground.png not found (optional for adaptive icons)"
fi

echo ""
echo "🔧 Generating icons for all platforms..."

# Gera os ícones
npx @capacitor/assets generate

if [ $? -eq 0 ]; then
    echo "✅ Icons generated successfully!"
    echo ""
    echo "📱 Generated files:"
    echo "   - Android icons: android/app/src/main/res/mipmap-*/"
    echo "   - PWA icons: icons/"
    echo ""
    echo "🔄 Next steps:"
    echo "   1. Run 'npx cap sync' to sync with Capacitor"
    echo "   2. Run 'npm run build:android' to build APK with new icons"
    echo "   3. Test the APK on device or emulator"
else
    echo "❌ Error generating icons!"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   1. Check if Sharp is properly installed"
    echo "   2. Try 'pnpm store prune' to clear cache"
    echo "   3. Reinstall @capacitor/assets: 'pnpm remove @capacitor/assets && pnpm install @capacitor/assets'"
    exit 1
fi

echo ""
echo "💡 Tips:"
echo "   - Source icon should be 1024x1024 PNG with transparency"
echo "   - For adaptive icons, provide icon-foreground.png without background"
echo "   - Icons are automatically optimized for each platform and density"
