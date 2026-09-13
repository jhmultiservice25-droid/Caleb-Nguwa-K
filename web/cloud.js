const SUPABASE_URL='https://gfrvkklrilfejnbolwbd.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_fTjwRQgNP_ZnYbt1hUjmvQ_NpAJnFB9';
const ecCloud=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});

window.EtatCivilCloud={
  client:ecCloud,
  async signup(data){
    const {data:result,error}=await ecCloud.auth.signUp({
      email:data.email,password:data.password,
      options:{data:{full_name:data.fullname,phone:data.phone,province:data.province||null,commune:data.commune||null}}
    });
    if(error) throw error; return result;
  },
  async login(email,password){const {data,error}=await ecCloud.auth.signInWithPassword({email,password});if(error) throw error;return data},
  async resendSignupEmail(email){const {data,error}=await ecCloud.auth.resend({type:'signup',email:String(email||'').trim().toLowerCase()});if(error)throw error;return data},
  async logout(){await ecCloud.auth.signOut()},
  async session(){const {data}=await ecCloud.auth.getSession();return data.session},
  async profile(){
    const {data:{user},error:uerr}=await ecCloud.auth.getUser();if(uerr||!user)return null;
    const {data,error}=await ecCloud.from('profiles').select('*').eq('id',user.id).single();if(error)throw error;return data;
  },
  async requireAdmin(){const p=await this.profile();if(!p||!['national_admin','provincial_admin','communal_admin'].includes(p.role))throw new Error('Accès administrateur requis.');return p},
  async submitCivilRequest(formData){
    const {data:{user},error:uerr}=await ecCloud.auth.getUser();if(uerr||!user)throw new Error('Connexion citoyenne requise.');
    const payload=Object.fromEntries(formData.entries());
    const required=['province','commune','citizenLastName','citizenFirstName','birthDate','childLastName','childFirstName','childBirthDate'];
    const missing=required.filter(k=>!String(payload[k]||'').trim());const score=missing.length?Math.max(45,96-missing.length*8):96;
    const {data,error}=await ecCloud.from('civil_requests').insert({citizen_id:user.id,kind:'birth',province:payload.province,commune:payload.commune,payload,ai_score:score,ai_notes:missing.length?[{type:'missing_fields',fields:missing}]:[{type:'completeness',result:'ok'}],status:missing.length?'submitted':'ai_reviewed'}).select().single();
    if(error)throw error;return data;
  },
  async myCivilRequests(){const {data,error}=await ecCloud.from('civil_requests').select('*').order('created_at',{ascending:false});if(error)throw error;return data||[]},
  async submitDocumentRequest(formData){
    const {data:{user},error:uerr}=await ecCloud.auth.getUser();if(uerr||!user)throw new Error('Connexion citoyenne requise.');
    const p=Object.fromEntries(formData.entries());
    const {data,error}=await ecCloud.from('document_requests').insert({citizen_id:user.id,document_type:p.documentType,act_number:p.actNumber||null,act_date:p.actDate||null,reason:p.reason,delivery_mode:p.delivery==='Numérique'?'digital':'pickup',province:p.province,commune:p.commune,status:'submitted'}).select().single();
    if(error)throw error;return data;
  },
  async myDocumentRequests(){const {data,error}=await ecCloud.from('document_requests').select('*').order('created_at',{ascending:false});if(error)throw error;return data||[]},
  async verifyDocument(token){const {data,error}=await ecCloud.rpc('verify_document',{p_token:token});if(error)throw error;return data||[]},
  async listManagedProfiles(){
    const me=await this.profile();if(!me)throw new Error('Connexion requise.');
    let q=ecCloud.from('profiles').select('id,full_name,phone,role,province,commune,created_at').order('created_at',{ascending:false});
    if(me.role==='provincial_admin')q=q.eq('province',me.province);
    if(me.role==='communal_admin')q=q.eq('province',me.province).eq('commune',me.commune);
    const {data,error}=await q;if(error)throw error;return data||[];
  },
  async listInvitations(){const {data,error}=await ecCloud.from('admin_invitations').select('*').order('created_at',{ascending:false});if(error)throw error;return data||[]},
  async createInvitation(payload){
    const {data:{user},error:uerr}=await ecCloud.auth.getUser();if(uerr||!user)throw new Error('Connexion administrateur requise.');
    const row={email:String(payload.email||'').trim().toLowerCase(),full_name:String(payload.full_name||'').trim(),role:payload.role,province:payload.province||null,commune:payload.commune||null,created_by:user.id,status:'pending'};
    const {data,error}=await ecCloud.from('admin_invitations').insert(row).select().single();if(error)throw error;return data;
  },
  async revokeInvitation(id){const {data,error}=await ecCloud.from('admin_invitations').update({status:'revoked'}).eq('id',id).select().single();if(error)throw error;return data},
  async listProvinces(){const {data,error}=await ecCloud.from('provinces').select('*').order('name');if(error)throw error;return data||[]},
  async createProvince(payload){
    const me=await this.profile();if(me?.role!=='national_admin')throw new Error('Seul le Super Admin national peut gérer les provinces.');
    const {data,error}=await ecCloud.from('provinces').insert({name:String(payload.name||'').trim(),code:String(payload.code||'').trim()||null,capital:String(payload.capital||'').trim()||null}).select().single();if(error)throw error;return data;
  },
  async searchCitizens(query){
    const q=String(query||'').trim().toLowerCase();if(q.length<2)return[];
    const {data,error}=await ecCloud.from('civil_requests').select('id,citizen_id,kind,status,province,commune,created_at,payload').order('created_at',{ascending:false}).limit(500);
    if(error)throw error;
    return (data||[]).filter(r=>{
      const p=r.payload||{};const name=`${p.citizenFirstName||''} ${p.citizenLastName||''}`.toLowerCase();const phone=String(p.phone||'').toLowerCase();
      return name.includes(q)||phone.includes(q)||String(r.id).toLowerCase()===q;
    }).slice(0,50);
  },
  async provinceDetails(name){
    const province=String(name||'').trim();
    const [{data:requests,error:rerr},{data:profiles,error:perr}]=await Promise.all([
      ecCloud.from('civil_requests').select('id,citizen_id,kind,status,province,commune,created_at,payload').eq('province',province).order('created_at',{ascending:false}).limit(200),
      ecCloud.from('profiles').select('id,full_name,role,province,commune,created_at').eq('province',province).order('created_at',{ascending:false})
    ]);
    if(rerr)throw rerr;if(perr)throw perr;
    const rs=requests||[],ps=profiles||[];
    return {province,requests:rs,profiles:ps,summary:{total:rs.length,births:rs.filter(x=>x.kind==='birth').length,marriages:rs.filter(x=>x.kind==='marriage').length,deaths:rs.filter(x=>x.kind==='death').length,agents:ps.filter(x=>x.role==='agent').length,admins:ps.filter(x=>['provincial_admin','communal_admin'].includes(x.role)).length}};
  }
};
