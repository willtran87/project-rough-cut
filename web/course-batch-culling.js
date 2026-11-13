import * as THREE from './vendor/three/three.module.js';
import {frustumBoxMask,intersectsFrustumMask} from './frustum-box.js';
import {compactVisibleIndices} from './visible-indices.js';

// Preserve geometry and triangle order; trim only entire authored pieces whose
// world bounds prove they cannot touch the current view, or optional opaque
// cover proves they are hidden. Static batches remain shared, with uploads
// limited to index spans that actually change. Occluders must remain static.
export function createCourseBatchCulling({occlusion=null}={}){
 const entries=[],frustum=new THREE.Frustum(),matrix=new THREE.Matrix4(),prior=new THREE.Matrix4();let valid=false,parts=0,visible=0,uploaded=0;
 function register(mesh,pieces,{maxDistance=Infinity,boundsPadding=.001}={}){let offset=0;const children=pieces.map(g=>{g.computeBoundingBox();const part={bounds:g.boundingBox.clone().expandByScalar(boundsPadding),offset,count:g.index.count,visible:true,drawOffset:offset};offset+=part.count;return part;});parts+=children.length;mesh.geometry.index.setUsage(THREE.DynamicDrawUsage);entries.push({mesh,maxDistance,parts:children,source:mesh.geometry.index.array.slice(),bounds:mesh.geometry.boundingBox.clone().expandByScalar(boundsPadding)});return children;}
 function update(camera){uploaded=0;camera.updateMatrixWorld();matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);if(valid&&matrix.equals(prior))return;prior.copy(matrix);valid=true;frustum.setFromProjectionMatrix(matrix);visible=uploaded=0;occlusion?.update(camera);
  for(const e of entries){const mask=frustumBoxMask(frustum,e.bounds);if(mask<0||e.bounds.distanceToPoint(camera.position)>e.maxDistance){e.mesh.visible=false;continue;}e.mesh.visible=true;
   for(const p of e.parts){p.visible=(e.maxDistance===Infinity||p.bounds.distanceToPoint(camera.position)<=e.maxDistance)&&(mask===0||intersectsFrustumMask(frustum,p.bounds,mask))&&!occlusion?.hidden(p.bounds);if(p.visible)visible++;}
   uploaded+=compactVisibleIndices(e.mesh.geometry,e.parts,e.source);
  }
 }
 // Geometry-based QA must inspect the full scene, including pieces behind the
 // current camera. Restore through the same compactor so packed offsets and
 // pending GPU updates stay coherent when ordinary rendering resumes.
 function restore(){
  visible=uploaded=0;
  for(const e of entries){e.mesh.visible=true;for(const p of e.parts){p.visible=true;visible++;}uploaded+=compactVisibleIndices(e.mesh.geometry,e.parts,e.source);}
  valid=false;
 }
 return {register,update,restore,stats:()=>({parts,visible,indexValuesUploaded:uploaded})};
}
