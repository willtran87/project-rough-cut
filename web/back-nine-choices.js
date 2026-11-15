// Authored forks, in metres. The broad lane remains driveable; 3.6-metre
// maintenance openings admit a straight cart but reject Joe's cutting decks.
export function addCourseChoices(course){
 const insert=(y,points)=>{const i=course.paths[0].findIndex(p=>p[1]===y);course.paths[0].splice(i+1,0,...points);};
 insert(190,[[4.5,200],[4.5,220]]);insert(325,[[0,350],[-6,365]]);insert(755,[[-7,768],[-18,783]]);
 course.paths.push(
  [[10,190],[-10,200],[-10,222],[-14,235]],
  [[0,325],[-25,337],[-25,365],[-22,380]],
  [[-12,755],[-24,758],[-24,782],[-23,795]]
 );
 course.footPaths=[
  [[-25,337],[-36.5,340],[-36.5,360],[-25,365]],
  [[-24,758],[-33.15,761],[-33.15,780],[-24,782]]
 ];
 course.decisions=[
  {id:'pump-yard',name:'Pump yard',entry:{x:10,y:190},wide:{x:4.5,y:220},merge:{x:-14,y:235},gate:{x:-10,y:210},cue:'The pump house splits the lane. The maintenance gap is too narrow for his decks.'},
  {id:'range-works',name:'Range service court',entry:{x:0,y:325},wide:{x:-6,y:365},merge:{x:-22,y:380},gate:{x:-25,y:350},foot:{x:-36.5,y:350},cue:'Open road to the right. Tight maintenance gaps to the left.'},
  {id:'service-approach',name:'Service approach',entry:{x:-12,y:755},wide:{x:-7,y:768},merge:{x:-23,y:795},gate:{x:-24,y:770},foot:{x:-33.15,y:770},cue:'The garage is beyond the grounds store. The narrow hedge gap offers cover on foot.'}
 ];
 const fence=(id,x,y,rx)=>({id,kind:'service-fence',x,y,rx,ry:.22});
 course.features.push(
  {id:'pump-yard-trailer',kind:'trailer',x:-2,y:210,rx:2.5,ry:3.2},
  {id:'pump-yard-cart',kind:'parked-cart',x:-21,y:213,rx:1.3,ry:2},
  fence('yard-west',-13.65,210,1.85),fence('yard-east',-6.35,210,1.85),
  {id:'range-service-cart',kind:'parked-cart',x:-17,y:342,rx:1.3,ry:2},
  fence('range-outer',-38.175,350,.825),fence('range-middle',-31.225,350,4.425),fence('range-inner',-21.35,350,1.85),
  {id:'garage-service-trailer',kind:'trailer',x:-17.5,y:766,rx:2.5,ry:3.2},
  fence('garage-outer',-36,770,2),fence('garage-middle',-29.05,770,3.25),fence('garage-inner',-20.35,770,1.85),
  {id:'garage-windfall',kind:'fallen-tree',x:-33,y:747,rx:5,ry:1}
 );
 // Long alternatives reconnect before required relay/garage approaches. The
 // wet crossover links the west, central and east lanes instead of dead-ending.
 course.paths.push(
  [[18,155],[29,176],[30,215],[35,237],[28,264],[0,280]],
  [[-8,425],[13,431],[30,447],[33,476],[33,507],[32,516],[12,541],[-18,550]],
  [[0,620],[-30,639],[-35,657],[-35,695],[-31,716],[-12,755]],
  [[-28,480],[0,488],[18,488],[33,476]]
 );
 course.routeOptions=[
  {path:7,id:'reservoir-loop',name:'Reservoir service loop',width:3.4,lampSpacing:22,tradeoff:'Longer route with machinery cover and a cart-only gate; rejoins before the first relay.'},
  {path:8,id:'dry-range',name:'Dry range perimeter',width:3.4,lampSpacing:22,tradeoff:'Avoid the flooded lanes along the longer east perimeter; narrow gate interrupts Joe.'},
  {path:9,id:'west-service',name:'West service lane',width:3.4,lampSpacing:22,tradeoff:'Use the irrigation tank as cover, or stay on the more direct clubhouse lane.'},
  {path:10,id:'wet-crossover',name:'Flooded crossover',width:3,lampSpacing:26,tradeoff:'Switch between all three lanes across exposed, slippery ground.'}
 ];
 course.footPaths.push([[29,176],[37.25,187],[37.25,210],[30,215]]);
 course.decisions.push(
  {id:'reservoir-loop',name:'Reservoir loop',entry:{x:18,y:155},wide:{x:10,y:190},merge:{x:0,y:280},gate:{x:29.6,y:199},foot:{x:37.25,y:199},cue:'The reservoir lane bends right behind the equipment. Its narrow gate can separate the cart from his mower.'},
  {id:'dry-range',name:'Dry range perimeter',entry:{x:-8,y:425},wide:{x:6,y:515},merge:{x:-18,y:550},gate:{x:33,y:493},cue:'Dry ground follows the eastern perimeter. The flooded crossover lets you change lanes, but offers little cover.'}
 );
 course.features.push(
  {id:'reservoir-trailer',kind:'trailer',x:20,y:175,rx:2.5,ry:3.2},
  {id:'reservoir-cistern',kind:'cistern',x:24,y:253,rx:3,ry:4.5},
  fence('reservoir-west',25.95,199,1.85),fence('reservoir-middle',33.9,199,2.5),fence('reservoir-east',38.55,199,.45),
  {id:'range-abandoned-cart',kind:'parked-cart',x:24,y:454,rx:1.3,ry:2},
  fence('dry-range-west',29.35,493,1.85),fence('dry-range-east',36.65,493,1.85),
  {id:'range-cut-timber',kind:'fallen-tree',x:22,y:545,rx:5,ry:1},
  {id:'west-service-tank',kind:'cistern',x:-29,y:675,rx:3,ry:4.5},
  {id:'west-service-windfall',kind:'fallen-tree',x:-24,y:642,rx:5,ry:1}
 );
}
