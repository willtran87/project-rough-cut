// Keep import/link and early initialization failures out of the silent static
// "Preparing" state. This small loader does not allocate a renderer or audio.
const script=document.querySelector('[data-chase-entry]');
function showStartupError(error){
 const message=error?.message||String(error),graphics=/webgl|graphics context/i.test(message);
 console.error('Back Nine startup failed:',error);
 document.getElementById('panel').hidden=false;
 document.getElementById('title').textContent='Level 2 could not start';
 const status=document.getElementById('loading');status.hidden=false;
 status.textContent=(graphics?'The browser could not initialize the game’s graphics. ':'A game file could not load or initialize. ')+message;
 document.getElementById('checkpoint-note').textContent='Retry loading from the start; if this repeats, share the error above.';
 for(const id of ['back-nine-guide','chase-comfort','replay-story','loading-art','brief-art','chapter-caption'])document.getElementById(id).hidden=true;
 const button=document.getElementById('primary');button.disabled=false;button.textContent='Retry loading';
 button.onclick=()=>{const url=new URL(location.href);url.searchParams.set('retry',String(Date.now()));location.replace(url.href);};
 button.focus({preventScroll:true});
}
try{await import(script.dataset.chaseEntry);}catch(error){showStartupError(error);}
