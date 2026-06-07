import React, { useState } from 'react';

function Reports({ surveys, open, edit, remove, title = 'All Reports' }) {
  const [search, setSearch] = useState('');

  const filtered = surveys.filter((s) => {
    const text = `${s.customerName} ${s.location} ${s.status} ${s.direction}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <>
      <div className="pageTop">
        <h1>{title}</h1>
        <input
          className="searchInput"
          placeholder="Search customer, location, status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
                <td colSpan="7">No surveys available yet.
Create your first solar survey 🚀</td>
              </tr>
            )}

            {filtered.map((s) => (
              <tr key={s.firestoreId || s.id}>
                <td>{s.customerName || 'Unnamed'}</td>
                <td>{s.location}</td>
                <td>{s.report?.systemSize} kW</td>
                <td>
  {s.report?.score}/100{' '}
  {s.report?.score >= 85
    ? '🔥'
    : s.report?.score >= 70
    ? '⚡'
    : ''}
</td>
                <td>
                  <span className={`badge ${s.status?.replaceAll(' ', '')}`}>
                    {s.status}
                  </span>
                </td>
                <td>{s.createdAt}</td>
                <td>
                  <div className="actionBtns">
                    <button onClick={() => open(s)}>View</button>
                    {edit && <button onClick={() => edit(s)}>Edit</button>}
                    {remove && <button className="dangerBtn" onClick={() => remove(s)}>Delete</button>}
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