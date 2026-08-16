import { n8nUrl } from './_proxy.js'

export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const cd = String(body.cd_medico || '')

  if (cd !== '101010100') {
    return Response.json({ ok:false, erro:'SITE_PREVIEW_BLOQUEOU_MEDICO_REAL', mensagem:'Modo de teste: preview liberado apenas para o médico de teste.' }, { status:403 })
  }

  const upstream = await fetch(n8nUrl('/webhook/agenda-preview-iniciar'), {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({ cd_medico: cd }),
  })

  const data = await upstream.json().catch(() => ({}))
  return Response.json(data, { status: upstream.status })
}
