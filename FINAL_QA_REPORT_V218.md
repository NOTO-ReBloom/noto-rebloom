# Final QA Report V2.18

## Launch matrix

The launch dock and start action passed at:

- 1920×1080
- 1440×900
- 1366×768
- 1280×720
- 1024×768
- 768×1024
- 430×932
- 390×844
- 375×667
- 320×568

For every size, the test confirms:

1. exactly one `#new-game` exists;
2. the button rectangle is fully inside the viewport;
3. the button center is the top hit target;
4. computed display, visibility, opacity and pointer events allow interaction;
5. boot status becomes `起動できます`;
6. clicking opens the premonition screen.

## Failure-mode tests

- `styles.css` returns 404: passed; launch dock remains visible and starts the game.
- `styles.css` returns an empty/stale file: passed.
- `window.FB_START()` direct API: passed.
- cache-busted CSS and JavaScript references: present.
- Service Worker cache: `fourth-bedroom-v2.18.0`.

## Full-route regression

- visited nodes: 648
- advances: 1,442
- choices: 57
- choice history: 58
- puzzles: 11
- investigations: 26
- insights: 6
- deaths: `GO01`, `GO04`, `GO26`
- loop plans: all correct
- consequence stages: team, custody, signature
- chapter briefings: 5
- TRUE END: `a631`
- page errors: 0
- console errors: 0

## GitHub Pages subpath

- base path: `/fourth-bedroom/`
- checked references: 73
- missing references: 0
- root-absolute references: 0
- relative Service Worker scope: passed

## Data integrity

The 2.17 and 2.18 hashes are identical for nodes, evidence, game-overs and endings.
