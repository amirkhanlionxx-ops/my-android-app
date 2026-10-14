import React from 'react';

interface ConfigModalProps {
  platform: 'android' | 'flutter';
  appTypes: string[];
  selectedAppType: string;
  onSelectAppType: (type: string) => void;
  languages: string[];
  selectedLanguage: string;
  onSelectLanguage: (lang: string) => void;
  appName: string;
  onChangeAppName: (name: string) => void;
  packageName: string;
  onChangePackageName: (pkg: string) => void;
  onBack: () => void;
  onCreate: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  platform,
  appTypes,
  selectedAppType,
  onSelectAppType,
  languages,
  selectedLanguage,
  onSelectLanguage,
  appName,
  onChangeAppName,
  packageName,
  onChangePackageName,
  onBack,
  onCreate,
}) => {
  return (
    <div id="config-page" className="modal-view">
      <div className="mobile-frame-container config-frame-compact">
        <div className="header-title-clean-text">
          NEW {platform.toUpperCase()} PROJECT
        </div>
        <div className="config-container">
          <div className="section-label-bold">
            {platform.toUpperCase()} APP TYPES (100 ITEMS)
          </div>
          <div className="thin-scroll-bars" id="appTypes">
            {appTypes.map((type, idx) => (
              <div
                key={idx}
                id={`app-type-item-${idx}`}
                className={`thin-item-bar ${selectedAppType === type ? 'active' : ''}`}
                onClick={() => onSelectAppType(type)}
              >
                {type}
              </div>
            ))}
          </div>

          <div className="section-label-bold">
            {platform === 'flutter' ? 'DART PACKAGES & ENGINES (100 ITEMS)' : 'LANGUAGES & RUNTIMES (100 ITEMS)'}
          </div>
          <div className="thin-scroll-bars" id="languages">
            {languages.map((lang, idx) => (
              <div
                key={idx}
                id={`lang-item-${idx}`}
                className={`thin-item-bar ${selectedLanguage === lang ? 'active' : ''}`}
                onClick={() => onSelectLanguage(lang)}
              >
                {lang}
              </div>
            ))}
          </div>

          <div className="section-label-bold">APP NAME</div>
          <div className="input-full-bar-wrap">
            <input
              type="text"
              id="appNameInput"
              value={appName}
              onChange={(e) => onChangeAppName(e.target.value)}
              placeholder={platform === 'flutter' ? 'FLUTTER APP' : 'ANDROID APP'}
            />
          </div>

          <div className="section-label-bold">PACKAGE / BUNDLE ID</div>
          <div className="input-full-bar-wrap">
            <input
              type="text"
              id="pkgNameInput"
              value={packageName}
              onChange={(e) => onChangePackageName(e.target.value)}
              placeholder={platform === 'flutter' ? 'com.example.flutter_app' : 'com.myapp.android'}
            />
          </div>

          <div className="config-action-buttons">
            <button id="btn-config-back" onClick={onBack} className="btn-secondary-custom">
              BACK
            </button>
            <button id="btn-config-create" onClick={onCreate} className="btn-primary-custom">
              CREATE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
