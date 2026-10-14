// src/utils/appCompiler.ts
// Intelligent Code Analyzer, Interactive Standalone App Compiler & Adaptive Icon Generator for Android APKs

export type AppCategory =
  | 'calculator'
  | 'notes'
  | 'game'
  | 'music'
  | 'weather'
  | 'clock'
  | 'camera'
  | 'chat'
  | 'browser'
  | 'general';

export interface AppDetectionResult {
  category: AppCategory;
  displayName: string;
  themeColor: string;
  badgeIcon: string; // FontAwesome class
  description: string;
}

const GENERIC_PROJECT_TITLES = new Set([
  'android',
  'android app',
  'flutter',
  'flutter app',
  'my app',
  'myapp',
  'bottom navigation bar app',
  'material 3 navigation drawer',
  'jetpack compose starter',
  'empty activity',
  'empty views activity',
  'basic views activity',
  'responsive views activity',
  'tabbed views activity',
  'fullscreen views activity',
  'google maps views activity',
  'login views activity',
  'scrolling views activity',
  'settings views activity',
  'new project',
  'untitled',
  'app',
  'application',
  'project',
]);

export function isGenericOrTemplateTitle(title?: string | null): boolean {
  if (!title) return true;
  const cleaned = title
    .trim()
    .toLowerCase()
    .replace(/\s+\d+$/, '')
    .replace(/[_-]+/g, ' ')
    .trim();
  if (!cleaned) return true;
  if (GENERIC_PROJECT_TITLES.has(cleaned)) return true;
  if (
    cleaned.includes('empty activity') ||
    cleaned.includes('navigation drawer') ||
    cleaned.includes('navigation bar app') ||
    cleaned.includes('compose starter') ||
    cleaned.includes('clean architecture') ||
    cleaned.includes('stateful counter') ||
    cleaned.includes('navigation flow')
  ) {
    return true;
  }
  return false;
}

/**
 * Validate that a file tab is open at the top of the editor and that its file extension
 * matches the language/type of code pasted into the editor.
 */
export function validateFileOpenForCode(
  code: string,
  activeFile: { name: string } | null,
  openFilesCount: number
): { valid: boolean; errorTitle?: string; errorMessage?: string; requiredExt?: string } {
  if (!activeFile || openFilesCount === 0) {
    return {
      valid: false,
      errorTitle: 'OPEN A FILE FIRST',
      errorMessage:
        'No file is open! Please open or create the matching file (e.g. index.html or MainActivity.kt) from the menu (≡) first.',
      requiredExt: '.html',
    };
  }

  const fileName = activeFile.name.toLowerCase();
  const trimmed = (code || '').trim();
  const lowerCode = trimmed.toLowerCase();

  // Detect if pasted code is clearly a full HTML document
  const isHtmlCode =
    lowerCode.includes('<!doctype html') ||
    (lowerCode.includes('<html') && lowerCode.includes('</html>')) ||
    (lowerCode.includes('<body') && lowerCode.includes('</body>')) ||
    (lowerCode.includes('<head') && lowerCode.includes('<style'));

  if (isHtmlCode && !fileName.endsWith('.html') && !fileName.endsWith('.htm')) {
    return {
      valid: false,
      errorTitle: 'OPEN .HTML FILE FIRST',
      errorMessage:
        `"${activeFile.name}" is open, but this is HTML code! Please open an .html file (e.g. index.html) from the menu (≡) first.`,
      requiredExt: '.html',
    };
  }

  // Detect if pasted code is Kotlin code inside an HTML/CSS/JS file
  const isKotlinCode =
    !isHtmlCode &&
    (trimmed.startsWith('package ') ||
      trimmed.includes('class MainActivity') ||
      trimmed.includes('fun onCreate(') ||
      trimmed.includes('@Composable'));

  if (isKotlinCode && (fileName.endsWith('.html') || fileName.endsWith('.css') || fileName.endsWith('.js'))) {
    return {
      valid: false,
      errorTitle: 'OPEN .KT FILE FIRST',
      errorMessage:
        `"${activeFile.name}" is open, but this is Kotlin code! Please open a .kt file (e.g. MainActivity.kt) from the menu (≡) first.`,
      requiredExt: '.kt',
    };
  }

  // Detect if pasted code is Dart/Flutter code inside an HTML/Kotlin file
  const isDartCode =
    !isHtmlCode &&
    (trimmed.includes("import 'package:flutter/") ||
      trimmed.includes('extends StatelessWidget') ||
      trimmed.includes('extends StatefulWidget'));

  if (isDartCode && !fileName.endsWith('.dart')) {
    return {
      valid: false,
      errorTitle: 'OPEN .DART FILE FIRST',
      errorMessage:
        `"${activeFile.name}" is open, but this is Flutter/Dart code! Please open a .dart file (e.g. main.dart) from the menu (≡) first.`,
      requiredExt: '.dart',
    };
  }

  return { valid: true };
}

/**
 * Detect the application category from source code, file names, and project title.
 */
