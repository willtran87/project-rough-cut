import {BACK_NINE_COMPOUNDS,buildBackNineCompounds} from './back-nine-course-compounds.js';
// Course-edge silhouettes, built into the same textured/static batches as the
// existing estate. All footprints remain beyond the playable boundary.
export const DISTRICT_SCENERY = Object.freeze([
 {id:'east-propagation-house',kind:'glasshouse',x:52,y:105,width:10,length:18,height:6.7},
 {id:'west-propagation-house',kind:'glasshouse',x:-53,y:140,width:10,length:18,height:6.7},
 {id:'range-distance-board',kind:'range-board',x:-49,y:380,width:2.8,length:12,height:7.2},
 {id:'members-pergola',kind:'pergola',x:-45,y:735,width:7,length:25,height:4.65},
 ...BACK_NINE_COMPOUNDS
]);

export function buildBackNineDistrictScenery({THREE,box,put,cylinder,pinePlacements}){
 let pieces=0,panes=0,brokenPanes=0,relocatedTrees=0;
 const b=(...args)=>{box(...args);pieces++;},p=(...args)=>{put(...args);pieces++;};
 function beam(type,a,c,width,depth=width){
  const start=new THREE.Vector3(...a),end=new THREE.Vector3(...c),delta=end.clone().sub(start);
  const g=new THREE.BoxGeometry(width,delta.length(),depth);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize()));
  const mid=start.add(end).multiplyScalar(.5);p(g,type,mid.x,mid.y,mid.z);g.dispose();
 }
 function panel(type,points){
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(points.length===3?[0,0,.5,1,1,0]:[0,0,1,0,1,1,0,1],2));
  // Both sides are opaque, avoiding transparent sorting/overdraw at night.
  g.setIndex(points.length===3?[0,1,2,2,1,0]:[0,1,2,0,2,3,2,1,0,3,2,0]);
  // Give each face its own vertices before normals are computed: otherwise
  // the coincident opposite faces cancel each other's normals.
  const flat=g.toNonIndexed();flat.computeVertexNormals();flat.computeBoundingBox();
  const center=flat.boundingBox.getCenter(new THREE.Vector3());flat.translate(-center.x,-center.y,-center.z);
  p(flat,type,center.x,center.y,center.z);flat.dispose();g.dispose();
 }
 function glasshouse({x,y,width:w,length:d,height:top},index){
  const z=-y,eave=4.55,base=.85;
  b('masonry',x,.32,z,w+.3,.64,d+.3);
  for(const side of [-1,1]){
   b('weatherboard',x+side*w/2,.84,z,.16,.65,d);
   b('iron',x+side*w/2,eave,z,.16,.18,d+.35);
   b('iron',x+side*(w/2+.17),eave-.1,z,.24,.14,d+.5);
   b('rubber',x+side*(w/2+.17),eave-.025,z,.15,.025,d+.4);
   // Eight broad bays, split into upper and lower panes. Missing panes leave
   // dark recesses with surviving triangular shards and occasional boarding.
   for(let bay=0;bay<8;bay++){
    const zz=z-d/2+(bay+.5)*d/8,xx=x+side*w/2;
    b('weatherboard',xx,2.7,zz-d/16,.095,3.7,.095);
    b('weatherboard',xx,2.7,zz,.11,.075,d/8);
    for(let row=0;row<2;row++){
     const h=1.85+row*1.78,damaged=(bay+row*3+index*2+(side>0?1:0))%9===0;
     const tint=(bay+row+index)%3===0?'glassPale':'glass';
     if(damaged){
      brokenPanes++;b('rubber',xx-side*.06,h,zz,.035,1.68,d/8-.13);
      panel(tint,[[xx,h-.84,zz-.98],[xx,h-.84,zz+.98],[xx,h-.32,zz+.98],[xx,h-.6,zz-.98]]);
      if(row===0)beam('weatherboard',[xx+side*.035,h-.65,zz-.94],[xx+side*.035,h+.5,zz+.94],.14,.09);
     }else{b(tint,xx,h,zz,.045,1.68,d/8-.13);panes++;}
     // Narrow grime at the lower glazing bead and a bright metal latch.
     b('iron',xx+side*.035,h-.79,zz,.035,.07,d/8-.14);
     if(row===0)b('brass',xx+side*.07,h+.65,zz+.86,.045,.1,.08);
    }
    const za=zz-d/16+.06,zb=zz+d/16-.06;
    panel((bay+index)%3?'glass':'glassPale',[[x,eave+(top-eave),za],[xx,eave,za],[xx,eave,zb],[x,top,zb]]);panes++;
    beam('weatherboard',[xx,eave,zz-d/16],[x,top,zz-d/16],.095);
   }
   // Roof sash rails divide each bay and reinforce its pitched silhouette.
   b('iron',x+side*w*.25,(eave+top)/2,z,.07,.07,d);
   b('weatherboard',x+side*w/2,2.7,z+d/2,.11,3.7,.11);
   for(const dz of [-d/2,d/2]){
    beam('weatherboard',[x+side*w/2,eave,z+dz],[x,top,z+dz],.15);
    b('iron',x+side*(w/2+.16),2.25,z+dz,.09,4.4,.09);
    beam('iron',[x+side*(w/2+.16),.25,z+dz],[x+side*(w/2+.4),.13,z+dz+.25],.1);
   }
  }
  for(const end of [-1,1]){
   const zz=z+end*d/2;
   b('weatherboard',x,base,zz,w,.6,.16);
   b('glass',x,2.8,zz,w-.16,3.3,.045);
   for(let xx=x-w/2;xx<=x+w/2;xx+=w/4)b('weatherboard',xx,2.75,zz,.11,3.6,.12);
   b('weatherboard',x,3.15,zz,w,.1,.12);
   panel('glassPale',[[x-w/2,eave,zz],[x,top,zz],[x+w/2,eave,zz]]);
   b('weatherboard',x,eave,zz,w,.14,.14);
   b('iron',x,2,zz+end*.07,1.65,2.9,.08);
   b('glass',x,2.25,zz+end*.12,1.35,2.2,.035);
   b('brass',x+.5,1.95,zz+end*.16,.07,.25,.06);
   b('weatherboard',x,3.6,zz+end*.14,2.1,.25,.12);
  }
  b('iron',x,top+.06,z,.22,.14,d+.45);
  // Raised ridge vents, finials and a service tank identify a propagation
  // house instead of a generic shed, even at middle distance.
  for(const dz of [-5,1,6]){
   b('rubber',x,top+.12,z+dz,1.1,.12,2.1);
   b('weatherboard',x,top+.34,z+dz,1.25,.09,2.25);
   for(const side of [-1,1])b('iron',x+side*.49,top+.22,z+dz,.055,.3,1.8);
  }
  for(const dz of [-d/2,d/2])p(cylinder,'brass',x,top+.4,z+dz,.075,.65,.075);
  p(cylinder,'iron',x+Math.sign(x)*(w/2+1.05),.92,z+5,.65,1.8,.65);
  b('iron',x+Math.sign(x)*(w/2+.55),1.6,z+5,1.1,.1,.1);
 }
 function rangeBoard({x,y,length:d}){
  const z=-y,face=x+.19;
  for(const dz of [-d/2+.7,d/2-.7]){
   b('stone',x,.22,z+dz,.85,.44,.85);b('weatherboard',x,3.6,z+dz,.3,7.2,.3);
   beam('iron',[x-1.2,.3,z+dz],[x,4.8,z+dz],.12);
   for(const h of [3.3,5.5])b('brass',face+.06,h,z+dz,.05,.12,.12);
  }
  b('weatherboard',x,4.85,z,.24,4.2,d);
  b('rubber',face,4.8,z,.035,3.65,d-.6);
  for(const h of [3,4.15,5.3,6.6])b('iron',face+.04,h,z,.06,.08,d-.5);
  for(const dz of [-d/2+.3,-1.9,1.9,d/2-.3])b('iron',face+.04,4.8,z+dz,.06,3.7,.07);
  // Physical pixel lettering, readable without introducing a font texture.
  const font={R:['110','101','110','101','101'],A:['010','101','111','101','101'],N:['101','111','111','111','101'],G:['011','100','101','101','011'],E:['111','100','110','100','111'],0:['111','101','101','101','111'],1:['010','110','010','010','111'],5:['111','100','110','001','110']};
  const letters=(word,h,center,scale)=>{const width=(word.length*4-1)*scale;for(let i=0;i<word.length;i++)for(let row=0;row<5;row++)for(let col=0;col<3;col++)if(font[word[i]][row][col]==='1')b('flag',face+.075,h-row*scale,z+center+width/2-(i*4+col+.5)*scale,.025,scale*.85,scale*.85);};
  letters('RANGE',6.38,0,.17);
  for(const [index,label]of ['50','100','150'].entries())letters(label,5.1,3.8-index*3.8,.13);
  // An empty bottom score row and a slanted repair plank show abandonment.
  beam('weatherboard',[face+.11,3.15,z-5.5],[face+.11,3.9,z-2.1],.17,.065);
  b('iron',x,7.05,z,.8,.12,d+.45);
 }
 function pergola({x,y,width:w,length:d}){
  const z=-y;
  for(const side of [-1,1]){
   for(const dz of [-11.5,-5.75,0,5.75,11.5]){
    const xx=x+side*(w/2-.25),zz=z+dz;
    b('stone',xx,.27,zz,.56,.54,.56);b('weatherboard',xx,2.35,zz,.24,4.2,.24);
    b('iron',xx,.6,zz,.27,.36,.27);
    for(const sign of [-1,1])beam('wood',[xx,3.45,zz],[xx,4.25,zz+sign*.85],.13);
   }
   b('weatherboard',x+side*(w/2-.25),4.35,z,.25,.32,d+.6);
  }
  for(let n=0;n<24;n++){
   const zz=z-d/2+n*d/23;
   if(n===5||n===17){b('wood',x-2.5,4.57,zz,1.4,.15,.11);continue;}
   b('weatherboard',x,4.57,zz,w+.5,.15,.12);
  }
  for(const dz of [-11.5,0,11.5])b('wood',x,4.22,z+dz,w-.3,.22,.2);
  // Trellis at the closed west edge; the course-facing side stays open.
  for(let n=0;n<13;n++)b('weatherboard',x-w/2+.2,1.65,z-12+n*2,.09,2.5,.07);
  for(const h of [.6,1.2,1.8,2.4])b('wood',x-w/2+.2,h,z,.08,.07,d-.6);
 }
 for(const [i,site]of DISTRICT_SCENERY.entries()){
  if(site.kind==='glasshouse')glasshouse(site,i);
  else if(site.kind==='range-board')rangeBoard(site);
  else if(site.kind==='pergola')pergola(site);
 }
 const compounds=buildBackNineCompounds({THREE,box:b,put:p,cylinder,beam});
 // Keep all trees, opening sight windows on the route side and moving
 // displaced trees into groves behind structures, inside the ground apron.
 // All sites are away from reservoirs and existing maintenance shelters.
 for(const tree of pinePlacements){
  const site=DISTRICT_SCENERY.find(s=>Math.sign(s.x)===Math.sign(tree.x)&&Math.abs(-tree.z-s.y)<s.length/2+6&&Math.abs(tree.x)>40&&Math.abs(tree.x)<Math.abs(s.x)+s.width/2+4);
  if(!site)continue;
  const n=relocatedTrees++;tree.x=Math.sign(site.x)*(63+(n%3)*1.5);
  tree.z=-(site.y-site.length/2-2+(n*5.7)%(site.length+4));
 }
 return {sites:DISTRICT_SCENERY.map(s=>({...s})),pieces,panes,brokenPanes,relocatedTrees,compounds};
}
