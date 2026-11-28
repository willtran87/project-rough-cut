import * as THREE from './vendor/three/three.module.js';
import {REFUGES,WALLS,SECTORS,inside,isCut} from './final-cut-course.js';
import {OVERLOOK} from './final-cut-arrival-layout.js';
import {RIG_HEADLAMPS,RIG_BANK,CUT_HALF_WIDTH} from './final-cut-rig.js';
import {headlampOrigin} from './final-cut-lamps.js';

// Championship staging made only from unlit additive/alpha meshes. Nothing
// here is a real light, no mesh is ever hidden or shown, and every pool has a
// fixed capacity: the lit materials' light counts and defines never change.
// World motion follows simulation time, so a paused round is a frozen frame.
export const FLOOD_MASTS=[{x:-28,y:22,aim:{x:-8,y:34}},{x:47,y:22,aim:{x:14,y:30}},{x:-28,y:70,aim:{x:-9,y:60}},{x:27,y:70,aim:{x:8,y:62}}];
export const OVERLOOK_SIGN={x:-2,height:OVERLOOK.h+2.75,z:5.22,width:8,face:.6};
export const BUNTING_POLES=[{x:-8,z:-4,top:8.2},{x:4,z:-4,top:8.2}];
// Shielded eave lamps wash every full-height outer refuge wall, so the stone
// shelters read as warm, lit places from anywhere on the dark fairway. The
// south wall carries the refuge's name board, so its centre stays clear.
export const REFUGE_WASHES=REFUGES.flatMap(s=>{
 const out=[],tall=id=>WALLS.find(w=>w.id===s.id+'-'+id).h>2,row=(cx,cz,nx,nz,length,clear=0)=>{const n=Math.round(length/3);for(let i=0;i<n;i++){const t=((i+.5)/n-.5)*length;if(Math.abs(t)>=clear)out.push({x:cx+(nz?t:0),z:cz+(nx?t:0),nx,nz});}};
 if(tall('west'))row(s.x-s.w/2-.35,-s.y,-1,0,s.d);if(tall('back'))row(s.x,-s.y+s.d/2+.35,0,1,s.w,2.2);if(tall('front'))row(s.x,-s.y-s.d/2-.35,0,-1,s.w);
 return out;
});
const SEARCHLIGHTS=[{x:-41,y:113,lean:.34,phase:0},{x:45,y:109,lean:-.3,phase:2.1}];
const EXHAUSTS=[[-1.3,3.2,2.05],[1.3,3.2,2.05]];
const PUFFS=28,DUST=16,SPRAY=160;

// gain: floodlight weight, constant weight, floodlight bank (-1 for none).
const bankLevel='float bankLevel(float bank,vec4 banks){return bank<-.5?1.:dot(banks,step(abs(vec4(0.,1.,2.,3.)-bank),vec4(.5)));}';
const beamVertex=`attribute float along;attribute vec3 tint;attribute vec3 gain;varying float vAlong;varying vec3 vTint;varying vec3 vNormal;varying vec3 vView;varying vec3 vWorld;uniform float wash;uniform vec4 banks;${bankLevel}
void main(){vAlong=along;vTint=tint*(gain.x*wash*bankLevel(gain.z,banks)+gain.y);vec4 world=modelMatrix*vec4(position,1.);vWorld=world.xyz;vec4 mv=viewMatrix*world;vView=-mv.xyz;vNormal=normalMatrix*normal;gl_Position=projectionMatrix*mv;}`;
const beamFragment=`varying float vAlong;varying vec3 vTint;varying vec3 vNormal;varying vec3 vView;varying vec3 vWorld;uniform float time;
void main(){float range=length(vView),rim=abs(dot(normalize(vNormal),vView/max(range,.001)));
 float body=pow(rim,1.7)*pow(1.-vAlong,1.35)*smoothstep(0.,.05,vAlong)*smoothstep(.4,3.5,range);
 float dust=.8+.2*sin(vWorld.x*.83+vWorld.y*1.9+vWorld.z*.57+time*.4)*sin(vWorld.z*.31-time*.23+vWorld.y);
 gl_FragColor=vec4(vTint*body*dust,1.);}`;
