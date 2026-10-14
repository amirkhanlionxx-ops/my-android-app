import React, { useEffect, useState, useRef } from 'react';

interface SplashLoadingProps {
  onFinish: () => void;
}

export const SplashLoading: React.FC<SplashLoadingProps> = ({ onFinish }) => {
  const [fade, setFade] = useState(false);
  const finishedRef = useRef(false);

  const triggerFinish = useRef(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish();
  });

  useEffect(() => {
    triggerFinish.current = () => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      onFinish();
    };
  }, [onFinish]);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFade(true);
    }, 450);

    const doneTimer = setTimeout(() => {
      triggerFinish.current();
    }, 650);

    // Hard fallback timeout ensures splash screen NEVER stays stuck
    const safetyTimer = setTimeout(() => {
      triggerFinish.current();
    }, 1500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
      clearTimeout(safetyTimer);
    };
  }, []);

  const handleSkip = () => {
    setFade(true);
    triggerFinish.current();
  };

  return (
    <div
      id="loading-page"
      role="button"
      tabIndex={0}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000000',
        zIndex: 2147483647,
        opacity: fade ? 0 : 1,
        pointerEvents: fade ? 'none' : 'auto',
        transition: 'opacity 0.22s ease-out',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
        cursor: 'pointer',
      }}
      onClick={handleSkip}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleSkip();
      }}
      title="Click or tap to proceed"
    >
      <div
        className="splash-content"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          margin: 'auto',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '92px',
            height: '92px',
            borderRadius: '24px',
            background: '#090d16',
            border: '4px solid #00b0ff',
            boxShadow: '0 4px 24px rgba(0, 176, 255, 0.45), inset 0 0 12px rgba(0, 176, 255, 0.25)',
            padding: '7px',
            marginBottom: '16px',
            overflow: 'hidden',
          }}
        >
          <img
            src="/android_logo.png"
            alt="Android Logo"
            className="splash-logo"
            id="splashLogoIcon"
            style={{ width: '100%', height: '100%', borderRadius: '16px', objectFit: 'contain' }}
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        </div>
        <h1 className="splash-title">ANDROID</h1>
        <div className="modern-loader-unique"></div>
      </div>
    </div>
  );
};
