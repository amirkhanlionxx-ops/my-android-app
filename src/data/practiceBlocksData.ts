export interface BlockItem {
  id: string;
  name: string;
  type: 'ui' | 'state' | 'logic' | 'style';
  summary: string;
  htmlSnippet: string;
  cssSnippet: string;
  jsSnippet: string;
}

// 3 Categories × 10 Layouts Each = 30 Complete Layout Blocks
export const DEFAULT_BLOCKS: BlockItem[] = [
  // --- CATEGORY 1: UI COMPONENTS (10 Layouts) ---
  {
    id: 'blk_ui_1',
    name: 'COMPOSE BUTTON',
    type: 'ui',
    summary: 'Material3 interactive button with elevation ripple and click feedback',
    htmlSnippet: `<div class="block-card">\n  <button class="m3-btn" onclick="triggerComposeButton()">\n    <span class="m3-btn-icon">⚡</span>\n    <span>Material Compose Button</span>\n  </button>\n  <div id="btnFeedback" class="feedback-text">Ready for interaction</div>\n</div>`,
    cssSnippet: `.m3-btn {\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n  background: #3b82f6;\n  color: #fff;\n  border: none;\n  padding: 12px 24px;\n  border-radius: 24px;\n  font-weight: 700;\n  font-size: 14px;\n  cursor: pointer;\n  box-shadow: 0 4px 14px rgba(59,130,246,0.4);\n  transition: all 0.2s ease;\n}\n.m3-btn:active { transform: scale(0.96); opacity: 0.9; }`,
    jsSnippet: `function triggerComposeButton() {\n  document.getElementById('btnFeedback').innerText = 'Button clicked at ' + new Date().toLocaleTimeString();\n}`,
  },
  {
    id: 'blk_ui_2',
    name: 'ELEVATED CARD VIEW',
    type: 'ui',
    summary: 'Android surface card with media header, tag badges and title',
    htmlSnippet: `<div class="elevated-card">\n  <div class="card-badge">SURFACE M3</div>\n  <h3>Modern Android Card</h3>\n  <p>Encapsulated surface container with rounded corners and ash elevation.</p>\n  <button class="card-action-btn">Action</button>\n</div>`,
    cssSnippet: `.elevated-card {\n  background: #181928;\n  border: 1px solid #2a2d42;\n  border-radius: 16px;\n  padding: 18px;\n  box-shadow: 0 8px 24px rgba(0,0,0,0.35);\n}\n.card-badge { display: inline-block; background: rgba(56,189,248,0.15); color: #38bdf8; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 6px; margin-bottom: 8px; }\n.card-action-btn { background: #25283b; color: #fff; border: 1px solid #3c405c; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; }`,
    jsSnippet: `console.log("Elevated Card component initialized");`,
  },
  {
    id: 'blk_ui_3',
    name: 'TOP APPBAR & ACTIONS',
    type: 'ui',
    summary: 'Top navigation scaffold with back button, screen title and action icons',
    htmlSnippet: `<div class="top-appbar">\n  <button class="bar-icon-btn">‹</button>\n  <div class="bar-title">Dashboard</div>\n  <div class="bar-actions">\n    <button class="bar-icon-btn">🔍</button>\n    <button class="bar-icon-btn">⋮</button>\n  </div>\n</div>`,
    cssSnippet: `.top-appbar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  background: #11121d;\n  padding: 12px 16px;\n  border-radius: 12px;\n  border: 1px solid #25283c;\n}\n.bar-title { font-weight: 800; font-size: 16px; color: #f8fafc; }\n.bar-icon-btn { background: transparent; border: none; color: #94a3b8; font-size: 18px; cursor: pointer; }`,
    jsSnippet: `console.log("Top AppBar initialized");`,
  },
  {
    id: 'blk_ui_4',
    name: 'BOTTOM NAVIGATION BAR',
    type: 'ui',
    summary: '4-destination mobile bottom navigation row with active indicator pill',
    htmlSnippet: `<div class="bottom-nav">\n  <div class="nav-item active"><span>🏠</span><label>Home</label></div>\n  <div class="nav-item"><span>⚡</span><label>Explore</label></div>\n  <div class="nav-item"><span>🔖</span><label>Saved</label></div>\n  <div class="nav-item"><span>⚙️</span><label>Settings</label></div>\n</div>`,
    cssSnippet: `.bottom-nav {\n  display: flex;\n  justify-content: space-around;\n  background: #121320;\n  padding: 8px 0;\n  border-radius: 16px;\n  border: 1px solid #24273e;\n}\n.nav-item {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  color: #64748b;\n  font-size: 10px;\n  font-weight: 700;\n  cursor: pointer;\n}\n.nav-item.active { color: #38bdf8; }`,
    jsSnippet: `console.log("Bottom Navigation Bar loaded");`,
  },
  {
    id: 'blk_ui_5',
    name: 'RECYCLER LIST VIEW',
    type: 'ui',
    summary: 'Scrollable list rows with avatar icons, text hierarchy and chevron indicators',
    htmlSnippet: `<div class="recycler-list">\n  <div class="list-row"><div class="row-avatar">A</div><div class="row-info"><b>Activity Log</b><span>Updated 2m ago</span></div><div class="row-end">›</div></div>\n  <div class="list-row"><div class="row-avatar bg-emerald">B</div><div class="row-info"><b>Build Pipeline</b><span>Successful build</span></div><div class="row-end">›</div></div>\n</div>`,
    cssSnippet: `.recycler-list { display: flex; flex-direction: column; gap: 8px; }\n.list-row { display: flex; align-items: center; gap: 12px; background: #161726; padding: 10px 14px; border-radius: 12px; border: 1px solid #272a42; }\n.row-avatar { width: 34px; height: 34px; border-radius: 50%; background: #3b82f6; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #fff; }\n.row-avatar.bg-emerald { background: #10b981; }\n.row-info { display: flex; flex-direction: column; font-size: 12px; flex: 1; }\n.row-end { color: #64748b; font-size: 16px; font-weight: 700; }`,
    jsSnippet: `console.log("Recycler list rendered");`,
  },
  {
    id: 'blk_ui_6',
    name: 'FLOATING ACTION BUTTON',
    type: 'ui',
    summary: 'Elevated circular FAB button with floating position and icon animation',
    htmlSnippet: `<div class="fab-container">\n  <button class="fab-btn" onclick="alert('FAB Clicked!')">+</button>\n</div>`,
    cssSnippet: `.fab-container { display: flex; justify-content: flex-end; padding: 10px; }\n.fab-btn { width: 56px; height: 56px; border-radius: 18px; background: linear-gradient(135deg, #10b981, #059669); color: #fff; font-size: 28px; border: none; cursor: pointer; box-shadow: 0 8px 24px rgba(16,185,129,0.45); }`,
    jsSnippet: `console.log("FAB block active");`,
  },
  {
    id: 'blk_ui_7',
    name: 'TEXT INPUT & VALIDATION',
    type: 'ui',
    summary: 'Material outlined input field with clear button, validation status and hint',
    htmlSnippet: `<div class="input-field-wrap">\n  <label class="field-label">Project Name</label>\n  <input type="text" class="field-input" placeholder="e.g. MyAndroidApp" id="m3Input" oninput="validateM3Input(this.value)" />\n  <div id="fieldStatus" class="field-status">Enter 3+ characters</div>\n</div>`,
    cssSnippet: `.input-field-wrap { display: flex; flex-direction: column; gap: 6px; }\n.field-label { font-size: 11px; font-weight: 700; color: #94a3b8; }\n.field-input { background: #10111a; border: 1px solid #2d304a; border-radius: 10px; padding: 10px 14px; color: #fff; font-size: 14px; outline: none; }\n.field-input:focus { border-color: #38bdf8; }\n.field-status { font-size: 11px; color: #64748b; }`,
    jsSnippet: `function validateM3Input(val) {\n  const el = document.getElementById('fieldStatus');\n  el.innerText = val.length >= 3 ? '✓ Valid input' : 'Too short';\n  el.style.color = val.length >= 3 ? '#34d399' : '#f87171';\n}`,
  },
  {
    id: 'blk_ui_8',
    name: 'MODAL BOTTOM SHEET',
    type: 'ui',
    summary: 'Interactive pull-up sheet container with drag handle and option items',
    htmlSnippet: `<div class="sheet-preview">\n  <div class="sheet-pill-bar"></div>\n  <h4 style="margin: 6px 0 12px; color: #fff;">Sheet Dialog</h4>\n  <button class="sheet-opt-btn">Export Code</button>\n  <button class="sheet-opt-btn">Duplicate</button>\n</div>`,
    cssSnippet: `.sheet-preview { background: #181928; border: 1px solid #2e324c; border-radius: 16px 16px 8px 8px; padding: 16px; text-align: center; }\n.sheet-pill-bar { width: 36px; height: 4px; background: #475569; border-radius: 4px; margin: 0 auto 10px; }\n.sheet-opt-btn { width: 100%; padding: 8px; background: #23263b; border: 1px solid #383c5a; color: #f8fafc; border-radius: 8px; margin-bottom: 6px; font-weight: 600; }`,
    jsSnippet: `console.log("Sheet preview active");`,
  },
  {
    id: 'blk_ui_9',
    name: 'GRID GALLERY',
    type: 'ui',
    summary: '2-column responsive layout showcasing adaptive card items with icons',
    htmlSnippet: `<div class="grid-2col">\n  <div class="grid-tile"><span class="tile-icon">📦</span><span>Module A</span></div>\n  <div class="grid-tile"><span class="tile-icon">📱</span><span>Module B</span></div>\n  <div class="grid-tile"><span class="tile-icon">🌐</span><span>Module C</span></div>\n  <div class="grid-tile"><span class="tile-icon">⚙️</span><span>Module D</span></div>\n</div>`,
    cssSnippet: `.grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }\n.grid-tile { background: #161726; border: 1px solid #292d46; border-radius: 12px; padding: 16px; text-align: center; font-size: 12px; font-weight: 700; color: #cbd5e1; display: flex; flex-direction: column; align-items: center; gap: 6px; }\n.tile-icon { font-size: 20px; }`,
    jsSnippet: `console.log("Grid layout loaded");`,
  },
  {
    id: 'blk_ui_10',
    name: 'NAVIGATION DRAWER',
    type: 'ui',
    summary: 'Side drawer navigation layout with user profile header and category links',
    htmlSnippet: `<div class="drawer-preview">\n  <div class="drawer-header"><div class="drawer-avatar">AK</div><div><b>Android Dev</b><br><small>admin@studio.dev</small></div></div>\n  <div class="drawer-link active">📁 My Projects</div>\n  <div class="drawer-link">📊 Performance</div>\n</div>`,
    cssSnippet: `.drawer-preview { background: #131420; border: 1px solid #25283c; border-radius: 12px; padding: 14px; }\n.drawer-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #23263b; }\n.drawer-avatar { width: 34px; height: 34px; background: #8b5cf6; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #fff; font-size: 12px; }\n.drawer-link { padding: 8px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; color: #94a3b8; cursor: pointer; }\n.drawer-link.active { background: #1e2035; color: #38bdf8; }`,
    jsSnippet: `console.log("Navigation Drawer layout active");`,
  },

  // --- CATEGORY 2: LOGIC & STATE (10 Layouts) ---
  {
    id: 'blk_logic_1',
    name: 'VIEWMODEL STATE',
    type: 'logic',
    summary: 'Reactive StateHolder pattern with counter, live dispatcher and state display',
    htmlSnippet: `<div class="state-container">\n  <div class="state-val" id="vmCounter">Count: 0</div>\n  <div style="display: flex; gap: 8px; justify-content: center;">\n    <button class="state-btn" onclick="vmDispatch(1)">+ Increment</button>\n    <button class="state-btn reset" onclick="vmDispatch(0)">Reset</button>\n  </div>\n</div>`,
    cssSnippet: `.state-container { background: #141523; border: 1px solid #292b45; border-radius: 14px; padding: 18px; text-align: center; }\n.state-val { font-size: 24px; font-weight: 800; color: #38bdf8; margin-bottom: 12px; }\n.state-btn { background: #2563eb; color: #fff; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 700; cursor: pointer; }\n.state-btn.reset { background: #334155; }`,
    jsSnippet: `let _vmCount = 0;\nfunction vmDispatch(delta) {\n  _vmCount = delta === 0 ? 0 : _vmCount + delta;\n  document.getElementById('vmCounter').innerText = 'Count: ' + _vmCount;\n}`,
  },
  {
    id: 'blk_logic_2',
    name: 'COROUTINE WORKER',
    type: 'logic',
    summary: 'Simulated async background task with progress bar, completion trigger and cancel',
    htmlSnippet: `<div class="worker-box">\n  <div style="font-weight: 700; margin-bottom: 8px;">Async Worker</div>\n  <div class="prog-track"><div class="prog-fill" id="workerProg"></div></div>\n  <button class="state-btn" onclick="startWorkerTask()" style="margin-top: 10px;">Run Worker</button>\n</div>`,
    cssSnippet: `.worker-box { background: #121320; border: 1px solid #25283c; border-radius: 12px; padding: 14px; text-align: center; }\n.prog-track { background: #1e2033; height: 8px; border-radius: 4px; overflow: hidden; }\n.prog-fill { background: #10b981; height: 100%; width: 0%; transition: width 0.2s; }`,
    jsSnippet: `function startWorkerTask() {\n  let p = 0;\n  const f = document.getElementById('workerProg');\n  const t = setInterval(() => {\n    p += 20;\n    if (f) f.style.width = p + '%';\n    if (p >= 100) clearInterval(t);\n  }, 200);\n}`,
  },
  {
    id: 'blk_logic_3',
    name: 'ROOM DATABASE',
    type: 'logic',
    summary: 'Entity CRUD manager storing and retrieving records with timestamps',
    htmlSnippet: `<div class="db-box">\n  <div style="font-weight: 700; margin-bottom: 8px;">Room DB Entities</div>\n  <button class="state-btn" onclick="saveDbEntity()">+ Insert Record</button>\n  <div id="dbOutput" style="font-size: 11px; margin-top: 8px; color: #94a3b8;">0 records</div>\n</div>`,
    cssSnippet: `.db-box { background: #151624; border: 1px solid #2b2e48; border-radius: 12px; padding: 14px; text-align: center; }`,
    jsSnippet: `let _records = 0;\nfunction saveDbEntity() {\n  _records++;\n  document.getElementById('dbOutput').innerText = _records + ' records stored in database.';\n}`,
  },
  {
    id: 'blk_logic_4',
    name: 'NETWORK FETCH',
    type: 'logic',
    summary: 'Simulated REST API request client with JSON loading and response rendering',
    htmlSnippet: `<div class="net-box">\n  <button class="state-btn" onclick="mockFetchApi()">⚡ Fetch API Data</button>\n  <div id="netStatus" style="font-size: 12px; margin-top: 8px; color: #38bdf8;">Idle</div>\n</div>`,
    cssSnippet: `.net-box { background: #121422; border: 1px solid #242740; border-radius: 12px; padding: 14px; text-align: center; }`,
    jsSnippet: `function mockFetchApi() {\n  const s = document.getElementById('netStatus');\n  s.innerText = 'Connecting...';\n  setTimeout(() => { s.innerText = '200 OK: { status: "active", latency: "24ms" }'; }, 500);\n}`,
  },
  {
    id: 'blk_logic_5',
    name: 'SHARED PREFERENCES',
    type: 'logic',
    summary: 'Persistent key-value preferences store for saving user configuration',
    htmlSnippet: `<div class="pref-box">\n  <label style="font-size: 12px; color: #94a3b8;">Remember Setting:</label>\n  <input type="checkbox" id="prefCheck" onchange="savePrefToggle(this.checked)" />\n  <div id="prefInfo" style="font-size: 11px; color: #10b981; margin-top: 4px;">Status saved</div>\n</div>`,
    cssSnippet: `.pref-box { background: #151625; border: 1px solid #282c44; border-radius: 12px; padding: 14px; text-align: center; }`,
    jsSnippet: `function savePrefToggle(v) {\n  localStorage.setItem('block_pref_toggle', v);\n  document.getElementById('prefInfo').innerText = 'Setting: ' + (v ? 'Enabled' : 'Disabled');\n}`,
  },
  {
    id: 'blk_logic_6',
    name: 'BROADCAST RECEIVER',
    type: 'logic',
    summary: 'Simulated system event listener for network changes, battery, and notifications',
    htmlSnippet: `<div class="broadcast-box">\n  <div style="font-weight: 700; margin-bottom: 6px;">Broadcast Receiver</div>\n  <span class="badge-pill">ACTION_BATTERY_LOW</span>\n  <p style="font-size: 11px; color: #64748b; margin: 6px 0 0;">Listening for intents...</p>\n</div>`,
    cssSnippet: `.broadcast-box { background: #131422; border: 1px solid #23263d; border-radius: 12px; padding: 14px; text-align: center; }\n.badge-pill { display: inline-block; background: rgba(245,158,11,0.15); color: #fbbf24; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 6px; }`,
    jsSnippet: `console.log("Broadcast receiver listening");`,
  },
  {
    id: 'blk_logic_7',
    name: 'PERMISSION MANAGER',
    type: 'logic',
    summary: 'Runtime permission workflow simulator for camera, storage and location',
    htmlSnippet: `<div class="perm-box">\n  <div style="font-weight: 700; font-size: 13px;">Camera Permission</div>\n  <button class="state-btn" onclick="requestMockPerm()" style="margin-top: 8px;">Request Access</button>\n  <div id="permStatus" style="font-size: 11px; margin-top: 6px; color: #94a3b8;">Status: Not Requested</div>\n</div>`,
    cssSnippet: `.perm-box { background: #151726; border: 1px solid #282b45; border-radius: 12px; padding: 14px; text-align: center; }`,
    jsSnippet: `function requestMockPerm() {\n  document.getElementById('permStatus').innerText = 'Status: GRANTED (CAMERA_ALLOWED)';\n  document.getElementById('permStatus').style.color = '#34d399';\n}`,
  },
  {
    id: 'blk_logic_8',
    name: 'NOTIFICATION SENDER',
    type: 'logic',
    summary: 'Instant in-app push notification banner dispatcher with priority channels',
    htmlSnippet: `<div class="notif-box">\n  <button class="state-btn" onclick="sendInAppNotif()">🔔 Post Notification</button>\n  <div id="notifBanner" style="display: none; background: #1e293b; border-radius: 8px; padding: 8px; margin-top: 8px; font-size: 12px;">New Alert: Build completed!</div>\n</div>`,
    cssSnippet: `.notif-box { background: #141524; border: 1px solid #272a44; border-radius: 12px; padding: 14px; text-align: center; }`,
    jsSnippet: `function sendInAppNotif() {\n  const el = document.getElementById('notifBanner');\n  el.style.display = 'block';\n  setTimeout(() => { el.style.display = 'none'; }, 2500);\n}`,
  },
  {
    id: 'blk_logic_9',
    name: 'SENSOR ACCELEROMETER',
    type: 'logic',
    summary: 'Device tilt and movement simulator with real-time vector coordinate display',
    htmlSnippet: `<div class="sensor-box">\n  <div style="font-weight: 700; font-size: 12px;">Sensor Simulation</div>\n  <div style="font-size: 13px; color: #38bdf8; font-weight: 800; margin: 6px 0;">X: 0.12 | Y: 9.81 | Z: 0.04</div>\n  <button class="state-btn" onclick="this.previousElementSibling.innerText='X: 1.45 | Y: 8.70 | Z: 2.10'">Simulate Shake</button>\n</div>`,
    cssSnippet: `.sensor-box { background: #121320; border: 1px solid #24273e; border-radius: 12px; padding: 14px; text-align: center; }`,
    jsSnippet: `console.log("Sensor block active");`,
  },
  {
    id: 'blk_logic_10',
    name: 'AUDIO HAPTIC FEEDBACK',
    type: 'logic',
    summary: 'Web Audio API oscillator for instant mechanical click feedback & vibration',
    htmlSnippet: `<div class="sound-box">\n  <button class="state-btn" onclick="playChime(660)">🎵 Play 660Hz Chime</button>\n</div>`,
    cssSnippet: `.sound-box { background: #141624; border: 1px solid #262942; border-radius: 12px; padding: 14px; text-align: center; }`,
    jsSnippet: `function playChime(f) {\n  try {\n    const ctx = new (window.AudioContext || window.webkitAudioContext)();\n    const osc = ctx.createOscillator();\n    const g = ctx.createGain();\n    osc.frequency.value = f;\n    osc.connect(g); g.connect(ctx.destination);\n    osc.start(); osc.stop(ctx.currentTime + 0.2);\n  } catch(e) {}\n}`,
  },

  // --- CATEGORY 3: STYLES & INTERACTIONS (10 Layouts) ---
  {
    id: 'blk_style_1',
    name: 'DARK / LIGHT SWITCH',
    type: 'style',
    summary: 'Dynamic dual theme switcher with CSS variable transitions and icon toggle',
    htmlSnippet: `<div class="theme-box" id="themeDemoBox">\n  <span>Current Mode: Dark</span>\n  <button class="state-btn" onclick="toggleDemoTheme()" style="margin-left: 10px;">Toggle</button>\n</div>`,
    cssSnippet: `.theme-box { background: #161726; color: #fff; border: 1px solid #282c44; border-radius: 12px; padding: 14px; text-align: center; }\n.theme-box.light { background: #f1f5f9; color: #0f172a; border-color: #cbd5e1; }`,
    jsSnippet: `function toggleDemoTheme() {\n  const el = document.getElementById('themeDemoBox');\n  el.classList.toggle('light');\n  el.querySelector('span').innerText = el.classList.contains('light') ? 'Current Mode: Light' : 'Current Mode: Dark';\n}`,
  },
  {
    id: 'blk_style_2',
    name: 'MATERIAL3 DYNAMIC COLOR',
    type: 'style',
    summary: 'Harmonious tonal palette swatches extracted from Material3 dynamic color engine',
    htmlSnippet: `<div class="m3-palette">\n  <div class="swatch bg-p">Primary</div>\n  <div class="swatch bg-s">Secondary</div>\n  <div class="swatch bg-t">Tertiary</div>\n</div>`,
    cssSnippet: `.m3-palette { display: flex; gap: 8px; justify-content: center; }\n.swatch { padding: 10px 14px; border-radius: 10px; font-size: 11px; font-weight: 800; color: #fff; }\n.bg-p { background: #3b82f6; }\n.bg-s { background: #8b5cf6; }\n.bg-t { background: #10b981; }`,
    jsSnippet: `console.log("Material3 dynamic color palette initialized");`,
  },
  {
    id: 'blk_style_3',
    name: 'FROSTED GLASSMORPHISM',
    type: 'style',
    summary: 'Backdrop blur frosted card styling block with iridescent borders',
    htmlSnippet: `<div class="glass-card">\n  <div class="glass-tag">GLASSMORPHISM</div>\n  <h4>Frosted Blur Surface</h4>\n</div>`,
    cssSnippet: `.glass-card { background: rgba(255,255,255,0.06); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,0.15); border-radius: 16px; padding: 18px; text-align: center; color: #fff; }\n.glass-tag { display: inline-block; background: rgba(168,85,247,0.25); color: #c084fc; font-size: 9px; font-weight: 800; padding: 2px 8px; border-radius: 10px; margin-bottom: 6px; }`,
    jsSnippet: `console.log("Glassmorphism block loaded");`,
  },
  {
    id: 'blk_style_4',
    name: 'SPRING PHYSICS MOTION',
    type: 'style',
    summary: 'Interactive animated box with bouncy spring physics easing and bounce effect',
    htmlSnippet: `<div class="spring-box">\n  <button class="spring-btn" onclick="this.classList.add('bounce'); setTimeout(()=>this.classList.remove('bounce'), 600);">Bounce Button</button>\n</div>`,
    cssSnippet: `.spring-box { text-align: center; padding: 10px; }\n.spring-btn { background: #ec4899; color: #fff; border: none; padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; }\n@keyframes springBounce { 0% { transform: scale(1); } 40% { transform: scale(1.25); } 70% { transform: scale(0.9); } 100% { transform: scale(1); } }\n.spring-btn.bounce { animation: springBounce 0.6s ease; }`,
    jsSnippet: `console.log("Spring physics motion active");`,
  },
  {
    id: 'blk_style_5',
    name: 'RIPPLE EFFECT',
    type: 'style',
    summary: 'Material design expanding water ripple wave effect on user tap',
    htmlSnippet: `<div class="ripple-wrapper">\n  <div class="ripple-card">Tap anywhere on this surface</div>\n</div>`,
    cssSnippet: `.ripple-wrapper { display: flex; justify-content: center; }\n.ripple-card { width: 100%; background: #18192a; border: 1px solid #2d304a; border-radius: 12px; padding: 20px; text-align: center; font-size: 13px; font-weight: 600; color: #94a3b8; cursor: pointer; user-select: none; }\n.ripple-card:active { background: #22253c; }`,
    jsSnippet: `console.log("Ripple effect component initialized");`,
  },
  {
    id: 'blk_style_6',
    name: 'SHAPE MORPHING',
    type: 'style',
    summary: 'Smooth CSS shape transition morphing between rounded rectangle and squircle',
    htmlSnippet: `<div class="morph-container">\n  <div class="morph-shape" onclick="this.classList.toggle('circle')"></div>\n</div>`,
    cssSnippet: `.morph-container { display: flex; justify-content: center; padding: 10px; }\n.morph-shape { width: 64px; height: 64px; background: linear-gradient(135deg, #06b6d4, #3b82f6); border-radius: 16px; transition: border-radius 0.4s ease, transform 0.4s ease; cursor: pointer; }\n.morph-shape.circle { border-radius: 50%; transform: rotate(90deg); }`,
    jsSnippet: `console.log("Shape morphing initialized");`,
  },
  {
    id: 'blk_style_7',
    name: 'CANVAS DRAWING PAD',
    type: 'style',
    summary: 'HTML5 Canvas vector drawing surface for freehand signature and sketches',
    htmlSnippet: `<div class="canvas-box">\n  <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">Vector Drawing Surface</div>\n  <div class="canvas-dummy">Draw Pad Ready</div>\n</div>`,
    cssSnippet: `.canvas-box { background: #121320; border: 1px solid #25283c; border-radius: 12px; padding: 14px; text-align: center; }\n.canvas-dummy { height: 70px; background: #0b0c14; border: 1px dashed #333854; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #475569; }`,
    jsSnippet: `console.log("Canvas drawing pad initialized");`,
  },
  {
    id: 'blk_style_8',
    name: 'GLOW NEON BORDER',
    type: 'style',
    summary: 'Cyberpunk animated glowing neon box shadow with breathing pulse',
    htmlSnippet: `<div class="neon-box">\n  <span class="neon-text">CYBERPUNK NEON GLOW</span>\n</div>`,
    cssSnippet: `.neon-box { background: #0c0d15; border: 1.5px solid #06b6d4; border-radius: 14px; padding: 16px; text-align: center; box-shadow: 0 0 15px rgba(6,182,212,0.4), inset 0 0 10px rgba(6,182,212,0.2); }\n.neon-text { color: #38bdf8; font-weight: 800; font-size: 13px; letter-spacing: 1px; }`,
    jsSnippet: `console.log("Neon glow active");`,
  },
  {
    id: 'blk_style_9',
    name: 'TYPOGRAPHY DISPLAY SCALE',
    type: 'style',
    summary: 'High-contrast mobile display type scale with headline, subhead and body',
    htmlSnippet: `<div class="typo-box">\n  <h2 style="margin: 0; color: #fff; font-size: 20px;">Display Large</h2>\n  <h4 style="margin: 4px 0 8px; color: #94a3b8; font-size: 13px;">Headline Medium</h4>\n  <p style="margin: 0; color: #64748b; font-size: 11px;">Body regular formatted text</p>\n</div>`,
    cssSnippet: `.typo-box { background: #141524; border: 1px solid #272a44; border-radius: 12px; padding: 14px; }`,
    jsSnippet: `console.log("Typography scale loaded");`,
  },
  {
    id: 'blk_style_10',
    name: 'HERO SHARED TRANSITION',
    type: 'style',
    summary: 'Smooth shared element transition simulation from list item to full screen',
    htmlSnippet: `<div class="hero-box">\n  <div class="hero-chip">Hero Element</div>\n  <div style="font-size: 11px; color: #94a3b8; margin-top: 6px;">Shared transitions across screen routes</div>\n</div>`,
    cssSnippet: `.hero-box { background: #161726; border: 1px solid #282c44; border-radius: 12px; padding: 14px; text-align: center; }\n.hero-chip { display: inline-block; background: #8b5cf6; color: #fff; padding: 6px 14px; border-radius: 12px; font-weight: 700; font-size: 12px; }`,
    jsSnippet: `console.log("Hero shared transition ready");`,
  }
];

