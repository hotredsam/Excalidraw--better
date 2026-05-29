import { AiPayload, AiApplyResult, Settings } from '@excalibur/shared';
/**
 * Applies a *validated* AI-import payload within a profile boundary. All writes
 * are confined to the profile directory (plugins/, templates/, settings/,
 * docs/); nothing escapes via traversal because names are sanitized first.
 */
export declare function applyAiPayload(profileDir: string, payload: AiPayload, applySettings?: (partial: Partial<Settings>) => Promise<void>): Promise<AiApplyResult>;
