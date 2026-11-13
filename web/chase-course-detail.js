import {BREAKABLE_PROPS} from './chase-destruction.js';
import * as THREE from './vendor/three/three.module.js';
import * as Art from './pixel-art.js';
import {COURSE,noise,pathDistance,runnerSurfaceAt,blocked} from './back-nine-course.js';
import {COURSE_GREENS} from './back-nine-landscape.js';

export const DETAIL_PLANTS=[];
function allowed(x,y){
 const p={x,y};return y>25&&y<780&&Math.abs(x)<39.7&&!blocked(p,.2)&&pathDistance(p)>3.4&&runnerSurfaceAt(p)!=='path'&&
 !BREAKABLE_PROPS.some(p=>Math.abs(x-p.x)<p.rx+.4&&Math.abs(y-p.y)<p.ry+.4)&&
 !COURSE.features.some(f=>Math.abs(x-f.x)<f.rx+.7&&Math.abs(y-f.y)<f.ry+.7)&&
 !COURSE.checkpoints.some(c=>Math.hypot(x-c.x,y-c.y)<11)&&
 !COURSE_GREENS.some(g=>((x-g.x)/(g.rx+1))**2+((y-g.y)/(g.ry+1))**2<1);
}
function cluster(x,y,seed,border){
 for(let k=0;k<(border?9:5);k++){const n=Math.round(seed*17)+k+100000,px=x+(noise(n)-.5)*(border?2:1.6),py=y+(noise(n+91)-.5)*3;
  if(!allowed(px,py))continue;
  DETAIL_PLANTS.push({x:px,y:py,h:(border?.35:.16)+noise(n+8)*(border?.65:.32),type:border?(n%6):n%3,turn:noise(n+11)*Math.PI,seed:n});
 }
}
for(let y=30;y<780;y+=4.8)for(const side of [-1,1])cluster(side*(37.3+noise(y)*1.2),y,y+side*91,true);
for(const route of COURSE.paths)for(let i=1;i<route.length;i++){
 const a=route[i-1],b=route[i],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);
 for(let d=3;d<length;d+=7)for(const side of [-1,1]){const t=d/length,offset=4.5+noise(d+a[1])*1.8;cluster(a[0]+dx*t+dy/length*side*offset,a[1]+dy*t-dx/length*side*offset,Math.round(a[1]*11+d+side),false);}
}

