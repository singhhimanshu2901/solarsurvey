import React, { useState } from 'react';

const STATUS_OPTIONS = [
  'New',
  'Contacted',
  'Survey Scheduled',
  'Survey Done',
  'Quotation Sent',
  'Installed',
  'Rejected',
];

function Reports({
  surveys,
  open,
  edit,
  remove,
  updateStatus,
  title = 'All Leads',
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = surveys.filter((s) => {
    const text = `${s.customerName || ''} ${s.location || ''} ${s.status || ''} ${s.direction || ''}`.toLowerCase();

    const matchesSearch = text.includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' || s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div className="pageTop">
        <div>
          <h1>{title}</h1>
          <p className="mutedText">
            Manage solar leads, survey status and reports
          </p>
        </div>

        <div className="reportFilters">
          <input
            className="searchInput"
            placeholder="Search customer, location, status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="pipelineBar">
        {STATUS_OPTIONS.map((status) => {
          const count = surveys.filter((s) => s.status === status).length;

          return (
            <div
              key={status}
              className={`pipelineItem ${status.replaceAll(' ', '')}`}
              onClick={() => setStatusFilter(status)}
            >
              <span>{status}</span>
              <b>{count}</b>
            </div>
          );
        })}
      </div>

      <div className="card table">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Location</th>
              <th>System</th>
              <th>Roof Score</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan="7">
                  No leads available yet. Create your first solar survey 🚀
                </td>
              </tr>
            )}

            {filtered.map((s) => (
              <tr key={s.firestoreId || s.id}>
                <td>{s.customerName || 'Unnamed'}</td>

                <td>{s.location || '-'}</td>

                <td>{s.report?.systemSize || '-'} kW</td>

                <td>
                  {s.report?.score || 0}/100{' '}
                  {s.report?.score >= 85
                    ? '🔥'
                    : s.report?.score >= 70
                    ? '⚡'
                    : ''}
                </td>

                <td>
                  <select
                    className={`statusSelect ${s.status?.replaceAll(' ', '')}`}
                    value={s.status || 'New'}
                    onChange={(e) =>
                      updateStatus && updateStatus(s, e.target.value)
                    }
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>

                <td>{s.createdAt}</td>

                <td>
                  <div className="actionBtns">
                    <button onClick={() => open(s)}>View</button>

                    {edit && (
                      <button onClick={() => edit(s)}>
                        Edit
                      </button>
                    )}

                    {remove && (
                      <button
                        className="dangerBtn"
                        onClick={() => remove(s)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Reports;