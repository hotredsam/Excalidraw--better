\# Security Constraints (Non-negotiables)



\## 1) Electron security baseline

\- contextIsolation: true

\- sandbox: true where possible

\- nodeIntegration: false in renderer

\- preload exposes a minimal safe API

\- strict Content-Security-Policy (no remote code exec)



\## 2) IPC rules

\- Allowlist channels only

\- Every IPC payload validated with a schema (zod or equivalent)

\- No raw filesystem objects passed to renderer

\- No “eval” or dynamic require from renderer



\## 3) Filesystem permissions model

Default: read-only + “open/save dialogs”.

To unlock “full file control”, user must:

\- enable it in Settings

\- choose allowed workspace folders

\- confirm destructive actions (delete/move)



Blocked by default:

\- Windows system directories (C:\\Windows\\\*, Program Files\\\*)

\- Hidden/system files unless user toggles “show hidden”



Deletion:

\- Send to Recycle Bin if possible

\- If permanent deletion is necessary, it requires extra confirmation.



\## 4) Plugin sandboxing

\- Plugins must declare permissions:

&nbsp; - filesystem: none | workspace-only | user-approved paths

&nbsp; - network: none | allowed domains | unrestricted (discouraged)

\- Default permission = none

\- Plugin code runs with restricted APIs; never direct fs in renderer.



\## 5) Networking stance

\- No required cloud services.

\- No telemetry by default.

\- LAN features (if any) must be OFF by default and clearly labeled.



\## 6) Secrets / encryption

\- Profile settings can be unencrypted by default.

\- Optional: profile “vault encryption” for local drawings using OS keychain:

&nbsp; - Windows Credential Manager / DPAPI

\- Do not invent crypto—use standard libs.



\## 7) Threat model highlights

\- Malicious plugin tries to steal files

\- Path traversal via crafted filename

\- User drags an “AI payload” that tries to write outside workspace

\- Supply chain risk via plugin zip



Mitigations must be documented in docs/SECURITY.md

