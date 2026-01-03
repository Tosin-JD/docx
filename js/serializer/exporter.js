// js/core/exporter.js
import JSZip from "../lib/jszip.js";

import { buildDocumentXml } from "./document.js";
import { buildNumberingXml } from "./numbering.js";
import { contentTypesXml } from "./content_types.js";
import { packageRelsXml } from "./relationships.js";

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export async function exportToDocx(editorElement) {
    const html = editorElement.innerHTML;

    const zip = new JSZip();

    const documentXml = buildDocumentXml(html);
    const numberingXml = buildNumberingXml();

    // Add required files
    zip.file("[Content_Types].xml", contentTypesXml());
    zip.folder("_rels").file(".rels", packageRelsXml());
    zip.folder("word")
        .file("document.xml", documentXml)
        .file("numbering.xml", numberingXml);

    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob(blob, "edited-document.docx");
}

// Optional: auto-attach to button if it exists
document.getElementById("saveBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    const editor = document.getElementById("editor");
    if (editor) {
        exportToDocx(editor);
    }
});