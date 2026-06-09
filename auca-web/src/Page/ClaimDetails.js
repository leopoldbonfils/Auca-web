import React, { useState, useEffect } from 'react';
import { HiArrowLeft, HiOutlineSearch, HiOutlineDocumentText, HiX } from 'react-icons/hi';
import { MdOutlinePublic, MdLockOutline } from 'react-icons/md';
import '../Styles/claimDetails.css';
import api from '../utils/api';

// ─── field-name mapping helpers ───────────────────────────────────────────────
//  Backend uses:  ClaimStatus = 'unreviewed' | 'reviewed'
//                 VisibilityStatus = 'public' | 'private'
//  Frontend shows: 'Pending' | 'Reviewed'   and   isPrivate boolean

function toDisplayStatus(backendStatus) {
  return backendStatus === 'reviewed' ? 'Reviewed' : 'Pending';
}

function toDisplayDate(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function toStudentLabel(claim) {
  const name = `${claim.Fname || ''} ${claim.Lname || ''}`.trim() || 'Unknown Student';
  return `${name.toUpperCase()} • ${claim.StudentId}`;
}

export default function ClaimDetails({ post, onBack }) {
  const [claims,          setClaims]          = useState([]);
  const [selectedClaim,   setSelectedClaim]   = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [searchQuery,     setSearchQuery]     = useState('');
  const [statusFilter,    setStatusFilter]    = useState('All');
  const [visibilityFilter,setVisibilityFilter]= useState('All');
  const [isSummaryOpen,   setIsSummaryOpen]   = useState(false);
  const [summaryText,     setSummaryText]     = useState(post?.ClaimSummary || '');
  const [summaryLoading,  setSummaryLoading]  = useState(false);
  const [summaryError,    setSummaryError]    = useState('');
  const [showFilters,     setShowFilters]     = useState(true);
  const [lastScrollY,     setLastScrollY]     = useState(0);

  // ── fetch claims for this post ─────────────────────────────────────────────
  useEffect(() => {
    if (!post?.Id) return;
    setLoading(true);
    api.get(`/home/posts/claims/management/post/${post.Id}/claims`)
      .then(data => {
        const list = data.claims || [];
        setClaims(list);
        if (list.length > 0) setSelectedClaim(list[0]);
      })
      .catch(err => console.error('Error loading claims:', err))
      .finally(() => setLoading(false));
  }, [post?.Id]);

  // ── scroll-hide filter bar ─────────────────────────────────────────────────
  const handleScroll = (e) => {
    const currentScrollY = e.target.scrollTop;
    if (currentScrollY > lastScrollY && currentScrollY > 20) setShowFilters(false);
    else if (currentScrollY < lastScrollY) setShowFilters(true);
    setLastScrollY(currentScrollY);
  };

  // ── filter logic — mapped from backend field names ─────────────────────────
  const filteredClaims = claims.filter(c => {
    const displayStatus = toDisplayStatus(c.ClaimStatus);
    const isPrivate     = c.VisibilityStatus === 'private';
    const studentLabel  = toStudentLabel(c);

    const matchesSearch     = c.ClaimText?.toLowerCase().includes(searchQuery.toLowerCase())
                           || studentLabel.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus     = statusFilter === 'All' || displayStatus === statusFilter;
    const matchesVisibility = visibilityFilter === 'All'
                           || (visibilityFilter === 'Private' && isPrivate)
                           || (visibilityFilter === 'Public'  && !isPrivate);

    return matchesSearch && matchesStatus && matchesVisibility;
  });

  // ── mark claim as reviewed — calls PUT /review ─────────────────────────────
  const handleMarkReviewed = async (claimId) => {
    try {
      await api.put('/home/posts/claims/management/review', { ClaimIds: [claimId] });
      // optimistic local update
      setClaims(prev =>
        prev.map(c => c.ClaimId === claimId ? { ...c, ClaimStatus: 'reviewed' } : c)
      );
      if (selectedClaim?.ClaimId === claimId) {
        setSelectedClaim(prev => ({ ...prev, ClaimStatus: 'reviewed' }));
      }
    } catch (err) {
      console.error('Mark reviewed error:', err);
    }
  };

  // ── save summary — calls PATCH /post/:postId/summary ──────────────────────
  const handleSaveSummary = async () => {
    if (!post?.Id) return;
    setSummaryLoading(true);
    setSummaryError('');
    try {
      await api.patch(`/home/posts/claims/management/post/${post.Id}/summary`, {
        ClaimSummary: summaryText,
      });
      setIsSummaryOpen(false);
    } catch (err) {
      setSummaryError(err.message || 'Failed to save summary.');
    } finally {
      setSummaryLoading(false);
    }
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="claim-details-layout">

      {/* LEFT PANEL */}
      <div className="cd-left-panel">
        <div className="cd-header">
          <button className="cd-back-btn" onClick={onBack}>
            <HiArrowLeft size={20} /> Back
          </button>
          <h2>{post ? post.Title : 'Claim Details'}</h2>
        </div>

        <div className="cd-filters">
          <div className="cd-search" style={{ marginBottom: '12px' }}>
            <HiOutlineSearch size={18} />
            <input
              type="text"
              placeholder="Search claims..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className={`cd-filter-tabs-wrapper ${!showFilters ? 'hidden' : ''}`}>
            <div className="cd-status-tabs" style={{ marginBottom: '12px' }}>
              {['Public', 'Private'].map(tab => (
                <button
                  key={tab}
                  className={`cd-tab ${visibilityFilter === tab ? 'active' : ''}`}
                  onClick={() => setVisibilityFilter(visibilityFilter === tab ? 'All' : tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="cd-status-tabs">
              {['All', 'Pending', 'Reviewed'].map(tab => (
                <button
                  key={tab}
                  className={`cd-tab ${statusFilter === tab ? 'active' : ''}`}
                  onClick={() => setStatusFilter(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="cd-claims-list" onScroll={handleScroll}>
          {loading ? (
            <div className="cd-empty-state">Loading claims…</div>
          ) : filteredClaims.length > 0 ? (
            filteredClaims.map(claim => {
              const displayStatus = toDisplayStatus(claim.ClaimStatus);
              return (
                <div
                  key={claim.ClaimId}
                  className={`cd-claim-card ${selectedClaim?.ClaimId === claim.ClaimId ? 'selected' : ''}`}
                  onClick={() => setSelectedClaim(claim)}
                >
                  <div className="cd-claim-card-top">
                    <span className="cd-claim-student">{toStudentLabel(claim)}</span>
                    <span className={`cd-status-badge ${displayStatus.toLowerCase()}`}>{displayStatus}</span>
                  </div>
                  <p className="cd-claim-preview">{claim.ClaimText}</p>
                  <span className="cd-claim-date">{toDisplayDate(claim.DateCreated)}</span>
                </div>
              );
            })
          ) : (
            <div className="cd-empty-state">No claims found.</div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="cd-right-panel">
        {selectedClaim ? (() => {
          const displayStatus = toDisplayStatus(selectedClaim.ClaimStatus);
          const isPrivate     = selectedClaim.VisibilityStatus === 'private';
          return (
            <div className="cd-detail-content">
              <div className="cd-detail-header">
                <div className="cd-detail-meta">
                  <h3>{toStudentLabel(selectedClaim)}</h3>
                  <span className="cd-detail-date">{toDisplayDate(selectedClaim.DateCreated)}</span>
                </div>
                <div className="cd-detail-badges">
                  {isPrivate ? (
                    <span className="aucasa-badge private"><MdLockOutline size={14} /> Private</span>
                  ) : (
                    <span className="aucasa-badge public"><MdOutlinePublic size={14} /> Public</span>
                  )}
                  <span className={`cd-status-badge ${displayStatus.toLowerCase()}`}>{displayStatus}</span>
                </div>
              </div>

              <div className="cd-detail-body">
                <p>{selectedClaim.ClaimText}</p>
                {selectedClaim.ClaimEvidenceUrl && (
                  <a
                    href={selectedClaim.ClaimEvidenceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="cd-evidence-link"
                  >
                    View Evidence
                  </a>
                )}
              </div>

              <div className="cd-detail-actions">
                {displayStatus === 'Pending' ? (
                  <button
                    className="cd-btn-primary"
                    onClick={() => handleMarkReviewed(selectedClaim.ClaimId)}
                  >
                    Mark as Reviewed
                  </button>
                ) : (
                  <button className="cd-btn-outline" disabled>Reviewed ✓</button>
                )}
              </div>
            </div>
          );
        })() : (
          <div className="cd-empty-state">Select a claim to view details.</div>
        )}

        {/* FLOATING ACTION BUTTON */}
        <button className="cd-fab" onClick={() => setIsSummaryOpen(true)}>
          <HiOutlineDocumentText size={24} />
        </button>

        {/* SLIDE-UP SUMMARY PANEL */}
        <div className={`cd-summary-panel ${isSummaryOpen ? 'open' : ''}`}>
          <div className="cd-summary-header">
            <h3>Claim Summary</h3>
            <button className="cd-close-btn" onClick={() => setIsSummaryOpen(false)}>
              <HiX size={20} />
            </button>
          </div>
          <div className="cd-summary-body">
            <textarea
              placeholder="Write a comprehensive summary of the claims here..."
              value={summaryText}
              onChange={e => setSummaryText(e.target.value)}
            />
            {summaryError && <p className="cd-summary-error">{summaryError}</p>}
          </div>
          <div className="cd-summary-footer">
            <button
              className="cd-btn-primary"
              onClick={handleSaveSummary}
              disabled={summaryLoading}
            >
              {summaryLoading ? 'Saving…' : 'Save Summary'}
            </button>
          </div>
        </div>

        {/* OVERLAY */}
        <div
          className={`cd-summary-overlay ${isSummaryOpen ? 'open' : ''}`}
          onClick={() => setIsSummaryOpen(false)}
        />
      </div>
    </div>
  );
}
