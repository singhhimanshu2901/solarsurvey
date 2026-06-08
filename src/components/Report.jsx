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
  const ai = r.aiRoofAnalysis || {};

const exportPDF = async () => {
  try {
    const element = reportRef.current;

    const oldWidth = element.style.width;
    const oldMaxWidth = element.style.maxWidth;
    const oldPadding = element.style.padding;

    element.style.width = '794px';
    element.style.maxWidth = '794px';
    element.style.padding = '24px';

    await new Promise((resolve) => setTimeout(resolve, 300));

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      scrollY: -window.scrollY,
      windowWidth: 794,
      windowHeight: element.scrollHeight,
    });

    element.style.width = oldWidth;
    element.style.maxWidth = oldMaxWidth;
    element.style.padding = oldPadding;

    const pdf = new jsPDF('p', 'mm', 'a4');

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let position = 0;
    let heightLeft = imgHeight;

    pdf.addImage(
      canvas.toDataURL('image/jpeg', 1.0),
      'JPEG',
      0,
      position,
      imgWidth,
      imgHeight
    );

    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();

      pdf.addImage(
        canvas.toDataURL('image/jpeg', 1.0),
        'JPEG',
        0,
        position,
        imgWidth,
        imgHeight
      );

      heightLeft -= pageHeight;
    }

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
        <h1 className="plainReportTitle">Solar Survey Report</h1>

        <div className="aiAnalysisBox">
          <div className="aiAnalysisTop">
            <div>
              <h2>Smart Roof Feasibility Analysis</h2>
              <p>
                Smart analysis based on roof area, obstruction, direction,
                shadow risk and panel placement feasibility.
              </p>
            </div>

            <div className="aiConfidence">
              <b>{ai.aiConfidence || 0}%</b>
              <span>Confidence</span>
            </div>
          </div>

          <div className="aiMetricGrid">
            <AiMetric
              label="Roof Efficiency"
              value={`${ai.efficiency || 0}%`}
              percent={ai.efficiency || 0}
            />

            <AiMetric
              label="Usable Roof Area"
              value={`${ai.usablePercent || 0}%`}
              percent={ai.usablePercent || 0}
            />

            <AiMetric
              label="Roof Utilization"
              value={`${ai.roofUtilization || 0}%`}
              percent={ai.roofUtilization || 0}
            />

            <AiMetric
              label="Obstruction Impact"
              value={`${ai.obstructionImpact || 0}%`}
              percent={ai.obstructionImpact || 0}
              reverse
            />
          </div>

          <div className="aiInfoGrid">
            <Info
              label="Recommended Panels"
              value={ai.recommendedPanels || r.finalPanels || 0}
            />

            <Info
              label="Recommended System"
              value={`${ai.recommendedSystemSize || r.systemSize || 0} kW`}
            />

            <Info
              label="Optimal Layout"
              value={ai.optimalLayout || survey.orientation}
            />

            <Info
              label="Detected Shadow Risk"
              value={ai.shadowRisk || survey.shadowRisk}
            />
          </div>

          <div className="aiRemark">
            <b>Recommendation:</b>{' '}
            {ai.remark || 'Roof feasibility analysis completed.'}
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
              label="Central Subsidy"
              value={`₹${money(r.centralSubsidy || 0)}`}
            />

            <Info
              label="UP State Subsidy"
              value={`₹${money(r.upSubsidy || 0)}`}
            />

            <Info
              label="Total Subsidy"
              value={`₹${money(r.subsidy)}`}
            />

            <Info label="Net Cost" value={`₹${money(r.netCost)}`} />

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

            <Info label="Shadow Loss" value={`${r.shadowLoss || 0}%`} />
          </Card>

          <Card title="Installation Recommendation">
            <Info label="Recommended Tilt" value="18° - 25°" />

            <Info label="Roof Suitability" value={`${r.score || 0}/100`} />

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
          <h2>Final Recommendation</h2>

          <p>
            This rooftop appears suitable for solar installation based on
            available roof dimensions, direction, shading risk, usable area,
            and estimated panel placement feasibility.
          </p>

          <ul>
            <li>
              Recommended Solar Capacity: <b>{r.systemSize || 0} kW</b>
            </li>

            <li>
              Estimated Annual Savings: <b>₹{money(r.annualSaving)}</b>
            </li>

            <li>
              Net Installation Cost: <b>₹{money(r.netCost)}</b>
            </li>

            <li>
              Estimated Payback: <b>{r.paybackYears || 0} years</b>
            </li>

            <li>
              Roof Suitability Score: <b>{r.score || 0}/100</b>
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

function AiMetric({ label, value, percent, reverse = false }) {
  const safePercent = Math.max(0, Math.min(100, Number(percent || 0)));

  return (
    <div className="aiMetric">
      <div className="aiMetricHead">
        <span>{label}</span>
        <b>{value}</b>
      </div>

      <div className="aiBar">
        <div
          className={reverse ? 'aiBarFill dangerFill' : 'aiBarFill'}
          style={{ width: `${safePercent}%` }}
        ></div>
      </div>
    </div>
  );
}

export default Report;