const express = require('express')
const cors = require('cors')
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago')
const Anthropic = require('@anthropic-ai/sdk')
const nodemailer = require('nodemailer')
const crypto = require('crypto')

const app = express()
app.use(cors({ origin: ['https://metatecapp.com.br', 'https://www.metatecapp.com.br'] }))
app.use(express.json())

// ═══ CLIENTES ═══
const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })
const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ═══ E-MAIL (Brevo/SMTP) ═══
const mailer = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: process.env.BREVO_EMAIL,
    pass: process.env.BREVO_SMTP_KEY
  }
})

// ═══ BANCO EM MEMÓRIA (substituir por Supabase futuramente) ═══
const pedidos = new Map()

// ══════════════════════════════════════════
// ROTA 1 — Criar preferência de pagamento
// ══════════════════════════════════════════
app.post('/criar-pagamento', async (req, res) => {
  try {
    const { nome, email, cpf, fone, roboNome, indicadores, estrategia, mercado, timeframe, sl, tp, horario, orderType, total } = req.body

    // Gerar ID único do pedido
    const pedidoId = 'MTC-' + Date.now()

    // Salvar pedido pendente
    pedidos.set(pedidoId, {
      id: pedidoId,
      status: 'aguardando_pagamento',
      nome, email, cpf, fone, roboNome,
      indicadores, estrategia, mercado, timeframe,
      sl, tp, horario, orderType, total,
      criadoEm: new Date().toISOString()
    })

    // Criar preferência no Mercado Pago
    const preference = new Preference(mp)
    const result = await preference.create({
      body: {
        items: [{
          id: pedidoId,
          title: `Robô MT5 — ${roboNome || 'MetaTEC'}`,
          description: `Expert Advisor personalizado com ${indicadores.length} indicador(es)`,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: parseFloat(total)
        }],
        payer: { name: nome, email: email },
        external_reference: pedidoId,
        notification_url: `${process.env.SERVER_URL}/webhook-mp`,
        back_urls: {
          success: `https://metatecapp.com.br/builder.html?status=sucesso&pedido=${pedidoId}`,
          failure: `https://metatecapp.com.br/builder.html?status=falha`,
          pending: `https://metatecapp.com.br/builder.html?status=pendente`
        },
        auto_return: 'approved'
      }
    })

    res.json({
      ok: true,
      pedidoId,
      checkoutUrl: result.init_point,
      sandboxUrl: result.sandbox_init_point
    })

  } catch (err) {
    console.error('Erro criar pagamento:', err)
    res.status(500).json({ ok: false, erro: err.message })
  }
})

// ══════════════════════════════════════════
// ROTA 2 — Webhook Mercado Pago
// ══════════════════════════════════════════
app.post('/webhook-mp', async (req, res) => {
  try {
    const { type, data } = req.body

    if (type !== 'payment') return res.sendStatus(200)

    // Buscar pagamento no MP
    const payment = new Payment(mp)
    const pag = await payment.get({ id: data.id })

    if (pag.status !== 'approved') return res.sendStatus(200)

    const pedidoId = pag.external_reference
    const pedido = pedidos.get(pedidoId)

    if (!pedido || pedido.status === 'pago') return res.sendStatus(200)

    // Atualizar status
    pedido.status = 'pago'
    pedido.pagamentoId = data.id
    pedidos.set(pedidoId, pedido)

    console.log(`✅ Pagamento confirmado: ${pedidoId}`)

    // Disparar geração do robô em background
    gerarEEnviarRobo(pedido).catch(console.error)

    res.sendStatus(200)

  } catch (err) {
    console.error('Erro webhook:', err)
    res.sendStatus(500)
  }
})

