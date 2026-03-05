// src/lib/rip-parser.ts

/**
 * Parses RIP status markers in string/HTML and converts them to styled HTML badges.
 * Markers: [VERIFICIRAN], [INDICIRAN], [PRETPOSTAVLJEN], [PODATAK NEDOSTAJE]
 */
export function normalizeGeneratedHtml(content: string): string {
    if (!content) return "";

    return content
        .replace(/^\s*```(?:html)?\s*/i, "")
        .replace(/\s*```\s*$/i, "")
        .trim();
}

export function parseRIPStatus(content: string): string {
    if (!content) return "";

    let parsed = normalizeGeneratedHtml(content);

    const markers = [
        {
            key: "[VERIFICIRAN]",
            color: "#10b981", // emerald-500
            bg: "rgba(16, 185, 129, 0.1)",
            text: "VERIFICIRAN"
        },
        {
            key: "[INDICIRAN]",
            color: "#3b82f6", // blue-500
            bg: "rgba(59, 130, 246, 0.1)",
            text: "INDICIRAN"
        },
        {
            key: "[PRETPOSTAVLJEN]",
            color: "#f59e0b", // amber-500
            bg: "rgba(245, 158, 11, 0.1)",
            text: "PRETPOSTAVLJEN"
        },
        {
            key: "[PODATAK NEDOSTAJE]",
            color: "#ef4444", // red-500
            bg: "rgba(239, 68, 68, 0.1)",
            text: "NEDOSTAJE"
        }
    ];

    markers.forEach(m => {
        const badge = `<span style="display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 800; letter-spacing: 0.05em; background: ${m.bg}; color: ${m.color}; border: 1px solid ${m.color}33; margin: 0 4px; vertical-align: middle;">${m.text}</span>`;

        // Escape the marker for regex
        const escapedKey = m.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedKey, 'g');
        parsed = parsed.replace(regex, badge);
    });

    return parsed;
}
