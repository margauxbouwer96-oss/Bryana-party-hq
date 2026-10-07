import './style.css';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xytvohfxbaeyjfbfbimr.supabase.co',
  'sb_publishable_6C3P7rVy8GXDwtrhJCR9Vw_uYODvHn4'
);

const app = document.querySelector('#app');
const state = {
  guest: null,
  questions: [],
  answers: {},
  startedAt: null,
  preview: false,
  testMode: localStorage.getItem('party_test_mode') === '1',
};

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[m]));

function toast(message) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}

function setTestMode(on) {
  state.testMode = !!on;
  localStorage.setItem('party_test_mode', on ? '1' : '0');
}

function icon(name) {
  const map = {
    home: '⌂',
    itinerary: '🗓',
    mission: '💋',
    olympics: '◎',
    quiz: '🧠',
    gallery: '📷',
    rules: '♛',
    hits: '✦',
    back: '‹',
    cake: '🎂',
    house: '⌂',
    drinks: '🥂',
    quizsmall: '🧠',
    games: '🎲',
  };
  return map[name] || '✦';
}

function shell(inner, options = {}) {
  const { bodyClass = '', noFrame = false } = options;
  app.innerHTML = `
    <div class="site-wrap ${noFrame ? 'no-frame' : ''}">
      <div class="phone-shell ${bodyClass}">
        ${state.testMode ? '<div class="test-banner">TEST MODE · quiz scores will not be saved</div>' : ''}
        ${inner}
      </div>
    </div>
  `;
  bindActions();
}

function topChrome() {
  return `
    <div class="phone-chrome">
      <span>9:41</span>
      <span class="island"></span>
      <span>⌁</span>
    </div>
  `;
}

function doodles() {
  return `
    <span class="doodle heart heart-a">♡</span>
    <span class="doodle heart heart-b">♡</span>
    <span class="doodle star star-a">✦</span>
    <span class="doodle star star-b">✦</span>
    <span class="doodle scribble scribble-a">⌇</span>
  `;
}

function headerHome() {
  return `
    ${topChrome()}
    <section class="hero-panel">
      ${doodles()}
      <div class="date-kicker">SATURDAY 24 OCTOBER 2026</div>
      <div class="title-stack">
        <div class="script-title">Bryana's</div>
        <div class="ransom-wrap">
          <span class="ransom big">DIVORCE</span>
          <span class="ransom big">PARTY</span>
        </div>
      </div>
      <div class="tagline">Food, drinks &amp; zero regrets ♡</div>
      <div class="black-strip">BLACK DRESS CODE</div>
    </section>
  `;
}

function screenHeader(title, subtitle = '') {
  return `
    ${topChrome()}
    <div class="screen-header">
      <button class="back-link" data-go="home">${icon('back')} Back</button>
      ${doodles()}
      <div class="screen-title-wrap">
        <span class="ransom">${esc(title)}</span>
      </div>
      ${subtitle ? `<div class="screen-subtitle">${subtitle}</div>` : ''}
    </div>
  `;
}

function menuButton(route, label, caption, iconLabel) {
  return `
    <button class="menu-button" data-go="${route}">
      <span class="menu-icon">${icon(iconLabel || route)}</span>
      <span class="menu-copy">
        <span class="menu-label">${esc(label)}</span>
        ${caption ? `<span class="menu-caption">${esc(caption)}</span>` : ''}
      </span>
      <span class="menu-arrow">›</span>
    </button>
  `;
}

function infoCard(content, extraClass = '') {
  return `<div class="paper-card ${extraClass}">${content}</div>`;
}

async function getCurrentGuest() {
  const slug = localStorage.getItem('party_guest');
  if (!slug) return null;
  const { data } = await supabase.from('guests').select('*').eq('slug', slug).maybeSingle();
  state.guest = data;
  return data;
}

