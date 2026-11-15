import * as THREE from './vendor/three/three.module.js';
import { arrivalPhoneVisible } from './course-arrival.js';
import { courseArrivalPhonePose } from './course-arrival-presentation.js?v=20261114-hand-finish';
import { COURSE_PIXEL_GLYPHS } from './course-station-paper.js?v=20261114-arrival';

// A short diegetic notification, never a modal or a camera takeover. The
// simulation decides when it can be seen; rendering never extends its lifetime.
export function createArrivalPhone(parent,attachHand) {
  const root=new THREE.Group();root.name='night-order-phone';root.visible=false;parent.add(root);
  const shell=new THREE.MeshStandardMaterial({color:0x34413b,roughness:.7});
  const rim=new THREE.MeshStandardMaterial({color:0x87958d,roughness:.45,metalness:.4});
  function box(w,h,d,x,y,z,mat){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);root.add(mesh);return mesh;}
  box(.184,.324,.019,0,0,0,rim);box(.176,.316,.022,0,0,.002,shell);
  box(.051,.005,.002,0,.148,.015,rim);
  attachHand?.(root);
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=768;
  const g=canvas.getContext('2d');g.fillStyle='#132321';g.fillRect(0,0,512,768);
  const text=(label,x,y,scale,color)=>{g.fillStyle=color;for(const ch of label){const rows=COURSE_PIXEL_GLYPHS[ch]||[];rows.forEach((bits,row)=>{for(let col=0;col<5;col++)if(bits&(1<<(4-col)))g.fillRect(x+col*scale,y+row*scale,scale,scale);});x+=6*scale;}};
  text('17:47',32,24,3,'#9baea2');text('OFFLINE',350,24,3,'#9baea2');
  text('NIGHT ORDER',32,86,6,'#d6c7a2');
  g.fillStyle='#667b70';g.fillRect(32,146,448,2);
  text('DELIVERY',32,184,5,'#e4e0cc');text('DONE',32,240,15,'#a5cf9f');
  text('CLOSED BY',32,407,8,'#bbc5b4');text('JOE',32,473,8,'#bbc5b4');
  g.fillStyle='#667b70';g.fillRect(32,566,448,2);
  text('COURSE',32,595,6,'#e2b785');text('SECURED',32,645,6,'#e2b785');
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.LinearFilter;texture.generateMipmaps=false;
  const screen=new THREE.Mesh(new THREE.PlaneGeometry(.158,.267),new THREE.MeshBasicMaterial({map:texture,toneMapped:false}));
  screen.position.set(0,-.006,.015);root.add(screen);
  return {
    update(camera,frame){
      root.visible=arrivalPhoneVisible(frame.fx?.arrival,frame.fx?.arrivalPhoneClear);
      if(!root.visible)return;
      const age=frame.fx.arrival.age-frame.fx.arrival.lockAt;
      const pose=courseArrivalPhonePose(age,camera.aspect<1,frame.reducedMotion,camera.fov);
      root.scale.setScalar(pose.scale);
      root.position.set(pose.x,pose.y,pose.z).applyQuaternion(camera.quaternion).add(camera.position);
      root.quaternion.copy(camera.quaternion);root.rotateZ(pose.roll);root.rotateY(pose.yaw);root.rotateX(pose.pitch);
    },
    visible:()=>root.visible,
  };
}
