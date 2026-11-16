// Builds Joe's spoken lines for Night Order, the Back Nine and Under the Green
// from the text the game already shows, using the same voice and processing as
// tools/build-final-cut-joe.ps1 (Windows speech synthesis, then ffmpeg).
//
//   node tools/build-joe-voice.mjs            build clips that are missing
//   node tools/build-joe-voice.mjs --list     print the line count and exit
//   node tools/build-joe-voice.mjs --check    exit 1 if any line has no clip
//
// Requires Windows (System.Speech, "Microsoft David Desktop") and ffmpeg on
// PATH. Source wavs are temporary; only the encoded clips are kept. A clip is
// named after its line's text (see web/joe-voice.js), so editing a line makes a
// new clip and --prune removes clips whose line no longer exists.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
import {fileURLToPath, pathToFileURL} from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const web = path.join(repo, 'web');
const outDir = path.join(web, 'assets', 'audio', 'joe-voice');
const load = file => import(pathToFileURL(path.join(web, file)).href);
const {spokenText, voiceClipId} = await load('joe-voice.js');

function strings(value, out = []) {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach(item => strings(item, out));
  else if (value && typeof value === 'object') Object.values(value).forEach(item => strings(item, out));
  return out;
}

// Every source of Joe's displayed speech. Identifiers and tone labels inside
// the Night Order capture table are not speech, so only its `lines` are read.
async function allLines() {
  const backNine = await load('back-nine-dialogue.js');
  const defeat = await load('defeat-dialogue.js');
  const sandbox = {window: {}};
  vm.runInNewContext(fs.readFileSync(path.join(web, 'joe-dialogue.js'), 'utf8'), sandbox);
  const nightOrder = sandbox.window.ROUGH_CUT_JOE_DIALOGUE;
  // game.js keeps a small base set of capture lines and state barks of its own,
  // declared just before it reads the library above. Evaluate only that slice.
  const game = fs.readFileSync(path.join(web, 'game.js'), 'utf8');
  const from = game.indexOf('const BASE_JOE_CAPTURE_LINES'), to = game.indexOf('const JOE_DIALOGUE_LIBRARY');
  if (from < 0 || to < from) throw Error('Could not find the base Joe lines in web/game.js');
  const base = vm.runInNewContext(game.slice(from, to) + ';({capture:BASE_JOE_CAPTURE_LINES,barks:BASE_JOE_STATE_BARKS})', {});
  const raw = [
    ...base.capture.flatMap(entry => entry.lines), ...strings(base.barks),
    ...strings(backNine.JOE_LINES), ...strings(backNine.JOE_STORY_CUES),
    ...strings(defeat.DEFEAT_LINES), ...strings(defeat.CHAPTER_DEFEAT_LINES),
    ...nightOrder.captureLines.flatMap(entry => entry.lines),
    ...strings(nightOrder.stateBarks), ...strings(nightOrder.contextBarks),
  ];
  const byId = new Map();
  for (const text of raw) {
    const spoken = spokenText(text);
    if (!/[a-z]/i.test(spoken)) continue;
    const id = voiceClipId(spoken);
    if (byId.has(id) && byId.get(id).toLowerCase() !== spoken.toLowerCase()) throw Error(`Clip name collision: "${byId.get(id)}" / "${spoken}"`);
    byId.set(id, spoken);
  }
  return byId;
}

const lines = await allLines();
const existing = () => new Set(fs.existsSync(outDir) ? fs.readdirSync(outDir).filter(f => f.endsWith('.ogg')).map(f => f.slice(0, -4)) : []);
const missing = () => { const have = existing(); return [...lines].filter(([id]) => !have.has(id)); };
const writeIndex = () => fs.writeFileSync(path.join(outDir, 'index.txt'), [...existing()].filter(id => lines.has(id)).sort().join('\n') + '\n');

if (process.argv.includes('--list')) {
  console.log(JSON.stringify({lines: lines.size, characters: [...lines.values()].reduce((a, t) => a + t.length, 0), built: lines.size - missing().length}));
  process.exit(0);
}
if (process.argv.includes('--check')) {
  const absent = missing();
  if (absent.length) { console.error(`${absent.length} lines have no clip, e.g. "${absent[0][1]}". Run: node tools/build-joe-voice.mjs`); process.exit(1); }
  console.log(`All ${lines.size} lines have clips.`);
  process.exit(0);
}

fs.mkdirSync(outDir, {recursive: true});
if (process.argv.includes('--prune')) {
  for (const id of existing()) if (!lines.has(id)) fs.rmSync(path.join(outDir, id + '.ogg'));
}
const todo = missing();
if (todo.length) {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'joe-voice-'));
  const jobs = path.join(work, 'jobs.json');
  fs.writeFileSync(jobs, JSON.stringify(todo.map(([id, text]) => ({id, text}))));
  // One PowerShell process speaks every line to a wav; ffmpeg then encodes
  // each with the Final Cut's filter chain at a speech bitrate.
  const script = `
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$jobs = Get-Content -LiteralPath '${jobs.replace(/'/g, "''")}' -Raw -Encoding UTF8 | ConvertFrom-Json
$speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
  $speaker.SelectVoice('Microsoft David Desktop'); $speaker.Rate = -1; $speaker.Volume = 100
  foreach ($job in $jobs) {
    if ($job.id -notmatch '^[0-9a-f]{8}$') { throw 'Invalid clip id' }
    $speaker.SetOutputToWaveFile((Join-Path '${work.replace(/'/g, "''")}' ($job.id + '.wav')))
    $speaker.Speak($job.text)
    $speaker.SetOutputToNull()
  }
} finally { $speaker.Dispose() }
`;
  const ps = path.join(work, 'speak.ps1');
  fs.writeFileSync(ps, '﻿' + script);
  const spoke = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', ps], {stdio: ['ignore', 'inherit', 'inherit']});
  if (spoke.status !== 0) throw Error('Speech synthesis failed');
  let done = 0;
  for (const [id] of todo) {
    const wav = path.join(work, id + '.wav');
    const encoded = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', wav, '-af', 'highpass=f=220,lowpass=f=3200,loudnorm=I=-21:TP=-3:LRA=4', '-ac', '1', '-c:a', 'libopus', '-b:a', '24k', path.join(outDir, id + '.ogg')], {stdio: ['ignore', 'inherit', 'inherit']});
    if (encoded.status !== 0) throw Error(`Encoding failed for ${id}`);
    if (++done % 100 === 0) console.log(`encoded ${done}/${todo.length}`);
  }
  fs.rmSync(work, {recursive: true, force: true});
}
writeIndex();
const bytes = [...existing()].reduce((sum, id) => sum + fs.statSync(path.join(outDir, id + '.ogg')).size, 0);
console.log(JSON.stringify({lines: lines.size, built: todo.length, megabytes: +(bytes / 1048576).toFixed(1)}));
