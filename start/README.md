# /start — Local Hub web follow-up (replaces the post-form SMS)

Intended entry: Local Hub ads -> https://mylocal-hub.com/start/ directly, without a Meta lead form (confirmed in the group November 2; ad-side configuration is owned by Dani).

## Current flow (3 steps, every step reachable by everyone who completes step 1)

1. **Free ebook** — name, email, optional phone + city. Submitting unlocks the download
   `ebook/water-damage-guide.pdf` ("How to Prevent Costly Water Damage at Home", 18 pages, Local Hub branding; PDF replaced Oct 31 by an externally supplied version, so ebook/water-damage-guide.html is no longer its source).
   Source: `ebook/water-damage-guide.html` -> PDF via headless Chrome (see "Rebuild the ebook").
2. **Honest review** — city -> nearest Local Hub profile (from `profiles.js`) -> **"Leave a review on Google"** button.
   - The button is the same for everyone, always available, no star question, no routing by rating.
   - Optional collapsed **"Need ideas? Pick what we did"** picker next to the button (adapted from the
     root page's customer mode, `../index.html`): pick what stood out (efficient / professional / affordable /
     timely / friendly / everything) -> editable suggested text -> **Copy text** / **Try another**.
     It only copies text; it never opens Google, never blocks the button, and nothing is sent anywhere.
   - Optional private "Tell us how we can improve" box -> dedicated GHL notes webhook `type=feedback` (not posted publicly).
   - `// INTEGRATION POINT: custom review step` marks where any custom review logic would plug in.
3. **Reward** — shown to everyone who completed step 1 (does not depend on the review). Reward text/delivery still TODO.

## Contact intake (GHL)
- The original webhook handles signup. A separate notes webhook handles progress and private feedback. The picker itself is
  100% client-side (static JS) and needs no n8n.
- `WEBHOOK_URL` in `index.html` points to the existing Local Hub GHL inbound webhook. It receives multipart/form-data through a no-cors request:
  - `type=ebook`: name, email, phone, city, profile, ebook (`water-damage-guide`), source
  - `type=feedback`: message, name, email, city, profile, source
- Published signup workflow: inbound webhook -> create/update contact -> tag `localhub-start-ebook`. The website now sends only signup through this route; progress and private feedback go to the dedicated notes workflow so they cannot overwrite signup fields. The ebook is downloaded on-page; no automatic ebook email is configured.
- The root page's separate gift-card webhook (`erg-giftogram-submit`) is NOT used here.

## Rebuild the ebook
```
cd start/ebook
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --no-pdf-header-footer \
  --print-to-pdf=water-damage-guide.pdf "file://$PWD/water-damage-guide.html"
```

## TODO before publishing
- [x] WEBHOOK_URL set Oct 31 to the GHL inbound webhook (was: needs a GHL UI step: Local Hub location > Automation > Workflows > new workflow, trigger "Inbound Webhook", action Create/Update Contact + tag localhub-start-ebook; paste the URL into WEBHOOK_URL). No GHL API token exists in the workspace.
- [x] Meta Pixel `1101981286014464` active (replaced the original pixel November 2).
- [ ] Reward text + delivery (step 3).
- [ ] Multi-profile cities: rule for choosing the "nearest" profile (currently first listed).
- [x] /privacy/ and /terms/ rewritten for this flow (no SMS, no payment, no ERG name; Local Hub operator) — Oct 31.
- [ ] Review-picker wording: confirm you are comfortable offering suggested text (previous guardrail said "no scripted review text").
- [ ] Update the Facebook lead form final-screen button URL once live.
- Pushed to main Oct 31. Private preview: https://fifthstar.io/preview/local-hub-start-732a3f9eb098/ (noindex).

Guardrails: no payment, no incentive for reviews, no rating gating, no ERG name in the page body.
Suggested review text is optional, editable, and never required.

## Visual identity — November 2, 2026

Matched the supplied Local Hub ad: navy/red/white palette, condensed bold welcome title, red pill buttons, three red benefit icons and curved stripe/star decoration. Responsive two-column desktop / single-column mobile layout; the welcome panel appears only on step 1. Form IDs, scripts, webhook, pixel and ebook file are unchanged. The public reward TODO is now an honest pending message; no reward or payment amount is defined by this visual update.

Validation: scripts and field schema unchanged, JS syntax checked, browser navigation through all three steps using a local-only webhook and disabled external pixel, 320px viewport without horizontal overflow. No production test lead or Google review submitted.

The ebook offer now previews its actual PDF first page (`ebook/water-damage-guide-cover.webp`, 773×1000, about 90 KB). The cover opens at full size in a new tab; the old repeated title/description and generic book icon are removed. The 18-page PDF, lead form, webhook and pixel are unchanged.

## Dani campaign tracking — November 2, 2026

- Pixel `1101981286014464` replaces the previous pixel `26923651513991737`; only one pixel is initialized.
- After the contact form sends its existing webhook request, the browser navigates to `/start/?thank-you=1`, preserving existing ad query parameters. Configure the conversion with the standard **Lead event**. Page visits are not lead conversions.
- A same-tab receipt retains the form context until the tab is closed; only its pending-conversion flag is consumed. The thank-you view always keeps the PDF and continuation accessible, including direct visits and refreshes. Lead fires only for a pending form submission. Names/emails are never added to the URL.
- If first-party sessionStorage is unavailable, the thank-you URL, inline download and one Lead event remain available; refresh still displays the thank-you view without another Lead.
- Validation before release used local mocks for Meta and the contact webhook: two successful submits -> two Lead events; reload/direct visits and a network failure added none. No production test lead was created. Actual Meta Events Manager reception and GHL contact persistence are separate checks; the existing no-cors webhook does not confirm downstream CRM success.

