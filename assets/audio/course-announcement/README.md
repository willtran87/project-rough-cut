# Course PA announcement

Line: **The course is now secured.**

Locally synthesized with installed Windows `Microsoft David Desktop`, rate -1,
volume 100. This is a generic automated PA voice, not a recording or imitation of
Joe or another person. Source WAV retained here; runtime Opus file is
`web/assets/audio/course-secured.ogg` (13,745 bytes, approximately 2.52 seconds).

Rebuild: `powershell -NoProfile -ExecutionPolicy Bypass -File tools/build-course-announcement.ps1`.
Requires the installed Windows speech voice and FFmpeg. The script applies a
280–3400 Hz speaker bandwidth and -20 LUFS normalization with -3 dBTP target.
Runtime playback uses the existing Effects/master buses, spatial pan/attenuation,
pause offsets and priority cancellation. No speech synthesis or remote request
is required by the player; the packaged clip decodes locally in the browser.

Signal and lifecycle tests are in `tools/verify-course-announcement.*`.
These tests are not human listening acceptance.
