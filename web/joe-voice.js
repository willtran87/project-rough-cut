// Joe's spoken lines outside the Final Cut. Every clip is the recorded form of
// a line the game already shows as text, looked up by that text, so captions
// and voice cannot drift apart: a line with no clip is simply silent.
//
// Clips are built by tools/build-joe-voice.mjs from the dialogue modules and
// fetched one at a time when a line is spoken; nothing is loaded up front.

/** Text as spoken: no speaker label, quotation marks or extra spacing. */
export function spokenText(text){
 return String(text??'').replace(/^\s*JOE\s*:\s*/i,'').replace(/[“”"]/g,'').replace(/[‘’]/g,"'").replace(/\s+/g,' ').trim();
}
/** Stable clip name for a line (FNV-1a over its spoken text). */
export function voiceClipId(text){
 const spoken=spokenText(text).toLowerCase();let hash=0x811c9dc5;
 for(let i=0;i<spoken.length;i++){hash^=spoken.charCodeAt(i);hash=Math.imul(hash,0x01000193);}
 return (hash>>>0).toString(16).padStart(8,'0');
}
const BASE=new URL('./assets/audio/joe-voice/',import.meta.url);
let available=null;
function clipIndex(){
 // One small text file lists the clips that exist, so a line without a
 // recording never causes a failed request.
 return available??=fetch(new URL('index.txt',BASE)).then(response=>response.ok?response.text():'').then(text=>new Set(text.split(/\s+/).filter(Boolean))).catch(()=>new Set());
}
/**
 * One voice at a time. say() replaces whatever Joe was saying; an array is
 * spoken in order. muted() is read when each clip starts and while it plays.
 */
export function createJoeVoice({muted=()=>false,volume=.9}={}){
 let audio=null,queue=[],token=0,spoken=0,skipped=0,last=null;
 function stop(){token++;queue=[];if(audio){audio.onended=audio.onerror=null;audio.pause();audio=null;}}
 async function next(mine){
  while(mine===token&&queue.length){
   const text=queue.shift(),id=voiceClipId(text),index=await clipIndex();
   if(mine!==token)return;
   if(!index.has(id)||muted()){skipped++;continue;}
   const clip=new Audio(new URL(id+'.ogg',BASE).href);clip.volume=volume;audio=clip;last=spokenText(text);
   await new Promise(resolve=>{clip.onended=clip.onerror=resolve;clip.play().then(()=>{spoken++;},resolve);});
   if(audio===clip)audio=null;
  }
 }
 return {
  say(lines){const list=(Array.isArray(lines)?lines:[lines]).filter(line=>spokenText(line));stop();if(!list.length)return;queue=list;next(token);},
  stop,
  /** Call when the mute setting changes or play is paused. */
  refresh(){if(audio&&muted()){stop();}},
  stats:()=>({spoken,skipped,speaking:!!audio,last}),
 };
}
