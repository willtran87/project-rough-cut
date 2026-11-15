import * as THREE from './vendor/three/three.module.js';
import {SWALE,clamp} from './final-cut-course.js';
import {RIG_WHEELS,worldPart} from './final-cut-rig.js';
import {burstSeat,burstPoint} from './final-cut-irrigation-layout.js';

// One bounded presentation of the actual bypass, saturation and saved wreck.
// No independent clocks, collision, trap triggers or randomly consumed events.
export function createFinalCutIrrigation(scene,{materials,software=false}){
 const root=new THREE.Group();root.name='FinalCutIrrigation';scene.add(root);
 const owned=[],geometries=[],dummy=new THREE.Object3D(),up=new THREE.Vector3(0,1,0),delta=new THREE.Vector3(),mid=new THREE.Vector3(),jetA=new THREE.Vector3(),jetB=new THREE.Vector3(),jetDrop=new THREE.Vector3();
 const box=new THREE.BoxGeometry(),pipe=new THREE.CylinderGeometry(1,1,1,6,1,true),drop=new THREE.TetrahedronGeometry(1,0);geometries.push(box,pipe,drop);
 const wet=new THREE.MeshLambertMaterial({color:'#426c6a'}),flow=new THREE.MeshLambertMaterial({color:'#8ba9a2'}),mud=new THREE.MeshLambertMaterial({color:'#37382b'}),glint=new THREE.MeshBasicMaterial({color:'#b6d1c7'});owned.push(wet,flow,mud,glint);
 function piece(g,m,x,y,z,sx,sy,sz,parent=root){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);parent.add(o);return o;}
 const uniforms={water:{value:0},clock:{value:0},damage:{value:0},heading:{value:new THREE.Vector2(1,0)},wheels:{value:RIG_WHEELS.map(()=>new THREE.Vector2())}};
 const soilFunctions=`float soilNoise(vec2 p){vec3 a=fract(vec3(p.xyx)*.1031);a+=dot(a,a.yzx+33.33);return fract((a.x+a.y)*a.z);}
  float sodHeight(vec2 p){float edge=clamp((6.0-max(abs(p.x),abs(p.y)))*2.0,0.0,1.0);return .018+edge*(.025+.065*soilNoise(floor((p+6.0)*1.3)))*(1.0-swaleWater*.25);}
  `;
 function bind(s){Object.assign(s.uniforms,{swaleWater:uniforms.water,swaleClock:uniforms.clock,swaleDamage:uniforms.damage,swaleHeading:uniforms.heading,swaleWheels:uniforms.wheels});}
 const soil=new THREE.MeshLambertMaterial({map:materials.grass.map,color:materials.grass.color});owned.push(soil);
 soil.onBeforeCompile=s=>{
  bind(s);
  s.vertexShader='uniform float swaleWater; varying vec2 vSwale;\n'+soilFunctions+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   vSwale=position.xz;
   // A few centimetres of sod compress above the existing solid substrate.
   // This creates shallow soil relief without inventing a walkable deep hole.
   transformed.y+=sodHeight(position.xz);`);
  s.fragmentShader=`uniform float swaleWater; uniform float swaleClock; uniform float swaleDamage;
   uniform vec2 swaleHeading; uniform vec2 swaleWheels[4]; varying vec2 vSwale;
   `+soilFunctions+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`
   vec2 pixel=floor((vSwale+6.0)*6.0)/6.0;
   float grain=soilNoise(floor(pixel*6.0));
   float shore=soilNoise(floor(pixel*1.3));
   float fromPipe=6.0-vSwale.x;
   float damp=smoothstep(-.8,.8,swaleWater*14.0-1.0-fromPipe+shore*.7);
   float oldRut=(1.0-smoothstep(.09,.23,abs(abs(vSwale.y)-1.5)))*(1.0-smoothstep(4.5,5.5,abs(vSwale.x)));
   float rut=0.0;
   for(int i=0;i<4;i++){
    vec2 d=vSwale-swaleWheels[i];float along=abs(dot(d,swaleHeading)),across=abs(dot(d,vec2(-swaleHeading.y,swaleHeading.x)));
    rut=max(rut,(1.0-smoothstep(.95,1.3,along))*(1.0-smoothstep(.25,.48,across))*swaleDamage);
   }
   vec3 turf=texture2D(map,(vSwale+vec2(${SWALE.x.toFixed(1)},${(-SWALE.y).toFixed(1)}))/6.0).rgb*diffuse;
   turf=pow(max(turf,vec3(0.0)),vec3(.46))*.75+vec3(.025,.035,.018);
   // Poor drainage has left a worn clay basin before the bypass is opened.
   // Its irregular pale edge and old ruts distinguish low ground at a distance;
   // only the real saturation uniform darkens it and raises the water.
   float bare=1.0-smoothstep(.70,1.0,length(vSwale/vec2(5.8,5.6))+(shore-.5)*.12);
   vec3 clay=vec3(.18,.15,.09)*(.88+grain*.24);
   turf=mix(turf,clay,bare*.86);
   vec3 dirt=vec3(.055,.058,.035)*(0.8+grain*.4);
   vec3 ground=mix(turf,dirt,clamp(oldRut*.7+damp*.68+rut,0.0,1.0));
   diffuseColor.rgb=ground;
   `);
 };
 soil.customProgramCacheKey=()=> 'final-cut-saturated-soil-3';
 const groundGeometry=new THREE.PlaneGeometry(SWALE.w,SWALE.d,software?12:24,software?12:24);groundGeometry.rotateX(-Math.PI/2);geometries.push(groundGeometry);
 const ground=new THREE.Mesh(groundGeometry,soil);ground.position.set(SWALE.x,0,-SWALE.y);root.add(ground);
 // Separate rising surface: soil hummocks and shoreline are depth-tested,
 // rather than painting a rectangle of water onto the grass.
 const waterMaterial=new THREE.MeshLambertMaterial({color:'#668d89'});owned.push(waterMaterial);
 waterMaterial.onBeforeCompile=s=>{
  bind(s);s.vertexShader='uniform float swaleWater; varying vec2 vSwale; varying float vSodHeight;\n'+soilFunctions+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   vSwale=position.xz;vSodHeight=sodHeight(position.xz);transformed.y=.022+swaleWater*.065;`);
  s.fragmentShader=`uniform float swaleWater;uniform float swaleClock;uniform float swaleDamage;uniform vec2 swaleHeading;uniform vec2 swaleWheels[4];varying vec2 vSwale;varying float vSodHeight;\n`+soilFunctions+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`
   vec2 pixel=floor((vSwale+6.0)*6.0)/6.0;float shore=soilNoise(floor(pixel*1.3));
   float front=swaleWater*14.0-1.0-(6.0-vSwale.x)+shore*.7;
   if(front<0.0||.022+swaleWater*.065<vSodHeight+.001||max(abs(vSwale.x),abs(vSwale.y))>5.25+shore*.38)discard;
   float ripple=step(.94,fract(pixel.x*.73+pixel.y*.41-swaleClock*.12));
   vec3 waterColor=vec3(.07,.14,.14)*(0.9+shore*.16)+vec3(.035,.045,.04)*ripple;
   float silt=0.0;for(int i=0;i<4;i++){vec2 d=vSwale-swaleWheels[i];float along=abs(dot(d,swaleHeading)),across=abs(dot(d,vec2(-swaleHeading.y,swaleHeading.x)));silt=max(silt,(1.0-smoothstep(.95,1.3,along))*(1.0-smoothstep(.25,.48,across))*swaleDamage);}
   diffuseColor.rgb=mix(waterColor,vec3(.055,.058,.035),silt*.7);`);
 };waterMaterial.customProgramCacheKey=()=> 'final-cut-rising-water-1';
 const waterSurface=new THREE.Mesh(groundGeometry,waterMaterial);waterSurface.position.copy(ground.position);root.add(waterSurface);

 // The existing feed pipe reaches this manifold at x17/y74. A hinged end
 // tears open at the saved rupture beat; it never becomes lethal debris.
 piece(pipe,materials.metal,17,.43,-74,.13,.46,.13);
 const manifold=piece(pipe,materials.metal,17,.65,-74,.13,.7,.13);manifold.rotation.z=Math.PI/2;
 const cap=new THREE.Group();cap.position.set(17.35,.77,-74);root.add(cap);piece(box,materials.brass,-.02,-.12,0,.06,.28,.3,cap);
 const nozzles=[70,72,74].map(y=>{piece(pipe,materials.brass,17,.36,-y,.07,.32,.07);return {x:17,y,z:-y};});

 const jetSegments=12,jetCount=6,streams=new THREE.InstancedMesh(pipe,flow,jetSegments*jetCount),droplets=new THREE.InstancedMesh(drop,glint,software?48:90);
 streams.frustumCulled=droplets.frustumCulled=false;root.add(streams,droplets);
 const clod=new THREE.BoxGeometry(),clodTop=new THREE.PlaneGeometry(1,1);clodTop.rotateX(-Math.PI/2);geometries.push(clod,clodTop);
 for(const [g,top]of [[clod,false],[clodTop,true]]){const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),upper=top||y>0;p.setXYZ(i,x*(z>0?.65:1),upper?.5-(z>0?.25:0)-(x<0?.12:0):y,z);}g.computeVertexNormals();}
 const clodCount=16,bottoms=new THREE.InstancedMesh(clod,mud,clodCount),tops=new THREE.InstancedMesh(clodTop,materials.grass,clodCount);bottoms.frustumCulled=tops.frustumCulled=false;root.add(bottoms,tops);
 const stains=new THREE.InstancedMesh(box,wet,3);root.add(stains);
 for(let k=0;k<3;k++){const seat=burstSeat(k);dummy.position.set(seat.x,seat.height+.008,-seat.y);dummy.rotation.set(0,0,0);dummy.scale.set(.58,.012,.62);dummy.updateMatrix();stains.setMatrixAt(k,dummy.matrix);}stains.computeBoundingSphere();
 let state={water:0,ready:false,rupture:false,streams:0,droplets:0,clods:0,wheels:[],wetSeats:false};
 function pointOnJet(index,t,pressure,target){
  if(index<3){const n=nozzles[index];return target.set(n.x-t*4.4,.48+Math.sin(t*Math.PI)*.85-t*.43,n.z-t*.6);}
  return burstPoint(index-3,t,pressure,target);
 }
 function update(r,reduced=false){
  const fill=clamp(r.water,0,1),age=r.won?r.ending.age:0,clock=r.won?age:r.elapsed,ruptured=r.won&&age>=3.2,pressure=ruptured?1-.8*clamp((age-8)/8,0,1):0,grow=clamp((age-3.2)/.65,0,1),damage=r.won?clamp(age/4,0,1):0;
  uniforms.water.value=fill;uniforms.clock.value=reduced?0:clock;uniforms.damage.value=damage;uniforms.heading.value.set(Math.sin(r.rig.yaw),-Math.cos(r.rig.yaw));
  waterSurface.visible=fill>0;
  const wheels=r.won?RIG_WHEELS.map(w=>worldPart(r.rig,w)):[];for(let i=0;i<4;i++)uniforms.wheels.value[i].set((wheels[i]?.x||0)-SWALE.x,-(wheels[i]?.y||0)+SWALE.y);
  cap.rotation.z=ruptured?-clamp((age-3.2)/.3,0,1)*1.35:0;
  let streamCount=0;
  if(r.pump)for(let j=0;j<jetCount;j++){
   if(j>=3&&(!ruptured||reduced))continue;
   const extent=j<3?clamp(fill*6,0,1):grow;
   for(let k=0;k<jetSegments;k++){
    if(j>=3&&k>3&&(Math.floor(k+clock*7)+j)%4===0)continue;
    const a=pointOnJet(j,k/jetSegments*extent,pressure,jetA),b=pointOnJet(j,(k+1)/jetSegments*extent,pressure,jetB);delta.copy(b).sub(a);mid.copy(a).add(b).multiplyScalar(.5);const length=delta.length();
    dummy.position.copy(mid);dummy.quaternion.setFromUnitVectors(up,delta.normalize());const radius=j<3?.015:(.036-k*.0015)*pressure;dummy.scale.set(radius,Math.max(.0001,length),radius);dummy.updateMatrix();streams.setMatrixAt(streamCount++,dummy.matrix);
   }
  }
  streams.count=streamCount;streams.visible=streamCount>0;streams.instanceMatrix.needsUpdate=true;
  droplets.visible=r.pump&&!reduced;
  if(droplets.visible){for(let i=0;i<droplets.count;i++){const j=i%(ruptured?6:3),t=(clock*.7+i*.137)%1,p=pointOnJet(j,t*(j<3?clamp(fill*6,0,1):grow),pressure,jetDrop);p.x+=Math.sin(i*7)*t*.14;p.z+=Math.cos(i*3)*t*.2;dummy.position.copy(p);dummy.rotation.set(i,t*6,0);dummy.scale.setScalar((j<3?.025:.045)*(1-t*.4));dummy.updateMatrix();droplets.setMatrixAt(i,dummy.matrix);}droplets.instanceMatrix.needsUpdate=true;}
  tops.visible=bottoms.visible=r.won;let clods=0;
  if(r.won)for(let w=0;w<4;w++)for(let k=0;k<4;k++){
   const wheel=wheels[w],side=k%2?1:-1,along=(k<2?-.7:.7),angle=r.rig.yaw,dx=Math.cos(angle)*side*.48+Math.sin(angle)*along,dy=-Math.sin(angle)*side*.48+Math.cos(angle)*along;
   const lift=damage*(.14+(k%3)*.06)+(!reduced&&age<3?Math.sin(Math.min(1,age/3)*Math.PI)*.18:0);
   dummy.position.set(wheel.x+dx,.04+lift,-wheel.y-dy);dummy.rotation.set(.12*side,-angle,.25*side*damage);dummy.scale.set(.48,.16*damage+.01,.52);dummy.updateMatrix();bottoms.setMatrixAt(clods,dummy.matrix);
   dummy.position.y+=.004;dummy.updateMatrix();tops.setMatrixAt(clods++,dummy.matrix);
  }
  if(r.won){bottoms.instanceMatrix.needsUpdate=true;tops.instanceMatrix.needsUpdate=true;}
  stains.visible=r.won&&age>=4.2;
  state={water:fill,waterHeight:.022+fill*.065,ready:fill>=1,rupture:ruptured,pressure,streams:streamCount,droplets:droplets.visible?droplets.count:0,clods,wetSeats:stains.visible,wheels:wheels.map(w=>({x:w.x,y:w.y})),reduced};
 }
 return {update,stats:()=>state,dispose(){scene.remove(root);geometries.forEach(g=>g.dispose());owned.forEach(m=>m.dispose());}};
}
