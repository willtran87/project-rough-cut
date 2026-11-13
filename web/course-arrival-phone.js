import * as THREE from './vendor/three/three.module.js';
import { arrivalPhoneVisible } from './course-arrival.js';

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
  g.textAlign='left';g.fillStyle='#9baea2';g.font='26px monospace';g.fillText('17:47',32,44);g.fillText('OFFLINE',342,44);
  g.fillStyle='#d6c7a2';g.font='bold 40px monospace';g.fillText('NIGHT ORDER',32,121);
  g.fillStyle='#667b70';g.fillRect(32,146,448,2);
  g.fillStyle='#e4e0cc';g.font='bold 30px monospace';g.fillText('DELIVERY',32,215);
  g.fillStyle='#a5cf9f';g.font='bold 124px monospace';g.fillText('DONE',32,365);
  g.fillStyle='#bbc5b4';g.font='bold 53px monospace';g.fillText('CLOSED BY',32,463);g.fillText('JOE',32,525);
  g.fillStyle='#667b70';g.fillRect(32,566,448,2);
  g.fillStyle='#e2b785';g.font='bold 38px monospace';g.fillText('COURSE',32,637);g.fillText('SECURED',32,685);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.LinearFilter;texture.generateMipmaps=false;
  const screen=new THREE.Mesh(new THREE.PlaneGeometry(.158,.267),new THREE.MeshBasicMaterial({map:texture,toneMapped:false}));
  screen.position.set(0,-.006,.015);root.add(screen);
  return {
    update(camera,frame){
      root.visible=arrivalPhoneVisible(frame.fx?.arrival,frame.fx?.arrivalPhoneClear);
      if(!root.visible)return;
      const age=frame.fx.arrival.age-frame.fx.arrival.lockAt;
      const lift=frame.reducedMotion?1:Math.min(1,age/.35,(6.2-age)/.35);
      root.position.set(camera.aspect<1?.015:.28,(camera.aspect<1?.08:.04)-(1-lift)*.42,camera.aspect<1?-.75:-.57).applyQuaternion(camera.quaternion).add(camera.position);
      root.quaternion.copy(camera.quaternion);root.rotateZ(-.035);root.rotateY(-.10);
    },
    visible:()=>root.visible,
  };
}
