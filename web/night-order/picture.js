// Night Order picture polish: maps the shared graphics-quality preset onto the
// scene's own knobs and owns the shared screen finish (bloom, grade, vignette,
// grain). scene-3d.js calls preset/knobs() while building a frame and finish()
// once the frame is on screen. Nothing here reads or changes the round.
import {createScreenFinish,LOOKS} from '../screen-finish.js?v=20261122-fixes';
import {createGraphicsQuality} from '../graphics-quality.js';

const BASE_FAR=78,FOG_NEAR=24,FOG_FAR=70;
// ?finish=off|low|high pins the finish level for comparisons and checks.
const FORCED=(()=>{try{const v=new URLSearchParams(location.search).get('finish');return ['off','low','high'].includes(v)?v:null;}catch{return null;}})();
export function createNightPicture(THREE,{now=()=>performance.now()}={}){
 let finish=null,finishRenderer=null,software=false,lastPresented=0,changes=0,grain=true,tension=0;
 const quality=createGraphicsQuality({onChange:()=>{changes++;}});
 const mood={tension:0,pulse:0,flash:0,flashColor:0xfff0d8,fade:1};
 const api={
  quality,
  get preset(){return quality.preset;},
  get changes(){return changes;},
  setSoftware(value){software=!!value;},
  // Draw distance and fog shrink together so the far plane is never visible.
  far(){return BASE_FAR*quality.preset.viewScale;},
  fog(fog){if(!fog||software)return;const s=quality.preset.viewScale;fog.near=FOG_NEAR*s;fog.far=FOG_FAR*s;},
  // frame.polish comes from game.js (night-order/feel.js); absent in menus.
  // gameplay: a moving, unpaused play frame, which is what Auto measures.
  // Create the finish (which compiles its passes) while the course loads,
  // so the first gameplay frame does not compile shaders.
  prepare(renderer){
   const level=software?'off':FORCED||quality.preset.finish;
   if(level==='off'||!renderer||(finish&&finishRenderer===renderer))return;
   finish?.dispose();finish=createScreenFinish(THREE,renderer,{look:LOOKS.nightOrder,level});finishRenderer=renderer;
  },
  finish(renderer,frame,{gameplay=false}={}){
   const t=now();
   if(gameplay&&lastPresented)quality.frame(t-lastPresented);
   lastPresented=gameplay?t:0;
   const level=software?'off':FORCED||quality.preset.finish;
   if(level==='off')return false;
   if(!finish||finishRenderer!==renderer){finish?.dispose();finish=createScreenFinish(THREE,renderer,{look:LOOKS.nightOrder,level});finishRenderer=renderer;}
   const p=frame?.polish||null;
   // Ease tension so the vignette never steps between frames.
   tension+=((p?.tension||0)-tension)*.08;
   mood.tension=tension;mood.pulse=p?.pulse||0;mood.flash=p?.flash||0;
   const film=p?p.grain!==false:grain;grain=film;
   finish.setLevel(level);finish.setReduced(!!frame?.reducedMotion);
   finish.setLook({grain:film?LOOKS.nightOrder.grain:0});
   finish.setTension(mood.tension);finish.setPulse(mood.pulse);finish.setFlash(mood.flash,p?.flashColor??mood.flashColor);
   return finish.apply(t/1000);
  },
  stats(){return {choice:quality.choice,level:quality.level,autoSteps:quality.autoSteps,finish:software?'off':FORCED||quality.preset.finish,applied:finish?.applied||0,grain,tension:+tension.toFixed(3),pulse:mood.pulse,flash:mood.flash,viewScale:quality.preset.viewScale,shadows:quality.preset.shadows,effects:quality.preset.effects,resolution:quality.preset.resolution};},
 };
 return api;
}
