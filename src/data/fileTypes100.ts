export interface FileTypeItem {
  id: number;
  displayName: string;
  coreLabel: string;
  fileName: string;
  ext: string;
  category: string;
  icon: string;
  isFolder?: boolean;
  starterContent: (name: string) => string;
}

// Starter generator for all file types
const getStarterContent = (fileName: string, ext: string): string => {
  if (ext === '.html') {
    return `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>App View</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Welcome to App View</h1>\n  <script src="script.js"></script>\n</body>\n</html>\n`;
  }
  if (ext === '.css') {
    return `/* Stylesheet: ${fileName} */\nbody {\n  margin: 0;\n  padding: 16px;\n  background: #0f172a;\n  color: #f8fafc;\n  font-family: sans-serif;\n}\n`;
  }
  if (ext === '.js') {
    return `// JavaScript: ${fileName}\nconsole.log("Initialized: ${fileName}");\n\nfunction initApp() {\n  console.log("App ready");\n}\ninitApp();\n`;
  }
  if (ext === '.ts' || ext === '.tsx') {
    return `// TypeScript Module: ${fileName}\nexport interface AppConfig {\n  appName: string;\n  version: string;\n}\n\nexport const config: AppConfig = {\n  appName: "Android IDE Pro",\n  version: "2.0.0"\n};\n`;
  }
  if (ext === '.java') {
    const className = fileName.replace(/\.[^/.]+$/, '');
    return `package com.myapp.android;\n\nimport android.os.Bundle;\nimport androidx.appcompat.app.AppCompatActivity;\n\npublic class ${className} extends AppCompatActivity {\n    @Override\n    protected void onCreate(Bundle savedInstanceState) {\n        super.onCreate(savedInstanceState);\n    }\n}\n`;
  }
  if (ext === '.kt') {
    const className = fileName.replace(/\.[^/.]+$/, '');
    return `package com.myapp.android\n\nimport android.os.Bundle\nimport androidx.activity.ComponentActivity\n\nclass ${className} : ComponentActivity() {\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n    }\n}\n`;
  }
  if (ext === '.dart') {
    return `import 'package:flutter/material.dart';\n\nclass ${fileName.replace(/\.[^/.]+$/, '')} extends StatelessWidget {\n  const ${fileName.replace(/\.[^/.]+$/, '')}({super.key});\n\n  @override\n  Widget build(BuildContext context) {\n    return const Scaffold(\n      body: Center(child: Text("Hello Flutter")),\n    );\n  }\n}\n`;
  }
  if (ext === '.xml') {
    return `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <!-- Resource file: ${fileName} -->\n</resources>\n`;
  }
  if (ext === '.json') {
    return `{\n  "appName": "My App",\n  "version": "1.0.0",\n  "status": "active"\n}\n`;
  }
  if (ext === '.sql' || ext === '.sqlite') {
    return `-- SQLite Database Schema: ${fileName}\nCREATE TABLE IF NOT EXISTS users (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    name TEXT NOT NULL,\n    email TEXT UNIQUE NOT NULL,\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n`;
  }
  if (ext === '.yaml' || ext === '.yml') {
    return `name: my_app\ndescription: A modern mobile application\nversion: 1.0.0+1\n`;
  }
  if (ext === '.md') {
    return `# Project Documentation\n\nWelcome to your mobile application project.\n`;
  }
  return `// File: ${fileName}\n// Generated in Android IDE\n`;
};

