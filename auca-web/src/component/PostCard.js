import React, { useState, useRef, useEffect } from 'react';
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
import {
  BsFilePdf, BsFileWord, BsFileExcel,
  BsFilePpt, BsFileZip, BsFileEarmark,
} from 'react-icons/bs';
import { MdDownload, MdOpenInNew } from 'react-icons/md';

// ─── Reactions ────────────────────────────────────────────────────────────────
const REACTIONS = [
  { emoji: '❤️', label: 'Love' },
  { emoji: '😄', label: 'Haha' },
  { emoji: '😂', label: 'Laugh' },
  { emoji: '👍', label: 'Like' },
  { emoji: '💀', label: 'Dead' },
  { emoji: '😡', label: 'Angry' },
  { emoji: '😢', label: 'Sad' },
];

// ─── Share platforms ─────────────────────────────────────────────────────────
const SHARE_PLATFORMS = [
  { label: 'Email',     icon: <MdEmail size={22} color="#fff" />,         bg: '#757575', action: (url) => window.open(`mailto:?subject=Check this out&body=${encodeURIComponent(url)}`) },
  { label: 'WhatsApp',  icon: <FaWhatsapp size={22} color="#fff" />,      bg: '#25D366', action: (url) => window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, '_blank') },
  { label: 'X',         icon: <FaXTwitter size={22} color="#fff" />,      bg: '#000',    action: (url) => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`, '_blank') },
  { label: 'Instagram', icon: <IoLogoInstagram size={22} color="#fff" />, bg: '#E4405F', action: (url) => window.open(`https://www.instagram.com/?url=${encodeURIComponent(url)}`, '_blank') },
  { label: 'Facebook',  icon: <FaFacebook size={22} color="#fff" />,      bg: '#1877F2', action: (url) => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank') },
  { label: 'Embed',     icon: <MdOutlineCode size={22} color="#fff" />,   bg: '#606060', action: (url) => alert(`Embed code:\n<iframe src="${url}"></iframe>`) },
];

// ─── File-type helpers ────────────────────────────────────────────────────────
function getFileCategory(fileType, mimeType = '') {
  const ext = (fileType || '').toLowerCase().replace('.', '');
  const mime = (mimeType || '').toLowerCase();

  if (ext === 'pdf' || mime.includes('pdf'))                                   return 'pdf';
  if (['doc','docx'].includes(ext) || mime.includes('word'))                   return 'word';
  if (['xls','xlsx'].includes(ext) || mime.includes('excel') || mime.includes('spreadsheet')) return 'excel';
  if (['ppt','pptx'].includes(ext) || mime.includes('powerpoint') || mime.includes('presentation')) return 'ppt';
  if (['zip','rar','7z'].includes(ext) || mime.includes('zip'))               return 'zip';
  if (['png','jpg','jpeg','gif','webp'].includes(ext) || mime.startsWith('image/')) return 'image';
  return 'file';
}

const FILE_STYLE = {
  pdf:   { icon: <BsFilePdf   size={36} />, color: '#e53935', bg: '#ffeaea', label: 'PDF'  },
  word:  { icon: <BsFileWord  size={36} />, color: '#1565c0', bg: '#e3f2fd', label: 'DOC'  },
  excel: { icon: <BsFileExcel size={36} />, color: '#2e7d32', bg: '#e8f5e9', label: 'XLS'  },
  ppt:   { icon: <BsFilePpt   size={36} />, color: '#e65100', bg: '#fff3e0', label: 'PPT'  },
  zip:   { icon: <BsFileZip   size={36} />, color: '#6a1b9a', bg: '#f3e5f5', label: 'ZIP'  },
  file:  { icon: <BsFileEarmark size={36} />, color: '#546e7a', bg: '#eceff1', label: 'FILE' },
};

function formatFileSize(bytes) {
  if (!bytes) return '';
  const n = Number(bytes);
  if (isNaN(n)) return bytes; // already a formatted string from server
  if (n === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(n) / Math.log(1024));
  return `${(n / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function getFileName(url, fileType) {
  if (!url) return `file${fileType || ''}`;
  try {
    const parts = url.split('/');
    const raw = parts[parts.length - 1].split('?')[0];
    return raw || `file${fileType || ''}`;
  } catch {
    return `file${fileType || ''}`;
  }
}

// ─── File Card (non-PDF) ─────────────────────────────────────────────────────
function FileCard({ fileUrl, fileType, fileSize, mimeType, fileName }) {
  const category = getFileCategory(fileType, mimeType);
  const style    = FILE_STYLE[category] || FILE_STYLE.file;
  const name     = fileName || getFileName(fileUrl, fileType);
  const size     = formatFileSize(fileSize);
  const extLabel = style.label;

  const openFile = () => { if (fileUrl) window.open(fileUrl, '_blank'); };

  return (
    <div
      onClick={openFile}
      title="Click to open file"
      style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: '14px 16px', margin: '10px 18px',
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: '12px', cursor: fileUrl ? 'pointer' : 'default',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { if (fileUrl) { e.currentTarget.style.background = style.bg; e.currentTarget.style.borderColor = style.color + '55'; } }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      {/* Icon */}
      <div style={{
        width: '52px', height: '52px', borderRadius: '10px',
        background: style.bg, color: style.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {style.icon}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {name}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
          {[size, extLabel, 'Open'].filter(Boolean).join(' · ')}
        </div>
      </div>

      {/* Open icon */}
      {fileUrl && (
        <div style={{ color: style.color, flexShrink: 0 }}>
          <MdOpenInNew size={20} />
        </div>
      )}
    </div>
  );
}

// ─── PDF Card with thumbnail preview ─────────────────────────────────────────
function PdfCard({ fileUrl, thumbnailUrl, fileSize, fileName }) {
  const [thumbBroken, setThumbBroken] = useState(false);
  const name = fileName || getFileName(fileUrl, '.pdf');
  const size = formatFileSize(fileSize);

  const openFile     = () => { if (fileUrl) window.open(fileUrl, '_blank'); };
  const downloadFile = () => {
    if (!fileUrl) return;
    const a = document.createElement('a');
    a.href     = fileUrl;
    a.download = name;
    a.target   = '_blank';
    a.click();
  };

  const hasThumbnail = thumbnailUrl && !thumbBroken;

  return (
    <div style={{ margin: '10px 18px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface-2)' }}>

      {/* Thumbnail (if available) */}
      {hasThumbnail && (
        <div style={{ position: 'relative', background: '#111', maxHeight: '200px', overflow: 'hidden' }}>
          <img
            src={thumbnailUrl}
            alt="pdf preview"
            onError={() => setThumbBroken(true)}
            style={{ width: '100%', objectFit: 'cover', display: 'block', opacity: 0.85 }}
          />
          {/* Overlay PDF badge */}
          <div style={{
            position: 'absolute', top: '10px', left: '10px',
            background: '#e53935', color: '#fff', fontWeight: 800,
            fontSize: '11px', padding: '3px 8px', borderRadius: '6px',
            letterSpacing: '0.5px',
          }}>PDF</div>
        </div>
      )}

      {/* Row with icon + info + buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px' }}>
        {/* PDF icon (shown when no thumbnail) */}
        {!hasThumbnail && (
          <div style={{
            width: '48px', height: '48px', borderRadius: '10px',
            background: '#ffeaea', color: '#e53935', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BsFilePdf size={32} />
          </div>
        )}

        {/* File info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {name}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {[size, 'PDF'].filter(Boolean).join(' · ')}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          {fileUrl && (
            <button
              onClick={downloadFile}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '7px 12px', borderRadius: '8px', border: 'none',
                background: '#1565c0', color: '#fff', cursor: 'pointer',
                fontSize: '12px', fontWeight: 700, fontFamily: 'inherit',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#0d47a1'}
              onMouseLeave={e => e.currentTarget.style.background = '#1565c0'}
            >
              <MdDownload size={16} /> Download
            </button>
          )}
          {fileUrl && (
            <button
              onClick={openFile}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '7px 12px', borderRadius: '8px',
                border: '1px solid var(--border)', background: 'var(--surface)',
                color: 'var(--text-secondary)', cursor: 'pointer',
                fontSize: '12px', fontWeight: 700, fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              Open
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Share modal ──────────────────────────────────────────────────────────────
function ShareModal({ postUrl, onClose }) {
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);
  const handleCopy = () => {
    navigator.clipboard.writeText(postUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
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

// ─── Post image (graceful broken-image handling) ──────────────────────────────
function PostImage({ src }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => { setBroken(false); }, [src]);
  if (!src || broken) return null;
  return (
    <div style={{ width: '100%', maxHeight: '480px', overflow: 'hidden', background: 'var(--surface-2)', borderRadius: '4px' }}>
      <img
        src={src}
        alt="post"
        onError={() => setBroken(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        crossOrigin="anonymous"
      />
    </div>
  );
}

// ─── Author avatar ────────────────────────────────────────────────────────────
function AuthorAvatar({ avatarUrl, author }) {
  const [imgBroken, setImgBroken] = useState(false);
  useEffect(() => { setImgBroken(false); }, [avatarUrl]);
  const showImage = avatarUrl && !imgBroken;
  return (
    <div style={{
      width: '44px', height: '44px', borderRadius: '50%',
      background: showImage ? 'transparent' : avatarColor(author),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 800, fontSize: '16px', flexShrink: 0, overflow: 'hidden',
    }}>
      {showImage
        ? <img src={avatarUrl} alt={author} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={() => setImgBroken(true)} />
        : getInitials(author)
      }
    </div>
  );
}

// ─── Emoji reaction summary ───────────────────────────────────────────────────
function ReactionSummary({ reactions, myReaction }) {
  const total = Object.values(reactions).reduce((a, b) => a + b, 0);
  if (total === 0 && !myReaction) return null;
  const allEmojis = Object.entries(reactions).sort((a, b) => b[1] - a[1]).map(([e]) => e);
  if (myReaction && !allEmojis.includes(myReaction)) allEmojis.unshift(myReaction);
  const topEmojis = allEmojis.slice(0, 3);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {topEmojis.map((emoji, index) => (
          <div key={emoji} style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--surface-2)', border: '2px solid var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', marginLeft: index === 0 ? '0' : '-8px', zIndex: topEmojis.length - index, position: 'relative', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}>{emoji}</div>
        ))}
      </div>
      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{total}</span>
    </div>
  );
}

// ─── PostCard ─────────────────────────────────────────────────────────────────
export default function PostCard({ post, onDelete, onComment }) {
  const [showPicker, setShowPicker] = useState(false);
  const [myReaction, setMyReaction] = useState(null);
  const [reactions,  setReactions]  = useState(post?.reactions || {});
  const [expanded,   setExpanded]   = useState(false);
  const [showShare,  setShowShare]  = useState(false);

  const {
    id, author = 'Unknown', role = '', department = '',
    timestamp = '', content = '', image = null,
    type = 'post', commentCount = 0, isOwner = false,
  } = post || {};

  // ── File fields from the raw backend post ─────────────────────────────────
  const raw       = post?._raw || {};
  const fileType  = raw.FileType  || null;   // '.pdf', '.docx', '.xlsx', …
  const mimeType  = raw.MimeType  || '';
  const fullUrl   = raw.FullUrl   || null;
  const thumbUrl  = raw.ThumbnailUrl || null;
  const fileSize  = raw.FileSize  || null;

  // Determine what kind of attachment we have
  const fileCategory = fileType ? getFileCategory(fileType, mimeType) : null;
  const isImage      = fileCategory === 'image';
  const isPdf        = fileCategory === 'pdf';
  const isOtherFile  = fileCategory && fileCategory !== 'image';

  const postUrl = `https://auca-hub.ac.rw/posts/${id}`;

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
  const displayedContent = isLong && !expanded ? content.slice(0, MAX_LENGTH) + '...' : content;

  return (
    <>
      {showShare && <ShareModal postUrl={postUrl} onClose={() => setShowShare(false)} />}

      <div
        style={{ background: 'var(--surface)', borderRadius: '6px', marginBottom: '3px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)', fontFamily: "'Nunito', sans-serif", overflow: 'hidden', transition: 'box-shadow 0.2s ease' }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-hover)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}
      >

        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px 18px 12px' }}>
          <AuthorAvatar avatarUrl={post?.avatarUrl} author={author} />
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
              style={{ padding: '6px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
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
            {/* Description */}
            {content && (
              <div style={{ padding: '0 18px', marginBottom: (image || fullUrl) ? '4px' : '4px' }}>
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

            {/* ── Attachment rendering ───────────────────────────────────── */}

            {/* Image (uses resolved `image` prop from mapPost) */}
            {isImage && image && <PostImage src={image} />}

            {/* PDF with thumbnail + Download/Open buttons */}
            {isPdf && fullUrl && (
              <PdfCard
                fileUrl={fullUrl}
                thumbnailUrl={thumbUrl}
                fileSize={fileSize}
                fileName={getFileName(fullUrl, fileType)}
              />
            )}

            {/* DOC / DOCX / XLS / XLSX / PPT / ZIP / other */}
            {isOtherFile && !isPdf && fullUrl && (
              <FileCard
                fileUrl={fullUrl}
                fileType={fileType}
                fileSize={fileSize}
                mimeType={mimeType}
                fileName={getFileName(fullUrl, fileType)}
              />
            )}
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

          {/* React */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowPicker(p => !p)}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 14px', borderRadius: '20px', border: `1px solid ${myReaction ? 'var(--primary-pale)' : 'var(--border)'}`, background: myReaction ? 'var(--primary-pale)' : 'var(--surface-2)', cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'Nunito', sans-serif" }}
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
              <div style={{ position: 'absolute', bottom: '46px', left: '0', background: 'rgba(25,25,25,0.93)', backdropFilter: 'blur(12px)', borderRadius: '50px', padding: '10px 16px', display: 'flex', gap: '2px', alignItems: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.1)', zIndex: 50, whiteSpace: 'nowrap' }}>
                {REACTIONS.map(r => (
                  <button key={r.emoji} onClick={() => handleReaction(r.emoji)} title={r.label}
                    style={{ fontSize: '26px', cursor: 'pointer', padding: '4px 6px', borderRadius: '50%', border: 'none', background: myReaction === r.emoji ? 'rgba(255,255,255,0.2)' : 'none', transition: 'transform 0.15s ease', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.45)'}
                    onMouseLeave={e => e.currentTarget.style.transform = myReaction === r.emoji ? 'scale(1.2)' : 'scale(1)'}
                  >{r.emoji}</button>
                ))}
              </div>
            )}
          </div>

          {/* Comment */}
          <button
            onClick={() => onComment && onComment(id)}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 14px', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--surface-2)', cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'Nunito', sans-serif" }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-pale)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <FaRegCommentDots size={18} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {commentCount > 0 ? commentCount : 'Comment'}
            </span>
          </button>

          {/* Share */}
          <button
            onClick={() => setShowShare(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 14px', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--surface-2)', cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'Nunito', sans-serif" }}
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