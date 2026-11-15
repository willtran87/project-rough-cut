import * as THREE from './vendor/three/three.module.js';
import {structureEdges} from './under-green-structure.js';
import {shadeDrainMaterial} from './under-green-crafted-surfaces.js';
import {buildBunkerBankFaces} from './under-green-bunker-bank-face.js';

export const isBunkerRetainingWall=wall=>!wall.covered&&wall.x<-12;
const hash=n=>{const x=Math.sin(n*91.17+37.4)*19843.19;return x-Math.floor(x);};

// The continuous backing stays closed. Individually shaped coping stones and
// localized soil spills change the visible transition, never the floor hull.
export function buildBunkerRetainingFinish({layout,materials,box,put}){
 const edges=structureEdges(layout.tiles).filter(e=>e.kind==='retaining'&&(e.axis==='x'?e.line:(e.start+e.end)/2)<-12);
 const bankFaces=buildBunkerBankFaces({edges,put});
 const coping=materials.bunkerStone.clone();coping.color.setHex(0xc2bba3);coping.vertexColors=true;coping.userData.drainWorldUV=true;
 shadeDrainMaterial(coping,{wall:true});materials.bunkerCoping=coping;
 const mortar=materials.pumpStone.clone();mortar.color.setHex(0x8b8069);mortar.userData.drainWorldUV=true;shadeDrainMaterial(mortar,{wall:true});materials.bunkerMortar=mortar;
 const bounds=new THREE.Box3(),parts=[],stones=[],deposits=[],repairs=[];
 function emit(edge,g,type,depthBack,tint=1,uvOffset=[0,0]){
  const pos=g.attributes.position;
  // A shaped replacement stone samples one stone face, not a second brick
  // wall. Keep its illustrated perimeter aligned with its physical perimeter.
  let stoneUV=null;
  if(type==='bunkerCoping'){
   g.computeBoundingBox();const b=g.boundingBox,size=b.getSize(new THREE.Vector3());
   const faces=[[130,5,240,50],[493,5,183,50],[109,628,277,48],[189,690,239,48]];
   const [sx,sy,sw,sh]=faces[Math.floor(hash(b.min.x*11+b.min.y*23+edge.line*7)*faces.length)];
   const image=materials[type].map?.image,tw=image?.width||1254,th=image?.height||1254,repeat=materials[type].map?.repeat;
   stoneUV=new Float32Array(pos.count*2);
   for(let i=0;i<pos.count;i++){
    const u=(pos.getX(i)-b.min.x)/size.x,v=(pos.getY(i)-b.min.y)/size.y;
    // Narrow repair stones take a physical-size window from the same source.
    const sampleWidth=Math.min(sw,size.x*313.5),sampleHeight=Math.min(sh,size.y*313.5);
    stoneUV[i*2]=(sx+(sw-sampleWidth)*.5+u*sampleWidth)/tw/(repeat?.x||.5);
    stoneUV[i*2+1]=(1-(sy+(sh-sampleHeight)*.5+(1-v)*sampleHeight)/th)/(repeat?.y||.5);
   }
  }
  // Outward edge.side belongs to the solid exterior; the dressed face points in.
  const inward=-edge.side;
  for(let i=0;i<pos.count;i++){
   const u=pos.getX(i),h=pos.getY(i),d=depthBack+pos.getZ(i);
   pos.setXYZ(i,edge.axis==='x'?edge.line+inward*d:u,h,-(edge.axis==='x'?u:edge.line+inward*d));
  }
  // Mapping u/depth to x/z reverses handedness on two orientations.
  if((edge.axis==='x'?inward:-inward)<0){
   const indices=g.index?Array.from(g.index.array):Array.from({length:pos.count},(_,i)=>i);for(let i=0;i<indices.length;i+=3)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];g.setIndex(indices);
  }
  g.computeVertexNormals();
  const uv=new Float32Array(pos.count*2),normal=g.attributes.normal;
  for(let i=0;i<pos.count;i++){const nx=Math.abs(normal.getX(i)),ny=Math.abs(normal.getY(i)),nz=Math.abs(normal.getZ(i));uv[i*2]=(nx>ny&&nx>nz?pos.getZ(i):pos.getX(i))/2+uvOffset[0];uv[i*2+1]=(ny>nx&&ny>nz?pos.getZ(i):pos.getY(i))/2+uvOffset[1];}
  g.setAttribute('uv',new THREE.BufferAttribute(stoneUV||uv,2));g.userData.preserveDrainUV=true;
  if(materials[type].vertexColors&&!g.attributes.color){const colors=new Float32Array(pos.count*3);for(let i=0;i<pos.count;i++)colors.set([tint,tint*.987,tint*.962],i*3);g.setAttribute('color',new THREE.BufferAttribute(colors,3));}
  g.computeBoundingBox();bounds.union(g.boundingBox);parts.push({type,vertices:pos.count,triangles:(g.index?.count||pos.count)/3,min:g.boundingBox.min.toArray(),max:g.boundingBox.max.toArray()});
  // A local anchor keeps material/cell batches near their actual light sources.
  const anchor=g.boundingBox.getCenter(new THREE.Vector3());g.translate(-anchor.x,-anchor.y,-anchor.z);
  put(g,type,anchor.x,anchor.y,anchor.z);g.dispose();
 }
 function prism(edge,outline,type,depthBack,depthFront,tint=1,uvOffset=[0,0]){
  const shape=new THREE.Shape();outline.forEach(([u,h],i)=>i?shape.lineTo(u,h):shape.moveTo(u,h));shape.closePath();
  emit(edge,new THREE.ExtrudeGeometry(shape,{depth:depthFront-depthBack,bevelEnabled:false,curveSegments:1}),type,depthBack,tint,uvOffset);
 }
 function soilMound(edge,outline,along,low,top,width){
  const curve=new THREE.CatmullRomCurve3(outline.map(([u,h])=>new THREE.Vector3(u,h,0)),true,'centripetal');
  const contour=Array.from({length:32},(_,i)=>{const p=curve.getPoint(i/32),n=(hash(i*13+along*19)-.5)*.035;return [THREE.MathUtils.clamp(p.x+n,along-width/2,along+width/2),THREE.MathUtils.clamp(p.y+n*.6,low,top)];});
  const center=[along,(top+low)/2+(top-low)*.13],positions=[],indices=[],colors=[];
  const rings=[[1,.1105,.77],[.91,.121,.80],[.63,.144,.84],[.27,.148,.86]];
  for(const [r,depth,tint]of rings)for(const [u,h]of contour){positions.push(center[0]+(u-center[0])*r,center[1]+(h-center[1])*r,depth);colors.push(tint,tint*.987,tint*.962);}
  const frontCenter=positions.length/3;positions.push(center[0],center[1],.146);colors.push(.84,.83,.81);
  const backStart=positions.length/3;for(const [u,h]of contour){positions.push(u,h,.105);colors.push(.69,.68,.66);}
  const backCenter=positions.length/3;positions.push(center[0],center[1],.105);colors.push(.69,.68,.66);
  for(let j=0;j<32;j++){
   const next=(j+1)%32;
   for(let r=0;r<rings.length-1;r++){const a=r*32+j,b=r*32+next,c=(r+1)*32+next,d=(r+1)*32+j;indices.push(a,b,c,a,c,d);}
   indices.push(96+j,96+next,frontCenter,backStart+next,backStart+j,backCenter,j,backStart+j,backStart+next,j,backStart+next,next);
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setIndex(indices);
  emit(edge,g,'mudBank',0);
 }
 for(const edge of edges){
  const seed=edge.line*13+edge.start*7+edge.side*31;
  let at=edge.start,index=0;
  while(at<edge.end-.0001){
   const candidate=Math.min(edge.end,at+.60+hash(seed+index*19)*.49),next=edge.end-candidate<.35?edge.end:candidate,lo=at+.006,hi=next-.006;
   const left=1.915+hash(seed+index*23)*.085,right=left+(hash(seed+index*29)-.5)*.035;
   const bottom=1.775+(hash(seed+index*11)-.5)*.025,ch=.016+hash(seed+index*17)*.018;
   const outline=[[lo,bottom+.012],[lo+ch,bottom],[hi-ch,bottom],[hi,bottom+.012],[hi,right-.018],[hi-ch,right],[lo+ch,left],[lo,left-.021]];
   prism(edge,outline,'bunkerCoping',-.13,.126+hash(seed+index*13)*.018,.79+hash(seed+index*37)*.19);
   stones.push({axis:edge.axis,line:edge.line,side:edge.side,start:lo,end:hi,top:[left,right],bottom});
   at=next;index++;
  }
 }
 // Each spill begins in an exposed soil bank and trails over the coping. The
 // large asymmetrical tongues interrupt masonry courses in selected bays only.
 const spills=[
  ['west-south','x',-32,56.9,1.5,1.24],['west-well','x',-32,62.8,1.8,1.43],['west-north','x',-32,69.9,1.15,1.62],
  ['inner-south','x',-28,58.4,1.3,1.46],['inner-north','x',-28,65.6,1.85,1.12],['south-return','y',52,-29.1,1.3,1.48],
  ['main-west','x',-23,61.6,1.45,1.36],['main-east','x',-17,64.6,1.1,1.58]
 ];
 for(const [id,axis,line,along,width,low]of spills){
  const edge=edges.find(e=>e.axis===axis&&e.line===line&&along-width/2>=e.start&&along+width/2<=e.end);if(!edge)throw Error('Unsupported bunker spill '+id);
  const top=2.12,span=top-low;
  const outline=[[-.5,top],[-.49,top-.11],[-.37,top-.20],[-.29,low+.23*span],[-.15,low+.12*span],[-.05,low],[.05,low+.04],[.10,low+.24*span],[.23,low+.39*span],[.34,top-.21],[.49,top-.10],[.5,top]].map(([u,h])=>[along+u*width,h]);
  soilMound(edge,outline,along,low,top,width);
  deposits.push({id,axis,line,along,width,low,top,maximumIntrusion:.148});
 }
 // Two old repairs use a stepped mortar bed and individually seated stones.
 // No holes are cut in the original wall or its conservative occluder.
 for(const [id,line,along,h,width]of [['inner-repair',-28,60.8,.93,1.55],['main-repair',-17,60.4,1.0,1.22]]){
  const edge=edges.find(e=>e.axis==='x'&&e.line===line&&along-width/2>e.start&&along+width/2<e.end);if(!edge)throw Error('Unsupported bunker repair '+id);
  const outline=[[-.45,-.385],[.35,-.385],[.35,-.135],[.5,-.135],[.5,.135],[.39,.135],[.39,.385],[-.23,.385],[-.23,.135],[-.5,.135],[-.5,-.135],[-.45,-.135]].map(([u,v])=>[along+u*width,h+v]);
  prism(edge,outline,'bunkerMortar',.109,.122);
  for(const [a,b,v,count]of [[-.45,.35,-.25,3],[-.5,.5,0,4],[-.23,.39,.25,2]])for(let i=0;i<count;i++){
   const w=(b-a)*width/count-.018,t=.232,x=along+a*width+(i+.5)*(b-a)*width/count,y=h+v,points=[[x-w/2,y-t/2+.007],[x-w/2+.012,y-t/2],[x+w/2,y-t/2],[x+w/2,y+t/2-.013],[x+w/2-.016,y+t/2],[x-w/2,y+t/2]];
   prism(edge,points,'bunkerCoping',.12,.143,.9+hash(i+v*15)*.08,[.137+i*.051,.23+v*.13]);
  }
  repairs.push({id,axis:'x',line,along,width,height:h,maximumIntrusion:.143});
 }
 return {edges:edges.length,bankFaces,replacedMetalCaps:layout.walls.filter(isBunkerRetainingWall).length,stones,deposits,repairs,parts,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},maximumIntrusion:.231,opaqueBacking:true,newTextures:0,newLights:0,addedColliders:0,dispose(){coping.dispose();mortar.dispose();}};
}
