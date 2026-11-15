// Dedicated high-resolution turf is lit in the same world as Level 1 art.
// Preserve its albedo in shadow: the old constant floor erased the blades.
export function finishBackNineSurface(material,name,wetMasks=null){
 const turf=name==='grass'||name==='mown',sand=name==='sand';
 // Cut turf must keep the same authored albedo and moonlit floor as the
 // surrounding ground. Only untouched grass is replaced by the flood sheet.
 if(name==='mown')wetMasks=null;
 material.onBeforeCompile=s=>{
  if(turf){
   s.vertexShader='varying float vGrowth;varying vec2 vTurfMeters;\n'+s.vertexShader;
   s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
    vec2 turfMeters=(modelMatrix*vec4(transformed,1.0)).xz;
    vTurfMeters=turfMeters;
    vGrowth=.5+.25*sin(turfMeters.x*.39+sin(turfMeters.y*.13))+.25*cos(turfMeters.y*.29-turfMeters.x*.17);
   `);
   s.fragmentShader='varying float vGrowth;varying vec2 vTurfMeters;\n'+s.fragmentShader;
   if(wetMasks){s.uniforms.wetMasks=wetMasks;s.fragmentShader='uniform vec3 wetMasks[3];\n'+s.fragmentShader;}
   s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`
    ${wetMasks?`// Opaque flooded turf replaces this surface. Reject its hidden
    // dry layer before texture/light work; retain the outer seam underneath.
    for(int wetZone=0;wetZone<3;wetZone++)if(wetMasks[wetZone].z>0.0){
     vec2 wetDelta=vTurfMeters-wetMasks[wetZone].xy;
     if(dot(wetDelta,wetDelta)<wetMasks[wetZone].z*wetMasks[wetZone].z)discard;
    }`:''}
    #ifdef USE_MAP
     vec3 turfTexel=texture2D(map,vMapUv).rgb;
     // Slightly desaturate the authored albedo before the cool night lighting.
     // One source sample retains full pixel detail even on software drivers.
     float turfLuma=dot(turfTexel,vec3(.25,.6,.15));
     diffuseColor.rgb*=(mix(turfTexel,vec3(turfLuma),.3)*2.05+vec3(.018))*mix(.9,1.12,vGrowth);
    #endif
   `);
  }
  if(!turf)s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\ndiffuseColor.rgb=pow(max(diffuseColor.rgb,vec3(0.0)),vec3(.65));');
  if(sand){
   s.vertexShader='varying vec2 vSandMeters;\n'+s.vertexShader;
   s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvSandMeters=(modelMatrix*vec4(transformed,1.0)).xz;');
   s.fragmentShader='varying vec2 vSandMeters;\n'+s.fragmentShader;
   s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    vec2 rakePoint=vSandMeters;
    float rakePhase=rakePoint.y*15.0+rakePoint.x*2.1+.7*sin(rakePoint.x*.65);
    float rakeWidth=max(fwidth(rakePhase),.055);
    float groove=1.0-smoothstep(.10,.10+rakeWidth,abs(fract(rakePhase)-.5));
    float rakeFade=1.0-smoothstep(.16,.65,rakeWidth);
    diffuseColor.rgb*=1.0-.16*groove*rakeFade;
   `);
  }
  s.fragmentShader=s.fragmentShader.replace('#include <opaque_fragment>',`
   ${turf?'outgoingLight=max(outgoingLight,diffuseColor.rgb*vec3(.34,.40,.43));':''}
   vec3 pixelShade=floor(sqrt(max(outgoingLight,vec3(0.0)))*96.0+.5)/96.0;
   outgoingLight=pixelShade*pixelShade;
   #include <opaque_fragment>
  `);
 };
 material.customProgramCacheKey=()=> 'back-nine-source-surfaces-v3'+(turf?'-turf'+(wetMasks?'-wet-mask':''):sand?'-sand':'');
}
