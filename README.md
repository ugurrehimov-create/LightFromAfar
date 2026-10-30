# Light from Afar v34.7 — Stable Aladin Map Recovery & Object Search

Built directly from the supplied `astralog-v27.zip` baseline. This pass is intentionally surgical: existing features, UI structure, and local storage keys are preserved; only regressions and explicitly requested UI behavior were repaired.

## v34.7 repairs
- Replaced the unstable v34.6 Aladin loader with a pinned stable Aladin Lite 3.8.2 ES-module-first loader and sequential official CDS fallbacks.
- Initialize the map only after the Aladin WebAssembly initialization promise resolves; set the initial sky center with numeric RA/Dec coordinates.
- Use Sesame object resolution for case-insensitive astronomical object search, with a corrected FoV API call.
- Bump the service-worker cache to ensure clients receive the repaired shell.

## Earlier repairs
- Restored working Marks sidebar toggle by removing the duplicate generic sidebar listener.
- Restored Map window toggle by removing the duplicate Map handler and keeping one authoritative handler.
- Preserved Aladin survey switching and local survey selection.
- Made bottom action buttons consistently highlight while their windows are open and clear when closed.
- Added Profile active state while its account/observer window is open.
- Added missing Settings window state and sidebar active state.
- Made Target Info immediately useful from the saved mark, then enrich it with SIMBAD when available.
- Styled Gallery search/filter controls to match the existing field/search language used elsewhere in the app.
- Updated visible product branding from AstraLog to Light from Afar without changing internal storage keys or existing feature names.

## Preservation
This build starts from v27. No community, gallery, planning, observing, optical-train, Alpaca, HZ, marks, or session-log features were intentionally removed.

## Validation
- JavaScript syntax check: passed.
- HTML IDs: 246 total, 246 unique.
- Map click handlers: 1.
- Marks sidebar click handlers: 1.
- ZIP integrity: passed.
- Live Alpaca hardware and external astronomy services are not claimed as tested in this environment.


## v31 focused repair
- Fixed survey switching by creating a fresh Aladin Lite HiPS base layer per selection, with a v3 API fallback.
- Survey picker now closes itself after the selected survey is handed to Aladin.
- Fixed top-bar search layout so Home/Explore/Connect and account controls no longer overlap the search field.
- Light from Afar heading now uses white `Light from` and orange `Afar`.
- Fixed missing mark-render rebuild path and immediately refreshes map state after deleting a mark.
- Delete now clears the active mark popup and performs an empty-map interaction without creating a replacement mark.


## v32 focused repair
- Restored the top-bar Light from Afar lockup: `Light from` white and `Afar` orange, with responsive spacing so the search field is not covered by navigation controls.
- Reconnected Friends and Chats sidebar items to their existing Coming Soon windows instead of leaving inactive buttons dead.
- Repaired Gallery controls so search and the All photos/Favorites selector use the same styled field language as the rest of the app.
- Removed local Gallery "Post to Explore" / publish controls; Explore remains the future publication surface. Existing stored publish flags are preserved for future migration.
- Improved Gallery photo editing emphasis and title-field styling.
- Changed Aladin survey switching to the documented `setImageSurvey(HiPS-ID)` path first, with a fallback layer path, and closes the picker only after the selection has been handed to Aladin.
- Tightened mark deletion dismissal and keyboard event isolation for Camera rotation.
- Added a DSS target preview to live Planning cards when the event supplies coordinates, using the CDS HiPS2FITS service.
- Restored a proper local Register / Sign in flow with password hashing via Web Crypto while keeping the limitation explicit: this is device-local authentication, not a cloud account yet.
- Expanded About copy and removed remaining visible AstraLog branding.

