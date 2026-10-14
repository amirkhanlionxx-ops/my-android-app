import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FileNode, ToolItem } from '../types';
import { SwipeableFileItem } from './SwipeableFileItem';
import { persistFolderExpansion } from '../utils/folderPersistence';
import { ensureApkDownloadFolder, isUserCreatedNode } from '../data/initialFileSystem';
import { AiCodeAssistantModal } from './AiCodeAssistantModal';
import {
  detectAppCategory,
  compileAppToStandaloneHtml,
  validateFileOpenForCode,
  resolveEffectiveAppName,
  generateAppLogoPreviewDataUrl,
  triggerReliableDownload,
} from '../utils/appCompiler';
import { renderHighlightedLines } from '../utils/syntaxHighlight';

interface EditorScreenProps {
  projectTitle: string;
  appLogoUrl: string | null;
  onSetAppLogo: (url: string) => void;
  onChangeProjectTitle: (newTitle: string) => void;
  fileSystem: FileNode[];
  onUpdateFileSystem: (newFs: FileNode[]) => void;
  openFiles?: FileNode[];
  onCloseFileTab?: (fileId: string) => void;
  activeFile: FileNode | null;
  onSelectFile: (file: FileNode) => void;
  code: string;
  onChangeCode: (newCode: string) => void;
  tools: ToolItem[];
  fontSize: number;
  onSaveCode: () => void;
  onCopyCode: () => void;
  onRunCode: () => void;
  consoleOutput: string;
  isRunModalOpen: boolean;
  onCloseRunModal: () => void;
  onOpenCreateModal: () => void;
  onDownloadApk: (customPayload?: any) => void;
  onDownloadIdeApk?: () => void;
  onDownloadZip: () => void;
  onBackToDashboard: () => void;
  onTriggerTool: (tool: ToolItem) => void;
  onShowAlert: (msg: string) => void;
  onNewProject: () => void;
  initialAction?: 'export' | 'import' | 'save' | null;
  onClearInitialAction?: () => void;
}

import {
  DEFAULT_ROW1_SYMBOLS,
  DEFAULT_ROW2_SYMBOLS,
  alignSymbolPairs,
  UI_TOKEN_SET,
  CODE_KEYWORD_SET,
} from '../utils/symbolConstants';

const BUILTIN_CODE_SUGGESTIONS = [
  { name: 'TopBar', type: 'ui' as const, snippet: '<TopBar title="App Title" onBack={() => {}} />', desc: 'Top Navigation Bar' },
  { name: 'BottomBar', type: 'ui' as const, snippet: '<BottomBar items={navItems} activeIndex={0} />', desc: 'Bottom Navigation Bar' },
  { name: 'SearchBar', type: 'ui' as const, snippet: '<SearchBar placeholder="Search..." onSearch={(q) => {}} />', desc: 'Search Input Bar' },
  { name: 'CoinBalance', type: 'ui' as const, snippet: 'val coinBalance: Int = 100\n// Coin & Wallet balance badge widget', desc: 'Coin & Wallet Balance Badge' },
  { name: 'Drawer', type: 'ui' as const, snippet: '<Drawer isOpen={isDrawerOpen} onClose={() => {}} />', desc: 'Side Sliding Drawer' },
  { name: 'TabBar', type: 'ui' as const, snippet: '<TabBar tabs={["Home", "Profile", "Settings"]} onSelect={(i) => {}} />', desc: 'Tab Switcher Bar' },
  { name: 'Sidebar', type: 'ui' as const, snippet: '<Sidebar width={280} isOpen={true} />', desc: 'Sidebar Panel' },
  { name: 'NavBar', type: 'ui' as const, snippet: '<NavBar brand="My App" />', desc: 'App Header Nav' },
  { name: 'FloatingBtn', type: 'ui' as const, snippet: '<FloatingActionButton icon="+" onClick={() => {}} />', desc: 'Floating Action Button' },
  { name: 'ActionMenu', type: 'ui' as const, snippet: '<ActionMenu items={options} onSelect={() => {}} />', desc: 'Action Menu Popup' },
  { name: 'Header', type: 'ui' as const, snippet: '<Header title="Screen Header" subtitle="Overview" />', desc: 'Screen Header' },
  { name: 'Footer', type: 'ui' as const, snippet: '<Footer copyright="© 2025 Android Studio" />', desc: 'Footer Component' },
  { name: 'CardView', type: 'ui' as const, snippet: '<CardView elevation={4}>\n  <Text>Card Content</Text>\n</CardView>', desc: 'Card View Container' },
  { name: 'Container', type: 'ui' as const, snippet: '<Container padding={16}>\n  \n</Container>', desc: 'Layout Container' },
  { name: 'Column', type: 'ui' as const, snippet: 'Column(modifier = Modifier.fillMaxWidth()) {\n  \n}', desc: 'Vertical Column Layout' },
  { name: 'Row', type: 'ui' as const, snippet: 'Row(modifier = Modifier.fillMaxWidth()) {\n  \n}', desc: 'Horizontal Row Layout' },
  { name: 'Button', type: 'ui' as const, snippet: '<Button onClick={() => {}}>\n  Click Me\n</Button>', desc: 'Standard Button' },
  { name: 'Text', type: 'ui' as const, snippet: 'Text(text = "Hello World", fontSize = 16.sp)', desc: 'Text View' },
  { name: 'Icon', type: 'ui' as const, snippet: '<Icon name="star" size={24} color="#FFD700" />', desc: 'Vector Icon' },
  { name: 'Image', type: 'ui' as const, snippet: '<Image src="assets/logo.png" width={100} height={100} />', desc: 'Image Widget' },
  { name: 'Scaffold', type: 'ui' as const, snippet: 'Scaffold(\n  topBar = { TopBar() },\n  content = { ScreenContent() }\n)', desc: 'Scaffold Layout Structure' },
  { name: 'Widget', type: 'ui' as const, snippet: 'Widget build(BuildContext context) {\n  return Container();\n}', desc: 'Widget Builder Method' },
  { name: 'StatefulWidget', type: 'ui' as const, snippet: 'class MyWidget extends StatefulWidget {\n  @override\n  State<MyWidget> createState() => _MyWidgetState();\n}', desc: 'Stateful Widget Class' },
  { name: 'StatelessWidget', type: 'ui' as const, snippet: 'class MyWidget extends StatelessWidget {\n  @override\n  Widget build(BuildContext context) {\n    return Container();\n  }\n}', desc: 'Stateless Widget Class' },
  { name: 'Box', type: 'ui' as const, snippet: 'Box(modifier = Modifier.fillMaxSize()) {\n  \n}', desc: 'Box Layout Container' },
  { name: 'Spacer', type: 'ui' as const, snippet: 'Spacer(modifier = Modifier.height(16.dp))', desc: 'Layout Spacer' },
  { name: 'build()', type: 'code' as const, snippet: '@override\nWidget build(BuildContext context) {\n  return \n}', desc: 'Build Method' },
  { name: 'setState()', type: 'code' as const, snippet: 'setState(() {\n  // State update\n});', desc: 'State Mutation' },
  { name: 'fun', type: 'code' as const, snippet: 'fun functionName(param: String): Boolean {\n    return true\n}', desc: 'Function Declaration' },
  { name: 'val', type: 'code' as const, snippet: 'val variableName: String = "value"', desc: 'Immutable Value' },
  { name: 'var', type: 'code' as const, snippet: 'var mutableCounter: Int = 0', desc: 'Mutable Variable' },
  { name: 'class', type: 'code' as const, snippet: 'class ClassName {\n    // Class properties and methods\n}', desc: 'Class Declaration' },
  { name: 'useState()', type: 'code' as const, snippet: 'const [state, setState] = useState(initialValue);', desc: 'State Hook' },
  { name: 'useEffect()', type: 'code' as const, snippet: 'useEffect(() => {\n  // Side effect logic\n  return () => {};\n}, []);', desc: 'Effect Hook' },
  { name: 'print()', type: 'code' as const, snippet: 'print("Debug value: $val")', desc: 'Print Output' },
  { name: 'println()', type: 'code' as const, snippet: 'println("Execution complete")', desc: 'Println With Newline' },
  { name: 'console.log()', type: 'code' as const, snippet: 'console.log("Debug log:", data);', desc: 'Browser Console Log' },
  { name: 'Log.d()', type: 'code' as const, snippet: 'Log.d("APP_TAG", "Debug message");', desc: 'Android Logcat' },
  { name: '@Composable', type: 'code' as const, snippet: '@Composable\nfun MyComposableScreen() {\n    \n}', desc: 'Jetpack Compose Screen' },
  { name: 'Modifier', type: 'code' as const, snippet: 'Modifier.fillMaxSize().padding(16.dp)', desc: 'Compose Modifier' }
];

