import { n8nUrl } from './_proxy.js'

export async function GET(request) {
  const url = new URL(request.url)
  const arquivo = String(url.searchParams.get('arquivo') || '').trim()

  // Trava específica do preview de teste.
  if (!/^preview-5521984142559-\d+\.png$/.test(arquivo)) {
    return Response.json({
      ok: false,
      erro: 'ARQUIVO_PREVIEW_INVALIDO',
      mensagem: 'Arquivo de preview inválido.',
    }, { status: 400 })
  }

  let upstream
  try {
    upstream = await fetch(
      n8nUrl(`/webhook/agenda-preview-imagem?arquivo=${encodeURIComponent(arquivo)}`)
    )
  } catch {
    return Response.json({
      ok: false,
      erro: 'N8N_PREVIEW_INDISPONIVEL',
      mensagem: 'Não foi possível buscar a imagem de preview.',
    }, { status: 502 })
  }

  if (!upstream.ok) {
    const contentType = upstream.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      const data = await upstream.json().catch(() => ({}))
      return Response.json(data, { status: upstream.status })
    }

    return Response.json({
      ok: false,
      erro: 'PREVIEW_NAO_ENCONTRADO',
      mensagem: 'O preview não pôde ser carregado.',
    }, { status: upstream.status })
  }

  const bytes = await upstream.arrayBuffer()

  if (!bytes.byteLength) {
    return Response.json({
      ok: false,
      erro: 'PREVIEW_VAZIO',
      mensagem: 'O preview foi retornado sem conteúdo.',
    }, { status: 502 })
  }

  return new Response(bytes, {
    status: 200,
    headers: {
      'Content-Type': upstream.headers.get('content-type') || 'image/png',
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}
