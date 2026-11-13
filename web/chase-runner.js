import {createFootContactEvents} from './foot-contact-events.js';
import {createRunnerGait} from './runner-gait.js';
import {ejectionPose,ejectionBalance} from './runner-drama.js';
import * as THREE from './vendor/three/three.module.js';
import {mergeIndexedGeometries} from './indexed-geometry.js';
import {runnerMaterials} from './runner-materials.js';
const smooth=t=>t*t*(3-2*t);
function soleHeight(hip,knee,side,lean,roll,ankle=0){
 const a=hip+knee+ankle,ca=Math.cos(a),sa=Math.sin(a),cl=Math.cos(lean),sl=Math.sin(lean),cr=Math.cos(roll),sr=Math.sin(roll),hy=.88-.4*Math.cos(hip)-.37*Math.cos(hip+knee),hz=-.4*Math.sin(hip)-.37*Math.sin(hip+knee);
 const cy=cr*Math.cos(a+lean),cz=-cr*Math.sin(a+lean);
 const center=(y,z)=>side*.112*sr+cr*((hy+y*ca-z*sa)*cl-(hz+y*sa+z*ca)*sl);
 // Support bounds of the rounded boot and its rectangular sole under the
 // complete hip/knee/torso rotation, including the toe and heel corners.
 const boot=center(0,-.055)-Math.hypot(.087*sr,.075*cy,.16*cz);
 const sole=center(-.055,-.04)-Math.abs(.075*sr)-Math.abs(.0125*cy)-Math.abs(.125*cz);
 return Math.min(boot,sole);
}