async function renderGuestPicker() {
  const { data } = await supabase.from('guests').select('slug,name,title').order('name');
  shell(`
    ${headerHome()}
    <section class="content-stack">
      ${infoCard(`
        <h2 class="card-heading">WHO ARE YOU?</h2>
        <p class="hand-copy">Pick your name once. This phone will remember you.</p>
        <button class="small-toggle" id="toggleTest">${state.testMode ? 'Disable' : 'Enable'} organizer test mode</button>
      `, 'intro-card')}
      <div class="guest-list">
        ${(data || []).map((g) => `
          <button class="guest-card" data-guest="${g.slug}">
            <strong>${esc(g.name)}</strong>
            <span>${esc(g.title || 'CLASSIFIED FILE')}</span>
          </button>
        `).join('')}
      </div>
    </section>
  `);

  document.querySelectorAll('[data-guest]').forEach((btn) => {
    btn.onclick = () => {
      localStorage.setItem('party_guest', btn.dataset.guest);
      renderHome();
    };
  });
  document.getElementById('toggleTest').onclick = () => {
    setTestMode(!state.testMode);
    renderGuestPicker();
  };
}

async function renderHome() {
  const guest = await getCurrentGuest();
  if (!guest) return renderGuestPicker();

  shell(`
    ${headerHome()}
    <section class="content-stack home-stack">
      <div class="identity-row">
        <div>
          <div class="identity-kicker">SIGNED IN AS</div>
          <div class="identity-name">${esc(guest.name)}</div>
          <div class="identity-title">${esc(guest.title || 'Classified Guest')}</div>
        </div>
        <button class="linkish" id="switchGuest">Switch</button>
      </div>

      <div class="menu-list">
        ${menuButton('home', 'Home', 'Main menu', 'home')}
        ${menuButton('itinerary', 'Itinerary', 'The plan (so far...)', 'itinerary')}
        ${menuButton('mission', 'Your Mission', 'One mission. No excuses.', 'mission')}
        ${menuButton('olympics', 'Freedom Olympics', "Bryana's challenges", 'olympics')}
        ${menuButton('quiz', 'Bryana Files', 'Quiz & leaderboard', 'quiz')}
        ${menuButton('gallery', 'Gallery', 'Receipts or it didn’t happen', 'gallery')}
        ${menuButton('rules', "Regina's Rules", 'Obey or face consequences', 'rules')}
      </div>
    </section>
  `);

  document.getElementById('switchGuest').onclick = () => {
    localStorage.removeItem('party_guest');
    renderGuestPicker();
  };
}

function timelineIcon(title = '') {
  const t = title.toLowerCase();
  if (t.includes('cake')) return 'cake';
  if (t.includes('hq') || t.includes('house')) return 'house';
  if (t.includes('food') || t.includes('snack')) return 'drinks';
  if (t.includes('quiz')) return 'quizsmall';
  if (t.includes('game')) return 'games';
  return 'itinerary';
}

async function renderItinerary() {
  const { data } = await supabase.from('itinerary_items').select('*').order('sort_order');
  shell(`
    ${screenHeader('ITINERARY', 'The plan (so far...)')}
    <section class="content-stack">
      <div class="timeline-card">
        ${(data || []).map((item) => `
          <div class="timeline-row">
            <div class="time-pill">${esc(item.time_label)}</div>
            <div class="timeline-copy">
              <div class="timeline-title">${esc(item.title)}</div>
              ${item.subtitle ? `<div class="timeline-sub">${esc(item.subtitle)}</div>` : ''}
            </div>
            <div class="timeline-right">${icon(timelineIcon(item.title))}</div>
          </div>
        `).join('')}
      </div>
      <div class="locked-note">
        <span class="lock-badge">🔒</span>
        Next location reveal is Bryana-only.
      </div>
    </section>
  `);
}

async function renderMission() {
  const guest = await getCurrentGuest();
  if (!guest) return renderGuestPicker();
  const missionText = guest.mission_text || 'Your personalised classified mission is being finalised.';

  shell(`
    ${screenHeader('YOUR MISSION', "You've been assigned ONE mission.")}
    <section class="content-stack">
      <div class="center-note">Complete it before the end of the night.</div>
      <div class="mission-card">
        <div class="mission-icon">👥</div>
        <div class="mission-copy">${esc(missionText)}</div>
      </div>
      <div class="upload-wrap">
        <label class="upload-label">UPLOAD PHOTO &amp; COMPLETE MISSION</label>
        <input id="missionFile" type="file" accept="image/*" />
        <button class="primary-button" id="missionUpload">Upload proof</button>
        <button class="ghost-link" data-go="home">Skip for now</button>
      </div>
    </section>
  `);

  document.getElementById('missionUpload').onclick = async () => {
    const file = document.getElementById('missionFile').files?.[0];
    if (!file) return toast('Choose a photo first');
    try {
      const compressed = await compress(file);
      const path = `mission/${guest.slug}-${Date.now()}.jpg`;
      const { error } = await supabase.storage.from('party-photos').upload(path, compressed, {
        contentType: compressed.type || 'image/jpeg',
      });
      if (error) throw error;
      await supabase.from('party_photos').insert({
        guest_slug: guest.slug,
        category: 'mission',
        storage_path: path,
        caption: 'Mission proof',
      });
      toast('Evidence received ✓');
    } catch (err) {
      toast(`Upload failed: ${err.message}`);
    }
  };
}

