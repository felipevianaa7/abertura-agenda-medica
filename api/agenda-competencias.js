import {n8nUrl,proxyJson} from './_proxy.js'
export async function GET(request){const u=new URL(request.url);return proxyJson(request,n8nUrl(`/webhook/agenda-competencias?unidade=${encodeURIComponent(u.searchParams.get('unidade')||'Niterói')}`))}
