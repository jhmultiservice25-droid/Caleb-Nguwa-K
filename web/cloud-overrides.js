document.addEventListener('DOMContentLoaded',()=>{
  const C=window.EtatCivilCloud;
  if(!C) return;

  const login=document.querySelector('#login-form');
  if(login) login.addEventListener('submit',async e=>{
    e.preventDefault();e.stopImmediatePropagation();
    const fd=new FormData(login); const email=fd.get('username'); const password=fd.get('password');
    try{
      await C.login(email,password);
      const profile=await C.profile();
      if(!profile) throw new Error('Profil introuvable.');
      toast('Connexion réussie.');
      setTimeout(()=>{location.href=profile.role==='national_admin'?'admin.html':profile.role==='provincial_admin'?'province.html?province='+encodeURIComponent(profile.province||'Kinshasa'):profile.role==='agent'?'agent.html':'citoyen.html'},450);
    }catch(err){toast(err.message||'Échec de connexion.');}
  },true);

  const signup=document.querySelector('#signup-form');
  if(signup) signup.addEventListener('submit',async e=>{
    e.preventDefault();e.stopImmediatePropagation();
    if(!signup.reportValidity()) return;
    const p=Object.fromEntries(new FormData(signup));
    try{
      const result=await C.signup(p);
      if(result.session){toast('Compte créé.');setTimeout(()=>location.href='citoyen.html',500)}
      else toast('Compte créé. Vérifiez votre e-mail pour confirmer votre inscription.');
    }catch(err){toast(err.message||'Création du compte impossible.');}
  },true);

  const citizen=document.querySelector('#citizen-registration');
  if(citizen) citizen.addEventListener('submit',async e=>{
    e.preventDefault();e.stopImmediatePropagation();
    if(!citizen.reportValidity()) return;
    try{
      const r=await C.submitCivilRequest(new FormData(citizen));
      toast(`Demande transmise : ${r.commune} · ${r.province}`);
      setTimeout(()=>location.href='citoyen.html?sent=1',600);
    }catch(err){toast(err.message||'Envoi impossible.');}
  },true);

  const docForm=document.querySelector('#document-request-form');
  if(docForm) docForm.addEventListener('submit',async e=>{
    e.preventDefault();e.stopImmediatePropagation();
    if(!docForm.reportValidity()) return;
    try{
      const r=await C.submitDocumentRequest(new FormData(docForm));
      toast(`Demande reçue : ${r.id}`);
      setTimeout(()=>location.href='citoyen.html',600);
    }catch(err){toast(err.message||'Envoi impossible.');}
  },true);

  const verifyBtn=document.querySelector('[data-search-act]');
  if(verifyBtn) verifyBtn.addEventListener('click',async e=>{
    const q=document.querySelector('#act-number')?.value.trim();
    if(!q || !/^[0-9a-f-]{36}$/i.test(q)) return;
    e.preventDefault();e.stopImmediatePropagation();
    try{
      const rows=await C.verifyDocument(q);
      let box=document.querySelector('#digital-verification-result');
      if(!box){box=document.createElement('div');box.id='digital-verification-result';box.style.marginTop='18px';verifyBtn.closest('.panel')?.appendChild(box)}
      if(!rows.length){box.innerHTML='<div style="padding:16px;border:1px solid #f1c7c7;background:#fff5f5;color:#b12d2d"><b>Document non vérifié</b><p>Aucun document valide ne correspond à ce QR.</p></div>';return}
      const r=rows[0];
      box.innerHTML=`<div style="padding:16px;border:1px solid #bfe3cf;background:#f4fff8;color:#17643f"><b>✓ Document ${r.status==='valid'?'authentique et valide':'révoqué'}</b><p>Numéro : ${r.document_number}<br>Type : ${r.document_type}<br>Juridiction : ${r.commune}, ${r.province}<br>Émis le : ${new Date(r.issued_at).toLocaleString('fr-FR')}</p></div>`;
    }catch(err){toast(err.message||'Vérification impossible.');}
  },true);

  (async()=>{
    if(document.querySelector('.citizen-wrap')){
      const s=await C.session();
      if(!s && !location.pathname.endsWith('connexion.html')){toast('Veuillez vous connecter.');setTimeout(()=>location.href='connexion.html',700);return}
      try{
        const [acts,docs]=await Promise.all([C.myCivilRequests(),C.myDocumentRequests()]);
        const status=document.querySelector('[data-citizen-status]');
        if(status){
          status.innerHTML=acts.length?acts.slice(0,3).map(r=>`<div style="padding:10px;border-bottom:1px solid #e5edf6"><span class="badge badge-blue">${r.status}</span><br><b>${r.kind.toUpperCase()}</b> · ${r.commune}, ${r.province}<br><small>${new Date(r.created_at).toLocaleString('fr-FR')}</small></div>`).join(''):'<p>Aucune demande d’acte envoyée.</p>';
        }
        const holder=document.querySelector('#citizen-documents tbody');
        if(holder){holder.innerHTML=docs.length?docs.map(r=>`<tr><td>${r.id}<br><small>${new Date(r.created_at).toLocaleString('fr-FR')}</small></td><td>${r.document_type}</td><td>${r.province}</td><td>${r.commune}</td><td><span class="badge badge-blue">${r.status}</span></td><td>${r.status==='issued'?'Disponible':'En traitement'}</td></tr>`).join(''):'<tr><td colspan="6">Aucune demande de document.</td></tr>'}
      }catch(err){console.error(err)}
    }
  })();
});
