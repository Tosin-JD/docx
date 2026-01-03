/* -------------------- MAIN EXPORT -------------------- */
export function setupFormatting(editor) {
    document.querySelectorAll("[data-command]").forEach(button => {
        button.addEventListener("click", () => {
            const command = button.dataset.command;
            const tagMap = { bold: "strong", italic: "em", underline: "u" };
            const tag = tagMap[command];
            if (!tag) return;

            applyFormatting(editor, tag);
            editor.focus();
        });
    });
}

/* -------------------- APPLY FORMATTING -------------------- */
function applyFormatting(editor, tag) {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;

    const range = sel.getRangeAt(0);
    if (range.collapsed) return;

    // Split selection across multiple nodes
    const nodes = getSelectedNodes(range);

    nodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            wrapTextNode(node, tag);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            wrapElementNode(node, tag);
        }
    });

    // Merge identical tags after formatting
    mergeSameTags(editor, tag);
}

/* -------------------- WRAP TEXT NODE -------------------- */
function wrapTextNode(textNode, tag) {
    const parent = textNode.parentNode;

    // Don't wrap if parent already has this tag
    if (parent.tagName?.toLowerCase() === tag) return;

    const wrapper = document.createElement(tag);
    wrapper.textContent = textNode.textContent;
    parent.replaceChild(wrapper, textNode);
}

/* -------------------- WRAP ELEMENT NODE -------------------- */
function wrapElementNode(node, tag) {
    // Avoid double wrapping
    if (node.tagName?.toLowerCase() === tag) return;

    const wrapper = document.createElement(tag);
    wrapper.appendChild(node.cloneNode(true));
    node.replaceWith(wrapper);
}

/* -------------------- MERGE IDENTICAL TAGS -------------------- */
function mergeSameTags(container, tag) {
    const elements = container.querySelectorAll(tag);
    elements.forEach(el => {
        const parent = el.parentNode;
        if (parent.tagName?.toLowerCase() === tag) {
            // Move children up one level and remove redundant tag
            while (el.firstChild) parent.insertBefore(el.firstChild, el);
            el.remove();
        }
    });
}

/* -------------------- GET ALL NODES IN SELECTION -------------------- */
function getSelectedNodes(range) {
    const nodes = [];
    const treeWalker = document.createTreeWalker(
        range.commonAncestorContainer,
        NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
        {
            acceptNode: function (node) {
                // Only include nodes intersecting the range
                const nodeRange = document.createRange();
                nodeRange.selectNodeContents(node);
                return nodeRange.compareBoundaryPoints(Range.END_TO_START, range) < 0 &&
                    nodeRange.compareBoundaryPoints(Range.START_TO_END, range) > 0
                    ? NodeFilter.FILTER_ACCEPT
                    : NodeFilter.FILTER_REJECT;
            }
        },
        false
    );

    while (treeWalker.nextNode()) {
        nodes.push(treeWalker.currentNode);
    }

    return nodes;
}
