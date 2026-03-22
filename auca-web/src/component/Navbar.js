import React, { useState, useRef, useEffect } from 'react';

// ── react-icons ───────────────────────────────────────────────────────────────
import { GoHome, GoHomeFill }         from 'react-icons/go';
import { RiSearchLine, RiSearchFill } from 'react-icons/ri';
import { FiPlusCircle }               from 'react-icons/fi';
import { RiUser3Line, RiUser3Fill }   from 'react-icons/ri';
import { CiCircleMore }               from 'react-icons/ci';
import { HiOutlineSun }               from 'react-icons/hi';
import { BsMoonStars }                from 'react-icons/bs';
import { RiLogoutBoxLine }            from 'react-icons/ri';
import { RiSettings3Line }            from 'react-icons/ri';
import { MdOutlinePersonAddAlt }      from 'react-icons/md';

// ── AUCA Logo ─────────────────────────────────────────────────────────────────
let aucaLogo;
try { aucaLogo = require('../assets/auca_logoo.png'); } catch (e) { aucaLogo = null; }

// ── Nav items ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'home',    label: 'Home',    icon: <GoHome size={30} />,       iconActive: <GoHomeFill size={30} /> },
  { id: 'search',  label: 'Search',  icon: <RiSearchLine size={30} />, iconActive: <RiSearchFill size={30} /> },
  { id: 'create',  label: 'Create',  icon: <FiPlusCircle size={30} />, iconActive: <FiPlusCircle size={30} /> },
  { id: 'profile', label: 'Profile', icon: <RiUser3Line size={30} />,  iconActive: <RiUser3Fill size={30} /> },
];

const SLIM_W     = 72;
const EXPANDED_W = 240;

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <div onClick={e => { e.stopPropagation(); onChange(!checked); }}
      style={{
        width: '40px', height: '22px', borderRadius: '11px',
        cursor: 'pointer', flexShrink: 0,
        background: checked ? '#4d8af0' : '#555',
        position: 'relative', transition: 'background 0.25s',
      }}>
      <div style={{
        position: 'absolute', top: '1px',
        left: checked ? '19px' : '1px',
        width: '20px', height: '20px', borderRadius: '50%',
        background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        transition: 'left 0.25s',
      }} />
    </div>
  );
}

// ── Popup wrapper ─────────────────────────────────────────────────────────────
function Popup({ children, bottom }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: bottom || '70px',
      left: '12px',
      right: '12px',
      background: 'var(--surface)',
      borderRadius: '16px',
      border: '1px solid var(--border)',
      boxShadow: '0 -8px 32px rgba(0,0,0,0.2)',
      overflow: 'hidden',
      zIndex: 300,
      animation: 'popupIn 0.18s ease',
    }}>
      {children}
    </div>
  );
}

