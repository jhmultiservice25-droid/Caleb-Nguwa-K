document.addEventListener('DOMContentLoaded',async()=>{
  const C=window.EtatCivilCloud;if(!C)return;
  let me;try{me=await C.profile()}catch{return}
  if(!me||me.role!=='national_admin')return;
  const main=document.querySelector('.main');if(!main||document.getElementById('kasavubu-pilot'))return;
  const section=document.createElement('section');section.id='kasavubu-pilot';section.className='section card';
  section.innerHTML=`<div class="head"><div><h2>Commune pilote — Kasa-Vubu</h2><p>Registre d’état civil de Kinshasa / Kasa-Vubu synchronisé avec le niveau national.</p></div><a class="btn btn-outline" href="commune-kasavubu.html">Ouvrir l’espace pilote</a></div><div class="grid" style="margin-top:14px"><article class="card"><h3>Total actes</h3><strong id="nat-ksv-total">—</strong></article><article class="card"><h3>Naissances</h3><strong id="nat-ksv-birth">—</strong></article><article class="card"><h3>Décès</h3><strong id="nat-ksv-death">—</strong></article><article class="card"><h3>Mariages / divorces</h3><strong id="nat-ksv-unions">—</strong></article></div><div class="table-scroll" style="margin-top:14px"><table><thead><tr><th>N° acte</th><th>Type</th><th>Date événement</th><th>Personne(s)</th><th>Enregistré le</th></tr></thead><tbody id="nat-ksv-records"><tr><td colspan="5">Chargement…</td></tr></tbody></table></div>`;
  main.appendChild(section);
  try{
    const {data,error}=await C.client.from('civil_records').select('*').eq('province','Kinshasa').eq('commune','Kasa-Vubu').order('created_at',{ascending:false}).limit(100);
    if(error)throw error;const rows=data||[];
    document.getElementById('nat-ksv-total').textContent=rows.length;
    document.getElementById('nat-ksv-birth').textContent=rows.filter(r=>r.event_type==='birth').length;
    document.getElementById('nat-ksv-death').textContent=rows.filter(r=>r.event_type==='death').length;
    document.getElementById('nat-ksv-unions').textContent=rows.filter(r=>['marriage','divorce'].includes(r.event_type)).length;
    const labels={birth:'Naissance',death:'Décès',marriage:'Mariage',divorce:'Divorce'};
    const body=document.getElementById('nat-ksv-records');body.textContent='';
    if(!rows.length){const tr=document.createElement('tr');const td=document.createElement('td');td.colSpan=5;td.textContent='Aucun acte enregistré pour Kasa-Vubu.';tr.appendChild(td);body.appendChild(tr);return}
    rows.slice(0,20).forEach(r=>{const tr=document.createElement('tr');[r.act_number,labels[r.event_type]||r.event_type,new Date(r.event_date+'T00:00:00').toLocaleDateString('fr-FR'),r.subject_label,new Date(r.created_at).toLocaleString('fr-FR')].forEach(v=>{const td=document.createElement('td');td.textContent=String(v??'');tr.appendChild(td)});body.appendChild(tr)});
  }catch(e){document.getElementById('nat-ksv-records').innerHTML='<tr><td colspan="5">Chargement du registre pilote impossible.</td></tr>'}
});