# Indalo Marine Calculators

Indalo Marine branded, responsive, installable marine engineering toolkit for iPhone, iPad and desktop.

## Open the app
- **Main menu:** https://magicindalo.github.io/marine-calculators-/
- **Electrical Load Demand:** https://magicindalo.github.io/marine-calculators-/load.html
- **Propeller & Vessel Speed:** https://magicindalo.github.io/marine-calculators-/propeller.html
- **Battery Systems & Charging:** https://magicindalo.github.io/marine-calculators-/battery.html
- **VETUS Thruster Selection:** https://magicindalo.github.io/marine-calculators-/thruster.html
- **Exhaust Backflow & Waterlock:** https://magicindalo.github.io/marine-calculators-/exhaust.html

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

## Engineering limitations
All results are preliminary estimates. The resistance model includes a non-standard wave/residuary resistance heuristic, not a verified Holtrop–Mennen method. Sea-trial and known resistance data improve the calibration, but professional verification remains necessary before installation, cable/protection selection or propeller manufacture.

## Branding
- Original Indalo Marine logo: `assets/indalo-marine-logo.webp`
- Indalo iPhone app icon: `assets/indalo-app-icon.png`
- Home screen installed app title: **Indalo Marine** (full PWA name: **Indalo Marine Calculators**)
- All four calculator pages and generated A4 PDF reports use the Indalo name.

If an iPhone still displays the old app icon or name, open the main URL in Safari, wait for it to reload, then remove the old Home Screen shortcut and use **Share → Add to Home Screen** again. Saved projects remain in Safari website storage unless that data is cleared.