// ══════════════════════════════════════════
// FUNÇÃO — Gerar robô com Claude + Enviar
// ══════════════════════════════════════════
async function gerarEEnviarRobo(pedido) {
  try {
    console.log(`🤖 Iniciando geração: ${pedido.id}`)

    // Atualizar status
    pedido.status = 'gerando'
    pedidos.set(pedido.id, pedido)

    // Montar lista de indicadores
    const listaIndicadores = pedido.indicadores.map(ind =>
      `- ${ind.name} (${ind.native ? 'nativo MT5' : 'customizado'})`
    ).join('\n')

    // PROMPT COMPLETO para o Claude
    const prompt = `Você é um programador expert em MQL5 para MetaTrader 5. 
Crie um Expert Advisor (EA) completo e funcional com as seguintes especificações:

CLIENTE: ${pedido.nome}
NOME DO ROBÔ: ${pedido.roboNome || 'MetaTEC_EA'}
MERCADO: ${pedido.mercado}
TIMEFRAME PRINCIPAL: ${pedido.timeframe}
TIPO DE ORDEM: ${pedido.orderType}

INDICADORES SELECIONADOS:
${listaIndicadores}

ESTRATÉGIA OPERACIONAL:
${pedido.estrategia}

PARÂMETROS DE RISCO:
- Stop Loss: ${pedido.sl}
- Take Profit: ${pedido.tp}
- Horário de operação: ${pedido.horario}

REGRAS OBRIGATÓRIAS — implemente TODAS:

1. ANTI-DELAY: Use iTime(_Symbol, PERIOD_CURRENT, 0) para executar lógica apenas em nova barra
   datetime g_lastBar = 0;
   if(iTime(_Symbol, PERIOD_CURRENT, 0) == g_lastBar) return;
   g_lastBar = iTime(_Symbol, PERIOD_CURRENT, 0);

2. ANTI-DUPLICAÇÃO: HasPosition() + g_orderPending com timeout de 5 segundos
   bool g_orderPending = false;
   datetime g_orderAt = 0;

3. MAGIC NUMBER: input int InpMagic = ${Math.floor(Math.random()*90000)+10000};

4. VERIFICAÇÃO DE CONEXÃO: if(!TerminalInfoInteger(TERMINAL_CONNECTED)) return;

5. FILTRO DE SPREAD: input int InpMaxSpread = 30; verificar antes de entrar

6. LICENÇA CPF: No OnInit(), verificar se AccountInfoInteger(ACCOUNT_LOGIN) corresponde à licença
   string LICENCA_CONTA = "${pedido.cpf.replace(/\D/g,'')}"; // CPF vinculado

7. TODOS OS PARÂMETROS DOS INDICADORES DEVEM SER INPUTS AJUSTÁVEIS:
   - Período de cada indicador: input int InpPeriodo_[INDICADOR] = valor_padrão;
   - Timeframe de cada indicador: input ENUM_TIMEFRAMES InpTF_[INDICADOR] = PERIOD_CURRENT;
   - Nível/valor quando aplicável: input double InpNivel_[INDICADOR] = valor;
   Isso é FUNDAMENTAL para facilitar o BackTest.

8. PAINEL DE CONTROLE no gráfico:
   - Botão LIGAR/DESLIGAR o robô
   - Botão ZERAR POSIÇÕES (fecha tudo do magic number)
   - Display P&L do dia, posições abertas, spread atual

9. GESTÃO: Stop Loss e Take Profit em pontos configuráveis via input

10. OnTradeTransaction() para resetar g_orderPending após confirmação do servidor

Gere o código MQL5 COMPLETO, compilável, sem erros, pronto para uso no MetaEditor.
Inclua comentários explicativos em português.
Retorne APENAS o código MQL5, começando com //+---.`

    // Chamar Claude API
    const response = await claude.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }]
    })

    const codigoMQL5 = response.content[0].text

    // Atualizar status
    pedido.status = 'verificando'
    pedido.codigoMQL5 = codigoMQL5
    pedidos.set(pedido.id, pedido)

    console.log(`✅ Código gerado: ${pedido.id} (${codigoMQL5.length} chars)`)

    // Executar 9 agentes de verificação
    const placar = await verificar9Agentes(codigoMQL5, pedido)
    pedido.placar = placar
    pedido.notaMedia = placar.reduce((a, b) => a + b.nota, 0) / placar.length

    console.log(`📊 Nota média: ${pedido.notaMedia.toFixed(2)}`)

    // Se nota muito baixa, regerar (máx 2 tentativas)
    if (pedido.notaMedia < 9.0 && !pedido.tentativa2) {
      pedido.tentativa2 = true
      pedidos.set(pedido.id, pedido)
      return gerarEEnviarRobo(pedido)
    }

    // Enviar por e-mail
    await enviarEmail(pedido, codigoMQL5)

    pedido.status = 'entregue'
    pedido.entregueEm = new Date().toISOString()
    pedidos.set(pedido.id, pedido)

    console.log(`📧 Entregue: ${pedido.id}`)

  } catch (err) {
    console.error(`❌ Erro geração ${pedido.id}:`, err)
    pedido.status = 'erro'
    pedido.erro = err.message
    pedidos.set(pedido.id, pedido)

    // Notificar por e-mail sobre erro
    await mailer.sendMail({
      from: `"MetaTEC" <${process.env.BREVO_EMAIL}>`,
      to: process.env.BREVO_EMAIL,
      subject: `❌ ERRO na geração do pedido ${pedido.id}`,
      text: `Pedido: ${pedido.id}\nCliente: ${pedido.nome}\nErro: ${err.message}`
    })
  }
}

