// Small silhouette and surface details use the existing pixel maps and join
// each vehicle's material batches. No extra lights, textures or update loop.
export function addVehicleDetail({THREE,mower,body,parts,box,put,cylinder,rail}){
 if(mower){
  // A heavy divided brow shields the lamps; the lower jaw remains visible.
  for(const side of [-1,1]){
   const brow=box('rust',side*.68,1.38,-1.9,.72,.1,.14,0,body);brow.rotation.z=side*.14;
   box('iron',side*.89,1.08,-1.91,.11,.39,.08,0,body);
   for(const z of [-.32,.12,.56]){
    box('rust',side*1.25,.92,z,.12,.26,.31,0,body);
    box('brass',side*1.318,.96,z,.02,.055,.2,-side*.3,body);
   }
   // External hydraulic rams with bright piston ends and paired hose loops.
   rail(body,[[side*.7,.82,-.28],[side*1.03,.55,-.82],[side*1.25,.43,-1.1]],.07,'iron');
   rail(body,[[side*.84,1.03,-.22],[side*1.2,.9,-.45],[side*1.18,.42,-1.1]],.045,'rubber');
   for(const z of [-.38,.18,.72])box('iron',side*1.32,.93,z,.035,.07,.065,0,body);
   // Weld patches and large repair staples interrupt the clean factory shape.
   box('rust',side*1.135,1.18,-.72,.035,.2,.36,.03,body);
   for(let n=0;n<4;n++)box('iron',side*1.16,1.29,-.88+n*.09,.035,.035,.04,0,body);
  }
  // Dark belt recess and exposed cooling ribs behind the tooth-like grille.
  box('rubber',0,1.09,-1.74,1.62,.36,.07,0,body);
  for(let n=0;n<13;n++)box('iron',-.72+n*.12,1.08,-1.787,.035,.28,.025,0,body);
  rail(body,[[-1,.68,-1.8],[-.55,.57,-1.89],[0,.6,-1.9],[.58,.57,-1.89],[1,.68,-1.8]],.075,'rust');
  // Perforated exhaust heat shield and a second shorter, soot-blackened stack.
  put(cylinder,'rust',.93,2.17,.77,.14,.8,.14,0,body);
  for(let n=0;n<6;n++)box('rubber',.93,1.86+n*.12,.916,.14,.035,.012,0,body);
  put(cylinder,'iron',-.96,1.92,.86,.1,1.48,.1,0,body);
  rail(body,[[-.96,2.62,.86],[-.96,2.78,.92],[-.96,2.8,1.12]],.105,'rubber');
  for(const x of [-.96,.93])box('iron',x,1.8,.8,.28,.08,.26,0,body);
  // Diagonal braces make the roll cage look like a welded industrial frame.
  rail(body,[[-.87,1.08,1.03],[.7,2.88,.64]],.043,'rust');
  rail(body,[[.87,1.08,1.03],[-.7,2.88,.64]],.043,'iron');
  box('iron',0,.93,1.91,.68,.31,.035,0,body);
  for(let n=0;n<4;n++)box('brass',-.25+n*.16,.94,1.935,.07,.23,.012,.4,body);
 }else{
  // Seat piping, seams and buttons remain readable behind the driver.
  for(const side of [-1,1]){
   rail(body,[[side*.72,1.02,.55],[side*.72,1.56,.65],[side*.53,1.59,.65]],.018,'iron');
   for(const z of [-.84,.84]){
    box('iron',side*.85,.66,z,.17,.045,.38,0,body);
    for(const dz of [-.12,.12])box('iron',side*.94,.68,z+dz,.025,.035,.04,0,body);
   }
   // Split windshield hinges and the grab rail frame the open driving view.
   box('iron',side*.77,1.45,-.75,.09,.11,.08,0,parts.frame);
   rail(parts.frame,[[side*.77,1.62,-.75],[side*.65,1.62,-.75]],.021);
   for(const z of [-.85,.94])box('iron',side*.85,2.57,z,.06,.028,.07,0,parts.roof);
   rail(body,[[side*.55,.48,.76],[side*.55,.37,.34],[side*.55,.48,-.18]],.035);
   for(let n=0;n<4;n++)box('rubber',side*.57,.53,-.22+n*.17,.11,.07,.035,0,body);
  }
  for(const x of [-.51,-.17,.17,.51]){
   box('iron',x,1.37,.704,.026,.025,.012,0,body);
   // Visible behind the loosening service hatch as health drops.
   box('rubber',x,.65,1.365,.27,.25,.075,0,body);
   box('iron',x,.8,1.365,.055,.04,.055,0,body);
  }
  rail(body,[[-.51,.82,1.36],[-.2,.86,1.37],[.17,.82,1.36],[.51,.85,1.36]],.018,'iron');
  box('iron',0,.88,1.47,.42,.13,.018,0,body);
  for(const x of [-.14,-.07,.04,.12])box('paint',x,.89,1.482,.025,.055,.008,0,body);
  for(const z of [-1.16,-.72])for(const x of [-.55,.55])box('iron',x,1.026,z,.045,.025,.045,0,parts.hood);
  rail(parts.bumper,[[-.55,.43,-1.43],[-.55,.56,-1.41],[.55,.56,-1.41],[.55,.43,-1.43]],.023);
 }
}

