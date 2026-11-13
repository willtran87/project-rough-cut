import * as THREE from './vendor/three/three.module.js';
// QA only: clip actual rendered triangles to the volume between the eye and
// its near plane. Unlike short axial rays this covers wide-FOV corners, thin
// fixtures, rotated machinery and the currently posed skinned actor.
export function createCameraClearanceAudit(meshes){
 const records=[];
 for(const mesh of meshes){
  if(!mesh.isMesh||!mesh.geometry?.attributes.position)continue;
  let visible=true;for(let parent=mesh;parent;parent=parent.parent)if(!parent.visible)visible=false;
  if(!visible)continue;
  mesh.updateWorldMatrix(true,false);
  if(mesh.isSkinnedMesh)mesh.computeBoundingBox();else mesh.geometry.computeBoundingBox();
  records.push({mesh,box:(mesh.isSkinnedMesh?mesh.boundingBox:mesh.geometry.boundingBox).clone().applyMatrix4(mesh.matrixWorld)});
 }
 return camera=>{
  camera.updateMatrixWorld(true);
  const probe=camera.clone();camera.getWorldPosition(probe.position);camera.getWorldQuaternion(probe.quaternion);probe.near=.00001;probe.far=camera.near;probe.updateProjectionMatrix();probe.updateMatrixWorld(true);
  const volume=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(probe.projectionMatrix,probe.matrixWorldInverse));
  const hits=[],eye=probe.position,radius=camera.near*Math.sqrt(1+Math.tan(camera.getEffectiveFOV()*Math.PI/360)**2*(1+camera.aspect**2));
  for(const record of records){
   const {mesh,box}=record;
   if(!volume.intersectsBox(box))continue;
   // An audit is a frozen rendered pose. Reuse transformed triangles across
   // camera samples instead of reskinning an entire actor for every direction.
   if(!record.triangles){
    const geometry=mesh.geometry,indices=geometry.index,count=indices?indices.count:geometry.attributes.position.count;
    record.triangles=[];
    for(let i=0;i<count;i+=3){
     const vertices=[0,1,2].map(k=>mesh.getVertexPosition(indices?indices.getX(i+k):i+k,new THREE.Vector3()).applyMatrix4(mesh.matrixWorld));
     record.triangles.push({vertices,box:new THREE.Box3().setFromPoints(vertices),index:i/3});
    }
   }
   for(const triangle of record.triangles){
    if(triangle.box.distanceToPoint(eye)>radius)continue;
    let polygon=triangle.vertices;
    for(const plane of volume.planes){
     const clipped=[];
     for(let k=0;k<polygon.length;k++){
      const a=polygon[k],b=polygon[(k+1)%polygon.length],da=plane.distanceToPoint(a),db=plane.distanceToPoint(b);
      if(da>=0)clipped.push(a);
      if((da>=0)!==(db>=0))clipped.push(a.clone().lerp(b,da/(da-db)));
     }
     polygon=clipped;if(!polygon.length)break;
    }
    if(polygon.length>=3){hits.push({mesh:mesh.name||mesh.type,triangle:triangle.index});break;}
   }
  }
  return hits;
 };
}
// Test-only narrow phase against rendered triangles, including transformed props.
export function inspectGeometrySpheres(meshes,points){
 const records=meshes.filter(m=>m.visible&&m.geometry?.attributes.position).map(mesh=>{mesh.updateWorldMatrix(true,false);mesh.geometry.computeBoundingBox();return {mesh,box:mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld)};}),hits=[];
 const center=new THREE.Vector3(),closest=new THREE.Vector3(),triangle=new THREE.Triangle();
 for(let p=0;p<points.length;p++){
  const point=points[p],radius=point.radius??.025;center.set(point.x,point.height,-point.y);
  for(const record of records){
   const {mesh,box}=record;
   if(box.distanceToPoint(center)>radius)continue;
   if(!record.triangles){
    const geometry=mesh.geometry,positions=geometry.attributes.position,indices=geometry.index,count=indices?indices.count:positions.count;
    record.triangles=[];record.cells=new Map();record.large=[];
    const size=box.getSize(new THREE.Vector3());record.cellSize=Math.max(.5,(size.x+size.y+size.z)/64);
    for(let i=0;i<count;i+=3){
     const vertices=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(positions,indices?indices.getX(i+k):i+k).applyMatrix4(mesh.matrixWorld));
     const triangle={vertices,box:new THREE.Box3().setFromPoints(vertices)},id=record.triangles.length;record.triangles.push(triangle);
     const lo=triangle.box.min.clone().divideScalar(record.cellSize).floor(),hi=triangle.box.max.clone().divideScalar(record.cellSize).floor();
     // Bound unusual, very large triangles without dropping them from queries.
     const occupied=(hi.x-lo.x+1)*(hi.y-lo.y+1)*(hi.z-lo.z+1);
     if(!Number.isFinite(occupied)||occupied>4096){record.large.push(id);continue;}
     for(let x=lo.x;x<=hi.x;x++)for(let y=lo.y;y<=hi.y;y++)for(let z=lo.z;z<=hi.z;z++){
      const key=`${x},${y},${z}`;if(!record.cells.has(key))record.cells.set(key,[]);record.cells.get(key).push(id);
     }
    }
   }
   let hit=false;
   // Conservative triangle-AABB bins only reduce candidates. Keep the exact
   // closest-point test and original triangle order, including boundary ties.
   const ids=new Set(record.large),cell=record.cellSize;
   const lo=center.clone().addScalar(-radius).divideScalar(cell).floor(),hi=center.clone().addScalar(radius).divideScalar(cell).floor();
   const queried=(hi.x-lo.x+1)*(hi.y-lo.y+1)*(hi.z-lo.z+1);
   if(!Number.isFinite(queried)||queried>4096)record.triangles.forEach((_,id)=>ids.add(id));
   else for(let x=lo.x;x<=hi.x;x++)for(let y=lo.y;y<=hi.y;y++)for(let z=lo.z;z<=hi.z;z++)for(const id of record.cells.get(`${x},${y},${z}`)||[])ids.add(id);
   for(const id of [...ids].sort((a,b)=>a-b)){
    const candidate=record.triangles[id];
    if(candidate.box.distanceToPoint(center)>radius)continue;
    triangle.set(...candidate.vertices);
    triangle.closestPointToPoint(center,closest);
    const gap=closest.distanceTo(center);if(gap<radius){hits.push({point:p,kind:point.kind,x:point.x,y:point.y,height:point.height,gap,mesh:mesh.name||mesh.material?.name||mesh.type});hit=true;break;}
   }if(hit)break;
  }
 }return hits;
}

