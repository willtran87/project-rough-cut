import * as THREE from './vendor/three/three.module.js';
import {mergeGeometries} from './vendor/three/addons/utils/BufferGeometryUtils.js';
import {createMachineFinishMaterial,tagMachineSurface} from './final-cut-machine-finish.js';

// Built sheet-metal forms, recessed ventilation and service hardware. Each
// merged mesh stays inside its authoritative RIG_BODY part, including bolts.
// Shared authored materials; no independent animation clock or extra pass.
function builder(spec){
 const pieces=[],offset=[spec.side,spec.height,-spec.forward],seed=Math.abs(spec.side*.17+spec.forward*.31);
 const kind={green:0,metal:1,cream:2,warning:3,dark:4,brass:5};
 const add=(g,color)=>{tagMachineSurface(g,kind[color],seed,offset);pieces.push(g);};
 function quad(a,b,c,d,color){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([...a,...b,...c,...d],3));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();add(g,color);}
 function block(x,y,z,w,h,d,color){const g=new THREE.BoxGeometry(w,h,d);g.translate(x,y,z);add(g,color);}
 function face(points,color){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));const index=[];for(let k=1;k<points.length-1;k++)index.push(0,k,k+1);g.setIndex(index);g.computeVertexNormals();add(g,color);}
 function outline(w,d,cut){const x=w/2,z=d/2;return [[-x+cut,-z],[x-cut,-z],[x,-z+cut],[x,z-cut],[x-cut,z],[-x+cut,z],[-x,z-cut],[-x,-z+cut]];}
 function join(a,c,color){for(let k=0;k<a.length;k++){const n=(k+1)%a.length;quad(a[n],a[k],c[k],c[n],color);}}
 function ring(w,d,cut,y,cx=0,cz=0){return outline(w,d,cut).map(([x,z])=>[x+cx,y,z+cz]);}
 // A physical pressed recess: perimeter, sloped return and recessed face.
 // No flat opaque decal or second panel covers the change in depth.
 function stamp(w,h,cut,rim,depth,map,color){const a=outline(w,h,cut).map(([u,v])=>map(u,v,rim)),c=outline(w-.07,h-.07,Math.max(.012,cut-.015)).map(([u,v])=>map(u,v,depth));join(a,c,color);face(c,color);}
 function cylinder(x,y,z,r,h,color){const g=new THREE.CylinderGeometry(r,r,h,12);g.translate(x,y,z);add(g,color);}
 function shell(w,h,d,bevel,color,lift=0){
  const x=w/2,y=h/2,z=d/2,profile=[[-x,-y],[x,-y],[x,y-bevel],[x-bevel,y],[-x+bevel,y],[-x,y-bevel]].map(([x,y])=>[x,y+lift]);
  for(let k=0;k<profile.length;k++){const a=profile[k],b=profile[(k+1)%profile.length];quad([a[0],a[1],-z],[b[0],b[1],-z],[b[0],b[1],z],[a[0],a[1],z],color);}
  for(const s of [-1,1])for(let k=1;k<profile.length-1;k++){const a=profile[0],b=profile[k],c=profile[k+1];quad([a[0],a[1],s*z],[b[0],b[1],s*z],[c[0],c[1],s*z],[a[0],a[1],s*z],color);}
 }
 // Tag before merging so hinges, lids and individual panels own their edge
 // wear and material dimensions. Chassis-space points still locate oil runs.
 function finish(){const g=mergeGeometries(pieces,false);pieces.forEach(p=>p.dispose());g.computeBoundingSphere();return g;}
 return {block,shell,quad,face,join,ring,stamp,cylinder,finish};
}
function housing(spec){
 const b=builder(spec),{w,h,d}=spec,x=w/2,y=h/2,z=d/2;
 if(spec.id.startsWith('fender-')){
  const center=.91-spec.height,point=(side,r,a)=>[side,center+Math.cos(a)*r,Math.sin(a)*r];
  // Rolled sheet follows the tire arc, with enough suspension clearance for
  // the highest 12 cm paving slab. Supports and lips stay in this collider.
  for(let k=0;k<12;k++){
   const a=-.85+k*1.7/12,c=-.85+(k+1)*1.7/12;
   b.quad(point(-x,1.02,a),point(x,1.02,a),point(x,1.02,c),point(-x,1.02,c),'green');
   b.quad(point(-x,1.002,c),point(x,1.002,c),point(x,1.002,a),point(-x,1.002,a),'dark');
   for(const side of [-x,x])b.quad(point(side,.965,a),point(side,1.02,a),point(side,1.02,c),point(side,.965,c),'metal');
  }
  for(const a of [-.85,.85])b.quad(point(-x,.965,a),point(x,.965,a),point(x,1.02,a),point(-x,1.02,a),'green');
  for(const dz of [-.57,.57])b.block(0,.12,dz,.12,.1,.07,'metal');
  for(const side of [-1,1])b.block(side*(x-.035),.245,0,.027,.012,.035,'metal');
 }else if(spec.id==='canopy'){
  const rim=b.ring(w-.02,d-.02,.16,-.13),upper=b.ring(w-.02,d-.02,.16,.055),crown=b.ring(w-.30,d-.30,.12,.135),inner=b.ring(w-.10,d-.10,.14,-.13),ceiling=b.ring(w-.10,d-.10,.14,.025);
  b.join(rim,upper,'green');b.join(upper,crown,'green');b.face(crown.slice().reverse(),'green');b.join(inner,rim,'metal');b.join(inner,ceiling,'cream');b.face(ceiling,'cream');
  // Crown stiffeners, underside channels and the actual cab-lamp mount.
  for(const x of [-.64,0,.64]){b.block(x,.140,0,.065,.010,1.68,'green');b.block(x,.147,0,.025,.004,1.62,'metal');}
  for(const x of [-1,1])b.block(x,-.05,.075,.10,.14,2.05,'green');
  for(const z of [-.9,1.05])b.block(0,-.055,z,2.30,.15,.10,'green');
  b.block(0,-.05,0,.42,.16,.36,'metal');
  for(const x of [-.96,-.48,.48,.96])for(const z of [-1.155,1.155])b.block(x,-.045,z,.024,.024,.008,'metal');
  for(const s of [-1,1])for(const z of [-.8,0,.8])b.block(s*1.247,-.045,z,.008,.024,.024,'metal');
 }else if(spec.id==='hood'){
  const levels=[[-y,w,d],[-.12,w,d],[-.09,w-.06,d-.06],[.04,w-.06,d-.06],[.07,w,d],[y-.045,w-.12,d-.12]],rings=levels.map(([height,width,depth])=>b.ring(width,depth,.10,height));
  b.face(rings[0],'dark');for(let k=1;k<rings.length;k++)b.join(rings[k-1],rings[k],'green');b.face(rings.at(-1).slice().reverse(),'green');
  // Separate stamped service lids expose a lower centre seam and shoulder.
  for(const s of [-1,1]){
   b.block(s*.80,y-.039,0,1.43,.012,1.31,'dark');
   b.join(b.ring(1.40,1.28,.055,y-.045,s*.80),b.ring(1.40,1.28,.055,y-.016,s*.80),'green');
   b.stamp(1.40,1.28,.055,y-.016,y-.027,(u,v,n)=>[s*.80+u,n,v],'green');
   for(const k of [-1,1])b.block(s*.80+k*.42,y-.013,-.61,.13,.018,.045,'metal');
   b.block(s*.80,y-.013,.60,.11,.018,.055,'brass');
   b.cylinder(s*1.25,y-.015,.42,.065,.03,'metal');
   b.block(s*1.25,y-.004,.42,.065,.008,.018,'brass');
  }
 }else if(spec.id==='power-unit'){
  // Open service enclosure: no hidden full box behind the ventilation slots.
  b.block(0,-y+.025,0,w-.04,.05,d-.04,'dark');
  b.block(0,y-.035,0,w-.04,.07,d-.04,'green');
  b.block(0,0,-z+.025,w-.04,h-.10,.05,'cream');
  for(const s of [-1,1]){
   for(const dy of [-y+.135,y-.135])b.stamp(d-.04,.27,.04,x-.005,x-.026,(u,v,n)=>[s*n,dy+v,u],'cream');
   for(const dz of [-z+.13,z-.13])b.block(s*(x-.025),0,dz,.05,h-.08,.22,'green');
   for(const dy of [-.25,.25])b.block(s*(x-.014),dy,0,.028,.025,d-.44,'metal');
   for(let k=0;k<4;k++)b.block(s*(x-.014),-.1875+k*.125,0,.028,.025,d-.44,'green');
   for(const dz of [-z+.12,z-.12])for(const dy of [-.31,.31])b.block(s*(x-.006),dy,dz,.012,.028,.028,'metal');
  }
  // Rear opening has a real finned core behind these separated guard bars.
  for(const dy of [-y+.105,y-.105]){
   b.stamp(w-.04,.21,.04,z-.005,z-.025,(u,v,n)=>[u,dy+v,n],'cream');
   // Folded returns give the exposed sheet a real thickness at the radiator
   // opening, without sealing its cooling path with another solid panel.
   for(const edge of [-1,1])b.block(0,dy+edge*.0975,z-.0275,w-.12,.015,.045,'cream');
  }
  for(const s of [-1,1])b.block(s*(x-.13),0,z-.025,.22,h-.08,.05,'green');
  for(let k=0;k<19;k++)b.block(-1.43+k*2.86/18,0,z-.015,.025,.65,.03,'metal');
  for(const s of [-1,1])for(const dy of [-.42,.42])b.block(s*(x-.13),dy,z-.006,.03,.03,.012,'metal');
 }else{
  const s=Math.sign(spec.side);
  b.shell(w-.04,h-.025,d-.025,.04,'dark');
  b.stamp(d-.07,h-.075,.045,x-.002,x-.015,(u,v,n)=>[s*n,-.025+v,u],'cream');
  b.block(0,y-.03,0,w,.06,d-.04,'green');
  // Outer removable hydraulic service panel, protected lower rub rail,
  // corner fasteners and front steel mounting plate under the hose fittings.
  b.stamp(d-.32,.31,.035,x-.002,x-.011,(u,v,n)=>[s*n,-.015+v,u],'green');
  b.block(s*(x-.004),.065,0,.008,.12,.24,'warning');
  b.block(s*(x-.004),-.225,0,.008,.055,d-.13,'metal');
  for(const dz of [-z+.12,z-.12])for(const dy of [-.19,.17])b.block(s*(x-.004),dy,dz,.008,.024,.024,'metal');
  b.block(0,.13,-z+.01,w-.06,.24,.02,'metal');
  b.block(s*(x-.004),.015,z*.32,.008,.025,.13,'brass');
  for(let k=0;k<4;k++)b.block(s*(x-.004),-.08+k*.045,-z*.33,.008,.018,d*.22,'dark');
 }
 return b.finish();
}
function wingHousing(spec){
 const b=builder(spec),{w,h,d}=spec,y=h/2,z=d/2;
 if(spec.id==='deck'){
  const rings=[b.ring(w-.04,d-.04,.10,-y),b.ring(w,d,.10,-y+.05),b.ring(w-.04,d-.04,.10,y-.05),b.ring(w-.16,d-.16,.08,y)];
  b.face(rings[0],'dark');for(let k=1;k<rings.length;k++)b.join(rings[k-1],rings[k],'green');b.face(rings.at(-1).slice().reverse(),'green');
 }else{
  const bottom=b.ring(w,d,.08,-y),shoulder=b.ring(w,d,.08,y-.07),top=b.ring(w-.12,d-.12,.055,y);
  b.face(bottom,'dark');for(let k=0;k<8;k++){if(k===4)continue;const n=(k+1)%8;b.quad(bottom[n],bottom[k],shoulder[k],shoulder[n],'green');}b.join(shoulder,top,'green');b.face(top.slice().reverse(),'warning');
  // Three pressed rear faces replace the flat rail and pasted-on ribs.
  const span=w-.16,cell=span/3,cy=-.035;
  for(const sy of [-y+.015,y-.085])b.block(0,sy,z-.012,span,.03,.024,'green');
  for(const x of [-span/2,-cell/2,cell/2,span/2])b.block(x,cy,z-.012,.06,.28,.024,'green');
  for(const x of [-cell,0,cell]){
   b.block(x,cy,z-.043,cell-.04,.24,.010,'dark');
   b.stamp(cell-.06,.22,.025,z,z-.035,(u,v,n)=>[x+u,cy+v,n],'green');
   for(const dx of [-.40,.40])b.block(x+dx,cy+.087,z-.004,.022,.022,.008,'metal');
  }
 }
 return b.finish();
}
export function createFinalCutBodywork(body,audit){
 const material=createMachineFinishMaterial(),meshes=[],wingMeshes=[];
 return {addPart(spec){
  if(!['power-unit','hood','canopy'].includes(spec.id)&&!spec.id.startsWith('side-console-')&&!spec.id.startsWith('fender-'))return false;
  const mesh=new THREE.Mesh(housing(spec),material);mesh.name=`FinaleFormed-${spec.id}`;mesh.position.set(spec.side,spec.height,-spec.forward);body.add(mesh);audit(spec.id,mesh);meshes.push(mesh);return true;
 },addWingPart(spec,side,parent,id){
  if(!['deck','trim'].includes(spec.id))return false;
  const mesh=new THREE.Mesh(wingHousing({...spec,side:side*spec.side,height:spec.height,forward:spec.forward}),material);mesh.name=`FinaleFormed-${id}`;mesh.position.set(side*spec.side,spec.height,-spec.forward);parent.add(mesh);audit(id,mesh);wingMeshes.push(mesh);return true;
 },stats:()=>({parts:meshes.length,wingParts:wingMeshes.length,geometries:meshes.length+wingMeshes.length,triangles:[...meshes,...wingMeshes].reduce((n,m)=>n+m.geometry.index.count/3,0),materials:1}),dispose(){material.dispose();}};
}

