# lightfromafar-v34.13

**A sky map, an astrophotography workspace, and a place to keep the nights that matter.**

Light from Afar is a project I am building because I want astronomy to feel a little less scattered.

When you get into astrophotography, the actual night is only one part of it. Before you even point a telescope, you might be switching between a planetarium, a sky atlas, equipment calculators, weather websites, event calendars, notes, spreadsheets and capture software. After the night, the images and the details of how you made them end up somewhere else again.

I wanted to bring more of that process together.

Light from Afar is meant to follow the whole journey: find something in the sky, understand what it is, see how it fits your equipment, decide when to observe it, work with your setup, record what happened and eventually share the result with other people.

It is still a work in progress. Some parts are already useful, some are experiments, and some are only the beginning of what I want them to become. I would rather say that clearly than pretend every button is already a finished service.

## Why I am making this

The name is about more than looking at distant objects. Almost everything we see in astronomy is light that has travelled for a very long time before reaching us. A photograph of a nebula, a star or a galaxy is a tiny connection between something unimaginably far away and a person standing under the sky right now.

I like that idea.

I also think astronomy can be lonely, especially when the people around you do not share the same interest. It is easy to spend hours learning things, planning observations and working on images without having many people nearby to talk to about any of it. I want Light from Afar to eventually make that easier too: not by turning astronomy into another social-media feed, but by giving people a reason to find each other through the things they actually observe and create.

The project has two sides that should keep supporting each other:

- **The practical side:** tools that help an astrophotographer prepare for and remember an observing session.

- **The human side:** a space where people can discover each other's work, exchange knowledge and plan observations together.

I am not trying to build a replacement for every astronomy application. N.I.N.A., KStars/Ekos, Voyager, SharpCap, PixInsight and other specialised tools already do difficult jobs very well. Light from Afar is meant to sit around the workflow and connect its pieces.

A tool should be useful before it is impressive. A feature should solve a real problem before it earns a place in the interface.

## The idea behind the product

The sky map is the centre of the application. A target should not be an isolated name in a list. It should connect to its coordinates, catalogue information, field of view, equipment, visibility, Moon conditions, plan and eventually the session record.

## What is in the current build

This README describes the source included in the **v34.13 recovery archive**. The application is browser-first and works without signing in for its public sky workspace.

### 1. Sky map and object search

The main workspace is an interactive sky map powered by **Aladin Lite**.

The current source includes these survey choices:

- DSS2 Color

- 2MASS Color

- Gaia DR3 RGB

The map has survey switching, initial sky positioning, resize handling and recovery paths for certain WebGL and browser-history problems. If Aladin cannot load, the rest of the application is designed to remain available and show an explanation instead of silently leaving an empty map.

The top search field resolves astronomical object names and aliases through the Aladin/Sesame route. It is intended for looking up stars, nebulae, galaxies, clusters and other catalogued objects, then moving the map to the result.

The sky map is not meant to be a replacement for every planetarium feature. It is the shared place where the rest of the astrophotography workflow starts.

### 2. Marks and target details

Mark mode lets you save positions directly from the map.

Saved marks can be:

- Named and edited.

- Opened again from the Marks list.

- Sent to the target-details view.

- Navigated to on the map.

- Deleted individually or cleared together.

- Exported as CSV or JSON.

Target details can use **SIMBAD** to look up the selected object. The panel can show catalogue information, a visibility/altitude chart, Moon context and the current equipment's framing information.

The target workflow also includes a camera-frame overlay. It uses the saved sensor and telescope values to estimate the field of view, and it can apply a rotation angle so the observer can get a better idea of how a target sits inside the frame.

### 3. Equipment and optical trains

The basic equipment profile stores information such as:

- Telescope or lens name.

- Focal length and aperture.

- Camera name.

- Sensor width and height.

- Pixel size.

- Mount type.

Those values feed the application's optical calculations and equipment guidance, including field of view, image scale and focal ratio.

The Settings panel also supports saved optical-train profiles. A train can be given a name and connected to discovered Alpaca device entries for an imaging camera, guide camera, focuser, filter wheel and rotator. You can save and activate different trains.

This is an early device model, not yet a complete optical-train validator. Reducers, barlows, extenders, filter offsets, camera compatibility and all the physical relationships between components still need deeper work.

