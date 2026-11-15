# Level 1 regional soundscapes

Part of the full Level 1 experience goal. Previous turn made verified station/HUD progress. Current source inspection found that regional lighting existed but ambient wildlife remained nearly uniform, including insects and pond sounds on the Dead Green.

## Change

course-soundscape.js shares course-atmosphere.js zone boundaries and their smooth 24-course-unit transition. Eight profiles weight natural life, nearby environmental mechanisms and the wind/music bed:

- Tee: strongest natural life, restrained distant property sounds.
- Audit Row: reduced wildlife and a quieter bed around the bell.
- Water Hazard: foreground pond motifs and remaining insects.
- Clubhouse: strongest damaged closing chime, less wildlife.
- Service Maze: subdued wildlife, stronger mechanism/fence sounds. A source at the existing service cart (-58,409 course units; corrected during the old-finish pass) supplies body creaks locally.
- Dead Green: no wildlife, ponds, building creaks, chime or fence flavor in its core; underlying bed falls to42%. Environmental voices already playing retire over half a second. Recovery cannot repopulate its wildlife.
- Night Range: sparse nature and exposed boundary rattles.
- Release Corridor: local exit-shed sound and restrained nature.

Only environmental synthesis and the existing ambience/music hush are affected. Mower, footsteps, interactions, voice/PA and AI inputs are separate. Ghost voices are not retired by the Dead Green rule, although they still follow the existing atmospheric bus mix. No new samples, lights, rendering resources or simultaneous voices. Maximum remains six transient voices.

## Evidence

- verify-course-soundscape.mjs: eight zone identities, gain bounds, continuity at shared transition endpoints, lifeless core and dominant clubhouse/service profiles.
- verify-course-soundscape.cjs: actual OfflineAudioContext renders of all eight profiles. Dead Green peak/RMS/events are zero; every other region has nonzero bounded output. Clubhouse emits radio and Service Maze emits shed/metal creak. All rendered voices end and remain within six.
- Real-time transition check starts natural sound, enters Dead Green, waits for existing voices to retire, checks recovery adds no wildlife, then exits and verifies nature resumes. Repeated update at unchanged time adds no events; pause cleans voices.
- Real game integration checks actual player.y -> audio profile, pause/return, zero wildlife gain in Dead Green and normal Night Range return. Audio update does not change player/AI/completion state. Captured high-resolution Night Range fixture; its controlled point sits near a floodlight pole, so it is not used as a composition acceptance image.
- Existing verify-atmospheric-audio.cjs passes rendered nature/pond/shed/fence/radio/ghost motifs, panning, priority/Focus/mute/pause, integration and six-voice lifecycle. No browser errors.
- Standard installed client completed two iterations; page1/state1 inspected first_hole/ready,26course units traveled,tee profile,no errors. SwiftShader640x360 smoke evidence only. Release verifier passes90scenario definitions/68image references/no warnings; syntax and scoped whitespace pass. All test handles terminal.

Artifacts: output/course-soundscape/ and output/atmospheric-audio-20261107/. Human listening, distinct-zone recognition, emotional pacing, first-time playtests and sustained hardware/software performance remain unproven. All other unchecked full-scope requirements remain open.
