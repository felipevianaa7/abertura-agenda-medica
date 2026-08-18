import {n8nUrl,proxyJson} from './_proxy.js'
export async function POST(request){const b=await request.json().catch(()=>({}));return proxyJson(request,n8nUrl('/webhook/agenda-enviar-teste'),{method:'POST',body:JSON.stringify({cd_medico:String(b.cd_medico||''),competencia:String(b.competencia||'2026-10')})})}
