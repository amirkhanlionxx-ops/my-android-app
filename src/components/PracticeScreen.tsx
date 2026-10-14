import React, { useState, useEffect, useRef, useMemo } from 'react';
import JSZip from 'jszip';
import { AiCodeAssistantModal } from './AiCodeAssistantModal';
import {
  sendAiChatMessage,
  debugCodeWithAi,
  generateAppWithAi,
  transcribeAudioWithAi,
  AI_TARGET_PLATFORMS,
  AI_QUICK_COMMANDS,
  AI_APP_TEMPLATES,
  AiTargetPlatformId,
  getAiPlatformById,
} from '../services/aiService';
import {
  detectAppCategory,
  compileAppToStandaloneHtml,
  resolveEffectiveAppName,
  generateAppLogoPreviewDataUrl,
  triggerReliableDownload,
  getLiveBackendUrl,
  fetchWithBackendFallback,
  compressStringToBase64Url,
  isStandaloneApkEnv,
} from '../utils/appCompiler';
import { renderHighlightedLines } from '../utils/syntaxHighlight';
import {
  ProjectItem,
  TutorialItem,
  DEFAULT_PRACTICE_PROJECTS,
  DEFAULT_TUTORIALS,
  isOriginalProject,
  isOriginalTutorial,
  isOriginalBlock,
} from '../data/practiceProjectsData';
import {
  DEFAULT_FLUTTER_PRACTICE_PROJECTS,
  DEFAULT_FLUTTER_TUTORIALS,
  DEFAULT_FLUTTER_BLOCKS,
} from '../data/flutterPracticeData';
import {
  DEFAULT_ANDROID_PRACTICE_PROJECTS,
  DEFAULT_ANDROID_TUTORIALS,
  DEFAULT_ANDROID_BLOCKS,
} from '../data/androidPracticeData';
import {
  BlockItem,
  DEFAULT_BLOCKS,
  compileBlocksToProject,
} from '../data/practiceBlocksData';
import {
  ALL_100_PRACTICE_PROJECTS,
  ALL_100_FLUTTER_PROJECTS,
  ALL_100_ANDROID_PROJECTS,
} from '../data/hundredPracticeProjects';
import {
  DEFAULT_ROW1_SYMBOLS,
  DEFAULT_ROW2_SYMBOLS,
  alignSymbolPairs,
  UI_TOKEN_SET,
  CODE_KEYWORD_SET,
} from '../utils/symbolConstants';

export interface CustomProjectFile {
  id: string;
  name: string;
  lang: string;
  content: string;
  createdAt: string;
  isOriginal?: boolean;
}

export interface CustomProject {
  id: string;
  name: string;
  lang: string;
  createdAt: string;
  files: CustomProjectFile[];
}

export const getCustomFileIcon = (fileName: string, lang: string) => {
  const l = (lang || '').toLowerCase();
  const n = (fileName || '').toLowerCase();
  if (l === 'kotlin' || n.endsWith('.kt')) return 'fab fa-android';
  if (l === 'java' || n.endsWith('.java')) return 'fab fa-java';
  if (l === 'html' || n.endsWith('.html')) return 'fab fa-html5';
  if (l === 'css' || n.endsWith('.css')) return 'fab fa-css3-alt';
  if (l === 'js' || l === 'javascript' || n.endsWith('.js')) return 'fab fa-js';
  if (l === 'gradle' || n.endsWith('.gradle') || n.endsWith('.properties') || n.endsWith('.pro')) return 'fas fa-wrench';
  if (l === 'dart' || l === 'flutter' || n.endsWith('.dart')) return 'fas fa-feather-pointed';
  if (l === 'swift' || n.endsWith('.swift')) return 'fab fa-apple';
  return 'fas fa-file-code';
};

export const getCustomFileColor = (fileName: string, lang: string) => {
  const l = (lang || '').toLowerCase();
  const n = (fileName || '').toLowerCase();
  if (l === 'kotlin' || n.endsWith('.kt')) return '#7F52FF';
  if (l === 'java' || n.endsWith('.java')) return '#F89820';
  if (l === 'html' || n.endsWith('.html')) return '#E44D26';
  if (l === 'css' || n.endsWith('.css')) return '#2965f1';
  if (l === 'js' || l === 'javascript' || n.endsWith('.js')) return '#f7df1e';
  if (l === 'gradle' || n.endsWith('.gradle') || n.endsWith('.properties') || n.endsWith('.pro')) return '#10b981';
  if (l === 'dart' || l === 'flutter' || n.endsWith('.dart')) return '#40C4FF';
  if (l === 'swift' || n.endsWith('.swift')) return '#F05138';
  return '#38bdf8';
};

export const getDefaultFileContent = (fileName: string, lang: string): string => {
  const lower = fileName.toLowerCase();
  if (lang === 'Kotlin' || lower.endsWith('.kt')) {
    return `package com.example.app\n\nimport android.os.Bundle\nimport androidx.appcompat.app.AppCompatActivity\n\nclass MainActivity : AppCompatActivity() {\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        println("Kotlin Android Activity Running!")\n    }\n}\n`;
  }
  if (lang === 'Java' || lower.endsWith('.java')) {
    return `package com.example.app;\n\nimport android.os.Bundle;\nimport androidx.appcompat.app.AppCompatActivity;\n\npublic class MainActivity extends AppCompatActivity {\n    @Override\n    protected void onCreate(Bundle savedInstanceState) {\n        super.onCreate(savedInstanceState);\n        System.out.println("Java Android Activity Running!");\n    }\n}\n`;
  }
  if (lang === 'Gradle' || lower.endsWith('.gradle') || lower.endsWith('.properties') || lower.endsWith('.pro')) {
    return `// Android Gradle Build File\nplugins {\n    id 'com.android.application'\n    id 'org.jetbrains.kotlin.android'\n}\n\nandroid {\n    namespace 'com.example.app'\n    compileSdk 34\n\n    defaultConfig {\n        applicationId "com.example.app"\n        minSdk 24\n        targetSdk 34\n        versionCode 1\n        versionName "1.0"\n    }\n}\n\ndependencies {\n    implementation 'androidx.core:core-ktx:1.12.0'\n    implementation 'androidx.appcompat:appcompat:1.6.1'\n}\n`;
  }
  if (lang === 'Dart' || lower.endsWith('.dart')) {
    return `import 'package:flutter/material.dart';\n\nvoid main() {\n  runApp(const MyApp());\n}\n\nclass MyApp extends StatelessWidget {\n  const MyApp({super.key});\n\n  @override\n  Widget build(BuildContext context) {\n    return MaterialApp(\n      home: Scaffold(\n        appBar: AppBar(title: const Text('Flutter Practice')),\n        body: const Center(child: Text('Hello Flutter App!')),\n      ),\n    );\n  }\n}\n`;
  }
  if (lang === 'Swift' || lower.endsWith('.swift')) {
    return `import SwiftUI\n\nstruct ContentView: View {\n    var body: some View {\n        VStack {\n            Image(systemName: "globe")\n                .imageScale(.large)\n                .foregroundStyle(.tint)\n            Text("Hello, iOS SwiftUI!")\n        }\n        .padding()\n    }\n}\n`;
  }
  if (lang === 'CSS' || lower.endsWith('.css')) {
    return `body {\n  font-family: system-ui, -apple-system, sans-serif;\n  margin: 0;\n  padding: 16px;\n  background: #0f172a;\n  color: #f8fafc;\n}\n\n.card {\n  background: #1e293b;\n  border-radius: 12px;\n  padding: 20px;\n  box-shadow: 0 4px 16px rgba(0,0,0,0.3);\n}\n`;
  }
  if (lang === 'JS' || lower.endsWith('.js')) {
    return `// JavaScript Logic\nconsole.log("App script running successfully!");\n\nfunction handleAction() {\n  alert("Button clicked!");\n}\n`;
  }
  return `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${fileName}</title>\n  <style>\n    body { font-family: system-ui, sans-serif; background: #0f172a; color: #fff; padding: 20px; }\n    .card { background: #1e293b; padding: 24px; border-radius: 14px; text-align: center; }\n    .btn { background: #007AFF; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; }\n  </style>\n</head>\n<body>\n  <div class="card">\n    <h2>${fileName}</h2>\n    <p>Custom project file running.</p>\n    <button class="btn" onclick="alert('Running!')">Click Me</button>\n  </div>\n</body>\n</html>\n`;
};

