import React, { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileImage,
  LayoutDashboard,
  Menu,
  RefreshCw,
  Search,
  Send,
  Settings,
  Stethoscope,
  Users,
  X,
  RotateCcw,
  MessageSquareText,
  ChevronRight,
  LockKeyhole,
  LoaderCircle,
  AlertTriangle,
  Activity,
  BarChart3,
  ClipboardCheck,
  Database,
  Phone,
  ShieldCheck,
  Wifi,
  CircleOff,
  UserRoundCheck,
} from 'lucide-react'

const unidades = [
  'São Gonçalo',
  'Niterói',
  'Cidade Nova',
  'Duque de Caxias',
  'Jacarepaguá',
  'Madureira',
  'Campo Grande',
  'Nova Iguaçu',
]

const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]


const feriados2026 = [
  { data: '2026-01-01', nome: 'Confraternização Universal', tipo: 'nacional' },
  { data: '2026-04-03', nome: 'Paixão de Cristo', tipo: 'nacional' },
  { data: '2026-04-21', nome: 'Tiradentes', tipo: 'nacional' },
  { data: '2026-05-01', nome: 'Dia Mundial do Trabalho', tipo: 'nacional' },
  { data: '2026-09-07', nome: 'Independência do Brasil', tipo: 'nacional' },
  { data: '2026-10-12', nome: 'Nossa Senhora Aparecida', tipo: 'nacional' },
  { data: '2026-11-02', nome: 'Finados', tipo: 'nacional' },
  { data: '2026-11-15', nome: 'Proclamação da República', tipo: 'nacional' },
  { data: '2026-11-20', nome: 'Dia Nacional de Zumbi e da Consciência Negra', tipo: 'nacional' },
  { data: '2026-12-25', nome: 'Natal', tipo: 'nacional' },
]

// Futuramente podemos acrescentar feriados estaduais, municipais e fechamentos internos.
// O filtro abaixo já impede que um feriado cadastrado seja oferecido automaticamente ao médico.
const feriadosSet = new Set(feriados2026.map((f) => f.data))


const nomesCurtos = {
  '101010100': 'Dr. Felipe',
  '493446970': 'Dr. André',
  '509666746': 'Dr. Bruno',
  '429017559': 'Dra. Diana',
  '268127622': 'Dr. Diego',
  '256471498': 'Dr. Eduardo',
  '510237497': 'Dr. Emanuel',
  '256484883': 'Dra. Fernanda',
  '412693181': 'Dr. Fernando',
  '256480489': 'Dra. Geisilaine',
  '256461280': 'Dr. Lucas',
  '256464491': 'Dr. Marcelo',
  '256463401': 'Dra. Maria Clara',
  '256461689': 'Dra. Naira',
  '263494473': 'Dr. Neoclebio',
  '263497944': 'Dr. Vinicius',
}

const weekdayMap = {
  'Segunda': 1,
  'Terça': 2,
  'Quarta': 3,
  'Quinta': 4,
  'Sexta': 5,
  'Sábado': 6,
  'Domingo': 0,
}

const weekdayLabel = {
  'Segunda': 'SEGUNDA-FEIRA',
  'Terça': 'TERÇA-FEIRA',
  'Quarta': 'QUARTA-FEIRA',
  'Quinta': 'QUINTA-FEIRA',
  'Sexta': 'SEXTA-FEIRA',
  'Sábado': 'SÁBADO',
  'Domingo': 'DOMINGO',
}

function normalizarStatus(status = '') {
  const s = String(status).trim().toLowerCase()
  if (s === 'aguardando resposta') return 'aguardando'
  if (s === 'respondido') return 'respondido'
  return 'nao_enviado'
}

function separarDatas(valor = '') {
  return String(valor)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
}

function montarDoctors(medicos, escalas, solicitacoes) {
  const solicitacaoPorCd = new Map(
    solicitacoes.map((s) => [String(s.cd_medico), s])
  )

  return medicos.map((m) => {
    const cd = String(m.cd_medico)
    const esc = escalas
      .filter((e) => String(e.cd_medico) === cd)
      .map((e) => ({
        dia: weekdayMap[e.dia_semana] ?? 0,
        label: weekdayLabel[e.dia_semana] ?? String(e.dia_semana || '').toUpperCase(),
        especialidade: e.especialidade || m.especialidade,
        inicio: e.inicio,
        fim: e.fim,
        almoco: !e.almoco || /sem almoço|não tem/i.test(e.almoco) ? null : e.almoco,
        datas: separarDatas(e.datas_solicitar),
        obs: e.observacao || '',
      }))

    const sol = solicitacaoPorCd.get(cd)
    return {
      id: cd,
      nome: m.nome,
      nomeCurto: nomesCurtos[cd] || `Dr(a). ${String(m.nome || '').split(' ')[0]}`,
      especialidade: m.especialidade,
      subespecialidade: m.subespecialidade || '',
      cd,
      telefone: m.telefone,
      status: normalizarStatus(sol?.status),
      ultimoEnvioOriginal: sol?.enviado_em || null,
      ultimoReenvio: sol?.ultimo_reenvio || '',
      ultimoEnvio: sol?.ultimo_reenvio || sol?.enviado_em || null,
      respondeuEm: sol?.respondido_em || null,
      respostaRecebida: sol?.resposta_recebida || '',
      idMensagemResposta: sol?.id_mensagem_resposta || '',
      evidenciaGerada: sol?.evidencia_gerada || '',
      teste: String(m.tipo || '').toLowerCase() === 'teste',
      complexa: esc.length > 2 || new Set(esc.map(e => e.dia)).size < esc.length,
      escalas: esc,
    }
  })
}

