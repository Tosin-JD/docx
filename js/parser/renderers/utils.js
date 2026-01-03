// utils.js
export const Units = {
    twipsToPx: (val) => Math.round((parseInt(val) / 1440) * 96) + "px",
    halfPointsToPx: (val) => Math.round((parseInt(val) / 2 / 72) * 96) + "px",
    emuToPx: (val) => Math.round(parseInt(val) / 9525) + "px"
};

export function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/**
 * Converts twips to mm using a standard 96 DPI assumption for web environments.
 * @param {number} twips The value in twips to convert.
 * @returns {number} The approximate value in mm.
 */
export function twipsToMm(twips) {
    // The exact conversion factor for twips to mm
    const MM_PER_TWIP = 25.4 / 1440;
    
    return twips * MM_PER_TWIP;
}

/**
 * Converts twips to pixels using a standard 96 DPI assumption for web environments.
 * @param {number} twips The value in twips to convert.
 * @returns {number} The approximate value in pixels.
 */
export function twipsToPixels(twips) {
  // 1 inch = 1440 twips
  const TWIPS_PER_INCH = 1440;
  // Standard web browser assumption: 96 pixels per inch
  const PIXELS_PER_INCH = 96;

  // Conversion: (twips / TWIPS_PER_INCH) * PIXELS_PER_INCH
  return (twips / TWIPS_PER_INCH) * PIXELS_PER_INCH;
}