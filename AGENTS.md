# Repository instructions

## GitHub and remote Git operations

- Treat `gh` commands that contact GitHub and remote Git commands such as `git fetch`, `git pull`, `git push`, and `git ls-remote` as network operations that must run outside the sandbox on the first attempt.
- Do not diagnose authentication, DNS, token, or connectivity failures from a sandboxed network attempt.
- Keep local-only commands such as `git status`, `git diff`, `git log`, `git add`, and `git commit` sandboxed when allowed.

## Documentation maintenance

- Keep `README.md` concise and product-focused; put detailed workflows in `docs/` and link them from `docs/README.md`.
- Update `CHANGELOG.md` for every user-visible release and keep `SECURITY.md`, `CONTRIBUTING.md`, and topic guides consistent with actual behavior.
- When commands, button names, storage keys, supported tools, security boundaries, file names, or release steps change, update every affected guide in the same commit.
- Treat documentation links, copyable commands, Mermaid diagrams, and version references as release-tested interfaces.

## macOS Edge PWA and IME diagnostics

- Distinguish a web composition-event bug from a native candidate-window bug before changing frontend code. If the candidate list appears but `Enter` sends or interrupts the message, inspect `compositionstart`, `compositionend`, `isComposing`, and `keyCode 229`. If pinyin keystrokes appear but the candidate list never opens, treat it first as a macOS/Chromium PWA App Shim input-context issue.
- A Chromium PWA installed on macOS runs through a generated native App Shim, separate from a normal browser tab. The IME candidate window is native OS UI; the page, Service Worker, and application cache cannot force it to appear.
- For a missing candidate window, first verify the live application version, test the same input method in a normal Edge tab, and test Apple's built-in Simplified Pinyin. Do not publish another frontend or Service Worker release unless the issue also reproduces in a normal browser tab or the page receives composition events and mishandles them.
- The Edge App Shim normally lives under `$HOME/Applications/Edge Apps.localized/<App>.app`. Useful read-only evidence includes `app_mode_loader`, `CrAppModeShortcutURL`, `CrAppModeUserDataDir`, LaunchServices registration, and ad-hoc code-signing state. Never put a user's personal home path or profile data in public reports, and never delete the Edge profile or Web Applications directory as a first-line fix.
- Confirmed incident on 2026-08-13: macOS 26.2, Edge-installed PWA, and WeType accepted pinyin keystrokes but displayed no candidate window. Reinstalling the PWA from `edge://apps` temporarily restored input, but the failure returned after an Edge update/restart. The recreated shim still had a browser patch-version difference, so the cause was not stale site JavaScript, Service Worker cache, or that version difference; rebuilding the native shim only refreshed the app identity/registration, process, and text-input context until Edge changed it again.
- Do not present Edge PWA reinstallation as a permanent fix. Recovery order: fully quit the PWA and Edge; compare with Apple's built-in Simplified Pinyin; use a normal browser tab for immediate access. For a durable macOS third-party-IME setup with remote HTTPS APIs, open the site in Safari and use “File → Add to Dock”; this creates a Safari Web App that does not depend on Edge's App Shim lifecycle. Local CLI bridging still requires an Edge or Chrome normal tab. Edge PWA reinstall without clearing browsing data remains a temporary recovery option only.

## Local bridge window behavior

- A downloaded launcher must not open a duplicate browser window when the originating page or PWA is still running. The page discovers the authenticated bridge and any automatically selected replacement port; the bridge waits for that client contact before deciding whether a return target is needed.
- If no existing client contacts the bridge, prefer launching an installed `AI Shakedown Console.app` on macOS and pass the pairing callback URL to it. Only fall back to the default browser when no installed app is available.
- Keep the bridge token in `sessionStorage` and scan only the launcher's bounded 100-port range. Discovery must use a random challenge and an HMAC proof bound to the candidate port before the page sends its Bearer token, so unrelated occupied ports never receive pairing secrets. Continue to require the exact Origin for every bridge request, and never stop a process merely because it occupies one of those ports.

## Safari local bridge transport boundary

- A Safari Web App created with “Add to Dock” is independent from Safari and does not share browsing history, cookies, website data, or settings. Do not expect it to inherit an Edge, Chrome, or Safari-tab pairing; the bridge token must remain in `sessionStorage`.
- Current Safari/WebKit blocks an online HTTPS page from fetching `http://127.0.0.1`; WebKit bug 171934 remains open. Local Network permission does not make this mixed-content transport work. Do not diagnose this Safari failure as a launcher, token, port, CLI-login, firewall, or Service Worker bug.
- In Safari on an online HTTPS deployment, show the compatibility explanation immediately and disable launcher download/connection checks. Direct local CLI users to an Edge or Chrome normal tab. Safari Web Apps remain appropriate for stable third-party IME input with remote HTTPS APIs.
- Never bypass this browser boundary by asking users to disable security controls, install a shared/self-signed root certificate, expose the bridge on a LAN address, embed a reusable TLS private key, or route CLI traffic through an unapproved public tunnel. A signed desktop application is the future path for combining stable macOS IME behavior with local CLI access.

