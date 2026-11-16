import * as THREE from './vendor/three/three.module.js';

// Soft coverage masks shared by Night Order's water and air effects, in one
// strip: 0 streaked droplet, 1 mist puff, 2 broken ripple ring, 3 splash crown,
// 4 round glow, 5 light shaft, 6 lamp beam, 7 clipping, 8 fog bank. Only
// coverage is stored; every instance is tinted by the light that reaches it.
export const SOFT_DROP=0,SOFT_PUFF=1,SOFT_RING=2,SOFT_CROWN=3,SOFT_GLOW=4,SOFT_SHAFT=5,SOFT_BEAM=6,SOFT_FLECK=7,SOFT_FOG=8;
const CELLS=9;
let shared=null,users=0;
function masks(){
 const width=CELLS*64,canvas=document.createElement('canvas');canvas.width=width;canvas.height=64;
 const g=canvas.getContext('2d',{willReadFrequently:true}),image=g.createImageData(width,64),soft=(v,w)=>Math.exp(-(v/w)*(v/w)),step=(a,b,v)=>{const t=Math.min(1,Math.max(0,(v-a)/(b-a)));return t*t*(3-2*t);};
 for(let y=0;y<64;y++)for(let x=0;x<width;x++){
  const cell=x>>6,px=((x&63)-31.5)/31.5,py=(31.5-y)/31.5,r=Math.hypot(px,py),angle=Math.atan2(py,px),edge=Math.min(1,Math.max(0,(1-Math.max(Math.abs(px),Math.abs(py)))*8));
  let a=0;
  if(cell===SOFT_DROP){
   // The leading head is up (+v); a thinning tail trails behind it.
   const tail=Math.max(0,(py+1)/1.45);
   a=py>.45?soft(py-.45,.3)*soft(px,.46):Math.pow(tail,1.6)*soft(px,.16+.3*tail);
  }else if(cell===SOFT_PUFF){
   const lobe=.82+.10*Math.sin(angle*3+.7)+.06*Math.cos(angle*5);
   a=Math.pow(Math.max(0,1-r/lobe),1.7)*(.72+.28*Math.sin(px*5+1)*Math.sin(py*4+2));
  }else if(cell===SOFT_RING){
   a=soft(r-.74,.075)*(.5+.5*Math.max(0,Math.sin(angle*3+1)*Math.cos(angle*5-.6)+.55))+soft(r-.42,.05)*.28;
  }else if(cell===SOFT_CROWN){
   a=soft(px,.42)*soft(py+.78,.2)*.7;
   for(let i=0;i<7;i++){const lean=(i-3)*.33,reach=.72+.5*Math.abs(Math.sin(i*2.3)),cx=Math.sin(lean)*reach*.8,cy=-.8+Math.cos(lean)*reach*1.5;a+=soft(px-cx,.085)*soft(py-cy,.13)*.95+soft(px-cx*.55,.07)*soft(py-(-.8+(cy+.8)*.55),.22)*.4;}
  }else if(cell===SOFT_GLOW){
   a=Math.pow(Math.max(0,1-r),2.4);
  }else if(cell===SOFT_SHAFT){
   // A slanting column of lit air: soft sides, fading out at both ends.
   a=soft(px,.42)*step(-1,-.35,py)*step(1,.1,py)*(.72+.28*Math.sin(px*7+1.3)*Math.sin(px*17));
  }else if(cell===SOFT_BEAM){
   // The lamp is at the bottom edge; the beam widens and thins away from it.
   const t=(py+1)/2,half=.07+.78*t;
   a=soft(px,half*.62)*Math.pow(1-t,1.25)*Math.min(1,t*7)*(1+.9*soft(t,.16));
  }else if(cell===SOFT_FLECK){
   a=step(.5,.3,Math.abs(px))*step(.92,.6,Math.abs(py));
  }else{
   // A low bank: dense along the ground, torn into drifting wisps above.
   const lift=.22*Math.sin(px*4.1+.6)+.12*Math.sin(px*9.3+2),top=py-lift,wisps=.62+.38*Math.sin(px*5.2+py*2.4+1)*Math.sin(px*2.1-py*5.3);
   a=Math.pow(Math.max(0,1-px*px),1.6)*step(-1,-.62,py)*step(.78,-.3,top)*wisps;
  }
  const v=Math.round(Math.min(1,a)*edge*255),i=(y*width+x)*4;image.data[i]=image.data[i+1]=image.data[i+2]=v;image.data[i+3]=255;
 }
 g.putImageData(image,0,0);const texture=new THREE.CanvasTexture(canvas);texture.magFilter=texture.minFilter=THREE.LinearFilter;texture.generateMipmaps=false;return texture;
}

