import {gustGLSL} from './back-nine-wind.js';
import {noise} from './back-nine-course.js';

// A closed, uneven clipped hedge, with connected terminal growth. All geometry
// stays inside the original solid sight-break footprint; no alpha cards are
// relied on to conceal the player from Joe.
export function buildWindbreakGrowth(THREE,s){
 const positions=[],indices=[],uvs=[],flex=[];let shoots=0,leaves=0;
 function point(x,y,z){positions.push(x,y,z);uvs.push(0,0);flex.push(0);return positions.length/3-1;}
 function face(a,b,c){indices.push(a,b,c);}
 const length=s.ry*2-.3,steps=Math.ceil(length/.85),section=[[-1,.18],[-1,1.42],[-.94,2.25],[-.72,2.61],[0,2.76],[.72,2.61],[.94,2.25],[1,1.42],[1,.18]];
 const crown=z=>.09*Math.sin(z*.77+s.y)+.065*Math.cos(z*1.83+s.y*.3);
 const width=z=>s.rx*(.82+.025*Math.sin(z*1.1+s.y)+.025*Math.cos(z*2.3));
 const cross=(x,y,z)=>new THREE.Vector3(x*width(z),y+(y>.2?crown(z)*Math.min(1,(y-.2)/2):0),z);
 for(let i=0;i<=steps;i++){
  const z=-length/2+length*i/steps;
  for(const[x,y]of section){const p=cross(x,y,z);point(p.x,p.y,p.z);}
 }
 const n=section.length;
 for(let i=0;i<steps;i++){
  for(let j=0;j<n-1;j++){const k=j+1,a=i*n+j,b=i*n+k,c=(i+1)*n+j,d=(i+1)*n+k;face(a,c,b);face(b,c,d);}
  // Separate the underside normals from the upright wall. Sharing these
  // vertices would project the ground-facing texture up the hedge's base.
  const ids=[i*n+n-1,i*n,(i+1)*n+n-1,(i+1)*n].map(id=>point(...positions.slice(id*3,id*3+3)));
  face(ids[0],ids[2],ids[1]);face(ids[1],ids[2],ids[3]);
 }
 for(const end of [0,steps]){
  const z=-length/2+length*end/steps,center=point(0,1.4,z);
  const ring=section.map(([x,y])=>{const p=cross(x,y,z);return point(p.x,p.y,p.z);});
  for(let j=0;j<n;j++){const a=ring[j],b=ring[(j+1)%n];if(end===0)face(center,a,b);else face(center,b,a);}
 }
 const coreVertices=positions.length/3,coreIndices=indices.length;
 function solid(points,faces){const ids=points.map(p=>point(p.x,p.y,p.z));for(const f of faces)face(...f.map(i=>ids[i]));}
 function shoot(base,normal,id){
  shoots++;const tangent=new THREE.Vector3(normal.z,0,-normal.x).normalize();if(tangent.lengthSq()<.1)tangent.set(1,0,0);
  const direction=new THREE.Vector3(0,1,0).addScaledVector(normal,.55).addScaledVector(tangent,(noise(id)-.5)*.9).normalize();
  const reach=.20+noise(id+1)*.12,end=base.clone().addScaledVector(direction,reach),side=tangent.clone().multiplyScalar(.007),depth=normal.clone().multiplyScalar(.006);
  const first=positions.length;
  solid([base.clone().add(side),base.clone().sub(side),base.clone().add(depth),end.clone().add(side),end.clone().sub(side),end.clone().add(depth)],[[0,2,1],[3,4,5],[0,1,4],[0,4,3],[1,2,5],[1,5,4],[2,0,3],[2,3,5]]);
  for(let j=0;j<5;j++){
   leaves++;const sign=j%2?1:-1,root=base.clone().addScaledVector(direction,reach*(.16+j*.18));
   const axis=direction.clone().multiplyScalar(.45).addScaledVector(tangent,sign*.8).addScaledVector(normal,.25).normalize();
   const across=new THREE.Vector3().crossVectors(axis,normal).normalize(),l=.12+noise(id+j*11)*.07,w=.035+noise(id+j*17)*.025;
   const mid=root.clone().addScaledVector(axis,l*.48);
   solid([root,mid.clone().addScaledVector(across,w),root.clone().addScaledVector(axis,l),mid.clone().addScaledVector(across,-w),mid.clone().addScaledVector(normal,.011),mid.clone().addScaledVector(normal,-.004)],[[4,0,1],[4,1,2],[4,2,3],[4,3,0],[5,1,0],[5,2,1],[5,3,2],[5,0,3]]);
  }
  // Translate a complete connected shoot inward if its leaf tips reach the
  // collision boundary. Never clamp individual vertices into broken leaves.
  let minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity;
  for(let i=first;i<positions.length;i+=3){minX=Math.min(minX,positions[i]);maxX=Math.max(maxX,positions[i]);minZ=Math.min(minZ,positions[i+2]);maxZ=Math.max(maxZ,positions[i+2]);}
  const dx=maxX>s.rx-.025?s.rx-.025-maxX:minX< -s.rx+.025?-s.rx+.025-minX:0;
  const dz=maxZ>s.ry-.025?s.ry-.025-maxZ:minZ< -s.ry+.025?-s.ry+.025-minZ:0;
  for(let i=first;i<positions.length;i+=3){flex[i/3]=Math.min(1,Math.hypot(positions[i]-base.x,positions[i+1]-base.y,positions[i+2]-base.z)/.45);positions[i]+=dx;positions[i+2]+=dz;}
 }
 for(let i=0,z=-length/2+.55;z<length/2-.3;i++,z+=1.25){
  for(const side of [-1,1])for(let row=0;row<2;row++){
   const id=s.y*131+i*53+row*19+side*7,zp=z+(noise(id)-.5)*.45,y=(row?2.04:.95)+(noise(id+4)-.5)*.48;
   const x=side*(y>1.42?1-(y-1.42)/(.83)*.06:1);
   shoot(cross(x,y,zp),new THREE.Vector3(side,.20,0).normalize(),id);
  }
  const id=s.y*71+i*97,x=(noise(id)-.5)*.85;
  shoot(cross(x,2.76-Math.abs(x)*.21,z),new THREE.Vector3(x*.3,1,0).normalize(),id);
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setAttribute('windbreakFlex',new THREE.Float32BufferAttribute(flex,1));geometry.setIndex(indices);geometry.computeVertexNormals();geometry.computeBoundingBox();
 geometry.userData.windbreak={shoots,leaves,coreVertices,coreIndices};
 return geometry;
}

export function finishWindbreakSurface(material){
 const time={value:0},wind={value:0},compile=material.onBeforeCompile,key=material.customProgramCacheKey();
 material.onBeforeCompile=function(shader,renderer){
  compile.call(this,shader,renderer);shader.uniforms.windbreakTime=time;shader.uniforms.windbreakWind=wind;
  shader.vertexShader='uniform float windbreakTime;\n'+gustGLSL('windbreakTime')+'\n'+'attribute float windbreakFlex;uniform float windbreakWind;varying vec3 hedgeSurfacePoint;varying vec3 hedgeSurfaceNormal;varying vec3 hedgeShade;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   hedgeSurfacePoint=position;hedgeSurfaceNormal=normal;
   float crown=smoothstep(.2,2.8,position.y);
   float cluster=.5+.25*sin(position.x*2.1+position.z*.8)+.25*sin(position.z*2.7-position.y*1.3);
   hedgeShade=mix(vec3(.67,.74,.72),vec3(1.06,1.08,.98),crown)*mix(.9,1.06,cluster);
   float bend=windbreakFlex*windbreakFlex*windbreakWind*backNineGust(position.xz);
   transformed.x+=bend*.012*sin(windbreakTime*1.2+position.z*.37+position.x*.8);
   transformed.z+=bend*.009*sin(windbreakTime*.9+position.z*.53);
  `);
  shader.fragmentShader='varying vec3 hedgeSurfacePoint;varying vec3 hedgeSurfaceNormal;varying vec3 hedgeShade;\n'+shader.fragmentShader;
  // Blend projections per fragment, as in Level 1, so rounded shoulders and
  // leaf folds never stretch a different projection across a whole triangle.
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`
   vec3 hedgeWeights=abs(normalize(hedgeSurfaceNormal));hedgeWeights*=hedgeWeights;hedgeWeights*=hedgeWeights;hedgeWeights/=max(dot(hedgeWeights,vec3(1.0)),.001);
   vec3 hedgePoint=hedgeSurfacePoint/.7;
   vec4 hedgeTexel=texture2D(map,hedgePoint.zy)*hedgeWeights.x+texture2D(map,hedgePoint.xz)*hedgeWeights.y+texture2D(map,hedgePoint.xy)*hedgeWeights.z;
   diffuseColor*=hedgeTexel;diffuseColor.rgb*=hedgeShade;
  `);
  shader.fragmentShader=shader.fragmentShader.replace('vec3 pixelShade=floor(',`outgoingLight=max(outgoingLight,diffuseColor.rgb*vec3(.12,.16,.17));
   vec3 pixelShade=floor(`);
 };
 material.customProgramCacheKey=()=>key+'-windbreak-leaf-v1';
 return {update(run,reducedMotion){time.value=run.time||0;wind.value=reducedMotion?0:1;},stats:()=>({time:time.value,wind:wind.value,texture:'level-one-hedge',projection:'triplanar'})};
}
