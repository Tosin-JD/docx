// js/main.js
import { unzipDocx } from "./core/unzipper.js";
import { DocumentContext } from './parser/document_context.js';
import { parseDocxToHtml } from "./parser/index.js";
import { setupFormatting } from "./core/formatter.js";
import { exportToDocx } from "./serializer/exporter.js";
import { injectDocumentStyles } from "./parser/renderers/document_styles.js";

import { applyPageStyles } from "./parser/renderers/apply_styles.js";
import { paginateEditor } from "./paginate/editor.js";   // ← New import

const fileInput = document.getElementById("fileInput");
const editor = document.getElementById("editor");
const saveBtn = document.getElementById("saveBtn");

setupFormatting(editor);

fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const buffer = await file.arrayBuffer();
    const { zip, parts } = await unzipDocx(buffer);

    // Build mediaMap
    const mediaMap = {};
    for (const [filePath, zipEntry] of Object.entries(zip.files)) {
        if (filePath.startsWith("word/media/") && !zipEntry.dir) {
            const blob = await zipEntry.async("blob");
            const dataUrl = await blobToDataURL(blob);
            const key = filePath.replace("word/", "");
            mediaMap[key] = dataUrl;
        }
    }

    function blobToDataURL(blob) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    }

    const context = new DocumentContext(
        parts.styles?.content,
        parts.numbering?.content,
        parts.documentRels?.content,
        mediaMap
    );

    context.parts = parts;
    context.zip = zip;

    const html = parseDocxToHtml(parts.mainDocument?.content || "", context);
    editor.innerHTML = html;

    // Apply dynamic page styles FIRST
    // applyPageStyles(context);
    injectDocumentStyles(context);

    // Now paginate using real page dimensions
    paginateEditor(editor);
});


// Save As DOCX button
saveBtn.addEventListener("click", async () => {
    // Disable button during export
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    try {
        await exportToDocx(editor);
    } catch (err) {
        console.error("Export failed:", err);
        alert("Failed to save document. Check console for details.");
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "Save As DOCX";
    }
});