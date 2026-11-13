import {pavingShader} from './final-cut-paving.js';
// Fixed metre-scale projection for the course's instanced structural pieces.
// Coordinates stop at the instance's parent: moving furniture carries its grain.
// Dominant-face projection uses one texture read, keeping the pixel edges crisp.
export function finishCourseSurfaces(materials){
 const scales={ashlar:1.5,ashlarWarm:1.5,ashlarDark:1.5,ashlarMoss:1.5,coping:1.5,mortar:1.5,stone:1.7,path:1.6,gravel:3.2,wood:1.05,grass:1.9,stripe:1.9,rough:2.4,roof:1.8,slate:1.2,moss:1.7,green:.8,cream:1.2,metal:.65,dark:.7,brass:.5,red:.7};
 for(const [name,metres]of Object.entries(scales)){
  const material=materials[name],previous=material.onBeforeCompile,turf=['grass','stripe','rough'].includes(name);
  material.onBeforeCompile=shader=>{
   previous(shader);
   const timberVaryings=name==='wood'?'varying vec3 vTimberEnd;\nvarying float vTimberSeed;\n':'';
   shader.vertexShader=timberVaryings+'varying vec2 vCourseUv;\n'+shader.vertexShader;
   if(name==='path')shader.vertexShader='varying vec3 vPavingPoint; varying float vPavingTop;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
    vec4 coursePoint=vec4(position,1.0);
    vec3 courseNormal=normal;
    vec3 courseDimensions=vec3(1.0);
    #ifdef USE_INSTANCING
     coursePoint=instanceMatrix*coursePoint;
     courseDimensions=vec3(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz),length(instanceMatrix[2].xyz));
     ${name.startsWith('ashlar')?'coursePoint.xyz+=fract(sin(instanceMatrix[3].xyz*vec3(17.7,51.9,37.3))*43758.5)*12.0;':''}
     // Box faces remain axis-aligned within each instance. Normalize before
     // dominant-face choice so scale does not select an unrelated projection.
     courseNormal=normalize(mat3(instanceMatrix)*courseNormal);
    #else
     courseDimensions=vec3(length(modelMatrix[0].xyz),length(modelMatrix[1].xyz),length(modelMatrix[2].xyz));
     coursePoint.xyz*=courseDimensions;
    #endif
    vec3 courseAxis=abs(courseNormal);
    ${name==='path'?`vec4 pavingPoint=vec4(position,1.0);
     #ifdef USE_INSTANCING
      pavingPoint=instanceMatrix*pavingPoint;
     #endif
     vPavingPoint=(modelMatrix*pavingPoint).xyz;
     vPavingTop=step(.5,normalize(mat3(modelMatrix)*courseNormal).y);`:''}
    vCourseUv=(courseAxis.y>=max(courseAxis.x,courseAxis.z)?coursePoint.xz:
     courseAxis.x>courseAxis.z?coursePoint.zy:coursePoint.xy)/${metres.toFixed(2)};
    ${name==='wood'?`vec3 timberPoint=position*courseDimensions;
     vec3 timberNormal=abs(normal);
     vec2 timberCross, timberSection;
     float timberEnd;
     if(courseDimensions.y>max(courseDimensions.x,courseDimensions.z)){
      timberCross=timberPoint.xz;timberSection=courseDimensions.xz;timberEnd=step(.8,timberNormal.y);
      vCourseUv=vec2(timberPoint.y,timberNormal.x>.5?timberPoint.z:timberPoint.x)/${metres.toFixed(2)};
     }else if(courseDimensions.z>courseDimensions.x){
      timberCross=timberPoint.xy;timberSection=courseDimensions.xy;timberEnd=step(.8,timberNormal.z);
      vCourseUv=vec2(timberPoint.z,timberNormal.y>.5?timberPoint.x:timberPoint.y)/${metres.toFixed(2)};
     }else{
      timberCross=timberPoint.zy;timberSection=courseDimensions.zy;timberEnd=step(.8,timberNormal.x);
      vCourseUv=vec2(timberPoint.x,timberNormal.y>.5?timberPoint.z:timberPoint.y)/${metres.toFixed(2)};
     }
     vec2 timberPhase=vec2(.31,.67);
     #ifdef USE_INSTANCING
      timberPhase=fract(sin(instanceMatrix[3].xz*vec2(17.7,37.3))*43758.5);
     #endif
     // End faces use the two transverse dimensions, never a constant long
     // coordinate. Offset the pith so neighbouring cuts are not bullseyes.
     if(timberEnd>.5)vCourseUv=timberCross/${metres.toFixed(2)};
     vCourseUv+=timberPhase*8.0;
     vTimberEnd=vec3(timberCross-(timberPhase-.5)*timberSection*.65,timberEnd);
     vTimberSeed=timberPhase.x;`:''}`);
   shader.fragmentShader=timberVaryings+'varying vec2 vCourseUv;\n'+shader.fragmentShader;
   if(name==='path')shader.fragmentShader=pavingShader+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`
    #ifdef USE_MAP
     vec4 courseTexel=${name==='path'?'vPavingTop>.5?coursePaving(map,vPavingPoint.xz):texture2D(map,vCourseUv)':'texture2D(map,vCourseUv)'};
     ${name==='wood'?`if(vTimberEnd.z>.5){
      vec2 endPixel=(floor(vTimberEnd.xy/.003)+.5)*.003;
      float endRadius=length(endPixel*vec2(.91,1.08));
      float angle=atan(endPixel.y,endPixel.x);
      float ring=fract(endRadius*105.0+.16*sin(angle*3.0+vTimberSeed*6.28)+.09*sin(endRadius*220.0));
      float lateWood=smoothstep(.68,.82,ring)*(1.0-smoothstep(.92,1.0,ring));
      float detail=1.0-smoothstep(.002,.012,fwidth(length(vTimberEnd.xy)));
      vec2 checkDirection=vec2(cos(vTimberSeed*6.28),sin(vTimberSeed*6.28));
      float check=step(abs(dot(endPixel,vec2(-checkDirection.y,checkDirection.x))),.0018)*step(.025,dot(endPixel,checkDirection));
      vec3 cutColor=texture2D(map,vec2(.24+vTimberSeed*.13,.57)).rgb;
      courseTexel.rgb=mix(cutColor,courseTexel.rgb,.22)*(1.06-detail*(lateWood*.24+check*.32));
     }`:''}
     ${name==='dark'?'courseTexel.rgb=mix(vec3(.045),courseTexel.rgb,.28);':''}
     diffuseColor*=courseTexel;
    #endif
    diffuseColor.rgb=pow(max(diffuseColor.rgb,vec3(0.0)),vec3(${turf?'.72':'.7'}));`);
   shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','vec3 pixelShade=floor(sqrt(max(outgoingLight,vec3(0.0)))*48.0+.5)/48.0;\noutgoingLight=pixelShade*pixelShade;\n#include <opaque_fragment>');
  };
  material.customProgramCacheKey=()=>`final-cut-metric-${name}-${metres}-${turf?'turf':'solid'}-9`;
 }
 return {...scales};
}
