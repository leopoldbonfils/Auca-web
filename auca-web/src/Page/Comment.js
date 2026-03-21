import React, { useState, useRef, useEffect } from 'react';
import { IoArrowBack }              from 'react-icons/io5';
import { BiLike, BiDislike }        from 'react-icons/bi';
import { BiSolidLike, BiSolidDislike } from 'react-icons/bi';
import { BsThreeDotsVertical }      from 'react-icons/bs';

// ── Sample comments ───────────────────────────────────────────────────────────
const SAMPLE_COMMENTS = [
  { id: 1, username: 'alex_01',     avatar: 'https://i.pravatar.cc/150?img=12', text: 'This is an awesome photo!',    likes: 2,  time: '1h ago',  liked: false, disliked: false },
  { id: 2, username: 'sophia_22',   avatar: 'https://i.pravatar.cc/150?img=47', text: 'Wow, so beautiful! 😍',         likes: 5,  time: '30m ago', liked: false, disliked: false },
  { id: 3, username: 'kim_travels', avatar: 'https://i.pravatar.cc/150?img=25', text: 'Goals! 🌅 Where is this?',     likes: 8,  time: '22m ago', liked: false, disliked: false },
  { id: 4, username: 'marco_v',     avatar: 'https://i.pravatar.cc/150?img=33', text: 'Absolutely stunning 🔥',        likes: 3,  time: '18m ago', liked: false, disliked: false },
  { id: 5, username: 'nora_p',      avatar: 'https://i.pravatar.cc/150?img=44', text: 'I need to visit Rwanda ASAP!', likes: 6,  time: '5m ago',  liked: false, disliked: false },
  { id: 6, username: 'dave_k',      avatar: 'https://i.pravatar.cc/150?img=59', text: 'Love the energy here! ❤️',     likes: 194,time: '4 years ago', liked: false, disliked: false },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}
function avatarBg(name = '') {
  const c = [
    'linear-gradient(135deg,#0d3b8e,#1a4fa8)',
    'linear-gradient(135deg,#7c3aed,#a855f7)',
    'linear-gradient(135deg,#059669,#34d399)',
    'linear-gradient(135deg,#dc2626,#f87171)',
    'linear-gradient(135deg,#d97706,#fbbf24)',
  ];
  return c[(name.charCodeAt(0) || 0) % c.length];
}

// ── Three-dot menu ────────────────────────────────────────────────────────────
function ThreeDotMenu({ onDelete, onReport }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px',
          borderRadius: '50%', color: 'var(--text-muted)', display: 'flex',
          alignItems: 'center', transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <BsThreeDotsVertical size={15} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '110%',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 100, minWidth: '130px',
          overflow: 'hidden',
          animation: 'fadeIn 0.12s ease',
        }}>
          <button
            onClick={() => { onDelete(); setOpen(false); }}
            style={{
              width: '100%', padding: '10px 16px', background: 'none', border: 'none',
              cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              color: '#e53935', textAlign: 'left', fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            🗑 Delete
          </button>
          <button
            onClick={() => { onReport(); setOpen(false); }}
            style={{
              width: '100%', padding: '10px 16px', background: 'none', border: 'none',
              cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              color: 'var(--text-secondary)', textAlign: 'left', fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            🚩Report
          </button>
        </div>
      )}
    </div>
  );
}

