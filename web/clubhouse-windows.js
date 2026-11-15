import * as THREE from './vendor/three/three.module.js';

// Fixed window apertures render an empty room in perspective. The rooms remain
// scenery outside the course boundary; no camera-facing cards or extra lights.
export function createClubhouseWindows(parent,{roomKind='clubhouse',name='ClubhouseEmptyRooms',depth=1.8,roomLight=null}={}){
  const workshop=roomKind==='workshop';
  const entries=[];let mesh=null,disposed=false;
  const material=new THREE.ShaderMaterial({fog:true,
    uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{roomEnabled:{value:1}}]),
    vertexShader:`
      attribute vec3 roomRight,roomUp,roomSize;
      attribute float roomSeed,roomLight;
      varying vec2 vUv;
      varying vec3 vRay,vRight,vUp,vSize;
      varying float vSeed,vRoomLight;
      #include <fog_pars_vertex>
      void main(){
        vUv=uv;vSize=roomSize;vSeed=roomSeed;vRoomLight=roomLight;
        vRight=mat3(modelMatrix)*roomRight;vUp=mat3(modelMatrix)*roomUp;
        vec4 world=modelMatrix*vec4(position,1.0);
        vRay=world.xyz-cameraPosition;
        vec4 mvPosition=viewMatrix*world;
        gl_Position=projectionMatrix*mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader:`
      uniform float roomEnabled;
      varying vec2 vUv;
      varying vec3 vRay,vRight,vUp,vSize;
      varying float vSeed,vRoomLight;
      #include <fog_pars_fragment>
      float boxHit(vec3 ro,vec3 rd,vec3 lo,vec3 hi){
        vec3 inv=1.0/rd,a=(lo-ro)*inv,b=(hi-ro)*inv;
        vec3 near=min(a,b),far=max(a,b);
        float enter=max(max(near.x,near.y),near.z),leave=min(min(far.x,far.y),far.z);
        return leave>=max(enter,0.0)?max(enter,0.0):10000.0;
      }
      ${workshop?`void roomObject(vec3 ro,vec3 ray,vec3 lo,vec3 hi,vec3 base,inout float nearest,inout vec3 col){
        float f=boxHit(ro,ray,lo,hi);
        if(f>=nearest)return;
        nearest=f;vec3 p=ro+ray*f,edge=min(abs(p-lo),abs(p-hi));
        float shade=edge.x<edge.y&&edge.x<edge.z?.66:edge.y<edge.z?(p.y>(lo.y+hi.y)*.5?1.05:.50):.82;
        col=base*shade;
      }`:''}
      void main(){
        vec3 right=normalize(vRight),up=normalize(vUp),normal=cross(right,up);
        vec3 ray=vec3(dot(vRay,right)/vSize.x,dot(vRay,up)/vSize.y,-dot(vRay,normal)/vSize.z);
        ray=sign(ray+vec3(.000001))*max(abs(ray),vec3(.00001));
        ray.z=max(.00001,ray.z);
        // Quantized aperture samples keep the detail in the game's pixel idiom.
        vec2 samples=${workshop?'max(vec2(72.),floor(vSize.xy*192.))':'vec2(72.,96.)'};
        vec2 uv=(floor(vUv*samples)+.5)/samples;
        vec3 ro=vec3(uv,0.0);
        vec3 far=(step(vec3(0.),ray)-ro)/ray;
        float t=min(min(far.x,far.y),far.z);
        vec3 hit=ro+ray*t;
        float floorTile=mod(floor(hit.x*7.)+floor(hit.z*9.),2.);
        vec3 col=vec3(.28,.195,.098);
        if(hit.y<.002)col=mix(vec3(.058,.038,.017),vec3(.088,.057,.027),floorTile);
        else if(hit.y>.998){
          col=vec3(.34,.27,.15);
          if(abs(hit.x-.5)<.16&&abs(hit.z-.56)<.12)col=vec3(.88,.66,.31);
        }else{
          float panel=step(.32,hit.y);
          col=mix(vec3(.10,.065,.026),col,panel);
          if(abs(hit.y-.32)<.018||hit.y>.94)col*=.65;
          if(hit.z>.998){
            col*=.82+.10*step(.5,fract(hit.x*18.));
            // One framed course print on the back wall, with no human figure.
            if(hit.x>.12&&hit.x<.40&&hit.y>.58&&hit.y<.85){
              col=vec3(.075,.048,.021);
              if(hit.x>.14&&hit.x<.38&&hit.y>.60&&hit.y<.83)
                col=hit.y<.68+sin(hit.x*24.)*.025?vec3(.09,.13,.064):vec3(.29,.29,.17);
            }
          }
        }
        ${workshop?`
        // Service rooms have timber lining, a peg rail and a workbench. All
        // intersections share the room ray, so objects reveal their sides.
        if(hit.y>.002&&hit.y<.998){
          float board=fract((hit.z>.998?hit.x:hit.z)*13.);
          col=vec3(.19,.135,.068)*(.83+.17*step(.035,board));
          vec2 grain=floor(vec2(hit.z>.998?hit.x:hit.z,hit.y)*vec2(192.,128.));
          float fibre=step(.80,fract(sin(floor(grain.x*.5)*19.1+floor(grain.y*.08)*7.3)*437.1));
          col*=1.-fibre*.13;
          if(hit.y<.22)col*=.61;
          if(hit.z>.998&&abs(hit.y-.78)<.025)col=vec3(.10,.065,.028);
        }
        float nearest=t,f;
        // Bench top and front legs, with paper left beside a closed tool case.
        roomObject(ro,ray,vec3(.07,.29,.48),vec3(.93,.35,.92),vec3(.23,.14,.059),nearest,col);
        roomObject(ro,ray,vec3(.10,0.,.52),vec3(.16,.29,.58),vec3(.09,.057,.024),nearest,col);
        roomObject(ro,ray,vec3(.83,0.,.52),vec3(.89,.29,.58),vec3(.09,.057,.024),nearest,col);
        roomObject(ro,ray,vec3(.58,.351,.61),vec3(.82,.46,.81),vec3(.064,.092,.075),nearest,col);
        roomObject(ro,ray,vec3(.20,.351,.56),vec3(.43,.355,.71),vec3(.48,.37,.20),nearest,col);
        // Two wall shelves and cans of different heights, behind the bench.
        for(int row=0;row<2;row++){
          float y=.54+float(row)*.22;
          roomObject(ro,ray,vec3(.09,y,.82),vec3(.49,y+.025,.98),vec3(.16,.096,.037),nearest,col);
          for(int i=0;i<3;i++){
            float x=.12+float(i)*.115,high=.065+mod(float(i+row),2.)*.045;
            roomObject(ro,ray,vec3(x,y+.026,.86),vec3(x+.065,y+.026+high,.95),i==1?vec3(.17,.10,.055):vec3(.115,.15,.13),nearest,col);
          }
        }
        // Hanging hand tools have separate handles and heads.
        for(int i=0;i<2;i++){
          float x=.63+float(i)*.18;
          roomObject(ro,ray,vec3(x,.51,.955),vec3(x+.018,.77,.98),vec3(.25,.17,.075),nearest,col);
          roomObject(ro,ray,vec3(x-.035,.73,.945),vec3(x+.053,.775,.99),vec3(.065,.085,.077),nearest,col);
        }
        // Keep the room a restrained local accent in the dark course.
        col*=.62;
        `:`
        // Table, legs, empty chair and an abandoned paper. Ray intersections
        // naturally occlude one another as the player walks past the window.
        float nearest=t,f;
        f=boxHit(ro,ray,vec3(.13,.35,.43),vec3(.87,.40,.88));
        if(f<nearest){nearest=f;col=vec3(.15,.09,.035);}
        f=boxHit(ro,ray,vec3(.17,0.,.47),vec3(.21,.35,.51));
        if(f<nearest){nearest=f;col=vec3(.07,.04,.016);}
        f=boxHit(ro,ray,vec3(.77,0.,.78),vec3(.81,.35,.82));
        if(f<nearest){nearest=f;col=vec3(.07,.04,.016);}
        float shift=mod(vSeed,2.)*.30;
        f=boxHit(ro,ray,vec3(.27+shift,.16,.90),vec3(.49+shift,.66,.96));
        if(f<nearest){nearest=f;col=vec3(.075,.045,.018);}
        f=boxHit(ro,ray,vec3(.25+shift,.19,.77),vec3(.51+shift,.24,.96));
        if(f<nearest){nearest=f;col=vec3(.10,.055,.020);}
        f=boxHit(ro,ray,vec3(.42,.401,.56),vec3(.62,.405,.70));
        if(f<nearest){nearest=f;col=vec3(.62,.51,.29);}
        `}
        col*=.78+.22*sqrt(max(0.,sin(uv.x*3.14159)*sin(uv.y*3.14159)));
        // Narrow curtains stay attached to the aperture, not the room walls.
        float edge=.055+.025*sin(uv.y*7.+vSeed);
        ${workshop?`// Dust is concentrated around the fixed pane edges.
        float dust=1.-smoothstep(.0,.095,min(min(uv.x,1.-uv.x),min(uv.y,1.-uv.y)));
        col=mix(col,vec3(.11,.105,.07),dust*.36);`:`if(uv.x<edge||uv.x>1.-edge)col=vec3(.17,.12,.055)*(.75+.25*cos(uv.x*160.));`}
        // Fixed room occupancy belongs to the building, never to camera distance.
        // Keep the glass reflection independent of the light inside the room.
        col*=vRoomLight;
        // A restrained cool glass sheen, strongest at oblique viewing angles.
        float grazing=pow(1.-abs(dot(normalize(vRay),normal)),3.);
        col=mix(col,vec3(.055,.085,.095),grazing*.32);
        col=mix(vec3(.30,.15,.035),col,roomEnabled);
        gl_FragColor=vec4(col,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`});
  function add(frame,width,height){if(!disposed&&!mesh)entries.push({frame,width,height});}
  function finish(){
    if(disposed||mesh)return;
    parent.updateWorldMatrix(true,true);
    const inverse=parent.matrixWorld.clone().invert(),positions=[],uvs=[],rights=[],ups=[],sizes=[],seeds=[],lights=[],indices=[];
    for(const [i,e] of entries.entries()){
      const transform=new THREE.Matrix4().multiplyMatrices(inverse,e.frame.matrixWorld),right=new THREE.Vector3(1,0,0).transformDirection(transform),up=new THREE.Vector3(0,1,0).transformDirection(transform);
      const center=new THREE.Vector3().setFromMatrixPosition(transform),normal=new THREE.Vector3().crossVectors(right,up);
      const strength=roomLight?roomLight(center,normal):1;
      for(const [u,v] of [[0,0],[1,0],[1,1],[0,1]]){
        const point=new THREE.Vector3((u-.5)*e.width,(v-.5)*e.height,.056).applyMatrix4(transform);
        positions.push(...point.toArray());uvs.push(u,v);rights.push(...right.toArray());ups.push(...up.toArray());sizes.push(e.width,e.height,depth);seeds.push(i);lights.push(strength);
      }
      indices.push(i*4,i*4+1,i*4+2,i*4,i*4+2,i*4+3);
    }
    const geometry=new THREE.BufferGeometry();
    for(const [name,data,size] of [['position',positions,3],['uv',uvs,2],['roomRight',rights,3],['roomUp',ups,3],['roomSize',sizes,3],['roomSeed',seeds,1],['roomLight',lights,1]])geometry.setAttribute(name,new THREE.Float32BufferAttribute(data,size));
    geometry.setIndex(indices);geometry.computeBoundingSphere();
    mesh=new THREE.Mesh(geometry,material);mesh.name=name;mesh.userData.keepDynamic=true;mesh.userData.roomKind=roomKind;parent.add(mesh);
  }
  return {add,finish,stats:()=>({windows:entries.length,draws:mesh?1:0,triangles:entries.length*2,disposed}),
    dispose(){if(disposed)return;disposed=true;mesh?.removeFromParent();mesh?.geometry.dispose();mesh=null;material.dispose();entries.length=0;}};
}
