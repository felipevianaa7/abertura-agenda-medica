# Abertura de Agenda Médica — v0.8 RC1 CORRIGIDO

Este pacote substitui o pacote anterior.

## Incluído
- Frontend v0.8 com **Futuras Agendas**.
- Dashboard e Abertura com competência dinâmica.
- Marco histórico inicial em Outubro/2026.
- Regra do dia 15: nova competência disponível dois meses à frente.
- Competência só aparece operacionalmente quando existe ao menos uma escala confirmada.
- Cadastro, edição e desativação de médicos pelo site.
- Confirmação de escalas futuras com cálculo das datas e remoção de feriados.
- Preview e evidências do WhatsApp preservados.
- Google Sheets continua sendo o banco.
- JSON n8n v0.8 incluído com os novos endpoints.

## JSON n8n
Importe o arquivo:
`API - Abertura de Agenda Medica v0.8 RC1 - CCNIT.json`

Ele preserva o workflow CCNIT atual e adiciona:
- GET `agenda-competencias`
- POST `agenda-medico-salvar`
- POST `agenda-medico-status`
- POST `agenda-escala-confirmar`

## Implantação
1. Faça backup do workflow atual do n8n e do repositório.
2. Importe o JSON v0.8 como um NOVO workflow primeiro para testar.
3. Confira se a credencial `Google Sheets account` está vinculada nos novos nós.
4. Ative o workflow v0.8 somente após validar os webhooks.
5. Substitua os arquivos do repositório pelo conteúdo deste pacote.
6. Aguarde o redeploy do Vercel.
