import * as THREE from './vendor/three/three.module.js';
import * as Art from './pixel-art.js';
import {SECTORS,inside} from './final-cut-course.js';
import {createPlantContacts,plantContactGLSL} from './final-cut-plant-contact.js';
import {foundationPlantLayout,FOUNDATION_BEDS} from './final-cut-foundation-layout.js';

const random=n=>{const x=Math.sin(n*127.1+19.7)*43758.5453;return x-Math.floor(x);};
const crops=[[0,100,420,475],[420,90,415,485],[835,100,419,475],[0,665,420,480],[420,665,415,480],[835,665,419,480]];
// Explicit world-rooted planting. Taller plants are outside the playable edge
// or against masonry; they never create unmodelled crouch cover in a cut strip.
export function createFinalCutVerges(scene,{materials}){
 const atlas=Art.texture('rough-cut-verge-atlas-v1'),image=atlas.image;
 const material=new THREE.MeshLambertMaterial({map:atlas,color:'#c4cfbe',vertexColors:true,alphaTest:.3,side:THREE.DoubleSide});
 const uniforms={time:{value:0},reduced:{value:0}};
 const vertex=s=>{
  Object.assign(s.uniforms,{vergeTime:uniforms.time,vergeReduced:uniforms.reduced});
  s.vertexShader=plantContactGLSL+'\nattribute vec3 plantRoot; uniform float vergeTime; uniform float vergeReduced;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   float height=max(0.0,position.y-plantRoot.y);
   float wind=sin(vergeTime*.8+plantRoot.x*.17+plantRoot.z*.13)*.035*(1.0-vergeReduced);
   float push=plantRecovery(vergeTime-plantHit.z);
   transformed.x+=height*height*wind;
   transformed.xz+=plantHit.xy*height*push*.65;
   transformed.y-=height*push*.28;
  `);
 };
 material.onBeforeCompile=vertex;material.customProgramCacheKey=()=> 'final-cut-verge-plants-v1';
 const depth=new THREE.MeshDepthMaterial({map:atlas,alphaTest:.3,side:THREE.DoubleSide,depthPacking:THREE.RGBADepthPacking});depth.onBeforeCompile=vertex;
 const plants=[],buckets=new Map(),meshes=[],resources=[material,depth];
 const bucket=(x,y)=>{const key=(x<0?'west':'east')+Math.floor((y+20)/30);if(!buckets.has(key))buckets.set(key,{p:[],uv:[],c:[],root:[],index:[]});return buckets.get(key);};
 function plant(x,y,h,type,seed,base=.025){
  // Keep flowers and ornamental fronds out of the actual cutting sectors.
  if(SECTORS.some(s=>inside({x,y},s,.3))&&Math.abs(x)<25)return;
  const data=bucket(x,y),first=data.p.length/3,crop=crops[type],tint=new THREE.Color().setHSL(.25+random(seed+17)*.04,.12,.72+random(seed+11)*.20);
  for(let face=0;face<2;face++){
   const a=random(seed)*Math.PI+face*1.82,cs=Math.cos(a),sn=Math.sin(a),w=h*(.66+random(seed+5)*.22),height=h*(face?.84:1),off=data.p.length/3;
   for(let row=0;row<=3;row++)for(let col=0;col<=2;col++){
    const t=row/3,xx=(col/2-.5)*w,bend=Math.sin(t*Math.PI*.7)*h*.12;
    data.p.push(x+xx*cs+bend*sn,base+t*height,-y-xx*sn+bend*cs);data.root.push(x,base,-y);
    data.uv.push((crop[0]+col/2*crop[2])/image.width,1-(crop[1]+(1-t)*crop[3])/image.height);
    const shade=.68+t*.32;data.c.push(tint.r*shade,tint.g*shade,tint.b*shade);
    if(row<3&&col<2){const q=off+row*3+col;data.index.push(q,q+1,q+3,q+1,q+4,q+3);}
   }
  }
  plants.push({x,y,h,type,data,first,count:data.p.length/3-first});
 }
 // Long groups separated by bare leaf litter avoid a clipped hedge rhythm.
 // Species and crown size follow each group rather than alternating per stem.
 for(const side of [-1,1])for(let i=0;i<26;i++){
  const seed=i+side*151;if(i%7===(side<0?2:5))continue;
  const y=5+i*3.4+random(seed+91)*1.5,spread=.85+random(seed+13)*.85,count=7+Math.floor(random(seed+37)*9),species=y>65?5:y>28&&y<48?1:2;
  for(let k=0;k<count;k++){
   const along=(random(seed*7+k)-.5)*2,depth=random(seed*9+k),x=side*(25.12+depth*.93),py=y+along*spread;
   const crown=(1-Math.abs(along)*.35)*(.3+depth*.54),h=crown*(.8+random(seed*31+k)*.4);
   plant(x,py,h,k===0&&i%3===0?4:species,seed*17+k);
  }
 }
 const foundationPlants=foundationPlantLayout();
 for(const p of foundationPlants)plant(p.x,p.y,p.h,p.type,p.seed,p.base);
 // Entry beds provide close reference-scale leaves without narrowing ramps.
 for(const side of [-1,1])for(let i=0;i<20;i++)plant(side*(9+random(i+31)*2),-6+random(i+72)*10,.25+random(i)*.55,i%4===0?4:2,i+901);
 for(const [key,d]of buckets){
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(d.p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(d.uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(d.c,3));g.setAttribute('plantRoot',new THREE.Float32BufferAttribute(d.root,3));g.setIndex(d.index);g.computeVertexNormals();g.computeBoundingSphere();g.boundingSphere.radius+=1;
  const hits=new Float32Array(d.p.length);for(let i=2;i<hits.length;i+=3)hits[i]=-1000;d.hitAttribute=new THREE.BufferAttribute(hits,3).setUsage(THREE.DynamicDrawUsage);g.setAttribute('plantHit',d.hitAttribute);
  const m=new THREE.Mesh(g,material);m.name='FinalCutVerge-'+key;m.receiveShadow=true;m.customDepthMaterial=depth;scene.add(m);meshes.push(m);
 }
 // Ground litter and gravel spill now share the actual slab materials.
 const contacts=createPlantContacts(plants,(index,value)=>{const p=plants[index],a=p.data.hitAttribute;for(let i=p.first;i<p.first+p.count;i++)a.setXYZ(i,value.x,value.z,value.time);if(a.updateRanges.length>=512){a.clearUpdateRanges();a.addUpdateRange(0,a.array.length);}else a.addUpdateRange(p.first*3,p.count*3);a.needsUpdate=true;});
 let lastRun=null;
 return {update(r,reduced){lastRun=r;contacts.update(r);uniforms.time.value=r.time;uniforms.reduced.value=reduced?1:0;},stats:()=>({plants:plants.length,foundationBeds:FOUNDATION_BEDS.length,foundationPlants:foundationPlants.length,species:[...new Set(plants.map(p=>p.type))],batches:meshes.length,triangles:meshes.reduce((n,m)=>n+m.geometry.index.count/3,0),groundPatches:0,maxHeight:Math.max(...plants.map(p=>p.h)),cameraFacing:false,contact:lastRun?contacts.stats(lastRun):null}),dispose(){for(const m of meshes){scene.remove(m);m.geometry.dispose();}resources.forEach(r=>r.dispose());}};
}
