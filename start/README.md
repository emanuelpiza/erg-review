# /start — Local Hub web follow-up (replaces the post-form SMS)

Entry point: final-screen button of the Local Hub Facebook lead form -> https://mylocal-hub.com/start/

## Current flow (3 steps, every step reachable by everyone who completes step 1)

1. **Free ebook** — name, email, optional phone + city. Submitting unlocks the download
   `ebook/water-damage-guide.pdf` ("How to Prevent Costly Water Damage at Home", 8 pages, Local Hub branding).
   Source: `ebook/water-damage-guide.html` -> PDF via headless Chrome (see "Rebuild the ebook").
2. **Honest review** — city -> nearest Local Hub profile (from `profiles.js`) -> **"Leave a review on Google"** button.
   - The button is the same for everyone, always available, no star question, no routing by rating.
   - Optional collapsed **"Need ideas? Pick what we did"** picker next to the button (adapted from the
     root page's customer mode, `../index.html`): pick what stood out (efficient / professional / affordable /
     timely / friendly / everything) -> editable suggested text -> **Copy text** / **Try another**.
     It only copies text; it never opens Google, never blocks the button, and nothing is sent anywhere.
   - Optional private "Tell us how we can improve" box -> webhook `type=feedback` (not posted publicly).
   - `// INTEGRATION POINT: custom review step` marks where any custom review logic would plug in.
3. **Reward** — shown to everyone who completed step 1 (does not depend on the review). Reward text/delivery still TODO.

## n8n
- Only **one** webhook is needed, and only for lead capture (+ optional private feedback). The picker itself is
  100% client-side (static JS) and needs no n8n.
- `WEBHOOK_URL = 'TODO_N8N_WEBHOOK'` in `index.html` (while it is a placeholder nothing is sent; payload is logged to console).
  Receives multipart/form-data, CORS must allow https://mylocal-hub.com:
  - `type=ebook`: name, email, phone, city, profile, ebook (`water-damage-guide`), source
  - `type=feedback`: message, name, email, city, profile, source
- Suggested workflow: Webhook -> (If `type`) -> store lead (Sheet/CRM) + email the ebook link / notify team.
  The ebook is also directly downloadable on-page, so the email is a nice-to-have, not a dependency.
- The root page's separate gift-card webhook (`erg-giftogram-submit`) is NOT used here.

## Rebuild the ebook
```
cd start/ebook
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --no-pdf-header-footer \
  --print-to-pdf=water-damage-guide.pdf "file://$PWD/water-damage-guide.html"
```

## TODO before publishing
- [ ] WEBHOOK_URL -> GHL inbound-webhook URL (needs a GHL UI step: Local Hub location > Automation > Workflows > new workflow, trigger "Inbound Webhook", action Create/Update Contact + tag localhub-start-ebook; paste the URL into WEBHOOK_URL). No GHL API token exists in the workspace.
- [x] Meta Pixel 26923651513991737 installed (PageView on load, Lead on successful step-1 submit) — Oct 31.
- [ ] Reward text + delivery (step 3).
- [ ] Multi-profile cities: rule for choosing the "nearest" profile (currently first listed).
- [x] /privacy/ and /terms/ rewritten for this flow (no SMS, no payment, no ERG name; Local Hub operator) — Oct 31.
- [ ] Review-picker wording: confirm you are comfortable offering suggested text (previous guardrail said "no scripted review text").
- [ ] Update the Facebook lead form final-screen button URL once live.
- Pushed to main Oct 31. Private preview: https://fifthstar.io/preview/local-hub-start-732a3f9eb098/ (noindex).

Guardrails: no payment, no incentive for reviews, no rating gating, no ERG name in the page body.
Suggested review text is optional, editable, and never required.