## Funnel stages — November 5, 2026

Events use the existing Local Hub Meta pixel. In Meta Events Manager, select **Local Hub Pixels** (`1101981286014464`) and its event overview/date range. Custom events appear after Meta receives them from visitors. These are aggregate stage counts, not named stage histories in GHL or automatically added Ads Manager report columns.

| Event | What it measures |
| --- | --- |
| `Lead` | Existing signup webhook request completed in the browser; downstream GHL receipt remains a separate check |
| `LocalHubEbookDownloadClicked` | Click on the PDF download |
| `LocalHubReviewStepViewed` | Opened step 2 |
| `LocalHubGoogleReviewClicked` | Click on a valid Google review link |
| `LocalHubCityUnavailable` | Entered step 2 with an unmatched city, or left its city field with no match |
| `LocalHubPrivateFeedbackSent` | Optional private-feedback webhook request completed in the browser |
| `LocalHubRewardStepViewed` | Opened step 3 |

Each stage is queued once per successful form submission in the same tab. Refresh, returning to a step, and repeated clicks do not add stage events; a new submission starts a new journey. The random event ID contains no contact details. New event parameters contain only the funnel and stage names. Existing same-tab receipts can measure future actions without replaying a signup. Direct thank-you visitors without a signup receipt do not produce Lead or post-signup stage events.

The PDF and Google events measure clicks, not completed downloads or published reviews. Reward view does not prove reward delivery. Stages are optional, so counts do not have to form a strict decreasing sequence. Pixel blocking, closing the tab, and new sessions limit coverage; no earlier missing stages can be recovered. No-cors requests cannot verify downstream CRM persistence.

Validation used local Meta/GHL/Google mocks: two submits produced two Leads, every new event fired, repeat navigation and refresh did not duplicate stages, an unmatched city was counted, and a direct thank-you visit produced only PageView. Regression checks cover blocked storage, pixel errors, distinct submission IDs and absence of contact details in event parameters. No production test lead or Google review was created.

## Named contact history — November 5, 2026

Activation and synthetic-contact testing at the disclosed usage cost were explicitly approved November 5. The dedicated GHL workflow is published. A real synthetic contact received the full journey in Notes; the local test page mocked only Meta, so no campaign Lead or public review was created.

A dedicated GHL workflow, **Local Hub /start funnel progress** (`ae7d111b-f461-48f1-8140-e98578182445`), receives progress snapshots. The original signup webhook is preserved. Private feedback now uses the notes webhook, preventing the older intake workflow from overwriting signup city with review city. The progress workflow maps only the submitted email in Create/Update Contact, then adds a **Local Hub funnel progress** note. It does not send messages, change the stored phone/city, award rewards, or mark reviews as verified. GHL notes contain the original signup city, each observed stage/time, the city typed at that stage, selected location and the clicked Google URL.

The browser batches rapid actions into one snapshot and spaces subsequent sends by at least five seconds. Each note repeats the full observed journey so an operator can read the latest note without reconciling individual clicks. Previously transmitted core stages and repeated selection of the same city/profile are deduplicated in the tab. Optional city/location changes are bounded; core stages are retained. Pending history is kept in the existing session storage and retried on a later action/reload after a transport failure. A pagehide beacon attempts to preserve the latest unsent snapshot when the tab closes. These transports cannot acknowledge GHL workflow persistence.

Meta and GHL tracking are independent: blocking the pixel does not suppress contact history. Contact details remain in GHL request bodies and never enter Meta custom parameters or URLs. No private API credential is exposed. Older receipts record only future activity, without inventing earlier stages.

To inspect a person: **Local Hub > Contacts > filter tag localhub-start-ebook > open contact > Notes**. The City field is the current stored CRM value, which can also be edited by staff; the new notes preserve what the browser submitted and selected during each tracked journey. Clicking Google does not establish which Google account posted a review. Public reviewer-name matches require manual verification and may refer to older campaigns.

The automation list can render blank while direct workflow detail routes work. Recovery path: open a contact > Actions > Workflows > an existing/past workflow; its name opens the direct detail/log page. The builder's Workflow Switcher also provides create/open controls. No account access or browser security setting was changed to work around the list failure.

Inbound webhook is an existing premium GHL feature. Each progress snapshot uses one additional premium execution; published base pricing is $0.01 per execution after included allowance, with account plans/rebilling able to affect the actual rate. No subscription upgrade or new private integration is required.

## City availability fixes — November 5, 2026

- Brampton now uses **BRM Restoration Services**, 2160 Williams Pkwy, Brampton, and its verified Google Maps link. This is an existing Local Hub review recipient in the Brampton contact history. The previous Greg & Sons link opened an unnamed map with no review page. The change applies only to `/start/profiles.js`; legacy root/SMS profile registries are outside this release.
- Kingston has no approved profile in the current registry. An unmatched city now gets a neutral notice and an explicit continuation without a review. The unavailable Google button and review-text helper are hidden, the typed city is retained, and the blocked stage is recorded. The page no longer encourages selecting another city just to get past the message. Adding a Kingston review destination still requires a verified Local Hub business profile.

Live regression testing caught and repaired the old private-feedback intake overwrite: after signup in Kingston and review-city selection in Brampton, feedback must add a contact note and leave the CRM city Kingston. Feedback content is escaped and stored privately in that note. Test-only contacts use `localhub-tracking-qa` and DND, with the campaign tag removed after verification.
