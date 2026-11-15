// Fixture identity follows its authored place in the route, never array order.
// Most cages radiate evenly. The pump work fixture's solid upper hood gives
// it a broad downward distribution, with a little spill through the cage.
const profiles={
 'arrival-door': [0x9cafa5,.82,'cold service entrance'],
 'gallery-entry': [0xe2b680,1.08,'warm bark reveal'],
 'gallery-crossing': [0xa0b9ae,1,'cold crossing'],
 'gallery-junction': [0xd2b48b,.90,'warm route junction'],
 'gallery-deep': [0x91aaa6,.82,'cold distant service'],
 'gallery-turn': [0xd7b17f,.94,'warm turn'],
 'north-return': [0x98afa8,.86,'cold return'],
 'bunker-north': [0xd2b38a,.88,'warm retaining face'],
 'bunker-records': [0xdfbd91,1,'warm records approach'],
 'pump-work': [0xe4bd8c,1.08,'warm machinery focal point'],
 'pump-return': [0x91aaa6,.84,'cold return passage'],
 'service-junction': [0xa6b4aa,.92,'cold service junction'],
 'range-entry': [0x94aeac,.92,'cold range threshold'],
 'range-middle': [0x91aaa6,.86,'cold range landing'],
 'keeper-approach': [0xe0b889,1,'warm keeper threshold'],
 'bunker-inspection': [0xd9b987,.98,'warm sand and root reveal'],
 'keeper-desk': [0xe9b575,.6,'warm protected record']
};
export function drainLampProfile(id){
 const profile=profiles[id];
 if(!profile)throw new Error('Unknown underground lamp direction: '+id);
 const [color,power,role]=profile;
 return {id,color,power,role,reach:13,...(id==='pump-work'?{beam:{direction:[0,-1,0],innerDegrees:48,outerDegrees:78,spill:.12}}:{})};
}
export const DRAIN_LAMP_IDS=Object.freeze(Object.keys(profiles));
