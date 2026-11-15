import * as THREE from './vendor/three/three.module.js';
import * as Art from './pixel-art.js';
import {pathWearPatches,PATH_WEAR_COLORS} from './course-path-wear.js';
export {paintApproachWear} from './course-approach-wear.js';

// The large atlas owns route/footing colors; this small source-art texture owns
// close turf detail. Its world scale stays constant across resolution settings.
export function detailedGroundMaterial(map) {
  const detail = Art.texture('rough-cut-course-ground-v4', [600,650,256,256], null, true);
  const litter = Art.texture('rough-cut-architecture-surfaces-v1',[1024,512,512,512],null,true);
  const material = new THREE.MeshLambertMaterial({ map });
  material.onBeforeCompile = shader => {
    shader.uniforms.turfDetail = { value: detail };
    shader.uniforms.forestDetail = { value: litter };
    shader.vertexShader='varying vec2 vGroundMeters;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvGroundMeters=(modelMatrix*vec4(transformed,1.0)).xz;');
    shader.fragmentShader = 'uniform sampler2D turfDetail;\nuniform sampler2D forestDetail;\nvarying vec2 vGroundMeters;\n' + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
      #include <map_fragment>
      vec2 p=vGroundMeters;
      float growthPatch=.5+.25*sin(p.x*.61+sin(p.y*.19))+.25*cos(p.y*.43-p.x*.24);
      vec3 turf = mix(texture2D(turfDetail,p/1.7).rgb,texture2D(turfDetail,vec2(-p.y,p.x)/2.3+vec2(.37,.19)).rgb,smoothstep(.25,.75,growthPatch));
      float grain = clamp(dot(turf, vec3(.25,.60,.15)) * 14.0, 0.0, 1.0);
      // Broad growth patches break repetition without altering the route's hue.
      diffuseColor.rgb *= mix(.81,1.20,grain)*mix(.92,1.06,growthPatch);
      float fringe=smoothstep(11.9,14.0,abs(p.x)+.16*sin(p.y*.9));
      fringe=max(fringe,smoothstep(117.8,120.1,-p.y));
      fringe=max(fringe,smoothstep(1.0,3.3,p.y));
      vec3 soil=texture2D(forestDetail,p/2.6).rgb;
      diffuseColor.rgb=mix(diffuseColor.rgb,soil*vec3(.55,.64,.57),fringe*.82);
    `);
  };
  material.customProgramCacheKey = () => 'rough-cut-source-turf-v2';
  return material;
}

export async function finishPaths(g, data, tx, ty, xScale, scale, pixelsPerMeter, cancelled=()=>false) {
  let painted=0;
  for(const mark of pathWearPatches(data,xScale,scale)){
    if(cancelled())return;
    g.fillStyle=PATH_WEAR_COLORS[mark.kind];g.beginPath();
    mark.points.forEach((p,i)=>{const x=Math.round(tx(p.x)),y=Math.round(ty(p.z));if(i)g.lineTo(x,y);else g.moveTo(x,y);});
    g.closePath();g.fill();
    if(++painted%256===0){await new Promise(resolve=>setTimeout(resolve,0));if(cancelled())return;}
  }
}
