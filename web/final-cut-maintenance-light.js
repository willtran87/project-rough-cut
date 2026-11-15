import * as THREE from './vendor/three/three.module.js';
import {BOARD_READY,BOARD_STARTUP} from './final-cut-arrival.js';
import {OPENING_RIG,ACCESS_FENCE} from './final-cut-arrival-layout.js';

const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
export function maintenanceLightLevel(r){
 if(r.openingSeen||r.arrival.ready||r.rig.phase!=='waiting')return 0;
 // The work circuit goes dark before the raised marker lights take over.
 return 1-smooth((r.arrival.age-(BOARD_READY-BOARD_STARTUP-.8))/.8);
}

export function createMaintenanceLight(scene,materials,{software=false}={}){
 const root=new THREE.Group();root.name='Equipment-apron-worklight';scene.add(root);
 const unit=new THREE.BoxGeometry(),rows=new Map(),dummy=new THREE.Object3D();
 const glass=new THREE.MeshBasicMaterial({color:'#ffe0ae'}),dark=new THREE.Color('#252c28'),warm=new THREE.Color('#ffe0ae');
 const palette={metal:materials.metal,dark:materials.dark,brass:materials.brass,glass};
 function box(mat,x,y,z,w,h,d,parent=root){
  dummy.position.set(x,y,z);dummy.rotation.set(0,0,0);dummy.scale.set(w,h,d);dummy.updateMatrix();parent.updateWorldMatrix(true,false);
  const m=new THREE.Matrix4().multiplyMatrices(parent.matrixWorld,dummy.matrix);
  if(!rows.has(mat))rows.set(mat,[]);rows.get(mat).push(m);
 }
 // The 10cm mast is inside the existing 12cm fence footprint. Its head and
 // bracket are above walking clearance; no decorative ground obstruction.
 const x=OPENING_RIG.x,z=-ACCESS_FENCE[1].y;
 box('metal',x,2.13,z,.10,4.26,.10);
 for(const y of [.5,.95]){box('dark',x,y,z,.20,.13,.12);for(const side of [-1,1])box('brass',x+side*.065,y,z+.065,.025,.035,.012);}
 box('dark',x,1.3,z,.095,.26,.11);
 box('metal',x,4.12,z-.24,.10,.12,.56);
 const fixture=new THREE.Group();fixture.position.set(x,4.12,z-.52);root.add(fixture);
 const target=new THREE.Vector3(26.2,1.2,-23.2);fixture.lookAt(target);
 box('dark',0,0,-.07,.92,.46,.26,fixture);
 box('metal',0,0,.07,.84,.38,.06,fixture);
 box('glass',0,0,.108,.72,.27,.018,fixture);
 for(let i=-4;i<=4;i++)box('metal',i*.083,0,.126,.012,.29,.024,fixture);
 for(const side of [-1,1]){box('dark',side*.405,0,.16,.055,.42,.20,fixture);box('brass',side*.445,0,-.06,.045,.13,.13,fixture);}
 box('dark',0,.235,.17,.96,.045,.36,fixture);
 box('dark',0,-.2,.13,.88,.04,.24,fixture);
 for(const side of [-1,1])for(const y of [-.16,.16])box('brass',side*.39,y,.112,.025,.025,.025,fixture);
 let parts=0;for(const [mat,matrices]of rows){const mesh=new THREE.InstancedMesh(unit,palette[mat],matrices.length);mesh.name=`Apron-light-${mat}`;matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.castShadow=mat!=='glass';mesh.receiveShadow=mat!=='glass';root.add(mesh);parts+=matrices.length;}
 fixture.updateWorldMatrix(true,false);
 const origin=new THREE.Vector3(0,0,.15).applyMatrix4(fixture.matrixWorld);
 const light=new THREE.SpotLight('#ffe8c5',80,13,.92,.65,1.6);light.position.copy(origin);light.target.position.copy(target);scene.add(light,light.target);
 light.castShadow=true;light.shadow.mapSize.setScalar(software?256:512);light.shadow.camera.near=.15;light.shadow.camera.far=13;light.shadow.bias=-.0001;light.shadow.normalBias=.025;light.shadow.autoUpdate=false;
 let previous='',updates=0;
 return {light,root,update(r){const level=maintenanceLightLevel(r);light.intensity=80*level;glass.color.copy(dark).lerp(warm,level);const key=[r.arrival.age,r.rig.x,r.rig.y,r.rig.deployment].join('|');if(level>0&&key!==previous){light.shadow.needsUpdate=true;previous=key;updates++;}},stats:()=>({intensity:light.intensity,origin:origin.toArray(),target:target.toArray(),mast:[x,z],parts,draws:rows.size,mapSize:light.shadow.mapSize.x,updates}),dispose(){unit.dispose();glass.dispose();light.shadow.map?.dispose();light.shadow.mapPass?.dispose();}};
}
