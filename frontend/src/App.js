import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Typography, TextField, Button, Paper, Box, Alert, Grid,
  ThemeProvider, createTheme, CssBaseline, LinearProgress, Fade
} from '@mui/material';

// --- PREMIUM CARNELIAN THEME ---
const theme = createTheme({
  palette: {
    background: { default: '#f8fafc' },
    primary: { main: '#b71c1c' },
    secondary: { main: '#f57c00' },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: { fontWeight: 800, letterSpacing: '-0.02em' },
    h4: { fontWeight: 700, letterSpacing: '-0.01em' },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.5px' }
  },
  shape: { borderRadius: 16 },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            transition: 'all 0.2s ease',
            '&:hover fieldset': { borderColor: '#f57c00' },
            '&.Mui-focused fieldset': { borderColor: '#b71c1c', borderWidth: '2px' },
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '50px',
          padding: '14px 32px',
          boxShadow: '0 4px 14px 0 rgba(183, 28, 28, 0.2)',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(183, 28, 28, 0.3)',
          }
        }
      }
    }
  }
});

// --- 24 DISC QUESTIONS ---
const questions = [
  { id: 1, A: 'Restrained', B: 'Forceful', C: 'Careful', D: 'Expressive' },
  { id: 2, A: 'Pioneering', B: 'Correct', C: 'Exciting', D: 'Satisfied' },
  { id: 3, A: 'Willing', B: 'Animated', C: 'Bold', D: 'Precise' },
  { id: 4, A: 'Argumentative', B: 'Doubting', C: 'Indecisive', D: 'Unpredictable' },
  { id: 5, A: 'Respectful', B: 'Out-going', C: 'Patient', D: 'Daring' },
  { id: 6, A: 'Persuasive', B: 'Self-reliant', C: 'Logical', D: 'Gentle' },
  { id: 7, A: 'Cautious', B: 'Even-tempered', C: 'Decisive', D: 'Life-of-the-party' },
  { id: 8, A: 'Popular', B: 'Assertive', C: 'Perfectionist', D: 'Generous' },
  { id: 9, A: 'Colorful', B: 'Modest', C: 'Easy-going', D: 'Unyielding' },
  { id: 10, A: 'Systematic', B: 'Optimistic', C: 'Persistent', D: 'Accommodating' },
  { id: 11, A: 'Relentless', B: 'Humble', C: 'Neighborly', D: 'Talkative' },
  { id: 12, A: 'Friendly', B: 'Observant', C: 'Playful', D: 'Strong-willed' },
  { id: 13, A: 'Charming', B: 'Adventurous', C: 'Disciplined', D: 'Deliberate' },
  { id: 14, A: 'Restrained', B: 'Steady', C: 'Aggressive', D: 'Attractive' },
  { id: 15, A: 'Enthusiastic', B: 'Analytical', C: 'Sympathetic', D: 'Determined' },
  { id: 16, A: 'Commanding', B: 'Impulsive', C: 'Slow-paced', D: 'Critical' },
  { id: 17, A: 'Consistent', B: 'Force-of-character', C: 'Lively', D: 'Laid-back' },
  { id: 18, A: 'Influential', B: 'Kind', C: 'Independent', D: 'Orderly' },
  { id: 19, A: 'Idealistic', B: 'Popular', C: 'Pleasant', D: 'Out-spoken' },
  { id: 20, A: 'Impatient', B: 'Serious', C: 'Procrastinator', D: 'Emotional' },
  { id: 21, A: 'Competitive', B: 'Spontaneous', C: 'Loyal', D: 'Thoughtful' },
  { id: 22, A: 'Self-sacrificing', B: 'Considerate', C: 'Convincing', D: 'Courageous' },
  { id: 23, A: 'Dependent', B: 'Flighty', C: 'Stoic', D: 'Pushy' },
  { id: 24, A: 'Tolerant', B: 'Conventional', C: 'Stimulating', D: 'Directing' }
];

