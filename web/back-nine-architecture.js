// Architectural craft on existing buildings: all fittings use the chapter's
// textured material batches, with no extra textures, lights or update loop.
export function buildBackNineArchitecture({THREE,box,put,cylinder,COURSE}){
 let pieces=0;const b=(...args)=>{box(...args);pieces++;},p=(...args)=>{put(...args);pieces++;};
 function beam(type,a,c,width,depth=width){
  const start=new THREE.Vector3(...a),end=new THREE.Vector3(...c),delta=end.clone().sub(start);
  const g=new THREE.BoxGeometry(width,delta.length(),depth);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize()));
  const mid=start.add(end).multiplyScalar(.5);p(g,type,mid.x,mid.y,mid.z);g.dispose();
 }
 function pipe(x,z,top,bottom,side){
  p(cylinder,'iron',x,(top+bottom)/2,z,.055,top-bottom,.055);
  for(let h=bottom+.4;h<top;h+=1.7){b('iron',x,h,z-.055,.22,.065,.16);b('brass',x+.08,h,z+.035,.025,.025,.025);}
  beam('iron',[x,bottom,z],[x+side*.28,bottom-.2,z+.18],.105);
  // Short irregular overflow stains are attached to the wall, below a joint.
  for(let n=0;n<4;n++)b('rubber',x+.08+n*.055,top-1.3-n*.21,z-.075,.028,1.2-n*.19,.012);
 }
 function window(x,h,z,width=2.5){
  // The existing glass remains behind projecting jambs/reveal shadows.
  for(const side of [-1,1]){
   b('stone',x+side*(width/2+.045),h,z,.13,2.64,.26);
   b('wood',x+side*(width/2-.15),h,z+.03,.07,2.2,.18);
   b('iron',x+side*.9,h-.97,z+.18,.035,.035,.025);
  }
  b('stone',x,h+1.31,z+.025,width+.35,.16,.32);
  b('stone',x,h-1.24,z+.1,width+.4,.14,.46);
  // Individual chipped corners catch light without noisy marks on the glass.
  b('masonry',x-width/2+.18,h-1.33,z+.32,.19,.035,.05);
 }
 const front=-781.72;
 for(let x=-8;x<19;x+=5)for(const h of [3.5,7.1])window(x,h,front);
 // The west elevation faces the garage approach and needs the same depth.
 for(const z of [-787,-795,-803])for(const h of [3.5,7.1]){
  b('iron',-12.04,h,z,.09,2.5,2.5);b('wet',-12.095,h,z,.025,1.95,1.95);
  for(const side of [-1,1]){
   b('stone',-12.16,h,z+side*1.3,.27,2.63,.14);
   b('cloth',-12.12,h,z+side*.74,.03,1.93,.4);
  }
  b('wood',-12.16,h,z,.06,2.1,.07);b('wood',-12.17,h,z,.06,.07,2.1);
  b('stone',-12.18,h+1.31,z,.32,.16,2.85);b('stone',-12.25,h-1.24,z,.46,.14,2.9);
 }
 // Stone corner quoins and a raised cornice give the flat facade thickness.
 for(const x of [-11.91,19.91])for(let row=0;row<15;row++){
  const width=row%2?.5:.78;b('stone',x,2.45+row*.46,front-.035,width,.4,.24);
 }
 for(const h of [2.22,5.38,9.45]){
  b('stone',4,h,front-.02,32.3,.15,.34);
  b('weatherboard',4,h+.11,front-.06,32.15,.06,.2);
 }
 // Gutters have a dark trough, metal rim, brackets and connected downpipes.
 for(const z of [-780.49,-809.51]){
  b('iron',4,9.78,z,35.05,.15,.18);b('rubber',4,9.86,z,34.8,.025,.1);
  for(let x=-12;x<21;x+=2.8)b('iron',x,9.68,z-.04,.05,.2,.22);
 }
 for(const x of [-11.5,19.5]){
  beam('iron',[x,9.78,-780.49],[x,9.32,front+.08],.11);
  pipe(x,front+.08,9.32,.42,x<4?-1:1);
 }
 // Two chimney stacks with stepped flashing and open, dark pots.
 for(const x of [-6.4,14.2]){
  b('iron',x,12.19,-795,1.55,.12,2.05);
  b('masonry',x,12.82,-795,1.12,1.55,1.5);
  for(let n=0;n<4;n++)b('stone',x,12.18+n*.35,-794.23,1.17,.055,.04);
  b('stone',x,13.66,-795,1.4,.16,1.8);
  for(const dz of [-.43,.43]){p(cylinder,'rust',x,13.95,-795+dz,.19,.48,.19);p(cylinder,'rubber',x,14.196,-795+dz,.13,.012,.13);}
 }
 // Modest front-door pediment; its brackets attach above head clearance.
 for(const side of [-1,1]){
  beam('weatherboard',[4+side*2.35,3.74,-781.35],[4,4.45,-781.35],.14,.32);
  beam('iron',[4+side*2.1,3.18,front],[4+side*2.1,3.65,-781.27],.075);
 }
 for(const x of [1.8,6.2]){
  b('iron',x,2.55,front+.12,.21,.47,.13);b('windowLamp',x,2.55,front+.2,.13,.29,.06);
  for(const side of [-1,1])b('iron',x+side*.075,2.55,front+.24,.025,.35,.025);
  b('iron',x,2.8,front+.21,.25,.06,.21);
 }
 // Garage roller mechanism stays above/alongside the existing opening.
 const shaft=new THREE.CylinderGeometry(.14,.14,11.4,12);shaft.rotateZ(Math.PI/2);p(shaft,'iron',-23,5.04,-800);shaft.dispose();
 for(const x of [-28.42,-17.58]){
  b('iron',x,2.53,-800.13,.12,4.94,.22);b('rust',x,2.53,-799.99,.035,4.9,.04);
  for(let h=.45;h<4.9;h+=.55)b('brass',x,h,-799.98,.065,.045,.025);
  b('iron',x,5.04,-800,.32,.4,.42);
 }
 b('paint',-28.13,4.56,-800.25,.48,.55,.48);
 for(let n=0;n<5;n++)b('iron',-28.13,4.4+n*.075,-799.995,.34,.022,.025);
 // Rails, light housings and roof ties supply depth in the open bay.
 for(const x of [-28.42,-17.58]){
  b('iron',x,4.96,-803.6,.10,.10,6.5);
  // Curved tracks join the vertical jambs to the overhead rails.
  const points=Array.from({length:13},(_,i)=>{const a=i*Math.PI/24;return new THREE.Vector3(x,4.62+.34*Math.sin(a),-800-.34*(1-Math.cos(a)));});
  const guide=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),12,.05,5,false);p(guide,'iron',0,0,0);guide.dispose();
 }
 for(const z of [-802,-807,-812]){
  b('weatherboard',-23,4.7,z,11,.2,.18);
  b('iron',-23,4.58,z,1.8,.11,.32);b('lamp',-23,4.51,z,1.55,.035,.18);
  for(const side of [-1,1])beam('weatherboard',[-23+side*5.3,3.85,z],[-23+side*4.45,4.7,z],.12);
 }
 // The side-wall service panel leaves the existing back-wall staff record
 // readable. All projections stay close to the walls, outside the parking bay.
 b('iron',-28.44,2.5,-807,.10,1.65,1.15);b('paint',-28.37,2.5,-807,.035,1.47,.98);
 for(let n=0;n<6;n++)b('iron',-28.34,2.87-n*.11,-807,.018,.03,.68);
 b('brass',-28.31,2.22,-806.63,.025,.19,.055);
 for(const z of [-807.2,-806.8])p(cylinder,'iron',-28.38,3.92,z,.035,1.65,.035);
 b('weatherboard',-19.8,2.7,-813.43,2.05,.16,.1);
 for(let n=0;n<4;n++){
  const x=-20.52+n*.48;b('wood',x,2.08,-813.34,.035,1.1,.045);
  b(n%2?'iron':'rust',x,1.54,-813.33,n%2?.28:.16,.18,.06);
 }
 // The slate shell keeps its exterior silhouette; separate timber boarding
 // and a connected frame describe its interior. Relay foundations are level.
 let shelterBoards=0,shelterRafters=0;
 for(const c of COURSE.checkpoints){
  const roofAngle=Math.atan2(1.2,5);
  for(const side of [-1,1]){
   // Close-boarded roof: narrow joints show construction without bright gaps.
   for(let row=0;row<14;row++){
    const dz=(row+.5)*5/14;
    const g=new THREE.BoxGeometry(8.24,.055,Math.hypot(5/14,1.2/14)-.012);
    g.rotateX(side*roofAngle);
    p(g,'wood',c.x,4.54-dz*.24,-c.y+side*dz);g.dispose();shelterBoards++;
   }
   b('wood',c.x+side*3.7,3.40,-c.y,.24,.24,8.3);
   b('wood',c.x,3.38,-c.y+side*4,7.65,.24,.24);
   // Gutters sit beyond the eaves. Their inner trough stays dark.
   b('iron',c.x,3.40,-c.y+side*5.09,8.6,.13,.18);
   b('rubber',c.x,3.47,-c.y+side*5.09,8.48,.025,.10);
   for(const x of [-3.7,-1.85,0,1.85,3.7])b('iron',c.x+x,3.32,-c.y+side*5.02,.045,.18,.25);
   for(const x of [-3.7,-2.22,-.74,.74,2.22,3.7]){
    beam('wood',[c.x+x,4.40,-c.y],[c.x+x,3.22,-c.y+side*4.92],.14,.18);shelterRafters++;
   }
   for(const dz of [-4,4]){
    beam('wood',[c.x+side*3.7,2.75,-c.y+dz],[c.x+side*3.05,3.38,-c.y+dz],.13);
    // A socket, straps and recessed bolts attach the existing posts.
    b('iron',c.x+side*3.7,.16,-c.y+dz,.30,.30,.30);
    for(const h of [.22,3.12]){
     b('iron',c.x+side*3.7,h,-c.y+dz+.135,.21,.16,.025);
     for(const dx of [-.065,.065])b('brass',c.x+side*3.7+dx,h,-c.y+dz+.154,.035,.035,.018);
    }
   }
   // Downpipes remain at the outside corners, clear of the drive-through.
   const px=c.x+side*4.05,pz=-c.y+side*5.10;
   p(cylinder,'iron',px,1.85,pz,.055,3.12,.055);
   for(const h of [.65,2.65])b('iron',px,h,pz-side*.06,.16,.055,.22);
   beam('iron',[px,.29,pz],[px+side*.20,.14,pz],.105);
  }
  b('wood',c.x,4.40,-c.y,8.24,.22,.18);
  // A wired hood replaces the unsupported luminous strip's silhouette.
  b('iron',c.x,3.27,-c.y,1.25,.08,.40);
  for(const x of [-.46,.46])b('iron',c.x+x,3.82,-c.y,.035,1.04,.035);
  b('iron',c.x+3.58,2.34,-c.y+4,.055,2.85,.055);
  b('paint',c.x+3.58,1.35,-c.y+4.06,.23,.3,.13);
  for(const side of [-1,1])b('brass',c.x+3.58+side*.07,1.35,-c.y+4.14,.025,.19,.02);
  b('iron',c.x,3.65,-c.y+3.87,7.2,.055,.055);
 }
 return {pieces,clubhouseWindows:18,chimneys:2,garageFittings:true,wiredShelters:COURSE.checkpoints.length,shelterBoards,shelterRafters};
}
