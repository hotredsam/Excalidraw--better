/**
 * Fuzzy command matcher. Re-exported from `@excalibur/shared`, which now ships a
 * proper ESM build so the renderer can consume runtime helpers directly (no more
 * duplicated copy). Behaviour is covered by the shared unit tests.
 */
export { fuzzyScore, filterCommands } from '@excalibur/shared';
