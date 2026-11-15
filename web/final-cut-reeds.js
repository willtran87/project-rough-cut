import * as THREE from './vendor/three/three.module.js';
import * as Art from './pixel-art.js';
import {AMBUSH_REEDS,ambushTell} from './final-cut-ambush.js';
import {createPlantContacts,plantContactGLSL} from './final-cut-plant-contact.js';
import {createReedCulling} from './final-cut-reed-culling.js';

// Several narrow stems share each authored clump. Fixed, bent planes occupy a
// real stand volume; neither the vegetation nor its shadows face the camera.
export function createAmbushReeds(scene,{cull=true}={}){
 const positions=[],indices=[],colors=[],roots=[],uvs=[],heights=[],plants=[],sections=new Map();
 const random=n=>{const v=Math.sin(n*127.1+19.7)*43758.5453;return v-Math.floor(v);};
 const atlas=Art.texture('final-cut-reed-clumps-v1');atlas.anisotropy=4;
 let seed=0;
 for(const patch of AMBUSH_REEDS){
  const corridor=patch.id==='north'||patch.id==='south',spacing=corridor?.38:.48;
  const nx=Math.ceil(patch.w/spacing),ny=Math.ceil(patch.d/spacing);
  for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){
   const id=seed++,px=patch.x-patch.w/2+(x+.5)*patch.w/nx+(random(id)-.5)*.19,py=patch.y-patch.d/2+(y+.5)*patch.d/ny+(random(id+1)-.5)*.19;
   const cross=corridor||patch.id.startsWith('north-road')?Math.abs(py-patch.y)/(patch.d/2):Math.abs(px-patch.x)/(patch.w/2);
   const edge=Math.max(0,Math.min(1,(cross-.70)/.28)),clump=.5+.5*Math.sin(px*1.13+Math.sin(py*.7)*1.4+py*.73);
   const height=patch.h*(1.03+.05*Math.sin(px*.7+py*.43)+.15*random(id+2))*(1-edge*.62)+clump*.4*(1-edge);
   const color=new THREE.Color().setHSL(.23+random(id+3)*.025,.08,.62+clump*.12+random(id+4)*.1),cell=id%3;
   const first=positions.length/3,indexStart=indices.length;
   for(let face=0;face<3;face++){
    const a=random(id+5)*Math.PI+face*1.71,dx=Math.cos(a),dz=Math.sin(a),offset=positions.length/3,width=height*(.40+random(id+7)*.06);
    for(let k=0;k<=5;k++){const t=k/5,bend=Math.sin(t*Math.PI*.7)*(.12+.18*random(id+8));
     for(let col=0;col<=2;col++){const across=(col/2-.5)*width;positions.push(px+dx*across-dz*bend,height*t,-py+dz*across+dx*bend);roots.push(px,-py);heights.push(height);
      // Interior-cell padding avoids sampling a neighbouring sprite at mips.
      uvs.push((cell+(2+col/2*508)/512)/3,.018+t*.978);
      const shade=.61+t*.39;colors.push(color.r*shade,color.g*shade,color.b*shade);
      if(k<5&&col<2){const q=offset+k*3+col;indices.push(q,q+1,q+3,q+1,q+4,q+3);}
     }
    }
   }
   // Keep whole clumps together. Eight-metre sections let both the camera and
   // each moving shadow frustum reject distant stands independently.
   const sectionKey=patch.id+':'+Math.floor((patch.w>patch.d?px:py)/8);
   plants.push({x:px,y:py,first,count:positions.length/3-first,indexStart,indexCount:indices.length-indexStart,sectionKey});
   if(!sections.has(sectionKey))sections.set(sectionKey,[]);
   sections.get(sectionKey).push(...indices.slice(indexStart));
  }
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setAttribute('reedRoot',new THREE.Float32BufferAttribute(roots,2));geometry.setAttribute('plantHeight',new THREE.Float32BufferAttribute(heights,1));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setIndex(indices);geometry.computeVertexNormals();geometry.computeBoundingSphere();geometry.boundingSphere.radius+=3;
 const hits=new Float32Array(positions.length);for(let i=2;i<hits.length;i+=3)hits[i]=-1000;
 const hitAttribute=new THREE.BufferAttribute(hits,3).setUsage(THREE.DynamicDrawUsage);geometry.setAttribute('plantHit',hitAttribute);
 const contacts=createPlantContacts(plants,(index,value)=>{const p=plants[index];for(let i=p.first;i<p.first+p.count;i++)hitAttribute.setXYZ(i,value.x,value.z,value.time);if(hitAttribute.updateRanges.length>=512){hitAttribute.clearUpdateRanges();hitAttribute.addUpdateRange(0,hits.length);}else hitAttribute.addUpdateRange(p.first*3,p.count*3);hitAttribute.needsUpdate=true;});
 const uniforms={reedTime:{value:0},reedCue:{value:new THREE.Vector3(0,0,0)},reedReduced:{value:0}};
 const animate=shader=>{
  Object.assign(shader.uniforms,uniforms);
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\n'+plantContactGLSL+'\nattribute vec2 reedRoot; attribute float plantHeight; uniform float reedTime; uniform vec3 reedCue; uniform float reedReduced;');
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   float tip=pow(clamp(position.y/plantHeight,0.0,1.0),2.0);
   float nearCue=max(0.0,1.0-distance(reedRoot,reedCue.xy)/6.5)*reedCue.z;
   float flutter=mix(sin(reedTime*19.0+reedRoot.x*2.7+reedRoot.y)*.72+sin(reedTime*7.0)*.3,.28,reedReduced);
   transformed.x+=tip*(sin(reedRoot.y*.13+reedRoot.x*.17+reedTime*.8)*.065*(1.0-reedReduced)+nearCue*flutter);
   transformed.z+=tip*nearCue*cos(reedTime*13.0+reedRoot.y)*.55*(1.0-reedReduced);
   float contact=plantRecovery(reedTime-plantHit.z);
   transformed.xz+=plantHit.xy*tip*contact*min(2.0,plantHeight*.55);
   transformed.y-=tip*contact*plantHeight*.12;
  `);
 };
 const material=new THREE.MeshLambertMaterial({map:atlas,vertexColors:true,alphaTest:.30,side:THREE.DoubleSide});material.onBeforeCompile=animate;material.customProgramCacheKey=()=> 'final-cut-authored-reeds-v1';
 const depth=new THREE.MeshDepthMaterial({map:atlas,alphaTest:.30,depthPacking:THREE.RGBADepthPacking,side:THREE.DoubleSide});depth.onBeforeCompile=animate;depth.customProgramCacheKey=()=> 'final-cut-authored-reed-depth-v1';
 const mesh=new THREE.Mesh(geometry,material);mesh.receiveShadow=true;mesh.castShadow=true;mesh.customDepthMaterial=depth;mesh.name='AmbushReedScreens';scene.add(mesh);
 const culling=cull?createReedCulling(mesh,sections,plants):null;
 let lastTell=null,lastRun=null;
 return {update(r,reduced){lastRun=r;contacts.update(r);const tell=ambushTell(r);lastTell=tell;uniforms.reedTime.value=r.time;uniforms.reedReduced.value=reduced?1:0;uniforms.reedCue.value.set(tell?.x||0,-(tell?.y||0),tell?.strength||0);},stats:()=>({patches:AMBUSH_REEDS.length,layeredMargins:true,authoredClumps:seed,atlas:'final-cut-reed-clumps-v1',cameraFacing:false,vertices:positions.length/3,culling:culling?.stats()||{enabled:false},tell:lastTell,contact:lastRun?contacts.stats(lastRun):null}),dispose(){scene.remove(mesh);geometry.dispose();material.dispose();depth.dispose();}};
}
