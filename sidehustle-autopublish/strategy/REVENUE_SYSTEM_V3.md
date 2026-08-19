# Automated Revenue System v3

Updated: 2026-08-19 JST

## Objective

Maximize cumulative profit and learning speed while minimizing recurring user intervention. Product count, page views, and automation count are secondary metrics. The system should prefer a smaller number of differentiated, higher-value products over repetitive low-value output.

## Current active stack

- BOOTH: Japanese digital-download storefront. Current official download-product fee assumption is product price × 5.6% + 45 JPY per order; verify the official BOOTH help page before each pricing cycle.
- note: paid articles and free discovery content. Future recurring revenue may use note Membership after repeat-demand evidence.
- GitHub Pages: free SEO tools and landing pages. Paid CTAs may be added only after a matching paid product URL is independently verified.
- Disabled: Amazon KDP and LINE Creators Market. Do not reactivate without explicit user instruction.

## Revenue layers

### 1. Free acquisition

Build useful single-purpose free tools and search-oriented pages around high-intent problems. Each tool must remain useful without purchase. Add one paid CTA only when the relevant paid product URL has been verified.

Current examples: job-hunting character-count tools, BOOTH pricing calculator, event checklist and reception tools.

### 2. Low-friction paid entry

Use note paid articles and lower-priced BOOTH products to convert problem-aware users. Paid content should include reusable assets, decision criteria, templates, examples, or prompts rather than generic commentary.

### 3. Core practical OS products

Create reusable digital tools that reduce time, missed tasks, or decision errors. Preferred price range: 1,280-2,480 JPY after current market validation.

### 4. Bundles

When two complementary products exist, create a bundle at roughly 10-20% below their standalone total. The goal is higher average order value, not duplicate SKUs.

Priority bundles: interview preparation + consistency checking; event operations + sponsorship CRM.

### 5. Organization/team licenses

After a practical OS or bundle shows paid demand, create a separate organization-use edition with explicit internal-use license terms. Target range: 3,980-9,800 JPY depending on scope. Avoid custom manual delivery or consulting obligations.

### 6. Recurring revenue

Do not launch recurring memberships without audience evidence. note Membership is the preferred first test because note officially offers membership with no creator setup/monthly fee; platform fee is 10% before payment-processing and withdrawal fees. Candidate concept: monthly practical templates and operating systems for students and small organizations. Initial pricing direction: 980-1,480 JPY/month. Trigger only after repeat paid readership or clear follower demand.

### 7. Global cross-listing

Cross-list only products that prove demand in Japanese first.

- Ko-fi Shop: digital products, no listing fee, 5% service fee plus payment processing. Also supports tips and memberships. First global candidate for English-localized proven templates.
- Payhip: Free Forever plan with 5% transaction fee plus payment processing, unlimited products; useful for digital delivery, coupons, affiliate features, and international buyers.
- Gumroad: direct/profile sales have materially higher fees (currently 10% + $0.50 plus processing; Discover is 30%). Use only for higher-priced products where discovery benefits justify the fee.

Default trigger for localization/cross-list evaluation: at least 5 observed sales or equivalently strong demand evidence for a BOOTH product.

### 8. Affiliate revenue

Highest-fit current opportunity: Payhip Partner Program, which publicly advertises 50% recurring commission on Payhip revenue from referred sellers. This pairs naturally with creator-pricing calculators and future evidence-based platform comparison content. Activation requires one-time partner enrollment. All affiliate content must carry disclosure and remain balanced.

### 9. Direct payments

Stripe Payment Links can reduce marketplace fee load for appropriate use cases. Stripe Japan currently shows Payment Links with no additional platform fee and 3.6% per successful card payment. Do not use a static unprotected success page as paid-file delivery. First suitable use cases are organization-license payment, tips, or subscription payment after secure fulfillment is implemented.

### 10. Tool sponsorship and advertising

Do not add ads to small-traffic tools. They harm UX before revenue is meaningful. Once free-tool traffic is proven, evaluate one relevant sponsor slot or low-friction ad placement. Sponsorship is preferred to generic display ads if a relevant vendor will pay a fixed amount.

## Portfolio optimization rules

- Market score below 70/100: do not build.
- No observed sales after 30 days: first review title, preview, positioning, search funnel, and buyer problem. Do not automatically slash price.
- No observed sales after 60 days: consider bundle/repackage/retire rather than producing clones.
- 3 observed sales: prioritize one complementary-product or bundle experiment.
- 5 observed sales: evaluate organization license and English localization.
- 10 observed sales: evaluate higher-value bundle, recurring offer, and cross-platform listing.
- Never invent public URLs or sales counts.

## Automation cadence

- BOOTH production: multiple daily runs, maximum one product per run, only when market score and quality threshold pass.
- note + GitHub Pages production: multiple daily runs, maximum one note and one tool per run, skip weak opportunities.
- Hourly revenue/status monitor: Gmail + public URL verification, deduplicated alerts.
- Nightly profit optimization: compare product status, sales observations, market changes, backlog, prices, and next-best action.

## User-intervention policy

Request user action only when an external service legally or technically requires it: identity verification, tax/bank information, account signup, login/MFA, explicit platform agreement, or connection of a payment/affiliate account. Do not create repeated patch-and-test loops for unstable browser automation.

## External expansion gates

Before asking the user to create a new account, estimate the expected value of that channel versus setup burden. Prefer channels with no monthly cost and automatic digital fulfillment. The next one-time setup candidates, in order, are:

1. Payhip Partner enrollment for affiliate revenue from creator-focused traffic.
2. Ko-fi or Payhip seller account only after one BOOTH product proves demand and an English version is ready.
3. Stripe connection only when direct-payment use has secure fulfillment or a suitable organization-license flow.
4. note Membership only after repeat-demand signal.

## Official/current sources to recheck

- BOOTH fees: https://booth.pixiv.help/hc/ja/articles/115004576874-
- note Membership: https://note.com/lp/membership
- Payhip pricing: https://payhip.com/pricing
- Payhip Partner Program: https://payhip.com/partner-program
- Ko-fi Shop/pricing: https://ko-fi.com/shop
- Gumroad pricing: https://gumroad.com/pricing
- Stripe Payment Links: https://stripe.com/jp/payments/payment-links
