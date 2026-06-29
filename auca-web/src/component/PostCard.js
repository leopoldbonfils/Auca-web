import React, { useState, useRef, useEffect } from 'react';
import { MdOutlineAddReaction } from 'react-icons/md';
import { FaRegCommentDots, FaHandPaper } from 'react-icons/fa';
import { FiTrash2 } from 'react-icons/fi';
import { CiLocationArrow1 } from 'react-icons/ci';
import { IoClose } from 'react-icons/io5';
import { MdOutlineCode } from 'react-icons/md';
import { FaWhatsapp, FaFacebook } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { FaXTwitter } from 'react-icons/fa6';
import { MdContentCopy } from 'react-icons/md';
import { BsCheck2 } from 'react-icons/bs';
import { IoLogoInstagram } from 'react-icons/io5';
import { MdDownload, MdOpenInNew } from 'react-icons/md';
import docIcon from '../assets/doc.png';
import excelIcon from '../assets/excel.png';
import pdfIcon from '../assets/pdf.png';
import pptIcon from '../assets/ppt.png';
import pptxIcon from '../assets/pptx.png';
import rarIcon from '../assets/rar.png';
import zipIcon from '../assets/zip.png';
import fileIcon from '../assets/file.png';
import txtIcon from '../assets/txt.png';
import wordIcon from '../assets/word.png';
import api from '../utils/api';

// ── Academic Reactions (mirrors mobile app's emojiData) ─────────────────────
// Maps emoji character → backend reaction name
const EMOJI_TO_NAME = {
  '👍': 'helpful',
  '✅': 'understood',
  '📌': 'important',
  '❓': 'need_clarification',
};

// Academic reactions matching mobile app exactly
const REACTIONS = [
  { emoji: '👍', label: 'Helpful',           color: 'rgba(24, 119, 242, 0.18)' },
  { emoji: '✅', label: 'Understood',         color: 'rgba(34, 197, 94, 0.18)'  },
  { emoji: '📌', label: 'Important',          color: 'rgba(245, 158, 11, 0.18)' },
  { emoji: '❓', label: 'Need Clarification', color: 'rgba(168, 85, 247, 0.18)' },
];