export function detectAppCategory(
  code: string,
  fileName: string,
  projectTitle: string,
  allFiles?: { name: string; content: string }[]
): AppDetectionResult {
  // Prioritize active code and active file name over old projectTitle
  const codeAndFileText = [
    code,
    fileName,
    ...(allFiles ? allFiles.map((f) => `${f.name} ${f.content}`) : []),
  ]
    .join(' ')
    .toLowerCase();

  const fullText = `${codeAndFileText} ${projectTitle}`.toLowerCase();

  // 1. Calculator detection (English and Bengali: ক্যালকুলেটর)
  if (
    codeAndFileText.includes('calculator') ||
    codeAndFileText.includes('ক্যালকুলেটর') ||
    codeAndFileText.includes('currentoperand') ||
    codeAndFileText.includes('previousoperand') ||
    codeAndFileText.includes('appendnumber') ||
    codeAndFileText.includes('chooseoperation') ||
    codeAndFileText.includes('clearall') ||
    codeAndFileText.includes('deletenumber') ||
    (codeAndFileText.includes('display') &&
      codeAndFileText.includes('button') &&
      (codeAndFileText.includes('eval') ||
        codeAndFileText.includes('operand') ||
        codeAndFileText.includes('computation') ||
        codeAndFileText.includes('operator'))) ||
    fullText.includes('calculator') ||
    fullText.includes('ক্যালকুলেটর')
  ) {
    return {
      category: 'calculator',
      displayName: 'Calculator',
      themeColor: '#0ea5e9',
      badgeIcon: 'fa-calculator',
      description: 'Tactile Android Material Calculator App',
    };
  }

  // 2. Notes / Todo
  if (
    codeAndFileText.includes('note') ||
    codeAndFileText.includes('todo') ||
    codeAndFileText.includes('checklist') ||
    fullText.includes('নোট')
  ) {
    return {
      category: 'notes',
      displayName: 'Notes & Tasks',
      themeColor: '#10b981',
      badgeIcon: 'fa-note-sticky',
      description: 'Productivity Notes & Task Manager App',
    };
  }

  // 3. Game / Quiz
  if (
    codeAndFileText.includes('game') ||
    codeAndFileText.includes('arcade') ||
    codeAndFileText.includes('quiz') ||
    codeAndFileText.includes('highscore') ||
    fullText.includes('গেম')
  ) {
    return {
      category: 'game',
      displayName: 'Mobile Game',
      themeColor: '#8b5cf6',
      badgeIcon: 'fa-gamepad',
      description: 'Interactive Android Game & Entertainment App',
    };
  }

  // 4. Music / Audio
  if (
    codeAndFileText.includes('music') ||
    codeAndFileText.includes('audio') ||
    codeAndFileText.includes('playlist') ||
    fullText.includes('গান')
  ) {
    return {
      category: 'music',
      displayName: 'Music Player',
      themeColor: '#ec4899',
      badgeIcon: 'fa-headphones',
      description: 'Audio & Music Media Player App',
    };
  }

  // 5. Camera / Gallery
  if (
    codeAndFileText.includes('camera') ||
    codeAndFileText.includes('photo') ||
    codeAndFileText.includes('gallery') ||
    fullText.includes('ছবি')
  ) {
    return {
      category: 'camera',
      displayName: 'Camera & Photos',
      themeColor: '#f59e0b',
      badgeIcon: 'fa-camera',
      description: 'Camera & Gallery Imaging App',
    };
  }

  // 6. Weather
  if (
    codeAndFileText.includes('weather') ||
    codeAndFileText.includes('forecast') ||
    codeAndFileText.includes('temperature') ||
    fullText.includes('আবহাওয়া')
  ) {
    return {
      category: 'weather',
      displayName: 'Weather Forecast',
      themeColor: '#06b6d4',
      badgeIcon: 'fa-cloud-sun',
      description: 'Live Weather & Atmospheric Forecast App',
    };
  }

  // 7. Clock / Timer / Stopwatch
  if (
    codeAndFileText.includes('clock') ||
    codeAndFileText.includes('timer') ||
    codeAndFileText.includes('stopwatch') ||
    codeAndFileText.includes('alarm') ||
    fullText.includes('ঘড়ি')
  ) {
    return {
      category: 'clock',
      displayName: 'Clock & Timer',
      themeColor: '#3b82f6',
      badgeIcon: 'fa-stopwatch',
      description: 'Precision Chronometer & Clock App',
    };
  }

  // 8. Chat / Messenger
  if (
    codeAndFileText.includes('chat') ||
    codeAndFileText.includes('messenger') ||
    fullText.includes('চ্যাট')
  ) {
    return {
      category: 'chat',
      displayName: 'Messenger',
      themeColor: '#10b981',
      badgeIcon: 'fa-comments',
      description: 'Real-time Messaging & Chat App',
    };
  }

  // 9. Browser / Web
  if (
    codeAndFileText.includes('browser') ||
    fullText.includes('ব্রাউজার')
  ) {
    return {
      category: 'browser',
      displayName: 'Web Browser',
      themeColor: '#38bdf8',
      badgeIcon: 'fa-compass',
      description: 'High-speed Mobile Web Browser App',
    };
  }

  return {
    category: 'general',
    displayName: projectTitle && !isGenericOrTemplateTitle(projectTitle) ? projectTitle.replace(/\s+\d+$/, '') : 'Android App',
    themeColor: '#6366f1',
    badgeIcon: 'fa-cubes-stacked',
    description: 'Custom Android Native Application',
  };
}

/**
 * Resolve the effective application name from user's custom project title, HTML <title>, file name, or detected category.
 */
export function resolveEffectiveAppName(
  code: string,
  activeFileName: string,
  projectTitle: string,
  detection: AppDetectionResult
): string {
  const cleanProj = (projectTitle || '').trim();
  const lowerProj = cleanProj.toLowerCase();

  // 1. Honor the exact project name under which the project was created
  if (
    cleanProj &&
    lowerProj !== 'android' &&
    lowerProj !== 'android app' &&
    lowerProj !== 'flutter' &&
    lowerProj !== 'flutter app' &&
    lowerProj !== 'untitled'
  ) {
    return cleanProj;
  }

  // 2. Check if HTML code has an explicit <title> tag
  const titleMatch = (code || '').match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    const extracted = titleMatch[1].trim();
    const lowerExt = extracted.toLowerCase();
    if (
      extracted.length > 1 &&
      extracted.length <= 37 &&
      lowerExt !== 'document' &&
      lowerExt !== 'app preview' &&
      lowerExt !== 'caniwebview test app'
    ) {
      return extracted;
    }
  }

  // 3. If detected category is specific (like calculator, notes, game, music, etc.)
  if (detection.category !== 'general') {
    return detection.displayName;
  }

  // 4. Check if active file name has a specific name (not index.html or MainActivity.kt)
  if (activeFileName) {
    const baseName = activeFileName.replace(/\.[^.]+$/, '').trim();
    const lowerBase = baseName.toLowerCase();
    if (
      baseName.length > 1 &&
      !['index', 'main', 'mainactivity', 'app', 'style', 'styles', 'script', 'activity_main'].includes(lowerBase)
    ) {
      return baseName.charAt(0).toUpperCase() + baseName.slice(1).replace(/[_-]+/g, ' ');
    }
  }

  return cleanProj || 'ANDROID';
}

/**
 * Generate a standalone, production-ready HTML document for the Android WebView in the APK.
 */
