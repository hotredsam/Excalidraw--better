import { describe, it, expect } from 'vitest';
import * as path from 'path';
import { readExcalidrawFile } from '../src/main/excalidraw-utils';
import { mergeExcalidraw } from '@excalibur/shared';

describe('Excalidraw Handling', () => {
  const fixturesDir = path.join(__dirname, 'fixtures');

  it('should read and validate .excalidraw files', async () => {
    const filePath = path.join(fixturesDir, 'sample.excalidraw');
    const data = await readExcalidrawFile(filePath);
    
    expect(data.type).toBe('excalidraw');
    expect(data.elements.length).toBe(1);
    expect(data.metadata.custom_field).toBe('preserve me');
  });

  it('should extract scene from .excalidraw.svg files', async () => {
    const filePath = path.join(fixturesDir, 'sample.excalidraw.svg');
    const data = await readExcalidrawFile(filePath);
    
    expect(data.type).toBe('excalidraw');
    expect(data.elements.length).toBe(1);
    expect(data.elements[0].type).toBe('rectangle');
  });

  it('should preserve unknown fields during merge', () => {
    const existing = {
      type: 'excalidraw',
      elements: [],
      metadata: { keep: 'me' },
      customTopLevel: 123
    };
    
    const newElements = [{ id: '1', type: 'selection' }];
    const newAppState = { theme: 'dark' };
    
    const merged = mergeExcalidraw(existing, newElements, newAppState);
    
    expect(merged.metadata.keep).toBe('me');
    expect((merged as any).customTopLevel).toBe(123);
    expect(merged.elements.length).toBe(1);
    expect(merged.appState.theme).toBe('dark');
  });

  it('should throw error for unsupported files', async () => {
    await expect(readExcalidrawFile('test.txt')).rejects.toThrow('Unsupported file type');
  });
});