function challengeStatus(row, index) {
  const raw = (row.status || row.progress_status || '').toLowerCase();
  if (raw.includes('lock')) return { label: 'Locked', className: 'locked', icon: '🔒' };
  if (raw.includes('complete') || row.is_completed || row.completed_at) return { label: 'Completed', className: 'complete', icon: '✓' };
  return { label: index === 0 ? 'Completed' : 'In progress', className: index === 0 ? 'complete' : 'progress', icon: index === 0 ? '✓' : '•' };
}

async function renderOlympics() {
  const guest = await getCurrentGuest();
  const { data } = await supabase.from('olympics_progress').select('*').order('created_at');
  shell(`
    ${screenHeader('FREEDOM OLYMPICS', "Bryana's challenges")}
    <section class="content-stack">
      <div class="center-note">${guest?.is_main_character ? 'Your challenge board.' : "Watch Bryana's progress as she completes each challenge."}</div>
      <div class="challenge-list">
        ${(data && data.length) ? data.map((row, index) => {
          const status = challengeStatus(row, index);
          return `
            <div class="challenge-card ${status.className}">
              <div class="challenge-head">
                <div>
                  <div class="challenge-kicker">CHALLENGE ${index + 1}</div>
                  <div class="challenge-title">${esc(row.title || `Challenge ${index + 1}`)}</div>
                </div>
                <div class="challenge-mark">${status.icon}</div>
              </div>
              ${row.description ? `<div class="challenge-sub">${esc(row.description)}</div>` : ''}
              <div class="challenge-status ${status.className}">${status.label}</div>
            </div>
          `;
        }).join('') : infoCard('<div class="empty-state">Updated challenges coming next.</div>')}
      </div>
    </section>
  `);
}

async function renderQuizLanding() {
  const guest = await getCurrentGuest();
  if (!guest) return renderGuestPicker();

  const { data: existingAttempt } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('guest_slug', guest.slug)
    .maybeSingle();

  if (existingAttempt && !state.testMode) {
    return renderLeaderboard('Your score is already locked in.');
  }

  const canPreviewOnly = !guest.can_play_quiz;

  shell(`
    ${screenHeader('BRYANA FILES', 'How well do you know Bryana?')}
    <section class="content-stack">
      ${infoCard(`
        <div class="quiz-intro">
          <div class="timer-chip">⏱ Fastest + most correct wins</div>
          <p class="hand-copy">${state.testMode ? 'You are in Test Mode. Results will not be saved.' : (canPreviewOnly ? 'Organizer preview only. This version will not be saved.' : 'Ready? Your result locks once submitted.')}</p>
          <button class="primary-button" id="startQuiz">${state.testMode || canPreviewOnly ? 'Preview the quiz' : 'Start quiz'}</button>
          <button class="secondary-button" id="viewBoard">View leaderboard</button>
        </div>
      `)}
    </section>
  `);

  document.getElementById('startQuiz').onclick = () => startQuiz(state.testMode || canPreviewOnly);
  document.getElementById('viewBoard').onclick = () => renderLeaderboard();
}

