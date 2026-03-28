// src/component/PostCard.js
// Added features (mirrored from React Native app):
//   1  — Full-screen image lightbox with pinch-style zoom (click to toggle)
//         + keyboard Escape to close + scroll-wheel zoom
//  14  — Author avatar tap opens full-screen portrait viewer
//   6  — Reactions synced from parent (Home.js socket updates) via useEffect
//  10  — Comment count synced from parent via prop (auto-updates with React re-render)

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MdOutlineAddReaction } from 'react-icons/md';
import { FaRegCommentDots }     from 'react-icons/fa';
import { FiTrash2 }             from 'react-icons/fi';
import { CiLocationArrow1 }     from 'react-icons/ci';
import { IoClose }              from 'react-icons/io5';
import { MdOutlineCode }        from 'react-icons/md';
import { FaWhatsapp, FaFacebook } from 'react-icons/fa';
import { MdEmail }              from 'react-icons/md';
import { FaXTwitter }           from 'react-icons/fa6';
import { MdContentCopy }        from 'react-icons/md';
import { BsCheck2 }             from 'react-icons/bs';
import { IoLogoInstagram }      from 'react-icons/io5';
import { BsZoomIn, BsZoomOut }  from 'react-icons/bs';

// ─── Constants ───────────────────────────────────────────────────────────────
const REACTIONS = [
  { emoji: '❤️', label: 'Love',    name: 'love' },
  { emoji: '😄', label: 'Haha',    name: 'happy' },
  { emoji: '😂', label: 'Laugh',   name: 'laugh' },
  { emoji: '👍', label: 'Like',    name: 'thumbs_up' },
  { emoji: '💀', label: 'Dead',    name: 'skull' },
  { emoji: '😡', label: 'Angry',   name: 'angry' },
  { emoji: '😢', label: 'Sad',     name: 'sad' },
];

