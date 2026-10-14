export interface ProjectFile {
  id: string;
  name: string;
  lang?: string;
  content: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  lang: 'HTML' | 'Kotlin' | 'Dart' | 'Java' | 'Project' | string;
  html: string;
  css: string;
  js: string;
  code?: string;
  kotlin?: string;
  java?: string;
  createdAt: string;
  isOriginal?: boolean;
  isProject?: boolean;
  files?: ProjectFile[];
}

export const isOriginalProject = (proj: ProjectItem | null | undefined): boolean => {
  if (!proj) return false;
  if (proj.isOriginal === true) return true;
  if (proj.isOriginal === false) return false;
  // Original templates have IDs like proj_1..proj_100, an_proj_1..an_proj_100, fl_proj_1..fl_proj_100
  if (/^(proj|an_proj|fl_proj)_\d+$/.test(proj.id)) return true;
  return false;
};

export const isOriginalTutorial = (tut: TutorialItem | null | undefined): boolean => {
  if (!tut) return false;
  return /^(tut_\d+|tut_(html|kt|java|dart|swift)_\d+|an_tut_\d+|fl_tut_\d+)$/.test(tut.id);
};

export const isOriginalBlock = (block: { id: string } | null | undefined): boolean => {
  if (!block) return false;
  return /^blk_(ui|logic|style|state)_\d+$/.test(block.id);
};

export interface TutorialItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  lang: 'HTML' | 'CSS' | 'JavaScript' | 'Kotlin' | 'Java' | 'Dart' | 'Swift' | string;
  html: string;
  css: string;
  js: string;
}

