document.addEventListener('DOMContentLoaded',()=>{
  const C=window.EtatCivilCloud;
  if(!C)return;

  const routeByProfile=(profile)=>{
    if(profile?.role==='national_admin') location.href='admin.html';
    else if((profile?.role==='agent'||profile?.role==='communal_admin') && profile?.province==='Kinshasa' && profile?.commune==='Kasa-Vubu') location.href='commune-kasavubu.html';
    else if(profile?.role==='provincial_admin') location.href='province.html?province='+encodeURIComponent(profile.province||'Kinshasa');
    else if(profile?.role==='communal_admin') location.href='admin.html';
    else if(profile?.role==='agent') location.href='agent.html';
    else location.href='citoyen.html';
  };

  const emailInput=document.querySelector('#otp-email');
  const codeInput=document.querySelector('#otp-code');
  const form=document.querySelector('#otp-confirmation-form');
  const resend=document.querySelector('#otp-resend-btn');
  const loginEmail=document.querySelector('#login-form input[name="username"]');
  const signupEmail=document.querySelector('#signup-form input[name="email"]');

  function normalizedEmail(){
    return String(emailInput?.value||loginEmail?.value||signupEmail?.value||'').trim().toLowerCase();
  }
  function syncEmail(){
    const v=String(loginEmail?.value||signupEmail?.value||'').trim().toLowerCase();
    if(v&&emailInput&&!emailInput.value)emailInput.value=v;
  }
  loginEmail?.addEventListener('input',syncEmail);
  signupEmail?.addEventListener('input',()=>{if(emailInput)emailInput.value=String(signupEmail.value||'').trim().toLowerCase()});
  syncEmail();

  resend?.addEventListener('click',async()=>{
    const email=normalizedEmail();
    if(!email){toast('Saisissez votre adresse e-mail.');return;}
    try{
      resend.disabled=true;resend.textContent='Envoi…';
      const {error}=await C.client.auth.resend({type:'signup',email});
      if(error)throw error;
      if(emailInput)emailInput.value=email;
      toast('Un nouveau code de confirmation a été demandé. Vérifiez votre e-mail.');
    }catch(e){
      const msg=String(e?.message||'Envoi impossible.');
      if(/rate limit/i.test(msg))toast('Veuillez patienter avant de demander un nouveau code.');
      else toast(msg);
    }finally{
      resend.disabled=false;resend.textContent='Renvoyer le code';
    }
  });

  form?.addEventListener('submit',async e=>{
    e.preventDefault();
    const email=normalizedEmail();
    const token=String(codeInput?.value||'').replace(/\s/g,'');
    if(!email){toast('Saisissez votre adresse e-mail.');return;}
    if(!/^\d{6}$/.test(token)){toast('Le code doit contenir 6 chiffres.');return;}
    const submit=form.querySelector('button[type="submit"]');
    try{
      submit.disabled=true;submit.textContent='Vérification…';
      const {data,error}=await C.client.auth.verifyOtp({email,token,type:'email'});
      if(error)throw error;
      if(!data?.session)throw new Error('Confirmation reçue, mais aucune session n’a été créée.');
      try{await C.claimOwnInvitation()}catch(err){console.warn('Invitation claim skipped',err)}
      const profile=await C.profile();
      if(!profile)throw new Error('Profil introuvable après confirmation.');
      toast('Adresse e-mail confirmée. Accès activé.');
      setTimeout(()=>routeByProfile(profile),450);
    }catch(e){
      const msg=String(e?.message||'Code invalide ou expiré.');
      if(/expired|invalid|token/i.test(msg))toast('Code invalide ou expiré. Demandez un nouveau code.');
      else toast(msg);
    }finally{
      submit.disabled=false;submit.textContent='Confirmer mon adresse';
    }
  });
});
