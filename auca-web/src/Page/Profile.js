// src/Page/Profile.js
// CHANGE: replaced hardcoded mock profile with real API fetch from
//   GET /student/profile  or  GET /staff/profile  (based on isStaff in localStorage)
// All UI (avatar, tabs, stats, about section) is unchanged.

import React, { useState, useEffect } from 'react';
import { RiEditLine }    from 'react-icons/ri';
import { BsCalendar3 }   from 'react-icons/bs';
import { GoLocation }    from 'react-icons/go';
import { MdWorkOutline } from 'react-icons/md';
import api from '../utils/api';

const TABS = ['Posts', 'Announcements', 'About'];

export default function Profile() {
  const [activeTab, setActiveTab] = useState('Posts');
  const [isEditing, setIsEditing] = useState(false);
  const [profile,   setProfile]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  const isStaff = localStorage.getItem('isStaff') === 'true';

  // CHANGE: fetch profile from backend on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const endpoint = isStaff ? '/staff/profile' : '/student/profile';
        const data = await api.get(endpoint);
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [isStaff]);

  // Derived display values — fall back to placeholders while loading
  const fullName   = profile ? `${profile.Fname || ''} ${profile.Lname || ''}`.trim() : '—';
  const role       = profile?.Role       || (isStaff ? 'Staff' : 'Student');
  const department = profile?.Department || profile?.StudDepartment || '—';
  const email      = profile?.Email      || '—';
  const initials   = fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const metaItems = [
    { icon: <MdWorkOutline size={14} />, text: department },
    { icon: <GoLocation    size={14} />, text: 'Kigali, Rwanda' },
    { icon: <BsCalendar3   size={14} />, text: 'AUCA Member' },
  ];

  const stats = [
    { label: 'Posts',     value: '—' },
    { label: 'Reactions', value: '—' },
    { label: 'Comments',  value: '—' },
  ];

  if (loading) {
    return (
      <div style={{ maxWidth: '680px', margin: '0 auto', fontFamily: "'Nunito', sans-serif", textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        Loading profile...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '680px', margin: '0 auto', fontFamily: "'Nunito', sans-serif", textAlign: 'center', padding: '60px 20px', color: '#e53935' }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', fontFamily: "'Nunito', sans-serif" }}>

      {/* ── Profile card ── */}
      <div style={{ background: 'var(--surface)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '16px', boxShadow: 'var(--shadow)' }}>
        {/* Cover */}
        <div style={{ height: '100px', background: 'linear-gradient(135deg, #0d3b8e 0%, #1a4fa8 50%, #f0a500 100%)', position: 'relative' }} />

        <div style={{ padding: '0 20px 20px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '12px' }}>

            {/* Avatar — shows profile image if available */}
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #0d3b8e, #f0a500)', border: '3px solid var(--surface)', marginTop: '-36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '24px', boxShadow: '0 4px 12px rgba(13,59,142,0.2)', overflow: 'hidden' }}>
              {profile?.ProfileUrl
                ? <img src={profile.ProfileUrl} alt={fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials
              }
            </div>

            {/* Edit button */}
            <button onClick={() => setIsEditing(p => !p)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '13px', fontWeight: 700, color: 'var(--primary)', cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'Nunito', sans-serif" }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-pale)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
            >
              <RiEditLine size={15} />
              {isEditing ? 'Save' : 'Edit Profile'}
            </button>
          </div>

          {/* Name & role */}
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>{fullName}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>{role} · {department}</div>

          {/* Meta info */}
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
              <div key={i} style={{ flex: 1, textAlign: 'center', borderRight: i < stats.length - 1 ? '1px solid var(--border)' : 'none' }}>
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
            style={{ padding: '8px 16px', fontSize: '13px', fontWeight: activeTab === t ? 700 : 500, color: activeTab === t ? 'var(--primary)' : 'var(--text-secondary)', background: 'none', border: 'none', borderBottom: activeTab === t ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: '-1px', cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>
            {t}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      {activeTab === 'Posts' && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '32px', marginBottom: 8 }}></div>
          <div style={{ fontSize: '14px' }}>Your posts will appear here</div>
        </div>
      )}

      {activeTab === 'Announcements' && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}></div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)' }}>No announcements yet</div>
        </div>
      )}

      {activeTab === 'About' && (
        <div style={{ background: 'var(--surface)', borderRadius: '14px', padding: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          {[
            { label: 'Full Name',   value: fullName },
            { label: 'Role',        value: role },
            { label: 'Department',  value: department },
            { label: 'Email',       value: email },
            { label: 'Phone',       value: profile?.Phone ? `+250 ${profile.Phone}` : '—' },
            { label: 'Faculty',     value: profile?.StudFaculty || profile?.Faculty || '—' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < 5 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>{item.label}</span>
              <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 700 }}>{item.value}</span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}