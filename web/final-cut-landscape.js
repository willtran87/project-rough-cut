import * as THREE from './vendor/three/three.module.js';
import * as Art from './pixel-art.js';

// Fixed physical branches and small bent needle sprays. Three depth groups
// per side permit ordinary frustum culling without adding playable cover.
export function createFinalCutLandscape(scene){
 const atlas=Art.texture('rough-cut-needle-sprays-v1'),image=atlas.image;
 const crops=[[24,170,600,380],[650,180,600,340],[24,790,600,330],[650,740,600,390]];
 // Boundary woodland has fixed moon/sky lighting. Bake that diffuse light
 // into vertices instead of evaluating the rig's two spotlights on every
 // discarded needle pixel. The playable course retains dynamic lighting.
 const bark=new THREE.MeshBasicMaterial({color:'#8b8470',vertexColors:true});
 const needles=new THREE.MeshBasicMaterial({map:atlas,color:'#acb9a0',vertexColors:true,alphaTest:.34,side:THREE.DoubleSide});
 const sky=new THREE.Color('#b9d6dc').multiplyScalar(1.1/Math.PI),ground=new THREE.Color('#455738').multiplyScalar(1.1/Math.PI),moon=new THREE.Color('#a4c8d4').multiplyScalar(1.7/Math.PI),moonDirection=new THREE.Vector3(-28,28,-72).normalize(),lighting=new THREE.Color();
 const random=n=>{const f=Math.sin(n*127.1+311.7)*43758.5453;return f-Math.floor(f);};
 const resources=[bark,needles],batches=[],trees=[];
 // Ends are hidden by the ground, adjoining trunk or needle clusters.
 const cylinder=new THREE.CylinderGeometry(.12,1,1,5,1,true),spray=new THREE.PlaneGeometry(1,1,2,1);
 const sp=spray.attributes.position;for(let i=0;i<sp.count;i++)sp.setZ(i,.13*Math.cos(sp.getX(i)*Math.PI));spray.computeVertexNormals();
 const point=new THREE.Vector3(),normal=new THREE.Vector3(),up=new THREE.Vector3(0,1,0),normalMatrix=new THREE.Matrix3(),matrix=new THREE.Matrix4(),quaternion=new THREE.Quaternion(),scale=new THREE.Vector3(),center=new THREE.Vector3();
 const bucket=()=>({positions:[],normals:[],uvs:[],colors:[],indices:[]});
 function append(target,geometry,transform,color,crop){
  const pos=geometry.attributes.position,n=geometry.attributes.normal,uv=geometry.attributes.uv,offset=target.positions.length/3;
  normalMatrix.getNormalMatrix(transform);
  for(let i=0;i<pos.count;i++){
   point.fromBufferAttribute(pos,i).applyMatrix4(transform);normal.fromBufferAttribute(n,i).applyNormalMatrix(normalMatrix);
   target.positions.push(point.x,point.y,point.z);target.normals.push(normal.x,normal.y,normal.z);
   // Needle art is visible from both sides: average the two diffuse faces.
   const hemi=crop?.5:normal.y*.5+.5,direct=crop?Math.abs(normal.dot(moonDirection))*.5:Math.max(0,normal.dot(moonDirection));
   lighting.copy(ground).lerp(sky,hemi);lighting.r+=moon.r*direct;lighting.g+=moon.g*direct;lighting.b+=moon.b*direct;
   target.colors.push(color.r*lighting.r,color.g*lighting.g,color.b*lighting.b);
   target.uvs.push(crop?(crop[0]+uv.getX(i)*crop[2])/image.width:uv.getX(i),crop?1-(crop[1]+(1-uv.getY(i))*crop[3])/image.height:uv.getY(i));
  }
  for(const index of geometry.index.array)target.indices.push(offset+index);
 }
 function limb(target,a,b,radius,color){
  center.copy(a).add(b).multiplyScalar(.5);point.copy(b).sub(a);const length=point.length();quaternion.setFromUnitVectors(up,point.normalize());scale.set(radius,length,radius);matrix.compose(center,quaternion,scale);append(target,cylinder,matrix,color);
 }
 function flush(data,material,name){
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(data.positions,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(data.normals,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(data.uvs,2));g.setAttribute('color',new THREE.Float32BufferAttribute(data.colors,3));g.setIndex(data.indices);g.computeBoundingBox();g.computeBoundingSphere();
  const mesh=new THREE.Mesh(g,material);mesh.name=name;scene.add(mesh);batches.push(mesh);return g;
 }
 for(const side of [-1,1])for(let section=0;section<3;section++){
  const wood=bucket(),leaves=bucket();
  for(let i=0;i<42;i++){
   if((i%2?1:-1)!==side||Math.floor((i*11%125)/42)!==section)continue;
   const x=side*(65+(i%7)*2),z=-(i*11%125),height=6+(i%5)*1.4,seed=i*31+7;
   const radius=2.1+random(seed)*1.1,bend=(random(seed+1)-.5)*.7;
   const at=t=>new THREE.Vector3(x+bend*t*t,height*t,z+Math.sin(seed)*t*t*.4);
   const brown=new THREE.Color().setHSL(.10,.12,.45+random(seed+2)*.1);
   // Two tapering trunk sections, grounded root flares, irregular radial boughs.
   limb(wood,at(0),at(.58),.19+height*.007,brown);limb(wood,at(.54),at(1),.12,brown);
   for(let k=0;k<4;k++){const a=k*Math.PI/2+seed;limb(wood,new THREE.Vector3(x+Math.cos(a)*.6,.035,z+Math.sin(a)*.6),at(.055),.09,brown);}
   const count=22+(i%3)*2;
   for(let k=0;k<count;k++){
    const t=.20+k/count*.76,a=k*2.39996+seed,reach=radius*(1.25*(1-t)+.08)*(.8+random(seed+k+5)*.4);
    const base=at(t),tip=base.clone().add(new THREE.Vector3(Math.cos(a)*reach,.15+random(seed+k)*.2,Math.sin(a)*reach));
    limb(wood,base,tip,.045*(1-t)+.018,brown);
    const c=base.clone().lerp(tip,.67),colour=new THREE.Color().setHSL(.26+random(seed+k+3)*.06,.12,.65+random(seed+k+9)*.2);
    for(let face=0;face<2;face++){
     quaternion.setFromEuler(new THREE.Euler(-.2+random(seed+k+12)*.4,a+face*Math.PI/2,Math.sin(k)*.18));
     scale.set(reach*1.85,reach*(face?.9:1.15),1);matrix.compose(c,quaternion,scale);append(leaves,spray,matrix,colour,crops[(k+i)%4]);
    }
   }
   trees.push({x,y:-z,height,radius,branches:count});
  }
  flush(wood,bark,`FinalCutTreeWood-${side}-${section}`);flush(leaves,needles,`FinalCutTreeNeedles-${side}-${section}`);
 }
 cylinder.dispose();spray.dispose();
 return {stats:()=>({trees:trees.length,branches:trees.reduce((n,t)=>n+t.branches,0),batches:batches.length,triangles:batches.reduce((n,m)=>n+m.geometry.index.count/3,0),minTrunkX:Math.min(...trees.map(t=>Math.abs(t.x))),nearestGeometryX:Math.min(...batches.map(m=>Math.min(Math.abs(m.geometry.boundingBox.min.x),Math.abs(m.geometry.boundingBox.max.x)))),materials:2,lighting:'baked moon and sky'}),dispose(){for(const m of batches){scene.remove(m);m.geometry.dispose();}resources.forEach(m=>m.dispose());}};
}
