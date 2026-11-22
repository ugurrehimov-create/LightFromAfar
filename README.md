# Light from Afar

*An astronomy workspace built because looking up should lead somewhere.*

I started Light from Afar because I wanted astronomy to feel closer. The universe is enormous, but getting into it can feel surprisingly lonely and fragmented. You might find a beautiful object on a sky map, read about it somewhere else, calculate whether your telescope can frame it in another tool, check the weather on a different website, write down the session in a notes app, and then lose half the details a week later.

I wanted to bring more of that journey into one place.

Light from Afar is a project about making the night sky easier to explore, understand, observe and share. It is also a personal attempt to build something that connects the scientific side of astronomy with the feeling that made me interested in it in the first place. I don't want the software to make astronomy feel like a checklist or turn every target into a score. I want it to help people look closer, ask better questions, and keep a record of what they discover.

The project is still being built. Some parts are real tools already, some are early hardware experiments, and some are ideas that need a proper backend before they can become real. I would rather say that honestly than make the project look more finished than it is.

## What it is

Light from Afar is the wider project and the name of the website. **AstraLog** is the name used for its astrophotography workspace and its earlier code history.

The main idea behind AstraLog is to act as a mission-control layer for an observing or imaging session. It is not meant to replace dedicated image-processing software such as PixInsight or Siril, and it is not trying to rebuild a full planetarium. It should connect the steps around an imaging session:

**Discover → Evaluate → Frame → Plan → Connect → Observe/Capture → Record → Review/Share**

The sky map is the center of that workflow. A target should not be an isolated name in a list. It should connect to its position, visibility, the Moon, the observer's location, the equipment being used, the camera frame, the plan, and eventually the session record.

The long-term goal is a workspace where the map, equipment, conditions, telescope state and imaging plan all refer to the same target. The current version is an early but usable step toward that.

## The project and its philosophy

There are a few things I want this project to stand for.

**The sky comes first.** The map is not decoration behind a dashboard. It is the place where the work begins. Selecting an object should lead naturally to its information, framing, observing conditions and next actions.

**Useful context is better than fake certainty.** A target can be above the horizon and still be a bad choice for a particular setup. A weather forecast can show cloud cover but cannot promise transparency or seeing. A camera can report that an exposure finished without the app having downloaded or inspected the image. The interface should show what it actually knows and where its information came from.

**Tools should work together.** A field-of-view calculator is more useful when it knows the selected target and equipment. A plan is more useful when it can become a session log. A capture summary is more useful when it can pre-fill a record. The point is not to collect unrelated features; it is to make the steps connect.

**Local work should remain possible.** The public sky workspace can be used without signing in. Most observing data is currently stored in the browser, so the user keeps control of it and can export backups. That also means it does not magically appear on another device. Cloud sync is a separate feature, not something I want to imply before it exists.

**People are not engagement metrics.** Explore and Connect are meant to help astrophotographers find each other's work and observe together. I am not interested in filling the app with fake users, fake posts, follower counts or empty social features. The community parts will only become real when the backend, privacy rules and moderation basics are ready.

**Science should stay honest.** Calculations have assumptions and approximations. A framing preview is not a plate solve. A weather model is not a local sensor. A habitable-zone estimate is not proof that a planet is habitable. The app should make those limits visible.

I am building this because I want a place where the technical side of astrophotography and the curiosity behind astronomy can exist together. It is a long project, and I expect the software to change as I learn more.

## What you can do right now

### 1. Explore the sky

