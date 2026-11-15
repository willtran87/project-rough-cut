// A small hue-preserving lift for already lit, opaque material detail. Zero
// remains zero, highlights return to unity, and water/effects keep their own
// authored response. This runs inside existing material shaders, before fog.
const strength=.42;
const smooth=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
export const drainDetailGain=value=>1+strength*smooth(.00015,.002,value)*(1-smooth(.025,.12,value));

export function createDrainTonalGrade(scene,additionalMaterials=[]){
 const candidates=new Set(additionalMaterials),hooks=new Map();
 scene.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])candidates.add(m);});
 for(const material of candidates){
  if(!material||material.transparent||material.userData.drainColorRole==='water'||!(material.isMeshPhongMaterial||material.isMeshLambertMaterial||material.isMeshStandardMaterial))continue;
  const compile=material.onBeforeCompile,key=material.customProgramCacheKey();
  hooks.set(material,[compile,material.customProgramCacheKey]);
  material.onBeforeCompile=function(shader,renderer){
   compile.call(this,shader,renderer);
   shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
    float drainDetailValue=max(outgoingLight.r,max(outgoingLight.g,outgoingLight.b));
    float drainDetailLift=1.0+${strength.toFixed(2)}*smoothstep(.00015,.002,drainDetailValue)*(1.0-smoothstep(.025,.12,drainDetailValue));
    outgoingLight*=drainDetailLift;
    #include <opaque_fragment>
   `);
  };
  material.customProgramCacheKey=()=>key+'-drain-detail-grade-v1';material.needsUpdate=true;
 }
 return {stats:()=>({materials:hooks.size,maxGain:1+strength,blackPreserved:true,waterExcluded:true,transparentExcluded:true,extraPasses:0}),dispose(){for(const [m,[compile,key]]of hooks){m.onBeforeCompile=compile;m.customProgramCacheKey=key;}hooks.clear();}};
}
