import * as THREE from './vendor/three/three.module.js';
import {REFUGES,MOVEMENT} from './final-cut-course.js';
import {BASINS} from './final-cut-basin-layout.js';
import {FLOOD_MASTS} from './final-cut-atmosphere.js';
import {footstepSurface} from './final-cut-footsteps.js';
import {groundHeight} from './final-cut-arrival-layout.js';
import {RIG_WHEELS} from './final-cut-rig.js';

// Decorative life for the final round, all in ONE instanced draw: moths at the
// shelter lamps, ground mist over the hollows, floodlight glints on standing
// water, the Use highlight ring, and pooled contact particles (footfalls,
// wheel spray, splinters, sparks, splashes, a flushed bird). A second, tiny
// instanced draw is the chipping club, visible only while aiming or swinging.
//
// Everything follows simulation time and events that already happened; nothing
// here writes to the run, and its random numbers are its own. Paused is a
// frozen frame. Reduced motion keeps the still elements and drops the bursts.
const CELLS=4,ROWS=2,CELL=64,POOL=150,FIXED=64,CAPACITY=POOL+FIXED;
const SPRITE={puff:0,moth:1,drop:2,spark:3,chunk:4,bird:5,ring:6,streak:7};
const LAMP_SITES=[...REFUGES.map(s=>({x:s.x,y:2.25,z:-s.y})),{x:-8,y:7.85,z:-4},{x:12,y:8.6,z:-94.5}];
const MOTHS_PER_LAMP=5;
// Where low mist gathers: over each hollow and along the swale.
const MIST=BASINS.flatMap((b,i)=>[0,1,2].map(k=>({x:b.x+Math.sin(i*5.1+k*2.3)*b.w*.7,z:-b.y+Math.cos(i*3.7+k*1.9)*b.d*.6,size:7+((i*3+k*5)%4),phase:i*1.7+k*2.9})));
const hex=c=>{const v=new THREE.Color(c);return [v.r,v.g,v.b];};
const TINT={dust:hex('#8f8a78'),turf:hex('#5d7440'),mud:hex('#3d3626'),water:hex('#a9c9c4'),wood:hex('#7c6a48'),spark:hex('#ffd58a'),moth:hex('#e9dfbd'),bird:hex('#0d1316'),mint:hex('#9be6d1'),lamp:hex('#ffe1a4'),mistNight:hex('#4b6468'),mistLit:hex('#a3b8b1')};

