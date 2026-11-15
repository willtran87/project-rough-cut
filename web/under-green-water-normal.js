// These horizontal water surfaces author wave slopes in their own X/Z axes.
// Phong lighting consumes view-space normals. Three already uploads this
// per-mesh matrix; using it directly avoids two extra interpolated vectors
// across the large water surfaces. These materials have no normal/bump maps.
export function applyHorizontalWaterNormal(shader,xSlope,zSlope){
 shader.fragmentShader='uniform mat3 normalMatrix;\n'+shader.fragmentShader;
 shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_begin>',`#include <normal_fragment_begin>
  normal=normalize(normalMatrix*vec3((${xSlope}),1.,(${zSlope})));
  #ifdef FLIP_SIDED
   normal=-normal;
  #endif
  #ifdef DOUBLE_SIDED
   normal*=faceDirection;
  #endif
 `);
}
