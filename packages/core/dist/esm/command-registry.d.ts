import { Command, PluginContributes } from '@excalibur/shared';
/**
 * The built-in command set surfaced in the command palette (Ctrl+K). Plugin
 * contributions (commands + toolbar items) are merged on top at runtime.
 */
export declare const CORE_COMMANDS: Command[];
/** Merge core commands with the contributions of enabled plugins. */
export declare function buildCommandList(contributions?: PluginContributes): Command[];