const SHARE_PLATFORMS = [
  { label: 'Email',     icon: <MdEmail size={22} color="#fff" />,        bg: '#757575', action: (u) => window.open(`mailto:?subject=Check this out&body=${encodeURIComponent(u)}`) },
  { label: 'WhatsApp',  icon: <FaWhatsapp size={22} color="#fff" />,     bg: '#25D366', action: (u) => window.open(`https://wa.me/?text=${encodeURIComponent(u)}`, '_blank') },
  { label: 'X',         icon: <FaXTwitter size={22} color="#fff" />,     bg: '#000',    action: (u) => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}`, '_blank') },
  { label: 'Instagram', icon: <IoLogoInstagram size={22} color="#fff" />, bg: '#E4405F', action: (u) => window.open(`https://www.instagram.com/?url=${encodeURIComponent(u)}`, '_blank') },
  { label: 'Facebook',  icon: <FaFacebook size={22} color="#fff" />,     bg: '#1877F2', action: (u) => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`, '_blank') },
  { label: 'Embed',     icon: <MdOutlineCode size={22} color="#fff" />,  bg: '#606060', action: (u) => alert(`Embed code:\n<iframe src="${u}"></iframe>`) },
];

// ─── Feature 1 & 14: Full-screen image lightbox ───────────────────────────────
function Lightbox({ src, onClose, isAvatar = false }) {
  const [scale,     setScale]     = useState(1);
  const [dragging,  setDragging]  = useState(false);
  const [pos,       setPos]       = useState({ x: 0, y: 0 });
  const [startPos,  setStartPos]  = useState({ x: 0, y: 0 });
  const imgRef      = useRef(null);

  // Escape closes
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  // Scroll-wheel zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    setScale(prev => Math.min(4, Math.max(1, prev - e.deltaY * 0.002)));
  }, []);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Click image = toggle zoom
  const handleImgClick = (e) => {
    e.stopPropagation();
    if (scale > 1) { setScale(1); setPos({ x: 0, y: 0 }); }
    else { setScale(2); }
  };

  // Drag when zoomed
  const onMouseDown = (e) => {
    if (scale <= 1) return;
    e.preventDefault();
    setDragging(true);
    setStartPos({ x: e.clientX - pos.x, y: e.clientY - pos.y });
  };
  const onMouseMove = (e) => {
    if (!dragging) return;
    setPos({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
  };
  const onMouseUp = () => setDragging(false);

  const zoomedIn = scale > 1;

  return (
    <>
      <style>{`
        @keyframes lbFadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes lbScaleIn { from { opacity:0; transform:scale(0.85) } to { opacity:1; transform:scale(1) } }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.92)',
          zIndex: 1000,
          animation: 'lbFadeIn 0.18s ease',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          userSelect: 'none',
        }}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1001, transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
        >
          <IoClose size={22} />
        </button>

        {/* Zoom indicator */}
        {!isAvatar && (
          <div style={{
            position: 'absolute', bottom: 20, left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '50px', padding: '7px 18px',
            display: 'flex', alignItems: 'center', gap: '10px',
            color: '#fff', fontSize: '13px', fontWeight: 600,
            zIndex: 1001,
          }}>
            <BsZoomOut size={16} style={{ opacity: zoomedIn ? 1 : 0.4 }} />
            <span>{Math.round(scale * 100)}%</span>
            <BsZoomIn  size={16} style={{ opacity: !zoomedIn ? 1 : 0.4 }} />
            <span style={{ opacity: 0.5, fontSize: '11px', marginLeft: 4 }}>
              {zoomedIn ? 'click · drag · scroll' : 'click or scroll to zoom'}
            </span>
          </div>
        )}

        {/* Image */}
        <div
          ref={imgRef}
          onClick={isAvatar ? undefined : handleImgClick}
          onMouseDown={onMouseDown}
          style={{
            animation: 'lbScaleIn 0.2s ease',
            // ── CHANGED: pointer/grab instead of zoom-in/zoom-out ──
            cursor: isAvatar ? 'default' : (zoomedIn ? (dragging ? 'grabbing' : 'grab') : 'pointer'),
            transition: dragging ? 'none' : 'transform 0.25s ease',
            transform: `scale(${scale}) translate(${pos.x / scale}px, ${pos.y / scale}px)`,
            maxWidth: isAvatar ? '280px' : '92vw',
            maxHeight: isAvatar ? '280px' : '88vh',
          }}
        >
          <img
            src={src}
            alt="full view"
            draggable={false}
            style={{
              display: 'block',
              maxWidth: '100%',
              maxHeight: isAvatar ? '280px' : '88vh',
              borderRadius: isAvatar ? '50%' : '8px',
              boxShadow: '0 8px 60px rgba(0,0,0,0.7)',
              objectFit: 'contain',
            }}
          />
        </div>
      </div>
    </>
  );
}

