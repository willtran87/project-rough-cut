import {FLOORS,GATE_ROOF_SLOT} from './under-green-layout.js';
import {covered,waterPoint,GATE} from './under-green-course.js';

// Mount from the real floor union. A bank may widen into a dry detour, so the
// water bed's edge is not necessarily a wall or a safe place for a solid post.
export function bankSignalMount(w,end){
 // The keeper's far-bank signal hangs on the room side of the hoist, clear
 // of the lifting panel and its roof pocket. This keeps it far enough from
 // the approach bank to read while crouched at the narrowest supported FOV.
 const gateHousing=w.id==='sluice'&&end===1;
 const z=gateHousing?w.y-GATE.y+.6:end*Math.max(w.depth/2+1,2.8),bank=waterPoint(w,0,-z);
 const intervals=FLOORS.flatMap(r=>{
  if(w.axis==='x')return Math.abs(bank.x-r.x)<=r.w/2?[[w.y-r.y-r.d/2,w.y-r.y+r.d/2]]:[];
  return Math.abs(bank.y-r.y)<=r.d/2?[[r.x-w.x-r.w/2,r.x-w.x+r.w/2]]:[];
 }).sort((a,b)=>a[0]-b[0]);
 const joined=[];
 for(const interval of intervals){
  const last=joined.at(-1);
  if(last&&interval[0]<=last[1])last[1]=Math.max(last[1],interval[1]);
  else joined.push([...interval]);
 }
 const span=joined.find(([lo,hi])=>lo<=0&&hi>=0);
 if(!span)throw Error('Water signal bank has no floor: '+w.id);
 const postX=Math.abs(span[0])<span[1]?span[0]-.08:span[1]+.08;
 return {z,postX,ceiling:covered(bank.y,bank.x),gateHousing,
  supportZ:gateHousing?w.y-GATE.y+GATE_ROOF_SLOT.d/2:null};
}
