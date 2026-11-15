import {COURSE,pathDistance} from './back-nine-course.js';

// A cut swath belongs on turf, never on a path, bunker, shelter apron or the
// garage floor. Check its corners as well as its center, only when stamping.
// Wet turf can still be cut; wet cart paths cannot turn into grass ribbons.
export function canMarkMownGround(x,y,yaw,point={}){
 const sin=Math.sin(yaw),cos=Math.cos(yaw);
 for(let i=0;i<5;i++){
  const across=i?((i&1)?-2.05:2.05):0,along=i?(i<3?-1.15:1.15):0;
  point.x=x+across*cos+along*sin;point.y=y-across*sin+along*cos;
  if(Math.abs(point.x)>COURSE.width-.1||point.y<0||point.y>COURSE.length||pathDistance(point)<3.3)return false;
  for(const sand of COURSE.sand)if(((point.x-sand.x)/sand.rx)**2+((point.y-sand.y)/sand.ry)**2<1.12)return false;
  for(const c of COURSE.checkpoints)if(Math.abs(point.x-c.x)<3.7&&Math.abs(point.y-c.y)<5.7)return false;
  if(Math.abs(point.x-COURSE.finish.x)<6.3&&point.y>COURSE.finish.y-8)return false;
 }
 return true;
}
