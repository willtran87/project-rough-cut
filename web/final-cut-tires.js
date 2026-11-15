import * as THREE from './vendor/three/three.module.js';
import {mergeGeometries} from './vendor/three/addons/utils/BufferGeometryUtils.js';
import {createMachineFinishMaterial,tagMachineSurface} from './final-cut-machine-finish.js';
import {RIG_WHEELS} from './final-cut-rig.js';
import {wheelSupport} from './final-cut-wheel-travel.js';

// One shared tire mesh, attached to each existing steered/rolling wheel parent.
// All rubber stays within the original width and swept tread radius.
export function createFinalCutTires(spec){
 const parts=[],radius=spec.carcassRadius,width=spec.width,radialScale=radius/.843;
 const point=(x,r,a)=>[x,Math.cos(a)*r,Math.sin(a)*r];
 function append(g,seed=.21){tagMachineSurface(g,4,seed);parts.push(g);}
 function polygonPrism(outline,lower,upper){
  const p=[],index=[];
  const quad=(a,b,c,d)=>{const n=p.length/3;p.push(...a,...b,...c,...d);index.push(n,n+1,n+2,n,n+2,n+3);};
  const bottom=outline.map(([x,a])=>point(x,lower,a));
  // Taper each lug's crown toward the shoulders. The center gutter and
  // spaces between chevrons expose the underlying molded carcass.
  const top=outline.map(([x,a])=>point(x,upper-Math.abs(x)/(.5*width)*.018,a));
  for(let k=0;k<outline.length;k++){const n=(k+1)%outline.length;quad(bottom[k],bottom[n],top[n],top[k]);}
  for(let k=1;k<outline.length-1;k++){quad(top[0],top[k],top[k+1],top[0]);quad(bottom[0],bottom[k+1],bottom[k],bottom[0]);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(index);g.computeVertexNormals();append(g,.37);
 }
 // Rounded shoulders, dished sidewalls and recessed beads, rather than a
 // flat cylinder end. The rim/hub is supplied by the existing boss assembly.
 const profile=[[-.286,.48],[-.308,.54],[-.318,.63],[-.309,.72],[-.28,.79],[-.23,.826],[-.13,.84],[0,.843],[.13,.84],[.23,.826],[.28,.79],[.309,.72],[.318,.63],[.308,.54],[.286,.48]];
 const carcass=new THREE.LatheGeometry(profile.map(([x,r])=>new THREE.Vector2(r*radialScale,x*width/.64)),64);carcass.rotateZ(Math.PI/2);append(carcass);
 for(let k=0;k<24;k++)for(const side of [-1,1]){
  const a=k*Math.PI/12,half=width/2;
  const outline=[[side*.018,a-.10],[side*(half-.045),a+.012],[side*(half-.011),a-.008],[side*(half-.011),a-.078],[side*(half-.045),a-.068],[side*.018,a-.18]];
  polygonPrism(side<0?outline.reverse():outline,radius-.015,spec.treadRadius+.018/(.5*width)*.018);
 }
 // Raised molding rings and short shoulder ribs catch grazing light. They
 // are real rubber relief, not a painted metal-like grain or repeated logo.
 for(const side of [-1,1]){
  for(const [r,x]of [[.535,.305],[.665,.319],[.735,.304]]){
   const ring=new THREE.TorusGeometry(r*radialScale,.004,4,64);ring.rotateY(Math.PI/2);ring.translate(side*x,0,0);append(ring,.52);
  }
  for(let k=0;k<36;k++){
   const a=k*Math.PI/18,g=new THREE.BoxGeometry(.006,.052*radialScale,.009);g.rotateX(a);g.translate(side*.313,Math.cos(a)*.695*radialScale,Math.sin(a)*.695*radialScale);append(g,.52);
  }
 }
 const geometry=mergeGeometries(parts,false);geometry.computeBoundingSphere();parts.forEach(g=>g.dispose());
 const tires=[];
 return {add(parent,id,audit){const film=new THREE.Vector4(),material=createMachineFinishMaterial(film),mesh=new THREE.Mesh(geometry,material);mesh.name='FinaleMoldedTire';parent.add(mesh);audit(id,mesh);tires.push({parent,mesh,film,spec:RIG_WHEELS.find(w=>w.id===id)});return mesh;},update(r){const films=r.won?r.ending.wheelFilm:r.rig.wheelFilm;tires.forEach((t,k)=>{const f=films?.[k];t.film.set(f?.mud||0,f?.dust||0,f?.grass||0,f?.wet||0);t.parent.position.y=t.spec.height+wheelSupport(r.rig,t.spec);});},stats:()=>({sharedGeometries:1,materials:tires.length,trianglesPerTire:geometry.index.count/3,treadLugs:48,moldingRings:6,shoulderRibs:72,outerRadius:spec.treadRadius,width,films:tires.map(t=>t.film.toArray()),heights:tires.map(t=>t.parent.position.y)}),dispose(){tires.forEach(t=>t.mesh.material.dispose());}};
}

