export class DocumentContext {
    constructor(stylesXml, numberingXml, relsXml, mediaMap = {}) {
        const domParser = new DOMParser();
        this.styles = this._parseStyles(domParser, stylesXml);
        this.numbering = this._parseNumbering(domParser, numberingXml);
        this.relationships = this._parseRelationships(domParser, relsXml);
        this.mediaMap = mediaMap; 
    }

    /**
     * Resolves a Relationship ID (rId) → URL (mainly for hyperlinks)
     */
    getRel(rId) {
        const rel = this.relationships[rId];
        if (!rel) return "#";

        if (rel.type.includes('hyperlink')) {
            return rel.target;
        }

        // For images: the target is like "media/image1.png"
        // We'll handle actual image src in getMedia()
        return "#"; // or return rel.target if you want raw path
    }

    /**
     * NEW: Resolves image reference (rId or direct path) to a usable src (data URL)
     */
    getMedia(rIdOrPath) {
        if (!rIdOrPath) return "";

        // Case 1: It's a direct relationship ID (e.g. rId1 from <a:blip r:embed="rId1"/>)
        if (rIdOrPath.startsWith("rId") || this.relationships[rIdOrPath]) {
            const rel = this.relationships[rIdOrPath];
            if (!rel || !rel.target) return "";

            let targetPath = rel.target;
            // Strip "word/" prefix if present
            if (targetPath.startsWith("word/")) {
                targetPath = targetPath.slice(5);
            }

            return this.mediaMap[targetPath] || "";
        }

        // Case 2: It's already a media path like "media/image1.png"
        let path = rIdOrPath;
        if (path.startsWith("word/")) path = path.slice(5);

        return this.mediaMap[path] || this.mediaMap["media/" + path] || "";
    }

    /**
     * Finds the numbering format (bullet, decimal, etc.) for a specific list level
     */
    getListFormat(numId, level) {
        const numInstance = this.numbering[numId];
        if (!numInstance) return "ul"; // Fallback

        const fmt = numInstance[level] || numInstance["0"];
        const orderedFormats = ["decimal", "lowerLetter", "upperLetter", "lowerRoman", "upperRoman"];
        
        return orderedFormats.includes(fmt) ? "ol" : "ul";
    }

    /**
     * Resolves a style ID to its actual properties (or the human-readable name)
     */
    getStyleName(styleId) {
        return this.styles[styleId]?.name || styleId;
    }

    /* ---------------- INTERNAL PARSERS ---------------- */

    _parseRelationships(domParser, xmlString) {
        if (!xmlString) return {};
        const xml = domParser.parseFromString(xmlString, "application/xml");
        const rels = {};
        const entries = xml.getElementsByTagName("Relationship");
        
        for (const entry of entries) {
            rels[entry.getAttribute("Id")] = {
                target: entry.getAttribute("Target"),
                type: entry.getAttribute("Type")
            };
        }
        return rels;
    }

    _parseStyles(domParser, xmlString) {
        if (!xmlString) return {};
        const xml = domParser.parseFromString(xmlString, "application/xml");
        const styles = {};
        const styleNodes = xml.getElementsByTagName("w:style");

        for (const node of styleNodes) {
            const id = node.getAttribute("w:styleId");
            const name = node.getElementsByTagName("w:name")[0]?.getAttribute("w:val");
            const type = node.getAttribute("w:type"); // 'paragraph', 'character', etc.

            styles[id] = { name, type };
        }
        return styles;
    }

    _parseNumbering(domParser, xmlString) {
        if (!xmlString) return {};
        const xml = domParser.parseFromString(xmlString, "application/xml");
        
        const abstractMap = {};
        const abstractNodes = xml.getElementsByTagName("w:abstractNum");

        // 1. Map Abstract Definitions (The "Rules")
        for (const abs of abstractNodes) {
            const id = abs.getAttribute("w:abstractNumId");
            const levels = {};
            const lvlNodes = abs.getElementsByTagName("w:lvl");
            
            for (const lvl of lvlNodes) {
                const ilvl = lvl.getAttribute("w:ilvl");
                const fmt = lvl.getElementsByTagName("w:numFmt")[0]?.getAttribute("w:val");
                levels[ilvl] = fmt;
            }
            abstractMap[id] = levels;
        }

        // 2. Map Numbering Instances (The "Usage")
        const numMap = {};
        const numNodes = xml.getElementsByTagName("w:num");
        for (const num of numNodes) {
            const id = num.getAttribute("w:numId");
            const absRef = num.getElementsByTagName("w:abstractNumId")[0]?.getAttribute("w:val");
            if (abstractMap[absRef]) {
                numMap[id] = abstractMap[absRef];
            }
        }
        return numMap;
    }
}