import { waitForPreparationTurn } from './render-preparation.js';
let worker=null,disabled=false,nextId=0,idleTimer;
const pending=new Map(),stats={decoded:0,failures:0};
export const bitmapDecodeStats=()=>({...stats,pending:pending.size});
function stop(error){clearTimeout(idleTimer);worker?.terminate();worker=null;for(const job of pending.values()){clearTimeout(job.timer);job.reject(error);}pending.clear();}
function fail(error){disabled=true;stats.failures++;stop(error);}
export const decodeBitmapOffThread=(url,options,cancelled=()=>false)=>decode(url,options,cancelled);
// One network request for a set of small, independently sampled textures. The
// existing worker still decodes serially, and transfers rather than copies them.
export const decodeBitmapBatchOffThread=(url,slices,options,cancelled=()=>false)=>decode(url,options,cancelled,slices);
async function decode(url,options,cancelled,slices){
  if(!await waitForPreparationTurn(cancelled))throw Error('Bitmap decode cancelled');
  if(disabled||typeof Worker==='undefined')throw Error('Bitmap worker unavailable');
  if(!worker){
    try{worker=new Worker(new URL('./bitmap-decode-worker.js?v=20261112-batch',import.meta.url),{type:'module'});}catch(error){fail(error);throw error;}
    worker.onerror=event=>{event.preventDefault();fail(Error('Bitmap worker failed'));};
    worker.onmessageerror=()=>fail(Error('Bitmap transfer failed'));
    worker.onmessage=({data})=>{
      const close=()=>{data.bitmap?.close();for(const image of data.bitmaps||[])image.close();};
      const job=pending.get(data.id);if(!job){close();return;}
      pending.delete(data.id);clearTimeout(job.timer);
      if(data.error){stats.failures++;job.reject(Error(data.error));}
      else if(job.cancelled()){close();job.reject(Error('Bitmap decode cancelled'));}
      else{stats.decoded+=data.bitmaps?.length||1;job.resolve(data.bitmaps||data.bitmap);}
      if(!pending.size)idleTimer=setTimeout(()=>stop(Error('Bitmap decoder idle')),1000);
    };
  }
  clearTimeout(idleTimer);const id=nextId++;
  return new Promise((resolve,reject)=>{
    pending.set(id,{resolve,reject,cancelled,timer:setTimeout(()=>fail(Error('Bitmap worker timeout')),30000)});
    try{worker.postMessage({id,url:new URL(url,location.href).href,options,slices});}catch(error){fail(error);}
  });
}