## Chat attachments and multimodal capability

- Never show the attachment button based only on a provider or model name. The exact provider/protocol/Base URL/chat path/model/proxy configuration must pass a real minimal image request first; cache supported/unsupported results per configuration signature.
- Treat explicit 400/415/422 image/vision/multimodal rejection as a working text-only connection. Authentication, rate-limit, network, gateway, or ambiguous failures must keep attachment capability unknown and fail the connection check.
- Local CLI bridges do not expose webpage attachments until their transport has been explicitly implemented and tested; keep the attachment button hidden for them.
- Preserve the stable stored-message schema and attachment IndexedDB references when editing chat behavior. Images are sent as protocol-native multimodal blocks; text/code and locally extracted PDF text are sent as named text attachments. Never expose image base64 in the request inspector.
- Chromium `FileList` objects are live. Copy selected files with `Array.from(input.files)` before clearing a file input, or the async attachment pipeline can receive an empty list.

## Local Codex task visibility

- Webpage Codex conversations must default to App Server `thread/start` with `ephemeral: true`, so they remain in the webpage and do not appear in Codex recent tasks. `serviceName` is metrics metadata and is not a privacy or visibility control.
- Only send `ephemeral: false` after the user explicitly enables “同时保存到 Codex”. Include the history mode in the in-memory conversation key so switching the toggle starts a separate thread instead of changing the visibility of an existing one.
- If an installed Codex version rejects the `ephemeral` field, fail safely and ask the user to update. Never silently retry without the field, because that would materialize a task the user chose not to save.
- Release tests must exercise both modes against an App Server stub and confirm the exact `thread/start` payload. Existing materialized Codex tasks are user data; never delete them automatically.

## Complete chat backup and restore

- The complete backup format is `ai-shakedown-console-chat-backup` version 1. It contains all conversations, System content, active-agent metadata, drafts, branches, and referenced IndexedDB attachments, but never API keys, connection profiles, CLI authentication, pairing tokens, or the custom-agent library.
- Images are base64 in the backup; text and extracted PDF content are UTF-8. Treat the JSON as unencrypted sensitive data and keep the 512 MiB import limit.
- Restore is append-only. Remap conversation, message, and attachment IDs; preserve branch and attachment relationships; use the backup/source key to prevent duplicate imports; roll back newly written attachments if the import cannot be persisted.
- Preserve the stable stored-message schema and verify backup/restore with separate browser Origins, including attachments, drafts, System, active-agent metadata, duplicate import protection, and post-reload persistence.

## Same-version PWA candidates

- If the user explicitly keeps the public version unchanged, do not silently raise it. Advance an internal Service Worker cache revision such as `v25-r2`, retain `updateViaCache: "none"`, regenerate and verify the v25 ZIP, and document that this is a same-version content revision.

## Release completion

- Treat a user-facing feature or version change as incomplete until its Cloudflare Pages deployment ZIP has been generated and verified.
- Keep the release version synchronized in `README.md`, `_worker.js`, `index.html`, and all cache-busting asset query strings.
- Also keep `CHANGELOG.md`, topic documentation, `assets/local-codex-bridge.mjs`, the PWA manifest, and Service Worker cache names synchronized when they mention the release.
- Name release archives `AI-Shakedown-Console-cf-pages-worker-v<version>.zip` and create them in the repository root.
- Package exactly the deployable site inputs: `index.html`, `script.js`, `style.css`, `_worker.js`, `vendor/`, `agents/`, and `assets/`. PWA files (`manifest.webmanifest`, `service-worker.js`, and install icons) live under `assets/` and must remain in the archive.
- For PWA releases, keep the manifest, service-worker cache name and precache query strings synchronized with the app version; verify the manifest and icon sizes in addition to the normal JavaScript checks.
- Before handing off, run JavaScript syntax checks, `git diff --check`, list the ZIP contents, and report the archive path and size.
- Never remove older release archives unless the user explicitly asks.
- When the user expects a GitHub update, finish the release by committing and pushing the intended branch; run GitHub network commands outside the filesystem sandbox first instead of treating sandbox authentication failures as real account failures.
