import {prepareDamageGeometry,deformDamageGeometry} from './damage-geometry.js';
import * as THREE from './vendor/three/three.module.js';
import {cartDamageStage} from './cart-condition.js';
import {cartMechanics} from './cart-mechanics.js';
export {cartDamageStage} from './cart-condition.js';

const clamp=v=>Math.max(0,Math.min(1,v));
const ease=v=>{v=clamp(v);return v*v*(3-2*v);};

// Cosmetic only: the chassis/wreck collision hull never changes. All geometry
// and breakaway assemblies exist before the loading gate uploads their buffers.
export function createCartDamage({body,driver,wheels,parts,wear=[]}){
 const meshes=[],restWheels=wheels.map(w=>w.position.clone()),scratch=new THREE.Vector3(),pieceMatrix=new THREE.Matrix4();
 const bounds=Object.fromEntries(Object.keys(parts).map(name=>[name,new THREE.Box3()]));
 const lamps=parts.hood.children.filter(m=>m.material?.isMeshBasicMaterial);
 const anchors={roof:new THREE.Vector3(0,2.46,.13),hood:new THREE.Vector3(0,.84,-.91),bumper:new THREE.Vector3(0,.43,-1.43),hatch:new THREE.Vector3(0,.64,1.44),frame:new THREE.Vector3(0,.7,0)};
 body.traverse(m=>{if(!m.isMesh||m.parent===driver)return;const g=m.geometry;
  meshes.push(prepareDamageGeometry(g));
  g.attributes.position.setUsage(THREE.DynamicDrawUsage);g.attributes.normal.setUsage(THREE.DynamicDrawUsage);
 });
 let severity=0,uploads=0,age=-1,settled=false,lastRun=null,fallbackFailure=null;
 function pose(name,x=0,y=0,z=0,rx=0,ry=0,rz=0,sy=1){
  const g=parts[name],a=anchors[name];g.rotation.set(rx,ry,rz);g.scale.set(1,sy,1);
  scratch.copy(a).multiply(g.scale).applyEuler(g.rotation);g.position.copy(a).sub(scratch);g.position.x+=x;g.position.y+=y;g.position.z+=z;
 }
 function deform(d){
  const dent=ease((d-.18)/.2),buckle=ease((d-.35)/.3),crush=ease((d-.7)/.3);
  for(const mesh of meshes)deformDamageGeometry(mesh,d,dent,buckle,crush);
  for(const [name,part] of Object.entries(parts)){bounds[name].makeEmpty();part.traverse(m=>{if(m.isMesh)bounds[name].union(m.geometry.boundingBox);});}
  for(const w of wear)w.group.visible=d>=w.threshold;
  uploads++;
 }
 const mechanicalScratch={};
 function update(run,reducedMotion=false,mechanics=cartMechanics(run,mechanicalScratch)){
  if(lastRun!==run){lastRun=run;fallbackFailure=null;}
  const health=Math.max(0,Math.min(100,run.cart.health??100)),d=1-health/100;
  if(d!==severity){severity=d;deform(d);}
  const failed=health===0,crush=failed?(run.wreck?.crush||0):0;body.scale.y=1-crush*.48;
  if(failed)fallbackFailure??=run.time;else fallbackFailure=null;
  age=failed?Math.max(0,run.time-(run.cart.failedAt??fallbackFailure)):-1;
  const t=failed?(reducedMotion?3.2:age):0,collapse=failed?ease((t-.12)/1.15):0;
  settled=failed&&t>=3.2;
  const hit=run.impact,ring=!reducedMotion&&hit?.damaged&&hit.age<1?Math.sin(hit.age*24)*Math.exp(-hit.age*5)*d:0;
  const motion=reducedMotion||failed?0:1,rattle=mechanics.panel*.024*motion,roofFlex=mechanics.roofFlex*.006*motion;
  const dent=ease((d-.18)/.2),buckle=ease((d-.35)/.25),battered=ease((d-.55)/.2),critical=ease((d-.75)/.25),live=1-collapse;
  pose('roof',collapse*.16,-collapse*.75-buckle*.15*live,-collapse*.1,-collapse*.38-buckle*.045*live+roofFlex,collapse*.05,-collapse*.05-battered*.115*live+ring*.016);
  pose('frame',0,0,0,-collapse*.3-buckle*.025*live,0,-collapse*.05-battered*.035*live,1-collapse*.58-buckle*.055*live);
  for(const lamp of lamps)lamp.visible=!failed||(!reducedMotion&&t<.55&&(t<.16||t>.3));
  const hood=failed?ease((t-.1)/.9):0;
  pose('hood',0,-hood*.48,-hood*.18,hood*.7+dent*.10*(1-hood)+critical*.22*(1-hood)+ring*.06+rattle*.6,0,-hood*.08-battered*.07*(1-hood));
  const bumper=failed?ease((t-.32)/1.05):0;
  pose('bumper',bumper*.17,-bumper*.25-dent*.055*(1-bumper),-bumper*.39,bumper*.6+battered*.12*(1-bumper),bumper*.17,bumper*.04+dent*.075*(1-bumper));
  // The loose rear battery cover shakes while driving, then tears free and
  // tumbles onto the road. Analytic motion settles once; no debris physics pool.
  const loose=ease((d-.3)/.7),drop=failed?clamp((t-.18)/1.15):0;
  const bounce=failed&&!reducedMotion?Math.max(0,Math.sin(drop*Math.PI*2))*.13*(1-drop):0;
  pose('hatch',drop*.23,-drop*.51+bounce,drop*.48-loose*.062*(1-drop),-loose*.8-drop*.89+rattle+ring*.07,drop*.12,drop*.14);
  wheels.forEach((w,i)=>{w.position.copy(restWheels[i]);w.rotation.y=0;w.rotation.z=0;if(crush){w.position.x+=Math.sign(w.position.x)*crush*.4;w.rotation.z=Math.sign(w.position.x)*crush*.8;}
   if(i===2){const fall=failed?ease((t-.25)/1.3):0;w.position.x+=fall*.31;w.position.y-=fall*.205;w.position.z-=fall*.24;w.rotation.x*=1-fall;w.rotation.z=d*.035+critical*.12*(1-fall)+fall*1.48+mechanics.wheelWobble*.012*motion;w.rotation.y=-d*.025+mechanics.wheelWobble*.008*motion;}
  });
  if(!failed){
   body.position.y-=d*.055;body.rotation.x+=d*.015;
   // Apply the envelope after suspension, steering AND impact are combined.
   // Clamping before impact let the roof swing through the solid cart hull.
   body.rotation.x=Math.max(-.028,Math.min(.028,body.rotation.x));
   body.rotation.z=Math.max(-.044,Math.min(.044,body.rotation.z));
  }
  if(failed){const shudder=reducedMotion||settled?0:Math.sin(t*45)*Math.exp(-t*4)*.035;
   body.position.y=-collapse*.12+shudder+crush*.07;body.rotation.x=collapse*.045;body.rotation.z=-collapse*.07;
   // Stop loose parts on the road, including body lean. Eight conservative
   // corners per assembly avoid runtime rigid bodies and below-ground debris.
   body.updateMatrix();
   for(const name of ['hood','bumper','hatch']){const g=parts[name],box=bounds[name];g.updateMatrix();pieceMatrix.multiplyMatrices(body.matrix,g.matrix);let bottom=Infinity;
    for(let i=0;i<8;i++){scratch.set(i&1?box.max.x:box.min.x,i&2?box.max.y:box.min.y,i&4?box.max.z:box.min.z).applyMatrix4(pieceMatrix);bottom=Math.min(bottom,scratch.y);}
    if(bottom<.025)g.position.y+=(.025-bottom)/body.matrix.elements[5];
   }
  }
 }
 return {update,stats:()=>({crush:lastRun?.wreck?.crush||0,severity:Number(severity.toFixed(3)),stage:cartDamageStage(Math.round((1-severity)*100)),wearLayers:wear.filter(w=>w.group.visible).length,failureAge:Number(age.toFixed(3)),settled,assemblies:Object.keys(parts).length,geometryUpdates:uploads})};
}
