// Two fixed lamp sources. At a selection boundary the departing/arriving
// source has zero weight, so swapping slots cannot move a lit source abruptly.
export function lampInfluences(player,lamps){
 const ranked=lamps.map((lamp,index)=>({...lamp,index,distance:Math.hypot(player.x-lamp.x,player.y-lamp.y)})).sort((a,b)=>a.distance-b.distance||a.index-b.index);
 const cutoff=ranked[2]?.distance??Infinity;
 return ranked.slice(0,2).map(lamp=>({...lamp,weight:Math.min(1,Math.max(0,(cutoff-lamp.distance)/3))}));
}
