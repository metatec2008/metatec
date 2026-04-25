'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

// ═══ DADOS DOS INDICADORES ═══
const INDS = {
  tendencia: [
    { id: 'ma', name: 'Média Móvel', desc: 'SMA, EMA, WMA, DEMA, TEMA', native: true },
    { id: 'ichimoku', name: 'Ichimoku Kinko Hyo', desc: 'Sistema japonês de tendência', native: true },
    { id: 'adx', name: 'ADX / DI+ / DI-', desc: 'Força e direção da tendência', native: true },
    { id: 'parabolic', name: 'Parabolic SAR', desc: 'Stop and Reverse dinâmico', native: true },
    { id: 'alligator', name: 'Alligator (Williams)', desc: 'Mandíbulas, dentes e lábios', native: true },
    { id: 'zig_zag', name: 'ZigZag', desc: 'Pivôs de alta e baixa', native: true },
    { id: 'supertrend', name: 'SuperTrend', desc: 'Tendência com ATR', native: false },
    { id: 'hma', name: 'Hull MA', desc: 'Média de Hull (responsiva)', native: false },
  ],
  momentum: [
    { id: 'rsi', name: 'RSI', desc: 'Índice de força relativa (14)', native: true },
    { id: 'macd', name: 'MACD', desc: 'Convergência/divergência de médias', native: true },
    { id: 'stoch', name: 'Estocástico', desc: '%K e %D — sobrecompra/venda', native: true },
    { id: 'cci', name: 'CCI', desc: 'Commodity Channel Index', native: true },
    { id: 'momentum_ind', name: 'Momentum', desc: 'Velocidade de variação de preço', native: true },
    { id: 'williams_r', name: 'Williams %R', desc: 'Oscilador de sobrecompra/venda', native: true },
    { id: 'roc', name: 'Rate of Change', desc: 'Taxa de variação percentual', native: true },
    { id: 'bears_bulls', name: 'Bears / Bulls Power', desc: 'Força compradores e vendedores', native: true },
    { id: 'demarker', name: 'DeMarker', desc: 'Comparação máximas e mínimas', native: true },
    { id: 'force_index', name: 'Force Index', desc: 'Força do movimento com volume', native: true },
  ],
  volatilidade: [
    { id: 'bollinger', name: 'Bollinger Bands', desc: 'Bandas de volatilidade (2σ)', native: true },
    { id: 'atr', name: 'ATR', desc: 'Average True Range', native: true },
    { id: 'envelopes', name: 'Envelopes', desc: 'Canais percentuais em torno de MA', native: true },
    { id: 'std_dev', name: 'Std Deviation', desc: 'Desvio padrão dos preços', native: true },
    { id: 'donchian', name: 'Canal de Donchian', desc: 'Máxima/mínima N períodos', native: false },
    { id: 'keltner', name: 'Canal de Keltner', desc: 'EMA + ATR para volatilidade', native: false },
  ],
  volume: [
    { id: 'obv', name: 'OBV', desc: 'On Balance Volume', native: true },
    { id: 'vwap', name: 'VWAP', desc: 'Volume Weighted Avg Price', native: false },
    { id: 'mfi', name: 'Money Flow Index', desc: 'RSI ponderado por volume', native: true },
    { id: 'accumdist', name: 'Acumulação/Distribuição', desc: 'Fluxo de capital no ativo', native: true },
    { id: 'chaikin', name: 'Chaikin Oscillator', desc: 'MACD do Accum/Dist', native: true },
    { id: 'vol_profile', name: 'Volume Profile', desc: 'Volume por faixa de preço', native: false },
    { id: 'tick_vol', name: 'Volumes MT5', desc: 'Volumes de tick nativos MT5', native: true },
  ],
  br: [
    { id: 'didi_index', name: 'Didi Index', desc: 'Cruzamento de 3 médias (Didi Aguiar)', native: false },
    { id: 'hilo', name: 'Hi-Lo Activator', desc: 'Indicador de tendência brasileiro', native: false },
    { id: 'setup9_2', name: 'Setup 9.2', desc: 'Estratégia de reversão com MAs', native: false },
    { id: 'larry', name: 'Larry Williams B3', desc: 'Adaptação para mini-contratos BR', native: false },
    { id: 'trix', name: 'TRIX Brasileiro', desc: 'Triple exponential smoothing', native: false },
  ],
  priceaction: [
    { id: 'candle_pattern', name: 'Padrões de Candle', desc: 'Doji, Hammer, Engolfo, Pin Bar...', native: false },
    { id: 'support_resist', name: 'Suporte e Resistência', desc: 'Detecção automática de S/R', native: false },
    { id: 'pivot_points', name: 'Pivot Points', desc: 'PP clássico, Woodie, Fibonacci', native: false },
    { id: 'fibonacci', name: 'Fibonacci Retracement', desc: 'Níveis 38.2%, 50%, 61.8%', native: false },
    { id: 'harmonic', name: 'Padrões Harmônicos', desc: 'Gartley, Bat, Butterfly, Crab', native: false },
    { id: 'order_block', name: 'Order Blocks', desc: 'Blocos de ordens institucionais', native: false },
  ],
  custom: [
    { id: 'custom_ind', name: 'Criar Indicador', desc: 'Descreva e programamos para você', native: false, custom: true },
    { id: 'custom_signal', name: 'Sinal Personalizado', desc: 'Lógica própria de entrada/saída', native: false, custom: true },
    { id: 'ml_signal', name: 'Filtro Avançado', desc: 'Condições complexas e múltiplos TFs', native: false, custom: true },
  ],
  gestao: [
    { id: 'trailing', name: 'Trailing Stop', desc: 'Stop móvel automático', native: true },
    { id: 'breakeven', name: 'Break Even', desc: 'Move SL para zero no lucro', native: false },
    { id: 'partial_close', name: 'Fechamento Parcial', desc: 'Realiza parte da posição', native: false },
    { id: 'martingale', name: 'Martingale Controlado', desc: 'Aumento de lote com limites', native: false },
    { id: 'anti_martin', name: 'Anti-Martingale', desc: 'Reduz lote após perdas', native: false },
    { id: 'fixed_frac', name: 'Kelly / Fração Fixa', desc: 'Dimensionamento de posição', native: false },
    { id: 'max_dd', name: 'Drawdown Máximo', desc: 'Para operações ao atingir DD', native: false },
    { id: 'daily_goal', name: 'Meta Diária', desc: 'Para ao atingir lucro/perda alvo', native: false },
  ],
}

