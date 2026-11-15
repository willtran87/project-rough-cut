# Anatomical source data

The original core graphical assets here come from [MakeHuman](https://github.com/makehumancommunity/makehuman), pinned to commit `a8bc2d54ff0ac92e78ff71431b1023eda42bf482`. `provenance.json` records upstream paths and verified SHA-256 values. The accompanying `LICENSE.ASSETS.md` dedicates the core graphical assets to CC0 1.0; the application code has a separate license. No upstream application code was copied into this project.

`tools/build-joe-model.py` reads the body, eye and helper-tights geometry from `base.obj`, blends the young/old male and rectangular-head shape targets, and reshapes it for Joe. Clothing is expanded, bent into the existing 17-bone rig, weighted, folded and reduced for runtime. The head is reshaped and fitted with generated pixel material maps, modeled scalp hair and an office collar. These are derived meshes, not an unmodified stock character.

The original body/face source data is retained for reproducible offline builds. The browser loads only the exported GLB. MakeHuman core data is not needed or downloaded at runtime.