//  Share platforms 
const SHARE_PLATFORMS = [
  { label: 'Email', icon: <MdEmail size={22} color="#fff" />, bg: '#757575', action: (url) => window.open(`mailto:?subject=Check this out&body=${encodeURIComponent(url)}`) },
  { label: 'WhatsApp', icon: <FaWhatsapp size={22} color="#fff" />, bg: '#25D366', action: (url) => window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, '_blank') },
  { label: 'X', icon: <FaXTwitter size={22} color="#fff" />, bg: '#000',    action: (url) => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`, '_blank') },
  { label: 'Instagram', icon: <IoLogoInstagram size={22} color="#fff" />, bg: '#E4405F', action: (url) => window.open(`https://www.instagram.com/?url=${encodeURIComponent(url)}`, '_blank') },
  { label: 'Facebook', icon: <FaFacebook size={22} color="#fff" />, bg: '#1877F2', action: (url) => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank') },
  { label: 'Embed', icon: <MdOutlineCode size={22} color="#fff" />, bg: '#606060', action: (url) => alert(`Embed code:\n<iframe src="${url}"></iframe>`) },
];

//  File-type helpers 
function getFileCategory(fileType, mimeType = '') {
  const ext  = (fileType  || '').toLowerCase().replace('.', '');
  const mime = (mimeType  || '').toLowerCase();

  if (ext === 'pdf' || mime.includes('pdf')) return 'pdf';
  if (ext === 'docx' || mime.includes('wordprocessingml')) return 'docx';
  if (ext === 'doc' || mime.includes('msword')) return 'doc';
  if (ext === 'xlsx' || mime.includes('spreadsheetml')) return 'xlsx';
  if (ext === 'xls' || mime.includes('excel')) return 'xls';
  if (ext === 'pptx' || mime.includes('presentationml')) return 'pptx';
  if (ext === 'ppt' || mime.includes('powerpoint')) return 'ppt';
  if (ext === 'txt' || mime.includes('text/plain')) return 'txt';
  if (ext === 'rar' || mime.includes('rar'))  return 'rar';
  if (ext === 'zip' || mime.includes('zip')) return 'zip';
  if (['png','jpg','jpeg','gif','webp'].includes(ext) || mime.startsWith('image/')) return 'image';
  return 'file';
}

// Map category → { icon (PNG asset), label, bg }
const FILE_META = {
  pdf:{ icon: pdfIcon, label: 'PDF', bg: '#ffeaea' },
  doc:{ icon: docIcon, label: 'DOC', bg: '#e3f2fd' },
  docx:{ icon: wordIcon, label: 'DOCX',bg: '#e3f2fd' },
  xls:{ icon: excelIcon, label: 'XLS', bg: '#e8f5e9' },
  xlsx:{ icon: excelIcon, label: 'XLSX', bg: '#e8f5e9' },
  ppt:{ icon: pptIcon, label: 'PPT',  bg: '#fff3e0' },
  pptx:{ icon: pptxIcon, label: 'PPTX', bg: '#fff3e0' },
  txt:{ icon: txtIcon, label: 'TXT', bg: '#f5f5f5' },
  rar:{ icon: rarIcon, label: 'RAR', bg: '#f3e5f5' },
  zip:{ icon: zipIcon, label: 'ZIP', bg: '#f3e5f5' },
  file:{ icon: fileIcon, label: 'FILE', bg: '#eceff1' },
};

function formatFileSize(bytes) {
  if (!bytes) return '';
  const n = Number(bytes);
  if (isNaN(n)) return bytes;  
  if (n === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(n) / Math.log(1024));
  return `${(n / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function getFileName(url, fileType) {
  if (!url) return `file${fileType || ''}`;
  try {
    const parts = url.split('/');
    const raw  = parts[parts.length - 1].split('?')[0];
    return raw || `file${fileType || ''}`;
  } catch {
    return `file${fileType || ''}`;
  }
}

//  Image lightbox overlay 
function ImageLightbox({ src, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.92)',
          zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'lbFadeIn 0.18s ease',
          cursor: 'pointer',
        }}
      >
        <img
          src={src}
          alt="full size"
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: '95vw',
            maxHeight: '92vh',
            objectFit: 'contain',
            borderRadius: '8px',
            boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
            animation: 'lbZoomIn 0.2s ease',
            cursor: 'default',
          }}
        />
        <button
          onClick={onClose}
          style={{
            position: 'fixed', top: '16px', right: '16px',
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)', border: 'none',
            color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(6px)',
            transition: 'background 0.15s',
            zIndex: 1001,
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
        >
          <IoClose size={22} />
        </button>
      </div>
      <style>{`
        @keyframes lbFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes lbZoomIn { from { transform: scale(0.88); opacity: 0 } to { transform: scale(1); opacity: 1 } }
      `}</style>
    </>
  );
}

//  Generic File Card 
function FileCard({ fileUrl, fileType, fileSize, mimeType, fileName }) {
  const category = getFileCategory(fileType, mimeType);
  const meta = FILE_META[category] || FILE_META.file;
  const name = fileName || getFileName(fileUrl, fileType);
  const size = formatFileSize(fileSize);

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
        borderRadius: '12px',
        cursor: fileUrl ? 'pointer' : 'default',
        transition: 'background 0.15s, border-color 0.15s',
      }}
      onMouseEnter={e => {
        if (fileUrl) {
          e.currentTarget.style.background = meta.bg;
          e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--surface-2)';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      <div style={{
        width: '52px', height: '52px', borderRadius: '10px',
        background: meta.bg, padding: '6px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <img src={meta.icon} alt={meta.label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {name}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
          {[size, meta.label, 'Open'].filter(Boolean).join(' · ')}
        </div>
      </div>
      {fileUrl && (
        <div style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
          <MdOpenInNew size={20} />
        </div>
      )}
    </div>
  );
}

//  PDF Card 
function PdfCard({ fileUrl, thumbnailUrl, fileSize, fileName }) {
  const [thumbBroken, setThumbBroken] = useState(false);
  const name = fileName || getFileName(fileUrl, '.pdf');
  const size = formatFileSize(fileSize);
  const hasThumbnail = thumbnailUrl && !thumbBroken;

  const openFile = () => { if (fileUrl) window.open(fileUrl, '_blank'); };

  return (
    <div
      onClick={openFile}
      title="Click to open PDF"
      style={{
        margin: '10px 18px', borderRadius: '14px',
        border: '1px solid var(--border)',
        overflow: 'hidden', cursor: fileUrl ? 'pointer' : 'default',
        background: 'var(--surface-2)',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        display: 'flex', flexDirection: 'column',
      }}
      onMouseEnter={e => {
        if (fileUrl) {
          e.currentTarget.style.borderColor = '#e53935';
          e.currentTarget.style.boxShadow   = '0 4px 16px rgba(229,57,53,0.15)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow   = 'none';
      }}
    >
      {hasThumbnail && (
        <div style={{ width: '100%', maxHeight: '240px', overflow: 'hidden', background: '#f5f5f5' }}>
          <img
            src={thumbnailUrl}
            alt="PDF preview"
            onError={() => setThumbBroken(true)}
            style={{ width: '100%', height: '240px', objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px' }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '10px',
          background: '#ffeaea', padding: '6px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <img src={pdfIcon} alt="PDF" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {name}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
            {[size, 'PDF', 'Open'].filter(Boolean).join(' · ')}
          </div>
        </div>
        {fileUrl && (
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            <button
              onClick={e => { e.stopPropagation(); const a = document.createElement('a'); a.href = fileUrl; a.download = name; a.click(); }}
              title="Download"
              style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <MdDownload size={18} />
            </button>
            <button
              onClick={openFile}
              title="Open"
              style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              Open
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

//  Share modal 
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
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { transform:translateX(-50%) translateY(100%) } to { transform:translateX(-50%) translateY(0) } }
      `}</style>
    </>
  );
}

