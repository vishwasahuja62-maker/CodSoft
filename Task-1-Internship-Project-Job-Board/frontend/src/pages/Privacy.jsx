import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Eye, Database, Cookie, Mail, Globe, AlertTriangle } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } }
};

const sections = [
  {
    icon: Database, title: '1. Information We Collect',
    content: [
      'Account information: name, email address, phone number, and professional details when you register.',
      'Profile data: work history, education, skills, resume/CV, portfolio links, and career preferences.',
      'Usage data: pages visited, features used, search queries, and time spent on the platform.',
      'Device information: IP address, browser type, operating system, and device identifiers.',
      'Communication data: messages sent through our platform, responses to surveys, and support inquiries.',
    ]
  },
  {
    icon: Lock, title: '2. How We Use Your Information',
    content: [
      'To provide, maintain, and improve our job matching and recruitment platform.',
      'To personalize your experience, including job recommendations and content tailored to your skills.',
      'To facilitate connections between candidates and employers, including profile visibility in search results.',
      'To communicate with you about platform updates, new features, and relevant job opportunities.',
      'To detect, prevent, and address technical issues, fraud, and abuse of our services.',
    ]
  },
  {
    icon: Eye, title: '3. Information Sharing',
    content: [
      'Employers: Your profile and application materials are shared with employers when you apply for a position.',
      'Service providers: We engage third-party vendors for hosting, analytics, email delivery, and payment processing.',
      'Legal compliance: We may disclose information if required by law, court order, or government request.',
      'Business transfers: In the event of a merger, acquisition, or sale of assets, your data may be transferred.',
      'We never sell your personal information to third parties for their marketing purposes.',
    ]
  },
  {
    icon: Cookie, title: '4. Cookies & Tracking',
    content: [
      'Essential cookies: Required for basic platform functionality, authentication, and security.',
      'Analytics cookies: Help us understand how you use the platform to improve features and performance.',
      'Preference cookies: Remember your settings, language, and display preferences across sessions.',
      'You can control cookie settings through your browser preferences. Disabling certain cookies may affect platform functionality.',
      'We use session cookies (expire when you close your browser) and persistent cookies (remain for up to 12 months).',
    ]
  },
  {
    icon: ShieldCheck, title: '5. Data Security',
    content: [
      'All data transmitted between your device and our servers is encrypted using TLS 1.3 protocol.',
      'Passwords are hashed and salted using industry-standard bcrypt before storage.',
      'We conduct regular security audits, penetration testing, and vulnerability assessments.',
      'Access to personal data is restricted to authorized personnel on a need-to-know basis.',
      'We maintain SOC 2 compliance standards and follow OWASP security best practices.',
    ]
  },
  {
    icon: Mail, title: '6. Your Rights & Choices',
    content: [
      'Access: You can request a copy of the personal data we hold about you at any time.',
      'Correction: Update your profile information directly or request corrections from our support team.',
      'Deletion: You may request deletion of your account and associated data. Some data may be retained as required by law.',
      'Portability: Receive your data in a structured, commonly used, machine-readable format.',
      'Opt-out: You can unsubscribe from marketing communications at any time via your settings or the unsubscribe link in emails.',
    ]
  },
  {
    icon: AlertTriangle, title: '7. Data Retention',
    content: [
      'Active accounts: We retain your data for as long as your account is active and for 90 days after account deletion.',
      'Usage analytics: Aggregated, anonymized data may be retained indefinitely for business intelligence purposes.',
      'Legal holds: Data may be retained longer if required by applicable laws, regulations, or legal proceedings.',
      'Backup retention: Archived copies may persist in our backup systems for up to 30 days after deletion.',
    ]
  },
  {
    icon: Globe, title: '8. International Data Transfers',
    content: [
      'Your data may be processed in any country where we maintain servers or engage service providers.',
      'We ensure adequate safeguards through Standard Contractual Clauses (SCCs) for cross-border data transfers.',
      'Our primary data centers are located in the United States, European Union, and Asia-Pacific regions.',
      'By using our platform, you consent to the transfer of your data to countries that may have different data protection laws.',
    ]
  },
];

export default function Privacy() {
  return (
    <div className="landing-container">
      <div className="bg-blobs">
        <div className="bg-glow-1" style={{ top: '8%', left: '5%' }}></div>
        <div className="bg-glow-2" style={{ top: '20%', right: '10%' }}></div>
        <div className="bg-glow-3" style={{ bottom: '10%', left: '40%' }}></div>
      </div>

      {/* Header */}
      <motion.div initial="initial" animate="animate" variants={stagger} style={{ textAlign: 'center', padding: '6rem 2rem 3rem', maxWidth: '800px', margin: '0 auto' }}>
        <motion.div variants={fadeUp} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '999px', padding: '0.4rem 1.2rem', marginBottom: '1.5rem' }}>
          <ShieldCheck size={14} color="#38bdf8" />
          <span style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600 }}>Privacy Policy</span>
        </motion.div>
        <motion.h1 variants={fadeUp} style={{
          fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em',
          background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #fff 100%)',
          WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '1rem', lineHeight: 1.15
        }}>
          Privacy Policy
        </motion.h1>
        <motion.p variants={fadeUp} style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          Last updated: June 1, 2026
        </motion.p>
        <motion.p variants={fadeUp} style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '600px', margin: '0 auto' }}>
          At ElevateHire, we take your privacy seriously. This policy describes how we collect, 
          use, and protect your personal information when you use our platform.
        </motion.p>
      </motion.div>

      {/* Sections */}
      <div style={{ padding: '0 2rem 5rem', maxWidth: '900px', margin: '0 auto' }}>
        <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {sections.map((section, i) => (
            <motion.div key={i} variants={fadeUp}
              style={{ padding: '2rem 2.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(56,189,248,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <section.icon size={20} color="#38bdf8" />
                </div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>{section.title}</h2>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {section.content.map((item, j) => (
                  <li key={j} style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, paddingLeft: '1.2rem', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, top: '0.5em', width: '5px', height: '5px', borderRadius: '50%', background: '#38bdf8', opacity: 0.5 }}></span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Contact */}
      <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger}
        style={{ textAlign: 'center', padding: '0 2rem 6rem' }}>
        <motion.div variants={fadeUp}
          style={{ maxWidth: '600px', margin: '0 auto', padding: '2.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px' }}>
          <Mail size={24} color="#38bdf8" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', marginBottom: '0.75rem' }}>Questions About Your Privacy?</h3>
          <p style={{ color: '#94a3b8', lineHeight: 1.6, marginBottom: '1.25rem', fontSize: '0.95rem' }}>
            If you have any questions or concerns about this Privacy Policy or how we handle your data, 
            please reach out to our Data Protection Team.
          </p>
          <a href="mailto:privacy@elevatehire.com"
            style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600, fontSize: '1rem' }}>
            privacy@elevatehire.com
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