// Generates 100 default original files for each of the 6 categories (Kotlin, Java, HTML, CSS, JavaScript, Build Gradle)
export const createDefaultProjectFiles = (projName: string): CustomProjectFile[] => {
  const baseFiles: CustomProjectFile[] = [
  // 1. KOTLIN CATEGORY (First 10 core files)
  {
    id: `kt_1_${Date.now()}`,
    name: 'MainActivity.kt',
    lang: 'Kotlin',
    content: `package com.example.${projName.toLowerCase().replace(/[^a-z0-9]/g, '')}\n\nimport android.os.Bundle\nimport android.widget.Toast\nimport androidx.appcompat.app.AppCompatActivity\n\nclass MainActivity : AppCompatActivity() {\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        Toast.makeText(this, "Welcome to ${projName} in Kotlin!", Toast.LENGTH_SHORT).show()\n    }\n}`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `kt_2_${Date.now()}`,
    name: 'AppViewModel.kt',
    lang: 'Kotlin',
    content: `package com.example.viewmodel\n\nimport androidx.lifecycle.ViewModel\nimport kotlinx.coroutines.flow.MutableStateFlow\nimport kotlinx.coroutines.flow.asStateFlow\n\nclass AppViewModel : ViewModel() {\n    private val _uiState = MutableStateFlow("${projName} Initialized")\n    val uiState = _uiState.asStateFlow()\n\n    fun updateStatus(newStatus: String) {\n        _uiState.value = newStatus\n    }\n}`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `kt_3_${Date.now()}`,
    name: 'UserRepository.kt',
    lang: 'Kotlin',
    content: `package com.example.repository\n\nclass UserRepository {\n    fun getUserDisplayName(): String = "${projName} Master"\n    fun isAuthenticated(): Boolean = true\n}`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `kt_4_${Date.now()}`,
    name: 'NetworkClient.kt',
    lang: 'Kotlin',
    content: `package com.example.network\n\nobject NetworkClient {\n    const val BASE_URL = "https://api.${projName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/"\n    fun fetchData(): String = "{ status: 'ok', project: '${projName}' }"\n}`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `kt_5_${Date.now()}`,
    name: 'DatabaseHelper.kt',
    lang: 'Kotlin',
    content: `package com.example.db\n\nimport android.content.Context\nimport android.database.sqlite.SQLiteDatabase\nimport android.database.sqlite.SQLiteOpenHelper\n\nclass DatabaseHelper(context: Context) : SQLiteOpenHelper(context, "${projName.toLowerCase()}_kt.db", null, 1) {\n    override fun onCreate(db: SQLiteDatabase?) {}\n    override fun onUpgrade(db: SQLiteDatabase?, old: Int, new: Int) {}\n}`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `kt_6_${Date.now()}`,
    name: 'AppConstants.kt',
    lang: 'Kotlin',
    content: `package com.example.constants\n\nobject AppConstants {\n    const val APP_NAME = "${projName}"\n    const val VERSION_NAME = "1.0.0"\n    const val TIMEOUT_SECONDS = 30L\n}`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `kt_7_${Date.now()}`,
    name: 'ViewExtensions.kt',
    lang: 'Kotlin',
    content: `package com.example.extensions\n\nimport android.view.View\n\nfun View.show() { visibility = View.VISIBLE }\nfun View.hide() { visibility = View.GONE }`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `kt_8_${Date.now()}`,
    name: 'UserDataModel.kt',
    lang: 'Kotlin',
    content: `package com.example.model\n\ndata class UserProfile(\n    val id: String = "user_01",\n    val name: String = "${projName} Admin",\n    val email: String = "dev@example.com"\n)`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `kt_9_${Date.now()}`,
    name: 'NavigationRouter.kt',
    lang: 'Kotlin',
    content: `package com.example.navigation\n\nobject NavigationRouter {\n    const val HOME_ROUTE = "home"\n    const val DETAIL_ROUTE = "detail"\n    const val SETTINGS_ROUTE = "settings"\n}`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `kt_10_${Date.now()}`,
    name: 'ThemeStyles.kt',
    lang: 'Kotlin',
    content: `package com.example.theme\n\nobject ThemeStyles {\n    const val PRIMARY_COLOR = "#6366F1"\n    const val ACCENT_COLOR = "#A855F7"\n    const val BACKGROUND_COLOR = "#0D0F1B"\n}`,
    createdAt: 'Default',
    isOriginal: true,
  },

  // 2. JAVA CATEGORY (10 files)
  {
    id: `java_1_${Date.now()}`,
    name: 'MainActivity.java',
    lang: 'Java',
    content: `package com.example.${projName.toLowerCase().replace(/[^a-z0-9]/g, '')};\n\nimport android.os.Bundle;\nimport android.widget.Toast;\nimport androidx.appcompat.app.AppCompatActivity;\n\npublic class MainActivity extends AppCompatActivity {\n    @Override\n    protected void onCreate(Bundle savedInstanceState) {\n        super.onCreate(savedInstanceState);\n        Toast.makeText(this, "Welcome to ${projName}!", Toast.LENGTH_SHORT).show();\n    }\n}`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `java_2_${Date.now()}`,
    name: 'UserManager.java',
    lang: 'Java',
    content: `package com.example.user;\n\npublic class UserManager {\n    private String username = "Admin";\n    public String getUsername() { return username; }\n    public void setUsername(String username) { this.username = username; }\n}`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `java_3_${Date.now()}`,
    name: 'AppHelper.java',
    lang: 'Java',
    content: `package com.example.utils;\n\nimport android.content.Context;\nimport android.widget.Toast;\n\npublic class AppHelper {\n    public static void showToast(Context context, String text) {\n        Toast.makeText(context, text, Toast.LENGTH_SHORT).show();\n    }\n}`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `java_4_${Date.now()}`,
    name: 'UserAdapter.java',
    lang: 'Java',
    content: `package com.example.adapters;\n\nimport android.view.View;\nimport android.view.ViewGroup;\nimport androidx.recyclerview.widget.RecyclerView;\n\npublic class UserAdapter extends RecyclerView.Adapter<UserAdapter.UserViewHolder> {\n    public static class UserViewHolder extends RecyclerView.ViewHolder {\n        public UserViewHolder(View itemView) {\n            super(itemView);\n        }\n    }\n    @Override\n    public int getItemCount() { return 10; }\n}`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `java_5_${Date.now()}`,
    name: 'NetworkClient.java',
    lang: 'Java',
    content: `package com.example.network;\n\nimport java.net.HttpURLConnection;\nimport java.net.URL;\n\npublic class NetworkClient {\n    public static String get(String urlString) throws Exception {\n        URL url = new URL(urlString);\n        HttpURLConnection conn = (HttpURLConnection) url.openConnection();\n        conn.setRequestMethod("GET");\n        return "Response 200 OK";\n    }\n}`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `java_6_${Date.now()}`,
    name: 'DatabaseHelper.java',
    lang: 'Java',
    content: `package com.example.db;\n\nimport android.content.Context;\nimport android.database.sqlite.SQLiteDatabase;\nimport android.database.sqlite.SQLiteOpenHelper;\n\npublic class DatabaseHelper extends SQLiteOpenHelper {\n    private static final String DATABASE_NAME = "${projName.toLowerCase()}_db.sqlite";\n    public DatabaseHelper(Context context) {\n        super(context, DATABASE_NAME, null, 1);\n    }\n    @Override public void onCreate(SQLiteDatabase db) {}\n    @Override public void onUpgrade(SQLiteDatabase db, int o, int n) {}\n}`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `java_7_${Date.now()}`,
    name: 'ApiService.java',
    lang: 'Java',
    content: `package com.example.api;\n\npublic class ApiService {\n    public static final String ENDPOINT = "https://api.example.com/";\n    public static void fetchItems() {\n        System.out.println("Fetching items from " + ENDPOINT);\n    }\n}`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `java_8_${Date.now()}`,
    name: 'ConfigManager.java',
    lang: 'Java',
    content: `package com.example.config;\n\npublic class ConfigManager {\n    public static final String APP_NAME = "${projName}";\n    public static final boolean DEBUG = true;\n    public static final int CACHE_EXPIRY_MS = 60000;\n}`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `java_9_${Date.now()}`,
    name: 'EventBus.java',
    lang: 'Java',
    content: `package com.example.events;\n\npublic class EventBus {\n    public interface Listener {\n        void onEvent(String tag, Object payload);\n    }\n}`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `java_10_${Date.now()}`,
    name: 'Utils.java',
    lang: 'Java',
    content: `package com.example.utils;\n\nimport java.text.SimpleDateFormat;\nimport java.util.Date;\nimport java.util.Locale;\n\npublic class Utils {\n    public static String getTimestamp() {\n        return new SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.US).format(new Date());\n    }\n}`,
    createdAt: 'Default',
    isOriginal: true,
  },

  // 3. HTML / INDEX CATEGORY (10 files)
  {
    id: `html_1_${Date.now()}`,
    name: 'index.html',
    lang: 'HTML',
    content: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${projName} - Main</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <div class="card">\n    <h1>Welcome to ${projName}</h1>\n    <p>Project initialized with 6 categories: Kotlin, Java, HTML, CSS, JS & Build Gradle.</p>\n    <button class="btn" onclick="alert('Running index.html!')">Launch App</button>\n  </div>\n</body>\n</html>`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `html_2_${Date.now()}`,
    name: 'home.html',
    lang: 'HTML',
    content: `<!DOCTYPE html>\n<html>\n<head><title>Home</title></head>\n<body>\n  <div class="card">\n    <h2>Home View</h2>\n    <p>Landing page and summary cards.</p>\n  </div>\n</body>\n</html>`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `html_3_${Date.now()}`,
    name: 'about.html',
    lang: 'HTML',
    content: `<!DOCTYPE html>\n<html>\n<head><title>About</title></head>\n<body>\n  <div class="card">\n    <h2>About ${projName}</h2>\n    <p>Crafted in Android IDE Practice Studio.</p>\n  </div>\n</body>\n</html>`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `html_4_${Date.now()}`,
    name: 'dashboard.html',
    lang: 'HTML',
    content: `<!DOCTYPE html>\n<html>\n<head><title>Dashboard</title></head>\n<body>\n  <div class="card">\n    <h2>Dashboard & Metrics</h2>\n    <div style="font-size: 24px; color: #38bdf8; margin: 12px 0;">Active Users: 2,540</div>\n  </div>\n</body>\n</html>`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `html_5_${Date.now()}`,
    name: 'profile.html',
    lang: 'HTML',
    content: `<!DOCTYPE html>\n<html>\n<head><title>User Profile</title></head>\n<body>\n  <div class="card">\n    <h2>User Profile</h2>\n    <p>Role: Full Stack Developer</p>\n  </div>\n</body>\n</html>`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `html_6_${Date.now()}`,
    name: 'gallery.html',
    lang: 'HTML',
    content: `<!DOCTYPE html>\n<html>\n<head><title>Gallery</title></head>\n<body>\n  <div class="card">\n    <h2>Responsive Gallery</h2>\n    <p>Visual assets and responsive grid.</p>\n  </div>\n</body>\n</html>`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `html_7_${Date.now()}`,
    name: 'contact.html',
    lang: 'HTML',
    content: `<!DOCTYPE html>\n<html>\n<head><title>Contact</title></head>\n<body>\n  <div class="card">\n    <h2>Contact Support</h2>\n    <p>Reach out anytime: support@example.com</p>\n  </div>\n</body>\n</html>`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `html_8_${Date.now()}`,
    name: 'settings.html',
    lang: 'HTML',
    content: `<!DOCTYPE html>\n<html>\n<head><title>Settings</title></head>\n<body>\n  <div class="card">\n    <h2>Preferences</h2>\n    <p>Notifications, Theme and Security settings.</p>\n  </div>\n</body>\n</html>`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `html_9_${Date.now()}`,
    name: 'login.html',
    lang: 'HTML',
    content: `<!DOCTYPE html>\n<html>\n<head><title>Sign In</title></head>\n<body>\n  <div class="card">\n    <h2>Sign In</h2>\n    <p>Secure authentication portal.</p>\n  </div>\n</body>\n</html>`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `html_10_${Date.now()}`,
    name: 'store.html',
    lang: 'HTML',
    content: `<!DOCTYPE html>\n<html>\n<head><title>Catalog</title></head>\n<body>\n  <div class="card">\n    <h2>Store Catalog</h2>\n    <p>Items and plugins ready to install.</p>\n  </div>\n</body>\n</html>`,
    createdAt: 'Default',
    isOriginal: true,
  },

  // 4. CSS CATEGORY (10 files)
  {
    id: `css_1_${Date.now()}`,
    name: 'style.css',
    lang: 'CSS',
    content: `/* Global Stylesheet for ${projName} */\nbody {\n  font-family: system-ui, sans-serif;\n  background: #0b0d17;\n  color: #f8fafc;\n  margin: 0;\n  padding: 16px;\n}\n.card {\n  background: #151828;\n  border: 1px solid #232942;\n  border-radius: 14px;\n  padding: 24px;\n  text-align: center;\n}\n.btn {\n  background: #007AFF;\n  color: #fff;\n  border: none;\n  padding: 10px 20px;\n  border-radius: 8px;\n  cursor: pointer;\n}`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `css_2_${Date.now()}`,
    name: 'layout.css',
    lang: 'CSS',
    content: `/* Flexbox & Responsive Layout */\n.container { max-width: 900px; margin: 0 auto; padding: 16px; }\n.row { display: flex; gap: 16px; flex-wrap: wrap; }\n.col { flex: 1; min-width: 250px; }`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `css_3_${Date.now()}`,
    name: 'theme.css',
    lang: 'CSS',
    content: `/* Theme Palette */\n:root {\n  --accent: #007AFF;\n  --surface: #131524;\n  --border: #22263d;\n  --text-muted: #94a3b8;\n}`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `css_4_${Date.now()}`,
    name: 'animations.css',
    lang: 'CSS',
    content: `@keyframes fadeIn {\n  from { opacity: 0; transform: translateY(8px); }\n  to { opacity: 1; transform: translateY(0); }\n}\n.fade-in { animation: fadeIn 0.3s ease-out; }`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `css_5_${Date.now()}`,
    name: 'components.css',
    lang: 'CSS',
    content: `.badge-pill { padding: 3px 8px; border-radius: 20px; font-size: 11px; font-weight: 700; }\n.avatar-circle { width: 40px; height: 40px; border-radius: 50%; }`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `css_6_${Date.now()}`,
    name: 'navbar.css',
    lang: 'CSS',
    content: `.app-navbar {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 12px 20px;\n  background: #0e101c;\n  border-bottom: 1px solid #1f2338;\n}`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `css_7_${Date.now()}`,
    name: 'buttons.css',
    lang: 'CSS',
    content: `.btn-primary { background: linear-gradient(135deg, #0284c7, #007AFF); color: #fff; border: none; font-weight: 700; }\n.btn-secondary { background: #1c2033; color: #cbd5e1; border: 1px solid #2f3754; }`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `css_8_${Date.now()}`,
    name: 'typography.css',
    lang: 'CSS',
    content: `h1, h2, h3, h4 { color: #ffffff; letter-spacing: -0.3px; }\np { line-height: 1.6; color: #94a3b8; }`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `css_9_${Date.now()}`,
    name: 'forms.css',
    lang: 'CSS',
    content: `input, select, textarea {\n  background: #181b2c;\n  border: 1px solid #2b324e;\n  color: #fff;\n  border-radius: 8px;\n  padding: 8px 12px;\n}`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `css_10_${Date.now()}`,
    name: 'responsive.css',
    lang: 'CSS',
    content: `@media (max-width: 600px) {\n  .card { padding: 16px; }\n  .row { flex-direction: column; }\n}`,
    createdAt: 'Default',
    isOriginal: true,
  },

  // 5. JAVASCRIPT CATEGORY (10 files)
  {
    id: `js_1_${Date.now()}`,
    name: 'Main.js',
    lang: 'JS',
    content: `// Main.js - Interactive client logic for ${projName}\nconsole.log("Main script initialized successfully.");\n\nfunction handleMainAction() {\n  console.log("Main action triggered in ${projName}");\n  alert("Main.js is executing!");\n}\n\nwindow.addEventListener("DOMContentLoaded", () => {\n  console.log("App ready!");\n});`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `js_2_${Date.now()}`,
    name: 'App.js',
    lang: 'JS',
    content: `// App.js - Application bootstrap\nexport class Application {\n  constructor(name) {\n    this.name = name;\n  }\n  start() {\n    console.log("Application started: " + this.name);\n  }\n}\nconst app = new Application("${projName}");\napp.start();`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `js_3_${Date.now()}`,
    name: 'Router.js',
    lang: 'JS',
    content: `// Router.js - Client side navigation\nconst routes = {\n  home: () => console.log("Navigated to Home"),\n  settings: () => console.log("Navigated to Settings")\n};\nexport function navigate(route) {\n  if (routes[route]) routes[route]();\n}`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `js_4_${Date.now()}`,
    name: 'Api.js',
    lang: 'JS',
    content: `// Api.js - Network and fetch helpers\nexport async function request(endpoint, options = {}) {\n  console.log("API request dispatched to " + endpoint);\n  return { success: true, timestamp: Date.now() };\n}`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `js_5_${Date.now()}`,
    name: 'Store.js',
    lang: 'JS',
    content: `// Store.js - Reactive state management\nexport const state = {\n  user: { name: "Developer", role: "Admin" },\n  theme: "dark"\n};\nexport function getState() { return state; }`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `js_6_${Date.now()}`,
    name: 'Utils.js',
    lang: 'JS',
    content: `// Utils.js - General utility helpers\nexport function formatDate(date) {\n  return new Intl.DateTimeFormat("en-US").format(date);\n}\nexport function debounce(fn, ms) {\n  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };\n}`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `js_7_${Date.now()}`,
    name: 'Events.js',
    lang: 'JS',
    content: `// Events.js - Event bus system\nclass EventBus {\n  constructor() { this.listeners = {}; }\n  on(event, cb) { (this.listeners[event] ||= []).push(cb); }\n  emit(event, data) { (this.listeners[event] || []).forEach(cb => cb(data)); }\n}\nexport const eventBus = new EventBus();`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `js_8_${Date.now()}`,
    name: 'Animations.js',
    lang: 'JS',
    content: `// Animations.js - UI transitions and motion\nexport function pulse(elem) {\n  elem.style.transform = "scale(1.05)";\n  setTimeout(() => elem.style.transform = "scale(1)", 200);\n}`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `js_9_${Date.now()}`,
    name: 'Storage.js',
    lang: 'JS',
    content: `// Storage.js - Local storage abstraction\nexport const storage = {\n  get: (k) => JSON.parse(localStorage.getItem(k) || "null"),\n  set: (k, v) => localStorage.setItem(k, JSON.stringify(v))\n};`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `js_10_${Date.now()}`,
    name: 'Config.js',
    lang: 'JS',
    content: `// Config.js - Project configurations\nexport const APP_CONFIG = {\n  name: "${projName}",\n  version: "1.0.0",\n  env: "development"\n};`,
    createdAt: 'Default',
    isOriginal: true,
  },

  // 6. BUILD GRADLE CATEGORY (বুল গার্ডেন) (10 files)
  {
    id: `gradle_1_${Date.now()}`,
    name: 'build.gradle',
    lang: 'Gradle',
    content: `// Top-level build file for ${projName}\nbuildscript {\n    repositories {\n        google()\n        mavenCentral()\n    }\n    dependencies {\n        classpath 'com.android.tools.build:gradle:8.2.2'\n        classpath 'org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.22'\n    }\n}\n\nallprojects {\n    repositories {\n        google()\n        mavenCentral()\n    }\n}`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `gradle_2_${Date.now()}`,
    name: 'app/build.gradle',
    lang: 'Gradle',
    content: `plugins {\n    id 'com.android.application'\n    id 'org.jetbrains.kotlin.android'\n}\n\nandroid {\n    namespace 'com.example.${projName.toLowerCase().replace(/[^a-z0-9]/g, '')}'\n    compileSdk 34\n\n    defaultConfig {\n        applicationId "com.example.${projName.toLowerCase().replace(/[^a-z0-9]/g, '')}"\n        minSdk 24\n        targetSdk 34\n        versionCode 1\n        versionName "1.0"\n    }\n}\n\ndependencies {\n    implementation 'androidx.core:core-ktx:1.12.0'\n    implementation 'androidx.appcompat:appcompat:1.6.1'\n}`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `gradle_3_${Date.now()}`,
    name: 'settings.gradle',
    lang: 'Gradle',
    content: `pluginManagement {\n    repositories {\n        google()\n        mavenCentral()\n        gradlePluginPortal()\n    }\n}\nrootProject.name = "${projName}"\ninclude ':app'`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `gradle_4_${Date.now()}`,
    name: 'gradle.properties',
    lang: 'Gradle',
    content: `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8\nandroid.useAndroidX=true\nandroid.enableJetifier=true\nkotlin.code.style=official`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `gradle_5_${Date.now()}`,
    name: 'dependencies.gradle',
    lang: 'Gradle',
    content: `ext {\n    appcompatVersion = '1.6.1'\n    materialVersion = '1.11.0'\n    coroutineVersion = '1.7.3'\n}`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `gradle_6_${Date.now()}`,
    name: 'proguard-rules.pro',
    lang: 'Gradle',
    content: `# ProGuard optimization and obfuscation rules\n-keepattributes SourceFile,LineNumberTable\n-keep public class * extends android.app.Activity`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `gradle_7_${Date.now()}`,
    name: 'manifest-config.gradle',
    lang: 'Gradle',
    content: `// Manifest configuration overlays\nandroid.defaultConfig {\n    manifestPlaceholders = [hostName: "example.com"]\n}`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `gradle_8_${Date.now()}`,
    name: 'signing.gradle',
    lang: 'Gradle',
    content: `// Keystore release signing configuration\nandroid.signingConfigs {\n    release {\n        storeFile file("keystore.jks")\n        storePassword "android"\n        keyAlias "mykey"\n        keyPassword "android"\n    }\n}`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `gradle_9_${Date.now()}`,
    name: 'plugins.gradle',
    lang: 'Gradle',
    content: `// Custom gradle plugin extensions\ntasks.register("cleanProject", Delete) {\n    delete rootProject.buildDir\n}`,
    createdAt: 'Default',
    isOriginal: true,
  },
  {
    id: `gradle_10_${Date.now()}`,
    name: 'version-catalog.gradle',
    lang: 'Gradle',
    content: `// Version catalog mapping for ${projName}\n[versions]\nagp = "8.2.2"\nkotlin = "1.9.22"\ncoreKtx = "1.12.0"`,
    createdAt: 'Default',
    isOriginal: true,
  },
  ];

  const ktFeatures = ['AuthController', 'ProfileScreen', 'SettingsViewModel', 'NotificationWorker', 'PaymentManager', 'AnalyticsTracker', 'BluetoothScanner', 'CameraPreview', 'AudioRecorder', 'LocationService'];
  const javaFeatures = ['AuthService', 'ProfileActivity', 'SettingsManager', 'NotificationHelper', 'BillingClient', 'AnalyticsLogger', 'SensorController', 'FileExporter', 'CacheProvider', 'SyncWorker'];
  const htmlPages = ['checkout', 'notifications', 'analytics', 'messages', 'calendar', 'tasks', 'friends', 'billing', 'help', 'onboarding'];
  const cssModules = ['cards', 'modals', 'tables', 'badges', 'alerts', 'sidebar', 'footer', 'grid', 'utilities', 'darkmode'];
  const jsModules = ['Auth', 'Validator', 'Analytics', 'Notifications', 'ThemeController', 'FormHandler', 'DataGrid', 'ChartHelper', 'SearchEngine', 'SyncManager'];
  const gradleModules = ['quality', 'jacoco', 'detekt', 'ktlint', 'flavors', 'benchmark', 'packaging', 'publishing', 'lint-rules', 'ci-pipeline'];

  // Add files 11..100 for each category so every category supports scaling from 10 up to 100 files
  for (let i = 11; i <= 100; i++) {
    const labelIdx = (i - 1) % 10;
    baseFiles.push({
      id: `kt_${i}_default`,
      name: `${ktFeatures[labelIdx]}_${i}.kt`,
      lang: 'Kotlin',
      content: `package com.example.${projName.toLowerCase().replace(/[^a-z0-9]/g, '')}.modules\n\nimport android.util.Log\n\nclass ${ktFeatures[labelIdx]}_${i} {\n    fun executeModule(): String {\n        Log.d("KotlinModule", "Executing ${ktFeatures[labelIdx]} #${i} in ${projName}")\n        return "${ktFeatures[labelIdx]} #${i} Active"\n    }\n}\n`,
      createdAt: 'Default',
      isOriginal: true,
    });
  }

  for (let i = 11; i <= 100; i++) {
    const labelIdx = (i - 1) % 10;
    baseFiles.push({
      id: `java_${i}_default`,
      name: `${javaFeatures[labelIdx]}_${i}.java`,
      lang: 'Java',
      content: `package com.example.${projName.toLowerCase().replace(/[^a-z0-9]/g, '')}.services;\n\npublic class ${javaFeatures[labelIdx]}_${i} {\n    public static String runService() {\n        System.out.println("Running ${javaFeatures[labelIdx]} #${i} in ${projName}");\n        return "${javaFeatures[labelIdx]} #${i} Ready";\n    }\n}\n`,
      createdAt: 'Default',
      isOriginal: true,
    });
  }

  for (let i = 11; i <= 100; i++) {
    const labelIdx = (i - 1) % 10;
    baseFiles.push({
      id: `html_${i}_default`,
      name: `${htmlPages[labelIdx]}_${i}.html`,
      lang: 'HTML',
      content: `<!DOCTYPE html>\n<html>\n<head><title>${projName} - ${htmlPages[labelIdx]} #${i}</title></head>\n<body>\n  <div class="card">\n    <h2>${htmlPages[labelIdx].toUpperCase()} MODULE #${i}</h2>\n    <p>Interactive HTML template #${i} inside ${projName}.</p>\n  </div>\n</body>\n</html>\n`,
      createdAt: 'Default',
      isOriginal: true,
    });
  }

  for (let i = 11; i <= 100; i++) {
    const labelIdx = (i - 1) % 10;
    baseFiles.push({
      id: `css_${i}_default`,
      name: `${cssModules[labelIdx]}_${i}.css`,
      lang: 'CSS',
      content: `/* ${cssModules[labelIdx]}_${i}.css - Stylesheet Module #${i} for ${projName} */\n.module-${i} {\n  padding: 16px;\n  border-radius: 12px;\n  background: #141726;\n  border: 1px solid #252b42;\n}\n`,
      createdAt: 'Default',
      isOriginal: true,
    });
  }

  for (let i = 11; i <= 100; i++) {
    const labelIdx = (i - 1) % 10;
    baseFiles.push({
      id: `js_${i}_default`,
      name: `${jsModules[labelIdx]}_${i}.js`,
      lang: 'JS',
      content: `// ${jsModules[labelIdx]}_${i}.js - JavaScript Module #${i} for ${projName}\nexport function init${jsModules[labelIdx]}${i}() {\n  console.log("${jsModules[labelIdx]}_${i} initialized in ${projName}");\n  return true;\n}\n`,
      createdAt: 'Default',
      isOriginal: true,
    });
  }

  for (let i = 11; i <= 100; i++) {
    const labelIdx = (i - 1) % 10;
    baseFiles.push({
      id: `gradle_${i}_default`,
      name: `${gradleModules[labelIdx]}-${i}.gradle`,
      lang: 'Gradle',
      content: `// ${gradleModules[labelIdx]}-${i}.gradle - Build Script Module #${i} for ${projName}\ntasks.register("runTask${i}") {\n    group = "verification"\n    description = "Executes ${gradleModules[labelIdx]} build task #${i}"\n    doLast {\n        println("Running ${gradleModules[labelIdx]} task #${i} for ${projName}")\n    }\n}\n`,
      createdAt: 'Default',
      isOriginal: true,
    });
  }

  return baseFiles;
};

export const STARTER_TEMPLATES_CATALOG = [
  {
    idx: 0,
    title: '1. Welcome & Starter',
    defaultName: 'My_Welcome',
    icon: 'fa-hand-peace',
    color: '#0ea5e9',
    desc: 'Introductory card with button action & animation'
  },
  {
    idx: 1,
    title: '2. Theme Mood Card',
    defaultName: 'My_ThemeMood',
    icon: 'fa-wand-magic-sparkles',
    color: '#10b981',
    desc: 'Interactive color theme switcher & dynamic mood card'
  },
  {
    idx: 2,
    title: '3. Interactive Todo List',
    defaultName: 'My_TodoList',
    icon: 'fa-list-check',
    color: '#f59e0b',
    desc: 'Task manager with add, mark completed & delete'
  },
  {
    idx: 3,
    title: '4. Digital Neon Clock',
    defaultName: 'My_DigitalClock',
    icon: 'fa-clock',
    color: '#06b6d4',
    desc: 'Real-time clock with date, glowing neon styling & seconds'
  },
  {
    idx: 4,
    title: '5. Modern Calculator',
    defaultName: 'My_Calculator',
    icon: 'fa-calculator',
    color: '#8b5cf6',
    desc: 'Responsive arithmetic calculator with keypad & display'
  },
  {
    idx: 5,
    title: '6. Color Palette Generator',
    defaultName: 'My_ColorPalette',
    icon: 'fa-palette',
    color: '#ec4899',
    desc: 'Random hex color swatches with one-click copy to clipboard'
  },
  {
    idx: 6,
    title: '7. Interactive Quiz App',
    defaultName: 'My_QuizApp',
    icon: 'fa-circle-question',
    color: '#14b8a6',
    desc: 'Multiple-choice questions with score tally and restart'
  },
  {
    idx: 7,
    title: '8. Notes Scratchpad',
    defaultName: 'My_NotesScratchpad',
    icon: 'fa-note-sticky',
    color: '#eab308',
    desc: 'Auto-saving notes scratchpad with character & word count'
  },
  {
    idx: 8,
    title: '9. Weather Forecast Card',
    defaultName: 'My_WeatherCard',
    icon: 'fa-cloud-sun',
    color: '#38bdf8',
    desc: 'Weather widget with city toggle, temperature & humidity'
  },
  {
    idx: 9,
    title: '10. Touch Drawing Canvas',
    defaultName: 'My_DrawingCanvas',
    icon: 'fa-paintbrush',
    color: '#f43f5e',
    desc: 'Freehand touch/mouse drawing canvas with color picker & clear'
  },
  {
    idx: -1,
    title: 'Blank Custom Project',
    defaultName: 'My_CustomApp',
    icon: 'fa-file-code',
    color: '#94a3b8',
    desc: 'Start with a clean slate for custom HTML/CSS/JS code'
  }
];

const generateKotlinSample = (name: string) => `package com.codestudio.practice

import android.os.Bundle
import android.widget.TextView
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val titleView = findViewById<TextView>(R.id.titleText)
        val actionBtn = findViewById<Button>(R.id.actionButton)

        titleView.text = "Practice: ${name.replace('.html', '')}"

        actionBtn.setOnClickListener {
            Toast.makeText(this, "Running ${name} in Kotlin!", Toast.LENGTH_SHORT).show()
        }
    }
}
`;

const generateJavaSample = (name: string) => `package com.codestudio.practice;

import android.os.Bundle;
import android.widget.TextView;
import android.widget.Button;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        TextView titleView = findViewById(R.id.titleText);
        Button actionBtn = findViewById(R.id.actionButton);

        titleView.setText("Practice: ${name.replace('.html', '')}");

        actionBtn.setOnClickListener(v -> {
            Toast.makeText(MainActivity.this, "Running ${name} in Java!", Toast.LENGTH_SHORT).show();
        });
    }
}
`;

interface PracticeScreenProps {
  activePlatform: 'android' | 'flutter';
  initialMode?: string;
  onBackToDashboard: () => void;
  onOpenInMainIde: (code: string, fileName: string) => void;
}

export const PracticeScreen: React.FC<PracticeScreenProps> = ({
  activePlatform,
  initialMode,
  onBackToDashboard,
  onOpenInMainIde,
}) => {
  // Top 4 Tabs: Projects | Tutorials | Search | Blocks | AI
  const [activeTab, setActiveTab] = useState<'projects' | 'tutorials' | 'search' | 'blocks' | 'ai'>('projects');

  // Search query for Search tab
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilterType, setSearchFilterType] = useState<'all' | 'projects' | 'tutorials'>('all');

  // Top header 3-dots dropdown menu state
  const [isTopMenuOpen, setIsTopMenuOpen] = useState(false);
  const [isDesktopPreview, setIsDesktopPreview] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Quick Backup all projects as JSON file
  const handleBackupProjectsJSON = async () => {
    try {
      await triggerReliableDownload({
        textData: JSON.stringify(projects, null, 2),
        fileName: `android_projects_backup_${Date.now()}.json`,
        contentType: 'application/json;charset=utf-8',
      });
      showToast('Downloaded all projects JSON backup!');
    } catch {
      showToast('Backup failed');
    }
  };

  // Restore projects from JSON file
  const handleRestoreProjectsJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProjects(parsed);
            showToast(`Restored ${parsed.length} projects from backup!`);
          } else {
            showToast('Invalid backup file format');
          }
        } catch {
          showToast('Failed to parse JSON file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // One-time automatic clean-slate key for user-requested reset of old test/created clutter
  const CLEAN_SLATE_KEY = 'code_studio_slate_cleaned_v8';

  // Projects list state (100 diverse projects stored in localStorage)
  const [projects, setProjects] = useState<ProjectItem[]>(() => {
    try {
      if (!localStorage.getItem(CLEAN_SLATE_KEY)) {
        localStorage.removeItem(`code_studio_projects_v5_${activePlatform}`);
        localStorage.removeItem(`code_studio_tutorials_v2_${activePlatform}`);
        localStorage.removeItem(`code_studio_blocks_v2_${activePlatform}`);
        localStorage.setItem(CLEAN_SLATE_KEY, 'true');
        return activePlatform === 'flutter' ? ALL_100_FLUTTER_PROJECTS : ALL_100_ANDROID_PROJECTS;
      }
      const saved = localStorage.getItem(`code_studio_projects_v5_${activePlatform}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return activePlatform === 'flutter' ? ALL_100_FLUTTER_PROJECTS : ALL_100_ANDROID_PROJECTS;
  });

  const prevPlatformRef = useRef(activePlatform);

  // Synchronize projects when activePlatform changes
  useEffect(() => {
    if (prevPlatformRef.current === activePlatform) return;
    prevPlatformRef.current = activePlatform;
    try {
      const saved = localStorage.getItem(`code_studio_projects_v5_${activePlatform}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setProjects(parsed);
          return;
        }
      }
    } catch {
      // ignore
    }
    setProjects(activePlatform === 'flutter' ? ALL_100_FLUTTER_PROJECTS : ALL_100_ANDROID_PROJECTS);
  }, [activePlatform]);

  // Save projects to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`code_studio_projects_v5_${activePlatform}`, JSON.stringify(projects));
    } catch {
      // ignore
    }
  }, [projects, activePlatform]);

  // Tutorials state (platform specific default tutorials + user created tutorials, 100 per category)
  const [tutorialsList, setTutorialsList] = useState<TutorialItem[]>(() => {
    try {
      if (!localStorage.getItem(CLEAN_SLATE_KEY)) {
        return DEFAULT_TUTORIALS;
      }
      const saved = localStorage.getItem(`code_studio_tutorials_v2_${activePlatform}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 1) {
          if (parsed.length < 500) {
            const customOnes = parsed.filter((t: TutorialItem) => !isOriginalTutorial(t));
            return [...customOnes, ...DEFAULT_TUTORIALS];
          }
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return activePlatform === 'flutter' ? DEFAULT_FLUTTER_TUTORIALS : DEFAULT_ANDROID_TUTORIALS;
  });

  const prevTutorialPlatformRef = useRef(activePlatform);
  useEffect(() => {
    if (prevTutorialPlatformRef.current === activePlatform) return;
    prevTutorialPlatformRef.current = activePlatform;
    try {
      const saved = localStorage.getItem(`code_studio_tutorials_v2_${activePlatform}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 1) {
          if (parsed.length < 500) {
            const customOnes = parsed.filter((t: TutorialItem) => !isOriginalTutorial(t));
            setTutorialsList([...customOnes, ...DEFAULT_TUTORIALS]);
            return;
          }
          setTutorialsList(parsed);
          return;
        }
      }
    } catch {
      // ignore
    }
    setTutorialsList(activePlatform === 'flutter' ? DEFAULT_FLUTTER_TUTORIALS : DEFAULT_ANDROID_TUTORIALS);
  }, [activePlatform]);

  useEffect(() => {
    try {
      localStorage.setItem(`code_studio_tutorials_v2_${activePlatform}`, JSON.stringify(tutorialsList));
    } catch {
      // ignore
    }
  }, [tutorialsList, activePlatform]);

  // Blocks state for Blocks tab (100 per category: ui, logic, style)
  const [blocksList, setBlocksList] = useState<BlockItem[]>(() => {
    try {
      if (!localStorage.getItem(CLEAN_SLATE_KEY)) {
        return DEFAULT_BLOCKS;
      }
      const saved = localStorage.getItem(`code_studio_blocks_v2_${activePlatform}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 1) {
          if (parsed.length < 300) {
            const customOnes = parsed.filter((b: BlockItem) => !isOriginalBlock(b));
            return [...customOnes, ...DEFAULT_BLOCKS];
          }
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return activePlatform === 'flutter' ? DEFAULT_FLUTTER_BLOCKS : DEFAULT_ANDROID_BLOCKS;
  });

  const prevBlockPlatformRef = useRef(activePlatform);
  useEffect(() => {
    if (prevBlockPlatformRef.current === activePlatform) return;
    prevBlockPlatformRef.current = activePlatform;
    try {
      const saved = localStorage.getItem(`code_studio_blocks_v2_${activePlatform}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 1) {
          if (parsed.length < 300) {
            const customOnes = parsed.filter((b: BlockItem) => !isOriginalBlock(b));
            setBlocksList([...customOnes, ...DEFAULT_BLOCKS]);
            return;
          }
          setBlocksList(parsed);
          return;
        }
      }
    } catch {
      // ignore
    }
    setBlocksList(activePlatform === 'flutter' ? DEFAULT_FLUTTER_BLOCKS : DEFAULT_ANDROID_BLOCKS);
  }, [activePlatform]);

  useEffect(() => {
    try {
      localStorage.setItem(`code_studio_blocks_v2_${activePlatform}`, JSON.stringify(blocksList));
    } catch {
      // ignore
    }
  }, [blocksList, activePlatform]);

  // Drag & drop state for visual blocks
  const [draggedBlockIndex, setDraggedBlockIndex] = useState<number | null>(null);
  const [dragOverBlockIndex, setDragOverBlockIndex] = useState<number | null>(null);

  // Pagination & category filter states (Tutorials and Layout default to specific category, never jumping across categories)
  const [projectPage, setProjectPage] = useState(0);
  const [tutorialPage, setTutorialPage] = useState(0);
  const [layoutPage, setLayoutPage] = useState(0);
  const [layoutCategoryFilter, setLayoutCategoryFilter] = useState<'all' | 'ui' | 'logic' | 'style'>('ui');
  const [projectSectorFilter, setProjectSectorFilter] = useState<'all' | 'Kotlin' | 'HTML' | 'Java' | 'Dart' | 'Swift'>('all');
  const [tutorialSectorFilter, setTutorialSectorFilter] = useState<'all' | 'HTML' | 'Kotlin' | 'Java' | 'Dart' | 'Swift'>('Kotlin');
  const [tutorialCategoryCounts, setTutorialCategoryCounts] = useState<Record<string, number>>({
    Kotlin: 10,
    Java: 10,
    HTML: 10,
    Dart: 10,
    Swift: 10,
  });
  const [layoutCategoryCounts, setLayoutCategoryCounts] = useState<Record<string, number>>({
    ui: 10,
    logic: 10,
    style: 10,
  });
  const [isProjectFolderOpen, setIsProjectFolderOpen] = useState<boolean>(false);
  const PROJECTS_PER_PAGE = 10;
  const TUTORIALS_PER_PAGE = 10;
  const LAYOUTS_PER_PAGE = 10;

  // Sector filtering for projects
  const filteredProjectsBySector = useMemo(() => {
    if (projectSectorFilter === 'all') return projects;
    return projects.filter(p => {
      if (projectSectorFilter === 'Kotlin') return p.lang === 'Kotlin' || p.name.endsWith('.kt');
      if (projectSectorFilter === 'HTML') return p.lang === 'HTML' || p.name.endsWith('.html');
      if (projectSectorFilter === 'Java') return p.lang === 'Java' || p.name.endsWith('.java');
      if (projectSectorFilter === 'Dart') return p.lang === 'Dart' || p.name.endsWith('.dart');
      if (projectSectorFilter === 'Swift') return p.lang === 'Swift' || p.name.endsWith('.swift');
      return true;
    });
  }, [projects, projectSectorFilter]);

  // Custom created projects first, then original templates
  const sortedProjects = useMemo(() => {
    return [...filteredProjectsBySector].sort((a, b) => {
      const aOrig = isOriginalProject(a);
      const bOrig = isOriginalProject(b);
      if (!aOrig && bOrig) return -1;
      if (aOrig && !bOrig) return 1;
      return 0;
    });
  }, [filteredProjectsBySector]);

  const totalProjectPages = Math.max(1, Math.ceil(sortedProjects.length / PROJECTS_PER_PAGE));
  const paginatedProjects = useMemo(() => {
    return sortedProjects.slice(
      projectPage * PROJECTS_PER_PAGE,
      (projectPage + 1) * PROJECTS_PER_PAGE
    );
  }, [sortedProjects, projectPage]);

  // Sector filtering for tutorials (always isolated to the selected tutorial category)
  const filteredTutorialsBySector = useMemo(() => {
    const activeSec = tutorialSectorFilter === 'all' ? 'Kotlin' : tutorialSectorFilter;
    return tutorialsList.filter(t => {
      if (activeSec === 'HTML') return t.lang === 'HTML' || !t.lang;
      if (activeSec === 'Kotlin') return t.lang === 'Kotlin';
      if (activeSec === 'Java') return t.lang === 'Java';
      if (activeSec === 'Dart') return t.lang === 'Dart';
      if (activeSec === 'Swift') return t.lang === 'Swift';
      return true;
    });
  }, [tutorialsList, tutorialSectorFilter]);

  // Sorted tutorials (custom first, then original, sliced from 10 up to 100 for the selected category)
  const sortedTutorials = useMemo(() => {
    return [...filteredTutorialsBySector].sort((a, b) => {
      const aOrig = isOriginalTutorial(a);
      const bOrig = isOriginalTutorial(b);
      if (!aOrig && bOrig) return -1;
      if (aOrig && !bOrig) return 1;
      return 0;
    });
  }, [filteredTutorialsBySector]);

  const activeTutorialCategoryKey = tutorialSectorFilter === 'all' ? 'Kotlin' : tutorialSectorFilter;
  const currentTutorialMax = tutorialCategoryCounts[activeTutorialCategoryKey] || 10;
  const totalTutorialPages = Math.max(1, Math.ceil(sortedTutorials.length / TUTORIALS_PER_PAGE));
  const paginatedTutorials = useMemo(() => {
    return sortedTutorials.slice(0, currentTutorialMax);
  }, [sortedTutorials, currentTutorialMax]);

  // Filtered and sorted blocks list (always isolated to the selected layout category: ui, logic, or style)
  const filteredBlocksList = useMemo(() => {
    const activeCat = layoutCategoryFilter === 'all' ? 'ui' : layoutCategoryFilter;
    return blocksList.filter((b) => (b.type === 'state' ? 'logic' : b.type) === activeCat);
  }, [blocksList, layoutCategoryFilter]);

  const sortedBlocksList = useMemo(() => {
    return [...filteredBlocksList].sort((a, b) => {
      const aOrig = isOriginalBlock(a);
      const bOrig = isOriginalBlock(b);
      if (!aOrig && bOrig) return -1;
      if (aOrig && !bOrig) return 1;
      return 0;
    });
  }, [filteredBlocksList]);

  const activeLayoutCategoryKey = layoutCategoryFilter === 'all' ? 'ui' : layoutCategoryFilter;
  const currentLayoutMax = layoutCategoryCounts[activeLayoutCategoryKey] || 10;
  const totalLayoutPages = Math.max(1, Math.ceil(sortedBlocksList.length / LAYOUTS_PER_PAGE));
  const paginatedBlocksList = useMemo(() => {
    return sortedBlocksList.slice(0, currentLayoutMax);
  }, [sortedBlocksList, currentLayoutMax]);

  const normalizeCustomProjectFiles = (files: CustomProjectFile[]): CustomProjectFile[] =>
    (files || []).map((f) =>
      f.createdAt === 'Default' ||
      f.id.endsWith('_default') ||
      /^(kt|java|html|css|js|gradle)_\d+_/.test(f.id)
        ? { ...f, isOriginal: true }
        : f
    );

  // Custom Projects State (Stored in localStorage, sleek project cards with 6 categories: Kotlin, Java, HTML, CSS, JS, Build Gradle, 100 files each)
  const [customProjects, setCustomProjects] = useState<CustomProject[]>(() => {
    try {
      const saved = localStorage.getItem('android_ide_custom_user_projects_v4') || localStorage.getItem('android_ide_custom_user_projects_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const normalized = parsed.map((p: CustomProject) => {
            const normFiles = normalizeCustomProjectFiles(p.files || []);
            const ktFiles = normFiles.filter(f => f.lang === 'Kotlin' || f.name.endsWith('.kt'));
            if (ktFiles.length < 100) {
              const defs = createDefaultProjectFiles(p.name || 'Welcome');
              const customFiles = normFiles.filter(f => !f.isOriginal);
              return { ...p, files: [...customFiles, ...defs] };
            }
            return { ...p, files: normFiles };
          });
          // Clean out accidental single-letter test projects (like t, u, y) if real projects exist
          const realProjs = normalized.filter((p: CustomProject) => (p.name || '').trim().length > 1);
          return realProjs.length > 0 ? realProjs : [normalized[0]];
        }
      }
      // Migrate from v2
      const oldSaved = localStorage.getItem('android_ide_custom_user_projects_v2');
      if (oldSaved) {
        const parsed = JSON.parse(oldSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: CustomProject) => {
            const normFiles = normalizeCustomProjectFiles(p.files || []);
            const defs = createDefaultProjectFiles(p.name || 'Welcome');
            const customFiles = normFiles.filter(f => !f.isOriginal);
            return { ...p, files: [...customFiles, ...defs] };
          });
        }
      }
    } catch {}
    const defaultProj: CustomProject = {
      id: 'custom_proj_welcome',
      name: 'Welcome',
      lang: 'Project',
      createdAt: 'Default',
      files: createDefaultProjectFiles('Welcome'),
    };
    return [defaultProj];
  });

  useEffect(() => {
    try {
      localStorage.setItem('android_ide_custom_user_projects_v4', JSON.stringify(customProjects));
    } catch {}
  }, [customProjects]);

  const [activeCustomProjectId, setActiveCustomProjectId] = useState<string>(() => {
    try {
      const savedActiveId = localStorage.getItem('android_ide_active_custom_project_id');
      if (savedActiveId && customProjects.some((cp) => cp.id === savedActiveId)) {
        return savedActiveId;
      }
    } catch {}
    return customProjects[0]?.id || 'custom_proj_welcome';
  });

  useEffect(() => {
    try {
      if (activeCustomProjectId) {
        localStorage.setItem('android_ide_active_custom_project_id', activeCustomProjectId);
      }
    } catch {}
  }, [activeCustomProjectId]);

  const [activeCustomFileContext, setActiveCustomFileContext] = useState<{
    projectId: string;
    fileId: string;
  } | null>(null);

  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{
    type: 'project' | 'file' | 'practice_file' | 'tutorial' | 'block';
    id: string;
    parentId?: string;
    name: string;
  } | null>(null);

  // Active Category Tab inside Custom Project: Kotlin | Java | HTML | CSS | JS | Gradle (বুল গার্ডেন)
  const [projectFileCategory, setProjectFileCategory] = useState<'Kotlin' | 'Java' | 'HTML' | 'CSS' | 'JS' | 'Gradle'>('Kotlin');
  const [projectFilePage, setProjectFilePage] = useState<number>(0);
  const [projectFileLimit, setProjectFileLimit] = useState<number>(10);
  // Per-project, per-category adjustable file count (starts at 10, can be increased +10 up to 100 or decreased -10 back down to 10)
  const [projectCategoryCountsMap, setProjectCategoryCountsMap] = useState<Record<string, Record<string, number>>>({});
  const getCategoryCountsForProject = (projId: string): Record<string, number> => {
    return (
      projectCategoryCountsMap[projId] || {
        Kotlin: 10,
        Java: 10,
        HTML: 10,
        CSS: 10,
        JS: 10,
        Gradle: 10,
      }
    );
  };

  // Selected project action sheet menu (3-dots on project header)
  const [selectedProjectActionMenu, setSelectedProjectActionMenu] = useState<CustomProject | null>(null);

  // Selected custom project file action sheet menu (3-dots on a file row)
  const [selectedCustomFileAction, setSelectedCustomFileAction] = useState<{ project: CustomProject; file: CustomProjectFile } | null>(null);

  // Modals state
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [newProjectNameInput, setNewProjectNameInput] = useState('');
  const [newProjectLangChoice, setNewProjectLangChoice] = useState<'Kotlin' | 'Java' | 'HTML' | 'Flutter' | 'Swift'>('Kotlin');

  // File creation inside a project
  const [isCreateFileInProjModalOpen, setIsCreateFileInProjModalOpen] = useState(false);
  const [targetProjectForFile, setTargetProjectForFile] = useState<CustomProject | null>(null);
  const [newFileInProjName, setNewFileInProjName] = useState('');
  const [newFileInProjLang, setNewFileInProjLang] = useState<'Kotlin' | 'Java' | 'HTML' | 'CSS' | 'JS' | 'Gradle' | 'Dart' | 'Swift'>('Kotlin');

  const [isCreateTutorialModalOpen, setIsCreateTutorialModalOpen] = useState(false);
  const [newTutorialTitleInput, setNewTutorialTitleInput] = useState('');
  const [newTutorialDescInput, setNewTutorialDescInput] = useState('');
  const [newTutorialIcon, setNewTutorialIcon] = useState('fa-cube');
  const [newTutorialLangInput, setNewTutorialLangInput] = useState<'Kotlin' | 'Java' | 'HTML' | 'Dart' | 'Swift'>('Kotlin');

  const [isCreateBlockModalOpen, setIsCreateBlockModalOpen] = useState(false);
  const [newBlockNameInput, setNewBlockNameInput] = useState('');
  const [newBlockTypeInput, setNewBlockTypeInput] = useState<'ui' | 'state' | 'logic' | 'style'>('ui');
  const [newBlockSummaryInput, setNewBlockSummaryInput] = useState('');

  // 3-dots Context Menus for Project, Tutorial, and Block
  const [contextProject, setContextProject] = useState<ProjectItem | null>(null);
  const [contextTutorial, setContextTutorial] = useState<TutorialItem | null>(null);
  const [contextBlock, setContextBlock] = useState<BlockItem | null>(null);

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameInput, setRenameInput] = useState('');

  // Editor mode state
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);
  const [openedProjectName, setOpenedProjectName] = useState<string>('Welcome');
  const [selectedBarFileId, setSelectedBarFileId] = useState<string | null>(null);
  const [isEditorFileSelected, setIsEditorFileSelected] = useState<boolean>(false);
  const [editorSubTab, setEditorSubTab] = useState<'HTML' | 'Kotlin' | 'Java' | 'Flutter' | 'Swift'>('HTML');
  const [activeHtml, setActiveHtml] = useState('');
  const [activeCss, setActiveCss] = useState('');
  const [activeJs, setActiveJs] = useState('');
  const [activeKotlin, setActiveKotlin] = useState('');
  const [activeJava, setActiveJava] = useState('');
  const [activeFlutter, setActiveFlutter] = useState('');
  const [activeSwift, setActiveSwift] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [livePreviewContent, setLivePreviewContent] = useState('');
  const [previewAppName, setPreviewAppName] = useState('');
  const [previewAppLogoUrl, setPreviewAppLogoUrl] = useState('');
  const [isPreviewMenuOpen, setIsPreviewMenuOpen] = useState(false);

  // Textarea ref for caret navigation
  const editorTextareaRef = useRef<HTMLTextAreaElement>(null);
  const activeFileChipRef = useRef<HTMLButtonElement | null>(null);

  // Two-Row Symbol Bar & Tab Spacing State (Shared with EditorScreen)
  const [row1Symbols, setRow1Symbols] = useState<string[]>(() => {
    try {
      const saved1 = localStorage.getItem('android_ide_symbols_v12_row1');
      const saved2 = localStorage.getItem('android_ide_symbols_v12_row2');
      if (saved1 && saved2) {
        const p1 = JSON.parse(saved1);
        const p2 = JSON.parse(saved2);
        if (Array.isArray(p1) && Array.isArray(p2) && p1.length === DEFAULT_ROW1_SYMBOLS.length) {
          const [aligned1] = alignSymbolPairs(p1, p2);
          return aligned1;
        }
      }
    } catch {}
    const [def1] = alignSymbolPairs(DEFAULT_ROW1_SYMBOLS, DEFAULT_ROW2_SYMBOLS);
    return def1;
  });

  const [row2Symbols, setRow2Symbols] = useState<string[]>(() => {
    try {
      const saved1 = localStorage.getItem('android_ide_symbols_v12_row1');
      const saved2 = localStorage.getItem('android_ide_symbols_v12_row2');
      if (saved1 && saved2) {
        const p1 = JSON.parse(saved1);
        const p2 = JSON.parse(saved2);
        if (Array.isArray(p1) && Array.isArray(p2) && p2.length === DEFAULT_ROW2_SYMBOLS.length) {
          const [, aligned2] = alignSymbolPairs(p1, p2);
          return aligned2;
        }
      }
    } catch {}
    const [, def2] = alignSymbolPairs(DEFAULT_ROW1_SYMBOLS, DEFAULT_ROW2_SYMBOLS);
    return def2;
  });

  const resetSymbolsToDefault = () => {
    const [def1, def2] = alignSymbolPairs(DEFAULT_ROW1_SYMBOLS, DEFAULT_ROW2_SYMBOLS);
    setRow1Symbols([...def1]);
    setRow2Symbols([...def2]);
    try {
      localStorage.setItem('android_ide_symbols_v12_row1', JSON.stringify(def1));
      localStorage.setItem('android_ide_symbols_v12_row2', JSON.stringify(def2));
    } catch {}
    showToast('Coding symbols restored to default alignment!');
  };

  const [tabSpaces, setTabSpaces] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('android_ide_tab_spaces');
      if (saved) {
        const val = parseInt(saved, 10);
        if (val >= 1 && val <= 8) return val;
      }
    } catch {}
    return 2;
  });

  // Undo / Redo stacks
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const isUndoRedoActiveRef = useRef(false);

  // Tab hold timer & countdown
  const [isTabConfigOpen, setIsTabConfigOpen] = useState(false);
  const [tabInputVal, setTabInputVal] = useState('2');

  // AI Code Assistant & Generator Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiModalTab, setAiModalTab] = useState<'chat' | 'debug' | 'generate'>('chat');
  const [aiModalPrompt, setAiModalPrompt] = useState('');

  // Full-Screen AI Command Box State (inside AI tab)
  const [isAiBoxMenuOpen, setIsAiBoxMenuOpen] = useState(false);
  const [isAiAttachMenuOpen, setIsAiAttachMenuOpen] = useState(false);
  const [aiBoxMode, setAiBoxMode] = useState<'chat' | 'generate' | 'debug'>('chat');
  const [aiBoxTargetLang, setAiBoxTargetLang] = useState<AiTargetPlatformId>('html');
  const [aiBoxCommandInput, setAiBoxCommandInput] = useState('');
  const [isAiBoxLoading, setIsAiBoxLoading] = useState(false);
  const [aiBoxChatHistory, setAiBoxChatHistory] = useState<Array<{ role: 'user' | 'model'; text: string }>>([]);

  // Unique Voice / Microphone State with Dynamic Equalizer and Floating Voice Capsule
  const [isAiMicListening, setIsAiMicListening] = useState(false);
  const [isAiMicTranscribing, setIsAiMicTranscribing] = useState(false);
  const [aiMicVoiceLevel, setAiMicVoiceLevel] = useState<number>(18);
  const [aiVoiceBars, setAiVoiceBars] = useState<number[]>([10, 16, 24, 30, 22, 14, 8]);
  const [aiRecordingSeconds, setAiRecordingSeconds] = useState<number>(0);
  const [aiLiveSpeechText, setAiLiveSpeechText] = useState<string>('');
  const [aiVoiceStatusMsg, setAiVoiceStatusMsg] = useState<string>('');

  const aiSpeechRecRef = useRef<any>(null);
  const aiAudioCtxRef = useRef<AudioContext | null>(null);
  const aiMediaStreamRef = useRef<MediaStream | null>(null);
  const aiMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const aiAudioChunksRef = useRef<Blob[]>([]);
  const aiLevelTimerRef = useRef<any>(null);
  const aiRecSecTimerRef = useRef<any>(null);
  const aiLiveTranscribeTimerRef = useRef<any>(null);
  const aiIsTranscribingLiveRef = useRef<boolean>(false);
  const aiHasSpokenRef = useRef<boolean>(false);
  const aiLastTranscribedChunkCountRef = useRef<number>(0);
  const aiAccumulatedSpeechRef = useRef<string>('');
  const isAiMicListeningRef = useRef<boolean>(false);
  const aiCapturedTextRef = useRef<string>('');

  const formatAiVoiceTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const blobToDataUrl = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result || ''));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const stopAiVoiceRecording = (shouldApply: boolean = true) => {
    isAiMicListeningRef.current = false;
    setIsAiMicListening(false);
    setAiMicVoiceLevel(15);
    setAiVoiceBars([10, 16, 24, 30, 22, 14, 8]);

    if (aiRecSecTimerRef.current) {
      clearInterval(aiRecSecTimerRef.current);
      aiRecSecTimerRef.current = null;
    }
    if (aiLevelTimerRef.current) {
      clearInterval(aiLevelTimerRef.current);
      aiLevelTimerRef.current = null;
    }
    if (aiLiveTranscribeTimerRef.current) {
      clearInterval(aiLiveTranscribeTimerRef.current);
      aiLiveTranscribeTimerRef.current = null;
    }
    if (aiSpeechRecRef.current) {
      try {
        aiSpeechRecRef.current.onend = null;
        aiSpeechRecRef.current.stop();
      } catch {}
      aiSpeechRecRef.current = null;
    }

    if (!shouldApply) {
      if (aiMediaStreamRef.current) {
        try {
          aiMediaStreamRef.current.getTracks().forEach((t) => t.stop());
        } catch {}
        aiMediaStreamRef.current = null;
      }
      if (aiAudioCtxRef.current) {
        try {
          aiAudioCtxRef.current.close();
        } catch {}
        aiAudioCtxRef.current = null;
      }
      aiMediaRecorderRef.current = null;
      setAiLiveSpeechText('');
      setAiVoiceStatusMsg('ভয়েস বাতিল করা হয়েছে');
      setTimeout(() => setAiVoiceStatusMsg(''), 2200);
      return;
    }

    if (aiMediaRecorderRef.current && aiMediaRecorderRef.current.state !== 'inactive') {
      try {
        aiMediaRecorderRef.current.stop();
      } catch {}
    } else {
      if (aiMediaStreamRef.current) {
        try {
          aiMediaStreamRef.current.getTracks().forEach((t) => t.stop());
        } catch {}
        aiMediaStreamRef.current = null;
      }
      if (aiAudioCtxRef.current) {
        try {
          aiAudioCtxRef.current.close();
        } catch {}
        aiAudioCtxRef.current = null;
      }
    }
  };

  const toggleAiVoiceRecording = async () => {
    if (isAiMicListening) {
      stopAiVoiceRecording(true);
      return;
    }

    const initialBase = aiBoxCommandInput ? aiBoxCommandInput.trim() : '';
    aiAccumulatedSpeechRef.current = initialBase;
    aiCapturedTextRef.current = '';
    aiAudioChunksRef.current = [];
    aiHasSpokenRef.current = false;
    aiLastTranscribedChunkCountRef.current = 0;
    aiIsTranscribingLiveRef.current = false;
    isAiMicListeningRef.current = true;
    setIsAiMicListening(true);
    setAiRecordingSeconds(0);
    setAiLiveSpeechText('');
    setAiVoiceStatusMsg('');
    setAiMicVoiceLevel(25);

    if (aiRecSecTimerRef.current) clearInterval(aiRecSecTimerRef.current);
    aiRecSecTimerRef.current = setInterval(() => {
      setAiRecordingSeconds((prev) => prev + 1);
    }, 1000);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        if (!isAiMicListeningRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        aiMediaStreamRef.current = stream;

        // Initialize AudioContext & Analyser with resume() for real-time mobile visualizer
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          try {
            const ctx = new AudioCtx();
            if (ctx.state === 'suspended') {
              await ctx.resume().catch(() => {});
            }
            aiAudioCtxRef.current = ctx;
            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64;
            analyser.smoothingTimeConstant = 0.55;
            source.connect(analyser);
            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            aiLevelTimerRef.current = setInterval(() => {
              analyser.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
              const avg = sum / dataArray.length;
              if (avg > 4) {
                aiHasSpokenRef.current = true;
              }
              const scaled = Math.min(100, Math.max(16, Math.round(avg * 1.8)));
              setAiMicVoiceLevel(scaled);

              // 7-bar dynamic equalizer heights
              const step = Math.max(1, Math.floor(dataArray.length / 7));
              const bars: number[] = [];
              for (let i = 0; i < 7; i++) {
                let bSum = 0;
                for (let j = 0; j < step; j++) {
                  bSum += dataArray[i * step + j] || 0;
                }
                const bAvg = bSum / step;
                const h = Math.max(8, Math.min(34, Math.round((bAvg / 255) * 34) + (avg > 5 ? 6 : 2)));
                bars.push(h);
              }
              setAiVoiceBars(bars);
            }, 60);
          } catch (ctxErr) {
            console.warn('AudioContext error:', ctxErr);
          }
        }

        if (typeof MediaRecorder !== 'undefined') {
          const candidates = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/mp4',
            'audio/ogg;codecs=opus',
            'audio/aac',
          ];
          let chosenMime = '';
          for (const c of candidates) {
            if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(c)) {
              chosenMime = c;
              break;
            }
          }

          const recorder = chosenMime
            ? new MediaRecorder(stream, { mimeType: chosenMime })
            : new MediaRecorder(stream);
          const effectiveMime = recorder.mimeType || chosenMime || 'audio/webm';
          aiMediaRecorderRef.current = recorder;

          recorder.ondataavailable = (ev) => {
            if (ev.data && ev.data.size > 0) {
              aiAudioChunksRef.current.push(ev.data);
            }
          };

          recorder.onstop = async () => {
            const chunks = [...aiAudioChunksRef.current];

            if (aiMediaStreamRef.current) {
              try {
                aiMediaStreamRef.current.getTracks().forEach((t) => t.stop());
              } catch {}
              aiMediaStreamRef.current = null;
            }
            if (aiAudioCtxRef.current) {
              try {
                aiAudioCtxRef.current.close();
              } catch {}
              aiAudioCtxRef.current = null;
            }
            aiMediaRecorderRef.current = null;

            if (chunks.length > 0) {
              setIsAiMicTranscribing(true);
              setAiVoiceStatusMsg('AI ট্রান্সক্রাইব করছে...');
              try {
                const fullBlob = new Blob(chunks, { type: effectiveMime });
                if (fullBlob.size > 200) {
                  const base64Url = await blobToDataUrl(fullBlob);
                  const transcript = await transcribeAudioWithAi(base64Url, effectiveMime);
                  if (transcript && transcript.trim()) {
                    const clean = transcript.trim();
                    setAiBoxCommandInput((prev) => {
                      const current = (prev || '').trim();
                      if (!current) return clean;
                      if (current.toLowerCase().includes(clean.toLowerCase())) return current;
                      if (clean.toLowerCase().includes(current.toLowerCase())) return clean;
                      return `${current} ${clean}`.trim();
                    });
                    setAiVoiceStatusMsg('✓ ভয়েস কমান্ড যুক্ত হয়েছে!');
                    setTimeout(() => setAiVoiceStatusMsg(''), 3000);
                  } else if (!aiCapturedTextRef.current && !aiBoxCommandInput.trim()) {
                    setAiVoiceStatusMsg('কথা শোনা যায়নি, আবার বলুন');
                    setTimeout(() => setAiVoiceStatusMsg(''), 2500);
                  }
                }
              } catch (tErr) {
                console.warn('AI transcribe error:', tErr);
              } finally {
                setIsAiMicTranscribing(false);
                setAiLiveSpeechText('');
              }
            } else {
              setIsAiMicTranscribing(false);
              setAiLiveSpeechText('');
            }
          };

          recorder.start(250);

          // Native browser SpeechRecognition for immediate real-time feedback
          const SpeechRecClass =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          if (SpeechRecClass) {
            try {
              const rec = new SpeechRecClass();
              aiSpeechRecRef.current = rec;
              rec.lang = 'bn-BD';
              rec.continuous = true;
              rec.interimResults = true;
              rec.maxAlternatives = 1;

              rec.onresult = (event: any) => {
                let interim = '';
                let finalStr = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                  const piece = event.results[i][0]?.transcript || '';
                  if (event.results[i].isFinal) {
                    finalStr += piece + ' ';
                  } else {
                    interim += piece;
                  }
                }
                if (finalStr) {
                  const base = aiAccumulatedSpeechRef.current;
                  aiAccumulatedSpeechRef.current = base ? `${base.trim()} ${finalStr.trim()}` : finalStr.trim();
                }
                const base = aiAccumulatedSpeechRef.current;
                const fullText = (base ? `${base.trim()} ${interim.trim()}` : interim.trim()).trim();
                if (fullText) {
                  aiHasSpokenRef.current = true;
                  aiCapturedTextRef.current = fullText;
                  setAiLiveSpeechText(fullText);
                  setAiBoxCommandInput(fullText);
                }
              };

              rec.onerror = (e: any) => {
                console.warn('SpeechRecognition error:', e?.error);
              };

              rec.onend = () => {
                if (aiSpeechRecRef.current && isAiMicListeningRef.current) {
                  try {
                    rec.start();
                  } catch {}
                }
              };

              rec.start();
            } catch (recErr) {
              console.warn('SpeechRec start error:', recErr);
            }
          }

          return;
        }
      }
    } catch (micErr) {
      console.warn('getUserMedia error:', micErr);
    }

    // Fallback if getUserMedia failed
    if (!aiLevelTimerRef.current) {
      aiLevelTimerRef.current = setInterval(() => {
        setAiMicVoiceLevel(Math.floor(20 + Math.random() * 60));
        setAiVoiceBars([
          Math.floor(10 + Math.random() * 18),
          Math.floor(14 + Math.random() * 20),
          Math.floor(18 + Math.random() * 24),
          Math.floor(22 + Math.random() * 28),
          Math.floor(16 + Math.random() * 22),
          Math.floor(12 + Math.random() * 18),
          Math.floor(8 + Math.random() * 14),
        ]);
      }, 90);
    }

    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionCtor) {
      try {
        const recognition = new SpeechRecognitionCtor();
        aiSpeechRecRef.current = recognition;
        recognition.lang = 'bn-BD';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptPiece = event.results[i][0]?.transcript || '';
            if (event.results[i].isFinal) {
              finalTranscript += transcriptPiece + ' ';
            } else {
              interimTranscript += transcriptPiece;
            }
          }
          if (finalTranscript) {
            const base = aiAccumulatedSpeechRef.current;
            aiAccumulatedSpeechRef.current = base ? `${base.trim()} ${finalTranscript.trim()}` : finalTranscript.trim();
          }
          const base = aiAccumulatedSpeechRef.current;
          const combined = (base ? `${base.trim()} ${interimTranscript.trim()}` : interimTranscript.trim()).trim();
          if (combined) {
            aiHasSpokenRef.current = true;
            aiCapturedTextRef.current = combined;
            setAiLiveSpeechText(combined);
            setAiBoxCommandInput(combined);
          }
        };

        recognition.onerror = () => {};
        recognition.onend = () => {
          if (aiSpeechRecRef.current && isAiMicListeningRef.current) {
            try {
              recognition.start();
            } catch {}
          }
        };

        recognition.start();
      } catch {}
    }
  };
  const [aiBoxAttachments, setAiBoxAttachments] = useState<
    Array<{
      id: string;
      name: string;
      kind: 'image' | 'video' | 'file' | 'folder';
      previewUrl?: string;
      textContent?: string;
      sizeLabel?: string;
    }>
  >([]);
  const [aiBoxMessages, setAiBoxMessages] = useState<
    Array<{
      id: string;
      userPrompt: string;
      attachments?: Array<{ id: string; name: string; kind: 'image' | 'video' | 'file' | 'folder'; previewUrl?: string }>;
      summary: string;
      code: string;
      fileName?: string;
      platformLabel?: string;
      issues?: Array<{ line?: number | null; type?: string; message: string }>;
    }>
  >([]);

  const aiPhotoInputRef = useRef<HTMLInputElement>(null);
  const aiVideoInputRef = useRef<HTMLInputElement>(null);
  const aiFileInputRef = useRef<HTMLInputElement>(null);
  const aiFolderInputRef = useRef<HTMLInputElement>(null);
  const aiFeedEndRef = useRef<HTMLDivElement>(null);

  const handleAiAttachmentSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    kind: 'image' | 'video' | 'file' | 'folder'
  ) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const filesArray: File[] = Array.from<File>(fileList);
    if (kind === 'folder') {
      const firstPath = (filesArray[0] as any).webkitRelativePath || filesArray[0].name;
      const folderName = firstPath.split('/')[0] || 'Selected_Folder';
      const readerPromises = filesArray.slice(0, 5).map(
        (f) =>
          new Promise<string>((resolve) => {
            if (f.size < 200000 && /\.(html|css|js|ts|tsx|kt|java|dart|py|json|md|txt|sql|go|rs|cs|vue)$/i.test(f.name)) {
              const r = new FileReader();
              r.onload = () => resolve(`// File: ${f.name}\n${String(r.result || '')}`);
              r.onerror = () => resolve('');
              r.readAsText(f);
            } else {
              resolve(`// File: ${f.name} (${Math.round(f.size / 1024)} KB)`);
            }
          })
      );
      Promise.all(readerPromises).then((contents) => {
        setAiBoxAttachments((prev) => [
          ...prev,
          {
            id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            name: `${folderName} (${filesArray.length} files)`,
            kind: 'folder',
            textContent: contents.filter(Boolean).join('\n\n'),
          },
        ]);
      });
    } else {
      filesArray.slice(0, 4).forEach((file) => {
        const isImg = kind === 'image' || file.type.startsWith('image/');
        const isVid = kind === 'video' || file.type.startsWith('video/');
        const previewUrl = isImg || isVid ? URL.createObjectURL(file) : undefined;

        if (!isImg && !isVid && file.size < 300000) {
          const reader = new FileReader();
          reader.onload = () => {
            setAiBoxAttachments((prev) => [
              ...prev,
              {
                id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                name: file.name,
                kind: 'file',
                textContent: String(reader.result || ''),
                sizeLabel: `${Math.max(1, Math.round(file.size / 1024))} KB`,
              },
            ]);
          };
          reader.readAsText(file);
        } else {
          setAiBoxAttachments((prev) => [
            ...prev,
            {
              id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              name: file.name,
              kind: isImg ? 'image' : isVid ? 'video' : 'file',
              previewUrl,
              sizeLabel: `${Math.max(1, Math.round(file.size / 1024))} KB`,
            },
          ]);
        }
      });
    }

    setIsAiAttachMenuOpen(false);
    e.target.value = '';
  };

  const handleExecuteInlineAiCommand = async (
    cmdOverride?: string,
    modeOverride?: 'chat' | 'generate' | 'debug',
    langOverride?: AiTargetPlatformId
  ) => {
    const activeMode = modeOverride || aiBoxMode;
    const activeLang = langOverride || aiBoxTargetLang;
    const rawCmd = (cmdOverride ?? aiBoxCommandInput).trim();
    const currentAttachments = [...aiBoxAttachments];
    const platInfo = getAiPlatformById(activeLang);
    const targetFile = activeProject ? activeProject.name : platInfo.defaultFile;

    const attachmentSummaryText =
      currentAttachments.length > 0
        ? currentAttachments.map((a) => `[Attached ${a.kind.toUpperCase()}: ${a.name}]`).join(' ')
        : '';
    const attachmentCodeContext = currentAttachments
      .map((a) => (a.textContent ? `// Attached (${a.name}):\n${a.textContent}` : ''))
      .filter(Boolean)
      .join('\n\n');

    const cmd =
      rawCmd ||
      (currentAttachments.length > 0
        ? `Analyze and build code based on ${attachmentSummaryText}`
        : activeMode === 'debug'
        ? `Scan & Auto-Fix (${targetFile})`
        : '');

    const baseEditorCode =
      editorSubTab === 'HTML'
        ? activeHtml
        : editorSubTab === 'Kotlin'
        ? activeKotlin
        : activeJava;
    const currentCodeContext = [attachmentCodeContext, baseEditorCode].filter(Boolean).join('\n\n');

    if (!cmd) return;
    if (isAiBoxLoading) return;

    setIsAiBoxLoading(true);
    setIsAiBoxMenuOpen(false);
    setIsAiAttachMenuOpen(false);
    setAiBoxCommandInput('');
    setAiBoxAttachments([]);

    const msgId = `ai_msg_${Date.now()}`;

    try {
      if (activeMode === 'generate') {
        const res = await generateAppWithAi(
          attachmentSummaryText ? `${cmd}\n${attachmentSummaryText}` : cmd,
          activeLang
        );
        setAiBoxMessages((prev) => [
          ...prev,
          {
            id: msgId,
            userPrompt: rawCmd || attachmentSummaryText || cmd,
            attachments: currentAttachments,
            summary: `${res.title}: ${res.description}`,
            code: res.code || '',
            fileName: res.fileName || targetFile,
            platformLabel: platInfo.label,
          },
        ]);
      } else if (activeMode === 'debug') {
        const codeToDebug = rawCmd || currentCodeContext || '// No code provided';
        const res = await debugCodeWithAi(codeToDebug, targetFile, activeLang);
        setAiBoxMessages((prev) => [
          ...prev,
          {
            id: msgId,
            userPrompt: rawCmd || `Scan & Auto-Fix (${targetFile})`,
            attachments: currentAttachments,
            summary: res.summary || 'Diagnostics & Auto-Fix complete!',
            code: res.fixedCode || codeToDebug,
            fileName: targetFile,
            platformLabel: platInfo.label,
            issues: res.issues || [],
          },
        ]);
      } else {
        const fullUserMessage = attachmentSummaryText ? `${cmd}\n${attachmentSummaryText}` : cmd;
        const responseText = await sendAiChatMessage(
          fullUserMessage,
          aiBoxChatHistory,
          targetFile,
          currentCodeContext || undefined,
          activeLang
        );
        const codeBlockMatch = responseText.match(/```(?:[a-zA-Z0-9_\-\+]*)\n([\s\S]*?)```/);
        const extractedCode = codeBlockMatch && codeBlockMatch[1] ? codeBlockMatch[1].trim() : '';
        const textWithoutCode = responseText.replace(/```(?:[a-zA-Z0-9_\-\+]*)\n[\s\S]*?```/g, '').trim();

        setAiBoxChatHistory((prev) => [
          ...prev.slice(-8),
          { role: 'user', text: fullUserMessage },
          { role: 'model', text: responseText },
        ]);

        setAiBoxMessages((prev) => [
          ...prev,
          {
            id: msgId,
            userPrompt: rawCmd || attachmentSummaryText || cmd,
            attachments: currentAttachments,
            summary: textWithoutCode || responseText.trim() || 'AI response ready.',
            code: extractedCode,
            fileName: targetFile,
            platformLabel: platInfo.label,
          },
        ]);
      }
    } catch {
      const hasBengali = /[\u0980-\u09FF]/.test(cmd);
      setAiBoxMessages((prev) => [
        ...prev,
        {
          id: msgId,
          userPrompt: rawCmd || attachmentSummaryText || cmd,
          attachments: currentAttachments,
          summary: hasBengali
            ? 'হ্যালো! 👋 আমি আপনার মেসেজ পেয়েছি। আপনি যেকোনো প্রশ্ন বা কোড কমান্ড লিখুন, আমি সাথে সাথে উত্তর ও কোড তৈরি করে দেবো।'
            : 'Hello! 👋 I received your message. Ask me any question or tell me what code or app you want to build!',
          code: '',
          fileName: targetFile,
          platformLabel: platInfo.label,
        },
      ]);
    } finally {
      setIsAiBoxLoading(false);
      setTimeout(() => {
        aiFeedEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  };

  const handleApplyAiPracticeCode = (newCode: string, fileName?: string, runImmediately?: boolean) => {
    if (!activeProject) {
      const generatedProj: ProjectItem = {
        id: `ai_proj_${Date.now()}`,
        name: fileName || 'AI_Generated_App.html',
        lang: 'HTML',
        html: newCode,
        css: '',
        js: '',
        createdAt: 'Just now',
        isOriginal: false,
        code: newCode,
      };
      setProjects((prev) => [generatedProj, ...prev]);
      setOpenedProjectName(generatedProj.name.replace(/\.(html|kt|java|dart|swift)$/i, ''));
      setActiveProject(generatedProj);
      setSelectedBarFileId(generatedProj.id);
      setIsEditorFileSelected(true);
      setEditorSubTab('HTML');
      setActiveHtml(newCode);
      showToast(`Opened "${generatedProj.name}" in Editor!`);
      if (runImmediately) {
        setTimeout(() => {
          setLivePreviewContent(newCode);
          setIsPreviewOpen(true);
        }, 250);
      }
      return;
    }
    setIsEditorFileSelected(true);
    handleUserCodeChange(newCode);
    handleSaveProject();
    showToast(`AI Code Applied: ${fileName || 'Updated'}`);
    if (runImmediately) {
      setTimeout(() => {
        handleRunCode();
      }, 400);
    }
  };
  const [spaceMode, setSpaceMode] = useState<'single' | 'double'>('single');
  const [isTabHolding, setIsTabHolding] = useState(false);
  const [tabHoldSeconds, setTabHoldSeconds] = useState(1);
  const tabPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tabHoldIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tabHoldTriggeredRef = useRef(false);

  // Soft keyboard toggle state (allows coding with or without virtual keyboard popping up)
  const [isSoftKeyboardEnabled, setIsSoftKeyboardEnabled] = useState(true);

  // Clipboard dropdown state
  const [isCopyOptionsOpen, setIsCopyOptionsOpen] = useState(false);
  const copyMenuRef = useRef<HTMLDivElement>(null);

  // Project Folder & Files Drawer state inside Practice Editor
  const [isProjectFilesDrawerOpen, setIsProjectFilesDrawerOpen] = useState(false);

  // In-Code Search state in practice editor
  const [isCodeSearchOpen, setIsCodeSearchOpen] = useState(false);
  const [codeSearchQuery, setCodeSearchQuery] = useState('');
  const codeSearchMatchCount = useMemo(() => {
    const currentCode = editorSubTab === 'HTML' ? activeHtml : editorSubTab === 'Kotlin' ? activeKotlin : activeJava;
    if (!codeSearchQuery.trim()) return 0;
    try {
      const escaped = codeSearchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'gi');
      const matches = currentCode.match(regex);
      return matches ? matches.length : 0;
    } catch {
      return 0;
    }
  }, [codeSearchQuery, activeHtml, activeKotlin, activeJava, editorSubTab]);

  // Code Practice Project Selection / Filter state (Matching SelectProjectScreen)
  const [practicePlatformFilter, setPracticePlatformFilter] = useState<'all' | 'android' | 'flutter'>(activePlatform);
  const [practiceSearchQuery, setPracticeSearchQuery] = useState('');
  const [selectedPracticeId, setSelectedPracticeId] = useState<string | null>(null);

  // Drag & drop state for symbols
  const [dragState, setDragState] = useState<{ row: 1 | 2; index: number; symbol: string } | null>(null);
  const touchDragRef = useRef<{ row: 1 | 2; index: number; symbol: string; startX: number; startY: number; isDragging: boolean } | null>(null);
  const symbolScrollRef = useRef<HTMLDivElement>(null);
  const lastTapTimeRef = useRef<number>(0);

  // Soft keyboard toggle handler
  const toggleSoftKeyboard = () => {
    setIsSoftKeyboardEnabled((prev) => {
      const next = !prev;
      showToast(next ? 'Virtual Keyboard ON (Soft keyboard active)' : 'No-Keyboard Mode (Coding with symbol bar only)');
      return next;
    });
  };

  // Close clipboard menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (copyMenuRef.current && !copyMenuRef.current.contains(e.target as Node)) {
        setIsCopyOptionsOpen(false);
      }
    };
    if (isCopyOptionsOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isCopyOptionsOpen]);

  // Clipboard operations
  const handleSelectAllCode = () => {
    const currentCode =
      editorSubTab === 'HTML'
        ? activeHtml
        : editorSubTab === 'Kotlin'
        ? activeKotlin
        : editorSubTab === 'Java'
        ? activeJava
        : editorSubTab === 'Flutter'
        ? activeFlutter
        : activeSwift;
    if (currentCode) {
      try {
        localStorage.setItem('android_ide_clipboard_cache', currentCode);
        navigator.clipboard?.writeText(currentCode).catch(() => {});
      } catch {}
    }
    const selectAllNow = () => {
      if (editorTextareaRef.current) {
        editorTextareaRef.current.focus({ preventScroll: true });
        editorTextareaRef.current.select();
        editorTextareaRef.current.setSelectionRange(0, editorTextareaRef.current.value.length);
      }
    };
    selectAllNow();
    setTimeout(selectAllNow, 50);
    // Keep menu open so user can immediately tap Copy, Cut, Paste, or Clear All
    showToast('Selected all code — tap Copy, Cut, or Clear All');
  };

  const handleCopyCode = async () => {
    const currentCode =
      editorSubTab === 'HTML'
        ? activeHtml
        : editorSubTab === 'Kotlin'
        ? activeKotlin
        : editorSubTab === 'Java'
        ? activeJava
        : editorSubTab === 'Flutter'
        ? activeFlutter
        : activeSwift;
    if (editorTextareaRef.current) {
      const start = editorTextareaRef.current.selectionStart;
      const end = editorTextareaRef.current.selectionEnd;
      const textToCopy = start !== end ? currentCode.substring(start, end) : currentCode;
      try {
        localStorage.setItem('android_ide_clipboard_cache', textToCopy);
        await navigator.clipboard?.writeText(textToCopy);
      } catch {}
      showToast(start !== end ? 'Copied selection to clipboard!' : 'Copied all code to clipboard!');
    }
    setIsCopyOptionsOpen(false);
  };

  const handlePasteCode = async () => {
    setIsCopyOptionsOpen(false);
    let text = '';
    try {
      text = await navigator.clipboard.readText();
    } catch {}
    if (!text || !text.trim()) {
      try {
        text = localStorage.getItem('android_ide_clipboard_cache') || '';
      } catch {}
    }
    if (text) {
      try {
        localStorage.setItem('android_ide_clipboard_cache', text);
      } catch {}
      if (!currentActiveCode || !currentActiveCode.trim()) {
        handleUserCodeChange(text);
      } else {
        insertSymbol(text);
      }
      showToast('Pasted from clipboard!');
    } else {
      if (editorTextareaRef.current) {
        editorTextareaRef.current.focus();
      }
      showToast('Long-press inside code box to paste');
    }
  };

  const handleCutCode = async () => {
    const currentCode =
      editorSubTab === 'HTML'
        ? activeHtml
        : editorSubTab === 'Kotlin'
        ? activeKotlin
        : editorSubTab === 'Java'
        ? activeJava
        : editorSubTab === 'Flutter'
        ? activeFlutter
        : activeSwift;
    if (editorTextareaRef.current) {
      const start = editorTextareaRef.current.selectionStart;
      const end = editorTextareaRef.current.selectionEnd;
      const textToCut = start !== end ? currentCode.substring(start, end) : currentCode;
      const newCode = start !== end ? currentCode.substring(0, start) + currentCode.substring(end) : '';
      if (textToCut) {
        try {
          localStorage.setItem('android_ide_clipboard_cache', textToCut);
          await navigator.clipboard?.writeText(textToCut);
        } catch {}
        handleUserCodeChange(newCode);
        showToast('Cut code to clipboard!');
      } else {
        showToast('Editor is empty');
      }
    }
    setIsCopyOptionsOpen(false);
  };

  const handleClearAllCode = () => {
    handleUserCodeChange('');
    showToast('Cleared code');
    setIsCopyOptionsOpen(false);
  };

  // Refs for synchronizing line numbers & syntax highlight scroll with textarea
  const practiceLineNumbersRef = useRef<HTMLDivElement>(null);
  const practiceSyntaxBackdropRef = useRef<HTMLDivElement>(null);
  const practiceHoldTimerRef = useRef<NodeJS.Timeout | null>(null);
  const practiceTouchStartRef = useRef<{ x: number; y: number } | null>(null);
  const handleEditorScroll = () => {
    if (editorTextareaRef.current) {
      const top = editorTextareaRef.current.scrollTop;
      const left = editorTextareaRef.current.scrollLeft;
      if (practiceLineNumbersRef.current) {
        practiceLineNumbersRef.current.scrollTop = top;
      }
      if (practiceSyntaxBackdropRef.current) {
        practiceSyntaxBackdropRef.current.scrollTop = top;
        practiceSyntaxBackdropRef.current.scrollLeft = left;
      }
    }
  };

  // File Long Press action state
  const [fileActionSheetProj, setFileActionSheetProj] = useState<ProjectItem | null>(null);
  const fileLongPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef(false);

  const handleFileTouchStart = (proj: ProjectItem) => {
    isLongPressTriggeredRef.current = false;
    if (fileLongPressTimerRef.current) clearTimeout(fileLongPressTimerRef.current);
    fileLongPressTimerRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(40); } catch {}
      }
      setFileActionSheetProj(proj);
    }, 450);
  };

  const handleFileTouchEnd = () => {
    if (fileLongPressTimerRef.current) {
      clearTimeout(fileLongPressTimerRef.current);
      fileLongPressTimerRef.current = null;
    }
  };

  // Project Card Long Press action to trigger delete
  const projectLongPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const handleProjectTouchStart = (cProj: CustomProject) => {
    if (projectLongPressTimerRef.current) clearTimeout(projectLongPressTimerRef.current);
    projectLongPressTimerRef.current = setTimeout(() => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(40); } catch {}
      }
      setDeleteConfirmItem({
        type: 'project',
        id: cProj.id,
        name: cProj.name,
      });
    }, 450);
  };

  const handleProjectTouchEnd = () => {
    if (projectLongPressTimerRef.current) {
      clearTimeout(projectLongPressTimerRef.current);
      projectLongPressTimerRef.current = null;
    }
  };

  // Custom File Row Long Press action to trigger delete
  const fileRowLongPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const handleFileRowTouchStart = (cProj: CustomProject, file: CustomProjectFile) => {
    if (fileRowLongPressTimerRef.current) clearTimeout(fileRowLongPressTimerRef.current);
    fileRowLongPressTimerRef.current = setTimeout(() => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(40); } catch {}
      }
      setDeleteConfirmItem({
        type: 'file',
        id: file.id,
        parentId: cProj.id,
        name: file.name,
      });
    }, 450);
  };

  const handleFileRowTouchEnd = () => {
    if (fileRowLongPressTimerRef.current) {
      clearTimeout(fileRowLongPressTimerRef.current);
      fileRowLongPressTimerRef.current = null;
    }
  };

  const handleDeleteFileFromBar = (proj: ProjectItem) => {
    setFileActionSheetProj(null);
    setDeleteConfirmItem({
      type: 'practice_file',
      id: proj.id,
      name: proj.name,
    });
  };

  const handleDeleteAllCustomFiles = () => {
    const confirmAll = window.confirm('Reset all files and restore the original 100 practice files?');
    if (!confirmAll) return;
    localStorage.removeItem(`code_studio_projects_v5_${activePlatform}`);
    const defaultList = activePlatform === 'flutter' ? ALL_100_FLUTTER_PROJECTS : ALL_100_PRACTICE_PROJECTS;
    setProjects(defaultList);
    if (defaultList.length > 0) {
      handleOpenProject(defaultList[0]);
    }
    setFileActionSheetProj(null);
    showToast('Reset workspace to 100 practice files!');
  };

  // Android Quick Settings / Control Center State & Helpers (matching user screenshot)
  const [ccTime, setCcTime] = useState({
    time: '9:25',
    date: 'Mon, Sep 21',
  });
  const [ccPage, setCcPage] = useState(0);
  const [ccFilter, setCcFilter] = useState<'all' | 'html' | 'kotlin' | 'java' | 'custom'>('all');
  const [ccViewMode, setCcViewMode] = useState<'grid' | 'list'>('grid');
  const [ccTouchStartX, setCcTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      setCcTime({
        time: `${hours}:${minutes}`,
        date: `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`
      });
    };
    updateClock();
    const timer = setInterval(updateClock, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleShareProject = async (p: ProjectItem) => {
    const codeContent = p.lang === 'HTML'
      ? `<!-- Project: ${p.name} -->\n<!DOCTYPE html>\n<html>\n<head>\n<style>\n${p.css || ''}\n</style>\n</head>\n<body>\n${p.html}\n<script>\n${p.js || ''}\n</script>\n</body>\n</html>`
      : p.html;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Project: ${p.name}`,
          text: `Practice Project "${p.name}" (${p.lang}):\n\n${codeContent.slice(0, 1500)}`,
        });
        showToast(`Shared "${p.name}"!`);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(codeContent);
      showToast(`Code for "${p.name}" copied to clipboard! Ready to share.`);
    } catch {
      showToast(`Ready to share "${p.name}"!`);
    }
  };

  const getProjectLogoInfo = (proj: ProjectItem) => {
    const nameLower = (proj.name || '').toLowerCase();
    
    // Check by file extension or language
    if (proj.lang === 'Kotlin' || proj.name.endsWith('.kt') || nameLower.includes('.kt')) {
      return {
        icon: 'fab fa-android',
        color: '#7F52FF', // Official Kotlin Purple
        glowColor: 'rgba(127, 82, 255, 0.3)',
        badge: 'KOTLIN'
      };
    }
    if (proj.lang === 'Java' || proj.name.endsWith('.java') || nameLower.includes('.java')) {
      return {
        icon: 'fab fa-java',
        color: '#F89820', // Official Java Orange
        glowColor: 'rgba(248, 152, 32, 0.3)',
        badge: 'JAVA'
      };
    }
    if ((proj.lang as string) === 'Flutter' || proj.name.endsWith('.dart') || nameLower.includes('.dart')) {
      return {
        icon: 'fas fa-feather-pointed',
        color: '#40C4FF', // Official Flutter Cyan/Blue
        glowColor: 'rgba(64, 196, 255, 0.3)',
        badge: 'FLUTTER'
      };
    }

    // Original templates with unique functional identity
    if (nameLower.includes('welcome') || nameLower.includes('intro')) {
      return { icon: 'fas fa-hand-peace', color: '#0ea5e9', glowColor: 'rgba(14, 165, 233, 0.3)', badge: 'HTML5' };
    }
    if (nameLower.includes('interactive') || nameLower.includes('button')) {
      return { icon: 'fas fa-toggle-on', color: '#10b981', glowColor: 'rgba(16, 185, 129, 0.3)', badge: 'HTML5' };
    }
    if (nameLower.includes('counter') || nameLower.includes('calc')) {
      return { icon: 'fas fa-arrow-up-9-1', color: '#8b5cf6', glowColor: 'rgba(139, 92, 246, 0.3)', badge: 'HTML5' };
    }
    if (nameLower.includes('todo') || nameLower.includes('list')) {
      return { icon: 'fas fa-list-check', color: '#f59e0b', glowColor: 'rgba(245, 158, 11, 0.3)', badge: 'HTML5' };
    }
    if (nameLower.includes('clock') || nameLower.includes('timer') || nameLower.includes('stopwatch')) {
      return { icon: 'fas fa-clock', color: '#06b6d4', glowColor: 'rgba(6, 182, 212, 0.3)', badge: 'HTML5' };
    }
    if (nameLower.includes('weather')) {
      return { icon: 'fas fa-cloud-sun', color: '#38bdf8', glowColor: 'rgba(56, 189, 248, 0.3)', badge: 'HTML5' };
    }
    if (nameLower.includes('canvas') || nameLower.includes('draw')) {
      return { icon: 'fas fa-paintbrush', color: '#f43f5e', glowColor: 'rgba(244, 63, 94, 0.3)', badge: 'HTML5' };
    }
    if (nameLower.includes('music') || nameLower.includes('audio')) {
      return { icon: 'fas fa-music', color: '#ec4899', glowColor: 'rgba(236, 72, 153, 0.3)', badge: 'HTML5' };
    }
    if (nameLower.includes('video') || nameLower.includes('player')) {
      return { icon: 'fas fa-play', color: '#ef4444', glowColor: 'rgba(239, 68, 68, 0.3)', badge: 'HTML5' };
    }
    if (nameLower.includes('game') || nameLower.includes('quiz')) {
      return { icon: 'fas fa-gamepad', color: '#14b8a6', glowColor: 'rgba(20, 184, 166, 0.3)', badge: 'HTML5' };
    }
    if (nameLower.includes('chat') || nameLower.includes('message')) {
      return { icon: 'fas fa-comments', color: '#0284c7', glowColor: 'rgba(2, 132, 199, 0.3)', badge: 'HTML5' };
    }
    if (nameLower.includes('storage') || nameLower.includes('db')) {
      return { icon: 'fas fa-database', color: '#eab308', glowColor: 'rgba(234, 179, 8, 0.3)', badge: 'HTML5' };
    }

    // Default HTML5 file: Official HTML5 Orange shield logo (#E44D26)
    return {
      icon: 'fab fa-html5',
      color: '#E44D26', // Official HTML5 Orange
      glowColor: 'rgba(228, 77, 38, 0.3)',
      badge: 'HTML5'
    };
  };

  const getProjectControlIcon = (proj: ProjectItem) => {
    return getProjectLogoInfo(proj).icon;
  };

  const formatControlCenterLabel = (name: string) => {
    let clean = name.replace(/\.(html|kt|java|dart)$/i, '').replace(/_/g, ' ');
    const match = clean.match(/^(\d+)[\s_-]*(.*)$/);
    if (match) {
      const num = match[1];
      const rest = match[2].trim();
      return `${num}. ${rest ? rest.slice(0, 9) : 'File'}`;
    }
    return clean.slice(0, 11);
  };

  const formatPracticeFileName = (name: string) => {
    let clean = name.replace(/\.html$/i, '').replace(/\.dart$/i, '').replace(/\.kt$/i, '').replace(/_/g, ' ');
    clean = clean.replace(/Visual Blocks App/i, 'Visual Blocks #');
    if (clean.length > 18) {
      return clean.substring(0, 16) + '...';
    }
    return clean;
  };

  const handleExportSingleProject = async (p: ProjectItem) => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${p.name}</title>
  <style>
${p.css || ''}
  </style>
</head>
<body>
${p.html || ''}
  <script>
${p.js || ''}
  </script>
</body>
</html>`;
    const fileName = p.name.endsWith('.html') ? p.name : `${p.name}.html`;
    await triggerReliableDownload({
      textData: fullHtml,
      fileName,
      contentType: 'text/html;charset=utf-8',
    });
    showToast(`Exported "${p.name}"!`);
  };

  // Auto-scroll the 100-file horizontal bar to active file
  useEffect(() => {
    if (activeFileChipRef.current) {
      activeFileChipRef.current.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedBarFileId]);

  // Helper to generate Swift sample code for any file
  const generateSwiftSample = (name: string) => `import SwiftUI

struct ContentView: View {
    @State private var count = 0

    var body: some View {
        VStack(spacing: 16) {
            Text("Project: ${name.replace(/\.(html|kt|java|dart|swift)$/i, '')}")
                .font(.title2)
                .fontWeight(.bold)
            Button("Run Action (\\(count))") {
                count += 1
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
    }
}
`;

  // Helper to generate Flutter Dart sample code for any file
  const generateFlutterSample = (name: string) => `import 'package:flutter/material.dart';

void main() => runApp(const PracticeApp());

class PracticeApp extends StatelessWidget {
  const PracticeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark(),
      home: Scaffold(
        appBar: AppBar(title: const Text('${name.replace(/\.(html|kt|java|dart|swift)$/i, '')}')),
        body: const Center(
          child: Text('Flutter Dart Practice Module Ready'),
        ),
      ),
    );
  }
}
`;

  // Open a project in the practice editor (Code remains hidden until user selects a numbered file chip in Bar 2)
  const handleOpenProject = (proj: ProjectItem) => {
    if (activeProject && selectedBarFileId) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === selectedBarFileId
            ? { ...p, html: activeHtml, css: activeCss, js: activeJs, kotlin: activeKotlin, java: activeJava }
            : p
        )
      );
    }
    const cleanTitle = proj.name.includes(' / ')
      ? proj.name.split(' / ')[0].trim()
      : proj.name.replace(/\.(html|kt|java|dart|swift|gradle|css|js)$/i, '').replace(/^\d+[\s_-]*/, '');
    setOpenedProjectName(cleanTitle || proj.name);
    setActiveProject(proj);
    setSelectedBarFileId(null);
    setIsEditorFileSelected(false);
    setActiveHtml(proj.html || '');
    setActiveCss(proj.css || '');
    setActiveJs(proj.js || '');
    setActiveKotlin(proj.kotlin || generateKotlinSample(proj.name));
    setActiveJava(proj.java || generateJavaSample(proj.name));
    setActiveFlutter(proj.code || generateFlutterSample(proj.name));
    setActiveSwift(generateSwiftSample(proj.name));
    if (proj.lang === 'Kotlin' || proj.name.endsWith('.kt')) setEditorSubTab('Kotlin');
    else if (proj.lang === 'Java' || proj.name.endsWith('.java')) setEditorSubTab('Java');
    else if (proj.lang === 'Dart' || proj.name.endsWith('.dart')) setEditorSubTab('Flutter');
    else if (proj.lang === 'Swift' || proj.name.endsWith('.swift')) setEditorSubTab('Swift');
    else setEditorSubTab('HTML');
    setIsPreviewOpen(false);
    setIsTopMenuOpen(false);
    setUndoStack([]);
    setRedoStack([]);
  };

  // Select a numbered code file chip from Bar 2 to show its code in the editor
  const handleSelectBarFileChip = (proj: ProjectItem) => {
    if (selectedBarFileId === proj.id && isEditorFileSelected) {
      setSelectedBarFileId(null);
      setIsEditorFileSelected(false);
      return;
    }
    if (selectedBarFileId && isEditorFileSelected) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === selectedBarFileId
            ? { ...p, html: activeHtml, css: activeCss, js: activeJs, kotlin: activeKotlin, java: activeJava }
            : p
        )
      );
    }
    setSelectedBarFileId(proj.id);
    setIsEditorFileSelected(true);
    setActiveHtml(proj.html || '');
    setActiveCss(proj.css || '');
    setActiveJs(proj.js || '');
    setActiveKotlin(proj.kotlin || (proj.lang === 'Kotlin' ? proj.code : '') || generateKotlinSample(proj.name));
    setActiveJava(proj.java || generateJavaSample(proj.name));
    setActiveFlutter(proj.code || generateFlutterSample(proj.name));
    setActiveSwift(generateSwiftSample(proj.name));
    setUndoStack([]);
    setRedoStack([]);
  };

  // Open a tutorial directly into practice editor
  const handleOpenTutorial = (tut: TutorialItem) => {
    const newProj: ProjectItem = {
      id: tut.id,
      name: `${tut.title}.html`,
      lang: tut.lang || 'HTML',
      html: tut.html,
      css: tut.css,
      js: tut.js,
      kotlin: generateKotlinSample(tut.title),
      java: generateJavaSample(tut.title),
      createdAt: 'Tutorial',
      isOriginal: isOriginalTutorial(tut),
    };
    setActiveCustomFileContext(null);
    handleOpenProject(newProj);
  };

  // Save current editing project
  const handleSaveProject = () => {
    if (!activeProject) return;

    if (activeCustomFileContext) {
      const currentCode =
        editorSubTab === 'HTML'
          ? activeHtml
          : editorSubTab === 'Kotlin'
          ? activeKotlin
          : editorSubTab === 'Java'
          ? activeJava
          : editorSubTab === 'Flutter'
          ? activeFlutter
          : activeSwift;

      const updated = customProjects.map((proj) => {
        if (proj.id === activeCustomFileContext.projectId) {
          return {
            ...proj,
            files: proj.files.map((f) =>
              f.id === activeCustomFileContext.fileId ? { ...f, content: currentCode } : f
            ),
          };
        }
        return proj;
      });

      setCustomProjects(updated);
      try {
        localStorage.setItem('android_ide_custom_user_projects_v2', JSON.stringify(updated));
      } catch {}
      showToast('File code saved successfully!');
      return;
    }

    const updated = projects.map((p) =>
      p.id === activeProject.id
        ? { ...p, html: activeHtml, css: activeCss, js: activeJs, kotlin: activeKotlin, java: activeJava }
        : p
    );
    setProjects(updated);
    try {
      localStorage.setItem(`code_studio_projects_v5_${activePlatform}`, JSON.stringify(updated));
    } catch {}
    showToast(`"${activeProject.name}" saved successfully!`);
  };

  // Save all projects
  const handleSaveAllProjects = () => {
    try {
      const updated = activeProject ? projects.map((p) =>
        p.id === activeProject.id
          ? { ...p, html: activeHtml, css: activeCss, js: activeJs, kotlin: activeKotlin, java: activeJava }
          : p
      ) : projects;
      setProjects(updated);
      localStorage.setItem(`code_studio_projects_v5_${activePlatform}`, JSON.stringify(updated));
      showToast('All project code saved successfully to device storage!');
    } catch {
      showToast('Project code saved to memory!');
    }
  };

  // Download project as HTML file
  const handleDownloadProject = () => {
    if (!activeProject) return;
    handleDownloadSpecificProject(activeProject);
  };

  // Download any specific project as standalone HTML
  const handleDownloadSpecificProject = async (proj: ProjectItem) => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${proj.name}</title>
  <style>
