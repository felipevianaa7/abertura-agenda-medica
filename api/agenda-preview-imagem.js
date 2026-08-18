import { n8nUrl } from './_proxy.js'
export async function GET(request){
  const url=new URL(request.url);const arquivo=String(url.searchParams.get('arquivo')||'').trim()
  if(!/^preview-\d{12,13}-\d+\.png$/.test(arquivo))return Response.json({ok:false,erro:'ARQUIVO_PREVIEW_INVALIDO',mensagem:'Arquivo de preview inválido.'},{status:400})
  let upstream;try{upstream=await fetch(n8nUrl(`/webhook/agenda-preview-imagem?arquivo=${encodeURIComponent(arquivo)}`))}catch{return Response.json({ok:false,erro:'N8N_PREVIEW_INDISPONIVEL'},{status:502})}
  if(!upstream.ok){const ct=upstream.headers.get('content-type')||'';if(ct.includes('application/json'))return Response.json(await upstream.json().catch(()=>({})),{status:upstream.status});return Response.json({ok:false,erro:'PREVIEW_NAO_ENCONTRADO'},{status:upstream.status})}
  const bytes=await upstream.arrayBuffer();if(!bytes.byteLength)return Response.json({ok:false,erro:'PREVIEW_VAZIO'},{status:502})
  return new Response(bytes,{status:200,headers:{'Content-Type':upstream.headers.get('content-type')||'image/png','Cache-Control':'no-store, max-age=0'}})
}
