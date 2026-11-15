// Silhouette geometry and readable mechanical assemblies. Everything joins the
// existing material batches and breakaway pivots; no per-frame detail work.
export function panelLoft(THREE,rings,bevel=.06){
 const p=[],uv=[],index=[];
 for(const [z,w,low,high]of rings){const b=Math.min(bevel,(high-low)*.35);
  for(const [x,y]of [[-w+b,low],[w-b,low],[w,low+b],[w,high-b],[w-b,high],[-w+b,high],[-w,high-b],[-w,low+b]]){p.push(x,y,z);uv.push(x,z);}
 }
 for(let r=0;r<rings.length-1;r++)for(let i=0;i<8;i++){const a=r*8+i,n=r*8+(i+1)%8,b=a+8;index.push(a,n,b,n,n+8,b);}
 for(let i=1;i<7;i++){index.push(0,i+1,i);const b=(rings.length-1)*8;index.push(b,b+i,b+i+1);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(index);g.computeVertexNormals();return g;
}
export function vehicleTireGeometry(THREE,r){
 const points=[[.48,-.105],[.68,-.145],[.88,-.145],[.99,-.095],[1,0],[.99,.095],[.88,.145],[.68,.145],[.48,.105]].map(([radius,y])=>new THREE.Vector2(radius*r,y));
 const g=new THREE.LatheGeometry(points,16);g.rotateZ(Math.PI/2);return g;
}
export function addWheelCraft({THREE,wheel,side,r,mower,put,box,cylinder}){
 const ring=put(new THREE.TorusGeometry(r*.65,.018,4,16),'iron',side*.15,0,0,1,1,1,0,wheel);ring.rotation.y=Math.PI/2;
 const cap=put(cylinder,'iron',side*.18,0,0,r*.18,.07,r*.18,0,wheel);cap.rotation.z=Math.PI/2;
 for(const face of [-1,1])for(let i=0;i<8;i++){const a=i*Math.PI/4;const slot=box('rubber',face*.157,Math.cos(a)*r*.52,Math.sin(a)*r*.52,.012,r*.13,.035,0,wheel);slot.rotation.x=a;}
 if(mower)for(let i=0;i<16;i++)for(const sign of [-1,1]){
  const a=i*Math.PI/8;const tread=box('rubber',sign*.075,Math.cos(a)*(r+.006),Math.sin(a)*(r+.006),.145,.045,.09,0,wheel);tread.rotation.set(a,sign*.24,0);
 }
}
export function addVehicleCraft({THREE,mower,body,parts,box,put,cylinder,rail}){
 const ring=(parent,type,x,y,z,r,t=.018,axis='z')=>{const m=put(new THREE.TorusGeometry(r,t,4,12),type,x,y,z,1,1,1,0,parent);if(axis==='x')m.rotation.y=Math.PI/2;if(axis==='y')m.rotation.x=Math.PI/2;return m;};
 const tube=(parent,type,a,b,r)=>{const d=new THREE.Vector3(...b).sub(new THREE.Vector3(...a)),m=put(cylinder,type,...a,r,d.length(),r,0,parent);m.position.addScaledVector(d,.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return m;};
 if(!mower){
  // A layered nose, curved sill caps and broad rubbing strips replace the
  // single rectangular slab read at driving distance.
  for(const side of [-1,1]){
   rail(parts.hood,[[side*.51,.82,-1.425],[side*.68,.92,-1.25],[side*.73,1.035,-.85],[side*.62,.99,-.56]],.017,'iron');
   rail(body,[[side*.83,.68,-.77],[side*.85,.74,-.45],[side*.85,.74,.55],[side*.82,.67,.83]],.035,'paint');
   box('rubber',side*.87,.6,.08,.024,.09,1.22,0,body);
   // Complete suspension: axles, trailing arms, damper bodies and springs.
   for(const z of [-.84,.84]){
    tube(body,'iron',[side*.53,.33,z-.18],[side*.73,.31,z+.08],.034);
    tube(body,'iron',[side*.65,.31,z],[side*.58,.64,z+.1],.028);
    const pts=[];for(let n=0;n<=24;n++){const t=n/24,a=t*Math.PI*6;pts.push(new THREE.Vector3(side*.63+Math.cos(a)*.055,.34+t*.25,z+.04+Math.sin(a)*.055));}
    put(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,.012,4,false),'iron',0,0,0,1,1,1,0,body);
   }
   // Fitted seat cushions, stitched edging, armrests and worn seat-belt buckles.
   rail(body,[[side*.68,1.075,-.02],[side*.72,1.09,.13],[side*.72,1.08,.5],[side*.64,1.07,.63]],.014,'iron');
   rail(body,[[side*.74,.92,.12],[side*.79,1.18,.16],[side*.79,1.18,.54],[side*.74,1.08,.59]],.023,'iron');
   box('seat',side*.79,1.21,.34,.09,.06,.39,0,body);
   box('rubber',side*.13,1.075,.5,.06,.025,.2,side*.17,body);box('iron',side*.13,1.095,.4,.065,.025,.065,0,body);
   // Front lamp lenses have a bezel and fluting instead of blank light blocks.
   for(const y of [.733,.927])box('iron',side*.544,y,-1.493,.32,.017,.012,0,parts.hood);
   for(const x of [-.151,.151])box('iron',side*.544+x,.83,-1.493,.018,.19,.012,0,parts.hood);
   for(let i=-1;i<=1;i++)box('iron',side*.544+i*.055,.83,-1.499,.012,.14,.008,0,parts.hood);
   // Roof end ribs are carried by the roof when it buckles and collapses.
   rail(parts.roof,[[side*.83,2.5,-1.02],[side*.92,2.55,-.7],[side*.94,2.58,.65],[side*.85,2.51,1.25]],.02,'iron');
  }
  for(const z of [-.84,.84])tube(body,'iron',[-.78,.34,z],[.78,.34,z],.045);
  put(cylinder,'iron',0,.34,.84,.13,.22,.13,0,body);
  // Dashboard fascia: speedometer, switches, glovebox, ignition and pedals.
  box('rubber',0,1.02,-.46,1.34,.18,.06,0,body);
  ring(body,'iron',-.36,1.065,-.414,.095);box('iron',-.38,1.09,-.405,.012,.065,.01,-.4,body);
  for(const x of [-.03,.1,.23]){box('iron',x,1.07,-.42,.05,.045,.025,0,body);box('rubber',x,1.09,-.4,.035,.035,.02,0,body);}
  box('seat',.48,1.035,-.415,.28,.095,.022,0,body);box('iron',.48,1.07,-.398,.09,.014,.015,0,body);
  tube(body,'iron',[-.36,.75,-.46],[-.36,1.18,-.35],.035);
  for(const x of [-.49,-.24]){const pedal=box('rubber',x,.735,-.46,.13,.025,.2,0,body);pedal.rotation.x=-.3;}
  ring(body,'iron',-.02,.99,-.405,.025,.007);rail(body,[[-.02,.99,-.395],[.02,.91,-.37],[.015,.87,-.37]],.008,'iron');
  // Rear gearbox and finned motor show underneath the breakaway battery hatch.
  const motor=put(cylinder,'iron',.32,.46,.91,.13,.41,.13,0,body);motor.rotation.z=Math.PI/2;
  for(const x of [.17,.25,.33,.41,.49])ring(body,'iron',x,.46,.91,.145,.014,'x');
  rail(body,[[-.5,.7,1.34],[-.38,.58,1.3],[-.07,.54,1.26],[.18,.48,1.13]],.021,'rubber');
  // Rear-facing coachwork is readable from the driving camera. The vented
  // cover follows the existing breakaway hatch; the battery cradle stays put.
  box('rubber',0,.68,1.465,.65,.12,.014,0,parts.hatch);
  for(let i=0;i<5;i++)box('iron',-.26+i*.13,.68,1.478,.035,.10,.018,0,parts.hatch);
  for(const side of [-1,1]){
   rail(body,[[side*.73,.45,1.19],[side*.81,.45,1.44],[side*.54,.45,1.53]],.045,'iron');
   box('rubber',side*.55,.48,1.545,.26,.11,.05,0,body);
   box('iron',side*.27,.61,1.30,.045,.28,.05,0,body);
   // Broad gutter lips and corrugated rear roof flange catch moon/beacon light.
   rail(parts.roof,[[side*.91,2.54,.72],[side*.91,2.54,1.25],[side*.77,2.50,1.36]],.025,'paint');
  }
  box('iron',0,.52,1.27,.6,.055,.24,0,body);
  for(const x of [-.55,-.28,0,.28,.55])box('iron',x,2.49,1.335,.035,.055,.04,0,parts.roof);
 }else{
  // A dense rear power pack gives the mower weight from both chase angles.
  put(panelLoft(THREE,[[.98,.62,.85,1.36],[1.2,.82,.83,1.6],[1.68,.76,.82,1.5],[1.83,.63,.85,1.25]],.09),'mower',0,0,0,1,1,1,0,body);
  box('rubber',0,1.13,1.844,1.08,.43,.025,0,body);
  ring(body,'iron',0,1.15,1.865,.25,.035);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;rail(body,[[0,1.15,1.88],[Math.cos(a)*.21,1.15+Math.sin(a)*.21,1.88]],.018,'iron');}
  for(let i=0;i<5;i++)box('iron',-.45+i*.225,1.14,1.9,.023,.38,.015,0,body);
  for(const side of [-1,1]){
   const tank=put(cylinder,side<0?'iron':'rust',side*.88,1.44,1.25,.2,.5,.2,0,body);
   put(cylinder,'iron',side*.88,1.72,1.25,.07,.06,.07,0,body);
   for(const y of [1.29,1.58])ring(body,'iron',side*.88,y,1.25,.205,.02,'y');
   rail(body,[[side*.88,1.2,1.25],[side*1.08,1.03,1],[side*1.16,.8,.65]],.025,'rubber');
   // Side drive pulleys, a heavy belt and cast gearbox ribs.
   for(const z of [.35,.86]){const pulley=put(cylinder,'iron',side*1.285,.88,z,.18,.07,.18,0,body);pulley.rotation.z=Math.PI/2;ring(body,'rubber',side*1.325,.88,z,.18,.025,'x');}
   rail(body,[[side*1.325,1.06,.35],[side*1.325,1.06,.86]],.026,'rubber');
   rail(body,[[side*1.325,.7,.35],[side*1.325,.7,.86]],.026,'rubber');
   for(let i=0;i<5;i++)box('iron',side*1.14,.62+i*.055,.86,.14,.023,.42,0,body);
   // Reinforced triangular bumper cheeks, pivot plates and hydraulic piston.
   tube(body,'rust',[side*.8,.56,-1.66],[side*1.13,.87,-1.35],.085);
   tube(body,'iron',[side*.8,.72,-.4],[side*1.08,.47,-1.08],.055);
   tube(body,'brass',[side*1.08,.47,-1.08],[side*1.24,.36,-1.45],.028);
   for(const z of [-1.62,-1.36]){const pin=put(cylinder,'iron',side*1.1,.66,z,.06,.12,.06,0,body);pin.rotation.z=Math.PI/2;}
   // Raised panel borders and chips break up the broad bonnet surfaces.
   rail(body,[[side*.83,1.37,-1.48],[side*.99,1.49,-1.2],[side*.99,1.49,-.68],[side*.84,1.32,-.29]],.021,'rust');
   for(let i=0;i<5;i++)box('brass',side*(.9-i*.015),1.455,-1.22+i*.12,.05,.013,.045,i*.3,body);
  }
  // Intake manifold and clamp collars below the driver's operating platform.
  rail(body,[[-.79,1.16,.87],[-.68,1.48,1.04],[-.3,1.62,1.18],[.3,1.62,1.18]],.075,'rubber');
  for(const x of [-.1,.22])ring(body,'iron',x,1.62,1.18,.078,.012,'x');
  box('iron',0,1.64,1.47,.61,.08,.36,0,body);
  for(let i=0;i<6;i++)box('rubber',-.24+i*.096,1.688,1.47,.042,.012,.24,0,body);
  // Broad welded cheek plates and heat shields, rather than extra loose props.
  // Their profiles remain inside the existing collision and culling envelopes.
  for(const side of [-1,1]){
   put(panelLoft(THREE,[[-1.77,.15,.57,.84],[-1.47,.22,.53,1.02],[-1.1,.16,.56,.89]],.04),'rust',side*.79,0,0,1,1,1,0,body);
   rail(body,[[side*.71,.84,-1.73],[side*.9,1.02,-1.47],[side*.88,.9,-1.14]],.027,'iron');
   box('iron',side*1.14,1.40,.91,.09,.39,.67,0,body);
   for(let i=0;i<4;i++)box('rubber',side*1.193,1.40,.68+i*.15,.015,.25,.065,0,body);
   rail(body,[[side*.9,1.27,.45],[side*1.2,1.04,.18],[side*1.25,.73,-.38]],.052,'rubber');
   for(const y of [1.12,1.19])put(cylinder,'brass',side*1.07,y,.30,.065,.04,.065,0,body);
  }
 }
}
export function addDeckCraft({THREE,deck,box,put,cylinder,rail}){
 const rim=put(new THREE.TorusGeometry(.83,.035,4,20),'iron',0,.08,0,1,.85,1,0,deck);rim.rotation.x=Math.PI/2;
 for(const side of [-1,1]){
  // Low gauge wheels and fork brackets support the cutting deck physically.
  box('iron',side*.62,.01,.46,.08,.26,.07,0,deck);
  const wheel=put(cylinder,'rubber',side*.62,-.1,.46,.115,.13,.115,0,deck);wheel.rotation.z=Math.PI/2;
  const hub=put(cylinder,'iron',side*.62,-.1,.46,.046,.15,.046,0,deck);hub.rotation.z=Math.PI/2;
  rail(deck,[[side*.28,.2,.55],[side*.52,.38,.4],[side*.64,.12,.09]],.025,'rubber');
  for(let i=0;i<3;i++){const tab=box('mower',side*(.69+i*.035),-.08,.16-i*.12,.035,.13,.085,0,deck);tab.rotation.z=side*.25;}
 }
 for(let i=0;i<4;i++)box('rust',-.37+i*.25,.2,-.39,.11,.025,.19,(i%2?.3:-.2),deck);
}