function App() {
  const [step, setStep] = useState(0);
  const [userInfo, setUserInfo] = useState({ name: '', cnic: '' });
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [show, setShow] = useState(true);

  const changeStep = (newStep) => {
    setShow(false);
    setTimeout(() => {
      setStep(newStep);
      window.scrollTo(0, 0);
      setShow(true);
    }, 300);
  };

  const handleNameChange = (e) => setUserInfo({ ...userInfo, name: e.target.value });

  const handleCnicChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 13) val = val.slice(0, 13);
    let formatted = val;
    if (val.length > 5 && val.length <= 12) {
      formatted = `${val.slice(0, 5)}-${val.slice(5)}`;
    } else if (val.length > 12) {
      formatted = `${val.slice(0, 5)}-${val.slice(5, 12)}-${val.slice(12)}`;
    }
    setUserInfo({ ...userInfo, cnic: formatted });
  };

  const handleStart = () => {
    const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
    if (!userInfo.name.trim()) return setError('Please enter your full name.');
    if (!cnicRegex.test(userInfo.cnic)) return setError('Please enter a valid 13-digit CNIC.');
    setError('');
    changeStep(1);
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
    setError('');
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      setError('Please answer all 24 questions before submitting.');
      return;
    }
    try {
      const apiUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      await axios.post(`${apiUrl}/api/submit`, { userInfo, answers });
      changeStep(2);
    } catch (err) {
      setError('Failed to submit. Please ensure backend is running.');
    }
  };

  const progressPercentage = (Object.keys(answers).length / questions.length) * 100;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* STICKY HEADER — shows "DISC Assessment" text instead of logo */}
      {step === 1 && (
        <Box sx={{
          position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 9999,
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>
          <LinearProgress
            variant="determinate"
            value={progressPercentage}
            sx={{ height: 6, backgroundColor: '#f1f5f9', '& .MuiLinearProgress-bar': { backgroundColor: '#f57c00' } }}
          />
          <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
            {/* ✅ FIX: Show "DISC Assessment" text instead of broken logo image */}
            <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#b71c1c', letterSpacing: '-0.01em' }}>
              DISC Assessment
            </Typography>
            <Typography variant="body2" fontWeight="bold" color="textSecondary">
              {Object.keys(answers).length} / 24 Answered
            </Typography>
          </Container>
        </Box>
      )}

      <Container maxWidth="md" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: step === 1 ? 12 : 6 }}>
        <Fade in={show} timeout={400}>
          <Paper elevation={0} sx={{
            width: '100%', p: { xs: 4, md: 8 },
            borderRadius: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.05)',
            backgroundColor: '#ffffff'
          }}>

            {/* STEP 0: LANDING PAGE */}
            {step === 0 && (
              <Box sx={{ maxWidth: 480, mx: 'auto', textAlign: 'center' }}>
                <img src="/logo.png" alt="Logo" style={{ width: '90px', marginBottom: '32px' }} />
                <Typography variant="h3" sx={{ color: '#b71c1c', mb: 1, fontSize: { xs: '2.2rem', sm: '2.8rem' } }}>
                  DISC Assessment
                </Typography>
                <Typography variant="h6" sx={{ color: '#f57c00', fontWeight: 500, mb: 3 }}>
                  Understanding Your Work Style
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748b', mb: 5, lineHeight: 1.6 }}>
                  Discover your dominant behavioral traits. Select the one word in each row that describes you best right now.
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', textAlign: 'left' }}>{error}</Alert>}
                <Box component="div" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField label="Full Name" value={userInfo.name} onChange={handleNameChange} fullWidth required />
                  <TextField
                    label="CNIC Number"
                    value={userInfo.cnic}
                    onChange={handleCnicChange}
                    placeholder="12345-1234567-1"
                    fullWidth required
                    helperText="Type numbers only. Dashes are added automatically."
                    FormHelperTextProps={{ sx: { textAlign: 'center' } }}
                  />
                  <Button
                    variant="contained" size="large" onClick={handleStart}
                    sx={{ mt: 2, fontSize: '1.1rem', backgroundColor: '#b71c1c', '&:hover': { backgroundColor: '#9b0000' } }}
                  >
                    Start Assessment
                  </Button>
                </Box>
              </Box>
            )}

            {/* STEP 1: QUESTIONS */}
            {step === 1 && (
              <Box>
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                  <Typography variant="h4" sx={{ color: '#1e293b', mb: 1 }}>
                    Select the word that fits you best.
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Trust your instincts. Don't overthink your choices.
                  </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 4, borderRadius: '12px' }}>{error}</Alert>}

                {questions.map((q) => (
                  <Box key={q.id} sx={{ mb: 4 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1.5, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                      Question {q.id}
                    </Typography>

                    {/* ✅ FIX: All 4 options always in one row using xs={3} */}
                    <Grid container spacing={2} wrap="nowrap">
                      {['A', 'B', 'C', 'D'].map((optionKey) => {
                        const isSelected = answers[q.id] === optionKey;
                        return (
                          <Grid item xs={3} key={optionKey}>
                            <Box
                              onClick={() => handleAnswerChange(q.id, optionKey)}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: isSelected ? '2px solid #b71c1c' : '2px solid #e2e8f0',
                                backgroundColor: isSelected ? '#fff5f5' : '#ffffff',
                                color: isSelected ? '#b71c1c' : '#475569',
                                borderRadius: '16px',
                                py: 2.5,
                                px: 1,
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                fontWeight: isSelected ? 700 : 500,
                                fontSize: { xs: '0.75rem', sm: '0.9rem', md: '1rem' },
                                minHeight: '60px',
                                '&:hover': {
                                  borderColor: isSelected ? '#b71c1c' : '#cbd5e1',
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                                }
                              }}
                            >
                              {q[optionKey]}
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                ))}

                {/* ✅ FIX: Properly centered submit button */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                  <Button
                    variant="contained" size="large" onClick={handleSubmit}
                    sx={{ py: 1.8, px: 6, fontSize: '1.2rem', backgroundColor: '#b71c1c', '&:hover': { backgroundColor: '#9b0000' } }}
                  >
                    Submit Assessment
                  </Button>
                </Box>
              </Box>
            )}

            {/* STEP 2: THANK YOU */}
            {step === 2 && (
              <Box sx={{ textAlign: 'center', py: 8, maxWidth: 500, mx: 'auto' }}>
                <Box sx={{
                  width: 80, height: 80, borderRadius: '50%', backgroundColor: '#e8f5e9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 4
                }}>
                  <Typography variant="h3" color="#2e7d32">✓</Typography>
                </Box>
                <Typography variant="h3" sx={{ color: '#1e293b', mb: 2 }}>
                  Thank You!
                </Typography>
                <Typography variant="h6" sx={{ color: '#64748b', mb: 4, fontWeight: 400, lineHeight: 1.6 }}>
                  <strong style={{ color: '#b71c1c' }}>{userInfo.name}</strong>, your assessment has been successfully submitted.
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ p: 3, backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                  You may now close this window.
                </Typography>
              </Box>
            )}

          </Paper>
        </Fade>
      </Container>
    </ThemeProvider>
  );
}

export default App;