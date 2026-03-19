import React, { useState } from 'react';

const MOCK_POSTS = [
  { id: '1', content: 'Morning AUCA 😄', type: 'post', timestamp: 'Mar 9 at 10:52 AM', reactions: { '😄': 1 }, commentCount: 0 },
  { id: '2', content: 'link ya course registration: https://registration-42io.onrender.com/', type: 'post', timestamp: 'Mar 2 at 5:55 PM', reactions: { '👍': 1 }, commentCount: 0 },
];

const TABS = ['Posts', 'Announcements', 'About'];

const EditIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const BriefcaseIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
  </svg>
);

export default function Profile() {
  const [activeTab,  setActiveTab]  = useState('Posts');
  const [isEditing,  setIsEditing]  = useState(false);
  const [bio,        setBio]        = useState('Accountant at AUCA Finance Department. Passionate about numbers and community 📊');

  const stats = [
    { label: 'Posts',     value: '12' },
    { label: 'Reactions', value: '48' },
    { label: 'Comments',  value: '23' },
  ];

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', fontFamily: "'Nunito', sans-serif" }}>

      {/* ── Profile card ── */}
      <div style={{
        background: '#fff', borderRadius: '16px', overflow: 'hidden',
        border: '1px solid #e2e8f0', marginBottom: '16px',
        boxShadow: '0 2px 12px rgba(13,59,142,0.07)',
      }}>
        {/* Cover */}
        <div style={{
          height: '100px',
          background: 'linear-gradient(135deg, #0d3b8e 0%, #1a4fa8 50%, #f0a500 100%)',
          position: 'relative',
        }} />

        {/* Avatar + edit */}
        <div style={{ padding: '0 20px 20px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '12px' }}>
            {/* Avatar */}
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #0d3b8e, #f0a500)',
              border: '3px solid #fff', marginTop: '-36px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 900, fontSize: '24px',
              boxShadow: '0 4px 12px rgba(13,59,142,0.2)',
            }}>RC</div>

            {/* Edit button */}
            <button
              onClick={() => setIsEditing(p => !p)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '10px',
                border: '1px solid #e2e8f0', background: '#fff',
                fontSize: '13px', fontWeight: 700, color: '#0d3b8e',
                cursor: 'pointer', transition: 'all 0.15s',
                fontFamily: "'Nunito', sans-serif",
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#e8f0fe'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              <EditIcon /> {isEditing ? 'Save' : 'Edit Profile'}
            </button>
          </div>

          {/* Name & role */}
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f1923' }}>Rutanga Claude</div>
          <div style={{ fontSize: '13px', color: '#5a6a82', marginBottom: '12px' }}>Accountant · Finance Department</div>

          {/* Bio */}
          {isEditing ? (
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '10px',
                border: '1.5px solid #0d3b8e44', outline: 'none', resize: 'none',
                fontSize: '13px', color: '#1e293b', lineHeight: 1.6, marginBottom: '12px',
                fontFamily: "'Nunito', sans-serif", background: '#f8faff',
              }}
              rows={3}
            />
          ) : (
            <div style={{ fontSize: '13px', color: '#5a6a82', lineHeight: 1.65, marginBottom: '14px' }}>
              {bio}
            </div>
          )}

          {/* Meta info */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
            {[
              { icon: <BriefcaseIcon />, text: 'Finance Department' },
              { icon: <MapPinIcon />,   text: 'Kigali, Rwanda' },
              { icon: <CalendarIcon />, text: 'Joined January 2024' },
            ].map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#5a6a82' }}>
                <span style={{ color: '#94a3b8' }}>{m.icon}</span>{m.text}
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '0', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
            {stats.map((s, i) => (
              <div key={i} style={{
                flex: 1, textAlign: 'center',
                borderRight: i < stats.length - 1 ? '1px solid #f1f5f9' : 'none',
              }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0d3b8e' }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{
              padding: '8px 16px', fontSize: '13px',
              fontWeight: activeTab === t ? 700 : 500,
              color: activeTab === t ? '#0d3b8e' : '#5a6a82',
              background: 'none', border: 'none',
              borderBottom: activeTab === t ? '2px solid #0d3b8e' : '2px solid transparent',
              marginBottom: '-1px', cursor: 'pointer',
              fontFamily: "'Nunito', sans-serif",
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      {activeTab === 'Posts' && (
        <div>
          {MOCK_POSTS.map(p => (
            <div key={p.id} style={{
              background: '#fff', borderRadius: '14px', padding: '16px',
              marginBottom: '12px', border: '1px solid #e2e8f0',
              boxShadow: '0 1px 6px rgba(13,59,142,0.05)',
            }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600 }}>{p.timestamp}</div>
              <div style={{ fontSize: '14px', color: '#1e293b', lineHeight: 1.6 }}>{p.content}</div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '12px', color: '#5a6a82' }}>
                  {Object.entries(p.reactions).map(([e, c]) => `${e} ${c}`).join('  ')}
                </span>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {p.commentCount} comments
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Announcements' && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📢</div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#5a6a82' }}>No announcements yet</div>
        </div>
      )}

      {activeTab === 'About' && (
        <div style={{
          background: '#fff', borderRadius: '14px', padding: '20px',
          border: '1px solid #e2e8f0', boxShadow: '0 1px 6px rgba(13,59,142,0.05)',
        }}>
          {[
            { label: 'Full Name',   value: 'Rutanga Claude' },
            { label: 'Role',        value: 'Accountant' },
            { label: 'Department',  value: 'Finance' },
            { label: 'Location',    value: 'Kigali, Rwanda' },
            { label: 'Joined',      value: 'January 2024' },
            { label: 'Email',       value: 'r.claude@auca.ac.rw' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 0',
              borderBottom: i < 5 ? '1px solid #f1f5f9' : 'none',
            }}>
              <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>{item.label}</span>
              <span style={{ fontSize: '13px', color: '#0f1923', fontWeight: 700 }}>{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}