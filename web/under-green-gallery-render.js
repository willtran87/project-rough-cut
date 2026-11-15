import * as THREE from './vendor/three/three.module.js';
import {shadeDrainMaterial} from './under-green-crafted-surfaces.js';
import {gallerySeepGeometry} from './under-green-gallery-plaster.js';
import {galleryWallFinishHeight} from './under-green-gallery-roof.js';

// Surviving lime render belongs to the old gallery walls. Unequal islands and
// exposed brick windows interrupt the courses without covering the rootwork.
// Coordinates are along the wall (+course y), then height, in metres.
export const GALLERY_RENDER_PATCHES=Object.freeze([
 {id:'east-upper',boundary:5,side:-1,seed:3,points:[[8.04,3.79],[9.29,3.82],[9.48,3.51],[10.08,3.43],[10.04,3.06],[9.74,2.83],[9.88,2.49],[9.46,2.32],[9.53,1.86],[8.96,1.70],[8.42,1.94],[8.54,2.38],[8.20,2.54],[8.30,3.03],[8.05,3.16]],holes:[[9.18,2.92,.23,.18]]},
 {id:'east-low',boundary:5,side:-1,seed:7,points:[[10.92,1.71],[11.41,1.92],[11.73,1.74],[12.19,1.83],[12.49,1.50],[12.33,1.14],[12.66,.94],[12.53,.58],[12.00,.47],[11.74,.64],[11.21,.55],[11.04,.88],[11.22,1.14]],holes:[]},
 {id:'east-high-remnant',boundary:5,side:-1,seed:11,points:[[12.42,3.91],[13.30,3.91],[13.54,3.66],[13.38,3.25],[13.06,3.13],[12.84,3.39],[12.54,3.34],[12.35,3.62]],holes:[]},
 {id:'west-seep',boundary:-5,side:1,seed:17,points:[[12.31,3.64],[13.38,3.79],[13.61,3.55],[14.25,3.65],[14.57,3.25],[14.27,2.97],[14.43,2.67],[14.08,2.43],[14.18,2.08],[13.73,1.94],[13.38,2.19],[12.88,2.12],[12.54,2.42],[12.71,2.77],[12.29,3.06]],holes:[[13.38,2.91,.30,.22],[13.90,3.38,.12,.09]]},
 {id:'west-low-remnant',boundary:-5,side:1,seed:23,points:[[15.52,1.53],[15.88,1.71],[16.26,1.57],[16.43,1.26],[16.22,1.07],[16.38,.79],[16.03,.58],[15.61,.66],[15.42,.97]],holes:[]},
 // One surviving broad coat marks the old maintenance repair approaching the
 // first drain. Its torn lower edge and brick windows distinguish it from the
 // smaller root-pressure remnants; the wall stays solid behind every opening.
 {id:'east-drain-repair',boundary:3,side:-1,seed:29,points:[
  [16.45,3.57],[17.21,3.67],[17.63,3.46],[18.11,3.55],[18.45,3.29],
  [18.98,3.36],[19.43,3.04],[19.28,2.63],[19.63,2.41],[19.50,1.91],
  [19.71,1.60],[19.44,1.09],[19.62,.83],[19.17,.60],[18.91,.87],
  [18.50,.72],[18.28,1.05],[17.77,.89],[17.46,1.21],[17.13,1.14],
  [16.97,1.67],[16.63,1.81],[16.77,2.19],[16.41,2.43],[16.57,2.81]],
  holes:[[18.19,2.43,.38,.26],[17.12,2.92,.18,.12]]}
]);

export function renderContour(points,seed){
 return points.flatMap(([u,h],i)=>{
  const [v,k]=points[(i+1)%points.length],du=v-u,dh=k-h,length=Math.hypot(du,dh),steps=Math.max(1,Math.ceil(length/.075));
  return Array.from({length:steps},(_,j)=>{
   const t=j/steps,chip=j===0?0:Math.round(Math.sin(i*3.7+j*2.13+seed)*5)/313.5;
   return [u+du*t-dh/length*chip,h+dh*t+du/length*chip];
  });
 });
}

