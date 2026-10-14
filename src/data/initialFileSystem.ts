import { FileNode } from '../types';

export const initialFileSystem: FileNode[] = [
  {
    id: "flutter_root",
    name: "FLUTTER_APP",
    type: "folder",
    isOpen: true,
    children: [
      {
        id: "fl_apk_dl_space",
        name: "APK DOWNLOAD",
        type: "folder",
        isOpen: false,
        children: [
          { id: "fl_apk_dl_space_debug", name: "app-debug.apk", type: "file", content: "APK_BINARY_3_85_MB" },
          { id: "fl_apk_dl_space_release", name: "app-release.apk", type: "file", content: "APK_BINARY_3_85_MB" },
          { id: "fl_apk_dl_space_ide", name: "ANDROID.apk", type: "file", content: "APK_BINARY_3_85_MB" }
        ]
      },
      {
        id: "fl_01",
        name: "01_CORE",
        type: "folder",
        isOpen: false,
        children: [
          {
            id: "fl_main_root",
            name: "main.dart",
            type: "file",
            content: `import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Android IDE Platform',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark(),
      home: const Scaffold(
        body: SafeArea(
          top: true,
          bottom: true,
          child: Center(child: Text('Hello from Flutter IDE')),
        ),
      ),
    );
  }
}`
          },
          { id: "fl_01_cfg_1", name: "app_config.dart", type: "file", content: "class AppConfig {\n  static const String appName = 'Flutter Pro Android';\n  static const String version = '2.4.0';\n}" },
          { id: "fl_01_cfg_2", name: "env.dart", type: "file", content: "enum Environment { dev, staging, prod }\nclass Env {\n  static const Environment current = Environment.dev;\n  static const bool isDebug = true;\n}" },
          { id: "fl_01_const_1", name: "app_constants.dart", type: "file", content: "class AppConstants {\n  static const double defaultPadding = 16.0;\n  static const double borderRadius = 12.0;\n}" },
          { id: "fl_01_utils_1", name: "helpers.dart", type: "file", content: "class Helpers {\n  static void printLog(String msg) => print('[LOG]: $msg');\n  static String formatTimestamp(DateTime dt) => dt.toIso8601String();\n}" },
          { id: "fl_01_utils_2", name: "validators.dart", type: "file", content: "class Validators {\n  static String? validateEmail(String? value) => value != null && value.contains('@') ? null : 'Invalid email';\n  static String? validatePassword(String? p) => p != null && p.length >= 6 ? null : 'Min 6 characters';\n}" }
        ]
      },
      {
        id: "fl_02",
        name: "02_APP",
        type: "folder",
        isOpen: false,
        children: [
          { id: "fl_02_1", name: "app.dart", type: "file", content: "import 'package:flutter/material.dart';\n\nclass MyApp extends StatelessWidget {\n  const MyApp({Key? key}) : super(key: key);\n\n  @override\n  Widget build(BuildContext context) {\n    return MaterialApp(\n      title: 'Android IDE Platform',\n      debugShowCheckedModeBanner: false,\n      theme: ThemeData.dark(),\n      home: const Scaffold(\n        body: Center(child: Text('Hello from Flutter IDE')),\n      ),\n    );\n  }\n}" },
          { id: "fl_02_2", name: "routes.dart", type: "file", content: "class AppRoutes {\n  static const String splash = '/splash';\n  static const String dashboard = '/dashboard';\n  static const String editor = '/editor';\n}" },
          { id: "fl_02_3", name: "app_state.dart", type: "file", content: "class AppState {\n  bool isLoading = false;\n  String? activeUser;\n}" }
        ]
      },
      {
        id: "fl_03",
        name: "03_SCREENS",
        type: "folder",
        isOpen: false,
        children: [
          { id: "fl_03_home_1", name: "home_screen.dart", type: "file", content: "import 'package:flutter/material.dart';\n\nclass HomeScreen extends StatefulWidget {\n  @override\n  _HomeScreenState createState() => _HomeScreenState();\n}\n\nclass _HomeScreenState extends State<HomeScreen> {\n  @override\n  Widget build(BuildContext context) {\n    return Scaffold(\n      appBar: AppBar(title: Text('Android Dashboard')),\n      body: ListView(\n        children: [\n          ListTile(title: Text('New Project')),\n          ListTile(title: Text('Code Practice')),\n        ],\n      ),\n    );\n  }\n}" },
          { id: "fl_03_home_2", name: "home_controller.dart", type: "file", content: "class HomeController {\n  void refreshData() => print('Refreshing home');\n}" },
          { id: "fl_03_login_1", name: "login_screen.dart", type: "file", content: "import 'package:flutter/material.dart';\n\nclass LoginScreen extends StatelessWidget {\n  @override\n  Widget build(BuildContext context) => Scaffold(body: Center(child: Text('Login Screen')));\n}" },
          { id: "fl_03_profile_1", name: "profile_screen.dart", type: "file", content: "import 'package:flutter/material.dart';\n\nclass ProfileScreen extends StatelessWidget {\n  @override\n  Widget build(BuildContext context) => Scaffold(body: Center(child: Text('User Profile')));\n}" }
        ]
      },
      {
        id: "fl_04",
        name: "04_WIDGETS",
        type: "folder",
        isOpen: false,
        children: [
          { id: "fl_04_b1", name: "primary_button.dart", type: "file", content: "class PrimaryButton {\n  final String label;\n  const PrimaryButton({required this.label});\n}" },
          { id: "fl_04_b2", name: "icon_button.dart", type: "file", content: "class CustomIconButton {}\n" },
          { id: "fl_04_c1", name: "app_card.dart", type: "file", content: "class AppCard {}\n" },
          { id: "fl_04_d1", name: "app_dialog.dart", type: "file", content: "class AppDialog {}\n" }
        ]
      },
      {
        id: "fl_05",
        name: "05_LAYOUTS",
        type: "folder",
        isOpen: false,
        children: [
          { id: "fl_05_1", name: "mobile_layout.dart", type: "file", content: "class MobileLayout {}\n" },
          { id: "fl_05_2", name: "tablet_layout.dart", type: "file", content: "class TabletLayout {}\n" },
          { id: "fl_05_3", name: "desktop_layout.dart", type: "file", content: "class DesktopLayout {}\n" }
        ]
      },
      {
        id: "fl_06",
        name: "06_COMPONENTS",
        type: "folder",
        isOpen: false,
        children: [
          { id: "fl_06_1", name: "navbar.dart", type: "file", content: "class NavBar {}\n" },
          { id: "fl_06_2", name: "sidebar.dart", type: "file", content: "class Sidebar {}\n" },
          { id: "fl_06_3", name: "app_bar.dart", type: "file", content: "class CustomAppBar {}\n" },
          { id: "fl_06_4", name: "bottom_sheet.dart", type: "file", content: "class AppBottomSheet {}\n" }
        ]
      },
      {
        id: "fl_07",
        name: "07_MODELS",
        type: "folder",
        isOpen: false,
        children: [
          { id: "fl_07_1", name: "user_model.dart", type: "file", content: "class UserModel {\n  final String id;\n  final String name;\n  final String email;\n  UserModel({required this.id, required this.name, required this.email});\n}" },
          { id: "fl_07_2", name: "product_model.dart", type: "file", content: "class ProductModel {}\n" },
          { id: "fl_07_3", name: "response_model.dart", type: "file", content: "class ResponseModel<T> {\n  final bool success;\n  final T? data;\n  ResponseModel({required this.success, this.data});\n}" }
        ]
      },
      {
        id: "fl_08",
        name: "08_SERVICES",
        type: "folder",
        isOpen: false,
        children: [
          { id: "fl_08_1", name: "api_service.dart", type: "file", content: "class ApiService {\n  Future<Map<String, dynamic>> get(String endpoint) async => {};\n}" },
          { id: "fl_08_2", name: "auth_service.dart", type: "file", content: "class AuthService {}\n" },
          { id: "fl_08_3", name: "storage_service.dart", type: "file", content: "class StorageService {}\n" },
          { id: "fl_08_4", name: "notification_service.dart", type: "file", content: "class NotificationService {}\n" }
        ]
      },
      {
        id: "fl_09",
        name: "09_API",
        type: "folder",
        isOpen: false,
        children: [
          { id: "fl_09_1", name: "api_client.dart", type: "file", content: "class ApiClient {}\n" },
          { id: "fl_09_2", name: "endpoints.dart", type: "file", content: "class Endpoints {\n  static const String baseUrl = 'https://api.android-platform.dev';\n}\n" },
          { id: "fl_09_3", name: "api_response.dart", type: "file", content: "class ApiResponse {}\n" }
        ]
      },
      {
        id: "fl_10",
        name: "10_DATABASE",
        type: "folder",
        isOpen: false,
        children: [
          { id: "fl_10_1", name: "database.dart", type: "file", content: "class AppDatabase {\n  static Future<void> init() async {}\n}" },
          { id: "fl_10_2", name: "tables.dart", type: "file", content: "class AppTables {}\n" },
          { id: "fl_10_3", name: "migrations.dart", type: "file", content: "class Migrations {}\n" }
        ]
      },
      {
        id: "fl_11",
        name: "11_AUTH",
        type: "folder",
        isOpen: false,
        children: [
          { id: "fl_11_1", name: "auth_controller.dart", type: "file", content: "class AuthController {}\n" },
          { id: "fl_11_2", name: "login.dart", type: "file", content: "class LoginWidget {}\n" },
          { id: "fl_11_3", name: "register.dart", type: "file", content: "class RegisterWidget {}\n" },
          { id: "fl_11_4", name: "session.dart", type: "file", content: "class Session {}\n" }
        ]
      },
      {
        id: "fl_12",
        name: "12_STATE",
        type: "folder",
        isOpen: false,
        children: [
          { id: "fl_12_p1", name: "auth_provider.dart", type: "file", content: "class AuthProvider {}\n" },
          { id: "fl_12_b1", name: "auth_bloc.dart", type: "file", content: "class AuthBloc {}\n" },
          { id: "fl_12_c1", name: "theme_cubit.dart", type: "file", content: "class ThemeCubit {}\n" },
          { id: "fl_12_st", name: "state.dart", type: "file", content: "class BaseState {}\n" }
        ]
      },
      {
        id: "fl_13",
        name: "13_ASSETS",
        type: "folder",
        isOpen: false,
        children: [
          { id: "fl_13_ico_1", name: "app_icon.svg", type: "file", content: "<svg viewBox='0 0 100 100'><circle cx='50' cy='50' r='40' fill='#3DDC84'/></svg>" },
          { id: "fl_13_ani_1", name: "loading.json", type: "file", content: "{\"v\": \"5.5.7\", \"fr\": 60, \"layers\": []}" },
          { id: "fl_13_img_1", name: "logo.png", type: "file", content: "[Binary Image Data]" },
          { id: "fl_13_fnt_1", name: "Roboto-Regular.ttf", type: "file", content: "[Binary Font Data]" }
        ]
      },
      {
        id: "fl_14",
        name: "14_THEMES",
        type: "folder",
        isOpen: false,
        children: [
          { id: "fl_14_1", name: "app_theme.dart", type: "file", content: "class AppTheme {}\n" },
          { id: "fl_14_2", name: "light_theme.dart", type: "file", content: "class LightTheme {}\n" },
          { id: "fl_14_3", name: "dark_theme.dart", type: "file", content: "class DarkTheme {}\n" },
          { id: "fl_14_4", name: "colors.dart", type: "file", content: "class AppColors {\n  static const primary = 0xFF3DDC84;\n  static const blue = 0xFF0A84FF;\n}\n" }
        ]
      },
      {
        id: "fl_15",
        name: "15_LOCALIZATION",
        type: "folder",
        isOpen: false,
        children: [
          { id: "fl_15_1", name: "en.json", type: "file", content: '{\n  "title": "Flutter App",\n  "welcome": "Welcome to Android IDE"\n}' },
          { id: "fl_15_2", name: "bn.json", type: "file", content: '{\n  "title": "ফ্লাটার অ্যাপ",\n  "welcome": "অ্যান্ড্রয়েড আইডিই প্ল্যাটফর্মে স্বাগতম"\n}' },
          { id: "fl_15_3", name: "hi.json", type: "file", content: '{\n  "title": "फ्लटर ऐप",\n  "welcome": "एंड्रॉइड आईडीई प्लेटफॉर्म में आपका स्वागत है"\n}' }
        ]
      },
      {
        id: "fl_16",
        name: "16_NOTIFICATIONS",
        type: "folder",
        isOpen: false,
        children: [
          { id: "fl_16_1", name: "notification_manager.dart", type: "file", content: "class NotificationManager {}\n" },
          { id: "fl_16_2", name: "notification_config.dart", type: "file", content: "class NotificationConfig {}\n" },
          { id: "fl_16_3", name: "push_handler.dart", type: "file", content: "class PushHandler {\n  static Future<void> onMessage() async {}\n}\n" }
        ]
      },
      {
        id: "fl_17",
        name: "17_STORAGE",
        type: "folder",
        isOpen: false,
        children: [
          { id: "fl_17_1", name: "local_storage.dart", type: "file", content: "class LocalStorage {}\n" },
          { id: "fl_17_2", name: "secure_storage.dart", type: "file", content: "class SecureStorage {}\n" },
          { id: "fl_17_3", name: "cache.dart", type: "file", content: "class AppCache {}\n" }
        ]
      },
      {
        id: "fl_18",
        name: "18_PLUGINS",
        type: "folder",
        isOpen: false,
        children: [
          { id: "fl_18_cam_1", name: "camera_plugin.dart", type: "file", content: "class CameraPlugin {}\n" },
          { id: "fl_18_loc_1", name: "location_plugin.dart", type: "file", content: "class LocationPlugin {}\n" },
          { id: "fl_18_ble_1", name: "bluetooth_plugin.dart", type: "file", content: "class BluetoothPlugin {}\n" },
          { id: "fl_18_per_1", name: "permission_plugin.dart", type: "file", content: "class PermissionPlugin {}\n" }
        ]
      },
      {
        id: "fl_19",
        name: "19_PLATFORM",
        type: "folder",
        isOpen: false,
        children: [
          { id: "fl_19_and_1", name: "MainActivity.kt", type: "file", content: "package com.myapp.android\nimport io.flutter.embedding.android.FlutterActivity\nclass MainActivity: FlutterActivity() {}" },
          { id: "fl_19_ios_1", name: "AppDelegate.swift", type: "file", content: "import UIKit\nimport Flutter\n@UIApplicationMain\nclass AppDelegate: FlutterAppDelegate {}" },
          { id: "fl_19_web_1", name: "index.html", type: "file", content: "<!DOCTYPE html><html><head><title>Web Flutter</title></head><body></body></html>" },
          { id: "fl_19_win_1", name: "runner.cpp", type: "file", content: "#include <iostream>\nint main() { return 0; }" }
        ]
      },
      {
        id: "fl_20",
        name: "20_BACKEND",
        type: "folder",
        isOpen: false,
        children: [
          { id: "fl_20_srv", name: "server.dart", type: "file", content: "void main() => print('Local development server running on port 8080');\n" },
          { id: "fl_20_fn_1", name: "index.js", type: "file", content: "exports.handler = async () => ({ statusCode: 200, body: 'OK' });" },
          { id: "fl_20_ctrl_1", name: "user_controller.js", type: "file", content: "module.exports = { getUser: (id) => ({ id }) };" },
          { id: "fl_20_mid_1", name: "auth_middleware.js", type: "file", content: "module.exports = (req, res, next) => next();" }
        ]
      },
      {
        id: "fl_21",
        name: "21_TESTS",
        type: "folder",
        isOpen: false,
        children: [
          { id: "fl_21_u_1", name: "unit_test.dart", type: "file", content: "void main() {\n  // Unit tests\n}" },
          { id: "fl_21_w_1", name: "widget_test.dart", type: "file", content: "void main() {\n  // Widget tests\n}" },
          { id: "fl_21_i_1", name: "app_test.dart", type: "file", content: "void main() {\n  // Integration tests\n}" }
        ]
      },
      {
        id: "fl_22",
        name: "22_DOCS",
        type: "folder",
        isOpen: false,
        children: [
          { id: "fl_22_1", name: "README.md", type: "file", content: "# Flutter App Documentation\n\nBuild cross-platform applications with single codebase.\n" },
          { id: "fl_22_2", name: "API.md", type: "file", content: "# API Documentation\n\nEndpoints & payload specifications.\n" },
          { id: "fl_22_3", name: "CHANGELOG.md", type: "file", content: "# Changelog\n\n- v1.0.0 Initial release.\n" }
        ]
      },
      {
        id: "fl_23",
        name: "23_BUILD",
        type: "folder",
        isOpen: false,
        children: [
          { id: "fl_23_web_1", name: "main.dart.js", type: "file", content: "console.log('Compiled web bundle');" },
          { id: "fl_23_cfg_1", name: "build_config.json", type: "file", content: "{\n  \"target\": \"release\",\n  \"minify\": true,\n  \"splitPerAbi\": true\n}" },
          { id: "fl_23_manifest", name: "AssetManifest.json", type: "file", content: "{\n  \"assets/logo.png\": [\"assets/logo.png\"]\n}" }
        ]
      },
      {
        id: "fl_24",
        name: "24_TOOLS",
        type: "folder",
        isOpen: false,
        children: [
          { id: "fl_24_gen_1", name: "gen.sh", type: "file", content: "#!/bin/bash\necho 'Generating build assets...'" },
          { id: "fl_24_scr_1", name: "deploy.py", type: "file", content: "print('Deployment script active')" },
          { id: "fl_24_cmd_1", name: "build.bat", type: "file", content: "@echo off\necho Building project..." }
        ]
      },
      {
        id: "fl_25",
        name: "25_CONFIG",
        type: "folder",
        isOpen: false,
        children: [
          { id: "fl_25_1", name: "pubspec.yaml", type: "file", content: "name: flutter_app\ndescription: Android IDE Platform App.\nversion: 1.0.0+1\nenvironment:\n  sdk: '>=3.0.0 <4.0.0'\ndependencies:\n  flutter:\n    sdk: flutter\n  cupertino_icons: ^1.0.2\n" },
          { id: "fl_25_2", name: "analysis_options.yaml", type: "file", content: "include: package:flutter_lints/flutter.yaml\n" },
          { id: "fl_25_3", name: "l10n.yaml", type: "file", content: "arb-dir: lib/l10n\ntemplate-arb-file: app_en.arb\n" },
          { id: "fl_25_4", name: ".gitignore", type: "file", content: "/build/\n.dart_tool/\n.flutter-plugins\n" },
          { id: "fl_25_5", name: "README.md", type: "file", content: "# Flutter App Configuration\nStandard pubspec environment parameters." }
        ]
      }
    ]
  },
  {
    id: "android_root",
    name: "ANDROID_APP",
    type: "folder",
    isOpen: true,
    children: [
      {
        id: "an_apk_dl_space",
        name: "APK DOWNLOAD",
        type: "folder",
        isOpen: false,
        children: [
          { id: "an_apk_dl_space_debug", name: "app-debug.apk", type: "file", content: "APK_BINARY_3_85_MB" },
          { id: "an_apk_dl_space_release", name: "app-release.apk", type: "file", content: "APK_BINARY_3_85_MB" },
          { id: "an_apk_dl_space_ide", name: "ANDROID.apk", type: "file", content: "APK_BINARY_3_85_MB" }
        ]
      },
      {
        id: "an_01",
        name: "01_MANIFEST",
        type: "folder",
        isOpen: false,
        children: [
          {
            id: "an_manifest_root",
            name: "AndroidManifest.xml",
            type: "file",
            content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.myapp.android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

    </application>
</manifest>`
          },
          {
            id: "an_01_network_sec",
            name: "network_security_config.xml",
            type: "file",
            content: `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true" />
</network-security-config>`
          },
          {
            id: "an_01_permissions",
            name: "permissions_manifest.xml",
            type: "file",
            content: `<?xml version="1.0" encoding="utf-8"?>
<permissions>
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
</permissions>`
          }
        ]
      },
      {
        id: "an_02",
        name: "02_JAVA",
        type: "folder",
        isOpen: false,
        children: [
          {
            id: "an_main_java_root",
            name: "MainActivity.java",
            type: "file",
            content: `package com.myapp.android;

import android.os.Bundle;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Toast.makeText(this, "Welcome to Android IDE Platform", Toast.LENGTH_SHORT).show();
    }
}`
          },
          {
            id: "an_02_app_ctrl",
            name: "AppController.java",
            type: "file",
            content: `package com.myapp.android;

import android.app.Application;

public class AppController extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
    }
}`
          },
          {
            id: "an_02_api_helper",
            name: "NetworkHelper.java",
            type: "file",
            content: `package com.myapp.android;

public class NetworkHelper {
    public static boolean isConnected() {
        return true;
    }
}`
          }
        ]
      },
      {
        id: "an_03",
        name: "03_KOTLIN",
        type: "folder",
        isOpen: false,
        children: [
          {
            id: "an_03_1",
            name: "AppActivity.kt",
            type: "file",
            content: `package com.myapp.android

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class AppActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(android.R.id.content)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }
        println("Android IDE Kotlin Kernel Initialized")
    }
}`
          },
          {
            id: "an_03_2",
            name: "MainViewModel.kt",
            type: "file",
            content: `package com.myapp.android

