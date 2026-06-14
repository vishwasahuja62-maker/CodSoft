import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Download, Eye, Edit3, Save, Loader, Linkedin } from 'lucide-react';
import { apiGet, apiPost, apiPut } from '../utils/api';

const EMPTY_EXPERIENCE = { company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: '' };
const EMPTY_EDUCATION = { school: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' };
const EMPTY_CERTIFICATION = { name: '', issuer: '', date: '', url: '' };

const sections = ['personal', 'summary', 'experience', 'education', 'skills', 'certifications', 'preview'];

const sectionLabels = {
  personal: 'Personal Info',
  summary: 'Professional Summary',
  experience: 'Work Experience',
  education: 'Education',
  skills: 'Skills',
  certifications: 'Certifications',
  preview: 'Preview & Export'
};

export default function ResumeBuilder({ onSave }) {
  const [activeSection, setActiveSection] = useState('personal');
  const [resumeId, setResumeId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingResume, setLoadingResume] = useState(true);
  const saveTimer = useRef(null);

  const [personal, setPersonal] = useState({
    fullName: '', email: '', phone: '', location: '',
    linkedin: '', github: '', portfolio: '', title: ''
  });

  const [summary, setSummary] = useState('');

  const [experiences, setExperiences] = useState([{ ...EMPTY_EXPERIENCE }]);

  const [educations, setEducations] = useState([{ ...EMPTY_EDUCATION }]);

  const [skillsInput, setSkillsInput] = useState('');
  const [skills, setSkills] = useState([]);

  const [certifications, setCertifications] = useState([{ ...EMPTY_CERTIFICATION }]);

  const STORAGE_KEY = 'resume_data';

  useEffect(() => {
    const loadFromApi = async () => {
      try {
        const resume = await apiGet('/resumes/latest');
        if (resume && resume.data) {
          setResumeId(resume.id);
          if (resume.data.personal) setPersonal(resume.data.personal);
          if (resume.data.summary) setSummary(resume.data.summary);
          if (resume.data.experiences) setExperiences(resume.data.experiences);
          if (resume.data.educations) setEducations(resume.data.educations);
          if (resume.data.skills) setSkills(resume.data.skills);
          if (resume.data.certifications) setCertifications(resume.data.certifications);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(resume.data));
          setLoadingResume(false);
          return;
        }
      } catch (e) { /* API not available, try localStorage */ }
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const data = JSON.parse(saved);
          if (data.personal) setPersonal(data.personal);
          if (data.summary) setSummary(data.summary);
          if (data.experiences) setExperiences(data.experiences);
          if (data.educations) setEducations(data.educations);
          if (data.skills) setSkills(data.skills);
          if (data.certifications) setCertifications(data.certifications);
        }
      } catch (e) { /* ignore */ }
      setLoadingResume(false);
    };
    loadFromApi();
  }, []);

  useEffect(() => {
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, []);

  const saveToApi = async (data) => {
    setSaving(true);
    try {
      if (resumeId) {
        await apiPut(`/resumes/${resumeId}`, { data });
      } else {
        const result = await apiPost('/resumes', { data });
        if (result && result.id) setResumeId(result.id);
      }
    } catch (e) { /* API save failed, data is still in localStorage */ }
    setSaving(false);
  };

  const persistData = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    if (onSave) onSave(data);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveToApi(data), 1000);
  };

  const handlePersonalChange = (field, value) => {
    const updated = { ...personal, [field]: value };
    setPersonal(updated);
    persistData(getResumeData(updated));
  };

  const getResumeData = (overrides = {}) => ({
    personal: overrides.personal || personal,
    summary: overrides.summary || summary,
    experiences: overrides.experiences || experiences,
    educations: overrides.educations || educations,
    skills: overrides.skills || skills,
    certifications: overrides.certifications || certifications,
  });

  const handleSummaryChange = (value) => {
    setSummary(value);
    persistData(getResumeData({ summary: value }));
  };

  const handleExperienceChange = (index, field, value) => {
    const updated = experiences.map((exp, i) => i === index ? { ...exp, [field]: value } : exp);
    setExperiences(updated);
    persistData(getResumeData({ experiences: updated }));
  };

  const addExperience = () => {
    const updated = [...experiences, { ...EMPTY_EXPERIENCE }];
    setExperiences(updated);
    persistData(getResumeData({ experiences: updated }));
  };

  const removeExperience = (index) => {
    const updated = experiences.filter((_, i) => i !== index);
    setExperiences(updated);
    persistData(getResumeData({ experiences: updated }));
  };

  const handleEducationChange = (index, field, value) => {
    const updated = educations.map((edu, i) => i === index ? { ...edu, [field]: value } : edu);
    setEducations(updated);
    persistData(getResumeData({ educations: updated }));
  };

  const addEducation = () => {
    const updated = [...educations, { ...EMPTY_EDUCATION }];
    setEducations(updated);
    persistData(getResumeData({ educations: updated }));
  };

  const removeEducation = (index) => {
    const updated = educations.filter((_, i) => i !== index);
    setEducations(updated);
    persistData(getResumeData({ educations: updated }));
  };

  const handleSkillsKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newSkill = skillsInput.trim().replace(/,/g, '');
      if (newSkill && !skills.includes(newSkill)) {
        const updated = [...skills, newSkill];
        setSkills(updated);
        persistData(getResumeData({ skills: updated }));
      }
      setSkillsInput('');
    }
  };

  const removeSkill = (index) => {
    const updated = skills.filter((_, i) => i !== index);
    setSkills(updated);
    persistData(getResumeData({ skills: updated }));
  };

  const handleCertChange = (index, field, value) => {
    const updated = certifications.map((cert, i) => i === index ? { ...cert, [field]: value } : cert);
    setCertifications(updated);
    persistData(getResumeData({ certifications: updated }));
  };

  const addCertification = () => {
    const updated = [...certifications, { ...EMPTY_CERTIFICATION }];
    setCertifications(updated);
    persistData(getResumeData({ certifications: updated }));
  };

  const removeCertification = (index) => {
    const updated = certifications.filter((_, i) => i !== index);
    setCertifications(updated);
    persistData(getResumeData({ certifications: updated }));
  };

  const downloadAsText = () => {
    const lines = [];
    if (personal.fullName) lines.push(personal.fullName.toUpperCase());
    if (personal.title) lines.push(personal.title);
    const contactParts = [];
    if (personal.email) contactParts.push(personal.email);
    if (personal.phone) contactParts.push(personal.phone);
    if (personal.location) contactParts.push(personal.location);
    if (contactParts.length) lines.push(contactParts.join(' | '));
    const linkParts = [];
    if (personal.linkedin) linkParts.push(personal.linkedin);
    if (personal.github) linkParts.push(personal.github);
    if (personal.portfolio) linkParts.push(personal.portfolio);
    if (linkParts.length) lines.push(linkParts.join(' | '));
    lines.push('');

    if (summary) {
      lines.push('PROFESSIONAL SUMMARY');
      lines.push(''.padEnd(50, '-'));
      lines.push(summary);
      lines.push('');
    }

    if (experiences.some(e => e.company || e.position)) {
      lines.push('WORK EXPERIENCE');
      lines.push(''.padEnd(50, '-'));
      experiences.filter(e => e.company || e.position).forEach(exp => {
        const title = [exp.position, exp.company].filter(Boolean).join(' at ');
        const dates = [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' - ');
        const line = [title, exp.location].filter(Boolean).join(' | ');
        lines.push(line);
        if (dates) lines.push(dates);
        if (exp.description) lines.push(exp.description);
        lines.push('');
      });
    }

    if (educations.some(e => e.school || e.degree)) {
      lines.push('EDUCATION');
      lines.push(''.padEnd(50, '-'));
      educations.filter(e => e.school || e.degree).forEach(edu => {
        const degree = [edu.degree, edu.field].filter(Boolean).join(' in ');
        const line = [degree, edu.school].filter(Boolean).join(' - ');
        lines.push(line);
        const dates = [edu.startDate, edu.endDate].filter(Boolean).join(' - ');
        const gpaStr = edu.gpa ? `GPA: ${edu.gpa}` : '';
        const detail = [dates, gpaStr].filter(Boolean).join(' | ');
        if (detail) lines.push(detail);
        lines.push('');
      });
    }

    if (skills.length) {
      lines.push('SKILLS');
      lines.push(''.padEnd(50, '-'));
      lines.push(skills.join(', '));
      lines.push('');
    }

    if (certifications.some(c => c.name)) {
      lines.push('CERTIFICATIONS');
      lines.push(''.padEnd(50, '-'));
      certifications.filter(c => c.name).forEach(cert => {
        const line = [cert.name, cert.issuer].filter(Boolean).join(' - ');
        lines.push(line);
        const detail = [cert.date, cert.url].filter(Boolean).join(' | ');
        if (detail) lines.push(detail);
        lines.push('');
      });
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${personal.fullName || 'resume'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    background: 'rgba(0,0,0,0.2)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: 'white',
    outline: 'none',
    fontSize: '0.9rem',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    color: '#cbd5e1',
    fontSize: '0.85rem',
    fontWeight: 600,
    marginBottom: '6px',
  };

  const cardStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '1.25rem',
    marginBottom: '1rem',
  };

  const btnPrimary = {
    background: 'linear-gradient(135deg, #818cf8, #c084fc)',
    border: 'none',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '10px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.9rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  };

  const btnOutline = {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#e2e8f0',
    padding: '8px 16px',
    borderRadius: '10px',
    fontWeight: 500,
    cursor: 'pointer',
    fontSize: '0.85rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  };

  const btnDanger = {
    background: 'rgba(248,113,113,0.1)',
    border: '1px solid rgba(248,113,113,0.2)',
    color: '#f87171',
    padding: '8px 16px',
    borderRadius: '10px',
    fontWeight: 500,
    cursor: 'pointer',
    fontSize: '0.85rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  };

  const inputOnFocus = (e) => e.target.style.borderColor = '#818cf8';
  const inputOnBlur = (e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)';

  const renderPersonal = () => (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={labelStyle}>Full Name</label>
          <input style={inputStyle} placeholder="John Doe" value={personal.fullName} onChange={(e) => handlePersonalChange('fullName', e.target.value)} onFocus={inputOnFocus} onBlur={inputOnBlur} />
        </div>
        <div>
          <label style={labelStyle}>Professional Title</label>
          <input style={inputStyle} placeholder="Senior Frontend Developer" value={personal.title} onChange={(e) => handlePersonalChange('title', e.target.value)} onFocus={inputOnFocus} onBlur={inputOnBlur} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={labelStyle}>Email</label>
          <input style={inputStyle} placeholder="john@example.com" value={personal.email} onChange={(e) => handlePersonalChange('email', e.target.value)} onFocus={inputOnFocus} onBlur={inputOnBlur} />
        </div>
        <div>
          <label style={labelStyle}>Phone</label>
          <input style={inputStyle} placeholder="+1 (555) 123-4567" value={personal.phone} onChange={(e) => handlePersonalChange('phone', e.target.value)} onFocus={inputOnFocus} onBlur={inputOnBlur} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={labelStyle}>Location</label>
          <input style={inputStyle} placeholder="San Francisco, CA" value={personal.location} onChange={(e) => handlePersonalChange('location', e.target.value)} onFocus={inputOnFocus} onBlur={inputOnBlur} />
        </div>
        <div>
          <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Linkedin size={14} /> LinkedIn URL
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input style={{ ...inputStyle, flex: 1 }} placeholder="https://linkedin.com/in/johndoe" value={personal.linkedin} onChange={(e) => handlePersonalChange('linkedin', e.target.value)} onFocus={inputOnFocus} onBlur={inputOnBlur} />
            <button style={btnOutline} onClick={() => {
              if (personal.linkedin) {
                window.alert('LinkedIn import initiated. Please fill in your details manually or use a LinkedIn-to-JSON service like Proxycurl.');
              }
            }} title="Import from LinkedIn">
              <Linkedin size={14} /> Import
            </button>
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>GitHub URL</label>
          <input style={inputStyle} placeholder="https://github.com/johndoe" value={personal.github} onChange={(e) => handlePersonalChange('github', e.target.value)} onFocus={inputOnFocus} onBlur={inputOnBlur} />
        </div>
        <div>
          <label style={labelStyle}>Portfolio URL</label>
          <input style={inputStyle} placeholder="https://johndoe.dev" value={personal.portfolio} onChange={(e) => handlePersonalChange('portfolio', e.target.value)} onFocus={inputOnFocus} onBlur={inputOnBlur} />
        </div>
      </div>
    </div>
  );

  const renderSummary = () => (
    <div>
      <label style={labelStyle}>Professional Summary</label>
      <textarea
        style={{ ...inputStyle, minHeight: '200px', resize: 'vertical', lineHeight: 1.6 }}
        placeholder="Experienced software engineer with 5+ years building scalable web applications..."
        value={summary}
        onChange={(e) => handleSummaryChange(e.target.value)}
        onFocus={inputOnFocus}
        onBlur={inputOnBlur}
      />
    </div>
  );

  const renderExperience = () => (
    <div>
      {experiences.map((exp, index) => (
        <div key={index} style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ color: '#818cf8', fontWeight: 600, fontSize: '0.9rem' }}>Experience #{index + 1}</span>
            {experiences.length > 1 && (
              <button style={btnDanger} onClick={() => removeExperience(index)}><Trash2 size={14} /> Remove</button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Company</label>
              <input style={inputStyle} placeholder="TechCorp Inc." value={exp.company} onChange={(e) => handleExperienceChange(index, 'company', e.target.value)} onFocus={inputOnFocus} onBlur={inputOnBlur} />
            </div>
            <div>
              <label style={labelStyle}>Position</label>
              <input style={inputStyle} placeholder="Senior Engineer" value={exp.position} onChange={(e) => handleExperienceChange(index, 'position', e.target.value)} onFocus={inputOnFocus} onBlur={inputOnBlur} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Location</label>
              <input style={inputStyle} placeholder="San Francisco, CA" value={exp.location} onChange={(e) => handleExperienceChange(index, 'location', e.target.value)} onFocus={inputOnFocus} onBlur={inputOnBlur} />
            </div>
            <div>
              <label style={labelStyle}>Start Date</label>
              <input type="month" style={inputStyle} value={exp.startDate} onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>End Date</label>
              <input type="month" style={inputStyle} value={exp.endDate} onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)} disabled={exp.current} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#cbd5e1', fontSize: '0.85rem' }}>
                <input type="checkbox" checked={exp.current} onChange={(e) => handleExperienceChange(index, 'current', e.target.checked)} style={{ accentColor: '#818cf8' }} />
                I currently work here
              </label>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              style={{ ...inputStyle, minHeight: '80px', resize: 'vertical', lineHeight: 1.6 }}
              placeholder="Describe your responsibilities and achievements..."
              value={exp.description}
              onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
              onFocus={inputOnFocus}
              onBlur={inputOnBlur}
            />
          </div>
        </div>
      ))}
      <button style={btnPrimary} onClick={addExperience}><Plus size={16} /> Add Experience</button>
    </div>
  );

  const renderEducation = () => (
    <div>
      {educations.map((edu, index) => (
        <div key={index} style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ color: '#818cf8', fontWeight: 600, fontSize: '0.9rem' }}>Education #{index + 1}</span>
            {educations.length > 1 && (
              <button style={btnDanger} onClick={() => removeEducation(index)}><Trash2 size={14} /> Remove</button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>School</label>
              <input style={inputStyle} placeholder="University of California" value={edu.school} onChange={(e) => handleEducationChange(index, 'school', e.target.value)} onFocus={inputOnFocus} onBlur={inputOnBlur} />
            </div>
            <div>
              <label style={labelStyle}>Degree</label>
              <input style={inputStyle} placeholder="Bachelor of Science" value={edu.degree} onChange={(e) => handleEducationChange(index, 'degree', e.target.value)} onFocus={inputOnFocus} onBlur={inputOnBlur} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Field of Study</label>
              <input style={inputStyle} placeholder="Computer Science" value={edu.field} onChange={(e) => handleEducationChange(index, 'field', e.target.value)} onFocus={inputOnFocus} onBlur={inputOnBlur} />
            </div>
            <div>
              <label style={labelStyle}>GPA</label>
              <input style={inputStyle} placeholder="3.8" value={edu.gpa} onChange={(e) => handleEducationChange(index, 'gpa', e.target.value)} onFocus={inputOnFocus} onBlur={inputOnBlur} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Start Date</label>
              <input type="month" style={inputStyle} value={edu.startDate} onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>End Date</label>
              <input type="month" style={inputStyle} value={edu.endDate} onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)} />
            </div>
          </div>
        </div>
      ))}
      <button style={btnPrimary} onClick={addEducation}><Plus size={16} /> Add Education</button>
    </div>
  );

  const renderSkills = () => (
    <div>
      <label style={labelStyle}>Skills</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem', minHeight: '30px' }}>
        {skills.map((skill, index) => (
          <span key={index} style={{
            background: 'rgba(129, 140, 248, 0.15)',
            border: '1px solid rgba(129, 140, 248, 0.3)',
            color: '#e2e8f0',
            padding: '6px 12px',
            borderRadius: '8px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
          }}>
            {skill}
            <button onClick={() => removeSkill(index)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: 0, display: 'flex', lineHeight: 1, fontSize: '1rem' }}>&times;</button>
          </span>
        ))}
      </div>
      <input
        style={inputStyle}
        placeholder="Type a skill and press Enter or comma to add"
        value={skillsInput}
        onChange={(e) => setSkillsInput(e.target.value)}
        onKeyDown={handleSkillsKeyDown}
        onFocus={inputOnFocus}
        onBlur={inputOnBlur}
      />
      <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '6px' }}>Press Enter or comma to add each skill</p>
    </div>
  );

  const renderCertifications = () => (
    <div>
      {certifications.map((cert, index) => (
        <div key={index} style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ color: '#818cf8', fontWeight: 600, fontSize: '0.9rem' }}>Certification #{index + 1}</span>
            {certifications.length > 1 && (
              <button style={btnDanger} onClick={() => removeCertification(index)}><Trash2 size={14} /> Remove</button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Name</label>
              <input style={inputStyle} placeholder="AWS Solutions Architect" value={cert.name} onChange={(e) => handleCertChange(index, 'name', e.target.value)} onFocus={inputOnFocus} onBlur={inputOnBlur} />
            </div>
            <div>
              <label style={labelStyle}>Issuer</label>
              <input style={inputStyle} placeholder="Amazon Web Services" value={cert.issuer} onChange={(e) => handleCertChange(index, 'issuer', e.target.value)} onFocus={inputOnFocus} onBlur={inputOnBlur} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Date</label>
              <input type="month" style={inputStyle} value={cert.date} onChange={(e) => handleCertChange(index, 'date', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Credential URL</label>
              <input style={inputStyle} placeholder="https://credential.example.com" value={cert.url} onChange={(e) => handleCertChange(index, 'url', e.target.value)} onFocus={inputOnFocus} onBlur={inputOnBlur} />
            </div>
          </div>
        </div>
      ))}
      <button style={btnPrimary} onClick={addCertification}><Plus size={16} /> Add Certification</button>
    </div>
  );

  const renderPreview = () => {
    const hasContent = personal.fullName || summary || experiences.some(e => e.company || e.position) ||
      educations.some(e => e.school || e.degree) || skills.length || certifications.some(c => c.name);

    if (!hasContent) {
      return (
        <div style={{ textAlign: 'center', padding: '80px 40px', color: '#64748b' }}>
          <Eye size={48} style={{ margin: '0 auto 16px auto', opacity: 0.4 }} />
          <p style={{ fontSize: '1.1rem', color: '#94a3b8', marginBottom: '8px' }}>Your resume preview will appear here</p>
          <p style={{ fontSize: '0.9rem' }}>Fill in the sections on the left to build your resume</p>
        </div>
      );
    }

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', gap: '8px' }}>
          <button style={btnPrimary} onClick={downloadAsText}><Download size={16} /> Download as Text</button>
        </div>
        <div className="glass" style={{
          padding: '2.5rem',
          borderRadius: '16px',
          background: '#0f172a',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#e2e8f0',
          fontSize: '0.9rem',
          lineHeight: 1.6,
        }}>
          {personal.fullName && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>{personal.fullName}</h1>
              {personal.title && <p style={{ fontSize: '1.1rem', color: '#818cf8', fontWeight: 500, margin: '0 0 10px 0' }}>{personal.title}</p>}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.85rem', color: '#94a3b8' }}>
                {personal.email && <span>{personal.email}</span>}
                {personal.phone && <span>{personal.phone}</span>}
                {personal.location && <span>{personal.location}</span>}
              </div>
              {(personal.linkedin || personal.github || personal.portfolio) && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '6px', fontSize: '0.85rem' }}>
                  {personal.linkedin && <a href={personal.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#818cf8', textDecoration: 'none' }}>LinkedIn</a>}
                  {personal.github && <a href={personal.github} target="_blank" rel="noopener noreferrer" style={{ color: '#818cf8', textDecoration: 'none' }}>GitHub</a>}
                  {personal.portfolio && <a href={personal.portfolio} target="_blank" rel="noopener noreferrer" style={{ color: '#818cf8', textDecoration: 'none' }}>Portfolio</a>}
                </div>
              )}
            </div>
          )}

          {summary && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'white',
                margin: '0 0 8px 0',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                borderBottom: '2px solid rgba(129, 140, 248, 0.4)',
                paddingBottom: '6px',
              }}>Professional Summary</h2>
              <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.7 }}>{summary}</p>
            </div>
          )}

          {experiences.some(e => e.company || e.position) && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'white',
                margin: '0 0 12px 0',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                borderBottom: '2px solid rgba(129, 140, 248, 0.4)',
                paddingBottom: '6px',
              }}>Work Experience</h2>
              {experiences.filter(e => e.company || e.position).map((exp, i) => (
                <div key={i} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ fontWeight: 700, color: 'white' }}>{exp.position || 'Position'}</span>
                      {exp.company && <span style={{ color: '#818cf8' }}> at {exp.company}</span>}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {exp.startDate && exp.startDate} {exp.startDate && (exp.current || exp.endDate) && ' - '} {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  {exp.location && <p style={{ margin: '2px 0 6px 0', color: '#94a3b8', fontSize: '0.85rem' }}>{exp.location}</p>}
                  {exp.description && <p style={{ margin: '6px 0 0 0', color: '#cbd5e1', lineHeight: 1.6 }}>{exp.description}</p>}
                </div>
              ))}
            </div>
          )}

          {educations.some(e => e.school || e.degree) && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'white',
                margin: '0 0 12px 0',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                borderBottom: '2px solid rgba(129, 140, 248, 0.4)',
                paddingBottom: '6px',
              }}>Education</h2>
              {educations.filter(e => e.school || e.degree).map((edu, i) => (
                <div key={i} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ fontWeight: 700, color: 'white' }}>{edu.degree || 'Degree'}</span>
                      {edu.field && <span style={{ color: '#94a3b8' }}> in {edu.field}</span>}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {edu.startDate && edu.startDate} {edu.startDate && edu.endDate && ' - '} {edu.endDate}
                    </span>
                  </div>
                  <p style={{ margin: '2px 0 0 0', color: '#818cf8', fontSize: '0.85rem' }}>
                    {edu.school}{edu.gpa ? ` | GPA: ${edu.gpa}` : ''}
                  </p>
                </div>
              ))}
            </div>
          )}

          {skills.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'white',
                margin: '0 0 8px 0',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                borderBottom: '2px solid rgba(129, 140, 248, 0.4)',
                paddingBottom: '6px',
              }}>Skills</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {skills.map((skill, i) => (
                  <span key={i} style={{
                    background: 'rgba(129, 140, 248, 0.1)',
                    border: '1px solid rgba(129, 140, 248, 0.2)',
                    borderRadius: '6px',
                    padding: '4px 12px',
                    fontSize: '0.85rem',
                    color: '#e2e8f0',
                  }}>{skill}</span>
                ))}
              </div>
            </div>
          )}

          {certifications.some(c => c.name) && (
            <div>
              <h2 style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'white',
                margin: '0 0 12px 0',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                borderBottom: '2px solid rgba(129, 140, 248, 0.4)',
                paddingBottom: '6px',
              }}>Certifications</h2>
              {certifications.filter(c => c.name).map((cert, i) => (
                <div key={i} style={{ marginBottom: '0.5rem' }}>
                  <p style={{ margin: 0, fontWeight: 600, color: 'white' }}>{cert.name}</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                    {cert.issuer}{cert.date ? ` | ${cert.date}` : ''}
                  </p>
                  {cert.url && <a href={cert.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#818cf8', textDecoration: 'none' }}>View Credential</a>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'personal': return renderPersonal();
      case 'summary': return renderSummary();
      case 'experience': return renderExperience();
      case 'education': return renderEducation();
      case 'skills': return renderSkills();
      case 'certifications': return renderCertifications();
      case 'preview': return renderPreview();
      default: return null;
    }
  };

  return (
    <div className="card glass" style={{ padding: '0', display: 'flex', minHeight: '600px', overflow: 'hidden' }}>
      <div style={{
        width: '220px',
        flexShrink: 0,
        borderRight: '1px solid rgba(255,255,255,0.08)',
        padding: '1.5rem 0',
      }}>
        <div style={{ padding: '0 1.25rem', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Edit3 size={16} color="#818cf8" /> Resume Builder
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.75rem', color: saving ? '#818cf8' : '#34d399' }}>
            {loadingResume ? (
              <><Loader size={12} /> Loading...</>
            ) : saving ? (
              <><Loader size={12} /> Saving...</>
            ) : (
              <><Save size={12} /> Saved</>
            )}
          </div>
        </div>
        {sections.map((key) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '10px 1.25rem',
              background: activeSection === key ? 'rgba(129, 140, 248, 0.1)' : 'transparent',
              border: 'none',
              borderRight: activeSection === key ? '2px solid #818cf8' : '2px solid transparent',
              color: activeSection === key ? '#818cf8' : '#94a3b8',
              fontWeight: activeSection === key ? 600 : 400,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { if (activeSection !== key) e.target.style.background = 'rgba(255,255,255,0.03)'; }}
            onMouseLeave={(e) => { if (activeSection !== key) e.target.style.background = 'transparent'; }}
          >
            {sectionLabels[key]}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, padding: '1.5rem 2rem', overflowY: 'auto' }}>
        {renderContent()}
      </div>
    </div>
  );
}
