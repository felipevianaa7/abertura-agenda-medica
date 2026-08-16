import { n8nUrl } from './_proxy.js'

export async function GET(request) {
  const url = new URL(request.url)
  const path = String(url.searchParams.get('path') || '')

  if (!/^\/webhook\/agenda-preview-imagem\?arquivo=/.test(path)) {
    return Response.json({ ok:false, erro:'CAMINHO_PREVIEW_INVALIDO' }, { status:400 })
  }

  const upstream = await fetch(n8nUrl(path))
  if (!upstream.ok) {
    return Response.json({ ok:false, erro:'PREVIEW_NAO_ENCONTRADO' }, { status: upstream.status })
  }

  const bytes = await upstream.arrayBuffer()
  return new Response(bytes, {
    status: 200,
    headers: {
      'Content-Type': upstream.headers.get('content-type') || 'image/png',
      'Cache-Control': 'no-store',
    },
  })
}