${proj.id === activeProject?.id ? activeCss : proj.css}
  </style>
</head>
<body>
${proj.id === activeProject?.id ? activeHtml : proj.html}
  <script>
${proj.id === activeProject?.id ? activeJs : proj.js}
  </script>
</body>
</html>`;
    const fileName = proj.name.endsWith('.html') ? proj.name : `${proj.name}.html`;
    await triggerReliableDownload({
      textData: fullHtml,
      fileName,
      contentType: 'text/html;charset=utf-8',
    });
    showToast(`Saved "${proj.name}" to device / downloads!`);
  };

  // Run any project in preview
  const handleRunSingleProjectPreview = (proj: ProjectItem) => {
    const isCurrentlyActive = activeProject?.id === proj.id;
    const htmlToRun = isCurrentlyActive ? activeHtml : proj.html;
    const cssToRun = isCurrentlyActive ? activeCss : proj.css;
    const jsToRun = isCurrentlyActive ? activeJs : proj.js;

    const fullDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${proj.name}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 12px; background: #0f172a; color: #f8fafc; }
    ${cssToRun}
  </style>
</head>
<body>
  ${htmlToRun}
  <script>
    try {
      ${jsToRun}
    } catch (err) {
      console.error(err);
    }
  <\/script>
</body>
</html>`;
    setLivePreviewContent(fullDoc);
    setIsPreviewOpen(true);
  };

  // Export all projects as a ZIP file (including real > 1 MB installable debug APK)
  const handleExportAllProjectsZip = async () => {
    try {
      const zip = new JSZip();
      projects.forEach((p) => {
        const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${p.name}</title>
  <style>
${p.css}
  </style>
</head>
<body>
${p.html}
  <script>
${p.js}
  </script>
</body>
</html>`;
        const fileName = p.name.endsWith('.html') ? p.name : `${p.name}.html`;
        zip.file(fileName, fullHtml);
      });

      try {
        const { response: apkResp } = await fetchWithBackendFallback(`/api/download-ide-apk?t=${Date.now()}`, { cache: 'no-store' });
        if (apkResp.ok) {
          const apkBuf = await apkResp.arrayBuffer();
          if (apkBuf && apkBuf.byteLength > 1048576) {
            const realApkBytes = new Uint8Array(apkBuf);
            zip.file('build-outputs/app-debug.apk', realApkBytes, { binary: true, compression: 'STORE' });
            zip.file('APK DOWNLOAD/app-debug.apk', realApkBytes, { binary: true, compression: 'STORE' });
            zip.file('APK_DOWNLOAD/app-debug.apk', realApkBytes, { binary: true, compression: 'STORE' });
          }
        }
      } catch {}

      const blob = await zip.generateAsync({ type: 'blob' });
      await triggerReliableDownload({
        blob,
        fileName: `android_practice_projects_${Date.now()}.zip`,
        contentType: 'application/zip',
      });
      showToast(`Exported all ${projects.length} practice projects as ZIP!`);
    } catch (err) {
      console.error(err);
      showToast('Failed to export projects ZIP.');
    }
  };

  // Import code or file from device storage
  const handleImportFileFromGallery = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.html,.htm,.txt,.js,.css,.json,.kt,.dart,.java,.xml,image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const isImage = file.type.startsWith('image/');
      if (isImage) {
        const reader = new FileReader();
        reader.onload = (re) => {
          const dataUrl = re.target?.result as string;
          const cleanName = file.name.replace(/\.[^/.]+$/, '');
          const newProj: ProjectItem = {
            id: `custom_gallery_${Date.now()}`,
            name: `Gallery_${cleanName}.html`,
            lang: 'HTML',
            isOriginal: false,
            html: `<div style="text-align:center;padding:24px;background:#18181b;color:#fff;border-radius:16px;margin:20px auto;max-width:440px;">
  <span style="background:#0284c7;color:#fff;font-size:11px;font-weight:800;padding:4px 12px;border-radius:20px;">GALLERY ASSET</span>
  <h2 style="color:#38bdf8;margin:12px 0 6px 0;">${cleanName}</h2>
  <p style="color:#a1a1aa;font-size:13px;margin:0 0 16px 0;">${file.name}</p>
  <img src="${dataUrl}" alt="${file.name}" style="max-width:100%;max-height:260px;border-radius:12px;object-fit:contain;border:1px solid #27272a;" />
</div>`,
            css: `body { margin: 0; padding: 12px; background: #09090b; font-family: system-ui, sans-serif; }`,
            js: `console.log("Loaded asset: ${file.name}");`,
            createdAt: 'Imported',
          };
          setProjects((prev) => [newProj, ...prev]);
          handleOpenProject(newProj);
          showToast(`Imported "${file.name}" into Practice Editor!`);
        };
        reader.readAsDataURL(file);
      } else {
        const reader = new FileReader();
        reader.onload = (re) => {
          const text = (re.target?.result as string) || '';
          const newProj: ProjectItem = {
            id: `custom_import_${Date.now()}`,
            name: file.name.endsWith('.html') ? file.name : `${file.name}.html`,
            lang: 'HTML',
            isOriginal: false,
            html: text,
            css: '/* Imported code styling */\nbody { font-family: system-ui, sans-serif; padding: 16px; margin: 0; background: #0b0c10; color: #fff; }',
            js: '// Imported JavaScript logic\nconsole.log("Imported project running!");',
            createdAt: 'Imported',
          };
          setProjects((prev) => [newProj, ...prev]);
          handleOpenProject(newProj);
          showToast(`Imported "${file.name}" into Practice Editor!`);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // Import code directly into the active editor sub-tab
  const handleImportIntoActiveEditor = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.html,.htm,.css,.js,.txt,.json,.kt,.java,.dart,.swift';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (re) => {
        const text = (re.target?.result as string) || '';
        if (editorSubTab === 'HTML') setActiveHtml(text);
        else if (editorSubTab === 'Kotlin') setActiveKotlin(text);
        else if (editorSubTab === 'Java') setActiveJava(text);
        else if (editorSubTab === 'Flutter') setActiveFlutter(text);
        else setActiveSwift(text);
        showToast(`Loaded ${file.name} into ${editorSubTab} editor!`);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handledInitialModeRef = useRef<string | null>(null);

  // Handle initialMode triggered from dashboard
  useEffect(() => {
    if (!initialMode || handledInitialModeRef.current === initialMode) return;
    handledInitialModeRef.current = initialMode;
    if (initialMode === 'new') {
      setActiveProject(null);
      setIsCreateProjectModalOpen(true);
      setNewProjectNameInput('');
    } else if (initialMode === 'open') {
      setActiveProject(null);
      setActiveTab('projects');
      if (customProjects.length > 1) {
        setIsProjectFolderOpen(true);
      }
      showToast('All practice projects loaded! Select any project or file to edit.');
    } else if (initialMode === 'save' || initialMode === 'saved') {
      handleSaveAllProjects();
      if (!activeProject && projects.length > 0) {
        handleOpenProject(projects[0]);
      }
      showToast('Code saved successfully in practice storage!');
    } else if (initialMode === 'export') {
      handleExportAllProjectsZip();
    } else if (initialMode === 'import') {
      handleImportFileFromGallery();
    } else {
      // If initialMode is a specific project ID, open that project directly
      const matched = projects.find((p) => p.id === initialMode);
      if (matched) {
        handleOpenProject(matched);
      }
    }
  }, [initialMode]);

  // Run code in live preview
  const handleRunCode = () => {
    const activeCodeStr =
      editorSubTab === 'HTML'
        ? activeHtml
        : editorSubTab === 'Kotlin'
        ? activeKotlin
        : editorSubTab === 'Flutter'
        ? activeFlutter
        : editorSubTab === 'Java'
        ? activeJava
        : activeSwift;
    const activeFileExt =
      editorSubTab === 'HTML'
        ? 'index.html'
        : editorSubTab === 'Kotlin'
        ? 'MainActivity.kt'
        : editorSubTab === 'Flutter'
        ? 'main.dart'
        : editorSubTab === 'Java'
        ? 'MainActivity.java'
        : 'ContentView.swift';
    const projNameRaw = activeProject?.name || 'Calculator';
    const filesList = [
      { name: activeFileExt, content: activeCodeStr },
      ...(activeCss ? [{ name: 'style.css', content: activeCss }] : []),
      ...(activeJs ? [{ name: 'script.js', content: activeJs }] : []),
    ];
    const detection = detectAppCategory(activeCodeStr, activeFileExt, projNameRaw, filesList);
    const effectiveName = resolveEffectiveAppName(activeCodeStr, activeFileExt, projNameRaw, detection);
    const effectiveLogo = generateAppLogoPreviewDataUrl(detection.category, effectiveName, null);

    setPreviewAppName(effectiveName);
    setPreviewAppLogoUrl(effectiveLogo);
    setIsPreviewMenuOpen(false);

    if (editorSubTab === 'HTML') {
      const fullDoc = compileAppToStandaloneHtml({
        code: activeHtml,
        activeFileName: 'index.html',
        projectTitle: effectiveName,
        allFiles: filesList,
        appLogoUrl: effectiveLogo,
      });
      setLivePreviewContent(fullDoc);
      setIsPreviewOpen(true);
    } else if (editorSubTab === 'Kotlin') {
      const fullDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 16px; background: #090a10; color: #f8fafc; }
    .android-bar { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1f2438; padding-bottom: 12px; margin-bottom: 16px; }
    .android-title { font-size: 15px; font-weight: 800; color: #38bdf8; display: flex; align-items: center; gap: 8px; }
    .badge { background: #22c55e; color: #000; font-weight: 900; font-size: 11px; padding: 2px 8px; border-radius: 6px; }
    .card { background: #161926; border: 1px solid #23273c; border-radius: 14px; padding: 16px; margin-bottom: 16px; text-align: center; }
    .btn { background: #0284c7; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 800; font-size: 13px; cursor: pointer; }
    .btn:active { transform: scale(0.98); }
    .console-box { background: #06070a; border: 1px solid #1a1d2e; border-radius: 10px; padding: 12px; font-family: monospace; font-size: 12px; color: #4ade80; text-align: left; }
    .toast-msg { display: none; margin-top: 14px; background: rgba(34, 197, 94, 0.2); border: 1px solid #22c55e; color: #4ade80; padding: 8px; border-radius: 8px; font-size: 12px; font-weight: 700; }
  </style>
</head>
<body>
  <div class="android-bar">
    <div class="android-title">
      <span class="badge">KOTLIN</span>
      <span>${activeProject?.name || 'Practice App'}</span>
    </div>
    <span style="font-size: 11px; color: #94a3b8;">API 34 Simulated</span>
  </div>
  <div class="card">
    <h3 style="margin-top: 0; font-size: 16px;">Kotlin Android Application</h3>
    <p style="color: #94a3b8; font-size: 13px;">MainActivity executing Kotlin coroutines & lifecycle listeners.</p>
    <button class="btn" onclick="runAction()">Trigger Action Button</button>
    <div id="toast" class="toast-msg">Toast: Button clicked in Kotlin MainActivity!</div>
  </div>
  <div class="console-box" id="consoleLog">
    $ kotlinc MainActivity.kt -include-runtime -d app.jar<br>
    $ java -jar app.jar<br>
    [INFO] Activity created successfully.<br>
    [INFO] Interactive listeners registered.
  </div>
  <script>
    function runAction() {
      const t = document.getElementById('toast');
      t.style.display = 'block';
      const c = document.getElementById('consoleLog');
      c.innerHTML += '<br>[TOAST] Toast.makeText(this, "Kotlin action triggered", Toast.LENGTH_SHORT).show()';
      setTimeout(() => { t.style.display = 'none'; }, 2500);
    }
  <\/script>
</body>
</html>`;
      setLivePreviewContent(fullDoc);
      setIsPreviewOpen(true);
    } else if (editorSubTab === 'Flutter') {
      const fullDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 16px; background: #090a10; color: #f8fafc; }
    .flutter-bar { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1f2438; padding-bottom: 12px; margin-bottom: 16px; }
    .flutter-title { font-size: 15px; font-weight: 800; color: #38bdf8; display: flex; align-items: center; gap: 8px; }
    .badge { background: #0284c7; color: #fff; font-weight: 900; font-size: 11px; padding: 2px 8px; border-radius: 6px; }
    .card { background: #161926; border: 1px solid #23273c; border-radius: 14px; padding: 16px; margin-bottom: 16px; text-align: center; }
    .btn { background: #0284c7; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 800; font-size: 13px; cursor: pointer; }
    .btn:active { transform: scale(0.98); }
    .counter { font-size: 32px; font-weight: 900; color: #38bdf8; margin: 12px 0; }
  </style>
</head>
<body>
  <div class="flutter-bar">
    <div class="flutter-title">
      <span class="badge">FLUTTER</span>
      <span>\${activeProject?.name || 'Flutter App'}</span>
    </div>
    <span style="font-size: 11px; color: #94a3b8;">Dart 3.x Engine</span>
  </div>
  <div class="card">
    <h3 style="margin-top: 0; font-size: 16px;">Flutter Reactive Widget</h3>
    <div class="counter" id="flutterCount">0</div>
    <p style="color: #94a3b8; font-size: 13px;">StatefulWidget reactive UI with hot-reload simulated.</p>
    <button class="btn" onclick="inc()">setState() Counter +1</button>
  </div>
  <script>
    let c = 0;
    function inc() {
      c++;
      document.getElementById('flutterCount').innerText = c;
    }
  <\\/script>
</body>
</html>`;
      setLivePreviewContent(fullDoc);
      setIsPreviewOpen(true);
    } else if (editorSubTab === 'Swift') {
      const fullDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, system-ui, sans-serif; margin: 0; padding: 16px; background: #000000; color: #f8fafc; }
    .ios-bar { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #27272a; padding-bottom: 12px; margin-bottom: 16px; }
    .ios-title { font-size: 15px; font-weight: 800; color: #c084fc; display: flex; align-items: center; gap: 8px; }
    .badge { background: #a855f7; color: #fff; font-weight: 900; font-size: 11px; padding: 2px 8px; border-radius: 6px; }
    .card { background: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 20px; margin-bottom: 16px; text-align: center; }
    .btn { background: #007AFF; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; font-size: 14px; cursor: pointer; }
    .btn:active { opacity: 0.8; }
  </style>
</head>
<body>
  <div class="ios-bar">
    <div class="ios-title">
      <span class="badge">SWIFTUI</span>
      <span>\${activeProject?.name || 'iOS App'}</span>
    </div>
    <span style="font-size: 11px; color: #a1a1aa;">iOS 17 Simulator</span>
  </div>
  <div class="card">
    <h3 style="margin-top: 0; font-size: 17px;">SwiftUI Declarative View</h3>
    <p style="color: #a1a1aa; font-size: 13px;">View protocol with @State & Animation modifiers.</p>
    <button class="btn" onclick="toggle()">withAnimation { toggle() }</button>
    <div id="iosStatus" style="margin-top: 14px; font-size: 13px; color: #38bdf8; font-weight: 600;">State: Active</div>
  </div>
  <script>
    let active = true;
    function toggle() {
      active = !active;
      const el = document.getElementById('iosStatus');
      el.innerText = active ? 'State: Active (withAnimation)' : 'State: Toggled (Spring)';
      el.style.color = active ? '#38bdf8' : '#ec4899';
    }
  <\\/script>
</body>
</html>`;
      setLivePreviewContent(fullDoc);
      setIsPreviewOpen(true);
    } else {
      const fullDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 16px; background: #090a10; color: #f8fafc; }
    .android-bar { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1f2438; padding-bottom: 12px; margin-bottom: 16px; }
    .android-title { font-size: 15px; font-weight: 800; color: #f87171; display: flex; align-items: center; gap: 8px; }
    .badge { background: #ef4444; color: #fff; font-weight: 900; font-size: 11px; padding: 2px 8px; border-radius: 6px; }
    .card { background: #161926; border: 1px solid #23273c; border-radius: 14px; padding: 16px; margin-bottom: 16px; text-align: center; }
    .btn { background: #dc2626; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 800; font-size: 13px; cursor: pointer; }
    .btn:active { transform: scale(0.98); }
    .console-box { background: #06070a; border: 1px solid #1a1d2e; border-radius: 10px; padding: 12px; font-family: monospace; font-size: 12px; color: #fca5a5; text-align: left; }
    .toast-msg { display: none; margin-top: 14px; background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #fca5a5; padding: 8px; border-radius: 8px; font-size: 12px; font-weight: 700; }
  </style>
</head>
<body>
  <div class="android-bar">
    <div class="android-title">
      <span class="badge">JAVA</span>
      <span>${activeProject?.name || 'Practice App'}</span>
    </div>
    <span style="font-size: 11px; color: #94a3b8;">API 34 Simulated</span>
  </div>
  <div class="card">
    <h3 style="margin-top: 0; font-size: 16px;">Java Android Application</h3>
    <p style="color: #94a3b8; font-size: 13px;">MainActivity extending AppCompatActivity with Java 17.</p>
    <button class="btn" onclick="runAction()">Trigger Action Button</button>
    <div id="toast" class="toast-msg">Toast: Button clicked in Java MainActivity!</div>
  </div>
  <div class="console-box" id="consoleLog">
    $ javac MainActivity.java<br>
    $ java MainActivity<br>
    [INFO] Activity created successfully.<br>
    [INFO] View click listener active.
  </div>
  <script>
    function runAction() {
      const t = document.getElementById('toast');
      t.style.display = 'block';
      const c = document.getElementById('consoleLog');
      c.innerHTML += '<br>[TOAST] Toast.makeText(MainActivity.this, "Java action triggered", Toast.LENGTH_SHORT).show()';
      setTimeout(() => { t.style.display = 'none'; }, 2500);
    }
  <\/script>
</body>
</html>`;
      setLivePreviewContent(fullDoc);
      setIsPreviewOpen(true);
    }
  };

  // Active code helper for practice editor
  const currentActiveCode =
    editorSubTab === 'HTML'
      ? activeHtml
      : editorSubTab === 'Kotlin'
      ? activeKotlin
      : editorSubTab === 'Java'
      ? activeJava
      : editorSubTab === 'Flutter'
      ? activeFlutter
      : activeSwift;

  const setActiveCode = (newVal: string) => {
    if (editorSubTab === 'HTML') setActiveHtml(newVal);
    else if (editorSubTab === 'Kotlin') setActiveKotlin(newVal);
    else if (editorSubTab === 'Java') setActiveJava(newVal);
    else if (editorSubTab === 'Flutter') setActiveFlutter(newVal);
    else setActiveSwift(newVal);
  };

  const handleUserCodeChange = (newVal: string) => {
    if (!isEditorFileSelected) {
      setIsEditorFileSelected(true);
    }
    if (!isUndoRedoActiveRef.current && newVal !== currentActiveCode) {
      setUndoStack((prev) => [...prev.slice(-49), currentActiveCode]);
      setRedoStack([]);
    }
    isUndoRedoActiveRef.current = false;
    setActiveCode(newVal);
  };

  const handleUndo = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((s) => s.slice(0, s.length - 1));
    setRedoStack((r) => [...r.slice(-49), currentActiveCode]);
    isUndoRedoActiveRef.current = true;
    setActiveCode(prev);
    if (editorTextareaRef.current && document.activeElement !== editorTextareaRef.current) {
      editorTextareaRef.current.focus();
    }
  };

  const handleRedo = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((r) => r.slice(0, r.length - 1));
    setUndoStack((s) => [...s.slice(-49), currentActiveCode]);
    isUndoRedoActiveRef.current = true;
    setActiveCode(next);
    if (editorTextareaRef.current && document.activeElement !== editorTextareaRef.current) {
      editorTextareaRef.current.focus();
    }
  };

  const handleMoveCursor = (dir: 'left' | 'right' | 'up' | 'down') => {
    const textarea = editorTextareaRef.current;
    if (!textarea) return;
    textarea.focus();
    const val = textarea.value;
    const start = textarea.selectionStart;

    if (dir === 'left') {
      const nextPos = Math.max(0, start - 1);
      textarea.setSelectionRange(nextPos, nextPos);
    } else if (dir === 'right') {
      const nextPos = Math.min(val.length, start + 1);
      textarea.setSelectionRange(nextPos, nextPos);
    } else if (dir === 'up') {
      const lines = val.substring(0, start).split('\n');
      const currentLineIdx = lines.length - 1;
      const currentCol = lines[currentLineIdx].length;
      if (currentLineIdx > 0) {
        const allLines = val.split('\n');
        const targetLine = allLines[currentLineIdx - 1];
        let pos = 0;
        for (let i = 0; i < currentLineIdx - 1; i++) pos += allLines[i].length + 1;
        const targetCol = Math.min(currentCol, targetLine.length);
        pos += targetCol;
        textarea.setSelectionRange(pos, pos);
      } else {
        textarea.setSelectionRange(0, 0);
      }
    } else if (dir === 'down') {
      const lines = val.substring(0, start).split('\n');
      const currentLineIdx = lines.length - 1;
      const currentCol = lines[currentLineIdx].length;
      const allLines = val.split('\n');
      if (currentLineIdx < allLines.length - 1) {
        let pos = 0;
        for (let i = 0; i <= currentLineIdx; i++) pos += allLines[i].length + 1;
        const targetLine = allLines[currentLineIdx + 1];
        const targetCol = Math.min(currentCol, targetLine.length);
        pos += targetCol;
        textarea.setSelectionRange(pos, pos);
      } else {
        textarea.setSelectionRange(val.length, val.length);
      }
    }
  };

  // 4-Way Reordering (Left, Right, Up, Down between Row 1 and Row 2)
  const moveSymbol = (fromRow: 1 | 2, fromIdx: number, toRow: 1 | 2, toIdx: number) => {
    if (fromRow === toRow && fromIdx === toIdx) return;

    if (fromRow === 1 && toRow === 1) {
      const updated = [...row1Symbols];
      const [moved] = updated.splice(fromIdx, 1);
      updated.splice(toIdx, 0, moved);
      setRow1Symbols(updated);
    } else if (fromRow === 2 && toRow === 2) {
      const updated = [...row2Symbols];
      const [moved] = updated.splice(fromIdx, 1);
      updated.splice(toIdx, 0, moved);
      setRow2Symbols(updated);
    } else if (fromRow === 1 && toRow === 2) {
      const r1 = [...row1Symbols];
      const r2 = [...row2Symbols];
      const [moved] = r1.splice(fromIdx, 1);
      r2.splice(toIdx, 0, moved);
      setRow1Symbols(r1);
      setRow2Symbols(r2);
    } else if (fromRow === 2 && toRow === 1) {
      const r1 = [...row1Symbols];
      const r2 = [...row2Symbols];
      const [moved] = r2.splice(fromIdx, 1);
      r1.splice(toIdx, 0, moved);
      setRow1Symbols(r1);
      setRow2Symbols(r2);
    }
  };

  const handleSymbolDragStart = (e: React.DragEvent, row: 1 | 2, index: number, sym: string) => {
    setDragState({ row, index, symbol: sym });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${row}:${index}`);
  };

  const handleSymbolDragOver = (e: React.DragEvent, targetRow: 1 | 2, targetIdx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!dragState) return;
    if (dragState.row === targetRow && dragState.index === targetIdx) return;

    moveSymbol(dragState.row, dragState.index, targetRow, targetIdx);
    setDragState({ row: targetRow, index: targetIdx, symbol: dragState.symbol });
  };

  const handleSymbolDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragState(null);
    try {
      localStorage.setItem('android_ide_symbols_v10_row1', JSON.stringify(row1Symbols));
      localStorage.setItem('android_ide_symbols_v10_row2', JSON.stringify(row2Symbols));
    } catch {}
  };

  const handleSymbolTouchStart = (e: React.TouchEvent, row: 1 | 2, index: number, sym: string) => {
    const touch = e.touches[0];
    touchDragRef.current = {
      row,
      index,
      symbol: sym,
      startX: touch.clientX,
      startY: touch.clientY,
      isDragging: false,
    };

    if (sym === 'Tab' || sym === '␣') {
      tabHoldTriggeredRef.current = false;
      setIsTabHolding(true);
      if (tabPressTimerRef.current) clearTimeout(tabPressTimerRef.current);

      tabPressTimerRef.current = setTimeout(() => {
        tabHoldTriggeredRef.current = true;
        setIsTabHolding(false);
        setTabInputVal(String(tabSpaces));
        setIsTabConfigOpen(true);
      }, 500);
    }
  };

  const handleSymbolTouchMove = (e: React.TouchEvent) => {
    if (!touchDragRef.current) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchDragRef.current.startX);
    const dy = Math.abs(touch.clientY - touchDragRef.current.startY);

    if (dx > 7 || dy > 7) {
      if (tabPressTimerRef.current) {
        clearTimeout(tabPressTimerRef.current);
        tabPressTimerRef.current = null;
      }
      setIsTabHolding(false);
    }

    if (!touchDragRef.current.isDragging) {
      if (dx > 7 || dy > 7) {
        touchDragRef.current.isDragging = true;
        setDragState({
          row: touchDragRef.current.row,
          index: touchDragRef.current.index,
          symbol: touchDragRef.current.symbol,
        });
      } else {
        return;
      }
    }

    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!elem) return;
    const btn = elem.closest('[data-symbol-key="true"]');
    if (!btn) return;
    const rowAttr = btn.getAttribute('data-row');
    const indexAttr = btn.getAttribute('data-index');
    if (rowAttr && indexAttr) {
      const targetRow = parseInt(rowAttr, 10) as 1 | 2;
      const targetIdx = parseInt(indexAttr, 10);
      if (touchDragRef.current.row !== targetRow || touchDragRef.current.index !== targetIdx) {
        moveSymbol(touchDragRef.current.row, touchDragRef.current.index, targetRow, targetIdx);
        touchDragRef.current.row = targetRow;
        touchDragRef.current.index = targetIdx;
        setDragState({
          row: targetRow,
          index: targetIdx,
          symbol: touchDragRef.current.symbol,
        });
      }
    }
  };

  const handleSymbolTouchEnd = (sym: string) => {
    if (tabPressTimerRef.current) {
      clearTimeout(tabPressTimerRef.current);
      tabPressTimerRef.current = null;
    }
    setIsTabHolding(false);

    if (touchDragRef.current) {
      const wasDragging = touchDragRef.current.isDragging;
      touchDragRef.current = null;
      setDragState(null);

      if (tabHoldTriggeredRef.current) {
        tabHoldTriggeredRef.current = false;
        return;
      }

      if (wasDragging) {
        try {
          localStorage.setItem('android_ide_symbols_v10_row1', JSON.stringify(row1Symbols));
          localStorage.setItem('android_ide_symbols_v10_row2', JSON.stringify(row2Symbols));
        } catch {}
      } else {
        insertSymbol(sym);
      }
    }
  };

  const handleSymbolMouseDown = (sym: string) => {
    if (sym === 'Tab' || sym === '␣') {
      tabHoldTriggeredRef.current = false;
      setIsTabHolding(true);
      if (tabPressTimerRef.current) clearTimeout(tabPressTimerRef.current);

      tabPressTimerRef.current = setTimeout(() => {
        tabHoldTriggeredRef.current = true;
        setIsTabHolding(false);
        setTabInputVal(String(tabSpaces));
        setIsTabConfigOpen(true);
      }, 500);
    }
  };

  const handleSymbolMouseUp = (sym: string) => {
    if (sym === 'Tab' || sym === '␣') {
      if (tabPressTimerRef.current) {
        clearTimeout(tabPressTimerRef.current);
        tabPressTimerRef.current = null;
      }
      setIsTabHolding(false);
    }
  };

  const handleResetSymbols = () => {
    const [def1, def2] = alignSymbolPairs(DEFAULT_ROW1_SYMBOLS, DEFAULT_ROW2_SYMBOLS);
    setRow1Symbols(def1);
    setRow2Symbols(def2);
    try {
      localStorage.setItem('android_ide_symbols_v10_row1', JSON.stringify(def1));
      localStorage.setItem('android_ide_symbols_v10_row2', JSON.stringify(def2));
    } catch {}
    showToast('Symbols reset to default layout');
  };

  // Insert symbol at cursor with bracket wrapping and smart interior cursor offsets
  const insertSymbol = (sym: string) => {
    if (!editorTextareaRef.current) return;
    const textarea = editorTextareaRef.current;

    if (document.activeElement !== textarea) {
      textarea.focus();
    }

    const code = currentActiveCode;
    const start = textarea.selectionStart ?? code.length;
    const end = textarea.selectionEnd ?? code.length;
    const selectedText = code.substring(start, end);

    let insertText = sym;
    let cursorOffset = sym.length;

    if (sym === 'Tab' || sym === '\\t') {
      const spaces = ' '.repeat(tabSpaces);
      insertText = spaces;
      cursorOffset = spaces.length;
    } else if (sym === '\\n') {
      insertText = '\n';
      cursorOffset = 1;
    } else if (sym === '␣') {
      insertText = spaceMode === 'double' ? '  ' : ' ';
      cursorOffset = insertText.length;
    } else if (selectedText.length > 0) {
      const pairs: Record<string, [string, string]> = {
        '{}': ['{', '}'],
        '()': ['(', ')'],
        '[]': ['[', ']'],
        '<>': ['<', '>'],
        '""': ['"', '"'],
        "''": ["'", "'"],
        '``': ['`', '`'],
        '${}': ['${', '}'],
        '$()': ['$(', ')'],
        '#{}': ['#{', '}'],
        '{{}}': ['{{', '}}'],
        '<!-- -->': ['<!-- ', ' -->'],
        '/* */': ['/* ', ' */'],
      };
      if (pairs[sym]) {
        const [open, close] = pairs[sym];
        insertText = open + selectedText + close;
        cursorOffset = insertText.length;
      }
    } else {
      const interiorOffsets: Record<string, number> = {
        '{}': 1,
        '()': 1,
        '[]': 1,
        '<>': 1,
        '""': 1,
        "''": 1,
        '``': 1,
        '${}': 2,
        '$()': 2,
        '#{}': 2,
        '{{}}': 2,
        '(( ))': 3,
        '[[ ]]': 3,
        '{{ }}': 3,
        '<< >>': 3,
        '<!-- -->': 5,
        '/* */': 3,
        'print()': 6,
        'println()': 8,
        'console.log()': 12,
        'Log.d()': 6,
        'build()': 6,
        'setState()': 9,
        'useState()': 9,
        'useEffect()': 10,
      };
      if (interiorOffsets[sym] !== undefined) {
        cursorOffset = interiorOffsets[sym];
      }
    }

    if (!isEditorFileSelected) {
      setIsEditorFileSelected(true);
    }
    if (!isUndoRedoActiveRef.current) {
      setUndoStack((prev) => [...prev.slice(-49), code]);
      setRedoStack([]);
    }
    isUndoRedoActiveRef.current = false;

    const before = code.substring(0, start);
    const after = code.substring(end);
    const newCode = before + insertText + after;
    setActiveCode(newCode);

    const newCursorPos = start + cursorOffset;
    const currentScrollTop = textarea.scrollTop;
    const currentScrollLeft = textarea.scrollLeft;
    requestAnimationFrame(() => {
      if (editorTextareaRef.current) {
        editorTextareaRef.current.focus({ preventScroll: true });
        editorTextareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        editorTextareaRef.current.scrollTop = currentScrollTop;
        editorTextareaRef.current.scrollLeft = currentScrollLeft;
      }
    });
  };

  const scrollSymbols = (offset: number) => {
    if (symbolScrollRef.current) {
      symbolScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Create new project from clean New Project modal
  const handleConfirmCreateProject = () => {
    const rawName = newProjectNameInput.trim() || `Project_${customProjects.length + 1}`;
    const cleanProjName = rawName.replace(/\.(html|kt|java|dart|swift|gradle)$/i, '');

    const newCustomProj: CustomProject = {
      id: `custom_proj_${Date.now()}`,
      name: cleanProjName,
      lang: 'Project',
      createdAt: 'Just now',
      files: createDefaultProjectFiles(cleanProjName),
    };

    const nextCustomProjects = [newCustomProj, ...customProjects];
    setCustomProjects(nextCustomProjects);
    setActiveCustomProjectId(newCustomProj.id);
    try {
      localStorage.setItem('android_ide_custom_user_projects_v4', JSON.stringify(nextCustomProjects));
      // Also register in android_ide_user_projects so it appears in OPEN PROJECT screen too
      const savedUserProjsRaw = localStorage.getItem('android_ide_user_projects');
      const userProjsList: any[] = savedUserProjsRaw ? JSON.parse(savedUserProjsRaw) : [];
      if (!userProjsList.some((p) => (p.name || '').toLowerCase() === cleanProjName.toLowerCase())) {
        userProjsList.unshift({
          id: newCustomProj.id,
          name: cleanProjName.toUpperCase(),
          platform: activePlatform,
          badge: activePlatform.toUpperCase(),
          badgeColor: activePlatform === 'flutter' ? '#0ea5e9' : '#22c55e',
          desc: `Custom ${activePlatform.toUpperCase()} project`,
          tech: activePlatform === 'flutter' ? ['Dart', 'Flutter'] : ['Kotlin', 'Java', 'HTML'],
          icon: activePlatform === 'flutter' ? 'fa-mobile-screen' : 'fa-robot',
          iconBg: activePlatform === 'flutter' ? '#0ea5e9' : '#3DDC84',
          appLogoUrl: null,
          isCustom: true,
          lastOpened: new Date().toLocaleDateString(),
        });
        localStorage.setItem('android_ide_user_projects', JSON.stringify(userProjsList));
      }
    } catch {}

    setIsCreateProjectModalOpen(false);
    setNewProjectNameInput('');
    setActiveTab('projects');
    setActiveProject(null);
    setProjectFileCategory('Kotlin');
    setProjectFilePage(0);
    showToast(`Project "${cleanProjName}" created with Kotlin, Java, HTML, CSS, JS & Build Gradle files!`);
  };

  // Create new file inside a project
  const handleConfirmCreateFileInProject = () => {
    if (!targetProjectForFile) return;
    const rawName = newFileInProjName.trim() || `File_${targetProjectForFile.files.length + 1}`;
    let ext = '.html';
    if (newFileInProjLang === 'CSS') ext = '.css';
    else if (newFileInProjLang === 'Java') ext = '.java';
    else if (newFileInProjLang === 'JS') ext = '.js';
    else if (newFileInProjLang === 'Gradle') ext = '.gradle';
    else if (newFileInProjLang === 'Kotlin') ext = '.kt';
    else if (newFileInProjLang === 'Dart') ext = '.dart';
    else if (newFileInProjLang === 'Swift') ext = '.swift';

    const finalFileName = rawName.endsWith(ext) ? rawName : `${rawName}${ext}`;

    const newFile: CustomProjectFile = {
      id: `file_${Date.now()}`,
      name: finalFileName,
      lang: newFileInProjLang,
      content: getDefaultFileContent(finalFileName, newFileInProjLang),
      createdAt: 'Just now',
      isOriginal: false,
    };

    const updatedProjects = customProjects.map((p) => {
      if (p.id === targetProjectForFile.id) {
        return {
          ...p,
          files: [newFile, ...p.files],
        };
      }
      return p;
    });

    setCustomProjects(updatedProjects);
    try {
      localStorage.setItem('android_ide_custom_user_projects_v4', JSON.stringify(updatedProjects));
    } catch {}

    // Switch view to match this file's category
    if (newFileInProjLang === 'Kotlin') setProjectFileCategory('Kotlin');
    else if (newFileInProjLang === 'CSS') setProjectFileCategory('CSS');
    else if (newFileInProjLang === 'Java') setProjectFileCategory('Java');
    else if (newFileInProjLang === 'JS') setProjectFileCategory('JS');
    else if (newFileInProjLang === 'Gradle') setProjectFileCategory('Gradle');
    else setProjectFileCategory('HTML');
    setProjectFilePage(0);

    setIsCreateFileInProjModalOpen(false);
    setNewFileInProjName('');
    showToast(`Created file "${finalFileName}" in "${targetProjectForFile.name}"!`);
  };

  // Open a file from customProjects inside practice editor (Shows Project Name in top badge; code only shows when a file chip in Bar 2 is selected)
  const handleOpenCustomProjectFile = (project: CustomProject, file: CustomProjectFile) => {
    const adapterProj: ProjectItem = {
      id: `custom_file_${file.id}`,
      name: project.name,
      lang: file.lang,
      html: file.lang === 'HTML' ? file.content : `<div style="padding: 20px; color: #fff; font-family: monospace;"><h3>${file.name}</h3><pre>${file.content.replace(/</g, '&lt;')}</pre></div>`,
      css: file.lang === 'CSS' ? file.content : '',
      js: file.lang === 'JS' ? file.content : '',
      kotlin: file.lang === 'Kotlin' || file.lang === 'Gradle' ? file.content : '',
      java: file.lang === 'Java' ? file.content : '',
      createdAt: file.createdAt,
      isOriginal: file.isOriginal ?? false,
      code: file.content,
    };

    setOpenedProjectName(project.name);
    setActiveCustomFileContext({ projectId: project.id, fileId: file.id });
    setActiveProject(adapterProj);
    setSelectedBarFileId(null);
    setIsEditorFileSelected(false);

    if (file.lang === 'Kotlin' || file.lang === 'Gradle') setEditorSubTab('Kotlin');
    else if (file.lang === 'Java') setEditorSubTab('Java');
    else if (file.lang === 'Dart') setEditorSubTab('Flutter');
    else if (file.lang === 'Swift') setEditorSubTab('Swift');
    else setEditorSubTab('HTML');

    setActiveHtml(adapterProj.html);
    setActiveKotlin(file.lang === 'Kotlin' || file.lang === 'Gradle' ? file.content : generateKotlinSample(file.name));
    setActiveJava(file.lang === 'Java' ? file.content : generateJavaSample(file.name));
    setActiveFlutter(file.lang === 'Dart' ? file.content : generateFlutterSample(file.name));
    setActiveSwift(file.lang === 'Swift' ? file.content : generateSwiftSample(file.name));
    setIsPreviewOpen(false);
    setIsTopMenuOpen(false);
    setUndoStack([]);
    setRedoStack([]);
  };

  // Unified In-App Delete Execution Handler
  const handleExecuteDelete = () => {
    if (!deleteConfirmItem) return;
    const { type, id, parentId, name } = deleteConfirmItem;

    if (type === 'project') {
      const targetProj = customProjects.find((p) => p.id === id);
      if (targetProj && (targetProj.id === 'custom_proj_welcome' || targetProj.createdAt === 'Default')) {
        setDeleteConfirmItem(null);
        showToast('Protected original project cannot be deleted!');
        return;
      }
      const updated = customProjects.filter((p) => p.id !== id);
      const nextList =
        updated.length > 0
          ? updated
          : [
              {
                id: 'custom_proj_welcome',
                name: 'Welcome',
                lang: 'Project',
                createdAt: 'Default',
                files: createDefaultProjectFiles('Welcome'),
              },
            ];
      setCustomProjects(nextList);
      try {
        localStorage.setItem('android_ide_custom_user_projects_v4', JSON.stringify(nextList));
      } catch {}
      if (activeCustomProjectId === id) {
        setActiveCustomProjectId(nextList[0]?.id || 'custom_proj_welcome');
        setProjectFilePage(0);
      }
      if (activeCustomFileContext?.projectId === id) {
        setActiveCustomFileContext(null);
        setActiveProject(null);
      }
      showToast(`Deleted project "${name}" and all its files!`);
    } else if (type === 'file' && parentId) {
      const parentProj = customProjects.find((p) => p.id === parentId);
      const targetFile = parentProj?.files.find((f) => f.id === id);
      if (targetFile?.isOriginal) {
        setDeleteConfirmItem(null);
        showToast('Protected original file cannot be deleted!');
        return;
      }
      const updated = customProjects.map((p) => {
        if (p.id === parentId) {
          return {
            ...p,
            files: p.files.filter((f) => f.id !== id),
          };
        }
        return p;
      });
      setCustomProjects(updated);
      try {
        localStorage.setItem('android_ide_custom_user_projects_v4', JSON.stringify(updated));
      } catch {}
      if (activeCustomFileContext?.fileId === id) {
        setActiveCustomFileContext(null);
        setActiveProject(null);
      }
      showToast(`Deleted file "${name}"!`);
    } else if (type === 'practice_file') {
      // Check if this is an adapter item for a custom project file (id starts with custom_file_)
      if (id.startsWith('custom_file_')) {
        const realFileId = id.replace(/^custom_file_/, '');
        let foundOriginal = false;
        const updatedCustomProjs = customProjects.map((p) => {
          const matchFile = p.files.find((f) => f.id === realFileId);
          if (matchFile) {
            if (matchFile.isOriginal) {
              foundOriginal = true;
              return p;
            }
            return {
              ...p,
              files: p.files.filter((f) => f.id !== realFileId),
            };
          }
          return p;
        });
        if (foundOriginal) {
          setDeleteConfirmItem(null);
          showToast('Protected original file cannot be deleted!');
          return;
        }
        setCustomProjects(updatedCustomProjs);
        try {
          localStorage.setItem('android_ide_custom_user_projects_v4', JSON.stringify(updatedCustomProjs));
        } catch {}
        if (activeProject?.id === id || activeCustomFileContext?.fileId === realFileId) {
          setActiveCustomFileContext(null);
          setActiveProject(null);
        }
        setDeleteConfirmItem(null);
        showToast(`Deleted file "${name}"!`);
        return;
      }

      // Check if this is a custom tutorial opened in the editor
      if (id.startsWith('tut_')) {
        const targetTut = tutorialsList.find((t) => t.id === id);
        if (targetTut && isOriginalTutorial(targetTut)) {
          setDeleteConfirmItem(null);
          showToast('Protected original tutorial cannot be deleted!');
          return;
        }
        const updatedTuts = tutorialsList.filter((t) => t.id !== id);
        setTutorialsList(updatedTuts);
        try {
          localStorage.setItem(`code_studio_tutorials_v2_${activePlatform}`, JSON.stringify(updatedTuts));
        } catch {}
        if (activeProject?.id === id) {
          setActiveProject(null);
        }
        setDeleteConfirmItem(null);
        showToast(`Deleted tutorial "${name}"!`);
        return;
      }

      const target = projects.find((p) => p.id === id);
      if (target && isOriginalProject(target)) {
        setDeleteConfirmItem(null);
        showToast('Protected original file cannot be deleted!');
        return;
      }
      const updated = projects.filter((p) => p.id !== id);
      setProjects(updated);
      try {
        localStorage.setItem(`code_studio_projects_v5_${activePlatform}`, JSON.stringify(updated));
      } catch {}
      if (activeProject?.id === id) {
        setActiveProject(null);
      }
      showToast(`Deleted "${name}"!`);
    } else if (type === 'tutorial') {
      const targetTut = tutorialsList.find((t) => t.id === id);
      if (targetTut && isOriginalTutorial(targetTut)) {
        setDeleteConfirmItem(null);
        showToast('Protected original tutorial cannot be deleted!');
        return;
      }
      const updated = tutorialsList.filter((t) => t.id !== id);
      setTutorialsList(updated);
      try {
        localStorage.setItem(`code_studio_tutorials_v2_${activePlatform}`, JSON.stringify(updated));
      } catch {}
      if (activeProject?.id === id) {
        setActiveProject(null);
      }
      showToast(`Deleted tutorial "${name}"!`);
    } else if (type === 'block') {
      const targetBlk = blocksList.find((b) => b.id === id);
      if (targetBlk && isOriginalBlock(targetBlk)) {
        setDeleteConfirmItem(null);
        showToast('Protected original layout block cannot be deleted!');
        return;
      }
      const updated = blocksList.filter((b) => b.id !== id);
      setBlocksList(updated);
      try {
        localStorage.setItem(`code_studio_blocks_v2_${activePlatform}`, JSON.stringify(updated));
      } catch {}
      showToast(`Deleted layout block "${name}"!`);
    }

    setDeleteConfirmItem(null);
  };

  // Create new tutorial from modal
  const handleConfirmCreateTutorial = () => {
    const title = newTutorialTitleInput.trim() || `Tutorial ${tutorialsList.length + 1}`;
    const desc = newTutorialDescInput.trim() || 'Custom step-by-step tutorial guide.';
    const targetLang = newTutorialLangInput || (tutorialSectorFilter === 'all' ? 'Kotlin' : tutorialSectorFilter);

    const newTut: TutorialItem = {
      id: `tut_custom_${Date.now()}`,
      title,
      description: desc,
      icon: newTutorialIcon,
      lang: targetLang,
      html: `<div class="tut-component">\n  <h2>${title}</h2>\n  <p>${desc}</p>\n  <button onclick="this.innerText='Completed Step!'">Run Interactive Step</button>\n</div>`,
      css: `.tut-component {\n  padding: 24px;\n  background: linear-gradient(135deg, #064e3b 0%, #047857 100%);\n  color: #fff;\n  border-radius: 14px;\n  text-align: center;\n  box-shadow: 0 8px 24px rgba(0,0,0,0.4);\n}\n.tut-component button {\n  background: #fff;\n  color: #064e3b;\n  font-weight: 700;\n  border: none;\n  padding: 10px 18px;\n  border-radius: 8px;\n  cursor: pointer;\n  margin-top: 12px;\n}`,
      js: `console.log("Tutorial ${title} active");`,
    };

    const nextList = [newTut, ...tutorialsList];
    setTutorialsList(nextList);
    try {
      localStorage.setItem(`code_studio_tutorials_v2_${activePlatform}`, JSON.stringify(nextList));
    } catch {}
    setTutorialSectorFilter(targetLang);
    setTutorialPage(0);
    setIsCreateTutorialModalOpen(false);
    setNewTutorialTitleInput('');
    setNewTutorialDescInput('');
    showToast(`Created new ${targetLang} tutorial: "${title}"!`);
  };

  // Create new block
  const handleConfirmCreateBlock = () => {
    const name = newBlockNameInput.trim() || `Custom Block ${blocksList.length + 1}`;
    const summary = newBlockSummaryInput.trim() || 'Custom visual block component';
    const targetType = newBlockTypeInput === 'state' ? 'logic' : newBlockTypeInput;

    const newBlock: BlockItem = {
      id: `blk_custom_${Date.now()}`,
      name,
      type: targetType,
      summary,
      htmlSnippet: `<div class="custom-block-elem">\n  <h3>${name}</h3>\n  <p>${summary}</p>\n</div>`,
      cssSnippet: `.custom-block-elem {\n  padding: 18px;\n  background: #1f2030;\n  border: 1px solid #333650;\n  border-radius: 12px;\n  text-align: center;\n  color: #fff;\n}`,
      jsSnippet: `console.log("Custom block ${name} executed");`,
    };

    setBlocksList([newBlock, ...blocksList]);
    setLayoutCategoryFilter(targetType);
    setIsCreateBlockModalOpen(false);
    setNewBlockNameInput('');
    setNewBlockSummaryInput('');
    showToast(`Added ${targetType.toUpperCase()} layout block: ${name}`);
  };

  // Drag & Drop handlers for Blocks reordering
  const handleBlockDragStart = (e: React.DragEvent, index: number) => {
    setDraggedBlockIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleBlockDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverBlockIndex(index);
  };

  const handleBlockDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedBlockIndex === null || draggedBlockIndex === targetIndex) {
      setDraggedBlockIndex(null);
      setDragOverBlockIndex(null);
      return;
    }

    const updated = [...blocksList];
    const [movedBlock] = updated.splice(draggedBlockIndex, 1);
    updated.splice(targetIndex, 0, movedBlock);

    setBlocksList(updated);
    setDraggedBlockIndex(null);
    setDragOverBlockIndex(null);
    showToast(`Moved "${movedBlock.name}" to position ${targetIndex + 1}!`);
  };

  const handleBlockDragEnd = () => {
    setDraggedBlockIndex(null);
    setDragOverBlockIndex(null);
  };

  const handleMoveBlockUp = (index: number) => {
    if (index <= 0) return;
    const updated = [...blocksList];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setBlocksList(updated);
    showToast(`Moved "${temp.name}" up!`);
  };

  const handleMoveBlockDown = (index: number) => {
    if (index >= blocksList.length - 1) return;
    const updated = [...blocksList];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setBlocksList(updated);
    showToast(`Moved "${temp.name}" down!`);
  };

  const handleDuplicateBlock = (block: BlockItem) => {
    const dup: BlockItem = {
      ...block,
      id: `blk_${Date.now()}`,
      name: `${block.name} (Copy)`,
    };
    setBlocksList([...blocksList, dup]);
    setContextBlock(null);
    showToast(`Duplicated ${block.name}!`);
  };

  const handleDeleteBlock = (block: BlockItem) => {
    setContextBlock(null);
    setDeleteConfirmItem({
      type: 'block',
      id: block.id,
      name: block.name,
    });
  };

  const handleShareBlock = async (block: BlockItem) => {
    const blockCode = `<!-- Layout Block: ${block.name} (${block.type}) -->\n${block.htmlSnippet}\n<style>\n${block.cssSnippet || ''}\n</style>\n<script>\n${block.jsSnippet || ''}\n</script>`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Layout Block: ${block.name}`,
          text: `Layout Block "${block.name}" (${block.type}):\n${block.summary}\n\n${blockCode.slice(0, 1500)}`,
        });
        showToast(`Shared layout "${block.name}"!`);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(blockCode);
      showToast(`Layout code for "${block.name}" copied to clipboard! Ready to share.`);
    } catch {
      showToast(`Ready to share "${block.name}"!`);
    }
  };

  const handleDeleteTutorial = (tut: TutorialItem) => {
    setContextTutorial(null);
    setDeleteConfirmItem({
      type: 'tutorial',
      id: tut.id,
      name: tut.title,
    });
  };

  const handleShareTutorial = async (tut: TutorialItem) => {
    const codeContent = tut.html + (tut.css ? `\n<style>\n${tut.css}\n</style>` : '') + (tut.js ? `\n<script>\n${tut.js}\n</script>` : '');
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Tutorial: ${tut.title}`,
          text: `Practice Tutorial "${tut.title}":\n\n${tut.description}\n\n${codeContent.slice(0, 1500)}`,
        });
        showToast(`Shared tutorial "${tut.title}"!`);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(codeContent);
      showToast(`Tutorial code for "${tut.title}" copied to clipboard! Ready to share.`);
    } catch {
      showToast(`Ready to share "${tut.title}"!`);
    }
  };

  // Reset entire workspace to pristine clean slate with 10 standard items
  const handleResetUserDataAndWorkspace = () => {
    const confirmClean = window.confirm(
      'Are you sure you want to clean all user-created data and restore the clean workspace with 10 standard tasks?'
    );
    if (!confirmClean) return;

    try {
      localStorage.removeItem(`code_studio_projects_v5_${activePlatform}`);
      localStorage.removeItem('android_ide_user_projects');
      localStorage.removeItem(`code_studio_tutorials_v2_${activePlatform}`);
      localStorage.removeItem(`code_studio_blocks_v2_${activePlatform}`);
    } catch {}

    const defaultProjects = activePlatform === 'flutter' ? ALL_100_FLUTTER_PROJECTS : ALL_100_PRACTICE_PROJECTS;
    const defaultTuts = DEFAULT_TUTORIALS;
    const defaultBlks = DEFAULT_BLOCKS;

    setProjects(defaultProjects);
    setTutorialsList(defaultTuts);
    setBlocksList(defaultBlks);

    setProjectPage(0);
    setTutorialPage(0);
    setLayoutPage(0);
    setLayoutCategoryFilter('all');
    setIsTopMenuOpen(false);

    showToast('Cleaned all user-created files! Restored 10 standard tasks.');
  };

  const handleRunSingleBlock = (block: BlockItem) => {
    const previewDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #fff; padding: 20px; margin: 0; }
    ${block.cssSnippet}
  </style>
</head>
<body>
  ${block.htmlSnippet}
  <script>
    try {
      ${block.jsSnippet}
    } catch(e) { console.error(e); }
  <\/script>
</body>
</html>`;
    setLivePreviewContent(previewDoc);
    setIsPreviewOpen(true);
  };

  // Compile all current blocks into a full project and open in editor
  const handleCompileBlocksToProject = () => {
    const compiled = compileBlocksToProject(blocksList, `Visual_Blocks_App_${Date.now().toString().slice(-4)}.html`);
    setProjects([compiled, ...projects]);
    handleOpenProject(compiled);
    showToast('Compiled all blocks into a full working project!');
  };

  // Delete project
  const handleDeleteProject = (proj: ProjectItem) => {
    setContextProject(null);
    setDeleteConfirmItem({
      type: 'practice_file',
      id: proj.id,
      name: proj.name,
    });
  };

  // Duplicate project
  const handleDuplicateProject = (proj: ProjectItem) => {
    const dup: ProjectItem = {
      ...proj,
      id: `custom_proj_${Date.now()}`,
      name: `Copy_of_${proj.name}`,
      createdAt: 'Just now',
      isOriginal: false,
    };
    setProjects([dup, ...projects]);
    setContextProject(null);
    showToast(`Duplicated "${proj.name}"!`);
  };

  // Rename project
  const handleConfirmRename = () => {
    if (!contextProject || !renameInput.trim()) return;
    const newName = renameInput.trim();
    const isCustomProjRename = customProjects.some((cp) => cp.id === contextProject.id);
    if (isCustomProjRename) {
      const cleanName = newName.replace(/\.(html|kt|java|dart|swift|gradle)$/i, '');
      const updatedCustom = customProjects.map((cp) =>
        cp.id === contextProject.id ? { ...cp, name: cleanName } : cp
      );
      setCustomProjects(updatedCustom);
      try {
        localStorage.setItem('android_ide_custom_user_projects_v4', JSON.stringify(updatedCustom));
      } catch {}
      setIsRenameModalOpen(false);
      setContextProject(null);
      showToast(`Renamed project to "${cleanName}"`);
      return;
    }
    const finalName = newName.endsWith('.html') ? newName : `${newName}.html`;
    const updated = projects.map((p) => (p.id === contextProject.id ? { ...p, name: finalName } : p));
    setProjects(updated);
    setIsRenameModalOpen(false);
    setContextProject(null);
    showToast(`Renamed project to "${finalName}"`);
  };

  // Filter projects & tutorials for Search tab
  // (Newly created projects will ALWAYS belong in filteredProjects, and therefore display FIRST above tutorials!)
  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredTutorials = tutorialsList.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If in practice editor mode
  if (activeProject) {
    const rawCurrentCode =
      editorSubTab === 'HTML'
        ? activeHtml
        : editorSubTab === 'Kotlin'
        ? activeKotlin
        : editorSubTab === 'Java'
        ? activeJava
        : editorSubTab === 'Flutter'
        ? activeFlutter
        : activeSwift;
    // Code only displays after selecting a file chip in Bar 2 (or typing/applying code)
    const currentCode = isEditorFileSelected ? rawCurrentCode : '';
    const setCode =
      editorSubTab === 'HTML'
        ? setActiveHtml
        : editorSubTab === 'Kotlin'
        ? setActiveKotlin
        : editorSubTab === 'Java'
        ? setActiveJava
        : editorSubTab === 'Flutter'
        ? setActiveFlutter
        : setActiveSwift;

    const lineCount = Math.max(1, currentCode.split('\n').length);
    const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');

    // Resolve the active opened project name from CustomProject or openedProjectName
    const activeCustomProjObj =
      customProjects.find((cp) => cp.id === (activeCustomFileContext?.projectId || activeCustomProjectId)) ||
      customProjects[0];
    const displayProjectTitle =
      (activeCustomFileContext && activeCustomProjObj ? activeCustomProjObj.name : openedProjectName) ||
      activeProject.name;

    // Unified dark button style matching AI button (#161826 background, #282c44 border, no shadow)
    const darkShadowToolBtnStyle: React.CSSProperties = {
      width: '32px',
      height: '32px',
      minWidth: '32px',
      borderRadius: '8px',
      background: '#161826',
      border: '1px solid #282c44',
      boxShadow: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '13px',
      cursor: 'pointer',
      flexShrink: 0,
    };

    return (
      <div className="practice-editor-screen">
        {/* Top Header Bar: Rounded Corners + 1-Thread Gap on All 4 Sides + Unified Horizontal Scroll */}
        <div
          className="practice-sub-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 8px',
            margin: '4px 6px 2px 6px',
            background: '#0d0e17',
            border: '1px solid #25283d',
            borderRadius: '12px',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.55)',
            position: 'relative',
          }}
        >
          {/* Left Navigation: Project Files/Folders + Home + Back (Unified Dark Shadow Style) */}
          <div
            className="practice-sub-left"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              className="practice-icon-btn"
              onClick={() => setIsProjectFilesDrawerOpen((prev) => !prev)}
              title="Project Files & Folders (ফাইল ও ফোল্ডার দেখুন)"
              style={{
                ...darkShadowToolBtnStyle,
                color: '#e2e8f0',
                border: isProjectFilesDrawerOpen ? '1px solid #38bdf8' : '1px solid #282c44',
              }}
            >
              <i className="fas fa-bars"></i>
            </button>
            <button
              className="practice-icon-btn"
              onClick={onBackToDashboard}
              title="Home - Back to Dashboard"
              style={{
                ...darkShadowToolBtnStyle,
                color: '#e2e8f0',
              }}
            >
              <i className="fas fa-house"></i>
            </button>
            <button
              className="practice-icon-btn"
              onClick={() => setActiveProject(null)}
              title="Back to Projects"
              style={{
                ...darkShadowToolBtnStyle,
                color: '#e2e8f0',
              }}
            >
              <i className="fas fa-arrow-left"></i>
            </button>
          </div>

          {/* Unified Horizontally Scrollable Bar: Elongated Project Name Box + All Tools + Language Chips */}
          <div
            className="practice-top-middle-scroll-container"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flex: '1 1 auto',
              minWidth: 0,
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch',
              padding: '2px 2px',
            }}
          >
            {/* 1. Elongated Project Name Box (Slim height, auto-expands to fit full project name without internal scrolling) */}
            <div
              className="practice-selected-file-badge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                height: '32px',
                padding: '0 16px',
                background: '#161826',
                border: '1px solid #282c44',
                boxShadow: 'none',
                borderRadius: '9px',
                flexShrink: 0,
                width: 'max-content',
                minWidth: '140px',
                maxWidth: 'none',
                overflow: 'visible',
                whiteSpace: 'nowrap',
              }}
              title={`Opened Project: ${displayProjectTitle} (${editorSubTab})`}
            >
              <i
                className="fab fa-android"
                style={{ fontSize: '16px', color: '#3DDC84', flexShrink: 0 }}
              ></i>
              <span
                style={{
                  fontWeight: 800,
                  color: '#f8fafc',
                  fontSize: '13px',
                  letterSpacing: '0.3px',
                  whiteSpace: 'nowrap',
                }}
              >
                {displayProjectTitle}
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '5px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#e2e8f0',
                  marginLeft: '2px',
                  flexShrink: 0,
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              >
                {editorSubTab.toUpperCase()}
              </span>
            </div>

            {/* 2. Action Tools in Exact User-Requested Order (Right-to-Left: IDE -> Play -> Save -> Copy -> Terminal -> AI, all with Dark Shadow Box matching AI) */}
            <div
              className="practice-sub-right"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                flexShrink: 0,
              }}
            >
              {/* AI Code Assistant & Generator Button */}
              <button
                type="button"
                className="practice-icon-btn"
                onClick={() => {
                  setAiModalTab('chat');
                  setIsAiModalOpen(true);
                }}
                title="AI কোড অ্যাসিস্ট্যান্ট ও কোড জেনারেটর (Gemini)"
                style={{
                  ...darkShadowToolBtnStyle,
                  width: 'auto',
                  padding: '0 10px',
                  borderBottom: isAiModalOpen ? '2px solid #38bdf8' : '1px solid #282a3d',
                  color: '#e2e8f0',
                  gap: '5px',
                  fontSize: '11px',
                  fontWeight: 800,
                }}
              >
                <i className="fas fa-wand-magic-sparkles" style={{ color: '#e2e8f0' }}></i>
                <span>AI</span>
              </button>

              {/* Termux-style Terminal / Virtual Keyboard Mode Toggle */}
              <button
                type="button"
                className="practice-icon-btn"
                onClick={toggleSoftKeyboard}
                title={
                  isSoftKeyboardEnabled
                    ? 'Terminal / Virtual Input: ON'
                    : 'Terminal / Virtual Input: OFF (Symbol Bar Mode)'
                }
                style={{
                  ...darkShadowToolBtnStyle,
                  color: '#e2e8f0',
                  position: 'relative',
                }}
              >
                <i className="fas fa-terminal"></i>
                <span
                  style={{
                    position: 'absolute',
                    bottom: '3px',
                    right: '3px',
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background: isSoftKeyboardEnabled ? '#10b981' : '#64748b',
                  }}
                />
              </button>

              {/* Copy / Clipboard Menu Button */}
              <button
                type="button"
                className="practice-icon-btn"
                onClick={() => setIsCopyOptionsOpen(!isCopyOptionsOpen)}
                title="Clipboard & Text Tools (Select All, Copy, Paste, Cut, Clear)"
                style={{
                  ...darkShadowToolBtnStyle,
                  border: isCopyOptionsOpen ? '1px solid #38bdf8' : '1px solid #282a3d',
                  color: '#e2e8f0',
                }}
              >
                <i className="fas fa-copy"></i>
              </button>

              {/* Save Button (Right after Play option going right-to-left) */}
              <button
                type="button"
                className="practice-save-btn"
                onClick={handleSaveProject}
                title="Save Code Changes"
                style={{
                  ...darkShadowToolBtnStyle,
                  color: '#e2e8f0',
                }}
              >
                <i className="fas fa-floppy-disk"></i>
              </button>

              {/* Run / Play Code */}
              <button
                type="button"
                className="practice-icon-btn practice-play-btn"
                onClick={handleRunCode}
                title="Run / Preview Code"
                style={{
                  ...darkShadowToolBtnStyle,
                  color: '#e2e8f0',
                }}
              >
                <i className="fas fa-play"></i>
              </button>

              {/* Open in Full IDE (Page Navigation Button) */}
              <button
                type="button"
                className="practice-icon-btn"
                onClick={() => onOpenInMainIde(currentCode || rawCurrentCode || activeProject.code || '', `${displayProjectTitle}`)}
                title="Directly Open Project in Full Code IDE"
                style={{
                  ...darkShadowToolBtnStyle,
                  width: 'auto',
                  padding: '0 9px',
                  color: '#e2e8f0',
                  gap: '5px',
                  fontSize: '11px',
                  fontWeight: 800,
                }}
              >
                <i className="fas fa-arrow-up-right-from-square"></i>
                <span className="hidden sm:inline">IDE</span>
              </button>
            </div>


          </div>

          {/* Clipboard Floating Dropdown (Rendered inside practice-sub-header outside overflow-x container so it is never clipped) */}
          {isCopyOptionsOpen && (
            <div
              ref={copyMenuRef}
              style={{
                position: 'absolute',
                top: '44px',
                right: '10px',
                zIndex: 1000,
                background: '#151726',
                border: '1px solid #2d324d',
                borderRadius: '12px',
                padding: '6px',
                minWidth: '160px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.7)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleSelectAllCode}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  background: 'transparent',
                  border: 'none',
                  color: '#f1f5f9',
                  fontSize: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#21253a')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <i className="fas fa-object-ungroup" style={{ color: '#38bdf8' }}></i>
                <span>Select All</span>
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleCopyCode}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  background: 'transparent',
                  border: 'none',
                  color: '#f1f5f9',
                  fontSize: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#21253a')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <i className="fas fa-copy" style={{ color: '#4ade80' }}></i>
                <span>Copy</span>
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handlePasteCode}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  background: 'transparent',
                  border: 'none',
                  color: '#f1f5f9',
                  fontSize: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#21253a')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <i className="fas fa-paste" style={{ color: '#a855f7' }}></i>
                <span>Paste</span>
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleCutCode}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  background: 'transparent',
                  border: 'none',
                  color: '#f1f5f9',
                  fontSize: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#21253a')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <i className="fas fa-scissors" style={{ color: '#fb923c' }}></i>
                <span>Cut</span>
              </button>
              <div style={{ height: '1px', background: '#25293d', margin: '2px 0' }} />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleClearAllCode}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  background: 'transparent',
                  border: 'none',
                  color: '#f43f5e',
                  fontSize: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#21253a')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <i className="fas fa-trash"></i>
                <span>Clear All</span>
              </button>
            </div>
          )}
        </div>

        {/* Collapsible Full Project Files & Folders Drawer (Opens when ≡ Files button in top bar is clicked) */}
        {isProjectFilesDrawerOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(0, 0, 0, 0.75)',
              display: 'flex',
              backdropFilter: 'blur(3px)',
            }}
            onClick={() => setIsProjectFilesDrawerOpen(false)}
          >
            <div
              style={{
                width: '85%',
                maxWidth: '340px',
                height: '100%',
                background: '#0d0f18',
                borderRight: '1px solid #23273e',
                boxShadow: '4px 0 24px rgba(0, 0, 0, 0.8)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header with Android Logo */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  background: '#131625',
                  borderBottom: '1px solid #23273e',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src="/android_logo.png"
                    alt="Android Logo"
                    style={{ width: '28px', height: '28px', borderRadius: '7px', objectFit: 'contain' }}
                  />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#f8fafc' }}>
                      {displayProjectTitle}
                    </h3>
                    <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 700 }}>
                      FILES & FOLDERS ({activeCustomProjObj ? activeCustomProjObj.files.length : sortedProjects.length} items)
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProjectFilesDrawerOpen(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '16px',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                  title="Close Files"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              {/* Project Files List */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '12px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                {activeCustomProjObj && activeCustomProjObj.files.length > 0 ? (
                  activeCustomProjObj.files.map((cf) => {
                    const isSelected = activeCustomFileContext?.fileId === cf.id;
                    return (
                      <div
                        key={cf.id}
                        onClick={() => {
                          handleOpenCustomProjectFile(activeCustomProjObj, cf);
                          setIsProjectFilesDrawerOpen(false);
                          showToast(`Opened ${cf.name}`);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          background: isSelected ? 'rgba(56, 189, 248, 0.15)' : '#161928',
                          border: isSelected ? '1px solid #38bdf8' : '1px solid #23273e',
                          cursor: 'pointer',
                          color: isSelected ? '#38bdf8' : '#e2e8f0',
                        }}
                      >
                        <i className={getCustomFileIcon(cf.name, cf.lang)} style={{ fontSize: '15px' }}></i>
                        <span style={{ fontSize: '13px', fontWeight: 700, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {cf.name}
                        </span>
                        <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 5px', borderRadius: '4px', background: '#25293d', color: '#94a3b8' }}>
                          {cf.lang}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  sortedProjects.map((p, idx) => {
                    const isSelected = isEditorFileSelected && selectedBarFileId === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          handleOpenProject(p);
                          setIsProjectFilesDrawerOpen(false);
                          showToast(`Opened ${p.name}`);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          background: isSelected ? 'rgba(56, 189, 248, 0.15)' : '#161928',
                          border: isSelected ? '1px solid #38bdf8' : '1px solid #23273e',
                          cursor: 'pointer',
                          color: isSelected ? '#38bdf8' : '#e2e8f0',
                        }}
                      >
                        <i className="fas fa-file-code" style={{ fontSize: '15px', color: '#38bdf8' }}></i>
                        <span style={{ fontSize: '13px', fontWeight: 700, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {idx + 1}. {p.name}
                        </span>
                        <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 5px', borderRadius: '4px', background: '#25293d', color: '#94a3b8' }}>
                          {p.lang || 'CODE'}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bar 2: Files Horizontal Scrolling Bar - Numbered Code Files (Code only displays in Bar 3 after selecting one of these files) */}
        <div
          className="practice-files-scroll-bar"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 10px',
            background: '#090a10',
            border: 'none',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {sortedProjects
            .slice(0, 100)
            .map((proj) => {
              const isActive = isEditorFileSelected && selectedBarFileId === proj.id;
              const isOriginal = isOriginalProject(proj);
              const modeIcon =
                editorSubTab === 'Kotlin'
                  ? 'fab fa-android'
                  : editorSubTab === 'Java'
                  ? 'fab fa-java'
                  : editorSubTab === 'Flutter'
                  ? 'fas fa-feather-pointed'
                  : editorSubTab === 'Swift'
                  ? 'fab fa-apple'
                  : 'fab fa-html5';
              const modeColor =
                editorSubTab === 'Kotlin'
                  ? '#7F52FF'
                  : editorSubTab === 'Java'
                  ? '#ef4444'
                  : editorSubTab === 'Flutter'
                  ? '#38bdf8'
                  : editorSubTab === 'Swift'
                  ? '#a855f7'
                  : '#f97316';
              return (
                <button
                  key={proj.id}
                  ref={isActive ? activeFileChipRef : undefined}
                  type="button"
                  className={`practice-file-chip ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    if (isLongPressTriggeredRef.current) {
                      isLongPressTriggeredRef.current = false;
                      return;
                    }
                    handleSelectBarFileChip(proj);
                  }}
                  onTouchStart={() => handleFileTouchStart(proj)}
                  onTouchEnd={handleFileTouchEnd}
                  onTouchCancel={handleFileTouchEnd}
                  onMouseDown={() => handleFileTouchStart(proj)}
                  onMouseUp={handleFileTouchEnd}
                  onMouseLeave={handleFileTouchEnd}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setFileActionSheetProj(proj);
                  }}
                  title={`${proj.name} (Tap to show code, Hold for options)`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '6px 14px',
                    borderRadius: '12px',
                    fontSize: '11.5px',
                    fontWeight: isActive ? 800 : 600,
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                    border: isActive ? '1px solid #60a5fa' : '1px solid #282c40',
                    background: isActive ? '#007AFF' : '#161826',
                    color: isActive ? '#ffffff' : '#cbd5e1',
                    boxShadow: isActive ? '0 4px 16px rgba(0, 122, 255, 0.5)' : '0 2px 8px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <i
                    className={modeIcon}
                    style={{
                      color: isActive ? '#ffffff' : '#94a3b8',
                      fontSize: '12px',
                      flexShrink: 0,
                    }}
                  ></i>
                  <span>{formatPracticeFileName(proj.name)}</span>
                  {!isOriginal && (
                    <span
                      style={{
                        fontSize: '8px',
                        fontWeight: 800,
                        padding: '1px 4px',
                        borderRadius: '4px',
                        background: isActive ? '#ffffff' : '#10b981',
                        color: isActive ? '#007AFF' : '#ffffff',
                        marginLeft: '2px',
                        flexShrink: 0,
                      }}
                    >
                      NEW
                    </span>
                  )}
                </button>
              );
            })}
        </div>

        {/* Bar 3: Code Editor Body (Full 2D Finger Scrollable, No Text Wrapping) */}
        <div className="practice-code-area-wrap" style={{ position: 'relative' }}>
          <div className="practice-line-numbers" ref={practiceLineNumbersRef}>
            {Array.from({ length: Math.max(1, currentCode.split('\n').length) }).map((_, i) => (
              <div key={i + 1} className="practice-line-num-item">
                {i + 1}
              </div>
            ))}
          </div>
          <div
            className="code-editor-inner-wrap"
            style={{
              flex: 1,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div
              ref={practiceSyntaxBackdropRef}
              className="code-syntax-backdrop"
              aria-hidden="true"
            >
              {renderHighlightedLines(currentCode)}
            </div>
            <textarea
              ref={editorTextareaRef}
              className="practice-textarea"
              inputMode={isSoftKeyboardEnabled ? 'text' : 'none'}
              wrap="off"
              value={currentCode}
              onChange={(e) => handleUserCodeChange(e.target.value)}
              onScroll={handleEditorScroll}
              onContextMenu={(e) => {
                e.preventDefault();
              }}
              onPaste={(e) => {
                const pasted = e.clipboardData?.getData('text') || '';
                if (pasted) {
                  try {
                    localStorage.setItem('android_ide_clipboard_cache', pasted);
                  } catch {}
                }
              }}
              spellCheck={false}
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
            />
          </div>
        </div>

        {/* TWO-ROW CODING SYMBOL BAR (সিম টু সিম EditorScreen এর মতো) */}
        <div className="bottom-symbol-dual-bar" style={{ marginTop: 'auto' }}>
          {/* Far Left: Left Scroll Button */}
          <button
            className="scroll-nav-btn dual-nav-btn left-nav-btn"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => scrollSymbols(-180)}
            title="Scroll symbols left"
            type="button"
            tabIndex={-1}
          >
            <i className="fas fa-angles-left"></i>
          </button>

          {/* Center: Two Rows of Scrolling Controls and Symbols (Paired Columns - 100% vertically aligned) */}
          <div className="symbol-dual-scroll-container" ref={symbolScrollRef}>
            <div className="symbol-dual-grid-track">
              {/* Control Column 1: Left (Top) & Up (Bottom) Carets */}
              <div className="symbol-pair-column">
                <button
                  type="button"
                  tabIndex={-1}
                  className="dual-symbol-key ctrl-key-fixed"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleMoveCursor('left')}
                  title="Move cursor left"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button
                  type="button"
                  tabIndex={-1}
                  className="dual-symbol-key ctrl-key-fixed"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleMoveCursor('up')}
                  title="Move cursor up"
                >
                  <i className="fas fa-chevron-up"></i>
                </button>
              </div>

              {/* Control Column 2: Right (Top) & Down (Bottom) Carets */}
              <div className="symbol-pair-column">
                <button
                  type="button"
                  tabIndex={-1}
                  className="dual-symbol-key ctrl-key-fixed"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleMoveCursor('right')}
                  title="Move cursor right"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
                <button
                  type="button"
                  tabIndex={-1}
                  className="dual-symbol-key ctrl-key-fixed"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleMoveCursor('down')}
                  title="Move cursor down"
                >
                  <i className="fas fa-chevron-down"></i>
                </button>
              </div>

              {/* Control Column 3: Undo (Top) & Redo (Bottom) */}
              <div className="symbol-pair-column">
                <button
                  type="button"
                  tabIndex={-1}
                  className="dual-symbol-key ctrl-undo-key"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleUndo}
                  disabled={undoStack.length === 0}
                  title="Undo (Ctrl+Z)"
                  style={{
                    color: undoStack.length > 0 ? '#38bdf8' : '#475569',
                    opacity: undoStack.length > 0 ? 1 : 0.5,
                  }}
                >
                  <i className="fas fa-rotate-left"></i>
                </button>
                <button
                  type="button"
                  tabIndex={-1}
                  className="dual-symbol-key ctrl-redo-key"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleRedo}
                  disabled={redoStack.length === 0}
                  title="Redo (Ctrl+Y)"
                  style={{
                    color: redoStack.length > 0 ? '#38bdf8' : '#475569',
                    opacity: redoStack.length > 0 ? 1 : 0.5,
                  }}
                >
                  <i className="fas fa-rotate-right"></i>
                </button>
              </div>

              {/* Control Column 4: Reset Symbols (Top) & Tab Spacing (Bottom) */}
              <div className="symbol-pair-column">
                <button
                  type="button"
                  tabIndex={-1}
                  className="dual-symbol-key ctrl-key-fixed"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={resetSymbolsToDefault}
                  title="Reset Coding Symbols to Clean Default Order"
                  style={{ color: '#a855f7' }}
                >
                  <i className="fas fa-arrow-rotate-right"></i>
                </button>
                <button
                  type="button"
                  tabIndex={-1}
                  className="dual-symbol-key ctrl-key-fixed"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setIsTabConfigOpen(true)}
                  title="Configure Tab Spacing"
                  style={{ color: '#10b981' }}
                >
                  <i className="fas fa-sliders"></i>
                </button>
              </div>

              {/* Symbol Columns: Matched Pairs (দ্বারে দ্বারে জোড়া) */}
              {Array.from({ length: Math.max(row1Symbols.length, row2Symbols.length) }).map((_, idx) => {
                const s1 = row1Symbols[idx];
                const s2 = row2Symbols[idx];
                return (
                  <div className="symbol-pair-column" key={`sym-pair-col-${idx}`}>
                    {/* Row 1 Button (Top) */}
                    {s1 !== undefined ? (
                      <button
                        key={`r1-${s1}-${idx}`}
                        type="button"
                        tabIndex={-1}
                        draggable
                        data-symbol-key="true"
                        data-row="1"
                        data-index={idx}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSymbolMouseDown(s1);
                        }}
                        onMouseUp={() => handleSymbolMouseUp(s1)}
                        onMouseLeave={() => handleSymbolMouseUp(s1)}
                        onContextMenu={(e) => {
                          if (s1 === 'Tab') {
                            e.preventDefault();
                            setTabInputVal(String(tabSpaces));
                            setIsTabConfigOpen(true);
                          }
                        }}
                        onDoubleClick={(e) => {
                          if (s1 === 'Tab') {
                            e.preventDefault();
                            setTabInputVal(String(tabSpaces));
                            setIsTabConfigOpen(true);
                          }
                        }}
                        onDragStart={(e) => handleSymbolDragStart(e, 1, idx, s1)}
                        onDragOver={(e) => handleSymbolDragOver(e, 1, idx)}
                        onDrop={handleSymbolDrop}
                        onTouchStart={(e) => handleSymbolTouchStart(e, 1, idx, s1)}
                        onTouchMove={handleSymbolTouchMove}
                        onTouchEnd={() => handleSymbolTouchEnd(s1)}
                        className={`dual-symbol-key ${
                          s1 === 'Tab'
                            ? `symbol-key-tab ${isTabHolding ? 'is-holding' : ''}`
                            : UI_TOKEN_SET.has(s1)
                            ? 'symbol-key-ui'
                            : CODE_KEYWORD_SET.has(s1)
                            ? 'symbol-key-kw'
                            : ''
                        } ${s1.length > 5 ? 'symbol-key-long' : ''} ${
                          dragState?.row === 1 && dragState?.index === idx ? 'is-dragging' : ''
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          if (tabHoldTriggeredRef.current) {
                            tabHoldTriggeredRef.current = false;
                            return;
                          }
                          if (Date.now() - lastTapTimeRef.current < 400) return;
                          insertSymbol(s1);
                        }}
                        title={
                          s1 === 'Tab'
                            ? `Tab (${tabSpaces} spaces) - Hold 10s or double-click to configure`
                            : `Insert "${s1}"`
                        }
                      >
                        {s1 === 'Tab' ? (
                          isTabHolding ? (
                            <span style={{ color: '#38bdf8', fontWeight: 800 }}>{tabHoldSeconds}s</span>
                          ) : (
                            'Tab'
                          )
                        ) : (
                          s1
                        )}
                      </button>
                    ) : (
                      <div style={{ height: '25px', minWidth: '32px' }} />
                    )}

                    {/* Row 2 Button (Bottom) */}
                    {s2 !== undefined ? (
                      <button
                        key={`r2-${s2}-${idx}`}
                        type="button"
                        tabIndex={-1}
                        draggable
                        data-symbol-key="true"
                        data-row="2"
                        data-index={idx}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSymbolMouseDown(s2);
                        }}
                        onMouseUp={() => handleSymbolMouseUp(s2)}
                        onMouseLeave={() => handleSymbolMouseUp(s2)}
                        onContextMenu={(e) => {
                          if (s2 === 'Tab') {
                            e.preventDefault();
                            setTabInputVal(String(tabSpaces));
                            setIsTabConfigOpen(true);
                          }
                        }}
                        onDoubleClick={(e) => {
                          if (s2 === 'Tab') {
                            e.preventDefault();
                            setTabInputVal(String(tabSpaces));
                            setIsTabConfigOpen(true);
                          }
                        }}
                        onDragStart={(e) => handleSymbolDragStart(e, 2, idx, s2)}
                        onDragOver={(e) => handleSymbolDragOver(e, 2, idx)}
                        onDrop={handleSymbolDrop}
                        onTouchStart={(e) => handleSymbolTouchStart(e, 2, idx, s2)}
                        onTouchMove={handleSymbolTouchMove}
                        onTouchEnd={() => handleSymbolTouchEnd(s2)}
                        className={`dual-symbol-key ${
                          s2 === 'Tab'
                            ? `symbol-key-tab ${isTabHolding ? 'is-holding' : ''}`
                            : UI_TOKEN_SET.has(s2)
                            ? 'symbol-key-ui'
                            : CODE_KEYWORD_SET.has(s2)
                            ? 'symbol-key-kw'
                            : ''
                        } ${s2.length > 5 ? 'symbol-key-long' : ''} ${
                          dragState?.row === 2 && dragState?.index === idx ? 'is-dragging' : ''
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          if (tabHoldTriggeredRef.current) {
                            tabHoldTriggeredRef.current = false;
                            return;
                          }
                          if (Date.now() - lastTapTimeRef.current < 400) return;
                          insertSymbol(s2);
                        }}
                        title={
                          s2 === 'Tab'
                            ? `Tab (${tabSpaces} spaces) - Hold 10s or double-click to configure`
                            : `Insert "${s2}"`
                        }
                      >
                        {s2 === 'Tab' ? (
                          isTabHolding ? (
                            <span style={{ color: '#38bdf8', fontWeight: 800 }}>{tabHoldSeconds}s</span>
                          ) : (
                            'Tab'
                          )
                        ) : (
                          s2
                        )}
                      </button>
                    ) : (
                      <div style={{ height: '25px', minWidth: '32px' }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Far Right: Right Scroll Button */}
          <button
            className="scroll-nav-btn dual-nav-btn right-nav-btn"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => scrollSymbols(180)}
            title="Scroll symbols right"
            type="button"
            tabIndex={-1}
          >
            <i className="fas fa-angles-right"></i>
          </button>
        </div>

        {/* Tab & Space Configuration Modal */}
        {isTabConfigOpen && (
          <div className="practice-preview-overlay" style={{ zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div
              style={{
                background: '#141624',
                border: '1px solid #2d324d',
                borderRadius: '16px',
                padding: '22px',
                width: '92%',
                maxWidth: '380px',
                color: '#f8fafc',
                boxShadow: '0 25px 50px rgba(0,0,0,0.8)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-sliders text-sky-400" style={{ fontSize: '18px' }}></i>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#f8fafc' }}>
                    Tab & Space Settings
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTabConfigOpen(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '4px'
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              {/* 1. Tab Indentation Presets */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>
                  Tab Key Indentation:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {[1, 2, 4, 8].map((s) => (
                    <button
                      key={s}
                      type="button"
                      style={{
                        padding: '8px 4px',
                        borderRadius: '8px',
                        border: tabInputVal === String(s) ? '2px solid #38bdf8' : '1px solid #282c40',
                        background: tabInputVal === String(s) ? '#0284c7' : '#1a1d2e',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                      onClick={() => setTabInputVal(String(s))}
                    >
                      {s} sp
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Space Key Mode */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>
                  Space Key (␣) Behavior:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: spaceMode === 'single' ? '2px solid #10b981' : '1px solid #282c40',
                      background: spaceMode === 'single' ? 'rgba(16, 185, 129, 0.2)' : '#1a1d2e',
                      color: spaceMode === 'single' ? '#34d399' : '#94a3b8',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSpaceMode('single')}
                  >
                    1 Space (' ')
                  </button>
                  <button
                    type="button"
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: spaceMode === 'double' ? '2px solid #10b981' : '1px solid #282c40',
                      background: spaceMode === 'double' ? 'rgba(16, 185, 129, 0.2)' : '#1a1d2e',
                      color: spaceMode === 'double' ? '#34d399' : '#94a3b8',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSpaceMode('double')}
                  >
                    2 Spaces ('  ')
                  </button>
                </div>
              </div>

              {/* 3. Live Preview */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>
                  Visual Preview:
                </label>
                <div
                  style={{
                    background: '#090a12',
                    border: '1px solid #1e2235',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    color: '#e2e8f0',
                    lineHeight: '1.5'
                  }}
                >
                  <div style={{ color: '#94a3b8' }}>fun main() &#123;</div>
                  <div>
                    <span style={{ color: '#38bdf8', letterSpacing: '2px' }}>
                      {'·'.repeat(parseInt(tabInputVal, 10) || 2)}
                    </span>
                    <span style={{ color: '#4ade80' }}>println("Android IDE");</span>
                  </div>
                  <div style={{ color: '#94a3b8' }}>&#125;</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#282c40',
                    border: 'none',
                    color: '#cbd5e1',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  onClick={() => setIsTabConfigOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    background: '#0284c7',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    const parsed = parseInt(tabInputVal, 10) || 2;
                    setTabSpaces(parsed);
                    try {
                      localStorage.setItem('android_ide_tab_spaces', String(parsed));
                    } catch {}
                    setIsTabConfigOpen(false);
                    showToast(`Tab set to ${parsed} spaces, Space mode: ${spaceMode}`);
                  }}
                >
                  Apply Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Live Preview Modal Overlay */}
        {isPreviewOpen && (
          <div className="practice-preview-overlay" onClick={() => setIsPreviewMenuOpen(false)}>
            <div
              className="practice-preview-header"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 14px',
                background: '#0d0f18',
                borderBottom: '1px solid #1f2438',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="preview-header-left" style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                {previewAppLogoUrl ? (
                  <img
                    src={previewAppLogoUrl}
                    alt={previewAppName || activeProject.name}
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      border: '1px solid rgba(255, 255, 255, 0.16)',
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <i className="fas fa-calculator" style={{ color: '#38bdf8' }}></i>
                )}
                <span
                  style={{
                    fontWeight: 800,
                    color: '#ffffff',
                    fontSize: '14px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {previewAppName || activeProject.name}
                </span>
              </div>
              <div className="preview-header-right" style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                <button
                  type="button"
                  className="preview-control-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPreviewMenuOpen((prev) => !prev);
                  }}
                  title="App Options Menu"
                >
                  <i className="fas fa-ellipsis-vertical"></i>
                </button>
                <button
                  type="button"
                  className="preview-control-btn btn-close"
                  onClick={() => {
                    setIsPreviewMenuOpen(false);
                    setIsPreviewOpen(false);
                  }}
                  title="Close Preview"
                >
                  <i className="fas fa-times"></i>
                </button>

                {isPreviewMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '42px',
                      right: '0',
                      zIndex: 100005,
                      background: '#131624',
                      border: '1px solid #2d3452',
                      borderRadius: '12px',
                      padding: '6px',
                      minWidth: '205px',
                      boxShadow: '0 14px 34px rgba(0, 0, 0, 0.85)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setIsPreviewMenuOpen(false);
                        setIsPreviewOpen(false);
                        onOpenInMainIde(activeProject.code || currentCode, `${activeProject.name}`);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '9px 12px',
                        background: 'rgba(16, 185, 129, 0.14)',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        color: '#34d399',
                        fontSize: '12px',
                        fontWeight: 800,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <i className="fab fa-android"></i>
                      <span>Open in IDE / Build APK</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPreviewMenuOpen(false);
                        handleRunCode();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '9px 12px',
                        background: 'transparent',
                        border: 'none',
                        color: '#f1f5f9',
                        fontSize: '12px',
                        fontWeight: 700,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <i className="fas fa-rotate-right text-sky-400"></i>
                      <span>Reload Application</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsDesktopPreview(!isDesktopPreview);
                        setIsPreviewMenuOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '9px 12px',
                        background: 'transparent',
                        border: 'none',
                        color: '#f1f5f9',
                        fontSize: '12px',
                        fontWeight: 700,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <i className={`fas ${isDesktopPreview ? 'fa-mobile-screen' : 'fa-expand'} text-purple-400`}></i>
                      <span>{isDesktopPreview ? 'Switch to Phone View' : 'Full Screen View'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div
              className="practice-preview-body"
              style={{
                display: 'flex',
                justifyContent: 'center',
                background: '#090a0f',
                padding: isDesktopPreview ? '0' : '10px 0',
              }}
            >
              <div
                style={{
                  width: isDesktopPreview ? '100%' : '375px',
                  maxWidth: '100%',
                  height: '100%',
                  transition: 'width 0.2s ease',
                  boxShadow: isDesktopPreview ? 'none' : '0 10px 30px rgba(0,0,0,0.8)',
                  border: isDesktopPreview ? 'none' : '1px solid #1e293b',
                  borderRadius: isDesktopPreview ? '0' : '12px',
                  overflow: 'hidden',
                }}
              >
                <iframe
                  title="Live Preview"
                  srcDoc={livePreviewContent}
                  sandbox="allow-scripts allow-modals allow-same-origin"
                  className="practice-preview-iframe"
                  style={{ width: '100%', height: '100%', border: 'none', background: '#ffffff' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* File Action Sheet Modal inside Practice Editor */}
        {fileActionSheetProj && (
          <div
            className="studio-modal-overlay"
            onClick={() => setFileActionSheetProj(null)}
            style={{ zIndex: 9999 }}
          >
            <div
              className="studio-modal-card"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '380px', width: '92%', borderRadius: '16px' }}
            >
              {(() => {
                const pLogo = getProjectLogoInfo(fileActionSheetProj);
                const isOrig = isOriginalProject(fileActionSheetProj);
                return (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          background: '#161826',
                          border: `1.5px solid ${pLogo.color}`,
                          boxShadow: `0 0 10px ${pLogo.glowColor}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          flexShrink: 0
                        }}
                      >
                        <i className={pLogo.icon} style={{ color: pLogo.color }}></i>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <h3 style={{ margin: 0, fontSize: '15px', color: '#fff', fontWeight: 800 }}>
                            {fileActionSheetProj.name}
                          </h3>
                          <span
                            style={{
                              fontSize: '8.5px',
                              fontWeight: 800,
                              padding: '1px 5px',
                              borderRadius: '4px',
                              background: isOrig ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                              color: isOrig ? '#10b981' : '#38bdf8',
                              border: `1px solid ${isOrig ? '#10b98144' : '#38bdf844'}`
                            }}
                          >
                            {isOrig ? 'ORIGINAL' : 'CUSTOM'}
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {fileActionSheetProj.lang} • Practice Workspace File
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFileActionSheetProj(null)}
                      style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '16px', cursor: 'pointer' }}
                    >
                      <i className="fas fa-xmark"></i>
                    </button>
                  </div>
                );
              })()}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenProject(fileActionSheetProj);
                    setFileActionSheetProj(null);
                    showToast(`Opened ${fileActionSheetProj.name}`);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    background: '#161926',
                    border: '1px solid #282f45',
                    borderRadius: '10px',
                    color: '#38bdf8',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <i className="fas fa-folder-open"></i>
                  <span>Open in Editor</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const p = fileActionSheetProj;
                    setFileActionSheetProj(null);
                    handleDuplicateProject(p);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    background: '#161926',
                    border: '1px solid #282f45',
                    borderRadius: '10px',
                    color: '#c084fc',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <i className="fas fa-copy"></i>
                  <span>Duplicate as Editable Custom Project</span>
                </button>

                <div style={{ height: '1px', background: '#25293d', margin: '4px 0' }} />

                {!isOriginalProject(fileActionSheetProj) ? (
                  <button
                    type="button"
                    onClick={() => {
                      const p = fileActionSheetProj;
                      setFileActionSheetProj(null);
                      setDeleteConfirmItem({
                        type: 'practice_file',
                        id: p.id,
                        name: p.name,
                      });
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      background: 'rgba(239, 68, 68, 0.18)',
                      border: '1px solid rgba(239, 68, 68, 0.45)',
                      borderRadius: '10px',
                      color: '#f87171',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <i className="fas fa-trash-can"></i>
                    <span>Delete File ({fileActionSheetProj.name})</span>
                  </button>
                ) : (
                  <div
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      color: '#10b981',
                      fontSize: '11px',
                      fontWeight: 700,
                      textAlign: 'center',
                      marginTop: '2px'
                    }}
                  >
                    <i className="fas fa-shield-halved" style={{ marginRight: '6px' }}></i>
                    Protected Original File (Cannot be deleted)
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* IN-APP CONFIRM DELETE MODAL inside Practice Editor */}
        {deleteConfirmItem && (
          <div
            className="studio-modal-overlay"
            onClick={() => setDeleteConfirmItem(null)}
            style={{ zIndex: 99999 }}
          >
            <div
              className="studio-modal-card"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '360px',
                width: '90%',
                padding: '24px 20px',
                borderRadius: '18px',
                background: '#161824',
                border: '1.5px solid #2d334d',
                textAlign: 'center',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85)'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1.5px solid #ef4444',
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  margin: '0 auto 14px'
                }}
              >
                <i className="fas fa-trash-can"></i>
              </div>
              <h3 style={{ color: '#ffffff', fontSize: '17px', fontWeight: 800, margin: '0 0 8px 0' }}>
                {deleteConfirmItem.type === 'project' ? 'Delete Project?' : 'Delete File?'}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 20px 0', lineHeight: '1.4' }}>
                {deleteConfirmItem.type === 'project'
                  ? `Are you sure you want to delete "${deleteConfirmItem.name}"? All files inside this project will be deleted.`
                  : `Are you sure you want to delete "${deleteConfirmItem.name}"? This action cannot be undone.`}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmItem(null)}
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    background: '#23283c',
                    border: '1px solid #333a52',
                    color: '#cbd5e1',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteDelete}
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    background: '#dc2626',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(220, 38, 38, 0.45)'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast feedback notification inside Practice Editor */}
        {toastMessage && (
          <div
            style={{
              position: 'fixed',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(15, 23, 42, 0.96)',
              border: '1px solid #0284c7',
              color: '#38bdf8',
              padding: '10px 20px',
              borderRadius: '24px',
              fontSize: '13px',
              fontWeight: 600,
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backdropFilter: 'blur(8px)',
            }}
          >
            <i className="fas fa-circle-check" style={{ color: '#10b981' }}></i>
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  // Primary Code Studio View
  return (
    <div className="code-studio-container" onClick={() => setIsTopMenuOpen(false)}>
      {/* Top Header Bar: Left Home Icon | Center ANDROID | Right 3-Dots */}
      <div className="code-studio-header" style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
        <button
          className="studio-header-icon-btn"
          onClick={onBackToDashboard}
          title="Home - Back to Dashboard"
        >
          <i className="fas fa-house"></i>
        </button>

        <h1
          className="code-studio-title"
          style={{ letterSpacing: '3px', fontWeight: 800, fontSize: '18px', color: '#ffffff' }}
        >
          ANDROID
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            className="studio-header-icon-btn"
            onClick={() => {
              if (activeTab === 'search') setActiveTab('projects');
              else setActiveTab('search');
            }}
            title="Search Projects & Code"
            style={{
              color: activeTab === 'search' ? '#38bdf8' : '#cbd5e1',
              background: activeTab === 'search' ? 'rgba(56, 189, 248, 0.2)' : undefined,
            }}
          >
            <i className="fas fa-search"></i>
          </button>
          <button
            className="studio-header-icon-btn"
            onClick={() => setIsTopMenuOpen(!isTopMenuOpen)}
            title="Menu Options"
          >
            <i className="fas fa-ellipsis-vertical"></i>
          </button>
        </div>

        {/* Top 3-Dots Dropdown Menu */}
        {isTopMenuOpen && (
          <div className="studio-top-dropdown">
            <button
              className="studio-dropdown-item"
              onClick={() => {
                setIsDesktopPreview(!isDesktopPreview);
                setIsTopMenuOpen(false);
                showToast(isDesktopPreview ? 'Switched to Mobile View (375px)' : 'Switched to Desktop View (100%)');
              }}
            >
              <i className={`fas ${isDesktopPreview ? 'fa-mobile-screen' : 'fa-desktop'}`}></i>
              <span>{isDesktopPreview ? 'Mobile View' : 'Desktop View'}</span>
            </button>
            <button
              className="studio-dropdown-item"
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(() => {});
                  showToast('Entered Fullscreen');
                } else {
                  document.exitFullscreen().catch(() => {});
                  showToast('Exited Fullscreen');
                }
                setIsTopMenuOpen(false);
              }}
            >
              <i className="fas fa-expand"></i>
              <span>Toggle Fullscreen</span>
            </button>
            <div className="studio-dropdown-divider"></div>
            <button
              className="studio-dropdown-item"
              onClick={() => {
                handleSaveAllProjects();
                setIsTopMenuOpen(false);
              }}
            >
              <i className="fas fa-floppy-disk"></i>
              <span>Save Project Code</span>
            </button>
            <button
              className="studio-dropdown-item"
              onClick={() => {
                handleExportAllProjectsZip();
                setIsTopMenuOpen(false);
              }}
            >
              <i className="fas fa-file-zipper"></i>
              <span>Export Project (ZIP)</span>
            </button>
            <button
              className="studio-dropdown-item"
              onClick={() => {
                handleImportFileFromGallery();
                setIsTopMenuOpen(false);
              }}
            >
              <i className="fas fa-file-arrow-up"></i>
              <span>Import Project Code</span>
            </button>
            <div className="studio-dropdown-divider"></div>
            <button
              className="studio-dropdown-item"
              onClick={() => {
                handleBackupProjectsJSON();
                setIsTopMenuOpen(false);
              }}
            >
              <i className="fas fa-file-export" style={{ color: '#38bdf8' }}></i>
              <span>Backup All Projects (JSON)</span>
            </button>
            <button
              className="studio-dropdown-item"
              onClick={() => {
                handleRestoreProjectsJSON();
                setIsTopMenuOpen(false);
              }}
            >
              <i className="fas fa-file-import" style={{ color: '#a855f7' }}></i>
              <span>Restore from Backup (JSON)</span>
            </button>
            <div className="studio-dropdown-divider"></div>
            <button
              className="studio-dropdown-item"
              onClick={handleResetUserDataAndWorkspace}
              title="Delete all user-created files and restore 10 standard tasks per section"
            >
              <i className="fas fa-broom" style={{ color: '#f43f5e' }}></i>
              <span style={{ color: '#f43f5e', fontWeight: 700 }}>Clean Workspace (Reset Custom Files)</span>
            </button>
            <button
              className="studio-dropdown-item"
              onClick={() => {
                showToast('ANDROID IDE Platform v2.0 • Total Projects: ' + projects.length);
                setIsTopMenuOpen(false);
              }}
            >
              <i className="fas fa-circle-info"></i>
              <span>About ANDROID</span>
            </button>
          </div>
        )}
      </div>

      {/* 4 Primary Navigation Tabs: PROJECTS | TUTORIALS | LAYOUT | AI (Clean logo + text, blue underline on select, no yellow) */}
      <div className="code-studio-tabs-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px', padding: '4px 8px' }}>
        <button
          className={`studio-tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
          style={{ fontSize: '11px', padding: '7px 4px', letterSpacing: '0.2px', width: '100%', textAlign: 'center' }}
          onClick={() => {
            setActiveTab('projects');
            setIsTopMenuOpen(false);
          }}
        >
          PROJECTS
        </button>
        <button
          className={`studio-tab-btn ${activeTab === 'tutorials' ? 'active' : ''}`}
          style={{ fontSize: '11px', padding: '7px 4px', letterSpacing: '0.2px', width: '100%', textAlign: 'center' }}
          onClick={() => {
            setActiveTab('tutorials');
            setIsTopMenuOpen(false);
          }}
        >
          TUTORIALS
        </button>
        <button
          className={`studio-tab-btn ${activeTab === 'blocks' ? 'active' : ''}`}
          style={{ fontSize: '11px', padding: '7px 4px', letterSpacing: '0.2px', width: '100%', textAlign: 'center' }}
          onClick={() => {
            setActiveTab('blocks');
            setIsTopMenuOpen(false);
          }}
        >
          LAYOUT
        </button>
        <button
          type="button"
          className={`studio-tab-btn ${activeTab === 'ai' || isAiModalOpen ? 'active' : ''}`}
          style={{
            fontSize: '11px',
            padding: '7px 4px',
            letterSpacing: '0.2px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            width: '100%',
            textAlign: 'center',
          }}
          onClick={() => {
            setActiveTab('ai');
            setAiModalTab('chat');
            setIsTopMenuOpen(false);
          }}
          title="AI Code Studio (Gemini 3.8)"
        >
          <i className="fas fa-wand-magic-sparkles" style={{ fontSize: '10px' }}></i>
          <span>AI</span>
        </button>
      </div>

      {/* TAB 1: PROJECTS */}
      {activeTab === 'projects' && (
        <div className="studio-tab-content">
          {/* Top Action Row: Compact CREATE PROJECT on the left, CREATE FILE in the freed-up space on the right */}
          {(() => {
            const activeProjObj =
              customProjects.find((cp) => cp.id === activeCustomProjectId) || customProjects[0] || null;
            return (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  marginBottom: '12px',
                }}
              >
                <button
                  type="button"
                  className="studio-action-btn btn-primary"
                  style={{
                    width: '100%',
                    height: '44px',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '7px',
                    letterSpacing: '0.4px',
                    padding: '0 10px',
                    whiteSpace: 'nowrap',
                  }}
                  onClick={() => {
                    setNewProjectNameInput('');
                    setIsCreateProjectModalOpen(true);
                  }}
                >
                  <i className="fas fa-plus-circle" style={{ fontSize: '15px' }}></i>
                  <span>CREATE PROJECT</span>
                </button>

                <button
                  type="button"
                  className="studio-action-btn btn-primary"
                  style={{
                    width: '100%',
                    height: '44px',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '7px',
                    letterSpacing: '0.4px',
                    padding: '0 10px',
                    whiteSpace: 'nowrap',
                  }}
                  onClick={() => {
                    if (activeProjObj) {
                      setTargetProjectForFile(activeProjObj);
                      setNewFileInProjName('');
                      setNewFileInProjLang(projectFileCategory);
                      setIsCreateFileInProjModalOpen(true);
                    } else {
                      setNewProjectNameInput('');
                      setIsCreateProjectModalOpen(true);
                    }
                  }}
                >
                  <i className="fas fa-plus-circle" style={{ fontSize: '15px' }}></i>
                  <span>CREATE FILE</span>
                </button>
              </div>
            );
          })()}

          {/* SINGLE ACTIVE PROJECT SECTION (No small chips under Create Project; Folder Logo on Left, Project Name in Center, 3-Dots on Right) */}
          {customProjects.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '0 0 10px 0' }}>
              {(customProjects.filter((cp) => cp.id === activeCustomProjectId).length > 0
                ? customProjects.filter((cp) => cp.id === activeCustomProjectId)
                : [customProjects[0]]
              ).map((cProj) => {
                const projectCategoryCounts = getCategoryCountsForProject(cProj.id);
                const allCategoryFiles = cProj.files.filter((f) => {
                  if (projectFileCategory === 'Kotlin') return f.lang === 'Kotlin' || f.name.endsWith('.kt');
                  if (projectFileCategory === 'Java') return (f.lang === 'Java' || f.name.endsWith('.java')) && !f.name.endsWith('.js');
                  if (projectFileCategory === 'HTML') return f.lang === 'HTML' || f.name.endsWith('.html');
                  if (projectFileCategory === 'CSS') return f.lang === 'CSS' || f.name.endsWith('.css');
                  if (projectFileCategory === 'JS') return f.lang === 'JS' || (f.name.endsWith('.js') && f.lang !== 'Java');
                  if (projectFileCategory === 'Gradle') return f.lang === 'Gradle' || f.name.endsWith('.gradle') || f.name.endsWith('.properties') || f.name.endsWith('.pro');
                  return true;
                });

                const currentActiveMax = projectCategoryCounts[projectFileCategory] || 10;
                const customCatFiles = allCategoryFiles.filter((f) => !f.isOriginal);
                const originalCatFiles = allCategoryFiles.filter((f) => f.isOriginal);
                // Display all user-created files in this category at the top + from 10 up to currentActiveMax (up to 100) original files
                const visibleCategoryFiles = [...customCatFiles, ...originalCatFiles.slice(0, currentActiveMax)];

                const handleIncreaseCategoryCount = () => {
                  const nextMax = Math.min(100, currentActiveMax + 10);
                  setProjectCategoryCountsMap((prev) => ({
                    ...prev,
                    [cProj.id]: {
                      ...getCategoryCountsForProject(cProj.id),
                      [projectFileCategory]: nextMax,
                    },
                  }));
                };

                const handleDecreaseCategoryCount = () => {
                  const nextMax = Math.max(10, currentActiveMax - 10);
                  setProjectCategoryCountsMap((prev) => ({
                    ...prev,
                    [cProj.id]: {
                      ...getCategoryCountsForProject(cProj.id),
                      [projectFileCategory]: nextMax,
                    },
                  }));
                };

                const currentProjIndex = customProjects.findIndex((cp) => cp.id === cProj.id);

                return (
                  <div key={cProj.id} style={{ display: 'flex', flexDirection: 'column' }}>
                    {/* 1. Sleek Project Bar: Left = Folder Logo (Click to show/hide All Projects with Prev/Next & Editor), Center = Project Name, Right = 3-Dots */}
                    <div
                      onTouchStart={() => handleProjectTouchStart(cProj)}
                      onTouchEnd={handleProjectTouchEnd}
                      onTouchCancel={handleProjectTouchEnd}
                      onMouseDown={() => handleProjectTouchStart(cProj)}
                      onMouseUp={handleProjectTouchEnd}
                      onMouseLeave={handleProjectTouchEnd}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        background: 'linear-gradient(135deg, #18192a 0%, #121422 100%)',
                        border: '1.5px solid #6366f1',
                        borderRadius: '14px',
                        boxShadow: '0 4px 20px rgba(99, 102, 241, 0.25)',
                        gap: '10px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {/* Left: Interactive Folder Logo Button - Clicking shows/hides All Projects (Previous/Next + Editor) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsProjectFolderOpen((prev) => !prev);
                        }}
                        style={{
                          position: 'relative',
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: isProjectFolderOpen ? '#6366f1' : 'rgba(99, 102, 241, 0.2)',
                          border: '1.5px solid #818cf8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '17px',
                          color: isProjectFolderOpen ? '#ffffff' : '#c7d2fe',
                          flexShrink: 0,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        title="Click Folder to view all projects & switch or open in Editor"
                      >
                        <i className={`fas ${isProjectFolderOpen ? 'fa-folder-tree' : 'fa-folder-open'}`}></i>
                        {customProjects.length > 1 && (
                          <span
                            style={{
                              position: 'absolute',
                              top: '-5px',
                              right: '-5px',
                              background: '#10b981',
                              color: '#ffffff',
                              fontSize: '9px',
                              fontWeight: 900,
                              minWidth: '16px',
                              height: '16px',
                              borderRadius: '999px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '0 4px',
                              border: '1.5px solid #0d0f1b',
                            }}
                          >
                            {customProjects.length}
                          </span>
                        )}
                      </button>

                      {/* Middle: Opened/Created Project Name Centered (Also clickable to toggle All Projects folder list) */}
                      <div
                        onClick={() => setIsProjectFolderOpen((prev) => !prev)}
                        style={{
                          flex: 1,
                          minWidth: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          cursor: 'pointer',
                          gap: '6px',
                        }}
                        title="Click to view all projects"
                      >
                        <span
                          style={{
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: '15px',
                            letterSpacing: '0.4px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '100%',
                          }}
                        >
                          {cProj.name}
                        </span>
                      </div>

                      {/* Right: 3-Dots Menu */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProjectActionMenu(cProj);
                        }}
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          background: '#1c1f32',
                          border: '1px solid #313754',
                          color: '#cbd5e1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '15px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          flexShrink: 0
                        }}
                        title="Project Options"
                      >
                        <i className="fas fa-ellipsis-vertical"></i>
                      </button>
                    </div>

                    {/* Collapsible All Projects Folder Panel (Opens when Folder icon on left is clicked; shows Previous/Next + All Projects with Editor & 3-Dots) */}
                    {isProjectFolderOpen && (
                      <div
                        style={{
                          marginTop: '10px',
                          padding: '12px',
                          background: '#0e101d',
                          border: '1.5px solid #4f46e5',
                          borderRadius: '14px',
                          boxShadow: '0 8px 26px rgba(0, 0, 0, 0.5)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                        }}
                      >
                        {/* Header & Previous / Next Project Switcher */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '8px',
                            paddingBottom: '8px',
                            borderBottom: '1px solid #1f243d',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                            <i className="fas fa-folder-open" style={{ color: '#818cf8', fontSize: '14px' }}></i>
                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.4px' }}>
                              ALL PROJECTS ({customProjects.length})
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              disabled={currentProjIndex <= 0}
                              onClick={() => {
                                if (currentProjIndex > 0) {
                                  const prevProj = customProjects[currentProjIndex - 1];
                                  setActiveCustomProjectId(prevProj.id);
                                  showToast(`Switched to project "${prevProj.name}"`);
                                }
                              }}
                              style={{
                                background: currentProjIndex <= 0 ? '#161829' : '#232846',
                                border: '1px solid #31385e',
                                color: currentProjIndex <= 0 ? '#475569' : '#e2e8f0',
                                borderRadius: '7px',
                                padding: '4px 9px',
                                fontSize: '11px',
                                fontWeight: 800,
                                cursor: currentProjIndex <= 0 ? 'default' : 'pointer',
                              }}
                              title="Previous Project"
                            >
                              ‹ Prev
                            </button>
                            <button
                              type="button"
                              disabled={currentProjIndex >= customProjects.length - 1}
                              onClick={() => {
                                if (currentProjIndex < customProjects.length - 1) {
                                  const nextProj = customProjects[currentProjIndex + 1];
                                  setActiveCustomProjectId(nextProj.id);
                                  showToast(`Switched to project "${nextProj.name}"`);
                                }
                              }}
                              style={{
                                background: currentProjIndex >= customProjects.length - 1 ? '#161829' : '#232846',
                                border: '1px solid #31385e',
                                color: currentProjIndex >= customProjects.length - 1 ? '#475569' : '#e2e8f0',
                                borderRadius: '7px',
                                padding: '4px 9px',
                                fontSize: '11px',
                                fontWeight: 800,
                                cursor: currentProjIndex >= customProjects.length - 1 ? 'default' : 'pointer',
                              }}
                              title="Next Project"
                            >
                              Next ›
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsProjectFolderOpen(false)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#94a3b8',
                                fontSize: '14px',
                                cursor: 'pointer',
                                padding: '2px 6px',
                              }}
                              title="Close Folder"
                            >
                              <i className="fas fa-xmark"></i>
                            </button>
                          </div>
                        </div>

                        {/* List of all projects (Previous, Current, Next) with direct Editor button & 3-Dots options menu */}
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '7px',
                            maxHeight: '260px',
                            overflowY: 'auto',
                          }}
                        >
                          {customProjects.map((projItem, idx) => {
                            const isCurrent = projItem.id === cProj.id;
                            const firstEditableFile =
                              projItem.files.find((f) => f.lang === projectFileCategory) ||
                              projItem.files[0];
                            return (
                              <div
                                key={projItem.id}
                                onClick={() => {
                                  setActiveCustomProjectId(projItem.id);
                                  setIsProjectFolderOpen(false);
                                  showToast(`Opened project "${projItem.name}"`);
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '8px',
                                  padding: '9px 12px',
                                  borderRadius: '10px',
                                  background: isCurrent ? 'rgba(99, 102, 241, 0.2)' : '#151829',
                                  border: isCurrent ? '1.5px solid #6366f1' : '1px solid #23273e',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0, flex: 1 }}>
                                  <i
                                    className={`fas ${isCurrent ? 'fa-folder-open' : 'fa-folder'}`}
                                    style={{ color: isCurrent ? '#818cf8' : '#64748b', fontSize: '15px', flexShrink: 0 }}
                                  ></i>
                                  <span
                                    style={{
                                      color: '#f8fafc',
                                      fontSize: '13px',
                                      fontWeight: 800,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {idx + 1}. {projItem.name}
                                  </span>
                                  {isCurrent && (
                                    <span
                                      style={{
                                        fontSize: '9px',
                                        fontWeight: 800,
                                        background: '#6366f1',
                                        color: '#ffffff',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        flexShrink: 0,
                                      }}
                                    >
                                      ACTIVE
                                    </span>
                                  )}
                                </div>

                                {/* Direct Editor Button + 3-Dots Options Button (Delete is inside the 3-Dots menu) */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveCustomProjectId(projItem.id);
                                      setIsProjectFolderOpen(false);
                                      if (firstEditableFile) {
                                        handleOpenCustomProjectFile(projItem, firstEditableFile);
                                      }
                                    }}
                                    style={{
                                      background: 'rgba(14, 165, 233, 0.18)',
                                      border: '1px solid rgba(56, 189, 248, 0.45)',
                                      color: '#38bdf8',
                                      borderRadius: '7px',
                                      padding: '4px 9px',
                                      fontSize: '11px',
                                      fontWeight: 800,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                    }}
                                    title="Open Project in Code Editor"
                                  >
                                    <i className="fas fa-code" style={{ fontSize: '10px' }}></i>
                                    <span>Editor</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedProjectActionMenu(projItem);
                                    }}
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: '#94a3b8',
                                      padding: '4px 6px',
                                      fontSize: '13px',
                                      cursor: 'pointer',
                                    }}
                                    title="Project Options"
                                  >
                                    <i className="fas fa-ellipsis-vertical"></i>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Slight Gap / Spacing */}
                    <div style={{ height: '10px' }} />

                    {/* 2. Six File Category Options: KOTLIN, JAVA, HTML, CSS, JAVASCRIPT, BUILD GRADLE */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        overflowX: 'auto',
                        padding: '8px 10px',
                        background: '#0d0f1b',
                        border: '1.5px solid #1c2035',
                        borderRadius: '12px',
                        marginBottom: '10px',
                        scrollbarWidth: 'none',
                        WebkitOverflowScrolling: 'touch',
                        alignItems: 'center'
                      }}
                    >
                      {[
                        { id: 'Kotlin', label: 'KOTLIN', badge: `${projectCategoryCounts.Kotlin || 10}`, icon: 'fa-android', color: '#a855f7' },
                        { id: 'Java', label: 'JAVA', badge: `${projectCategoryCounts.Java || 10}`, icon: 'fa-java', color: '#ef4444' },
                        { id: 'HTML', label: 'HTML', badge: `${projectCategoryCounts.HTML || 10}`, icon: 'fa-html5', color: '#f97316' },
                        { id: 'CSS', label: 'CSS', badge: `${projectCategoryCounts.CSS || 10}`, icon: 'fa-css3-alt', color: '#38bdf8' },
                        { id: 'JS', label: 'JAVASCRIPT', badge: `${projectCategoryCounts.JS || 10}`, icon: 'fa-js', color: '#eab308' },
                        { id: 'Gradle', label: 'BUILD GRADLE', badge: `${projectCategoryCounts.Gradle || 10}`, icon: 'fa-wrench', color: '#10b981' },
                      ].map((tab) => {
                        const isSel = projectFileCategory === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                              setProjectFileCategory(tab.id as any);
                              setProjectFilePage(0);
                            }}
                            style={{
                              flexShrink: 0,
                              whiteSpace: 'nowrap',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '8px 14px',
                              borderRadius: '9px',
                              fontSize: '11px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              border: isSel ? `1.5px solid ${tab.color}` : '1px solid #23273e',
                              background: isSel ? `${tab.color}22` : '#131523',
                              color: isSel ? tab.color : '#94a3b8',
                              transition: 'all 0.15s ease',
                              boxShadow: isSel ? `0 2px 10px ${tab.color}30` : 'none'
                            }}
                          >
                            <i className={tab.icon.startsWith('fa-wrench') ? 'fas fa-wrench' : `fab ${tab.icon}`} style={{ fontSize: '13px' }}></i>
                            <span>{tab.label}</span>
                            <span
                              style={{
                                fontSize: '9.5px',
                                background: isSel ? tab.color : '#232840',
                                color: isSel ? '#ffffff' : '#94a3b8',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontWeight: 800
                              }}
                            >
                              {tab.badge}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* 3. File Rows for the Selected Category */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {visibleCategoryFiles.length === 0 ? (
                        <div
                          style={{
                            padding: '16px',
                            textAlign: 'center',
                            background: '#121422',
                            border: '1px dashed #282f48',
                            borderRadius: '10px',
                            color: '#94a3b8',
                            fontSize: '12px'
                          }}
                        >
                          No files found in {projectFileCategory}. Click "+ CREATE FILE" above to add one.
                        </div>
                      ) : (
                        visibleCategoryFiles.map((file) => {
                          return (
                            <div
                              key={file.id}
                              onTouchStart={() => handleFileRowTouchStart(cProj, file)}
                              onTouchEnd={handleFileRowTouchEnd}
                              onTouchCancel={handleFileRowTouchEnd}
                              onMouseDown={() => handleFileRowTouchStart(cProj, file)}
                              onMouseUp={handleFileRowTouchEnd}
                              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#6366f1')}
                              onMouseLeave={(e) => {
                                handleFileRowTouchEnd();
                                e.currentTarget.style.borderColor = '#1f2338';
                              }}
                              onClick={() => handleOpenCustomProjectFile(cProj, file)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 14px',
                                background: '#121422',
                                border: '1px solid #1f2338',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                                <i
                                  className={getCustomFileIcon(file.name, file.lang)}
                                  style={{ color: getCustomFileColor(file.name, file.lang), fontSize: '17px', flexShrink: 0 }}
                                ></i>
                                <span
                                  style={{
                                    color: '#f8fafc',
                                    fontSize: '13.5px',
                                    fontWeight: 700,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {file.name}
                                </span>
                              </div>

                              {/* Right side: Open button & 3-dots button (Delete is inside the 3-dots menu) */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenCustomProjectFile(cProj, file);
                                  }}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#818cf8',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    padding: '6px'
                                  }}
                                  title="Open File in Editor"
                                >
                                  <i className="fas fa-arrow-right"></i>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCustomFileAction({ project: cProj, file });
                                  }}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#94a3b8',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    padding: '6px'
                                  }}
                                  title="File Options"
                                >
                                  <i className="fas fa-ellipsis-vertical"></i>
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* 4. Bottom Increase / Decrease (-10 / +10 from 10 up to 100) Bar below the files */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        marginTop: '12px',
                        padding: '10px 14px',
                        background: '#131422',
                        border: '1px solid #23273e',
                        borderRadius: '12px',
                      }}
                    >
                      <button
                        type="button"
                        disabled={currentActiveMax <= 10}
                        onClick={handleDecreaseCategoryCount}
                        style={{
                          background: currentActiveMax <= 10 ? '#1b1d2e' : '#23273e',
                          border: '1px solid #333854',
                          color: currentActiveMax <= 10 ? '#64748b' : '#f8fafc',
                          padding: '7px 14px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: currentActiveMax <= 10 ? 'default' : 'pointer',
                        }}
                      >
                        - 10
                      </button>

                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#e2e8f0' }}>
                        {projectFileCategory.toUpperCase()}: <span style={{ color: '#38bdf8' }}>{currentActiveMax}</span> / 100
                      </span>

                      <button
                        type="button"
                        disabled={currentActiveMax >= 100}
                        onClick={handleIncreaseCategoryCount}
                        style={{
                          background: currentActiveMax >= 100 ? '#1b1d2e' : '#0284c7',
                          border: currentActiveMax >= 100 ? '1px solid #333854' : '1px solid #38bdf8',
                          color: currentActiveMax >= 100 ? '#64748b' : '#ffffff',
                          padding: '7px 14px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: currentActiveMax >= 100 ? 'default' : 'pointer',
                        }}
                      >
                        + 10
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Clean empty state when no custom projects exist */}
          {customProjects.length === 0 && (
            <div
              style={{
                padding: '30px 20px',
                textAlign: 'center',
                background: '#121422',
                border: '1px dashed #282f48',
                borderRadius: '14px',
                color: '#94a3b8',
                marginTop: '16px'
              }}
            >
              <i className="fas fa-folder-plus" style={{ fontSize: '32px', color: '#6366f1', marginBottom: '10px', display: 'block' }}></i>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>No projects found</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Click "+ CREATE PROJECT" above to start your workspace</div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TUTORIALS */}
      {activeTab === 'tutorials' && (
        <div className="studio-tab-content">
          {/* Prominent Full-Width + CREATE TUTORIAL button (Matches CREATE PROJECT color) */}
          <button
            className="studio-action-btn btn-primary"
            style={{
              width: '100%',
              height: '46px',
              fontSize: '14px',
              fontWeight: 800,
              borderRadius: '12px',
              marginBottom: '12px',
              background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              letterSpacing: '0.5px'
            }}
            onClick={() => {
              setNewTutorialLangInput(tutorialSectorFilter === 'all' ? 'Kotlin' : tutorialSectorFilter);
              setIsCreateTutorialModalOpen(true);
            }}
          >
            <i className="fas fa-plus-circle" style={{ fontSize: '18px' }}></i>
            <span>CREATE TUTORIAL</span>
          </button>

          {/* Tutorials Sector Filter Chips (Each sector scales from 10 up to 100 independently, just like Projects) */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              padding: '8px 10px',
              background: '#0d0f1b',
              border: '1.5px solid #1c2035',
              borderRadius: '12px',
              marginBottom: '12px',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch',
              alignItems: 'center'
            }}
          >
            {[
              { id: 'Kotlin', label: 'KOTLIN COMPOSE', badge: `${tutorialCategoryCounts.Kotlin || 10}`, icon: 'fab fa-android', color: '#a855f7' },
              { id: 'Java', label: 'ANDROID JAVA', badge: `${tutorialCategoryCounts.Java || 10}`, icon: 'fab fa-java', color: '#ef4444' },
              { id: 'HTML', label: 'HTML & WEB', badge: `${tutorialCategoryCounts.HTML || 10}`, icon: 'fab fa-html5', color: '#f97316' },
              { id: 'Dart', label: 'FLUTTER DART', badge: `${tutorialCategoryCounts.Dart || 10}`, icon: 'fas fa-feather-pointed', color: '#38bdf8' },
              { id: 'Swift', label: 'IOS SWIFT', badge: `${tutorialCategoryCounts.Swift || 10}`, icon: 'fab fa-apple', color: '#10b981' },
            ].map((sec) => {
              const isSel = activeTutorialCategoryKey === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => {
                    setTutorialSectorFilter(sec.id as any);
                    setTutorialPage(0);
                  }}
                  style={{
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '9px',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    border: isSel ? `1.5px solid ${sec.color}` : '1px solid #23273e',
                    background: isSel ? `${sec.color}22` : '#131523',
                    color: isSel ? sec.color : '#94a3b8',
                    transition: 'all 0.15s ease',
                    boxShadow: isSel ? `0 2px 10px ${sec.color}30` : 'none'
                  }}
                >
                  <i className={sec.icon} style={{ fontSize: '13px' }}></i>
                  <span>{sec.label}</span>
                  <span
                    style={{
                      fontSize: '9.5px',
                      background: isSel ? sec.color : '#232840',
                      color: isSel ? '#ffffff' : '#94a3b8',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontWeight: 800
                    }}
                  >
                    {sec.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Clean Standardized Vertical List for Selected Tutorial Category */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {paginatedTutorials.map((tut) => {
              const isOrig = isOriginalTutorial(tut);
              return (
                <div
                  key={tut.id}
                  onClick={() => handleOpenTutorial(tut)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: '#151624',
                    border: '1px solid #23273e',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#10b981')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#23273e')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '9px',
                        background: '#181a2b',
                        border: '1.5px solid #10b981',
                        boxShadow: '0 0 8px rgba(16, 185, 129, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '17px',
                        flexShrink: 0
                      }}
                    >
                      <i className={`fas ${tut.icon}`} style={{ color: '#10b981' }}></i>
                    </div>
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '5px',
                        background: isOrig ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                        color: isOrig ? '#10b981' : '#38bdf8',
                        border: `1px solid ${isOrig ? '#10b98144' : '#38bdf844'}`,
                        flexShrink: 0,
                        letterSpacing: '0.4px'
                      }}
                    >
                      {isOrig ? 'ORIGINAL' : 'CUSTOM'}
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
                      <span
                        style={{
                          fontSize: '13.5px',
                          fontWeight: 700,
                          color: '#f8fafc',
                          letterSpacing: '0.2px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={tut.title}
                      >
                        {tut.title}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          color: '#94a3b8',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {tut.description}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <button
                      type="button"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        padding: '8px 10px',
                        fontSize: '16px',
                        cursor: 'pointer'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setContextTutorial(tut);
                      }}
                      title="Tutorial Options"
                    >
                      <i className="fas fa-ellipsis-vertical"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Increase / Decrease (-10 / +10 from 10 up to 100) Bar for Selected Tutorial Category */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              marginTop: '12px',
              padding: '10px 14px',
              background: '#131422',
              border: '1px solid #23273e',
              borderRadius: '12px'
            }}
          >
            <button
              type="button"
              disabled={currentTutorialMax <= 10}
              onClick={() => {
                const nextVal = Math.max(10, currentTutorialMax - 10);
                setTutorialCategoryCounts((prev) => ({
                  ...prev,
                  [activeTutorialCategoryKey]: nextVal,
                }));
              }}
              style={{
                background: currentTutorialMax <= 10 ? '#1b1d2e' : '#23273e',
                border: '1px solid #333854',
                color: currentTutorialMax <= 10 ? '#64748b' : '#f8fafc',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: currentTutorialMax <= 10 ? 'default' : 'pointer'
              }}
            >
              - 10
            </button>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#e2e8f0' }}>
              {activeTutorialCategoryKey.toUpperCase()}: <span style={{ color: '#10b981' }}>{currentTutorialMax}</span> / 100
            </span>
            <button
              type="button"
              disabled={currentTutorialMax >= 100}
              onClick={() => {
                const nextVal = Math.min(100, currentTutorialMax + 10);
                setTutorialCategoryCounts((prev) => ({
                  ...prev,
                  [activeTutorialCategoryKey]: nextVal,
                }));
              }}
              style={{
                background: currentTutorialMax >= 100 ? '#1b1d2e' : '#059669',
                border: currentTutorialMax >= 100 ? '1px solid #333854' : '1px solid #10b981',
                color: currentTutorialMax >= 100 ? '#64748b' : '#ffffff',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: currentTutorialMax >= 100 ? 'default' : 'pointer'
              }}
            >
              + 10
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: SEARCH */}
      {activeTab === 'search' && (
        <div className="studio-tab-content">
          <div className="studio-search-bar">
            <i className="fas fa-search studio-search-icon"></i>
            <input
              type="text"
              placeholder="Search projects & tutorials..."
              className="studio-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                className="studio-clear-search"
                onClick={() => setSearchQuery('')}
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          {/* Interactive Search Category Filter Pills - Direct answer to user request! */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', marginBottom: '8px' }}>
            <button
              type="button"
              onClick={() => setSearchFilterType('all')}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 800,
                border: searchFilterType === 'all' ? '1.5px solid #007AFF' : '1px solid #23253b',
                background: searchFilterType === 'all' ? 'rgba(0, 122, 255, 0.22)' : '#141523',
                color: searchFilterType === 'all' ? '#38bdf8' : '#94a3b8',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              ALL ({filteredProjects.length + filteredTutorials.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchFilterType('projects');
                showToast(`Filter: Showing ${filteredProjects.length} projects`);
              }}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 800,
                border: searchFilterType === 'projects' ? '1.5px solid #007AFF' : '1px solid #23253b',
                background: searchFilterType === 'projects' ? 'rgba(0, 122, 255, 0.22)' : '#141523',
                color: searchFilterType === 'projects' ? '#38bdf8' : '#94a3b8',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              PROJECTS ({filteredProjects.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchFilterType('tutorials');
                showToast(`Filter: Showing ${filteredTutorials.length} tutorials`);
              }}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 800,
                border: searchFilterType === 'tutorials' ? '1.5px solid #10b981' : '1px solid #23253b',
                background: searchFilterType === 'tutorials' ? 'rgba(16, 185, 129, 0.22)' : '#141523',
                color: searchFilterType === 'tutorials' ? '#10b981' : '#94a3b8',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              TUTORIALS ({filteredTutorials.length})
            </button>
          </div>

          <div className="studio-projects-list" style={{ marginTop: '10px' }}>
            {filteredProjects.length === 0 && filteredTutorials.length === 0 ? (
              <div className="studio-empty-state">No matching projects or tutorials found.</div>
            ) : (
              <>
                {/* 1. PROJECTS SECTION FIRST - Displayed when not filtered to tutorials only */}
                {searchFilterType !== 'tutorials' && filteredProjects.length > 0 && (
                  <>
                    <div
                      className="search-section-header"
                      onClick={() => {
                        setSearchFilterType('projects');
                        showToast(`Showing all ${filteredProjects.length} projects`);
                      }}
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      title="Tap to isolate projects"
                    >
                      <i className="fas fa-folder-open" style={{ color: '#007AFF' }}></i>
                      <span>PROJECTS ({filteredProjects.length})</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTab('projects');
                        }}
                        style={{
                          marginLeft: 'auto',
                          background: 'rgba(0, 122, 255, 0.15)',
                          border: '1px solid rgba(0, 122, 255, 0.35)',
                          color: '#38bdf8',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        VIEW TAB
                      </button>
                    </div>
                    {filteredProjects.map((proj) => {
                      const logoInfo = getProjectLogoInfo(proj);
                      return (
                        <div
                          key={proj.id}
                          className="studio-project-card"
                          onClick={() => handleOpenProject(proj)}
                        >
                          <div className="project-card-left" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '8px',
                              background: '#161826',
                              border: `1px solid ${logoInfo.color}40`,
                              color: logoInfo.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '13px',
                              flexShrink: 0
                            }}>
                              <i className={logoInfo.icon}></i>
                            </div>
                            <span className="project-lang-badge">{proj.lang}</span>
                            <span className="project-name-text">{proj.name}</span>
                          </div>
                          <button
                            type="button"
                            className="project-menu-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setContextProject(proj);
                            }}
                          >
                            <i className="fas fa-ellipsis-vertical"></i>
                          </button>
                        </div>
                      );
                    })}
                  </>
                )}

                {/* 2. TUTORIALS SECTION SECOND - Displayed when not filtered to projects only */}
                {searchFilterType !== 'projects' && filteredTutorials.length > 0 && (
                  <>
                    <div
                      className="search-section-header tut-header"
                      style={{ marginTop: searchFilterType === 'all' && filteredProjects.length > 0 ? '16px' : '0', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      onClick={() => {
                        setSearchFilterType('tutorials');
                        showToast(`Showing ${filteredTutorials.length} tutorials`);
                      }}
                    >
                      <i className="fas fa-book-bookmark" style={{ color: '#10b981' }}></i>
                      <span>TUTORIALS ({filteredTutorials.length})</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTab('tutorials');
                        }}
                        style={{
                          marginLeft: 'auto',
                          background: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid rgba(16, 185, 129, 0.35)',
                          color: '#10b981',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        VIEW TAB
                      </button>
                    </div>
                    {filteredTutorials.map((tut) => (
                      <div
                        key={tut.id}
                        className="studio-tutorial-card"
                        onClick={() => handleOpenTutorial(tut)}
                      >
                        <div className="tut-icon-box">
                          <i className={`fas ${tut.icon}`}></i>
                        </div>
                        <div className="tut-info">
                          <h3 className="tut-title">{tut.title}</h3>
                          <p className="tut-desc">{tut.description}</p>
                        </div>
                        <button
                          type="button"
                          className="project-menu-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setContextTutorial(tut);
                          }}
                        >
                          <i className="fas fa-ellipsis-vertical"></i>
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: LAYOUT */}
      {activeTab === 'blocks' && (
        <div className="studio-tab-content">
          {/* Clean Layout Header Bar: Logo & Uppercase Title on Left, Elongated CREATE on Right */}
          <div
            className="block-header-compact"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              marginBottom: '14px',
              background: '#161622',
              border: '1px solid #28283d',
              borderRadius: '12px'
            }}
          >
            <div className="block-header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                className="block-logo-badge"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(124, 58, 237, 0.18)',
                  border: '1px solid rgba(124, 58, 237, 0.35)',
                  color: '#c084fc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px'
                }}
              >
                <i className="fas fa-layer-group"></i>
              </div>
              <h2
                className="block-header-title"
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '1.2px',
                  margin: 0
                }}
              >
                LAYOUT
              </h2>
            </div>
            <button
              className="studio-action-btn btn-primary"
              style={{
                padding: '10px 24px',
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap'
              }}
              onClick={() => setIsCreateBlockModalOpen(true)}
            >
              <i className="fas fa-plus-circle"></i>
              <span>CREATE LAYOUT</span>
            </button>
          </div>

          {/* Quick Actions Row: Compile Blocks to Project */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <button
              className="studio-action-btn btn-secondary"
              style={{ flex: 1, fontSize: '12px', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              onClick={handleCompileBlocksToProject}
              title="Compile all ordered blocks into a working HTML project"
            >
              <i className="fas fa-wand-magic-sparkles" style={{ color: '#38bdf8' }}></i>
              <span>Compile & Open Project</span>
            </button>
            <button
              className="studio-action-btn btn-secondary"
              style={{ flex: '0 0 auto', fontSize: '12px', padding: '8px 12px' }}
              onClick={() => {
                setBlocksList(DEFAULT_BLOCKS);
                showToast('Reset blocks to default sequence!');
              }}
              title="Reset default blocks"
            >
              <i className="fas fa-rotate-left"></i>
            </button>
          </div>

          {/* 3 Categories Filter Chips: UI, LOGIC, STYLE (Each scales independently from 10 up to 100 just like Projects) */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            {[
              { id: 'ui', label: 'UI', badge: `${layoutCategoryCounts.ui || 10}`, color: '#10b981', textColor: '#4ade80' },
              { id: 'logic', label: 'LOGIC', badge: `${layoutCategoryCounts.logic || 10}`, color: '#38bdf8', textColor: '#38bdf8' },
              { id: 'style', label: 'STYLE', badge: `${layoutCategoryCounts.style || 10}`, color: '#f59e0b', textColor: '#fbbf24' },
            ].map((cat) => {
              const isSel = activeLayoutCategoryKey === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setLayoutCategoryFilter(cat.id as any);
                    setLayoutPage(0);
                  }}
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '9px 10px',
                    borderRadius: '9px',
                    border: isSel ? `1.5px solid ${cat.color}` : '1px solid #28283d',
                    background: isSel ? `${cat.color}26` : '#161622',
                    color: isSel ? cat.textColor : '#94a3b8',
                    fontSize: '11.5px',
                    fontWeight: 800,
                    letterSpacing: '0.4px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{cat.label}</span>
                  <span
                    style={{
                      fontSize: '9.5px',
                      background: isSel ? cat.color : '#232840',
                      color: isSel ? '#ffffff' : '#94a3b8',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontWeight: 800,
                    }}
                  >
                    {cat.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Draggable Blocks List (Paginated 10 per page) */}
          <div className="studio-blocks-workspace">
            {paginatedBlocksList.map((block) => {
              const realIndex = blocksList.findIndex(b => b.id === block.id);
              const isOrig = isOriginalBlock(block);
              return (
              <div
                key={block.id}
                className={`studio-block-card ${draggedBlockIndex === realIndex ? 'dragging' : ''} ${
                  dragOverBlockIndex === realIndex ? 'drag-over' : ''
                }`}
                draggable
                onDragStart={(e) => handleBlockDragStart(e, realIndex)}
                onDragOver={(e) => handleBlockDragOver(e, realIndex)}
                onDrop={(e) => handleBlockDrop(e, realIndex)}
                onDragEnd={handleBlockDragEnd}
              >
                {/* Drag Handle & Reorder controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div
                    className="block-drag-handle"
                    title="Press and drag to reorder"
                  >
                    <i className="fas fa-grip-vertical"></i>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <button
                      type="button"
                      disabled={realIndex <= 0}
                      onClick={() => handleMoveBlockUp(realIndex)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: realIndex <= 0 ? '#334155' : '#94a3b8',
                        padding: '1px 3px',
                        cursor: realIndex <= 0 ? 'default' : 'pointer',
                        fontSize: '10px'
                      }}
                      title="Move block up"
                    >
                      <i className="fas fa-chevron-up"></i>
                    </button>
                    <button
                      type="button"
                      disabled={realIndex >= blocksList.length - 1}
                      onClick={() => handleMoveBlockDown(realIndex)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: realIndex >= blocksList.length - 1 ? '#334155' : '#94a3b8',
                        padding: '1px 3px',
                        cursor: realIndex >= blocksList.length - 1 ? 'default' : 'pointer',
                        fontSize: '10px'
                      }}
                      title="Move block down"
                    >
                      <i className="fas fa-chevron-down"></i>
                    </button>
                  </div>
                </div>

                {/* Block Info: Bold Uppercase Keywords Centered, No Cramped Summary */}
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding: '0 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span
                      className={`block-badge-type block-badge-${block.type}`}
                      style={{
                        textTransform: 'uppercase',
                        fontWeight: 800,
                        fontSize: '9px',
                        letterSpacing: '0.6px',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}
                    >
                      {block.type}
                    </span>
                    <span
                      style={{
                        fontSize: '8px',
                        fontWeight: 800,
                        padding: '1px 5px',
                        borderRadius: '4px',
                        background: isOrig ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                        color: isOrig ? '#10b981' : '#38bdf8',
                        border: `1px solid ${isOrig ? '#10b98144' : '#38bdf844'}`,
                        letterSpacing: '0.4px'
                      }}
                    >
                      {isOrig ? 'ORIGINAL' : 'CUSTOM'}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 800,
                      color: '#f8fafc',
                      letterSpacing: '0.6px',
                      textTransform: 'uppercase',
                      textAlign: 'center',
                      lineHeight: '1.3'
                    }}
                  >
                    {block.name.toUpperCase()}
                  </div>
                </div>

                {/* Sleek Glowing Circular Play Button & 3-Dots Menu (Delete is inside the 3-Dots menu) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handleRunSingleBlock(block)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.45)',
                      color: '#38bdf8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 2px 8px rgba(56, 189, 248, 0.25)'
                    }}
                    title="Preview Block"
                  >
                    <i className="fas fa-play" style={{ marginLeft: '1px' }}></i>
                  </button>
                  <button
                    type="button"
                    className="project-menu-btn"
                    onClick={() => setContextBlock(block)}
                    title="Block options"
                  >
                    <i className="fas fa-ellipsis-vertical"></i>
                  </button>
                </div>
              </div>
              );
            })}
          </div>

          {/* Bottom Increase / Decrease (-10 / +10 from 10 up to 100) Bar for Selected Layout Category */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              marginTop: '12px',
              padding: '10px 14px',
              background: '#131422',
              border: '1px solid #23273e',
              borderRadius: '12px'
            }}
          >
            <button
              type="button"
              disabled={currentLayoutMax <= 10}
              onClick={() => {
                const nextVal = Math.max(10, currentLayoutMax - 10);
                setLayoutCategoryCounts((prev) => ({
                  ...prev,
                  [activeLayoutCategoryKey]: nextVal,
                }));
              }}
              style={{
                background: currentLayoutMax <= 10 ? '#1b1d2e' : '#23273e',
                border: '1px solid #333854',
                color: currentLayoutMax <= 10 ? '#64748b' : '#f8fafc',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: currentLayoutMax <= 10 ? 'default' : 'pointer'
              }}
            >
              - 10
            </button>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#e2e8f0' }}>
              {activeLayoutCategoryKey.toUpperCase()}: <span style={{ color: '#c084fc' }}>{currentLayoutMax}</span> / 100
            </span>
            <button
              type="button"
              disabled={currentLayoutMax >= 100}
              onClick={() => {
                const nextVal = Math.min(100, currentLayoutMax + 10);
                setLayoutCategoryCounts((prev) => ({
                  ...prev,
                  [activeLayoutCategoryKey]: nextVal,
                }));
              }}
              style={{
                background: currentLayoutMax >= 100 ? '#1b1d2e' : '#7c3aed',
                border: currentLayoutMax >= 100 ? '1px solid #333854' : '1px solid #a855f7',
                color: currentLayoutMax >= 100 ? '#64748b' : '#ffffff',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: currentLayoutMax >= 100 ? 'default' : 'pointer'
              }}
            >
              + 10
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: CLEAN FULL-SCREEN AI COMMAND BOX + SLIM BOTTOM COMMAND BAR WITH MIDDLE HALF-SCREEN MENU, PLUS ATTACHMENT & TRIANGLE SEND */}
      {activeTab === 'ai' && (
        <div
          className="studio-tab-content"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 108px)',
            padding: '6px',
            boxSizing: 'border-box',
          }}
          onClick={() => {
            setIsAiBoxMenuOpen(false);
            setIsAiAttachMenuOpen(false);
          }}
        >
          {/* Hidden File / Gallery / Video / Folder Inputs for the + Button */}
          <input
            ref={aiPhotoInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleAiAttachmentSelect(e, 'image')}
          />
          <input
            ref={aiVideoInputRef}
            type="file"
            accept="video/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleAiAttachmentSelect(e, 'video')}
          />
          <input
            ref={aiFileInputRef}
            type="file"
            accept="*/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleAiAttachmentSelect(e, 'file')}
          />
          <input
            ref={aiFolderInputRef}
            type="file"
            {...({ webkitdirectory: '', directory: '' } as any)}
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleAiAttachmentSelect(e, 'folder')}
          />

          {/* Main Full-Screen Clean Command Box Container */}
          <div
            style={{
              flex: 1,
              background: '#0b0d18',
              border: '1.5px solid #232946',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.55)',
            }}
          >
            {/* 1. CLEAN EMPTY FULL COMMAND / RESPONSE AREA (Responses appear one by one here; clicking empty area closes half-screen menu) */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
              onClick={() => {
                if (isAiBoxMenuOpen) setIsAiBoxMenuOpen(false);
                if (isAiAttachMenuOpen) setIsAiAttachMenuOpen(false);
              }}
            >
              {aiBoxMessages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    background: '#111528',
                    border: '1px solid #263056',
                    borderRadius: '14px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
                  }}
                >
                  {/* User Command & Attached Media/Files */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        fontSize: '12px',
                        color: '#94a3b8',
                        fontWeight: 700,
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#e2e8f0' }}>
                        <i className="fas fa-terminal" style={{ color: '#38bdf8', fontSize: '11px' }}></i>
                        <span>{msg.userPrompt}</span>
                      </span>
                      {msg.platformLabel && (
                        <span
                          style={{
                            fontSize: '9.5px',
                            fontWeight: 800,
                            padding: '2px 7px',
                            borderRadius: '6px',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#34d399',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            flexShrink: 0,
                          }}
                        >
                          {msg.platformLabel}
                        </span>
                      )}
                    </div>

                    {/* Attached Photos / Videos / Files inside message */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
                        {msg.attachments.map((att) => (
                          <div
                            key={att.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 9px',
                              borderRadius: '8px',
                              background: '#19203a',
                              border: '1px solid #2e3b68',
                              fontSize: '11px',
                              color: '#cbd5e1',
                              fontWeight: 700,
                            }}
                          >
                            {att.kind === 'image' && att.previewUrl ? (
                              <img
                                src={att.previewUrl}
                                alt={att.name}
                                style={{ width: '28px', height: '28px', borderRadius: '5px', objectFit: 'cover' }}
                              />
                            ) : att.kind === 'video' && att.previewUrl ? (
                              <video
                                src={att.previewUrl}
                                style={{ width: '28px', height: '28px', borderRadius: '5px', objectFit: 'cover' }}
                              />
                            ) : (
                              <i
                                className={
                                  att.kind === 'folder'
                                    ? 'fas fa-folder-open'
                                    : att.kind === 'video'
                                    ? 'fas fa-film'
                                    : 'fas fa-file-code'
                                }
                                style={{ color: '#fbbf24' }}
                              ></i>
                            )}
                            <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {att.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* AI Direct Answer Summary */}
                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: 'rgba(37, 99, 235, 0.13)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      color: '#f8fafc',
                      fontSize: '13px',
                      lineHeight: '1.55',
                      fontWeight: 600,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    <i className="fas fa-robot" style={{ marginRight: '8px', color: '#38bdf8' }}></i>
                    {msg.summary}
                  </div>

                  {/* Resolved Debug Issues */}
                  {msg.issues && msg.issues.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {msg.issues.map((iss, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '7px',
                            background: '#14182e',
                            border: '1px solid #232b4d',
                            fontSize: '11.5px',
                            color: '#fbbf24',
                          }}
                        >
                          <i className="fas fa-circle-check" style={{ marginRight: '6px', color: '#10b981' }}></i>
                          {iss.line ? `[Line ${iss.line}] ` : ''}{iss.message}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Code Preview & Action Buttons */}
                  {msg.code && (
                    <>
                      <pre
                        style={{
                          margin: 0,
                          padding: '12px',
                          background: '#070913',
                          border: '1px solid #1e2540',
                          borderRadius: '10px',
                          fontSize: '12px',
                          color: '#e2e8f0',
                          maxHeight: '240px',
                          overflow: 'auto',
                          fontFamily: 'monospace',
                        }}
                      >
                        <code>{msg.code}</code>
                      </pre>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => handleApplyAiPracticeCode(msg.code, msg.fileName, false)}
                          style={{
                            height: '36px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: '#ffffff',
                            fontSize: '11px',
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          <i className="fas fa-check" style={{ marginRight: '5px' }}></i>
                          OPEN IN EDITOR
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyAiPracticeCode(msg.code, msg.fileName, true)}
                          style={{
                            height: '36px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                            color: '#ffffff',
                            fontSize: '11px',
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          <i className="fas fa-play" style={{ marginRight: '5px' }}></i>
                          RUN PREVIEW
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(msg.code);
                          }}
                          style={{
                            height: '36px',
                            borderRadius: '8px',
                            border: '1px solid #334155',
                            background: '#1a2138',
                            color: '#f8fafc',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          <i className="fas fa-copy" style={{ marginRight: '5px' }}></i>
                          COPY
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {isAiBoxLoading && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: '#111528',
                    border: '1px solid #263056',
                    color: '#38bdf8',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>AI is generating response...</span>
                </div>
              )}

              <div ref={aiFeedEndRef} />
            </div>

            {/* VERTICAL RIGHT-SIDE HALF-SCREEN OPTIONS DRAWER (Full height top-to-bottom, 52% width on right side, single serial column 1-by-1) */}
            {isAiBoxMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  right: 0,
                  width: '52%',
                  minWidth: '175px',
                  maxWidth: '250px',
                  height: '100%',
                  zIndex: 1005,
                  overflowY: 'auto',
                  background: '#111528',
                  borderLeft: '2px solid #3b4878',
                  padding: '10px 8px',
                  boxShadow: '-12px 0 36px rgba(0, 0, 0, 0.92)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  boxSizing: 'border-box',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Drawer Header with Close Button */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '6px',
                    borderBottom: '1px solid #263056',
                  }}
                >
                  <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.5px' }}>
                    AI STUDIO OPTIONS
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAiBoxMenuOpen(false)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      background: '#1c2340',
                      border: '1px solid #334170',
                      color: '#cbd5e1',
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                {/* SECTION 1: 3 Core AI Studio Modes (Single Serial Column 1-by-1) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.4px' }}>
                    1. AI STUDIO MODE
                  </span>
                  {[
                    { id: 'chat', label: 'AI Chat & Command', icon: 'fas fa-terminal', color: '#38bdf8' },
                    { id: 'generate', label: 'Prompt to App', icon: 'fas fa-wand-magic-sparkles', color: '#10b981' },
                    { id: 'debug', label: 'Debug & Fix Errors', icon: 'fas fa-screwdriver-wrench', color: '#fbbf24' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setAiBoxMode(m.id as any);
                        setIsAiBoxMenuOpen(false);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 9px',
                        borderRadius: '9px',
                        background: aiBoxMode === m.id ? `${m.color}24` : '#181d35',
                        border: aiBoxMode === m.id ? `1.5px solid ${m.color}` : '1px solid #262f52',
                        color: '#f8fafc',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '6px',
                          background: `${m.color}22`,
                          color: m.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          flexShrink: 0,
                        }}
                      >
                        <i className={m.icon}></i>
                      </span>
                      <span style={{ lineHeight: '1.25' }}>{m.label}</span>
                    </button>
                  ))}
                </div>

                <div style={{ height: '1px', background: '#262d4a' }} />

                {/* SECTION 2: All 15 Target Platforms (Single Serial Column 1-by-1 — One below another) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#34d399', letterSpacing: '0.4px' }}>
                    2. PLATFORMS ({AI_TARGET_PLATFORMS.length})
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {AI_TARGET_PLATFORMS.map((plat) => (
                      <button
                        key={plat.id}
                        type="button"
                        onClick={() => {
                          setAiBoxTargetLang(plat.id);
                          setIsAiBoxMenuOpen(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '7px 9px',
                          borderRadius: '9px',
                          border: aiBoxTargetLang === plat.id ? `1.5px solid ${plat.color}` : '1px solid #252d4a',
                          background: aiBoxTargetLang === plat.id ? `${plat.color}24` : '#181c34',
                          color: aiBoxTargetLang === plat.id ? '#ffffff' : '#e2e8f0',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          gap: '8px',
                          textAlign: 'left',
                        }}
                      >
                        <span
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '6px',
                            background: `${plat.color}22`,
                            color: plat.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            flexShrink: 0,
                          }}
                        >
                          <i className={plat.icon}></i>
                        </span>
                        <span style={{ lineHeight: '1.25', wordBreak: 'break-word' }}>{plat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ height: '1px', background: '#262d4a' }} />

                {/* SECTION 3: All 13 Direct AI Quick Commands & Features (Single Serial Column 1-by-1) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.4px' }}>
                    3. AI FEATURES ({AI_QUICK_COMMANDS.length})
                  </span>
                  {AI_QUICK_COMMANDS.map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => {
                        setAiBoxMode('chat');
                        handleExecuteInlineAiCommand(chip.prompt, 'chat');
                      }}
                      style={{
                        width: '100%',
                        background: '#181d35',
                        border: '1px solid #29335c',
                        borderRadius: '9px',
                        padding: '7px 9px',
                        color: '#e2e8f0',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <span
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '6px',
                          background: `${chip.color}22`,
                          color: chip.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          flexShrink: 0,
                        }}
                      >
                        <i className={chip.icon}></i>
                      </span>
                      <span style={{ lineHeight: '1.25' }}>{chip.label}</span>
                    </button>
                  ))}
                </div>

                <div style={{ height: '1px', background: '#262d4a' }} />

                {/* SECTION 4: All 9 Prompt to App Templates (Single Serial Column 1-by-1) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#10b981', letterSpacing: '0.4px' }}>
                    4. APP TEMPLATES ({AI_APP_TEMPLATES.length})
                  </span>
                  {AI_APP_TEMPLATES.map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => {
                        setAiBoxMode('generate');
                        handleExecuteInlineAiCommand(chip.prompt, 'generate');
                      }}
                      style={{
                        width: '100%',
                        background: '#142129',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        borderRadius: '9px',
                        padding: '7px 9px',
                        color: '#e2e8f0',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <span
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '6px',
                          background: `${chip.color}24`,
                          color: chip.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          flexShrink: 0,
                        }}
                      >
                        <i className={chip.icon}></i>
                      </span>
                      <span style={{ lineHeight: '1.25' }}>{chip.label}</span>
                    </button>
                  ))}
                </div>

                <div style={{ height: '1px', background: '#262d4a' }} />

                {/* SECTION 5: One-Tap Scan & Auto-Fix All Errors */}
                <button
                  type="button"
                  onClick={() => {
                    setAiBoxMode('debug');
                    handleExecuteInlineAiCommand(aiBoxCommandInput, 'debug');
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '7px',
                    padding: '9px 10px',
                    borderRadius: '9px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  <i className="fas fa-wrench"></i>
                  <span>SCAN & AUTO-FIX</span>
                </button>
              </div>
            )}

            {/* PLUS (+) ATTACHMENT POPUP MENU (Opens above the Bottom-Left Plus Button) */}
            {isAiAttachMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '112px',
                  left: '10px',
                  zIndex: 1006,
                  width: '220px',
                  background: '#14182e',
                  border: '1.5px solid #35406b',
                  borderRadius: '14px',
                  padding: '8px',
                  boxShadow: '0 -8px 28px rgba(0, 0, 0, 0.88)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => aiPhotoInputRef.current?.click()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                    padding: '8px 10px',
                    borderRadius: '9px',
                    background: '#1b213d',
                    border: '1px solid #2b355e',
                    color: '#f8fafc',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <i className="fas fa-image" style={{ color: '#38bdf8', width: '16px', textAlign: 'center' }}></i>
                  <span>Gallery Photo (ছবি)</span>
                </button>

                <button
                  type="button"
                  onClick={() => aiVideoInputRef.current?.click()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                    padding: '8px 10px',
                    borderRadius: '9px',
                    background: '#1b213d',
                    border: '1px solid #2b355e',
                    color: '#f8fafc',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <i className="fas fa-film" style={{ color: '#f472b6', width: '16px', textAlign: 'center' }}></i>
                  <span>Movie / Video (মুভি)</span>
                </button>

                <button
                  type="button"
                  onClick={() => aiFileInputRef.current?.click()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                    padding: '8px 10px',
                    borderRadius: '9px',
                    background: '#1b213d',
                    border: '1px solid #2b355e',
                    color: '#f8fafc',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <i className="fas fa-file-lines" style={{ color: '#34d399', width: '16px', textAlign: 'center' }}></i>
                  <span>Upload File (ফাইল)</span>
                </button>

                <button
                  type="button"
                  onClick={() => aiFolderInputRef.current?.click()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                    padding: '8px 10px',
                    borderRadius: '9px',
                    background: '#1b213d',
                    border: '1px solid #2b355e',
                    color: '#f8fafc',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <i className="fas fa-folder-plus" style={{ color: '#fbbf24', width: '16px', textAlign: 'center' }}></i>
                  <span>Upload Folder (ফোল্ডার)</span>
                </button>
              </div>
            )}

            {/* 2. BOTTOM ROUNDED COMMAND BOX MATCHING IMG_20261011_211401.png */}
            <div
              style={{
                padding: '6px 8px 8px 8px',
                background: '#0b0d18',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Attached Photo / Movie / File / Folder Preview Strip */}
              {aiBoxAttachments.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                  {aiBoxAttachments.map((att) => (
                    <div
                      key={att.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '3px 8px',
                        borderRadius: '8px',
                        background: '#1b223f',
                        border: '1px solid #334173',
                        fontSize: '11px',
                        color: '#e2e8f0',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {att.kind === 'image' && att.previewUrl ? (
                        <img
                          src={att.previewUrl}
                          alt={att.name}
                          style={{ width: '22px', height: '22px', borderRadius: '4px', objectFit: 'cover' }}
                        />
                      ) : att.kind === 'video' && att.previewUrl ? (
                        <video
                          src={att.previewUrl}
                          style={{ width: '22px', height: '22px', borderRadius: '4px', objectFit: 'cover' }}
                        />
                      ) : (
                        <i
                          className={
                            att.kind === 'folder'
                              ? 'fas fa-folder-open'
                              : att.kind === 'video'
                              ? 'fas fa-film'
                              : 'fas fa-file-code'
                          }
                          style={{ color: '#fbbf24', fontSize: '11px' }}
                        ></i>
                      )}
                      <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {att.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAiBoxAttachments((prev) => prev.filter((x) => x.id !== att.id))}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#f87171',
                          cursor: 'pointer',
                          padding: 0,
                          fontSize: '11px',
                        }}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* UNIQUE HIGH-TECH FLOATING VOICE WAVE CAPSULE (Appears when user is recording or AI is transcribing) */}
              {(isAiMicListening || isAiMicTranscribing || aiVoiceStatusMsg) && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '18px',
                    background: isAiMicListening
                      ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(30, 27, 75, 0.96) 100%)'
                      : isAiMicTranscribing
                      ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(23, 37, 84, 0.96) 100%)'
                      : 'rgba(15, 23, 42, 0.96)',
                    border: isAiMicListening
                      ? '1.5px solid rgba(239, 68, 68, 0.7)'
                      : isAiMicTranscribing
                      ? '1.5px solid rgba(59, 130, 246, 0.75)'
                      : '1.5px solid rgba(16, 185, 129, 0.6)',
                    boxShadow: isAiMicListening
                      ? '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(239, 68, 68, 0.35)'
                      : isAiMicTranscribing
                      ? '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(59, 130, 246, 0.35)'
                      : '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 16px rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    backdropFilter: 'blur(12px)',
                    transition: 'all 0.25s ease',
                  }}
                >
                  {/* Header Row: Status badge + Timer + 7-Bar Sound Wave + Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isAiMicListening ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '3px 10px',
                            borderRadius: '20px',
                            background: 'rgba(239, 68, 68, 0.22)',
                            border: '1px solid rgba(239, 68, 68, 0.6)',
                            color: '#fca5a5',
                            fontSize: '11px',
                            fontWeight: 800,
                            letterSpacing: '0.5px',
                          }}
                        >
                          <span
                            style={{
                              width: '7px',
                              height: '7px',
                              borderRadius: '50%',
                              background: '#ef4444',
                              boxShadow: '0 0 8px #ef4444',
                            }}
                          />
                          LIVE {formatAiVoiceTimer(aiRecordingSeconds)}
                        </span>
                      ) : isAiMicTranscribing ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '3px 10px',
                            borderRadius: '20px',
                            background: 'rgba(59, 130, 246, 0.22)',
                            border: '1px solid rgba(59, 130, 246, 0.6)',
                            color: '#93c5fd',
                            fontSize: '11px',
                            fontWeight: 800,
                          }}
                        >
                          <i className="fas fa-wand-magic-sparkles fa-spin" style={{ fontSize: '10px' }}></i>
                          AI ট্রান্সক্রাইব করছে...
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '3px 10px',
                            borderRadius: '20px',
                            background: 'rgba(16, 185, 129, 0.22)',
                            border: '1px solid rgba(16, 185, 129, 0.6)',
                            color: '#6ee7b7',
                            fontSize: '11px',
                            fontWeight: 800,
                          }}
                        >
                          <i className="fas fa-check" style={{ fontSize: '10px' }}></i>
                          {aiVoiceStatusMsg}
                        </span>
                      )}

                      <span
                        style={{
                          fontSize: '11px',
                          color: '#94a3b8',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: 600,
                        }}
                      >
                        <i className="fas fa-language" style={{ color: '#38bdf8' }}></i>
                        বাংলা / EN
                      </span>
                    </div>

                    {/* 7-Bar Dynamic Equalizer Sound Wave */}
                    {isAiMicListening && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          height: '24px',
                          padding: '0 4px',
                        }}
                      >
                        {aiVoiceBars.map((barHeight, idx) => (
                          <span
                            key={idx}
                            style={{
                              width: '3.5px',
                              height: `${barHeight}px`,
                              background:
                                idx === 3
                                  ? 'linear-gradient(180deg, #ef4444 0%, #ec4899 100%)'
                                  : idx === 2 || idx === 4
                                  ? 'linear-gradient(180deg, #ec4899 0%, #8b5cf6 100%)'
                                  : 'linear-gradient(180deg, #8b5cf6 0%, #38bdf8 100%)',
                              borderRadius: '3px',
                              transition: 'height 0.06s ease',
                              display: 'block',
                              boxShadow: '0 0 6px rgba(236, 72, 153, 0.6)',
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Quick Action buttons */}
                    {isAiMicListening && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => stopAiVoiceRecording(true)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '9px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            border: 'none',
                            color: '#ffffff',
                            fontSize: '11px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
                          }}
                          title="ভয়েস রেকর্ড সম্পন্ন করুন ও যুক্ত করুন"
                        >
                          <i className="fas fa-check" style={{ fontSize: '10px' }}></i>
                          ডান
                        </button>
                        <button
                          type="button"
                          onClick={() => stopAiVoiceRecording(false)}
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '8px',
                            background: 'rgba(239, 68, 68, 0.18)',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            color: '#f87171',
                            fontSize: '11px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title="বাতিল করুন (Cancel)"
                        >
                          <i className="fas fa-xmark"></i>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Live Audio / Transcribed Text Preview */}
                  {isAiMicListening && (
                    <div
                      style={{
                        fontSize: '12.5px',
                        color: aiLiveSpeechText ? '#f8fafc' : '#94a3b8',
                        fontStyle: aiLiveSpeechText ? 'normal' : 'italic',
                        background: 'rgba(0, 0, 0, 0.35)',
                        padding: '7px 10px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        minHeight: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <i
                        className="fas fa-microphone-lines"
                        style={{ fontSize: '11px', color: '#60a5fa', opacity: 0.85 }}
                      ></i>
                      <span style={{ flex: 1, wordBreak: 'break-word', lineHeight: '1.4' }}>
                        {aiLiveSpeechText || 'কথা বলুন... আপনার কণ্ঠ স্বয়ংক্রিয়ভাবে কমান্ডে রূপান্তরিত হবে'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Rounded Dark Command Card (Exact style from user's screenshot Screenshot_20261011-221808.png) */}
              <div
                style={{
                  background: '#181920',
                  border: '1.5px solid #2e313d',
                  borderRadius: '20px',
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.45)',
                }}
              >
                {/* Top Command Textarea (Clean short placeholder: "কমান্ড লেখো...") */}
                <textarea
                  value={aiBoxCommandInput}
                  onChange={(e) => setAiBoxCommandInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (isAiMicListening) stopAiVoiceRecording();
                      handleExecuteInlineAiCommand();
                    }
                  }}
                  placeholder="কমান্ড লেখো..."
                  rows={2}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: '#f8fafc',
                    fontSize: '14px',
                    lineHeight: '1.45',
                    padding: '0 2px',
                    resize: 'none',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />

                {/* Bottom Action Row inside Rounded Command Box: Left [⊕ Plus] [☰ Options] | Right [🎤 Unique Voice System] [↑ Send] */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}
                >
                  {/* LEFT SIDE: [⊕ Plus Gallery/Files] + [☰ Vertical Half-Screen AI Options] */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* 1. Plus (+) Circle Button (Gallery, Video, File, Folder) */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsAiBoxMenuOpen(false);
                        setIsAiAttachMenuOpen((prev) => !prev);
                      }}
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '12px',
                        background: isAiAttachMenuOpen ? '#2563eb' : '#22242e',
                        border: '1px solid #363947',
                        color: '#e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                      title="Attach Gallery Photo, Video, File, Folder"
                    >
                      <i className="fas fa-circle-plus"></i>
                    </button>

                    {/* 2. Beside Plus Icon: Options Button (Opens Vertical Right-Half Screen All AI Options) */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsAiAttachMenuOpen(false);
                        setIsAiBoxMenuOpen((prev) => !prev);
                      }}
                      style={{
                        height: '38px',
                        padding: '0 11px',
                        borderRadius: '12px',
                        background: isAiBoxMenuOpen
                          ? 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)'
                          : '#22242e',
                        border: isAiBoxMenuOpen ? '1px solid #60a5fa' : '1px solid #363947',
                        color: '#e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                      title="Open Half-Screen AI Options"
                    >
                      <i className="fas fa-bars" style={{ fontSize: '13px', color: '#38bdf8' }}></i>
                      <i
                        className={getAiPlatformById(aiBoxTargetLang).icon}
                        style={{ fontSize: '12px', color: getAiPlatformById(aiBoxTargetLang).color }}
                      ></i>
                    </button>
                  </div>

                  {/* RIGHT SIDE: [🎤 Unique Glowing Equalizer Mic] + [↑ Send Button] */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={toggleAiVoiceRecording}
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '12px',
                        background: isAiMicListening
                          ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                          : isAiMicTranscribing
                          ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                          : '#22242e',
                        border: isAiMicListening
                          ? '1.5px solid #f87171'
                          : isAiMicTranscribing
                          ? '1.5px solid #60a5fa'
                          : '1px solid #363947',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        flexShrink: 0,
                        boxShadow: isAiMicListening
                          ? '0 0 16px rgba(239, 68, 68, 0.85), 0 0 30px rgba(239, 68, 68, 0.4)'
                          : isAiMicTranscribing
                          ? '0 0 16px rgba(59, 130, 246, 0.85)'
                          : 'none',
                        transition: 'all 0.2s ease',
                      }}
                      title={
                        isAiMicListening
                          ? 'ভয়েস বন্ধ করতে ট্যাপ করুন (Tap to Stop)'
                          : isAiMicTranscribing
                          ? 'AI ট্রান্সক্রাইব করছে...'
                          : 'ভয়েসে কথা বলুন (বাংলা / English)'
                      }
                    >
                      {isAiMicListening ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '20px' }}>
                          <span
                            style={{
                              width: '3px',
                              height: `${Math.max(6, Math.min(18, Math.round((aiMicVoiceLevel / 100) * 18)))}px`,
                              background: '#ffffff',
                              borderRadius: '2px',
                              transition: 'height 0.06s ease',
                            }}
                          />
                          <span
                            style={{
                              width: '3px',
                              height: `${Math.max(10, Math.min(22, Math.round((aiMicVoiceLevel / 100) * 24)))}px`,
                              background: '#ffffff',
                              borderRadius: '2px',
                              transition: 'height 0.06s ease',
                            }}
                          />
                          <span
                            style={{
                              width: '3px',
                              height: `${Math.max(6, Math.min(18, Math.round((aiMicVoiceLevel / 100) * 18)))}px`,
                              background: '#ffffff',
                              borderRadius: '2px',
                              transition: 'height 0.06s ease',
                            }}
                          />
                        </div>
                      ) : isAiMicTranscribing ? (
                        <i className="fas fa-wand-magic-sparkles fa-spin" style={{ fontSize: '13px', color: '#ffffff' }}></i>
                      ) : (
                        <i
                          className="fas fa-microphone"
                          style={{ position: 'relative', zIndex: 2, fontSize: '14px', color: '#f1f5f9' }}
                        ></i>
                      )}
                    </button>

                    {/* Send Button (Matches IMG_20261011_211401.png) */}
                    <button
                      type="button"
                      onClick={() => {
                        if (isAiMicListening) stopAiVoiceRecording();
                        handleExecuteInlineAiCommand();
                      }}
                      disabled={isAiBoxLoading}
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '12px',
                        border: '1px solid #363947',
                        background: isAiBoxLoading
                          ? '#334155'
                          : aiBoxCommandInput.trim() || aiBoxAttachments.length > 0
                          ? 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)'
                          : '#22242e',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        cursor: isAiBoxLoading ? 'not-allowed' : 'pointer',
                        flexShrink: 0,
                      }}
                      title="Send Command"
                    >
                      {isAiBoxLoading ? (
                        <i className="fas fa-spinner fa-spin" style={{ fontSize: '12px' }}></i>
                      ) : (
                        <i className="fas fa-arrow-up"></i>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Clean New Project Modal (Ash/Slate aesthetic matching user specification) */}
      {isCreateProjectModalOpen && (
        <div
          className="studio-modal-overlay"
          onClick={() => setIsCreateProjectModalOpen(false)}
        >
          <div
            className="studio-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '400px',
              width: '92%',
              padding: '24px 20px',
              borderRadius: '20px',
              background: '#161824',
              border: '1.5px solid #2d334d',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)'
            }}
          >
            {/* Header: Folder Logo and NEW PROJECT in center */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '18px'
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.25) 0%, rgba(0, 122, 255, 0.2) 100%)',
                  border: '1.5px solid #007AFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  color: '#38bdf8',
                  boxShadow: '0 4px 18px rgba(0, 122, 255, 0.35)'
                }}
              >
                <i className="fas fa-folder-plus"></i>
              </div>
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '1px',
                  margin: 0,
                  textAlign: 'center'
                }}
              >
                NEW PROJECT
              </h2>
            </div>

            {/* "PROJECT NAME" Centered Directly Above the Box */}
            <div style={{ marginBottom: '8px', textAlign: 'center' }}>
              <label
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  color: '#94a3b8',
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase'
                }}
              >
                PROJECT NAME
              </label>
            </div>

            {/* Input Box: Clean ash styled */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '22px' }}>
              <input
                type="text"
                className="modal-input-field"
                placeholder="Enter project name..."
                value={newProjectNameInput}
                onChange={(e) => setNewProjectNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirmCreateProject();
                }}
                autoFocus
                style={{
                  width: '100%',
                  textAlign: 'center',
                  fontSize: '15px',
                  fontWeight: 600,
                  padding: '12px 36px 12px 14px',
                  marginBottom: 0,
                  background: '#232840',
                  border: '1.5px solid #384266',
                  borderRadius: '12px',
                  color: '#f8fafc'
                }}
              />
              {newProjectNameInput && (
                <button
                  type="button"
                  onClick={() => setNewProjectNameInput('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: '#2b314a',
                    border: 'none',
                    borderRadius: '50%',
                    color: '#94a3b8',
                    width: '22px',
                    height: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                  title="Clear"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>

            {/* Exactly Two Buttons: BACK and CREATE */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.3fr',
                gap: '10px'
              }}
            >
              <button
                type="button"
                className="modal-btn modal-btn-cancel"
                onClick={() => setIsCreateProjectModalOpen(false)}
                style={{
                  height: '44px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '13px',
                  letterSpacing: '0.5px',
                  background: '#282e44',
                  border: '1px solid #3b4465',
                  color: '#cbd5e1'
                }}
              >
                <i className="fas fa-arrow-left" style={{ marginRight: '6px' }}></i>
                BACK
              </button>
              <button
                type="button"
                className="modal-btn modal-btn-create"
                onClick={handleConfirmCreateProject}
                style={{
                  height: '44px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '13px',
                  letterSpacing: '0.5px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #007AFF 100%)',
                  boxShadow: '0 4px 16px rgba(0, 122, 255, 0.45)',
                  border: 'none',
                  color: '#ffffff'
                }}
              >
                <i className="fas fa-plus" style={{ marginRight: '6px' }}></i>
                CREATE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create File Inside Project Modal */}
      {isCreateFileInProjModalOpen && targetProjectForFile && (
        <div
          className="studio-modal-overlay"
          onClick={() => setIsCreateFileInProjModalOpen(false)}
        >
          <div
            className="studio-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '380px',
              width: '92%',
              padding: '22px 18px',
              borderRadius: '18px',
              background: '#161824',
              border: '1.5px solid #2d334d',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: 800, color: '#ffffff' }}>
                CREATE NEW FILE
              </h3>
              <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 600 }}>
                In project: {targetProjectForFile.name}
              </span>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>
                File Name:
              </label>
              <input
                type="text"
                className="modal-input-field"
                placeholder="e.g. MyHelper, utils, styles"
                value={newFileInProjName}
                onChange={(e) => setNewFileInProjName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirmCreateFileInProject();
                }}
                autoFocus
                style={{
                  width: '100%',
                  fontSize: '14px',
                  fontWeight: 600,
                  padding: '10px 14px',
                  marginBottom: 0,
                  background: '#1f2233',
                  border: '1.5px solid #333a54',
                  borderRadius: '10px',
                  color: '#f8fafc'
                }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>
                Select File Category / Type:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px', width: '100%' }}>
                {[
                  { id: 'Kotlin', ext: '.kt', label: 'KOTLIN', icon: 'fa-android', color: '#a855f7' },
                  { id: 'Java', ext: '.java', label: 'JAVA', icon: 'fa-java', color: '#ef4444' },
                  { id: 'HTML', ext: '.html', label: 'HTML', icon: 'fa-html5', color: '#f97316' },
                  { id: 'CSS', ext: '.css', label: 'CSS', icon: 'fa-css3-alt', color: '#38bdf8' },
                  { id: 'JS', ext: '.js', label: 'JAVASCRIPT', icon: 'fa-js', color: '#eab308' },
                  { id: 'Gradle', ext: '.gradle', label: 'BUILD GRADLE', icon: 'fa-wrench', color: '#10b981' },
                ].map((item) => {
                  const isSel = newFileInProjLang === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setNewFileInProjLang(item.id as any)}
                      style={{
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                        padding: '10px 6px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        background: isSel ? `${item.color}25` : '#1b1e2e',
                        border: isSel ? `1.5px solid ${item.color}` : '1px solid #282e45',
                        color: isSel ? item.color : '#cbd5e1',
                        fontSize: '10.5px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <i className={item.icon.startsWith('fa-wrench') ? 'fas fa-wrench' : `fab ${item.icon}`} style={{ fontSize: '12px', flexShrink: 0 }}></i>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.label} ({item.ext})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsCreateFileInProjModalOpen(false)}
                style={{
                  height: '42px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '13px',
                  background: '#23283c',
                  border: '1px solid #333a52',
                  color: '#cbd5e1',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCreateFileInProject}
                style={{
                  height: '42px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '13px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
                }}
              >
                Create File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IN-APP CONFIRM DELETE MODAL (Reliable, never blocked by browser) */}
      {deleteConfirmItem && (
        <div
          className="studio-modal-overlay"
          onClick={() => setDeleteConfirmItem(null)}
          style={{ zIndex: 99999 }}
        >
          <div
            className="studio-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '360px',
              width: '90%',
              padding: '24px 20px',
              borderRadius: '18px',
              background: '#161824',
              border: '1.5px solid #2d334d',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85)'
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1.5px solid #ef4444',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                margin: '0 auto 14px'
              }}
            >
              <i className="fas fa-trash-can"></i>
            </div>
            <h3 style={{ color: '#ffffff', fontSize: '17px', fontWeight: 800, margin: '0 0 8px 0' }}>
              {deleteConfirmItem.type === 'project' ? 'Delete Project?' : 'Delete File?'}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 20px 0', lineHeight: '1.4' }}>
              {deleteConfirmItem.type === 'project'
                ? `Are you sure you want to delete "${deleteConfirmItem.name}"? All files inside this project will be deleted.`
                : `Are you sure you want to delete "${deleteConfirmItem.name}"? This action cannot be undone.`}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  background: '#23283c',
                  border: '1px solid #333a52',
                  color: '#cbd5e1',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  background: '#dc2626',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(220, 38, 38, 0.45)'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Create Tutorial Modal */}
      {isCreateTutorialModalOpen && (
        <div
          className="studio-modal-overlay"
          onClick={() => setIsCreateTutorialModalOpen(false)}
        >
          <div className="studio-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '410px', width: '92%' }}>
            <h3 className="modal-title">Create New Tutorial</h3>
            <p className="modal-subtitle">Add a custom step-by-step tutorial item:</p>

            <input
              type="text"
              className="modal-input-field"
              placeholder="Tutorial Title (e.g. Neon Glow Box)"
              value={newTutorialTitleInput}
              onChange={(e) => setNewTutorialTitleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmCreateTutorial();
              }}
              style={{ marginBottom: '10px' }}
              autoFocus
            />

            <input
              type="text"
              className="modal-input-field"
              placeholder="Short Description..."
              value={newTutorialDescInput}
              onChange={(e) => setNewTutorialDescInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmCreateTutorial();
              }}
              style={{ marginBottom: '14px' }}
            />

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>
                Select Tutorial Category:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px', width: '100%' }}>
                {[
                  { id: 'Kotlin', label: 'KOTLIN COMPOSE', icon: 'fab fa-android', color: '#a855f7' },
                  { id: 'Java', label: 'ANDROID JAVA', icon: 'fab fa-java', color: '#ef4444' },
                  { id: 'HTML', label: 'HTML & WEB', icon: 'fab fa-html5', color: '#f97316' },
                  { id: 'Dart', label: 'FLUTTER DART', icon: 'fas fa-feather-pointed', color: '#38bdf8' },
                  { id: 'Swift', label: 'IOS SWIFT', icon: 'fab fa-apple', color: '#10b981' },
                ].map((cat) => {
                  const isSel = newTutorialLangInput === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNewTutorialLangInput(cat.id as any)}
                      style={{
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                        padding: '9px 6px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        background: isSel ? `${cat.color}25` : '#10111a',
                        border: isSel ? `1.5px solid ${cat.color}` : '1px solid #232433',
                        color: isSel ? cat.color : '#cbd5e1',
                        fontSize: '10.5px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <i className={cat.icon} style={{ fontSize: '12px', flexShrink: 0 }}></i>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>
                Tutorial Icon:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['fa-cube', 'fa-code', 'fa-wand-magic-sparkles', 'fa-layer-group', 'fa-bolt'].map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setNewTutorialIcon(ic)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      background: newTutorialIcon === ic ? 'rgba(16, 185, 129, 0.25)' : '#10111a',
                      border: newTutorialIcon === ic ? '1px solid #10b981' : '1px solid #232433',
                      color: newTutorialIcon === ic ? '#34d399' : '#94a3b8',
                      cursor: 'pointer'
                    }}
                  >
                    <i className={`fas ${ic}`}></i>
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-buttons-row">
              <button
                type="button"
                className="modal-btn modal-btn-cancel"
                onClick={() => setIsCreateTutorialModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-btn modal-btn-create"
                style={{ background: '#10b981' }}
                onClick={handleConfirmCreateTutorial}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Create Block Modal */}
      {isCreateBlockModalOpen && (
        <div
          className="studio-modal-overlay"
          onClick={() => setIsCreateBlockModalOpen(false)}
        >
          <div className="studio-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px' }}>
            <h3 className="modal-title">Create Visual Block</h3>
            <p className="modal-subtitle">Add a modular interactive block component:</p>

            <input
              type="text"
              className="modal-input-field"
              placeholder="Block Name (e.g. Hero Card)"
              value={newBlockNameInput}
              onChange={(e) => setNewBlockNameInput(e.target.value)}
              style={{ marginBottom: '10px' }}
              autoFocus
            />

            <input
              type="text"
              className="modal-input-field"
              placeholder="Short Summary / Purpose"
              value={newBlockSummaryInput}
              onChange={(e) => setNewBlockSummaryInput(e.target.value)}
              style={{ marginBottom: '12px' }}
            />

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                Block Type:
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {(['ui', 'state', 'logic', 'style'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setNewBlockTypeInput(t)}
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      borderRadius: '6px',
                      textTransform: 'uppercase',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: newBlockTypeInput === t ? '#7c3aed' : '#10111a',
                      border: newBlockTypeInput === t ? '1px solid #a855f7' : '1px solid #232433',
                      color: '#ffffff'
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-buttons-row">
              <button
                type="button"
                className="modal-btn modal-btn-cancel"
                onClick={() => setIsCreateBlockModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-btn modal-btn-create"
                style={{ background: '#7c3aed' }}
                onClick={handleConfirmCreateBlock}
              >
                Add Block
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project 3-Dot Options Bottom Sheet */}
      {contextProject && (
        <div className="studio-modal-overlay" onClick={() => setContextProject(null)}>
          <div className="studio-bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <span className="sheet-title" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                <i className="fas fa-file-code" style={{ color: '#007AFF' }}></i>
                <span>{contextProject.name}</span>
                {isOriginalProject(contextProject) ? (
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: 800,
                      color: '#10b981',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      letterSpacing: '0.5px'
                    }}
                  >
                    ORIGINAL
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: 800,
                      color: '#38bdf8',
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.35)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      letterSpacing: '0.5px'
                    }}
                  >
                    CUSTOM
                  </span>
                )}
              </span>
              <button className="sheet-close" onClick={() => setContextProject(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="sheet-actions">
              <button
                type="button"
                className="sheet-btn"
                onClick={() => {
                  handleOpenProject(contextProject);
                  setContextProject(null);
                }}
              >
                <i className="fas fa-pen-to-square" style={{ color: '#007AFF' }}></i> Open in Practice Editor
              </button>
              <button
                type="button"
                className="sheet-btn"
                onClick={() => {
                  handleRunSingleProjectPreview(contextProject);
                  setContextProject(null);
                }}
              >
                <i className="fas fa-play" style={{ color: '#38bdf8' }}></i> Run / Live Preview
              </button>
              <button
                type="button"
                className="sheet-btn"
                onClick={() => {
                  handleDownloadSpecificProject(contextProject);
                  setContextProject(null);
                }}
              >
                <i className="fas fa-download" style={{ color: '#10b981' }}></i> Save & Download HTML to Device
              </button>
              <button
                type="button"
                className="sheet-btn"
                onClick={() => {
                  handleShareProject(contextProject);
                  setContextProject(null);
                }}
              >
                <i className="fas fa-share-nodes" style={{ color: '#38bdf8' }}></i> Share Project Code
              </button>
              <button
                type="button"
                className="sheet-btn"
                onClick={() => {
                  setRenameInput(contextProject.name.replace('.html', ''));
                  setIsRenameModalOpen(true);
                }}
              >
                <i className="fas fa-pen" style={{ color: '#f59e0b' }}></i> Rename Project
              </button>
              <button
                type="button"
                className="sheet-btn"
                onClick={() => handleDuplicateProject(contextProject)}
              >
                <i className="fas fa-copy" style={{ color: '#a855f7' }}></i> Duplicate Project
              </button>
              <button
                type="button"
                className="sheet-btn"
                onClick={() => {
                  onOpenInMainIde(contextProject.html, contextProject.name);
                  setContextProject(null);
                }}
              >
                <i className="fas fa-arrow-up-right-from-square" style={{ color: '#06b6d4' }}></i> Open in Main IDE
              </button>
              {!isOriginalProject(contextProject) ? (
                <button
                  type="button"
                  className="sheet-btn btn-danger"
                  onClick={() => handleDeleteProject(contextProject)}
                >
                  <i className="fas fa-trash-can"></i> Delete Project
                </button>
              ) : (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    color: '#10b981',
                    fontSize: '11px',
                    fontWeight: 700,
                    textAlign: 'center',
                    marginTop: '4px',
                  }}
                >
                  <i className="fas fa-shield-halved" style={{ marginRight: '6px' }}></i>
                  Protected Original Project (Cannot be deleted)
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tutorial 3-Dot Options Bottom Sheet */}
      {contextTutorial && (
        <div className="studio-modal-overlay" onClick={() => setContextTutorial(null)}>
          <div className="studio-bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <span className="sheet-title">
                <i className={`fas ${contextTutorial.icon}`} style={{ marginRight: '8px', color: '#10b981' }}></i>
                {contextTutorial.title}
              </span>
              <button className="sheet-close" onClick={() => setContextTutorial(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="sheet-actions">
              <button
                type="button"
                className="sheet-btn"
                onClick={() => {
                  handleOpenTutorial(contextTutorial);
                  setContextTutorial(null);
                }}
              >
                <i className="fas fa-pen-to-square" style={{ color: '#10b981' }}></i> Open in Practice Editor
              </button>
              <button
                type="button"
                className="sheet-btn"
                onClick={() => {
                  handleShareTutorial(contextTutorial);
                  setContextTutorial(null);
                }}
              >
                <i className="fas fa-share-nodes" style={{ color: '#38bdf8' }}></i> Share Tutorial Code
              </button>
              <button
                type="button"
                className="sheet-btn"
                onClick={async () => {
                  const tut = contextTutorial;
                  setContextTutorial(null);
                  await triggerReliableDownload({
                    textData: tut.html,
                    fileName: `${tut.title}.html`,
                    contentType: 'text/html;charset=utf-8',
                  });
                  showToast(`Downloaded ${tut.title}.html!`);
                }}
              >
                <i className="fas fa-download" style={{ color: '#f59e0b' }}></i> Export Tutorial HTML
              </button>
              <button
                type="button"
                className="sheet-btn"
                onClick={() => {
                  onOpenInMainIde(contextTutorial.html, `${contextTutorial.title}.html`);
                  setContextTutorial(null);
                }}
              >
                <i className="fas fa-arrow-up-right-from-square" style={{ color: '#06b6d4' }}></i> Open in Main IDE
              </button>
              {!isOriginalTutorial(contextTutorial) ? (
                <button
                  type="button"
                  className="sheet-btn btn-danger"
                  onClick={() => handleDeleteTutorial(contextTutorial)}
                >
                  <i className="fas fa-trash-can"></i> Delete Tutorial
                </button>
              ) : (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    color: '#10b981',
                    fontSize: '11px',
                    fontWeight: 700,
                    textAlign: 'center',
                    marginTop: '4px',
                  }}
                >
                  <i className="fas fa-shield-halved" style={{ marginRight: '6px' }}></i>
                  Protected Original Tutorial (Cannot be deleted)
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Block 3-Dot Options Bottom Sheet */}
      {contextBlock && (
        <div className="studio-modal-overlay" onClick={() => setContextBlock(null)}>
          <div className="studio-bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <span className="sheet-title">
                <i className="fas fa-cubes-stacked" style={{ marginRight: '8px', color: '#a855f7' }}></i>
                {contextBlock.name}
              </span>
              <button className="sheet-close" onClick={() => setContextBlock(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="sheet-actions">
              <button
                type="button"
                className="sheet-btn"
                onClick={() => {
                  handleRunSingleBlock(contextBlock);
                  setContextBlock(null);
                }}
              >
                <i className="fas fa-play" style={{ color: '#38bdf8' }}></i> Test Run Block Preview
              </button>
              <button
                type="button"
                className="sheet-btn"
                onClick={() => {
                  handleShareBlock(contextBlock);
                  setContextBlock(null);
                }}
              >
                <i className="fas fa-share-nodes" style={{ color: '#38bdf8' }}></i> Share Layout Code
              </button>
              <button
                type="button"
                className="sheet-btn"
                onClick={() => handleDuplicateBlock(contextBlock)}
              >
                <i className="fas fa-copy" style={{ color: '#a855f7' }}></i> Duplicate Block
              </button>
              {!isOriginalBlock(contextBlock) ? (
                <button
                  type="button"
                  className="sheet-btn btn-danger"
                  onClick={() => handleDeleteBlock(contextBlock)}
                >
                  <i className="fas fa-trash-can"></i> Delete Layout Block
                </button>
              ) : (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    color: '#10b981',
                    fontSize: '11px',
                    fontWeight: 700,
                    textAlign: 'center',
                    marginTop: '4px',
                  }}
                >
                  <i className="fas fa-shield-halved" style={{ marginRight: '6px' }}></i>
                  Protected Original Layout (Cannot be deleted)
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {isRenameModalOpen && contextProject && (
        <div className="studio-modal-overlay" onClick={() => setIsRenameModalOpen(false)}>
          <div className="studio-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Rename Project</h3>
            <p className="modal-subtitle">Enter a new name for your project:</p>
            <input
              type="text"
              className="modal-input-field"
              value={renameInput}
              onChange={(e) => setRenameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmRename();
              }}
              autoFocus
            />
            <div className="modal-buttons-row">
              <button
                type="button"
                className="modal-btn modal-btn-cancel"
                onClick={() => setIsRenameModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-btn modal-btn-create"
                onClick={handleConfirmRename}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Action Sheet Modal (Triggered on Long-Press / Context Menu of any practice file) */}
      {fileActionSheetProj && (
        <div
          className="studio-modal-overlay"
          onClick={() => setFileActionSheetProj(null)}
          style={{ zIndex: 9999 }}
        >
          <div
            className="studio-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '380px', width: '92%', borderRadius: '16px' }}
          >
            {(() => {
              const pLogo = getProjectLogoInfo(fileActionSheetProj);
              const isOrig = isOriginalProject(fileActionSheetProj);
              return (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: '#161826',
                        border: `1.5px solid ${pLogo.color}`,
                        boxShadow: `0 0 10px ${pLogo.glowColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        flexShrink: 0
                      }}
                    >
                      <i className={pLogo.icon} style={{ color: pLogo.color }}></i>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <h3 style={{ margin: 0, fontSize: '15px', color: '#fff', fontWeight: 800 }}>
                          {fileActionSheetProj.name}
                        </h3>
                        <span
                          style={{
                            fontSize: '8.5px',
                            fontWeight: 800,
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: isOrig ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                            color: isOrig ? '#10b981' : '#38bdf8',
                            border: `1px solid ${isOrig ? '#10b98144' : '#38bdf844'}`
                          }}
                        >
                          {isOrig ? 'ORIGINAL' : 'CUSTOM'}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {fileActionSheetProj.lang} • Practice Workspace File
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFileActionSheetProj(null)}
                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '16px', cursor: 'pointer' }}
                  >
                    <i className="fas fa-xmark"></i>
                  </button>
                </div>
              );
            })()}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  handleOpenProject(fileActionSheetProj);
                  setFileActionSheetProj(null);
                  showToast(`Opened ${fileActionSheetProj.name}`);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  background: '#161926',
                  border: '1px solid #282f45',
                  borderRadius: '10px',
                  color: '#38bdf8',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <i className="fas fa-folder-open"></i>
                <span>Open in Editor</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const p = fileActionSheetProj;
                  setFileActionSheetProj(null);
                  handleShareProject(p);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  background: '#161926',
                  border: '1px solid #282f45',
                  borderRadius: '10px',
                  color: '#38bdf8',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <i className="fas fa-share-nodes"></i>
                <span>Share Project Code</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const p = fileActionSheetProj;
                  setFileActionSheetProj(null);
                  handleDuplicateProject(p);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  background: '#161926',
                  border: '1px solid #282f45',
                  borderRadius: '10px',
                  color: '#c084fc',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <i className="fas fa-copy"></i>
                <span>Duplicate as Editable Custom Project</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  const p = fileActionSheetProj;
                  const codeToCopy = `<!-- ${p.name} -->\n${p.html}\n<style>\n${p.css || ''}\n</style>\n<script>\n${p.js || ''}\n</script>`;
                  try {
                    await navigator.clipboard.writeText(codeToCopy);
                    showToast(`Copied code for "${p.name}"!`);
                  } catch {
                    showToast('Failed to copy to clipboard');
                  }
                  setFileActionSheetProj(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  background: '#161926',
                  border: '1px solid #282f45',
                  borderRadius: '10px',
                  color: '#60a5fa',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <i className="fas fa-clipboard"></i>
                <span>Copy Project Code</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const p = fileActionSheetProj;
                  setFileActionSheetProj(null);
                  if (isOriginalProject(p)) {
                    showToast('Original 100 templates cannot be renamed. Duplicating as custom project...');
                    handleDuplicateProject(p);
                    return;
                  }
                  setContextProject(p);
                  setRenameInput(p.name.replace(/\.html$/, ''));
                  setIsRenameModalOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  background: '#161926',
                  border: '1px solid #282f45',
                  borderRadius: '10px',
                  color: '#facc15',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <i className="fas fa-pen-to-square"></i>
                <span>Rename File</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const targetProj = customProjects[0] || null;
                  setFileActionSheetProj(null);
                  if (targetProj) {
                    setTargetProjectForFile(targetProj);
                    setNewFileInProjName('');
                    setNewFileInProjLang(projectFileCategory);
                    setIsCreateFileInProjModalOpen(true);
                  } else {
                    setNewProjectNameInput('');
                    setIsCreateProjectModalOpen(true);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  background: '#161926',
                  border: '1px solid #282f45',
                  borderRadius: '10px',
                  color: '#34d399',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <i className="fas fa-plus-circle"></i>
                <span>Create New File</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleExportSingleProject(fileActionSheetProj);
                  setFileActionSheetProj(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  background: '#161926',
                  border: '1px solid #282f45',
                  borderRadius: '10px',
                  color: '#a855f7',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <i className="fas fa-file-arrow-down"></i>
                <span>Download / Export HTML</span>
              </button>

              <div style={{ height: '1px', background: '#25293d', margin: '4px 0' }} />

              {/* Only custom files can be deleted; original template files cannot be deleted */}
              {!isOriginalProject(fileActionSheetProj) ? (
                <button
                  type="button"
                  onClick={() => {
                    const p = fileActionSheetProj;
                    setFileActionSheetProj(null);
                    setDeleteConfirmItem({
                      type: 'practice_file',
                      id: p.id,
                      name: p.name,
                    });
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    background: 'rgba(239, 68, 68, 0.18)',
                    border: '1px solid rgba(239, 68, 68, 0.45)',
                    borderRadius: '10px',
                    color: '#f87171',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <i className="fas fa-trash-can"></i>
                  <span>Delete File ({fileActionSheetProj.name})</span>
                </button>
              ) : (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    color: '#10b981',
                    fontSize: '11px',
                    fontWeight: 700,
                    textAlign: 'center',
                    marginTop: '2px'
                  }}
                >
                  <i className="fas fa-shield-halved" style={{ marginRight: '6px' }}></i>
                  Protected Original File (Cannot be deleted)
                </div>
              )}

              <button
                type="button"
                onClick={handleDeleteAllCustomFiles}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '10px',
                  color: '#f87171',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <i className="fas fa-triangle-exclamation"></i>
                <span>Reset Workspace (Restore Default 100 Files)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Project 3-Dot Options Bottom Sheet */}
      {selectedProjectActionMenu && (
        <div
          className="studio-modal-overlay"
          onClick={() => setSelectedProjectActionMenu(null)}
          style={{ zIndex: 9999 }}
        >
          <div
            className="studio-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '380px', width: '92%', borderRadius: '16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(99, 102, 241, 0.2)',
                    border: '1.5px solid #818cf8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    color: '#c7d2fe'
                  }}
                >
                  <i className="fas fa-folder-open"></i>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', color: '#fff', fontWeight: 800 }}>
                    {selectedProjectActionMenu.name}
                  </h3>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    Project • {selectedProjectActionMenu.files.length} total files
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProjectActionMenu(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '16px', cursor: 'pointer' }}
              >
                <i className="fas fa-xmark"></i>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  const proj = selectedProjectActionMenu;
                  setSelectedProjectActionMenu(null);
                  setTargetProjectForFile(proj);
                  setNewFileInProjName('');
                  setNewFileInProjLang(projectFileCategory);
                  setIsCreateFileInProjModalOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  background: '#161926',
                  border: '1px solid #282f45',
                  borderRadius: '10px',
                  color: '#34d399',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <i className="fas fa-plus-circle"></i>
                <span>Create New File in this Project</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const p = selectedProjectActionMenu;
                  setSelectedProjectActionMenu(null);
                  setRenameInput(p.name);
                  setContextProject({
                    id: p.id,
                    name: p.name,
                    lang: 'HTML',
                    html: '',
                    css: '',
                    js: '',
                    createdAt: p.createdAt
                  });
                  setIsRenameModalOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  background: '#161926',
                  border: '1px solid #282f45',
                  borderRadius: '10px',
                  color: '#facc15',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <i className="fas fa-pen-to-square"></i>
                <span>Rename Project</span>
              </button>

              <div style={{ height: '1px', background: '#25293d', margin: '4px 0' }} />

              {selectedProjectActionMenu.id !== 'custom_proj_welcome' && selectedProjectActionMenu.createdAt !== 'Default' ? (
                <button
                  type="button"
                  onClick={() => {
                    const p = selectedProjectActionMenu;
                    setSelectedProjectActionMenu(null);
                    setDeleteConfirmItem({
                      type: 'project',
                      id: p.id,
                      name: p.name,
                    });
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    background: 'rgba(239, 68, 68, 0.18)',
                    border: '1px solid rgba(239, 68, 68, 0.45)',
                    borderRadius: '10px',
                    color: '#f87171',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <i className="fas fa-trash-can"></i>
                  <span>Delete Project & all files</span>
                </button>
              ) : (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    color: '#10b981',
                    fontSize: '11px',
                    fontWeight: 700,
                    textAlign: 'center',
                    marginTop: '4px',
                  }}
                >
                  <i className="fas fa-shield-halved" style={{ marginRight: '6px' }}></i>
                  Protected Original Project (Cannot be deleted)
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Project File 3-Dot Options Bottom Sheet */}
      {selectedCustomFileAction && (
        <div
          className="studio-modal-overlay"
          onClick={() => setSelectedCustomFileAction(null)}
          style={{ zIndex: 9999 }}
        >
          <div
            className="studio-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '380px', width: '92%', borderRadius: '16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i
                  className={getCustomFileIcon(selectedCustomFileAction.file.name, selectedCustomFileAction.file.lang)}
                  style={{ color: getCustomFileColor(selectedCustomFileAction.file.name, selectedCustomFileAction.file.lang), fontSize: '24px' }}
                ></i>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', color: '#fff', fontWeight: 800 }}>
                      {selectedCustomFileAction.file.name}
                    </h3>
                    <span
                      style={{
                        fontSize: '9px',
                        background: selectedCustomFileAction.file.isOriginal ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                        color: selectedCustomFileAction.file.isOriginal ? '#10b981' : '#38bdf8',
                        border: `1px solid ${selectedCustomFileAction.file.isOriginal ? '#10b98144' : '#38bdf844'}`,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontWeight: 800
                      }}
                    >
                      {selectedCustomFileAction.file.isOriginal ? 'ORIGINAL' : 'CUSTOM'}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {selectedCustomFileAction.file.lang} • In project: {selectedCustomFileAction.project.name}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomFileAction(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '16px', cursor: 'pointer' }}
              >
                <i className="fas fa-xmark"></i>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  const { project, file } = selectedCustomFileAction;
                  setSelectedCustomFileAction(null);
                  handleOpenCustomProjectFile(project, file);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  background: '#161926',
                  border: '1px solid #282f45',
                  borderRadius: '10px',
                  color: '#38bdf8',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <i className="fas fa-arrow-right"></i>
                <span>Open in Editor</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  const { file } = selectedCustomFileAction;
                  try {
                    await navigator.clipboard.writeText(file.content);
                    showToast(`Copied code for "${file.name}"!`);
                  } catch {
                    showToast('Failed to copy code');
                  }
                  setSelectedCustomFileAction(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  background: '#161926',
                  border: '1px solid #282f45',
                  borderRadius: '10px',
                  color: '#60a5fa',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <i className="fas fa-clipboard"></i>
                <span>Copy File Code</span>
              </button>

              {/* Delete File option: ONLY visible for custom user-created files! Original files CANNOT be deleted */}
              {!selectedCustomFileAction.file.isOriginal ? (
                <>
                  <div style={{ height: '1px', background: '#25293d', margin: '4px 0' }} />
                  <button
                    type="button"
                    onClick={() => {
                      const { project, file } = selectedCustomFileAction;
                      setSelectedCustomFileAction(null);
                      setDeleteConfirmItem({
                        type: 'file',
                        parentId: project.id,
                        id: file.id,
                        name: file.name
                      });
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      background: 'rgba(239, 68, 68, 0.18)',
                      border: '1px solid rgba(239, 68, 68, 0.45)',
                      borderRadius: '10px',
                      color: '#f87171',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <i className="fas fa-trash-can"></i>
                    <span>Delete File ({selectedCustomFileAction.file.name})</span>
                  </button>
                </>
              ) : (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    color: '#10b981',
                    fontSize: '11px',
                    fontWeight: 700,
                    textAlign: 'center',
                    marginTop: '4px'
                  }}
                >
                  <i className="fas fa-shield-halved" style={{ marginRight: '6px' }}></i>
                  Protected Original File (Cannot be deleted)
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast feedback notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.96)',
            border: '1px solid #0284c7',
            color: '#38bdf8',
            padding: '10px 20px',
            borderRadius: '24px',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backdropFilter: 'blur(8px)',
          }}
        >
          <i className="fas fa-circle-check" style={{ color: '#10b981' }}></i>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* AI Code Assistant & Debugger & Generator Modal */}
      <AiCodeAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        activeFileName={activeProject ? activeProject.name : 'PracticeCode.kt'}
        currentCode={editorSubTab === 'HTML' ? activeHtml : editorSubTab === 'Kotlin' ? activeKotlin : activeJava}
        onApplyCode={handleApplyAiPracticeCode}
        onShowAlert={(msg) => showToast(msg)}
        initialTab={aiModalTab}
        initialPrompt={aiModalPrompt}
      />
    </div>
  );
};
