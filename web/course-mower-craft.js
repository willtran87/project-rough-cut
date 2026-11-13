import * as THREE from './vendor/three/three.module.js';
import {mergeGeometries} from './vendor/three/addons/utils/BufferGeometryUtils.js';
import {COURSE_MOWER_SIZE} from './course-mower-size.js';

// Repairs and exposed drive parts follow the original wheel/deck footprint.
// The grip, wheel animation and physical course collision remain authoritative.
export function createCourseMowerCraft(parent){
  const root=new THREE.Group();root.name='CourseMowerCraft';parent.add(root);
  const material=new THREE.MeshLambertMaterial({vertexColors:true});
  const parts=[];
  function colored(g,color){const c=new THREE.Color(color),a=new Float32Array(g.attributes.position.count*3);for(let i=0;i<a.length;i+=3){a[i]=c.r;a[i+1]=c.g;a[i+2]=c.b;}g.setAttribute('color',new THREE.BufferAttribute(a,3));return g;}
  function box(x,y,z,w,h,d,color,angle=0){const g=new THREE.BoxGeometry(w,h,d).toNonIndexed();g.rotateZ(angle);g.translate(x,y,z);parts.push(colored(g,color));}
  function pipe(x,y,z,r,h,color){const g=new THREE.CylinderGeometry(r,r,h,8,1,true).toNonIndexed();g.translate(x,y,z);parts.push(colored(g,color));}
  // Uneven steel teeth, riveted repair plates and scars across the front apron.
  box(0,.145,-1.078,.48,.07,.025,0x443b31);
  for(let i=0;i<7;i++){
    const x=(i-3)*.066,h=.035+(i%3)*.012;
    box(x,.11-h/2,-1.086,.045,h,.018,i%2?0x6d5942:0x343731,(i-3)*.035);
    box(x,.172,-1.095,.009,.009,.008,0x8b8974);
  }
  for(const s of [-1,1]){
    box(s*.23,.214,-.78,.10,.012,.17,0x633b2c,s*.035);
    for(const z of [-.72,-.84])box(s*.23,.225,z,.015,.012,.015,0x9b9278);
    for(let i=0;i<4;i++)box(s*.285,.155,-.55-i*.12,.008,.012,.037,0x9b7150);
  }
  // Open, soot-dark exhaust with a bent heat shield and patched seam.
  pipe(-.19,.455,-.81,.025,.28,0x443e35);
  pipe(-.19,.60,-.81,.033,.025,0x73624a);
  box(-.19,.52,-.846,.085,.13,.008,0x4b514b,-.07);
  for(let i=0;i<4;i++)box(-.19,.48+i*.025,-.852,.066,.006,.005,0x191e1b);
  box(-.19,.595,-.81,.039,.002,.039,0x111713);
  // Bent protective bars frame an exposed drive pulley on the filter side.
  box(.265,.28,-.71,.018,.23,.018,0x665442,.13);
  box(.265,.28,-.81,.018,.23,.018,0x665442,-.13);
  const geometry=mergeGeometries(parts);parts.forEach(g=>g.dispose());
  const body=new THREE.Mesh(geometry,material);body.castShadow=body.receiveShadow=true;root.add(body);
  const rotorGeometry=new THREE.CylinderGeometry(.077,.077,.024,10).toNonIndexed();rotorGeometry.rotateZ(Math.PI/2);colored(rotorGeometry,0x847455);
  const rotor=new THREE.Mesh(rotorGeometry,material);rotor.position.set(.238,.29,-.76);rotor.castShadow=rotor.receiveShadow=true;root.add(rotor);
  const spokeGeometry=new THREE.BoxGeometry(.028,.025,.13).toNonIndexed();colored(spokeGeometry,0x292f2b);
  const spoke=new THREE.Mesh(spokeGeometry,material);rotor.add(spoke);
  const flapGeometry=new THREE.BoxGeometry(.018,.07,.18).toNonIndexed();flapGeometry.translate(0,-.035,0);colored(flapGeometry,0x3c443b);
  const flap=new THREE.Mesh(flapGeometry,material);flap.position.set(-.439,.16,-.71);flap.castShadow=flap.receiveShadow=true;root.add(flap);
  const machine=new THREE.Group(),size=COURSE_MOWER_SIZE;
  machine.name='EnlargedMowerDetails';root.add(machine);machine.add(body,rotor,flap);
  machine.scale.set(size.width,size.height,size.length);
  machine.position.z=size.pivotZ*(1-size.length);

  // Soft contact marks supply grounding even where software moon shadows are off.
  // They are ground planes, not camera-facing sprites; feet fade on the upswing.
  const contactGeometry=new THREE.PlaneGeometry(1,1);contactGeometry.rotateX(-Math.PI/2);
  const contactMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,
    uniforms:{strength:{value:.32}},vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'varying vec2 vUv;uniform float strength;void main(){float r=length((vUv-.5)*2.0);float a=pow(max(0.0,1.0-r),1.6)*strength;gl_FragColor=vec4(.025,.035,.025,a);}'});
  const contacts=[];
  for(let i=0;i<3;i++){const m=contactMaterial.clone(),mesh=new THREE.Mesh(contactGeometry,m);mesh.name='MowerContact'+i;mesh.position.y=.009;mesh.renderOrder=2;root.add(mesh);contacts.push(mesh);}
  contacts[2].position.set(0,.008,size.pivotZ+(-.73-size.pivotZ)*size.length);contacts[2].scale.set(.85*size.width,1,.87*size.length);contacts[2].material.uniforms.strength.value=.48;
  let lastTime=null,lastMeters=0,disposed=false;
  function update(frame,meters,feet){
    const elapsed=lastTime===null?0:Math.max(0,frame.time-lastTime),travel=meters-lastMeters;
    if(!frame.paused){
      rotor.rotation.x=frame.reducedMotion?0:frame.time*8;
      // Traveling over turf rattles the loose discharge flap; standing idle does not.
      if(elapsed>0)flap.rotation.z=frame.reducedMotion?0:Math.min(.22,Math.abs(travel)/elapsed*.055)*Math.sin(meters*29);
    }
    lastTime=frame.time;lastMeters=meters;
    for(let i=0;i<2;i++){const foot=feet[i],contact=contacts[i];contact.visible=!!foot;if(!foot)continue;const lift=Math.max(0,foot[1]-.12);contact.position.set(foot[0],.009,foot[2]-.065);contact.scale.set(.22+lift*.5,1,.35+lift*.5);contact.material.uniforms.strength.value=.52*(1-THREE.MathUtils.smoothstep(lift,0,.085));}
  }
  const triangles=[geometry,rotorGeometry,spokeGeometry,flapGeometry].reduce((n,g)=>n+g.attributes.position.count/3,6);
  return {root,update,stats:()=>({triangles,rotorAngle:rotor.rotation.x,flapAngle:flap.rotation.z,contacts:contacts.map(c=>({position:c.position.toArray(),strength:c.material.uniforms.strength.value}))}),dispose(){if(disposed)return;disposed=true;root.removeFromParent();for(const g of [geometry,rotorGeometry,spokeGeometry,flapGeometry,contactGeometry])g.dispose();material.dispose();contactMaterial.dispose();for(const c of contacts)c.material.dispose();}};
}
