import { panelPresets } from '../data/panelPresets';

export function estimateReport(s) {
  const roofArea = Number(s.roofLength || 0) * Number(s.roofWidth || 0);
  const blocked = Number(s.blockedArea || 0);
  const usable = Math.max(0, roofArea - blocked);

  const p = panelPresets[s.panelWattage] || panelPresets['550W'];
  const panelArea = p.length * p.width;

  const maxPanels = Math.floor(usable / (panelArea * 1.25));
  const requestedPanels = Number(s.panelCount || 0);
  const finalPanels =
    requestedPanels > 0 ? Math.min(requestedPanels, maxPanels) : maxPanels;

  const systemSizeNum = finalPanels * p.w / 1000;
  const systemSize = systemSizeNum.toFixed(2);

  let minFactor = 0;
  let maxFactor = 0;

  if (s.shadowRisk === 'Low') {
    minFactor = 4.5;
    maxFactor = 5.5;
  } else if (s.shadowRisk === 'Medium') {
    minFactor = 3.8;
    maxFactor = 4.8;
  } else {
    minFactor = 3.0;
    maxFactor = 4.0;
  }

  const dailyMin = Math.round(systemSizeNum * minFactor);
  const dailyMax = Math.round(systemSizeNum * maxFactor);

  const monthlyMin = dailyMin * 30;
  const monthlyMax = dailyMax * 30;

  const yearlyMin = monthlyMin * 12;
  const yearlyMax = monthlyMax * 12;

  const dailyGeneration = `${dailyMin}-${dailyMax}`;
  const monthlyGeneration = `${monthlyMin}-${monthlyMax}`;
  const yearlyGeneration = `${yearlyMin}-${yearlyMax}`;

  const costPerKw = systemSizeNum <= 5 ? 60000 : 55000;
  const estimatedCost = Math.round(systemSizeNum) * costPerKw;

  let centralSubsidy = 0;

  if (systemSizeNum >= 1 && systemSizeNum < 2) {
    centralSubsidy = 30000;
  } else if (systemSizeNum >= 2 && systemSizeNum < 3) {
    centralSubsidy = 60000;
  } else if (systemSizeNum >= 3) {
    centralSubsidy = 78000;
  }

  const stateText = `${s.state || s.location || ''}`.toLowerCase();
  const upSubsidy =
    stateText.includes('uttar pradesh') || stateText.includes('up')
      ? 30000
      : 0;

  const subsidy = centralSubsidy + upSubsidy;
  const netCost = Math.max(0, estimatedCost - subsidy);

  const unitRate = Number(s.unitRate || 8);

  const annualSavingMin = Math.round(yearlyMin * unitRate);
  const annualSavingMax = Math.round(yearlyMax * unitRate);

  const annualSaving = `${annualSavingMin}-${annualSavingMax}`;
  const avgAnnualSaving = (annualSavingMin + annualSavingMax) / 2;

  const paybackYears =
    avgAnnualSaving > 0 ? (netCost / avgAnnualSaving).toFixed(1) : 'N/A';

  const shadowLoss =
    s.shadowRisk === 'High' ? 18 : s.shadowRisk === 'Medium' ? 10 : 4;

  const score = Math.max(
    35,
    Math.min(
      96,
      Math.round(
        (usable / Math.max(roofArea, 1)) * 70 +
          (shadowLoss < 8 ? 20 : shadowLoss < 15 ? 12 : 5) +
          (s.accessDifficulty === 'Easy'
            ? 6
            : s.accessDifficulty === 'Medium'
            ? 3
            : 0)
      )
    )
  );

  // AI Roof Analysis
  const usablePercent =
    roofArea > 0 ? Math.round((usable / roofArea) * 100) : 0;

  const obstructionImpact =
    roofArea > 0 ? Math.round((blocked / roofArea) * 100) : 0;

  const roofUtilization =
    usable > 0 ? Math.min(100, Math.round((finalPanels * panelArea * 1.25 / usable) * 100)) : 0;

  const efficiency =
    Math.max(
      40,
      Math.min(
        98,
        Math.round(
          usablePercent -
            shadowLoss -
            obstructionImpact * 0.3 +
            (s.direction === 'South'
              ? 10
              : s.direction === 'South-East' || s.direction === 'South-West'
              ? 7
              : s.direction === 'East' || s.direction === 'West'
              ? 4
              : -4)
        )
      )
    );

  const aiConfidence =
    roofArea > 0 && finalPanels > 0
      ? Math.min(96, Math.max(70, Math.round((score + efficiency) / 2)))
      : 60;

  const optimalLayout =
    s.orientation && s.orientation !== 'Auto'
      ? s.orientation
      : usablePercent >= 75
      ? 'Portrait'
      : 'Landscape';

  let aiRemark = 'Roof is suitable for solar installation.';

  if (efficiency >= 85) {
    aiRemark =
      'Excellent roof condition. High solar output expected with minimal losses.';
  } else if (efficiency >= 70) {
    aiRemark =
      'Good roof condition. Installation is recommended with basic shadow management.';
  } else if (efficiency >= 55) {
    aiRemark =
      'Average roof condition. Obstruction and shadow should be reviewed before installation.';
  } else {
    aiRemark =
      'Low suitability. Detailed manual survey is recommended before final quotation.';
  }

  const aiRoofAnalysis = {
    usablePercent,
    obstructionImpact,
    roofUtilization,
    efficiency,
    aiConfidence,
    optimalLayout,
    recommendedPanels: finalPanels,
    recommendedSystemSize: systemSize,
    shadowRisk: s.shadowRisk,
    direction: s.direction,
    remark: aiRemark,
  };

  return {
    roofArea,
    usable,
    panelArea,
    maxPanels,
    finalPanels,
    systemSize,
    systemSizeNum,
    dailyGeneration,
    monthlyGeneration,
    yearlyGeneration,
    estimatedCost,
    centralSubsidy,
    upSubsidy,
    subsidy,
    netCost,
    annualSaving,
    paybackYears,
    shadowLoss,
    score,
    aiRoofAnalysis,
  };
}