import React, { useEffect, useState } from 'react';

export function FeedbackView({
  score = 95,
  student = null,
  completedSteps = [],
  onReset = null
}) {
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onReset) onReset();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onReset]);

  const isExcellent = score >= 85;
  const isGood = score >= 70 && score < 85;

  const scoreColor = isExcellent ? '#34d399' : isGood ? '#60a5fa' : '#f59e0b';
  const encourageMessage = isExcellent
    ? 'Outstanding Handwashing Compliance!'
    : isGood
    ? 'Good Technique! Keep It Up!'
    : 'Practice Steps to Improve Technique';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: '24px',
      textAlign: 'center',
      padding: '20px'
    }}>
      {/* Score Dial Badge */}
      <div style={{
        width: '140px',
        height: '140px',
        borderRadius: '50%',
        background: `conic-gradient(${scoreColor} ${score}%, rgba(255, 255, 255, 0.1) 0)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 0 40px ${scoreColor}40`
      }}>
        <div style={{
          width: '116px',
          height: '116px',
          borderRadius: '50%',
          background: '#0f172a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: '36px', fontWeight: 800, color: scoreColor, lineHeight: '1' }}>
            {score}
          </span>
          <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginTop: '2px' }}>
            Score / 100
          </span>
        </div>
      </div>

      {/* Encouragement Banner */}
      <div>
        <h2 style={{ margin: '0 0 6px 0', fontSize: '26px', fontWeight: 800, color: '#ffffff' }}>
          {student ? `Great Job, ${student.name}!` : 'Handwash Complete!'}
        </h2>
        <p style={{ margin: 0, fontSize: '15px', color: scoreColor, fontWeight: 700 }}>
          {encourageMessage}
        </p>
      </div>

      {/* Summary Chips */}
      <div style={{
        display: 'flex',
        gap: '12px',
        background: 'rgba(15, 23, 42, 0.6)',
        padding: '12px 20px',
        borderRadius: '14px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#34d399' }}>
            {completedSteps.length} / 6
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Steps Tracked</div>
        </div>
        <div style={{ width: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#60a5fa' }}>
            +50 pts
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Streak Bonus</div>
        </div>
      </div>

      {/* Auto Reset Footer */}
      <div style={{ marginTop: '12px' }}>
        <button
          onClick={onReset}
          style={{
            padding: '10px 24px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: 'rgba(30, 41, 59, 0.8)',
            color: '#cbd5e1',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Reset for Next Student ({countdown}s)
        </button>
      </div>
    </div>
  );
}
