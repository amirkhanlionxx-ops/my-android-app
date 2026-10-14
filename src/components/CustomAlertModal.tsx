import React from 'react';
import { isStandaloneApkEnv, triggerDirectUrlDownload } from '../utils/appCompiler';

interface CustomAlertModalProps {
  title?: string;
  message: string;
  downloadUrl?: string | null;
  downloadFileName?: string | null;
  onClose: () => void;
}

export const CustomAlertModal: React.FC<CustomAlertModalProps> = ({
  title = 'Alert',
  message,
  downloadUrl,
  downloadFileName,
  onClose,
}) => {
  const [queuedClick, setQueuedClick] = React.useState(false);
  const onCloseRef = React.useRef(onClose);
  React.useEffect(() => {
    onCloseRef.current = onClose;
  });

  React.useEffect(() => {
    if (queuedClick && downloadUrl) {
      setQueuedClick(false);
      triggerDirectUrlDownload(downloadUrl, downloadFileName || 'app-release.apk');
      const timer = setTimeout(() => {
        onCloseRef.current();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [queuedClick, downloadUrl, downloadFileName]);

  if (message === 'LOADING_DOWNLOAD' && !downloadUrl) {
    return (
      <div id="custom-alert-modal" className="modal-view" onClick={onClose}>
        <div
          className="custom-alert-card"
          style={{ padding: '18px', maxWidth: '280px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setQueuedClick(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              padding: '14px 18px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '16px',
              letterSpacing: '0.8px',
              boxShadow: '0 6px 18px rgba(34, 197, 94, 0.4)',
            }}
          >
            <i className="fas fa-spinner fa-spin"></i>
            <span>DOWNLOAD</span>
          </button>
        </div>
      </div>
    );
  }

  if (downloadUrl) {
    const isApkWebView = isStandaloneApkEnv();
    const isBlobOrData = downloadUrl.startsWith('blob:') || downloadUrl.startsWith('data:');
    const fileName = downloadFileName || (downloadUrl.toLowerCase().includes('.zip') ? 'project_source.zip' : 'app-release.apk');
    const isZip = fileName.toLowerCase().endsWith('.zip');
    const isApk = fileName.toLowerCase().endsWith('.apk');

    return (
      <div id="custom-alert-modal" className="modal-view" onClick={onClose}>
        <div
          className="custom-alert-card"
          style={{
            padding: '24px 20px',
            maxWidth: '320px',
            textAlign: 'center',
            background: 'rgba(18, 20, 32, 0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            borderRadius: '24px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.75), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* File Icon & Name Header */}
          <div style={{ marginBottom: '18px' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '18px',
                background: isZip ? 'rgba(56, 189, 248, 0.12)' : 'rgba(61, 220, 132, 0.12)',
                border: isZip ? '1.5px solid rgba(56, 189, 248, 0.4)' : '1.5px solid rgba(61, 220, 132, 0.4)',
                color: isZip ? '#38bdf8' : '#3DDC84',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '26px',
                margin: '0 auto 12px auto',
                boxShadow: isZip ? '0 0 20px rgba(56, 189, 248, 0.25)' : '0 0 20px rgba(61, 220, 132, 0.25)',
              }}
            >
              <i className={isZip ? 'fas fa-file-zipper' : isApk ? 'fab fa-android' : 'fas fa-download'}></i>
            </div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.5px' }}>
              {isZip ? 'Download ZIP Package' : isApk ? 'Download Android APK' : 'Download File'}
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', wordBreak: 'break-all', fontFamily: 'monospace' }}>
              {fileName}
            </p>
          </div>

          {/* Premium Glass Download Action Button */}
          <a
            href={downloadUrl}
            {...(!isApkWebView || isBlobOrData ? { download: fileName } : {})}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              padding: '14px 18px',
              borderRadius: '14px',
              background: isZip
                ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(14, 165, 233, 0.12) 100%)'
                : 'linear-gradient(135deg, rgba(61, 220, 132, 0.25) 0%, rgba(34, 197, 94, 0.12) 100%)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: isZip ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid rgba(61, 220, 132, 0.5)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '15px',
              letterSpacing: '0.8px',
              textDecoration: 'none',
              boxShadow: isZip
                ? '0 8px 24px rgba(56, 189, 248, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.3)'
                : '0 8px 24px rgba(61, 220, 132, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
              cursor: 'pointer',
              marginBottom: '10px',
              transition: 'all 0.2s ease',
            }}
            onClick={(e) => {
              if (isApkWebView && (downloadUrl.startsWith('http://') || downloadUrl.startsWith('https://'))) {
                e.preventDefault();
                triggerDirectUrlDownload(downloadUrl, fileName);
              }
              setTimeout(onClose, 500);
            }}
          >
            <i className="fas fa-download"></i>
            <span>START DOWNLOAD</span>
          </a>

          {/* Premium Glass Cancel Button */}
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#94a3b8',
              borderRadius: '12px',
              padding: '9px 16px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.15s ease',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="custom-alert-modal" className="modal-view" onClick={onClose}>
      <div className="custom-alert-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="alert-title">{title}</h3>
        <p className="alert-msg" id="customAlertMsg">
          {message}
        </p>
        <button id="btn-close-alert" onClick={onClose} className="alert-ok-btn">
          OK
        </button>
      </div>
    </div>
  );
};
