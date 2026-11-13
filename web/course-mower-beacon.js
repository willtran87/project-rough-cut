import * as THREE from './vendor/three/three.module.js';
import {mergeGeometries} from './vendor/three/addons/utils/BufferGeometryUtils.js';

const SHADOW_LAYER=28;
export function courseBeaconPose(time,flashes=1,reduced=false){
  const strength=reduced?0:THREE.MathUtils.clamp(flashes??1,0,1);
  const angle=time*Math.PI*2/4.8;
  return {angle:strength===0?0:angle,strength,
    power:18+strength*(.5+.5*Math.cos(angle))*8,
    lens:.62+strength*(.5+.5*Math.cos(angle))*.38,
    steady:strength===0};
}

// One small shadow pass over simplified physical blockers. The full course and
// skinned actor are not submitted again just to shadow a nearby warning lamp.
export function createCourseMowerBeacon(parent,obstacles,scale,xScale){
  const root=new THREE.Group();root.name='CourseMowerBeacon';parent.add(root);
  const pieces=[];
  const box=(x,y,z,sx,sy,sz,color)=>{
    const g=new THREE.BoxGeometry(sx,sy,sz).toNonIndexed();g.translate(x,y,z);
    const c=new THREE.Color(color),colors=[];for(let i=0;i<g.attributes.position.count;i++)colors.push(c.r,c.g,c.b);
    g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));pieces.push(g);
  };
  // Mast bolted to the outside of the push-mower deck, clear of Joe's grip.
  box(.34,.35,-.72,.13,.08,.2,0x292b29);
  box(.34,.68,-.72,.045,.66,.045,0x4c4840);
  box(.34,1.015,-.72,.19,.05,.19,0x242827);
  box(.34,1.205,-.72,.2,.035,.2,0x3e3831);
  for(const x of [-.085,.085])for(const z of [-.085,.085])box(.34+x,1.11,-.72+z,.018,.18,.018,0x514c40);
  const metalGeometry=mergeGeometries(pieces);pieces.forEach(g=>g.dispose());
  const metalMaterial=new THREE.MeshLambertMaterial({vertexColors:true});
  const metal=new THREE.Mesh(metalGeometry,metalMaterial);root.add(metal);
  const lensMaterial=new THREE.MeshBasicMaterial({color:0xff2518,toneMapped:false});
  const lensGeometry=new THREE.CylinderGeometry(.073,.083,.14,8);
  const lens=new THREE.Mesh(lensGeometry,lensMaterial);lens.position.set(.34,1.105,-.72);root.add(lens);
  const reflectorMaterial=new THREE.MeshBasicMaterial({color:0xffc2a0,toneMapped:false});
  const reflectorGeometry=new THREE.BoxGeometry(.105,.08,.018);
  const reflector=new THREE.Mesh(reflectorGeometry,reflectorMaterial);reflector.position.set(.34,1.105,-.72);root.add(reflector);
  const light=new THREE.SpotLight(0xff2412,20,7,.66,.55,2);light.name='CourseMowerWarningLight';
  light.castShadow=true;light.shadow.mapSize.set(256,256);light.shadow.camera.near=.08;
  light.shadow.camera.layers.set(SHADOW_LAYER);light.shadow.bias=-.001;light.shadow.normalBias=.035;
  light.shadow.autoUpdate=false;light.shadow.needsUpdate=true;
  parent.add(light,light.target);
  const shadowRoot=new THREE.Group();shadowRoot.name='BeaconBlockers';parent.add(shadowRoot);
  const blockerParts=[];
  for(const o of obstacles){
    if(!o.blocks||!o.sight||/pond|shed-door/.test(o.id))continue;
    const tree=/pine|tree|oak/.test(o.id),bench=/bench/.test(o.id),cart=/cart/.test(o.id);
    const height=tree?3.2:bench?.65:cart?1.1:/hedge/.test(o.id)?1.85:2.7;
    const rx=(o.radiusX||o.radius||1)*scale*(tree?.24:1),rz=(o.radiusY||o.radius||1)*scale*(tree?.24:1);
    const g=tree?new THREE.CylinderGeometry(rx,rx,height,6):new THREE.BoxGeometry(rx*2,height,rz*2);
    if(tree)g.scale(1,1,rz/rx);g.translate(o.x*xScale,height/2,-o.y*scale);blockerParts.push(g.toNonIndexed());g.dispose();
  }
  const blockerGeometry=mergeGeometries(blockerParts);blockerParts.forEach(g=>g.dispose());
  const blockerMaterial=new THREE.MeshBasicMaterial();
  const blockers=new THREE.Mesh(blockerGeometry,blockerMaterial);blockers.layers.set(SHADOW_LAYER);blockers.castShadow=true;shadowRoot.add(blockers);
  let lastKey='',lastShadow=-Infinity,updates=0,disposed=false,current={},wasNearby=false;
  const movingCasters=[];
  const origin=new THREE.Vector3(),direction=new THREE.Vector3();
  function update(frame,position,camera){
    root.position.copy(position);root.rotation.y=(frame.joe.effectHeading||0)-Math.PI/2;
    const pose=courseBeaconPose(frame.time,frame.fx?.flashes??frame.flashes,frame.reducedMotion);
    reflector.rotation.y=pose.angle;
    reflectorMaterial.color.setRGB(pose.strength,pose.strength*.55,pose.strength*.32);
    lensMaterial.color.setRGB(pose.lens,pose.lens*.045,pose.lens*.018);
    root.updateMatrixWorld(true);origin.set(.34,1.105,-.72).applyMatrix4(root.matrixWorld);light.position.copy(origin);
    direction.set(Math.sin(pose.angle)*3.8*pose.strength,THREE.MathUtils.lerp(-4,-1.1,pose.strength),Math.cos(pose.angle)*3.8*pose.strength)
      .applyAxisAngle(THREE.Object3D.DEFAULT_UP,root.rotation.y);
    light.target.position.copy(origin).add(direction);light.angle=THREE.MathUtils.lerp(1.12,.66,pose.strength);
    const distance=origin.distanceTo(camera.position),fade=1-THREE.MathUtils.smoothstep(distance,11,14),nearby=fade>0;
    light.intensity=pose.power*fade;
    // Doors can move while the course clock is stopped during an escape.
    // Their world transforms invalidate even a stationary, comfort-mode beam.
    const casterKey=movingCasters.map(object=>{object.updateWorldMatrix(true,false);return object.matrixWorld.elements.join(',');}).join(';');
    const key=[origin.x,origin.y,origin.z,root.rotation.y,pose.strength,casterKey].join(':');
    const refresh=nearby&&(!wasNearby||key!==lastKey||frame.time<lastShadow||(!pose.steady&&frame.time-lastShadow>=.075));
    if(refresh){light.shadow.needsUpdate=true;lastKey=key;lastShadow=frame.time;updates++;}
    wasNearby=nearby;
    current={...pose,active:nearby,distance,fade,position:origin.toArray(),target:light.target.position.toArray(),
      intensity:light.intensity,shadowUpdates:updates,shadowSize:256,blockerTriangles:blockerGeometry.index?blockerGeometry.index.count/3:blockerGeometry.attributes.position.count/3};
    return refresh;
  }
  function addCaster(object){if(!object||movingCasters.includes(object))return;movingCasters.push(object);object.traverse(o=>{if(o.isMesh){o.layers.enable(SHADOW_LAYER);o.castShadow=true;}});}
  return {root,light,update,addCaster,stats:()=>({...current}),dispose(){
    if(disposed)return;disposed=true;root.removeFromParent();light.removeFromParent();light.target.removeFromParent();shadowRoot.removeFromParent();
    for(const g of [metalGeometry,lensGeometry,reflectorGeometry,blockerGeometry])g.dispose();
    for(const m of [metalMaterial,lensMaterial,reflectorMaterial,blockerMaterial])m.dispose();light.shadow.dispose();
  }};
}
