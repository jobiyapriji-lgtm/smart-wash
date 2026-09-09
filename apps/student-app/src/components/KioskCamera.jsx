import React, { useEffect, useRef } from 'react';

/**
 * KioskCamera Component
 * Renders webcam video feed with face ID bounding boxes and hand landmark graphics.
 */
export function KioskCamera({
  videoRef,
  state = 'idle',
  activeStep = 0,
  confidence = 0,
  student = null
}) {
  const localVideoRef = useRef(null);
  const targetVideoRef = videoRef || localVideoRef;

  useEffect(() => {
    let stream = null;

    async function initCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720, facingMode: 'user' }
          });
          if (targetVideoRef.current) {
            targetVideoRef.current.srcObject = stream;
          }
        }
      } catch (err) {
        console.warn("[KioskCamera] Camera access denied or not available; using simulated feed.", err);
      }
    }

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [targetVideoRef]);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      borderRadius: '20px',
      overflow: 'hidden',
      background: '#090d16',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
    }}>
      <video
        ref={targetVideoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'scaleX(-1)' // Mirror view for natural kiosk feedback
        }}
      />

      {/* Simulated Live View Overlay Graphic */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px'
      }}>
        {/* Top Camera Status Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(10px)',
            padding: '6px 14px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: state === 'washing' ? '#60a5fa' : state === 'identifying' ? '#c084fc' : '#34d399',
              boxShadow: '0 0 10px currentColor'
            }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0' }}>
              AI Kiosk Vision Engine
            </span>
          </div>

          {state === 'identifying' && (
            <div style={{
              background: 'rgba(139, 92, 246, 0.25)',
              border: '1px solid #8b5cf6',
              color: '#d8b4fe',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700
            }}>
              Scanning Face ID...
            </div>
          )}
        </div>

        {/* Center Face ID / Landmark Bounding Box Overlay */}
        {state === 'identifying' && (
          <div style={{
            alignSelf: 'center',
            width: '240px',
            height: '280px',
            borderRadius: '120px',
            border: '3px dashed #a855f7',
            animation: 'pulse 1.5s infinite ease-in-out',
            boxShadow: '0 0 30px rgba(168, 85, 247, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <span style={{ fontSize: '13px', color: '#e9d5ff', fontWeight: 700, background: 'rgba(15,23,42,0.8)', padding: '4px 12px', borderRadius: '12px' }}>
              Position Face in Frame
            </span>
          </div>
        )}

        {state === 'washing' && (
          <div style={{
            alignSelf: 'center',
            width: '300px',
            height: '200px',
            borderRadius: '20px',
            border: '2px solid #3b82f6',
            background: 'rgba(59, 130, 246, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            backdropFilter: 'blur(2px)'
          }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '18px' }}>✋</span>
              <span style={{ fontSize: '18px' }}>🤚</span>
            </div>
            <span style={{ fontSize: '13px', color: '#93c5fd', fontWeight: 700 }}>
              Tracking Hand Landmarks (21 points)
            </span>
            <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
              Step {activeStep} · {Math.round(confidence * 100)}% confidence
            </span>
          </div>
        )}

        {/* Bottom Student Recognition Tag */}
        {student && (
          <div style={{
            alignSelf: 'flex-start',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(12px)',
            padding: '8px 16px',
            borderRadius: '12px',
            border: '1px solid rgba(52, 211, 153, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: '14px' }}>
              {student.name ? student.name[0] : 'S'}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>{student.name}</div>
              <div style={{ fontSize: '10px', color: '#34d399' }}>Student ID: {student.studentId}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
