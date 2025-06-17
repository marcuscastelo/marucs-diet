# Troubleshooting - Android Setup

**reportedBy: capacitor-investigator.v1**

## 🐛 Problemas Comuns e Soluções

### 1. 🚫 "command not found: sdkmanager"

**Sintomas:**
```bash
sdkmanager --licenses
# zsh: command not found: sdkmanager
```

**Causa:** Variáveis de ambiente não configuradas

**Solução:**
```bash
# Verificar se o diretório existe
ls -la android-sdk/cmdline-tools/tools/bin/sdkmanager

# Reconfigurar variáveis
export ANDROID_HOME="$(pwd)/android-sdk"
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/tools/bin:$ANDROID_HOME/platform-tools"

# Testar novamente
sdkmanager --version
```

### 2. ❌ "Duplicate resources" no Gradle

**Sintomas:**
```
ERROR: [public/_build/assets/pt-CdAKdDpl.js] ... [public/_build/assets/pt-CdAKdDpl.js.gz]: Duplicate resources
```

**Causa:** Arquivos .js e .js.gz sendo copiados juntos

**Solução:**
```bash
# Remover arquivos .gz antes do sync
find .vercel/output/static -name "*.gz" -delete

# Ou adicionar ao script de build (já incluído)
echo "find .vercel/output/static -name '*.gz' -delete" >> .scripts/build-android.sh
```

### 3. 🔒 "Failed to install the following Android SDK packages"

**Sintomas:**
```
Warning: Failed to install the following Android SDK packages as some licences have not been accepted.
```

**Solução:**
```bash
# Aceitar todas as licenças automaticamente
yes | sdkmanager --licenses

# Ou aceitar manualmente
sdkmanager --licenses
# Digitar 'y' para cada licença
```

### 4. ☕ "Unsupported Java version"

**Sintomas:**
```
ERROR: JAVA_HOME is set to an invalid directory
```

**Verificar versão Java:**
```bash
java -version
# Deve ser Java 11 ou superior
```

**Solução (Ubuntu/Debian):**
```bash
# Instalar Java 11
sudo apt update
sudo apt install openjdk-11-jdk

# Verificar instalação
java -version
javac -version
```

**Solução (outras distribuições):**
```bash
# Fedora/CentOS
sudo dnf install java-11-openjdk-devel

# Arch Linux
sudo pacman -S jdk11-openjdk
```

### 5. 📁 "SDK location not found"

**Sintomas:**
```
SDK location not found. Define location with an ANDROID_SDK_ROOT environment variable
```

**Solução:**
```bash
# Verificar se o arquivo local.properties existe
cat android/local.properties

# Deve conter:
# sdk.dir=/caminho/completo/para/android-sdk

# Se não existir, criar:
echo "sdk.dir=$(pwd)/android-sdk" > android/local.properties
```

### 6. 🔧 "Gradle build failed"

**Sintomas:**
```
FAILURE: Build failed with an exception.
```

**Soluções:**

**a) Limpar cache do Gradle:**
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

**b) Verificar permissões:**
```bash
chmod -R 755 android-sdk/
chmod +x android/gradlew
```

**c) Verificar espaço em disco:**
```bash
df -h
# Garantir pelo menos 2GB livres
```

### 7. 🌐 "Network connection issues"

**Sintomas:**
```
Could not resolve all dependencies for configuration ':app:debugRuntimeClasspath'.
```

**Solução:**
```bash
# Tentar novamente (problemas temporários de rede)
cd android && ./gradlew assembleDebug --refresh-dependencies

# Verificar conectividade
ping google.com
```

### 8. 🔍 ESLint errors em arquivos gerados

**Sintomas:**
```
/android/app/build/intermediates/assets/debug/mergeDebugAssets/native-bridge.js
  error  Definition for rule '@typescript-eslint/no-unused-vars' was not found
```

**Solução:**
```bash
# Verificar se os ignores estão no eslint.config.mjs
grep -A 10 "ignores:" eslint.config.mjs

# Deve incluir:
# 'android',
# 'android-sdk',
```

### 9. 💾 "No space left on device"

**Sintomas:**
```bash
No space left on device
```

**Verificar espaço:**
```bash
df -h
du -sh android-sdk/
du -sh android/
```

**Limpeza:**
```bash
# Limpar builds anteriores
rm -rf android/app/build/

# Limpar cache do Gradle
rm -rf ~/.gradle/caches/

# Limpar node_modules se necessário
rm -rf node_modules/
npm install
```

### 10. ⚙️ "Capacitor not found" ou versão incorreta

**Sintomas:**
```bash
npx cap doctor
# Command not found: cap
```

**Solução:**
```bash
# Reinstalar Capacitor
npm uninstall @capacitor/cli @capacitor/core @capacitor/android
npm install @capacitor/cli @capacitor/core @capacitor/android

# Verificar instalação
npx cap --version
```

## 🔄 Comandos de Reset Completo

Se nada mais funcionar, reset completo:

```bash
# 1. Limpar tudo
rm -rf android/
rm -rf android-sdk/
rm -rf node_modules/

# 2. Reinstalar dependências
npm install

# 3. Reconfigurar Android SDK
mkdir -p android-sdk
wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O cmdtools.zip
unzip cmdtools.zip
mkdir -p android-sdk/cmdline-tools
mv cmdline-tools android-sdk/cmdline-tools/tools
rm cmdtools.zip

# 4. Reconfigurar ambiente
export ANDROID_HOME="$(pwd)/android-sdk"
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/tools/bin:$ANDROID_HOME/platform-tools"

# 5. Reinstalar componentes
yes | sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"

# 6. Recriar projeto Android
npx cap add android
echo "sdk.dir=$(pwd)/android-sdk" > android/local.properties

# 7. Testar build
npm run build:android
```

## 📞 Como Obter Ajuda

### Logs Detalhados
```bash
# Build com logs verbosos
cd android && ./gradlew assembleDebug --info --stacktrace

# Capacitor doctor
npx cap doctor

# Verificar configuração
cat capacitor.config.ts
cat android/local.properties
```

### Informações do Sistema
```bash
# Versões importantes
node --version
npm --version
java -version
echo $ANDROID_HOME
echo $PATH
```

### Estrutura de Arquivos
```bash
# Verificar estrutura
tree -L 3 android-sdk/
tree -L 2 android/
ls -la .scripts/
```

## ✅ Checklist de Verificação

Antes de reportar problemas, verificar:

- [ ] Java 11+ instalado
- [ ] Variáveis ANDROID_HOME e PATH configuradas
- [ ] Licenças do SDK aceitas
- [ ] Arquivo local.properties existe
- [ ] Pelo menos 2GB de espaço livre
- [ ] Conexão com internet funcionando
- [ ] Permissões corretas nos diretórios

---

**Última atualização**: 17 de Junho de 2025  
**Testado em**: Linux (zsh)  
**Se precisar de ajuda adicional**: Verificar logs detalhados e incluir informações do sistema
