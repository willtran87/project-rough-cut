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
function gridHeight(x,y){const key=x+','+y;if(!heights.has(key))heights.set(key,authoredHeight(x,y));return heights.get(key);}
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
export function contourGround(THREE,g){
 const p=g.attributes.position,u=g.attributes.uv,color=g.attributes.color,idx=g.index,positions=[],uvs=[],colors=[],indices=[],cache=new Map();
 // Raised borders need their edge subdivisions to retain the same blended
 // normals. Only flat input sheets qualify for the planar fast path below.
 let horizontal=true;for(let i=1;i<p.count;i++)if(Math.abs(p.getY(i)-p.getY(0))>1e-7){horizontal=false;break;}
 function vertex(a){const key=a.map(v=>v.toFixed(5)).join(',');if(cache.has(key))return cache.get(key);const id=positions.length/3;positions.push(a[0],a[1]+terrainHeight(a[0],-a[2]),a[2]);uvs.push(a[3],a[4]);if(color)colors.push(a[5],a[6],a[7]);cache.set(key,id);return id;}
 function clip(poly,dist){
  const out=[];if(!poly.length)return out;
  let a=poly.at(-1),da=dist(a);
  for(const b of poly){const db=dist(b);if((da>=0)!==(db>=0)){const t=da/(da-db);out.push(a.map((v,i)=>v+(b[i]-v)*t));}if(db>=0)out.push(b);a=b;da=db;}return out;
 }
 function emit(poly){if(poly.length<3)return;const a=vertex(poly[0]);for(let i=1;i<poly.length-1;i++){const b=vertex(poly[i]),c=vertex(poly[i+1]);if(a!==b&&b!==c&&a!==c)indices.push(a,b,c);}}
 const v=i=>[p.getX(i),p.getY(i),p.getZ(i),u?.getX(i)||0,u?.getY(i)||0,...(color?[color.getX(i),color.getY(i),color.getZ(i)]:[])];
 for(let i=0;i<(idx?.count||p.count);i+=3){
  const tri=[0,1,2].map(n=>v(idx?idx.getX(i+n):i+n));
  const minX=Math.floor(Math.min(...tri.map(a=>a[0]))),maxX=Math.max(minX,Math.ceil(Math.max(...tri.map(a=>a[0])))-1);
  const minY=Math.floor(Math.min(...tri.map(a=>-a[2]))),maxY=Math.max(minY,Math.ceil(Math.max(...tri.map(a=>-a[2])))-1);
  // Outside every authored height field, this triangle is exactly planar.
  // Keep its original topology instead of clipping thousands of redundant
  // cells into flat shoulders. Include a neighbouring-cell margin so normals
  // beside the curved grid still use the original tessellation.
  const flat=horizontal&&TERRAIN_FORMS.every(([cx,cy,rx,ry])=>{
   const dx=Math.max(minX-1-cx,0,cx-(maxX+2)),dy=Math.max(minY-1-cy,0,cy-(maxY+2));
   return (dx/rx)**2+(dy/ry)**2>=1;
  });
  if(flat){emit(tri);continue;}
  for(let x=minX;x<=maxX;x++)for(let y=minY;y<=maxY;y++){
   let poly=clip(tri,a=>a[0]-x);poly=clip(poly,a=>x+1-a[0]);poly=clip(poly,a=>-a[2]-y);poly=clip(poly,a=>y+1+a[2]);
   emit(clip(poly,a=>1-(a[0]-x)+a[2]+y));emit(clip(poly,a=>(a[0]-x)-a[2]-y-1));
  }
 }
 const out=new THREE.BufferGeometry();out.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));out.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));if(color)out.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));out.setIndex(indices);out.computeVertexNormals();return out;
}
