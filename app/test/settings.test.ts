import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as path from 'path';
import * as fs from 'fs-extra';
import { SettingsStore } from '../src/main/settings';

vi.mock('fs-extra', async () => {
  const actual = await vi.importActual('fs-extra');
  return {
    ...actual,
    ensureDir: vi.fn(),
    writeJson: vi.fn(),
    readJson: vi.fn(),
    pathExists: vi.fn(),
    rename: vi.fn(),
  };
});

describe('SettingsStore', () => {
  const mockDir = '/mock/profile';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with defaults if no file exists', async () => {
    (fs.pathExists as any).mockResolvedValue(false);
    const store = new SettingsStore(mockDir);
    await store.init();
    
    expect(store.get().autosave).toBe(true);
    expect(fs.writeJson).toHaveBeenCalled();
  });

  it('should load settings from file', async () => {
    (fs.pathExists as any).mockResolvedValue(true);
    (fs.readJson as any).mockResolvedValue({ autosave: false });
    
    const store = new SettingsStore(mockDir);
    await store.init();
    
    expect(store.get().autosave).toBe(false);
  });

  it('should update settings and save', async () => {
    (fs.pathExists as any).mockResolvedValue(true);
    (fs.readJson as any).mockResolvedValue({ autosave: true });
    
    const store = new SettingsStore(mockDir);
    await store.init();
    
    await store.update({ autosave: false });
    expect(store.get().autosave).toBe(false);
    expect(fs.writeJson).toHaveBeenCalled();
  });
});
