const API = '/api';

let questions = [];
let currentIndex = 0;
let answers = [];
let selectedOption = null;

// ── Screens ──────────────────────────────────────────────────────────────────
const screens = {
  landing: document.getElementById('screen-landing'),
  quiz:    document.getElementById('screen-quiz'),
  result:  document.getElementById('screen-result'),
  contact: document.getElementById('screen-contact'),
};

function showScreen(name) {
  Object.values(screens).forEach(s => (s.style.display = 'none'));
  screens[name].style.display = 'flex';
  screens[name].style.flexDirection = 'column';
  screens[name].style.alignItems = name === 'quiz' ? 'stretch' : 'center';
}

// ── Start ─────────────────────────────────────────────────────────────────────
document.getElementById('btnStart').addEventListener('click', async () => {
  try {
    const res = await fetch(`${API}/quiz/questions`);
    questions = await res.json();
    answers = [];
    currentIndex = 0;
    showScreen('quiz');
    renderQuestion();
  } catch {
    alert('Could not load quiz. Is the server running?');
  }
});

// ── Render question ───────────────────────────────────────────────────────────
function renderQuestion() {
  const q = questions[currentIndex];
  selectedOption = null;

  document.getElementById('questionNum').textContent  = `Question ${currentIndex + 1}`;
  document.getElementById('questionText').textContent = q.text;
  document.getElementById('progressText').textContent = `Question ${currentIndex + 1} of ${questions.length}`;

  const pct = Math.round((currentIndex / questions.length) * 100);
  document.getElementById('progressPct').textContent  = `${pct}%`;
  document.getElementById('progressFill').style.width = `${pct}%`;

  const container = document.getElementById('optionsContainer');
  container.innerHTML = '';
  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.dataset.id = opt.id;
    btn.innerHTML = `<span class="option-letter">${opt.id.toUpperCase()}</span>${opt.text}`;
    btn.addEventListener('click', () => selectOption(opt.id));
    container.appendChild(btn);
  });

  const nextBtn = document.getElementById('btnNext');
  nextBtn.classList.remove('visible');
  nextBtn.textContent = currentIndex === questions.length - 1 ? 'See My Result →' : 'Next →';

  // Animate card
  const card = document.getElementById('questionCard');
  card.style.animation = 'none';
  requestAnimationFrame(() => { card.style.animation = 'fadeUp .35s ease both'; });
}

function selectOption(optId) {
  selectedOption = optId;
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.id === optId);
  });
  document.getElementById('btnNext').classList.add('visible');
}

// ── Next / Submit ─────────────────────────────────────────────────────────────
document.getElementById('btnNext').addEventListener('click', async () => {
  if (!selectedOption) return;

  answers.push({ questionId: questions[currentIndex].id, selectedOption });

  if (currentIndex < questions.length - 1) {
    currentIndex++;
    renderQuestion();
  } else {
    await submitQuiz();
  }
});

async function submitQuiz() {
  document.getElementById('btnNext').textContent = 'Calculating...';
  document.getElementById('btnNext').disabled = true;

  try {
    const res  = await fetch(`${API}/quiz/submit`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ answers }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Submission failed');
    showResult(data);
  } catch (err) {
    alert('Something went wrong: ' + err.message);
    document.getElementById('btnNext').textContent = 'See My Result →';
    document.getElementById('btnNext').disabled = false;
  }
}

// ── Show result ───────────────────────────────────────────────────────────────
function showResult(data) {
  document.getElementById('resultEmoji').textContent = data.emoji;
  document.getElementById('resultTag').textContent   = data.tag;
  document.getElementById('resultDesc').textContent  = data.description;

  const traitsEl = document.getElementById('resultTraits');
  traitsEl.innerHTML = data.traits
    .map(t => `<span class="trait-chip" style="color:${data.color}">${t}</span>`)
    .join('');

  const card = document.getElementById('resultCard');
  card.style.borderColor  = data.color;
  card.style.color        = data.color;
  card.style.background   = `${data.color}10`;

  document.getElementById('resultTag').style.color  = data.color;
  document.getElementById('resultDesc').style.color = '#f0f0ff';

  showScreen('result');
}

// ── Retake ────────────────────────────────────────────────────────────────────
document.getElementById('btnRetake').addEventListener('click', () => {
  answers = [];
  currentIndex = 0;
  showScreen('landing');
});

// ── Contact form ──────────────────────────────────────────────────────────────
document.getElementById('btnContact').addEventListener('click', () => showScreen('contact'));
document.getElementById('btnBackToResult').addEventListener('click', () => showScreen('result'));

document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const btn    = document.getElementById('btnSend');
  const status = document.getElementById('formStatus');

  const name    = document.getElementById('cName').value.trim();
  const email   = document.getElementById('cEmail').value.trim();
  const message = document.getElementById('cMessage').value.trim();

  btn.disabled    = true;
  btn.textContent = 'Sending...';
  status.className = '';
  status.textContent = '';

  try {
    const res  = await fetch(`${API}/contact`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, email, message }),
    });
    const data = await res.json();

    if (res.ok) {
      status.textContent = '✓ Message sent!';
      status.className   = 'form-status success';
      document.getElementById('contactForm').reset();
    } else {
      const msg = data.errors ? data.errors.map(e => e.msg).join(', ') : data.error || 'Error.';
      status.textContent = msg;
      status.className   = 'form-status error';
    }
  } catch {
    status.textContent = 'Could not reach the server.';
    status.className   = 'form-status error';
  }

  btn.disabled    = false;
  btn.textContent = 'Send Message';
});


