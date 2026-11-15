import {REFUGE_ARCHITECTURE} from './final-cut-architecture-layout.js';

// Close construction and distant identity use the existing pixel materials.
// Every part is fixed above the sealed ceiling; no new walkable doorway or
// player-height obstacle is implied by the ornamental shuttered gables.
export function buildFinalCutRoofDetail({refuges,mesh,unit,cylinder}){
 let pieces=0;const emit=(mat,g,x,h,z,w,d,t,rx=0,ry=0,rz=0)=>{pieces++;mesh(mat,g,x,h,z,w,d,t,null,rx,ry,rz);};
 const box=(mat,x,h,z,w,d,t,rz=0)=>emit(mat,unit,x,h,z,w,d,t,0,0,rz);
 const beam=(mat,x1,h1,x2,h2,z,width,depth)=>box(mat,(x1+x2)/2,(h1+h2)/2,z,Math.hypot(x2-x1,h2-h1),width,depth,Math.atan2(h2-h1,x2-x1));
 const pavilion=refuges.find(s=>s.id==='pavilion'),rise=REFUGE_ARCHITECTURE.pavilion.rise,peak=3.12+rise;
 for(const end of [-1,1]){
  const z=-pavilion.y+end*(pavilion.d/2+.50),half=(pavilion.w+.9)/2,slope=Math.atan2(rise,half),length=Math.hypot(half,rise);
  // Separate bargeboards, a tied king post and diagonal braces explain the
  // taller attic instead of merely stretching the old broad roof texture.
  box('cream',pavilion.x,(3.12+peak)/2,z,.15,rise+.16,.13);
  box('cream',pavilion.x,3.15,z,pavilion.w+.8,.16,.14);
  for(const side of [-1,1]){
   box('cream',pavilion.x+side*half/2,3.15+rise/2,z,length+.06,.13,.14,-side*slope);
   beam('wood',pavilion.x+side*3.1,3.25,pavilion.x+side*.28,peak-.18,z+end*.02,.14,.14);
   // Recessed paired louvres are backed shutters, not false openings.
   const x=pavilion.x+side*1.25,h=3.99;
   box('dark',x,h,z+end*.025,.92,1.08,.06);
   for(const sign of [-1,1])box('cream',x+sign*.49,h,z+end*.07,.075,1.23,.10);
   for(const y of [h-.57,h+.57])box('cream',x,y,z+end*.07,1.05,.075,.10);
   for(let k=0;k<9;k++)emit('wood',unit,x,h-.45+k*.112,z+end*.08,.87,.07,.09,end*.30);
   box('metal',x,h-.62,z+end*.095,1.12,.035,.19);
   for(const y of [h-.42,h+.42])box('metal',x+side*.44,y,z+end*.135,.045,.085,.025);
   for(let n=0;n<4;n++){
    const dx=side*(2.25+n*.62),top=peak-Math.abs(dx)/half*rise-.16;
    box('cream',pavilion.x+dx,(3.23+top)/2,z,.065,top-3.23,.08);
   }
  }
  // An unlit turned finial continues the king post through the ridge.
  box('wood',pavilion.x,peak+.19,z,.11,.55,.11);
  emit('brass',cylinder,pavilion.x,peak+.40,z,.10,.055,.10);
  emit('wood',cylinder,pavilion.x,peak+.48,z,.055,.12,.055);
 }
 const pump=refuges.find(s=>s.id==='pump'),ridge=3.12+REFUGE_ARCHITECTURE.pump.rise,z=-pump.y;
 // A squat passive ridge monitor identifies a working pump building. Its
 // curb embeds into both roof slopes, and the folded cap sheds onto them.
 box('dark',pump.x,ridge+.23,z,1.02,.86,2.88);
 for(const side of [-1,1]){
  box('roof',pump.x+side*.51,ridge-.045,z,.035,.31,2.91);
  for(let n=0;n<6;n++)box('metal',pump.x+side*.535,ridge+.13+n*.083,z,.12,.043,2.82,side*.30);
  for(const end of [-1,1])box('roof',pump.x+side*.54,ridge+.25,z+end*1.445,.075,.82,.07);
  const slope=Math.atan2(.12,.64);
  box('roof',pump.x+side*.32,ridge+.72,z,Math.hypot(.64,.12),.055,3.08,-side*slope);
  box('metal',pump.x+side*.62,ridge+.645,z,.04,.085,3.08);
 }
 for(const end of [-1,1]){
  box('roof',pump.x,ridge+.25,z+end*1.45,1.08,.82,.04);
  for(const x of [-.44,.44])for(const h of [-.05,.50])box('brass',pump.x+x,ridge+h,z+end*1.478,.025,.025,.015);
 }
 box('metal',pump.x,ridge+.795,z,.10,.045,3.08);
 return {pieces,pavilionRise:rise,pumpVent:true,newTextures:0};
}
