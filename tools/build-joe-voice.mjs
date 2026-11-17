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
  // Grouped, most clearly heard first. A line that appears in two groups
  // belongs to the earlier one. The order only matters to --elevenlabs, which
  // revoices whole groups in turn so a group is never left in two voices.
  const groups = {
    defeat: strings(defeat.DEFEAT_LINES),
    chapterDefeat: strings(defeat.CHAPTER_DEFEAT_LINES),
    backNineStory: strings(backNine.JOE_STORY_CUES),
    baseCapture: base.capture.flatMap(entry => entry.lines),
    backNineLines: strings(backNine.JOE_LINES),
    nightCapture: nightOrder.captureLines.flatMap(entry => entry.lines),
    baseBarks: strings(base.barks),
    stateBarks: strings(nightOrder.stateBarks),
    contextBarks: strings(nightOrder.contextBarks),
  };
  const byId = new Map(), groupOf = new Map();
  for (const [group, raw] of Object.entries(groups)) for (const text of raw) {
    const spoken = spokenText(text);
    if (!/[a-z]/i.test(spoken)) continue;
    const id = voiceClipId(spoken);
    if (byId.has(id) && byId.get(id).toLowerCase() !== spoken.toLowerCase()) throw Error(`Clip name collision: "${byId.get(id)}" / "${spoken}"`);
    if (!byId.has(id)) { byId.set(id, spoken); groupOf.set(id, group); }
  }
  return {byId, groupOf, groupNames: Object.keys(groups)};
}

const {byId: lines, groupOf, groupNames} = await allLines();

