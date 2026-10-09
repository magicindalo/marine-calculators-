# Changelog

## Version 1.3 — PDF power curves (9 October 2026)

- Added both propeller-performance charts directly to the A4 **Save PDF report** output.
- Charts are rendered as sharp PDF vector lines, axes, labels and design/cruise markers, with no screenshot conversion or external dependency.
- Dedicated "Performance and power curves" PDF page, including model assumptions.
- Vessels without enough dimensions export only the valid propeller RPM/absorption chart; blank graphs are not added.
- Kept all other calculator PDFs, the shared project library, and the main propeller results intact.
- Tested generated PDF structure, both sizing/checking modes, full hull data and missing-hull-data scenarios.


## Version 1.2 — Propeller performance graphs (9 October 2026)

- Added responsive SVG installed-hull-power versus speed and propeller absorption versus RPM graphs, styled in the Indalo theme.
- Added an illustrative (not manufacturer-verified) engine full-load profile, optional cruise speed/RPM and separate top/cruise markers.
- Added a one-tap photographed 60ft/36t benchmarking case; existing propeller 22x16 is used exclusively as unverified test input.
- Compared power, open-water efficiency, thrust, geometric slip and hull power from source screenshots; results and discrepancies are documented in README.
- Corrected 'apparent slip' to the geometric convention in UI/PDF and retained wake-corrected slip in the technical readout.
- Added benchmark warnings when hull power differs substantially. Updated PDF curve assumptions.
- No change to saved-project storage structure or other calculator engines.


## Version 1.1 — Diesel and E-Line selection split (9 October 2026)

- Split one combined home-menu tool into two focused calculators: Diesel Engine Sizing and E-Line Electric Selection.
- Diesel screen: traditional displacement hull speed, power-to-target and power-to-theoretical-hull-speed estimates, VETUS diesel model screening and optional known-engine gearbox RPM/torque.
- E-Line screen: 24/48 V motor selection, domestic load, nominal/usable battery capacity, retained reserve, indicative current, estimated runtime and battery for desired passage.
- Added safeguarding for extrapolating a measured shaft-power sea trial more than 25% above observed speed; do not infer guaranteed peak power from hull speed alone.
- Suppressed E-Line runtime if no listed motor can meet expected power and duty.
- Retained `engine.html` and local `engine` project data for compatibility; new `diesel` and `eline` projects save separately.
- Updated main navigation, PWA manifests, offline cache, Indalo report headings and navigation.
- Preserved J. Spaven ownership statement and third-party VETUS attribution.


## Version 1.0 — 9 October 2026

- Seven marine calculation tools organised on one iPhone-friendly Indalo Marine home screen.
- Removed the coming-soon section and added J. Spaven copyright/ownership notice.
- Refined crisp transparent logo rendering and mobile accessibility/focus styling.
- Cross-checked vessel sizing against published sailing-yacht, narrowboat and planing-boat examples.
- Increased default planing Crouch coefficient to 180 with clearly documented uncertainty.
- Restrained unsafe uncalibrated deep-keel sailing-yacht recommendations.
- Limited E-LINE 22 ordinary screened capacity to 20 kW at 1,500 rpm (22 kW maximum output) and flagged manufacturer size guidance.
- Added narrowboat power-underestimation caution based on published real-world diesel/E-Line installations.
- Ran 1,540 formula cases across all seven calculators, plus PDF and static integration checks.
- Published detailed engineering limitations at [docs/V1_VALIDATION.md](docs/V1_VALIDATION.md).

### Compatibility

Existing saved local browser projects continue to use the same localStorage keys and PDF tools. Do not clear Safari website data without exporting/backing up saved projects. A final hands-on iPhone acceptance test is recommended before safety-critical use.
