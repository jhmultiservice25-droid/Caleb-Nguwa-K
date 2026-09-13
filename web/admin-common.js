document.addEventListener('DOMContentLoaded',async()=>{
  const C=window.EtatCivilCloud;if(!C)return;
  try{
    const p=await C.profile();
    if(!p||!['national_admin','provincial_admin','communal_admin'].includes(p.role)){
      location.href='connexion.html';return;
    }
    document.querySelectorAll('[data-admin-name]').forEach(el=>el.textContent=p.full_name||'Administrateur');
    document.querySelectorAll('[data-admin-role]').forEach(el=>el.textContent=p.role==='national_admin'?'Super Admin national':p.role==='provincial_admin'?'Admin provincial':'Admin communal');
    document.querySelectorAll('[data-admin-scope]').forEach(el=>el.textContent=p.role==='national_admin'?'Toute la RDC':p.commune?`${p.commune} · ${p.province}`:(p.province||''));
    document.querySelectorAll('[data-logout]').forEach(btn=>btn.addEventListener('click',async e=>{e.preventDefault();await C.logout();location.href='connexion.html'}));
  }catch(e){console.error(e);location.href='connexion.html'}
});
