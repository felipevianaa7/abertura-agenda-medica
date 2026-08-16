import { n8nUrl, proxyJson } from './_proxy.js'

export async function POST(request) {
  const body = await request.json().catch(() => ({}))

  // Segunda trava no próprio site/Vercel, além da trava já existente no n8n.
  if (String(body.cd_medico || '') !== '101010100') {
    return Response.json({
      ok: false,
      erro: 'SITE_TESTE_BLOQUEOU_MEDICO_REAL',
      mensagem: 'Modo de teste: apenas o médico Felipe pode receber mensagens.',
    }, { status: 403 })
  }

  return proxyJson(request, n8nUrl('/webhook/agenda-enviar-teste'), {
    method: 'POST',
    body: JSON.stringify({
      cd_medico: '101010100',
      competencia: body.competencia || '2026-10',
    }),
  })
}
