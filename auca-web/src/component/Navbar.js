import React, { useState } from 'react';

const HomeIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor" strokeWidth={filled ? 0 : 2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
    <path d="M9 21V12h6v9"/>
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/>
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="4"/>
    <line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);
const UserIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
);
const MenuIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
);
const SunIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const NAV_ITEMS = [
  { id: 'home',     label: 'Home',         icon: (a) => <HomeIcon filled={a} /> },
  { id: 'search',   label: 'Search',       icon: () => <SearchIcon /> },
  { id: 'create',   label: 'Create Post',  icon: () => <PlusIcon /> },
  { id: 'profile',  label: 'Profile',      icon: () => <UserIcon /> },
  { id: 'settings', label: 'Settings',     icon: () => <SettingsIcon /> },
];

export default function Navbar({ activePage, onNavigate, theme, onThemeChange }) {
  const [hovered, setHovered] = useState(null);
  const isDark = theme === 'dark';

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, height: '100vh', width: '240px',
      background: 'var(--nav-bg)',
      borderRight: '1px solid var(--nav-border)',
      display: 'flex', flexDirection: 'column',
      zIndex: 100,
      boxShadow: isDark ? '2px 0 12px rgba(0,0,0,0.3)' : '2px 0 12px rgba(13,59,142,0.06)',
      transition: 'background 0.3s ease, border-color 0.3s ease',
    }}>

      {/* Logo */}
      <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid var(--nav-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #0d3b8e, #1a4fa8)',
            borderRadius: '10px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '16px',
          }}>A</div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.5px' }}>AUCA</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Social Hub</div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <div style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => {
          const isActive  = activePage === item.id;
          const isHovered = hovered === item.id;
          return (
            <button key={item.id}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onNavigate && onNavigate(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '11px 14px', borderRadius: '10px', marginBottom: '4px',
                width: '100%', textAlign: 'left', border: 'none', position: 'relative',
                background: isActive
                  ? 'var(--nav-active-bg)'
                  : isHovered ? 'var(--surface-2)' : 'transparent',
                color: isActive ? 'var(--nav-active-color)' : 'var(--nav-text)',
                fontWeight: isActive ? 700 : 500, fontSize: '14px',
                transition: 'all 0.15s ease', cursor: 'pointer',
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              {isActive && (
                <span style={{
                  position: 'absolute', left: 0, top: '20%', bottom: '20%',
                  width: '3px', background: 'var(--primary)', borderRadius: '0 3px 3px 0',
                }} />
              )}
              <span style={{ flexShrink: 0 }}>{item.icon(isActive)}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom: theme toggle + user */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--nav-border)' }}>

        {/* Quick theme toggle */}
        <div
          onClick={() => onThemeChange(isDark ? 'light' : 'dark')}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
            background: 'var(--surface-2)', marginBottom: '8px',
            border: '1px solid var(--border)', transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <span style={{ color: isDark ? '#4d8af0' : '#f0a500' }}>
            {isDark ? <MoonIcon /> : <SunIcon />}
          </span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', flex: 1 }}>
            {isDark ? 'Dark Mode' : 'Light Mode'}
          </span>
          {/* Mini toggle */}
          <div style={{
            width: '36px', height: '20px', borderRadius: '10px',
            background: isDark ? '#4d8af0' : '#cbd5e1', position: 'relative', transition: 'background 0.25s',
          }}>
            <div style={{
              position: 'absolute', top: '2px',
              left: isDark ? '18px' : '2px',
              width: '16px', height: '16px', borderRadius: '50%',
              background: '#fff', transition: 'left 0.25s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </div>
        </div>

        {/* User card */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 14px', borderRadius: '10px',
          background: 'var(--surface-2)', cursor: 'pointer',
          border: '1px solid var(--border)',
        }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #0d3b8e, #f0a500)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: '13px', flexShrink: 0,
          }}>RC</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Rutanga Claude</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Accountant</div>
          </div>
          <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}><MenuIcon /></span>
        </div>
      </div>
    </nav>
  );
}