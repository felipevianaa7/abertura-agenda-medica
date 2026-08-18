# Abertura de Agenda Médica — v0.8 RC1

## O que mudou
- Novo menu **Futuras Agendas**.
- Regra: a partir do dia 15, libera a preparação da competência de dois meses à frente.
- Dashboard/Abertura usam competências dinâmicas.
- Uma competência só deve aparecer após existir ao menos uma escala confirmada.
- Marco histórico inicial: Outubro/2026.
- Cadastro/edição/desativação de médicos pelo site.
- Preparação de escala futura com cálculo de datas e exclusão de feriados.
- Google Sheets continua sendo o banco; o site apenas facilita a operação.

## IMPORTANTE — novos webhooks no n8n
O frontend mantém os webhooks antigos e acrescenta:
- GET `/webhook/agenda-competencias`
- POST `/webhook/agenda-medico-salvar`
- POST `/webhook/agenda-medico-status`
- POST `/webhook/agenda-escala-confirmar`

Esses quatro endpoints precisam ser adicionados ao workflow do n8n para que as novas gravações funcionem.
Os endpoints antigos de leitura/envio permanecem iguais.

## Implantação manual
1. Faça backup do repositório atual.
2. Substitua `src/App.jsx`, `src/styles.css`, `src/main.jsx`, `package.json`, `index.html` e `vite.config.js`.
3. Na pasta `api`, mantenha os endpoints de preview/evidência que já existem no repositório e acrescente/substitua os arquivos incluídos neste pacote.
4. Importe/implemente os quatro novos webhooks no n8n.
5. Faça commit no GitHub; o Vercel deve redeployar automaticamente.