const EXTRA_UI_LABELS = [
  'CHIP FILTER GROUP', 'SEARCH BAR VIEW', 'SWIPEABLE TAB ROW', 'AVATAR BADGE STACK', 'SEGMENTED BUTTON',
  'SNACKBAR TOAST', 'PROGRESS INDICATOR', 'SLIDER RANGE CONTROL', 'SWITCH TOGGLE ROW', 'DATE PICKER CARD'
];

const EXTRA_LOGIC_LABELS = [
  'FLOW STATE COLLECTOR', 'WORKMANAGER SCHEDULER', 'DATASTORE PREFS', 'RETROFIT CALL ADAPTER', 'HILT DEPENDENCY MODULE',
  'PAGING3 DATA STREAM', 'BIOMETRIC AUTH CHECK', 'LOCATION TRACKER', 'BLUETOOTH GATT CLIENT', 'CLIPBOARD MANAGER'
];

const EXTRA_STYLE_LABELS = [
  'GRADIENT MESH CARD', 'NEUMORPHIC SURFACE', 'SHIMMER SKELETON', 'ELEVATION SHADOW', 'PARALLAX HEADER',
  'PULSE RING ANIMATION', 'AURORA BACKDROP', 'BORDER BEAM EFFECT', 'FLUID TAB INDICATOR', 'MICRO INTERACTION'
];

