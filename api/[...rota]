const DEFAULT_N8N_BASE_URL = 'https://n8n.bibliaxp.store'

function n8nUrl(path) {
  const base = (process.env.N8N_BASE_URL || DEFAULT_N8N_BASE_URL).replace(/\/$/, '')
  return `${base}${path}`
}

async function readJson(request) {
  return request.json().catch(() => ({}))
}

async function proxyJson(targetUrl, init = {}) {
  const response = await fetch(targetUrl, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })

  const text = await response.text()
  let data

  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = {
      ok: false,
      error: text || 'Resposta inválida do n8n.',
    }
  }

  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

function getRoute(request) {
  const url = new URL(request.url)
  return url.pathname
    .replace(/^\/api\//, '')
    .replace(/\/+$/, '')
}

function badMethod() {
  return Response.json(
    {
      ok: false,
      erro: 'METODO_NAO_PERMITIDO',
    },
    { status: 405 }
  )
}

function notFound(route) {
  return Response.json(
    {
      ok: false,
      erro: 'ROTA_API_NAO_ENCONTRADA',
      rota: route,
    },
    { status: 404 }
  )
}

async function proxyBinary(targetUrl, init, {
  fallbackType = 'image/png',
  disposition = null,
} = {}) {
  let upstream

  try {
    upstream = await fetch(targetUrl, init)
  } catch {
    return Response.json(
      {
        ok: false,
        erro: 'SERVICO_INDISPONIVEL',
        mensagem: 'Não foi possível acessar o serviço solicitado.',
      },
      { status: 502 }
    )
  }

  if (!upstream.ok) {
    const contentType = upstream.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      const data = await upstream.json().catch(() => ({}))
      return Response.json(data, { status: upstream.status })
    }

    const text = await upstream.text().catch(() => '')

    return Response.json(
      {
        ok: false,
        erro: 'ERRO_SERVICO',
        mensagem: text || 'O serviço retornou uma resposta inválida.',
      },
      { status: upstream.status }
    )
  }

  const bytes = await upstream.arrayBuffer()

  if (!bytes.byteLength) {
    return Response.json(
      {
        ok: false,
        erro: 'ARQUIVO_VAZIO',
      },
      { status: 502 }
    )
  }

  const headers = {
    'Content-Type': upstream.headers.get('content-type') || fallbackType,
    'Cache-Control': 'no-store, max-age=0',
  }

  if (disposition) {
    headers['Content-Disposition'] = disposition
  }

  return new Response(bytes, {
    status: 200,
    headers,
  })
}

export async function GET(request) {
  const route = getRoute(request)
  const url = new URL(request.url)

  if (route === 'agenda-medicos') {
    return proxyJson(n8nUrl('/webhook/agenda-medicos'))
  }

  if (route === 'agenda-escalas') {
    const params = new URLSearchParams()
    params.set('unidade', url.searchParams.get('unidade') || 'Niterói')
    params.set('competencia', url.searchParams.get('competencia') || '2026-10')

    return proxyJson(
      n8nUrl(`/webhook/agenda-escalas?${params.toString()}`)
    )
  }

  if (route === 'agenda-solicitacoes') {
    const params = new URLSearchParams()
    params.set('unidade', url.searchParams.get('unidade') || 'Niterói')
    params.set('competencia', url.searchParams.get('competencia') || '2026-10')

    return proxyJson(
      n8nUrl(`/webhook/agenda-solicitacoes?${params.toString()}`)
    )
  }

  if (route === 'agenda-competencias') {
    const unidade = url.searchParams.get('unidade') || 'Niterói'

    return proxyJson(
      n8nUrl(
        `/webhook/agenda-competencias?unidade=${encodeURIComponent(unidade)}`
      )
    )
  }

  if (route === 'agenda-preview-imagem') {
    const arquivo = String(url.searchParams.get('arquivo') || '').trim()

    if (!/^preview-\d{12,13}-\d+\.png$/.test(arquivo)) {
      return Response.json(
        {
          ok: false,
          erro: 'ARQUIVO_PREVIEW_INVALIDO',
          mensagem: 'Arquivo de preview inválido.',
        },
        { status: 400 }
      )
    }

    return proxyBinary(
      n8nUrl(
        `/webhook/agenda-preview-imagem?arquivo=${encodeURIComponent(arquivo)}`
      ),
      { method: 'GET' }
    )
  }

  return notFound(route)
}

export async function POST(request) {
  const route = getRoute(request)
  const body = await readJson(request)

  if (route === 'agenda-enviar-teste') {
    return proxyJson(
      n8nUrl('/webhook/agenda-enviar-teste'),
      {
        method: 'POST',
        body: JSON.stringify({
          cd_medico: String(body.cd_medico || ''),
          competencia: String(body.competencia || '2026-10'),
        }),
      }
    )
  }

  if (route === 'agenda-medico-salvar') {
    return proxyJson(
      n8nUrl('/webhook/agenda-medico-salvar'),
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    )
  }

  if (route === 'agenda-medico-status') {
    return proxyJson(
      n8nUrl('/webhook/agenda-medico-status'),
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    )
  }

  if (route === 'agenda-escala-fixa-salvar') {
    return proxyJson(
      n8nUrl('/webhook/agenda-escala-fixa-salvar'),
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    )
  }

  if (route === 'agenda-escala-fixa-remover') {
    return proxyJson(
      n8nUrl('/webhook/agenda-escala-fixa-remover'),
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    )
  }

  if (route === 'agenda-escala-confirmar') {
    return proxyJson(
      n8nUrl('/webhook/agenda-escala-confirmar'),
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    )
  }

  if (
    route === 'agenda-preview-iniciar' ||
    route === 'agenda-preview-rolar' ||
    route === 'agenda-preview-fechar'
  ) {
    const cd = String(body.cd_medico || '').trim()

    if (!cd) {
      return Response.json(
        {
          ok: false,
          erro: 'CD_MEDICO_NAO_INFORMADO',
        },
        { status: 400 }
      )
    }

    let payload = { cd_medico: cd }

    if (route === 'agenda-preview-rolar') {
      payload = {
        cd_medico: cd,
        direcao: String(body.direcao || ''),
        intensidade: String(body.intensidade || 'curto'),
      }
    }

    return proxyJson(
      n8nUrl(`/webhook/${route}`),
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    )
  }

  if (route === 'agenda-preview-capturar') {
    const cd = String(body.cd_medico || '').trim()

    if (!cd) {
      return Response.json(
        {
          ok: false,
          erro: 'CD_MEDICO_NAO_INFORMADO',
        },
        { status: 400 }
      )
    }

    return proxyBinary(
      n8nUrl('/webhook/agenda-preview-capturar'),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cd_medico: cd }),
      },
      {
        disposition: 'attachment; filename="evidencia-trecho.png"',
      }
    )
  }

  if (route === 'agenda-evidencia-teste') {
    const cd = String(body.cd_medico || '').trim()

    if (!cd) {
      return Response.json(
        {
          ok: false,
          erro: 'CD_MEDICO_NAO_INFORMADO',
        },
        { status: 400 }
      )
    }

    return proxyBinary(
      n8nUrl('/webhook/agenda-evidencia-teste'),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cd_medico: cd }),
      },
      {
        disposition: 'attachment; filename="evidencia-whatsapp.png"',
      }
    )
  }

  return notFound(route)
}

export async function PUT() {
  return badMethod()
}

export async function PATCH() {
  return badMethod()
}

export async function DELETE() {
  return badMethod()
}
