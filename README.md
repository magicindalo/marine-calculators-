# Indalo Marine Calculators

Indalo Marine branded, responsive, installable marine engineering toolkit for iPhone, iPad and desktop.

## Open the app
- **Main menu:** https://magicindalo.github.io/marine-calculators-/
- **Electrical Load Demand:** https://magicindalo.github.io/marine-calculators-/load.html
- **Propeller & Vessel Speed:** https://magicindalo.github.io/marine-calculators-/propeller.html
- **Battery Systems & Charging:** https://magicindalo.github.io/marine-calculators-/battery.html
- **VETUS Thruster Selection:** https://magicindalo.github.io/marine-calculators-/thruster.html
- **Exhaust Backflow & Waterlock:** https://magicindalo.github.io/marine-calculators-/exhaust.html
- **Cable Sizing & Voltage Drop:** https://magicindalo.github.io/marine-calculators-/cable.html
- **Engine & E-Line Selection:** https://magicindalo.github.io/marine-calculators-/engine.html

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
