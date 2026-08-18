import { n8nUrl } from './_proxy.js'

export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const cd = String(body.cd_medico || '').trim()
  if (!cd) return Response.json({ ok:false, erro:'CD_MEDICO_NAO_INFORMADO' }, { status:400 })
  const upstream = await fetch(n8nUrl('/webhook/agenda-evidencia-teste'), {
    method:'POST', headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({ cd_medico: cd }),
  })
  if (!upstream.ok) return Response.json(await upstream.json().catch(() => ({})), { status: upstream.status })
  const bytes = await upstream.arrayBuffer()
  return new Response(bytes, { status:200, headers:{
    'Content-Type': upstream.headers.get('content-type') || 'image/png',
    'Content-Disposition':'attachment; filename="evidencia-whatsapp.png"',
    'Cache-Control':'no-store',
  }})
}