export const DEFAULT_PRACTICE_PROJECTS: ProjectItem[] = [
  {
    id: 'proj_1',
    name: '1_Welcome.html',
    lang: 'HTML',
    isOriginal: true,
    html: `<div class="welcome-box">
  <div class="badge">CODE STUDIO PRO</div>
  <h1>Welcome to Code Studio Pro!</h1>
  <p>Learn mobile and web coding step by step with live preview and interactive blocks.</p>
  <button id="greetBtn" onclick="greetUser()">Get Started</button>
</div>`,
    css: `.welcome-box {
  text-align: center;
  padding: 32px 24px;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  margin: 20px auto;
  max-width: 460px;
  border: 1px solid #334155;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.badge {
  display: inline-block;
  background: #0284c7;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 14px;
  letter-spacing: 1px;
}
h1 {
  color: #38bdf8;
  font-size: 24px;
  margin: 0 0 10px 0;
}
p {
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 24px;
}
button {
  background: linear-gradient(45deg, #0284c7, #0ea5e9);
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(14, 165, 233, 0.4);
  transition: all 0.2s ease;
}
button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(14, 165, 233, 0.6);
}
button:active {
  transform: translateY(1px);
}`,
    js: `function greetUser() {
  alert('Welcome to Mobile Coding Practice! Enjoy experimenting and building your apps.');
}`,
    createdAt: 'Default',
  },
  {
    id: 'proj_2',
    name: '2_Interactive.html',
    lang: 'HTML',
    html: `<div class="interactive-card">
  <h2>Interactive Theme Card</h2>
  <p id="statusText">Current theme: Emerald Green</p>
  <div class="color-preview" id="colorBox"></div>
  <button onclick="toggleTheme()">Change Mood & Color</button>
</div>`,
    css: `.interactive-card {
  padding: 28px;
  background: #18181b;
  border: 2px solid #10b981;
  border-radius: 16px;
  color: #fafafa;
  text-align: center;
  max-width: 400px;
  margin: 20px auto;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: border-color 0.3s ease;
}
h2 {
  margin: 0 0 8px 0;
  font-size: 22px;
}
#statusText {
  color: #a1a1aa;
  font-size: 14px;
  margin-bottom: 18px;
}
.color-preview {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #10b981;
  margin: 0 auto 20px auto;
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
  transition: all 0.3s ease;
}
button {
  background: #27272a;
  color: #fff;
  border: 1px solid #3f3f46;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}
button:hover {
  background: #3f3f46;
}`,
    js: `const themes = [
  { name: 'Emerald Green', color: '#10b981' },
  { name: 'Electric Indigo', color: '#6366f1' },
  { name: 'Warm Amber', color: '#f59e0b' },
  { name: 'Vibrant Rose', color: '#f43f5e' },
  { name: 'Cyber Cyan', color: '#06b6d4' }
];
let currentIndex = 0;

function toggleTheme() {
  currentIndex = (currentIndex + 1) % themes.length;
  const current = themes[currentIndex];
  document.querySelector('.interactive-card').style.borderColor = current.color;
  document.getElementById('colorBox').style.backgroundColor = current.color;
  document.getElementById('colorBox').style.boxShadow = '0 0 20px ' + current.color;
  document.getElementById('statusText').innerText = 'Current theme: ' + current.name;
}`,
    createdAt: 'Default',
  },
  {
    id: 'proj_3',
    name: '3_Counter.html',
    lang: 'HTML',
    html: `<div class="counter-container">
  <h2>Simple Click Counter</h2>
  <div id="counterValue">0</div>
  <div class="btn-group">
    <button class="btn-step" onclick="decrement()">- 1</button>
    <button class="btn-reset" onclick="resetCounter()">Reset</button>
    <button class="btn-step" onclick="increment()">+ 1</button>
  </div>
</div>`,
    css: `.counter-container {
  text-align: center;
  padding: 30px;
  background: #18181b;
  color: #f4f4f5;
  border-radius: 16px;
  max-width: 380px;
  margin: 20px auto;
  border: 1px solid #27272a;
  box-shadow: 0 10px 25px rgba(0,0,0,0.4);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
h2 {
  font-size: 20px;
  color: #e4e4e7;
  margin: 0;
}
#counterValue {
  font-size: 64px;
  font-weight: 800;
  color: #fbbf24;
  margin: 18px 0;
  text-shadow: 0 0 15px rgba(251, 191, 36, 0.3);
}
.btn-group {
  display: flex;
  justify-content: center;
  gap: 10px;
}
button {
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid #3f3f46;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: 0.15s;
}
.btn-step {
  background: #27272a;
  color: #fff;
}
.btn-step:hover {
  background: #3f3f46;
}
.btn-reset {
  background: #dc2626;
  color: #fff;
  border-color: #b91c1c;
}
.btn-reset:hover {
  background: #b91c1c;
}`,
    js: `let count = 0;
function increment() {
  count++;
  document.getElementById('counterValue').innerText = count;
}
function decrement() {
  count--;
  document.getElementById('counterValue').innerText = count;
}
function resetCounter() {
  count = 0;
  document.getElementById('counterValue').innerText = count;
}`,
    createdAt: 'Default',
  },
  {
    id: 'proj_4',
    name: '4_TodoList.html',
    lang: 'HTML',
    html: `<div class="todo-card">
  <h2>Task Master</h2>
  <div class="todo-input-row">
    <input type="text" id="taskInput" placeholder="Add a new task..." />
    <button onclick="addTask()">Add</button>
  </div>
  <ul id="taskList">
    <li class="completed" onclick="toggleTask(this)">
      <span class="task-text">✓ Learn HTML & CSS</span>
      <button class="del-btn" onclick="deleteTask(event, this)">×</button>
    </li>
    <li onclick="toggleTask(this)">
      <span class="task-text">Build Mobile App in Studio</span>
      <button class="del-btn" onclick="deleteTask(event, this)">×</button>
    </li>
    <li onclick="toggleTask(this)">
      <span class="task-text">Practice JavaScript Functions</span>
      <button class="del-btn" onclick="deleteTask(event, this)">×</button>
    </li>
  </ul>
  <div class="todo-footer">
    <span id="taskCount">2 tasks remaining</span>
  </div>
</div>`,
    css: `.todo-card {
  padding: 24px;
  background: #1e1e24;
  border-radius: 16px;
  max-width: 420px;
  margin: 20px auto;
  color: #fff;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  border: 1px solid #2d2d38;
}
h2 {
  margin: 0 0 16px 0;
  font-size: 22px;
  color: #60a5fa;
  text-align: center;
}
.todo-input-row {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.todo-input-row input {
  flex: 1;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #3f3f4e;
  background: #141418;
  color: #fff;
  font-size: 14px;
  outline: none;
}
.todo-input-row button {
  background: #2563eb;
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #282834;
  padding: 10px 14px;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: 0.2s;
}
li:hover {
  background: #323242;
}
li.completed .task-text {
  text-decoration: line-through;
  color: #9ca3af;
}
.del-btn {
  background: transparent;
  border: none;
  color: #ef4444;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
}
.todo-footer {
  margin-top: 14px;
  text-align: right;
  font-size: 12px;
  color: #9ca3af;
}`,
    js: `function updateCount() {
  const all = document.querySelectorAll('#taskList li');
  const done = document.querySelectorAll('#taskList li.completed');
  const remaining = all.length - done.length;
  document.getElementById('taskCount').innerText = remaining + ' tasks remaining';
}

function toggleTask(li) {
  li.classList.toggle('completed');
  updateCount();
}

function deleteTask(e, btn) {
  e.stopPropagation();
  btn.closest('li').remove();
  updateCount();
}

function addTask() {
  const input = document.getElementById('taskInput');
  const text = input.value.trim();
  if (!text) return;
  const ul = document.getElementById('taskList');
  const li = document.createElement('li');
  li.onclick = function() { toggleTask(this); };
  li.innerHTML = '<span class="task-text">' + text + '</span><button class="del-btn" onclick="deleteTask(event, this)">×</button>';
  ul.appendChild(li);
  input.value = '';
  updateCount();
}`,
    createdAt: 'Default',
  },
  {
    id: 'proj_5',
    name: '5_DigitalClock.html',
    lang: 'HTML',
    html: `<div class="clock-card">
  <div class="clock-label">NEON DIGITAL CLOCK</div>
  <div class="time-display">
    <span id="hours">12</span>:<span id="minutes">00</span>:<span id="seconds">00</span>
    <span id="ampm" class="ampm-tag">PM</span>
  </div>
  <div class="date-display" id="dateText">Monday, September 17, 2026</div>
</div>`,
    css: `.clock-card {
  text-align: center;
  padding: 34px 20px;
  background: #09090b;
  border-radius: 18px;
  border: 1px solid #27272a;
  max-width: 440px;
  margin: 20px auto;
  box-shadow: 0 10px 30px rgba(0,0,0,0.6);
  font-family: 'Courier New', Courier, monospace;
}
.clock-label {
  font-size: 12px;
  letter-spacing: 2px;
  color: #10b981;
  margin-bottom: 14px;
}
.time-display {
  font-size: 48px;
  font-weight: 800;
  color: #34d399;
  text-shadow: 0 0 20px rgba(52, 211, 153, 0.4);
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}
.ampm-tag {
  font-size: 18px;
  color: #059669;
  margin-left: 8px;
}
.date-display {
  margin-top: 18px;
  font-size: 14px;
  color: #9ca3af;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}`,
    js: `function updateClock() {
  const now = new Date();
  let h = now.getHours();
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  document.getElementById('hours').innerText = String(h).padStart(2, '0');
  document.getElementById('minutes').innerText = m;
  document.getElementById('seconds').innerText = s;
  document.getElementById('ampm').innerText = ampm;

  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('dateText').innerText = now.toLocaleDateString(undefined, options);
}
setInterval(updateClock, 1000);
updateClock();`,
    createdAt: 'Default',
  },
  {
    id: 'proj_6',
    name: '6_Calculator.html',
    lang: 'HTML',
    html: `<div class="calc-box">
  <input type="text" id="calcDisplay" readonly value="0" />
  <div class="calc-grid">
    <button class="btn-util" onclick="clearCalc()">C</button>
    <button class="btn-util" onclick="deleteChar()">⌫</button>
    <button class="btn-op" onclick="appendOp('/')">÷</button>
    <button class="btn-op" onclick="appendOp('*')">×</button>

    <button onclick="appendNum('7')">7</button>
    <button onclick="appendNum('8')">8</button>
    <button onclick="appendNum('9')">9</button>
    <button class="btn-op" onclick="appendOp('-')">-</button>

    <button onclick="appendNum('4')">4</button>
    <button onclick="appendNum('5')">5</button>
    <button onclick="appendNum('6')">6</button>
    <button class="btn-op" onclick="appendOp('+')">+</button>

    <button onclick="appendNum('1')">1</button>
    <button onclick="appendNum('2')">2</button>
    <button onclick="appendNum('3')">3</button>
    <button class="btn-equal" onclick="calcResult()">=</button>

    <button class="btn-zero" onclick="appendNum('0')">0</button>
    <button onclick="appendNum('.')">.</button>
  </div>
</div>`,
    css: `.calc-box {
  width: 320px;
  background: #1e1e24;
  padding: 20px;
  border-radius: 18px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  margin: 20px auto;
  border: 1px solid #2e2e3a;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}
#calcDisplay {
  width: 100%;
  height: 54px;
  background: #111116;
  border: 1px solid #333342;
  border-radius: 10px;
  color: #38bdf8;
  font-size: 26px;
  text-align: right;
  padding: 8px 14px;
  box-sizing: border-box;
  margin-bottom: 16px;
  outline: none;
  font-family: monospace;
}
.calc-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
button {
  height: 48px;
  background: #2a2a36;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.1s;
}
button:active {
  transform: scale(0.95);
}
.btn-op {
  background: #3b82f6;
  color: #fff;
}
.btn-util {
  background: #475569;
}
.btn-equal {
  background: #10b981;
  grid-row: span 2;
  height: 106px;
}
.btn-zero {
  grid-column: span 2;
}`,
    js: `let currentInput = '0';

function updateDisplay() {
  document.getElementById('calcDisplay').value = currentInput;
}

function appendNum(n) {
  if (currentInput === '0' && n !== '.') currentInput = n;
  else currentInput += n;
  updateDisplay();
}

function appendOp(op) {
  currentInput += ' ' + op + ' ';
  updateDisplay();
}

function clearCalc() {
  currentInput = '0';
  updateDisplay();
}

function deleteChar() {
  currentInput = currentInput.trimEnd();
  currentInput = currentInput.slice(0, -1);
  if (!currentInput) currentInput = '0';
  updateDisplay();
}

function calcResult() {
  try {
    currentInput = String(eval(currentInput));
  } catch (err) {
    currentInput = 'Error';
  }
  updateDisplay();
}`,
    createdAt: 'Default',
  },
  {
    id: 'proj_7',
    name: '7_QuizGame.html',
    lang: 'HTML',
    html: `<div class="quiz-card">
  <div class="quiz-badge">WEB DEV QUIZ</div>
  <h3 id="questionText">Which HTML tag is used to link an external CSS file?</h3>
  <div class="options-group" id="optionsGroup">
    <button onclick="checkAnswer(this, false)">&lt;style src="..."&gt;</button>
    <button onclick="checkAnswer(this, true)">&lt;link rel="stylesheet" href="..."&gt;</button>
    <button onclick="checkAnswer(this, false)">&lt;script href="..."&gt;</button>
    <button onclick="checkAnswer(this, false)">&lt;css link="..."&gt;</button>
  </div>
  <p id="quizFeedback" class="feedback-text"></p>
  <div class="score-row">Score: <span id="scoreVal">0</span></div>
</div>`,
    css: `.quiz-card {
  max-width: 440px;
  background: #18181b;
  padding: 24px;
  border-radius: 16px;
  margin: 20px auto;
  color: #fff;
  border: 1px solid #27272a;
  box-shadow: 0 10px 25px rgba(0,0,0,0.4);
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  text-align: center;
}
.quiz-badge {
  background: #8b5cf6;
  display: inline-block;
  font-size: 11px;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 12px;
}
h3 {
  font-size: 18px;
  color: #f4f4f5;
  margin: 0 0 18px 0;
  line-height: 1.4;
}
.options-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
button {
  background: #27272a;
  color: #e4e4e7;
  border: 1px solid #3f3f46;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
  text-align: left;
}
button:hover {
  background: #3f3f46;
}
button.correct {
  background: #059669 !important;
  border-color: #10b981 !important;
  color: #fff;
}
button.wrong {
  background: #dc2626 !important;
  border-color: #ef4444 !important;
  color: #fff;
}
.feedback-text {
  margin-top: 14px;
  font-size: 14px;
  font-weight: 600;
  min-height: 20px;
}
.score-row {
  margin-top: 12px;
  font-size: 14px;
  color: #a1a1aa;
}`,
    js: `let score = 0;
let answered = false;

function checkAnswer(btn, isCorrect) {
  if (answered) return;
  answered = true;
  const feedback = document.getElementById('quizFeedback');
  if (isCorrect) {
    btn.classList.add('correct');
    feedback.innerText = '🎉 Correct! <link rel="stylesheet"> is standard.';
    feedback.style.color = '#34d399';
    score += 10;
    document.getElementById('scoreVal').innerText = score;
  } else {
    btn.classList.add('wrong');
    feedback.innerText = '❌ Incorrect. Try reviewing HTML heads!';
    feedback.style.color = '#f87171';
  }
}`,
    createdAt: 'Default',
  },
  {
    id: 'proj_8',
    name: '8_ColorPalette.html',
    lang: 'HTML',
    html: `<div class="palette-card">
  <h2>Hex Palette Generator</h2>
  <p>Click any color swatch to copy its HEX code!</p>
  <div class="swatches-row" id="paletteGrid"></div>
  <button class="gen-btn" onclick="generatePalette()">🎲 Generate New Palette</button>
  <div id="copyAlert" class="copy-toast"></div>
</div>`,
    css: `.palette-card {
  max-width: 440px;
  background: #1e1e24;
  padding: 24px;
  border-radius: 16px;
  margin: 20px auto;
  color: #fff;
  border: 1px solid #2e2e38;
  box-shadow: 0 10px 25px rgba(0,0,0,0.4);
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}
h2 {
  margin: 0 0 6px 0;
  color: #a78bfa;
}
p {
  color: #94a3b8;
  font-size: 13px;
  margin: 0 0 20px 0;
}
.swatches-row {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 20px;
}
.swatch {
  flex: 1;
  height: 90px;
  border-radius: 10px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 6px;
  font-size: 11px;
  font-weight: bold;
  color: #fff;
  cursor: pointer;
  text-shadow: 0 1px 4px rgba(0,0,0,0.8);
  transition: transform 0.2s;
}
.swatch:hover {
  transform: translateY(-4px);
}
.gen-btn {
  background: #7c3aed;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}
.copy-toast {
  margin-top: 12px;
  font-size: 13px;
  color: #34d399;
  min-height: 18px;
}`,
    js: `function randomHex() {
  return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
}

function generatePalette() {
  const grid = document.getElementById('paletteGrid');
  grid.innerHTML = '';
  for (let i = 0; i < 4; i++) {
    const hex = randomHex();
    const div = document.createElement('div');
    div.className = 'swatch';
    div.style.backgroundColor = hex;
    div.innerText = hex.toUpperCase();
    div.onclick = function() {
      navigator.clipboard.writeText(hex);
      const toast = document.getElementById('copyAlert');
      toast.innerText = 'Copied ' + hex + ' to clipboard!';
      setTimeout(() => { toast.innerText = ''; }, 2000);
    };
    grid.appendChild(div);
  }
}
generatePalette();`,
    createdAt: 'Default',
  },
  {
    id: 'proj_9',
    name: '9_WeatherCard.html',
    lang: 'HTML',
    html: `<div class="weather-widget">
  <div class="city-name">San Francisco, CA</div>
  <div class="weather-icon">⛅</div>
  <div class="temp-row">
    <span id="tempVal">21</span><span class="unit">°C</span>
  </div>
  <div class="condition-text" id="condText">Partly Cloudy</div>
  <div class="weather-stats">
    <div>Humidity: <strong>68%</strong></div>
    <div>Wind: <strong>14 km/h</strong></div>
  </div>
  <button class="toggle-btn" onclick="toggleUnit()">Switch °C / °F</button>
</div>`,
    css: `.weather-widget {
  max-width: 380px;
  background: linear-gradient(135deg, #0284c7, #0369a1);
  padding: 28px 20px;
  border-radius: 20px;
  margin: 20px auto;
  color: #fff;
  text-align: center;
  box-shadow: 0 10px 30px rgba(2, 132, 199, 0.4);
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}
.city-name {
  font-size: 18px;
  font-weight: 600;
  opacity: 0.9;
}
.weather-icon {
  font-size: 56px;
  margin: 10px 0;
  filter: drop-shadow(0 4px 10px rgba(0,0,0,0.2));
}
.temp-row {
  font-size: 52px;
  font-weight: 800;
  line-height: 1;
}
.unit {
  font-size: 24px;
  font-weight: 500;
}
.condition-text {
  font-size: 15px;
  margin: 8px 0 18px 0;
  opacity: 0.9;
}
.weather-stats {
  display: flex;
  justify-content: space-around;
  background: rgba(255,255,255,0.15);
  padding: 10px;
  border-radius: 10px;
  margin-bottom: 16px;
  font-size: 13px;
}
.toggle-btn {
  background: rgba(0,0,0,0.25);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.3);
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
}`,
    js: `let isCelsius = true;
let celsiusTemp = 21;

function toggleUnit() {
  isCelsius = !isCelsius;
  const tempEl = document.getElementById('tempVal');
  const unitEl = document.querySelector('.unit');
  if (isCelsius) {
    tempEl.innerText = celsiusTemp;
    unitEl.innerText = '°C';
  } else {
    const fahrenheit = Math.round((celsiusTemp * 9/5) + 32);
    tempEl.innerText = fahrenheit;
    unitEl.innerText = '°F';
  }
}`,
    createdAt: 'Default',
  },
  {
    id: 'proj_10',
    name: '10_MusicPlayer.html',
    lang: 'HTML',
    html: `<div class="music-card">
  <div class="vinyl-disk" id="disk">
    <div class="inner-dot">🎵</div>
  </div>
  <h3 class="track-title">Cyber City Waves</h3>
  <div class="track-artist">Neon Sound System</div>
  <div class="equalizer" id="equalizer">
    <div class="bar"></div>
    <div class="bar"></div>
    <div class="bar"></div>
    <div class="bar"></div>
    <div class="bar"></div>
  </div>
  <div class="progress-bar-wrap">
    <div class="progress-fill" id="progressFill"></div>
  </div>
  <div class="controls-row">
    <button onclick="rewindTrack()">⏮</button>
    <button class="play-btn" id="playBtn" onclick="togglePlay()">▶</button>
    <button onclick="forwardTrack()">⏭</button>
  </div>
</div>`,
    css: `.music-card {
  max-width: 380px;
  background: #121214;
  border: 1px solid #27272a;
  padding: 26px 20px;
  border-radius: 20px;
  margin: 20px auto;
  color: #fff;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.6);
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}
.vinyl-disk {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: radial-gradient(circle, #27272a 20%, #09090b 60%, #18181b 90%);
  border: 4px solid #3f3f46;
  margin: 0 auto 16px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.5);
  transition: transform 0.5s linear;
}
.vinyl-disk.spinning {
  animation: spin 3s linear infinite;
}
@keyframes spin {
  100% { transform: rotate(360deg); }
}
.inner-dot {
  font-size: 24px;
}
.track-title {
  margin: 0;
  font-size: 18px;
  color: #f43f5e;
}
.track-artist {
  font-size: 13px;
  color: #a1a1aa;
  margin-top: 4px;
}
.equalizer {
  display: flex;
  justify-content: center;
  gap: 5px;
  height: 24px;
  align-items: flex-end;
  margin: 16px 0;
}
.bar {
  width: 5px;
  height: 6px;
  background: #f43f5e;
  border-radius: 2px;
}
.playing .bar {
  animation: bounce 0.6s ease-in-out infinite alternate;
}
.playing .bar:nth-child(2) { animation-delay: 0.15s; }
.playing .bar:nth-child(3) { animation-delay: 0.3s; }
.playing .bar:nth-child(4) { animation-delay: 0.45s; }
@keyframes bounce {
  0% { height: 6px; }
  100% { height: 24px; }
}
.progress-bar-wrap {
  width: 100%;
  height: 6px;
  background: #27272a;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 20px;
}
.progress-fill {
  width: 35%;
  height: 100%;
  background: #f43f5e;
  transition: width 0.2s;
}
.controls-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}
.controls-row button {
  background: #27272a;
  color: #fff;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
}
.controls-row .play-btn {
  background: #f43f5e;
  width: 54px;
  height: 54px;
  font-size: 20px;
  box-shadow: 0 4px 15px rgba(244, 63, 94, 0.4);
}`,
    js: `let isPlaying = false;
let progress = 35;

function togglePlay() {
  isPlaying = !isPlaying;
  const disk = document.getElementById('disk');
  const eq = document.getElementById('equalizer');
  const btn = document.getElementById('playBtn');
  if (isPlaying) {
    disk.classList.add('spinning');
    eq.classList.add('playing');
    btn.innerText = '⏸';
  } else {
    disk.classList.remove('spinning');
    eq.classList.remove('playing');
    btn.innerText = '▶';
  }
}

function forwardTrack() {
  progress = Math.min(100, progress + 15);
  document.getElementById('progressFill').style.width = progress + '%';
}

function rewindTrack() {
  progress = Math.max(0, progress - 15);
  document.getElementById('progressFill').style.width = progress + '%';
}`,
    createdAt: 'Default',
  },
];

