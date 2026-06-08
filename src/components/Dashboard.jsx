import React, { useState } from 'react';
import Reports from './Reports';

function Dashboard({ surveys, open, updateStatus }) {
  const [range, setRange] = useState('all');

  function getCreatedTime(s) {
    return Number(s.createdAtMs || s.id || 0);
  }

  function filterByRange(list) {
    if (range === 'all') return list;

    const days =
      range === '7' ? 7 :
      range === '30' ? 30 :
      range === '90' ? 90 :
      999999;

    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    return list.filter((s) => getCreatedTime(s) >= cutoff);
  }

  const rangedSurveys = filterByRange(surveys);

  // Potential Revenue + High Priority ke liye
  // Rejected aur Installed dono remove
  const opportunitySurveys = rangedSurveys.filter(
    (s) => s.status !== 'Rejected' && s.status !== 'Installed'
  );

  // Avg Roof Score + Total Solar Capacity ke liye
  // Sirf Rejected remove, Installed count rahega
  const validSurveys = rangedSurveys.filter(
    (s) => s.status !== 'Rejected'
  );

  // Net Revenue ke liye
  const installedSurveys = rangedSurveys.filter(
    (s) => s.status === 'Installed'
  );

  const total = rangedSurveys.length;

  const avgScore =
    validSurveys.length === 0
      ? 0
      : Math.round(
          validSurveys.reduce((sum, s) => sum + (s.report?.score || 0), 0) /
            validSurveys.length
        );

  const potentialRevenue = opportunitySurveys.reduce(
    (sum, s) => sum + Number(s.report?.estimatedCost || 0),
    0
  );

  const netRevenue = installedSurveys.reduce(
    (sum, s) => sum + Number(s.report?.estimatedCost || 0),
    0
  );

  const totalKw = validSurveys.reduce(
    (sum, s) => sum + Number(s.report?.systemSize || 0),
    0
  );

  const highPriority = opportunitySurveys.filter(
    (s) => (s.report?.score || 0) >= 85
  );

  const conversionBase = rangedSurveys.filter(
  (s) => s.status !== 'Rejected'
).length;

const conversionRate =
  conversionBase === 0
    ? 0
    : Math.round((installedSurveys.length / conversionBase) * 100);

  return (
    <>
      <div className="dashboardHero">
        <div>
          <h1>Company Dashboard</h1>
          <p>
            Manage solar leads, active opportunities, net revenue and
            installation performance.
          </p>
        </div>

        <div className="heroScore">
          <span>Conversion</span>
          <b>{conversionRate}%</b>
        </div>
      </div>

      <div className="rangeTabs">
        <button
          className={range === '7' ? 'activeRange' : ''}
          onClick={() => setRange('7')}
        >
          Last 7 Days
        </button>

        <button
          className={range === '30' ? 'activeRange' : ''}
          onClick={() => setRange('30')}
        >
          Last 30 Days
        </button>

        <button
          className={range === '90' ? 'activeRange' : ''}
          onClick={() => setRange('90')}
        >
          Last 90 Days
        </button>

        <button
          className={range === 'all' ? 'activeRange' : ''}
          onClick={() => setRange('all')}
        >
          All Time
        </button>
      </div>

      <div className="statsGrid">
        <div className="statCard">
          <span>Potential Revenue</span>
          <b>₹{potentialRevenue.toLocaleString('en-IN')}</b>
        </div>

        <div className="statCard netRevenueCard">
          <span>Net Revenue</span>
          <b>₹{netRevenue.toLocaleString('en-IN')}</b>
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

      <div className="dashboardSection">
        <h2>High Priority Leads</h2>

        {highPriority.length === 0 ? (
          <div className="card emptyBox">
            No high priority active leads.
          </div>
        ) : (
          <div className="priorityGrid">
            {highPriority.slice(0, 4).map((s) => (
              <div
                key={s.firestoreId || s.id}
                className="priorityCard"
                onClick={() => open(s)}
              >
                <div>
                  <h3>{s.customerName || 'Unnamed Lead'}</h3>
                  <p>{s.location || 'No location'}</p>
                </div>

                <div className="priorityScore">
                  {s.report?.score}/100 🔥
                </div>

                <span>{s.report?.systemSize || '-'} kW System</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Reports
        title="Recent Leads"
        surveys={rangedSurveys.slice(0, 5)}
        open={open}
        updateStatus={updateStatus}
      />
    </>
  );
}

export default Dashboard;