// validators.js
export function validateMetar(rawMetar, prevQnh) {
  const result = {
    errors: [],
    warnings: []
  };

  // 🔍 Example rule: Wind group
  if (!/\b\d{5}(G\d{2})?KT\b/.test(rawMetar)) {
    result.errors.push("Wind group missing or bad format");
  }

  // 🔍 QNH check
  if (!/ Q\d{4}/.test(rawMetar)) {
    result.errors.push("QNH missing");
  }

  // 🔍 RA without CB
  if (rawMetar.includes("RA") && !rawMetar.includes("CB")) {
    result.errors.push("RA without CB");
  }

  // 🔍 Wind digits check
  const windMatch = rawMetar.match(/\b(\d{5})KT\b/);
  if (windMatch) {
    const wind = windMatch[1];
    const dir = parseInt(wind.slice(0, 3));
    const speed = parseInt(wind.slice(3));
    if (dir > 360 || speed > 200) {
      result.errors.push("Wind direction or speed out of range");
    }
  }

  // 🔍 QNH trend check
  if (/ Q(\d{4})/.test(rawMetar) && prevQnh) {
    const currQnh = parseInt(rawMetar.match(/ Q(\d{4})/)[1]);
    const diff = Math.abs(currQnh - prevQnh);
    if (diff >= 2) result.errors.push(`QNH changed by ${diff} hPa`);
    else if (diff === 1) result.warnings.push(`QNH changed by ${diff} hPa`);
  }

  return result;
}