export const DEFAULT_TUTORIALS: TutorialItem[] = [
  {
    id: 'tut_1',
    title: 'Custom Button',
    description: 'Create a beautiful styled button with interactive hover & tap states.',
    icon: 'fa-book-open',
    lang: 'HTML',
    html: `<div style="text-align:center; padding: 40px;">\n  <button class="neon-btn">CLICK ME</button>\n</div>`,
    css: `.neon-btn {\n  background: linear-gradient(45deg, #007AFF, #00c6ff);\n  color: white;\n  font-size: 16px;\n  font-weight: 700;\n  padding: 14px 32px;\n  border: none;\n  border-radius: 30px;\n  cursor: pointer;\n  box-shadow: 0 4px 15px rgba(0, 122, 255, 0.4);\n  transition: all 0.3s ease;\n}\n.neon-btn:hover {\n  transform: translateY(-3px);\n  box-shadow: 0 8px 25px rgba(0, 122, 255, 0.6);\n}\n.neon-btn:active {\n  transform: translateY(1px);\n}`,
    js: `document.querySelector('.neon-btn').addEventListener('click', () => {\n  alert('Neon Button Clicked!');\n});`,
  },
  {
    id: 'tut_2',
    title: 'Custom Line (Divider)',
    description: 'A stylish horizontal line instead of default hr with a center glowing icon.',
    icon: 'fa-book-open',
    lang: 'CSS',
    html: `<div style="padding: 30px; max-width: 450px; margin: auto;">\n  <h3>Section One</h3>\n  <p>Content before the custom divider.</p>\n  <div class="custom-divider">\n    <span>★</span>\n  </div>\n  <h3>Section Two</h3>\n  <p>Content after the stylish divider.</p>\n</div>`,
    css: `.custom-divider {\n  display: flex;\n  align-items: center;\n  text-align: center;\n  margin: 30px 0;\n}\n.custom-divider::before,\n.custom-divider::after {\n  content: '';\n  flex: 1;\n  border-bottom: 2px solid #38bdf8;\n}\n.custom-divider span {\n  padding: 0 15px;\n  color: #38bdf8;\n  font-size: 18px;\n}`,
    js: `// No JavaScript needed for CSS divider`,
  },
  {
    id: 'tut_3',
    title: 'Scrolling Text',
    description: 'Classic marquee scrolling text effect for news tickers and announcements.',
    icon: 'fa-book-open',
    lang: 'CSS',
    html: `<div class="marquee-box">\n  <div class="marquee-text">\n    🔥 Breaking News: Build real Android and Flutter apps directly on your mobile IDE! 🚀\n  </div>\n</div>`,
    css: `.marquee-box {\n  width: 100%;\n  overflow: hidden;\n  background: #18181b;\n  border: 1px solid #27272a;\n  border-radius: 8px;\n  padding: 12px 0;\n  box-sizing: border-box;\n}\n.marquee-text {\n  display: inline-block;\n  white-space: nowrap;\n  font-size: 16px;\n  font-weight: 600;\n  color: #38bdf8;\n  animation: marquee 12s linear infinite;\n}\n@keyframes marquee {\n  0% { transform: translateX(100%); }\n  100% { transform: translateX(-100%); }\n}`,
    js: `// Pure CSS Marquee Animation`,
  },
  {
    id: 'tut_4',
    title: 'Background Color Box',
    description: 'Apply background colors and padding to a card with smooth gradients.',
    icon: 'fa-book-open',
    lang: 'CSS',
    html: `<div class="glass-card">\n  <h2>Glassmorphism Box</h2>\n  <p>Modern gradient backdrop with soft borders.</p>\n</div>`,
    css: `.glass-card {\n  background: rgba(255, 255, 255, 0.05);\n  backdrop-filter: blur(10px);\n  border: 1px solid rgba(255, 255, 255, 0.15);\n  padding: 25px;\n  border-radius: 16px;\n  text-align: center;\n  color: white;\n  max-width: 380px;\n  margin: 30px auto;\n}`,
    js: ``,
  },
  {
    id: 'tut_5',
    title: 'Scrolling Image',
    description: 'Moving images horizontally across the screen with infinite loop.',
    icon: 'fa-book-open',
    lang: 'CSS',
    html: `<div class="image-stream-wrapper">\n  <div class="image-stream">\n    <div class="stream-pill">🌟 Item 1</div>\n    <div class="stream-pill">🚀 Item 2</div>\n    <div class="stream-pill">⚡ Item 3</div>\n    <div class="stream-pill">💎 Item 4</div>\n    <div class="stream-pill">🔥 Item 5</div>\n  </div>\n</div>`,
    css: `.image-stream-wrapper {\n  overflow: hidden;\n  background: #09090b;\n  padding: 15px 0;\n}\n.image-stream {\n  display: flex;\n  gap: 15px;\n  animation: scrollStream 10s linear infinite;\n}\n.stream-pill {\n  background: #27272a;\n  color: #fff;\n  padding: 12px 24px;\n  border-radius: 10px;\n  font-weight: bold;\n  flex-shrink: 0;\n}\n@keyframes scrollStream {\n  0% { transform: translateX(0); }\n  100% { transform: translateX(-50%); }\n}`,
    js: ``,
  },
  {
    id: 'tut_6',
    title: 'Sliding Images',
    description: 'A scrollable horizontal row of images with snap scrolling.',
    icon: 'fa-book-open',
    lang: 'CSS',
    html: `<div class="slide-carousel">\n  <div class="slide-card card-blue">Card 1</div>\n  <div class="slide-card card-purple">Card 2</div>\n  <div class="slide-card card-emerald">Card 3</div>\n  <div class="slide-card card-amber">Card 4</div>\n</div>`,
    css: `.slide-carousel {\n  display: flex;\n  gap: 12px;\n  overflow-x: auto;\n  scroll-snap-type: x mandatory;\n  padding: 15px;\n}\n.slide-card {\n  min-width: 200px;\n  height: 120px;\n  border-radius: 12px;\n  scroll-snap-align: center;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-weight: bold;\n  color: white;\n}\n.card-blue { background: #0284c7; }\n.card-purple { background: #7c3aed; }\n.card-emerald { background: #059669; }\n.card-amber { background: #d97706; }`,
    js: ``,
  },
  {
    id: 'tut_7',
    title: 'Dynamic Text Size',
    description: 'Responsive fluid text sizing using CSS clamp for seamless device scaling.',
    icon: 'fa-book-open',
    lang: 'CSS',
    html: `<div style="text-align: center; padding: 30px;">\n  <h1 class="fluid-title">Fluid Responsive Header</h1>\n  <p class="fluid-sub">Resize your screen or phone to see text adapt smoothly.</p>\n</div>`,
    css: `.fluid-title {\n  font-size: clamp(20px, 5vw, 42px);\n  color: #38bdf8;\n  font-weight: 800;\n}\n.fluid-sub {\n  font-size: clamp(14px, 2.5vw, 20px);\n  color: #94a3b8;\n}`,
    js: ``,
  },
  {
    id: 'tut_8',
    title: 'Glassmorphism Card',
    description: 'Frosted glass card effect with backdrop blur, glowing borders and floating badge.',
    icon: 'fa-book-open',
    lang: 'CSS',
    html: `<div class="glass-wrap">
  <div class="frosted-glass-card">
    <div class="frosted-badge">NEW DESIGN</div>
    <h2>Glassmorphic Card</h2>
    <p>Semi-transparent frosted background with soft backdrop-blur and delicate border glow.</p>
    <button class="glass-action-btn">Explore More</button>
  </div>
</div>`,
    css: `.glass-wrap {
  min-height: 260px;
  background: radial-gradient(circle at top right, #3b82f6, #09090b 60%);
  padding: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.frosted-glass-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 18px;
  padding: 26px;
  max-width: 360px;
  color: #fff;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}
.frosted-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  margin-bottom: 12px;
}
.frosted-glass-card h2 {
  margin: 0 0 10px 0;
  font-size: 22px;
}
.frosted-glass-card p {
  color: #cbd5e1;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 20px;
}
.glass-action-btn {
  background: #fff;
  color: #0f172a;
  border: none;
  padding: 10px 22px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}`,
    js: `document.querySelector('.glass-action-btn').addEventListener('click', () => {
  alert('Frosted Glass Button Clicked!');
});`,
  },
  {
    id: 'tut_9',
    title: 'Floating Action Button',
    description: 'Material design animated FAB with smooth expandable action icons.',
    icon: 'fa-book-open',
    lang: 'HTML',
    html: `<div class="fab-demo-container">
  <p>Tap the (+) floating action button below:</p>
  <div class="fab-wrapper">
    <div class="fab-menu" id="fabMenu">
      <button class="fab-sub" onclick="alert('Share clicked')">📤</button>
      <button class="fab-sub" onclick="alert('Favorite clicked')">⭐</button>
      <button class="fab-sub" onclick="alert('Camera clicked')">📷</button>
    </div>
    <button class="fab-main" id="fabMain" onclick="toggleFab()">+</button>
  </div>
</div>`,
    css: `.fab-demo-container {
  height: 280px;
  position: relative;
  background: #18181b;
  border-radius: 14px;
  padding: 20px;
  color: #fff;
  text-align: center;
}
.fab-wrapper {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.fab-main {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #2563eb;
  color: #fff;
  border: none;
  font-size: 28px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.5);
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.fab-main.open {
  transform: rotate(45deg);
  background: #ef4444;
}
.fab-menu {
  display: flex;
  flex-direction: column;
  gap: 10px;
  opacity: 0;
  pointer-events: none;
  transform: translateY(15px);
  transition: all 0.3s ease;
}
.fab-menu.open {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}
.fab-sub {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #3f3f46;
  color: #fff;
  border: none;
  font-size: 18px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}`,
    js: `function toggleFab() {
  const fab = document.getElementById('fabMain');
  const menu = document.getElementById('fabMenu');
  fab.classList.toggle('open');
  menu.classList.toggle('open');
}`,
  },
  {
    id: 'tut_10',
    title: 'Dark Mode Switch',
    description: 'Smooth animated toggle switch for theme switching with sun and moon icons.',
    icon: 'fa-book-open',
    lang: 'CSS',
    html: `<div class="theme-box" id="themeContainer">
  <h2 id="themeTitle">Night Mode Active</h2>
  <div class="toggle-switch" onclick="switchTheme()">
    <div class="toggle-circle" id="toggleThumb">🌙</div>
  </div>
  <p id="themeDesc">Tap the switch above to toggle daylight atmosphere.</p>
</div>`,
    css: `.theme-box {
  padding: 40px 20px;
  background: #0f172a;
  color: #f8fafc;
  border-radius: 16px;
  text-align: center;
  max-width: 380px;
  margin: 20px auto;
  border: 1px solid #334155;
  transition: all 0.4s ease;
}
.theme-box.light-mode {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #cbd5e1;
}
.toggle-switch {
  width: 70px;
  height: 38px;
  background: #334155;
  border-radius: 30px;
  margin: 20px auto;
  padding: 4px;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background 0.3s;
}
.light-mode .toggle-switch {
  background: #fbbf24;
}
.toggle-circle {
  width: 30px;
  height: 30px;
  background: #1e293b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s;
}
.light-mode .toggle-circle {
  transform: translateX(32px);
  background: #ffffff;
}`,
    js: `let isDark = true;
function switchTheme() {
  isDark = !isDark;
  const box = document.getElementById('themeContainer');
  const thumb = document.getElementById('toggleThumb');
  const title = document.getElementById('themeTitle');
  const desc = document.getElementById('themeDesc');

  if (isDark) {
    box.classList.remove('light-mode');
    thumb.innerText = '🌙';
    title.innerText = 'Night Mode Active';
    desc.innerText = 'Tap the switch above to toggle daylight atmosphere.';
  } else {
    box.classList.add('light-mode');
    thumb.innerText = '☀️';
    title.innerText = 'Day Mode Active';
    desc.innerText = 'Tap the switch to return to calm dark mode.';
  }
}`,
  },
  // KOTLIN JETPACK COMPOSE SECTOR (Page 2: tut_11 to tut_20)
  {
    id: 'tut_11',
    title: 'Kotlin Compose: Button & State',
    description: 'Learn mutableStateOf and remember for reactive button clicks in Compose.',
    icon: 'fa-cube',
    lang: 'Kotlin',
    html: `<h3>Kotlin Jetpack Compose: Reactive Button</h3><p>Demonstrates remember { mutableStateOf(0) } and Button onClick event handling.</p>`,
    css: `body { font-family: sans-serif; padding: 20px; background: #0f172a; color: #f8fafc; }`,
    js: `// Compose counter logic`,
  },
  {
    id: 'tut_12',
    title: 'Kotlin Compose: LazyColumn List',
    description: 'High performance smooth vertical scrolling list equivalent to RecyclerView.',
    icon: 'fa-list-ol',
    lang: 'Kotlin',
    html: `<h3>LazyColumn Scrolling List</h3><p>Render thousands of list items lazily with zero memory waste.</p>`,
    css: `body { padding: 20px; background: #090d16; color: #e2e8f0; }`,
    js: ``,
  },
  {
    id: 'tut_13',
    title: 'Kotlin Compose: Scaffold & TopBar',
    description: 'Implement Material3 Scaffold structure with TopAppBar and FloatingActionButton.',
    icon: 'fa-layer-group',
    lang: 'Kotlin',
    html: `<h3>Material3 Scaffold Setup</h3><p>Provides topBar, bottomBar, floatingActionButton slots.</p>`,
    css: `body { padding: 20px; background: #131828; color: #fff; }`,
    js: ``,
  },
  {
    id: 'tut_14',
    title: 'Kotlin Compose: TextField Input',
    description: 'Handling form text inputs, focus states, and placeholder hints.',
    icon: 'fa-font',
    lang: 'Kotlin',
    html: `<h3>OutlinedTextField Inputs</h3><p>Learn state hoisting with value and onValueChange callback.</p>`,
    css: `body { padding: 20px; background: #181928; color: #fff; }`,
    js: ``,
  },
  {
    id: 'tut_15',
    title: 'Kotlin Compose: ViewModel & StateFlow',
    description: 'Connect UI to Architecture Components ViewModel and StateFlow for clean MVVM.',
    icon: 'fa-diagram-project',
    lang: 'Kotlin',
    html: `<h3>ViewModel with StateFlow</h3><p>Collect uiState as state with collectAsStateWithLifecycle.</p>`,
    css: `body { padding: 20px; background: #10121d; color: #fff; }`,
    js: ``,
  },
  {
    id: 'tut_16',
    title: 'Kotlin Compose: Animations & Fade',
    description: 'Animate visibility, content transitions, and crossfades with AnimatedVisibility.',
    icon: 'fa-wand-magic-sparkles',
    lang: 'Kotlin',
    html: `<h3>AnimatedVisibility Transitions</h3><p>Add fadeIn() and slideInVertically() with effortless syntax.</p>`,
    css: `body { padding: 20px; background: #0b0f19; color: #fff; }`,
    js: ``,
  },
  {
    id: 'tut_17',
    title: 'Kotlin Coroutines & Dispatchers',
    description: 'Asynchronous background work with viewModelScope.launch and IO Dispatchers.',
    icon: 'fa-bolt',
    lang: 'Kotlin',
    html: `<h3>Coroutines & Async Programming</h3><p>Non-blocking network and database operations with suspend functions.</p>`,
    css: `body { padding: 20px; background: #0f1422; color: #fff; }`,
    js: ``,
  },
  {
    id: 'tut_18',
    title: 'Kotlin Compose: Navigation Graph',
    description: 'Multi-screen navigation with NavHost, NavController, and composable routes.',
    icon: 'fa-signs-post',
    lang: 'Kotlin',
    html: `<h3>Compose Navigation Graph</h3><p>Navigate between screens with navController.navigate().</p>`,
    css: `body { padding: 20px; background: #121829; color: #fff; }`,
    js: ``,
  },
  {
    id: 'tut_19',
    title: 'Kotlin Room Database ORM',
    description: 'Local SQLite persistence with @Entity, @Dao, @Database, and Kotlin Flow queries.',
    icon: 'fa-database',
    lang: 'Kotlin',
    html: `<h3>Room SQLite Database</h3><p>Type-safe reactive database queries observing LiveData or StateFlow.</p>`,
    css: `body { padding: 20px; background: #151a2e; color: #fff; }`,
    js: ``,
  },
  {
    id: 'tut_20',
    title: 'Kotlin Ktor HTTP Client',
    description: 'Consuming REST APIs and parsing JSON with modern Kotlin Multiplatform Ktor.',
    icon: 'fa-cloud-arrow-down',
    lang: 'Kotlin',
    html: `<h3>REST API Integration</h3><p>Fetch real-time data using HttpClient and kotlinx.serialization.</p>`,
    css: `body { padding: 20px; background: #181d33; color: #fff; }`,
    js: ``,
  },
  // ANDROID JAVA SECTOR (Page 3: tut_21 to tut_30)
  {
    id: 'tut_21',
    title: 'Java Android: findViewById & Events',
    description: 'Classical Android Activity lifecycle, Button onClick listeners and View binding.',
    icon: 'fa-mug-hot',
    lang: 'Java',
    html: `<h3>Android Activity & Button Listeners</h3><p>Learn View.OnClickListener and updating TextView in Java.</p>`,
    css: `body { padding: 20px; background: #1a1528; color: #fff; }`,
    js: ``,
  },
  {
    id: 'tut_22',
    title: 'Java Android: RecyclerView & Adapter',
    description: 'Standard ViewHolder pattern and custom Adapter for scrolling list performance.',
    icon: 'fa-table-list',
    lang: 'Java',
    html: `<h3>RecyclerView Adapter in Java</h3><p>Implement onCreateViewHolder, onBindViewHolder, and getItemCount.</p>`,
    css: `body { padding: 20px; background: #181424; color: #fff; }`,
    js: ``,
  },
  {
    id: 'tut_23',
    title: 'Java Android: Intent Navigation',
    description: 'Starting new Activities with Intent, passing Extras, and reading Bundles.',
    icon: 'fa-arrow-right-arrow-left',
    lang: 'Java',
    html: `<h3>Explicit & Implicit Intents</h3><p>Navigate to SecondActivity and pass string parameters using Intent.</p>`,
    css: `body { padding: 20px; background: #1b1629; color: #fff; }`,
    js: ``,
  },
  {
    id: 'tut_24',
    title: 'Java Android: SharedPreferences',
    description: 'Save key-value user preferences, dark mode toggles, and login tokens.',
    icon: 'fa-key',
    lang: 'Java',
    html: `<h3>SharedPreferences Storage</h3><p>getSharedPreferences(), edit().putString().apply() persistence.</p>`,
    css: `body { padding: 20px; background: #1f1830; color: #fff; }`,
    js: ``,
  },
  {
    id: 'tut_25',
    title: 'Java Android: Fragment Transactions',
    description: 'Dynamic UI components with FragmentManager, replace transaction and back stack.',
    icon: 'fa-puzzle-piece',
    lang: 'Java',
    html: `<h3>Fragment Lifecycle & Transactions</h3><p>Load reusable fragments into FrameLayout containers.</p>`,
    css: `body { padding: 20px; background: #1a162b; color: #fff; }`,
    js: ``,
  },
  {
    id: 'tut_26',
    title: 'Java Android: SQLite Database Helper',
    description: 'Raw SQL local data management using SQLiteOpenHelper, ContentValues and Cursor.',
    icon: 'fa-server',
    lang: 'Java',
    html: `<h3>SQLiteOpenHelper Database</h3><p>Create tables, execute queries, and parse database rows with Cursor.</p>`,
    css: `body { padding: 20px; background: #171526; color: #fff; }`,
    js: ``,
  },
  {
    id: 'tut_27',
    title: 'Java Android: Custom Dialog & Alerts',
    description: 'Build material AlertDialog with positive, negative buttons and custom layout.',
    icon: 'fa-window-maximize',
    lang: 'Java',
    html: `<h3>Material AlertDialog Builder</h3><p>Display confirmation prompts and custom dialogs gracefully.</p>`,
    css: `body { padding: 20px; background: #161424; color: #fff; }`,
    js: ``,
  },
  {
    id: 'tut_28',
    title: 'Java Android: Retrofit & Gson',
    description: 'Type-safe HTTP client with annotations (@GET, @POST) and automatic JSON parsing.',
    icon: 'fa-network-wired',
    lang: 'Java',
    html: `<h3>Retrofit Networking in Java</h3><p>Define interface routes and handle Call async callbacks.</p>`,
    css: `body { padding: 20px; background: #191629; color: #fff; }`,
    js: ``,
  },
  {
    id: 'tut_29',
    title: 'Java Android: BroadcastReceiver',
    description: 'Listen to system events such as battery level, internet connection, and boot complete.',
    icon: 'fa-tower-broadcast',
    lang: 'Java',
    html: `<h3>System Broadcast Receivers</h3><p>Register dynamic broadcast receivers and filter intent actions.</p>`,
    css: `body { padding: 20px; background: #1b172c; color: #fff; }`,
    js: ``,
  },
  {
    id: 'tut_30',
    title: 'Java Android: Notification Manager',
    description: 'Display heads-up push notifications with NotificationCompat.Builder & channels.',
    icon: 'fa-bell',
    lang: 'Java',
    html: `<h3>Android Push Notifications</h3><p>Create notification channels and trigger notifications with PendingIntent.</p>`,
    css: `body { padding: 20px; background: #1e1933; color: #fff; }`,
    js: ``,
  },
  // FLUTTER & DART SECTOR (Page 4: tut_31 to tut_40)
  {
    id: 'tut_31',
    title: 'Flutter: StatefulWidget & setState',
    description: 'Core state management in Flutter with build context and setState mutation.',
    icon: 'fa-feather-pointed',
    lang: 'Dart',
    html: `<h3>StatefulWidget in Flutter</h3><p>Manage dynamic widgets with mutable state and setState triggers.</p>`,
    css: `body { padding: 20px; background: #0d1b2a; color: #fff; }`,
    js: ``,
  },
  {
    id: 'tut_32',
    title: 'Flutter: ListView.builder',
    description: 'Efficient infinite on-demand scrolling list rendering with item count.',
    icon: 'fa-list',
    lang: 'Dart',
    html: `<h3>ListView.builder</h3><p>Render thousands of list items lazily with high 60fps performance.</p>`,
    css: `body { padding: 20px; background: #0f2034; color: #fff; }`,
    js: ``,
  },
  {
    id: 'tut_33',
    title: 'Flutter: Flex Column & Row Layout',
    description: 'Master mainAxisAlignment, crossAxisAlignment, Expanded and Flexible widgets.',
    icon: 'fa-table-columns',
    lang: 'Dart',
    html: `<h3>Flutter Flex Layouts</h3><p>Organize responsive screens across tablets and phones cleanly.</p>`,
    css: `body { padding: 20px; background: #11253e; color: #fff; }`,
    js: ``,
  },
  {
    id: 'tut_34',
    title: 'Flutter: AnimatedContainer',
    description: 'Implicit animations with duration, curves, and animated transitions without controllers.',
    icon: 'fa-wand-magic-sparkles',
    lang: 'Dart',
    html: `<h3>Implicit Animation</h3><p>Animate width, height, color, and borderRadius smoothly.</p>`,
    css: `body { padding: 20px; background: #142a48; color: #fff; }`,
    js: ``,
  },
  {
    id: 'tut_35',
    title: 'Flutter: Provider Architecture',
    description: 'Dependency injection and state broadcasting with ChangeNotifierProvider.',
    icon: 'fa-diagram-project',
    lang: 'Dart',
    html: `<h3>Provider Architecture</h3><p>Consume application state globally with context.watch and context.read.</p>`,
    css: `body { padding: 20px; background: #172f52; color: #fff; }`,
    js: ``,
  },
  {
    id: 'tut_36',
    title: 'Flutter: FutureBuilder & Async API',
    description: 'Handle loading, data, and error snapshots when fetching REST API endpoints.',
    icon: 'fa-cloud-arrow-down',
    lang: 'Dart',
    html: `<h3>FutureBuilder Widget</h3><p>Declarative UI based on connection state and async snapshot data.</p>`,
    css: `body { padding: 20px; background: #1a345c; color: #fff; }`,
    js: ``,
  },
  {
    id: 'tut_37',
    title: 'Flutter: Hero Screen Transitions',
    description: 'Seamless shared element transitions between screens with Hero tag matching.',
    icon: 'fa-image',
    lang: 'Dart',
    html: `<h3>Hero Animation Widget</h3><p>Animate images and cards seamlessly across screen routes.</p>`,
    css: `body { padding: 20px; background: #1d3966; color: #fff; }`,
    js: ``,
  },
  {
    id: 'tut_38',
    title: 'Flutter: CustomPainter & Canvas',
    description: 'Draw custom charts, circular progress indicators, and vector shapes with Canvas API.',
    icon: 'fa-paintbrush',
    lang: 'Dart',
    html: `<h3>Custom Painter in Flutter</h3><p>Full control over 2D pixels with Paint and Canvas draw methods.</p>`,
    css: `body { padding: 20px; background: #203e70; color: #fff; }`,
    js: ``,
  },
  {
    id: 'tut_39',
    title: 'Flutter: GestureDetector Events',
    description: 'Handle taps, double taps, long press, vertical drags, and pan updates.',
    icon: 'fa-hand-pointer',
    lang: 'Dart',
    html: `<h3>GestureDetector Events</h3><p>Add touch feedback and interactive gestures to any widget.</p>`,
    css: `body { padding: 20px; background: #23437a; color: #fff; }`,
    js: ``,
  },
  {
    id: 'tut_40',
    title: 'Flutter: SharedPreferences & Theme',
    description: 'Persist application theme mode and user session data across app restarts.',
    icon: 'fa-gear',
    lang: 'Dart',
    html: `<h3>Persistence in Flutter</h3><p>Save user settings with shared_preferences package.</p>`,
    css: `body { padding: 20px; background: #264884; color: #fff; }`,
    js: ``,
  },
  // IOS SWIFTUI SECTOR (Page 5: tut_41 to tut_50)
  {
    id: 'tut_41',
    title: 'SwiftUI: View & @State',
    description: 'Learn modern declarative iOS UI programming with View protocol and @State wrapper.',
    icon: 'fa-apple-whole',
    lang: 'Swift',
    html: `<h3>SwiftUI Declarative Architecture</h3><p>Declarative views automatically re-render when @State values mutate.</p>`,
    css: `body { padding: 20px; background: #21151d; color: #fff; }`,
    js: ``,
  },
  {
    id: 'tut_42',
    title: 'SwiftUI: VStack, HStack & ZStack',
    description: 'Stack layouts with alignment, spacing, Spacer(), and frame modifiers.',
    icon: 'fa-cubes-stacked',
    lang: 'Swift',
    html: `<h3>Layout Stacks in SwiftUI</h3><p>Combine vertical, horizontal, and depth stacks for complex layouts.</p>`,
    css: `body { padding: 20px; background: #241620; color: #fff; }`,
    js: ``,
  },
  {
    id: 'tut_43',
    title: 'SwiftUI: NavigationStack & Routes',
    description: 'iOS 16+ type-safe NavigationStack with navigationDestination and NavigationLink.',
    icon: 'fa-compass',
    lang: 'Swift',
    html: `<h3>NavigationStack Navigation</h3><p>Manage app navigation stack with value-driven routing.</p>`,
    css: `body { padding: 20px; background: #271823; color: #fff; }`,
    js: ``,
  },
  {
    id: 'tut_44',
    title: 'SwiftUI: @Binding & Two-Way State',
    description: 'Two-way state bindings between parent screens and reusable child views.',
    icon: 'fa-link',
    lang: 'Swift',
    html: `<h3>@Binding Two-Way Data</h3><p>Share and mutate state across parent and subview components.</p>`,
    css: `body { padding: 20px; background: #2a1a26; color: #fff; }`,
    js: ``,
  },
  {
    id: 'tut_45',
    title: 'SwiftUI: Observable & MVVM',
    description: 'Modern @Observable macro for scalable clean architecture data models.',
    icon: 'fa-diagram-successor',
    lang: 'Swift',
    html: `<h3>Swift @Observable Models</h3><p>Streamlined observable objects without manual published wrappers.</p>`,
    css: `body { padding: 20px; background: #2d1c29; color: #fff; }`,
    js: ``,
  },
  {
    id: 'tut_46',
    title: 'SwiftUI: List & Swipe Actions',
    description: 'Native iOS TableView with scroll performance, pull to refresh, and swipe actions.',
    icon: 'fa-bars',
    lang: 'Swift',
    html: `<h3>SwiftUI List Component</h3><p>Native iOS list styling with .swipeActions and .refreshable.</p>`,
    css: `body { padding: 20px; background: #301e2c; color: #fff; }`,
    js: ``,
  },
  {
    id: 'tut_47',
    title: 'SwiftUI: Sheets & FullScreenCover',
    description: 'Present modal bottom sheets, confirmation dialogues, and full screen overlays.',
    icon: 'fa-window-restore',
    lang: 'Swift',
    html: `<h3>Modal Sheets & Dialogs</h3><p>Present modal sheets with .sheet(isPresented:) and dismiss actions.</p>`,
    css: `body { padding: 20px; background: #33202f; color: #fff; }`,
    js: ``,
  },
  {
    id: 'tut_48',
    title: 'Swift: Async / Await Concurrency',
    description: 'Modern structured concurrency in Swift with async let, Task, and URLSession.',
    icon: 'fa-clock',
    lang: 'Swift',
    html: `<h3>Swift Concurrency</h3><p>Fetch network data cleanly with try await URLSession.shared.data(from:).</p>`,
    css: `body { padding: 20px; background: #362232; color: #fff; }`,
    js: ``,
  },
  {
    id: 'tut_49',
    title: 'SwiftUI: Custom ViewModifiers',
    description: 'Create reusable ViewModifier extensions and custom ButtonStyle implementations.',
    icon: 'fa-paint-roller',
    lang: 'Swift',
    html: `<h3>ViewModifier Extensions</h3><p>Encapsulate consistent app design systems into reusable modifiers.</p>`,
    css: `body { padding: 20px; background: #392435; color: #fff; }`,
    js: ``,
  },
  {
    id: 'tut_50',
    title: 'SwiftUI: Fluid Spring Animations',
    description: 'Spring physics, interactive spring curves, and matched geometry effect.',
    icon: 'fa-sparkles',
    lang: 'Swift',
    html: `<h3>Fluid iOS Spring Animations</h3><p>Add realistic iOS fluid physics using withAnimation(.spring()).</p>`,
    css: `body { padding: 20px; background: #3c2638; color: #fff; }`,
    js: ``,
  },
];

