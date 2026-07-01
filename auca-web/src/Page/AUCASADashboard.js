import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/aucasaDashboard.css';
import { HiOutlineChatAlt2, HiOutlineDocumentReport } from 'react-icons/hi';
import { BsShieldFillCheck } from 'react-icons/bs';
import { MdOutlineChatBubbleOutline, MdOutlineAnalytics } from 'react-icons/md';
import api from '../utils/api';
import PostCard from '../component/PostCard';

const getScoreColor = (score) => {
  if (score >= 80) return '#10b981';
  if (score >= 50) return '#f59e0b';
  if (score >= 20) return '#f97316';
  return '#ef4444';
};

// helpers 
/** Convert a UTC timestamp string to a human-readable relative label */
function relativeTime(isoString) {
  if (!isoString) return '';
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(isoString).toLocaleDateString();
}

export default function AUCASADashboard({ onNavigate }) {
  const navigate = useNavigate();

  // ── dashboard tab: 'claims' | 'feed' ─────────────────────────────────────
  const [dashTab, setDashTab] = useState('claims');

  // ── state (claims management) ──────────────────────────────────────────────
  const [posts, setPosts] = useState([]);
  const [metrics, setMetrics] = useState({ activePosts: 0, activePostClaims: 0, unreviewedClaims: 0 });
  const [selectedPost, setSelectedPost] = useState(null);
  const [postClaims, setPostClaims] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingClaims, setLoadingClaims] = useState(false);
  const [error, setError] = useState('');

  // ── state (post feed) ────────────────────────────────────────────────────
  const [feedPosts, setFeedPosts] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedFetched, setFeedFetched] = useState(false);
  const [feedError, setFeedError] = useState('');

  // ── fetch top-level metrics (summary card values) ──────────────────────────
  useEffect(() => {
    api.get('/home/posts/claims/management/summary')
      .then(data => setMetrics(data))
      .catch(err => console.error('Metrics fetch error:', err));
  }, []);

  // ── fetch posts that have claims (left feed) ───────────────────────────────
  useEffect(() => {
    const fetchPosts = () => {
      setLoadingPosts(true);
      api.get('/home/posts/claims/management/postsWithClaims')
        .then(data => {
          const list = data.posts || [];
          setPosts(list);
          if (list.length > 0) setSelectedPost(prev => prev ?? list[0]);
        })
        .catch(err => {
          console.error('Posts fetch error:', err);
          setError('Failed to load posts. Please try again.');
        })
        .finally(() => setLoadingPosts(false));
    };

    fetchPosts();                                  // initial load
    const interval = setInterval(fetchPosts, 30000); // W-3: refresh every 30 s
    return () => clearInterval(interval);          // cleanup on unmount
  }, []);

  // ── fetch claims for the selected post (right panel) ──────────────────────
  useEffect(() => {
    if (!selectedPost) return;
    setLoadingClaims(true);
    setPostClaims([]);
    api.get(`/home/posts/claims/management/post/${selectedPost.Id}/claims`)
      .then(data => setPostClaims(data.claims || []))
      .catch(err => console.error('Claims fetch error:', err))
      .finally(() => setLoadingClaims(false));
  }, [selectedPost]);

  // ── derive unique category tabs from the loaded claims ────────────────────
  // W-2: API returns "CategoryName" — was incorrectly reading "Category"
  const categories = ['All', ...new Set(postClaims.map(c => c.CategoryName).filter(Boolean))];

  const filteredClaims = postClaims.filter(c => {
    if (activeTab === 'All') return true;
    return c.CategoryName === activeTab;
  });

  // ── fetch post feed (read-only, mirrors Home.js logic) ───────────────────
  useEffect(() => {
    if (dashTab !== 'feed' || feedFetched) return;
    setFeedLoading(true);
    setFeedError('');
    api.get('/home/posts')
      .then(data => {
        const list = Array.isArray(data) ? data : (data.posts || []);
        // Map to the shape PostCard expects
        const mapped = list.map(post => {
          const p = JSON.parse(localStorage.getItem('userProfile') || '{}');
          const myId = p?.Id || p?.StudentId;
          const resolveUrl = (url) => url?.startsWith('https://') ? url : null;
          return {
            id: String(post.Id),
            rawId: post.Id,
            author: `${post.Fname || ''} ${post.Lname || ''}`.trim(),
            role: post.Role || '',
            department: post.Department || '',
            timestamp: (() => {
              const d = new Date(post.Timestamp);
              const diff = Math.floor((Date.now() - d.getTime()) / 1000);
              if (diff < 60) return 'Just now';
              if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
              if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
              return d.toLocaleDateString();
            })(),
            content: post.Description || '',
            image: resolveUrl(post.FullUrl) || resolveUrl(post.ThumbnailUrl),
            thumbnailUrl: resolveUrl(post.ThumbnailUrl),
            avatarUrl: resolveUrl(post.ProfileUrl),
            type: 'post',
            commentCount: post.PostComments || 0,
            reactionCount: post.PostReactions || 0,
            reactions: {},
            // AUCASA can view all posts but cannot delete or create
            isOwner: false,
            _raw: post,
          };
        });
        setFeedPosts(mapped);
        setFeedFetched(true);
      })
      .catch(err => setFeedError(err.message || 'Failed to load posts.'))
      .finally(() => setFeedLoading(false));
  }, [dashTab, feedFetched]);

  const handleMarkReviewed = async (claimId) => {
    try {
      await api.put('/home/posts/claims/management/review', { ClaimIds: [claimId] });
      // Update local state so the UI reflects the change instantly
      setPostClaims(prev =>
        prev.map(c => c.ClaimId === claimId ? { ...c, ClaimStatus: 'reviewed' } : c)
      );
    } catch (err) {
      console.error('Mark reviewed error:', err);
    }
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="aucasa-dashboard">
      <div className="aucasa-header">
        <h1 className="aucasa-title">Manage university claims and escalations</h1>
        <p className="aucasa-subtitle">Minister of Communication Dashboard</p>
      </div>

      {/* DASHBOARD TAB SWITCHER */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={() => setDashTab('claims')}
          style={{
            padding: '8px 18px', fontSize: '13px', fontWeight: dashTab === 'claims' ? 700 : 500,
            color: dashTab === 'claims' ? 'var(--primary)' : 'var(--text-secondary)',
            background: 'none', border: 'none',
            borderBottom: dashTab === 'claims' ? '2px solid var(--primary)' : '2px solid transparent',
            marginBottom: '-1px', cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
          }}
        >
          Claims Management
        </button>
        <button
          onClick={() => setDashTab('feed')}
          style={{
            padding: '8px 18px', fontSize: '13px', fontWeight: dashTab === 'feed' ? 700 : 500,
            color: dashTab === 'feed' ? 'var(--primary)' : 'var(--text-secondary)',
            background: 'none', border: 'none',
            borderBottom: dashTab === 'feed' ? '2px solid var(--primary)' : '2px solid transparent',
            marginBottom: '-1px', cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
          }}
        >
          Post Feed
        </button>
      </div>

      {/* POST FEED TAB */}
      {dashTab === 'feed' && (
        <div style={{ maxWidth: '680px' }}>
          {feedLoading && (
            <div className="aucasa-empty">Loading posts…</div>
          )}
          {feedError && !feedLoading && (
            <div className="aucasa-error">{feedError}</div>
          )}
          {!feedLoading && !feedError && feedPosts.length === 0 && (
            <div className="aucasa-empty">No posts available.</div>
          )}
          {!feedLoading && feedPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              isStudent={localStorage.getItem('isStaff') !== 'true'}
            />
          ))}
        </div>
      )}

      {/* CLAIMS MANAGEMENT TAB */}
      {dashTab === 'claims' && (
        <>
          {/* METRICS */}
          <div className="aucasa-metrics">
            <div className="aucasa-metric-card">
              <span className="aucasa-metric-title">Total Posts</span>
              <span className="aucasa-metric-value">{metrics.activePosts}</span>
            </div>
            <div className="aucasa-metric-card">
              <span className="aucasa-metric-title">Total Claims</span>
              <span className="aucasa-metric-value">{metrics.activePostClaims}</span>
            </div>
            <div className="aucasa-metric-card" style={{ borderColor: 'var(--danger)' }}>
              <span className="aucasa-metric-title" style={{ color: 'var(--danger)' }}>Unreviewed Claims</span>
              <span className="aucasa-metric-value">{metrics.unreviewedClaims}</span>
            </div>
          </div>

          {error && <div className="aucasa-error">{error}</div>}

          <div className="aucasa-content">

            {/* LEFT FEED — posts with claims */}
            <div className="aucasa-feed">
              <div className="aucasa-feed-header">
                <h2 className="aucasa-feed-title">Posts With Claims</h2>
              </div>

              {loadingPosts ? (
                <div className="aucasa-empty">Loading posts…</div>
              ) : posts.length === 0 ? (
                <div className="aucasa-empty">No posts with claims found.</div>
              ) : (
                posts.map(post => (
                  <div
                    key={post.Id}
                    className={`aucasa-card ${selectedPost?.Id === post.Id ? 'selected' : ''}`}
                    onClick={() => { setSelectedPost(post); setActiveTab('All'); }}
                  >
                    <div className="aucasa-card-top">
                      <span className="aucasa-card-time">{relativeTime(post.Timestamp)}</span>
                    </div>
                    <h3 className="aucasa-card-title">{post.Title}</h3>
                    <p className="aucasa-card-body">{post.Description}</p>
                    <div className="aucasa-card-bottom">
                      <div className="aucasa-card-concerns">
                        <HiOutlineChatAlt2 size={16} />
                        {post.claimsCount} Claims
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* RIGHT PANEL — claims for selected post */}
            <div className="aucasa-panel">

              {/* Category tabs — built from real data */}
              <div className="aucasa-panel-tabs">
                {categories.map(tab => (
                  <button
                    key={tab}
                    className={`aucasa-panel-tab ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="aucasa-panel-content">
                <div className="aucasa-panel-header">
                  <span>Viewing {activeTab === 'All' ? 'all categories' : activeTab}</span>
                </div>

                {loadingClaims ? (
                  <div className="aucasa-empty">Loading claims…</div>
                ) : filteredClaims.length > 0 ? (
                  filteredClaims.map(c => {
                    const percent = Math.min(100, Math.round((c.NumberOfSupports / 150) * 100));
                    const currentColor = getScoreColor(percent);

                    return (
                      <div
                        key={c.ClaimId}
                        className={`aucasa-concern ${c.VisibilityStatus === 'private' ? 'private' : ''}`}
                        style={{ padding: '24px', backgroundColor: '#f8fafe', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px', display: 'flex', flexDirection: 'column' }}
                      >
                        {/* Top Header Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <button style={{ backgroundColor: '#ebf4ff', color: '#0033a0', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', textTransform: 'uppercase' }}>
                              {c.CategoryName}
                            </button>
                            <span style={{ color: '#1e293b', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase' }}>
                              {c.ClaimStatus === 'Reviewed' ? 'Reviewed' : 'Pending'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: currentColor }}>

                            <span style={{ fontSize: '16px', fontWeight: '700' }}>{percent}%</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ height: '14px', backgroundColor: '#333333', borderRadius: '10px', overflow: 'hidden', width: '100%', marginBottom: '16px' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${percent}%`,
                              backgroundColor: currentColor,
                              borderRadius: '10px',
                              transition: 'width 0.4s ease, background-color 0.4s ease',
                            }}
                          />
                        </div>

                        {/* Total Claims */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                          <HiOutlineChatAlt2 size={16} color="#0033a0" />
                          <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: '600' }}>
                            Total Claims: {c.NumberOfSupports}
                          </span>
                        </div>

                        {/* Divider */}
                        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0 0 16px 0', width: '100%' }} />

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            style={{ flex: 1, backgroundColor: '#0033a0', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            onClick={() => onNavigate({ page: 'claimDetails', post: selectedPost })}
                          >
                            <MdOutlineAnalytics size={16} /> View Claims
                          </button>
                          {c.ClaimStatus !== 'reviewed' && (
                            <button
                              style={{ flex: 1, backgroundColor: 'transparent', color: '#0033a0', border: '1px solid #0033a0', padding: '12px', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                              onClick={() => handleMarkReviewed(c.ClaimId)}
                            >
                              Mark Reviewed
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="aucasa-empty">
                    {selectedPost ? 'No claims to display for this filter.' : 'Select a post to view its claims.'}
                  </div>
                )}
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
