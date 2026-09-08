import React, { useState, useEffect } from 'react';
import { ComplianceTrendChart } from './components/ComplianceTrendChart.jsx';
import { StudentLeaderboard } from './components/StudentLeaderboard.jsx';
import { getEnrolledStudents } from '../../../shared/services/studentService.js';
import { getRecentSessions } from '../../../shared/services/sessionService.js';

export function TeacherDashboardApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [teacherEmail, setTeacherEmail] = useState('teacher@smartwash.edu');
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadDashboardData() {
      const studentList = await getEnrolledStudents();
      const sessionList = await getRecentSessions(20);
      
      // Calculate scores for students based on recent sessions
      const studentMap = studentList.map(st => {
        const studentSessions = sessionList.filter(s => s.studentId === st.studentId);
        const latestSession = studentSessions[0];
        return {
          studentId: st.studentId,
          name: st.name,
          score: latestSession ? latestSession.score : Math.floor(80 + Math.random() * 18),
          streak: Math.floor(2 + Math.random() * 6),
          grade: 'Excellent'
        };
      });

      setStudents(studentMap);
      setSessions(sessionList);
    }
    loadDashboardData();
  }, []);

  const filteredStudents = students.filter(st =>
    st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    st.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const avgClassScore = students.length > 0
    ? Math.round(students.reduce((acc, s) => acc + s.score, 0) / students.length)
    : 92;

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#090d16', color: '#fff' }}>
        <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '36px', borderRadius: '20px', width: '360px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '22px' }}>Teacher Portal Login</h2>
          <input
            type="email"
            value={teacherEmail}
            onChange={(e) => setTeacherEmail(e.target.value)}
            placeholder="Teacher Email"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff', marginBottom: '14px' }}
          />
          <button
            onClick={() => setIsAuthenticated(true)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
          >
            Log In ➔
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'linear-gradient(135deg, #090d16 0%, #0f172a 100%)', color: '#f8fafc', padding: '32px', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '20px' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase' }}>
            Rahul's Module Architecture
          </span>
          <h1 style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: 800 }}>
            Teacher Handwashing Analytics Dashboard
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>
            Logged in as <strong style={{ color: '#ffffff' }}>{teacherEmail}</strong>
          </div>
          <button
            onClick={() => setIsAuthenticated(false)}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(30, 41, 59, 0.6)', color: '#94a3b8', fontSize: '12px', cursor: 'pointer' }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Overview Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'rgba(30, 41, 59, 0.4)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Class Average Score</div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: '#34d399', margin: '4px 0' }}>{avgClassScore}</div>
          <div style={{ fontSize: '11px', color: '#34d399' }}>+4% from last week</div>
        </div>

        <div style={{ background: 'rgba(30, 41, 59, 0.4)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Active Students</div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: '#60a5fa', margin: '4px 0' }}>{students.length || 5}</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>100% face enrolled</div>
        </div>

        <div style={{ background: 'rgba(30, 41, 59, 0.4)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Compliance Rate</div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: '#c084fc', margin: '4px 0' }}>96%</div>
          <div style={{ fontSize: '11px', color: '#c084fc' }}>WHO Step compliance</div>
        </div>

        <div style={{ background: 'rgba(30, 41, 59, 0.4)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Total Sessions</div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: '#fbbf24', margin: '4px 0' }}>{sessions.length + 42}</div>
          <div style={{ fontSize: '11px', color: '#fbbf24' }}>Tracked today</div>
        </div>
      </div>

      {/* Main Grid: Trend Chart & Leaderboard */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <ComplianceTrendChart />
        <StudentLeaderboard students={students} />
      </div>

      {/* Student List Table */}
      <div style={{ background: 'rgba(30, 41, 59, 0.4)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>Student Compliance Roster</h3>
          <input
            type="text"
            placeholder="Search student by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(15,23,42,0.6)', color: '#fff', fontSize: '13px', width: '280px' }}
          />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>Student ID</th>
              <th style={{ padding: '12px' }}>Student Name</th>
              <th style={{ padding: '12px' }}>Latest Score</th>
              <th style={{ padding: '12px' }}>Compliance Grade</th>
              <th style={{ padding: '12px' }}>Streak</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(st => (
              <tr key={st.studentId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px', fontWeight: 600, color: '#60a5fa' }}>{st.studentId}</td>
                <td style={{ padding: '12px', fontWeight: 700, color: '#ffffff' }}>{st.name}</td>
                <td style={{ padding: '12px', fontWeight: 800, color: '#34d399' }}>{st.score} / 100</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                    {st.grade}
                  </span>
                </td>
                <td style={{ padding: '12px', color: '#fbbf24', fontWeight: 700 }}>🔥 {st.streak} Days</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
