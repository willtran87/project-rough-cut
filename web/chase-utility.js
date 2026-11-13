// Shelters retain repair reserves. The former bell diversion is retired.
export const UTILITY_HOLD=.85,UTILITY_SECONDS=7,UTILITY_DANGER_DISTANCE=6;
export const UTILITY_STATIONS=[];
export function createUtility(collected=0,record=null){return {
 choices:[0,1].map(i=>record?.[i]==='repair'||collected&(1<<i)?'repair':''),
 near:-1,hold:0,released:false,pending:-1,active:-1,remaining:0,ring:0,last:-1,serial:0,result:'',availability:'away'
};}
export const utilityPad=()=>-1;
export function reserveRepair(run,index){
 const u=run.utility;if(!u||u.choices[index])return;
 u.choices[index]='repair';run.events.push({type:'utility-choice',index,choice:'repair',time:run.time});
}
export function updateUtility(run){if(run.utility)Object.assign(run.utility,{near:-1,hold:0,pending:-1,active:-1,remaining:0,ring:0,availability:'away'});}
export const utilityTarget=()=>null;
export const utilityBell=()=>null;
export const utilityCaption=()=>'';
