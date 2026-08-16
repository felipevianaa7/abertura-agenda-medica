import React, { useMemo, useState } from 'react'
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


const doctorsSeed = [
  {
    id: 'teste-felipe',
    nome: 'FELIPE VIANA RIBEIRO',
    nomeCurto: 'Dr. Felipe',
    especialidade: 'GINECOLOGIA',
    subespecialidade: '',
    cd: '101010100',
    telefone: '21984142559',
    status: 'nao_enviado',
    ultimoEnvio: null,
    respondeuEm: null,
    teste: true,
    escalas: [
      { dia: 1, label: 'SEGUNDA-FEIRA', especialidade: 'GINECOLOGIA', inicio: '08:00', fim: '18:00', almoco: null, datas: ['05/10','12/10','19/10','26/10'] },
    ],
  },
  {
    id: 'andre-hahn',
    nome: 'ANDRE HAHN MAGARINOS TORRES',
    nomeCurto: 'Dr. André',
    especialidade: 'GINECOLOGIA',
    subespecialidade: '',
    cd: '493446970',
    telefone: '21981577711',
    status: 'nao_enviado',
    ultimoEnvio: null,
    respondeuEm: null,
    escalas: [
      { dia: 2, label: 'TERÇA-FEIRA', especialidade: 'GINECOLOGIA', inicio: '08:00', fim: '18:00', almoco: '12:00 às 12:30', datas: ['06/10','13/10','20/10','27/10'] },
      { dia: 4, label: 'QUINTA-FEIRA', especialidade: 'GINECOLOGIA', inicio: '08:00', fim: '18:00', almoco: '12:00 às 12:30', datas: ['01/10','08/10','15/10','22/10','29/10'] },
    ],
  },
  {
    id: 'bruno',
    nome: 'BRUNO GARRETT BENTO',
    nomeCurto: 'Dr. Bruno',
    especialidade: 'NEUROCIRURGIA',
    subespecialidade: '',
    cd: '509666746',
    telefone: '21996154370',
    status: 'nao_enviado',
    ultimoEnvio: null,
    respondeuEm: null,
    escalas: [
      { dia: 1, label: 'SEGUNDA-FEIRA', especialidade: 'NEUROCIRURGIA', inicio: '13:00', fim: '17:00', almoco: null, datas: ['05/10','12/10','19/10','26/10'] },
    ],
  },
  {
    id: 'diana',
    nome: 'DIANA GUIMARAES DE SALES MATHEUS',
    nomeCurto: 'Dra. Diana',
    especialidade: 'GERIATRIA',
    subespecialidade: '',
    cd: '429017559',
    telefone: '21964067244',
    status: 'nao_enviado',
    ultimoEnvio: null,
    respondeuEm: null,
    escalas: [
      { dia: 2, label: 'TERÇA-FEIRA', especialidade: 'GERIATRIA', inicio: '08:00', fim: '17:00', almoco: null, datas: ['06/10','13/10','20/10','27/10'] },
    ],
  },
  {
    id: 'diego',
    nome: 'DIEGO PEDROSO SOARES DE QUEIROZ',
    nomeCurto: 'Dr. Diego',
    especialidade: 'CARDIOLOGIA',
    subespecialidade: '',
    cd: '268127622',
    telefone: '21991122581',
    status: 'nao_enviado',
    ultimoEnvio: null,
    respondeuEm: null,
    escalas: [
      { dia: 3, label: 'QUARTA-FEIRA', especialidade: 'CARDIOLOGIA', inicio: '13:00', fim: '17:00', almoco: null, datas: ['07/10','14/10','21/10','28/10'] },
    ],
  },
  {
    id: 'eduardo',
    nome: 'EDUARDO NEVES DE OLIVEIRA',
    nomeCurto: 'Dr. Eduardo',
    especialidade: 'GASTROENTEROLOGIA',
    subespecialidade: '',
    cd: '256471498',
    telefone: '21975296641',
    status: 'nao_enviado',
    ultimoEnvio: null,
    respondeuEm: null,
    escalas: [
      { dia: 1, label: 'SEGUNDA-FEIRA', especialidade: 'GASTROENTEROLOGIA', inicio: '08:00', fim: '17:00', almoco: '12:00 às 12:30', datas: ['05/10','12/10','19/10','26/10'] },
    ],
  },
  {
    id: 'emanuel',
    nome: 'EMANUEL DECNOP MARTINS JUNIOR',
    nomeCurto: 'Dr. Emanuel',
    especialidade: 'OBSTETRICIA',
    subespecialidade: '',
    cd: '510237497',
    telefone: '21998117768',
    status: 'nao_enviado',
    ultimoEnvio: null,
    respondeuEm: null,
    escalas: [
      { dia: 5, label: 'SEXTA-FEIRA', especialidade: 'OBSTETRICIA', inicio: '08:00', fim: '17:00', almoco: '12:30 às 13:00', datas: ['02/10','09/10','16/10','23/10','30/10'] },
    ],
  },
  {
    id: 'fernanda',
    nome: 'FERNANDA FERREIRA DA SILVA VILA NOVA',
    nomeCurto: 'Dra. Fernanda',
    especialidade: 'GINECOLOGIA / OBSTETRÍCIA',
    subespecialidade: '',
    cd: '256484883',
    telefone: '21981691391',
    status: 'nao_enviado',
    ultimoEnvio: null,
    respondeuEm: null,
    complexa: true,
    escalas: [
      { dia: 2, label: 'TERÇA-FEIRA', especialidade: 'GINECOLOGIA', inicio: '12:00', fim: '18:00', almoco: null, datas: ['13/10','27/10'], obs: 'Quinzenal' },
      { dia: 3, label: 'QUARTA-FEIRA', especialidade: 'GINECOLOGIA', inicio: '08:30', fim: '18:00', almoco: null, datas: ['07/10','14/10','21/10','28/10'] },
      { dia: 4, label: 'QUINTA-FEIRA', especialidade: 'GINECOLOGIA', inicio: '12:00', fim: '16:00', almoco: null, datas: ['01/10','08/10','15/10','22/10','29/10'] },
      { dia: 4, label: 'QUINTA-FEIRA', especialidade: 'OBSTETRÍCIA', inicio: '08:00', fim: '12:00', almoco: null, datas: ['01/10','08/10','15/10','22/10','29/10'] },
      { dia: 5, label: 'SEXTA-FEIRA', especialidade: 'GINECOLOGIA', inicio: '08:30', fim: '16:00', almoco: null, datas: ['02/10','09/10','16/10','23/10','30/10'] },
      { dia: 5, label: 'SEXTA-FEIRA', especialidade: 'OBSTETRÍCIA', inicio: '16:00', fim: '18:00', almoco: null, datas: ['02/10','09/10','16/10','23/10','30/10'] },
    ],
  },
  {
    id: 'fernando',
    nome: 'FERNANDO MARCIO DE ABREU AZEVEDO',
    nomeCurto: 'Dr. Fernando',
    especialidade: 'PEDIATRIA',
    subespecialidade: '',
    cd: '412693181',
    telefone: '21998538526',
    status: 'nao_enviado',
    ultimoEnvio: null,
    respondeuEm: null,
    escalas: [
      { dia: 3, label: 'QUARTA-FEIRA', especialidade: 'PEDIATRIA', inicio: '08:00', fim: '18:00', almoco: '12:00 às 13:00', datas: ['07/10','14/10','21/10','28/10'] },
    ],
  },
  {
    id: 'geisilaine',
    nome: 'GEISILAINE DA ROCHA BRANCO DE BRITO',
    nomeCurto: 'Dra. Geisilaine',
    especialidade: 'DERMATOLOGIA',
    subespecialidade: '',
    cd: '256480489',
    telefone: '21984706030',
    status: 'nao_enviado',
    ultimoEnvio: null,
    respondeuEm: null,
    escalas: [
      { dia: 3, label: 'QUARTA-FEIRA', especialidade: 'DERMATOLOGIA', inicio: '08:00', fim: '17:00', almoco: null, datas: ['07/10','14/10','21/10','28/10'] },
    ],
  },
  {
    id: 'lucas',
    nome: 'LUCAS EMANUEL DE OLIVEIRA MORAES VASQUES',
    nomeCurto: 'Dr. Lucas',
    especialidade: 'ORTOPEDIA',
    subespecialidade: 'JOELHO',
    cd: '256461280',
    telefone: '21997188157',
    status: 'nao_enviado',
    ultimoEnvio: null,
    respondeuEm: null,
    escalas: [
      { dia: 4, label: 'QUINTA-FEIRA', especialidade: 'ORTOPEDIA - JOELHO', inicio: '08:00', fim: '12:00', almoco: null, datas: ['01/10','08/10','15/10','22/10','29/10'] },
    ],
  },
  {
    id: 'marcelo',
    nome: 'MARCELO FLAVIO GOMES JARDIM FILHO',
    nomeCurto: 'Dr. Marcelo',
    especialidade: 'CARDIOLOGIA',
    subespecialidade: '',
    cd: '256464491',
    telefone: '21988083735',
    status: 'nao_enviado',
    ultimoEnvio: null,
    respondeuEm: null,
    escalas: [
      { dia: 5, label: 'SEXTA-FEIRA', especialidade: 'CARDIOLOGIA', inicio: '08:00', fim: '18:00', almoco: null, datas: ['02/10','09/10','16/10','23/10','30/10'] },
    ],
  },
  {
    id: 'maria-clara',
    nome: 'MARIA CLARA MEDEIROS CRUZ DE LIMA MARTINS',
    nomeCurto: 'Dra. Maria Clara',
    especialidade: 'CLINICO GERAL',
    subespecialidade: '',
    cd: '256463401',
    telefone: '21980370679',
    status: 'nao_enviado',
    ultimoEnvio: null,
    respondeuEm: null,
    escalas: [
      { dia: 2, label: 'TERÇA-FEIRA', especialidade: 'CLINICO GERAL', inicio: '08:00', fim: '18:00', almoco: '12:40 às 13:00', datas: ['06/10','13/10','20/10','27/10'] },
    ],
  },
  {
    id: 'naira',
    nome: 'NAIRA VANESSA ANOMAL GONZALEZ',
    nomeCurto: 'Dra. Naira',
    especialidade: 'PEDIATRIA',
    subespecialidade: '',
    cd: '256461689',
    telefone: '21981462493',
    status: 'nao_enviado',
    ultimoEnvio: null,
    respondeuEm: null,
    escalas: [
      { dia: 1, label: 'SEGUNDA-FEIRA', especialidade: 'PEDIATRIA', inicio: '08:00', fim: '13:00', almoco: null, datas: ['05/10','12/10','19/10','26/10'] },
    ],
  },
  {
    id: 'neoclebio',
    nome: 'NEOCLEBIO DOS SANTOS SANCHES',
    nomeCurto: 'Dr. Neoclebio',
    especialidade: 'GASTROENTEROLOGIA',
    subespecialidade: '',
    cd: '263494473',
    telefone: '21981242458',
    status: 'nao_enviado',
    ultimoEnvio: null,
    respondeuEm: null,
    escalas: [
      { dia: 2, label: 'TERÇA-FEIRA', especialidade: 'GASTROENTEROLOGIA', inicio: '08:00', fim: '17:00', almoco: '12:30 às 13:00', datas: ['06/10','20/10'], obs: 'Quinzenal' },
    ],
  },
  {
    id: 'vinicius',
    nome: 'VINICIUS SANTOS LIMA',
    nomeCurto: 'Dr. Vinicius',
    especialidade: 'ORTOPEDIA',
    subespecialidade: 'OMBRO',
    cd: '263497944',
    telefone: '21979435645',
    status: 'nao_enviado',
    ultimoEnvio: null,
    respondeuEm: null,
    escalas: [
      { dia: 4, label: 'QUINTA-FEIRA', especialidade: 'ORTOPEDIA - OMBRO', inicio: '13:00', fim: '17:00', almoco: null, datas: ['01/10','08/10','15/10','22/10','29/10'] },
    ],
  },
]


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
  const [doctors, setDoctors] = useState(doctorsSeed)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [query, setQuery] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [detailsDoctor, setDetailsDoctor] = useState(null)

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

  const confirmSend = () => {
    const now = new Date()
    const stamp = now.toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
    setDoctors((prev) => prev.map((d) =>
      d.id === selectedDoctor.id
        ? { ...d, status: 'aguardando', ultimoEnvio: stamp }
        : d
    ))
    setSelectedDoctor(null)
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
          <button className="nav-item"><LayoutDashboard size={18} />{sidebarOpen && 'Dashboard'}</button>
          <button className="nav-item active"><CalendarDays size={18} />{sidebarOpen && 'Abertura de Agenda'}</button>
          <button className="nav-item"><MessageSquareText size={18} />{sidebarOpen && 'Respondidos'}</button>
          <button className="nav-item"><Users size={18} />{sidebarOpen && 'Médicos'}</button>
          <button className="nav-item"><Settings size={18} />{sidebarOpen && 'Configurações'}</button>
        </nav>

        {sidebarOpen && (
          <div className="sidebar-foot">
            <span>Protótipo</span>
            <strong>v0.1</strong>
          </div>
        )}
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="icon-btn" onClick={() => setSidebarOpen(v => !v)}>
            <Menu size={20} />
          </button>
          <div className="topbar-title">
            <h1>Abertura de Agenda Médica</h1>
            <p>Controle de solicitações, respostas e evidências</p>
          </div>
          <button className="secondary-btn"><RefreshCw size={16} /> Atualizar dados</button>
        </header>

        <section className="content">
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

          <section className="table-card">
            <div className="table-head">
              <div>
                <h2>Médicos — Niterói</h2>
                <p>Outubro de 2026 · dados reais do CCNIT + 1 médico de teste</p>
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
                  {filtered.map((doc) => {
                    const groups = agruparEscalas(doc.escalas)
                    const resumo = groups.map(g => g.label.split('-')[0].trim()).join(' / ')
                    return (
                      <tr key={doc.id} className={doc.teste ? 'test-row' : ''}>
                        <td>
                          <div className="doctor-cell">
                            <div className="avatar">{doc.nome.split(' ').slice(0, 2).map(n => n[0]).join('')}</div>
                            <div>
                              <strong>{doc.nome}</strong>
                              <span>CD {doc.cd}</span>
                              {doc.teste && <Badge teste />}
                            </div>
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
                                <button className="outline-btn"><MessageSquareText size={15} /> Ver resposta</button>
                                <button className="evidence-btn"><FileImage size={15} /> Evidência</button>
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

          <div className="modal-actions">
            <button className="ghost-btn" onClick={() => setSelectedDoctor(null)}>Cancelar</button>
            <button className="primary-btn big" onClick={confirmSend}><Send size={16} /> Enviar mensagem</button>
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
