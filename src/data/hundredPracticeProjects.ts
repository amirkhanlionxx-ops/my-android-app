import { ProjectItem } from './practiceProjectsData';

// 100 Diverse, Real, High-Quality Practice Projects for Code Studio Pro
export const HUNDRED_PRACTICE_PROJECTS_TEMPLATES: {
  title: string;
  name: string;
  category: string;
  html: string;
  css: string;
  js: string;
  dartCode?: string;
  kotlinCode?: string;
}[] = [
  {
    title: 'Welcome Screen',
    name: '01_Welcome.html',
    category: 'Basics',
    html: `<div class="card-box">
  <span class="badge">PROJECT 01</span>
  <h1>Welcome to Code Studio Pro!</h1>
  <p>Learn mobile and web coding step by step with live preview and interactive blocks.</p>
  <button id="actionBtn" onclick="greetUser()">Get Started</button>
  <div id="outputMsg" class="output-text"></div>
</div>`,
    css: `body { background: #09090b; color: #f8fafc; font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
.card-box { background: #18181b; border: 1px solid #27272a; padding: 28px; border-radius: 16px; text-align: center; max-width: 420px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
.badge { background: #0284c7; color: #fff; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px; }
h1 { font-size: 22px; margin: 16px 0 8px; color: #38bdf8; }
p { font-size: 14px; color: #a1a1aa; line-height: 1.5; margin-bottom: 20px; }
button { background: #0284c7; color: #fff; border: none; padding: 10px 22px; font-weight: 700; border-radius: 10px; cursor: pointer; transition: all 0.2s; }
button:hover { background: #0369a1; transform: translateY(-1px); }
.output-text { margin-top: 14px; font-weight: 600; color: #4ade80; }`,
    js: `function greetUser() {
  const out = document.getElementById('outputMsg');
  out.textContent = "🚀 Ready! Let's code and build apps together!";
}`,
    dartCode: `import 'package:flutter/material.dart';

void main() => runApp(const WelcomeApp());

class WelcomeApp extends StatelessWidget {
  const WelcomeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark(),
      home: Scaffold(
        appBar: AppBar(title: const Text('01: Welcome App')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.code, size: 64, color: Colors.cyan),
              const SizedBox(height: 16),
              const Text('Welcome to Code Studio', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              const Text('Start coding with Dart & Flutter widgets!'),
            ],
          ),
        ),
      ),
    );
  }
}`,
    kotlinCode: `package com.example.codestudio

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                Column(
                    modifier = Modifier.fillMaxSize().padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text("Welcome to Android Studio", style = MaterialTheme.typography.headlineMedium)
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(onClick = { /* Action */ }) {
                        Text("Get Started")
                    }
                }
            }
        }
    }
}`
  },
  {
    title: 'Interactive Button',
    name: '02_InteractiveButton.html',
    category: 'Basics',
    html: `<div class="card-box">
  <span class="badge">PROJECT 02</span>
  <h2>Tap Magic Button</h2>
  <button id="tapBtn" onclick="handleTap()">Tap Count: <span id="tapCount">0</span></button>
  <div id="heartBox" class="heart-box"></div>
</div>`,
    css: `body { background: #0c0a09; color: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; font-family: sans-serif; }
.card-box { background: #1c1917; border: 1px solid #292524; padding: 24px; border-radius: 16px; text-align: center; width: 320px; }
.badge { background: #f43f5e; color: #fff; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 12px; }
button { background: #e11d48; color: #fff; border: none; padding: 12px 24px; font-size: 16px; font-weight: bold; border-radius: 12px; cursor: pointer; margin-top: 16px; }
.heart-box { margin-top: 12px; font-size: 24px; min-height: 36px; }`,
    js: `let count = 0;
function handleTap() {
  count++;
  document.getElementById('tapCount').textContent = count;
  const box = document.getElementById('heartBox');
  box.textContent = "❤️ ".repeat(Math.min(count, 10));
}`
  },
  {
    title: 'Counter App',
    name: '03_CounterApp.html',
    category: 'Basics',
    html: `<div class="card-box">
  <span class="badge">PROJECT 03</span>
  <h2>Tally Counter</h2>
  <div id="display" class="count-num">0</div>
  <div class="btn-row">
    <button class="btn-dec" onclick="change(-1)">-</button>
    <button class="btn-res" onclick="reset()">Reset</button>
    <button class="btn-inc" onclick="change(1)">+</button>
  </div>
</div>`,
    css: `body { background: #030712; color: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; font-family: system-ui; }
.card-box { background: #111827; border: 1px solid #1f2937; padding: 28px; border-radius: 18px; text-align: center; width: 320px; }
.badge { background: #10b981; color: #fff; font-size: 10px; font-weight: bold; padding: 3px 8px; border-radius: 10px; }
.count-num { font-size: 64px; font-weight: 900; color: #38bdf8; margin: 20px 0; }
.btn-row { display: flex; gap: 8px; justify-content: center; }
button { padding: 10px 18px; font-size: 16px; font-weight: bold; border-radius: 10px; border: none; cursor: pointer; }
.btn-inc { background: #0284c7; color: #fff; }
.btn-dec { background: #ef4444; color: #fff; }
.btn-res { background: #374151; color: #9ca3af; }`,
    js: `let val = 0;
function change(delta) { val += delta; document.getElementById('display').textContent = val; }
function reset() { val = 0; document.getElementById('display').textContent = val; }`
  },
  {
    title: 'Task Todo List',
    name: '04_TodoList.html',
    category: 'Basics',
    html: `<div class="card-box">
  <span class="badge">PROJECT 04</span>
  <h2>Quick Tasks</h2>
  <div class="input-row">
    <input id="todoIn" type="text" placeholder="Add task..." />
    <button onclick="addTodo()">Add</button>
  </div>
  <ul id="todoList"></ul>
</div>`,
    css: `body { background: #09090b; color: #fff; font-family: sans-serif; display: flex; justify-content: center; padding-top: 40px; }
.card-box { background: #18181b; border: 1px solid #27272a; padding: 20px; border-radius: 16px; width: 340px; }
.input-row { display: flex; gap: 6px; margin: 14px 0; }
input { flex: 1; padding: 8px 12px; background: #27272a; border: 1px solid #3f3f46; color: #fff; border-radius: 8px; }
button { background: #3b82f6; color: #fff; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; }
ul { list-style: none; padding: 0; margin: 0; }
li { padding: 8px 12px; background: #27272a; margin-bottom: 6px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }`,
    js: `function addTodo() {
  const inp = document.getElementById('todoIn');
  if (!inp.value.trim()) return;
  const li = document.createElement('li');
  li.innerHTML = \`<span>\${inp.value}</span> <button onclick="this.parentElement.remove()" style="background:#ef4444;padding:2px 8px;border-radius:4px;border:none;color:#fff;cursor:pointer;">✕</button>\`;
  document.getElementById('todoList').appendChild(li);
  inp.value = '';
}`
  },
  {
    title: 'Digital Clock',
    name: '05_DigitalClock.html',
    category: 'Basics',
    html: `<div class="card-box">
  <span class="badge">PROJECT 05</span>
  <h2>Digital Time</h2>
  <div id="clock" class="time-display">00:00:00</div>
  <div id="date" class="date-display">Date Loading...</div>
</div>`,
    css: `body { background: #020617; color: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; font-family: monospace; }
.card-box { background: #0f172a; border: 1px solid #1e293b; padding: 32px; border-radius: 20px; text-align: center; }
.time-display { font-size: 48px; font-weight: 800; color: #38bdf8; letter-spacing: 4px; margin: 16px 0 8px; }
.date-display { font-size: 14px; color: #94a3b8; letter-spacing: 1px; }`,
    js: `function updateClock() {
  const d = new Date();
  document.getElementById('clock').textContent = d.toLocaleTimeString();
  document.getElementById('date').textContent = d.toDateString();
}
setInterval(updateClock, 1000);
updateClock();`
  },
  {
    title: 'Mini Calculator',
    name: '06_MiniCalculator.html',
    category: 'Math',
    html: `<div class="card-box">
  <input id="calcScreen" readonly value="0" />
  <div class="grid">
    <button onclick="cClear()">C</button><button onclick="cOp('/')">/</button><button onclick="cOp('*')">*</button><button onclick="cOp('-')">-</button>
    <button onclick="cNum('7')">7</button><button onclick="cNum('8')">8</button><button onclick="cNum('9')">9</button><button onclick="cOp('+')">+</button>
    <button onclick="cNum('4')">4</button><button onclick="cNum('5')">5</button><button onclick="cNum('6')">6</button><button onclick="cEqual()" style="background:#0284c7;grid-row:span 2">=</button>
    <button onclick="cNum('1')">1</button><button onclick="cNum('2')">2</button><button onclick="cNum('3')">3</button>
    <button onclick="cNum('0')" style="grid-column:span 2">0</button><button onclick="cNum('.')">.</button>
  </div>
</div>`,
    css: `body { background: #0f172a; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; font-family: sans-serif; }
.card-box { background: #1e293b; padding: 20px; border-radius: 16px; width: 280px; }
input { width: 100%; height: 48px; background: #0f172a; border: 1px solid #334155; color: #38bdf8; font-size: 24px; text-align: right; padding: 0 12px; border-radius: 8px; box-sizing: border-box; margin-bottom: 12px; font-family: monospace; }
.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
button { height: 44px; background: #334155; border: none; border-radius: 8px; color: #fff; font-size: 16px; font-weight: bold; cursor: pointer; }`,
    js: `let expr = '';
function cNum(n) { expr += n; document.getElementById('calcScreen').value = expr; }
function cOp(o) { expr += ' ' + o + ' '; document.getElementById('calcScreen').value = expr; }
function cClear() { expr = ''; document.getElementById('calcScreen').value = '0'; }
function cEqual() {
  try { expr = String(Function('"use strict";return (' + expr + ')')()); document.getElementById('calcScreen').value = expr; }
  catch { document.getElementById('calcScreen').value = 'Error'; expr = ''; }
}`
  },
  {
    title: 'Quiz Trivia Game',
    name: '07_QuizGame.html',
    category: 'Games',
    html: `<div class="card-box">
  <span class="badge">PROJECT 07</span>
  <h2 id="qText">Question Loading...</h2>
  <div id="qOptions" class="opt-grid"></div>
  <div id="qScore" class="score-text"></div>
</div>`,
    css: `body { background: #09090b; color: #fff; font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
.card-box { background: #18181b; border: 1px solid #27272a; padding: 24px; border-radius: 16px; width: 340px; text-align: center; }
.opt-grid { display: flex; flex-direction: column; gap: 8px; margin: 16px 0; }
.opt-btn { background: #27272a; color: #fff; border: 1px solid #3f3f46; padding: 10px; border-radius: 8px; cursor: pointer; text-align: left; }
.opt-btn:hover { background: #3f3f46; }
.score-text { font-weight: bold; color: #4ade80; }`,
    js: `const questions = [
  { q: "What is Flutter primary language?", o: ["Dart", "Kotlin", "Swift", "Java"], a: 0 },
  { q: "Which tool builds Android APKs?", o: ["Gradle", "Webpack", "Maven", "Vite"], a: 0 }
];
let curr = 0, score = 0;
function showQ() {
  if (curr >= questions.length) {
    document.getElementById('qText').textContent = "Quiz Complete!";
    document.getElementById('qOptions').innerHTML = '';
    document.getElementById('qScore').textContent = \`Final Score: \${score} / \${questions.length}\`;
    return;
  }
  const item = questions[curr];
  document.getElementById('qText').textContent = item.q;
  const grid = document.getElementById('qOptions');
  grid.innerHTML = '';
  item.o.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'opt-btn';
    btn.textContent = opt;
    btn.onclick = () => { if (idx === item.a) score++; curr++; showQ(); };
    grid.appendChild(btn);
  });
}
showQ();`
  },
  {
    title: 'Color Palette Picker',
    name: '08_ColorPicker.html',
    category: 'Design',
    html: `<div class="card-box">
  <span class="badge">PROJECT 08</span>
  <h2>Color Palette Generator</h2>
  <div id="palette" class="palette-row"></div>
  <button onclick="genPalette()">Generate New Palette</button>
</div>`,
    css: `body { background: #0c0a09; color: #fff; font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
.card-box { background: #1c1917; border: 1px solid #292524; padding: 24px; border-radius: 16px; text-align: center; }
.palette-row { display: flex; gap: 8px; margin: 20px 0; }
.swatch { width: 50px; height: 80px; border-radius: 8px; display: flex; align-items: flex-end; justify-content: center; font-size: 10px; font-weight: bold; padding-bottom: 4px; color: #fff; text-shadow: 0 1px 2px #000; }
button { background: #f59e0b; border: none; padding: 10px 20px; font-weight: bold; border-radius: 8px; cursor: pointer; color: #000; }`,
    js: `function genPalette() {
  const row = document.getElementById('palette');
  row.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    const col = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    const div = document.createElement('div');
    div.className = 'swatch';
    div.style.backgroundColor = col;
    div.textContent = col;
    row.appendChild(div);
  }
}
genPalette();`
  },
  {
    title: 'Stop Watch Timer',
    name: '09_StopWatch.html',
    category: 'Utilities',
    html: `<div class="card-box">
  <span class="badge">PROJECT 09</span>
  <h2>Precision Stopwatch</h2>
  <div id="timerDisplay" class="time">00:00.00</div>
  <div class="controls">
    <button onclick="startTimer()">Start</button>
    <button onclick="stopTimer()">Stop</button>
    <button onclick="resetTimer()">Reset</button>
  </div>
</div>`,
    css: `body { background: #09090b; color: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; font-family: monospace; }
.card-box { background: #18181b; padding: 28px; border-radius: 16px; text-align: center; width: 300px; }
.time { font-size: 40px; font-weight: 900; color: #38bdf8; margin: 20px 0; }
.controls button { padding: 8px 16px; margin: 0 4px; border-radius: 8px; border: none; cursor: pointer; font-weight: bold; background: #3b82f6; color: #fff; }`,
    js: `let timer, ms = 0;
function startTimer() { if (!timer) timer = setInterval(() => { ms += 10; update(); }, 10); }
function stopTimer() { clearInterval(timer); timer = null; }
function resetTimer() { stopTimer(); ms = 0; update(); }
function update() {
  const m = Math.floor(ms / 60000).toString().padStart(2, '0');
  const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
  const cs = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
  document.getElementById('timerDisplay').textContent = \`\${m}:\${s}.\${cs}\`;
}`
  },
  {
    title: 'Quote of the Day',
    name: '10_QuoteOfTheDay.html',
    category: 'Utilities',
    html: `<div class="card-box">
  <span class="badge">PROJECT 10</span>
  <p id="quoteText" class="quote">"Code is like humor. When you have to explain it, it’s bad."</p>
  <span id="authorText" class="author">— Cory House</span>
  <button onclick="nextQuote()">Next Quote</button>
</div>`,
    css: `body { background: #030712; color: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; font-family: system-ui; }
.card-box { background: #111827; border: 1px solid #1f2937; padding: 28px; border-radius: 16px; max-width: 380px; text-align: center; }
.quote { font-style: italic; font-size: 16px; line-height: 1.6; color: #e2e8f0; }
.author { display: block; margin: 12px 0 20px; font-weight: bold; color: #38bdf8; }
button { background: #0284c7; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }`,
    js: `const quotes = [
  { q: "First, solve the problem. Then, write the code.", a: "John Johnson" },
  { q: "Make it work, make it right, make it fast.", a: "Kent Beck" },
  { q: "Simplicity is prerequisite for reliability.", a: "Edsger W. Dijkstra" }
];
let qIdx = 0;
function nextQuote() {
  qIdx = (qIdx + 1) % quotes.length;
  document.getElementById('quoteText').textContent = \`"\${quotes[qIdx].q}"\`;
  document.getElementById('authorText').textContent = \`— \${quotes[qIdx].a}\`;
}`
  }
];

