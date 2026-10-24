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
  itineraryPreviewTime: localStorage.getItem('party_itinerary_preview_time') || 'live',
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

function icon(name, extra = '') {
  const common = `class="doodle-icon ${extra}" viewBox="0 0 48 48" aria-hidden="true"`;
  const icons = {
    home: `<svg ${common}><path d="M7 23.5 24 8l17 15.5"/><path d="M11 21v19h10V29h6v11h10V21"/></svg>`,
    itinerary: `<svg ${common}><rect x="7" y="10" width="34" height="31" rx="5"/><path d="M15 6v9M33 6v9M7 19h34M15 25h5M27 25h5M15 32h5M27 32h5"/></svg>`,
    mission: `<svg ${common}><path d="M8 28c8-13 14-15 20-9 6-6 11-4 13 2-6 1-9 5-13 9-6 5-13 7-20-2Z"/><path d="M13 28c8 2 15 2 23-4"/></svg>`,
    olympics: `<svg ${common}><circle cx="13" cy="24" r="8"/><circle cx="24" cy="24" r="8"/><circle cx="35" cy="24" r="8"/><circle cx="18.5" cy="32" r="8"/><circle cx="29.5" cy="32" r="8"/></svg>`,
    quiz: `<svg ${common}><path d="M10 35 34 11l4 4-24 24-8 2 4-6Z"/><path d="m31 14 4 4"/></svg>`,
    gallery: `<svg ${common}><rect x="7" y="14" width="34" height="25" rx="4"/><path d="M15 14l3-5h12l3 5"/><circle cx="24" cy="26" r="7"/></svg>`,
    rules: `<svg ${common}><path d="m8 18 8 7 8-13 8 13 8-7-3 20H11Z"/><path d="M14 38h20"/></svg>`,
    hits: `<svg ${common}><path d="M24 5 29 18h14L32 26l4 14-12-8-12 8 4-14L5 18h14Z"/></svg>`,
    cake: `<svg ${common}><path d="M12 21h24v18H12Z"/><path d="M10 26c5 4 9-4 14 0s9-4 14 0"/><path d="M17 21v-7M24 21v-9M31 21v-7"/><path d="M15 12c0-3 2-5 2-5s2 2 2 5M22 10c0-3 2-5 2-5s2 2 2 5M29 12c0-3 2-5 2-5s2 2 2 5"/></svg>`,
    house: `<svg ${common}><path d="M6 24 24 8l18 16"/><path d="M11 22v18h26V22M20 40V29h8v11"/></svg>`,
    drinks: `<svg ${common}><path d="M8 9h13l-2 13c-1 5-9 5-10 0L8 9Z"/><path d="M14 27v10M10 37h8"/><path d="M27 11h13l-2 11c-1 5-9 5-10 0l-1-11Z"/><path d="M33 27v10M29 37h8"/></svg>`,
    food: `<svg ${common}><path d="M11 7v15M16 7v15M6 7v15M11 22v19M33 7v34M29 7c0 8 8 8 8 0"/></svg>`,
    lips: `<svg ${common}><path d="M6 25c8-12 14-13 18-6 5-7 12-6 18 6-9 10-26 10-36 0Z"/><path d="M9 25c10 2 20 2 30 0"/></svg>`,
    cocktail: `<svg ${common}><path d="M7 10h34L24 27Z"/><path d="M24 27v11M16 40h16"/><path d="m31 14 8-7"/></svg>`,
    cup: `<svg ${common}><path d="M14 16h20l-2 25H16Z"/><path d="M17 12h14M21 12V7h6v5"/><path d="m29 19 9-10"/></svg>`,
    globe: `<svg ${common}><circle cx="24" cy="24" r="17"/><path d="M7 24h34M24 7c7 7 7 27 0 34M24 7c-7 7-7 27 0 34M11 15h26M11 33h26"/></svg>`,
    lock: `<svg ${common}><rect x="11" y="20" width="26" height="21" rx="4"/><path d="M17 20v-6a7 7 0 0 1 14 0v6M24 28v6"/></svg>`,
    star: `<svg ${common}><path d="m24 5 5 13h14l-11 8 4 14-12-8-12 8 4-14-11-8h14Z"/></svg>`,
    crown: `<svg ${common}><path d="m7 18 9 7 8-15 8 15 9-7-4 20H11Z"/><path d="M12 38h24"/></svg>`,
    martini: `<svg ${common}><path d="M7 10h34L24 27Z"/><path d="M24 27v11M16 40h16"/><path d="m31 14 8-7"/></svg>`,
    camera: `<svg ${common}><rect x="7" y="15" width="34" height="24" rx="4"/><path d="M15 15l3-5h12l3 5"/><circle cx="24" cy="27" r="7"/></svg>`,
    heart: `<svg ${common}><path d="M24 40S7 30 7 18c0-7 9-10 17-1 8-9 17-6 17 1 0 12-17 22-17 22Z"/></svg>`,
    lightning: `<svg ${common}><path d="M26 5 11 27h11l-2 16 17-25H26Z"/></svg>`,
    sunglasses: `<svg ${common}><path d="M6 17h36M10 19c1 10 11 12 16 3M38 19c-1 10-11 12-16 3"/></svg>`,
    arrow: `<svg ${common}><path d="M8 24h30M29 14l10 10-10 10"/></svg>`,
  };
  return icons[name] || icons.star;
}

