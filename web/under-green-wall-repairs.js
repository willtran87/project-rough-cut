import * as THREE from './vendor/three/three.module.js';

// Sealed repairs sit on real solid boundaries, at most .18m into the existing
// wall clearance. None suggests a doorway or changes collision/navigation.
const REPAIRS=Object.freeze([
 {id:'bricked-vent',axis:'x',boundary:5,side:-1,along:5.8,h:2.25,w:1.05,d:.70,kind:'brick'},
 {id:'gallery-patch',axis:'x',boundary:-3,side:1,along:49.5,h:1.72,w:1.65,d:1.15,kind:'mortar'},
 {id:'pump-service',axis:'x',boundary:-27,side:1,along:46.15,h:1.85,w:1.22,d:.84,kind:'panel'},
 {id:'range-repair',axis:'x',boundary:23,side:-1,along:24.0,h:2.20,w:1.48,d:.95,kind:'panel'},
 {id:'keeper-tile-loss',axis:'y',boundary:11.35,side:1,along:15.5,h:.75,w:1.35,d:.92,kind:'mortar'}
]);

export function buildDrainWallRepairs({box,put}){
 const cylinder=new THREE.CylinderGeometry(1,1,1,6);
 for(const r of REPAIRS){
  const vertical=r.axis==='x',point=(u,h,depth)=>({x:vertical?r.boundary+r.side*depth:r.along+u,h:r.h+h,z:-(vertical?r.along+u:r.boundary+r.side*depth)});
  const slab=(type,u,h,w,tall,depth,offset)=>{const p=point(u,h,offset);box(type,p.x,p.h,p.z,vertical?depth:w,tall,vertical?w:depth);};
  if(r.kind==='panel'){
   slab('rubber',0,0,r.w+.06,r.d+.06,.018,.123);
   slab('machinePaint',0,0,r.w,r.d,.028,.147);
   for(const side of [-1,1]){
    slab('machineIron',side*(r.w/2-.025),0,.035,r.d,.025,.167);
    slab('machineIron',0,side*(r.d/2-.025),r.w,.035,.025,.167);
    for(const height of [-r.d*.36,r.d*.36]){
     const p=point(side*r.w*.41,height,.176);
     put(cylinder,'machineSteel',p.x,p.h,p.z,.024,.014,.024,vertical?0:Math.PI/2,0,vertical?Math.PI/2:0);
    }
   }
   // A welded cover and overlapping strap make the closure unambiguous.
   slab('machineIron',0,0,r.w*.64,r.d*.43,.012,.168);
   slab('machineRust',r.w*.24,0,.055,r.d*.88,.018,.17);
   for(let i=0;i<5;i++)slab('machineSteel',-r.w*.3+i*r.w*.15,r.d*.23,.018,.028,.012,.178);
  }else{
   const shape=new THREE.Shape(),outline=[[-.5,-.5],[.12,-.5],[.12,-.43],[.48,-.43],[.48,-.13],[.42,-.13],[.42,.35],[.28,.35],[.28,.5],[-.35,.5],[-.35,.39],[-.5,.39]];
   outline.forEach(([x,y],i)=>{if(i)shape.lineTo(x*r.w,y*r.d);else shape.moveTo(x*r.w,y*r.d);});shape.closePath();
   const g=new THREE.ShapeGeometry(shape),p=point(0,0,.114);
   put(g,r.kind==='brick'?'rootCrevice':'pumpStone',p.x,p.h,p.z,1,1,1,0,vertical?r.side*Math.PI/2:r.side===1?Math.PI:0);g.dispose();
   if(r.kind==='brick'){
    for(let row=0;row<4;row++)for(let col=0;col<3;col++){
     const u=-.34+col*.33+(row%2?.04:0),h=-.25+row*.165;
     slab('rootStone',u,h,.30,.145,.035,.136+(row+col)%3*.004);
    }
   }else{
    // Remnant tiles/bricks and a stepped mortar boundary explain the repair.
    for(const [u,h,w,tall]of [[-.43,.33,.17,.10],[-.43,-.30,.15,.13],[.33,.28,.16,.12],[.34,-.33,.19,.08],[.03,.45,.21,.08]])slab(r.id==='keeper-tile-loss'?'keeperStone':'rootStone',u*r.w,h*r.d,w,tall,.04,.14);
    for(const [u,h]of [[-.08,-.2],[.05,-.08],[.13,.07]])slab('rootCrevice',u*r.w,h*r.d,.014,.12,.003,.116);
   }
  }
 }
 cylinder.dispose();
 return {count:REPAIRS.length,repairs:REPAIRS.map(r=>({...r})),maximumIntrusion:.183,sealed:true};
}
