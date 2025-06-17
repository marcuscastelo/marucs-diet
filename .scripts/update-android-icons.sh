#!/bin/bash
# Script para atualizar ícones do Android no Capacitor
# Uso: ./update-android-icons.sh

echo "🎨 Updating Android icons..."

# Verifica se a pasta res existe
if [ ! -d "res" ]; then
    echo "❌ Error: 'res' directory not found!"
    echo "   Make sure you have generated icons in the 'res' directory first."
    exit 1
fi

# Verifica se o projeto Android existe
if [ ! -d "android/app/src/main/res" ]; then
    echo "❌ Error: Android project not found!"
    echo "   Run 'npx cap add android' first."
    exit 1
fi

# Copia os ícones
echo "📱 Copying icons to Android project..."
cp -r res/* android/app/src/main/res/

# Verifica se a cópia foi bem-sucedida
if [ $? -eq 0 ]; then
    echo "✅ Icons copied successfully!"
    echo "📋 Updated resources:"
    echo "   - App icons (mipmap-*)"
    echo "   - Adaptive icons (mipmap-anydpi-v26)"
    echo "   - Background color (values/ic_launcher_background.xml)"
else
    echo "❌ Error copying icons!"
    exit 1
fi

echo "🔧 Next steps:"
echo "   1. Run 'npm run build:android' to build APK with new icons"
echo "   2. Test the APK on device or emulator"
echo "   3. Check if icons appear correctly in launcher"

echo "💡 Tip: To generate new icons from source, use a tool like:"
echo "   - https://icon.kitchen/ (online)"
echo "   - Android Asset Studio"
echo "   - @capacitor/assets (when Sharp is working)"
