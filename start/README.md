# /start — Local Hub web follow-up (replaces the post-form SMS)

Entry point: final-screen button of the Local Hub Facebook lead form -> https://mylocal-hub.com/start/

Flow: city -> nearest Local Hub service -> "Have you used this service?"
- Yes -> link to leave an honest Google review (any rating, no text supplied, no incentive)
- No  -> free quote/assessment form (name, phone, description, optional photo) -> POST to WEBHOOK_URL

## TODO before publishing
- [ ] CITY_PROFILES in index.html: placeholder entries (Toronto, Vancouver, Calgary, Edmonton). Replace with real `{city, name, mapsUrl}` for every city in the lead form. (Existing data may be in ../sms-v2/profiles.js — verify.)
- [ ] WEBHOOK_URL = 'TODO_N8N_WEBHOOK' -> real n8n webhook. Receives multipart/form-data: name, phone, description, city, profile, source, photo (optional file). Webhook must allow CORS from https://mylocal-hub.com.
- [ ] Meta Pixel: placeholder comments only (head + Lead event on submit). Add Pixel ID when confirmed.
- [ ] Confirm /privacy/ and /terms/ wording matches the new flow (they still describe SMS, payment and suggested review text, and name ERG).
- [ ] Update the Facebook lead form final-screen button URL once live.
- [ ] Not committed/pushed.

Guardrails: no payment, no incentive, no scripted review text, no rating gating, no ERG name in the page body.
