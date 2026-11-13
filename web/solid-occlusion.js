import * as THREE from './vendor/three/three.module.js';

// Only opaque, closed cover may supply an interior convex hull. Its projected
// hull is smaller than the visible cover silhouette, so it can prove that an
// entire part is hidden without querying the GPU or delaying a camera turn.
export function createSolidOcclusion({maxSolids=Infinity}={}){
  if(maxSolids!==Infinity&&(!Number.isInteger(maxSolids)||maxSolids<1))throw new RangeError('Occluder budget must be a positive integer');
  const solids=[],projected=[],point=new THREE.Vector3(),view=new THREE.Vector3(),projection=new THREE.Matrix4();
  const candidates=[],cameraPosition=new THREE.Vector3();
  const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
  const byPosition=(a,b)=>a.x-b.x||a.y-b.y,byDepth=(a,b)=>a.far-b.far;
  function store(vertices){
    // Reuse projection points and edges on every camera update; turning must
    // not allocate thousands of short-lived objects and trigger GC spikes.
    solids.push({vertices,bounds:Number.isFinite(maxSolids)?new THREE.Box3().setFromPoints(vertices):null,distance:0,points:vertices.map(()=>({x:0,y:0})),hull:[],edges:vertices.map(()=>({x:0,y:0,dx:0,dy:0,margin:0,nx:0,ny:0,nz:0,w:0,tolerance:0})),edgeCount:0,far:0});
  }
  function add(box,matrix){
    const vertices=[];
    for(let i=0;i<8;i++)vertices.push(new THREE.Vector3(i&1?box.max.x:box.min.x,i&2?box.max.y:box.min.y,i&4?box.max.z:box.min.z).applyMatrix4(matrix));
    store(vertices);
  }
  function update(camera){
    projected.length=0;
    projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
    let selected=solids;
    if(Number.isFinite(maxSolids)){
      // A bounded subset can only retain extra geometry. Prefer nearby valid
      // occluders so distant walls cannot dominate camera-turn CPU work.
      candidates.length=0;camera.getWorldPosition(cameraPosition);const e=camera.matrixWorldInverse.elements;
      for(const solid of solids){const b=solid.bounds,cx=(b.min.x+b.max.x)*.5,cy=(b.min.y+b.max.y)*.5,cz=(b.min.z+b.max.z)*.5;
        const depth=-(e[2]*cx+e[6]*cy+e[10]*cz+e[14]),extent=(Math.abs(e[2])*(b.max.x-b.min.x)+Math.abs(e[6])*(b.max.y-b.min.y)+Math.abs(e[10])*(b.max.z-b.min.z))*.5;
        if(depth-extent<=camera.near*2)continue;
        solid.distance=b.distanceToPoint(cameraPosition);candidates.push(solid);
      }
      candidates.sort((a,b)=>a.distance-b.distance);selected=candidates.slice(0,maxSolids);
    }
    for(const solid of selected){
      let far=0,valid=true;const {vertices,points,hull,edges}=solid;
      for(let i=0;i<vertices.length;i++){const vertex=vertices[i];
        view.copy(vertex).applyMatrix4(camera.matrixWorldInverse);
        // Near-plane crossings and inside-cover views fail open.
        if(-view.z<=camera.near*2){valid=false;break;}
        far=Math.max(far,-view.z);point.copy(vertex).applyMatrix4(projection);points[i].x=point.x;points[i].y=point.y;
      }
      if(!valid)continue;
      points.sort(byPosition);hull.length=0;
      for(const p of points){while(hull.length>=2&&cross(hull.at(-2),hull.at(-1),p)<=0)hull.pop();hull.push(p);}
      const lower=hull.length;
      for(let i=points.length-2;i>=0;i--){const p=points[i];while(hull.length>lower&&cross(hull.at(-2),hull.at(-1),p)<=0)hull.pop();hull.push(p);}hull.pop();
      if(hull.length<3)continue;
      for(let i=0;i<hull.length;i++){const a=hull[i],b=hull[(i+1)%hull.length],edge=edges[i];edge.x=a.x;edge.y=a.y;edge.dx=b.x-a.x;edge.dy=b.y-a.y;edge.margin=Math.hypot(edge.dx,edge.dy)*.006;}
      solid.edgeCount=hull.length;solid.far=far+.01;projected.push(solid);
      // Lift each contracted screen-space edge into a world-space half-plane.
      // With positive clip W, multiplying the edge test by W preserves its
      // sign. A box's minimum then needs one support corner, not eight
      // perspective divisions followed by eight tests against every edge.
      const m=projection.elements;
      for(let i=0;i<solid.edgeCount;i++){
        const e=edges[i],k=e.dy*e.x-e.dx*e.y-e.margin;
        e.nx=-e.dy*m[0]+e.dx*m[1]+k*m[3];
        e.ny=-e.dy*m[4]+e.dx*m[5]+k*m[7];
        e.nz=-e.dy*m[8]+e.dx*m[9]+k*m[11];
        e.w=-e.dy*m[12]+e.dx*m[13]+k*m[15];
        e.tolerance=1e-10*Math.hypot(e.nx,e.ny,e.nz);
      }
    }
    projected.sort(byDepth);
  }
  function hidden(box){
    if(!projected.length)return false;
    const e=activeCamera.matrixWorldInverse.elements,cx=(box.min.x+box.max.x)*.5,cy=(box.min.y+box.max.y)*.5,cz=(box.min.z+box.max.z)*.5;
    const depth=-(e[2]*cx+e[6]*cy+e[10]*cz+e[14]),extent=(Math.abs(e[2])*(box.max.x-box.min.x)+Math.abs(e[6])*(box.max.y-box.min.y)+Math.abs(e[10])*(box.max.z-box.min.z))*.5,near=depth-extent;
    // Keep clip-boundary primitives on the original GPU path. In particular,
    // thin far-clipped posts can rasterize differently on software drivers.
    if(near<=activeCamera.near*2||depth+extent>=activeCamera.far*.99||near<=projected[0].far)return false;
    for(const solid of projected){
      if(near<=solid.far)break;
      let inside=true;
      for(let i=0;i<solid.edgeCount;i++){
        const e=solid.edges[i],minimum=e.nx*(e.nx<0?box.max.x:box.min.x)+e.ny*(e.ny<0?box.max.y:box.min.y)+e.nz*(e.nz<0?box.max.z:box.min.z)+e.w;
        // Fail open at numerical boundaries, just as at clip boundaries.
        if(minimum<=e.tolerance){inside=false;break;}
      }
      if(inside)return true;
    }
    return false;
  }
  let activeCamera;
  return {add,addHull(vertices,matrix){store(vertices.map(p=>p.clone().applyMatrix4(matrix)));},update(camera){activeCamera=camera;update(camera);},hidden,count:()=>projected.length};
}
