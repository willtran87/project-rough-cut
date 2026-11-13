/* Shared preference data for classic and module entry points. No DOM dependency. */
(() => {
 const key='rough-cut.spatial.v1';
 const defaults=Object.freeze({resolution:1,fov:58,mouse:1,controller:1,touch:1,invertVertical:false,acceleration:false});
 const limits=Object.freeze({resolution:[.5,1],fov:[45,85],mouse:[.25,2],controller:[.25,2],touch:[.25,2]});
 function valid(name,value){
  if(!Object.hasOwn(defaults,name)||typeof value!==typeof defaults[name])return undefined;
  if(typeof value==='boolean')return value;
  return Number.isFinite(value)?Math.max(limits[name][0],Math.min(limits[name][1],value)):undefined;
 }
 function normalize(record){
  const result={...defaults};
  if(record&&typeof record==='object'&&!Array.isArray(record))for(const name in defaults){const value=valid(name,record[name]);if(value!==undefined)result[name]=value;}
  return result;
 }
 function create(storage=()=>localStorage){
  function read(){
   let raw;try{raw=storage().getItem(key);}catch{return {available:false,record:{}};}
   try{const record=JSON.parse(raw||'{}');return {available:true,record:record&&typeof record==='object'&&!Array.isArray(record)?record:{}};}catch{return {available:true,record:{}};}
  }
  let preferences=normalize(read().record),pending={};const listeners=new Set();
  const get=()=>({...preferences});
  function set(name,value){
   value=valid(name,value);if(value===undefined)return false;
   pending[name]=value;const latest=read();
   preferences=normalize({...preferences,...latest.record,...pending});
   let saved=false;
   if(latest.available)try{storage().setItem(key,JSON.stringify({...latest.record,...pending}));pending={};saved=true;}catch{}
   for(const listener of listeners)listener(get(),name,saved);
   return saved;
  }
  return {get,set,subscribe(listener){listeners.add(listener);return ()=>listeners.delete(listener);}};
 }
 const format=(name,value)=>name==='resolution'?Math.round(value*100)+'%':name==='fov'?Math.round(value)+'°':typeof value==='number'?value.toFixed(2)+'×':'';
 window.RCSpatialPreferences=Object.freeze({key,defaults,limits,normalize,create,format});
})();