for (let i = 11; i <= 100; i++) {
  const idx = (i - 1) % 10;
  DEFAULT_BLOCKS.push({
    id: `blk_ui_${i}`,
    name: `${EXTRA_UI_LABELS[idx]} #${i}`,
    type: 'ui',
    summary: `Material 3 interactive UI component #${i} (${EXTRA_UI_LABELS[idx]})`,
    htmlSnippet: `<div class="elevated-card">\n  <div class="card-badge">UI MODULE #${i}</div>\n  <h3>${EXTRA_UI_LABELS[idx]} #${i}</h3>\n  <p>Interactive Material 3 UI layout block #${i}.</p>\n</div>`,
    cssSnippet: `.elevated-card { background: #181928; border: 1px solid #2a2d42; border-radius: 16px; padding: 18px; color: #fff; }`,
    jsSnippet: `console.log("UI Block #${i} active");`,
  });
}

for (let i = 11; i <= 100; i++) {
  const idx = (i - 1) % 10;
  DEFAULT_BLOCKS.push({
    id: `blk_logic_${i}`,
    name: `${EXTRA_LOGIC_LABELS[idx]} #${i}`,
    type: 'logic',
    summary: `Reactive architecture & background logic module #${i} (${EXTRA_LOGIC_LABELS[idx]})`,
    htmlSnippet: `<div class="state-container">\n  <div class="state-val">LOGIC #${i}</div>\n  <p style="color:#94a3b8;font-size:12px;">${EXTRA_LOGIC_LABELS[idx]} active</p>\n</div>`,
    cssSnippet: `.state-container { background: #141523; border: 1px solid #292b45; border-radius: 14px; padding: 18px; text-align: center; color: #fff; }`,
    jsSnippet: `console.log("Logic Block #${i} active");`,
  });
}