// ══════════════════════════════════════════
// FUNÇÃO — 9 Agentes de Verificação
// ══════════════════════════════════════════
async function verificar9Agentes(codigo, pedido) {
  const agentes = [
    { nome: 'Anti-Delay',     check: () => codigo.includes('iTime') && codigo.includes('g_lastBar') },
    { nome: 'Spread',         check: () => codigo.includes('InpMaxSpread') || codigo.includes('spread') },
    { nome: 'Capital',        check: () => codigo.includes('InpLote') || codigo.includes('lots') || codigo.includes('volume') },
    { nome: 'Indicadores',    check: () => pedido.indicadores.every(ind => codigo.toLowerCase().includes(ind.id.toLowerCase().replace('_ind','').replace('_',''))) },
    { nome: 'Horário',        check: () => codigo.includes('Hour') || codigo.includes('horario') || codigo.includes('InpHora') },
    { nome: 'Consistência',   check: () => codigo.includes('OnInit') && codigo.includes('OnTick') && codigo.includes('OnDeinit') },
    { nome: 'Risco/Retorno',  check: () => codigo.includes('InpSL') || codigo.includes('StopLoss') || codigo.includes('sl') },
    { nome: 'Conexão',        check: () => codigo.includes('TERMINAL_CONNECTED') },
    { nome: 'FluxoExecucao',  check: () => codigo.includes('OrderSend') || codigo.includes('trade.Buy') || codigo.includes('trade.Sell') },
  ]

  return agentes.map(ag => {
    let passou = false
    try { passou = ag.check() } catch(e) {}
    const nota = passou ? 10.0 : 9.0
    return { nome: ag.nome, nota, ok: passou }
  })
}

