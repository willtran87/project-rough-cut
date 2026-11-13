import {observeJoe,audibleSource} from './under-green-senses.js';
import {CROSSINGS} from './under-green-encounters.js';
import {recordLocal} from './local-telemetry.js';
import {WATERS,waterState,distance} from './under-green-course.js';
import {createCrossingObserver} from './under-green-crossing-observer.js';
const observeCrossings=createCrossingObserver(CROSSINGS,WATERS);
export function observeEncounter(r,dt){
 const j=r.joe,gap=distance(r.player,j),previous=j.previousGap??gap;
 j.closingRate=(j.closingRate||0)*Math.exp(-dt*4)+(previous-gap)/Math.max(dt,.001)*(1-Math.exp(-dt*4));j.previousGap=gap;
 if(!r.telemetry?.enabled)return;
 const t=r.telemetry;t.crossings??={};
 const active=!r.finished&&!['absent','enter','blocked'].includes(j.phase);
 if(active){t.metrics.minimumGap=Math.min(t.metrics.minimumGap??Infinity,gap);t.metrics.closeSeconds=(t.metrics.closeSeconds||0)+(gap<10?dt:0);}
 if(r.mode==='playing'&&!r.player.recovery&&r.player.speed<.15)t.metrics.stationarySeconds=(t.metrics.stationarySeconds||0)+dt;
 if(j.phase!==t.lastPhase){recordLocal(t,'joe-phase',r.time,{phase:j.phase,gap,attackSerial:j.attackSerial,blocked:!!j.recoveryBlocked});if(['windup','sweep','recover'].includes(j.phase))t.metrics[j.phase+'Entries']=(t.metrics[j.phase+'Entries']||0)+1;t.lastPhase=j.phase;}
 if(r.waterHits!==(t.lastHits??0)){recordLocal(t,'water-hit',r.time,{count:r.waterHits,gap});t.lastHits=r.waterHits;}
 observeCrossings(r,gap,dt);
 t.samples=(t.samples||0)+1;
}
// Describe only the lateral information already carried by the stereo mixer.
// A centred source could be ahead or behind; do not infer either from hidden
// world coordinates. The broad centre band avoids overstating weak panning.
export function heardSide(observed){
 if(!observed.audible||!Number.isFinite(observed.pan)||Math.abs(observed.pan)<.4)return '';
 return observed.pan<0?'to your left':'to your right';
}
export function pursuitCaption(r,rearLabel,observed=observeJoe(r)){
 const j=r.joe,gap=distance(j,r.player);
 if(['absent','blocked'].includes(j.phase)||gap>28)return '';
 if(!observed.visible){
  if(!observed.audible)return '';
  if(observed.door)return 'A MAINTENANCE DOOR RATTLES NEARBY';
  const side=heardSide(observed),direction=side?' '+side.toUpperCase():'';
  if(observed.rev)return `A SCYTHE SWISHES NEARBY${direction} · KEEP ROOM TO MOVE`;
  // Stereo conveys a side, not front/back. A rear-view instruction for a
  // lateral source sends the player away from the useful audible bearing.
  const look=side?'LOOK TOWARD THE SOUND':`${rearLabel} TO GLANCE BACK`;
  return `HEAVY BREATHING IS AUDIBLE${direction} · ${look}`;
 }
 if(j.phase==='enter')return '';
 if(j.phase==='windup')return 'JOE RAISES THE SCYTHE · STEP CLEAR OF HIS SWEEP';
 if(j.phase==='sweep')return 'THE BLADE IS SWEEPING · KEEP MOVING';
 if(j.phase==='recover')return 'MOVE WHILE JOE RECOVERS';
 if(j.phase==='water-wait'||j.phase==='water-recovery')return 'THE WATER IS HOLDING JOE BACK';
 if(j.phase==='search')return j.evidence==='inspection'?'JOE IS CHECKING THE PASSAGE':'JOE IS SEARCHING THE AREA';
 if(j.phase==='guard')return 'JOE IS WATCHING FOR AN OPENING';
 if(gap<8)return 'JOE IS CLOSE · KEEP AN ESCAPE ROUTE OPEN';
 if(j.closingRate>.3&&j.speed>.2)return '';
 if(j.closingRate<-.3)return 'YOU ARE PULLING AWAY FROM JOE';
 return `JOE IS NEARBY · ${rearLabel} TO GLANCE BACK`;
}

export function urgentThreatCaption(r,observed=observeJoe(r)){
 if(!observed.imminent)return '';
 if(!observed.visible){const side=heardSide(observed);return `A scythe swishes close by${side?', '+side:''}. Move sideways.`;}
 return r.joe.phase==='windup'?'Joe raises the scythe. Move sideways.':'The blade is sweeping. Keep moving.';
}

export function soundDescription(r,observed=observeJoe(r)){
 if(!['playing','aftermath'].includes(r.mode))return '';
 const warning=WATERS.some(w=>waterState(w,r.time,r.bypass,r.bypassAt).phase==='warning'&&audibleSource(r,w,{range:19,sourceHeight:.8}).gain>.15);
 if(warning)return '[Irrigation pipes knock before the surge]';
 if(!observed.audible)return '';
 if(observed.door)return '[Service door rattles nearby]';
 if(r.joe.phase==='enter')return '[Heavy breathing behind the door]';
 const side=heardSide(observed),direction=side?' '+side:'';
 return observed.rev?`[Scythe swishes nearby${direction}]`:`[Heavy breathing nearby${direction}]`;
}
