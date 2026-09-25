# Flower Photo License Audit — 2026-09-26

This record documents the license review for the 32 flower photographs used by `diagnosis.html`.

## Inventory

- Pexels: 25 photographs
- Unsplash: 5 photographs
- Pixabay: 1 photograph
- Wikimedia Commons: 1 photograph
- Total: 32 photographs

The exact creator, original photo page, license URL, and local flower slug for every image are recorded in `flower-photo-credits.json` and rendered on `photo-credits.html`.

## License review

### Pexels

Official license reviewed:
https://www.pexels.com/license/

The Pexels license permits free use of photos, including website use and modification. Attribution is not required under the standard Pexels license, although credit is appreciated. The project nevertheless records the photographer and original photo page for all Pexels images.

### Unsplash

Official license / terms reviewed:
https://unsplash.com/license
https://unsplash.com/terms

The Unsplash License permits downloading, copying, modifying, distributing, and using images for free, including commercial use, without requiring attribution under the standard license. The project nevertheless records the photographer and source page for transparency. The project is using locally downloaded image files, not the Unsplash API.

### Pixabay

Official license summary reviewed:
https://pixabay.com/service/license-summary/

The Pixabay Content License permits free use and modification without mandatory attribution, subject to its prohibited uses. The project records the contributor and source page voluntarily.

### Wikimedia Commons / Renge

Original work:
- Title: Astragalus sinicus (25645794703).jpg
- Creator: houroumono
- Source: https://commons.wikimedia.org/wiki/File:Astragalus_sinicus_(25645794703).jpg
- License: CC BY 2.0
- License URL: https://creativecommons.org/licenses/by/2.0/

CC BY 2.0 requires appropriate attribution, a license link, and an indication of modifications. The site therefore identifies houroumono, links the original work and CC BY 2.0 license, and states that the image was cropped and converted to WebP. The same attribution is preserved on generated share cards, outside the photograph itself.

## Design and reuse policy

- No text or branding is placed over the flower photographs on the web page.
- License/credit text is placed outside the photograph.
- Pexels, Unsplash, and Pixabay credits are retained voluntarily on the dedicated credits page.
- The CC BY 2.0 attribution for the Renge photograph must not be removed.
- Photos are used as part of the flower-diagnosis presentation, not redistributed as a standalone stock-photo collection.
- Images featuring identifiable people, prominent brands, or third-party artworks are not used as the subject of this flower gallery.

## Automated safeguards

The diagnosis validation workflow checks:
- exactly 32 photo-credit records;
- a matching local WebP file for each flower slug;
- approved provider names;
- HTTPS source and license URLs;
- complete CC BY metadata for the Renge image;
- required Renge attribution terms on the site/share-card implementation.

The browser E2E test checks:
- all 32 flower image assets can be loaded;
- all 32 atlas images are visible;
- the hero photo loads;
- photo pseudo-overlays are absent;
- the result photo has no overlaid label;
- the hero credit appears outside the photo.

This is an engineering/license-compliance record, not legal advice. If a provider changes its license terms or an image source is replaced, the relevant source page and license should be reviewed again.
