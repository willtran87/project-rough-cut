import * as THREE from './vendor/three/three.module.js';
import {mergeGeometries} from './vendor/three/addons/utils/BufferGeometryUtils.js';

// Shared first-person hands: the same skin, woven work shirt and cuff details
// hold the arrival phone and the golf club. All poses follow simulation state.
export function createCoursePlayerCraft(parent){
  const geometries=[],materials=[],textures=[],roots=[];
  function surface(kind){
    const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');
    const rect=(color,x,y,w,h)=>{g.fillStyle=color;g.fillRect(x,y,w,h);};
    if(kind==='skin'){
      rect('#b6a188',0,0,128,128);
      // Broad, connected tonal islands. Skin is quieter than woven cloth;
      // these marks describe surface variation without freckle-like noise.
      for(const [x,y,w,h]of [[12,23,27,11],[37,31,31,14],[82,15,23,17],[73,77,33,13],[17,91,24,16]]){
        rect('#b39c83',x,y,w,h);rect('#b39c83',x+5,y-4,w-11,h+8);
        rect('#bba58d',x+3,y+2,w-8,4);
      }
      for(const [x,y,w]of [[18,59,19],[45,62,13],[80,51,22],[25,116,14]]){
        rect('#ac957d',x,y,w,1);rect('#bba58d',x+2,y+2,w-4,1);
      }
    }else{
      rect('#526d70',0,0,128,128);
      // Long broken folds follow the sleeve's cylinder axis. Sparse twill
      // stitches sit inside these larger forms instead of hiding the form.
      for(const [x,w]of [[9,10],[34,7],[67,13],[103,9]])for(let y=0;y<128;y+=16){
        const step=(y/16)%3;rect('#465f63',x+step,y,w,16);
        rect('#5b7477',x+w+step,y+2,3,12);rect('#3e565b',x+step,y+4,2,8);
      }
      for(let y=2;y<128;y+=8)for(let x=2+(y%16);x<128;x+=16){rect('#5b7477',x,y,3,1);rect('#4b6569',x+2,y+2,3,1);}
    }
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestMipmapLinearFilter;textures.push(t);
    const m=new THREE.MeshLambertMaterial({map:t});materials.push(m);return m;
  }
  const skin=surface('skin'),cloth=surface('cloth');
  const solid=color=>{const m=new THREE.MeshLambertMaterial({color});materials.push(m);return m;};
  const seam=solid(0x334d51),nail=solid(0xc9b49c),steel=solid(0x899793),rubber=solid(0x303d39);
  function mesh(group,g,m,x=0,y=0,z=0){geometries.push(g);const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.receiveShadow=true;group.add(o);return o;}
  function ellipsoid(group,x,y,z,sx,sy,sz,m){const g=new THREE.SphereGeometry(1,12,10);g.scale(sx,sy,sz);return mesh(group,g,m,x,y,z);}
  function digit(group,points,radius){
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
    const g=new THREE.TubeGeometry(curve,16,radius,10,false),p=g.attributes.position,n=g.attributes.normal;
    // Close the ends and taper continuously through the knuckle bends, so a
    // curled digit remains one form rather than separate overlapping beads.
    for(let ring=0;ring<=16;ring++){
      const t=ring/16,tip=Math.min(1,t*8,(1-t)*8),r=radius*(.98-.22*t)*Math.sqrt(Math.max(0,tip));
      const center=curve.getPointAt(t);
      for(let side=0;side<=10;side++){const i=ring*11+side;p.setXYZ(i,center.x+n.getX(i)*r,center.y+n.getY(i)*r,center.z+n.getZ(i)*r);}
    }
    g.computeVertexNormals();return mesh(group,g,skin);
  }
  function box(group,x,y,z,w,h,d,m){return mesh(group,new THREE.BoxGeometry(w,h,d),m,x,y,z);}
  function batch(root){
    root.updateWorldMatrix(true,true);const inverse=root.matrixWorld.clone().invert(),groups=new Map();
    root.traverse(o=>{if(!o.isMesh)return;const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone(),transform=new THREE.Matrix4().multiplyMatrices(inverse,o.matrixWorld);g.applyMatrix4(transform);
      // Baking the mirrored left hand must preserve outward triangle winding.
      if(transform.determinant()<0)for(const a of Object.values(g.attributes))for(let i=0;i<a.count;i+=3)for(let c=0;c<a.itemSize;c++){const b=(i+1)*a.itemSize+c,d=(i+2)*a.itemSize+c,v=a.array[b];a.array[b]=a.array[d];a.array[d]=v;}
      if(!groups.has(o.material))groups.set(o.material,[]);groups.get(o.material).push(g);});
    root.clear();for(const [material,parts]of groups){const g=mergeGeometries(parts);parts.forEach(p=>p.dispose());mesh(root,g,material);}
  }
  function clubHand(parent){
    const root=new THREE.Group();root.name='PlayerHand-club';parent.add(root);
    // Tapered palm, wrist, rolled cuff and seam; fingers have two visible joints.
    ellipsoid(root,0,0,0,.047,.058,.023,skin);
    ellipsoid(root,0,-.055,0,.031,.045,.023,skin);
    const cuff=mesh(root,new THREE.CylinderGeometry(.045,.047,.042,8),cloth,0,-.088,0);
    box(root,.035,-.088,.024,.012,.03,.009,seam);ellipsoid(root,.035,-.085,.031,.004,.004,.003,nail);
    for(let i=0;i<4;i++){
      const x=(i-1.5)*.024,length=[.054,.070,.067,.049][i],finger=new THREE.Group();finger.position.set(x,.039,0);root.add(finger);
      finger.rotation.x=1.25;
      ellipsoid(finger,0,length*.27,0,.012,length*.33,.012,skin);
      const tip=new THREE.Group();tip.position.y=length*.53;tip.rotation.x=1.0;finger.add(tip);
      ellipsoid(tip,0,length*.20,0,.0105,length*.27,.011,skin);
      box(tip,0,length*.30,-.009,.013,.015,.002,nail);
    }
    const thumb=new THREE.Group();thumb.position.set(-.039,.005,.014);thumb.rotation.z=.65;thumb.rotation.x=.8;root.add(thumb);
    ellipsoid(thumb,0,.025,0,.016,.036,.015,skin);ellipsoid(thumb,0,.051,.004,.013,.021,.013,skin);
    return root;
  }
  const club=new THREE.Group();club.name='PlayerGolfClub';parent.add(club);roots.push(club);
  mesh(club,new THREE.CylinderGeometry(.006,.009,.87,10),steel,0,-.08,0);
  mesh(club,new THREE.CylinderGeometry(.016,.012,.25,10),rubber,0,.31,0);
  for(let i=0;i<9;i++)mesh(club,new THREE.TorusGeometry(.0155,.0015,3,10),seam,0,.21+i*.025,0).rotation.x=Math.PI/2;
  const head=box(club,.06,-.525,0,.17,.065,.065,steel);head.rotation.z=.1;
  for(let i=0;i<5;i++)box(club,.06,-.546+i*.009,.033,.13,.002,.002,rubber);
  const right=clubHand(club);right.position.set(-.045,.27,-.028);right.rotation.z=-1.25;
  const left=clubHand(club);left.position.set(-.045,.39,-.028);left.rotation.z=-1.25;left.scale.x=-1;
  right.updateMatrix();left.updateMatrix();
  const wrists=[new THREE.Vector3(0,-.108,0).applyMatrix4(right.matrix),new THREE.Vector3(0,-.108,0).applyMatrix4(left.matrix)];
  batch(club);
  const arms=new THREE.Group();arms.name='PlayerClubForearms';parent.add(arms);roots.push(arms);
  const sleeves=wrists.map(()=>mesh(arms,new THREE.CylinderGeometry(.043,.065,1,8),cloth));
  const wrist=new THREE.Vector3(),end=new THREE.Vector3(),direction=new THREE.Vector3(),up=new THREE.Vector3(0,1,0),cameraInverse=new THREE.Matrix4();
  let hasPhoneHand=false;
  let current={},disposed=false;
  function attachPhoneHand(phone){
    const h=new THREE.Group();h.name='PlayerHand-phone';phone.add(h);
    // The palm supports the right edge; four fingers curl behind the shell,
    // while the opposed thumb rests on the front rim clear of the lettering.
    const palm=new THREE.LatheGeometry([[0,-.231],[.023,-.224],[.027,-.205],[.027,-.181],[.033,-.157],[.038,-.130],[.034,-.105],[.022,-.082],[0,-.075]].map(([r,y])=>new THREE.Vector2(r,y)),12);
    const palmPosition=palm.attributes.position;
    for(let i=0;i<palmPosition.count;i++){
      const y=palmPosition.getY(i),wrist=THREE.MathUtils.smoothstep(-y,.14,.22);
      palmPosition.setXYZ(i,palmPosition.getX(i)+.112+.020*wrist,y,palmPosition.getZ(i)*.60-.047+.028*wrist);
    }
    palm.computeVertexNormals();mesh(h,palm,skin);
    for(let i=0;i<4;i++){
      const y=-.044-i*.023,x=.121-i*.003;
      digit(h,[[x-.005,y-.044,-.048],[x+.005,y-.020,-.043],[x+.006,y,-.036],[.082,y+.004,-.022],[.049,y-.004,-.018]],.011);
    }
    digit(h,[[.129,-.151,-.028],[.132,-.128,-.012],[.120,-.101,.013],[.105,-.084,.025],[.086,-.068,.027]],.015);
    const thumbnail=ellipsoid(h,.099,-.078,.035,.009,.013,.002,nail);thumbnail.rotation.z=-.55;
    const cuff=mesh(h,new THREE.CylinderGeometry(.033,.038,.042,12),cloth,.132,-.220,-.019);cuff.rotation.z=.12;
    const sleeve=mesh(h,new THREE.CylinderGeometry(.036,.055,.24,12),cloth,.148,-.354,-.013);sleeve.rotation.z=.12;
    const placket=box(h,.155,-.220,.012,.012,.034,.005,seam);placket.rotation.z=.12;
    ellipsoid(h,.155,-.220,.016,.0035,.0035,.002,nail);
    batch(h);roots.push(h);hasPhoneHand=true;return h;
  }
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