export function galleryRenderGeometry(patch){
 const outer=renderContour(patch.points,patch.seed),shape=new THREE.Shape();
 outer.forEach(([u,h],i)=>i?shape.lineTo(u,h):shape.moveTo(u,h));shape.closePath();
 for(const [u,h,rx,ry]of patch.holes){
  const hole=new THREE.Path();
  for(let i=0;i<14;i++){const a=i/14*Math.PI*2,r=.79+.13*Math.sin(i*2.3+patch.seed)+.08*Math.cos(i*3.1),x=u+Math.cos(a)*rx*r,y=h+Math.sin(a)*ry*r;i?hole.lineTo(x,y):hole.moveTo(x,y);}
  hole.closePath();shape.holes.push(hole);
 }
 // A shallow exposed lime edge catches grazing light. The back remains buried
 // in the masonry and the front stays at the same 126 mm boundary offset.
 const g=new THREE.ExtrudeGeometry(shape,{depth:.014,steps:1,bevelEnabled:true,bevelSegments:1,bevelSize:.006,bevelThickness:.004}),p=g.attributes.position,color=[];
 for(let i=0;i<p.count;i++){
  const u=p.getX(i),h=p.getY(i),d=p.getZ(i);
  p.setXYZ(i,patch.boundary+patch.side*(.108+d),galleryWallFinishHeight(h),-u);
  // A broad damp foot and uneven upper weathering preserve quiet pigment.
  const chippedEdge=d>.010&&d<.016?1.17:1;
  const tone=chippedEdge*(.80+.10*Math.sin(u*.83+patch.seed)*Math.sin(h*1.1))*(.69+.31*Math.min(1,h/2.5));
  color.push(tone,tone*.995,tone*.91);
 }
 if(patch.side<0){const indices=Array.from({length:p.count},(_,i)=>i);for(let i=0;i<indices.length;i+=3)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];g.setIndex(indices);}
 g.setAttribute('color',new THREE.Float32BufferAttribute(color,3));g.computeVertexNormals();g.computeBoundingBox();return g;
}

export function paintGalleryRenderWash(polygon){
 const points=[[-4.89,12.30],[-4.45,12.56],[-4.51,13.16],[-4.03,13.58],[-4.20,14.32],[-3.78,15.00],[-3.91,15.42],[-3.53,16.12],[-3.82,16.51],[-3.73,17.02],[-4.28,17.32],[-4.89,16.92]];
 const center=[-4.65,14.72];
 for(const [layer,scale,strength]of [[0,1,95],[0,.80,155],[0,.56,205],[2,.48,110],[2,.26,163]])polygon(layer,points.map(([x,y])=>[center[0]+(x-center[0])*scale,center[1]+(y-center[1])*scale]),strength);
 return {fans:1,patches:5,newTextures:0};
}

export function buildGalleryRender({materials,put}){
 const material=materials.ceiling.clone();material.color.setHex(0xb8b6a2);material.vertexColors=true;material.userData.drainWorldUV=true;shadeDrainMaterial(material,{wall:true});materials.galleryRender=material;
 const patches=[];
 for(const patch of GALLERY_RENDER_PATCHES){
  const g=galleryRenderGeometry(patch),bounds=g.boundingBox.clone(),anchor=bounds.getCenter(new THREE.Vector3());
  patches.push({id:patch.id,boundary:patch.boundary,side:patch.side,triangles:(g.index?.count||g.attributes.position.count)/3,min:bounds.min.toArray(),max:bounds.max.toArray()});
  g.translate(-anchor.x,-anchor.y,-anchor.z);put(g,'galleryRender',anchor.x,anchor.y,anchor.z);g.dispose();
 }
 const seeps=[[-5,1,13.64,1.48,.20,1.57],[-5,1,14.11,.85,.33,1.25],[5,-1,9.08,.95,.16,1.48],[5,-1,12.18,.39,.23,.63],
  [3,-1,18.37,.40,.23,.90],[3,-1,19.08,.33,.16,.68]];
 for(const [i,[boundary,side,along,h,w,tall]]of seeps.entries()){
  const g=gallerySeepGeometry(w,tall,i+31);put(g,'galleryWallDamp',boundary+side*.112,h,-along,1,1,1,0,side*Math.PI/2);g.dispose();
 }
 return {patches,exposedBrickWindows:GALLERY_RENDER_PATCHES.reduce((n,p)=>n+p.holes.length,0),seepTrails:seeps.length,maximumIntrusion:.126,newTextures:0,newLights:0,newColliders:0,opaqueBacking:true,dispose(){material.dispose();}};
}
