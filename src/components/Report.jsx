import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function money(n) {
  if (typeof n === 'string' && n.includes('-')) {
    return n
      .split('-')
      .map((x) => Number(x).toLocaleString('en-IN'))
      .join(' - ');
  }

  return Number(n || 0).toLocaleString('en-IN');
}

function Report({ survey }) {
  const reportRef = useRef();

  const r = survey.report || {};

  const exportPDF = async () => {
    try {
      const element = reportRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();

      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      pdf.save(`${survey.customerName || 'solar-report'}.pdf`);
    } catch (err) {
      console.log(err);
      alert('PDF export failed');
    }
  };

  return (
    <>
      <button className="primary exportBtn" onClick={exportPDF}>
        Export PDF
      </button>

      <div className="reportPage" ref={reportRef}>
        <div className="reportHeader">
          <div>
            <h1>Solar Survey Report</h1>
            <span>AI Solar Survey Platform</span>
          </div>

          <div className="scoreCircle">
            <b>{r.score || 0}</b>
            <span>Roof Score</span>
          </div>
        </div>

        <div className="reportGrid">
          <Card title="Customer Details">
            <Info label="Customer" value={survey.customerName} />
            <Info label="Location" value={survey.location} />
            <Info label="Status" value={survey.status} />
            <Info label="Created" value={survey.createdAt} />
          </Card>

          <Card title="Roof Information">
            <Info label="Roof Type" value={survey.roofType} />
            <Info label="Direction" value={survey.direction} />
            <Info label="Shadow Risk" value={survey.shadowRisk} />
            <Info label="Blocked Area" value={`${survey.blockedArea} m²`} />
          </Card>

          <Card title="Solar Recommendation">
            <Info label="System Size" value={`${r.systemSize || 0} kW`} />
            <Info label="Panels Required" value={r.finalPanels || 0} />
            <Info label="Panel Wattage" value={survey.panelWattage} />
            <Info label="Orientation" value={survey.orientation} />
          </Card>

          <Card title="Financial Analysis">
            <Info
              label="Estimated Cost"
              value={`₹${money(r.estimatedCost)}`}
            />

            <Info
              label="Government Subsidy"
              value={`₹${money(r.subsidy)}`}
            />

            <Info
              label="Net Cost"
              value={`₹${money(r.netCost)}`}
            />

            <Info
              label="Annual Savings"
              value={`₹${money(r.annualSaving)}`}
            />

            <Info
              label="Payback Period"
              value={`${r.paybackYears || 0} Years`}
            />
          </Card>
        </div>

        <div className="reportGrid">
          <Card title="Energy Generation">
            <Info
              label="Daily Generation"
              value={`${r.dailyGeneration || 0} Units`}
            />

            <Info
              label="Monthly Generation"
              value={`${r.monthlyGeneration || 0} Units`}
            />

            <Info
              label="Yearly Generation"
              value={`${r.yearlyGeneration || 0} Units`}
            />

            <Info
              label="Shadow Loss"
              value={`${r.shadowLoss || 0}%`}
            />
          </Card>

          <Card title="Installation Recommendation">
            <Info
              label="Recommended Tilt"
              value="18° - 25°"
            />

            <Info
              label="Roof Suitability"
              value={`${r.score || 0}/100`}
            />

            <Info
              label="Access Difficulty"
              value={survey.accessDifficulty}
            />

            <Info
              label="Dimension Mode"
              value={survey.dimensionMode}
            />
          </Card>
        </div>

        <div className="reportSummary">
          <h2>AI Recommendation</h2>

          <p>
            This rooftop appears suitable for solar installation based on
            available roof dimensions, direction, shading risk, and estimated
            panel placement feasibility.
          </p>

          <ul>
            <li>
              Recommended Solar Capacity:{' '}
              <b>{r.systemSize || 0} kW</b>
            </li>

            <li>
              Estimated Annual Savings:{' '}
              <b>₹{money(r.annualSaving)}</b>
            </li>

            <li>
              Net Installation Cost:{' '}
              <b>₹{money(r.netCost)}</b>
            </li>

            <li>
              Estimated Payback:{' '}
              <b>{r.paybackYears || 0} years</b>
            </li>

            <li>
              Roof Suitability Score:{' '}
              <b>{r.score || 0}/100</b>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}

function Card({ title, children }) {
  return (
    <div className="reportCard">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="infoRow">
      <span>{label}</span>
      <b>{value || '-'}</b>
    </div>
  );
}

export default Report;