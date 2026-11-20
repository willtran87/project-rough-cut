// Night Order photo mode: a free camera around the paused player, on top of the
// shared photo-mode.js bar (look, zoom, move, save). Only available while the
// round is paused, so nothing in the round advances; the camera is a view
// override passed to the scene and never touches the player.
import {createPhotoMode} from '../photo-mode.js';

const REACH=9,MIN_EYE=.35,MAX_EYE=7,SPEED=4;// metres
export function createNightPhoto({canvas,shell,render=()=>{},origin,metres,canOpen=()=>true}){
 let view=null,home=null,mode=null;
 const redraw=()=>{try{render();}catch{}};
 function build(){
  if(mode)return mode;
  mode=createPhotoMode({canvas,shell,name:'rough-cut-night-order',renderNow:redraw,
   onEnter(){const o=origin();home={x:o.x,y:o.y};view={x:o.x,y:o.y,yaw:o.yaw,pitch:o.pitch,fov:o.fov,eye:o.eye};redraw();},
   onExit(){view=home=null;redraw();document.querySelector('[data-pause-action][data-selected="true"]')?.focus({preventScroll:true});},
   onLook(dx,dy){if(!view)return;view.yaw+=dx*.0035;view.pitch=Math.max(-1.2,Math.min(1.2,view.pitch-dy*.0035));redraw();},
   onZoom(direction){if(!view)return;view.fov=Math.max(24,Math.min(90,view.fov+direction*4));redraw();},
   onMove(x,y,dt){
    if(!view)return;
    // Fly along the view: forward follows pitch, strafe stays level. Course
    // units differ per axis, so move in metres and convert back.
    const m=metres(),step=SPEED*dt,sin=Math.sin(view.yaw),cos=Math.cos(view.yaw),level=Math.cos(view.pitch);
    let mx=(view.x-home.x)*m.x+(sin*level*y+cos*x)*step,my=(view.y-home.y)*m.y+(cos*level*y-sin*x)*step;
    const far=Math.hypot(mx,my);if(far>REACH){mx*=REACH/far;my*=REACH/far;}
    view.x=home.x+mx/m.x;view.y=home.y+my/m.y;view.eye=Math.max(MIN_EYE,Math.min(MAX_EYE,view.eye+Math.sin(view.pitch)*y*step));redraw();
   }});
  return mode;
 }
 return {
  get active(){return !!mode?.active;},
  get saved(){return mode?.saved||0;},
  open(){if(mode?.active||!canOpen())return false;return build().enter();},
  close(){return !!mode?.exit();},
  toggle(){return mode?.active?mode.exit():this.open();},
  save(){mode?.save();},
  // The view override for this frame, or null. Leaving pause closes photo mode.
  view(){if(!mode?.active)return null;if(!canOpen()){mode.exit();return null;}return view;},
 };
}
