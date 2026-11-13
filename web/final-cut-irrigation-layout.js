import {actorGroundHeight,GROUND_SLABS} from './final-cut-ground-layout.js';

const maxGroundHeight=Math.max(0,...GROUND_SLABS.map(s=>s.top));

export const GRANDSTAND={rows:5,seats:33,x:47,y:33,rowSpacing:1.5,seatSpacing:1,baseHeight:.35,stepHeight:.65,seatHeight:.5,seatThickness:.12,seatWidth:.7,seatDepth:.75,seatBevel:.07,centerY:49,stepDepth:35,aisles:[42.5,56.5],aisleWidth:2.2,roof:{x:52,y:49,width:12,depth:40,height:5.25,thickness:.3,slope:.125}};
export const standHasSeat=index=>index>=0&&index<GRANDSTAND.seats&&!GRANDSTAND.aisles.some(y=>Math.abs(GRANDSTAND.y+index*GRANDSTAND.seatSpacing-y)<GRANDSTAND.aisleWidth/2);
export function standSeat(row,index){const s=GRANDSTAND;return {x:s.x+row*s.rowSpacing,y:s.y+index*s.seatSpacing,height:s.baseHeight+row*s.stepHeight+s.seatHeight+s.seatThickness/2};}
export const burstSeat=index=>standSeat(index*2,32-index*2);
export const standRoofHeight=x=>GRANDSTAND.roof.height+(x-GRANDSTAND.roof.x)*GRANDSTAND.roof.slope;
export const standRoofUnderside=x=>standRoofHeight(x)-GRANDSTAND.roof.thickness/2*Math.sqrt(1+GRANDSTAND.roof.slope**2);
export const STAND_COLUMNS=[31.5,49,66.5].flatMap(y=>[45.85,56.5].map(x=>({x,y})));
export function standSteps(){
 const s=GRANDSTAND,steps=[];
 for(const y of s.aisles)for(let row=0;row<s.rows;row++)for(let n=0;n<3;n++){
  const previous=row?s.baseHeight+(row-1)*s.stepHeight:0,top=s.baseHeight+row*s.stepHeight;
  steps.push({x:s.x+(row-.5)*s.rowSpacing+(n+.5)*s.rowSpacing/3,y,w:s.rowSpacing/3,d:s.aisleWidth,height:previous+(top-previous)*(n+1)/3});
 }
 return steps;
}
const steps=standSteps();
export function standSurfaceHeight(x,y){
 const s=GRANDSTAND,row=Math.floor((x-(s.x-s.rowSpacing/2))/s.rowSpacing);
 if(row<0||row>=s.rows||Math.abs(y-s.centerY)>s.stepDepth/2)return actorGroundHeight(x,y);
 const tread=steps.find(p=>Math.abs(x-p.x)<p.w/2+1e-8&&Math.abs(y-p.y)<p.d/2);
 if(tread)return tread.height;
 const index=Math.round((y-s.y)/s.seatSpacing),seat=standSeat(row,index),dx=x-seat.x,dz=Math.abs(y-seat.y),base=s.baseHeight+row*s.stepHeight;
 if(!standHasSeat(index))return base;
 const onPan=Math.abs(dx)<=s.seatWidth/2&&dz<=s.seatDepth/2&&Math.max(0,Math.abs(dx)-(s.seatWidth/2-s.seatBevel))+Math.max(0,dz-(s.seatDepth/2-s.seatBevel))<=s.seatBevel;
 // The tilted, chamfered back has a higher first wet surface than the pan.
 const backTop=Math.min(.65-Math.max(0,dz-(s.seatDepth/2-.08)),(dx-.27)/.15);
 const onBack=dz<=s.seatDepth/2&&backTop>=Math.max(0,(dx-.37)/.15)&&backTop>=Math.max(0,dz-(s.seatDepth/2-.08));
 return onBack?seat.height+backTop:onPan?seat.height:base;
}
export function standImpactHeight(x,y){
 let height=standSurfaceHeight(x,y);
 for(const p of STAND_COLUMNS){
  if(Math.abs(x-p.x)<=.225&&Math.abs(y-p.y)<=.225)height=Math.max(height,.2);
  if(Math.hypot(x-p.x,y-p.y)<=.1)height=Math.max(height,standRoofHeight(p.x)-.2);
 }
 return height;
}
// Water can pass underneath a seat pan. A top-height field alone would stop
// falling pressure at empty air between the pedestal and the chair above it.
export function standContainsPoint(x,y,height){
 if(height<=maxGroundHeight&&height<=actorGroundHeight(x,y))return true;
 for(const p of STAND_COLUMNS){
  if(height<=.2&&Math.abs(x-p.x)<=.225&&Math.abs(y-p.y)<=.225)return true;
  if(height<=standRoofHeight(p.x)-.2&&Math.hypot(x-p.x,y-p.y)<=.1)return true;
 }
 const s=GRANDSTAND,row=Math.floor((x-(s.x-s.rowSpacing/2))/s.rowSpacing);
 if(row<0||row>=s.rows||Math.abs(y-s.centerY)>s.stepDepth/2)return false;
 const tread=steps.find(p=>Math.abs(x-p.x)<p.w/2+1e-8&&Math.abs(y-p.y)<p.d/2);
 if(tread)return height<=tread.height;
 const base=s.baseHeight+row*s.stepHeight;if(height<=base)return true;
 const index=Math.round((y-s.y)/s.seatSpacing);if(!standHasSeat(index))return false;
 const seat=standSeat(row,index),dx=x-seat.x,dz=Math.abs(y-seat.y),h=height-base;
 if(h<=.07&&Math.abs(dx-.1)<=.25&&dz<=.25)return true;
 if(h<=.44&&Math.abs(dx-.15)<=.045&&dz<=.06)return true;
 if(height>=seat.height-s.seatThickness&&height<=seat.height&&Math.abs(dx)<=s.seatWidth/2&&dz<=s.seatDepth/2&&Math.max(0,Math.abs(dx)-(s.seatWidth/2-s.seatBevel))+Math.max(0,dz-(s.seatDepth/2-s.seatBevel))<=s.seatBevel)return true;
 const backHeight=height-seat.height;
 return backHeight>=0&&backHeight<=.65&&dx>=.27+.15*backHeight&&dx<=.37+.15*backHeight&&dz<=s.seatDepth/2&&Math.max(0,dz-(s.seatDepth/2-.08))<=Math.min(backHeight,.65-backHeight);
}
// Three authored fan trajectories enter below the real grandstand awning.
// As pressure falls they hit the first chair, pier, step or ground surface.
// Cache the bounded contact search once per jet/pressure, not per droplet.
const contacts=[];
function rawBurst(index,t,pressure,endHeight,target){
 const seat=burstSeat(index),reach=(seat.x-17)*pressure,lift=[6.5,3,1.8][index]*pressure;
 const x=17+t*reach,y=.65+4*t*(1-t)*lift+t*(endHeight-.65),z=-74+t*(74-seat.y)*pressure;
 return target.set(x,y,z);
}
export function burstContact(index,pressure){
 if(contacts[index]?.pressure===pressure)return contacts[index].t;
 const seat=burstSeat(index),endHeight=standSurfaceHeight(17+(seat.x-17)*pressure,74-(74-seat.y)*pressure);
 const point={set(x,y,z){this.x=x;this.y=y;this.z=z;return this;}};
 const hits=t=>{rawBurst(index,t,pressure,endHeight,point);return standContainsPoint(point.x,-point.z,point.y);};
 let t=1;
 // Narrow chair backs can span less than 1/256 of the longer service-road
 // jet. Keep contact sampling below 1 cm along its horizontal trajectory.
 const samples=Math.ceil(Math.hypot((seat.x-17)*pressure,(74-seat.y)*pressure)/.01);
 for(let i=1;i<=samples;i++)if(hits(i/samples)){
  let lo=(i-1)/samples,hi=i/samples;
  for(let k=0;k<25;k++){const mid=(lo+hi)/2;if(hits(mid))hi=mid;else lo=mid;}
  t=lo;break;
 }
 contacts[index]={pressure,t,endHeight};return t;
}
export function burstPoint(index,t,pressure,target){const contact=burstContact(index,pressure);return rawBurst(index,t*contact,pressure,contacts[index].endHeight,target);}
