import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext'
import {
  Heart, Brain, Bone, Eye, Smile, Microscope, Baby, Scan,
  ShieldCheck, Zap, MessageCircle, Search, CalendarCheck, CheckCircle,
  Star, Moon, Sun, ChevronRight, Phone, Mail, MapPin,
  Clock, Users, Award, TrendingUp, Activity, Stethoscope,
  ArrowRight, Menu, X
} from 'lucide-react'
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'
const specialities = [
  { icon: Heart, name: 'Cardiology', desc: 'Heart & vascular care', color: '#ef4444' },
  { icon: Brain, name: 'Neurology', desc: 'Brain & nervous system', color: '#8b5cf6' },
  { icon: Bone, name: 'Orthopedics', desc: 'Bones & joints', color: '#f59e0b' },
  { icon: Eye, name: 'Ophthalmology', desc: 'Eye care', color: '#06b6d4' },
  { icon: Smile, name: 'Dentistry', desc: 'Oral health', color: '#10b981' },
  { icon: Microscope, name: 'Dermatology', desc: 'Skin care', color: '#ec4899' },
  { icon: Baby, name: 'Pediatrics', desc: 'Child health', color: '#3b82f6' },
  { icon: Scan, name: 'Radiology', desc: 'Imaging & diagnosis', color: '#0d9488' },
]

const stats = [
  { value: '10,000+', label: 'Patients Served', icon: Users },
  { value: '500+', label: 'Expert Doctors', icon: Stethoscope },
  { value: '50+', label: 'Specialities', icon: Activity },
  { value: '4.9', label: 'Average Rating', icon: Star },
]

const steps = [
  { icon: Search, title: 'Search Doctor', desc: 'Find doctors by speciality, name, or location in seconds.', step: '01' },
  { icon: CalendarCheck, title: 'Book Slot', desc: 'Pick a convenient time slot from available appointments.', step: '02' },
  { icon: CheckCircle, title: 'Get Confirmed', desc: 'Receive instant confirmation and reminders via SMS & email.', step: '03' },
]

const testimonials = [
  { name: 'Priya Sharma', role: 'Cardiac Patient', text: 'Booking my cardiology appointment was seamless. The doctor was incredibly professional and thorough. Highly recommend MediBook!', avatar: 'PS', rating: 5 },
  { name: 'Rahul Mehta', role: 'Patient', text: 'MediBook saved me hours of waiting. I got a same-day appointment with a top neurologist — something I thought was impossible.', avatar: 'RM', rating: 5 },
  { name: 'Anjali Singh', role: 'Parent', text: 'As a parent, finding a trusted pediatrician quickly is everything. MediBook delivered exactly that. Smooth, reliable, and stress-free.', avatar: 'AS', rating: 5 },
]

const team = [
  { name: 'Dr. Arun Kapoor', role: 'Chief Medical Officer', specialty: 'Cardiology', exp: '22 yrs', initials: 'AK' },
  { name: 'Dr. Meena Iyer', role: 'Head of Neurology', specialty: 'Neurology', exp: '18 yrs', initials: 'MI' },
  { name: 'Dr. Vikram Nair', role: 'Lead Surgeon', specialty: 'Orthopedics', exp: '15 yrs', initials: 'VN' },
]

function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, inView]
}

function AnimatedCounter({ target, dark }) {
  const [count, setCount] = useState(0)
  const raw = target.replace(/[^0-9.]/g, '')
  const num = parseFloat(raw)
  const suffix = target.replace(/[\d,]/g, '')
  const isDecimal = raw.includes('.')
  useEffect(() => {
    let start = 0
    const step = num / 60
    const timer = setInterval(() => {
      start += step
      if (start >= num) { setCount(num); clearInterval(timer) }
      else setCount(start)
    }, 25)
    return () => clearInterval(timer)
  }, [num])
  return <>{isDecimal ? count.toFixed(1) : Math.floor(count).toLocaleString()}{suffix}</>
}

