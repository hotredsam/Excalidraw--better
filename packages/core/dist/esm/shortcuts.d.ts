import { ShortcutBinding } from '@excalibur/shared';
/**
 * Per-profile keyboard shortcut customization. Only *overrides* are persisted;
 * defaults live in shared `DEFAULT_SHORTCUTS`. Setting a binding that collides
 * with another command throws unless `force` is given (in which case the other
 * command keeps its binding and the new one wins at resolve-time — see
 * `acceleratorToCommand`).
 */
export declare class ShortcutStore {
    private file;
    private bindings;
    constructor(profileDir: string);
    init(): Promise<void>;
    list(): ShortcutBinding[];
    set(commandId: string, accelerator: string, force?: boolean): Promise<ShortcutBinding[]>;
    reset(commandId?: string): Promise<ShortcutBinding[]>;
    private save;
}
