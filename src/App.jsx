import React, { useEffect, useMemo, useState } from 'react'
import {
  LayoutDashboard, CalendarDays, MessageSquareText, Users, Settings, Menu,
  Search, Send, RotateCcw, FileImage, RefreshCw, ChevronRight, CheckCircle2,
  Clock3, Database, Stethoscope, Plus, Pencil, UserX, Save, X, LockKeyhole,
  CalendarPlus, AlertTriangle, LoaderCircle, Phone, BarChart3
} from 'lucide-react'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const UNIDADE_PADRAO = 'Niterói'
const COMPETENCIA_INICIAL = '2026-10'

const FERIADOS = [
  { data:'2026-10-12', nome:'Nossa Senhora Aparecida', tipo:'Nacional' },
  { data:'2026-11-02', nome:'Finados', tipo:'Nacional' },
  { data:'2026-11-15', nome:'Proclamação da República', tipo:'Nacional' },
  { data:'2026-11-20', nome:'Dia Nacional de Zumbi e da Consciência Negra', tipo:'Nacional' },
  { data:'2026-12-25', nome:'Natal', tipo:'Nacional' },
  { data:'2027-01-01', nome:'Confraternização Universal', tipo:'Nacional' },
  { data:'2027-04-21', nome:'Tiradentes', tipo:'Nacional' },
  { data:'2027-05-01', nome:'Dia Mundial do Trabalho', tipo:'Nacional' },
  { data:'2027-09-07', nome:'Independência do Brasil', tipo:'Nacional' },
  { data:'2027-10-12', nome:'Nossa Senhora Aparecida', tipo:'Nacional' },
  { data:'2027-11-02', nome:'Finados', tipo:'Nacional' },
  { data:'2027-11-15', nome:'Proclamação da República', tipo:'Nacional' },
  { data:'2027-11-20', nome:'Dia Nacional de Zumbi e da Consciência Negra', tipo:'Nacional' },
  { data:'2027-12-25', nome:'Natal', tipo:'Nacional' },
]

const WEEKDAY = { Domingo:0, Segunda:1, Terça:2, Quarta:3, Quinta:4, Sexta:5, Sábado:6 }
const WEEKDAY_LABEL = ['DOMINGO','SEGUNDA-FEIRA','TERÇA-FEIRA','QUARTA-FEIRA','QUINTA-FEIRA','SEXTA-FEIRA','SÁBADO']

