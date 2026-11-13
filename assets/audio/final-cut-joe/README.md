# Final Cut — Joe cab dialogue

Five original, state-specific lines are authored in `script.json`. These are generic synthetic cab-speaker performances produced locally with Windows System.Speech, **Microsoft David Desktop**, rate -1 and volume 100. They are not a cloned voice or a human acting recording. No runtime speech service or network generation is required.

Rebuild from the repository root with:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools/build-final-cut-joe.ps1
```

Requires the installed David voice, FFmpeg and ffprobe on PATH. The script retains source WAVs here, encodes five runtime Ogg Opus clips under `web/assets/audio/final-cut-joe/`, and generates `web/final-cut-dialogue-lines.js` with text, timing and playback policy. Processing: 220 Hz high-pass, 3.2 kHz low-pass, loudnorm I=-21/TP=-3/LRA=4, 48 kbit/s Opus. Current runtime total: 63,527 bytes.

The director uses an opening command, a genuinely missed observed-player pass, an actually selected ball distraction, a blocked pass and the physical bogging event. Optional lines expire rather than queue indefinitely; danger cancels speech. Heard flags survive retry/reload. Web Audio uses at most one decoded speech source alongside the existing fourteen continuous procedural sources; missing clips retain caption fallback.

Browser decode, duration, signal, peak, pause/resume, source overlap, mute/subtitle independence and missing-asset behavior are verified by `tools/verify-final-cut-drama-browser.cjs`. Human listening, Joe's performance quality and the final dramatic mix remain unverified. These clips should be judged as the current synthetic performance, not treated as completed professional voice acting.
