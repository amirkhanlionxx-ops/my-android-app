import React, { useState, useRef, useEffect } from 'react';
import { cleanFileTypes100, FileTypeItem } from '../data/fileTypes100';

interface CreateFileModalProps {
  onCancel: () => void;
  onConfirm: (name: string, extension: string, type: 'file' | 'folder', starterCode?: string) => void;
}

export const CreateFileModal: React.FC<CreateFileModalProps> = ({ onCancel, onConfirm }) => {
  // Default to HTML File or first item
  const [selectedItem, setSelectedItem] = useState<FileTypeItem>(cleanFileTypes100[0]);
  // Base name without extension (e.g. "New File" or "index")
  const [baseName, setBaseName] = useState<string>(() => {
    const fn = cleanFileTypes100[0].fileName;
    const ext = cleanFileTypes100[0].ext;
    return ext && fn.endsWith(ext) ? fn.slice(0, -ext.length) : fn;
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (item: FileTypeItem) => {
    setSelectedItem(item);
    // Keep current base name or set default if empty
    if (!baseName.trim()) {
      const ext = item.ext;
      const defName = ext && item.fileName.endsWith(ext) ? item.fileName.slice(0, -ext.length) : item.fileName;
      setBaseName(defName);
    }
  };

  const handleConfirm = () => {
    const raw = baseName.trim() || 'NewFile';
    const isFolder = selectedItem.isFolder || raw.endsWith('/');
    const cleanFinal = raw.replace(/\/$/, '');
    const fullName = isFolder
      ? cleanFinal
      : selectedItem.ext && !cleanFinal.endsWith(selectedItem.ext)
      ? `${cleanFinal}${selectedItem.ext}`
      : cleanFinal;

    const starter = selectedItem.starterContent(fullName);
    onConfirm(fullName, selectedItem.ext, isFolder ? 'folder' : 'file', starter);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div id="create-file-modal" className="modal-view" onClick={onCancel}>
      <div
        className="screenshot-create-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title 'FILE SELECT' and Close */}
        <div className="screenshot-create-header">
          <h2 className="screenshot-create-title">FILE SELECT</h2>
          <button
            type="button"
            className="screenshot-create-close"
            onClick={onCancel}
            title="Close"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* 100 File / Folder Types as Smooth Rounded Pills (Matching Screenshot 6) */}
        <div className="screenshot-chips-container" ref={scrollContainerRef}>
          {cleanFileTypes100.map((item) => {
            const isSelected = selectedItem.id === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`screenshot-pill-chip ${isSelected ? 'pill-chip-selected' : ''}`}
                onClick={() => handleSelect(item)}
              >
                {item.coreLabel}
              </button>
            );
          })}
        </div>

        {/* Underline Input Field with Extension on the right (Matching Screenshot 6) */}
        <div className="screenshot-input-row">
          <input
            ref={inputRef}
            type="text"
            className="screenshot-underline-input"
            value={baseName}
            placeholder="New File"
            onChange={(e) => setBaseName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleConfirm();
            }}
          />
          <span className="screenshot-extension-label">
            {selectedItem.isFolder ? '/' : selectedItem.ext}
          </span>
        </div>

        {/* Bottom OK Button (Matching Screenshot 6) */}
        <div className="screenshot-actions-row">
          <button
            type="button"
            className="screenshot-btn-cancel"
            onClick={onCancel}
          >
            CANCEL
          </button>
          <button
            type="button"
            className="screenshot-btn-ok"
            onClick={handleConfirm}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
