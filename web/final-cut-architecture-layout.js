// Roof envelopes shared by the model and mounted roof lettering.
export const REFUGE_ARCHITECTURE=Object.freeze({
 bunker:{rise:.4,stoneCourse:.32,stoneLength:.82,roof:'slate',identity:'low protective masonry'},
 pump:{rise:.65,stoneCourse:.28,stoneLength:.6,roof:'roof',identity:'working corrugated service shelter'},
 pavilion:{rise:2.65,stoneCourse:.38,stoneLength:.74,roof:'slate',identity:'steep ceremonial timber gable'}
});

// Roof construction and airborne collision share the same pitched envelope.
// The sealed ceiling is the bottom; the triangular attic is real occupied
// volume, while the air above either slope remains open.
export function refugeRoofEnvelopes(refuges){
 return refuges.flatMap(s=>{
  const rise=REFUGE_ARCHITECTURE[s.id].rise,half=(s.w+.9)/2;
  const roof={id:s.id+'-roof',x:s.x,y:s.y,w:s.w+.9,d:s.d+.95,bottom:2.75,h:3.27+rise,roofSlope:rise/half,roofPeak:3.27+rise};
  return s.id==='pump'?[roof,{id:'pump-roof-vent',x:s.x,y:s.y,w:1.28,d:3.08,bottom:3.12+rise-.2,h:3.12+rise+.84}]:[roof];
 });
}
