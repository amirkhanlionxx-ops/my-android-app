import React, { useState, useMemo } from 'react';
import { FileNode } from '../types';

interface SavedCodesInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileSystem: FileNode[];
  projectTitle: string;
  activePlatform: 'android' | 'flutter';
  onOpenFileInEditor: (file: FileNode) => void;
  onShowAlert: (msg: string) => void;
}

interface FlatSavedFile {
  id: string;
  name: string;
  folderName: string;
  folderId: string;
  content: string;
  lineCount: number;
  byteSize: number;
  extension: string;
  node: FileNode;
}

export const SavedCodesInspectorModal: React.FC<SavedCodesInspectorModalProps> = ({
  isOpen,
  onClose,
  fileSystem,
  projectTitle,
  activePlatform,
  onOpenFileInEditor,
  onShowAlert,
}) => {
  const [activeTab, setActiveTab] = useState<'files' | 'blueprint'>('files');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileId, setSelectedFileId] = useState<string>('');

  // Collect all files across all folders
  const allSavedFiles: FlatSavedFile[] = useMemo(() => {
    const list: FlatSavedFile[] = [];

    const traverse = (nodes: FileNode[], parentFolderName = 'ROOT', parentFolderId = 'root') => {
      for (const node of nodes) {
        if (node.type === 'folder' && node.children) {
          traverse(node.children, node.name, node.id);
        } else if (node.type === 'file') {
          const content = node.content || '';
          const lines = content ? content.split('\n').length : 0;
          const ext = node.name.includes('.') ? node.name.substring(node.name.lastIndexOf('.')) : '';
          list.push({
            id: node.id,
            name: node.name,
            folderName: parentFolderName,
            folderId: parentFolderId,
            content,
            lineCount: lines,
            byteSize: new Blob([content]).size,
            extension: ext,
            node,
          });
        }
      }
    };

    traverse(fileSystem);
    return list;
  }, [fileSystem]);

  // Filtered files
  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return allSavedFiles;
    const q = searchQuery.toLowerCase();
    return allSavedFiles.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.folderName.toLowerCase().includes(q) ||
        f.extension.toLowerCase().includes(q)
    );
  }, [allSavedFiles, searchQuery]);

  // Selected file for code preview
  const activeSelectedFile = useMemo(() => {
    if (selectedFileId) {
      const found = allSavedFiles.find((f) => f.id === selectedFileId);
      if (found) return found;
    }
    return filteredFiles[0] || allSavedFiles[0] || null;
  }, [selectedFileId, allSavedFiles, filteredFiles]);

  if (!isOpen) return null;

  const handleCopyCode = (text: string, fileName: string) => {
    navigator.clipboard.writeText(text);
    onShowAlert(`Copied code from "${fileName}"`);
  };

  const handleOpenInEditor = (fileNode: FileNode) => {
    onOpenFileInEditor(fileNode);
    onClose();
  };

  return (
    <div className="saved-codes-modal-overlay" onClick={onClose}>
      <div className="saved-codes-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="saved-codes-modal-header">
          <div className="saved-codes-header-left">
            <div className="saved-codes-header-icon">
              <i className="fas fa-file-code"></i>
            </div>
            <div>
              <div className="saved-codes-title">
                SAVED PROJECT CODES & BLUEPRINT (A TO Z)
              </div>
              <div className="saved-codes-subtitle">
                <span className="text-sky-400 font-bold">{projectTitle}</span> •{' '}
                <span className="text-emerald-400 font-bold">{activePlatform.toUpperCase()}</span> •{' '}
                <span>{allSavedFiles.length} Saved Files</span> •{' '}
                <span>25 Modular Folders</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="saved-codes-close-btn"
            onClick={onClose}
            title="Close"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="saved-codes-tabs">
          <button
            type="button"
            className={`saved-codes-tab-btn ${activeTab === 'files' ? 'active' : ''}`}
            onClick={() => setActiveTab('files')}
          >
            <i className="fas fa-folder-tree mr-2"></i>
            SAVED FILES & FOLDERS ({filteredFiles.length})
          </button>
          <button
            type="button"
            className={`saved-codes-tab-btn ${activeTab === 'blueprint' ? 'active' : ''}`}
            onClick={() => setActiveTab('blueprint')}
          >
            <i className="fas fa-sitemap mr-2"></i>
            HOW APP IS CREATED (A TO Z)
          </button>
        </div>

        {/* Body Content */}
        <div className="saved-codes-modal-body">
          {activeTab === 'files' ? (
            <div className="saved-codes-files-view">
              {/* Left Column: File & Folder Browser */}
              <div className="saved-codes-sidebar">
                <div className="saved-codes-search-box">
                  <i className="fas fa-search"></i>
                  <input
                    type="text"
                    placeholder="Search saved files, folders, extensions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery('')}>
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>

                <div className="saved-codes-file-list">
                  {filteredFiles.length === 0 ? (
                    <div className="saved-codes-empty-notice">
                      No matching files found.
                    </div>
                  ) : (
                    filteredFiles.map((f) => {
                      const isSelected = activeSelectedFile?.id === f.id;
                      return (
                        <div
                          key={f.id}
                          className={`saved-codes-file-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => setSelectedFileId(f.id)}
                        >
                          <div className="saved-file-meta-row">
                            <span className="saved-file-folder-badge">
                              {f.folderName}
                            </span>
                            <span className="saved-file-lines-badge">
                              {f.lineCount} lines
                            </span>
                          </div>
                          <div className="saved-file-name-row">
                            <i className="fas fa-file-code text-sky-400 mr-2"></i>
                            <span className="saved-file-name">{f.name}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Code Preview & Inspection */}
              <div className="saved-codes-preview-pane">
                {activeSelectedFile ? (
                  <>
                    <div className="saved-preview-header">
                      <div>
                        <div className="saved-preview-file-title">
                          <span className="text-slate-400">{activeSelectedFile.folderName} /</span>{' '}
                          <span className="text-white font-bold">{activeSelectedFile.name}</span>
                        </div>
                        <div className="saved-preview-file-stats">
                          <span>Lines: {activeSelectedFile.lineCount}</span>
                          <span>Bytes: {activeSelectedFile.byteSize} B</span>
                          <span className="saved-status-tag">SAVED IN PROJECT</span>
                        </div>
                      </div>

                      <div className="saved-preview-actions">
                        <button
                          type="button"
                          className="saved-action-btn btn-copy"
                          onClick={() => handleCopyCode(activeSelectedFile.content, activeSelectedFile.name)}
                          title="Copy Code"
                        >
                          <i className="fas fa-copy mr-1.5"></i> COPY
                        </button>
                        <button
                          type="button"
                          className="saved-action-btn btn-load"
                          onClick={() => handleOpenInEditor(activeSelectedFile.node)}
                          title="Load this file in IDE Editor"
                        >
                          <i className="fas fa-arrow-up-right-from-square mr-1.5"></i> LOAD IN EDITOR
                        </button>
                      </div>
                    </div>

                    <div className="saved-preview-code-wrap">
                      <pre className="saved-preview-code">
                        <code>{activeSelectedFile.content || '// (Empty file content)'}</code>
                      </pre>
                    </div>
                  </>
                ) : (
                  <div className="saved-preview-empty">
                    Select a file from the left to inspect its saved code.
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Blueprint: How App is Created (A to Z Architecture Guide) */
            <div className="saved-codes-blueprint-view">
              <div className="blueprint-hero">
                <div className="blueprint-hero-title">
                  HOW THIS {activePlatform.toUpperCase()} APP WAS CREATED (A TO Z ARCHITECTURE)
                </div>
                <div className="blueprint-hero-desc">
                  Complete breakdown of how every folder and saved file connects together to construct the operational mobile application.
                </div>
              </div>

              <div className="blueprint-steps-list">
                {/* Step A */}
                <div className="blueprint-step-card">
                  <div className="blueprint-step-badge">A</div>
                  <div className="blueprint-step-content">
                    <div className="blueprint-step-heading">
                      01_MANIFEST & CONFIGURATION
                    </div>
                    <div className="blueprint-step-folder">
                      Folder: <span className="text-sky-400">01_MANIFEST</span> • File: <span className="text-white">AndroidManifest.xml</span>
                    </div>
                    <div className="blueprint-step-text">
                      Defines the application core package ID, application icon, theme reference (<span className="text-emerald-400">@style/AppTheme</span>), system permissions (<span className="text-amber-400">INTERNET, VIBRATE</span>), and registers the main launcher Activity that boots when the user taps the app on their phone.
                    </div>
                  </div>
                </div>

                {/* Step B */}
                <div className="blueprint-step-card">
                  <div className="blueprint-step-badge">B</div>
                  <div className="blueprint-step-content">
                    <div className="blueprint-step-heading">
                      02_JAVA & 03_KOTLIN CONTROLLERS
                    </div>
                    <div className="blueprint-step-folder">
                      Folders: <span className="text-sky-400">02_JAVA</span> & <span className="text-sky-400">03_KOTLIN</span> • Files: <span className="text-white">MainActivity.java, AppActivity.kt</span>
                    </div>
                    <div className="blueprint-step-text">
                      Contains the application runtime lifecycle logic. In <span className="text-emerald-400">onCreate()</span>, the controller inflates the XML view layout (<span className="text-sky-400">R.layout.activity_main</span>), configures button click listeners, handles state changes, and processes user events.
                    </div>
                  </div>
                </div>

                {/* Step C */}
                <div className="blueprint-step-card">
                  <div className="blueprint-step-badge">C</div>
                  <div className="blueprint-step-content">
                    <div className="blueprint-step-heading">
                      04_RES_LAYOUT USER INTERFACE
                    </div>
                    <div className="blueprint-step-folder">
                      Folder: <span className="text-sky-400">04_RES_LAYOUT</span> • Files: <span className="text-white">activity_main.xml, fragment_home.xml</span>
                    </div>
                    <div className="blueprint-step-text">
                      Constructs the graphical user interface tree using declarative XML layout containers (<span className="text-amber-400">LinearLayout, FrameLayout</span>), TextView labels, Action Buttons, and padding definitions.
                    </div>
                  </div>
                </div>

                {/* Step D */}
                <div className="blueprint-step-card">
                  <div className="blueprint-step-badge">D</div>
                  <div className="blueprint-step-content">
                    <div className="blueprint-step-heading">
                      05_RES_VALUES & 06_RES_DRAWABLE ASSETS
                    </div>
                    <div className="blueprint-step-folder">
                      Folders: <span className="text-sky-400">05_RES_VALUES</span>, <span className="text-sky-400">06_RES_DRAWABLE</span>, <span className="text-sky-400">07_RES_MIPMAP</span>
                    </div>
                    <div className="blueprint-step-text">
                      Supplies localized string resources (<span className="text-emerald-400">strings.xml</span>), color palettes (<span className="text-emerald-400">colors.xml</span>), theme overrides (<span className="text-emerald-400">styles.xml</span>), and scalable vector drawables for app icons.
                    </div>
                  </div>
                </div>

                {/* Step E */}
                <div className="blueprint-step-card">
                  <div className="blueprint-step-badge">E</div>
                  <div className="blueprint-step-content">
                    <div className="blueprint-step-heading">
                      13_GRADLE_SCRIPTS BUILD ENGINE
                    </div>
                    <div className="blueprint-step-folder">
                      Folder: <span className="text-sky-400">13_GRADLE_SCRIPTS</span> • File: <span className="text-white">build.gradle</span>
                    </div>
                    <div className="blueprint-step-text">
                      Specifies <span className="text-sky-400">compileSdkVersion</span>, <span className="text-sky-400">minSdkVersion</span>, and <span className="text-sky-400">targetSdkVersion</span>, compiles Java/Kotlin code into Dalvik Executable (DEX) format, links XML resources with AAPT2, and packages everything into an APK.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