const poolVertex=`attribute vec2 disc;attribute vec3 tint;attribute vec3 gain;varying vec2 vDisc;varying vec3 vTint;uniform float wash;uniform vec4 banks;${bankLevel}
void main(){vDisc=disc;vTint=tint*(gain.x*wash*bankLevel(gain.z,banks)+gain.y);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const poolFragment=`varying vec2 vDisc;varying vec3 vTint;
void main(){float d=length(vDisc),a=1.-smoothstep(.15,1.,d);gl_FragColor=vec4(vTint*a*a,1.);}`;
const spriteVertex=`attribute vec4 spot;attribute vec4 tint;attribute vec3 form;varying vec2 vUv;varying vec4 vTint;varying float vPower;
void main(){vUv=position.xy*2.;vTint=tint;vPower=form.y;vec4 mv=viewMatrix*vec4(spot.xyz,1.);mv.xy+=position.xy*spot.w*vec2(form.x,1.);mv.z+=form.z;gl_Position=projectionMatrix*mv;}`;
// Premultiplied output: zero coverage is pure additive glow, otherwise haze.
const spriteFragment=`varying vec2 vUv;varying vec4 vTint;varying float vPower;
void main(){float d=length(vUv);if(d>=1.)discard;float a=pow(1.-d,vPower);
 gl_FragColor=vTint.a>0.?vec4(vTint.rgb*vTint.a*a,vTint.a*a):vec4(vTint.rgb*a,0.);}`;
const skyVertex=`varying vec3 vWorld;void main(){vec4 world=modelMatrix*vec4(position,1.);vWorld=world.xyz;gl_Position=projectionMatrix*viewMatrix*world;}`;
const skyFragment=`varying vec3 vWorld;uniform float wash;uniform float time;uniform float dawn;
void main(){vec3 ray=vWorld-cameraPosition;float h=ray.y/length(ray.xz),e=max(h,0.),land=smoothstep(-.07,0.,h);vec2 az=normalize(ray.xz);
 float north=pow(max(0.,dot(az,vec2(0.,-1.))),2.),drift=.9+.1*sin(az.x*5.+time*.05)*sin(az.y*7.-time*.04);
 vec3 cold=vec3(.03,.075,.105)*(.55+.45*wash)*exp(-e*7.);
 vec3 stadium=vec3(.17,.185,.13)*wash*exp(-e*4.2);
 vec3 town=vec3(.3,.18,.08)*north*(.3+.3*wash)*exp(-e*12.);
 float toward=.25+.75*pow(max(0.,dot(az,vec2(.45,.893))),1.5);
 vec3 first=mix(vec3(.95,.4,.13),vec3(.6,.25,.33),smoothstep(0.,.17,e))*exp(-e*6.5)*toward+vec3(.09,.16,.25)*exp(-e*2.4);
 gl_FragColor=vec4((cold+stadium*drift+town+first*dawn*1.6)*land*(1.-smoothstep(.22,.48,e)),1.);}`;
const clothVertex=`attribute vec3 hang;attribute vec3 tint;varying vec3 vTint;uniform float time;uniform float calm;uniform float wash;
void main(){float free=hang.x,phase=hang.y,reach=hang.z;vec3 p=position;
 float gust=.6+.4*sin(time*.47+phase*.21),wave=sin(time*4.6-reach*5.5+phase)*gust+.35*sin(time*7.3+phase*1.7-reach*9.);
 float ripple=sin(time*5.4-reach*7.+phase*.7);
 p.z+=free*calm*(.11*wave+.07*gust);p.x+=free*calm*(.1*sin(time*3.1+phase*1.3)*gust+.035*wave);p.y+=free*calm*(.075*ripple*gust-.03*gust);
 float fold=.78+.22*sin(reach*5.5-time*4.6*calm-phase);vTint=tint*fold*(.3+.45*wash);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`;
const clothFragment=`varying vec3 vTint;void main(){gl_FragColor=vec4(vTint,1.);}`;

function coneBuilder(){
 const position=[],normal=[],along=[],tint=[],gain=[],index=[],d=new THREE.Vector3(),u=new THREE.Vector3(),v=new THREE.Vector3(),n=new THREE.Vector3(),p=new THREE.Vector3();
 return {add(apex,target,radius,color,weights,segments=28,rings=6){
  d.set(target[0]-apex[0],target[1]-apex[1],target[2]-apex[2]);const length=d.length(),first=position.length/3;d.normalize();
  u.set(Math.abs(d.y)>.9?1:0,Math.abs(d.y)>.9?0:1,0).cross(d).normalize();v.crossVectors(d,u);
  for(let ring=0;ring<=rings;ring++)for(let seg=0;seg<=segments;seg++){
   const t=ring/rings,a=seg/segments*Math.PI*2,r=radius*(.03+.97*t);n.copy(u).multiplyScalar(Math.cos(a)).addScaledVector(v,Math.sin(a));
   p.set(apex[0],apex[1],apex[2]).addScaledVector(d,length*t).addScaledVector(n,r);position.push(p.x,p.y,p.z);
   n.multiplyScalar(length).addScaledVector(d,-radius).normalize();normal.push(n.x,n.y,n.z);along.push(t);tint.push(...color);gain.push(weights[0],weights[1],weights[2]??-1);
   if(ring<rings&&seg<segments){const q=first+ring*(segments+1)+seg;index.push(q,q+1,q+segments+1,q+1,q+segments+2,q+segments+1);}
  }
 },build(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(position,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(normal,3));g.setAttribute('along',new THREE.Float32BufferAttribute(along,1));g.setAttribute('tint',new THREE.Float32BufferAttribute(tint,3));g.setAttribute('gain',new THREE.Float32BufferAttribute(gain,3));g.setIndex(index);g.computeBoundingSphere();return g;}};
}
// Additive light is order-independent, so both faces draw in one pass
// (three.js otherwise draws back then front and rebuilds the program key twice).
const additive=(vertexShader,fragmentShader,uniforms,extra={})=>new THREE.ShaderMaterial({vertexShader,fragmentShader,uniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,forceSinglePass:true,...extra});

export function createFinalCutAtmosphere(scene,body,{clippingGeometry,clippingMaterial,lite=false}){
 // lite (software rendering): half the shafts at half the detail, no searchlights, still cloth.
 const time={value:0},wash={value:0},haze={value:0},dawn={value:0},banks={value:new THREE.Vector4(1,1,1,1)},beam={value:0},calm={value:1},resources=[];
 const keep=(...items)=>{resources.push(...items);return items[0];};
 const place=(mesh,name,order)=>{mesh.name=name;mesh.frustumCulled=false;mesh.renderOrder=order;mesh.matrixAutoUpdate=false;return mesh;};
 // Tournament floodlight shafts and the refuge doorway cones share one draw.
 const cones=coneBuilder(),warm=[1,.72,.4],flood=[.66,.7,.56];
 FLOOD_MASTS.forEach((m,i)=>{if(!lite||i>1)cones.add([m.x,9.9,-m.y],[m.aim.x,0,-m.aim.y],Math.hypot(m.aim.x-m.x,m.aim.y-m.y,9.9)*.34,flood,[.42,0,i],lite?14:28,lite?3:6);});
 for(const s of REFUGES){const x=s.x+s.w/2+.23;cones.add([x,2.19,-s.y],[x+.35,0,-s.y],1.5,warm,[0,.3],20,4);}
 const shafts=place(new THREE.Mesh(keep(cones.build()),keep(additive(beamVertex,beamFragment,{time,wash,banks}))),'FinalCutLightShafts',20);scene.add(shafts);
 // Two slow searchlights stand beyond the public road end of the hole.
 const searchlights=(lite?[]:SEARCHLIGHTS).map(spec=>{const c=coneBuilder();c.add([0,0,0],[0,120,0],5.5,[.5,.56,.5],[.2,0],20,8);const m=new THREE.Mesh(keep(c.build()),shafts.material);m.name='FinalCutSearchlight';m.frustumCulled=false;m.renderOrder=19;m.position.set(spec.x,1.5,-spec.y);m.rotation.order='ZXY';scene.add(m);return {mesh:m,spec};});
 // Rig work lights: the cones ride the body, so they roll and sink with it.
 const head=coneBuilder();
 for(const spec of RIG_HEADLAMPS){const o=headlampOrigin(spec);head.add(o,[spec.side*1.5,.25,o[2]-17],5.2,[1,.86,.6],[.36,0],24,6);}
 const headBeams=place(new THREE.Mesh(keep(head.build()),keep(additive(beamVertex,beamFragment,{time,wash:beam,banks:{value:new THREE.Vector4(1,1,1,1)}}))),'FinalCutWorkLightCones',21);headBeams.matrixAutoUpdate=true;body.add(headBeams);
 // Light pools: floodlit turf under each shaft, lamplight on each refuge apron.
 const discs={position:[],disc:[],tint:[],gain:[],index:[]};
 function pool(x,z,rx,rz,color,weights,turn=0){const first=discs.position.length/3,cs=Math.cos(turn),sn=Math.sin(turn);for(const [a,b]of [[-1,-1],[1,-1],[1,1],[-1,1]]){discs.position.push(x+a*rx*cs-b*rz*sn,.07,z+a*rx*sn+b*rz*cs);discs.disc.push(a,b);discs.tint.push(...color);discs.gain.push(weights[0],weights[1],weights[2]??-1);}discs.index.push(first,first+2,first+1,first,first+3,first+2);}
 FLOOD_MASTS.forEach((m,i)=>pool(m.aim.x,-m.aim.y,13,9,flood,[.2,0,i],Math.atan2(-(m.aim.y-m.y),m.aim.x-m.x)));
 for(const s of REFUGES)pool(s.x+s.w/2+.9,-s.y,3.1,3.4,warm,[0,.2]);
 for(const w of REFUGE_WASHES){const first=discs.position.length/3,x=w.x+w.nx*.045,z=w.z+w.nz*.045;for(const [a,b]of [[-1,0],[1,0],[1,1],[-1,1]]){discs.position.push(x-w.nz*a*1.7,2.5-b*2.45,z+w.nx*a*1.7);discs.disc.push(a,b);discs.tint.push(...warm);discs.gain.push(0,.5,-1);}discs.index.push(first,first+2,first+1,first,first+3,first+2);
  pool(w.x+w.nx*1.1,w.z+w.nz*1.1,w.nx?1.5:2,w.nx?2:1.5,warm,[0,.12]);}
 const poolGeometry=keep(new THREE.BufferGeometry());poolGeometry.setAttribute('position',new THREE.Float32BufferAttribute(discs.position,3));poolGeometry.setAttribute('disc',new THREE.Float32BufferAttribute(discs.disc,2));poolGeometry.setAttribute('tint',new THREE.Float32BufferAttribute(discs.tint,3));poolGeometry.setAttribute('gain',new THREE.Float32BufferAttribute(discs.gain,3));poolGeometry.setIndex(discs.index);
 const pools=place(new THREE.Mesh(poolGeometry,keep(additive(poolVertex,poolFragment,{wash,banks},{polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}))),'FinalCutLightPools',5);scene.add(pools);
 // Low horizon haze: a cold night band, floodlit air and the town to the north.
 const sky=place(new THREE.Mesh(keep(new THREE.CylinderGeometry(150,150,120,48,1,true)),keep(additive(skyVertex,skyFragment,{time,wash:haze,dawn},{side:THREE.BackSide}))),'FinalCutHorizonHaze',-5);sky.matrixAutoUpdate=true;scene.add(sky);
 // Tournament bunting and the 18th flag: one cloth draw, moved in the shader.
 const cloth={position:[],hang:[],tint:[],index:[]},colors=[[.83,.79,.62],[.62,.2,.15],[.72,.58,.26],[.14,.36,.3]];
 function swag(a,b,sag,count,seed){
  const first=cloth.position.length/3,at=t=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t-Math.sin(t*Math.PI)*sag,a[2]+(b[2]-a[2])*t];
  // The cord is a thin ribbon; each pennant hangs from two points on it.
  for(let i=0;i<=count;i++){const p=at(i/count);cloth.position.push(p[0],p[1]+.012,p[2],p[0],p[1]-.012,p[2]);cloth.hang.push(0,seed,0,0,seed,0);cloth.tint.push(.2,.21,.18,.2,.21,.18);if(i<count){const q=first+i*2;cloth.index.push(q,q+1,q+2,q+1,q+3,q+2);}}
  for(let i=0;i<count;i++){const l=at((i+.12)/count),r=at((i+.88)/count),q=cloth.position.length/3,c=colors[(i+seed)%colors.length];cloth.position.push(...l,...r,(l[0]+r[0])/2,(l[1]+r[1])/2-.36,(l[2]+r[2])/2);cloth.hang.push(0,seed+i*.9,0,0,seed+i*.9,.2,1,seed+i*.9,1);cloth.tint.push(...c,...c,c[0]*.8,c[1]*.8,c[2]*.8);cloth.index.push(q,q+1,q+2);}
 }
 const postTop=OVERLOOK.h+3.02,[west,east]=BUNTING_POLES;
 swag([-5.9,postTop,5.12],[west.x,west.top-.12,west.z],.5,17,0);swag([1.9,postTop,5.12],[east.x,east.top-.12,east.z],.5,17,3);swag([west.x,west.top-.12,west.z],[east.x,east.top-.12,east.z],.62,22,7);
 {const first=cloth.position.length/3,cols=9,rows=4;for(let row=0;row<=rows;row++)for(let col=0;col<=cols;col++){const t=col/cols;cloth.position.push(.03+t*1.25,5.42-row/rows*.66,-88);cloth.hang.push(t*1.6,40,t);cloth.tint.push(.66,.22,.16);if(row<rows&&col<cols){const q=first+row*(cols+1)+col;cloth.index.push(q,q+1,q+cols+1,q+1,q+cols+2,q+cols+1);}}}
 const clothGeometry=keep(new THREE.BufferGeometry());clothGeometry.setAttribute('position',new THREE.Float32BufferAttribute(cloth.position,3));clothGeometry.setAttribute('hang',new THREE.Float32BufferAttribute(cloth.hang,3));clothGeometry.setAttribute('tint',new THREE.Float32BufferAttribute(cloth.tint,3));clothGeometry.setIndex(cloth.index);
 const bunting=place(new THREE.Mesh(clothGeometry,keep(new THREE.ShaderMaterial({vertexShader:clothVertex,fragmentShader:clothFragment,uniforms:{time,calm,wash},side:THREE.DoubleSide}))),'FinalCutBunting',0);scene.add(bunting);
 // One billboard draw: fixed lamp glows first, then pooled exhaust and mulch.
 const glows=[];
 const glow=(x,y,z,size,color,stretch=1,power=2.4,push=.3,lit=0)=>glows.push({x,y,z,size,color,stretch,power,push,lit})-1;
 FLOOD_MASTS.forEach((m,i)=>{for(const side of [-1,1])glow(m.x,10.2,-m.y+side*.3,7.5,[.5,.47,.34],1.9,3,.5,i+1);});
 for(const dx of [-2.6,0,2.6])glow(OVERLOOK_SIGN.x+dx,OVERLOOK_SIGN.height+.5,OVERLOOK_SIGN.z+.33,1.7,[.5,.38,.2],1.5,2.2,.25);
 for(const s of REFUGES){glow(s.x+s.w/2+.23,2.2,-s.y,2.2,[.5,.34,.16]);glow(s.x,2.42,-s.y,2.6,[.42,.28,.13]);}
 for(const w of REFUGE_WASHES)glow(w.x+w.nx*.12,2.52,w.z+w.nz*.12,.95,[.42,.3,.15],1,2.2,.15);
 glow(-8,8.1,-4,2.6,[.46,.38,.24]);
 const headGlow=RIG_HEADLAMPS.map(spec=>({spec,slot:glow(0,0,0,0,[.62,.52,.34],1.5,2.6,.45)}));
 const fixed=glows.length,total=fixed+PUFFS+DUST,spot=new Float32Array(total*4),tint=new Float32Array(total*4),form=new Float32Array(total*3);
 glows.forEach((g,i)=>{spot.set([g.x,g.y,g.z,g.size],i*4);tint.set([g.color[0],g.color[1],g.color[2],0],i*4);form.set([g.stretch,g.power,g.push],i*3);});
 for(let i=fixed;i<total;i++)form.set([1,1.2,0],i*3);
 const spriteGeometry=keep(new THREE.InstancedBufferGeometry());spriteGeometry.setAttribute('position',new THREE.Float32BufferAttribute([-.5,-.5,0,.5,-.5,0,.5,.5,0,-.5,.5,0],3));spriteGeometry.setIndex([0,1,2,0,2,3]);
 const spotAttribute=new THREE.InstancedBufferAttribute(spot,4),tintAttribute=new THREE.InstancedBufferAttribute(tint,4);spotAttribute.setUsage(THREE.DynamicDrawUsage);tintAttribute.setUsage(THREE.DynamicDrawUsage);
 spriteGeometry.setAttribute('spot',spotAttribute);spriteGeometry.setAttribute('tint',tintAttribute);spriteGeometry.setAttribute('form',new THREE.InstancedBufferAttribute(form,3));spriteGeometry.instanceCount=total;
 const sprites=place(new THREE.Mesh(spriteGeometry,keep(new THREE.ShaderMaterial({vertexShader:spriteVertex,fragmentShader:spriteFragment,transparent:true,depthWrite:false,blending:THREE.CustomBlending,blendEquation:THREE.AddEquation,blendSrc:THREE.OneFactor,blendDst:THREE.OneMinusSrcAlphaFactor,blendSrcAlpha:THREE.OneFactor,blendDstAlpha:THREE.OneMinusSrcAlphaFactor}))),'FinalCutGlowAndHaze',22);scene.add(sprites);
 // Pooled particles. px/py/pz world, vx/vy/vz m/s, age and life in seconds.
 const pool8=n=>({n,next:0,px:new Float32Array(n),py:new Float32Array(n),pz:new Float32Array(n),vx:new Float32Array(n),vy:new Float32Array(n),vz:new Float32Array(n),age:new Float32Array(n).fill(1),life:new Float32Array(n).fill(1),seed:new Float32Array(n)});
 const puffs=pool8(PUFFS),dust=pool8(DUST),spray=pool8(SPRAY),dummy=new THREE.Object3D();
 const cuttings=new THREE.InstancedMesh(clippingGeometry,clippingMaterial,SPRAY);cuttings.name='FinalCutThrownCuttings';cuttings.frustumCulled=false;scene.add(cuttings);
 dummy.scale.setScalar(0);dummy.updateMatrix();for(let i=0;i<SPRAY;i++)cuttings.setMatrixAt(i,dummy.matrix);
 let owner=null,last=0,rand=1,puffDebt=0,dustDebt=0,sprayDebt=0,cutting=false,alive=0;
 const random=()=>{rand=(rand*16807)%2147483647;return rand/2147483647;};
 const reset=p=>{p.age.fill(1);p.life.fill(1);p.next=0;};
 function emit(p,x,y,z,vx,vy,vz,life){const i=p.next;p.next=(i+1)%p.n;p.px[i]=x;p.py[i]=y;p.pz[i]=z;p.vx[i]=vx;p.vy[i]=vy;p.vz[i]=vz;p.age[i]=0;p.life[i]=life;p.seed[i]=random();}
 const probe={x:0,y:0};
 return {update(r,camera,{reduced=false,courseWash=0,lampBeam=0,engine=0,drift=0,bankLevels=null,firstLight=0}={}){
  const j=r.rig,sn=Math.sin(j.yaw),cs=Math.cos(j.yaw),clock=r.time+drift;let dt=clock-last;
  if(owner!==r||dt<0||dt>.5){owner=r;dt=0;reset(puffs);reset(dust);reset(spray);puffDebt=dustDebt=sprayDebt=0;rand=1;}
  last=clock;time.value=clock;wash.value=courseWash;beam.value=lampBeam;calm.value=lite?0:reduced?.25:1;dawn.value=firstLight;
  if(bankLevels)banks.value.fromArray(bankLevels);else banks.value.set(1,1,1,1);haze.value=courseWash*(banks.value.x+banks.value.y+banks.value.z+banks.value.w)/4;
  sky.position.set(camera.position.x,camera.position.y+20,camera.position.z);
  for(const {mesh,spec}of searchlights)mesh.rotation.set(.4+Math.sin(clock*.11+spec.phase)*.24,0,spec.lean+Math.sin(clock*.083+spec.phase*1.7)*.34);
  for(let i=0;i<fixed;i++)if(glows[i].lit){const level=courseWash*banks.value.getComponent(glows[i].lit-1);tint[i*4+3]=0;tint[i*4]=glows[i].color[0]*level;tint[i*4+1]=glows[i].color[1]*level;tint[i*4+2]=glows[i].color[2]*level;}
  const sink=body.position.y;
  for(const {spec,slot}of headGlow){const o=headlampOrigin(spec),k=slot*4;spot[k]=j.x+o[0]*cs-o[2]*sn;spot[k+1]=o[1]+sink;spot[k+2]=-j.y+o[0]*sn+o[2]*cs;spot[k+3]=3.1*lampBeam;}
  // Exhaust: idle wisps, working plumes, heavy smoke while bogged, then steam.
  const bogged=r.won&&r.ending.age<7,rate=engine<=0?0:r.won?(bogged?24:2.5):j.speed>0?13:5;
  puffDebt=Math.min(4,puffDebt+rate*dt);
  while(puffDebt>=1){puffDebt--;const e=EXHAUSTS[puffs.next%2],lift=bogged?2.4:1.5;emit(puffs,j.x+e[0]*cs-e[2]*sn,e[1]+sink,-j.y+e[0]*sn+e[2]*cs,.5+random()*.5,lift+random()*.7,.25*(random()-.5),bogged?3.2:2.3+random()*.6);}
  // Cuttings leave the reels only where standing rough is actually being cut.
  const working=j.speed>0&&j.deployment>.6&&!r.won;cutting=false;
  if(working&&dt>0){
   sprayDebt=Math.min(12,sprayDebt+110*dt);dustDebt=Math.min(3,dustDebt+9*dt);
   while(sprayDebt>=1){sprayDebt--;const across=(random()*2-1)*(CUT_HALF_WIDTH-.2),forward=RIG_BANK.reelForward;probe.x=j.x+sn*(forward+.7)+cs*across;probe.y=j.y+cs*(forward+.7)-sn*across;
    if(!SECTORS.some(s=>inside(probe,s))||isCut(r,probe))continue;cutting=true;
    const back=1.5+random()*3.5,side=(random()-.5)*3.2,up=2.6+random()*3.4;
    emit(spray,j.x+sn*forward+cs*across,.25+random()*.3,-(j.y+cs*forward-sn*across),-sn*back+cs*side+sn*j.speed*.35,up,cs*back+sn*side-cs*j.speed*.35,1.5);
    if(dustDebt>=1){dustDebt--;emit(dust,j.x+sn*(forward-.6)+cs*across,.5,-(j.y+cs*(forward-.6)-sn*across),-sn*1.2+(random()-.5),.7+random()*.5,cs*1.2+(random()-.5),1.3+random()*.5);}
   }
  }
  alive=0;
  for(let i=0;i<SPRAY;i++){
   if(spray.age[i]>=spray.life[i])continue;
   spray.age[i]+=dt;spray.vy[i]-=8.5*dt;spray.vx[i]*=1-.9*dt;spray.vz[i]*=1-.9*dt;spray.px[i]+=spray.vx[i]*dt;spray.py[i]+=spray.vy[i]*dt;spray.pz[i]+=spray.vz[i]*dt;
   const done=spray.py[i]<.04||spray.age[i]>=spray.life[i];if(done)spray.age[i]=spray.life[i];else alive++;
   const turn=spray.age[i]*(5+spray.seed[i]*9);dummy.position.set(spray.px[i],spray.py[i],spray.pz[i]);dummy.rotation.set(turn,spray.seed[i]*6.3,turn*.7);dummy.scale.setScalar(done?0:.36+spray.seed[i]*.34);dummy.updateMatrix();cuttings.setMatrixAt(i,dummy.matrix);
  }
  if(dt>0||owner!==cuttings.userData.owner){cuttings.instanceMatrix.needsUpdate=true;cuttings.userData.owner=owner;}
  const shade=.2+.8*courseWash;
  for(let i=0;i<PUFFS;i++){
   const k=(fixed+i)*4,t=Math.min(1,puffs.age[i]/puffs.life[i]);
   if(t<1){puffs.age[i]+=dt;puffs.px[i]+=puffs.vx[i]*dt;puffs.py[i]+=puffs.vy[i]*dt;puffs.pz[i]+=puffs.vz[i]*dt;puffs.vy[i]*=1-.5*dt;}
   const dark=r.won&&r.ending.age<9?.42:1,grey=(.46+.14*puffs.seed[i])*shade*dark;
   spot[k]=puffs.px[i];spot[k+1]=puffs.py[i];spot[k+2]=puffs.pz[i];spot[k+3]=t<1?.35+t*(1.9+puffs.seed[i]):0;
   tint[k]=grey;tint[k+1]=grey*1.03;tint[k+2]=grey*.98;tint[k+3]=t<1?(r.won?.7:.58)*Math.sin(Math.PI*Math.sqrt(t))*(1-t):0;
  }
  for(let i=0;i<DUST;i++){
   const k=(fixed+PUFFS+i)*4,t=Math.min(1,dust.age[i]/dust.life[i]);
   if(t<1){dust.age[i]+=dt;dust.px[i]+=dust.vx[i]*dt;dust.py[i]+=dust.vy[i]*dt;dust.pz[i]+=dust.vz[i]*dt;}
   spot[k]=dust.px[i];spot[k+1]=dust.py[i];spot[k+2]=dust.pz[i];spot[k+3]=t<1?.7+t*2.2:0;
   tint[k]=.34*shade;tint[k+1]=.4*shade;tint[k+2]=.24*shade;tint[k+3]=t<1?.3*Math.sin(Math.PI*Math.sqrt(t)):0;
  }
  spotAttribute.needsUpdate=true;tintAttribute.needsUpdate=true;
 },stats:()=>({lite,banks:banks.value.toArray(),dawn:dawn.value,draws:6+searchlights.length,lights:0,floodShafts:FLOOD_MASTS.length,refugeCones:REFUGES.length,wallWashes:REFUGE_WASHES.length,searchlights:searchlights.length,glows:fixed,exhaustCapacity:PUFFS,dustCapacity:DUST,cuttingCapacity:SPRAY,cuttingsAlive:alive,cutting,wash:wash.value,workLight:beam.value}),
 dispose(){for(const m of [shafts,pools,sky,bunting,sprites,cuttings,...searchlights.map(s=>s.mesh)])scene.remove(m);body.remove(headBeams);cuttings.dispose();for(const item of resources)item.dispose();}};
}
