# Font License Audit — 2026-09-26

## Zen Maru Gothic

- Typeface: Zen Maru Gothic
- Designer: Yoshimichi Ohira
- Upstream project: https://github.com/googlefonts/zen-marugothic
- Distribution used by the site: Google Fonts CSS endpoint
- License: SIL Open Font License (OFL)
- Official project README license statement: SIL Open Font License (OFL.txt)

## Usage in NOTO Re:Bloom flower diagnosis

Zen Maru Gothic is used as a display/UI typeface on the flower-diagnosis page, mainly for headings, buttons, labels, flower names, and other short interface text. Body copy keeps the existing local system-font stack for readability and performance.

The font is loaded from Google Fonts in a non-render-blocking way with local rounded-font fallbacks. No font binary is stored in this repository.

## Design rationale

The upstream project describes Zen Maru Gothic as a rounded sans-serif with a soft and natural impression, suitable for cute and fashionable communication. This matches the visual direction of the flower-diagnosis experience while preserving Japanese readability.

## Safeguards

The diagnosis validation workflow checks that:
- the intended Zen Maru Gothic Google Fonts URL is present;
- the stylesheet is loaded non-blocking;
- the CSS display stack includes Zen Maru Gothic with local fallbacks.

If the font source, loading method, or license changes, this record should be reviewed again.