// ── Single comment row  (YouTube layout) ─────────────────────────────────────
function CommentRow({ c, onLike, onDislike, onDelete }) {
  const [showReply, setShowReply] = useState(false);
  const [reply,     setReply]     = useState('');
  const [showReplies, setShowReplies] = useState(false);

  const handleReport = () => alert(`Reported @${c.username}`);

  return (
    <div style={{ display: 'flex', gap: '12px', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>

      {/* Avatar */}
      <img src={c.avatar} alt={c.username}
        style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, marginTop: 2 }} />

      {/* Right column */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* ── ROW 1: name · time ··· */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
          <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
            {c.username}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.time}</span>
          <div style={{ marginLeft: 'auto' }}>
            <ThreeDotMenu onDelete={() => onDelete(c.id)} onReport={handleReport} />
          </div>
        </div>

        {/* ── ROW 2: Comment text */}
        <div style={{ fontSize: '14px', lineHeight: 1.55, color: 'var(--text-secondary)', marginBottom: '10px', wordBreak: 'break-word' }}>
          {c.text}
        </div>

        {/* ── ROW 3: 👍 count 👎  Reply */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>

          {/* Thumbs up */}
          <button
            onClick={() => onLike(c.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: 'none', border: 'none', cursor: 'pointer', padding: '5px 10px',
              borderRadius: '20px', color: c.liked ? 'var(--primary)' : 'var(--text-muted)',
              fontFamily: 'inherit', fontSize: '13px', fontWeight: 600, transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            {c.liked
              ? <BiSolidLike size={16} />
              : <BiLike size={16} />
            }
            {c.likes > 0 && <span>{c.likes}</span>}
          </button>

          {/* Thumbs down */}
          <button
            onClick={() => onDislike(c.id)}
            style={{
              display: 'flex', alignItems: 'center',
              background: 'none', border: 'none', cursor: 'pointer', padding: '5px 10px',
              borderRadius: '20px', color: c.disliked ? '#e53935' : 'var(--text-muted)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            {c.disliked
              ? <BiSolidDislike size={16} />
              : <BiDislike size={16} />
            }
          </button>

          {/* Reply button */}
          <button
            onClick={() => setShowReply(p => !p)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '5px 12px', borderRadius: '20px',
              fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)',
              fontFamily: 'inherit', transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            Reply
          </button>
        </div>

        {/* Replies toggle */}
        {c.replyCount > 0 && (
          <button
            onClick={() => setShowReplies(p => !p)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '6px 10px', borderRadius: '20px', marginTop: '4px',
              fontSize: '13px', fontWeight: 700, color: 'var(--primary)',
              fontFamily: 'inherit', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-pale)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            {showReplies ? '▲' : '▼'} {c.replyCount} replies
          </button>
        )}

        {/* Reply input */}
        {showReply && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
            <img src="https://i.pravatar.cc/150?img=68" alt="you"
              style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            <input
              autoFocus
              value={reply}
              onChange={e => setReply(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && reply.trim()) { setReply(''); setShowReply(false); }}}
              placeholder={`Reply to ${c.username}...`}
              style={{
                flex: 1, border: 'none', borderBottom: '2px solid var(--primary)',
                outline: 'none', fontSize: 13, padding: '4px 0',
                fontFamily: 'inherit', background: 'transparent', color: 'var(--text-primary)',
              }}
            />
            {reply.trim() && (
              <button onClick={() => { setReply(''); setShowReply(false); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: 'var(--primary)', fontFamily: 'inherit', padding: 0 }}>
                Post
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Comment page ──────────────────────────────────────────────────────────────
export default function Comment({ post, onBack }) {
  const [comments, setComments] = useState(SAMPLE_COMMENTS);
  const [input,    setInput]    = useState('');
  const bottomRef = useRef(null);

  const p          = post || {};
  const totalLikes = Object.values(p.reactions || {}).reduce((a, b) => a + b, 0);

  const handleLike = (id) =>
    setComments(prev => prev.map(c =>
      c.id === id ? { ...c, liked: !c.liked, disliked: false, likes: c.liked ? c.likes - 1 : c.likes + 1 } : c
    ));

  const handleDislike = (id) =>
    setComments(prev => prev.map(c =>
      c.id === id ? { ...c, disliked: !c.disliked, liked: false, likes: c.liked ? c.likes - 1 : c.likes } : c
    ));

  const handleDelete = (id) =>
    setComments(prev => prev.filter(c => c.id !== id));

  const handlePost = () => {
    if (!input.trim()) return;
    setComments(prev => [...prev, {
      id: Date.now(), username: 'you',
      avatar: 'https://i.pravatar.cc/150?img=68',
      text: input.trim(), likes: 0, time: 'now', liked: false, disliked: false,
    }]);
    setInput('');
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  return (
    <>
      {/* Keyframe for menu fade-in */}
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }`}</style>

      <div style={{
        maxWidth: '600px', margin: '0 auto',
        fontFamily: "'Nunito', -apple-system, sans-serif",
        background: 'var(--surface)', borderRadius: '16px',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
        display: 'flex', flexDirection: 'column',
        minHeight: 'calc(100vh - 80px)',
      }}>

        {/* ── HEADER ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '14px 16px', borderBottom: '1px solid var(--border)',
          background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 10,
        }}>
          <button onClick={onBack}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 6,
              borderRadius: '50%', display: 'flex', alignItems: 'center',
              color: 'var(--text-primary)', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <IoArrowBack size={22} />
          </button>
          <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Comments</span>
          <span style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--text-muted)' }}>
            {comments.length} comment{comments.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ── POST PREVIEW ── */}
        {p.author && (
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>

            {/* Author row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{
                width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                background: avatarBg(p.author), color: '#fff', fontWeight: 800, fontSize: '13px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 0 2px var(--surface), 0 0 0 3.5px #e1306c',
              }}>
                {p.avatarUrl
                  ? <img src={p.avatarUrl} alt={p.author} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  : initials(p.author)
                }
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{p.author}</div>
                {(p.department || p.timestamp) && (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {[p.department, p.timestamp].filter(Boolean).join(' · ')}
                  </div>
                )}
              </div>
            </div>

            {p.content && (
              <div style={{ fontSize: '15px', lineHeight: 1.6, marginBottom: '13px', color: 'var(--text-primary)' }}>
                <span style={{ color: 'var(--text-primary)' }}>{p.content}</span>
              </div>
            )}

            {/* Image first */}
            {p.image && (
              <div style={{ width: '100%', borderRadius: '10px', overflow: 'hidden', marginBottom: '12px', background: 'var(--surface-2)' }}>
                <img src={p.image} alt="post" style={{ width: '100%', display: 'block', objectFit: 'cover', maxHeight: '320px' }} />
              </div>
            )}

            {/* Likes count */}
            {totalLikes > 0 && (
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                {totalLikes.toLocaleString()} likes
              </div>
            )}

            {/* Caption */}
            
          </div>
        )}

        {/* ── COMMENTS LIST ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px', maxHeight: '480px' }}>
          {comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '32px', marginBottom: 8 }}>💬</div>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>No comments yet</div>
              <div style={{ fontSize: '13px', marginTop: 4 }}>Be the first to comment!</div>
            </div>
          ) : (
            comments.map(c => (
              <CommentRow key={c.id} c={c} onLike={handleLike} onDislike={handleDislike} onDelete={handleDelete} />
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── ADD COMMENT INPUT ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 16px', borderTop: '1px solid var(--border)',
          background: 'var(--surface)', position: 'sticky', bottom: 0,
        }}>
          <img src="https://i.pravatar.cc/150?img=68" alt="you"
            style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePost()}
            placeholder="Add a comment..."
            style={{
              flex: 1, border: 'none', outline: 'none', fontSize: '14px',
              color: 'var(--text-primary)', background: 'transparent', fontFamily: 'inherit',
            }}
          />
          <button
            onClick={handlePost} disabled={!input.trim()}
            style={{
              background: 'none', border: 'none',
              cursor: input.trim() ? 'pointer' : 'default',
              fontSize: '14px', fontWeight: 700,
              color: input.trim() ? 'var(--primary)' : 'var(--text-muted)',
              fontFamily: 'inherit', padding: 0, transition: 'color 0.15s',
            }}
          >
            Post
          </button>
        </div>

      </div>
    </>
  );
}