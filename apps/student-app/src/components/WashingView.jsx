import React, { useState, useEffect } from 'react';
import { WHO_STEPS_INFO } from '../../../../shared/services/stepModelService.js';

export function WashingView({
  activeStep = 1,
  confidence = 0.85,
  progress = 0,
  isHandsMoving = true,
  onStepComplete = null,
  onFinishWashing = null,
  onSkipStep = null,
  onJumpToStep = null
}) {
  const currentStepInfo = WHO_STEPS_INFO[activeStep] || WHO_STEPS_INFO[1];
  const recDuration = (currentStepInfo.recommendedDurationMs || 6000) / 1000;
  const onStepCompleteRef = React.useRef(onStepComplete);
  const onFinishWashingRef = React.useRef(onFinishWashing);
  const confidenceRef = React.useRef(confidence);
  const [mediaFailed, setMediaFailed] = useState(false);

  React.useEffect(() => {
    onStepCompleteRef.current = onStepComplete;
    onFinishWashingRef.current = onFinishWashing;
    confidenceRef.current = confidence;
  });

  // Synchronized Multimedia Guidance (Voice Assistant & Video Loop)
  React.useEffect(() => {
    setMediaFailed(false);
    
    // Voice Assistant (SpeechSynthesis API fallback/primary)
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Terminate previous audio streams
      const instructionText = currentStepInfo.instruction || currentStepInfo.name;
      const utterance = new SpeechSynthesisUtterance(`Step ${activeStep}: ${currentStepInfo.name}. ${instructionText}`);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      
      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('[WashingView] Voice assistant failed to play:', err);
      }
    }

    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [activeStep, currentStepInfo.name, currentStepInfo.instruction]);

  const progressPercent = Math.min(100, Math.max(0, progress));

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      justifyContent: 'space-between',
      gap: '16px'
    }}>
      {/* Multimedia Instruction Panel */}
      {!mediaFailed && (
        <div style={{ 
          width: '100%', height: '160px', background: '#000', borderRadius: '18px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <video 
            key={`vid-step-${activeStep}`}
            src={`/assets/step_${activeStep}.mp4`} 
            autoPlay 
            loop 
            muted 
            playsInline
            onError={() => {
              console.warn(`[WashingView] Graceful degradation: Video asset /assets/step_${activeStep}.mp4 not found.`);
              setMediaFailed(true);
            }}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', color: '#fff' }}>
            ▶ Live Demonstration
          </div>
        </div>
      )}

      {/* Active Step Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))',
        borderRadius: '18px',
        padding: '20px 24px',
        border: '1px solid rgba(59, 130, 246, 0.4)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              WHO Handwashing Standard
            </span>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: 800, color: '#ffffff' }}>
              Step {activeStep}: {currentStepInfo.name}
            </h2>
          </div>

          <div style={{
            background: isHandsMoving ? 'rgba(59, 130, 246, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: isHandsMoving ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '8px 16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: isHandsMoving ? '#60a5fa' : '#f87171' }}>
              {Math.round((progressPercent / 100) * recDuration)}s
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Target: {recDuration}s</div>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: isHandsMoving ? 'linear-gradient(90deg, #3b82f6, #34d399)' : '#ef4444',
            borderRadius: '4px',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Real-time Movement & Action Guidance Card */}
      <div style={{
        padding: '14px 18px',
        borderRadius: '14px',
        background: isHandsMoving
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)'
          : 'linear-gradient(135deg, rgba(239, 68, 68, 0.18) 0%, rgba(185, 28, 28, 0.18) 100%)',
        border: isHandsMoving ? '1px solid rgba(52, 211, 153, 0.5)' : '1px solid rgba(248, 113, 113, 0.5)',
        boxShadow: isHandsMoving ? '0 4px 15px rgba(16, 185, 129, 0.15)' : '0 4px 15px rgba(239, 68, 68, 0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '10px',
          background: isHandsMoving ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px'
        }}>
          {isHandsMoving ? (currentStepInfo.icon || '🧼') : '⚠️'}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isHandsMoving ? '#34d399' : '#f87171',
              boxShadow: isHandsMoving ? '0 0 10px #34d399' : '0 0 10px #f87171'
            }} />
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: isHandsMoving ? '#34d399' : '#f87171'
            }}>
              {isHandsMoving ? 'Active Hand Movement Detected' : 'Movement Paused · Hands Still'}
            </span>
          </div>

          <div style={{
            fontSize: '13px',
            fontWeight: 700,
            color: '#ffffff',
            marginTop: '3px',
            lineHeight: '1.4'
          }}>
            {isHandsMoving
              ? (currentStepInfo.instruction || `Perform Step ${activeStep}`)
              : 'Please bring your hands in front of the camera and rub them together to advance!'}
          </div>
        </div>

        <div style={{
          padding: '6px 12px',
          borderRadius: '8px',
          background: isHandsMoving ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          border: isHandsMoving ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(248, 113, 113, 0.3)',
          fontSize: '10px',
          fontWeight: 800,
          color: isHandsMoving ? '#34d399' : '#f87171',
          textTransform: 'uppercase'
        }}>
          {isHandsMoving ? 'Timer Active' : 'Timer Frozen'}
        </div>
      </div>

      {/* Grid of WHO 6 Steps */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {WHO_STEPS_INFO.slice(1).map((step) => {
          const isActive = step.id === activeStep;
          const isDone = step.id < activeStep;

          return (
            <div
              key={step.id}
              onClick={() => {
                if (onJumpToStep) onJumpToStep(step.id);
              }}
              style={{
                cursor: 'pointer',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(139, 92, 246, 0.25))'
                  : isDone
                  ? 'rgba(16, 185, 129, 0.1)'
                  : 'rgba(15, 23, 42, 0.4)',
                borderRadius: '14px',
                padding: '16px',
                border: isActive
                  ? '2px solid #3b82f6'
                  : isDone
                  ? '1px solid rgba(52, 211, 153, 0.4)'
                  : '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '90px',
                transition: 'all 0.2s ease',
                transform: isActive ? 'scale(1.02)' : 'none'
              }}
              title={`Click to jump to Step ${step.id}`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: isActive ? '#60a5fa' : isDone ? '#34d399' : '#94a3b8' }}>
                  STEP {step.id}
                </span>
                {isDone && <span style={{ fontSize: '12px', color: '#34d399' }}>✓ Done</span>}
                {isActive && <span style={{ fontSize: '10px', background: '#3b82f6', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>IN PROGRESS</span>}
              </div>

              <span style={{ fontSize: '13px', fontWeight: 600, color: isActive || isDone ? '#ffffff' : '#64748b', marginTop: '6px' }}>
                {step.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Autonomous AI Touchless Status Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30, 41, 59, 0.4)', padding: '12px 20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 10px #34d399' }} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0' }}>
            Touchless AI Vision Active · Follow WHO Step Guidance
          </span>
        </div>

        {/* Demo Skip / Finish Button */}
        <button
          id="skip-or-finish-step-btn"
          onClick={() => {
            if (activeStep >= 6) {
              if (onStepComplete) {
                onStepComplete({
                  stepNumber: 6,
                  durationMs: recDuration * 1000,
                  avgConfidence: confidence || 0.95,
                  completed: true
                });
              }
              if (onFinishWashing) onFinishWashing();
            } else {
              if (onSkipStep) {
                onSkipStep();
              }
            }
          }}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: activeStep >= 6 ? 'none' : '1px solid rgba(59, 130, 246, 0.4)',
            background: activeStep >= 6 ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(59, 130, 246, 0.15)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title={activeStep >= 6 ? "Finish Washing & View Score" : "Skip to next step"}
        >
          {activeStep >= 6 ? 'Complete & Score ➔' : 'Skip Step ➔'}
        </button>
      </div>
    </div>
  );
}
