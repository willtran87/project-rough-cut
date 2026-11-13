// Furniture is fixed to the refuge coordinates; the same bounds drive the
// constructed bodies, player collision, sight and ball flight.
export function refugeFurniture(refuges){
 const at=(refuge,id,x,y,w,d,h,kind)=>{const s=refuges.find(r=>r.id===refuge);return {id,refuge,x:s.x+x,y:s.y+y,w,d,h,kind,bodyTop:kind==='bench'?.96:kind==='starter'?.84:h};};
 return [
  at('bunker','bunker-grit-chest',-3.5,2.9,1.1,.7,.95,'grit'),
  at('pump','pump-service-bench',1.1,3.25,2.5,.72,1.24,'bench'),
  at('pump','pump-tool-board',1.1,3.6,2.24,.16,2.15,'tools'),
  at('pump','pump-hose-rack',-4,0,.3,1.15,1.9,'hose'),
  at('pavilion','pavilion-starter-cabinet',-4.25,2.7,.72,2.4,1.1,'starter'),
 ];
}

// A low cupboard is not a solid wall up to the tallest object on its top.
// Keep separate raised bounds for the spare valve, tins, papers and cup.
export function refugeFurnitureSolids(furniture){
 const solids=[];
 for(const f of furniture){
  solids.push({...f,h:['bench','starter'].includes(f.kind)?f.bodyTop+.009:f.h,bottom:f.kind==='hose'?.425:f.kind==='tools'?1.43:0});
  const add=(name,x,y,w,d,height,bottomOffset=0)=>solids.push({id:f.id+'-'+name,x:f.x+x,y:f.y+y,w,d,bottom:f.bodyTop+bottomOffset,h:f.bodyTop+height});
  if(f.kind==='bench'){add('spare-valve',-.67,0,.68,.27,.28,-.01);add('tool-tray',.13,0,.57,.37,.075);add('parts-tin',.88,.03,.38,.32,.214);}
  if(f.kind==='starter'){add('card-box',0,.67,.45,.65,.182);add('cup',0,-.60,.28,.28,.248);add('cards',.08,-.05,.38,.30,.04);}
  if(f.kind==='hose')for(const side of [-1,1])solids.push({id:f.id+'-coupling-'+side,x:f.x+.07,y:f.y+side*.22,w:.092,d:.092,bottom:.33,h:.83});
 }
 return solids;
}
