# DesignClo
> A design tool for creating and styling clothing designs.

## Features
- **Joystick Control**: Navigate and manipulate design elements with an intuitive joystick interface.
- **Number Input**: Adjust design parameters with precise number inputs.
- **History Management**: Keep track of changes and revert to previous states easily.

## Prerequisites

### Windows 10 Setup for Tauri v2 Mobile Development

1. **Node.js & NPM**
   - Install Node.js LTS from https://nodejs.org
   - Verify with `node --version` and `npm --version`

2. **Rust Setup**
   - Install Rust from https://rustup.rs
   - Install Android targets:
     ```
     rustup target add aarch64-linux-android armv7-linux-androideabi x86_64-linux-android i686-linux-android
     ```

3. **Android Studio & SDK**
   - Install Android Studio from https://developer.android.com/studio
   - Install in SDK Manager:
     - Android SDK (API 31+)
     - Android NDK
     - Android SDK Command-line Tools
     - Android SDK Platform-Tools

4. **Environment Setup**
   - Set system environment variables:
     - `ANDROID_SDK_ROOT` or `ANDROID_HOME`: Path to Android SDK
     - `ANDROID_NDK_HOME`: Path to NDK folder
   - Add to PATH:
     - `%ANDROID_SDK_ROOT%\platform-tools`
     - `%ANDROID_SDK_ROOT%\cmdline-tools\latest\bin`

5. **Additional Requirements**
   - Java JDK (bundled with Android Studio)
   - Visual Studio Build Tools with C++ workload
   - Cargo helpers (optional):
     ```
     cargo install cargo-ndk
     cargo install cross
     ```

6. **Final Steps**
   - Accept Android SDK licenses: `sdkmanager --licenses`
   - Verify setup with `adb devices`

Note: iOS development requires macOS and cannot be done on Windows.

## Run

1. **Clone & Install Dependencies**
   ```bash
   git clone https://github.com/danieljohnbyns/DesignClo.git
   cd DesignClo
   npm install
   ```

2. **Development**
   - Start web development server:
     ```bash
     npm run dev
     ```
   - For Android development:
     ```bash
     npm run tauri android dev
     ```

3. **Build**
   - Build web version:**
     ```bash
     npm run build
     ```
   - Build Android APK:
     ```bash
     npm run tauri android build
     ```
   The Android APK will be generated in `src-tauri/gen/android/app/build/outputs/apk/`

## Android App Signing

1. **Generate Keystore**
   ```bash
   keytool -genkey -v -keystore upload.keystore -alias upload -keyalg RSA -keysize 2048 -validity 10000
   ```
   - You'll be prompted to:
     - Enter a keystore password
     - Enter your name, organization, and location
     - Confirm the information

2. **Configure Signing**
   - Create `keystore.properties` in `src-tauri/gen/android/`:
     ```properties
     storePassword=your_keystore_password
     keyPassword=your_key_password
     keyAlias=upload
     storeFile=path/to/upload.keystore
     ```
   - Add `keystore.properties` to `.gitignore`

3. **Build Signed APK**
   ```bash
   npm run tauri android build --release
   ```
   The signed APK will be in `src-tauri/gen/android/app/build/outputs/apk/release/`

Note: Keep your keystore and keystore.properties secure. Never commit them to version control.