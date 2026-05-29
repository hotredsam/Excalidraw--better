/**
 * Simple back/forward navigation history for opened files. Kept in the renderer
 * (no IPC needed). Behaviour mirrors a browser history stack: pushing a new
 * entry truncates any forward entries.
 */
export class NavigationHistory<T> {
  private entries: T[] = [];
  private index = -1;

  constructor(private limit = 100) {}

  push(entry: T, equals: (a: T, b: T) => boolean = (a, b) => a === b): void {
    // Ignore consecutive duplicates of the current entry.
    if (this.index >= 0 && equals(this.entries[this.index], entry)) return;
    this.entries = this.entries.slice(0, this.index + 1);
    this.entries.push(entry);
    if (this.entries.length > this.limit) this.entries.shift();
    this.index = this.entries.length - 1;
  }

  canBack(): boolean {
    return this.index > 0;
  }

  canForward(): boolean {
    return this.index >= 0 && this.index < this.entries.length - 1;
  }

  back(): T | null {
    if (!this.canBack()) return null;
    this.index--;
    return this.entries[this.index];
  }

  forward(): T | null {
    if (!this.canForward()) return null;
    this.index++;
    return this.entries[this.index];
  }

  current(): T | null {
    return this.index >= 0 ? this.entries[this.index] : null;
  }

  size(): number {
    return this.entries.length;
  }
}
