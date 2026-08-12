# Repository instructions

## Release completion

- Treat a user-facing feature or version change as incomplete until its Cloudflare Pages deployment ZIP has been generated and verified.
- Keep the release version synchronized in `README.md`, `_worker.js`, `index.html`, and all cache-busting asset query strings.
- Name release archives `AI-Shakedown-Console-cf-pages-worker-v<version>.zip` and create them in the repository root.
- Package exactly the deployable site inputs: `index.html`, `script.js`, `style.css`, `_worker.js`, `vendor/`, `agents/`, and `assets/`.
- Before handing off, run JavaScript syntax checks, `git diff --check`, list the ZIP contents, and report the archive path and size.
- Never remove older release archives unless the user explicitly asks.
- When the user expects a GitHub update, finish the release by committing and pushing the intended branch; run GitHub network commands outside the filesystem sandbox first instead of treating sandbox authentication failures as real account failures.
