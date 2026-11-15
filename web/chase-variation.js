// Run-local variation is a stable lookup, not a shared random stream. Drawing
// an extra frame or choosing dialogue cannot change Joe's next decision.
export function validVariationSeed(value){return Number.isInteger(value)&&value>=0&&value<=0xffffffff;}
export function nextVariationSeed(previous=0,random=globalThis.crypto){
 let value=0;
 try{const words=new Uint32Array(1);random.getRandomValues(words);value=words[0];}catch{value=(Date.now()^Math.floor((globalThis.performance?.now()||0)*1000))>>>0;}
 if(!value||value===previous)value=((previous>>>0)+0x9e3779b9)>>>0||1;
 return value;
}
export function createVariation(seed=0,segment=0){return {seed:validVariationSeed(seed)?seed:0,segment,segmentAt:0,choices:0};}
export function variationChoice(run,channel,key=0,count=2){
 const seed=run.variation?.seed;if(!seed)return 0;
 let h=(seed^Math.imul((run.checkpoint||0)+1,0x9e3779b9))>>>0;
 for(let i=0;i<channel.length;i++)h=Math.imul(h^channel.charCodeAt(i),16777619);
 h^=Math.imul(key|0,0x85ebca6b);h=Math.imul(h^(h>>>16),0x7feb352d);h=Math.imul(h^(h>>>15),0x846ca68b);
 return ((h^(h>>>16))>>>0)%count;
}
export function enterVariationSegment(run){
 const v=run.variation;if(!v)return;v.segment=run.checkpoint;v.segmentAt=run.time;v.choices=0;
}
export function searchProbeSide(run,observation,legacySearches=0){
 if(!run.variation?.seed)return legacySearches%2?-1:1;
 // Only remembered evidence contributes; hidden position and steering never do.
 const cell=Math.imul(Math.round(observation.x/6),73856093)^Math.imul(Math.round(observation.y/6),19349663);
 return variationChoice(run,'search-side',cell)?-1:1;
}
export function commitmentPreference(run,commitment){
 const seeded=!!run.variation?.seed,count=seeded?run.variation.choices:commitment.count;
 const first=variationChoice(run,'opening-tactic')?'pass':'lane';
 const kind=count?(commitment.kind==='lane'?'pass':'lane'):first;
 const offset=variationChoice(run,'passing-side')*2;
 return {kind,side:(count+offset)%4<2?1:-1};
}
export function cloudDelay(run){return [0,9,17][variationChoice(run,'cloud-offset',0,3)];}