function diasDoMesPorSemana(ano, mesIndex, weekday) {
  const dias = []
  const date = new Date(ano, mesIndex, 1)

  while (date.getMonth() === mesIndex) {
    if (date.getDay() === weekday) {
      const iso = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
      ].join('-')

      if (!feriadosSet.has(iso)) {
        dias.push(
          String(date.getDate()).padStart(2, '0') +
          '/' +
          String(mesIndex + 1).padStart(2, '0')
        )
      }
    }
    date.setDate(date.getDate() + 1)
  }
  return dias
}


function filtrarFeriadosDasDatas(datas = []) {
  return datas.filter((data) => {
    const [dia, mes] = data.split('/')
    const iso = `2026-${mes}-${dia}`
    return !feriadosSet.has(iso)
  })
}

function formatHour(h) {
  return h.replace(':00', ':00h').replace(':30', ':30h')
}

function agruparEscalas(escalas) {
  const map = new Map()
  for (const escala of escalas) {
    const key = `${escala.dia}-${escala.label}`
    if (!map.has(key)) map.set(key, { dia: escala.dia, label: escala.label, itens: [] })
    map.get(key).itens.push(escala)
  }
  return Array.from(map.values()).sort((a, b) => a.dia - b.dia)
}

function gerarMensagem(medico) {
  const grupos = agruparEscalas(medico.escalas)

  const blocos = grupos.map((grupo) => {
    const linhas = grupo.itens.map((e) => {
      const datasOrigem = Array.isArray(e.datas) && e.datas.length
        ? e.datas
        : diasDoMesPorSemana(2026, 9, grupo.dia)

      const datas = filtrarFeriadosDasDatas(datasOrigem).join(', ')
      const especialidade =
        medico.complexa || grupo.itens.length > 1
          ? `${e.especialidade}\n`
          : ''

      const almoco = e.almoco
        ? `Almoço: ${e.almoco}`
        : 'Sem almoço'

      return `${especialidade}${datas}
Horário: ${e.inicio} às ${e.fim} hrs
${almoco}${e.obs ? `\nObservação: ${e.obs}` : ''}`
    })

    return `*${grupo.label}*\n${linhas.join('\n\n')}`
  })

  return `Boa tarde, ${medico.nomeCurto}!
Começamos a abertura das

*AGENDAS DE OUTUBRO*

📌Solicito por gentileza, que me envie os dias e horários que irá atender no ambulatório do CC NITEROI

${blocos.join('\n\n')}

❗Atenção aos FERIADOS e FÉRIAS e datas que desejam realizar o bloqueio das agendas para enviar as datas corretas e evitar cancelamentos após a abertura das agendas.
Por favor, nos envie o mais breve possível. Caso tenha alguma dúvida estou à disposição.`
}

function Badge({ status, teste }) {
  if (teste) return <span className="badge badge-test">Teste</span>
  const labels = {
    nao_enviado: ['Não enviado', 'badge-neutral'],
    aguardando: ['Aguardando resposta', 'badge-warn'],
    respondido: ['Respondido', 'badge-ok'],
  }
  const [label, cls] = labels[status]
  return <span className={`badge ${cls}`}>{label}</span>
}

function Modal({ children, onClose, wide = false }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className={`modal ${wide ? 'modal-wide' : ''}`} onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fechar">
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  )
}

