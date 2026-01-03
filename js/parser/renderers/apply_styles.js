import { twipsToMm } from "./utils.js";

export function applyPageStyles(context) {
    const section = context.currentSection;

    const pageWidth = twipsToMm(section.width || "11906") + "mm";
    const pageHeight = twipsToMm(section.height || "16838") + "mm";
    const marginTop = twipsToMm(section.marginTop || 1440) + "mm";
    const marginBottom = twipsToMm(section.marginBottom || 1440) + "mm";
    const marginLeft = twipsToMm(section.marginLeft || 1440) + "mm";
    const marginRight = twipsToMm(section.marginRight || 1440) + "mm";
    const paddingTop = twipsToMm(section.marginTop || "1440") + "mm";
    const paddingBottom = twipsToMm(section.marginBottom || "1440") + "mm";
    const paddingLeft = twipsToMm(section.marginLeft || "1440") + "mm";
    const paddingRight = twipsToMm(section.marginRight || "1440") + "mm";

    // Determine orientation
    const width = section.orient === "landscape" ? pageHeight : pageWidth;
    const height = section.orient === "landscape" ? pageWidth : pageHeight;

    // Remove old style if exists
    const oldStyle = document.getElementById("dynamic-page-style");
    if (oldStyle) oldStyle.remove();

    const style = document.createElement("style");
    style.id = "dynamic-page-style";
    style.textContent = `
        #editor {
            width: ${width};
            min-width: ${width};
            gap: 40px;
            padding: 20px 0;
        }
        .page {
            width: ${width};
            height: ${height};
            padding: ${marginTop} ${marginRight} ${marginBottom} ${marginLeft};
            background: white;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            border: 1px solid #ddd;
            box-sizing: border-box;
            overflow: hidden;
            page-break-after: always;
            position: relative;
        }
    `;
    document.head.appendChild(style);
}