// Level 1's original six high-resolution verge illustrations, on fixed crossed
// geometry. One atlas/material, no billboards or new navigation obstacles.
export async function buildCourseDetail({put,box,cylinder,mat,yieldCpuPreparation,software=false}){
 const source=await Art.source('rough-cut-verge-atlas-v1'),map=Art.texture('rough-cut-verge-atlas-v1');
 const material=mat('plantCourse',0xb8c9af,map,software),time={value:0},wind={value:1},range={value:new THREE.Vector2(software?24:48,software?32:60)},contact={value:new THREE.Vector3(1000,0,1000)};
 material.side=THREE.DoubleSide;material.alphaTest=.28;material.emissive?.setHex(0x060b05);
 const headLight={value:new THREE.Vector4(0,0,0,0)},mowerLight={value:new THREE.Vector4(0,0,0,0)};
 const baseCompile=material.onBeforeCompile;
 material.onBeforeCompile=s=>{baseCompile(s);s.uniforms.vergeRange=range;s.uniforms.vergeTime=time;s.uniforms.vergeWind=wind;s.uniforms.vergeContact=contact;
  s.vertexShader='varying float vergeDistance;attribute float vergeTip;uniform float vergeTime;uniform float vergeWind;uniform vec3 vergeContact;\n'+s.vertexShader;
  if(software){
   s.uniforms.vergeHead=headLight;s.uniforms.vergeMower=mowerLight;
   s.vertexShader='uniform vec4 vergeHead;uniform vec4 vergeMower;varying vec3 vergeLight;\n'+s.vertexShader;
   s.vertexShader=s.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
    float dh=length(transformed-vergeHead.xyz),dm=length(transformed-vergeMower.xyz);
    float lh=vergeHead.w*pow(max(0.0,1.0-pow(dh/16.0,4.0)),2.0)/max(1.0,dh*dh);
    float lm=vergeMower.w*pow(max(0.0,1.0-pow(dm/40.0,4.0)),2.0)/max(1.0,dm*dm);
    vergeLight=min(vec3(1.6),vec3(.19,.23,.22)+vec3(.7,.7,.4)*lh+vec3(1.0,.015,.006)*lm);`);
   s.fragmentShader='varying vec3 vergeLight;\n'+s.fragmentShader;
   s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\ndiffuseColor.rgb*=vergeLight;');
  }
  s.vertexShader=s.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvergeDistance=length(mvPosition.xyz);');
  s.fragmentShader='varying float vergeDistance;uniform vec2 vergeRange;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <alphatest_fragment>','diffuseColor.a*=1.0-smoothstep(vergeRange.x,vergeRange.y,vergeDistance);\n#include <alphatest_fragment>');
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   float bend=vergeTip*vergeTip*vergeWind;
   transformed.x+=bend*(.055*sin(vergeTime*1.2+position.x*.8+position.z*.37)+.025*sin(vergeTime*2.1+position.z));
   vec2 away=position.xz-vergeContact.xz;float push=(1.0-smoothstep(.7,3.0,length(away)))*vergeContact.y;
   transformed.xz+=normalize(away+vec2(.001))*push*vergeTip*.35;
   transformed.y-=push*vergeTip*.22;`);
 };
 material.customProgramCacheKey=()=> 'back-nine-level-one-verge-v2'+(software?'-vertex-lit':'');
 const crops=[[0,100,420,475],[420,90,415,485],[835,100,419,475],[0,665,420,480],[420,665,415,480],[835,665,419,480]];
 let stones=0;
 for(const [i,p]of DETAIL_PLANTS.entries()){
  for(const turn of [0,Math.PI/2]){
   const h=p.h*(turn?.82:1),g=new THREE.PlaneGeometry(h*.8,h,1,3),pos=g.attributes.position,uv=g.attributes.uv,tip=[];
   const crop=crops[p.type];for(let v=0;v<pos.count;v++){const t=uv.getY(v);tip.push(t);pos.setZ(v,Math.sin(t*Math.PI*.7)*h*.12);uv.setXY(v,(crop[0]+uv.getX(v)*crop[2])/source.width,1-(crop[1]+(1-t)*crop[3])/source.height);}
   g.setAttribute('vergeTip',new THREE.Float32BufferAttribute(tip,1));g.computeVertexNormals();put(g,'plantCourse',p.x,h*.5,-p.y,1,1,1,p.turn+turn);g.dispose();
  }
  if(i%31===0){const g=new THREE.IcosahedronGeometry(1,0);put(g,'stone',p.x,.045,-p.y,.16,.09,.12,p.turn);g.dispose();stones++;}
  if(i%100===0)await yieldCpuPreparation();
 }
 // Flush drainage grates and worn stone joints give maintained lanes a scale.
 let drains=0;
 for(const w of COURSE.wet){const x=w.x-w.r*.72,y=w.y+2;
  box('stone',x,.045,-y,.8,.07,.42);for(let k=0;k<6;k++)box('iron',x-.3+k*.12,.085,-y,.065,.015,.31);drains++;
 }
 // Existing pump cabinets gain service fittings rather than unrelated clutter.
 for(const p of COURSE.machinery){
  const x=p.x,z=-p.y;for(let n=0;n<3;n++){const ring=new THREE.TorusGeometry(.28+n*.035,.025,5,18);put(ring,'rubber',x-.65,1.05,z+.66);ring.dispose();}
  box('iron',x-.65,1.05,z+.72,.13,.13,.05);box('paint',x+.44,1.34,z+.59,.32,.38,.05);
  for(const a of [-1,1])box('brass',x+.44+a*.1,1.34,z+.63,.025,.23,.02);
  for(const a of [-1,1])for(const h of [.35,1.7])put(cylinder,'rust',x+a*.7,h,z+.59,.035,.04,.035);
 }
 return {update(run,reduced,actor,head,mower){if(head)headLight.value.set(head.position.x,head.position.y,head.position.z,head.intensity);if(mower)mowerLight.value.set(mower.position.x,mower.position.y,mower.position.z,mower.intensity);time.value=run.time;wind.value=reduced?0:1;contact.value.set(actor.x,reduced?0:Math.min(1,Math.abs(actor.speed)/5),-actor.y);},stats:()=>({plants:DETAIL_PLANTS.length,cards:DETAIL_PLANTS.length*2,stones,drains,atlas:'level-one-verge',wind:wind.value})};
}