## v32 validation
- Inline JavaScript syntax checks: passed for all non-empty inline scripts.
- HTML IDs: 259 total, 259 unique; all `getElementById` and label-for references resolve.
- CSS brace balance: 473 / 473.
- Gallery "Post to Explore" UI: absent.
- Visible `AstraLog` branding: absent.
- Service worker cache bumped to v32.
- Live browser/Aladin rendering, external survey tiles, remote Alpaca hardware, and live event/image services were not claimed as fully tested in this environment.

## v33 focused account-flow repair
- Account status now distinguishes a locally signed-in account from a registered but signed-out account when the panel opens.
- Registration no longer replaces an existing local account; attempting it switches to sign-in and keeps the saved account intact.
- Service-worker cache bumped to v33.
- Checks run: both non-empty inline scripts and the service worker pass JavaScriptCore syntax compilation; static HTML has no duplicate IDs or unresolved label/`getElementById` references; CSS braces balance (474/474).
- Isolated account-flow exercise passed for registration, duplicate-registration protection, incorrect/correct sign-in, sign-out, and reopening while signed out. The exercise used a mocked password hash and does not verify the browser's Web Crypto implementation.
- Manual browser checks still needed for the actual form presentation, Web Crypto behavior, persistence across reloads, and account states after reopening.
- No browser automation is available in this environment, so visual UI behavior and the rest of the astronomy workflows were not confirmed in a live browser.
- This remains device-local authentication. Cloud accounts, password recovery, account sync, and server-side identity are not implemented.

## v34 authentication page and account connection
- Added a standalone, responsive `auth.html` page using the existing Light from Afar visual language.
- Added email/password registration and sign-in, Google and Apple OAuth buttons, email confirmation return, password-reset email flow, and password recovery form.
- The public sky application remains usable without an account. The profile button opens sign-in/register links for guests and account details/edit/sign-out actions for signed-in users.
- Added a Supabase client boundary. `auth-config.js` currently points to the project's Supabase URL and contains its browser-safe publishable key. OAuth client secrets belong only in the Supabase dashboard.
- Added `supabase-profiles.sql` with a user-owned profile table and row-level security policies. No service-role key, OAuth secret, or production password belongs in browser code.
- Legacy `lightfromafar-local-account` data is not deleted, but it is not used as a cloud identity and cannot be migrated as a password credential.
- Authentication assets are included in the service worker app shell.

### Setup required before sign-up can work
1. Create a Supabase project and run `supabase-profiles.sql` in its SQL Editor.
2. Confirm `auth-config.js` points to the active project and uses its **publishable** key. Never use a secret/service-role key in browser code.
3. In Supabase Auth URL Configuration, set the production site URL and allow the deployed `index.html` and `auth.html?mode=recovery` return URLs. For local development, also allow `http://localhost:8000/index.html` and `http://localhost:8000/auth.html?mode=recovery`; serve the folder from localhost rather than opening files with `file://`.
4. Enable email/password sign-up and email confirmation. Configure production SMTP before relying on confirmation and recovery email delivery.
5. In Supabase Auth Providers, enable Google and Apple and enter their client IDs and secrets. In Google Cloud, create a Web OAuth client, add the app origins (`http://localhost:8000` and your production origin), and add this project's Supabase callback as an Authorized redirect URI: `https://ossktqlkhjaiblmnmzea.supabase.co/auth/v1/callback`. This callback is different from the app return URLs in Supabase Auth URL Configuration.
6. Deploy over HTTPS and test on the deployed domain. Apple OAuth also requires maintaining its provider signing secret according to Apple's rotation schedule.

The provider integrations are wired in the client, but this workspace cannot inspect whether Google and Apple are enabled or configured in the Supabase dashboard. Email delivery and provider sign-in remain unverified until tested against the live project.