function paintAtlas(){
 const c=document.createElement('canvas');c.width=CELLS*CELL;c.height=ROWS*CELL;const g=c.getContext('2d');
 const at=(i,draw)=>{g.save();g.translate((i%CELLS)*CELL+CELL/2,Math.floor(i/CELLS)*CELL+CELL/2);draw();g.restore();};
 at(SPRITE.puff,()=>{const r=g.createRadialGradient(0,0,0,0,0,30);r.addColorStop(0,'rgba(255,255,255,.9)');r.addColorStop(.45,'rgba(255,255,255,.38)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(-32,-32,64,64);});
 at(SPRITE.moth,()=>{g.fillStyle='#fff';for(const s of [-1,1]){g.beginPath();g.moveTo(0,-2);g.quadraticCurveTo(s*26,-22,s*24,2);g.quadraticCurveTo(s*14,12,0,4);g.fill();}g.fillStyle='rgba(120,110,90,1)';g.fillRect(-2,-8,4,16);});
 at(SPRITE.drop,()=>{const r=g.createRadialGradient(0,0,0,0,0,12);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.5,'rgba(255,255,255,.7)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.scale(.55,1.6);g.beginPath();g.arc(0,0,12,0,7);g.fill();});
 at(SPRITE.spark,()=>{const r=g.createRadialGradient(0,0,0,0,0,26);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.18,'rgba(255,255,255,.85)');r.addColorStop(.4,'rgba(255,255,255,.16)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(-32,-32,64,64);});
 at(SPRITE.chunk,()=>{g.fillStyle='#fff';g.beginPath();g.moveTo(-14,-6);g.lineTo(-2,-16);g.lineTo(13,-9);g.lineTo(16,6);g.lineTo(3,15);g.lineTo(-12,10);g.closePath();g.fill();g.fillStyle='rgba(150,150,150,1)';g.beginPath();g.moveTo(-2,-16);g.lineTo(13,-9);g.lineTo(3,-2);g.closePath();g.fill();});
 at(SPRITE.bird,()=>{g.fillStyle='#fff';g.beginPath();g.moveTo(-28,-4);g.quadraticCurveTo(-14,-18,-3,-2);g.lineTo(0,-6);g.lineTo(3,-2);g.quadraticCurveTo(14,-18,28,-4);g.quadraticCurveTo(12,-6,4,6);g.lineTo(0,12);g.lineTo(-4,6);g.quadraticCurveTo(-12,-6,-28,-4);g.fill();});
 at(SPRITE.ring,()=>{g.strokeStyle='rgba(255,255,255,.95)';g.lineWidth=3.5;g.beginPath();g.arc(0,0,25,0,7);g.stroke();g.strokeStyle='rgba(255,255,255,.3)';g.lineWidth=8;g.beginPath();g.arc(0,0,25,0,7);g.stroke();});
 at(SPRITE.streak,()=>{const r=g.createRadialGradient(0,0,0,0,0,30);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.3,'rgba(255,255,255,.5)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(-32,-32,64,64);});
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.NoColorSpace;t.generateMipmaps=false;t.minFilter=t.magFilter=THREE.LinearFilter;return t;
}
const VERT=`attribute vec4 iPos,iCol,iInfo;varying vec2 vUv;varying vec4 vCol;varying float vAdd,vFog;uniform float fogNear,fogFar;
void main(){
 float c=cos(iInfo.y),s=sin(iInfo.y);vec2 q=position.xy*vec2(iInfo.w,1.);q=vec2(q.x*c-q.y*s,q.x*s+q.y*c)*iPos.w;
 vec4 mv;if(mod(iInfo.z,2.)>.5)mv=viewMatrix*vec4(iPos.xyz+vec3(q.x,0.,q.y),1.);else{mv=viewMatrix*vec4(iPos.xyz,1.);mv.xy+=q;}
 gl_Position=projectionMatrix*mv;
 vUv=vec2((mod(iInfo.x,${CELLS}.)+position.x+.5)/${CELLS}.,1.-(floor(iInfo.x/${CELLS}.)+.5-position.y)/${ROWS}.);
 vCol=iCol;vAdd=step(1.5,iInfo.z);vFog=smoothstep(fogNear,fogFar,-mv.z);
}`;
const FRAG=`uniform sampler2D map;uniform vec3 fogColor;varying vec2 vUv;varying vec4 vCol;varying float vAdd,vFog;
void main(){vec4 t=texture2D(map,vUv);float a=t.a*vCol.a;if(a<.004)discard;
 vec3 c=mix(t.rgb*vCol.rgb,fogColor*(1.-vAdd),vFog);gl_FragColor=vec4(c*a,a*(1.-vAdd));}`;

export function createFinalCutEffects(scene,camera,{lite=false}={}){
 const map=paintAtlas(),plane=new THREE.PlaneGeometry(1,1),geometry=new THREE.InstancedBufferGeometry();
 geometry.index=plane.index;geometry.setAttribute('position',plane.attributes.position);
 const pos=new Float32Array(CAPACITY*4),col=new Float32Array(CAPACITY*4),info=new Float32Array(CAPACITY*4);
 const aPos=new THREE.InstancedBufferAttribute(pos,4),aCol=new THREE.InstancedBufferAttribute(col,4),aInfo=new THREE.InstancedBufferAttribute(info,4);
 for(const a of [aPos,aCol,aInfo])a.setUsage(THREE.DynamicDrawUsage);
 geometry.setAttribute('iPos',aPos);geometry.setAttribute('iCol',aCol);geometry.setAttribute('iInfo',aInfo);geometry.instanceCount=0;
 const uniforms={map:{value:map},fogColor:{value:new THREE.Color()},fogNear:{value:42},fogFar:{value:138}};
 const material=new THREE.ShaderMaterial({uniforms,vertexShader:VERT,fragmentShader:FRAG,transparent:true,depthWrite:false,blending:THREE.CustomBlending,blendEquation:THREE.AddEquation,blendSrc:THREE.OneFactor,blendDst:THREE.OneMinusSrcAlphaFactor,blendSrcAlpha:THREE.OneFactor,blendDstAlpha:THREE.OneMinusSrcAlphaFactor});
 const mesh=new THREE.Mesh(geometry,material);mesh.name='FinalCutEffects';mesh.frustumCulled=false;mesh.renderOrder=6;scene.add(mesh);
 // The chipping club: sleeve, glove, shaft and head as four instances of one box.
 const clubMaterial=new THREE.MeshBasicMaterial({fog:false,depthTest:false,depthWrite:false,transparent:true}),club=new THREE.InstancedMesh(new THREE.BoxGeometry(),clubMaterial,4),clubPivot=new THREE.Group(),m4=new THREE.Object3D();
 [[.11,-.09,.13,.07,.34,.07,'#2f4a43'],[0,.02,0,.05,.09,.055,'#8f8a70'],[0,-.42,0,.014,.8,.014,'#8d9a99'],[.03,-.83,0,.09,.034,.045,'#c9d2cf']].forEach(([x,y,z,w,h,d,color],i)=>{m4.position.set(x,y,z);m4.scale.set(w,h,d);m4.rotation.set(i?0:2.19,0,i?0:-.6);m4.updateMatrix();club.setMatrixAt(i,m4.matrix);club.setColorAt(i,new THREE.Color(color));});
 club.name='FinalCutClub';club.frustumCulled=false;club.renderOrder=20;clubPivot.add(club);camera.add(clubPivot);if(!camera.parent)scene.add(camera);
 const particles=[],flushed=new WeakMap();let seed=90217,owner=null,last=0,stride=0,enabled=true,count=0,emitted=0,sprayDebt=0,swing=-1,raise=0,backswing=0,useDip=-1;
 const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;},spread=v=>(random()-.5)*2*v;
 function emit(sprite,x,y,z,vx,vy,vz,{life=1,size=.1,grow=0,tint=TINT.dust,alpha=1,mode=0,gravity=9.8,drag=.6,spin=0,stretch=1,flap=0,ground=true}={}){
  const p=particles.length<POOL?(particles.push({}),particles.at(-1)):particles[emitted%POOL];emitted++;
  Object.assign(p,{sprite,x,y,z,vx,vy,vz,age:0,life,size,grow,r:tint[0],g:tint[1],b:tint[2],alpha,mode,gravity,drag,rot:spread(3.1),spin,stretch,flap,ground});
 }
 const world=(j,forward,side)=>{const s=Math.sin(j.yaw),c=Math.cos(j.yaw);return {x:j.x+s*forward+c*side,z:-(j.y+c*forward-s*side)};};
 function burst(kind,x,y,z,n,power=1){
  for(let k=0;k<n;k++){
   if(kind==='water')emit(SPRITE.drop,x+spread(.5),y,z+spread(.5),spread(2.2)*power,(2.5+random()*3)*power,spread(2.2)*power,{life:.9+random()*.5,size:.07+random()*.06,tint:TINT.water,alpha:.85,drag:.2});
   else if(kind==='mud')emit(SPRITE.chunk,x+spread(.4),y,z+spread(.4),spread(3)*power,(1.8+random()*2.6)*power,spread(3)*power,{life:1.1+random()*.6,size:.07+random()*.09,tint:TINT.mud,spin:spread(9),drag:.3});
   else if(kind==='turf')emit(SPRITE.chunk,x+spread(.3),y,z+spread(.3),spread(1.6)*power,(1.2+random()*1.8)*power,spread(1.6)*power,{life:.8+random()*.5,size:.05+random()*.06,tint:TINT.turf,spin:spread(9),drag:.5});
   else if(kind==='wood')emit(SPRITE.chunk,x+spread(.5),y+random()*.6,z+spread(.5),spread(4)*power,(1.5+random()*3)*power,spread(4)*power,{life:1.2+random()*.6,size:.06+random()*.1,tint:TINT.wood,spin:spread(12),drag:.3,stretch:.35});
   else if(kind==='spark')emit(SPRITE.spark,x+spread(.3),y+random()*.4,z+spread(.3),spread(5)*power,(1+random()*4)*power,spread(5)*power,{life:.35+random()*.45,size:.09+random()*.07,tint:TINT.spark,mode:2,gravity:7,drag:1.2});
   else emit(SPRITE.puff,x+spread(.3),y,z+spread(.3),spread(.5),.25+random()*.4,spread(.5),{life:1.1+random()*.7,size:.3+random()*.25,grow:.7,tint:TINT.dust,alpha:.22,gravity:0,drag:1.4,ground:false});
  }
 }
 const ripple=(x,z,size=1.2)=>emit(SPRITE.ring,x,.075,z,0,0,0,{life:1.1,size:.25,grow:size,tint:TINT.water,alpha:.55,mode:3,gravity:0,drag:0,ground:false});
 function events(r,from){
  for(const e of r.events){if(e.time<=from||e.time>r.time)continue;const j=r.rig,x=e.x??j.x,z=-(e.y??j.y);
   if(e.type==='mired'||e.type==='victory'){burst('water',x,.2,z,e.type==='victory'?30:22,1.25);burst('mud',x,.2,z,12);for(let k=0;k<3;k++)ripple(x+spread(2),z+spread(2),2.4);}
   else if(e.type==='slip'){burst('water',x,.15,z,10,.8);burst('mud',x,.15,z,8,.8);}
   else if(e.type==='tear-free')burst('mud',x,.2,z,18,1.2);
   else if(e.type==='break-prop'){burst('wood',x,.5,z,12);burst('spark',x,.6,z,5);burst('dust',x,.3,z,3);}
   else if(e.type==='blocked-pass'){const f=world(j,3.2,0);burst('spark',f.x,.7,f.z,10);burst('dust',f.x,.4,f.z,2);}
   else if(e.type==='ball-land'){burst('turf',x,.06,z,4,.7);burst('dust',x,.1,z,1);}
   else if(e.type==='chip'){const p=r.player,v=p.yaw+p.rearAngle;burst('turf',p.x+Math.sin(v)*.7,groundHeight(p)+.05,-(p.y+Math.cos(v)*.7),4,.9);swing=0;}
   else if(e.type==='valve'){burst('water',x,1.05,z,9,.6);useDip=0;}
   else if(e.type==='manifold-rupture')burst('water',x,.9,z,22,1.5);
   else if(['pump','evidence','bell','blackout','ball-refill','ball-recovered'].includes(e.type))useDip=0;
  }
 }
 function write(i,sprite,x,y,z,size,rot,mode,stretch,tint,alpha,light=1){
  const k=i*4;pos[k]=x;pos[k+1]=y;pos[k+2]=z;pos[k+3]=size;col[k]=tint[0]*light;col[k+1]=tint[1]*light;col[k+2]=tint[2]*light;col[k+3]=alpha;info[k]=sprite;info[k+1]=rot;info[k+2]=mode;info[k+3]=stretch;
 }
 const eye=new THREE.Vector3(),ringAt=new THREE.Vector3(),ringView=new THREE.Matrix4();
 return {
  mesh,club,
  setEnabled(value){enabled=!!value;mesh.visible=enabled;if(!enabled){particles.length=0;club.visible=false;}},
  // feel: the caller's permission for motion additions (false under reduced
  // motion). Returns a small view offset for the Use dip and chip swing.
  update(r,{reduced=false,wash=0,bankLevels=null,fog=null,action=null,birds=null,feel=true}={}){
   const view={pitch:0,height:0};
   if(owner!==r){owner=r;last=r.time;particles.length=0;stride=Math.floor((r.player.walk||0)/.8);swing=useDip=-1;raise=backswing=0;sprayDebt=0;}
   const dt=Math.max(0,Math.min(.1,r.time-last)),from=last;last=r.time;
   if(!enabled){club.visible=false;geometry.instanceCount=count=0;return view;}
   if(fog){uniforms.fogColor.value.copy(fog.color);uniforms.fogNear.value=fog.near;uniforms.fogFar.value=fog.far;}
   const lit=.3+.7*wash,p=r.player,j=r.rig,t=reduced?0:r.time;
   if(dt>0&&!reduced){
    events(r,from);
    // Footfalls: one contact per 0.8 m, matching the footstep sound's stride.
    const step=Math.floor((p.walk||0)/.8);
    if(step!==stride){stride=step;const surface=footstepSurface(r),running=p.speed>MOVEMENT.walk*1.1,h=groundHeight(p)+.04;
     if(surface==='wet'){burst('water',p.x,h,-p.y,running?5:3,.45);ripple(p.x,-p.y,running?1.3:.9);}
     else if(running)burst(surface==='turf'||surface==='rough'?'turf':'dust',p.x,h,-p.y,surface==='turf'||surface==='rough'?2:1,.6);
    }
    // Wheels: turf thrown behind a working pass, mud flung while stuck.
    const mired=j.phase==='mired',rate=mired?Math.max(6,34-j.age*4):j.phase==='pass'&&j.speed>1?(lite?8:16):0;sprayDebt=Math.min(6,sprayDebt+rate*dt);
    while(sprayDebt>=1){sprayDebt--;const w=RIG_WHEELS[Math.floor(random()*RIG_WHEELS.length)],at=world(j,w.forward-(mired?0:.7),w.side),back=world({x:0,y:0,yaw:j.yaw},-1,0);
     if(mired){emit(random()<.6?SPRITE.chunk:SPRITE.drop,at.x,.2,at.z,back.x*(2+random()*3)+spread(1.5),2+random()*3.2,back.z*(2+random()*3)+spread(1.5),{life:1+random()*.6,size:.07+random()*.08,tint:random()<.6?TINT.mud:TINT.water,spin:spread(10),drag:.3});}
     else emit(SPRITE.chunk,at.x,.12,at.z,back.x*(1.5+random()*2.5)+spread(.8),.9+random()*1.7,back.z*(1.5+random()*2.5)+spread(.8),{life:.7+random()*.5,size:.045+random()*.05,tint:random()<.75?TINT.turf:TINT.mud,spin:spread(10),drag:.5});
    }
    if(birds)for(const b of birds){let seen=flushed.get(r);if(!seen)flushed.set(r,seen=new Set());if(seen.has(b.id))continue;seen.add(b.id);
     const away=Math.atan2(b.x-p.x,-b.y+p.y);for(let k=0;k<3;k++)emit(SPRITE.bird,b.x+spread(.8),1+random()*.6,-b.y+spread(.8),Math.sin(away+spread(.5))*(4+random()*2),3+random()*1.5,Math.cos(away+spread(.5))*(4+random()*2),{life:2.8,size:.5+random()*.15,tint:TINT.bird,alpha:.95,gravity:-.6,drag:.1,flap:13+random()*4,ground:false});
     burst('turf',b.x,.8,-b.y,5,.8);}
   }
   let n=0;
   // Pooled particles.
   for(let i=particles.length-1;i>=0;i--){const q=particles[i];q.age+=dt;if(q.age>=q.life){particles[i]=particles.at(-1);particles.pop();continue;}
    const damp=Math.exp(-q.drag*dt);q.vx*=damp;q.vz*=damp;q.vy=q.vy*damp-q.gravity*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.z+=q.vz*dt;q.rot+=q.spin*dt;
    if(q.ground&&q.y<.04&&q.vy<0){if(q.sprite===SPRITE.drop||q.sprite===SPRITE.spark){q.age=q.life;continue;}q.y=.04;q.vx=q.vy=q.vz=q.spin=0;}
   }
   for(const q of particles){const f=q.age/q.life,fade=Math.min(1,f*12)*(1-f*f),flap=q.flap?.25+.75*Math.abs(Math.sin(q.age*q.flap)):q.stretch;
    write(n++,q.sprite,q.x,q.y,q.z,q.size+q.grow*f,q.flap?0:q.rot,q.mode,flap,[q.r,q.g,q.b],q.alpha*fade,q.mode>=2||q.sprite===SPRITE.bird?1:lit);}
   // Moths circle the shelter lamps.
   camera.getWorldPosition(eye);
   for(let s=0;s<LAMP_SITES.length;s++){const L=LAMP_SITES[s];if((L.x-eye.x)**2+(L.z-eye.z)**2>46*46)continue;
    for(let k=0;k<MOTHS_PER_LAMP;k++){const h=s*7.3+k*2.1,a=t*(2.1+k*.37)*(k%2?1:-1)+h,rad=.22+.3*(.5+.5*Math.sin(t*.9+h*3)),bob=Math.sin(t*2.3+h)*.16;
     write(n++,SPRITE.moth,L.x+Math.cos(a)*rad,L.y-.12+bob,L.z+Math.sin(a)*rad,.075,Math.sin(t*3+h)*.6,0,reduced?.8:.3+.7*Math.abs(Math.sin(t*34+h*5)),TINT.moth,.9,1);}
   }
   // Low mist over the hollows, tinted by whatever light is on.
   if(!lite)for(const m of MIST){const dx=m.x-eye.x,dz=m.z-eye.z,d=Math.hypot(dx,dz);if(d>70)continue;const near=Math.min(1,Math.max(0,(d-2.5)/7));
    write(n++,SPRITE.puff,m.x+Math.sin(t*.07+m.phase)*2.2,.75+Math.sin(t*.11+m.phase*2)*.12,m.z+Math.cos(t*.05+m.phase)*1.6,m.size,m.phase,0,1.7,[TINT.mistNight[0]+(TINT.mistLit[0]-TINT.mistNight[0])*wash,TINT.mistNight[1]+(TINT.mistLit[1]-TINT.mistNight[1])*wash,TINT.mistNight[2]+(TINT.mistLit[2]-TINT.mistNight[2])*wash],.15*near,1);}
   // Floodlight glints on standing water: the mirror point of each lit mast.
   for(const b of BASINS){const s=r.basins[b.id];if(b.final||s.state==='spent'||s.level<.3)continue;const h=.03+.035*s.level+.012;
    for(let i=0;i<FLOOD_MASTS.length;i++){const level=wash*(bankLevels?bankLevels[i]:1);if(level<.05||eye.y<=h)continue;const m=FLOOD_MASTS[i],k=(eye.y-h)/(eye.y+10.2-2*h),x=eye.x+(m.x-eye.x)*k,z=eye.z+(-m.y-eye.z)*k,spreadW=(.35+.65*s.level);
     if(Math.abs(x-b.x)>(b.w/2-.6)*spreadW||Math.abs(z+b.y)>(b.d/2-.9)*spreadW)continue;
     write(n++,SPRITE.streak,x,h,z,2.6,Math.atan2(-(x-eye.x),z-eye.z),3,.16,TINT.lamp,.5*level*Math.min(1,s.level*1.4)*(1+.22*Math.sin(t*6.3+i*2.1+x)),1);}
   }
   // One consistent highlight on whatever Use would act on.
   // It is capped on screen and fades out before it could be clipped by the
   // edge of the view, so it never shows as a cut-off arc.
   if(action){ringAt.set(action.x,action.h,action.z).applyMatrix4(ringView.copy(camera.matrixWorld).invert());const depth=-ringAt.z,e=camera.projectionMatrix.elements;
    if(depth>.3){const size=Math.min(.52,.2*depth/e[5])*(1+(reduced?0:.09*Math.sin(r.time*4.2))),rx=size*.5*e[0]/depth,ry=size*.5*e[5]/depth,margin=Math.min(1-Math.abs(ringAt.x*e[0]/depth)-rx,1-Math.abs(ringAt.y*e[5]/depth)-ry),show=Math.max(0,Math.min(1,margin/.1));
     if(show>0)write(n++,SPRITE.ring,action.x,action.h,action.z,size,0,2,1,TINT.mint,.8*show,1);}}
   count=n;geometry.instanceCount=n;aPos.needsUpdate=aCol.needsUpdate=aInfo.needsUpdate=true;
   // Chipping club: raise while aiming, draw back with power, swing on release.
   const aim=r.ballAim,moving=feel&&!reduced;
   if(swing>=0){swing+=dt;if(swing>.62)swing=-1;}
   if(useDip>=0){useDip+=dt;if(useDip>.32)useDip=-1;}
   const target=aim.active||swing>=0&&swing<.4?1:0;raise=moving?raise+(target-raise)*Math.min(1,dt*14):target;if(aim.active)backswing=aim.power||0;
   club.visible=raise>.02;
   if(club.visible){const s=swing>=0?Math.min(1,swing/.16):0,ease=1-(1-s)*(1-s),back=-.1+backswing*.7,angle=swing>=0?back+(-1.15-back)*ease:back;
    clubPivot.scale.setScalar(.85);clubPivot.position.set(.2,-.1-(1-raise)*.45,-.5);clubPivot.rotation.set(.95,0,angle);clubMaterial.color.setScalar(.35+.65*wash);clubMaterial.opacity=Math.min(1,raise*1.5);}
   if(moving){if(swing>=0&&swing<.3)view.pitch+=Math.sin(swing/.3*Math.PI)*.012;if(useDip>=0){const u=Math.sin(useDip/.32*Math.PI);view.pitch-=u*.018;view.height-=u*.025;}}
   return view;
  },
  stats:()=>({enabled,instances:count,particles:particles.length,emitted,capacity:CAPACITY,draws:enabled?1+(club.visible?1:0):0,moths:LAMP_SITES.length*MOTHS_PER_LAMP,mist:lite?0:MIST.length,club:club.visible}),
  dispose(){map.dispose();material.dispose();geometry.dispose();plane.dispose();club.geometry.dispose();clubMaterial.dispose();club.dispose();},
 };
}
