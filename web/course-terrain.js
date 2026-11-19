import {COURSE} from './back-nine-course.js';

// Broad turf swells and drainage hollows. Solid foundations and relay courts
// remain level; these slopes never add collision walls or change route widths.
export const TERRAIN_FORMS=[
 [21,65,15,25,1.5],[-21,103,13,25,.9],[19,159,16,24,-.7],
 [-16,239,20,28,-.65],[24,272,14,22,1.35],[20,314,15,23,1.2],
 [-10,373,16,25,.95],[19,410,15,24,-.7],[-27,453,15,29,-.6],
 [18,472,20,28,-.6],[17,534,14,23,1.4],[-18,607,15,22,.9],
 [21,648,14,24,1.4],[-16,690,16,27,-.7],[21,730,16,25,1.2]
];
const clamp=v=>Math.max(0,Math.min(1,v)),smooth=v=>{const t=clamp(v);return t*t*(3-2*t);};
const foundations=[...COURSE.features.map(f=>({x:f.x,y:f.y,rx:f.rx+1,ry:f.ry+1})),
 ...COURSE.checkpoints.map(p=>({...p,rx:6,ry:8})),
 ...COURSE.machinery.map(p=>({...p,rx:3,ry:3})),
 ...COURSE.obstacles.filter(p=>p.kind==='hedge').map(p=>({...p,rx:p.r+1,ry:p.r+1})),
 {x:-11,y:211,rx:14,ry:13},{x:-25,y:350,rx:12,ry:17},
 {x:29,y:199,rx:11,ry:13},{x:-24,y:771,rx:11,ry:17}];
function authoredHeight(x,y){
 let height=0;
 for(const [cx,cy,rx,ry,h]of TERRAIN_FORMS){const d=((x-cx)/rx)**2+((y-cy)/ry)**2;if(d<1)height+=h*(1-d)**3;}
 if(!height)return 0;
 let flat=1;
 for(const f of foundations){const d=Math.hypot(Math.max(0,Math.abs(x-f.x)-f.rx),Math.max(0,Math.abs(y-f.y)-f.ry));if(d<5)flat=Math.min(flat,smooth(d/5));if(!flat)return 0;}
 return height*flat*smooth((39-Math.abs(x))/5)*smooth((y-25)/12)*smooth((785-y)/12);
}
// Every layer and actor samples the same one-metre triangular height field.
// Clipping overlay polygons to these cells avoids intersections/z-fighting
// between independently triangulated turf, greens, paving and water.
const heights=new Map();
// Grid corners are integers, so a numeric key names the same cell as the old
// "x,y" string without building a string per lookup. Anything else keeps the string.
function gridHeight(x,y){
 const key=(x|0)===x&&(y|0)===y&&y>-1048576&&y<1048576?x*2097152+y:x+','+y;
 let h=heights.get(key);if(h===undefined){h=authoredHeight(x,y);heights.set(key,h);}return h;
}
export function terrainHeight(x,y){
 const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;
 if(fx+fy<=1)return gridHeight(ix,iy)*(1-fx-fy)+gridHeight(ix+1,iy)*fx+gridHeight(ix,iy+1)*fy;
 return gridHeight(ix+1,iy+1)*(fx+fy-1)+gridHeight(ix+1,iy)*(1-fy)+gridHeight(ix,iy+1)*(1-fx);
}
export function terrainSlope(x,y,yaw){
 const sx=Math.sin(yaw),sy=Math.cos(yaw),step=1.4;
 return {pitch:Math.atan2(terrainHeight(x+sx*step,y+sy*step)-terrainHeight(x-sx*step,y-sy*step),step*2),
 roll:Math.atan2(terrainHeight(x+sy*step,y-sx*step)-terrainHeight(x-sy*step,y+sx*step),step*2)};
}