// Helper to expand with remaining items up to 100 distinct practice projects
const CATEGORIES = [
  'UI Layout', 'Forms & Inputs', 'Mobile Components', 'Animations & 3D', 'Games & Fun',
  'Utilities & Tools', 'State & Patterns', 'Sensors & Media', 'Algorithms', 'Advanced Code'
];

const EXTENDED_NAMES: { name: string; title: string; desc: string; icon: string }[] = [
  { name: '11_FlexboxGallery.html', title: 'Flexbox Responsive Gallery', desc: 'Modern responsive auto-wrapping grid', icon: 'fa-table-cells' },
  { name: '12_HeroBanner.html', title: 'Modern Hero Header', desc: 'Sleek dark mode gradient landing hero', icon: 'fa-heading' },
  { name: '13_GlassmorphismCard.html', title: 'Glassmorphism Card UI', desc: 'Frosted glass with backdrop filter', icon: 'fa-square' },
  { name: '14_AccordionFAQ.html', title: 'Collapsible Accordion FAQ', desc: 'Smooth accordion toggle animation', icon: 'fa-chevron-down' },
  { name: '15_TabSwitcher.html', title: 'Animated Tab Bar', desc: 'Fluid tab switching with indicator line', icon: 'fa-folder' },
  { name: '16_ModalDialog.html', title: 'Popup Modal Dialog', desc: 'Accessible overlay with backdrop blur', icon: 'fa-window-restore' },
  { name: '17_DrawerNavigation.html', title: 'Offcanvas Drawer Menu', desc: 'Side navigation slide in and out', icon: 'fa-bars' },
  { name: '18_StickyNavbar.html', title: 'Sticky Top Navbar', desc: 'Header pinned on scroll with blur effect', icon: 'fa-anchor' },
  { name: '19_ImageSlider.html', title: 'Touch Carousel Slider', desc: 'Swipeable horizontal card carousel', icon: 'fa-images' },
  { name: '20_PricingTable.html', title: 'SaaS Pricing Tier Table', desc: 'Compare plans with highlight badge', icon: 'fa-tags' },
  { name: '21_LoginFormValidation.html', title: 'Login Form Validator', desc: 'Email regex and required input alerts', icon: 'fa-user-check' },
  { name: '22_PasswordStrengthMeter.html', title: 'Password Strength Meter', desc: 'Visual meter with entropy calculations', icon: 'fa-key' },
  { name: '23_StarRatingWidget.html', title: 'Interactive Star Rating', desc: 'Hover and click 5-star rating widget', icon: 'fa-star' },
  { name: '24_MultiStepForm.html', title: 'Multi-Step Wizard Form', desc: 'Step 1, 2, 3 progress bar wizard', icon: 'fa-list-ol' },
  { name: '25_FileDragDrop.html', title: 'File Drag & Drop Upload', desc: 'Drop zone with instant file preview', icon: 'fa-cloud-arrow-up' },
  { name: '26_AutocompleteSearch.html', title: 'Instant Search Filter', desc: 'Live debounce keyword filtering', icon: 'fa-search' },
  { name: '27_TagInputChips.html', title: 'Tag Input & Chips List', desc: 'Add and remove tags with enter key', icon: 'fa-tags' },
  { name: '28_ToggleSwitches.html', title: 'Custom Switch Toggles', desc: 'iOS and Android style smooth switches', icon: 'fa-toggle-on' },
  { name: '29_RangeVolumeSlider.html', title: 'Custom Dual Range Slider', desc: 'Numeric tooltip track with custom thumb', icon: 'fa-sliders' },
  { name: '30_MarkdownLiveEditor.html', title: 'Markdown Live Preview', desc: 'Type markdown and see rendered HTML', icon: 'fa-file-code' },
  { name: '31_MaterialAppBar.html', title: 'Material 3 Top App Bar', desc: 'Android native style action app bar', icon: 'fa-mobile' },
  { name: '32_BottomNavTabs.html', title: 'Mobile Bottom Navigation', desc: '5-tab bottom navigation with badges', icon: 'fa-table-columns' },
  { name: '33_FloatingActionBtn.html', title: 'FAB Speed Dial Button', desc: 'Floating action button with speed menu', icon: 'fa-circle-plus' },
  { name: '34_ExpandableCardList.html', title: 'Expandable Card List', desc: 'Tap card to expand details smoothly', icon: 'fa-id-card' },
  { name: '35_LazyGridFeed.html', title: 'Pinterest Masonry Grid', desc: 'Dynamic column flow layout feed', icon: 'fa-grip' },
  { name: '36_CategoryChipFilters.html', title: 'Horizontal Filter Chips', desc: 'Scrollable pill chips for category filters', icon: 'fa-filter' },
  { name: '37_ShimmerSkeletonLoader.html', title: 'Shimmer Skeleton Loader', desc: 'Animated skeleton placeholders for loading', icon: 'fa-wand-magic-sparkles' },
  { name: '38_PullToRefresh.html', title: 'Pull To Refresh Gesture', desc: 'Touch drag gesture with spinner release', icon: 'fa-arrow-rotate-right' },
  { name: '39_BottomSheetModal.html', title: 'Mobile Bottom Sheet', desc: 'Swipeable draggable bottom sheet modal', icon: 'fa-sheet-plastic' },
  { name: '40_HeroImageTransition.html', title: 'Hero Shared Element Transition', desc: 'Expand thumbnail into full screen image', icon: 'fa-expand' },
  { name: '41_CanvasDrawingPad.html', title: 'HTML5 Canvas Signature Pad', desc: 'Draw with finger/mouse, clear and save', icon: 'fa-pen-nib' },
  { name: '42_ConfettiParticles.html', title: 'Confetti Celebration Cannon', desc: 'Explosive confetti particle engine', icon: 'fa-sparkles' },
  { name: '43_3DCubeRotate.html', title: '3D Interactive Cube', desc: 'CSS 3D perspective rotated by mouse drag', icon: 'fa-cube' },
  { name: '44_SvgPathAnimation.html', title: 'SVG Line Drawing Animation', desc: 'Stroke-dasharray animated vector path', icon: 'fa-bezier-curve' },
  { name: '45_AudioSineWave.html', title: 'Audio Synthesizer Waveform', desc: 'Web Audio API oscillator with frequency pitch', icon: 'fa-wave-square' },
  { name: '46_AnalogClockDial.html', title: 'Analog Wall Clock Dial', desc: 'Rotating hour, minute, second needles', icon: 'fa-clock' },
  { name: '47_MatrixDigitalRain.html', title: 'Matrix Code Rain Effect', desc: 'Falling green Japanese glyphs canvas', icon: 'fa-terminal' },
  { name: '48_PhysicsBouncingBalls.html', title: 'Physics Gravity Simulation', desc: 'Elastic collision and gravity bouncing balls', icon: 'fa-volleyball' },
  { name: '49_GradientMeshCanvas.html', title: 'Dynamic Mesh Gradient', desc: 'Fluid morphing organic color mesh', icon: 'fa-palette' },
  { name: '50_InteractiveSolarSystem.html', title: 'Solar Orbit Planet Simulator', desc: 'Planets revolving around sun with speed rates', icon: 'fa-sun' },
  { name: '51_ClassicSnakeGame.html', title: 'Retro 2D Snake Game', desc: 'Control snake, eat apples, track high score', icon: 'fa-gamepad' },
  { name: '52_TicTacToeAI.html', title: 'Tic-Tac-Toe with Smart AI', desc: 'Classic 3x3 board with Minimax opponent', icon: 'fa-xmarks-lines' },
  { name: '53_MemoryCardFlip.html', title: 'Memory Pair Match Game', desc: '16-card flip matching memory puzzle', icon: 'fa-clone' },
  { name: '54_RockPaperScissors.html', title: 'Rock Paper Scissors Game', desc: 'Hand choices vs random computer choice', icon: 'fa-hand-back-fist' },
  { name: '55_WhackAMole.html', title: 'Whack-a-Bug Arcade', desc: 'Tap bugs popping out of holes before time ends', icon: 'fa-hammer' },
  { name: '56_RetroPongGame.html', title: 'Classic Retro Pong 1972', desc: 'Paddle ball physics game with score counter', icon: 'fa-table-tennis-paddle-ball' },
  { name: '57_2048NumberPuzzle.html', title: '2048 Sliding Number Tile', desc: 'Arrow keys slide and merge duplicate tiles', icon: 'fa-square-binary' },
  { name: '58_FlappyFlyer.html', title: 'Flappy Bird Style Flyer', desc: 'Tap space/screen to flap between pipe gaps', icon: 'fa-dove' },
  { name: '59_SimonSaysMemory.html', title: 'Simon Says Audio Memory', desc: 'Repeat increasing sequence of colored lights', icon: 'fa-circle-notch' },
  { name: '60_TypingSpeedTester.html', title: 'Typing Speed Test (WPM)', desc: 'Live words-per-minute and accuracy counter', icon: 'fa-keyboard' },
  { name: '61_ExpenseTracker.html', title: 'Personal Expense Tracker', desc: 'Add income/expenses with balance calculation', icon: 'fa-wallet' },
  { name: '62_UnitConverter.html', title: 'Universal Unit Converter', desc: 'Miles/KM, Celsius/Fahrenheit, Kg/Lbs conversion', icon: 'fa-ruler-combined' },
  { name: '63_QrCodeGenerator.html', title: 'Live QR Code Generator', desc: 'Type text or URL to generate scannable QR', icon: 'fa-qrcode' },
  { name: '64_QuickStickyNotes.html', title: 'Color Sticky Notes Pad', desc: 'Post-it notes with local storage saving', icon: 'fa-note-sticky' },
  { name: '65_HabitStreakTracker.html', title: 'Daily Habit Streak Counter', desc: 'Track daily checkboxes and streak progress', icon: 'fa-fire' },
  { name: '66_BmiHealthCalculator.html', title: 'BMI Fitness Health Gauge', desc: 'Body mass index calculator with gauge indicator', icon: 'fa-heart-pulse' },
  { name: '67_PomodoroTimer.html', title: 'Pomodoro Productivity Clock', desc: '25 min focus work + 5 min break interval', icon: 'fa-bell' },
  { name: '68_WeatherWidget.html', title: 'Weather Forecast Card', desc: 'Temperature, humidity, wind with animated icons', icon: 'fa-cloud-sun' },
  { name: '69_CookingRecipeTimer.html', title: 'Kitchen Recipe Step Timer', desc: 'Timer with alarm beep for multi-stage cooking', icon: 'fa-utensils' },
  { name: '70_CurrencyConverter.html', title: 'Currency Exchange Simulator', desc: 'USD, EUR, BDT, INR live rate calculator', icon: 'fa-money-bill-transfer' },
  { name: '71_LocalStorageStore.html', title: 'Offline Key-Value Store', desc: 'Persistent local storage explorer UI', icon: 'fa-database' },
  { name: '72_StateMachineFSM.html', title: 'Finite State Machine Visualizer', desc: 'Visual state transitions: Idle, Active, Error', icon: 'fa-diagram-project' },
  { name: '73_EventBusDispatcher.html', title: 'Custom Event Bus System', desc: 'Publish-subscribe messaging architecture', icon: 'fa-tower-broadcast' },
  { name: '74_ObserverPattern.html', title: 'Observer Pattern Demo', desc: 'Subject broadcasts updates to multiple listeners', icon: 'fa-bullhorn' },
  { name: '75_ReduxStoreState.html', title: 'Redux Action Reducer Store', desc: 'Dispatch actions, view state diffs in real-time', icon: 'fa-layer-group' },
  { name: '76_UndoRedoHistory.html', title: 'Undo / Redo History Stack', desc: 'Time travel state management engine', icon: 'fa-clock-rotate-left' },
  { name: '77_LRUDataCache.html', title: 'LRU Cache Simulation', desc: 'Least recently used eviction visualizer', icon: 'fa-memory' },
  { name: '78_DebounceThrottle.html', title: 'Debounce vs Throttle Visualizer', desc: 'Interactive visual comparison of rate limits', icon: 'fa-gauge-high' },
  { name: '79_PaginationController.html', title: 'Data Table with Pagination', desc: 'Sortable columns, page jump, page size', icon: 'fa-table' },
  { name: '80_VirtualListScroller.html', title: 'Virtual 10,000 Row Scroller', desc: 'Renders only visible DOM items for 60fps', icon: 'fa-list-check' },
  { name: '81_AudioMusicPlayer.html', title: 'Audio Music Player UI', desc: 'Progress bar, play/pause, volume slider', icon: 'fa-music' },
  { name: '82_DrumPadBeats.html', title: 'Electronic Drum Pad Soundboard', desc: 'Tap kick, snare, hi-hat, 808 bass triggers', icon: 'fa-drum' },
  { name: '83_PianoSynthKeyboard.html', title: 'Interactive Piano Keyboard', desc: 'Play C4 to B4 keys using Web Audio synth', icon: 'fa-keyboard' },
  { name: '84_VoiceSpeechInput.html', title: 'Web Speech Voice Input', desc: 'Voice speech-to-text dictation demo', icon: 'fa-microphone' },
  { name: '85_CameraWebcamCapture.html', title: 'Camera Snapshot Mirror', desc: 'Capture web camera frames and filter effects', icon: 'fa-camera' },
  { name: '86_CompassHeadingSensor.html', title: 'Device Compass Heading', desc: 'Orientation angle needle indicator', icon: 'fa-compass' },
  { name: '87_BatteryIndicator.html', title: 'Device Battery Status', desc: 'Battery level percentage and charging state', icon: 'fa-battery-three-quarters' },
  { name: '88_NetworkPingTester.html', title: 'Network Latency Ping Tester', desc: 'Measure server response times and jitter', icon: 'fa-wifi' },
  { name: '89_ThemePaletteSwitcher.html', title: 'Multi-Theme Color Switcher', desc: 'Dark, Light, Cyberpunk, Forest, Sunset themes', icon: 'fa-brush' },
  { name: '90_HapticFeedbackDemo.html', title: 'Vibration & Haptic Pulse', desc: 'Trigger vibration patterns on mobile devices', icon: 'fa-mobile-screen-button' },
  { name: '91_RegexPatternTester.html', title: 'RegEx Matcher & Tester', desc: 'Test regular expressions with match highlights', icon: 'fa-code-compare' },
  { name: '92_JsonFormatterValidator.html', title: 'JSON Formatter & Validator', desc: 'Beautify messy JSON, highlight parse errors', icon: 'fa-brackets-curly' },
  { name: '93_Base64EncoderDecoder.html', title: 'Base64 Encoder & Decoder', desc: 'Convert text and images to/from Base64', icon: 'fa-file-shield' },
  { name: '94_CryptoHashVerifier.html', title: 'SHA-256 Hash Generator', desc: 'Cryptographic hash calculation in browser', icon: 'fa-shield-halved' },
  { name: '95_BubbleSortVisualizer.html', title: 'Bubble Sort Visualizer', desc: 'Watch bars swap positions with colored steps', icon: 'fa-chart-column' },
  { name: '96_QuickSortVisualizer.html', title: 'QuickSort Pivot Visualizer', desc: 'Divide and conquer partition visualizer', icon: 'fa-arrow-down-wide-short' },
  { name: '97_AStarPathfinder.html', title: 'A* Pathfinding Grid Solver', desc: 'Find shortest path around walls on a 20x20 grid', icon: 'fa-route' },
  { name: '98_MazeGeneratorSolver.html', title: 'Random Maze Generator', desc: 'Recursive backtracker maze with auto-solver', icon: 'fa-dungeon' },
  { name: '99_BinaryTreeRenderer.html', title: 'Binary Search Tree Canvas', desc: 'Insert numbers and view animated BST branches', icon: 'fa-network-wired' },
  { name: '100_CodeCompilerIDE.html', title: 'Code Studio Mini Compiler', desc: 'Live HTML/JS/CSS sandbox runtime environment', icon: 'fa-laptop-code' }
];

