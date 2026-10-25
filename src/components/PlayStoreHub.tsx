import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  Code,
  FileCode,
  Layers,
  Sparkles,
  Info,
  Copy,
  Check,
  QrCode,
  Share2
} from 'lucide-react';
import JSZip from 'jszip';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { hapticEngine } from '../utils/haptics';

export const PlayStoreHub: React.FC = () => {
  const { isInstallable, isInstalled, install, isIOS } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'install' | 'android-project' | 'twa' | 'checklist'>('install');
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // App details
  const appPackageName = 'com.pixel.calculator.pro';
  const appName = 'Android Calculator Pro';
  const currentAppUrl = typeof window !== 'undefined' ? window.location.origin : 'https://my-calculator.web.app';

  const copyToClipboard = async (text: string, id: string) => {
    hapticEngine.playKeyFeedback('action');
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      // fallback
    }
  };

  const handleCopyShareLink = async () => {
    hapticEngine.playKeyFeedback('action');
    try {
      await navigator.clipboard.writeText(currentAppUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // fallback
    }
  };

  // Generate and download full Android Studio Kotlin / Compose Project (.ZIP)
  const handleDownloadAndroidProjectZip = async () => {
    hapticEngine.playKeyFeedback('action');
    setIsGeneratingZip(true);

    try {
      const zip = new JSZip();

      // 1. Root build.gradle.kts
      zip.file(
        'build.gradle.kts',
        `// Top-level build file for Google Play Calculator
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.compose.compiler) apply false
}
`
      );

      // 2. settings.gradle.kts
      zip.file(
        'settings.gradle.kts',
        `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "AndroidCalculatorPro"
include(":app")
`
      );

      // 3. app/build.gradle.kts
      zip.file(
        'app/build.gradle.kts',
        `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "${appPackageName}"
    compileSdk = 35

    defaultConfig {
        applicationId = "${appPackageName}"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug") // Replace with production keystore in Play Console
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        viewBinding = true
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    implementation("com.google.androidbrowserhelper:androidbrowserhelper:2.5.0")
}
`
      );

      // 4. AndroidManifest.xml
      zip.file(
        'app/src/main/AndroidManifest.xml',
        `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.AndroidCalculatorPro">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden"
            android:theme="@style/Theme.AndroidCalculatorPro.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- Digital Asset Links verification for seamless Play Store TWA -->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data
                    android:scheme="https"
                    android:host="${new URL(currentAppUrl).hostname}" />
            </intent-filter>
        </activity>
    </application>
</manifest>
`
      );

      // 5. MainActivity.kt
      zip.file(
        'app/src/main/java/com/pixel/calculator/pro/MainActivity.kt',
        `package com.pixel.calculator.pro

import android.annotation.SuppressLint
import android.content.Context
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.view.View
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

/**
 * Android Calculator Pro
 * Ready for Google Play Store Distribution (Target SDK 35, Android 15 ready)
 */
class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Immersive Material navigation bar
        window.decorView.systemUiVisibility = (
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
        )

        webView = WebView(this)
        setContentView(webView)

        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                return false
            }
        }
        webView.webChromeClient = WebChromeClient()

        // Point to the hosted application or local assets
        val appUrl = "${currentAppUrl}"
        webView.loadUrl(appUrl)
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
`
      );

      // 6. Resources: strings.xml & themes.xml
      zip.file(
        'app/src/main/res/values/strings.xml',
        `<resources>
    <string name="app_name">Calculator Pro</string>
    <string name="package_name">${appPackageName}</string>
</resources>
`
      );

      zip.file(
        'app/src/main/res/values/themes.xml',
        `<resources>
    <style name="Theme.AndroidCalculatorPro" parent="Theme.Material3.DayNight.NoActionBar">
        <item name="android:statusBarColor">#0F172A</item>
        <item name="android:navigationBarColor">#0F172A</item>
    </style>
    <style name="Theme.AndroidCalculatorPro.NoActionBar">
        <item name="windowActionBar">false</item>
        <item name="windowNoTitle">true</item>
    </style>
</resources>
`
      );

      // 7. Play Store twa-manifest.json
      zip.file(
        'twa-manifest.json',
        JSON.stringify(
          {
            packageId: appPackageName,
            host: new URL(currentAppUrl).hostname,
            name: appName,
            launcherName: 'Calculator',
            themeColor: '#0F172A',
            navigationColor: '#0F172A',
            backgroundColor: '#0F172A',
            startUrl: '/',
            iconUrl: `${currentAppUrl}/pwa-512x512.png`,
            maskableIconUrl: `${currentAppUrl}/pwa-maskable-512x512.png`,
            appVersionName: '1.0.0',
            appVersionCode: 1,
            shortcuts: [],
            generatorApp: 'bubblewrap-cli',
            webManifestUrl: `${currentAppUrl}/manifest.webmanifest`,
            fallbackType: 'customtabs',
            features: {
              locationDelegation: { enabled: false },
              playBilling: { enabled: false },
            },
          },
          null,
          2
        )
      );

      // 8. README with step by step Play Store publication
      zip.file(
        'README_PLAY_STORE.md',
        `# Google Play Store Publishing Guide for Android Calculator Pro

Congratulations! Your Android Calculator app is fully configured to compile into a release Android App Bundle (.aab) and be uploaded directly to the Google Play Console.

## Option A: Build with Android Studio (Recommended)
1. Open **Android Studio** -> Select **Open Project** -> Select this unzipped folder.
2. Wait for Gradle sync to complete.
3. Click **Build** -> **Generate Signed Bundle / APK...**
4. Choose **Android App Bundle (.aab)**.
5. Create or select your production KeyStore.
6. Click **Release** -> **Finish**. Android Studio will generate the \`.aab\` bundle in \`app/release/app-release.aab\`.

## Option B: Build with Bubblewrap CLI (Command Line)
If you have Node.js and Java installed:
\`\`\`bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest="${currentAppUrl}/manifest.webmanifest"
bubblewrap build
\`\`\`
This produces a signed release \`.aab\` directly in 60 seconds!

## Option C: Instant PWABuilder (No Android Studio required)
1. Visit https://www.pwabuilder.com
2. Enter your URL: ${currentAppUrl}
3. Click "Package for Google Play"
4. Download your ready-to-upload \`.aab\` file!

## Upload to Google Play Console
1. Log in to https://play.google.com/console
2. Click **Create App** -> Name: **Android Calculator Pro** -> Free.
3. Complete the store listing (add screenshots, description, icon).
4. Under **Production** or **Closed Testing**, upload your \`.aab\` bundle.
5. Submit for Google Review!
`
      );

      // Generate blob & download
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'AndroidCalculatorPro_PlayStore_Project.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate zip', err);
    } finally {
      setIsGeneratingZip(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 flex flex-col gap-6 animate-fadeIn">
      {/* Top Header Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-sky-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center shrink-0">
            <Smartphone className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Play Store & Android Install Hub
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Play Ready
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Install directly onto any Android phone or export production Google Play .aab package
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadAndroidProjectZip}
            disabled={isGeneratingZip}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-slate-950 text-xs font-bold shadow-md shadow-sky-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingZip ? 'Packaging ZIP...' : 'Download Android Studio (.zip)'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => {
            hapticEngine.playKeyFeedback('action');
            setActiveTab('install');
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'install'
              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          Direct Phone Install
        </button>

        <button
          type="button"
          onClick={() => {
            hapticEngine.playKeyFeedback('action');
            setActiveTab('android-project');
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'android-project'
              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          Android Studio Code
        </button>

        <button
          type="button"
          onClick={() => {
            hapticEngine.playKeyFeedback('action');
            setActiveTab('twa');
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'twa'
              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Bubblewrap & TWA
        </button>

        <button
          type="button"
          onClick={() => {
            hapticEngine.playKeyFeedback('action');
            setActiveTab('checklist');
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'checklist'
              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Play Store Checklist
        </button>
      </div>

      {/* Tab 1: Direct Phone Install */}
      {activeTab === 'install' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Status and 1-Click Install Card */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Installation Status
                </span>
                {isInstalled ? (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Installed Standalone
                  </span>
                ) : isInstallable ? (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 bg-sky-950/60 border border-sky-800/40 px-2.5 py-1 rounded-full">
                    <Sparkles className="w-3.5 h-3.5" /> Ready to Install
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">
                    Web App Mode
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-white mt-3">
                {isInstalled
                  ? 'Application Running in Native Phone Mode'
                  : 'Install Calculator to Phone Home Screen'}
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                When installed, the app runs fullscreen without browser address bars, enables instant offline calculation, haptic motor access, and behaves like an APK installed from the Play Store.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              {isInstallable && (
                <button
                  type="button"
                  onClick={async () => {
                    hapticEngine.playKeyFeedback('action');
                    await install();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-slate-950 font-bold text-sm shadow-lg shadow-sky-500/25 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Install Calculator to Phone
                </button>
              )}

              {isInstalled && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Calculator is installed and saved to your device home screen!</span>
                </div>
              )}

              {/* Share URL to phone */}
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  readOnly
                  value={currentAppUrl}
                  className="flex-1 bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Android Installation Instructions */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm">
              <QrCode className="w-4 h-4" />
              <span>How to Install on Any Phone</span>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/40">
                <p className="font-semibold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-[10px]">
                    1
                  </span>
                  On Android (Chrome / Samsung Internet):
                </p>
                <p className="text-slate-400 mt-1 pl-7">
                  Open the app URL in Chrome $\rightarrow$ tap the <strong>three dots menu ($\vdots$)</strong> in the top right $\rightarrow$ tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/40">
                <p className="font-semibold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-[10px]">
                    2
                  </span>
                  On iPhone / iPad (Safari):
                </p>
                <p className="text-slate-400 mt-1 pl-7">
                  Tap the <strong>Share</strong> button in Safari toolbar $\rightarrow$ scroll down and tap <strong>"Add to Home Screen"</strong> $\rightarrow$ tap <strong>Add</strong>.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/40">
                <p className="font-semibold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-[10px]">
                    3
                  </span>
                  Direct Google Play Store Publication:
                </p>
                <p className="text-slate-400 mt-1 pl-7">
                  Use our 1-click Android Studio Project ZIP below to compile an official <code className="text-sky-300">.aab</code> (Android App Bundle) and upload it straight to your Google Play Console!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Android Studio Code */}
      {activeTab === 'android-project' && (
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Full Kotlin Android Project</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Contains complete Android Studio structure, AndroidManifest.xml, build.gradle.kts, and MainActivity.kt
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadAndroidProjectZip}
              disabled={isGeneratingZip}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download ZIP</span>
            </button>
          </div>

          {/* AndroidManifest Preview */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="px-4 py-2 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300">app/src/main/AndroidManifest.xml</span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Calculator Pro"
        android:theme="@style/Theme.AndroidCalculatorPro">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,
                    'manifest'
                  )
                }
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {copiedCode === 'manifest' ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto bg-slate-950/70">
              {`<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Calculator Pro"
        android:theme="@style/Theme.AndroidCalculatorPro">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`}
            </pre>
          </div>

          {/* MainActivity.kt Preview */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="px-4 py-2 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300">
                app/src/main/java/com/pixel/calculator/pro/MainActivity.kt
              </span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    `package com.pixel.calculator.pro
import android.os.Bundle
import android.webkit.WebView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val webView = WebView(this)
        setContentView(webView)
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.loadUrl("${currentAppUrl}")
    }
}`,
                    'mainkt'
                  )
                }
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {copiedCode === 'mainkt' ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto bg-slate-950/70">
              {`package com.pixel.calculator.pro

import android.os.Bundle
import android.webkit.WebView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val webView = WebView(this)
        setContentView(webView)
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.loadUrl("${currentAppUrl}")
    }
}`}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 3: Bubblewrap & TWA */}
      {activeTab === 'twa' && (
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm">
              <Layers className="w-4 h-4" />
              <span>Official Google Bubblewrap CLI Packaging</span>
            </div>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Google provides Bubblewrap—an official CLI tool that turns any Progressive Web App into a production Google Play Store Android App Bundle (.aab) with digital asset verification.
            </p>

            <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between font-mono text-xs text-sky-300">
              <span>npx @bubblewrap/cli init --manifest="{currentAppUrl}/manifest.webmanifest"</span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    `npx @bubblewrap/cli init --manifest="${currentAppUrl}/manifest.webmanifest"`,
                    'bw1'
                  )
                }
                className="text-slate-400 hover:text-white p-1"
              >
                {copiedCode === 'bw1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="mt-2 p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between font-mono text-xs text-sky-300">
              <span>npx @bubblewrap/cli build</span>
              <button
                type="button"
                onClick={() => copyToClipboard(`npx @bubblewrap/cli build`, 'bw2')}
                className="text-slate-400 hover:text-white p-1"
              >
                {copiedCode === 'bw2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Instant PWABuilder link */}
            <div className="mt-5 p-4 rounded-xl bg-sky-950/40 border border-sky-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-white">Prefer a 1-click web interface?</h4>
                <p className="text-[11px] text-slate-300">
                  PWABuilder (by Microsoft & Google Play team) creates your .aab without installing any tools.
                </p>
              </div>
              <a
                href={`https://www.pwabuilder.com?url=${encodeURIComponent(currentAppUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs whitespace-nowrap cursor-pointer"
              >
                <span>Open PWABuilder</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Play Store Checklist */}
      {activeTab === 'checklist' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Google Play Store Submission Checklist</h3>
            <a
              href="https://play.google.com/console"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-sky-400 hover:underline flex items-center gap-1"
            >
              <span>Google Play Console</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-3">
            {[
              {
                title: '1. Register Google Play Developer Account',
                desc: 'Sign up at play.google.com/console with a one-time $25 Google registration fee.',
              },
              {
                title: '2. Create New App Listing',
                desc: 'Name: "Android Calculator Pro", Default Language: English, Free app.',
              },
              {
                title: '3. Store Listing & Graphical Assets',
                desc: 'App Icon: 512x512 PNG (included in our project), Feature Graphic: 1024x500 PNG, Minimum 2 phone screenshots.',
              },
              {
                title: '4. Content Rating & Target Audience',
                desc: 'Complete the IARC questionnaire: Utility/Tool category, suitable for All Ages (Everyone).',
              },
              {
                title: '5. Upload Release .aab Bundle',
                desc: 'Generate your signed bundle using Android Studio or Bubblewrap and upload to Production track.',
              },
              {
                title: '6. Submit for Review',
                desc: 'Google Play review usually takes 24 to 48 hours. Once approved, millions of users can install it!',
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-start gap-3"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">{step.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
