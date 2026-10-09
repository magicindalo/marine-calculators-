# Indalo Marine Calculators — Version 1.0 validation record

**Release review:** 9 October 2026
**App and Indalo Marine logo ownership notice:** © 2026 J. Spaven. All rights reserved.
**Scope:** Seven installable browser-based marine engineering calculators on GitHub Pages.

## What's in the V1 release

1. Load Demand
2. Propeller & Vessel Speed
3. Battery Systems & Charging
4. VETUS Bow/Stern Thruster Selection
5. Wet Exhaust Backflow & Waterlock Selection
6. Cable Size, Voltage Drop & Fuse Advice
7. VETUS Engine & E-Line Selection

All modules share the Indalo visual theme and **Save Project / Open Saved / PDF Report** tools. The main home screen no longer advertises coming-soon features. The 2026 J. Spaven ownership notice is on the main screen, while VETUS references remain third-party trademarks.

## Automated checks

| Check | Result | Interpretation |
| --- | --- | --- |
| Battery topology, Ah/kWh, battery charge-current manufacturer caps and runtimes | 300 / 300 passed | Invariants, **not** a manufacturer's battery approval |
| Bow/stern thruster kgf, source voltage and tunnel filtering | 300 / 300 passed | Matches declared catalogue ratings, not installation approval |
| Exhaust backflow, 2× capacity, selected diameter and power guide | 300 / 300 passed | Static water volume, **not** exhaust pressure-loss testing |
| Cable voltage drop, ampacity, protected device limits and invalid inputs | 300 / 300 passed | Preliminary engineering estimates, not standards certification |
| Diesel/E-Line output filtering, battery assumptions and engine ratings | 300 / 300 passed | Internal sizing consistency only |
| Separate AC/DC/3-phase load-demand arithmetic examples | 4 / 4 passed | Power factor, watts, amps and demand-hours |
| Wageningen B-series KT/KQ finite and expected thrust trend | 36 / 36 passed | Polynomial behaviour tests, **not** a propeller sea trial |
| Seven-page PDF example with long load schedule and valid PDF cross-reference | Passed | Structural generation test; iOS share-sheet behaviour still needs human device testing |
| HTML/JavaScript parse and internal-navigation/static manifest checks | Passed | Does not replace browser or sea-trial testing |

**Total formula cases:** 1,540 (1,500 property cases + four load arithmetic examples + 36 propeller coefficient cases).

## Published boat specification sanity checks

### BENETEAU Oceanis 34.1

- Official BENETEAU published beam 3.57 m, lightship 5,470 kg and up-to-30 hp option.
- SailboatData lists LWL 9.50 m, deep fin-keel draft ~2 m and 21 hp original auxiliary configuration.
- Using LWL, full keel draft, beam, displacement and 6 knots produces an unusually low geometric block coefficient (~0.08); the simplified hull resistance estimator cannot represent keel/appendage drag properly.
- **V1 action:** the engine calculator now withholds automatic engine/E-Line matches for such an uncalibrated deep-keel case and requests measured shaft-power/sea-trial data.
- Links: https://www.beneteau.com/oceanis/oceanis-341 , https://sailboatdata.com/sailboat/oceanis-341-beneteau/

### Jeanneau Sun Odyssey 349

- Published hull length 9.97 m, beam 3.44 m, 5.35 t light displacement, deep-keel draft 2.09 m and 21 hp auxiliary.
- A simple wetted-area/block-coefficient estimate likewise omits deep-keel hydrodynamics.
- **V1 action:** no automatic engine match for the uncalibrated yacht.
- Link: https://www.jeanneau349.com/features.htm

### Jeanneau Merry Fisher 895 Sport S2 — planing benchmark

