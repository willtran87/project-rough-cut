// Final Cut's render tiers do not alter the shared on-foot control settings.
export const VISUAL_KEY='rough-cut.final-cut.visual.v1';
export const VISUAL_TIERS=Object.freeze({auto:2560,balanced:1600,high:1920,ultra:2560});
export function visualTier(value){return Object.hasOwn(VISUAL_TIERS,value)?value:'auto';}
export function finalCutRenderSize(w,h,{tier='auto',resolution=1,software=false}={}){
 const selected=visualTier(tier),cap=software?960:VISUAL_TIERS[selected];
 const scale=Math.max(.5,Math.min(1,Number.isFinite(resolution)?resolution:1))*Math.min(1,cap/Math.max(1,w));
 return {width:Math.max(1,Math.round(w*scale)),height:Math.max(1,Math.round(h*scale)),cap,tier:selected,softwareFallback:software};
}