// Shares the cart driver's palette and prepared materials. Rigid limb batches
// keep the escape readable without another model download or skeleton shader.
export function createChaseRunner(scene,materials,groundHeight=null){
 const finish=runnerMaterials(materials);materials=finish.materials;
 const root=new THREE.Group(),body=new THREE.Group();root.add(body);scene.add(root);
 const round=new THREE.IcosahedronGeometry(1,2),fine=new THREE.IcosahedronGeometry(1,1),box=new THREE.BoxGeometry(1,1,1);
 // Tapered connected sleeves/trousers replace the stacked oval segments.
 const garment=(rings,depth)=>{const g=new THREE.LatheGeometry(rings.map(([r,y])=>new THREE.Vector2(r,y)),12);g.scale(1,1,depth);const p=g.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i),a=Math.atan2(p.getZ(i)/depth,p.getX(i)),r=Math.hypot(p.getX(i),p.getZ(i)/depth);if(r>.02){const fold=1+.025*Math.sin(y*53+a*2);p.setX(i,p.getX(i)*fold);p.setZ(i,p.getZ(i)*fold);}}g.computeVertexNormals();return g;};
 const sleeve=garment([[0,-.31],[.066,-.31],[.076,-.25],[.079,-.14],[.09,-.055],[.092,.015],[.06,.055],[0,.055]],1.05);
 const forearm=garment([[0,-.255],[.058,-.255],[.063,-.19],[.071,-.09],[.072,.025],[0,.025]],1.05);
 const thigh=garment([[0,-.415],[.077,-.415],[.086,-.3],[.1,-.13],[.108,.025],[0,.025]],1.1);
 const shin=garment([[0,-.365],[.064,-.365],[.069,-.26],[.081,-.12],[.078,.025],[0,.025]],1.06);
 function part(parent,x,y,z,shapes,name=''){
  const group=new THREE.Group();group.position.set(x,y,z);parent.add(group);const batches=new Map(),transform=new THREE.Object3D();
  group.name=name;
  for(const [type,geometry,px,py,pz,sx,sy,sz,rx=0,ry=0,rz=0]of shapes){const g=geometry.clone();transform.position.set(px,py,pz);transform.scale.set(sx,sy,sz);transform.rotation.set(rx,ry,rz);transform.updateMatrix();g.applyMatrix4(transform.matrix);if(!batches.has(type))batches.set(type,[]);batches.get(type).push(g);}
  for(const [type,list]of batches){group.add(new THREE.Mesh(mergeIndexedGeometries(list),materials[type]));list.forEach(g=>g.dispose());}return group;
 }
 const shirtProfile=[[0,-.23],[.17,-.23],[.18,-.2],[.185,-.17],[.181,-.12],[.178,-.07],[.18,-.04],[.187,.0],[.2,.05],[.21,.10],[.219,.16],[.23,.23],[.22,.26],[.202,.29],[.15,.32],[.085,.34],[0,.34]];
 const shirt=new THREE.LatheGeometry(shirtProfile.map(([r,y])=>new THREE.Vector2(r,y)),24);shirt.scale(1,1,.69);
 const clothPositions=shirt.attributes.position;for(let i=0;i<clothPositions.count;i++){const y=clothPositions.getY(i),x=clothPositions.getX(i),z=clothPositions.getZ(i),a=Math.atan2(z/.69,x),weight=Math.max(0,1-Math.abs(y-.01)/.31),fold=1+weight*(.024*Math.sin(y*45+a*3)+.012*Math.sin(y*79-a*2));clothPositions.setX(i,x*fold);clothPositions.setZ(i,z*fold);}shirt.computeVertexNormals();
 const torsoShapes=[['cloth',shirt,0,0,0,1,1,1],['paint',box,-.105,.19,-.149,.065,.042,.009],['cloth',box,.1,.13,-.151,.085,.088,.014],['cloth',fine,.1,.175,-.16,.046,.018,.012],['iron',box,0,-.2,0,.35,.045,.24],['brass',box,0,-.2,-.13,.045,.03,.014],['skin',round,0,.35,0,.073,.10,.075]];
 // Belt loops and placket sit over a continuous folded cloth surface.
 for(const side of [-1,1]){
  torsoShapes.push(['cloth',box,side*.119,-.19,-.129,.022,.075,.012]);
 }
 torsoShapes.push(['cloth',box,0,.04,-.143,.018,.36,.013]);
 for(const y of [-.11,-.02,.07,.16,.25])torsoShapes.push(['iron',fine,0,y,-.155,.006,.006,.005]);
 const torso=part(body,0,1.08,0,torsoShapes,'work-shirt');
 const collar=new THREE.BufferGeometry();collar.setAttribute('position',new THREE.Float32BufferAttribute([-.11,.035,0,-.02,.01,-.025,-.05,-.07,-.025,.11,.035,0,.05,-.07,-.025,.02,.01,-.025],3));collar.setAttribute('uv',new THREE.Float32BufferAttribute([0,1,1,1,1,0,0,1,1,0,1,1],2));collar.setIndex([0,1,2,3,4,5]);collar.computeVertexNormals();
 part(torso,0,.29,-.14,[['paint',collar,0,0,0,1,1,1],['cloth',box,0,-.15,-.035,.018,.3,.012]]);
 const portrait=new THREE.PlaneGeometry(.205,.235,6,8);portrait.rotateY(Math.PI);
 // Let the painted features follow the cheek/forehead volume rather than
 // hovering on a flat rectangular plate across the face.
 const facePositions=portrait.attributes.position;for(let i=0;i<facePositions.count;i++){const x=facePositions.getX(i),y=facePositions.getY(i)-.035;facePositions.setZ(i,.137-.142*Math.sqrt(Math.max(.04,1-(x/.146)**2-(y/.194)**2))-.003);}portrait.computeVertexNormals();
 const headShapes=[['skin',round,0,.008,.012,.14,.182,.131],['skin',round,0,-.1,-.028,.105,.077,.102],['skin',round,0,-.127,-.065,.074,.027,.052],['face',portrait,0,-.035,-.137,1,1,1],['skin',round,0,-.014,-.139,.015,.034,.019],['skin',fine,0,-.042,-.157,.019,.016,.018],['hair',round,0,.104,.035,.145,.112,.13],['hair',round,0,.025,.102,.124,.113,.048]];
 for(const side of [-1,1]){
  headShapes.push(['skin',round,side*.139,-.018,.008,.024,.047,.027],['skin',fine,side*.151,-.016,-.012,.009,.028,.012],['hair',fine,side*.122,.033,.025,.023,.071,.08],['hair',fine,side*.129,-.015,-.021,.012,.04,.02]);
 }
 // Overlapping, swept locks and a broken hairline replace a smooth cap.
 for(let i=0;i<7;i++){const x=-.106+i*.034;headShapes.push(['hair',round,x,.116+(i<3?.018:0),-.037,.043,.046,.077,0,.18,-.27],['hair',fine,x,.079+Math.sin(i)*.008,-.106,.022,.025,.013,0,0,-.24]);}
 const head=part(body,0,1.61,0,headShapes,'head');
 const arms=[],legs=[],elbows=[],knees=[],ankles=[];
 for(const side of [-1,1]){
  const arm=part(body,side*.224,1.32,0,[['cloth',sleeve,0,0,0,1,1,1],['cloth',round,0,-.015,.008,.086,.082,.089]],'upper-sleeve');arms.push(arm);
  const hand=[['cloth',forearm,0,0,0,1,1,1],['cloth',round,0,-.24,0,.066,.023,.065],['skin',round,0,-.295,-.008,.045,.064,.043],['skin',round,-side*.043,-.285,-.025,.022,.039,.025,0,0,-side*.3]];
  for(let f=0;f<4;f++)hand.push(['skin',fine,-.028+f*.018,-.334,-.028,.011,.027,.016],['skin',fine,-.028+f*.018,-.307,-.047,.011,.014,.01]);
  elbows.push(part(arm,0,-.28,0,hand,'cuff-hand'));
  const leg=part(body,side*.112,.88,0,[['trousers',thigh,0,0,0,1,1,1],['trousers',box,side*.077,-.15,-.025,.017,.135,.085],['trousers',fine,side*.083,-.08,-.025,.018,.023,.052]],'trousers');legs.push(leg);
  const boot=[['trousers',shin,0,0,.005,1,1,1],['rubber',round,0,-.37,-.055,.087,.075,.16],['rubber',round,0,-.3,0,.072,.067,.07],['rubber',box,0,-.425,-.04,.15,.025,.25],['rubber',fine,0,-.38,-.163,.072,.042,.039]];
  for(let n=0;n<4;n++)boot.push(['iron',box,0,-.322-n*.007,-.043-n*.025,.065,.004,.007,0,0,(n%2?1:-1)*.11]);
  for(const x of [-.065,.065])for(let n=0;n<4;n++)boot.push(['rubber',box,x,-.422,.037-n*.05,.024,.021,.024]);
  const knee=part(leg,0,-.4,0,boot.filter(shape=>shape[0]==='trousers'),'boot-shin');knees.push(knee);
  ankles.push(part(knee,0,-.37,0,boot.filter(shape=>shape[0]!=='trousers').map(shape=>{const copy=shape.slice();copy[3]+=.37;return copy;}),'boot'));
 }
 // Bake the seated pose during preparation, merging by material. Running
 // needs independent joints; driving can show identical detail in nine draws.
 const seatedRoot=new THREE.Group(),seatBatches=new Map();root.position.set(-.36,.38,.2);body.rotation.x=-.12;head.rotation.x=.10;
 for(let i=0;i<2;i++){legs[i].rotation.set(1.48,0,0);knees[i].rotation.set(-1.48,0,0);arms[i].rotation.set(.67,0,(i?1:-1)*.02);elbows[i].rotation.set(.26,0,0);}
 root.updateMatrixWorld(true);root.traverse(m=>{if(!m.isMesh)return;const g=m.geometry.clone().applyMatrix4(m.matrixWorld);if(!seatBatches.has(m.material))seatBatches.set(m.material,[]);seatBatches.get(m.material).push(g);});
 for(const [material,list]of seatBatches){seatedRoot.add(new THREE.Mesh(mergeIndexedGeometries(list),material));list.forEach(g=>g.dispose());}scene.add(seatedRoot);seatedRoot.visible=false;
 root.position.set(0,0,0);body.rotation.set(0,0,0);head.rotation.set(0,0,0);for(const limb of [...legs,...knees,...arms,...elbows])limb.rotation.set(0,0,0);
 const footContacts=createFootContactEvents(),contactFeet=[{x:0,y:0,height:0},{x:0,y:0,height:0}];
 const gait=createRunnerGait(groundHeight),target=new THREE.Vector3(),inverseBody=new THREE.Quaternion(),soleRotation=new THREE.Quaternion(),pitchRotation=new THREE.Quaternion(),soleEuler=new THREE.Euler();
 const deathParts=[];root.traverse(m=>{if(m.isMesh)deathParts.push({mesh:m,positions:m.geometry.attributes.position.array});});
 const deathAxis=new THREE.Vector3(),ejectPose={},ejectBalance={};
 let supportedDeath=null,supportAge=-1,supportLift=0,supportChecks=0;let phase=0,blend=0,facing=null,ejectionPhase='none',posedFoot=null,poseTurn=0;root.visible=false;
 return {root,body,seated(parent,cart,reduced,time){
  if(seatedRoot.parent!==parent)parent.add(seatedRoot);seatedRoot.visible=true;seatedRoot.rotation.z=reduced?0:-(cart.steer||0)*.012;root.visible=false;
 },drainContacts:()=>footContacts.drain(),stats:()=>({footsteps:footContacts.stats(),phase:ejectionPhase,facing,strideBlend:blend,knees:knees.map(k=>k.rotation.x),elbows:elbows.map(e=>e.rotation.x),footing:gait.pose.feet.map(f=>({...f})),gaitPhase:phase,deathSupportChecks:supportChecks}),update(foot,dt,reduced,death=null,time=0){
  ejectionPhase='none';
  seatedRoot.visible=false;
  root.visible=!!foot;if(!foot){phase=0;blend=0;facing=null;gait.reset();footContacts.reset();return;}
  if(root.parent!==scene)scene.add(root);
  if(posedFoot!==foot){facing=null;posedFoot=foot;poseTurn=0;}
  const heading=foot.moveYaw??foot.yaw,turn=facing===null?0:Math.atan2(Math.sin(heading-facing),Math.cos(heading-facing));facing=facing===null?heading:facing+turn*(1-Math.exp(-dt*24));
  if(dt>0)poseTurn=turn;
  // Absorb sharp changes in the torso while keeping the feet pointed within
  // fifteen degrees of real travel, including diagonal fence slides.
  if(foot.speed>.1){const error=Math.atan2(Math.sin(heading-facing),Math.cos(heading-facing));facing=heading-Math.max(-Math.PI/12,Math.min(Math.PI/12,error));}
  root.position.set(foot.x,0,-foot.y);root.rotation.set(0,-facing,0);body.position.set(0,0,0);body.rotation.set(0,0,0);head.rotation.set(0,0,0);torso.rotation.y=0;
  for(let i=0;i<2;i++){ankles[i].rotation.set(0,0,0);knees[i].rotation.set(0,0,0);elbows[i].rotation.set(.18,0,0);}
  if(death){
   footContacts.reset();
   const age=reduced?1.2:death.age,t=Math.max(0,Math.min(1,(age-.06)/.6)),fall=t*t*(3-2*t),slide=Math.min(.55,Math.max(0,age)*.7);
   // Preserve the runner's facing. A frontal strike knocks them backward;
   // a side strike tips them sideways instead of swivelling their whole body
   // into the mower's heading while they fall.
   const start=death.startYaw??death.yaw,delta=death.yaw-start,side=Math.sin(delta),forward=Math.cos(delta),lateral=Math.abs(side);
   root.rotation.y=-start;deathAxis.set(-forward,0,-side);body.quaternion.setFromAxisAngle(deathAxis,Math.PI*.5*fall);
   body.position.set(side*slide,0,-forward*slide);
   const rest=smooth(Math.max(0,Math.min(1,(age-.66)/.45))),flinch=reduced?0:Math.sin(Math.min(1,age/.3)*Math.PI)*(.22+(death.strength??.7)*.12);
   head.rotation.x=(.14*fall-flinch)*forward;head.rotation.z=.12*fall-flinch*side;
   for(let i=0;i<2;i++){
    const sign=i?1:-1,groundSide=sign*side>0,tuck=groundSide?1-lateral:1;
    legs[i].rotation.set(.06*fall*forward*(1-rest),0,sign*.16*fall*tuck*(1-rest*.6));
    const relaxedArm=sign*(.35*(1-lateral)-(groundSide?0:.65*lateral));
    arms[i].rotation.set((-.65*fall-flinch*1.8)*forward*(1-rest),0,sign*(.55*fall+flinch)*tuck*(1-rest)+relaxedArm*rest);
    knees[i].rotation.x=-.22*Math.sin(t*Math.PI);elbows[i].rotation.x=.18*(1-rest)+.65*Math.sin(t*Math.PI);
   }
   // Ground the actual rigid limb geometry. Only the short changing fall
   // needs a scan; repeated renders, pause and the settled aftermath reuse it.
   // No geometry rebuild, GPU upload or per-frame temporary objects.
   const groundedAge=Math.min(1.11,age);
   if(supportedDeath!==death||supportAge!==groundedAge){
    supportedDeath=death;supportAge=groundedAge;root.updateMatrixWorld(true);let floor=Infinity;
    for(const part of deathParts){const e=part.mesh.matrixWorld.elements,p=part.positions,a=e[1],b=e[5],c=e[9],d=e[13];for(let i=0;i<p.length;i+=3){const y=a*p[i]+b*p[i+1]+c*p[i+2]+d;if(y<floor)floor=y;}}
    supportLift=.015-floor;supportChecks++;
   }
   body.position.y=supportLift;
   return;
  }
  const gaitPose=gait.update(foot,time,facing);blend=gaitPose.blend;phase=gaitPose.phase;
  body.rotation.x=-blend*.09;body.rotation.z=reduced?0:-Math.max(-.045,Math.min(.045,poseTurn*.08))*blend;
  body.position.y=gaitPose.hipHeight-.88*Math.cos(body.rotation.x);
  torso.rotation.y=Math.sin(phase)*blend*.045;head.rotation.x=blend*.045;head.rotation.y=Math.max(-.5,Math.min(.5,Math.atan2(Math.sin((foot.viewYaw??foot.yaw)-facing),Math.cos((foot.viewYaw??foot.yaw)-facing))))*.5;
  inverseBody.copy(body.quaternion).invert();
  for(let i=0;i<2;i++){
   const sign=i?1:-1,f=gaitPose.feet[i];
   target.set(f.x,f.y,f.z).sub(body.position).applyQuaternion(inverseBody).sub(legs[i].position);
   // Analytic two-link solve, including lateral placement on a turn. The boot
   // gets its own pivot but retains its original two material draws.
   const reach=Math.min(.7699,Math.max(.031,target.length()));
   const knee=-Math.acos(Math.max(-1,Math.min(1,(reach*reach-.4*.4-.37*.37)/(2*.4*.37))));
   const along=.4+.37*Math.cos(knee),side=Math.asin(Math.max(-.9,Math.min(.9,target.x/along)));
   const hip=Math.atan2(-target.z,-target.y)+Math.atan2(-.37*Math.sin(knee),along*Math.cos(side));
   legs[i].rotation.set(hip,0,side);knees[i].rotation.x=knee;
   soleRotation.copy(body.quaternion).multiply(legs[i].quaternion).multiply(knees[i].quaternion).invert();
   pitchRotation.setFromEuler(soleEuler.set(f.pitch,0,f.roll||0));ankles[i].quaternion.copy(soleRotation).multiply(pitchRotation);
   const armSwing=Math.max(-1,Math.min(1,f.z/.39))*blend;
   arms[i].rotation.set(armSwing*.5+.12*blend,0,sign*.035);elbows[i].rotation.x=.18+blend*.85+Math.max(0,armSwing)*.12;
  }
  const strideHeight=body.position.y;
  const e=foot.ejection,age=e?Math.max(0,time-e.at):99;
  if(e&&!reduced&&age<1.18){
   const p=ejectionPose(age,ejectPose),balance=ejectionBalance(age,ejectBalance),recover=smooth(Math.max(0,Math.min(1,(age-.86)/.32)));
   ejectionPhase=p.phase;
   root.position.x+=(e.seatX-e.x)*(1-p.travel);root.position.z-=(e.seatY-e.y)*(1-p.travel);
   root.position.y=p.height+Math.sin(p.travel*Math.PI)*Math.min(1,(e.incomingSpeed||0)/14)*.12;
   const turn=Math.atan2(Math.sin(foot.yaw-e.yaw),Math.cos(foot.yaw-e.yaw));root.rotation.y=-(e.yaw+turn*p.travel);
   body.rotation.x=p.tilt*(1-recover)+body.rotation.x*recover;body.rotation.z=e.side*p.roll;
   head.rotation.x=.10*(1-p.travel)-.12*Math.sin(p.travel*Math.PI);head.rotation.z=-e.side*p.roll*.24;
   torso.rotation.y=-e.side*(balance.air*.10+balance.plant*.06);
   let floor=Infinity;
   for(let i=0;i<2;i++){const sign=i?1:-1,leading=sign===-e.side;
    // The outside leg catches the landing; the other trails and then steps
    // through. One arm reaches to brace while the other guards the torso.
    const hipOffset=(leading?.18:-.18)*balance.air+(leading?.30:-.18)*balance.plant;
    const kneeOffset=(leading?-.22:.22)*balance.air+(leading?-.28:.22)*balance.plant;
    legs[i].rotation.set(p.hip*(1-recover)+legs[i].rotation.x*recover+hipOffset,0,sign*p.roll*.12);
    knees[i].rotation.x=p.knee*(1-recover)+knees[i].rotation.x*recover+kneeOffset;
    ankles[i].quaternion.slerpQuaternions(pitchRotation.identity(),ankles[i].quaternion,recover);
    arms[i].rotation.set(p.arm*(1-recover)+arms[i].rotation.x*recover+(leading?.22:-.12)*balance.air+(leading?1:.25)*balance.plant,0,sign*(.02+p.roll));
    elbows[i].rotation.x=p.elbow*(1-recover)+elbows[i].rotation.x*recover+(leading?-.20:.22)*balance.air+(leading?-.5:.2)*balance.plant;
    floor=Math.min(floor,soleHeight(legs[i].rotation.x,knees[i].rotation.x,sign,body.rotation.x,body.rotation.z,ankles[i].rotation.x));
   }
   // Exact seated origin on release; bend the legs to absorb the landing,
   // keeping the sole above the terrain before blending back to the stride.
   body.position.y=Math.max(strideHeight*recover,.012-floor-root.position.y)*p.travel;
  }

  const cos=Math.cos(facing),sin=Math.sin(facing);
  for(let i=0;i<2;i++){const f=gaitPose.feet[i],c=contactFeet[i];c.x=foot.x+cos*f.x-sin*f.z;c.y=foot.y-sin*f.x-cos*f.z;c.height=f.lift;}
  footContacts.update({owner:foot,time,body:foot,feet:contactFeet,enabled:age>=1.18,phase:foot.speed>.05?'run':gaitPose.turning>.1?'turn':'settle'});

 },dispose(){round.dispose();fine.dispose();box.dispose();portrait.dispose();shirt.dispose();collar.dispose();for(const g of [sleeve,forearm,thigh,shin])g.dispose();finish.dispose();root.traverse(o=>o.geometry?.dispose());seatedRoot.traverse(o=>o.geometry?.dispose());seatedRoot.removeFromParent();root.removeFromParent();}};
}
