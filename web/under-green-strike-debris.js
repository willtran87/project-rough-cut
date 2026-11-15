// Analytic fragments stay tied to simulation time: pause freezes them and a
// fresh run owns no contacts. This is chipped masonry, not luminous sparks.
export const STRIKE_DEBRIS_COUNT=6;
export const STRIKE_DEBRIS_LIFE=.65;
export function strikeDebrisSample(contact,index,time){
 const age=time-contact.time;
 if(age<0||age>STRIKE_DEBRIS_LIFE||index<0||index>=STRIKE_DEBRIS_COUNT)return null;
 const n=contact.normal,p=contact.point,seed=contact.serial*.73+index*2.399;
 const dirt=contact.material!=='masonry',tangent={x:-n.y,y:n.x},out=(dirt?.12:.28)+(index%3)*.13,side=Math.sin(seed)*(dirt?.22:.46);
 const vx=n.x*out+tangent.x*side,vy=n.y*out+tangent.y*side,vh=dirt?-.08:.28+(index%4)*.14;
 const height=p.height+n.height*.012+vh*age-4.9*age*age;
 if(height<.02)return null;
 return {x:p.x+n.x*.012+vx*age,y:p.y+n.y*.012+vy*age,height,
  size:(dirt?.006:.009)+(index%3)*.004,rotation:seed+age*(index%2?9:-8),alpha:Math.min(1,(STRIKE_DEBRIS_LIFE-age)/.18)};
}
