import * as THREE from './vendor/three/three.module.js';
import {paintStationPaper,STATION_PAPER} from './course-station-paper.js';

// Existing approach clues reuse the station's actual form designs. Incomplete
// pencil checks and ground stains suggest interrupted work without introducing
// a new objective, collectible, navigation marker or source of AI evidence.
export function createDroppedPaperAtlas(){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=320;
 const g=canvas.getContext('2d');g.fillStyle='#a89d7e';g.fillRect(0,0,512,320);
 const regions=[];
 for(const [index,kind]of ['log','release'].entries()){
  const sheet=document.createElement('canvas');[sheet.width,sheet.height]=STATION_PAPER[kind];
  const p=sheet.getContext('2d');paintStationPaper(p,kind);
  const rect=(x,y,w,h,color)=>{p.fillStyle=color;p.fillRect(x,y,w,h);};
  if(kind==='log')for(const y of [118,146]){
   // Two pencil checks; the remaining pass boxes and signature stay blank.
   for(let i=0;i<3;i++)rect(96+i,y+3+i,2,2,'#68705d');
   for(let i=0;i<5;i++)rect(98+i,y+5-i,2,2,'#68705d');
  }
  // A handled fold and uneven capillary stain enter from the ground edge.
  const w=sheet.width,h=sheet.height;
  rect(9,Math.floor(h*.71),w-18,1,'#b0a17c');rect(10,Math.floor(h*.71)+1,w-20,1,'#d9ccaa');
  for(let i=0;i<18;i++){
   const x=i*(w/18)|0,depth=3+(i*13+index*7)%15;
   rect(x,h-depth,Math.ceil(w/18),depth,'#9c9271');
   rect(x+2,h-depth-2,4,3,'#b5a985');
   if(i%3===0)rect(x+3,h-depth-5,3,2,'#b5a985');
  }
  for(const [x,y]of [[8,35],[w-15,78],[12,h-45]]){
   rect(x,y,7,2,'#a19777');rect(x+2,y+2,9,2,'#b7aa86');
  }
  const x=index*256+(256-w)/2,y=(320-h)/2;g.drawImage(sheet,x,y);
  regions.push({x,y,w,h});
 }
 const map=new THREE.CanvasTexture(canvas);map.name='CourseDroppedPaper';
 map.colorSpace=THREE.SRGBColorSpace;map.magFilter=THREE.NearestFilter;map.minFilter=THREE.NearestMipmapLinearFilter;
 return {map,regions};
}

export const DROPPED_PAPER_CORNERS=[[-.13,.038,-.18],[.10,.038,-.18],[.13,.065,.09],[.06,.087,.18],[-.13,.038,.15]];

export function createDroppedPaperGeometry(placements,regions){
 const positions=[],uvs=[];
 for(const {x,z,angle,route}of placements){
  const region=regions[route<8?0:1],cs=Math.cos(angle),sn=Math.sin(angle);
  const points=DROPPED_PAPER_CORNERS;
  const emit=(i,bottom=false,printed=true)=>{
   const [px,py,pz]=points[i];positions.push(x+px*cs+pz*sn,py-(bottom?.0006:0),z+pz*cs-px*sn);
   const u=printed?(px+.13)/.26:4/region.w,v=printed?(pz+.18)/.36:4/region.h;
   uvs.push((region.x+u*region.w)/512,1-(region.y+v*region.h)/320);
  };
  // Keep the original folded top and ground-contact silhouette. Separate
  // vertices retain a crisp crease and outward normals on the thin stock edge.
  for(let i=1;i<4;i++){
   for(const j of [0,i+1,i])emit(j);
   for(const j of [0,i,i+1])emit(j,true,false);
  }
  for(let i=0;i<5;i++){
   const j=(i+1)%5;
   emit(i,false,false);emit(j,false,false);emit(j,true,false);
   emit(i,false,false);emit(j,true,false);emit(i,true,false);
  }
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.computeVertexNormals();geometry.computeBoundingSphere();
 return geometry;
}

export function createDroppedPaper(placements){
 const {map,regions}=createDroppedPaperAtlas(),geometry=createDroppedPaperGeometry(placements,regions);
 const material=new THREE.MeshLambertMaterial({map});
 const mesh=new THREE.Mesh(geometry,material);mesh.name='CourseDroppedPaper';mesh.receiveShadow=true;mesh.castShadow=true;
 // One batch owns its geometry/material/map through the ordinary world
 // teardown. No secondary disposer or per-frame upload is required.
 return mesh;
}
