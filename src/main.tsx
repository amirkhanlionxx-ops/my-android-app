import React, { StrictMode, Component, ReactNode, ErrorInfo } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class RootErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('RootErrorBoundary caught error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      window.localStorage.removeItem('android_ide_active_project_id');
    } catch {}
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000000',
            color: '#ffffff',
            padding: '24px',
            textAlign: 'center',
            zIndex: 999999999,
          }}
        >
          <div
            style={{
              width: '74px',
              height: '74px',
              borderRadius: '20px',
              background: '#090d16',
              border: '4px solid #00b0ff',
              boxShadow: '0 4px 20px rgba(0, 176, 255, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <img
              src="/android_logo.png"
              alt="Android Logo"
              style={{ width: '85%', height: '85%', objectFit: 'contain' }}
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <h2 style={{ color: '#3DDC84', fontSize: '20px', margin: '0 0 8px', letterSpacing: '0.5px' }}>
            ANDROID IDE
          </h2>
          <p style={{ color: '#8e8e93', fontSize: '14px', maxWidth: '360px', margin: '0 0 20px' }}>
            অ্যাপ্লিকেশনের লোডিং সম্পন্ন হতে সমস্যা হচ্ছিল। নিচের বাটনে ক্লিক করে পুনরায় চালু করুন।
          </p>
          <button
            onClick={this.handleReset}
            style={{
              background: '#00b0ff',
              color: '#000000',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '15px',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 176, 255, 0.4)',
            }}
          >
            রিলোড ও চালু করুন
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = createRoot(rootEl);
  root.render(
    <StrictMode>
      <RootErrorBoundary>
        <App />
      </RootErrorBoundary>
    </StrictMode>,
  );
}