const guestIconMap = {
  amber: 'martini', bryana: 'crown', charlie: 'globe', dara: 'lightning', joe: 'star', jon: 'sunglasses',
  kelsey: 'martini', lorena: 'star', maddie: 'lightning', margaux: 'crown', marine: 'globe', natalia: 'heart',
  natalie: 'camera', penny: 'heart', rita: 'martini', stasa: 'star', steve: 'camera'
};

function scrapbookDecor() {
  return `
    <div class="scrap-decor scrap-top-left"></div>
    <div class="scrap-decor scrap-top-right"></div>
    <div class="scrap-decor scrap-bottom-left"></div>
    <div class="scribble scribble-1">♡</div>
    <div class="scribble scribble-2">☆</div>
    <div class="scribble scribble-3">♡</div>
    <div class="scribble scribble-4">✦</div>
  `;
}

function shell(inner, options = {}) {
  const { bodyClass = '', noFrame = false } = options;
  app.innerHTML = `
    <div class="site-wrap ${noFrame ? 'no-frame' : ''}">
      <div class="phone-shell ${bodyClass}">
        ${state.testMode ? '<div class="test-banner">TEST MODE · quiz scores will not be saved</div>' : ''}
        ${scrapbookDecor()}
        ${inner}
      </div>
    </div>
  `;
  bindActions();
}

function topChrome() {
  return '';
}

function doodles() {
  return `
    <span class="doodle heart heart-a">♡</span>
    <span class="doodle heart heart-b">♡</span>
    <span class="doodle star star-a">✦</span>
    <span class="doodle star star-b">✦</span>
    <span class="doodle squiggle squiggle-a">~</span>
    <span class="doodle mini-cross mini-cross-a">×</span>
    <span class="doodle paperclip paperclip-a">⌕</span>
  `;
}

function blockTitle(title, extraClass = '') {
  const words = String(title).toUpperCase().split(/\s+/);
  return `<div class="block-title ${extraClass}">${words.map((word) =>
    `<span class="block-word">${[...word].map((letter) => `<span class="letter-block">${esc(letter)}</span>`).join('')}</span>`
  ).join('')}</div>`;
}

function headerHome() {
  return `
    ${topChrome()}
    <section class="hero-panel">
      ${doodles()}
      <div class="date-kicker">SATURDAY 24 OCTOBER 2026</div>
      <div class="title-stack">
        <div class="bryana-note"><span>Bryana's</span></div>
        ${blockTitle('DIVORCE PARTY', 'hero-block-title')}
      </div>
      <div class="tagline hand-note">Food, drinks &amp; zero regrets ♡</div>
      <div class="black-strip">SATURDAY 24 OCTOBER 2026 <span>·</span> BLACK DRESS CODE</div>
    </section>
  `;
}

