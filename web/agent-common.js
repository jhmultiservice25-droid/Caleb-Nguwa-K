document.addEventListener('DOMContentLoaded',async()=>{
  const C=window.EtatCivilCloud;
  if(!C){location.replace('connexion.html');return;}
  try{
    const p=await C.profile();
    if(!p||p.role!=='agent'){
      location.replace('connexion.html');return;
    }
    document.body.classList.add('authorized-workspace');
    document.querySelectorAll('[data-agent-name]').forEach(el=>el.textContent=p.full_name||'Agent');
    document.querySelectorAll('[data-agent-scope]').forEach(el=>el.textContent=[p.commune,p.province].filter(Boolean).join(' · '));
    document.querySelectorAll('[data-logout]').forEach(btn=>btn.addEventListener('click',async e=>{e.preventDefault();await C.logout();location.replace('connexion.html')}));
  }catch(e){location.replace('connexion.html');}
});