class MainViewModel {
    var title: String = "Android Studio Pro"
    fun loadData(): List<String> = listOf("Item 1", "Item 2", "Item 3")
}`
          },
          {
            id: "an_03_3",
            name: "Extensions.kt",
            type: "file",
            content: `package com.myapp.android

fun String.toTitleCase(): String = this.trim().uppercase()`
          }
        ]
      },
      {
        id: "an_04",
        name: "04_RES_LAYOUT",
        type: "folder",
        isOpen: false,
        children: [
          {
            id: "an_layout_1",
            name: "activity_main.xml",
            type: "file",
            content: `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:fitsSystemWindows="true"
    android:orientation="vertical"
    android:gravity="center"
    android:background="#0f172a"
    android:padding="24dp">

    <TextView
        android:id="@+id/tvTitle"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Android IDE Platform"
        android:textColor="#ffffff"
        android:textSize="22sp"
        android:textStyle="bold" />

    <Button
        android:id="@+id/btnClick"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="20dp"
        android:text="Tap to Run"
        android:backgroundTint="#00E676" />
</LinearLayout>`
          },
          {
            id: "an_layout_2",
            name: "fragment_home.xml",
            type: "file",
            content: `<?xml version="1.0" encoding="utf-8"?>
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:fitsSystemWindows="true">
    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_gravity="center"
        android:text="Home Fragment"
        android:textColor="#94a3b8" />
