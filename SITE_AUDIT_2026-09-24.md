# NOTO Re:Bloom final site audit — 2026-09-24

## Image optimization
file	before_bytes	candidate_bytes	original_dims	new_dims	normalized_rmse	accepted
field-detail.webp	617682	616372	1108x1477	1108x1477	0.0124616	False
field-overview.webp	383580	379072	1477x1108	1477x1108	0.0104453	False
team-reboost.webp	143626	132720	1800x1200	1800x1200	0.00823497	False
team-presentation.webp	118944	107638	1800x1200	1800x1200	0.00851339	True

## CSS purge
- site.css: 116,455 -> 64,214 chars (44.9% reduction)
- legacy-base-20260924.css: 31,411 -> 29,139 chars (7.2% reduction)
- legacy-core-20260924.css: 48,239 -> 45,985 chars (4.7% reduction)
- legacy-tuning-20260924.css: 102,523 -> 54,422 chars (46.9% reduction)
- CSS purge was automatically rolled back by the visual regression gate.

## Browser QA
- Viewport/page combinations tested: 40
- Horizontal overflow cases: 0
- Broken-image cases: 0
- Console/page-error cases: 0

- Small interactive-target findings (<36px in either dimension): 340

## Lighthouse
- contact-desktop.json: performance 99, accessibility 100, best-practices 100, SEO 100, LCP 883.9024, CLS None, TBT None
- contact-mobile.json: performance 90, accessibility 100, best-practices 100, SEO 100, LCP 3079.3717749999996, CLS None, TBT None
- index-desktop.json: performance 76, accessibility 100, best-practices 100, SEO 100, LCP 1107.816875, CLS 0.5370981645209206, TBT None
- index-mobile.json: performance 48, accessibility 100, best-practices 100, SEO 100, LCP 4805.201, CLS 1, TBT 194.5
- partner-desktop.json: performance 69, accessibility 100, best-practices 100, SEO 100, LCP 1673.9995999999996, CLS 0.8043598596783614, TBT 28.999999999999773
- partner-mobile.json: performance 44, accessibility 100, best-practices 100, SEO 100, LCP 15930.589799999996, CLS 0.2315701638797653, TBT None
- report-desktop.json: performance 95, accessibility 100, best-practices 100, SEO 100, LCP 1166.2088, CLS 0.09295102522983355, TBT 19
- report-mobile.json: performance 61, accessibility 100, best-practices 100, SEO 100, LCP 6144.717999999999, CLS 0.02471076259275015, TBT 426.11999999999944

## Visual regression gate
- Screenshot pairs compared: 40
- Maximum normalized RMSE: 0.319095
- Layout regressions: 0