const EXTRA_HTML_TUTS = [
  'HTML5 Semantic Layout', 'CSS Grid Dashboard', 'Flexbox Navbar Bar', 'Fetch API & Async JSON', 'LocalStorage State',
  'Canvas 2D Graphics', 'Responsive Media Queries', 'Dark Mode CSS Variables', 'Web Audio Synthesizer', 'Drag & Drop Kanban'
];
const EXTRA_KT_TUTS = [
  'Kotlin Compose: Scaffold & TopBar', 'Kotlin Compose: BottomSheetDialog', 'Kotlin StateFlow & SharedFlow', 'Kotlin Hilt Dependency Injection', 'Kotlin Paging 3 Infinite List',
  'Kotlin WorkManager Periodic Sync', 'Kotlin DataStore Preferences', 'Kotlin CameraX Image Capture', 'Kotlin Biometric Prompt Auth', 'Kotlin Material3 Dynamic Color'
];
const EXTRA_JAVA_TUTS = [
  'Java Android: ConstraintLayout', 'Java Android: ViewPager2 & Tabs', 'Java Android: Service & Thread', 'Java Android: ContentProvider', 'Java Android: Handler & Looper',
  'Java Android: OkHttp Interceptor', 'Java Android: Glide Image Loader', 'Java Android: MediaPlayer Audio', 'Java Android: SensorEventListener', 'Java Android: WebView Bridge'
];
const EXTRA_DART_TUTS = [
  'Flutter: SliverAppBar & Scroll', 'Flutter: Riverpod ConsumerWidget', 'Flutter: Bloc & Cubit Pattern', 'Flutter: GoRouter Deep Linking', 'Flutter: Dio HTTP & Interceptors',
  'Flutter: Hive Local NoSQL Box', 'Flutter: LayoutBuilder Adaptive', 'Flutter:Isolate Background Task', 'Flutter: ValueListenableBuilder', 'Flutter: BottomNavigationBar'
];
const EXTRA_SWIFT_TUTS = [
  'SwiftUI: TabView & Badges', 'SwiftUI: LazyVGrid & Adaptive', 'SwiftUI: SwiftData @Model', 'SwiftUI: Combine Publisher', 'SwiftUI: GeometryReader Layout',
  'SwiftUI: ScrollViewReader', 'SwiftUI: ContextMenu & Preview', 'SwiftUI: Charts & BarMark', 'SwiftUI: MapKit Annotations', 'SwiftUI: CoreAnimation Keyframes'
];