function screenHeader(title, subtitle = '') {
  return `
    ${topChrome()}
    <div class="screen-header">
      <button class="back-link" data-go="home">${icon('back')} Back</button>
      ${doodles()}
      <div class="screen-title-wrap">${blockTitle(title)}</div>
      ${subtitle ? `<div class="screen-subtitle hand-note">${subtitle}</div>` : ''}
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
        <div class="picker-divider"><span>CLASSIFIED GUEST LIST</span></div>
        <div class="picker-heading">${blockTitle('WHO ARE YOU?')}</div>
        <p class="picker-copy hand-note">Find your file. This phone will remember you.</p>
        <div class="guest-search-wrap"><span>⌕</span><input id="guestSearch" class="guest-search" type="search" placeholder="Search your name…" /></div>
        <button class="small-toggle" id="toggleTest">${state.testMode ? 'Disable' : 'Enable'} organizer test mode</button>
      `, 'intro-card guest-intro')}
      <div class="guest-list" id="guestList">
        ${(data || []).map((g, index) => `
          <button class="guest-card guest-card-${index % 4}" data-guest="${g.slug}">
            <span class="guest-icon">${icon(guestIconMap[g.slug] || 'star')}</span>
            <span class="guest-card-copy"><strong>${esc(g.name)}</strong><span class="guest-role">${esc(g.title || 'CLASSIFIED FILE')}</span></span>
            <span class="guest-arrow">${icon('arrow')}</span>
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
  const guestSearch = document.getElementById('guestSearch');
  guestSearch.oninput = () => {
    const q = guestSearch.value.trim().toLowerCase();
    document.querySelectorAll('[data-guest]').forEach((btn) => {
      btn.hidden = !btn.querySelector('.guest-card-copy strong')?.textContent.toLowerCase().includes(q);
    });
  };
  document.getElementById('toggleTest').onclick = () => {
    setTestMode(!state.testMode);
    renderGuestPicker();
  };
}

async function renderHome() {
  const guest = await getCurrentGuest();
  if (!guest) return renderGuestPicker();

  const { data: recentPhotos } = await supabase.from('party_photos')
    .select('storage_path, guest_slug, caption')
    .order('created_at', { ascending: false }).limit(5);
  const latestPhotos = (recentPhotos || []).map(photo => ({
    ...photo,
    url: supabase.storage.from('party-photos').getPublicUrl(photo.storage_path).data.publicUrl,
  }));

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

      <div class="home-mission-feature">
        <span class="home-mission-tape"></span>
        <div class="home-mission-kicker">YOUR MISSION FOR THE DAY</div>
        <div class="home-mission-text">${esc(guest.mission_text || 'Your classified mission is being finalised.')}</div>
        <button class="home-mission-action" data-go="mission">Open mission →</button>
      </div>

      <div class="menu-list">
        ${menuButton('home', 'Home', 'Main menu', 'home')}
        ${menuButton('itinerary', 'Itinerary', 'The plan (so far...)', 'itinerary')}
        ${menuButton('mission', 'Your Mission', 'One mission. No excuses.', 'mission')}
        ${menuButton('quiz', 'Bryana Files', 'Quiz & leaderboard', 'quiz')}
        ${menuButton('gallery', 'Gallery', 'Receipts or it didn’t happen', 'gallery')}
        ${menuButton('rules', "Regina's Rules", 'Obey or face consequences', 'rules')}
      </div>
      <section class="latest-receipts" aria-label="Latest party photos">
        <div class="latest-receipts-heading">LATEST RECEIPTS 📸</div>
        <p class="latest-receipts-subtitle">The five freshest pieces of evidence.</p>
        ${latestPhotos.length ? `<div class="latest-receipts-grid">${latestPhotos.map(photo => `
          <a href="${esc(photo.url)}" target="_blank" rel="noopener noreferrer" aria-label="View party photo">
            <img src="${esc(photo.url)}" alt="Latest party photo" loading="lazy" />
          </a>`).join('')}</div>` : '<p class="latest-receipts-empty">No receipts yet. Be the first to spill the tea.</p>'}
        <button class="latest-receipts-all" data-go="gallery">View full gallery →</button>
      </section>
    </section>
  `);

  document.getElementById('switchGuest').onclick = () => {
    localStorage.removeItem('party_guest');
    renderGuestPicker();
  };
}

