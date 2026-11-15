// Recessed service counters in the existing solid grounds stores. Their
// counters explain the blocked footprint; the contents never enter a route.
export const MAINTENANCE_BAYS={
 'grounds-trailer':'turf-supplies',
 'pump-yard-trailer':'irrigation-repair',
 'range-trailer':'range-equipment',
 'abandoned-repair':'unfinished-deck-repair',
 'garage-service-trailer':'engine-service'
};

export function buildMaintenanceBay({THREE,f,box,put,cylinder}){
 const theme=MAINTENANCE_BAYS[f.id];if(!theme)return null;
 let pieces=0;const x=f.x,z=-f.y;
 const b=(type,dx,h,dz,w,hh,d,ry=0)=>{box(type,x+dx,h,z+dz,w,hh,d,ry);pieces++;};
 const p=(g,type,dx,h,dz,sx=1,sy=1,sz=1,ry=0)=>{put(g,type,x+dx,h,z+dz,sx,sy,sz,ry);pieces++;};
 function beam(type,a,c,width,depth=width){
  const start=new THREE.Vector3(...a),end=new THREE.Vector3(...c),delta=end.clone().sub(start),g=new THREE.BoxGeometry(width,delta.length(),depth);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize()));
  const mid=start.add(end).multiplyScalar(.5);p(g,type,mid.x,mid.y,mid.z);g.dispose();
 }
 function ring(type,dx,h,dz,r,t=.025,side=false){const g=new THREE.TorusGeometry(r,t,4,16);if(side)g.rotateY(Math.PI/2);p(g,type,dx,h,dz);g.dispose();}
 function disk(type,dx,h,dz,r,depth,front=false){const g=new THREE.CylinderGeometry(r,r,depth,12);if(front)g.rotateX(Math.PI/2);p(g,type,dx,h,dz);g.dispose();}
 function can(dx,h,dz,oil=false){
  b(oil?'mower':'paint',dx,h+.22,dz,.3,.44,.22);b('iron',dx,h+.46,dz,.27,.035,.21);
  b('brass',dx+.08,h+.49,dz,.075,.05,.075);b('stone',dx,h+.22,dz+.116,.21,.19,.012);
  for(const side of [-1,1])b('iron',dx+side*.07,h+.53,dz,.025,.13,.025);
  b('iron',dx,h+.595,dz,.16,.025,.025);b('cloth',dx,h+.23,dz+.125,.14,.025,.01);
 }
 function sack(dx,h,dz,turn=0){
  const c=Math.cos(turn),s=Math.sin(turn),part=(type,a,v,q,w,hh,d)=>b(type,dx+c*a+s*q,h+v,dz-s*a+c*q,w,hh,d,turn);
  const g=new THREE.BoxGeometry(.64,.32,.44,2,2,2),pos=g.attributes.position;
  for(let i=0;i<pos.count;i++){const a=pos.getX(i),v=pos.getY(i),c=pos.getZ(i),end=Math.abs(a)/.32;pos.setXYZ(i,a,v*(1-.25*end),c*(1-.16*end));}
  const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,.34+uv.getX(i)*.22,.37+uv.getY(i)*.22);
  g.computeVertexNormals();p(g,'workCanvas',dx,h,dz,1,1,1,turn);g.dispose();
  part('cloth',0,.155,0,.32,.012,.27);part('wood',0,.165,0,.19,.012,.04);
  for(const side of [-1,1])part('cloth',side*.30,0,0,.025,.18,.35);
  part('stone',0,0,.221,.22,.15,.012);
  for(const hh of [-.025,.025])part('cloth',0,hh,.230,.13,.018,.01);
 }
 function tool(dx,h,dz,kind){
  b('wood',dx,h,dz,.035,.53,.04);b('iron',dx,h-.29,dz,kind==='spade'?.16:.27,.12,.045);
  if(kind==='rake')for(let n=0;n<5;n++)b('iron',dx-.11+n*.055,h-.39,dz,.018,.14,.045);
  ring('iron',dx,h+.27,dz,.045,.012);
 }
 // Replace the filled block with an enclosed shallow workspace, lit by the
 // same moon, cart and mower sources as its outer walls.
 const wall=f.id==='abandoned-repair'?'weatherboard':'stucco';
 b(wall,0,1.6,-2.97,4.7,2.2,.16);
 for(const side of [-1,1]){
  b(wall,side*2.27,1.6,0,.16,2.2,6.1);
  b(wall,side*1.84,1.6,2.97,1.02,2.2,.16);
  b('iron',side*1.34,1.86,3.07,.08,1.62,.10);
  for(const h of [1.18,1.91,2.57])b('brass',side*1.34,h,3.128,.035,.04,.018);
 }
 b(wall,0,2.64,2.97,2.7,.18,.16);
 b('weatherboard',0,.73,1.4,4.38,.06,3.1);
 b('weatherboard',0,1.63,.10,4.38,1.8,.11);
 b('wood',0,2.62,1.5,4.38,.12,2.9);
 // A substantial counter and closed drawers prevent the hatch reading as an
 // enterable door. The raised shutter leaves the arranged work in view.
 b('weatherboard',0,.97,2.94,2.65,.48,.22);
 b('wood',0,1.24,2.92,2.78,.10,.42);
 for(const side of [-1,1]){
  b('wood',side*.66,1.01,3.065,1.22,.31,.025);
  b('iron',side*.66,1.03,3.09,.22,.035,.055);
 }
 for(let n=0;n<3;n++)b('paint',0,2.44+n*.075,3.082,2.57,.067,.025);
 b('iron',0,2.39,3.08,2.62,.07,.07);b('brass',.72,2.39,3.125,.21,.035,.04);
 b('wood',0,1.27,2.02,2.58,.11,1.35);
 for(const dx of [-1.12,1.12])for(const dz of [1.47,2.54])b('iron',dx,.98,dz,.07,.52,.07);
 b('iron',0,.83,1.9,2.3,.055,1.0);
 // Shared shelf construction, peg rail and subtle wear are attached to real
 // surfaces. Contents vary by the job carried out at each store.
 for(const dx of [-1.55,1.55]){
  b('wood',dx,1.68,.5,.09,1.76,.10);
  for(const h of [1.1,1.92]){b('weatherboard',dx,h,.74,.85,.07,.53);beam('iron',[dx,h-.28,.5],[dx,h-.04,.96],.035);}
 }
 b('wood',0,2.15,.22,2.5,.10,.07);
 for(let n=0;n<3;n++)tool(-.6+n*.53,1.75,.29,n===1?'rake':'spade');
 for(const dx of [-1.22,.44,.93])b('iron',dx,1.298,2.91,.11,.012,.07,.2);
 // Hooks and an electrical box provide restrained construction detail even
 // where the individual supplies are too distant to read.
 b('paint',1.92,2.18,1.55,.13,.36,.28);b('iron',1.83,2.18,1.55,.025,.20,.025);
 beam('iron',[1.98,2.38,1.55],[1.98,2.57,1.55],.025);
 if(theme==='turf-supplies'){
  for(const row of [0,1])for(const dx of [-.67,.02])sack(dx,1.48+row*.29,1.95,row?.07:0);
  sack(.8,1.49,2.15,-.18);
  for(const dx of [-1.55,1.55]){
   b('wood',dx,1.99,.75,.7,.11,.43);b('rough',dx,2.055,.75,.63,.025,.35);
   for(let n=0;n<4;n++)b('wood',dx-.28+n*.18,2.08,.75,.018,.12,.36);
  }
  b('iron',.73,1.34,2.65,.24,.035,.19,.2);beam('wood',[.73,1.38,2.59],[1.02,1.43,2.32],.035);
 }else if(theme==='irrigation-repair'){
  disk('mower',-.38,1.59,1.99,.27,.55,true);ring('brass',-.38,1.59,2.28,.24,.035);
  disk('rubber',-.38,1.59,2.28,.19,.02,true);
  for(let n=0;n<6;n++){const a=n*Math.PI/3; b('iron',-.38+Math.cos(a)*.21,1.59+Math.sin(a)*.21,2.316,.035,.035,.025);}
  disk('brass',.39,1.37,2.35,.20,.08);disk('iron',.39,1.45,2.35,.05,.12);
  for(let n=0;n<6;n++){const a=n*Math.PI/3;b('brass',.39+Math.sin(a)*.12,1.43,2.35+Math.cos(a)*.12,.045,.09,.18,a);}
  for(let n=0;n<3;n++)ring('rubber',-1.55,1.55,.88,.24+n*.045,.021);
  for(const dx of [1.32,1.63,1.86]){disk('brass',dx,1.24,.75,.09,.20);disk('rubber',dx,1.346,.75,.056,.008);}
  for(const dx of [.8,1.02]){b('iron',dx,1.34,2.37,.045,.028,.42,.2);ring('iron',dx-.04,1.36,2.17,.055,.014);}
 }else if(theme==='range-equipment'){
  for(const dx of [-.68,.1]){
   disk('mower',dx,1.52,2.08,.27,.38);disk('rubber',dx,1.718,2.08,.23,.015);
   for(let n=0;n<8;n++){const a=n*Math.PI/4;disk('stone',dx+Math.sin(a)*.15,1.74,2.08+Math.cos(a)*.15,.045,.045);}
   ring('iron',dx,1.79,2.08,.25,.018);
  }
  b('wood',.86,1.43,1.96,.54,.20,.46);
  for(let n=0;n<3;n++){b('iron',.69+n*.17,1.57,1.96,.06,.18,.35);b('cloth',.69+n*.17,1.68,1.96,.08,.035,.36);}
  for(const dx of [-1.55,1.55])for(let n=0;n<3;n++)disk('cloth',dx,2.07,.58+n*.15,.17,.23,true);
 }else if(theme==='unfinished-deck-repair'){
  const outline=new THREE.Shape();outline.moveTo(-.50,-.37);outline.lineTo(.50,-.37);outline.lineTo(.71,-.16);outline.lineTo(.71,.16);outline.lineTo(.50,.37);outline.lineTo(-.50,.37);outline.lineTo(-.71,.16);outline.lineTo(-.71,-.16);outline.closePath();
  const deck=new THREE.ExtrudeGeometry(outline,{depth:.14,bevelEnabled:true,bevelThickness:.025,bevelSize:.045,bevelSegments:1,steps:1});deck.rotateX(-Math.PI/2);p(deck,'mower',-.16,1.36,1.99);deck.dispose();
  b('iron',-.16,1.54,1.99,1.0,.045,.50);
  for(const dx of [-.65,.33])for(const dz of [1.74,2.24])disk('iron',dx,1.565,dz,.035,.04);
  for(const dx of [-.59,.27]){disk('rust',dx,1.64,1.99,.19,.08);disk('iron',dx,1.76,1.99,.045,.20);}
  b('iron',.05,1.37,2.59,.93,.035,.10,-.15);disk('rubber',.05,1.395,2.59,.04,.008);
  disk('rubber',-1.43,1.57,1.72,.32,.20,true);disk('iron',-1.43,1.57,1.833,.16,.025,true);
  b('iron',.92,1.35,1.96,.38,.04,.57);b('rubber',.92,1.38,1.96,.30,.012,.45);
  for(let n=0;n<4;n++)disk('brass',.85+(n%2)*.13,1.43,1.83+Math.floor(n/2)*.18,.035,.085);
  can(1.55,1.96,.75,true);ring('rubber',-1.55,2.18,.88,.21,.025);
 }else{
  for(const dx of [-.82,-.43])can(dx,1.33,2.05,true);
  b('iron',.29,1.4,2.02,.52,.14,.38);
  for(let n=0;n<8;n++)b('flag',.08+n*.06,1.55,2.02,.025,.20,.29);
  b('paint',.83,1.42,2.17,.32,.18,.42);b('iron',.83,1.52,2.17,.27,.035,.36);
  for(const dx of [-1.55,1.55])can(dx,1.96,.75,dx<0);
  ring('rubber',.55,1.93,.31,.29,.025);ring('rubber',.55,1.93,.34,.25,.018);
 }
 return {id:f.id,theme,pieces,opening:{width:2.6,bottom:1.29,top:2.35},footprint:{x:f.x,y:f.y,rx:f.rx,ry:f.ry}};
}
