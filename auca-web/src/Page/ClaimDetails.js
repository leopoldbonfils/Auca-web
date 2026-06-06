import React, { useState } from 'react';
import { HiArrowLeft, HiOutlineSearch, HiOutlineDocumentText, HiX } from 'react-icons/hi';
import { MdOutlinePublic, MdLockOutline } from 'react-icons/md';
import '../Styles/claimDetails.css';

// Mock data for claims related to the post
const generateMockClaims = (postId) => {
  return [
    { id: 1, text: 'This policy is very unclear. When does the new semester fee actually apply?', student: 'MUGISHA Leopold • 26636', date: 'Oct 24, 2023 09:15 AM', status: 'Pending', isPrivate: false },
    { id: 2, text: 'I cannot afford the 5% adjustment. Are there any financial aid options available?', student: 'BISUBIZO DANNY • 26637', date: 'Oct 24, 2023 11:30 AM', status: 'Reviewed', isPrivate: true },
    { id: 3, text: 'The breakdown of the laboratory fee was not provided in the announcement.', student: 'IRABA OLIVE • 26638', date: 'Oct 25, 2023 02:45 PM', status: 'Pending', isPrivate: false },
    { id: 4, text: 'Will this affect scholarships? Please clarify as soon as possible.', student: 'UWINEZA Alice • 26639', date: 'Oct 26, 2023 08:20 AM', status: 'Pending', isPrivate: false },
    { id: 5, text: 'Private claim regarding personal financial situation related to the fee increase.', student: 'Anonymous • 26640', date: 'Oct 26, 2023 10:10 AM', status: 'Reviewed', isPrivate: true },
    { id: 6, text: 'I think the university should host a town hall to discuss these changes.', student: 'KAGABO Peter • 26641', date: 'Oct 27, 2023 01:15 PM', status: 'Pending', isPrivate: false },
  ];
};

export default function ClaimDetails({ post, onBack }) {
  const [claims, setClaims] = useState(generateMockClaims(post?.id));
  const [selectedClaim, setSelectedClaim] = useState(claims[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [visibilityFilter, setVisibilityFilter] = useState('All');
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleScroll = (e) => {
    const currentScrollY = e.target.scrollTop;
    if (currentScrollY > lastScrollY && currentScrollY > 20) {
      setShowFilters(false);
    } else if (currentScrollY < lastScrollY) {
      setShowFilters(true);
    }
    setLastScrollY(currentScrollY);
  };

  const filteredClaims = claims.filter(c => {
    const matchesSearch = c.text.toLowerCase().includes(searchQuery.toLowerCase()) || c.student.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesVisibility = visibilityFilter === 'All' || 
                              (visibilityFilter === 'Private' && c.isPrivate) || 
                              (visibilityFilter === 'Public' && !c.isPrivate);
    return matchesSearch && matchesStatus && matchesVisibility;
  });

  const handleMarkReviewed = (claimId) => {
    setClaims(claims.map(c => c.id === claimId ? { ...c, status: 'Reviewed' } : c));
    if (selectedClaim?.id === claimId) {
      setSelectedClaim({ ...selectedClaim, status: 'Reviewed' });
    }
  };

  return (
    <div className="claim-details-layout">
      {/* LEFT PANEL */}
      <div className="cd-left-panel">
        <div className="cd-header">
          <button className="cd-back-btn" onClick={onBack}>
            <HiArrowLeft size={20} /> Back
          </button>
          <h2>{post ? post.title : 'Claim Details'}</h2>
        </div>

        <div className="cd-filters">
          <div className="cd-search" style={{ marginBottom: '12px' }}>
            <HiOutlineSearch size={18} />
            <input 
              type="text" 
              placeholder="Search claims..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
          {filteredClaims.length > 0 ? filteredClaims.map(claim => (
            <div 
              key={claim.id} 
              className={`cd-claim-card ${selectedClaim?.id === claim.id ? 'selected' : ''}`}
              onClick={() => setSelectedClaim(claim)}
            >
              <div className="cd-claim-card-top">
                <span className="cd-claim-student">{claim.student}</span>
                <span className={`cd-status-badge ${claim.status.toLowerCase()}`}>{claim.status}</span>
              </div>
              <p className="cd-claim-preview">{claim.text}</p>
              <span className="cd-claim-date">{claim.date}</span>
            </div>
          )) : (
            <div className="cd-empty-state">No claims found.</div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="cd-right-panel">
        {selectedClaim ? (
          <div className="cd-detail-content">
            <div className="cd-detail-header">
              <div className="cd-detail-meta">
                <h3>{selectedClaim.student}</h3>
                <span className="cd-detail-date">{selectedClaim.date}</span>
              </div>
              <div className="cd-detail-badges">
                {selectedClaim.isPrivate ? (
                  <span className="aucasa-badge private"><MdLockOutline size={14} /> Private</span>
                ) : (
                  <span className="aucasa-badge public"><MdOutlinePublic size={14} /> Public</span>
                )}
                <span className={`cd-status-badge ${selectedClaim.status.toLowerCase()}`}>{selectedClaim.status}</span>
              </div>
            </div>

            <div className="cd-detail-body">
              <p>{selectedClaim.text}</p>
            </div>

            <div className="cd-detail-actions">
              {selectedClaim.status === 'Pending' ? (
                <button className="cd-btn-primary" onClick={() => handleMarkReviewed(selectedClaim.id)}>
                  Mark as Reviewed
                </button>
              ) : (
                <button className="cd-btn-outline" disabled>
                  Reviewed ✓
                </button>
              )}
            </div>
          </div>
        ) : (
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
              onChange={(e) => setSummaryText(e.target.value)}
            ></textarea>
          </div>
          <div className="cd-summary-footer">
            <button className="cd-btn-primary" onClick={() => setIsSummaryOpen(false)}>Save Summary</button>
          </div>
        </div>
        
        {/* PANEL OVERLAY (Optional, for right panel only to dim background) */}
        <div 
          className={`cd-summary-overlay ${isSummaryOpen ? 'open' : ''}`}
          onClick={() => setIsSummaryOpen(false)}
        ></div>

      </div>
    </div>
  );
}
