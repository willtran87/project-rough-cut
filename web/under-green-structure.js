import {GATE_ROOF_SLOT} from './under-green-layout.js';
import {isExposedBunkerEdge} from './under-green-bunker-layout.js';
function gateOwnsRoofEdge(edge){
 return edge.kind==='roof-edge'&&edge.axis==='y'&&Math.abs(edge.line-GATE_ROOF_SLOT.y)<GATE_ROOF_SLOT.d/2&&
  edge.start>=GATE_ROOF_SLOT.x-GATE_ROOF_SLOT.w/2&&edge.end<=GATE_ROOF_SLOT.x+GATE_ROOF_SLOT.w/2;
}
// Structural seams come from the rendered floor union, not a second corridor map.
// Coordinates are physical metres; these pieces do not change walkable space.
export function structureEdges(tiles) {
 const edges=new Map(),round=n=>Math.round(n*1e6)/1e6;
 for(const tile of tiles)for(const axis of ['x','y'])for(const side of [-1,1]){
  const along=axis==='x'?'y':'x',length=axis==='x'?tile.d:tile.w;
  const line=round(tile[axis]+side*(axis==='x'?tile.w:tile.d)/2);
  const start=round(tile[along]-length/2),end=round(tile[along]+length/2);
  const key=[axis,line,start,end].join(':');
  if(!edges.has(key))edges.set(key,{axis,line,start,end,tiles:[],side});
  edges.get(key).tiles.push(tile);
 }
 const groups=new Map();
 for(const edge of edges.values()){
  const outside=edge.tiles.length===1&&!edge.tiles[0].covered;
  const portal=edge.tiles.length===2&&edge.tiles[0].covered!==edge.tiles[1].covered;
  if(!outside&&!portal)continue;
  const kind=outside?'retaining':'roof-edge',key=[kind,edge.axis,edge.line,outside?edge.side:0].join(':');
  if(!groups.has(key))groups.set(key,[]);
  groups.get(key).push({...edge,kind});
 }
 const result=[];
 for(const segments of groups.values()){
  segments.sort((a,b)=>a.start-b.start);let current;
  for(const segment of segments){
   if(current&&Math.abs(current.end-segment.start)<1e-5)current.end=segment.end;
   else {current={kind:segment.kind,axis:segment.axis,line:segment.line,start:segment.start,end:segment.end,side:segment.side};result.push(current);}
  }
 }
 return result;
}

export function buildUnderGreenStructure({layout,box}) {
 const edges=structureEdges(layout.tiles);
 for(const edge of edges){
  if(gateOwnsRoofEdge(edge))continue; // The split hoist frame owns this opening.
  const {axis,line,start,end}=edge,length=end-start;
  const x=axis==='x'?line:(start+end)/2,y=axis==='y'?line:(start+end)/2;
  const piece=(type,height,tall,thickness=.22,offset=0)=>box(type,
   x+(axis==='x'?offset:0),height,-y-(axis==='y'?offset:0),
   axis==='x'?thickness:length,tall,axis==='y'?thickness:length);
  if(edge.kind==='roof-edge'){
   // A deep reveal hides the thin roof cut and joins the covered space to its shaft.
   piece('iron',4.08,.3,.34);
   piece('steel',3.91,.05,.36);
   continue;
  }
  if(isExposedBunkerEdge(edge)){
   // The existing outer wall holds the bank at foot level. Its actual layered
   // sand/soil/turf is visible above, rather than hidden behind a duplicate wall.
   const count=Math.ceil(length/3);
   for(let i=0;i<=count;i++)box('wood',line-.025,2.5,-(start+length*i/count),.12,1.2,.13);
   continue;
  }
  const bunker=x<-12;
  // Existing 1.8m masonry is the foundation; upper banks sit directly on it.
  piece(bunker?'sand':'rangeStone',2.91,2.06);
  piece(bunker?'soil':'iron',4.02,.16,.28);
  piece('grass',5.05,.18,.46,edge.side*.10);
  if(bunker)piece('soil',3.43,.12,.235);
  // Timber shoring in sand; painted ribs at the abandoned range. Bases remain
  // within the existing wall clearance and nothing crosses a walking opening.
  const count=Math.max(1,Math.ceil(length/3));
  for(let i=0;i<=count;i++){
   const at=start+length*i/count;
   box(bunker?'wood':'steel',axis==='x'?line:at,2.99,-(axis==='y'?line:at),.25,2.3,.25);
  }
 }
 return {retainingEdges:edges.filter(e=>e.kind==='retaining').length,roofEdges:edges.filter(e=>e.kind==='roof-edge'&&!gateOwnsRoofEdge(e)).length,gateRoofEdges:edges.filter(gateOwnsRoofEdge).length};
}