- Published 2025 sea-trial: twin Yamaha V6 200 hp, approximately 34 knots maximum with five aboard; a laden figure near 5 t is also reported in a separate model review.
- Those engines total roughly 298 kW rated *engine output*, not measured shaft power.
- V1 Crouch coefficient of 180 predicts around 293 kW theoretical shaft-power demand for an assumed 5 t at 34 knots; the order of magnitude is close. **The apparent ~2% numerical agreement is not a performance accuracy claim:** displacement, installed-engine rating and measured delivered shaft power are different quantities, and outboard drive losses vary.
- **V1 action:** changed default planing coefficient from 150 to 180 and emphasised sea-trial calibration and Crouch uncertainty.
- Links: https://www.boatnews.com/story/49938/sea-trial-of-the-merry-fisher-895-sport-s2-handling-performance-and-driving-pleasure , https://www.pbo.co.uk/reviews/boats/merry-fisher-895-vs-cap-camarat-9-0-wa

### BENETEAU Antares 8 — second planing benchmark

- BENETEAU gives 250 hp and 35 kn top speed; a separate inboard specification gives lightship approximately 2.45 t.
- A **hypothetical loaded 3.2 t** example at 35 kn predicts approximately 199 kW with coefficient 180, versus about 186 kW of fitted 250 hp engine rating. The loaded displacement is an **assumption, not a documented test value**, so this is a sensitivity sanity check only.
- Link: https://www.beneteau.com/antares-outboard/antares-8

### 60 ft narrowboat — diesel and electric comparison

- Published 60 ft diesel inland boats may have a 42 hp diesel, for example the JD Narrowboats *Joseph*.
- The Bluewater Boats *Gongoozler* is a 60 ft electric narrowboat equipped with VETUS E-Line 11 kW, a 6.5 kVA generator and lithium battery bank.
- The uncalibrated water-resistance screen can shortlist much smaller propulsion units because it does not model canal depth, banks, heavy propeller apertures, manoeuvring and reserve.
- **V1 action:** explicitly warn users not to equate its minimum calm-water power screening with verified narrowboat engine or E-Line selection.
- Links: https://tingdeneboating.com/boats-for-sale/jd-narrowboats-60-narrowboat-joseph/ , https://www.bluewaterboats.co.uk/builds/gongoozler

## VETUS and standards cross-checks

- VETUS E-LINE 22: nominal maximum 22 kW and maximum torque 130 Nm; VETUS also lists **20 kW at 1,500 rpm** in normal mode. V1 now caps the ordinary-duty screen at 20 kW per motor and warns when its approximate 15 m / 20 t vessel guidance is exceeded.
- VETUS M/H/D-Line product family and horsepower numbers were checked against official published VETUS category pages.
- Battery, cable, exhaust, propeller and thruster selection remain **preliminary calculation aids**; all installations must follow exact current model manuals.
- ISO 13297:2020 covers DC nominal 50 V or below and AC single phase 250 V or below; 3-phase marine AC and electric propulsion require their own standards/protection reviews.
- Links: https://vetus.com/vetus-campaigns/e-line-22-kw/ , https://www.iso.org/standard/69551.html

## Explicit outstanding limitations

1. A passed software test cannot certify vessel hydrodynamic performance; real measured speed, draft, load, propeller and shaft-power data remain necessary.
2. The engine/resistance and propeller solvers are estimates rather than a verified tank-test/CFD or certified propeller selection service.
3. Cable fuse suggestions do not establish interrupting capacity, source short-circuit current, fuse curves or IEC installation compliance.
4. Waterlock calculations address static backflow volume, not total exhaust backpressure, repeated cranking or siphon installation feasibility.
5. Exact VETUS product availability and ratings may change; check up-to-date manufacturer's specification before ordering.
6. Browser-local saved projects do **not** synchronise across devices; export project/PDF data before deleting browser storage.
7. A full human iPhone Safari/Home Screen installed-mode and print/share acceptance test should be completed before any safety-critical customer deployment.

**Release classification:** `v1.0` — working engineering-estimate application, not a certified design tool.
