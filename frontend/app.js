const API = '/api';

// ── State ─────────────────────────────────────────────────────────────────────
let currentUser = null;
let questions   = [];
let currentIndex = 0;
let answers      = [];
let selectedOption = null;
let lastResult   = null;

// ── Screen management ─────────────────────────────────────────────────────────
const screenIds = ['screen-login', 'screen-landing', 'screen-quiz', 'screen-result', 'screen-contact'];

function showScreen(id) {
  screenIds.forEach(s => {
    const el = document.getElementById(s);
    el.style.display = 'none';
  });
  const target = document.getElementById(id);
  target.style.display = 'flex';
  target.style.flexDirection = 'column';
  if (id === 'screen-quiz') target.style.alignItems = 'stretch';
  else target.style.alignItems = 'center';
  window.scrollTo(0, 0);
}

function setNavVisible(user) {
  const nav = document.getElementById('navbar');
  if (user) {
    nav.classList.add('visible');
    document.getElementById('navName').textContent = user.name;
    document.body.style.paddingTop = '64px';
  } else {
    nav.classList.remove('visible');
    document.body.style.paddingTop = '0';
  }
}

// ── Login ─────────────────────────────────────────────────────────────────────
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nameInput  = document.getElementById('loginName');
  const emailInput = document.getElementById('loginEmail');
  const nameErr    = document.getElementById('loginNameErr');
  const emailErr   = document.getElementById('loginEmailErr');
  const status     = document.getElementById('loginStatus');
  const btn        = document.getElementById('btnLogin');

  // Clear errors
  nameErr.classList.remove('show');
  emailErr.classList.remove('show');
  status.textContent = '';
  status.className = 'form-status';

  const name  = nameInput.value.trim();
  const email = emailInput.value.trim();
  let valid = true;

  if (!name) { nameErr.classList.add('show'); valid = false; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { emailErr.classList.add('show'); valid = false; }
  if (!valid) return;

  btn.disabled = true;
  btn.textContent = 'Loading...';

  try {
    const res  = await fetch(`${API}/users/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, email }),
    });
    const data = await res.json();

    if (!res.ok) {
      const msg = data.errors ? data.errors.map(e => e.msg).join(', ') : data.error || 'Login failed.';
      status.textContent = msg;
      status.className   = 'form-status error';
      return;
    }

    currentUser = data;
    setNavVisible(currentUser);
    showScreen('screen-landing');
  } catch {
    status.textContent = 'Could not reach the server. Is it running?';
    status.className   = 'form-status error';
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Continue';
  }
});

// ── Logout ────────────────────────────────────────────────────────────────────
document.getElementById('btnLogout').addEventListener('click', () => {
  currentUser = null;
  questions   = [];
  answers     = [];
  lastResult  = null;
  setNavVisible(null);
  document.getElementById('loginForm').reset();
  document.getElementById('loginStatus').textContent = '';
  showScreen('screen-login');
});

// ── Start quiz ────────────────────────────────────────────────────────────────
document.getElementById('btnStart').addEventListener('click', startQuiz);

async function startQuiz() {
  try {
    if (questions.length === 0) {
      const res = await fetch(`${API}/quiz/questions`);
      if (!res.ok) throw new Error('Failed to load questions');
      questions = await res.json();
    }
    answers      = [];
    currentIndex = 0;
    selectedOption = null;
    showScreen('screen-quiz');
    renderQuestion();
  } catch {
    alert('Could not load quiz questions. Please try again.');
  }
}

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
    btn.className   = 'option-btn';
    btn.dataset.id  = opt.id;
    btn.type        = 'button';
    btn.innerHTML   = `<span class="option-letter">${opt.id.toUpperCase()}</span>${opt.text}`;
    btn.addEventListener('click', () => selectOption(opt.id));
    container.appendChild(btn);
  });

  const nextBtn = document.getElementById('btnNext');
  nextBtn.classList.remove('visible');
  nextBtn.textContent = currentIndex === questions.length - 1 ? 'See My Result' : 'Next';

  // Re-trigger animation
  const card = document.getElementById('questionCard');
  card.style.animation = 'none';
  requestAnimationFrame(() => { card.style.animation = 'fadeUp .3s ease both'; });
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
  const nextBtn = document.getElementById('btnNext');
  nextBtn.textContent = 'Calculating...';
  nextBtn.disabled    = true;

  try {
    const res  = await fetch(`${API}/quiz/submit`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ answers }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Submission failed');
    lastResult = data;
    showResult(data);
  } catch (err) {
    alert('Something went wrong: ' + err.message);
    nextBtn.textContent = 'See My Result';
    nextBtn.disabled    = false;
  }
}

// ── Show result ───────────────────────────────────────────────────────────────
function showResult(data) {
  document.getElementById('resultTag').textContent  = data.tag;
  document.getElementById('resultDesc').textContent = data.description;

  const traitsEl = document.getElementById('resultTraits');
  traitsEl.innerHTML = data.traits
    .map(t => `<span class="trait-chip" style="color:${data.color}">${t}</span>`)
    .join('');

  const card = document.getElementById('resultCard');
  card.style.borderColor = data.color;
  card.style.color       = data.color;
  card.style.background  = `${data.color}12`;

  document.getElementById('resultTag').style.color  = data.color;
  document.getElementById('resultDesc').style.color = 'var(--muted)';

  showScreen('screen-result');
}

// ── Retake quiz ───────────────────────────────────────────────────────────────
document.getElementById('btnRetake').addEventListener('click', () => {
  answers        = [];
  currentIndex   = 0;
  selectedOption = null;
  lastResult     = null;
  showScreen('screen-landing');
});

// ── Contact ───────────────────────────────────────────────────────────────────
document.getElementById('btnContact').addEventListener('click', () => {
  // Pre-fill from logged-in user
  if (currentUser) {
    document.getElementById('cName').value  = currentUser.name;
    document.getElementById('cEmail').value = currentUser.email;
  }
  showScreen('screen-contact');
});

document.getElementById('btnBackToResult').addEventListener('click', () => {
  if (lastResult) showResult(lastResult);
  else showScreen('screen-landing');
});

document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nameInput    = document.getElementById('cName');
  const emailInput   = document.getElementById('cEmail');
  const messageInput = document.getElementById('cMessage');
  const nameErr      = document.getElementById('cNameErr');
  const emailErr     = document.getElementById('cEmailErr');
  const messageErr   = document.getElementById('cMessageErr');
  const status       = document.getElementById('contactStatus');
  const btn          = document.getElementById('btnSend');

  // Clear errors
  [nameErr, emailErr, messageErr].forEach(el => el.classList.remove('show'));
  status.textContent = '';
  status.className   = 'form-status';

  const name    = nameInput.value.trim();
  const email   = emailInput.value.trim();
  const message = messageInput.value.trim();
  let valid = true;

  if (!name)    { nameErr.classList.add('show'); valid = false; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { emailErr.classList.add('show'); valid = false; }
  if (!message) { messageErr.classList.add('show'); valid = false; }
  if (!valid) return;

  btn.disabled    = true;
  btn.textContent = 'Sending...';

  try {
    const res  = await fetch(`${API}/contact`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, email, message }),
    });
    const data = await res.json();

    if (res.ok) {
      status.textContent = 'Message sent successfully.';
      status.className   = 'form-status success';
      messageInput.value = '';
    } else {
      const msg = data.errors ? data.errors.map(e => e.msg).join(', ') : data.error || 'Error sending message.';
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