// ── Claim / Concerns Modal (student only) ────────────────────────────────────
function ClaimModal({ postId, onClose, onSuccess }) {
  const [step, setStep] = useState('form'); // 'form' | 'submitting' | 'done' | 'error'
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);

  // form fields
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [newCategoryText, setNewCategoryText] = useState('');
  const [claimText, setClaimText] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [useNewCategory, setUseNewCategory] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const ref = useRef(null);

  // Close on outside click or Escape
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const keyHandler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [onClose]);

  // Load existing categories for this post
  useEffect(() => {
    api.get(`/home/posts/claims/categories?PostId=${postId}`)
      .then(data => {
        setCategories(Array.isArray(data) ? data : []);
        setLoadingCats(false);
      })
      .catch(() => {
        setCategories([]);
        setLoadingCats(false);
      });
  }, [postId]);

  const handleSubmit = async () => {
    setErrorMsg('');
    if (!claimText.trim()) { setErrorMsg('Please describe your concern.'); return; }
    if (!useNewCategory && !selectedCategoryId) { setErrorMsg('Please select a category or create a new one.'); return; }
    if (useNewCategory && !newCategoryText.trim()) { setErrorMsg('Please enter a name for the new category.'); return; }
    if (useNewCategory && newCategoryText.trim().length > 50) { setErrorMsg('Category name must be 50 characters or less.'); return; }

    setStep('submitting');

    const formData = new FormData();
    formData.append('PostId', postId);
    formData.append('ClaimText', claimText.trim());
    formData.append('ClaimVisibility', visibility);
    if (useNewCategory) {
      formData.append('NewClaimCategoryText', newCategoryText.trim());
    } else {
      formData.append('ClaimCategoryId', selectedCategoryId);
    }

    try {
      await api.post('/home/posts/claims/newClaim', formData);
      setStep('done');
      setTimeout(() => { onClose(); onSuccess && onSuccess(); }, 1800);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit concern.');
      setStep('form');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.55)',
        zIndex: 500,
        animation: 'claimFadeIn 0.15s ease',
      }} />

      {/* Modal */}
      <div ref={ref} style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '94%', maxWidth: '460px',
        background: 'var(--surface)',
        borderRadius: '18px',
        zIndex: 501,
        fontFamily: "'Nunito', sans-serif",
        boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
        animation: 'claimSlideIn 0.22s ease',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px 14px',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FaHandPaper size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>Report Concerns</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '1px' }}>Submit a concern about this post</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', borderRadius: '50%', display: 'flex', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '18px 20px 20px' }}>

          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Concern Submitted!</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>Your concern has been received.</div>
            </div>
          )}

          {step === 'submitting' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Submitting your concern…</div>
            </div>
          )}

          {(step === 'form' || step === 'error') && (
            <>
              {/* Category section */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Category
                </label>

                {loadingCats ? (
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '8px 0' }}>Loading categories…</div>
                ) : (
                  <>
                    {/* Toggle: existing / new */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <button
                        onClick={() => setUseNewCategory(false)}
                        style={{
                          flex: 1, padding: '7px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                          border: `1px solid ${!useNewCategory ? 'var(--primary)' : 'var(--border)'}`,
                          background: !useNewCategory ? 'var(--primary-pale)' : 'var(--surface-2)',
                          color: !useNewCategory ? 'var(--primary)' : 'var(--text-secondary)',
                          cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                        }}
                      >
                        Existing Category
                      </button>
                      <button
                        onClick={() => setUseNewCategory(true)}
                        style={{
                          flex: 1, padding: '7px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                          border: `1px solid ${useNewCategory ? 'var(--primary)' : 'var(--border)'}`,
                          background: useNewCategory ? 'var(--primary-pale)' : 'var(--surface-2)',
                          color: useNewCategory ? 'var(--primary)' : 'var(--text-secondary)',
                          cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                        }}
                      >
                        + New Category
                      </button>
                    </div>

                    {!useNewCategory && (
                      <select
                        value={selectedCategoryId}
                        onChange={e => setSelectedCategoryId(e.target.value)}
                        style={{
                          width: '100%', padding: '10px 12px', borderRadius: '10px',
                          border: '1px solid var(--border)', background: 'var(--surface-2)',
                          color: 'var(--text-primary)', fontSize: '13px',
                          fontFamily: 'inherit', outline: 'none',
                          appearance: 'none', cursor: 'pointer',
                        }}
                      >
                        <option value="">— Select a category —</option>
                        {categories.map(c => (
                          <option key={c.CategoryId} value={c.CategoryId}>
                            {c.CategoryName} ({c.NumberOfClaims} {c.NumberOfClaims === 1 ? 'claim' : 'claims'})
                          </option>
                        ))}
                        {categories.length === 0 && (
                          <option value="" disabled>No existing categories — create one</option>
                        )}
                      </select>
                    )}

                    {useNewCategory && (
                      <input
                        type="text"
                        placeholder="E.g. Misleading information"
                        maxLength={50}
                        value={newCategoryText}
                        onChange={e => setNewCategoryText(e.target.value)}
                        style={{
                          width: '100%', padding: '10px 12px', borderRadius: '10px',
                          border: '1px solid var(--border)', background: 'var(--surface-2)',
                          color: 'var(--text-primary)', fontSize: '13px',
                          fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                        }}
                        onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                      />
                    )}
                  </>
                )}
              </div>

              {/* Concern text */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Your Concern <span style={{ color: '#e53935' }}>*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe your concern about this post…"
                  value={claimText}
                  onChange={e => setClaimText(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '10px',
                    border: '1px solid var(--border)', background: 'var(--surface-2)',
                    color: 'var(--text-primary)', fontSize: '13px', lineHeight: 1.6,
                    fontFamily: 'inherit', resize: 'vertical', outline: 'none',
                    boxSizing: 'border-box', minHeight: '90px',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              {/* Visibility */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Visibility
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['public', 'private'].map(v => (
                    <button
                      key={v}
                      onClick={() => setVisibility(v)}
                      style={{
                        flex: 1, padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                        border: `1px solid ${visibility === v ? 'var(--primary)' : 'var(--border)'}`,
                        background: visibility === v ? 'var(--primary-pale)' : 'var(--surface-2)',
                        color: visibility === v ? 'var(--primary)' : 'var(--text-secondary)',
                        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                        textTransform: 'capitalize',
                      }}
                    >
                      {v === 'public' ? '🌍 Public' : '🔒 Private'}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px' }}>
                  {visibility === 'public' ? 'Other students can see and support this concern.' : 'Only AUCASA members will see this concern.'}
                </div>
              </div>

              {/* Error */}
              {errorMsg && (
                <div style={{
                  padding: '10px 14px', borderRadius: '8px',
                  background: '#fff5f5', border: '1px solid #fcc',
                  color: '#c00', fontSize: '13px', fontWeight: 600,
                  marginBottom: '14px',
                }}>
                  {errorMsg}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                style={{
                  width: '100%', padding: '12px',
                  borderRadius: '12px', border: 'none',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#fff', fontSize: '14px', fontWeight: 800,
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'opacity 0.15s, transform 0.1s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <FaHandPaper size={14} />
                Submit Concern
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes claimFadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes claimSlideIn { from { opacity: 0; transform: translate(-50%, -46%); } to { opacity: 1; transform: translate(-50%, -50%); } }
      `}</style>
    </>
  );
}

//  Helpers 
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

function PostImage({ src }) {
  const [broken, setBroken] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [imgSize, setImgSize] = useState(null);

  useEffect(() => { setBroken(false); setImgSize(null); }, [src]);

  const handleLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    setImgSize({ w: naturalWidth, h: naturalHeight });
  };

  if (!src || broken) return null;

  const isPortrait = imgSize && imgSize.h > imgSize.w * 1.2;
  const isSquare = imgSize && Math.abs(imgSize.w - imgSize.h) < imgSize.w * 0.2;
  const aspectRatio = isPortrait ? '4/5' : isSquare ? '1/1' : '16/9';
  const maxHeight = isPortrait ? '500px' : '380px';

  return (
    <>
      <div
        onClick={() => setLightbox(true)}
        title="Click to zoom"
        style={{
          width: '100%',
          aspectRatio: imgSize ? aspectRatio : '16/9',
          maxHeight,
          overflow: 'hidden',
          background: 'var(--surface-2)',
          cursor: 'pointer',
          margin: '8px 0 4px',
        }}
      >
        <img
          src={src}
          alt="post"
          onError={() => setBroken(true)}
          onLoad={handleLoad}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
            display: 'block',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          crossOrigin="anonymous"
        />
      </div>
      {lightbox && <ImageLightbox src={src} onClose={() => setLightbox(false)} />}
    </>
  );
}

function AuthorAvatar({ avatarUrl, author }) {
  const [imgBroken, setImgBroken] = useState(false);
  useEffect(() => { setImgBroken(false); }, [avatarUrl]);
  const showImage = avatarUrl && !imgBroken;
  return (
    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: showImage ? 'transparent' : avatarColor(author), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '16px', flexShrink: 0, overflow: 'hidden' }}>
      {showImage
        ? <img src={avatarUrl} alt={author} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={() => setImgBroken(true)} />
        : getInitials(author)
      }
    </div>
  );
}

function ReactionSummary({ reactions, myReaction }) {
  const total = Object.values(reactions).reduce((a, b) => a + b, 0);
  if (total === 0 && !myReaction) return null;
  const allEmojis = Object.entries(reactions).sort((a, b) => b[1] - a[1]).map(([e]) => e);
  if (myReaction && !allEmojis.includes(myReaction)) allEmojis.unshift(myReaction);
  const topEmojis = allEmojis.slice(0, 3);

  // Find background color for the reaction bubble
  const getReactionColor = (emoji) => REACTIONS.find(r => r.emoji === emoji)?.color || 'var(--surface-2)';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {topEmojis.map((emoji, index) => (
          <div key={emoji} style={{
            width: '22px', height: '22px', borderRadius: '50%',
            background: getReactionColor(emoji),
            border: '2px solid var(--surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', marginLeft: index === 0 ? '0' : '-8px',
            zIndex: topEmojis.length - index, position: 'relative',
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          }}>{emoji}</div>
        ))}
      </div>
      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{total}</span>
    </div>
  );
}

//  PostCard 
// isStudent prop: true = show Concerns button; false/undefined = hide it (staff)
export default function PostCard({ post, onDelete, onComment, isStudent }) {
  const [showPicker, setShowPicker] = useState(false);
  const [myReaction, setMyReaction] = useState(null);
  const [reactions, setReactions] = useState(post?.reactions || {});
  const [expanded, setExpanded] = useState(false);
  const [reactionLoading, setReactionLoading] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);

  // controls visibility of the delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Ref for the emoji picker used to detect outside-clicks
  const pickerRef = useRef(null);

  useEffect(() => {
    setReactions(post?.reactions || {});
  }, [post?.reactions]);

  // Close emoji picker on outside click
  useEffect(() => {
    if (!showPicker) return;
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPicker]);

  const {
    id, author = 'Unknown', role = '', department = '',
    timestamp = '', content = '', image = null,
    type = 'post', commentCount = 0, isOwner = false,
  } = post || {};

  const raw = post?._raw || {};
  const fileType = raw.FileType || null;
  const mimeType = raw.MimeType || '';
  const fullUrl = raw.FullUrl || null;
  const thumbUrl = raw.ThumbnailUrl || null;
  const fileSize = raw.FileSize || null;

  const fileCategory = fileType ? getFileCategory(fileType, mimeType) : null;
  const isImage = fileCategory === 'image';
  const isPdf = fileCategory === 'pdf';
  const isOtherFile = fileCategory && fileCategory !== 'image';

  const postUrl = `${window.location.origin}/posts/${id}`;

  const handleReaction = async (emoji) => {
    if (reactionLoading) return;

    const prevReaction = myReaction;
    const isToggleOff = prevReaction === emoji;

    setShowPicker(false);
    setReactionLoading(true);

    // Optimistic UI update
    const next = { ...reactions };
    if (prevReaction) {
      next[prevReaction] = Math.max(0, (next[prevReaction] || 1) - 1);
      if (next[prevReaction] === 0) delete next[prevReaction];
    }
    if (!isToggleOff) {
      next[emoji] = (next[emoji] || 0) + 1;
    }
    setReactions(next);
    setMyReaction(isToggleOff ? null : emoji);

    try {
      if (isToggleOff) {
        await api.delete('/home/posts/reactions', { postId: Number(id) });
      } else {
        await api.post('/home/posts/reactions', {
          postId: Number(id),
          reactionType: EMOJI_TO_NAME[emoji] || emoji,
        });
      }
    } catch (e) {
      console.warn('[Reaction] API call failed, reverting:', e.message);
      setReactions(post?.reactions || {});
      setMyReaction(prevReaction);
    } finally {
      setReactionLoading(false);
    }
  };

  const totalReactions = Object.values(reactions).reduce((a, b) => a + b, 0);
  const MAX_LENGTH = 200;
  const isLong = content.length > MAX_LENGTH;
  const displayedContent = isLong && !expanded ? content.slice(0, MAX_LENGTH) + '...' : content;

  // Find the label of the active reaction for display
  const activeReactionData = myReaction ? REACTIONS.find(r => r.emoji === myReaction) : null;

  return (
    <>

      {/* Claim Modal — student only */}
      {showClaimModal && (
        <ClaimModal
          postId={Number(id)}
          onClose={() => setShowClaimModal(false)}
          onSuccess={() => {}}
        />
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <>
          <div
            onClick={() => setShowDeleteModal(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 400,
              animation: 'deleteModalFadeIn 0.15s ease',
            }}
          />
          <div style={{
            position: 'fixed',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#2a2a2a',
            borderRadius: '16px',
            padding: '28px 24px 24px',
            width: '90%',
            maxWidth: '380px',
            zIndex: 401,
            fontFamily: "'Nunito', sans-serif",
            boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
            animation: 'deleteModalSlideIn 0.2s ease',
          }}>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '14px' }}>
              Delete Post?
            </div>
            <div style={{ fontSize: '14px', color: '#ccc', marginBottom: '6px', lineHeight: 1.5 }}>
              This will delete{' '}
              <strong style={{ color: '#fff' }}>
                {content.length > 50 ? content.slice(0, 50) + '…' : content || 'this post'}
              </strong>.
            </div>
            <div style={{ fontSize: '13px', color: '#888', marginBottom: '28px', lineHeight: 1.5 }}>
              This action cannot be undone.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{ padding: '10px 24px', borderRadius: '50px', border: 'none', background: '#3d3d3d', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#4d4d4d'}
                onMouseLeave={e => e.currentTarget.style.background = '#3d3d3d'}
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowDeleteModal(false); onDelete && onDelete(id); }}
                style={{ padding: '10px 24px', borderRadius: '50px', border: 'none', background: '#e53935', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#c62828'}
                onMouseLeave={e => e.currentTarget.style.background = '#e53935'}
              >
                Delete
              </button>
            </div>
          </div>
          <style>{`
            @keyframes deleteModalFadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes deleteModalSlideIn { from { opacity: 0; transform: translate(-50%, -48%); } to { opacity: 1; transform: translate(-50%, -50%); } }
          `}</style>
        </>
      )}

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
              {timestamp  && (<><span style={{ color: 'var(--border)' }}>•</span><span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{timestamp}</span></>)}
            </div>
            {role && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '1px' }}>{role}</div>}
          </div>
          {isOwner && (
            <button onClick={() => setShowDeleteModal(true)} title="Delete post"
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
            {content && (
              <div style={{ padding: '0 18px', marginBottom: '4px' }}>
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
            {isImage && image && <PostImage src={image} />}
            {isPdf && fullUrl && (
              <PdfCard fileUrl={fullUrl} thumbnailUrl={thumbUrl} fileSize={fileSize} fileName={getFileName(fullUrl, fileType)} />
            )}
            {isOtherFile && !isPdf && fullUrl && (
              <FileCard fileUrl={fullUrl} fileType={fileType} fileSize={fileSize} mimeType={mimeType} fileName={getFileName(fullUrl, fileType)} />
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '10px 18px 14px', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>

          {/* ── React button ── */}
          <div style={{ position: 'relative' }} ref={pickerRef}>
            <button
              id={`reaction-btn-${id}`}
              onClick={() => !reactionLoading && setShowPicker(p => !p)}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '7px 14px', borderRadius: '20px',
                border: `1px solid ${myReaction ? 'var(--primary-pale)' : 'var(--border)'}`,
                background: myReaction
                  ? (REACTIONS.find(r => r.emoji === myReaction)?.color || 'var(--primary-pale)')
                  : 'var(--surface-2)',
                cursor: reactionLoading ? 'wait' : 'pointer',
                transition: 'all 0.15s',
                fontFamily: "'Nunito', sans-serif",
                opacity: reactionLoading ? 0.7 : 1,
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = myReaction ? 'var(--primary-pale)' : 'var(--border)'}
            >
              {myReaction
                ? <span style={{ fontSize: '18px', lineHeight: 1 }}>{myReaction}</span>
                : <MdOutlineAddReaction size={20} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
              }
              <span style={{ fontSize: '13px', fontWeight: 600, color: myReaction ? 'var(--primary)' : 'var(--text-secondary)' }}>
                {reactionLoading
                  ? '...'
                  : activeReactionData
                    ? activeReactionData.label
                    : 'Reaction'
                }
              </span>
            </button>

            {/* Emoji picker — academic reactions */}
            {showPicker && (
              <div style={{
                position: 'absolute', bottom: '48px', left: '0',
                background: 'rgba(20,20,20,0.96)',
                backdropFilter: 'blur(12px)',
                borderRadius: '14px',
                padding: '10px 12px',
                display: 'flex', gap: '6px', alignItems: 'center',
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
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                      padding: '8px 10px', borderRadius: '10px', border: 'none',
                      background: myReaction === r.emoji ? r.color : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      outline: myReaction === r.emoji ? `2px solid rgba(255,255,255,0.4)` : 'none',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = r.color; e.currentTarget.style.transform = 'scale(1.12)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = myReaction === r.emoji ? r.color : 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    <span style={{ fontSize: '26px', lineHeight: 1 }}>{r.emoji}</span>
                    <span style={{ fontSize: '10px', color: '#ddd', fontWeight: 600, fontFamily: "'Nunito', sans-serif" }}>{r.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>


          {/* ── Concerns button — students only ── */}
          {isStudent && (
            <button
              id={`concerns-btn-${id}`}
              onClick={() => setShowClaimModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '7px 14px', borderRadius: '20px',
                border: '1px solid var(--border)',
                background: 'var(--surface-2)',
                cursor: 'pointer', transition: 'all 0.15s',
                fontFamily: "'Nunito', sans-serif",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245, 158, 11, 0.12)'; e.currentTarget.style.borderColor = '#f59e0b'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <FaHandPaper size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Concerns</span>
            </button>
          )}

        </div>
      </div>
    </>
  );
}