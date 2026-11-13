import * as THREE from './vendor/three/three.module.js';
import * as Art from './pixel-art.js';
import {SECTORS,isCut} from './final-cut-course.js';

// Each rooted clump owns the same cut sample as the original rough. Mowing
// swaps the standing plant for small physical stubble; the artwork never owns
// concealment, damage or the persistent cutting footprint.
export function createFinalCutRough(scene){
 const map=Art.texture('final-cut-rough-clumps-v1'),dummy=new THREE.Object3D(),patches=[];
 const geometry=new THREE.BufferGeometry(),p=[],uv=[],ix=[];
 for(let face=0;face<2;face++){
  const a=face*1.73,cs=Math.cos(a),sn=Math.sin(a),offset=p.length/3;
  for(let row=0;row<=4;row++)for(let col=0;col<=2;col++){
   const t=row/4,x=col/2-.5,bend=Math.sin(t*Math.PI*.7)*.12;
   p.push(x*cs-bend*sn,t,x*sn+bend*cs);uv.push(.004+col/2*.992,.042+t*.89);
   if(row<4&&col<2){const q=offset+row*3+col;ix.push(q,q+1,q+3,q+1,q+4,q+3);}
  }
 }
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(ix);geometry.computeVertexNormals();
 const time={value:0},reduced={value:0};
 const animate=shader=>{
  Object.assign(shader.uniforms,{roughTime:time,roughReduced:reduced});
  shader.vertexShader='attribute float roughVariant; uniform float roughTime; uniform float roughReduced;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\n#ifdef USE_MAP\nvMapUv.x=(vMapUv.x+roughVariant)/3.0;\n#endif');
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   vec4 root=modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.);
   float breeze=sin(roughTime*.8+root.x*.17+root.z*.13)*.035*(1.-roughReduced);
   transformed.x+=position.y*position.y*breeze;
  `);
 };
 const material=new THREE.MeshLambertMaterial({map,vertexColors:false,color:'#aab39c',alphaTest:.3,side:THREE.DoubleSide});material.onBeforeCompile=animate;material.customProgramCacheKey=()=> 'final-cut-authored-rough-v1';
 const depth=new THREE.MeshDepthMaterial({map,alphaTest:.3,depthPacking:THREE.RGBADepthPacking,side:THREE.DoubleSide});depth.onBeforeCompile=animate;depth.customProgramCacheKey=()=> 'final-cut-authored-rough-depth-v1';
 const stub=new THREE.BufferGeometry(),sp=[],si=[];
 for(let blade=0;blade<3;blade++){
  const a=blade*2.39,cs=Math.cos(a),sn=Math.sin(a),first=sp.length/3;
  for(let row=0;row<3;row++){const t=row/2,width=(1-t)*.008+.002,x=Math.cos(a*3)*.016+t*t*.009,z=Math.sin(a*3)*.016,h=(.035+blade*.008)*t;for(const side of [-1,1])sp.push(x+side*width*cs,h,z+side*width*sn);if(row<2){const q=first+row*2;si.push(q,q+1,q+2,q+1,q+3,q+2);}}
 }
 stub.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));stub.setIndex(si);stub.computeVertexNormals();const stubMaterial=new THREE.MeshLambertMaterial({color:'#77834d',side:THREE.DoubleSide});
 for(const sector of SECTORS){
  const count=18*12,g=geometry.clone(),variants=new Float32Array(count),root=new THREE.Group(),tufts=[];root.position.set(sector.x,0,-sector.y);scene.add(root);
  for(let i=0;i<count;i++)variants[i]=(i+Math.floor(i/18))%3;g.setAttribute('roughVariant',new THREE.InstancedBufferAttribute(variants,1));
  const standing=new THREE.InstancedMesh(g,material,count),stubble=new THREE.InstancedMesh(stub,stubMaterial,count);standing.castShadow=true;standing.receiveShadow=true;standing.customDepthMaterial=depth;stubble.receiveShadow=true;root.add(standing,stubble);
  for(let i=0;i<count;i++){
   const t={x:((i%18+.5)/18-.5)*sector.w+Math.sin(i*9)*.12,z:((Math.floor(i/18)+.5)/12-.5)*sector.d+Math.cos(i*7)*.1,height:1.55+.32*(.5+.5*Math.sin(i*17)),width:.8+.4*(.5+.5*Math.sin(i*3)),angle:i*2.4,cut:null};tufts.push(t);
   dummy.position.set(t.x,.02,t.z);dummy.rotation.set(0,t.angle,0);dummy.scale.set(t.width,t.height,t.width);dummy.updateMatrix();standing.setMatrixAt(i,dummy.matrix);dummy.scale.set(1,1,1);dummy.updateMatrix();stubble.setMatrixAt(i,dummy.matrix);
   const color=new THREE.Color().setHSL(.22+.02*Math.sin(i),.05,.65+.18*(.5+.5*Math.sin(i*5)));standing.setColorAt(i,color);
  }
  standing.computeBoundingSphere();standing.boundingSphere.radius+=.15;stubble.computeBoundingSphere();stubble.visible=false;patches.push({sector,root,standing,stubble,tufts});
 }
 geometry.dispose();let owner=null,lastRevision=-1,lastCut='',mown=0;
 return {
  update(r,isReduced){time.value=r.time;reduced.value=isReduced?1:0;const cut=r.cut.join(',');if(owner===r&&lastRevision===r.cutRevision&&lastCut===cut)return;
   mown=0;
   for(const patch of patches){let cutCount=0,changed=false;
    patch.tufts.forEach((t,i)=>{const isMown=isCut(r,{x:patch.sector.x+t.x,y:patch.sector.y-t.z});if(isMown){cutCount++;mown++;}if(t.cut===isMown)return;t.cut=isMown;changed=true;
     dummy.position.set(t.x,.02,t.z);dummy.rotation.set(0,t.angle,0);dummy.scale.set(isMown?0:t.width,isMown?0:t.height,isMown?0:t.width);dummy.updateMatrix();patch.standing.setMatrixAt(i,dummy.matrix);
     dummy.scale.setScalar(isMown?1:0);dummy.updateMatrix();patch.stubble.setMatrixAt(i,dummy.matrix);
    });
    patch.standing.visible=cutCount<patch.tufts.length;patch.stubble.visible=cutCount>0;if(changed){patch.standing.instanceMatrix.needsUpdate=true;patch.stubble.instanceMatrix.needsUpdate=true;}
   }
   owner=r;lastRevision=r.cutRevision;lastCut=cut;
  },
  stats:()=>({sectors:patches.length,mownTufts:mown,standingTufts:patches.length*216-mown,atlas:'final-cut-rough-clumps-v1',variants:3,stubbleHeight:[.035,.051],cameraFacing:false}),
  dispose(){for(const p of patches){scene.remove(p.root);p.standing.geometry.dispose();}stub.dispose();material.dispose();stubMaterial.dispose();depth.dispose();}
 };
}
