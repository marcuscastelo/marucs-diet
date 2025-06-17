#!/bin/bash
# Script para gerar ícones automaticamente com @capacitor/assets
# Uso: ./generate-icons.sh

echo "🎨 Generating app icons with Capacitor Assets..."

# Verifica se os arquivos fonte existem
if [ ! -f "assets/icon.png" ]; then
    echo "❌ Error: 'assets/icon.png' not found!"
    echo "   Please provide a 1024x1024 PNG icon in the assets/ directory."
    echo "   Easy Mode requires: assets/icon.png"
    exit 1
fi

echo "📂 Source files found:"
echo "   ✓ assets/icon.png"

echo ""
echo "🔧 Generating icons using Easy Mode (recommended)..."

# Gera os ícones usando Easy Mode com cores de fundo
npx @capacitor/assets generate --iconBackgroundColor '#FFFFFF' --iconBackgroundColorDark '#1a1a1a'

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
