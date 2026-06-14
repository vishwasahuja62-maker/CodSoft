import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, Eye, Heart, Award, Users, TrendingUp, Sparkles, ShieldCheck, Globe } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } }
};

const stats = [
  { icon: Users, value: '50K+', label: 'Active Users' },
  { icon: Award, value: '10K+', label: 'Job Placements' },
  { icon: TrendingUp, value: '95%', label: 'Satisfaction Rate' },
  { icon: Globe, value: '30+', label: 'Countries' },
];

const values = [
  { icon: Target, title: 'Our Mission', desc: 'To democratize access to elite career opportunities by leveraging AI-powered matching that connects exceptional talent with forward-thinking organizations.' },
  { icon: Eye, title: 'Our Vision', desc: 'A world where every professional finds their ideal role and every company discovers the talent that transforms their business.' },
  { icon: Heart, title: 'Our Purpose', desc: 'We believe that the right job changes lives. We exist to make those matches happen at scale, with precision and heart.' },
];

const teamValues = [
  { icon: Sparkles, title: 'Innovation First', desc: 'We push boundaries with AI-driven matching, real-time insights, and seamless hiring workflows.' },
  { icon: ShieldCheck, title: 'Trust & Transparency', desc: 'Every connection is built on verified profiles, honest reviews, and clear communication.' },
  { icon: Users, title: 'Community Driven', desc: 'We grow together. Candidates, employers, and career experts shape every feature we build.' },
];

export default function About() {
  return (
    <div className="landing-container">
      <div className="bg-blobs">
        <div className="bg-glow-1" style={{ top: '10%', left: '5%' }}></div>
        <div className="bg-glow-2" style={{ top: '30%', right: '10%' }}></div>
        <div className="bg-glow-3" style={{ bottom: '20%', left: '50%' }}></div>
      </div>

      {/* Hero */}
      <motion.div initial="initial" animate="animate" variants={stagger} style={{ textAlign: 'center', padding: '6rem 2rem 3rem', maxWidth: '900px', margin: '0 auto' }}>
        <motion.div variants={fadeUp} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)', borderRadius: '999px', padding: '0.4rem 1.2rem', marginBottom: '1.5rem' }}>
          <Sparkles size={14} color="#818cf8" />
          <span style={{ color: '#818cf8', fontSize: '0.85rem', fontWeight: 600 }}>About ElevateHire</span>
        </motion.div>
        <motion.h1 variants={fadeUp} style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, letterSpacing: '-0.03em',
          background: 'linear-gradient(135deg, #c084fc 0%, #f472b6 50%, #fff 100%)',
          WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '1.5rem', lineHeight: 1.15
        }}>
          We're on a mission to transform hiring
        </motion.h1>
        <motion.p variants={fadeUp} style={{ color: '#94a3b8', fontSize: 'clamp(1rem, 2vw, 1.15rem)', lineHeight: 1.7, maxWidth: '700px', margin: '0 auto' }}>
          ElevateHire was founded to bridge the gap between exceptional talent and the companies that need them. 
          We combine cutting-edge AI with a human-centered approach to make hiring faster, fairer, and more meaningful.
        </motion.p>
      </motion.div>

      {/* Stats */}
      <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger}
        style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', padding: '0 2rem 4rem', maxWidth: '900px', margin: '0 auto' }}>
        {stats.map((s, i) => (
          <motion.div key={i} variants={fadeUp}
            style={{ flex: '1', minWidth: '160px', maxWidth: '200px', textAlign: 'center', padding: '2rem 1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px' }}>
            <s.icon size={24} color="#818cf8" style={{ marginBottom: '0.75rem' }} />
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '0.25rem' }}>{s.value}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Mission / Vision / Purpose */}
      <div style={{ padding: '0 2rem 5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {values.map((v, i) => (
            <motion.div key={i} variants={fadeUp}
              style={{ padding: '2.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', transition: 'all 0.3s' }}
              className="hover-card-lift">
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <v.icon size={24} color="#c084fc" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', marginBottom: '0.75rem' }}>{v.title}</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.7, fontSize: '0.95rem' }}>{v.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Our Story */}
      <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger}
        style={{ padding: '0 2rem 5rem', maxWidth: '800px', margin: '0 auto' }}>
        <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, marginBottom: '1.5rem', color: 'white', textAlign: 'center' }}>
          Our Story
        </motion.h2>
        <motion.div variants={fadeUp} style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: '1rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <p>
            ElevateHire started in 2026 when our founders experienced firsthand the broken hiring process — 
            talented candidates overlooked by rigid filters, and great companies drowning in unqualified applications. 
            We set out to build a platform that prioritizes potential over keywords.
          </p>
          <p>
            Today, we're a distributed team of engineers, recruiters, and career coaches spanning 15 countries. 
            Our AI-powered matching engine analyzes skills, culture fit, and growth trajectory — not just resume keywords — 
            to create connections that last.
          </p>
          <p>
            We've helped over 10,000 professionals land roles they love and partnered with 2,000+ companies 
            ranging from fast-growing startups to Fortune 500 enterprises. And we're just getting started.
          </p>
        </motion.div>
      </motion.div>

      {/* Core Values */}
      <div style={{ padding: '0 2rem 5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: 'white', marginBottom: '1rem' }}>What Drives Us</h2>
          <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>These core principles guide every decision we make and every feature we build.</p>
        </motion.div>
        <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {teamValues.map((v, i) => (
            <motion.div key={i} variants={fadeUp}
              style={{ padding: '2.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px' }}
              className="hover-card-lift">
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <v.icon size={24} color="#c084fc" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>{v.title}</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.7, fontSize: '0.95rem' }}>{v.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger}
        style={{ textAlign: 'center', padding: '0 2rem 6rem' }}>
        <motion.p variants={fadeUp} style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '1rem' }}>
          Ready to take the next step in your career journey?
        </motion.p>
        <motion.div variants={fadeUp} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          style={{ display: 'inline-flex' }}>
          <Link to="/register"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.9rem 2rem', borderRadius: '999px', background: 'linear-gradient(135deg, #818cf8, #c084fc)', color: 'white', fontWeight: 600, textDecoration: 'none', fontSize: '1rem', boxShadow: '0 4px 20px rgba(129,140,248,0.3)' }}>
            Get Started Free
            <TrendingUp size={18} />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
