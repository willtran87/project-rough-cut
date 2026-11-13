import * as THREE from './vendor/three/three.module.js';

// Every dressed face, header and cap stays inside its existing solid envelope.
// Short end headers close the corners instead of exposing the backing box.
export function createMasonryBuilder(mesh){
 const geometry=new THREE.BoxGeometry(1,1,1,2,2,2),positions=geometry.attributes.position;
 for(let i=0;i<positions.count;i++){
  const point=new THREE.Vector3().fromBufferAttribute(positions,i),core=point.clone().clampScalar(-.46,.46);
  core.add(point.sub(core).normalize().multiplyScalar(.04));positions.setXYZ(i,core.x,core.y,core.z);
 }
 geometry.computeVertexNormals();
 let blocks=0,caps=0,headers=0,walls=0;
 const noise=(seed)=>{const n=Math.sin(seed*12.9898+78.233)*43758.5453;return n-Math.floor(n);};
 function build(w,{course=.32,length=.76,stone='ashlar',accent='ashlarWarm'}={}){
  walls++;
  const long=w.w>=w.d,span=long?w.w:w.d,thickness=long?w.d:w.w,capHeight=.115,seed=w.x*3.1+w.y*7.9;
  const place=(material,along,height,across,sx,sy,sz)=>{
   mesh(material,geometry,w.x+(long?along:across),height,-w.y+(long?across:along),long?sx:sz,sy,long?sz:sx);blocks++;
  };
  // Keep courses aligned between neighbouring walls of different heights;
  // only the final course beneath the coping is trimmed to fit.
  const rows=Math.max(1,Math.ceil((w.h-capHeight)/course));
  for(let row=0;row<rows;row++){
   const rise=Math.min(course,w.h-capHeight-row*course),height=row*course+rise/2,header=Math.min(span*.22,.22+(row%2)*.13),joint=Math.min(.016,rise*.25);
   const choose=(col)=>row<2&&noise(seed+col+row*13)>.57?'ashlarMoss':noise(seed+col*3+row*19)>.76?accent:stone;
   for(const side of [-1,1]){place(choose(side),side*(span-header)/2,height,0,header-joint,rise-joint,thickness);headers++;}
   let cursor=header,col=0;
   while(cursor<span-header-.015){
    const width=Math.min(span-header-cursor,length*(.74+noise(seed+row*23+col*5)*.52)*(col===0&&row%2?.58:1));
    if(width<.025)break;
    const along=cursor+width/2-span/2,depth=.065+noise(seed+col+row)*.012;
    for(const face of [-1,1])place(choose(col),along,height,face*(thickness-depth)/2,width-joint,rise-joint,depth);
    cursor+=width;col++;
   }
  }
  let cursor=0,col=0;
  while(cursor<span-.015){
   const width=Math.min(span-cursor,.82+noise(seed+col*7)*.3);
   place('coping',cursor+width/2-span/2,w.h-capHeight/2,0,width-.013,capHeight,thickness);caps++;cursor+=width;col++;
  }
 }
 return {build,stats:()=>({walls,blocks,caps,headers,materials:6,withinCollider:true})};
}
