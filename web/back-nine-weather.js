import {bindLampUniforms,lampGLSL} from './back-nine-glow-sprites.js';

// Drizzle is presentation only. The sheen below changes how paved and mown
// ground answers light; it never reads or writes grip, wet zones, irrigation
// or anything Joe senses. Flooded turf keeps its own, far stronger water.
// Applied after every other ground finish, so it may read the practical
// lamps' own contribution and gloss the ground around each lantern.
export function finishWetSheen(material,lamps,time,amount=1){
 if(!material?.isMeshLambertMaterial||material.userData.wetSheen)return false;
 material.userData.wetSheen=true;
 const compile=material.onBeforeCompile,key=material.customProgramCacheKey();
 material.onBeforeCompile=function(shader,renderer){
  compile.call(this,shader,renderer);
  if(!shader.fragmentShader.includes('#include <opaque_fragment>')||!shader.vertexShader.includes('#include <begin_vertex>'))return;
  shader.uniforms.wetTime=time;bindLampUniforms(shader.uniforms,lamps);
  shader.vertexShader='varying vec3 vWetPoint;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvWetPoint=(modelMatrix*vec4(transformed,1.0)).xyz;');
  const practical=shader.fragmentShader.includes('vec3 practicalDiffuse=');
  shader.fragmentShader='uniform float wetTime;varying vec3 vWetPoint;\n'+lampGLSL+'float wetHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\n'+shader.fragmentShader.replace('#include <opaque_fragment>',`
   {
    vec3 wetEye=normalize(cameraPosition-vWetPoint);
    vec2 wetTexel=floor(vWetPoint.xz*24.0);
    float wetGrain=wetHash(wetTexel);
    // Broad shallow films: the sheen is patchy, never a uniform gloss.
    float wetFilm=smoothstep(.34,.72,.5+.3*sin(vWetPoint.x*.9+sin(vWetPoint.z*.6))+.2*sin(vWetPoint.z*1.3-vWetPoint.x*.4));
    vec3 wetNormal=normalize(vec3((wetGrain-.5)*.22,1.0,(wetHash(wetTexel+7.3)-.5)*.22));
    float wetGrazing=pow(1.0-max(wetEye.y,0.0),5.0);
    vec3 wetLight=vec3(.034,.052,.064)*wetGrazing*(.3+.7*wetFilm);
    // A few texels flash as drops land; each lasts a fifth of a second.
    float wetTwinkle=step(.989,wetHash(wetTexel+floor(wetTime*5.0)*.61));
    for(int i=0;i<2;i++){
     vec3 toLamp;float reach=glowLampReach(i,vWetPoint,toLamp);if(reach<=0.0)continue;
     float streak=pow(max(dot(wetNormal,normalize(toLamp+wetEye)),0.0),38.0);
     wetLight+=glowLampColor[i]*reach*(streak*1.5*(.35+.65*wetFilm)+wetTwinkle*.4);
    }
    ${practical?'wetLight+=practicalDiffuse*(.4*wetFilm+.15)+vec3(1.0,.8,.5)*dot(practicalDiffuse,vec3(.3,.6,.1))*wetTwinkle*2.0;':''}
    outgoingLight+=wetLight*${amount.toFixed(2)};
   }
   #include <opaque_fragment>`);
 };
 material.customProgramCacheKey=()=>key+'-back-nine-wet-sheen-v1-'+amount.toFixed(2);material.needsUpdate=true;
 return true;
}
