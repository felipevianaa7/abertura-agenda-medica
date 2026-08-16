import { n8nUrl } from './_proxy.js'

export async function POST(request) {
  const body = await request.json().catch(() => ({}))

  // Trava do MVP também no frontend/Vercel.
  if (String(body.cd_medico || '') !== '101010100') {
    return Response.json({
      ok: false,
      erro: 'SITE_EVIDENCIA_BLOQUEOU_MEDICO_REAL',
      mensagem: 'Modo de teste: a evidência só está liberada para o médico de teste.',
    }, { status: 403 })
  }

  let upstream
  try {
    upstream = await fetch(n8nUrl('/webhook/agenda-evidencia-teste'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cd_medico: '101010100' }),
    })
  } catch {
    return Response.json({
      ok: false,
      erro: 'N8N_INDISPONIVEL',
      mensagem: 'Não foi possível conectar ao serviço de evidência.',
    }, { status: 502 })
  }

  if (!upstream.ok) {
    const contentType = upstream.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      const data = await upstream.json().catch(() => ({}))
      return Response.json(data, { status: upstream.status })
    }

    const text = await upstream.text().catch(() => '')
    return Response.json({
      ok: false,
      erro: 'ERRO_EVIDENCIA_N8N',
      mensagem: text || 'O n8n não conseguiu gerar a evidência.',
    }, { status: upstream.status })
  }

  const bytes = await upstream.arrayBuffer()
  if (!bytes.byteLength) {
    return Response.json({
      ok: false,
      erro: 'EVIDENCIA_VAZIA',
      mensagem: 'O serviço respondeu sem o arquivo de evidência.',
    }, { status: 502 })
  }

  return new Response(bytes, {
    status: 200,
    headers: {
      'Content-Type': upstream.headers.get('content-type') || 'image/png',
      'Content-Disposition': 'attachment; filename="evidencia-whatsapp.png"',
      'Cache-Control': 'no-store',
    },
  })
}
