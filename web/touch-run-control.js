// On-foot touch speed selection. It never supplies a movement direction.
// Normal release retains a selected toggle; interrupted contacts clear it.
export function createTouchRunControl(){
 let pointer=null,latched=false,toggle=false;
 return {
  press(id,useToggle){
   if(pointer!==null)return false;
   pointer=id;toggle=!!useToggle;
   if(toggle)latched=!latched;else latched=false;
   return true;
  },
  release(id,cancelled=false){
   if(pointer!==id)return false;
   pointer=null;if(cancelled)latched=false;return true;
  },
  reset(){pointer=null;latched=false;},
  get active(){return latched||(!toggle&&pointer!==null);},
  get latched(){return latched;},
  get pointer(){return pointer;}
 };
}
