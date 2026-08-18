import {n8nUrl,proxyJson} from './_proxy.js'
export async function GET(request){const u=new URL(request.url);const p=new URLSearchParams({unidade:u.searchParams.get('unidade')||'Niterói',competencia:u.searchParams.get('competencia')||'2026-10'});return proxyJson(request,n8nUrl(`/webhook/agenda-escalas?${p}`))}
