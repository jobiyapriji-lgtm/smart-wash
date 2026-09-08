import React, { useState } from 'react';
import { FaceEnrollmentDemo } from '../shared/components/FaceEnrollmentDemo.jsx';
import { useStepRecognition } from '../shared/hooks/useStepRecognition.js';
import { WHO_STEPS_INFO } from '../shared/services/stepModelService.js';
import { StudentKioskApp } from '../apps/student-app/src/StudentKioskApp.jsx';
import { TeacherDashboardApp } from '../apps/teacher-dashboard/src/TeacherDashboardApp.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('kiosk_app'); // 'kiosk_app' | 'ml_jobiya' | 'face_jesty' | 'teacher_dashboard'

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0b0f19 0%, #111827 50%, #0f172a 100%)', color: '#f3f4f6' }}>
      {/* Top Header */}
      <header style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
          }}>
            🧼
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #34d399, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              SMART WASH
            </h1>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
              Autonomous AI Handwashing Kiosk Workbench
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', background: 'rgba(31, 41, 55, 0.6)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button
            onClick={() => setActiveTab('kiosk_app')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              transition: 'all 0.2s ease',
              background: activeTab === 'kiosk_app' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
              color: activeTab === 'kiosk_app' ? '#ffffff' : '#9ca3af',
              boxShadow: activeTab === 'kiosk_app' ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none'
            }}
          >
            📱 Joel: Student Kiosk App
          </button>
          <button
            onClick={() => setActiveTab('ml_jobiya')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              transition: 'all 0.2s ease',
              background: activeTab === 'ml_jobiya' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'transparent',
              color: activeTab === 'ml_jobiya' ? '#ffffff' : '#9ca3af',
              boxShadow: activeTab === 'ml_jobiya' ? '0 2px 8px rgba(59, 130, 246, 0.3)' : 'none'
            }}
          >
            🧠 Jobiya: ML Hand Tracking
          </button>
          <button
            onClick={() => setActiveTab('face_jesty')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              transition: 'all 0.2s ease',
              background: activeTab === 'face_jesty' ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'transparent',
              color: activeTab === 'face_jesty' ? '#ffffff' : '#9ca3af',
              boxShadow: activeTab === 'face_jesty' ? '0 2px 8px rgba(139, 92, 246, 0.3)' : 'none'
            }}
          >
            🔐 Jesty: Face ID & Backend
          </button>
          <button
            onClick={() => setActiveTab('teacher_dashboard')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              transition: 'all 0.2s ease',
              background: activeTab === 'teacher_dashboard' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'transparent',
              color: activeTab === 'teacher_dashboard' ? '#ffffff' : '#9ca3af',
              boxShadow: activeTab === 'teacher_dashboard' ? '0 2px 8px rgba(245, 158, 11, 0.3)' : 'none'
            }}
          >
            📊 Rahul: Teacher Dashboard
          </button>
        </nav>
      </header>

      {/* Main Workbench Body */}
      <main style={{ maxWidth: (activeTab === 'kiosk_app' || activeTab === 'teacher_dashboard') ? '100%' : '1280px', margin: '0 auto', padding: (activeTab === 'kiosk_app' || activeTab === 'teacher_dashboard') ? 0 : '32px 24px' }}>
        {activeTab === 'kiosk_app' && <StudentKioskApp useMock={true} />}
        {activeTab === 'ml_jobiya' && <JobiyaMLWorkbench />}
        {activeTab === 'face_jesty' && <FaceEnrollmentDemo />}
        {activeTab === 'teacher_dashboard' && <TeacherDashboardApp />}
      </main>
    </div>
  );
}