</FrameLayout>`
          },
          {
            id: "an_layout_3",
            name: "item_card.xml",
            type: "file",
            content: `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:padding="16dp"
    android:orientation="horizontal">
    <TextView
        android:id="@+id/tvItemName"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Card Item" />
</LinearLayout>`
          }
        ]
      },
      {
        id: "an_05",
        name: "05_RES_VALUES",
        type: "folder",
        isOpen: false,
        children: [
          { id: "an_05_1", name: "strings.xml", type: "file", content: `<resources>\n    <string name="app_name">Android IDE Platform</string>\n    <string name="hello_world">Hello World!</string>\n    <string name="turbo_boost">Turbo 3X Boost</string>\n</resources>` },
          { id: "an_05_2", name: "colors.xml", type: "file", content: `<resources>\n    <color name="colorPrimary">#3DDC84</color>\n    <color name="colorPrimaryDark">#0D0D0F</color>\n    <color name="colorAccent">#0A84FF</color>\n    <color name="bgDark">#000000</color>\n</resources>` },
          { id: "an_05_3", name: "styles.xml", type: "file", content: `<resources>\n    <style name="AppTheme" parent="Theme.AppCompat.DayNight.DarkActionBar">\n        <item name="colorPrimary">@color/colorPrimary</item>\n        <item name="colorPrimaryDark">@color/colorPrimaryDark</item>\n        <item name="colorAccent">@color/colorAccent</item>\n    </style>\n</resources>` }
        ]
      },
      {
        id: "an_06",
        name: "06_RES_DRAWABLE",
        type: "folder",
        isOpen: false,
        children: [
          { id: "an_06_1", name: "ic_launcher.xml", type: "file", content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"\n    android:width="108dp"\n    android:height="108dp"\n    android:viewportWidth="108"\n    android:viewportHeight="108">\n    <path android:fillColor="#3DDC84" android:pathData="M54,20 L80,60 L28,60 Z" />\n</vector>` },
          { id: "an_06_2", name: "bg_rounded_button.xml", type: "file", content: `<?xml version="1.0" encoding="utf-8"?>\n<shape xmlns:android="http://schemas.android.com/apk/res/android">\n    <solid android:color="#3DDC84" />\n    <corners android:radius="12dp" />\n</shape>` },
          { id: "an_06_3", name: "ic_baseline_code.xml", type: "file", content: `<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="24dp" android:height="24dp" android:viewportWidth="24" android:viewportHeight="24">\n    <path android:fillColor="#FFFFFF" android:pathData="M9.4,16.6L4.8,12l4.6,-4.6L8,6l-6,6 6,6 1.4,-1.4z" />\n</vector>` }
        ]
      },
      {
        id: "an_07",
        name: "07_RES_MIPMAP",
        type: "folder",
        isOpen: false,
        children: [
          { id: "an_07_1", name: "ic_launcher_round.png", type: "file", content: "[Binary Icon Data PNG]" },
          { id: "an_07_2", name: "ic_launcher.png", type: "file", content: "[Binary Icon Data PNG]" },
          { id: "an_07_3", name: "ic_launcher_foreground.xml", type: "file", content: `<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108">\n    <path android:fillColor="#3DDC84" android:pathData="M34,34h40v40h-40z" />\n</vector>` }
        ]
      },
      {
        id: "an_08",
        name: "08_RES_VALUES_W",
        type: "folder",
        isOpen: false,
        children: [
          { id: "an_08_1", name: "dimens.xml", type: "file", content: `<resources>\n    <dimen name="padding_standard">16dp</dimen>\n    <dimen name="text_headline">24sp</dimen>\n</resources>` },
          { id: "an_08_2", name: "dimens_sw600dp.xml", type: "file", content: `<resources>\n    <dimen name="padding_standard">32dp</dimen>\n    <dimen name="text_headline">30sp</dimen>\n</resources>` },
          { id: "an_08_3", name: "integers.xml", type: "file", content: `<resources>\n    <integer name="grid_columns">2</integer>\n    <integer name="anim_duration_short">200</integer>\n</resources>` }
        ]
      },
      {
        id: "an_09",
        name: "09_RES_MENU",
        type: "folder",
        isOpen: false,
        children: [
          { id: "an_09_1", name: "main_menu.xml", type: "file", content: `<menu xmlns:android="http://schemas.android.com/apk/res/android">\n    <item android:id="@+id/action_settings" android:title="Settings" />\n    <item android:id="@+id/action_run" android:title="Run" />\n</menu>` },
          { id: "an_09_2", name: "bottom_nav_menu.xml", type: "file", content: `<menu xmlns:android="http://schemas.android.com/apk/res/android">\n    <item android:id="@+id/nav_home" android:title="Home" />\n    <item android:id="@+id/nav_projects" android:title="Projects" />\n    <item android:id="@+id/nav_profile" android:title="Profile" />\n</menu>` },
          { id: "an_09_3", name: "drawer_menu.xml", type: "file", content: `<menu xmlns:android="http://schemas.android.com/apk/res/android">\n    <item android:id="@+id/nav_dashboard" android:title="Dashboard" />\n    <item android:id="@+id/nav_tools" android:title="Tools" />\n</menu>` }
        ]
      },
      {
        id: "an_10",
        name: "10_RES_ANIM",
        type: "folder",
        isOpen: false,
        children: [
          { id: "an_10_1", name: "fade_in.xml", type: "file", content: `<alpha xmlns:android="http://schemas.android.com/apk/res/android"\n    android:fromAlpha="0.0" android:toAlpha="1.0"\n    android:duration="300" />` },
          { id: "an_10_2", name: "fade_out.xml", type: "file", content: `<alpha xmlns:android="http://schemas.android.com/apk/res/android"\n    android:fromAlpha="1.0" android:toAlpha="0.0"\n    android:duration="300" />` },
          { id: "an_10_3", name: "slide_up.xml", type: "file", content: `<translate xmlns:android="http://schemas.android.com/apk/res/android"\n    android:fromYDelta="100%p" android:toYDelta="0%p"\n    android:duration="350" />` }
        ]
      },
      {
        id: "an_11",
        name: "11_RES_RAW",
        type: "folder",
        isOpen: false,
        children: [
          { id: "an_11_1", name: "sample_sound.mp3", type: "file", content: "[Binary Audio MP3 44.1kHz]" },
          { id: "an_11_2", name: "startup_chime.wav", type: "file", content: "[Binary Audio WAV]" },
          { id: "an_11_3", name: "default_schema.json", type: "file", content: `{\n  "schemaVersion": 1,\n  "tables": ["users", "projects", "logs"]\n}` }
        ]
      },
      {
        id: "an_12",
        name: "12_ASSETS_DIR",
        type: "folder",
        isOpen: false,
        children: [
          { id: "an_12_1", name: "config.json", type: "file", content: `{\n  "version": "1.0",\n  "offlineMode": true,\n  "toolsCount": 520\n}` },
          { id: "an_12_2", name: "index.html", type: "file", content: `<!DOCTYPE html>\n<html>\n<head><meta charset="utf-8"><title>Android WebView Asset</title></head>\n<body><h1>Android Local Asset</h1></body>\n</html>` },
          { id: "an_12_3", name: "fonts_config.xml", type: "file", content: `<familyset version="22">\n    <family name="sans-serif"><font weight="400" style="normal">Roboto-Regular.ttf</font></family>\n</familyset>` }
        ]
      },
      {
        id: "an_13",
        name: "13_GRADLE_SCRIPTS",
        type: "folder",
        isOpen: false,
        children: [
          { id: "an_13_1", name: "build.gradle", type: "file", content: `plugins {\n    id 'com.android.application'\n    id 'kotlin-android'\n}\n\nandroid {\n    compileSdk 34\n\n    defaultConfig {\n        applicationId "com.myapp.android"\n        minSdk 24\n        targetSdk 34\n        versionCode 1\n        versionName "1.0"\n    }\n}` },
          { id: "an_13_2", name: "settings.gradle", type: "file", content: `rootProject.name = 'AndroidApp'\ninclude ':app'` },
          { id: "an_13_3", name: "gradle.properties", type: "file", content: `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8\nandroid.useAndroidX=true\nkotlin.code.style=official` }
        ]
      },
      {
        id: "an_14",
        name: "14_GRADLE_WRAPPER",
        type: "folder",
        isOpen: false,
        children: [
          { id: "an_14_1", name: "gradle-wrapper.properties", type: "file", content: `distributionBase=GRADLE_USER_HOME\ndistributionPath=wrapper/dists\ndistributionUrl=https\\://services.gradle.org/distributions/gradle-8.4-bin.zip\nzipStoreBase=GRADLE_USER_HOME\nzipStorePath=wrapper/dists` },
          { id: "an_14_2", name: "gradlew", type: "file", content: `#!/bin/sh\n# Gradle start up script for UN*X\nexec java -jar gradle/wrapper/gradle-wrapper.jar "$@"` },
          { id: "an_14_3", name: "gradlew.bat", type: "file", content: `@rem Gradle startup script for Windows\n@java.exe -jar gradle/wrapper/gradle-wrapper.jar %*` }
        ]
      },
      {
        id: "an_15",
        name: "15_PROGUARD",
        type: "folder",
        isOpen: false,
        children: [
          { id: "an_15_1", name: "proguard-rules.pro", type: "file", content: `# Proguard optimization rules\n-keepattributes *Annotation*\n-dontwarn okio.**` },
          { id: "an_15_2", name: "consumer-rules.pro", type: "file", content: `# Consumer ProGuard rules\n-keep class com.myapp.android.models.** { *; }` },
          { id: "an_15_3", name: "r8-rules.pro", type: "file", content: `# R8 full mode rules\n-keepattributes Signature,InnerClasses,EnclosingMethod` }
        ]
      },
      {
        id: "an_16",
        name: "16_UNIT_TESTS",
        type: "folder",
        isOpen: false,
        children: [
          { id: "an_16_1", name: "ExampleUnitTest.java", type: "file", content: `package com.myapp.android;\nimport org.junit.Test;\nimport static org.junit.Assert.*;\npublic class ExampleUnitTest {\n    @Test\n    public void addition_isCorrect() {\n        assertEquals(4, 2 + 2);\n    }\n}` },
          { id: "an_16_2", name: "ViewModelUnitTest.kt", type: "file", content: `package com.myapp.android\nimport org.junit.Test\nclass ViewModelUnitTest {\n    @Test\n    fun testInitialState() {\n        val vm = MainViewModel()\n        assert(vm.title.isNotEmpty())\n    }\n}` }
        ]
      },
      {
        id: "an_17",
        name: "17_INSTR_TESTS",
        type: "folder",
        isOpen: false,
        children: [
          { id: "an_17_1", name: "ExampleInstrumentedTest.java", type: "file", content: `package com.myapp.android;\npublic class ExampleInstrumentedTest {\n    // Instrumentation UI test\n}` },
          { id: "an_17_2", name: "MainActivityEspressoTest.kt", type: "file", content: `package com.myapp.android\nclass MainActivityEspressoTest {\n    fun verifyMainScreenDisplayed() {}\n}` }
        ]
      },
      {
        id: "an_18",
        name: "18_JNI_LIBS",
        type: "folder",
        isOpen: false,
        children: [
          { id: "an_18_1", name: "libnative-lib.so", type: "file", content: "[Compiled C++ Native Binary for ARM64/x86_64]" },
          { id: "an_18_2", name: "native-lib.cpp", type: "file", content: `#include <jni.h>\n#include <string>\nextern "C" JNIEXPORT jstring JNICALL\nJava_com_myapp_android_MainActivity_stringFromJNI(JNIEnv* env, jobject) {\n    std::string hello = "Hello from C++ JNI";\n    return env->NewStringUTF(hello.c_str());\n}` },
          { id: "an_18_3", name: "CMakeLists.txt", type: "file", content: `cmake_minimum_required(VERSION 3.22.1)\nproject("myapplication")\nadd_library(native-lib SHARED native-lib.cpp)` }
        ]
      },
      {
        id: "an_19",
        name: "19_AIDL",
        type: "folder",
        isOpen: false,
        children: [
          { id: "an_19_1", name: "IMyAidlInterface.aidl", type: "file", content: `package com.myapp.android;\ninterface IMyAidlInterface {\n    void basicTypes(int anInt, long aLong, boolean aBoolean);\n}` },
          { id: "an_19_2", name: "IRemoteService.aidl", type: "file", content: `package com.myapp.android;\ninterface IRemoteService {\n    int getPid();\n    String getServiceStatus();\n}` }
        ]
      },
      {
        id: "an_20",
        name: "20_RS",
        type: "folder",
        isOpen: false,
        children: [
          { id: "an_20_1", name: "script.rs", type: "file", content: `#pragma version(1)\n#pragma rs java_package_name(com.myapp.android)\nvoid root() {}` },
          { id: "an_20_2", name: "blur_filter.rs", type: "file", content: `#pragma version(1)\n#pragma rs java_package_name(com.myapp.android)\nfloat radius = 12.0f;` }
        ]
      },
      {
        id: "an_21",
        name: "21_SECURITY",
        type: "folder",
        isOpen: false,
        children: [
          { id: "an_21_1", name: "keystore.jks", type: "file", content: "[Android Release Keystore RSA 4096-bit]" },
          { id: "an_21_2", name: "CryptoManager.kt", type: "file", content: `package com.myapp.android.security\nclass CryptoManager {\n    fun encryptPayload(raw: String): String = raw.reversed()\n}` },
          { id: "an_21_3", name: "signing-config.properties", type: "file", content: `storeFile=keystore.jks\nkeyAlias=android_release_key\nv2SigningEnabled=true` }
        ]
      },
      {
        id: "an_22",
        name: "22_SERVICES",
        type: "folder",
        isOpen: false,
        children: [
          { id: "an_22_1", name: "BackgroundService.kt", type: "file", content: `package com.myapp.android\nimport android.app.Service\nimport android.content.Intent\nimport android.os.IBinder\nclass BackgroundService : Service() {\n    override fun onBind(intent: Intent?): IBinder? = null\n}` },
          { id: "an_22_2", name: "SyncJobService.kt", type: "file", content: `package com.myapp.android\nclass SyncJobService {\n    fun startSync() = println("Background sync started")\n}` }
        ]
      },
      {
        id: "an_23",
        name: "23_RECEIVERS",
        type: "folder",
        isOpen: false,
        children: [
          { id: "an_23_1", name: "BootReceiver.kt", type: "file", content: `package com.myapp.android\nimport android.content.BroadcastReceiver\nimport android.content.Context\nimport android.content.Intent\nclass BootReceiver : BroadcastReceiver() {\n    override fun onReceive(context: Context?, intent: Intent?) {}\n}` },
          { id: "an_23_2", name: "NetworkChangeReceiver.kt", type: "file", content: `package com.myapp.android\nimport android.content.BroadcastReceiver\nimport android.content.Context\nimport android.content.Intent\nclass NetworkChangeReceiver : BroadcastReceiver() {\n    override fun onReceive(context: Context?, intent: Intent?) {}\n}` }
        ]
      },
      {
        id: "an_24",
        name: "24_PROVIDERS",
        type: "folder",
        isOpen: false,
        children: [
          { id: "an_24_1", name: "CustomDataProvider.kt", type: "file", content: `package com.myapp.android\nimport android.content.ContentProvider\nimport android.content.ContentValues\nclass CustomDataProvider : ContentProvider() {\n    override fun onCreate(): Boolean = true\n    override fun query(uri: android.net.Uri, p1: Array<out String>?, p2: String?, p3: Array<out String>?, p4: String?) = null\n    override fun getType(uri: android.net.Uri): String? = null\n    override fun insert(uri: android.net.Uri, values: ContentValues?) = null\n    override fun delete(uri: android.net.Uri, selection: String?, selectionArgs: Array<out String>?) = 0\n    override fun update(uri: android.net.Uri, values: ContentValues?, selection: String?, selectionArgs: Array<out String>?) = 0\n}` },
          { id: "an_24_2", name: "file_paths.xml", type: "file", content: `<?xml version="1.0" encoding="utf-8"?>\n<paths xmlns:android="http://schemas.android.com/apk/res/android">\n    <external-path name="external_files" path="." />\n</paths>` }
        ]
      },
      {
        id: "an_25",
        name: "25_BUILD_OUTPUT",
        type: "folder",
        isOpen: false,
        children: [
          { id: "an_25_1", name: "output-metadata.json", type: "file", content: `{\n  "version": 3,\n  "artifactType": {\n    "type": "APK",\n    "kind": "Directory"\n  },\n  "applicationId": "com.myapp.android",\n  "variantName": "release"\n}` },
          { id: "an_25_2", name: "build-info.properties", type: "file", content: `build.status=SUCCESS\nbuild.compiler=R8_TURBO_3X\nbuild.sdk=34` }
        ]
      }
    ]
  }
];

