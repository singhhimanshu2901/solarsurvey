import jsPDF from 'jspdf';

export function generatePDF(survey) {
  const r = survey.report;

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('Solar Survey Detailed Report', 15, 18);

  doc.setFontSize(11);

  const lines = [
    `Customer: ${survey.customerName}`,
    `Location: ${survey.location}`,
    `Roof Type: ${survey.roofType}`,
    `Direction: ${survey.direction}`,
    `Total Roof Area: ${r.roofArea.toFixed(2)} sq.m`,
    `Usable Area: ${r.usable.toFixed(2)} sq.m`,
    `Roof Score: ${r.score}/100`,
    `Recommended System: ${r.systemSize} kW`,
    `Panels Fit: ${r.finalPanels} panels`,
    `Monthly Generation: ${r.monthlyGeneration} units`,
    `Stand Direction: Face panels towards ${
      survey.direction === 'North' ? 'South if possible' : survey.direction
    }`,
    `Recommended Tilt/Elevation: 18 to 25 degree`,
    `Shadow Loss Estimate: ${r.shadowLoss}%`,
    `Layout Option 1: Maximum generation layout`,
    `Layout Option 2: Maintenance-friendly layout`,
    `Layout Option 3: Low-shadow layout`,
    `Installation Difficulty: ${survey.accessDifficulty}`,
  ];

  let y = 32;

  lines.forEach((x) => {
    doc.text(x, 15, y);
    y += 8;
  });

  doc.save('solar-survey-report.pdf');
}