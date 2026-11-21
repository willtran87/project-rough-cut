import * as THREE from './vendor/three/three.module.js';
import {BASINS,VALVES,BREAKER,BASIN_TIMING as T} from './final-cut-basin-layout.js';
import {tuning} from './final-cut-difficulty.js';

// Presentation of the four floodable hollows: damp ground, a rising film of
// water, the irrigation jets that feed it, and a beacon on each valve post
// that can be read across the course at night. Everything follows simulation
// state; nothing here keeps a clock or decides an outcome.
const BEACON={dry:'#28352c',locked:'#28352c',filling:'#d9a441',full:'#7fe0b4',draining:'#7a8f6a',spent:'#b5483a'};
export function createFinalCutBasinArt(scene,{materials,software=false}){
 const root=new THREE.Group();root.name='FinalCutBasins';scene.add(root);
 const geometries=[],owned=[],dummy=new THREE.Object3D(),up=new THREE.Vector3(0,1,0),a=new THREE.Vector3(),b=new THREE.Vector3(),delta=new THREE.Vector3();
 const keep=g=>{geometries.push(g);return g;},own=m=>{owned.push(m);return m;};
 const disc=keep(new THREE.CircleGeometry(1,software?16:28));disc.rotateX(-Math.PI/2);
 const wheelGeometry=keep(new THREE.TorusGeometry(.17,.028,6,14));wheelGeometry.rotateX(Math.PI/2);
 const spoke=keep(new THREE.BoxGeometry(.32,.03,.03)),lamp=keep(new THREE.BoxGeometry(.2,.2,.2)),pipe=keep(new THREE.CylinderGeometry(1,1,1,5,1,true));
 const flow=own(new THREE.MeshBasicMaterial({color:'#9fbdb4'}));
 const parts=BASINS.map(basin=>{
  const valve=VALVES.find(v=>v.basin===basin.id),part={basin,valve};
  if(!basin.final){
   // The swale has its own modelled soil and water. The fairway hollows are
   // shallow: a darkened oval of turf and a thin sheet of water over it.
   part.damp=new THREE.Mesh(disc,own(new THREE.MeshLambertMaterial({color:'#1c2419',transparent:true,opacity:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2})));
   part.damp.position.set(basin.x,.012,-basin.y);part.damp.scale.set(basin.w/2,1,basin.d/2-.3);part.damp.renderOrder=2;root.add(part.damp);
   part.water=new THREE.Mesh(disc,own(new THREE.MeshLambertMaterial({color:'#6f9a94',transparent:true,opacity:0,depthWrite:false})));
   part.water.position.set(basin.x,.03,-basin.y);part.water.renderOrder=3;root.add(part.water);
  }
  part.wheel=new THREE.Group();part.wheel.position.set(valve.x,1.18,-valve.y);root.add(part.wheel);
  part.wheel.add(new THREE.Mesh(wheelGeometry,materials.brass),new THREE.Mesh(spoke,materials.brass));const cross=new THREE.Mesh(spoke,materials.brass);cross.rotation.y=Math.PI/2;part.wheel.add(cross);
  part.beacon=new THREE.Mesh(lamp,own(new THREE.MeshBasicMaterial({color:BEACON.dry})));part.beacon.position.set(valve.x,1.84,-valve.y);root.add(part.beacon);
  return part;
 });
 const SEGMENTS=8,JETS=3,streams=new THREE.InstancedMesh(pipe,flow,SEGMENTS*JETS);streams.frustumCulled=false;root.add(streams);
 const tint=new THREE.Color();let state={};
 function update(r,reduced=false){
  let streamCount=0;const report={};
  for(const part of parts){
   const {basin,valve}=part,s=r.basins[basin.id],level=Math.max(0,Math.min(1,s.level)),active=s.state==='filling'||s.state==='full';
   const locked=!r.pump||(basin.final&&r.stage<2&&s.state==='dry');
   // A full basin pulses in its last seconds so the drain is not a surprise.
   const hold=(basin.final?T.swaleHold:T.hold)*tuning(r).hold,ending=s.state==='full'&&hold-s.age<4,pulse=s.state==='filling'||ending?(reduced?1:.55+.45*Math.abs(Math.sin(r.time*(ending?7:3.2)))):1;
   tint.set(BEACON[locked?'locked':s.state]).multiplyScalar(pulse);part.beacon.material.color.copy(tint);
   part.wheel.rotation.y=active?level*7:s.state==='draining'?level*7:0;
   if(part.water){
    const spent=s.state==='spent';
    part.damp.material.opacity=spent?.82:.62*Math.min(1,level*2.4);part.damp.visible=part.damp.material.opacity>.01;part.damp.material.color.set(spent?'#2b2619':'#1c2419');
    const spread=.35+.65*level;part.water.visible=!spent&&level>.04;part.water.material.opacity=.72*Math.min(1,level*1.6);
    part.water.scale.set((basin.w/2-.25)*spread,1,(basin.d/2-.55)*spread);part.water.position.y=.03+.035*level;
   }
   if(active)for(let jet=0;jet<JETS;jet++){
    // Thin arcs from the valve head out over the hollow: the visible sign,
    // above uncut rough, of which basin has the pressure.
    const tx=basin.x+(jet-1)*basin.w*.26,ty=basin.y+(valve.y>basin.y?1:-1)*(jet===1?-.6:.9),reach=.35+.65*level,wobble=reduced?0:Math.sin(r.time*5+jet*2.1)*.08;
    const at=(t,target)=>target.set(valve.x+(tx-valve.x)*t*reach,1.2+Math.sin(t*Math.PI)*(1.5+wobble)-t*1.15,-(valve.y+(ty-valve.y)*t*reach));
    for(let k=0;k<SEGMENTS;k++){
     at(k/SEGMENTS,a);at((k+1)/SEGMENTS,b);delta.copy(b).sub(a);const length=delta.length();
     dummy.position.copy(a).add(b).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(up,delta.normalize());dummy.scale.set(.016,Math.max(.0001,length),.016);dummy.updateMatrix();streams.setMatrixAt(streamCount++,dummy.matrix);
    }
   }
   report[basin.id]={state:s.state,level,beacon:'#'+part.beacon.material.color.getHexString(),water:!!part.water?.visible};
  }
  streams.count=streamCount;streams.visible=streamCount>0;streams.instanceMatrix.needsUpdate=true;
  state={basins:report,streams:streamCount};
 }
 return {update,stats:()=>state,valves:VALVES,breaker:BREAKER,dispose(){scene.remove(root);geometries.forEach(g=>g.dispose());owned.forEach(m=>m.dispose());}};
}