### Focused auth and profile fixes
- Matched authentication page colors to the existing site palette without changing its layout.
- Profile coordinates use a Unicode degree escape and the close control uses a plain `X`, avoiding mojibake.
- Password recovery only exposes the new-password form after Supabase reports a valid `PASSWORD_RECOVERY` session. It does not ask for the current password; expired or unrecognized links prompt the user to request another reset email.
- During recovery-link verification, the sign-in form stays hidden; once verified, only the new-password and confirmation fields are shown.
- Service-worker cache name is `light-from-afar-shell-v34-mobile-field`; this refreshes the app shell in the existing v34 project.
- Added UTF-8 charset metadata to the main page and standardized website close controls to an ASCII `X`.
- The main app is `index.html`; `astralog.html` remains as a small legacy redirect so previously sent confirmation links continue to work and retain their auth tokens.
- Aladin Lite now loads asynchronously from jsDelivr with the official host as fallback. If both map hosts fail, the application controls still load and the map area explains the outage instead of blocking the page.
- Google OAuth requests Google's account chooser when the user presses Continue with Google; existing Supabase sessions still return directly to the app.

### v34 source validation
- JavaScriptCore syntax checks passed for both non-empty inline scripts, `auth-page.js`, `supabase-client.js`, and `sw.js`.
- Static markup check: no duplicate IDs or unresolved label, ARIA, or `getElementById` references in either page.
- CSS braces balance: `astralog.css` 484/484; `auth.css` 48/48.
- Every service-worker app-shell file exists. The original optional local `aladin.js` file is still absent and continues to use the app's existing external CDN fallback.
- Browser rendering, real Supabase email delivery, confirmation and recovery links, database RLS execution, Google OAuth, and Apple OAuth still require configured credentials and browser testing.

## Phone observing layout
- The phone bottom bar prioritizes Mark, Planning, Observe, and Log, with secondary destinations under More. Map survey selection, export, gallery, marks, settings, and community workspaces remain available in the drawer.
- The top bar keeps search, profile, and red night vision available while giving the sky map most of the screen.
- Planning renders this device's cached event list immediately, then refreshes it. The first three planning cards with coordinates load their DSS previews eagerly; later previews load as they approach view. Missing coordinates and image-service failures receive an explicit placeholder.
- Planning event cards use a narrow preview column beside the event details on phones, preventing image/text overlap.
- Observe includes an opt-in Screen Wake Lock control where the browser supports it. It releases when the tab is backgrounded and resumes when the tab returns.
- The mobile layout follows common field-use patterns in current astronomy apps: quick access to tonight's plan, red night viewing, target conditions, and a screen-awake field mode. Sources: [SkySafari feature chart](https://skysafariastronomy.com/pages/comparison-chart), [Dark Skies field mode](https://apps.apple.com/us/app/dark-skies-astrophotography/id843351673), and [Celestron SkyPortal](https://www.celestron.com/pages/skyportal-mobile-app).
- Planning now summarizes the site's 21:00–03:00 forecast for cloud cover, precipitation chance, wind, temperature, humidity, and the air-to-dew-point gap from Open-Meteo. That gap is only atmospheric context, not an equipment dew sensor or a dew-control recommendation. Weather models do not provide transparency or seeing here, and this site forecast cannot tell whether a cloud lies along a particular target line. [Open-Meteo hourly variable definitions](https://open-meteo.com/en/docs).
- A real iPhone/Android browser review is still needed for visual spacing, wake-lock availability, map gestures, external DSS image delivery, and connected hardware controls.


## v34.1 authentication audit + focused repairs

### Repairs in this audit pass
- Delayed Supabase authentication scripts on the standalone auth page with ordered `defer` loading. This lets the page markup render without waiting for the hosted auth SDK, while preserving script dependency order.
- Extended password-recovery callback verification from 2 seconds to 12 seconds. Slow mobile connections should not be told almost immediately that a valid reset link is expired. If verification still fails, the message now distinguishes a verification failure from a definite expiry.
- Added an explicit signed-in account notice: the online account currently stores authentication/profile information, while marks, equipment, plans, observing logs, and gallery remain browser-local. This prevents the UI from implying cross-device sync that is not implemented.
- Bumped the service-worker cache so the repaired page and disclosure are delivered to existing installs.

