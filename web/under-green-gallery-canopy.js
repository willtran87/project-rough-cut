import * as THREE from './vendor/three/three.module.js';
import {buildRootEntryDamage} from './under-green-root-entry.js';

// The first gallery's existing living pillar carries two unequal shoulders
// into the real side walls. These replace its short, disconnected roof forks.
// Coordinates are x, height, course y; the walking/collision hull is untouched.
const point=([x,h,y])=>new THREE.Vector3(x,h,-y);
export function buildGalleryRootCanopy({root,put,lowDetail=false}){
 const right=new THREE.CatmullRomCurve3([
  [-1.80,3.60,15],[-1.02,3.78,14.20],[.20,3.63,13.20],
  [2.10,3.82,12.20],[3.90,3.78,11.60],[5.02,3.24,10.76]
 ].map(point));
 const left=new THREE.CatmullRomCurve3([
  [-1.80,3.22,15],[-1.94,3.62,14.70],[-2.34,3.85,13.90],
  [-3.44,3.70,13.40],[-5.02,3.28,12.60]
 ].map(point));
 const fork=right.getPointAt(.60),back=left.getPointAt(.45),members=[];
 function limb(id,points,radius,options={}){
  root(points,radius,null,options);members.push({id,radius,points:points.map(p=>p.toArray()),taper:options.taper??.83});
 }
 limb('east-shoulder',right.points,.44,{taper:.57,branchPoints:[fork]});
 limb('west-shoulder',left.points,.36,{taper:.60,branchPoints:[back]});
 limb('east-return-fork',[fork,point([2.95,3.48,13.42]),point([4.38,3.25,14.26]),point([5.02,3.10,14.70])],.22,{taper:.79});
 limb('west-roof-fork',[back,point([-3.15,3.95,15.05]),point([-4.23,4.08,15.32]),point([-4.87,4.25,15.48])],.19,{taper:.82});
 // A small returning braid crosses the near shoulder and joins its surface;
 // it adds a readable over/under crossing rather than another parallel tube.
 limb('shoulder-braid',[
  point([-1.71,3.31,15.02]),point([-1.45,3.64,14.76]),
  point([-.90,3.95,14.25]),point([-.28,3.85,13.60]),
  point([.29,3.44,13.17]),right.getPointAt(.48)
 ],.13,{taper:.69});
 // Feeder tips remain above head and weapon space. They are attached to the
 // underside of the actual curve and continue tapering to fine dark points.
 const count=lowDetail?3:6;
 for(let i=0;i<count;i++){
  const t=.22+i*.074,start=right.getPointAt(t),length=.24+(i%3)*.065;
  const mid=start.clone().add(new THREE.Vector3(.035,-length*.52,.04));
  const end=start.clone().add(new THREE.Vector3((i%2?-.07:.06),-length,.055));
  limb('feeder-'+i,[start,mid,end],.022+(i%2)*.006,{taper:.96});
 }
 const entries=[];
 for(const [id,boundary,side,along,height]of [['canopy-west',-5,1,12.6,3.28],['canopy-east-return',5,-1,14.7,3.10]]){
  const c={id,axis:'x',boundary,side,top:4.12,material:'rootStone'};
  const point=(u,h,n=.125)=>new THREE.Vector3(boundary+side*n,h,-u);
  entries.push({id,boundary,side,along,height,...buildRootEntryDamage({c,entryAlong:along,height,seed:entries.length+7,point,put})});
 }
 return {members,entries,connectedPillar:{x:-1.8,y:15},newTextures:0,newLights:0,newColliders:0};
}
