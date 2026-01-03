// js/paginate/editor.js

export function paginateEditor(editor) {
    // Create a hidden sample page to get real dimensions
    const samplePage = document.createElement("div");
    samplePage.className = "page";
    samplePage.style.visibility = "hidden";
    samplePage.style.position = "absolute";
    samplePage.style.top = "-9999px";
    samplePage.style.left = "-9999px";
    samplePage.innerHTML = "<div style='height:1px'></div>"; // minimal content
    document.body.appendChild(samplePage);

    // Force reflow
    void samplePage.offsetHeight;

    const pageStyle = getComputedStyle(samplePage);

    const pageHeight = parseFloat(pageStyle.height);
    const paddingTop = parseFloat(pageStyle.paddingTop);
    const paddingLeft = parseFloat(pageStyle.paddingLeft);
    const paddingRight = parseFloat(pageStyle.paddingRight);
    const paddingBottom = parseFloat(pageStyle.paddingBottom);

    const availableInnerHeight = pageHeight - paddingTop - paddingBottom;
    const availableInnerWidth = parseFloat(pageStyle.width) - paddingLeft - paddingRight;

    if (pageHeight <= 0) {
        console.warn("Invalid page height detected. Skipping pagination.");
        document.body.removeChild(samplePage);
        return;
    }

    // Create a clean measurement wrapper that mimics the inside of a .page
    const measureWrapper = document.createElement("div");
    Object.assign(measureWrapper.style, {
        visibility: "hidden",
        position: "absolute",
        top: "-9999px",
        left: "-9999px",
        width: `${availableInnerWidth}px`,
        minHeight: "1px",
        boxSizing: "border-box",
        fontFamily: getComputedStyle(editor).fontFamily,
        fontSize: getComputedStyle(editor).fontSize,
        lineHeight: getComputedStyle(editor).lineHeight,
    });
    document.body.appendChild(measureWrapper);

    // Get all block-level children (paragraphs, headings, tables, lists, etc.)
    const nodes = Array.from(editor.childNodes).filter(node => {
        if (node.nodeType === Node.TEXT_NODE) return node.textContent.trim() !== "";
        return node.nodeType === Node.ELEMENT_NODE;
    });

    const pages = [];
    let currentPage = document.createElement("div");
    currentPage.className = "page";

    // Inner container for content (to avoid margin collapse issues)
    let contentContainer = document.createElement("div");
    currentPage.appendChild(contentContainer);

    nodes.forEach(node => {
        const clone = node.cloneNode(true);

        // Temporarily add to current content container
        contentContainer.appendChild(clone);

        // Measure total content height
        measureWrapper.innerHTML = "";
        // Clone the entire current content
        const contentClone = contentContainer.cloneNode(true);
        measureWrapper.appendChild(contentClone);

        const totalContentHeight = measureWrapper.scrollHeight;

        // If adding this node makes content too tall
        if (totalContentHeight > availableInnerHeight && contentContainer.children.length > 1) {
            // Remove the last added node
            contentContainer.removeChild(clone);

            // Save current page
            pages.push(currentPage);

            // Start new page
            currentPage = document.createElement("div");
            currentPage.className = "page";
            contentContainer = document.createElement("div");
            currentPage.appendChild(contentContainer);
            contentContainer.appendChild(clone);
        }
    });

    // Add final page if it has content
    if (contentContainer.children.length > 0) {
        pages.push(currentPage);
    }

    // Cleanup
    document.body.removeChild(samplePage);
    document.body.removeChild(measureWrapper);

    // Replace editor with paginated pages
    editor.innerHTML = "";
    pages.forEach(page => editor.appendChild(page));
}