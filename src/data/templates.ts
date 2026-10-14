import { ProjectTemplate } from '../types';

export const androidColors = [
  "#3DDC84", "#0A84FF", "#FF2D55", "#FF9500", "#AF52DE",
  "#FFD700", "#5AC8FA", "#4CD964", "#FF3B30", "#5856D6",
  "#00C49F", "#FFBB28", "#FF8042", "#0088FE", "#00E676",
  "#7C4DFF", "#536DFE", "#FF5252", "#E040FB", "#64FFDA"
];

const categories = [
  "Core Android", "Jetpack Compose", "Material 3 UI", "Architecture Components",
  "Networking & REST", "Room & SQLite", "Authentication & Security", "Audio & Video Media",
  "Camera & Vision", "Bluetooth & Sensors", "Background & Workers", "Widgets & Glance",
  "2D Canvas & Gaming", "Maps & Geolocation", "AI & ML Kit", "E-Commerce & Billing"
];

const androidTemplateBases = [
  { name: "Empty Activity (Java)", icon: "fa-brands fa-java", cat: "Core Android", lang: "Java", starter: "package com.myapp.android;\nimport androidx.appcompat.app.AppCompatActivity;\nimport android.os.Bundle;\npublic class MainActivity extends AppCompatActivity {\n  @Override\n  protected void onCreate(Bundle savedInstanceState) {\n    super.onCreate(savedInstanceState);\n  }\n}" },
  { name: "Jetpack Compose Empty", icon: "fa-layer-group", cat: "Jetpack Compose", lang: "Kotlin", starter: "package com.myapp.android\nimport androidx.compose.material3.Text\nimport androidx.compose.runtime.Composable\n@Composable\nfun MainScreen() {\n  Text(\"Welcome to Android IDE!\")\n}" },
  { name: "Material 3 Navigation Drawer", icon: "fa-bars", cat: "Material 3 UI", lang: "Kotlin", starter: "class DrawerActivity : AppCompatActivity() {\n  // Navigation Drawer Setup\n}" },
  { name: "Bottom Navigation Bar App", icon: "fa-table-cells-large", cat: "Material 3 UI", lang: "Kotlin", starter: "class BottomNavActivity : AppCompatActivity() {}" },
  { name: "ViewPager2 Swipeable Tabs", icon: "fa-clone", cat: "Material 3 UI", lang: "Kotlin", starter: "class TabActivity : AppCompatActivity() {}" },
  { name: "Login & Register Screen", icon: "fa-user-shield", cat: "Authentication & Security", lang: "Kotlin", starter: "class AuthActivity : AppCompatActivity() {}" },
  { name: "Room SQLite Database Notes", icon: "fa-database", cat: "Room & SQLite", lang: "Kotlin", starter: "@Entity(tableName = \"notes\")\ndata class Note(@PrimaryKey val id: Int, val title: String)" },
  { name: "Retrofit REST API Client", icon: "fa-cloud-arrow-down", cat: "Networking & REST", lang: "Kotlin", starter: "interface ApiService {\n  @GET(\"/feed\") suspend fun getFeed(): List<Post>\n}" },
  { name: "CameraX QR Barcode Scanner", icon: "fa-camera", cat: "Camera & Vision", lang: "Kotlin", starter: "class CameraActivity : AppCompatActivity() {}" },
  { name: "ExoPlayer HD Video Streamer", icon: "fa-circle-play", cat: "Audio & Video Media", lang: "Kotlin", starter: "class VideoActivity : AppCompatActivity() {}" },
  { name: "Audio Recorder & Waveform", icon: "fa-microphone", cat: "Audio & Video Media", lang: "Kotlin", starter: "class AudioActivity : AppCompatActivity() {}" },
  { name: "Google Maps Route Navigator", icon: "fa-map-location-dot", cat: "Maps & Geolocation", lang: "Kotlin", starter: "class MapsActivity : AppCompatActivity() {}" },
  { name: "Bluetooth Low Energy (BLE)", icon: "fa-bluetooth", cat: "Bluetooth & Sensors", lang: "Kotlin", starter: "class BleActivity : AppCompatActivity() {}" },
  { name: "Accelerometer & Compass HUD", icon: "fa-compass", cat: "Bluetooth & Sensors", lang: "Kotlin", starter: "class SensorActivity : AppCompatActivity() {}" },
  { name: "SurfaceView 2D Canvas Game", icon: "fa-gamepad", cat: "2D Canvas & Gaming", lang: "Kotlin", starter: "class GameView(ctx: Context) : SurfaceView(ctx), Runnable {}" },
  { name: "WorkManager Periodic Sync", icon: "fa-clock", cat: "Background & Workers", lang: "Kotlin", starter: "class SyncWorker(ctx: Context, p: WorkerParameters) : Worker(ctx, p) {}" },
  { name: "Firebase Push Cloud Message", icon: "fa-bell", cat: "Core Android", lang: "Kotlin", starter: "class FcmService : FirebaseMessagingService() {}" },
  { name: "Glance Modern App Widget", icon: "fa-table-columns", cat: "Widgets & Glance", lang: "Kotlin", starter: "class AppWidget : GlanceAppWidget() {}" },
  { name: "Biometric Prompt Fingerprint", icon: "fa-fingerprint", cat: "Authentication & Security", lang: "Kotlin", starter: "class BiometricActivity : AppCompatActivity() {}" },
  { name: "Google Play Billing & In-App", icon: "fa-credit-card", cat: "E-Commerce & Billing", lang: "Kotlin", starter: "class BillingActivity : AppCompatActivity() {}" }
];

export const androidTemplates100: ProjectTemplate[] = Array.from({ length: 100 }, (_, index) => {
  const base = androidTemplateBases[index % androidTemplateBases.length];
  const cat = categories[index % categories.length];
  const color = androidColors[index % androidColors.length];
  const variation = Math.floor(index / androidTemplateBases.length) + 1;
  const name = variation === 1 ? base.name : `${base.name} (V${variation})`;

  return {
    id: index + 1,
    name,
    icon: base.icon,
    category: cat,
    description: `Production-ready Android native starter template for ${base.name} with modern architecture.`,
    language: base.lang,
    type: "android",
    starterCode: base.starter,
    fileName: base.lang === 'Java' ? 'MainActivity.java' : 'MainActivity.kt',
    colorAccent: color
  };
});

export const projectTemplates: ProjectTemplate[] = androidTemplates100;
