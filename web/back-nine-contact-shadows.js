import * as THREE from './vendor/three/three.module.js';
import {terrainHeight} from './course-terrain.js';

const CAPACITY=4096,STRIDE=7,MAX_CONTACTS=13,HEIGHT=.064;
const clamp=v=>Math.max(0,Math.min(1,v));
export function contactOpacity(height,strength){
 const t=clamp((height-.025)/.32);return strength*(1-t*t*(3-2*t));
}

// One small ground-only draw, with no texture or extra light/shadow map.
// World-grid triangles match the course's piecewise planar height field;
// radial alpha trims the unused area instead of floating a flat decal on hills.
export function createBackNineContactShadows(scene,{runner,cart,mower}){
 const positions=new Float32Array(CAPACITY*3),uvs=new Float32Array(CAPACITY*2),colors=new Float32Array(CAPACITY*4);
 const geometry=new THREE.BufferGeometry();
 for(const [name,array,size]of [['position',positions,3],['uv',uvs,2],['color',colors,4]])geometry.setAttribute(name,new THREE.BufferAttribute(array,size).setUsage(THREE.DynamicDrawUsage));
 geometry.setDrawRange(0,0);
 const material=new THREE.MeshBasicMaterial({color:0xffffff,vertexColors:true,transparent:true,depthWrite:false,fog:true});
 material.onBeforeCompile=s=>{
  s.vertexShader='varying vec2 vContactUv;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvContactUv=uv;');
  s.fragmentShader='varying vec2 vContactUv;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`
   float contactRadius=dot(vContactUv,vContactUv);
   if(contactRadius>=1.0)discard;
   float contactEdge=1.0-smoothstep(.04,1.0,contactRadius);
   diffuseColor.a*=floor(contactEdge*contactEdge*32.0+.5)/32.0;
  `);
 };
 material.customProgramCacheKey=()=> 'back-nine-ground-contact-v1';
 const mesh=new THREE.Mesh(geometry,material);mesh.name='BackNineContactShadows';mesh.frustumCulled=false;mesh.renderOrder=2;scene.add(mesh);
 const values=new Float64Array(MAX_CONTACTS*STRIDE),previous=new Float64Array(values.length).fill(NaN),point=new THREE.Vector3();
 const names=new Array(MAX_CONTACTS);let count=0,previousCount=-1,vertices=0,uploads=0,wasVisible=true;
 function add(name,x,z,rx,rz,yaw,opacity,height=0){
  if(opacity<.006)return;if(count>=MAX_CONTACTS)throw Error('Contact shadow capacity exceeded');
  const i=count*STRIDE;values[i]=x;values[i+1]=z;values[i+2]=rx;values[i+3]=rz;values[i+4]=yaw;values[i+5]=opacity;values[i+6]=height;names[count++]=name;
 }
 function vehicle(name,v,radius,rx,rz,actor){
  if(!v.root.visible||Math.hypot(v.root.position.x-actor.x,v.root.position.z+actor.y)>65)return;
  const yaw=-v.root.rotation.y;
  add(name+'-chassis',v.root.position.x,v.root.position.z,rx,rz,yaw,.22);
  for(let i=0;i<v.wheels.length;i++){
   v.wheels[i].getWorldPosition(point);const h=Math.max(0,point.y-radius-terrainHeight(point.x,-point.z));
   add(name+'-tire-'+i,point.x,point.z,.22,radius*.8,yaw,contactOpacity(h,.52),h);
  }
 }
 function rebuild(){
  vertices=0;
  function vertex(x,z,cx,cz,rx,rz,cos,sin,opacity){
   if(vertices>=CAPACITY)throw Error('Contact geometry capacity exceeded');
   const p=vertices*3,u=vertices*2,c=vertices*4,dx=x-cx,dz=z-cz;
   positions[p]=x;positions[p+1]=terrainHeight(x,-z)+HEIGHT;positions[p+2]=z;
   uvs[u]=(cos*dx+sin*dz)/rx;uvs[u+1]=(-sin*dx+cos*dz)/rz;colors[c+3]=opacity;vertices++;
  }
  for(let n=0;n<count;n++){
   const i=n*STRIDE,cx=values[i],cz=values[i+1],rx=values[i+2],rz=values[i+3],cos=Math.cos(values[i+4]),sin=Math.sin(values[i+4]),opacity=values[i+5];
   const ex=Math.abs(cos)*rx+Math.abs(sin)*rz,ez=Math.abs(sin)*rx+Math.abs(cos)*rz;
   for(let x=Math.floor(cx-ex);x<Math.ceil(cx+ex);x++)for(let z=Math.floor(cz-ez);z<Math.ceil(cz+ez);z++){
    // The terrain diagonal in world X/Z runs from lower-left to upper-right.
    vertex(x,z,cx,cz,rx,rz,cos,sin,opacity);vertex(x,z+1,cx,cz,rx,rz,cos,sin,opacity);vertex(x+1,z+1,cx,cz,rx,rz,cos,sin,opacity);
    vertex(x,z,cx,cz,rx,rz,cos,sin,opacity);vertex(x+1,z+1,cx,cz,rx,rz,cos,sin,opacity);vertex(x+1,z,cx,cz,rx,rz,cos,sin,opacity);
   }
  }
  geometry.setDrawRange(0,vertices);
  for(const a of Object.values(geometry.attributes)){a.clearUpdateRanges();a.addUpdateRange(0,vertices*a.itemSize);a.needsUpdate=true;}
  uploads++;
 }
 return {mesh,update(run){
  count=0;const actor=run.foot||run.cart;
  vehicle('cart',cart,.36,.76,1.17,actor);vehicle('mower',mower,.57,1.1,1.65,actor);
  if(run.foot&&runner.root.visible){
   const yaw=-runner.root.rotation.y;
   runner.contactAnchors.body.getWorldPosition(point);const lift=Math.max(0,point.y-terrainHeight(point.x,-point.z)-1.08);
   add('runner-body',point.x,point.z,.43+lift*.14,.31+lift*.14,yaw,.16/(1+lift*2),lift);
   for(let i=0;i<2;i++){
    const boot=runner.contactAnchors.feet[i];boot.updateWorldMatrix(true,false);point.set(0,-.0675,-.04).applyMatrix4(boot.matrixWorld);
    const h=Math.max(0,point.y-terrainHeight(point.x,-point.z));
    add('runner-boot-'+i,point.x,point.z,.15+h*.12,.24+h*.12,yaw,contactOpacity(h,.56),h);
   }
  }
  let changed=count!==previousCount;for(let i=0;i<count*STRIDE&&!changed;i++)if(Math.abs(values[i]-previous[i])>1e-7)changed=true;
  mesh.visible=count>0;if(changed){rebuild();previous.set(values);previousCount=count;}wasVisible=mesh.visible;
 },stats:()=>({contacts:count,vertices,triangles:vertices/3,uploads,visible:wasVisible,height:HEIGHT,capacity:CAPACITY,patches:Array.from({length:count},(_,n)=>({name:names[n],x:values[n*STRIDE],z:values[n*STRIDE+1],opacity:values[n*STRIDE+5],lift:values[n*STRIDE+6]}))}),dispose(){mesh.removeFromParent();geometry.dispose();material.dispose();}};
}
