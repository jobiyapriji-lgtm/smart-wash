import React from 'react';

/**
 * StudentLeaderboard Component
 * Renders ranked student compliance table sorted by handwashing score and streak.
 */
export function StudentLeaderboard({ students = [] }) {
  const defaultStudents = [
    { studentId: 'STU_101', name: 'Jesty K.', score: 98, streak: 7, grade: 'Excellent' },
    { studentId: 'STU_102', name: 'Jobiya P.', score: 95, streak: 5, grade: 'Excellent' },
    { studentId: 'STU_103', name: 'Joel T.', score: 91, streak: 4, grade: 'Excellent' },
    { studentId: 'STU_104', name: 'Rahul M.', score: 88, streak: 3, grade: 'Good' },
    { studentId: 'STU_105', name: 'Ananya S.', score: 82, streak: 2, grade: 'Good' }
  ];

  const leaderboardData = (students.length > 0 ? students : defaultStudents)
    .slice()
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div style={{
      background: 'rgba(30, 41, 59, 0.4)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#ffffff' }}>Student Compliance Leaderboard</h3>
          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>Ranked by Handwashing Score & Streak</p>
        </div>
        <span style={{ fontSize: '12px', color: '#fbbf24', background: 'rgba(251, 191, 36, 0.15)', padding: '4px 12px', borderRadius: '20px', fontWeight: 700 }}>
          🏆 Top Performers
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {leaderboardData.map((st, index) => {
          const rank = index + 1;
          const badgeColor = rank === 1 ? '#fbbf24' : rank === 2 ? '#94a3b8' : rank === 3 ? '#cd7f32' : '#64748b';

          return (
            <div
              key={st.studentId}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '12px',
                border: rank === 1 ? '1px solid rgba(251, 191, 36, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '16px', fontWeight: 800, color: badgeColor, width: '24px', textAlign: 'center' }}>
                  #{rank}
                </span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>{st.name}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>ID: {st.studentId}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 700 }}>🔥 {st.streak} Streak</span>
                </div>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                  fontWeight: 800,
                  color: '#34d399',
                  fontSize: '15px'
                }}>
                  {st.score} <span style={{ fontSize: '10px', color: '#94a3b8' }}>/ 100</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
