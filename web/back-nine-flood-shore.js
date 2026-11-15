// Keep the dry underlayer in the translucent margin. The central discard
// remains comfortably inside the fully opaque part of every shoreline phase.
export const FLOOD_DRY_CULL_RATIO=.62;
export const floodShoreGLSL=`
 float bankOffset=clamp(vFloodPocket-.70,-.30,.30)*.18;
 float shore=1.0-smoothstep(.70+bankOffset,.93+bankOffset,radial);
 float dampFringe=1.0-smoothstep(.84,1.0,radial);
 diffuseColor.a=shore+(1.0-shore)*dampFringe*.32;
`;

// CPU counterpart for coverage audits, including the culled dry-core region.
export function floodShoreOpacity(radial,pocket){
 const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
 const bankOffset=Math.max(-.30,Math.min(.30,pocket-.70))*.18;
 const shore=1-smooth(.70+bankOffset,.93+bankOffset,radial);
 const fringe=1-smooth(.84,1,radial);
 return shore+(1-shore)*fringe*.32;
}
