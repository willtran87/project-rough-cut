import * as THREE from './vendor/three/three.module.js';
import {terrainHeight} from './course-terrain.js';

// Traces the player leaves behind: pressed tyre lines through rough, sand and
// wet turf, dark skids on the path under hard braking or a hard turn, and
// boot prints in sand and wet ground once on foot. One instanced draw with a
// fixed ring of segments; the oldest are overwritten. Presentation only: it
// reads the run and the terrain and writes nothing back.
const STEP=.85,AXLE=.84,REAR=.84;
const TONE={rough:[.012,.03,.016,.5],sand:[.2,.165,.1,.62],wet:[.01,.022,.024,.6],path:[.012,.013,.014,.55]};
// Pure rule, exported for checks: does this moment leave a line?
export function tyreMarkStrength(surface,speed,steer,decel){
 const v=Math.abs(speed);if(v<1.2)return 0;
 if(surface==='path'){const skid=Math.max(decel>5.5&&v>3?Math.min(1,(decel-5.5)/5):0,Math.abs(steer)>.85&&v>8.5?Math.min(1,(v-8.5)/3):0);return skid;}
 return surface==='sand'?1:surface==='wet'?.85:Math.min(1,.45+v/14);
}
export function createBackNineTyreMarks(scene,{capacity=256}={}){
 const geometry=new THREE.PlaneGeometry(1,1);geometry.rotateX(-Math.PI/2);
 const material=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:1,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3,fog:false,toneMapped:false,
  blending:THREE.CustomBlending,blendEquation:THREE.AddEquation,blendSrc:THREE.ZeroFactor,blendDst:THREE.SrcColorFactor});
 // Multiply blend: each instance colour is the fraction of ground light that
 // survives, so a mark can only darken what is already drawn and fog cannot
 // turn a distant mark into a pale strip.
 const mesh=new THREE.InstancedMesh(geometry,material,capacity),dummy=new THREE.Object3D(),tint=new THREE.Color();dummy.rotation.order='YXZ';
 mesh.name='BackNineTyreMarks';mesh.frustumCulled=false;mesh.renderOrder=1;mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.userData.rigidInstanceBounds=true;
 for(let i=0;i<capacity;i++){dummy.position.set(0,-30,0);dummy.scale.set(0,0,0);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);mesh.setColorAt(i,tint.setRGB(1,1,1));}
 mesh.count=1;scene.add(mesh);
 let owner=null,cursor=0,used=0,laid=0,enabled=true,lastSpeed=0,lastTime=0,stepSide=1,footTravel=0;
 const wheels=[{x:0,y:0,on:false},{x:0,y:0,on:false}],foot={x:0,y:0,on:false};
 function put(ax,ay,bx,by,width,tone,strength){
  const length=Math.hypot(bx-ax,by-ay);if(length<.05)return;
  const ha=terrainHeight(ax,ay),hb=terrainHeight(bx,by),i=cursor;cursor=(cursor+1)%capacity;used=Math.min(capacity,used+1);laid++;
  dummy.position.set((ax+bx)/2,(ha+hb)/2+.03,-(ay+by)/2);dummy.rotation.set(-Math.atan2(hb-ha,length),Math.atan2(bx-ax,ay-by),0);dummy.scale.set(width,1,length*1.04);dummy.updateMatrix();
  mesh.setMatrixAt(i,dummy.matrix);const keep=1-tone[3]*strength;mesh.setColorAt(i,tint.setRGB(keep+tone[0]*(1-keep),keep+tone[1]*(1-keep),keep+tone[2]*(1-keep)));
  mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor.needsUpdate=true;mesh.count=Math.max(1,used);
 }
 function clear(){cursor=used=0;mesh.count=1;dummy.position.set(0,-30,0);dummy.scale.set(0,0,0);dummy.updateMatrix();mesh.setMatrixAt(0,dummy.matrix);mesh.instanceMatrix.needsUpdate=true;for(const w of wheels)w.on=false;foot.on=false;footTravel=0;}
 function update(run){
  if(owner!==run){owner=run;clear();lastSpeed=run.cart?.speed||0;lastTime=run.time||0;}
  mesh.visible=enabled&&used>0;if(!enabled)return;
  const dt=(run.time||0)-lastTime;lastTime=run.time||0;if(!(dt>0)||run.mode!=='driving')return;
  if(run.foot){
   for(const w of wheels)w.on=false;
   const f=run.foot,surface=f.surface,airborne=f.ejection&&run.time-f.ejection.at<1.18;
   if(airborne||run.death||!(surface==='sand'||surface==='wet')){foot.on=false;return;}
   if(!foot.on){foot.on=true;foot.x=f.x;foot.y=f.y;return;}
   const moved=Math.hypot(f.x-foot.x,f.y-foot.y);if(moved<.72)return;if(moved>3){foot.x=f.x;foot.y=f.y;return;}
   const yaw=Math.atan2(f.x-foot.x,f.y-foot.y),sx=Math.cos(yaw)*.13*stepSide,sy=-Math.sin(yaw)*.13*stepSide,fx=Math.sin(yaw)*.14,fy=Math.cos(yaw)*.14;stepSide=-stepSide;
   put(f.x+sx-fx,f.y+sy-fy,f.x+sx+fx,f.y+sy+fy,.11,TONE[surface],.9);foot.x=f.x;foot.y=f.y;return;
  }
  foot.on=false;
  const c=run.cart,decel=Math.abs(lastSpeed)>Math.abs(c.speed)?(Math.abs(lastSpeed)-Math.abs(c.speed))/dt:0;lastSpeed=c.speed;
  const strength=(c.health??100)>0?tyreMarkStrength(c.surface,c.speed,c.steer||0,decel):0,sy=Math.sin(c.yaw),cy=Math.cos(c.yaw);
  for(let i=0;i<2;i++){
   const side=i?1:-1,w=wheels[i],x=c.x+cy*side*AXLE-sy*REAR,y=c.y-sy*side*AXLE-cy*REAR;
   if(strength<=0){w.on=false;continue;}
   if(!w.on){w.on=true;w.x=x;w.y=y;continue;}
   const moved=Math.hypot(x-w.x,y-w.y);if(moved>4){w.x=x;w.y=y;continue;}
   if(moved<STEP)continue;
   put(w.x,w.y,x,y,.17,TONE[c.surface]||TONE.rough,strength);w.x=x;w.y=y;
  }
 }
 return {update,clear,setEnabled(value){enabled=!!value;mesh.visible=enabled&&used>0;},
  warm(){mesh.visible=true;mesh.count=1;},
  stats:()=>({active:used,capacity,laid,draws:1,enabled}),
  dispose(){scene.remove(mesh);geometry.dispose();material.dispose();mesh.dispose();}};
}
