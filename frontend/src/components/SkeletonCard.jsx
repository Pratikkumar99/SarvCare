import React from 'react';
import './SkeletonCard.css';

const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-line w-3/4" />
    <div className="skeleton-line w-1/2" />
    <div className="skeleton-line w-full" />
  </div>
);

// Predefined skeleton variants
export const SkeletonStatCard = () => (
  <div className="skeleton-card skeleton-stat">
    <div className="skeleton-stat-icon"></div>
    <div className="skeleton-stat-content">
      <div className="skeleton-line skeleton-value w-1/3"></div>
      <div className="skeleton-line skeleton-label w-1/2"></div>
    </div>
  </div>
);

export const SkeletonListItem = () => (
  <div className="skeleton-card skeleton-list-item">
    <div className="skeleton-avatar skeleton-sm"></div>
    <div className="skeleton-content">
      <div className="skeleton-line w-3/4"></div>
      <div className="skeleton-line w-1/2"></div>
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 4 }) => (
  <div className="skeleton-table">
    {/* Header */}
    <div className="skeleton-table-header">
      {Array.from({ length: columns }).map((_, index) => (
        <div key={index} className="skeleton-line w-full"></div>
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="skeleton-table-row">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <div key={colIndex} className="skeleton-line w-full"></div>
        ))}
      </div>
    ))}
  </div>
);

export default SkeletonCard;
