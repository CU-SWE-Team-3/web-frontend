/**
 * Encode 4-byte characters (emojis, etc.) to a safe format for databases that don't support utf8mb4.
 * Uses the format [e:URI_ENCODED_CHAR]
 */
export const encodeEmojis = (text: string): string => {
  if (!text) return text;
  return text.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, (match) => {
    return `[e:${encodeURIComponent(match)}]`;
  });
};

/**
 * Decode encoded 4-byte characters back to their original form.
 */
export const decodeEmojis = (text: string): string => {
  if (!text) return text;
  return text.replace(/\[e:([^\]]+)\]/g, (match, p1) => {
    try {
      return decodeURIComponent(p1);
    } catch {
      return match;
    }
  });
};
