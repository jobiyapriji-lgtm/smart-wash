import React, { useState } from 'react';
import { StudentKioskApp } from '../apps/student-app/src/StudentKioskApp.jsx';
import { TeacherDashboardApp } from '../apps/teacher-dashboard/src/TeacherDashboardApp.jsx';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[SMART WASH ErrorBoundary caught error]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          textAlign: 'center',
          color: '#f8fafc'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛡️</div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 8px 0', color: '#f87171' }}>
            Kiosk Vision Recovered
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '440px', marginBottom: '16px' }}>
            The AI engine encountered a temporary video frame glitch. Click below to restart your session smoothly.
          </p>
          {this.state.error && (
            <div style={{ padding: '8px 16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '8px', color: '#fca5a5', fontSize: '12px', marginBottom: '20px', fontFamily: 'monospace' }}>
              {this.state.error.message || String(this.state.error)}
            </div>
          )}
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            style={{
              padding: '12px 28px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Restart Kiosk ➔
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [currentMode, setCurrentMode] = useState('kiosk'); // 'kiosk' | 'teacher'

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0b0f19 0%, #111827 50%, #0f172a 100%)', color: '#f3f4f6' }}>
      {/* Top Header */}
      <header style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '12px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
          }}>
            🧼
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #34d399, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              SMART WASH
            </h1>
            <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>
              Autonomous AI Handwashing Kiosk System
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <nav style={{ display: 'flex', background: 'rgba(31, 41, 55, 0.6)', padding: '3px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button
            onClick={() => setCurrentMode('kiosk')}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              transition: 'all 0.2s ease',
              background: currentMode === 'kiosk' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
              color: currentMode === 'kiosk' ? '#ffffff' : '#94a3b8',
              boxShadow: currentMode === 'kiosk' ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none'
            }}
          >
            🧼 Student Kiosk
          </button>
          <button
            onClick={() => setCurrentMode('teacher')}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              transition: 'all 0.2s ease',
              background: currentMode === 'teacher' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'transparent',
              color: currentMode === 'teacher' ? '#ffffff' : '#94a3af',
              boxShadow: currentMode === 'teacher' ? '0 2px 8px rgba(245, 158, 11, 0.3)' : 'none'
            }}
          >
            📊 Teacher Portal
          </button>
        </nav>
      </header>

      {/* Main View Area with Error Boundary Protection */}
      <main>
        <ErrorBoundary>
          {currentMode === 'kiosk' && <StudentKioskApp useMock={true} />}
          {currentMode === 'teacher' && <TeacherDashboardApp />}
        </ErrorBoundary>
      </main>
    </div>
  );
}
