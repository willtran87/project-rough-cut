# Final Cut — championship PA

Eight authored receipt variants combine the same fictional role (Associate Analyst) with only the station IDs retained from a completed Night Order. The neutral variant acknowledges no prior station. Text generation and exact phrases live in `tools/build-final-cut-pa.ps1`; its generated runtime manifest is `web/final-cut-pa-lines.js`.

These recordings use local Windows System.Speech **Microsoft David Desktop**, rate 0, volume 100. They are generic synthetic announcements, not a cloned voice or human acting. The source WAVs remain in this directory. The Ogg Opus runtime files are in `web/assets/audio/final-cut-pa/`.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools/build-final-cut-pa.ps1
```

Requires Microsoft David Desktop, FFmpeg and ffprobe. Processing: high-pass 350 Hz, low-pass 2600 Hz, loudnorm I=-22/TP=-3/LRA=4, 40 kbit/s Opus. Manifest duration is derived from decoded audio sample counts at 48 kHz, rather than container duration. Initial testing found container timestamps exceeded actual decoded playback by up to 98 ms; FFmpeg decoded output and Web Audio agreed. The corrected manifest agrees with browser durations to within one microsecond.

All eight clips total 304,823 bytes. A normal chapter visit loads only its matching 32,115–49,241-byte clip alongside the five Joe clips; it does not load all receipt variants. The PA uses the existing single transient speech player. Starting the round, leaving the overlook or receiving higher-priority guidance cancels it. Heard state persists across retry/reload. A missing recording retains captions and the board.

`tools/verify-final-cut-announcement-browser.cjs` separately decodes all eight clips for validation, measures signal/peaks/duration, and checks actual playback/settings/lifecycle and responsive caption presentation. Human listening, intelligibility and dramatic effect remain unverified.
