# Abertura de Agenda Médica — Protótipo React

Protótipo inicial da interface para controle de abertura de agendas médicas.

Vercel: https://vercel.com/suelen-felipe/abertura-agenda-medica/FUFHzLKSWvQf5tMrCEVNUnuvUNmS

## Stack
- React
- Vite
- Lucide Icons
- CSS puro

## Rodar localmente

```bash
npm install
npm run dev
```

## Publicar na Vercel

1. Crie um repositório no GitHub e envie estes arquivos.
2. Importe o repositório na Vercel.
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`

## O que já funciona no protótipo

- Unidade Niterói habilitada e demais unidades desabilitadas.
- Outubro/2026 habilitado e demais meses desabilitados.
- Médico de teste FELIPE VIANA RIBEIRO.
- Busca por médico, especialidade ou CD.
- Modal "Ver detalhes" para escalas complexas.
- Prévia da mensagem antes do envio.
- Cálculo automático das datas do mês conforme o dia da semana.
- Envio simulado altera status para "Aguardando resposta".
- Demonstração visual de estados "Não enviado", "Aguardando" e "Respondido".
- Botões de resposta/evidência ainda são apenas visuais nesta versão.


## Alterações v0.2
- Identidade lateral alterada para **Abertura de Agenda** e removido o subtítulo CC Niterói.
- Modelo de WhatsApp atualizado: datas antes do horário e inclusão de almoço/"Sem almoço".
- Cadastro inicial de feriados nacionais de 2026.
- 12/10/2026 é removido automaticamente das segundas-feiras de Outubro.
- Aviso visual de feriado na tela.


## Alterações v0.3
- Inseridos os 15 médicos reais da aba **Outubro** do arquivo `CCNIT - ESCALAS 2026`.
- Telefones e CDs médicos cruzados com a aba **Lista Médicos** do arquivo `CCNIT - MAPA DE SALA`.
- Mantido FELIPE VIANA RIBEIRO como médico de teste.
- Datas da escala passam a respeitar as datas efetivamente registradas na planilha, inclusive escalas quinzenais.
- Feriados cadastrados continuam sendo removidos da mensagem antes da prévia/disparo.
- Subespecialidades de Lucas (Joelho) e Vinicius (Ombro) exibidas no painel.
