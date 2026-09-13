(()=>{
  const C=window.EtatCivilCloud;
  if(!C)return;
  C.jurisdictionRequests=async function(){
    const [civil,docs]=await Promise.all([
      this.client.from('civil_requests').select('*').order('created_at',{ascending:false}),
      this.client.from('document_requests').select('*').order('created_at',{ascending:false})
    ]);
    if(civil.error)throw civil.error;if(docs.error)throw docs.error;
    return [
      ...(civil.data||[]).map(x=>({...x,request_type:'civil',request_label:x.kind||'acte'})),
      ...(docs.data||[]).map(x=>({...x,request_type:'document',request_label:x.document_type||'document'}))
    ].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
  };
  C.respondToRequest=async function(type,id,status,response){
    const text=String(response||'').trim();if(!text)throw new Error('Saisissez une réponse pour le citoyen.');
    const {data,error}=await this.client.rpc('respond_to_request',{p_request_type:type,p_request_id:id,p_status:status,p_response:text});
    if(error)throw error;return data;
  };
  C.provinceWorkflowDetails=async function(name){
    const province=String(name||'').trim();
    const [civil,docs,profiles]=await Promise.all([
      this.client.from('civil_requests').select('*').eq('province',province).order('created_at',{ascending:false}),
      this.client.from('document_requests').select('*').eq('province',province).order('created_at',{ascending:false}),
      this.client.from('profiles').select('id,full_name,role,province,commune,created_at').eq('province',province).order('created_at',{ascending:false})
    ]);
    if(civil.error)throw civil.error;if(docs.error)throw docs.error;
    const ps=profiles.error?[]:(profiles.data||[]);
    const requests=[
      ...(civil.data||[]).map(x=>({...x,request_type:'civil',request_label:x.kind||'acte'})),
      ...(docs.data||[]).map(x=>({...x,request_type:'document',request_label:x.document_type||'document'}))
    ].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
    return {province,requests,profiles:ps,profilesRestricted:!!profiles.error,summary:{total:requests.length,civil:(civil.data||[]).length,documents:(docs.data||[]).length,pending:requests.filter(x=>['submitted','ai_reviewed','routed','under_review'].includes(x.status)).length,answered:requests.filter(x=>!!x.staff_response).length,agents:ps.filter(x=>x.role==='agent').length}};
  };
})();
