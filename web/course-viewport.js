// Rendering and touch share the CSS viewport, while simulation coordinates stay
// fixed. A portrait circle therefore has different logical x/y radii.
export function courseRenderSize(aspect,scale,display=null){
 aspect=Number.isFinite(aspect)&&aspect>0?aspect:16/9;
 scale=Number.isFinite(scale)?Math.max(.25,Math.min(1,scale)):1;
 if(display&&display.width>0&&display.height>0){
  // Hardware renders the actual display footprint. Source texture pixels stay
  // authored; a low-resolution full-screen raster is not the pixel-art style.
  const ratio=Math.max(1,Math.min(3,display.pixelRatio||1));
  let h=Math.min(display.height,display.width/aspect)*ratio,w=h*aspect;
  const maxDimension=Math.min(2560,display.maxDimension||2560),maxPixels=2560*1440;
  const fit=Math.min(1,maxDimension/w,maxDimension/h,Math.sqrt(maxPixels/(w*h)));
  return {width:Math.max(1,Math.round(w*fit*scale)),height:Math.max(1,Math.round(h*fit*scale))};
 }
 // Keep the explicit software/copy-renderer budget and old two-argument API.
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
