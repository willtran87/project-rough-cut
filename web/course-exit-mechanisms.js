import {DRAIN_LAYOUT} from './drain-collision.js';
import {collisionArtBounds} from './collision-art-bounds.js';
import * as THREE from './vendor/three/three.module.js';
import {mergeGeometries} from './vendor/three/addons/utils/BufferGeometryUtils.js';
import {courseExitRelease} from './course-exit-release.js';

// Mechanisms follow the authoritative release clock, including while course
// time is stopped. No cosmetic timer can unlock an exit or advance its filing.
export function createCourseExitMechanisms(parent,door,gate){
 const material=new THREE.MeshLambertMaterial({vertexColors:true});
 const roots=[],geometries=new Set(),collisionParts=[];let disposed=false,pose=null;
 function group(owner,name,x=0,y=0,z=0){const g=new THREE.Group();g.name=name;g.position.set(x,y,z);owner.add(g);roots.push(g);return g;}
 function batch(owner,build){
  const parts=[],tags=[];let vertexCount=0;
  function add(g,color,x,y,z,id){if(id)tags.push({id,start:vertexCount,count:g.attributes.position.count});vertexCount+=g.attributes.position.count;g.translate(x,y,z);const c=new THREE.Color(color),colors=new Float32Array(g.attributes.position.count*3);for(let i=0;i<colors.length;i+=3){colors[i]=c.r;colors[i+1]=c.g;colors[i+2]=c.b;}g.setAttribute('color',new THREE.BufferAttribute(colors,3));parts.push(g);}
  const box=(x,y,z,w,h,d,c,id)=>add(new THREE.BoxGeometry(w,h,d).toNonIndexed(),c,x,y,z,id);
  const shaft=(x,y,z,r,length,c)=>{const g=new THREE.CylinderGeometry(r,r,length,10).toNonIndexed();g.rotateZ(Math.PI/2);add(g,c,x,y,z);};
  build(box,shaft);const geometry=mergeGeometries(parts);parts.forEach(g=>g.dispose());geometries.add(geometry);
  const m=new THREE.Mesh(geometry,material);m.castShadow=m.receiveShadow=true;owner.add(m);for(const t of tags)collisionParts.push({...t,mesh:m,owner});return m;
 }
 const housing=group(door,'ExitBoltHousing');
 batch(housing,box=>{for(const x of [1.63,1.91]){box(x,1.43,.205,.10,.13,.085,0x515b55);for(const y of [1.39,1.47])box(x,y,.253,.025,.025,.012,0xaaa78e);}box(1.77,1.43,.22,.25,.06,.06,0x232c28);});
 const bolt=group(door,'ExitSlidingBolt');
 batch(bolt,box=>{box(1.86,1.43,.26,.45,.045,.045,0xaaa485);box(1.69,1.43,.30,.045,.11,.045,0xb2a77d);});
 const keeper=group(parent,'ExitBoltKeeper',door.position.x,door.position.y,door.position.z);
 batch(keeper,box=>{box(2.065,1.43,.23,.09,.14,.11,0x46534d);for(const y of [1.38,1.48])box(2.065,y,.29,.022,.022,.012,0xb4a98a);});
 const hoist=group(parent,'DrainReleaseHoist',gate.position.x,0,gate.position.z);
 batch(hoist,(box,shaft)=>{
  for(const s of [-1,1]){
   box(s*1.16,1.40,.04,.12,2.5,.16,0x596760);const f=DRAIN_LAYOUT.foot;box(s*f.x,f.y,f.z,f.w,f.h,f.d,0x858675,'drain-foot-'+(s<0?'west':'east'));
   box(s*1.16,1.4,.132,.035,2.4,.018,0x969782);
   for(const y of [.35,1.34,2.43]){box(s*1.16,y,.16,.23,.13,.06,0x3c4942);box(s*1.16,y,.196,.035,.035,.02,0xb3aa88);}
   box(s*.83,2.52,.05,.10,.27,.26,0x616b5e);
  }
  box(0,2.66,.03,2.50,.16,.25,0x687464);shaft(0,2.52,.05,.045,1.88,0x9a9b85);
  box(.96,2.51,.03,.31,.36,.35,0x5c6659);
  for(let i=0;i<4;i++)box(.96,2.41+i*.055,.211,.20,.018,.015,0x2c3831);
 });
 const drum=group(hoist,'DrainCableDrum',0,2.52,.05);
 batch(drum,(box,shaft)=>{shaft(0,0,0,.12,1.46,0x534b3b);for(const x of [-.75,.75])shaft(x,0,0,.155,.04,0x93917a);for(let i=0;i<12;i++){const a=i*Math.PI/6;box(0,Math.cos(a)*.12,Math.sin(a)*.12,1.42,.012,.012,0xa69a7d);}});
 const crossbar=group(gate,'DrainGateCarriage');
 batch(crossbar,box=>{box(0,.30,.06,2.25,.075,.10,0x75816f);box(0,.87,.06,1.35,.065,.10,0x838773);for(const s of [-1,1]){box(s*1.10,.30,.065,.18,.20,.18,0x7a8070);box(s*.65,.90,.15,.08,.13,.12,0xa5a082);}});
 const cables=[];
 for(const s of [-1,1]){
  const owner=group(hoist,'DrainLiftCable'+s,s*.65,0,.17);
  const cable=batch(owner,(box)=>box(0,.5,0,.014,1,.014,0x9f9e85));cables.push(cable);
 }
 const pawl=group(hoist,'DrainValveInterlock',.98,2.47,.24);
 batch(pawl,box=>{box(0,0,0,.07,.21,.04,0xc3a968);box(0,-.10,.015,.14,.045,.05,0x857c5a);});
 function update(frame){
  pose=courseExitRelease(frame);bolt.position.x=-.25*pose.shedBolt;
  gate.position.y=pose.drainLift;drum.rotation.x=-pose.drainDrum;pawl.rotation.z=pose.drainUnlocked?-.65:0;
  const low=.90+pose.drainLift,high=2.52;
  for(const c of cables){c.position.y=low;c.scale.y=high-low;}
 }
 update({});
 function collisionArt(){const gateParts=[];gate.traverse(mesh=>{if(mesh.isMesh)gateParts.push({mesh});});return [...collisionParts.map(p=>collisionArtBounds(p.id,p.owner,[p])),collisionArtBounds('drain-grate',gate,gateParts)];}
 return {update,stats:()=>({collisionArt:collisionArt(),pose:{...pose},meshes:geometries.size,triangles:[...geometries].reduce((n,g)=>n+g.attributes.position.count/3,0),cables:cables.map(c=>({bottom:c.position.y,top:c.position.y+c.scale.y})),disposed}),dispose(){if(disposed)return;disposed=true;for(const r of roots)r.removeFromParent();for(const g of geometries)g.dispose();material.dispose();}};
}
