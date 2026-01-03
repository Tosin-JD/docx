// js/serializer/utils.js

export function escapeXml(str) {
    if (!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export const XML_HEADER = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';