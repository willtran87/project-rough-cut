const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('web/campaign-progress.js','utf8');
function storage(seed={}){const data=new Map(Object.entries(seed).map(([k,v])=>[k,JSON.stringify(v)]));return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};}
function app(seed={},local=storage(seed),session=storage()){
 const location={search:'',replace(url){this.redirect=url;}},window={dispatchEvent(){}};
 vm.runInNewContext(source,{window,location,localStorage:local,sessionStorage:session,URLSearchParams,Event:class{}});
 return {p:window.RCProgression,location,local,session};
}
for(const [route,id,other,finalRoute]of [['shed','back-nine','under-green','garage'],['drain','under-green','back-nine','drain']]){
 const a=app(),{p,location}=a;
 assert(p.available('night-order'));for(const locked of [id,other,'final-cut'])assert(!p.available(locked));
 location.search='?from='+route;assert.equal(p.admit(id),false,'A URL cannot grant an unearned chapter');
 p.complete('night-order',route);assert(!p.available(id),'Winning alone does not mean the route was started');assert.equal(p.next('night-order').id,id);
 assert(p.admit(id));assert(p.available(id));assert(!p.available(other));assert(!p.available('final-cut'));
 const reload=app({},a.local,a.session);assert(reload.p.available(id),'Entry survives reload');
 p.complete(id);assert(!p.available('final-cut'));location.search='?from='+finalRoute;assert(p.admit('final-cut'));assert(p.available('final-cut'));
 p.complete('final-cut');assert.equal(p.next('final-cut'),null);assert.equal(p.menuHref(id),'./'+id+'.html?replay=1');
 p.enter('night-order');assert(p.available(id),'Replaying earlier chapters preserves earned access');
}
const legacy=app({'rough-cut.career.v1':{escapes:1,routes:{shed:{score:10}}},'rough-cut.back-nine.v1':{version:2,variationSeed:1,completed:true},'rough-cut.final-cut.v1':{version:1,route:'garage',checkpoint:1}});
assert(legacy.p.available('back-nine'));assert(legacy.p.available('final-cut'));assert(!legacy.p.available('under-green'));
const onlyWon=app({'rough-cut.career.v1':{escapes:1,routes:{drain:{score:10}}},'rough-cut.under-green.v1':{version:1,unlocked:true}});assert(!onlyWon.p.available('under-green'));
const corrupt=storage();corrupt.setItem('rough-cut.campaign-progress.v1','{bad');assert(!app({},corrupt).p.available('final-cut'));
const denied={getItem(){throw Error('disabled');},setItem(){throw Error('disabled');}},fallback=app({},denied);fallback.p.complete('night-order','drain');fallback.location.search='?from=drain';assert(fallback.p.admit('under-green'));assert(app({},denied,fallback.session).p.available('under-green'));
console.log('PASS: route-specific qualification, entry, finale, reload, earned replay, legacy migration and storage fallback');
