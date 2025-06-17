# Guia de Instalação - Android Development Setup

**reportedBy: capacitor-investigator.v1**

Este documento detalha o passo a passo completo para instalar todas as dependências necessárias para desenvolvimento Android com Capacitor no projeto Marucs Diet.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Instalação do Android SDK](#instalação-do-android-sdk)
4. [Configuração do Ambiente](#configuração-do-ambiente)
5. [Instalação do Capacitor](#instalação-do-capacitor)
6. [Configuração do Projeto](#configuração-do-projeto)
7. [Verificação da Instalação](#verificação-da-instalação)
8. [Troubleshooting](#troubleshooting)

## 🎯 Visão Geral

Durante a POC, foram instaladas as seguintes dependências:
- **Android Command Line Tools** (cmdtools)
- **Android SDK** com componentes necessários
- **Capacitor CLI e dependências**
- **Gradle** (incluído no projeto Android)

## ✅ Pré-requisitos

### Sistema Operacional
- Linux (testado no Ubuntu/similar)
- Java Development Kit (JDK) 11 ou superior
- Node.js e npm/pnpm instalados

### Verificar Java
```bash
java -version
# Deve retornar Java 11 ou superior
```

## 📱 Instalação do Android SDK

### 1. Download do Android Command Line Tools

```bash
# Navegar para o diretório do projeto
cd /home/marucs/Development/marucs-diet/marucs-diet-issue743

# Criar diretório para o Android SDK
mkdir -p android-sdk

# Download do Android Command Line Tools
wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O cmdtools.zip

# Extrair o arquivo
unzip cmdtools.zip

# Organizar a estrutura de diretórios
mkdir -p android-sdk/cmdline-tools
mv cmdline-tools android-sdk/cmdline-tools/tools

# Limpar arquivo zip
rm cmdtools.zip
```

### 2. Configurar Variáveis de Ambiente

```bash
# Definir ANDROID_HOME
export ANDROID_HOME="$(pwd)/android-sdk"

# Adicionar ao PATH
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/tools/bin:$ANDROID_HOME/platform-tools"
```

### 3. Instalar Componentes do Android SDK

```bash
# Aceitar licenças automaticamente
yes | sdkmanager --licenses

# Instalar componentes essenciais
sdkmanager "platform-tools"
sdkmanager "platforms;android-34"
sdkmanager "build-tools;34.0.0"

# Verificar instalação
sdkmanager --list_installed
```

### 4. Configurar arquivo local.properties

```bash
# Criar arquivo de configuração para o projeto Android
echo "sdk.dir=$(pwd)/android-sdk" > android/local.properties
```

## ⚡ Instalação do Capacitor

### 1. Instalar Dependências NPM

```bash
# Instalar pacotes do Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios

# Ou usando pnpm (usado no projeto)
pnpm add @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
```

### 2. Inicializar Capacitor

```bash
# Inicializar configuração do Capacitor
npx cap init "Marucs Diet" "com.marucs.diet"
```

### 3. Adicionar Plataforma Android

```bash
# Adicionar plataforma Android
npx cap add android
```

## 🔧 Configuração do Projeto

### 1. Arquivo capacitor.config.ts

```typescript
import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.marucs.diet',
  appName: 'Marucs Diet',
  webDir: '.vercel/output/static',
}

export default config
```

### 2. Atualizar package.json

Adicionar script de build para Android:

```json
{
  "scripts": {
    "build:android": "bash ./.scripts/build-android.sh"
  }
}
```

### 3. Configurar ESLint

Adicionar diretórios Android ao arquivo `eslint.config.mjs`:

```javascript
{
  ignores: [
    'node_modules',
    'src/sections/datepicker',
    '.vercel',
    '.vinxi',
    'dist',
    'build',
    'coverage',
    'public',
    'out',
    '.output',
    'android',        // Novo
    'android-sdk',    // Novo
  ],
}
```

### 4. Script de Build Automatizado

Criar `.scripts/build-android.sh`:

```bash
#!/bin/bash

# Capacitor Android Build Script
set -e

echo "🏗️  Building Marucs Diet for Android..."

# Build web app
echo "📦 Building web application..."
npm run build

# Remove gzipped files (evita conflitos no Android)
echo "🧹 Removing gzipped files..."
find .vercel/output/static -name "*.gz" -delete

# Sync with Capacitor
echo "🔄 Syncing with Capacitor..."
npx cap sync android

# Build Android APK
echo "📱 Building Android APK..."
cd android
export ANDROID_HOME="$(pwd)/../android-sdk"
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/tools/bin:$ANDROID_HOME/platform-tools"
./gradlew assembleDebug
cd ..

# Show result
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
```

```bash
# Tornar executável
chmod +x .scripts/build-android.sh
```

## ✅ Verificação da Instalação

### 1. Verificar Android SDK

```bash
# Verificar se o SDK está instalado corretamente
ls -la android-sdk/

# Deve mostrar:
# cmdline-tools/
# licenses/
# platform-tools/
# platforms/
# build-tools/
```

### 2. Verificar Capacitor

```bash
# Verificar se o Capacitor está funcionando
npx cap doctor

# Deve mostrar status OK para Android
```

### 3. Build de Teste

```bash
# Executar build completo
npm run build:android

# Verificar se o APK foi gerado
ls -la android/app/build/outputs/apk/debug/app-debug.apk
```

## 🐛 Troubleshooting

### Problema: "command not found: sdkmanager"

**Solução**: Verificar se as variáveis de ambiente estão corretas:

```bash
export ANDROID_HOME="$(pwd)/android-sdk"
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/tools/bin"
```

### Problema: "Duplicate resources" no build Android

**Solução**: Remover arquivos .gz antes do sync:

```bash
find .vercel/output/static -name "*.gz" -delete
```

### Problema: ESLint errors em arquivos gerados

**Solução**: Adicionar `android` e `android-sdk` ao `eslint.config.mjs`

### Problema: Java version incompatível

**Solução**: Instalar Java 11 ou superior:

```bash
# Ubuntu/Debian
sudo apt install openjdk-11-jdk

# Verificar versão
java -version
```

### Problema: Permissions no SDK

**Solução**: Corrigir permissões:

```bash
chmod -R 755 android-sdk/
```

## 📦 Estrutura Final do Projeto

```
marucs-diet-issue743/
├── android/                    # Projeto Android gerado
│   ├── app/
│   ├── gradle/
│   ├── local.properties       # Configuração do SDK
│   └── gradlew               # Gradle wrapper
├── android-sdk/              # Android SDK local
│   ├── build-tools/
│   ├── cmdline-tools/
│   ├── platform-tools/
│   └── platforms/
├── .scripts/
│   └── build-android.sh      # Script de build automatizado
├── capacitor.config.ts       # Configuração do Capacitor
└── package.json             # Dependências NPM
```

## 🎯 Dependências Instaladas

### NPM Packages
```json
{
  "dependencies": {
    "@capacitor/android": "^7.3.0",
    "@capacitor/cli": "^7.3.0",
    "@capacitor/core": "^7.3.0",
    "@capacitor/ios": "^7.3.0"
  }
}
```

### Android SDK Components
- **platform-tools**: Ferramentas essenciais (adb, fastboot)
- **platforms;android-34**: Android API 34 (Android 14)
- **build-tools;34.0.0**: Ferramentas de build

### Tamanhos Aproximados
- **Android Command Line Tools**: ~120MB
- **SDK Components**: ~500MB
- **APK Final**: 5.2MB

## ⚠️ Persistência das Configurações

### Variáveis de Ambiente Temporárias

As variáveis exportadas funcionam apenas na sessão atual:

```bash
export ANDROID_HOME="$(pwd)/android-sdk"
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/tools/bin:$ANDROID_HOME/platform-tools"
```

### Para Tornar Permanente (Opcional)

Adicionar ao `~/.bashrc` ou `~/.zshrc`:

```bash
# Android SDK
export ANDROID_HOME="$HOME/Development/marucs-diet/marucs-diet-issue743/android-sdk"
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/tools/bin:$ANDROID_HOME/platform-tools"
```

## 📝 Comandos de Manutenção

### Atualizar SDK
```bash
sdkmanager --update
```

### Listar componentes disponíveis
```bash
sdkmanager --list
```

### Build limpo
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

## 🎉 Resultado Final

Após seguir todos estes passos, você terá:

✅ **Android SDK completamente configurado**  
✅ **Capacitor integrado ao projeto SolidJS**  
✅ **Build automatizado funcionando**  
✅ **APK de 5.2MB gerado com sucesso**  

**Comando final para build**: `npm run build:android`

---

**Data da Instalação**: 17 de Junho de 2025  
**Testado em**: Linux (zsh)  
**Versões**: Capacitor 7.3.0, Android API 34
