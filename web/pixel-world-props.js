import {createVegetationContact,VEGETATION_PADDING} from './course-vegetation-contact.js';
import {DRAIN_LAYOUT} from './drain-collision.js';
import {HEDGE_PROFILE,STONE_PROFILE} from './course-cover-profile.js';
import {raiseCourseCanopy} from './course-canopy-clearance.js';
import {collisionArtBounds} from './collision-art-bounds.js';
import * as THREE from './vendor/three/three.module.js';
import * as Art from './pixel-art.js';
import {createCourseSurfaces} from './course-surfaces.js';
import { createBuildings } from './pixel-buildings.js?v=20261108-environment-guidance';
import { createTrees } from './pixel-trees.js';
import { createLandscape } from './pixel-landscape.js';
import { createSolidOcclusion } from './solid-occlusion.js';
import { createIndexArray, compactVisibleIndices } from './visible-indices.js';
import { createLocalLightCulling } from './local-light-culling.js?v=20261112-stable-material-order';
import { frustumBoxMask, intersectsFrustumMask } from './frustum-box.js';
import { yieldCpuPreparation } from './render-preparation.js';
import { lanternFlickerGLSL } from './lantern-layout.js?v=20261113-symmetric-28';

// The original illustrations inform surfaces, colors and craftsmanship. Solid
// gameplay objects have fixed geometry, never a camera-facing picture of a prop.
export function createPixelWorld(parent, { label, glow, economy=false }) {
  const culledMeshes=[],cullFrustum=new THREE.Frustum(),cullProjection=new THREE.Matrix4(),lastCullProjection=new THREE.Matrix4();
  let cullValid=false;
  const solidOcclusion=createSolidOcclusion();
  const localLighting=economy?createLocalLightCulling():null;
  let occludedParts=0;
  const records=[], materials=new Map(), staticRecords=[], surfaceTextures=new Map();
  const drainCollisionParts=[];
  const flameTime={value:0},flameSteady={value:1};
  const reedContact=createVegetationContact();
  const reedTime={value:0},reedWind={value:0};let reedLast=null,reedDepth=null;
  function reedShader(shader){reedContact.shader(shader);shader.uniforms.reedTime=reedTime;shader.uniforms.reedWind=reedWind;
    shader.vertexShader='uniform float reedTime;uniform float reedWind;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      float reedBend=uv.y*uv.y*reedWind*(.07*sin(reedTime*.9+position.x*1.3+position.z*.4)+.025*sin(reedTime*1.7+position.z));
      transformed.x+=reedBend;transformed.z+=reedBend*.35;`);
  }
  function updateReeds(frame){reedContact.update(frame);const dt=reedLast===null?0:Math.max(0,Math.min(.1,frame.time-reedLast));if(reedLast!==null&&frame.time<reedLast)reedTime.value=0;reedLast=frame.time;
    if(!frame.paused&&!frame.reducedMotion)reedTime.value+=dt;
    reedWind.value=frame.reducedMotion?0:.25+THREE.MathUtils.clamp(frame.fx?.wind?.strength||0,0,1)*.75;
  }
  const flameMaterial=new THREE.MeshBasicMaterial({color:0xf0bd65});
  flameMaterial.onBeforeCompile=s=>{
    s.uniforms.lanternTime=flameTime;s.uniforms.lanternSteady=flameSteady;
    s.vertexShader='uniform float lanternTime;\nuniform float lanternSteady;\nvarying float vLanternFlame;\n'+lanternFlickerGLSL+'\n'+s.vertexShader;
    s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      vec3 flameWorld=(modelMatrix*vec4(transformed,1.0)).xyz;
      vLanternFlame=mix(lanternFlame(lanternTime,dot(flameWorld.xz,vec2(2.17,.73))),1.0,lanternSteady);`);
    s.fragmentShader='varying float vLanternFlame;\n'+s.fragmentShader;
    s.fragmentShader=s.fragmentShader.replace('#include <opaque_fragment>','outgoingLight*=vLanternFlame;\n#include <opaque_fragment>');
  };
  flameMaterial.customProgramCacheKey=()=> 'rough-cut-lantern-flame-v1';
  function updateLanterns(time=0,steady=true){flameTime.value=time;flameSteady.value=steady?1:0;}
  const random=n=>{const a=Math.sin(n*127.1+311.7)*43758.5453;return a-Math.floor(a);};
  const surfaces={
    leaf:['rough-cut-hedge-hide-v2',[280,275,190,190]]
  };
  const authoredSurfaces={weatherboard:[0,0,1.05],'roof-metal':[512,0,1.8],masonry:[1024,0,1.7],plaster:[0,512,1.8],slate:[512,512,1.2],'forest-floor':[1024,512,2.6]};
  const pixelSurface=createCourseSurfaces(surfaceTextures).texture;
  function material(type,color=0xffffff) {
    const key=type+':'+color;if(materials.has(key))return materials.get(key);
    const authored=authoredSurfaces[type],source=surfaces[type],map=authored?Art.texture('rough-cut-architecture-surfaces-v1',[authored[0],authored[1],512,512],null,true):pixelSurface(type)||(source?Art.texture(...source,null,true):null);
    const m=new THREE.MeshLambertMaterial({map,color});
    // Discrete shade steps keep surface lighting within the illustrated palette.
    // Texture detail stays in world space; camera motion cannot slide its pixels.
    m.onBeforeCompile=s=>{
      s.uniforms.surfaceInvScale={value:1/(authored?authored[2]:.7)};
      s.vertexShader='attribute vec3 surfacePosition;\nattribute vec3 surfaceNormal;\nvarying vec3 vSurfacePosition;\nvarying vec3 vSurfaceNormal;\nvarying vec3 vLeafShade;\n'+s.vertexShader;
      s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
        vSurfacePosition=surfacePosition;vSurfaceNormal=surfaceNormal;
        ${type==='leaf'?`float crown=smoothstep(.12,1.95,surfacePosition.y);
        float cluster=.5+.25*sin(surfacePosition.x*2.1+surfacePosition.z*.8)+.25*sin(surfacePosition.z*2.7-surfacePosition.y*1.3);
        vLeafShade=mix(vec3(.67,.74,.72),vec3(1.06,1.08,.98),crown)*mix(.90,1.06,cluster);`:''}`);
      s.fragmentShader='uniform float surfaceInvScale;\nvarying vec3 vSurfacePosition;\nvarying vec3 vSurfaceNormal;\nvarying vec3 vLeafShade;\n'+s.fragmentShader;
      s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP
        vec3 weights=abs(vSurfaceNormal);${economy?'':'weights*=weights;weights*=weights;weights/=max(dot(weights,vec3(1.0)),.001);'}
        vec3 p=vSurfacePosition*surfaceInvScale;
        vec4 surfaceTexel=${economy?`texture2D(map,weights.x>weights.y&&weights.x>weights.z?p.${authored?'zy':'yz'}:weights.y>weights.z?p.xz:p.xy)`:`texture2D(map,p.${authored?'zy':'yz'})*weights.x+texture2D(map,p.xz)*weights.y+texture2D(map,p.xy)*weights.z`};
        ${type==='forest-floor'?`float growth=.5+.25*sin(vSurfacePosition.x*.61+sin(vSurfacePosition.z*.19))+.25*cos(vSurfacePosition.z*.43-vSurfacePosition.x*.24);
        surfaceTexel=mix(surfaceTexel,texture2D(map,vec2(-p.z,p.x)*.83+vec2(.37,.19)),smoothstep(.25,.75,growth)*.65);
        surfaceTexel.rgb*=mix(.72,1.08,growth);`:''}
        diffuseColor *= surfaceTexel;
        #endif
        diffuseColor.rgb=pow(max(diffuseColor.rgb,vec3(0.0)),vec3(${authored?'.85':'.65'}));
        ${type==='leaf'?`// Broad root/crown shade is interpolated from vertices, keeping
        // its cost independent of screen resolution on software rendering.
        diffuseColor.rgb*=vLeafShade;`:''}`);
      s.fragmentShader=s.fragmentShader.replace('#include <opaque_fragment>', 'vec3 pixelShade = floor(sqrt(max(outgoingLight, vec3(0.0))) * 48.0 + .5) / 48.0;\noutgoingLight = pixelShade * pixelShade;\n#include <opaque_fragment>');
    };
    m.customProgramCacheKey=()=> 'rough-cut-pixel-surfaces-v5-'+(type==='leaf'?'leaf':type==='forest-floor'?'forest':authored?'authored':'procedural')+'-'+economy;materials.set(key,m);return m;
  }
  function uvScale(g,meters=.7) {
    const pos=g.attributes.position,normal=g.attributes.normal,uv=g.attributes.uv;
    for(let i=0;i<pos.count;i++){const nx=Math.abs(normal.getX(i)),ny=Math.abs(normal.getY(i)),nz=Math.abs(normal.getZ(i));uv.setXY(i,(nx>ny&&nx>nz?pos.getZ(i):pos.getX(i))/meters,(ny>nx&&ny>nz?pos.getZ(i):pos.getY(i))/meters);}return g;
  }
  function mesh(root,g,type,color,x=0,y=0,z=0){g.setAttribute('surfacePosition',g.attributes.position.clone());if(type==='leaf'){const sp=g.attributes.surfacePosition;for(let i=0;i<sp.count;i++)sp.setY(i,sp.getY(i)+y);}g.setAttribute('surfaceNormal',g.attributes.normal.clone());const m=new THREE.Mesh(uvScale(g),material(type,color));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;root.add(m);return m;}
  function box(root,type,x,y,z,w,h,d,color=0xffffff,r=.035){
    r=Math.min(r,w*.2,h*.2,d*.2);const g=new THREE.BoxGeometry(1,1,1,3,3,3),p=g.attributes.position;
    for(let i=0;i<p.count;i++){const a=new THREE.Vector3(p.getX(i),p.getY(i),p.getZ(i)),half=[w/2,h/2,d/2];for(let j=0;j<3;j++)a.setComponent(j,Math.sign(a.getComponent(j))*(Math.abs(a.getComponent(j))>.49?half[j]:half[j]-r));const inside=a.clone();for(let j=0;j<3;j++)inside.setComponent(j,THREE.MathUtils.clamp(a.getComponent(j),-half[j]+r,half[j]-r));a.sub(inside).normalize().multiplyScalar(r).add(inside);p.setXYZ(i,a.x,a.y,a.z);}g.computeVertexNormals();return mesh(root,g,type,color,x,y,z);
  }
  const cylinder=(root,type,x,y,z,r,h,color=0xffffff,top=r)=>mesh(root,new THREE.CylinderGeometry(top,r,h,16),type,color,x,y,z);
  function torus(root,type,x,y,z,r,t,color=0xffffff){return mesh(root,new THREE.TorusGeometry(r,t,6,24),type,color,x,y,z);}
  function root(kind,x,z,hull=null,dynamic=false){const r=new THREE.Group();r.position.set(x,0,z);parent.add(r);const entry={root:r,kind,hull,dynamic};records.push(entry);if(!dynamic)staticRecords.push(entry);return r;}
  function rivets(r,w,y,z){for(const x of [-w/2+.05,w/2-.05])cylinder(r,'brass',x,y,z,.018,.025).rotation.x=Math.PI/2;}
  function cover(x,z,rx,rz,stone=false,seed=0){
    const r=root(stone?'stone':'hedge',x,z,{shape:'ellipse',rx,rz});
    const points=(stone?STONE_PROFILE:HEDGE_PROFILE).map(([radius,y])=>new THREE.Vector2(radius,y));
    const g=new THREE.LatheGeometry(points,32);g.scale(rx,1,rz);mesh(r,g,stone?'stone':'leaf',stone?0xb2bdb7:0x9bb5a4);
    // Eight of the original 32 radial samples, contracted toward the center,
    // form a conservative convex interior of this closed, opaque lathe.
    // Foliage cards, roofs and open structures never serve as occluders.
    if(economy){const interior=[];for(const p of points)for(let i=0;i<8;i++){const a=i*Math.PI/4;interior.push(new THREE.Vector3(Math.cos(a)*p.x*rx*.98,1.04+(p.y-1.04)*.98,Math.sin(a)*p.x*rz*.98));}r.userData.solidInterior=interior;}
    if(stone){const count=Math.max(12,Math.ceil(Math.PI*(rx+rz)/.62));for(let row=0;row<4;row++)for(let i=0;i<count;i++){const a=(i+(row%2)*.5)/count*Math.PI*2,ring=.94-row*.025,halfStep=Math.PI/count,span=2*Math.hypot(rx*Math.sin(a),rz*Math.cos(a))*halfStep;const block=box(r,'stone',Math.cos(a)*Math.max(0,rx*ring-.13),.25+row*.46,Math.sin(a)*Math.max(0,rz*ring-.13),span*.94,.43,.27,[0xb4c0b3,0x99afa4,0xc5caba][i%3],.045);block.rotation.y=Math.atan2(rx*Math.sin(a),rz*Math.cos(a));}}
    // Anchored overlapping leaf/stone clusters break the rim while retaining the
    // authoritative footprint, and reveal new surfaces when the player strafes.
    const n=stone?12:20;
    for(let i=0;i<n;i++){const a=i/n*Math.PI*2+(random(i+seed)-.5)*.23,s=.13+random(i+seed)*.22,py=stone?1.76:1.52+random(i+seed+12)*.43;
      const cluster=new THREE.SphereGeometry(1,8,5);cluster.scale(s*1.5,s*.7,s);mesh(r,cluster,stone?'stone':'leaf',stone?0x9dab9e:0xa3baa4,Math.cos(a)*Math.max(0,rx-s),py,Math.sin(a)*Math.max(0,rz-s));
    }
    if(!stone)for(let i=0;i<12;i++){
      const a=i*2.39996+seed,radial=.25+random(i+seed)*.54,s=.14+random(i+seed+31)*.20,g=new THREE.SphereGeometry(1,8,5);g.scale(s*1.4,s*.65,s);
      mesh(r,g,'leaf',[0x9eb79b,0xacc1a3,0x91ab92][i%3],Math.cos(a)*Math.max(0,rx-s)*radial,2.0+random(i+seed+7)*.06,Math.sin(a)*Math.max(0,rz-s)*radial);
    }
    return r;
  }
  function cart(x,z,length,width){
    const r=root('cart',x,z,{shape:'box',width:length,depth:width}),L=length,W=width;
    box(r,'iron',0,.31,0,L*.88,.15,W*.68,0x76877d);
    box(r,'cart-enamel',0,.51,0,L*.93,.25,W*.82,0xc0c8ca,.07);
    box(r,'cart-enamel',-L*.34,.83,0,L*.25,.48,W*.83,0xb8c1c4,.1);
    box(r,'iron',-L*.47,.48,0,.10,.12,W*.94,0xa1a59b);
    for(const zSide of [-1,1])for(const xSide of [-1,1]){
      const wheel=cylinder(r,'rubber',xSide*L*.32,.32,zSide*W*.40,.32,W*.18,0x182521);wheel.rotation.x=Math.PI/2;
      const hub=cylinder(r,'iron',xSide*L*.32,.32,zSide*W*.493,.14,.025,0xa9ada0);hub.rotation.x=Math.PI/2;
      // Tread blocks on the actual rolling surface, not a flat tyre picture.
      for(let i=0;i<12;i++){const a=i*Math.PI/6;const tread=box(r,'rubber',xSide*L*.32+Math.sin(a)*.30,.32+Math.cos(a)*.30,zSide*W*.40,.10,.055,W*.19,0x2d3a31,.01);tread.rotation.z=-a;}
    }
    box(r,'rubber',0,.97,0,L*.25,.13,W*.68,0x7b8270,.055);
    box(r,'rubber',L*.13,1.21,0,.12,.48,W*.67,0x758475,.05);
    for(const zSide of [-1,1]){box(r,'iron',-.10,1.13,zSide*W*.35,L*.28,.05,.045,0xc0ba9c);box(r,'iron',-L*.23,1.49,zSide*W*.39,.045,1.12,.045,0x999f87);box(r,'iron',L*.21,1.49,zSide*W*.39,.045,1.12,.045,0x999f87);}
    box(r,'cart-enamel',-L*.06,2.03,0,L*.72,.13,W*.96,0xd2d5d5,.06);
    // Cargo bed, rails and equipment express the service-cart role from behind.
    box(r,'wood',L*.32,.88,0,L*.28,.08,W*.75,0xb9b79c);
    for(const zSide of [-1,1])box(r,'cart-enamel',L*.32,1.10,zSide*W*.39,L*.28,.36,.07,0xb7bfc1);
    box(r,'cart-enamel',L*.47,1.10,0,.06,.36,W*.81,0xb7bfc1);
    box(r,'rust',L*.29,1.15,W*.18,.26,.43,.22,0x994638,.035);
    const hose=torus(r,'rubber',L*.33,1.06,-W*.15,.22,.04,0x405b3e);hose.rotation.x=Math.PI/2;
    const tool=cylinder(r,'wood',L*.33,1.40,-W*.12,.022,.84,0xbea679);tool.rotation.z=.3;
    box(r,'iron',L*.20,1.81,-W*.12,.22,.09,.07,0x9ba38a);
    const steering=torus(r,'rubber',-L*.19,1.24,0,.18,.022,0x28352e);steering.rotation.y=Math.PI/2;steering.rotation.z=.45;
    for(const side of [-1,1])box(r,'glass',-L*.47,.86,side*W*.28,.025,.13,.19,0xdacb87,.02);
    cylinder(r,'iron',-L*.06,2.13,0,.095,.05,0x666f5d);const beacon=cylinder(r,'glass',-L*.06,2.22,0,.07,.15,0xdba04d,.055);beacon.material=new THREE.MeshBasicMaterial({color:0xdb9d42});
    return r;
  }
  function lanternAt(r,x,y,z,size=1){
    const l=new THREE.Group();l.position.set(x,y,z);l.scale.setScalar(size);r.add(l);
    cylinder(l,'brass',0,.035,0,.13,.07,0xbbaa75);cylinder(l,'brass',0,.43,0,.14,.07,0xbbaa75,.09);
    const glass=cylinder(l,'glass',0,.24,0,.085,.30,0xf8cf81);glass.material=flameMaterial;
    for(let i=0;i<4;i++){const a=i*Math.PI/2;box(l,'iron',Math.cos(a)*.105,.24,Math.sin(a)*.105,.018,.35,.018,0x6e715b,.005);}
    for(const y of [.12,.32]){const rim=torus(l,'brass',0,y,0,.11,.012,0xc1aa74);rim.rotation.x=Math.PI/2;}
    torus(l,'iron',0,.54,0,.065,.012,0x7d8065);glow(l,0,.24,0,.4);return glass;
  }
  const groundLampShapes=new Map();let groundLanternTriangles=0;
  function lantern(x,z){
    const r=root('lantern',x,z),l=new THREE.Group();l.scale.setScalar(1.15);r.add(l);
    // Tiny frame bars need 12 triangles, not bevel subdivisions. Reuse source
    // shapes, retaining the same textured metal, ring silhouette and glass.
    const shape=(key,make,type,color,x=0,y=0,z=0)=>{
      if(!groundLampShapes.has(key))groundLampShapes.set(key,make());
      const g=groundLampShapes.get(key).clone();groundLanternTriangles+=(g.index?.count||g.attributes.position.count)/3;
      return mesh(l,g,type,color,x,y,z);
    };
    shape('base',()=>new THREE.CylinderGeometry(.13,.13,.07,12),'brass',0xbbaa75,0,.035);
    shape('cap',()=>new THREE.CylinderGeometry(.09,.14,.07,12),'brass',0xbbaa75,0,.43);
    shape('glass',()=>new THREE.CylinderGeometry(.085,.085,.30,12),'glass',0xf8cf81,0,.24).material=flameMaterial;
    for(let i=0;i<4;i++){const a=i*Math.PI/2;shape('bar',()=>new THREE.BoxGeometry(.018,.35,.018),'iron',0x6e715b,Math.cos(a)*.105,.24,Math.sin(a)*.105);}
    for(const y of [.12,.32])shape('rim',()=>new THREE.TorusGeometry(.11,.012,4,16),'brass',0xc1aa74,0,y).rotation.x=Math.PI/2;
    shape('handle',()=>new THREE.TorusGeometry(.065,.012,4,16),'iron',0x7d8065,0,.54);
    glow(l,0,.24,0,.4);return r;
  }
  function station(target,kind,x,z){
    const r=root('station-'+kind,x,z,null,true),moving=new THREE.Group();r.add(moving);
    staticRecords.push(records[records.length-1]);
    box(r,'stone',0,.10,0,1.04,.20,.75,0xaab7ac,.08);
    box(r,'wood',-.31,kind==='bell'?1.20:.99,-.14,.21,kind==='bell'?2.18:1.76,.22,0xd4b98b,.03);
    let plateY=2.12,pressureNeedle=null,mechanism=null,replyPage=null,replyHood=null;
    if(kind==='bell'){
      box(r,'wood',.03,2.36,-.14,.96,.15,.24,0xd4b98b);box(r,'brass',-.31,2.02,-.01,.26,.31,.04,0xc2a570);plateY=2.55;
      moving.position.set(.18,2.19,0);moving.scale.setScalar(1.12);
      const bell=new THREE.LatheGeometry([[.07,0],[.10,-.06],[.12,-.18],[.20,-.38],[.31,-.49],[.34,-.52],[.30,-.55],[.27,-.51],[.16,-.35],[.07,-.10]].map(p=>new THREE.Vector2(...p)),32);mesh(moving,bell,'brass',0xf2d498);
      for(const y of [-.50,-.47,-.12]){const rim=torus(moving,'brass',0,y,0,y<-.4?.315:.105,.012,0xf6dc9c);rim.rotation.x=Math.PI/2;}
      cylinder(moving,'iron',0,-.40,0,.018,.44,0x7b7462);cylinder(moving,'iron',0,-.61,0,.055,.065,0x645a44);
      cylinder(r,'wood',.45,.90,.10,.016,1.18,0xcbb486);torus(r,'wood',.45,.29,.10,.035,.012,0xcbb486);
    }else if(kind==='supply'){
      // Service locker: recessed shelves, slatted drawer and a brass latch.
      for(const side of [-1,1])box(r,'iron',side*.43,.75,0,.12,1.35,.70,0x829080,.025);
      box(r,'iron',0,1.39,0,.98,.11,.78,0x9baa94,.025);
      box(r,'wood',0,.77,-.34,.80,1.12,.08,0x8e947c,.02);
      for(const yy of [.27,.77,1.17])box(r,'wood',0,yy,.02,.82,.07,.65,0xb9ac87,.012);
      box(r,'paper',-.20,1.25,.05,.24,.12,.32,0xd1cab0,.008);
      for(let i=0;i<3;i++)mesh(r,new THREE.SphereGeometry(.065,8,6),'paper',0xd9d9bd,.12+i*.12,1.27,.14);
      moving.position.set(0,.53,.29);box(moving,'paint',0,0,0,.79,.38,.08,0x819581,.02);
      for(let i=0;i<4;i++)box(moving,'iron',-.28+i*.18,0,.045,.11,.018,.018,0x344b42);
      box(moving,'brass',0,.11,.06,.22,.035,.06,0xc4b180);
      box(r,'iron',0,.10,.20,.94,.12,.72,0x64786c,.02);plateY=1.8;
    }else if(kind==='practice'){
      // Low target gong, visibly unlike the tall hanging Audit Bell.
      box(r,'wood',0,.66,-.15,.78,.94,.12,0x8e9b80,.025);
      moving.position.set(.05,.83,.02);
      const gong=mesh(moving,new THREE.CylinderGeometry(.33,.33,.055,24),'brass',0xccb47e);gong.rotation.x=Math.PI/2;
      torus(moving,'paint',0,0,.035,.23,.022,0x3a5147);torus(moving,'paint',0,0,.04,.11,.020,0x3a5147);
      cylinder(r,'iron',.05,1.11,.02,.018,.21,0x697d73);plateY=1.8;
    }else if(kind==='log'){
      box(r,'iron',0,.63,0,.35,.97,.31,0xa9b2a3);box(r,'wood',0,1.02,.05,.91,.16,.61,0xe0c393);
      box(r,'iron',0,1.52,-.19,.94,.95,.16,0xb9c1ae,.05);
      const page=box(r,'paper',-.08,1.52,-.085,.66,.78,.028,0xffffff,.006);page.rotation.x=-.12;
      box(r,'iron',0,2.01,-.10,1.06,.11,.45,0xa2ac9b,.05);
      moving.position.set(.28,1.32,.17);box(moving,'iron',0,0,0,.19,.12,.19,0xac9f7b);cylinder(moving,'wood',0,.15,0,.045,.22,0xc7ab78);cylinder(moving,'iron',0,.29,0,.075,.08,0x686b54);
    }else if(kind==='release'){
      box(r,'wood',.28,1.05,-.13,.19,1.88,.24,0xc5b487);box(r,'wood',-.12,1.94,-.13,.94,.15,.23,0xc5b487);
      const gong=mesh(r,new THREE.SphereGeometry(.31,24,12),'brass',0xd0b881,-.26,1.46,0);gong.scale.z=.20;
      torus(r,'brass',-.26,1.46,.025,.29,.015,0xe5c991);
      box(r,'wood',.24,1.11,.13,.48,.65,.09,0xd2c196);box(r,'paper',.24,1.12,.19,.43,.59,.018,0xffffff,.004);
      box(r,'iron',.53,.86,.37,.24,.10,.13,0x686b54,.008);
      moving.position.set(.61,.85,.40);cylinder(moving,'iron',0,.23,0,.025,.46,0x9b9e87);cylinder(moving,'wood',0,.49,0,.075,.12,0xb08d63);
    }else if(kind==='valve'){
      // Cast-iron riser, threaded unions, bolted flange and bypass pipe.
      cylinder(r,'iron',0,.54,0,.105,.89,0x91a493);
      for(const y of [.18,.74,.92]){
        cylinder(r,'brass',0,y,0,.15,.075,0xb7a675);
        for(let i=0;i<4;i++){const a=i*Math.PI/2;mesh(r,new THREE.CylinderGeometry(.022,.022,.035,6),'iron',0xb6b39b,Math.sin(a)*.118,y+.049,Math.cos(a)*.118);}
      }
      for(let i=0;i<5;i++)cylinder(r,'iron',0,.81+i*.018,0,.112,.008,0x586e62);
      cylinder(r,'paint',0,1.03,0,.15,.25,0x8bb5a9);
      const cross=cylinder(r,'iron',.21,.61,0,.045,.40,0x7c9484);cross.rotation.z=Math.PI/2;
      cylinder(r,'iron',.40,.83,0,.045,.45,0x7c9484);
      const gauge=mesh(r,new THREE.CylinderGeometry(.14,.14,.07,16),'brass',0xa8996b,.40,1.08,.03);gauge.rotation.x=Math.PI/2;
      mesh(r,new THREE.CircleGeometry(.113,16),'paper',0xc9c6a8,.40,1.08,.071);
      for(let i=0;i<7;i++){const a=-2.4+i*.8;const tick=box(r,'iron',.40+Math.sin(a)*.092,1.08+Math.cos(a)*.092,.077,.009,.022,.008,0x40584c,.001);tick.rotation.z=-a;}
      pressureNeedle=new THREE.Group();pressureNeedle.position.set(.40,1.08,.086);r.add(pressureNeedle);
      box(pressureNeedle,'rust',0,.039,0,.012,.085,.012,0xc29366,.002);pressureNeedle.traverse(o=>o.userData.keepDynamic=true);
      moving.position.y=1.2;moving.rotation.x=-.62;
      const wheel=torus(moving,'rust',0,0,0,.27,.035,0xba7251);wheel.rotation.x=Math.PI/2;
      for(const a of [0,Math.PI/3,Math.PI*2/3]){const spoke=box(moving,'rust',0,0,0,.53,.035,.035,0xba7251,.006);spoke.rotation.y=a;}
      plateY=1.7;
    }else if(kind==='key'){
      box(r,'wood',0,1.1,0,.44,.58,.16,0xb6a278);box(r,'paper',0,1.05,.09,.20,.36,.025,0xdad1af,.003);moving.position.set(0,1.18,.13);moving.scale.setScalar(1.15);torus(moving,'brass',0,0,0,.075,.018,0xf3d88a);box(moving,'brass',0,-.14,0,.025,.19,.025,0xf3d88a,.004);box(moving,'brass',.035,-.21,0,.08,.025,.025,0xf3d88a,.004);plateY=1.7;
    }
    if(kind==='log'||kind==='release'){
      // Low service counter with loose, slightly rotated forms and a hood.
      // Existing pixel paper/iron/wood materials join the normal static batches.
      const counterY=kind==='log'?1.10:.93;
      if(kind==='release'){
        box(r,'wood',.02,counterY-.05,.18,1.06,.10,.76,0xb4a27e,.02);
        replyHood=new THREE.Group();replyHood.position.set(0,2.03,.31);r.add(replyHood);
        box(replyHood,'iron',0,0,-.36,1.22,.08,.72,0x829080,.02);
        replyHood.traverse(o=>o.userData.keepDynamic=true);
        for(const side of [-1,1])box(r,'wood',side*.50,1.38,-.27,.055,1.28,.055,0x9e9676);
      }
      for(let i=0;i<3;i++){
        if(kind==='log'&&i===2){
          replyPage=new THREE.Group();replyPage.position.set(-.06,counterY+.023,.22);replyPage.rotation.y=.19;r.add(replyPage);
          box(replyPage,'paper',.14,0,0,.28,.009,.33,0xdad1af,.001);
          replyPage.traverse(o=>o.userData.keepDynamic=true);
        }else{const sheet=box(r,'paper',-.20+i*.14,counterY+.005+i*.009,.22,.28,.009,.33,0xdad1af,.001);sheet.rotation.y=(i-1)*.19;}
      }
      for(let i=0;i<2;i++){
        const sheet=box(r,'paper',.60+i*.20,.043,.35+i*.22,.18,.008,.23,0x8c9279,.001);sheet.rotation.y=.3+i*.7;
      }
    }
    if(kind==='log'){
      // The stamp lands on a supported form, not through the countertop.
      box(r,'paper',.28,1.112,.17,.25,.024,.27,0xdad1af,.001);
      for(let i=0;i<3;i++)box(r,'iron',-.14,1.128,.13+i*.065,.28,.002,.008,0x686b54,.001);
      box(r,'iron',.28,1.119,-.005,.26,.014,.035,0x686b54,.001);
      // Guide frame keeps the press grounded while its plunger moves.
      box(r,'iron',.44,1.43,.02,.055,.66,.065,0x686b54,.004);
      box(r,'iron',.35,1.73,.11,.26,.065,.25,0x829080,.008);
      cylinder(moving,'iron',0,.32,0,.023,.50,0xac9f7b);
      mechanism={stampRest:1.32,stampTravel:.136,page:replyPage};
    }else if(kind==='release'){
      // A slotted receipt mechanism makes the pulled lever's result physical.
      box(r,'iron',-.18,1.12,.20,.43,.32,.12,0x686b54,.015);
      box(r,'iron',-.18,1.16,.267,.34,.07,.018,0x344b42,.002);
      const receipt=new THREE.Group();receipt.position.set(-.18,1.15,.28);r.add(receipt);
      box(receipt,'paper',0,.10,0,.27,.24,.012,0xdad1af,.001);
      box(receipt,'seal',.06,.14,.008,.07,.065,.004,0xb96947,.001);
      for(let i=0;i<3;i++)box(receipt,'iron',-.02,.07+i*.035,.009,.16,.009,.004,0x686b54,.001);
      // A stationary housing masks the lower slip as it emerges.
      box(r,'iron',-.18,1.06,.31,.38,.18,.045,0x829080,.008);
      receipt.traverse(o=>o.userData.keepDynamic=true);
      receipt.visible=false;mechanism={receipt,hood:replyHood};
    }
    // Labels attach to a fixed bracket; walking around them reveals their back.
    if(kind!=='practice'){
    // Mount the field-check signs in front of their hood/crossbeam. A sign
    // behind the overhang loses its lower text when approached or crouched.
    const hooded=kind==='log'||kind==='release',forward=hooded||kind==='bell';
    if(hooded)plateY=2.06;else if(kind==='bell')plateY=2.34;
    const plateZ=hooded?.38:kind==='bell'?.03:-.13;
    box(r,'iron',0,hooded?plateY-.02:plateY-.07,hooded?plateZ-.16:forward?plateZ-.08:-.16,.06,hooded?.06:.32,hooded?.40:forward?.20:.06,0x999b7e);
    box(r,'wood',0,plateY,plateZ,1.0,.28,.09,0xb9ab86);
    const plate=label(kind==='supply'?'SUPPLIES':target.name||target.shortLabel||target.label||kind.toUpperCase(),.96);plate.position.set(0,plateY,plateZ+.052);r.add(plate);
    }
    // Reuse the station's existing lantern: height gives each real mechanism a silhouette.
    const lamp=lanternAt(r,-.51,kind==='bell'?2.02:['log','release'].includes(kind)?1.72:kind==='key'||kind==='valve'?1.1:.45,-.02,.63);
    // State tint belongs to this station, not every flame on the course.
    // Clones reuse the same shader and time uniforms; no new draw or program.
    lamp.material=flameMaterial.clone();lamp.material.onBeforeCompile=flameMaterial.onBeforeCompile;lamp.material.customProgramCacheKey=flameMaterial.customProgramCacheKey;
    // Present the actual mechanism toward the player starting position; labels/lamps and
    // the interaction animation turn together, without changing its world anchor.
    r.rotation.y=target.facing??0;
    const ink=box(r,'seal',kind==='valve'?0:.31,kind==='log'?1.51:kind==='valve'?.50:1.13,kind==='valve'?.11:.22,kind==='valve'?.07:.15,kind==='valve'?.07:.15,.02,0xb96947,.008);ink.name='completed-ink';ink.visible=false;
    if(kind==='log'){ink.position.set(.28,1.126,.17);ink.rotation.x=-Math.PI/2;ink.scale.set(.8,.8,.15);}
    moving.traverse(o=>o.userData.keepDynamic=true);ink.userData.keepDynamic=true;lamp.userData.keepDynamic=true;
    if(kind==='log')rivets(r,.80,1.02,.38);else rivets(r,.96,.10,.385);
    return {root:r,moving,lamp,target,kind,pressureNeedle,mechanism};
  }
  const {tree,prepareTrees,disposeTrees,treePreparationStats}=createTrees({root,mesh});
  function reeds(x,z,rx,rz){
    const r=root('reed-bed',x,z,{shape:'ellipse',rx,rz});
    const shore=new THREE.RingGeometry(.90,1.015,48,2);shore.rotateX(-Math.PI/2);shore.scale(rx,1,rz);mesh(r,shore,'forest-floor',0x728473,0,.087,0);
    if(!materials.has('reeds')){const m=new THREE.MeshLambertMaterial({map:Art.texture('rough-cut-verge-atlas-v1',[420,90,415,485]),alphaTest:.22,side:THREE.DoubleSide,color:0xb2c6a8});m.onBeforeCompile=reedShader;m.customProgramCacheKey=()=> 'course-reed-contact-v2';m.userData.reedWind=true;materials.set('reeds',m);
      reedDepth=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:m.map,alphaTest:.22,side:THREE.DoubleSide});reedDepth.onBeforeCompile=reedShader;reedDepth.customProgramCacheKey=()=> 'course-reed-contact-depth-v2';}
    for(let i=0;i<24;i++){const a=i*2.4,radial=.76+random(i+z)*.20,h=.65+random(i+x)*1.25;for(const turn of [0,Math.PI/2]){const g=new THREE.PlaneGeometry(.48+random(i+17)*.25,h);g.setAttribute('surfacePosition',g.attributes.position.clone());g.setAttribute('surfaceNormal',g.attributes.normal.clone());const plant=new THREE.Mesh(g,materials.get('reeds'));plant.position.set(Math.cos(a)*Math.max(0,rx-.15)*radial,h/2,Math.sin(a)*Math.max(0,rz-.15)*radial);plant.rotation.y=a+turn;r.add(plant);}}
    return r;
  }
  function irrigationHead(head){
    const r=root('irrigation-head',head.x,head.z);r.rotation.y=head.angle;
    const round=(x,y,z,radius,height,type,color,segments=12)=>mesh(r,new THREE.CylinderGeometry(radius,radius,height,segments),type,color,x,y,z);
    round(0,.045,0,.19,.07,'iron',0x647467);
    round(0,.11,0,.10,.08,'brass',0xb7a675);
    round(0,.21,0,.047,.17,'iron',0x91a493,10);
    for(const y of [.15,.27])round(0,y,0,.071,.035,'brass',0xc0ad79);
    const nozzle=round(0,.30,.06,.044,.19,'brass',0xd1b67a,8);nozzle.rotation.x=Math.PI/3;
    const mouth=round(0,.35,.145,.027,.013,'iron',0x263a34,8);mouth.rotation.x=Math.PI/3;
    // Small impact arm and return spring give a recognizable mechanical profile.
    box(r,'iron',-.075,.30,.015,.026,.035,.22,0x829381,.004);
    box(r,'brass',-.07,.32,.14,.065,.025,.045,0xc4aa70,.004);
    for(let i=0;i<5;i++)round(-.07,.30,-.065+i*.016,.023,.008,'iron',0x728576,6).rotation.x=Math.PI/2;
    for(let i=0;i<3;i++){const a=i*Math.PI*2/3;round(Math.sin(a)*.14,.09,Math.cos(a)*.14,.021,.025,'iron',0x9c9c80,6);}
    return r;
  }
  function board(x,z,width){const r=root('notice-board',x,z);for(const side of [-1,1])box(r,'wood',side*width*.38,.86,0,.10,1.72,.12,0xc1af89);box(r,'wood',0,1.45,0,width,.89,.14,0xb8b094);box(r,'iron',0,1.96,0,width+.12,.07,.28,0x9ca48f);return r;}
  function floodlight(x,z){
    const r=root('floodlight',x,z);box(r,'stone',0,.15,0,.48,.3,.48,0xa2aca2);cylinder(r,'iron',0,1.65,0,.055,3.1,0xa1ac98);
    const fixture=box(r,'glass',0,3.13,.09,.54,.28,.08,0xe7d09b),source=fixture.material;
    // Lenses have independent power. Keep the pixel shading callbacks when
    // cloning; shared surface materials would make the last lamp win.
    fixture.material=source.clone();fixture.material.onBeforeCompile=source.onBeforeCompile;fixture.material.customProgramCacheKey=source.customProgramCacheKey;
    fixture.material.color.setHex(0x26332d);fixture.material.emissive.setHex(0xffedbb);fixture.material.emissiveIntensity=1.6;
    fixture.userData.keepDynamic=true;box(r,'iron',0,3.13,-.04,.66,.40,.20,0x919f89);return fixture;
  }
  function post(x,z){const r=root('boundary-post',x,z);cylinder(r,'wood',0,.44,0,.055,.88,0xc9af7e);cylinder(r,'iron',0,.87,0,.075,.07,0xb5aa88,.045);return r;}
  function boundaryRope(x,z,length=2.7){
    const r=root('boundary-rope',x,z);
    // Fixed sagging rope marks the existing collision boundary. The path runs
    // outside the player hull and does not add a second invisible collider.
    const points=[];
    for(let i=0;i<=8;i++){const t=i/8;points.push(new THREE.Vector3(0,.73-Math.sin(t*Math.PI)*.17,-length*t));}
    mesh(r,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),12,.026,5,false),'wood',0xc1b28c);
    for(const zOffset of [0,-length])torus(r,'iron',0,.73,zOffset,.055,.013,0x9c9877).rotation.y=Math.PI/2;
    return r;
  }
  function rearFence(left,right,z){
    // A visible face for the existing course limit, just outside the player
    // center clamp. Simple solid timber shares the static material/chunk batches.
    const count=Math.ceil((right-left)/1.9),width=(right-left)/count;
    for(let i=0;i<count;i++){
      const r=root('rear-fence',left+(i+.5)*width,z);
      const timber=(x,y,zz,w,h,d,color)=>mesh(r,new THREE.BoxGeometry(w,h,d),'wood',color,x,y,zz);
      for(const x of [-width/2,...(i===count-1?[width/2]:[])]){
        timber(x,.96,0,.14,1.92,.16,0x94a3a0);
        mesh(r,new THREE.BoxGeometry(.17,.055,.19),'iron',0xa4b0af,x,1.94,0);
      }
      for(const y of [.40,1.30])timber(0,y,0,width,.13,.10,0x8c9b98);
      const brace=timber(0,.85,-.07,Math.hypot(width,.9),.075,.06,0x778a87);
      brace.rotation.z=(i%2?1:-1)*Math.atan2(.9,width);
      for(let j=0;j<8;j++){
        const x=-width/2+(j+.5)*width/8,h=1.64+random(i*8+j+206)*.13;
        const slat=timber(x,h/2+.04,.08,.13,h,.055,[0x96a4a0,0x81938f,0xa0aaa3][j%3]);
        slat.rotation.z=(random(i*8+j+90)-.5)*.018;
      }
    }
  }
  function drain(x,z){
    const r=root('drain',x,z),d=DRAIN_LAYOUT.stone;
    const arch=mesh(r,new THREE.TorusGeometry(1.04,.22,8,32,Math.PI),'stone',0xb0bfb6,0,.12,0);
    const tunnel=mesh(r,new THREE.CylinderGeometry(1.02,1.02,1.9,32,1,true,0,Math.PI),'iron',0x687f79,0,.12,-.93);
    tunnel.rotation.x=Math.PI/2;tunnel.rotation.y=Math.PI/2;tunnel.material=material('iron',0x687f79).clone();tunnel.material.side=THREE.DoubleSide;
    for(const side of [-1,1]){
      const m=box(r,'stone',side*d.x,d.y,d.z,d.w,d.h,d.d,0x9fae9b,.08);m.userData.keepDynamic=true;
      r.name='DrainMasonry';m.name='drain-stone-'+(side<0?'west':'east');drainCollisionParts.push({id:m.name,owner:r,mesh:m});
    }
    return arch;
  }

  function plank(parent,x,y,z,w,h,d){return box(parent,'wood',x,y,z,w,h,d,0xc3b994);}
  async function finish(cancelled=()=>false){
    // Merge fixed geometry by surface and spatial chunk. Animated mechanisms are
    // left independent; added craftsmanship does not require one draw per rivet.
    await prepareTrees(cancelled);if(cancelled())return;
    for(const record of staticRecords){const clearance=record.root.userData.courseCanopyClearance;if(clearance)record.root.userData.canopyClearance=raiseCourseCanopy(record.root,clearance);}
    const batches=new Map(),batchMaterials=new Map(),geometryUses=new Map();
    // Fixed source meshes are consumed by this merge. Transfer unique arrays
    // directly; clone only genuinely shared geometry before transforming it.
    parent.traverse(o=>{if(o.isMesh)geometryUses.set(o.geometry,(geometryUses.get(o.geometry)||0)+1);});
    parent.updateMatrixWorld(true);let slice=performance.now();
    if(economy)for(const record of staticRecords)if(record.root.userData.solidInterior)solidOcclusion.addHull(record.root.userData.solidInterior,record.root.matrixWorld);
    const yieldFrame=()=>yieldCpuPreparation(cancelled);
    for(const record of staticRecords){if(cancelled())return;const bound=new THREE.Box3().setFromObject(record.root);record.bounds=[bound.min.toArray(),bound.max.toArray()];const remove=[];
      const objects=[];record.root.traverse(o=>{if(o.isMesh&&!o.isSprite&&!o.material.transparent&&!o.userData.keepDynamic)objects.push(o);});
      for(const o of objects){
        if(cancelled())return;
        const source=o.material,g=geometryUses.get(o.geometry)>1?o.geometry.clone():o.geometry;
        // Tint belongs to vertices, not a separate draw/material for each nail,
        // plank or leaf. Preserve authored vertex colors and shader variants.
        const surfaceKey=[source.type,source.map?.uuid,source.alphaMap?.uuid,source.side,source.alphaTest,source.customProgramCacheKey()].join(':');
        if(!batchMaterials.has(surfaceKey)){
          const shared=source.clone();shared.color.set(0xffffff);shared.vertexColors=true;
          shared.onBeforeCompile=source.onBeforeCompile;shared.customProgramCacheKey=source.customProgramCacheKey;
          batchMaterials.set(surfaceKey,shared);
        }
        const colors=new Float32Array(g.attributes.position.count*3),original=source.vertexColors?g.attributes.color:null;
        for(let i=0;i<g.attributes.position.count;i++){colors[i*3]=source.color.r*(original?original.getX(i):1);colors[i*3+1]=source.color.g*(original?original.getY(i):1);colors[i*3+2]=source.color.b*(original?original.getZ(i):1);}
        g.setAttribute('color',new THREE.BufferAttribute(colors,3));
        if(!g.attributes.surfacePosition)g.setAttribute('surfacePosition',g.attributes.position.clone());
        if(!g.attributes.surfaceNormal)g.setAttribute('surfaceNormal',g.attributes.normal.clone());
        g.applyMatrix4(o.matrixWorld);
        g.computeBoundingBox();if(source.userData.reedWind)g.boundingBox.expandByScalar(VEGETATION_PADDING);const center=g.boundingBox.getCenter(new THREE.Vector3());
        // Software rendering still culls each original piece below. Wider
        // batches share buffers/draws without dropping visible canopy detail.
        const chunkSize=economy?20:12;
        const origin=economy?center:record.root.position;
        const key=Math.floor(origin.x/chunkSize)+':'+Math.floor(origin.z/chunkSize)+':'+surfaceKey;
        if(!batches.has(key))batches.set(key,{material:batchMaterials.get(surfaceKey),position:[],normal:[],uv:[],surfacePosition:[],surfaceNormal:[],color:[],indices:[],vertices:0,parts:[],indexCount:0});
        const b=batches.get(key);for(const name of ['position','normal','uv','surfacePosition','surfaceNormal','color'])b[name].push(g.attributes[name].array);
        // Preserve shared vertices: expansion tripled vertex shading and buffer
        // upload work on the software renderer without adding any art detail.
        const indices=new Uint32Array(g.index?.count||g.attributes.position.count);
        for(let i=0;i<indices.length;i++)indices[i]=(g.index?g.index.getX(i):i)+b.vertices;
        if(economy)b.parts.push({bounds:g.boundingBox.clone(),offset:b.indexCount,count:indices.length,visible:true});b.indexCount+=indices.length;
        b.indices.push(indices);b.vertices+=g.attributes.position.count;
        g.dispose();remove.push(o);
        if(performance.now()-slice>5){await yieldFrame();slice=performance.now();}
      }
      for(const o of remove){o.removeFromParent();o.geometry.dispose();}
      if(performance.now()-slice>8){await yieldFrame();slice=performance.now();}
    }
    for(const b of batches.values()){
      if(cancelled())return;
      const g=new THREE.BufferGeometry();
      for(const name of ['position','normal','uv','surfacePosition','surfaceNormal',...(b.color?['color']:[])]){
        // Keep typed chunks instead of expanding millions of floats into JS
        // arguments/number arrays, then allocating and copying them again.
        const chunks=b[name],data=new Float32Array(chunks.reduce((n,a)=>n+a.length,0));
        let offset=0;for(const chunk of chunks){data.set(chunk,offset);offset+=chunk.length;}
        g.setAttribute(name,new THREE.BufferAttribute(data,name==='uv'?2:3));
      }
      const indices=createIndexArray(b.vertices,b.indices.reduce((n,a)=>n+a.length,0));let indexOffset=0;
      for(const chunk of b.indices){indices.set(chunk,indexOffset);indexOffset+=chunk.length;}
      g.setIndex(new THREE.BufferAttribute(indices,1));
      g.computeBoundingSphere();const m=new THREE.Mesh(g,b.material);m.castShadow=m.receiveShadow=true;if(b.material.userData.reedWind){m.customDepthMaterial=reedDepth;g.boundingSphere.radius+=VEGETATION_PADDING;}parent.add(m);
      if(economy){m.userData.visibilityParts=b.parts;m.userData.fullIndices=indices.slice();g.index.setUsage(THREE.DynamicDrawUsage);}
      g.computeBoundingBox();if(b.material.userData.reedWind)g.boundingBox.expandByScalar(VEGETATION_PADDING);culledMeshes.push(m);
      // Use the same visible pieces for light reach. Empty space inside a
      // wider batch must not force lighting work on distant visible foliage.
      localLighting?.register(m,b.parts);
      if(performance.now()-slice>8){await yieldFrame();slice=performance.now();}
    }
  }
  function updateCulling(camera){
    if(!economy)return; // Offscreen geometry must still cast hardware shadows.
    cullProjection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
    if(cullValid&&lastCullProjection.equals(cullProjection))return;
    lastCullProjection.copy(cullProjection);cullValid=true;cullFrustum.setFromProjectionMatrix(cullProjection);
    solidOcclusion.update(camera);occludedParts=0;
    for(const mesh of culledMeshes){
      const planeMask=frustumBoxMask(cullFrustum,mesh.geometry.boundingBox);
      mesh.visible=planeMask!==-1;if(!mesh.visible)continue;
      const parts=mesh.userData.visibilityParts;let changed=!mesh.userData.compacted;
      for(const part of parts){
        let visible=intersectsFrustumMask(cullFrustum,part.bounds,planeMask);
        if(visible&&solidOcclusion.hidden(part.bounds)){visible=false;occludedParts++;}
        if(visible!==part.visible){part.visible=visible;changed=true;}
      }
      if(!changed){mesh.visible=mesh.geometry.drawRange.count>0;continue;}
      // Keep every visible triangle and its original attributes. Omit ranges
      // wholly outside the camera or proven hidden behind solid cover.
      const g=mesh.geometry,source=mesh.userData.fullIndices;
      // Retain immutable vertex buffers and untouched packed index runs.
      compactVisibleIndices(g,parts,source);
      mesh.userData.compacted=true;
      mesh.visible=g.drawRange.count>0;
    }
  }
  function dispose(){buildings.disposeClubhouseWindows();disposeTrees();reedDepth?.dispose();for(const g of groundLampShapes.values())g.dispose();flameMaterial.dispose();localLighting?.dispose();for(const t of surfaceTextures.values())t.dispose();for(const m of materials.values())m.dispose();}
  function stats(){return {mode:'fixed-volumes',drainCollisionArt:drainCollisionParts.map(p=>collisionArtBounds(p.id,p.owner,[p])),clubhouseWindows:buildings.clubhouseWindowStats(),lanternColor:flameMaterial.color.getHex(),groundLanternTriangles,occlusion:{solids:solidOcclusion.count(),parts:occludedParts},treePreparation:treePreparationStats(),surfaces:materials.size,objects:records.map(e=>{if(!e.bounds&&e.dynamic){const q=new THREE.Box3().setFromObject(e.root);e.bounds=[q.min.toArray(),q.max.toArray()];}return {kind:e.kind,position:e.root.position.toArray(),rotation:e.root.rotation.toArray().slice(0,3),hull:e.hull,bounds:e.bounds,form:e.root.userData.treeForm,canopyClearance:e.root.userData.canopyClearance,moving:e.dynamic?{rotation:e.root.children.find(o=>o.type==='Group')?.rotation.toArray().slice(0,3)}:undefined};})};}
  const buildings=createBuildings({root,mesh,box,cylinder,torus,lanternAt,label});
  const landscape=createLandscape({root,mesh,cylinder});
  return {cover,cart,station,irrigationHead,lantern,updateLanterns,updateReeds,reedStats:()=>({time:reedTime.value,wind:reedWind.value,contact:reedContact.stats()}),tree,reeds,board,floodlight,post,boundaryRope,rearFence,...buildings,...landscape,drain,plank,finish,updateCulling,localLighting,stats,dispose};
}
