'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function Home() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <main style={{ background: '#020509', color: '#cfe8f0', fontFamily: "'Space Grotesk', sans-serif", overflowX: 'hidden', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 800, height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 5%', background: scrollY > 40 ? 'rgba(2,5,9,0.97)' : 'rgba(2,5,9,0.8)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(0,200,180,0.12)', transition: 'background .4s' }}>
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Image src="/img_robo_logo.png" alt="MetaTEC" width={36} height={36} style={{ borderRadius: '50%', border: '1.5px solid rgba(0,200,180,0.5)', objectFit: 'cover' }} />
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: 4, color: '#fff', textTransform: 'uppercase' }}>
            Meta<em style={{ color: '#00c8b4', fontStyle: 'normal' }}>TEC</em>
          </span>
        </a>
        <div className="nav-links" style={{ display: 'flex', gap: 32 }}>
          {[['Processo','#processo'],['Segurança','#seguranca'],['Painel','#painel'],['Planos','#planos']].map(([l,h]) => (
            <a key={l} href={h} style={{ color: '#6a90a0', fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
        <a href="/builder" style={{ border: '1px solid #00c8b4', color: '#00c8b4', padding: '8px 22px', borderRadius: 3, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', textDecoration: 'none' }}>Orçamento</a>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 68, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Image src="/img_dashboard.png" alt="" fill style={{ objectFit: 'cover', objectPosition: 'center right', filter: 'brightness(0.25) saturate(2.2) hue-rotate(10deg)' }} priority />
        </div>
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(110deg, rgba(2,5,9,0.98) 0%, rgba(2,5,9,0.88) 42%, rgba(2,5,9,0.3) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, backgroundImage: 'radial-gradient(circle, rgba(0,200,180,0.07) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '0 5%', maxWidth: 720, width: '100%' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 4, color: '#00c8b4', marginBottom: 18, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00c8b4', boxShadow: '0 0 8px #00c8b4', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            MetaTEC — Expert Advisors MQL5 — Entregues e Verificados
          </div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(60px, 9vw, 110px)', fontWeight: 900, lineHeight: .9, color: '#fff', marginBottom: 28, letterSpacing: -2 }}>
            O FUTURO<br />
            <span style={{ color: '#00c8b4', textShadow: '0 0 40px rgba(0,200,180,0.4)' }}>CHEGOU</span><br />
            <span style={{ color: '#b8ff57', textShadow: '0 0 40px rgba(184,255,87,0.35)' }}>AO SEU TRADE</span>
          </h1>
          <p style={{ fontSize: 16, color: '#6a90a0', lineHeight: 1.8, marginBottom: 40, maxWidth: 540 }}>
            Somos a <strong style={{ color: '#cfe8f0' }}>Inovação</strong>. Somos a <strong style={{ color: '#cfe8f0' }}>segurança</strong>. Programamos, verificamos com <strong style={{ color: '#00c8b4' }}>9 agentes especializados</strong> e entregamos seu robô MT5 licenciado.
          </p>
          <a href="/builder" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#00c8b4', color: '#000', padding: '15px 36px', borderRadius: 3, fontSize: 13, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', textDecoration: 'none', boxShadow: '0 0 40px rgba(0,200,180,0.4)' }}>
            ⚡ Quero meu Robô
          </a>
          <div style={{ display: 'flex', gap: 40, marginTop: 56 }}>
            {[['200+','Robôs entregues'],['9.56','Nota média'],['0 err','Compilação']].map(([n,l]) => (
              <div key={l}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 40, fontWeight: 900, color: '#00c8b4', lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: 10, color: '#3d6070', letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESSO */}
      <section id="processo" style={{ padding: '120px 5%', background: '#030b14' }}>
        <div style={{ textAlign: 'center', marginBottom: 70 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 3, color: '#00c8b4', marginBottom: 14, textTransform: 'uppercase' }}>// Como funciona</div>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(36px,5vw,66px)', fontWeight: 900, color: '#fff' }}>DO PEDIDO AO <span style={{ color: '#00c8b4' }}>CÓDIGO RODANDO</span></h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, maxWidth: 1100, margin: '0 auto' }}>
          {[
            { n:'01', icon:'🧩', title:'Monte sua Estratégia', desc:'Indicadores, tipo de ordem, gestão de risco e lógica operacional no Builder online.' },
            { n:'02', icon:'💳', title:'Confirme o Pagamento', desc:'PIX, boleto ou cartão em até 12x. Preço calculado em tempo real.' },
            { n:'03', icon:'💻', title:'Programamos seu Robô', desc:'EA gerado com todas as proteções padrão MetaTEC embutidas.' },
            { n:'04', icon:'🛡️', title:'9 Agentes Verificam', desc:'Placar Final com 9 verificações especializadas. Nota mínima 9.7.' },
            { n:'05', icon:'📨', title:'Enviamos por E-mail', desc:'O .mq5 aprovado chega com seu CPF na licença. Compile e opere.' },
          ].map(s => (
            <div key={s.n} style={{ background: 'rgba(7,24,40,0.8)', border: '1px solid rgba(0,200,180,0.12)', borderRadius: 10, padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#00c8b4', background: 'rgba(0,200,180,0.1)', padding: '2px 8px', borderRadius: 2 }}>{s.n}</span>
                <span style={{ fontSize: 22 }}>{s.icon}</span>
              </div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 21, fontWeight: 700, color: '#fff', marginBottom: 10 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: '#6a90a0', lineHeight: 1.65 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SEGURANÇA */}
      <section id="seguranca" style={{ padding: '120px 5%', background: '#061424' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }} className="seg-grid">
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 3, color: '#00c8b4', marginBottom: 14, textTransform: 'uppercase' }}>// Proteção total</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(36px,4vw,58px)', fontWeight: 900, color: '#fff', lineHeight: 1, marginBottom: 24 }}>
              6 CAMADAS DE<br /><span style={{ color: '#00c8b4' }}>SEGURANÇA</span><br />EMBUTIDAS
            </h2>
            <p style={{ fontSize: 14, color: '#6a90a0', lineHeight: 1.8, marginBottom: 36 }}>
              Todo robô MetaTEC é entregue com proteções nativas que garantem operação segura, sem duplicação de ordens, sem travamentos.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['🛡️','Anti-Delay','iTime() — 2 camadas de proteção'],
                ['🚫','Anti-Duplicação','HasPos() + timeout 5s'],
                ['📡','Verificação de Conexão','TERMINAL_CONNECTED check'],
                ['📊','Filtro de Spread','Spread máximo configurável'],
                ['🔐','Licença CPF','Vinculada ao seu documento'],
                ['⏰','Gestão de Horário','Horário BR com conversão'],
              ].map(([icon,title,desc]) => (
                <div key={title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '12px 16px', background: 'rgba(0,200,180,0.04)', border: '1px solid rgba(0,200,180,0.1)', borderRadius: 6 }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#cfe8f0', marginBottom: 2 }}>{title}</div>
                    <div style={{ fontSize: 11, color: '#3d6070', fontFamily: "'JetBrains Mono', monospace" }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(0,200,180,0.2)', boxShadow: '0 0 60px rgba(0,200,180,0.1)' }}>
              <Image src="/img_placar.jpg" alt="Placar" width={500} height={360} style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
            <div style={{ position: 'absolute', top: -20, right: -20, background: 'rgba(7,24,40,0.95)', border: '1px solid rgba(184,255,87,0.3)', borderRadius: 8, padding: '12px 18px', animation: 'float 4s ease-in-out infinite' }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 900, color: '#b8ff57', lineHeight: 1 }}>9.56</div>
              <div style={{ fontSize: 9, color: '#3d6070', letterSpacing: 1, textTransform: 'uppercase' }}>Nota Média</div>
            </div>
          </div>
        </div>
      </section>

      {/* PAINEL */}
      <section id="painel" style={{ padding: '120px 5%', background: '#030b14' }}>
        <div style={{ textAlign: 'center', marginBottom: 70 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 3, color: '#00c8b4', marginBottom: 14, textTransform: 'uppercase' }}>// Controle total</div>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(36px,5vw,66px)', fontWeight: 900, color: '#fff' }}>
            PAINEL <span style={{ color: '#b8ff57' }}>INTELIGENTE</span><br />NO SEU GRÁFICO
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, maxWidth: 1100, margin: '0 auto 60px' }}>
          {[
            { icon:'🔴', title:'Botão LIGAR/DESLIGAR', desc:'Ativa e desativa o robô sem remover do gráfico.' },
            { icon:'💰', title:'P&L em Tempo Real', desc:'Lucro e perda do dia exibidos no painel do gráfico.' },
            { icon:'🎯', title:'Zerar Posições', desc:'Fecha todas as ordens do robô com um clique.' },
            { icon:'📡', title:'Status de Conexão', desc:'Monitora a conexão com o servidor MT5 em tempo real.' },
          ].map(c => (
            <div key={c.title} style={{ background: 'rgba(7,24,40,0.85)', border: '1px solid rgba(0,200,180,0.12)', borderRadius: 12, padding: 28 }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{c.icon}</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 10 }}>{c.title}</div>
              <div style={{ fontSize: 13, color: '#6a90a0', lineHeight: 1.7 }}>{c.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ maxWidth: 1100, margin: '0 auto', background: 'rgba(7,24,40,0.9)', border: '1px solid rgba(0,200,180,0.2)', borderRadius: 12, padding: 28 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#3d6070', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>// Preview do painel — MetaTEC EA v1.0</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { label:'STATUS', value:'● ATIVO', color:'#00c8b4' },
              { label:'P&L DIA', value:'+R$ 420', color:'#b8ff57' },
              { label:'POSIÇÕES', value:'1 aberta', color:'#fff' },
              { label:'SPREAD', value:'2 pts', color:'#fff' },
            ].map(i => (
              <div key={i.label} style={{ background: 'rgba(0,200,180,0.04)', border: '1px solid rgba(0,200,180,0.1)', borderRadius: 6, padding: '14px 16px', textAlign: 'center' }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: '#3d6070', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>{i.label}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 900, color: i.color }}>{i.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9 AGENTES */}
      <section id="agentes" style={{ padding: '120px 5%', background: '#061424' }}>
        <div style={{ textAlign: 'center', marginBottom: 70 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 3, color: '#00c8b4', marginBottom: 14, textTransform: 'uppercase' }}>// Verificação técnica</div>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(36px,5vw,66px)', fontWeight: 900, color: '#fff' }}>
            9 AGENTES <span style={{ color: '#b8ff57' }}>VERIFICAM</span> SEU ROBÔ
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10, maxWidth: 900, margin: '0 auto' }}>
          {[
            { n:'Anti-Delay', nota:'10.0', obs:'2 camadas iTime()', ok:true },
            { n:'Spread', nota:'10.0', obs:'Filtro ativo', ok:true },
            { n:'Capital', nota:'9.0', obs:'Fórmula revisada', ok:false },
            { n:'Indicadores', nota:'9.0', obs:'DI+ / DI-', ok:false },
            { n:'Horário', nota:'10.0', obs:'Conversão BR', ok:true },
            { n:'Consistência', nota:'9.0', obs:'statusTxt', ok:false },
            { n:'Risco/Retorno', nota:'10.0', obs:'SL/TP dinâmico', ok:true },
            { n:'Conexão', nota:'10.0', obs:'Terminal check', ok:true },
            { n:'FluxoExecucao', nota:'10.0', obs:'Teste 4 aprovado', ok:true },
          ].map(ag => (
            <div key={ag.n} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(7,24,40,0.9)', border: `1px solid ${ag.ok ? 'rgba(184,255,87,0.15)' : 'rgba(255,184,48,0.15)'}`, borderRadius: 6, padding: '14px 20px' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{ag.n}</div>
                <div style={{ fontSize: 10, color: '#3d6070', fontFamily: "'JetBrains Mono', monospace" }}>{ag.obs}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 900, color: ag.ok ? '#b8ff57' : '#ffb830' }}>{ag.nota}</span>
                <span>{ag.ok ? '✅' : '⚠️'}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 50 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 80, fontWeight: 900, color: '#b8ff57', lineHeight: 1 }}>9.56</div>
          <div style={{ fontSize: 12, color: '#3d6070', letterSpacing: 2, textTransform: 'uppercase', marginTop: 8 }}>Nota média / 10.0</div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" style={{ padding: '120px 5%', background: '#030b14' }}>
        <div style={{ textAlign: 'center', marginBottom: 70 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 3, color: '#00c8b4', marginBottom: 14, textTransform: 'uppercase' }}>// Investimento</div>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(36px,5vw,66px)', fontWeight: 900, color: '#fff' }}>EXATAMENTE O QUE <span style={{ color: '#00c8b4' }}>VOCÊ PEDIU</span></h2>
        </div>
        <div style={{ maxWidth: 560, margin: '0 auto', background: 'rgba(7,24,40,0.8)', border: '1px solid rgba(0,200,180,0.25)', borderRadius: 16, padding: 48 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 64, fontWeight: 900, color: '#fff', marginBottom: 6, lineHeight: 1 }}>
            R$<span style={{ color: '#b8ff57' }}>300</span><sup style={{ fontSize: 22, color: '#3d6070' }}>+</sup>
          </div>
          <div style={{ fontSize: 13, color: '#3d6070', marginBottom: 32 }}>+ R$80 por indicador nativo · + R$300 por indicador customizado</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36 }}>
            {[
              'Código MQL5 completo conforme sua estratégia',
              'Todos indicadores parametrizáveis — período, timeframe e mais',
              'Facilidade de BackTest com parâmetros ajustáveis no MT5',
              'Guia passo a passo de instalação do e-mail até operar',
              '6 proteções padrão MetaTEC embutidas',
              'Licença CPF / conta MT5 vitalícia',
              'Verificação por 9 agentes — Placar Final ≥ 9.7',
              'Entrega em 7 a 30 dias úteis',
            ].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, color: '#cfe8f0' }}>
                <span style={{ color: '#00c8b4', flexShrink: 0, fontWeight: 900 }}>✓</span>{f}
              </div>
            ))}
          </div>
          <a href="/builder" style={{ display: 'block', textAlign: 'center', background: 'linear-gradient(135deg, #00c8b4, #00f5e0)', color: '#000', padding: '18px 32px', borderRadius: 6, fontSize: 15, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', textDecoration: 'none', boxShadow: '0 0 40px rgba(0,200,180,0.4)' }}>
            ⚡ Montar meu Robô
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '70px 5% 40px', borderTop: '1px solid rgba(0,200,180,0.1)', background: '#020509', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 48 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Image src="/img_robo_logo.png" alt="MetaTEC" width={32} height={32} style={{ borderRadius: '50%', border: '1px solid rgba(0,200,180,0.4)', objectFit: 'cover' }} />
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: 3, color: '#fff' }}>Meta<span style={{ color: '#00c8b4' }}>TEC</span></span>
          </div>
          <div style={{ fontSize: 13, color: '#3d6070', lineHeight: 1.8 }}>Tecnologia de última geração para automação no MetaTrader 5.</div>
        </div>
        <div>
          <div style={{ fontSize: 9, letterSpacing: 2, color: '#3d6070', textTransform: 'uppercase', marginBottom: 18, fontFamily: "'JetBrains Mono', monospace" }}>Navegação</div>
          {[['Processo','#processo'],['Segurança','#seguranca'],['Painel','#painel'],['9 Agentes','#agentes'],['Planos','#planos']].map(([l,h]) => (
            <div key={l} style={{ marginBottom: 10 }}><a href={h} style={{ color: '#6a90a0', fontSize: 13, textDecoration: 'none' }}>{l}</a></div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 9, letterSpacing: 2, color: '#3d6070', textTransform: 'uppercase', marginBottom: 18, fontFamily: "'JetBrains Mono', monospace" }}>Mercados</div>
          {['B3 — WIN$/WDO$','Forex','Cripto'].map(m => <div key={m} style={{ color: '#6a90a0', fontSize: 13, marginBottom: 10 }}>{m}</div>)}
        </div>
        <div>
          <div style={{ fontSize: 9, letterSpacing: 2, color: '#3d6070', textTransform: 'uppercase', marginBottom: 18, fontFamily: "'JetBrains Mono', monospace" }}>Contato</div>
          <div><a href="mailto:metatec2008@gmail.com" style={{ color: '#6a90a0', fontSize: 13, textDecoration: 'none' }}>metatec2008@gmail.com</a></div>
        </div>
      </footer>
      <div style={{ padding: '20px 5%', borderTop: '1px solid rgba(0,200,180,0.06)', background: '#020509', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <span style={{ fontSize: 11, color: '#3d6070' }}>© 2025 MetaTEC · Todos os direitos reservados</span>
        <span style={{ fontSize: 11, color: '#3d6070', fontFamily: "'JetBrains Mono', monospace" }}><span style={{ color: '#00c8b4', marginRight: 6 }}>●</span>Sistemas operacionais · 27/27 checks ativos</span>
      </div>

      <a href="/builder" style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 700, width: 58, height: 58, borderRadius: '50%', background: 'rgba(0,200,180,0.12)', border: '1px solid rgba(0,200,180,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, textDecoration: 'none', boxShadow: '0 0 24px rgba(0,200,180,0.25)', backdropFilter: 'blur(12px)', animation: 'float 3s ease-in-out infinite' }}>🤖</a>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Barlow+Condensed:wght@700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        @keyframes pulse { 0%,100% { opacity:1; box-shadow:0 0 8px #00c8b4; } 50% { opacity:.5; box-shadow:0 0 16px #00c8b4; } }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:rgba(7,24,40,0.5); }
        ::-webkit-scrollbar-thumb { background:rgba(0,200,180,0.4); border-radius:3px; }
        @media (max-width:768px) {
          .nav-links { display:none !important; }
          .seg-grid { grid-template-columns:1fr !important; gap:40px !important; }
        }
      `}</style>
    </main>
  )
}
