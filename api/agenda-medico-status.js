import {n8nUrl,proxyJson} from './_proxy.js'
export async function POST(request){const b=await request.json().catch(()=>({}));return proxyJson(request,n8nUrl('/webhook/agenda-medico-status'),{method:'POST',body:JSON.stringify(b)})}
