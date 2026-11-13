import {buildUtilityArt} from './chase-utility-art.js';
import {garageHoldRatio} from './chase-garage.js';
import {STAFF_CART_BODY} from './staff-cart-layout.js';
// Authored course vignettes. All substantial new scenery stays beyond the
// visible boundary fence; the existing driving/navigation geometry is intact.
export function buildCourseStoryArt({THREE,box,put,cylinder,pitchedRoof,batchVehicleParts,scene,COURSE,materials,pinePlacements}){
 // Keep tree trunks/crowns out of the new buildings while retaining the same
 // tree count and templates behind the authored clearings.
 const clearings=[[45,163,9],[-46,91,9],[45,475,15],[-46,542,15],[-45,746,35]];
 for(const p of pinePlacements)if(clearings.some(([x,y,d])=>Math.abs(p.x-x)<9&&Math.abs(-p.z-y)<d+4))p.x=Math.sign(p.x)*56;
 function bench(x,z){for(const y of [.48,.64])box('weatherboard',x,y,z,2.1,.1,.48);for(const s of [-1,1])box('iron',x+s*.8,.28,z,.08,.5,.36);for(const y of [.87,1.08])box('weatherboard',x,y,z+.24,2.1,.13,.06);}
 function derelictCart(x,z,turn=0){
  const group=new THREE.Group();group.position.set(x,0,z);group.rotation.y=turn;scene.add(group);
  const b=STAFF_CART_BODY;box('paint',b.x,b.y,b.z,b.width,b.height,b.depth,0,group);box('seat',0,.95,.28,1.2,.2,.65,0,group);box('seat',0,1.2,.55,1.2,.55,.12,0,group);
  for(const s of [-1,1]){for(const dz of [-.7,.7]){const w=put(cylinder,'rubber',s*.72,.3,dz,.3,.2,.3,0,group);w.rotation.z=Math.PI/2;}for(const dz of [-.7,.8])box('iron',s*.64,1.4,dz,.05,1.55,.05,0,group);}
  box('paint',0,2.16,.12,1.75,.09,2.05,0,group);box('rust',0,.75,-.91,.8,.06,.38,0,group);
  // Bake the vignette back through the same spatial batches as all scenery.
  group.updateMatrixWorld(true);for(const m of group.children){const g=m.geometry.clone();g.applyMatrix4(m.matrixWorld);const type=Object.keys(materials).find(k=>materials[k]===m.material);put(g,type,0,0,0);g.dispose();}scene.remove(group);
 }
 // Closed maintenance bays: carts docked beneath awnings, supplies on racks,
 // drainage channels and numbered-looking enamel plaques, not loose junk.
 for(const [x,y]of [[45,163],[-46,91]]){
  box('masonry',x,.08,-y,7,.16,13);box('weatherboard',x,1.6,-y-3.6,5,3.2,.25);pitchedRoof(x,-y,6,9,3.4,.6);
  for(const dx of [-2.6,2.6])box('wood',x+dx,1.7,-y+3.7,.18,3.4,.18);
  box('lamp',x,3.12,-y+3.4,.7,.08,.12);
  derelictCart(x-1.2,-y+1.7,0);derelictCart(x+1.2,-y-1.5,0);
  bench(x+1,-y+6.4);
  box('weatherboard',x,1.05,-y-5.7,4.2,2.1,.35);box('roof',x,2.2,-y-5.7,4.5,.13,1.6);
  for(const dx of [-1.8,1.8])box('iron',x+dx,.7,-y-6.1,.08,1.4,.7);
  for(const h of [.35,1.05])box('iron',x,h,-y-6.1,3.7,.07,.7);
  const pipe=new THREE.CylinderGeometry(.13,.13,3.2,8);pipe.rotateZ(Math.PI/2);for(let i=0;i<3;i++)put(pipe,'iron',x,1.23,-y-5.85-i*.22);pipe.dispose();
  for(const dx of [-2.5,0,2.5])box('paint',x+dx,.17,-y,.035,.008,7);
  box('iron',x,.17,-y+4.7,5.5,.015,.24);for(let i=0;i<10;i++)box('stone',x-2.4+i*.53,.181,-y+4.7,.06,.008,.25);
  for(const side of [-1,1]){box('paint',x+side*1.2,2.75,-y-3.45,.3,.18,.03);box('iron',x+side*1.2,2.75,-y-3.42,.035,.12,.015);}
 }
 // A recognizable night range: weathered tee huts and sparse support cables
 // instead of a costly alpha-blended net. Dark target rings sit on the ground.
 for(const [x,y]of [[45,475],[-46,542]]){
  box('masonry',x,.06,-y,6,.12,20);pitchedRoof(x,-y,5,21,3.6,.4);
  for(let i=0;i<4;i++){const z=-y-7.5+i*5;box('wood',x,1,z,4,.1,.1);box('wood',x+2,1.8,z,.14,3.6,.14);box('wood',x-2,1.8,z,.14,3.6,.14);box('rubber',x,.14,z+1.8,2.7,.04,2);put(cylinder,'iron',x+1,.4,z+2.3,.2,.45,.2);}
  for(const dy of [-14,14])box('iron',x,4.5,-y+dy,.12,9,.12);
  for(const h of [4,6,8])box('iron',x,h,-y,.025,.025,28);
  for(let i=0;i<3;i++){const ring=new THREE.TorusGeometry(1.2+i*.48,.025,3,20);ring.rotateX(Math.PI/2);put(ring,'paint',x+Math.sign(x)*5,.045,-y+3);ring.dispose();}
 }
 // An abandoned members' terrace: tables still set and chairs left at angles.
 // Warm windows above it deliberately offer no human response.
 const tx=-45,tz=-735;box('masonry',tx,.12,tz,7,.24,25);
 for(let i=0;i<4;i++){const z=tz-9+i*6;put(cylinder,'iron',tx,.62,z,.06,1.2,.06);put(cylinder,'weatherboard',tx,1.22,z,1.02,.1,1.02);
  for(const side of [-1,1]){box('weatherboard',tx+side*1.45,.62,z,.65,.12,.7,0);box('weatherboard',tx+side*1.72,1.02,z,.08,.8,.7,0);for(const dz of [-.25,.25])box('iron',tx+side*1.45,.35,z+dz,.07,.6,.06);}
  put(cylinder,'paint',tx+.35,1.35,z,.07,.16,.07);box('paint',tx-.3,1.29,z+.12,.34,.012,.26,.3);
 }
 bench(-44,-765);derelictCart(-45,-777,0);
 // Relay stations live on the existing shelter posts and overhead truss.
 // The cart drives through the induction loop; stopping for the log is optional.
 const utilityArt=buildUtilityArt({THREE,box,put,batchVehicleParts,scene});
 const relays=[];
 for(const [i,c]of COURSE.checkpoints.entries()){
  for(const side of [-1,1]){box('brass',c.x+side*2.5,.035,-c.y,.06,.025,7);box('iron',c.x+side*3.7,2,-c.y-4,.24,.8,.24);box('paint',c.x+side*3.7,1.82,-c.y-3.86,.18,.3,.015);for(let n=0;n<4;n++)box('iron',c.x+side*3.7,1.9-n*.04,-c.y-3.845,.13,.014,.008);}
  for(const dy of [-3.5,3.5])box('brass',c.x,.035,-c.y+dy,5,.025,.06);
  // Indicators attach to the posts; leave overhead clearance for Joe's cage.
  box('iron',c.x-3.7,2.95,-c.y+4,.26,.36,.22);for(let n=0;n<=i;n++)box('brass',c.x-3.7-.05*i+n*.1,2.95,-c.y+4.13,.045,.23,.035);
  const off=new THREE.Group(),on=new THREE.Group(),log=new THREE.Group(),charge=new THREE.Group();scene.add(off,on,log,charge);
  for(const side of [-1,1]){box('lamp',c.x+side*3.7,2.67,-c.y+4.15,.26,.19,.06,0,off);box('sheen',c.x+side*3.7,2.67,-c.y+4.15,.26,.19,.06,0,on);}
  box('lamp',c.x+3.7,2.45,-c.y-3.85,.13,.1,.03,0,log);
  // A segmented battery meter on the existing post shows the finite charger
  // supply. One shared-material draw per shelter, no textures or point lights.
  box('iron',c.x+3.7,1.6,-c.y-3.84,.42,.84,.12);
  box('brass',c.x+3.7,2.06,-c.y-3.84,.14,.06,.1);
  for(let n=0;n<5;n++)box('lamp',c.x+3.7,1.28+n*.13,-c.y-3.77,.28,.08,.025,0,charge);
  for(const group of [off,on,log,charge])batchVehicleParts(group);
  const meter=charge.children.find(o=>o.isMesh);relays.push({off,on,log,charge,meter,barIndices:meter.geometry.index.count/5});
 }
 // Two circuit lamps repeat the relay language on the entrance jambs. The
 // back-wall meter fills only while the player actually operates the release.
 // One merged unlit mesh; static housing/parking paint join existing batches.
 const garage=new THREE.Group();scene.add(garage);
 for(let relay=0;relay<2;relay++)for(const x of [-28.43,-17.57]){
  const y=2.2+relay*.5;box('iron',x,y,-799.42,.44,.35,.15);box('lamp',x,y,-799.32,.25,.16,.025,0,garage);
  for(let n=0;n<=relay;n++)box('brass',x-.06*relay+n*.12,y-.11,-799.32,.04,.045,.025);
 }
 box('iron',-23,2.35,-813.42,2.65,.48,.12);
 for(let i=0;i<8;i++){const x=-24.08+i*.31;box('paint',x,2.35,-813.34,.24,.28,.03);box('lamp',x,2.35,-813.31,.18,.19,.025,0,garage);}
 for(const x of [-26.7,-19.3])box('paint',x,.102,-807,.06,.009,8);
 box('paint',-23,.102,-811,7.45,.009,.06);
 batchVehicleParts(garage);const meter=garage.children.find(o=>o.isMesh),segmentIndices=meter.geometry.index.count/12;let circuits=0,holdBars=0;
 return {update(run,reducedMotion=false){utilityArt.update(run,reducedMotion);for(let i=0;i<relays.length;i++){const r=relays[i],done=(run.checkpoint||0)>i;r.off.visible=!done;r.on.visible=done;r.log.visible=!(run.story?.collected&(1<<i));const remaining=run.service?.remaining[i]??(run.story?.collected&(1<<i)?0:25);r.meter.geometry.setDrawRange(0,Math.ceil(remaining/5)*r.barIndices);r.charge.visible=remaining>0;}circuits=Math.max(0,Math.min(2,run.checkpoint||0));holdBars=circuits===2?Math.floor(garageHoldRatio(run)*8):0;meter.geometry.setDrawRange(0,(circuits*2+holdBars)*segmentIndices);},stats:()=>({utility:utilityArt.stats(),chargeBars:relays.map(r=>r.meter.geometry.drawRange.count/r.barIndices),garage:{circuits,holdBars}}),count:relays.length};
}
