import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RiSearchLine } from 'react-icons/ri';
import { IoClose } from 'react-icons/io5';
import { MdWorkOutline, MdOutlineArticle } from 'react-icons/md';
import api from '../utils/api';

const TABS = ['All', 'Posts', 'Courses'];

function resolveImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('https://')) return url;
  return null;
}

function formatTimeFromUTC(utcTimestamp) {
  if (!utcTimestamp) return '';
  const d = new Date(utcTimestamp);
  const now = new Date();
  const diffMin = Math.floor((now - d) / 60000);
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffMin < 1)  return 'now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffDays < 1)  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  if (diffDays < 7)  return d.toLocaleDateString('en-US', { weekday: 'short' });
  if (d.getFullYear() === now.getFullYear())
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatUserName(fullName = '') {
  const parts = fullName.trim().split(' ');
  if (parts.length <= 2) return fullName;
  const mids = parts.slice(1, -1).map(w => w[0].toUpperCase() + '.').join(' ');
  return `${parts[0]} ${mids} ${parts[parts.length - 1]}`;
}

function avatarBg(name = '') {
  const colors = [
    'linear-gradient(135deg,#0d3b8e,#1a4fa8)',
    'linear-gradient(135deg,#7c3aed,#a855f7)',
    'linear-gradient(135deg,#059669,#34d399)',
    'linear-gradient(135deg,#dc2626,#f87171)',
    'linear-gradient(135deg,#d97706,#fbbf24)',
    'linear-gradient(135deg,#0891b2,#22d3ee)',
  ];
  return colors[(name.charCodeAt(0) || 0) % colors.length];
}

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// Skeleton loaders

function SkeletonRow() {
  return (
    <div style={{ display: 'flex', gap: '12px', padding: '12px 16px', background: 'var(--surface)', borderRadius: '12px', marginBottom: '8px', border: '1px solid var(--border)' }}>
      <style>{`.sk3{background:linear-gradient(90deg,var(--border) 25%,var(--surface-2) 50%,var(--border) 75%);background-size:700px 100%;animation:sk3 1.4s infinite linear;border-radius:6px}@keyframes sk3{0%{background-position:-700px 0}100%{background-position:700px 0}}`}</style>
      <div className="sk3" style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="sk3" style={{ height: 13, width: '45%', marginBottom: 8 }} />
        <div className="sk3" style={{ height: 11, width: '30%' }} />
      </div>
    </div>
  );
}

//  Avatar component 

function Avatar({ url, name, size = 44 }) {
  const [broken, setBroken] = useState(false);
  const showImg = url && !broken;
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: showImg ? 'transparent' : avatarBg(name), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: size * 0.36, flexShrink: 0, overflow: 'hidden' }}>
      {showImg
        ? <img src={url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setBroken(true)} />
        : initials(name)
      }
    </div>
  );
}

//  Post result card 

function PostResult({ post, query }) {
  const author = formatUserName(`${post.Fname || ''} ${post.Lname || ''}`.trim());
  const time = formatTimeFromUTC(post.Timestamp);
  const content = post.Description || '';
  const avatar = resolveImageUrl(post.ProfileUrl);

  // Highlight matching text
  function highlight(text) {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark style={{ background: '#fff9c4', borderRadius: 3, padding: '0 2px', color: 'inherit' }}>
          {text.slice(idx, idx + query.length)}
        </mark>
        {text.slice(idx + query.length)}
      </>
    );
  }

  const preview = content.length > 120 ? content.slice(0, 120) + '…' : content;

  return (
    <div style={{ padding: '14px 16px', background: 'var(--surface)', borderRadius: '12px', marginBottom: '8px', border: '1px solid var(--border)', cursor: 'default', transition: 'all 0.15s', boxShadow: 'var(--shadow)' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; e.currentTarget.style.borderColor = '#0d3b8e22'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow)';       e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <Avatar url={avatar} name={author} size={36} />
        <div>
          <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--primary)' }}>
            {highlight(author)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {post.Role || ''}{post.Department ? ` · ${post.Department}` : ''} · {time}
          </div>
        </div>
        {post.FileType && (
          <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: 'var(--primary-pale)', color: 'var(--primary)', textTransform: 'uppercase' }}>
            {post.FileType.replace('.', '')}
          </span>
        )}
      </div>
      {content && (
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
          {highlight(preview)}
        </div>
      )}
    </div>
  );
}

