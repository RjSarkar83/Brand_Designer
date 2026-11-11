/* ArtViSiON · Night Mode Engine (Original Classic Brand_Designer Experience) */
(function () {
  'use strict';

  let initialized = false;
  let active = false;

  const nightStage = () => document.getElementById('nightStage');

  /* ------------------------------------------------------------------
     1. Custom Quantum Cursor (active in Night Mode desktop only)
     ------------------------------------------------------------------ */
  let cursorEl = null;
  function setupCursor() {
    const finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!finePointer || cursorEl) return;
    cursorEl = document.createElement('div');
    cursorEl.className = 'quantum-cursor';
    cursorEl.id = 'cursor';
    const host = nightStage() || document.body;
    host.appendChild(cursorEl);
    let cx = 0, cy = 0, raf = 0;
    document.addEventListener('pointermove', (e) => {
      if (!active || !cursorEl) return;
      if (e.pointerType === 'touch') { cursorEl.style.opacity = '0'; return; }
      cursorEl.style.opacity = '';
      cx = e.clientX; cy = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (cursorEl) {
          cursorEl.style.left = cx + 'px';
          cursorEl.style.top = cy + 'px';
        }
      });
    }, { passive: true });
    document.addEventListener('pointerdown', (e) => {
      if (cursorEl && e.pointerType === 'touch') cursorEl.style.opacity = '0';
    }, { passive: true });
  }

  /* ------------------------------------------------------------------
     2. Crimson Matrix Rain (pauseable between Day & Night modes)
     ------------------------------------------------------------------ */
  let matrixRaf = 0;
  let matrixSetupDone = false;
  let matrixDrawFn = null;
  function startMatrixRain() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (navigator.connection && navigator.connection.saveData) return;
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!matrixSetupDone) {
      matrixSetupDone = true;
      let rzT = null;
      const SMALL_DEV = (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) || (navigator.hardwareConcurrency || 8) <= 4;
      const SCALE = SMALL_DEV ? 0.6 : 0.85;
      const chars = "रंजन सरकार DESIGN विज़ुअल ART ABC abc 123";
      const fontSize = SMALL_DEV ? 22 : 18;
      let columns = 1;
      let drops = [1];

      function resizeCanvas() {
        const w = Math.max(2, Math.floor(window.innerWidth * SCALE));
        const h = Math.max(2, Math.floor(window.innerHeight * SCALE));
        if (canvas.width === w && canvas.height === h) return;
        canvas.width = w;
        canvas.height = h;
        columns = Math.max(1, Math.floor(canvas.width / fontSize));
        drops = Array(columns).fill(1);
      }
      resizeCanvas();
      window.addEventListener('resize', () => {
        clearTimeout(rzT);
        rzT = setTimeout(resizeCanvas, 180);
      }, { passive: true });

      const FRAME_MS = SMALL_DEV ? 1000 / 12 : 1000 / 18;
      let lastDraw = 0;
      let paused = false;
      document.addEventListener('visibilitychange', () => {
        paused = document.hidden;
        lastDraw = 0;
      });

      matrixDrawFn = function draw(now) {
        if (!active) { matrixRaf = 0; return; }
        matrixRaf = requestAnimationFrame(draw);
        if (paused) return;
        if (now - lastDraw < FRAME_MS) return;
        lastDraw = now;

        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = fontSize + "px monospace";
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ff4444";
        for (let i = 0; i < drops.length; i++) {
          const text = chars.charAt((Math.random() * chars.length) | 0);
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);
          if (drops[i] * fontSize > canvas.height && Math.random() > 0.965) drops[i] = 0;
          drops[i] += 0.9;
        }
      };
    }

    if (!matrixRaf && matrixDrawFn) {
      matrixRaf = requestAnimationFrame(matrixDrawFn);
    }
  }
  function stopMatrixRain() {
    if (matrixRaf) {
      cancelAnimationFrame(matrixRaf);
      matrixRaf = 0;
    }
  }

  /* ------------------------------------------------------------------
     3. Headline Scroll & Floating Services Chips
     ------------------------------------------------------------------ */
  let headlineRaf = 0;
  let headlineStepFn = null;
  let headlineSetupDone = false;
  function startHeadlineScroll() {
    const scrollContainer = document.querySelector('#nightStage .screen-scroll-text .scrolling-text-inner');
    if (!scrollContainer) return;
    const reduceMotionMq = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!headlineSetupDone) {
      headlineSetupDone = true;
      const headline = "• • • • • • • • • • • ➤ 🏁 🙏🏻 नमस्ते | Welcome to 🤝 ∞ ArtViSiON: PRODUCTiōn̄ - DESiGN • • • • • • ➤ 360° End-to-End Production Design & A-to-Z Branding Solutions • • • • • • ➤ • ArtWORKing • Branding • Creative • Designing • Execution • Fabrication • Graphic Design • Hoarding • Installation • Job Production • Kiosk • Logo • Mockup • Neon • Outdoor • Packaging • Quality Control • Recce • Signage • Typography • User Experience • Visiting Card • Window Display • X-Perience Design • Yard • Zonal Branding • • • • • • ➤ 💾 I Personally Develop 🖨️ CMYK Print Files, ✂️ CNC/Laser-Ready Cutting Files, 📐 Fabrication Drawings, 🗄️ 2D Layouts & Production Artwork 🎨 in CorelDRAW (JPG, PNG, PDF, EPS, SVG, TIFF, DXF), Along with 📦 3D Mockup Visualization, 🖌️ Design Adaptations for Adobe Photoshop and 📽️ Client Approval Presentations in PowerPoint & 📊 Microsoft Excel, with 🗂️ maintenance-required data and 🤖 AI learning tools, ✨ many more • • • • • • ➤ ➤ Advertising & Branding Specialist / Production Solutions by Ranjan (Rj) Sarkar.";
      scrollContainer.textContent = headline + "   " + headline;
      let pos = 0;
      const SPEED = 78;
      let textWidth = 0;
      let lastT = 0;
      function measure() { textWidth = scrollContainer.offsetWidth / 2; }
      window.addEventListener('resize', measure, { passive: true });
      scrollContainer.style.willChange = "transform";
      scrollContainer.style.backfaceVisibility = "hidden";
      measure();

      headlineStepFn = function step(now) {
        if (!active) { headlineRaf = 0; return; }
        if (!lastT) lastT = now;
        let dt = (now - lastT) / 1000;
        lastT = now;
        if (dt > 0.05) dt = 0.05;
        if (!textWidth) measure();
        if (textWidth > 0) {
          pos -= SPEED * dt;
          if (-pos >= textWidth) pos += textWidth;
          scrollContainer.style.transform = 'translate3d(' + pos.toFixed(2) + 'px,0,0)';
        }
        headlineRaf = requestAnimationFrame(headlineStepFn);
      };
    }

    if (!reduceMotionMq && !headlineRaf && headlineStepFn) {
      headlineRaf = requestAnimationFrame(headlineStepFn);
    }
  }
  function stopHeadlineScroll() {
    if (headlineRaf) {
      cancelAnimationFrame(headlineRaf);
      headlineRaf = 0;
    }
  }

  let servicesInterval = 0;
  function startServicesBg() {
    const bg = document.getElementById('servicesBg');
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!bg || prefersReducedMotion || servicesInterval) return;

    const shortServices = [
      "Recce", "Site Survey", "Measurement", "Brand Strategy", "Brand Identity", "Logo Design", "Logo Redesign", "Rebranding", "Brand Refresh", "Corporate Identity", "Visual Identity", "Personal Branding", "Startup Branding", "Brand Guidelines", "Graphic Design", "Creative Design", "Art Direction", "Creative Direction", "Visual Communication", "Communication Design", "Advertising Design", "Campaign Design", "Print Design", "Publication Design", "Brochure Design", "Catalogue Design", "Flyer Design", "Poster Design", "Leaflet Design", "Pamphlet Design", "Company Profile Design", "Presentation Design", "Pitch Deck Design", "Infographic Design", "Annual Report Design", "Newsletter Design", "Marketing Collateral", "Sales Collateral", "Retail Branding", "Store Branding", "Showroom Branding", "Shop Branding", "Dealer Branding", "Channel Branding", "Retail Communication", "In-Store Branding", "Retail Graphics", "Visual Merchandising", "VM Design", "Product Display Design", "Window Display Design", "Display Unit Design", "Display Graphics", "POSM Design", "POP Design", "Standee Design", "Dangler Design", "Wobbler Design", "Shelf Branding", "Counter Branding", "Kiosk Branding", "Retail Asset Design", "Signage Design", "Facade Signage", "Glow Sign Design", "ACP Signage", "LED Signage", "Wayfinding Design", "Directional Signage", "Safety Signage", "Informational Signage", "Architectural Branding", "Environmental Graphics", "Building Branding", "Cladding Design", "Wall Graphics", "Glass Branding", "Office Branding", "Corporate Branding", "Hospital Branding", "School Branding", "College Branding", "Campus Branding", "Industrial Branding", "Production Design", "Production Artwork", "Artwork Adaptation", "Artwork Finalization", "Print Production", "Prepress Design", "Print Ready Files", "Large Format Artwork", "Offset Printing Artwork", "Digital Printing Artwork", "Fabrication Drawings", "Shop Drawings", "Technical Drawings", "Execution Drawings", "Installation Drawings", "2D Layouts", "Production Layouts", "CNC Files", "Laser Cutting Files", "Router Cutting Files", "DXF Files", "Machine Ready Files", "Vector Artwork", "Vector Tracing", "Vector Illustration", "Line Art", "Icon Design", "Pattern Design", "Packaging Design", "Label Design", "Box Design", "Packaging Artwork", "Product Packaging", "Mockup Design", "3D Mockups", "3D Visualization", "Concept Visualization", "Brand Visualization", "Retail Visualization", "Signage Visualization", "Showroom Visualization", "Adaptation Design", "Photo Manipulation", "Image Editing", "Background Removal", "Photo Retouching", "Color Correction", "Social Media Design", "Facebook Creatives", "Instagram Creatives", "LinkedIn Creatives", "Banner Design", "Web Graphics", "Website Assets", "Landing Page Graphics", "Digital Creatives", "Emailer Design", "Outdoor Advertising", "Billboard Design", "Hoarding Design", "Pole Kiosk Design", "Transit Branding", "Vehicle Branding", "Bus Branding", "Auto Branding", "Wall Painting Design", "Mural Graphics", "Exhibition Design", "Event Branding", "Stall Design", "Booth Graphics", "Trade Show Graphics", "Corporate Event Graphics", "Brand Rollout", "Brand Implementation", "Multi-Location Branding", "Vendor Coordination", "Printer Coordination", "Fabricator Coordination", "Installation Support", "Site Execution", "Quality Control", "Project Coordination", "Creative Consulting", "Brand Consulting", "Production Consulting", "Design Audit", "Brand Audit", "Communication Audit", "Marketing Design", "Trade Marketing", "BTL Design", "ATL Design", "Product Communication", "Corporate Communication", "Marketing Communication", "Store Launch Branding", "Retail Launch Campaigns", "Branch Branding", "Dealer Board Design", "Pylon Sign Design", "Totem Design", "Canopy Design", "Sunboard Design", "Acrylic Letter Design", "Metal Letter Design", "Neon Sign Design", "Frosted Film Graphics", "One Way Vision Graphics", "Vinyl Graphics", "Canvas Artwork", "Wall Art Design", "Spiritual Art Design", "Minimal Vector Art", "CNC Art Panels", "Laser Cut Patterns", "Decorative Panels", "Architectural Artworks"
    ];
    const longServices = [
      "BRAND STRATEGY & IDENTITY.", "GRAPHIC DESIGN.", "ADVERTISING DESIGN.", "RETAIL BRANDING.", "VISUAL MERCHANDISING.", "SIGNAGE & WAYFINDING.", "ARCHITECTURAL BRANDING.", "PRODUCTION DESIGN.", "CNC & FABRICATION.", "PRINT & PREPRESS.", "PACKAGING DESIGN.", "VECTOR ARTWORK.", "DIGITAL DESIGN.", "VISUALIZATION.", "EXECUTION & PROJECT MANAGEMENT.", "INDUSTRY SPECIALIZATION."
    ];
    const CHILL = (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) || (navigator.hardwareConcurrency || 8) <= 4;

    function spawnChip() {
      if (!active || document.hidden) return;
      if (bg.childElementCount >= (CHILL ? 4 : 9)) return;
      const isLong = Math.random() < 0.22;
      const pool = isLong ? longServices : shortServices;
      const text = pool[Math.floor(Math.random() * pool.length)];
      const chip = document.createElement('div');
      chip.className = 'service-chip' + (isLong ? ' long' : '');
      chip.textContent = text;
      chip.style.left = (Math.random() * 78 + 4) + 'vw';
      const duration = 14 + Math.random() * 8;
      chip.style.setProperty('--drift', Math.round(Math.random() * 60 - 30) + 'px');
      chip.style.animationDuration = duration + 's';
      bg.appendChild(chip);
      setTimeout(() => chip.remove(), duration * 1000 + 300);
    }

    const startCount = CHILL ? 1 : 3;
    const everyMs = CHILL ? 5200 : 2200;
    for (let i = 0; i < startCount; i++) setTimeout(spawnChip, i * 1100);
    servicesInterval = setInterval(spawnChip, everyMs);
  }
  function stopServicesBg() {
    if (servicesInterval) {
      clearInterval(servicesInterval);
      servicesInterval = 0;
    }
    const bg = document.getElementById('servicesBg');
    if (bg) bg.innerHTML = '';
  }

  /* ------------------------------------------------------------------
     4. Original Synthesizers (Forest, Coin, Rain, WaterDrip, MusicBed, IndianTrance)
     ------------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    /* FOREST AMBIENCE - soft nature bed for the intro animation.   */
    /* Synthesized live (breeze + brook + birds) so it works fully  */
    /* offline and plays at a LOW, refreshing level only until the  */
    /* intro finishes, building curiosity before the music starts.  */
    /* ------------------------------------------------------------ */
    const Forest = (function () {
      let ctx = null;
      let master = null;
      let windGain = null, streamGain = null, birdGain = null;
      let running = false;
      let birdTimer = null;
      let muted = false;
      const MASTER = 0.10; // softer intro ambience

      function ensure() {
        if (ctx) return ctx;
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = muted ? 0 : MASTER;
        master.connect(ctx.destination);

        // ---- breeze: lowpassed noise with a slow swell ----
        const windBuf = makeNoise(3);
        const wind = ctx.createBufferSource();
        wind.buffer = windBuf; wind.loop = true;
        const windLP = ctx.createBiquadFilter();
        windLP.type = 'lowpass'; windLP.frequency.value = 680; windLP.Q.value = 0.7;
        const windMod = ctx.createGain();
        windMod.gain.value = 0.30;
        windGain = ctx.createGain();
        windGain.gain.value = 0;
        wind.connect(windLP); windLP.connect(windMod); windMod.connect(windGain); windGain.connect(master);
        wind.start();
        const windLfo = ctx.createOscillator();
        windLfo.frequency.value = 0.13;
        const windLfoAmt = ctx.createGain();
        windLfoAmt.gain.value = 0.13;
        windLfo.connect(windLfoAmt); windLfoAmt.connect(windMod.gain);
        windLfo.start();

        // ---- brook / stream: bandpassed noise with a water ripple ----
        const streamBuf = makeNoise(2);
        const stream = ctx.createBufferSource();
        stream.buffer = streamBuf; stream.loop = true;
        const streamBP = ctx.createBiquadFilter();
        streamBP.type = 'bandpass'; streamBP.frequency.value = 1400; streamBP.Q.value = 1.5;
        const streamMod = ctx.createGain();
        streamMod.gain.value = 0.20;
        streamGain = ctx.createGain();
        streamGain.gain.value = 0;
        stream.connect(streamBP); streamBP.connect(streamMod); streamMod.connect(streamGain); streamGain.connect(master);
        stream.start();
        const rip = ctx.createOscillator();
        rip.frequency.value = 1.6;
        const ripAmt = ctx.createGain();
        ripAmt.gain.value = 0.11;
        rip.connect(ripAmt); ripAmt.connect(streamMod.gain);
        rip.start();

        // ---- birds ----
        birdGain = ctx.createGain();
        birdGain.gain.value = 0;
        birdGain.connect(master);

        return ctx;
      }

      function makeNoise(seconds) {
        const len = Math.floor(ctx.sampleRate * seconds);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        return buf;
      }

      function chirp(when) {
        const base = 2200 + Math.random() * 1900;
        const reps = 2 + Math.floor(Math.random() * 3);
        for (let r = 0; r < reps; r++) {
          const t = when + r * 0.17;
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(base, t);
          osc.frequency.exponentialRampToValueAtTime(base * 1.45, t + 0.05);
          osc.frequency.exponentialRampToValueAtTime(base * 0.92, t + 0.09);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(0.5, t + 0.015);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
          osc.connect(g); g.connect(birdGain);
          osc.start(t); osc.stop(t + 0.12);
        }
      }

      function scheduleBirds() {
        const now = ctx.currentTime;
        let t = now + 0.8 + Math.random() * 1.4;
        const n = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < n; i++) {
          chirp(t);
          t += 1.0 + Math.random() * 2.4;
        }
        birdTimer = setTimeout(scheduleBirds, 4300);
      }

      function start() {
        ensure();
        if (!ctx) return;
        if (ctx.state === 'suspended') ctx.resume();
        if (running) return;
        running = true;
        const now = ctx.currentTime;
        windGain.gain.cancelScheduledValues(now);
        windGain.gain.setValueAtTime(0.0001, now);
        windGain.gain.linearRampToValueAtTime(1.2, now + 1.6);
        streamGain.gain.cancelScheduledValues(now);
        streamGain.gain.setValueAtTime(0.0001, now);
        streamGain.gain.linearRampToValueAtTime(1.1, now + 1.8);
        birdGain.gain.cancelScheduledValues(now);
        birdGain.gain.setValueAtTime(0.0001, now);
        birdGain.gain.linearRampToValueAtTime(1.15, now + 1.2);
        scheduleBirds();
      }

      function stop() {
        if (!running || !ctx) return;
        running = false;
        if (birdTimer) { clearTimeout(birdTimer); birdTimer = null; }
        const now = ctx.currentTime;
        windGain.gain.cancelScheduledValues(now);
        windGain.gain.setValueAtTime(windGain.gain.value, now);
        windGain.gain.linearRampToValueAtTime(0.0001, now + 0.7);
        streamGain.gain.cancelScheduledValues(now);
        streamGain.gain.setValueAtTime(streamGain.gain.value, now);
        streamGain.gain.linearRampToValueAtTime(0.0001, now + 0.7);
        birdGain.gain.cancelScheduledValues(now);
        birdGain.gain.setValueAtTime(birdGain.gain.value, now);
        birdGain.gain.linearRampToValueAtTime(0.0001, now + 0.5);
      }

      function setMuted(m) {
        muted = !!m;
        if (master) master.gain.value = muted ? 0 : MASTER;
      }

      return { start: start, stop: stop, setMuted: setMuted, ensure: ensure };
    })();

    /* ------------------------------------------------------------ */
    /* COIN RING - every click/tap now rings like a struck coin,    */
    /* with a bright metallic "ting" and a "gunj" (echo/resonance)  */
    /* tail. Synthesized, fully offline: a strike transient +       */
    /* inharmonic metal partials fed through a short feedback echo. */
    /* ------------------------------------------------------------ */
    const Coin = (function () {
      let ctx = null;
      let master = null;
      let last = 0;
      const VOLUME = 0.20;  // pro-mix: crisp UI click, tamed
      const MIN_GAP_MS = 75;

      // ---- SA RE GA MA PA DHA NI SA ----
      // Every tap rings the NEXT note of the sargam (Sa = C5, a bright bell
      // register so it still sounds like a coin), ascending and looping:
      // tap 1 = Sa, tap 2 = Re, tap 3 = Ga ... tap 8 = Sa (high), then again.
      const SARGAM = [
        523.25, // Sa
        587.33, // Re
        659.25, // Ga
        698.46, // Ma
        783.99, // Pa
        880.00, // Dha
        987.77, // Ni
        1046.50 // Sa (upper)
      ];
      let sargamIdx = 0;

      function ensure() {
        if (ctx) return ctx;
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = muted ? 0 : VOLUME;
        master.connect(ctx.destination);

        // "gunj" bus: short feedback echo so every coin resonances a few times
        const echo = ctx.createDelay(0.6);
        echo.delayTime.value = 0.15;
        const echoFb = ctx.createGain();
        echoFb.gain.value = 0.30;
        const echoWet = ctx.createGain();
        echoWet.gain.value = 0.5;
        master.connect(echo);
        echo.connect(echoFb); echoFb.connect(echo);
        echo.connect(echoWet); echoWet.connect(ctx.destination);
        return ctx;
      }

      function ring() {
        const c = ensure();
        if (!c) return;
        if (c.state === 'suspended') c.resume();
        const t0 = c.currentTime + 0.001;

        // ---- 1) strike transient: the metallic "tick" of the hit ----
        const nLen = Math.floor(c.sampleRate * 0.045);
        const nBuf = c.createBuffer(1, nLen, c.sampleRate);
        const nd = nBuf.getChannelData(0);
        for (let i = 0; i < nLen; i++) nd[i] = (Math.random() * 2 - 1) * (1 - i / nLen);
        const noise = c.createBufferSource();
        noise.buffer = nBuf;
        const hp = c.createBiquadFilter();
        hp.type = 'highpass'; hp.frequency.value = 3600; hp.Q.value = 0.7;
        const ng = c.createGain();
        ng.gain.setValueAtTime(0.0001, t0);
        ng.gain.exponentialRampToValueAtTime(0.6, t0 + 0.005);
        ng.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.05);
        noise.connect(hp); hp.connect(ng); ng.connect(master);
        noise.start(t0); noise.stop(t0 + 0.07);

        // ---- 2) the ring: inharmonic metal partials, fast attack ----
        // pitch = current sargam note, then advance to the next one (sa->re->ga...)
        const f0 = SARGAM[sargamIdx];
        sargamIdx = (sargamIdx + 1) % SARGAM.length;
        const partials = [
          { ratio: 1.000, amp: 0.50, decay: 0.65 },
          { ratio: 2.756, amp: 0.28, decay: 0.45 },
          { ratio: 5.404, amp: 0.12, decay: 0.30 },
          { ratio: 8.933, amp: 0.05, decay: 0.22 }
        ];
        for (let i = 0; i < partials.length; i++) {
          const p = partials[i];
          const osc = c.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f0 * p.ratio, t0);
          const og = c.createGain();
          og.gain.setValueAtTime(0.0001, t0);
          og.gain.exponentialRampToValueAtTime(p.amp, t0 + 0.004);
          og.gain.exponentialRampToValueAtTime(0.0001, t0 + p.decay);
          osc.connect(og); og.connect(master);
          osc.start(t0); osc.stop(t0 + p.decay + 0.06);
        }
      }

      let muted = false;
      function setMuted(m) {
        muted = !!m;
        if (master) master.gain.value = muted ? 0 : VOLUME;
      }
      function play() {
        if (muted) return;
        const now = Date.now();
        if (now - last < MIN_GAP_MS) return;
        last = now;
        try { ring(); } catch (e) { /* audio unavailable - stay silent */ }
      }

      return { play: play, ensure: ensure, setMuted: setMuted };
    })();

    /* ------------------------------------------------------------ */
    /* RAIN AMBIENCE - soft "barish" pattering that matches the     */
    /* matrix-rain backdrop. Synthesized live (filtered-noise hiss  */
    /* + random droplet plips) so it works fully offline.           */
    /* ------------------------------------------------------------ */
    const Rain = (function () {
      let ctx = null;
      let master = null;
      let running = false;
      let dropTimer = null;
      let muted = false;
      const MASTER = 0.08; // softer intro rain bed

      function ensure() {
        if (ctx) return ctx;
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = muted ? 0 : MASTER;
        master.connect(ctx.destination);

        // ---- the steady hiss of falling rain: noise shaped with filters ----
        const len = Math.floor(ctx.sampleRate * 4);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        const rainSrc = ctx.createBufferSource();
        rainSrc.buffer = buf; rainSrc.loop = true;

        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass'; hp.frequency.value = 480; hp.Q.value = 0.55;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 5600; lp.Q.value = 0.45;
        const hiss = ctx.createGain();
        hiss.gain.value = 0.42;

        rainSrc.connect(hp); hp.connect(lp); lp.connect(hiss); hiss.connect(master);
        rainSrc.start();

        // gentle surge so the rain "breathes" like gusts, not a static hiss
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.21;
        const lfoAmt = ctx.createGain();
        lfoAmt.gain.value = 0.16;
        lfo.connect(lfoAmt); lfoAmt.connect(hiss.gain);
        lfo.start();

        return ctx;
      }

      // one droplet: falling-pitch "plip" + a tiny splash of filtered noise
      function plip(when) {
        const t0 = when;
        const f0 = 1500 + Math.random() * 1700;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f0, t0);
        osc.frequency.exponentialRampToValueAtTime(420 + Math.random() * 380, t0 + 0.085);
        const og = ctx.createGain();
        const amp = 0.05 + Math.random() * 0.09;
        og.gain.setValueAtTime(0.0001, t0);
        og.gain.exponentialRampToValueAtTime(amp, t0 + 0.012);
        og.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16);
        osc.connect(og); og.connect(master);
        osc.start(t0); osc.stop(t0 + 0.2);

        const nLen = Math.floor(ctx.sampleRate * 0.05);
        const nBuf = ctx.createBuffer(1, nLen, ctx.sampleRate);
        const nd = nBuf.getChannelData(0);
        for (let i = 0; i < nLen; i++) nd[i] = (Math.random() * 2 - 1) * (1 - i / nLen);
        const noise = ctx.createBufferSource();
        noise.buffer = nBuf;
        const nf = ctx.createBiquadFilter();
        nf.type = 'bandpass';
        nf.frequency.value = 2800 + Math.random() * 2600;
        nf.Q.value = 1.5;
        const ng = ctx.createGain();
        ng.gain.setValueAtTime(0.0001, t0 + 0.004);
        ng.gain.exponentialRampToValueAtTime(amp * 0.5, t0 + 0.014);
        ng.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.075);
        noise.connect(nf); nf.connect(ng); ng.connect(master);
        noise.start(t0); noise.stop(t0 + 0.09);
      }

      function scheduleDrops() {
        if (!running || !ctx) return;
        const now = ctx.currentTime;
        let t = now + 0.06 + Math.random() * 0.22;
        const n = 1 + Math.floor(Math.random() * 4);
        for (let i = 0; i < n; i++) {
          plip(t);
          t += 0.16 + Math.random() * 0.38;
        }
        dropTimer = setTimeout(scheduleDrops, 420 + Math.random() * 700);
      }

      function start() {
        ensure();
        if (!ctx) return;
        if (ctx.state === 'suspended') ctx.resume();
        if (running) return;
        running = true;
        const now = ctx.currentTime;
        if (master) {
          master.gain.cancelScheduledValues(now);
          master.gain.setValueAtTime(muted ? 0 : 0.0001, now);
          master.gain.linearRampToValueAtTime(muted ? 0 : MASTER, now + 1.1);
        }
        scheduleDrops();
      }

      // smooth fade-out (~0.8s) so the rain leaves gently when the intro ends
      function stop() {
        if (!ctx) return;
        running = false;
        if (dropTimer) { clearTimeout(dropTimer); dropTimer = null; }
        const now = ctx.currentTime;
        master.gain.cancelScheduledValues(now);
        master.gain.setValueAtTime(master.gain.value, now);
        master.gain.linearRampToValueAtTime(0.0001, now + 0.8);
      }

      // the mute toggle only matters while the intro is playing; once stopped,
      // the rain stays silent no matter what the toggle does later.
      function setMuted(m) {
        muted = !!m;
        if (!running || !ctx || !master) return;
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.value = muted ? 0 : MASTER;
      }

      return { start: start, stop: stop, setMuted: setMuted, ensure: ensure };
    })();

    /* ------------------------------------------------------------ */
    /* WATER DRIP ("tapak") - a short droplet plip that drips in    */
    /* sync with the intro design-icons popping in under the logo.  */
    /* Synthesized, offline: falling-pitch plip + tiny splash.      */
    /* ------------------------------------------------------------ */
    const WaterDrip = (function () {
      let ctx = null;
      let master = null;
      let muted = false;
      const VOLUME = 0.07; // softer intro drip accents

      function ensure() {
        if (ctx) return ctx;
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = muted ? 0 : VOLUME;
        master.connect(ctx.destination);
        return ctx;
      }

      function drip() {
        const c = ensure();
        if (!c) return;
        if (c.state === 'suspended') c.resume();
        const t0 = c.currentTime + 0.001;
        const f0 = 1250 + Math.random() * 450;   // each drip has its own pitch

        // the "plip": fast falling pitch like a droplet hitting water
        const osc = c.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f0, t0);
        osc.frequency.exponentialRampToValueAtTime(360, t0 + 0.09);
        const og = c.createGain();
        og.gain.setValueAtTime(0.0001, t0);
        og.gain.exponentialRampToValueAtTime(0.75, t0 + 0.012);
        og.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);
        osc.connect(og); og.connect(master);
        osc.start(t0); osc.stop(t0 + 0.26);

        // tiny splash hiss on impact
        const nLen = Math.floor(c.sampleRate * 0.05);
        const nBuf = c.createBuffer(1, nLen, c.sampleRate);
        const nd = nBuf.getChannelData(0);
        for (let i = 0; i < nLen; i++) nd[i] = (Math.random() * 2 - 1) * (1 - i / nLen);
        const noise = c.createBufferSource();
        noise.buffer = nBuf;
        const nf = c.createBiquadFilter();
        nf.type = 'bandpass';
        nf.frequency.value = 2500;
        nf.Q.value = 1.3;
        const ng = c.createGain();
        ng.gain.setValueAtTime(0.0001, t0 + 0.008);
        ng.gain.exponentialRampToValueAtTime(0.13, t0 + 0.02);
        ng.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.09);
        noise.connect(nf); nf.connect(ng); ng.connect(master);
        noise.start(t0); noise.stop(t0 + 0.11);
      }

      function setMuted(m) {
        muted = !!m;
        if (master) master.gain.value = muted ? 0 : VOLUME;
      }

      function play() {
        if (muted) return;
        try { drip(); } catch (e) { /* audio unavailable - stay silent */ }
      }

      return { play: play, ensure: ensure, setMuted: setMuted };
    })();

    /* ------------------------------------------------------------ */
    /* MUSIC BED FALLBACK - a synthesized drum & bass flavoured     */
    /* ambient loop that GUARANTEES background music always plays,  */
    /* even if SoundCloud is blocked / offline / slow. WebAudio,    */
    /* fully offline. Kick + snare + hats + bass + pad chords.      */
    /* ------------------------------------------------------------ */
    const MusicBed = (function () {
      let ctx = null;
      let master = null;
      let running = false;
      let muted = false;
      let timer = null;
      let nextTime = 0;
      let step = 0;
      const BPM = 132;             // MATCHES IndianTrance so the two synth layers lock together
      const SPB = 60 / BPM;        // seconds per beat
      const STEP = SPB / 4;        // 16th-note steps
      const VOLUME = 0.03;        // extra-soft background mix

      // moody progression: A minor -> F -> C -> G (roots in Hz)
      const CHORDS = [
        { root: 110.00, minor: true  }, // A
        { root: 87.31,  minor: false }, // F
        { root: 130.81, minor: false }, // C
        { root: 98.00,  minor: false }  // G
      ];
      const BASS = [110.00, 110.00, 87.31, 98.00]; // one root per beat

      function ensure() {
        if (ctx) return ctx;
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = muted ? 0 : VOLUME;
        // compressor glues the mix: keeps kick/snare punchy while taming the
        // dense layers so no instrument buries the others (kills the clutter).
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -20;
        comp.knee.value = 18;
        comp.ratio.value = 8;
        comp.attack.value = 0.003;
        comp.release.value = 0.22;
        master.connect(comp);
        comp.connect(ctx.destination);
        return ctx;
      }

      function kick(t) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(46, t + 0.12);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.75, t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
        osc.connect(g); g.connect(master);
        osc.start(t); osc.stop(t + 0.42);
      }

      function hat(t, open) {
        const len = Math.floor(ctx.sampleRate * (open ? 0.12 : 0.035));
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass'; hp.frequency.value = 7500;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(open ? 0.10 : 0.07, t + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, t + (open ? 0.12 : 0.04));
        src.connect(hp); hp.connect(g); g.connect(master);
        src.start(t); src.stop(t + (open ? 0.14 : 0.05));
      }

      function snare(t) {
        const len = Math.floor(ctx.sampleRate * 0.14);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass'; bp.frequency.value = 1900; bp.Q.value = 0.8;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.16, t + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
        src.connect(bp); bp.connect(g); g.connect(master);
        src.start(t); src.stop(t + 0.18);
      }

      function bassNote(t, f) {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, t);
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 240; lp.Q.value = 8;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.20, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + SPB * 0.92);
        osc.connect(lp); lp.connect(g); g.connect(master);
        osc.start(t); osc.stop(t + SPB * 0.95);
      }

      function padChord(t, chord) {
        const freqs = chord.minor
          ? [chord.root, chord.root * 1.1892, chord.root * 1.4983]   // min triad
          : [chord.root, chord.root * 1.2599, chord.root * 1.4983];  // maj triad
        for (let i = 0; i < freqs.length; i++) {
          const osc = ctx.createOscillator();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freqs[i], t);
          osc.detune.value = (i - 1) * 5;
          const lp = ctx.createBiquadFilter();
          lp.type = 'lowpass'; lp.frequency.value = 650; lp.Q.value = 0.6;
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.0001, t);
          g.gain.linearRampToValueAtTime(0.035, t + 0.5);
          g.gain.setValueAtTime(0.035, t + SPB * 4 - 0.4);
          g.gain.linearRampToValueAtTime(0.0001, t + SPB * 4);
          osc.connect(lp); lp.connect(g); g.connect(master);
          osc.start(t); osc.stop(t + SPB * 4 + 0.1);
        }
      }

      function schedule() {
        if (!ctx || !running) return;
        while (nextTime < ctx.currentTime + 0.15) {
          const s = step % 16;
          const bar = Math.floor(step / 16) % 4;   // which chord of the progression
          const beat = Math.floor(s / 4);          // 0..3 within the bar
          const t = nextTime;

          if (s % 4 === 0) kick(t);        // four-on-floor kick
          if (s === 4 || s === 12) snare(t);  // snare on 2 & 4
          if (s % 2 === 1) hat(t, false);  // off-beat eighths
          if (s === 14) hat(t, true);      // open hat pickup
          if (s % 4 === 0) bassNote(t, BASS[beat]); // bass root each beat (lighter CPU)
          if (s === 0) padChord(t, CHORDS[bar]); // pad each bar

          nextTime += STEP;
          step++;
        }
      }

      function start() {
        ensure();
        if (!ctx) return;
        if (ctx.state === 'suspended') ctx.resume();
        if (running) return;
        running = true;
        // pro-mix fade-in: music swells in over ~2.5s, never blasts in
        if (master) {
          master.gain.cancelScheduledValues(ctx.currentTime);
          master.gain.setValueAtTime(muted ? 0 : 0.0001, ctx.currentTime);
          master.gain.exponentialRampToValueAtTime(muted ? 0.0001 : VOLUME, ctx.currentTime + 2.5);
        }
        nextTime = ctx.currentTime + 0.06;
        step = 0;
        timer = setInterval(schedule, 45);
      }

      function stop() {
        running = false;
        if (timer) { clearInterval(timer); timer = null; }
      }

      function setMuted(m) {
        muted = !!m;
        if (master) master.gain.value = muted ? 0 : VOLUME;
      }

      return { start: start, stop: stop, setMuted: setMuted, ensure: ensure };
    })();

    /* ------------------------------------------------------------ */
    /* INDIAN TRANCE LAYER - ADDS Indian-flavoured trance on top of */
    /* the existing background music (nothing is changed/replaced). */
    /* Tanpura drone + tabla-style percussion + bansuri-flute motif */
    /* riding a driving four-on-floor trance beat. Synthesized,     */
    /* fully offline - works even without the SoundCloud track.     */
    /* ------------------------------------------------------------ */
    const IndianTrance = (function () {
      let ctx = null;
      let master = null;
      let running = false;
      let muted = false;
      let timer = null;
      let nextTime = 0;
      let step = 0;
      const BPM = 132;
      const SPB = 60 / BPM;      // seconds per beat
      const STEP = SPB / 4;      // 16th-note steps
      const VOLUME = 0.0225;      // extra-soft support layer tucked under the lead track

      // tanpura drone strings: Sa - Pa - Sa  (A2 E3 A3)
      const DRONE = [110.00, 164.81, 220.00];
      // raag-ish pentatonic on A: Sa Re Ga Ma Pa Dha Ni Sa
      const SCALE = [220.00, 246.94, 261.63, 293.66, 329.63, 392.00, 440.00];
      // sparse bansuri phrase (indices into SCALE): Sa Ga Pa Dha Pa Ga Re Sa
      const LEAD = [0, 2, 4, 5, 4, 2, 1, 0];

      function ensure() {
        if (ctx) return ctx;
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = muted ? 0 : VOLUME;
        // compressor glues the dense layer: kick+tabla stay tight, and the
        // drone/bass/flute each get their own space instead of piling up.
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -20;
        comp.knee.value = 18;
        comp.ratio.value = 8;
        comp.attack.value = 0.003;
        comp.release.value = 0.22;
        master.connect(comp);
        comp.connect(ctx.destination);
        return ctx;
      }

      function kick(t) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(152, t);
        osc.frequency.exponentialRampToValueAtTime(44, t + 0.11);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.75, t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
        osc.connect(g); g.connect(master);
        osc.start(t); osc.stop(t + 0.38);
      }

      function hat(t, open) {
        const len = Math.floor(ctx.sampleRate * (open ? 0.10 : 0.03));
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass'; hp.frequency.value = 8000;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(open ? 0.09 : 0.065, t + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, t + (open ? 0.1 : 0.035));
        src.connect(hp); hp.connect(g); g.connect(master);
        src.start(t); src.stop(t + (open ? 0.12 : 0.045));
      }

      // tabla stroke "na" - short bandpass noise tick (right hand)
      function tablaNa(t) {
        const len = Math.floor(ctx.sampleRate * 0.05);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass'; bp.frequency.value = 1500 + Math.random() * 600; bp.Q.value = 2.2;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.10, t + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
        src.connect(bp); bp.connect(g); g.connect(master);
        src.start(t); src.stop(t + 0.07);
      }

      // tabla stroke "dha" - now a light tick (kept out of the kick's low end)
      function tablaDha(t) {
        const len = Math.floor(ctx.sampleRate * 0.05);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = 1.8;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.09, t + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
        src.connect(bp); bp.connect(g); g.connect(master);
        src.start(t); src.stop(t + 0.08);
      }

      // trance bass root each beat - tight low end, clear of the drone
      function bassNote(t, f) {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, t);
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 230; lp.Q.value = 9;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.18, t + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, t + SPB * 0.94);
        osc.connect(lp); lp.connect(g); g.connect(master);
        osc.start(t); osc.stop(t + SPB * 0.97);
      }

      // tanpura drone: soft, warm, and lowpassed so it stays a bed not a blur
      function droneNote(t, f, dur) {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t);
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 1500; lp.Q.value = 0.5;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.03, t + 0.6);
        g.gain.setValueAtTime(0.03, t + dur - 0.5);
        g.gain.linearRampToValueAtTime(0.0001, t + dur);
        osc.connect(lp); lp.connect(g); g.connect(master);
        osc.start(t); osc.stop(t + dur + 0.1);
      }

      // bansuri-flute motif: sine with vibrato, soft breathy attack
      function fluteNote(t, f, dur) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t);
        const vib = ctx.createOscillator();
        vib.frequency.value = 5.5;
        const vibAmt = ctx.createGain();
        vibAmt.gain.value = f * 0.012;
        vib.connect(vibAmt); vibAmt.connect(osc.frequency);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.095, t + 0.07);
        g.gain.setValueAtTime(0.095, t + dur - 0.12);
        g.gain.linearRampToValueAtTime(0.0001, t + dur);
        osc.connect(g); g.connect(master);
        osc.start(t); osc.stop(t + dur + 0.1);
        vib.start(t); vib.stop(t + dur + 0.1);
      }

      function schedule() {
        if (!ctx || !running) return;
        while (nextTime < ctx.currentTime + 0.15) {
          const s = step % 16;
          const bar = Math.floor(step / 16);
          const beat = Math.floor(s / 4);
          const t = nextTime;

          // driving four-on-floor trance kick
          if (s % 4 === 0) kick(t);
          // off-beat hats + an open hat pickup
          if (s % 2 === 1) hat(t, false);
          if (s === 14) hat(t, true);

          // tabla pattern over the 16ths: dha na na na ...
          const tab = s % 4;
          if (tab === 0) tablaDha(t);
          else if (tab === 1) tablaNa(t);
          else if (tab === 3) tablaNa(t);

          // trance bass: A root, with a rise to E on the last beat of the bar
          if (s % 4 === 0) bassNote(t, beat === 3 ? 164.81 : 110.00);

          // tanpura drone - one sustained chord per bar
          if (s === 0) {
            droneNote(t, DRONE[0], SPB * 4);
            droneNote(t, DRONE[1], SPB * 4);
            droneNote(t, DRONE[2], SPB * 4);
          }

          // bansuri motif: a gentle phrase every 2 bars (8 quarter notes)
          if (bar % 2 === 0 && s % 4 === 0) {
            const phrase = Math.floor(bar / 2);
            const idx = (phrase * 8 + beat) % LEAD.length;
            fluteNote(t, SCALE[LEAD[idx]], SPB * 0.9);
          }

          nextTime += STEP;
          step++;
        }
      }

      function start() {
        ensure();
        if (!ctx) return;
        if (ctx.state === 'suspended') ctx.resume();
        if (running) return;
        running = true;
        // pro-mix fade-in: layer swells in under the lead over ~2.5s
        if (master) {
          master.gain.cancelScheduledValues(ctx.currentTime);
          master.gain.setValueAtTime(muted ? 0 : 0.0001, ctx.currentTime);
          master.gain.exponentialRampToValueAtTime(muted ? 0.0001 : VOLUME, ctx.currentTime + 2.5);
        }
        nextTime = ctx.currentTime + 0.08;
        step = 0;
        timer = setInterval(schedule, 45);
      }

      function stop() {
        running = false;
        if (timer) { clearInterval(timer); timer = null; }
      }

      function setMuted(m) {
        muted = !!m;
        if (master) master.gain.value = muted ? 0 : VOLUME;
      }

      return { start: start, stop: stop, setMuted: setMuted, ensure: ensure };
    })();


  /* ------------------------------------------------------------------
     5. Audio Orchestrator (gated strictly to active Night Mode)
     ------------------------------------------------------------------ */
  let isMuted = true;
  let bgStarted = false;
  let scHeard = false;
  let musicFallbackOn = false;
  let userGestured = false;
  let synthStarted = false;
  let navrasDone = false;

  const SC_URL = "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/rj-sarkar/navras-drum-and-bass-remix&color=%23ff5500&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false&loop=false";
  const SC_VOLUME = 13;

  function getAudioEl() { return document.getElementById('audio-toggle'); }
  function getScIframe() { return document.getElementById('soundcloud-iframe'); }

  function scCmd(method, value) {
    try {
      const w = getScIframe()?.contentWindow;
      if (w) w.postMessage(JSON.stringify({ method, value }), '*');
    } catch (e) {}
  }

  function startSynthBed(afterNavras) {
    if (!active || synthStarted || isMuted) return;
    synthStarted = true;
    if (afterNavras) navrasDone = true;
    musicFallbackOn = true;
    MusicBed.start();
    IndianTrance.start();
  }

  function scheduleSC() {
    [900, 1800, 3200, 5200].forEach((ms) => {
      setTimeout(() => {
        if (!active || isMuted) return;
        scCmd('play', '');
        scCmd('setVolume', SC_VOLUME);
        scCmd('addEventListener', 'finish');
        scCmd('addEventListener', 'playProgress');
      }, ms);
    });
    let nudges = 0;
    const nudge = setInterval(() => {
      if (!active || scHeard || navrasDone || isMuted || ++nudges > 24) { clearInterval(nudge); return; }
      scCmd('play', '');
      scCmd('setVolume', SC_VOLUME);
      scCmd('addEventListener', 'finish');
    }, 2500);
  }

  function startBackgroundMusic(forceSilent) {
    if (forceSilent) return;
    if (bgStarted) return;
    bgStarted = true;
    isMuted = false;
    Coin.setMuted(false);
    const toggle = getAudioEl();
    const iframe = getScIframe();
    if (toggle) toggle.innerHTML = '🔊';
    if (!iframe) return;
    if (userGestured) {
      iframe.src = SC_URL;
      scheduleSC();
    } else {
      const armSC = () => {
        document.removeEventListener('pointerdown', armSC, true);
        document.removeEventListener('keydown', armSC, true);
        if (active && !isMuted && !navrasDone && iframe.src.indexOf('soundcloud') === -1) {
          iframe.src = SC_URL;
          scheduleSC();
        }
      };
      document.addEventListener('pointerdown', armSC, true);
      document.addEventListener('keydown', armSC, true);
    }
    setTimeout(() => {
      if (active && !scHeard && !synthStarted && !isMuted && userGestured) startSynthBed();
    }, 9000);
  }

  function stopAllClassicAudio() {
    isMuted = true;
    bgStarted = false;
    scHeard = false;
    musicFallbackOn = false;
    synthStarted = false;
    Forest.stop();
    Rain.stop();
    MusicBed.stop();
    IndianTrance.stop();
    Coin.setMuted(true);
    Rain.setMuted(true);
    WaterDrip.setMuted(true);
    MusicBed.setMuted(true);
    IndianTrance.setMuted(true);
    const iframe = getScIframe();
    if (iframe) iframe.src = 'about:blank';
    const toggle = getAudioEl();
    if (toggle) {
      toggle.innerHTML = '🔇';
      toggle.title = 'Background music: muted';
    }
  }

  function unlockAudio() {
    if (!active) return;
    userGestured = true;
    try { const c = Forest.ensure(); if (c && c.state === 'suspended') c.resume(); } catch (e) {}
    try { const r = Rain.ensure(); if (r && r.state === 'suspended') r.resume(); } catch (e) {}
    try { const d = WaterDrip.ensure(); if (d && d.state === 'suspended') d.resume(); } catch (e) {}
    try { const m = MusicBed.ensure(); if (m && m.state === 'suspended') m.resume(); } catch (e) {}
    try { const it = IndianTrance.ensure(); if (it && it.state === 'suspended') it.resume(); } catch (e) {}
    try {
      if (bgStarted && !navrasDone && !isMuted) {
        scCmd('play', ''); scCmd('setVolume', SC_VOLUME);
      }
    } catch (e) {}
    try {
      if (bgStarted && !scHeard && !synthStarted && !isMuted) {
        setTimeout(() => { if (active && !scHeard && !synthStarted && !isMuted) startSynthBed(); }, 4000);
      }
    } catch (e) {}
  }

  /* ------------------------------------------------------------------
     6. Intro Gate, Firefly Jar, Portfolio Ad, Lead Modal, Side FABs
     ------------------------------------------------------------------ */
  let introController = null;
  let fireflyController = null;
  let adController = null;
  let revealTimers = [];

  function showClassicToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 500); }, 1800);
  }

  function clearRevealTimers() {
    revealTimers.forEach(clearTimeout);
    revealTimers = [];
  }

  function revealStaggeredUI(immediate) {
    clearRevealTimers();
    const sequence = [
      '#nightStage .corner-owl',
      '#classicModeSwitchBtn',
      '#avFullscreenBtn',
      '#nightStage .side-link-fab.designers-menu-link',
      '#nightStage .side-link-fab.game-link',
      '#nightStage .side-link-fab.museum-link',
      '#nightStage .side-link-fab.counter-link',
      '#nightStage .side-link-fab.studio-link',
      '#nightStage .side-link-fab.portfolio-link',
      '#nightStage .side-link-fab.readon-link',
      '#nightStage .side-link-fab.vastu-camera-link',
      '#nightStage #audio-toggle',
      '#shareFab',
      '#fabToggle',
      '#replayIntroBtn'
    ];
    document.documentElement.classList.remove('ui-booting');
    document.documentElement.classList.add('ui-ready');
    void document.body.offsetWidth;
    if (immediate) {
      sequence.forEach((sel) => {
        const el = document.querySelector(sel);
        if (el) el.classList.add('ui-pop');
      });
      return;
    }
    sequence.forEach((sel, i) => {
      revealTimers.push(setTimeout(() => {
        const el = document.querySelector(sel);
        if (el) el.classList.add('ui-pop');
      }, i * 110));
    });
  }

  function initOnce() {
    if (initialized) return;
    initialized = true;

    setupCursor();

    // Coin & audio unlock listeners (strictly gated on active Night Mode)
    document.addEventListener('pointerdown', () => {
      if (active) Coin.play();
    }, { capture: true, passive: true });
    document.addEventListener('pointerdown', unlockAudio, { capture: true });
    document.addEventListener('keydown', unlockAudio, { capture: true });

    window.addEventListener('message', (ev) => {
      if (!active) return;
      try {
        const d = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
        const m = (((d && (d.method || d.type)) || '') + '').toLowerCase();
        if (d && (d.type === 'playProgressUpdate' || d.type === 'playProgress' || m === 'play' || m === 'playprogress')) {
          scHeard = true;
          if (synthStarted) {
            synthStarted = false;
            navrasDone = false;
            musicFallbackOn = false;
            MusicBed.stop();
            IndianTrance.stop();
          }
        }
        if (m.indexOf('finish') !== -1) { scHeard = true; startSynthBed(true); }
      } catch (e) {}
    });

    // Audio toggle button (#audio-toggle)
    const toggle = getAudioEl();
    if (toggle) {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        userGestured = true;
        isMuted = !isMuted;
        Coin.setMuted(isMuted);
        Rain.setMuted(isMuted);
        WaterDrip.setMuted(isMuted);
        MusicBed.setMuted(isMuted);
        IndianTrance.setMuted(isMuted);
        const iframe = getScIframe();
        if (isMuted) {
          if (iframe) iframe.src = 'about:blank';
          toggle.innerHTML = '🔇';
          toggle.title = 'Background music: muted';
        } else {
          bgStarted = true;
          toggle.innerHTML = '🔊';
          toggle.title = 'Background music: playing';
          if (navrasDone) {
            MusicBed.start();
            IndianTrance.start();
          } else {
            if (iframe) iframe.src = SC_URL;
            scheduleSC();
            if (musicFallbackOn) MusicBed.start();
          }
        }
      });
    }

    async function copyClassicTextSafe(text) {
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text);
          return true;
        } catch (err) {}
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
      } catch (err) {
        return false;
      }
    }

    // Share button (#shareFab)
    const shareFab = document.getElementById('shareFab');
    if (shareFab) {
      shareFab.addEventListener('click', async (e) => {
        e.stopPropagation();
        const url = window.location.href;
        if (navigator.share) {
          const shareObj = { title: 'RJ Sarkar: Creative Lead — Design & Execution', text: 'Check out this amazing digital Business Card!', url };
          if (!navigator.canShare || navigator.canShare(shareObj)) {
            try {
              await navigator.share(shareObj);
              return;
            } catch (err) {
              if (err && err.name === 'AbortError') return;
            }
          }
        }
        const ok = await copyClassicTextSafe(url);
        showClassicToast(ok ? 'Link copied to clipboard! 📋' : 'Share feature not available 😔');
      });
    }

    // Save contact (#saveContactBtn)
    const saveBtn = document.getElementById('saveContactBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const vcf = [
          'BEGIN:VCARD',
          'VERSION:3.0',
          'FN:RJ Sarkar',
          'N:Sarkar;Ranjan;;;',
          'ORG:ArtViSiON',
          'TEL;TYPE=CELL:+91 9009001551',
          'EMAIL:rjsarkar@icloud.com',
          'END:VCARD'
        ].join('\r\n');
        const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'RJ_Sarkar.vcf';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { if (a.parentNode) a.parentNode.removeChild(a); URL.revokeObjectURL(url); }, 1500);
        showClassicToast('Contact saved! Tap RJ_Sarkar.vcf to add to your contacts.');
      });
    }

    // Ripple on contact / offer buttons (supports both pointer and keyboard activation)
    document.querySelectorAll('#nightStage .contact-btn, #nightStage .offer-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const ripple = document.createElement('div');
        ripple.style.cssText = 'position:absolute;border-radius:50%;background:rgba(255,255,255,0.33);transform:translate(-50%,-50%) scale(0);animation:ripple 0.48s ease-out forwards;pointer-events:none;z-index:10;';
        const rect = btn.getBoundingClientRect();
        const hasCoords = !!(e.clientX || e.clientY);
        ripple.style.left = (hasCoords ? e.clientX - rect.left : rect.width / 2) + 'px';
        ripple.style.top = (hasCoords ? e.clientY - rect.top : rect.height / 2) + 'px';
        ripple.style.width = ripple.style.height = Math.max(rect.width, rect.height) + 'px';
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 500);
      });
    });

    // 3D Environment Gallery loader
    (function () {
      const btn = document.getElementById('galleryBtn');
      const cs = document.getElementById('comingSoon');
      if (!btn || !cs) return;
      const GALLERY_URL = 'https://rjsarkar83.github.io/360-services/';
      const LOAD_MS = 5000;
      let timer = null;
      let going = false;
      let warmed = false;

      const warmUp = () => {
        if (warmed) return;
        warmed = true;
        try {
          const pre = document.createElement('link');
          pre.rel = 'preconnect';
          pre.href = 'https://rjsarkar83.github.io';
          document.head.appendChild(pre);
          const pf = document.createElement('link');
          pf.rel = 'prefetch';
          pf.as = 'document';
          pf.href = GALLERY_URL;
          document.head.appendChild(pf);
        } catch (e) {}
      };
      btn.addEventListener('mouseenter', warmUp, { passive: true });
      btn.addEventListener('touchstart', warmUp, { passive: true });

      const reset = () => {
        cs.classList.remove('show');
        cs.setAttribute('aria-hidden', 'true');
        btn.classList.remove('is-busy');
        const bar = cs.querySelector('.cs-bar > i');
        if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
      };
      const go = () => {
        if (going) return;
        going = true;
        if (timer) { clearTimeout(timer); timer = null; }
        window.location.href = GALLERY_URL;
      };
      btn.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        if (going) return;
        warmUp();
        if (timer) clearTimeout(timer);
        btn.classList.add('is-busy');
        cs.classList.add('show');
        cs.setAttribute('aria-hidden', 'false');
        timer = setTimeout(go, LOAD_MS);
      });
      cs.addEventListener('click', (ev) => { ev.preventDefault(); ev.stopPropagation(); go(); });
      document.addEventListener('keydown', (ev) => {
        if (ev.key !== 'Escape' || going || !cs.classList.contains('show')) return;
        if (timer) { clearTimeout(timer); timer = null; }
        reset();
      });
      window.addEventListener('pageshow', () => { going = false; reset(); });
    })();

    // Back-face 3-row Marquee
    (function () {
      const eye = '\u{1F9FF}';
      const wrapEyes = (t) => t.split(eye).join('<span class="blink-eye">' + eye + '</span>');
      const rows = [
        { id: 'mqVision', html: wrapEyes('Your ViSi' + eye + 'N,   ' + eye + 'ur Creation') },
        { id: 'mqServices', html: '\u27A4 \u2022 ADVERTiSiNG - BRANDiNG - CREATiVE - DESiGN - EXECUTiON \u2022 \u27A4' },
        { id: 'mqDisciplines', html: 'Rj_Designer - Creative Lead ➤ Design to Execution ➤ 12+ Years of Retail Production Design Solutions, Advertising & Branding Direction ➤ “360° End-to-End Production Design & A-to-Z Branding Solutions” ➤' }
      ];
      rows.forEach((row) => {
        const track = document.getElementById(row.id);
        if (track) track.innerHTML = '<span>' + row.html + '</span><span>' + row.html + '</span>';
      });
    })();

    // Card Flip + Night Firefly Jar Physics
    fireflyController = (function () {
      const cardFlip = document.getElementById('card-flip');
      const turnBtn = document.getElementById('turnCardBtn');
      const turnLabel = document.getElementById('turnCardLabel');
      const fireflyEl = document.querySelector('#nightStage .firefly');
      if (!cardFlip || !fireflyEl) return { reset: () => {} };

      const FIXED_SCALE = 0.13;
      const homeParent = fireflyEl.parentElement;
      const homeNextSibling = fireflyEl.nextSibling;

      let mouseX = window.innerWidth / 2;
      let mouseY = window.innerHeight / 2;
      let hasPointer = false;
      document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; hasPointer = true; });
      document.addEventListener('pointermove', (e) => { mouseX = e.clientX; mouseY = e.clientY; hasPointer = true; }, { passive: true });
      document.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) { mouseX = e.touches[0].clientX; mouseY = e.touches[0].clientY; hasPointer = true; }
      }, { passive: true });

      let glowOffX = 0, glowOffY = 0;
      let curScale = FIXED_SCALE;
      let state = 'jar';
      let releaseTimer = null;
      let fleeTimer = null;
      let rafId = null;
      let curX = 0, curY = 0;
      let angle = Math.random() * Math.PI * 2;

      function paint(x, y, rotateDeg, scale) {
        const s = scale || FIXED_SCALE;
        const r = rotateDeg ? ` rotate(${rotateDeg}deg)` : '';
        const k = s / FIXED_SCALE;
        fireflyEl.style.transform = `translate(${x - glowOffX * k}px, ${y - glowOffY * k}px) translate(-50%, -50%)${r} scale(${s})`;
      }

      function measureGlowOffset(atX, atY) {
        const glow = fireflyEl.querySelector('.bodybottom') || fireflyEl.querySelector('.body');
        if (!glow) return;
        glowOffX = 0; glowOffY = 0;
        paint(atX, atY, 0, FIXED_SCALE);
        const gr = glow.getBoundingClientRect();
        glowOffX = (gr.left + gr.width / 2) - atX;
        glowOffY = (gr.top + gr.height / 2) - atY;
      }

      function loop(now) {
        if (!active || state !== 'free') return;
        angle += 0.05;
        const orbitRadius = 18 + 92 * (0.5 + 0.5 * Math.sin(now / 1500));
        const baseX = hasPointer ? mouseX : window.innerWidth / 2;
        const baseY = hasPointer ? mouseY : window.innerHeight / 2;
        const targetX = baseX + Math.cos(angle) * orbitRadius;
        const targetY = baseY + Math.sin(angle * 1.3) * orbitRadius * 0.6;
        const dx = targetX - curX;
        const dy = targetY - curY;
        const dist = Math.hypot(dx, dy);
        const ease = dist > 220 ? 0.22 : dist > 90 ? 0.15 : 0.10;
        curX += dx * ease;
        curY += dy * ease;

        const distToMouse = Math.hypot(curX - baseX, curY - baseY);
        const depth = Math.min(1, distToMouse / 120);
        const targetScale = FIXED_SCALE * (1.65 - 0.75 * depth);
        curScale += (targetScale - curScale) * 0.10;

        const tilt = Math.max(-22, Math.min(22, dx * 0.6)) + Math.sin(now / 500) * 5;
        paint(curX, curY, tilt, curScale);
        rafId = requestAnimationFrame(loop);
      }

      function releaseFirefly() {
        if (!active || state !== 'jar') return;
        const glow = fireflyEl.querySelector('.bodybottom') || fireflyEl.querySelector('.body');
        const gr = (glow || fireflyEl).getBoundingClientRect();
        curX = gr.left + gr.width / 2 || window.innerWidth / 2;
        curY = gr.top + gr.height / 2 || window.innerHeight / 2;
        (nightStage() || document.body).appendChild(fireflyEl);
        fireflyEl.classList.add('roaming');
        fireflyEl.style.transition = 'none';
        measureGlowOffset(curX, curY);
        curScale = FIXED_SCALE;
        paint(curX, curY, 0, curScale);
        state = 'free';
        rafId = requestAnimationFrame(loop);
      }

      function resetImmediate() {
        if (releaseTimer) { clearTimeout(releaseTimer); releaseTimer = null; }
        if (fleeTimer) { clearTimeout(fleeTimer); fleeTimer = null; }
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        fireflyEl.classList.remove('roaming');
        fireflyEl.removeAttribute('style');
        if (homeNextSibling && homeNextSibling.parentElement === homeParent) {
          homeParent.insertBefore(fireflyEl, homeNextSibling);
        } else if (homeParent) {
          homeParent.appendChild(fireflyEl);
        }
        state = 'jar';
      }

      function fleeFirefly() {
        if (state !== 'free') return;
        state = 'fleeing';
        if (rafId) cancelAnimationFrame(rafId);
        const dx = curX - window.innerWidth / 2;
        const dy = curY - window.innerHeight / 2;
        let targetX, targetY;
        if (Math.abs(dx) > Math.abs(dy)) {
          targetX = dx > 0 ? window.innerWidth + 200 : -200;
          targetY = curY - 260 - Math.random() * 140;
        } else {
          targetX = curX + (Math.random() - 0.5) * 200;
          targetY = dy > 0 ? window.innerHeight + 200 : -200;
        }
        fireflyEl.style.transition = 'transform 0.8s cubic-bezier(.4,0,.6,1)';
        paint(targetX, targetY, 0);
        fleeTimer = setTimeout(resetImmediate, 820);
      }

      window.addEventListener('resize', () => {
        if (active && state === 'free') measureGlowOffset(curX, curY);
      });

      function toggleFlip() {
        cardFlip.classList.toggle('flipped');
        const isFlipped = cardFlip.classList.contains('flipped');
        if (turnBtn) {
          turnBtn.setAttribute('aria-pressed', isFlipped ? 'true' : 'false');
          turnBtn.setAttribute('aria-label', isFlipped ? 'Turn digital card to see front side' : 'Turn digital card to see back side');
        }
        if (turnLabel) turnLabel.textContent = isFlipped ? 'Front' : 'Turn';
        if (isFlipped) {
          if (releaseTimer) clearTimeout(releaseTimer);
          releaseTimer = setTimeout(releaseFirefly, 2800);
        } else {
          if (releaseTimer) { clearTimeout(releaseTimer); releaseTimer = null; }
          if (state === 'free') fleeFirefly();
        }
      }

      cardFlip.addEventListener('click', toggleFlip);
      if (turnBtn) {
        turnBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); toggleFlip(); });
      }
      cardFlip.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); toggleFlip(); }
      });

      return { reset: resetImmediate };
    })();

    // Portfolio Ad (5-Scene Vector Showcase + Owl Lasers)
    adController = (function () {
      const ad = document.getElementById('avPortfolioAd');
      const replay = document.getElementById('avAdReplay');
      const progress = document.getElementById('avAdProgressBar');
      const laserSvg = document.getElementById('avAdOwlLasers');
      const owl = document.getElementById('owlTrigger');
      const display = document.querySelector('#nightStage .calculator-screen');
      const logo = ad?.querySelector('.av-ad-final .av-ad-art');
      if (!ad || !display) return { schedule: () => {}, stop: () => {} };

      const scenes = Array.from(ad.querySelectorAll('.av-ad-scene'));
      const skipButton = document.getElementById('avAdSkip');
      const laserPaths = [
        document.getElementById('avAdLaserLeftBeam'),
        document.getElementById('avAdLaserRightBeam')
      ].filter(Boolean);

      let sceneTimer = 0, assetTimer = 0, introTimer = 0, laserTimer = 0;
      let started = false, lasersActive = false, laserFrame = 0;

      function loadSceneArt(scene) {
        const image = scene?.querySelector('.av-ad-art');
        if (!image || !image.dataset.src || image.dataset.loaded === 'true' || image.dataset.loading === 'true') return;
        image.dataset.loading = 'true';
        image.addEventListener('load', () => { image.dataset.loaded = 'true'; image.dataset.loading = 'false'; }, { once: true });
        image.addEventListener('error', () => { image.dataset.loading = 'false'; }, { once: true });
        image.src = image.dataset.src;
      }

      function hideLasers() {
        lasersActive = false;
        window.clearTimeout(laserTimer);
        laserTimer = 0;
        laserSvg?.classList.remove('is-visible');
        owl?.classList.remove('ad-owl-target');
        if (laserFrame) cancelAnimationFrame(laserFrame);
        laserFrame = 0;
      }

      function updateLasers() {
        if (!active || !lasersActive || !laserSvg || !owl || !logo) return;
        const width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        const height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        laserSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);

        const box = logo.getBoundingClientRect();
        if (box.width === 0 || box.height === 0) return;
        const aspect = logo.naturalWidth && logo.naturalHeight ? logo.naturalWidth / logo.naturalHeight : 990 / 580;
        const imageWidth = Math.min(box.width, box.height * aspect);
        const imageHeight = imageWidth / aspect;
        const imageLeft = box.left + (box.width - imageWidth) / 2;
        const imageTop = box.top + (box.height - imageHeight) / 2;
        const eyeY = imageTop + imageHeight * 0.44;
        const eyes = [
          { x: imageLeft + imageWidth * 0.235, y: eyeY },
          { x: imageLeft + imageWidth * 0.765, y: eyeY }
        ];
        const owlBox = owl.getBoundingClientRect();
        const target = { x: owlBox.left + owlBox.width * 0.5, y: owlBox.top + owlBox.height * 0.5 };
        laserPaths.forEach((path, i) => {
          const eye = eyes[i];
          if (eye) path.setAttribute('d', `M ${eye.x.toFixed(1)} ${eye.y.toFixed(1)} L ${target.x.toFixed(1)} ${target.y.toFixed(1)}`);
        });
      }

      function requestLaserUpdate() {
        if (!lasersActive || laserFrame) return;
        laserFrame = requestAnimationFrame(() => { laserFrame = 0; updateLasers(); });
      }

      function fireLasers() {
        if (!active || !laserSvg || !owl || !logo) return;
        lasersActive = true;
        owl.classList.add('ad-owl-target');
        updateLasers();
        laserSvg.classList.add('is-visible');
      }

      function finishAd() {
        window.clearTimeout(sceneTimer);
        window.clearTimeout(assetTimer);
        hideLasers();
        ad.classList.add('is-closing');
        ad.setAttribute('aria-hidden', 'true');
        window.setTimeout(() => {
          ad.hidden = true;
          ad.classList.remove('is-playing', 'is-closing');
          replay?.removeAttribute('hidden');
        }, 370);
      }

      function showScene(index) {
        if (!active) return;
        const scene = scenes[index];
        if (!scene) { finishAd(); return; }
        window.clearTimeout(assetTimer);
        loadSceneArt(scene);
        const nextScene = scenes[index + 1];
        if (nextScene) {
          assetTimer = window.setTimeout(() => {
            if (active && started && !ad.hidden && scene.classList.contains('is-active')) loadSceneArt(nextScene);
          }, 380);
        }
        scenes.forEach((item, i) => {
          const isAct = i === index;
          item.classList.toggle('is-active', isAct);
          item.setAttribute('aria-hidden', isAct ? 'false' : 'true');
        });
        const isFinal = scene.classList.contains('av-ad-final');
        ad.classList.toggle('is-final', isFinal);
        if (isFinal) {
          hideLasers();
          laserTimer = window.setTimeout(fireLasers, 1020);
        } else {
          hideLasers();
        }
        const duration = Math.max(1200, Number(scene.dataset.duration) || 2400);
        if (progress) {
          progress.style.transition = 'none';
          progress.style.transform = 'scaleX(0)';
          void progress.offsetWidth;
          requestAnimationFrame(() => {
            progress.style.transition = `transform ${duration}ms linear`;
            progress.style.transform = 'scaleX(1)';
          });
        }
        window.clearTimeout(sceneTimer);
        sceneTimer = window.setTimeout(() => {
          if (!active) return;
          if (index + 1 < scenes.length) showScene(index + 1);
          else finishAd();
        }, duration);
      }

      function playAd() {
        if (!active || started) return;
        started = true;
        window.clearTimeout(introTimer);
        window.clearTimeout(sceneTimer);
        window.clearTimeout(assetTimer);
        hideLasers();
        replay?.setAttribute('hidden', '');
        ad.hidden = false;
        ad.classList.remove('is-closing', 'is-final');
        ad.classList.add('is-playing');
        ad.setAttribute('aria-hidden', 'false');
        showScene(0);
      }

      function scheduleAd(delayMs) {
        if (!active || started || introTimer) return;
        introTimer = window.setTimeout(() => { introTimer = 0; playAd(); }, delayMs ?? 1150);
      }

      function stopAd() {
        window.clearTimeout(introTimer); introTimer = 0;
        window.clearTimeout(sceneTimer); sceneTimer = 0;
        window.clearTimeout(assetTimer); assetTimer = 0;
        hideLasers();
        started = false;
        ad.hidden = true;
        ad.classList.remove('is-playing', 'is-closing', 'is-final');
        replay?.removeAttribute('hidden');
      }

      ad.addEventListener('pointerdown', (ev) => ev.stopPropagation());
      ad.addEventListener('click', (ev) => ev.stopPropagation());
      skipButton?.addEventListener('click', (ev) => { ev.preventDefault(); ev.stopPropagation(); finishAd(); });
      replay?.addEventListener('click', (ev) => { ev.preventDefault(); ev.stopPropagation(); started = false; playAd(); });
      window.addEventListener('resize', requestLaserUpdate, { passive: true });
      window.addEventListener('scroll', requestLaserUpdate, { passive: true });
      logo?.addEventListener('load', requestLaserUpdate);
      document.addEventListener('keydown', (ev) => {
        if (active && ev.key === 'Escape' && !ad.hidden) finishAd();
      });

      return { schedule: scheduleAd, stop: stopAd, replay: () => { started = false; playAd(); } };
    })();

    // Intro Gate Controller
    introController = (function () {
      const root = document.getElementById('introRoot');
      const skipBtn = document.getElementById('introSkip');
      const replayBtn = document.getElementById('replayIntroBtn');
      const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let stageTimers = [];

      function clearTimers() {
        stageTimers.forEach(clearTimeout);
        stageTimers = [];
      }

      function finishIntro(silentSkip) {
        clearTimers();
        try { sessionStorage.setItem('av_intro_seen', '1'); } catch (e) {}
        Forest.stop();
        Rain.stop();
        if (!silentSkip) startBackgroundMusic(false);
        if (root) {
          root.classList.add('intro-done');
          root.style.display = 'none';
          root.setAttribute('aria-hidden', 'true');
        }
        document.documentElement.classList.remove('intro-lock');
        document.body.classList.remove('intro-active', 'intro-glass');
        document.dispatchEvent(new Event('introDone'));
        if (active) {
          revealStaggeredUI(!!silentSkip);
          adController?.schedule(silentSkip ? 700 : 1150);
        }
      }

      function runIntro(force, silentSkip) {
        clearTimers();
        if (!root) { finishIntro(silentSkip); return; }
        let seen = false;
        try { seen = sessionStorage.getItem('av_intro_seen') === '1'; } catch (e) {}
        if (!force && (silentSkip || seen)) {
          finishIntro(!!silentSkip);
          return;
        }
        root.classList.remove('stage-alpona', 'stage-word-l', 'stage-word-r', 'stage-open', 'stage-logo', 'stage-icons', 'stage-blink', 'stage-glass', 'stage-fadeout', 'intro-done');
        document.documentElement.classList.add('intro-lock');
        document.body.classList.add('intro-active');
        document.body.classList.remove('intro-glass');
        root.style.display = 'block';
        root.style.opacity = '1';
        root.setAttribute('aria-hidden', 'false');

        if (reduceMotion) { finishIntro(silentSkip); return; }

        Forest.start();
        Rain.start();
        startBackgroundMusic(false);

        stageTimers.push(setTimeout(() => root.classList.add('stage-alpona'), 50));
        stageTimers.push(setTimeout(() => root.classList.add('stage-word-l'), 280));
        stageTimers.push(setTimeout(() => root.classList.add('stage-word-r'), 620));
        stageTimers.push(setTimeout(() => root.classList.add('stage-open'), 1050));
        stageTimers.push(setTimeout(() => root.classList.add('stage-logo'), 1250));
        stageTimers.push(setTimeout(() => {
          root.classList.add('stage-icons');
          [30, 100, 170, 240, 310, 380].forEach((off) => {
            stageTimers.push(setTimeout(() => WaterDrip.play(), off));
          });
        }, 1250));
        stageTimers.push(setTimeout(() => root.classList.add('stage-blink'), 1450));
        stageTimers.push(setTimeout(() => {
          root.classList.add('stage-glass');
          document.body.classList.add('intro-glass');
        }, 1650));
        stageTimers.push(setTimeout(() => root.classList.add('stage-fadeout'), 1820));
        stageTimers.push(setTimeout(() => finishIntro(false), 2000));
      }

      function isIntroPlaying() {
        return active && root && !root.classList.contains('intro-done') && root.style.display !== 'none';
      }
      function skipIntroByInteraction(e) {
        if (!isIntroPlaying()) return;
        if (e) e.stopPropagation();
        finishIntro(false);
      }

      if (skipBtn) skipBtn.addEventListener('click', skipIntroByInteraction);
      if (replayBtn) replayBtn.addEventListener('click', (e) => { e.stopPropagation(); runIntro(true, false); });
      document.addEventListener('pointerdown', skipIntroByInteraction, { capture: true });
      document.addEventListener('touchstart', skipIntroByInteraction, { capture: true, passive: true });

      return { run: runIntro, finish: finishIntro };
    })();

    // Lead / Enquiry Modal
    (function () {
      const fab = document.getElementById('avLeadFab');
      const modal = document.getElementById('avLeadModal');
      if (!fab || !modal) return;
      function closeLeadModal() {
        modal.classList.remove('open');
      }
      fab.addEventListener('click', () => {
        modal.classList.add('open');
        const nm = document.getElementById('avLeadName');
        if (nm) setTimeout(() => nm.focus(), 60);
      });
      document.getElementById('avLeadClose')?.addEventListener('click', closeLeadModal);
      modal.addEventListener('click', (e) => { if (e.target === modal) closeLeadModal(); });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) closeLeadModal();
      });

      function leadData() {
        return {
          type: 'lead',
          t: new Date().toISOString(),
          name: document.getElementById('avLeadName')?.value.trim() || '',
          mobile: document.getElementById('avLeadMobile')?.value.trim() || '',
          email: document.getElementById('avLeadEmail')?.value.trim() || '',
          social: document.getElementById('avLeadSocial')?.value.trim() || '',
          service: document.getElementById('avLeadService')?.value || '',
          message: document.getElementById('avLeadMsg')?.value.trim() || '',
          page: location.pathname
        };
      }
      document.getElementById('avLeadSubmit')?.addEventListener('click', () => {
        const d = leadData();
        if (!d.name || !d.mobile) { showClassicToast('Naam aur mobile zaroori hai 🙏'); return; }
        modal.classList.remove('open');
        const txt = 'Hi RJ! Main ' + d.name + ' (' + d.mobile + ')' + (d.service ? ' — ' + d.service : '') + (d.message ? '\n' + d.message : '');
        window.open('https://wa.me/919009001551?text=' + encodeURIComponent(txt), '_blank', 'noopener');
        showClassicToast('Shukriya ' + d.name + '! Jald contact karenge ❤️');
      });
      document.getElementById('avLeadWA')?.addEventListener('click', () => {
        const d = leadData();
        const txt = 'Hi RJ! Main ' + (d.name || 'ek visitor') + ' — card se enquiry.' +
          (d.mobile ? '\nMobile: ' + d.mobile : '') + (d.service ? '\nKaam: ' + d.service : '') + (d.message ? '\n' + d.message : '');
        window.open('https://wa.me/919009001551?text=' + encodeURIComponent(txt), '_blank', 'noopener');
      });
    })();

    // Fullscreen + Owl Trigger + Right Dock Minimize Toggle
    (function () {
      const fsBtn = document.getElementById('avFullscreenBtn');
      const fsExpand = document.getElementById('avFsExpandSvg');
      const fsCompress = document.getElementById('avFsCompressSvg');
      const fsEl = document.documentElement;
      const fsReq = fsEl.requestFullscreen || fsEl.webkitRequestFullscreen || fsEl.mozRequestFullScreen || fsEl.msRequestFullscreen;
      const fsSupported = Boolean(fsReq) && document.fullscreenEnabled !== false && document.webkitFullscreenEnabled !== false;
      function isFs() {
        return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
      }
      function updFs() {
        const fs = isFs();
        if (fsExpand) fsExpand.style.display = fs ? 'none' : '';
        if (fsCompress) fsCompress.style.display = fs ? '' : 'none';
      }
      if (fsBtn) {
        if (!fsSupported) {
          fsBtn.hidden = true;
        } else {
          fsBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
              if (!isFs()) {
                const req = fsEl.requestFullscreen || fsEl.webkitRequestFullscreen || fsEl.mozRequestFullScreen || fsEl.msRequestFullscreen;
                if (req) await Promise.resolve(req.call(fsEl));
              } else {
                const ex = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
                if (ex) await Promise.resolve(ex.call(document));
              }
            } catch (err) {
              showClassicToast('Fullscreen is not available here');
            }
            setTimeout(updFs, 250);
          });
        }
      }
      document.addEventListener('fullscreenchange', updFs);
      document.addEventListener('webkitfullscreenchange', updFs);
      document.addEventListener('mozfullscreenchange', updFs);
      document.addEventListener('MSFullscreenChange', updFs);

      const owl = document.getElementById('owlTrigger');
      if (owl) {
        const go = () => { window.location.href = 'https://rjsarkar83.github.io/vector-portfolio/'; };
        owl.addEventListener('click', go);
        owl.addEventListener('touchend', (e) => { e.preventDefault(); go(); }, { passive: false });
      }

      const fabToggle = document.getElementById('fabToggle');
      if (fabToggle) {
        const KEY = 'av_fabs_min_v2';
        function setFabs(min, persist) {
          document.body.classList.toggle('fabs-min', min);
          fabToggle.setAttribute('aria-expanded', String(!min));
          fabToggle.title = min ? 'Show quick buttons' : 'Hide quick buttons';
          if (persist) {
            try { localStorage.setItem(KEY, min ? '1' : '0'); } catch (e) {}
          }
        }
        let saved = null;
        try { saved = localStorage.getItem(KEY); } catch (e) {}
        setFabs(saved !== '0', false);
        fabToggle.addEventListener('click', (e) => {
          e.stopPropagation();
          setFabs(!document.body.classList.contains('fabs-min'), true);
        });
      }
    })();

    // Prevent pinch/double-tap zoom on non-interactive Night background
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
      if (!active) return;
      const now = Date.now();
      if (event.target && event.target.closest && event.target.closest('a,button,input,select,textarea,label')) { lastTouchEnd = now; return; }
      if (now - lastTouchEnd <= 400) event.preventDefault();
      lastTouchEnd = now;
    }, false);
  }

  /* ------------------------------------------------------------------
     Public Dual-Mode Lifecycle API
     ------------------------------------------------------------------ */
  window.AVClassic = {
    enter(skipIntro) {
      initOnce();
      active = true;
      if (cursorEl) cursorEl.style.display = '';
      startMatrixRain();
      startHeadlineScroll();
      startServicesBg();
      if (skipIntro) {
        introController?.run(false, true);
      } else {
        requestAnimationFrame(() => introController?.run(false, false));
      }
    },
    leave() {
      active = false;
      clearRevealTimers();
      stopMatrixRain();
      stopHeadlineScroll();
      stopServicesBg();
      stopAllClassicAudio();
      adController?.stop();
      fireflyController?.reset();
      if (cursorEl) cursorEl.style.display = 'none';
      const lead = document.getElementById('avLeadModal');
      if (lead) lead.classList.remove('open');
      document.documentElement.classList.remove('intro-lock', 'ui-booting');
      document.body.classList.remove('intro-active', 'intro-glass');
    },
    isActive() { return active; },
    isAudioPlaying() { return active && !isMuted; }
  };
})();