function JobiyaMLWorkbench() {
  const [useMock, setUseMock] = useState(true);
  const [isTrackerActive, setIsTrackerActive] = useState(false);
  const [completedStepsLog, setCompletedStepsLog] = useState([]);

  const handleStepCompleted = (event) => {
    setCompletedStepsLog(prev => [event, ...prev.slice(0, 4)]);
  };

  const {
    activeStep,
    stepName,
    confidence,
    isProcessing,
    resetTracker,
    stepsInfo
  } = useStepRecognition({
    enabled: isTrackerActive,
    useMock,
    confidenceThreshold: 0.60,
    onStepCompleted: handleStepCompleted
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Module Overview Banner */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Jobiya's Module Architecture
          </span>
          <h2 style={{ margin: '4px 0 8px 0', fontSize: '24px' }}>
            MediaPipe Hand Landmarks & Keras/TF.js WHO Step Classifier
          </h2>
          <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px', maxWidth: '750px' }}>
            Extracts 21 3D hand landmarks, normalizes coordinates relative to wrist & hand scale, feeds 30-frame sequence vectors into the LSTM model, and applies sliding-window Majority Voting smoothing.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', background: 'rgba(15, 23, 42, 0.6)', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={useMock}
              onChange={(e) => setUseMock(e.target.checked)}
            />
            Offline Mock Predictor Mode
          </label>

          <button
            onClick={() => {
              if (isTrackerActive) {
                setIsTrackerActive(false);
              } else {
                resetTracker();
                setIsTrackerActive(true);
              }
            }}
            style={{
              padding: '12px 24px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '14px',
              background: isTrackerActive ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: '#ffffff',
              boxShadow: isTrackerActive ? '0 4px 14px rgba(239, 68, 68, 0.4)' : '0 4px 14px rgba(59, 130, 246, 0.4)',
              transition: 'all 0.2s ease'
            }}
          >
            {isTrackerActive ? '⏹ Stop Recognition' : '▶ Start Step Tracking'}
          </button>
        </div>
      </div>

      {/* Main Grid Display */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        {/* Active Step Visualizer */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.4)',
          borderRadius: '16px',
          padding: '28px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>Real-Time WHO Step Recognition Monitor</h3>
            <span style={{
              fontSize: '12px',
              padding: '4px 12px',
              borderRadius: '20px',
              fontWeight: 600,
              background: isTrackerActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(156, 163, 175, 0.15)',
              color: isTrackerActive ? '#34d399' : '#9ca3af',
              border: isTrackerActive ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(156, 163, 175, 0.2)'
            }}>
              {isTrackerActive ? '● Model Active & Inferring' : '○ Tracker Paused'}
            </span>
          </div>

          {/* Big Active Step Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.6))',
            borderRadius: '14px',
            padding: '32px',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
          }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#93c5fd', textTransform: 'uppercase' }}>
                Detected WHO Step
              </span>
              <h2 style={{ margin: '8px 0 4px 0', fontSize: '32px', color: '#ffffff' }}>
                Step {activeStep}: {stepName}
              </h2>
              <p style={{ margin: 0, fontSize: '14px', color: '#9ca3af' }}>
                Recommended step duration: {WHO_STEPS_INFO[activeStep]?.recommendedDurationMs / 1000 || 6}s
              </p>
            </div>

            {/* Confidence Radial Score */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                background: `conic-gradient(#3b82f6 ${confidence * 100}%, rgba(255, 255, 255, 0.08) 0)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)'
              }}>
                <div style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '50%',
                  background: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#60a5fa' }}>
                    {Math.round(confidence * 100)}%
                  </span>
                  <span style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase' }}>Confidence</span>
                </div>
              </div>
            </div>
          </div>

          {/* WHO Steps 1 to 6 Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '8px' }}>
            {stepsInfo.slice(1).map((step) => {
              const isCurrent = activeStep === step.id;
              return (
                <div
                  key={step.id}
                  style={{
                    background: isCurrent ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))' : 'rgba(15, 23, 42, 0.4)',
                    borderRadius: '10px',
                    padding: '14px',
                    border: isCurrent ? '1.5px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: isCurrent ? '#60a5fa' : '#9ca3af' }}>
                      Step {step.id}
                    </span>
                    {isCurrent && <span style={{ fontSize: '10px', background: '#3b82f6', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>ACTIVE</span>}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: isCurrent ? '#ffffff' : '#d1d5db', lineHeight: '1.3' }}>
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Pipeline Telemetry & Events */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Telemetry Card */}
          <div style={{ background: 'rgba(30, 41, 59, 0.4)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h4 style={{ margin: '0 0 14px 0', fontSize: '15px', color: '#f3f4f6' }}>Model Pipeline Telemetry</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                <span style={{ color: '#9ca3af' }}>Sequence Buffer:</span>
                <span style={{ fontWeight: 600, color: '#60a5fa' }}>30 frames (63 features)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                <span style={{ color: '#9ca3af' }}>Majority Window N:</span>
                <span style={{ fontWeight: 600, color: '#c084fc' }}>15 frames</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                <span style={{ color: '#9ca3af' }}>Confidence Cutoff:</span>
                <span style={{ fontWeight: 600, color: '#34d399' }}>60%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Model Format:</span>
                <span style={{ fontWeight: 600, color: '#f43f5e' }}>TF.js Layers Model</span>
              </div>
            </div>
          </div>

          {/* Event Log */}
          <div style={{ background: 'rgba(30, 41, 59, 0.4)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255, 255, 255, 0.08)', flex: 1 }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#f3f4f6' }}>Completed Step Events</h4>
            {completedStepsLog.length === 0 ? (
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
                Start tracking to log completed WHO steps...
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {completedStepsLog.map((log, idx) => (
                  <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', borderLeft: '3px solid #34d399' }}>
                    <div style={{ fontWeight: 700, color: '#34d399' }}>Step {log.stepNumber} Confirmed</div>
                    <div style={{ color: '#9ca3af' }}>{log.stepName}</div>
                    <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
                      {new Date(log.timestamp).toLocaleTimeString()} · {Math.round(log.confidence * 100)}% conf
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KioskAppFlowDemo() {
  const [kioskState, setKioskState] = useState('idle'); // idle | identifying | washing | scoring | feedback

  return (
    <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '16px', padding: '32px', border: '1px solid rgba(255, 255, 255, 0.08)', minHeight: '500px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>
          Joel's Module Preview
        </span>
        <h2 style={{ margin: '4px 0 8px 0', fontSize: '24px' }}>
          Student Kiosk App Full-Screen State Machine
        </h2>
        <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
          Simulate the full state flow: Idle ➔ Face Identification (Jesty) ➔ Handwashing & ML Tracking (Jobiya) ➔ Scoring & Audio Feedback (Rahul).
        </p>
      </div>

      {/* State Buttons */}
      <div style={{ display: 'flex', gap: '10px', background: 'rgba(15, 23, 42, 0.6)', padding: '6px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        {['idle', 'identifying', 'washing', 'scoring', 'feedback'].map((st) => (
          <button
            key={st}
            onClick={() => setKioskState(st)}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              textTransform: 'capitalize',
              background: kioskState === st ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
              color: kioskState === st ? '#ffffff' : '#9ca3af',
              transition: 'all 0.2s ease'
            }}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Screen Placeholder */}
      <div style={{
        flex: 1,
        borderRadius: '14px',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
        padding: '48px',
        textAlign: 'center',
        minHeight: '300px'
      }}>
        {kioskState === 'idle' && (
          <>
            <div style={{ fontSize: '48px' }}>👋</div>
            <h2 style={{ margin: 0, fontSize: '28px', color: '#ffffff' }}>Step Up to Wash Your Hands</h2>
            <p style={{ margin: 0, color: '#9ca3af', maxWidth: '450px' }}>
              Stand in front of the kiosk camera to automatically identify yourself and start your handwashing compliance session.
            </p>
          </>
        )}

        {kioskState === 'identifying' && (
          <>
            <div style={{ fontSize: '48px' }}>🔍</div>
            <h2 style={{ margin: 0, fontSize: '28px', color: '#8b5cf6' }}>Scanning Student Face ID...</h2>
            <p style={{ margin: 0, color: '#9ca3af', maxWidth: '450px' }}>
              Jesty's `useFaceRecognition()` hook is searching for enrolled face descriptors in Firestore...
            </p>
          </>
        )}

        {kioskState === 'washing' && (
          <>
            <div style={{ fontSize: '48px' }}>🧼</div>
            <h2 style={{ margin: 0, fontSize: '28px', color: '#60a5fa' }}>Tracking WHO Handwash Steps</h2>
            <p style={{ margin: 0, color: '#9ca3af', maxWidth: '450px' }}>
              Jobiya's `useStepRecognition()` ML model is running landmark inference and majority voting live...
            </p>
          </>
        )}

        {kioskState === 'scoring' && (
          <>
            <div style={{ fontSize: '48px' }}>⚡</div>
            <h2 style={{ margin: 0, fontSize: '28px', color: '#fbbf24' }}>Calculating Compliance Score</h2>
            <p style={{ margin: 0, color: '#9ca3af', maxWidth: '450px' }}>
              Rahul's scoring formula is evaluating step duration, completeness, and model confidence...
            </p>
          </>
        )}

        {kioskState === 'feedback' && (
          <>
            <div style={{ fontSize: '48px' }}>🌟</div>
            <h2 style={{ margin: 0, fontSize: '28px', color: '#34d399' }}>Great Job! Score: 95 / 100</h2>
            <p style={{ margin: 0, color: '#9ca3af', maxWidth: '450px' }}>
              Session written to Firestore `sessions` collection. Audio praise playing in local language clip!
            </p>
          </>
        )}
      </div>
    </div>
  );
}
