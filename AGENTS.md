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
- Confirmed incident on 2026-08-13: macOS 26.2, Edge-installed PWA, and WeType accepted pinyin keystrokes but displayed no candidate window. Reinstalling the PWA from `edge://apps` without clearing browsing data restored input. The recreated shim still had a browser patch-version difference, so the cause was not stale site JavaScript, Service Worker cache, or that version difference; the recovery came from rebuilding the native shim, app identity/registration, process, and text-input context.
- Recovery order: fully quit the PWA and Edge; compare with Apple's built-in Simplified Pinyin; uninstall from `edge://apps` without selecting the option to clear browsing data, restart Edge, and reinstall; then update Edge and the third-party input method. A normal browser tab is the safe fallback if the native candidate window still fails.

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
