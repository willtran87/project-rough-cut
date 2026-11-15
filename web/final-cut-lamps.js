import * as THREE from './vendor/three/three.module.js';
import {mergeGeometries} from './vendor/three/addons/utils/BufferGeometryUtils.js';
import {createMachineFinishMaterial,tagMachineSurface} from './final-cut-machine-finish.js';
import {RIG_HEADLAMPS} from './final-cut-rig.js';

// The beam starts 3 cm in front of the protective cage, never inside a solid
// lens or backing plate. Both the visible fixture and light use this layout.
export const headlampOrigin=spec=>[spec.side,spec.height,-spec.forward-spec.d/2-.03];
export const CAB_LAMP={id:'cab-lamp',side:0,height:2.72,forward:0,w:.36,h:.30,d:.08};

function fixtureGeometry({w,h,d}){
 const shell=[],glass=[],x=w/2,y=h/2,z=d/2,edge=.026;
 function block(list,px,py,pz,bw,bh,bd,finish=4){
  const g=new THREE.BoxGeometry(bw,bh,bd);g.translate(px,py,pz);
  if(list===shell)tagMachineSurface(g,finish,.23);
  else {const values=[];for(let i=0;i<g.attributes.position.count;i++)values.push(finish,finish,finish);g.setAttribute('color',new THREE.Float32BufferAttribute(values,3));}
  list.push(g);
 }
 // Recessed back, folded perimeter, a mounting foot and two side trunnions.
 block(shell,0,.008,z-.018,w-.035,h-.06,.036);
 for(const sign of [-1,1]){
  block(shell,sign*(x-edge/2),.009,-.005,edge,h-.04,d-.01,0);
  block(shell,0,sign*(y-.035),-.005,w-.025,.024,d-.01,0);
  block(shell,sign*(x-.06),-y+.017,z-.025,.055,.034,.05,1);
  block(shell,sign*(x-.019),0,z-.04,.035,.045,.038,1);
 }
 block(shell,0,-y+.009,z-.04,w*.54,.018,.075,1);
 // Dark rubber gasket, silver reflector rim and ribbed prismatic lens.
 for(const sign of [-1,1]){
  block(shell,sign*(x-.04),.009,-z+.03,.016,h-.09,.02,1);
  block(shell,0,sign*(y-.052)+.009,-z+.03,w-.075,.012,.02,1);
 }
 const lensW=w-.102,lensH=h-.113,bands=12;
 for(let k=0;k<bands;k++){
  const px=-lensW/2+(k+.5)*lensW/bands;
  // Alternating shallow ribs survive close inspection without an animated
  // shader, bloom, noise, or opaque full-box glow on the fixture's sides.
  for(const sign of [-1,1])block(glass,px,.009+sign*lensH/4,-z+.036+(k%2)*.002,lensW/bands-.001,lensH/2,.008,sign>0?(k%2?.82:.63):(k%2?.57:.43));
 }
 // Top visor, guard rails and small corner fasteners stay in the envelope.
 block(shell,0,y-.016,-z+.034,w-.012,.018,.068,0);
 for(const sign of [-1,1])block(shell,0,sign*(y-.043),-z+.008,w-.022,.012,.016,1);
 for(const px of [-w*.28,0,w*.28])block(shell,px,.006,-z+.009,.012,h-.06,.018,1);
 for(const sx of [-1,1])for(const sy of [-1,1])block(shell,sx*(x-.032),sy*(y-.034),-z+.019,.015,.015,.012,1);
 function merge(parts){const g=mergeGeometries(parts,false);parts.forEach(p=>p.dispose());g.computeBoundingSphere();return g;}
 return {shell:merge(shell),glass:merge(glass)};
}

export function createFinalCutLamps(materials,audit){
 const metal=createMachineFinishMaterial(),geometries=new Map(),fixtures=[];
 materials.headLamp.vertexColors=materials.wingLamp.vertexColors=true;
 function add(parent,spec,channel='headLamp',rotation=0,id=spec.id){
  const key=[spec.w,spec.h,spec.d].join('|');
  if(!geometries.has(key))geometries.set(key,fixtureGeometry(spec));
  const geo=geometries.get(key),group=new THREE.Group();group.name=`FinaleLamp-${id}`;
  group.position.set(spec.side,spec.height,-spec.forward);group.rotation.x=rotation;parent.add(group);
  for(const [kind,material]of [['shell',metal],['glass',materials[channel]]]){
   const mesh=new THREE.Mesh(geo[kind],material);mesh.name=`FinaleLamp-${kind}`;group.add(mesh);
   mesh.userData.lampFixture=id;mesh.userData.lampChannel=channel;
   if(id!=='cab-lamp')audit(id,mesh);
  }
  fixtures.push({id,group,spec,channel});return group;
 }
 return {fixtures,add,addHeadlamps(body){for(const spec of RIG_HEADLAMPS)add(body,spec);},
  addCab(cab){return add(cab,CAB_LAMP,'headLamp',-Math.PI/2);},
  stats:()=>({fixtures:fixtures.length,meshes:fixtures.length*2,geometries:geometries.size*2,materials:3,ownedMaterials:1,sharedLensMaterials:2,triangles:fixtures.reduce((n,f)=>n+f.group.children.reduce((t,m)=>t+m.geometry.index.count/3,0),0),uniqueTriangles:[...geometries.values()].reduce((n,g)=>n+(g.shell.index.count+g.glass.index.count)/3,0)}),
  dispose(){metal.dispose();}};
}
