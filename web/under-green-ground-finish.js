import * as THREE from './vendor/three/three.module.js';
import {onFloor} from './under-green-course.js';
import {shadeDrainMaterial} from './under-green-crafted-surfaces.js';
import {DRAIN_PUDDLES,DRAIN_RUNNELS,runnelPolygon} from './under-green-wet-ground.js';

const DOMAIN={minX:-36,maxX:28,minY:-4,maxY:80},SIZE=1024;
const hash=n=>{const v=Math.sin(n*127.1+19.73)*43758.5453;return v-Math.floor(v);};

// This low-frequency map records where dirt comes from, independently of the
// illustrated material's fine pixels. RGB = mud coverage / sand / wetness.
// All layers use physical course coordinates, not the floor partition grid.
function depositMap(layout,waters){
 const width=DOMAIN.maxX-DOMAIN.minX,height=DOMAIN.maxY-DOMAIN.minY;
 const layers=Array.from({length:3},()=>{const c=document.createElement('canvas');c.width=c.height=SIZE;const ctx=c.getContext('2d');ctx.fillStyle='#000';ctx.fillRect(0,0,SIZE,SIZE);return {c,ctx};});
 const project=([x,y])=>[(x-DOMAIN.minX)/width*SIZE,(DOMAIN.maxY-y)/height*SIZE];
 function polygon(layer,points,strength){const ctx=layers[layer].ctx;ctx.globalCompositeOperation='lighten';ctx.fillStyle=`rgb(${strength},${strength},${strength})`;ctx.beginPath();points.map(project).forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();}
 let wallDeposits=0;
 for(const wall of layout.walls){
  const vertical=wall.w<wall.d,length=vertical?wall.d:wall.w;if(length<.55)continue;
  const boundary=vertical?wall.x:wall.y,center=vertical?wall.y:wall.x;
  const side=vertical?(onFloor(wall.x+.3,wall.y)?1:-1):(onFloor(wall.x,wall.y+.3)?1:-1);
  const point=(t,n)=>vertical?[boundary+side*n,t]:[t,boundary+side*n];
  // Multiple nested margins follow the same uneven runoff. Thin quiet
  // stretches interrupt wider deposits without creating separate obstacles.
  for(const [layer,scale,strength]of [[0,1,90],[0,.6,155],[2,1.2,110],[2,.45,210]]){
   const edge=[],back=[],steps=Math.max(3,Math.ceil(length/.2));
   for(let k=0;k<=steps;k++){
    const t=center-length/2+length*k/steps;
    const swell=Math.max(0,Math.sin(t*.67+boundary*.9)+.35*Math.sin(t*2.1-boundary));
    const reach=.12+scale*(.08+swell*.38+hash(Math.floor(t*8)+boundary)*.05);
    edge.push(point(t,reach));back.push(point(t,-.05));
   }
   polygon(layer,[...edge,...back.reverse()],strength);
  }
  wallDeposits++;
 }
 let drainAprons=0;
 for(const [index,w]of waters.entries())for(const end of [-1,1]){
  const world=(across,along)=>w.axis==='x'?[w.x+along,w.y+across]:[w.x+across,w.y+along];
  for(const [layer,length,strength]of [[0,1.45,125],[1,1.05,135],[2,1.8,185]]){
   const edge=[],back=[];
   for(let k=0;k<=24;k++){
    const across=-w.width/2+w.width*k/24,fan=.28+.72*Math.pow(Math.sin(k/24*Math.PI),2);
    const run=length*fan*(.7+.3*hash(k+index*37));
    edge.push(world(across,end*(w.depth/2+run)));back.push(world(across,end*(w.depth/2-.12)));
   }
   polygon(layer,[...edge,...back.reverse()],strength);
  }
  drainAprons++;
 }
 // Exposed bunker soil sheds sand along the retaining face; it thins toward
 // the real maintenance walk instead of whitening the whole district.
 for(let i=0;i<10;i++){
  const y=53+i*1.9,spread=.5+hash(i+41)*.55;
  polygon(1,[[-32,y-.65],[-31.5,y-.9],[-32+spread,y-.3],[-31.65,y+.8],[-32,y+1]],170);
 }
 // Sediment fans follow the same authored wet polygons used by the visible
 // puddles and footstep contacts. Their wider drying rims stay matte.
 for(const puddle of DRAIN_PUDDLES){
  const center=puddle.points.reduce((v,p)=>[v[0]+p[0]/puddle.points.length,v[1]+p[1]/puddle.points.length],[0,0]);
  const expand=scale=>puddle.points.map(p=>p.map((v,i)=>center[i]+(v-center[i])*scale));
  polygon(0,expand(1.23),155);polygon(1,expand(1.12),75);
  polygon(0,puddle.points,205);polygon(2,puddle.points,245);
 }
 for(const runnel of DRAIN_RUNNELS){polygon(0,runnelPolygon(runnel,3),190);polygon(2,runnelPolygon(runnel,1.5),235);}
 // Rust/silt collars sit around the real pump skid feet rather than random
 // floor speckles; their centers match the four machinery support castings.
 for(const side of [-1,1])for(const dz of [-.91,.76]){
  const x=-26+side*.64,y=43-dz;
  const points=Array.from({length:12},(_,i)=>{const a=i/12*Math.PI*2,r=.27+hash(i+side*17+dz)*.055;return [x+Math.cos(a)*r,y+Math.sin(a)*r];});
  polygon(0,points,210);polygon(1,points,80);
 }
 const canvas=document.createElement('canvas');canvas.width=canvas.height=SIZE;const ctx=canvas.getContext('2d'),packed=ctx.createImageData(SIZE,SIZE),data=layers.map(l=>l.ctx.getImageData(0,0,SIZE,SIZE).data);
 for(let i=0;i<packed.data.length;i+=4){for(let c=0;c<3;c++)packed.data[i+c]=data[c][i];packed.data[i+3]=255;}ctx.putImageData(packed,0,0);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.NoColorSpace;texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;
 return {texture,wallDeposits,drainAprons};
}

