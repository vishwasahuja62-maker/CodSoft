import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Heart, Zap, Users, Coffee, GraduationCap, MapPin, Clock, Globe, ArrowRight } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } }
};

const benefits = [
  { icon: Globe, title: 'Remote-First', desc: 'Work from anywhere in the world. Our team spans 15+ countries and 10 time zones.' },
  { icon: Heart, title: 'Health & Wellness', desc: 'Comprehensive medical, dental, and vision coverage. Plus mental health support and gym stipends.' },
  { icon: Zap, title: 'Growth Budget', desc: '$5,000 annual learning stipend for courses, conferences, books, and coaching.' },
  { icon: Coffee, title: 'Flexible PTO', desc: 'Unlimited vacation, generous parental leave, and company-wide recharge weeks.' },
  { icon: GraduationCap, title: 'Stock Options', desc: 'Every full-time employee receives equity. We build wealth together.' },
  { icon: Users, title: 'Team Retreats', desc: 'Bi-annual gatherings in amazing locations. Past retreats: Lisbon, Bali, and Mexico City.' },
];

const openRoles = [
  { title: 'Senior Full-Stack Engineer', dept: 'Engineering', location: 'Remote', type: 'Full-Time', tag: 'Hot' },
  { title: 'Product Designer', dept: 'Design', location: 'Remote', type: 'Full-Time', tag: 'New' },
  { title: 'AI/ML Engineer', dept: 'Engineering', location: 'Remote', type: 'Full-Time', tag: 'Hot' },
  { title: 'Growth Marketing Lead', dept: 'Marketing', location: 'Remote', type: 'Full-Time', tag: null },
  { title: 'Customer Success Manager', dept: 'Operations', location: 'Remote', type: 'Full-Time', tag: null },
  { title: 'Technical Writer', dept: 'Engineering', location: 'Remote', type: 'Contract', tag: null },
];

const perks = [
  'Latest MacBook or your preferred setup', 'Co-working space stipend', 'Annual home office upgrade budget',
  'Quarterly team events & celebrations', 'Mental health days', 'Free access to all platform premium features',
  'Charitable donation matching', 'Birthday off', 'Employee referral bonuses'
];

export default function Careers() {
  return (
    <div className="landing-container">
      <div className="bg-blobs">
        <div className="bg-glow-1" style={{ top: '5%', left: '10%' }}></div>
        <div className="bg-glow-2" style={{ top: '25%', right: '5%' }}></div>
        <div className="bg-glow-3" style={{ bottom: '15%', left: '40%' }}></div>
      </div>

      {/* Hero */}
      <motion.div initial="initial" animate="animate" variants={stagger} style={{ textAlign: 'center', padding: '6rem 2rem 3rem', maxWidth: '900px', margin: '0 auto' }}>
        <motion.div variants={fadeUp} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '999px', padding: '0.4rem 1.2rem', marginBottom: '1.5rem' }}>
          <Heart size={14} color="#34d399" />
          <span style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: 600 }}>Join Our Team</span>
        </motion.div>
        <motion.h1 variants={fadeUp} style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, letterSpacing: '-0.03em',
          background: 'linear-gradient(135deg, #34d399 0%, #38bdf8 50%, #fff 100%)',
          WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '1.5rem', lineHeight: 1.15
        }}>
          Build the future of hiring with us
        </motion.h1>
        <motion.p variants={fadeUp} style={{ color: '#94a3b8', fontSize: 'clamp(1rem, 2vw, 1.15rem)', lineHeight: 1.7, maxWidth: '650px', margin: '0 auto' }}>
          We're a remote-first team of builders, dreamers, and doers committed to making career 
          opportunities accessible to everyone. Come shape the next chapter of ElevateHire.
        </motion.p>
      </motion.div>

      {/* Perks */}
      <div style={{ padding: '0 2rem 3rem', maxWidth: '900px', margin: '0 auto' }}>
        <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger}
          style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
          {perks.map((p, i) => (
            <motion.div key={i} variants={fadeUp}
              style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '999px', color: '#cbd5e1', fontSize: '0.85rem' }}>
              {p}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Benefits */}
      <div style={{ padding: '0 2rem 5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: 'white', marginBottom: '0.75rem' }}>Why Join Us?</h2>
          <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>We believe that taking care of our team is the foundation of building great products.</p>
        </motion.div>
        <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {benefits.map((b, i) => (
            <motion.div key={i} variants={fadeUp}
              style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', transition: 'all 0.3s' }}
              className="hover-card-lift">
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(52,211,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.2rem' }}>
                <b.icon size={22} color="#34d399" />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>{b.title}</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.9rem' }}>{b.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Open Roles */}
      <div style={{ padding: '0 2rem 5rem', maxWidth: '900px', margin: '0 auto' }}>
        <motion.div variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: 'white', marginBottom: '0.75rem' }}>Open Positions</h2>
          <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>We're growing fast and looking for passionate people to join us.</p>
        </motion.div>
        <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {openRoles.map((role, i) => (
            <motion.div key={i} variants={fadeUp}
              style={{ padding: '1.5rem 2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', cursor: 'pointer', transition: 'all 0.3s' }}
              className="hover-card-lift"
              onClick={() => window.open('mailto:careers@elevatehire.com', '_blank')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(129,140,248,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Briefcase size={20} color="#818cf8" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>{role.title}</span>
                    {role.tag && (
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.6rem', borderRadius: '999px',
                        background: role.tag === 'Hot' ? 'rgba(239,68,68,0.15)' : 'rgba(52,211,153,0.15)',
                        color: role.tag === 'Hot' ? '#ef4444' : '#34d399'
                      }}>{role.tag}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                    <span style={{ color: '#64748b', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={12} /> {role.location}
                    </span>
                    <span style={{ color: '#64748b', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={12} /> {role.type}
                    </span>
                    <span style={{ color: '#818cf8', fontSize: '0.85rem' }}>{role.dept}</span>
                  </div>
                </div>
              </div>
              <ArrowRight size={18} color="#94a3b8" style={{ flexShrink: 0 }} />
            </motion.div>
          ))}
        </motion.div>
        <motion.p variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once: true }}
          style={{ textAlign: 'center', color: '#64748b', marginTop: '2rem', fontSize: '0.9rem' }}>
          Don't see a perfect fit?{' '}
          <a href="mailto:careers@elevatehire.com" style={{ color: '#818cf8', textDecoration: 'none' }}>Send us your resume</a>
        </motion.p>
      </div>

      {/* Culture CTA */}
      <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger}
        style={{ textAlign: 'center', padding: '0 2rem 6rem' }}>
        <motion.div variants={fadeUp}
          style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px' }}>
          <Heart size={32} color="#34d399" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'white', marginBottom: '0.75rem' }}>We can't wait to meet you</h3>
          <p style={{ color: '#94a3b8', lineHeight: 1.6, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            At ElevateHire, you'll work on meaningful problems, collaborate with talented teammates, 
            and grow your career — all while enjoying the flexibility of remote work.
          </p>
          <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            href="mailto:careers@elevatehire.com"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 2rem', borderRadius: '999px', background: 'linear-gradient(135deg, #34d399, #10b981)', color: 'white', fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem', boxShadow: '0 4px 20px rgba(52,211,153,0.3)' }}>
            Apply Now
            <ArrowRight size={18} />
          </motion.a>
        </motion.div>
      </motion.div>
    </div>
  );
}
