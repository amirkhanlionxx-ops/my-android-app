import React, { useState } from 'react';
import { playAndroidSound, playFlutterSound } from '../utils/audioEffects';

export const FlutterLogoSvg: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 166 202" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M100.2 0L0 100.2L31.3 131.5L162.8 0H100.2Z" fill="#40C4FF" />
    <path d="M99.6 98.7L39.8 158.5L71.1 189.8L162.3 98.7H99.6Z" fill="#02569B" />
    <path d="M70.9 189.9L102.2 158.6L133.5 189.9L102.2 201.2L70.9 189.9Z" fill="#01579B" opacity="0.8" />
    <path d="M39.6 158.7L70.9 189.9L162.3 98.7H130.9L71.1 158.5L39.6 158.7Z" fill="#0277BD" />
  </svg>
);

export const AndroidLogoSvg: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#3DDC84" className={className}>
    <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-4.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 2.23 12.95 2 12 2c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/>
  </svg>
);

interface DashboardProps {
  projectTitle: string;
  appLogoUrl: string | null;
  activePlatform: 'android' | 'flutter';
  onSelectPlatform: (platform: 'android' | 'flutter') => void;
  onOpenTemplates: (platform?: 'android' | 'flutter') => void;
  onTriggerFolderPicker: () => void;
  onSaveCode: () => void;
  onTriggerFilePicker: () => void;
  onDownloadProjectZip: () => void;
  onDownloadApk?: () => void;
  onDownloadIdeApk?: () => void;
  onOpenEditor: (action?: 'export' | 'import' | 'save' | null) => void;
  onOpenSelectProject: () => void;
  onOpenSettings: () => void;
  onOpenPractice: (mode?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  projectTitle,
  appLogoUrl,
  activePlatform,
  onSelectPlatform,
  onOpenTemplates,
  onTriggerFolderPicker,
  onSaveCode,
  onTriggerFilePicker,
  onDownloadProjectZip,
  onDownloadApk,
  onDownloadIdeApk,
  onOpenEditor,
  onOpenSelectProject,
  onOpenSettings,
  onOpenPractice,
}) => {
  const handleTogglePlatform = (platform: 'android' | 'flutter') => {
    if (platform === 'android') {
      playAndroidSound();
    } else {
      playFlutterSound();
    }
    onSelectPlatform(platform);
  };

  const isFlutter = activePlatform === 'flutter';
  const platformLabel = isFlutter ? 'Flutter' : 'Android';

  // Pre-configured & saved projects for "Open Project"
  const projectList = [
    {
      id: 'proj_empty_act',
      name: `${platformLabel} Empty Activity (Current)`,
      badge: 'Active',
      desc: isFlutter ? 'Standard Flutter Material App starter' : 'Kotlin Android Activity with XML layouts',
      icon: isFlutter ? 'fa-feather-pointed' : 'fa-mobile-screen',
      color: isFlutter ? '#0284c7' : '#22c55e',
    },
    {
      id: 'proj_nav_drawer',
      name: `${platformLabel} Navigation Flow`,
      badge: 'Template',
      desc: 'Drawer navigation with multi-screen support',
      icon: 'fa-compass',
      color: '#a855f7',
    },
    {
      id: 'proj_compose_starter',
      name: isFlutter ? 'Flutter Stateful Counter' : 'Jetpack Compose Starter',
      badge: 'Modern',
      desc: isFlutter ? 'StatefulWidget reactive UI architecture' : 'Declarative Kotlin UI architecture',
      icon: 'fa-cubes',
      color: '#f59e0b',
    },
    {
      id: 'proj_clean_app',
      name: `${platformLabel} Clean Architecture`,
      badge: 'Pro',
      desc: 'MVVM pattern with clean separation of logic',
      icon: 'fa-layer-group',
      color: '#06b6d4',
    },
  ];

  return (
    <div id="dashboard">
      {/* Header with Platform Logo (Android / Flutter) and Platform Title (FLUTTER / ANDROID) */}
      <div className="centered-header">
        <div className="dash-logo-wrapper">
          {isFlutter ? (
            <FlutterLogoSvg size={54} className="flutter-main-logo" />
          ) : (
            <div
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '66px',
                height: '66px',
                borderRadius: '18px',
                background: '#090d16',
                border: '3.5px solid #00b0ff',
                boxShadow: '0 4px 18px rgba(0, 176, 255, 0.4), inset 0 0 10px rgba(0, 176, 255, 0.2)',
                padding: '5px',
                overflow: 'hidden',
              }}
            >
              <img
                src="/android_logo.png"
                alt="Android Logo"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '12px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6))',
                }}
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
        <h1
          className="main-title"
          id="projectTitleHeader"
          style={{
            color: isFlutter ? '#38bdf8' : '#3ddc84',
            letterSpacing: '0.04em',
            transition: 'color 0.25s ease',
          }}
        >
          {isFlutter ? 'FLUTTER' : 'ANDROID'}
        </h1>
      </div>

      {/* Slim Two-Platform Selection Bars (ANDROID & FLUTTER) */}
      <div className="platform-split-container slim-split-container">
        <div
          className={`platform-card slim-platform-card platform-android ${
            !isFlutter ? 'active-platform' : ''
          }`}
          onClick={() => handleTogglePlatform('android')}
          title="Select Android Platform"
        >
          <div
            className="platform-icon-wrap android-glow"
            style={{
              background: '#090d16',
              border: '2.5px solid #00b0ff',
              boxShadow: '0 0 10px rgba(0, 176, 255, 0.35)',
              padding: '2px',
              overflow: 'hidden',
            }}
          >
            <img
              src="/android_logo.png"
              alt="Android Logo"
              style={{ width: '22px', height: '22px', borderRadius: '4px', objectFit: 'contain' }}
            />
          </div>
          <span className="platform-title">ANDROID</span>
        </div>

        <div
          className={`platform-card slim-platform-card platform-flutter ${
            isFlutter ? 'active-platform' : ''
          }`}
          onClick={() => handleTogglePlatform('flutter')}
          title="Select Flutter Platform"
        >
          <div className="platform-icon-wrap flutter-glow">
            <FlutterLogoSvg size={26} />
          </div>
          <span className="platform-title">FLUTTER</span>
        </div>
      </div>

      <div className="solo-container">
        {/* Section 1: Project Tools (5 Options, Standard Sizing) */}
        <div className="section-badge">PROJECT TOOLS ({platformLabel.toUpperCase()})</div>

        {/* 1. New Project */}
        <div
          className="ios-item-solo"
          id="dash-btn-new-proj"
          onClick={() => onOpenTemplates(activePlatform)}
        >
          <div
            className="icon-box"
            style={{ background: isFlutter ? '#0175C2' : '#3DDC84' }}
          >
            <i className="fas fa-plus-circle"></i>
          </div>
          <span>NEW {platformLabel.toUpperCase()} PROJECT</span>
        </div>

        {/* 2. Open Project (Opens Project Switcher / Manager) */}
        <div
          className="ios-item-solo"
          id="dash-btn-open-proj"
          onClick={onOpenSelectProject}
        >
          <div className="icon-box icon-bg-yellow">
            <i className="fas fa-folder-open"></i>
          </div>
          <span>OPEN PROJECT</span>
        </div>

        {/* 3. Save Project (Saves code and takes user directly into the editor) */}
        <div
          className="ios-item-solo"
          id="dash-btn-save-proj"
          onClick={() => {
            onSaveCode();
            onOpenEditor('save');
          }}
        >
          <div className="icon-box icon-bg-blue">
            <i className="fas fa-save"></i>
          </div>
          <span>SAVE PROJECT</span>
        </div>

        {/* 4. Import Project (Navigates directly into the editor's import options) */}
        <div
          className="ios-item-solo"
          id="dash-btn-import-proj"
          onClick={() => onOpenEditor('import')}
        >
          <div className="icon-box icon-bg-purple">
            <i className="fas fa-file-import"></i>
          </div>
          <span>IMPORT PROJECT</span>
        </div>

        {/* 5. Export Project (Navigates directly into the editor's export options) */}
        <div
          className="ios-item-solo"
          id="dash-btn-export-proj"
          onClick={() => onOpenEditor('export')}
        >
          <div className="icon-box icon-bg-orange">
            <i className="fas fa-file-export"></i>
          </div>
          <span>EXPORT PROJECT</span>
        </div>

        {/* Section 2: Code Practice (5 Specific Standard Options) */}
        <div className="section-badge">CODE PRACTICE ({platformLabel.toUpperCase()})</div>

        {/* 1. New Code Project */}
        <div
          className="ios-item-solo"
          id="dash-practice-new"
          onClick={() => onOpenPractice('new')}
        >
          <div className="icon-box" style={{ background: '#0284c7', color: '#ffffff' }}>
            <i className="fas fa-code" style={{ fontSize: '18px', color: '#ffffff' }}></i>
          </div>
          <span>NEW CODE PROJECT</span>
        </div>

        {/* 2. Open Project File */}
        <div
          className="ios-item-solo"
          id="dash-practice-open"
          onClick={() => onOpenPractice('open')}
        >
          <div className="icon-box icon-bg-purple" style={{ background: '#a855f7', color: '#ffffff' }}>
            <i className="fas fa-folder-open" style={{ fontSize: '18px', color: '#ffffff' }}></i>
          </div>
          <span>OPEN PROJECT FILE</span>
        </div>

        {/* 3. Save Project Code */}
        <div
          className="ios-item-solo"
          id="dash-practice-saved"
          onClick={() => onOpenPractice('saved')}
        >
          <div className="icon-box icon-bg-green">
            <i className="fas fa-save"></i>
          </div>
          <span>SAVE PROJECT CODE</span>
        </div>

        {/* 4. Export Project (In Code Practice) */}
        <div
          className="ios-item-solo"
          id="dash-practice-export"
          onClick={() => onOpenPractice('export')}
        >
          <div className="icon-box icon-bg-orange">
            <i className="fas fa-file-export"></i>
          </div>
          <span>EXPORT PROJECT</span>
        </div>

        {/* 5. Import Project Code */}
        <div
          className="ios-item-solo"
          id="dash-practice-import"
          onClick={() => onOpenPractice('import')}
        >
          <div className="icon-box icon-bg-purple">
            <i className="fas fa-file-import"></i>
          </div>
          <span>IMPORT PROJECT CODE</span>
        </div>

        {/* Section 3: Settings & Resets */}
        <div className="settings-separator"></div>

        <div className="ios-item-solo" id="dash-btn-settings" onClick={onOpenSettings}>
          <div className="icon-box icon-bg-grey">
            <i className="fas fa-sliders-h"></i>
          </div>
          <span>SETTINGS & RESETS</span>
        </div>
      </div>
    </div>
  );
};
