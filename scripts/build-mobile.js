// VOID IDE - Mobile Build Script
const fs = require('fs');
const path = require('path');

const buildMobile = async () => {
  console.log('📱 Building VOID IDE for Mobile...');
  
  const outputDir = path.join(__dirname, '..', 'dist', 'mobile');
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Create Capacitor config
  const capacitorConfig = {
    appId: 'com.void.ide',
    appName: 'VOID IDE',
    webDir: '../web',
    server: {
      androidScheme: 'https'
    },
    plugins: {
      SplashScreen: {
        launchShowDuration: 3000,
        backgroundColor: '#0a0a0f',
        splashFullScreen: true
      },
      StatusBar: {
        style: 'LIGHT'
      }
    }
  };
  
  fs.writeFileSync(
    path.join(outputDir, 'capacitor.config.json'),
    JSON.stringify(capacitorConfig, null, 2)
  );
  
  // Create Android project structure
  const androidDir = path.join(outputDir, 'android');
  if (!fs.existsSync(androidDir)) {
    fs.mkdirSync(androidDir, { recursive: true });
  }
  
  // Create AndroidManifest.xml
  const androidManifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="com.void.ide">
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="VOID IDE"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|screenSize"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
</manifest>`;
  
  fs.writeFileSync(path.join(androidDir, 'AndroidManifest.xml'), androidManifest);
  
  // Create iOS project structure
  const iosDir = path.join(outputDir, 'ios');
  if (!fs.existsSync(iosDir)) {
    fs.mkdirSync(iosDir, { recursive: true });
  }
  
  // Create Info.plist
  const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>$(DEVELOPMENT_LANGUAGE)</string>
    <key>CFBundleDisplayName</key>
    <string>VOID IDE</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>$(PRODUCT_NAME)</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSRequiresIPhoneOS</key>
    <true/>
    <key>UIApplicationSceneManifest</key>
    <dict>
        <key>UIApplicationSupportsMultipleScenes</key>
        <false/>
        <key>UISceneConfigurations</key>
        <dict>
            <key>UIWindowSceneSessionRoleApplication</key>
            <array>
                <dict>
                    <key>UISceneConfigurationName</key>
                    <string>Default Configuration</string>
                    <key>UISceneDelegateClassName</key>
                    <string>$(PRODUCT_MODULE_NAME).SceneDelegate</string>
                </dict>
            </array>
        </dict>
    </dict>
    <key>UILaunchStoryboardName</key>
    <string>LaunchScreen</string>
    <key>UIRequiredDeviceCapabilities</key>
    <array>
        <string>armv7</string>
    </array>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    <key>UISupportedInterfaceOrientations~ipad</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationPortraitUpsideDown</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    <key>UIStatusBarStyle</key>
    <string>UIStatusBarStyleLightContent</string>
    <key>UIViewControllerBasedStatusBarAppearance</key>
    <false/>
</dict>
</plist>`;
  
  fs.writeFileSync(path.join(iosDir, 'Info.plist'), infoPlist);
  
  // Create native app code
  const androidMainActivity = `package com.void.ide;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }
}`;
  
  fs.writeFileSync(path.join(androidDir, 'app', 'src', 'main', 'java', 'com', 'void', 'ide', 'MainActivity.java'), androidMainActivity);
  
  // Create build instructions
  const readme = `# Mobile Build Guide

## Prerequisites
- Node.js
- Java JDK 11+
- Android Studio (for Android)
- Xcode (for iOS)
- Capacitor

## Step 1: Build Web First
\`\`\`bash
npm run build:web
\`\`\`

## Step 2: Initialize Capacitor
\`\`\`bash
cd dist/mobile
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init
\`\`\`

## Step 3: Build for Android
\`\`\`bash
npx cap add android
npx cap sync
npx cap open android
\`\`\`

Then build in Android Studio:
1. Build > Build Bundle(s) / APK(s) > Build APK(s)

## Step 4: Build for iOS
\`\`\`bash
npx cap add ios
npx cap sync
npx cap open ios
\`\`\`

Then build in Xcode:
1. Product > Build

## Output
- Android: \`android/app/build/outputs/apk/debug/\`
- iOS: \`ios/App/build/Debug-iphoneos/\`

## Notes
- Mobile builds require web build first
- You'll need proper signing certificates for release builds
- Test on real devices for best results
`;
  
  fs.writeFileSync(path.join(outputDir, 'README.md'), readme);
  
  console.log('✅ Mobile build setup complete!');
  console.log('📁 Output:', outputDir);
  console.log('');
  console.log('Next steps:');
  console.log('1. npm run build:web');
  console.log('2. cd dist/mobile');
  console.log('3. npm install @capacitor/core @capacitor/cli');
  console.log('4. npx cap add android');
  console.log('5. npx cap open android');
};

buildMobile().catch(console.error);
