import assert from 'node:assert/strict';
import {courseRenderSize,portraitTouchControls} from '../web/course-viewport.js';
for(const scale of [.5,.625,.75,1]){
 assert.deepEqual(courseRenderSize(16/9,scale),{width:1280*scale,height:720*scale});
 for(const aspect of [320/568,390/844,768/1024]){
  const s=courseRenderSize(aspect,scale),budget=1280*720*scale*scale;
  assert(Math.abs(s.width*s.height-budget)<s.width+s.height);
  assert(Math.abs(s.width/s.height-aspect)<.003);
 }
}
for(const [width,height]of [[310,558],[380,834],[750,1000]]){
 const controls=portraitTouchControls(width,height),circles=[];
 for(const [id,c]of Object.entries(controls)){
  if(!c.radius)continue;
  const x=c.x*width/1280,y=c.y*height/720,rx=c.radius*width/1280,ry=c.radiusY*height/720;
  assert(Math.abs(rx-ry)<1e-9);assert(rx>=24);assert(x-rx>=0&&x+rx<=width&&y-ry>=0&&y+ry<=height);
  circles.push({id,x,y,r:rx});
 }
 for(let i=0;i<circles.length;i++)for(let j=i+1;j<circles.length;j++){
  const a=circles[i],b=circles[j];assert(Math.hypot(a.x-b.x,a.y-b.y)>=a.r+b.r,`${a.id}/${b.id}`);
 }
}
console.log(JSON.stringify({passed:true,checks:['Landscape resolution preserved at all quality tiers','Portrait aspect preserves pixel budget within rounding','Portrait physical touch circles remain inside the viewport and do not overlap']}));
