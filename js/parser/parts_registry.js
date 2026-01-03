// js/parser/parts_registry.js

export const DOCX_PARTS = {
    // Core
    contentTypes: "[Content_Types].xml",
    packageRels: "_rels/.rels",

    // DocProps
    coreProps: "docProps/core.xml",
    appProps: "docProps/app.xml",

    // Word
    mainDocument: "word/document.xml",
    documentRels: "word/_rels/document.xml.rels",
    styles: "word/styles.xml",
    numbering: "word/numbering.xml",
    fontTable: "word/fontTable.xml",
    settings: "word/settings.xml",
    theme: "word/theme/theme1.xml",

    // Headers & Footers (common patterns)
    headers: [/^word\/header\d+\.xml$/],
    footers: [/^word\/footer\d+\.xml$/],

    // Comments & Notes
    comments: "word/comments.xml",
    footnotes: "word/footnotes.xml",
    endnotes: "word/endnotes.xml",

    // Future: webSettings, customXml, etc.
};

// Helper to match regex patterns
function matchesPattern(path, pattern) {
    if (typeof pattern === "string") return path === pattern;
    if (pattern instanceof RegExp) return pattern.test(path);
    return false;
}

export function extractParts(zip) {
    const parts = {};

    for (const [filePath, zipEntry] of Object.entries(zip.files)) {
        if (zipEntry.dir) continue;

        // Check each known part
        for (const [key, pattern] of Object.entries(DOCX_PARTS)) {
            if (Array.isArray(pattern)) {
                // Multiple patterns (e.g. headers)
                for (const p of pattern) {
                    if (matchesPattern(filePath, p)) {
                        parts[key] = parts[key] || [];
                        parts[key].push({
                            path: filePath,
                            content: null, // will be loaded async
                            zipEntry
                        });
                    }
                }
            } else if (matchesPattern(filePath, pattern)) {
                parts[key] = {
                    path: filePath,
                    content: null,
                    zipEntry
                };
            }
        }
    }

    return parts;
}