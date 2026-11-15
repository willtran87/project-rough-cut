(() => {
 'use strict';
 const KEY='rough-cut.campaign-progress.v1',ids=['night-order','back-nine','under-green','final-cut'];
 const read=(storage,key)=>{try{const v=JSON.parse(storage.getItem(key));return v&&typeof v==='object'&&!Array.isArray(v)?v:{};}catch{return {};}};
 const local=()=>{try{return localStorage;}catch{return null;}},session=()=>{try{return sessionStorage;}catch{return null;}};
 const fresh=()=>({version:1,revision:0,entered:{'night-order':true},completed:{},exits:{},current:'night-order',lastExit:null,finalRoute:null});
 function normalize(value){const p=fresh();p.revision=Number.isSafeInteger(value.revision)&&value.revision>=0?value.revision:0;for(const id of ids){p.entered[id]=id==='night-order'||value.entered?.[id]===true;p.completed[id]=value.completed?.[id]===true;}for(const route of ['shed','drain'])p.exits[route]=value.exits?.[route]===true;p.current=ids.includes(value.current)?value.current:'night-order';p.lastExit=['shed','drain'].includes(value.lastExit)?value.lastExit:null;p.finalRoute=['garage','drain'].includes(value.finalRoute)?value.finalRoute:null;return p;}
 function migrate(){
  const p=fresh(),career=read(local(),'rough-cut.career.v1'),receipts=read(local(),'rough-cut.night-order-receipts.v1');
  p.completed['night-order']=Number(career.escapes)>0;
  for(const [id,route]of [['back-nine','shed'],['under-green','drain']]){
   const saved=read(local(),`rough-cut.${id}.v1`),receipt=receipts.routes?.[route];
   p.exits[route]=receipt?.completed===true||!!career.routes?.[route];
   p.completed['night-order']||=p.exits[route];if(p.exits[route])p.lastExit=route;
   // Old unlock flags were written at the Level 1 win screen. Only a later
   // chapter save proves that the player actually entered that route.
   p.entered[id]=p.completed['night-order']&&p.exits[route]&&(id==='back-nine'?saved.version===2&&Number.isInteger(saved.variationSeed):saved.version===4);
   p.completed[id]=p.entered[id]&&saved.completed===true;
   if(p.entered[id]){p.current=id;p.lastExit=route;}
  }
  const final=read(local(),'rough-cut.final-cut.v1');
  const branch=final.route==='garage'?'back-nine':final.route==='drain'?'under-green':null;
  if(branch&&p.completed[branch]&&final.version===1){p.entered['final-cut']=true;p.completed['final-cut']=final.completed===true;p.current='final-cut';p.finalRoute=final.route;}
  return p;
 }
 let memory;
 function state(){const disk=read(local(),KEY),backup=read(session(),KEY);const candidates=[disk,backup,memory].filter(p=>p?.version===1).sort((a,b)=>(b.revision||0)-(a.revision||0));memory=normalize(candidates[0]||migrate());return memory;}
 function save(p){memory=normalize(p);memory.revision++;for(const storage of [local(),session()])try{storage?.setItem(KEY,JSON.stringify(memory));}catch{}window.dispatchEvent(new Event('rc-progress'));return memory;}
 function available(id,p=state()){
  if(id==='night-order')return true;
  if(id==='back-nine'||id==='under-green')return p.completed['night-order']&&p.exits[id==='back-nine'?'shed':'drain']&&p.entered[id];
  return id==='final-cut'&&p.entered[id]&&(p.completed['back-nine']||p.completed['under-green']);
 }
 function next(id,p=state()){
  if(!p.completed[id])return null;
  if(id==='night-order'&&p.lastExit)return {id:p.lastExit==='shed'?'back-nine':'under-green',href:`./${p.lastExit==='shed'?'back-nine':'under-green'}.html?from=${p.lastExit}`};
  if(id==='back-nine'||id==='under-green')return {id:'final-cut',href:`./final-cut.html?from=${id==='back-nine'?'garage':'drain'}`};
  return null;
 }
 // The menu's main action continues the story only into a chapter whose card is
 // still locked: that first entry is what unlocks it. Once the next chapter can
 // be selected, the main action launches the chapter the player selected.
 function continuation(id,p=state()){const target=next(id,p);return target&&!available(target.id,p)?target:null;}
 function complete(id,route){const p=state();if(!ids.includes(id))return;if(id==='night-order'&&!['shed','drain'].includes(route))return;p.completed[id]=true;p.entered[id]=true;p.current=id;if(id==='night-order'){p.exits[route]=true;p.lastExit=route;}save(p);}
 function enter(id){const p=state();if(!available(id,p))return false;p.entered[id]=true;p.current=id;save(p);return true;}
 function admit(id){
  const p=state(),from=new URLSearchParams(location.search).get('from');
  const earned=(id==='back-nine'&&from==='shed'||id==='under-green'&&from==='drain')&&p.completed['night-order']&&p.exits[from]
   ||id==='final-cut'&&(from==='garage'&&p.completed['back-nine']||from==='drain'&&p.completed['under-green']);
  if(!available(id,p)&&!earned){location.replace('./index.html');return false;}
  p.entered[id]=true;p.current=id;if(id==='final-cut'&&earned)p.finalRoute=from;save(p);return true;
 }
 const reason=id=>id==='back-nine'?'Escape Night Order through the shed, then continue into this route.':id==='under-green'?'Escape Night Order through the drain, then continue into this route.':'Finish either Chapter 02 route, then continue into the final round.';
 function menuHref(id){if(!available(id))return null;const p=state();return `./${id}.html${p.completed[id]?'?replay=1':''}`;}
 window.RCProgression={state,available,next,continuation,complete,enter,admit,reason,menuHref};
 state();
})();
