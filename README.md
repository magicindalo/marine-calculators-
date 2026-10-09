# Marine Calculators

A responsive, installable marine engineering toolkit for iPhone, iPad and desktop.

## Open the app
- **Main menu:** https://magicindalo.github.io/marine-calculators-/
- **Electrical Load Demand:** https://magicindalo.github.io/marine-calculators-/load.html
- **Propeller & Vessel Speed:** https://magicindalo.github.io/marine-calculators-/propeller.html
- **Battery Systems & Charging:** https://magicindalo.github.io/marine-calculators-/battery.html

### Installing on iPhone
1. Open the **Main menu** in Safari.
2. Tap **Share > Add to Home Screen > Add**.
3. Launch Marine Calculators from your Home Screen.

### Save and open projects
Inside either calculator, use **Save project** to give the working calculation a name. **Open saved** lists projects of that calculator type. Projects remain in browser storage on the same device/browser, so clearing website data or switching browser/device may delete or hide those projects.

### Export PDF report
1. Complete the inputs and calculate.
2. Tap **Save PDF report** under **Project & report**.
3. Safari downloads an A4 PDF with inputs, results, assumptions and the engineering caveats.
4. On iPhone, look in **Files > Downloads** (or Safari's Downloads menu) and share or move the PDF.

The file is generated directly on-device using `reports.js` and requires no PDF service or paid subscription. A long load schedule is automatically split into multiple PDF pages.

### Included calculators
- **Electrical:** AC single-phase / three-phase / DC, demand factors, surge loading, daily energy, generator/inverter demand and battery Ah sizing.
- **Propulsion:** preliminary Wageningen B-series propeller sizing and checking, resistance screening, predicted calm-water vessel speed, diesel and electric options.
- **Battery Systems:** 12 / 24 / 48 V battery banks, series/parallel/series-parallel combinations, flooded lead-acid / AGM / LiFePO4, total kWh / Ah, usable capacity, constant-load runtime, charger current and approximate charging time. Includes BMS/manufacturer-limit cautions.

## Engineering limitations
All results are preliminary estimates. The resistance model includes a non-standard wave/residuary resistance heuristic, not a verified Holtrop–Mennen method. Sea-trial and known resistance data improve the calibration, but professional verification remains necessary before installation, cable/protection selection or propeller manufacture.
