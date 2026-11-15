import * as THREE from './vendor/three/three.module.js';
import {OLD_FINISH,oldFinishPose} from './dead-green.js';

// Attached to the existing final hedge arch. Supports sit inside its solid
// wings; the walking opening is unchanged and nothing creates a new collider.
export function createDeadGreenScene(parent,{scale,xScale}){
 const root=new THREE.Group();root.name='old-finish';root.position.set(OLD_FINISH.x*xScale,0,-OLD_FINISH.y*scale+1.16);parent.add(root);
 const wood=new THREE.MeshStandardMaterial({color:0x554b35,roughness:1});
 const geometry=new THREE.BoxGeometry(1,1,1);
 const box=(x,y,z,w,h,d)=>{const m=new THREE.Mesh(geometry,wood);m.position.set(x,y,z);m.scale.set(w,h,d);root.add(m);return m;};
 for(const x of [-1.9,1.9])box(x,2.68,-.12,.12,1.55,.16);
 box(0,3.4,-.12,3.98,.13,.18);
 box(0,3.08,-.035,3.55,.74,.07);
 const makeSign=(lines,w,h)=>{
  const c=document.createElement('canvas');c.width=768;c.height=160;const g=c.getContext('2d');
  g.fillStyle='#242d25';g.fillRect(0,0,768,160);g.strokeStyle='#b6aa7d';g.lineWidth=5;g.strokeRect(7,7,754,146);
  for(let i=0;i<80;i++){g.fillStyle=i%2?'#30382c':'#1c261f';g.fillRect((i*137)%748+10,(i*59)%140+10,3+i%9,2);}
  g.textAlign='center';g.fillStyle='#e4d2a0';
  for(const [text,y,size]of lines){g.font=`bold ${size}px monospace`;g.fillText(text,384,y);}
  const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;map.magFilter=THREE.NearestFilter;map.minFilter=THREE.LinearFilter;map.generateMipmaps=false;
  return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map}));
 };
 const sign=makeSign([['FINISH',83,78],['ORIGINAL COURSE · 1987',135,28]],3.55,.74);sign.position.set(0,3.08,.01);root.add(sign);
 const hinge=new THREE.Group();hinge.position.set(0,2.69,-.04);root.add(hinge);
 const notice=makeSign([['RELEASE RELOCATED',62,48],['NIGHT RANGE · CHECKS STILL COUNT',125,29]],3.3,.69);notice.position.y=-.345;hinge.add(notice);
 const backing=new THREE.Mesh(geometry,wood);backing.position.set(0,-.345,-.018);backing.scale.set(3.3,.69,.025);hinge.add(backing);
 // Small fastening plates give the sign a physical attachment to the beam.
 for(const x of [-1.55,1.55])box(x,3.36,.035,.10,.18,.055);
 return {update(frame){const pose=oldFinishPose(frame.fx?.deadGreen,frame.reducedMotion);hinge.rotation.x=pose.rotation;},stats:()=>({position:root.position.toArray(),rotation:hinge.rotation.x,meshes:9,textures:2})};
}