function App() {
  const [doctors, setDoctors] = useState([])
  const [activePage, setActivePage] = useState('abertura')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [query, setQuery] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [detailsDoctor, setDetailsDoctor] = useState(null)
  const [responseDoctor, setResponseDoctor] = useState(null)
  const [evidenceLoadingCd, setEvidenceLoadingCd] = useState('')
  const [previewDoctor, setPreviewDoctor] = useState(null)
  const [previewImage, setPreviewImage] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewAction, setPreviewAction] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [lastSync, setLastSync] = useState(null)

  const refreshData = async () => {
    setLoading(true)
    setError('')
    try {
      const [medRes, escRes, solRes] = await Promise.all([
        fetch('/api/agenda-medicos'),
        fetch('/api/agenda-escalas?unidade=Niter%C3%B3i&competencia=2026-10'),
        fetch('/api/agenda-solicitacoes?unidade=Niter%C3%B3i&competencia=2026-10'),
      ])

      if (!medRes.ok || !escRes.ok || !solRes.ok) {
        throw new Error('Não foi possível carregar os dados do n8n.')
      }

      const [medData, escData, solData] = await Promise.all([
        medRes.json(), escRes.json(), solRes.json(),
      ])

      setDoctors(montarDoctors(
        medData.medicos || [],
        escData.escalas || [],
        solData.solicitacoes || [],
      ))
      setLastSync(new Date())
    } catch (err) {
      setError(err.message || 'Falha ao carregar os dados.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshData()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return doctors
    return doctors.filter((d) =>
      [d.nome, d.especialidade, d.cd].some((v) => v.toLowerCase().includes(q))
    )
  }, [doctors, query])

  const counters = useMemo(() => ({
    total: doctors.length,
    enviados: doctors.filter(d => d.status !== 'nao_enviado').length,
    aguardando: doctors.filter(d => d.status === 'aguardando').length,
    respondidos: doctors.filter(d => d.status === 'respondido').length,
  }), [doctors])

  const confirmSend = async () => {
    if (!selectedDoctor || sending) return

    setSending(true)
    setError('')
    setSuccess('')
    try {
      const response = await fetch('/api/agenda-enviar-teste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cd_medico: selectedDoctor.cd,
          competencia: '2026-10',
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.ok === false) {
        throw new Error(data.mensagem || data.error || data.erro || 'Falha ao enviar a mensagem.')
      }

      setSuccess(`Mensagem enviada para ${selectedDoctor.nomeCurto}.`)
      setSelectedDoctor(null)
      await refreshData()
    } catch (err) {
      setError(err.message || 'Não foi possível enviar a mensagem.')
    } finally {
      setSending(false)
    }
  }

  const downloadEvidence = async (doc) => {
    if (!doc || evidenceLoadingCd) return

    setEvidenceLoadingCd(doc.cd)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/agenda-evidencia-teste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cd_medico: doc.cd }),
      })

      if (!response.ok) {
        const contentType = response.headers.get('content-type') || ''
        let detail = {}

        if (contentType.includes('application/json')) {
          detail = await response.json().catch(() => ({}))
        } else {
          const text = await response.text().catch(() => '')
          detail = { mensagem: text }
        }

        throw new Error(
          detail.mensagem ||
          detail.error ||
          detail.erro ||
          'Não foi possível gerar a evidência.'
        )
      }

      const blob = await response.blob()
      if (!blob.size) {
        throw new Error('A evidência foi gerada sem conteúdo.')
      }

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `evidencia-whatsapp-${doc.cd}-2026-10.png`
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1500)

      setSuccess(`Evidência de ${doc.nomeCurto} gerada com sucesso.`)
    } catch (err) {
      setError(err.message || 'Não foi possível obter a evidência.')
    } finally {
      setEvidenceLoadingCd('')
    }
  }


  const openPreview = async (doc) => {
    if (!doc || previewLoading) return

    setPreviewDoctor(doc)
    setPreviewLoading(true)
    setPreviewAction('Abrindo conversa...')
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/agenda-preview-iniciar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cd_medico: doc.cd }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || !data?.ok || !data?.preview_url) {
        throw new Error(
          data.mensagem ||
          data.error ||
          data.erro ||
          'Não foi possível abrir o preview.'
        )
      }

      setPreviewImage(`${data.preview_url}${data.preview_url.includes('?') ? '&' : '?'}t=${Date.now()}`)
    } catch (err) {
      setPreviewDoctor(null)
      setError(err.message || 'Não foi possível abrir o preview.')
    } finally {
      setPreviewLoading(false)
      setPreviewAction('')
    }
  }

  const scrollPreview = async (direcao, intensidade) => {
    if (!previewDoctor || previewLoading) return

    setPreviewLoading(true)
    setPreviewAction(
      direcao === 'cima'
        ? (intensidade === 'longo' ? 'Subindo bastante...' : 'Subindo...')
        : (intensidade === 'longo' ? 'Descendo bastante...' : 'Descendo...')
    )

    try {
      const response = await fetch('/api/agenda-preview-rolar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cd_medico: previewDoctor.cd,
          direcao,
          intensidade,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || !data?.ok || !data?.preview_url) {
        throw new Error(
          data.mensagem ||
          data.error ||
          data.erro ||
          'Não foi possível atualizar o preview.'
        )
      }

      setPreviewImage(`${data.preview_url}${data.preview_url.includes('?') ? '&' : '?'}t=${Date.now()}`)
    } catch (err) {
      setError(err.message || 'Não foi possível rolar o preview.')
    } finally {
      setPreviewLoading(false)
      setPreviewAction('')
    }
  }

  const capturePreview = async () => {
    if (!previewDoctor || previewLoading) return

    setPreviewLoading(true)
    setPreviewAction('Capturando trecho...')

    try {
      const response = await fetch('/api/agenda-preview-capturar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cd_medico: previewDoctor.cd }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(
          data.mensagem ||
          data.error ||
          data.erro ||
          'Não foi possível capturar o trecho.'
        )
      }

      const blob = await response.blob()
      if (!blob.size) throw new Error('A captura retornou sem conteúdo.')

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `evidencia-trecho-${previewDoctor.cd}.png`
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1500)

      setSuccess(`Trecho de ${previewDoctor.nomeCurto} capturado com sucesso.`)
    } catch (err) {
      setError(err.message || 'Não foi possível capturar o trecho.')
    } finally {
      setPreviewLoading(false)
      setPreviewAction('')
    }
  }

  const closePreview = async () => {
    const doc = previewDoctor
    setPreviewDoctor(null)
    setPreviewImage('')
    setPreviewLoading(false)
    setPreviewAction('')

    if (!doc) return

    fetch('/api/agenda-preview-fechar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cd_medico: doc.cd }),
    }).catch(() => {})
  }


  const respondedDoctors = useMemo(
    () => doctors.filter(d => d.status === 'respondido'),
    [doctors]
  )

  const waitingDoctors = useMemo(
    () => doctors.filter(d => d.status === 'aguardando'),
    [doctors]
  )

  const specialtySummary = useMemo(() => {
    const map = new Map()
    doctors.forEach((d) => {
      const key = d.especialidade || 'SEM ESPECIALIDADE'
      const atual = map.get(key) || { total: 0, enviados: 0, respondidos: 0 }
      atual.total += 1
      if (d.status !== 'nao_enviado') atual.enviados += 1
      if (d.status === 'respondido') atual.respondidos += 1
      map.set(key, atual)
    })
    return Array.from(map.entries())
      .map(([especialidade, dados]) => ({ especialidade, ...dados }))
      .sort((a, b) => b.total - a.total || a.especialidade.localeCompare(b.especialidade))
  }, [doctors])

  const responseRate = counters.enviados
    ? Math.round((counters.respondidos / counters.enviados) * 100)
    : 0

  const pageMeta = {
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Visão geral do ciclo de abertura de agendas',
    },
    abertura: {
      title: 'Abertura de Agenda Médica',
      subtitle: 'Controle de solicitações, respostas e evidências',
    },
    respondidos: {
      title: 'Respondidos',
      subtitle: 'Conferência das respostas recebidas e evidências',
    },
    medicos: {
      title: 'Médicos',
      subtitle: 'Cadastro operacional e escalas da unidade',
    },
    configuracoes: {
      title: 'Configurações',
      subtitle: 'Parâmetros e saúde das integrações do painel',
    },
  }

  const renderMetrics = () => (
    <div className="metrics">
      <div className="metric-card">
        <div className="metric-icon"><Users size={20} /></div>
        <div><span>Total de médicos</span><strong>{counters.total}</strong></div>
      </div>
      <div className="metric-card">
        <div className="metric-icon"><Send size={20} /></div>
        <div><span>Enviados</span><strong>{counters.enviados}</strong></div>
      </div>
      <div className="metric-card">
        <div className="metric-icon"><Clock3 size={20} /></div>
        <div><span>Aguardando</span><strong>{counters.aguardando}</strong></div>
      </div>
      <div className="metric-card">
        <div className="metric-icon"><CheckCircle2 size={20} /></div>
        <div><span>Respondidos</span><strong>{counters.respondidos}</strong></div>
      </div>
    </div>
  )

  const renderDashboard = () => (
    <>
      {renderMetrics()}

      <div className="dashboard-grid">
        <section className="insight-card response-rate-card">
          <div className="insight-card-head">
            <div>
              <span className="eyebrow-inline">Indicador</span>
              <h2>Taxa de resposta</h2>
            </div>
            <div className="insight-icon"><BarChart3 size={20} /></div>
          </div>
          <div className="big-rate">{responseRate}%</div>
          <div className="progress-track">
            <div className="progress-bar" style={{ width: `${responseRate}%` }} />
          </div>
          <p>{counters.respondidos} de {counters.enviados} solicitações enviadas já foram respondidas.</p>
        </section>

        <section className="insight-card">
          <div className="insight-card-head">
            <div>
              <span className="eyebrow-inline">Operação</span>
              <h2>Próxima ação</h2>
            </div>
            <div className="insight-icon"><Activity size={20} /></div>
          </div>
          {waitingDoctors.length ? (
            <>
              <strong className="action-number">{waitingDoctors.length}</strong>
              <p>médico(s) aguardando resposta. Use a tela Abertura de Agenda para acompanhar ou reenviar.</p>
              <button className="outline-btn" onClick={() => setActivePage('abertura')}>
                Ir para abertura <ChevronRight size={15} />
              </button>
            </>
          ) : counters.enviados === counters.total && counters.total > 0 ? (
            <>
              <div className="good-state"><CheckCircle2 size={24} /> Ciclo sem pendências de resposta.</div>
              <p>Todos os médicos enviados já retornaram.</p>
            </>
          ) : (
            <>
              <strong className="action-number">{counters.total - counters.enviados}</strong>
              <p>médico(s) ainda não receberam a solicitação desta competência.</p>
              <button className="outline-btn" onClick={() => setActivePage('abertura')}>
                Iniciar envios <ChevronRight size={15} />
              </button>
            </>
          )}
        </section>
      </div>

      <section className="table-card">
        <div className="table-head">
          <div>
            <h2>Resumo por especialidade</h2>
            <p>Distribuição dos médicos e andamento das solicitações em Outubro/2026.</p>
          </div>
        </div>
        <div className="table-wrap">
          <table className="compact-table">
            <thead>
              <tr>
                <th>Especialidade</th>
                <th>Médicos</th>
                <th>Enviados</th>
                <th>Respondidos</th>
                <th>Retorno</th>
              </tr>
            </thead>
            <tbody>
              {specialtySummary.map((item) => {
                const rate = item.enviados ? Math.round(item.respondidos / item.enviados * 100) : 0
                return (
                  <tr key={item.especialidade}>
                    <td><strong>{item.especialidade}</strong></td>
                    <td>{item.total}</td>
                    <td>{item.enviados}</td>
                    <td>{item.respondidos}</td>
                    <td><span className="mini-rate">{rate}%</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )

  const renderRespondidos = () => (
    <section className="table-card standalone-card">
      <div className="table-head">
        <div>
          <h2>Respostas recebidas — Niterói</h2>
          <p>Fila de conferência das respostas registradas para Outubro/2026.</p>
        </div>
        <div className="page-count">
          <MessageSquareText size={16} />
          {respondedDoctors.length} respondido(s)
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Médico</th>
              <th>Especialidade</th>
              <th>Respondido em</th>
              <th>Resposta</th>
              <th className="th-actions">Conferência</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan="5" className="table-state"><LoaderCircle size={20} className="spin" /> Carregando respostas...</td></tr>
            )}
            {!loading && respondedDoctors.length === 0 && (
              <tr>
                <td colSpan="5">
                  <div className="empty-state">
                    <MessageSquareText size={28} />
                    <strong>Nenhuma resposta registrada ainda</strong>
                    <span>As respostas aparecerão aqui automaticamente quando chegarem pelo WhatsApp.</span>
                  </div>
                </td>
              </tr>
            )}
            {!loading && respondedDoctors.map((doc) => (
              <tr key={doc.cd}>
                <td>
                  <div className="doctor-cell">
                    <div className="avatar">{doc.nome.split(' ').slice(0,2).map(n => n[0]).join('')}</div>
                    <div><strong>{doc.nome}</strong><span>CD {doc.cd}</span></div>
                  </div>
                </td>
                <td>{doc.especialidade}</td>
                <td>{doc.respondeuEm || '—'}</td>
                <td>
                  <div className="response-snippet">
                    {doc.respostaRecebida || 'Resposta registrada sem texto.'}
                  </div>
                </td>
                <td>
                  <div className="actions">
                    <button className="outline-btn" onClick={() => setResponseDoctor(doc)}>
                      <MessageSquareText size={15} /> Ver resposta
                    </button>
                    <button className="evidence-btn" onClick={() => openPreview(doc)} disabled={previewLoading}>
                      <FileImage size={15} /> Evidência
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )

  const renderMedicos = () => (
    <section className="table-card standalone-card">
      <div className="table-head">
        <div>
          <h2>Cadastro operacional — Niterói</h2>
          <p>Dados usados pelo sistema para envio, identificação e montagem das escalas.</p>
        </div>
        <div className="search-box">
          <Search size={17} />
          <input
            placeholder="Buscar médico, especialidade ou CD..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Médico</th>
              <th>Especialidade</th>
              <th>Telefone</th>
              <th>Escala cadastrada</th>
              <th>Situação</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan="5" className="table-state"><LoaderCircle size={20} className="spin" /> Carregando médicos...</td></tr>
            )}
            {!loading && filtered.map((doc) => {
              const groups = agruparEscalas(doc.escalas)
              return (
                <tr key={doc.cd}>
                  <td>
                    <div className="doctor-cell">
                      <div className="avatar">{doc.nome.split(' ').slice(0,2).map(n => n[0]).join('')}</div>
                      <div><strong>{doc.nome}</strong><span>CD {doc.cd}</span></div>
                    </div>
                  </td>
                  <td>
                    <div className="specialty-cell">
                      <span>{doc.especialidade}</span>
                      {doc.subespecialidade && <small>{doc.subespecialidade}</small>}
                    </div>
                  </td>
                  <td><span className="phone-cell"><Phone size={14} /> {doc.telefone}</span></td>
                  <td>
                    {groups.length ? (
                      <button className="link-btn" onClick={() => setDetailsDoctor(doc)}>
                        {groups.map(g => g.label.split('-')[0]).join(' / ')}
                        <ChevronRight size={15} />
                      </button>
                    ) : <span className="badge badge-warn">Sem escala</span>}
                  </td>
                  <td>
                    <span className="status-line"><UserRoundCheck size={15} /> Ativo</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="info-strip">
        <Database size={16} />
        <span>Cadastro e alterações continuam sendo administrados na aba <strong>Medicos</strong> da planilha operacional nesta RC.</span>
      </div>
    </section>
  )

  const renderConfiguracoes = () => (
    <div className="settings-grid">
      <section className="settings-card">
        <div className="settings-card-title">
          <div className="settings-icon"><Settings size={19} /></div>
          <div><h2>Operação atual</h2><p>Parâmetros utilizados nesta versão.</p></div>
        </div>
        <div className="settings-list">
          <div><span>Unidade</span><strong>Niterói</strong></div>
          <div><span>Competência</span><strong>Outubro/2026</strong></div>
          <div><span>Fuso horário</span><strong>America/Sao_Paulo</strong></div>
          <div><span>Feriados</span><strong>Remoção automática das datas cadastradas</strong></div>
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-card-title">
          <div className="settings-icon"><Wifi size={19} /></div>
          <div><h2>Integrações</h2><p>Estado observado pelo painel.</p></div>
        </div>
        <div className="integration-list">
          <div className="integration-row">
            <span><Database size={16} /> Google Sheets via n8n</span>
            <strong className={lastSync ? 'integration-ok' : 'integration-off'}>
              {lastSync ? <><ShieldCheck size={15} /> Conectado</> : <><CircleOff size={15} /> Sem leitura</>}
            </strong>
          </div>
          <div className="integration-row">
            <span><MessageSquareText size={16} /> WhatsApp / Evolution</span>
            <strong className="integration-neutral">Validado no envio</strong>
          </div>
          <div className="integration-row">
            <span><FileImage size={16} /> Serviço de evidência</span>
            <strong className="integration-neutral">Sob demanda</strong>
          </div>
        </div>
        <button className="outline-btn settings-refresh" onClick={refreshData} disabled={loading}>
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          Testar leitura dos dados
        </button>
        {lastSync && (
          <span className="last-sync">Última leitura bem-sucedida: {lastSync.toLocaleString('pt-BR')}</span>
        )}
      </section>

      <section className="settings-card settings-wide">
        <div className="settings-card-title">
          <div className="settings-icon"><ClipboardCheck size={19} /></div>
          <div><h2>Modelo operacional da mensagem</h2><p>A prévia final continua sendo montada médico a médico a partir da escala.</p></div>
        </div>
        <div className="message-template">
          <strong>Estrutura atual</strong>
          <p>Saudação → competência → solicitação da unidade → dias/horários da escala → alerta de feriados/férias → pedido de retorno.</p>
        </div>
        <div className="info-strip no-margin">
          <ShieldCheck size={16} />
          <span>Nesta RC, configurações críticas permanecem controladas pelo n8n e pela planilha para evitar alterações acidentais em produção.</span>
        </div>
      </section>
    </div>
  )

  const renderAbertura = () => (
    <>
      <div className="filters-card">
        <div className="field">
          <label>Unidade</label>
          <select defaultValue="Niterói">
            {unidades.map((u) => (
              <option key={u} value={u} disabled={u !== 'Niterói'}>{u}</option>
            ))}
          </select>
          <span className="field-help">Demais unidades estarão disponíveis em versões futuras.</span>
        </div>
        <div className="field">
          <label>Mês</label>
          <select defaultValue="Outubro">
            {meses.map((m) => (
              <option key={m} value={m} disabled={m !== 'Outubro'}>{m}</option>
            ))}
          </select>
          <span className="field-help">Base piloto: Outubro/2026.</span>
        </div>
        <div className="field year-field">
          <label>Ano</label>
          <input value="2026" readOnly />
        </div>
      </div>

      <div className="holiday-notice">
        <CalendarDays size={17} />
        <div>
          <strong>Feriado em Outubro/2026:</strong>
          <span>12/10 — Nossa Senhora Aparecida. A data é removida automaticamente das opções de atendimento.</span>
        </div>
      </div>

      {renderMetrics()}

      <section className="table-card">
        <div className="table-head">
          <div>
            <h2>Médicos — Niterói</h2>
            <p>Outubro de 2026 · operação liberada para os médicos ativos da unidade</p>
          </div>
          <div className="search-box">
            <Search size={17} />
            <input
              placeholder="Buscar médico, especialidade ou CD..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Médico</th>
                <th>Especialidade</th>
                <th>Escala</th>
                <th>Status</th>
                <th>Último envio</th>
                <th className="th-actions">Ação</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan="6" className="table-state"><LoaderCircle size={20} className="spin" /> Carregando dados do Google Sheets...</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan="6" className="table-state">Nenhum médico encontrado.</td></tr>
              )}
              {!loading && filtered.map((doc) => {
                const groups = agruparEscalas(doc.escalas)
                const resumo = groups.map(g => g.label.split('-')[0].trim()).join(' / ')
                return (
                  <tr key={doc.id}>
                    <td>
                      <div className="doctor-cell">
                        <div className="avatar">{doc.nome.split(' ').slice(0, 2).map(n => n[0]).join('')}</div>
                        <div><strong>{doc.nome}</strong><span>CD {doc.cd}</span></div>
                      </div>
                    </td>
                    <td>
                      <div className="specialty-cell">
                        <span>{doc.especialidade}</span>
                        {doc.subespecialidade && <small>{doc.subespecialidade}</small>}
                      </div>
                    </td>
                    <td>
                      {doc.complexa ? (
                        <button className="link-btn" onClick={() => setDetailsDoctor(doc)}>
                          Ver detalhes <ChevronRight size={15} />
                        </button>
                      ) : (
                        <span className="schedule-summary">{resumo}</span>
                      )}
                    </td>
                    <td><Badge status={doc.status} /></td>
                    <td>
                      {doc.ultimoEnvio ? (
                        <div className="date-cell">
                          <strong>{doc.ultimoEnvio.split(' ')[0]}</strong>
                          <span>{doc.ultimoEnvio.split(' ')[1] || ''}</span>
                        </div>
                      ) : <span className="muted">—</span>}
                    </td>
                    <td>
                      <div className="actions">
                        {doc.status === 'nao_enviado' && (
                          <button className="primary-btn" onClick={() => setSelectedDoctor(doc)}>
                            <Send size={15} /> Enviar
                          </button>
                        )}
                        {doc.status === 'aguardando' && (
                          <button className="outline-btn" onClick={() => setSelectedDoctor(doc)}>
                            <RotateCcw size={15} /> Reenviar
                          </button>
                        )}
                        {doc.status === 'respondido' && (
                          <>
                            <button className="outline-btn" onClick={() => setResponseDoctor(doc)}>
                              <MessageSquareText size={15} /> Ver resposta
                            </button>
                            <button className="evidence-btn" onClick={() => openPreview(doc)} disabled={previewLoading}>
                              <FileImage size={15} /> Evidência
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )

  const renderCurrentPage = () => {
    if (activePage === 'dashboard') return renderDashboard()
    if (activePage === 'respondidos') return renderRespondidos()
    if (activePage === 'medicos') return renderMedicos()
    if (activePage === 'configuracoes') return renderConfiguracoes()
    return renderAbertura()
  }

  return (
    <div className="app">
      <aside className={`sidebar ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
        <div className="brand">
          <div className="brand-mark"><Stethoscope size={22} /></div>
          {sidebarOpen && (
            <div>
              <strong>Abertura de Agenda</strong>
            </div>
          )}
        </div>

        <nav>
          <button className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`} onClick={() => setActivePage('dashboard')}>
            <LayoutDashboard size={18} />{sidebarOpen && 'Dashboard'}
          </button>
          <button className={`nav-item ${activePage === 'abertura' ? 'active' : ''}`} onClick={() => setActivePage('abertura')}>
            <CalendarDays size={18} />{sidebarOpen && 'Abertura de Agenda'}
          </button>
          <button className={`nav-item ${activePage === 'respondidos' ? 'active' : ''}`} onClick={() => setActivePage('respondidos')}>
            <MessageSquareText size={18} />{sidebarOpen && 'Respondidos'}
          </button>
          <button className={`nav-item ${activePage === 'medicos' ? 'active' : ''}`} onClick={() => setActivePage('medicos')}>
            <Users size={18} />{sidebarOpen && 'Médicos'}
          </button>
          <button className={`nav-item ${activePage === 'configuracoes' ? 'active' : ''}`} onClick={() => setActivePage('configuracoes')}>
            <Settings size={18} />{sidebarOpen && 'Configurações'}
          </button>
        </nav>

        {sidebarOpen && (
          <div className="sidebar-foot">
            <span>RC</span>
            <strong>v0.7</strong>
          </div>
        )}
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="icon-btn" onClick={() => setSidebarOpen(v => !v)}>
            <Menu size={20} />
          </button>
          <div className="topbar-title">
            <h1>{pageMeta[activePage].title}</h1>
            <p>{pageMeta[activePage].subtitle}</p>
          </div>
          <button className="secondary-btn" onClick={refreshData} disabled={loading}><RefreshCw size={16} className={loading ? 'spin' : ''} /> Atualizar dados</button>
        </header>

        <section className="content">
          {error && (
            <div className="system-alert error-alert"><AlertTriangle size={18} /><span>{error}</span></div>
          )}
          {success && (
            <div className="system-alert success-alert"><CheckCircle2 size={18} /><span>{success}</span></div>
          )}
          {renderCurrentPage()}
        </section>
      </main>

      {selectedDoctor && (
        <Modal onClose={() => setSelectedDoctor(null)} wide>
          <div className="modal-header">
            <span className="eyebrow">Prévia do envio</span>
            <h3>{selectedDoctor.nome}</h3>
            <p>Revise os dados e a mensagem antes do disparo.</p>
          </div>

          <div className="preview-layout">
            <div className="recipient-card">
              <div className="recipient-row"><span>CD Médico</span><strong>{selectedDoctor.cd}</strong></div>
              <div className="recipient-row"><span>Telefone</span><strong>{selectedDoctor.telefone}</strong></div>
              <div className="recipient-row"><span>Unidade</span><strong>Niterói</strong></div>
              <div className="recipient-row"><span>Competência</span><strong>Outubro/2026</strong></div>
            </div>

            <div className="whatsapp-preview">
              <div className="wa-top">
                <div className="avatar small">{selectedDoctor.nome.split(' ').slice(0,2).map(n => n[0]).join('')}</div>
                <div><strong>{selectedDoctor.nomeCurto}</strong><span>WhatsApp</span></div>
              </div>
              <div className="wa-body">
                <div className="wa-bubble">
                  <pre>{gerarMensagem(selectedDoctor)}</pre>
                  <span className="wa-time">prévia</span>
                </div>
              </div>
            </div>
          </div>

          <div className="test-safety-note">
            <LockKeyhole size={16} />
            <span>Revise médico, telefone, competência e mensagem antes de confirmar o envio.</span>
          </div>

          <div className="modal-actions">
            <button className="ghost-btn" onClick={() => setSelectedDoctor(null)} disabled={sending}>Cancelar</button>
            <button className="primary-btn big" onClick={confirmSend} disabled={sending}>
              {sending ? <LoaderCircle size={16} className="spin" /> : <Send size={16} />}
              {sending ? 'Enviando...' : 'Enviar mensagem'}
            </button>
          </div>
        </Modal>
      )}

      {previewDoctor && (
        <Modal onClose={closePreview}>
          <div className="modal-header">
            <span className="eyebrow">Evidência da conversa</span>
            <h3>{previewDoctor.nome}</h3>
            <p>Posicione a conversa no trecho desejado e, quando estiver satisfeito com o enquadramento, baixe a evidência.</p>
          </div>

          <div className="preview-shell">
            <div className="preview-stage">
              {previewImage ? (
                <img src={previewImage} alt={`Preview da conversa de ${previewDoctor.nome}`} />
              ) : (
                <div className="preview-placeholder">
                  <LoaderCircle size={24} className="spin" />
                  <span>Abrindo conversa...</span>
                </div>
              )}
              {previewLoading && previewImage && (
                <div className="preview-loading">
                  <LoaderCircle size={22} className="spin" />
                  <span>{previewAction || 'Atualizando preview...'}</span>
                </div>
              )}
            </div>

            <div className="preview-controls">
              <button className="ghost-btn" onClick={() => scrollPreview('cima', 'longo')} disabled={previewLoading}>
                ↑↑ Subir bastante
              </button>
              <button className="ghost-btn" onClick={() => scrollPreview('cima', 'curto')} disabled={previewLoading}>
                ↑ Subir
              </button>
              <button className="ghost-btn" onClick={() => scrollPreview('baixo', 'curto')} disabled={previewLoading}>
                ↓ Descer
              </button>
              <button className="ghost-btn" onClick={() => scrollPreview('baixo', 'longo')} disabled={previewLoading}>
                ↓↓ Descer bastante
              </button>
            </div>
          </div>

          <div className="modal-actions preview-actions">
            <button className="ghost-btn" onClick={closePreview} disabled={previewLoading}>Fechar</button>
            <button className="primary-btn" onClick={capturePreview} disabled={previewLoading || !previewImage}>
              {previewLoading && previewAction.includes('Capturando')
                ? <LoaderCircle size={16} className="spin" />
                : <FileImage size={16} />}
              Baixar evidência
            </button>
          </div>
        </Modal>
      )}

      {responseDoctor && (
        <Modal onClose={() => setResponseDoctor(null)}>
          <div className="modal-header">
            <span className="eyebrow">Resposta recebida</span>
            <h3>{responseDoctor.nome}</h3>
            <p>{responseDoctor.especialidade} · CD {responseDoctor.cd}</p>
          </div>

          <div className="response-card">
            <div className="response-message">
              <MessageSquareText size={18} />
              <div>
                <span>Mensagem do médico</span>
                <p>{responseDoctor.respostaRecebida || 'Resposta registrada sem texto.'}</p>
              </div>
            </div>

            <div className="response-meta">
              <div>
                <span>Respondido em</span>
                <strong>{responseDoctor.respondeuEm || '—'}</strong>
              </div>
              <div>
                <span>ID da mensagem</span>
                <strong className="message-id">{responseDoctor.idMensagemResposta || '—'}</strong>
              </div>
              <div>
                <span>Evidência</span>
                <strong>{responseDoctor.evidenciaGerada || 'Não'}</strong>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button className="ghost-btn" onClick={() => setResponseDoctor(null)}>Fechar</button>
          </div>
        </Modal>
      )}

      {detailsDoctor && (
        <Modal onClose={() => setDetailsDoctor(null)}>
          <div className="modal-header">
            <span className="eyebrow">Detalhes da escala</span>
            <h3>{detailsDoctor.nome}</h3>
            <p>{detailsDoctor.especialidade} · CD {detailsDoctor.cd}</p>
          </div>
          <div className="schedule-list">
            {agruparEscalas(detailsDoctor.escalas).map((grupo) => (
              <div className="schedule-day" key={grupo.label}>
                <strong>{grupo.label}</strong>
                {grupo.itens.map((e, i) => (
                  <div className="schedule-line" key={i}>
                    <span>{e.especialidade}</span>
                    <b>{e.inicio} às {e.fim}</b>
                    <span className="lunch-label">{e.almoco ? `Almoço: ${e.almoco}` : 'Sem almoço'}</span>
                    {e.obs && <em>{e.obs}</em>}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="modal-actions">
            <button className="ghost-btn" onClick={() => setDetailsDoctor(null)}>Fechar</button>
            <button className="primary-btn" onClick={() => { setDetailsDoctor(null); setSelectedDoctor(detailsDoctor) }}>
              <Send size={15} /> Preparar envio
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default App
