// style_registry.js
export class DocumentContext {
    constructor(stylesXml, numberingXml, relsXml) {
        this.styles = parseStyles(stylesXml);
        this.numbering = parseNumbering(numberingXml);
        this.relationships = parseRelationships(relsXml);
    }

    getStyle(styleId) { return this.styles[styleId]; }
    getMedia(relId) { return this.relationships[relId]; }
}