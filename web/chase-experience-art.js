import * as THREE from './vendor/three/three.module.js';
import {terrainHeight} from './course-terrain.js';
import {TACTIC_STATIONS,EXIT_RELEASE} from './chase-tactics.js';

export function createExperienceArt({scene,materials,box,put,cylinder,batchVehicleParts}){
 const controls=[];
 const stations=[...TACTIC_STATIONS,{...EXIT_RELEASE,kind:'exit'}];
 for(const [i,s]of stations.entries()){
  const root=new THREE.Group();root.position.set(s.x+(s.kind==='exit'?-4:2.6),terrainHeight(s.x+(s.kind==='exit'?-4:2.6),s.y),-s.y);scene.add(root);
  box('iron',0,.62,0,.12,1.24,.12,0,root);box('mower',0,1.3,0,.72,.65,.32,0,root);
  box('brass',0,1.66,.05,.8,.06,.36,0,root);box('iron',0,1.35,.18,.52,.35,.025,0,root);
  // Molded pipe runs / brake cable connect the control to its purpose.
  for(const side of [-1,1]){put(cylinder,'rust',side*.18,.47,0,.055,.94,.055,0,root);box('iron',side*.27,1.56,.18,.045,.045,.035,0,root);}
  box('iron',0,1.8,-.04,.075,.7,.075,0,root);
  batchVehicleParts(root);
  const wheel=new THREE.Group();wheel.position.set(0,1.28,.25);root.add(wheel);
  const ring=new THREE.TorusGeometry(.23,.035,5,12);const rim=new THREE.Mesh(ring,materials.brass);wheel.add(rim);
  for(const a of [0,Math.PI/2]){const spoke=new THREE.Mesh(new THREE.BoxGeometry(.4,.035,.035),materials.brass);spoke.rotation.z=a;wheel.add(spoke);}
  const meter=new THREE.Group();meter.position.set(-.3,1.76,.18);root.add(meter);
  const bars=[];for(let n=0;n<6;n++)bars.push(box('lamp',.12*n,0,0,.085,.065,.025,0,meter));
  box('iron',0,2.12,0,1.2,.5,.09,0,root);
  // One shared sign atlas, crisp nearest-neighbor pixel lettering.
  controls.push({root,wheel,bars,ground:root.position.y,kind:s.kind,index:i});batchVehicleParts(wheel);
 }
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const ctx=canvas.getContext('2d');
 ctx.fillStyle='#26352e';ctx.fillRect(0,0,512,256);ctx.font='bold 24px monospace';ctx.textAlign='center';ctx.fillStyle='#d2c49a';
 [['PRESSURE','RELEASE'],['CART BRAKE','RELEASE'],['SHUTTER','RELEASE']].forEach((words,i)=>{const x=(i%2)*256,y=Math.floor(i/2)*128;ctx.strokeStyle='#8d9279';ctx.lineWidth=4;ctx.strokeRect(x+8,y+8,240,112);words.forEach((t,n)=>ctx.fillText(t,x+128,y+52+n*34));});
 const texture=new THREE.CanvasTexture(canvas);texture.magFilter=texture.minFilter=THREE.NearestFilter;texture.colorSpace=THREE.SRGBColorSpace;
 const signMaterial=new THREE.MeshBasicMaterial({map:texture});
 for(const c of controls){const index=c.kind==='water'?0:c.kind==='cart'?1:2,g=new THREE.PlaneGeometry(1.12,.44),uv=g.attributes.uv;for(let n=0;n<uv.count;n++)uv.setXY(n,(uv.getX(n)+index%2)/2,(uv.getY(n)+(index<2?1:0))/2);const sign=new THREE.Mesh(g,signMaterial);sign.position.set(0,2.12,.051);c.root.add(sign);}
 const birdGeometry=new THREE.BoxGeometry(1,1,1),birds=new THREE.InstancedMesh(birdGeometry,materials.iron,36),debris=new THREE.InstancedMesh(birdGeometry,materials.leaf,24),dummy=new THREE.Object3D();birds.frustumCulled=debris.frustumCulled=false;scene.add(birds,debris);birds.count=debris.count=0;
 let birdsVisible=0,fragments=0;
 return {update(run,reduced=false){
  controls.forEach(c=>{const s=c.kind==='exit'?run.exitRelease:run.tactics,used=c.kind==='exit'?s?.released:!!(s?.used&(1<<c.index)),hold=c.kind==='exit'?(s?.hold||0)/1.3:s?.near===c.index?(s.hold||0)/.9:0;
   const brokenAt=c.kind==='exit'?null:s?.brokenAt?.[c.index],collapse=brokenAt!=null?(reduced?1:Math.min(1,(run.time-brokenAt)/.65)):0;c.root.position.y=c.ground-collapse*.12;c.root.rotation.x=collapse*1.48;
   c.wheel.rotation.z=-Math.PI*2*(used?1:hold);c.bars.forEach((b,i)=>{b.visible=used||i<Math.ceil(hold*6);});
  });
  const e=run.experience,b=e?.birds,age=b?run.time-b.at:99;birds.count=0;birdsVisible=0;
  if(!reduced&&age>=0&&age<3.8){for(let n=0;n<12;n++){const t=age+n*.025,x=b.x+(n%3-1)*1.2+t*(n%2?2:-2),y=b.y+(Math.floor(n/3)-1.5)*1.2+t*2,h=terrainHeight(b.x,b.y)+3+t*3.2;
   for(let k=0;k<3;k++){dummy.position.set(x+(k-1)*.22,h+(k===1?0:Math.sin(t*18+n)*.16),-y);dummy.rotation.set(0,0,k===1?0:(k-1)*Math.sin(t*18+n)*.6);dummy.scale.set(k===1?.13:.36,.055,k===1?.34:.17);dummy.updateMatrix();birds.setMatrixAt(birds.count++,dummy.matrix);}
  }birdsVisible=12;birds.instanceMatrix.needsUpdate=true;}
  const miss=e?.nearMiss,t=miss?run.time-miss.at:99;debris.count=0;
  if(!reduced&&t>=0&&t<.7){for(let n=0;n<24;n++){const x=miss.x+miss.side*(1.5-t*3)+(n%4-1.5)*.13,y=miss.y+Math.floor(n/4)*.23+t*2,h=terrainHeight(x,y)+.4+(.8+n%3)*t-3*t*t;dummy.position.set(x,Math.max(terrainHeight(x,y)+.05,h),-y);dummy.rotation.set(t*13,n,t*8);dummy.scale.set(.035,.12*(1-t/.7),.025);dummy.updateMatrix();debris.setMatrixAt(debris.count++,dummy.matrix);}debris.instanceMatrix.needsUpdate=true;}
  fragments=debris.count;birds.visible=birds.count>0;debris.visible=debris.count>0;
 },warm(){for(const mesh of [birds,debris]){mesh.visible=true;mesh.count=1;dummy.position.set(0,-10,0);dummy.updateMatrix();mesh.setMatrixAt(0,dummy.matrix);}},stats:()=>({controls:controls.length,birds:birdsVisible,nearMissFragments:fragments}),dispose(){texture.dispose();signMaterial.dispose();birdGeometry.dispose();birds.dispose();debris.dispose();}};
}
