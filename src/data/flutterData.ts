import { ProjectTemplate } from '../types';

export const flutterColors = [
  "#02569B", "#0175C2", "#13B9FD", "#00B4D8", "#0077B6",
  "#2A9D8F", "#E76F51", "#F4A261", "#9B5DE5", "#F15BB5",
  "#00F5D4", "#7209B7", "#3A0CA3", "#4361EE", "#4CC9F0",
  "#2EC4B6", "#E71D36", "#FF9F1C", "#6A4C93", "#1982C4"
];

const flutterTemplateBases = [
  { name: "Flutter Counter Classic", icon: "fa-cube", cat: "Stateful Core", starter: "import 'package:flutter/material.dart';\nvoid main() => runApp(const MyApp());\nclass MyApp extends StatelessWidget {\n  const MyApp({super.key});\n  @override\n  Widget build(BuildContext context) => const MaterialApp(home: Scaffold(body: Center(child: Text('Flutter 100%'))));\n}" },
  { name: "Material 3 Adaptive Shell", icon: "fa-mobile-screen", cat: "Material Design", starter: "import 'package:flutter/material.dart';\n// Material 3 Responsive Scaffold\nclass AppShell extends StatelessWidget {}" },
  { name: "Riverpod State Architecture", icon: "fa-water", cat: "State Management", starter: "import 'package:flutter_riverpod/flutter_riverpod.dart';\nfinal counterProvider = StateProvider((ref) => 0);" },
  { name: "Bloc / Cubit Clean Flow", icon: "fa-rotate", cat: "State Management", starter: "import 'package:flutter_bloc/flutter_bloc.dart';\nclass CounterCubit extends Cubit<int> { CounterCubit() : super(0); }" },
  { name: "Flutter E-Commerce Catalog", icon: "fa-cart-shopping", cat: "E-Commerce", starter: "class CatalogPage extends StatelessWidget {\n  // Product Grid with Hero Transitions\n}" },
  { name: "Live Chat & WebSocket Client", icon: "fa-comments", cat: "Social & Chat", starter: "import 'package:web_socket_channel/web_socket_channel.dart';\nclass ChatRoom extends StatefulWidget {}" },
  { name: "Audio Streaming & Player", icon: "fa-headphones", cat: "Media & Audio", starter: "import 'package:just_audio/just_audio.dart';\nfinal player = AudioPlayer();" },
  { name: "CameraX & ML Kit Vision", icon: "fa-camera", cat: "Vision & AI", starter: "import 'package:camera/camera.dart';\nclass CameraScreen extends StatefulWidget {}" },
  { name: "Google Maps Route Tracker", icon: "fa-map-location-dot", cat: "Geo & Maps", starter: "import 'package:google_maps_flutter/google_maps_flutter.dart';\nclass MapScreen extends StatelessWidget {}" },
  { name: "SQLite & Drift Offline DB", icon: "fa-database", cat: "Storage & DB", starter: "import 'package:drift/drift.dart';\n@DriftDatabase(tables: [Tasks]) class AppDatabase {}" },
  { name: "Firebase Auth & Firestore", icon: "fa-fire", cat: "Cloud & Firebase", starter: "import 'package:firebase_auth/firebase_auth.dart';\nimport 'package:cloud_firestore/cloud_firestore.dart';" },
  { name: "Flame Engine 2D Arcade Game", icon: "fa-gamepad", cat: "Gaming", starter: "import 'package:flame/game.dart';\nclass SpaceGame extends FlameGame {}" },
  { name: "GraphQL & Hasura Client", icon: "fa-network-wired", cat: "API & Networking", starter: "import 'package:graphql_flutter/graphql_flutter.dart';\n// GraphQL Provider" },
  { name: "Bluetooth BLE Peripheral Hub", icon: "fa-bluetooth", cat: "Hardware & IoT", starter: "import 'package:flutter_blue_plus/flutter_blue_plus.dart';\nclass BleScanner {}" },
  { name: "Biometric Auth & Secure Storage", icon: "fa-fingerprint", cat: "Security", starter: "import 'package:local_auth/local_auth.dart';\nfinal auth = LocalAuthentication();" },
  { name: "Lottie Animation Showcase", icon: "fa-wand-magic-sparkles", cat: "UI & Animation", starter: "import 'package:lottie/lottie.dart';\nclass AnimScreen extends StatelessWidget {}" },
  { name: "PDF Viewer & Annotator", icon: "fa-file-pdf", cat: "Productivity", starter: "import 'package:syncfusion_flutter_pdfviewer/pdfviewer.dart';" },
  { name: "Crypto & Web3 Wallet", icon: "fa-wallet", cat: "Finance & Crypto", starter: "import 'package:web3dart/web3dart.dart';\nclass CryptoWallet {}" },
  { name: "Calendar & Event Planner", icon: "fa-calendar-days", cat: "Productivity", starter: "import 'package:table_calendar/table_calendar.dart';\nclass CalendarApp extends StatelessWidget {}" },
  { name: "Smart Watch Wear OS Target", icon: "fa-clock", cat: "Wear OS", starter: "import 'package:wear/wear.dart';\nclass WatchFaceApp extends StatelessWidget {}" }
];