// Revoices existing clips with ElevenLabs: a built-in voice, whispered (v3
// audio tags), then slowed and lowered about 2.4 semitones before the usual
// speech encode. The low-pass sits higher than the synthesiser chain's so the
// breath of the whisper survives. Which clips are already in this voice is
// recorded in assets/audio/joe-voice/elevenlabs.txt; a line whose text changes
// gets a new clip name and so falls out of that record by itself.
// A group is only started if its estimated cost fits what is left of --budget.
//
//   ELEVENLABS_API_KEY=... node tools/build-joe-voice.mjs --elevenlabs --budget 8000 [--groups defeat,chapterDefeat]
//   ELEVENLABS_API_KEY=... node tools/build-joe-voice.mjs --elevenlabs --final-cut
const JOE_VOICE = 'onwK4e9ZLuTAKqWW03F9'; // ElevenLabs built-in "Daniel"
/** One whispered take of `text`, processed and encoded to `clip`. */
async function whisper(key, voice, text, clip, bitrate) {
  let response;
  for (let attempt = 0; ; attempt++) {
    response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, {method: 'POST', headers: {'xi-api-key': key, 'content-type': 'application/json'}, body: JSON.stringify({text: '[whispers] [slowly] ' + text, model_id: 'eleven_v3', voice_settings: {stability: .5}})});
    if (response.status !== 429 || attempt >= 4) break;
    await new Promise(resolve => setTimeout(resolve, 4000 * (attempt + 1)));
  }
  if (!response.ok) throw Error(`ElevenLabs refused "${text}" (${response.status}): ${(await response.text()).slice(0, 300)}`);
  const charged = Number(response.headers.get('character-cost')) || 8 + text.length;
  const source = clip + '.mp3';
  fs.writeFileSync(source, Buffer.from(await response.arrayBuffer()));
  const encoded = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', source, '-af', 'asetrate=44100*0.87,aresample=48000,highpass=f=220,lowpass=f=6000,loudnorm=I=-21:TP=-3:LRA=4', '-ac', '1', '-c:a', 'libopus', '-b:a', bitrate, clip], {stdio: ['ignore', 'inherit', 'inherit']});
  fs.rmSync(source);
  if (encoded.status !== 0) throw Error(`Encoding failed for "${text}"`);
  const seconds = Number(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', clip]).stdout.toString());
  return {charged, seconds};
}
// The Final Cut's five scripted lines live apart from the rest: the level
// reads each clip's length from web/final-cut-dialogue-lines.js, so that file
// is rewritten here in the form tools/build-final-cut-joe.ps1 gives it.
async function revoiceFinalCut(key, voice) {
  const script = JSON.parse(fs.readFileSync(path.join(repo, 'assets', 'audio', 'final-cut-joe', 'script.json'), 'utf8'));
  const manifest = [];
  let spent = 0;
  for (const line of script) {
    if (!/^[a-z-]+$/.test(line.id)) throw Error('Invalid dialogue file ID');
    const take = await whisper(key, voice, line.text, path.join(web, 'assets', 'audio', 'final-cut-joe', line.id + '.ogg'), '48k');
    spent += take.charged;
    manifest.push({...line, duration: +take.seconds.toFixed(3), url: `./assets/audio/final-cut-joe/${line.id}.ogg`});
  }
  fs.writeFileSync(path.join(web, 'final-cut-dialogue-lines.js'), '// Generated by tools/build-final-cut-joe.ps1 from the authored script.\n// Revoiced by tools/build-joe-voice.mjs --elevenlabs --final-cut.\nexport const JOE_LINES = ' + JSON.stringify(manifest).replace(/'/g, '\\u0027') + ';\n');
  console.log(JSON.stringify({finalCut: manifest.map(line => [line.id, line.duration]), credits: spent}));
}
async function revoice() {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw Error('Set ELEVENLABS_API_KEY');
  const arg = (name, fallback) => { const i = process.argv.indexOf(name); return i < 0 ? fallback : process.argv[i + 1]; };
  const voice = arg('--voice', JOE_VOICE);
  if (process.argv.includes('--final-cut')) return revoiceFinalCut(key, voice);
  const budget = Number(arg('--budget', 'Infinity'));
  let spent = 0;
  const wanted = (arg('--groups', '') || groupNames.join(',')).split(',');
  const record = path.join(repo, 'assets', 'audio', 'joe-voice', 'elevenlabs.txt');
  fs.mkdirSync(path.dirname(record), {recursive: true});
  const done = new Set(fs.existsSync(record) ? fs.readFileSync(record, 'utf8').split(/\s+/).filter(Boolean) : []);
  const save = () => fs.writeFileSync(record, [...done].filter(id => lines.has(id)).sort().join('\n') + '\n');
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'joe-voice-'));
  const odd = [];
  try {
    for (const group of wanted) {
      const todo = [...lines].filter(([id]) => groupOf.get(id) === group && !done.has(id));
      if (!todo.length) { console.log(`${group}: already revoiced`); continue; }
      // Measured: the direction tags are charged at about eight credits a line.
      const estimate = todo.reduce((sum, [, text]) => sum + 8 + text.length, 0);
      if (estimate > budget - spent) { console.log(`${group}: skipped, needs about ${estimate} credits and ${Math.floor(budget - spent)} remain`); continue; }
      let cost = 0;
      for (const [id, text] of todo) {
        const clip = path.join(work, id + '.ogg');
        let take;
        try { take = await whisper(key, voice, text, clip, '24k'); } catch (error) { save(); throw error; }
        cost += take.charged; spent += take.charged;
        // A take that runs far longer than its text usually has the direction
        // read aloud or a stray noise in it: listed for a listen, not rejected.
        if (!(take.seconds > .4) || take.seconds > 4 + text.length * .16) odd.push(`${id} ${take.seconds.toFixed(1)}s "${text}"`);
        fs.copyFileSync(clip, path.join(outDir, id + '.ogg'));
        done.add(id);
      }
      save();
      console.log(`${group}: ${todo.length} lines, ${cost} credits`);
    }
  } finally { fs.rmSync(work, {recursive: true, force: true}); }
  writeIndex();
  if (odd.length) console.log('Worth a listen:\n' + odd.join('\n'));
  console.log(JSON.stringify({revoiced: done.size, of: lines.size, credits: spent}));
}
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
if (process.argv.includes('--elevenlabs')) { await revoice(); process.exit(0); }
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
