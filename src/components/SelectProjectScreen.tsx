import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { initialFileSystem, flutterFileSystem } from '../data/initialFileSystem';
import { FileNode } from '../types';
import { triggerReliableDownload } from '../utils/appCompiler';

export interface ProjectOption {
  id: string;
  name: string;
  platform: 'android' | 'flutter';
  badge: string;
  badgeColor?: string;
  desc?: string;
  tech?: string[];
  icon?: string;
  iconBg?: string;
  appLogoUrl?: string | null;
  isCustom?: boolean;
  lastOpened?: string;
  sampleCode?: string;
  sampleFileName?: string;
}

interface SelectProjectScreenProps {
  activePlatform: 'android' | 'flutter';
  appLogoUrl: string | null;
  onBack: () => void;
  onCreateAndOpen: (projectId: string, projectName: string, platform: 'android' | 'flutter') => void;
  onTriggerImport: () => void;
  onOpenPractice?: (category?: string) => void;
}

export const SelectProjectScreen: React.FC<SelectProjectScreenProps> = ({
  activePlatform,
  appLogoUrl,
  onBack,
  onCreateAndOpen,
  onTriggerImport,
}) => {
  // Load projects from localStorage and recover any saved project filesystems
  const fetchSavedProjects = (): ProjectOption[] => {
    try {
      const saved = localStorage.getItem('android_ide_user_projects');
      let parsed: ProjectOption[] = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(parsed)) parsed = [];

      // Recover any project stored under ide_custom_fs_* that is missing from android_ide_user_projects
      let recoveredAny = false;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('ide_custom_fs_')) {
          const projName = key.replace('ide_custom_fs_', '').trim();
          if (projName && !parsed.some((p) => (p.name || '').toLowerCase() === projName.toLowerCase())) {
            const rawFs = localStorage.getItem(key) || '';
            const isFlutter = rawFs.includes('pubspec.yaml') || rawFs.includes('main.dart') || projName.toLowerCase().includes('flutter');
            const platform: 'android' | 'flutter' = isFlutter ? 'flutter' : 'android';
            const recoveredId = `user-proj-rec-${Date.now()}-${i}`;
            parsed.push({
              id: recoveredId,
              name: projName,
              platform,
              badge: platform.toUpperCase(),
              badgeColor: isFlutter ? '#0ea5e9' : '#22c55e',
              desc: `Saved ${platform.toUpperCase()} project`,
              tech: isFlutter ? ['Dart', 'Flutter'] : ['Kotlin', 'Android'],
              icon: isFlutter ? 'fa-mobile-screen' : 'fa-robot',
              iconBg: isFlutter ? '#0ea5e9' : '#3DDC84',
              appLogoUrl: null,
              isCustom: true,
              lastOpened: new Date().toLocaleDateString(),
            });
            try {
              localStorage.setItem(`project_fs_${recoveredId}`, rawFs);
            } catch {}
            recoveredAny = true;
          }
        }
      }

      if (recoveredAny) {
        try {
          localStorage.setItem('android_ide_user_projects', JSON.stringify(parsed));
        } catch {}
      }

      return parsed;
    } catch {
      return [];
    }
  };

  // Load ALL custom saved projects from localStorage (Android + Flutter together)
  const [customProjects, setCustomProjects] = useState<ProjectOption[]>(fetchSavedProjects);
  const [selectedId, setSelectedId] = useState<string>(() => {
    return customProjects[0]?.id || '';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'android' | 'flutter'>('all');

  // Top Bar Three-Dots Menu state
  const [isTopMenuOpen, setIsTopMenuOpen] = useState(false);
  const topMenuRef = useRef<HTMLDivElement | null>(null);

  // Context menu state for long press
  const [contextProject, setContextProject] = useState<ProjectOption | null>(null);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameInputVal, setRenameInputVal] = useState('');
  const [projectToDelete, setProjectToDelete] = useState<ProjectOption | null>(null);
  const [isClearAllDialogOpen, setIsClearAllDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const loadProjects = () => {
    const list = fetchSavedProjects();
    setCustomProjects(list);
    if (list.length > 0) {
      setSelectedId((prev) => (prev && list.some((p) => p.id === prev) ? prev : list[0].id));
    }
  };

  // Close top menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (topMenuRef.current && !topMenuRef.current.contains(e.target as Node)) {
        setIsTopMenuOpen(false);
      }
    };
    if (isTopMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTopMenuOpen]);

  // Filter projects by platform filter and search query
  const filteredProjects = customProjects.filter((p) => {
    const matchesPlatform =
      platformFilter === 'all' ? true : p.platform === platformFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.platform.toLowerCase().includes(q) ||
      (p.tech && p.tech.some((t) => t.toLowerCase().includes(q))) ||
      (p.badge && p.badge.toLowerCase().includes(q));
    return matchesPlatform && matchesSearch;
  });

  const activeSelected =
    filteredProjects.find((p) => p.id === selectedId) || filteredProjects[0] || null;

  const handleSelectCard = (p: ProjectOption) => {
    if (selectedId === p.id) {
      onCreateAndOpen(p.id, p.name, p.platform);
    } else {
      setSelectedId(p.id);
    }
  };

  const handleOkClick = () => {
    if (activeSelected) {
      onCreateAndOpen(activeSelected.id, activeSelected.name, activeSelected.platform);
    } else {
      onBack();
    }
  };

  // Long-press handling (hold for 600ms)
  const handleTouchStart = (proj: ProjectOption) => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      try {
        if ('vibrate' in navigator) navigator.vibrate(50);
      } catch {}
      setContextProject(proj);
    }, 600);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleContextMenu = (e: React.MouseEvent, proj: ProjectOption) => {
    e.preventDefault();
    setContextProject(proj);
  };

  // Export a single project as ZIP
  const handleExportSingleProject = async (proj: ProjectOption) => {
    setIsExporting(true);
    try {
      const zip = new JSZip();
      const folderName = `${proj.platform}_${proj.name.replace(/\s+/g, '_')}`;
      const rootFolder = zip.folder(folderName) || zip;

      let fsToUse: FileNode[] = [];
      const savedFs =
        localStorage.getItem(`project_fs_${proj.id}`) ||
        localStorage.getItem(`ide_custom_fs_${proj.name}`);
      if (savedFs) {
        try {
          fsToUse = JSON.parse(savedFs);
        } catch {}
      }
      if (!fsToUse || fsToUse.length === 0) {
        fsToUse = proj.platform === 'flutter' ? flutterFileSystem : initialFileSystem;
      }

      const addNodesToZip = (nodes: FileNode[], current: JSZip) => {
        for (const node of nodes) {
          if (node.type === 'folder') {
            const sub = current.folder(node.name);
            if (sub && node.children) {
              addNodesToZip(node.children, sub);
            }
          } else {
            current.file(node.name, node.content || '');
          }
        }
      };

      addNodesToZip(fsToUse, rootFolder);
      const base64Zip = await zip.generateAsync({ type: 'base64', compression: 'DEFLATE' });
      const zipFileName = `${proj.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_') || 'project'}_${proj.platform}_source.zip`;
      await triggerReliableDownload({
        base64Data: base64Zip,
        fileName: zipFileName,
        contentType: 'application/zip',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
      setContextProject(null);
    }
  };

  // Export ALL projects as ZIP
  const handleExportAllProjects = async () => {
    if (customProjects.length === 0) {
      return;
    }
    setIsExporting(true);
    try {
      const zip = new JSZip();
      for (const proj of customProjects) {
        const pFolder = zip.folder(`${proj.platform}_${proj.name.replace(/\s+/g, '_')}`);
        if (pFolder) {
          let fsToUse: FileNode[] = [];
          const savedFs =
            localStorage.getItem(`project_fs_${proj.id}`) ||
            localStorage.getItem(`ide_custom_fs_${proj.name}`);
          if (savedFs) {
            try {
              fsToUse = JSON.parse(savedFs);
            } catch {}
          }
          if (!fsToUse || fsToUse.length === 0) {
            fsToUse = proj.platform === 'flutter' ? flutterFileSystem : initialFileSystem;
          }

          const addNodes = (nodes: FileNode[], current: JSZip) => {
            for (const n of nodes) {
              if (n.type === 'folder') {
                const sub = current.folder(n.name);
                if (sub && n.children) addNodes(n.children, sub);
              } else {
                current.file(n.name, n.content || '');
              }
            }
          };
          addNodes(fsToUse, pFolder);
        }
      }

      const base64Zip = await zip.generateAsync({ type: 'base64', compression: 'DEFLATE' });
      await triggerReliableDownload({
        base64Data: base64Zip,
        fileName: `ANDROID_all_projects_${Date.now()}.zip`,
        contentType: 'application/zip',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
      setIsTopMenuOpen(false);
    }
  };

  // Delete Project with confirmation
  const handleConfirmDelete = () => {
    if (!projectToDelete) return;
    const id = projectToDelete.id;
    try {
      const saved = localStorage.getItem('android_ide_user_projects');
      if (saved) {
        const parsed: ProjectOption[] = JSON.parse(saved);
        const updated = parsed.filter((p) => p.id !== id);
        localStorage.setItem('android_ide_user_projects', JSON.stringify(updated));
        setCustomProjects(updated);
        if (selectedId === id) {
          setSelectedId(updated[0]?.id || '');
        }
      }
    } catch {}
    setProjectToDelete(null);
    setContextProject(null);
  };

  // Clear ALL Projects
  const handleConfirmClearAll = () => {
    try {
      localStorage.setItem('android_ide_user_projects', JSON.stringify([]));
      setCustomProjects([]);
      setSelectedId('');
    } catch {}
    setIsClearAllDialogOpen(false);
    setIsTopMenuOpen(false);
  };

  // Rename Project
  const handleOpenRename = () => {
    if (!contextProject) return;
    setRenameInputVal(contextProject.name);
    setIsRenameModalOpen(true);
  };

  const handleSaveRename = () => {
    if (!contextProject || !renameInputVal.trim()) return;
    const oldName = contextProject.name;
    const updatedName = renameInputVal.trim().toUpperCase();
    try {
      const oldFs = localStorage.getItem(`ide_custom_fs_${oldName}`);
      if (oldFs) {
        localStorage.setItem(`ide_custom_fs_${updatedName}`, oldFs);
      }
      if (localStorage.getItem('android_ide_active_project_id') === contextProject.id) {
        localStorage.setItem('android_ide_active_project_title', updatedName);
      }
      const saved = localStorage.getItem('android_ide_user_projects');
      if (saved) {
        const parsed: ProjectOption[] = JSON.parse(saved);
        const updated = parsed.map((p) =>
          p.id === contextProject.id ? { ...p, name: updatedName } : p
        );
        localStorage.setItem('android_ide_user_projects', JSON.stringify(updated));
        setCustomProjects(updated);
      }
    } catch {}
    setIsRenameModalOpen(false);
    setContextProject(null);
  };

  const androidCount = customProjects.filter((p) => p.platform === 'android').length;
  const flutterCount = customProjects.filter((p) => p.platform === 'flutter').length;

  return (
    <div id="select-project-screen" className="select-project-container select-project-compact-theme">
      {/* Slim Top Bar: Back Button | PROJECT OPEN Title | Three-Dots Menu */}
      <div className="select-project-top-bar select-slim-top-bar">
        <div className="select-slim-header-inner">
          {/* Left Back Button */}
          <button
            type="button"
            className="select-slim-back-btn"
            onClick={onBack}
            title="Back to Dashboard"
          >
            <i className="fas fa-chevron-left"></i>
          </button>

          {/* Centered Main Title with Count */}
          <div className="select-slim-title-wrap">
            <div className="select-slim-title">PROJECT OPEN</div>
            <div className="select-slim-count-badge">
              {customProjects.length} {customProjects.length === 1 ? 'PROJECT' : 'PROJECTS'}
            </div>
          </div>

          {/* Right Three-Dots Tools Menu Button */}
          <div className="relative" ref={topMenuRef}>
            <button
              type="button"
              className="select-slim-menu-btn"
              onClick={() => setIsTopMenuOpen((prev) => !prev)}
              title="Project Options & Tools"
            >
              <i className="fas fa-ellipsis-vertical"></i>
            </button>

            {/* Top Bar Dropdown Menu */}
            {isTopMenuOpen && (
              <div className="select-project-top-dropdown">
                <button
                  type="button"
                  className="top-dropdown-item"
                  onClick={handleExportAllProjects}
                  disabled={isExporting || customProjects.length === 0}
                >
                  <i className="fas fa-file-zipper text-emerald-400"></i>
                  <span>EXPORT ALL (ZIP)</span>
                </button>

                <button
                  type="button"
                  className="top-dropdown-item"
                  onClick={() => {
                    setIsTopMenuOpen(false);
                    onTriggerImport();
                  }}
                >
                  <i className="fas fa-file-import text-purple-400"></i>
                  <span>IMPORT PROJECT</span>
                </button>

                <button
                  type="button"
                  className="top-dropdown-item"
                  onClick={() => {
                    setIsTopMenuOpen(false);
                    onBack();
                  }}
                >
                  <i className="fas fa-plus text-sky-400"></i>
                  <span>CREATE NEW PROJECT</span>
                </button>

                <button
                  type="button"
                  className="top-dropdown-item"
                  onClick={() => {
                    loadProjects();
                    setIsTopMenuOpen(false);
                  }}
                >
                  <i className="fas fa-rotate text-blue-400"></i>
                  <span>REFRESH LIST</span>
                </button>

                <div className="top-dropdown-divider"></div>

                <button
                  type="button"
                  className="top-dropdown-item item-danger"
                  onClick={() => {
                    setIsTopMenuOpen(false);
                    setIsClearAllDialogOpen(true);
                  }}
                  disabled={customProjects.length === 0}
                >
                  <i className="fas fa-trash-can text-rose-400"></i>
                  <span>CLEAR ALL PROJECTS</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prominent Search Bar */}
      <div className="project-open-search-wrap">
        <div className="project-open-search-bar">
          <i className="fas fa-search project-search-icon"></i>
          <input
            type="text"
            className="project-search-input"
            placeholder="SEARCH PROJECTS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="project-search-clear-btn"
              onClick={() => setSearchQuery('')}
              title="Clear Search"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>

      {/* Platform Filter Tabs: ALL | ANDROID | FLUTTER (Unified View) */}
      <div className="project-platform-filter-bar">
        <button
          type="button"
          className={`platform-filter-tab ${platformFilter === 'all' ? 'filter-active' : ''}`}
          onClick={() => setPlatformFilter('all')}
        >
          ALL ({customProjects.length})
        </button>

        <button
          type="button"
          className={`platform-filter-tab tab-android ${platformFilter === 'android' ? 'filter-active' : ''}`}
          onClick={() => setPlatformFilter('android')}
        >
          <i className="fab fa-android mr-1"></i>
          ANDROID ({androidCount})
        </button>

        <button
          type="button"
          className={`platform-filter-tab tab-flutter ${platformFilter === 'flutter' ? 'filter-active' : ''}`}
          onClick={() => setPlatformFilter('flutter')}
        >
          <i className="fas fa-mobile-screen mr-1"></i>
          FLUTTER ({flutterCount})
        </button>
      </div>

      {/* Main Content: Chronological List of Projects (Newest First) */}
      <div className="select-project-scroll-area select-compact-scroll-area">
        {filteredProjects.length === 0 ? (
          <div className="project-open-empty-state">
            <div className="empty-state-icon">
              <i className="fas fa-folder-open"></i>
            </div>
            <div className="empty-state-title">
              {searchQuery ? 'NO MATCHING PROJECTS' : 'NO PROJECTS FOUND'}
            </div>
            <div className="empty-state-subtitle">
              {searchQuery
                ? 'Try searching with another keyword'
                : 'Projects you create will stay saved here in order'}
            </div>
            {!searchQuery && (
              <div className="empty-state-actions">
                <button
                  type="button"
                  className="empty-state-create-btn"
                  onClick={onBack}
                >
                  <i className="fas fa-plus mr-2"></i> CREATE NEW
                </button>
                <button
                  type="button"
                  className="empty-state-import-btn"
                  onClick={onTriggerImport}
                >
                  <i className="fas fa-file-import mr-2"></i> IMPORT PROJECT
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="project-open-grid">
            {filteredProjects.map((proj) => {
              const isSelected = selectedId === proj.id;
              const isFlutter = proj.platform === 'flutter';
              return (
                <div
                  key={proj.id}
                  id={`project-card-${proj.id}`}
                  className={`project-grid-card ${isSelected ? 'project-card-selected' : ''}`}
                  onClick={() => handleSelectCard(proj)}
                  onDoubleClick={() => onCreateAndOpen(proj.id, proj.name, proj.platform)}
                  onTouchStart={() => handleTouchStart(proj)}
                  onTouchEnd={handleTouchEnd}
                  onMouseDown={() => handleTouchStart(proj)}
                  onMouseUp={handleTouchEnd}
                  onContextMenu={(e) => handleContextMenu(e, proj)}
                  title="Click to select, double click to open, hold for options"
                >
                  {/* Top: Platform Name in small neat badge */}
                  <div className={`project-grid-platform-tag ${isFlutter ? 'platform-flutter-tag' : 'platform-android-tag'}`}>
                    {proj.platform.toUpperCase()}
                  </div>

                  {/* Middle: Centered Logo */}
                  <div className="project-grid-logo-wrap">
                    {proj.appLogoUrl ? (
                      <img
                        src={proj.appLogoUrl}
                        alt="Project Logo"
                        className="project-grid-custom-logo"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div
                        className="project-grid-icon-bubble"
                        style={{
                          background: `${proj.iconBg || (isFlutter ? '#00E5FF' : '#3DDC84')}22`,
                          color: proj.iconBg || (isFlutter ? '#00E5FF' : '#3DDC84'),
                          borderColor: `${proj.iconBg || (isFlutter ? '#00E5FF' : '#3DDC84')}44`,
                        }}
                      >
                        <i className={`fas ${proj.icon || (isFlutter ? 'fa-mobile-screen' : 'fa-robot')}`}></i>
                      </div>
                    )}
                  </div>

                  {/* Bottom: Full Project / App Name */}
                  <div className="project-grid-name" title={proj.name}>
                    {proj.name}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Compact, Balanced Floating Bottom Bar: BACK (left) | IMPORT (middle) | OK (right) */}
      <div className="project-open-bottom-bar-wrapper">
        <div className="project-open-floating-bar project-bottom-bar-compact">
          <button
            type="button"
            className="btn-open-bar-compact btn-open-bar-back"
            onClick={onBack}
            title="Back"
          >
            BACK
          </button>

          <button
            type="button"
            className="btn-open-bar-compact btn-open-bar-import"
            onClick={onTriggerImport}
            title="Import Project / Files"
          >
            <i className="fas fa-file-import mr-1.5"></i>
            IMPORT
          </button>

          <button
            type="button"
            className="btn-open-bar-compact btn-open-bar-ok"
            onClick={handleOkClick}
            title="Open Selected Project"
          >
            OK
          </button>
        </div>
      </div>

      {/* Project Long-Press Context Action Sheet */}
      {contextProject && !isRenameModalOpen && !projectToDelete && (
        <div className="project-context-overlay" onClick={() => setContextProject(null)}>
          <div className="project-context-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="project-context-header">
              <div className="project-context-logo-wrap">
                <i className={`fas ${contextProject.platform === 'flutter' ? 'fa-mobile-screen' : 'fa-robot'}`}></i>
              </div>
              <div>
                <div className="project-context-title">{contextProject.name}</div>
                <div className="project-context-sub">{contextProject.platform.toUpperCase()} PROJECT</div>
              </div>
            </div>

            <div className="project-context-actions">
              <button
                type="button"
                className="project-context-item"
                onClick={() => {
                  onCreateAndOpen(contextProject.id, contextProject.name, contextProject.platform);
                  setContextProject(null);
                }}
              >
                <i className="fas fa-folder-open text-sky-400"></i>
                <span>OPEN PROJECT</span>
              </button>

              <button
                type="button"
                className="project-context-item"
                onClick={() => handleExportSingleProject(contextProject)}
                disabled={isExporting}
              >
                <i className="fas fa-file-zipper text-emerald-400"></i>
                <span>{isExporting ? 'EXPORTING...' : 'EXPORT PROJECT (ZIP)'}</span>
              </button>

              <button
                type="button"
                className="project-context-item"
                onClick={handleOpenRename}
              >
                <i className="fas fa-pen-to-square text-amber-400"></i>
                <span>RENAME PROJECT</span>
              </button>

              <button
                type="button"
                className="project-context-item item-danger"
                onClick={() => setProjectToDelete(contextProject)}
              >
                <i className="fas fa-trash-alt text-rose-400"></i>
                <span>DELETE PROJECT</span>
              </button>
            </div>

            <div className="project-context-footer">
              <button
                type="button"
                className="project-context-cancel-btn"
                onClick={() => setContextProject(null)}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Project Dialog */}
      {isRenameModalOpen && contextProject && (
        <div className="project-context-overlay" onClick={() => setIsRenameModalOpen(false)}>
          <div className="project-context-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="project-context-header">
              <div className="project-context-logo-wrap">
                <i className="fas fa-pen-to-square"></i>
              </div>
              <div>
                <div className="project-context-title">RENAME PROJECT</div>
                <div className="project-context-sub">ENTER NEW PROJECT NAME</div>
              </div>
            </div>

            <div style={{ padding: '16px' }}>
              <input
                type="text"
                className="project-search-input"
                style={{ width: '100%', background: '#0e0e18', border: '1px solid #334155', borderRadius: '8px', padding: '10px 12px' }}
                value={renameInputVal}
                onChange={(e) => setRenameInputVal(e.target.value)}
                placeholder="PROJECT NAME"
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', padding: '0 16px 16px' }}>
              <button
                type="button"
                className="project-context-cancel-btn"
                onClick={() => setIsRenameModalOpen(false)}
              >
                CANCEL
              </button>
              <button
                type="button"
                className="btn-open-bar-compact btn-open-bar-ok"
                style={{ flex: 1 }}
                onClick={handleSaveRename}
              >
                SAVE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {projectToDelete && (
        <div className="project-context-overlay" onClick={() => setProjectToDelete(null)}>
          <div className="project-context-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="project-context-header">
              <div className="project-context-logo-wrap" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e' }}>
                <i className="fas fa-triangle-exclamation"></i>
              </div>
              <div>
                <div className="project-context-title">DELETE PROJECT?</div>
                <div className="project-context-sub">{projectToDelete.name} will be permanently removed.</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', padding: '16px' }}>
              <button
                type="button"
                className="project-context-cancel-btn"
                style={{ flex: 1 }}
                onClick={() => setProjectToDelete(null)}
              >
                CANCEL
              </button>
              <button
                type="button"
                className="project-context-item item-danger"
                style={{ flex: 1, justifyContent: 'center', margin: 0, padding: '10px' }}
                onClick={handleConfirmDelete}
              >
                <i className="fas fa-trash-alt mr-2"></i> DELETE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Projects Confirmation Dialog */}
      {isClearAllDialogOpen && (
        <div className="project-context-overlay" onClick={() => setIsClearAllDialogOpen(false)}>
          <div className="project-context-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="project-context-header">
              <div className="project-context-logo-wrap" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e' }}>
                <i className="fas fa-triangle-exclamation"></i>
              </div>
              <div>
                <div className="project-context-title">CLEAR ALL PROJECTS?</div>
                <div className="project-context-sub">All {customProjects.length} projects will be erased from your device.</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', padding: '16px' }}>
              <button
                type="button"
                className="project-context-cancel-btn"
                style={{ flex: 1 }}
                onClick={() => setIsClearAllDialogOpen(false)}
              >
                CANCEL
              </button>
              <button
                type="button"
                className="project-context-item item-danger"
                style={{ flex: 1, justifyContent: 'center', margin: 0, padding: '10px' }}
                onClick={handleConfirmClearAll}
              >
                <i className="fas fa-trash-alt mr-2"></i> CLEAR ALL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
