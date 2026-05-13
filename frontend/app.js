const API = '/api';

let currentUser    = null;
let questions      = [];
let currentIndex   = 0;
let answers        = [];
let selectedOption = null;
let lastResult     = null;

const app = document.getElementById('app');

app.innerHTML = `
  <nav id="nav-public">
    <span class="nav-brand">Personality Quiz</span>
    <div class="nav-public-actions">
      <button class="btn-outline" id="btnNavLogin">Log in</button>
      <button class="btn-pill" id="btnNavSignup">Sign up</button>
    </div>
  </nav>

  <nav id="navbar">
    <span class="nav-brand">Personality Quiz</span>
    <div class="nav-user">
      <span>Logged in as <span class="nav-name" id="navName"></span> <span class="nav-tag" id="navTag"></span></span>
      <button class="btn-logout" id="btnLogout">Log out</button>
    </div>
  </nav>

  <section class="screen active" id="screen-hero">
    <div class="hero-inner">
      <div class="hero-badge">Free &bull; 10 Questions &bull; Instant Results</div>
      <h1 class="hero-title">Discover What<br>Drives You</h1>
      <p class="hero-sub">Answer 10 questions and get matched to one of 8 personality archetypes. Find out how you think, lead, create, and connect.</p>
      <button class="btn-start" id="btnHeroCta">Take the Quiz</button>
      <div class="hero-features">
        <div class="hero-feat"><span class="feat-icon">&#9632;</span><span>8 personality types</span></div>
        <div class="hero-feat"><span class="feat-icon">&#9632;</span><span>Takes under 3 minutes</span></div>
        <div class="hero-feat"><span class="feat-icon">&#9632;</span><span>No account required to start</span></div>
      </div>
    </div>
  </section>

  <section class="screen" id="screen-login">
    <div class="card">
      <h1 class="login-title" id="loginTitle">Create an account</h1>
      <p class="subtitle">Enter your name and email to get started.</p>
      <form id="loginForm" novalidate>
        <div class="form-group">
          <label for="loginName">Name</label>
          <input type="text" id="loginName" placeholder="Your name" autocomplete="name" />
          <div class="field-error" id="loginNameErr">Name is required.</div>
        </div>
        <div class="form-group">
          <label for="loginEmail">Email</label>
          <input type="email" id="loginEmail" placeholder="your@email.com" autocomplete="email" />
          <div class="field-error" id="loginEmailErr">A valid email is required.</div>
        </div>
        <button type="submit" class="btn-primary" id="btnLogin">Continue</button>
        <div class="form-status" id="loginStatus"></div>
      </form>
    </div>
  </section>

  <section class="screen" id="screen-welcome">
    <div class="landing-icon">
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-linecap="round"/><path d="M12 8v4l3 3" stroke-linecap="round"/></svg>
    </div>
    <h1 class="landing-title">What Type Are You?</h1>
    <p class="landing-desc">10 questions. 8 personality archetypes. Find out which one matches how you think, act, and move through the world.</p>
    <button class="btn-start" id="btnStart">Start the Quiz</button>
  </section>

  <section class="screen" id="screen-quiz">
    <div class="progress-wrap">
      <div class="progress-label">
        <span id="progressText">Question 1 of 10</span>
        <span id="progressPct">0%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" id="progressFill"></div>
      </div>
    </div>
    <div class="card" id="questionCard">
      <div class="question-num" id="questionNum">Question 1</div>
      <div class="question-text" id="questionText"></div>
      <div class="options" id="optionsContainer"></div>
    </div>
    <div class="quiz-footer">
      <button class="btn-next" id="btnNext">Next</button>
    </div>
  </section>

  <section class="screen" id="screen-result">
    <div class="result-card" id="resultCard">
      <div class="result-label">Your personality type</div>
      <div class="result-tag" id="resultTag"></div>
      <p class="result-desc" id="resultDesc"></p>
      <div class="traits" id="resultTraits"></div>
      <div class="result-actions">
        <button class="btn-secondary" id="btnRetake">Retake Quiz</button>
        <button class="btn-accent" id="btnContact">Leave a Message</button>
      </div>
    </div>
  </section>

  <section class="screen" id="screen-contact">
    <div class="card">
      <h2 class="contact-title">Leave a Message</h2>
      <p class="subtitle">We read every message.</p>
      <form id="contactForm" novalidate>
        <div class="form-group">
          <label for="cName">Name</label>
          <input type="text" id="cName" placeholder="Your name" />
          <div class="field-error" id="cNameErr">Name is required.</div>
        </div>
        <div class="form-group">
          <label for="cEmail">Email</label>
          <input type="email" id="cEmail" placeholder="your@email.com" />
          <div class="field-error" id="cEmailErr">A valid email is required.</div>
        </div>
        <div class="form-group">
          <label for="cMessage">Message</label>
          <textarea id="cMessage" placeholder="Write something..."></textarea>
          <div class="field-error" id="cMessageErr">Message is required.</div>
        </div>
        <button type="submit" class="btn-primary" id="btnSend">Send Message</button>
        <div class="form-status" id="contactStatus"></div>
      </form>
      <div style="margin-top:16px;text-align:center;">
        <button class="btn-secondary" id="btnBackToResult">Back to my result</button>
      </div>
    </div>
  </section>
`;

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  target.classList.add('active');
  target.style.animation = 'none';
  requestAnimationFrame(() => { target.style.animation = ''; });

  const pubNav  = document.getElementById('nav-public');
  const authNav = document.getElementById('navbar');

  if (id === 'screen-hero') {
    pubNav.classList.add('visible');
    authNav.classList.remove('visible');
    document.body.style.paddingTop = '64px';
  } else if (id === 'screen-login') {
    pubNav.classList.remove('visible');
    authNav.classList.remove('visible');
    document.body.style.paddingTop = '0';
  } else {
    pubNav.classList.remove('visible');
    authNav.classList.add('visible');
    document.body.style.paddingTop = '64px';
  }
  window.scrollTo(0, 0);
}

