import React, { useState, useRef } from 'react';
import { IoArrowBack }  from 'react-icons/io5';
import { FaHeart }      from 'react-icons/fa';
import { FaRegHeart }   from 'react-icons/fa';

// ── Sample comments ───────────────────────────────────────────────────────────
const SAMPLE_COMMENTS = [
  { id: 1, username: 'alex_01',     avatar: 'https://i.pravatar.cc/150?img=12', text: 'This is an awesome photo!',    likes: 2, time: '1h ago',  liked: false },
  { id: 2, username: 'sophia_22',   avatar: 'https://i.pravatar.cc/150?img=47', text: 'Wow, so beautiful! 😍',         likes: 5, time: '30m ago', liked: false },
  { id: 3, username: 'kim_travels', avatar: 'https://i.pravatar.cc/150?img=25', text: 'Goals! 🌅 Where is this?',     likes: 8, time: '22m ago', liked: false },
  { id: 4, username: 'marco_v',     avatar: 'https://i.pravatar.cc/150?img=33', text: 'Absolutely stunning 🔥',        likes: 3, time: '18m ago', liked: false },
  { id: 5, username: 'nora_p',      avatar: 'https://i.pravatar.cc/150?img=44', text: 'I need to visit Rwanda ASAP!', likes: 6, time: '5m ago',  liked: false },
  { id: 6, username: 'dave_k',      avatar: 'https://i.pravatar.cc/150?img=59', text: 'Love the energy here! ❤️',     likes: 4, time: '2m ago',  liked: false },
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

// ── Single comment row ────────────────────────────────────────────────────────
function CommentRow({ c, onLike }) {
  const [showReply, setShowReply] = useState(false);
  const [reply,     setReply]     = useState('');

  return (
    <div style={{
      display: 'flex', gap: '12px', padding: '14px 0',
      borderBottom: '1px solid var(--border)',
    }}>

      {/* Avatar */}
      <img src={c.avatar} alt={c.username}
        style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', lineHeight: 1.5 }}>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', marginRight: 6 }}>
            {c.username}
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>{c.text}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: 5 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.time}</span>

          {/* ── Heart icon — react-icons FaHeart / FaRegHeart ── */}
        <button
            onClick={() => onLike(c.id)}
            style={{
            background: 'none', border: 'none', cursor: 'pointer', 
            flexShrink: 0,  marginTop: 4, color: c.liked ? '#ed4956' : 'var(--text-muted)',
            transition: 'transform 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
            {c.liked
            ? <FaHeart    size={13} color="#ed4956" />
            : <FaRegHeart size={13} color="var(--text-muted)" />
            }
        </button>


          {/* Likes count (text only under body) */}
          {c.likes > 0 && (
            
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
              {c.likes} likes
            </span>
          )}

          <button onClick={() => setShowReply(p => !p)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, color: 'var(--text-muted)',
              fontFamily: 'inherit', padding: 0, transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
          >
            Reply
          </button>
        </div>

        {/* Reply input */}
        {showReply && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <input
              autoFocus
              value={reply}
              onChange={e => setReply(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && reply.trim()) { setReply(''); setShowReply(false); }}}
              placeholder={`Reply to ${c.username}...`}
              style={{
                flex: 1, border: 'none', borderBottom: '1px solid var(--border)',
                outline: 'none', fontSize: 13, padding: '4px 0',
                fontFamily: 'inherit', background: 'transparent',
                color: 'var(--text-primary)',
              }}
            />
            {reply.trim() && (
              <button
                onClick={() => { setReply(''); setShowReply(false); }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 700, color: '#0095f6',
                  fontFamily: 'inherit', padding: 0,
                }}
              >
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
      c.id === id
        ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 }
        : c
    ));

  const handlePost = () => {
    if (!input.trim()) return;
    setComments(prev => [...prev, {
      id: Date.now(),
      username: 'you',
      avatar: 'https://i.pravatar.cc/150?img=68',
      text: input.trim(), likes: 0, time: 'now', liked: false,
    }]);
    setInput('');
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      fontFamily: "'Nunito', -apple-system, sans-serif",
      background: 'var(--surface)',
      borderRadius: '16px',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 'calc(100vh - 80px)',
    }}>

      {/* ── HEADER ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '14px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button
          onClick={onBack}
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
        <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Comments
        </span>
        <span style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--text-muted)' }}>
          {comments.length} comment{comments.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── POST PREVIEW ── */}
      {p.author && (
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>

          {/* 1. Author row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
              background: avatarBg(p.author),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: '13px',
              boxShadow: '0 0 0 2px var(--surface), 0 0 0 3.5px #e1306c',
            }}>
              {p.avatarUrl
                ? <img src={p.avatarUrl} alt={p.author}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                : initials(p.author)
              }
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                {p.author}
              </div>
              {(p.department || p.timestamp) && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {[p.department, p.timestamp].filter(Boolean).join(' · ')}
                </div>
              )}
            </div>
          </div>

          {/* 4. Caption — below likes */}
          {p.content && (
            <div style={{ fontSize: '16px', lineHeight: 1.6, marginBottom: '12px', color: 'var(--text-primary)' }}>
              
              <span style={{ color: 'var(--text-primary)' }}>{p.content}</span>
            </div>
          )}

          {/* 2. Post image — comes right after author */}
          {p.image && (
            <div style={{
              width: '100%', borderRadius: '10px', overflow: 'hidden',
              marginBottom: '12px', background: 'var(--surface-2)',
            }}>
              <img src={p.image} alt="post"
                style={{ width: '100%', display: 'block', objectFit: 'cover', maxHeight: '320px' }} />
            </div>
          )}

          {/* 3. Likes count — below image */}
          {totalLikes > 0 && (
            <div style={{
              fontSize: '14px', fontWeight: 700,
              color: 'var(--text-primary)', marginBottom: '6px',
            }}>
              {totalLikes.toLocaleString()} likes
            </div>
          )}

          
        </div>
      )}

      {/* ── COMMENTS LIST (scrollable) ── */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '0 16px',
        maxHeight: '420px',
      }}>
        {comments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '32px', marginBottom: 8 }}>💬</div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>No comments yet</div>
            <div style={{ fontSize: '13px', marginTop: 4 }}>Be the first to comment!</div>
          </div>
        ) : (
          comments.map(c => <CommentRow key={c.id} c={c} onLike={handleLike} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── ADD COMMENT INPUT ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '12px 16px',
        borderTop: '1px solid var(--border)',
        background: 'var(--surface)',
        position: 'sticky', bottom: 0,
      }}>
        <img src="https://i.pravatar.cc/150?img=68" alt="you"
          style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />

        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handlePost()}
          placeholder="Add a comment..."
          style={{
            flex: 1, border: 'none', outline: 'none',
            fontSize: '14px', color: 'var(--text-primary)',
            background: 'transparent', fontFamily: 'inherit',
          }}
        />

        <button
          onClick={handlePost}
          disabled={!input.trim()}
          style={{
            background: 'none', border: 'none',
            cursor: input.trim() ? 'pointer' : 'default',
            fontSize: '14px', fontWeight: 700,
            color: input.trim() ? '#0095f6' : 'var(--text-muted)',
            fontFamily: 'inherit', padding: 0, transition: 'color 0.15s',
          }}
          onMouseEnter={e => { if (input.trim()) e.target.style.color = '#1877f2'; }}
          onMouseLeave={e => { if (input.trim()) e.target.style.color = '#0095f6'; }}
        >
          Post
        </button>
      </div>

    </div>
  );
}