import * as THREE from './vendor/three/three.module.js';
import * as Art from './pixel-art.js';
import { woodlandHeight } from './pixel-landscape.js';
import { createGhostJoe } from './ghost-joe.js?v=20261113-visual-pass';
import {createCourseGhostMotion,createGhostDissolve} from './course-ghost-motion.js';
import { createGhostSightings, createGhostFeedback } from './ghost-motion.js?v=20261108-ghost-scheduling';
import { createOriginalFeatures } from './original-features.js?v=20261108-exit-cues';
import { courseLook } from './course-atmosphere.js';
import { courseMistHabitat, mistDistanceFade } from './course-mist-field.js?v=20261113-visual-pass';

const clamp=THREE.MathUtils.clamp,random=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
// Tiny nearest-filtered masks, cut out rather than layered translucent volumes.
// All marks are drawn from simulation evidence; this module never writes to it.
function mask(kind){
  const c=document.createElement('canvas');c.width=kind==='trail'?128:64;c.height=64;
  const g=c.getContext('2d',{willReadFrequently:true}),image=g.createImageData(c.width,64);
  for(let y=0;y<64;y++)for(let x=0;x<c.width;x++){
    const u=(x%64+.5)/32-1,v=(y+.5)/32-1,r=Math.hypot(u,v),noise=random(x+y*67);
    let a=0;
    if(kind==='trail'){
      if(x<64){const edge=1-Math.abs(u),rut=Math.abs(Math.abs(u)-.64)<.075,blade=(x+Math.floor(Math.sin(y*.3)*2))%7<2;a=Math.abs(v)<.94&&noise>.18&&(rut||blade)?Math.min(1,edge*4)*(.6+noise*.4):0;}
      else {const toe=(u/.69)**2+((v+.25)/.64)**2<1,heel=Math.abs(u)<.49&&v>.38&&v<.84,tread=y%9<6;a=(toe||heel)&&tread&&noise>.12?.85:0;}
    }
    if(kind==='mist'){const bend=Math.sin(u*5)*.16+Math.sin(u*13)*.05,body=Math.max(0,1-u*u)**2*Math.exp(-(((v-bend)*3.4)**2));a=Math.floor(body*(.7+noise*.3)*12)/12;}
    if(kind==='ripple'){const angle=Math.atan2(v,u),rim=.84+Math.sin(angle*7)*.025+Math.sin(angle*13)*.012;a=Math.abs(r-rim)<.025&&noise>.28&&Math.sin(angle*5+1)>.05?1:0;}
    if(kind==='shaft')a=Math.abs(u)<(.18+(v+1)*.32)?Math.floor(Math.max(0,1-Math.abs(u)/(.18+(v+1)*.32))*(1-v*v)*5)/5:0;
    if(kind==='echo')a=Math.abs(u)<.45&&y%16<9?1:0;
    if(kind==='beam')a=v>-.95&&Math.abs(u)<(v+1)*.43&&noise>.82?1:0;
    const i=(y*c.width+x)*4;image.data[i]=image.data[i+1]=image.data[i+2]=kind==='trail'?Math.round(a*255):255;image.data[i+3]=Math.round(a*255);
  }
  g.putImageData(image,0,0);const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;return t;
}

export const createImpactMask=()=>mask('ripple');

