import React, { useState, useEffect, useCallback } from 'react';
import { Brain, CheckCircle, XCircle, RotateCcw, Search } from 'lucide-react';
import { apiGet, apiPost } from '../utils/api';
import { useToast } from '../components/ToastProvider';

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'white',
    margin: 0,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '0.95rem',
    marginTop: '4px',
  },
  skillGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '12px',
    marginBottom: '2rem',
  },
  skillBtn: (selected) => ({
    padding: '14px 20px',
    borderRadius: '12px',
    border: selected ? '2px solid #818cf8' : '1px solid rgba(255,255,255,0.1)',
    background: selected ? 'rgba(129, 140, 248, 0.15)' : 'rgba(255,255,255,0.03)',
    color: selected ? '#818cf8' : '#cbd5e1',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center',
  }),
  progressContainer: {
    width: '100%',
    height: '8px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '4px',
    marginBottom: '0.5rem',
    overflow: 'hidden',
  },
  progressBar: (pct) => ({
    width: `${pct}%`,
    height: '100%',
    background: 'linear-gradient(90deg, #818cf8, #c084fc)',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  }),
  progressText: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    color: '#94a3b8',
    fontSize: '0.85rem',
  },
  questionCard: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.08)',
    padding: '2rem',
    marginBottom: '1.5rem',
  },
  questionText: {
    fontSize: '1.15rem',
    fontWeight: 600,
    color: 'white',
    marginBottom: '1.5rem',
    lineHeight: 1.5,
  },
  optionBtn: (selected, isCorrect, showResult) => ({
    display: 'block',
    width: '100%',
    padding: '14px 18px',
    marginBottom: '10px',
    borderRadius: '12px',
    border: selected
      ? `2px solid ${showResult ? (isCorrect ? '#34d399' : '#f87171') : '#818cf8'}`
      : showResult && isCorrect
        ? '2px solid #34d399'
        : '1px solid rgba(255,255,255,0.08)',
    background: selected
      ? showResult
        ? isCorrect ? 'rgba(52, 211, 153, 0.12)' : 'rgba(248, 113, 113, 0.12)'
        : 'rgba(129, 140, 248, 0.12)'
      : showResult && isCorrect
        ? 'rgba(52, 211, 153, 0.08)'
        : 'rgba(255,255,255,0.02)',
    color: selected
      ? showResult
        ? isCorrect ? '#34d399' : '#f87171'
        : '#818cf8'
      : showResult && isCorrect
        ? '#34d399'
        : '#cbd5e1',
    cursor: showResult ? 'default' : 'pointer',
    textAlign: 'left',
    fontSize: '0.95rem',
    fontWeight: selected ? 600 : 400,
    transition: 'all 0.15s',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '1.5rem',
  },
  btn: (variant) => ({
    padding: '12px 28px',
    borderRadius: '10px',
    border: 'none',
    fontWeight: 600,
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: variant === 'primary'
      ? 'linear-gradient(135deg, #818cf8, #c084fc)'
      : variant === 'outline'
        ? 'transparent'
        : 'rgba(255,255,255,0.05)',
    color: variant === 'outline' ? '#818cf8' : 'white',
    border: variant === 'outline' ? '1px solid rgba(129, 140, 248, 0.3)' : 'none',
  }),
  resultCard: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.08)',
    padding: '2rem',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  scoreCircle: (pct) => ({
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: `conic-gradient(${pct >= 70 ? '#34d399' : '#f87171'} ${pct * 3.6}deg, rgba(255,255,255,0.05) 0deg)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.5rem auto',
  }),
  scoreInner: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: '#0a0f28',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultIcon: (pass) => ({
    color: pass ? '#34d399' : '#f87171',
    marginBottom: '0.5rem',
  }),
};

export default function SkillAssessment() {
  const { addToast } = useToast();
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [customSkill, setCustomSkill] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiGet('/assessments/skills')
      .then(setSkills)
      .catch(() => addToast('Failed to load skills', 'error'));
  }, []);

  const handleSelectSkill = async (skill) => {
    setSelectedSkill(skill);
    setCustomSkill('');
    setSubmitted(false);
    setResult(null);
    setAnswers({});
    setCurrentQ(0);
    setLoading(true);
    try {
      const data = await apiGet(`/assessments/questions?skill=${encodeURIComponent(skill)}`);
      setQuestions(data);
    } catch {
      addToast('Failed to load questions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSearch = async () => {
    const skill = customSkill.trim();
    if (!skill) return;
    await handleSelectSkill(skill);
  };

  const handleCustomKeyDown = (e) => {
    if (e.key === 'Enter') handleCustomSearch();
  };

  const handleSelectOption = (questionId, optionIndex) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) setCurrentQ(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentQ > 0) setCurrentQ(prev => prev - 1);
  };

  const handleSubmit = async () => {
    const answerArray = Object.entries(answers).map(([questionId, selected]) => ({
      questionId: parseInt(questionId),
      selected,
    }));
    if (answerArray.length !== questions.length) {
      addToast('Please answer all questions before submitting.', 'error');
      return;
    }
    setLoading(true);
    try {
      const data = await apiPost('/assessments/submit', { answers: answerArray, skill: selectedSkill });
      setResult(data);
      setSubmitted(true);
    } catch {
      addToast('Failed to submit assessment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setSelectedSkill(null);
    setCustomSkill('');
    setQuestions([]);
    setCurrentQ(0);
    setAnswers({});
    setSubmitted(false);
    setResult(null);
  };

  if (!selectedSkill) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <Brain size={28} color="#818cf8" />
          <div>
            <h2 style={styles.title}>Skill Assessment</h2>
            <p style={styles.subtitle}>Select a skill below or type any custom skill to test your knowledge</p>
          </div>
        </div>
        <div style={{
          display: 'flex', gap: '10px', marginBottom: '1.5rem',
        }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: '10px',
            background: 'rgba(255,255,255,0.03)', borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)', padding: '4px 16px',
          }}>
            <Search size={20} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search any skill..."
              value={customSkill}
              onChange={e => setCustomSkill(e.target.value)}
              onKeyDown={handleCustomKeyDown}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: 'white', fontSize: '1rem', padding: '12px 0',
              }}
            />
          </div>
          <button
            style={styles.btn('primary')}
            onClick={handleCustomSearch}
            disabled={!customSkill.trim()}
          >
            Go
          </button>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
          Or choose a predefined skill:
        </p>
        <div style={styles.skillGrid}>
          {skills.map(skill => (
            <button key={skill} style={styles.skillBtn(selectedSkill === skill)} onClick={() => handleSelectSkill(skill)}>
              {skill}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (loading && questions.length === 0) {
    return <div style={{ color: '#94a3b8', textAlign: 'center', padding: '3rem' }}>Loading questions...</div>;
  }

  if (questions.length === 0) {
    return (
      <div style={styles.container}>
        <p style={{ color: '#94a3b8' }}>No questions available for {selectedSkill}.</p>
        <button style={styles.btn('outline')} onClick={handleRetry}>Back to Skills</button>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const progressPct = Math.round((answeredCount / questions.length) * 100);
  const currentQuestion = questions[currentQ];
  const selectedAnswer = answers[currentQuestion.id];

  if (submitted && result) {
    const pass = result.percentage >= 70;
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <Brain size={28} color="#818cf8" />
          <div>
            <h2 style={styles.title}>{selectedSkill} Assessment Results</h2>
            <p style={styles.subtitle}>Here's how you performed</p>
          </div>
        </div>

        <div style={styles.resultCard}>
          <div style={styles.scoreCircle(result.percentage)}>
            <div style={styles.scoreInner}>
              <div style={styles.resultIcon(pass)}>
                {pass ? <CheckCircle size={32} /> : <XCircle size={32} />}
              </div>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>{result.percentage}%</span>
            </div>
          </div>
          <h3 style={{ color: pass ? '#34d399' : '#f87171', fontSize: '1.3rem', marginBottom: '0.5rem' }}>
            {pass ? 'Congratulations! You Passed!' : 'Better luck next time!'}
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
            You scored {result.score} out of {result.total}
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.1rem' }}>Question Review</h4>
          {questions.map((q, idx) => {
            const ans = result.results.find(r => r.questionId === q.id);
            const userSelected = answers[q.id];
            return (
              <div key={q.id} style={{
                ...styles.questionCard,
                borderColor: ans?.correct ? 'rgba(52, 211, 153, 0.3)' : 'rgba(248, 113, 113, 0.3)',
              }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ marginTop: '2px', flexShrink: 0 }}>
                    {ans?.correct
                      ? <CheckCircle size={20} color="#34d399" />
                      : <XCircle size={20} color="#f87171" />
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: 'white', fontWeight: 600, marginBottom: '12px' }}>{idx + 1}. {q.question}</p>
                    {q.options.map((opt, oi) => {
                      const isSelected = userSelected === oi;
                      const isCorrectAnswer = ans?.correctAnswer === oi;
                      return (
                        <div key={oi} style={{
                          ...styles.optionBtn(isSelected, isCorrectAnswer, true),
                          marginBottom: '6px',
                        }}>
                          <span>{opt}</span>
                          {isCorrectAnswer && <CheckCircle size={16} color="#34d399" />}
                          {isSelected && !isCorrectAnswer && <XCircle size={16} color="#f87171" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <button style={styles.btn('primary')} onClick={handleRetry}>
            <RotateCcw size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Retry Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Brain size={28} color="#818cf8" />
        <div>
          <h2 style={styles.title}>{selectedSkill} Assessment</h2>
          <p style={styles.subtitle}>Question {currentQ + 1} of {questions.length}</p>
        </div>
      </div>

      <div style={styles.progressContainer}>
        <div style={styles.progressBar(progressPct)} />
      </div>
      <div style={styles.progressText}>
        <span>{answeredCount} of {questions.length} answered</span>
        <span>{progressPct}% complete</span>
      </div>

      <div style={styles.questionCard}>
        <div style={styles.questionText}>
          {currentQ + 1}. {currentQuestion.question}
        </div>
        {currentQuestion.options.map((opt, idx) => {
          const isSelected = selectedAnswer === idx;
          return (
            <button key={idx} style={styles.optionBtn(isSelected, false, false)} onClick={() => handleSelectOption(currentQuestion.id, idx)}>
              <span>{opt}</span>
              {isSelected && <CheckCircle size={16} color="#818cf8" />}
            </button>
          );
        })}
      </div>

      <div style={styles.actions}>
        <button style={styles.btn('outline')} onClick={handlePrev} disabled={currentQ === 0}>
          Previous
        </button>
        {currentQ < questions.length - 1 ? (
          <button style={styles.btn('primary')} onClick={handleNext}>
            Next
          </button>
        ) : (
          <button style={styles.btn('primary')} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        )}
      </div>
    </div>
  );
}
