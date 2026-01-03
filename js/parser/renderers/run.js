import { escapeHtml } from './utils.js';
import { renderDrawing } from './drawing.js';

export function renderRun(runNode, context) {
    // 1. Check for special content first
    const drawing = runNode.getElementsByTagName("w:drawing")[0];
    if (drawing) return renderDrawing(drawing, context);

    const br = runNode.getElementsByTagName("w:br")[0];
    if (br) return "<br/>";

    // 2. Extract text content
    const t = runNode.getElementsByTagName("w:t")[0];
    if (!t) return "";
    
    let html = escapeHtml(t.textContent || "");

    // 3. Apply Formatting (rPr)
    const rPr = runNode.getElementsByTagName("w:rPr")[0];
    if (rPr) {
        if (rPr.getElementsByTagName("w:b").length) html = `<strong>${html}</strong>`;
        if (rPr.getElementsByTagName("w:i").length) html = `<em>${html}</em>`;
        if (rPr.getElementsByTagName("w:u").length) html = `<u>${html}</u>`;
        if (rPr.getElementsByTagName("w:strike").length) html = `<del>${html}</del>`;
        
        const sz = rPr.getElementsByTagName("w:sz")[0];
        if (sz) {
            const px = (parseInt(sz.getAttribute("w:val")) / 2 / 72) * 96;
            html = `<span style="font-size: ${Math.round(px)}px">${html}</span>`;
        }
    }

    return html;
}