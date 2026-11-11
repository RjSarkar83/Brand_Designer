/* ArtViSiON · RJ Sarkar — Apple / macOS Minimal Freelancer Digital Card */
(function () {
  'use strict';

  const DATA = window.AV_DATA;
  if (!DATA) return;

  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) =>
    String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  /* ------------------------------------------------------------------------
     1. Toast Notification
     ------------------------------------------------------------------------ */
  let toastTimer = null;
  function showToast(msg) {
    const el = qs('#appleToast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2400);
  }

  /* ------------------------------------------------------------------------
     2. Dual-Experience Mode Controller (Apple Day 6AM–6PM ↔ Classic Night 6PM–6AM)
     ------------------------------------------------------------------------ */
  const htmlEl = document.documentElement;
  const themeBtn = qs('#themeToggleBtn');
  const nightSwitchBtn = qs('#classicModeSwitchBtn');
  const themeCssDay = qs('#themeCssDay');
  const themeCssNight = qs('#themeCssNight');
  const dayStage = qs('#dayStage');
  const nightStage = qs('#nightStage');

  let dayMuteAudioFn = null;
  let currentMode = null;

  function renderAllQRCodes(theme) {
    if (!window.AVQR) return;
    const isLight = theme === 'light';
    const svg = window.AVQR.renderQRSVG(DATA.profile.cardUrl, {
      dark: '#0A0A0D',
      finder: '#0A0A0D',
      finderCenter: isLight ? '#0071E3' : '#B8142A',
      bg: isLight ? '#FFFFFF' : '#F5F2EB'
    });
    const cardQrHost = qs('#cardQrHost');
    const qrSheetHost = qs('#qrSheetHost');
    if (cardQrHost) cardQrHost.innerHTML = svg;
    if (qrSheetHost) qrSheetHost.innerHTML = svg;
  }

  function getAutoMode() {
    const h = new Date().getHours();
    return h >= 6 && h < 18 ? 'day' : 'night';
  }

  function applyMode(nextMode, opts = {}) {
    const mode = nextMode === 'night' ? 'night' : 'day';
    const init = !!opts.init;
    const manual = !!opts.manual;
    const prevMode = currentMode;
    currentMode = mode;

    const visualTheme = mode === 'day' ? 'light' : 'dark';
    htmlEl.setAttribute('data-mode', mode);
    htmlEl.setAttribute('data-theme', visualTheme);
    htmlEl.style.colorScheme = visualTheme;

    if (themeCssDay) themeCssDay.disabled = mode !== 'day';
    if (themeCssNight) themeCssNight.disabled = mode !== 'night';
    if (dayStage) dayStage.hidden = mode !== 'day';
    if (nightStage) nightStage.hidden = mode !== 'night';

    const metaTheme = qs('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', mode === 'day' ? '#f2f2f7' : '#0a0a0c');

    if (mode === 'day') {
      qsa('.js-theme-logo').forEach((img) => {
        img.src = 'assets/portfolio-ad/logo.svg';
      });
      renderAllQRCodes('light');
      if (prevMode === 'night' && window.AVClassic) {
        window.AVClassic.leave();
      }
    } else {
      if (prevMode === 'day') {
        if (typeof closeAllSheets === 'function') closeAllSheets();
        if (typeof dayMuteAudioFn === 'function') dayMuteAudioFn();
      }
      if (window.AVClassic) {
        window.AVClassic.enter(!init);
      }
    }

    if (manual) {
      try { sessionStorage.setItem('av_manual_mode', mode); } catch (_) {}
    }
  }

  function getInitialMode() {
    const attr = htmlEl.getAttribute('data-mode');
    if (attr === 'day' || attr === 'night') return attr;
    try {
      const saved = sessionStorage.getItem('av_manual_mode');
      if (saved === 'day' || saved === 'night') return saved;
    } catch (_) {}
    return getAutoMode();
  }

  applyMode(getInitialMode(), { init: true });

  function toggleExperienceMode() {
    const next = currentMode === 'day' ? 'night' : 'day';
    applyMode(next, { manual: true });
    if (next === 'day') {
      showToast('Day Mode · Apple UI (6AM–6PM)');
    }
  }

  if (themeBtn) themeBtn.addEventListener('click', toggleExperienceMode);
  if (nightSwitchBtn) nightSwitchBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleExperienceMode(); });

  window.AVAppMode = {
    getMode: () => currentMode,
    setMode: (m) => applyMode(m, { manual: true }),
    toggle: toggleExperienceMode
  };

  setInterval(() => {
    try {
      if (sessionStorage.getItem('av_manual_mode')) return;
    } catch (_) {}
    const expected = getAutoMode();
    if (expected !== currentMode) applyMode(expected, { init: false });
  }, 60000);

  /* ------------------------------------------------------------------------
     3. Live Indore IST Clock Pill
     ------------------------------------------------------------------------ */
  const clockEl = qs('#menuClock');
  function updateClock() {
    if (!clockEl) return;
    try {
      const now = new Date();
      const fmt = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(now);
      clockEl.textContent = `Indore · ${fmt}`;
    } catch (_) {
      clockEl.textContent = 'Indore, IN';
    }
  }
  updateClock();
  setInterval(updateClock, 30000);

  /* ------------------------------------------------------------------------
     4. 3D Titanium Business Card (Tilt, Flip, QR, vCard, Share, Copy)
     ------------------------------------------------------------------------ */
  const cardPerspective = qs('#cardPerspective');
  const card3D = qs('#card3D');
  const cardGlare = qs('#cardGlare');
  let isFlipped = false;

  function flipCard(force) {
    isFlipped = typeof force === 'boolean' ? force : !isFlipped;
    if (card3D) card3D.classList.toggle('is-flipped', isFlipped);
  }

  qsa('[data-flip-card]').forEach((btn) => btn.addEventListener('click', () => flipCard()));
  const stripFlipBtn = qs('#stripFlipBtn');
  if (stripFlipBtn) stripFlipBtn.addEventListener('click', () => flipCard());
  const dockCardBtn = qs('#dockCardBtn');
  if (dockCardBtn) {
    dockCardBtn.addEventListener('click', () => {
      closeAllSheets();
      flipCard(false);
    });
  }

  if (cardPerspective && window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    cardPerspective.addEventListener('mousemove', (e) => {
      const rect = cardPerspective.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotY = (x - 0.5) * 13;
      const rotX = (0.5 - y) * 11;
      cardPerspective.style.transform = `perspective(1400px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
      if (cardGlare) {
        cardGlare.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        cardGlare.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      }
    });
    cardPerspective.addEventListener('mouseleave', () => {
      cardPerspective.style.transform = 'perspective(1400px) rotateX(0deg) rotateY(0deg)';
    });
  }

  const qrEnlargeBtn = qs('#qrEnlargeBtn');
  if (qrEnlargeBtn) qrEnlargeBtn.addEventListener('click', () => openSheet('qrSheet'));

  // vCard Download
  function downloadVCard() {
    const p = DATA.profile;
    const vcf = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'FN:Ranjan (RJ) Sarkar',
      'N:Sarkar;Ranjan;;;',
      'ORG:ArtViSiON: PRODUCTiON DESiGN',
      'TITLE:Creative Lead & Production Designer',
      `TEL;TYPE=CELL,VOICE:${p.phone}`,
      `EMAIL;TYPE=WORK:${p.email}`,
      `URL:${p.cardUrl}`,
      `ADR;TYPE=WORK:;;Near Govt. High School, Bicholi Mardana;Indore;Madhya Pradesh;452016;India`,
      `NOTE:${p.tagline} | Brand Identity, ACP Signage, Packaging & CNC DXF`,
      'END:VCARD'
    ].join('\r\n');

    const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'RJ_Sarkar_ArtViSiON.vcf';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (a.parentNode) a.parentNode.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1500);
    showToast('Saved RJ_Sarkar_ArtViSiON.vcf');
  }

  ['#cardSaveVcardBtn', '#stripVcardBtn', '#qrDownloadVcfBtn'].forEach((id) => {
    const el = qs(id);
    if (el) el.addEventListener('click', downloadVCard);
  });

  async function copyTextSafe(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (_) {}
    }
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      if (typeof ta.setSelectionRange === 'function') ta.setSelectionRange(0, text.length);
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return !!ok;
    } catch (_) {
      return false;
    }
  }

  // Share Card
  async function shareCard() {
    const shareData = {
      title: 'RJ Sarkar · ArtViSiON — Digital Brand Card',
      text: 'Save RJ Sarkar’s contact card or explore ArtViSiON design work.',
      url: DATA.profile.cardUrl
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err && err.name === 'AbortError') return;
      }
    }
    const copied = await copyTextSafe(DATA.profile.cardUrl);
    if (copied) showToast('Card URL copied to clipboard');
    else openSheet('qrSheet');
  }
  const cardShareBtn = qs('#cardShareBtn');
  if (cardShareBtn) cardShareBtn.addEventListener('click', shareCard);

  const qrCopyBtn = qs('#qrCopyBtn');
  if (qrCopyBtn) {
    qrCopyBtn.addEventListener('click', async () => {
      const copied = await copyTextSafe(DATA.profile.cardUrl);
      showToast(copied ? 'Copied ' + DATA.profile.cardUrl : DATA.profile.cardUrl);
    });
  }

  qsa('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const val = btn.dataset.copy;
      const copied = await copyTextSafe(val);
      showToast(copied ? 'Copied: ' + val : val);
    });
  });

  /* ------------------------------------------------------------------------
     5. macOS Windows / Sheets Manager + Focus Trap
     ------------------------------------------------------------------------ */
  let activeSheet = null;
  let lastTrigger = null;

  function openSheet(id) {
    lastTrigger = document.activeElement;
    closeAllSheets(true);
    const el = qs('#' + id);
    if (!el) return;
    if (id === 'workSheet') renderWorkGallery();
    activeSheet = el;
    el.hidden = false;
    const focusEl = el.querySelector('input, button:not(.tl-dot), a');
    if (focusEl) setTimeout(() => focusEl.focus(), 40);
  }

  function closeAllSheets(skipFocus) {
    qsa('.mac-backdrop').forEach((b) => {
      b.hidden = true;
    });
    activeSheet = null;
    if (!skipFocus && lastTrigger && typeof lastTrigger.focus === 'function') {
      lastTrigger.focus();
      lastTrigger = null;
    }
  }

  qsa('[data-open-sheet]').forEach((el) => {
    el.addEventListener('click', () => openSheet(el.dataset.openSheet));
  });
  qsa('[data-close-sheet]').forEach((el) => el.addEventListener('click', () => closeAllSheets()));
  qsa('.mac-backdrop').forEach((backdrop) => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeAllSheets();
    });
  });

  /* ------------------------------------------------------------------------
     6. Selected Work Window (Finder Gallery + Inline Spec Detail)
     ------------------------------------------------------------------------ */
  const workFilterBar = qs('#workFilterBar');
  const workGalleryGrid = qs('#workGalleryGrid');
  const workDetailView = qs('#workDetailView');
  let workFilter = 'all';

  function renderWorkGallery() {
    if (!workGalleryGrid || !workDetailView) return;
    workDetailView.hidden = true;
    workGalleryGrid.hidden = false;

    const list =
      workFilter === 'all' ? DATA.projects : DATA.projects.filter((p) => p.category === workFilter);
    workGalleryGrid.classList.toggle('is-all-five', workFilter === 'all' && list.length === 5);

    workGalleryGrid.innerHTML = list
      .map(
        (p) => `
        <article class="mac-work-card" data-proj="${p.id}" tabindex="0" role="button">
          <div class="mac-work-thumb ${p.isVectorPlate ? 'is-vec' : ''}">
            <img src="${p.image}" alt="${p.title}" loading="lazy" decoding="async">
          </div>
          <div class="mac-work-info">
            <div class="mac-work-meta">${p.num} · ${p.pillar}</div>
            <h3>${p.title}</h3>
            <p>${p.subtitle}</p>
          </div>
        </article>`
      )
      .join('');

    qsa('.mac-work-card', workGalleryGrid).forEach((card) => {
      const openDetail = () => renderWorkDetail(card.dataset.proj);
      card.addEventListener('click', openDetail);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openDetail();
        }
      });
    });
  }

  function renderWorkDetail(id) {
    const p = DATA.projects.find((item) => item.id === id);
    if (!p || !workDetailView || !workGalleryGrid) return;
    workGalleryGrid.hidden = true;
    workDetailView.hidden = false;

    let showingVec = Boolean(p.isVectorPlate);

    function paint() {
      workDetailView.innerHTML = `
        <div class="work-detail-topbar">
          <button type="button" class="card-pill-btn" id="workBackBtn">← All Projects</button>
          ${
            p.vectorAsset && !p.isVectorPlate
              ? `<button type="button" class="card-pill-btn" id="workToggleVecBtn">${showingVec ? 'Show Studio Plate' : 'Show Original Vector'}</button>`
              : ''
          }
        </div>
        <div class="work-detail-grid">
          <div class="detail-frame ${showingVec ? 'is-vec' : ''}">
            <img src="${showingVec ? p.vectorAsset : p.image}" alt="${p.title}">
          </div>
          <div class="detail-copy">
            <div class="mac-work-meta">${p.num} · ${p.pillar} · ${p.year}</div>
            <h3>${p.title}</h3>
            <p><strong>Challenge:</strong> ${p.challenge}</p>
            <p><strong>Solution:</strong> ${p.solution}</p>
            <ul class="detail-list">
              ${p.deliverables.map((d) => `<li>${d}</li>`).join('')}
            </ul>
            <button type="button" class="apple-btn-primary w-full" id="workHireSimilarBtn">Commission Similar Scope →</button>
          </div>
        </div>
      `;

      const backBtn = qs('#workBackBtn', workDetailView);
      if (backBtn) backBtn.addEventListener('click', renderWorkGallery);

      const vecBtn = qs('#workToggleVecBtn', workDetailView);
      if (vecBtn) {
        vecBtn.addEventListener('click', () => {
          showingVec = !showingVec;
          paint();
        });
      }

      const hireBtn = qs('#workHireSimilarBtn', workDetailView);
      if (hireBtn) {
        hireBtn.addEventListener('click', () => {
          const notes = qs('#briefNotes');
          if (notes) notes.value = `Interested in scope similar to: ${p.title}`;
          openSheet('briefSheet');
        });
      }
    }
    paint();
  }

  if (workFilterBar) {
    workFilterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.seg-btn');
      if (!btn) return;
      workFilter = btn.dataset.filter;
      qsa('.seg-btn', workFilterBar).forEach((b) => b.classList.toggle('is-active', b === btn));
      renderWorkGallery();
    });
  }
  renderWorkGallery();

  /* ------------------------------------------------------------------------
     7. A–Z Services & 5 Pillars Split Settings Window
     ------------------------------------------------------------------------ */
  const settingsSidebar = qs('#settingsSidebar');
  const settingsPane = qs('#settingsPane');
  const azSearchInput = qs('#azSearchInput');
  let activeSettingsTab = 'atoz';
  let azSearchQuery = '';

  const settingsTabs = [
    { id: 'atoz', label: 'A–Z Services', count: '26' },
    { id: 'pillars', label: '5 Core Pillars', count: '5' },
    { id: 'process', label: 'Process & Stack', count: '4 + 6' },
    { id: 'career', label: 'Career & Brands', count: '12+ Yrs' }
  ];

  function renderSettingsWindow() {
    if (!settingsSidebar || !settingsPane) return;

    settingsSidebar.innerHTML = settingsTabs
      .map(
        (t) => `
        <button type="button" class="sidebar-item ${t.id === activeSettingsTab ? 'is-active' : ''}" data-tab="${t.id}">
          <span>${t.label}</span>
          <small style="opacity:.7">${t.count}</small>
        </button>`
      )
      .join('');

    if (activeSettingsTab === 'atoz') {
      const q = azSearchQuery.toLowerCase();
      const filtered = DATA.azIndex.filter(
        (x) => !q || x.l.toLowerCase().includes(q) || x.t.toLowerCase().includes(q) || x.d.toLowerCase().includes(q)
      );
      settingsPane.innerHTML = `
        <div class="az-mac-grid">
          ${filtered
            .map(
              (x) => `
              <div class="az-mac-card">
                <div class="az-mac-head">
                  <span class="az-mac-letter">${x.l}</span>
                  <span class="az-mac-pillar">${x.pName}</span>
                </div>
                <strong>${x.t}</strong>
                <p>${x.d}</p>
              </div>`
            )
            .join('')}
        </div>`;
    } else if (activeSettingsTab === 'pillars') {
      settingsPane.innerHTML = `
        <div style="display:grid; gap:12px;">
          ${DATA.pillars
            .map(
              (p) => `
              <div class="az-mac-card">
                <div class="az-mac-head">
                  <span class="az-mac-letter">${p.index} · ${p.name}</span>
                  <span class="az-mac-pillar">${p.letters}</span>
                </div>
                <strong>${p.headline}</strong>
                <p>${p.description}</p>
                <p style="margin-top:4px;opacity:.85"><b>Key Scope:</b> ${p.deliverables.join(' · ')}</p>
              </div>`
            )
            .join('')}
        </div>`;
    } else if (activeSettingsTab === 'process') {
      settingsPane.innerHTML = `
        <div style="display:grid; gap:14px;">
          <div class="az-mac-grid">
            ${DATA.pipeline
              .map(
                (st) => `
                <div class="az-mac-card">
                  <span class="az-mac-pillar">STEP ${st.step}</span>
                  <strong>${st.title}</strong>
                  <p>${st.detail}</p>
                </div>`
              )
              .join('')}
          </div>
          <div class="az-mac-grid">
            ${DATA.tools
              .map(
                (tl) => `
                <div class="az-mac-card">
                  <div class="az-mac-head">
                    <span class="az-mac-pillar">STUDIO STACK</span>
                    <span class="az-mac-pillar">${tl.level}%</span>
                  </div>
                  <strong>${tl.name}</strong>
                  <p>${tl.role}</p>
                </div>`
              )
              .join('')}
          </div>
        </div>`;
    } else if (activeSettingsTab === 'career') {
      settingsPane.innerHTML = `
        <div style="display:grid; gap:14px;">
          <div style="display:grid; gap:10px;">
            ${DATA.career
              .map(
                (c) => `
                <div class="az-mac-card">
                  <div class="az-mac-head">
                    <span class="az-mac-letter" style="font-size:.82rem;">${c.period}</span>
                    <span class="az-mac-pillar">${c.company}</span>
                  </div>
                  <strong>${c.role}</strong>
                  <p>${c.summary}</p>
                </div>`
              )
              .join('')}
          </div>
          <p style="font-size:.74rem;color:var(--text-secondary);margin:2px 0 -4px;">Selected Retail &amp; National Brand Collaborations:</p>
          <div class="az-mac-grid">
            ${DATA.brands
              .map(
                (b) => `
                <div class="az-mac-card">
                  <span class="az-mac-pillar">${b.sector}</span>
                  <strong>${b.name}</strong>
                </div>`
              )
              .join('')}
          </div>
        </div>`;
    }
  }

  if (settingsSidebar) {
    settingsSidebar.addEventListener('click', (e) => {
      const btn = e.target.closest('.sidebar-item');
      if (!btn) return;
      activeSettingsTab = btn.dataset.tab;
      renderSettingsWindow();
    });
  }
  if (azSearchInput) {
    azSearchInput.addEventListener('input', (e) => {
      azSearchQuery = e.target.value;
      activeSettingsTab = 'atoz';
      renderSettingsWindow();
    });
  }
  renderSettingsWindow();

  /* ------------------------------------------------------------------------
     8. Launchpad Apps Grid (9 Unique Studio Tools & Portals — Zero Overlap)
     ------------------------------------------------------------------------ */
  const launchpadGrid = qs('#launchpadGrid');
  if (launchpadGrid) {
    launchpadGrid.innerHTML = DATA.ecosystem
      .map(
        (app) => `
        <a href="${app.url}" target="_blank" rel="noopener" class="lp-app-tile">
          <span class="lp-app-code">${app.code} · ${app.tag}</span>
          <strong>${app.title} ↗</strong>
          <span>${app.desc}</span>
        </a>`
      )
      .join('');
  }

  /* ------------------------------------------------------------------------
     9. Apple Project Brief Sheet
     ------------------------------------------------------------------------ */
  const scopeChips = qs('#briefScopeChips');
  const timelineSeg = qs('#briefTimelineSeg');

  if (scopeChips) {
    scopeChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.apple-chip');
      if (chip) chip.classList.toggle('is-selected');
    });
  }
  if (timelineSeg) {
    timelineSeg.addEventListener('click', (e) => {
      const btn = e.target.closest('.seg-btn');
      if (!btn) return;
      qsa('.seg-btn', timelineSeg).forEach((b) => b.classList.toggle('is-active', b === btn));
    });
  }

  function gatherBrief() {
    return {
      scopes: qsa('.apple-chip.is-selected', scopeChips).map((c) => c.dataset.scope),
      tl: qs('.seg-btn.is-active', timelineSeg)?.dataset.time || '7–14 Days',
      name: qs('#briefName')?.value.trim() || '',
      phone: qs('#briefPhone')?.value.trim() || '',
      email: qs('#briefEmail')?.value.trim() || '',
      city: qs('#briefCity')?.value.trim() || '',
      notes: qs('#briefNotes')?.value.trim() || ''
    };
  }

  function validateBrief(b, needPhone) {
    const nEl = qs('#briefName');
    const pEl = qs('#briefPhone');
    nEl?.classList.remove('is-invalid');
    pEl?.classList.remove('is-invalid');
    if (!b.name) {
      nEl?.classList.add('is-invalid');
      nEl?.focus();
      showToast('Please enter your Name');
      return false;
    }
    if (needPhone && b.phone.replace(/\D/g, '').length < 7) {
      pEl?.classList.add('is-invalid');
      pEl?.focus();
      showToast('Please enter a valid Phone / WhatsApp number');
      return false;
    }
    return true;
  }

  function trackBriefDispatch(channel, b) {
    const endpoint = DATA.config && DATA.config.analyticsEndpoint;
    if (!endpoint || !navigator.sendBeacon) return;
    try {
      navigator.sendBeacon(
        endpoint,
        JSON.stringify({ event: 'brief_submit', channel, scopes: b.scopes, tl: b.tl, city: b.city })
      );
    } catch (_) {}
  }

  const sendWaBriefBtn = qs('#sendWaBriefBtn');
  const briefForm = qs('#briefForm');
  if (briefForm) {
    briefForm.addEventListener('submit', (e) => {
      e.preventDefault();
      sendWaBriefBtn?.click();
    });
  }
  if (sendWaBriefBtn) {
    sendWaBriefBtn.addEventListener('click', () => {
      const b = gatherBrief();
      if (!validateBrief(b, true)) return;
      trackBriefDispatch('whatsapp', b);
      const msg = [
        `*ArtViSiON Brief — RJ Sarkar*`,
        `Name: ${b.name}`,
        `Contact: ${b.phone}`,
        b.email ? `Email: ${b.email}` : '',
        b.city ? `City: ${b.city}` : '',
        b.scopes.length ? `Scope: ${b.scopes.join(', ')}` : '',
        `Timeline: ${b.tl}`,
        b.notes ? `Notes: ${b.notes}` : ''
      ]
        .filter(Boolean)
        .join('\n');
      window.open(`${DATA.profile.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
      closeAllSheets();
      showToast('Opening WhatsApp brief');
    });
  }

  const sendEmailBriefBtn = qs('#sendEmailBriefBtn');
  if (sendEmailBriefBtn) {
    sendEmailBriefBtn.addEventListener('click', () => {
      const b = gatherBrief();
      if (!validateBrief(b, false)) return;
      trackBriefDispatch('email', b);
      const subj = `Project Brief from ${b.name} — ArtViSiON`;
      const body = `Hi RJ,\n\nName: ${b.name}\nPhone: ${b.phone}\nCity: ${b.city}\nScope: ${b.scopes.join(', ') || 'Design Inquiry'}\nTimeline: ${b.tl}\n\nNotes:\n${b.notes}`;
      window.location.href = `mailto:${DATA.profile.email}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
      closeAllSheets();
    });
  }

  /* ------------------------------------------------------------------------
     10. macOS Spotlight Search (K / Cmd+K)
     ------------------------------------------------------------------------ */
  const spotlightInput = qs('#spotlightInput');
  const spotlightResults = qs('#spotlightResults');

  const spotlightIndex = [
    ...DATA.projects.map((p) => ({ cat: `Selected Work · ${p.pillar}`, title: p.title, desc: p.subtitle, action: 'workSheet' })),
    ...DATA.azIndex.map((a) => ({ cat: `A–Z · ${a.pName}`, title: `${a.l} — ${a.t}`, desc: a.d, action: 'servicesSheet' })),
    ...DATA.ecosystem.map((e) => ({ cat: 'App Launchpad', title: e.title, desc: e.desc, url: e.url })),
    ...DATA.conciergeQA.map((q) => ({ cat: 'Studio FAQ', title: q.q, desc: q.a, action: 'briefSheet' }))
  ];

  function renderSpotlight(query) {
    if (!spotlightResults) return;
    const q = (query || '').trim().toLowerCase();
    const matches = q
      ? spotlightIndex.filter(
          (i) =>
            i.title.toLowerCase().includes(q) ||
            i.desc.toLowerCase().includes(q) ||
            i.cat.toLowerCase().includes(q)
        ).slice(0, 8)
      : spotlightIndex.slice(0, 5);

    if (!matches.length) {
      spotlightResults.innerHTML = `<div class="spot-item"><span class="spot-title">No exact match for "${esc(query)}"</span><span class="spot-desc">Try searching: DXF, ACP, CNC, Indore, Packaging, or Startup.</span></div>`;
      return;
    }

    spotlightResults.innerHTML = matches
      .map((m, idx) =>
        m.url
          ? `<a href="${esc(m.url)}" target="_blank" rel="noopener" class="spot-item"><span class="spot-cat">${esc(m.cat)}</span><span class="spot-title">${esc(m.title)} ↗</span><span class="spot-desc">${esc(m.desc)}</span></a>`
          : `<button type="button" class="spot-item" data-spot-idx="${idx}" data-spot-action="${esc(m.action)}"><span class="spot-cat">${esc(m.cat)}</span><span class="spot-title">${esc(m.title)}</span><span class="spot-desc">${esc(m.desc)}</span></button>`
      )
      .join('');

    qsa('[data-spot-action]', spotlightResults).forEach((btn) => {
      btn.addEventListener('click', () => openSheet(btn.dataset.spotAction));
    });
  }

  if (spotlightInput) {
    spotlightInput.addEventListener('input', (e) => renderSpotlight(e.target.value));
  }
  renderSpotlight('');

  /* ------------------------------------------------------------------------
     11. Keyboard Shortcuts & Modal Focus Trap (F, Q, K / Cmd+K, B, T, Esc, Tab)
     ------------------------------------------------------------------------ */
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      if (currentMode !== 'day') return;
      e.preventDefault();
      openSheet('spotlightSheet');
      return;
    }

    if (e.key === 'Escape' && activeSheet) {
      closeAllSheets();
      return;
    }

    if (e.key === 'Tab' && activeSheet) {
      const focusables = qsa(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        activeSheet
      ).filter((el) => el.offsetParent !== null);
      if (focusables.length) {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
      return;
    }

    const tag = (document.activeElement && document.activeElement.tagName) || '';
    const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    if (typing || e.metaKey || e.ctrlKey || e.altKey) return;

    const k = e.key.toLowerCase();
    if (k === 't') {
      toggleExperienceMode();
      return;
    }
    if (currentMode !== 'day') return;
    if (k === 'f') flipCard();
    else if (k === 'q') openSheet('qrSheet');
    else if (k === 'k') openSheet('spotlightSheet');
    else if (k === 'b') openSheet('briefSheet');
  });

  /* ------------------------------------------------------------------------
     12. macOS Control Center Audio Toggle (Navras Remix + Ambient Fallback)
     ------------------------------------------------------------------------ */
  const audioBtn = qs('#dayAudioToggle');
  if (audioBtn) {
    const SC_URL =
      'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/rj-sarkar/navras-drum-and-bass-remix&color=%230a84ff&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false&loop=true';
    let scFrame = null;
    let scPlaying = false;
    let ambientCtx = null;
    let ambientMaster = null;
    let isAudioOn = false;

    function sendSC(method, value) {
      if (!scFrame || !scFrame.contentWindow) return;
      try {
        scFrame.contentWindow.postMessage(JSON.stringify({ method, value }), '*');
      } catch (_) {}
    }

    function startAmbientFallback() {
      if (scPlaying || ambientCtx) return;
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        ambientCtx = new AC();
        ambientMaster = ambientCtx.createGain();
        ambientMaster.gain.setValueAtTime(0.0001, ambientCtx.currentTime);
        ambientMaster.gain.exponentialRampToValueAtTime(0.035, ambientCtx.currentTime + 1.6);
        ambientMaster.connect(ambientCtx.destination);
        [146.83, 220.0, 293.66].forEach((freq) => {
          const osc = ambientCtx.createOscillator();
          osc.type = 'sine';
          osc.frequency.value = freq;
          osc.connect(ambientMaster);
          osc.start();
        });
      } catch (_) {}
    }

    function stopAmbient() {
      if (!ambientCtx) return;
      try {
        ambientCtx.close();
      } catch (_) {}
      ambientCtx = null;
      ambientMaster = null;
    }

    function setDayAudioState(on, silent) {
      isAudioOn = !!on;
      audioBtn.setAttribute('aria-pressed', String(isAudioOn));
      audioBtn.title = isAudioOn
        ? 'Music: Playing · Click to mute'
        : 'Music: Off · Click to play Navras Remix';

      if (isAudioOn) {
        if (!scFrame) {
          scFrame = document.createElement('iframe');
          scFrame.id = 'daySoundCloudFrame';
          scFrame.allow = 'autoplay';
          scFrame.src = SC_URL;
          scFrame.title = 'ArtViSiON Background Audio';
          scFrame.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;bottom:-10px;left:-10px;';
          (dayStage || document.body).appendChild(scFrame);
          [900, 2000].forEach((ms) =>
            setTimeout(() => {
              if (!isAudioOn) return;
              sendSC('play', '');
              sendSC('setVolume', 15);
            }, ms)
          );
          setTimeout(() => {
            if (isAudioOn && !scPlaying) startAmbientFallback();
          }, 2600);
        } else {
          sendSC('play', '');
          sendSC('setVolume', 15);
          if (!scPlaying) startAmbientFallback();
        }
        if (!silent) showToast('Audio: On · Navras Mix');
      } else {
        sendSC('pause', '');
        stopAmbient();
        if (!silent) showToast('Audio: Muted');
      }
    }

    dayMuteAudioFn = () => {
      if (isAudioOn) setDayAudioState(false, true);
    };

    window.addEventListener('message', (ev) => {
      if (currentMode !== 'day') return;
      try {
        const d = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
        const m = String((d && (d.method || d.type)) || '').toLowerCase();
        if (m.includes('play') || (d && d.type === 'playProgressUpdate')) {
          scPlaying = true;
          stopAmbient();
        }
      } catch (_) {}
    });

    audioBtn.addEventListener('click', () => setDayAudioState(!isAudioOn, false));
  }
})();