The main workspace is an interactive all-sky map powered by [Aladin Lite](https://aladin.cds.unistra.fr/AladinLite/).

The current source includes these selectable surveys:

- **DSS2 Color** — an optical colour view for general navigation and finding charts.
- **2MASS** — near-infrared imagery, useful for looking through dust and seeing cooler stellar populations.
- **Gaia DR3 RGB** — a Gaia-based all-sky composite.

The map remembers the selected survey locally. The app also includes map resize and recovery handling for browser history and WebGL context-loss situations. The map and its imagery still depend on external Aladin/CDS services and the browser's WebGL support.

Object search uses astronomical name resolution and catalogue services. The app can resolve common object names and identifiers, then move the map to the returned coordinates. It also has a native Aladin resolver fallback for cases where the external catalogue lookup is unavailable.

### 2. Mark targets and inspect them

Mark mode lets you click the map and save sky positions as targets. Marks can be named, edited, revisited and deleted. They are kept in the browser and shown in a dedicated Marks panel.

A saved mark can be opened as a target. The target view can show:

- Object identification and catalogue information when SIMBAD resolves it.
- Coordinates and target details.
- A target altitude graph for the observer's location.
- Astronomical-night context.
- Moon separation and illumination context.
- Equipment-based framing guidance.
- A camera field-of-view overlay on the sky map.
- Frame rotation controls.
- A route into the imaging plan or the telescope slew workflow.

The target information panel uses SIMBAD where available. Catalogue lookups need a network connection and may fail if the upstream service is unavailable.

### 3. Work out what your equipment can frame

Settings includes an astrophotography setup with telescope/lens and camera information, including focal length, aperture, sensor dimensions and pixel size. The app uses these values for its equipment calculations.

The current tools include:

- Field of view.
- Image scale / pixel scale.
- Focal ratio.
- Target framing guidance.
- A rotatable field-of-view outline on the map.

The optical-train area lets you save and activate more than one named train and assign discovered Alpaca devices to it. This is an early device-assignment model, not yet a complete optical compatibility engine. Reducers, barlows, extenders, filter offsets and every possible combination still need stronger modelling and validation.

### 4. Plan an observing night

The Planning workspace combines event information with the observer's location and equipment.

It currently includes:

- Event retrieval from SpaceCatalog.
- A locally cached event list so previously loaded information can appear before a refresh finishes.
- Event filtering and refresh controls.
- Event dates, target information and coordinate-based visibility calculations when coordinates are supplied.
- Altitude and azimuth context.
- Equipment guidance for supported event types.
- Save-to-plan and clear-plan actions.
- Image previews for events where a useful coordinate or search phrase is available.
- Lazy preview loading, caching, retries and a limited request queue.

The preview service first uses CDS HiPS2FITS sky cutouts where coordinates are available. Wikimedia Commons can be used as a fallback or for events without coordinates. A Commons result may be a related astronomy image rather than an exact image of the event, so the interface identifies the source. These previews are visual context, not guaranteed scientific observations of the event itself.

Planning also requests a site forecast from [Open-Meteo](https://open-meteo.com/). The current summary covers the local 21:00–03:00 window and includes cloud cover, precipitation chance, wind, temperature, humidity and the air-to-dew-point gap. That gap is atmospheric context, not a dew sensor or a dew-control recommendation. This forecast does not provide transparency or seeing, and it cannot tell whether a cloud is directly along the line of sight to a selected target.

The planner is an event and observing planner. It is not yet a full constraint-based imaging scheduler with custom horizons, mosaic jobs, filter-aware Moon constraints or automated capture windows.

### 5. Observe and experiment with hardware

Light from Afar has an early ASCOM Alpaca connection layer.

In Settings, the user can enter the address and port of an Alpaca server and request its configured-device list. The discovered inventory can include device types such as mounts, cameras, focusers, filter wheels, rotators, domes, observing-conditions devices, safety monitors, cover calibrators and switches. Devices can be assigned to saved optical trains when the relevant type is supported by the selector.

The current Observe workspace includes:

- Mount connection and state refresh.
- Telescope position and state reporting where the driver exposes those properties.
- GoTo/slew to a selected target.
- Abort-slew and stop controls.
- Basic camera connection.
- Single camera exposures with optional gain.
- Exposure abort.
- A simple multi-job capture sequence.
- Basic focuser movement.
- Basic filter-wheel position setting.
- Basic rotator movement.
- Guide-camera availability/state reporting.
- A screen-awake option using the browser Screen Wake Lock API where supported.

There are important limits here. The camera workflow starts exposures and checks camera state, but **the current app does not download the camera image array or act as a FITS capture/processing pipeline**. The sequence stores target, filter label, exposure, frame count and a dither interval, but the current runner does not yet issue filter-wheel changes or actual dithering. A requested dither is only reported in the status message because a guiding engine is not connected. The guide-camera panel can report device availability; it does not provide guiding, calibration or RMS tracking from a real guiding system. Autofocus, plate solving, meridian-flip automation and a complete recovery system are not implemented.

Alpaca is designed for observatory-network use. Do not expose an unsecured Alpaca server directly to the public internet. Use an appropriately secured local network, VPN or companion service. Hardware commands can move real equipment; check clearances, cable paths, mount limits and the physical environment yourself. The app's Sun-distance and below-horizon checks are basic safeguards, not a guarantee of physical safety.

### 6. Keep a record of observing sessions

The Session Log stores observing and imaging records in the browser. Entries can include:

- Date and target.
- Number of exposures and exposure duration.
- Filter.
- Equipment/setup notes.
- Capture conditions and free-form notes.
- Seeing and transparency ratings.
- Cloud-cover estimate.
- Guiding RMS value when known.

Sessions can be searched and edited. The app can export session data as CSV and export/import a JSON backup. A completed capture sequence can create a summary that can be used to start a session-log entry.

The log also includes a "tonight" view that checks marked targets and planned events against darkness, altitude, Moon separation and the current setup. These calculations use approximate astronomical routines and the observer profile; they are intended as planning context, not precision ephemerides.

### 7. Keep an image library

Gallery is a local astrophotography library on the current device.

You can add images, search the library, view all photos or favorites, edit their details and delete entries. Each item can store information such as:

- Title and target.
- Capture date.
- Telescope or lens.
- Camera and filter.
- Exposure per frame and total integration.
- Tags.
- Processing notes.
- Capture notes and conditions.

Images are resized and compressed for browser storage. They are not a replacement for keeping the original files somewhere safe. Use the gallery export and your own backups for important images.

Explore is currently a presentation surface for a future public capture feed. The source can render items carrying a local published flag, but there is no complete online publishing service or public community feed connected yet. Friends, Chats and Connect are also placeholders. They do not create real groups, accounts, messages or online sessions.

### 8. Use it in the field

The layout adapts to smaller screens. On phones, the bottom bar keeps the main observing actions close at hand and the More drawer holds secondary tools such as surveys, marks, Gallery and Settings. A red night-vision layer can be toggled from the top bar to reduce bright blue/green interface light while observing. The Observe panel also has an optional Screen Wake Lock button so a supported browser can keep the display awake while the tab is visible.

These are browser features, so availability depends on the device and browser. The mobile layout still needs testing on a range of real phones and tablets, especially with map gestures and connected hardware.

### 9. Explore the habitable zone

The HZ Calculator is a separate scientific utility. It can use user-entered stellar and orbital values and includes a NASA Exoplanet Archive lookup path for planet data.

The calculator estimates incident flux and habitable-zone boundaries, and visualizes orbital flux and time spent within the conservative habitable zone for the entered orbit. It is a simplified model with assumptions; being inside a calculated habitable zone does not establish that a planet is habitable.

### 10. Accounts and profiles

The public sky workspace does not require an account.

The separate authentication page is wired to Supabase for:

- Email/password registration and sign-in.
- Google sign-in.
- Email confirmation return handling.
- Password-reset email requests.
- Recovery-session-gated password updates.
- Persistent Supabase browser sessions and sign-out.
- Reading and updating the user's profile record.

The project includes a SQL file for the profile table, a new-user profile trigger and row-level security policies. These need to be applied and verified in the intended Supabase project. Google provider settings, redirect URLs and production email delivery also need live testing.

An online account currently covers authentication and profile information. **Marks, equipment, optical trains, plans, observing logs, settings and gallery items remain browser-local. They do not sync between devices.** The legacy local account data is retained for migration compatibility; it is not a cloud identity.

## What is not finished

I want the README to be clear about this, because a project like this can look more complete from screenshots than it really is.

The current build does not provide:

- Plate solving or image-based mount centering.
- Camera image download, FITS ingestion or FITS metadata extraction.
- A full capture engine with robust sequencing and recovery.
- Real guiding, guide calibration or dithering.
- Autofocus or automatic refocusing.
- Complete filter-wheel and rotator workflows across all drivers.
- A validated multi-device capability model for every Alpaca device.
- A safety-monitor-driven observatory state machine.
- Weather-triggered shutdown, roof/dome control or unattended operation.
- A full mosaic planner.
- A constraint-based multi-target imaging scheduler.
- Cloud sync for marks, equipment, plans, logs or gallery.
- A real public Explore feed.
- Profile discovery, friend requests, groups, online sessions or chat.
- A complete privacy policy, moderation/reporting system and account/data deletion workflow.

Some controls and integrations are present as early experiments, but that is not the same as a mature, tested observatory system. In particular, the existence of a device control button does not mean every driver and physical setup has been tested.

## Where I want to take it

The longer roadmap follows the actual observing workflow rather than adding features just because other astronomy apps have them.

1. **Make the foundation dependable.** Improve optical trains, device capability discovery, mount state, abort handling and target-to-equipment context.
2. **Connect the imaging process.** Add plate-solving, camera image retrieval, a proper capture engine, autofocus, guiding, dithering, filter handling and FITS metadata.
3. **Treat observatory safety as part of the product.** Add environment devices, explicit safety states, watchdogs and tested recovery paths before supporting unattended sessions.
4. **Make planning more realistic.** Add custom horizons, richer astronomical weather data, imaging constraints, mosaics and multi-target scheduling.
5. **Build the community carefully.** Add opt-in profile discovery, friends, groups, shared sessions and messaging only after the database model, access rules, privacy and reporting tools are ready.
6. **Support more kinds of astronomy.** Later work could include planetary, lunar and solar imaging, satellites, comets, transients and exoplanet-transit planning.

I do not want to turn AstraLog into a second PixInsight, N.I.N.A. or Ekos. Dedicated tools already do deep image processing and mature observatory automation. The opportunity here is to connect the map, target, equipment, conditions, planning and record into one understandable workflow, and to work alongside the tools that already do specialist jobs well.

## Running it

This is a static browser application. There is no build step required for the current source package.

1. Download or clone the repository.
2. Serve the project folder from a local HTTP server. Do not open `index.html` using `file://`.
3. Open `index.html` in a modern browser.
4. The sky map and catalogue lookups need internet access. Some browser features and external services may behave differently on localhost and on the deployed HTTPS site.

For a quick local server with Python:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

The authentication return URLs must also be allowed in the Supabase dashboard if you want to test registration, sign-in or password recovery locally.

## Project files

| File | Purpose |
|---|---|
| `index.html` | Main sky workspace and application logic |
| `astralog.css` | Main application styling and responsive layouts |
| `auth.html` | Separate sign-in and registration page |
| `auth.css` | Authentication page styling |
| `auth-page.js` | Authentication page behavior and recovery flow |
| `auth-config.js` | Supabase project URL and browser-safe publishable key |
| `supabase-client.js` | Supabase client setup and auth-state handling |
| `supabase-profiles.sql` | Profile table, trigger and row-level security setup |
| `sw.js` | Service worker and application-shell cache |
| `astralog.html` | Legacy redirect kept for older links |
| `V34.5-PROJECT-AUDIT.md` and version notes | Historical audits, repair notes and validation boundaries |

The code still carries some AstraLog naming because that was the original workspace name and some storage keys and file names are kept for compatibility. The visible product name is Light from Afar.

## Data, privacy and backups

Most application data is stored in `localStorage` on the current browser and device. Clearing site data can remove it. Export backups regularly if the data matters to you.

The current Supabase profile system does not synchronize observing data. Do not assume that a mark, equipment setup, plan, log entry or gallery image will be available on another browser or device.

The observer profile can contain site coordinates. Treat those coordinates as private. The project does not currently provide a complete community privacy model because the community backend is not connected. Exact observing locations should never be exposed by default when community sharing is eventually implemented.

External services receive requests needed for their features. These include Aladin/CDS sky surveys and image services, SIMBAD, SpaceCatalog, Open-Meteo, Wikimedia Commons, NASA Exoplanet Archive and Supabase. Their availability, terms and privacy practices are separate from this project.

## Development notes and version history

This package is the **v34.13 recovery snapshot**. It includes the main application, authentication page, profile SQL, service worker and the historical repair notes that came with the project.

Recent work has mainly been about keeping the map stable, making the target and planning workflows dependable, and being explicit about what is local versus online.

- **v34.13:** repaired the HiPS survey identifier path and added migration handling for previously stored survey IDs. The shipped source should be treated as authoritative for the exact selectable survey list.
- **v34.12:** restored the v34.9 map baseline and added map recovery after authentication navigation.
- **v34.9:** restored the CDN-first Aladin loader with sequential fallbacks and source-specific diagnostics.
- **v34.8–v34.4:** map initialization, survey switching, planning preview retries, gallery/navigation and mobile behavior repairs.
- **v34.1–v34.3:** earlier planning image, layout, event and mark workflow repairs.
- **v33–v34:** account-flow and Supabase authentication work, with local data kept separate from the online profile.

The included version notes describe individual repairs in more detail. Static syntax checks and archive checks are not the same as live-browser testing. The current package has not been certified against every browser, every external service or real observatory hardware.

## Contributing and getting involved

I want Light from Afar to become something that other astronomy enthusiasts can contribute to, especially people interested in astrophotography, software, astronomy data and the practical side of observing.

If you want to help, useful contributions include:

- Testing the sky map and reporting reproducible survey or object-search problems.
- Testing calculations against known examples and documenting their assumptions.
- Improving accessibility and mobile field use.
- Working on Alpaca device compatibility with real hardware.
- Reviewing the data model and privacy boundaries before community features are added.
- Suggesting improvements that make an observing session easier to plan, carry out or remember.

Please describe what you tested, which browser or hardware you used, and what actually happened. A clear bug report is more useful than saying something is broken without the steps to reproduce it.

## License

This source snapshot does not include a `LICENSE` file, so no reuse or redistribution license is granted by this README. A license should be chosen and added to the repository before the project is distributed for reuse. Keep the Aladin Lite attribution visible and follow the terms of the external libraries and services used by the project.
