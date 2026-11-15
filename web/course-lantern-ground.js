import * as THREE from './vendor/three/three.module.js';

// The course floor is planar and aligned with the light grid. Duplicate only
// cell-edge vertices so each triangle carries a constant conservative lamp set.
// Positions, normals and UVs describe exactly the original plane.
export function prepareLanternGround(mesh,{cellSize,maxPerCell,candidates}){
  const g=mesh.geometry,{width,height}=g.parameters||{};
  if(!g.isBufferGeometry||g.type!=='PlaneGeometry'||!width||!height)return false;
  mesh.updateWorldMatrix(true,false);
  const corner=new THREE.Vector3(-width/2,height/2,0).applyMatrix4(mesh.matrixWorld);
  const alongX=new THREE.Vector3(width/2,height/2,0).applyMatrix4(mesh.matrixWorld).sub(corner);
  const alongZ=new THREE.Vector3(-width/2,-height/2,0).applyMatrix4(mesh.matrixWorld).sub(corner);
  const nearZero=v=>Math.abs(v)<1e-7,aligned=v=>Math.abs(v/cellSize-Math.round(v/cellSize))<1e-7;
  if(!nearZero(alongX.y)||!nearZero(alongX.z)||!nearZero(alongZ.x)||!nearZero(alongZ.y)||alongX.x<=0||alongZ.z<=0||![corner.x,corner.z,alongX.x,alongZ.z].every(aligned))return false;
  const cols=Math.round(alongX.x/cellSize),rows=Math.round(alongZ.z/cellSize),count=cols*rows*4,layers=Math.ceil(maxPerCell/4);
  const positions=new Float32Array(count*3),normals=new Float32Array(count*3),uvs=new Float32Array(count*2),ids=Array.from({length:layers},()=>new Float32Array(count*4));
  const indices=count>65535?new Uint32Array(cols*rows*6):new Uint16Array(cols*rows*6);
  for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
    const cell=row*cols+col,base=cell*4,list=candidates(corner.x+(col+.5)*cellSize,corner.z+(row+.5)*cellSize);
    for(let j=0;j<4;j++){
      const u=(col+(j%2))/cols,v=1-(row+Math.floor(j/2))/rows,index=base+j;
      positions.set([(u-.5)*width,(v-.5)*height,0],index*3);normals[index*3+2]=1;uvs.set([u,v],index*2);
      list.forEach((id,i)=>ids[Math.floor(i/4)][index*4+i%4]=id+1);
    }
    indices.set([base,base+2,base+1,base+2,base+3,base+1],cell*6);
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.BufferAttribute(normals,3));geometry.setAttribute('uv',new THREE.BufferAttribute(uvs,2));
  ids.forEach((data,i)=>geometry.setAttribute('courseLampIndices'+i,new THREE.BufferAttribute(data,4)));
  geometry.setIndex(new THREE.BufferAttribute(indices,1));geometry.computeBoundingBox();geometry.computeBoundingSphere();mesh.geometry=geometry;g.dispose();
  return {cells:cols*rows,vertices:count,triangles:cols*rows*2,layers};
}
