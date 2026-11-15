// Finishes belong to the material's function, including the wheel submeshes.
// Existing illustrated maps remain the base. Wear is anchored to object-space
// pixels, so it follows the machine and stays fixed as the camera moves.
export function mowerSurfaceKind(name){
  return ({RedEnamel:'enamel',Engine:'engine',Steel:'steel',Brass:'brass',Rubber:'rubber'})[name]||null;
}
export function mowerSurfaceLight(kind){
  return ({enamel:{specular:0x443c36,shininess:22},engine:{specular:0x242b28,shininess:12},steel:{specular:0x788c91,shininess:48},brass:{specular:0x706044,shininess:30}})[kind]||null;
}
export function finishMowerSurface(shader,kind){
  shader.vertexShader='varying vec3 vMowerSurface;varying vec3 vMowerNormal;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvMowerSurface=position;vMowerNormal=normal;');
  shader.fragmentShader=`varying vec3 vMowerSurface;varying vec3 vMowerNormal;
    float mowerCluster(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
  `+shader.fragmentShader;
  const shared=`
    vec3 mowerP=floor(vMowerSurface*192.0)/192.0;
    vec3 mowerN=abs(vMowerNormal);
    vec2 mowerUV=mowerN.y>mowerN.x&&mowerN.y>mowerN.z?mowerP.xz:mowerN.x>mowerN.z?mowerP.zy:mowerP.xy;
    vec3 mowerFootprint=fwidth(vMowerSurface);
    float mowerDetail=1.0-smoothstep(.008,.025,max(mowerFootprint.x,max(mowerFootprint.y,mowerFootprint.z)));
    float mowerGrain=mix(.6,mowerCluster(floor(mowerUV*96.0)),mowerDetail);
    float mowerWear=0.0;
  `;
  const finish={
    enamel:`
      float rim=max(abs(mowerP.x)/.427,abs(mowerP.z+.919)/.455);
      float edge=smoothstep(.73,.94,rim)*(.25+.75*(1.0-smoothstep(.15,.27,mowerP.y)));
      vec2 cell=floor(mowerUV*38.0);
      float wearCell=mowerCluster(cell);
      float chip=step(.77,wearCell)*step(.30,mowerGrain)*edge;
      float scrape=step(.955,mowerCluster(vec2(floor(mowerP.x*72.0),floor(mowerP.z*9.0))))*edge;
      mowerWear=max(chip,scrape);
      vec3 exposed=mix(vec3(.045,.023,.012),vec3(.065,.075,.068),step(.94,wearCell));
      diffuseColor.rgb=mix(diffuseColor.rgb,exposed,mowerWear*.88);
      float lower=1.0-smoothstep(.14,.25,mowerP.y);
      diffuseColor.rgb*=1.0-lower*(.18+.15*mowerGrain);
    `,
    engine:`
      float soot=(1.0-smoothstep(.15,.35,mowerP.y))*(.7+.3*mowerGrain);
      diffuseColor.rgb*=.88-soot*.20;
      mowerWear=soot*.6;
    `,
    steel:`
      float scuff=step(.91,mowerCluster(floor(mowerP.xy*vec2(65.0,18.0))+floor(mowerP.z*30.0)));
      diffuseColor.rgb*=.86+scuff*.26;
      mowerWear=(1.0-scuff)*.24;
    `,
    brass:`diffuseColor.rgb*=.78+.22*step(.42,mowerGrain);mowerWear=.22;`,
    rubber:`diffuseColor.rgb*=.80+.16*step(.55,mowerGrain);`
  }[kind]||'';
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n'+shared+finish);
  shader.fragmentShader=shader.fragmentShader.replace('#include <specularmap_fragment>','#include <specularmap_fragment>\nspecularStrength*=1.0-mowerWear*.8;');
}
