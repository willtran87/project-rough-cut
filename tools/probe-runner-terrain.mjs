import fs from 'node:fs';
import {createRunnerGait} from '../web/runner-gait.js';
import {terrainHeight} from '../web/course-terrain.js';
import {COURSE} from '../web/back-nine-course.js';
const rows=[];
for(const [id,path] of [...COURSE.paths,...COURSE.footPaths].entries()){
 const gait=createRunnerGait(),foot={x:path[0][0],y:path[0][1],speed:6.6,travelSign:1};let time=0,max=0,worst=null;
 for(let i=1;i<path.length;i++){
  const a=path[i-1],b=path[i],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy),yaw=Math.atan2(dx,dy),steps=Math.ceil(length/.11);
  for(let n=0;n<steps;n++){
   const t=n/steps;foot.x=a[0]+dx*t;foot.y=a[1]+dy*t;foot.yaw=yaw;time+=1/60;
   const pose=gait.update(foot,time,yaw),c=Math.cos(yaw),s=Math.sin(yaw);
   for(const f of pose.feet){const x=foot.x+c*f.x-s*f.z,y=foot.y-s*f.x-c*f.z;
    const error=terrainHeight(foot.x,foot.y)-terrainHeight(x,y);
    if(Math.abs(error)>max){max=Math.abs(error);worst={x:foot.x,y:foot.y,error,planted:f.planted,footX:x,footY:y};}
   }
  }
 }rows.push({id,max,worst});
}
fs.mkdirSync('output/back-nine-experience/runner-terrain',{recursive:true});fs.writeFileSync('output/back-nine-experience/runner-terrain/flat-ground-error.json',JSON.stringify(rows,null,2));console.log(JSON.stringify(rows.sort((a,b)=>b.max-a.max).slice(0,5)));
