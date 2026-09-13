document.addEventListener('DOMContentLoaded',()=>{
  const C=window.EtatCivilCloud;
  if(!C) return;

  const routeByProfile=(profile)=>{
    if(profile?.role==='national_admin') location.href='admin.html';
    else if(profile?.role==='provincial_admin') location.href='province.html?province='+encodeURIComponent(profile.province||'Kinshasa');
    else if(profile?.role==='communal_admin') location.href='admin.html';
    else if(profile?.role==='agent') location.href='agent.html';
    else location.href='citoyen.html';
  };

  const params=new URLSearchParams(location.search);
  if(params.get('confirmed')==='1' && typeof toast==='function') setTimeout(()=>toast('Adresse e-mail confirmée. Vous pouvez maintenant vous connecter.'),150);
  if(location.hash.includes('error=')){try{const h=new URLSearchParams(location.hash.slice(1));const d=h.get('error_description');if(d&&typeof toast==='function')setTimeout(()=>toast(decodeURIComponent(d.replace(/\+/g,' '))),250)}catch{}}

  const login=document.querySelector('#login-form');
  if(login) login.addEventListener('submit',async e=>{
    e.preventDefault();e.stopImmediatePropagation();
    const fd=new FormData(login); const email=fd.get('username'); const password=fd.get('password');
    const submit=login.querySelector('button[type="submit"]');
    try{
      if(submit){submit.disabled=true;submit.textContent='Connexion…'}
      await C.login(email,password);
      try{await C.claimOwnInvitation()}catch(err){console.warn('Invitation claim skipped',err)}
      const profile=await C.profile();
      if(!profile) throw new Error('Profil introuvable.');
      toast('Connexion réussie.');
      setTimeout(()=>routeByProfile(profile),350);
    }catch(err){
      const msg=String(err?.message||'Échec de connexion.');
      if(/email not confirmed/i.test(msg)) toast('Votre adresse e-mail n’est pas encore confirmée. Utilisez le bouton de renvoi ci-dessous.');
      else if(/invalid login credentials/i.test(msg)) toast('Adresse e-mail ou mot de passe incorrect.');
      else toast(msg);
    }finally{
      if(submit){submit.disabled=false;submit.textContent='Se connecter'}
    }
  },true);

  const signup=document.querySelector('#signup-form');
  if(signup) signup.addEventListener('submit',async e=>{
    e.preventDefault();e.stopImmediatePropagation();
    if(!signup.reportValidity()) return;
    const p=Object.fromEntries(new FormData(signup));
    const email=String(p.email||'').trim().toLowerCase();
    const fullname=String(p.fullname||'').trim();
    const phone=String(p.phone||'').trim();
    const password=String(p.password||'');
    const submit=signup.querySelector('button[type="submit"]');
    try{
      if(!fullname) throw new Error('Veuillez saisir votre nom complet.');
      if(!phone) throw new Error('Veuillez saisir votre numéro de téléphone.');
      if(password.length<8) throw new Error('Le mot de passe doit contenir au moins 8 caractères.');
      if(submit){submit.disabled=true;submit.textContent='Création du compte…'}
      const redirectTo=(location.hostname==='localhost'||location.hostname==='127.0.0.1')?`${location.origin}/connexion.html?confirmed=1`:'https://etat-civil-rdc.vercel.app/connexion.html?confirmed=1';
      const {data,error}=await C.client.auth.signUp({email,password,options:{emailRedirectTo:redirectTo,data:{full_name:fullname,phone}}});
      if(error) throw error;
      const loginEmail=document.querySelector('#login-form input[name="username"]');
      if(loginEmail) loginEmail.value=email;
      const signupSection=document.querySelector('#signup-section');
      const loginSection=document.querySelector('#login-section');
      if(signupSection) signupSection.hidden=true;
      if(loginSection) loginSection.hidden=false;
      document.querySelector('#signup-tab')?.classList.remove('active');
      document.querySelector('#login-tab')?.classList.add('active');
      if(data.session){
        try{await C.claimOwnInvitation()}catch(err){console.warn('Invitation claim skipped',err)}
        const profile=await C.profile();
        toast('Compte citoyen créé avec succès.');
        setTimeout(()=>routeByProfile(profile),500);
      }else{
        toast('Compte créé. Consultez votre e-mail pour confirmer votre adresse, puis connectez-vous.');
      }
    }catch(err){
      const msg=String(err?.message||'Création du compte impossible.');
      if(/already registered|already been registered|user already exists/i.test(msg)) toast('Cette adresse possède déjà un compte. Utilisez Connexion ou renvoyez l’e-mail de confirmation.');
      else toast(msg);
    }finally{
      if(submit){submit.disabled=false;submit.textContent='Créer mon compte et continuer'}
    }
  },true);

  const citizen=document.querySelector('#citizen-registration');
  if(citizen) citizen.addEventListener('submit',async e=>{
    e.preventDefault();e.stopImmediatePropagation();
    if(!citizen.reportValidity()) return;
    try{const r=await C.submitCivilRequest(new FormData(citizen));toast(`Demande transmise : ${r.commune} · ${r.province}`);setTimeout(()=>location.href='citoyen.html?sent=1',600)}catch(err){toast(err.message||'Envoi impossible.')}
  },true);

  const docForm=document.querySelector('#document-request-form');
  if(docForm) docForm.addEventListener('submit',async e=>{
    e.preventDefault();e.stopImmediatePropagation();
    if(!docForm.reportValidity()) return;
    try{const r=await C.submitDocumentRequest(new FormData(docForm));toast(`Demande reçue : ${r.id}`);setTimeout(()=>location.href='citoyen.html',600)}catch(err){toast(err.message||'Envoi impossible.')}
  },true);

  const verifyBtn=document.querySelector('[data-search-act]');
  if(verifyBtn) verifyBtn.addEventListener('click',async e=>{
    const q=document.querySelector('#act-number')?.value.trim();
    if(!q || !/^[0-9a-f-]{36}$/i.test(q)) return;
    e.preventDefault();e.stopImmediatePropagation();
    try{
      const rows=await C.verifyDocument(q);let box=document.querySelector('#digital-verification-result');
      if(!box){box=document.createElement('div');box.id='digital-verification-result';box.style.marginTop='18px';verifyBtn.closest('.panel')?.appendChild(box)}
      if(!rows.length){box.innerHTML='<div style="padding:16px;border:1px solid #f1c7c7;background:#fff5f5;color:#b12d2d"><b>Document non vérifié</b><p>Aucun document valide ne correspond à ce QR.</p></div>';return}
      const r=rows[0];box.innerHTML=`<div style="padding:16px;border:1px solid #bfe3cf;background:#f4fff8;color:#17643f"><b>✓ Document ${r.status==='valid'?'authentique et valide':'révoqué'}</b><p>Numéro : ${r.document_number}<br>Type : ${r.document_type}<br>Juridiction : ${r.commune}, ${r.province}<br>Émis le : ${new Date(r.issued_at).toLocaleString('fr-FR')}</p></div>`;
    }catch(err){toast(err.message||'Vérification impossible.')}
  },true);

  (async()=>{
    if(document.querySelector('.citizen-wrap')){
      const s=await C.session();
      if(!s && !location.pathname.endsWith('connexion.html')){toast('Veuillez vous connecter.');setTimeout(()=>location.href='connexion.html',700);return}
      try{
        const [acts,docs]=await Promise.all([C.myCivilRequests(),C.myDocumentRequests()]);
        const status=document.querySelector('[data-citizen-status]');
        if(status){status.innerHTML=acts.length?acts.slice(0,3).map(r=>`<div style="padding:10px;border-bottom:1px solid #e5edf6"><span class="badge badge-blue">${r.status}</span><br><b>${r.kind.toUpperCase()}</b> · ${r.commune}, ${r.province}<br><small>${new Date(r.created_at).toLocaleString('fr-FR')}</small></div>`).join(''):'<p>Aucune demande d’acte envoyée.</p>'}
        const holder=document.querySelector('#citizen-documents tbody');
        if(holder){holder.innerHTML=docs.length?docs.map(r=>`<tr><td>${r.id}<br><small>${new Date(r.created_at).toLocaleString('fr-FR')}</small></td><td>${r.document_type}</td><td>${r.province}</td><td>${r.commune}</td><td><span class="badge badge-blue">${r.status}</span></td><td>${r.status==='issued'?'Disponible':'En traitement'}</td></tr>`).join(''):'<tr><td colspan="6">Aucune demande de document.</td></tr>'}
      }catch(err){console.error(err)}
    }
  })();
});
