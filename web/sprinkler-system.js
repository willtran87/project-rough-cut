import * as THREE from './vendor/three/three.module.js';

// Layout derives from the real wet zones. Small heads have no collision and
// never move a gameplay zone or modify Joe's navigation/perception.
export function sprinklerLayout(data,scale,xScale){
 return (data.soakZones||[]).map((zone,index)=>{
  const cx=zone.x*xScale,cz=-zone.y*scale,radius=zone.radius*scale;
  for(let step=0;step<16;step++){
   const angle=index*2.4+step*Math.PI/8,x=cx+Math.cos(angle)*radius*.6,z=cz+Math.sin(angle)*radius*.6;
   if(Math.abs(x)>data.bounds.maxX*xScale-.35||z>0||z<-data.bounds.maxY*scale)continue;
   if(data.obstacles.some(o=>{if(!o.blocks&&!o.id?.includes('pond'))return false;const dx=Math.abs(x-o.x*xScale),dz=Math.abs(z+o.y*scale),rx=(o.radiusX||o.radius)*scale+.25,rz=(o.radiusY||o.radius)*scale+.25;return o.shape==='box'?dx<rx&&dz<rz:(dx/rx)**2+(dz/rz)**2<1;}))continue;
   return {id:zone.id,x,z,angle:Math.atan2(cx-x,cz-z),reach:radius*1.05};
  }
  return null;
 }).filter(Boolean);
}

export function createSprinklerSpray(parent,heads,{software=false}={}){
 const capacity=software?64:144,geometry=new THREE.BoxGeometry(1,1,1),material=new THREE.MeshBasicMaterial({color:0xffffff});
 const mesh=new THREE.InstancedMesh(geometry,material,capacity);mesh.name='IrrigationSpray';mesh.count=0;mesh.visible=false;mesh.frustumCulled=false;mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);parent.add(mesh);
 const dummy=new THREE.Object3D(),direction=new THREE.Vector3(),up=new THREE.Vector3(0,1,0),color=new THREE.Color();
 const frustum=new THREE.Frustum(),projection=new THREE.Matrix4(),sphere=new THREE.Sphere(new THREE.Vector3(),5);
 // Allocate instance colors before shader preparation, including dry starts.
 for(let i=0;i<capacity;i++)mesh.setColorAt(i,color.setHex(0x718e87));
 let signature='',updates=0,activeHeads=[],active=false;
 function put(x,y,z,w,h,d,hex,dx=0,dy=1,dz=0){
  if(mesh.count>=capacity)return;
  dummy.position.set(x,y,z);dummy.scale.set(w,h,d);direction.set(dx,dy,dz).normalize();dummy.quaternion.setFromUnitVectors(up,direction);dummy.updateMatrix();
  mesh.setMatrixAt(mesh.count,dummy.matrix);mesh.setColorAt(mesh.count++,color.setHex(hex));
 }
 function update(frame,camera){
  active=frame.soakSeconds>0;const density=frame.fx?.density??1;
  const enabled=active&&density>0,clock=frame.reducedMotion?0:Math.floor(frame.time*(software?12:20))/(software?12:20);
  const key=enabled?[clock,frame.reducedMotion,density,camera.position.x,camera.position.y,camera.position.z,...camera.quaternion.toArray(),camera.fov,camera.aspect].join(':'):'dry';
  if(key===signature)return;signature=key;updates++;mesh.count=0;activeHeads=[];
  if(enabled){
   projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);frustum.setFromProjectionMatrix(projection);
   const nearby=heads.filter(h=>{sphere.center.set(h.x,.8,h.z);return Math.hypot(h.x-camera.position.x,h.z-camera.position.z)<24&&frustum.intersectsSphere(sphere);})
    .sort((a,b)=>Math.hypot(a.x-camera.position.x,a.z-camera.position.z)-Math.hypot(b.x-camera.position.x,b.z-camera.position.z)).slice(0,software?2:3);
   const steps=software||density<.75?8:12;
   for(const [index,head]of nearby.entries()){
    activeHeads.push(head.id);
    const sweep=Math.sin(clock*.85+head.x)*.10;
    for(let lane=0;lane<3;lane++){
     const angle=head.angle+sweep+(lane-1)*.15,dx=Math.sin(angle),dz=Math.cos(angle),reach=head.reach*(.79+lane*.07),height=.72+lane*.15;
     for(let i=0;i<steps;i++){
      const u=((i+.37*lane)/steps+clock*.74+index*.23)%1;
      put(head.x+dx*reach*u,.035+.31*(1-u)+4*height*u*(1-u),head.z+dz*reach*u,.016-u*.005,.055+u*.055,.016-u*.005,i%3?0x698a83:0xa5bdb0,dx*reach,4*height*(1-2*u)-.31,dz*reach);
     }
    }
    const landingAngle=head.angle+sweep,reach=head.reach*.86;
    const landingX=head.x+Math.sin(landingAngle)*reach,landingZ=head.z+Math.cos(landingAngle)*reach;
    const ripple=(clock*.8+index*.31)%1;
    for(let i=0;i<4;i++){
     const a=i*Math.PI/2+.3,r=.07+ripple*.32;
     put(landingX+Math.cos(a)*r,.025,landingZ+Math.sin(a)*r,.07+ripple*.05,.008,.018,ripple<.55?0x6e9389:0x3d5d55);
    }
    // A few low drifting beads give the impact a damp veil without transparent
    // particles. They share the existing pool (144 / 64), material and draw.
    const beads=software?4:8;
    for(let i=0;i<beads;i++){
     const t=(clock*.55+i/beads)%1,a=i*2.4+head.x,r=.06+t*.36;
     put(landingX+Math.cos(a)*r+t*.14,.045+Math.sin(t*Math.PI)*.24,landingZ+Math.sin(a)*r,.012,.025+(1-t)*.018,.012,i%3?0x486961:0x7b9c90);
    }
   }
  }
  mesh.visible=mesh.count>0;if(mesh.visible){mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor.needsUpdate=true;}
 }
 return {update,stats:()=>({active,heads:heads.map(h=>({...h})),activeHeads,instances:mesh.count,capacity,drawCalls:mesh.visible?1:0,updates,depthTest:material.depthTest,transparent:material.transparent})};
}
