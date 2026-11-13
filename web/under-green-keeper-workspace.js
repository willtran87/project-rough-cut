import * as THREE from './vendor/three/three.module.js';
import {KEEPER_NICHES,nichePoint} from './under-green-keeper-layout.js';
import {createKeeperArt} from './under-green-keeper-art.js';

export function buildKeeperWorkspace({materials,box,put,cyl,lamps}){
 const art=createKeeperArt();
 materials.keeperWood=new THREE.MeshPhongMaterial({map:art.maps.wood,color:0xbcb4a0,specular:0x3c402e,shininess:7});materials.keeperWood.userData.drainWorldUV=true;
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
 box('keeperEndgrain',desk.along,.49,-front-.012,desk.width-.1,.98,.01);
 for(const [x,width]of [[9.91,.82],[10.89,.92],[12.02,1.16],[13.13,.84]]){
  for(const h of [.25,.57,.85]){
   box('keeperWood',x,h,-front-.025,width,.235,.012);
   box('machineIron',x,h+.035,-front-.037,.19,.024,.012);
   for(const dx of [-.07,.07])put(cyl,'machineRust',x+dx,h+.035,-front-.045,.013,.008,.013,Math.PI/2);
  }
 }
 const top=new THREE.Shape();[[9.53,front],[13.77,front],[13.77,10.97],[13.59,10.89],[13.62,10.61],[9.53,10.61]].forEach(([x,y],i)=>i?top.lineTo(x,y):top.moveTo(x,y));top.closePath();
 const slab=new THREE.ExtrudeGeometry(top,{depth:.07,bevelEnabled:false,steps:1});slab.rotateX(-Math.PI/2);put(slab,'keeperWood',0,.985,0);slab.dispose();
 box('keeperEndgrain',11.65,1.02,-front,4.24,.07,.016);
 // Exposed splinters at the back-right break explain the damaged counter.
 for(let i=0;i<5;i++)box('keeperEndgrain',13.61+i*.027,1.02,-10.88-i*.019,.016,.045,.09);
 // Dry records stand on a metal tray, well above the old flood mark.
 box('machineIron',11.82,1.067,-11.02,.87,.025,.52);
 for(const side of [-1,1])box('machineRust',11.82+side*.43,1.085,-11.02,.018,.055,.52);
 box('keeperBook',11.78,1.107,-11.02,.65,.055,.41);
 for(let i=0;i<5;i++)box('keeperPaper',11.78+(i%2)*.004,1.136+i*.004,-11.02,.62,.002,.385);
 const log=new THREE.PlaneGeometry(.62,.385);put(log,'keeperLog',11.782,1.155,-11.02,1,1,1,-Math.PI/2,0,Math.PI);log.dispose();
 // Loose ledger leaves, bent at one corner instead of hovering flat.
 const page=new THREE.PlaneGeometry(.43,.3,8,5),position=page.attributes.position;
 for(let i=0;i<position.count;i++){const x=position.getX(i),y=position.getY(i);position.setZ(i,Math.max(0,(x-.10)*.2)*Math.max(0,(y+.15)/.3));}page.computeVertexNormals();
 put(page,'keeperLog',10.75,1.06,-10.99,1,1,1,-Math.PI/2,0,Math.PI-.14);page.dispose();
 box('keeperBook',12.92,1.13,-10.85,.34,.15,.24);
 for(let i=0;i<3;i++)box('keeperPaper',12.92,1.08+i*.047,-10.845,.32,.008,.23);
 const pencil=new THREE.CylinderGeometry(.006,.006,.19,6);put(pencil,'keeperEndgrain',11.2,1.066,-11.16,1,1,1,Math.PI/2,0,.3);pencil.dispose();
 // The old course plan is mounted on the actual recessed back wall.
 const plan=new THREE.PlaneGeometry(2.5,1.25);put(plan,'keeperPlan',11.57,2.14,-(desk.boundary-desk.depth+.008),1,1,1,0,Math.PI);plan.dispose();
 for(const x of [10.28,12.86])box('keeperWood',x,2.14,-10.61,.075,1.4,.04);
 for(const h of [1.465,2.815])box('keeperWood',11.57,h,-10.61,2.65,.075,.04);
 for(const x of [10.31,12.83])for(const h of [1.49,2.79]){
  box('machineIron',x,h,-10.641,.105,.035,.012);box('machineIron',x,h,-10.641,.035,.105,.012);
 }
 // The small task light faces into the room; its visible lens and dynamic
 // light share the position, color and flicker through the normal lamp path.
 lamps.push({x:9.87,y:10.77,height:2.65,lensOffset:-.18,facing:-1,color:0xe9b575,power:.6});
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
 return {niches:KEEPER_NICHES.map(n=>({...n})),desk:{x:11.65,y:11.02,height:1.055,recordsHeight:1.155},plan:{x:11.57,y:10.578,height:2.14,width:2.5},bootRack:{x:6.83,y:14.1,height:.945,emptySlots:6},toolRack:{x:16.855,y:13.2,height:1.68,missing:'grass-scythe',remaining:'rake'},art:art.sizes,maximumTrimIntrusion:.19,addedColliders:0,dispose(){art.dispose();owned.forEach(m=>m.dispose());}};
}
