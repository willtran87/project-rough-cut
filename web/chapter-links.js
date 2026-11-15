(() => {
 const chapters=[
  {id:'night-order',title:'Night Order',chapter:'Chapter 01',href:null,tagline:'The course closes at dusk. Joe does not.',heading:'One last action item.',description:'The south gate is locked. Joe is still here.',start:'Answer Joe’s last task. Cross the locked course.',lessons:[['Explore the course','Find the three field checks and a way out.'],['Make him look elsewhere','Chip a ball. Move while Joe investigates.'],['Break his sightline','Use solid cover. Let attention fall.']],closing:'Get out alive. Learn the course as you go.'},
  {id:'back-nine',title:'The Back Nine',chapter:'Chapter 02 · Shed route',href:'./back-nine.html',tagline:'The gate was only the beginning.',heading:'Keep the cart moving.',description:'Escape across the back nine with Joe on your trail.',start:'Take the cart through the back nine.',lessons:[['Read the course','Follow the cart paths and find the maintenance yard.'],['Keep your distance','Steer through cover and keep ahead of Joe.'],['Find the way through','Reconnect the maintenance relays and reach the exit.']],closing:'A cart, an open course, and one very determined groundskeeper.'},
  {id:'under-green',title:'Under the Green',chapter:'Chapter 02 · Drain route',href:'./under-green.html',tagline:'Read the signals. Beat the surge.',heading:'Find a way through the drains.',description:'Below the course, the water is rising. Joe is still coming.',start:'Enter the drainage tunnels beneath the course.',lessons:[['Watch the water','Read the physical signals and cross between surges.'],['Keep your distance','Find dry routes and put the water between you and Joe.'],['Reach the keeper’s room','Redirect the bypass, then close the sluice behind you.']],closing:'Listen to the pipes. Choose your moment.'},
  {id:'final-cut',title:'The Final Cut',chapter:'Chapter 03',href:'./final-cut.html',tagline:'One final round. One way off the course.',heading:'Survive the championship grounds.',description:'Joe has brought out the tournament mower. The public road lies beyond the final hole.',start:'Enter the final round on the championship grounds.',lessons:[['Read his next pass','Watch the machine and cross behind its cutting path.'],['Use the grounds','Permanent shelters and distractions buy you time.'],['Prepare your escape','Explore the maintenance equipment and find a way to the road.']],closing:'The overlook is safe. Begin when you are ready.'}
 ];
 const highlights={
  'night-order':[['explore','Explore the grounds'],['ball','Create a distraction'],['shelter','Stay out of sight']],
  'back-nine':[['cart','Take the wheel'],['route','Find a route through'],['pursuit','Outrun the mower']],
  'under-green':[['water','Read the surges'],['route','Choose your crossing'],['valve','Control the sluice']],
  'final-cut':[['pursuit','Face the tournament mower'],['shelter','Use the shelters'],['gate','Reach the public road']]
 };
 const locations={'night-order':'South Gate','back-nine':'Cart Shed','under-green':'Drain Entrance','final-cut':'Championship Grounds'};
 for(const chapter of chapters){chapter.location=locations[chapter.id];chapter.art='./assets/menu/'+chapter.id+'-scene.webp';chapter.thumbnail='./assets/menu/'+chapter.id+'-thumb.webp';chapter.highlights=highlights[chapter.id];}
 const glyphs={0:['111','101','101','101','111'],1:['010','110','010','010','111'],2:['111','001','111','100','111'],3:['111','001','111','001','111']};
 const number=n=>'<svg class="chapter-number" viewBox="0 0 9 5" aria-hidden="true" shape-rendering="crispEdges">'+[0,n].map((digit,k)=>glyphs[digit].map((row,y)=>[...row].map((v,x)=>v==='1'?`<rect x="${x+k*5}" y="${y}" width="1" height="1"/>`:'').join('')).join('')).join('')+'</svg>';
 const symbols={
  'night-order':'M2 3h12v2H2zM3 5h2v9H3zM7 5h2v9H7zM11 5h2v9h-2zM2 8h12v2H2z',
  'back-nine':'M2 3h12v2H2zM4 5h2v4H4zM11 5h2v4h-2zM2 9h12v3H2zM3 12h3v2H3zM10 12h3v2h-3z',
  'under-green':'M2 2h3v5h4V3h5v3h-2v5H5v3H2zM8 13h6v2H8z',
  'final-cut':'M3 3h8v3h3v6H2V7h4V5H3zM3 12h3v3H3zM10 12h3v3h-3zM7 7h2v2H7z'
 };
 Object.assign(symbols,{
  explore:'M1 3h4v10H1zM6 2h4v10H6zM11 3h4v10h-4z',
  ball:'M2 13h12v2H2zM4 10h2v2H4zM6 8h2v2H6zM8 6h2v2H8zM10 3h4v2h-4z',
  shelter:'M1 7h2V5h2V3h2V1h2v2h2v2h2v2h2v2h-2v6H3V9H1zM5 9v4h2V9zM9 9v4h2V9z',
  route:'M2 1h6v2H4v3h8v7h-2V8H2zM8 11h6v2h-6zM10 13h2v2h-2z',
  water:'M1 3h3v2H1zM4 1h3v2H4zM7 3h3v2H7zM10 1h3v2h-3zM1 8h3v2H1zM4 6h3v2H4zM7 8h3v2H7zM10 6h3v2h-3zM1 13h3v2H1zM4 11h3v2H4zM7 13h3v2H7zM10 11h3v2h-3z',
  valve:'M4 1h8v2H4zM2 3h2v10H2zM12 3h2v10h-2zM4 13h8v2H4zM7 3h2v10H7zM4 7h8v2H4z'
 });symbols.cart=symbols['back-nine'];symbols.pursuit=symbols['final-cut'];symbols.gate=symbols['night-order'];
 const emblem=id=>`<svg class="chapter-emblem" viewBox="0 0 16 16" aria-hidden="true" shape-rendering="crispEdges"><path d="${symbols[id]}"/></svg>`;
 let index=0;const listeners=new Set(),buttons=[],nav=document.createElement('nav');nav.id='chapter-links';nav.hidden=true;nav.setAttribute('aria-label','Select a chapter');
 function select(next){const found=typeof next==='string'?chapters.findIndex(c=>c.id===next):next;if(found<0||found>=chapters.length||!RCProgression.available(chapters[found].id))return;const changed=index!==found;index=found;buttons.forEach((b,i)=>{b.setAttribute('aria-pressed',String(i===index));b.dataset.selected=String(i===index);});if(changed)listeners.forEach(fn=>fn(chapters[index]));}
 const groups=[['The last shift',[0]],['Alternate routes',[1,2]],['The final round',[3]]];
 groups.forEach(([label,indices],groupIndex)=>{
  const group=document.createElement('section');group.className='chapter-group'+(groupIndex===1?' chapter-route-group':'');group.setAttribute('aria-label',`Chapter ${groupIndex+1}: ${label}`);
  group.innerHTML=`<h3>${number(groupIndex+1)}<span>${label}</span></h3><div class="chapter-group-cards"></div>`;
  for(const i of indices){const chapter=chapters[i],b=document.createElement('button');b.type='button';b.dataset.chapter=chapter.id;b.innerHTML='<span class="chapter-card-art"><img alt="" width="480" height="270" decoding="async"></span><span class="chapter-card-label"><small></small><strong></strong></span><span class="chapter-selected" aria-hidden="true"></span>';b.querySelector('img').src=chapter.thumbnail;b.querySelector('small').textContent=i===1?'Shed route':i===2?'Drain route':chapter.chapter;b.querySelector('strong').innerHTML=emblem(chapter.id);const title=document.createElement('span');title.textContent=chapter.title;b.querySelector('strong').append(title);const stamp=document.createElement('span');stamp.className='chapter-completed';stamp.hidden=true;stamp.textContent='Escaped';b.querySelector('.chapter-card-label').append(stamp);b.onclick=()=>select(i);buttons.push(b);group.querySelector('.chapter-group-cards').append(b);}
  nav.append(group);
 });
 function refreshProgress(){const progress=RCProgression.state();buttons.forEach((b,i)=>{const id=chapters[i].id,unlocked=RCProgression.available(id,progress),completed=progress.completed[id]===true,stamp=b.querySelector('.chapter-completed');b.disabled=!unlocked;b.dataset.locked=String(!unlocked);stamp.hidden=unlocked&&!completed;stamp.textContent=unlocked?'Escaped':'Locked';b.dataset.completed=String(completed);b.title=unlocked?'':RCProgression.reason(id);b.setAttribute('aria-label',chapters[i].chapter+': '+chapters[i].title+(!unlocked?' — Locked. '+RCProgression.reason(id):completed?' — Escaped':''));});if(!RCProgression.available(chapters[index].id,progress))select(0);}
 function shift(delta){for(let n=1;n<=chapters.length;n++){const next=(index+delta*n+chapters.length*2)%chapters.length;if(RCProgression.available(chapters[next].id)){select(next);return;}}}
 document.body.append(nav);refreshProgress();select(RCProgression.state().current);window.addEventListener('storage',refreshProgress);window.addEventListener('pageshow',refreshProgress);window.addEventListener('rc-progress',refreshProgress);
 window.RCChapterSelect={selected:()=>chapters[index],select,shift,chapter:id=>chapters.find(c=>c.id===id),subscribe:fn=>listeners.add(fn),refreshProgress,emblem};
})();
