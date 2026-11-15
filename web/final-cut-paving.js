// Stone flags laid in a half bond. Coordinates are in world metres, including
// on the sloped overlook ramps, so separate structural batches share joints.
// This is surface finish only: the existing slabs remain the walking geometry.
export const PAVING_FINISH={width:.72,depth:.48,joint:.014,pixel:.003};
export const pavingShader=`
varying vec3 vPavingPoint;
varying float vPavingTop;
vec4 coursePaving(sampler2D stoneMap,vec2 point){
 vec2 size=vec2(.72,.48);
 float row=floor(point.y/size.y);
 vec2 bond=vec2(point.x+mod(row,2.0)*size.x*.5,point.y);
 vec2 cell=floor(bond/size);
 vec2 local=mod(bond,size);
 // Fixed per-stone phase and a six-value palette break the old repeated
 // crack islands without adding camera-dependent noise or texture layers.
 vec2 phase=fract(sin(vec2(dot(cell,vec2(12.9898,78.233)),dot(cell,vec2(39.346,11.135))))*43758.5453);
 vec2 pixel=(floor(local/.003)+.5)*.003;
 vec2 uv=pixel/.8+phase;
 vec4 stone=textureGrad(stoneMap,uv,dFdx(point)/.8,dFdy(point)/.8);
 float tone=floor(phase.x*6.0)/5.0;
 stone.rgb*=mix(vec3(.91,.94,.96),vec3(1.04,1.02,.98),tone);
 float footprint=max(length(dFdx(point)),length(dFdy(point)));
 float detail=1.0-smoothstep(.018,.09,footprint);
 vec2 edge=min(pixel,size-pixel);
 // Sparse millimetre-scale losses in the exposed stone edges. These remain
 // within the mortar finish and never imply a new obstacle or missing slab.
 vec2 nick=vec2(step(abs(pixel.y-(.08+phase.x*.30)),.018),step(abs(pixel.x-(.09+phase.y*.52)),.024));
 edge-=nick*step(vec2(.68),phase)*.006;
 float distance=min(edge.x,edge.y);
 float aa=max(.001,footprint*.5);
 float face=smoothstep(.007-aa,.007+aa,distance);
 float bevel=(1.0-smoothstep(.009,.016,distance))*face*detail;
 float litEdge=step(local.x,size.x*.5)*step(edge.x,edge.y)+step(local.y,size.y*.5)*step(edge.y,edge.x);
 stone.rgb*=1.0+bevel*(litEdge*.12-.065);
 vec3 joint=stone.rgb*vec3(.48,.51,.50);
 // Subpixel joints converge on their mean coverage instead of sparkling.
 float coverage=mix(.951,face,detail);
 stone.rgb=mix(joint,stone.rgb,coverage);
 return stone;
}
`;