export function finishDrainGround({materials,crafted,layout,waters}){
 const deposits=depositMap(layout,waters);
 for(const name of ['floor','walkway']){
  // The quieter concrete field lets the metre-scale slab shape read. The
  // old broken-floor illustration had its own competing stone boundaries.
  const material=materials[name];material.map=crafted.sets.concrete.map;material.color.setHex(0xb9b9a8);shadeDrainMaterial(material);const base=material.onBeforeCompile;
  material.onBeforeCompile=s=>{
   base(s);s.uniforms.drainDepositMap={value:deposits.texture};s.uniforms.drainMudMap={value:crafted.sets.mud.map};s.uniforms.drainSandMap={value:crafted.sets.sand.map};
   s.fragmentShader=`uniform sampler2D drainDepositMap;
uniform sampler2D drainMudMap;
uniform sampler2D drainSandMap;
float groundHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
`+s.fragmentShader;
   s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`
    vec2 groundPoint=floor(vec2(drainWorld.x,-drainWorld.z)*128.)/128.;
    vec3 deposit=texture2D(drainDepositMap,(groundPoint-vec2(-36.,-4.))/vec2(64.,84.)).rgb;
    // Broad staggered slabs have individually chipped edges. The joints and
    // their inset shade remain stable across all original floor mesh seams.
    float slabRow=floor(groundPoint.y/1.16);
    vec2 slabGrid=vec2(groundPoint.x+mod(slabRow,2.)*.73,groundPoint.y);
    vec2 slabCell=floor(slabGrid/vec2(1.46,1.16));
    vec2 slabLocal=mod(slabGrid,vec2(1.46,1.16));
    vec2 slabEdge=min(slabLocal,vec2(1.46,1.16)-slabLocal);
    float edgeNoise=groundHash(floor(groundPoint*27.));
    float edgeDistance=min(slabEdge.x,slabEdge.y);
    float joint=1.-smoothstep(.016,.034+edgeNoise*.025,edgeDistance);
    float bevel=smoothstep(.025,.075,edgeDistance);
    float cellSeed=groundHash(slabCell);
    vec2 slabUV=groundPoint/2.;
    if(cellSeed>.5)slabUV=vec2(-slabUV.y,slabUV.x);
    slabUV+=vec2(cellSeed,groundHash(slabCell+17.));
    vec3 slab=texture2D(map,slabUV).rgb*(.83+cellSeed*.21)*mix(.69,1.,bevel);
    vec3 mud=texture2D(drainMudMap,groundPoint/2.).rgb*vec3(.78,.72,.60);
    vec3 sand=texture2D(drainSandMap,groundPoint/2.).rgb*vec3(.84,.78,.64);
    float mudCover=max(joint*.83,deposit.r);
    vec3 groundColor=mix(slab,mud,mudCover);
    groundColor=mix(groundColor,sand,deposit.g*.65*(1.-joint*.65));
    diffuseColor.rgb*=groundColor;
   `);
   s.fragmentShader=s.fragmentShader.replace('#include <specularmap_fragment>',`#include <specularmap_fragment>
    // Gloss belongs to runoff, joints and localized puddles. Dry slab faces
    // do not share the same specular response as the saturated bank margin.
    specularStrength*=mix(.18,.85,deposit.b);
    specularStrength=max(specularStrength,deposit.b*.12*(.5+.5*mudCover));
   `);
  };
  material.customProgramCacheKey=()=> 'drain-ground-slabs-v1';material.needsUpdate=true;
 }
 return {stats:{wallDeposits:deposits.wallDeposits,drainAprons:deposits.drainAprons,puddleMargins:DRAIN_PUDDLES.length,runnels:DRAIN_RUNNELS.length,pumpSedimentCollars:4,maskSize:SIZE,domain:DOMAIN,slabMetres:[1.46,1.16],addedGeometry:0,staticWorldCoordinates:true},dispose(){deposits.texture.dispose();}};
}
