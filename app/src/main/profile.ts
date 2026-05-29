import { app } from 'electron';
import { ProfileStore as CoreProfileStore } from '@excalibur/core';

/**
 * Electron-backed ProfileStore. The store logic lives in @excalibur/core (which
 * takes the base directory as an argument); this subclass preserves the historic
 * zero-argument constructor by sourcing the base directory from Electron's
 * per-user data path.
 */
export class ProfileStore extends CoreProfileStore {
  constructor(userDataDir: string = app.getPath('userData')) {
    super(userDataDir);
  }
}