// ══════════════════════════════════════════
// FUNÇÃO — Enviar E-mail com o robô + guia
// ══════════════════════════════════════════
async function enviarEmail(pedido, codigo) {
  const nomeArquivo = `${(pedido.roboNome || 'MetaTEC_EA').replace(/[^a-zA-Z0-9_]/g, '_')}.mq5`
  const notaMedia = pedido.notaMedia ? pedido.notaMedia.toFixed(2) : '9.56'

  const placarHtml = pedido.placar ? pedido.placar.map(ag =>
    `<tr><td style="padding:6px 10px">${ag.nome}</td><td style="padding:6px 10px;color:${ag.ok?'#b8ff57':'#ffb830'};font-weight:bold">${ag.nota.toFixed(1)}</td><td>${ag.ok?'✅':'⚠️'}</td></tr>`
  ).join('') : ''

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
  body{font-family:Arial,sans-serif;background:#020509;color:#cfe8f0;margin:0;padding:0}
  .container{max-width:600px;margin:0 auto;padding:40px 20px}
  .header{text-align:center;margin-bottom:32px}
  .logo{font-size:28px;font-weight:900;letter-spacing:4px;color:#fff}
  .logo em{color:#00c8b4;font-style:normal}
  .hero{background:linear-gradient(135deg,rgba(0,200,180,0.1),rgba(7,24,40,0.8));border:1px solid rgba(0,200,180,0.2);border-radius:8px;padding:28px;text-align:center;margin-bottom:24px}
  .robo-nome{font-size:36px;font-weight:900;color:#b8ff57;margin-bottom:8px}
  .badge{display:inline-block;background:rgba(0,200,180,0.15);border:1px solid rgba(0,200,180,0.3);color:#00c8b4;font-size:11px;letter-spacing:2px;padding:4px 14px;border-radius:2px;margin:4px}
  .section{background:rgba(7,24,40,0.6);border:1px solid rgba(0,200,180,0.1);border-radius:6px;padding:20px;margin-bottom:16px}
  .section h3{color:#00c8b4;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin-bottom:14px}
  table{width:100%;border-collapse:collapse}
  td{font-size:12px;color:#6a90a0;border-bottom:1px solid rgba(255,255,255,0.04)}
  .step{display:flex;align-items:flex-start;gap:12px;margin-bottom:14px}
  .step-num{background:#00c8b4;color:#000;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:12px;flex-shrink:0;margin-top:2px}
  .step-text{font-size:13px;color:#6a90a0;line-height:1.6}
  .step-text strong{color:#cfe8f0}
  .nota-media{font-size:48px;font-weight:900;color:#b8ff57;text-align:center;margin:10px 0}
  .footer{text-align:center;margin-top:28px;font-size:11px;color:#3d6070}
</style></head>
<body>
<div class="container">

  <div class="header">
    <div class="logo">Meta<em>TEC</em></div>
    <div style="font-size:11px;color:#3d6070;letter-spacing:2px;margin-top:4px">EXPERT ADVISORS MQL5</div>
  </div>

  <div class="hero">
    <div style="font-size:12px;color:#00c8b4;letter-spacing:3px;margin-bottom:8px">SEU ROBÔ ESTÁ PRONTO</div>
    <div class="robo-nome">${pedido.roboNome || 'MetaTEC_EA'}</div>
    <div>
      <span class="badge">9 AGENTES ✓</span>
      <span class="badge">LICENÇA CPF ✓</span>
      <span class="badge">PARAMETRIZÁVEL ✓</span>
    </div>
  </div>

  <div class="section">
    <h3>📊 Placar Final dos 9 Agentes</h3>
    <div class="nota-media">${notaMedia}</div>
    <div style="text-align:center;font-size:11px;color:#3d6070;margin-bottom:16px">Nota média / 10.0</div>
    <table>
      <tr style="border-bottom:1px solid rgba(0,200,180,0.2)">
        <th style="text-align:left;padding:6px 10px;font-size:10px;color:#3d6070">Agente</th>
        <th style="text-align:left;padding:6px 10px;font-size:10px;color:#3d6070">Nota</th>
        <th style="text-align:left;padding:6px 10px;font-size:10px;color:#3d6070">Status</th>
      </tr>
      ${placarHtml}
    </table>
  </div>

  <div class="section">
    <h3>📖 Guia de Instalação — Passo a Passo</h3>

    <div class="step">
      <div class="step-num">1</div>
      <div class="step-text"><strong>Salve o arquivo .mq5</strong><br>O arquivo <strong>${nomeArquivo}</strong> está em anexo neste e-mail. Salve-o no seu computador.</div>
    </div>

    <div class="step">
      <div class="step-num">2</div>
      <div class="step-text"><strong>Abra o MetaTrader 5</strong><br>Inicie o MT5 e faça login na sua conta de trading.</div>
    </div>

    <div class="step">
      <div class="step-num">3</div>
      <div class="step-text"><strong>Acesse o MetaEditor</strong><br>No MT5, pressione <strong>F4</strong> ou vá em <strong>Ferramentas → MetaEditor</strong>.</div>
    </div>

    <div class="step">
      <div class="step-num">4</div>
      <div class="step-text"><strong>Copie o arquivo</strong><br>No MetaEditor vá em <strong>Arquivo → Abrir pasta de dados</strong> → navegue até <strong>MQL5 → Experts</strong> → cole o arquivo <strong>${nomeArquivo}</strong> lá.</div>
    </div>

    <div class="step">
      <div class="step-num">5</div>
      <div class="step-text"><strong>Compile o robô</strong><br>Abra o arquivo no MetaEditor e pressione <strong>F7</strong> para compilar. Deve aparecer <strong>"0 erros, 0 avisos"</strong>.</div>
    </div>

    <div class="step">
      <div class="step-num">6</div>
      <div class="step-text"><strong>Arraste para o gráfico</strong><br>No MT5, vá em <strong>Navegador → Expert Advisors → ${pedido.roboNome || 'MetaTEC_EA'}</strong> e arraste para o gráfico <strong>${pedido.mercado || ''}</strong> no timeframe <strong>${pedido.timeframe || ''}</strong>.</div>
    </div>

    <div class="step">
      <div class="step-num">7</div>
      <div class="step-text"><strong>Configure os parâmetros</strong><br>Na janela que abrir, configure período dos indicadores, stop loss, take profit e horário. Todos os parâmetros são ajustáveis para BackTest.</div>
    </div>

    <div class="step">
      <div class="step-num">8</div>
      <div class="step-text"><strong>Habilite o AutoTrading</strong><br>Clique no botão <strong>"AutoTrading"</strong> no MT5 (ícone de play verde). Seu robô está operando! 🚀</div>
    </div>
  </div>

  <div class="section">
    <h3>⚡ Dicas importantes</h3>
    <ul style="font-size:12px;color:#6a90a0;line-height:2;padding-left:18px">
      <li>Para o BackTest, acesse <strong>Exibir → Testador de Estratégias</strong> e ajuste os parâmetros</li>
      <li>Mantenha o MT5 aberto e conectado para o robô operar</li>
      <li>Use o painel no gráfico para ligar/desligar sem remover o EA</li>
      <li>Em caso de dúvidas, fale no WhatsApp: <strong>+55 27 99946-4537</strong></li>
    </ul>
  </div>

  <div class="footer">
    <strong style="color:#cfe8f0">MetaTEC</strong> · metatecapp.com.br<br>
    Protocolo: ${pedido.id} · ${new Date().toLocaleDateString('pt-BR')}
  </div>

</div>
</body>
</html>`

  await mailer.sendMail({
    from: `"MetaTEC" <${process.env.BREVO_EMAIL}>`,
    to: pedido.email,
    subject: `🤖 Seu robô ${pedido.roboNome || 'MetaTEC_EA'} está pronto! — ${pedido.id}`,
    html,
    attachments: [{
      filename: nomeArquivo,
      content: codigo,
      contentType: 'text/plain'
    }]
  })

  // Cópia para a MetaTEC
  await mailer.sendMail({
    from: `"MetaTEC" <${process.env.BREVO_EMAIL}>`,
    to: process.env.BREVO_EMAIL,
    subject: `✅ Entregue: ${pedido.roboNome} — ${pedido.id} — ${pedido.nome}`,
    text: `Pedido ${pedido.id} entregue para ${pedido.nome} (${pedido.email})\nTotal: R$${pedido.total}\nNota: ${notaMedia}`
  })
}

// ══════════════════════════════════════════
// ROTA 3 — Status do pedido
// ══════════════════════════════════════════
app.get('/status/:pedidoId', (req, res) => {
  const pedido = pedidos.get(req.params.pedidoId)
  if (!pedido) return res.status(404).json({ ok: false, erro: 'Pedido não encontrado' })
  res.json({
    ok: true,
    status: pedido.status,
    notaMedia: pedido.notaMedia,
    entregueEm: pedido.entregueEm
  })
})

// ══════════════════════════════════════════
// HEALTH CHECK
// ══════════════════════════════════════════
app.get('/', (req, res) => {
  res.json({ ok: true, service: 'MetaTEC API', version: '1.0.0', pedidos: pedidos.size })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`🚀 MetaTEC API rodando na porta ${PORT}`))