// ─── Share modal ──────────────────────────────────────────────────────────────
function ShareModal({ postUrl, onClose }) {
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);
  const handleCopy = () => {
    navigator.clipboard.writeText(postUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, animation: 'fadeIn 0.15s ease' }} />
      <div ref={ref} style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '600px', background: '#212121', borderRadius: '16px 16px 0 0', zIndex: 201, padding: '0 0 24px', animation: 'slideUp 0.2s ease', fontFamily: "'Nunito', sans-serif" }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#555' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 16px' }}>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>Share</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: '50%', color: '#aaa', display: 'flex', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'none'}><IoClose size={20} /></button>
        </div>
        <div style={{ display: 'flex', gap: '6px', padding: '0 20px 20px', overflowX: 'auto' }}>
          {SHARE_PLATFORMS.map(p => (
            <button key={p.label} onClick={() => p.action(postUrl)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: '6px 10px', borderRadius: '10px', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>{p.icon}</div>
              <span style={{ fontSize: '12px', color: '#ccc', fontWeight: 500, whiteSpace: 'nowrap' }}>{p.label}</span>
            </button>
          ))}
        </div>
        <div style={{ height: 1, background: '#333', margin: '0 0 16px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 20px', background: '#2d2d2d', borderRadius: '50px', padding: '10px 10px 10px 16px', border: '1px solid #3a3a3a' }}>
          <span style={{ flex: 1, fontSize: '13px', color: '#aaa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{postUrl}</span>
          <button onClick={handleCopy} style={{ background: copied ? '#25D366' : '#0095f6', border: 'none', cursor: 'pointer', padding: '8px 18px', borderRadius: '50px', fontSize: '13px', fontWeight: 700, color: '#fff', fontFamily: 'inherit', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px', transition: 'background 0.2s' }}>
            {copied ? <><BsCheck2 size={14} /> Copied</> : <><MdContentCopy size={14} /> Copy</>}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { transform:translateX(-50%) translateY(100%) } to { transform:translateX(-50%) translateY(0) } }
      `}</style>
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}
function avatarColor(name = '') {
  const colors = [
    'linear-gradient(135deg, #0d3b8e, #1a4fa8)',
    'linear-gradient(135deg, #7c3aed, #a855f7)',
    'linear-gradient(135deg, #059669, #34d399)',
    'linear-gradient(135deg, #dc2626, #f87171)',
    'linear-gradient(135deg, #d97706, #fbbf24)',
  ];
  return colors[(name.charCodeAt(0) || 0) % colors.length];
}

// ─── Feature 14: Author avatar — tappable, opens lightbox ────────────────────
function AuthorAvatar({ avatarUrl, author, onTap }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => { setBroken(false); }, [avatarUrl]);
  const showImage = avatarUrl && !broken;

  return (
    <div
      onClick={showImage ? onTap : undefined}
      title={showImage ? 'View profile photo' : undefined}
      style={{
        width: '44px', height: '44px', borderRadius: '50%',
        background: showImage ? 'transparent' : avatarColor(author),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 800, fontSize: '16px', flexShrink: 0,
        overflow: 'hidden',
        cursor: showImage ? 'pointer' : 'default',
        transition: 'opacity 0.15s, transform 0.15s',
      }}
      onMouseEnter={e => { if (showImage) { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'scale(1.06)'; } }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {showImage
        ? <img src={avatarUrl} alt={author} onError={() => setBroken(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        : getInitials(author)
      }
    </div>
  );
}

// ─── Feature 1: Post image — tappable, opens lightbox ────────────────────────
function PostImage({ src, onTap }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => { setBroken(false); }, [src]);
  if (!src || broken) return null;

  return (
    <div
      onClick={onTap}
      title="Click to view full screen"
      style={{
        width: '100%', maxHeight: '480px', overflow: 'hidden',
        background: 'var(--surface-2)', borderRadius: '4px',
        // ── CHANGED: pointer instead of zoom-in ──
        cursor: 'pointer', position: 'relative',
      }}
      onMouseEnter={e => e.currentTarget.querySelector('img').style.transform = 'scale(1.015)'}
      onMouseLeave={e => e.currentTarget.querySelector('img').style.transform = 'scale(1)'}
    >
      <img
        src={src}
        alt="post"
        onError={() => setBroken(true)}
        crossOrigin="anonymous"
        style={{
          width: '100%', height: '100%', objectFit: 'cover', display: 'block',
          transition: 'transform 0.25s ease',
        }}
      />
      {/* ── REMOVED: "View" overlay button ── */}
    </div>
  );
}

// ─── Stacked emoji reaction summary ──────────────────────────────────────────
function ReactionSummary({ reactions, myReaction }) {
  const total = Object.values(reactions).reduce((a, b) => a + b, 0);
  if (total === 0 && !myReaction) return null;
  const allEmojis = Object.entries(reactions).sort((a, b) => b[1] - a[1]).map(([e]) => e);
  if (myReaction && !allEmojis.includes(myReaction)) allEmojis.unshift(myReaction);
  const topEmojis = allEmojis.slice(0, 3);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {topEmojis.map((emoji, i) => (
          <div key={emoji} style={{
            width: '22px', height: '22px', borderRadius: '50%',
            background: 'var(--surface-2)', border: '2px solid var(--surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', marginLeft: i === 0 ? '0' : '-8px',
            zIndex: topEmojis.length - i, position: 'relative',
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          }}>{emoji}</div>
        ))}
      </div>
      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{total}</span>
    </div>
  );
}

// ─── PostCard ─────────────────────────────────────────────────────────────────
export default function PostCard({ post, onDelete, onComment }) {

  const {
    id, author = 'Unknown', role = '', department = '',
    timestamp = '', content = '', image = null, avatarUrl = null,
    type = 'post', commentCount = 0, isOwner = false,
  } = post || {};

  const [showPicker,   setShowPicker]   = useState(false);
  const [myReaction,   setMyReaction]   = useState(null);
  const [reactions,    setReactions]    = useState(post?.reactions || {});
  const [expanded,     setExpanded]     = useState(false);
  const [showShare,    setShowShare]    = useState(false);

  // Feature 1: image lightbox
  const [lightboxSrc,  setLightboxSrc]  = useState(null);
  const [lightboxMode, setLightboxMode] = useState('image'); // 'image' | 'avatar'

  // Feature 6: sync reactions when parent updates (socket reactionUpdate)
  useEffect(() => {
    setReactions(post?.reactions || {});
  }, [JSON.stringify(post?.reactions)]); // eslint-disable-line react-hooks/exhaustive-deps

  const openImageLightbox  = () => { setLightboxMode('image');  setLightboxSrc(image);     };
  const openAvatarLightbox = () => { setLightboxMode('avatar'); setLightboxSrc(avatarUrl); };
  const closeLightbox      = useCallback(() => setLightboxSrc(null), []);

  const handleReaction = (emoji) => {
    setShowPicker(false);
    const next = { ...reactions };
    if (myReaction) {
      next[myReaction] = Math.max(0, (next[myReaction] || 1) - 1);
      if (next[myReaction] === 0) delete next[myReaction];
    }
    if (myReaction !== emoji) { next[emoji] = (next[emoji] || 0) + 1; setMyReaction(emoji); }
    else setMyReaction(null);
    setReactions(next);
  };

  const totalReactions = Object.values(reactions).reduce((a, b) => a + b, 0);
  const MAX_LENGTH = 200;
  const isLong = content.length > MAX_LENGTH;
  const displayedContent = isLong && !expanded ? content.slice(0, MAX_LENGTH) + '…' : content;
  const postUrl = `https://auca-hub.ac.rw/posts/${id}`;

  return (
    <>
      {/* Feature 1 & 14: lightbox */}
      {lightboxSrc && (
        <Lightbox
          src={lightboxSrc}
          onClose={closeLightbox}
          isAvatar={lightboxMode === 'avatar'}
        />
      )}

      {showShare && <ShareModal postUrl={postUrl} onClose={() => setShowShare(false)} />}

      <div
        style={{
          background: 'var(--surface)', borderRadius: '6px', marginBottom: '3px',
          boxShadow: 'var(--shadow)', border: '1px solid var(--border)',
          fontFamily: "'Nunito', sans-serif", overflow: 'hidden',
          transition: 'box-shadow 0.2s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-hover)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}
      >

        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px 18px 12px' }}>

          {/* Feature 14: avatar taps to open lightbox */}
          <AuthorAvatar
            avatarUrl={avatarUrl}
            author={author}
            onTap={openAvatarLightbox}
          />

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--primary)' }}>{author}</span>
              {department && (<><span style={{ color: 'var(--border)' }}>|</span><span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{department}</span></>)}
              {timestamp && (<><span style={{ color: 'var(--border)' }}>•</span><span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{timestamp}</span></>)}
            </div>
            {role && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '1px' }}>{role}</div>}
          </div>

          {isOwner && (
            <button onClick={() => onDelete && onDelete(id)} title="Delete post"
              style={{ padding: '6px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '6px', display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#e53935'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            ><FiTrash2 size={16} /></button>
          )}
        </div>

        {/* BODY */}
        {type === 'announcement' && (
          <div style={{ margin: '0 18px 14px' }}>
            <div style={{ background: 'linear-gradient(135deg, #0d3b8e, #1a4fa8)', color: '#fff', textAlign: 'center', padding: '10px 16px', fontWeight: 800, fontSize: '14px', letterSpacing: '2.5px', borderRadius: '8px 8px 0 0', textTransform: 'uppercase' }}>Announcement</div>
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '16px', fontSize: '13px', lineHeight: 1.8, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{content}</div>
          </div>
        )}

        {type === 'memo' && (
          <div style={{ margin: '0 18px 14px' }}>
            <div style={{ background: 'linear-gradient(135deg, #1a3a6b, #2d5aa0)', color: '#fff', textAlign: 'center', padding: '10px 16px', fontWeight: 900, fontSize: '16px', letterSpacing: '4px', borderRadius: '8px 8px 0 0', textTransform: 'uppercase' }}>MEMO</div>
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '16px', fontSize: '13px', lineHeight: 1.8, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{content}</div>
          </div>
        )}

        {type === 'post' && (
          <>
            {content && (
              <div style={{ padding: '0 18px', marginBottom: image ? '12px' : '4px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {displayedContent}
                </p>
                {isLong && (
                  <button onClick={() => setExpanded(p => !p)} style={{ marginTop: '6px', background: 'none', border: 'none', color: 'var(--primary)', fontSize: '13px', fontWeight: 700, cursor: 'pointer', padding: 0, fontFamily: "'Nunito', sans-serif" }}>
                    {expanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            )}
            {/* Feature 1: clickable image opens lightbox */}
            <PostImage src={image} onTap={openImageLightbox} />
          </>
        )}

        {/* REACTION SUMMARY */}
        {totalReactions > 0 && (
          <div style={{ padding: '8px 18px 4px' }}>
            <ReactionSummary reactions={reactions} myReaction={myReaction} />
          </div>
        )}

        {/* FOOTER */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '10px 18px 14px', borderTop: '1px solid var(--border)' }}>

          {/* React button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowPicker(p => !p)}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 14px',
                borderRadius: '20px', border: `1px solid ${myReaction ? 'var(--primary-pale)' : 'var(--border)'}`,
                background: myReaction ? 'var(--primary-pale)' : 'var(--surface-2)',
                cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'Nunito', sans-serif",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = myReaction ? 'var(--primary-pale)' : 'var(--border)'}
            >
              {myReaction
                ? <span style={{ fontSize: '18px', lineHeight: 1 }}>{myReaction}</span>
                : <MdOutlineAddReaction size={20} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
              }
              <span style={{ fontSize: '13px', fontWeight: 600, color: myReaction ? 'var(--primary)' : 'var(--text-secondary)' }}>
                {myReaction ? 'Reacted' : 'React'}
              </span>
            </button>

            {showPicker && (
              <div style={{
                position: 'absolute', bottom: '46px', left: '0',
                background: 'rgba(25,25,25,0.93)', backdropFilter: 'blur(12px)',
                borderRadius: '50px', padding: '10px 16px',
                display: 'flex', gap: '2px', alignItems: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.1)',
                zIndex: 50, whiteSpace: 'nowrap',
              }}>
                {REACTIONS.map(r => (
                  <button key={r.emoji} onClick={() => handleReaction(r.emoji)} title={r.label}
                    style={{
                      fontSize: '26px', cursor: 'pointer', padding: '4px 6px', borderRadius: '50%',
                      border: 'none', background: myReaction === r.emoji ? 'rgba(255,255,255,0.2)' : 'none',
                      transition: 'transform 0.15s ease', lineHeight: 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.45)'}
                    onMouseLeave={e => e.currentTarget.style.transform = myReaction === r.emoji ? 'scale(1.2)' : 'scale(1)'}
                  >{r.emoji}</button>
                ))}
              </div>
            )}
          </div>

          {/* Comment button — Feature 10: count live-updates via prop */}
          <button
            onClick={() => onComment && onComment(id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 14px',
              borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--surface-2)',
              cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'Nunito', sans-serif",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-pale)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <FaRegCommentDots size={18} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {commentCount > 0 ? commentCount : 'Comment'}
            </span>
          </button>

          {/* Share button */}
          <button
            onClick={() => setShowShare(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 14px',
              borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--surface-2)',
              cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'Nunito', sans-serif",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-pale)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <CiLocationArrow1 size={18} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Share</span>
          </button>

        </div>
      </div>
    </>
  );
}