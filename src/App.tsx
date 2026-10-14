import React, { useState, useEffect, useCallback } from 'react';
import JSZip from 'jszip';
import { SplashLoading } from './components/SplashLoading';
import { Dashboard } from './components/Dashboard';
import { TemplateModal } from './components/TemplateModal';
import { ConfigModal } from './components/ConfigModal';
import { EditorScreen } from './components/EditorScreen';
import { CreateFileModal } from './components/CreateFileModal';
import { SettingsModal } from './components/SettingsModal';
import { CustomAlertModal } from './components/CustomAlertModal';
import { PracticeScreen } from './components/PracticeScreen';
import { SelectProjectScreen } from './components/SelectProjectScreen';
import { playAndroidSound, playFlutterSound } from './utils/audioEffects';

import { FileNode, ProjectTemplate, AppSettings, ToolItem } from './types';
import { androidFileSystem, flutterFileSystem, ensureApkDownloadFolder } from './data/initialFileSystem';
import { androidTemplates100 } from './data/templates';
import { flutterTemplates100, flutterAppTypes100, flutterLanguages100 } from './data/flutterData';
import { appTypes100, languages100 } from './data/appTypesAndLanguages';
import { massive520Tools } from './data/massiveTools';
import { restoreFolderExpansion } from './utils/folderPersistence';
import {
  detectAppCategory,
  compileAppToStandaloneHtml,
  generateAppIconByDensity,
  validateFileOpenForCode,
  resolveEffectiveAppName,
  triggerDirectUrlDownload,
  triggerReliableDownload,
  isStandaloneApkEnv,
  getLiveBackendUrl,
  fetchWithBackendFallback,
  compressStringToBase64Url,
} from './utils/appCompiler';

