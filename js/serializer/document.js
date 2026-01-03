// js/serializer/document.js

import { escapeXml } from "./escape_xml.js";

/**
 * Converts an HTML inline node (or text) into one or more <w:r> (runs)
 */
function htmlNodeToRun(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent;
    // Only create a run if there's non-whitespace content
    if (text.trim() === "" && text !== " ") {
      // Preserve single spaces for spacing, but skip empty text nodes
      return text.includes(" ") ? `<w:r><w:t xml:space="preserve"> </w:t></w:r>` : "";
    }
    return `<w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const tag = node.tagName.toLowerCase();
  let rPr = "";

  // Basic formatting
  if (tag === "strong" || tag === "b") rPr += "<w:b/>";
  if (tag === "em" || tag === "i") rPr += "<w:i/>";
  if (tag === "u") rPr += '<w:u w:val="single"/>';

  // For inline elements like <span>, <a>, etc., we just process children
  let innerRuns = "";
  node.childNodes.forEach((child) => {
    innerRuns += htmlNodeToRun(child);
  });

  if (!innerRuns) return "";

  return `<w:r>${rPr ? `<w:rPr>${rPr}</w:rPr>` : ""}${innerRuns}</w:r>`;
}

/**
 * Converts a block-level HTML node into one or more <w:p> (paragraphs)
 */
function htmlNodeToParagraph(node, listContext = null) {
  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const tag = node.tagName.toLowerCase();

  // Lists: <ul> and <ol>
  if (tag === "ul" || tag === "ol") {
    let paragraphs = "";
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE && child.tagName.toLowerCase() === "li") {
        paragraphs += htmlNodeToParagraph(child, tag); // pass 'ul' or 'ol' as context
      }
    });
    return paragraphs;
  }

  // List items: <li>
  if (tag === "li") {
    const numId = listContext === "ol" ? 2 : 1; // 2 = decimal numbering, 1 = bullet (must be defined in numbering.xml)
    let runs = "";
    node.childNodes.forEach((child) => {
      runs += htmlNodeToRun(child);
    });

    // If no runs, create an empty paragraph to preserve list item
    if (!runs) runs = '<w:r><w:t xml:space="preserve"></w:t></w:r>';

    return `
<w:p>
  <w:pPr>
    <w:numPr>
      <w:ilvl w:val="0"/>
      <w:numId w:val="${numId}"/>
    </w:numPr>
  </w:pPr>
  ${runs}
</w:p>`;
  }

  // Headings: <h1> to <h6>
  if (/^h[1-6]$/.test(tag)) {
    const level = tag[1];
    let runs = "";
    node.childNodes.forEach((child) => {
      runs += htmlNodeToRun(child);
    });
    if (!runs) runs = '<w:r><w:t xml:space="preserve"></w:t></w:r>';

    return `
<w:p>
  <w:pPr>
    <w:pStyle w:val="Heading${level}"/>
  </w:pPr>
  ${runs}
</w:p>`;
  }

  // Regular paragraphs: <p>, <div>, <br> (treated as paragraph break)
  if (tag === "p" || tag === "div" || tag === "br") {
    let runs = "";
    node.childNodes.forEach((child) => {
      runs += htmlNodeToRun(child);
    });

    // Avoid empty paragraphs unless explicitly needed
    if (!runs && tag !== "br") return "";

    if (!runs) runs = '<w:r><w:t xml:space="preserve"></w:t></w:r>';

    return `<w:p>${runs}</w:p>`;
  }

  // Fallback for unknown block-level elements: treat their children as paragraph content
  let fallbackRuns = "";
  node.childNodes.forEach((child) => {
    fallbackRuns += htmlNodeToRun(child);
  });

  if (!fallbackRuns) return "";

  return `<w:p>${fallbackRuns}</w:p>`;
}

/**
 * Main function: converts editor HTML content into full document.xml
 */
export function buildDocumentXml(editorHtml) {
  // Wrap content to ensure a single root for querying
  const parser = new DOMParser();
  const dom = parser.parseFromString(`<div>${editorHtml}</div>`, "text/html");
  const container = dom.querySelector("div");

  if (!container) {
    throw new Error("Failed to parse HTML content");
  }

  let bodyContent = "";

  container.childNodes.forEach((node) => {
    // Special handling for .page container (common in editors like TipTap, ProseMirror)
    if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains("page")) {
      node.childNodes.forEach((child) => {
        bodyContent += htmlNodeToParagraph(child);
      });
    } else {
      bodyContent += htmlNodeToParagraph(node);
    }
  });

  // Trim trailing whitespace/newlines in body
  bodyContent = bodyContent.trim();

  // Final document.xml with proper namespace and structure
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
            mc:Ignorable="w14 w15 wp14">
  <w:body>
${bodyContent || "    <w:p/>"} <!-- Ensure at least one paragraph if empty -->
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/> <!-- Letter size: 8.5x11 inches = 12240x15840 twips -->
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
      <w:cols w:num="1"/>
      <w:docGrid w:linePitch="360"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}