const PREFIXOS = ['IBR','NEX','VOR','KRY','ZAX','TER','QUO','VAL','DRY','AXO','BRU','NYX','CYP','ORM','PLX','SYN','TRO','KAL','FEN','WYR']
const SUFIXOS = ['UCTUS','ALOR','YTEX','INEX','ULUS','OTIS','IMUS','ERAS','AXUS','ONIX','IVER','UTUS','YREX','ATUS','ITOX','ELUS','AVUS','OREX','INUS','ETUX']

const LEVELS = [
  { min: 0, label: 'NÍVEL 0', cls: 'lv0' },
  { min: 1, label: 'NÍVEL 1 — ARMADO', cls: 'lv1' },
  { min: 3, label: 'NÍVEL 2 — REFORÇADO', cls: 'lv2' },
  { min: 5, label: 'NÍVEL 3 — BLINDADO', cls: 'lv3' },
  { min: 7, label: 'NÍVEL 4 — ELITE', cls: 'lv4' },
  { min: 10, label: '⚠ MODO IBRUCTUS', cls: 'lv5' },
]

type Ind = { id: string; name: string; desc: string; native: boolean; custom?: boolean }

export default function Builder() {
  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState<Map<string, Ind>>(new Map())
  const [roboNome, setRoboNome] = useState('')
  const [roboNomeHint, setRoboNomeHint] = useState('')
  const [orderType, setOrderType] = useState('')
  const [mercado, setMercado] = useState('')
  const [timeframe, setTimeframe] = useState('')
  const [strategyText, setStrategyText] = useState('')
  const [sl, setSl] = useState('')
  const [tp, setTp] = useState('')
  const [horario, setHorario] = useState('')
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [email, setEmail] = useState('')
  const [fone, setFone] = useState('')
  const [contaMt5, setContaMt5] = useState('')
  const [check1, setCheck1] = useState(false)
  const [check2, setCheck2] = useState(false)
  const [check3, setCheck3] = useState(false)
  const [protocolo] = useState(() => `MTC-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`)
  const [payMethod, setPayMethod] = useState('pix')
  const [toast, setToast] = useState('')
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 })
  const [ringPos, setRingPos] = useState({ x: -100, y: -100 })
  const ringRef = useRef({ x: -100, y: -100 })
  const mouseRef = useRef({ x: -100, y: -100 })

  // Cursor
  useEffect(() => {
    const onMove = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY } }
    window.addEventListener('mousemove', onMove)
    let raf: number
    const animate = () => {
      ringRef.current.x += (mouseRef.current.x - ringRef.current.x) * .12
      ringRef.current.y += (mouseRef.current.y - ringRef.current.y) * .12
      setMousePos({ x: mouseRef.current.x, y: mouseRef.current.y })
      setRingPos({ x: ringRef.current.x, y: ringRef.current.y })
      raf = requestAnimationFrame(animate)
    }
    animate()
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) }
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2400)
  }

  const calcTotal = () => {
    let sum = 300
    selected.forEach(ind => { sum += ind.native ? 80 : 300 })
    return sum
  }

  const toggleInd = (ind: Ind) => {
    const next = new Map(selected)
    if (next.has(ind.id)) { next.delete(ind.id); showToast(`${ind.name} removido`) }
    else { next.set(ind.id, ind); showToast(`${ind.name} adicionado!`) }
    setSelected(next)
  }

  const gerarNome = () => {
    const p = PREFIXOS[Math.floor(Math.random() * PREFIXOS.length)]
    const s = SUFIXOS[Math.floor(Math.random() * SUFIXOS.length)]
    const num = Math.random() > .6 ? '-' + (Math.floor(Math.random() * 900) + 100) : ''
    const nome = p + s + num
    setRoboNome(nome)
    setRoboNomeHint(`✨ "${nome}" — nome único gerado`)
    showToast(`🤖 Seu robô se chama ${nome}!`)
  }

  const maskCPF = (v: string) => {
    v = v.replace(/\D/g, '').slice(0, 11)
    v = v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    return v
  }

  const maskFone = (v: string) => {
    v = v.replace(/\D/g, '').slice(0, 11)
    v = v.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{4})$/, '$1-$2')
    return v
  }

  const validateCadastro = () => {
    if (!nome.trim()) { showToast('⚠ Informe seu nome completo'); return }
    if (cpf.length < 14) { showToast('⚠ CPF inválido'); return }
    if (!email.includes('@')) { showToast('⚠ E-mail inválido'); return }
    if (!fone) { showToast('⚠ Informe seu telefone'); return }
    setStep(4)
  }

  const validateTermo = () => {
    if (!check1 || !check2 || !check3) { showToast('⚠ Marque todos os itens para continuar'); return }
    setStep(5)
  }

  const roboLevel = LEVELS.slice().reverse().find(l => selected.size >= l.min) || LEVELS[0]
  const roboFilters: Record<string, string> = {
    lv0: 'grayscale(0.3) brightness(0.8)',
    lv1: 'none',
    lv2: 'brightness(1.1) saturate(1.2)',
    lv3: 'brightness(1.2) saturate(1.5) hue-rotate(-10deg)',
    lv4: 'brightness(1.3) saturate(1.8) drop-shadow(0 0 8px #00c8b4)',
    lv5: 'brightness(1.4) saturate(2) drop-shadow(0 0 14px #b8ff57)',
  }

  const PROG = [16, 32, 50, 66, 84, 100]

  const C = {
    teal: '#00c8b4', volt: '#b8ff57', ink: '#020509',
    panel: 'rgba(7,24,40,0.8)', border: 'rgba(0,200,180,0.14)',
    border2: 'rgba(0,200,180,0.28)', muted: '#3d6070', muted2: '#6a90a0', text: '#cfe8f0',
  }

  const btnPrimary: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 10, background: C.teal, color: '#000', padding: '14px 32px', borderRadius: 4, fontSize: 13, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', border: 'none', cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", boxShadow: '0 0 30px rgba(0,200,180,0.4)', transition: 'all .25s' }
  const btnOutline: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 10, border: `1px solid ${C.border2}`, color: C.teal, padding: '14px 28px', borderRadius: 4, fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, background: 'transparent', cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", transition: 'all .25s' }

  return (
    <main style={{ background: C.ink, color: C.text, fontFamily: "'Space Grotesk', sans-serif", cursor: 'none', overflowX: 'hidden', minHeight: '100vh' }}>

      {/* CURSOR */}
      <div style={{ position: 'fixed', zIndex: 9999, pointerEvents: 'none', width: 10, height: 10, borderRadius: '50%', background: '#00f5e0', boxShadow: '0 0 6px #00f5e0, 0 0 14px #00c8b4', left: mousePos.x, top: mousePos.y, transform: 'translate(-50%,-50%)' }} />
      <div style={{ position: 'fixed', zIndex: 9998, pointerEvents: 'none', width: 44, height: 44, borderRadius: '50%', border: '1px solid rgba(0,200,180,0.45)', left: ringPos.x, top: ringPos.y, transform: 'translate(-50%,-50%)', transition: 'all .25s' }} />

      {/* PROGRESS BAR */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999, height: 3, background: 'rgba(0,200,180,0.1)' }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg, #00c8b4, #b8ff57)', width: `${PROG[step - 1]}%`, transition: 'width .5s ease' }} />
      </div>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 3, left: 0, right: 0, zIndex: 800, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4%', background: 'rgba(2,5,9,0.96)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.border}` }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Image src="/img_robo_logo.png" alt="MetaTEC" width={34} height={34} style={{ borderRadius: '50%', border: '1px solid rgba(0,200,180,0.4)', objectFit: 'cover' }} />
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 800, letterSpacing: 4, color: '#fff', textTransform: 'uppercase' }}>
            Meta<em style={{ color: C.teal, fontStyle: 'normal' }}>TEC</em>
          </span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i === step ? C.teal : i < step ? C.volt : C.muted, boxShadow: i === step ? `0 0 10px ${C.teal}` : 'none', transition: 'all .3s' }} />
          ))}
        </div>
        <a href="/" style={{ color: C.muted2, fontSize: 12, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', textDecoration: 'none' }}>← Voltar</a>
      </nav>

      {/* ROBÔ FLUTUANTE */}
      <div style={{ position: 'fixed', bottom: 100, right: 20, zIndex: 600, width: 90, height: 90, cursor: 'pointer', transition: 'all .4s cubic-bezier(.34,1.56,.64,1)' }} onClick={() => showToast(`🤖 ${selected.size} indicadores selecionados`)}>
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <Image src="/img_robo_logo.png" alt="Robô" fill style={{ objectFit: 'contain', borderRadius: '50%', filter: roboFilters[roboLevel.cls] }} />
        </div>
        <div style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', background: C.teal, color: '#000', fontFamily: "'JetBrains Mono', monospace", fontSize: 7, fontWeight: 700, letterSpacing: 1, padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap' }}>
          {roboLevel.label}
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 9000, background: 'rgba(0,200,180,0.12)', border: `1px solid ${C.teal}`, color: C.text, padding: '10px 22px', borderRadius: 4, fontSize: 13, fontWeight: 600, backdropFilter: 'blur(10px)', whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}

      <div style={{ paddingTop: 67 }}>

        {/* ═══ STEP 1: INDICADORES ═══ */}
        {step === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', minHeight: 'calc(100vh - 67px)' }} className="step1-grid">
            {/* COLUNA PRINCIPAL */}
            <div style={{ padding: '40px 4%', overflowY: 'auto' }}>
              <div style={{ marginBottom: 32 }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 3, color: C.teal, display: 'block', marginBottom: 8, textTransform: 'uppercase' }}>// Passo 1 de 5 — Indicadores</span>
                <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, color: '#fff', marginBottom: 8 }}>MONTE SEU ROBÔ</h1>
                <p style={{ fontSize: 14, color: C.muted2, lineHeight: 1.7 }}>
                  Selecione os indicadores com <strong style={{ color: C.text }}>parâmetros ajustáveis</strong> — período, timeframe e mais.<br />
                  Nativos MT5: <strong style={{ color: C.teal }}>R$80</strong> · Customizados: <strong style={{ color: C.volt }}>R$300</strong>
                </p>
              </div>

              {Object.entries(INDS).map(([cat, items]) => (
                <div key={cat} style={{ marginBottom: 36 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 2, color: C.muted2, marginBottom: 14, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 10 }}>
                    {cat === 'tendencia' && '📈 Tendência'}
                    {cat === 'momentum' && '⚡ Momentum / Osciladores'}
                    {cat === 'volatilidade' && '🌊 Volatilidade'}
                    {cat === 'volume' && '📊 Volume'}
                    {cat === 'br' && '🇧🇷 Mercado Brasileiro'}
                    {cat === 'priceaction' && '🕯️ Price Action'}
                    {cat === 'custom' && '🔧 Indicadores Customizados'}
                    {cat === 'gestao' && '💰 Gestão de Capital & Risco'}
                    <div style={{ flex: 1, height: 1, background: C.border }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
                    {items.map(ind => {
                      const sel = selected.has(ind.id)
                      return (
                        <div key={ind.id} onClick={() => toggleInd(ind)} style={{ background: sel ? 'rgba(0,200,180,0.08)' : 'rgba(7,24,40,0.6)', border: `1px solid ${sel ? C.teal : C.border}`, borderRadius: 6, padding: 14, cursor: 'pointer', transition: 'all .25s', position: 'relative', boxShadow: sel ? '0 0 20px rgba(0,200,180,0.2)' : 'none' }}>
                          {sel && <span style={{ position: 'absolute', top: 8, right: 10, fontSize: 10, color: C.teal, fontWeight: 900 }}>✓</span>}
                          <div style={{ fontSize: 13, fontWeight: 700, color: sel ? '#00f5e0' : '#fff', marginBottom: 4 }}>{ind.name}</div>
                          <div style={{ fontSize: 10, color: C.muted2, lineHeight: 1.5, marginBottom: 6 }}>{ind.desc}</div>
                          <span style={{ fontSize: 8, fontFamily: "'JetBrains Mono', monospace", padding: '2px 6px', borderRadius: 2, background: ind.native ? 'rgba(0,200,180,0.1)' : 'rgba(184,255,87,0.1)', color: ind.native ? C.teal : C.volt, border: `1px solid ${ind.native ? 'rgba(0,200,180,0.2)' : 'rgba(184,255,87,0.2)'}` }}>
                            {ind.custom ? '+ CRIAR' : ind.native ? 'NATIVO MT5' : 'CUSTOMIZADO'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
              <div style={{ height: 100 }} />
            </div>

            {/* SIDEBAR */}
            <div style={{ padding: '28px 20px', borderLeft: `1px solid ${C.border}`, background: 'rgba(7,24,40,0.6)', backdropFilter: 'blur(10px)', position: 'sticky', top: 67, height: 'calc(100vh - 67px)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: C.muted2, letterSpacing: 2, textTransform: 'uppercase' }}>Indicadores selecionados</div>
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {selected.size === 0 ? (
                  <div style={{ fontSize: 12, color: C.muted, fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>Nenhum selecionado</div>
                ) : (
                  Array.from(selected.values()).map(ind => (
                    <div key={ind.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(0,200,180,0.06)', border: `1px solid rgba(0,200,180,0.15)`, borderRadius: 4, fontSize: 12 }}>
                      <span style={{ color: C.text, fontWeight: 600 }}>{ind.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: ind.native ? C.teal : C.volt }}>R${ind.native ? 80 : 300}</span>
                        <button onClick={() => toggleInd(ind)} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 14, padding: '0 4px' }}>✕</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {/* PREÇO + BOTÃO — sempre fixos no rodapé */}
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ background: 'rgba(6,20,36,0.8)', border: `1px solid ${C.border2}`, borderRadius: 6, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                    <span style={{ color: C.muted2 }}>Base</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: C.muted2 }}>R$300</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                    <span style={{ color: C.muted2 }}>Indicadores</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: C.muted2 }}>R${calcTotal() - 300}</span>
                  </div>
                  <div style={{ height: 1, background: C.border, margin: '10px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#fff' }}>Total</span>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 900, color: C.volt }}>R${calcTotal()}</span>
                  </div>
                </div>
                <button style={{ ...btnPrimary, justifyContent: 'center' }} onClick={() => setStep(2)}>
                  Continuar → Estratégia
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ STEP 2: ESTRATÉGIA ═══ */}
        {step === 2 && (
          <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 4%' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 3, color: C.teal, display: 'block', marginBottom: 10, textTransform: 'uppercase' }}>// Passo 2 de 5 — Estratégia</span>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, color: '#fff', marginBottom: 10 }}>DESCREVA SUA <span style={{ color: C.teal }}>ESTRATÉGIA</span></h2>
            <p style={{ fontSize: 14, color: C.muted2, lineHeight: 1.75, marginBottom: 24 }}>Indicadores selecionados:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
              {selected.size === 0 ? <span style={{ fontSize: 13, color: C.muted }}>Nenhum indicador selecionado</span> : Array.from(selected.values()).map(ind => (
                <div key={ind.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,200,180,0.08)', border: `1px solid rgba(0,200,180,0.2)`, padding: '5px 12px', borderRadius: 20, fontSize: 12, color: '#00f5e0', fontWeight: 600 }}>{ind.name}</div>
              ))}
            </div>

            {[
              { label: 'Tipo de Ordem', content: (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                  {[{ type: 'market', icon: '⚡', name: 'A Mercado', desc: 'Execução imediata' }, { type: 'limit', icon: '🎯', name: 'Ordem Limitada', desc: 'Aguarda preço específico' }, { type: 'stop', icon: '🛡️', name: 'Stop Order', desc: 'Dispara ao romper nível' }].map(o => (
                    <div key={o.type} onClick={() => setOrderType(o.type)} style={{ background: orderType === o.type ? 'rgba(0,200,180,0.08)' : 'rgba(7,24,40,0.6)', border: `1px solid ${orderType === o.type ? C.teal : C.border}`, borderRadius: 6, padding: 14, cursor: 'pointer', transition: 'all .25s', textAlign: 'center' }}>
                      <span style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>{o.icon}</span>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{o.name}</div>
                      <div style={{ fontSize: 10, color: C.muted2, marginTop: 4 }}>{o.desc}</div>
                    </div>
                  ))}
                </div>
              )},
            ].map(field => (
              <div key={field.label} style={{ marginBottom: 22 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: C.muted2, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>{field.label}</label>
                {field.content}
              </div>
            ))}

            {[
              { label: 'Mercado', type: 'select', value: mercado, onChange: setMercado, options: ['WIN$ — Mini Índice (B3)', 'WDO$ — Mini Dólar (B3)', 'Ações B3 (PETR4, VALE3...)', 'Forex (EUR/USD, GBP/USD...)', 'Cripto (BTC/USD, ETH/USD...)', 'Commodities (Ouro, Petróleo...)'] },
              { label: 'Timeframe', type: 'select', value: timeframe, onChange: setTimeframe, options: ['M1 — 1 minuto', 'M5 — 5 minutos', 'M15 — 15 minutos', 'M30 — 30 minutos', 'H1 — 1 hora', 'H4 — 4 horas', 'D1 — Diário'] },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 22 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: C.muted2, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>{f.label}</label>
                <select value={f.value} onChange={e => f.onChange(e.target.value)} style={{ width: '100%', background: 'rgba(7,24,40,0.8)', border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, padding: '12px 14px', outline: 'none' }}>
                  <option value="">Selecione...</option>
                  {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}

            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: C.muted2, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>Descreva sua estratégia operacional</label>
              <textarea value={strategyText} onChange={e => setStrategyText(e.target.value)} placeholder="Ex: Quero entrar comprado quando o RSI(14) cruzar acima de 30 e a média de 20 períodos estiver subindo..." style={{ width: '100%', background: 'rgba(7,24,40,0.8)', border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, padding: '12px 14px', outline: 'none', resize: 'vertical', minHeight: 140 }} />
            </div>

            {[
              { label: 'Stop Loss (pontos ou %)', value: sl, onChange: setSl, placeholder: 'Ex: 50 pontos ou 1%' },
              { label: 'Take Profit (pontos ou %)', value: tp, onChange: setTp, placeholder: 'Ex: 100 pontos ou 2%' },
              { label: 'Horário de operação', value: horario, onChange: setHorario, placeholder: 'Ex: 09:00 às 17:30 (horário Brasília)' },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 22 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: C.muted2, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>{f.label}</label>
                <input type="text" value={f.value} onChange={e => f.onChange(e.target.value)} placeholder={f.placeholder} style={{ width: '100%', background: 'rgba(7,24,40,0.8)', border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, padding: '12px 14px', outline: 'none' }} />
              </div>
            ))}

            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <button style={btnOutline} onClick={() => setStep(1)}>← Voltar</button>
              <button style={btnPrimary} onClick={() => setStep(3)}>Continuar → Cadastro</button>
            </div>
          </div>
        )}

        {/* ═══ STEP 3: CADASTRO ═══ */}
        {step === 3 && (
          <div style={{ maxWidth: 580, margin: '0 auto', padding: '40px 4%' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 3, color: C.teal, display: 'block', marginBottom: 10, textTransform: 'uppercase' }}>// Passo 3 de 5 — Seus dados</span>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, color: '#fff', marginBottom: 28 }}>CADASTRO <span style={{ color: C.teal }}>RÁPIDO</span></h2>

            {/* Nome do Robô */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: C.muted2, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
                Nome do seu robô <span style={{ color: C.muted, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span>
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <input type="text" value={roboNome} onChange={e => setRoboNome(e.target.value)} placeholder="Ex: IBRUCTUS, THOR-X..." style={{ flex: 1, background: 'rgba(7,24,40,0.8)', border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, padding: '12px 14px', outline: 'none' }} />
                <button onClick={gerarNome} style={{ background: 'rgba(0,200,180,0.1)', border: `1px solid ${C.border2}`, color: '#00f5e0', padding: '12px 16px', borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'Space Grotesk', sans-serif" }}>🎲 Gerar</button>
              </div>
              {roboNomeHint && <div style={{ marginTop: 6, fontSize: 11, color: C.teal, fontFamily: "'JetBrains Mono', monospace" }}>{roboNomeHint}</div>}
            </div>

            {/* Campos de cadastro */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: C.muted2, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>Nome completo</label>
              <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome completo" style={{ width: '100%', background: 'rgba(7,24,40,0.8)', border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, padding: '12px 14px', outline: 'none' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 22 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: C.muted2, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>CPF</label>
                <input type="text" value={cpf} onChange={e => setCpf(maskCPF(e.target.value))} placeholder="000.000.000-00" maxLength={14} style={{ width: '100%', background: 'rgba(7,24,40,0.8)', border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, padding: '12px 14px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: C.muted2, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>Telefone</label>
                <input type="tel" value={fone} onChange={e => setFone(maskFone(e.target.value))} placeholder="(11) 99999-9999" maxLength={15} style={{ width: '100%', background: 'rgba(7,24,40,0.8)', border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, padding: '12px 14px', outline: 'none' }} />
              </div>
            </div>
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: C.muted2, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" style={{ width: '100%', background: 'rgba(7,24,40,0.8)', border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, padding: '12px 14px', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: C.muted2, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>Conta MT5 (opcional)</label>
              <input type="text" value={contaMt5} onChange={e => setContaMt5(e.target.value)} placeholder="Número da conta MetaTrader 5" style={{ width: '100%', background: 'rgba(7,24,40,0.8)', border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, padding: '12px 14px', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button style={btnOutline} onClick={() => setStep(2)}>← Voltar</button>
              <button style={btnPrimary} onClick={validateCadastro}>Continuar → Termo</button>
            </div>
          </div>
        )}

        {/* ═══ STEP 4: TERMO ═══ */}
        {step === 4 && (
          <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 4%' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 3, color: C.teal, display: 'block', marginBottom: 10, textTransform: 'uppercase' }}>// Passo 4 de 5 — Contrato</span>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, color: '#fff', marginBottom: 20 }}>TERMO DE <span style={{ color: C.teal }}>SERVIÇO</span></h2>

            <div style={{ background: 'rgba(7,24,40,0.7)', border: `1px solid ${C.border}`, borderRadius: 8, padding: 28, height: 340, overflowY: 'auto', fontSize: 12, lineHeight: 1.9, color: C.muted2, marginBottom: 20 }}>
              <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 700, marginBottom: 12 }}>1. Objeto do Contrato</h3>
              Este Termo é celebrado entre <strong>MetaTEC Tecnologia</strong> e o cliente. O objeto é o desenvolvimento de um Expert Advisor personalizado para MetaTrader 5, conforme especificações fornecidas.
              <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 700, marginTop: 18, marginBottom: 12 }}>2. Responsabilidades</h3>
              O EA será desenvolvido conforme indicadores e descrição fornecidos. A MetaTEC não garante resultados financeiros. O cliente é responsável pelas decisões de uso.
              <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 700, marginTop: 18, marginBottom: 12 }}>3. Prazo de Entrega</h3>
              O prazo varia de <strong>7 a 30 dias úteis</strong> a partir da confirmação do pagamento.
              <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 700, marginTop: 18, marginBottom: 12 }}>4. Licença</h3>
              O EA é entregue com licença vinculada ao CPF e/ou conta MT5 do cliente. O código-fonte permanece propriedade da MetaTEC.
              <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 700, marginTop: 18, marginBottom: 12 }}>5. Verificação Técnica</h3>
              Todo EA passa pelo sistema de 9 agentes antes da entrega, com nota mínima 9.7.
              <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 700, marginTop: 18, marginBottom: 12 }}>6. Revisões</h3>
              O cliente tem direito a 1 rodada de ajustes sem custo em até 15 dias após a entrega.
              <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 700, marginTop: 18, marginBottom: 12 }}>7. Reembolso</h3>
              Cancelamentos em até 24h após o pagamento terão reembolso integral. Após o início do desenvolvimento não haverá reembolso.
            </div>

            {[
              { id: 1, checked: check1, onChange: setCheck1, text: 'Li e aceito os Termos de Serviço, incluindo a política de entrega e reembolso.' },
              { id: 2, checked: check2, onChange: setCheck2, text: 'Compreendo que o robô é uma ferramenta de automação e não garante resultados financeiros.' },
              { id: 3, checked: check3, onChange: setCheck3, text: 'Concordo com a licença vinculada ao meu CPF/conta MT5.' },
            ].map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 14, background: 'rgba(0,200,180,0.04)', border: `1px solid ${C.border2}`, borderRadius: 6, marginBottom: 12, cursor: 'pointer' }} onClick={() => c.onChange(!c.checked)}>
                <input type="checkbox" checked={c.checked} onChange={() => c.onChange(!c.checked)} style={{ width: 18, height: 18, accentColor: C.teal, cursor: 'pointer', flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 13, color: C.muted2, lineHeight: 1.6 }}>{c.text}</span>
              </div>
            ))}

            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <button style={btnOutline} onClick={() => setStep(3)}>← Voltar</button>
              <button style={btnPrimary} onClick={validateTermo}>Assinar e Continuar →</button>
            </div>
          </div>
        )}

        {/* ═══ STEP 5: PAGAMENTO ═══ */}
        {step === 5 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 400px', minHeight: 'calc(100vh - 67px)' }} className="step5-grid">
            {/* ESQUERDA */}
            <div style={{ padding: '48px 5%', borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 28 }}>
              {/* Robô hero */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: 24, background: 'linear-gradient(135deg, rgba(0,200,180,0.06), rgba(7,24,40,0.8))', border: `1px solid ${C.border2}`, borderRadius: 12 }}>
                <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
                  <Image src="/img_robo_logo.png" alt="Robô" fill style={{ objectFit: 'contain', filter: roboFilters[roboLevel.cls] }} />
                </div>
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: C.teal, letterSpacing: 2, marginBottom: 6 }}>SEU ROBÔ ESTÁ PRONTO PARA OPERAR</div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 900, color: '#fff', lineHeight: 1, marginBottom: 4 }}>
                    ROBÔ <span style={{ color: C.volt }}>{roboNome || 'IBRUCTUS'}</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.muted2 }}>Verificado por 9 agentes · Licença CPF · Anti-Delay ativo</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", padding: '3px 10px', borderRadius: 2, background: 'rgba(0,200,180,0.1)', color: C.teal, border: `1px solid rgba(0,200,180,0.25)` }}>{roboLevel.label}</span>
                    <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", padding: '3px 10px', borderRadius: 2, background: 'rgba(184,255,87,0.1)', color: C.volt, border: `1px solid rgba(184,255,87,0.25)` }}>PRONTO EM 7–30 DIAS</span>
                  </div>
                </div>
              </div>

              {/* Urgência */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'rgba(255,59,92,0.07)', border: '1px solid rgba(255,59,92,0.25)', borderRadius: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff3b5c', boxShadow: '0 0 10px #ff3b5c', flexShrink: 0, animation: 'pulse 1s infinite' }} />
                <div style={{ fontSize: 12, color: C.text }}>Vagas de desenvolvimento limitadas esta semana. Finalize agora.</div>
              </div>

              {/* Garantias */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  ['🛡️', 'Garantia de Entrega', 'Seu robô é entregue ou dinheiro de volta'],
                  ['🎛️', '100% Parametrizável', 'Período, timeframe e configs ajustáveis'],
                  ['📖', 'Guia de Instalação', 'Do e-mail até operar no MT5'],
                  ['⚡', '9 Agentes Verificam', 'Nota mínima 9.7 antes de sair'],
                ].map(([icon, title, desc]) => (
                  <div key={title as string} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: 14, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 6 }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{title}</div>
                      <div style={{ fontSize: 10, color: C.muted2, lineHeight: 1.5 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Depoimentos */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { av: 'LF', stars: '★★★★★', text: '"3 semanas operando sem erro. Anti Delay funcionou perfeitamente."', author: 'Lucas F. · Scalping WIN$ · entregue em 8 dias' },
                  { av: 'AM', stars: '★★★★★', text: '"Zero erros no MetaEditor. O robô opera enquanto eu durmo."', author: 'André M. · Bollinger+ADX · entregue em 12 dias' },
                ].map(dep => (
                  <div key={dep.av} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 14, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 6 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${C.teal}, ${C.volt})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 800, color: '#000', flexShrink: 0 }}>{dep.av}</div>
                    <div>
                      <div style={{ color: C.volt, fontSize: 10, letterSpacing: 2, marginBottom: 4 }}>{dep.stars}</div>
                      <div style={{ fontSize: 12, color: C.muted2, lineHeight: 1.6, fontStyle: 'italic' }}>{dep.text}</div>
                      <div style={{ fontSize: 10, color: C.muted, marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>{dep.author}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DIREITA — CHECKOUT */}
            <div style={{ padding: '36px 32px', background: 'rgba(7,24,40,0.5)', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 900, color: '#fff', marginBottom: 4 }}>Finalizar Pedido</div>
                <div style={{ fontSize: 12, color: C.muted2 }}>Seu robô entra em desenvolvimento imediatamente.</div>
              </div>

              {/* Resumo */}
              <div style={{ background: 'rgba(6,20,36,0.8)', border: `1px solid ${C.border2}`, borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ background: 'rgba(0,200,180,0.06)', padding: '10px 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: 2, color: C.teal, textTransform: 'uppercase', borderBottom: `1px solid ${C.border}` }}>// Resumo do pedido</div>
                <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span style={{ color: C.muted2 }}>Robô Base</span><span style={{ fontFamily: "'JetBrains Mono', monospace" }}>R$300</span></div>
                  {Array.from(selected.values()).map(ind => (
                    <div key={ind.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: C.muted2 }}>{ind.name}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: ind.native ? C.teal : C.volt }}>R${ind.native ? 80 : 300}</span>
                    </div>
                  ))}
                  {[['Parâmetros ajustáveis (período + TF)', 'INCLUSO'], ['Guia de instalação passo a passo', 'INCLUSO'], ['Verificação 9 agentes', 'INCLUSO'], ['Licença CPF vitalícia', 'INCLUSO']].map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.muted }}>
                      <span>{label}</span><span style={{ color: C.teal }}>{val}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderTop: `1px solid ${C.border2}`, background: 'rgba(184,255,87,0.04)' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Total</span>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 900, color: C.volt }}>R${calcTotal()}</span>
                </div>
              </div>

              {/* Tabs de pagamento */}
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: C.muted2, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Forma de pagamento</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                  {[['pix', '📱', 'PIX'], ['boleto', '📄', 'Boleto'], ['cartao', '💳', 'Cartão']].map(([id, icon, label]) => (
                    <div key={id} onClick={() => setPayMethod(id)} style={{ padding: '10px 6px', textAlign: 'center', background: payMethod === id ? 'rgba(0,200,180,0.08)' : C.panel, border: `1px solid ${payMethod === id ? C.teal : C.border}`, borderRadius: 4, cursor: 'pointer', transition: 'all .2s' }}>
                      <span style={{ fontSize: 18, display: 'block', marginBottom: 4 }}>{icon}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: payMethod === id ? '#00f5e0' : C.muted2 }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PIX */}
              {payMethod === 'pix' && (
                <div style={{ background: 'rgba(2,5,9,0.8)', border: '1px dashed rgba(0,200,180,0.3)', borderRadius: 8, padding: 22, textAlign: 'center' }}>
                  <div style={{ width: 130, height: 130, margin: '0 auto 14px', background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56 }}>📱</div>
                  <div style={{ fontSize: 11, color: C.muted2, marginBottom: 8 }}>Chave PIX:</div>
                  <div style={{ background: 'rgba(0,200,180,0.06)', border: `1px solid rgba(0,200,180,0.2)`, borderRadius: 4, padding: '9px 12px', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.teal, marginBottom: 12, cursor: 'pointer' }}>10373220707</div>
                  <button onClick={() => { navigator.clipboard.writeText('10373220707'); showToast('✅ Chave PIX copiada!') }} style={{ ...btnPrimary, width: '100%', justifyContent: 'center', fontSize: 12, padding: '11px' }}>📋 Copiar Chave PIX</button>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 10 }}>⚡ PIX confirmado instantaneamente</div>
                </div>
              )}

              {/* Boleto */}
              {payMethod === 'boleto' && (
                <div style={{ background: 'rgba(2,5,9,0.8)', border: '1px dashed rgba(0,200,180,0.3)', borderRadius: 8, padding: 22, textAlign: 'center' }}>
                  <div style={{ fontSize: 48, marginBottom: 14 }}>📄</div>
                  <div style={{ fontSize: 11, color: C.muted2, marginBottom: 16 }}>Boleto bancário · vence em 3 dias úteis</div>
                  <button style={{ ...btnPrimary, width: '100%', justifyContent: 'center' }}>📥 Gerar Boleto</button>
                </div>
              )}

              {/* Cartão */}
              {payMethod === 'cartao' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Número do Cartão', placeholder: '0000 0000 0000 0000' },
                    { label: 'Nome no Cartão', placeholder: 'Como está no cartão' },
                  ].map(f => (
                    <div key={f.label}>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted2, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'JetBrains Mono', monospace" }}>{f.label}</label>
                      <input type="text" placeholder={f.placeholder} style={{ width: '100%', background: 'rgba(7,24,40,0.8)', border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, padding: '12px 14px', outline: 'none' }} />
                    </div>
                  ))}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted2, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'JetBrains Mono', monospace" }}>Validade</label>
                      <input type="text" placeholder="MM/AA" maxLength={5} style={{ width: '100%', background: 'rgba(7,24,40,0.8)', border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, padding: '12px 14px', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted2, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'JetBrains Mono', monospace" }}>CVV</label>
                      <input type="text" placeholder="000" maxLength={3} style={{ width: '100%', background: 'rgba(7,24,40,0.8)', border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, padding: '12px 14px', outline: 'none' }} />
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(0,200,180,0.04)', border: `1px solid ${C.border}`, borderRadius: 4, justifyContent: 'center' }}>
                <span>🔒</span>
                <span style={{ fontSize: 10, color: C.muted2, fontFamily: "'JetBrains Mono', monospace", letterSpacing: .5 }}>AMBIENTE 100% SEGURO · SSL · DADOS CRIPTOGRAFADOS</span>
              </div>

              <button style={{ ...btnPrimary, width: '100%', justifyContent: 'center', fontSize: 14, padding: 17 }} onClick={() => { showToast('✅ Processando...'); setTimeout(() => setStep(6), 1500) }}>
                ⚡ ATIVAR MEU ROBÔ AGORA
              </button>
              <button style={{ background: 'none', border: 'none', color: C.muted2, fontSize: 12, cursor: 'pointer', textDecoration: 'underline', fontFamily: "'Space Grotesk', sans-serif" }} onClick={() => setStep(4)}>← Voltar e revisar</button>
            </div>
          </div>
        )}

        {/* ═══ STEP 6: SUCESSO ═══ */}
        {step === 6 && (
          <div style={{ minHeight: 'calc(100vh - 67px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 4%', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(184,255,87,0.08), transparent 60%)', pointerEvents: 'none' }} />
            <div style={{ maxWidth: 680, width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>

              {/* Robô IBRUCTUS */}
              <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto 32px' }}>
                <div style={{ position: 'absolute', inset: -20, borderRadius: '50%', border: '1px solid rgba(0,200,180,0.3)', animation: 'spin 6s linear infinite' }} />
                <div style={{ position: 'absolute', inset: -36, borderRadius: '50%', border: '1px solid rgba(184,255,87,0.2)', animation: 'spin 10s linear infinite reverse' }} />
                <Image src="/img_robo_logo.png" alt="Robô" fill style={{ objectFit: 'contain', filter: 'brightness(1.4) saturate(2) drop-shadow(0 0 14px #b8ff57)' }} />
              </div>

              <div style={{ display: 'inline-block', background: 'linear-gradient(135deg, rgba(184,255,87,0.15), rgba(0,200,180,0.1))', border: '1px solid rgba(184,255,87,0.4)', color: C.volt, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 900, letterSpacing: 3, padding: '6px 20px', borderRadius: 3, marginBottom: 20 }}>
                {roboLevel.label}
              </div>

              <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(40px,8vw,72px)', fontWeight: 900, lineHeight: .95, color: '#fff', marginBottom: 12 }}>
                SEU ROBÔ<br /><span style={{ color: C.volt, textShadow: '0 0 30px rgba(184,255,87,0.5)' }}>{roboNome || 'IBRUCTUS'}</span><br />ESTÁ NO FORNO!
              </h1>
              <p style={{ fontSize: 15, color: C.muted2, lineHeight: 1.75, maxWidth: 480, margin: '0 auto 32px' }}>
                Pedido confirmado e em fila de desenvolvimento. Em breve seu Expert Advisor chega no seu e-mail.
              </p>

              {/* Protocolo */}
              <div style={{ background: 'rgba(0,200,180,0.05)', border: `1px solid ${C.border2}`, borderRadius: 8, padding: '16px 20px', marginBottom: 24, fontFamily: "'JetBrains Mono', monospace" }}>
                <div style={{ fontSize: 9, color: C.muted2, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>Protocolo do pedido</div>
                <div style={{ color: '#00f5e0', fontSize: 16, fontWeight: 700, letterSpacing: 3 }}>{protocolo}</div>
              </div>

              {/* Prazo */}
              <div style={{ background: 'linear-gradient(135deg, rgba(184,255,87,0.08), rgba(0,200,180,0.06))', border: '1px solid rgba(184,255,87,0.2)', borderRadius: 8, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: C.volt, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Prazo de entrega</div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 48, fontWeight: 900, color: '#fff', lineHeight: 1 }}>7<span style={{ color: C.volt }}>–</span>30</div>
                  <div style={{ fontSize: 11, color: C.muted2, marginTop: 2 }}>dias úteis após pagamento</div>
                </div>
                <div style={{ fontSize: 12, color: C.muted2, lineHeight: 1.7, maxWidth: 220, textAlign: 'left' }}>
                  Robôs simples chegam em <strong style={{ color: '#fff' }}>até 7 dias</strong>. Estratégias complexas podem levar até <strong style={{ color: '#fff' }}>30 dias</strong>.
                </div>
              </div>

              {/* Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 28, textAlign: 'left' }}>
                {[
                  { icon: '✅', title: 'Pedido recebido', desc: 'Confirmação enviada para seu e-mail', done: true },
                  { icon: '💻', title: 'Desenvolvimento em andamento', desc: 'Seu robô está sendo programado', done: false },
                  { icon: '🛡️', title: 'Verificação pelos 9 Agentes', desc: 'Placar Final — nota mínima 9.7', done: false },
                  { icon: '📧', title: 'Entrega no seu e-mail', desc: 'Arquivo .mq5 com licença CPF', done: false },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, position: 'relative' }}>
                    {i < 3 && <div style={{ position: 'absolute', left: 19, top: 38, bottom: 0, width: 1, background: C.border }} />}
                    <div style={{ width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, border: `1px solid ${item.done ? C.teal : C.border}`, background: item.done ? 'rgba(0,200,180,0.1)' : C.panel }}>{item.icon}</div>
                    <div style={{ padding: '8px 0 20px' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: C.muted2, lineHeight: 1.5 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botões */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                {(() => {
                  const msg = encodeURIComponent(
`🤖 *NOVO PEDIDO METATEC*

