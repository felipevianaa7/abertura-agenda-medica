import { n8nUrl, proxyJson } from './_proxy.js'

export async function GET(request) {
  const url = new URL(request.url)
  const params = new URLSearchParams()
  params.set('unidade', url.searchParams.get('unidade') || 'Niterói')
  params.set('competencia', url.searchParams.get('competencia') || '2026-10')
  return proxyJson(request, n8nUrl(`/webhook/agenda-escalas?${params.toString()}`))
}
