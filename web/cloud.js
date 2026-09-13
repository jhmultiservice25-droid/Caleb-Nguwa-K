const SUPABASE_URL='https://gfrvkklrilfejnbolwbd.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_fTjwRQgNP_ZnYbt1hUjmvQ_NpAJnFB9';
const ecCloud=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});

window.EtatCivilCloud={
  client:ecCloud,
  async signup(data){
    const {data:result,error}=await ecCloud.auth.signUp({
      email:data.email,
      password:data.password,
      options:{data:{full_name:data.fullname,phone:data.phone,province:data.province||null,commune:data.commune||null}}
    });
    if(error) throw error;
    return result;
  },
  async login(email,password){
    const {data,error}=await ecCloud.auth.signInWithPassword({email,password});
    if(error) throw error;
    return data;
  },
  async logout(){await ecCloud.auth.signOut()},
  async session(){const {data}=await ecCloud.auth.getSession();return data.session},
  async profile(){
    const {data:{user},error:uerr}=await ecCloud.auth.getUser();
    if(uerr||!user) return null;
    const {data,error}=await ecCloud.from('profiles').select('*').eq('id',user.id).single();
    if(error) throw error; return data;
  },
  async submitCivilRequest(formData){
    const {data:{user},error:uerr}=await ecCloud.auth.getUser();
    if(uerr||!user) throw new Error('Connexion citoyenne requise.');
    const payload=Object.fromEntries(formData.entries());
    const required=['province','commune','citizenLastName','citizenFirstName','birthDate','childLastName','childFirstName','childBirthDate'];
    const missing=required.filter(k=>!String(payload[k]||'').trim());
    const score=missing.length?Math.max(45,96-missing.length*8):96;
    const {data,error}=await ecCloud.from('civil_requests').insert({
      citizen_id:user.id,
      kind:'birth',province:payload.province,commune:payload.commune,payload,
      ai_score:score,
      ai_notes:missing.length?[{type:'missing_fields',fields:missing}]:[{type:'completeness',result:'ok'}],
      status:missing.length?'submitted':'ai_reviewed'
    }).select().single();
    if(error) throw error; return data;
  },
  async myCivilRequests(){
    const {data,error}=await ecCloud.from('civil_requests').select('*').order('created_at',{ascending:false});
    if(error) throw error; return data||[];
  },
  async submitDocumentRequest(formData){
    const {data:{user},error:uerr}=await ecCloud.auth.getUser();
    if(uerr||!user) throw new Error('Connexion citoyenne requise.');
    const p=Object.fromEntries(formData.entries());
    const {data,error}=await ecCloud.from('document_requests').insert({
      citizen_id:user.id,document_type:p.documentType,act_number:p.actNumber||null,act_date:p.actDate||null,
      reason:p.reason,delivery_mode:p.delivery==='Numérique'?'digital':'pickup',province:p.province,commune:p.commune,status:'submitted'
    }).select().single();
    if(error) throw error; return data;
  },
  async myDocumentRequests(){
    const {data,error}=await ecCloud.from('document_requests').select('*').order('created_at',{ascending:false});
    if(error) throw error; return data||[];
  },
  async verifyDocument(token){
    const {data,error}=await ecCloud.rpc('verify_document',{p_token:token});
    if(error) throw error; return data||[];
  },
  async listManagedProfiles(){
    const me=await this.profile(); if(!me) throw new Error('Connexion requise.');
    let q=ecCloud.from('profiles').select('id,full_name,phone,role,province,commune,created_at').order('created_at',{ascending:false});
    if(me.role==='provincial_admin') q=q.eq('province',me.province);
    if(me.role==='communal_admin') q=q.eq('province',me.province).eq('commune',me.commune);
    const {data,error}=await q; if(error) throw error; return data||[];
  },
  async listInvitations(){
    const {data,error}=await ecCloud.from('admin_invitations').select('*').order('created_at',{ascending:false});
    if(error) throw error; return data||[];
  },
  async createInvitation(payload){
    const {data:{user},error:uerr}=await ecCloud.auth.getUser();
    if(uerr||!user) throw new Error('Connexion administrateur requise.');
    const row={
      email:String(payload.email||'').trim().toLowerCase(),
      full_name:String(payload.full_name||'').trim(),
      role:payload.role,
      province:payload.province||null,
      commune:payload.commune||null,
      created_by:user.id,
      status:'pending'
    };
    const {data,error}=await ecCloud.from('admin_invitations').insert(row).select().single();
    if(error) throw error; return data;
  },
  async revokeInvitation(id){
    const {data,error}=await ecCloud.from('admin_invitations').update({status:'revoked'}).eq('id',id).select().single();
    if(error) throw error; return data;
  }
};
