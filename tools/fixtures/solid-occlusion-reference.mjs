// Frozen pre-optimization oracle: projects and tests all eight box corners.
import * as THREE from '../../web/vendor/three/three.module.js';

// Only opaque, closed cover may supply an interior convex hull. Its projected
// hull is smaller than the visible cover silhouette, so it can prove that an
// entire part is hidden without querying the GPU or delaying a camera turn.
export function createSolidOcclusion(){
  const solids=[],projected=[],point=new THREE.Vector3(),view=new THREE.Vector3(),projection=new THREE.Matrix4();
  const corners=Array.from({length:8},()=>new THREE.Vector3());
  const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
  const byPosition=(a,b)=>a.x-b.x||a.y-b.y,byDepth=(a,b)=>a.far-b.far;
  function store(vertices){
    // Reuse projection points and edges on every camera update; turning must
    // not allocate thousands of short-lived objects and trigger GC spikes.
    solids.push({vertices,points:vertices.map(()=>({x:0,y:0})),hull:[],edges:vertices.map(()=>({x:0,y:0,dx:0,dy:0,margin:0})),edgeCount:0,far:0,minX:0,maxX:0,minY:0,maxY:0});
  }
  function add(box,matrix){
    const vertices=[];
    for(let i=0;i<8;i++)vertices.push(new THREE.Vector3(i&1?box.max.x:box.min.x,i&2?box.max.y:box.min.y,i&4?box.max.z:box.min.z).applyMatrix4(matrix));
    store(vertices);
  }
  function update(camera){
    projected.length=0;
    projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
    for(const solid of solids){
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
      solid.minX=solid.minY=Infinity;solid.maxX=solid.maxY=-Infinity;
      for(let i=0;i<hull.length;i++){const a=hull[i],b=hull[(i+1)%hull.length],edge=edges[i];edge.x=a.x;edge.y=a.y;edge.dx=b.x-a.x;edge.dy=b.y-a.y;edge.margin=Math.hypot(edge.dx,edge.dy)*.006;solid.minX=Math.min(solid.minX,a.x);solid.maxX=Math.max(solid.maxX,a.x);solid.minY=Math.min(solid.minY,a.y);solid.maxY=Math.max(solid.maxY,a.y);}
      solid.edgeCount=hull.length;solid.far=far+.01;projected.push(solid);
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
    let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
    for(let i=0;i<8;i++){
      const p=corners[i].set(i&1?box.max.x:box.min.x,i&2?box.max.y:box.min.y,i&4?box.max.z:box.min.z);
      p.applyMatrix4(projection);minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);minY=Math.min(minY,p.y);maxY=Math.max(maxY,p.y);
    }
    for(const solid of projected){
      if(near<=solid.far)break;
      if(minX<=solid.minX||maxX>=solid.maxX||minY<=solid.minY||maxY>=solid.maxY)continue;
      let inside=true;
      for(const p of corners){for(let i=0;i<solid.edgeCount;i++){const e=solid.edges[i];if(e.dx*(p.y-e.y)-e.dy*(p.x-e.x)<=e.margin){inside=false;break;}}if(!inside)break;}
      if(inside)return true;
    }
    return false;
  }
  let activeCamera;
  return {add,addHull(vertices,matrix){store(vertices.map(p=>p.clone().applyMatrix4(matrix)));},update(camera){activeCamera=camera;update(camera);},hidden,count:()=>projected.length};
}
