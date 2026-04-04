import React, { useState, useRef, useCallback } from 'react';
import { BsImage, BsFilePdf, BsFileWord, BsFileEarmark } from 'react-icons/bs';
import { IoClose } from 'react-icons/io5';
import { BsInfoCircle } from 'react-icons/bs';
import { MdOutlineAttachFile, MdOutlineImage } from 'react-icons/md';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const POST_TYPES = [
  { id: 'post', label: 'Post' },
  { id: 'announcement', label: 'Announcement' },
  { id: 'memo', label: 'Memo' },
];

// ── Accepted MIME types and extensions ──
const ACCEPTED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ACCEPT_ATTR = 'image/*,.pdf,.doc,.docx';

//  Audience data (mirrors the RN app) 
const FACULTY_DEPARTMENTS = {
  'IT': ['Software Engineering', 'Information Management', 'Network and Communication Systems'],
  'Business Administration': ['Marketing', 'Management', 'Finance', 'Accounting'],
  'Education': ['Accounting and IT', 'Economics and Mathematics', 'English and Literature', 'Educational Psychology and Religion'],
  'Theology': [],
  'Health Science': [],
  'MSc-IT': ['Big Data Analytics'],
  'MSc-Business Administration': ['MSc-Project Management', 'MSc-Accounting', 'MSc-Management', 'MSc-Human Resource Management', 'MSc-Finance'],
  'MSc-Education': [],
};

const LEVEL_FACULTIES = {
  'Undergraduate': ['IT', 'Business Administration', 'Education', 'Theology', 'Health Science'],
  'Masters': ['MSc-IT', 'MSc-Business Administration', 'MSc-Education'],
};

const UNDERGRAD_FACULTIES = LEVEL_FACULTIES['Undergraduate'];
const MASTERS_FACULTIES   = LEVEL_FACULTIES['Masters'];

function filterAudienceList(audienceList) {
  const result = [];
  for (const item of audienceList) {
    const levelFaculties = LEVEL_FACULTIES[item];
    if (levelFaculties !== undefined) {
      const hasSelected = levelFaculties.some(f => audienceList.includes(f));
      if (!hasSelected) result.push(item);
      continue;
    }
    const departments = FACULTY_DEPARTMENTS[item];
    if (departments !== undefined) {
      const hasSelected = departments.some(d => audienceList.includes(d));
      if (!hasSelected) result.push(item);
      continue;
    }
    result.push(item);
  }
  return result;
}

//  Determine file category from MIME type 
function getFileCategory(mime = '', name = '') {
  if (mime.startsWith('image/')) return 'image';
  if (mime === 'application/pdf' || name.toLowerCase().endsWith('.pdf')) return 'pdf';
  if (
    mime === 'application/msword' ||
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.toLowerCase().endsWith('.doc') ||
    name.toLowerCase().endsWith('.docx')
  ) return 'doc';
  return 'other';
}

//  Format bytes to human-readable 
function fmtSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

//  File category metadata 
const FILE_META = {
  pdf: { label: 'PDF',  bg: '#ffeaea', color: '#e53935', Icon: BsFilePdf },
  doc: { label: 'DOCX', bg: '#e3f2fd', color: '#1565c0', Icon: BsFileWord },
  other: { label: 'FILE', bg: '#f5f5f5', color: '#616161', Icon: BsFileEarmark },
};

//  Styled file card preview (non-image) 
function FilePreviewCard({ file, onRemove }) {
  const category = getFileCategory(file.type, file.name);
  const meta = FILE_META[category] || FILE_META.other;
  const { Icon } = meta;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '14px 16px', marginBottom: '14px',
      background: 'var(--surface)', border: '1.5px solid var(--border)',
      borderRadius: '12px', boxShadow: 'var(--shadow)',
      position: 'relative',
    }}>
      {/* Icon box */}
      <div style={{
        width: '52px', height: '52px', borderRadius: '10px',
        background: meta.bg, display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={28} color={meta.color} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {file.name}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
          {[fmtSize(file.size), meta.label].filter(Boolean).join(' · ')}
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={onRemove}
        style={{
          width: '28px', height: '28px', borderRadius: '50%',
          background: 'rgba(0,0,0,0.08)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-secondary)', flexShrink: 0,
        }}
      >
        <IoClose size={16} />
      </button>
    </div>
  );
}

