// Open selected windows in the nearest decorative tree belt. The taller rear
// belt remains intact; gameplay cover and building clearings are authored
// separately. Keep the original tree seed so its baked branches still apply.
const clearings = [
  {side:1,z:-20,halfWidth:8,name:'audit-east'},
  {side:1,z:-74,halfWidth:7,name:'green-east'},
  {side:1,z:-104,halfWidth:6,name:'range-east'},
  {side:-1,z:-8,halfWidth:6,name:'arrival-west'},
  {side:-1,z:-27,halfWidth:6,name:'water-west'},
  {side:-1,z:-91,halfWidth:8,name:'range-west'},
];

export function courseWoodlandPose(x,z){
  let amount=0,clearing=null;
  for(const site of clearings){
    if(Math.sign(x)!==site.side)continue;
    const t=Math.max(0,1-Math.abs(z-site.z)/site.halfWidth);
    const weight=t*t*(3-2*t);
    if(weight>amount){amount=weight;clearing=site.name;}
  }
  // Uniform scale preserves branch proportions. Outward displacement keeps
  // every adjusted trunk farther from the playable course, never nearer it.
  return {x:x+Math.sign(x)*5.5*amount,z,scale:1-.32*amount,clearing,amount};
}
