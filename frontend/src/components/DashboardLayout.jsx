import React from 'react';
import './DashboardLayout.css';

const DashboardLayout = ({ title, subtitle, actions, stats, children }) => (
  <div className="dashboard-layout">
    <div className="dashboard-header">
      <div>
        <h1 className="dashboard-title">{title}</h1>
        {subtitle && <p className="dashboard-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="dashboard-actions">{actions}</div>}
    </div>
    {stats && <div className="stats-grid">{stats}</div>}
    <div className="dashboard-content">{children}</div>
  </div>
);

export default DashboardLayout;