# Indalo Marine Calculators — Version 1.0
Indalo Marine branded, responsive, installable marine engineering toolkit for iPhone, iPad and desktop.

Review the [Version 1 validation record](docs/V1_VALIDATION.md) before using the app to assist with vessel specification. The app is an engineering-estimate tool and is not a certified design or manufacturer-approval service.

## Open the app
- **Main menu:** https://magicindalo.github.io/marine-calculators-/
- **Electrical Load Demand:** https://magicindalo.github.io/marine-calculators-/load.html
- **Propeller & Vessel Speed:** https://magicindalo.github.io/marine-calculators-/propeller.html
- **Battery Systems & Charging:** https://magicindalo.github.io/marine-calculators-/battery.html
- **VETUS Thruster Selection:** https://magicindalo.github.io/marine-calculators-/thruster.html
- **Exhaust Backflow & Waterlock:** https://magicindalo.github.io/marine-calculators-/exhaust.html
- **Cable Sizing & Voltage Drop:** https://magicindalo.github.io/marine-calculators-/cable.html
- **Diesel Engine & Hull Speed:** https://magicindalo.github.io/marine-calculators-/diesel.html
- **E-Line Electric & Battery Runtime:** https://magicindalo.github.io/marine-calculators-/eline.html
- **Legacy combined Engine & E-Line:** https://magicindalo.github.io/marine-calculators-/engine.html (existing saved projects remain supported)

### Installing on iPhone
1. Open the **Main menu** in Safari.
2. Tap **Share > Add to Home Screen > Add**.
3. Launch **Indalo Marine** from your Home Screen.

### Thruster sizing method
The VETUS thruster selector implements the windage and moment-arm calculation from the two supplied VETUS catalogue pages 220 and 221. It uses an up-to-date shortlist of VETUS standard DC, BOW PRO and Boosted, and ignition-protected model numbers from the official VETUS webshop (reviewed October 2026). Product suggestions are by thrust rating, voltage/source architecture and tunnel size, **not by boat length alone**.

BOW PRO Boosted **12/24 V** means a 12 V charging source and a separate 24 V thruster battery bank. **24/48 V** means a 24 V charging source and separate 48 V thruster bank; these cannot automatically be assumed to be directly connected to existing house/propulsion voltage. Confirm the model manual, battery configuration and installation requirements.

### Save and open projects
Inside either calculator, use **Save project** to give the working calculation a name. **Open saved** lists projects of that calculator type. Projects remain in browser storage on the same device/browser, so clearing website data or switching browser/device may delete or hide those projects.

