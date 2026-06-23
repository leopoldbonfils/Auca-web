import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/aucasaDashboard.css';
import { HiOutlineChatAlt2, HiOutlineDocumentReport } from 'react-icons/hi';
import api from '../utils/api';
import PostCard from '../component/PostCard';

// ─── helpers ──────────────────────────────────────────────────────────────────
/** Convert a UTC timestamp string to a human-readable relative label */
function relativeTime(isoString) {
  if (!isoString) return '';
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60)   return 'Just now';
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
  const [posts,        setPosts]        = useState([]);
  const [metrics,      setMetrics]      = useState({ activePosts: 0, activePostClaims: 0, unreviewedClaims: 0 });
  const [selectedPost, setSelectedPost] = useState(null);
  const [postClaims,   setPostClaims]   = useState([]);
  const [activeTab,    setActiveTab]    = useState('All');
  const [loadingPosts,  setLoadingPosts]  = useState(true);
  const [loadingClaims, setLoadingClaims] = useState(false);
  const [error,        setError]        = useState('');

  // ── state (post feed) ────────────────────────────────────────────────────
  const [feedPosts,       setFeedPosts]       = useState([]);
  const [feedLoading,     setFeedLoading]     = useState(false);
  const [feedFetched,     setFeedFetched]     = useState(false);
  const [feedError,       setFeedError]       = useState('');

  // ── fetch top-level metrics (summary card values) ──────────────────────────
  useEffect(() => {
    api.get('/home/posts/claims/management/summary')
      .then(data => setMetrics(data))
      .catch(err  => console.error('Metrics fetch error:', err));
  }, []);

  // ── fetch posts that have claims (left feed) ───────────────────────────────
  useEffect(() => {
    setLoadingPosts(true);
    api.get('/home/posts/claims/management/postsWithClaims')
      .then(data => {
        const list = data.posts || [];
        setPosts(list);
        if (list.length > 0) setSelectedPost(list[0]);
      })
      .catch(err => {
        console.error('Posts fetch error:', err);
        setError('Failed to load posts. Please try again.');
      })
      .finally(() => setLoadingPosts(false));
  }, []);

  // ── fetch claims for the selected post (right panel) ──────────────────────
  useEffect(() => {
    if (!selectedPost) return;
    setLoadingClaims(true);
    setPostClaims([]);
    api.get(`/home/posts/claims/management/post/${selectedPost.Id}/claims`)
      .then(data => setPostClaims(data.claims || []))
      .catch(err  => console.error('Claims fetch error:', err))
      .finally(() => setLoadingClaims(false));
  }, [selectedPost]);

  // ── derive unique category tabs from the loaded claims ────────────────────
  const categories = ['All', ...new Set(postClaims.map(c => c.Category).filter(Boolean))];

  const filteredClaims = postClaims.filter(c => {
    if (activeTab === 'All') return true;
    return c.Category === activeTab;
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
              // AUCASA can see comments but cannot delete or create posts
              onComment={id => onNavigate && onNavigate({ page: 'comments', post: feedPosts.find(p => p.id === id) })}
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
              filteredClaims.map(c => (
                <div
                  key={c.ClaimId}
                  className={`aucasa-concern ${c.VisibilityStatus === 'private' ? 'private' : ''}`}
                >
                  <div className="aucasa-concern-top">
                    <div className="aucasa-badges">
                      <span className="aucasa-badge category">{c.Category}</span>
                      <span className={`aucasa-badge ${c.ClaimStatus === 'reviewed' ? 'reviewed' : 'pending'}`}>
                        {c.ClaimStatus === 'reviewed' ? 'Reviewed' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Support progress bar — max baseline 150 */}
                  <div
                    className="aucasa-progress-container"
                    title={`${c.NumberOfSupports} students supporting`}
                  >
                    <div
                      className="aucasa-progress-fill"
                      style={{ width: `${Math.min(100, Math.round((c.NumberOfSupports / 150) * 100))}%` }}
                    />
                    <div className="aucasa-progress-text">
                      {Math.min(100, Math.round((c.NumberOfSupports / 150) * 100))}%
                    </div>
                  </div>

                  <div className="aucasa-concern-actions" style={{ marginTop: '12px' }}>
                    <button
                      className="aucasa-btn primary"
                      onClick={() => onNavigate({ page: 'claimDetails', post: selectedPost })}
                    >
                      <HiOutlineDocumentReport size={16} /> View Claims
                    </button>
                    {c.ClaimStatus !== 'reviewed' && (
                      <button
                        className="aucasa-btn outline"
                        onClick={() => handleMarkReviewed(c.ClaimId)}
                      >
                        Mark Reviewed
                      </button>
                    )}
                  </div>
                </div>
              ))
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
