import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiGet } from '../utils/api';
import JobCard from '../components/JobCard';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { Search, ArrowRight, ShieldCheck, Zap, Globe, Sparkles, Users, Briefcase, Building2, Star, Quote, CheckCircle2, Clock, ChevronRight, MapPin, BookmarkPlus, Bell, MessageSquare, Target, Loader, User, Send, IndianRupee } from 'lucide-react';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.8, rotateX: 25, filter: 'blur(10px)' },
  visible: { opacity: 1, y: 0, scale: 1, rotateX: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 120, damping: 14 } },
};

const floatVariants = {
  animate: (i) => ({
    y: [0, -30 - i * 15, 0, 20 + i * 10, 0],
    x: [0, 15 + i * 10, 0, -15 - i * 10, 0],
    scale: [1, 1.1 + i * 0.05, 1, 0.9 - i * 0.05, 1],
    rotate: [0, -3, 0, 3, 0],
    transition: { duration: 6 + i * 2, repeat: Infinity, ease: 'easeInOut' },
  }),
};

function ParticleNetwork() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let particles = [];
    const count = 60;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
      });
    }

    const handleMouse = (e) => { mouseRef.current.x = e.clientX; mouseRef.current.y = e.clientY; };
    window.addEventListener('mousemove', handleMouse);

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120;
          p.vx += (dx / dist) * force * 0.3;
          p.vy += (dy / dist) * force * 0.3;
        }

        p.vx *= 0.99;
        p.vy *= 0.99;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(129, 140, 248, ${0.3 + p.r * 0.2})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx2 = p.x - p2.x;
          const dy2 = p.y - p2.y;
          const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          if (dist2 < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(129, 140, 248, ${(1 - dist2 / 130) * 0.12})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}
    />
  );
}



function RippleBtn({ children, onClick, className = '', style = {} }) {
  const ref = useRef(null);
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
    if (onClick) onClick(e);
  };

  return (
    <button ref={ref} onClick={handleClick} className={className} style={{ position: 'relative', overflow: 'hidden', ...style }}>
      {ripples.map((r) => (
        <span
          key={r.id}
          style={{
            position: 'absolute', left: r.x - 8, top: r.y - 8, width: 16, height: 16,
            borderRadius: '50%', background: 'rgba(255,255,255,0.3)',
            animation: 'ripple 0.6s ease-out forwards', pointerEvents: 'none',
          }}
        />
      ))}
      {children}
    </button>
  );
}

function WavyText({ text, style = {} }) {
  return (
    <span style={{ display: 'inline-flex', ...style }}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          custom={i}
          initial={{ opacity: 0, y: 30, rotateZ: -10 }}
          whileInView={{ opacity: 1, y: 0, rotateZ: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ delay: i * 0.04, type: 'spring', stiffness: 200, damping: 12 }}
          style={{ display: 'inline-block', whiteSpace: 'pre' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  );
}

function AnimatedGradientText({ children, style = {} }) {
  return (
    <motion.span
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      }}
      transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      style={{
        background: 'linear-gradient(270deg, #818cf8, #f472b6, #c084fc, #818cf8)',
        backgroundSize: '300% 100%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        ...style,
      }}
    >
      {children}
    </motion.span>
  );
}