### Export PDF report
1. Complete the inputs and calculate.
2. Tap **Save PDF report** under **Project & report**.
3. Safari downloads an A4 PDF with inputs, results, assumptions and the engineering caveats.
4. On iPhone, look in **Files > Downloads** (or Safari's Downloads menu) and share or move the PDF.

Reports are branded **Indalo Marine Calculators** and generated directly on-device using `reports.js` and requires no PDF service or paid subscription. A long load schedule is automatically split into multiple PDF pages.

### Included calculators
- **Electrical:** AC single-phase / three-phase / DC, demand factors, surge loading, daily energy, generator/inverter demand and battery Ah sizing.
- **Propulsion:** preliminary Wageningen B-series propeller sizing and checking, resistance screening, predicted calm-water vessel speed, diesel and electric options.
- **Battery Systems:** 12 / 24 / 48 V battery banks, series/parallel/series-parallel combinations, flooded lead-acid / AGM / LiFePO4, total kWh / Ah, usable capacity, constant-load runtime, charger current and approximate charging time. Includes BMS/manufacturer-limit cautions.
- **VETUS Thruster Selection:** Beaufort/custom wind-pressure sizing, estimated required bow/stern kgf, tunnel size and 12/24/48 V source filters; suitable product model numbers, PDF report and saved vessel records.
- **Exhaust Backflow & Waterlock:** 25% VETUS hose-water return rule and 2x capacity selection (from `Vetus Calculator Book 12-10-2018.xls` Flow Back worksheet and VETUS 2026–27 catalogue), model shortlist by capacity and hose diameter; optional engine power/backpressure screen, anti-siphon warnings, A4 report and saved project.
- **Engine & E-Line Selection:** Vessel power screening using LWL, beam, draft, loaded displacement, speed, engine count and hull type; trial-power calibration; compares VETUS M-Line, H-Line, D-Line and E-Air/E-Line shaft-drive models. Includes 24/48V electric limits, battery endurance, saved vessel projects and A4 reports.\n- **Cable Sizing & Voltage Drop:** 12/24/48 V DC; 230 V AC single-phase and 400 V AC three-phase screening; ampacity/voltage-drop sizing in mm², engine-room and bundling derating, existing-conductor checks and carefully limited nominal fuse/breaker advice. Saves vessel projects and exports Indalo-branded A4 PDFs.

## Engineering limitations
All results are preliminary estimates. The resistance model includes a non-standard wave/residuary resistance heuristic, not a verified Holtrop–Mennen method. Sea-trial and known resistance data improve the calibration, but professional verification remains necessary before installation, cable/protection selection or propeller manufacture.

## Branding
- Original Indalo Marine logo: `assets/indalo-marine-logo.webp`
- Indalo iPhone app icon: `assets/indalo-app-icon.png`
- Home screen installed app title: **Indalo Marine** (full PWA name: **Indalo Marine Calculators**)
- All four calculator pages and generated A4 PDF reports use the Indalo name.

If an iPhone still displays the old app icon or name, open the main URL in Safari, wait for it to reload, then remove the old Home Screen shortcut and use **Share → Add to Home Screen** again. Saved projects remain in Safari website storage unless that data is cleared.

## Cable sizing reference and limits

The cable tool uses ISO 13297:2020 Annex A metric copper 70°C, 85–90°C and 105°C ampacity tables with Annex A.2 derating factors for engine spaces and bundled conductors. It computes voltage loss using copper resistance at selected cable temperature, and separately checks the current-carrying capacity. Sources: ISO 13297:2020 (https://www.iso.org/standard/69551.html), Blue Sea Systems (https://www.bluesea.com/resources/95), and Victron Wiring Unlimited (https://www.victronenergy.com/media/pg/The_Wiring_Unlimited_book/en/dc-wiring.html).

The fuse/breaker figure is explicitly **provisional** and offered only for single-conductor non-motor circuits up to 150 A where a standard nominal rating fits the selected cable's derated ampacity, load allowance and optional equipment limit. The selection does **not** check available short-circuit current, fuse interrupt rating, breaker curve, cable termination temperature, or equipment manufacturer protection. Fuse output is withheld for electric propulsion, motors, thrusters, parallel-conductor runs and three-phase AC.

Three-phase circuit voltage drop is a resistance-only screening estimate; IEC 60092-507 and manufacturer-specific specifications must be checked for marine AC three-phase installations. Electric propulsion follows ISO 16315 rather than the ordinary small-craft wiring scope. Reports are design working papers, not a certified electrical installation design.

## Engine selection sources and limitations

Engine ratings and currently listed models verified in October 2026 against official VETUS webshop range pages:
- M-Line: https://webshop.vetus.com/en/products/engines/m-line-engines/
- H-Line: https://webshop.vetus.com/en/products/engines/h-line-engines
- D-Line: https://webshop.vetus.com/en/products/engines/d-line-engines
- E-Line/E-Air: https://webshop.vetus.com/en/products/electric-propulsion/e-line-engines

A 24 V-class propulsion bank is matched only to EAIR05024; all other listed E-Air/E-Line models are 48 V class. This is only a DC-supply screening, not an electrical system design.

Hull power calculations use the preliminary ITTC-1957 friction + custom wave term from `resistance.js` for displacement craft with Fn ≤ 0.42. Sea-trial power can calibrate this. Planing craft use a Crouch empirical power-versus-weight method, with a hull-dependent coefficient and near-maximum target speed. These are **screening models only**, not a validated powering/propeller prediction and not a marine engine suitability certificate.

Diesel and E-Line rated outputs are not interchangeable by horsepower. Manufacturer verified propeller-load spectra, available torque, duty/thermal limits, gearbox ratio, cooling, physical installation, emissions approvals and BMS/battery design must be established before specification. The allowed diesel duty, E-Line duty, gearbox losses and electric efficiency are user-entered assumptions, not universal product ratings.

© 2026 J. Spaven. App and Indalo Marine logos owned by J. Spaven. All rights reserved. VETUS trademarks and product information remain the property of their respective owners.

### Engine & E-Line gearbox reference

The Engine calculator includes an optional VETUS installed-engine reference, AHEAD gearbox reduction ratio and observed engine RPM. For a VETUS VD4.140 with 2:1 ahead reduction, manufacturer data from the [VETUS D-Line technical manual](https://vetus.com/wp-content/uploads/360602.01_r05_2025-02_D_Line_EN.pdf) supports 103 kW flywheel / 99 kW prop shaft at 2400 engine rpm (1200 shaft rpm); maximum engine torque 520 Nm at 1600 engine rpm yields about 998 Nm at 800 shaft rpm with a user-assumed 96% transmission efficiency. The engine must not be specified solely from a gearbox torque screen; absorbed propeller torque is not calculated. Unverified propeller diameter or pitch must **not** be assumed or entered.

**Heavy displacement safeguard:** for displacement, semi-displacement and canal boats of 25 tonnes or more, engine shortlists are withheld without a measured shaft-power/speed trial; the independent reference gearbox comparison remains available. This is especially relevant to the Piper Boats Kiwi Wonderer (35 tonnes, VD4.140, believed 2:1 reduction). Its reported 22 × 16 propeller is unverified and intentionally excluded from all benchmark calculations.

### Version 1.1 propulsion split (9 October 2026)

The home screen now displays **Diesel Engine Sizing** and **E-Line Electric Selection** as separate tools. The earlier combined `engine.html` remains accessible for previously saved `kind:"engine"` projects.

**Diesel:** computes theoretical displacement hull speed from LWL using `1.34 × √(LWL in feet)`. It separately evaluates the selected cruise-speed and theoretical hull-speed shaft power using the existing simplified resistance model and optional measured total delivered shaft power. It only shows a provisional diesel model shortlist if both speed points are within the screen's supported calculation range; for 25 t or heavier displacement craft, it requires measured shaft-power trials, and refuses extrapolation more than 25% above measured trial speed. Inland-waterway hull-speed powering requires trial data. The existing VETUS D-Line gearbox reference remains independent: no unverified propeller diameter or pitch is assumed. **Theoretical hull speed does not uniquely determine maximum required horsepower.**

**E-Line:** screens VETUS E-AIR/E-Line shaft-drive motors against the target speed, expected shaft power, 24/48 V bank class, propulsion sizing margin and allowable duty. It calculates propulsion and constant domestic DC demand, available usable bank kWh after a separate retained reserve, cruising duration, indicative current and nominal battery for desired hours. Battery-life figures are withheld where no compatible motor passes the selection criteria, or hull powering is insufficiently supported. Manufacturer torque, thermal, BMS, DC fault-protection, cable and propeller verification is mandatory.

For current work, use the two separate menus. Saved projects on the original combined page are not transferred or deleted.

### Propeller performance curves and photographed benchmark (Version 1.2)

The **Propeller & Speed** calculator now draws two responsive marine-engineering charts:

1. Estimated vessel shaft-power demand versus speed through water (mph), calculated from the existing ITTC friction plus heuristic wave/resistance model. This is a **preliminary hull powering screen**, NOT a certified power curve.
2. Fixed-pitch Wageningen B-series propeller absorbed power versus engine RPM, with a distinct, dashed **illustrative** full-load diesel envelope. The latter is NOT a verified engine manufacturer torque curve.

The graph section accepts an optional observed cruise engine RPM and boat speed (mph) to refine the speed/RPM relationship. The main output's **geometric apparent pitch slip** uses uncorrected vessel speed, to match the supplied software screenshot convention; the previous wake-corrected slip remains visible in the technical details.

The `Load photographed benchmark` button fills **test data only**: 60 ft / assumed LWL 18.29 m, assumed beam 4.22 m, draft 0.95 m, displacement 36 t, seawater, four blades, blade area ratio 0.690, 22 × 16 in propeller, 2:1 reduction, rated engine 2400 RPM, 9.4 mph top speed / 849 RPM and 3.5 mph cruise. The shaft power supplied is ~129.98 hp from the photographed 134 hp rated engine and 97% gearbox efficiency. **The 22 × 16 size is not verified for Kiwi Wonderer and must not be transferred into other vessel selections.**

**Photographed software versus Indalo (top/cruise):**

| Test quantity | Photo top | Indalo top | Photo cruise | Indalo cruise |
|---|---:|---:|---:|---:|
| Propeller absorbed hp | 113 | 97.2 | 5 | 4.25 |
| Open-water efficiency % | 40.1 | 40.2 | 40.8 | 41.5 |
| Delivered thrust lbf | 1754 | 1922 | 212 | 233 |
| Geometric pitch slip % | 48.2 | 48.3 | 45.6 | 45.6 |
| Vessel power curve hp | 90 | 50.5 | 5 | 1.39 |

Propeller absorbed power is ~14–15% lower in Indalo and the efficiency/slip agree closely. In contrast, the independently estimated **hull powering curve is ~44% low at the target top speed and ~72% low at cruise** compared to the other software. These two software calculations are **not interchangeable**, nor is either verified against measured shaft-power or full-scale speed/power trials. The engine power envelope in the graph is illustrative, and the photographed reference 90 hp vessel curve and 113 hp propeller-absorption figure represent different methods/quantities. Do not treat an uncalibrated Indalo hull power graph as sufficient for engine selection.

The PDF report includes curve assumptions and the slip-method distinction. The actual responsive graphs are drawn in the browser.

### Propeller graphs embedded in downloadable PDF reports (Version 1.3)

The **Propeller & Speed** report now embeds the **actual live calculated vessel-power/speed and propeller-absorption/RPM curves** as sharp, resolution-independent PDF vector graphics on a dedicated "Performance and power curves" page. This is not a screenshot of the browser charts, and the PDF stays crisp when zoomed or printed. The visual and PDF plots share the same numerical data.

The dashed engine-power envelope remains an **illustrative** shape, not a manufacturer-verified engine torque curve. The vessel-power graph remains a low-confidence resistance estimate without sea-trial measurements. If complete hull dimensions are unavailable, only the propeller-absorption curve is exported, never a blank hull chart. The original Save Project and PDF tools in the other calculators are unchanged.

On iPhone, open the propeller calculator, press Calculate or Check Propeller, then use **Save PDF report**. The embedded plots are created from the current fields at export time; no screenshots, external libraries, downloads or internet connection are required.
