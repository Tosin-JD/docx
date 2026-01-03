// js/parser/renderers/document_styles.js
export function injectDocumentStyles(context) {
    const oldStyle = document.getElementById("document-dynamic-styles");
    if (oldStyle) oldStyle.remove();

    const section = context.currentSection || {};

    const twipsToMm = (twips) => {
        const val = parseInt(twips || 0);
        return val ? (val * 25.4 / 1440).toFixed(2) + "mm" : "35.4mm"; // sane fallback
    };

    const pageWidth = twipsToMm(section.width || 11906);      // 210mm
    const pageHeight = twipsToMm(section.height || 16838);    // 297mm
    const marginTop = twipsToMm(section.marginTop || 1440);
    const marginBottom = twipsToMm(section.marginBottom || 1440);
    const marginLeft = twipsToMm(section.marginLeft || 1440);
    const marginRight = twipsToMm(section.marginRight || 1440);

    const width = section.orient === "landscape" ? pageHeight : pageWidth;
    const height = section.orient === "landscape" ? pageWidth : pageHeight;

    const style = document.createElement("style");
    style.id = "document-dynamic-styles";
    style.textContent = `
        #editor {
            width: ${width};
            min-width: ${width};
            max-width: ${width};
            display: flex;
            flex-direction: column;
            gap: 50px;                 /* generous space between pages */
            padding: 20px 0;
            box-sizing: border-box;
            background: transparent;
        }

        .page {
            width: ${width};
            height: ${height};
            min-height: ${height};     /* ensure it doesn't collapse */
            padding: ${marginTop} ${marginRight} ${marginBottom} ${marginLeft};
            background: white;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
            border: 1px solid #ccc;
            box-sizing: border-box;
            overflow: hidden;
            page-break-after: always;
            position: relative;
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.5;
            color: #000;
        }

        /* Page numbers */
        #editor { counter-reset: page-counter; }
        .page { counter-increment: page-counter; }
        .page::after {
            content: "Page " counter(page-counter);
            position: absolute;
            bottom: 8mm;
            right: 12mm;
            font-size: 10pt;
            color: #555;
            font-family: Arial, sans-serif;
        }

        /* Minimal fallbacks */
        .page > * { margin: 0 0 1em 0; }
        .page > *:last-child { margin-bottom: 0; }
    `;

    document.head.appendChild(style);
}