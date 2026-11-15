import * as THREE from './vendor/three/three.module.js';
import {COURSE} from './back-nine-course.js';
import {BREAKABLE_PROPS} from './chase-destruction.js';
import {isDestructibleFeature,featurePose} from './course-destruction-state.js';
import {terrainHeight} from './course-terrain.js';

const random=i=>{const n=Math.sin(i*127.1+73.7)*43758.5453;return n-Math.floor(n);};
export function fragmentMaterial(source,index){
 if(source.kind==='service-fence'||source.kind==='fallen-tree'&&source.id!=='clubhouse-fall')return index%3===0?'wood':'leaf';
 if(['crates','bench'].includes(source.kind)||source.id==='clubhouse-fall')return index%5===0?'metal':'wood';
 return source.id==='reservoir-trailer'&&index%2===0?'wood':'metal';
}
export function fragmentPose(source,state,index,age,reduced=false){
 const seed=source.x*17+source.y*7+index*31,t=reduced?1.8:Math.min(1.8,Math.max(0,age)),side=random(seed)*2-1,power=state.power||.5;
 const wave=t>=1.8?0:Math.sin(t/1.8*Math.PI);
 const material=fragmentMaterial(source,index),leaf=material==='leaf',wood=material==='wood';
 const dx=state.dx||0,dy=state.dy??1,spread=(.5+random(seed+1)*1.1),travel=t*(2-t/2.4);
 const x=source.x+side*source.rx*.65+travel*(dx*(1.3+power*2)+dy*side*spread);
 const y=source.y+(random(seed+2)-.5)*source.ry+travel*(dy*(1.3+power*2)-dx*side*spread);
 const lift=Math.max(0,(.35+random(seed+3)*.65)*(1-t/1.8)+wave*(leaf?1.1:.5)*power);
 const width=leaf?.10+random(seed+4)*.09:wood?.035+random(seed+4)*.045:.07+random(seed+4)*.08;
 const length=leaf?width*1.7:wood?.24+random(seed+5)*.48:.13+random(seed+5)*.2;
 return {material,x,y,lift,width,length,thickness:leaf?.009:wood?.028:.016,
  yaw:seed+t*side*(leaf?3:1.5),pitch:wave*(leaf?side*3:side*1.2),roll:wave*side*.6,settled:t===1.8};
}

export function createBreakFragments(scene,materials){
 const sources=[...BREAKABLE_PROPS.map((source,id)=>({source,id,prop:true})),...COURSE.features.filter(isDestructibleFeature).map(source=>({source,id:source.id,prop:false}))];
 const capacity=sources.length*12,box=new THREE.BoxGeometry(1,1,1),wood=box.clone(),metal=box.clone();
 const wp=wood.attributes.position,mp=metal.attributes.position;
 for(let i=0;i<wp.count;i++){const z=wp.getZ(i);wp.setX(i,wp.getX(i)*(z>0?.35:1));mp.setY(i,mp.getY(i)+Math.abs(mp.getZ(i))*.25);}
 wood.computeVertexNormals();metal.computeVertexNormals();
 const leaf=new THREE.OctahedronGeometry(.5,0);leaf.scale(.7,.065,1);
 const geometries={wood,metal,leaf},meshes={};
 for(const [name,geometry]of Object.entries(geometries)){
  const m=new THREE.InstancedMesh(geometry,materials[name==='metal'?'iron':name],capacity);m.userData.rigidInstanceBounds=true;m.name='BreakFragments-'+name;m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.count=0;m.frustumCulled=false;scene.add(m);meshes[name]=m;
 }
 const dustMaterial=new THREE.MeshBasicMaterial({color:0x948470,transparent:true,opacity:.22,depthWrite:false});
 const dust=new THREE.InstancedMesh(box,dustMaterial,sources.length*6);dust.userData.rigidInstanceBounds=true;dust.name='BreakContactDust';dust.count=0;dust.frustumCulled=false;scene.add(dust);
 const dummy=new THREE.Object3D();let signature='',lastRun=null,uploads=0;
 return {update(run,reduced=false){
  if(run!==lastRun){signature='';lastRun=run;}
  const key=sources.map(d=>{const s=d.prop?run.destruction?.props?.[d.id]:run.destruction?.features?.[d.id];return s?.brokenAt==null?'':(reduced?1.8:Math.min(1.8,Math.max(0,run.time-s.brokenAt))).toFixed(4);}).join(':');if(key===signature)return;signature=key;
  const counts={wood:0,metal:0,leaf:0};dust.count=0;
  for(const d of sources){
   const state=d.prop?run.destruction?.props?.[d.id]:run.destruction?.features?.[d.id];if(state?.brokenAt==null)continue;
   const source=d.prop?d.source:featurePose(run,d.source),age=Math.max(0,run.time-state.brokenAt);
   for(let i=0;i<12;i++){
    const p=fragmentPose(source,state,i,age,reduced);dummy.rotation.set(p.pitch,p.yaw,p.roll,'YXZ');dummy.scale.set(p.width,p.thickness,p.length);dummy.position.set(p.x,0,-p.y);dummy.updateMatrix();
    const e=dummy.matrix.elements,support=(Math.abs(e[1])+Math.abs(e[5])+Math.abs(e[9]))*.5;
    dummy.position.y=terrainHeight(p.x,p.y)+.033+support+p.lift;dummy.updateMatrix();meshes[p.material].setMatrixAt(counts[p.material]++,dummy.matrix);
   }
   if(!reduced&&age<.9)for(let i=0;i<6;i++){
    const a=i*2.3999,r=age*(.6+i*.13),size=(.12+age*.15)*(1-age/.9);
    dummy.position.set(source.x+Math.cos(a)*r,terrainHeight(source.x,source.y)+.25+age*.3,-source.y+Math.sin(a)*r);dummy.rotation.set(a,0,a);dummy.scale.setScalar(size);dummy.updateMatrix();dust.setMatrixAt(dust.count++,dummy.matrix);
   }
  }
  for(const [name,m]of Object.entries(meshes)){m.count=counts[name];m.instanceMatrix.needsUpdate=true;}if(dust.count)dust.instanceMatrix.needsUpdate=true;uploads++;
 },stats:()=>({wood:meshes.wood.count,metal:meshes.metal.count,leaves:meshes.leaf.count,dust:dust.count,capacity,uploads}),
 dispose(){for(const m of Object.values(meshes)){m.dispose();m.removeFromParent();m.geometry.dispose();}dust.dispose();dust.removeFromParent();box.dispose();dustMaterial.dispose();}};
}
