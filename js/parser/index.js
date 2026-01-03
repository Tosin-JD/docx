// parser/index.js
import { renderParagraph } from './renderers/paragraph.js';
import { renderTable } from './renderers/table.js';
import { renderDrawing } from './renderers/drawing.js';


// export function parseDocxToHtml(documentXml, context) {
//     const xml = new DOMParser().parseFromString(documentXml, "application/xml");
//     const body = xml.getElementsByTagName("w:body")[0];
    
//     return Array.from(body.children).map(node => {
//         switch (node.tagName) {
//             case "w:p":   return renderParagraph(node, context);
//             case "w:tbl": return renderTable(node, context);
//             case "w:drawing": return renderDrawing(node, context);
//             case "w:sectPr": return ""; // Section properties, ignore for body
//             default: return "";
//         }
//     }).join("");
// }

// parser/index.js
export function parseDocxToHtml(documentXml, context) {
    const xml = new DOMParser().parseFromString(documentXml, "application/xml");
    const body = xml.getElementsByTagName("w:body")[0];

    // Collect all section properties (usually at end of sections or document)
    const sectPrs = xml.getElementsByTagName("w:sectPr");
    context.sections = []; // We'll store parsed settings here

    for (const sectPr of sectPrs) {
        const pgSz = sectPr.getElementsByTagName("w:pgSz")[0];
        const pgMar = sectPr.getElementsByTagName("w:pgMar")[0];

        const section = {
            width: pgSz?.getAttribute("w:w"),
            height: pgSz?.getAttribute("w:h"),
            orient: pgSz?.getAttribute("w:orient") || "portrait",
            marginTop: pgMar?.getAttribute("w:top"),
            marginBottom: pgMar?.getAttribute("w:bottom"),
            marginLeft: pgMar?.getAttribute("w:left"),
            marginRight: pgMar?.getAttribute("w:right"),
            headerDist: pgMar?.getAttribute("w:header"),
            footerDist: pgMar?.getAttribute("w:footer"),
            titlePage: !!sectPr.getElementsByTagName("w:titlePg").length,
            // Add more as needed: columns, page numbering, etc.
        };

        context.sections.push(section);
    }

    // Fallback: if no sectPr, use reasonable defaults (A4 portrait)
    if (context.sections.length === 0) {
        context.sections.push({
            width: "11906",    // 210mm
            height: "16838",   // 297mm
            orient: "portrait",
            marginTop: "1440", // 1 inch = 1440 twips
            marginBottom: "1440",
            marginLeft: "1440",
            marginRight: "1440",
        });
    }

    // Use first section as default for whole doc (or enhance later for multi-section)
    context.currentSection = context.sections[0];

    // Now render body content
    return Array.from(body.children).map(node => {
        switch (node.tagName) {
            case "w:p":   return renderParagraph(node, context);
            case "w:tbl": return renderTable(node, context);
            case "w:drawing": return renderDrawing(node, context);
            case "w:sectPr": return ""; // Section properties, ignore for body
            default: return "";
        }
    }).join("");
}