import * as THREE from './vendor/three/three.module.js';
import {mergeGeometries} from './vendor/three/addons/utils/BufferGeometryUtils.js';
import {woodlandHeight} from './pixel-landscape.js';

// Bounded, cosmetic details. No scenery inside the playable boundary acquires
// collision, and no mark or clipping changes the game's hearing/cover evidence.
export function createCourseVisualDetail(world,data,{scale=.16,xScale=.1152,software=false}={}){
 const root=new THREE.Group();root.name='CourseVisualDetail';world.add(root);
 const ownedGeometry=[],ownedMaterials=[],motions=[],lamps=[],parts=[];
 const box=new THREE.BoxGeometry(1,1,1),dummy=new THREE.Object3D(),up=new THREE.Vector3(0,1,0);ownedGeometry.push(box);
 const material=(type,opts)=>{const m=new type(opts);ownedMaterials.push(m);return m;};
 const timber=material(THREE.MeshLambertMaterial,{color:0x798477}),iron=material(THREE.MeshPhongMaterial,{color:0x586265,specular:0x707c80,shininess:32});
 function branch(a,b,r1,r2){const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),d=vb.clone().sub(va),g=new THREE.CylinderGeometry(r2,r1,d.length(),6,1);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(up,d.clone().normalize()));g.translate(...va.add(vb).multiplyScalar(.5).toArray());parts.push(g);}
 // A forked dead oak beside the pond and a smaller broken tree framing the
 // maintenance approach. All branches remain outside the playable course.
 for(const [x,z,h]of [[15.3,-35,7.2],[-15.4,-103,5.8]]){
  const y=woodlandHeight(x,z),side=Math.sign(x);
  branch([x,y,z],[x+side*.45,y+h*.63,z-.5],.43,.22);
  branch([x+side*.45,y+h*.63,z-.5],[x+side*.08,y+h,z-.9],.22,.055);
  for(const [fraction,reach,dz]of [[.43,2.0,1.2],[.63,1.7,-1.8],[.76,1.1,.65]]){
   const a=[x+side*.3,y+h*fraction,z-.4],b=[x+side*reach,y+h*(fraction+.12),z+dz];branch(a,b,.14,.045);branch(b,[b[0]+side*.35,b[1]+.8,b[2]-.3],.05,.012);
  }
 }
 const trees=mergeGeometries(parts);parts.forEach(g=>g.dispose());ownedGeometry.push(trees);const tree=new THREE.Mesh(trees,timber);tree.name='CourseLandmarkDeadOaks';tree.castShadow=true;root.add(tree);
 function piece(parent,x,y,z,w,h,d,mat=iron){const m=new THREE.Mesh(box,mat);m.position.set(x,y,z);m.scale.set(w,h,d);parent.add(m);return m;}
 // A wind-tugged hanging maintenance sign and a torn range pennant provide
 // sparse motion at fixed landmarks, never a camera-attached decoration.
 const signRoot=new THREE.Group();signRoot.position.set(-15,-0.0,-38);signRoot.position.y=woodlandHeight(-15,-38);root.add(signRoot);
 piece(signRoot,0,1.65,0,.10,3.3,.10);piece(signRoot,.55,3.15,0,1.2,.075,.075);
 const sign=new THREE.Group();sign.position.set(.65,3.02,0);signRoot.add(sign);piece(sign,0,-.15,0,.025,.3,.025);piece(sign,0,-.49,0,.95,.44,.065,timber);
 const warning=material(THREE.MeshLambertMaterial,{color:0xb8a366});for(const angle of [-.7,.7])piece(sign,0,-.49,.037,.033,.34,.008,warning).rotation.z=angle;motions.push({node:sign,kind:'sign'});
 const pole=new THREE.Group();pole.position.set(14.8,woodlandHeight(14.8,-89),-89);root.add(pole);piece(pole,0,2.7,0,.065,5.4,.065);
 const flagGeometry=new THREE.PlaneGeometry(1.5,.66,8,3);flagGeometry.translate(.75,-.33,0);const flagPoints=flagGeometry.attributes.position;for(let i=0;i<flagPoints.count;i++)if(flagPoints.getX(i)>1.49)flagPoints.setX(i,1.5-(i%4)*.09);flagGeometry.computeVertexNormals();ownedGeometry.push(flagGeometry);
 const flagMaterial=material(THREE.MeshLambertMaterial,{color:0x898879,side:THREE.DoubleSide});const flag=new THREE.Mesh(flagGeometry,flagMaterial);flag.position.y=5.1;pole.add(flag);motions.push({node:flag,kind:'flag'});
 const clock={value:0};flagMaterial.onBeforeCompile=s=>{s.uniforms.detailClock=clock;s.vertexShader='uniform float detailClock;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.z+=position.x*.10*sin(detailClock*1.8-position.x*3.0);');};flagMaterial.customProgramCacheKey=()=> 'course-range-flag-v1';
 for(const [x,y,z,power]of [[-16.7,2.2,-34.2,7],[14.4,2.4,-50.4,5]]){const light=new THREE.PointLight(0xffbb76,power,7,2);light.name='CourseWarmWindowSpill';light.position.set(x,y,z);root.add(light);lamps.push(light);}
 const capacity=software?32:64,clippings=new THREE.InstancedMesh(box,material(THREE.MeshLambertMaterial,{color:0x9aaa64}),capacity);clippings.name='CourseMowerClippings';clippings.frustumCulled=false;clippings.instanceMatrix.setUsage(THREE.DynamicDrawUsage);root.add(clippings);clippings.count=0;
 const trackGeometry=new THREE.PlaneGeometry(1,1,4,1);trackGeometry.rotateX(-Math.PI/2);ownedGeometry.push(trackGeometry);
 const fades=new THREE.InstancedBufferAttribute(new Float32Array(32),1);fades.setUsage(THREE.DynamicDrawUsage);trackGeometry.setAttribute('cutFade',fades);
 const trackMaterial=material(THREE.MeshLambertMaterial,{color:0x7d8c5f,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
 trackMaterial.onBeforeCompile=s=>{s.vertexShader='attribute float cutFade;varying float vCutFade;varying vec2 vCutUv;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvCutFade=cutFade;vCutUv=uv;');s.fragmentShader='varying float vCutFade;varying vec2 vCutUv;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <alphatest_fragment>','float blade=step(.35,fract(vCutUv.x*11.0+sin(vCutUv.y*24.0)*.4));diffuseColor.a*=vCutFade*.30*blade*smoothstep(0.0,.12,vCutUv.x)*smoothstep(0.0,.12,1.0-vCutUv.x);\n#include <alphatest_fragment>');};trackMaterial.customProgramCacheKey=()=> 'course-cut-grass-v1';
 const tracks=new THREE.InstancedMesh(trackGeometry,trackMaterial,32);tracks.name='CourseFlattenedGrass';tracks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);tracks.frustumCulled=false;tracks.count=0;root.add(tracks);
 const pool=Array.from({length:capacity},()=>({born:-100})),marks=[];
 const obstacles=data.obstacles.filter(o=>o.blocks||o.id.includes('pond')).map(o=>({x:o.x*xScale,z:-o.y*scale,rx:(o.radiusX||o.radius)*scale,rz:(o.radiusY||o.radius)*scale}));
 const paths=data.paths.flatMap(path=>path.slice(1).map((p,i)=>[{x:path[i].x*xScale,z:-path[i].y*scale},{x:p.x*xScale,z:-p.y*scale}]));
 const canCut=(x,z)=>Math.abs(x)<12.8&&z<0&&z>-114&&!obstacles.some(o=>((x-o.x)/(o.rx+.25))**2+((z-o.z)/(o.rz+.25))**2<1)&&paths.every(([a,b])=>{const dx=b.x-a.x,dz=b.z-a.z,t=THREE.MathUtils.clamp(((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz||1),0,1);return Math.hypot(x-a.x-dx*t,z-a.z-dz*t)>.85;});
 let previous=null,time=0,last=null,serial=0,carry=0,emitted=0,lastMark=null;
 function update(frame){
  if(last!==null&&frame.time<last){pool.forEach(p=>p.born=-100);marks.length=0;previous=lastMark=null;time=0;carry=0;}
  const dt=last===null||frame.paused?0:Math.min(.1,Math.max(0,frame.time-last));last=frame.time;time+=dt;
  const reduced=frame.reducedMotion||frame.fx?.enabled===false,detail=(frame.fx?.density??1)>0;
  if(reduced)pool.forEach(p=>p.born=-100);
  clock.value=reduced?0:time;sign.rotation.z=reduced?0:Math.sin(time*.71)*.045+Math.sin(time*1.37)*.012;
  const j=frame.joe,h=j.effectHeading||0,dx=Math.cos(h),dz=-Math.sin(h),x=j.x*xScale+dx*.82,z=-j.y*scale+dz*.82;
  const distance=previous?Math.hypot(x-previous.x,z-previous.z):0,moving=dt>0&&distance>.001&&distance<1&&(j.effectSpeed||0)>.4;previous={x,z};
  if(moving&&canCut(x,z)&&detail){
   if(!lastMark||Math.hypot(x-lastMark.x,z-lastMark.z)>.32){marks.push({x,z,h,born:time});if(marks.length>32)marks.shift();lastMark={x,z};}
   if(!reduced){carry+=dt*(software?16:28);while(carry>=1){carry--;const n=serial++,side=n%2?1:-1,p=pool[n%capacity];Object.assign(p,{born:time,x:x-dz*side*.55,z:z+dx*side*.55,vx:-dz*side*(.7+n%4*.17),vz:dx*side*(.7+n%4*.17),up:1.1+n%3*.16,spin:n*2.4});emitted++;}}
  }else carry=0;
  let active=0;for(const p of pool){const age=time-p.born;if(age<0||age>.85||reduced||!detail)continue;const xx=p.x+p.vx*age,zz=p.z+p.vz*age;dummy.position.set(xx,woodlandHeight(xx,zz)+Math.max(.025,.14+p.up*age-2.8*age*age),zz);dummy.rotation.set(p.spin+age*8,p.spin,age*5);const fade=Math.min(1,(.85-age)*6);dummy.scale.set(.025*fade,.065*fade,.012*fade);dummy.updateMatrix();clippings.setMatrixAt(active++,dummy.matrix);}clippings.count=active;clippings.visible=active>0;if(active)clippings.instanceMatrix.needsUpdate=true;
  while(marks.length&&time-marks[0].born>12)marks.shift();let count=0;for(const m of marks){dummy.position.set(m.x,woodlandHeight(m.x,m.z)+.014,m.z);dummy.rotation.set(0,m.h-Math.PI/2,0);dummy.scale.set(1.05,1,.52);dummy.updateMatrix();tracks.setMatrixAt(count,dummy.matrix);fades.setX(count++,Math.min(1,(12-time+m.born)/3));}tracks.count=count;tracks.visible=detail&&count>0;if(count){tracks.instanceMatrix.needsUpdate=true;fades.needsUpdate=true;}
 }
 return {update,stats:()=>({landmarks:3,movingProps:motions.length,clock:clock.value,clippings:clippings.count,clippingCapacity:capacity,emitted,cutStrips:tracks.count,windowLights:lamps.length}),dispose(){root.removeFromParent();clippings.dispose();tracks.dispose();ownedGeometry.forEach(g=>g.dispose());ownedMaterials.forEach(m=>m.dispose());}};
}
