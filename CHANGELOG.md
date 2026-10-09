# Changelog

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