export const flutterTemplates100: ProjectTemplate[] = Array.from({ length: 100 }, (_, index) => {
  const base = flutterTemplateBases[index % flutterTemplateBases.length];
  const color = flutterColors[index % flutterColors.length];
  const variation = Math.floor(index / flutterTemplateBases.length) + 1;
  const name = variation === 1 ? base.name : `${base.name} (V${variation})`;

  return {
    id: 1000 + index + 1,
    name,
    icon: base.icon,
    category: base.cat,
    description: `Official Flutter template for ${base.name} with Material 3, Dart sound null-safety, and reactive state.`,
    language: "Dart",
    type: "flutter",
    starterCode: base.starter,
    fileName: "main.dart",
    colorAccent: color
  };
});

export const flutterAppTypes100: string[] = [
  "Cross-Platform Mobile", "Flutter Web Progressive App", "macOS & Windows Desktop", "Wear OS Watch App", "Embedded IoT Display",
  "Material 3 Clean UI", "Cupertino iOS Style", "Riverpod Enterprise", "Bloc Clean Architecture", "GetX Rapid Prototype",
  "Offline-First SQLite", "Cloud Firestore Realtime", "Supabase PostgreSQL", "GraphQL Client App", "REST Dio Client",
  "E-Commerce & Storefront", "Multi-Vendor Marketplace", "Crypto & Web3 Wallet", "Fintech & Banking UPI", "Food Delivery & Tracker",
  "Taxi & Ride Hailing Map", "Real Estate & Rental", "Social Network Feed", "Direct Messaging & Chat", "Live Audio Room (Clubhouse)",
  "Video Calling WebRTC", "Short Video Reels Player", "Music Player & Equalizer", "Podcast & RSS Aggregator", "Photo Editor & Filter",
  "Camera Barcode Scanner", "Document & PDF Scanner", "Fitness & Step Tracker", "Workout & Gym Planner", "Diet & Calorie Diary",
  "Sleep & Meditation Guide", "Smart Home Automation", "Bluetooth Device Manager", "Drone Flight Controller", "Weather Radar & Alert",
  "Travel Guide & Itinerary", "Flight & Hotel Booking", "News & Magazine Reader", "E-Book & EPUB Reader", "Recipe & Cooking Timer",
  "Personal Finance & Budget", "Crypto Portfolio Ticker", "Stock Market Watchlist", "Inventory & POS System", "Invoice & Billing Generator",
  "Employee Attendance Hub", "Task & Kanban Board", "Notes & Markdown Vault", "Habit Tracker & Streak", "Flashcards & Spaced Memory",
  "Quiz & Trivia Challenge", "Language Learning App", "Virtual Classroom / LMS", "Kids Learning & Phonics", "Drawing & Sketch Canvas",
  "Flame 2D Platformer Game", "Puzzle & Match-3 Game", "Card & Board Game", "Augmented Reality ARCore", "AI Voice Assistant Bot",
  "ChatGPT & Gemini Client", "Computer Vision OCR", "Soundboard & Voice FX", "Guitar & Instrument Tuner", "Metronome & BPM Beat",
  "Compass & Altimeter", "Speedometer & GPS HUD", "Network Speed Test", "FTP & Wi-Fi Share", "SSH Remote Terminal",
  "Password Manager & Vault", "Authenticator (2FA/TOTP)", "App Locker & Privacy", "Expense Splitter (Splitwise)", "Car Mileage & OBD2 Log",
  "Pet Healthcare & Vaccine", "Baby Monitor & Cry Alert", "Event RSVP & Ticketing", "Job Board & Career Hub", "Freelancer Work Log",
  "Freelance Portfolio Page", "Doctor Appointment App", "Pharmacy & Medicine Time", "Blood Donor & Urgent Map", "Charity & Donation Hub",
  "Auction & Bidding Engine", "Used Car Marketplace", "Package Tracker Hub", "Local Business Directory", "Astrology & Horoscope",
  "Quotes & Daily Wisdom", "Water Reminder Drinker", "Formula & Math Solver", "Unit & Currency Converter", "Emergency SOS Beacon"
];