export function compileAppToStandaloneHtml(options: {
  code: string;
  activeFileName: string;
  projectTitle: string;
  allFiles?: { name: string; content: string }[];
  appLogoUrl?: string | null;
}): string {
  const { code, activeFileName, projectTitle, allFiles = [], appLogoUrl } = options;
  const detection = detectAppCategory(code, activeFileName, projectTitle, allFiles);
  const effectiveAppName = resolveEffectiveAppName(code, activeFileName, projectTitle, detection);

  // Find HTML, CSS, JS files in project if any
  const htmlFile = allFiles.find((f) => f.name.toLowerCase().endsWith('.html'));
  const cssFile = allFiles.find((f) => f.name.toLowerCase().endsWith('.css'));
  const jsFile = allFiles.find((f) => f.name.toLowerCase().endsWith('.js') && !f.name.toLowerCase().endsWith('.json'));

  // Check if user provided custom HTML/CSS/JS
  const isHtmlProject =
    activeFileName.toLowerCase().endsWith('.html') ||
    activeFileName.toLowerCase().endsWith('.htm') ||
    code.includes('<!DOCTYPE') ||
    code.includes('<!doctype') ||
    (code.includes('<html') && code.includes('</html>')) ||
    (code.includes('<body') && code.includes('</body>')) ||
    (code.includes('<div') && code.includes('<script'));

  if (isHtmlProject) {
    let mainHtml =
      activeFileName.toLowerCase().endsWith('.html') ||
      code.includes('<html') ||
      code.includes('<body') ||
      code.includes('<div')
        ? code
        : htmlFile
        ? htmlFile.content
        : code;
    let extraCss = cssFile ? cssFile.content : '';
    let extraJs = jsFile ? jsFile.content : '';

    if (activeFileName.toLowerCase().endsWith('.css')) extraCss = code;
    if (activeFileName.toLowerCase().endsWith('.js')) extraJs = code;

    // Ensure full HTML wrapper if user pasted partial HTML snippet
    if (!mainHtml.toLowerCase().includes('<html')) {
      mainHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${effectiveAppName}</title>
</head>
<body>
${mainHtml}
</body>
</html>`;
    }

    const baseWebViewReset = `<style>
:root {
  --apk-top-safe: 0px;
  --apk-bottom-safe: 0px;
}
html, body { max-width: 100vw; overflow-x: hidden; -webkit-tap-highlight-color: transparent; box-sizing: border-box !important; margin: 0 !important; }
#loading-page { position: fixed !important; inset: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 2147483647 !important; margin: 0 !important; padding: 0 !important; }
</style>
<script>
(function() {
  document.addEventListener('click', function(e) {
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (a) {
      var href = a.getAttribute('href') || '';
      if (!href || href === '#' || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//') || href.endsWith('.html')) {
        if (!href.startsWith('javascript:') && !a.hasAttribute('download')) {
          e.preventDefault();
        }
      }
    }
  }, true);
  document.addEventListener('submit', function(e) {
    var form = e.target;
    if (form && (!form.getAttribute('action') || form.getAttribute('action') === '#')) {
      e.preventDefault();
    }
  }, false);
})();
</script>`;
    if ( mainHtml.includes('</head>') ) {
      mainHtml = mainHtml.replace('</head>', `${extraCss ? `<style>${extraCss}</style>` : ''}${baseWebViewReset}</head>`);
    } else {
      mainHtml = `${extraCss ? `<style>${extraCss}</style>` : ''}${baseWebViewReset}${mainHtml}`;
    }

    if (extraJs && !mainHtml.includes(extraJs.slice(0, 30))) {
      mainHtml = mainHtml.includes('</body>')
        ? mainHtml.replace('</body>', `<script>${extraJs}</script></body>`)
        : `${mainHtml}<script>${extraJs}</script>`;
    }

    if (!mainHtml.includes('viewport')) {
      const metaViewport = `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">`;
      mainHtml = mainHtml.includes('<head>')
        ? mainHtml.replace('<head>', `<head>${metaViewport}`)
        : `${metaViewport}${mainHtml}`;
    }

    return mainHtml;
  }

  const wrapWithTopSafeBar = (rawHtml: string): string => {
    return rawHtml;
  };

  // If it's a CALCULATOR APP (written in Kotlin, Java, XML, or incomplete code)
  if (detection.category === 'calculator') {
    return wrapWithTopSafeBar(buildStandaloneCalculatorHtml(effectiveAppName, appLogoUrl));
  }

  // If it's a NOTES / TODO APP
  if (detection.category === 'notes') {
    return wrapWithTopSafeBar(buildStandaloneNotesHtml(effectiveAppName, appLogoUrl));
  }

  // If it's a GAME / QUIZ APP
  if (detection.category === 'game') {
    return wrapWithTopSafeBar(buildStandaloneGameHtml(effectiveAppName, appLogoUrl));
  }

  // If it's a MUSIC PLAYER APP
  if (detection.category === 'music') {
    return wrapWithTopSafeBar(buildStandaloneMusicHtml(effectiveAppName, appLogoUrl));
  }

  // Default: Full Interactive Android (Kotlin/Java/Compose/XML) & Flutter (Dart/Material 3) Runtime Application
  return wrapWithTopSafeBar(buildStandaloneGenericAppHtml(effectiveAppName, code, activeFileName, appLogoUrl, allFiles));
}

/**
 * Full-featured, responsive, tactile Android 15 Material 3 Calculator App.
 */