//  Small reusable checkbox row 
function CheckRow({ label, checked, onChange, indent = 0 }) {
  return (
    <div
      onClick={onChange}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '7px 0', paddingLeft: indent,
        cursor: 'pointer', userSelect: 'none',
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
        border: `2px solid ${checked ? 'var(--primary)' : 'var(--border)'}`,
        background: checked ? 'var(--primary)' : 'var(--surface)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
      }}>
        {checked && (
          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
            <path d="M1 4L4 7.5L10 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: checked ? 600 : 400 }}>{label}</span>
    </div>
  );
}

function SectionLabel({ label }) {
  return (
    <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', marginTop: '10px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      {label}
    </div>
  );
}

//  Students sub-panel (levels -> faculties -> departments) 
function StudentsPanel({ audienceList, setAudienceList }) {
  const toggle = (item) =>
    setAudienceList(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]);

  const has = (item) => audienceList.includes(item);

  const bothLevels     = has('Undergraduate') && has('Masters');
  const onlyUndergrad  = has('Undergraduate') && !has('Masters');
  const onlyMasters    = has('Masters') && !has('Undergraduate');

  const showUndergradFaculties = !bothLevels && !onlyMasters;
  const showMastersFaculties   = !bothLevels && !onlyUndergrad;

  return (
    <div style={{
      marginTop: '8px', marginLeft: '28px',
      background: 'var(--surface-2)', borderRadius: '10px',
      padding: '12px 14px', border: '1px solid var(--border)',
    }}>
      <SectionLabel label="Student Levels" />
      <CheckRow label="All Undergraduates" checked={has('Undergraduate')} onChange={() => toggle('Undergraduate')} />
      <CheckRow label="All Masters"        checked={has('Masters')}       onChange={() => toggle('Masters')} />

      {!bothLevels && (
        <>
          <SectionLabel label="Student Faculties" />
          {showUndergradFaculties && UNDERGRAD_FACULTIES.map(f => (
            <CheckRow key={f} label={f} checked={has(f)} onChange={() => toggle(f)} indent={8} />
          ))}
          {showMastersFaculties && MASTERS_FACULTIES.map(f => (
            <CheckRow key={f} label={f} checked={has(f)} onChange={() => toggle(f)} indent={8} />
          ))}
        </>
      )}

      {(() => {
        const allFaculties = [...UNDERGRAD_FACULTIES, ...MASTERS_FACULTIES];
        const selectedFacultiesWithDepts = allFaculties.filter(
          f => has(f) && FACULTY_DEPARTMENTS[f]?.length > 0
        );
        if (selectedFacultiesWithDepts.length === 0) return null;
        return (
          <>
            <SectionLabel label="Student Departments" />
            {selectedFacultiesWithDepts.map(f =>
              FACULTY_DEPARTMENTS[f].map(dept => (
                <CheckRow key={dept} label={dept} checked={has(dept)} onChange={() => toggle(dept)} indent={16} />
              ))
            )}
          </>
        );
      })()}
    </div>
  );
}

//  Radio option row
function RadioOption({ value, selected, onChange, label, sub, children }) {
  const isSelected = selected === value;
  return (
    <div style={{ marginBottom: '4px' }}>
      <label
        style={{
          display: 'flex', alignItems: 'center', gap: '14px',
          padding: '11px 14px', borderRadius: '10px', cursor: 'pointer',
          background: isSelected ? 'var(--primary-pale)' : 'transparent',
          border: `1px solid ${isSelected ? '#0d3b8e22' : 'transparent'}`,
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--surface-2)'; }}
        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
      >
        <div
          onClick={() => onChange(value)}
          style={{
            width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
            border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--surface)', transition: 'all 0.15s', cursor: 'pointer',
          }}
        >
          {isSelected && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }} />}
        </div>

        <div onClick={() => onChange(value)} style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>{label}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '1px' }}>{sub}</div>
        </div>
      </label>

      {isSelected && children}
    </div>
  );
}

