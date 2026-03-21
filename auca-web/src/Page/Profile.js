import React, { useState } from 'react';
import { RiEditLine }       from 'react-icons/ri';
import { BsCalendar3 }      from 'react-icons/bs';
import { GoLocation }       from 'react-icons/go';
import { MdWorkOutline }    from 'react-icons/md';

const MOCK_POSTS = [
  { id: '1', content: 'Morning AUCA 😄', type: 'post', timestamp: 'Mar 9 at 10:52 AM', reactions: { '😄': 1 }, commentCount: 0 },
  { id: '2', content: 'link ya course registration: https://registration-42io.onrender.com/', type: 'post', timestamp: 'Mar 2 at 5:55 PM', reactions: { '👍': 1 }, commentCount: 0 },
];

const TABS = ['Posts', 'Announcements', 'About'];

export default function Profile() {
  const [activeTab, setActiveTab] = useState('Posts');
  const [isEditing, setIsEditing] = useState(false);
  const [bio,       setBio]       = useState('Accountant at AUCA Finance Department. Passionate about numbers and community 📊');

  const stats = [
    { label: 'Posts',     value: '12' },
    { label: 'Reactions', value: '48' },
    { label: 'Comments',  value: '23' },
  ];

  const metaItems = [
    { icon: <MdWorkOutline size={14} />, text: 'Finance Department' },
    { icon: <GoLocation    size={14} />, text: 'Kigali, Rwanda' },
    { icon: <BsCalendar3   size={14} />, text: 'Joined January 2024' },
  ];

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', fontFamily: "'Nunito', sans-serif" }}>

      {/* ── Profile card ── */}
      <div style={{
        background: 'var(--surface)', borderRadius: '16px', overflow: 'hidden',
        border: '1px solid var(--border)', marginBottom: '16px',
        boxShadow: 'var(--shadow)',
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
              border: '3px solid var(--surface)', marginTop: '-36px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 900, fontSize: '24px',
              boxShadow: '0 4px 12px rgba(13,59,142,0.2)',
            }}>RC</div>

            {/* ── Edit button — RiEditLine from react-icons/ri ── */}
            <button
              onClick={() => setIsEditing(p => !p)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '10px',
                border: '1px solid var(--border)', background: 'var(--surface)',
                fontSize: '13px', fontWeight: 700, color: 'var(--primary)',
                cursor: 'pointer', transition: 'all 0.15s',
                fontFamily: "'Nunito', sans-serif",
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-pale)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
            >
              <RiEditLine size={15} />
              {isEditing ? 'Save' : 'Edit Profile'}
            </button>
          </div>

          {/* Name & role */}
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>Rutanga Claude</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Accountant · Finance Department</div>

          {/* Bio */}
          {isEditing ? (
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '10px',
                border: '1.5px solid #0d3b8e44', outline: 'none', resize: 'none',
                fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '12px',
                fontFamily: "'Nunito', sans-serif", background: 'var(--surface-2)',
              }}
              rows={3}
            />
          ) : (
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '14px' }}>
              {bio}
            </div>
          )}

          {/* Meta info — react-icons ── */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
            {metaItems.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--text-muted)', display: 'flex' }}>{m.icon}</span>
                {m.text}
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
            {stats.map((s, i) => (
              <div key={i} style={{
                flex: 1, textAlign: 'center',
                borderRight: i < stats.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border)' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{
              padding: '8px 16px', fontSize: '13px',
              fontWeight: activeTab === t ? 700 : 500,
              color: activeTab === t ? 'var(--primary)' : 'var(--text-secondary)',
              background: 'none', border: 'none',
              borderBottom: activeTab === t ? '2px solid var(--primary)' : '2px solid transparent',
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
              background: 'var(--surface)', borderRadius: '14px', padding: '16px',
              marginBottom: '12px', border: '1px solid var(--border)',
              boxShadow: 'var(--shadow)',
            }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>{p.timestamp}</div>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.6 }}>{p.content}</div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {Object.entries(p.reactions).map(([e, c]) => `${e} ${c}`).join('  ')}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {p.commentCount} comments
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Announcements' && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📢</div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)' }}>No announcements yet</div>
        </div>
      )}

      {activeTab === 'About' && (
        <div style={{
          background: 'var(--surface)', borderRadius: '14px', padding: '20px',
          border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
        }}>
          {[
            { label: 'Full Name',  value: 'Rutanga Claude' },
            { label: 'Role',       value: 'Accountant' },
            { label: 'Department', value: 'Finance' },
            { label: 'Location',   value: 'Kigali, Rwanda' },
            { label: 'Joined',     value: 'January 2024' },
            { label: 'Email',      value: 'r.claude@auca.ac.rw' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 0',
              borderBottom: i < 5 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>{item.label}</span>
              <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 700 }}>{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}