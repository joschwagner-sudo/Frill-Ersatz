import { marked } from "marked";

/**
 * Markdown component to safely render markdown content.
 */
export default async function Markdown({ content }: { content: string }) {
    if (!content) return null;

    const rawHtml = await marked.parse(content);

    return (
        <div
            className="markdown-content"
            dangerouslySetInnerHTML={{ __html: rawHtml }}
        />
    );
}
