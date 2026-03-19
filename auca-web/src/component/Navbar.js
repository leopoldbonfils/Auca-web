import React, { useState, useRef, useEffect } from 'react';

// ── react-icons ───────────────────────────────────────────────────────────────
import { GoHome, GoHomeFill }        from 'react-icons/go';
import { RiSearchLine, RiSearchFill } from 'react-icons/ri';
import { FiPlusCircle }              from 'react-icons/fi';
import { RiUser3Line, RiUser3Fill }  from 'react-icons/ri';
import { CiCircleMore }              from 'react-icons/ci';
import { HiOutlineSun }              from 'react-icons/hi';
import { BsMoonStars }               from 'react-icons/bs';
import { RiLogoutBoxLine }           from 'react-icons/ri';
import { RiSettings3Line }           from 'react-icons/ri';

// ── AUCA Logo ─────────────────────────────────────────────────────────────────
let aucaLogo;
try { aucaLogo = require('../assets/image.png'); } catch (e) { aucaLogo = null; }

// ── Nav items ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'home',    label: 'Home',        icon: <GoHome size={26} />,       iconActive: <GoHomeFill size={26} /> },
  { id: 'search',  label: 'Search',      icon: <RiSearchLine size={26} />, iconActive: <RiSearchFill size={26} /> },
  { id: 'create',  label: 'Create',      icon: <FiPlusCircle size={26} />, iconActive: <FiPlusCircle size={26} /> },
  { id: 'profile', label: 'Profile',     icon: <RiUser3Line size={26} />,  iconActive: <RiUser3Fill size={26} /> },
];

