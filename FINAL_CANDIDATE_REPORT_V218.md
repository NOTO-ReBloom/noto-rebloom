# Final Candidate 2.18 — Launch Failsafe Report

## Problem

The public page still exposed the old 2.0 build. Its HTML contained the launch labels, but the player reported that no usable start button appeared on screen. The previous 2.17 repair still depended on the main stylesheet being the current file and on the repository actually deploying the new `site/` directory.

## Design change

The launch controls are now structurally independent from the title copy.

- `#title-launch-dock` is a direct child of `#title-screen`.
- Its critical geometry and visibility rules are embedded in `index.html` after the normal stylesheet link.
- The rules use `!important` deliberately so an older external stylesheet cannot hide or move the dock.
- The original button IDs are preserved, so existing input and save logic remains compatible.
- `window.FB_START()` exposes the same start routine for automated checks and direct-start recovery.
- `?start=1` starts the premonition sequence after normal initialization.

## Deployment fingerprint

`site/version.json` must return:

```json
{
  "title": "第四の寝室",
  "version": "2.18.0",
  "build": "launch-failsafe",
  "startButtonId": "new-game",
  "deploymentPath": "site"
}
```

If the public URL still shows `VERSION 2.0.0` or `version.json` is missing, the repository is not deploying the new `site/` folder.

## Integrity

The story data, evidence data, game-over data and endings are byte-equivalent after structured serialization to 2.17. Only launch, boot-health, cache and deployment files changed.
