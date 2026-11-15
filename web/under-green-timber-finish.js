import * as THREE from './vendor/three/three.module.js';
import {KEEPER_TIMBER_SPAN,KEEPER_TIMBER_ASSET} from './under-green-keeper-timber.js';

// One decoded image and one GPU texture serve sawn timber throughout the drain.
// Furniture borrows this map; the scene owns its lifetime.
export function finishDrainTimber(materials,image){
 const map=new THREE.Texture(image);map.needsUpdate=true;map.colorSpace=THREE.SRGBColorSpace;
 map.magFilter=THREE.NearestFilter;map.minFilter=THREE.NearestMipmapLinearFilter;
 map.wrapS=map.wrapT=THREE.RepeatWrapping;
 materials.wood=new THREE.MeshPhongMaterial({map,color:0xb2a58d,specular:0x3c402e,shininess:7});
 Object.assign(materials.wood.userData,{drainTimberUV:true,drainUVMetres:KEEPER_TIMBER_SPAN});
 return {stats:()=>({asset:KEEPER_TIMBER_ASSET,pixels:[image.naturalWidth,image.naturalHeight],metres:KEEPER_TIMBER_SPAN,texelsPerMetre:image.naturalWidth/KEEPER_TIMBER_SPAN,shared:true}),dispose:()=>map.dispose()};
}

// Author grain before rotation/batching. Long beams use longitudinal V;
// cylindrical handles retain circumferential U instead of planar strip seams.
export function applyDrainTimberUV(geometry,scale,span=KEEPER_TIMBER_SPAN){
 const p=geometry.attributes.position,n=geometry.attributes.normal,uv=geometry.attributes.uv;
 if(!uv)return;
 const read=(a,i)=>a===0?p.getX(i):a===1?p.getY(i):p.getZ(i);
 if(geometry.type==='CylinderGeometry'){
  const {radiusTop,radiusBottom,height}=geometry.parameters;
  for(let i=0;i<p.count;i++){
   if(Math.abs(n.getY(i))>.9)uv.setXY(i,p.getX(i)*scale[0]/span,p.getZ(i)*scale[2]/span);
   else uv.setXY(i,uv.getX(i)*Math.PI*2*Math.max(radiusTop,radiusBottom)*Math.max(scale[0],scale[2])/span,uv.getY(i)*height*scale[1]/span);
  }
  return;
 }
 geometry.computeBoundingBox();const size=geometry.boundingBox.getSize(new THREE.Vector3()).toArray().map((v,a)=>v*Math.abs(scale[a]));
 const along=size.indexOf(Math.max(...size));
 for(let i=0;i<p.count;i++){
  const normal=[Math.abs(n.getX(i)),Math.abs(n.getY(i)),Math.abs(n.getZ(i))],face=normal.indexOf(Math.max(...normal));
  const axes=[0,1,2].filter(a=>a!==face),v=face===along?axes[1]:along,u=axes.find(a=>a!==v);
  uv.setXY(i,read(u,i)*scale[u]/span,read(v,i)*scale[v]/span);
 }
}
