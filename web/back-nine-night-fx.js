import * as THREE from './vendor/three/three.module.js';
import {terrainHeight} from './course-terrain.js';
import {mowerCanCut} from './chase-mower-clippings.js';
import {createGlowSprites,createLampUniforms,writeLampUniforms} from './back-nine-glow-sprites.js';

// Night-air presentation for the chase: Joe's visible headlight shaft, chaff
// and exhaust, lamp and beacon halos, drifting ground fog, tire plumes and
// wind-blown leaves. Everything is pooled with a fixed capacity and reads the
// simulation without writing to it. No lights are created or toggled here.
const hash=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
const clamp01=v=>Math.max(0,Math.min(1,v)),smooth=(a,b,x)=>{const t=clamp01((x-a)/(b-a));return t*t*(3-2*t);};
const wrap=(v,span)=>((v%span)+span)%span;
const BAND=36,LEAF_X=38,LEAF_Y=46,RAIN_X=24,RAIN_Z=28,RAIN_H=4.6;

export function createBackNineNightFx({scene,camera,software=false,lanterns=[],fixtures=[]}){
 const lamps=createLampUniforms(),sprites=createGlowSprites(scene,lamps,software?216:480);
 let halos=new Float32Array(0),mowerBody=null;
 // A hollow additive cone follows the mower's lamp bar. Its silhouette fades
 // by view angle, so it reads as lit air and never as a solid surface.
 const beamLength=9.5,beamGeometry=new THREE.ConeGeometry(1,1,20,4,true);beamGeometry.translate(0,-.5,0);beamGeometry.scale(beamLength*Math.tan(.3),beamLength,beamLength*Math.tan(.3));beamGeometry.rotateX(Math.acos(.85/Math.hypot(.85,21)));
 const beamUniforms={beamPower:{value:0},beamGround:{value:0},beamTime:{value:0},beamFog:{value:new THREE.Vector2(58,120)}};
 const beamMaterial=new THREE.ShaderMaterial({uniforms:beamUniforms,transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.CustomBlending,blendEquation:THREE.AddEquation,blendSrc:THREE.OneFactor,blendDst:THREE.OneFactor,toneMapped:false,fog:false,
  vertexShader:`uniform float beamGround;uniform vec2 beamFog;varying float vBeamAlong;varying float vBeamHeight;varying float vBeamFog;varying vec3 vBeamNormal;varying vec3 vBeamView;
   void main(){vec4 world=modelMatrix*vec4(position,1.0);vec4 mv=viewMatrix*world;vBeamAlong=1.0-uv.y;vBeamHeight=world.y-beamGround;vBeamFog=1.0-smoothstep(beamFog.x,beamFog.y,-mv.z);vBeamNormal=normalMatrix*normal;vBeamView=-mv.xyz;gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`uniform float beamPower;uniform float beamTime;varying float vBeamAlong;varying float vBeamHeight;varying float vBeamFog;varying vec3 vBeamNormal;varying vec3 vBeamView;
   void main(){
    float rim=abs(dot(normalize(vBeamNormal),normalize(vBeamView)));
    float fade=(1.0-vBeamAlong)*(1.0-vBeamAlong)*smoothstep(0.0,.05,vBeamAlong)*smoothstep(.04,.55,vBeamHeight);
    float dust=.8+.2*sin(vBeamAlong*34.0-beamTime*2.6+rim*5.0);
    gl_FragColor=vec4(vec3(1.0,.74,.42)*pow(rim,1.6)*fade*dust*beamPower*vBeamFog,1.0);
   }`});
 const beam=new THREE.Mesh(beamGeometry,beamMaterial),beamLocal=new THREE.Matrix4().makeTranslation(0,1.15,-1.96);beam.name='MowerHeadlightShaft';beam.matrixAutoUpdate=false;beam.frustumCulled=false;beam.renderOrder=5;scene.add(beam);
 // Wind-blown leaves occupy a wrapped volume around the actor: world-fixed
 // while driven through, so speed reads as streaks crossing the headlights.
 const leafCapacity=software?20:72,rainCapacity=software?40:160,leafGeometry=new THREE.BoxGeometry(1,.16,.62),leafMaterial=new THREE.MeshLambertMaterial({color:0xffffff,emissive:0x1b2211});
 const leaves=new THREE.InstancedMesh(leafGeometry,leafMaterial,leafCapacity),dummy=new THREE.Object3D(),tint=new THREE.Color();
 leaves.name='BackNineBlownLeaves';leaves.userData.rigidInstanceBounds=true;leaves.instanceMatrix.setUsage(THREE.DynamicDrawUsage);leaves.frustumCulled=false;
 for(let i=0;i<leafCapacity;i++){leaves.setColorAt(i,tint.setHex([0x9c9654,0x7c8744,0xa9864a,0x897640][i%4]));dummy.position.set(0,-10,0);dummy.updateMatrix();leaves.setMatrixAt(i,dummy.matrix);}
 scene.add(leaves);
 const exhaust=Array.from({length:14},()=>({age:9,x:0,y:0,z:0,drift:0})),chaff=Array.from({length:software?14:28},()=>({age:9,x:0,y:0,h:0,vx:0,vy:0,vh:0,size:.05}));
 // Presentation clock: it follows simulation time, but the capture moment
 // may slow it so rain, leaves and haze hang while the simulation runs on.
 const wetTime={value:0};let clock=0,clockScale=1,rain=0,flashPower=0;
 const point=new THREE.Vector3();let owner=null,last=0,exhaustCarry=0,exhaustCursor=0,chaffCarry=0,chaffCursor=0,serial=0;
 let fogPuffs=0,haloCount=0,plume=0,chaffActive=0,exhaustActive=0,beamPower=0,leafStretch=0;
 function update(run,{actor,joe,reducedMotion=false,dip=0,beacon=null,headlights=null,fog=null,timeScale=1,impact=null}){
  if(owner!==run){owner=run;last=clock=run.time||0;exhaustCarry=chaffCarry=0;for(const p of exhaust)p.age=9;for(const p of chaff)p.age=9;}
  const now=run.time||0,dt=Math.max(0,Math.min(.1,now-last))*timeScale;last=now;clock+=dt;clockScale=timeScale;wetTime.value=clock;const time=clock;
  const cx=camera.position.x,cy=-camera.position.z,driving=run.mode==='driving';
  if(headlights){writeLampUniforms(lamps,0,headlights.player,85);writeLampUniforms(lamps,1,headlights.mower,125);}
  const mowerPower=headlights?clamp01(headlights.mower.intensity/125):0,yaw=joe.yaw,fx=Math.sin(yaw),fy=Math.cos(yaw);
  // Headlight shaft.
  beam.matrix.multiplyMatrices(mowerBody.matrixWorld,beamLocal);beam.matrixWorldNeedsUpdate=true;
  beamPower=mowerPower*.42;beamUniforms.beamPower.value=beamPower;beamUniforms.beamGround.value=terrainHeight(joe.x+fx*4,joe.y+fy*4);beamUniforms.beamTime.value=time;if(fog)beamUniforms.beamFog.value.set(fog.near,fog.far);
  beam.visible=beamPower>0;
  // Lens glare grows as the lamp bar turns toward the camera.
  const toCamera=Math.hypot(cx-joe.x,cy-joe.y)||1,facing=clamp01(((cx-joe.x)*fx+(cy-joe.y)*fy)/toCamera);
  if(mowerPower>0&&facing>.05){
   const glare=facing*facing*mowerPower;
   for(const side of [-.8,.8]){point.set(side,1.15,-2.08).applyMatrix4(mowerBody.matrixWorld);sprites.push(point.x,point.y,point.z,.55+glare*.5,1,.78,.46,.55*glare);}
   point.set(0,1.15,-2.1).applyMatrix4(mowerBody.matrixWorld);sprites.push(point.x,point.y,point.z,3.4,1,.66,.34,.13*glare);
  }
  // Roof beacon: a tight hot core and a broad red bloom, pulsing with the lens.
  if(beacon){
   const lens=(beacon.lens||0)/2.2,near=clamp01((95-toCamera)/25);point.set(-.74,3.5,.45).applyMatrix4(mowerBody.matrixWorld);
   sprites.push(point.x,point.y,point.z,.5+lens*.5,1,.12,.05,.75*lens*near);sprites.push(point.x,point.y,point.z,2.6+lens*2.4,1,.06,.03,.14*lens*near);
  }
  // Exhaust: warm grey puffs that catch the beacon as they rise and shear.
  for(const p of exhaust)p.age+=dt;
  if(run.mode!=='caught'&&run.mode!=='complete'&&run.mode!=='briefing'){
   exhaustCarry+=dt*(7+Math.min(8,Math.abs(joe.speed)));
   while(exhaustCarry>=1){exhaustCarry--;const p=exhaust[exhaustCursor++%exhaust.length];point.set(.93,3.02,1.08).applyMatrix4(mowerBody.matrixWorld);p.age=0;p.x=point.x;p.y=point.y;p.z=point.z;p.drift=hash(serial++)-.5;}
  }
  exhaustActive=0;const pulse=beacon?(beacon.lens||0)/2.2:0;
  for(const p of exhaust){if(p.age>=1.5)continue;const t=p.age/1.5,fade=(1-t)*(1-t)*smooth(0,.12,t);
   sprites.push(p.x+t*(.9+p.drift*.7),p.y+t*1.5,p.z+t*p.drift*.8,.2+t*1.15,.2+pulse*.3,.19+pulse*.02,.185,.5*fade,1,.5);exhaustActive++;}
  // Chaff: bright flecks thrown ahead of the decks, through the lamp cone.
  for(const p of chaff)p.age+=dt;
  if(reducedMotion){for(const p of chaff)p.age=9;chaffCarry=0;}
  else if(driving&&Math.abs(joe.speed)>1.2&&(!joe.ram||!['backoff','missed','lineup'].includes(joe.ram.phase))){
   chaffCarry+=dt*Math.min(26,10+Math.abs(joe.speed)*1.6);
   while(chaffCarry>=1){chaffCarry--;const n=serial++,across=(hash(n)-.5)*3.6,x=joe.x+fx*2.2+fy*across,y=joe.y+fy*2.2-fx*across;
    if(!mowerCanCut(x,y))continue;
    const p=chaff[chaffCursor++%chaff.length],throwSpeed=Math.abs(joe.speed)+2+hash(n+.3)*3,side=(hash(n+.6)-.5)*2.4;
    p.age=0;p.x=x;p.y=y;p.h=terrainHeight(x,y)+.25;p.vx=fx*throwSpeed+fy*side;p.vy=fy*throwSpeed-fx*side;p.vh=2.3+hash(n+.9)*2.2;p.size=.045+hash(n+.4)*.05;
   }
  }else chaffCarry=0;
  chaffActive=0;
  for(const p of chaff){if(p.age>=.95)continue;const t=p.age,x=p.x+p.vx*t,y=p.y+p.vy*t,h=Math.max(terrainHeight(x,y)+.04,p.h+p.vh*t-4.9*t*t);
   sprites.push(x,h,-y,p.size,.05,.06,.03,Math.min(1,(.95-t)*5),1,2.6);chaffActive++;}
  // Tire plumes over standing water; solid droplets are drawn by the scene.
  plume=0;
  if(!run.foot&&actor.surface==='wet'&&Math.abs(actor.speed)>2.5){
   const power=clamp01((Math.abs(actor.speed)-2.5)/8),back=actor.speed<0?-1:1,sy=Math.sin(actor.yaw),cyw=Math.cos(actor.yaw),ground=terrainHeight(actor.x,actor.y);
   for(let i=0;i<12;i++){const t=(time*2.1+i/12)%1,side=i%2?1:-1,across=side*(.78+t*.75),behind=back*(1+t*(1.3+Math.abs(actor.speed)*.16));
    sprites.push(actor.x+cyw*across-sy*behind,ground+.22+Math.sin(t*Math.PI)*(.55+power*.6),-actor.y+sy*across+cyw*behind,.34+t*(1+power*.6),.2,.27,.29,.55*power*(1-t)*(1-t),1,1.2,0,1.2);plume++;}
  }
  // Ground fog bands lie across the course at fixed world positions and drift
  // with the gust. Headlights bloom inside them; a near fade clears the lens.
  fogPuffs=0;
  const first=Math.floor((cy-72)/BAND),perBand=software?3:6;
  for(let k=first;k<first+5;k++){
   const seed=hash(k*3.17);if(seed<.26)continue;
   const bandY=k*BAND+seed*18,density=.55+seed*.5;
   for(let i=0;i<perBand;i++){
    const x=-36+(i+.5)*(72/perBand)+Math.sin(k*7.3+i*3.1)*5+Math.sin(time*.06+i*1.7+k)*3.5,y=bandY+Math.sin(i*5.1+k*1.3)*6+Math.cos(time*.045+i+k*2.1)*2.2;
    if(y>784||y<6)continue;const range=Math.hypot(x-cx,y-cy),alpha=.78*density*(1-smooth(50,74,range));if(alpha<=.003)continue;
    // The base of each puff rests on the turf, where its fade reaches zero.
    const size=10+hash(k+i*.37)*4;sprites.push(x,terrainHeight(x,y)+size*.105,-y,size,.19,.27,.31,alpha,.115,.55,.6,10);fogPuffs++;
   }
  }
  // Lamp halos. The slow circuit sag matches the lamp batches behind the cart.
  haloCount=0;
  for(let i=0;i<halos.length;i+=3){
   const x=halos[i],z=halos[i+2],range=Math.hypot(x-cx,z+cy);if(range>88)continue;
   const sag=Math.max(.68,1-dip*(.35+.6*clamp01((actor.y+z+30)/60)));
   sprites.push(x,halos[i+1],z,1.15,1,.69,.36,.3*sag);haloCount++;
  }
  for(const f of fixtures){if(Math.hypot(f.x-cx,f.z+cy)>100)continue;sprites.push(f.x,f.y,f.z,f.size,1,.72,.42,f.alpha*(1-dip*.3));haloCount++;}
  // Leaves.
  // Leaves ride the actor's ground height: one terrain query for the whole field.
  const speed=run.foot?0:Math.abs(actor.speed),streak=clamp01((speed-5)/9),leafGround=terrainHeight(actor.x,actor.y);leafStretch=streak;
  for(let i=0;i<leafCapacity;i++){
   const a=hash(i+.11),b=hash(i+.47),c=hash(i+.83),drift=2.2+a*2.6;
   const lx=wrap(a*LEAF_X+time*drift-actor.x+LEAF_X/2,LEAF_X)-LEAF_X/2,ly=wrap(b*LEAF_Y+time*(.5+c*.9)-actor.y+LEAF_Y*.35,LEAF_Y)-LEAF_Y*.35;
   const x=actor.x+lx,y=actor.y+ly,edge=Math.min(1,(LEAF_X/2-Math.abs(lx))/4,(ly+LEAF_Y*.35)/4,(LEAF_Y*.65-ly)/4);
   // Open air only: nothing blows through the clubhouse or past the lens.
   const lift=.12+c*2.3*(.5+.5*Math.sin(time*(.7+a)+i*2.4)),size=(.085+b*.065)*Math.max(0,Math.min(edge,(786-y)/5,(Math.hypot(x-cx,y-cy)-1.5)/2));
   dummy.position.set(x,leafGround+lift+.1,-y);
   dummy.rotation.set((time*(2+a*3)+i)*(1-streak),-actor.yaw*streak+(time*(1.5+b*2)+i*1.7)*(1-streak),(time*(1.2+c*2)+i*.6)*(1-streak*.7));
   dummy.scale.set(size,size,size*(1+streak*5));dummy.updateMatrix();leaves.setMatrixAt(i,dummy.matrix);
  }
  leaves.instanceMatrix.needsUpdate=true;
  // Drizzle: thin streaks in a wrapped volume ahead of the lens. They carry
  // almost no light of their own and flare where a lamp cone crosses them.
  rain=0;
  if(cy<786){
   const e=camera.matrixWorld.elements,ax=camera.position.x-e[8]*9,az=camera.position.z-e[10]*9,ground=terrainHeight(actor.x,actor.y);
   for(let i=0;i<rainCapacity;i++){
    const a=hash(i+.21),b=hash(i+.59),c=hash(i+.93);
    const rx=wrap(a*RAIN_X+time*.9-ax+RAIN_X/2,RAIN_X)-RAIN_X/2,rz=wrap(b*RAIN_Z-az+RAIN_Z/2,RAIN_Z)-RAIN_Z/2,h=RAIN_H-wrap(c*RAIN_H+time*(8.5+a*2.5),RAIN_H);
    const edge=Math.min(1,(RAIN_X/2-Math.abs(rx))/2.5,(RAIN_Z/2-Math.abs(rz))/2.5,h/.4,(RAIN_H-h)/1.2);if(edge<=0)continue;
    sprites.push(ax+rx,ground+h,az+rz,.012+c*.007,.085,.1,.112,.6*edge,22,4.2,0,1.1);rain++;
   }
  }
  // One presentation-only flash where the mower lands. The caller scales it
  // by the player's flash preference and sends none under Reduced motion.
  flashPower=0;
  if(impact&&impact.power>0&&impact.age<.32){
   const k=1-impact.age/.32;flashPower=k*k*impact.power;
   sprites.push(impact.x,impact.h+1,-impact.y,1.4+impact.age*13,1,.92,.78,.85*flashPower);sprites.push(impact.x,impact.h+1.4,-impact.y,7+impact.age*12,1,.78,.6,.2*flashPower);
  }
  sprites.end(fog);
 }
 return {sprites,lamps,wetTime,begin:()=>sprites.begin(),update,
  // Called once the course and the mower exist; fixtures are static after it.
  mount(body){mowerBody=body;halos=new Float32Array(lanterns.length*3);lanterns.forEach((p,i)=>{halos[i*3]=p.x;halos[i*3+1]=terrainHeight(p.x,-p.z)+.4;halos[i*3+2]=p.z;});},
  warm(){sprites.warm();beam.visible=true;leaves.visible=true;},
  stats:()=>({sprites:sprites.stats(),beam:{power:beamPower,length:beamLength,visible:beam.visible},exhaust:{active:exhaustActive,capacity:exhaust.length},chaff:{active:chaffActive,capacity:chaff.length},fogPuffs,halos:haloCount,haloSources:lanterns.length+fixtures.length,tirePlume:plume,leaves:{capacity:leafCapacity,streak:leafStretch},rain:{active:rain,capacity:rainCapacity},clock:{value:clock,scale:clockScale},captureFlash:flashPower,lights:0}),
  dispose(){sprites.dispose();scene.remove(beam,leaves);beamGeometry.dispose();beamMaterial.dispose();leaves.dispose();leafGeometry.dispose();leafMaterial.dispose();}};
}