export const EditorScreen: React.FC<EditorScreenProps> = ({
  projectTitle,
  appLogoUrl,
  onSetAppLogo,
  onChangeProjectTitle,
  fileSystem,
  onUpdateFileSystem,
  openFiles = [],
  onCloseFileTab,
  activeFile,
  onSelectFile,
  code,
  onChangeCode,
  tools,
  fontSize,
  onSaveCode,
  onCopyCode,
  onRunCode,
  consoleOutput,
  isRunModalOpen,
  onCloseRunModal,
  onOpenCreateModal,
  onDownloadApk,
  onDownloadIdeApk,
  onDownloadZip,
  onBackToDashboard,
  onTriggerTool,
  onShowAlert,
  onNewProject,
  initialAction,
  onClearInitialAction,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isImportDropdownOpen, setIsImportDropdownOpen] = useState(false);
  const [isDownloadDropdownOpen, setIsDownloadDropdownOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const [toolSearchQuery, setToolSearchQuery] = useState('');
  const [codeSearchQuery, setCodeSearchQuery] = useState('');

  // Handle direct navigation action triggered from Dashboard
  useEffect(() => {
    if (!initialAction) return;

    if (initialAction === 'export') {
      setIsSidebarOpen(true);
      setIsDownloadDropdownOpen(true);
      setIsImportDropdownOpen(false);
      setIsProjectDropdownOpen(false);
      setIsToolsDropdownOpen(false);
    } else if (initialAction === 'import') {
      setIsSidebarOpen(true);
      setIsImportDropdownOpen(true);
      setIsDownloadDropdownOpen(false);
      setIsProjectDropdownOpen(false);
      setIsToolsDropdownOpen(false);
    } else if (initialAction === 'save') {
      onSaveCode();
      onShowAlert('Project code saved successfully!');
    }

    onClearInitialAction?.();
  }, [initialAction]);

  // Mobile Swipe-to-Collapse gesture on the sidebar
  const sidebarTouchStartRef = useRef<{ x: number; y: number } | null>(null);
  const handleSidebarTouchStart = (e: React.TouchEvent) => {
    sidebarTouchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };
  const handleSidebarTouchEnd = (e: React.TouchEvent) => {
    if (!sidebarTouchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - sidebarTouchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - sidebarTouchStartRef.current.y;
    sidebarTouchStartRef.current = null;
    if (dx < -40 && Math.abs(dx) > Math.abs(dy)) {
      setIsSidebarOpen(false);
    }
  };

  // Undo / Redo History
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const isUndoRedoActiveRef = useRef(false);

  // Modals for Create Folder & Create File (In-app, no window.prompt)
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderNameInput, setNewFolderNameInput] = useState('');
  const [isCreateFileModalOpenLocal, setIsCreateFileModalOpenLocal] = useState(false);
  const [newFileNameInput, setNewFileNameInput] = useState('');

  // Project Rename Modal
  const [isRenameProjectModalOpen, setIsRenameProjectModalOpen] = useState(false);
  const [renameProjectInput, setRenameProjectInput] = useState('');

  // Node Rename Modal
  const [isRenameNodeModalOpen, setIsRenameNodeModalOpen] = useState(false);
  const [renameNodeInput, setRenameNodeInput] = useState('');
  const [renameTargetNode, setRenameTargetNode] = useState<FileNode | null>(null);

  // Copy Options Floating Bar in Corner (Draggable)
  const [isCopyOptionsOpen, setIsCopyOptionsOpen] = useState(false);
  const [copyFloatingPos, setCopyFloatingPos] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingCopy, setIsDraggingCopy] = useState(false);
  const copyDragRef = useRef<{ startX: number; startY: number; initX: number; initY: number } | null>(null);

  // Target parent folder for creating files/folders inside specific nested folders
  const [targetParentFolderId, setTargetParentFolderId] = useState<string | null>(null);

  // Full Application Live Preview Modal (runs HTML/CSS/JS, Kotlin, Flutter, or multi-file app in realistic rendered screen)
  const [isFullAppPreviewOpen, setIsFullAppPreviewOpen] = useState(false);
  const [fullAppPreviewHtml, setFullAppPreviewHtml] = useState('');
  const [isDesktopPreviewMode, setIsDesktopPreviewMode] = useState(false);
  const [previewAppName, setPreviewAppName] = useState('');
  const [previewAppLogoUrl, setPreviewAppLogoUrl] = useState('');
  const [isPreviewMenuOpen, setIsPreviewMenuOpen] = useState(false);

  // Quick helper to open an existing file by name/extension from fileSystem or create & open it at the top bar
  const handleQuickOpenOrCreateFile = (targetName: string, defaultContent: string) => {
    const lowerTarget = targetName.toLowerCase();
    const ext = lowerTarget.includes('.') ? lowerTarget.slice(lowerTarget.lastIndexOf('.')) : '';

    const findMatching = (nodes: FileNode[]): FileNode | null => {
      for (const n of nodes) {
        if (n.type === 'file' && n.name.toLowerCase() === lowerTarget) return n;
        if (n.children) {
          const found = findMatching(n.children);
          if (found) return found;
        }
      }
      if (ext) {
        for (const n of nodes) {
          if (n.type === 'file' && n.name.toLowerCase().endsWith(ext)) return n;
          if (n.children) {
            const found = findMatching(n.children);
            if (found) return found;
          }
        }
      }
      return null;
    };

    const existing = findMatching(fileSystem);
    if (existing) {
      onSelectFile(existing);
      showCenterBigToast('FILE OPENED', existing.name, 'fa-file-code', 'save');
      return;
    }

    const newFile: FileNode = {
      id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: targetName,
      type: 'file',
      isDefault: false,
      content: defaultContent,
    };
    onUpdateFileSystem([...fileSystem, newFile]);
    onSelectFile(newFile);
    showCenterBigToast('FILE OPENED', newFile.name, 'fa-file-circle-plus', 'save');
  };

  // Samsung-style movable/draggable position ('bottom' or 'top')
  const [symbolBarPosition, setSymbolBarPosition] = useState<'bottom' | 'top'>('bottom');

  // 2-Row Symbol Bar with Guaranteed Alignment & Persistence
  const [row1Symbols, setRow1Symbols] = useState<string[]>(() => {
    try {
      const saved1 = localStorage.getItem('android_ide_symbols_v12_row1');
      const saved2 = localStorage.getItem('android_ide_symbols_v12_row2');
      if (saved1 && saved2) {
        const p1 = JSON.parse(saved1);
        const p2 = JSON.parse(saved2);
        if (Array.isArray(p1) && Array.isArray(p2) && p1.length === DEFAULT_ROW1_SYMBOLS.length) {
          const [aligned1] = alignSymbolPairs(p1, p2);
          return aligned1;
        }
      }
    } catch {}
    const [def1] = alignSymbolPairs(DEFAULT_ROW1_SYMBOLS, DEFAULT_ROW2_SYMBOLS);
    return def1;
  });

  const [row2Symbols, setRow2Symbols] = useState<string[]>(() => {
    try {
      const saved1 = localStorage.getItem('android_ide_symbols_v12_row1');
      const saved2 = localStorage.getItem('android_ide_symbols_v12_row2');
      if (saved1 && saved2) {
        const p1 = JSON.parse(saved1);
        const p2 = JSON.parse(saved2);
        if (Array.isArray(p1) && Array.isArray(p2) && p2.length === DEFAULT_ROW2_SYMBOLS.length) {
          const [, aligned2] = alignSymbolPairs(p1, p2);
          return aligned2;
        }
      }
    } catch {}
    const [, def2] = alignSymbolPairs(DEFAULT_ROW1_SYMBOLS, DEFAULT_ROW2_SYMBOLS);
    return def2;
  });

  const resetSymbolsToDefault = () => {
    setRow1Symbols([...DEFAULT_ROW1_SYMBOLS]);
    setRow2Symbols([...DEFAULT_ROW2_SYMBOLS]);
    try {
      localStorage.setItem('android_ide_symbols_v12_row1', JSON.stringify(DEFAULT_ROW1_SYMBOLS));
      localStorage.setItem('android_ide_symbols_v12_row2', JSON.stringify(DEFAULT_ROW2_SYMBOLS));
    } catch {}
    showCenterBigToast('Symbols Reset', 'Restored to clean default alignment', 'fa-arrow-rotate-right');
  };

  // Center Screen Big Alert HUD (Mobile screen center in large English letters)
  const [centerBigToast, setCenterBigToast] = useState<{
    title: string;
    sub?: string;
    icon: string;
    tone: 'save' | 'paste' | 'run';
  } | null>(null);
  const centerToastTimer = useRef<NodeJS.Timeout | null>(null);

  const showCenterBigToast = (
    title: string,
    sub?: string,
    icon = 'fa-check-circle',
    tone: 'save' | 'paste' | 'run' = 'save'
  ) => {
    if (centerToastTimer.current) clearTimeout(centerToastTimer.current);
    setCenterBigToast({ title, sub, icon, tone });
    centerToastTimer.current = setTimeout(() => {
      setCenterBigToast(null);
    }, 2000);
  };

  // AI Code Assistant & Generator Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiModalTab, setAiModalTab] = useState<'chat' | 'debug' | 'generate'>('chat');
  const [aiModalPrompt, setAiModalPrompt] = useState('');

  const handleApplyAiCode = (newCode: string, fileName?: string, runImmediately?: boolean) => {
    handleUserCodeChange(newCode);
    onSaveCode();
    showCenterBigToast('AI CODE APPLIED', fileName || 'Code Updated', 'fa-wand-magic-sparkles', 'save');
    onShowAlert('AI Code successfully applied to editor');
    if (runImmediately) {
      setTimeout(() => {
        onRunCode();
      }, 400);
    }
  };

  // Configurable Tab Spacing (Default: 4 - Standard Coding Indent, Configurable via 10s hold search box)
  const [tabSpaces, setTabSpaces] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('android_ide_tab_spaces_v2');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (parsed >= 1 && parsed <= 32) return parsed;
      }
    } catch {}
    return 4; // Most widely used indentation in coding (Java/Kotlin/Android/Python)
  });
  const [tabInputVal, setTabInputVal] = useState<string>('4');
  const [isTabConfigOpen, setIsTabConfigOpen] = useState(false);
  const [isTabHolding, setIsTabHolding] = useState(false);
  const [tabHoldSeconds, setTabHoldSeconds] = useState(10);
  const tabPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tabHoldIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tabHoldTriggeredRef = useRef<boolean>(false);

  // Smart Code & UI Search Autocomplete Suggestions Dropdown
  const [isSuggestionsDropdownOpen, setIsSuggestionsDropdownOpen] = useState(false);
  const searchBoxContainerRef = useRef<HTMLDivElement | null>(null);

  // Mobile App Icon Drag & Touch Displacement State (Supports 4-way: Left, Right, Up, Down)
  const [dragState, setDragState] = useState<{ row: 1 | 2; index: number; symbol: string } | null>(null);
  const touchDragRef = useRef<{
    row: 1 | 2;
    index: number;
    symbol: string;
    startX: number;
    startY: number;
    isDragging: boolean;
  } | null>(null);
  const lastTapTimeRef = useRef(0);

  // Dedicated File Share Modal (Native Web Share, Direct Download, Duplicate)
  const [shareModalNode, setShareModalNode] = useState<FileNode | null>(null);

  // File tree context action modal (Delete, Share, Rename, Protect)
  const [contextTargetNode, setContextTargetNode] = useState<FileNode | null>(null);
  // Node Delete Confirmation Modal (In-app, no window.confirm)
  const [deleteTargetNode, setDeleteTargetNode] = useState<FileNode | null>(null);
  const nodePressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineCounterRef = useRef<HTMLDivElement>(null);
  const syntaxBackdropRef = useRef<HTMLDivElement>(null);
  const codeHoldTimerRef = useRef<NodeJS.Timeout | null>(null);
  const codeTouchStartRef = useRef<{ x: number; y: number } | null>(null);
  const symbolScrollRef = useRef<HTMLDivElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Move Caret (Cursor) Left, Right, Up, Down inside the textarea
  const handleMoveCursor = (dir: 'left' | 'right' | 'up' | 'down') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.focus();
    const val = textarea.value;
    const start = textarea.selectionStart;

    if (dir === 'left') {
      const nextPos = Math.max(0, start - 1);
      textarea.setSelectionRange(nextPos, nextPos);
    } else if (dir === 'right') {
      const nextPos = Math.min(val.length, start + 1);
      textarea.setSelectionRange(nextPos, nextPos);
    } else if (dir === 'up') {
      const lines = val.substring(0, start).split('\n');
      const currentLineIdx = lines.length - 1;
      const currentCol = lines[currentLineIdx].length;

      if (currentLineIdx > 0) {
        const allLines = val.split('\n');
        const targetLine = allLines[currentLineIdx - 1];
        let pos = 0;
        for (let i = 0; i < currentLineIdx - 1; i++) {
          pos += allLines[i].length + 1;
        }
        const targetCol = Math.min(currentCol, targetLine.length);
        pos += targetCol;
        textarea.setSelectionRange(pos, pos);
      } else {
        textarea.setSelectionRange(0, 0);
      }
    } else if (dir === 'down') {
      const lines = val.substring(0, start).split('\n');
      const currentLineIdx = lines.length - 1;
      const currentCol = lines[currentLineIdx].length;
      const allLines = val.split('\n');

      if (currentLineIdx < allLines.length - 1) {
        let pos = 0;
        for (let i = 0; i <= currentLineIdx; i++) {
          pos += allLines[i].length + 1;
        }
        const targetLine = allLines[currentLineIdx + 1];
        const targetCol = Math.min(currentCol, targetLine.length);
        pos += targetCol;
        textarea.setSelectionRange(pos, pos);
      } else {
        textarea.setSelectionRange(val.length, val.length);
      }
    }
  };

  // Undo / Redo Execution (Direct and silent - No unwanted alert popups or visual artifacts)
  const handleUserCodeChange = (newCode: string) => {
    if (!isUndoRedoActiveRef.current && newCode !== code) {
      setUndoStack((prev) => [...prev.slice(-49), code]);
      setRedoStack([]);
    }
    isUndoRedoActiveRef.current = false;
    onChangeCode(newCode);
  };

  const handleUndo = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((s) => s.slice(0, s.length - 1));
    setRedoStack((r) => [...r.slice(-49), code]);
    isUndoRedoActiveRef.current = true;
    onChangeCode(prev);
    if (textareaRef.current && document.activeElement !== textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleRedo = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((r) => r.slice(0, r.length - 1));
    setUndoStack((s) => [...s.slice(-49), code]);
    isUndoRedoActiveRef.current = true;
    onChangeCode(next);
    if (textareaRef.current && document.activeElement !== textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // 4-Way Reordering (Left, Right, Up, Down between Row 1 and Row 2)
  const moveSymbol = (fromRow: 1 | 2, fromIdx: number, toRow: 1 | 2, toIdx: number) => {
    if (fromRow === toRow && fromIdx === toIdx) return;

    if (fromRow === 1 && toRow === 1) {
      const updated = [...row1Symbols];
      const [moved] = updated.splice(fromIdx, 1);
      updated.splice(toIdx, 0, moved);
      setRow1Symbols(updated);
    } else if (fromRow === 2 && toRow === 2) {
      const updated = [...row2Symbols];
      const [moved] = updated.splice(fromIdx, 1);
      updated.splice(toIdx, 0, moved);
      setRow2Symbols(updated);
    } else if (fromRow === 1 && toRow === 2) {
      // Moved from Row 1 DOWN to Row 2
      const r1 = [...row1Symbols];
      const r2 = [...row2Symbols];
      const [moved] = r1.splice(fromIdx, 1);
      r2.splice(toIdx, 0, moved);
      setRow1Symbols(r1);
      setRow2Symbols(r2);
    } else if (fromRow === 2 && toRow === 1) {
      // Moved from Row 2 UP to Row 1
      const r1 = [...row1Symbols];
      const r2 = [...row2Symbols];
      const [moved] = r2.splice(fromIdx, 1);
      r1.splice(toIdx, 0, moved);
      setRow1Symbols(r1);
      setRow2Symbols(r2);
    }
  };

  // Mouse Drag and Drop Reordering
  const handleSymbolDragStart = (e: React.DragEvent, row: 1 | 2, index: number, sym: string) => {
    setDragState({ row, index, symbol: sym });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${row}:${index}`);
  };

  const handleSymbolDragOver = (e: React.DragEvent, targetRow: 1 | 2, targetIdx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!dragState) return;
    if (dragState.row === targetRow && dragState.index === targetIdx) return;

    moveSymbol(dragState.row, dragState.index, targetRow, targetIdx);
    setDragState({ row: targetRow, index: targetIdx, symbol: dragState.symbol });
  };

  const handleSymbolDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragState(null);
    try {
      localStorage.setItem('android_ide_symbols_v10_row1', JSON.stringify(row1Symbols));
      localStorage.setItem('android_ide_symbols_v10_row2', JSON.stringify(row2Symbols));
    } catch {}
  };

  // Mobile App Icon Style Touch Reordering (Full 4-Way: Left, Right, Up, Down) & 5-Second Long-press for Tab
  const handleSymbolTouchStart = (e: React.TouchEvent, row: 1 | 2, index: number, sym: string) => {
    const touch = e.touches[0];
    touchDragRef.current = {
      row,
      index,
      symbol: sym,
      startX: touch.clientX,
      startY: touch.clientY,
      isDragging: false,
    };

    // 10-second long press for Tab spacing configuration with countdown feedback
    if (sym === 'Tab') {
      tabHoldTriggeredRef.current = false;
      setIsTabHolding(true);
      setTabHoldSeconds(10);
      if (tabPressTimerRef.current) clearTimeout(tabPressTimerRef.current);
      if (tabHoldIntervalRef.current) clearInterval(tabHoldIntervalRef.current);

      let countdown = 10;
      tabHoldIntervalRef.current = setInterval(() => {
        countdown -= 1;
        setTabHoldSeconds(Math.max(0, countdown));
        if (countdown <= 0) {
          if (tabHoldIntervalRef.current) clearInterval(tabHoldIntervalRef.current);
        }
      }, 1000);

      tabPressTimerRef.current = setTimeout(() => {
        tabHoldTriggeredRef.current = true;
        setIsTabHolding(false);
        if (tabHoldIntervalRef.current) clearInterval(tabHoldIntervalRef.current);
        setTabInputVal(String(tabSpaces));
        setIsTabConfigOpen(true);
      }, 10000);
    }
  };

  const handleSymbolTouchMove = (e: React.TouchEvent) => {
    if (!touchDragRef.current) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchDragRef.current.startX);
    const dy = Math.abs(touch.clientY - touchDragRef.current.startY);

    if (dx > 7 || dy > 7) {
      if (tabPressTimerRef.current) {
        clearTimeout(tabPressTimerRef.current);
        tabPressTimerRef.current = null;
      }
      if (tabHoldIntervalRef.current) {
        clearInterval(tabHoldIntervalRef.current);
        tabHoldIntervalRef.current = null;
      }
      setIsTabHolding(false);
    }

    if (!touchDragRef.current.isDragging) {
      if (dx > 7 || dy > 7) {
        touchDragRef.current.isDragging = true;
        setDragState({
          row: touchDragRef.current.row,
          index: touchDragRef.current.index,
          symbol: touchDragRef.current.symbol,
        });
      } else {
        return;
      }
    }

    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!elem) return;
    const btn = elem.closest('[data-symbol-key="true"]');
    if (!btn) return;
    const rowAttr = btn.getAttribute('data-row');
    const indexAttr = btn.getAttribute('data-index');
    if (rowAttr && indexAttr) {
      const targetRow = parseInt(rowAttr, 10) as 1 | 2;
      const targetIdx = parseInt(indexAttr, 10);
      if (touchDragRef.current.row !== targetRow || touchDragRef.current.index !== targetIdx) {
        moveSymbol(touchDragRef.current.row, touchDragRef.current.index, targetRow, targetIdx);
        touchDragRef.current.row = targetRow;
        touchDragRef.current.index = targetIdx;
        setDragState({
          row: targetRow,
          index: targetIdx,
          symbol: touchDragRef.current.symbol,
        });
      }
    }
  };

  const handleSymbolTouchEnd = (sym: string) => {
    if (tabPressTimerRef.current) {
      clearTimeout(tabPressTimerRef.current);
      tabPressTimerRef.current = null;
    }
    if (tabHoldIntervalRef.current) {
      clearInterval(tabHoldIntervalRef.current);
      tabHoldIntervalRef.current = null;
    }
    setIsTabHolding(false);

    if (touchDragRef.current) {
      const wasDragging = touchDragRef.current.isDragging;
      touchDragRef.current = null;
      setDragState(null);

      if (tabHoldTriggeredRef.current) {
        tabHoldTriggeredRef.current = false;
        return;
      }

      if (wasDragging) {
        try {
          localStorage.setItem('android_ide_symbols_v10_row1', JSON.stringify(row1Symbols));
          localStorage.setItem('android_ide_symbols_v10_row2', JSON.stringify(row2Symbols));
        } catch {}
      } else {
        lastTapTimeRef.current = Date.now();
        insertSymbol(sym);
      }
    }
  };

  const handleSymbolMouseDown = (sym: string) => {
    if (sym === 'Tab') {
      tabHoldTriggeredRef.current = false;
      setIsTabHolding(true);
      setTabHoldSeconds(10);
      if (tabPressTimerRef.current) clearTimeout(tabPressTimerRef.current);
      if (tabHoldIntervalRef.current) clearInterval(tabHoldIntervalRef.current);

      let countdown = 10;
      tabHoldIntervalRef.current = setInterval(() => {
        countdown -= 1;
        setTabHoldSeconds(Math.max(0, countdown));
        if (countdown <= 0) {
          if (tabHoldIntervalRef.current) clearInterval(tabHoldIntervalRef.current);
        }
      }, 1000);

      tabPressTimerRef.current = setTimeout(() => {
        tabHoldTriggeredRef.current = true;
        setIsTabHolding(false);
        if (tabHoldIntervalRef.current) clearInterval(tabHoldIntervalRef.current);
        setTabInputVal(String(tabSpaces));
        setIsTabConfigOpen(true);
      }, 10000);
    }
  };

  const handleSymbolMouseUp = (sym: string) => {
    if (sym === 'Tab') {
      if (tabPressTimerRef.current) {
        clearTimeout(tabPressTimerRef.current);
        tabPressTimerRef.current = null;
      }
      if (tabHoldIntervalRef.current) {
        clearInterval(tabHoldIntervalRef.current);
        tabHoldIntervalRef.current = null;
      }
      setIsTabHolding(false);
    }
  };

  const handleResetSymbols = () => {
    const [def1, def2] = alignSymbolPairs(DEFAULT_ROW1_SYMBOLS, DEFAULT_ROW2_SYMBOLS);
    setRow1Symbols(def1);
    setRow2Symbols(def2);
    try {
      localStorage.setItem('android_ide_symbols_v10_row1', JSON.stringify(def1));
      localStorage.setItem('android_ide_symbols_v10_row2', JSON.stringify(def2));
    } catch {}
    localStorage.removeItem('android_ide_symbols_v8_row1');
    localStorage.removeItem('android_ide_symbols_v8_row2');
    onShowAlert('Symbols reset to default layout');
  };

  // Persist folder expansion state (open/closed) whenever fileSystem changes
  useEffect(() => {
    persistFolderExpansion(fileSystem, projectTitle);
  }, [fileSystem, projectTitle]);

  // Synchronize scroll between textarea, line numbers, and syntax-highlighting backdrop
  const handleScroll = () => {
    if (textareaRef.current) {
      const top = textareaRef.current.scrollTop;
      const left = textareaRef.current.scrollLeft;
      if (lineCounterRef.current) {
        lineCounterRef.current.scrollTop = top;
      }
      if (syntaxBackdropRef.current) {
        syntaxBackdropRef.current.scrollTop = top;
        syntaxBackdropRef.current.scrollLeft = left;
      }
    }
  };

  const lineCount = Math.max(1, code.split('\n').length);

  // Insert symbol at cursor without keyboard bouncing or loss of focus
  const insertSymbol = (sym: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;

    // Retain focus without re-triggering virtual keyboard show/hide
    if (document.activeElement !== textarea) {
      textarea.focus();
    }

    const start = textarea.selectionStart ?? code.length;
    const end = textarea.selectionEnd ?? code.length;
    const selectedText = code.substring(start, end);

    let insertText = sym;
    let cursorOffset = sym.length;

    if (sym === 'Tab' || sym === '\\t') {
      const spaces = ' '.repeat(tabSpaces);
      insertText = spaces;
      cursorOffset = spaces.length;
    } else if (sym === '\\n') {
      insertText = '\n';
      cursorOffset = 1;
    } else if (sym === '␣') {
      insertText = ' ';
      cursorOffset = 1;
    } else if (selectedText.length > 0) {
      // Smart Auto-wrapping if user selected code
      const pairs: Record<string, [string, string]> = {
        '{}': ['{', '}'],
        '()': ['(', ')'],
        '[]': ['[', ']'],
        '<>': ['<', '>'],
        '""': ['"', '"'],
        "''": ["'", "'"],
        '``': ['`', '`'],
        '${}': ['${', '}'],
        '$()': ['$(', ')'],
        '#{}': ['#{', '}'],
        '{{}}': ['{{', '}}'],
        '<!-- -->': ['<!-- ', ' -->'],
        '/* */': ['/* ', ' */'],
      };
      if (pairs[sym]) {
        const [open, close] = pairs[sym];
        insertText = open + selectedText + close;
        cursorOffset = insertText.length;
      }
    } else {
      // Empty selection: for paired symbols or function wrappers, place cursor inside!
      const interiorOffsets: Record<string, number> = {
        '{}': 1,
        '()': 1,
        '[]': 1,
        '<>': 1,
        '""': 1,
        "''": 1,
        '``': 1,
        '${}': 2,
        '$()': 2,
        '#{}': 2,
        '{{}}': 2,
        '(( ))': 3,
        '[[ ]]': 3,
        '{{ }}': 3,
        '<< >>': 3,
        '<!-- -->': 5,
        '/* */': 3,
        'print()': 6,
        'println()': 8,
        'console.log()': 12,
        'Log.d()': 6,
        'build()': 6,
        'setState()': 9,
        'useState()': 9,
        'useEffect()': 10,
      };
      if (interiorOffsets[sym] !== undefined) {
        cursorOffset = interiorOffsets[sym];
      }
    }

    const before = code.substring(0, start);
    const after = code.substring(end);
    const newCode = before + insertText + after;
    handleUserCodeChange(newCode);

    const newCursorPos = start + cursorOffset;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    });
  };

  const scrollSymbols = (offset: number) => {
    if (symbolScrollRef.current) {
      symbolScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Clean Code Search Bar & Jump to Line
  const handleJumpToLine = (lineNum: number) => {
    if (!textareaRef.current) return;
    const lines = code.split('\n');
    let charIdx = 0;
    for (let i = 0; i < Math.min(lineNum - 1, lines.length); i++) {
      charIdx += lines[i].length + 1;
    }
    textareaRef.current.focus();
    const lineLength = lines[lineNum - 1]?.length || 0;
    textareaRef.current.setSelectionRange(charIdx, charIdx + lineLength);
    textareaRef.current.scrollTop = Math.max(0, (lineNum - 3) * 22);
  };

  const searchInCode = (query: string) => {
    setCodeSearchQuery(query);
    if (!query || !textareaRef.current) return;
    const index = code.toLowerCase().indexOf(query.toLowerCase());
    if (index !== -1) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(index, index + query.length);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const raw = codeSearchQuery.trim();
      const match = raw.match(/\d+/);
      const targetLine = match ? parseInt(match[0], 10) : 0;
      if (targetLine > 0) {
        handleJumpToLine(targetLine);
      } else if (codeSearchQuery) {
        searchInCode(codeSearchQuery);
      }
    }
  };

  // Code & UI Suggestions Filter
  const filteredSuggestions = useMemo(() => {
    const q = codeSearchQuery.trim().toLowerCase();
    const result: Array<{ id: string; name: string; type: 'ui' | 'code' | 'line'; snippet: string; desc: string; lineNum?: number }> = [];

    if (!q || q.startsWith('line ') || q.startsWith('লাইন ')) {
      // Return top UI templates by default when focused
      return BUILTIN_CODE_SUGGESTIONS.slice(0, 10).map((item) => ({
        id: `builtin-${item.name}`,
        ...item,
      }));
    }

    // 1. Match built-in UI and code templates
    BUILTIN_CODE_SUGGESTIONS.forEach((item) => {
      if (item.name.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q) || item.snippet.toLowerCase().includes(q)) {
        result.push({
          id: `builtin-${item.name}`,
          ...item,
        });
      }
    });

    // 2. Match lines in current active file code
    const lines = code.split('\n');
    lines.forEach((lineText, idx) => {
      if (lineText.toLowerCase().includes(q) && lineText.trim().length > 0 && result.length < 25) {
        result.push({
          id: `code-line-${idx + 1}`,
          name: `Line ${idx + 1}`,
          type: 'line',
          snippet: lineText.trim(),
          desc: lineText.trim().substring(0, 45),
          lineNum: idx + 1,
        });
      }
    });

    return result;
  }, [codeSearchQuery, code]);

  const handleApplySuggestion = (item: { snippet: string; lineNum?: number; name: string }) => {
    if (item.lineNum) {
      handleJumpToLine(item.lineNum);
      onShowAlert(`Jumped to line ${item.lineNum}`);
    } else {
      insertSymbol(item.snippet);
      onShowAlert(`Inserted "${item.name}"`);
    }
    setIsSuggestionsDropdownOpen(false);
  };

  const handleSelectTabSpaces = (count: number) => {
    setTabSpaces(count);
    setTabInputVal(String(count));
    try {
      localStorage.setItem('android_ide_tab_spaces_v2', count.toString());
    } catch {}
    setIsTabConfigOpen(false);
    showCenterBigToast('SPACE SET', `${count} Spaces Configured`, 'fa-arrow-right-to-bracket', 'save');
    onShowAlert(`Tab size set to ${count} spaces`);
  };

  const handleConfirmCustomTabSpaces = () => {
    const parsed = parseInt(tabInputVal.trim(), 10);
    if (isNaN(parsed) || parsed < 1) {
      onShowAlert('Please enter a space count of 1 or more');
      return;
    }
    if (parsed > 32) {
      onShowAlert('Maximum 32 spaces allowed');
      return;
    }
    handleSelectTabSpaces(parsed);
  };

  // Close search suggestions dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBoxContainerRef.current && !searchBoxContainerRef.current.contains(e.target as Node)) {
        setIsSuggestionsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Drag handlers for Draggable Copy Options Bar
  const handleCopyDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const defaultX = Math.max(10, window.innerWidth - 200);
    const defaultY = 60;
    const currentX = copyFloatingPos?.x ?? defaultX;
    const currentY = copyFloatingPos?.y ?? defaultY;
    copyDragRef.current = { startX: clientX, startY: clientY, initX: currentX, initY: currentY };
    setIsDraggingCopy(true);
  };

  useEffect(() => {
    if (!isDraggingCopy) return;

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!copyDragRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      const dx = clientX - copyDragRef.current.startX;
      const dy = clientY - copyDragRef.current.startY;
      const maxX = Math.max(10, window.innerWidth - 180);
      const maxY = Math.max(10, window.innerHeight - 200);
      const newX = Math.max(10, Math.min(maxX, copyDragRef.current.initX + dx));
      const newY = Math.max(10, Math.min(maxY, copyDragRef.current.initY + dy));
      setCopyFloatingPos({ x: newX, y: newY });
    };

    const onEnd = () => {
      setIsDraggingCopy(false);
      copyDragRef.current = null;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchend', onEnd);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchend', onEnd);
    };
  }, [isDraggingCopy]);

  // Dedicated Paste Handler
  const handlePasteClick = async () => {
    let text = '';
    try {
      text = await navigator.clipboard.readText();
    } catch {}
    if (!text || !text.trim()) {
      try {
        text = localStorage.getItem('android_ide_clipboard_cache') || '';
      } catch {}
    }
    if (text && text.trim()) {
      try {
        localStorage.setItem('android_ide_clipboard_cache', text);
      } catch {}
      const validation = validateFileOpenForCode(text, activeFile, openFiles.length);
      if (!validation.valid && !activeFile) {
        const autoExt = validation.requiredExt || '.html';
        const autoFile = autoExt === '.kt' ? 'MainActivity.kt' : autoExt === '.dart' ? 'main.dart' : 'index.html';
        handleQuickOpenOrCreateFile(autoFile, text);
        handleUserCodeChange(text);
        showCenterBigToast('CODE PASTED', `Opened ${autoFile} & pasted`, 'fa-paste', 'save');
        return;
      }
      insertSymbol(text);
      showCenterBigToast('CODE PASTED', 'Pasted from clipboard', 'fa-paste', 'save');
      onShowAlert('Pasted code from clipboard');
    } else {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
      showCenterBigToast('LONG PRESS TO PASTE', 'Hold inside code box & tap Paste', 'fa-paste', 'paste');
    }
  };

  // Direct Tap Insertion (No Long-press Edit Modal)
  const handleSymbolClick = (sym: string) => {
    insertSymbol(sym);
  };

  // Auto-generate standard files for newly created or opened empty folders
  const getAutoFilesForFolder = (folderName: string, folderId: string): FileNode[] => {
    const lower = folderName.toLowerCase();
    const time = Date.now();
    if (lower.includes('asset')) {
      return [
        { id: `${folderId}_asset1_${time}`, name: 'assets_manifest.json', type: 'file', content: '{\n  "version": "1.0",\n  "assets": []\n}\n', isDefault: false },
        { id: `${folderId}_asset2_${time}`, name: 'config.json', type: 'file', content: '{\n  "appName": "MyAndroidApp",\n  "debug": true\n}\n', isDefault: false }
      ];
    }
    if (lower.includes('layout') || lower.includes('res') || lower.includes('view')) {
      return [
        { id: `${folderId}_layout1_${time}`, name: 'activity_main.xml', type: 'file', content: '<?xml version="1.0" encoding="utf-8"?>\n<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"\n    android:layout_width="match_parent"\n    android:layout_height="match_parent"\n    android:orientation="vertical">\n</LinearLayout>\n', isDefault: false }
      ];
    }
    if (lower.includes('drawable')) {
      return [
        { id: `${folderId}_draw1_${time}`, name: 'ic_launcher.xml', type: 'file', content: '<vector xmlns:android="http://schemas.android.com/apk/res/android"\n    android:width="24dp"\n    android:height="24dp"\n    android:viewportWidth="24"\n    android:viewportHeight="24">\n</vector>\n', isDefault: false }
      ];
    }
    if (lower.includes('value')) {
      return [
        { id: `${folderId}_val1_${time}`, name: 'strings.xml', type: 'file', content: '<resources>\n    <string name="app_name">My App</string>\n</resources>\n', isDefault: false },
        { id: `${folderId}_val2_${time}`, name: 'colors.xml', type: 'file', content: '<resources>\n    <color name="primary">#007AFF</color>\n</resources>\n', isDefault: false }
      ];
    }
    if (lower.includes('component')) {
      return [
        { id: `${folderId}_comp1_${time}`, name: 'MainComponent.kt', type: 'file', content: 'package com.example.app\n\nclass MainComponent {\n    fun render() {\n        // Component logic\n    }\n}\n', isDefault: false }
      ];
    }
    return [
      { id: `${folderId}_gen1_${time}`, name: `${folderName}_main.kt`, type: 'file', content: `// Auto-generated file for ${folderName}\npackage com.example.${folderName.toLowerCase().replace(/[^a-z0-9]/g, '')}\n\nfun main() {\n    println("Ready")\n}\n`, isDefault: false },
      { id: `${folderId}_gen2_${time}`, name: 'README.md', type: 'file', content: `# ${folderName} Folder\nAuto-populated standard project files.\n`, isDefault: false }
    ];
  };

  // File tree node handlers
  const toggleFolder = (folderId: string) => {
    const update = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((n) => {
        if (n.id === folderId) {
          return { ...n, isOpen: !n.isOpen };
        }
        if (n.children) {
          return { ...n, children: update(n.children) };
        }
        return n;
      });
    };
    onUpdateFileSystem(update(fileSystem));
  };

  // Helper to collect all node IDs in a subtree for closing open tabs
  const collectSubtreeIds = (node: FileNode): string[] => {
    let ids = [node.id];
    if (node.children) {
      for (const child of node.children) {
        ids = ids.concat(collectSubtreeIds(child));
      }
    }
    return ids;
  };

  const findNodeInTree = (nodes: FileNode[], id: string): FileNode | null => {
    for (const n of nodes) {
      if (n.id === id) return n;
      if (n.children) {
        const found = findNodeInTree(n.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Delete node recursively (with system file protection)
  const deleteNode = (nodeId: string) => {
    const target = findNodeInTree(fileSystem, nodeId);
    if (target && !isUserCreatedNode(target)) {
      onShowAlert('Protected system file cannot be deleted');
      return;
    }

    // Close any tabs belonging to this node or its children
    if (target && onCloseFileTab) {
      const allIds = collectSubtreeIds(target);
      allIds.forEach((id) => onCloseFileTab(id));
    }

    const remove = (nodes: FileNode[]): FileNode[] => {
      return nodes
        .filter((n) => n.id !== nodeId)
        .map((n) => {
          if (n.children) {
            return { ...n, children: remove(n.children) };
          }
          return n;
        });
    };
    onUpdateFileSystem(remove(fileSystem));
  };

  // Delete handler: deletes user-created node directly or opens confirmation
  const handleDeleteNodeAction = (node: FileNode) => {
    if (!isUserCreatedNode(node)) {
      onShowAlert('Protected system file cannot be deleted');
      return;
    }
    const nodeName = node.name;
    deleteNode(node.id);
    setContextTargetNode(null);
    setDeleteTargetNode(null);
    onShowAlert(`"${nodeName}" deleted`);
  };

  // Node 3-second long-press detection
  const handleNodePointerDown = (node: FileNode) => {
    nodePressTimerRef.current = setTimeout(() => {
      setContextTargetNode(node);
    }, 2500); // 2.5s deliberate hold for rename/delete/share options
  };

  const handleNodePointerUp = () => {
    if (nodePressTimerRef.current) {
      clearTimeout(nodePressTimerRef.current);
      nodePressTimerRef.current = null;
    }
  };

  const handleRenameNode = (node: FileNode) => {
    if (!isUserCreatedNode(node)) {
      onShowAlert('Primary project template files cannot be renamed');
      return;
    }
    setRenameTargetNode(node);
    setRenameNodeInput(node.name);
    setIsRenameNodeModalOpen(true);
    setContextTargetNode(null);
  };

  const handleShareNode = async (node: FileNode) => {
    setContextTargetNode(null);
    if (navigator.share) {
      try {
        await navigator.share({
          title: node.name,
          text: node.content || `// File: ${node.name}`,
        });
        onShowAlert(`Shared "${node.name}" successfully`);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }
    // Open dedicated File Share Modal
    setShareModalNode(node);
  };

  const handleDownloadSingleFile = async (node: FileNode) => {
    if (node.name.toLowerCase().endsWith('.apk')) {
      setContextTargetNode(null);
      setIsSidebarOpen(false);
      if (node.name.toUpperCase() === 'ANDROID.APK' && onDownloadIdeApk) {
        onDownloadIdeApk();
      } else {
        onDownloadApk({ preferredFileName: node.name });
      }
      return;
    }
    try {
      await triggerReliableDownload({
        textData: node.content || '',
        fileName: node.name,
        contentType: 'text/plain;charset=utf-8',
      });
      onShowAlert(`Downloaded "${node.name}"`);
      setContextTargetNode(null);
    } catch {
      onShowAlert('Download failed');
    }
  };

  const handleDuplicateFile = (node: FileNode) => {
    const extIndex = node.name.lastIndexOf('.');
    const baseName = extIndex !== -1 ? node.name.substring(0, extIndex) : node.name;
    const ext = extIndex !== -1 ? node.name.substring(extIndex) : '';
    const newName = `${baseName}_copy${ext}`;

    const newNode: FileNode = {
      id: `file_${Date.now()}`,
      name: newName,
      type: 'file',
      content: node.content || '',
      isDefault: false,
    };
    onUpdateFileSystem(ensureApkDownloadFolder([...fileSystem, newNode]));
    onShowAlert(`Duplicated file: "${newName}"`);
    setContextTargetNode(null);
  };

  const renderTree = (nodes: FileNode[]) => {
    return nodes.map((node) => {
      const isProtected = !!node.isDefault;
      if (node.type === 'folder') {
        return (
          <div key={node.id} className="folder-node">
            <div
              className="tree-item folder"
              onClick={() => toggleFolder(node.id)}
              onMouseDown={() => handleNodePointerDown(node)}
              onMouseUp={handleNodePointerUp}
              onTouchStart={() => handleNodePointerDown(node)}
              onTouchEnd={handleNodePointerUp}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextTargetNode(node);
              }}
            >
              <div className="tree-item-left">
                <i className={`fas ${node.isOpen ? 'fa-folder-open text-yellow-500' : 'fa-folder text-yellow-500'}`}></i>
                <span>{node.name}</span>
              </div>
              <button
                type="button"
                className="tree-more-btn"
                title={`Options for ${node.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setContextTargetNode(node);
                }}
              >
                <i className="fas fa-ellipsis-vertical"></i>
              </button>
            </div>
            {node.isOpen && node.children && node.children.length > 0 && (
              <div className="folder-children">{renderTree(node.children)}</div>
            )}
            {node.isOpen && (!node.children || node.children.length === 0) && (
              <div className="folder-children empty-folder-message">(empty folder)</div>
            )}
          </div>
        );
      }
      const isActive = activeFile?.id === node.id;
      return (
        <SwipeableFileItem
          key={node.id}
          node={node}
          isActive={isActive}
          onSelect={(fileNode) => {
            if (fileNode.name.toLowerCase().endsWith('.apk')) {
              setIsSidebarOpen(false);
              if (fileNode.name.toUpperCase() === 'ANDROID.APK' && onDownloadIdeApk) {
                onDownloadIdeApk();
              } else {
                onDownloadApk({ preferredFileName: fileNode.name });
              }
              return;
            }
            onSelectFile(fileNode);
            if (window.innerWidth < 768) {
              setIsSidebarOpen(false);
            }
          }}
          onDelete={handleDeleteNodeAction}
          onOpenContext={setContextTargetNode}
          onPointerDownNode={handleNodePointerDown}
          onPointerUpNode={handleNodePointerUp}
          onShowAlert={onShowAlert}
        />
      );
    });
  };

  // Direct Gallery handler - sets image as App Logo immediately and stores compact 256x256 PNG dataUrl
  const handleGallerySelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const rawDataUrl = (ev.target?.result as string) || '';
        const img = new Image();
        img.onload = () => {
          let finalDataUrl = rawDataUrl;
          try {
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, 256, 256);
              finalDataUrl = canvas.toDataURL('image/png');
            }
          } catch {}
          onSetAppLogo(finalDataUrl);
          const imageNode: FileNode = {
            id: `img_${Date.now()}`,
            name: file.name,
            type: 'file',
            content: finalDataUrl,
            isDefault: false,
          };
          onUpdateFileSystem(ensureApkDownloadFolder([...fileSystem, imageNode]));
          onShowAlert(`Image "${file.name}" applied as App Logo!`);
        };
        img.onerror = () => {
          onSetAppLogo(rawDataUrl);
          const imageNode: FileNode = {
            id: `img_${Date.now()}`,
            name: file.name,
            type: 'file',
            content: rawDataUrl,
            isDefault: false,
          };
          onUpdateFileSystem(ensureApkDownloadFolder([...fileSystem, imageNode]));
          onShowAlert(`Image "${file.name}" applied as App Logo!`);
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNativeFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = (event.target?.result as string) || '';
        const newNode: FileNode = {
          id: `file_${Date.now()}`,
          name: file.name,
          type: 'file',
          content: text,
          isDefault: false,
        };
        onUpdateFileSystem(ensureApkDownloadFolder([...fileSystem, newNode]));
        onSelectFile(newNode);
        onShowAlert(`Imported "${file.name}"`);
      };
      reader.readAsText(file);
    }
  };

  const handleNativeFolderSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileList = Array.from(files) as File[];
      const importedFolder: FileNode = {
        id: `folder_${Date.now()}`,
        name: 'IMPORTED_FILES',
        type: 'folder',
        isOpen: false,
        isDefault: false,
        children: fileList.map((f, i) => ({
          id: `imp_file_${Date.now()}_${i}`,
          name: f.name,
          type: 'file',
          content: `// Imported file: ${f.name}\n`,
          isDefault: false,
        })),
      };
      if (fileSystem.length > 0 && fileSystem[0].type === 'folder') {
        const updatedRoot = {
          ...fileSystem[0],
          children: [...(fileSystem[0].children || []), importedFolder],
        };
        onUpdateFileSystem([updatedRoot, ...fileSystem.slice(1)]);
      } else {
        onUpdateFileSystem([...fileSystem, importedFolder]);
      }
      onShowAlert(`Imported folder with ${files.length} items`);
    }
  };

  // Helper to automatically resolve or create an active file when code is present
  const resolveOrAutoOpenFileForCode = (currentCode: string): FileNode | null => {
    const collectFiles = (nodes: FileNode[]): FileNode[] => {
      let list: FileNode[] = [];
      for (const n of nodes) {
        if (n.type === 'file' && !n.name.toLowerCase().endsWith('.apk')) list.push(n);
        if (n.children) list = list.concat(collectFiles(n.children));
      }
      return list;
    };
    const allNonApkFiles = collectFiles(fileSystem);
    const trimmed = (currentCode || '').trim();
    const lower = trimmed.toLowerCase();

    const isHtml =
      lower.includes('<!doctype html') ||
      (lower.includes('<html') && lower.includes('</html>')) ||
      (lower.includes('<body') && lower.includes('</body>')) ||
      (lower.includes('<head') && lower.includes('<style'));
    const isDart =
      !isHtml &&
      (trimmed.includes("import 'package:flutter/") ||
        trimmed.includes('extends StatelessWidget') ||
        trimmed.includes('extends StatefulWidget'));
    const isKotlin =
      !isHtml &&
      !isDart &&
      (trimmed.startsWith('package ') ||
        trimmed.includes('class MainActivity') ||
        trimmed.includes('fun onCreate(') ||
        trimmed.includes('@Composable'));

    const desiredExt = isHtml ? '.html' : isDart ? '.dart' : isKotlin ? '.kt' : null;

    if (activeFile && openFiles.length > 0) {
      if (!desiredExt || activeFile.name.toLowerCase().endsWith(desiredExt)) {
        return activeFile;
      }
    }

    // Try finding an existing file with matching extension
    const matchingExisting = desiredExt
      ? allNonApkFiles.find((f) => f.name.toLowerCase().endsWith(desiredExt))
      : allNonApkFiles[0];

    if (matchingExisting) {
      const updatedNode = { ...matchingExisting, content: currentCode };
      onSelectFile(updatedNode);
      onChangeCode(currentCode);
      return updatedNode;
    }

    // Create a new matching file inside the project folder
    const fallbackName =
      desiredExt === '.html'
        ? 'index.html'
        : desiredExt === '.dart'
        ? 'main.dart'
        : 'MainActivity.kt';
    const newNode: FileNode = {
      id: `file_${Date.now()}`,
      name: fallbackName,
      type: 'file',
      content: currentCode,
      isDefault: false,
    };
    onUpdateFileSystem(ensureApkDownloadFolder([...fileSystem, newNode]));
    onSelectFile(newNode);
    onChangeCode(currentCode);
    return newNode;
  };

  // Top Bar Action Handlers with Center Screen Big Toast HUD
  const handleCopyClick = () => {
    setIsCopyOptionsOpen((prev) => !prev);
  };

  const handleSaveClick = () => {
    if (!code || !code.trim()) {
      showCenterBigToast('PASTE CODE', undefined, 'fa-paste', 'paste');
      return;
    }
    const targetFile = resolveOrAutoOpenFileForCode(code);
    onSaveCode();
    showCenterBigToast('CODE SAVED', targetFile?.name || activeFile?.name, 'fa-check-circle', 'save');
  };

  const handlePlayClick = () => {
    if (!code || !code.trim()) {
      showCenterBigToast('PASTE CODE', undefined, 'fa-paste', 'paste');
      return;
    }

    const targetFile = resolveOrAutoOpenFileForCode(code);
    const effectiveActiveFileName = targetFile?.name || activeFile?.name || 'index.html';

    // Helper to recursively collect all files in the project
    const collectFiles = (nodes: FileNode[]): FileNode[] => {
      let list: FileNode[] = [];
      for (const node of nodes) {
        if (node.type === 'file') list.push(node);
        if (node.children) list = list.concat(collectFiles(node.children));
      }
      return list;
    };

    const allProjectFiles = collectFiles(fileSystem);
    const filesList = allProjectFiles.map((f) => ({ name: f.name, content: f.content || '' }));

    // Detect app category, resolve effective app name (e.g. Calculator), and generate matching logo if none uploaded
    const detection = detectAppCategory(code, effectiveActiveFileName, projectTitle, filesList);
    const effectiveName = resolveEffectiveAppName(code, effectiveActiveFileName, projectTitle, detection);
    const effectiveLogo = generateAppLogoPreviewDataUrl(detection.category, effectiveName, appLogoUrl);

    setPreviewAppName(effectiveName);
    setPreviewAppLogoUrl(effectiveLogo);
    setIsPreviewMenuOpen(false);

    // Compile standalone interactive application using appCompiler (handles Calculator, Notes, Games, and Web apps)
    const previewDocument = compileAppToStandaloneHtml({
      code,
      activeFileName: effectiveActiveFileName,
      projectTitle: effectiveName,
      allFiles: filesList,
      appLogoUrl: effectiveLogo,
    });

    setFullAppPreviewHtml(previewDocument);
    setIsFullAppPreviewOpen(true);
    showCenterBigToast('APP RUNNING', effectiveName, 'fa-play', 'run');
  };

  const handleRenameProject = () => {
    setRenameProjectInput(projectTitle);
    setIsRenameProjectModalOpen(true);
  };

  const handleConfirmRenameProject = () => {
    if (renameProjectInput && renameProjectInput.trim()) {
      onChangeProjectTitle(renameProjectInput.trim());
      onShowAlert(`App name changed to "${renameProjectInput.trim()}"`);
    }
    setIsRenameProjectModalOpen(false);
  };

  const handleCreateNewFolder = () => {
    setNewFolderNameInput('new_folder');
    setTargetParentFolderId(null);
    setIsCreateFolderModalOpen(true);
  };

  const handleConfirmCreateFolder = () => {
    const name = newFolderNameInput.trim() || 'new_folder';
    const newFolder: FileNode = {
      id: `folder_${Date.now()}`,
      name,
      type: 'folder',
      isOpen: true,
      isDefault: false,
      children: [],
    };

    if (targetParentFolderId) {
      const insertInTree = (nodes: FileNode[]): FileNode[] => {
        return nodes.map((n) => {
          if (n.id === targetParentFolderId) {
            return {
              ...n,
              isOpen: true,
              children: [...(n.children || []), newFolder],
            };
          }
          if (n.children) {
            return { ...n, children: insertInTree(n.children) };
          }
          return n;
        });
      };
      onUpdateFileSystem(insertInTree(fileSystem));
    } else {
      onUpdateFileSystem(ensureApkDownloadFolder([...fileSystem, { ...newFolder, isOpen: false }]));
    }

    onShowAlert(`Folder "${name}" created`);
    setIsCreateFolderModalOpen(false);
    setTargetParentFolderId(null);
  };

  const handleCreateNewFile = () => {
    setNewFileNameInput('NewFile.kt');
    setTargetParentFolderId(null);
    setIsCreateFileModalOpenLocal(true);
  };

  const handleConfirmCreateFile = () => {
    const name = newFileNameInput.trim() || 'NewFile.kt';
    const initialContent = !activeFile && code.trim().length > 0 ? code : '';
    const newFile: FileNode = {
      id: `file_${Date.now()}`,
      name,
      type: 'file',
      isDefault: false,
      content: initialContent,
    };

    if (targetParentFolderId) {
      const insertInTree = (nodes: FileNode[]): FileNode[] => {
        return nodes.map((n) => {
          if (n.id === targetParentFolderId) {
            return {
              ...n,
              isOpen: true,
              children: [...(n.children || []), newFile],
            };
          }
          if (n.children) {
            return { ...n, children: insertInTree(n.children) };
          }
          return n;
        });
      };
      onUpdateFileSystem(insertInTree(fileSystem));
    } else {
      onUpdateFileSystem(ensureApkDownloadFolder([...fileSystem, newFile]));
    }

    onSelectFile(newFile);
    onShowAlert(`File "${name}" created and opened`);
    setIsCreateFileModalOpenLocal(false);
    setIsSidebarOpen(false);
    setTargetParentFolderId(null);
  };

  const handleConfirmRenameNode = () => {
    if (!renameTargetNode) return;
    const name = renameNodeInput.trim();
    if (name) {
      const update = (nodes: FileNode[]): FileNode[] => {
        return nodes.map((n) => {
          if (n.id === renameTargetNode.id) {
            return { ...n, name };
          }
          if (n.children) {
            return { ...n, children: update(n.children) };
          }
          return n;
        });
      };
      onUpdateFileSystem(update(fileSystem));
      onShowAlert(`Renamed to "${name}"`);
    }
    setIsRenameNodeModalOpen(false);
    setRenameTargetNode(null);
  };

  const filteredTools = tools.filter(
    (t) =>
      t.name.toLowerCase().includes(toolSearchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(toolSearchQuery.toLowerCase())
  );

  return (
    <div id="editor-screen">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          id="sidebar-overlay"
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Editor Sidebar */}
      {isSidebarOpen && (
        <div
          id="editor-sidebar"
          className="editor-sidebar"
          onTouchStart={handleSidebarTouchStart}
          onTouchEnd={handleSidebarTouchEnd}
        >
          {/* Centered App Name with App Logo on the header */}
          <div className="sidebar-header-centered">
            <div className="sidebar-logo-wrap" id="sidebarLogoContainer">
              {appLogoUrl ? (
                <img
                  src={appLogoUrl}
                  alt="App Logo"
                  className="sidebar-custom-logo-img"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: '#090d16',
                    border: '3px solid #00b0ff',
                    boxShadow: '0 0 12px rgba(0, 176, 255, 0.35)',
                    padding: '3px',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src="/android_logo.png"
                    alt="Android Logo"
                    className="sidebar-custom-logo-img"
                    style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'contain' }}
                  />
                </div>
              )}
            </div>
            <h3 id="sidebarProjectTitle" className="sidebar-title-centered">
              {projectTitle}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                type="button"
                className="sidebar-collapse-btn"
                onClick={() => setIsSidebarOpen(false)}
                title="Collapse Sidebar (Swipe left or tap)"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <button
                type="button"
                className="close-btn-circle"
                onClick={() => setIsSidebarOpen(false)}
                title="Close Sidebar"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>

          <div
            className="quick-header-bar blue-indicator-bar"
            onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
            style={{ cursor: 'pointer' }}
          >
            <span>
              QUICK ACTION / 520 TOOLS <i className={`fas fa-chevron-${isToolsDropdownOpen ? 'up' : 'down'}`}></i>
            </span>
          </div>

          <div className="custom-sketch-action-bar">
            {/* Top Row: Import menu, Direct Gallery (App Logo), Download Options */}
            <div className="sketch-row row-top">
              <div
                className="sketch-icon-btn btn-clr-purple"
                onClick={() => {
                  setIsImportDropdownOpen(!isImportDropdownOpen);
                  setIsDownloadDropdownOpen(false);
                  setIsProjectDropdownOpen(false);
                }}
                title="Import Menu"
              >
                <i className="fas fa-folder-open"></i>
              </div>
              <div
                className="sketch-icon-btn btn-clr-green"
                onClick={() => galleryInputRef.current?.click()}
                title="Select App Logo from Gallery"
              >
                {appLogoUrl ? (
                  <img
                    src={appLogoUrl}
                    alt="Logo"
                    style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <i className="fas fa-image"></i>
                )}
              </div>
              <div
                className="sketch-icon-btn btn-clr-orange"
                onClick={() => {
                  setIsDownloadDropdownOpen(!isDownloadDropdownOpen);
                  setIsImportDropdownOpen(false);
                  setIsProjectDropdownOpen(false);
                }}
                title="Download Options"
              >
                <i className="fas fa-download"></i>
              </div>
            </div>

            {/* Bottom Row: 4 Dedicated Options as requested */}
            {/* 1. App/Project manage (Change name & new project) */}
            {/* 2. Create Folder */}
            {/* 3. Create File */}
            {/* 4. 100 Clean File Select Modal (+) */}
            <div className="sketch-row row-bottom">
              <div
                className="sketch-icon-btn btn-clr-blue"
                onClick={() => {
                  setIsProjectDropdownOpen(!isProjectDropdownOpen);
                  setIsImportDropdownOpen(false);
                  setIsDownloadDropdownOpen(false);
                }}
                title="Project Options (Name & New Project)"
              >
                <i className="fas fa-cubes-stacked"></i>
              </div>
              <div
                className="sketch-icon-btn btn-clr-yellow"
                onClick={handleCreateNewFolder}
                title="Create New Folder"
              >
                <i className="fas fa-folder-plus"></i>
              </div>
              <div
                className="sketch-icon-btn btn-clr-cyan"
                onClick={handleCreateNewFile}
                title="Create New File"
              >
                <i className="fas fa-file-circle-plus"></i>
              </div>
              <div
                className="sketch-icon-btn btn-clr-pink"
                onClick={() => {
                  setIsSidebarOpen(false);
                  onOpenCreateModal();
                }}
                title="Select from 100 Clean File Types"
              >
                <i className="fas fa-plus"></i>
              </div>
            </div>

            {/* Project Manage Dropdown: Change App Name & New Project */}
            {isProjectDropdownOpen && (
              <div id="project-manage-dropdown" className="sketch-dropdown">
                <button
                  onClick={() => {
                    handleRenameProject();
                    setIsProjectDropdownOpen(false);
                  }}
                >
                  <i className="fas fa-pen-to-square"></i> Change App Name
                </button>
                <button
                  onClick={() => {
                    onNewProject();
                    setIsProjectDropdownOpen(false);
                  }}
                >
                  <i className="fas fa-folder-plus"></i> New Project
                </button>
              </div>
            )}

            {/* Import Dropdown */}
            {isImportDropdownOpen && (
              <div id="import-dropdown" className="sketch-dropdown">
                <button
                  onClick={() => {
                    folderInputRef.current?.click();
                    setIsImportDropdownOpen(false);
                  }}
                >
                  <i className="fas fa-folder"></i> Import Folder
                </button>
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setIsImportDropdownOpen(false);
                  }}
                >
                  <i className="fas fa-file"></i> Import File
                </button>
              </div>
            )}

            {/* Download Dropdown */}
            {isDownloadDropdownOpen && (
              <div id="download-dropdown" className="sketch-dropdown">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDownloadDropdownOpen(false);
                    setIsSidebarOpen(false);
                    onDownloadApk();
                  }}
                >
                  <i className="fab fa-android"></i> Installable App APK
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDownloadDropdownOpen(false);
                    setIsSidebarOpen(false);
                    onDownloadZip();
                  }}
                >
                  <i className="fas fa-file-archive"></i> Project Files ZIP
                </button>
              </div>
            )}

            {/* Massive 520 Tools Dropdown */}
            {isToolsDropdownOpen && (
              <div id="massive-520-tools-dropdown" className="sketch-dropdown massive-tools-dropdown-box">
                <div className="tools-search-wrap">
                  <input
                    type="text"
                    id="toolSearchInput"
                    placeholder="Search 520 Tools..."
                    value={toolSearchQuery}
                    onChange={(e) => setToolSearchQuery(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="tools-list-scroll" id="toolsListContainer">
                  {filteredTools.slice(0, 100).map((tool) => (
                    <div
                      key={tool.id}
                      className="tool-item-pill"
                      onClick={() => {
                        onTriggerTool(tool);
                        setIsToolsDropdownOpen(false);
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i className={`fas ${tool.icon}`}></i>
                        <span>{tool.name}</span>
                      </div>
                      {tool.badge && <span className="tool-badge">{tool.badge}</span>}
                    </div>
                  ))}
                  {filteredTools.length > 100 && (
                    <div style={{ textAlign: 'center', fontSize: '10px', color: '#888', padding: '4px' }}>
                      Showing top 100 of {filteredTools.length} matching tools
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Hidden Inputs */}
          <input
            ref={galleryInputRef}
            type="file"
            id="nativeGalleryInput"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleGallerySelected}
          />
          <input
            ref={fileInputRef}
            type="file"
            id="nativeFileInput"
            style={{ display: 'none' }}
            onChange={handleNativeFileSelected}
          />
          <input
            ref={folderInputRef}
            type="file"
            id="nativeFolderInput"
            {...({ webkitdirectory: '', directory: '' } as unknown as React.InputHTMLAttributes<HTMLInputElement>)}
            multiple
            style={{ display: 'none' }}
            onChange={handleNativeFolderSelected}
          />

          <div className="file-tree-container-bar">
            <div className="file-tree" id="fileTreeContainer">
              {renderTree(fileSystem)}
            </div>
          </div>
        </div>
      )}

      {/* Editor Top Bar: Search, compact 3X Turbo in the middle, Copy, Save, Play */}
      <div className="editor-top-float-slim">
        <div className="top-bar-inner">
          <div
            className="nav-icon-bg"
            title="Project Files"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <i className="fas fa-bars"></i>
          </div>
          <div
            className="nav-icon-bg"
            title="Dashboard"
            onClick={onBackToDashboard}
          >
            <i className="fas fa-home"></i>
          </div>

          {/* Search Box: Clean search & jump to line */}
          <div
            ref={searchBoxContainerRef}
            className="thick-search-box-large"
            style={{ position: 'relative' }}
          >
            <i className="fas fa-search search-icon-inside"></i>
            <input
              type="text"
              id="codeSearchInput"
              className="code-search-input-clean"
              placeholder="SEARCH CODE OR LINE..."
              value={codeSearchQuery}
              onChange={(e) => {
                searchInCode(e.target.value);
              }}
              onKeyDown={handleSearchKeyDown}
            />
            {codeSearchQuery && (
              <button
                type="button"
                className="clean-input-clear mr-2 text-slate-400 hover:text-white"
                onClick={() => setCodeSearchQuery('')}
                title="Clear Search"
              >
                <i className="fas fa-xmark"></i>
              </button>
            )}
          </div>

          {/* Compact 3X Turbo Boost Pill placed between Search Box and Copy Button */}
          <button
            type="button"
            className="mini-turbo-pill"
            title="Turbo 3X Boost"
            onClick={() => {
              onShowAlert('⚡ Turbo 3X Boost Active: JIT max compiler acceleration enabled!');
            }}
          >
            <i className="fas fa-bolt"></i>
            <span>3X</span>
          </button>

          {/* AI Code Assistant & Code Generator (Gemini 3.8) Button */}
          <button
            type="button"
            className="mini-turbo-pill"
            style={{
              background: '#161826',
              border: '1px solid #282c44',
              color: isAiModalOpen ? '#007AFF' : '#e2e8f0',
              borderBottom: isAiModalOpen ? '2px solid #007AFF' : '1px solid #282c44',
              boxShadow: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              padding: '0 6px',
              height: '29px',
              borderRadius: '8px',
              flexShrink: 0,
            }}
            title="AI Assistant & Code Generator (Gemini 3.8)"
            onClick={() => {
              setAiModalTab('chat');
              setIsAiModalOpen(true);
            }}
          >
            <i className="fas fa-wand-magic-sparkles" style={{ fontSize: '10px' }}></i>
            <span style={{ fontWeight: 800, fontSize: '10px' }}>AI</span>
          </button>

          {/* Copy Button with Corner Dropdown Bar */}
          <div style={{ position: 'relative' }}>
            <div
              className={`nav-icon-bg btn-action-copy ${isCopyOptionsOpen ? 'active-corner-btn' : ''}`}
              title="Copy Code Options"
              onClick={handleCopyClick}
            >
              <i className="fas fa-copy"></i>
            </div>

            {/* Small Draggable Top-Right Floating Copy Bar */}
            {isCopyOptionsOpen && (
              <div
                className="copy-floating-draggable-bar"
                style={{
                  position: 'fixed',
                  left: copyFloatingPos ? `${copyFloatingPos.x}px` : undefined,
                  top: copyFloatingPos ? `${copyFloatingPos.y}px` : '56px',
                  right: copyFloatingPos ? undefined : '12px',
                  zIndex: 99999,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Drag Handle Bar */}
                <div
                  className="copy-draggable-handle"
                  onMouseDown={handleCopyDragStart}
                  onTouchStart={handleCopyDragStart}
                  title="Hold and drag to move"
                >
                  <span className="copy-drag-title">
                    <i className="fas fa-grip-vertical mr-1 text-slate-400"></i>
                    CLIPBOARD
                  </span>
                  <button
                    type="button"
                    className="copy-drag-close"
                    onClick={() => setIsCopyOptionsOpen(false)}
                    title="Close"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                {/* Compact English Action Buttons */}
                <div className="copy-floating-items">
                  {/* 1. SELECT ALL */}
                  <button
                    type="button"
                    className="copy-floating-btn"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (code && code.length > 0) {
                        try {
                          localStorage.setItem('android_ide_clipboard_cache', code);
                          navigator.clipboard?.writeText(code).catch(() => {});
                        } catch {}
                        const selectAllNow = () => {
                          if (textareaRef.current) {
                            textareaRef.current.focus({ preventScroll: true });
                            textareaRef.current.select();
                            textareaRef.current.setSelectionRange(0, textareaRef.current.value.length);
                          }
                        };
                        selectAllNow();
                        setTimeout(selectAllNow, 50);
                        // Keep menu open so user can immediately tap COPY, CUT, PASTE, or DELETE ALL
                        showCenterBigToast('SELECTED ALL', 'All code selected — tap Copy, Cut, or Delete', 'fa-object-ungroup', 'save');
                      } else {
                        showCenterBigToast('NO CODE', 'Editor is empty', 'fa-paste', 'paste');
                      }
                    }}
                  >
                    <i className="fas fa-object-ungroup text-emerald-400"></i>
                    <span>SELECT ALL</span>
                  </button>

                  {/* 2. COPY */}
                  <button
                    type="button"
                    className="copy-floating-btn"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      let textToCopy = '';
                      if (textareaRef.current) {
                        const start = textareaRef.current.selectionStart;
                        const end = textareaRef.current.selectionEnd;
                        if (start !== end) {
                          textToCopy = code.substring(start, end);
                        }
                      }
                      if (!textToCopy) textToCopy = code;

                      if (!textToCopy || !textToCopy.trim()) {
                        showCenterBigToast('PASTE CODE', 'Write or paste code first', 'fa-paste', 'paste');
                        setIsCopyOptionsOpen(false);
                        return;
                      }
                      try {
                        localStorage.setItem('android_ide_clipboard_cache', textToCopy);
                        navigator.clipboard?.writeText(textToCopy).catch(() => {});
                      } catch {}
                      showCenterBigToast('CODE COPIED', 'Copied to clipboard', 'fa-copy', 'save');
                      onShowAlert('Code copied to clipboard');
                      setIsCopyOptionsOpen(false);
                    }}
                  >
                    <i className="fas fa-copy text-sky-400"></i>
                    <span>COPY</span>
                  </button>

                  {/* 3. PASTE */}
                  <button
                    type="button"
                    className="copy-floating-btn"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={async () => {
                      setIsCopyOptionsOpen(false);
                      let text = '';
                      try {
                        text = await navigator.clipboard.readText();
                      } catch {
                        // Browser/iframe clipboard read permission restricted; fall back to cached clipboard
                      }
                      if (!text || !text.trim()) {
                        try {
                          text = localStorage.getItem('android_ide_clipboard_cache') || '';
                        } catch {}
                      }
                      if (text && text.trim()) {
                        try {
                          localStorage.setItem('android_ide_clipboard_cache', text);
                        } catch {}
                        if (!activeFile || openFiles.length === 0) {
                          const validation = validateFileOpenForCode(text, activeFile, openFiles.length);
                          const autoExt = validation.requiredExt || '.html';
                          const autoFile =
                            autoExt === '.kt' ? 'MainActivity.kt' : autoExt === '.dart' ? 'main.dart' : 'index.html';
                          handleQuickOpenOrCreateFile(autoFile, text);
                          handleUserCodeChange(text);
                        } else if (!code || !code.trim()) {
                          handleUserCodeChange(text);
                        } else {
                          insertSymbol(text);
                        }
                        setTimeout(() => {
                          if (textareaRef.current) {
                            textareaRef.current.focus({ preventScroll: true });
                          }
                        }, 30);
                        showCenterBigToast('CODE PASTED', activeFile?.name || 'Pasted into editor', 'fa-paste', 'save');
                      } else {
                        if (textareaRef.current) {
                          textareaRef.current.focus();
                          try {
                            document.execCommand('paste');
                          } catch {}
                        }
                        showCenterBigToast('LONG PRESS TO PASTE', 'Hold inside code box & tap Paste', 'fa-paste', 'paste');
                      }
                    }}
                  >
                    <i className="fas fa-paste text-amber-400"></i>
                    <span>PASTE</span>
                  </button>

                  {/* 4. CUT */}
                  <button
                    type="button"
                    className="copy-floating-btn"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      let textToCut = '';
                      let newCode = code;
                      if (textareaRef.current) {
                        const start = textareaRef.current.selectionStart;
                        const end = textareaRef.current.selectionEnd;
                        if (start !== end) {
                          textToCut = code.substring(start, end);
                          newCode = code.substring(0, start) + code.substring(end);
                        }
                      }
                      if (!textToCut) {
                        textToCut = code;
                        newCode = '';
                      }
                      if (!textToCut || !textToCut.trim()) {
                        showCenterBigToast('NOTHING TO CUT', 'Editor is empty', 'fa-scissors', 'paste');
                        setIsCopyOptionsOpen(false);
                        return;
                      }
                      try {
                        localStorage.setItem('android_ide_clipboard_cache', textToCut);
                        navigator.clipboard?.writeText(textToCut).catch(() => {});
                      } catch {}
                      handleUserCodeChange(newCode);
                      showCenterBigToast('CODE CUT', 'Cut to clipboard', 'fa-scissors', 'save');
                      onShowAlert('Code cut to clipboard');
                      setIsCopyOptionsOpen(false);
                    }}
                  >
                    <i className="fas fa-scissors text-teal-400"></i>
                    <span>CUT</span>
                  </button>

                  {/* 5. DELETE ALL */}
                  <button
                    type="button"
                    className="copy-floating-btn btn-delete-danger"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (!code || !code.trim()) {
                        showCenterBigToast('EMPTY', 'Editor is already empty', 'fa-trash-can', 'paste');
                        setIsCopyOptionsOpen(false);
                        return;
                      }
                      handleUserCodeChange('');
                      showCenterBigToast('DELETED ALL', 'Editor cleared', 'fa-trash-can', 'save');
                      onShowAlert('Cleared all code');
                      setIsCopyOptionsOpen(false);
                    }}
                  >
                    <i className="fas fa-trash-can text-rose-400"></i>
                    <span>DELETE ALL</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="nav-icon-bg btn-action-save" title="Save Code" onClick={handleSaveClick}>
            <i className="fas fa-save"></i>
          </div>

          {/* Play / Run Button */}
          <div className="nav-icon-bg btn-action-play" title="Run Code" onClick={handlePlayClick}>
            <i className="fas fa-play"></i>
          </div>
        </div>
      </div>

      {/* Opened File Tabs Bar (Only shown when user selects or creates files from the 3-lines ≡ menu; no preset files or + buttons here) */}
      {openFiles.length > 0 && (
        <div
          className="editor-file-tabs-bar"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            overflowX: 'auto',
            padding: '4px 8px',
            background: '#0b0c14',
            borderBottom: '1px solid #1e2235',
          }}
        >
          {openFiles.map((file) => {
            const isActive = activeFile?.id === file.id;
            return (
              <div
                key={file.id}
                className={`editor-file-tab ${isActive ? 'tab-active' : ''}`}
                onClick={() => onSelectFile(file)}
              >
                <i
                  className={`fas ${
                    file.name.endsWith('.kt')
                      ? 'fa-file-code text-purple-400'
                      : file.name.endsWith('.java')
                      ? 'fa-mug-hot text-amber-500'
                      : file.name.endsWith('.dart')
                      ? 'fa-feather-pointed text-cyan-400'
                      : file.name.endsWith('.html')
                      ? 'fa-html5 text-orange-500'
                      : file.name.endsWith('.css')
                      ? 'fa-css3-alt text-blue-400'
                      : file.name.endsWith('.xml')
                      ? 'fa-code text-emerald-400'
                      : 'fa-file-code text-sky-400'
                  } file-tab-icon`}
                ></i>
                <span className="file-tab-name">{file.name}</span>
                {onCloseFileTab && (
                  <button
                    type="button"
                    className="file-tab-close"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseFileTab(file.id);
                    }}
                    title={`Close ${file.name}`}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Main Code Editor Area: Multi-Color Syntax Highlighting & 100% Exact Line-by-Line Alignment */}
      <div className="code-editor-bar">
        <div
          className="line-counter"
          id="line-nums"
          ref={lineCounterRef}
          style={{
            width: lineCount >= 1000 ? '48px' : lineCount >= 100 ? '40px' : '34px',
          }}
        >
          {Array.from({ length: lineCount }, (_, i) => {
            const lineNum = i + 1;
            return (
              <div
                key={lineNum}
                className="line-num-item"
                onClick={() => handleJumpToLine(lineNum)}
                title={`Line ${lineNum}`}
              >
                {lineNum}
              </div>
            );
          })}
        </div>
        <div
          className="code-editor-inner-wrap"
          style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Multi-color syntax highlight layer synchronized 1:1 with textarea and line numbers */}
          <div
            ref={syntaxBackdropRef}
            className="code-syntax-backdrop"
            aria-hidden="true"
          >
            {renderHighlightedLines(code)}
          </div>
          <textarea
            ref={textareaRef}
            id="code-area"
            wrap="off"
            spellCheck="false"
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            value={code}
            onChange={(e) => {
              handleUserCodeChange(e.target.value);
            }}
            onContextMenu={(e) => {
              // Prevent browser context menu popup when long-pressing code box
              e.preventDefault();
            }}
            onPaste={(e) => {
              const pasted = e.clipboardData?.getData('text') || '';
              if (pasted) {
                try {
                  localStorage.setItem('android_ide_clipboard_cache', pasted);
                } catch {}
                if (!activeFile || openFiles.length === 0) {
                  const validation = validateFileOpenForCode(pasted, activeFile, openFiles.length);
                  const autoExt = validation.requiredExt || '.html';
                  const autoFile =
                    autoExt === '.kt' ? 'MainActivity.kt' : autoExt === '.dart' ? 'main.dart' : 'index.html';
                  setTimeout(() => {
                    handleQuickOpenOrCreateFile(autoFile, pasted);
                  }, 10);
                }
              }
            }}
            onScroll={handleScroll}
            placeholder={
              activeFile
                ? `// Write or paste code in ${activeFile.name}...`
                : '// Write or paste code here...'
            }
            onKeyDown={(e) => {
              if (e.key === 'Tab') {
                e.preventDefault();
                insertSymbol('  ');
              }
            }}
          />
        </div>
      </div>

      {/* Run Output Console Modal */}
      {isRunModalOpen && (
        <div id="run-output-modal" className="run-output-box">
          <div className="run-header">
            <span>
              <i className="fas fa-terminal" style={{ marginRight: '6px' }}></i> Console Output
            </span>
            <i className="fas fa-times" onClick={onCloseRunModal}></i>
          </div>
          <pre id="consoleOutputText">{consoleOutput}</pre>
        </div>
      )}

      {/* TWO-ROW CODING SYMBOL BAR: Scroll buttons, Caret controls, Undo/Redo, Draggable symbols */}
      <div className={`bottom-symbol-dual-bar ${symbolBarPosition === 'top' ? 'symbol-bar-top' : ''}`}>
        {/* Far Left: Left Scroll Button */}
        <button
          className="scroll-nav-btn dual-nav-btn left-nav-btn"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => scrollSymbols(-180)}
          title="Scroll symbols left"
          type="button"
          tabIndex={-1}
        >
          <i className="fas fa-angles-left"></i>
        </button>

        {/* Center: Two Rows of Scrolling Controls and Symbols (Paired Columns - 100% vertically aligned) */}
        <div className="symbol-dual-scroll-container" id="symbolScroll" ref={symbolScrollRef}>
          <div className="symbol-dual-grid-track">
            {/* Control Column 1: Left (Top) & Up (Bottom) Carets */}
            <div className="symbol-pair-column">
              <button
                type="button"
                tabIndex={-1}
                className="dual-symbol-key ctrl-key-fixed"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleMoveCursor('left')}
                title="Move cursor left"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <button
                type="button"
                tabIndex={-1}
                className="dual-symbol-key ctrl-key-fixed"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleMoveCursor('up')}
                title="Move cursor up"
              >
                <i className="fas fa-chevron-up"></i>
              </button>
            </div>

            {/* Control Column 2: Right (Top) & Down (Bottom) Carets */}
            <div className="symbol-pair-column">
              <button
                type="button"
                tabIndex={-1}
                className="dual-symbol-key ctrl-key-fixed"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleMoveCursor('right')}
                title="Move cursor right"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
              <button
                type="button"
                tabIndex={-1}
                className="dual-symbol-key ctrl-key-fixed"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleMoveCursor('down')}
                title="Move cursor down"
              >
                <i className="fas fa-chevron-down"></i>
              </button>
            </div>

            {/* Control Column 3: Undo (Top) & Redo (Bottom) */}
            <div className="symbol-pair-column">
              <button
                type="button"
                tabIndex={-1}
                className="dual-symbol-key ctrl-undo-key"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleUndo}
                title="Undo (Ctrl+Z)"
              >
                <i className="fas fa-rotate-left"></i>
              </button>
              <button
                type="button"
                tabIndex={-1}
                className="dual-symbol-key ctrl-redo-key"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleRedo}
                title="Redo (Ctrl+Y)"
              >
                <i className="fas fa-rotate-right"></i>
              </button>
            </div>

            {/* Control Column 4: Reset Symbols (Top) & Tab Config (Bottom) */}
            <div className="symbol-pair-column">
              <button
                type="button"
                tabIndex={-1}
                className="dual-symbol-key ctrl-key-fixed"
                onMouseDown={(e) => e.preventDefault()}
                onClick={resetSymbolsToDefault}
                title="Reset Coding Symbols to Clean Default Alignment"
                style={{ color: '#a855f7' }}
              >
                <i className="fas fa-arrow-rotate-right"></i>
              </button>
              <button
                type="button"
                tabIndex={-1}
                className="dual-symbol-key ctrl-key-fixed"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setIsTabConfigOpen(true)}
                title="Configure Tab Spacing"
                style={{ color: '#10b981' }}
              >
                <i className="fas fa-sliders"></i>
              </button>
            </div>

            {/* Symbol Columns: Matched Pairs (দ্বারে দ্বারে জোড়া) */}
            {Array.from({ length: Math.max(row1Symbols.length, row2Symbols.length) }).map((_, idx) => {
              const s1 = row1Symbols[idx];
              const s2 = row2Symbols[idx];
              return (
                <div className="symbol-pair-column" key={`sym-pair-col-${idx}`}>
                  {/* Row 1 Button (Top) */}
                  {s1 !== undefined ? (
                    <button
                      key={`r1-${s1}-${idx}`}
                      type="button"
                      tabIndex={-1}
                      draggable
                      data-symbol-key="true"
                      data-row="1"
                      data-index={idx}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSymbolMouseDown(s1);
                      }}
                      onMouseUp={() => handleSymbolMouseUp(s1)}
                      onMouseLeave={() => handleSymbolMouseUp(s1)}
                      onContextMenu={(e) => {
                        if (s1 === 'Tab') {
                          e.preventDefault();
                          setIsTabConfigOpen(true);
                        }
                      }}
                      onDoubleClick={(e) => {
                        if (s1 === 'Tab') {
                          e.preventDefault();
                          setIsTabConfigOpen(true);
                        }
                      }}
                      onDragStart={(e) => handleSymbolDragStart(e, 1, idx, s1)}
                      onDragOver={(e) => handleSymbolDragOver(e, 1, idx)}
                      onDrop={handleSymbolDrop}
                      onTouchStart={(e) => handleSymbolTouchStart(e, 1, idx, s1)}
                      onTouchMove={handleSymbolTouchMove}
                      onTouchEnd={() => handleSymbolTouchEnd(s1)}
                      className={`dual-symbol-key ${
                        s1 === 'Tab'
                          ? `symbol-key-tab ${isTabHolding ? 'is-holding' : ''}`
                          : UI_TOKEN_SET.has(s1)
                          ? 'symbol-key-ui'
                          : CODE_KEYWORD_SET.has(s1)
                          ? 'symbol-key-kw'
                          : ''
                      } ${s1.length > 5 ? 'symbol-key-long' : ''} ${
                        dragState?.row === 1 && dragState?.index === idx ? 'is-dragging' : ''
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (tabHoldTriggeredRef.current) {
                          tabHoldTriggeredRef.current = false;
                          return;
                        }
                        if (Date.now() - lastTapTimeRef.current < 400) return;
                        insertSymbol(s1);
                      }}
                      title={
                        s1 === 'Tab'
                          ? `Tab (${tabSpaces} spaces) - Hold 10s or double-click to configure`
                          : `Insert "${s1}"`
                      }
                    >
                      {s1 === 'Tab' ? (
                        isTabHolding ? (
                          <span style={{ color: '#38bdf8', fontWeight: 800 }}>{tabHoldSeconds}s</span>
                        ) : (
                          'Tab'
                        )
                      ) : (
                        s1
                      )}
                    </button>
                  ) : (
                    <div style={{ height: '25px', minWidth: '32px' }} />
                  )}

                  {/* Row 2 Button (Bottom) */}
                  {s2 !== undefined ? (
                    <button
                      key={`r2-${s2}-${idx}`}
                      type="button"
                      tabIndex={-1}
                      draggable
                      data-symbol-key="true"
                      data-row="2"
                      data-index={idx}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSymbolMouseDown(s2);
                      }}
                      onMouseUp={() => handleSymbolMouseUp(s2)}
                      onMouseLeave={() => handleSymbolMouseUp(s2)}
                      onContextMenu={(e) => {
                        if (s2 === 'Tab') {
                          e.preventDefault();
                          setTabInputVal(String(tabSpaces));
                          setIsTabConfigOpen(true);
                        }
                      }}
                      onDoubleClick={(e) => {
                        if (s2 === 'Tab') {
                          e.preventDefault();
                          setTabInputVal(String(tabSpaces));
                          setIsTabConfigOpen(true);
                        }
                      }}
                      onDragStart={(e) => handleSymbolDragStart(e, 2, idx, s2)}
                      onDragOver={(e) => handleSymbolDragOver(e, 2, idx)}
                      onDrop={handleSymbolDrop}
                      onTouchStart={(e) => handleSymbolTouchStart(e, 2, idx, s2)}
                      onTouchMove={handleSymbolTouchMove}
                      onTouchEnd={() => handleSymbolTouchEnd(s2)}
                      className={`dual-symbol-key ${
                        s2 === 'Tab'
                          ? `symbol-key-tab ${isTabHolding ? 'is-holding' : ''}`
                          : UI_TOKEN_SET.has(s2)
                          ? 'symbol-key-ui'
                          : CODE_KEYWORD_SET.has(s2)
                          ? 'symbol-key-kw'
                          : ''
                      } ${s2.length > 5 ? 'symbol-key-long' : ''} ${
                        dragState?.row === 2 && dragState?.index === idx ? 'is-dragging' : ''
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (tabHoldTriggeredRef.current) {
                          tabHoldTriggeredRef.current = false;
                          return;
                        }
                        if (Date.now() - lastTapTimeRef.current < 400) return;
                        insertSymbol(s2);
                      }}
                      title={
                        s2 === 'Tab'
                          ? `Tab (${tabSpaces} spaces) - Hold 10s or double-click to configure`
                          : `Insert "${s2}"`
                      }
                    >
                      {s2 === 'Tab' ? (
                        isTabHolding ? (
                          <span style={{ color: '#38bdf8', fontWeight: 800 }}>{tabHoldSeconds}s</span>
                        ) : (
                          'Tab'
                        )
                      ) : (
                        s2
                      )}
                    </button>
                  ) : (
                    <div style={{ height: '25px', minWidth: '32px' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Far Right: Right Scroll Button */}
        <button
          className="scroll-nav-btn dual-nav-btn right-nav-btn"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => scrollSymbols(180)}
          title="Scroll symbols right"
          type="button"
          tabIndex={-1}
        >
          <i className="fas fa-angles-right"></i>
        </button>
      </div>

      {/* File Tree Context Action Modal (Delete, Share, Rename, Protect) on 3-Dots */}
      {contextTargetNode && (
        <div className="symbol-custom-overlay" onClick={() => setContextTargetNode(null)}>
          <div className="symbol-custom-sheet file-context-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <span className="sheet-title">
                <i
                  className={`fas ${contextTargetNode.type === 'folder' ? 'fa-folder text-yellow-500' : 'fa-file-code text-blue-400'}`}
                  style={{ marginRight: '8px' }}
                ></i>
                {contextTargetNode.name}
              </span>
              <button className="sheet-close" onClick={() => setContextTargetNode(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="sheet-actions">
              {/* Show Delete if it is a user-created folder or file */}
              {isUserCreatedNode(contextTargetNode) && (
                <button
                  type="button"
                  className="sheet-btn btn-danger"
                  onClick={() => handleDeleteNodeAction(contextTargetNode)}
                >
                  <i className="fas fa-trash"></i> Delete {contextTargetNode.type === 'folder' ? 'Folder' : 'File'}
                </button>
              )}
              {isUserCreatedNode(contextTargetNode) && (
                <button
                  type="button"
                  className="sheet-btn"
                  onClick={() => handleRenameNode(contextTargetNode)}
                >
                  <i className="fas fa-pen"></i> Rename
                </button>
              )}
            </div>

            {contextTargetNode.type === 'folder' && (
              <div className="sheet-actions" style={{ marginTop: '8px' }}>
                <button
                  type="button"
                  className="sheet-btn"
                  onClick={() => {
                    setTargetParentFolderId(contextTargetNode.id);
                    setContextTargetNode(null);
                    setIsCreateFileModalOpenLocal(true);
                  }}
                >
                  <i className="fas fa-file-circle-plus"></i> New File Inside
                </button>
                <button
                  type="button"
                  className="sheet-btn"
                  onClick={() => {
                    setTargetParentFolderId(contextTargetNode.id);
                    setContextTargetNode(null);
                    setIsCreateFolderModalOpen(true);
                  }}
                >
                  <i className="fas fa-folder-plus"></i> New Folder Inside
                </button>
              </div>
            )}

            <div className="sheet-actions" style={{ marginTop: '8px' }}>
              <button
                type="button"
                className="sheet-btn"
                onClick={() => handleShareNode(contextTargetNode)}
              >
                <i className="fas fa-share-nodes"></i> Share {contextTargetNode.type === 'folder' ? 'Folder' : 'File'}
              </button>
              {contextTargetNode.type === 'file' && (
                <button
                  type="button"
                  className="sheet-btn"
                  onClick={() => handleDownloadSingleFile(contextTargetNode)}
                >
                  <i className="fas fa-download"></i> Download File
                </button>
              )}
            </div>

            <div className="sheet-actions" style={{ marginTop: '8px' }}>
              {contextTargetNode.type === 'file' && (
                <button
                  type="button"
                  className="sheet-btn"
                  onClick={() => handleDuplicateFile(contextTargetNode)}
                >
                  <i className="fas fa-clone"></i> Duplicate File
                </button>
              )}
              <button
                type="button"
                className="sheet-btn"
                onClick={() => {
                  navigator.clipboard.writeText(contextTargetNode.name);
                  onShowAlert(`Copied: ${contextTargetNode.name}`);
                  setContextTargetNode(null);
                }}
              >
                <i className="fas fa-copy"></i> Copy Name
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Share Modal Dialog (When Web Share API is not available or manual options preferred) */}
      {shareModalNode && (
        <div className="in-app-dialog-overlay" onClick={() => setShareModalNode(null)}>
          <div className="in-app-dialog file-share-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="in-app-dialog-title">
              <i className="fas fa-share-nodes" style={{ color: '#007AFF', marginRight: '8px' }}></i>
              Share "{shareModalNode.name}"
            </div>
            <div className="in-app-dialog-desc">
              Share this file with other apps or save directly to device:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
              <button
                type="button"
                className="in-app-dialog-btn in-app-dialog-btn-primary"
                onClick={async () => {
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: shareModalNode.name,
                        text: shareModalNode.content || `// File: ${shareModalNode.name}`,
                      });
                      setShareModalNode(null);
                      return;
                    } catch (e) {}
                  }
                  navigator.clipboard.writeText(shareModalNode.content || '');
                  onShowAlert(`"${shareModalNode.name}" code copied to clipboard!`);
                  setShareModalNode(null);
                }}
              >
                <i className="fas fa-paper-plane" style={{ marginRight: '6px' }}></i> Share via Apps
              </button>
              <button
                type="button"
                className="in-app-dialog-btn"
                style={{ background: '#1c1c24', color: '#007AFF', border: '1px solid rgba(0, 122, 255, 0.4)' }}
                onClick={() => {
                  handleDownloadSingleFile(shareModalNode);
                  setShareModalNode(null);
                }}
              >
                <i className="fas fa-download" style={{ marginRight: '6px' }}></i> Download File Directly
              </button>
              <button
                type="button"
                className="in-app-dialog-btn in-app-dialog-btn-cancel"
                onClick={() => setShareModalNode(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Create Folder Modal */}
      {isCreateFolderModalOpen && (
        <div className="in-app-dialog-overlay" onClick={() => setIsCreateFolderModalOpen(false)}>
          <div className="in-app-dialog-card" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-title-row">
              <i className="fas fa-folder-plus text-yellow-500"></i>
              <h3>Create New Folder</h3>
            </div>
            <p className="dialog-subtext">Enter folder name to add to project tree:</p>
            <input
              type="text"
              className="dialog-input-field"
              value={newFolderNameInput}
              autoFocus
              onChange={(e) => setNewFolderNameInput(e.target.value)}
              placeholder="e.g. components, utils, assets"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmCreateFolder();
              }}
            />
            <div className="dialog-btn-row">
              <button
                type="button"
                className="dialog-cancel-btn"
                onClick={() => setIsCreateFolderModalOpen(false)}
              >
                CANCEL
              </button>
              <button
                type="button"
                className="dialog-ok-btn"
                onClick={handleConfirmCreateFolder}
              >
                CREATE FOLDER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Create File Modal */}
      {isCreateFileModalOpenLocal && (
        <div className="in-app-dialog-overlay" onClick={() => setIsCreateFileModalOpenLocal(false)}>
          <div className="in-app-dialog-card" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-title-row">
              <i className="fas fa-file-circle-plus text-sky-400"></i>
              <h3>Create New File</h3>
            </div>
            <p className="dialog-subtext">Enter file name with extension:</p>
            <input
              type="text"
              className="dialog-input-field"
              value={newFileNameInput}
              autoFocus
              onChange={(e) => setNewFileNameInput(e.target.value)}
              placeholder="e.g. MyScreen.kt, styles.css, app.js"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmCreateFile();
              }}
            />
            <div className="dialog-btn-row">
              <button
                type="button"
                className="dialog-cancel-btn"
                onClick={() => setIsCreateFileModalOpenLocal(false)}
              >
                CANCEL
              </button>
              <button
                type="button"
                className="dialog-ok-btn"
                onClick={handleConfirmCreateFile}
              >
                CREATE FILE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Rename Project Modal */}
      {isRenameProjectModalOpen && (
        <div className="in-app-dialog-overlay" onClick={() => setIsRenameProjectModalOpen(false)}>
          <div className="in-app-dialog-card" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-title-row">
              <i className="fas fa-pen-to-square text-emerald-400"></i>
              <h3>Change App / Project Name</h3>
            </div>
            <input
              type="text"
              className="dialog-input-field"
              value={renameProjectInput}
              autoFocus
              onChange={(e) => setRenameProjectInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmRenameProject();
              }}
            />
            <div className="dialog-btn-row">
              <button
                type="button"
                className="dialog-cancel-btn"
                onClick={() => setIsRenameProjectModalOpen(false)}
              >
                CANCEL
              </button>
              <button
                type="button"
                className="dialog-ok-btn"
                onClick={handleConfirmRenameProject}
              >
                SAVE NAME
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Rename Node Modal */}
      {isRenameNodeModalOpen && renameTargetNode && (
        <div className="in-app-dialog-overlay" onClick={() => setIsRenameNodeModalOpen(false)}>
          <div className="in-app-dialog-card" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-title-row">
              <i className="fas fa-pencil text-blue-400"></i>
              <h3>Rename {renameTargetNode.type === 'folder' ? 'Folder' : 'File'}</h3>
            </div>
            <input
              type="text"
              className="dialog-input-field"
              value={renameNodeInput}
              autoFocus
              onChange={(e) => setRenameNodeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmRenameNode();
              }}
            />
            <div className="dialog-btn-row">
              <button
                type="button"
                className="dialog-cancel-btn"
                onClick={() => setIsRenameNodeModalOpen(false)}
              >
                CANCEL
              </button>
              <button
                type="button"
                className="dialog-ok-btn"
                onClick={handleConfirmRenameNode}
              >
                RENAME
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Delete Confirmation Modal (Native Iframe Safe) */}
      {deleteTargetNode && (
        <div className="in-app-dialog-overlay" onClick={() => setDeleteTargetNode(null)}>
          <div className="in-app-dialog-card delete-confirm-card" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-title-row">
              <i className="fas fa-trash-can text-rose-500" style={{ fontSize: '20px', marginRight: '8px' }}></i>
              <h3 style={{ color: '#ffffff', margin: 0 }}>
                Delete {deleteTargetNode.type === 'folder' ? 'Folder' : 'File'}
              </h3>
            </div>
            <p className="dialog-subtext" style={{ margin: '12px 0 16px', fontSize: '13px', lineHeight: 1.5, color: '#cbd5e1' }}>
              Are you sure you want to permanently delete{' '}
              <strong style={{ color: '#f87171' }}>"{deleteTargetNode.name}"</strong>?
              {deleteTargetNode.type === 'folder' && (
                <span style={{ display: 'block', marginTop: '6px', color: '#fb7185', fontSize: '12px' }}>
                  ⚠️ All files and nested content inside this folder will also be removed.
                </span>
              )}
            </p>
            <div className="dialog-btn-row" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                className="dialog-cancel-btn"
                onClick={() => setDeleteTargetNode(null)}
              >
                CANCEL
              </button>
              <button
                type="button"
                className="dialog-ok-btn btn-danger"
                style={{
                  background: '#dc2626',
                  borderColor: '#ef4444',
                  color: '#ffffff',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(220, 38, 38, 0.4)',
                }}
                onClick={() => {
                  const nodeName = deleteTargetNode.name;
                  deleteNode(deleteTargetNode.id);
                  onShowAlert(`"${nodeName}" deleted`);
                  setDeleteTargetNode(null);
                }}
              >
                <i className="fas fa-trash-can" style={{ marginRight: '5px' }}></i> DELETE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Space Number Configuration Modal (Opened after 10s hold on Tab or double click) */}
      {isTabConfigOpen && (
        <div className="tab-config-overlay" onClick={() => setIsTabConfigOpen(false)}>
          <div className="tab-config-card space-number-card" onClick={(e) => e.stopPropagation()}>
            <div className="tab-config-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-arrow-right-to-bracket text-sky-400"></i>
                <h3 className="space-number-title">SPACE NUMBER</h3>
              </div>
              <button
                type="button"
                className="tab-config-close-btn"
                onClick={() => setIsTabConfigOpen(false)}
                title="Close"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="tab-config-body">
              {/* Search / Input Box */}
              <div className="tab-search-input-wrapper">
                <i className="fas fa-search tab-search-input-icon"></i>
                <input
                  type="number"
                  min="1"
                  max="32"
                  value={tabInputVal}
                  onChange={(e) => setTabInputVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleConfirmCustomTabSpaces();
                    }
                  }}
                  placeholder="ENTER SPACE NUMBER (e.g. 3, 5)"
                  className="tab-search-input"
                  autoFocus
                />
                {tabInputVal && (
                  <button
                    type="button"
                    className="tab-input-clear-btn"
                    onClick={() => setTabInputVal('')}
                    title="Clear"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>

              {/* Coding Symbol-style Space Options Toolbar Bar */}
              <div className="space-symbol-toolbar-bar">
                {[1, 2, 3, 4, 5, 6, 8].map((n) => (
                  <button
                    key={`space-sym-${n}`}
                    type="button"
                    className={`space-bar-btn ${tabInputVal === String(n) ? 'active-space-btn' : ''}`}
                    onClick={() => setTabInputVal(String(n))}
                  >
                    <span className="space-bar-num">{n}</span>
                    <span className="space-bar-txt">SPACE{n > 1 ? 'S' : ''}</span>
                  </button>
                ))}
              </div>

              {/* Live Preview Box */}
              <div className="tab-preview-box">
                <div className="tab-preview-header">
                  <span>LIVE INDENTATION PREVIEW:</span>
                  <span className="tab-preview-badge">
                    {parseInt(tabInputVal, 10) || 0} Spaces
                  </span>
                </div>
                <pre className="tab-preview-code">
                  <code>{`fun main() {\n${' '.repeat(Math.max(0, Math.min(24, parseInt(tabInputVal, 10) || 0)))}println("Hello World")\n}`}</code>
                </pre>
              </div>
            </div>

            <div className="tab-config-footer">
              <button
                type="button"
                className="dialog-cancel-btn"
                onClick={() => setIsTabConfigOpen(false)}
              >
                BACK
              </button>
              <button
                type="button"
                className="dialog-ok-btn"
                onClick={handleConfirmCustomTabSpaces}
              >
                CREATE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Small Clean Center Toast Badge (Mobile screen center in clean English letters) */}
      {centerBigToast && (
        <div className="compact-center-toast-wrap">
          <div className={`compact-center-toast toast-tone-${centerBigToast.tone}`}>
            <span>{centerBigToast.title}</span>
          </div>
        </div>
      )}

      {/* AI Code Assistant & Debugger & Generator Modal */}
      <AiCodeAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        activeFileName={activeFile ? activeFile.name : 'MainActivity.kt'}
        currentCode={code}
        onApplyCode={handleApplyAiCode}
        onShowAlert={onShowAlert}
        initialTab={aiModalTab}
        initialPrompt={aiModalPrompt}
      />

      {/* Full Application Live Preview Screen / Modal (Interactive Live Running App with App Logo + App Name + 3-Dots Menu) */}
      {isFullAppPreviewOpen && (
        <div
          className="practice-preview-overlay"
          style={{ zIndex: 99999 }}
          onClick={() => setIsPreviewMenuOpen(false)}
        >
          <div
            className="practice-preview-header"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 14px',
              background: '#0d0f18',
              borderBottom: '1px solid #1f2438',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Side: App Logo (Gallery or Code-Matched Auto Logo) + App Name */}
            <div className="preview-header-left" style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              {(appLogoUrl || previewAppLogoUrl) ? (
                <img
                  src={appLogoUrl || previewAppLogoUrl}
                  alt={previewAppName || projectTitle || 'App Logo'}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.45)',
                    flexShrink: 0,
                  }}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  <i className="fas fa-calculator"></i>
                </div>
              )}
              <span
                style={{
                  fontWeight: 800,
                  color: '#ffffff',
                  fontSize: '14px',
                  letterSpacing: '0.3px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {previewAppName || projectTitle || 'Calculator'}
              </span>
            </div>

            {/* Right Side: Three-Dots Menu Button (⋮) + Close Button (✕) */}
            <div className="preview-header-right" style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
              <button
                type="button"
                className="preview-control-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPreviewMenuOpen((prev) => !prev);
                }}
                title="App Options Menu"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: isPreviewMenuOpen ? 'rgba(56, 189, 248, 0.2)' : '#171a29',
                  border: isPreviewMenuOpen ? '1px solid #38bdf8' : '1px solid #2a3048',
                  color: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <i className="fas fa-ellipsis-vertical"></i>
              </button>

              <button
                type="button"
                className="preview-control-btn btn-close"
                onClick={() => {
                  setIsPreviewMenuOpen(false);
                  setIsFullAppPreviewOpen(false);
                }}
                title="Exit Preview"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <i className="fas fa-times"></i>
              </button>

              {/* Three-Dots Dropdown Menu inside Play Preview */}
              {isPreviewMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '42px',
                    right: '0',
                    zIndex: 100005,
                    background: '#131624',
                    border: '1px solid #2d3452',
                    borderRadius: '12px',
                    padding: '6px',
                    minWidth: '215px',
                    boxShadow: '0 14px 34px rgba(0, 0, 0, 0.85)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsPreviewMenuOpen(false);
                      onDownloadApk({
                        code,
                        activeFileName: activeFile?.name || 'index.html',
                        projectTitle: previewAppName || projectTitle || 'Calculator',
                        appLogoUrl: appLogoUrl || null,
                      });
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      background: 'rgba(16, 185, 129, 0.14)',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      color: '#34d399',
                      fontSize: '12px',
                      fontWeight: 800,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <i className="fab fa-android" style={{ fontSize: '15px' }}></i>
                    <span>Install / Download APK</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsPreviewMenuOpen(false);
                      galleryInputRef.current?.click();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      background: 'transparent',
                      border: 'none',
                      color: '#f1f5f9',
                      fontSize: '12px',
                      fontWeight: 700,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <i className="fas fa-image text-amber-400"></i>
                    <span>Change App Logo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsPreviewMenuOpen(false);
                      handlePlayClick();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      background: 'transparent',
                      border: 'none',
                      color: '#f1f5f9',
                      fontSize: '12px',
                      fontWeight: 700,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <i className="fas fa-rotate-right text-sky-400"></i>
                    <span>Reload Application</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsDesktopPreviewMode(!isDesktopPreviewMode);
                      setIsPreviewMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      background: 'transparent',
                      border: 'none',
                      color: '#f1f5f9',
                      fontSize: '12px',
                      fontWeight: 700,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <i className={`fas ${isDesktopPreviewMode ? 'fa-mobile-screen' : 'fa-expand'} text-purple-400`}></i>
                    <span>{isDesktopPreviewMode ? 'Switch to Phone View' : 'Full Screen View'}</span>
                  </button>

                  <div style={{ height: '1px', background: '#232840', margin: '2px 0' }} />

                  <button
                    type="button"
                    onClick={() => {
                      setIsPreviewMenuOpen(false);
                      setIsFullAppPreviewOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      background: 'transparent',
                      border: 'none',
                      color: '#fb7185',
                      fontSize: '12px',
                      fontWeight: 700,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <i className="fas fa-arrow-left"></i>
                    <span>Back to Code Editor</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div
            className="practice-preview-body"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#090a0f',
              padding: isDesktopPreviewMode ? '0' : '10px 0',
              flex: 1,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: isDesktopPreviewMode ? '100%' : '375px',
                maxWidth: '100%',
                height: '100%',
                transition: 'width 0.2s ease',
                boxShadow: isDesktopPreviewMode ? 'none' : '0 12px 36px rgba(0,0,0,0.85)',
                border: isDesktopPreviewMode ? 'none' : '1.5px solid #23273e',
                borderRadius: isDesktopPreviewMode ? '0' : '14px',
                overflow: 'hidden',
                background: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <iframe
                title="Full App Preview"
                srcDoc={fullAppPreviewHtml}
                sandbox="allow-scripts allow-modals allow-same-origin allow-forms"
                className="practice-preview-iframe"
                style={{ width: '100%', height: '100%', border: 'none', background: '#ffffff', flex: 1 }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
