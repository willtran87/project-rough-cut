import * as THREE from './vendor/three/three.module.js';
import {mergeGeometries} from './vendor/three/addons/utils/BufferGeometryUtils.js';

export function rangePennantLayout(data,{scale=.16,xScale=.1152}={}){
 const source=data.obstacles.find(o=>o.id==='range-light-east');if(!source)return null;
 return {sourceId:source.id,x:source.x*xScale+.43,z:-source.y*scale-.25,height:4.15,yaw:-.4,
  supportOffset:[.43,-.25],supportRadius:Math.SQRT2*.09,sourceRadius:Math.min(source.radiusX||source.radius,source.radiusY||source.radius)*scale};
}

// One range marker beside the existing lamp. The support remains inside that
// fixture's blocked footprint; the cloth is above the walking clearance.
export function createCourseRangePennant(parent,data,{scale=.16,xScale=.1152,wind}={}){
 const layout=rangePennantLayout(data,{scale,xScale});if(!layout)return null;
 const root=new THREE.Group();root.name='CourseRangePennant';root.position.set(layout.x,0,layout.z);parent.add(root);
 const geometries=[],materials=[],textures=[];
 const ownGeometry=g=>(geometries.push(g),g),ownMaterial=m=>(materials.push(m),m);
 const metal=ownMaterial(new THREE.MeshLambertMaterial({color:0x8a9585})),dark=ownMaterial(new THREE.MeshLambertMaterial({color:0x48564e})),brass=ownMaterial(new THREE.MeshLambertMaterial({color:0xaa9668}));
 const box=ownGeometry(new THREE.BoxGeometry(1,1,1));
 function block(parent,x,y,z,w,h,d,material=metal){const m=new THREE.Mesh(box,material);m.position.set(x,y,z);m.scale.set(w,h,d);m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
 function round(parent,x,y,z,r,h,material=metal){const m=new THREE.Mesh(ownGeometry(new THREE.CylinderGeometry(r,r,h,10)),material);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
 round(root,0,2.23,0,.027,4.26);round(root,0,4.38,0,.044,.065,brass);
 block(root,0,.14,0,.16,.28,.16,dark);block(root,0,.29,0,.18,.025,.18);
 for(const y of [.55,2.12]){
  const a=new THREE.Vector3(-.43,y,.25),b=new THREE.Vector3(0,y,0),delta=b.clone().sub(a);
  const brace=new THREE.Mesh(ownGeometry(new THREE.CylinderGeometry(.017,.017,delta.length(),8)),dark);brace.position.copy(a.add(b).multiplyScalar(.5));brace.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());root.add(brace);
  round(root,0,y,0,.038,.065,brass);
 }
 const clothRoot=new THREE.Group();clothRoot.position.y=layout.height;clothRoot.rotation.y=layout.yaw;root.add(clothRoot);
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;const g=canvas.getContext('2d');
 g.fillStyle='#bfb58c';g.fillRect(0,0,256,128);
 // Broad woven bands and connected wear, with sparse stitch marks at hems.
 for(const [y,h,c]of [[0,10,'#647967'],[118,10,'#647967'],[10,3,'#ded3a9'],[115,3,'#ded3a9'],[16,3,'#a99f7b'],[106,3,'#a99f7b']]){g.fillStyle=c;g.fillRect(0,y,256,h);}
 g.fillStyle='#e0d4aa';g.fillRect(0,0,14,128);g.fillStyle='#8f896c';g.fillRect(13,0,2,128);
 for(let i=0;i<28;i++){const x=19+i*8,y=25+(i*19)%72;g.fillStyle=i%3?'#b5aa82':'#c9bf98';g.fillRect(x,y,7+i%4*3,2);g.fillRect(x+3,y+2,4,1);}
 for(let x=20;x<249;x+=9){g.fillStyle='#d4c69c';g.fillRect(x,5,4,1);g.fillRect(x,122,4,1);}
 // A bold range-target emblem remains legible at approach distance.
 for(let y=-31;y<=31;y++){const half=31-Math.abs(y);g.fillStyle='#425e50';g.fillRect(91-half,64+y,half*2+1,1);}
 for(let y=-22;y<=22;y++){const half=22-Math.abs(y);g.fillStyle='#d7c99e';g.fillRect(91-half,64+y,half*2+1,1);}
 g.fillStyle='#607862';g.fillRect(87,45,5,35);g.fillRect(91,45,17,12);g.fillStyle='#f0e2b8';g.fillRect(80,80,21,4);
 // Small tears concentrate at the free edge, never a full-surface noise mask.
 for(const [x,y,w,h]of [[249,18,7,6],[244,73,12,5],[251,103,5,9],[230,43,7,2]])g.clearRect(x,y,w,h);
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.magFilter=THREE.NearestFilter;map.minFilter=THREE.NearestMipmapLinearFilter;textures.push(map);
 const geometry=ownGeometry(new THREE.PlaneGeometry(1.5,.66,12,4));geometry.translate(.75,-.33,0);
 const p=geometry.attributes.position;for(let i=0;i<p.count;i++)if(p.getX(i)>1.49){const v=geometry.attributes.uv.getY(i);p.setX(i,1.5-.14*Math.sin(v*Math.PI)-.04*(i%3));}
 geometry.computeVertexNormals();geometry.computeBoundingSphere();geometry.boundingSphere.radius+=.30;
 const material=ownMaterial(new THREE.MeshLambertMaterial({map,side:THREE.DoubleSide,alphaTest:.35}));
 const compile=s=>wind?.flagShader(s,{x:layout.x,z:layout.z});material.onBeforeCompile=compile;material.customProgramCacheKey=()=> 'course-range-pennant-v1';
 const flag=new THREE.Mesh(geometry,material);flag.name='CourseRangePennantCloth';flag.position.x=.035;flag.castShadow=flag.receiveShadow=true;clothRoot.add(flag);
 const depth=ownMaterial(new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map,alphaTest:.35,side:THREE.DoubleSide}));depth.onBeforeCompile=compile;depth.customProgramCacheKey=()=> 'course-range-pennant-depth-v1';flag.customDepthMaterial=depth;
 for(const y of [-.075,-.56]){const ring=new THREE.Mesh(ownGeometry(new THREE.TorusGeometry(.022,.006,5,10)),brass);ring.position.set(.057,y,.012);clothRoot.add(ring);block(clothRoot,.018,y,0,.05,.012,.018,dark);}
 // Static parts keep their material colours but share one draw. The cloth and
 // its depth material stay independent so only the fabric deforms in wind.
 root.updateWorldMatrix(true,true);const inverse=new THREE.Matrix4().copy(root.matrixWorld).invert(),chunks=[],fixed=[];
 root.traverse(o=>{if(!o.isMesh||o===flag)return;const g=o.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse,o.matrixWorld)),colors=new Float32Array(g.attributes.position.count*3),c=o.material.color;for(let i=0;i<colors.length;i+=3){colors[i]=c.r;colors[i+1]=c.g;colors[i+2]=c.b;}g.setAttribute('color',new THREE.BufferAttribute(colors,3));chunks.push(g);fixed.push(o);});
 const assemblyGeometry=ownGeometry(mergeGeometries(chunks));chunks.forEach(g=>g.dispose());fixed.forEach(o=>o.removeFromParent());
 const assembly=new THREE.Mesh(assemblyGeometry,ownMaterial(new THREE.MeshLambertMaterial({vertexColors:true})));assembly.name='CourseRangePennantHardware';assembly.castShadow=assembly.receiveShadow=true;root.add(assembly);
 return {root,flag,stats:()=>({...layout,texture:[256,128],meshes:2,hardwareParts:fixed.length,clothTriangles:geometry.index.count/3,minClothHeight:layout.height-.66-.27}),dispose(){root.removeFromParent();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}};
}
