# NOTE Free Publisher

All newly queued free NOTE manuscripts must contain at least 5,001 characters. The cloud materializer and the Windows runtime both reject shorter bodies before the editor is opened.

This runtime is deliberately isolated from the paid NOTE publisher. It publishes only entries whose queue contract is `kind: free` and `price: 0`.

## Safety invariants

- Free publication never decrements paid publication debt.
- The publisher explicitly selects/verifies free mode and aborts if a price field remains visible.
- Each article receives a dedicated 1280×670 PNG cover generated locally with Playwright.
- Success requires an anonymous reader-visible URL, exact title, free state, and a large cover image.
- Internal `関連有料候補:` metadata is stripped before publication.
- Paid CTA URLs are not guessed; the first free batch intentionally publishes without an unverified paid URL.
- The runtime uses the existing NOTE `config.json` and authenticated browser profile, but keeps a separate `free_note_state.json` and lock file.

## Windows installation

`INSTALL_FREE_NOTE_PUBLISHER.cmd` downloads the PowerShell installer, verifies the runtime SHA-256, runs JavaScript syntax/queue diagnostics, creates staggered 08:05 and 17:05 daily retry tasks, and immediately attempts the currently ready batch.

Cloud QA is performed by `.github/workflows/note-free-publisher-qa.yml`. A cloud QA pass is not counted as a note.com publication; only the Windows publisher can use the authenticated local NOTE profile and complete platform publication.
