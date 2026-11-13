import {createClubhouseWindows} from './clubhouse-windows.js';
import * as THREE from './vendor/three/three.module.js';

// Architectural parts use the same world-sized pixel surfaces and static
// batching as the course props. Only the exit door remains articulated.
export function createBuildings({root,mesh,box:softBox,cylinder,torus,lanternAt,label}) {
  let clubhouseWindows=null,addingClubhouseWindows=false;
  const noise=n=>{const v=Math.sin(n*127.1+33.7)*43758.5453;return v-Math.floor(v);};
  function surfaceOffset(m,x,y,z){const p=m.geometry.attributes.surfacePosition;for(let i=0;i<p.count;i++)p.setXYZ(i,p.getX(i)+x,p.getY(i)+y,p.getZ(i)+z);return m;}
  function box(r,type,x,y,z,w,h,d,color=0xffffff,bevel=.035){
    // Boards, slates and narrow straps have sharp manufactured edges. Avoid
    // spending 108 triangles on a bevel smaller than a visible scene pixel.
    if(bevel<=.015)return surfaceOffset(mesh(r,new THREE.BoxGeometry(w,h,d),type,color,x,y,z),x,y,z);
    // Keep broad architectural faces planar. Averaging a tiny bevel's normals
    // across a large wall produced huge triangular bands in the lighting.
    const m=softBox(r,type,x,y,z,w,h,d,color,bevel),old=m.geometry,g=old.toNonIndexed();
    g.computeVertexNormals();g.setAttribute('surfaceNormal',g.attributes.normal.clone());m.geometry=g;old.dispose();return surfaceOffset(m,x,y,z);
  }
  const beam=(r,type,a,b,width,color)=>{
    const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),mid=start.clone().add(end).multiplyScalar(.5);
    const m=box(r,type,mid.x,mid.y,mid.z,width,start.distanceTo(end),width,color,.012);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),end.sub(start).normalize());return m;
  };
  function triangle(r,type,x,y,z,width,rise,depth,color,turn=0){
    const shape=new THREE.Shape();shape.moveTo(-width/2,0);shape.lineTo(width/2,0);shape.lineTo(0,rise);shape.closePath();
    const g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,steps:1});g.translate(0,0,-depth/2);
    const m=mesh(r,g,type,color,x,y,z);m.rotation.y=turn;return m;
  }
  async function roof(r,w,d,eave,rise,{metal=false,cancelled=()=>false}={}){
    let slice=performance.now();
    // Ridge runs along X. Both slopes have thickness, fascia and visible ends.
    const half=d/2,angle=Math.atan2(rise,half),slope=Math.hypot(half,rise),type=metal?'roof-metal':'slate';
    for(const side of [-1,1]){
      const panel=new THREE.Group();panel.position.set(0,eave+rise/2,side*half/2);panel.rotation.x=side*angle;r.add(panel);
      box(panel,type,0,-.025,0,w,.055,slope,0xb6c5cb,.012);
      if(metal){
        // A continuous rolled sheet gives the roof a scalloped edge and curved
        // light response, instead of rectangular bars laid over a flat box.
        const g=new THREE.PlaneGeometry(w,slope,Math.ceil(w/.045),8);g.rotateX(-Math.PI/2);
        const p=g.attributes.position;for(let i=0;i<p.count;i++){const xx=p.getX(i),zz=p.getZ(i);p.setY(i,.040+.027*Math.cos(xx*Math.PI*2/.18)+.008*Math.sin(xx*8+zz*3));p.setZ(i,zz+Math.sin(xx*13)*.012*Math.pow(Math.abs(zz)/(slope/2),6));}g.computeVertexNormals();
        mesh(panel,g,'roof-metal',0xd1d7d2);
        for(let x=-w/2+.17;x<w/2;x+=.72)for(const z of [-slope*.40,slope*.40])cylinder(panel,'iron',x,.09,z,.018,.022,0xc1b79b);
      }else{
        const rows=Math.ceil(slope/.27),cols=Math.ceil(w/.46);
        for(let row=0;row<rows;row++)for(let col=0;col<=cols;col++){
          const left=Math.max(-w/2,-w/2+(col-(row%2)*.5)*w/cols),right=Math.min(w/2,-w/2+(col+1-(row%2)*.5)*w/cols);if(right-left<.02)continue;
          const x=(left+right)/2,z=-slope/2+(row+.5)*slope/rows;
          const slate=box(panel,'slate',x,.043+noise(row*31+col)*.009,z,right-left-.012,.027,slope/rows-.009,[0xb3c0c4,0xc4cdca,0x9eafb9,0xb9c6c7][(row*3+col)%4],.006);
          slate.rotation.z=(noise(row*19+col)-.5)*.018;
          if(performance.now()-slice>5){await new Promise(resolve=>setTimeout(resolve,0));slice=performance.now();if(cancelled())return;}
        }
      }
      box(r,'weatherboard',0,eave-.025,side*half,w+.08,.16,.13,0xa0a59b,.015);
      for(const end of [-1,1])beam(r,'weatherboard',[end*w/2,eave-.025,side*half],[end*w/2,eave+rise,0],.14,0xa0a59b);
    }
    const cap=mesh(r,new THREE.CylinderGeometry(.105,.105,w+.12,10,1,true,0,Math.PI),metal?'roof-metal':'slate',0xaebfc5,0,eave+rise+.015,0);cap.rotation.z=Math.PI/2;
    return cap;
  }
  function boards(r,x,y,z,width,height,color=0xa8b1ae,side=false){
    const group=new THREE.Group();group.position.set(x,y,z);if(side)group.rotation.y=Math.PI/2;r.add(group);
    box(group,'weatherboard',0,0,-.025,width,height,.10,0x72827f,.006);
    const count=Math.ceil(width/.24),pitch=width/count;
    for(let i=0;i<count;i++){
      const xx=-width/2+(i+.5)*pitch,seed=i+width*27+x*8+z*13;
      const g=new THREE.BoxGeometry(pitch-.008-noise(seed)*.008,height,.10,1,5,1),p=g.attributes.position;
      for(let j=0;j<p.count;j++){const yy=p.getY(j),bow=Math.cos(yy/height*Math.PI)*.015*(noise(seed+7)-.5);p.setZ(j,p.getZ(j)+bow);if(yy<-.49*height)p.setY(j,yy+noise(seed+4)*.025);}
      g.computeVertexNormals();surfaceOffset(mesh(group,g,'weatherboard',color,xx,0,(noise(seed+1)-.5)*.018),xx+x,noise(seed+2)*3,z);
      if(i%2===0)for(const yy of [-height*.39,height*.39]){
        const nail=cylinder(group,'iron',-width/2+(i+.5)*pitch,yy,.058,.012,.012,0x7c8988);nail.rotation.x=Math.PI/2;
      }
    }return group;
  }
  function stoneBase(r,w,d,h=.35){
    box(r,'masonry',0,h/2,0,w,h,d,0xc1c6b3,.055);
    for(const side of [-1,1])for(let row=0;row<2;row++){
      for(let x=-w/2+.24;x<w/2;x+=.49)box(r,'masonry',x,row*h/2+h/4,side*(d/2+.015),.46,h/2-.018,.08,0xc4c9ba,.025);
      for(let z=-d/2+.24;z<d/2;z+=.49)box(r,'masonry',side*(w/2+.015),row*h/2+h/4,z,.08,h/2-.018,.46,0xc4c9ba,.025);
    }
  }
  function windowFrame(r,x,y,z,w=.78,h=1.02,turn=0,lit=true){
    const frame=new THREE.Group();frame.position.set(x,y,z);frame.rotation.y=turn;r.add(frame);
    box(frame,'iron',0,0,-.025,w+.12,h+.12,.12,0x1c292b,.012);
    if(lit&&addingClubhouseWindows)clubhouseWindows.add(frame,w-.08,h-.08);
    else {
    const pane=box(frame,lit?'window-glass':'glass',0,0,.04,w-.08,h-.08,.025,lit?0xe6c58a:0x5c8190,.003);
    // Shared emission avoids a light per window. Mullions remain real geometry.
    if(lit){pane.material.emissive.setHex(0xc17d29);pane.material.emissiveIntensity=.30;}
    }
    for(const side of [-1,1]){box(frame,'wood',side*w/2,0,.095,.065,h+.12,.12,0x8d8a70,.008);box(frame,'wood',0,side*h/2,.095,w+.12,.065,.12,0x8d8a70,.008);}
    box(frame,'wood',0,0,.11,.045,h,.08,0x858572,.005);
    for(const yy of [-h/6,h/6])box(frame,'wood',0,yy,.11,w,.035,.08,0x858572,.004);
    box(frame,'stone',0,-h/2-.08,.11,w+.25,.10,.29,0xb0b5a2,.018);
  }
  function doorLeaf(door){
    boards(door,1,1.19,0,1.96,2.36,0x9b9c81);
    for(const y of [.29,2.08])box(door,'wood',1,y,.09,1.84,.12,.12,0x8c8e73,.012);
    beam(door,'wood',[.15,.37,.105],[1.85,2.01,.105],.13,0x8c8e73);
    for(const y of [.37,1.94]){
      box(door,'iron',.29,y,.17,.58,.07,.035,0x677c7c,.012);cylinder(door,'iron',.02,y,.12,.045,.18,0x8f9990);
      for(const x of [.10,.47]){const bolt=cylinder(door,'iron',x,y,.198,.019,.018,0xaab4a6);bolt.rotation.x=Math.PI/2;}
    }
    box(door,'iron',1.72,1.15,.135,.14,.32,.035,0x738381,.012);
    cylinder(door,'brass',1.72,1.17,.20,.025,.18,0xc8b888);
    const lock=torus(door,'iron',1.72,1.02,.19,.041,.009,0xc1c1a5);lock.scale.y=1.3;
  }
  function maintenanceDetails(r,w,front){
    // Small functional objects follow the original illustration's rake, feed
    // sacks and tool room, and stay against the solid wings beside the doorway.
    beam(r,'wood',[-2.55,.16,front+.19],[-2.27,2.03,front+.11],.042,0xb6a282);
    box(r,'iron',-2.55,.17,front+.19,.58,.045,.05,0x82988d,.008);
    for(let i=0;i<9;i++)beam(r,'iron',[-2.81+i*.065,.17,front+.19],[-2.81+i*.065,.075,front+.26],.018,0x82988d);
    for(let i=0;i<3;i++){
      const g=new THREE.SphereGeometry(1,14,8);g.scale(.48,.13,.29);
      const sack=mesh(r,g,'plaster',i===1?0xa1a487:0xb9b498,2.70+(i%2)*.06,.22+i*.20,front-.04);sack.rotation.y=(i-1)*.09;
      // Curved seam follows the soft bag rather than squaring off its silhouette.
      const seam=torus(r,'wood',2.70+(i%2)*.06,.22+i*.20,front-.04,.35,.008,0xb8a77f);seam.rotation.x=Math.PI/2;seam.scale.set(1.32,.80,1);
    }
    windowFrame(r,w/2+.075,1.67,-.12,.75,.70,Math.PI/2,true);
    box(r,'iron',w/2+.083,2.88,0,.04,.34,.55,0x233532,.006);
    for(let i=0;i<5;i++){const slat=box(r,'weatherboard',w/2+.12,2.74+i*.065,0,.10,.035,.61,0xb2b7a3,.005);slat.rotation.z=.16;}
    for(let xx=-w/2+.25;xx<w/2;xx+=.69)for(const side of [-1,1])box(r,'wood',xx,2.53,side*(front+.12),.085,.15,.44,0x8e9683,.01);
    // Low asymmetric moss tufts knit the footings into the ground.
    for(let i=0;i<18;i++){
      const side=i<9?-1:1,xx=side*(1.85+noise(i+8)*(w/2-1.92)),g=new THREE.SphereGeometry(1,7,4);
      g.scale(.10+noise(i)*.16,.045+noise(i+1)*.08,.09);mesh(r,g,'leaf',0x8b9b6b,xx,.12,front+.095);
    }
  }
  async function shed(x,z,{exit=false,cancelled=()=>false}={}){
    const w=exit?8.23:6.5,d=exit?2.56:3.6,h=2.55,front=d/2;
    const r=root(exit?'maintenance-shed':'service-building',x,z,{shape:'building',width:w,depth:d});
    // Exit wall blocks keep the existing collision faces; facade infill stays
    // behind the same door barrier. No decoration enters the approach lane.
    if(exit)for(const side of [-1,1])box(r,'weatherboard',side*2.995,1.30,0,2.24,2.60,d,0x809795,.015);
    else box(r,'weatherboard',0,h/2,0,w,h,d,0x809795,.025);
    for(const side of [-1,1]){
      const wing=(w-2.12)/2,center=side*(1.06+wing/2);
      box(r,'masonry',center,.17,front,wing,.34,.25,0xc8cbbb,.025);
      boards(r,center,1.43,front+.025,wing,2.26);
      boards(r,side*w/2,1.43,0,d,2.26,0x92a6a5,true);
      box(r,'wood',side*1.045,1.23,front+.12,.15,2.46,.22,0xa9aa8d,.02);
      box(r,'wood',side*(w/2-.045),1.39,front+.08,.15,2.5,.18,0x9aa99d,.015);
      box(r,'masonry',side*w/2,.17,0,.20,.34,d,0xc8cbbb,.025);
      triangle(r,'weatherboard',side*w/2,h,0,d,1.0,.13,0x829b9b,Math.PI/2);
    }
    boards(r,0,1.43,-front,w,2.26,0x8b9c96);
    box(r,'masonry',0,.17,-front,w,.34,.20,0xc8cbbb,.02);
    box(r,'wood',0,2.48,front+.10,w,.18,.22,0x9faba0,.02);
    box(r,'stone',0,.045,front-.05,2.0,.09,.45,0xb0b9a5,.02);
    const roofRoot=exit?root('shed-roof',x,z):r;await roof(roofRoot,w+.42,d+.48,2.61,1.0,{metal:true,cancelled});if(cancelled())return null;
    // Gutter and downpipe are mounted on the outer wall, with a curved elbow.
    const gutter=cylinder(r,'iron',0,2.59,front+.25,.065,w+.32,0x879b9c);gutter.rotation.z=Math.PI/2;
    cylinder(r,'iron',w/2-.1,1.38,front+.19,.048,2.40,0x829593);
    beam(r,'iron',[w/2-.1,.2,front+.19],[w/2-.1,.11,front+.35],.075,0x829593);
    // A small maintenance plaque belongs to the building; optional wayfinding
    // boards are handled separately and never replace the physical door.
    if(exit){const name=label('SERVICE EXIT',.96);name.position.set(.0,2.43,front+.22);r.add(name);name.userData.keepDynamic=true;
      box(r,'iron',0,2.43,front+.19,1.04,.22,.035,0x8c9279,.005);}

    if(!exit){const name=label('GROUNDS SERVICE',2.65);name.position.set(0,2.77,front+.39);r.add(name);name.userData.keepDynamic=true;
      box(r,'wood',0,2.77,front+.34,2.80,.75,.09,0x85958a,.02);}
    lanternAt(r,1.44,1.76,front+.15,.84);
    maintenanceDetails(r,w,front);
    if(exit){
      // Recessed warm interior becomes visible as the real door swings inward.
      box(r,'wood',0,.045,0,2.0,.09,d-.12,0x817a55,.012);
      box(r,'wood',0,.88,-front+.35,1.85,.09,.48,0x9f8f65,.02);
      for(const side of [-1,1])box(r,'wood',side*.79,.46,-front+.35,.08,.84,.08,0x9f8f65);
      for(let i=0;i<3;i++)cylinder(r,i===1?'rust':'iron',-.52+i*.47,1.08,-front+.35,.12,.30,0x9a916e);
      torus(r,'rubber',.58,1.66,-front+.13,.26,.035,0x656949);
      lanternAt(r,-.42,1.71,-front+.27,.75);
      const warm=new THREE.PointLight(0xffbb69,3,4,2);warm.position.set(0,2.15,.2);r.add(warm);
      // A physical filing box gives the existing interaction a visible anchor.
      box(r,'paint',1.48,1.20,front+.12,.49,.55,.23,0xb1bdac,.025);
      box(r,'iron',1.48,1.31,front+.247,.34,.045,.018,0x283533,.003);
      const plate=label('FILE',.40);plate.position.set(1.48,1.12,front+.25);r.add(plate);plate.userData.keepDynamic=true;
    }
    const door=root(exit?'shed-door':'service-door',x-1,z+front+.16,null,exit);doorLeaf(door);
    return door;
  }
  async function clubhouse(x,z,cancelled=()=>false){
    const r=root('clubhouse',x,z,{shape:'building',width:11.8,depth:5.2});
    clubhouseWindows=createClubhouseWindows(r);addingClubhouseWindows=true;
    try {
    // Connected Tudor volumes, with a raised central hall and cross-gabled wings.
    stoneBase(r,11.8,4.6,.42);
    box(r,'masonry',0,1.25,0,11.6,1.66,4.4,0xc9cbbb,.035);
    box(r,'plaster',0,2.85,0,11.6,1.54,4.4,0xaabcb3,.02);
    await roof(r,12.1,4.9,3.66,1.65,{cancelled});if(cancelled())return null;
    for(const side of [-1,1])triangle(r,'plaster',side*5.8,3.66,0,4.4,1.65,.13,0xaabcb3,Math.PI/2);
    for(const side of [-1,1]){
      for(const y of [2.08,3.60])box(r,'wood',0,y,side*2.23,11.7,.13,.13,0x6e776b,.01);
      for(let xx=-5.55;xx<=5.56;xx+=.93)box(r,'wood',xx,2.84,side*2.25,.10,1.47,.13,0x737a6c,.01);
      for(let xx=-4.65;xx<=4.66;xx+=1.55)for(const yy of [1.17,2.86])windowFrame(r,xx,yy,side*2.27,.70,.94,side===1?0:Math.PI,(Math.round(xx*10)+Math.round(yy*10))%3!==0);
    }
    for(const side of [-1,1]){
      const wing=new THREE.Group();wing.position.set(side*4.50,0,.5);wing.rotation.y=-Math.PI/2;r.add(wing);
      box(wing,'masonry',0,1.1,0,5.5,1.85,2.65,0xc4c9bb,.035);
      box(wing,'plaster',0,2.85,0,5.5,1.65,2.65,0xb0bdb2,.02);
      await roof(wing,5.9,2.99,3.7,1.65,{cancelled});if(cancelled())return null;
      for(const end of [-1,1])triangle(wing,'plaster',end*2.76,3.69,0,2.66,1.62,.12,0xaabcb3,Math.PI/2);
      for(const face of [-1,1]){
        for(const yy of [2.02,3.65])box(wing,'wood',0,yy,face*1.37,5.55,.14,.12,0x647367,.01);
        for(let xx=-2.65;xx<2.66;xx+=.88)box(wing,'wood',xx,2.84,face*1.38,.10,1.60,.12,0x647367,.01);
        for(const xx of [-1.72,0,1.72])for(const yy of [1.12,2.85])windowFrame(wing,xx,yy,face*1.39,.65,.98,face===1?0:Math.PI);
      }
      for(const zz of [-1.26,0,1.26])box(wing,'wood',2.83,2.80,zz,.13,1.65,.11,0x647367,.01);
      for(const yy of [2.02,3.65])box(wing,'wood',2.83,yy,0,.13,.14,2.70,0x647367,.01);
      beam(wing,'wood',[2.84,3.70,-1.33],[2.84,5.30,0],.12,0x647367);
      beam(wing,'wood',[2.84,3.70,1.33],[2.84,5.30,0],.12,0x647367);
      windowFrame(wing,2.85,2.86,0,1.20,1.12,Math.PI/2);
      windowFrame(wing,2.85,1.15,0,1.35,1.25,Math.PI/2);
      windowFrame(wing,2.85,4.20,0,.48,.65,Math.PI/2);
    }
    // Porch depth and braces make the entry read in silhouette from the course.
    for(let xx=-2.65;xx<=2.66;xx+=1.325){
      box(r,'stone',xx,.25,3.05,.26,.50,.26,0xb6b8a3,.02);box(r,'wood',xx,1.25,3.05,.11,2.1,.11,0x879080,.01);
      for(const side of [-1,1])beam(r,'wood',[xx,1.70,3.05],[xx+side*.34,2.18,3.05],.08,0x879080);
    }
    const porchRoof=box(r,'slate',0,2.30,2.73,5.7,.13,1.23,0xa5b6c3,.025);porchRoof.rotation.x=.20;
    for(let i=0;i<3;i++)box(r,'stone',0,.08+i*.10,3.56-i*.19,2.45,.16,1.0-i*.18,0xb9b9a5,.025);
    box(r,'wood',0,1.14,2.24,.91,1.93,.12,0xa09471,.025);windowFrame(r,0,1.61,2.32,.54,.58);
    for(const xx of [-3.0,2.5]){
      box(r,'masonry',xx,4.77,-.44,.60,2.15,.64,0xc1bfaa,.025);box(r,'stone',xx,5.85,-.44,.77,.16,.81,0xa5b2ac,.02);
      for(const dx of [-.16,.16])cylinder(r,'rust',xx+dx,6.06,-.44,.10,.31,0x9f8066,.085);
      for(let yy=4.05;yy<5.8;yy+=.24)box(r,'stone',xx,yy,-.105,.61,.035,.02,0x627f7b,.003);
    }
    clubhouseWindows.finish();
    return r;
    } finally {
      addingClubhouseWindows=false;
      if(cancelled())clubhouseWindows.dispose();
    }
  }
  return {shed,clubhouse,clubhouseWindowStats:()=>clubhouseWindows?.stats(),disposeClubhouseWindows:()=>clubhouseWindows?.dispose()};
}