for (let i = 11; i <= 100; i++) {
  const idx = (i - 1) % 10;
  DEFAULT_TUTORIALS.push({
    id: `tut_html_${i}`,
    title: `${EXTRA_HTML_TUTS[idx]} #${i}`,
    description: `Step-by-step interactive HTML, CSS & JS tutorial module #${i}.`,
    icon: 'fa-code',
    lang: 'HTML',
    html: `<div style="padding:20px;background:#141726;color:#fff;border-radius:12px;"><h3>${EXTRA_HTML_TUTS[idx]} #${i}</h3><p>Interactive web tutorial #${i}.</p></div>`,
    css: `body { margin: 0; padding: 16px; background: #0b0d17; color: #fff; font-family: system-ui, sans-serif; }`,
    js: `console.log("HTML Tutorial #${i} active");`,
  });
}

for (let i = 11; i <= 100; i++) {
  const idx = (i - 1) % 10;
  DEFAULT_TUTORIALS.push({
    id: `tut_kt_${i}`,
    title: `${EXTRA_KT_TUTS[idx]} #${i}`,
    description: `Jetpack Compose & modern Kotlin Android architecture lesson #${i}.`,
    icon: 'fa-mobile-screen',
    lang: 'Kotlin',
    html: `<div style="padding:20px;background:#141726;color:#fff;border-radius:12px;"><h3>${EXTRA_KT_TUTS[idx]} #${i}</h3><p>Kotlin Compose lesson #${i}.</p></div>`,
    css: `body { margin: 0; padding: 16px; background: #0b0d17; color: #fff; font-family: system-ui, sans-serif; }`,
    js: `console.log("Kotlin Tutorial #${i} active");`,
  });
}

