// Presentation contact events, independent of audio and rendering libraries.
// A foot must visibly leave the floor before another landing can emit a cue.
export function createFootContactEvents(){
 let run=null,lastTime=null,lastBody=null,armed=[false,false],serial=0,pending=[],lastContact=null;
 function reset(){run=null;lastTime=null;lastBody=null;armed=[false,false];pending=[];lastContact=null;}
 function update({owner,time,body,feet,enabled,phase}){
  const discontinuity=run!==owner||lastTime===null||time<lastTime||time-lastTime>.25||
   (lastBody&&Math.hypot(body.x-lastBody.x,body.y-lastBody.y)>.75);
  if(discontinuity){reset();run=owner;}
  if(!enabled){lastTime=time;lastBody={x:body.x,y:body.y};armed=[false,false];pending=[];return;}
  if(lastTime===time)return;
  lastTime=time;lastBody={x:body.x,y:body.y};
  if(discontinuity)return;
  feet.forEach((foot,index)=>{
   if(foot.height>.018)armed[index]=true;
   else if(foot.height<=.008&&armed[index]){
    armed[index]=false;
    const event={owner,serial:++serial,time,foot:index,x:foot.x,y:foot.y,height:Math.max(0,foot.height),phase};
    pending.push(event);if(pending.length>8)pending.shift();
    lastContact={serial:event.serial,time,foot:index,phase};
   }
  });
 }
 return {update,reset,drain(){const events=pending;pending=[];return events;},stats:()=>({serial,lastContact})};
}