export default function CreatePost({ onNavigate, onPostCreated }) {
  const [postType, setPostType] = useState('post');
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState('all');
  const [audienceList, setAudienceList] = useState([]);
  const [isPosting, setIsPosting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);
  const handleAudienceChange = (val) => {
    setAudience(val);
    setAudienceList([]);
  };

  //  CHANGED: handle any supported file type 
  const handleFileSelect = useCallback((file) => {
    if (!file) return;

    // Validate MIME type
    const category = getFileCategory(file.type, file.name);
    if (category === 'other') {
      setErrorMsg('Unsupported file type. Please select an image (JPG, PNG), PDF, or Word document (DOC, DOCX).');
      return;
    }

    setErrorMsg('');

    if (category === 'image') {
      // Generate a preview URL for images
      const reader = new FileReader();
      reader.onloadend = () => setAttachedFile({ file, preview: reader.result, category });
      reader.readAsDataURL(file);
    } else {
      // For PDF / doc, no visual preview -- just store the file reference
      setAttachedFile({ file, preview: null, category });
    }
  }, []);

  const handleFileInput = (e) => handleFileSelect(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const removeAttachment = () => {
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePost = async () => {
    if (!content.trim()) { setErrorMsg('Please write something before posting.'); return; }
    setErrorMsg('');
    setIsPosting(true);

    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('description', content.trim());
      formData.append('audience', audience);

      if (audience === 'students' && audienceList.length > 0) {
        const finalAudience = filterAudienceList(audienceList);
        formData.append('audienceList', JSON.stringify(finalAudience));
      }

      //  use attachedFile.file instead of imageFile 
      if (attachedFile) formData.append('PostFile', attachedFile.file);

      const res = await fetch(`${BASE_URL}/home/posts`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || 'Failed to create post');

      setContent('');
      setAttachedFile(null);
      setAudienceList([]);

      if (onPostCreated) onPostCreated(data.post || null);
      if (onNavigate)    onNavigate('home');

    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const charLimit = 500;
  const charLeft = charLimit - content.length;
  const isOverLimit = charLeft < 0;

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', fontFamily: "'Nunito', sans-serif" }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>Create Post</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Share something with AUCA</div>
        </div>
      </div>

      {/* Post type tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: 'var(--surface-2)', padding: '4px', borderRadius: '12px' }}>
        {POST_TYPES.map(pt => (
          <button key={pt.id} onClick={() => setPostType(pt.id)}
            style={{ flex: 1, padding: '8px 0', borderRadius: '9px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700, background: postType === pt.id ? 'var(--surface)' : 'transparent', color: postType === pt.id ? 'var(--primary)' : 'var(--text-secondary)', boxShadow: postType === pt.id ? '0 1px 6px rgba(13,59,142,0.12)' : 'none', transition: 'all 0.15s', fontFamily: "'Nunito', sans-serif" }}
          >{pt.label}</button>
        ))}
      </div>

      {/* Text area */}
      <div style={{ background: 'var(--surface)', borderRadius: '14px', border: `1.5px solid ${isOverLimit ? '#e53935' : content.length > 0 ? '#0d3b8e44' : 'var(--border)'}`, marginBottom: '14px', overflow: 'hidden', boxShadow: 'var(--shadow)', transition: 'border-color 0.2s' }}>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={
            postType === 'announcement' ? 'Write your announcement here...' :
            postType === 'memo'         ? 'Write your memo here...' :
                                          'Write your post description here...'
          }
          style={{ width: '100%', minHeight: '140px', padding: '16px', border: 'none', outline: 'none', resize: 'vertical', fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.7, fontFamily: "'Nunito', sans-serif", background: 'transparent' }}
        />
        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', textAlign: 'right', fontSize: '12px', color: isOverLimit ? '#e53935' : charLeft < 50 ? '#f0a500' : 'var(--text-muted)', fontWeight: 600 }}>
          {charLeft} characters remaining
        </div>
      </div>

      {/* CHANGED: unified attachment section */}
      {attachedFile ? (
        /* Show preview when a file is selected */
        attachedFile.category === 'image' ? (
          /* Image preview */
          <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', marginBottom: '14px', border: '1px solid var(--border)' }}>
            <img src={attachedFile.preview} alt="preview" style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', display: 'block' }} />
            <button onClick={removeAttachment} style={{ position: 'absolute', top: '10px', right: '10px', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IoClose size={18} />
            </button>
          </div>
        ) : (
          /* PDF / Word document card preview */
          <FilePreviewCard file={attachedFile.file} onRemove={removeAttachment} />
        )
      ) : (
        /* Drop zone with two picker buttons */
        <>
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: '14px', padding: '22px 20px', marginBottom: '14px',
              textAlign: 'center',
              background: dragOver ? 'var(--primary-pale)' : 'var(--surface-2)',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px', fontWeight: 600 }}>
              Drag & drop a file here, or choose below
            </div>

            {/* Two picker buttons side by side */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {/* Image picker */}
              <button
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = 'image/*';
                    fileInputRef.current.click();
                  }
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 18px', borderRadius: '10px', border: '1.5px solid var(--border)',
                  background: 'var(--surface)', cursor: 'pointer', fontSize: '13px',
                  fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Nunito', sans-serif",
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-pale)'; e.currentTarget.style.color = 'var(--primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              >
                <MdOutlineImage size={20} /> Image
              </button>

              {/* PDF / Doc picker */}
              <button
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = '.pdf,.doc,.docx';
                    fileInputRef.current.click();
                  }
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 18px', borderRadius: '10px', border: '1.5px solid var(--border)',
                  background: 'var(--surface)', cursor: 'pointer', fontSize: '13px',
                  fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Nunito', sans-serif",
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-pale)'; e.currentTarget.style.color = 'var(--primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              >
                <MdOutlineAttachFile size={20} /> PDF / Word
              </button>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px' }}>
              JPG, PNG, PDF, DOC, DOCX
            </div>
          </div>

          {/* Hidden file input -- accept attribute is set dynamically before click */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_ATTR}
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
        </>
      )}

      {/* ── Audience selector ── */}
      <div style={{ background: 'var(--surface)', borderRadius: '14px', padding: '18px', marginBottom: '14px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
        <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary)', marginBottom: '14px' }}>Select Audience</div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <RadioOption value="all"      selected={audience} onChange={handleAudienceChange} label="Everyone"      sub="Students, Staff and Faculty" />
          <RadioOption value="students" selected={audience} onChange={handleAudienceChange} label="Students Only"  sub="From all faculties">
            <StudentsPanel audienceList={audienceList} setAudienceList={setAudienceList} />
          </RadioOption>
          <RadioOption value="staff"   selected={audience} onChange={handleAudienceChange} label="Staff Only"    sub="Including lecturers" />
          <RadioOption value="alumni"  selected={audience} onChange={handleAudienceChange} label="Alumni"        sub="This will be sent to their Emails" />
        </div>
      </div>

      {/* Info */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'var(--surface-2)', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px', border: '1px solid var(--border)' }}>
        <BsInfoCircle size={18} style={{ color: 'var(--text-secondary)', marginTop: '1px', flexShrink: 0 }} />
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Your post will only be visible to the selected audience.
        </span>
      </div>

      {/* Error */}
      {errorMsg && (
        <div style={{ background: '#fff5f5', border: '1px solid #fcc', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#c00', textAlign: 'center', marginBottom: '12px' }}>
          {errorMsg}
        </div>
      )}

      {/* Post button */}
      <button
        onClick={handlePost}
        disabled={isPosting || isOverLimit || !content.trim()}
        style={{ width: '100%', padding: '16px', borderRadius: '14px', border: 'none', background: isPosting || !content.trim() || isOverLimit ? 'var(--border)' : 'linear-gradient(135deg, #0d3b8e, #1a4fa8)', color: isPosting || !content.trim() || isOverLimit ? 'var(--text-muted)' : '#fff', fontSize: '16px', fontWeight: 800, cursor: isPosting || !content.trim() || isOverLimit ? 'not-allowed' : 'pointer', boxShadow: !isPosting && content.trim() && !isOverLimit ? '0 4px 16px rgba(13,59,142,0.3)' : 'none', transition: 'all 0.2s ease', letterSpacing: '0.5px', fontFamily: "'Nunito', sans-serif" }}
      >
        {isPosting ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <span style={{ width: '18px', height: '18px', border: '2px solid #ffffff55', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
            Posting...
          </span>
        ) : 'Post'}
      </button>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}