// QA only: thin moving mechanisms can pass between point samples. Check
// their occupied boxes against actual fixture triangles as a second proof.
export function inspectGeometryBoxes(meshes,boxes){
 const hits=[],vertices=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()],triangle=new THREE.Triangle(...vertices);
 for(const mesh of meshes){
  if(!mesh.visible||!mesh.geometry?.attributes.position)continue;
  mesh.updateWorldMatrix(true,false);const geometry=mesh.geometry;geometry.computeBoundingBox();
  const bounds=geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld),candidates=boxes.filter(b=>b.box.intersectsBox(bounds));
  if(!candidates.length)continue;
  const indices=geometry.index,count=indices?indices.count:geometry.attributes.position.count;
  const found=new Set();
  for(let i=0;i<count;i+=3){
   for(let k=0;k<3;k++)mesh.getVertexPosition(indices?indices.getX(i+k):i+k,vertices[k]).applyMatrix4(mesh.matrixWorld);
   for(const candidate of candidates)if(!found.has(candidate.id)&&candidate.box.intersectsTriangle(triangle)){
    found.add(candidate.id);hits.push({part:candidate.id,mesh:mesh.name||mesh.material?.name||mesh.type,triangle:i/3});
   }
   if(found.size===candidates.length)break;
  }
 }
 return hits;
}
