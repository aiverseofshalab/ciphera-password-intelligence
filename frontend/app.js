const form = document.querySelector('#analyze-form');
const passwordInput = document.querySelector('#password');
const submitButton = document.querySelector('#analyze-button');
const formMessage = document.querySelector('#form-message');
const results = document.querySelector('#results');
const emptyState = document.querySelector('#empty-state');
const analysisReport = document.querySelector('#analysis-report');
const checkLabels = {
  length: 'Length',
  uppercase: 'Uppercase',
  lowercase: 'Lowercase',
  number: 'Number',
  special: 'Special character'
};

document.querySelector('#toggle-password').addEventListener('click', (event) => {
  const showPassword = passwordInput.type === 'password';
  passwordInput.type = showPassword ? 'text' : 'password';
  event.currentTarget.textContent = showPassword ? 'Hide' : 'Show';
  event.currentTarget.setAttribute('aria-label', showPassword ? 'Hide password' : 'Show password');
  event.currentTarget.setAttribute('aria-pressed', String(showPassword));
});

async function updateHealthStatus() {
  const dot = document.querySelector('#health-dot');
  const label = document.querySelector('#health-text');
  try {
    const response = await fetch('/api/health');
    if (!response.ok) throw new Error('Health check failed');
    const data = await response.json();
    const available = data.status === 'UP';
    dot.className = `status-dot ${available ? 'up' : 'down'}`;
    label.textContent = available ? 'Local Analysis' : 'Analyzer unavailable';
    label.title = available ? 'The local analysis service is ready' : 'The analysis service could not be reached';
  } catch {
    dot.className = 'status-dot down';
    label.textContent = 'Analyzer unavailable';
  }
}

updateHealthStatus();

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  formMessage.textContent = '';
  const password = passwordInput.value;

  if (!password) {
    formMessage.textContent = 'Enter a password to analyze.';
    passwordInput.focus();
    return;
  }

  setLoading(true);
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || data.message || 'Password analysis service is unavailable.');
    }
    renderResult(data);
  } catch (error) {
    formMessage.textContent = error.message || 'Could not connect to the analysis service. Please try again.';
    await updateHealthStatus();
  } finally {
    setLoading(false);
  }
});

function setLoading(loading) {
  submitButton.disabled = loading;
  submitButton.classList.toggle('loading', loading);
  submitButton.setAttribute('aria-busy', String(loading));
  submitButton.querySelector('.button-text').textContent = loading ? 'Analyzing security…' : 'Analyze Security';
}

function renderResult(data) {
  emptyState.hidden = true;
  analysisReport.hidden = false;
  const score = Math.max(0, Math.min(100, Number(data.score) || 0));
  const strength = String(data.strength || 'Weak');
  document.querySelector('#score').textContent = score;
  document.querySelector('#score-fraction').textContent = `${score} / 100`;
  document.querySelector('#strength-text').textContent = strength;
  document.querySelector('#score-caption').textContent = strength === 'Strong'
    ? 'A resilient mix of character types'
    : strength === 'Medium' ? 'A few changes can improve this' : 'Consider making it longer and less predictable';

  const pill = document.querySelector('#strength-pill');
  pill.textContent = strength.toUpperCase();
  pill.className = `strength-pill ${strength.toLowerCase()}`;

  const progress = document.querySelector('#progress');
  const progressTrack = progress.parentElement;
  progressTrack.setAttribute('aria-valuenow', String(score));
  const ring = document.querySelector('#score-ring');
  ring.setAttribute('aria-label', `Password security score: ${score} out of 100`);
  ring.style.setProperty('--score-angle', '0deg');
  progress.style.width = '0%';
  requestAnimationFrame(() => {
    ring.style.setProperty('--score-angle', `${score * 3.6}deg`);
    progress.style.width = `${score}%`;
  });

  const checks = data.checks || {};
  const passed = Object.values(checks).filter(Boolean).length;
  document.querySelector('#check-count').textContent = `${passed} / ${Object.keys(checks).length} passed`;
  const checkList = document.querySelector('#checks');
  checkList.replaceChildren();
  for (const [key, label] of Object.entries(checkLabels)) {
    if (!(key in checks)) continue;
    const passedCheck = Boolean(checks[key]);
    const item = document.createElement('li');
    if (passedCheck) item.classList.add('pass');

    const icon = document.createElement('span');
    icon.className = 'check-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = passedCheck ? '✓' : '–';

    const text = document.createElement('span');
    text.className = 'check-text';
    const name = document.createElement('span');
    name.textContent = label;
    const state = document.createElement('span');
    state.className = 'check-state';
    state.textContent = passedCheck ? 'PASS' : 'MISSING';
    text.append(name, state);
    item.append(icon, text);
    checkList.append(item);
  }

  const warnings = Array.isArray(data.warnings) ? data.warnings : [];
  const warningBox = document.querySelector('#warnings-box');
  const warningList = document.querySelector('#warnings');
  warningList.replaceChildren();
  warningBox.hidden = warnings.length === 0;
  document.querySelector('#no-warnings').hidden = warnings.length > 0;
  for (const warning of warnings) {
    const item = document.createElement('li');
    item.textContent = warning;
    warningList.append(item);
  }

  document.querySelector('#report-title-result').textContent = 'Analysis complete';
}
