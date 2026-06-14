import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Twitter, Linkedin, Github, ArrowUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="landing-footer" style={{ position: 'relative', marginTop: '2rem', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.5), transparent)' }}></div>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '200px', height: '100px', background: 'radial-gradient(ellipse at top, rgba(139, 92, 246, 0.2), transparent 70%)', pointerEvents: 'none' }}></div>

        <div className="footer-content">
            <div className="footer-brand" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <motion.div whileHover={{ scale: 1.05 }} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: 'fit-content' }}>
                    <img src="/logo.png" alt="ElevateHire" style={{ height: '36px', width: 'auto', borderRadius: '8px' }} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>ElevateHire</h2>
                </motion.div>
                <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.95rem' }}>
                  Empowering the next generation of professionals. We bridge the gap between elite talent and world-class organizations.
                </p>
                
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <motion.a whileHover={{ y: -3 }} href="#" className="social-icon" aria-label="Twitter">
                    <Twitter size={18} />
                  </motion.a>
                  <motion.a whileHover={{ y: -3 }} href="#" className="social-icon" aria-label="LinkedIn">
                    <Linkedin size={18} />
                  </motion.a>
                  <motion.a whileHover={{ y: -3 }} href="#" className="social-icon" aria-label="GitHub">
                    <Github size={18} />
                  </motion.a>
                </div>
            </div>

            <div className="footer-col" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Platform</h4>
                <Link to="/jobs" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} className="hover-white">Find Jobs</Link>
                <Link to="/dashboard" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} className="hover-white">Dashboard</Link>
                <Link to="/register" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} className="hover-white">Create Account</Link>
                <Link to="/login" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} className="hover-white">Sign In</Link>
            </div>

            <div className="footer-col" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Company</h4>
                <Link to="/about" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} className="hover-white">About Us</Link>
                <Link to="/careers" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} className="hover-white">Careers</Link>
                <Link to="/privacy" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} className="hover-white">Privacy Policy</Link>
                <Link to="/terms" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} className="hover-white">Terms of Service</Link>
            </div>

        </div>

        <div className="footer-bottom" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '2rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
              &copy; {new Date().getFullYear()} ElevateHire Inc. All rights reserved.
            </div>
            <motion.button 
              whileHover={{ y: -2 }}
              onClick={scrollToTop} 
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '8px 16px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}
              className="hover-bg-white"
            >
              Back to top <ArrowUp size={14} />
            </motion.button>
        </div>
        
        <style>{`
          .social-icon {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: rgba(255,255,255,0.05);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #94a3b8;
            transition: all 0.2s;
            border: 1px solid rgba(255,255,255,0.1);
          }
          .social-icon:hover {
            background: linear-gradient(135deg, #818cf8, #c084fc);
            color: white;
            transform: translateY(-2px);
            border-color: transparent;
            box-shadow: 0 4px 12px rgba(129, 140, 248, 0.3);
          }
          .hover-white:hover {
            color: white !important;
          }
          .hover-bg-white:hover {
            background: rgba(255,255,255,0.1) !important;
            color: white !important;
          }
        `}</style>
    </footer>
  );
}
