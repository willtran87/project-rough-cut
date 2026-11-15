/* Optional local journal and study tools. No requests or automatic uploads. */
(() => {
  const dialog=document.getElementById('study-dialog'), launch=document.getElementById('study-launch');
  const form=document.getElementById('study-form'), status=document.getElementById('study-save-status');
  const key='rough-cut.playtests.v1';
  let reports=[];
  try {const value=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(value))reports=value.filter(v=>v&&typeof v==='object').slice(-20);} catch { /* Storage may be unavailable. */ }
  const api=()=>window.roughCutStudy;
  const refresh=()=>{launch.hidden=!api()?.available();};
  setInterval(refresh,250);refresh();
  launch.addEventListener('click',()=>{
    if(!api()?.available())return;
    api().prepare();
    const notes=api().journal(),host=document.getElementById('study-notes');host.replaceChildren();
    if(!notes.length){const p=document.createElement('p');p.textContent='Look for colored pennants on course noticeboards. Use nearby to read a note; discoveries are optional and persist across runs.';host.append(p);}
    for(const note of notes){const article=document.createElement('article'),h=document.createElement('h3'),p=document.createElement('p');article.tabIndex=0;h.textContent=note.title;p.textContent=note.text;article.append(h,p);host.append(article);}
    dialog.showModal();document.getElementById('study-close').focus();
  });
  document.getElementById('study-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{api()?.prepare();launch.focus();});
  for(const button of document.querySelectorAll('[data-section]'))button.addEventListener('click',()=>{
    for(const item of document.querySelectorAll('[data-section]'))item.setAttribute('aria-pressed',String(item===button));
    for(const name of ['journal','feedback','setup'])document.getElementById('study-'+name).hidden=name!==button.dataset.section;
  });
  for(const button of document.querySelectorAll('[data-comfort]'))button.addEventListener('click',()=>{
    api().comfort(Number(button.dataset.comfort));document.getElementById('study-comfort-status').textContent=button.textContent+' applied and saved. Close to return to the game menu.';
  });
  for(const button of document.querySelectorAll('[data-audio]'))button.addEventListener('click',()=>{
    api().audition(Number(button.dataset.audio));document.getElementById('study-audio-status').textContent=button.textContent.replace('Hear','Playing')+'. Uses your effects and master volume.';
  });
  form.addEventListener('submit',event=>{
    event.preventDefault();if(!form.reportValidity())return;
    reports.push({recordedAt:new Date().toISOString(),feedback:Object.fromEntries(new FormData(form)),run:api().snapshot()});reports=reports.slice(-20);
    try {localStorage.setItem(key,JSON.stringify(reports));status.textContent=`Saved locally (${reports.length}/20 reports). Download when ready to share.`;}
    catch {status.textContent='Browser storage is unavailable. Feedback is held for this session; download it before closing.';}
  });
  document.getElementById('study-download').addEventListener('click',()=>{
    const blob=new Blob([JSON.stringify({schema:1,exportedAt:new Date().toISOString(),reports,currentRun:api().snapshot()},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='rough-cut-playtest-'+new Date().toISOString().slice(0,10)+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    status.textContent='Report download prepared. Share it only when you choose.';
  });
})();
