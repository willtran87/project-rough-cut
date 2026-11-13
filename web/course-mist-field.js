const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};

// World metres. Keep the open fairway clear; moisture and the woodland edge
// define the fog banks independently of the player's current zone or camera.
export function courseMistHabitat(x,z,ponds=[],drain=null){
  const edge=smooth(11.5,15,Math.abs(x))*(1-smooth(23,28,Math.abs(x)));
  let weight=edge*smooth(-120,-113,z)*(1-smooth(0,5,z));
  // Isolated damp pockets leave the centre lane and the gaps between banks clear.
  for(const [bx,bz]of [[7,-31],[-8,-63],[8,-92]]){
    const basin=Math.hypot((x-bx)/3.2,(z-bz)/4.5);
    weight=Math.max(weight,(1-smooth(.15,1,basin))*.58);
  }
  for(const p of ponds){
    const radius=Math.hypot((x-p.x)/(p.rx+1),(z-p.z)/(p.rz+1));
    weight=Math.max(weight,1-smooth(.65,1.5,radius));
  }
  if(drain){const radius=Math.hypot((x-drain.x)/3.4,(z-drain.z)/4.2);weight=Math.max(weight,1-smooth(.3,1.2,radius));}
  return weight;
}

export function mistDistanceFade(distance,near,clear,far,end){
  return smooth(near,clear,distance)*(1-smooth(far,end,distance));
}
