import { ProjectItem, TutorialItem, DEFAULT_TUTORIALS } from './practiceProjectsData';
import { BlockItem, DEFAULT_BLOCKS } from './practiceBlocksData';

export const DEFAULT_FLUTTER_PRACTICE_PROJECTS: ProjectItem[] = [
  {
    id: 'fl_proj_1',
    name: '1_Flutter_Counter.dart',
    lang: 'Dart',
    isOriginal: true,
    code: `import 'package:flutter/material.dart';

void main() => runApp(const FlutterCounterApp());

class FlutterCounterApp extends StatelessWidget {
  const FlutterCounterApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Counter',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorSchemeSeed: Colors.cyan,
        useMaterial3: true,
        brightness: Brightness.dark,
      ),
      home: const CounterPage(),
    );
  }
}

class CounterPage extends StatefulWidget {
  const CounterPage({super.key});

  @override
  State<CounterPage> createState() => _CounterPageState();
}

class _CounterPageState extends State<CounterPage> {
  int _counter = 0;

  void _increment() => setState(() => _counter++);
  void _reset() => setState(() => _counter = 0);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Flutter Material 3 Counter'),
        centerTitle: true,
        backgroundColor: const Color(0xFF0F172A),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('BUTTON CLICKS', style: TextStyle(letterSpacing: 2, color: Colors.cyan)),
            Text('$_counter', style: const TextStyle(fontSize: 64, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: _reset,
              icon: const Icon(Icons.refresh),
              label: const Text('Reset Counter'),
            )
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _increment,
        child: const Icon(Icons.add),
      ),
    );
  }
}`,
    html: `<div class="flutter-scaffold">
  <div class="flutter-appbar">
    <span class="fl-brand">FLUTTER</span>
    <span>Material 3 Counter</span>
  </div>
  <div class="flutter-body">
    <div class="fl-badge">STATEFUL WIDGET</div>
    <p class="fl-sub">BUTTON PRESSES</p>
    <div id="flCount" class="fl-counter-val">0</div>
    <div class="fl-btn-row">
      <button onclick="flReset()" class="fl-btn-sec">↺ Reset</button>
      <button onclick="flIncrement()" class="fl-fab">+</button>
    </div>
  </div>
</div>`,
    css: `.flutter-scaffold {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #0f172a;
  color: #fff;
  border-radius: 16px;
  overflow: hidden;
  max-width: 380px;
  margin: 16px auto;
  border: 1px solid #1e293b;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}
.flutter-appbar {
  background: #0284c7;
  padding: 14px 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}
.fl-brand {
  background: rgba(0,0,0,0.25);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
}
.flutter-body {
  padding: 36px 20px;
  text-align: center;
}
.fl-badge {
  display: inline-block;
  background: rgba(14, 165, 233, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(14, 165, 233, 0.4);
  font-size: 10px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 9999px;
  margin-bottom: 12px;
}
.fl-sub {
  color: #94a3b8;
  font-size: 12px;
  letter-spacing: 1.5px;
  margin: 0 0 6px 0;
}
.fl-counter-val {
  font-size: 64px;
  font-weight: 900;
  color: #38bdf8;
  margin-bottom: 24px;
}
.fl-btn-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}
.fl-btn-sec {
  background: #1e293b;
  color: #e2e8f0;
  border: 1px solid #334155;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
}
.fl-fab {
  width: 50px;
  height: 50px;
  border-radius: 16px;
  background: #0284c7;
  border: none;
  color: #fff;
  font-size: 24px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4);
}`,
    js: `let count = 0;
function flIncrement() {
  count++;
  document.getElementById('flCount').innerText = count;
}
function flReset() {
  count = 0;
  document.getElementById('flCount').innerText = count;
}`,
    createdAt: 'Flutter 3.x'
  },
  {
    id: 'fl_proj_2',
    name: '2_Material3_Cards.dart',
    lang: 'Dart',
    code: `import 'package:flutter/material.dart';

void main() => runApp(const Material3Showcase());

class Material3Showcase extends StatelessWidget {
  const Material3Showcase({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.teal),
      home: Scaffold(
        appBar: AppBar(title: const Text('Material 3 Cards & Chips')),
        body: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Card(
              elevation: 4,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: const [
                    Text('Elevated Card', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    SizedBox(height: 8),
                    Text('Responsive Flutter widget with elevation & rounded corners.'),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}`,
    html: `<div class="m3-wrap">
  <div class="m3-header">Material 3 Cards</div>
  <div class="m3-card elevated">
    <div class="m3-chip">ELEVATED CARD</div>
    <h3>Flutter Card Component</h3>
    <p>Modern elevation, rounded corners, and dynamic state styling.</p>
  </div>
  <div class="m3-card outlined">
    <div class="m3-chip chip-outline">OUTLINED CARD</div>
    <h3>Secondary Layout</h3>
    <p>Zero elevation with crisp border hierarchy.</p>
  </div>
</div>`,
    css: `.m3-wrap { font-family: sans-serif; max-width: 380px; margin: 10px auto; color: #fff; }
.m3-header { background: #0f766e; padding: 12px; font-weight: 700; border-radius: 8px 8px 0 0; }
.m3-card { background: #134e4a; padding: 16px; margin: 12px 0; border-radius: 12px; }
.m3-card.elevated { box-shadow: 0 8px 20px rgba(0,0,0,0.4); }
.m3-card.outlined { background: transparent; border: 1px solid #2dd4bf; }
.m3-chip { font-size: 10px; font-weight: 800; background: #2dd4bf; color: #042f2e; padding: 2px 8px; border-radius: 4px; display: inline-block; margin-bottom: 6px; }`,
    js: `console.log("Flutter M3 loaded");`,
    createdAt: 'Flutter 3.x'
  },
  {
    id: 'fl_proj_3',
    name: '3_Riverpod_State.dart',
    lang: 'Dart',
    code: `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final cartCountProvider = StateProvider<int>((ref) => 0);

void main() => runApp(const ProviderScope(child: CartApp()));

class CartApp extends ConsumerWidget {
  const CartApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartCount = ref.watch(cartCountProvider);
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(
          title: Text('Riverpod Cart: $cartCount'),
          actions: [IconButton(icon: const Icon(Icons.shopping_cart), onPressed: () {})],
        ),
        body: Center(
          child: ElevatedButton(
            onPressed: () => ref.read(cartCountProvider.notifier).state++,
            child: const Text('Add to Cart'),
          ),
        ),
      ),
    );
  }
}`,
    html: `<div class="riverpod-box">
  <div class="rp-top">
    <span>Riverpod State</span>
    <span id="rpBadge" class="rp-badge">Cart: 0</span>
  </div>
  <div class="rp-content">
    <p>Reactive ProviderScope & ConsumerWidget</p>
    <button onclick="addCart()" class="rp-btn">🛒 Add Item to Cart</button>
  </div>
</div>`,
    css: `.riverpod-box { background: #1e1b4b; color: #fff; max-width: 360px; margin: 15px auto; border-radius: 12px; overflow: hidden; border: 1px solid #4338ca; }
.rp-top { background: #4338ca; padding: 12px 16px; display: flex; justify-content: space-between; font-weight: 700; }
.rp-badge { background: #fbbf24; color: #000; padding: 2px 10px; border-radius: 9999px; font-size: 12px; }
.rp-content { padding: 24px; text-align: center; }
.rp-btn { background: #6366f1; color: #fff; border: none; padding: 12px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; }`,
    js: `let items = 0;
function addCart() {
  items++;
  document.getElementById('rpBadge').innerText = 'Cart: ' + items;
}`,
    createdAt: 'Flutter 3.x'
  },
  {
    id: 'fl_proj_4',
    name: '4_Hero_Animation.dart',
    lang: 'Dart',
    code: `import 'package:flutter/material.dart';

void main() => runApp(const HeroApp());

class HeroApp extends StatelessWidget {
  const HeroApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(home: FirstPage());
  }
}

class FirstPage extends StatelessWidget {
  const FirstPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Flutter Hero Animation')),
      body: Center(
        child: Hero(
          tag: 'hero-avatar',
          child: GestureDetector(
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SecondPage())),
            child: const CircleAvatar(radius: 50, backgroundColor: Colors.orange, child: Icon(Icons.flutter_dash, size: 50)),
          ),
        ),
      ),
    );
  }
}

class SecondPage extends StatelessWidget {
  const SecondPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Expanded Hero')),
      body: const Center(
        child: Hero(
          tag: 'hero-avatar',
          child: CircleAvatar(radius: 120, backgroundColor: Colors.orange, child: Icon(Icons.flutter_dash, size: 120)),
        ),
      ),
    );
  }
}`,
    html: `<div class="hero-wrap">
  <div class="hero-bar">Hero Transition</div>
  <div id="heroCircle" class="hero-circle" onclick="toggleHero()">
    <span>FLUTTER DASH</span>
  </div>
  <p class="hero-hint">Tap circle to trigger Hero scaling</p>
</div>`,
    css: `.hero-wrap { text-align: center; background: #1c1917; color: #fff; padding: 20px; max-width: 360px; margin: 15px auto; border-radius: 12px; }
.hero-bar { font-weight: 800; color: #f97316; margin-bottom: 16px; }
.hero-circle { width: 90px; height: 90px; background: #f97316; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; cursor: pointer; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 4px 18px rgba(249, 115, 22, 0.4); }
.hero-circle.expanded { transform: scale(1.6); background: #ea580c; }
.hero-hint { font-size: 11px; color: #a8a29e; margin-top: 24px; }`,
    js: `function toggleHero() {
  document.getElementById('heroCircle').classList.toggle('expanded');
}`,
    createdAt: 'Flutter 3.x'
  },
  {
    id: 'fl_proj_5',
    name: '5_Ecommerce_Catalog.dart',
    lang: 'Dart',
    code: `import 'package:flutter/material.dart';

void main() => runApp(const StoreApp());

class StoreApp extends StatelessWidget {
  const StoreApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: ThemeData.dark(),
      home: Scaffold(
        appBar: AppBar(title: const Text('Flutter Shop')),
        body: GridView.count(
          crossAxisCount: 2,
          padding: const EdgeInsets.all(12),
          children: List.generate(4, (i) => Card(child: Center(child: Text('Product $i')))),
        ),
      ),
    );
  }
}`,
    html: `<div class="store-box">
  <div class="store-header">Flutter E-Commerce</div>
  <div class="store-grid">
    <div class="store-card">
      <div class="store-img">📱</div>
      <div class="store-title">Flutter Phone Pro</div>
      <button class="store-buy" onclick="alert('Added to cart!')">$799</button>
    </div>
    <div class="store-card">
      <div class="store-img">🎧</div>
      <div class="store-title">Wireless Audio</div>
      <button class="store-buy" onclick="alert('Added to cart!')">$149</button>
    </div>
  </div>
</div>`,
    css: `.store-box { background: #09090b; color: #fff; max-width: 360px; margin: 15px auto; border-radius: 12px; overflow: hidden; }
.store-header { background: #2563eb; padding: 12px 16px; font-weight: 700; }
.store-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 12px; }
.store-card { background: #18181b; padding: 12px; border-radius: 8px; text-align: center; border: 1px solid #27272a; }
.store-img { font-size: 32px; margin-bottom: 6px; }
.store-title { font-size: 12px; font-weight: 600; margin-bottom: 8px; }
.store-buy { background: #2563eb; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 700; }`,
    js: `console.log("Catalog ready");`,
    createdAt: 'Flutter 3.x'
  },
  {
    id: 'fl_proj_6',
    name: '6_Chat_Messenger.dart',
    lang: 'Dart',
    code: `import 'package:flutter/material.dart';

void main() => runApp(const ChatApp());

class ChatApp extends StatelessWidget {
  const ChatApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(home: ChatScreen());
  }
}

class ChatScreen extends StatelessWidget {
  const ChatScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Flutter Realtime Chat')),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(12),
              children: const [
                Align(alignment: Alignment.centerLeft, child: Chip(label: Text('Hello from Flutter!'))),
                Align(alignment: Alignment.centerRight, child: Chip(label: Text('Welcome to mobile dev.'))),
              ],
            ),
          ),
          const Divider(height: 1),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                const Expanded(child: TextField(decoration: InputDecoration(hintText: 'Type message...'))),
                IconButton(icon: const Icon(Icons.send), onPressed: () {})
              ],
            ),
          )
        ],
      ),
    );
  }
}`,
    html: `<div class="chat-wrap">
  <div class="chat-top">Flutter Messenger</div>
  <div class="chat-messages" id="chatList">
    <div class="chat-msg left">Hello! Ready to write Dart code?</div>
    <div class="chat-msg right">Yes! Testing live Flutter simulator.</div>
  </div>
  <div class="chat-input-row">
    <input type="text" id="chatInput" placeholder="Message..." />
    <button onclick="sendMsg()">Send</button>
  </div>
</div>`,
    css: `.chat-wrap { background: #111827; color: #fff; max-width: 360px; margin: 15px auto; border-radius: 12px; overflow: hidden; border: 1px solid #1f2937; }
.chat-top { background: #059669; padding: 12px 16px; font-weight: 700; }
.chat-messages { height: 160px; padding: 12px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; }
.chat-msg { max-width: 80%; padding: 8px 12px; border-radius: 10px; font-size: 13px; }
.chat-msg.left { background: #374151; align-self: flex-start; }
.chat-msg.right { background: #059669; align-self: flex-end; }
.chat-input-row { display: flex; padding: 8px; background: #1f2937; gap: 8px; }
.chat-input-row input { flex: 1; background: #111827; border: 1px solid #374151; color: #fff; padding: 8px 12px; border-radius: 6px; }
.chat-input-row button { background: #059669; border: none; color: #fff; padding: 8px 14px; border-radius: 6px; font-weight: 700; cursor: pointer; }`,
    js: `function sendMsg() {
  const inp = document.getElementById('chatInput');
  if (!inp.value.trim()) return;
  const div = document.createElement('div');
  div.className = 'chat-msg right';
  div.innerText = inp.value;
  document.getElementById('chatList').appendChild(div);
  inp.value = '';
}`,
    createdAt: 'Flutter 3.x'
  },
  {
    id: 'fl_proj_7',
    name: '7_Audio_Player.dart',
    lang: 'Dart',
    code: `import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';

void main() => runApp(const AudioApp());

class AudioApp extends StatefulWidget {
  const AudioApp({super.key});

  @override
  State<AudioApp> createState() => _AudioAppState();
}

class _AudioAppState extends State<AudioApp> {
  final player = AudioPlayer();
  bool isPlaying = false;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(title: const Text('Flutter JustAudio')),
        body: Center(
          child: IconButton(
            iconSize: 64,
            icon: Icon(isPlaying ? Icons.pause_circle : Icons.play_circle),
            onPressed: () => setState(() => isPlaying = !isPlaying),
          ),
        ),
      ),
    );
  }
}`,
    html: `<div class="audio-box">
  <div class="audio-top">Flutter Audio Player</div>
  <div class="audio-disc" id="audioDisc">🎵</div>
  <button class="audio-ctrl" onclick="toggleAudio()" id="audioBtn">▶ Play</button>
</div>`,
    css: `.audio-box { background: #18181b; color: #fff; text-align: center; padding: 24px; max-width: 340px; margin: 15px auto; border-radius: 12px; }
.audio-top { font-weight: 700; color: #e11d48; margin-bottom: 20px; }
.audio-disc { width: 70px; height: 70px; line-height: 70px; font-size: 32px; background: #27272a; border-radius: 50%; margin: 0 auto 20px auto; }
.audio-disc.spinning { animation: spin 2s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }
.audio-ctrl { background: #e11d48; border: none; color: #fff; padding: 10px 24px; border-radius: 9999px; font-weight: 700; cursor: pointer; }`,
    js: `let play = false;
function toggleAudio() {
  play = !play;
  document.getElementById('audioDisc').classList.toggle('spinning', play);
  document.getElementById('audioBtn').innerText = play ? '⏸ Pause' : '▶ Play';
}`,
    createdAt: 'Flutter 3.x'
  },
  {
    id: 'fl_proj_8',
    name: '8_Google_Maps_Route.dart',
    lang: 'Dart',
    code: `import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

void main() => runApp(const MapApp());

class MapApp extends StatelessWidget {
  const MapApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      home: Scaffold(
        body: Center(child: Text('Google Maps LatLng: (37.422, -122.084)')),
      ),
    );
  }
}`,
    html: `<div class="map-box">
  <div class="map-header">Google Maps Flutter</div>
  <div class="map-canvas">
    <div class="map-pin">📍 Cupertino (37.33, -122.03)</div>
  </div>
</div>`,
    css: `.map-box { background: #0f172a; color: #fff; max-width: 360px; margin: 15px auto; border-radius: 12px; overflow: hidden; }
.map-header { background: #0284c7; padding: 10px 16px; font-weight: 700; }
.map-canvas { height: 140px; background: #1e293b; display: flex; align-items: center; justify-content: center; }
.map-pin { background: rgba(0,0,0,0.6); padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; color: #38bdf8; }`,
    js: `console.log("Map active");`,
    createdAt: 'Flutter 3.x'
  },
  {
    id: 'fl_proj_9',
    name: '9_SQLite_Drift_Todo.dart',
    lang: 'Dart',
    code: `import 'package:flutter/material.dart';

void main() => runApp(const TodoApp());

class TodoApp extends StatefulWidget {
  const TodoApp({super.key});

  @override
  State<TodoApp> createState() => _TodoAppState();
}

class _TodoAppState extends State<TodoApp> {
  final List<String> tasks = ['Study Flutter State', 'Build Release APK'];

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(title: const Text('Drift Offline DB')),
        body: ListView.builder(
          itemCount: tasks.length,
          itemBuilder: (_, i) => ListTile(leading: const Icon(Icons.check), title: Text(tasks[i])),
        ),
      ),
    );
  }
}`,
    html: `<div class="todo-wrap">
  <div class="todo-top">Drift SQLite Tasks</div>
  <ul class="todo-items" id="todoItems">
    <li>✓ Master Flutter Null Safety</li>
    <li>✓ Configure Android Gradle</li>
  </ul>
</div>`,
    css: `.todo-wrap { background: #141420; color: #fff; max-width: 360px; margin: 15px auto; border-radius: 12px; overflow: hidden; }
.todo-top { background: #8b5cf6; padding: 12px 16px; font-weight: 700; }
.todo-items { list-style: none; padding: 12px; margin: 0; display: flex; flex-direction: column; gap: 8px; font-size: 13px; }
.todo-items li { background: #1e1e2f; padding: 8px 12px; border-radius: 6px; }`,
    js: `console.log("SQLite ready");`,
    createdAt: 'Flutter 3.x'
  },
  {
    id: 'fl_proj_10',
    name: '10_Flame_Arcade_Game.dart',
    lang: 'Dart',
    code: `import 'package:flutter/material.dart';
import 'package:flame/game.dart';

void main() => runApp(GameWidget(game: MyFlameGame()));

class MyFlameGame extends FlameGame {
  @override
  Future<void> onLoad() async {
    // 2D Game Loop Engine
  }
}`,
    html: `<div class="game-wrap">
  <div class="game-top">Flame 2D Arcade</div>
  <canvas id="flameCanvas" width="280" height="120" style="background:#000;display:block;margin:10px auto;border-radius:6px;"></canvas>
  <button onclick="jumpBall()" class="game-btn">🕹️ Tap to Jump</button>
</div>`,
    css: `.game-wrap { background: #18181b; color: #fff; text-align: center; padding: 14px; max-width: 340px; margin: 15px auto; border-radius: 12px; }
.game-top { font-weight: 700; color: #10b981; }
.game-btn { background: #10b981; border: none; color: #fff; padding: 8px 20px; border-radius: 6px; font-weight: 700; cursor: pointer; }`,
    js: `let y = 60;
function jumpBall() { y = 30; }
const c = document.getElementById('flameCanvas');
if (c) {
  const ctx = c.getContext('2d');
  function loop() {
    ctx.clearRect(0,0,280,120);
    y = Math.min(90, y + 1.2);
    ctx.fillStyle = '#10b981';
    ctx.beginPath(); ctx.arc(140, y, 12, 0, Math.PI*2); ctx.fill();
    requestAnimationFrame(loop);
  }
  loop();
}`,
    createdAt: 'Flutter 3.x'
  }
];

export const DEFAULT_FLUTTER_TUTORIALS: TutorialItem[] = DEFAULT_TUTORIALS;

export const DEFAULT_FLUTTER_BLOCKS: BlockItem[] = DEFAULT_BLOCKS;
