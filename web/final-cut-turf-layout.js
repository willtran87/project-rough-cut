import {fairwaySection,FINISH_GREEN} from './final-cut-course-contour.js';

export const TURF_RANGE={left:-24,bottom:4,width:48,depth:96};
// Existing groundskeeping condition, tied to the estate's actual places.
// Dry crowns have younger shoulders; damp strips collect at the rough edge
// and around the poorly drained nursery. None of these shapes changes height.
export const TURF_CONDITION_PATCHES=[
 {id:'west-bunker-shoulder',kind:0,x:-18,y:23,rx:3.8,ry:7.2,yaw:-.2,strength:.53},
 {id:'west-bunker-skirt',kind:0,x:-14,y:29,rx:3.0,ry:5.1,yaw:.35,strength:.32},
 {id:'middle-west-crown',kind:0,x:-16.5,y:40,rx:5.6,ry:9.0,yaw:-.28,strength:.62},
 {id:'middle-west-shoulder',kind:0,x:-9.0,y:44,rx:4.1,ry:5.8,yaw:.52,strength:.37},
 {id:'old-stand-approach',kind:0,x:-2,y:39,rx:4.4,ry:6.2,yaw:.17,strength:.42},
 {id:'bank-west',kind:0,x:-17.5,y:61,rx:4.2,ry:6.1,yaw:.3,strength:.56},
 {id:'nursery-west-shoulder',kind:0,x:-12,y:72,rx:4.7,ry:5.8,yaw:-.3,strength:.42},
 {id:'eastern-turn',kind:0,x:19,y:61,rx:3.7,ry:4.2,yaw:.4,strength:.35},
 {id:'green-east-shoulder',kind:0,x:11.5,y:88,rx:3.8,ry:5.2,yaw:-.2,strength:.51},
 {id:'road-east-shoulder',kind:0,x:18,y:91,rx:3.9,ry:4.3,yaw:.4,strength:.38},
 {id:'west-reed-drain',kind:1,x:-23.2,y:43,rx:1.5,ry:15,yaw:0,strength:.52},
 {id:'west-reed-drain-lower',kind:1,x:-23.1,y:71,rx:1.4,ry:9,yaw:0,strength:.42},
 {id:'pump-damp-skirt',kind:1,x:6,y:43.2,rx:4.6,ry:1.6,yaw:-.1,strength:.40},
 {id:'nursery-west-drain',kind:1,x:1.3,y:74,rx:1.8,ry:5.3,yaw:.08,strength:.55},
 {id:'nursery-east-drain',kind:1,x:14.8,y:74,rx:2.1,ry:5.2,yaw:-.05,strength:.53},
 {id:'pavilion-damp-skirt',kind:1,x:-17,y:91.2,rx:4.4,ry:1.4,yaw:0,strength:.35},
 // Short scuffed entrances remain inside already traversable approaches.
 {id:'bunker-footwear',kind:2,x:-4.9,y:15.4,rx:.58,ry:1.3,yaw:0,strength:.48},
 {id:'pump-footwear',kind:2,x:16.2,y:39.1,rx:1.8,ry:.66,yaw:-.12,strength:.54},
 {id:'pavilion-footwear',kind:2,x:-9.8,y:86.1,rx:1.1,ry:.82,yaw:.2,strength:.47},
];
const clamp=v=>Math.max(0,Math.min(1,v));
const smooth=v=>{const t=clamp(v);return t*t*(3-2*t);};
const patches=TURF_CONDITION_PATCHES.map(p=>({...p,c:Math.cos(p.yaw),s:Math.sin(p.yaw)}));

export function turfConditionAt(x,y){
 if(x<TURF_RANGE.left||x>TURF_RANGE.left+TURF_RANGE.width||y<TURF_RANGE.bottom||y>TURF_RANGE.bottom+TURF_RANGE.depth)return [0,0,0];
 const section=fairwaySection(y),fairway=section?smooth((section.w/2+.5-Math.abs(x-section.x))/.85):0;
 const g=FINISH_GREEN,green=smooth((1.12-Math.hypot((x-g.x)/g.rx,(y-g.y)/g.ry))/.15);
 const care=Math.max(fairway,green),values=[0,0,0];
 // Broad irregular boundaries follow the ground, never the camera or clock.
 const edge=.065*Math.sin(x*1.13+y*.71)+.04*Math.sin(x*.43-y*1.37);
 for(const p of patches){
  const dx=x-p.x,dy=y-p.y,u=(dx*p.c-dy*p.s)/p.rx,v=(dx*p.s+dy*p.c)/p.ry;
  const d=Math.hypot(u,v)+edge;
  const w=smooth((1-d)/.6)*p.strength;
  values[p.kind]=Math.max(values[p.kind],w*(1-(p.kind===2?green*.9:care*.78)));
 }
 return values;
}