// 100 Clean, exact file and folder names across Web, Android, Flutter, and Backend
export const cleanFileTypes100: FileTypeItem[] = [
  // Web & Common files
  { id: 1, coreLabel: 'HTML', displayName: 'index.html', fileName: 'index.html', ext: '.html', category: 'Web & UI', icon: 'fa-file-code', starterContent: (n) => getStarterContent(n, '.html') },
  { id: 2, coreLabel: 'CSS', displayName: 'style.css', fileName: 'style.css', ext: '.css', category: 'Web & UI', icon: 'fa-css3-alt', starterContent: (n) => getStarterContent(n, '.css') },
  { id: 3, coreLabel: 'JS', displayName: 'script.js', fileName: 'script.js', ext: '.js', category: 'Web & UI', icon: 'fa-js', starterContent: (n) => getStarterContent(n, '.js') },
  { id: 4, coreLabel: 'TS', displayName: 'main.ts', fileName: 'main.ts', ext: '.ts', category: 'Web & UI', icon: 'fa-file-code', starterContent: (n) => getStarterContent(n, '.ts') },
  { id: 5, coreLabel: 'JSX', displayName: 'app.jsx', fileName: 'app.jsx', ext: '.jsx', category: 'Web & UI', icon: 'fa-react', starterContent: (n) => getStarterContent(n, '.ts') },
  { id: 6, coreLabel: 'TSX', displayName: 'component.tsx', fileName: 'component.tsx', ext: '.tsx', category: 'Web & UI', icon: 'fa-react', starterContent: (n) => getStarterContent(n, '.tsx') },
  { id: 7, coreLabel: 'JSON', displayName: 'package.json', fileName: 'package.json', ext: '.json', category: 'Config', icon: 'fa-cube', starterContent: (n) => getStarterContent(n, '.json') },
  { id: 8, coreLabel: 'VITE', displayName: 'vite.config.js', fileName: 'vite.config.js', ext: '.js', category: 'Config', icon: 'fa-bolt', starterContent: (n) => getStarterContent(n, '.js') },
  { id: 9, coreLabel: 'TSCONFIG', displayName: 'tsconfig.json', fileName: 'tsconfig.json', ext: '.json', category: 'Config', icon: 'fa-gear', starterContent: (n) => getStarterContent(n, '.json') },

  // Folders
  { id: 10, coreLabel: 'FOLDER', displayName: 'New Folder', fileName: 'new_folder', ext: '', category: 'Directory', icon: 'fa-folder', isFolder: true, starterContent: () => '' },
  { id: 11, coreLabel: 'COMPONENTS', displayName: 'components/', fileName: 'components', ext: '', category: 'Directory', icon: 'fa-folder', isFolder: true, starterContent: () => '' },
  { id: 12, coreLabel: 'ASSETS', displayName: 'assets/', fileName: 'assets', ext: '', category: 'Directory', icon: 'fa-folder', isFolder: true, starterContent: () => '' },
  { id: 13, coreLabel: 'LIB', displayName: 'lib/', fileName: 'lib', ext: '', category: 'Directory', icon: 'fa-folder', isFolder: true, starterContent: () => '' },
  { id: 14, coreLabel: 'RES', displayName: 'res/', fileName: 'res', ext: '', category: 'Directory', icon: 'fa-folder', isFolder: true, starterContent: () => '' },
  { id: 15, coreLabel: 'SRC', displayName: 'src/', fileName: 'src', ext: '', category: 'Directory', icon: 'fa-folder', isFolder: true, starterContent: () => '' },
  { id: 16, coreLabel: 'MODELS', displayName: 'models/', fileName: 'models', ext: '', category: 'Directory', icon: 'fa-folder', isFolder: true, starterContent: () => '' },
  { id: 17, coreLabel: 'VIEWS', displayName: 'views/', fileName: 'views', ext: '', category: 'Directory', icon: 'fa-folder', isFolder: true, starterContent: () => '' },
  { id: 18, coreLabel: 'SERVICES', displayName: 'services/', fileName: 'services', ext: '', category: 'Directory', icon: 'fa-folder', isFolder: true, starterContent: () => '' },

  // Android Kotlin
  { id: 19, coreLabel: 'KT MAIN', displayName: 'MainActivity.kt', fileName: 'MainActivity.kt', ext: '.kt', category: 'Android Kotlin', icon: 'fa-mobile-screen', starterContent: (n) => getStarterContent(n, '.kt') },
  { id: 20, coreLabel: 'JAVA ACT', displayName: 'Activity.java', fileName: 'Activity.java', ext: '.java', category: 'Android Java', icon: 'fa-mug-hot', starterContent: (n) => getStarterContent(n, '.java') },
  { id: 21, coreLabel: 'KT HOME', displayName: 'HomeScreen.kt', fileName: 'HomeScreen.kt', ext: '.kt', category: 'Android Kotlin', icon: 'fa-layer-group', starterContent: (n) => getStarterContent(n, '.kt') },
  { id: 22, coreLabel: 'KT VM', displayName: 'MainViewModel.kt', fileName: 'MainViewModel.kt', ext: '.kt', category: 'Android Kotlin', icon: 'fa-brain', starterContent: (n) => getStarterContent(n, '.kt') },
  { id: 23, coreLabel: 'REPO', displayName: 'UserRepository.kt', fileName: 'UserRepository.kt', ext: '.kt', category: 'Android Kotlin', icon: 'fa-box-archive', starterContent: (n) => getStarterContent(n, '.kt') },
  { id: 24, coreLabel: 'DAO', displayName: 'UserDao.kt', fileName: 'UserDao.kt', ext: '.kt', category: 'Android Kotlin', icon: 'fa-table', starterContent: (n) => getStarterContent(n, '.kt') },
  { id: 25, coreLabel: 'ENTITY', displayName: 'UserEntity.kt', fileName: 'UserEntity.kt', ext: '.kt', category: 'Android Kotlin', icon: 'fa-database', starterContent: (n) => getStarterContent(n, '.kt') },
  { id: 26, coreLabel: 'DB APP', displayName: 'AppDatabase.kt', fileName: 'AppDatabase.kt', ext: '.kt', category: 'Android Kotlin', icon: 'fa-server', starterContent: (n) => getStarterContent(n, '.kt') },
  { id: 27, coreLabel: 'API KT', displayName: 'ApiService.kt', fileName: 'ApiService.kt', ext: '.kt', category: 'Android Kotlin', icon: 'fa-cloud', starterContent: (n) => getStarterContent(n, '.kt') },
  { id: 28, coreLabel: 'NETWORK', displayName: 'NetworkModule.kt', fileName: 'NetworkModule.kt', ext: '.kt', category: 'Android Kotlin', icon: 'fa-network-wired', starterContent: (n) => getStarterContent(n, '.kt') },
  { id: 29, coreLabel: 'WORKER', displayName: 'SyncWorker.kt', fileName: 'SyncWorker.kt', ext: '.kt', category: 'Android Kotlin', icon: 'fa-clock', starterContent: (n) => getStarterContent(n, '.kt') },
  { id: 30, coreLabel: 'NOTIF', displayName: 'NotificationHelper.kt', fileName: 'NotificationHelper.kt', ext: '.kt', category: 'Android Kotlin', icon: 'fa-bell', starterContent: (n) => getStarterContent(n, '.kt') },
  { id: 31, coreLabel: 'BT KT', displayName: 'BluetoothManager.kt', fileName: 'BluetoothManager.kt', ext: '.kt', category: 'Android Kotlin', icon: 'fa-bluetooth', starterContent: (n) => getStarterContent(n, '.kt') },
  { id: 32, coreLabel: 'CAM X', displayName: 'CameraXHelper.kt', fileName: 'CameraXHelper.kt', ext: '.kt', category: 'Android Kotlin', icon: 'fa-camera', starterContent: (n) => getStarterContent(n, '.kt') },
  { id: 33, coreLabel: 'GPS KT', displayName: 'LocationTracker.kt', fileName: 'LocationTracker.kt', ext: '.kt', category: 'Android Kotlin', icon: 'fa-location-dot', starterContent: (n) => getStarterContent(n, '.kt') },
  { id: 34, coreLabel: 'AUTH KT', displayName: 'BiometricAuth.kt', fileName: 'BiometricAuth.kt', ext: '.kt', category: 'Android Kotlin', icon: 'fa-fingerprint', starterContent: (n) => getStarterContent(n, '.kt') },
  { id: 35, coreLabel: 'AUDIO KT', displayName: 'AudioPlayerService.kt', fileName: 'AudioPlayerService.kt', ext: '.kt', category: 'Android Kotlin', icon: 'fa-music', starterContent: (n) => getStarterContent(n, '.kt') },
  { id: 36, coreLabel: 'DOWNLOAD', displayName: 'DownloadReceiver.kt', fileName: 'DownloadReceiver.kt', ext: '.kt', category: 'Android Kotlin', icon: 'fa-download', starterContent: (n) => getStarterContent(n, '.kt') },

  // Android XML & Resources
  { id: 37, coreLabel: 'MANIFEST', displayName: 'AndroidManifest.xml', fileName: 'AndroidManifest.xml', ext: '.xml', category: 'Android XML', icon: 'fa-file-lines', starterContent: (n) => getStarterContent(n, '.xml') },
  { id: 38, coreLabel: 'LAYOUT', displayName: 'activity_main.xml', fileName: 'activity_main.xml', ext: '.xml', category: 'Android XML', icon: 'fa-object-group', starterContent: (n) => getStarterContent(n, '.xml') },
  { id: 39, coreLabel: 'COLORS', displayName: 'colors.xml', fileName: 'colors.xml', ext: '.xml', category: 'Android XML', icon: 'fa-palette', starterContent: (n) => getStarterContent(n, '.xml') },
  { id: 40, coreLabel: 'STRINGS', displayName: 'strings.xml', fileName: 'strings.xml', ext: '.xml', category: 'Android XML', icon: 'fa-language', starterContent: (n) => getStarterContent(n, '.xml') },
  { id: 41, coreLabel: 'DIMENS', displayName: 'dimens.xml', fileName: 'dimens.xml', ext: '.xml', category: 'Android XML', icon: 'fa-ruler-combined', starterContent: (n) => getStarterContent(n, '.xml') },
  { id: 42, coreLabel: 'STYLES', displayName: 'styles.xml', fileName: 'styles.xml', ext: '.xml', category: 'Android XML', icon: 'fa-brush', starterContent: (n) => getStarterContent(n, '.xml') },
  { id: 43, coreLabel: 'THEMES', displayName: 'themes.xml', fileName: 'themes.xml', ext: '.xml', category: 'Android XML', icon: 'fa-wand-magic-sparkles', starterContent: (n) => getStarterContent(n, '.xml') },
  { id: 44, coreLabel: 'DRAWABLE', displayName: 'drawable_bg.xml', fileName: 'drawable_bg.xml', ext: '.xml', category: 'Android XML', icon: 'fa-image', starterContent: (n) => getStarterContent(n, '.xml') },
  { id: 45, coreLabel: 'ICON XML', displayName: 'ic_launcher.xml', fileName: 'ic_launcher.xml', ext: '.xml', category: 'Android XML', icon: 'fa-android', starterContent: (n) => getStarterContent(n, '.xml') },
  { id: 46, coreLabel: 'MENU', displayName: 'menu_main.xml', fileName: 'menu_main.xml', ext: '.xml', category: 'Android XML', icon: 'fa-bars', starterContent: (n) => getStarterContent(n, '.xml') },
  { id: 47, coreLabel: 'NAV XML', displayName: 'nav_graph.xml', fileName: 'nav_graph.xml', ext: '.xml', category: 'Android XML', icon: 'fa-route', starterContent: (n) => getStarterContent(n, '.xml') },

  // Flutter & Dart
  { id: 48, coreLabel: 'DART MAIN', displayName: 'main.dart', fileName: 'main.dart', ext: '.dart', category: 'Flutter Dart', icon: 'fa-cube', starterContent: (n) => getStarterContent(n, '.dart') },
  { id: 49, coreLabel: 'DART APP', displayName: 'app.dart', fileName: 'app.dart', ext: '.dart', category: 'Flutter Dart', icon: 'fa-cubes', starterContent: (n) => getStarterContent(n, '.dart') },
  { id: 50, coreLabel: 'DART HOME', displayName: 'home_screen.dart', fileName: 'home_screen.dart', ext: '.dart', category: 'Flutter Dart', icon: 'fa-home', starterContent: (n) => getStarterContent(n, '.dart') },
  { id: 51, coreLabel: 'WIDGET', displayName: 'widget.dart', fileName: 'widget.dart', ext: '.dart', category: 'Flutter Dart', icon: 'fa-shapes', starterContent: (n) => getStarterContent(n, '.dart') },
  { id: 52, coreLabel: 'PUBSPEC', displayName: 'pubspec.yaml', fileName: 'pubspec.yaml', ext: '.yaml', category: 'Flutter Config', icon: 'fa-file-code', starterContent: (n) => getStarterContent(n, '.yaml') },
  { id: 53, coreLabel: 'ROUTES', displayName: 'routes.dart', fileName: 'routes.dart', ext: '.dart', category: 'Flutter Dart', icon: 'fa-route', starterContent: (n) => getStarterContent(n, '.dart') },
  { id: 54, coreLabel: 'THEME DART', displayName: 'theme.dart', fileName: 'theme.dart', ext: '.dart', category: 'Flutter Dart', icon: 'fa-palette', starterContent: (n) => getStarterContent(n, '.dart') },
  { id: 55, coreLabel: 'API DART', displayName: 'api_service.dart', fileName: 'api_service.dart', ext: '.dart', category: 'Flutter Dart', icon: 'fa-cloud-arrow-down', starterContent: (n) => getStarterContent(n, '.dart') },
  { id: 56, coreLabel: 'MODEL', displayName: 'user_model.dart', fileName: 'user_model.dart', ext: '.dart', category: 'Flutter Dart', icon: 'fa-file-lines', starterContent: (n) => getStarterContent(n, '.dart') },
  { id: 57, coreLabel: 'NOTIFIER', displayName: 'state_notifier.dart', fileName: 'state_notifier.dart', ext: '.dart', category: 'Flutter Dart', icon: 'fa-sliders', starterContent: (n) => getStarterContent(n, '.dart') },
  { id: 58, coreLabel: 'PROVIDER', displayName: 'auth_provider.dart', fileName: 'auth_provider.dart', ext: '.dart', category: 'Flutter Dart', icon: 'fa-lock', starterContent: (n) => getStarterContent(n, '.dart') },
  { id: 59, coreLabel: 'BUTTON', displayName: 'custom_button.dart', fileName: 'custom_button.dart', ext: '.dart', category: 'Flutter Dart', icon: 'fa-square', starterContent: (n) => getStarterContent(n, '.dart') },
  { id: 60, coreLabel: 'DIALOG', displayName: 'dialog_helper.dart', fileName: 'dialog_helper.dart', ext: '.dart', category: 'Flutter Dart', icon: 'fa-comment', starterContent: (n) => getStarterContent(n, '.dart') },
  { id: 61, coreLabel: 'STORAGE', displayName: 'storage_service.dart', fileName: 'storage_service.dart', ext: '.dart', category: 'Flutter Dart', icon: 'fa-hard-drive', starterContent: (n) => getStarterContent(n, '.dart') },
  { id: 62, coreLabel: 'CACHE', displayName: 'cache_manager.dart', fileName: 'cache_manager.dart', ext: '.dart', category: 'Flutter Dart', icon: 'fa-box', starterContent: (n) => getStarterContent(n, '.dart') },

  // Database, SQL, JSON
  { id: 63, coreLabel: 'SQLITE', displayName: 'database.sqlite', fileName: 'database.sqlite', ext: '.sqlite', category: 'Database', icon: 'fa-database', starterContent: (n) => getStarterContent(n, '.sql') },
  { id: 64, coreLabel: 'SQL', displayName: 'schema.sql', fileName: 'schema.sql', ext: '.sql', category: 'Database', icon: 'fa-table', starterContent: (n) => getStarterContent(n, '.sql') },
  { id: 65, coreLabel: 'MIGRATION', displayName: 'migration_v1.sql', fileName: 'migration_v1.sql', ext: '.sql', category: 'Database', icon: 'fa-arrow-up-right-dots', starterContent: (n) => getStarterContent(n, '.sql') },
  { id: 66, coreLabel: 'DATA JSON', displayName: 'data.json', fileName: 'data.json', ext: '.json', category: 'Data', icon: 'fa-code', starterContent: (n) => getStarterContent(n, '.json') },
  { id: 67, coreLabel: 'MOCK USERS', displayName: 'mock_users.json', fileName: 'mock_users.json', ext: '.json', category: 'Data', icon: 'fa-users', starterContent: (n) => getStarterContent(n, '.json') },
  { id: 68, coreLabel: 'ENDPOINTS', displayName: 'api_endpoints.json', fileName: 'api_endpoints.json', ext: '.json', category: 'Data', icon: 'fa-link', starterContent: (n) => getStarterContent(n, '.json') },

  // Build & Config
  { id: 69, coreLabel: 'GRADLE', displayName: 'build.gradle', fileName: 'build.gradle', ext: '.gradle', category: 'Gradle Build', icon: 'fa-wrench', starterContent: (n) => getStarterContent(n, '.kts') },
  { id: 70, coreLabel: 'GRADLE KTS', displayName: 'build.gradle.kts', fileName: 'build.gradle.kts', ext: '.kts', category: 'Gradle Build', icon: 'fa-screwdriver-wrench', starterContent: (n) => getStarterContent(n, '.kts') },
  { id: 71, coreLabel: 'SETTINGS', displayName: 'settings.gradle', fileName: 'settings.gradle', ext: '.gradle', category: 'Gradle Build', icon: 'fa-sliders', starterContent: (n) => getStarterContent(n, '.kts') },
  { id: 72, coreLabel: 'PROPERTIES', displayName: 'gradle.properties', fileName: 'gradle.properties', ext: '.properties', category: 'Gradle Build', icon: 'fa-gear', starterContent: (n) => getStarterContent(n, '.properties') },
  { id: 73, coreLabel: 'CONFIG YAML', displayName: 'config.yaml', fileName: 'config.yaml', ext: '.yaml', category: 'Config', icon: 'fa-file-code', starterContent: (n) => getStarterContent(n, '.yaml') },
  { id: 74, coreLabel: 'ENV', displayName: 'env.example', fileName: 'env.example', ext: '.env', category: 'Config', icon: 'fa-key', starterContent: (n) => getStarterContent(n, '.env') },
  { id: 75, coreLabel: 'GITIGNORE', displayName: '.gitignore', fileName: '.gitignore', ext: '', category: 'Config', icon: 'fa-shield-halved', starterContent: () => `node_modules/\n.build/\n*.apk\n.env\n` },
  { id: 76, coreLabel: 'README', displayName: 'README.md', fileName: 'README.md', ext: '.md', category: 'Docs', icon: 'fa-book', starterContent: (n) => getStarterContent(n, '.md') },
  { id: 77, coreLabel: 'CHANGELOG', displayName: 'CHANGELOG.md', fileName: 'CHANGELOG.md', ext: '.md', category: 'Docs', icon: 'fa-clock-rotate-left', starterContent: (n) => getStarterContent(n, '.md') },
  { id: 78, coreLabel: 'LICENSE', displayName: 'LICENSE', fileName: 'LICENSE', ext: '', category: 'Docs', icon: 'fa-certificate', starterContent: () => `MIT License\n\nCopyright (c) 2026\n` },

  // Backend & Servers
  { id: 79, coreLabel: 'SERVER JS', displayName: 'server.js', fileName: 'server.js', ext: '.js', category: 'Backend', icon: 'fa-server', starterContent: (n) => getStarterContent(n, '.js') },
  { id: 80, coreLabel: 'SERVER TS', displayName: 'server.ts', fileName: 'server.ts', ext: '.ts', category: 'Backend', icon: 'fa-server', starterContent: (n) => getStarterContent(n, '.ts') },
  { id: 81, coreLabel: 'API PY', displayName: 'api.py', fileName: 'api.py', ext: '.py', category: 'Backend', icon: 'fa-python', starterContent: () => `# Python API Service\nfrom flask import Flask\napp = Flask(__name__)\n\n@app.route('/api')\ndef hello():\n    return {'status': 'ok'}\n` },
  { id: 82, coreLabel: 'DOCKER', displayName: 'Dockerfile', fileName: 'Dockerfile', ext: '', category: 'DevOps', icon: 'fa-docker', starterContent: () => `FROM node:20-alpine\nWORKDIR /app\nCOPY . .\nCMD ["npm", "start"]\n` },

  // C++ NDK
  { id: 83, coreLabel: 'CPP NDK', displayName: 'native-lib.cpp', fileName: 'native-lib.cpp', ext: '.cpp', category: 'NDK C++', icon: 'fa-code-branch', starterContent: () => `#include <jni.h>\n#include <string>\n\nextern "C" JNIEXPORT jstring JNICALL\nJava_com_myapp_android_MainActivity_stringFromJNI(JNIEnv* env, jobject) {\n    return env->NewStringUTF("Hello from C++ NDK");\n}\n` },
  { id: 84, coreLabel: 'CMAKE', displayName: 'CMakeLists.txt', fileName: 'CMakeLists.txt', ext: '.txt', category: 'NDK C++', icon: 'fa-file-lines', starterContent: () => `cmake_minimum_required(VERSION 3.22.1)\nproject("native_app")\nadd_library(native-lib SHARED native-lib.cpp)\n` },

  // Additional Common Files (up to 100)
  { id: 85, coreLabel: 'HEADER', displayName: 'header.html', fileName: 'header.html', ext: '.html', category: 'Web & UI', icon: 'fa-file-code', starterContent: (n) => getStarterContent(n, '.html') },
  { id: 86, coreLabel: 'FOOTER', displayName: 'footer.html', fileName: 'footer.html', ext: '.html', category: 'Web & UI', icon: 'fa-file-code', starterContent: (n) => getStarterContent(n, '.html') },
  { id: 87, coreLabel: 'RESET CSS', displayName: 'reset.css', fileName: 'reset.css', ext: '.css', category: 'Web & UI', icon: 'fa-css3', starterContent: (n) => getStarterContent(n, '.css') },
  { id: 88, coreLabel: 'ANIM CSS', displayName: 'animations.css', fileName: 'animations.css', ext: '.css', category: 'Web & UI', icon: 'fa-wand-magic-sparkles', starterContent: (n) => getStarterContent(n, '.css') },
  { id: 89, coreLabel: 'UTILS JS', displayName: 'utils.js', fileName: 'utils.js', ext: '.js', category: 'Web & UI', icon: 'fa-js', starterContent: (n) => getStarterContent(n, '.js') },
  { id: 90, coreLabel: 'TYPES TS', displayName: 'types.ts', fileName: 'types.ts', ext: '.ts', category: 'Web & UI', icon: 'fa-file-code', starterContent: (n) => getStarterContent(n, '.ts') },
  { id: 91, coreLabel: 'CONST TS', displayName: 'constants.ts', fileName: 'constants.ts', ext: '.ts', category: 'Web & UI', icon: 'fa-file-code', starterContent: (n) => getStarterContent(n, '.ts') },
  { id: 92, coreLabel: 'CONST DART', displayName: 'constants.dart', fileName: 'constants.dart', ext: '.dart', category: 'Flutter Dart', icon: 'fa-cube', starterContent: (n) => getStarterContent(n, '.dart') },
  { id: 93, coreLabel: 'HELPERS', displayName: 'helpers.dart', fileName: 'helpers.dart', ext: '.dart', category: 'Flutter Dart', icon: 'fa-cube', starterContent: (n) => getStarterContent(n, '.dart') },
  { id: 94, coreLabel: 'VALID DART', displayName: 'validators.dart', fileName: 'validators.dart', ext: '.dart', category: 'Flutter Dart', icon: 'fa-check', starterContent: (n) => getStarterContent(n, '.dart') },
  { id: 95, coreLabel: 'CONST KT', displayName: 'AppConstants.kt', fileName: 'AppConstants.kt', ext: '.kt', category: 'Android Kotlin', icon: 'fa-cube', starterContent: (n) => getStarterContent(n, '.kt') },
  { id: 96, coreLabel: 'STR UTILS', displayName: 'StringUtils.kt', fileName: 'StringUtils.kt', ext: '.kt', category: 'Android Kotlin', icon: 'fa-font', starterContent: (n) => getStarterContent(n, '.kt') },
  { id: 97, coreLabel: 'VAL UTILS', displayName: 'ValidationUtils.kt', fileName: 'ValidationUtils.kt', ext: '.kt', category: 'Android Kotlin', icon: 'fa-check-double', starterContent: (n) => getStarterContent(n, '.kt') },
  { id: 98, coreLabel: 'PROGUARD', displayName: 'proguard-rules.pro', fileName: 'proguard-rules.pro', ext: '.pro', category: 'Config', icon: 'fa-shield', starterContent: () => `# ProGuard optimization rules\n-dontwarn\n-keepattributes *Annotation*\n` },
  { id: 99, coreLabel: 'KEYSTORE', displayName: 'keystore.properties', fileName: 'keystore.properties', ext: '.properties', category: 'Config', icon: 'fa-key', starterContent: () => `storeFile=key.jks\nstorePassword=secret\nkeyAlias=release\nkeyPassword=secret\n` },
  { id: 100, coreLabel: 'SECURITY', displayName: 'security_policy.xml', fileName: 'security_policy.xml', ext: '.xml', category: 'Android XML', icon: 'fa-lock', starterContent: (n) => getStarterContent(n, '.xml') }
];
