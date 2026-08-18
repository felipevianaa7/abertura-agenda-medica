# Abertura de Agenda Médica — v0.9 RC1 COMPLETO

Este pacote implementa integralmente a evolução combinada para **Futuras Agendas**, mantendo o Google Sheets como banco de dados.

## Regras implementadas

### Futuras Agendas
- Dia 1 a 14: a nova competência permanece bloqueada.
- A partir do dia 15: libera exatamente a competência de dois meses à frente.
- Exemplos:
  - 15/08 → Outubro/2026
  - 15/09 → Novembro/2026
  - 15/10 → Dezembro/2026
  - 15/11 → Janeiro/2027
  - 15/12 → Fevereiro/2027
- Os cartões mostram três estados:
  - Bloqueado
  - Em preparação, ainda sem escalas
  - Em preparação, já operacional
- Não é necessário configurar todos os médicos. A primeira escala confirmada já torna o mês operacional.

### Dashboard / Abertura / Respondidos
- Unidade e competência são dinâmicas.
- As competências são obtidas da própria aba `Escalas`.
- Um mês só aparece quando já existe ao menos uma escala confirmada naquela unidade.
- Para Niterói, competências anteriores a Outubro/2026 não são exibidas.
- Em Abertura de Agenda aparecem somente médicos que possuem escala confirmada naquela competência.

### Médicos
- Cadastrar médico.
- Editar médico.
- Ativar / desativar.
- Cadastrar, editar e remover escalas fixas.
- O usuário não precisa abrir a planilha.
- O CD fica protegido durante edição para preservar o identificador/histórico.

### Escala fixa
Não foi criada uma nova aba obrigatória.

As escalas fixas ficam na própria aba `Escalas`, usando:
`Competência = FIXA`

Isso permite ter vários turnos fixos para o mesmo médico sem mudar a estrutura atual da planilha.

### Preparação de mês futuro
- O usuário escolhe um médico.
- O sistema carrega suas escalas fixas.
- Para cada turno mostra:
  - Datas calculadas
  - Feriados encontrados
  - Datas para abertura
- Os feriados são removidos antes da confirmação.
- Ao confirmar, as linhas da competência são gravadas na aba `Escalas`.
- A primeira linha confirmada faz a nova competência aparecer automaticamente no Dashboard/Abertura.

### Envio
O fluxo atual de envio foi preservado.
Também foi corrigido o comportamento para competências novas:
- se ainda não existir uma linha na aba `Solicitacoes`, ela é criada automaticamente após o primeiro envio;
- depois disso, reenvios continuam usando a linha existente.

### WhatsApp / Evidência
Os endpoints atuais de:
- envio
- respostas
- preview
- rolagem
- captura de trecho
- evidência

foram preservados.

## Workflow n8n incluído
Importe:
`API - Abertura de Agenda Medica v0.9 RC1 - CCNIT COMPLETO.json`

O workflow parte da versão CCNIT atual e acrescenta:
- GET `/webhook/agenda-competencias`
- POST `/webhook/agenda-medico-salvar`
- POST `/webhook/agenda-medico-status`
- POST `/webhook/agenda-escala-fixa-salvar`
- POST `/webhook/agenda-escala-fixa-remover`
- POST `/webhook/agenda-escala-confirmar`

## Implantação recomendada
1. Faça backup do workflow atual.
2. Importe o JSON v0.9 como um novo workflow.
3. Confira se os novos nós Google Sheets mostram a credencial `Google Sheets account`.
4. Não mantenha simultaneamente dois workflows ativos com os mesmos paths de webhook.
5. Depois de validar o v0.9, desative o workflow anterior e ative o novo.
6. Substitua o conteúdo do repositório pelo conteúdo deste pacote.
7. Aguarde o deploy da Vercel.
