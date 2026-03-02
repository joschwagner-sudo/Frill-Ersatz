import { marked } from "marked";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

/**
 * Markdown component to safely render markdown content.
 * Handles server-side sanitization using JSDOM.
 */
export default async function Markdown({ content }: { content: string }) {
    if (!content) return null;

    // marked.parse returns a string or a Promise<string> depending on config
    // For standard usage it's usually a string, but we'll await just in case
    const rawHtml = await marked.parse(content);

    // Server-side sanitization
    const window = new JSDOM("").window;
    const purify = DOMPurify(window);
    const cleanHtml = purify.sanitize(rawHtml);

    return (
        <div
            className="markdown-content"
            dangerouslySetInnerHTML={{ __html: cleanHtml }}
        />
    );
}
