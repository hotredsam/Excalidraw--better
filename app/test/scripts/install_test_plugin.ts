import * as fs from 'fs-extra';
import * as path from 'path';
import { app } from 'electron';

// This script is intended to be run within the electron context or with a mock app path
// For simplicity, I'll just hardcode the path for Windows
const APPDATA = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME + '/.config');
const PLUGINS_BASE = path.join(APPDATA, 'Excalibur', 'profiles');

async function installTestPlugin() {
  if (!fs.existsSync(PLUGINS_BASE)) {
    console.log('App not run yet? No profiles found.');
    return;
  }

  const profiles = await fs.readdir(PLUGINS_BASE);
  const defaultProfile = profiles.find(p => p !== 'profiles.json' && p !== 'active.json');

  if (defaultProfile) {
    const target = path.join(PLUGINS_BASE, defaultProfile, 'plugins', 'hello-world');
    const source = path.join(__dirname, '../fixtures/plugins/hello-world');
    await fs.copy(source, target);
    console.log(`Installed test plugin to profile: ${defaultProfile}`);
  }
}

installTestPlugin();
