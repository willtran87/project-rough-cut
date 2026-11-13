// Rendering and touch share the CSS viewport, while simulation coordinates stay
// fixed. A portrait circle therefore has different logical x/y radii.
export function courseRenderSize(aspect,scale){
 const area=1280*720*scale*scale;
 return {width:Math.max(1,Math.round(Math.sqrt(area*aspect))),height:Math.max(1,Math.round(Math.sqrt(area/aspect)))};
}
export function portraitTouchControls(width,height){
 const sx=1280/width,sy=720/height;
 const circle=(x,y,r)=>({x:x*sx,y:y*sy,radius:r*sx,radiusY:r*sy});
 const row=height-48,upper=height-126;
 return {
  move:circle(70,height-134,54),
  lookBack:circle(36,row,24),
  focus:circle(98,row,24),
  interact:circle(width-100,upper,27),
  aim:circle(width-36,upper,27),
  crouch:circle(width-100,row,25),
  sprint:circle(width-36,row,25),
  pause:{x:(width-78)*sx,y:80*sy,width:64*sx,height:44*sy},
 };
}
