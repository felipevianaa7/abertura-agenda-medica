import { proxyJson } from './_proxy.js'

export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  return proxyJson('/webhook/agenda-enviar-teste', {
    method: 'POST',
    body: JSON.stringify({
      cd_medico: String(body.cd_medico || ''),
      competencia: String(body.competencia || '2026-10'),
    }),
  })
}
