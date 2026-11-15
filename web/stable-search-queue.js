// Fixed-capacity decrease-key heap. Ties retain the first insertion order,
// matching the route planner's original earliest-minimum linear scan.
export function createStableSearchQueue(capacity){
 const ids=new Int32Array(capacity),positions=new Int32Array(capacity).fill(-1),scores=new Float64Array(capacity),order=new Uint32Array(capacity);
 let size=0,serial=0;
 const before=(a,b)=>scores[a]<scores[b]||(scores[a]===scores[b]&&order[a]<order[b]);
 function swap(a,b){const id=ids[a];ids[a]=ids[b];ids[b]=id;positions[ids[a]]=a;positions[id]=b;}
 return {
  get length(){return size;},
  clear(){size=serial=0;positions.fill(-1);},
  set(id,score){
   let slot=positions[id];
   if(slot<0){slot=size++;ids[slot]=id;positions[id]=slot;order[id]=serial++;}
   scores[id]=score;
   while(slot>0){const parent=(slot-1)>>1;if(!before(id,ids[parent]))break;swap(slot,parent);slot=parent;}
  },
  pop(){
   if(!size)return -1;
   const id=ids[0];positions[id]=-1;size--;
   if(size){ids[0]=ids[size];positions[ids[0]]=0;let slot=0;
    while(slot*2+1<size){let child=slot*2+1;if(child+1<size&&before(ids[child+1],ids[child]))child++;if(!before(ids[child],ids[slot]))break;swap(slot,child);slot=child;}
   }
   return id;
  }
 };
}
