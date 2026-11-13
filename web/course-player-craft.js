import * as THREE from './vendor/three/three.module.js';
import {mergeGeometries} from './vendor/three/addons/utils/BufferGeometryUtils.js';

// Shared first-person hands: the same skin, woven work shirt and cuff details
// hold the arrival phone and the golf club. All poses follow simulation state.
export function createCoursePlayerCraft(parent){
  const geometries=[],materials=[],textures=[],roots=[];
  function surface(base,colors,seed){
    const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle=base;g.fillRect(0,0,64,64);
    for(let i=0;i<1200;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;const x=(seed>>>0)%64;seed=(Math.imul(seed,1664525)+1013904223)|0;const y=(seed>>>0)%64;g.fillStyle=colors[i%colors.length];g.fillRect(x,y,1,i%3===0?2:1);}
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestMipmapLinearFilter;textures.push(t);
    const m=new THREE.MeshLambertMaterial({map:t});materials.push(m);return m;
  }
  const skin=surface('#b6a188',['#bca88f','#ad977f','#c0ab92'],53),cloth=surface('#526d70',['#405758','#5b7474','#6d8581'],97);
  const solid=color=>{const m=new THREE.MeshLambertMaterial({color});materials.push(m);return m;};
  const seam=solid(0x334d51),nail=solid(0xc9b49c),steel=solid(0x899793),rubber=solid(0x303d39);
  function mesh(group,g,m,x=0,y=0,z=0){geometries.push(g);const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.receiveShadow=true;group.add(o);return o;}
  function ellipsoid(group,x,y,z,sx,sy,sz,m){const g=new THREE.SphereGeometry(1,8,6);g.scale(sx,sy,sz);return mesh(group,g,m,x,y,z);}
  function box(group,x,y,z,w,h,d,m){return mesh(group,new THREE.BoxGeometry(w,h,d),m,x,y,z);}
  function batch(root){
    root.updateWorldMatrix(true,true);const inverse=root.matrixWorld.clone().invert(),groups=new Map();
    root.traverse(o=>{if(!o.isMesh)return;const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone(),transform=new THREE.Matrix4().multiplyMatrices(inverse,o.matrixWorld);g.applyMatrix4(transform);
      // Baking the mirrored left hand must preserve outward triangle winding.
      if(transform.determinant()<0)for(const a of Object.values(g.attributes))for(let i=0;i<a.count;i+=3)for(let c=0;c<a.itemSize;c++){const b=(i+1)*a.itemSize+c,d=(i+2)*a.itemSize+c,v=a.array[b];a.array[b]=a.array[d];a.array[d]=v;}
      if(!groups.has(o.material))groups.set(o.material,[]);groups.get(o.material).push(g);});
    root.clear();for(const [material,parts]of groups){const g=mergeGeometries(parts);parts.forEach(p=>p.dispose());mesh(root,g,material);}
  }
  function hand(parent,pose){
    const root=new THREE.Group();root.name='PlayerHand-'+pose;parent.add(root);
    // Tapered palm, wrist, rolled cuff and seam; fingers have two visible joints.
    ellipsoid(root,0,0,0,.047,.058,.023,skin);
    ellipsoid(root,0,-.055,0,.031,.045,.023,skin);
    if(pose==='phone'){const sleeve=mesh(root,new THREE.CylinderGeometry(.043,.060,.23,8),cloth,0,-.19,-.006);sleeve.rotation.z=-.06;}
    const cuff=mesh(root,new THREE.CylinderGeometry(.045,.047,.042,8),cloth,0,-.088,0);
    box(root,.035,-.088,.024,.012,.03,.009,seam);ellipsoid(root,.035,-.085,.031,.004,.004,.003,nail);
    for(let i=0;i<4;i++){
      const x=(i-1.5)*.024,length=[.054,.070,.067,.049][i],finger=new THREE.Group();finger.position.set(x,.039,0);root.add(finger);
      finger.rotation.x=pose==='club'?1.25:.12;
      ellipsoid(finger,0,length*.27,0,.012,length*.33,.012,skin);
      const tip=new THREE.Group();tip.position.y=length*.53;tip.rotation.x=pose==='club'?1.0:.32;finger.add(tip);
      ellipsoid(tip,0,length*.20,0,.0105,length*.27,.011,skin);
      box(tip,0,length*.30,-.009,.013,.015,.002,nail);
    }
    const thumb=new THREE.Group();thumb.position.set(-.039,.005,.014);thumb.rotation.z=.65;thumb.rotation.x=pose==='club'?.8:-.25;root.add(thumb);
    ellipsoid(thumb,0,.025,0,.016,.036,.015,skin);ellipsoid(thumb,0,.051,.004,.013,.021,.013,skin);
    return root;
  }
  const club=new THREE.Group();club.name='PlayerGolfClub';parent.add(club);roots.push(club);
  mesh(club,new THREE.CylinderGeometry(.006,.009,.87,10),steel,0,-.08,0);
  mesh(club,new THREE.CylinderGeometry(.016,.012,.25,10),rubber,0,.31,0);
  for(let i=0;i<9;i++)mesh(club,new THREE.TorusGeometry(.0155,.0015,3,10),seam,0,.21+i*.025,0).rotation.x=Math.PI/2;
  const head=box(club,.06,-.525,0,.17,.065,.065,steel);head.rotation.z=.1;
  for(let i=0;i<5;i++)box(club,.06,-.546+i*.009,.033,.13,.002,.002,rubber);
  const right=hand(club,'club');right.position.set(-.045,.27,-.028);right.rotation.z=-1.25;
  const left=hand(club,'club');left.position.set(-.045,.39,-.028);left.rotation.z=-1.25;left.scale.x=-1;
  right.updateMatrix();left.updateMatrix();
  const wrists=[new THREE.Vector3(0,-.108,0).applyMatrix4(right.matrix),new THREE.Vector3(0,-.108,0).applyMatrix4(left.matrix)];
  batch(club);
  const arms=new THREE.Group();arms.name='PlayerClubForearms';parent.add(arms);roots.push(arms);
  const sleeves=wrists.map(()=>mesh(arms,new THREE.CylinderGeometry(.043,.065,1,8),cloth));
  const wrist=new THREE.Vector3(),end=new THREE.Vector3(),direction=new THREE.Vector3(),up=new THREE.Vector3(0,1,0),cameraInverse=new THREE.Matrix4();
  let hasPhoneHand=false;
  let current={},disposed=false;
  function attachPhoneHand(phone){const h=hand(phone,'phone');h.position.set(.018,-.205,-.027);h.rotation.z=-.08;batch(h);roots.push(h);hasPhoneHand=true;return h;}
  function update(camera,frame){
    // The flight outlives the follow-through. Put the club away after the stroke.
    club.visible=Boolean(frame.aim)||(frame.swing>0&&frame.swing<1);
    arms.visible=club.visible;
    if(club.visible){
      const follow=frame.aim?0:Math.sin(frame.swing*Math.PI),charge=frame.aim?(frame.charge||0):0;
      const lower=frame.aim?0:THREE.MathUtils.smoothstep(frame.swing,.70,1)*.6;
      const angle=-.4-charge*.7+follow*(frame.reducedMotion?.3:1.15);
      // Keep the pair of gripping hands inside the narrower portrait frustum.
      const lateral=camera.aspect<1?.02+.045*Math.cos(angle)+.33*Math.sin(angle):.36;
      club.position.set(lateral,-.43-lower,-.68).applyQuaternion(camera.quaternion).add(camera.position);
      club.quaternion.copy(camera.quaternion);club.rotateZ(angle);club.rotateX(frame.aim?-.1:follow*(frame.reducedMotion?-.12:-.6));
      club.updateMatrixWorld(true);cameraInverse.copy(camera.matrixWorld).invert();arms.position.copy(camera.position);arms.quaternion.copy(camera.quaternion);
      for(let i=0;i<2;i++){wrist.copy(wrists[i]).applyMatrix4(club.matrixWorld).applyMatrix4(cameraInverse);end.set(camera.aspect<1?(i===0?.13:-.08):(i===0?.30:.02),-.90,-.20);direction.copy(wrist).sub(end);const sleeve=sleeves[i];sleeve.position.copy(wrist).add(end).multiplyScalar(.5);sleeve.scale.y=direction.length();sleeve.quaternion.setFromUnitVectors(up,direction.normalize());}
    }
    current={visible:club.visible,position:club.position.toArray(),rotation:club.quaternion.toArray(),hands:2,phoneHand:hasPhoneHand};
  }
  return {club,attachPhoneHand,update,stats:()=>({...current}),dispose(){if(disposed)return;disposed=true;for(const r of roots)r.removeFromParent();for(const g of geometries)g.dispose();for(const m of materials)m.dispose();for(const t of textures)t.dispose();}};
}
