import React, { useState, useRef, useEffect } from 'react';

// ── react-icons ───────────────────────────────────────────────────────────────
import { GoHome, GoHomeFill } from 'react-icons/go';
import { RiSearchLine } from 'react-icons/ri';
import { FiPlusCircle } from "react-icons/fi";
import { RiUser3Line } from 'react-icons/ri';
import { CiCircleMore } from "react-icons/ci";
import { HiOutlineSun } from 'react-icons/hi';
import { BsMoonStars } from 'react-icons/bs';
import { RiLogoutBoxLine } from 'react-icons/ri';
import { RiSettings3Line } from 'react-icons/ri';
import { BsThreeDots } from 'react-icons/bs';

// ── AUCA Logo ─────────────────────────────────────────────────────────────────
let aucaLogo;
try { aucaLogo = require('../assets/image.png'); } catch (e) { aucaLogo = null; }

// ── Nav items ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    id: 'home',
    label: 'Home',
    icon:       <GoHome       size={30} />,
    iconActive: <GoHomeFill   size={30} />,
  },
  {
    id: 'search',
    label: 'Search',
    icon:       <RiSearchLine size={30} />,
    iconActive: <RiSearchLine size={30} />,
  },
  {
    id: 'create',
    label: 'Create Post',
    icon:       <FiPlusCircle size={30} />,
    iconActive: <FiPlusCircle size={30} />,
  },
  {
    id: 'profile',
    label: 'Profile',
    icon:       <RiUser3Line  size={30} />,
    iconActive: <RiUser3Line  size={30} />,
  },
];

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onChange(!checked); }}
      style={{
        width: '44px', height: '24px', borderRadius: '12px',
        cursor: 'pointer', flexShrink: 0,
        background: checked ? '#4d8af0' : '#cbd5e1',
        position: 'relative', transition: 'background 0.25s ease',
      }}
    >
      <div style={{
        position: 'absolute', top: '2px',
        left: checked ? '22px' : '2px',
        width: '20px', height: '20px', borderRadius: '50%',
        background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
        transition: 'left 0.25s ease',
      }} />
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
export default function Navbar({ activePage, onNavigate, theme, onThemeChange }) {
  const [hovered,  setHovered]  = useState(null);
  const [showMore, setShowMore] = useState(false);
  const moreRef = useRef(null);
  const isDark  = theme === 'dark';

  // Close popup on outside click
  useEffect(() => {
    const handler = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setShowMore(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0,
      height: '100vh', width: '240px',
      background: 'var(--nav-bg)',
      borderRight: '1px solid var(--nav-border)',
      display: 'flex', flexDirection: 'column',
      zIndex: 100,
      boxShadow: isDark
        ? '2px 0 16px rgba(0,0,0,0.4)'
        : '2px 0 12px rgba(13,59,142,0.06)',
      transition: 'background 0.3s, border-color 0.3s',
    }}>

      {/* ── LOGO ── */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--nav-border)' }}>
        {aucaLogo ? (
          <img
            src={aucaLogo}
            alt="AUCA Social Hub"
            style={{ width: '100%', maxHeight: '64px', objectFit: 'contain', objectPosition: 'left center' }}
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', background: 'linear-gradient(135deg, #0d3b8e, #1a4fa8)',
              borderRadius: '10px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '16px',
            }}>A</div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>AUCA</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Social Hub</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Nav items ── */}
      <div style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => {
          const isActive  = activePage === item.id;
          const isHovered = hovered === item.id;
          return (
            <button
              key={item.id}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onNavigate && onNavigate(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '11px 14px', borderRadius: '10px', marginBottom: '4px',
                width: '100%', textAlign: 'left', border: 'none',
                position: 'relative',
                background: isActive
                  ? 'var(--nav-active-bg)'
                  : isHovered ? 'var(--surface-2)' : 'transparent',
                color: isActive ? 'var(--nav-active-color)' : 'var(--nav-text)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '14px',
                transition: 'all 0.15s',
                cursor: 'pointer',
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              {/* Active left bar */}
              {isActive && (
                <span style={{
                  position: 'absolute', left: 0, top: '20%', bottom: '20%',
                  width: '3px', background: 'var(--primary)',
                  borderRadius: '0 3px 3px 0',
                }} />
              )}
              {/* Icon — filled when active */}
              <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                {isActive ? item.iconActive : item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Bottom: user card + More button ── */}
      <div style={{
        padding: '12px',
        borderTop: '1px solid var(--nav-border)',
        position: 'relative',
      }} ref={moreRef}>

        {/* User card */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 12px', borderRadius: '10px',
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          marginBottom: '8px',
        }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #0d3b8e, #f0a500)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: '13px',
          }}>RC</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Rutanga Claude
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Accountant</div>
          </div>
          <span style={{ color: 'var(--text-muted)', flexShrink: 0, display: 'flex' }}>
            <BsThreeDots size={16} />
          </span>
        </div>

        {/* More button */}
        <button
          onClick={() => setShowMore(p => !p)}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '11px 14px', borderRadius: '10px', width: '100%',
            border: 'none', cursor: 'pointer', textAlign: 'left',
            background: showMore ? 'var(--nav-active-bg)' : 'transparent',
            color: showMore ? 'var(--nav-active-color)' : 'var(--nav-text)',
            fontWeight: 600, fontSize: '14px', transition: 'all 0.15s',
            fontFamily: "'Nunito', sans-serif",
          }}
          onMouseEnter={e => { if (!showMore) e.currentTarget.style.background = 'var(--surface-2)'; }}
          onMouseLeave={e => { if (!showMore) e.currentTarget.style.background = 'transparent'; }}
        >
          <CiCircleMore size={30} />
          <span>More</span>
        </button>

        {/* ── More popup — opens upward ── */}
        {showMore && (
          <div style={{
            position: 'absolute', bottom: '110px', left: '12px', right: '12px',
            background: 'var(--surface)', borderRadius: '16px',
            border: '1px solid var(--border)',
            boxShadow: isDark
              ? '0 -8px 32px rgba(0,0,0,0.5)'
              : '0 -8px 32px rgba(13,59,142,0.15)',
            overflow: 'hidden', zIndex: 200,
            animation: 'popupIn 0.18s ease',
          }}>

            {/* Dark / Light toggle */}
            <div
              onClick={() => onThemeChange(isDark ? 'light' : 'dark')}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 16px', cursor: 'pointer',
                borderBottom: '1px solid var(--border)', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
                background: isDark ? '#1a2744' : '#fff7ed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isDark ? '#4d8af0' : '#f0a500',
              }}>
                {isDark ? <BsMoonStars size={18} /> : <HiOutlineSun size={18} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {isDark ? 'Switch to light' : 'Switch to dark'}
                </div>
              </div>
              <Toggle checked={isDark} onChange={val => onThemeChange(val ? 'dark' : 'light')} />
            </div>

            {/* Settings */}
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 16px', cursor: 'pointer',
                borderBottom: '1px solid var(--border)', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
                background: 'var(--primary-pale)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--primary)',
              }}>
                <RiSettings3Line size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Settings</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Account & preferences</div>
              </div>
            </div>

            {/* Log out */}
            <div
              onClick={() => alert('Logging out...')}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 16px', cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#fff0f0'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
                background: '#fff0f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#e53935',
              }}>
                <RiLogoutBoxLine size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#e53935' }}>Log Out</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Sign out of your account</div>
              </div>
            </div>

          </div>
        )}

        <style>{`
          @keyframes popupIn {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </nav>
  );
}