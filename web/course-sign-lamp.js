import * as THREE from './vendor/three/three.module.js';

// A shielded reading light belongs to the opening board, not the path-lantern
// family. Its short throw lights the panel and mounting hardware below it.
export function createCourseSignLamp(parent,box,{x,y,z,yaw=0,scale=.16,xScale=.1152}){
 const root=new THREE.Group();root.name='CourseApproachSignLamp';root.position.set(x,y,z);root.rotation.y=yaw;parent.add(root);
 for(const [px,py,pz,w,h,d,tint]of [
  [0,.525,.10,.055,.19,.055,0x657367],
  [0,.625,.24,.055,.055,.40,0x657367],
  [0,.57,.37,.62,.025,.34,0x536153],
  [0,.515,.53,.62,.09,.025,0x3f5046],
  [0,.515,.21,.62,.09,.025,0x3f5046],
  [-.297,.515,.37,.025,.09,.30,0x3f5046],
  [.297,.515,.37,.025,.09,.30,0x3f5046],
  [-.18,.585,.37,.035,.012,.035,0xa49e7c],
  [.18,.585,.37,.035,.012,.035,0xa49e7c]
 ])box(x+px,y+py,z+pz,w,h,d,tint);
 const glass=new THREE.Mesh(new THREE.PlaneGeometry(.48,.19),new THREE.MeshBasicMaterial({color:0xffdda2}));
 glass.name='CourseSignLampLens';glass.rotation.x=Math.PI/2;glass.position.set(0,.475,.37);root.add(glass);
 // Three guard bars leave the source itself visible from below.
 for(const px of [-.16,0,.16])box(x+px,y+.471,z+.37,.012,.012,.22,0x415147);
 const light=new THREE.SpotLight(0xffdda2,1.2,1.85,1.4,.22,2);light.name='CourseSignReadingLight';light.position.set(0,.457,.37);
 light.target.position.set(0,-.04,.055);root.add(light,light.target);
 light.castShadow=true;light.shadow.mapSize.set(512,512);light.shadow.camera.near=.025;light.shadow.bias=-.00015;light.shadow.normalBias=.002;
 // The board is static and the nearby verge does not cast shadows. Joe is the
 // only moving shadow caster that can enter this short light volume. Refresh
 // through his approach/departure and gait, then retain the static map.
 light.shadow.autoUpdate=false;light.shadow.needsUpdate=true;
 const sourcePosition=new THREE.Vector3();let lastTime=-Infinity,lastNear=false,lastNavigation=null,lastX=null,lastZ=null,updates=0;
 function update(frame){
  if(!frame.joe)return;light.getWorldPosition(sourcePosition);
  const jx=frame.joe.x*xScale,jz=-frame.joe.y*scale,near=Math.hypot(jx-sourcePosition.x,jz-sourcePosition.z)<6,nav=!!frame.clearNavigation;
  if(frame.time<lastTime||lastNavigation!==nav||near!==lastNear||near&&(jx!==lastX||jz!==lastZ||!frame.paused&&frame.time-lastTime>=1/30)){
   light.shadow.needsUpdate=true;lastTime=frame.time;updates++;
  }
  lastNear=near;lastNavigation=nav;lastX=jx;lastZ=jz;
 }
 return {root,light,glass,update,stats:()=>({count:1,power:light.intensity,range:light.distance,position:light.getWorldPosition(new THREE.Vector3()).toArray(),shadowSize:light.shadow.mapSize.toArray(),shadowUpdates:updates,nearCaster:lastNear})};
}