### 4. Planning

The Planning workspace is meant to connect upcoming sky events with the observer's actual location and equipment.

The current event feed comes from **SpaceCatalog**. It includes event filtering for:

- Meteor showers.

- Eclipses.

- Planetary events.

- Deep-sky events.

- All event types.

The planner stores a local event cache so that previously loaded information can still be shown while the live service is unavailable. It calculates local altitude and azimuth from the observer coordinates and event position, and uses the available information to show useful context such as darkness, altitude, Moon separation and equipment suitability.

Planning cards can include image previews. The source tries coordinate-based DSS2 cutouts through the CDS HiPS2FITS service when coordinates are available, and can fall back to a Wikimedia Commons search. Previews are lazy-loaded, cached, limited in concurrency and retried after failures. These images are visual context, not a guarantee that every fallback image is an exact photograph of the event.

The planner also requests a site forecast from **Open-Meteo** for the 21:00–03:00 window. The current summary includes cloud cover, precipitation probability, wind, temperature, humidity and the air-to-dew-point gap.

That last value is only weather context. It is not a dew sensor on the telescope. The current forecast does not provide the complete set of astrophotography variables such as seeing and transparency, and it cannot determine whether a cloud is directly along a particular target's line of sight.

Plans are stored locally. You can save events to a plan, clear the saved plan and move planned events into the session-log workflow.

### 5. Observe and hardware connection

The Observe workspace is an early observatory-control layer built around **ASCOM Alpaca**.

The Settings panel lets you enter a local Alpaca server address and port, then request its configured-device list through the management endpoint. Discovered devices are stored in the browser and can be assigned to an optical train.

For a connected mount, the application can read available state such as:

- Right ascension and declination.

- Altitude and azimuth.

- Tracking state.

- Parked state.

- Slewing state.

- Pier side, when the driver provides it.

The mount workflow includes connection, target slew, tracking activation and a slew-abort command. There is also a basic Sun-separation block before a target slew, plus a check that prevents a slew request while the mount reports that it is parked.

For assigned imaging devices, the current source includes:

- Camera connection.

- Single light exposures.

- Optional gain entry.

- Exposure abort.

- Camera-state checks while an exposure runs.

- Focuser position commands.

- Filter-wheel position commands.

- Rotator position commands.

- Guide-camera availability checks.

There is an important difference between a control being present and a complete imaging system being implemented. The guide-camera check does not provide a guiding engine or guiding RMS. The sequence editor can store target, filter, exposure, frame count and a requested dither interval, but the current code does not perform dithering; it reports that guiding control is not connected. The camera image array is not downloaded into Light from Afar after an exposure.

The capture sequence can run exposure jobs on a compatible assigned camera, produce a local capture summary and pass that summary into the session log. It is a starting point for acquisition, not a mature unattended capture engine.

**Hardware control is experimental and depends on the user's local Alpaca server, drivers, network configuration and device support.** A browser talking directly to a local Alpaca server is not a hardened remote-observatory architecture. Do not expose an Alpaca server directly to the public internet, and do not treat this build as an unattended safety system.

### 6. Session Log

The Session Log is where the night becomes a record rather than a collection of forgotten details.

A session can include:

- Date and target.

- Number of exposures.

- Exposure duration.

- Filter.

- Observing site.

- Notes.

- Seeing and transparency ratings.

- Cloud cover.

- Guiding RMS, when known.

- Equipment details available from the saved profile.

Records can be searched, edited and exported to CSV. JSON backup export and import are also available. The log includes a view of tonight's marked targets and planned events, so the observer can connect the plan with what they actually did.

The current log is mainly manual. Automatic FITS metadata extraction and a complete device-generated session record are future work.

### 7. Gallery and Explore

The local Gallery lets you add astrophotography images from your device and keep their details alongside them.

Gallery records can contain:

- Image.

- Title and target.

- Capture date.

- Telescope and camera.

- Filter.

- Exposure per frame and total integration.

- Tags.

- Processing notes.

- Capture notes.

- Favourite state.

Images are resized and compressed in the browser before being stored locally. The Gallery has search and filtering for all photos and favourites, plus editing and deletion.

