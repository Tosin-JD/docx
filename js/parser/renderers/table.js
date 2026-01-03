import { renderParagraph } from './paragraph.js';
import { Units } from './utils.js';

export function renderTable(tblNode, context) {
    const tblPr = tblNode.getElementsByTagName("w:tblPr")[0];
    const tblGrid = tblNode.getElementsByTagName("w:tblGrid")[0];

    // 1. Calculate Table Width
    const wElem = tblPr?.getElementsByTagName("w:tblW")[0];
    const widthVal = wElem?.getAttribute("w:val");
    const widthType = wElem?.getAttribute("w:type"); // 'dxa' (twips) or 'pct' (fiftieths of percent)
    
    let tableWidth = "100%";
    if (widthType === "dxa") {
        tableWidth = Units.twipsToPx(widthVal);
    } else if (widthType === "pct") {
        tableWidth = (parseInt(widthVal) / 50) + "%";
    }

    let html = `<table style="border-collapse: collapse; width: ${tableWidth}; border: 1px solid black;" border="1">`;

    // 2. Process Rows
    const rows = Array.from(tblNode.getElementsByTagName("w:tr"));
    
    for (const row of rows) {
        html += "<tr>";
        const cells = Array.from(row.getElementsByTagName("w:tc"));

        for (const cell of cells) {
            const tcPr = cell.getElementsByTagName("w:tcPr")[0];

            // --- Handle Column Span (Merged Cells) ---
            const gridSpan = tcPr?.getElementsByTagName("w:gridSpan")[0]?.getAttribute("w:val");
            const colspanAttr = gridSpan ? ` colspan="${gridSpan}"` : "";

            // --- Handle Vertical Merge (Rowspan) ---
            // Note: OOXML handles row merging via 'restart' and 'continue' 
            // Simplified here, but full editors track state across rows for vMerge.
            const vMerge = tcPr?.getElementsByTagName("w:vMerge")[0];
            if (vMerge && !vMerge.getAttribute("w:val")) {
                // If it's a "continue" cell, we skip rendering it in HTML 
                // because the 'restart' cell above it should have the rowspan attr.
                // (Requires a 2nd pass for perfect accuracy)
                continue; 
            }

            // --- Handle Cell Styling ---
            let cellStyles = ["padding: 5px", "vertical-align: top"];
            
            // Cell Shading (Background Color)
            const shd = tcPr?.getElementsByTagName("w:shd")[0]?.getAttribute("w:fill");
            if (shd && shd !== "auto") cellStyles.push(`background-color: #${shd}`);

            // Cell Width
            const tcW = tcPr?.getElementsByTagName("w:tcW")[0]?.getAttribute("w:val");
            if (tcW) cellStyles.push(`width: ${Units.twipsToPx(tcW)}`);

            html += `<td${colspanAttr} style="${cellStyles.join('; ')}">`;

            // 3. Render Cell Content (Paragraphs)
            const paragraphs = Array.from(cell.getElementsByTagName("w:p"));
            if (paragraphs.length === 0) {
                html += "&nbsp;"; // Keep cell visible if empty
            } else {
                for (const p of paragraphs) {
                    html += renderParagraph(p, context);
                }
            }

            html += "</td>";
        }
        html += "</tr>";
    }

    return html + "</table>";
}