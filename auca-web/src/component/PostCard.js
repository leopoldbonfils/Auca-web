import React, { useState } from 'react';

// ── Reactions ─────────────────────────────────────────────────────────────────
const REACTIONS = [
  { emoji: '❤️', label: 'Love' },
  { emoji: '😄', label: 'Haha' },
  { emoji: '😂', label: 'Laugh' },
  { emoji: '👍', label: 'Like' },
  { emoji: '💀', label: 'Dead' },
  { emoji: '😡', label: 'Angry' },
  { emoji: '😢', label: 'Sad' },
];

// ── Icons ─────────────────────────────────────────────────────────────────────
const CommentIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────────────────────
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
  return colors[name.charCodeAt(0) % colors.length];
}

// ── PostCard ──────────────────────────────────────────────────────────────────
export default function PostCard({ post, onDelete, onComment }) {
  const [showPicker, setShowPicker] = useState(false);
  const [myReaction, setMyReaction] = useState(null);
  const [reactions,  setReactions]  = useState(post?.reactions || {});

  const {
    id,
    author       = 'Unknown',
    role         = '',
    department   = '',
    timestamp    = '',
    content      = '',
    image        = null,
    type         = 'post',
    commentCount = 0,
    isOwner      = false,
  } = post || {};

  // ── Reaction toggle ──────────────────────────────────────────────────────
  const handleReaction = (emoji) => {
    setShowPicker(false);
    const next = { ...reactions };
    if (myReaction) {
      next[myReaction] = Math.max(0, (next[myReaction] || 1) - 1);
      if (next[myReaction] === 0) delete next[myReaction];
    }
    if (myReaction !== emoji) {
      next[emoji] = (next[emoji] || 0) + 1;
      setMyReaction(emoji);
    } else {
      setMyReaction(null);
    }
    setReactions(next);
  };

  const totalReactions = Object.values(reactions).reduce((a, b) => a + b, 0);
  const topEmojis = Object.entries(reactions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([e]) => e);

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '14px',
        padding: '18px',
        marginBottom: '16px',
        boxShadow: '0 2px 12px rgba(13,59,142,0.07)',
        border: '1px solid #e2e8f0',
        fontFamily: "'Nunito', sans-serif",
        transition: 'box-shadow 0.2s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 24px rgba(13,59,142,0.13)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(13,59,142,0.07)'}
    >

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>

        {/* Avatar */}
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%',
          background: avatarColor(author),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: '16px',
          flexShrink: 0, overflow: 'hidden',
        }}>
          {post?.avatarUrl
            ? <img src={post.avatarUrl} alt={author} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : getInitials(author)
          }
        </div>

        {/* Name row */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: '14px', color: '#0d3b8e' }}>{author}</span>
            {department && (
              <>
                <span style={{ color: '#cbd5e1' }}>|</span>
                <span style={{ fontSize: '12px', color: '#5a6a82' }}>{department}</span>
              </>
            )}
            {timestamp && (
              <>
                <span style={{ color: '#cbd5e1' }}>·</span>
                <span style={{ fontSize: '12px', color: '#5a6a82' }}>{timestamp}</span>
              </>
            )}
          </div>
          {role && <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '1px' }}>{role}</div>}
        </div>

        {/* Delete (owner only) */}
        {isOwner && (
          <button
            onClick={() => onDelete && onDelete(id)}
            title="Delete post"
            style={{
              padding: '6px', color: '#94a3b8', background: 'none',
              border: 'none', cursor: 'pointer', borderRadius: '6px', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#e53935'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none';    e.currentTarget.style.color = '#94a3b8'; }}
          >
            <TrashIcon />
          </button>
        )}
      </div>

      {/* ── BODY ── */}

      {type === 'announcement' && (
        <div style={{ marginBottom: '14px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0d3b8e, #1a4fa8)',
            color: '#fff', textAlign: 'center', padding: '10px 16px',
            fontWeight: 800, fontSize: '14px', letterSpacing: '2.5px',
            borderRadius: '8px 8px 0 0', textTransform: 'uppercase',
          }}>
            📢 Announcement
          </div>
          <div style={{
            background: '#f8faff', border: '1px solid #e2e8f0', borderTop: 'none',
            borderRadius: '0 0 8px 8px', padding: '16px',
            fontSize: '13px', lineHeight: 1.8, color: '#1e293b', whiteSpace: 'pre-wrap',
          }}>
            {content}
          </div>
        </div>
      )}

      {type === 'memo' && (
        <div style={{ marginBottom: '14px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a3a6b, #2d5aa0)',
            color: '#fff', textAlign: 'center', padding: '10px 16px',
            fontWeight: 900, fontSize: '16px', letterSpacing: '4px',
            borderRadius: '8px 8px 0 0', textTransform: 'uppercase',
          }}>
            MEMO
          </div>
          <div style={{
            background: '#fff', border: '1px solid #e2e8f0', borderTop: 'none',
            borderRadius: '0 0 8px 8px', padding: '16px',
            fontSize: '13px', lineHeight: 1.8, color: '#1e293b', whiteSpace: 'pre-wrap',
          }}>
            {content}
          </div>
        </div>
      )}

      {type === 'post' && (
        <>
          {content && (
            <p style={{
              fontSize: '14px', color: '#1e293b', lineHeight: 1.65,
              marginBottom: '14px', whiteSpace: 'pre-wrap',
            }}>
              {content}
            </p>
          )}
          {image && (
            <div style={{ borderRadius: '10px', overflow: 'hidden', marginBottom: '14px', maxHeight: '380px' }}>
              <img src={image} alt="post" style={{ width: '100%', objectFit: 'cover' }} />
            </div>
          )}
        </>
      )}

      {/* ── FOOTER ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        paddingTop: '12px', borderTop: '1px solid #f1f5f9',
      }}>

        {/* Reaction button + dark pill picker */}
        <div style={{ position: 'relative' }}>

          <button
            onClick={() => setShowPicker(p => !p)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '20px',
              border: `1px solid ${myReaction ? '#0d3b8e33' : '#e2e8f0'}`,
              background: myReaction ? '#e8f0fe' : '#f8faff',
              cursor: 'pointer', transition: 'all 0.15s',
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            <span style={{ fontSize: '18px' }}>{myReaction || '😊'}</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: myReaction ? '#0d3b8e' : '#5a6a82' }}>
              {totalReactions > 0 ? totalReactions : 'React'}
            </span>
          </button>

          {/* ── Dark pill ── */}
          {showPicker && (
            <div style={{
              position: 'absolute',
              bottom: '46px',
              left: '0',
              background: 'rgba(25, 25, 25, 0.93)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: '50px',
              padding: '10px 16px',
              display: 'flex',
              gap: '2px',
              alignItems: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
              border: '1px solid rgba(255,255,255,0.1)',
              zIndex: 50,
              whiteSpace: 'nowrap',
            }}>
              {REACTIONS.map(r => (
                <button
                  key={r.emoji}
                  onClick={() => handleReaction(r.emoji)}
                  title={r.label}
                  style={{
                    fontSize: '26px',
                    cursor: 'pointer',
                    padding: '4px 6px',
                    borderRadius: '50%',
                    border: 'none',
                    background: myReaction === r.emoji
                      ? 'rgba(255,255,255,0.22)'
                      : 'none',
                    transition: 'transform 0.15s ease, background 0.15s ease',
                    lineHeight: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.45)'}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform =
                      myReaction === r.emoji ? 'scale(1.2)' : 'scale(1)';
                  }}
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Comment button */}
        <button
          onClick={() => onComment && onComment(id)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', borderRadius: '20px',
            border: '1px solid #e2e8f0', background: '#f8faff',
            cursor: 'pointer', fontSize: '13px', fontWeight: 600,
            color: '#5a6a82', transition: 'all 0.15s',
            fontFamily: "'Nunito', sans-serif",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#e8f0fe';
            e.currentTarget.style.color = '#0d3b8e';
            e.currentTarget.style.borderColor = '#0d3b8e33';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#f8faff';
            e.currentTarget.style.color = '#5a6a82';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }}
        >
          <CommentIcon />
          <span>{commentCount > 0 ? commentCount : 'Comment'}</span>
        </button>

        {/* Reaction summary */}
        {totalReactions > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            fontSize: '12px', color: '#5a6a82', marginLeft: 'auto',
          }}>
            <span style={{ fontSize: '14px' }}>{topEmojis.join('')}</span>
            <span>{totalReactions}</span>
          </div>
        )}

      </div>
    </div>
  );
}