// this file handles all the javascript for the frontend demo page
// it submits the contact form to the backend and displays the saved messages
// this is just for testing the backend, it is not part of the final website design

const API = '/api';

//testing for backend functionality, not part of the final product
document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const btn = document.getElementById('submitBtn');
  const status = document.getElementById('status');

  const name    = document.getElementById('name').value.trim();
  const email   = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  btn.disabled = true;
  btn.textContent = 'Send';
  status.className = '';
  status.style.display = 'none';

  try {
    const res = await fetch(`${API}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    });

    const data = await res.json();

    if (res.ok) {
      status.textContent = 'Message sent successfully!';
      status.className = 'success';
      document.getElementById('contactForm').reset();
      loadSubmissions();
    } else {
      const errorMsg = data.errors
        ? data.errors.map((e) => e.msg).join(', ')
        : data.error || 'Something went wrong.';
      status.textContent = errorMsg;
      status.className = 'error';
    }
  } catch (err) {
    status.textContent = 'Could not reach the server. Is the backend running?';
    status.className = 'error';
  }

  btn.disabled = false;
  btn.textContent = 'Send Message';
});

// Load all submissions
async function loadSubmissions() {
  const list = document.getElementById('submissionsList');

  try {
    const res = await fetch(`${API}/contact`);
    const data = await res.json();

    if (!data.length) {
      list.innerHTML = '<p id="noMessages">No messages yet.</p>';
      return;
    }

    list.innerHTML = data.map((item) => `
      <div class="submission-item">
        <div class="name">${escapeHtml(item.name)}</div>
        <div class="email">${escapeHtml(item.email)}</div>
        <div class="msg">${escapeHtml(item.message)}</div>
        <div class="date">${new Date(item.createdAt).toLocaleString()}</div>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = '<p style="color:#c62828">Could not load submissions.</p>';
  }
}

// Prevent XSS when rendering user-submitted data
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Load on page open
loadSubmissions();
