import React from 'react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onClose: () => void;
  onResetCode: () => void;
  onResetProjectFiles: () => void;
  onResetData: () => void;
  onFactoryReset: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
  onResetCode,
  onResetProjectFiles,
  onResetData,
  onFactoryReset,
}) => {
  const confirmAction = (msg: string, action: () => void) => {
    if (window.confirm(msg)) {
      action();
    }
  };

  const handleFontSizeChange = (delta: number) => {
    const newSize = Math.max(10, Math.min(24, settings.fontSize + delta));
    onUpdateSettings({ ...settings, fontSize: newSize });
  };

  return (
    <div id="settings-modal" className="modal-view">
      <div className="mobile-frame-container settings-dialog-box">
        {/* Header Bar */}
        <div className="settings-header-bar">
          <div className="settings-header-left">
            <i className="fas fa-sliders-h settings-title-icon"></i>
            <span className="settings-main-title">SETTINGS</span>
          </div>
          <button className="settings-close-x" onClick={onClose} title="Close Settings">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="settings-scroll-body">
          {/* Card 1: IDE Preferences */}
          <div className="settings-card-clean">
            <div className="card-header-badge">
              <i className="fas fa-gear"></i>
              <span>IDE & EDITOR PREFERENCES</span>
            </div>

            <div className="clean-setting-item">
              <div className="item-label-wrap">
                <span className="item-title">Theme</span>
                <small className="item-sub">Choose visual appearance</small>
              </div>
              <select
                className="clean-select"
                value={settings.theme}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, theme: e.target.value as 'Dark' | 'Light' })
                }
              >
                <option value="Dark">Dark Mode</option>
                <option value="Light">Light Mode</option>
              </select>
            </div>

            <div className="clean-setting-item">
              <div className="item-label-wrap">
                <span className="item-title">Language</span>
                <small className="item-sub">Interface display language</small>
              </div>
              <select
                className="clean-select"
                value={settings.language}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    language: e.target.value as AppSettings['language'],
                  })
                }
              >
                <option value="English">English</option>
                <option value="Bengali">বাংলা (Bengali)</option>
                <option value="Hindi">हिन्दी (Hindi)</option>
                <option value="Spanish">Español</option>
              </select>
            </div>

            <div className="clean-setting-item">
              <div className="item-label-wrap">
                <span className="item-title">Code Font Size</span>
                <small className="item-sub">Current: {settings.fontSize}px</small>
              </div>
              <div className="font-size-stepper">
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={() => handleFontSizeChange(-1)}
                  title="Decrease font size"
                >
                  <i className="fas fa-minus"></i>
                </button>
                <span className="stepper-value">{settings.fontSize}px</span>
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={() => handleFontSizeChange(1)}
                  title="Increase font size"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            </div>

            <div className="clean-setting-item">
              <div className="item-label-wrap">
                <span className="item-title">Auto-Save Code</span>
                <small className="item-sub">Automatically save changes</small>
              </div>
              <label className="clean-switch">
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => onUpdateSettings({ ...settings, autoSave: e.target.checked })}
                />
                <span className="switch-slider"></span>
              </label>
            </div>

            <div className="clean-setting-item">
              <div className="item-label-wrap">
                <span className="item-title">Turbo Speed Boost</span>
                <small className="item-sub">Compiler JIT acceleration</small>
              </div>
              <select
                className="clean-select"
                value={settings.turboSpeed}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, turboSpeed: parseInt(e.target.value) || 3 })
                }
              >
                <option value={1}>1X Normal</option>
                <option value={2}>2X Fast</option>
                <option value={3}>3X Turbo Boost</option>
              </select>
            </div>
          </div>

          {/* Card 2: Reset & Restore Controls */}
          <div className="settings-card-clean" style={{ marginTop: '16px' }}>
            <div className="card-header-badge" style={{ color: '#ff453a' }}>
              <i className="fas fa-rotate-left"></i>
              <span>RESET & RESTORE CONTROLS</span>
            </div>

            <div className="clean-resets-list">
              <button
                type="button"
                className="clean-reset-row reset-row-code"
                onClick={() =>
                  confirmAction('Revert current active file to default code?', onResetCode)
                }
              >
                <div className="reset-row-icon" style={{ background: 'rgba(0, 122, 255, 0.18)', color: '#0A84FF' }}>
                  <i className="fas fa-file-code"></i>
                </div>
                <div className="reset-row-info">
                  <strong>Code Reset</strong>
                  <small>Revert currently open file to original template</small>
                </div>
              </button>

              <button
                type="button"
                className="clean-reset-row reset-row-proj"
                onClick={() =>
                  confirmAction(
                    'Reset all project files and folders to default structure?',
                    onResetProjectFiles
                  )
                }
              >
                <div className="reset-row-icon" style={{ background: 'rgba(255, 159, 10, 0.18)', color: '#FF9F0A' }}>
                  <i className="fas fa-folder-tree"></i>
                </div>
                <div className="reset-row-info">
                  <strong>All Project Reset</strong>
                  <small>Restore default project directory layout</small>
                </div>
              </button>

              <button
                type="button"
                className="clean-reset-row reset-row-data"
                onClick={() =>
                  confirmAction(
                    'Clear custom app logo, caches and local state?',
                    onResetData
                  )
                }
              >
                <div className="reset-row-icon" style={{ background: 'rgba(175, 82, 222, 0.18)', color: '#BF5AF2' }}>
                  <i className="fas fa-database"></i>
                </div>
                <div className="reset-row-info">
                  <strong>Data Reset</strong>
                  <small>Clear app logo, cache and stored keys</small>
                </div>
              </button>

              <button
                type="button"
                className="clean-reset-row reset-row-factory"
                onClick={() =>
                  confirmAction(
                    'WARNING: Factory All Reset will wipe all edits, files and restore initial fresh IDE state. Proceed?',
                    onFactoryReset
                  )
                }
              >
                <div className="reset-row-icon" style={{ background: 'rgba(255, 69, 58, 0.22)', color: '#FF453A' }}>
                  <i className="fas fa-trash-can"></i>
                </div>
                <div className="reset-row-info">
                  <strong style={{ color: '#FF453A' }}>Factory All Reset</strong>
                  <small>Wipe everything & restore original clean state</small>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="settings-footer-action">
          <button id="btn-save-settings" onClick={onClose} className="btn-primary-done">
            DONE & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
