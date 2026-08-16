# Abertura de Agenda Médica — v0.4 integrada

Esta versão liga o painel React ao n8n e ao Google Sheets operacional.

## Arquitetura

Painel React (Vercel) → `/api/*` (Vercel Functions) → n8n → Google Sheets / Evolution API.

O navegador não chama o n8n diretamente. As funções em `/api` fazem o proxy no servidor da Vercel, evitando CORS e deixando a integração mais organizada.

## Endpoints do site

- `GET /api/agenda-medicos`
- `GET /api/agenda-escalas?unidade=Niterói&competencia=2026-10`
- `GET /api/agenda-solicitacoes?unidade=Niterói&competencia=2026-10`
- `POST /api/agenda-enviar-teste`

## Travas de teste

O envio continua restrito ao médico de teste:

- CD: `101010100`
- O n8n continua validando o telefone de teste antes da Evolution.
- A própria função Vercel `/api/agenda-enviar-teste` também rejeita qualquer CD diferente de `101010100`.
- Médicos reais aparecem como `Bloqueado` no painel.

## n8n

O workflow precisa estar ATIVO para que as URLs de produção `/webhook/...` funcionem.

Base configurada por padrão:

`https://n8n.bibliaxp.store`

Opcionalmente, crie na Vercel a variável de ambiente `N8N_BASE_URL` para mudar essa base sem alterar código.

## Deploy na Vercel

1. Suba estes arquivos ao repositório privado do projeto.
2. Importe/atualize o projeto na Vercel.
3. Framework: Vite.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Faça o deploy.

A pasta `/api` na raiz é publicada pela Vercel como Functions.

## Teste esperado

Ao abrir o painel:

1. médicos, escalas e solicitações são carregados do n8n/Sheets;
2. apenas FELIPE VIANA RIBEIRO possui botão de envio habilitado;
3. ao confirmar, o site chama `/api/agenda-enviar-teste`;
4. o n8n envia via Evolution e atualiza `Solicitacoes`;
5. o painel recarrega os dados e mostra `Aguardando resposta`.

## Desenvolvimento local

`npm run dev` executa apenas o Vite e não emula as Vercel Functions. Para testar o fluxo completo localmente, use o ambiente/deploy da Vercel ou `vercel dev` com a Vercel CLI instalada.
