// Back Nine no longer has bell treadles or sound-lure interactions.
export function createDecoys(){return {used:0,near:-1,hold:0,active:-1,remaining:0,ring:0,result:'',serial:0,last:-1,availability:'away'};}
export function updateDecoys(run){if(run.decoys)Object.assign(run.decoys,createDecoys());}
export const decoyTarget=()=>null;
export const decoyCaption=()=>'';
