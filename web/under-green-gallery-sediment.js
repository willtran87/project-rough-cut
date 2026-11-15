// Authored sediment follows the gallery's actual root entries and drains.
// Course coordinates: +y points into the level. These are pigment/wetness
// deposits on the existing floor, not raised obstacles or additional water.
export const GALLERY_SEDIMENT_FANS=Object.freeze([
 {id:'east-root-slump',center:[3.92,11.3],points:[
  [4.92,7.8],[4.35,8.04],[4.01,8.72],[3.38,9.05],[3.21,9.64],
  [2.55,10.04],[2.35,10.71],[1.76,11.48],[2.08,12.16],[1.85,12.73],
  [2.45,13.03],[2.73,13.76],[3.44,14.18],[4.92,14.5]]},
 {id:'west-seep-apron',center:[-3.82,15.9],points:[
  [-4.92,12.5],[-4.15,12.91],[-3.77,13.65],[-3.28,13.87],[-3.01,14.59],
  [-2.66,15.39],[-2.85,16.1],[-2.33,16.74],[-2.45,17.48],[-3.16,18.03],
  [-3.5,18.87],[-4.28,19.13],[-4.92,18.6]]},
 {id:'pillar-downwash',center:[-1.62,16.63],points:[
  [-2.16,14.56],[-1.46,14.35],[-.91,15.15],[-1.01,15.86],[-.39,16.32],
  [-.53,17.07],[-.13,17.82],[-.65,18.19],[-.7,18.88],[-1.15,19.34],
  [-1.83,18.58],[-1.6,17.88],[-2.12,17.34],[-2.01,16.72],[-2.49,15.88]]}
]);

// Narrow soaked routes lie within the broad drying fans. They begin at the
// east root / west plaster seep / pillar, and taper towards the first channel.
// Varying widths avoid a uniform painted stripe or a falsely marked safe path.
export const GALLERY_SEDIMENT_RILLS=Object.freeze([
 {id:'east-root-run',points:[[4.65,9.8,.26],[3.7,10.7,.37],[3.13,11.7,.24],[3.45,12.8,.18],[3.87,14.1,.12],[4.25,15.35,.10],[3.72,15.7,.09],[2.65,16.4,.06],[2.7,18.9,.025]]},
 {id:'west-seep-run',points:[[-4.63,13.2,.19],[-4.11,14.5,.28],[-3.73,15.7,.24],[-3.59,16.7,.15],[-3.9,18.1,.08],[-4.12,19.2,.025]]},
 {id:'repair-seep-run',points:[[2.80,18.37,.12],[2.49,18.73,.17],[2.36,19.28,.13],[2.12,19.7,.08],[2.2,19.9,.025]]},
 {id:'pillar-run',points:[[-1.8,15.2,.27],[-1.45,16.1,.25],[-1.55,16.9,.19],[-1.1,17.9,.14],[-1.32,18.8,.08],[-1.57,19.8,.025]]}
]);

// Piecewise quadratic corners keep deposits soft and uneven without the
// overshoot that could let a spline paint through the enclosing wall.
export function sedimentContour(points,seed=0){
 const out=[];
 for(let i=0;i<points.length;i++){
  const a=points[(i+points.length-1)%points.length],b=points[i],c=points[(i+1)%points.length];
  const start=a.map((v,j)=>(v+b[j])*.5),end=b.map((v,j)=>(v+c[j])*.5);
  const steps=Math.max(3,Math.ceil((Math.hypot(b[0]-start[0],b[1]-start[1])+Math.hypot(end[0]-b[0],end[1]-b[1]))/.065));
  for(let k=0;k<steps;k++){
   const t=k/steps,u=1-t,chip=Math.sin((i*steps+k)*1.71+seed)*.017;
   const dx=end[0]-start[0],dy=end[1]-start[1],length=Math.hypot(dx,dy)||1;
   out.push([Math.max(-4.94,Math.min(4.94,u*u*start[0]+2*u*t*b[0]+t*t*end[0]-dy/length*chip)),
    u*u*start[1]+2*u*t*b[1]+t*t*end[1]+dx/length*chip]);
  }
 }
 return out;
}

function rillOutline(points,scale){
 const left=[],right=[];
 for(let i=0;i<points.length;i++){
  const p=points[i],a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)];
  const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy)||1,w=p[2]*scale;
  left.push([p[0]-dy/length*w,p[1]+dx/length*w]);right.push([p[0]+dy/length*w,p[1]-dx/length*w]);
 }
 return [...left,...right.reverse()];
}

export function paintGallerySediment(polygon){
 let patches=0;
 const paint=(layer,points,strength,seed)=>{polygon(layer,sedimentContour(points,seed),strength);patches++;};
 for(const [index,fan]of GALLERY_SEDIMENT_FANS.entries()){
  const inset=scale=>fan.points.map(([x,y])=>[fan.center[0]+(x-fan.center[0])*scale,fan.center[1]+(y-fan.center[1])*scale]);
  // Fine dry silt reaches farther than dense clay. The stronger inner clay
  // conceals slab seams while the thin perimeter allows stone to show through.
  for(const [scale,strength]of [[1,86],[.92,136],[.81,191],[.66,232]])paint(0,inset(scale),strength,index+scale);
 }
 for(const [index,rill]of GALLERY_SEDIMENT_RILLS.entries()){
  paint(0,rillOutline(rill.points,1.8),205,index+8);
  paint(2,rillOutline(rill.points,1.5),100,index+11);
  paint(2,rillOutline(rill.points,.82),190,index+14);
 }
 return {fans:GALLERY_SEDIMENT_FANS.map(f=>f.id),rills:GALLERY_SEDIMENT_RILLS.map(r=>r.id),patches,newTextures:0,newGeometry:0,newWaterContacts:0};
}