// Ground-only tessellation, at construction time. Existing textured patches
// follow the same height function instead of floating as flat disks over hills.
// Vertex welding compares every component at five decimal places. The integer
// below identifies the same class as Number#toFixed(5) did when the key was a
// string: toFixed rounds the exact value, so a product within float error of a
// rounding boundary defers to it, and a negative value that prints as
// "-0.00000" stays distinct from zero.
function weldUnit(v){
 const s=v*1e5;let r=Math.round(s);
 if(r!==r)return 1e15;
 if(Math.abs(Math.abs(s-Math.floor(s))-.5)<1e-4){const text=v.toFixed(5);r=Math.round(Number(text)*1e5);if(r===0)return text.charCodeAt(0)===45?.5:0;return r;}
 return r===0?(v<0?.5:0):r;
}
// The authored course feeds the same geometry in on every visit, so a checked-in
// bake (web/baked-contours.js, made by tools/bake-course-contours.cjs) can hand
// back the finished tessellation while the course is built. Its key covers every
// input bit contourGround reads; anything it does not hold is computed exactly as
// before. The terrain data is fingerprinted separately; bump the version whenever
// contourGround's output for the same input and terrain changes.
export const CONTOUR_BAKE_VERSION=1;
let bakedContour=null;
export function installContourBake(lookup){bakedContour=lookup;}
// Two independent 32-bit lanes (murmur3 and xxhash32 rounds) over exact bits.
let laneA=0,laneB=0;
function hashWords(a){
 const w=a instanceof Float32Array?new Uint32Array(a.buffer,a.byteOffset,a.length):a;let x=laneA,y=laneB;
 for(let i=0;i<w.length;i++){const v=w[i];let k=Math.imul(v,0xcc9e2d51);k=k<<15|k>>>17;x^=Math.imul(k,0x1b873593);x=x<<13|x>>>19;x=Math.imul(x,5)+0xe6546b64|0;y=y+Math.imul(v,0x85ebca77)|0;y=y<<13|y>>>19;y=Math.imul(y,0x9e3779b1);}
 laneA=x;laneB=y;
}
const finishLane=h=>{h^=h>>>16;h=Math.imul(h,0x85ebca6b);h^=h>>>13;h=Math.imul(h,0xc2b2ae35);return (h^h>>>16)>>>0;};
const finishKey=()=>finishLane(laneA)+':'+finishLane(laneB);
export function contourFingerprint(){
 const text=JSON.stringify([CONTOUR_BAKE_VERSION,TERRAIN_FORMS,foundations]),codes=new Uint32Array(text.length);
 for(let i=0;i<text.length;i++)codes[i]=text.charCodeAt(i);laneA=0x5bd1e995;laneB=0x27d4eb2f;hashWords(codes);return finishKey();
}
// Null when an input is not a plain typed array the key can cover exactly.
export function contourBakeKey(g,{retainFlatTriangles=false}={}){
 const {position,uv,color}=g.attributes,parts=[position,uv,color,g.index],header=new Uint32Array(17);header[0]=retainFlatTriangles?1:0;
 for(let i=0;i<4;i++){const a=parts[i];if(!a)continue;const index=i===3,array=a.array;
  if(a.isInterleavedBufferAttribute||a.normalized||!(index?array instanceof Uint16Array||array instanceof Uint32Array:array instanceof Float32Array)||array.length!==a.count*a.itemSize)return null;
  header.set([1,a.itemSize,a.count,index?array.BYTES_PER_ELEMENT:4],1+i*4);}
 if(!position)return null;
 laneA=0x9747b28c;laneB=0x165667b1;hashWords(header);for(const a of parts)if(a)hashWords(a.array);return finishKey();
}
export function contourGround(THREE,g,options={}){
 if(bakedContour){const key=contourBakeKey(g,options),baked=key&&bakedContour(THREE,key);if(baked)return baked;}
 return tessellateGround(THREE,g,options);
}
function tessellateGround(THREE,g,{retainFlatTriangles=false}={}){
 const p=g.attributes.position,u=g.attributes.uv,color=g.attributes.color,idx=g.index,positions=[],uvs=[],colors=[],indices=[],cache=new Map();
 // cache maps a hash to the newest vertex id; welded holds each vertex's
 // rounded components and chain links ids sharing a hash. Equality is always
 // decided on the full rounded tuple, never on the hash.
 const width=5+(color?color.itemSize:0),welded=[],chain=[],unit=new Array(width);
 // Default callers retain the established raised-border normal field.
 // Authored bunker banks opt into their original planar triangles wherever
 // the underlying terrain is provably flat; curved terrain stays tessellated.
 let horizontal=true;for(let i=1;i<p.count;i++)if(Math.abs(p.getY(i)-p.getY(0))>1e-7){horizontal=false;break;}
 function vertex(a){
  let hash=a.length;for(let k=0;k<a.length;k++){const r=unit[k]=weldUnit(a[k]);hash=Math.imul(hash^(r*2|0),0x9e3779b1);hash^=hash>>>15;}
  const head=cache.get(hash);
  if(a.length===width)for(let id=head;id!==undefined;id=chain[id]){let same=true;for(let k=0,o=id*width;k<width;k++)if(welded[o+k]!==unit[k]){same=false;break;}if(same)return id;}
  const id=positions.length/3;positions.push(a[0],a[1]+terrainHeight(a[0],-a[2]),a[2]);uvs.push(a[3],a[4]);if(color)for(let k=5;k<width;k++)colors.push(a[k]);
  for(let k=0;k<width;k++)welded.push(unit[k]);chain.push(head);cache.set(hash,id);return id;
 }
 function clip(poly,dist){
  const out=[];if(!poly.length)return out;
  let a=poly.at(-1),da=dist(a);
  for(const b of poly){const db=dist(b);if((da>=0)!==(db>=0)){const t=da/(da-db);out.push(a.map((v,i)=>v+(b[i]-v)*t));}if(db>=0)out.push(b);a=b;da=db;}return out;
 }
 function emit(poly){if(poly.length<3)return;const a=vertex(poly[0]);for(let i=1;i<poly.length-1;i++){const b=vertex(poly[i]),c=vertex(poly[i+1]);if(a!==b&&b!==c&&a!==c)indices.push(a,b,c);}}
 const v=i=>{const a=[p.getX(i),p.getY(i),p.getZ(i),u?.getX(i)||0,u?.getY(i)||0];if(color)for(let k=0,o=i*color.itemSize;k<color.itemSize;k++)a.push(color.array[o+k]);return a;};
 for(let i=0;i<(idx?.count||p.count);i+=3){
  const tri=[0,1,2].map(n=>v(idx?idx.getX(i+n):i+n));
  const [t0,t1,t2]=tri,minX=Math.floor(Math.min(t0[0],t1[0],t2[0])),maxX=Math.max(minX,Math.ceil(Math.max(t0[0],t1[0],t2[0]))-1);
  const minY=Math.floor(Math.min(-t0[2],-t1[2],-t2[2])),maxY=Math.max(minY,Math.ceil(Math.max(-t0[2],-t1[2],-t2[2]))-1);
  // Outside every authored height field, this triangle is exactly planar.
  // Keep its original topology instead of clipping thousands of redundant
  // cells into flat shoulders. Include a neighbouring-cell margin so normals
  // beside the curved grid still use the original tessellation.
  const flat=(horizontal||retainFlatTriangles)&&TERRAIN_FORMS.every(([cx,cy,rx,ry])=>{
   const dx=Math.max(minX-1-cx,0,cx-(maxX+2)),dy=Math.max(minY-1-cy,0,cy-(maxY+2));
   return (dx/rx)**2+(dy/ry)**2>=1;
  });
  if(flat){emit(tri);continue;}
  for(let x=minX;x<=maxX;x++)for(let y=minY;y<=maxY;y++){
   let poly=clip(tri,a=>a[0]-x);poly=clip(poly,a=>x+1-a[0]);poly=clip(poly,a=>-a[2]-y);poly=clip(poly,a=>y+1+a[2]);
   emit(clip(poly,a=>1-(a[0]-x)+a[2]+y));emit(clip(poly,a=>(a[0]-x)-a[2]-y-1));
  }
 }
 const out=new THREE.BufferGeometry();out.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));out.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));if(color)out.setAttribute('color',new THREE.Float32BufferAttribute(colors,color.itemSize));out.setIndex(indices);out.computeVertexNormals();return out;
}
