export function renderDrawing(drawingNode, context) {
    // Find the blip (The image reference)
    const blips = drawingNode.getElementsByTagNameNS("*", "blip");
    if (!blips.length) return "";

    const rId = blips[0].getAttribute("r:embed");
    const imageUrl = context.getMedia(rId); // context handles the rId -> base64 map

    // Extent (Size)
    const xfrm = drawingNode.getElementsByTagNameNS("*", "extent")[0];
    const width = xfrm ? Math.round(parseInt(xfrm.getAttribute("cx")) / 9525) : "auto";
    const height = xfrm ? Math.round(parseInt(xfrm.getAttribute("cy")) / 9525) : "auto";

    return `<img src="${imageUrl}" style="width: ${width}px; height: ${height}px;" />`;
}