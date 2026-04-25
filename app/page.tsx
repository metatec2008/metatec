'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 })
  const [ringPos, setRingPos] = useState({ x: -100, y: -100 })
  const [cursorHover, setCursorHover] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const ringRef = useRef({ x: -100, y: -100 })
  const mouseRef = useRef({ x: -100, y: -100 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let W = canvas.width = window.innerWidth
    let H = canvas.height = window.innerHeight
    let mx = W / 2, my = H / 2
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight }
    window.addEventListener('resize', resize)
    const pts = Array.from({ length: 90 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
      sz: Math.random() * 1.8 + .3, a: Math.random() * .5 + .1,
      p: Math.random() * Math.PI * 2,
      c: Math.random() > .6 ? '0,200,180' : Math.random() > .3 ? '184,255,87' : '0,245,224'
    }))
    const ripples: { x: number, y: number, r: number, a: number }[] = []
    const addRipple = (x: number, y: number) => ripples.push({ x, y, r: 0, a: .6 })
    window.addEventListener('click', e => addRipple(e.clientX, e.clientY))
    let raf: number
    const frame = () => {
      ctx.clearRect(0, 0, W, H)
      ctx.save()
      ctx.strokeStyle = 'rgba(0,200,180,0.03)'
      ctx.lineWidth = .5
      const S = 60
      for (let row = 0; row < H / S + 2; row++) {
        for (let col = 0; col < W / (S * 1.732) + 2; col++) {
          const cx2 = col * S * 1.732 + (row % 2) * S * .866
          const cy2 = row * S * .75
          ctx.beginPath()
          for (let i = 0; i < 6; i++) {
            const a = (Math.PI / 3) * i
            ctx.lineTo(cx2 + S * .5 * Math.cos(a), cy2 + S * .5 * Math.sin(a))
          }
          ctx.closePath(); ctx.stroke()
        }
      }
      ctx.restore()
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 90) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y)
            ctx.strokeStyle = `rgba(0,200,180,${(1 - d / 90) * .1})`; ctx.lineWidth = .4; ctx.stroke()
          }
        }
      }
      pts.forEach(p => {
        p.p += .018; p.x += p.vx; p.y += p.vy
        const dx = mx - p.x, dy = my - p.y, d = Math.sqrt(dx * dx + dy * dy)
        if (d < 200) { p.vx += dx * .0001; p.vy += dy * .0001 }
        p.vx *= .99; p.vy *= .99
        if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) { p.x = Math.random() * W; p.y = Math.random() * H }
        const a = p.a * (.6 + .4 * Math.sin(p.p))
        ctx.beginPath(); ctx.arc(p.x, p.y, p.sz, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.c},${a})`; ctx.fill()
      })
      const g = ctx.createRadialGradient(mx, my, 0, mx, my, 220)
      g.addColorStop(0, 'rgba(0,200,180,.07)'); g.addColorStop(1, 'rgba(0,200,180,0)')
      ctx.beginPath(); ctx.arc(mx, my, 220, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill()
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i]
        ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(0,200,180,${rp.a})`; ctx.lineWidth = 1.5; ctx.stroke()
        rp.r += 5; rp.a -= .02
        if (rp.a <= 0) ripples.splice(i, 1)
      }
      raf = requestAnimationFrame(frame)
    }
    frame()
    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY }
    window.addEventListener('mousemove', onMove)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); window.removeEventListener('mousemove', onMove) }
  }, [])

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

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const els = document.querySelectorAll('a,button')
    const on = () => setCursorHover(true)
    const off = () => setCursorHover(false)
    els.forEach(el => { el.addEventListener('mouseenter', on); el.addEventListener('mouseleave', off) })
    return () => els.forEach(el => { el.removeEventListener('mouseenter', on); el.removeEventListener('mouseleave', off) })
  }, [])

  useEffect(() => {
    const els = document.querySelectorAll('.fade-in')
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { (e.target as HTMLElement).style.opacity = '1'; (e.target as HTMLElement).style.transform = 'translateY(0)' } })
    }, { threshold: .12 })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  const S = {
    fadeIn: { opacity: 0, transform: 'translateY(32px)', transition: 'opacity .8s ease, transform .8s ease' } as React.CSSProperties,
  }

  return (
    <main style={{ background: '#020509', color: '#cfe8f0', fontFamily: "'Space Grotesk', sans-serif", cursor: 'none', overflowX: 'hidden', minHeight: '100vh' }}>

      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />

      <div style={{ position: 'fixed', zIndex: 9999, pointerEvents: 'none', width: 10, height: 10, borderRadius: '50%', background: cursorHover ? '#b8ff57' : '#00f5e0', boxShadow: cursorHover ? '0 0 8px #b8ff57, 0 0 20px #b8ff57' : '0 0 6px #00f5e0, 0 0 16px #00c8b4, 0 0 32px rgba(0,200,180,0.5)', left: mousePos.x, top: mousePos.y, transform: 'translate(-50%,-50%)', transition: 'background .2s, box-shadow .2s' }} />
      <div style={{ position: 'fixed', zIndex: 9998, pointerEvents: 'none', width: cursorHover ? 72 : 44, height: cursorHover ? 72 : 44, borderRadius: '50%', border: `1.5px solid ${cursorHover ? 'rgba(184,255,87,0.6)' : 'rgba(0,200,180,0.4)'}`, left: ringPos.x, top: ringPos.y, transform: 'translate(-50%,-50%)', transition: 'all .3s cubic-bezier(.34,1.56,.64,1)' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* NAV */}
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 800, height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 5%', background: scrollY > 40 ? 'rgba(2,5,9,0.96)' : 'transparent', backdropFilter: scrollY > 40 ? 'blur(24px)' : 'none', borderBottom: scrollY > 40 ? '1px solid rgba(0,200,180,0.12)' : 'none', transition: 'all .4s' }}>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <Image src="/img_robo_logo.png" alt="MetaTEC" width={36} height={36} style={{ borderRadius: '50%', border: '1.5px solid rgba(0,200,180,0.5)', objectFit: 'cover', boxShadow: '0 0 12px rgba(0,200,180,0.3)' }} />
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: 4, color: '#fff', textTransform: 'uppercase' }}>
              Meta<em style={{ color: '#00c8b4', fontStyle: 'normal' }}>TEC</em>
            </span>
          </a>
          <div style={{ display: 'flex', gap: 32 }}>
            {[['Processo','#processo'],['Segurança','#seguranca'],['Painel','#painel'],['Planos','#planos']].map(([label, href]) => (
              <a key={label} href={href} style={{ color: '#6a90a0', fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', textDecoration: 'none', transition: 'color .2s' }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = '#00c8b4'}
                onMouseLeave={e => (e.target as HTMLElement).style.color = '#6a90a0'}>
                {label}
              </a>
            ))}
          </div>
          <a href="/builder" style={{ border: '1px solid #00c8b4', color: '#00c8b4', padding: '8px 22px', borderRadius: 3, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', textDecoration: 'none', transition: 'all .25s', background: 'transparent' }}
            onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(0,200,180,0.1)'; (e.target as HTMLElement).style.boxShadow = '0 0 20px rgba(0,200,180,0.3)' }}
            onMouseLeave={e => { (e.target as HTMLElement).style.background = 'transparent'; (e.target as HTMLElement).style.boxShadow = 'none' }}>
            Orçamento
          </a>
        </nav>

        {/* HERO */}
        <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 68, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, zIndex: 0, transform: `translateY(${scrollY * .3}px)` }}>
            <Image src="/img_dashboard.png" alt="" fill style={{ objectFit: 'cover', objectPosition: 'center right', filter: 'brightness(0.22) saturate(2.5) hue-rotate(10deg)' }} priority />
          </div>
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(110deg, rgba(2,5,9,0.98) 0%, rgba(2,5,9,0.88) 42%, rgba(2,5,9,0.35) 100%)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,200,180,0.6), transparent)', zIndex: 2, animation: 'scanline 4s linear infinite' }} />
          <div style={{ position: 'relative', zIndex: 3, padding: '0 5%', maxWidth: 720, width: '100%' }}>
            <div className="fade-in" style={{ ...S.fadeIn, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 4, color: '#00c8b4', marginBottom: 18, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#00c8b4', boxShadow: '0 0 8px #00c8b4', animation: 'pulse 2s infinite' }} />
              MetaTEC — Expert Advisors MQL5 — Entregues e Verificados
            </div>
            <h1 className="fade-in" style={{ ...S.fadeIn, transitionDelay: '.1s', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(60px, 9vw, 110px)', fontWeight: 900, lineHeight: .9, color: '#fff', marginBottom: 28, letterSpacing: -2 }}>
              O FUTURO<br />
              <span style={{ color: '#00c8b4', textShadow: '0 0 40px rgba(0,200,180,0.4)' }}>CHEGOU</span><br />
              <span style={{ color: '#b8ff57', textShadow: '0 0 40px rgba(184,255,87,0.35)' }}>AO SEU TRADE</span>
            </h1>
            <p className="fade-in" style={{ ...S.fadeIn, transitionDelay: '.2s', fontSize: 16, color: '#6a90a0', lineHeight: 1.8, marginBottom: 40, maxWidth: 540 }}>
              Somos a <strong style={{ color: '#cfe8f0' }}>Inovação</strong>. Somos a <strong style={{ color: '#cfe8f0' }}>segurança</strong>. Programamos, verificamos com <strong style={{ color: '#00c8b4' }}>9 agentes especializados</strong> e entregamos seu robô MT5 licenciado e pronto para operar.
            </p>
            {/* ✅ SÓ O BOTÃO PRINCIPAL — WhatsApp removido */}
            <div className="fade-in" style={{ ...S.fadeIn, transitionDelay: '.3s', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <a href="/builder" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#00c8b4', color: '#000', padding: '15px 36px', borderRadius: 3, fontSize: 13, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', textDecoration: 'none', boxShadow: '0 0 40px rgba(0,200,180,0.4)', transition: 'all .3s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 0 60px rgba(0,200,180,0.7)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 0 40px rgba(0,200,180,0.4)'}>
                ⚡ Quero meu Robô
              </a>
            </div>
            <div className="fade-in" style={{ ...S.fadeIn, transitionDelay: '.4s', display: 'flex', gap: 40, marginTop: 56 }}>
              {[['200+', 'Robôs entregues'], ['9.56', 'Nota média'], ['0 err', 'Compilação']].map(([num, label]) => (
                <div key={label}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 40, fontWeight: 900, color: '#00c8b4', lineHeight: 1, textShadow: '0 0 20px rgba(0,200,180,0.4)' }}>{num}</div>
                  <div style={{ fontSize: 10, color: '#3d6070', letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROCESSO */}
        <section id="processo" style={{ padding: '120px 5%', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 1, height: '100%', background: 'linear-gradient(to bottom, transparent, rgba(0,200,180,0.15), transparent)', pointerEvents: 'none' }} />
          <div className="fade-in" style={{ ...S.fadeIn, textAlign: 'center', marginBottom: 70 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 3, color: '#00c8b4', marginBottom: 14, textTransform: 'uppercase' }}>// Como funciona</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(36px, 5vw, 66px)', fontWeight: 900, color: '#fff' }}>DO PEDIDO AO <span style={{ color: '#00c8b4' }}>CÓDIGO RODANDO</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, maxWidth: 1100, margin: '0 auto' }}>
            {[
              { n: '01', icon: '🧩', title: 'Monte sua Estratégia', desc: 'Indicadores, tipo de ordem, gestão de risco e lógica operacional no Builder online.' },
              { n: '02', icon: '💳', title: 'Confirme o Pagamento', desc: 'PIX, boleto ou cartão em até 12x. Preço calculado em tempo real.' },
              { n: '03', icon: '💻', title: 'Programamos seu Robô', desc: 'EA gerado com todas as proteções padrão MetaTEC embutidas.' },
              { n: '04', icon: '🛡️', title: '9 Agentes Verificam', desc: 'Placar Final com 9 verificações especializadas. Nota mínima 9.7.' },
              { n: '05', icon: '📨', title: 'Enviamos por E-mail', desc: 'O .mq5 aprovado chega com seu CPF na licença. Compile e opere.' },
            ].map((step, i) => (
              <div key={step.n} className="fade-in" style={{ ...S.fadeIn, transitionDelay: `${i * .1}s`, background: 'rgba(7,24,40,0.7)', border: '1px solid rgba(0,200,180,0.1)', borderRadius: 10, padding: 28, backdropFilter: 'blur(10px)', transition: 'border-color .3s, transform .3s, box-shadow .3s', cursor: 'default' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,200,180,0.4)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,200,180,0.1)'; (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#00c8b4', letterSpacing: 2, background: 'rgba(0,200,180,0.1)', padding: '2px 8px', borderRadius: 2 }}>{step.n}</span>
                  <span style={{ fontSize: 22 }}>{step.icon}</span>
                </div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 21, fontWeight: 700, color: '#fff', marginBottom: 10 }}>{step.title}</div>
                <div style={{ fontSize: 13, color: '#6a90a0', lineHeight: 1.65 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* SEGURANÇA */}
        <section id="seguranca" style={{ padding: '120px 5%', background: 'rgba(7,24,40,0.4)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,200,180,0.05) 0%, transparent 70%)', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            <div>
              <div className="fade-in" style={{ ...S.fadeIn, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 3, color: '#00c8b4', marginBottom: 14, textTransform: 'uppercase' }}>// Proteção total</div>
              <h2 className="fade-in" style={{ ...S.fadeIn, transitionDelay: '.1s', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(36px, 4vw, 58px)', fontWeight: 900, color: '#fff', lineHeight: 1, marginBottom: 24 }}>
                6 CAMADAS DE<br /><span style={{ color: '#00c8b4' }}>SEGURANÇA</span><br />EMBUTIDAS
              </h2>
              <p className="fade-in" style={{ ...S.fadeIn, transitionDelay: '.2s', fontSize: 14, color: '#6a90a0', lineHeight: 1.8, marginBottom: 36 }}>
                Todo robô MetaTEC é entregue com proteções nativas que garantem operação segura, sem duplicação de ordens, sem travamentos.
              </p>
              <div className="fade-in" style={{ ...S.fadeIn, transitionDelay: '.3s', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  ['🛡️ Anti-Delay', 'iTime() — 2 camadas de proteção'],
                  ['🚫 Anti-Duplicação', 'HasPos() + timeout 5s'],
                  ['📡 Verificação de Conexão', 'TERMINAL_CONNECTED check'],
                  ['📊 Filtro de Spread', 'Spread máximo configurável'],
                  ['🔐 Licença CPF', 'Vinculada ao seu documento'],
                  ['⏰ Gestão de Horário', 'Horário BR com conversão'],
                ].map(([title, desc]) => (
                  <div key={title as string} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '12px 16px', background: 'rgba(0,200,180,0.04)', border: '1px solid rgba(0,200,180,0.1)', borderRadius: 6 }}>
                    <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{(title as string).split(' ')[0]}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#cfe8f0', marginBottom: 2 }}>{(title as string).substring(2)}</div>
                      <div style={{ fontSize: 11, color: '#3d6070', fontFamily: "'JetBrains Mono', monospace" }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="fade-in" style={{ ...S.fadeIn, transitionDelay: '.2s', position: 'relative' }}>
              <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(0,200,180,0.2)', boxShadow: '0 0 60px rgba(0,200,180,0.1)' }}>
                <Image src="/img_placar.jpg" alt="Placar de segurança" width={500} height={360} style={{ width: '100%', height: 'auto', display: 'block', filter: 'saturate(1.4) brightness(0.9)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,200,180,0.08), transparent)' }} />
              </div>
              <div style={{ position: 'absolute', top: -20, right: -20, background: 'rgba(7,24,40,0.95)', border: '1px solid rgba(184,255,87,0.3)', borderRadius: 8, padding: '12px 18px', backdropFilter: 'blur(10px)', animation: 'float 4s ease-in-out infinite' }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 900, color: '#b8ff57', lineHeight: 1 }}>9.56</div>
                <div style={{ fontSize: 9, color: '#3d6070', letterSpacing: 1, textTransform: 'uppercase' }}>Nota Média</div>
              </div>
            </div>
          </div>
        </section>

        {/* PAINEL VOANDO */}
        <section id="painel" style={{ padding: '120px 5%', position: 'relative', overflow: 'hidden', minHeight: '80vh' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '5%', right: '2%', width: '45%', opacity: .18, transform: `translateY(${scrollY * .08}px) rotate(-3deg)`, transition: 'transform .1s', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(0,200,180,0.3)', boxShadow: '0 0 60px rgba(0,200,180,0.15)' }}>
              <Image src="/img_dashboard.png" alt="" width={600} height={400} style={{ width: '100%', height: 'auto', filter: 'saturate(2) hue-rotate(10deg)' }} />
            </div>
            <div style={{ position: 'absolute', bottom: '5%', left: '3%', width: '18%', opacity: .15, transform: `translateY(${-scrollY * .06}px) rotate(4deg)`, transition: 'transform .1s', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(184,255,87,0.2)', boxShadow: '0 0 40px rgba(184,255,87,0.1)' }}>
              <Image src="/img_celular.jpg" alt="" width={200} height={380} style={{ width: '100%', height: 'auto', filter: 'saturate(1.8)' }} />
            </div>
            <div style={{ position: 'absolute', top: '30%', right: '15%', width: '22%', opacity: .12, transform: `translateY(${scrollY * .05}px) rotate(-5deg)`, transition: 'transform .1s', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(0,200,180,0.2)' }}>
              <Image src="/img_mobile.jpg" alt="" width={280} height={200} style={{ width: '100%', height: 'auto', filter: 'saturate(2) brightness(1.2) hue-rotate(20deg)' }} />
            </div>
          </div>
          <div style={{ position: 'relative', zIndex: 2, maxWidth: 1100, margin: '0 auto' }}>
            <div className="fade-in" style={{ ...S.fadeIn, textAlign: 'center', marginBottom: 70 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 3, color: '#00c8b4', marginBottom: 14, textTransform: 'uppercase' }}>// Controle total</div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(36px, 5vw, 66px)', fontWeight: 900, color: '#fff' }}>
                PAINEL <span style={{ color: '#b8ff57' }}>INTELIGENTE</span><br />NO SEU GRÁFICO
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              {[
                { icon: '🔴', title: 'Botão LIGAR/DESLIGAR', desc: 'Ativa e desativa o robô sem remover do gráfico. Zero interferência.', color: '#ff3b5c' },
                { icon: '💰', title: 'P&L em Tempo Real', desc: 'Lucro e perda do dia exibidos diretamente no painel do gráfico.', color: '#b8ff57' },
                { icon: '🎯', title: 'Zerar Posições', desc: 'Fecha todas as ordens do robô com um clique. Segurança máxima.', color: '#00c8b4' },
                { icon: '📡', title: 'Status de Conexão', desc: 'Monitora a conexão com o servidor MT5 em tempo real.', color: '#ffb830' },
              ].map((card, i) => (
                <div key={card.title} className="fade-in" style={{ ...S.fadeIn, transitionDelay: `${i * .1}s`, background: 'rgba(7,24,40,0.85)', border: `1px solid rgba(${card.color === '#00c8b4' ? '0,200,180' : card.color === '#b8ff57' ? '184,255,87' : card.color === '#ff3b5c' ? '255,59,92' : '255,184,48'},0.15)`, borderRadius: 12, padding: 28, backdropFilter: 'blur(16px)', transition: 'transform .3s, box-shadow .3s', cursor: 'default' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-8px) scale(1.02)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 24px 48px rgba(0,0,0,0.5)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '' }}>
                  <div style={{ fontSize: 32, marginBottom: 16 }}>{card.icon}</div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 10 }}>{card.title}</div>
                  <div style={{ fontSize: 13, color: '#6a90a0', lineHeight: 1.7 }}>{card.desc}</div>
                </div>
              ))}
            </div>
            <div className="fade-in" style={{ ...S.fadeIn, transitionDelay: '.3s', marginTop: 60, background: 'rgba(7,24,40,0.9)', border: '1px solid rgba(0,200,180,0.2)', borderRadius: 12, padding: 28, backdropFilter: 'blur(20px)', boxShadow: '0 0 80px rgba(0,200,180,0.08)' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#3d6070', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>// Preview do painel — MetaTEC EA v1.0</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {[
                  { label: 'STATUS', value: '● ATIVO', color: '#00c8b4' },
                  { label: 'P&L DIA', value: '+R$ 420', color: '#b8ff57' },
                  { label: 'POSIÇÕES', value: '1 aberta', color: '#fff' },
                  { label: 'SPREAD', value: '2 pts', color: '#fff' },
                ].map(item => (
                  <div key={item.label} style={{ background: 'rgba(0,200,180,0.04)', border: '1px solid rgba(0,200,180,0.1)', borderRadius: 6, padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: '#3d6070', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>{item.label}</div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 900, color: item.color }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 9 AGENTES */}
        <section id="agentes" style={{ padding: '120px 5%', background: 'rgba(7,24,40,0.35)' }}>
          <div className="fade-in" style={{ ...S.fadeIn, textAlign: 'center', marginBottom: 70 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 3, color: '#00c8b4', marginBottom: 14, textTransform: 'uppercase' }}>// Verificação técnica</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(36px, 5vw, 66px)', fontWeight: 900, color: '#fff' }}>
              9 AGENTES <span style={{ color: '#b8ff57' }}>VERIFICAM</span> SEU ROBÔ
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10, maxWidth: 900, margin: '0 auto' }}>
            {[
              { n: 'Anti-Delay', nota: '10.0', obs: '2 camadas iTime()', ok: true },
              { n: 'Spread', nota: '10.0', obs: 'Filtro ativo', ok: true },
              { n: 'Capital', nota: '9.0', obs: 'Fórmula revisada', ok: false },
              { n: 'Indicadores', nota: '9.0', obs: 'DI+ / DI-', ok: false },
              { n: 'Horário', nota: '10.0', obs: 'Conversão BR', ok: true },
              { n: 'Consistência', nota: '9.0', obs: 'statusTxt', ok: false },
              { n: 'Risco/Retorno', nota: '10.0', obs: 'SL/TP dinâmico', ok: true },
              { n: 'Conexão', nota: '10.0', obs: 'Terminal check', ok: true },
              { n: 'FluxoExecucao', nota: '10.0', obs: 'Teste 4 aprovado', ok: true },
            ].map((ag, i) => (
              <div key={ag.n} className="fade-in" style={{ ...S.fadeIn, transitionDelay: `${i * .07}s`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(7,24,40,0.9)', border: `1px solid ${ag.ok ? 'rgba(184,255,87,0.15)' : 'rgba(255,184,48,0.15)'}`, borderRadius: 6, padding: '14px 20px', backdropFilter: 'blur(10px)' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{ag.n}</div>
                  <div style={{ fontSize: 10, color: '#3d6070', fontFamily: "'JetBrains Mono', monospace" }}>{ag.obs}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 900, color: ag.ok ? '#b8ff57' : '#ffb830', textShadow: ag.ok ? '0 0 16px rgba(184,255,87,0.4)' : 'none' }}>{ag.nota}</span>
                  <span style={{ fontSize: 16 }}>{ag.ok ? '✅' : '⚠️'}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="fade-in" style={{ ...S.fadeIn, textAlign: 'center', marginTop: 50 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 80, fontWeight: 900, color: '#b8ff57', textShadow: '0 0 40px rgba(184,255,87,0.3)', lineHeight: 1 }}>9.56</div>
            <div style={{ fontSize: 12, color: '#3d6070', letterSpacing: 2, textTransform: 'uppercase', marginTop: 8 }}>Nota média / 10.0</div>
          </div>
        </section>

        {/* PLANOS */}
        <section id="planos" style={{ padding: '120px 5%' }}>
          <div className="fade-in" style={{ ...S.fadeIn, textAlign: 'center', marginBottom: 70 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 3, color: '#00c8b4', marginBottom: 14, textTransform: 'uppercase' }}>// Investimento</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(36px, 5vw, 66px)', fontWeight: 900, color: '#fff' }}>
              EXATAMENTE O QUE <span style={{ color: '#00c8b4' }}>VOCÊ PEDIU</span>
            </h2>
          </div>
          <div className="fade-in" style={{ ...S.fadeIn, maxWidth: 560, margin: '0 auto', background: 'rgba(7,24,40,0.8)', border: '1px solid rgba(0,200,180,0.25)', borderRadius: 16, padding: 48, backdropFilter: 'blur(20px)', boxShadow: '0 0 80px rgba(0,200,180,0.08)' }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 64, fontWeight: 900, color: '#fff', marginBottom: 6, lineHeight: 1 }}>
              R$<span style={{ color: '#b8ff57', textShadow: '0 0 30px rgba(184,255,87,0.3)' }}>300</span><sup style={{ fontSize: 22, color: '#3d6070', verticalAlign: 'super' }}>+</sup>
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
              ].map(feat => (
                <div key={feat} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, color: '#cfe8f0' }}>
                  <span style={{ color: '#00c8b4', flexShrink: 0, fontWeight: 900, marginTop: 2 }}>✓</span>
                  {feat}
                </div>
              ))}
            </div>
            <a href="/builder" style={{ display: 'block', textAlign: 'center', background: 'linear-gradient(135deg, #00c8b4, #00f5e0)', color: '#000', padding: '18px 32px', borderRadius: 6, fontSize: 15, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', textDecoration: 'none', boxShadow: '0 0 40px rgba(0,200,180,0.4)', transition: 'all .3s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 0 60px rgba(0,200,180,0.7)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 0 40px rgba(0,200,180,0.4)'}>
              ⚡ Montar meu Robô
            </a>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ padding: '70px 5% 40px', borderTop: '1px solid rgba(0,200,180,0.1)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Image src="/img_robo_logo.png" alt="MetaTEC" width={32} height={32} style={{ borderRadius: '50%', border: '1px solid rgba(0,200,180,0.4)', objectFit: 'cover' }} />
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: 3, color: '#fff' }}>Meta<span style={{ color: '#00c8b4' }}>TEC</span></span>
            </div>
            <div style={{ fontSize: 13, color: '#3d6070', lineHeight: 1.8 }}>Tecnologia de última geração para automação no MetaTrader 5.</div>
          </div>
          <div>
            <div style={{ fontSize: 9, letterSpacing: 2, color: '#3d6070', textTransform: 'uppercase', marginBottom: 18, fontFamily: "'JetBrains Mono', monospace" }}>Navegação</div>
            {[['Processo','#processo'],['Segurança','#seguranca'],['Painel','#painel'],['9 Agentes','#agentes'],['Planos','#planos']].map(([label, href]) => (
              <div key={label} style={{ marginBottom: 10 }}>
                <a href={href} style={{ color: '#6a90a0', fontSize: 13, textDecoration: 'none', transition: 'color .2s' }}
                  onMouseEnter={e => (e.target as HTMLElement).style.color = '#00c8b4'}
                  onMouseLeave={e => (e.target as HTMLElement).style.color = '#6a90a0'}>
                  {label}
                </a>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 9, letterSpacing: 2, color: '#3d6070', textTransform: 'uppercase', marginBottom: 18, fontFamily: "'JetBrains Mono', monospace" }}>Mercados</div>
            {['B3 — WIN$/WDO$', 'Forex', 'Cripto'].map(m => (<div key={m} style={{ color: '#6a90a0', fontSize: 13, marginBottom: 10 }}>{m}</div>))}
          </div>
          {/* ✅ Contato — só e-mail, WhatsApp removido */}
          <div>
            <div style={{ fontSize: 9, letterSpacing: 2, color: '#3d6070', textTransform: 'uppercase', marginBottom: 18, fontFamily: "'JetBrains Mono', monospace" }}>Contato</div>
            <div><a href="mailto:metatec2008@gmail.com" style={{ color: '#6a90a0', fontSize: 13, textDecoration: 'none' }}>metatec2008@gmail.com</a></div>
          </div>
        </footer>
        <div style={{ padding: '20px 5%', borderTop: '1px solid rgba(0,200,180,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontSize: 11, color: '#3d6070' }}>© 2025 MetaTEC · Todos os direitos reservados</span>
          <span style={{ fontSize: 11, color: '#3d6070', fontFamily: "'JetBrains Mono', monospace" }}>
            <span style={{ color: '#00c8b4', marginRight: 6 }}>●</span>Sistemas operacionais · 27/27 checks ativos
          </span>
        </div>

      </div>

      {/* ✅ BOTÃO FLUTUANTE — robô aponta para orçamento */}
      <a href="/builder" style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 700, width: 58, height: 58, borderRadius: '50%', background: 'rgba(0,200,180,0.12)', border: '1px solid rgba(0,200,180,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, textDecoration: 'none', boxShadow: '0 0 24px rgba(0,200,180,0.25)', backdropFilter: 'blur(12px)', transition: 'all .3s', animation: 'float 3s ease-in-out infinite' }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 0 40px rgba(0,200,180,0.5)'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 0 24px rgba(0,200,180,0.25)'}>
        🤖
      </a>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Barlow+Condensed:wght@700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
        .fade-in { opacity: 0; transform: translateY(32px); transition: opacity .8s ease, transform .8s ease; }
        @keyframes scanline { 0% { top: -2px; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100vh; opacity: 0; } }
        @keyframes pulse { 0%, 100% { opacity: 1; box-shadow: 0 0 8px #00c8b4; } 50% { opacity: .5; box-shadow: 0 0 16px #00c8b4; } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: rgba(7,24,40,0.5); }
        ::-webkit-scrollbar-thumb { background: rgba(0,200,180,0.4); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0,200,180,0.7); }
        @media (max-width: 768px) {
          #seguranca > div { grid-template-columns: 1fr !important; gap: 40px !important; }
          #agentes > div:nth-child(2) { grid-template-columns: 1fr !important; }
          nav > div:nth-child(2) { display: none !important; }
        }
      `}</style>
    </main>
  )
}