### Audit findings — what is implemented
- Supabase email/password sign-up and sign-in client calls.
- Email-confirmation return path.
- Password-reset email request and recovery-session-gated password update.
- Google and Apple OAuth client calls.
- Persistent Supabase browser session, sign-out, and profile read/write path.
- SQL profile table, user-scoped row-level security, and new-user profile trigger.
- Public sky workspace remains usable without an account.

### Still required before real users can register reliably
1. **Verify the Supabase project**: confirm the project URL and browser-safe publishable key in `auth-config.js` are for the intended production project. The key is expected to be public/publishable; never put a service-role or secret key in the browser.
2. **Run `supabase-profiles.sql`** in that project's SQL Editor and verify the table, trigger, and RLS policies were created successfully.
3. **Configure Auth URL allow-lists** for the deployed HTTPS origin, `index.html`, and `auth.html?mode=recovery`. Add localhost URLs only for local testing.
4. **Configure email delivery**. Test sign-up confirmation and password-reset messages from the actual deployed domain. A working Supabase project does not guarantee production email deliverability; configure SMTP as needed.
5. **Configure Google and Apple providers** in Supabase and their respective developer consoles. Until that is done, those buttons are wired but not verified.
6. **Run the live auth test matrix**: new email registration, duplicate registration, confirmation link, sign-in, wrong password, refresh persistence, sign-out, reset request, valid reset, expired reset, Google OAuth, Apple OAuth, and a second browser/device.
7. **Add a privacy policy and account/data deletion route before public launch.** Decide what personal data is collected and how a user can request deletion.
8. **Implement cloud data sync as a separate feature.** The current database schema does not sync marks, observatory equipment, optical trains, plans, logs, or gallery items. Do not promise cross-device backup until those tables/storage paths and per-user RLS policies exist.

### Verification performed for v34.1
- JavaScript syntax checks passed for the two non-empty inline scripts in `index.html`, plus `auth-page.js`, `supabase-client.js`, and `sw.js`.
- Static markup audit: 260 IDs in `index.html` and 25 IDs in `auth.html`; no duplicate IDs; no unresolved `getElementById`, label `for`, or ARIA ID references.
- Service-worker app-shell file references exist in the package.
- ZIP integrity passed after packaging.
- A live browser test could not be completed in this environment because Chromium failed to start; this pass does **not** claim successful visual/browser, live Supabase, email-delivery, database-policy, or OAuth testing.

## v34.4 automatic retries, map survey recovery, and navigation polish

- Planning image previews automatically retry the CDS endpoints and image archive with increasing backoff; retries pause when the Planning panel is closed or the tab is hidden.
- Survey selection now uses the documented Aladin Lite base-layer API, closes the selector after the layer call, and triggers a viewport refresh with a DSS2 color fallback when no base layer is available.
- Chat and Friends are toggles, so clicking an already-open one closes it and switching between them closes the previous panel.
- Removed the Apple sign-in option from the authentication page. Google and email sign-in remain.
- Updated the service-worker cache version to force clients to load v34.4 assets.

Live external image/survey services still require verification in the deployed browser; syntax checks alone cannot prove their availability.



## v34.6 map lifecycle and project audit
- Corrected Aladin Lite v3 survey switching to create an image-survey object before applying the base layer.
- Added back-forward-cache/WebGL context-loss recovery for the grey map after returning from authentication.
- Reworked mark deletion to remove source objects through the documented catalogue API and reconcile the marks layer.
- Made Planning image previews lazy, cached, concurrency-limited, faster to fail over, and automatically retried.
- Decoupled Clear plan/Add to plan from event-card rendering so those actions no longer reset photos.
- Escaped dynamic event/mark strings in the repaired UI surfaces.
- See `V34.6-PROJECT-AUDIT.md` for remaining roadmap gaps and the recommended Connect implementation order.