export function addDeckDetail({THREE,deck,box,put,cylinder}){
 // Broad triangular guard teeth fit the existing cutting-deck hull. Sparse
 // bevelled edges catch moonlight without transparent strips or new materials.
 const shape=new THREE.Shape();shape.moveTo(-.075,.12);shape.lineTo(.075,.12);shape.lineTo(.035,-.16);shape.lineTo(-.03,-.12);shape.closePath();
 const tooth=new THREE.ExtrudeGeometry(shape,{depth:.045,bevelEnabled:false,steps:1});tooth.rotateX(-Math.PI/2);
 for(let n=0;n<5;n++){
  const x=-.52+n*.26,z=-.58-Math.sqrt(Math.max(0,1-(x/.85)**2))*.09;
  put(tooth,n%2?'iron':'rust',x,-.025,z,1,1,1,n%2?.1:-.07,deck);
 }
 for(const side of [-1,1]){
  put(cylinder,'rubber',side*.41,.25,.15,.16,.055,.16,0,deck);
  put(cylinder,'iron',side*.41,.29,.15,.055,.035,.055,0,deck);
  box('rubber',0,.25,.15,.82,.045,.055,0,deck);
 }
 // Do not dispose the shared tooth until batchVehicleParts has copied it.
 return ()=>tooth.dispose();
}

export function buildCartWear({THREE,parts,body,box,batchVehicleParts}){
 const wear=[];
 function group(parent,threshold){const g=new THREE.Group();parent.add(g);wear.push({group:g,threshold});return g;}
 const roof=group(parts.roof,.025),nose=group(parts.hood,.18),rear=group(body,.35),torn=group(parts.roof,.65);
 for(let n=0;n<7;n++){
  const m=box('iron',.39+(n%3)*.12,2.586,-.6+n*.23,.045,.012,.16+(n%2)*.12,0,roof);m.rotation.y=.55;
 }
 for(let n=0;n<5;n++)box('iron',-.45+n*.09,.87+n*.025,-1.273,.055,.025,.008,-.3,nose);
 for(const side of [-1,1])for(let n=0;n<4;n++)box('iron',side*.86,.62+n*.028,.72+n*.11,.025,.032,.18,side*.2,rear);
 // A broad, irregular split reads above the driver as the roof starts failing.
 // Hidden until battered; prebatched and deformed with the roof, never spawned.
 for(let n=0;n<5;n++){
  const x=-.52+n*.21,z=.68+(n%2)*.06;
  box('rubber',x,2.615,z,.26,.012,.11,n%2?.18:-.12,torn);
  box('iron',x,2.625,z+.06,.22,.018,.025,n%2?.18:-.12,torn);
 }
 for(const w of wear){batchVehicleParts(w.group);w.group.visible=false;}
 return wear;
}
