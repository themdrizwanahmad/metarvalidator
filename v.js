// ✅ v.js: METAR validation + comparison

function validateMETAR(rawMetar, prevQnh) {
  const result = {
    errors: [],
    warnings: []
  };

  // Wind group
  if (!/\b\d{5}(G\d{2})?KT\b/.test(rawMetar)) {
    result.errors.push("Wind group missing or bad format");
  }

  // QNH check
  if (!/ Q\d{4}/.test(rawMetar)) {
    result.errors.push("QNH missing");
  }

  // RA without CB
  if (rawMetar.includes("RA") && !rawMetar.includes("CB")) {
    result.errors.push("RA without CB");
  }

  // Wind digits
  const windMatch = rawMetar.match(/\b(\d{5})KT\b/);
  if (windMatch) {
    const wind = windMatch[1];
    const dir = parseInt(wind.slice(0, 3));
    const speed = parseInt(wind.slice(3));
    if (dir > 360 || speed > 200) {
      result.errors.push("Wind direction or speed out of range");
    }
  }

  // QNH trend check
  if (/ Q(\d{4})/.test(rawMetar) && prevQnh) {
    const currQnh = parseInt(rawMetar.match(/ Q(\d{4})/)[1]);
    const diff = Math.abs(currQnh - prevQnh);
    if (diff >= 2) result.errors.push(`QNH changed by ${diff} hPa`);
    else if (diff === 1) result.warnings.push(`QNH changed by ${diff} hPa`);
  }

  return result;
}

// ✅ Comparison logic
function generateMETARDiff(newMetar, oldMetar) {
  const diffs = [];

  // QNH
  const newQ = newMetar.match(/ Q(\d{4})/);
  const oldQ = oldMetar.match(/ Q(\d{4})/);
  if (newQ && oldQ) {
    const diff = Math.abs(parseInt(newQ[1]) - parseInt(oldQ[1]));
    diffs.push(`QNH diff: ${diff} hPa`);
  }

  // Wind
  const newWind = newMetar.match(/\b(\d{3})(\d{2,3})KT\b/);
  const oldWind = oldMetar.match(/\b(\d{3})(\d{2,3})KT\b/);
  if (newWind && oldWind) {
    const dirDiff = Math.abs(parseInt(newWind[1]) - parseInt(oldWind[1]));
    const spdDiff = Math.abs(parseInt(newWind[2]) - parseInt(oldWind[2]));
    if (dirDiff >= 20) diffs.push(`⚠️ Wind direction changed by ${dirDiff}°`);
    if (spdDiff >= 10) diffs.push(`⚠️ Wind speed changed by ${spdDiff} KT`);
  }

  // Weather phenomena
  const wxGroups = ["RA", "TS", "FG", "SN"];
  wxGroups.forEach(wx => {
    const inNew = newMetar.includes(wx);
    const inOld = oldMetar.includes(wx);
    if (inNew && !inOld) diffs.push(`ℹ️ New ${wx} appeared`);
    else if (!inNew && inOld) diffs.push(`ℹ️ ${wx} disappeared`);
  });

  // Visibility
  const visNew = newMetar.match(/\b(\d{4})\b/);
  const visOld = oldMetar.match(/\b(\d{4})\b/);
  if (visNew && visOld) {
    const vNew = parseInt(visNew[1]);
    const vOld = parseInt(visOld[1]);
    const vDiff = vOld - vNew;
    if (vDiff >= 2000) diffs.push(`⚠️ Visibility dropped by ${vDiff}m`);
  }

  return diffs.map(d => `<span class="diff-badge">${d}</span>`).join(" ");
}

window.validateMETAR = validateMETAR;
window.generateMETARDiff = generateMETARDiff;