// Course result card 

function CourseResult({ course, query }) {
  function highlight(text = '') {
    if (!query || !text) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark style={{ background: '#fff9c4', borderRadius: 3, padding: '0 2px', color: 'inherit' }}>
          {text.slice(idx, idx + query.length)}
        </mark>
        {text.slice(idx + query.length)}
      </>
    );
  }

  const statusColor = course.ClassStatus === 'active' ? '#16a34a' : '#94a3b8';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: 'var(--surface)', borderRadius: '12px', marginBottom: '8px', border: '1px solid var(--border)', transition: 'all 0.15s', boxShadow: 'var(--shadow)' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; e.currentTarget.style.borderColor = '#0d3b8e22'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow)';       e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      {/* Icon box */}
      <div style={{ width: 44, height: 44, borderRadius: '10px', background: 'var(--primary-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <MdWorkOutline size={22} color="var(--primary)" />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {highlight(course.ClassName)}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {course.CourseCode && (
            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
              {highlight(course.CourseCode)}
            </span>
          )}
          {course.GroupName && <span>{highlight(course.GroupName)}</span>}
          {course.Semester && <span>Sem {course.Semester}</span>}
          {course.AcademicYear && <span>{course.AcademicYear}</span>}
        </div>
      </div>

      {course.ClassStatus && (
        <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: course.ClassStatus === 'active' ? '#dcfce7' : 'var(--surface-2)', color: statusColor, flexShrink: 0, textTransform: 'capitalize' }}>
          {course.ClassStatus}
        </span>
      )}
    </div>
  );
}

// Section header 

function SectionHeader({ label, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', marginTop: '6px' }}>
      <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>
      {count !== undefined && (
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>{count} result{count !== 1 ? 's' : ''}</span>
      )}
    </div>
  );
}

//  Main Search component 