function buildStandaloneCalculatorHtml(appTitle: string, appLogoUrl?: string | null): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>${appTitle}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-tap-highlight-color: transparent; }
    body {
      background: #080910;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      height: 100vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .app-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 18px;
      background: rgba(15, 17, 26, 0.85);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .brand-group { display: flex; align-items: center; gap: 10px; }
    .brand-logo-icon {
      width: 28px; height: 28px; border-radius: 7px; object-fit: cover;
      background: linear-gradient(135deg, #0284c7, #38bdf8);
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 13px; font-weight: 800;
    }
    .brand-title { font-size: 16px; font-weight: 800; letter-spacing: 0.5px; color: #fff; }
    .header-actions { display: flex; gap: 10px; }
    .icon-btn {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #94a3b8; width: 34px; height: 34px; border-radius: 17px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; font-size: 14px;
    }
    .calc-screen {
      flex: 1; display: flex; flex-direction: column;
      justify-content: flex-end; align-items: flex-end;
      padding: 20px 22px; text-align: right;
    }
    .history-tape {
      font-size: 18px; color: #64748b; min-height: 26px;
      word-break: break-all; font-weight: 500; margin-bottom: 8px;
    }
    .main-display {
      font-size: 54px; font-weight: 700; color: #ffffff;
      line-height: 1.1; word-break: break-all;
    }
    .scientific-panel {
      display: none; grid-template-columns: repeat(5, 1fr);
      gap: 8px; padding: 0 16px 10px;
    }
    .scientific-panel.open { display: grid; }
    .btn-sci {
      background: #151824; border: 1px solid #232738; color: #38bdf8;
      font-size: 13px; font-weight: 700; height: 40px; border-radius: 10px; cursor: pointer;
    }
    .calc-keypad {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 12px; padding: 16px; background: #0f111a;
      border-top-left-radius: 28px; border-top-right-radius: 28px;
      box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.5);
    }
    .key {
      height: 64px; border-radius: 20px; border: none;
      font-size: 22px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
    }
    .key:active { transform: scale(0.92); filter: brightness(1.2); }
    .key-num { background: #1b1e2c; color: #f8fafc; border: 1px solid #282d42; }
    .key-func { background: #222738; color: #cbd5e1; border: 1px solid #313850; font-size: 19px; }
    .key-op { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; font-size: 24px; }
    .key-eq { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; font-size: 26px; }
    .key-clear { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #ffffff; }
  </style>
</head>
<body>
  <div class="app-header">
    <div class="brand-group">
      ${
        appLogoUrl
          ? `<img class="brand-logo-icon" src="${appLogoUrl}" alt="Logo">`
          : `<div class="brand-logo-icon"><i class="fas fa-calculator"></i></div>`
      }
      <div class="brand-title">${appTitle}</div>
    </div>
    <div class="header-actions">
      <button class="icon-btn" id="sciToggleBtn"><i class="fas fa-square-root-variable"></i></button>
      <button class="icon-btn" id="historyBtn"><i class="fas fa-rotate-left"></i></button>
    </div>
  </div>
  <div class="calc-screen">
    <div class="history-tape" id="historyTape"></div>
    <div class="main-display" id="mainDisplay">0</div>
  </div>
  <div class="scientific-panel" id="sciPanel">
    <button class="btn-sci" onclick="pushSci('sin')">sin</button>
    <button class="btn-sci" onclick="pushSci('cos')">cos</button>
    <button class="btn-sci" onclick="pushSci('tan')">tan</button>
    <button class="btn-sci" onclick="pushSci('sqrt')">√</button>
    <button class="btn-sci" onclick="pushSci('pow')">xʸ</button>
    <button class="btn-sci" onclick="pushSci('log')">log</button>
    <button class="btn-sci" onclick="pushSci('ln')">ln</button>
    <button class="btn-sci" onclick="pushSci('pi')">π</button>
    <button class="btn-sci" onclick="pushSci('(')">(</button>
    <button class="btn-sci" onclick="pushSci(')')">)</button>
  </div>
  <div class="calc-keypad">
    <button class="key key-clear" onclick="clearAll()">AC</button>
    <button class="key key-func" onclick="deleteDigit()">DEL</button>
    <button class="key key-func" onclick="toggleSign()">±</button>
    <button class="key key-op" onclick="setOp('÷')">÷</button>
    <button class="key key-num" onclick="appendNum('7')">7</button>
    <button class="key key-num" onclick="appendNum('8')">8</button>
    <button class="key key-num" onclick="appendNum('9')">9</button>
    <button class="key key-op" onclick="setOp('×')">×</button>
    <button class="key key-num" onclick="appendNum('4')">4</button>
    <button class="key key-num" onclick="appendNum('5')">5</button>
    <button class="key key-num" onclick="appendNum('6')">6</button>
    <button class="key key-op" onclick="setOp('−')">−</button>
    <button class="key key-num" onclick="appendNum('1')">1</button>
    <button class="key key-num" onclick="appendNum('2')">2</button>
    <button class="key key-num" onclick="appendNum('3')">3</button>
    <button class="key key-op" onclick="setOp('+')">+</button>
    <button class="key key-func" onclick="setOp('%')">%</button>
    <button class="key key-num" onclick="appendNum('0')">0</button>
    <button class="key key-num" onclick="appendDot()">.</button>
    <button class="key key-eq" onclick="calculateResult()">=</button>
  </div>
  <script>
    let currentInput = '0';
    let previousInput = '';
    let operation = null;
    let shouldResetDisplay = false;
    const displayEl = document.getElementById('mainDisplay');
    const historyEl = document.getElementById('historyTape');
    const sciPanel = document.getElementById('sciPanel');
    document.getElementById('sciToggleBtn').addEventListener('click', () => sciPanel.classList.toggle('open'));
    document.getElementById('historyBtn').addEventListener('click', () => clearAll());
    function updateDisplay() {
      displayEl.textContent = currentInput;
      displayEl.style.fontSize = currentInput.length > 11 ? '32px' : currentInput.length > 7 ? '42px' : '54px';
    }
    function appendNum(num) {
      if (currentInput === '0' || shouldResetDisplay) { currentInput = num; shouldResetDisplay = false; }
      else { currentInput += num; }
      updateDisplay();
    }
    function appendDot() {
      if (shouldResetDisplay) { currentInput = '0.'; shouldResetDisplay = false; }
      else if (!currentInput.includes('.')) { currentInput += '.'; }
      updateDisplay();
    }
    function setOp(op) {
      if (operation !== null && !shouldResetDisplay) calculateResult();
      previousInput = currentInput; operation = op; shouldResetDisplay = true;
      historyEl.textContent = previousInput + ' ' + operation;
    }
    function calculateResult() {
      if (operation === null || shouldResetDisplay) return;
      const prev = parseFloat(previousInput), current = parseFloat(currentInput);
      if (isNaN(prev) || isNaN(current)) return;
      let result = 0;
      switch (operation) {
        case '+': result = prev + current; break;
        case '−': result = prev - current; break;
        case '×': result = prev * current; break;
        case '÷':
          if (current === 0) { currentInput = 'Error'; historyEl.textContent = ''; updateDisplay(); operation = null; shouldResetDisplay = true; return; }
          result = prev / current; break;
        case '%': result = (prev * current) / 100; break;
        case '^': result = Math.pow(prev, current); break;
        default: return;
      }
      historyEl.textContent = previousInput + ' ' + operation + ' ' + currentInput + ' =';
      result = Math.round(result * 100000000) / 100000000;
      currentInput = result.toString(); operation = null; shouldResetDisplay = true;
      updateDisplay();
    }
    function clearAll() { currentInput = '0'; previousInput = ''; operation = null; shouldResetDisplay = false; historyEl.textContent = ''; updateDisplay(); }
    function deleteDigit() {
      if (shouldResetDisplay) return;
      currentInput = (currentInput.length === 1 || (currentInput.length === 2 && currentInput.startsWith('-'))) ? '0' : currentInput.slice(0, -1);
      updateDisplay();
    }
    function toggleSign() {
      if (currentInput === '0') return;
      currentInput = currentInput.startsWith('-') ? currentInput.slice(1) : '-' + currentInput;
      updateDisplay();
    }
    function pushSci(fn) {
      let val = parseFloat(currentInput);
      if (isNaN(val)) return;
      let res = val;
      if (fn === 'sin') res = Math.sin(val * Math.PI / 180);
      else if (fn === 'cos') res = Math.cos(val * Math.PI / 180);
      else if (fn === 'tan') res = Math.tan(val * Math.PI / 180);
      else if (fn === 'sqrt') res = Math.sqrt(val);
      else if (fn === 'log') res = Math.log10(val);
      else if (fn === 'ln') res = Math.log(val);
      else if (fn === 'pi') res = Math.PI;
      else if (fn === 'pow') { setOp('^'); return; }
      res = Math.round(res * 100000000) / 100000000;
      historyEl.textContent = fn + '(' + currentInput + ') =';
      currentInput = res.toString(); shouldResetDisplay = true; updateDisplay();
    }
  </script>
</body>
</html>`;
}

function buildStandaloneNotesHtml(appTitle: string, appLogoUrl?: string | null): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${appTitle}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0c0e17; color: #f8fafc; font-family: system-ui, sans-serif; min-height: 100vh; display: flex; flex-direction: column; }
    .header { padding: 16px; background: #131625; border-bottom: 1px solid #23273e; display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 17px; }
    .input-bar { padding: 14px 16px; background: #181c30; display: flex; gap: 10px; }
    .input-bar input { flex: 1; background: #0c0e17; border: 1px solid #2d3454; padding: 10px 14px; border-radius: 10px; color: #fff; font-size: 14px; outline: none; }
    .input-bar button { background: #10b981; color: #fff; border: none; padding: 10px 18px; border-radius: 10px; font-weight: 700; cursor: pointer; }
    .notes-list { flex: 1; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
    .note-card { background: #141728; border: 1px solid #272d47; border-radius: 12px; padding: 14px; display: flex; align-items: center; justify-content: space-between; }
    .note-text.done { text-decoration: line-through; color: #64748b; }
    .del-btn { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: none; padding: 6px 10px; border-radius: 8px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="header">
    ${appLogoUrl ? `<img src="${appLogoUrl}" style="width:28px;height:28px;border-radius:6px;">` : ''}
    <span>${appTitle}</span>
  </div>
  <div class="input-bar">
    <input type="text" id="noteInput" placeholder="Write a note...">
    <button onclick="addNote()">Add</button>
  </div>
  <div class="notes-list" id="notesList"></div>
  <script>
    let notes = JSON.parse(localStorage.getItem('app_notes') || '[{"id":1,"text":"Welcome to ${appTitle}!","done":false}]');
    function render() {
      document.getElementById('notesList').innerHTML = notes.map(n => \`
        <div class="note-card">
          <span class="note-text \${n.done ? 'done' : ''}" onclick="toggleNote(\${n.id})">\${n.text}</span>
          <button class="del-btn" onclick="delNote(\${n.id})">✕</button>
        </div>\`).join('');
      localStorage.setItem('app_notes', JSON.stringify(notes));
    }
    function addNote() {
      const inp = document.getElementById('noteInput');
      if (!inp.value.trim()) return;
      notes.unshift({ id: Date.now(), text: inp.value.trim(), done: false });
      inp.value = ''; render();
    }
    function toggleNote(id) { notes = notes.map(n => n.id === id ? { ...n, done: !n.done } : n); render(); }
    function delNote(id) { notes = notes.filter(n => n.id !== id); render(); }
    render();
  </script>
</body>
</html>`;
}

function buildStandaloneGameHtml(appTitle: string, _appLogoUrl?: string | null): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${appTitle}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
    body { background: #070913; color: #fff; font-family: system-ui, sans-serif; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
    .top-bar { padding: 12px 16px; background: #0f1224; display: flex; justify-content: space-between; align-items: center; }
    .score-box { font-size: 18px; font-weight: 800; color: #38bdf8; }
    #gameCanvas { flex: 1; background: #03040a; width: 100%; }
    .controls { padding: 16px; background: #0f1224; display: flex; justify-content: space-around; }
    .ctrl-btn { width: 68px; height: 68px; border-radius: 34px; background: #1e2544; border: 2px solid #3b467a; color: #fff; font-size: 20px; font-weight: 800; }
  </style>
</head>
<body>
  <div class="top-bar"><strong>${appTitle}</strong><div class="score-box">SCORE: <span id="scoreVal">0</span></div></div>
  <canvas id="gameCanvas"></canvas>
  <div class="controls">
    <button class="ctrl-btn" onpointerdown="moveLeft()">◀</button>
    <button class="ctrl-btn" onpointerdown="jump()">▲</button>
    <button class="ctrl-btn" onpointerdown="moveRight()">▶</button>
  </div>
  <script>
    const canvas = document.getElementById('gameCanvas'), ctx = canvas.getContext('2d');
    function resize() { canvas.width = window.innerWidth; canvas.height = canvas.offsetHeight; }
    window.addEventListener('resize', resize); setTimeout(resize, 50);
    let px = 150, py = 200, score = 0;
    function moveLeft() { px = Math.max(30, px - 30); }
    function moveRight() { px = Math.min(canvas.width - 30, px + 30); }
    function jump() { py = Math.max(50, py - 45); score += 10; document.getElementById('scoreVal').innerText = score; }
    function loop() {
      ctx.fillStyle = '#03040a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#8b5cf6'; ctx.beginPath(); ctx.arc(px, py, 22, 0, Math.PI * 2); ctx.fill();
      if (py < canvas.height - 40) py += 1.5;
      requestAnimationFrame(loop);
    }
    loop();
  </script>
</body>
</html>`;
}

function buildStandaloneMusicHtml(appTitle: string, _appLogoUrl?: string | null): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${appTitle}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #080914; color: #fff; font-family: system-ui, sans-serif; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; text-align: center; }
    .disc { width: 200px; height: 200px; border-radius: 100px; background: linear-gradient(135deg, #ec4899, #8b5cf6); display: flex; align-items: center; justify-content: center; font-size: 56px; margin-bottom: 24px; }
    .play-btn { width: 68px; height: 68px; border-radius: 34px; background: #ec4899; border: none; color: #fff; font-size: 22px; font-weight: 800; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="disc">♫</div>
  <h2>${appTitle}</h2>
  <button class="play-btn" onclick="this.textContent = this.textContent === '⏸' ? '▶' : '⏸'">⏸</button>
</body>
</html>`;
}

function buildStandaloneGenericAppHtml(
  appTitle: string,
  code: string,
  fileName: string,
  appLogoUrl?: string | null,
  allFiles: { name: string; content: string }[] = []
): string {
  const combinedSource = [code || '', ...allFiles.map((f) => f.content || '')].join('\n');
  const isFlutterApp =
    (fileName || '').toLowerCase().endsWith('.dart') ||
    combinedSource.includes("package:flutter/") ||
    combinedSource.includes('StatelessWidget') ||
    combinedSource.includes('StatefulWidget') ||
    allFiles.some((f) => f.name.toLowerCase().endsWith('.dart'));

  // Extract string literals / labels from Dart, Kotlin, Java, or XML code
  const extractedTexts: string[] = [];
  const textPatterns = [
    /Text\(\s*['"]([^'"]{2,48})['"]/g,
    /android:text="([^"@]{2,48})"/g,
    /title:\s*const\s*Text\(\s*['"]([^'"]{2,48})['"]/g,
    /title:\s*Text\(\s*['"]([^'"]{2,48})['"]/g,
    /Toast\.makeText\([^,]+,\s*"([^"]{2,48})"/g,
    /println\(\s*"([^"]{2,48})"\s*\)/g,
  ];
  for (const regex of textPatterns) {
    let m: RegExpExecArray | null;
    while ((m = regex.exec(combinedSource)) !== null) {
      const val = m[1].trim();
      if (val && !extractedTexts.includes(val) && extractedTexts.length < 8) {
        extractedTexts.push(val);
      }
    }
  }

  const primaryAccent = isFlutterApp ? '#0284c7' : '#10b981';
  const secondaryAccent = isFlutterApp ? '#38bdf8' : '#3DDC84';
  const runtimeBadge = isFlutterApp ? 'FLUTTER M3' : 'ANDROID SDK 34';
  const initialItems =
    extractedTexts.length > 0
      ? extractedTexts.slice(0, 5)
      : isFlutterApp
      ? ['Material 3 Scaffold Active', 'Stateful Hot-Reload Ready', 'Dart Isolate & Provider Connected']
      : ['Jetpack Compose UI Active', 'Navigation Controller Ready', 'Android Activity Lifecycle Connected'];

  const safeItemsJson = JSON.stringify(initialItems).replace(/</g, '\\u003c');
  const safeTitle = (appTitle || 'ANDROID').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>${safeTitle}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-tap-highlight-color: transparent; }
    body {
      background: #090b12;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .app-bar {
      padding: 13px 16px;
      background: #111524;
      border-bottom: 1px solid #1f263e;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .app-bar-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .app-logo {
      width: 32px; height: 32px; border-radius: 9px; object-fit: cover;
      background: linear-gradient(135deg, ${primaryAccent}, ${secondaryAccent});
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-weight: 900; font-size: 14px; flex-shrink: 0;
    }
    .app-title {
      font-size: 15px; font-weight: 800; color: #fff;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .runtime-pill {
      font-size: 10px; font-weight: 800; padding: 4px 8px; border-radius: 999px;
      background: rgba(56, 189, 248, 0.14); color: ${secondaryAccent};
      border: 1px solid rgba(56, 189, 248, 0.3); flex-shrink: 0;
    }
    .screen-body {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 14px;
    }
    .tab-pane { display: none; flex-direction: column; gap: 14px; }
    .tab-pane.active { display: flex; }
    .hero-card {
      background: linear-gradient(135deg, #151a2e 0%, #0f1322 100%);
      border: 1px solid #252d4b; border-radius: 16px; padding: 16px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.35);
    }
    .hero-label { font-size: 11px; font-weight: 800; color: ${secondaryAccent}; text-transform: uppercase; letter-spacing: 0.6px; }
    .hero-heading { font-size: 18px; font-weight: 800; color: #fff; margin: 4px 0 6px; }
    .hero-sub { font-size: 12px; color: #94a3b8; line-height: 1.45; }
    .counter-row {
      display: flex; align-items: center; justify-content: space-between;
      margin-top: 14px; padding-top: 12px; border-top: 1px solid #222944;
    }
    .counter-val { font-size: 24px; font-weight: 900; color: #fff; }
    .btn-group { display: flex; gap: 8px; }
    .btn {
      background: ${primaryAccent}; color: #fff; border: none;
      padding: 9px 14px; border-radius: 10px; font-weight: 800; font-size: 13px;
      cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
    }
    .btn:active { transform: scale(0.95); }
    .btn-secondary { background: #1e253d; color: #e2e8f0; border: 1px solid #2e385b; }
    .input-box {
      display: flex; gap: 8px; background: #131728; border: 1px solid #242b47;
      border-radius: 12px; padding: 8px;
    }
    .input-box input {
      flex: 1; background: transparent; border: none; color: #fff;
      font-size: 13px; padding: 6px 8px; outline: none;
    }
    .list-card {
      background: #131728; border: 1px solid #222944; border-radius: 12px;
      padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px;
    }
    .list-left { display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 600; color: #e2e8f0; }
    .dot { width: 8px; height: 8px; border-radius: 4px; background: ${secondaryAccent}; flex-shrink: 0; }
    .del-item { background: rgba(239,68,68,0.14); color: #f87171; border: none; width: 28px; height: 28px; border-radius: 8px; cursor: pointer; }
    .bottom-nav {
      height: 62px; background: #101422; border-top: 1px solid #1e253e;
      display: grid; grid-template-columns: repeat(4, 1fr);
    }
    .nav-item {
      background: transparent; border: none; color: #64748b;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 4px; font-size: 11px; font-weight: 700; cursor: pointer;
    }
    .nav-item i { font-size: 16px; }
    .nav-item.active { color: ${secondaryAccent}; }
    .toast {
      position: fixed; bottom: 76px; left: 50%; transform: translateX(-50%);
      background: #10b981; color: #fff; padding: 8px 16px; border-radius: 999px;
      font-size: 12px; font-weight: 800; display: none; z-index: 999;
      box-shadow: 0 6px 20px rgba(0,0,0,0.45);
    }
  </style>
</head>
<body>
  <div class="app-bar">
    <div class="app-bar-left">
      ${
        appLogoUrl
          ? `<img class="app-logo" src="${appLogoUrl}" alt="Logo">`
          : `<div class="app-logo">${(safeTitle || 'A').charAt(0)}</div>`
      }
      <div class="app-title">${safeTitle}</div>
    </div>
    <span class="runtime-pill">${runtimeBadge}</span>
  </div>

  <div class="screen-body">
    <!-- TAB 0: HOME -->
    <div class="tab-pane active" id="tab-0">
      <div class="hero-card">
        <div class="hero-label">${isFlutterApp ? 'Flutter MaterialApp' : 'Android MainActivity'}</div>
        <div class="hero-heading">${safeTitle}</div>
        <div class="hero-sub">Interactive ${isFlutterApp ? 'Flutter Dart' : 'Android Kotlin/XML'} application with live state, components, and navigation.</div>
        <div class="counter-row">
          <div>
            <div style="font-size:11px;color:#94a3b8;font-weight:700;">STATE VALUE</div>
            <div class="counter-val" id="counterVal">0</div>
          </div>
          <div class="btn-group">
            <button class="btn btn-secondary" onclick="updateCount(-1)">-</button>
            <button class="btn" onclick="updateCount(1)"><i class="fas fa-plus"></i> Increment</button>
          </div>
        </div>
      </div>

      <div class="input-box">
        <input type="text" id="newItemInput" placeholder="Add new item or action..." />
        <button class="btn" onclick="addItem()">Add</button>
      </div>

      <div id="itemsContainer" style="display:flex;flex-direction:column;gap:8px;"></div>
    </div>

    <!-- TAB 1: EXPLORE / WIDGETS -->
    <div class="tab-pane" id="tab-1">
      <div class="hero-card">
        <div class="hero-label">UI Components</div>
        <div class="hero-heading">Interactive Controls</div>
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:12px;">
          <button class="btn" style="width:100%;justify-content:center;" onclick="showToast('Primary Action Executed ✓')">
            <i class="fas fa-bolt"></i> Execute Primary Action
          </button>
          <button class="btn btn-secondary" style="width:100%;justify-content:center;" onclick="showToast('Data Synced Successfully ✓')">
            <i class="fas fa-arrows-rotate"></i> Sync Application Data
          </button>
        </div>
      </div>
    </div>

    <!-- TAB 2: ACTIVITY / FORM -->
    <div class="tab-pane" id="tab-2">
      <div class="hero-card">
        <div class="hero-label">User Form</div>
        <div class="hero-heading">Quick Submit</div>
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:10px;">
          <div class="input-box"><input type="text" id="formName" placeholder="Enter Name or Title..." /></div>
          <div class="input-box"><input type="text" id="formNote" placeholder="Enter Details..." /></div>
          <button class="btn" style="width:100%;justify-content:center;" onclick="submitForm()">
            <i class="fas fa-paper-plane"></i> Submit Record
          </button>
        </div>
      </div>
    </div>

    <!-- TAB 3: SETTINGS -->
    <div class="tab-pane" id="tab-3">
      <div class="list-card" onclick="showToast('Notifications Toggled ✓')">
        <div class="list-left"><i class="fas fa-bell" style="color:${secondaryAccent};"></i><span>Push Notifications</span></div>
        <span style="color:#10b981;font-size:12px;font-weight:800;">ENABLED</span>
      </div>
      <div class="list-card" onclick="showToast('Offline Cache Cleared ✓')">
        <div class="list-left"><i class="fas fa-database" style="color:${secondaryAccent};"></i><span>Local Storage & Cache</span></div>
        <span style="color:#94a3b8;font-size:12px;font-weight:700;">ACTIVE</span>
      </div>
      <div class="list-card">
        <div class="list-left"><i class="fas fa-code" style="color:${secondaryAccent};"></i><span>Entry File: ${fileName || (isFlutterApp ? 'main.dart' : 'MainActivity.kt')}</span></div>
      </div>
    </div>
  </div>

  <div class="toast" id="appToast"></div>

  <div class="bottom-nav">
    <button class="nav-item active" onclick="switchTab(0, this)"><i class="fas fa-house"></i><span>Home</span></button>
    <button class="nav-item" onclick="switchTab(1, this)"><i class="fas fa-compass"></i><span>Explore</span></button>
    <button class="nav-item" onclick="switchTab(2, this)"><i class="fas fa-square-plus"></i><span>Create</span></button>
    <button class="nav-item" onclick="switchTab(3, this)"><i class="fas fa-sliders"></i><span>Settings</span></button>
  </div>

  <script>
    var count = 0;
    var items = ${safeItemsJson};
    function showToast(msg) {
      var t = document.getElementById('appToast');
      t.textContent = msg;
      t.style.display = 'block';
      clearTimeout(window._tTimer);
      window._tTimer = setTimeout(function() { t.style.display = 'none'; }, 1800);
    }
    function updateCount(delta) {
      count += delta;
      document.getElementById('counterVal').textContent = count;
    }
    function renderItems() {
      var c = document.getElementById('itemsContainer');
      c.innerHTML = items.map(function(txt, idx) {
        return '<div class="list-card"><div class="list-left"><span class="dot"></span><span>' +
          txt.replace(/</g, '&lt;') +
          '</span></div><button class="del-item" onclick="removeItem(' + idx + ')">✕</button></div>';
      }).join('');
    }
    function addItem() {
      var inp = document.getElementById('newItemInput');
      if (!inp.value.trim()) return;
      items.unshift(inp.value.trim());
      inp.value = '';
      renderItems();
      showToast('Added ✓');
    }
    function removeItem(idx) {
      items.splice(idx, 1);
      renderItems();
    }
    function submitForm() {
      var n = document.getElementById('formName');
      var d = document.getElementById('formNote');
      if (n.value.trim()) {
        items.unshift(n.value.trim() + (d.value.trim() ? ' — ' + d.value.trim() : ''));
        n.value = ''; d.value = '';
        renderItems();
        switchTab(0, document.querySelectorAll('.nav-item')[0]);
        showToast('Saved to Home ✓');
      } else {
        showToast('Enter a title first');
      }
    }
    function switchTab(idx, btn) {
      document.querySelectorAll('.tab-pane').forEach(function(el, i) {
        el.classList.toggle('active', i === idx);
      });
      document.querySelectorAll('.nav-item').forEach(function(el) {
        el.classList.remove('active');
      });
      if (btn) btn.classList.add('active');
    }
    renderItems();
  </script>
</body>
</html>`;
}

/**
 * Generate a single preview Data URL (128x128) for the app's logo:
 * - If user attached a custom logo from gallery, return that exact logo.
 * - Otherwise, return the fixed default ANDROID signature logo.
 */
export function generateAppLogoPreviewDataUrl(
  _category: AppCategory,
  _appTitle: string,
  userGalleryLogoUrl?: string | null
): string {
  if (userGalleryLogoUrl) return userGalleryLogoUrl;
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  drawFixedDefaultAppIcon(ctx, 128);
  return canvas.toDataURL('image/png');
}

/**
 * Generate adaptive Android launcher icons for all 5 densities (48, 72, 96, 144, 192).
 * - If user attached a custom logo, draw their custom logo on all 5 densities.
 * - If no custom logo is attached, draw the fixed default ANDROID signature logo on all 5 densities.
 */
export async function generateAppIconByDensity(
  _category: AppCategory,
  _appTitle: string,
  userGalleryLogoUrl?: string | null
): Promise<{
  density48: string;
  density72: string;
  density96: string;
  density144: string;
  density192: string;
}> {
  const sizes = [48, 72, 96, 144, 192];
  const results: Record<number, string> = {};

  let userImg: HTMLImageElement | null = null;
  if (userGalleryLogoUrl) {
    userImg = await new Promise<HTMLImageElement | null>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = userGalleryLogoUrl;
    });
  }

  for (const size of sizes) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    if (userImg) {
      drawSquircle(ctx, 0, 0, size, size, size * 0.22);
      ctx.save();
      ctx.clip();
      ctx.drawImage(userImg, 0, 0, size, size);
      ctx.restore();

      // Premium glowing blue border around the app logo
      const pad = Math.max(1.5, size * 0.04);
      drawSquircle(ctx, pad, pad, size - pad * 2, size - pad * 2, size * 0.22 * 0.88);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = Math.max(2, size * 0.045);
      ctx.stroke();
    } else {
      drawFixedDefaultAppIcon(ctx, size);
    }

    const dataUrl = canvas.toDataURL('image/png');
    results[size] = dataUrl.split(',')[1] || '';
  }

  return {
    density48: results[48] || '',
    density72: results[72] || '',
    density96: results[96] || '',
    density144: results[144] || '',
    density192: results[192] || '',
  };
}

function drawSquircle(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Draw ONE fixed, signature default ANDROID App Icon whenever the user has not selected a custom gallery logo.
 * Features a sleek deep-slate & royal-blue squircle badge with the signature emerald Android robot head & code brackets.
 */
function drawFixedDefaultAppIcon(ctx: CanvasRenderingContext2D, size: number) {
  const r = size * 0.22;

  // 1. Rich deep royal-slate background squircle
  const bgGrad = ctx.createLinearGradient(0, 0, size, size);
  bgGrad.addColorStop(0, '#0f172a');
  bgGrad.addColorStop(0.5, '#1e293b');
  bgGrad.addColorStop(1, '#090d16');
  drawSquircle(ctx, 0, 0, size, size, r);
  ctx.fillStyle = bgGrad;
  ctx.fill();

  // 2. Crisp glowing inner border
  const pad = Math.max(1.5, size * 0.04);
  drawSquircle(ctx, pad, pad, size - pad * 2, size - pad * 2, r * 0.88);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = Math.max(1.5, size * 0.035);
  ctx.stroke();

  // 3. Signature Android Emerald Robot Head Dome in the center
  const cx = size * 0.5;
  const domeY = size * 0.54;
  const domeR = size * 0.27;

  // Left & Right Antennae
  ctx.strokeStyle = '#3DDC84';
  ctx.lineWidth = Math.max(2, size * 0.048);
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(cx - domeR * 0.48, domeY - domeR * 0.72);
  ctx.lineTo(cx - domeR * 0.82, domeY - domeR * 1.18);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + domeR * 0.48, domeY - domeR * 0.72);
  ctx.lineTo(cx + domeR * 0.82, domeY - domeR * 1.18);
  ctx.stroke();

  // Semicircle Head Dome
  const headGrad = ctx.createLinearGradient(cx - domeR, domeY - domeR, cx + domeR, domeY + domeR * 0.4);
  headGrad.addColorStop(0, '#4ade80');
  headGrad.addColorStop(1, '#16a34a');
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(cx, domeY, domeR, Math.PI, 0, false);
  ctx.lineTo(cx + domeR, domeY + domeR * 0.22);
  ctx.quadraticCurveTo(cx + domeR, domeY + domeR * 0.36, cx + domeR * 0.85, domeY + domeR * 0.36);
  ctx.lineTo(cx - domeR * 0.85, domeY + domeR * 0.36);
  ctx.quadraticCurveTo(cx - domeR, domeY + domeR * 0.36, cx - domeR, domeY + domeR * 0.22);
  ctx.closePath();
  ctx.fill();

  // Eyes (Two crisp white circles)
  const eyeR = Math.max(1.5, size * 0.032);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx - domeR * 0.42, domeY - domeR * 0.32, eyeR, 0, Math.PI * 2);
  ctx.arc(cx + domeR * 0.42, domeY - domeR * 0.32, eyeR, 0, Math.PI * 2);
  ctx.fill();

  // Bottom cyan code badge bar ("</>")
  ctx.fillStyle = '#38bdf8';
  ctx.font = `900 ${Math.max(8, Math.floor(size * 0.18))}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('</>', cx, size * 0.79);
}

/**
 * Detect whether the app is currently running inside the installed standalone Android APK WebView
 * (where WebViewAssetLoader serves from https://caniwebview.local or file:///android_asset).
 */
export function isStandaloneApkEnv(): boolean {
  if (typeof window === 'undefined') return false;
  const host = (window.location.hostname || '').toLowerCase();
  const proto = window.location.protocol || '';
  return (
    host === 'caniwebview.local' ||
    proto === 'file:' ||
    window.location.origin === 'null' ||
    !host
  );
}

const DEFAULT_SHARED_BACKEND_URL = 'https://ais-pre-xgf4i2kjcmnedt4sv7hsju-780995200000.asia-southeast1.run.app';
const DEFAULT_DEV_BACKEND_URL = 'https://ais-dev-xgf4i2kjcmnedt4sv7hsju-780995200000.asia-southeast1.run.app';

/**
 * Return the live backend URL when running inside the installed Android APK, or '' for relative same-origin requests.
 */
export function getLiveBackendUrl(): string {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    if (origin && origin !== 'null' && !origin.includes('caniwebview.local') && !origin.startsWith('file:')) {
      return origin;
    }
    const injected = (window as any).__ANDROID_IDE_BACKEND_URL__;
    if (typeof injected === 'string' && injected.startsWith('http')) {
      return injected.replace(/\/+$/, '');
    }
  }
  return DEFAULT_SHARED_BACKEND_URL;
}

/**
 * Return ordered candidate backend base URLs so installed Android APKs automatically fall back
 * between injected origin, shared URL, and dev URL if one is asleep or unreachable.
 */
export function getCandidateBackendUrls(): string[] {
  if (!isStandaloneApkEnv()) {
    return [''];
  }
  const primary = getLiveBackendUrl();
  const candidates = [primary, DEFAULT_SHARED_BACKEND_URL, DEFAULT_DEV_BACKEND_URL].filter(
    (u, idx, arr) => Boolean(u) && arr.indexOf(u) === idx
  );
  return candidates.length > 0 ? candidates : [DEFAULT_SHARED_BACKEND_URL];
}

/**
 * Fetch from backend API with automatic multi-origin fallback when running inside the installed Android APK.
 */
export async function fetchWithBackendFallback(
  apiPath: string,
  init?: RequestInit
): Promise<{ response: Response; apiBase: string }> {
  const candidates = getCandidateBackendUrls();
  let lastError: any = null;

  for (const base of candidates) {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 5000) : null;
    try {
      const resp = await fetch(`${base}${apiPath}`, {
        ...init,
        ...(controller ? { signal: controller.signal } : {}),
      });
      if (timeoutId) clearTimeout(timeoutId);
      const contentType = (resp.headers.get('content-type') || '').toLowerCase();
      // Reject HTML login/interstitial responses when expecting JSON or binary API responses
      const isUnexpectedHtml = contentType.includes('text/html') && apiPath.startsWith('/api/');
      if ((resp.ok && !isUnexpectedHtml) || candidates.length === 1) {
        if (isStandaloneApkEnv() && base && typeof window !== 'undefined') {
          (window as any).__ANDROID_IDE_BACKEND_URL__ = base;
        }
        return { response: resp, apiBase: base };
      }
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);
      lastError = err;
    }
  }
  if (lastError) throw lastError;
  const fallbackBase = candidates[0] || '';
  const response = await fetch(`${fallbackBase}${apiPath}`, init);
  return { response: response, apiBase: fallbackBase };
}

/**
 * Compress a UTF-8 string with raw DEFLATE and encode as URL-safe base64url for direct GET APK/ZIP building.
 */
export async function compressStringToBase64Url(input: string): Promise<{ z: string; compressed: boolean }> {
  try {
    if (typeof CompressionStream !== 'undefined') {
      const bytes = new TextEncoder().encode(input);
      const cs = new CompressionStream('deflate-raw');
      const writer = cs.writable.getWriter();
      writer.write(bytes);
      writer.close();
      const compressedBuf = await new Response(cs.readable).arrayBuffer();
      const u8 = new Uint8Array(compressedBuf);
      let bin = '';
      for (let i = 0; i < u8.length; i++) {
        bin += String.fromCharCode(u8[i]);
      }
      const b64url = btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      return { z: b64url, compressed: true };
    }
  } catch {}
  const bytes = new TextEncoder().encode(input);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  const b64url = btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return { z: b64url, compressed: false };
}

/**
 * Trigger a browser download from an in-memory Blob URL or direct HTTP GET URL.
 */
export function triggerDirectUrlDownload(downloadUrl: string, fileName: string): void {
  if (typeof document === 'undefined') return;
  try {
    if (isStandaloneApkEnv() && (downloadUrl.startsWith('http://') || downloadUrl.startsWith('https://'))) {
      window.location.href = downloadUrl;
      return;
    }
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName;
    a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      try {
        if (a.parentNode) a.parentNode.removeChild(a);
      } catch {}
    }, 5000);
  } catch (err) {
    console.error('Download trigger error:', err);
  }
}

/**
 * Create a long-lived (15-minute) in-memory Blob URL in web browsers,
 * or a direct HTTP GET download URL when running inside the installed Android APK WebView.
 */
export async function triggerReliableDownload(options: {
  textData?: string;
  base64Data?: string;
  blob?: Blob;
  fileName: string;
  contentType?: string;
  autoTrigger?: boolean;
}): Promise<{ downloadUrl: string; fileName: string }> {
  const { fileName, contentType = 'application/octet-stream', autoTrigger = true } = options;

  // Always prefer server-backed HTTP GET download URL (/api/download-custom-apk/:buildId/:fileName)
  // so Android Chrome (including inside AI Studio preview iframe) and Android DownloadManager handle it natively.
  try {
    let b64Payload = options.base64Data || '';
    if (!b64Payload && options.blob && options.blob.size < 12 * 1024 * 1024) {
      const ab = await options.blob.arrayBuffer();
      const u8 = new Uint8Array(ab);
      const chunkSize = 0x8000;
      const chunks: string[] = [];
      for (let i = 0; i < u8.length; i += chunkSize) {
        chunks.push(String.fromCharCode.apply(null, Array.from(u8.subarray(i, i + chunkSize))));
      }
      b64Payload = btoa(chunks.join(''));
    }
    if ((b64Payload && b64Payload.length < 16 * 1024 * 1024) || options.textData) {
      const { response: prepResp, apiBase: resolvedBase } = await fetchWithBackendFallback('/api/prepare-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Data: b64Payload || undefined,
          textData: options.textData || undefined,
          fileName,
          contentType,
        }),
      });
      if (prepResp.ok) {
        const prepJson = await prepResp.json();
        if (prepJson && prepJson.downloadUrl) {
          const fullUrl = `${resolvedBase}${prepJson.downloadUrl}`;
          if (autoTrigger) {
            triggerDirectUrlDownload(fullUrl, fileName);
          }
          return { downloadUrl: fullUrl, fileName };
        }
      }
    }
  } catch {}

  const apiBase = getLiveBackendUrl();

  // Inside installed Android APK WebView: fallback to direct GET download route if POST failed
  if (isStandaloneApkEnv()) {
    const rawText = options.textData || '';
    if (rawText) {
      const compactText = rawText.replace(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]{2000,}/g, '');
      const { z, compressed } = await compressStringToBase64Url(compactText);
      const safeZ = z.length <= 8000 ? z : '';
      const directUrl = `${apiBase}/api/download-file-direct?name=${encodeURIComponent(fileName)}&mime=${encodeURIComponent(contentType)}&c=${compressed ? '1' : '0'}&z=${encodeURIComponent(safeZ)}`;
      if (autoTrigger) {
        triggerDirectUrlDownload(directUrl, fileName);
      }
      return { downloadUrl: directUrl, fileName };
    } else if (options.base64Data && options.base64Data.length < 8000) {
      const b64url = options.base64Data.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const directUrl = `${apiBase}/api/download-file-direct?name=${encodeURIComponent(fileName)}&mime=${encodeURIComponent(contentType)}&b64=1&z=${encodeURIComponent(b64url)}`;
      if (autoTrigger) {
        triggerDirectUrlDownload(directUrl, fileName);
      }
      return { downloadUrl: directUrl, fileName };
    }
  }

  let blobToUse: Blob;
  if (options.blob) {
    blobToUse = options.blob;
  } else if (options.base64Data) {
    const binStr = atob(options.base64Data);
    const bytes = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) {
      bytes[i] = binStr.charCodeAt(i);
    }
    blobToUse = new Blob([bytes], { type: contentType });
  } else {
    blobToUse = new Blob([options.textData || ''], { type: contentType });
  }

  const blobUrl = URL.createObjectURL(blobToUse);
  if (autoTrigger) {
    triggerDirectUrlDownload(blobUrl, fileName);
  }
  setTimeout(() => {
    try {
      URL.revokeObjectURL(blobUrl);
    } catch {}
  }, 15 * 60 * 1000);
  return { downloadUrl: blobUrl, fileName };
}
