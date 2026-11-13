import {addCourseFeatureCraft} from './chase-feature-craft.js';
import {terrainHeight} from './course-terrain.js';
import {isDestructibleFeature,featurePose} from './course-destruction-state.js';
// Authored solid landmarks, merged into the existing spatial/material batches.
// Shared pixel maps, opaque surfaces, no new lights, animation or draw loop.
export function buildCourseFeatures({THREE,COURSE,box:staticBox,put:staticPut,cylinder,sphere,circle,scene,batchVehicleParts}){
 const destructibles=[];let current=null;
 // Preserve the existing detailed models. Only crushable fixtures leave the
 // permanent spatial batches; three material-batched chunks can fold/scatter.
 function put(g,type,x,y,z,sx=1,sy=1,sz=1,ry=0){
  if(!current)return staticPut(g,type,x,y,z,sx,sy,sz,ry);
  const f=current.feature,index=x<f.x-f.rx*.25?0:x>f.x+f.rx*.25?2:1;
  return staticPut(g,type,x-f.x,y,z+f.y,sx,sy,sz,ry,current.chunks[index]);
 }
 const unit=new THREE.BoxGeometry(1,1,1),box=(type,x,y,z,w,h,d,ry=0)=>put(unit,type,x,y,z,w,h,d,ry);

 const tire=new THREE.CylinderGeometry(1,1,1,12);tire.rotateZ(Math.PI/2);
 const log=new THREE.CylinderGeometry(.72,1,1,9);log.rotateZ(Math.PI/2);
 const pipe=new THREE.CylinderGeometry(1,1,1,10,1,true);pipe.rotateX(Math.PI/2);
 const rim=new THREE.TorusGeometry(1,.09,4,12);rim.rotateY(Math.PI/2);
 for(const [index,f]of COURSE.features.entries()){
  current=null;
  if(isDestructibleFeature(f)){
   const chunks=Array.from({length:3},()=>{const g=new THREE.Group();g.position.set(f.x,0,-f.y);scene.add(g);return g;});
   current={feature:f,chunks};destructibles.push(current);
  }
  const x=f.x,z=-f.y;addCourseFeatureCraft({THREE,f,box,put,cylinder,sphere});
  if(!['service-fence','fallen-tree'].includes(f.kind))staticBox('road',x,.029,z,f.rx*2+.7,.02,f.ry*2+.7);
  if(f.kind==='service-fence'){
   // Low estate windbreaks belong to the course rather than a construction
   // site. Preserve the exact barrier/gap envelope used by both vehicle hulls.
   {
    box('masonry',x,.16,z,f.rx*2,.32,.35);box('leaf',x,.85,z,f.rx*2,1.35,.28);
    box('leaf',x,1.53,z,f.rx*2-.15,.16,.24);
    for(const side of [-1,1]){box('wood',x+side*(f.rx-.12),.9,z,.22,1.8,.3);box('brass',x+side*(f.rx-.12),1.54,z,.24,.13,.32);}
    continue;
   }
  }else if(f.kind==='parked-cart'){
   box('iron',x,.4,z,2.3,.2,3.6);box('paint',x,.76,z+1.18,2.24,.7,.9);box('paint',x,.69,z-1.25,2.24,.56,.65);
   box('seat',x,.87,z+.1,1.9,.22,.8);box('seat',x,1.15,z+.52,1.9,.62,.18);
   box('paint',x,2.02,z,2.5,.14,3.7);for(const side of [-1,1]){
    for(const dz of [-1.3,1.3]){box('iron',x+side*1.05,1.38,z+dz,.065,1.25,.065);put(tire,'rubber',x+side*1.08,.39,z+dz,.36,.4,.4);put(tire,'rust',x+side*1.25,.39,z+dz,.035,.18,.18);}
    box('iron',x+side*.7,.82,z-1.59,.25,.13,.025);box('paint',x+side*1.13,.76,z+.9,.025,.2,.48);
   }
   box('rubber',x,.96,z-.67,1.85,.14,.37);
  }else if(f.kind==='trailer'){
   // Most former loose trailers become orderly grounds stores. Their visible
   // walls occupy the same solid footprint, so the branching lanes stay fair.
   if(f.id!=='reservoir-trailer'){
    box('masonry',x,.35,z,4.8,.7,6.2);box(f.id==='abandoned-repair'?'weatherboard':'stucco',x,1.6,z,4.7,2.2,6.1);
    for(const side of [-1,1]){box('iron',x+side*2.32,1.45,z,.1,2.5,6.12);box('weatherboard',x+side*2.34,2.8,z,.16,.18,6.25);}
    const roof=new THREE.BoxGeometry(5,.12,3.25);for(const side of [-1,1]){const g=roof.clone();g.rotateX(side*.16);put(g,'roof',x,3.03,z+side*1.55);g.dispose();}roof.dispose();
    box('iron',x,3.3,z,5,.1,.16);box('iron',x,1.42,z+3.065,2.7,2.2,.04);
    for(let n=0;n<7;n++)box('paint',x, .5+n*.29,z+3.094,2.55,.24,.015);
    box('brass',x+.8,1.36,z+3.12,.05,.27,.04);box('paint',x-1.75,2,z+3.1,.45,.24,.025);
    for(let n=0;n<3;n++)box('iron',x+2.39,2-n*.12,z-1.6,.025,.045,.8);
    // A common architectural kit ties the stores back to the clubhouse.
    for(const side of [-1,1]){box('stone',x+side*2.2,1.53,z+3.08,.18,2.35,.16);box('iron',x+side*2.4,2.86,z,.09,.09,6.3);box('iron',x+side*2.38,1.47,z-2.8,.075,2.75,.075);}
    box('iron',x-2.36,1.8,z-.65,.04,1,1.3);box('wet',x-2.39,1.8,z-.65,.025,.8,1.1);box('paint',x-2.41,1.8,z-.65,.025,.84,.055);box('stone',x-2.43,1.27,z-.65,.18,.1,1.4);
    continue;
   }
   box('iron',x,.72,z,4.6,.28,5.2);box('weatherboard',x,.92,z,4.3,.18,5.1);
   for(const side of [-1,1]){
    for(const dz of [-1.6,1.6]){put(tire,'rubber',x+side*2.18,.52,z+dz,.46,.52,.52);put(tire,'iron',x+side*2.43,.52,z+dz,.025,.27,.27);put(tire,'rust',x+side*2.45,.52,z+dz,.035,.11,.11);}
    for(let n=0;n<3;n++)box('weatherboard',x+side*2.13,1.22+n*.3,z,.12,.25,5.05);
    for(const dz of [-2.4,0,2.4])box('rust',x+side*2.21,1.48,z+dz,.08,1.25,.12);
    box('iron',x+side*1.5,.5,z, .12,.18,5.3);
   }
   for(const dz of [-2.48,2.48]){for(let n=0;n<3;n++)box('weatherboard',x,1.22+n*.3,z+dz,4.3,.25,.12);for(const dx of [-1.7,1.7])box('rust',x+dx,1.45,z+dz,.12,1.2,.08);}
   box('iron',x,.67,z+2.85,.2,.16,.7);put(cylinder,'iron',x,.38,z+3,.1,.62,.1);
   // Secured, aligned turf rolls: a working grounds crew's trailer, not debris.
   for(let n=0;n<3;n++){const roll=new THREE.CylinderGeometry(.3,.3,3.4,10);roll.rotateZ(Math.PI/2);put(roll,'leaf',x,1.35,z-.8+n*.8);roll.dispose();}
   for(const side of [-1,1])box('rubber',x+side*1.4,1.65,z,.06,.035,3.2);
   for(const side of [-1,1]){box('red',x+side*1.8,1.06,z+2.57,.24,.15,.035);box('brass',x+side*2.22,1.7,z-1.9,.025,.16,.32);}
  }else if(f.kind==='fallen-tree'){
   if(f.id!=='clubhouse-fall'){
    // Formal low planting strips define lanes without repeated storm wreckage.
    box('masonry',x,.23,z,9.9,.46,1.9);box('rough',x,.47,z,9.5,.025,1.65);
    for(let i=0;i<8;i++)put(sphere,'leaf',x-4.2+i*1.2,.92,z,.83,.66,.83);
    for(const side of [-1,1])box('stone',x,.5,z+side*.94,10,.08,.13);
    continue;
   }
   put(log,'wood',x,.58,z,9.6,.5,.5);put(tire,'weatherboard',x-4.81,.58,z,.025,.45,.45);
   for(let n=0;n<9;n++)box('iron',x-4+n,.75,z-.27,.06,.045,.2,.13*n);
   for(const side of [-1,1]){put(sphere,'wood',x+side*2.7,.48,z+side*.42,.7,.25,.42);put(sphere,'leaf',x+side*3.7,.48,z+side*.38,.8,.4,.55);}
   // Snapped branch shafts stay within the visible/log collision envelope.
   for(let n=0;n<4;n++){const branch=new THREE.CylinderGeometry(.025,.1,.8,6);branch.rotateZ(.8*(n%2?1:-1));put(branch,'wood',x-2+n*1.4,.98,z+(n%2?.3:-.3));branch.dispose();}
  }else{
   box('masonry',x,.18,z,6,.36,9);box('wet',x,.4,z,5.2,.035,7.8);
   for(const side of [-1,1]){box('masonry',x+side*2.8,.7,z,.4,1,9);box('stone',x+side*2.8,1.24,z,.44,.1,9);box('masonry',x,.7,z+side*4.3,5.6,1,.4);}
   for(let n=0;n<6;n++)box('iron',x-2.2+n*.86,1.24,z-2.9,.075,.08,2.3);
   for(let n=0;n<6;n++)box('sheen',x-1.8+n*.7,.425,z+.6+(n%3)*.45,.32,.008,.035);
   put(pipe,'rust',x+1.8,1.45,z-1.7,.34,.34,.9);put(pipe,'iron',x+1.8,1.45,z-.7,.32,.32,.6);
   box('iron',x-2.3,1.6,z+3.6,.12,1.3,.12);put(rim,'rust',x-2.3,1.9,z+3.6,.32,.32,.32);
   box('rust',x-2.9,.95,z+2,.055,.4,.8);box('brass',x-2.94,.95,z+2,.025,.22,.45);
  }
 }
 current=null;
 for(const d of destructibles)for(const chunk of d.chunks)batchVehicleParts(chunk);unit.dispose();
 // One deliberate damaged patch foreshadows Joe; the rest of the estate is kept.
 for(const d of COURSE.decisions.filter(d=>d.id==='service-approach')){const x=d.wide.x+5,z=-d.entry.y+4;
  for(const side of [-1,1]){box('wet',x+side*.7,.046,z,.18,.008,5.4,.12);box('wood',x+side*.9,.12,z-1.3,.12,.12,1.1,side*.65);}
  box('wood',x,.09,z-2,.1,.1,2.1,.55);box('rust',x+.3,.13,z-1.1,.16,.05,.09);
 }
 tire.dispose();log.dispose();pipe.dispose();rim.dispose();
 let broken=0;
 return {count:COURSE.features.length,update(run,reduced=false){
  broken=0;
  for(const {feature:source,chunks} of destructibles){
   const f=featurePose(run,source);
   const s=run.destruction?.features?.[f.id],active=s?.brokenAt!=null,t=active?(reduced?1:Math.min(1,Math.max(0,(run.time-s.brokenAt)/.7))):0,e=t*t*(3-2*t);if(active)broken++;
   chunks.forEach((g,i)=>{const side=i-1;g.position.set(f.x+e*(s?.dx||0)*(s?.power||0)*1.4+side*e*.35,terrainHeight(f.x,f.y)+.025*e,-f.y-e*(s?.dy||0)*(s?.power||0)*1.4);g.scale.set(1+e*.08,1-e*.94,1+e*.06);g.rotation.set(0,side*e*.18,0);});
  }
 },stats:()=>({total:destructibles.length,broken})};
}
