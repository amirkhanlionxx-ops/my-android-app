import { ToolItem } from '../types';

const toolCategories = [
  "Build & Gradle", "Manifest & Permissions", "UI Layout & Views", "Code Formatting & Lint",
  "ADB & Device", "Git & Source Control", "Security & Signing", "Database & SQLite",
  "Assets & Vectors", "Sensors & Hardware", "Profiling & Memory", "Flutter & Dart Engine",
  "Testing & QA", "Code Generation", "Network & API Testing", "Release & Packaging"
];

const baseTools = [
  { name: "Build APK (Debug)", icon: "fa-hammer", cat: "Build & Gradle", key: "build_apk" },
  { name: "Build App Bundle (AAB)", icon: "fa-cube", cat: "Build & Gradle", key: "build_aab" },
  { name: "Gradle Clean & Rebuild", icon: "fa-arrows-rotate", cat: "Build & Gradle", key: "clean_build" },
  { name: "Assemble Release APK", icon: "fa-box-archive", cat: "Build & Gradle", key: "assemble_release" },
  { name: "Check Dependencies Tree", icon: "fa-network-wired", cat: "Build & Gradle", key: "gradle_deps" },
  { name: "Add INTERNET Permission", icon: "fa-wifi", cat: "Manifest & Permissions", key: "perm_internet" },
  { name: "Add CAMERA Permission", icon: "fa-camera", cat: "Manifest & Permissions", key: "perm_camera" },
  { name: "Add ACCESS_FINE_LOCATION", icon: "fa-location-crosshairs", cat: "Manifest & Permissions", key: "perm_location" },
  { name: "Add POST_NOTIFICATIONS", icon: "fa-bell", cat: "Manifest & Permissions", key: "perm_notifications" },
  { name: "Add RECORD_AUDIO", icon: "fa-microphone", cat: "Manifest & Permissions", key: "perm_audio" },
  { name: "Add BLUETOOTH_SCAN", icon: "fa-bluetooth", cat: "Manifest & Permissions", key: "perm_ble" },
  { name: "Add READ_MEDIA_IMAGES", icon: "fa-image", cat: "Manifest & Permissions", key: "perm_media" },
  { name: "Add FOREGROUND_SERVICE", icon: "fa-gears", cat: "Manifest & Permissions", key: "perm_service" },
  { name: "Add WAKE_LOCK Permission", icon: "fa-sun", cat: "Manifest & Permissions", key: "perm_wakelock" },
  { name: "Format Active Code", icon: "fa-align-left", cat: "Code Formatting & Lint", key: "format_code" },
  { name: "Run Android Lint Check", icon: "fa-stethoscope", cat: "Code Formatting & Lint", key: "run_lint" },
  { name: "Dart Format (flutter)", icon: "fa-file-signature", cat: "Code Formatting & Lint", key: "dart_format" },
  { name: "ktlint Syntax Fix", icon: "fa-wand-magic-sparkles", cat: "Code Formatting & Lint", key: "ktlint_fix" },
  { name: "Sort Imports Alphabetically", icon: "fa-arrow-down-a-z", cat: "Code Formatting & Lint", key: "sort_imports" },
  { name: "Convert JSON to Kotlin Data Class", icon: "fa-code-compare", cat: "Code Generation", key: "json_to_kotlin" },
  { name: "Convert JSON to Dart Model", icon: "fa-file-code", cat: "Code Generation", key: "json_to_dart" },
  { name: "Generate Room Entity DAO", icon: "fa-database", cat: "Database & SQLite", key: "generate_room" },
  { name: "SQLite DB Query Inspector", icon: "fa-table", cat: "Database & SQLite", key: "inspect_sqlite" },
  { name: "Export SQLite Schema to SQL", icon: "fa-file-export", cat: "Database & SQLite", key: "export_sql" },
  { name: "SVG to Android VectorDrawable", icon: "fa-bezier-curve", cat: "Assets & Vectors", key: "svg_to_vector" },
  { name: "Batch App Icon Generator (xxxhdpi)", icon: "fa-shapes", cat: "Assets & Vectors", key: "generate_icons" },
  { name: "Compress PNG Assets 70%", icon: "fa-compress", cat: "Assets & Vectors", key: "compress_png" },
  { name: "Convert Drawables to WebP", icon: "fa-file-image", cat: "Assets & Vectors", key: "drawable_webp" },
  { name: "Sign APK with JKS Keystore", icon: "fa-key", cat: "Security & Signing", key: "sign_apk" },
  { name: "Generate New 4096-bit Keystore", icon: "fa-shield-halved", cat: "Security & Signing", key: "gen_keystore" },
  { name: "Verify APK Signature (v1/v2/v3)", icon: "fa-certificate", cat: "Security & Signing", key: "verify_apk" },
  { name: "Proguard Obfuscate & Shrink", icon: "fa-lock", cat: "Security & Signing", key: "proguard_run" },
  { name: "ADB Logcat Stream (Filter Tag)", icon: "fa-terminal", cat: "ADB & Device", key: "adb_logcat" },
  { name: "ADB Wireless Pair & Connect", icon: "fa-tower-broadcast", cat: "ADB & Device", key: "adb_connect" },
  { name: "ADB Install Over Wi-Fi", icon: "fa-download", cat: "ADB & Device", key: "adb_install" },
  { name: "Capture Screen Screenshot", icon: "fa-camera-retro", cat: "ADB & Device", key: "take_screenshot" },
  { name: "Record MP4 Device Video", icon: "fa-video", cat: "ADB & Device", key: "record_screen" },
  { name: "Simulate Battery 15% Low", icon: "fa-battery-quarter", cat: "Sensors & Hardware", key: "sim_battery" },
  { name: "Mock GPS Location Coordinates", icon: "fa-map-pin", cat: "Sensors & Hardware", key: "mock_gps" },
  { name: "Simulate Network 2G / Offline", icon: "fa-plane", cat: "Sensors & Hardware", key: "sim_network" },
  { name: "Trigger Accelerometer Shake Event", icon: "fa-mobile", cat: "Sensors & Hardware", key: "sim_shake" },
  { name: "Flutter Pub Get", icon: "fa-cloud-arrow-down", cat: "Flutter & Dart Engine", key: "flutter_pub_get" },
  { name: "Flutter Clean Cache", icon: "fa-broom", cat: "Flutter & Dart Engine", key: "flutter_clean" },
  { name: "Flutter Upgrade Engine", icon: "fa-circle-up", cat: "Flutter & Dart Engine", key: "flutter_upgrade" },
  { name: "Hot Reload VM Trigger", icon: "fa-bolt-lightning", cat: "Flutter & Dart Engine", key: "hot_reload" },
  { name: "Run Android Unit Tests", icon: "fa-vial-circle-check", cat: "Testing & QA", key: "unit_tests" },
  { name: "Run UI Espresso Tests", icon: "fa-flask-vial", cat: "Testing & QA", key: "espresso_tests" },
  { name: "Generate Test Code Coverage Report", icon: "fa-chart-pie", cat: "Testing & QA", key: "coverage_report" },
  { name: "HTTP REST API Tester / Postman", icon: "fa-paper-plane", cat: "Network & API Testing", key: "api_tester" },
  { name: "Inspect WebSocket Feed", icon: "fa-plug", cat: "Network & API Testing", key: "ws_inspect" },
  { name: "Heap Profiler & Memory Leak Check", icon: "fa-microchip", cat: "Profiling & Memory", key: "heap_profiler" },
  { name: "CPU Utilization & Thread Tracker", icon: "fa-chart-line", cat: "Profiling & Memory", key: "cpu_tracker" }
];

export const massive520Tools: ToolItem[] = Array.from({ length: 520 }, (_, index) => {
  const base = baseTools[index % baseTools.length];
  const cat = toolCategories[index % toolCategories.length];
  const iteration = Math.floor(index / baseTools.length) + 1;
  const toolName = iteration === 1 ? base.name : `${base.name} [Opt #${iteration}]`;
  return {
    id: index + 1,
    name: toolName,
    icon: base.icon,
    category: cat,
    actionKey: `${base.key}_${iteration}`,
    badge: index < 50 ? "PRO" : (index % 5 === 0 ? "3X" : undefined)
  };
});
