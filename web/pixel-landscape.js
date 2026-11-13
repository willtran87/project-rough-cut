import * as THREE from './vendor/three/three.module.js';
import * as Art from './pixel-art.js';

// Off-course scenery is attached to world coordinates. All solid additions stay
// beyond the playable bounds; clearings retain sightlines to the two buildings.
const noise=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
const smooth=(a,b,v)=>THREE.MathUtils.smoothstep(v,a,b);
export function woodlandHeight(x,z){
  const edge=smooth(13.5,24,Math.abs(x));
  let h=edge*(.65+.65*Math.sin(z*.12+x*.08)+.4*Math.cos(z*.28-x*.17));
  h+=edge*smooth(23,42,Math.abs(x))*(1.2+.7*Math.sin(z*.07));
  const service=smooth(3,7,Math.hypot((x+18)*.9,z+37));
  const clubhouse=smooth(5,10,Math.hypot((x-20)*.8,(z+52)*1.2));
  const endBank=smooth(119.9,137,-z)*(2.1+.8*Math.sin(x*.20));
  const entranceBank=smooth(3.0,21,z)*(1.9+.65*Math.cos(x*.22));
  return .018+Math.max(0,h,endBank,entranceBank)*service*clubhouse;
}
export function createLandscape({root,mesh,cylinder}){
  function ground(x0,x1,z0,z1,kind='woodland-bank'){
    const r=root(kind,(x0+x1)/2,(z0+z1)/2),g=new THREE.PlaneGeometry(x1-x0,z1-z0,24,8);g.rotateX(-Math.PI/2);
    const p=g.attributes.position;
    for(let i=0;i<p.count;i++){
      let x=p.getX(i)+r.position.x;const z=p.getZ(i)+r.position.z;
      if(kind==='woodland-bank'){
        const fringe=(.18*Math.sin(z*.9)+.08*Math.sin(z*2.2)+.05)*(1-smooth(116,119,-z))*(1-smooth(0,2.8,z));
        x+=Math.sign(x)*fringe*(1-smooth(13.4,20,Math.abs(x)));
        p.setX(i,x-r.position.x);
      }
      p.setY(i,woodlandHeight(x,z));
    }
    g.computeVertexNormals();const m=mesh(r,g,'forest-floor',0xb2c0a2);
    const sp=g.attributes.surfacePosition;for(let i=0;i<sp.count;i++)sp.setXYZ(i,sp.getX(i)+r.position.x,sp.getY(i),sp.getZ(i)+r.position.z);
    m.castShadow=false;return r;
  }
  function stone(r,x,y,z,s,seed){
    const g=new THREE.SphereGeometry(1,8,5),p=g.attributes.position;
    for(let i=0;i<p.count;i++){const n=1+.12*Math.sin(p.getX(i)*9+p.getY(i)*7+seed);p.setXYZ(i,p.getX(i)*s*n,p.getY(i)*s*.58*n,p.getZ(i)*s*.80*n);}g.computeVertexNormals();
    const m=mesh(r,g,'masonry',0xc0c9b0,x,y,z);m.rotation.y=noise(seed)*6;return m;
  }
  async function build(cancelled=()=>false){
    let slice=performance.now();
    const yieldFrame=()=>new Promise(resolve=>setTimeout(resolve,0));
    for(const side of [-1,1])for(let i=0;i<16;i++){ground(side<0?-55:13.4,side<0?-13.4:55,-156+i*12,-144+i*12);if(performance.now()-slice>5){await yieldFrame();slice=performance.now();if(cancelled())return;}}
    ground(-13.4,13.4,-156,-119.9,'woodland-backdrop');
    ground(-13.4,13.4,2.8,36,'woodland-entrance');
    // Plants are transparent, crossed components rooted in small irregular
    // clusters. They never turn toward the camera or form a solid hedge wall.
    const plantMats=[[0,100,420,475],[420,90,415,485],[835,100,419,475],[0,665,420,480],[420,665,415,480],[835,665,419,480]].map(crop=>new THREE.MeshLambertMaterial({map:Art.texture('rough-cut-verge-atlas-v1',crop),alphaTest:.28,side:THREE.DoubleSide,vertexColors:true,color:0xb8c9af}));
    function plant(r,x,z,h,seed,y=0,type=2){
      for(const turn of [0,Math.PI/2]){
        const height=h*(turn?.82:1),g=new THREE.PlaneGeometry(h*(.60+noise(seed+7)*.30),height,2,3),p=g.attributes.position,colors=[];
        const tint=new THREE.Color().setHSL(.25+noise(seed+9)*.06,.10+noise(seed+3)*.12,.82+noise(seed+4)*.12);
        for(let i=0;i<p.count;i++){const t=p.getY(i)/height+.5;p.setZ(i,Math.sin(t*Math.PI*.7)*h*.12);colors.push(tint.r,tint.g,tint.b);}
        g.computeVertexNormals();g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setAttribute('surfacePosition',p.clone());g.setAttribute('surfaceNormal',g.attributes.normal.clone());
        const m=new THREE.Mesh(g,plantMats[type]);m.position.set(x,y+height/2,z);m.rotation.y=noise(seed)*Math.PI+turn;r.add(m);
      }
    }
    for(const side of [-1,1])for(let i=0;i<42;i++){
      const seed=i+side*93,z=7-i*3.2+noise(seed+19)*1.8,x=side*(14.8+noise(seed+9)*.9),r=root('woodland-verge',x,z);
      const wet=z<-25&&z>-43,dry=z<-78,kind=dry?5:wet?1:noise(seed)>.75?0:2;
      const count=5+Math.floor(noise(seed+3)*9);
      for(let j=0;j<count;j++){
        const xx=(noise(seed*31+j)-.5)*1.3,zz=(noise(seed*19+j+2)-.5)*3.7;
        const y=woodlandHeight(x+xx,z+zz);
        plant(r,xx,zz,.25+noise(seed*13+j)*.65,seed*17+j,y,j%4===0?4:kind);
        if(j<3)stone(r,xx,y+.12,zz,.23+noise(i*7+j)*.16,i+j);
      }
      // Older, broken stone edging gives the existing boundary posts a setting.
      // Open sightlines are grass clearings, not gaps suggesting a new route.
      if(noise(seed+12)>.35)for(let j=0;j<4;j++)stone(r,side*-.40+(noise(seed+j)-.5)*.15,.17, -1+j*.50,.28+noise(i*11+j)*.14,i*19+j);
      for(let j=0;j<14;j++){
        const xx=side*(1.6+noise(seed*7+j+1)*13),zz=(noise(seed*7+j+5)-.5)*5;
        const wx=x+xx,wz=z+zz;
        if((wx<0&&Math.abs(wz+37)<4)||(wx>0&&Math.abs(wz+52)<7))continue;
        const size=(j<7?.45:.65)+noise(seed*13+j)*.85;
        plant(r,xx,zz,size,seed*47+j,woodlandHeight(wx,wz),j%3===0?4:dry?5:2);
        if(j%4===0)for(let k=0;k<3;k++){
          const ox=(noise(j*17+k+seed)-.5)*1.3,oz=(noise(j*23+k+seed)-.5)*1.3;
          plant(r,xx+ox,zz+oz,size*.55,seed*11+j+k,woodlandHeight(wx+ox,wz+oz),j%3===0?4:2);
        }
      }
      if(performance.now()-slice>5){await yieldFrame();slice=performance.now();if(cancelled())return;}
      if(i%5===2){
        const xx=side*3,y=woodlandHeight(x+xx,z),log=cylinder(r,'wood',xx,y+.19,0,.18,2.4,0x99947c,.13);log.rotation.z=Math.PI/2;log.rotation.y=.4;
        stone(r,xx+side*.7,y+.12,.2,.46,i);
      }
    }
    const back=root('woodland-end-verge',0,-125);
    for(let i=0;i<35;i++){const x=-12.5+i*.74,z=-noise(i+4)*2.8,y=woodlandHeight(x,z-125);plant(back,x,z,.65+noise(i)*.9,i,y);if(i%3===0)stone(back,x,y+.15,z,.40,i);}
    const entry=root('woodland-entrance-verge',0,7);
    for(let i=0;i<70;i++){
      const x=(noise(i+311)-.5)*27,z=noise(i+622)*12,y=woodlandHeight(x,z+7);
      plant(entry,x,z,.45+noise(i+433)*1.0,i+513,y,i%3===0?4:2);
      if(i%5===0)stone(entry,x,y+.15,z,.24+noise(i)*.2,i);
      if(performance.now()-slice>5){await yieldFrame();slice=performance.now();if(cancelled())return;}
    }
  }
  return {landscape:build};
}