export default function Search() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [allPosts, setAllPosts] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);

  const inputRef = useRef(null);
  const hasFetched = useRef(false);

  // Focus input on mount
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Fetch posts + courses once (on first keystroke or mount)
  const loadData = useCallback(async () => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    setLoading(true);
    setError('');
    try {
      const [postsRes, coursesRes] = await Promise.all([
        api.get('/home/posts'),
        api.get('/courses'),
      ]);

      const postList = Array.isArray(postsRes)   ? postsRes   : (postsRes?.posts   || []);
      const courseList = Array.isArray(coursesRes) ? coursesRes : [];

      // Deduplicate posts by Id
      const seen = new Set();
      const uniquePosts = postList.filter(p => { if (seen.has(p.Id)) return false; seen.add(p.Id); return true; });

      setAllPosts(uniquePosts);
      setAllCourses(courseList);
      setDataLoaded(true);
    } catch (err) {
      setError(err.message || 'Failed to load search data.');
      hasFetched.current = false; // allow retry
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data when user starts typing
  useEffect(() => {
    if (query.trim()) loadData();
  }, [query, loadData]);

  //  Filter logic 

  const q = query.trim().toLowerCase();

  const filteredPosts = !q ? [] : allPosts.filter(p => {
    const author = `${p.Fname || ''} ${p.Lname || ''}`.toLowerCase();
    const content = (p.Description || '').toLowerCase();
    const role = (p.Role || '').toLowerCase();
    const dept = (p.Department || '').toLowerCase();
    return author.includes(q) || content.includes(q) || role.includes(q) || dept.includes(q);
  });

  const filteredCourses = !q ? [] : allCourses.filter(c => {
    const name = (c.ClassName || '').toLowerCase();
    const code = (c.CourseCode || '').toLowerCase();
    const group = (c.GroupName || '').toLowerCase();
    return name.includes(q) || code.includes(q) || group.includes(q);
  });

  const showPosts = activeTab === 'All' || activeTab === 'Posts';
  const showCourses = activeTab === 'All' || activeTab === 'Courses';

  const totalResults = (showPosts ? filteredPosts.length : 0) + (showCourses ? filteredCourses.length : 0);

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', fontFamily: "'Nunito', sans-serif" }}>

      {/* Heading */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>Search</div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Find posts and courses across AUCA</div>
      </div>

      {/* Search input */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        background: 'var(--surface)', borderRadius: '12px', padding: '0 16px',
        border: `1.5px solid ${q ? 'var(--primary)' : 'var(--border)'}`,
        marginBottom: '16px', boxShadow: 'var(--shadow)', transition: 'border-color 0.2s',
      }}>
        <span style={{ color: loading ? 'var(--primary)' : 'var(--text-muted)', flexShrink: 0, display: 'flex' }}>
          {loading
            ? <span style={{ width: 18, height: 18, border: '2px solid var(--primary-pale)', borderTop: '2px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
            : <RiSearchLine size={18} />
          }
        </span>
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search posts, courses, course codes…"
          style={{ flex: 1, padding: '14px 0', border: 'none', outline: 'none', fontSize: '14px', color: 'var(--text-primary)', background: 'transparent', fontFamily: "'Nunito', sans-serif" }}
        />
        {q && (
          <button onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <IoClose size={18} />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border)' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{ padding: '8px 16px', fontSize: '13px', fontWeight: activeTab === t ? 700 : 500, color: activeTab === t ? 'var(--primary)' : 'var(--text-secondary)', background: 'none', border: 'none', borderBottom: activeTab === t ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: '-1px', cursor: 'pointer', fontFamily: "'Nunito', sans-serif", transition: 'color 0.15s' }}>
            {t}
            {/* Badge count when searching */}
            {q && dataLoaded && (
              <span style={{ marginLeft: 6, fontSize: '11px', fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: activeTab === t ? 'var(--primary)' : 'var(--surface-2)', color: activeTab === t ? '#fff' : 'var(--text-muted)' }}>
                {t === 'All'     ? filteredPosts.length + filteredCourses.length
                 : t === 'Posts'   ? filteredPosts.length
                 : filteredCourses.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/*  Empty state no query */}
      {!q && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '52px', marginBottom: '14px' }}></div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Search AUCA</div>
          <div style={{ fontSize: '13px', lineHeight: 1.6 }}>
            Type to search posts by content or author,<br />or find courses by name or code.
          </div>
        </div>
      )}

      {/*  Error state  */}
      {error && q && (
        <div style={{ background: '#fff5f5', border: '1px solid #fcc', borderRadius: '12px', padding: '16px', textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', color: '#c00', fontWeight: 600 }}>{error}</div>
          <button onClick={() => { hasFetched.current = false; loadData(); }}
            style={{ marginTop: '10px', padding: '7px 18px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>
            Retry
          </button>
        </div>
      )}

      {/*  Loading skeletons */}
      {loading && q && !dataLoaded && (
        <div>
          {[1, 2, 3, 4].map(i => <SkeletonRow key={i} />)}
        </div>
      )}

      {/*  Results  */}
      {q && dataLoaded && (
        <div style={{ paddingBottom: '40px' }}>

          {/* No results */}
          {totalResults === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}></div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-secondary)' }}>No results for "{query}"</div>
              <div style={{ fontSize: '13px', marginTop: '6px' }}>Try a different keyword or course code</div>
            </div>
          )}

          {/* Posts section */}
          {showPosts && filteredPosts.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <SectionHeader label="Posts" count={activeTab === 'All' ? undefined : filteredPosts.length} />
              {filteredPosts.map(post => (
                <PostResult key={post.Id} post={post} query={query} />
              ))}
            </div>
          )}

          {/* Courses section */}
          {showCourses && filteredCourses.length > 0 && (
            <div>
              <SectionHeader label="Courses" count={activeTab === 'All' ? undefined : filteredCourses.length} />
              {filteredCourses.map(course => (
                <CourseResult key={course.ClassId} course={course} query={query} />
              ))}
            </div>
          )}

          {/* Section-specific empty states */}
          {activeTab === 'Posts' && filteredPosts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <MdOutlineArticle size={40} style={{ marginBottom: 10, opacity: 0.4 }} />
              <div style={{ fontSize: '14px', fontWeight: 600 }}>No posts match "{query}"</div>
            </div>
          )}

          {activeTab === 'Courses' && filteredCourses.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <MdWorkOutline size={40} style={{ marginBottom: 10, opacity: 0.4 }} />
              <div style={{ fontSize: '14px', fontWeight: 600 }}>No courses match "{query}"</div>
              <div style={{ fontSize: '13px', marginTop: '4px' }}>Try searching by course name or code (e.g. INSY 8316)</div>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}