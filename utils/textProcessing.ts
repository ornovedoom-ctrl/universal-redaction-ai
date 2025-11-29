import { DetectedEntity, RedactionMode } from "../types";

// Standard Levenshtein Distance Algorithm
export const calculateLevenshtein = (a: string, b: string): number => {
  const matrix = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[a.length][b.length];
};

const normalizeWhitespace = (str: string): string => {
    return str.replace(/\s+/g, ' ').trim();
};

export const calculateSimilarity = (original: string, redacted: string): number => {
  // Normalize strings to ignore whitespace differences (newlines, double spaces)
  // This ensures the accuracy score reflects content matching, not formatting.
  const a = normalizeWhitespace(original);
  const b = normalizeWhitespace(redacted);
  
  if (a.length === 0) return 0.00;
  
  const dist = calculateLevenshtein(a, b);
  const maxLength = Math.max(a.length, b.length);
  return Math.max(0, ((maxLength - dist) / maxLength) * 100);
};

// Map entities to their actual indices in the text
// This handles duplicate words by keeping a cursor
export const mapEntitiesToIndices = (text: string, entities: DetectedEntity[]): DetectedEntity[] => {
  let cursor = 0;
  const mappedEntities: DetectedEntity[] = [];

  entities.forEach((entity) => {
    const startIndex = text.indexOf(entity.text, cursor);
    
    if (startIndex !== -1) {
      const endIndex = startIndex + entity.text.length;
      mappedEntities.push({
        ...entity,
        startIndex,
        endIndex
      });
      // Move cursor forward to avoid re-matching the same instance for subsequent entities
      cursor = endIndex; 
    }
  });

  return mappedEntities;
};

export const applyRedaction = (
  text: string, 
  entities: DetectedEntity[], 
  mode: RedactionMode
): string => {
  // Sort entities by start index descending to replace from end to start
  // This prevents index shifting issues
  const sortedEntities = [...entities].sort((a, b) => (b.startIndex || 0) - (a.startIndex || 0));

  let result = text;

  sortedEntities.forEach(entity => {
    if (entity.startIndex === undefined || entity.endIndex === undefined) return;

    const before = result.substring(0, entity.startIndex);
    const after = result.substring(entity.endIndex);
    const replacement = mode === 'MASK' ? `[${entity.type}]` : ' '; // Space for pure redaction to avoid merging words

    result = before + replacement + after;
  });

  // Clean up double spaces if in redact mode, but preserve newlines
  if (mode === 'REDACT') {
      // Only collapse horizontal spaces, not newlines to preserve document structure
      result = result.replace(/ +/g, ' ');
  }

  return result;
};