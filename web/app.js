(()=>{const l=document.createElement('link');l.rel='stylesheet';l.href='institutional.css';document.head.appendChild(l)})();
function toast(msg){const t=document.querySelector('.toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2800)}
function draftKey(){const page=location.pathname.split('/').pop()||'index.html';return `etat-civil-draft:${page}`}
function init(){
  document.querySelectorAll('[data-toast]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();toast(el.dataset.toast)}));
  document.querySelectorAll('[data-save-form]').forEach(btn=>btn.addEventListener('click',()=>{const form=document.querySelector('form');if(!form)return;const data={};new FormData(form).forEach((v,k)=>data[k]=v);localStorage.setItem(draftKey(),JSON.stringify(data));toast('Brouillon enregistré localement — mode démonstration.')}));
  document.querySelectorAll('[data-submit-demo]').forEach(btn=>btn.addEventListener('click',()=>{const form=document.querySelector('form');if(form&&!form.reportValidity())return;toast('Dossier soumis pour contrôle — mode démonstration.');btn.textContent='✓ Soumis pour contrôle';btn.disabled=true}));
  document.querySelectorAll('[data-search-act]').forEach(btn=>btn.addEventListener('click',()=>{const v=document.querySelector('#act-number')?.value.trim()||'';if(!v){toast('Entrez un numéro d’acte.');return}const result=document.querySelector('#verification-result');if(result)result.hidden=false;toast(`Vérification de ${v} effectuée en mode démonstration.`)}));
  document.querySelectorAll('[data-camera]').forEach(btn=>btn.addEventListener('click',async()=>{try{if(!navigator.mediaDevices?.getUserMedia){toast('Caméra non disponible sur ce navigateur.');return}const stream=await navigator.mediaDevices.getUserMedia({video:true});stream.getTracks().forEach(t=>t.stop());toast('Caméra autorisée. Le lecteur QR sera connecté à OpenCRVS en production.')}catch{toast('Accès caméra refusé ou indisponible.')}}));
  const form=document.querySelector('form');const stored=localStorage.getItem(draftKey());if(stored&&form){try{const d=JSON.parse(stored);Object.entries(d).forEach(([k,v])=>{const f=document.querySelector(`[name="${CSS.escape(k)}"]`);if(f)f.value=v})}catch{}}
  const login=document.querySelector('#login-form');if(login)login.addEventListener('submit',e=>{e.preventDefault();const role=document.querySelector('#login-role')?.value;sessionStorage.setItem('etat-civil-demo-role',role||'agent');location.href=role==='admin'?'admin.html':'agent.html'});
  document.querySelectorAll('[data-confirm]').forEach(el=>el.addEventListener('click',e=>{if(!confirm(el.dataset.confirm))e.preventDefault()}));
}
document.addEventListener('DOMContentLoaded',init)
