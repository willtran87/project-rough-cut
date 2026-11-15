import * as THREE from './vendor/three/three.module.js';

// Quarter-metre tiles follow the eight courses in the existing two-metre art.
// Damage follows the keeper root's descending fork and upper wall entry. The
// original opaque wall remains behind this thin, localized surface treatment.
export const KEEPER_DAMAGED_TILES=Object.freeze([
 [7.75,1.50,0],[7.75,1.75,1],[7.75,2.00,2],[8.00,2.00,3],
 [8.00,2.25,1],[8.00,2.50,0],[8.25,2.50,2],[8.25,2.75,3],
 [8.50,2.75,1],[8.25,3.50,3],[8.50,3.50,0],[8.50,3.75,2],
 [9.00,3.50,1],[9.25,3.50,3],[9.25,3.25,2],[9.50,3.25,0],
 [9.50,3.75,1],[9.00,1.25,3],[9.25,1.25,1],[9.25,1.50,2],
 [9.25,1.75,0],[9.00,2.00,3]
]);
const boundary=11.35,face=boundary+.11,tile=.25;
export const KEEPER_DAMP_PATCHES=Object.freeze([{x:8.18,h:2.24,w:1.45,tall:2.45},{x:8.94,h:3.63,w:1.75,tall:.67},{x:9.16,h:.61,w:.57,tall:.98}]);
const fragments=[
 // Most of a chipped tile remains, a corner has separated, or just a narrow
 // shard is seated in the mortar. Missing areas expose textured backing.
 [[.008,.008],[.239,.008],[.241,.178],[.198,.224],[.108,.240],[.008,.229]],
 [[.009,.011],[.231,.009],[.239,.083],[.155,.132],[.073,.182],[.011,.153]],
 [[.013,.092],[.075,.109],[.148,.172],[.221,.241],[.009,.239]],
 [[.008,.009],[.240,.010],[.237,.229],[.187,.240],[.123,.203],[.007,.225]]
];

function chippedContour(points,seed){
 return points.flatMap(([x,y],i)=>{
  const [nx,ny]=points[(i+1)%points.length],dx=nx-x,dy=ny-y,length=Math.hypot(dx,dy);
  // Retained factory edges stay quiet; only broken interior edges chip.
  const factory=(Math.abs(dx)<.02&&(x<.025||x>.22))||(Math.abs(dy)<.02&&(y<.025||y>.22));
  const count=factory?1:Math.max(2,Math.ceil(length/.019));
  return Array.from({length:count},(_,j)=>{
   const t=j/count,chip=j===0?0:Math.round(Math.sin(seed*3.7+i*4.1+j*2.3)*2)/627;
   return [x+dx*t-dy/length*chip,y+dy*t+dx/length*chip];
  });
 });
}

export function keeperTileFragment(points,depth){
 const shape=new THREE.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(-x,y):shape.moveTo(-x,y));shape.closePath();
 // Rotate a positive extrusion into the room rather than reflect its winding.
 const g=new THREE.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:true,bevelSegments:1,bevelSize:.0012,bevelThickness:.001});
 g.rotateY(Math.PI);return g;
}

export function buildKeeperTileDamage({materials,put}){
 const material=materials.keeperStone,compile=material.onBeforeCompile,key=material.customProgramCacheKey;
 // Pigment belongs to the existing wall shader. A second fully lit opaque
 // overlay made this close view needlessly expensive on software rendering.
 material.onBeforeCompile=function(shader,renderer){
  compile.call(this,shader,renderer);
  const fields=KEEPER_DAMP_PATCHES.map((s,i)=>`{
   vec2 d=(keeperPoint-vec2(${s.x.toFixed(4)},${s.h.toFixed(4)}))*vec2(${(2/s.w).toFixed(6)},${(2/s.tall).toFixed(6)});
   if(abs(d.x)<1.1&&abs(d.y)<1.1){
    float edge=length(d)+.10*d.x*d.y+.025*(d.x*d.x-d.y*d.y)*(d.y+${(i*.3).toFixed(3)});
    keeperDamp=max(keeperDamp,1.-smoothstep(.22,.94,edge));
   }
  }`).join('\n');
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   if(abs(drainWorld.z+11.46)<.004&&drainWorld.x>7.25&&drainWorld.x<9.9){
    vec2 keeperPoint=floor(drainWorld.xy*313.5)/313.5;float keeperDamp=0.;
    ${fields}
    diffuseColor.rgb*=mix(vec3(1.),vec3(.52,.63,.49),keeperDamp);
   }
  `);
 };
 material.customProgramCacheKey=()=>key.call(material)+'-keeper-root-damp-v1';material.needsUpdate=true;
 const records=[];let triangles=0,fragmentsCount=0;
 const submit=(g,type,x,h,y)=>{triangles+=(g.index?.count||g.attributes.position.count)/3;put(g,type,x,h,-y);g.dispose();};
 for(const [i,[x,h,kind]]of KEEPER_DAMAGED_TILES.entries()){
  const bed=new THREE.PlaneGeometry(tile-.004,tile-.004);bed.rotateY(Math.PI);
  // Behind the existing contact shade at face+.0015, never coplanar with it.
  submit(bed,'rootStone',x+tile/2,h+tile/2,face+.0013);
  const points=chippedContour(fragments[kind],i),depth=.009+(i%4)*.004;
  // A shallow offset/rotation settles the remaining face independently of the
  // grid. All backs stay embedded; maximum projection is under three cm.
  const shift=(i%2?1:-1)*.0025,angle=(i%3-1)*.018;
  const placed=points.map(([u,v])=>{
   const dx=u-tile/2,dy=v-tile/2;return [tile/2+Math.cos(angle)*dx-Math.sin(angle)*dy+shift,tile/2+Math.sin(angle)*dx+Math.cos(angle)*dy-.003];
  });
  const body=keeperTileFragment(placed,depth);submit(body,'ceiling',x,h,face+.0005);
  // Glazed faces keep their original authored tile coordinates as each shard
  // settles; sampling another tiled field would put tiny tiles on the fragment.
  const shape=new THREE.Shape();placed.forEach(([u,v],j)=>j?shape.lineTo(u,v):shape.moveTo(u,v));shape.closePath();
  const skin=new THREE.ShapeGeometry(shape),idx=skin.index,uv=skin.attributes.uv,p=skin.attributes.position;
  for(let j=0;j<idx.count;j+=3){const a=idx.getX(j+1);idx.setX(j+1,idx.getX(j+2));idx.setX(j+2,a);}
  for(let j=0;j<p.count;j++){
   // Undo the small settlement transform before looking up the old tile face.
   const dx=p.getX(j)-tile/2-shift,dy=p.getY(j)-tile/2+.003;
   uv.setXY(j,(x+tile/2+Math.cos(angle)*dx+Math.sin(angle)*dy)/2,(h+tile/2-Math.sin(angle)*dx+Math.cos(angle)*dy)/2);
  }
  skin.computeVertexNormals();skin.userData.preserveDrainUV=true;
  submit(skin,'keeperStone',x,h,face+depth+.0017);fragmentsCount++;
  records.push({x,height:h,kind,depth,shift,angle});
 }
 return {tiles:records,fragments:fragmentsCount,seepPatches:KEEPER_DAMP_PATCHES,triangles,wallFace:face,maximumProjection:.025,newTextures:0,newLights:0,newMaterials:0,addedColliders:0,opaqueBacking:true,pigmentInWallMaterial:true,dispose(){material.onBeforeCompile=compile;material.customProgramCacheKey=key;}};
}