export function createPixelEffects(world,{software=false,scale,xScale,moon,blockers=[],ponds=[],drain=null}){
  const root=new THREE.Group();root.name='PixelAtmosphere';world.add(root);
  const limits={trails:software?80:160,mist:software?10:24,flecks:software?24:56,ripples:3,beam:1,figures:software?1:3,shafts:software?2:3,echo:software?32:64};
  const batches={},textures=[],position=new THREE.Vector3(),size=new THREE.Vector3(),rotation=new THREE.Quaternion(),matrix=new THREE.Matrix4(),color=new THREE.Color(),euler=new THREE.Euler();
  const frustum=new THREE.Frustum(),projection=new THREE.Matrix4(),sphere=new THREE.Sphere();
  const ground=new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI/2,0,0));
  function batch(name,kind,options={}){
    const map=kind?mask(kind):null;if(map)textures.push(map);
    const material=new THREE.MeshBasicMaterial({color:0xffffff,map,side:THREE.DoubleSide,forceSinglePass:true,alphaTest:kind==='mist'?.72:.5,depthWrite:false,...options});
    const mesh=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),material,limits[name]);mesh.name='PixelEffect-'+name;
    // Submit one clipped primitive during protected scene preparation so the
    // actual instance-color/material layouts are warm before a rare event.
    matrix.makeTranslation(0,-1000,0);mesh.setMatrixAt(0,matrix);mesh.setColorAt(0,color.set(0xffffff));mesh.count=1;mesh.renderOrder=2;mesh.frustumCulled=false;mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);root.add(mesh);batches[name]=mesh;return mesh;
  }
  const trails=batch('trails','trail',{transparent:true,opacity:.24,alphaTest:.025,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
  trails.material.alphaMap=trails.material.map;
  trails.material.map=Art.texture('rough-cut-course-ground-v4',[600,650,256,256],null,true);
  const markKind=new THREE.InstancedBufferAttribute(new Float32Array(limits.trails),1),markFade=new THREE.InstancedBufferAttribute(new Float32Array(limits.trails).fill(1),1);
  markKind.setUsage(THREE.DynamicDrawUsage);markFade.setUsage(THREE.DynamicDrawUsage);trails.geometry.setAttribute('markKind',markKind);trails.geometry.setAttribute('markFade',markFade);
  trails.material.onBeforeCompile=shader=>{
    shader.vertexShader='attribute float markKind;\nattribute float markFade;\nvarying vec2 vMark;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvMark=vec2(markKind,markFade);');
    shader.fragmentShader='varying vec2 vMark;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <alphamap_fragment>','diffuseColor.a *= texture2D(alphaMap,vec2(vAlphaMapUv.x*.5+vMark.x*.5,vAlphaMapUv.y)).g*vMark.y;');
  };
  trails.material.customProgramCacheKey=()=> 'rough-cut-evidence-atlas-v2';
  batch('mist','mist',{transparent:true,opacity:software?.12:.17,alphaTest:.015});batch('flecks',null);batch('ripples','ripple',{transparent:true,opacity:.34,alphaTest:.05});batch('beam','beam',{transparent:true,opacity:.28,alphaTest:.05});
  const mistFade=new THREE.InstancedBufferAttribute(new Float32Array(limits.mist).fill(1),1);
  mistFade.setUsage(THREE.DynamicDrawUsage);batches.mist.geometry.setAttribute('mistFade',mistFade);
  batches.mist.material.onBeforeCompile=shader=>{
    shader.vertexShader='attribute float mistFade;\nvarying float vMistFade;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvMistFade=mistFade;');
    shader.fragmentShader='varying float vMistFade;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <alphatest_fragment>','diffuseColor.a*=vMistFade;\n#include <alphatest_fragment>');
  };
  batches.mist.material.customProgramCacheKey=()=> 'course-local-mist-v1';
  const ghostMap=Art.texture('rough-cut-shadow-joe-v1',[232,42,547,1476]);
  batch('figures',null,{map:ghostMap,transparent:true,opacity:.24,alphaTest:.035});
  batch('shafts','shaft',{transparent:true,opacity:.15,alphaTest:.012});
  batch('echo','echo',{transparent:true,opacity:.55,alphaTest:.04});
  const ghost=createGhostJoe(root,{softFade:true}),ghostMotion=createCourseGhostMotion({blockers,ponds,height:woodlandHeight}),ghostDissolve=createGhostDissolve(),mistCells=[];
  const original=createOriginalFeatures(root,{software,scale,xScale,blockers,ponds});
  const ghostSightings=createGhostSightings(),ghostObstacles=[...blockers,...ponds];
  const ghostFeedback=createGhostFeedback();
  let ghostTear=null,seenGhostKey=null,ghostSeen=false,nextGhostLook=0,ghostTime=0;
  let audioGhost=null;
  const evidence=[];let lastUpdate=-Infinity,lastTime=null,motionTime=0,eventKey=null,eventAnchor=null,updates=0,lastCost=0,maxCost=0;
  let report={};const baseMoon=moon.intensity,baseMoonColor=moon.color.clone(),lookColor=new THREE.Color(),mistColor=new THREE.Color(),mistLitColor=new THREE.Color(),mistLampColor=new THREE.Color();
  function emit(name,x,y,z,w,h,tint,q=ground,fade=1){
    const mesh=batches[name];if(mesh.count>=limits[name])return false;
    sphere.center.set(x,y,z);sphere.radius=Math.max(w,h)*.75;
    if(!frustum.intersectsSphere(sphere))return false;
    position.set(x,y,z);size.set(w,h,1);matrix.compose(position,q,size);mesh.setMatrixAt(mesh.count,matrix);mesh.setColorAt(mesh.count,color.set(tint));if(name==='mist')mistFade.setX(mesh.count,fade);mesh.count++;return true;
  }
  function update(frame,camera,coverage=0){
    const f=frame.fx||{},enabled=f.enabled!==false;
    root.visible=enabled;if(!enabled){ghostMotion.sample(null,null,motionTime);ghostDissolve.sample(null,null,0,ghostTime,{enabled:false});ghost.show(null,0);feedback.hide();moon.intensity=baseMoon;moon.color.copy(baseMoonColor);world.fog.color.set(0x0b151b);report={...report,key:'',enabled:false,drawCalls:0,counts:Object.fromEntries(Object.keys(batches).map(n=>[n,0]))};return;}
    const elapsed=frame.time,elapsedDelta=lastTime===null?0:Math.max(0,elapsed-lastTime),dt=Math.min(.1,elapsedDelta);
    if(lastTime!==null&&elapsed<lastTime)ghostTime=0;
    if(!frame.paused)ghostTime+=elapsedDelta;
    lastTime=elapsed;
    if(!frame.paused&&!frame.reducedMotion)motionTime+=dt;
    // Repeated renders and Pause cannot advance effects. Camera motion still
    // refreshes culling, even during a paused/manual-clock inspection.
    const cameraKey=[camera.position.x,camera.position.y,camera.position.z,...camera.quaternion.toArray(),camera.projectionMatrix.elements[0],camera.projectionMatrix.elements[5]].join(':');
    const preferences=[f.nightfall?.progress,f.circuitState?.used.join(":"),f.circuitState?.active.length,f.finaleReady,f.accentCooldown>0,f.density,f.clear,f.concealment,f.flashes,f.apparitions,f.ghostInterference,f.suppressScares,f.ghostSchedule?.blocked,f.ghostSchedule?.deferred,f.suppressOriginal,f.documents?.request?.id,f.documents?.appeal?.x,f.documents?.appeal?.y,f.zoneEvent?.active,f.zoneEvent?.seed,f.omen?.seed,frame.joe.mode,frame.reducedMotion,f.horror?.visualFlash?.seed,f.horror?.manifestation?.seed,...(f.lamps||[]).map(l=>l.power)].join(':');
    const key=[elapsed,cameraKey,preferences,f.horror?.visualFlash?.seconds,f.horror?.manifestation?.seconds].join(':');
    if(key===report.key)return;
    const effectRate=ghost.stats().visible?(software?24:30):(software?12:24);
    if(elapsed>=lastUpdate&&elapsed-lastUpdate<1/effectRate&&cameraKey===report.camera&&preferences===report.preferences)return;
    const started=performance.now();lastUpdate=elapsed;updates++;
    projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);frustum.setFromProjectionMatrix(projection);
    for(const mesh of Object.values(batches))mesh.count=0;
    const px=camera.position.x,pz=camera.position.z,range=software?25:48,density=clamp(f.density??1,0,1),decor=density*(f.clear?.78:1),pressure=clamp(f.pressure||0,0,1),time=motionTime;
    evidence.length=0;
    for(const mark of f.trails||[]){const x=mark.x*xScale,z=-mark.y*scale,d=(x-px)**2+(z-pz)**2;if(d<range*range&&(mark.duration==null||mark.age<mark.duration))evidence.push({mark,d});}
    evidence.sort((a,b)=>a.d-b.d);
    for(const {mark:m} of evidence){
      const mowed=m.kind==='mowed',life=m.duration?clamp(1-m.age/m.duration,0,1):1;
      if(life<.08)continue;
      const w=mowed?Math.max(.25,(m.laneWidth||m.radius*1.4)*xScale):m.kind==='track'?.12:.25;
      const h=mowed?Math.max(.35,(m.length||m.radius*1.3)*scale):.24;
      rotation.setFromEuler(euler.set(-Math.PI/2,0,Math.atan2(-Math.cos(m.heading||0)*xScale,Math.sin(m.heading||0)*scale)));
      const tint=mowed?(m.wet?0x91b5aa:0xc1caa4):m.sand?0xc5b99a:m.wet?0x657c75:0x8e9d98;
      const index=batches.trails.count;
      if(emit('trails',m.x*xScale,.032,-m.y*scale,w,h,tint,rotation)){markKind.setX(index,mowed?0:1);markFade.setX(index,Math.min(1,life*3));}
      if(batches.trails.count===limits.trails)break;
    }
    const zone=f.fog?.zone||'tee',cold=['water_hazard','dead_green','night_range','release_corridor'].includes(zone),surge=f.fog?.surge||0;
    const look=courseLook(frame.player.y),blend=(name)=>THREE.MathUtils.lerp(look.a[name],look.b[name],look.mix);
    const fogTint=mistColor.setHex(look.a.mist).lerp(lookColor.setHex(look.b.mist),look.mix).multiplyScalar(.65);
    const zoneDensity=clamp(f.fog?.density??1,.8,1.7);
    batches.mist.material.opacity=Math.min(.36,(software?.20:.24)*decor*zoneDensity+surge*.045*decor);
    original.update(frame,camera,emit);
    const mistRegions={pond:0,drain:0,ground:0};
    // Upright wisps face the camera's position, so looking up does not rotate
    // a fog bank through the ground. Near/far fades avoid sudden cell edges.
    const groundMist=(kind,x,y,z,w,h,weight,far=14,end=19,near=.8,clear=2)=>{
      const fade=weight*mistDistanceFade(Math.hypot(x-px,z-pz),near,clear,far,end);
      if(fade<.03)return;
      rotation.setFromEuler(euler.set(0,Math.atan2(px-x,pz-z),0));
      mistLitColor.copy(fogTint);
      for(const lamp of f.lamps||[]){const reach=Math.max(0,1-Math.hypot(x-lamp.x,z-lamp.z)/5)*(lamp.power||0);if(reach>0)mistLitColor.lerp(mistLampColor.set(lamp.color||0xc4ddf2),reach*.38);}
      if(emit('mist',x,y,z,w,h,mistLitColor,rotation,fade))mistRegions[kind]++;
    };
    if(decor>0){
      // Footfall spray uses the same authored surface/age as the sound and
      // ground response. Tiny fragments share the ambient pool and draw.
      for(const step of (frame.steps||[]).slice(-4)){
        const t=clamp(step.age/step.duration,0,1);if(t>.7)continue;
        const tint=step.kind==='wet'?0x6b9d9b:step.kind==='sand'?0x9d8b67:step.kind==='footing_mud'?0x544e37:0x61734b;
        for(let i=0;i<2;i++){const a=(step.heading||0)+i*2.4+random(step.id||0),r=.04+t*.3;emit('flecks',step.x*xScale+Math.cos(a)*r,.04+Math.sin(t*Math.PI)*.18*(step.intensity||.7),-step.y*scale+Math.sin(a)*r,.018*(1-t),.035*(1-t),tint,camera.quaternion);}
      }
      // Pond wisps get first choice of the existing pool. Ordinary fog chooses
      // nearby visible cells rather than filling the pool from one map edge.
      for(const pond of ponds){
        if(Math.hypot(pond.x-px,pond.z-pz)>19)continue;
        for(let i=0;i<2;i++){
          const x=pond.x+(i?1:-1)*pond.rx*.35+Math.sin(time*.13+i)*.25,z=pond.z+(i?-.3:.25)*pond.rz;
          groundMist('pond',x,.22+i*.08,z,Math.min(4,pond.rx*1.25),.48+i*.10,1);
        }
      }
      if(drain&&Math.hypot(drain.x-px,drain.z-pz)<14){
        for(let i=0;i<2;i++)groundMist('drain',drain.x+(i?-.7:.65)+Math.sin(time*.12+i)*.22,.18+i*.10,drain.z+(i?-.6:.7),2.3+i*.4,.38+i*.1,.9,9,14);
      }
      const cell=5,cx=Math.floor(px/cell),cz=Math.floor(pz/cell);mistCells.length=0;
      for(let dz=-3;dz<=3;dz++)for(let dx=-3;dx<=3;dx++){
        const gx=cx+dx,gz=cz+dz,seed=gx*173+gz*311;
        if(random(seed)>.42+surge*.16)continue;
        const x=(gx+.2+random(seed+1)*.6)*cell+Math.sin(time*.11+seed)*.4,z=(gz+.2+random(seed+2)*.6)*cell,d=(x-px)**2+(z-pz)**2;
        const habitat=courseMistHabitat(x,z,ponds,drain);
        if(d<16||habitat<.08||blockers.some(b=>((x-b.x)/(b.rx+.3))**2+((z-b.z)/(b.rz+.3))**2<1))continue;
        mistCells.push({x,z,d,seed,habitat});
      }
      mistCells.sort((a,b)=>a.d-b.d);
      for(const {x,z,seed,habitat} of mistCells){
        if(batches.mist.count>=limits.mist-3)break;
        groundMist('ground',x,woodlandHeight(x,z)+.20+random(seed+4)*.10,z,(2+random(seed+5)*2)*blend('spread'),.40+random(seed+6)*.18,habitat,11,15,4,6);
      }
      // The mower's wake follows its actual heading and movement, not the camera.
      const j=frame.joe,jx=j.x*xScale,jz=-j.y*scale,heading=j.effectHeading||0,speed=j.effectSpeed||0;
      const wakeHabitat=courseMistHabitat(jx,jz,ponds,drain);
      if(speed>.4&&wakeHabitat>.2)for(let i=1;i<=2;i++)groundMist('ground',jx-Math.cos(heading)*i*.65,woodlandHeight(jx,jz)+.12,jz+Math.sin(heading)*i*.65,.7+i*.16,.17,wakeHabitat*.35);
      const wind=clamp(f.wind?.strength||0,0,1),direction=f.wind?.direction||1;
      for(let i=0;i<Math.round(limits.flecks*.65*density);i++){
        const seed=i*137,anchorX=Math.floor(px/12)*12,anchorZ=Math.floor(pz/12)*12;
        const x=anchorX+((random(seed)*24+time*(.05+wind*.7)*direction)%24+24)%24-6,z=anchorZ+random(seed+3)*24-6;
        emit('flecks',x,.25+random(seed+4)*2+Math.sin(time*.7+i)*.08,z,wind>.3?.035:.018,.015,wind>.3?0x747e59:0x6d887b,camera.quaternion);
      }
      for(const lamp of [...(f.lamps||[])].sort((a,b)=>(a.x-px)**2+(a.z-pz)**2-(b.x-px)**2-(b.z-pz)**2)){
        if(lamp.power<.2)continue;
        const d=(lamp.x-px)**2+(lamp.z-pz)**2;if(d>144)continue;
        rotation.setFromEuler(euler.set(0,Math.atan2(px-lamp.x,pz-lamp.z),0));
        emit('shafts',lamp.x,1.45+woodlandHeight(lamp.x,lamp.z),lamp.z,1.3,2.6,color.set(lamp.color||0xffedbb).multiplyScalar(lamp.power),rotation);
        for(let i=0;i<(software?1:3);i++){const a=time*(1+i*.2)+lamp.x*13+i*2;emit('flecks',lamp.x+Math.cos(a)*.16,lamp.y+Math.sin(a*1.3)*.10,lamp.z+Math.sin(a)*.16,.027,.012,color.set(lamp.color||0xffedbb).multiplyScalar(lamp.power),camera.quaternion);}
      }
      if(cold&&!frame.reducedMotion){const phase=(time%3.6)/3.6;if(phase<.4){position.set(.12,-.25,-.65-phase*.9).applyQuaternion(camera.quaternion).add(camera.position);emit('mist',position.x,position.y,position.z,.18+phase*.45,.08,0x536762,camera.quaternion);}}
    }
    // Readable, grounded mower direction. These cues never reveal an actor
    // through scenery: all effect batches use the normal world depth test.
    const j=frame.joe,near=(j.x*xScale-px)**2+(-j.y*scale-pz)**2<range*range;
    if(near&&pressure>.12){
      const pulse=frame.reducedMotion?.35:(time*.45)%1;
      for(let i=0;i<(software?1:2);i++){const r=.65+((pulse+i*.5)%1)*1.6;emit('ripples',j.x*xScale,.045,-j.y*scale,r*2,r*2,j.mode==='chase'?0x665036:0x344734);}
      if(j.mode==='chase'||j.mode==='search'||j.mode==='investigate'){
        const h=j.effectHeading||0,length=j.mode==='chase'?2.4:1.5;
        rotation.setFromEuler(euler.set(-Math.PI/2,0,h-Math.PI/2));
        emit('beam',j.x*xScale+Math.cos(h)*length*.55,.042,-j.y*scale-Math.sin(h)*length*.55,.65,length,0x776a47,rotation);
      }
    }
    // Recorded player route is evidence, not a hostile apparition; it remains
    // available with scares disabled and never writes to the saved run.
    const echo=f.echo;
    if(echo?.record?.ghostPath){
      const path=echo.record.ghostPath,start=frame.time-10;let lo=0,hi=path.length;
      while(lo<hi){const mid=(lo+hi)>>1;if(path[mid].t<start)lo=mid+1;else hi=mid;}
      for(let i=Math.max(1,lo);i<path.length&&path[i].t<=frame.time;i++){
        const a=path[i-1],b=path[i],dx=(b.x-a.x)*xScale,dz=-(b.y-a.y)*scale,len=Math.hypot(dx,dz),x=(a.x+b.x)*xScale/2,z=-(a.y+b.y)*scale/2;
        if(len<.025||len>8||(x-px)**2+(z-pz)**2>range*range)continue;
        rotation.setFromEuler(euler.set(-Math.PI/2,0,Math.atan2(-dx,-dz)));
        emit('echo',x,woodlandHeight(x,z)+.025,z,.10,len,echo.ahead?0x81c7bc:0xd0b078,rotation);
        if(batches.echo.count>=limits.echo)break;
      }
    }
    const horror=f.horror||{},scaresAllowed=f.apparitions!==false&&!f.suppressScares&&!f.ghostSchedule?.blocked&&j.mode!=='chase';
    const active=scaresAllowed&&!frame.reducedMotion?(horror.manifestation||(f.flashes?horror.visualFlash:null)):null;
    const identity=active?active.type+':'+active.seed:null;
    if(identity!==eventKey){eventKey=identity;eventAnchor=null;if(active&&active.type!=='course_tear'){
      // Check authored solid footprints once per event. Never force a ghost
      // through cover or slide it around when the player turns.
      for(const [side,depth] of [[active.side||1,7.5],[active.side||1,5.5],[-(active.side||1),7.5],[-(active.side||1),5.5]]){
        position.set(side*2.9,0,-depth).applyAxisAngle(THREE.Object3D.DEFAULT_UP,-frame.yaw).add(camera.position);
        if(Math.abs(position.x)>13)continue;
        let blocked=false;
        for(const o of blockers){
          for(let k=3;k<=16;k++){
            const t=k/16,x=px+(position.x-px)*t,z=pz+(position.z-pz)*t;
            if(((x-o.x)/(o.rx+.5))**2+((z-o.z)/(o.rz+.5))**2<1){blocked=true;break;}
          }
          if(blocked)break;
        }
        if(!blocked){eventAnchor={x:position.x,y:woodlandHeight(position.x,position.z),z:position.z,yaw:Math.atan2(px-position.x,pz-position.z)+Math.PI};break;}
      }
    }}
    let apparitionAlpha=0,modelAnchor=null,motionKey=null;
    const sightClear=(x,z)=>!blockers.some(o=>{
      const ax=(px-o.x)/(o.rx+.12),az=(pz-o.z)/(o.rz+.12),dx=(x-px)/(o.rx+.12),dz=(z-pz)/(o.rz+.12),t=clamp(-(ax*dx+az*dz)/(dx*dx+dz*dz||1),0,1);
      return (ax+dx*t)**2+(az+dz*t)**2<1;
    });
    const eligibleGhost=s=>{
      if(frame.time<8)return false;
      const d=Math.hypot((s.x-frame.player.x)*.72,s.y-frame.player.y);
      if(d<30||d>110)return false;
      const x=s.x*xScale,z=-s.y*scale;
      if(ghostObstacles.some(o=>((x-o.x)/(o.rx+1.1))**2+((z-o.z)/(o.rz+1.1))**2<1))return false;
      sphere.center.set(x,woodlandHeight(x,z)+1.1,z);sphere.radius=1.4;
      return frustum.intersectsSphere(sphere)&&sightClear(x,z);
    };
    const ambientAllowed=f.apparitions!==false&&!(f.ghostSchedule?.blocked??f.suppressScares)&&j.mode!=='chase';
    const ambient=ghostSightings.sample(ghostTime,!active&&ambientAllowed,f.spectral||[],eligibleGhost,()=>{
      if(frame.time<8)return null;
      // Only choose a new anchor at spawn time. If the authored tree-line
      // positions are occluded, materialize on clear ground ahead of the route.
      for(const depth of [8,6,10])for(const side of [-2.3,2.3,-3.6,3.6,0]){
        const x=px+side*Math.cos(frame.yaw)+depth*Math.sin(frame.yaw),z=pz+side*Math.sin(frame.yaw)-depth*Math.cos(frame.yaw);
        if(Math.abs(x)>12.5||z> -3||z< -112)continue;
        const site={x:x/xScale,y:-z/scale,lean:side<0?-1:1};
        if(eligibleGhost(site))return site;
      }
      return null;
    },{deferred:f.ghostSchedule?.deferred??((f.accentCooldown||0)>0),enabled:f.apparitions!==false});
    if(active&&eventAnchor){
      const age=clamp(1-active.seconds/active.duration,0,1);
      apparitionAlpha=Math.min(1,age/.16,(1-age)/.3)*.68;modelAnchor=eventAnchor;motionKey=identity;
    }else if(ambient){
      const x=ambient.site.x*xScale,z=-ambient.site.y*scale;
      modelAnchor={x,y:woodlandHeight(x,z),z,yaw:x<0?-Math.PI/2:Math.PI/2};
      apparitionAlpha=ambient.alpha;motionKey=ambient.key;
    }
    const motionOptions={reduced:frame.reducedMotion,player:{x:px,z:pz}};
    let movement=motionKey&&modelAnchor?ghostMotion.sample(motionKey,modelAnchor,ghostTime,motionOptions):null;
    const presentation=ghostDissolve.sample(motionKey,movement,apparitionAlpha,ghostTime,{enabled:f.apparitions!==false&&ghost.stats().ready,reduced:frame.reducedMotion,continueMotion:(key,time)=>ghostMotion.advance(key,time,motionOptions)});
    movement=presentation?.motion||null;modelAnchor=movement;apparitionAlpha=presentation?.alpha||0;motionKey=presentation?.key||null;
    ghost.show(modelAnchor,apparitionAlpha,movement);
    audioGhost=modelAnchor&&apparitionAlpha>.08?{key:motionKey,x:modelAnchor.x,z:modelAnchor.z,phase:movement?.behaviorPhase||'passing',gesture:movement?.gesture||null,gazeGesture:movement?.gazeGesture||null,gazeVariant:movement?.gazeVariant||0}:null;
    if(seenGhostKey!==motionKey){seenGhostKey=motionKey;ghostSeen=false;nextGhostLook=0;}
    if(audioGhost&&!ghostSeen&&ghostTime>=nextGhostLook){
      nextGhostLook=ghostTime+.2;
      const dx=modelAnchor.x-px,dz=modelAnchor.z-pz,d=Math.max(.01,Math.hypot(dx,dz));
      sphere.center.set(modelAnchor.x,modelAnchor.y+1.1,modelAnchor.z);sphere.radius=1;
      ghostSeen=(dx*Math.sin(frame.yaw)-dz*Math.cos(frame.yaw))/d>.72&&frustum.intersectsSphere(sphere)&&!blockers.some(o=>{
        const ax=(px-o.x)/(o.rx+.12),az=(pz-o.z)/(o.rz+.12),vx=dx/(o.rx+.12),vz=dz/(o.rz+.12),t=clamp(-(ax*vx+az*vz)/(vx*vx+vz*vz||1),0,1);
        return (ax+vx*t)**2+(az+vz*t)**2<1;
      });
    }
    ghostTear=ghostFeedback.sample(ghostTime,audioGhost?{...audioGhost,seen:ghostSeen,side:(modelAnchor.x-px)*Math.cos(frame.yaw)+(modelAnchor.z-pz)*Math.sin(frame.yaw)<0?-1:1}:null,(ambientAllowed||scaresAllowed)&&!frame.reducedMotion&&f.ghostInterference!==false);
    if(ghostTear && modelAnchor){position.set(modelAnchor.x,modelAnchor.y+1.1,modelAnchor.z).project(camera);ghostTear.focusY=clamp((position.y+1)*.5,.22,.78);}
    if(modelAnchor&&!ghost.stats().ready)emit('figures',modelAnchor.x,modelAnchor.y+1.15,modelAnchor.z,.85,2.3,0xa5c7b5,camera.quaternion);
    batches.figures.material.opacity=apparitionAlpha;
    markKind.needsUpdate=markFade.needsUpdate=mistFade.needsUpdate=true;
    for(const mesh of Object.values(batches)){mesh.visible=mesh.count>0;if(mesh.count){mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;}}
    const cloud=1-clamp(coverage,0,.85)*.18,blackout=horror.lightFailureSeconds>0?.82:1;
    moon.intensity=baseMoon*cloud*blackout*blend('power')*(f.nightfall?.moonScale??1);
    moon.color.copy(baseMoonColor).lerp(mistColor.setHex(look.a.moon).lerp(lookColor.setHex(look.b.moon),look.mix),.55);
    world.fog.color.setHex(look.a.fog).lerp(lookColor.setHex(look.b.fog),look.mix).lerp(lookColor.setHex(0x0d1726),(f.nightfall?.progress||0)*.18).multiplyScalar(.72);
    lastCost=performance.now()-started;maxCost=Math.max(maxCost,lastCost);
    // The normal screen pass precedes world updates; refresh newly triggered
    // ghost pulses now so their first visible frame is not delayed.
    feedback.draw(frame);
    report={key,camera:cameraKey,preferences,enabled:true,zone,nightfall:f.nightfall||null,zoneLook:{from:look.a.id,to:look.b.id,mix:look.mix,fog:world.fog.color.getHex(),moon:moon.color.getHex()},cadence:ghostSightings.stats(),ghostScheduling:f.ghostSchedule||null,surge,wind:f.wind?.strength||0,moonlight:cloud,lightFailure:blackout<1,event:active?.type||null,eventAnchor:eventAnchor?{...eventAnchor}:null,ambientSighting:ambient?{site:ambient.index,key:ambient.key,alpha:ambient.alpha}:null,pressure,concealment:f.concealment||0,decor,mistRegions,mistOpacity:batches.mist.material.opacity,zoneDensity,motionTime,counts:Object.fromEntries(Object.entries(batches).map(([n,m])=>[n,m.count])),drawCalls:Object.values(batches).filter(m=>m.visible).length+ghost.stats().drawCalls};
  }

  // A small CPU canvas draws pressure/concealment borders below the native HUD.
  // Live scene tearing belongs to the existing presentation compositor.
  const feedback=(()=>{
    const canvas=document.createElement('canvas');canvas.id='pixel-feedback';canvas.width=256;canvas.height=144;canvas.setAttribute('aria-hidden','true');canvas.hidden=true;
    Object.assign(canvas.style,{position:'absolute',zIndex:'1',pointerEvents:'none',imageRendering:'pixelated'});
    const stage=document.getElementById('game');stage.parentElement.append(canvas);
    const resize=()=>{Object.assign(canvas.style,{left:stage.offsetLeft+'px',top:stage.offsetTop+'px',width:stage.clientWidth+'px',height:stage.clientHeight+'px'});};
    const observer=new ResizeObserver(resize);observer.observe(stage);resize();
    const g=canvas.getContext('2d',{alpha:true,willReadFrequently:true});let stamp='',paints=0;
    function draw(frame){
      const f=frame.fx||{};canvas.hidden=!f.screen||f.enabled===false;if(canvas.hidden)return;
      const pressure=clamp((f.pressure||0)*(f.pursuitIntensity??1),0,1),conceal=clamp(f.concealment||0,0,1),flash=f.flashes&&!frame.reducedMotion&&!f.suppressScares&&frame.joe.mode!=='chase'?f.horror?.visualFlash:null;
      const envelope=flash&&flash.type!=='course_tear'?Math.sin(clamp(1-flash.seconds/flash.duration,0,1)*Math.PI)*.32:0;
      const pulse=frame.reducedMotion?1:.92+.08*Math.sin(frame.time*3);
      const red=Math.round(pressure*pulse*12)/12,green=Math.round(conceal*10)/10,edge=Math.round(envelope*16)/16;
      const next=[red,green,edge,flash?.side].join(':');if(next===stamp)return;stamp=next;paints++;g.clearRect(0,0,256,144);
      // Stepped, low-opacity borders leave the aiming and action lane clear.
      for(let i=0;i<7;i++){
        g.fillStyle=red>.12?`rgba(87,34,21,${red*(7-i)*.009})`:`rgba(18,43,29,${green*(7-i)*.013})`;
        const n=i*2;g.fillRect(n,n,2,144-n*2);g.fillRect(254-n,n,2,144-n*2);g.fillRect(n,n,256-n*2,2);g.fillRect(n,142-n,256-n*2,2);
      }
      if(green>.2)for(let i=0;i<18;i++){g.fillStyle=`rgba(66,87,48,${green*.22})`;const x=i%2?249-random(i)*10:random(i)*10;g.fillRect(Math.floor(x),112+Math.floor(random(i+4)*26),2,4+Math.floor(random(i+9)*12));}
      if(edge>0){g.fillStyle=`rgba(147,170,147,${edge})`;const x=(flash.side||1)<0?0:244;for(let i=0;i<5;i++)g.fillRect(x,25+i*19,12,1);}
    }
    return {draw,hide:()=>{canvas.hidden=true;},dispose:()=>{observer.disconnect();canvas.remove();},stats:()=>({paints,resolution:[256,144],visible:!canvas.hidden,ghostTear:ghostTear?{...ghostTear}:null})};
  })();
  return {root,encounterPhase:()=>root.visible?ghostSightings.stats().phase:'quiet',interference:()=>ghostTear,audioState:()=>root.visible?audioGhost:null,ready:ghost.ready,preparation:ghost.root,update,screen:feedback.draw,hide:feedback.hide,stats:()=>{const {key,camera,preferences,...publicReport}=report;return {...publicReport,drawCalls:(publicReport.drawCalls||0)+(original.stats().drawCalls||0),original:original.stats(),limits,updates,updateMs:lastCost,maxUpdateMs:maxCost,feedback:feedback.stats(),ghost:ghost.stats()};},dispose:()=>{original.dispose();ghost.dispose();feedback.dispose();root.removeFromParent();for(const mesh of Object.values(batches)){mesh.dispose();mesh.geometry.dispose();mesh.material.dispose();}for(const t of textures)t.dispose();}};
}
