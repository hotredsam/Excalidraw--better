/**
 * The built-in command set surfaced in the command palette (Ctrl+K). Plugin
 * contributions (commands + toolbar items) are merged on top at runtime.
 */
export const CORE_COMMANDS = [
    { id: 'core.command-palette', title: 'Command palette', category: 'App', accelerator: 'Ctrl+K', source: 'core' },
    { id: 'core.save', title: 'Save', category: 'File', accelerator: 'Ctrl+S', source: 'core' },
    { id: 'core.save-as', title: 'Save As…', category: 'File', accelerator: 'Ctrl+Shift+S', source: 'core' },
    { id: 'core.new', title: 'New Drawing', category: 'File', accelerator: 'Ctrl+N', source: 'core' },
    { id: 'core.daily-note', title: "Open today's daily note", category: 'File', source: 'core' },
    { id: 'core.duplicate', title: 'Duplicate current drawing', category: 'File', source: 'core' },
    { id: 'core.export', title: 'Export…', category: 'File', accelerator: 'Ctrl+P', source: 'core' },
    { id: 'core.export-markdown', title: 'Export as Markdown', category: 'File', source: 'core' },
    { id: 'core.search', title: 'Search files', category: 'Navigate', accelerator: 'Ctrl+F', source: 'core' },
    { id: 'core.recents', title: 'Open recent…', category: 'Navigate', source: 'core' },
    { id: 'core.toggle-properties', title: 'Show Properties panel', category: 'View', source: 'core' },
    { id: 'core.toggle-templates', title: 'Show Templates panel', category: 'View', source: 'core' },
    { id: 'core.toggle-plugins', title: 'Show Plugins panel', category: 'View', accelerator: 'Ctrl+Shift+P', source: 'core' },
    { id: 'core.toggle-ai', title: 'Show AI Import panel', category: 'View', accelerator: 'Ctrl+I', source: 'core' },
    { id: 'core.toggle-libraries', title: 'Show Libraries panel', category: 'View', source: 'core' },
    { id: 'core.toggle-review', title: 'Show Review panel', category: 'View', source: 'core' },
    { id: 'core.toggle-git', title: 'Show Git panel', category: 'View', source: 'core' },
    { id: 'core.toggle-stats', title: 'Show Workspace Stats', category: 'View', source: 'core' },
    { id: 'core.presentation', title: 'Start Presentation', category: 'View', source: 'core' },
    { id: 'core.save-template', title: 'Save canvas as template', category: 'Templates', source: 'core' },
    { id: 'core.import-image', title: 'Import image onto canvas', category: 'Insert', source: 'core' },
    { id: 'core.import-svg', title: 'Import SVG as editable elements', category: 'Insert', source: 'core' },
    { id: 'core.toggle-snippets', title: 'Show Snippets panel', category: 'View', source: 'core' },
    { id: 'core.save-snippet', title: 'Save selection as snippet', category: 'Insert', source: 'core' },
    { id: 'core.settings', title: 'Open Settings', category: 'App', source: 'core' },
];
/** Merge core commands with the contributions of enabled plugins. */
export function buildCommandList(contributions) {
    const commands = [...CORE_COMMANDS];
    if (contributions) {
        for (const c of contributions.commands) {
            commands.push({ id: c.id, title: c.title, category: 'Plugin', accelerator: c.accelerator, source: 'plugin' });
        }
        for (const t of contributions.toolbar) {
            commands.push({ id: t.id, title: t.title, category: 'Plugin', accelerator: t.accelerator, source: 'plugin' });
        }
    }
    return commands;
}
