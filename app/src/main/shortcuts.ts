import * as path from 'path';
import * as fs from 'fs-extra';
import { ShortcutBinding, ShortcutMapSchema, findShortcutConflict } from '@excalibur/shared';
import { writeJsonAtomic } from './fs-utils';

/**
 * Per-profile keyboard shortcut customization. Only *overrides* are persisted;
 * defaults live in shared `DEFAULT_SHORTCUTS`. Setting a binding that collides
 * with another command throws unless `force` is given (in which case the other
 * command keeps its binding and the new one wins at resolve-time — see
 * `acceleratorToCommand`).
 */
export class ShortcutStore {
  private file: string;
  private bindings: ShortcutBinding[] = [];

  constructor(profileDir: string) {
    this.file = path.join(profileDir, 'settings', 'shortcuts.json');
  }

  async init() {
    if (await fs.pathExists(this.file)) {
      try {
        this.bindings = ShortcutMapSchema.parse(await fs.readJson(this.file)).bindings;
      } catch {
        this.bindings = [];
      }
    }
  }

  list(): ShortcutBinding[] {
    return this.bindings;
  }

  async set(commandId: string, accelerator: string, force = false): Promise<ShortcutBinding[]> {
    const conflict = findShortcutConflict(this.bindings, commandId, accelerator);
    if (conflict && !force) {
      throw new Error(`"${accelerator}" is already bound to ${conflict}`);
    }
    this.bindings = [...this.bindings.filter((b) => b.commandId !== commandId), { commandId, accelerator }];
    await this.save();
    return this.bindings;
  }

  async reset(commandId?: string): Promise<ShortcutBinding[]> {
    this.bindings = commandId ? this.bindings.filter((b) => b.commandId !== commandId) : [];
    await this.save();
    return this.bindings;
  }

  private async save() {
    await writeJsonAtomic(this.file, ShortcutMapSchema.parse({ bindings: this.bindings }));
  }
}
