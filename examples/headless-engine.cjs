/*
 * Headless (non-Electron) embedding example.
 *
 * Drives the same @excalibur/core engine the desktop app uses, but with no
 * Electron, no window, no IPC — just the in-process API handlers against a
 * temp directory. Run it with:  node examples/headless-engine.cjs
 */
const os = require('os');
const path = require('path');
const fs = require('fs');
const { ExcaliburEngine, createApiHandlers, defaultHostServices } = require('@excalibur/core');

async function main() {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'excalibur-headless-'));
  const workspaceDir = fs.mkdtempSync(path.join(os.tmpdir(), 'excalibur-vault-'));

  // A host with no native dialogs: the "folder picker" just returns our vault.
  const host = defaultHostServices({
    userDataDir,
    appVersion: 'headless-1.0.0',
    pickDirectory: async () => workspaceDir,
  });

  const engine = new ExcaliburEngine(host);
  await engine.init(); // scaffolds a Default profile on first run
  const api = createApiHandlers(engine); // <- a full ExcaliburApi, zero Electron

  const ping = await api.app.ping();
  const { profiles } = await api.profiles.list();
  const ws = await api.workspaces.add(); // uses host.pickDirectory()
  const file = await api.workspaces.createFile(ws.id, null, 'hello');
  await api.workspaces.writeFile(ws.id, file.path, '{"type":"excalidraw","elements":[]}');
  const content = await api.workspaces.readFile(ws.id, file.path);
  const files = await api.workspaces.listFiles(ws.id);

  console.log('ping            :', ping);
  console.log('profiles        :', profiles.map((p) => p.name));
  console.log('workspace added :', ws.path === workspaceDir);
  console.log('file created    :', path.basename(file.path));
  console.log('round-trip ok   :', content.includes('excalidraw'));
  console.log('listed files    :', files.map((f) => f.name));

  fs.rmSync(userDataDir, { recursive: true, force: true });
  fs.rmSync(workspaceDir, { recursive: true, force: true });
  console.log('\n✓ Embedded the engine headlessly — no Electron involved.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
