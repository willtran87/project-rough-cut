# Nine theme follow-up refinements — 2026-11-15

Implemented the nine findings in `design/theme-followup-review-2026-11-14.md`. Intro animation and lead-in preserved.

## Completion ledger

1. **Settings grouping:** controls/help inherit their semantic section, explicit Back Nine help categories, picture quality grouped with Camera, input guide with Controls. Night Order comfort heading stays with its controls. All four chapters have no empty Chapter category. Existing controls/handlers remain in place.
2. **Map artwork:** engraved survey grid, stepped terrain/cover footprints and consistent legend; static terrain/obstacle plan cached once. Map backing buffer doubled to its actual 468×680 presentation size for clearer labels. Live player, routes, objective state and hazard highlights remain dynamic.
3. **Map layout:** bounded 1100px reading area, balanced plan/legend/route columns and a single scroll column on phones.
4. **Night Order secondary HUD:** Map, instructions, captions and resources share forest/brass materials and type treatment; threat colors retained.
5. **Touch kit:** common brass borders, forest fills, sentence-case labels and active treatment. Night Order now reflects its existing held movement/chip/crouch/listen/rear states. Native geometry and input handlers unchanged.
6. **Back Nine portrait:** full-height static chapter surround, chapter identity, positioned objective/controls and driving reminder; live warnings suppress the reminder. Wide 16:9 driving view preserved.
7. **Outcome image frame:** Final Cut completion frame follows the illustration aspect ratio and image width, with caption below.
8. **Action terminology:** Night Order pause/outcome actions use sentence case and Main menu, retaining route-specific action verbs.
9. **Lantern finish:** shared 64×64 aged-metal atlas adds seams, edge wear and oxidation to caps/bases/rims. Existing glass stays separate. No lighting/layout/geometry changes.

## Verification

Evidence and reproducible scripts: `output/theme-nine/`.

- Full browser captures at actual 2560×1600 first, then1280×720 and390×844; high-resolution map/settings/completion inspected. Final Night Order/Back Nine captures repeated after layout refinements. No horizontal overflow in measured map, dialog or panel surfaces.
- `interactions.cjs night-order back-nine under-green final-cut`: all PASS. Story flow, keyboard/controller start and notes, category selection and nonempty controls, mute save/resume, journal, pause/resume,130% text action bounds;2560×1600,1280×720,390×844 and844×390 pause action bounds. No page errors.
- `completion.cjs`: Final Cut completion fixture at all three sizes, expanded round record, credits and primary action visibility PASS.
- Installed develop-web-game Playwright client ran two input iterations and reached `final_cut_playing`; inspected resulting screenshot/state. No error artifact.
- Node syntax checks passed for modified JS and new lantern module.
- Seven protected files SHA256-identical: intro-presentation.js, screen-fracture.js, course-menu-atmosphere.js, course-menu-atmosphere-fallback.js, course-menu-ui.js, course-menu.css, course-menu-materials.css.

## Performance

1280×720 native Chromium/D3D11, paired saved-source baseline/current contexts. Night Order waited for actual scene frames and completed preparation before measurement, avoiding the previous review's loading-state pitfall.

- Five batches of120 forced map refreshes: median baseline0.683ms/refresh; current0.247ms/refresh. Static plan cache removes repeated terrain construction despite the sharper backing buffer. This is CPU submission work, not whole-game FPS.
- Three seconds of warmed gameplay pause: browser task time99.9ms baseline →81.6ms current; script54.6→41.7ms; zero layouts in both. Short local samples, not a full-route/device guarantee.
- Lantern layout exactly identical:14 symmetric pairs /28 lanterns. Ground-lantern geometry16128 triangles unchanged. Pixel-world material count224 unchanged. One shared64×64 texture, no new light/render pass/animation loop. Frame-wide draw/triangle counts vary with live scene state and were not treated as a controlled comparison.
- Static CSS/UI changes introduce no polling or extra animation. Cache uses one468×680 canvas; higher-resolution existing map buffer adds less than1MiB of raw RGBA storage, plus approximately1.2MiB for the static plan.

No commits, deployment, agents or CUA. Existing port4187 server and unrelated workspace changes preserved.