export default function Home() {
  const navigate = useNavigate()
  const { dark, setDark } = useContext(ThemeContext)

  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setDark(true)
    }
  }, [])
  const [scrolled, setScrolled] = useState(false)

  const aboutRef = useRef(null)
  const [heroRef, heroInView] = useInView(0.1)
  const [statsRef, statsInView] = useInView(0.2)
  const [specRef, specInView] = useInView(0.1)
  const [stepsRef, stepsInView] = useInView(0.1)
  const [testRef, testInView] = useInView(0.1)
  const [aboutSecRef, aboutInView] = useInView(0.1)
  const [ctaRef, ctaInView] = useInView(0.2)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  
  const scrollToAbout = () => {
    aboutRef.current?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  // ── Color tokens ──────────────────────────────────────────────
  const c = {
    bg:        dark ? '#0a0f1e' : '#f0faf8',
    surface:   dark ? '#111827' : '#ffffff',
    surface2:  dark ? '#1a2235' : '#f8fffe',
    border:    dark ? 'rgba(20,184,166,0.18)' : 'rgba(20,184,166,0.2)',
    text:      dark ? '#f1f5f9' : '#0d1f1c',
    textMuted: dark ? '#94a3b8' : '#4b7a72',
    primary:   '#0d9488',   // teal-600
    primaryLt: '#14b8a6',   // teal-500
    primaryDk: '#0f766e',   // teal-700
    accent:    '#f59e0b',   // amber
    accentLt:  '#fbbf24',
    navBg: scrolled
      ? dark ? 'rgba(10,15,30,0.94)' : 'rgba(255,255,255,0.93)'
      : 'transparent',
  }

  const grad = `linear-gradient(135deg, ${c.primary}, #0891b2)`
  const gradHero = dark
    ? 'linear-gradient(160deg, #0a0f1e 0%, #0d1a24 50%, #0a1628 100%)'
    : 'linear-gradient(160deg, #e6faf7 0%, #f0faf8 50%, #e8f5e9 100%)'

  const font = "'DM Sans', system-ui, sans-serif"

  return (
    <div style={{ fontFamily: font, background: c.bg, minHeight: '100vh', overflowX: 'hidden', color: c.text, transition: 'background 0.4s, color 0.4s' }}>

      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${c.primary}; border-radius: 99px; }
        html { scroll-behavior: smooth; }
        .nav-link { font-size: 14px; font-weight: 600; color: ${c.textMuted}; cursor: pointer; transition: color 0.2s; text-decoration: none; }
        .nav-link:hover { color: ${c.primary}; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes pulse-ring { 0%{transform:scale(0.8);opacity:0.8} 100%{transform:scale(1.6);opacity:0} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
      `}</style>

      {/* ── Navbar ────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 5%', height: 68,
        background: c.navBg,
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        boxShadow: scrolled ? `0 1px 28px rgba(13,148,136,0.1)` : 'none',
        transition: 'all 0.35s ease',
        borderBottom: scrolled ? c.border + ' 1px solid' : 'none',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: grad,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 14px rgba(13,148,136,0.4)`,
          }}>
            <Activity size={20} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 22, fontWeight: 800, color: c.primary, letterSpacing: '-0.5px' }}>
            Medi<span style={{ color: c.text }}>Book</span>
          </span>
        </div>

        {/* Desktop nav */}
        {!isMobile ? (
  <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
    {[
      { name: 'Specialities', id: 'specialities' },
      { name: 'How It Works', id: 'how-it-works' },
      { name: 'Testimonials', id: 'testimonials' },
      { name: 'About Us', id: 'about' }
    ].map(link => (
      <span
        key={link.name}
        className="nav-link"
        style={{ color: c.textMuted }}
        onClick={() =>
          document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' })
        }
      >
        {link.name}
      </span>
    ))}
  </div>
) : (
  <button onClick={() => setMenuOpen(true)}>
    <Menu />
  </button>
)}

        {/* Right controls */}
        <div style={{ display: isMobile ? 'none' : 'flex', gap: 10, alignItems: 'center' }}>
          {/* Dark/Light toggle */}
          <button onClick={() => setDark(!dark)} style={{
            width: 40, height: 40, borderRadius: 10,
            border: `1.5px solid ${c.border}`,
            background: c.surface, color: c.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s',
          }}>
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <button onClick={() => navigate('/login')} style={{
            padding: '9px 20px', borderRadius: 10, border: `1.5px solid ${c.primary}`,
            background: 'transparent', color: c.primary, fontWeight: 600, fontSize: 14,
            cursor: 'pointer', transition: 'all 0.2s', fontFamily: font,
          }}
            onMouseEnter={e => { e.target.style.background = 'rgba(13,148,136,0.08)' }}
            onMouseLeave={e => { e.target.style.background = 'transparent' }}
          >Login</button>

          <button onClick={() => navigate('/register')} style={{
            padding: '9px 20px', borderRadius: 10, border: 'none',
            background: grad, color: '#fff',
            fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: font,
            boxShadow: '0 4px 16px rgba(13,148,136,0.35)', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 8px 22px rgba(13,148,136,0.45)' }}
            onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 16px rgba(13,148,136,0.35)' }}
          >Get Started</button>
        </div>
      </nav>
      {menuOpen && (
  <div style={{
    position: 'fixed',
    top: 0,
    right: 0,
    width: '75%',
    height: '100vh',
    background: c.surface,
    padding: 20,
    zIndex: 200
  }}>
    <button onClick={() => setMenuOpen(false)}>
      <X />
    </button>

    {[
      { name: 'Specialities', id: 'specialities' },
      { name: 'How It Works', id: 'how-it-works' },
      { name: 'Testimonials', id: 'testimonials' },
      { name: 'About Us', id: 'about' }
    ].map(link => (
      <div key={link.name}
        style={{ margin: '20px 0', cursor: 'pointer' }}
        onClick={() => {
          document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' })
          setMenuOpen(false)
        }}
      >
        {link.name}
      </div>
    ))}

    <button onClick={() => navigate('/login')}>Login</button>
    <button onClick={() => navigate('/register')}>Get Started</button>
  </div>
)}

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section ref={heroRef} style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', textAlign: 'center', padding: '110px 5% 70px',
        background: gradHero, position: 'relative', overflow: 'hidden',
      }}>
        {/* Subtle grid pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: dark ? 0.04 : 0.06,
          backgroundImage: `radial-gradient(circle, ${c.primary} 1px, transparent 1px)`,
          backgroundSize: '40px 40px', pointerEvents: 'none',
        }} />

        {/* Glow blobs */}
        <div style={{ position: 'absolute', top: '8%', left: '-8%', width: 500, height: 500, borderRadius: '50%', background: dark ? 'rgba(13,148,136,0.12)' : 'rgba(13,148,136,0.1)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '5%', right: '-8%', width: 420, height: 420, borderRadius: '50%', background: dark ? 'rgba(8,145,178,0.1)' : 'rgba(245,158,11,0.1)', filter: 'blur(80px)', pointerEvents: 'none' }} />

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 18px',
          background: dark ? 'rgba(13,148,136,0.15)' : 'rgba(13,148,136,0.1)',
          borderRadius: 999, border: `1px solid rgba(13,148,136,0.25)`,
          fontSize: 13, color: c.primary, fontWeight: 700, marginBottom: 32,
          opacity: heroInView ? 1 : 0, transform: heroInView ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.7s ease', letterSpacing: '0.3px',
        }}>
          <ShieldCheck size={14} strokeWidth={2.5} />
          India's Most Trusted Medical Platform
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(38px,6.5vw,78px)', fontWeight: 800, lineHeight: 1.08,
          color: c.text, marginBottom: 22, maxWidth: 820,
          fontFamily: "'DM Serif Display', serif",
          opacity: heroInView ? 1 : 0, transform: heroInView ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease 0.1s',
          letterSpacing: '-1px',
        }}>
          Your Health,{' '}
          <span style={{
            background: `linear-gradient(90deg, ${c.primary}, #0891b2)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Our Priority
          </span>
        </h1>

        <p style={{
          fontSize: 18, color: c.textMuted, maxWidth: 560, lineHeight: 1.75, marginBottom: 44,
          opacity: heroInView ? 1 : 0, transform: heroInView ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease 0.2s',
        }}>
          Book verified specialist appointments in minutes. 500+ doctors, zero waiting queues — all from your fingertips.
        </p>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 64,
          opacity: heroInView ? 1 : 0, transform: heroInView ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease 0.3s',
        }}>
          <button onClick={() => navigate('/register')} style={{
            padding: '15px 34px', borderRadius: 12, border: 'none',
            background: grad, color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer',
            fontFamily: font, display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 6px 26px rgba(13,148,136,0.4)', transition: 'all 0.25s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(13,148,136,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 26px rgba(13,148,136,0.4)' }}
          >
            Book Appointment <ArrowRight size={17} strokeWidth={2.5} />
          </button>
          <button onClick={scrollToAbout} style={{
            padding: '15px 34px', borderRadius: 12,
            border: `1.5px solid ${c.border}`,
            background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
            color: c.primary, fontWeight: 600, fontSize: 16, cursor: 'pointer',
            fontFamily: font, transition: 'all 0.25s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = dark ? 'rgba(13,148,136,0.12)' : '#fff'; e.currentTarget.style.borderColor = c.primary }}
            onMouseLeave={e => { e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)'; e.currentTarget.style.borderColor = c.border }}
          >
            Learn More
          </button>
        </div>

        {/* Trust pills */}
        <div style={{
          display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center',
          opacity: heroInView ? 1 : 0, transform: heroInView ? 'translateY(0)' : 'translateY(40px)',
          transition: 'all 0.9s ease 0.4s',
        }}>
          {[
            { icon: ShieldCheck, text: 'Verified Doctors' },
            { icon: Zap, text: 'Instant Booking' },
            { icon: MessageCircle, text: '24/7 Support' },
            { icon: Clock, text: 'Same-day Slots' },
          ].map(f => (
            <div key={f.text} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 999,
              background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.85)',
              border: `1px solid ${c.border}`,
              fontSize: 13, fontWeight: 600, color: c.textMuted,
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
            }}>
              <f.icon size={15} color={c.primary} strokeWidth={2.5} /> {f.text}
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <section ref={statsRef} style={{ background: grad, padding: '64px 5%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 40, maxWidth: 960, margin: '0 auto', textAlign: 'center' }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{
              opacity: statsInView ? 1 : 0,
              transform: statsInView ? 'translateY(0)' : 'translateY(30px)',
              transition: `all 0.7s ease ${i * 0.12}s`,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: 'rgba(255,255,255,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 14px',
              }}>
                <s.icon size={22} color="#fff" strokeWidth={2} />
              </div>
              <div style={{ fontSize: 40, fontWeight: 800, color: '#fff', marginBottom: 6, fontFamily: "'DM Serif Display', serif" }}>
                {statsInView ? <AnimatedCounter target={s.value} /> : '0'}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500, letterSpacing: '0.3px', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Specialities ──────────────────────────────────────── */}
      <section ref={specRef} id="specialities" style={{ padding: '90px 5%', background: c.bg, transition: 'background 0.4s' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: c.primary, letterSpacing: 2, textTransform: 'uppercase' }}>Browse by Category</span>
          <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: c.text, margin: '10px 0 12px', fontFamily: "'DM Serif Display', serif" }}>
            Find the Right Specialist
          </h2>
          <p style={{ color: c.textMuted, fontSize: 16 }}>Expert care across every medical discipline</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(148px,1fr))', gap: 20, maxWidth: 980, margin: '0 auto' }}>
          {specialities.map((s, i) => (
            <div key={s.name} onClick={() => navigate('/register')} style={{
              padding: '30px 16px', borderRadius: 18,
              border: `1.5px solid ${c.border}`,
              background: c.surface, textAlign: 'center', cursor: 'pointer',
              transition: 'all 0.25s ease',
              opacity: specInView ? 1 : 0,
              transform: specInView ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.96)',
              transitionDelay: `${i * 0.07}s`,
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.03)'
                e.currentTarget.style.boxShadow = `0 16px 36px rgba(13,148,136,0.15)`
                e.currentTarget.style.borderColor = c.primary
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = c.border
              }}
            >
              <div style={{
                width: 58, height: 58, borderRadius: 16,
                background: `${s.color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 14px',
                border: `1.5px solid ${s.color}28`,
              }}>
                <s.icon size={26} color={s.color} strokeWidth={1.8} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: c.text, marginBottom: 5 }}>{s.name}</div>
              <div style={{ fontSize: 12, color: c.textMuted }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────── */}
      <section ref={stepsRef} id="how-it-works" style={{
        padding: '90px 5%',
        background: dark ? '#0d1520' : '#e8f8f5',
        transition: 'background 0.4s',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: c.primary, letterSpacing: 2, textTransform: 'uppercase' }}>Simple Process</span>
          <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: c.text, margin: '10px 0 12px', fontFamily: "'DM Serif Display', serif" }}>
            Book in 3 Easy Steps
          </h2>
          <p style={{ color: c.textMuted, fontSize: 16 }}>From search to confirmation in under 2 minutes</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 28, maxWidth: 900, margin: '0 auto', position: 'relative' }}>
          {steps.map((s, i) => (
            <div key={s.title} style={{
              background: c.surface, borderRadius: 22, padding: '44px 32px', textAlign: 'center',
              border: `1px solid ${c.border}`,
              boxShadow: dark ? '0 4px 28px rgba(0,0,0,0.35)' : '0 4px 28px rgba(13,148,136,0.08)',
              position: 'relative', overflow: 'hidden',
              opacity: stepsInView ? 1 : 0,
              transform: stepsInView ? 'translateY(0)' : 'translateY(30px)',
              transition: `all 0.7s ease ${i * 0.18}s`,
            }}>
              {/* Large step number watermark */}
              <div style={{
                position: 'absolute', top: -8, right: 16,
                fontSize: 80, fontWeight: 900, color: dark ? 'rgba(13,148,136,0.07)' : 'rgba(13,148,136,0.07)',
                fontFamily: "'DM Serif Display', serif", lineHeight: 1, pointerEvents: 'none',
                userSelect: 'none',
              }}>{s.step}</div>

              <div style={{
                width: 72, height: 72, borderRadius: 20,
                background: `linear-gradient(135deg, rgba(13,148,136,0.12), rgba(8,145,178,0.12))`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px',
                border: `1.5px solid rgba(13,148,136,0.2)`,
              }}>
                <s.icon size={30} color={c.primary} strokeWidth={1.8} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 19, color: c.text, marginBottom: 12 }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: c.textMuted, lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────── */}
      <section ref={testRef} id="testimonials" style={{ padding: '90px 5%', background: c.bg, transition: 'background 0.4s' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: c.primary, letterSpacing: 2, textTransform: 'uppercase' }}>Patient Stories</span>
          <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: c.text, margin: '10px 0', fontFamily: "'DM Serif Display', serif" }}>
            Loved by Thousands
          </h2>
          <p style={{ color: c.textMuted, fontSize: 16 }}>Real experiences from our community</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
          {testimonials.map((t, i) => (
            <div key={t.name} style={{
              background: c.surface, borderRadius: 22, padding: '32px',
              border: `1px solid ${c.border}`,
              boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 20px rgba(13,148,136,0.07)',
              opacity: testInView ? 1 : 0,
              transform: testInView ? 'translateY(0)' : 'translateY(28px)',
              transition: `all 0.7s ease ${i * 0.15}s`,
              position: 'relative',
            }}>
              {/* Quote mark */}
              <div style={{ fontSize: 48, color: c.primary, opacity: 0.2, lineHeight: 1, marginBottom: -8, fontFamily: "'DM Serif Display', serif" }}>"</div>
              
              <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                {Array(t.rating).fill(0).map((_, j) => <Star key={j} size={14} color="#f59e0b" fill="#f59e0b" />)}
              </div>
              <p style={{ color: c.textMuted, fontSize: 15, lineHeight: 1.75, marginBottom: 24 }}>{t.text}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: grad,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800, color: '#fff',
                  boxShadow: '0 4px 12px rgba(13,148,136,0.3)',
                }}>{t.avatar}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: c.text }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: c.primary, fontWeight: 600 }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── About Us ──────────────────────────────────────────── */}
      <section ref={(el) => { aboutRef.current = el; aboutSecRef.current = el }} id="about" style={{
        padding: '90px 5%',
        background: dark ? '#0d1520' : '#f0faf8',
        transition: 'background 0.4s',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: c.primary, letterSpacing: 2, textTransform: 'uppercase' }}>About Us</span>
            <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: c.text, margin: '10px 0 12px', fontFamily: "'DM Serif Display', serif" }}>
              Transforming Healthcare Access
            </h2>
            <p style={{ color: c.textMuted, fontSize: 16, maxWidth: 560, margin: '0 auto' }}>
              MediBook was founded with a single mission: make quality healthcare accessible to every Indian, everywhere.
            </p>
          </div>

          {/* Mission + values grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 28, marginBottom: 60 }}>
            {[
              { icon: Heart, title: 'Our Mission', color: '#ef4444', desc: 'To eliminate the barriers between patients and world-class healthcare by building the most trusted, efficient, and compassionate medical platform in India.' },
              { icon: Award, title: 'Our Standard', color: '#f59e0b', desc: 'Every doctor on MediBook is rigorously verified — credentials, licenses, and patient reviews are checked before any listing goes live.' },
              { icon: TrendingUp, title: 'Our Growth', color: c.primary, desc: 'From a small startup in 2021, we have grown to serve over 10,000 patients monthly across 40+ cities with a 4.9-star average rating.' },
            ].map((v, i) => (
              <div key={v.title} style={{
                background: c.surface,
                borderRadius: 20, padding: '36px 28px',
                border: `1px solid ${c.border}`,
                boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 20px rgba(13,148,136,0.06)',
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: `${v.color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 18, border: `1.5px solid ${v.color}30`,
                }}>
                  <v.icon size={24} color={v.color} strokeWidth={1.8} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 18, color: c.text, marginBottom: 10 }}>{v.title}</h3>
                <p style={{ color: c.textMuted, fontSize: 14, lineHeight: 1.75 }}>{v.desc}</p>
              </div>
            ))}
          </div>

          {/* Team */}
          <div style={{ marginBottom: 60 }}>
            <h3 style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 800, color: c.text, marginBottom: 8, textAlign: 'center', fontFamily: "'DM Serif Display', serif" }}>
              Meet Our Medical Leadership
            </h3>
            <p style={{ color: c.textMuted, fontSize: 15, textAlign: 'center', marginBottom: 36 }}>The experts guiding MediBook's clinical excellence</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 24 }}>
              {team.map(m => (
                <div key={m.name} style={{
                  background: c.surface, borderRadius: 20, padding: '32px 28px',
                  border: `1px solid ${c.border}`, textAlign: 'center',
                  boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 20px rgba(13,148,136,0.06)',
                }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: grad,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontSize: 22, fontWeight: 800, color: '#fff',
                    boxShadow: '0 6px 18px rgba(13,148,136,0.3)',
                  }}>{m.initials}</div>
                  <div style={{ fontWeight: 800, fontSize: 17, color: c.text, marginBottom: 4 }}>{m.name}</div>
                  <div style={{ fontSize: 13, color: c.primary, fontWeight: 600, marginBottom: 6 }}>{m.role}</div>
                  <div style={{ fontSize: 12, color: c.textMuted, marginBottom: 14 }}>{m.specialty}</div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '5px 14px', borderRadius: 999,
                    background: dark ? 'rgba(13,148,136,0.12)' : 'rgba(13,148,136,0.08)',
                    fontSize: 12, fontWeight: 600, color: c.primary,
                    border: `1px solid rgba(13,148,136,0.2)`,
                  }}>
                    <Clock size={11} /> {m.exp} Experience
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact strip */}
          <div style={{
            background: c.surface, borderRadius: 22,
            padding: '36px 40px',
            border: `1px solid ${c.border}`,
            display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'space-between', alignItems: 'center',
            boxShadow: dark ? '0 4px 28px rgba(0,0,0,0.3)' : '0 4px 24px rgba(13,148,136,0.08)',
          }}>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: 20, color: c.text, marginBottom: 6 }}>Get in Touch</h4>
              <p style={{ color: c.textMuted, fontSize: 14 }}>We're always here to help patients and doctors.</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28 }}>
              {[
                { icon: Phone, text: '+91 98765 43210' },
                { icon: Mail, text: 'support@medibook.in' },
                { icon: MapPin, text: 'Mumbai, India' },
              ].map(info => (
                <div key={info.text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'rgba(13,148,136,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid rgba(13,148,136,0.2)`,
                  }}>
                    <info.icon size={16} color={c.primary} strokeWidth={2} />
                  </div>
                  <span style={{ fontSize: 14, color: c.textMuted, fontWeight: 500 }}>{info.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────── */}
      <section ref={ctaRef} style={{
        padding: '90px 5%', textAlign: 'center',
        background: `linear-gradient(135deg, #0f766e, #0891b2, #0d9488)`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-8%', width: 500, height: 500, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-8%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <div style={{
          opacity: ctaInView ? 1 : 0,
          transform: ctaInView ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>
            Start Today
          </div>
          <h2 style={{ fontSize: 'clamp(28px,5vw,56px)', fontWeight: 800, color: '#fff', marginBottom: 18, fontFamily: "'DM Serif Display', serif" }}>
            Take Control of<br />Your Healthcare
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 18, marginBottom: 44 }}>
            Join 10,000+ patients who trust MediBook every day.
          </p>
          <button onClick={() => navigate('/register')} style={{
            padding: '16px 44px', borderRadius: 14, border: 'none',
            background: '#fff', color: c.primary,
            fontWeight: 800, fontSize: 17, cursor: 'pointer', fontFamily: font,
            display: 'inline-flex', alignItems: 'center', gap: 10,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)', transition: 'all 0.25s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(0,0,0,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)' }}
          >
            Get Started Free <ArrowRight size={18} strokeWidth={2.5} />
          </button>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer style={{
        background: dark ? '#070d18' : '#0f2820',
        padding: '60px 5% 32px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 52, flexWrap: 'wrap' }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={18} color="#fff" strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>MediBook</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, fontSize: 14, maxWidth: 240, marginBottom: 24 }}>
                Your trusted partner for specialist appointments and comprehensive healthcare management across India.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                {[FaFacebook, FaTwitter, FaInstagram, FaLinkedin].map((Icon, i) => (
                  <div key={i} style={{
                    width: 36, height: 36, borderRadius: 9,
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(13,148,136,0.3)'; e.currentTarget.style.borderColor = c.primary }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                  >
                    <Icon size={15} color="rgba(255,255,255,0.6)" />
                  </div>
                ))}
              </div>
            </div>

            {/* Link cols */}
            {[
              { title: 'Platform', links: ['Find Doctors', 'Book Appointment', 'For Doctors', 'Specialities'] },
              { title: 'Company', links: ['About Us', 'Careers', 'Blog', 'Press'] },
              { title: 'Support', links: ['Help Center', 'Contact', 'Privacy Policy', 'Terms'] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ color: '#fff', fontWeight: 700, marginBottom: 18, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{col.title}</div>
                {col.links.map(l => (
                  <div key={l} style={{ marginBottom: 12, cursor: 'pointer', fontSize: 14, color: 'rgba(255,255,255,0.45)', transition: 'color 0.2s' }}
                    onClick={l === 'About Us' ? scrollToAbout : undefined}
                    onMouseEnter={e => e.target.style.color = '#5eead4'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.45)'}
                  >{l}</div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 28, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
              © 2026 MediBook Technologies Pvt. Ltd. All rights reserved.
            </span>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              Built with <Heart size={12} color="#ef4444" fill="#ef4444" /> for better healthcare in India
            </span>
          </div>
        </div>
      </footer>

    </div>
  )
}