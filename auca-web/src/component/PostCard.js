import React, { useState } from 'react';
import { MdOutlineAddReaction } from 'react-icons/md';
import { FaRegCommentDots }     from 'react-icons/fa';
import { FiTrash2 }             from 'react-icons/fi';

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

// ── LinkedIn-style stacked emoji summary ──────────────────────────────────────
function ReactionSummary({ reactions, myReaction }) {
  const total = Object.values(reactions).reduce((a, b) => a + b, 0);
  if (total === 0 && !myReaction) return null;

  const allEmojis = Object.entries(reactions)
    .sort((a, b) => b[1] - a[1])
    .map(([e]) => e);

  if (myReaction && !allEmojis.includes(myReaction)) {
    allEmojis.unshift(myReaction);
  } else if (myReaction && allEmojis[0] !== myReaction) {
    const idx = allEmojis.indexOf(myReaction);
    if (idx > 0) allEmojis.splice(idx, 1);
    allEmojis.unshift(myReaction);
  }

  const topEmojis = allEmojis.slice(0, 3);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {topEmojis.map((emoji, index) => (
          <div key={emoji} style={{
            width: '22px', height: '22px', borderRadius: '50%',
            background: 'var(--surface-2)', border: '2px solid var(--surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', marginLeft: index === 0 ? '0' : '-8px',
            zIndex: topEmojis.length - index, position: 'relative',
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          }}>
            {emoji}
          </div>
        ))}
      </div>
      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
        {total}
      </span>
    </div>
  );
}

// ── PostCard ──────────────────────────────────────────────────────────────────
export default function PostCard({ post, onDelete, onComment }) {
  const [showPicker, setShowPicker] = useState(false);
  const [myReaction, setMyReaction] = useState(null);
  const [reactions,  setReactions]  = useState(post?.reactions || {});
  const [expanded,   setExpanded]   = useState(false);

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

  const MAX_LENGTH = 200;
  const isLong = content.length > MAX_LENGTH;
  const displayedContent = isLong && !expanded
    ? content.slice(0, MAX_LENGTH) + '...'
    : content;

  return (
    <div
      style={{
        background: 'var(--surface)', borderRadius: '14px', marginBottom: '16px',
        boxShadow: 'var(--shadow)', border: '1px solid var(--border)',
        fontFamily: "'Nunito', sans-serif", overflow: 'hidden',
        transition: 'box-shadow 0.2s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-hover)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}
    >

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px 18px 12px' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%',
          background: avatarColor(author),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: '16px', flexShrink: 0, overflow: 'hidden',
        }}>
          {post?.avatarUrl
            ? <img src={post.avatarUrl} alt={author} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : getInitials(author)
          }
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--primary)' }}>{author}</span>
            {department && (
              <><span style={{ color: 'var(--border)' }}>|</span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{department}</span></>
            )}
            {timestamp && (
              <><span style={{ color: 'var(--border)' }}>•</span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{timestamp}</span></>
            )}
          </div>
          {role && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '1px' }}>{role}</div>}
        </div>

        {/* ── Delete: FiTrash2 from react-icons/fi ── */}
        {isOwner && (
          <button onClick={() => onDelete && onDelete(id)} title="Delete post"
            style={{
              padding: '6px', color: 'var(--text-muted)', background: 'none',
              border: 'none', cursor: 'pointer', borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#e53935'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none';    e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <FiTrash2 size={18} />
          </button>
        )}
      </div>

      {/* ── BODY ── */}
      {type === 'announcement' && (
        <div style={{ margin: '0 18px 14px' }}>
          <div style={{ background: 'linear-gradient(135deg, #0d3b8e, #1a4fa8)', color: '#fff', textAlign: 'center', padding: '10px 16px', fontWeight: 800, fontSize: '14px', letterSpacing: '2.5px', borderRadius: '8px 8px 0 0', textTransform: 'uppercase' }}>
            📢 Announcement
          </div>
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '16px', fontSize: '13px', lineHeight: 1.8, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
            {content}
          </div>
        </div>
      )}

      {type === 'memo' && (
        <div style={{ margin: '0 18px 14px' }}>
          <div style={{ background: 'linear-gradient(135deg, #1a3a6b, #2d5aa0)', color: '#fff', textAlign: 'center', padding: '10px 16px', fontWeight: 900, fontSize: '16px', letterSpacing: '4px', borderRadius: '8px 8px 0 0', textTransform: 'uppercase' }}>
            MEMO
          </div>
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '16px', fontSize: '13px', lineHeight: 1.8, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
            {content}
          </div>
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
                <button onClick={() => setExpanded(p => !p)}
                  style={{ marginTop: '6px', background: 'none', border: 'none', color: 'var(--primary)', fontSize: '13px', fontWeight: 700, cursor: 'pointer', padding: 0, fontFamily: "'Nunito', sans-serif" }}>
                  {expanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          )}
          {image && (
            <div style={{ width: '100%', maxHeight: '480px', overflow: 'hidden', background: 'var(--surface-2)' }}>
              <img src={image} alt="post" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          )}
        </>
      )}

      {/* ── REACTION SUMMARY ── */}
      {totalReactions > 0 && (
        <div style={{ padding: '8px 18px 4px' }}>
          <ReactionSummary reactions={reactions} myReaction={myReaction} />
        </div>
      )}

      {/* ── FOOTER ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        padding: '10px 18px 14px', borderTop: '1px solid var(--border)',
      }}>

        {/* ── React button — MdOutlineAddReaction from react-icons/md ── */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowPicker(p => !p)}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '7px 14px', borderRadius: '20px',
              border: `1px solid ${myReaction ? 'var(--primary-pale)' : 'var(--border)'}`,
              background: myReaction ? 'var(--primary-pale)' : 'var(--surface-2)',
              cursor: 'pointer', transition: 'all 0.15s',
              fontFamily: "'Nunito', sans-serif",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = myReaction ? 'var(--primary-pale)' : 'var(--border)'; }}
          >
            {myReaction ? (
              <span style={{ fontSize: '18px', lineHeight: 1 }}>{myReaction}</span>
            ) : (
              <MdOutlineAddReaction size={20} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
            )}
            <span style={{ fontSize: '13px', fontWeight: 600, color: myReaction ? 'var(--primary)' : 'var(--text-secondary)' }}>
              {myReaction ? 'Reacted' : 'React'}
            </span>
          </button>

          {/* ── Dark pill emoji picker ── */}
          {showPicker && (
            <div style={{
              position: 'absolute', bottom: '46px', left: '0',
              background: 'rgba(25, 25, 25, 0.93)',
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              borderRadius: '50px', padding: '10px 16px',
              display: 'flex', gap: '2px', alignItems: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
              border: '1px solid rgba(255,255,255,0.1)',
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
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Comment button — FaRegCommentDots from react-icons/fa ── */}
        <button
          onClick={() => onComment && onComment(id)}
          style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '7px 14px', borderRadius: '20px',
            border: '1px solid var(--border)', background: 'var(--surface-2)',
            cursor: 'pointer', transition: 'all 0.15s',
            fontFamily: "'Nunito', sans-serif",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-pale)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
        >
          <FaRegCommentDots size={18} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {commentCount > 0 ? commentCount : 'Comment'}
          </span>
        </button>

      </div>
    </div>
  );
}