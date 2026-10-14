import DOMPurify from "dompurify";

const ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "br", "span", "hr",
  "ul", "ol", "li",
  "a",
  "img",
  "blockquote",
  "code", "pre",
  "b", "strong",
  "i", "em",
  "u"
];

const ALLOWED_ATTR = [
  "href", "title", "target", "rel",
  "src", "alt", "width", "height", "class"
];

// Configure link security hook: ensures all links have rel="noopener noreferrer"
if (typeof window !== "undefined") {
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A" && node.getAttribute("href")) {
      node.setAttribute("rel", "noopener noreferrer");
      if (!node.getAttribute("target")) {
        node.setAttribute("target", "_blank");
      }
    }
  });
}

/**
 * Sanitizes rich text article HTML to eliminate XSS vectors
 * while preserving safe typography and media elements.
 */
export function sanitizeArticleContent(dirtyHtml: string | null | undefined): string {
  if (!dirtyHtml) return "";
  return DOMPurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ADD_ATTR: ["target", "rel"],
  });
}
