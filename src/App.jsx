import React, { useEffect, useMemo, useState } from 'react'
import {
  Activity, AlertTriangle, BarChart3, CalendarDays, CalendarPlus, CheckCircle2,
  ChevronRight, CircleOff, Clock3, Database, FileImage, LayoutDashboard, LoaderCircle,
  LockKeyhole, Menu, MessageSquareText, Pencil, Phone, Plus, RefreshCw, RotateCcw,
  Save, Search, Send, Settings, ShieldCheck, Stethoscope, Trash2, UserCheck, UserRoundCheck,
  UserX, Users, Wifi, X
} from 'lucide-react'

const MESES=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DIAS=['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo']
const COMP_INICIAL_NITEROI='2026-10'
const FIXED_HOLIDAYS=[
  ['01-01','Confraternização Universal'],['04-21','Tiradentes'],['05-01','Dia Mundial do Trabalho'],
  ['09-07','Independência do Brasil'],['10-12','Nossa Senhora Aparecida'],['11-02','Finados'],
  ['11-15','Proclamação da República'],['11-20','Dia Nacional de Zumbi e da Consciência Negra'],['12-25','Natal']
]
const EXTRA_HOLIDAYS={
  '2026-04-03':'Paixão de Cristo',
  '2027-03-26':'Paixão de Cristo'
}

function labelCompetencia(c){
  if(!/^\d{4}-\d{2}$/.test(String(c||''))) return c||'—'
  const [a,m]=c.split('-').map(Number);return `${MESES[m-1]}/${a}`
}
function addMonths(c,q){
  const [a,m]=c.split('-').map(Number);const d=new Date(a,m-1+q,1)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
}
function compareComp(a,b){return String(a).localeCompare(String(b))}
function hojeSP(){
  const p=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'})
    .formatToParts(new Date()).reduce((o,x)=>(o[x.type]=x.value,o),{})
  return {year:+p.year,month:+p.month,day:+p.day,comp:`${p.year}-${p.month}`}
}
function releaseFor(comp){
  const [a,m]=comp.split('-').map(Number);const d=new Date(a,m-1-2,15)
  return {year:d.getFullYear(),month:d.getMonth()+1,day:15,iso:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-15`}
}
function isReleased(comp){
  const h=hojeSP(),r=releaseFor(comp)
  return Number(`${h.year}${String(h.month).padStart(2,'0')}${String(h.day).padStart(2,'0')}`)>=Number(`${r.year}${String(r.month).padStart(2,'0')}15`)
}
function releaseLabel(comp){const r=releaseFor(comp);return `15/${String(r.month).padStart(2,'0')}/${r.year}`}
function holidaysFor(comp){
  const [year]=comp.split('-')
  const fixed=FIXED_HOLIDAYS.map(([md,nome])=>({data:`${year}-${md}`,nome,tipo:'Nacional'}))
  const extra=Object.entries(EXTRA_HOLIDAYS).filter(([d])=>d.startsWith(year+'-')).map(([data,nome])=>({data,nome,tipo:'Nacional'}))
  return [...fixed,...extra].filter(x=>x.data.startsWith(comp+'-')).sort((a,b)=>a.data.localeCompare(b.data))
}
function datesForSchedule(comp,dia){
  const weekday={Domingo:0,Segunda:1,Terça:2,Quarta:3,Quinta:4,Sexta:5,Sábado:6}[dia]
  const [a,m]=comp.split('-').map(Number);const fer=new Map(holidaysFor(comp).map(x=>[x.data,x.nome]))
  const origem=[],solicitar=[],removidos=[]
  for(let d=1;d<=31;d++){
    const dt=new Date(a,m-1,d);if(dt.getMonth()!==m-1) break
    if(dt.getDay()!==weekday) continue
    const iso=`${a}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    const br=`${String(d).padStart(2,'0')}/${String(m).padStart(2,'0')}`
    origem.push(br)
    if(fer.has(iso)) removidos.push(`${br} – ${fer.get(iso)}`)
    else solicitar.push(br)
  }
  return {origem,solicitar,removidos}
}
function normStatus(v=''){
  const s=String(v).trim().toLowerCase()
  if(s==='respondido') return 'respondido'
  if(s==='aguardando resposta'||s==='aguardando') return 'aguardando'
  return 'nao_enviado'
}
function Modal({children,onClose,wide=false}){
  return <div className="modal-backdrop" onMouseDown={onClose}><div className={`modal ${wide?'modal-wide':''}`} onMouseDown={e=>e.stopPropagation()}><button className="modal-x" onClick={onClose}><X size={18}/></button>{children}</div></div>
}
function Badge({status}){
  const label=status==='respondido'?'Respondido':status==='aguardando'?'Aguardando resposta':'Não enviado'
  return <span className={`badge ${status}`}>{label}</span>
}
function DoctorCell({d}){
  const inic=String(d.nome||'?').split(' ').slice(0,2).map(x=>x[0]).join('')
  return <div className="doctor-cell"><div className="avatar">{inic}</div><div><strong>{d.nome}</strong><span>CD {d.cd_medico}</span></div></div>
}
function SearchBox({query,setQuery}){
  return <div className="search-box"><Search size={16}/><input placeholder="Buscar médico, especialidade ou CD..." value={query} onChange={e=>setQuery(e.target.value)}/></div>
}