function setNav(user) {
  if (user) {
    document.getElementById('navName').textContent = user.name;
  }
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nameInput  = document.getElementById('loginName');
  const emailInput = document.getElementById('loginEmail');
  const nameErr    = document.getElementById('loginNameErr');
  const emailErr   = document.getElementById('loginEmailErr');
  const status     = document.getElementById('loginStatus');
  const btn        = document.getElementById('btnLogin');

  nameErr.classList.remove('show');
  emailErr.classList.remove('show');
  status.textContent = '';
  status.className = 'form-status';

  const name  = nameInput.value.trim();
  const email = emailInput.value.trim();
  let valid = true;
  if (!name)  { nameErr.classList.add('show');  valid = false; }
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
    setNav(currentUser);
    showScreen('screen-welcome');
  } catch {
    status.textContent = 'Could not reach the server.';
    status.className   = 'form-status error';
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Continue';
  }
});

document.getElementById('btnLogout').addEventListener('click', () => {
  currentUser = null;
  questions   = [];
  answers     = [];
  lastResult  = null;
  const navTag = document.getElementById('navTag');
  navTag.textContent = '';
  navTag.classList.remove('visible');
  setNav(null);
  document.getElementById('loginForm').reset();
  document.getElementById('loginStatus').textContent = '';
  showScreen('screen-hero');
});

document.getElementById('btnStart').addEventListener('click', startQuiz);

document.getElementById('btnHeroCta').addEventListener('click', () => {
  document.getElementById('loginTitle').textContent = 'Take the Quiz';
  showScreen('screen-login');
});

document.getElementById('btnNavLogin').addEventListener('click', () => {
  document.getElementById('loginTitle').textContent = 'Log in';
  showScreen('screen-login');
});

document.getElementById('btnNavSignup').addEventListener('click', () => {
  document.getElementById('loginTitle').textContent = 'Create an account';
  showScreen('screen-login');
});

async function startQuiz() {
  try {
    if (questions.length === 0) {
      const res = await fetch(`${API}/quiz/questions`);
      if (!res.ok) throw new Error('Failed to load questions');
      questions = await res.json();
    }
    answers        = [];
    currentIndex   = 0;
    selectedOption = null;
    showScreen('screen-quiz');
    renderQuestion();
  } catch {
    alert('Could not load quiz questions. Please try again.');
  }
}

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
    btn.className  = 'option-btn';
    btn.dataset.id = opt.id;
    btn.type       = 'button';
    btn.innerHTML  = `<span class="option-letter">${opt.id.toUpperCase()}</span>${opt.text}`;
    btn.addEventListener('click', () => selectOption(opt.id));
    container.appendChild(btn);
  });

  const nextBtn = document.getElementById('btnNext');
  nextBtn.classList.remove('visible');
  nextBtn.textContent = currentIndex === questions.length - 1 ? 'See My Result' : 'Next';

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

  const navTag = document.getElementById('navTag');
  navTag.textContent = data.tag;
  navTag.style.color = data.color;
  navTag.classList.add('visible');

  showScreen('screen-result');
}

document.getElementById('btnRetake').addEventListener('click', () => {
  answers        = [];
  currentIndex   = 0;
  selectedOption = null;
  lastResult     = null;
  const navTag = document.getElementById('navTag');
  navTag.textContent = '';
  navTag.classList.remove('visible');
  showScreen('screen-welcome');
});

document.getElementById('btnContact').addEventListener('click', () => {
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

  [nameErr, emailErr, messageErr].forEach(el => el.classList.remove('show'));
  status.textContent = '';
  status.className   = 'form-status';

  const name    = nameInput.value.trim();
  const email   = emailInput.value.trim();
  const message = messageInput.value.trim();
  let valid = true;
  if (!name)    { nameErr.classList.add('show');  valid = false; }
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