export const flutterLanguages100: string[] = [
  "Dart 3.x (Null-Safe)", "Flutter Engine (C++)", "Riverpod (State)", "Flutter BLoC", "Provider",
  "GetX Framework", "MobX for Flutter", "Redux Dart", "Drift (SQLite ORM)", "Hive NoSQL",
  "Isar Database", "ObjectBox Fast DB", "Firebase Core Dart", "Cloud Firestore", "Supabase Flutter",
  "Dio HTTP Client", "Http Package", "GraphQL Flutter", "Chopper REST", "Retrofit Dart",
  "Freezed CodeGen", "JsonSerializable", "AutoRoute Navigation", "GoRouter Declared", "Beamer Routing",
  "Flame Game Engine", "Bonfire RPG Engine", "Forge2D Physics", "Audioplayers Dart", "JustAudio Stream",
  "Camera Plugin", "ImagePicker Android", "Google ML Kit Dart", "Flutter Blue Plus", "QuickBlue BLE",
  "Google Maps Flutter", "Mapbox Maps SDK", "Flutter Map (Leaflet)", "Geolocator GPS", "Local Auth Biometric",
  "Flutter Secure Storage", "Encrypt AES/RSA", "WebCrypto Dart", "Pdf & Printing", "Syncfusion Charts",
  "FL Chart Library", "Lottie Animations", "Rive Vector Engine", "Shimmer Effect UI", "CachedNetworkImage",
  "Webview Flutter", "InAppWebView Pro", "Flutter WebAssembly", "FFI Native C/C++", "RustBridge Flutter",
  "MethodChannel Kotlin", "EventChannel Native", "PlatformViews Android", "WorkManager Flutter", "Background Fetch",
  "Flutter Local Notif", "Firebase Messaging", "Awesome Notifications", "Upgrader App Version", "PackageInfo Plus",
  "Device Info Plus", "Sensors Plus Motion", "Connectivity Plus", "Battery Plus", "Permission Handler",
  "FilePicker Android", "Path Provider", "Share Plus Social", "Url Launcher", "Vibration Haptics",
  "Flutter Markdown", "Flutter HTML Parser", "CodeTextfield IDE", "SyntaxHighlighter", "Flutter Animate",
  "Staggered Grid View", "Slidable List Item", "Pull to Refresh", "Custom RefreshIndicator", "Hero Animation V2",
  "SliverAppBar Dynamic", "Responsive Builder", "Sizer Responsive", "ScreenUtil Flutter", "Google Fonts Dart",
  "FontAwesome Flutter", "Cupertino Icons", "Material Symbols", "Intl Localization", "Easy Localization",
  "Dart Test Suite", "Flutter Driver Test", "Mocktail Unit Mock", "Integration Test", "Golden Toolkit UI"
];
