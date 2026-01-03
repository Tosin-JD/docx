import { renderRun } from './run.js';

export function renderParagraph(pNode, context) {
    const pPr = pNode.getElementsByTagName("w:pPr")[0];
    let tag = "p";
    let styles = [];

    // Check for Heading Styles via context
    const styleId = pPr?.getElementsByTagName("w:pStyle")[0]?.getAttribute("w:val");
    if (styleId && styleId.startsWith("Heading")) {
        tag = `h${styleId.replace("Heading", "")}`;
    }

    // Handle Alignment
    const jc = pPr?.getElementsByTagName("w:jc")[0]?.getAttribute("w:val");
    if (jc) styles.push(`text-align: ${jc === 'both' ? 'justify' : jc}`);

    // Process Children (Runs and Hyperlinks)
    let innerHTML = "";
    for (const child of pNode.childNodes) {
        if (child.tagName === "w:r") {
            innerHTML += renderRun(child, context);
        } else if (child.tagName === "w:hyperlink") {
            const rId = child.getAttribute("r:id");
            const linkText = Array.from(child.getElementsByTagName("w:r"))
                                .map(r => renderRun(r, context)).join("");

            // Safely resolve the URL
            let href = "#";
            if (rId && context && typeof context.getRel === "function") {
                href = context.getRel(rId);
            }

            innerHTML += `<a href="${href}" target="_blank">${linkText}</a>`;
        }
    }

    const styleAttr = styles.length ? ` style="${styles.join('; ')}"` : "";
    return `<${tag}${styleAttr}>${innerHTML}</${tag}>`;
}