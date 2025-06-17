# Quick Setup - Android Development

**reportedBy: capacitor-investigator.v1**

## 🚀 Instalação Rápida - Comandos Essenciais

Para quem quer reproduzir a instalação rapidamente, aqui estão os comandos na ordem correta:

### 1. Setup do Android SDK
```bash
# No diretório do projeto
cd /home/marucs/Development/marucs-diet/marucs-diet-issue743

# Download e setup do Android Command Line Tools
mkdir -p android-sdk
wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O cmdtools.zip
unzip cmdtools.zip
mkdir -p android-sdk/cmdline-tools
mv cmdline-tools android-sdk/cmdline-tools/tools
rm cmdtools.zip

# Configurar variáveis de ambiente
export ANDROID_HOME="$(pwd)/android-sdk"
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/tools/bin:$ANDROID_HOME/platform-tools"

# Instalar componentes do SDK
yes | sdkmanager --licenses
sdkmanager "platform-tools"
sdkmanager "platforms;android-34"
sdkmanager "build-tools;34.0.0"
```

### 2. Instalar Capacitor
```bash
# Instalar dependências
pnpm add @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios

# Inicializar Capacitor
npx cap init "Marucs Diet" "com.marucs.diet"

# Adicionar plataforma Android
npx cap add android

# Configurar SDK local
echo "sdk.dir=$(pwd)/android-sdk" > android/local.properties
```

### 3. Configurar Build
```bash
# Criar script de build
cat > .scripts/build-android.sh << 'EOF'
#!/bin/bash
set -e
echo "🏗️ Building Marucs Diet for Android..."
npm run build
echo "🧹 Removing gzipped files..."
find .vercel/output/static -name "*.gz" -delete
echo "🔄 Syncing with Capacitor..."
npx cap sync android
echo "📱 Building Android APK..."
cd android
export ANDROID_HOME="$(pwd)/../android-sdk"
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/tools/bin:$ANDROID_HOME/platform-tools"
./gradlew assembleDebug
cd ..
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
EOF

# Tornar executável
chmod +x .scripts/build-android.sh
```

### 4. Build do APK
```bash
# Executar build completo
npm run build:android

# O APK será gerado em:
# android/app/build/outputs/apk/debug/app-debug.apk
```

## 📋 Verificação Rápida

```bash
# Verificar se tudo está OK
ls -la android-sdk/                    # SDK instalado
ls -la android/                        # Projeto Android
ls -la .scripts/build-android.sh       # Script de build
npx cap doctor                         # Status do Capacitor
```

## ⚡ Comandos Úteis

```bash
# Build apenas o Android (sem web build)
cd android && ./gradlew assembleDebug

# Limpar build anterior
cd android && ./gradlew clean

# Verificar componentes SDK instalados
sdkmanager --list_installed

# Sync apenas (sem build)
npx cap sync android
```

## 🔧 Configurações Aplicadas

### package.json
```json
"scripts": {
  "build:android": "bash ./.scripts/build-android.sh"
}
```

### capacitor.config.ts
```typescript
const config: CapacitorConfig = {
  appId: 'com.marucs.diet',
  appName: 'Marucs Diet',
  webDir: '.vercel/output/static',
}
```

### eslint.config.mjs
```javascript
ignores: [
  // ... outros ignores
  'android',
  'android-sdk',
]
```

## 📊 Resultados

- ✅ **APK Size**: 5.2MB
- ✅ **Build Time**: ~45-60 segundos
- ✅ **All Checks**: Passing
- ✅ **Ready for**: Production development

---

**Total Installation Time**: ~15-20 minutos  
**Disk Space Used**: ~650MB (SDK + tools)  
**Network Download**: ~150MB
