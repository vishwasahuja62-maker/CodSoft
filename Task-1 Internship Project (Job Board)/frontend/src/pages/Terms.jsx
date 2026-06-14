import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ShieldCheck, UserCheck, AlertCircle, Ban, Scale, HelpCircle, Mail } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } }
};

const sections = [
  {
    icon: FileText, title: '1. Acceptance of Terms',
    content: [
      'By creating an account or using ElevateHire, you agree to be bound by these Terms of Service.',
      'If you do not agree with any part of these terms, you must not use our platform.',
      'We may update these terms from time to time. Continued use after changes constitutes acceptance of the new terms.',
      'You are responsible for regularly reviewing these terms. We will notify you of material changes via email or platform notice.',
    ]
  },
  {
    icon: UserCheck, title: '2. Account Registration & Responsibilities',
    content: [
      'You must be at least 16 years old to create an account and use our services.',
      'You agree to provide accurate, current, and complete information during registration.',
      'You are solely responsible for maintaining the confidentiality of your login credentials.',
      'You must notify us immediately of any unauthorized use of your account or security breach.',
      'You are responsible for all activity that occurs under your account.',
    ]
  },
  {
    icon: Scale, title: '3. User Conduct',
    content: [
      'You agree not to misrepresent your identity, qualifications, experience, or employment history.',
      'You must not submit false, misleading, or fraudulent job listings or applications.',
      'Harassment, discrimination, hate speech, and other abusive behavior are strictly prohibited.',
      'You must not scrape, crawl, or otherwise systematically extract data from our platform without written permission.',
      'You agree not to upload viruses, malware, or any malicious code that could harm our systems or other users.',
    ]
  },
  {
    icon: Ban, title: '4. Prohibited Activities',
    content: [
      'Impersonating any person or entity, or falsely stating or otherwise misrepresenting your affiliation.',
      'Using the platform for any unlawful purpose or in violation of any applicable laws or regulations.',
      'Interfering with or disrupting the integrity or performance of the platform or its infrastructure.',
      'Attempting to gain unauthorized access to any part of the platform, other accounts, or connected networks.',
      'Posting or transmitting any unsolicited advertising, promotional materials, or spam.',
    ]
  },
  {
    icon: AlertCircle, title: '5. Intellectual Property',
    content: [
      'The ElevateHire name, logo, platform design, and all related content are our intellectual property.',
      'You retain ownership of the content you submit, post, or display on our platform (your profile, resume, etc.).',
      'By submitting content, you grant us a non-exclusive, worldwide license to display and distribute it on the platform.',
      'You may not reproduce, modify, distribute, or create derivative works of our platform without prior written consent.',
    ]
  },
  {
    icon: ShieldCheck, title: '6. Limitation of Liability',
    content: [
      'ElevateHire provides the platform "as is" and "as available" without warranties of any kind, express or implied.',
      'We are not responsible for the accuracy of job listings, candidate profiles, or any content posted by third parties.',
      'We are not liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform.',
      'Our total liability for any claim arising from these terms or the platform shall not exceed the fees you paid in the 12 months prior.',
    ]
  },
  {
    icon: HelpCircle, title: '7. Termination',
    content: [
      'You may delete your account at any time through your account settings or by contacting our support team.',
      'We reserve the right to suspend or terminate accounts that violate these terms or engage in harmful behavior.',
      'Upon termination, your right to use the platform ceases immediately. Your data will be handled per our Privacy Policy.',
      'Sections regarding intellectual property, limitation of liability, and dispute resolution survive termination.',
    ]
  },
  {
    icon: Mail, title: '8. Contact & Dispute Resolution',
    content: [
      'These terms are governed by the laws of the State of Delaware, United States, without regard to conflict of law principles.',
      'Any disputes arising from these terms shall first be attempted to be resolved through informal negotiation.',
      'If negotiation fails, disputes shall be resolved through binding arbitration in accordance with JAMS rules.',
      'For any questions about these terms, please contact us at legal@elevatehire.com.',
    ]
  },
];

export default function Terms() {
  return (
    <div className="landing-container">
      <div className="bg-blobs">
        <div className="bg-glow-1" style={{ top: '8%', left: '5%' }}></div>
        <div className="bg-glow-2" style={{ top: '20%', right: '10%' }}></div>
        <div className="bg-glow-3" style={{ bottom: '10%', left: '40%' }}></div>
      </div>

      {/* Header */}
      <motion.div initial="initial" animate="animate" variants={stagger} style={{ textAlign: 'center', padding: '6rem 2rem 3rem', maxWidth: '800px', margin: '0 auto' }}>
        <motion.div variants={fadeUp} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(244,114,182,0.1)', border: '1px solid rgba(244,114,182,0.2)', borderRadius: '999px', padding: '0.4rem 1.2rem', marginBottom: '1.5rem' }}>
          <FileText size={14} color="#f472b6" />
          <span style={{ color: '#f472b6', fontSize: '0.85rem', fontWeight: 600 }}>Terms of Service</span>
        </motion.div>
        <motion.h1 variants={fadeUp} style={{
          fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em',
          background: 'linear-gradient(135deg, #f472b6 0%, #c084fc 50%, #fff 100%)',
          WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '1rem', lineHeight: 1.15
        }}>
          Terms of Service
        </motion.h1>
        <motion.p variants={fadeUp} style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          Last updated: June 1, 2026
        </motion.p>
        <motion.p variants={fadeUp} style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '600px', margin: '0 auto' }}>
          These terms govern your use of the ElevateHire platform. By using our services, 
          you agree to these terms. Please read them carefully.
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
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(244,114,182,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <section.icon size={20} color="#f472b6" />
                </div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>{section.title}</h2>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {section.content.map((item, j) => (
                  <li key={j} style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, paddingLeft: '1.2rem', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, top: '0.5em', width: '5px', height: '5px', borderRadius: '50%', background: '#f472b6', opacity: 0.5 }}></span>
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
          <HelpCircle size={24} color="#f472b6" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', marginBottom: '0.75rem' }}>Have Questions?</h3>
          <p style={{ color: '#94a3b8', lineHeight: 1.6, marginBottom: '1.25rem', fontSize: '0.95rem' }}>
            If you have any questions about these terms or need clarification, 
            please don't hesitate to contact our legal team.
          </p>
          <a href="mailto:legal@elevatehire.com"
            style={{ color: '#f472b6', textDecoration: 'none', fontWeight: 600, fontSize: '1rem' }}>
            legal@elevatehire.com
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
