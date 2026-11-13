const assert=require('node:assert/strict');
// Reconstruct the pre-footwork adapter without changing the working tree.
// Fail visibly if later source changes invalidate the comparison transform.
module.exports=function actorBaseline(source){
 let s=source.replace(/\r\n/g,'\n');
 s=s.replace(/^import \{create(?:PlantedFootwork[^}]*|FootContactEvents)\}.*\n/gm,'');
 s=s.replace(/ const footwork=createPlantedFootwork\(\)[\s\S]*? action\?\.setEffectiveWeight\(1\);idle\?\.setEffectiveWeight\(0\);\n/,'');
 s=s.replace('footwork.reset();walkingSupports.reset();footEvents.reset();','');
 s=s.replace('/WALK_CYCLE%1','/.74%1');
 s=s.replace('const moving=j.speed>.1;', 'const moving=j.speed>.1||Math.abs(j.turnRate||0)>.15;');
 s=s.replace(/  root.updateMatrixWorld\(true\);\n  const rootRotationForFeet[\s\S]*?  if\(chest\)/,'  if(chest)');
 s=s.replace(/  const soundFeet=[\s\S]*?state.soleHeights=.*;\n/,'');
 s=s.replace('drainFootsteps:()=>footEvents.drain(),','');
 assert(!/footEvents|footwork|walkingSupports|soleHeight|rawFeet/.test(s),'Baseline transform must remove the entire new footwork integration');
 assert(s.includes('Math.abs(j.turnRate||0)>.15'),'Baseline uses walking animation during turns');
 return s;
};
