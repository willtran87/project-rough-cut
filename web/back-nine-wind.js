// One world-space gust reaches cloth, verges, hedge tips and the canopy.
// Each material keeps its own small flutter, but the broad motion agrees.
// Wind is world motion: it keeps blowing under Reduced motion, which calms
// only the camera, shake and flashes.
export const backNineGust=(time,x,z)=>.68+.22*Math.sin(time*.82-x*.16-z*.07)+.10*Math.sin(time*1.67-(x*.16+z*.07)*.4);
export const gustGLSL=clock=>`float backNineGust(vec2 p){float phase=dot(p,vec2(.16,.07));return .68+.22*sin(${clock}*.82-phase)+.10*sin(${clock}*1.67-phase*.4);}`;
export function createBackNineWind(){
 const time={value:0},motion={value:1};
 return {padding:.4,update(run){time.value=run.time||0;motion.value=1;},
  applyTree(material){const compile=material.onBeforeCompile,key=material.customProgramCacheKey();
   material.onBeforeCompile=function(s,r){compile.call(this,s,r);s.uniforms.treeGustTime=time;s.uniforms.treeGustMotion=motion;
    s.vertexShader='uniform float treeGustTime;uniform float treeGustMotion;\n'+gustGLSL('treeGustTime')+'\n'+s.vertexShader;
    s.vertexShader=s.vertexShader.replace('#include <beginnormal_vertex>',`#include <beginnormal_vertex>
     vec2 treeAnchor=(modelMatrix*instanceMatrix*vec4(0.0,0.0,0.0,1.0)).xz;
     float treeHeight=clamp((position.y-.6)/7.4,0.0,1.0);
     float treeScale=max(.1,length(instanceMatrix[0].xyz));
     vec3 treeDirection=normalize(vec3(1.0,0.0,.18)*mat3(instanceMatrix));
     float treeBend=treeGustMotion*(.30*backNineGust(treeAnchor)+.045*sin(treeGustTime*2.1+treeAnchor.x*.7+treeAnchor.y*.4))/treeScale;
     objectNormal.y-=treeBend*2.0*treeHeight/7.4*dot(objectNormal,treeDirection);
    `);
    s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed+=treeDirection*treeBend*treeHeight*treeHeight;');
   };material.customProgramCacheKey=()=>key+'-back-nine-tree-gust-v2';
  },stats:()=>({time:time.value,motion:motion.value,maxCanopyBend:.345,worldField:true})};
}
