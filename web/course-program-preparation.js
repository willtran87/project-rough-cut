import * as THREE from './vendor/three/three.module.js';
import {waitForPreparationTurn} from './render-preparation.js';

// Precompile original objects against the original scene's lights/fog. Bound
// newly submitted programs, not the number of differently coloured materials
// sharing a shader. Buffer/texture preparation remains in its existing queues.
export async function prepareCoursePrograms(renderer,scene,camera,cancelled=()=>false){
 const representatives=[],seen=new Set();let objects=0;
 scene.traverse(o=>{
  if(!(o.isMesh||o.isPoints||o.isLine||o.isSprite)||!o.material)return;objects++;
  const g=o.geometry,materials=Array.isArray(o.material)?o.material:[o.material];
  // Keep every actual material and object/attribute variant. Uniform colours
  // are not guessed equivalent across materials or custom compile callbacks.
  const key=[materials.map(m=>m.uuid).join(','),o.type,!!o.isSkinnedMesh,!!o.isInstancedMesh,!!o.instanceColor,!!o.morphTexture,!!o.isBatchedMesh,!!o._colorsTexture,
   Object.entries(g?.attributes||{}).map(([n,a])=>[n,a.itemSize,a.normalized,a.array?.constructor.name||a.data?.array?.constructor.name].join(':')).sort().join(','),
   Object.entries(g?.morphAttributes||{}).map(([n,a])=>n+':'+a.length).sort().join(','),g?.morphTargetsRelative].join('|');
  if(seen.has(key))return;seen.add(key);representatives.push(o);
 });
 const report={objects,representatives:representatives.length,batches:0,maxPrograms:0,maxCompileMs:0};
 for(let i=0;i<representatives.length;){
  if(!await waitForPreparationTurn(cancelled))return {...report,cancelled:true};
  const start=performance.now(),before=renderer.info.programs.length,pending=[];
  do{
   const object=representatives[i++],selection=new THREE.Group();
   // Selection-only traversal avoids reparenting live meshes, cloning skeletons
   // or allocating a second instance buffer. compileAsync's targetScene owns
   // lighting; this selection contains no additional lights.
   selection.traverse=visit=>visit(object);selection.traverseVisible=()=>{};
   pending.push(renderer.compileAsync(selection,camera,scene));
  }while(i<representatives.length&&pending.length<16&&renderer.info.programs.length-before<3&&performance.now()-start<5&&!cancelled());
  report.batches++;report.maxPrograms=Math.max(report.maxPrograms,renderer.info.programs.length-before);report.maxCompileMs=Math.max(report.maxCompileMs,performance.now()-start);
  await Promise.all(pending);
  if(cancelled())return {...report,cancelled:true};
  await new Promise(resolve=>setTimeout(resolve,4));
 }
 return report;
}