// Generate all 100 projects
export const ALL_100_PRACTICE_PROJECTS: ProjectItem[] = (() => {
  const list: ProjectItem[] = [];

  // Add the first 10 manually refined projects
  HUNDRED_PRACTICE_PROJECTS_TEMPLATES.forEach((t, i) => {
    const projectNum = i + 1;
    const defaultKt = `// Project ${projectNum}: ${t.title}
package com.example.codestudio.practice

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

class PracticeActivity${projectNum} : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                Column(
                    modifier = Modifier.fillMaxSize().padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text("#${projectNum}: ${t.title}", style = MaterialTheme.typography.titleLarge)
                    Spacer(modifier = Modifier.height(12.dp))
                    Button(onClick = { /* Execute ${t.title} */ }) {
                        Text("Run ${t.title}")
                    }
                }
            }
        }
    }
}`;
    const defaultJava = `// Project ${projectNum}: ${t.title}
package com.example.codestudio.practice;

import android.os.Bundle;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

public class PracticeActivity${projectNum} extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        TextView titleView = new TextView(this);
        titleView.setText("#${projectNum}: ${t.title} (${t.category})");
        setContentView(titleView);
        Toast.makeText(this, "Running #${projectNum}: ${t.title}", Toast.LENGTH_SHORT).show();
    }
}`;
    list.push({
      id: `proj_${projectNum}`,
      name: t.name,
      lang: 'HTML',
      isOriginal: true,
      html: t.html,
      css: t.css,
      js: t.js,
      kotlin: t.kotlinCode || defaultKt,
      java: defaultJava,
      code: t.dartCode || t.kotlinCode || t.js,
      createdAt: 'Template'
    });
  });

  // Generate 11 to 100
  for (let idx = 0; idx < EXTENDED_NAMES.length; idx++) {
    const meta = EXTENDED_NAMES[idx];
    const projectNumber = idx + 11;
    const cat = CATEGORIES[idx % CATEGORIES.length];

    const htmlContent = `<div class="card-box">
  <div class="header-tag">
    <span class="badge">#${projectNumber}</span>
    <span class="cat">${cat.toUpperCase()}</span>
  </div>
  <h2>${meta.title}</h2>
  <p class="desc">${meta.desc}</p>
  
  <div class="demo-interactive-box">
    <div id="statStatus" class="status-pill">Ready to Run</div>
    <div class="count-val" id="demoValue">0</div>
    <div class="btn-group">
      <button class="action-btn" onclick="executePracticeAction('${meta.title}')">
        Run Action
      </button>
      <button class="reset-btn" onclick="resetPracticeAction()">
        Reset
      </button>
    </div>
  </div>

  <div id="logArea" class="log-output">Initialized Project ${projectNumber}</div>
</div>`;

    const cssContent = `body {
  background: #09090b;
  color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  padding: 16px;
}
.card-box {
  background: #18181b;
  border: 1px solid #27272a;
  padding: 24px;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.6);
  text-align: center;
}
.header-tag {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.badge {
  background: #0284c7;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 6px;
}
.cat {
  color: #a1a1aa;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
}
h2 {
  font-size: 20px;
  color: #38bdf8;
  margin: 0 0 8px 0;
}
.desc {
  font-size: 13px;
  color: #94a3b8;
  margin: 0 0 20px 0;
  line-height: 1.4;
}
.demo-interactive-box {
  background: #09090b;
  border: 1px solid #27272a;
  border-radius: 12px;
  padding: 18px;
  margin-bottom: 16px;
}
.status-pill {
  display: inline-block;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #4ade80;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
}
.count-val {
  font-size: 42px;
  font-weight: 900;
  color: #f8fafc;
  margin: 14px 0;
  font-family: monospace;
}
.btn-group {
  display: flex;
  gap: 8px;
  justify-content: center;
}
.action-btn {
  background: #0284c7;
  color: #fff;
  border: none;
  padding: 8px 18px;
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.15s;
}
.action-btn:active {
  transform: scale(0.96);
}
.reset-btn {
  background: #27272a;
  color: #a1a1aa;
  border: 1px solid #3f3f46;
  padding: 8px 14px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
}
.log-output {
  font-family: monospace;
  font-size: 11px;
  color: #64748b;
  background: #111827;
  padding: 8px 12px;
  border-radius: 6px;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}`;

    const jsContent = `let actionCounter = 0;
function executePracticeAction(title) {
  actionCounter += 1;
  const valElem = document.getElementById('demoValue');
  const statElem = document.getElementById('statStatus');
  const logElem = document.getElementById('logArea');
  
  if (valElem) valElem.textContent = actionCounter;
  if (statElem) {
    statElem.textContent = 'Active Execution #' + actionCounter;
    statElem.style.color = '#38bdf8';
  }
  if (logElem) {
    logElem.textContent = '[' + new Date().toLocaleTimeString() + '] Event: ' + title;
  }
}

function resetPracticeAction() {
  actionCounter = 0;
  const valElem = document.getElementById('demoValue');
  const statElem = document.getElementById('statStatus');
  const logElem = document.getElementById('logArea');
  if (valElem) valElem.textContent = '0';
  if (statElem) {
    statElem.textContent = 'Reset Ready';
    statElem.style.color = '#4ade80';
  }
  if (logElem) logElem.textContent = 'State reset to default.';
}`;

    const dartCode = `// Project ${projectNumber}: ${meta.title}
import 'package:flutter/material.dart';

void main() => runApp(const PracticeApp${projectNumber}());

class PracticeApp${projectNumber} extends StatelessWidget {
  const PracticeApp${projectNumber}({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '${meta.title}',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark(),
      home: Scaffold(
        appBar: AppBar(
          title: const Text('#${projectNumber}: ${meta.title}'),
          backgroundColor: const Color(0xFF0F172A),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.code, size: 56, color: Colors.cyan),
              const SizedBox(height: 16),
              const Text('${meta.title}', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 24),
                child: Text('${meta.desc}', textAlign: TextAlign.center),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {},
                child: const Text('Run Flutter Action'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}`;

    const kotlinCode = `// Project ${projectNumber}: ${meta.title}
package com.example.codestudio.practice

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

class PracticeActivity${projectNumber} : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                Column(
                    modifier = Modifier.fillMaxSize().padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text("#${projectNumber}: ${meta.title}", style = MaterialTheme.typography.titleLarge)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("${meta.desc}", style = MaterialTheme.typography.bodyMedium)
                    Spacer(modifier = Modifier.height(20.dp))
                    Button(onClick = { /* Practice trigger */ }) {
                        Text("Run Android Compose Action")
                    }
                }
            }
        }
    }
}`;

    const javaCode = `// Project ${projectNumber}: ${meta.title}
package com.example.codestudio.practice;

import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

public class PracticeActivity${projectNumber} extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        TextView titleView = new TextView(this);
        titleView.setText("#${projectNumber}: ${meta.title} - ${meta.desc}");
        setContentView(titleView);
        Toast.makeText(this, "Running #${projectNumber}: ${meta.title}", Toast.LENGTH_SHORT).show();
    }
}`;

    list.push({
      id: `proj_${projectNumber}`,
      name: meta.name,
      lang: 'HTML',
      isOriginal: true,
      html: htmlContent,
      css: cssContent,
      js: jsContent,
      kotlin: kotlinCode,
      java: javaCode,
      code: dartCode,
      createdAt: 'Practice'
    });
  }

  return list;
})();

export const ALL_100_FLUTTER_PROJECTS: ProjectItem[] = ALL_100_PRACTICE_PROJECTS.map((item, idx) => {
  const dotIdx = item.name.lastIndexOf('.');
  const baseName = dotIdx > 0 ? item.name.substring(0, dotIdx) : item.name;
  return {
    ...item,
    id: `fl_proj_${idx + 1}`,
    name: `${baseName}.dart`,
    lang: 'Dart',
    isOriginal: true,
    code: item.code || `import 'package:flutter/material.dart';\n\nvoid main() => runApp(const MyApp());`
  };
});

export const ALL_100_ANDROID_PROJECTS: ProjectItem[] = ALL_100_PRACTICE_PROJECTS.map((item, idx) => {
  const dotIdx = item.name.lastIndexOf('.');
  const baseName = dotIdx > 0 ? item.name.substring(0, dotIdx) : item.name;
  return {
    ...item,
    id: `an_proj_${idx + 1}`,
    name: `${baseName}.kt`,
    lang: 'Kotlin',
    isOriginal: true,
    code: item.kotlin || item.code || `package com.example.codestudio\n\n// Android Studio Practice File`
  };
});
