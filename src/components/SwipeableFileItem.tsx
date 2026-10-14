import React, { useState, useRef, useEffect } from 'react';
import { FileNode } from '../types';
import { isUserCreatedNode } from '../data/initialFileSystem';

interface SwipeableFileItemProps {
  node: FileNode;
  isActive: boolean;
  onSelect: (node: FileNode) => void;
  onDelete: (node: FileNode) => void;
  onOpenContext: (node: FileNode) => void;
  onPointerDownNode: (node: FileNode) => void;
  onPointerUpNode: () => void;
  onShowAlert: (msg: string) => void;
}

export const SwipeableFileItem: React.FC<SwipeableFileItemProps> = ({
  node,
  isActive,
  onSelect,
  onDelete,
  onOpenContext,
  onPointerDownNode,
  onPointerUpNode,
  onShowAlert,
}) => {
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const currentXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const isHorizontalSwipeRef = useRef(false);
  const itemRef = useRef<HTMLDivElement>(null);

  const isProtected = !isUserCreatedNode(node);

  // Reset swipe when active node changes or item is closed externally
  useEffect(() => {
    if (!isOpen && translateX !== 0) {
      setTranslateX(0);
    }
  }, [isOpen]);

  // Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    startXRef.current = touch.clientX;
    startYRef.current = touch.clientY;
    currentXRef.current = touch.clientX;
    isDraggingRef.current = true;
    isHorizontalSwipeRef.current = false;

    // Start long-press timer only if not already open
    if (!isOpen) {
      onPointerDownNode(node);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - startXRef.current;
    const dy = touch.clientY - startYRef.current;

    // Detect if horizontal intent
    if (!isHorizontalSwipeRef.current) {
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
        isHorizontalSwipeRef.current = true;
        setIsSwiping(true);
        // Cancel long-press timer if user is swiping
        onPointerUpNode();
      } else if (Math.abs(dy) > 8) {
        // Vertical scroll intent: cancel drag
        isDraggingRef.current = false;
        onPointerUpNode();
        return;
      }
    }

    if (isHorizontalSwipeRef.current) {
      const baseOffset = isOpen ? -75 : 0;
      let newOffset = baseOffset + dx;

      if (isProtected) {
        // Protected file: provide resistance and prevent full swipe
        newOffset = Math.max(-25, Math.min(0, newOffset));
      } else {
        // Normal file: clamp between -130px and 0px
        newOffset = Math.max(-130, Math.min(0, newOffset));
      }

      setTranslateX(newOffset);
    }
  };

  const handleTouchEnd = () => {
    onPointerUpNode();
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsSwiping(false);

    if (isHorizontalSwipeRef.current) {
      if (isProtected) {
        if (translateX < -15) {
          onShowAlert('Protected system file cannot be deleted');
        }
        setTranslateX(0);
        setIsOpen(false);
        return;
      }

      // If dragged far enough to auto-delete
      if (translateX < -115) {
        setTranslateX(-150);
        setIsOpen(false);
        setTimeout(() => {
          setTranslateX(0);
          onDelete(node);
        }, 150);
        return;
      }

      // If dragged past threshold to reveal delete button
      if (translateX < -45) {
        setTranslateX(-75);
        setIsOpen(true);
      } else {
        setTranslateX(0);
        setIsOpen(false);
      }
    }
  };

  // Pointer / Mouse fallback for desktop testing
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return; // Handled by touch events
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    currentXRef.current = e.clientX;
    isDraggingRef.current = true;
    isHorizontalSwipeRef.current = false;

    if (!isOpen) {
      onPointerDownNode(node);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch' || !isDraggingRef.current) return;
    const dx = e.clientX - startXRef.current;
    const dy = e.clientY - startYRef.current;

    if (!isHorizontalSwipeRef.current) {
      if (Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
        isHorizontalSwipeRef.current = true;
        setIsSwiping(true);
        onPointerUpNode();
      }
    }

    if (isHorizontalSwipeRef.current) {
      const baseOffset = isOpen ? -75 : 0;
      let newOffset = baseOffset + dx;
      if (isProtected) {
        newOffset = Math.max(-25, Math.min(0, newOffset));
      } else {
        newOffset = Math.max(-130, Math.min(0, newOffset));
      }
      setTranslateX(newOffset);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return;
    onPointerUpNode();
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsSwiping(false);

    if (isHorizontalSwipeRef.current) {
      if (isProtected) {
        if (translateX < -15) {
          onShowAlert('Protected system file cannot be deleted');
        }
        setTranslateX(0);
        setIsOpen(false);
        return;
      }

      if (translateX < -115) {
        setTranslateX(-150);
        setIsOpen(false);
        setTimeout(() => {
          setTranslateX(0);
          onDelete(node);
        }, 150);
        return;
      }

      if (translateX < -45) {
        setTranslateX(-75);
        setIsOpen(true);
      } else {
        setTranslateX(0);
        setIsOpen(false);
      }
    }
  };

  const handleClickItem = (e: React.MouseEvent) => {
    if (isHorizontalSwipeRef.current) {
      e.stopPropagation();
      return;
    }
    if (isOpen) {
      // Tap closes the revealed delete action
      setTranslateX(0);
      setIsOpen(false);
      e.stopPropagation();
      return;
    }
    onSelect(node);
  };

  const getFileIcon = (fileName: string) => {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.apk')) return 'fab fa-android text-emerald-400';
    if (lower.endsWith('.kt')) return 'fas fa-file-code text-purple-400';
    if (lower.endsWith('.java')) return 'fas fa-mug-hot text-amber-500';
    if (lower.endsWith('.dart')) return 'fas fa-feather-pointed text-cyan-400';
    if (lower.endsWith('.html')) return 'fab fa-html5 text-orange-500';
    if (lower.endsWith('.css')) return 'fab fa-css3-alt text-blue-400';
    if (lower.endsWith('.js') || lower.endsWith('.ts')) return 'fab fa-js text-yellow-400';
    if (lower.endsWith('.json')) return 'fas fa-file-lines text-emerald-400';
    if (lower.endsWith('.xml')) return 'fas fa-code text-emerald-400';
    if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.svg')) {
      return 'fas fa-image text-pink-400';
    }
    return 'fas fa-file-code text-blue-400';
  };

  const isApkFile = node.name.toLowerCase().endsWith('.apk');

  return (
    <div
      ref={itemRef}
      className="swipeable-file-wrapper"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onContextMenu={(e) => {
        e.preventDefault();
        onOpenContext(node);
      }}
    >
      {/* Background Revealed Swipe Delete Action Bar */}
      <div className="swipe-action-background" aria-hidden="true">
        {isProtected ? (
          <div className="swipe-protected-badge" title="Protected System File">
            <i className="fas fa-shield-halved"></i>
            <span>LOCKED</span>
          </div>
        ) : (
          <button
            type="button"
            className="swipe-delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              setTranslateX(0);
              setIsOpen(false);
              onDelete(node);
            }}
            title={`Delete ${node.name}`}
          >
            <i className="fas fa-trash-can"></i>
            <span>DELETE</span>
          </button>
        )}
      </div>

      {/* Front Sliding File Row */}
      <div
        className={`tree-item file ${isActive ? 'active' : ''} ${isOpen ? 'swiped-open' : ''}`}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        onClick={handleClickItem}
      >
        <div className="tree-item-left">
          <i className={getFileIcon(node.name)}></i>
          <span className="file-name-text">{node.name}</span>
        </div>

        {/* 3-dots context menu */}
        <div className="tree-item-right">
          <button
            type="button"
            className="tree-more-btn"
            title={`Options for ${node.name}`}
            onClick={(e) => {
              e.stopPropagation();
              onOpenContext(node);
            }}
          >
            <i className="fas fa-ellipsis-vertical"></i>
          </button>
        </div>
      </div>
    </div>
  );
};
