document.addEventListener('DOMContentLoaded',async()=>{
  const C=window.EtatCivilCloud;
  if(!C){location.replace('connexion.html');return}
  const province='Kinshasa', commune='Kasa-Vubu';
  const labels={birth:'Naissance',death:'Décès',marriage:'Mariage',divorce:'Divorce'};
  const form=document.getElementById('civil-record-form');
  const tbody=document.getElementById('civil-records');
  const eventType=document.getElementById('event-type');
  let profile=null;

  function showToast(msg){if(typeof window.toast==='function')window.toast(msg);else alert(msg)}
  function esc(v){return String(v??'')}
  function toggleFields(){document.querySelectorAll('.type-fields').forEach(x=>x.classList.toggle('active',x.dataset.fields===eventType.value))}
  eventType.addEventListener('change',toggleFields);toggleFields();

  async function requireKasaVubuOfficer(){
    profile=await C.profile();
    const allowed=profile && ['agent','communal_admin','national_admin'].includes(profile.role) && (profile.role==='national_admin' || (profile.province===province && profile.commune===commune));
    if(!allowed){location.replace(profile?.role==='national_admin'?'admin.html':'connexion.html');return false}
    document.body.classList.add('authorized-workspace');
    document.querySelector('[data-officer-name]').textContent=profile.full_name||'Agent communal';
    document.querySelector('[data-officer-role]').textContent=profile.role==='national_admin'?'Super Admin national':profile.role==='communal_admin'?'Admin communal':'Agent d’état civil';
    return true;
  }

  async function loadRecords(){
    const {data,error}=await C.client.from('civil_records').select('*').eq('province',province).eq('commune',commune).order('created_at',{ascending:false});
    if(error)throw error;
    const rows=data||[];
    document.getElementById('kpi-total').textContent=rows.length;
    ['birth','death','marriage','divorce'].forEach(k=>document.getElementById('kpi-'+k).textContent=rows.filter(r=>r.event_type===k).length);
    tbody.textContent='';
    if(!rows.length){const tr=document.createElement('tr');const td=document.createElement('td');td.colSpan=6;td.textContent='Aucun acte enregistré pour Kasa-Vubu.';tr.appendChild(td);tbody.appendChild(tr);return}
    rows.forEach(r=>{const tr=document.createElement('tr');[r.act_number,new Date(r.event_date+'T00:00:00').toLocaleDateString('fr-FR'),labels[r.event_type]||r.event_type,r.subject_label,r.status==='registered'?'Enregistré':'Annulé',new Date(r.created_at).toLocaleString('fr-FR')].forEach((v,i)=>{const td=document.createElement('td');if(i===4){const s=document.createElement('span');s.className='status-pill';s.textContent=esc(v);td.appendChild(s)}else td.textContent=esc(v);tr.appendChild(td)});tbody.appendChild(tr)})
  }

  function payloadFrom(fd,type){
    const entries=Object.fromEntries(fd.entries());
    const payload={notes:entries.notes||null};
    Object.entries(entries).forEach(([k,v])=>{if(k.startsWith(type+'_') && String(v).trim())payload[k.slice(type.length+1)]=v});
    return payload;
  }

  form.addEventListener('submit',async e=>{
    e.preventDefault();if(!form.reportValidity())return;
    const fd=new FormData(form);const type=fd.get('event_type');
    const submit=form.querySelector('button[type="submit"]');
    try{
      submit.disabled=true;submit.textContent='Enregistrement…';
      const row={event_type:type,event_date:fd.get('event_date'),subject_label:String(fd.get('subject_label')||'').trim(),province,commune,payload:payloadFrom(fd,type),status:'registered'};
      const {data,error}=await C.client.from('civil_records').insert(row).select().single();
      if(error)throw error;
      showToast(`Acte enregistré : ${data.act_number}`);form.reset();eventType.value='birth';toggleFields();await loadRecords();
    }catch(err){showToast(err.message||'Enregistrement impossible.')}
    finally{submit.disabled=false;submit.textContent='Enregistrer l’acte'}
  });

  document.getElementById('refresh-records').onclick=()=>loadRecords().catch(e=>showToast(e.message||'Chargement impossible.'));
  document.querySelectorAll('[data-logout]').forEach(btn=>btn.addEventListener('click',async()=>{await C.logout();location.replace('connexion.html')}));

  try{if(await requireKasaVubuOfficer())await loadRecords()}catch(e){console.error(e);location.replace('connexion.html')}
});