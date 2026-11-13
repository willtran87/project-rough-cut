import {zoneCueAnchor} from './zone-cue-scene.js';
import * as THREE from './vendor/three/three.module.js';
import * as Art from './pixel-art.js';
import {woodlandHeight} from './pixel-landscape.js';

// Read-only adapters for legacy gameplay evidence. Two bounded instanced draws;
// no physics, light sources, navigation requests, mixers or screen readbacks.
export function createOriginalFeatures(parent,{software,scale,xScale,blockers,ponds}){
  const root=new THREE.Group();root.name='OriginalFeatures';parent.add(root);
  // One small shared pixel finish keeps tiny mechanisms and persistent marks
  // in the course's worn palette without loading another external asset.
  const grainCanvas=document.createElement('canvas');grainCanvas.width=grainCanvas.height=64;
  const grainContext=grainCanvas.getContext('2d');
  for(let y=0;y<64;y++)for(let x=0;x<64;x++){
    const shade=212+((x*73+y*47+(x*y)%31)%44);
    grainContext.fillStyle=`rgb(${shade},${shade},${shade})`;grainContext.fillRect(x,y,1,1);
  }
  const grain=new THREE.CanvasTexture(grainCanvas);grain.colorSpace=THREE.SRGBColorSpace;grain.magFilter=THREE.NearestFilter;grain.minFilter=THREE.NearestFilter;grain.generateMipmaps=false;
  const limit=software?112:176,geometry=new THREE.BoxGeometry(1,1,1),material=new THREE.MeshBasicMaterial({color:0xffffff,map:grain,vertexColors:true});
  const faces=new Float32Array(geometry.attributes.position.count*3),normals=geometry.attributes.normal;
  for(let i=0;i<normals.count;i++){
    const shade=normals.getY(i)>.5?1:normals.getX(i)>.5?.72:normals.getX(i)<-.5?.82:normals.getZ(i)>.5?.94:.66;
    faces.set([shade,shade,shade],i*3);
  }
  geometry.setAttribute('color',new THREE.BufferAttribute(faces,3));
  const marks=new THREE.InstancedMesh(geometry,material,limit);marks.frustumCulled=false;marks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);root.add(marks);
  const canvas=document.createElement('canvas');canvas.width=192;canvas.height=256;
  const g=canvas.getContext('2d',{willReadFrequently:true});
  const paperTexture=new THREE.CanvasTexture(canvas);paperTexture.colorSpace=THREE.SRGBColorSpace;paperTexture.magFilter=THREE.NearestFilter;paperTexture.minFilter=THREE.NearestFilter;paperTexture.generateMipmaps=false;
  function paintPaper(image){
    g.fillStyle='#c4b28b';g.fillRect(0,0,192,256);g.imageSmoothingEnabled=false;
    if(image){g.globalAlpha=.42;g.drawImage(image,900,175,110,110,0,0,192,256);g.globalAlpha=1;}
    for(let i=0;i<330;i++){g.fillStyle=i%2?'#baaa86':'#cfbf99';g.fillRect((i*73)%192,(i*47)%256,2,1);}
    g.fillStyle='#514c3c';g.font='bold 15px monospace';g.fillText('UNFILED',25,37);g.fillText('CHANGE REQUEST',12,58);
    for(let i=0;i<8;i++){g.fillStyle=i%3?'#8b8065':'#6e6651';g.fillRect(21,81+i*15,143-(i%3)*17,2);}
    g.strokeStyle='#974c38';g.lineWidth=4;g.strokeRect(106,190,60,42);g.font='bold 14px monospace';g.fillStyle='#974c38';g.fillText('REVIEW',111,216);paperTexture.needsUpdate=true;
  }
  paintPaper(null);let disposed=false;Art.source('rough-cut-interactable-props-v1').then(image=>{if(!disposed)paintPaper(image);});
  const papers=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:paperTexture,side:THREE.DoubleSide}),2);papers.frustumCulled=false;papers.instanceMatrix.setUsage(THREE.DynamicDrawUsage);root.add(papers);
  const matrix=new THREE.Matrix4(),p=new THREE.Vector3(),s=new THREE.Vector3(),q=new THREE.Quaternion(),e=new THREE.Euler(),color=new THREE.Color(),sphere=new THREE.Sphere(),frustum=new THREE.Frustum(),projection=new THREE.Matrix4();
  const docQ=new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI/3,0,-.09)),docP=new THREE.Vector3(),local=new THREE.Vector3();
  let zoneKey=null,anchor=null,lastTime=-Infinity,report={};
  for(const mesh of [marks,papers]){mesh.setMatrixAt(0,matrix.makeTranslation(0,-1000,0));mesh.setColorAt(0,color.set(0xffffff));mesh.count=1;}
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),noise=n=>{const v=Math.sin(n*127.1+53.7)*43758.54;return v-Math.floor(v);};
  let camera,range;
  function box(x,y,z,w,h,d,tint,rx=0,ry=0,rz=0){
    if(marks.count>=limit||(x-camera.position.x)**2+(z-camera.position.z)**2>range*range)return;
    sphere.center.set(x,y,z);sphere.radius=Math.max(w,h,d);if(!frustum.intersectsSphere(sphere))return;
    p.set(x,y,z);s.set(w,h,d);q.setFromEuler(e.set(rx,ry,rz));matrix.compose(p,q,s);marks.setMatrixAt(marks.count,matrix);marks.setColorAt(marks.count++,color.set(tint));
  }
  function drawDocument(source,appeal){
    if(!source)return false;const x=source.x*xScale,z=-source.y*scale,y=woodlandHeight(x,z),lift=appeal?.10:.65;
    if((x-camera.position.x)**2+(z-camera.position.z)**2>range*range)return false;
    docP.set(x,y+lift,z);const part=(dx,dy,dz,w,h,d,tint)=>{local.set(dx,dy,dz).applyQuaternion(docQ).add(docP);box(local.x,local.y,local.z,w,h,d,tint,-Math.PI/3,0,-.09);};
    part(0,0,0,.62,.81,.045,0x794a32);part(0,0,.028,.56,.75,.018,0xc0af89);
    part(0,.32,.06,.24,.055,.035,0x7f8d8b);part(-.10,.32,.083,.025,.026,.013,0xc2c6ad);part(.10,.32,.083,.025,.026,.013,0xc2c6ad);
    if(!appeal){box(x,y+.24,z+.17,.08,.48,.08,0x655643);box(x,y+.035,z+.17,.46,.07,.36,0x4b4a3b);}
    local.set(0,0,.04).applyQuaternion(docQ).add(docP);matrix.compose(local,docQ,s.set(.54,.72,1));papers.setMatrixAt(papers.count,matrix);papers.setColorAt(papers.count++,color.set(appeal?0xb9c6b3:0xffffff));return true;
  }
  function dashRing(source,radius,tint,count=20){const x=source.x*xScale,z=-source.y*scale;for(let i=0;i<count;i++){const a=i/count*Math.PI*2,xx=x+Math.cos(a)*radius,zz=z+Math.sin(a)*radius;box(xx,woodlandHeight(xx,zz)+.035,zz,.045,.025,Math.max(.10,radius*.17),tint,0,-a,0);}}
  function update(frame,view,emit){
    camera=view;range=software?28:50;const f=frame.fx||{},z=f.zoneEvent,omen=f.omen;
    if(frame.time<lastTime){zoneKey=null;anchor=null;}lastTime=frame.time;
    frustum.setFromProjectionMatrix(projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));marks.count=papers.count=0;
    const documents={request:drawDocument(f.documents?.request,false),appeal:drawDocument(f.documents?.appeal,true)};
    // Two optional weathered circuit boxes reuse the same instanced material.
    // Mount beside the approach, outside the existing pole collision hull.
    for(const circuit of f.circuits||[]){
      const x=circuit.x*xScale,zz=-circuit.y*scale,y=woodlandHeight(x,zz),active=f.circuitState?.active.find(c=>c.id===circuit.id),used=f.circuitState?.used.includes(circuit.id);
      box(x,y+.70,zz,.08,1.4,.08,0x53605a);
      box(x,y+1.46,zz,.48,.53,.20,0x55635e);
      box(x,y+1.74,zz,.54,.045,.25,0x809088);
      box(x,y+1.46,zz+.109,.40,.45,.025,0x343e3b);
      for(const side of [-1,1]){box(x+side*.17,y+1.62,zz+.13,.027,.027,.018,0xa3aca1);box(x+side*.17,y+1.30,zz+.13,.027,.027,.018,0xa3aca1);}
      box(x,y+1.59,zz+.13,.23,.032,.018,0xb0a67c);
      box(x-.11,y+1.47,zz+.15,.047,.047,.022,active?0xd4a464:used?0x65756b:0x8dae99);
      box(x+.06,y+1.40,zz+.15,.034,.17,.035,0x8c9181,used?-.6:.4);
      box(x+.06,y+(used?1.33:1.47),zz+.19,.13,.043,.065,0x9f7448);
      for(let i=0;i<3;i++)box(x-.11+i*.10,y+1.28,zz+.13,.055,.025,.018,i%2?0x252f2a:0xa79762);
      box(x,y+.06,zz-.8,.04,.035,1.6,0x3e443e);
    }
    const usefulStart=marks.count;
    // Earned tactical evidence remains visible at zero decorative density.
    if(f.forecast?.timer>0){const path=f.forecast.path||[];for(let i=1;i<path.length&&i<25;i++){const a=path[i-1],b=path[i],dx=(b.x-a.x)*xScale,dz=-(b.y-a.y)*scale,l=Math.hypot(dx,dz);if(l<.01||l>8)continue;const x=(a.x+b.x)*xScale/2,zz=-(a.y+b.y)*scale/2;box(x,woodlandHeight(x,zz)+.04,zz,.045,.026,l*.7,0x79bdac,0,Math.atan2(dx,dz));}}
    if(f.trace?.timer>0){
      const trace=f.trace,tint=trace.freshness==='fresh'?0xc6d383:0xafa16b;
      dashRing(trace,.4,tint,10);
      const x=trace.x*xScale,zz=-trace.y*scale,a=Math.atan2(Math.cos(trace.heading||0)*xScale,-Math.sin(trace.heading||0)*scale);
      for(let i=0;i<3;i++){const xx=x+Math.sin(a)*(.25+i*.18),tz=zz+Math.cos(a)*(.25+i*.18);box(xx,woodlandHeight(xx,tz)+.04,tz,.055,.025,.13,tint,0,a);}
      for(const side of [-1,1])box(x+Math.sin(a)*.71+Math.cos(a)*side*.065,woodlandHeight(x,zz)+.04,zz+Math.cos(a)*.71-Math.sin(a)*side*.065,.04,.025,.19,tint,0,a+side*.6);
    }
    if(f.statusArea)dashRing(f.statusArea.target,f.statusArea.radiusMeters*scale,f.statusArea.outcome==='escalated'?0xd88d60:0xc0b671,20);
    const tactical=marks.count-usefulStart;
    // Tiny winding mechanisms share the existing marks draw and pixel palette.
    // A physical dial stays readable even with decorative effects disabled.
    for(const timer of f.maintenanceTimers||[]){
      const x=timer.x*xScale,zz=-timer.y*scale,ground=woodlandHeight(x,zz),y=ground+.36,used=f.timerUsed?.includes(timer.id),active=f.timerActive?.id===timer.id;
      box(x,ground+.05,zz,.32,.08,.27,0x34413b);
      box(x,ground+.61,zz,.16,1.08,.13,0x3d5048);
      box(x,y+.74,zz,.36,.10,.28,0x8c7651);
      box(x,y+.66,zz+.10,.24,.19,.035,used&&!active?0x595c48:0xc4af74);
      box(x,y+.66,zz+.125,.19,.16,.008,used&&!active?0x6c6e55:0xada582);
      for(let i=0;i<8;i++){
        const a=i*Math.PI/4;box(x+Math.sin(a)*.073,y+.66+Math.cos(a)*.06,zz+.133,.014,.019,.008,0x36483e,0,0,-a);
      }
      for(const side of [-1,1]){
        box(x+side*.145,y+.76,zz+.12,.025,.025,.025,0xd0ba84);
        box(x+side*.145,y+.61,zz+.12,.025,.025,.025,0x69563b);
        box(x+side*.075,y+.71,zz+.13,.025,.018,.015,0x69563b);
      }
      box(x,y+.79,zz,.19,.035,.19,0xa18a5c);
      box(x,y+.82,zz,.065,.03,.07,0xc1a977);
      const ringing=active&&f.timerActive.phase==='ringing';
      const angle=active&&!frame.reducedMotion?(ringing?Math.sin(frame.time*10)*.08:(4-f.timerActive.remaining)*Math.PI*.5):0;
      box(x,y+.66,zz+.15,.014,.10,.012,0x263c35,0,0,angle);
      box(x,y+.66,zz+.16,.028,.026,.012,ringing?0xca8355:active?0xb7b989:0x8c6c42);
      box(x+.20,y+.70,zz,.11,.035,.04,0xa7ad92);
    }
    // After a check, altered paperwork/black imprints remain at that station.
    // At most three traces, no new texture, transparency pass or collision.
    if((f.density??1)>0)for(const trace of f.aftermath||[]){
      const x=trace.x*xScale,zz=-trace.y*scale,y=woodlandHeight(x,zz);
      if(trace.id==='audit-bell'){
        for(let i=0;i<5;i++)for(const side of [-1,1])box(x+side*.22,y+.035,zz+.5+i*.22,.14,.026,.18,0x182d29,0,side*.13);
      }else if(trace.id==='field-log'){
        box(x+.4,y+.045,zz+.45,.33,.025,.46,0xb6ac87,0,.24);
        for(let i=0;i<4;i++)box(x+.4,y+.061,zz+.33+i*.07,.22,.008,.018,0x605c48,0,.24);
        box(x+.48,y+.065,zz+.57,.10,.009,.07,0x824939,0,.24);
        for(let i=0;i<6;i++)box(x+.25+(i%2)*.28,y+.063,zz+.29+i*.055,.035,.008,.025,0x918465,0,.24);
      }else{
        for(const side of [-1,1])box(x+side*.36,y+.035,zz+.55,.085,.025,1.35,0x28332a);
        for(let i=0;i<5;i++)box(x-.45+i*.23,y+.046,zz+1.05,.16,.018,.09,0x786348,0,.35);
      }
    }
    const key=z?.active?z.active+':'+z.seed:null;
    if(key!==zoneKey){zoneKey=key;anchor=null;if(key){
      const origin={x:frame.player.x*xScale,z:-frame.player.y*scale};
      anchor=z.anchor||zoneCueAnchor(z.active,z.seed,origin,blockers,ponds);
    }}
    const enabled=(f.density??1)>0&&!frame.reducedMotion&&!f.suppressOriginal&&frame.joe.mode!=='chase';
    const start=marks.count;
    if(enabled&&omen&&omen.seconds>0){
      const t=clamp(1-omen.seconds/omen.duration),fade=Math.sin(t*Math.PI),x=omen.x*xScale,zz=-omen.y*scale,y=woodlandHeight(x,zz);
      if(omen.type==='grass_line')for(let i=0;i<10;i++){const xx=x+(i-5)*.13,oz=zz+(noise(i+omen.seed)-.5)*.28,h=.11+noise(i+7)*.15;box(xx,woodlandHeight(xx,oz)+h*.42,oz,.014,h,.018,i%3?0x667b48:0x819056,0,i*.7,(omen.side||1)*fade*(.35+noise(i)*.45));}
      else if(omen.type==='birds_scatter')for(let i=0;i<(software?4:7);i++){const bx=x+(omen.side||1)*t*(2+i*.2)+(i-3)*.24,by=y+1.2+t*(1.2+noise(i+4))+noise(i)*.8;for(const side of [-1,1])box(bx+side*.06,by,zz-t-noise(i+9),.14,.025,.04,0x131e1a,0,0,side*Math.sin(t*18+i)*.6);}
      else for(let i=0;i<3;i++)emit('mist',x+(i-1)*(.4+t),y+.22,zz-t,1.3,.3,0x829d91,camera.quaternion);
    }
    const warning=marks.count-start;
    if(enabled&&anchor&&z.timer>0){
      const t=clamp(1-z.timer/z.duration),fade=Math.sin(Math.PI*t),x=anchor.x,zz=anchor.z,y=woodlandHeight(x,zz),beat=.5+.5*Math.sin(t*12);
      if(z.active==='boundary_knock')for(let i=0;i<4;i++)box(x,y+.7+i*.2,zz,.04,.035,.35+fade*.35,0xb99b62,0,0,beat*.2);
      if(z.active==='hedge_breath'){for(let i=0;i<9;i++)box(x+(i-4)*.13,y+.35+beat*.12,zz,.10,.04,.08,0x78905c,0,t+i);emit('mist',x,y+.35,zz,1.5+beat,.35,0x647e66,camera.quaternion);}
      if(z.active==='hedge_breach')for(let i=0;i<(software?16:28);i++){const u=(t*1.3+noise(i))%1;box(x+(noise(i+3)-.5)*u*2,y+.2+Math.sin(u*Math.PI)*.9,zz+u,.04,.07,.025,0x899b57,u*4,i);}
      if(z.active==='submerged_lights')for(let i=0;i<4;i++)box(x+(i-1.5)*Math.min(.6,(anchor.rx||2)*.3),.096,zz+Math.sin(t*3+i)*.25,.13+fade*.12,.018,.09+fade*.12,0x619e9a);
      if(z.active==='door_cycle')for(const side of [-1,1])box(x+side*.14,1.60,zz,.24,.46,.018,beat>.4?0xc1a774:0x302d24);
      if(z.active==='black_sprinklers')for(let j=0;j<2;j++)for(let i=0;i<12;i++){const u=(i/12+t*.7)%1;box(x+j*1.3+u*.9,y+.08+Math.sin(u*Math.PI)*1.1,zz,.035,.08,.035,0x59716c,0,0,-u);}
      if(z.active==='range_volley')for(let i=0;i<(software?8:14);i++){const u=(t*1.5+noise(i*3))%1;box(x+(noise(i+8)-.5)*4,y+.15+(1-u)*3,zz+(noise(i+5)-.5)*3,.045,.045,.045,0xd0c5a1);}
      if(z.active==='release_sweep')for(let i=0;i<12;i++)box(x-3+t*6,y+.025,zz+(i-6)*.2,.08,.025,.14,0xa46548);
    }
    const zone=marks.count-start-warning;
    // A small physical beacon and broken ground sweep guide the last approach.
    if(!f.exitCues&&f.exit&&Math.hypot(frame.player.x*xScale-f.exit.x*xScale,(-frame.player.y+f.exit.y)*scale)<24){
      const x=f.exit.x*xScale,zz=-f.exit.y*scale,y=woodlandHeight(x,zz),pulse=frame.reducedMotion?.6:.55+.45*Math.sin(frame.time*2.1)**2;
      box(x,y+3.95,zz,.16,.20,.16,f.finaleReady?0xd6c295:pulse>.7?0xdb8150:0x85523c);
      box(x,y+3.65,zz,.055,.40,.055,0x53615b);
      box(x,y+3.83,zz,.24,.05,.24,0x384b46);
      box(x,y+4.07,zz,.21,.045,.21,0x53615b);
      // Prepared exits settle into a steady, readable approach. Keep it even
      // in Reduced Motion and during filing; these marks have no collision.
      if(f.finaleReady)for(let i=1;i<=6;i++)box(x,y+.025,zz+i*.36,.09,.025,.20,0x9e9674);
      else if(enabled)for(let i=1;i<=8;i++)box(x+Math.sin(frame.time*.82)*i*.18,y+.025,zz+i*.36,.06,.025,.19,0x9c7050);
    }
    for(const mesh of [marks,papers]){mesh.visible=mesh.count>0;mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;}
    report={documents,tactical,aftermath:f.aftermath?.length||0,timers:f.maintenanceTimers?.length||0,warning,omen:enabled&&omen?.seconds>0?omen.type:null,zone,event:zoneKey,anchor:anchor?{x:anchor.x,z:anchor.z}:null,count:marks.count,limit,papers:papers.count,drawCalls:Number(marks.visible)+Number(papers.visible)};
  }
  return {update,stats:()=>report,dispose(){disposed=true;root.removeFromParent();for(const mesh of [marks,papers]){mesh.dispose();mesh.geometry.dispose();mesh.material.dispose();}paperTexture.dispose();grain.dispose();}};
}
