import * as THREE from './vendor/three/three.module.js';
import {mergeIndexedGeometries} from './indexed-geometry.js';
import * as Art from './pixel-art.js';

// These are distant estate buildings behind the playable boundary woodland.
// Their geometry, hill foundations and lamps remain fixed in the far scene.
export const DISTANT_ESTATE_SITES=Object.freeze([
 Object.freeze({id:'keepers-cottage',x:75,z:-250,y:23,yaw:2.65,kind:'cottage'}),
 Object.freeze({id:'old-water-tower',x:-175,z:-180,y:12,yaw:-2.6,kind:'tower'}),
 Object.freeze({id:'estate-service-barn',x:224,z:110,y:18,yaw:.86,kind:'barn'})
]);

export function buildDistantEstateGeometry(){
 const batches={stone:[],wood:[],roof:[],lamp:[]},sites=[],lamps=[];let pieces=0;
 const light=new THREE.Vector3(-.4,.8,.3).normalize(),normal=new THREE.Vector3();
 for(const site of DISTANT_ESTATE_SITES){
  const root=new THREE.Object3D();root.position.set(site.x,site.y,site.z);root.rotation.y=site.yaw;root.updateMatrix();let count=0;
  const put=(kind,g,x,y,z,color,rx=0,ry=0,rz=0)=>{
   const o=new THREE.Object3D();o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.updateMatrix();g.applyMatrix4(o.matrix);g.applyMatrix4(root.matrix);
   const p=g.attributes.position,n=g.attributes.normal,c=new THREE.Color(color),colors=new Float32Array(p.count*3);
   for(let i=0;i<p.count;i++){normal.fromBufferAttribute(n,i);const shade=kind==='lamp'?1:.7+.3*Math.max(0,normal.dot(light));colors.set([c.r*shade,c.g*shade,c.b*shade],i*3);}
   g.setAttribute('color',new THREE.BufferAttribute(colors,3));batches[kind].push(g);pieces++;count++;
  };
  const box=(kind,x,y,z,w,h,d,color,rz=0)=>put(kind,new THREE.BoxGeometry(w,h,d),x,y,z,color,0,0,rz);
  const beam=(x1,y1,z1,x2,y2,z2,width,color=0x50616a)=>{
   const a=new THREE.Vector3(x1,y1,z1),b=new THREE.Vector3(x2,y2,z2),delta=b.clone().sub(a),g=new THREE.BoxGeometry(width,delta.length(),width);
   g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize()));const mid=a.add(b).multiplyScalar(.5);put('wood',g,mid.x,mid.y,mid.z,color);
  };
  const window=(x,y,z,w,h,lit)=>{
   box('wood',x,y,z,w+.36,h+.36,.25,0x151f23);
   box(lit?'lamp':'roof',x,y,z-.15,w,h,.12,lit?0x8c734c:0x233139);
   box('wood',x,y,z-.24,.12,h,.17,0x1c272b);box('wood',x,y,z-.24,w,.12,.17,0x1c272b);
   if(lit){const p=new THREE.Vector3(x,y,z-.15).applyMatrix4(root.matrix);lamps.push({site:site.id,position:p.toArray(),width:w,height:h});}
  };
  // The hill closes the bottom silhouette behind the trees. Its upper surface
  // penetrates the foundation so no hovering slab is visible through branches.
  const hill=new THREE.SphereGeometry(1,18,8);hill.scale(38,18,32);put('stone',hill,0,-16,0,0x30414b);
  if(site.kind==='tower'){
   box('stone',0,-.5,0,13,3,12,0x46575c);
   for(const x of [-4,4])for(const z of [-4,4])beam(x,0,z,x,17,z,.65);
   for(const z of [-4,4]){beam(-4,2,z,4,15,z,.34);beam(4,2,z,-4,15,z,.34);}
   for(const x of [-4,4]){beam(x,2,-4,x,15,4,.34);beam(x,2,4,x,15,-4,.34);}
   box('wood',0,16.5,0,12,.65,12,0x52636a);
   put('wood',new THREE.CylinderGeometry(5.2,5.2,7,18),0,20.2,0,0x657576);
   for(const y of [17.1,19,21.4,23.6])put('roof',new THREE.CylinderGeometry(5.33,5.33,.22,18),0,y,0,0x3a484e);
   put('roof',new THREE.ConeGeometry(5.7,3,18),0,25.2,0,0x596871);
   box('wood',-4.8,8,-4.7,.18,16,.18,0x657273);box('wood',-3.9,8,-4.7,.18,16,.18,0x657273);
   for(let y=1;y<16;y+=.8)box('wood',-4.35,y,-4.7,1,.12,.18,0x657273);
   box('wood',4.3,15.9,-5.4,1.4,1.9,.5,0x1a252a);box('lamp',4.3,15.9,-5.7,.7,1.1,.12,0x9a7b4d);
   lamps.push({site:site.id,position:new THREE.Vector3(4.3,15.9,-5.7).applyMatrix4(root.matrix).toArray(),width:.7,height:1.1});
  }else{
   const barn=site.kind==='barn',w=barn?22:15,d=barn?15:12,h=barn?10:8,rise=barn?5:4;
   box('stone',0,0,0,w+1,3,d+1,0x546268);
   box('wood',0,h/2,0,w,h,d,barn?0x546069:0x68777b);
   const slope=Math.atan2(rise,w/2),length=Math.hypot(w/2,rise)+.8;
   for(const side of [-1,1])box('roof',side*w/4,h+rise/2,0,length,.45,d+1.7,0x52616c,-side*slope);
   // Closed triangular gables, rather than a hollow pair of roof planes.
   const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(0,rise);shape.closePath();
   put('wood',new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false}),0,h,-d/2,0x637278);
   box('wood',0,h-.15,-d/2-.22,w+.6,.35,.4,0x34424a);
   for(const x of [-w/2+.2,w/2-.2])box('wood',x,h/2,-d/2-.2,.35,h,.35,0x34424a);
   box('stone',w*.23,h+rise+.3,1.8,1.6,4,1.5,0x657178);box('roof',w*.23,h+rise+2.3,1.8,2,.35,1.9,0x3f4d55);
   if(barn){
    box('wood',0,3.5,-d/2-.2,6,7,.35,0x26353c);beam(-2.7,.3,-d/2-.45,2.7,6.7,-d/2-.45,.22);
    window(-7,6,-d/2-.25,1.3,2,false);window(7,6,-d/2-.25,1.3,2,true);
   }else{
    box('wood',0,2.6,-d/2-.2,2.4,5.2,.4,0x223137);window(-4,4.7,-d/2-.3,1.6,2.6,true);window(4,4.7,-d/2-.3,1.6,2.6,false);
    window(0,h+1,-d/2-.25,.9,1.3,false);
   }
  }
  sites.push({...site,pieces:count});
 }
 const geometry={};for(const [kind,parts]of Object.entries(batches)){geometry[kind]=mergeIndexedGeometries(parts);parts.forEach(g=>g.dispose());geometry[kind].computeBoundingBox();geometry[kind].computeBoundingSphere();}
 return {geometry,sites,lamps,pieces};
}

export function createDistantEstateStructures(){
 const built=buildDistantEstateGeometry(),group=new THREE.Group();group.name='distant-estate-structures';
 const crops={stone:[1024,0,512,512],wood:[0,0,512,512],roof:[512,512,512,512]};
 for(const[kind,g]of Object.entries(built.geometry)){
  const map=kind==='lamp'?null:Art.texture('rough-cut-architecture-surfaces-v1',crops[kind],null,true);
  const m=new THREE.MeshBasicMaterial({map,vertexColors:true,fog:false}),mesh=new THREE.Mesh(g,m);mesh.name='distant-estate-'+kind;group.add(mesh);
 }
 return {group,stats:()=>({sites:built.sites,lamps:built.lamps,pieces:built.pieces,batches:group.children.length,triangles:Object.values(built.geometry).reduce((sum,g)=>sum+g.index.count/3,0)})};
}
