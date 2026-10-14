import React, { useState } from 'react';
import { ProjectTemplate } from '../types';

interface TemplateModalProps {
  platform: 'android' | 'flutter';
  templates: ProjectTemplate[];
  selectedTemplate: ProjectTemplate | null;
  onSelectTemplate: (tpl: ProjectTemplate) => void;
  onSkip: () => void;
  onClose: () => void;
  onProceed: () => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  platform,
  templates,
  selectedTemplate,
  onSelectTemplate,
  onSkip,
  onClose,
  onProceed,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="template-page" className="modal-view">
      <div className="mobile-frame-container">
        <div className="custom-unique-bar">
          <span>100 {platform.toUpperCase()} TEMPLATES</span>
        </div>

        {/* Template Quick Search */}
        <div className="template-search-wrap">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder={`Search 100 ${platform} templates...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        <div className="template-grid-scroll">
          <div className="template-grid" id="templateGrid">
            {filtered.map((tpl) => {
              const isSelected = selectedTemplate?.id === tpl.id;
              const accentColor = tpl.colorAccent || (platform === 'flutter' ? '#0175C2' : '#3DDC84');
              return (
                <div
                  key={tpl.id}
                  id={`tpl-item-${tpl.id}`}
                  className={`tpl-box ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectTemplate(tpl)}
                  style={{
                    borderTopColor: accentColor,
                    borderTopWidth: '3px',
                    borderTopStyle: 'solid',
                    borderLeftColor: isSelected ? accentColor : undefined,
                    borderRightColor: isSelected ? accentColor : undefined,
                    borderBottomColor: isSelected ? accentColor : undefined,
                  }}
                >
                  <div
                    className="tpl-icon-bubble"
                    style={{ background: `${accentColor}22`, color: accentColor }}
                  >
                    <i className={`fas ${tpl.icon}`}></i>
                  </div>
                  <span className="tpl-name-white">{tpl.name}</span>
                  <div className="tpl-category-tag" style={{ color: accentColor }}>
                    {tpl.category}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="custom-unique-bar custom-footer-unique-bar">
          <button id="btn-skip-template" onClick={onSkip}>
            SKIP
          </button>
          <button id="btn-close-template" onClick={onClose}>
            CLOSE
          </button>
          <button id="btn-create-template" onClick={onProceed} className="btn-primary-bar">
            CREATE
          </button>
        </div>
      </div>
    </div>
  );
};
