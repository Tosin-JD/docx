// import JSZip from "https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm";
import JSZip from "../lib/jszip.js";


import { extractParts } from '../parser/parts_registry.js';

export async function unzipDocx(buffer) {
    const zip = await JSZip.loadAsync(buffer);
    const parts = extractParts(zip);

    // Pre-load essential text parts (async in parallel)
    const loadPromises = [];

    // Main document + core parts
    const essential = ['mainDocument', 'styles', 'numbering', 'documentRels', 'fontTable', 'settings', 'theme', 'coreProps'];
    for (const key of essential) {
        const part = parts[key];
        if (part && !Array.isArray(part)) {
            loadPromises.push(
                part.zipEntry.async("text").then(text => { part.content = text; })
            );
        }
    }

    // Load headers/footers if present
    if (parts.headers) {
        for (const header of parts.headers) {
            loadPromises.push(header.zipEntry.async("text").then(text => { header.content = text; }));
        }
    }
    if (parts.footers) {
        for (const footer of parts.footers) {
            loadPromises.push(footer.zipEntry.async("text").then(text => { footer.content = text; }));
        }
    }

    // Load comments, notes, etc. if present
    ['comments', 'footnotes', 'endnotes'].forEach(key => {
        const part = parts[key];
        if (part && !Array.isArray(part)) {
            loadPromises.push(part.zipEntry.async("text").then(text => { part.content = text; }));
        }
    });

    await Promise.all(loadPromises);

    return { zip, parts };
}
