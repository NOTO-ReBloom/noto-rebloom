# NOTO Re:Bloom final site audit — 2026-09-24

## Image optimization
file	before_bytes	candidate_bytes	original_dims	new_dims	normalized_rmse	accepted
field-detail.webp	862902	617682	1108x1477	1108x1477	0.020334	True
field-overview.webp	557094	383580	1477x1108	1477x1108	0.0200444	True
team-reboost.webp	277874	143626	1800x1200	1800x1200	0.0140697	True
team-presentation.webp	193382	118944	1800x1200	1800x1200	0.0126052	True

## CSS purge
- site.css: 116,455 -> 43,243 chars (62.9% reduction)
- legacy-base-20260924.css: 31,411 -> 22,487 chars (28.4% reduction)
- legacy-core-20260924.css: 48,239 -> 44,403 chars (8.0% reduction)
- legacy-tuning-20260924.css: 102,523 -> 53,556 chars (47.8% reduction)
- CSS purge was automatically rolled back by the visual regression gate.

## Browser QA
- Viewport/page combinations tested: 40
- Horizontal overflow cases: 0
- Broken-image cases: 4
- Console/page-error cases: 0

- Small interactive-target findings (<36px in either dimension): 670

## Lighthouse
- contact-desktop.json: performance 82, accessibility 95, best-practices 100, SEO 100, LCP 1888.9679999999996, CLS 0.002001014748776556, TBT None
- contact-mobile.json: performance 59, accessibility 95, best-practices 100, SEO 100, LCP 7308.26665, CLS 0.002999101826109171, TBT None
- index-desktop.json: performance 67, accessibility 100, best-practices 100, SEO 100, LCP 1827.4480999999998, CLS 0.5430443373493491, TBT None
- index-mobile.json: performance 53, accessibility 95, best-practices 100, SEO 100, LCP 20078.606200000002, CLS 0.0911300121506683, TBT None
- partner-desktop.json: performance 59, accessibility 100, best-practices 100, SEO 100, LCP 3427.308499999999, CLS 0.13556193930521376, TBT None
- partner-mobile.json: performance 43, accessibility 95, best-practices 100, SEO 100, LCP 16611.632299999997, CLS 0.2339024595907218, TBT None
- report-desktop.json: performance 56, accessibility 100, best-practices 100, SEO 100, LCP 3173.8820000000014, CLS 0.21313643196664045, TBT None
- report-mobile.json: performance 44, accessibility 100, best-practices 100, SEO 100, LCP 20021.254599999993, CLS 0.2282548721332017, TBT None

## Visual regression gate
- Screenshot pairs compared: 40
- Maximum normalized RMSE: 0.347878
- Layout regressions: 0

