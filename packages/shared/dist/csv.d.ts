/** Minimal CSV serialize/parse (RFC-4180-ish: quotes, commas, newlines). */
export declare function toCSV(rows: Record<string, any>[], columns?: string[]): string;
export declare function parseCSV(text: string): Record<string, string>[];
