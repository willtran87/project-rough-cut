// Small, modeled fittings on existing collision footprints. Destructible
// fixtures route these pieces into the same collapsing chunks as their body.
export function addCourseFeatureCraft({THREE,f,box,put,cylinder,sphere}){
 const x=f.x,z=-f.y;
 if(f.kind==='parked-cart'){
  for(const side of [-1,1]){
   const bx=x+side*.48,bz=z+1.88;
   put(cylinder,'cloth',bx,1.25,bz,.2,.9,.2);put(cylinder,'rubber',bx,.83,bz,.22,.09,.22);
   const rim=new THREE.TorusGeometry(.2,.025,5,12);rim.rotateX(Math.PI/2);put(rim,'iron',bx,1.72,bz);rim.dispose();
   box('rubber',bx+side*.2,1.28,bz,.055,.65,.09);
   for(let n=0;n<4;n++){const h=.8+n*.08,xx=bx+(n-1.5)*.07;put(cylinder,'iron',xx,1.5+h*.5,bz,.009,h,.009);box('rubber',xx,1.5+h-.1,bz,.027,.19,.027);box('stone',xx+.045,1.5+h,bz,.11,.045,.04);}
   box('paint',bx,1.38,bz+.2,.25,.3,.04);box('brass',bx,1.39,bz+.23,.16,.025,.018);
  }
 }else if(f.kind==='trailer'&&f.id!=='reservoir-trailer'){
  // Service notice frame, louvred window, door hinges and a wall tool rack.
  box('wood',x-1.7,1.8,z+3.13,.67,.8,.06);box('cloth',x-1.7,1.8,z+3.17,.53,.64,.018);
  for(let n=0;n<4;n++)box('stone',x-1.72,2.02-n*.12,z+3.185,.32-(n%2)*.08,.023,.008);
  for(const h of [.65,2.1]){box('rust',x-1.28,h,z+3.13,.17,.08,.03);for(const side of [-1,1])put(sphere,'brass',x-1.28+side*.055,h,z+3.15,.014,.014,.01);}
  box('wood',x+2.38,1.55,z+.5,.08,.13,2.4);
  for(let n=0;n<3;n++){const zz=z-.3+n*.7;put(cylinder,'wood',x+2.43,.98,zz,.024,1.65,.024);box('iron',x+2.43,.22,zz,.04,.1,.45);for(let k=0;k<5;k++)box('iron',x+2.46,.18,zz-.18+k*.09,.09,.12,.018);}
  for(let n=0;n<3;n++){const ring=new THREE.TorusGeometry(.25+n*.045,.024,5,16);put(ring,'rubber',x+1.75,1.05,z+3.15);ring.dispose();}
 }else if(f.kind==='cistern'){
  for(const side of [-1,1]){
   const pipe=new THREE.CylinderGeometry(.07,.07,1.5,8);pipe.rotateX(Math.PI/2);put(pipe,'rust',x+side*2.4,1.3,z-3.1);pipe.dispose();
   const wheel=new THREE.TorusGeometry(.17,.025,5,12);put(wheel,'brass',x+side*2.4,1.5,z-2.5);wheel.dispose();
   box('iron',x+side*2.4,1.5,z-2.5,.3,.025,.025);box('iron',x+side*2.4,1.5,z-2.5,.025,.3,.025);
  }
 }
}

export function addChaseVehicleCraft({THREE,mower,body,box,put,cylinder}){
 if(!mower)return;
 // Exposed hydraulics, braided-looking couplings and articulated drag chains.
 for(const side of [-1,1]){
  const hose=new THREE.CatmullRomCurve3([new THREE.Vector3(side*.55,.75,-.2),new THREE.Vector3(side*1.1,.55,-.8),new THREE.Vector3(side*1.6,.38,-1.2)]);
  const tube=new THREE.TubeGeometry(hose,10,.045,6,false);put(tube,'rubber',0,0,0,1,1,1,0,body);tube.dispose();
  for(let n=0;n<4;n++)box('brass',side*(.65+n*.2),.72-n*.08,-.3-n*.18,.09,.07,.09,0,body);
  for(let n=0;n<8;n++){const link=new THREE.TorusGeometry(.065,.017,4,8);if(n%2)link.rotateY(Math.PI/2);put(link,'iron',side*1.08,.57-n*.047,1.25+n*.06,1,1,1,0,body);link.dispose();}
  box('rust',side*.83,1.05,.48,.2,.34,.06,0,body);for(let n=0;n<3;n++)box('iron',side*.83,.96+n*.08,.52,.14,.018,.018,0,body);
 }
}