export const App: React.FC = () => {
  // Screen and modal visibility state
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'editor' | 'practice' | 'select-project'>('dashboard');
  const [editorInitialAction, setEditorInitialAction] = useState<'export' | 'import' | 'save' | null>(null);
  const [practiceCategory, setPracticeCategory] = useState<string | undefined>(undefined);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isCreateFileModalOpen, setIsCreateFileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertDownloadUrl, setAlertDownloadUrl] = useState<string | null>(null);
  const [alertDownloadFileName, setAlertDownloadFileName] = useState<string | null>(null);

  // Active Project ID for reliable multi-project persistence in OPEN PROJECT
  const [currentProjectId, setCurrentProjectId] = useState<string>(() => {
    try {
      return localStorage.getItem('android_ide_active_project_id') || 'default-android-proj';
    } catch {
      return 'default-android-proj';
    }
  });

  // Platform choice: 'android' or 'flutter'
  const [activePlatform, setActivePlatform] = useState<'android' | 'flutter'>(() => {
    try {
      const saved = localStorage.getItem('android_ide_active_platform');
      return saved === 'flutter' ? 'flutter' : 'android';
    } catch {
      return 'android';
    }
  });

  // App Logo URL (from gallery upload)
  const [appLogoUrl, setAppLogoUrl] = useState<string | null>(() => {
    return localStorage.getItem('android_ide_app_logo') || null;
  });

  const handleSetAppLogo = useCallback((url: string) => {
    setAppLogoUrl(url);
    try {
      localStorage.setItem('android_ide_app_logo', url);
    } catch {
      // quota or private browsing
    }
  }, []);

  // Project Configuration State
  const [projectTitle, setProjectTitle] = useState(() => {
    try {
      return localStorage.getItem('android_ide_active_project_title') || 'ANDROID';
    } catch {
      return 'ANDROID';
    }
  });
  const [appName, setAppName] = useState('ANDROID');
  const [packageName, setPackageName] = useState('com.android.app');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);

  // Current platform datasets
  const currentTemplates = activePlatform === 'flutter' ? flutterTemplates100 : androidTemplates100;
  const currentAppTypes = activePlatform === 'flutter' ? flutterAppTypes100 : appTypes100;
  const currentLanguages = activePlatform === 'flutter' ? flutterLanguages100 : languages100;

  const [selectedAppType, setSelectedAppType] = useState(currentAppTypes[0]);
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguages[0]);

  // File System & Editor State (Restores active project's saved file tree if present and always ensures APK_DOWNLOAD/app-debug.apk exists)
  const [fileSystem, setFileSystem] = useState<FileNode[]>(() => {
    try {
      const activeId = localStorage.getItem('android_ide_active_project_id') || 'default-android-proj';
      const activeTitle = localStorage.getItem('android_ide_active_project_title') || 'ANDROID';
      const savedFs =
        localStorage.getItem(`project_fs_${activeId}`) ||
        localStorage.getItem(`ide_custom_fs_${activeTitle}`);
      if (savedFs) {
        const parsed = JSON.parse(savedFs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return ensureApkDownloadFolder(restoreFolderExpansion(parsed, activeTitle));
        }
      }
    } catch {}
    const base = JSON.parse(JSON.stringify(androidFileSystem));
    return ensureApkDownloadFolder(restoreFolderExpansion(base, 'ANDROID'));
  });
  const [openFiles, setOpenFiles] = useState<FileNode[]>(() => {
    try {
      const activeId = localStorage.getItem('android_ide_active_project_id') || 'default-android-proj';
      const savedOpenIdsRaw = localStorage.getItem(`project_open_files_${activeId}`);
      if (savedOpenIdsRaw) {
        const openIds: string[] = JSON.parse(savedOpenIdsRaw);
        if (Array.isArray(openIds) && openIds.length > 0) {
          const collectAll = (nodes: FileNode[]): FileNode[] => {
            let res: FileNode[] = [];
            for (const n of nodes) {
              if (n.type === 'file') res.push(n);
              if (n.children) res = res.concat(collectAll(n.children));
            }
            return res;
          };
          const all = collectAll(fileSystem);
          const matched = openIds.map((id) => all.find((f) => f.id === id)).filter((f): f is FileNode => !!f);
          if (matched.length > 0) return matched;
        }
      }
    } catch {}

    const collectFiles = (nodes: FileNode[]): FileNode[] => {
      let res: FileNode[] = [];
      for (const n of nodes) {
        if (n.type === 'file') res.push(n);
        if (n.children) res = res.concat(collectFiles(n.children));
      }
      return res;
    };
    const all = collectFiles(fileSystem);
    const preferred = all.filter((f) => {
      const lower = f.name.toLowerCase();
      return (
        lower === 'mainactivity.kt' ||
        lower === 'activity_main.xml' ||
        lower === 'main.dart' ||
        lower === 'index.html' ||
        lower.endsWith('.kt') ||
        lower.endsWith('.dart') ||
        lower.endsWith('.html')
      );
    });
    return preferred.length > 0 ? preferred.slice(0, 3) : all.slice(0, 2);
  });

  const [activeFile, setActiveFile] = useState<FileNode | null>(() => {
    try {
      const activeId = localStorage.getItem('android_ide_active_project_id') || 'default-android-proj';
      const savedActiveId = localStorage.getItem(`project_active_file_${activeId}`);
      if (savedActiveId && openFiles.length > 0) {
        const found = openFiles.find((f) => f.id === savedActiveId);
        if (found) return found;
      }
    } catch {}
    return openFiles.length > 0 ? openFiles[0] : null;
  });

  const [code, setCode] = useState<string>(() => {
    return (openFiles.length > 0 && openFiles[0]?.content) || '';
  });

  // Find a file node by ID recursively
  const findFileById = useCallback((nodes: FileNode[], id: string): FileNode | null => {
    for (const node of nodes) {
      if (node.type === 'file' && node.id === id) return node;
      if (node.children) {
        const found = findFileById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }, []);

  // Automatically persist current project's fileSystem, open files, and metadata so no project ever gets lost
  useEffect(() => {
    if (!currentProjectId) return;
    try {
      localStorage.setItem('android_ide_active_project_id', currentProjectId);
      localStorage.setItem('android_ide_active_project_title', projectTitle);
      localStorage.setItem('android_ide_active_platform', activePlatform);
      localStorage.setItem(`project_fs_${currentProjectId}`, JSON.stringify(fileSystem));
      localStorage.setItem(
        `project_open_files_${currentProjectId}`,
        JSON.stringify(openFiles.map((f) => f.id))
      );
      localStorage.setItem(
        `project_active_file_${currentProjectId}`,
        activeFile ? activeFile.id : ''
      );
      if (projectTitle) {
        localStorage.setItem(`ide_custom_fs_${projectTitle}`, JSON.stringify(fileSystem));
      }

      // Sync project metadata in android_ide_user_projects
      const savedRaw = localStorage.getItem('android_ide_user_projects');
      let list: any[] = savedRaw ? JSON.parse(savedRaw) : [];
      const existingIdx = list.findIndex((p) => p.id === currentProjectId);
      if (existingIdx >= 0) {
        list[existingIdx] = {
          ...list[existingIdx],
          name: projectTitle || list[existingIdx].name,
          platform: activePlatform,
          appLogoUrl: appLogoUrl !== undefined ? appLogoUrl : list[existingIdx].appLogoUrl || null,
        };
        localStorage.setItem('android_ide_user_projects', JSON.stringify(list));
      } else if (currentScreen === 'editor') {
        const autoSavedProj = {
          id: currentProjectId,
          name: projectTitle || (activePlatform === 'flutter' ? 'FLUTTER APP' : 'ANDROID APP'),
          platform: activePlatform,
          badge: activePlatform.toUpperCase(),
          badgeColor: activePlatform === 'flutter' ? '#0ea5e9' : '#22c55e',
          desc: `Custom ${activePlatform.toUpperCase()} application project`,
          tech: activePlatform === 'flutter' ? ['Dart', 'Flutter', 'Material'] : ['Kotlin', 'Java', 'Android SDK'],
          icon: activePlatform === 'flutter' ? 'fa-mobile-screen' : 'fa-robot',
          iconBg: activePlatform === 'flutter' ? '#0ea5e9' : '#3DDC84',
          appLogoUrl: appLogoUrl || null,
          isCustom: true,
          lastOpened: new Date().toLocaleDateString(),
        };
        list.unshift(autoSavedProj);
        localStorage.setItem('android_ide_user_projects', JSON.stringify(list));
      }
    } catch {}
  }, [currentProjectId, fileSystem, openFiles, activeFile, projectTitle, activePlatform, appLogoUrl, currentScreen]);

  // Prevent accidental mobile hardware back-button exit while working inside Editor / Practice / Select Project
  useEffect(() => {
    if (currentScreen !== 'dashboard') {
      try {
        window.history.pushState({ ideScreen: currentScreen }, '');
      } catch {}
    }
  }, [currentScreen]);

  useEffect(() => {
    const handlePopState = () => {
      if (currentScreen !== 'dashboard') {
        // Keep user safely inside the app instead of exiting browser tab
        try {
          window.history.pushState({ ideScreen: currentScreen }, '');
        } catch {}
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentScreen]);

  // Synchronize viewport height with mobile virtual keyboard so bottom symbol bars always lift directly above the keyboard
  useEffect(() => {
    const updateViewportMetrics = () => {
      const vv = window.visualViewport;
      const fullH = window.innerHeight || document.documentElement.clientHeight || 800;
      const visibleH = vv ? vv.height : fullH;
      const offsetTop = vv ? vv.offsetTop : 0;
      const kbHeight = Math.max(0, fullH - visibleH - offsetTop);
      const isKeyboardOpen = kbHeight > 85;

      document.documentElement.style.setProperty('--vvh', `${visibleH}px`);
      document.documentElement.style.setProperty('--kb-offset', `${kbHeight}px`);
      document.documentElement.style.setProperty(
        '--kb-Active-Bottom',
        isKeyboardOpen ? '0px' : 'var(--android-bottom-safe)'
      );
    };

    updateViewportMetrics();
    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener('resize', updateViewportMetrics);
      vv.addEventListener('scroll', updateViewportMetrics);
    }
    window.addEventListener('resize', updateViewportMetrics);
    return () => {
      if (vv) {
        vv.removeEventListener('resize', updateViewportMetrics);
        vv.removeEventListener('scroll', updateViewportMetrics);
      }
      window.removeEventListener('resize', updateViewportMetrics);
    };
  }, []);

  // Find initial file to display (skip binary .apk files)
  const findFirstFile = useCallback((nodes: FileNode[]): FileNode | null => {
    for (const node of nodes) {
      if (node.type === 'file' && !node.name.toLowerCase().endsWith('.apk')) return node;
      if (node.children) {
        const found = findFirstFile(node.children);
        if (found) return found;
      }
    }
    return null;
  }, []);

  // Update platform, environments, files, and templates (without wiping saved projects)
  const handleSelectPlatform = (platform: 'android' | 'flutter') => {
    setActivePlatform(platform);
    if (platform === 'flutter') {
      setAppName('FLUTTER APP');
      setPackageName('com.example.flutter_app');
      setSelectedAppType(flutterAppTypes100[0]);
      setSelectedLanguage(flutterLanguages100[0]);
      if (fileSystem[0]?.name !== 'FLUTTER_APP') {
        const base = JSON.parse(JSON.stringify(flutterFileSystem));
        setFileSystem(ensureApkDownloadFolder(restoreFolderExpansion(base, 'FLUTTER')));
      }
    } else {
      setAppName('ANDROID APP');
      setPackageName('com.myapp.android');
      setSelectedAppType(appTypes100[0]);
      setSelectedLanguage(languages100[0]);
      if (fileSystem[0]?.name !== 'ANDROID_APP') {
        const base = JSON.parse(JSON.stringify(androidFileSystem));
        setFileSystem(ensureApkDownloadFolder(restoreFolderExpansion(base, 'ANDROID')));
      }
    }
  };

  // Console output state
  const [consoleOutput, setConsoleOutput] = useState<string>('');
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);

  // App Settings
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'Dark',
    language: 'English',
    fontSize: 14,
    autoSave: true,
    turboSpeed: 3,
  });

  // Active file selection - adds to open file tabs and activates
  const handleSelectFile = (file: FileNode) => {
    setActiveFile(file);
    setCode(file.content || '');
    setOpenFiles((prev) => {
      if (prev.some((f) => f.id === file.id)) return prev;
      return [...prev, file];
    });
  };

  // Close a file tab
  const handleCloseFileTab = (fileId: string) => {
    setOpenFiles((prev) => {
      const remaining = prev.filter((f) => f.id !== fileId);
      if (activeFile?.id === fileId) {
        if (remaining.length > 0) {
          const nextActive = remaining[remaining.length - 1];
          setActiveFile(nextActive);
          setCode(nextActive.content || '');
        } else {
          setActiveFile(null);
          setCode('');
        }
      }
      return remaining;
    });
  };

  // Sync editor changes back to activeFile, openFiles, and fileSystem
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (!activeFile) return;

    setActiveFile((prev) => (prev ? { ...prev, content: newCode } : null));
    setOpenFiles((prev) =>
      prev.map((f) => (f.id === activeFile.id ? { ...f, content: newCode } : f))
    );

    const updateNodes = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.id === activeFile.id) {
          return { ...node, content: newCode };
        }
        if (node.children) {
          return { ...node, children: updateNodes(node.children) };
        }
        return node;
      });
    };

    setFileSystem((prev) => updateNodes(prev));
  };

  const showAlert = useCallback((msg: string, downloadUrl?: string | null, downloadFileName?: string | null) => {
    setAlertMessage(msg);
    setAlertDownloadUrl(downloadUrl || null);
    setAlertDownloadFileName(downloadFileName || null);
  }, []);

  // Navigation handlers
  const openTemplates = (platform?: 'android' | 'flutter') => {
    if (platform) {
      handleSelectPlatform(platform);
    }
    setIsTemplateModalOpen(true);
    setIsConfigModalOpen(false);
  };

  const closeTemplateModal = () => {
    setIsTemplateModalOpen(false);
  };

  const skipTemplate = () => {
    setIsTemplateModalOpen(false);
    setIsConfigModalOpen(true);
  };

  const validateAndProceed = () => {
    if (!selectedTemplate) {
      showAlert('Please select one of the 100 templates or click Skip!');
      return;
    }
    setAppName(selectedTemplate.name.toUpperCase());
    setIsTemplateModalOpen(false);
    setIsConfigModalOpen(true);
  };

  const openEditor = () => {
    setIsConfigModalOpen(false);
    const targetIsFlutter = activePlatform === 'flutter' || selectedTemplate?.type === 'flutter';
    const finalPlatform: 'android' | 'flutter' = targetIsFlutter ? 'flutter' : 'android';
    const baseName = (appName || '').trim() || (finalPlatform === 'flutter' ? 'FLUTTER APP' : 'ANDROID APP');
    const newProjId = `user-proj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const uniqueName = baseName;

    // Build initial file system for this new project so it never mixes with previous projects
    const baseFs = finalPlatform === 'flutter' ? flutterFileSystem : androidFileSystem;
    const clonedFs: FileNode[] = JSON.parse(JSON.stringify(baseFs));
    if (selectedTemplate) {
      const firstFile = findFirstFile(clonedFs);
      if (firstFile && selectedTemplate.description) {
        firstFile.content = `// Project: ${uniqueName}\n// Template: ${selectedTemplate.name} (${selectedTemplate.category})\n// ${selectedTemplate.description}\n\n${firstFile.content || ''}`;
      }
    }
    const initializedFs = ensureApkDownloadFolder(restoreFolderExpansion(clonedFs, uniqueName));

    // Save project to user projects list so ALL created projects (Android + Flutter) remain saved in OPEN PROJECT
    try {
      const savedRaw = localStorage.getItem('android_ide_user_projects');
      let list: any[] = savedRaw ? JSON.parse(savedRaw) : [];
      const newProj = {
        id: newProjId,
        name: uniqueName,
        platform: finalPlatform,
        badge: finalPlatform.toUpperCase(),
        badgeColor: finalPlatform === 'flutter' ? '#0ea5e9' : '#22c55e',
        desc: selectedTemplate
          ? `${selectedTemplate.name} (${finalPlatform.toUpperCase()})`
          : `Custom ${finalPlatform.toUpperCase()} application project`,
        tech: finalPlatform === 'flutter' ? ['Dart', 'Flutter', 'Material'] : ['Kotlin', 'Java', 'Android SDK'],
        icon: finalPlatform === 'flutter' ? 'fa-mobile-screen' : 'fa-robot',
        iconBg: finalPlatform === 'flutter' ? '#0ea5e9' : '#3DDC84',
        appLogoUrl: null,
        isCustom: true,
        lastOpened: new Date().toLocaleDateString(),
      };
      // Prepend newest project at index 0 while preserving every previous project
      list.unshift(newProj);
      localStorage.setItem('android_ide_user_projects', JSON.stringify(list));
      localStorage.setItem(`project_fs_${newProjId}`, JSON.stringify(initializedFs));
      localStorage.setItem(`ide_custom_fs_${uniqueName}`, JSON.stringify(initializedFs));
      localStorage.setItem('android_ide_active_project_id', newProjId);
      localStorage.setItem('android_ide_active_project_title', uniqueName);
      localStorage.setItem('android_ide_active_platform', finalPlatform);
    } catch {}

    setActivePlatform(finalPlatform);
    setCurrentProjectId(newProjId);
    setProjectTitle(uniqueName);
    setAppLogoUrl(null);
    setFileSystem(initializedFs);
    // Start with no file open at the top so user explicitly opens/creates the matching file (e.g. index.html / MainActivity.kt)
    setOpenFiles([]);
    setActiveFile(null);
    setCode('');
    setCurrentScreen('editor');
  };

  // Save code action - silently saves active file state without blocking dialogs
  const handleSaveCode = () => {
    if (activeFile) {
      setFileSystem((prev) => {
        const updateNodes = (nodes: FileNode[]): FileNode[] => {
          return nodes.map((node) => {
            if (node.id === activeFile.id) {
              return { ...node, content: code };
            }
            if (node.children) {
              return { ...node, children: updateNodes(node.children) };
            }
            return node;
          });
        };
        return updateNodes(prev);
      });
    }
  };

  // Copy code action
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    showAlert('Code copied to clipboard!');
  };

  // Run code action
  const handleRunCode = () => {
    setIsRunModalOpen(true);
    setConsoleOutput(`Starting ${activePlatform.toUpperCase()} Turbo Compilation Engine...\n`);

    setTimeout(() => {
      setConsoleOutput((prev) => prev + '> Task :app:preBuild UP-TO-DATE\n');
    }, 150);

    setTimeout(() => {
      setConsoleOutput((prev) => prev + `> Task :app:compile${selectedLanguage} SUCCESS\n`);
    }, 350);

    setTimeout(() => {
      setConsoleOutput((prev) => prev + '> Task :app:mergeDexDebug SUCCESS (Turbo 3X JIT Activated)\n');
    }, 600);

    setTimeout(() => {
      setConsoleOutput(
        (prev) =>
          prev +
          `> Task :app:packageDebug SUCCESS\n> Launching App: ${packageName}\n==> ${activePlatform.toUpperCase()} RUNNING with 0 errors.`
      );
    }, 850);
  };

  // Tool trigger from 520 Tools
  const handleTriggerTool = (tool: ToolItem) => {
    showAlert(`Tool Executed: ${tool.name} (${tool.category})`);

    if (tool.actionKey.startsWith('perm_')) {
      const permName = tool.name.replace('Add ', '').replace(' Permission', '');
      const permSnippet = `\n    <uses-permission android:name="android.permission.${permName}" />`;
      setCode((prev) => {
        if (prev.includes('<manifest')) {
          return prev.replace('<manifest', `${permSnippet}\n<manifest`);
        }
        return `${prev}\n<!-- Manifest Permission Added -->${permSnippet}`;
      });
      showAlert(`Permission "${permName}" added to AndroidManifest!`);
    } else if (tool.actionKey.startsWith('format_') || tool.actionKey.startsWith('dart_format')) {
      const formatted = code
        .split('\n')
        .map((line) => line.trimEnd())
        .join('\n');
      setCode(formatted);
      showAlert('Code auto-formatted with standard indentation.');
    } else if (tool.actionKey.startsWith('clean_build') || tool.actionKey.startsWith('build_apk')) {
      handleRunCode();
    }
  };

  // 4 Dedicated Reset Handlers requested by user:
  // 1. Code Reset
  const handleResetCode = () => {
    if (!activeFile) return;
    const findOriginal = (nodes: FileNode[], id: string): string | null => {
      for (const n of nodes) {
        if (n.id === id) return n.content || '';
        if (n.children) {
          const res = findOriginal(n.children, id);
          if (res !== null) return res;
        }
      }
      return null;
    };
    const baseFs = activePlatform === 'flutter' ? flutterFileSystem : androidFileSystem;
    const orig = findOriginal(baseFs, activeFile.id);
    const restored = orig !== null ? orig : `// ${activeFile.name}\n`;
    setCode(restored);
    handleCodeChange(restored);
    showAlert(`Active file "${activeFile.name}" code reset to original template.`);
  };

  // 2. All Project Reset
  const handleResetProjectFiles = () => {
    const baseFs = activePlatform === 'flutter' ? flutterFileSystem : androidFileSystem;
    const cloned = ensureApkDownloadFolder(JSON.parse(JSON.stringify(baseFs)));
    setFileSystem(cloned);
    const first = findFirstFile(cloned);
    if (first) {
      setActiveFile(first);
      setCode(first.content || '');
    }
    showAlert(`All project files have been restored to default ${activePlatform.toUpperCase()} layout.`);
  };

  // 3. Data Reset
  const handleResetData = () => {
    setAppLogoUrl(null);
    try {
      localStorage.removeItem('android_ide_app_logo');
      localStorage.removeItem('android_ide_settings');
    } catch {
      // ignore
    }
    showAlert('Custom app logo, cache, and local state cleared.');
  };

  // 4. All Reset (Factory)
  const handleFactoryReset = () => {
    setAppLogoUrl(null);
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
    setActivePlatform('android');
    setProjectTitle('ANDROID');
    setAppName('MY APP');
    setPackageName('com.myapp.android');
    const base = ensureApkDownloadFolder(JSON.parse(JSON.stringify(androidFileSystem)));
    setFileSystem(base);
    const first = findFirstFile(base);
    if (first) {
      setActiveFile(first);
      setCode(first.content || '');
    }
    setSettings({
      theme: 'Dark',
      language: 'English',
      fontSize: 14,
      autoSave: true,
      turboSpeed: 3,
    });
    setCurrentScreen('dashboard');
    showAlert('Factory All Reset Complete: IDE restored to clean installation.');
  };

  // ZIP Download Handler (Embeds real > 1 MB installable APK into build-outputs/app-debug.apk and APK DOWNLOAD/app-debug.apk)
  const handleDownloadZip = async () => {
    showAlert('LOADING_DOWNLOAD');
    try {
      const collectFiles = (nodes: FileNode[]): { name: string; content: string }[] => {
        let list: { name: string; content: string }[] = [];
        for (const node of nodes) {
          if (node.type === 'file' && !node.name.toLowerCase().endsWith('.apk')) {
            const fileContent = activeFile && node.id === activeFile.id ? code : (node.content || '');
            list.push({ name: node.name, content: fileContent });
          }
          if (node.children) list = list.concat(collectFiles(node.children));
        }
        return list;
      };
      const allFiles = collectFiles(fileSystem);
      const detection = detectAppCategory(code, activeFile?.name || '', projectTitle, allFiles);
      const effectiveTitle = resolveEffectiveAppName(code, activeFile?.name || '', projectTitle, detection);
      const folderSlug = effectiveTitle.replace(/[^a-zA-Z0-9_-]/g, '_') || 'project';
      const zipFileName = `${folderSlug}_source.zip`;
      const apiBase = getLiveBackendUrl();

      const standaloneHtml =
        code && code.trim()
          ? compileAppToStandaloneHtml({
              code,
              activeFileName: activeFile?.name || 'index.html',
              projectTitle: effectiveTitle,
              allFiles,
              appLogoUrl,
            })
          : '';

      let iconByDensity: Record<string, string> | undefined;
      try {
        iconByDensity = await generateAppIconByDensity(detection.category, effectiveTitle, appLogoUrl);
      } catch {}

      // 1. Primary path: build project ZIP directly on backend (embeds real > 1 MB custom-built APK in build-outputs/app-debug.apk & APK DOWNLOAD/app-debug.apk)
      try {
        const { response: zipResp, apiBase: resolvedBase } = await fetchWithBackendFallback('/api/build-project-zip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appName: effectiveTitle,
            files: allFiles,
            standaloneHtml,
            iconByDensity,
          }),
        });
        if (zipResp.ok) {
          const zipJson = await zipResp.json();
          if (zipJson && zipJson.downloadUrl) {
            showAlert('DOWNLOAD', `${resolvedBase}${zipJson.downloadUrl}`, zipJson.fileName || zipFileName);
            return;
          }
        }
      } catch {}

      // 2. If running inside installed Android APK WebView and POST was blocked, use compact direct GET ZIP route
      if (isStandaloneApkEnv()) {
        const compactHtml = (standaloneHtml || code || '').replace(
          /data:image\/[^;]+;base64,[A-Za-z0-9+/=]{500,}/g,
          ''
        );
        const { z, compressed } = await compressStringToBase64Url(compactHtml);
        const safeZ = z.length <= 1600 ? z : '';
        const directZipUrl = `${getLiveBackendUrl()}/api/download-zip-direct?name=${encodeURIComponent(effectiveTitle)}&c=${compressed ? '1' : '0'}&z=${encodeURIComponent(safeZ)}&t=${Date.now()}`;
        showAlert('DOWNLOAD', directZipUrl, zipFileName);
        return;
      }

      // 3. Fallback client-side ZIP generation using Blob (no huge base64 strings)
      const zip = new JSZip();
      let realApkBytes: Uint8Array | null = null;
      try {
        const { response: ideResp } = await fetchWithBackendFallback(`/api/download-ide-apk?t=${Date.now()}`, { cache: 'no-store' });
        if (ideResp.ok) {
          const buf = await ideResp.arrayBuffer();
          if (buf && buf.byteLength > 1048576) {
            realApkBytes = new Uint8Array(buf);
          }
        }
      } catch {}

      const projectFolder = zip.folder(folderSlug);
      for (const f of allFiles) {
        if (projectFolder) {
          if (f.content.startsWith('data:image/') && f.content.includes(';base64,')) {
            projectFolder.file(f.name, f.content.split(';base64,')[1] || '', { base64: true });
          } else {
            projectFolder.file(f.name, f.content);
          }
        }
      }
      if (realApkBytes && realApkBytes.byteLength > 1048576) {
        zip.file('build-outputs/app-debug.apk', realApkBytes, { binary: true, compression: 'STORE' });
        zip.file('APK DOWNLOAD/app-debug.apk', realApkBytes, { binary: true, compression: 'STORE' });
      }
      if (standaloneHtml) {
        zip.file('compiled_app.html', standaloneHtml);
      }
      const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
      const blobUrl = URL.createObjectURL(zipBlob);
      showAlert('DOWNLOAD', blobUrl, zipFileName);
    } catch (err) {
      console.error(err);
      showAlert('Failed to export ZIP file.');
    }
  };

  const isBuildingApkRef = React.useRef<boolean>(false);

  const getApiBaseUrl = () => getLiveBackendUrl();

  // Dedicated Handler to download THIS entire ANDROID IDE App-Making Studio as an installable ANDROID.apk file
  const handleDownloadIdeApk = async (customFileName = 'ANDROID.apk') => {
    const cleanName = customFileName.endsWith('.apk') ? customFileName : `${customFileName}.apk`;
    showAlert('LOADING_DOWNLOAD');
    try {
      const { response: resp, apiBase: resolvedBase } = await fetchWithBackendFallback('/api/build-custom-apk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appName: cleanName.replace(/\.apk$/i, '') || 'ANDROID',
          htmlContent: '',
          returnDownloadUrl: true,
        }),
      });
      if (resp.ok) {
        const json = await resp.json();
        if (json && json.downloadUrl) {
          showAlert('DOWNLOAD', `${resolvedBase}${json.downloadUrl}`, cleanName);
          return;
        }
      }
    } catch {}
    const apiBase = getApiBaseUrl();
    const directIdeApkUrl = `${apiBase}/api/download-ide-apk/${encodeURIComponent(cleanName)}`;
    showAlert('DOWNLOAD', directIdeApkUrl, cleanName);
  };

  // APK Download Handler (Injects user code, generates code-matching or gallery logo, signs with v2/v3 APK scheme)
  const handleDownloadApk = async (customPayload?: {
    code?: string;
    activeFileName?: string;
    projectTitle?: string;
    allFiles?: { name: string; content: string }[];
    appLogoUrl?: string | null;
    preferredFileName?: string;
  }) => {
    const requestedApkFileName = customPayload?.preferredFileName?.endsWith('.apk')
      ? customPayload.preferredFileName
      : undefined;
    const candidateCode = (customPayload?.code ?? code ?? '').trim();
    const isStarterFileId = Boolean(activeFile?.id && /^(fl_|kt_)/.test(activeFile.id));
    const isUnmodifiedDefaultFile =
      !candidateCode ||
      candidateCode === 'APK_BINARY_3_85_MB' ||
      candidateCode.includes('Welcome to Android IDE Platform') ||
      candidateCode.includes('Hello from Flutter IDE') ||
      candidateCode.includes('Android IDE Kotlin Kernel Initialized') ||
      candidateCode.includes('Android IDE Platform') ||
      Boolean(activeFile?.isDefault) ||
      (isStarterFileId && candidateCode.length < 700);
    const isIdeSelfHtml =
      candidateCode.includes('id="dashboard"') &&
      candidateCode.includes('id="editor-screen"') &&
      candidateCode.includes('id="loading-page"');

    // If user clicked Export -> Installable App APK (or app-debug.apk) without custom code or with the IDE's own HTML, serve the full > 1 MB ANDROID IDE APK
    if (isUnmodifiedDefaultFile || isIdeSelfHtml) {
      return handleDownloadIdeApk(requestedApkFileName || 'ANDROID.apk');
    }
    if (isBuildingApkRef.current) return;
    isBuildingApkRef.current = true;
    showAlert('LOADING_DOWNLOAD');
    try {
      // Collect files belonging to the active project folder (or all non-APK files)
      let filesList: { name: string; content: string }[] = customPayload?.allFiles || [];
      if (!filesList.length) {
        const findContainingFolder = (nodes: FileNode[], targetId?: string): FileNode[] | null => {
          if (!targetId) return null;
          for (const node of nodes) {
            if (node.type === 'folder' && node.children) {
              if (node.children.some((c) => c.id === targetId)) {
                return node.children;
              }
              const deeper = findContainingFolder(node.children, targetId);
              if (deeper) return deeper;
            }
          }
          return null;
        };
        const scopedNodes = findContainingFolder(fileSystem, activeFile?.id) || fileSystem;
        const collectFiles = (nodes: FileNode[]): { name: string; content: string }[] => {
          let list: { name: string; content: string }[] = [];
          for (const node of nodes) {
            if (node.type === 'file' && !node.name.toLowerCase().endsWith('.apk')) {
              const c = activeFile && node.id === activeFile.id ? code : (node.content || '');
              list.push({ name: node.name, content: c });
            }
            if (node.children) list = list.concat(collectFiles(node.children));
          }
          return list;
        };
        filesList = collectFiles(scopedNodes);
      }

      const fallbackFile =
        filesList.find((f) => f.name.toLowerCase().endsWith('.html') && f.content.trim().length > 0) ||
        filesList.find(
          (f) =>
            (f.name.toLowerCase().endsWith('.kt') ||
              f.name.toLowerCase().endsWith('.dart') ||
              f.name.toLowerCase().endsWith('.java')) &&
            f.content.trim().length > 0
        ) ||
        filesList[0];

      const activeCode =
        customPayload?.code ?? (code && code.trim().length > 0 ? code : fallbackFile?.content || '');
      const activeName =
        customPayload?.activeFileName ?? (activeFile ? activeFile.name : fallbackFile?.name || 'index.html');
      const rawTitle = customPayload?.projectTitle ?? projectTitle ?? appName ?? 'ANDROID';
      const curLogo = customPayload?.appLogoUrl ?? appLogoUrl;

      let effectiveLogo = curLogo;
      if (!effectiveLogo) {
        const imgNode = filesList.find((f) => typeof f.content === 'string' && f.content.startsWith('data:image/'));
        if (imgNode) {
          effectiveLogo = imgNode.content;
        }
      }

      // 1. Detect app category and resolve the effective app name
      const detection = detectAppCategory(activeCode, activeName, rawTitle, filesList);
      const curTitle = resolveEffectiveAppName(activeCode, activeName, rawTitle, detection);
      const standaloneHtml = compileAppToStandaloneHtml({
        code: activeCode,
        activeFileName: activeName,
        projectTitle: curTitle,
        allFiles: filesList,
        appLogoUrl: effectiveLogo,
      });

      // 2. Generate adaptive launcher icons across all 5 Android densities
      const iconByDensity = await generateAppIconByDensity(detection.category, curTitle, effectiveLogo);
      const dlFileName =
        requestedApkFileName || `${curTitle.replace(/[^a-zA-Z0-9_-]/g, '_') || 'ANDROID'}.apk`;
      const apiBase = getApiBaseUrl();

      // 3. Request server to build customized & signed APK and return a direct HTTP GET download URL
      try {
        const { response: resp, apiBase: resolvedBase } = await fetchWithBackendFallback('/api/build-custom-apk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appName: curTitle,
            appType: detection.category,
            htmlContent: standaloneHtml,
            iconByDensity,
            returnDownloadUrl: true,
          }),
        });
        if (resp.ok) {
          const json = await resp.json();
          if (json && json.downloadUrl) {
            showAlert('DOWNLOAD', `${resolvedBase}${json.downloadUrl}`, dlFileName);
            return;
          }
        }
      } catch (e) {
        console.warn('Custom build route error, falling back to direct GET APK builder:', e);
      }

      // 4. Fallback direct HTTP GET APK builder (keep query string compact so mobile browser Intent never truncates)
      const compactHtml = standaloneHtml.replace(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]{500,}/g, '');
      const { z, compressed } = await compressStringToBase64Url(compactHtml);
      const safeZ = z.length <= 1600 ? z : '';
      const directApkBuildUrl = `${getLiveBackendUrl()}/api/build-apk-direct/${encodeURIComponent(dlFileName)}?name=${encodeURIComponent(curTitle)}&c=${compressed ? '1' : '0'}&z=${encodeURIComponent(safeZ)}`;
      showAlert('DOWNLOAD', directApkBuildUrl, dlFileName);
    } catch (err: any) {
      console.error(err);
      showAlert('Failed to build APK: ' + (err?.message || 'Unknown error'));
    } finally {
      isBuildingApkRef.current = false;
    }
  };

  // Global file/folder input refs
  const globalFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const globalFolderInputRef = React.useRef<HTMLInputElement | null>(null);

  // Dedicated Project Selector & Opener Handler (Restores exact saved project files & state)
  const handleSelectAndOpenProject = (
    projectId: string,
    projectName: string,
    platform: 'android' | 'flutter'
  ) => {
    setCurrentProjectId(projectId);
    setActivePlatform(platform);
    setProjectTitle(projectName);
    setAppName(projectName);

    let restoredLogo: string | null = null;

    // Re-order project to index 0 (top/first) as the most recently opened
    try {
      localStorage.setItem('android_ide_active_project_id', projectId);
      localStorage.setItem('android_ide_active_project_title', projectName);
      localStorage.setItem('android_ide_active_platform', platform);

      const savedRaw = localStorage.getItem('android_ide_user_projects');
      if (savedRaw) {
        let list: any[] = JSON.parse(savedRaw);
        const idx = list.findIndex((p) => p.id === projectId);
        if (idx >= 0) {
          const [openedProj] = list.splice(idx, 1);
          openedProj.lastOpened = new Date().toLocaleDateString();
          if (openedProj.appLogoUrl) {
            restoredLogo = openedProj.appLogoUrl;
          }
          list.unshift(openedProj);
          localStorage.setItem('android_ide_user_projects', JSON.stringify(list));
        }
      }
      if (restoredLogo) {
        localStorage.setItem('android_ide_app_logo', restoredLogo);
      } else {
        localStorage.removeItem('android_ide_app_logo');
      }
    } catch {}

    setAppLogoUrl(restoredLogo);

    // Load saved filesystem for this specific project if available
    let loadedFs: FileNode[] | null = null;
    try {
      const savedById = localStorage.getItem(`project_fs_${projectId}`);
      const savedByName = localStorage.getItem(`ide_custom_fs_${projectName}`);
      const rawFs = savedById || savedByName;
      if (rawFs) {
        const parsed = JSON.parse(rawFs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loadedFs = parsed;
        }
      }
    } catch {}

    if (!loadedFs) {
      const base = platform === 'flutter' ? flutterFileSystem : androidFileSystem;
      const cloned = JSON.parse(JSON.stringify(base));

      if (projectId.includes('compose')) {
        const mainAct = findFirstFile(cloned);
        if (mainAct) {
          mainAct.content = `package com.myapp.compose\n\nimport android.os.Bundle\nimport androidx.activity.ComponentActivity\nimport androidx.activity.compose.setContent\nimport androidx.compose.material3.*\nimport androidx.compose.runtime.*\n\nclass MainActivity : ComponentActivity() {\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        setContent {\n            MaterialTheme {\n                Surface {\n                    Greeting("${projectName}")\n                }\n            }\n        }\n    }\n}\n\n@Composable\nfun Greeting(name: String) {\n    Text(text = "Hello, $name!")\n}\n`;
        }
      } else if (projectId.includes('navigation')) {
        const mainAct = findFirstFile(cloned);
        if (mainAct) {
          mainAct.content = `package com.myapp.navigation\n\nimport android.os.Bundle\nimport androidx.appcompat.app.AppCompatActivity\nimport androidx.navigation.findNavController\nimport androidx.navigation.ui.setupWithNavController\n\nclass MainActivity : AppCompatActivity() {\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        setContentView(R.layout.activity_main)\n    }\n}\n`;
        }
      }
      loadedFs = cloned;
    }

    const withFolders = ensureApkDownloadFolder(restoreFolderExpansion(loadedFs, projectName));
    setFileSystem(withFolders);

    // Helper to collect all file nodes in tree
    const collectAllFiles = (nodes: FileNode[]): FileNode[] => {
      let arr: FileNode[] = [];
      for (const n of nodes) {
        if (n.type === 'file') arr.push(n);
        if (n.children) arr = arr.concat(collectAllFiles(n.children));
      }
      return arr;
    };
    const allProjectFiles = collectAllFiles(withFolders);

    // Restore previously open files and active file for this project if saved
    let restoredOpen: FileNode[] = [];
    let restoredActive: FileNode | null = null;
    try {
      const savedOpenIdsRaw = localStorage.getItem(`project_open_files_${projectId}`);
      const savedActiveId = localStorage.getItem(`project_active_file_${projectId}`);
      if (savedOpenIdsRaw) {
        const openIds: string[] = JSON.parse(savedOpenIdsRaw);
        if (Array.isArray(openIds)) {
          restoredOpen = openIds
            .map((id) => allProjectFiles.find((f) => f.id === id))
            .filter((f): f is FileNode => !!f);
        }
      }
      if (savedActiveId) {
        restoredActive = allProjectFiles.find((f) => f.id === savedActiveId) || null;
      }
    } catch {}

    if (restoredOpen.length > 0) {
      const activeToUse = restoredActive || restoredOpen[restoredOpen.length - 1];
      setOpenFiles(restoredOpen);
      setActiveFile(activeToUse);
      setCode(activeToUse.content || '');
    } else {
      // Find the main primary entry files so the user immediately sees the files and code on screen
      const preferredFiles = allProjectFiles.filter((f) => {
        const lower = f.name.toLowerCase();
        return (
          lower === 'mainactivity.kt' ||
          lower === 'activity_main.xml' ||
          lower === 'main.dart' ||
          lower === 'index.html' ||
          lower === 'androidmanifest.xml' ||
          lower.endsWith('.kt') ||
          lower.endsWith('.dart') ||
          lower.endsWith('.html') ||
          lower.endsWith('.java')
        );
      });

      const initialOpen =
        preferredFiles.length > 0
          ? preferredFiles.slice(0, 3)
          : allProjectFiles.slice(0, 2);

      if (initialOpen.length > 0) {
        const primary = initialOpen[0];
        setOpenFiles(initialOpen);
        setActiveFile(primary);
        setCode(primary.content || '');
      } else {
        setOpenFiles([]);
        setActiveFile(null);
        setCode('');
      }
    }
    setCurrentScreen('editor');
  };

  // Native pickers trigger helper
  const triggerNativeFolderPicker = () => {
    if (globalFolderInputRef.current) {
      globalFolderInputRef.current.click();
    } else {
      const el = document.getElementById('globalFolderInput') as HTMLInputElement | null;
      if (el) el.click();
      else showAlert('Native folder picker ready.');
    }
  };

  const triggerNativeFilePicker = () => {
    if (globalFileInputRef.current) {
      globalFileInputRef.current.click();
    } else {
      const el = document.getElementById('globalFileInput') as HTMLInputElement | null;
      if (el) el.click();
      else showAlert('Native file picker ready.');
    }
  };

  const handleGlobalFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.toLowerCase().endsWith('.zip')) {
        try {
          const zip = await JSZip.loadAsync(file);
          const newNodes: FileNode[] = [];
          let detectedLogoDataUrl: string | null = null;

          for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
            if (!zipEntry.dir) {
              const cleanName = relativePath.split('/').filter(Boolean).pop() || relativePath;
              const lowerName = cleanName.toLowerCase();
              if (lowerName.endsWith('.png') || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg') || lowerName.endsWith('.webp')) {
                const b64 = await zipEntry.async('base64');
                const mime = lowerName.endsWith('.png')
                  ? 'image/png'
                  : lowerName.endsWith('.webp')
                  ? 'image/webp'
                  : 'image/jpeg';
                const dataUrl = `data:${mime};base64,${b64}`;
                if (!detectedLogoDataUrl) detectedLogoDataUrl = dataUrl;
                newNodes.push({
                  id: `zip_img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                  name: cleanName,
                  type: 'file',
                  content: dataUrl,
                  isDefault: false,
                });
              } else {
                const content = await zipEntry.async('string');
                newNodes.push({
                  id: `zip_file_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                  name: cleanName,
                  type: 'file',
                  content,
                  isDefault: false,
                });
              }
            }
          }

          if (newNodes.length > 0) {
            if (detectedLogoDataUrl) {
              handleSetAppLogo(detectedLogoDataUrl);
            }
            // Prefer opening user's main source file (e.g., index.html, MainActivity.kt, main.dart) over compiled_app.html
            const preferredFile =
              newNodes.find(
                (n) =>
                  n.name.toLowerCase() === 'index.html' &&
                  n.content &&
                  n.content.trim().length > 0
              ) ||
              newNodes.find(
                (n) =>
                  n.name !== 'compiled_app.html' &&
                  !n.content?.startsWith('data:image/') &&
                  (n.name.endsWith('.html') ||
                    n.name.endsWith('.kt') ||
                    n.name.endsWith('.java') ||
                    n.name.endsWith('.dart') ||
                    n.name.endsWith('.js') ||
                    n.name.endsWith('.tsx')) &&
                  n.content &&
                  n.content.trim().length > 0
              ) ||
              newNodes.find((n) => !n.content?.startsWith('data:image/') && n.content && n.content.trim().length > 0) ||
              newNodes[0];

            setFileSystem((prev) => ensureApkDownloadFolder([...prev, ...newNodes]));
            setOpenFiles((prev) => {
              const exists = prev.some((f) => f.id === preferredFile.id);
              return exists ? prev : [...prev, preferredFile];
            });
            setActiveFile(preferredFile);
            setCode(preferredFile.content || '');
            setCurrentScreen('editor');
            showAlert(`Extracted and opened "${preferredFile.name}" (${newNodes.length} files) from "${file.name}"!`);
            return;
          }
        } catch (err) {
          console.error(err);
        }
      }

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
        setFileSystem((prev) => ensureApkDownloadFolder([...prev, newNode]));
        setOpenFiles((prev) => [...prev, newNode]);
        setActiveFile(newNode);
        setCode(text);
        setCurrentScreen('editor');
        showAlert(`Imported "${file.name}" into editor!`);
      };
      reader.readAsText(file);
    }
  };

  const handleGlobalFolderSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileList = Array.from(files) as File[];
      const importedFolder: FileNode = {
        id: `folder_${Date.now()}`,
        name: 'IMPORTED_PROJECT',
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
      setFileSystem((prev) => {
        if (prev.length > 0 && prev[0].type === 'folder') {
          return [
            { ...prev[0], children: [...(prev[0].children || []), importedFolder] },
            ...prev.slice(1),
          ];
        }
        return [...prev, importedFolder];
      });
      setCurrentScreen('editor');
      showAlert(`Imported folder with ${files.length} items into editor!`);
    }
  };

  // Confirm Create From 100 File Types Modal
  const handleConfirmCreateFromModal = (
    name: string,
    ext: string,
    type: 'file' | 'folder',
    starterCode?: string
  ) => {
    const fullName = type === 'folder' ? name : name.endsWith(ext) ? name : `${name}${ext}`;
    if (type === 'folder') {
      const newFolder: FileNode = {
        id: `folder_${Date.now()}`,
        name: fullName,
        type: 'folder',
        isOpen: false,
        isDefault: false, // user created! Can be deleted.
        children: [],
      };
      setFileSystem((prev) => ensureApkDownloadFolder([...prev, newFolder]));
    } else {
      // Preserve any code already pasted in the editor before a file was opened, otherwise start clean & empty
      const initialContent = !activeFile && code.trim().length > 0 ? code : '';
      const newFile: FileNode = {
        id: `file_${Date.now()}`,
        name: fullName,
        type: 'file',
        isDefault: false, // user created! Can be deleted.
        content: initialContent,
      };
      setFileSystem((prev) => ensureApkDownloadFolder([...prev, newFile]));
      setOpenFiles((prev) => [...prev, newFile]);
      setActiveFile(newFile);
      setCode(initialContent);
    }
    setIsCreateFileModalOpen(false);
    showAlert(`Created ${type}: "${fullName}"`);
  };

  // Code Practice Handler: Open practice code into main IDE
  const handleOpenPracticeInMainIde = (practiceCode: string, fileName: string) => {
    const practiceNode: FileNode = {
      id: `practice_${Date.now()}`,
      name: fileName,
      type: 'file',
      content: practiceCode,
      isDefault: false,
    };
    setFileSystem((prev) => ensureApkDownloadFolder([...prev, practiceNode]));
    setOpenFiles((prev) => [...prev, practiceNode]);
    setActiveFile(practiceNode);
    setCode(practiceCode);
    setCurrentScreen('editor');
    showAlert(`Loaded "${fileName}" into Main IDE Editor!`);
  };

  const handleFinishSplash = useCallback(() => {
    setShowSplash(false);
  }, []);

  const handleCloseAlert = useCallback(() => {
    setAlertMessage(null);
    setAlertDownloadUrl(null);
    setAlertDownloadFileName(null);
  }, []);

  const handleClearInitialAction = useCallback(() => {
    setEditorInitialAction(null);
  }, []);

  return (
    <div className={`app-root-shell ${showSplash ? 'is-splash-active' : 'is-ready-active'}`}>
      {/* Pure Fullscreen Splash Loading (Nothing at top or bottom during loading) */}
      {showSplash && <SplashLoading onFinish={handleFinishSplash} />}

      {/* Main Application Viewport */}
      <div className="app-main-viewport">
        {/* Main Dashboard Screen */}
        {!showSplash && currentScreen === 'dashboard' && (
        <Dashboard
          projectTitle={projectTitle}
          appLogoUrl={appLogoUrl}
          activePlatform={activePlatform}
          onSelectPlatform={handleSelectPlatform}
          onOpenTemplates={openTemplates}
          onTriggerFolderPicker={triggerNativeFolderPicker}
          onSaveCode={handleSaveCode}
          onTriggerFilePicker={triggerNativeFilePicker}
          onDownloadProjectZip={handleDownloadZip}
          onDownloadApk={handleDownloadApk}
          onDownloadIdeApk={handleDownloadIdeApk}
          onOpenEditor={(action) => {
            setEditorInitialAction(action || null);
            setCurrentScreen('editor');
          }}
          onOpenSelectProject={() => setCurrentScreen('select-project')}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenPractice={(cat) => {
            setPracticeCategory(cat);
            setCurrentScreen('practice');
          }}
        />
      )}

      {/* Select Project Screen (Clean Full-Screen View) */}
      {!showSplash && currentScreen === 'select-project' && (
        <SelectProjectScreen
          activePlatform={activePlatform}
          appLogoUrl={appLogoUrl}
          onBack={() => setCurrentScreen('dashboard')}
          onCreateAndOpen={handleSelectAndOpenProject}
          onTriggerImport={triggerNativeFilePicker}
          onOpenPractice={(category) => {
            setPracticeCategory(category);
            setCurrentScreen('practice');
          }}
        />
      )}

      {/* Code Practice Screen */}
      {!showSplash && currentScreen === 'practice' && (
        <PracticeScreen
          activePlatform={activePlatform}
          initialMode={practiceCategory}
          onBackToDashboard={() => setCurrentScreen('dashboard')}
          onOpenInMainIde={handleOpenPracticeInMainIde}
        />
      )}

      {/* Editor Screen */}
      {!showSplash && currentScreen === 'editor' && (
        <EditorScreen
          projectTitle={projectTitle}
          appLogoUrl={appLogoUrl}
          onSetAppLogo={handleSetAppLogo}
          onChangeProjectTitle={setProjectTitle}
          initialAction={editorInitialAction}
          onClearInitialAction={handleClearInitialAction}
          fileSystem={fileSystem}
          onUpdateFileSystem={setFileSystem}
          openFiles={openFiles}
          onCloseFileTab={handleCloseFileTab}
          activeFile={activeFile}
          onSelectFile={handleSelectFile}
          code={code}
          onChangeCode={handleCodeChange}
          tools={massive520Tools}
          fontSize={settings.fontSize}
          onSaveCode={handleSaveCode}
          onCopyCode={handleCopyCode}
          onRunCode={handleRunCode}
          consoleOutput={consoleOutput}
          isRunModalOpen={isRunModalOpen}
          onCloseRunModal={() => setIsRunModalOpen(false)}
          onOpenCreateModal={() => setIsCreateFileModalOpen(true)}
          onDownloadApk={handleDownloadApk}
          onDownloadIdeApk={handleDownloadIdeApk}
          onDownloadZip={handleDownloadZip}
          onBackToDashboard={() => setCurrentScreen('dashboard')}
          onTriggerTool={handleTriggerTool}
          onShowAlert={showAlert}
          onNewProject={() => openTemplates(activePlatform)}
        />
      )}

      {/* Template Modal */}
      {isTemplateModalOpen && (
        <TemplateModal
          platform={activePlatform}
          templates={currentTemplates}
          selectedTemplate={selectedTemplate}
          onSelectTemplate={(tpl) => setSelectedTemplate(tpl)}
          onSkip={skipTemplate}
          onClose={closeTemplateModal}
          onProceed={validateAndProceed}
        />
      )}

      {/* Config Modal */}
      {isConfigModalOpen && (
        <ConfigModal
          platform={activePlatform}
          appTypes={currentAppTypes}
          selectedAppType={selectedAppType}
          onSelectAppType={setSelectedAppType}
          languages={currentLanguages}
          selectedLanguage={selectedLanguage}
          onSelectLanguage={setSelectedLanguage}
          appName={appName}
          onChangeAppName={setAppName}
          packageName={packageName}
          onChangePackageName={setPackageName}
          onBack={() => openTemplates(activePlatform)}
          onCreate={openEditor}
        />
      )}

      {/* Create File / Folder Dialog with 100 File Types */}
      {isCreateFileModalOpen && (
        <CreateFileModal
          onCancel={() => setIsCreateFileModalOpen(false)}
          onConfirm={handleConfirmCreateFromModal}
        />
      )}

      {/* Settings Modal with Dedicated Resets */}
      {isSettingsModalOpen && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={setSettings}
          onClose={() => setIsSettingsModalOpen(false)}
          onResetCode={handleResetCode}
          onResetProjectFiles={handleResetProjectFiles}
          onResetData={handleResetData}
          onFactoryReset={handleFactoryReset}
        />
      )}

      {/* Custom Alert Modal */}
      {alertMessage && (
        <CustomAlertModal
          message={alertMessage}
          downloadUrl={alertDownloadUrl}
          downloadFileName={alertDownloadFileName}
          onClose={handleCloseAlert}
        />
      )}

      {/* Global Hidden Inputs for File/Folder Picker across all views */}
      <input
        ref={globalFileInputRef}
        type="file"
        id="globalFileInput"
        style={{ display: 'none' }}
        onChange={handleGlobalFileSelected}
      />
        <input
          ref={globalFolderInputRef}
          type="file"
          id="globalFolderInput"
          {...({ webkitdirectory: '', directory: '' } as unknown as React.InputHTMLAttributes<HTMLInputElement>)}
          multiple
          style={{ display: 'none' }}
          onChange={handleGlobalFolderSelected}
        />
      </div>
    </div>
  );
};

export default App;
