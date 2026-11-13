import * as THREE from './vendor/three/three.module.js';

// Fixed window apertures render an empty room in perspective. The rooms remain
// scenery outside the course boundary; no camera-facing cards or extra lights.
export function createClubhouseWindows(parent){
  const entries=[];let mesh=null,disposed=false;
  const material=new THREE.ShaderMaterial({fog:true,
    uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{roomEnabled:{value:1}}]),
    vertexShader:`
      attribute vec3 roomRight,roomUp,roomSize;
      attribute float roomSeed;
      varying vec2 vUv;
      varying vec3 vRay,vRight,vUp,vSize;
      varying float vSeed;
      #include <fog_pars_vertex>
      void main(){
        vUv=uv;vSize=roomSize;vSeed=roomSeed;
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
      varying float vSeed;
      #include <fog_pars_fragment>
      float boxHit(vec3 ro,vec3 rd,vec3 lo,vec3 hi){
        vec3 inv=1.0/rd,a=(lo-ro)*inv,b=(hi-ro)*inv;
        vec3 near=min(a,b),far=max(a,b);
        float enter=max(max(near.x,near.y),near.z),leave=min(min(far.x,far.y),far.z);
        return leave>=max(enter,0.0)?max(enter,0.0):10000.0;
      }
      void main(){
        vec3 right=normalize(vRight),up=normalize(vUp),normal=cross(right,up);
        vec3 ray=vec3(dot(vRay,right)/vSize.x,dot(vRay,up)/vSize.y,-dot(vRay,normal)/vSize.z);
        ray=sign(ray+vec3(.000001))*max(abs(ray),vec3(.00001));
        ray.z=max(.00001,ray.z);
        // Quantized aperture samples keep the detail in the game's pixel idiom.
        vec2 uv=(floor(vUv*vec2(72.,96.))+.5)/vec2(72.,96.);
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
        col*=.78+.22*sqrt(max(0.,sin(uv.x*3.14159)*sin(uv.y*3.14159)));
        // Narrow curtains stay attached to the aperture, not the room walls.
        float edge=.055+.025*sin(uv.y*7.+vSeed);
        if(uv.x<edge||uv.x>1.-edge)col=vec3(.17,.12,.055)*(.75+.25*cos(uv.x*160.));
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
    const inverse=parent.matrixWorld.clone().invert(),positions=[],uvs=[],rights=[],ups=[],sizes=[],seeds=[],indices=[];
    for(const [i,e] of entries.entries()){
      const transform=new THREE.Matrix4().multiplyMatrices(inverse,e.frame.matrixWorld),right=new THREE.Vector3(1,0,0).transformDirection(transform),up=new THREE.Vector3(0,1,0).transformDirection(transform);
      for(const [u,v] of [[0,0],[1,0],[1,1],[0,1]]){
        const point=new THREE.Vector3((u-.5)*e.width,(v-.5)*e.height,.056).applyMatrix4(transform);
        positions.push(...point.toArray());uvs.push(u,v);rights.push(...right.toArray());ups.push(...up.toArray());sizes.push(e.width,e.height,1.8);seeds.push(i);
      }
      indices.push(i*4,i*4+1,i*4+2,i*4,i*4+2,i*4+3);
    }
    const geometry=new THREE.BufferGeometry();
    for(const [name,data,size] of [['position',positions,3],['uv',uvs,2],['roomRight',rights,3],['roomUp',ups,3],['roomSize',sizes,3],['roomSeed',seeds,1]])geometry.setAttribute(name,new THREE.Float32BufferAttribute(data,size));
    geometry.setIndex(indices);geometry.computeBoundingSphere();
    mesh=new THREE.Mesh(geometry,material);mesh.name='ClubhouseEmptyRooms';mesh.userData.keepDynamic=true;parent.add(mesh);
  }
  return {add,finish,stats:()=>({windows:entries.length,draws:mesh?1:0,triangles:entries.length*2,disposed}),
    dispose(){if(disposed)return;disposed=true;mesh?.removeFromParent();mesh?.geometry.dispose();mesh=null;material.dispose();entries.length=0;}};
}
