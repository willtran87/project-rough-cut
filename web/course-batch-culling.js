import * as THREE from './vendor/three/three.module.js';
import {frustumBoxMask,intersectsFrustumMask} from './frustum-box.js';
import {compactVisibleIndices} from './visible-indices.js';
import {createRasterVisibility} from './raster-visibility.js';

// Preserve geometry and triangle order; trim only authored pieces/index runs
// whose world bounds prove they cannot touch the current view, or opaque
// cover proves they are hidden. Static batches remain shared, with uploads
// limited to index spans that actually change. Occluders must remain static.
// Optional sample coverage is restricted by the caller to static ground/contact
// meshes in the single-sample software renderer; it never simplifies geometry.
// Optional `retainOffscreen`: a piece that only left the view frustum stays in
// the packed index list (it rasterises nothing off-screen, so the picture is
// identical; shadow casters are excluded, since their culled pieces also
// leave the shadow map) until stale pieces exceed a quarter of the drawn indices. A piece
// hidden by distance or by occlusion is always removed. Turning or driving
// past scenery then stops rewriting every index after the first change.
export function createCourseBatchCulling({occlusion=null,sampleCoverage=true,retainOffscreen=false}={}){
 const entries=[],frustum=new THREE.Frustum(),matrix=new THREE.Matrix4(),prior=new THREE.Matrix4();let valid=false,parts=0,visible=0,uploaded=0,priorWidth=0,priorHeight=0;
 function register(mesh,pieces,{maxDistance=Infinity,boundsPadding=.001,maxTrianglesPerPart=Infinity,rasterCull=false}={}){
  let offset=0;const children=[],groups=[],point=new THREE.Vector3(),limit=Number.isFinite(maxTrianglesPerPart)?Math.max(1,Math.floor(maxTrianglesPerPart))*3:Infinity;
  for(const g of pieces){
   g.computeBoundingBox();const group={bounds:g.boundingBox.clone().expandByScalar(boundsPadding),parts:[]};groups.push(group);
   for(let start=0;start<g.index.count;start+=Math.min(limit,g.index.count-start)){
    const count=Math.min(limit,g.index.count-start),bounds=g.boundingBox.clone();
    // Contiguous index runs retain authored triangle order and every original
    // vertex/normal/UV. Only runs wholly outside the camera can be omitted.
    // This avoids transforming entire terrain tiles for a sliver at the edge.
    if(count<g.index.count){bounds.makeEmpty();for(let i=start;i<start+count;i++)bounds.expandByPoint(point.fromBufferAttribute(g.attributes.position,g.index.getX(i)));}
    const part={bounds:bounds.expandByScalar(boundsPadding),offset:offset+start,count,visible:true,drawOffset:offset+start};children.push(part);group.parts.push(part);
   }
   offset+=g.index.count;
  }
  const source=mesh.geometry.index.array.slice(),raster=rasterCull&&sampleCoverage?createRasterVisibility(mesh.geometry,source,mesh.material.side,children.length):null;
  parts+=children.length;mesh.geometry.index.setUsage(THREE.DynamicDrawUsage);entries.push({mesh,maxDistance,parts:children,groups,source,raster,bounds:mesh.geometry.boundingBox.clone().expandByScalar(boundsPadding)});return children;
 }
 function update(camera,width=0,height=0){uploaded=0;camera.updateMatrixWorld();matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);if(valid&&matrix.equals(prior)&&width===priorWidth&&height===priorHeight)return;prior.copy(matrix);priorWidth=width;priorHeight=height;valid=true;frustum.setFromProjectionMatrix(matrix);visible=uploaded=0;occlusion?.update(camera);
  for(const e of entries){const mask=frustumBoxMask(frustum,e.bounds);if(mask<0||e.bounds.distanceToPoint(camera.position)>e.maxDistance){e.mesh.visible=false;continue;}e.mesh.visible=true;
   for(const group of e.groups){
    // Prove the authored piece first, so a terrain tile behind the camera
    // doesn't require a plane test for every small index run. Distance limits
    // remain attached to the original piece, preserving its existing reach.
    const groupMask=mask===0?0:group.parts.length===1?(intersectsFrustumMask(frustum,group.bounds,mask)?0:-1):frustumBoxMask(frustum,group.bounds),inRange=e.maxDistance===Infinity||group.bounds.distanceToPoint(camera.position)<=e.maxDistance;
    for(const p of group.parts){const inView=groupMask>=0&&(groupMask===0||group.parts.length===1||intersectsFrustumMask(frustum,p.bounds,groupMask));p.visible=inRange&&inView&&!occlusion?.hidden(p.bounds);p.offscreen=inRange&&!inView;if(p.visible)visible++;}
   }
   uploaded+=e.raster&&width>0&&height>0?e.raster.update(matrix,width,height,e.parts):retainOffscreen&&!e.mesh.castShadow?compactResident(e):compactVisibleIndices(e.mesh.geometry,e.parts,e.source);
  }
 }
 // Residency for retainOffscreen: drawn = visible, plus pieces still packed that
 // merely left the frustum. compactVisibleIndices reads `visible`, so present
 // the residency through it and restore the true visibility afterwards.
 function compactResident(e){
  let drawn=0,stale=0;for(const p of e.parts){if(p.visible)drawn+=p.count;else if(p.offscreen&&p.drawOffset>=0)stale+=p.count;}
  const keep=stale<=drawn*.25;
  for(const p of e.parts){p.shown=p.visible;if(keep&&!p.visible&&p.offscreen&&p.drawOffset>=0)p.visible=true;}
  const n=compactVisibleIndices(e.mesh.geometry,e.parts,e.source);
  for(const p of e.parts)p.visible=p.shown;return n;
 }
 // Geometry-based QA must inspect the full scene, including pieces behind the
 // current camera. Restore through the same compactor so packed offsets and
 // pending GPU updates stay coherent when ordinary rendering resumes.
 function restore(){
  visible=uploaded=0;
  for(const e of entries){e.mesh.visible=true;for(const p of e.parts){p.visible=true;visible++;}uploaded+=compactVisibleIndices(e.mesh.geometry,e.parts,e.source);}
  valid=false;
 }
 return {register,update,restore,stats:()=>({parts,visible,indexValuesUploaded:uploaded,sampleCoverage})};
}
