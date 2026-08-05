# Generated moving golf-ball art polish — 2026-08-04

## Outcome

Golf-ball distractions now retain custom image-generated art throughout flight and rolling instead of reverting to procedural white circles between the authored inventory and landed states.

## Implementation

- Added three transparent generated variants: pristine flight, wet-grass roll, and scuffed ground roll.
- Selects the rolling treatment from the authoritative final surface so wet turf and soaked bunkers read damp while rough, roots, mud, bunker sand, and other coarse ground read scuffed.
- Preserved dynamic trajectory, target shadow, surface tint, rest ring, and landed recovery presentation as runtime layers.
- Tied ordinary sprite rotation to real shot progress and distance. Reduced Camera Motion keeps a stable sprite orientation without changing the shot.
- Kept the prior procedural circles only as short-lived image-loading fallbacks.
- Registered the atlas and all three variants in the custom-object audit and exposed readiness, active material, lifecycle, runtime layers, and motion preference through text state.

## Verification

- JavaScript syntax and whitespace validation: passed.
- High-resolution deterministic visual/state validation: 99/99 at 2560×1600.
- Complete responsive visual/state matrix: 396/396 across 2560×1600, 1280×720, 844×390 compact landscape, and 1280×720 Reduced Camera Motion.
- Focused movement and pursuit validation: 18/18.
- Browser errors during deterministic validation: none.
- Direct inspection confirmed the airborne ball remains crisp and proportionate against the course, while the wet rolling variant stays grounded inside its dynamic landing treatment.
- Compact-landscape inspection confirmed both moving variants remain visible without competing with the map or tactical captions. Reduced Camera Motion preserves the same art with a stable orientation.
- The required official uninstrumented traversal completed 473 rendered frames without a browser-error artifact. Canvas rendering averaged 2.66 ms with a 2.40 ms final sample.
- Official text state reported the moving atlas ready with all three variants, a complete custom-art audit, 44/44 mapped drawable obstacles, 3/3 footing materials, two wet-turf variants, and no missing art IDs.
