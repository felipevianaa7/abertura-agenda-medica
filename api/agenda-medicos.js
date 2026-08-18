import {n8nUrl,proxyJson} from './_proxy.js'
export async function GET(request){return proxyJson(request,n8nUrl('/webhook/agenda-medicos'))}