for (let i = 11; i <= 100; i++) {
  const idx = (i - 1) % 10;
  DEFAULT_TUTORIALS.push({
    id: `tut_java_${i}`,
    title: `${EXTRA_JAVA_TUTS[idx]} #${i}`,
    description: `Native Android Java SDK component & lifecycle tutorial #${i}.`,
    icon: 'fa-mug-hot',
    lang: 'Java',
    html: `<div style="padding:20px;background:#141726;color:#fff;border-radius:12px;"><h3>${EXTRA_JAVA_TUTS[idx]} #${i}</h3><p>Android Java tutorial #${i}.</p></div>`,
    css: `body { margin: 0; padding: 16px; background: #0b0d17; color: #fff; font-family: system-ui, sans-serif; }`,
    js: `console.log("Java Tutorial #${i} active");`,
  });
}

for (let i = 11; i <= 100; i++) {
  const idx = (i - 1) % 10;
  DEFAULT_TUTORIALS.push({
    id: `tut_dart_${i}`,
    title: `${EXTRA_DART_TUTS[idx]} #${i}`,
    description: `Cross-platform Flutter widget & Dart state management tutorial #${i}.`,
    icon: 'fa-feather-pointed',
    lang: 'Dart',
    html: `<div style="padding:20px;background:#141726;color:#fff;border-radius:12px;"><h3>${EXTRA_DART_TUTS[idx]} #${i}</h3><p>Flutter Dart tutorial #${i}.</p></div>`,
    css: `body { margin: 0; padding: 16px; background: #0b0d17; color: #fff; font-family: system-ui, sans-serif; }`,
    js: `console.log("Flutter Tutorial #${i} active");`,
  });
}

for (let i = 11; i <= 100; i++) {
  const idx = (i - 1) % 10;
  DEFAULT_TUTORIALS.push({
    id: `tut_swift_${i}`,
    title: `${EXTRA_SWIFT_TUTS[idx]} #${i}`,
    description: `Declarative iOS SwiftUI view & concurrency tutorial #${i}.`,
    icon: 'fa-apple-whole',
    lang: 'Swift',
    html: `<div style="padding:20px;background:#141726;color:#fff;border-radius:12px;"><h3>${EXTRA_SWIFT_TUTS[idx]} #${i}</h3><p>iOS SwiftUI tutorial #${i}.</p></div>`,
    css: `body { margin: 0; padding: 16px; background: #0b0d17; color: #fff; font-family: system-ui, sans-serif; }`,
    js: `console.log("Swift Tutorial #${i} active");`,
  });
}