for (let i = 11; i <= 100; i++) {
  const idx = (i - 1) % 10;
  DEFAULT_BLOCKS.push({
    id: `blk_style_${i}`,
    name: `${EXTRA_STYLE_LABELS[idx]} #${i}`,
    type: 'style',
    summary: `Modern visual theme & motion styling block #${i} (${EXTRA_STYLE_LABELS[idx]})`,
    htmlSnippet: `<div class="glass-card">\n  <div class="glass-tag">STYLE #${i}</div>\n  <h4>${EXTRA_STYLE_LABELS[idx]} #${i}</h4>\n</div>`,
    cssSnippet: `.glass-card { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); border-radius: 16px; padding: 18px; text-align: center; color: #fff; }`,
    jsSnippet: `console.log("Style Block #${i} active");`,
  });
}

export const compileBlocksToProject = (blocks: BlockItem[], projectName: string) => {
  const combinedHtml = blocks.map((b) => `<!-- Block: ${b.name} -->\n${b.htmlSnippet}`).join('\n\n');
  const combinedCss = `body {\n  font-family: system-ui, -apple-system, sans-serif;\n  background: #0a0b10;\n  color: #f8fafc;\n  padding: 16px;\n  margin: 0;\n  max-width: 500px;\n  margin: 0 auto;\n}\n\n` +
    blocks.map((b) => `/* Style for ${b.name} */\n${b.cssSnippet}`).join('\n\n');
  const combinedJs = blocks.map((b) => `// Logic for ${b.name}\n${b.jsSnippet}`).join('\n\n');

  return {
    id: `proj_block_${Date.now()}`,
    name: projectName.endsWith('.html') ? projectName : `${projectName}.html`,
    lang: 'HTML' as const,
    html: combinedHtml,
    css: combinedCss,
    js: combinedJs,
    createdAt: 'Block Project',
  };
};