// ── PopupRow ──────────────────────────────────────────────────────────────────
function PopupRow({ iconBg, iconColor, icon, label, sublabel, right, onClick, danger, border = true }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '13px 16px', cursor: 'pointer',
        borderBottom: border ? '1px solid var(--border)' : 'none',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = danger ? '#fff0f0' : 'var(--surface-2)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{
        width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
        background: iconBg || 'var(--primary-pale)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: iconColor || 'var(--primary)',
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: danger ? '#e53935' : 'var(--text-primary)' }}>
          {label}
        </div>
        {sublabel && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sublabel}</div>}
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
// CHANGE 1: added onLogout to props
export default function Navbar({ activePage, onNavigate, theme, onThemeChange, onLogout }) {
  const [expanded,     setExpanded]     = useState(false);
  const [showMore,     setShowMore]     = useState(false);
  const [showAccount,  setShowAccount]  = useState(false);
  const navRef     = useRef(null);
  const moreRef    = useRef(null);
  const accountRef = useRef(null);
  const isDark     = theme === 'dark';

  // Close popups on outside click
  useEffect(() => {
    const handler = e => {
      if (moreRef.current    && !moreRef.current.contains(e.target))    setShowMore(false);
      if (accountRef.current && !accountRef.current.contains(e.target)) setShowAccount(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Shared button style ──
  const btnStyle = (isActive, isExpanded) => ({
    display: 'flex',
    alignItems: 'center',
    gap: isExpanded ? '14px' : '0',
    padding: isExpanded ? '11px 20px' : '11px 0',
    justifyContent: isExpanded ? 'flex-start' : 'center',
    width: isExpanded ? 'calc(100% - 16px)' : '100%',
    margin: isExpanded ? '1px 8px' : '1px 0',
    border: 'none',
    borderRadius: isExpanded ? '10px' : '0',
    background: isActive && isExpanded ? 'var(--nav-active-bg)' : 'transparent',
    color: isActive ? 'var(--nav-active-color)' : 'var(--nav-text)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Nunito', sans-serif",
  });

  return (
    <nav
      ref={navRef}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => { setExpanded(false); setShowMore(false); setShowAccount(false); }}
      style={{
        position: 'fixed', top: 0, left: 0,
        height: '100vh',
        width: `${expanded ? EXPANDED_W : SLIM_W}px`,
        background: 'var(--nav-bg)',
        borderRight: '1px solid var(--nav-border)',
        display: 'flex', flexDirection: 'column',
        alignItems: expanded ? 'flex-start' : 'center',
        zIndex: 100,
        overflow: 'hidden',
        transition: 'width 0.25s ease',
        boxShadow: isDark
          ? '2px 0 24px rgba(0,0,0,0.5)'
          : '2px 0 16px rgba(13,59,142,0.08)',
      }}
    >

      {/* ── LOGO ── */}
      <div style={{
        padding: expanded ? '22px 20px 18px' : '22px 0 18px',
        borderBottom: '1px solid var(--nav-border)',
        width: '100%',
        display: 'flex',
        justifyContent: expanded ? 'flex-start' : 'center',
        flexShrink: 0,
        transition: 'padding 0.25s',
      }}>
        {aucaLogo ? (
          <img src={aucaLogo} alt="AUCA"
            style={{
              width: expanded ? '110px' : '36px',
              height: '36px',
              objectFit: 'contain',
              objectPosition: 'left center',
              transition: 'width 0.25s',
            }}
          />
        ) : (
          <div style={{
            width: '36px', height: '36px', flexShrink: 0,
            background: 'linear-gradient(135deg, #0d3b8e, #1a4fa8)',
            borderRadius: '10px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '18px',
          }}>A</div>
        )}
      </div>

      {/* ── Nav items ── */}
      <div style={{ flex: 1, width: '100%', padding: '14px 0', overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV_ITEMS.map(item => {
          const isActive = activePage === item.id;
          return (
            <button key={item.id}
              onClick={() => onNavigate && onNavigate(item.id)}
              title={!expanded ? item.label : ''}
              style={btnStyle(isActive, expanded)}
              onMouseEnter={e => e.currentTarget.style.background = isActive && expanded ? 'var(--nav-active-bg)' : 'var(--surface-2)'}
              onMouseLeave={e => e.currentTarget.style.background = isActive && expanded ? 'var(--nav-active-bg)' : 'transparent'}
            >
              <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                {isActive ? item.iconActive : item.icon}
              </span>
              {expanded && (
                <span style={{ fontSize: '14px', fontWeight: isActive ? 700 : 500, whiteSpace: 'nowrap' }}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Bottom section ── */}
      <div style={{
        padding: '10px 0 18px',
        borderTop: '1px solid var(--nav-border)',
        width: '100%',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: expanded ? 'flex-start' : 'center',
        gap: '0px',
      }}>

        {/* ── More button ── */}
        <div style={{ position: 'relative', width: '100%' }} ref={moreRef}>
          <button
            onClick={() => { setShowMore(p => !p); setShowAccount(false); }}
            title={!expanded ? 'More' : ''}
            style={{
              ...btnStyle(false, expanded),
              background: showMore && expanded ? 'var(--surface-2)' : 'transparent',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = showMore && expanded ? 'var(--surface-2)' : 'transparent'}
          >
            <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <CiCircleMore size={30} />
            </span>
            {expanded && (
              <span style={{ fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap' }}>More</span>
            )}
          </button>

          {/* More popup — Dark mode + Settings only */}
          {showMore && expanded && (
            <Popup bottom="80px">
              <PopupRow
                iconBg={isDark ? '#1a2744' : '#fff7ed'}
                iconColor={isDark ? '#4d8af0' : '#f0a500'}
                icon={isDark ? <BsMoonStars size={20} /> : <HiOutlineSun size={20} />}
                label={isDark ? 'Dark Mode' : 'Light Mode'}
                sublabel={isDark ? 'Switch to light' : 'Switch to dark'}
                right={<Toggle checked={isDark} onChange={val => onThemeChange(val ? 'dark' : 'light')} />}
                onClick={() => onThemeChange(isDark ? 'light' : 'dark')}
              />
              <PopupRow
                iconBg="var(--primary-pale)"
                iconColor="var(--primary)"
                icon={<RiSettings3Line size={20} />}
                label="Settings"
                sublabel="Account & preferences"
                border={false}
              />
            </Popup>
          )}
        </div>

        {/* ── Account button ── */}
        <div style={{ position: 'relative', width: '100%' }} ref={accountRef}>
          <button
            onClick={() => { setShowAccount(p => !p); setShowMore(false); }}
            title={!expanded ? 'Account' : ''}
            style={{
              ...btnStyle(false, expanded),
              background: showAccount && expanded ? 'var(--surface-2)' : 'transparent',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = showAccount && expanded ? 'var(--surface-2)' : 'transparent'}
          >
            {/* Avatar circle */}
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #0d3b8e, #f0a500)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: '10px',
              border: showAccount ? '2px solid var(--primary)' : '2px solid transparent',
              transition: 'border-color 0.2s',
            }}>RC</div>
            {expanded && (
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '130px' }}>
                  Rutanga Claude
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Accountant</div>
              </div>
            )}
          </button>

          {/* Account popup — Add Account + Log Out */}
          {showAccount && expanded && (
            <Popup bottom="70px">
              <PopupRow
                iconBg="var(--primary-pale)"
                iconColor="var(--primary)"
                icon={<MdOutlinePersonAddAlt size={16} />}
                label="Add Account"
                sublabel="Switch or add another account"
              />
              {/* CHANGE 2: onClick calls onLogout instead of alert */}
              <PopupRow
                iconBg="#fff0f0"
                iconColor="#e53935"
                icon={<RiLogoutBoxLine size={16} />}
                label="Log Out"
                sublabel="Sign out of Rutanga Claude"
                border={false}
                danger
                onClick={() => { setShowAccount(false); onLogout && onLogout(); }}
              />
            </Popup>
          )}
        </div>

      </div>

      <style>{`
        @keyframes popupIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </nav>
  );
}