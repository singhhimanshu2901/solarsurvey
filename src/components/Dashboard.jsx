import React from 'react';
import Reports from './Reports';



function Dashboard({ surveys, open }) {
  const total = surveys.length;

  const installed = surveys.filter((s) => s.status === 'Installed').length;
  const quotation = surveys.filter((s) => s.status === 'Quotation Sent').length;
  const newLeads = surveys.filter((s) => s.status === 'New').length;

  const avgScore =
    surveys.length === 0
      ? 0
      : Math.round(
          surveys.reduce((sum, s) => sum + (s.report?.score || 0), 0) /
            surveys.length
        );

  const potentialRevenue = surveys.reduce(
  (sum, s) => sum + Number(s.report?.estimatedCost || 0),
  0
);

  const totalKw = surveys.reduce(
    (sum, s) => sum + Number(s.report?.systemSize || 0),
    0
  );

  return (
    <>
      <h1>Dashboard</h1>

      <div className="statsGrid">
        <div className="statCard">
          <span>Total Surveys</span>
          <b>{total}</b>
        </div>

        <div className="statCard">
          <span>New Leads</span>
          <b>{newLeads}</b>
        </div>

        <div className="statCard">
          <span>Quotation Sent</span>
          <b>{quotation}</b>
        </div>

        <div className="statCard">
          <span>Installed</span>
          <b>{installed}</b>
        </div>

        <div className="statCard">
          <span>Potential Revenue</span>
          <b>₹{potentialRevenue.toLocaleString('en-IN')}</b>
        </div>

        <div className="statCard">
          <span>Average Roof Score</span>
          <b>{avgScore}/100</b>
        </div>

        <div className="statCard">
          <span>Total Solar Capacity</span>
          <b>{totalKw.toFixed(1)} kW</b>
        </div>
      </div>

      <Reports
        title="Recent Reports"
        surveys={surveys.slice(0, 5)}
        open={open}
      />
    </>
  );
}

export default Dashboard;