function MarqueeStrip({ children, speed = 30 }) {
  return (
    <div style={{ overflow: 'hidden', width: '100%', maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}>
      <motion.div
        style={{ display: 'flex', gap: '1.5rem', width: 'max-content' }}
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}

const wordVariants = {
  hidden: { opacity: 0, y: 20, rotateX: -15 },
  visible: (i) => ({
    opacity: 1, y: 0, rotateX: 0,
    transition: { delay: i * 0.07, type: 'spring', stiffness: 250, damping: 22 },
  }),
};

function WordReveal({ text, style = {} }) {
  const words = text.split(' ');
  return (
    <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.25em', ...style }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          custom={i}
          variants={wordVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-20px' }}
          style={{ display: 'inline-block' }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

function ClipReveal({ children }) {
  return (
    <motion.div
      initial={{ clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' }}
      whileInView={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

function GlobalGlow() {
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const springX = useSpring(mouseX, { stiffness: 120, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 20 });

  useEffect(() => {
    const handleMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      style={{
        position: 'fixed', left: springX, top: springY, width: 800, height: 800,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, rgba(56, 189, 248, 0.05) 40%, transparent 70%)',
        transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 9999, mixBlendMode: 'screen'
      }}
    />
  );
}

function ParallaxWrapper({ children, intensity = 10, className = '', style = {} }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 20 });
  const springY = useSpring(y, { stiffness: 150, damping: 20 });

  useEffect(() => {
    const handleMove = (e) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const moveX = ((e.clientX - centerX) / (window.innerWidth / 2)) * intensity;
      const moveY = ((e.clientY - centerY) / (window.innerHeight / 2)) * intensity;
      x.set(moveX);
      y.set(moveY);
    };
    const handleLeave = () => { x.set(0); y.set(0); };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseleave', handleLeave);
    return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseleave', handleLeave); };
  }, [x, y, intensity]);

  return (
    <motion.div ref={ref} style={{ ...style, x: springX, y: springY }} className={className}>
      {children}
    </motion.div>
  );
}

function MagneticButton({ children, as = 'button', className = '', style = {}, onClick, ...props }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 250, damping: 15 });
  const springY = useSpring(y, { stiffness: 250, damping: 15 });

  const handleMouse = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);
    const strength = Math.min(dist / 6, 16);
    x.set((dx / dist) * strength || 0);
    y.set((dy / dist) * strength || 0);
  }, [x, y]);

  const reset = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  const Tag = as;

  return (
    <Tag
      ref={ref} onClick={onClick}
      onMouseMove={handleMouse} onMouseLeave={reset}
      className={className}
      style={{ position: 'relative', ...style }}
      {...props}
    >
      <motion.span style={{ display: 'inline-flex', alignItems: 'center', gap: 'inherit', x: springX, y: springY }}>
        {children}
      </motion.span>
    </Tag>
  );
}

function TiltCard({ children, className = '', style = {} }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const glowX = useMotionValue(0.5);
  const glowY = useMotionValue(0.5);

  const handleMouse = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    x.set((px - 0.5) * 20);
    y.set((py - 0.5) * -20);
    glowX.set(px);
    glowY.set(py);
  }, [x, y, glowX, glowY]);

  const reset = useCallback(() => { x.set(0); y.set(0); }, [x, y]);

  const rotX = useSpring(y, { stiffness: 200, damping: 16 });
  const rotY = useSpring(x, { stiffness: 200, damping: 16 });
  const gx = useSpring(glowX, { stiffness: 100, damping: 20 });
  const gy = useSpring(glowY, { stiffness: 100, damping: 20 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      style={{ ...style, perspective: 1200, rotateX: rotX, rotateY: rotY }}
      className={className}
    >
      <motion.div
        style={{
          position: 'absolute', width: 300, height: 300, borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(129,140,248,0.1) 0%, transparent 70%)',
          left: `calc(${gx} * 100%)`, top: `calc(${gy} * 100%)`,
          transform: 'translate(-50%, -50%)',
          zIndex: 0,
        }}
      />
      <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>{children}</div>
    </motion.div>
  );
}

const companies = [
  { name: 'TechCorp Inc.', industry: 'Technology', color: '#818cf8' },
  { name: 'Stripe Solutions', industry: 'FinTech', color: '#34d399' },
  { name: 'Aesthetic Labs', industry: 'Design', color: '#f472b6' },
  { name: 'DeepCloud AI', industry: 'AI/ML', color: '#38bdf8' },
  { name: 'NovaSoft', industry: 'Software', color: '#fbbf24' },
  { name: 'QuantumEdge', industry: 'Infrastructure', color: '#a78bfa' },
  { name: 'NexusCorp', industry: 'Consulting', color: '#fb923c' },
  { name: 'CyberFlow', industry: 'Cybersecurity', color: '#f87171' },
  { name: 'DataSync', industry: 'Data', color: '#2dd4bf' },
];

function CompanyLogoCard({ company, index }) {
  const initials = company.name.split(' ').map(w => w[0]).join('').slice(0, 2);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      viewport={{ once: true }}
      whileHover={{ y: -6, scale: 1.05 }}
      className="glass"
      style={{
        padding: '1.5rem 1rem', borderRadius: '16px', textAlign: 'center',
        border: `1px solid ${company.color}22`, cursor: 'pointer',
        minWidth: '140px', flex: '1 1 auto',
      }}
    >
      <div style={{
        width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto 0.75rem',
        background: `linear-gradient(135deg, ${company.color}, ${company.color}88)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.1rem', fontWeight: 800, color: '#fff',
        boxShadow: `0 4px 16px ${company.color}33`,
      }}>
        {initials}
      </div>
      <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px', color: 'var(--text-primary)' }}>{company.name}</p>
      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{company.industry}</p>
    </motion.div>
  );
}

const AnimatedCounter = ({ target, label, suffix = '', icon: Icon }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      viewport={{ once: true }}
      style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', padding: '0.75rem 0.5rem' }}>
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        style={{ color: '#818cf8' }}
      >
        <Icon size={18} />
      </motion.div>
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        style={{ fontSize: '1.6rem', fontWeight: 800, background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1 }}
      >
        {count.toLocaleString()}{suffix}
      </motion.span>
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 500 }}
      >
        {label}
      </motion.span>
    </motion.div>
  );
};

const TypewriterText = ({ words }) => {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);

  useEffect(() => {
    if (index >= words.length) { setIndex(0); return; }
    if (subIndex === words[index].length + 1 && !reverse) { setTimeout(() => setReverse(true), 2000); return; }
    if (subIndex === 0 && reverse) { setReverse(false); setIndex((prev) => (prev + 1) % words.length); return; }
    const timeout = setTimeout(() => setSubIndex((prev) => prev + (reverse ? -1 : 1)), reverse ? 50 : 80);
    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, words]);

  return <span>{words[index].substring(0, subIndex)}<span className="typing-cursor"></span></span>;
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [sidebarJobs, setSidebarJobs] = useState([]);
  const [realCompanies, setRealCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [stats, setStats] = useState({ openPositions: 2480, topCompanies: 450, candidatesHired: 12000, satisfactionRate: 98 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    apiGet('/jobs?featured=true').then(jobs => {
      if (jobs) setFeaturedJobs(jobs.slice(0, 6));
    }).catch(() => { }).finally(() => setLoading(false));

    apiGet('/jobs').then(allJobs => {
      if (allJobs && allJobs.length) {
        setSidebarJobs(allJobs.slice(0, 3));
        const seen = new Set();
        const unique = allJobs.filter(j => {
          if (seen.has(j.company_name)) return false;
          seen.add(j.company_name);
          return true;
        }).slice(0, 9).map(j => ({
          name: j.company_name,
          industry: j.type || 'Technology',
          color: ['#818cf8', '#34d399', '#f472b6', '#38bdf8', '#fbbf24', '#a78bfa', '#fb923c', '#f87171', '#2dd4bf'][Math.floor(Math.random() * 9)]
        }));
        setRealCompanies(unique);
      }
    }).catch(() => { });


  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (searchLocation.trim()) params.set('location', searchLocation.trim());
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="landing-container">
      <GlobalGlow />
      <ParticleNetwork />
      <div className="bg-blobs" style={{ overflow: 'hidden' }}>
        <motion.div className="bg-glow-1" custom={0} variants={floatVariants} animate="animate" style={{ transform: 'scale(1.5)', opacity: 0.6 }} />
        <motion.div className="bg-glow-2" custom={1} variants={floatVariants} animate="animate" style={{ transform: 'scale(1.3)', opacity: 0.4 }} />
        <motion.div className="bg-glow-3" custom={2} variants={floatVariants} animate="animate" style={{ opacity: 0.3 }} />
        <div className="bg-noise"></div>
        <div className="bg-lines"></div>
      </div>

      {/* ─── HERO SECTION ─── */}
      <section style={{
        position: 'relative', zIndex: 10, minHeight: isMobile ? 'auto' : '85vh',
        display: 'flex', alignItems: 'center', padding: isMobile ? '1.5rem' : '2rem',
        paddingTop: isMobile ? '1rem' : '2rem',
        maxWidth: '1280px', margin: '0 auto', width: '100%',
      }}>
        <div className="responsive-grid-2" style={{ gap: isMobile ? '2rem' : '4rem', alignItems: 'center', width: '100%', position: 'relative', zIndex: 1 }}>
          <ParallaxWrapper intensity={15} style={{ flex: 1 }}>
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(129, 140, 248, 0.1)', border: '1px solid rgba(129, 140, 248, 0.2)',
                  borderRadius: '100px', padding: '6px 16px 6px 6px', marginBottom: '1.5rem',
                }}>
                <motion.span
                  animate={{ boxShadow: ['0 0 0 0 rgba(129,140,248,0.6)', '0 0 0 8px rgba(129,140,248,0)', '0 0 0 0 rgba(129,140,248,0.6)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    background: 'linear-gradient(135deg, #818cf8, #c084fc)', borderRadius: '100px',
                    padding: '2px 10px', fontSize: '0.7rem', fontWeight: 700, color: '#fff', textTransform: 'uppercase',
                  }}>Live</motion.span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {stats.openPositions.toLocaleString()}+ jobs from top companies
                </span>
              </motion.div>

              <h1 style={{
                fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1rem',
                letterSpacing: '-0.03em',
              }}>
                Find a job that<br />
                <AnimatedGradientText>
                  <TypewriterText words={["matches your skills", "you'll love going to", "builds your future", "respects your time"]} />
                </AnimatedGradientText>
              </h1>

              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '520px' }}>
                Apply to thousands of vetted jobs at India's top companies. One profile, one-click apply, real-time updates.
              </p>

              <form onSubmit={handleSearch} style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  display: 'flex', gap: '8px', padding: '6px',
                  flexDirection: isMobile ? 'column' : 'row',
                  background: 'var(--glass-bg)', backdropFilter: 'blur(20px)',
                  border: '1px solid var(--glass-border)', borderRadius: '16px',
                }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px' }}>
                    <Search size={18} color="var(--text-muted)" />
                    <input type="text" placeholder="Job title, skills, or company" value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.95rem', padding: '10px 0' }} />
                  </div>
                  {!isMobile && <div style={{ width: '1px', background: 'var(--glass-border)' }} />}
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px', borderTop: isMobile ? '1px solid var(--glass-border)' : 'none', paddingTop: isMobile ? '8px' : '0' }}>
                    <MapPin size={18} color="var(--text-muted)" />
                    <input type="text" placeholder="Location" value={searchLocation}
                      onChange={e => setSearchLocation(e.target.value)}
                      style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.95rem', padding: '10px 0' }} />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ borderRadius: '12px', padding: '12px 28px', fontWeight: 700, whiteSpace: 'nowrap', width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}>
                    Search
                  </button>
                </div>
              </form>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexDirection: isMobile ? 'column' : 'row', width: isMobile ? '100%' : 'auto' }}>
                <MagneticButton onClick={() => navigate('/register')} className="btn btn-primary" style={{ borderRadius: '12px', padding: '12px 24px', fontSize: '0.9rem', width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}>
                  Create Free Account <ArrowRight size={16} />
                </MagneticButton>
                <MagneticButton onClick={() => navigate('/jobs')} className="btn btn-outline" style={{ borderRadius: '12px', padding: '12px 24px', fontSize: '0.9rem', width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}>
                  Browse Jobs
                </MagneticButton>
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', gap: isMobile ? '1rem' : '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} color="#34d399" />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No spam</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} color="#34d399" />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verified employers</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} color="#34d399" />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Free forever</span>
                </div>
              </div>
            </motion.div>
          </ParallaxWrapper>

          <ParallaxWrapper intensity={-10} style={{ display: 'flex', justifyContent: 'center' }}>
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
              style={{ position: 'relative', width: '100%' }}>
              <div style={{
                position: 'relative', width: '100%', maxWidth: '480px',
                background: 'var(--glass-bg-strong)', backdropFilter: 'blur(30px)',
                border: '1px solid var(--glass-border)', borderRadius: '24px', padding: isMobile ? '1.25rem' : '2rem',
                boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Featured Today</p>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Top Picks For You</p>
                  </div>
                  <span style={{
                    background: 'rgba(129, 140, 248, 0.12)', color: '#818cf8',
                    padding: '2px 10px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 600,
                  }}>12 new</span>
                </div>

                {(sidebarJobs.length > 0 ? sidebarJobs : [1, 2, 3]).map((job, idx) => {
                  const isJob = typeof job === 'object' && job !== null;
                  const initials = isJob ? (job.company_name || '').split(' ').map(w => w[0]).join('').slice(0, 2) : ['TC', 'SS', 'AL'][idx];
                  const colors = ['#818cf8', '#34d399', '#fbbf24'];
                  return (
                    <motion.div key={isJob ? job.id : idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + idx * 0.15 }}
                      whileHover={{ x: 4 }} onClick={() => isJob && navigate(`/jobs/${job.id}`)}
                      style={{
                        display: 'flex', gap: '12px', padding: isMobile ? '0.75rem' : '1rem', borderRadius: '14px', marginBottom: '8px',
                        background: idx === 0 ? 'rgba(129, 140, 248, 0.06)' : 'transparent',
                        border: idx === 0 ? '1px solid rgba(129, 140, 248, 0.12)' : '1px solid transparent',
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                        background: `linear-gradient(135deg, ${colors[idx]}, ${colors[idx]}88)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', color: '#fff',
                      }}>
                        {initials}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px' }}>
                          {isJob ? job.title : ['Senior React Developer', 'Full Stack Engineer', 'UI/UX Designer'][idx]}
                        </p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                          {isJob ? job.company_name : ['TechCorp Inc.', 'Stripe Solutions', 'Aesthetic Labs'][idx]}
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={10} /> {isJob ? job.location : ['San Francisco', 'New York', 'Remote'][idx]}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <IndianRupee size={10} /> {isJob ? (job.salary_range || 'N/A') : ['₹1Cr+', '₹7,650-9,350/hr', '₹34-46.8L'][idx]}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <BookmarkPlus size={16} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                      </div>
                    </motion.div>
                  );
                })}

                <button onClick={() => navigate('/jobs')} style={{
                  width: '100%', marginTop: '0.5rem', padding: '12px',
                  background: 'rgba(129, 140, 248, 0.1)', border: '1px solid rgba(129, 140, 248, 0.2)',
                  borderRadius: '12px', color: '#818cf8', fontWeight: 600, fontSize: '0.9rem',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(129, 140, 248, 0.2)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(129, 140, 248, 0.1)' }}>
                  View All Openings <ArrowRight size={14} style={{ marginLeft: '6px' }} />
                </button>
              </div>
            </motion.div>
          </ParallaxWrapper>
        </div>
      </section>

      {/* ─── COMPANY LOGO STRIP ─── */}
      <section style={{ position: 'relative', zIndex: 10, padding: isMobile ? '1rem 1rem 2rem' : '2rem 2rem 3rem', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1.5rem' }}>
          Trusted by leading companies
        </motion.p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
          {(realCompanies.length > 0 ? realCompanies : companies).map((c, i) => (
            <CompanyLogoCard key={c.name + i} company={c} index={i} />
          ))}
        </div>
      </section>

      {/* ─── STATS BANNER ─── */}
      <section style={{ position: 'relative', zIndex: 10, padding: isMobile ? '0.5rem 1rem 2rem' : '1rem 2rem 3rem', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div className="glass stats-banner" style={{
          borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--glass-border)',
        }}>
          <AnimatedCounter target={stats.openPositions} label="Open Positions" suffix="+" icon={Briefcase} />
          <div className="stat-divider" />
          <AnimatedCounter target={stats.topCompanies} label="Active Employers" suffix="+" icon={Building2} />
          <div className="stat-divider" />
          <AnimatedCounter target={stats.candidatesHired} label="Hired This Year" suffix="+" icon={Users} />
          <div className="stat-divider" />
          <AnimatedCounter target={stats.satisfactionRate} label="Satisfaction Rate" suffix="%" icon={Star} />
        </div>
      </section>

      {/* ─── FEATURED JOBS ─── */}
      <section style={{ position: 'relative', zIndex: 10, padding: isMobile ? '1rem 1rem 2rem' : '2rem 2rem 3rem', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '2rem', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '0.75rem' : '0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' }}>
            <p style={{ color: '#818cf8', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Featured</p>
            <h2 style={{ fontSize: isMobile ? '1.35rem' : '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}><WordReveal text="Handpicked for you" /></h2>
          </div>
          <RippleBtn onClick={() => navigate('/jobs')} style={{ background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.15)', color: '#818cf8', borderRadius: '10px', padding: '8px 16px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s' }}>
            View All <ChevronRight size={14} />
          </RippleBtn>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <Loader size={32} className="spinner" color="#818cf8" />
          </div>
        ) : featuredJobs.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-30px' }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 380px), 1fr))', gap: '1rem' }}>
            {featuredJobs.map((job, idx) => (
              <motion.div key={job.id} variants={itemVariants} style={{ height: '100%' }}>
                <JobCard job={job} style={{ height: '100%', margin: 0 }} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 380px), 1fr))', gap: '1rem' }}>
            {[1, 2, 3, 4, 5, 6].map((_, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }} viewport={{ once: true }}>
                <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(129,140,248,0.1)', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: '16px', width: '60%', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', marginBottom: '8px' }} />
                      <div style={{ height: '12px', width: '40%', background: 'rgba(255,255,255,0.04)', borderRadius: '4px' }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section style={{ position: 'relative', zIndex: 10, padding: isMobile ? '1rem 1rem 2rem' : '2rem 2rem 3rem', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ color: '#818cf8', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Simple Process</p>
          <h2 style={{ fontSize: isMobile ? '1.35rem' : '1.6rem', fontWeight: 800, margin: 0 }}><WavyText text="How it works" /></h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem', fontSize: '0.9rem' }}>Get started in under 2 minutes</p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1rem' }}>
          {[
            { icon: User, step: '1', title: 'Create Account', desc: 'Sign up with your email and build your professional profile in seconds.', color: '#818cf8' },
            { icon: Search, step: '2', title: 'Find Jobs', desc: 'Browse thousands of curated opportunities from top companies hiring today.', color: '#34d399' },
            { icon: Send, step: '3', title: 'Apply Instantly', desc: 'One-click apply with your saved profile. Track everything in real-time.', color: '#f472b6' },
            { icon: MessageSquare, step: '4', title: 'Get Hired', desc: 'Chat with employers, schedule interviews, and land your dream role.', color: '#fbbf24' },
          ].map((item, idx) => (
            <TiltCard key={idx} style={{ height: '100%' }}>
              <motion.div variants={itemVariants}
                whileHover={{ y: -6, scale: 1.02 }}
                className="glass" style={{
                  padding: '1.5rem', borderRadius: '16px', position: 'relative',
                  border: `1px solid ${item.color}15`, overflow: 'hidden',
                  height: '100%',
                  boxSizing: 'border-box'
                }}>
                <div style={{
                  position: 'absolute', top: '-20px', right: '-20px',
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: `${item.color}08`, zIndex: 1,
                }} />
                <div style={{
                  width: '48px', height: '48px', borderRadius: '14px', marginBottom: '1rem',
                  background: `linear-gradient(135deg, ${item.color}, ${item.color}88)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <item.icon size={22} color="#fff" />
                </div>
                <div style={{
                  position: 'absolute', top: '1rem', right: '1.5rem',
                  fontSize: '2rem', fontWeight: 900, color: `${item.color}12`, lineHeight: 1,
                }}>{item.step}</div>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem', position: 'relative', zIndex: 2 }}>{item.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, position: 'relative', zIndex: 2 }}>{item.desc}</p>
              </motion.div>
            </TiltCard>
          ))}
        </motion.div>
      </section>

      {/* ─── WHY CHOOSE US ─── */}
      <section style={{ position: 'relative', zIndex: 10, padding: isMobile ? '1rem 1rem 2rem' : '2rem 2rem 3rem', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: isMobile ? '1.35rem' : '1.6rem', fontWeight: 800 }}><WordReveal text="Why ElevateHire?" /></h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem', fontSize: '0.85rem' }}>Built differently to help you succeed</p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '1rem' }}>
          {[
            { icon: Zap, title: 'One-Click Apply', desc: 'Save your profile once and apply to any role instantly. No repetitive form filling.' },
            { icon: ShieldCheck, title: 'Verified Employers', desc: 'Every company and job listing is manually reviewed for authenticity.' },
            { icon: Bell, title: 'Real-Time Updates', desc: 'Get instant notifications when employers view your application or update its status.' },
            { icon: Target, title: 'Smart Matching', desc: 'Our AI finds roles that match your skills, experience, and salary expectations.' },
          ].map((item, idx) => (
            <TiltCard key={idx}>
              <motion.div variants={itemVariants}
                whileHover={{ y: -4, scale: 1.01 }}
                className="glass" style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px', marginBottom: '0.75rem',
                  background: 'linear-gradient(135deg, rgba(129,140,248,0.15), rgba(192,132,252,0.15))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8',
                }}>
                  <item.icon size={20} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>{item.desc}</p>
              </motion.div>
            </TiltCard>
          ))}
        </motion.div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section style={{ position: 'relative', zIndex: 10, padding: isMobile ? '1rem 1rem 2rem' : '2rem 2rem 3rem', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: isMobile ? '1.35rem' : '1.6rem', fontWeight: 800 }}><WordReveal text="What people say" /></h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem', fontSize: '0.85rem' }}>Join thousands of successful professionals</p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1rem' }}>
          {[
            { name: 'Alex Rivera', role: 'Senior Engineer', company: 'TechCorp', text: 'Found my dream role in under a week. The one-click apply feature is a game-changer.', initials: 'AR' },
            { name: 'Sarah Chen', role: 'Head of Talent', company: 'Stripe Solutions', text: 'Halved our time-to-hire since switching. The quality of candidates is exceptional.', initials: 'SC' },
            { name: 'Priya Sharma', role: 'Product Designer', company: 'Aesthetic Labs', text: 'Real-time status updates kept me informed throughout. Never left guessing where I stood.', initials: 'PS' },
          ].map((item, idx) => (
            <TiltCard key={idx}>
              <motion.div variants={itemVariants}
                whileHover={{ y: -4, scale: 1.01 }}
                className="glass" style={{
                  padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '0.75rem',
                  border: '1px solid var(--glass-border)',
                }}>
                <Quote size={20} style={{ color: '#818cf8', opacity: 0.5 }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, fontStyle: 'italic', flex: 1 }}>
                  "{item.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.8rem', color: '#fff', flexShrink: 0,
                  }}>
                    {item.initials}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.role} at {item.company}</p>
                  </div>
                </div>
              </motion.div>
            </TiltCard>
          ))}
        </motion.div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ position: 'relative', zIndex: 10, padding: isMobile ? '1rem 1rem 3rem' : '1rem 2rem 4rem', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="glass" style={{
            padding: isMobile ? '2rem 1.5rem' : '3rem 2.5rem', borderRadius: '24px', textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.9), rgba(15, 23, 42, 0.95))',
            border: '1px solid rgba(129, 140, 248, 0.15)',
            position: 'relative', overflow: 'hidden',
          }}>
          <div style={{
            position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
            background: 'radial-gradient(circle at center, rgba(129,140,248,0.06), transparent 60%)',
            pointerEvents: 'none',
          }} />
          <h2 style={{ fontSize: isMobile ? '1.35rem' : '1.6rem', fontWeight: 800, marginBottom: '0.75rem', position: 'relative', zIndex: 1 }}>
            <WordReveal text="Ready to find your next role?" />
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem auto', position: 'relative', zIndex: 1 }}>
            Join thousands of professionals who found their perfect opportunity through ElevateHire.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            <MagneticButton onClick={() => navigate('/register')} className="btn btn-primary" style={{ borderRadius: '12px', padding: '12px 28px', fontSize: '0.9rem' }}>
              Create Free Account
            </MagneticButton>
            <MagneticButton onClick={() => navigate('/jobs')} className="btn btn-outline" style={{ borderRadius: '12px', padding: '12px 28px', fontSize: '0.9rem' }}>
              Browse Jobs
            </MagneticButton>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
