import * as THREE from './vendor/three/three.module.js';

// The hole bends past the pump, then returns alongside the low nursery swale.
// This is short maintained turf: only the existing tall sectors conceal a player.
export const FAIRWAY_PROFILE=[
 {y:4,x:-2,w:6},{y:18,x:4,w:16},{y:26,x:13,w:18},
 {y:32,x:19,w:8},{y:44,x:19,w:8},{y:58,x:16,w:10},
 {y:60,x:16,w:10},{y:68,x:-3,w:10},{y:80,x:-3,w:10},{y:84,x:0,w:12}
];
export const FINISH_GREEN={x:0,y:88,rx:8,ry:5,collar:1.15};
export function fairwaySection(y){
 if(y<4||y>84)return null;
 const i=FAIRWAY_PROFILE.findIndex(p=>p.y>=y),b=FAIRWAY_PROFILE[Math.max(1,i)],a=FAIRWAY_PROFILE[Math.max(0,i-1)];
 const t=(y-a.y)/(b.y-a.y),u=t*t*(3-2*t);
 return {x:a.x+(b.x-a.x)*u,w:a.w+(b.w-a.w)*u};
}

function split(poly,a,b){
 const inside=[],outside=[],side=p=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
 for(let i=0;i<poly.length;i++){
  const p=poly[i],q=poly[(i+1)%poly.length],d=side(p),e=side(q);
  (d>=0?inside:outside).push(p);
  if((d>=0)!==(e>=0)){const t=d/(d-e),hit=[p[0]+t*(q[0]-p[0]),p[1]+t*(q[1]-p[1])];inside.push(hit);outside.push(hit);}
 }
 return {inside,outside};
}
function subtractConvex(poly,clip){
 const parts=[];let rest=poly;
 for(let i=0;i<clip.length&&rest.length>=3;i++){const s=split(rest,clip[i],clip[(i+1)%clip.length]);if(s.outside.length>=3)parts.push(s.outside);rest=s.inside;}
 return parts;
}

export function createFinalCutCourseContour(scene,grassMaterial){
 const positions=[],colors=[],smoothness=[],g=FINISH_GREEN;
 const palette={outside:'#a6b294',fringe:'#b6c39f',stripeA:'#ced7b4',stripeB:'#bdcba5',green:'#d9dec0'};
 function polygon(points,name,smooth=0){
  const color=new THREE.Color(palette[name]);
  // Positive x/y winding produces upward normals after y becomes world -z.
  for(let i=1;i<points.length-1;i++)for(const p of [points[0],points[i],points[i+1]]){
   positions.push(p[0],.006,-p[1]);colors.push(color.r,color.g,color.b);smoothness.push(smooth);
  }
 }
 const ellipse=(rx,ry)=>Array.from({length:64},(_,i)=>{const a=i*Math.PI/32;return [g.x+Math.cos(a)*rx,g.y+Math.sin(a)*ry];});
 const outer=ellipse(g.rx+g.collar,g.ry+g.collar),inner=ellipse(g.rx,g.ry);
 function groundPatch(points,name,smooth){
  for(const part of points.some(p=>p[1]>g.y-g.ry-g.collar)?subtractConvex(points,outer):[points])polygon(part,name,smooth);
 }
 for(let y=4;y<100;y+=2){
  const a=fairwaySection(y),b=fairwaySection(y+2);
  if(!a||!b){groundPatch([[-24,y],[24,y],[24,y+2],[-24,y+2]],'outside',0);continue;}
  const edges=p=>[-24,p.x-p.w/2-.65,p.x-p.w/2,p.x+p.w/2,p.x+p.w/2+.65,24],left=edges(a),right=edges(b);
  for(let k=0;k<5;k++)groundPatch([[left[k],y],[left[k+1],y],[right[k+1],y+2],[right[k],y+2]],k===2?(Math.floor(y/4)%2?'stripeA':'stripeB'):k===1||k===3?'fringe':'outside',k===2?.35:k===1||k===3?.15:0);
 }
 for(let i=0;i<64;i++){const n=(i+1)%64;polygon([outer[i],outer[n],inner[n],inner[i]],'fringe',.2);polygon([[g.x,g.y],inner[i],inner[n]],'green',.6);}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setAttribute('turfSmoothness',new THREE.Float32BufferAttribute(smoothness,1));geometry.computeVertexNormals();geometry.computeBoundingSphere();
 const material=new THREE.MeshLambertMaterial({map:grassMaterial.map,vertexColors:true,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2});
 material.onBeforeCompile=shader=>{
  grassMaterial.onBeforeCompile(shader);
  shader.vertexShader='attribute float turfSmoothness; varying float vTurfSmoothness;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvTurfSmoothness=turfSmoothness;');
  shader.fragmentShader='varying float vTurfSmoothness;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('diffuseColor*=courseTexel;','diffuseColor*=mix(courseTexel,vec4(.13,.17,.065,1.0),vTurfSmoothness*.25);');
  // Match the surrounding turf's color correction: vertex tint must enter
  // before that correction, just as the original material's diffuse tint does.
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','').replace('diffuseColor.rgb=pow','#include <color_fragment>\ndiffuseColor.rgb=pow');
 };
 material.customProgramCacheKey=()=> 'final-cut-authored-course-contour-2';
 const mesh=new THREE.Mesh(geometry,material);mesh.name='ChampionshipCourseContour';mesh.receiveShadow=true;scene.add(mesh);
 return {mesh,stats:()=>({triangles:positions.length/9,materials:1,profile:FAIRWAY_PROFILE,green:FINISH_GREEN}),dispose(){scene.remove(mesh);geometry.dispose();material.dispose();}};
}
