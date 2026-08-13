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