Explore is the beginning of the discovery/community side of the project. In this build it can display locally stored captures that already carry the local published flag. It is **not** an online image-hosting service, and there is no connected public publishing backend yet.

### 8. Habitable Zone calculator

The Habitable Zone calculator is a separate scientific utility inside the application. It is not part of the core imaging workflow, but I want it to remain available because astronomy is bigger than equipment control.

It accepts stellar luminosity and temperature, orbital distance, eccentricity and albedo. It calculates incident flux and equilibrium-temperature context, estimates conservative and optimistic habitable-zone boundaries, and displays an orbital flux graph with periastron, apastron, peak/minimum flux and the fraction of the orbit spent inside the conservative zone.

There are built-in example planets and a live lookup path to the **NASA Exoplanet Archive**. The calculator is a screening model, not a habitability verdict. Atmospheres, clouds, planetary mass, geology, stellar activity and many other factors are not fully represented.

### 9. Accounts and profiles

The public sky workspace can be used as a guest.

The separate authentication page is connected to **Supabase** in source and includes:

- Email/password registration and sign-in.

- Google sign-in.

- Email confirmation return.

- Password-reset email request.

- Password recovery with a verified recovery session.

- Persistent browser auth session.

- Sign-out.

- Display-name profile read/write.

- A profile table with row-level security policies in `supabase-profiles.sql`.

Google provider setup, redirect allow-lists, email delivery and the database policies still need to be checked in the live Supabase project. The source being wired does not prove that the provider dashboard is configured correctly.

The online account currently covers authentication and profile information. Marks, equipment, optical trains, plans, logs and Gallery images remain in the browser. **There is no cross-device application-data sync yet.**


## What is not finished yet

I keep this list visible because these are the things I do not want the project to pretend it can already do.

- No plate-solving workflow.

- No FITS ingestion, image-array download or automatic FITS metadata extraction.

- No complete capture engine with reliable sequencing, retries and recovery.

- No actual guiding engine, guide corrections or dithering.

- No autofocus workflow.

- No full camera cooling, ROI, binning or temperature-control interface.

- No mature multi-device capability negotiation or compatibility validation.

- No complete reducer/barlow/extender optical model.

- No mosaic planner or automated multi-panel framing.

- No custom horizon or obstruction model.

- No full astronomical weather model for seeing, transparency, jet stream and sky quality.

- No integrated weather safety monitor, watchdog, roof/dome automation or unattended recovery.

- No remote-observatory security agent.

- No cloud sync for marks, equipment, plans, logs or gallery images.

- No real profile discovery, friend requests, groups, online sessions or chat.

- No specialised planetary, lunar, solar, satellite, transient or exoplanet-transit imaging workflow.

The Friends and Chats panels are placeholders. Connect is a presentation shell. Its tabs currently change the selected tab styling; they do not create or load real groups or sessions.

## Where I want to take it

The long-term idea is a connected astrophotography workspace.

The next stages I have in mind are:

1. **Make the foundation reliable.** Improve optical-train modelling, Alpaca discovery, device capabilities, mount state, abort behaviour and target-to-equipment framing.

2. **Connect the imaging workflow.** Add plate solving, camera image handling, capture sequencing, focus, guiding, dithering, filter and rotator workflows.

3. **Treat safety as part of the product.** Add explicit device states, limits, weather inputs, emergency handling and recovery. No unattended claims until this is properly tested.

4. **Make planning more real.** Add custom horizons, richer weather information, imaging constraints and mosaic planning.

5. **Build the community carefully.** Start with privacy-aware profiles and permissions, then friends, groups and shared observing sessions. Chat comes after the access rules are solid.

6. **Keep room for other kinds of astronomy.** Planetary, lunar, solar, transients, satellites and exoplanet transits can have their own workflows instead of being squeezed into one generic planner.

I do not want to build features just because another application has them. I want each addition to fit the way people actually observe and image the sky.

## Technology and services

The current project is a browser application built with:

- HTML, CSS and vanilla JavaScript.

- Aladin Lite for the interactive sky map.

- CDS HiPS surveys and HiPS2FITS for map imagery and planning previews.

- Sesame / SIMBAD for astronomical object resolution and catalogue information.

