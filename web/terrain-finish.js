import * as THREE from './vendor/three/three.module.js';
import * as Art from './pixel-art.js';

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
  // Stable grit and irregular shoulders follow authored paths; no route changes.
  let seed = 19,painted=0;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (const path of data.paths) for (let i=1;i<path.length;i++) {
    const a={x:path[i-1].x*xScale,z:-path[i-1].y*scale},b={x:path[i].x*xScale,z:-path[i].y*scale};
    const length=Math.hypot(b.x-a.x,b.z-a.z);if(!length)continue;
    const nx=(b.z-a.z)/length,nz=(a.x-b.x)/length;
    for(let d=0;d<length;d+=.035){
      const lateral=(random()-.5)*2.2,x=a.x+(b.x-a.x)*d/length+nx*lateral,z=a.z+(b.z-a.z)*d/length+nz*lateral;
      const edge=Math.abs(lateral)>.65;
      g.fillStyle=edge?(random()>.5?'rgba(42,59,36,.42)':'rgba(108,106,64,.32)'):(random()>.55?'rgba(215,197,151,.28)':'rgba(42,40,30,.23)');
      const size=(.025+random()*.055)*pixelsPerMeter;g.fillRect(tx(x),ty(z),size*(edge?2:1),size);
      if(++painted%1024===0){await new Promise(resolve=>setTimeout(resolve,0));if(cancelled())return;}
    }
  }
}
