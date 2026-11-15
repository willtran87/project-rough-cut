// Frozen pre-grid oracle for clearance checker parity tests.
import * as THREE from '../../web/vendor/three/three.module.js';
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
    record.triangles=[];
    for(let i=0;i<count;i+=3){
     const vertices=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(positions,indices?indices.getX(i+k):i+k).applyMatrix4(mesh.matrixWorld));
     record.triangles.push({vertices,box:new THREE.Box3().setFromPoints(vertices)});
    }
   }
   let hit=false;
   for(const candidate of record.triangles){
    if(candidate.box.distanceToPoint(center)>radius)continue;
    triangle.set(...candidate.vertices);
    triangle.closestPointToPoint(center,closest);
    const gap=closest.distanceTo(center);if(gap<radius){hits.push({point:p,kind:point.kind,x:point.x,y:point.y,height:point.height,gap,mesh:mesh.name||mesh.material?.name||mesh.type});hit=true;break;}
   }if(hit)break;
  }
 }return hits;
}

