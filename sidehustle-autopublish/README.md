# Side-hustle autopublish queues

This directory is used as a public transport layer for the user's local publisher bots.

- `kdp/queue/index.json`: Kindle Direct Publishing queue
- `line/queue/index.json`: LINE Creators Market queue
- `note/queue/index.json`: note paid-content queue
- `webtools/queue/index.json`: static web-tool deployment queue

Paid or unpublished product payloads must never be committed here in plaintext. Queue payloads are expected to be AES-256-GCM encrypted with a random key, with that key wrapped by RSA-OAEP-SHA256 using `booth-autopublish/public/device_public_key.pem`. The matching private key stays only on the user's Windows PC.

Queue indexes remain empty until a validated product is ready. Publishers should ignore already-processed IDs and should stop safely on login, review, CAPTCHA, or UI errors.