function competenciaLabel(c) {
  if (!c || !/^\d{4}-\d{2}$/.test(c)) return c || '—'
  const [a,m] = c.split('-').map(Number)
  return `${MESES[m-1]}/${a}`
}
function addMonths(comp, qtd) {
  const [a,m] = comp.split('-').map(Number)
  const d = new Date(a, m-1+qtd, 1)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
}
function normalizarStatus(s='') {
  const v = String(s).trim().toLowerCase()
  if (v === 'respondido') return 'respondido'
  if (v === 'aguardando resposta' || v === 'aguardando') return 'aguardando'
  return 'nao_enviado'
}
function separarDatas(v='') { return String(v).split(',').map(x=>x.trim()).filter(Boolean) }
function isoToBR(iso) {
  const [a,m,d] = iso.split('-')
  return `${d}/${m}/${a}`
}
function feriadosDaCompetencia(comp) {
  return FERIADOS.filter(f => f.data.startsWith(comp+'-'))
}
function datasPorDiaSemana(comp, diaSemana) {
  const [ano, mes] = comp.split('-').map(Number)
  const weekday = WEEKDAY[diaSemana]
  const out = []
  const feriados = new Set(FERIADOS.map(f=>f.data))
  for (let d=1; d<=31; d++) {
    const date = new Date(ano, mes-1, d)
    if (date.getMonth() !== mes-1) break
    const iso = `${ano}-${String(mes).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    if (date.getDay() === weekday && !feriados.has(iso)) out.push(`${String(d).padStart(2,'0')}/${String(mes).padStart(2,'0')}`)
  }
  return out
}
function calcularLiberacao(competencias) {
  const agora = new Date()
  const atual = `${agora.getFullYear()}-${String(agora.getMonth()+1).padStart(2,'0')}`
  const alvoAtual = addMonths(atual, 2)
  const liberado = agora.getDate() >= 15
  if (liberado && !competencias.includes(alvoAtual)) {
    return { competencia: alvoAtual, liberado:true, data:`15/${String(agora.getMonth()+1).padStart(2,'0')}/${agora.getFullYear()}` }
  }
  const proximoMes = addMonths(atual, 1)
  const competencia = addMonths(proximoMes, 2)
  const [a,m] = proximoMes.split('-')
  return { competencia, liberado:false, data:`15/${m}/${a}` }
}

function montarDoctors(medicos, escalas, solicitacoes) {
  const solMap = new Map(solicitacoes.map(s=>[String(s.cd_medico),s]))
  return medicos
    .filter(m => String(m.ativo||'Sim').toLowerCase() === 'sim')
    .map(m => {
      const cd = String(m.cd_medico)
      const esc = escalas.filter(e=>String(e.cd_medico)===cd).map(e=>({
        dia_semana:e.dia_semana, especialidade:e.especialidade||m.especialidade,
        inicio:e.inicio, fim:e.fim, almoco:e.almoco, datas:separarDatas(e.datas_solicitar),
        observacao:e.observacao||''
      }))
      const s = solMap.get(cd) || {}
      return {
        ...m, cd, nome:m.nome, telefone:m.telefone, escalas:esc,
        status:normalizarStatus(s.status), enviado_em:s.enviado_em||'',
        ultimo_reenvio:s.ultimo_reenvio||'', respondido_em:s.respondido_em||'',
        resposta_recebida:s.resposta_recebida||''
      }
    })
}

function Modal({children,onClose}) {
  return <div className="modal-backdrop" onMouseDown={onClose}>
    <div className="modal" onMouseDown={e=>e.stopPropagation()}>
      <button className="modal-x" onClick={onClose}><X size={18}/></button>{children}
    </div>
  </div>
}

export default function App() {
  const [activePage,setActivePage] = useState('abertura')
  const [sidebarOpen,setSidebarOpen] = useState(true)
  const [unidade,setUnidade] = useState(UNIDADE_PADRAO)
  const [competencias,setCompetencias] = useState([COMPETENCIA_INICIAL])
  const [competencia,setCompetencia] = useState(COMPETENCIA_INICIAL)
  const [medicosBase,setMedicosBase] = useState([])
  const [escalas,setEscalas] = useState([])
  const [solicitacoes,setSolicitacoes] = useState([])
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState('')
  const [success,setSuccess] = useState('')
  const [query,setQuery] = useState('')
  const [selectedDoctor,setSelectedDoctor] = useState(null)
  const [responseDoctor,setResponseDoctor] = useState(null)
  const [doctorForm,setDoctorForm] = useState(null)
  const [futureDoctor,setFutureDoctor] = useState(null)
  const [sending,setSending] = useState(false)
  const [lastSync,setLastSync] = useState(null)

  const doctors = useMemo(()=>montarDoctors(medicosBase,escalas,solicitacoes),[medicosBase,escalas,solicitacoes])
  const filtered = useMemo(()=>{
    const q=query.toLowerCase().trim()
    if(!q) return doctors
    return doctors.filter(d=>[d.nome,d.especialidade,d.cd].some(v=>String(v||'').toLowerCase().includes(q)))
  },[doctors,query])
  const counters = useMemo(()=>({
    total:doctors.length,
    enviados:doctors.filter(d=>d.status!=='nao_enviado').length,
    aguardando:doctors.filter(d=>d.status==='aguardando').length,
    respondidos:doctors.filter(d=>d.status==='respondido').length
  }),[doctors])
  const responseRate = counters.enviados ? Math.round(counters.respondidos/counters.enviados*100) : 0
  const liberacao = useMemo(()=>calcularLiberacao(competencias),[competencias])

  async function carregarCompetencias() {
    try {
      const r=await fetch(`/api/agenda-competencias?unidade=${encodeURIComponent(unidade)}`)
      if(!r.ok) throw new Error()
      const j=await r.json()
      const lista=(j.competencias||[]).filter(c=>c>=COMPETENCIA_INICIAL).sort()
      if(lista.length) {
        setCompetencias(lista)
        if(!lista.includes(competencia)) setCompetencia(lista[lista.length-1])
      }
    } catch {
      setCompetencias(prev=>prev.length?prev:[COMPETENCIA_INICIAL])
    }
  }

  async function refreshData(comp=competencia) {
    setLoading(true); setError('')
    try {
      const [mr,er,sr]=await Promise.all([
        fetch('/api/agenda-medicos'),
        fetch(`/api/agenda-escalas?unidade=${encodeURIComponent(unidade)}&competencia=${encodeURIComponent(comp)}`),
        fetch(`/api/agenda-solicitacoes?unidade=${encodeURIComponent(unidade)}&competencia=${encodeURIComponent(comp)}`)
      ])
      if(!mr.ok||!er.ok||!sr.ok) throw new Error('Não foi possível carregar os dados do n8n.')
      const [m,e,s]=await Promise.all([mr.json(),er.json(),sr.json()])
      setMedicosBase(m.medicos||[]); setEscalas(e.escalas||[]); setSolicitacoes(s.solicitacoes||[])
      setLastSync(new Date())
    } catch(err) { setError(err.message||'Falha ao carregar dados.') }
    finally { setLoading(false) }
  }

  useEffect(()=>{ carregarCompetencias() },[unidade])
  useEffect(()=>{ refreshData(competencia) },[competencia,unidade])

  async function enviar(doc) {
    if(sending) return
    setSending(true); setError(''); setSuccess('')
    try{
      const r=await fetch('/api/agenda-enviar-teste',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cd_medico:doc.cd,competencia})})
      const j=await r.json().catch(()=>({}))
      if(!r.ok||j.ok===false) throw new Error(j.mensagem||j.error||'Falha ao enviar.')
      setSuccess(`Mensagem enviada para ${doc.nome}.`); setSelectedDoctor(null); await refreshData()
    }catch(e){setError(e.message)} finally{setSending(false)}
  }

  async function salvarMedico(form) {
    setError(''); setSuccess('')
    try {
      const r=await fetch('/api/agenda-medico-salvar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,unidade})})
      const j=await r.json().catch(()=>({}))
      if(!r.ok||j.ok===false) throw new Error(j.mensagem||j.error||'Não foi possível salvar o médico.')
      setSuccess('Cadastro do médico salvo na planilha.'); setDoctorForm(null); await refreshData()
    } catch(e){setError(e.message)}
  }

  async function desativarMedico(doc) {
    if(!confirm(`Desativar ${doc.nome}? O histórico das competências anteriores será preservado.`)) return
    try {
      const r=await fetch('/api/agenda-medico-status',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cd_medico:doc.cd,ativo:'Não'})})
      const j=await r.json().catch(()=>({}))
      if(!r.ok||j.ok===false) throw new Error(j.mensagem||j.error||'Falha ao desativar.')
      setSuccess('Médico desativado.'); await refreshData()
    } catch(e){setError(e.message)}
  }

  async function confirmarEscala(payload) {
    try {
      const r=await fetch('/api/agenda-escala-confirmar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
      const j=await r.json().catch(()=>({}))
      if(!r.ok||j.ok===false) throw new Error(j.mensagem||j.error||'Não foi possível confirmar a escala.')
      setSuccess(`Escala confirmada para ${competenciaLabel(payload.competencia)}.`)
      setFutureDoctor(null)
      await carregarCompetencias()
      if(payload.competencia===competencia) await refreshData()
    } catch(e){setError(e.message)}
  }

  const pageMeta={
    dashboard:['Dashboard','Visão geral do ciclo de abertura de agendas'],
    abertura:['Abertura de Agenda Médica','Controle de solicitações, respostas e evidências'],
    respondidos:['Respondidos','Conferência das respostas recebidas'],
    medicos:['Médicos','Cadastro e manutenção sem abrir a planilha'],
    futuras:['Futuras Agendas','Prepare novas competências respeitando a regra do dia 15'],
    configuracoes:['Configurações','Parâmetros e integrações do painel']
  }

  const Filters=()=> <div className="filters-card">
    <div className="field"><label>Unidade</label><select value={unidade} onChange={e=>setUnidade(e.target.value)}><option>Niterói</option></select></div>
    <div className="field"><label>Competência</label><select value={competencia} onChange={e=>setCompetencia(e.target.value)}>
      {competencias.map(c=><option key={c} value={c}>{competenciaLabel(c)}</option>)}
    </select></div>
    <div className="field"><label>Ano</label><input value={competencia.split('-')[0]} readOnly/></div>
  </div>

  const Metrics=()=> <div className="metrics">
    <div className="metric"><Users/><span>Total de médicos</span><strong>{counters.total}</strong></div>
    <div className="metric"><Send/><span>Enviados</span><strong>{counters.enviados}</strong></div>
    <div className="metric"><Clock3/><span>Aguardando</span><strong>{counters.aguardando}</strong></div>
    <div className="metric"><CheckCircle2/><span>Respondidos</span><strong>{counters.respondidos}</strong></div>
  </div>

  function renderDashboard(){
    return <><Filters/><Metrics/><div className="dashboard-grid">
      <section className="card"><h2>Taxa de resposta</h2><div className="big-number">{responseRate}%</div><div className="progress"><i style={{width:`${responseRate}%`}}/></div><p>{counters.respondidos} de {counters.enviados} solicitações enviadas já foram respondidas.</p></section>
      <section className="card"><h2>Competência selecionada</h2><div className="big-label">{competenciaLabel(competencia)}</div><p>O Dashboard só lista competências que já possuem pelo menos uma escala confirmada para a unidade.</p></section>
    </div></>
  }

  function renderAbertura(){
    const fer=feriadosDaCompetencia(competencia)
    return <><Filters/>
      {!!fer.length&&<div className="notice"><CalendarDays/><div><strong>Feriados em {competenciaLabel(competencia)}</strong><span>{fer.map(f=>`${isoToBR(f.data).slice(0,5)} — ${f.nome}`).join(' · ')}</span></div></div>}
      <Metrics/>
      <section className="table-card"><div className="table-head"><div><h2>Médicos — {unidade}</h2><p>{competenciaLabel(competencia)} · somente escalas confirmadas</p></div><SearchBox/></div>
        <div className="table-wrap"><table><thead><tr><th>Médico</th><th>Especialidade</th><th>Escala</th><th>Status</th><th>Último envio</th><th>Ação</th></tr></thead>
        <tbody>{loading?<State/>:filtered.map(d=><tr key={d.cd}><td><Doctor d={d}/></td><td>{d.especialidade}</td><td>{d.escalas.length?d.escalas.map(e=>e.dia_semana).join(' / '):'—'}</td><td><Badge status={d.status}/></td><td>{d.ultimo_reenvio||d.enviado_em||'—'}</td><td><div className="actions">
          {d.status==='nao_enviado'&&<button className="primary" onClick={()=>setSelectedDoctor(d)}><Send size={15}/> Enviar</button>}
          {d.status==='aguardando'&&<button className="outline" onClick={()=>setSelectedDoctor(d)}><RotateCcw size={15}/> Reenviar</button>}
          {d.status==='respondido'&&<button className="outline" onClick={()=>setResponseDoctor(d)}><MessageSquareText size={15}/> Ver resposta</button>}
        </div></td></tr>)}</tbody></table></div>
      </section></>
  }

  function renderRespondidos(){
    const lista=doctors.filter(d=>d.status==='respondido')
    return <><Filters/><section className="table-card"><div className="table-head"><div><h2>Respostas recebidas</h2><p>{competenciaLabel(competencia)} · {unidade}</p></div></div>
      <div className="table-wrap"><table><thead><tr><th>Médico</th><th>Especialidade</th><th>Respondido em</th><th>Resposta</th></tr></thead><tbody>
      {lista.map(d=><tr key={d.cd}><td><Doctor d={d}/></td><td>{d.especialidade}</td><td>{d.respondido_em||'—'}</td><td><button className="outline" onClick={()=>setResponseDoctor(d)}>Ver resposta</button></td></tr>)}
      {!lista.length&&!loading&&<tr><td colSpan="4" className="empty">Nenhuma resposta nesta competência.</td></tr>}
      </tbody></table></div></section></>
  }

  function renderMedicos(){
    return <section className="table-card"><div className="table-head"><div><h2>Cadastro de médicos — {unidade}</h2><p>As alterações são gravadas na aba Medicos da planilha operacional.</p></div>
      <div className="head-actions"><SearchBox/><button className="primary" onClick={()=>setDoctorForm({cd_medico:'',nome:'',especialidade:'',subespecialidade:'',telefone:'',ativo:'Sim'})}><Plus size={16}/> Adicionar médico</button></div></div>
      <div className="table-wrap"><table><thead><tr><th>Médico</th><th>Especialidade</th><th>Telefone</th><th>Escala atual</th><th>Ações</th></tr></thead><tbody>
        {filtered.map(d=><tr key={d.cd}><td><Doctor d={d}/></td><td>{d.especialidade}</td><td><Phone size={14}/> {d.telefone}</td><td>{d.escalas.length?d.escalas.map(e=>e.dia_semana).join(' / '):'Sem escala'}</td>
        <td><div className="actions"><button className="outline" onClick={()=>setDoctorForm({cd_medico:d.cd,nome:d.nome,especialidade:d.especialidade||'',subespecialidade:d.subespecialidade||'',telefone:d.telefone||'',ativo:'Sim'})}><Pencil size={15}/> Editar</button>
        <button className="danger" onClick={()=>desativarMedico(d)}><UserX size={15}/> Desativar</button></div></td></tr>)}
      </tbody></table></div>
      <div className="info"><Database size={16}/> A planilha continua sendo o banco de dados; o usuário administra os registros pelo painel.</div>
    </section>
  }

  function renderFuturas(){
    const target=liberacao.competencia
    const jaExiste=competencias.includes(target)
    return <><div className="future-hero"><div><span className="eyebrow">Próxima competência</span><h2>{competenciaLabel(target)}</h2>
      <p>{liberacao.liberado?'Competência liberada para preparação.':'Ainda bloqueada pela regra operacional.'}</p></div>
      <div className={`unlock ${liberacao.liberado?'open':'locked'}`}>{liberacao.liberado?<CalendarPlus/>:<LockKeyhole/>}<strong>{liberacao.liberado?'Liberado':'Libera em '+liberacao.data}</strong></div></div>
      <div className="notice"><AlertTriangle/><div><strong>Regra operacional</strong><span>A partir do dia 15 de cada mês, libera-se a preparação da agenda de dois meses à frente. A competência só aparece no Dashboard e em Abertura de Agenda após a primeira escala confirmada.</span></div></div>
      <section className="table-card"><div className="table-head"><div><h2>Médicos ativos</h2><p>Confirme apenas as escalas já definidas para {competenciaLabel(target)}.</p></div><SearchBox/></div>
      <div className="table-wrap"><table><thead><tr><th>Médico</th><th>Especialidade</th><th>Escala atual</th><th>Nova competência</th><th>Ação</th></tr></thead><tbody>
        {filtered.map(d=><tr key={d.cd}><td><Doctor d={d}/></td><td>{d.especialidade}</td><td>{d.escalas.length?d.escalas.map(e=>`${e.dia_semana} ${e.inicio}-${e.fim}`).join(' · '):'Sem escala de referência'}</td><td>{competenciaLabel(target)}</td>
        <td><button className="primary" disabled={!liberacao.liberado||jaExiste} onClick={()=>setFutureDoctor({doctor:d,competencia:target})}><CalendarPlus size={15}/>{jaExiste?'Já operacional':'Confirmar escala'}</button></td></tr>)}
      </tbody></table></div></section></>
  }

  function renderConfig(){
    return <div className="dashboard-grid"><section className="card"><h2>Operação atual</h2><dl><dt>Unidade</dt><dd>{unidade}</dd><dt>Competência</dt><dd>{competenciaLabel(competencia)}</dd><dt>Marco inicial</dt><dd>Outubro/2026</dd><dt>Regra de futuras agendas</dt><dd>Dia 15 → +2 meses</dd></dl></section>
      <section className="card"><h2>Integrações</h2><dl><dt>Banco</dt><dd>Google Sheets via n8n</dd><dt>WhatsApp</dt><dd>Evolution API / CCNIT</dd><dt>Última leitura</dt><dd>{lastSync?lastSync.toLocaleString('pt-BR'):'—'}</dd></dl><button className="outline" onClick={()=>refreshData()}><RefreshCw size={15}/> Testar leitura</button></section>
      <section className="card span-2"><h2>Feriados</h2><p>As datas cadastradas são removidas do cálculo automático antes da confirmação da escala.</p><div className="holiday-list">{FERIADOS.filter(f=>f.data.slice(0,4)>=competencia.slice(0,4)).slice(0,12).map(f=><span key={f.data}>{isoToBR(f.data)} · {f.nome}</span>)}</div></section></div>
  }

  const current=activePage==='dashboard'?renderDashboard():activePage==='abertura'?renderAbertura():activePage==='respondidos'?renderRespondidos():activePage==='medicos'?renderMedicos():activePage==='futuras'?renderFuturas():renderConfig()

  return <div className="app">
    <aside className={sidebarOpen?'sidebar':'sidebar collapsed'}><div className="brand"><Stethoscope/>{sidebarOpen&&<strong>Abertura de Agenda</strong>}</div>
      <nav>
        <Nav id="dashboard" icon={<LayoutDashboard/>} label="Dashboard"/>
        <Nav id="abertura" icon={<CalendarDays/>} label="Abertura de Agenda"/>
        <Nav id="respondidos" icon={<MessageSquareText/>} label="Respondidos"/>
        <Nav id="medicos" icon={<Users/>} label="Médicos"/>
        <Nav id="futuras" icon={<CalendarPlus/>} label="Futuras Agendas"/>
        <Nav id="configuracoes" icon={<Settings/>} label="Configurações"/>
      </nav>{sidebarOpen&&<div className="version">RC v0.8</div>}</aside>
    <main><header><button className="icon" onClick={()=>setSidebarOpen(v=>!v)}><Menu/></button><div><h1>{pageMeta[activePage][0]}</h1><p>{pageMeta[activePage][1]}</p></div></header>
      <div className="content">{error&&<div className="alert error">{error}</div>}{success&&<div className="alert success">{success}</div>}{current}</div>
    </main>

    {selectedDoctor&&<Modal onClose={()=>setSelectedDoctor(null)}><h2>{selectedDoctor.status==='aguardando'?'Reenviar solicitação':'Enviar solicitação'}</h2><p>Enviar para <strong>{selectedDoctor.nome}</strong> referente a <strong>{competenciaLabel(competencia)}</strong>?</p><div className="modal-actions"><button className="outline" onClick={()=>setSelectedDoctor(null)}>Cancelar</button><button className="primary" disabled={sending} onClick={()=>enviar(selectedDoctor)}>{sending?<LoaderCircle className="spin"/>:<Send/>} Confirmar</button></div></Modal>}
    {responseDoctor&&<Modal onClose={()=>setResponseDoctor(null)}><h2>Resposta recebida</h2><p><strong>{responseDoctor.nome}</strong></p><div className="response-box">{responseDoctor.resposta_recebida||'Resposta registrada sem texto.'}</div><p className="muted">{responseDoctor.respondido_em||''}</p></Modal>}
    {doctorForm&&<DoctorModal form={doctorForm} setForm={setDoctorForm} onClose={()=>setDoctorForm(null)} onSave={salvarMedico}/>}
    {futureDoctor&&<FutureModal data={futureDoctor} onClose={()=>setFutureDoctor(null)} onSave={confirmarEscala}/>}
  </div>

  function Nav({id,icon,label}) { return <button className={activePage===id?'nav active':'nav'} onClick={()=>setActivePage(id)}>{icon}{sidebarOpen&&label}</button> }
  function SearchBox(){return <div className="search"><Search size={16}/><input placeholder="Buscar médico, especialidade ou CD..." value={query} onChange={e=>setQuery(e.target.value)}/></div>}
  function State(){return <tr><td colSpan="6" className="empty"><LoaderCircle className="spin"/> Carregando dados...</td></tr>}
  function Doctor({d}){return <div className="doctor"><span className="avatar">{String(d.nome||'?').split(' ').slice(0,2).map(x=>x[0]).join('')}</span><span><strong>{d.nome}</strong><small>CD {d.cd}</small></span></div>}
  function Badge({status}){return <span className={`badge ${status}`}>{status==='respondido'?'Respondido':status==='aguardando'?'Aguardando resposta':'Não enviado'}</span>}
}

function DoctorModal({form,setForm,onClose,onSave}) {
  return <Modal onClose={onClose}><h2>{form.cd_medico?'Editar médico':'Adicionar médico'}</h2><div className="form-grid">
    <label>CD Médico<input value={form.cd_medico} onChange={e=>setForm({...form,cd_medico:e.target.value})}/></label>
    <label>Nome<input value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})}/></label>
    <label>Especialidade<input value={form.especialidade} onChange={e=>setForm({...form,especialidade:e.target.value})}/></label>
    <label>Subespecialidade<input value={form.subespecialidade} onChange={e=>setForm({...form,subespecialidade:e.target.value})}/></label>
    <label>Telefone<input value={form.telefone} onChange={e=>setForm({...form,telefone:e.target.value.replace(/\D/g,'')})}/></label>
  </div><div className="modal-actions"><button className="outline" onClick={onClose}>Cancelar</button><button className="primary" onClick={()=>onSave(form)}><Save size={16}/> Salvar</button></div></Modal>
}

function FutureModal({data,onClose,onSave}) {
  const d=data.doctor
  const base=d.escalas[0]||{}
  const [dia,setDia]=useState(base.dia_semana||'Segunda')
  const [inicio,setInicio]=useState(base.inicio||'08:00')
  const [fim,setFim]=useState(base.fim||'12:00')
  const [almoco,setAlmoco]=useState(base.almoco||'Sem almoço')
  const [especialidade,setEspecialidade]=useState(base.especialidade||d.especialidade||'')
  const datas=datasPorDiaSemana(data.competencia,dia)
  const [ano,mes]=data.competencia.split('-')
  const origem=[]
  for(let x=1;x<=31;x++){const dt=new Date(+ano,+mes-1,x);if(dt.getMonth()!==+mes-1)break;if(dt.getDay()===WEEKDAY[dia])origem.push(`${String(x).padStart(2,'0')}/${mes}`)}
  const removidas=origem.filter(x=>!datas.includes(x))
  return <Modal onClose={onClose}><h2>Confirmar escala futura</h2><p><strong>{d.nome}</strong> · {competenciaLabel(data.competencia)}</p>
    <div className="form-grid"><label>Dia da semana<select value={dia} onChange={e=>setDia(e.target.value)}>{Object.keys(WEEKDAY).filter(x=>x!=='Domingo').map(x=><option key={x}>{x}</option>)}</select></label>
    <label>Especialidade<input value={especialidade} onChange={e=>setEspecialidade(e.target.value)}/></label><label>Início<input type="time" value={inicio} onChange={e=>setInicio(e.target.value)}/></label>
    <label>Fim<input type="time" value={fim} onChange={e=>setFim(e.target.value)}/></label><label>Almoço<input value={almoco} onChange={e=>setAlmoco(e.target.value)}/></label></div>
    <div className="preview-dates"><strong>Datas calculadas</strong><span>{origem.join(', ')||'—'}</span><strong>Feriados removidos</strong><span>{removidas.join(', ')||'Nenhum'}</span><strong>Datas para solicitar</strong><span>{datas.join(', ')||'—'}</span></div>
    <div className="modal-actions"><button className="outline" onClick={onClose}>Cancelar</button><button className="primary" onClick={()=>onSave({cd_medico:d.cd,nome:d.nome,unidade:d.unidade||'Niterói',competencia:data.competencia,dia_semana:dia,especialidade,inicio,fim,almoco,datas_origem:origem.join(', '),datas_solicitar:datas.join(', '),feriados_removidos:removidas.join(', ')})}><CheckCircle2 size={16}/> Confirmar escala</button></div>
  </Modal>
}
