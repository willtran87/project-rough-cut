import {channelShoreProfile} from './under-green-channel-shore.js';
import * as THREE from './vendor/three/three.module.js';
import {mudDepositProfile,mudWallSpans} from './under-green-mud-profile.js';
import {shadeDrainMaterial} from './under-green-crafted-surfaces.js';
import {DRAIN_PUDDLES,DRAIN_RUNNELS,runnelPolygon} from './under-green-wet-ground.js';
import {paintDrainFloorWear} from './under-green-floor-wear.js';
import {paintGalleryRootGround} from './under-green-gallery-ground.js';
import {paintGalleryRunoff} from './under-green-gallery-decay.js';
import {paintGalleryRenderWash} from './under-green-gallery-render.js';
import {paintGallerySediment} from './under-green-gallery-sediment.js';
import {finishGalleryDepositMask} from './under-green-gallery-deposit-mask.js';

const DOMAIN={minX:-36,maxX:28,minY:-4,maxY:80},SIZE=1024;
const hash=n=>{const v=Math.sin(n*127.1+19.73)*43758.5453;return v-Math.floor(v);};

// This low-frequency map records where dirt comes from, independently of the
// illustrated material's fine pixels. RGBA = mud / sand / wetness / foot wear.
// All layers use physical course coordinates, not the floor partition grid.
function depositMap(layout,waters){
 const width=DOMAIN.maxX-DOMAIN.minX,height=DOMAIN.maxY-DOMAIN.minY;
 const layers=Array.from({length:4},()=>{const c=document.createElement('canvas');c.width=c.height=SIZE;const ctx=c.getContext('2d');ctx.fillStyle='#000';ctx.fillRect(0,0,SIZE,SIZE);return {c,ctx};});
 const project=([x,y])=>[(x-DOMAIN.minX)/width*SIZE,(DOMAIN.maxY-y)/height*SIZE];
 function polygon(layer,points,strength){const ctx=layers[layer].ctx;ctx.globalCompositeOperation='lighten';ctx.fillStyle=`rgb(${strength},${strength},${strength})`;ctx.beginPath();points.map(project).forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();}
 let wallDeposits=0;
 for(const {vertical,boundary,side,start,end} of mudWallSpans(layout)){
  const length=end-start;
  const point=(t,n)=>vertical?[boundary+side*n,t]:[t,boundary+side*n];
  // Multiple nested margins follow the same uneven runoff. Thin quiet
  // stretches interrupt wider deposits without creating separate obstacles.
  for(const [layer,scale,strength]of [[0,1,90],[0,.6,155],[2,1.2,110],[2,.45,210]]){
   const edge=[],back=[],steps=Math.max(3,Math.ceil(length/.2));
   for(let k=0;k<=steps;k++){
    const t=start+length*k/steps;
    const {foot,apron}=mudDepositProfile(t,boundary,start,end,vertical);
    const reach=foot+scale*apron;
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
    edge.push(world(across,end*(w.depth/2+run)));back.push(world(across,end*((w.depth-.4)/2-channelShoreProfile(w,across,end).inset-.06)));
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
 const galleryRoots=paintGalleryRootGround(polygon),galleryRunoff=paintGalleryRunoff(polygon),galleryRenderWash=paintGalleryRenderWash(polygon),gallerySediment=paintGallerySediment(polygon),wear=paintDrainFloorWear(polygon);
 // Raw RGBA data avoids Canvas2D premultiplication destroying mud/sand/wet
 // values wherever the independent wear channel is zero.
 const packed=new Uint8Array(SIZE*SIZE*4),data=layers.map(l=>l.ctx.getImageData(0,0,SIZE,SIZE).data);
 for(let i=0;i<packed.length;i+=4)for(let c=0;c<4;c++)packed[i+c]=data[c][i];
 const galleryDepositFinish=finishGalleryDepositMask(packed,SIZE,DOMAIN);
 const texture=new THREE.DataTexture(packed,SIZE,SIZE);texture.flipY=true;texture.generateMipmaps=true;texture.needsUpdate=true;texture.colorSpace=THREE.NoColorSpace;texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;
 return {texture,wallDeposits,drainAprons,wear,galleryRoots,galleryRunoff,galleryRenderWash,gallerySediment,galleryDepositFinish};
}

export function finishDrainGround({materials,crafted,layout,waters}){
 const deposits=depositMap(layout,waters);
 for(const name of ['floor','walkway']){
  // Dedicated worn stone supplies pigment only. Slab joints, deposited mud,
  // traffic wear and saturation remain independently authored below.
  const material=materials[name];material.map=crafted.sets.floor.map;material.color.setHex(0xb9b9a8);shadeDrainMaterial(material);const base=material.onBeforeCompile;
  material.onBeforeCompile=s=>{
   s.defines={...s.defines,DRAIN_GROUND_FINISH:1};
   base(s);s.uniforms.drainDepositMap={value:deposits.texture};s.uniforms.drainMudMap={value:crafted.sets.mud.map};s.uniforms.drainSandMap={value:crafted.sets.sand.map};s.uniforms.drainMudUVScale={value:new THREE.Vector2(...crafted.sets.mud.worldTileMetres.map(m=>1/m))};s.uniforms.drainPavingUVScale={value:new THREE.Vector2(...crafted.sets.floor.worldTileMetres.map(m=>1/m))};
   s.fragmentShader=`uniform sampler2D drainDepositMap;
uniform sampler2D drainMudMap;
uniform sampler2D drainSandMap;
uniform vec2 drainMudUVScale;
uniform vec2 drainPavingUVScale;
float groundHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
`+s.fragmentShader;
   s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`
    // Match the source material density; the former128-step grid discarded
    // fine concrete/sediment pixels before texture filtering could use them.
    vec2 groundPoint=floor(vec2(drainWorld.x,-drainWorld.z)*313.5)/313.5;
    vec4 deposit=texture2D(drainDepositMap,(groundPoint-vec2(-36.,-4.))/vec2(64.,84.));
    // Broad staggered slabs have individually chipped edges. The joints and
    // their inset shade remain stable across all original floor mesh seams.
    float slabRow=floor(groundPoint.y/1.16);
    // Old courses use mixed slab stock and offset joints, rather than one
    // repeating half-bond grid. No additional per-pixel noise/hash lookup.
    float slabWidth=1.24+.52*fract(slabRow*.381966);
    vec2 slabSize=vec2(slabWidth,1.16);
    vec2 slabGrid=vec2(groundPoint.x+fract(slabRow*.618034)*slabWidth,groundPoint.y);
    vec2 slabCell=floor(slabGrid/slabSize);
    vec2 slabLocal=mod(slabGrid,slabSize);
    // Reclaimed gallery flags: unequal course depths, wide stock and shifted
    // joints. The field begins/ends on existing mortar seams, so adjoining
    // districts keep their original paving without a painted border.
    bool galleryFlags=abs(groundPoint.x)<5.1&&groundPoint.y>=4.64&&groundPoint.y<19.72;
    if(galleryFlags){
     float courseBlock=floor((groundPoint.y-4.64)/3.77);
     float courseY=groundPoint.y-4.64-courseBlock*3.77;
     float course=courseY<1.52?0.:(courseY<2.40?1.:2.);
     float courseStart=course<.5?0.:(course<1.5?1.52:2.40);
     float courseDepth=course<.5?1.52:(course<1.5?.88:1.37);
     float courseId=courseBlock*3.+course;
     float flagWidth=1.48+.68*fract(courseId*.618034+.27);
     float flagX=groundPoint.x+fract(courseId*.381966+.13)*flagWidth;
     slabSize=vec2(flagWidth,courseDepth);
     slabCell=vec2(floor(flagX/flagWidth),courseId+113.);
     slabLocal=vec2(mod(flagX,flagWidth),courseY-courseStart);
    }
    vec2 slabEdge=min(slabLocal,slabSize-slabLocal);
    float edgeNoise=groundHash(floor(groundPoint*27.));
    float edgeDistance=min(slabEdge.x,slabEdge.y);
    float joint=1.-smoothstep(galleryFlags?.009:.016,(galleryFlags?.023:.034)+edgeNoise*(galleryFlags?.014:.025),edgeDistance);
    float bevel=smoothstep(galleryFlags?.017:.025,galleryFlags?.050:.075,edgeDistance);
    float cellSeed=groundHash(slabCell);
    // Occasional replaced corners have their own mortar seam. Most slabs
    // remain intact, with wear concentrated in the historical traffic map.
    float repairEdge=slabLocal.x+slabLocal.y*.72-(.32+cellSeed*.16);
    float repair=step(.91,cellSeed)*(1.-smoothstep(-.012,.012,repairEdge));
    joint=max(joint,step(.91,cellSeed)*(1.-smoothstep(.012,.026,abs(repairEdge))));
    // Two unequal split edges cross occasional large flags. A restrained
    // mineral rim sits beside the clay-filled break; pigment is not relief.
    float splitX=cellSeed>.845?slabSize.x-slabLocal.x:slabLocal.x;
    float splitBend=slabSize.y*(.35+fract(cellSeed*11.)*.35);
    float splitPath=slabSize.x*(.25+fract(cellSeed*19.)*.20)
      +slabLocal.y*(.18+fract(cellSeed*13.)*.22)
      +max(0.,slabLocal.y-splitBend)*(fract(cellSeed*7.)*.60-.30);
    float splitDistance=abs(splitX-splitPath);
    float splitFlag=galleryFlags?step(.78,cellSeed)*(1.-step(.91,cellSeed)):0.;
    float splitJoint=splitFlag*(1.-smoothstep(.007,.022,splitDistance));
    float splitRim=splitFlag*smoothstep(.016,.026,splitDistance)*(1.-smoothstep(.026,.043,splitDistance));
    joint=max(joint,splitJoint);
    vec2 slabUV=groundPoint*drainPavingUVScale;
    if(cellSeed>.5)slabUV=vec2(-slabUV.y,slabUV.x);
    slabUV+=vec2(cellSeed,groundHash(slabCell+17.));
    vec3 slab=texture2D(map,slabUV).rgb*(.83+cellSeed*.21)*mix(.69,1.,bevel);
    slab*=mix(vec3(1.),vec3(.84,.86,.82),repair);
    slab*=1.+splitRim*.13;
    vec3 mud=texture2D(drainMudMap,groundPoint*drainMudUVScale).rgb*vec3(.78,.72,.60);
    vec3 sand=texture2D(drainSandMap,groundPoint/2.).rgb*vec3(.84,.78,.64);
    // Feet compress and smear existing sediment without polishing a bright
    // safe-route stripe. Real runoff retains its independently authored gloss.
    float mudCover=max(joint*.83,deposit.r*(1.-deposit.a*.42));
    slab*=1.-deposit.a*.16;
    // Saturation belongs to the independently authored runoff, not the fine
    // pigment noise. Dry sediment forms a lighter matte rim around the same
    // deposits; soaked stone and clay darken together beneath the water film.
    float groundWet=smoothstep(.10,.90,deposit.b);
    float drySediment=smoothstep(.28,.72,deposit.r)
      *(1.-smoothstep(.15,.65,deposit.b))*(1.-deposit.a*.35);
    vec3 groundColor=mix(slab,mud*(1.+drySediment*.12),mudCover);
    groundColor=mix(groundColor,sand,deposit.g*.65*(1.-joint*.65));
    vec3 groundSaturationTint=vec3(.67,.73,.70);
    groundColor*=mix(vec3(1.),groundSaturationTint,groundWet);
    diffuseColor.rgb*=groundColor;
   `);
   s.fragmentShader=s.fragmentShader.replace('#include <specularmap_fragment>',`#include <specularmap_fragment>
    // Gloss belongs to runoff, joints and localized puddles. Dry slab faces
    // do not share the same specular response as the saturated bank margin.
    specularStrength*=mix(.18,.85,deposit.b);
    specularStrength=max(specularStrength,deposit.b*.12*(.5+.5*mudCover));

   `);
   s.fragmentShader=s.fragmentShader.replace('#include <lights_phong_fragment>',`#include <lights_phong_fragment>
    // Broad weak response on dry paving, narrower source-dependent glints on
    // saturated films. Restrained film reflectance preserves the stone and
    // sediment beneath it. Keep the existing independent specular texture and
    // runoff masks; no albedo-derived relief or additional render pass.
    float groundReflectWet=groundWet;
    #ifdef DRAIN_FLOOD_RECEIVER
     groundReflectWet=max(groundReflectWet,receiverWet);
    #endif
    material.specularColor*=mix(.18,.65,groundReflectWet);
    material.specularShininess=mix(18.,110.,groundReflectWet);
   `);
  };
  material.customProgramCacheKey=()=> 'drain-ground-slabs-v8-gallery-flags';material.needsUpdate=true;
 }
 return {stats:{wallDeposits:deposits.wallDeposits,drainAprons:deposits.drainAprons,puddleMargins:DRAIN_PUDDLES.length,runnels:DRAIN_RUNNELS.length,pumpSedimentCollars:4,galleryRoots:deposits.galleryRoots,galleryRunoff:deposits.galleryRunoff,galleryRenderWash:deposits.galleryRenderWash,gallerySediment:deposits.gallerySediment,galleryDepositFinish:deposits.galleryDepositFinish,maskSize:SIZE,domain:DOMAIN,slabWidthRange:[1.24,1.76],slabCourseMetres:1.16,galleryPaving:{start:4.64,end:19.72,courseDepths:[1.52,.88,1.37],widthRange:[1.48,2.16],splitFlags:true},wear:deposits.wear,addedGeometry:0,staticWorldCoordinates:true},dispose(){deposits.texture.dispose();}};
}
