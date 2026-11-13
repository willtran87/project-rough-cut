import { practiceStatus } from './station-feedback.js';
import * as THREE from './vendor/three/three.module.js';

// Fixed physical signs: two opaque batches, one small nearest-filtered atlas.
// No lights, particles, animation, navigation input or through-wall overlays.
const LETTERS={
 M:['10001','11011','10101','10101','10001','10001','10001'],
 A:['01110','10001','10001','11111','10001','10001','10001'],B:['11110','10001','10001','11110','10001','10001','11110'],C:['01111','10000','10000','10000','10000','10000','01111'],D:['11110','10001','10001','10001','10001','10001','11110'],E:['11111','10000','10000','11110','10000','10000','11111'],F:['11111','10000','10000','11110','10000','10000','10000'],G:['01111','10000','10000','10111','10001','10001','01111'],H:['10001','10001','10001','11111','10001','10001','10001'],I:['11111','00100','00100','00100','00100','00100','11111'],K:['10001','10010','10100','11000','10100','10010','10001'],L:['10000','10000','10000','10000','10000','10000','11111'],N:['10001','11001','11001','10101','10011','10011','10001'],O:['01110','10001','10001','10001','10001','10001','01110'],P:['11110','10001','10001','11110','10000','10000','10000'],Q:['01110','10001','10001','10001','10101','10010','01101'],R:['11110','10001','10001','11110','10100','10010','10001'],S:['01111','10000','10000','01110','00001','00001','11110'],T:['11111','00100','00100','00100','00100','00100','00100'],U:['10001','10001','10001','10001','10001','10001','01110'],V:['10001','10001','10001','10001','10001','01010','00100'],W:['10001','10001','10001','10101','10101','10101','01010'],X:['10001','10001','01010','00100','01010','10001','10001'],Y:['10001','10001','01010','00100','00100','00100','00100'],
 '1':['00100','01100','00100','00100','00100','00100','01110'],'2':['01110','10001','00001','00010','00100','01000','11111'],'3':['11110','00001','00001','01110','00001','00001','11110']
};
const IDS=['audit-bell','field-log','release-review','shed-key','sprinkler'];
const NAMES=[['AUDIT','BELL'],['FIELD','LOG'],['RELEASE','REVIEW'],['SHED','KEY'],['DRAIN','VALVE']];
const ATLAS_WIDTH=960,ATLAS_HEIGHT=672;
export function exitCueState(frame){
 const checks=IDS.slice(0,3).filter(id=>(frame.completed||[]).includes(id)).length;
 return ['shed','drain'].map(route=>{
  const access=route==='shed'?!!frame.hasKey:!!frame.valveOpen,ready=checks===3&&access;
  const phase=ready&&frame.exitRoute===route&&frame.sealing?'opening':ready&&frame.exitRoute===route&&frame.exitFiling?'filing':ready?'ready':!access?(checks===3?'access':'locked'):'checks';
  return {route,checks,access,ready,phase,cell:15+(route==='drain'?6:0)+['locked','access','checks','ready','filing','opening'].indexOf(phase)};
 });
}
export function objectiveCueState(completed=[],hasKey=false,valveOpen=false){
 const done=IDS.map((id,i)=>i<3?completed.includes(id):i===3?hasKey:valveOpen),next=done.slice(0,3).findIndex(v=>!v);
 return IDS.map((id,i)=>({id,done:done[i],next:i===next||(next===-1&&!hasKey&&!valveOpen&&i>=3)}));
}
export function createObjectiveCues(parent,data,{scale,xScale}){
 const canvas=document.createElement('canvas');canvas.width=ATLAS_WIDTH;canvas.height=ATLAS_HEIGHT;const g=canvas.getContext('2d');
 function text(value,x,y,size,color){g.fillStyle=color;for(const [n,ch]of [...value].entries())for(const [row,line]of (LETTERS[ch]||[]).entries())for(let col=0;col<5;col++)if(line[col]==='1')g.fillRect(x+n*6*size+col*size,y+row*size,size,size);}
 for(let row=0;row<3;row++)for(let i=0;i<5;i++){
  const x=i*192,y=row*96,done=row===1,ink=done?'#99af91':'#d4bc83';g.fillStyle='#1b2b26';g.fillRect(x,y,192,96);
  for(let k=0;k<160;k++){g.fillStyle=k%2?'#24352d':'#17251f';g.fillRect(x+(k*71)%192,y+(k*43)%96,2,1);}
  g.strokeStyle=done?'#526b58':'#9c8759';g.lineWidth=2;g.strokeRect(x+5,y+5,182,86);
  g.fillStyle='#3c4530';g.fillRect(x+13,y+16,38,56);
  if(done){g.fillStyle=ink;for(let j=0;j<4;j++)g.fillRect(x+19+j*4,y+44+j*4,5,5);for(let j=0;j<6;j++)g.fillRect(x+31+j*3,y+56-j*5,4,5);}
  else if(i<3)text(String(i+1),x+21,y+26,4,ink);
  else if(i===3){g.strokeStyle=ink;g.lineWidth=4;g.strokeRect(x+22,y+26,16,14);g.fillStyle=ink;g.fillRect(x+28,y+40,5,23);g.fillRect(x+32,y+52,9,4);g.fillRect(x+32,y+60,9,4);}
  else {g.strokeStyle=ink;g.lineWidth=4;g.strokeRect(x+21,y+31,23,24);g.fillStyle=ink;g.fillRect(x+30,y+24,5,38);g.fillRect(x+16,y+40,33,5);}
  text(NAMES[i][0],x+64,y+21,2,ink);text(NAMES[i][1],x+64,y+43,2,ink);
  text(done?(i<3?'FILED':i===3?'TAKEN':'OPEN'):row===2?'THIS WAY':i<3?'FIELD CHECK':'EXIT ACCESS',x+64,y+74,1,ink);
  if(row===2&&i<3){const left=i===1;g.fillStyle=ink;g.fillRect(x+153,y+60,24,4);for(let k=0;k<5;k++)g.fillRect(x+(left?150+k*3:178-k*3),y+60-k*3,4,4);for(let k=0;k<5;k++)g.fillRect(x+(left?150+k*3:178-k*3),y+60+k*3,4,4);}
 }
 // Both exits have explicit prerequisites and commitment states. The wording
 // says ready to file, never safe from Joe; no control binding is baked in.
 for(let route=0;route<2;route++)for(let phase=0;phase<6;phase++){
  const cell=15+route*6+phase,x=cell%5*192,y=Math.floor(cell/5)*96,ready=phase>=3,ink=ready?'#d5d3a1':'#bba77f';
  g.fillStyle='#182b25';g.fillRect(x,y,192,96);for(let k=0;k<160;k++){g.fillStyle=k%2?'#22352c':'#15241e';g.fillRect(x+(k*71)%192,y+(k*43)%96,2,1);}
  g.strokeStyle=ready?'#a1ac7f':'#75674c';g.lineWidth=2;g.strokeRect(x+5,y+5,182,86);
  g.fillStyle=ready?'#3d5037':'#493c2a';g.fillRect(x+13,y+17,38,55);g.fillStyle=ink;
  if(ready){g.fillRect(x+21,y+25,4,39);g.fillRect(x+21,y+25,23,4);g.fillRect(x+40,y+25,4,39);g.fillRect(x+29,y+43,20,4);for(let j=0;j<4;j++){g.fillRect(x+45-j*3,y+43-j*3,4,4);g.fillRect(x+45-j*3,y+43+j*3,4,4);}}
  else {g.fillRect(x+21,y+39,24,22);g.strokeStyle=ink;g.lineWidth=4;g.strokeRect(x+26,y+26,14,18);g.fillStyle='#493c2a';g.fillRect(x+31,y+45,4,9);}
  text(route?'DRAIN EXIT':'SHED EXIT',x+64,y+19,2,ink);
  const status=['LOCKED',route?'VALVE':'NEED KEY','CHECKS','READY','FILING','OPENING'][phase];
  const detail=[route?'3 CHECKS AND VALVE':'3 CHECKS AND KEY',route?'OPEN THE DRAIN VALVE':'FIND THE SHED KEY','FINISH ALL 3 CHECKS','USE AND STAY STILL','STAY STILL TO FILE','RELEASE GRANTED'][phase];
  text(status,x+64,y+45,2,ink);text(detail,x+14,y+80,1,ink);
 }
 // Five cells distinguish optional supplies and the shot-only practice target.
 for(let phase=0;phase<5;phase++){
  const cell=27+phase,x=cell%5*192,y=Math.floor(cell/5)*96,done=phase===1||phase>=3,ink=done?'#8b9c89':'#c7ba8c';
  g.fillStyle='#1b2b26';g.fillRect(x,y,192,96);g.strokeStyle=done?'#516354':'#8e825d';g.lineWidth=2;g.strokeRect(x+5,y+5,182,86);
  for(let k=0;k<100;k++){g.fillStyle=k%2?'#24352d':'#17251f';g.fillRect(x+k*71%192,y+k*43%96,2,1);}
  g.strokeStyle=ink;g.lineWidth=3;
  if(phase<2){g.strokeRect(x+16,y+26,33,34);g.fillStyle=ink;g.fillRect(x+20,y+37,25,3);g.fillRect(x+29,y+48,9,3);}
  else {for(const radius of [17,9])g.strokeRect(x+33-radius,y+44-radius,radius*2,radius*2);g.fillStyle=ink;g.fillRect(x+30,y+41,6,6);}
  text(phase<2?'SUPPLY':'PRACTICE',x+64,y+19,2,ink);
  text(['READY','CLAIMED','CHIP','COMPLETE','CLOSED'][phase],x+64,y+43,2,ink);
  text(['USE FOR BALL','SUPPLIES CLAIMED','LAND BALL IN RING','PRACTICE FINISHED','LESSON SKIPPED'][phase],x+14,y+70,1,ink);
  text(phase===0?'CROUCH FOR BLACKOUT':phase===1?'ONE USE PER SHIFT':phase>=3?'FOLLOW PATH TO AUDIT':'HOLD CHIP AND RELEASE',x+14,y+82,1,ink);
 }
 // Early approach sign names the required destination before the optional
 // practice ring. Its arrow follows the existing northbound lantern path.
 {const x=2*192,y=6*96,ink='#e2d1a1';g.fillStyle='#1b2b26';g.fillRect(x,y,192,96);
  g.strokeStyle='#9c8759';g.lineWidth=2;g.strokeRect(x+5,y+5,182,86);
  text('1',x+17,y+18,4,ink);text('AUDIT',x+55,y+17,3,ink);text('BELL',x+55,y+43,3,ink);
  text('FOLLOW LANTERNS',x+16,y+77,1,ink);
  g.fillStyle=ink;g.fillRect(x+166,y+36,4,27);for(let k=0;k<5;k++){g.fillRect(x+166-k*3,y+36+k*3,4,4);g.fillRect(x+166+k*3,y+36+k*3,4,4);}
 }
 const atlas=new THREE.CanvasTexture(canvas);atlas.colorSpace=THREE.SRGBColorSpace;atlas.magFilter=atlas.minFilter=THREE.NearestFilter;atlas.generateMipmaps=false;
 const root=new THREE.Group();root.name='ObjectiveWayfinding';root.visible=false;parent.add(root);
 const entries=data.actions.map((a,i)=>({id:a.id,index:i,x:a.x,z:a.y,y:i===0?3.15:2.85,yaw:i===0?-Math.PI/2:0,junction:false}));
 entries.push({id:'shed-key',index:3,x:data.key.x,z:data.key.y,y:2.32,yaw:Math.PI/2,junction:false},{id:'sprinkler',index:4,x:data.valve.x,z:data.valve.y,y:2.32,yaw:Math.PI/2,junction:false});
 // Beside the authored path turns, outside the walking lane. Arrows describe
 // the existing connected approaches, not straight-line routes through cover.
 for(const [i,x,z]of [[0,-9,123],[1,9,350],[2,-9,565]])entries.push({id:IDS[i],index:i,x,z,y:1.7,junction:true});
 entries.push({id:'audit-approach',index:0,x:-22,z:40,y:1.55,junction:true,approach:true});
 // Drain header sits above the hoist travel, keeping its moving gate and
 // suspension cables clear of the text. Neither header enters the approach.
 entries.push({id:'shed-exit',route:'shed',x:data.shed.x,z:data.shed.y-1.72/scale,y:2.82,boardScale:1.3,exit:true},
  {id:'drain-exit',route:'drain',x:data.drain.x,z:data.drain.y+.12/scale,y:3.24,boardScale:1.15,exit:true});
 for(const a of data.reviews)entries.push({id:a.id,x:a.x,z:a.y,y:1.95,supply:true});
 entries.push({id:'practice-bell',x:data.practice.x,z:data.practice.y,y:1.95,practice:true});
 const bp=[],bc=[],sp=[],uv=[],sc=[],indices=[],boxGeo=new THREE.BoxGeometry(1,1,1).toNonIndexed(),color=new THREE.Color();
 function box(x,y,z,w,h,d,tint){color.setHex(tint);const a=boxGeo.attributes.position,n=boxGeo.attributes.normal;for(let i=0;i<a.count;i++){bp.push(x+a.getX(i)*w,y+a.getY(i)*h,z+a.getZ(i)*d);const shade=n.getY(i)>.5?1:n.getZ(i)>.5?.87:.62;bc.push(color.r*shade,color.g*shade,color.b*shade);}}
 for(const entry of entries){
  const x=entry.x*xScale,z=-entry.z*scale,y=entry.y,size=entry.boardScale||1;
  const bodyStart=bp.length;entry.bodyStart=bodyStart/3;
  box(x,y,z,1.68*size,.84*size,.10,0x4d5140);box(x,y+.44*size,z,1.78*size,.055,.18,0x6c6b51);
  // Station mast extends its existing left wooden upright; junction poles sit
  // off the path and do not introduce collision or navigation changes.
  if(entry.exit){for(const side of [-1,1]){
    if(entry.route==='shed')box(x+side*.70,2.82,z-.08,.065,.65,.14,0x596052);
    else box(x+side*.70,2.91,z-.08,.075,.55,.075,0x596052);
   }if(entry.route==='drain')box(x,2.76,z-.08,2.10,.065,.08,0x596052);
  }else box(x+(entry.junction?0:-.31),(y-.39)/2,z-.14,.075,y-.39,.075,0x596052);
  for(const side of [-1,1])box(x+side*.82*size,y,z+.058,.035,.81*size,.025,0x857b56);
  // Restrained steady amber slits distinguish this family from floor lanterns.
  entry.accentStart=bc.length/3;
  for(const side of [-1,1])box(x+side*.66*size,y+.48*size,z,.10,.07,.10,0xb69a60);
  if(entry.exit){
   if(entry.route==='shed')for(const side of [-1,1])for(let i=0;i<5;i++)box(x+side*1.02,.48+i*.36,z-.15,.045,.15,.025,0x647056);
   else for(let i=0;i<7;i++){const a=(i+.5)/7*Math.PI;box(x+Math.cos(a)*1.14,.12+Math.sin(a)*1.14,z+.16,.065,.065,.025,0x647056);}
   for(const side of [-1,1])for(let i=0;i<3;i++)box(x+side*.64,.035,z+.38+i*.38,.10,.025,.20,0x647056);
  }
  if(entry.practice){const radius=data.practice.radius*scale;for(let i=0;i<32;i++){const a=i*Math.PI/16;box(x+Math.cos(a)*radius,.035,z+Math.sin(a)*radius,.14,.025,.14,0xb69a60);}}
  entry.accentEnd=bc.length/3;
  entry.start=sp.length/3;
  entry.vertices=entry.junction?4:8;
  // Direction boards are front-only; repeating the same arrow on their back
  // would point toward the opposite world direction.
  for(const back of entry.junction?[false]:[false,true]){
   const start=sp.length/3;for(const [xx,yy]of [[-1,-1],[1,-1],[1,1],[-1,1]]){sp.push(x+xx*.81*size*(back?-1:1),y+yy*.405*size,z+(back?-.056:.056));uv.push(0,0);sc.push(1,1,1);}indices.push(start,start+1,start+2,start,start+2,start+3);
  }
  entry.bodyCount=bp.length/3-entry.bodyStart;
  // Face the actual authored approach: the Audit Bell is reached from the west,
  // and the two access mechanisms from the east. The reverse face also reads.
  const cosine=Math.cos(entry.yaw||0),sine=Math.sin(entry.yaw||0);
  for(const [array,start]of [[bp,bodyStart],[sp,entry.start*3]])for(let j=start;j<array.length;j+=3){const dx=array[j]-x,dz=array[j+2]-z;array[j]=x+dx*cosine+dz*sine;array[j+2]=z-dx*sine+dz*cosine;}
 }
 boxGeo.dispose();const bodyGeo=new THREE.BufferGeometry();bodyGeo.setAttribute('position',new THREE.Float32BufferAttribute(bp,3));bodyGeo.setAttribute('color',new THREE.Float32BufferAttribute(bc,3));bodyGeo.computeBoundingSphere();
 const bodies=new THREE.Mesh(bodyGeo,new THREE.MeshBasicMaterial({vertexColors:true}));root.add(bodies);
 const signGeo=new THREE.BufferGeometry();signGeo.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));signGeo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));signGeo.setAttribute('color',new THREE.Float32BufferAttribute(sc,3));signGeo.setIndex(indices);signGeo.computeBoundingSphere();
 const signs=new THREE.Mesh(signGeo,new THREE.MeshBasicMaterial({map:atlas,vertexColors:true}));root.add(signs);
 const approach=entries.find(e=>e.approach);
 let signature='',updates=0,state=[],exits=[],optional=[],clearNavigation=false;
 function update(frame){
  clearNavigation=frame.clearNavigation===true;
  root.visible=true;
  // The early physical sign belongs to the course. Extra route labels retain
  // their existing navigation preference; no additional mesh/material is needed.
  bodyGeo.setDrawRange(clearNavigation?0:approach.bodyStart,clearNavigation?Infinity:approach.bodyCount);
  signGeo.setDrawRange(clearNavigation?0:approach.start/4*6,clearNavigation?Infinity:6);
  const key=[frame.completed.join(','),!!frame.hasKey,!!frame.valveOpen,!!frame.exitFiling,!!frame.sealing,frame.exitRoute,(frame.reviews||[]).join(','),practiceStatus(frame)].join(':');if(key===signature)return;signature=key;updates++;
  state=objectiveCueState(frame.completed,frame.hasKey,frame.valveOpen);
  exits=exitCueState(frame);
  optional=entries.filter(e=>e.supply||e.practice).map(e=>{const phase=e.practice?practiceStatus(frame):(frame.reviews||[]).includes(e.id)?'claimed':'ready';return {id:e.id,phase,done:phase!=='ready',cell:e.practice?29+['ready','complete','closed'].indexOf(phase):phase==='claimed'?28:27};});
  for(const entry of entries){const status=entry.supply||entry.practice?optional.find(e=>e.id===entry.id):entry.exit?exits.find(e=>e.route===entry.route):state[entry.index];
   const cell=entry.approach&&!status.done?32:entry.exit||entry.supply||entry.practice?status.cell:(status.done?1:entry.junction?2:0)*5+entry.index,level=entry.exit?(status.ready?1:.7):status.done?.48:status.next?1:.68;
   for(let j=0;j<entry.vertices;j++){const corner=j%4,u=corner===1||corner===2?1:0,v=corner>=2?1:0;
    signGeo.attributes.uv.setXY(entry.start+j,(cell%5*192+1+u*190)/ATLAS_WIDTH,1-(Math.floor(cell/5)*96+1+(1-v)*94)/ATLAS_HEIGHT);
    signGeo.attributes.color.setXYZ(entry.start+j,level,level,level);
   }
   if(entry.exit||entry.practice){color.setHex((entry.exit?status.ready:!status.done)?0x969779:0x494334);for(let j=entry.accentStart;j<entry.accentEnd;j++)bodyGeo.attributes.color.setXYZ(j,color.r,color.g,color.b);}
  }
  signGeo.attributes.uv.needsUpdate=signGeo.attributes.color.needsUpdate=bodyGeo.attributes.color.needsUpdate=true;
 }
 update({completed:[],hasKey:false,valveOpen:false});
 return {update,stats:()=>({clearNavigation,visibleSigns:clearNavigation?entries.length:1,approachDraw:{body:bodyGeo.drawRange,sign:signGeo.drawRange},signs:entries.length,batches:2,atlas:[ATLAS_WIDTH,ATLAS_HEIGHT],updates,depthTest:signs.material.depthTest,depthWrite:signs.material.depthWrite,state,exits,optional,anchors:entries.map(e=>({id:e.id,x:e.x,y:e.z,height:e.y,junction:e.junction}))})};
}