function markAsDefault(nodes: FileNode[]): FileNode[] {
  return nodes.map((node) => ({
    ...node,
    isDefault: true,
    children: node.children ? markAsDefault(node.children) : undefined,
  }));
}

export function isUserCreatedNode(node: FileNode | null | undefined): boolean {
  if (!node || !node.id) return false;
  const id = node.id;
  if (
    id.startsWith("folder_") ||
    id.startsWith("file_") ||
    id.startsWith("img_") ||
    id.startsWith("imp_file_") ||
    id.startsWith("zip_") ||
    id.startsWith("practice_") ||
    id.startsWith("user_")
  ) {
    return true;
  }
  if (
    id === "flutter_root" ||
    id === "android_root" ||
    id.startsWith("fl_") ||
    id.startsWith("an_") ||
    id.startsWith("kt_") ||
    id.includes("_apk_dl_space")
  ) {
    return false;
  }
  return node.isDefault === false;
}

function normalizeUserSubtree(node: FileNode): FileNode {
  return {
    ...node,
    isDefault: false,
    children: node.children ? node.children.map(normalizeUserSubtree) : undefined,
  };
}

export function ensureApkDownloadFolder(nodes: FileNode[]): FileNode[] {
  try {
    if (!Array.isArray(nodes) || nodes.length === 0) return nodes;
    const validNodes = nodes.filter((n): n is FileNode => Boolean(n && typeof n === "object" && n.name));
    if (validNodes.length === 0) return nodes;

    // Identify the main project root folder (FLUTTER_APP or ANDROID_APP)
    const rootFolderIdx = validNodes.findIndex(
      (n) =>
        n.type === "folder" &&
        (n.id === "flutter_root" ||
          n.id === "android_root" ||
          n.name === "FLUTTER_APP" ||
          n.name === "ANDROID_APP" ||
          !isUserCreatedNode(n))
    );
    const rootNode = rootFolderIdx >= 0 ? validNodes[rootFolderIdx] : validNodes.find((n) => n.type === "folder");
    if (!rootNode) return validNodes;

    // Any extra top-level nodes added outside rootNode are user-created files or folders
    const extraTopLevelNodes = validNodes.filter((n) => n.id !== rootNode.id);

    const isFlutterTree = rootNode.name === "FLUTTER_APP" || rootNode.id?.startsWith("flutter");
    const defaultTemplateRoot = isFlutterTree ? initialFileSystem[0] : initialFileSystem[1];
    const templateSubfolders = (defaultTemplateRoot?.children || []).filter((df) => df.type === "folder");

    const rawChildren = Array.isArray(rootNode.children)
      ? rootNode.children.filter((c): c is FileNode => Boolean(c && typeof c === "object" && c.name))
      : [];

    const existingFoldersByName = new Map<string, FileNode>();
    for (const c of rawChildren) {
      if (c.type === "folder") {
        existingFoldersByName.set(c.name, c);
      }
    }

    // Collect user-created folders and files sitting directly inside rootNode (or passed at top level)
    const rootUserNodes: FileNode[] = [];
    for (const c of [...rawChildren, ...extraTopLevelNodes]) {
      if (
        c.name === "APK DOWNLOAD" ||
        c.name === "APK_DOWNLOAD" ||
        c.name === "build-outputs" ||
        templateSubfolders.some((tf) => tf.name === c.name)
      ) {
        continue;
      }
      if (isUserCreatedNode(c)) {
        if (!rootUserNodes.some((u) => u.id === c.id)) {
          rootUserNodes.push(normalizeUserSubtree(c));
        }
      }
    }

    // Build the single top "APK DOWNLOAD" folder with exact 3 default APK files + any custom user kids inside it
    const existingApkFolder = existingFoldersByName.get("APK DOWNLOAD");
    const apkCustomKids: FileNode[] = [];
    if (existingApkFolder && Array.isArray(existingApkFolder.children)) {
      for (const k of existingApkFolder.children) {
        if (
          isUserCreatedNode(k) &&
          !["app-debug.apk", "app-release.apk", "android.apk"].includes((k.name || "").toLowerCase())
        ) {
          apkCustomKids.push(normalizeUserSubtree(k));
        }
      }
    }
    const apkFolderNode: FileNode = {
      id: isFlutterTree ? "fl_apk_dl_space" : "an_apk_dl_space",
      name: "APK DOWNLOAD",
      type: "folder",
      isOpen: Boolean(existingApkFolder?.isOpen),
      isDefault: true,
      children: [
        {
          id: isFlutterTree ? "fl_apk_dl_space_debug" : "an_apk_dl_space_debug",
          name: "app-debug.apk",
          type: "file",
          content: "APK_BINARY_3_85_MB",
          isDefault: true,
        },
        {
          id: isFlutterTree ? "fl_apk_dl_space_release" : "an_apk_dl_space_release",
          name: "app-release.apk",
          type: "file",
          content: "APK_BINARY_3_85_MB",
          isDefault: true,
        },
        {
          id: isFlutterTree ? "fl_apk_dl_space_ide" : "an_apk_dl_space_ide",
          name: "ANDROID.apk",
          type: "file",
          content: "APK_BINARY_3_85_MB",
          isDefault: true,
        },
        ...apkCustomKids,
      ],
    };

    // Build all 25 numbered folders in exact order (01 to 25), ensuring related default files + any user-created items inside them
    const numberedFolders: FileNode[] = templateSubfolders
      .filter((tf) => tf.name !== "APK DOWNLOAD" && tf.name !== "APK_DOWNLOAD" && tf.name !== "build-outputs")
      .map((templateFolder) => {
        const existingFolder = existingFoldersByName.get(templateFolder.name);
        const existingKids = Array.isArray(existingFolder?.children) ? existingFolder!.children! : [];

        // Preserve any user-created files or folders inside this numbered folder
        const customUserKids: FileNode[] = [];
        const collectCustom = (items: FileNode[]) => {
          for (const item of items) {
            if (isUserCreatedNode(item)) {
              customUserKids.push(normalizeUserSubtree(item));
            } else if (item.type === "folder" && item.children) {
              collectCustom(item.children);
            }
          }
        };
        collectCustom(existingKids);

        // Ensure all default related files exist directly inside this folder
        const templateDefaultFiles = markAsDefault(templateFolder.children || []).map((tf) => {
          const findExistingFile = (items: FileNode[]): FileNode | null => {
            for (const it of items) {
              if (!isUserCreatedNode(it) && it.type === "file" && (it.id === tf.id || it.name === tf.name)) {
                return it;
              }
              if (it.children && !isUserCreatedNode(it)) {
                const found = findExistingFile(it.children);
                if (found) return found;
              }
            }
            return null;
          };
          const matched = findExistingFile(existingKids);
          return matched && matched.content ? { ...tf, content: matched.content, isDefault: true } : tf;
        });

        const mergedKids: FileNode[] = [...templateDefaultFiles];
        for (const usrKid of customUserKids) {
          if (!mergedKids.some((m) => m.id === usrKid.id)) {
            mergedKids.push(usrKid);
          }
        }

        return {
          ...templateFolder,
          id: existingFolder?.id || templateFolder.id,
          isOpen: Boolean(existingFolder?.isOpen),
          isDefault: true,
          children: mergedKids,
        };
      });

    return [
      {
        ...rootNode,
        isOpen: true,
        isDefault: true,
        children: [apkFolderNode, ...rootUserNodes, ...numberedFolders],
      },
    ];
  } catch {
    return Array.isArray(nodes) ? nodes : [];
  }
}

export const flutterFileSystem: FileNode[] = markAsDefault([initialFileSystem[0]]);
export const androidFileSystem: FileNode[] = markAsDefault([initialFileSystem[1]]);