function timelineIcon(title = '') {
  const t = String(title).toLowerCase();
  if (t.includes('brunch')) return icon('food');
  if (t.includes('little orange door')) return icon('lips');
  if (t.includes('simmons')) return icon('cocktail');
  if (t.includes('hq') || t.includes('house')) return icon('house');
  if (t.includes('sit with us') || t.includes('dinner') || t.includes('snack')) return icon('cup');
  if (t.includes('pop quiz') || t.includes('bryana files')) return icon('quiz');
  if (t.includes('cake')) return icon('cake');
  if (t.includes('archer')) return icon('globe');
  return icon('star');
}

function startTimeOnly(label = '') {
  return String(label).split(/[–—-]/)[0].trim();
}

async function renderItinerary() {
  const guest = await getCurrentGuest();
  const isBryana = guest?.slug === 'bryana';
  // Final party poster schedule, 24 October 2026.
  const rows = [
    { time: '12:15 PM', title: 'Letter drop-off', subtitle: 'Girls arrive early at No 32 The Old Town to hand Margaux their letters.' },
    { time: '12:30 PM', title: 'No 32 The Old Town', subtitle: "Bottomless brunch. Bryana's Freedom Olympics begin." },
    { time: '2:45 PM', title: 'The Little Orange Door', subtitle: 'Drinks, good vibes and missions.' },
    { time: '4:00 PM', title: 'Simmons Clapham (optional)', subtitle: "Download the app and spin their wheel for a free drink (if you're lucky)." },
    { time: '5:00 PM', title: 'Head to Plastics HQ', subtitle: "Maddie's house. Food, drinks, games and surprises." },
    { time: '6:00 PM', title: 'You CAN Sit With Us', subtitle: 'Themed dinner and snacks.' },
    { time: '6:30 PM', title: 'Pop Quiz Time, Losers', subtitle: 'The Bryana Files.' },
    { time: '7:00 PM', title: 'Evening people join', subtitle: "Come as you are — night's still young!" },
    { time: '8:30 PM', title: 'Leave for Archer Street', subtitle: isBryana ? 'The night continues. More surprises await!' : 'Surprise cake and a night out!' },
  ];
  const eveningOnly = ['joe', 'charlie', 'jon', 'steve'].includes(guest?.slug);
  const visibleRows = eveningOnly ? rows.filter(item => item.time === '7:00 PM' || item.time === '8:30 PM') : rows;
  if (eveningOnly) {
    const arrival = visibleRows.find(item => item.time === '7:00 PM');
    if (arrival) {
      arrival.title = 'Arrive at Plastics HQ';
      arrival.subtitle = "Maddie's house. Join the Plastics for drinks, games and the evening celebrations!";
    }
  }
  shell(`
    ${screenHeader('ITINERARY', 'Saturday 24 October 2026')}
    <section class="content-stack">
      <div class="timeline-card">
        ${visibleRows.map(item => `
          <div class="timeline-row">
            <div class="time-pill">${esc(item.time)}</div>
            <div class="timeline-copy">
              <div class="timeline-title">${esc(item.title)}</div>
              <div class="timeline-sub">${esc(item.subtitle)}</div>
            </div>
            <div class="timeline-right"><span class="itinerary-icon">${timelineIcon(item.title)}</span></div>
          </div>
        `).join('')}
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
      <div class="mission-instruction">Complete it before the end of the night.</div>
      <div class="mission-card">
        <div class="mission-icon">${icon('heart')}</div>
        <div class="mission-copy sans-copy">${esc(missionText)}</div>
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
  if (raw.includes('lock')) return { label: 'Locked', className: 'locked', icon: icon('lock') };
  if (raw.includes('complete') || row.is_completed || row.completed_at) return { label: 'Completed', className: 'complete', icon: '✓' };
  return { label: 'In progress', className: 'progress', icon: '•' };
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

  if (!guest.can_play_quiz) {
    return renderLeaderboard('Spectator mode: watch the chaos unfold. No quiz for you.');
  }

  const { data: existingAttempt } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('guest_slug', guest.slug)
    .maybeSingle();

  if (existingAttempt && !state.testMode) {
    return renderLeaderboard(`Your final score: ${existingAttempt.correct_count}/20 • ${formatMs(existingAttempt.total_ms)}. Your result is locked in.`);
  }

  const previewKey = `party_quiz_preview_${guest.slug}`;
  const savedPreview = state.testMode ? JSON.parse(sessionStorage.getItem(previewKey) || 'null') : null;
  if (savedPreview) {
    shell(`
      ${screenHeader('PREVIEW COMPLETE', 'Your quiz result is ready.')}
      <section class="content-stack">
        ${infoCard(`
          <div class="result-big">${savedPreview.correct}/${savedPreview.total}</div>
          <p class="plain-note">Time: ${formatMs(savedPreview.totalMs)}. Organizer test only — no score was saved to the leaderboard.</p>
          <button class="primary-button" id="previewLeaderboard">View leaderboard</button>
          <button class="secondary-button" data-go="home">Back to home</button>
        `)}
      </section>
    `);
    document.getElementById('previewLeaderboard').onclick = () => renderLeaderboard('Organizer preview complete. No score was saved.');
    return;
  }

  shell(`
    ${screenHeader('BRYANA FILES', 'How well do you know Bryana?')}
    <section class="content-stack">
      ${infoCard(`
        <div class="quiz-intro">
          <div class="timer-chip">${icon('quiz')}<span>Most correct + fastest wins</span></div>
          <p class="plain-note">${state.testMode ? 'You are in Test Mode. Results will not be saved.' : 'Ready? Your result locks once submitted.'}</p>
          <button class="primary-button" id="startQuiz">${state.testMode ? 'Preview the quiz' : 'Start quiz'}</button>
          <button class="secondary-button" id="viewBoard">View leaderboard</button>
        </div>
      `)}
    </section>
  `);

  document.getElementById('startQuiz').onclick = () => startQuiz(state.testMode);
  document.getElementById('viewBoard').onclick = () => renderLeaderboard();
}

async function startQuiz(preview = false) {
  const { data } = await supabase.from('quiz_questions').select('*').order('sort_order');
  state.questions = (data || []).map((q) => ({ ...q, shown: shuffle([...(q.options || [])]) }));
  if (!state.questions.length) { toast('Quiz questions are unavailable. Please try again.'); return; }
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
        <div class="timer-box"><span class="timer-clock">○</span><span>Time elapsed</span><strong id="quizTimer">${quizElapsed()}</strong></div>
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
    sessionStorage.setItem(`party_quiz_preview_${guest.slug}`, JSON.stringify({ correct, total: state.questions.length, totalMs }));
    shell(`
      ${screenHeader('PREVIEW COMPLETE', 'Nothing was submitted.')}
      <section class="content-stack">
        ${infoCard(`
          <div class="result-big">${correct}/${state.questions.length}</div>
          <p class="plain-note">This was a preview only. The live leaderboard was not affected.</p>
          <button class="primary-button" id="previewLeaderboard">View leaderboard</button>
          <button class="secondary-button" data-go="quiz">Back to quiz</button>
        `)}
      </section>
    `);
    document.getElementById('previewLeaderboard').onclick = () => renderLeaderboard('Organizer preview complete. No score was saved.');
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
          ${top[1] ? `<div class="podium-card silver"><div class="medal">2</div><div class="podium-name">${esc(top[1].guests?.name || top[1].guest_slug)}</div><div class="podium-score">${top[1].correct_count}/${state.questions.length || 20} • ${formatMs(top[1].total_ms)}</div></div>` : '<div></div>'}
          ${top[0] ? `<div class="podium-card gold winner"><div class="medal">1</div><div class="podium-name">${esc(top[0].guests?.name || top[0].guest_slug)}</div><div class="podium-score">${top[0].correct_count}/${state.questions.length || 20} • ${formatMs(top[0].total_ms)}</div></div>` : ''}
          ${top[2] ? `<div class="podium-card bronze"><div class="medal">3</div><div class="podium-name">${esc(top[2].guests?.name || top[2].guest_slug)}</div><div class="podium-score">${top[2].correct_count}/${state.questions.length || 20} • ${formatMs(top[2].total_ms)}</div></div>` : '<div></div>'}
        </div>
      ` : ''}
      <div class="leader-list">
        ${rest.length ? rest.map((row, idx) => `
          <div class="leader-row">
            <span>${idx + 4}. ${esc(row.guests?.name || row.guest_slug)}</span>
            <strong>${row.correct_count}/${state.questions.length || 20} • ${formatMs(row.total_ms)}</strong>
          </div>
        `).join('') : !top.length ? infoCard('<div class="empty-state">No scores yet. Be the first to make the Plastics leaderboard!</div>') : ''}
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
  const guest = await getCurrentGuest();
  if (!guest) return renderGuestPicker();
  const { data } = await supabase.from('party_photos').select('*').order('created_at', { ascending: false }).limit(60);
  const photos = (data || []).map((p) => ({
    ...p,
    url: supabase.storage.from('party-photos').getPublicUrl(p.storage_path).data.publicUrl,
  }));

  shell(`
    ${screenHeader('GALLERY', 'Receipts or it didn’t happen')}
    <section class="content-stack">
      <div class="gallery-upload-card">
        <div class="gallery-upload-title">ADD TO THE RECEIPTS</div>
        <input id="galleryFile" type="file" accept="image/*" />
        <input id="galleryCaption" class="caption-input" maxlength="80" placeholder="Caption (optional)" />
        <button class="primary-button" id="galleryUpload">Upload photo</button>
      </div>
      ${photos.length ? `<div class="gallery-grid">${photos.map((photo) => `
        <a class="gallery-item" href="${photo.url}" target="_blank" rel="noreferrer">
          <img src="${photo.url}" alt="Party upload" />
        </a>
      `).join('')}</div>` : infoCard('<div class="empty-state">No uploads yet. Go create the evidence.</div>')}
    </section>
  `);

  document.getElementById('galleryUpload').onclick = async () => {
    const file = document.getElementById('galleryFile').files?.[0];
    const caption = document.getElementById('galleryCaption').value.trim();
    if (!file) return toast('Choose a photo first');
    try {
      const compressed = await compress(file);
      const path = `gallery/${guest.slug}-${Date.now()}.jpg`;
      const { error } = await supabase.storage.from('party-photos').upload(path, compressed, {
        contentType: compressed.type || 'image/jpeg',
      });
      if (error) throw error;
      await supabase.from('party_photos').insert({
        guest_slug: guest.slug,
        category: 'gallery',
        storage_path: path,
        caption: caption || null,
      });
      toast('Receipt added ✓');
      renderGallery();
    } catch (err) {
      toast(`Upload failed: ${err.message}`);
    }
  };
}

async function renderRules() {
  const { data } = await supabase.from('reginas_rules').select('*').order('sort_order');
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
  };
  const fn = routes[name] || renderHome;
  return fn();
}

// Always start a fresh link visit on the guest-selection welcome screen.
// Guest choice is stored only in this browser, never shared with other devices.
route('pick');