*DADOS DO CLIENTE*
Nome: ${nome}
CPF: ${cpf}
E-mail: ${email}
Telefone: ${fone}
Conta MT5: ${contaMt5 || 'Não informado'}

*ROBÔ*
Nome: ${roboNome || 'A batizar'}
Nível: ${roboLevel.label}

*ESTRATÉGIA*
Mercado: ${mercado}
Timeframe: ${timeframe}
Tipo de Ordem: ${orderType}
Stop Loss: ${sl}
Take Profit: ${tp}
Horário: ${horario}
Descrição: ${strategyText}

*INDICADORES SELECIONADOS*
${Array.from(selected.values()).map(i => `• ${i.name} — R$${i.native ? 80 : 300} (${i.native ? 'Nativo MT5' : 'Customizado'})`).join('\n')}

*TOTAL: R$${calcTotal()}*
`)
                  return (
                    <a href={`https://wa.me/5527999464537?text=${msg}`} target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#25d366', color: '#fff', padding: '14px 28px', borderRadius: 4, fontSize: 13, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', textDecoration: 'none' }}>💬 Falar no WhatsApp</a>
                  )
                })()}
                <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: `1px solid ${C.border2}`, color: '#00f5e0', padding: '14px 28px', borderRadius: 4, fontSize: 13, fontWeight: 600, textTransform: 'uppercase', textDecoration: 'none', background: 'transparent' }}>← Voltar ao site</a>
              </div>
            </div>
          </div>
        )}

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Barlow+Condensed:wght@700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        input::placeholder, textarea::placeholder { color: #3d6070; }
        select option { background: #030b14; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .3; } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,200,180,0.3); border-radius: 2px; }
        @media (max-width: 768px) {
          .step1-grid { grid-template-columns: 1fr !important; }
          .step1-grid > div:last-child { position: static !important; height: auto !important; border-left: none !important; border-top: 1px solid rgba(0,200,180,0.14) !important; }
          .step5-grid { grid-template-columns: 1fr !important; }
          .step5-grid > div:first-child { border-right: none !important; border-bottom: 1px solid rgba(0,200,180,0.14) !important; }
          nav > div:nth-child(2) { display: none !important; }
        }
        @media (max-width: 900px) {
          .builder-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  )
}