// One pooled draw of soft quads. Callers begin(camera), place instances, then
// finish(); nothing is allocated while a frame is being filled.
export function createSoftSprites(parent,{name='SoftSprites',capacity=128,blend='normal',order=3,fog=true,dither=0}={}){
 shared||=masks();users++;
 const geometry=new THREE.PlaneGeometry(1,1),data=new THREE.InstancedBufferAttribute(new Float32Array(capacity*2),2);data.setUsage(THREE.DynamicDrawUsage);geometry.setAttribute('softData',data);
 // 'add' is light in the air; 'light' multiplies the surface behind it, so a
 // lamp pool brings up the texture it falls on instead of painting over it.
 const blending=blend==='add'?{blending:THREE.AdditiveBlending}:blend==='light'?{blending:THREE.CustomBlending,blendEquation:THREE.AddEquation,blendSrc:THREE.DstColorFactor,blendDst:THREE.OneFactor,blendSrcAlpha:THREE.ZeroFactor,blendDstAlpha:THREE.OneFactor,premultipliedAlpha:true}:{};
 const material=new THREE.MeshBasicMaterial({color:0xffffff,alphaMap:shared,transparent:true,depthWrite:false,side:THREE.DoubleSide,fog,...blending});
 material.onBeforeCompile=shader=>{
  shader.vertexShader='attribute vec2 softData;\nvarying float vSoftAlpha;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>',`#include <uv_vertex>\nvAlphaMapUv=vec2((uv.x+softData.y)*${(1/CELLS).toFixed(4)},uv.y);vSoftAlpha=softData.x;`);
  shader.fragmentShader='varying float vSoftAlpha;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <alphamap_fragment>','#include <alphamap_fragment>\ndiffuseColor.a*=vSoftAlpha;'+(dither>0?`\nif(diffuseColor.a>0.0)diffuseColor.a=max(0.0,diffuseColor.a+(fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))))-.5)*${dither.toFixed(4)});`:''));
 };
 // The scene target holds linear 8-bit colour, where a broad dark gradient
 // falls into visible contour steps. A fixed screen-space grain breaks them.
 material.customProgramCacheKey=()=> 'course-soft-sprites-v1-'+dither;material.forceSinglePass=true;
 const mesh=new THREE.InstancedMesh(geometry,material,capacity);mesh.name=name;mesh.count=0;mesh.visible=false;mesh.frustumCulled=false;mesh.renderOrder=order;mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);parent.add(mesh);
 // Allocate instance colors before shader preparation, including idle starts.
 mesh.setColorAt(0,new THREE.Color(0xffffff));mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
 const matrices=mesh.instanceMatrix.array,colors=mesh.instanceColor.array,values=data.array;
 let count=0,cx=0,cy=0,cz=0,rx=1,ry=0,rz=0,ux=0,uy=1,uz=0;
 function begin(camera){const e=camera.matrixWorld.elements;rx=e[0];ry=e[1];rz=e[2];ux=e[4];uy=e[5];uz=e[6];cx=e[12];cy=e[13];cz=e[14];count=0;}
 // A quad at (x,y,z) spanned by two edge vectors.
 function put(x,y,z,ax,ay,az,bx,by,bz,r,g,b,alpha,cell){
  if(count>=capacity||!(alpha>.004))return;
  const m=count*16,c=count*3,d=count*2;
  matrices[m]=ax;matrices[m+1]=ay;matrices[m+2]=az;matrices[m+3]=0;matrices[m+4]=bx;matrices[m+5]=by;matrices[m+6]=bz;matrices[m+7]=0;
  matrices[m+8]=ay*bz-az*by;matrices[m+9]=az*bx-ax*bz;matrices[m+10]=ax*by-ay*bx;matrices[m+11]=0;matrices[m+12]=x;matrices[m+13]=y;matrices[m+14]=z;matrices[m+15]=1;
  colors[c]=r;colors[c+1]=g;colors[c+2]=b;values[d]=alpha;values[d+1]=cell;count++;
 }
 const billboard=(x,y,z,w,h,r,g,b,alpha,cell)=>put(x,y,z,rx*w,ry*w,rz*w,ux*h,uy*h,uz*h,r,g,b,alpha,cell);
 // Upright: turns about the vertical only, so looking up or down never tips it.
 function upright(x,y,z,w,h,r,g,b,alpha,cell){const dx=cx-x,dz=cz-z,d=Math.hypot(dx,dz)||1;put(x,y,z,dz/d*w,0,-dx/d*w,0,h,0,r,g,b,alpha,cell);}
 const flat=(x,y,z,w,h,turn,r,g,b,alpha,cell)=>{const c=Math.cos(turn),s=Math.sin(turn);put(x,y,z,c*w,0,-s*w,-s*h,0,-c*h,r,g,b,alpha,cell);};
 // Lies along (dx,dy,dz) and turns about that axis to face the eye. `anchor`
 // 0 centres the quad on the point; 1 starts it there.
 function along(x,y,z,dx,dy,dz,width,length,r,g,b,alpha,cell,anchor=0,minimum=.0034){
  const size=Math.hypot(dx,dy,dz)||1;dx/=size;dy/=size;dz/=size;
  if(anchor){x+=dx*length*.5*anchor;y+=dy*length*.5*anchor;z+=dz*length*.5*anchor;}
  const ex=cx-x,ey=cy-y,ez=cz-z,distance=Math.hypot(ex,ey,ez),sx=dy*ez-dz*ey,sy=dz*ex-dx*ez,sz=dx*ey-dy*ex,side=Math.hypot(sx,sy,sz)||1;
  // Never thinner than about a pixel and a half: distant streaks fade, not flicker.
  const thin=distance*minimum,w=Math.max(width,thin)/side;
  put(x,y,z,sx*w,sy*w,sz*w,dx*length,dy*length,dz*length,r,g,b,alpha*Math.min(1,width/(thin||1)+.35),cell);
 }
 function finish(){
  mesh.count=count;mesh.visible=count>0;if(!count)return 0;
  const im=mesh.instanceMatrix,ic=mesh.instanceColor;
  im.clearUpdateRanges();im.addUpdateRange(0,count*16);im.needsUpdate=true;ic.clearUpdateRanges();ic.addUpdateRange(0,count*3);ic.needsUpdate=true;data.clearUpdateRanges();data.addUpdateRange(0,count*2);data.needsUpdate=true;
  return count;
 }
 function dispose(){mesh.removeFromParent();geometry.dispose();material.dispose();if(--users<=0&&shared){shared.dispose();shared=null;users=0;}}
 return {mesh,material,capacity,begin,put,billboard,upright,flat,along,finish,dispose,count:()=>count,eyeDistance:(x,y,z)=>Math.hypot(cx-x,cy-y,cz-z)};
}