async function startQuiz(preview = false) {
  const { data } = await supabase.from('quiz_questions').select('*').order('sort_order');
  state.questions = (data || []).map((q) => ({ ...q, shown: shuffle([...(q.options || [])]) }));
  state.answers = {};
  state.startedAt = Date.now();
  state.preview = !!preview;
  renderQuestion(0);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function quizElapsed() {
  if (!state.startedAt) return '00:00';
  const elapsed = Math.round((Date.now() - state.startedAt) / 1000);
  const mins = Math.floor(elapsed / 60);
  const secs = String(elapsed % 60).padStart(2, '0');
  return `${String(mins).padStart(2, '0')}:${secs}`;
}

function renderQuestion(index) {
  const q = state.questions[index];
  if (!q) return finishQuiz();

  shell(`
    ${screenHeader('BRYANA FILES', 'How well do you know Bryana?')}
    <section class="content-stack quiz-stack">
      <div class="timer-row">
        <div class="timer-box">⏱ <span>Time elapsed</span> <strong id="quizTimer">${quizElapsed()}</strong></div>
      </div>
      <div class="question-card">
        <div class="question-number">${index + 1}. ${esc(q.question)}</div>
        <div class="answers-list">
          ${q.shown.map((option) => `
            <button class="answer-option" data-opt="${esc(option)}">
              <span class="radio"></span>
              <span>${esc(option)}</span>
            </button>
          `).join('')}
        </div>
      </div>
      <button class="primary-button" id="nextQuestion" disabled>${index === state.questions.length - 1 ? 'Finish quiz' : 'Next question →'}</button>
    </section>
  `);

  const timer = document.getElementById('quizTimer');
  const timerInterval = setInterval(() => {
    if (timer) timer.textContent = quizElapsed();
  }, 1000);

  let selected = null;
  document.querySelectorAll('[data-opt]').forEach((btn) => {
    btn.onclick = () => {
      selected = btn.dataset.opt;
      document.querySelectorAll('[data-opt]').forEach((other) => other.classList.toggle('selected', other === btn));
      document.getElementById('nextQuestion').disabled = false;
    };
  });

  document.getElementById('nextQuestion').onclick = () => {
    clearInterval(timerInterval);
    state.answers[q.sort_order] = selected;
    renderQuestion(index + 1);
  };
}

async function finishQuiz() {
  const guest = await getCurrentGuest();
  let correct = 0;
  state.questions.forEach((q) => {
    if (state.answers[q.sort_order] === q.correct_answer) correct += 1;
  });
  const totalMs = Date.now() - state.startedAt;

  if (state.preview || state.testMode) {
    shell(`
      ${screenHeader('PREVIEW COMPLETE', 'Nothing was submitted.')}
      <section class="content-stack">
        ${infoCard(`
          <div class="result-big">${correct}/${state.questions.length}</div>
          <p class="hand-copy">This was a preview only. The live leaderboard was not affected.</p>
          <button class="primary-button" data-go="quiz">Back to quiz</button>
        `)}
      </section>
    `);
    return;
  }

  const { error } = await supabase.from('quiz_attempts').insert({
    guest_slug: guest.slug,
    correct_count: correct,
    total_ms: totalMs,
    answers: state.answers,
  });

  if (error && error.code !== '23505') {
    return toast('Could not save score');
  }

  renderLeaderboard(`Score locked: ${correct}/${state.questions.length}`);
}

async function renderLeaderboard(message = '') {
  const { data } = await supabase
    .from('quiz_attempts')
    .select('guest_slug,correct_count,total_ms,guests(name)')
    .order('correct_count', { ascending: false })
    .order('total_ms', { ascending: true });

  const rows = data || [];
  const top = rows.slice(0, 3);
  const rest = rows.slice(3);

  shell(`
    ${screenHeader('LEADERBOARD', 'Fastest, most correct, ultimate bragging rights.')}
    <section class="content-stack leaderboard-stack">
      ${message ? infoCard(`<strong>${esc(message)}</strong>`) : ''}
      ${top.length ? `
        <div class="podium-grid">
          ${top[1] ? `<div class="podium-card silver"><div class="medal">2</div><div class="podium-name">${esc(top[1].guests?.name || top[1].guest_slug)}</div><div class="podium-score">${top[1].correct_count}/20 • ${formatMs(top[1].total_ms)}</div></div>` : '<div></div>'}
          ${top[0] ? `<div class="podium-card gold winner"><div class="medal">1</div><div class="podium-name">${esc(top[0].guests?.name || top[0].guest_slug)}</div><div class="podium-score">${top[0].correct_count}/20 • ${formatMs(top[0].total_ms)}</div></div>` : ''}
          ${top[2] ? `<div class="podium-card bronze"><div class="medal">3</div><div class="podium-name">${esc(top[2].guests?.name || top[2].guest_slug)}</div><div class="podium-score">${top[2].correct_count}/20 • ${formatMs(top[2].total_ms)}</div></div>` : '<div></div>'}
        </div>
      ` : ''}
      <div class="leader-list">
        ${rest.length ? rest.map((row, idx) => `
          <div class="leader-row">
            <span>${idx + 4}. ${esc(row.guests?.name || row.guest_slug)}</span>
            <strong>${row.correct_count}/20 • ${formatMs(row.total_ms)}</strong>
          </div>
        `).join('') : infoCard('<div class="empty-state">No scores yet. Suspicious.</div>')}
      </div>
      <div class="center-note">Well done, legends!</div>
    </section>
  `);
}

function formatMs(ms) {
  const seconds = Math.round((ms || 0) / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${secs}`;
}

async function renderGallery() {
  const { data } = await supabase.from('party_photos').select('*').order('created_at', { ascending: false }).limit(60);
  const photos = (data || []).map((p) => ({
    ...p,
    url: supabase.storage.from('party-photos').getPublicUrl(p.storage_path).data.publicUrl,
  }));

  shell(`
    ${screenHeader('GALLERY', 'The shared camera roll')}
    <section class="content-stack">
      ${photos.length ? `<div class="gallery-grid">${photos.map((photo) => `
        <a class="gallery-item" href="${photo.url}" target="_blank" rel="noreferrer">
          <img src="${photo.url}" alt="Party upload" />
        </a>
      `).join('')}</div>` : infoCard('<div class="empty-state">No uploads yet. Go create the evidence.</div>')}
    </section>
  `);
}

async function renderRules() {
  const { data } = await supabase.from('regina_rules').select('*').order('sort_order');
  shell(`
    ${screenHeader("REGINA'S RULES", 'The laws of the land.')}
    <section class="content-stack">
      ${(data && data.length) ? data.map((rule, index) => infoCard(`
        <div class="rule-kicker">RULE ${index + 1}</div>
        <div class="rule-text">${esc(rule.rule_text)}</div>
      `)).join('') : infoCard('<div class="empty-state">Final rules are waiting for sign-off.</div>')}
    </section>
  `);
}

async function renderHits() {
  const { data } = await supabase.from('greatest_hits').select('*').eq('is_published', true).order('sort_order');
  const locked = Date.now() < new Date('2026-10-24T18:00:00+01:00').getTime();

  shell(`
    ${screenHeader("BRYANA'S GREATEST HITS", 'The Uncut Edition')}
    <section class="content-stack">
      ${locked ? infoCard(`
        <div class="stamp-lock">LOCKED</div>
        <div class="rule-text">Opens at 6pm on party day.</div>
      `) : ((data && data.length) ? data.map((hit) => infoCard(`
        <div class="rule-text">${esc(hit.title || 'Greatest Hit')}</div>
        <p class="story-copy">${esc(hit.story)}</p>
        ${hit.submitted_by ? `<div class="story-by">${esc(hit.submitted_by)}</div>` : ''}
      `)).join('') : infoCard('<div class="empty-state">Stories will appear here once added.</div>'))}
    </section>
  `);
}

async function compress(file) {
  try {
    const image = await createImageBitmap(file);
    const max = 1600;
    const scale = Math.min(1, max / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
    return await new Promise((resolve, reject) =>
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Image conversion failed'))), 'image/jpeg', 0.82)
    );
  } catch {
    return file;
  }
}

function bindActions() {
  document.querySelectorAll('[data-go]').forEach((el) => {
    el.onclick = () => route(el.dataset.go);
  });
}

async function route(name) {
  window.scrollTo(0, 0);
  const routes = {
    home: renderHome,
    pick: renderGuestPicker,
    itinerary: renderItinerary,
    mission: renderMission,
    olympics: renderOlympics,
    quiz: renderQuizLanding,
    gallery: renderGallery,
    rules: renderRules,
    hits: renderHits,
  };
  const fn = routes[name] || renderHome;
  return fn();
}

route(localStorage.getItem('party_guest') ? 'home' : 'pick');
