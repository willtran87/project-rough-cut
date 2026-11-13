import * as THREE from './vendor/three/three.module.js';
import {SLUICE} from './under-green-course.js';
import {mergeIndexedGeometries} from './indexed-geometry.js';

// These are mechanical readings of the existing gate, not another closure clock.
export function keeperReleasePose(run){
 const travel=Math.max(0,Math.min(1,run.gate||0));
 return {travel,button:Math.min(1,travel/.12),latch:travel===1?1:Math.max(0,(travel-.9)/.1),secured:run.finished===true};
}

export function createKeeperRelease({scene,box,put,cyl,materials}){
 const root=new THREE.Group();root.name='keeper-release';root.position.set(SLUICE.x,0,-SLUICE.y);scene.add(root);
 const fixed=new THREE.Group();root.add(fixed);
 // A bolted foot, continuous post and cabinet replace the unsupported box.
 box('iron',0,.035,0,.45,.07,.55,fixed);
 box('iron',0,.38,0,.2,.62,.24,fixed);
 box('brass',0,.68,0,.27,.06,.31,fixed);
 box('machineIron',0,1.08,0,.45,.79,.51,fixed);
 box('rubber',0,1.08,-.259,.41,.69,.012,fixed);
 box('machinePaint',0,1.08,-.264,.39,.66,.018,fixed);
 for(const h of [.86,1.27])box('machineSteel',-.202,h,-.24,.027,.095,.045,fixed);
 for(const x of [-.212,.212])box('machineRust',x,.83,0,.014,.24,.42,fixed);
 box('brass',0,1.49,0,.35,.03,.42,fixed);
 for(const x of [-.16,.16])for(const z of [-.2,.2])put(cyl,'steel',x,.078,z,.024,.016,.024,0,0,0,fixed);
 for(const x of [-.16,.16])for(const h of [.82,1.34])put(cyl,'brass',x,h,-.28,.014,.015,.014,Math.PI/2,0,0,fixed);
 // A recessed gauge and sliding brass witness physically show gate travel.
 box('iron',.125,1.09,-.278,.032,.43,.008,fixed);
 put(cyl,'steel',.165,1.505,0,.025,.07,.025,0,0,0,fixed);
 root.updateMatrixWorld(true);
 const parts=new Map();
 for(const mesh of [...fixed.children]){
  if(!parts.has(mesh.material))parts.set(mesh.material,[]);
  const g=mesh.geometry.clone().applyMatrix4(mesh.matrix);
  if(mesh.material.userData.drainWorldUV){const span=mesh.material.userData.drainUVMetres||2,p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;for(let i=0;i<p.count;i++){const xx=Math.abs(n.getX(i)),yy=Math.abs(n.getY(i)),zz=Math.abs(n.getZ(i));uv.setXY(i,(xx>yy&&xx>zz?p.getZ(i):p.getX(i))/span,(yy>xx&&yy>zz?p.getZ(i):p.getY(i))/span);}}
  parts.get(mesh.material).push(g);fixed.remove(mesh);
 }
 for(const [material,pieces]of parts){
  const geometry=mergeIndexedGeometries(pieces),mesh=new THREE.Mesh(geometry,material);
  mesh.name='keeper-release-housing';fixed.add(mesh);pieces.forEach(g=>g.dispose());
 }
 const housingBounds=new THREE.Box3().setFromObject(fixed);
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=512;
 const ctx=canvas.getContext('2d');ctx.scale(2,2);ctx.fillStyle='#35463b';ctx.fillRect(0,0,128,256);
 ctx.strokeStyle='#7c8269';ctx.lineWidth=1;ctx.strokeRect(2,2,124,252);
 for(let i=0;i<38;i++){ctx.fillStyle=i%3?'#6d654d':'#212c24';const side=i%2?3:121;ctx.fillRect(side-i%3,6+(i*47)%242,2+i%4,2+i%6);}
 ctx.strokeStyle='#53634d';ctx.beginPath();ctx.moveTo(70,45);ctx.lineTo(82,55);ctx.lineTo(78,72);ctx.stroke();
 ctx.fillStyle='#e7d4a1';ctx.font='bold 23px monospace';ctx.fillText('OPEN',38,35);ctx.fillText('SHUT',38,239);
 for(let i=0;i<5;i++)ctx.fillRect(4,i*48+21,22,3);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=THREE.NearestFilter;
 const labelMaterial=new THREE.MeshPhongMaterial({map:texture,specular:0x455043,shininess:26});
 const label=new THREE.Mesh(new THREE.PlaneGeometry(.29,.42),labelMaterial);
 label.position.set(-.015,1.09,-.276);label.rotation.y=Math.PI;root.add(label);
 const buttonGeometry=new THREE.CylinderGeometry(.095,.1,.06,24);
 const button=put(buttonGeometry,'machineRed',0,SLUICE.height,0,1,1,1,0,0,0,root);
 const witness=box('brass',.125,1.27,-.288,.052,.024,.018,root);
 const latch=new THREE.Group();latch.position.set(.165,1.545,0);root.add(latch);
 box('brass',-.07,0,0,.14,.018,.04,latch);
 let pose;
 function update(run){
  pose=keeperReleasePose(run);button.position.y=SLUICE.height-pose.button*.035;
  witness.position.y=1.27-pose.travel*.36;
  witness.material=materials[pose.secured?'greenSignal':'brass'];
  latch.rotation.y=(1-pose.latch)*Math.PI/2;
 }
 update({gate:0});
 return {root,update,stats:()=>({...pose,buttonHeight:button.position.y,witnessHeight:witness.position.y,latchAngle:latch.rotation.y,staticDraws:parts.size,housingBounds,detail:{labelPixels:[256,512],hinges:2,gasket:true}}),dispose(){texture.dispose();labelMaterial.dispose();}};
}
