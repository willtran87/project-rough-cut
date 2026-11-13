import * as THREE from './vendor/three/three.module.js';
import {DEAD_GREEN_BENCHES,REFUGE} from './dead-green-refuge.js';

// Static, prepared scenery. Three draw calls; no new light, animation, physics
// loop or per-frame geometry work. Existing paths remain visible through turf.
export function createDeadGreenRefuge(parent,{scale,xScale,paths}){
 const root=new THREE.Group();root.name='dead-green-refuge';parent.add(root);
 const {x,z,rx,rz}=REFUGE;
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;
 const g=canvas.getContext('2d');
 const tx=v=>(v-x+rx)/(2*rx)*512,tz=v=>(v-z+rz)/(2*rz)*256;
 g.save();g.beginPath();g.ellipse(256,128,255,127,0,0,Math.PI*2);g.clip();
 g.fillStyle='#495c3e';g.fillRect(0,0,512,256);
 for(let i=0;i<18;i++){g.fillStyle=i%2?'#657650':'#596b46';g.fillRect(i*30,0,30,256);}
 // Evenly clipped short turf has fine grain rather than scattered long weeds.
 for(let i=0;i<19000;i++){g.fillStyle=i%3?'rgba(12,29,10,.10)':'rgba(178,183,125,.14)';g.fillRect((i*73+i%11)%512,(i*97+i%19)%256,1,1);}
 g.strokeStyle='#394b32';g.lineWidth=8;g.beginPath();g.ellipse(256,128,251,123,0,0,Math.PI*2);g.stroke();
 g.globalCompositeOperation='destination-out';g.lineCap=g.lineJoin='round';g.lineWidth=1.3/(2*rx)*512;
 for(const path of paths){g.beginPath();path.forEach((p,i)=>i?g.lineTo(tx(p.x*xScale),tz(-p.y*scale)):g.moveTo(tx(p.x*xScale),tz(-p.y*scale)));g.stroke();}
 g.restore();
 const turf=new THREE.CanvasTexture(canvas);turf.colorSpace=THREE.SRGBColorSpace;turf.magFilter=THREE.NearestFilter;turf.minFilter=THREE.LinearMipmapLinearFilter;
 const green=new THREE.Mesh(new THREE.PlaneGeometry(rx*2,rz*2),new THREE.MeshLambertMaterial({map:turf,alphaTest:.4}));
 green.rotation.x=-Math.PI/2;green.position.set(x,.025,z);green.receiveShadow=true;root.add(green);

 const base=new THREE.BoxGeometry(1,1,1).toNonIndexed(),positions=[],normals=[],colors=[],color=new THREE.Color();
 function box(x,y,z,w,h,d,tint){
  const p=base.attributes.position,n=base.attributes.normal;color.setHex(tint);
  for(let i=0;i<p.count;i++){
   positions.push(x+p.getX(i)*w,y+p.getY(i)*h,z+p.getZ(i)*d);
   normals.push(n.getX(i),n.getY(i),n.getZ(i));
   const shade=n.getY(i)>.5?1:n.getY(i)<-.5?.66:.85;
   colors.push(color.r*shade,color.g*shade,color.b*shade);
  }
 }
 const benchBounds=[];
 for(const b of DEAD_GREEN_BENCHES){
  const firstVertex=positions.length;
  const bx=b.x*xScale,bz=-b.y*scale;
  // Feet, curved-look brackets and slatted back leave readable open gaps.
  for(const side of [-1,1]){
   const xx=bx+side*.67;
   box(xx,.05,bz,.13,.06,.57,0x323c36);
   for(const end of [-1,1])box(xx,.235,bz+end*.22,.075,.40,.075,0x485148);
   box(xx,.47,bz,.11,.08,.59,0x596054);
   box(xx,.70,bz-.24,.075,.56,.07,0x485148);
   box(xx,.64,bz+.01,.09,.065,.53,0xa09f7f);
   box(xx,.57,bz+.23,.065,.13,.065,0x485148);
  }
  for(let i=0;i<4;i++)box(bx,.49,bz-.21+i*.14,1.76,.065,.115,i%2?0xb0ae8c:0xbcb899);
  for(let i=0;i<3;i++)box(bx,.70+i*.105,bz-.25,1.76,.075,.07,i%2?0xb0ae8c:0xbcb899);
  // Small worn paint patches and fasteners share the same static batch.
  for(let i=0;i<7;i++)box(bx-.71+i*.23,.912,bz-.211,.055,.014,.009,0x656952);
  const bounds=new THREE.Box3();
  for(let i=firstVertex;i<positions.length;i+=3)bounds.expandByPoint(new THREE.Vector3(positions[i],positions[i+1],positions[i+2]));
  benchBounds.push({id:b.id,bounds});
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeBoundingSphere();base.dispose();
 const benches=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true}));benches.name='DeadGreenWaitingBenches';benches.castShadow=benches.receiveShadow=true;root.add(benches);

 // Flush cover over the abandoned eighteenth cup: no flag or new objective.
 const c=document.createElement('canvas');c.width=c.height=128;const pen=c.getContext('2d');
 pen.fillStyle='#555447';pen.fillRect(0,0,128,128);pen.fillStyle='#a79a72';pen.beginPath();pen.arc(64,64,59,0,Math.PI*2);pen.fill();
 pen.strokeStyle='#514e3c';pen.lineWidth=3;pen.beginPath();pen.arc(64,64,51,0,Math.PI*2);pen.stroke();pen.textAlign='center';pen.fillStyle='#343c32';pen.font='bold 44px monospace';pen.fillText('18',64,65);pen.font='bold 16px monospace';pen.fillText('CLOSED',64,88);
 const cupMap=new THREE.CanvasTexture(c);cupMap.colorSpace=THREE.SRGBColorSpace;cupMap.magFilter=THREE.NearestFilter;
 const cup=new THREE.Mesh(new THREE.CircleGeometry(.23,24),new THREE.MeshLambertMaterial({map:cupMap}));cup.rotation.x=-Math.PI/2;cup.position.set(2.8,.032,z+.6);root.add(cup);
 const resources={geometry:[green.geometry.uuid,benches.geometry.uuid,cup.geometry.uuid],textures:[turf.uuid,cupMap.uuid]};
 function collisionArt(){
  benches.updateWorldMatrix(true,false);
  let visible=benches.parent===root&&!!root.parent&&benches.material.visible&&benches.geometry.drawRange.count>0;
  for(let p=benches;p;p=p.parent)visible=visible&&p.visible;
  return benchBounds.map(({id,bounds})=>{const worldBounds=bounds.clone().applyMatrix4(benches.matrixWorld);return {id,owner:root.name,visible,min:worldBounds.min.toArray(),max:worldBounds.max.toArray()};});
 }
 return {stats:()=>({meshes:3,textures:2,resources,collisionArt:collisionArt(),benches:DEAD_GREEN_BENCHES.map(b=>({id:b.id,x:b.x*xScale,z:-b.y*scale,width:1.76,depth:.608,height:.98})),green:{...REFUGE,pathsPreserved:true},cup:cup.position.toArray()})};
}
