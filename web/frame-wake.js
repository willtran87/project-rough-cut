// One cancellable completion check. This wakes presentation, never simulation,
// and never submits another frame until the caller's GPU fence has completed.
export function createFrameWake(present,active,{set=setTimeout,clear=clearTimeout}={}){
 let pending=null;
 return {
  request(delay=4){
   if(pending!==null||!active())return;
   pending=set(()=>{pending=null;if(active())present();},Math.max(1,delay));
  },
  cancel(){if(pending!==null){clear(pending);pending=null;}},
  pending:()=>pending!==null
 };
}
