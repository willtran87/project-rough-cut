import {buildWindbreakGrowth} from './back-nine-windbreak-growth.js';
import {noise} from './back-nine-course.js';

export const BORDER_SHRUBS=[];
for(let y=36;y<800;y+=32)for(const side of [-1,1]){
 if(side>0&&(Math.abs(y-232)<35||Math.abs(y-474)<40))continue;
 BORDER_SHRUBS.push({x:side*(44+noise(y)*1.3),y});
}
const leaf=(x,y,h,width,turn,base=0,type=4)=>({x,y,h,width,turn,base,type,tint:[.74,.89,.78],flex:.28});

export function windbreakCoreGeometry(THREE,s){return buildWindbreakGrowth(THREE,s);}

export function borderShrubPlants(s){
 // Overlapping groups taper toward the tips of the original long shrub.
 return Array.from({length:11},(_,i)=>{
  const t=(i-5)/5,side=i%2?1:-1,h=1.35+(1-Math.abs(t))*.9+noise(s.y+i)*.25;
  return leaf(s.x+side*(.55+noise(i+s.y)*.4),s.y+t*3.5,h,1.7+noise(i)*.35,noise(s.y+i*7)*6.28);
 });
}
// Windbreak foliage is connected geometry on the hedge itself.
export function windbreakPlants(){return [];}
export function planterPlants(f){
 if(f.kind!=='fallen-tree'||f.id==='clubhouse-fall')return [];
 return Array.from({length:18},(_,i)=>{
  const column=Math.floor(i/2),side=i%2?1:-1,x=f.x-4+column;
  const type=f.y>700?3:f.y>300&&f.y<600?5:2;
  return leaf(x,f.y+side*.32,.85+noise(i+f.y)*.48,1.12,noise(i+f.y)*3.14,.5,type);
 });
}