export default function App(){
  const [activePage,setActivePage]=useState('abertura')
  const [sidebarOpen,setSidebarOpen]=useState(true)
  const [medicos,setMedicos]=useState([])
  const [competenciasMeta,setCompetenciasMeta]=useState([])
  const [unidade,setUnidade]=useState('Niterói')
  const [competencia,setCompetencia]=useState(COMP_INICIAL_NITEROI)
  const [escalas,setEscalas]=useState([])
  const [solicitacoes,setSolicitacoes]=useState([])
  const [fixedEscalas,setFixedEscalas]=useState([])
  const [loading,setLoading]=useState(true)
  const [query,setQuery]=useState('')
  const [error,setError]=useState('')
  const [success,setSuccess]=useState('')
  const [selectedDoctor,setSelectedDoctor]=useState(null)
  const [responseDoctor,setResponseDoctor]=useState(null)
  const [doctorForm,setDoctorForm]=useState(null)
  const [fixedDoctor,setFixedDoctor]=useState(null)
  const [futureComp,setFutureComp]=useState(null)
  const [futureDoctor,setFutureDoctor]=useState(null)
  const [previewDoctor,setPreviewDoctor]=useState(null)
  const [previewImage,setPreviewImage]=useState('')
  const [previewLoading,setPreviewLoading]=useState(false)
  const [previewAction,setPreviewAction]=useState('')
  const [sending,setSending]=useState(false)
  const [lastSync,setLastSync]=useState(null)

  const unidades=useMemo(()=>{
    const xs=[...new Set(medicos.map(m=>String(m.unidade||'').trim()).filter(Boolean))]
    return xs.length?xs:['Niterói']
  },[medicos])

  const activeMedicos=useMemo(()=>medicos.filter(m=>String(m.ativo||'Sim').toLowerCase()==='sim'&&String(m.unidade||'').toLowerCase()===unidade.toLowerCase()),[medicos,unidade])
  const solMap=useMemo(()=>new Map(solicitacoes.map(s=>[String(s.cd_medico),s])),[solicitacoes])
  const escByCd=useMemo(()=>{
    const map=new Map()
    escalas.forEach(e=>{const k=String(e.cd_medico);if(!map.has(k))map.set(k,[]);map.get(k).push(e)})
    return map
  },[escalas])

  const operationalDoctors=useMemo(()=>activeMedicos.filter(m=>escByCd.has(String(m.cd_medico))).map(m=>{
    const s=solMap.get(String(m.cd_medico))||{}
    return {...m,status:normStatus(s.status),sol:s,escalas:escByCd.get(String(m.cd_medico))||[]}
  }),[activeMedicos,escByCd,solMap])

  const filteredOperational=useMemo(()=>filterDocs(operationalDoctors,query),[operationalDoctors,query])
  const filteredAll=useMemo(()=>filterDocs(medicos.filter(m=>String(m.unidade||'').toLowerCase()===unidade.toLowerCase()),query),[medicos,unidade,query])
  const counters=useMemo(()=>({
    total:operationalDoctors.length,
    enviados:operationalDoctors.filter(d=>d.status!=='nao_enviado').length,
    aguardando:operationalDoctors.filter(d=>d.status==='aguardando').length,
    respondidos:operationalDoctors.filter(d=>d.status==='respondido').length
  }),[operationalDoctors])
  const responseRate=counters.enviados?Math.round(counters.respondidos/counters.enviados*100):0
  const competencias=useMemo(()=>competenciasMeta.map(x=>x.competencia).sort(compareComp),[competenciasMeta])

  async function loadBase(){
    setError('')
    const r=await fetch('/api/agenda-medicos')
    if(!r.ok) throw new Error('Não foi possível carregar os médicos.')
    const j=await r.json();setMedicos(j.medicos||[])
  }
  async function loadCompetencias(unit=unidade){
    const r=await fetch(`/api/agenda-competencias?unidade=${encodeURIComponent(unit)}`)
    if(!r.ok) throw new Error('Não foi possível carregar as competências.')
    const j=await r.json();const list=(j.competencias||[]).sort((a,b)=>compareComp(a.competencia,b.competencia))
    setCompetenciasMeta(list)
    const atual=competencia
    if(list.length && !list.some(x=>x.competencia===atual)) setCompetencia(list[list.length-1].competencia)
    if(!list.length && unit==='Niterói') setCompetencia(COMP_INICIAL_NITEROI)
  }
  async function loadOperational(comp=competencia,unit=unidade){
    setLoading(true);setError('')
    try{
      const [er,sr]=await Promise.all([
        fetch(`/api/agenda-escalas?unidade=${encodeURIComponent(unit)}&competencia=${encodeURIComponent(comp)}`),
        fetch(`/api/agenda-solicitacoes?unidade=${encodeURIComponent(unit)}&competencia=${encodeURIComponent(comp)}`)
      ])
      if(!er.ok||!sr.ok) throw new Error('Não foi possível carregar escalas/solicitações.')
      const [ej,sj]=await Promise.all([er.json(),sr.json()])
      setEscalas(ej.escalas||[]);setSolicitacoes(sj.solicitacoes||[]);setLastSync(new Date())
    }catch(e){setError(e.message)}finally{setLoading(false)}
  }
  async function loadFixed(unit=unidade){
    const r=await fetch(`/api/agenda-escalas?unidade=${encodeURIComponent(unit)}&competencia=FIXA`)
    if(!r.ok) throw new Error('Não foi possível carregar as escalas fixas.')
    const j=await r.json();setFixedEscalas(j.escalas||[])
  }
  async function refreshAll(){
    setLoading(true)
    try{await loadBase();await loadCompetencias(unidade);await Promise.all([loadOperational(competencia,unidade),loadFixed(unidade)])}
    catch(e){setError(e.message)}finally{setLoading(false)}
  }

  useEffect(()=>{loadBase().catch(e=>setError(e.message))},[])
  useEffect(()=>{if(!unidades.includes(unidade)&&unidades.length)setUnidade(unidades[0])},[unidades])
  useEffect(()=>{loadCompetencias(unidade).catch(e=>setError(e.message));loadFixed(unidade).catch(e=>setError(e.message))},[unidade])
  useEffect(()=>{loadOperational(competencia,unidade)},[competencia,unidade])

  const pageMeta={
    dashboard:['Dashboard','Visão geral do ciclo de abertura de agendas'],
    abertura:['Abertura de Agenda Médica','Controle de solicitações, respostas e evidências'],
    respondidos:['Respondidos','Conferência das respostas recebidas e evidências'],
    medicos:['Médicos','Cadastro, situação e escala fixa sem abrir a planilha'],
    futuras:['Futuras Agendas','Prepare as competências futuras respeitando a trava operacional'],
    configuracoes:['Configurações','Parâmetros e integrações do painel']
  }

  async function sendDoctor(doc){
    if(sending)return
    setSending(true);setError('');setSuccess('')
    try{
      const r=await fetch('/api/agenda-enviar-teste',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cd_medico:doc.cd_medico,competencia})})
      const j=await r.json().catch(()=>({}))
      if(!r.ok||j.ok===false)throw new Error(j.mensagem||j.error||'Falha no envio.')
      setSelectedDoctor(null);setSuccess(`Solicitação enviada para ${doc.nome}.`);await loadOperational()
    }catch(e){setError(e.message)}finally{setSending(false)}
  }

  async function saveDoctor(form){
    setError('');setSuccess('')
    const r=await fetch('/api/agenda-medico-salvar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,unidade})})
    const j=await r.json().catch(()=>({}))
    if(!r.ok||j.ok===false){setError(j.mensagem||j.error||'Falha ao salvar.');return}
    setDoctorForm(null);setSuccess('Médico salvo na planilha.');await loadBase()
  }
  async function toggleDoctor(doc){
    const novo=String(doc.ativo||'Sim').toLowerCase()==='sim'?'Não':'Sim'
    const verbo=novo==='Sim'?'ativar':'desativar'
    if(!confirm(`Deseja ${verbo} ${doc.nome}?`))return
    const r=await fetch('/api/agenda-medico-status',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cd_medico:doc.cd_medico,ativo:novo})})
    const j=await r.json().catch(()=>({}))
    if(!r.ok||j.ok===false){setError(j.mensagem||j.error||'Falha ao alterar status.');return}
    setSuccess(`Médico ${novo==='Sim'?'ativado':'desativado'}.`);await loadBase()
  }
  async function saveFixed(payload){
    const r=await fetch('/api/agenda-escala-fixa-salvar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
    const j=await r.json().catch(()=>({}))
    if(!r.ok||j.ok===false){setError(j.mensagem||j.error||'Falha ao salvar escala fixa.');return false}
    setSuccess('Escala fixa salva na planilha.');await loadFixed();return true
  }
  async function removeFixed(row){
    if(!confirm('Remover esta escala fixa? O histórico fica preservado na planilha.'))return
    const id=row.datas_origem
    const r=await fetch('/api/agenda-escala-fixa-remover',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id_escala:id})})
    const j=await r.json().catch(()=>({}))
    if(!r.ok||j.ok===false){setError(j.mensagem||j.error||'Falha ao remover escala.');return}
    setSuccess('Escala fixa removida.');await loadFixed()
  }
  async function confirmFuture(doc,comp,selectedRows){
    const rows=selectedRows.map(r=>{
      const calc=datesForSchedule(comp,r.dia_semana)
      return {dia_semana:r.dia_semana,especialidade:r.especialidade||doc.especialidade,inicio:r.inicio,fim:r.fim,almoco:r.almoco||'Sem almoço',datas_origem:calc.origem.join(', '),datas_solicitar:calc.solicitar.join(', '),feriados_removidos:calc.removidos.join(', '),observacao:r.observacao||''}
    })
    const r=await fetch('/api/agenda-escala-confirmar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cd_medico:doc.cd_medico,nome:doc.nome,unidade,competencia:comp,escalas:rows})})
    const j=await r.json().catch(()=>({}))
    if(!r.ok||j.ok===false){setError(j.mensagem||j.error||'Falha ao confirmar escala.');return}
    setFutureDoctor(null);setSuccess(`Escala de ${doc.nome} confirmada para ${labelCompetencia(comp)}.`)
    await loadCompetencias(unidade)
    if(comp===competencia)await loadOperational(comp,unidade)
  }

  async function openPreview(doc){
    setPreviewDoctor(doc);setPreviewLoading(true);setPreviewAction('Abrindo conversa...');setError('')
    try{
      const r=await fetch('/api/agenda-preview-iniciar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cd_medico:doc.cd_medico})})
      const j=await r.json().catch(()=>({}))
      if(!r.ok||!j.ok||!j.preview_url)throw new Error(j.mensagem||j.error||'Não foi possível abrir a conversa.')
      setPreviewImage(`${j.preview_url}${j.preview_url.includes('?')?'&':'?'}t=${Date.now()}`)
    }catch(e){setPreviewDoctor(null);setError(e.message)}finally{setPreviewLoading(false);setPreviewAction('')}
  }
  async function scrollPreview(direcao){
    if(!previewDoctor||previewLoading)return
    setPreviewLoading(true);setPreviewAction(direcao==='cima'?'Subindo...':'Descendo...')
    try{
      const r=await fetch('/api/agenda-preview-rolar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cd_medico:previewDoctor.cd_medico,direcao,intensidade:'longo'})})
      const j=await r.json().catch(()=>({}))
      if(!r.ok||!j.ok||!j.preview_url)throw new Error(j.mensagem||j.error||'Falha ao rolar conversa.')
      setPreviewImage(`${j.preview_url}${j.preview_url.includes('?')?'&':'?'}t=${Date.now()}`)
    }catch(e){setError(e.message)}finally{setPreviewLoading(false);setPreviewAction('')}
  }
  async function capturePreview(){
    if(!previewDoctor)return
    const r=await fetch('/api/agenda-preview-capturar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cd_medico:previewDoctor.cd_medico})})
    if(!r.ok){setError('Não foi possível capturar o trecho.');return}
    downloadBlob(await r.blob(),`evidencia-trecho-${previewDoctor.cd_medico}.png`)
  }
  function closePreview(){
    const d=previewDoctor;setPreviewDoctor(null);setPreviewImage('')
    if(d)fetch('/api/agenda-preview-fechar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cd_medico:d.cd_medico})}).catch(()=>{})
  }

  function Filters(){
    return <div className="filters-card">
      <div className="field"><label>Unidade</label><select value={unidade} onChange={e=>setUnidade(e.target.value)}>{unidades.map(u=><option key={u}>{u}</option>)}</select></div>
      <div className="field"><label>Competência</label><select value={competencia} onChange={e=>setCompetencia(e.target.value)}>
        {competencias.length?competencias.map(c=><option key={c} value={c}>{labelCompetencia(c)}</option>):<option value={competencia}>{labelCompetencia(competencia)}</option>}
      </select><span className="field-help">Só aparecem meses com ao menos uma escala confirmada.</span></div>
      <div className="field"><label>Ano</label><input value={competencia.split('-')[0]||''} readOnly/></div>
    </div>
  }
  function Metrics(){
    return <div className="metrics">
      <Metric icon={<Users/>} label="Médicos nesta competência" value={counters.total}/>
      <Metric icon={<Send/>} label="Enviados" value={counters.enviados}/>
      <Metric icon={<Clock3/>} label="Aguardando" value={counters.aguardando}/>
      <Metric icon={<CheckCircle2/>} label="Respondidos" value={counters.respondidos}/>
    </div>
  }
  function renderDashboard(){
    return <><Filters/><Metrics/><div className="dashboard-grid">
      <section className="card"><div className="card-head"><div><span className="eyebrow">Indicador</span><h2>Taxa de resposta</h2></div><BarChart3/></div><div className="big-rate">{responseRate}%</div><div className="progress"><i style={{width:`${responseRate}%`}}/></div><p>{counters.respondidos} de {counters.enviados} solicitações enviadas já foram respondidas.</p></section>
      <section className="card"><div className="card-head"><div><span className="eyebrow">Competência</span><h2>{labelCompetencia(competencia)}</h2></div><Activity/></div><p>Todos os números acima respeitam a unidade e a competência selecionadas.</p><div className="mini-list"><span><strong>{unidade}</strong> Unidade</span><span><strong>{counters.total}</strong> médicos com escala confirmada</span></div></section>
    </div></>
  }
  function renderAbertura(){
    const fer=holidaysFor(competencia)
    return <><Filters/>{fer.length>0&&<div className="notice"><CalendarDays/><div><strong>Feriados de {labelCompetencia(competencia)}</strong><span>{fer.map(x=>`${x.data.slice(8,10)}/${x.data.slice(5,7)} — ${x.nome}`).join(' · ')}</span></div></div>}<Metrics/>
      <section className="table-card"><div className="table-head"><div><h2>Médicos — {unidade}</h2><p>{labelCompetencia(competencia)} · somente médicos com escala confirmada</p></div><SearchBox query={query} setQuery={setQuery}/></div>
        <div className="table-wrap"><table><thead><tr><th>Médico</th><th>Especialidade</th><th>Escala</th><th>Status</th><th>Último envio</th><th>Ação</th></tr></thead><tbody>
          {loading&&<LoadingRow cols={6}/>}
          {!loading&&filteredOperational.length===0&&<EmptyRow cols={6} text="Nenhum médico com escala confirmada nesta competência."/>}
          {!loading&&filteredOperational.map(d=><tr key={d.cd_medico}><td><DoctorCell d={d}/></td><td>{d.especialidade}</td><td><ScheduleSummary rows={d.escalas}/></td><td><Badge status={d.status}/></td><td>{d.sol.ultimo_reenvio||d.sol.enviado_em||'—'}</td><td><div className="actions">
            {d.status==='nao_enviado'&&<button className="primary" onClick={()=>setSelectedDoctor(d)}><Send size={15}/> Enviar</button>}
            {d.status==='aguardando'&&<button className="outline" onClick={()=>setSelectedDoctor(d)}><RotateCcw size={15}/> Reenviar</button>}
            {d.status==='respondido'&&<><button className="outline" onClick={()=>setResponseDoctor(d)}><MessageSquareText size={15}/> Ver resposta</button><button className="evidence" onClick={()=>openPreview(d)}><FileImage size={15}/> Evidência</button></>}
          </div></td></tr>)}
        </tbody></table></div>
      </section>
    </>
  }
  function renderRespondidos(){
    const list=filteredOperational.filter(d=>d.status==='respondido')
    return <><Filters/><section className="table-card"><div className="table-head"><div><h2>Respostas recebidas</h2><p>{unidade} · {labelCompetencia(competencia)}</p></div><SearchBox query={query} setQuery={setQuery}/></div>
      <div className="table-wrap"><table><thead><tr><th>Médico</th><th>Especialidade</th><th>Respondido em</th><th>Resposta</th><th>Ações</th></tr></thead><tbody>
        {list.map(d=><tr key={d.cd_medico}><td><DoctorCell d={d}/></td><td>{d.especialidade}</td><td>{d.sol.respondido_em||'—'}</td><td><div className="snippet">{d.sol.resposta_recebida||'Resposta registrada sem texto.'}</div></td><td><div className="actions"><button className="outline" onClick={()=>setResponseDoctor(d)}>Ver resposta</button><button className="evidence" onClick={()=>openPreview(d)}><FileImage size={15}/> Evidência</button></div></td></tr>)}
        {!list.length&&<EmptyRow cols={5} text="Nenhuma resposta registrada para esta competência."/>}
      </tbody></table></div></section></>
  }
  function renderMedicos(){
    return <section className="table-card"><div className="table-head"><div><h2>Cadastro de médicos — {unidade}</h2><p>Cadastre, edite, ative/desative e mantenha a escala fixa sem abrir a planilha.</p></div><div className="head-actions"><SearchBox query={query} setQuery={setQuery}/><button className="primary" onClick={()=>setDoctorForm(blankDoctor(unidade))}><Plus size={15}/> Adicionar médico</button></div></div>
      <div className="table-wrap"><table><thead><tr><th>Médico</th><th>Especialidade</th><th>Telefone</th><th>Escala fixa</th><th>Situação</th><th>Ações</th></tr></thead><tbody>
        {filteredAll.map(d=>{const fx=fixedEscalas.filter(e=>String(e.cd_medico)===String(d.cd_medico));const atuais=escalas.filter(e=>String(e.cd_medico)===String(d.cd_medico));const sig=x=>[x.dia_semana,x.inicio,x.fim,x.especialidade||d.especialidade].map(v=>String(v||'').trim().toLowerCase()).join('|');const fxSig=new Set(fx.map(sig));const atuaisNaoFixas=atuais.filter(e=>!fxSig.has(sig(e)));const ativo=String(d.ativo||'Sim').toLowerCase()==='sim';const escalaResumo=fx.length&&atuaisNaoFixas.length?`${fx.length} fixa(s) · ${atuaisNaoFixas.length} atual(is)`:fx.length?`${fx.length} escala(s) fixa(s)`:atuais.length?`${atuais.length} turno(s) atual(is)`:'Cadastrar escala';return <tr key={d.cd_medico}><td><DoctorCell d={d}/></td><td>{d.especialidade}</td><td><span className="phone"><Phone size={14}/>{d.telefone}</span></td><td><button className={`link-btn ${!fx.length&&!atuais.length?'warn':''}`} onClick={()=>setFixedDoctor(d)}>{escalaResumo} <ChevronRight size={15}/></button></td><td><span className={`status-line ${ativo?'ok':'off'}`}>{ativo?<UserRoundCheck size={15}/>:<CircleOff size={15}/>} {ativo?'Ativo':'Inativo'}</span></td><td><div className="actions">
          <button className="outline" onClick={()=>setDoctorForm({...d})}><Pencil size={15}/> Editar</button>
          <button className="outline" onClick={()=>setFixedDoctor(d)}><CalendarDays size={15}/> Escala fixa</button>
          <button className={ativo?'danger':'success-btn'} onClick={()=>toggleDoctor(d)}>{ativo?<UserX size={15}/>:<UserCheck size={15}/>} {ativo?'Desativar':'Ativar'}</button>
        </div></td></tr>})}
      </tbody></table></div><div className="info-strip"><Database size={16}/><span>A planilha continua sendo o banco de dados. O site apenas facilita a operação.</span></div>
    </section>
  }

  function futureCards(){
    const h=hojeSP()
    const earliest=unidade==='Niterói'?COMP_INICIAL_NITEROI:(competencias[0]||addMonths(h.comp,2))
    const alvo=addMonths(h.comp,2)
    const first=compareComp(earliest,alvo)>0?earliest:alvo
    const list=[]
    for(let i=0;i<5;i++){const c=addMonths(first,i);if(compareComp(c,earliest)<0)continue;list.push(c)}
    return list
  }
  function configuredCount(comp){
    const m=competenciasMeta.find(x=>x.competencia===comp);return m?.total_medicos||0
  }
  function renderFuturas(){
    const cards=futureCards()
    return <><div className="future-grid">{cards.map(c=>{
      const released=isReleased(c),count=configuredCount(c),operational=count>0
      const state=!released?'locked':operational?'operational':'preparing'
      return <button key={c} className={`future-card ${state} ${futureComp===c?'selected':''}`} onClick={()=>released&&setFutureComp(c)} disabled={!released}>
        <div className="future-card-head"><div><span className="eyebrow">Competência</span><h2>{labelCompetencia(c)}</h2></div>{state==='locked'?<LockKeyhole/>:state==='operational'?<CheckCircle2/>:<Clock3/>}</div>
        {state==='locked'&&<><strong>Ainda não disponível</strong><span>Disponível a partir de {releaseLabel(c)}</span></>}
        {state==='preparing'&&<><strong>Em preparação</strong><span>0 escalas confirmadas</span><b>Preparar agendas</b></>}
        {state==='operational'&&<><strong>Em preparação</strong><span>{count} de {activeMedicos.length} médicos configurados</span><small>Disponível no Dashboard e em Abertura de Agenda</small><b>Continuar configuração</b></>}
      </button>
    })}</div>
    {!futureComp&&<div className="future-empty"><CalendarPlus size={32}/><strong>Escolha uma competência liberada acima</strong><span>Os meses bloqueados serão liberados automaticamente no dia 15, dois meses antes.</span></div>}
    {futureComp&&isReleased(futureComp)&&<FutureDoctorTable comp={futureComp}/>}
    </>
  }
  function FutureDoctorTable({comp}){
    const [monthRows,setMonthRows]=useState([])
    const [busy,setBusy]=useState(true)
    useEffect(()=>{let ok=true;(async()=>{setBusy(true);try{const r=await fetch(`/api/agenda-escalas?unidade=${encodeURIComponent(unidade)}&competencia=${encodeURIComponent(comp)}`);const j=await r.json();if(ok)setMonthRows(j.escalas||[])}finally{if(ok)setBusy(false)}})();return()=>{ok=false}},[comp,success])
    const configured=new Set(monthRows.map(e=>String(e.cd_medico)))
    const docs=filterDocs(activeMedicos,query)
    return <section className="table-card future-table"><div className="table-head"><div><h2>Preparar {labelCompetencia(comp)}</h2><p>{configured.size} de {activeMedicos.length} médicos com ao menos uma escala confirmada.</p></div><SearchBox query={query} setQuery={setQuery}/></div>
      <div className="table-wrap"><table><thead><tr><th>Médico</th><th>Especialidade</th><th>Escala fixa</th><th>Status do mês</th><th>Ação</th></tr></thead><tbody>
        {busy&&<LoadingRow cols={5}/>}
        {!busy&&docs.map(d=>{const fx=fixedEscalas.filter(e=>String(e.cd_medico)===String(d.cd_medico));const done=configured.has(String(d.cd_medico));return <tr key={d.cd_medico}><td><DoctorCell d={d}/></td><td>{d.especialidade}</td><td>{fx.length?`${fx.length} turno(s)`:'Sem escala fixa'}</td><td>{done?<span className="badge respondido">Configurado</span>:<span className="badge nao_enviado">Pendente</span>}</td><td>{fx.length?<button className="primary" onClick={()=>setFutureDoctor({doc:d,comp,existing:monthRows.filter(x=>String(x.cd_medico)===String(d.cd_medico))})}><CalendarPlus size={15}/>{done?'Continuar configuração':'Preparar agenda'}</button>:<button className="outline" onClick={()=>{setFixedDoctor(d);setActivePage('medicos')}}><Plus size={15}/> Cadastrar escala fixa</button>}</td></tr>})}
      </tbody></table></div></section>
  }
  function renderConfig(){
    return <div className="settings-grid"><section className="card"><h2>Regra de competências</h2><div className="settings-list"><div><span>Liberação</span><strong>Dia 15</strong></div><div><span>Antecedência</span><strong>2 meses</strong></div><div><span>Marco Niterói</span><strong>Outubro/2026</strong></div><div><span>Visibilidade</span><strong>Após 1ª escala confirmada</strong></div></div></section>
      <section className="card"><h2>Integrações</h2><div className="settings-list"><div><span><Database size={15}/> Google Sheets via n8n</span><strong className="ok-text">Banco</strong></div><div><span><MessageSquareText size={15}/> WhatsApp / Evolution</span><strong>CCNIT</strong></div><div><span><FileImage size={15}/> Evidência</span><strong>Sob demanda</strong></div></div><button className="outline settings-refresh" onClick={refreshAll}><RefreshCw size={15}/> Testar leitura</button>{lastSync&&<small>Última leitura: {lastSync.toLocaleString('pt-BR')}</small>}</section>
      <section className="card settings-wide"><h2>Feriados considerados automaticamente</h2><p>O sistema remove os feriados cadastrados do cálculo antes de confirmar a escala futura.</p><div className="holiday-list">{[...FIXED_HOLIDAYS].map(([d,n])=><span key={d}>{d.slice(3,5)}/{d.slice(0,2)} · {n}</span>)}</div></section>
    </div>
  }

  const current=activePage==='dashboard'?renderDashboard():activePage==='abertura'?renderAbertura():activePage==='respondidos'?renderRespondidos():activePage==='medicos'?renderMedicos():activePage==='futuras'?renderFuturas():renderConfig()

  return <div className="app"><aside className={`sidebar ${sidebarOpen?'':'collapsed'}`}><div className="brand"><div className="brand-mark"><Stethoscope size={21}/></div>{sidebarOpen&&<strong>Abertura de Agenda</strong>}</div><nav>
    <Nav id="dashboard" icon={<LayoutDashboard/>} label="Dashboard"/><Nav id="abertura" icon={<CalendarDays/>} label="Abertura de Agenda"/><Nav id="respondidos" icon={<MessageSquareText/>} label="Respondidos"/><Nav id="medicos" icon={<Users/>} label="Médicos"/><Nav id="futuras" icon={<CalendarPlus/>} label="Futuras Agendas"/><Nav id="configuracoes" icon={<Settings/>} label="Configurações"/>
  </nav>{sidebarOpen&&<div className="sidebar-foot"><span>RC</span><strong>v0.9</strong></div>}</aside>
  <main className="main"><header className="topbar"><button className="icon-btn" onClick={()=>setSidebarOpen(v=>!v)}><Menu size={20}/></button><div><h1>{pageMeta[activePage][0]}</h1><p>{pageMeta[activePage][1]}</p></div></header><div className="content">
    {error&&<div className="alert error"><AlertTriangle size={17}/>{error}</div>}{success&&<div className="alert success"><CheckCircle2 size={17}/>{success}</div>}{current}
  </div></main>

  {selectedDoctor&&<Modal onClose={()=>setSelectedDoctor(null)}><h2>{selectedDoctor.status==='aguardando'?'Reenviar solicitação':'Enviar solicitação'}</h2><p>Enviar a solicitação de <strong>{labelCompetencia(competencia)}</strong> para <strong>{selectedDoctor.nome}</strong>?</p><div className="modal-actions"><button className="outline" onClick={()=>setSelectedDoctor(null)}>Cancelar</button><button className="primary" disabled={sending} onClick={()=>sendDoctor(selectedDoctor)}>{sending?<LoaderCircle className="spin" size={16}/>:<Send size={16}/>} Confirmar</button></div></Modal>}
  {responseDoctor&&<Modal onClose={()=>setResponseDoctor(null)}><h2>Resposta recebida</h2><p><strong>{responseDoctor.nome}</strong> · {labelCompetencia(competencia)}</p><div className="response-box">{responseDoctor.sol.resposta_recebida||'Resposta registrada sem texto.'}</div><p className="muted">{responseDoctor.sol.respondido_em||''}</p></Modal>}
  {doctorForm&&<DoctorModal form={doctorForm} onClose={()=>setDoctorForm(null)} onSave={saveDoctor}/>}
  {fixedDoctor&&<FixedScheduleModal doctor={fixedDoctor} rows={fixedEscalas.filter(e=>String(e.cd_medico)===String(fixedDoctor.cd_medico))} currentRows={escalas.filter(e=>String(e.cd_medico)===String(fixedDoctor.cd_medico))} competencia={competencia} unidade={unidade} onClose={()=>setFixedDoctor(null)} onSave={saveFixed} onRemove={removeFixed}/>}
  {futureDoctor&&<PrepareFutureModal doctor={futureDoctor.doc} comp={futureDoctor.comp} fixedRows={fixedEscalas.filter(e=>String(e.cd_medico)===String(futureDoctor.doc.cd_medico))} existing={futureDoctor.existing||[]} onClose={()=>setFutureDoctor(null)} onConfirm={confirmFuture}/>}
  {previewDoctor&&<PreviewModal doctor={previewDoctor} image={previewImage} loading={previewLoading} action={previewAction} onClose={closePreview} onScroll={scrollPreview} onCapture={capturePreview}/>}
  </div>

  function Nav({id,icon,label}){return <button className={`nav-item ${activePage===id?'active':''}`} onClick={()=>{setActivePage(id);setQuery('')}}>{React.cloneElement(icon,{size:18})}{sidebarOpen&&label}</button>}
}

function Metric({icon,label,value}){return <div className="metric-card"><div className="metric-icon">{React.cloneElement(icon,{size:20})}</div><div><span>{label}</span><strong>{value}</strong></div></div>}
function LoadingRow({cols}){return <tr><td colSpan={cols} className="table-state"><LoaderCircle className="spin" size={20}/> Carregando...</td></tr>}
function EmptyRow({cols,text}){return <tr><td colSpan={cols} className="table-state">{text}</td></tr>}
function ScheduleSummary({rows}){const x=[...new Set(rows.map(r=>r.dia_semana))];return <span className="schedule-summary">{x.join(' / ')||'—'}</span>}
function filterDocs(list,q){const s=String(q||'').trim().toLowerCase();if(!s)return list;return list.filter(d=>[d.nome,d.especialidade,d.cd_medico].some(v=>String(v||'').toLowerCase().includes(s)))}
function blankDoctor(unidade){return {cd_medico:'',nome:'',especialidade:'',subespecialidade:'',telefone:'',unidade,ativo:'Sim',tipo:''}}
function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)}

function DoctorModal({form,onClose,onSave}){
  const [f,setF]=useState({...form})
  const isEdit=Boolean(form.cd_medico)
  return <Modal onClose={onClose}><h2>{isEdit?'Editar médico':'Cadastrar médico'}</h2><div className="form-grid">
    <label>CD Médico<input value={f.cd_medico||''} readOnly={isEdit} onChange={e=>setF({...f,cd_medico:e.target.value.replace(/\D/g,'')})}/></label>
    <label>Nome<input value={f.nome||''} onChange={e=>setF({...f,nome:e.target.value})}/></label>
    <label>Especialidade<input value={f.especialidade||''} onChange={e=>setF({...f,especialidade:e.target.value})}/></label>
    <label>Subespecialidade<input value={f.subespecialidade||''} onChange={e=>setF({...f,subespecialidade:e.target.value})}/></label>
    <label>Telefone<input value={f.telefone||''} onChange={e=>setF({...f,telefone:e.target.value.replace(/\D/g,'')})}/></label>
    <label>Unidade<input value={f.unidade||''} onChange={e=>setF({...f,unidade:e.target.value})}/></label>
  </div><div className="modal-actions"><button className="outline" onClick={onClose}>Cancelar</button><button className="primary" onClick={()=>onSave(f)}><Save size={16}/> Salvar</button></div></Modal>
}

function FixedScheduleModal({doctor,rows,currentRows=[],competencia,unidade,onClose,onSave,onRemove}){
  const blank=()=>({id_escala:'',dia_semana:'Segunda',especialidade:doctor.especialidade||'',inicio:'08:00',fim:'12:00',almoco:'Sem almoço',observacao:''})
  const [editing,setEditing]=useState(null)
  const signature=r=>[r.dia_semana,r.inicio,r.fim,r.especialidade||doctor.especialidade].map(v=>String(v||'').trim().toLowerCase()).join('|')
  const fixedSignatures=new Set(rows.map(signature))
  const baseRows=currentRows.filter(r=>r.dia_semana&&r.inicio&&r.fim&&!fixedSignatures.has(signature(r)))
  const displayed=[
    ...rows.map(r=>({...r,_source:'fixed'})),
    ...baseRows.map(r=>({...r,_source:'current'})),
  ]
  const editRow=r=>setEditing({
    id_escala:r._source==='fixed'?r.datas_origem:'',
    dia_semana:r.dia_semana,
    especialidade:r.especialidade||doctor.especialidade,
    inicio:r.inicio,
    fim:r.fim,
    almoco:r.almoco||'Sem almoço',
    observacao:r.observacao||'',
    _source:r._source,
  })
  return <Modal onClose={onClose} wide><h2>Escala fixa — {doctor.nome}</h2>
    <p>Esses turnos servem como base para preparar os meses futuros. As escalas fixas ficam na aba <strong>Escalas</strong> com competência <strong>FIXA</strong>.</p>
    {!!baseRows.length&&<div className="notice"><CalendarDays size={17}/><div><strong>Escala atual encontrada em {labelCompetencia(competencia)}</strong><span>Os turnos marcados como “Base atual” já existem na competência atual. Ao editar e salvar um deles, o sistema cria uma nova linha como escala FIXA, sem alterar a agenda de {labelCompetencia(competencia)}.</span></div></div>}
    <div className="fixed-list">{displayed.length?displayed.map((r,i)=><div className="fixed-row" key={`${r._source}-${r.datas_origem||signature(r)}-${i}`}><div><div className="actions"><strong>{r.dia_semana}</strong><span className={`badge ${r._source==='fixed'?'respondido':'aguardando'}`}>{r._source==='fixed'?'Escala fixa':`Base ${labelCompetencia(competencia)}`}</span></div><span>{r.inicio} às {r.fim} · {r.especialidade||doctor.especialidade}</span><small>{r.almoco||'Sem almoço'}{r.observacao?` · ${r.observacao}`:''}</small></div><div className="actions"><button className="outline" onClick={()=>editRow(r)}><Pencil size={14}/> {r._source==='fixed'?'Editar':'Usar / editar'}</button>{r._source==='fixed'&&<button className="danger" onClick={()=>onRemove(r)}><Trash2 size={14}/> Remover</button>}</div></div>):<div className="empty-box">Nenhuma escala encontrada para este médico. Adicione o primeiro turno fixo abaixo.</div>}</div>
    <button className="primary add-fixed" onClick={()=>setEditing(blank())}><Plus size={15}/> Adicionar novo turno</button>
    {editing&&<FixedForm value={editing} doctor={doctor} unidade={unidade} onCancel={()=>setEditing(null)} onSave={async x=>{const {_source,...payload}=x;const ok=await onSave({...payload,cd_medico:doctor.cd_medico,nome:doctor.nome,unidade});if(ok)setEditing(null)}}/>}
  </Modal>
}
function FixedForm({value,onCancel,onSave}){
  const [f,setF]=useState({...value})
  return <div className="fixed-editor"><h3>{f.id_escala?'Editar turno':f._source==='current'?'Criar escala fixa a partir do turno atual':'Novo turno'}</h3><div className="form-grid">
    <label>Dia da semana<select value={f.dia_semana} onChange={e=>setF({...f,dia_semana:e.target.value})}>{DIAS.map(d=><option key={d}>{d}</option>)}</select></label>
    <label>Especialidade<input value={f.especialidade} onChange={e=>setF({...f,especialidade:e.target.value})}/></label>
    <label>Início<input type="time" value={f.inicio} onChange={e=>setF({...f,inicio:e.target.value})}/></label>
    <label>Fim<input type="time" value={f.fim} onChange={e=>setF({...f,fim:e.target.value})}/></label>
    <label>Almoço<input value={f.almoco} onChange={e=>setF({...f,almoco:e.target.value})}/></label>
    <label>Observação<input value={f.observacao} onChange={e=>setF({...f,observacao:e.target.value})}/></label>
  </div><div className="modal-actions"><button className="outline" onClick={onCancel}>Cancelar</button><button className="primary" onClick={()=>onSave(f)}><Save size={15}/> {f._source==='current'?'Salvar como escala fixa':'Salvar turno'}</button></div></div>
}

function PrepareFutureModal({doctor,comp,fixedRows,existing,onClose,onConfirm}){
  const [selected,setSelected]=useState(()=>new Set(fixedRows.map(r=>r.datas_origem)))
  const toggle=id=>setSelected(s=>{const n=new Set(s);n.has(id)?n.delete(id):n.add(id);return n})
  const existingKeys=new Set(existing.map(e=>[e.dia_semana,e.inicio,e.fim,e.especialidade].join('|')))
  return <Modal onClose={onClose} wide><h2>Preparar agenda — {doctor.nome}</h2><p><strong>{labelCompetencia(comp)}</strong> · confira os turnos e as datas antes de confirmar.</p>
    <div className="prepare-list">{fixedRows.map(r=>{const calc=datesForSchedule(comp,r.dia_semana),key=[r.dia_semana,r.inicio,r.fim,r.especialidade||doctor.especialidade].join('|'),already=existingKeys.has(key)
      return <div className={`prepare-row ${already?'already':''}`} key={r.datas_origem}><label className="check-line"><input type="checkbox" checked={selected.has(r.datas_origem)&&!already} disabled={already} onChange={()=>toggle(r.datas_origem)}/><div><strong>{r.dia_semana} · {r.inicio} às {r.fim}</strong><span>{r.especialidade||doctor.especialidade}</span></div>{already&&<span className="badge respondido">Já confirmado</span>}</label>
        <div className="date-preview"><div><b>Datas calculadas</b><span>{calc.origem.join(', ')||'—'}</span></div><div><b>Feriados encontrados</b><span>{calc.removidos.join(', ')||'Nenhum'}</span></div><div><b>Datas para abertura</b><span>{calc.solicitar.join(', ')||'—'}</span></div></div></div>})}</div>
    <div className="modal-actions"><button className="outline" onClick={onClose}>Cancelar</button><button className="primary" disabled={!fixedRows.some(r=>selected.has(r.datas_origem)&&!existingKeys.has([r.dia_semana,r.inicio,r.fim,r.especialidade||doctor.especialidade].join('|')))} onClick={()=>onConfirm(doctor,comp,fixedRows.filter(r=>selected.has(r.datas_origem)&&!existingKeys.has([r.dia_semana,r.inicio,r.fim,r.especialidade||doctor.especialidade].join('|'))))}><CheckCircle2 size={16}/> Confirmar escala</button></div>
  </Modal>
}
function PreviewModal({doctor,image,loading,action,onClose,onScroll,onCapture}){
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="preview-modal" onMouseDown={e=>e.stopPropagation()}><div className="preview-head"><div><strong>{doctor.nome}</strong><span>Conversa do WhatsApp</span></div><button className="modal-x" onClick={onClose}><X size={18}/></button></div><div className="preview-body">{loading&&<div className="preview-loading"><LoaderCircle className="spin"/>{action||'Carregando...'}</div>}{image&&<img src={image}/>}</div><div className="preview-actions"><button className="outline" onClick={()=>onScroll('cima')}>↑ Subir</button><button className="outline" onClick={()=>onScroll('baixo')}>↓ Descer</button><button className="primary" onClick={onCapture}><FileImage size={15}/> Capturar trecho</button></div></div></div>
}
