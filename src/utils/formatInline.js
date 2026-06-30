/**
 * formatInline — converts a subset of inline HTML tags within a raw string
 * into actual HTML markup, suitable for use with dangerouslySetInnerHTML.
 *
 * Supported tags:
 *   <b>…</b>   → <strong>…</strong>
 *   <i>…</i>   → <em>…</em>
 *   <u>…</u>   → <u>…</u>
 *   <s>…</s>   → <s>…</s>
 *   <a href="…">…</a> → <a href="…" target="_blank" rel="noopener noreferrer">…</a>
 *   \n          → <br />
 *
 * HTML entities (e.g. &lt; &gt; &amp; &nbsp; &quot; &#39;) are passed through
 * verbatim — the browser's HTML parser decodes them automatically when the
 * result is used with dangerouslySetInnerHTML.
 *
 * @param {string} text - Raw text possibly containing inline tags
 * @returns {string} HTML string safe for dangerouslySetInnerHTML
 */
export function formatInline(text) {
  if (!text) return '';
  return text
    .replace(/<b>/g, '<strong>')
    .replace(/<\/b>/g, '</strong>')
    .replace(/<i>/g, '<em>')
    .replace(/<\/i>/g, '</em>')
    .replace(/<u>/g, '<u>')
    .replace(/<\/u>/g, '</u>')
    .replace(/<s>/g, '<s>')
    .replace(/<\/s>/g, '</s>')
    // Hyperlinks — open in new tab, safe rel
    .replace(
      /<a\s+href="([^"]*)">([\s\S]*?)<\/a>/g,
      (_, href, content) =>
        `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;">${content}</a>`
    )
    .replace(/\n/g, '<br />');
}
