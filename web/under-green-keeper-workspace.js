import {drainLampProfile} from './under-green-lamp-direction.js';
import * as THREE from './vendor/three/three.module.js';
import {KEEPER_NICHES,nichePoint} from './under-green-keeper-layout.js';
import {createKeeperArt} from './under-green-keeper-art.js';
import {KEEPER_TIMBER_SPAN} from './under-green-keeper-timber.js';
import {buildKeeperStory} from './under-green-keeper-story.js';
import {buildKeeperCabinet} from './under-green-keeper-cabinet.js';

export function buildKeeperWorkspace({materials,box,put,cyl,lamps,keeperTimber}){
 const art=createKeeperArt(keeperTimber,materials.wood.map);
 materials.keeperWood=new THREE.MeshPhongMaterial({map:art.maps.wood,color:0xbcb4a0,specular:0x3c402e,shininess:7});materials.keeperWood.userData.drainWorldUV=true;
 materials.keeperWood.userData.drainUVMetres=KEEPER_TIMBER_SPAN;
 materials.keeperEndgrain=materials.keeperWood.clone();materials.keeperEndgrain.color.setHex(0x857a5e);materials.keeperEndgrain.userData.drainWorldUV=true;
 materials.keeperPaper=new THREE.MeshLambertMaterial({color:0xaaa58b});
 materials.keeperPlan=new THREE.MeshLambertMaterial({map:art.maps.plan,color:0xcac4a7});
 materials.keeperLog=new THREE.MeshLambertMaterial({map:art.maps.log,color:0xcac4a7});
 materials.keeperRack=new THREE.MeshLambertMaterial({map:art.maps.rack,color:0xb5b7a0});
 materials.keeperBook=new THREE.MeshLambertMaterial({color:0x394537});
 materials.keeperSole=new THREE.MeshLambertMaterial({map:art.maps.sole,color:0xb1a17f,transparent:true,opacity:.35,depthWrite:false});
 function localBox(n,type,u,h,depth,width,tall,thick){const p=nichePoint(n,u,h,depth);box(type,p.x,h,-p.y,n.axis==='x'?thick:width,tall,n.axis==='x'?width:thick);}
 for(const n of KEEPER_NICHES){
  const height=n.top-n.bottom,mid=(n.top+n.bottom)/2;
  localBox(n,'keeperStone',0,mid,-n.depth-.055,n.width+.22,height+.22,.11);
  for(const sign of [-1,1])localBox(n,'keeperStone',sign*(n.width/2+.055),mid,-n.depth/2,.11,height+.12,n.depth+.22);
  for(const h of [n.bottom-.035,n.top+.035])localBox(n,'keeperStone',0,h,-n.depth/2,n.width,.07,n.depth+.22);
  for(const sign of [-1,1])localBox(n,'keeperEndgrain',sign*(n.width/2-.025),mid,.085,.05,height,.05);
  for(const h of [n.bottom+.02,n.top-.025])localBox(n,'keeperEndgrain',0,h,.085,n.width,.05,.05);
 }
 const desk=KEEPER_NICHES[0],front=desk.boundary+.105;
 // A fitted cabinet desk closes the original wall face below the counter.
 // All depth and damaged corners extend into the recess, never into the route.
 const cabinet=buildKeeperCabinet({materials,box,put,desk});
 const top=new THREE.Shape();[[9.53,front],[13.77,front],[13.77,10.97],[13.59,10.89],[13.62,10.61],[9.53,10.61]].forEach(([x,y],i)=>i?top.lineTo(x,y):top.moveTo(x,y));top.closePath();
 const slab=new THREE.ExtrudeGeometry(top,{depth:.07,bevelEnabled:false,steps:1});slab.rotateX(-Math.PI/2);put(slab,'keeperWood',0,.985,0);slab.dispose();
 box('keeperEndgrain',11.65,1.02,-front,4.24,.07,.016);
 // Exposed splinters at the back-right break explain the damaged counter.
 for(let i=0;i<5;i++)box('keeperEndgrain',13.61+i*.027,1.02,-10.88-i*.019,.016,.045,.09);
 const story=buildKeeperStory({materials,box,put});
 // The old course plan is mounted on the actual recessed back wall.
 const plan=new THREE.PlaneGeometry(2.5,1.25);put(plan,'keeperPlan',11.57,2.14,-(desk.boundary-desk.depth+.008),1,1,1,0,Math.PI);plan.dispose();
 for(const x of [10.28,12.86])box('keeperWood',x,2.14,-10.61,.075,1.4,.04);
 for(const h of [1.465,2.815])box('keeperWood',11.57,h,-10.61,2.65,.075,.04);
 for(const x of [10.31,12.83])for(const h of [1.49,2.79]){
  box('machineIron',x,h,-10.641,.105,.035,.012);box('machineIron',x,h,-10.641,.035,.105,.012);
 }
 // The small task light faces into the room; its visible lens and dynamic
 // light share the position, color and flicker through the normal lamp path.
 lamps.push({...drainLampProfile('keeper-desk'),x:9.87,y:10.77,height:2.65,lensOffset:-.18,facing:-1});
 box('machineIron',9.87,2.65,-10.77,.46,.35,.21);
 put(cyl,'machineIron',9.87,2.965,-10.77,.02,.27,.02);
 box('machineIron',9.87,3.085,-10.77,.25,.035,.22);

 const boots=KEEPER_NICHES[1];
 for(const height of [.515,.945]){
  localBox(boots,'keeperWood',0,height,-.17,boots.width-.14,.055,.53);
  localBox(boots,'machineIron',0,height+.035,.072,boots.width-.13,.025,.025);
  for(const u of [-.72,0,.72]){
   for(const side of [-1,1]){
    // Pale protected sole-shaped patches and abandoned boot pegs show absence.
    const g=new THREE.PlaneGeometry(.13,.29),p=nichePoint(boots,u+side*.10,height+.029,-.18);
    put(g,'keeperSole',p.x,p.height,-p.y,1,1,1,-Math.PI/2,0,-Math.PI/2);g.dispose();
   }
  }
 }
 for(const u of [-.36,.36])localBox(boots,'keeperEndgrain',u,.91,-.17,.035,.9,.50);
 // Empty scythe outline and real hooks. A surviving rake gives scale to the
 // missing grass-cutting blade, without adding an interaction or announcement.
 const rack=new THREE.PlaneGeometry(1.48,2.22);put(rack,'keeperRack',16.855,1.68,-13.2,1,1,1,0,-Math.PI/2);rack.dispose();
 for(const y of [12.43,13.97])box('keeperWood',16.855,1.68,-y,.015,2.3,.045);
 for(const h of [.54,2.82])box('keeperWood',16.855,h,-13.2,.015,.045,1.58);
 for(const [y,h]of [[13.30,.99],[13.29,1.72],[13.24,2.42]]){
  box('machineIron',16.835,h,-y,.03,.045,.10);box('machineRust',16.815,h+.02,-y,.01,.08,.025);
 }
 put(cyl,'keeperEndgrain',16.85,1.63,-12.0,.022,1.78,.022);
 box('machineIron',16.85,.73,-12.0,.035,.09,.61);
 for(let i=0;i<8;i++)box('machineRust',16.85,.635,-11.74-i*.075,.025,.16,.018);
 box('machineIron',16.85,2.5,-12.0,.035,.055,.18);
 const owned=['keeperWood','keeperEndgrain','keeperPaper','keeperPlan','keeperLog','keeperRack','keeperBook','keeperSole'].map(n=>materials[n]);
 return {niches:KEEPER_NICHES.map(n=>({...n})),desk:{x:11.65,y:11.02,height:1.055,recordsHeight:1.111},cabinet,story,plan:{x:11.57,y:10.578,height:2.14,width:2.5},bootRack:{x:6.83,y:14.1,height:.945,emptySlots:6},toolRack:{x:16.855,y:13.2,height:1.68,missing:'grass-scythe',remaining:'rake'},art:art.sizes,timber:art.timber,maximumTrimIntrusion:.19,addedColliders:0,dispose(){cabinet.dispose();story.dispose();art.dispose();owned.forEach(m=>m.dispose());}};
}
