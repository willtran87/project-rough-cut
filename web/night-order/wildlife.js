// Night Order wildlife: moths circling the lit lanterns, fireflies over the
// ponds, and a few roosting birds that break from a tree when the player runs
// past. Cosmetic only: it reads the camera and lamp brightness, never the
// round, and uses its own hash instead of the simulation's random numbers.
// Cost: two InstancedMesh draw calls (lights; birds only while flying).
const fract=v=>v-Math.floor(v),hash=(a,b=0)=>fract(Math.sin(a*12.9898+b*78.233)*43758.5453);
const MOTHS_PER_LAMP=3,LAMPS=8,FIREFLIES=28,BIRDS=5,FLUSH_COOLDOWN=40,FLUSH_SPEED=2.7,FLUSH_RANGE=5.5;

function dotTexture(THREE){
 const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d'),r=g.createRadialGradient(16,16,0,16,16,16);
 r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.35,'rgba(255,255,255,.55)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,32,32);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
function birdTexture(THREE){
 // A gull-wing silhouette; flapping is a vertical squash of the quad.
 const c=document.createElement('canvas');c.width=64;c.height=32;const g=c.getContext('2d');g.fillStyle='#fff';
 g.beginPath();g.moveTo(2,6);g.quadraticCurveTo(18,2,32,16);g.quadraticCurveTo(46,2,62,6);g.quadraticCurveTo(46,10,36,22);g.lineTo(32,28);g.lineTo(28,22);g.quadraticCurveTo(18,10,2,6);g.fill();
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}

export function createNightWildlife(THREE,parent,{lamps=[],trees=[],ponds=[]}={}){
 const total=LAMPS*MOTHS_PER_LAMP+FIREFLIES;
 const dots=dotTexture(THREE),wings=birdTexture(THREE);
 const lights=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:dots,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}),total);
 lights.name='NightWildlifeLights';lights.frustumCulled=false;lights.renderOrder=4;lights.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
 const birds=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,.5),new THREE.MeshBasicMaterial({map:wings,color:0x5a6b7e,transparent:true,alphaTest:.4,depthWrite:false,side:THREE.DoubleSide}),BIRDS);
 birds.name='NightWildlifeBirds';birds.frustumCulled=false;birds.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
 const m=new THREE.Matrix4(),p=new THREE.Vector3(),s=new THREE.Vector3(),color=new THREE.Color(),q=new THREE.Quaternion(),zero=new THREE.Vector3(0,0,0),tilt=new THREE.Quaternion(),axis=new THREE.Vector3(0,0,1);
 for(let i=0;i<total;i++){lights.setMatrixAt(i,m.compose(zero,q,s.set(.03,.03,.03)));lights.setColorAt(i,color.setRGB(1,1,1));}
 for(let i=0;i<BIRDS;i++)birds.setMatrixAt(i,m.compose(zero,q,s.set(.3,.3,.3)));
 lights.instanceColor.setUsage(THREE.DynamicDrawUsage);parent.add(lights,birds);
 // Fireflies keep fixed homes on the banks; several per pond, spread by hash.
 const homes=[];if(ponds.length)for(let i=0;i<FIREFLIES;i++){const pond=ponds[i%ponds.length],a=hash(i,3)*Math.PI*2,r=.75+hash(i,7)*.6;homes.push({x:pond.x+Math.cos(a)*pond.rx*r,z:pond.z+Math.sin(a)*pond.rz*r,y:.35+hash(i,11)*.9,phase:hash(i,13)*20,rate:.5+hash(i,17)*.6});}
 const nearest=[];let flush=null,lastFlush=-1e9,lastX=null,lastZ=0,lastTime=0,flushes=0,visibleMoths=0,visibleFlies=0,pending=[];
 function update(frame,camera,enabled=true){
  if(!enabled){lights.visible=birds.visible=false;flush=null;return;}
  lights.visible=true;if(frame.paused)return;
  const t=frame.time||0,calm=!!frame.reducedMotion,cx=camera.position.x,cz=camera.position.z;
  // Moths: the eight nearest lamps, three each. A dark lamp loses its moths.
  nearest.length=0;
  for(let i=0;i<lamps.length;i++){const a=lamps[i],d=(a.position.x-cx)**2+(a.position.z-cz)**2;if(d<900)nearest.push({a,d,i});}
  nearest.sort((u,v)=>u.d-v.d);visibleMoths=0;let n=0;
  for(let k=0;k<LAMPS;k++){
   const lamp=nearest[k];
   for(let j=0;j<MOTHS_PER_LAMP;j++,n++){
    if(!lamp||lamp.a.intensity<.3){lights.setMatrixAt(n,m.compose(zero,q,s.set(0,0,0)));continue;}
    const seed=lamp.i*7+j,speed=(calm?.5:2.6)+hash(seed,1)*(calm?.3:2.2),dir=hash(seed,2)>.5?1:-1,angle=t*speed*dir+hash(seed,3)*6.283;
    const radius=.16+.14*hash(seed,4)+(calm?0:.07*Math.sin(t*3.1+seed)),lift=(calm?0:.09*Math.sin(t*4.3+seed*1.7))+.05*(hash(seed,5)-.5);
    p.set(lamp.a.position.x+Math.cos(angle)*radius,lamp.a.position.y+lift,lamp.a.position.z+Math.sin(angle)*radius);
    // Wing beat: the speck flickers in width as it turns to and from the eye.
    const beat=calm?1:.55+.45*Math.abs(Math.sin(t*38+seed)),size=.028+.012*hash(seed,6);
    lights.setMatrixAt(n,m.compose(p,camera.quaternion,s.set(size*beat,size,size)));
    lights.setColorAt(n,color.setRGB(.95,.86,.66).multiplyScalar(.55*lamp.a.intensity));visibleMoths++;
   }
  }
  visibleFlies=0;
  for(let i=0;i<FIREFLIES;i++,n++){
   const h=homes[i];
   if(!h||(h.x-cx)**2+(h.z-cz)**2>1600){lights.setMatrixAt(n,m.compose(zero,q,s.set(0,0,0)));continue;}
   const drift=calm?0:1,glow=calm?.35:Math.pow(Math.max(0,Math.sin(t*h.rate+h.phase)),5);
   p.set(h.x+drift*.9*Math.sin(t*.23+h.phase),h.y+drift*.25*Math.sin(t*.41+h.phase*2),h.z+drift*.9*Math.cos(t*.19+h.phase*1.3));
   lights.setMatrixAt(n,m.compose(p,camera.quaternion,s.set(.07,.07,.07)));
   lights.setColorAt(n,color.setRGB(.72,1,.42).multiplyScalar(glow*.9));if(glow>.05)visibleFlies++;
  }
  lights.instanceMatrix.needsUpdate=true;lights.instanceColor.needsUpdate=true;
  // Birds: running close to a tree sends its roost up and away from you.
  const dt=t-lastTime,speed=lastX!==null&&dt>0&&dt<.2?Math.hypot(cx-lastX,cz-lastZ)/dt:0;lastX=cx;lastZ=cz;lastTime=t;
  if(t<lastFlush)lastFlush=-1e9;// round restarted
  if(!flush&&!calm&&speed>FLUSH_SPEED&&t-lastFlush>FLUSH_COOLDOWN){
   for(const tree of trees){const d=Math.hypot(tree.x-cx,tree.z-cz);if(d<FLUSH_RANGE&&d>1){
    const away=Math.atan2(tree.z-cz,tree.x-cx);flush={t,x:tree.x,y:Math.max(2.6,(tree.height||5)*.85),z:tree.z,away,seed:Math.floor(t*10)};lastFlush=t;flushes++;
    pending.push({kind:'bird_flush',x:tree.x,z:tree.z});break;}}
  }
  if(flush){
   const age=t-flush.t;
   if(age>3.2||age<0){flush=null;birds.visible=false;}
   else{
    birds.visible=true;
    for(let i=0;i<BIRDS;i++){
     const delay=i*.09,a=Math.max(0,age-delay),heading=flush.away+(hash(flush.seed,i)-.5)*1.5,climb=2.8+hash(flush.seed,i+9)*1.6,pace=5.5+hash(flush.seed,i+5)*2.5;
     p.set(flush.x+Math.cos(heading)*a*pace+(hash(i,31)-.5)*1.2,flush.y+a*climb+.25*Math.sin(a*9+i),flush.z+Math.sin(heading)*a*pace+(hash(i,37)-.5)*1.2);
     const flap=Math.sin(a*26+i*2),size=a<=0?0:.46*(1-Math.max(0,(age-2.4)/.8));
     tilt.setFromAxisAngle(axis,(hash(flush.seed,i+3)-.5)*.5);
     birds.setMatrixAt(i,m.compose(p,q.copy(camera.quaternion).multiply(tilt),s.set(size,size*(.35+.65*Math.abs(flap))*(flap<0?-1:1),size)));
    }
    q.identity();birds.instanceMatrix.needsUpdate=true;
   }
  }else birds.visible=false;
 }
 return {
  update,
  // Sounds are played by game.js through its own audio graph.
  takeEvents(){const e=pending;pending=[];return e;},
  stats(){return {drawCalls:Number(lights.visible)+Number(birds.visible),moths:visibleMoths,fireflies:visibleFlies,flushes,birdsFlying:!!flush,lamps:lamps.length,trees:trees.length,ponds:ponds.length};},
  dispose(){parent.remove(lights,birds);lights.geometry.dispose();lights.material.dispose();birds.geometry.dispose();birds.material.dispose();dots.dispose();wings.dispose();},
 };
}
