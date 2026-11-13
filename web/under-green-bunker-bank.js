import * as THREE from './vendor/three/three.module.js';
import {BUNKER_BANK} from './under-green-bunker-layout.js';

export function buildBunkerBankDetails({box,put,ball}) {
  // Short root fans stay on the exposed soil face, outside player/tool space.
  // Their upper segments penetrate the turf rather than floating below it.
  for (const y of [55.2,59.5,63.2,68.3]) {
    for (const branch of [-1,0,1]) {
      const points = [
        new THREE.Vector3(-32.03,5.16,-y),
        new THREE.Vector3(-31.98,4.98,-y+branch*.12),
        new THREE.Vector3(-31.98,4.78,-y+branch*.22),
        new THREE.Vector3(-32.01,4.63,-y+branch*.28+.06),
      ];
      const root = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),6,.018,4,false);
      put(root,'wood',0,0,0);root.dispose();
    }
    // An uneven turf lip gives the cross-section a natural edge in silhouette.
    box('grass',-32.03,5.13,-y,.19,.14,.65);
  }

  // A rake left on the bunker rim: its teeth touch the turf, and the
  // inclined handle rises toward the course. All parts remain outside the hull.
  const head = new THREE.Vector3(-32.08,BUNKER_BANK.turfTop+.25,-61.2);
  const grip = new THREE.Vector3(-33.05,6.9,-61.4);
  const handle = new THREE.CylinderGeometry(.024,.024,head.distanceTo(grip),6);
  const rotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),grip.clone().sub(head).normalize());
  const euler = new THREE.Euler().setFromQuaternion(rotation),middle=head.clone().add(grip).multiplyScalar(.5);
  put(handle,'wood',middle.x,middle.y,middle.z,1,1,1,euler.x,euler.y,euler.z);handle.dispose();
  box('iron',head.x,head.y,head.z,.08,.07,.76);
  for(let i=0;i<9;i++)box('iron',head.x,BUNKER_BANK.turfTop+.125,head.z-.32+i*.08,.025,.25,.025);
  // Two lost balls rest on the turf lip beside the rake; no route-wide scatter.
  for(const [x,y]of [[-32.05,60.35],[-32.06,60.51]])put(ball,'white',x,BUNKER_BANK.turfTop+.047,-y,.047,.047,.047);
  return {roots:12,rakes:1,balls:2,faceX:BUNKER_BANK.faceX,turfTop:BUNKER_BANK.turfTop};
}