- SpaceCatalog for the event feed.

- Open-Meteo for the current weather summary.

- ASCOM Alpaca for local observatory-device communication.

- Supabase Auth and a small profile table for account functionality.

- NASA Exoplanet Archive TAP for the HZ calculator's planet lookup.

- Wikimedia Commons as a fallback source for planning-card imagery.

- A service worker for the application shell and local cache behaviour.

The project does not currently use a frontend framework or a build step. The main application is `index.html`; `astralog.html` remains as a legacy redirect for older authentication return links.

## Run it locally

Do not open the HTML files directly with `file://`. Serve the folder over localhost.

With Python installed, open a terminal in the project folder and run:

```bash

python3 -m http.server 8000

```

Then open:

```text

http://localhost:8000

```

The sky map, catalogue lookups, planning feed, weather and authentication library need an internet connection. Hardware features additionally need a compatible local Alpaca server and drivers. The Alpaca server must allow browser requests from the page's origin.

## Supabase setup

Authentication needs a Supabase project.

1. Open the Supabase SQL Editor and run `supabase-profiles.sql`.

2. Check that `auth-config.js` contains the correct project URL and a browser-safe publishable key.

3. In Supabase Auth URL Configuration, add the production site URL and the app return URLs for `index.html` and `auth.html?mode=recovery`.

4. For local testing, allow the localhost URLs for the port you use.

5. Enable email/password sign-up and configure email delivery. The default email service may not be suitable for production use.

6. Enable Google in Supabase Auth and configure its client ID, secret and redirect settings in the provider dashboard. The Google provider callback belongs in the provider's redirect configuration; it is not the same as the app's return URL.

7. Deploy over HTTPS and test registration, confirmation, sign-in, sign-out and password recovery on the actual domain.

Never put a Supabase service-role key, OAuth client secret or private credential in browser code. The publishable key in `auth-config.js` is designed to be public; the database policies are still essential.

## Data, privacy and backups

Most application data is stored in the browser using `localStorage`. That includes marks, equipment settings, optical trains, saved plans, session records, Gallery items and interface preferences.

This means:

- Data belongs to the browser and origin where it was created.

- Clearing site data can erase it.

- Signing in on another device does not bring those records over.

- JSON backup and CSV export should be used to keep copies of important records.

- Gallery images are stored locally in browser storage, not uploaded to a Light from Afar server.

Supabase currently stores account/authentication information and the profile fields handled by the profile code. It does not turn the local astronomy workspace into a cloud-synced account.

A proper privacy policy, account deletion flow and broader security review are still needed before the community features become public services.

## A note about the v34.13 archive

This README follows the code that is actually present in the supplied recovery archive. There is a small mismatch between some historical changelog text and the shipped `index.html`: the current source defines three survey choices (DSS2 Color, 2MASS Color and Gaia DR3 RGB), and its survey switching uses the corresponding image-service URLs. Older notes mention a larger survey set and different identifier handling. The source in this archive is the authority for what this particular build exposes.

The archive also contains historical audit and repair notes. They are useful context, but they should not be read as proof that every external service or hardware path has been tested live.

## Development and testing

This is a long-running project, and stability work is part of the development rather than something that happens after the features are finished.

Static checks can catch syntax errors, duplicate IDs, broken references and packaging problems. They cannot prove that a CDN is reachable, that a WebGL canvas renders on a particular phone, that a Supabase provider is configured, or that a telescope driver behaves correctly.

Before calling a feature reliable, it needs to be tested in the browser and, where hardware is involved, with the actual device. The v34.13 recovery archive has not been validated against every live external service or real observatory setup.

## License and attribution

The Aladin Lite attribution remains visible in the application. Keep the required Aladin logo/link and follow the library's distribution terms.

This archive does not include a top-level `LICENSE` file. A project license should be chosen and added before treating the repository as an explicitly licensed open-source release.

## One last thing

I am building Light from Afar because I want to make something that I would genuinely use on a night outside with a telescope, and something that could eventually help other people feel less alone in this field.

There is a lot left to do. That is part of the point. I want the project to grow carefully, keep its scientific side honest, and become more useful with every version.

The light we collect has travelled farther than we can really imagine. I want the tools around that experience to feel worth building.