// ── Widths ────────────────────────────────────────────────────────────────────
const SLIM_W    = 72;   // icon-only width
const EXPANDED_W = 240; // with labels

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <div onClick={e => { e.stopPropagation(); onChange(!checked); }}
      style={{
        width: '44px', height: '24px', borderRadius: '12px',
        cursor: 'pointer', flexShrink: 0,
        background: checked ? '#4d8af0' : '#555',
        position: 'relative', transition: 'background 0.25s',
      }}>
      <div style={{
        position: 'absolute', top: '2px',
        left: checked ? '22px' : '2px',
        width: '20px', height: '20px', borderRadius: '50%',
        background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        transition: 'left 0.25s',
      }} />
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
export default function Navbar({ activePage, onNavigate, theme, onThemeChange }) {
  const [expanded, setExpanded] = useState(false); // hover state
  const [showMore, setShowMore] = useState(false);
  const navRef  = useRef(null);
  const moreRef = useRef(null);
  const isDark  = theme === 'dark';

  // Close More popup on outside click
  useEffect(() => {
    const handler = e => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setShowMore(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navWidth = expanded ? EXPANDED_W : SLIM_W;

  return (
    <nav
      ref={navRef}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => { setExpanded(false); setShowMore(false); }}
      style={{
        position: 'fixed', top: 0, left: 0,
        height: '100vh',
        width: `${navWidth}px`,
        background: 'var(--nav-bg)',
        borderRight: '1px solid var(--nav-border)',
        display: 'flex', flexDirection: 'column',
        alignItems: expanded ? 'flex-start' : 'center',
        zIndex: 100,
        overflow: 'hidden',
        transition: 'width 0.25s ease, align-items 0.25s ease',
        boxShadow: isDark
          ? '2px 0 24px rgba(0,0,0,0.5)'
          : '2px 0 16px rgba(13,59,142,0.08)',
      }}
    >

      {/* ── LOGO ── */}
      <div style={{
        padding: expanded ? '24px 20px 20px' : '24px 0 20px',
        borderBottom: '1px solid var(--nav-border)',
        width: '100%',
        display: 'flex',
        justifyContent: expanded ? 'flex-start' : 'center',
        alignItems: 'center',
        transition: 'padding 0.25s',
        flexShrink: 0,
      }}>
        {aucaLogo ? (
          <img
            src={aucaLogo}
            alt="AUCA"
            style={{
              width: expanded ? '120px' : '38px',
              height: '38px',
              objectFit: 'contain',
              objectPosition: 'left center',
              transition: 'width 0.25s',
              marginLeft: expanded ? '0' : '0',
            }}
          />
        ) : (
          <div style={{
            width: '38px', height: '38px', flexShrink: 0,
            background: 'linear-gradient(135deg, #0d3b8e, #1a4fa8)',
            borderRadius: '10px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '18px',
          }}>A</div>
        )}
      </div>

      {/* ── Nav items ── */}
      <div style={{
        flex: 1,
        width: '100%',
        padding: '16px 0',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
        {NAV_ITEMS.map(item => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate && onNavigate(item.id)}
              title={!expanded ? item.label : ''}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: expanded ? '16px' : '0',
                padding: expanded ? '13px 20px' : '13px 0',
                justifyContent: expanded ? 'flex-start' : 'center',
                width: '100%',
                border: 'none',
                borderRadius: expanded ? '10px' : '0',
                margin: expanded ? '2px 8px' : '2px 0',
                width: expanded ? 'calc(100% - 16px)' : '100%',
                cursor: 'pointer',
                position: 'relative',
                background: isActive && expanded
                  ? 'var(--nav-active-bg)'
                  : 'transparent',
                color: isActive ? 'var(--nav-active-color)' : 'var(--nav-text)',
                transition: 'all 0.2s ease',
                fontFamily: "'Nunito', sans-serif",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = isActive && expanded
                  ? 'var(--nav-active-bg)'
                  : 'var(--surface-2)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = isActive && expanded
                  ? 'var(--nav-active-bg)'
                  : 'transparent';
              }}
            >
              {/* Icon */}
              <span style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                // Bold/thicker stroke when active and NOT expanded (slim mode)
                filter: isActive && !expanded ? 'drop-shadow(0 0 1px currentColor)' : 'none',
              }}>
                {isActive ? item.iconActive : item.icon}
              </span>

              {/* Label — only when expanded */}
              {expanded && (
                <span style={{
                  fontSize: '15px',
                  fontWeight: isActive ? 700 : 500,
                  whiteSpace: 'nowrap',
                  opacity: expanded ? 1 : 0,
                  transition: 'opacity 0.2s ease',
                }}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Bottom: More button ── */}
      <div style={{
        padding: '12px 0 20px',
        borderTop: '1px solid var(--nav-border)',
        width: '100%',
        flexShrink: 0,
        position: 'relative',
      }} ref={moreRef}>

        {/* More button */}
        <button
          onClick={() => setShowMore(p => !p)}
          style={{
            display: 'flex', alignItems: 'center',
            gap: expanded ? '16px' : '0',
            padding: expanded ? '13px 20px' : '13px 0',
            justifyContent: expanded ? 'flex-start' : 'center',
            width: expanded ? 'calc(100% - 16px)' : '100%',
            margin: expanded ? '0 8px' : '0',
            border: 'none', cursor: 'pointer',
            borderRadius: expanded ? '10px' : '0',
            background: showMore && expanded ? 'var(--surface-2)' : 'transparent',
            color: 'var(--nav-text)',
            transition: 'all 0.2s ease',
            fontFamily: "'Nunito', sans-serif",
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
          onMouseLeave={e => e.currentTarget.style.background = showMore && expanded ? 'var(--surface-2)' : 'transparent'}
        >
          <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <CiCircleMore size={26} />
          </span>
          {expanded && (
            <span style={{ fontSize: '15px', fontWeight: 500, whiteSpace: 'nowrap' }}>
              More
            </span>
          )}
        </button>

        {/* ── More popup ── */}
        {showMore && expanded && (
          <div style={{
            position: 'absolute',
            bottom: '70px',
            left: '12px',
            right: '12px',
            background: 'var(--surface)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            boxShadow: isDark
              ? '0 -8px 32px rgba(0,0,0,0.6)'
              : '0 -8px 32px rgba(13,59,142,0.15)',
            overflow: 'hidden',
            zIndex: 300,
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
                width: '34px', height: '34px', borderRadius: '10px',
                background: isDark ? '#1a2744' : '#fff7ed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isDark ? '#4d8af0' : '#f0a500', flexShrink: 0,
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
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '14px 16px', cursor: 'pointer',
              borderBottom: '1px solid var(--border)', transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: '34px', height: '34px', borderRadius: '10px',
                background: 'var(--primary-pale)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--primary)', flexShrink: 0,
              }}>
                <RiSettings3Line size={18} />
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
                width: '34px', height: '34px', borderRadius: '10px',
                background: '#fff0f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#e53935', flexShrink: 0,
              }}>
                <RiLogoutBoxLine size={18} />
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
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </nav>
  );
}