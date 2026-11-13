// Presentation policy only: never changes pursuit, event timers or audio cues.
const sensory=/^(?:STATUS: (?:ROUTINE|VERIFYING|FOLLOW-UP)|PATROL CHANGE|ROUTE CHANGED|MOWER (?:COUGHS|SILENT|IN SAND|BOGGED|CHANGES|ECHOES|CHURNS|REVS|PASSES|CUT MISSES)|ENGINE RESTART|THE (?:ENGINE|MOWER|DISTANT MOWER|ROUGH BOWS|CROSSWIND FALLS)|NO ENGINE\.|CROSSWIND BUILDING|WIND RUSHES|PAPERWORK SNAPS|SUPPLY LOCKER CLACKS|METAL KEY RINGS|CART TIMER RINGS|FLOODLIGHT RELAY CLICKS|POWER SAG|Joe is (?:changing|walking) |JOE HIT (?:SOAKED|BUNKER)|JOE (?:VERIFIES AN EMPTY|LOSES THE TRAIL)|COVER-TO-COVER|CLOSE CALL|ATTENTION LOST|LINE OF SIGHT BROKEN)/i;
const atmosphere=/^(?:(?:SOUTH GATE|AUDIT HEDGE|WATER HAZARD|CLUBHOUSE|SERVICE MAZE|DEAD GREEN|NIGHT RANGE|RELEASE CORRIDOR) \/\/|A (?:HOLLOW BREATH|SPECTRAL SHRIEK|SCRAPE|THIN HUM|WARPED CHIME|SECOND BELL|PAGE TURNS)|THE APPARITION|OLD TIMBERS CREAK|THE STAMP REPEATS|THE RELEASE DESK (?:CLICKS|CLACKS)|CROSSWIND BUILDS|CLEAN BREAK)/i;
export function descriptiveMessage(text=''){return sensory.test(text)||atmosphere.test(text);}
export function levelOneMessage(text='',soundCaptions=false){return !soundCaptions&&descriptiveMessage(text)?'':text;}

// A single readable gameplay message. Chapters supply truthful candidates;
// presentation chooses priority without changing any underlying event.
export function selectGameplayMessage(candidates){
 let selected=null;
 for(const candidate of candidates)if(candidate?.text&&(!selected||candidate.priority>selected.priority))selected=candidate;
 return selected;
}

// A common budget across zone dialogue and event reactions. Simulation time
// freezes in pause; urgent messages cancel a line instead of resuming it later.
export function createChatterGate({cooldown=35,duration=3.5,initialQuiet=12}={}){
 const states=new WeakMap();
 return (run,text,{blocked=false,enabled=true,canStart=true}={})=>{
  let s=states.get(run);if(!s){s={next:initialQuiet,active:null,seen:new Set()};states.set(run,s);}
  if(!enabled||blocked||!['driving','sealing'].includes(run.mode)){s.active=null;return '';}
  // Lazy candidates are selected only when there is a real display slot.
  // Selecting a shuffled reaction earlier would consume an unheard line and
  // start its private cooldown while the common dialogue budget is closed.
  const lazy=typeof text==='function';
  if(s.active&&(run.time>=s.active.until||!lazy&&text!==s.active.text))s.active=null;
  // Admission can be stricter than interruption: uncertain sight should not
  // start a new line, but does not alone erase one already being read.
  if(!s.active&&canStart&&run.time>=s.next){
   const candidate=lazy?text():text;
   if(candidate&&!s.seen.has(candidate)){
    const seconds=typeof duration==='function'?duration(candidate):duration;
    s.active={text:candidate,until:run.time+seconds};s.seen.add(candidate);s.next=run.time+cooldown;
   }
  }
  return s.active?.text||'';
 };
}
