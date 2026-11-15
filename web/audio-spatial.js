// Metre-based source placement with optional legacy axis scaling for other chapters.
export function sourcePosition(listener,source,{yaw=0,height=1.65,sourceHeight=1,xScale=1,range=30,occluded=false}={}){
 const x=(source.x-listener.x)*xScale,y=source.y-listener.y,z=sourceHeight-height;
 const distance=Math.hypot(x,y,z),pan=Math.sin(Math.atan2(x,y)-yaw);
 return {distance,pan:Math.max(-1,Math.min(1,pan)),gain:Math.max(0,1-distance/range)*(occluded?.35:1)};
}
