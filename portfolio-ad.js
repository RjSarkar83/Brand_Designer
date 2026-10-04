/* A short, muted-by-design promo which runs inside the front glass display. */
(() => {
  const ad = document.getElementById('avPortfolioAd');
  const replay = document.getElementById('avAdReplay');
  const progress = document.getElementById('avAdProgressBar');
  const laserSvg = document.getElementById('avAdOwlLasers');
  const owl = document.getElementById('owlTrigger');
  const display = document.querySelector('.calculator-screen');
  const logo = ad?.querySelector('.av-ad-final .av-ad-art');

  if (!ad || !display) return;

  const scenes = Array.from(ad.querySelectorAll('.av-ad-scene'));
  const skipButton = document.getElementById('avAdSkip');
  const laserPaths = [
    document.getElementById('avAdLaserLeftBeam'),
    document.getElementById('avAdLaserRightBeam')
  ].filter(Boolean);

  let sceneTimer = 0;
  let assetTimer = 0;
  let introTimer = 0;
  let laserTimer = 0;
  let started = false;
  let lasersActive = false;
  let laserFrame = 0;

  function loadSceneArt(scene) {
    const image = scene?.querySelector('.av-ad-art');
    if (!image || !image.dataset.src || image.dataset.loaded === 'true' || image.dataset.loading === 'true') return;

    image.dataset.loading = 'true';
    image.addEventListener('load', () => {
      image.dataset.loaded = 'true';
      image.dataset.loading = 'false';
    }, { once: true });
    image.addEventListener('error', () => {
      image.dataset.loading = 'false';
    }, { once: true });
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
    if (!lasersActive || !laserSvg || !owl || !logo) return;

    const width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    laserSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    // The embedded ArtViSiON SVG has two white eye shapes at these normalized
    // positions. Account for object-fit:contain letterboxing in the display.
    const box = logo.getBoundingClientRect();
    const aspect = logo.naturalWidth && logo.naturalHeight
      ? logo.naturalWidth / logo.naturalHeight
      : 990 / 580;
    const imageWidth = Math.min(box.width, box.height * aspect);
    const imageHeight = imageWidth / aspect;
    const imageLeft = box.left + (box.width - imageWidth) / 2;
    const imageTop = box.top + (box.height - imageHeight) / 2;
    const eyeY = imageTop + imageHeight * .44;
    const eyes = [
      { x: imageLeft + imageWidth * .235, y: eyeY },
      { x: imageLeft + imageWidth * .765, y: eyeY }
    ];

    const owlBox = owl.getBoundingClientRect();
    const target = {
      x: owlBox.left + owlBox.width * .5,
      y: owlBox.top + owlBox.height * .5
    };

    laserPaths.forEach((path, index) => {
      const eye = eyes[index];
      path.setAttribute('d', `M ${eye.x.toFixed(1)} ${eye.y.toFixed(1)} L ${target.x.toFixed(1)} ${target.y.toFixed(1)}`);
    });
  }

  function requestLaserUpdate() {
    if (!lasersActive || laserFrame) return;
    laserFrame = requestAnimationFrame(() => {
      laserFrame = 0;
      updateLasers();
    });
  }

  function fireLasers() {
    if (!laserSvg || !owl || !logo) return;
    lasersActive = true;
    owl.classList.add('ad-owl-target');
    updateLasers();
    laserSvg.classList.add('is-visible');
  }

  function scheduleLasers() {
    hideLasers();
    // Let the final logo settle first; then fire from both eye shapes.
    laserTimer = window.setTimeout(fireLasers, 1020);
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
    const scene = scenes[index];
    if (!scene) {
      finishAd();
      return;
    }

    window.clearTimeout(assetTimer);
    loadSceneArt(scene);
    const nextScene = scenes[index + 1];
    if (nextScene) {
      // Fetch at most one scene ahead instead of starting every SVG at page load.
      assetTimer = window.setTimeout(() => {
        if (started && !ad.hidden && scene.classList.contains('is-active')) loadSceneArt(nextScene);
      }, 380);
    }

    scenes.forEach((item, i) => {
      const active = i === index;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-hidden', active ? 'false' : 'true');
    });

    const isFinal = scene.classList.contains('av-ad-final');
    ad.classList.toggle('is-final', isFinal);
    if (isFinal) scheduleLasers();
    else hideLasers();

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
      if (index + 1 < scenes.length) showScene(index + 1);
      else finishAd();
    }, duration);
  }

  function playAd() {
    if (started) return;
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

  function scheduleAd() {
    if (started || introTimer) return;
    // Give the greeting gate and owl badge time to finish their entrance first.
    introTimer = window.setTimeout(playAd, 1150);
  }

  function skipAd() {
    if (!started || ad.hidden) return;
    window.clearTimeout(sceneTimer);
    finishAd();
  }

  // The host card itself flips on click; keep ad controls and clicks inside the
  // screen from bubbling into that unrelated card interaction.
  ad.addEventListener('pointerdown', event => event.stopPropagation());
  ad.addEventListener('click', event => event.stopPropagation());
  skipButton?.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    skipAd();
  });
  replay?.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    started = false;
    playAd();
  });
  document.addEventListener('introDone', scheduleAd, { once: true });
  window.addEventListener('resize', requestLaserUpdate, { passive: true });
  window.addEventListener('scroll', requestLaserUpdate, { passive: true });
  logo?.addEventListener('load', requestLaserUpdate);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !ad.hidden) skipAd();
  });

  // Handles a restored page where the intro has already been dismissed, plus a
  // fallback in case another script prevents the custom introDone event.
  window.addEventListener('load', () => {
    if (!document.body.classList.contains('intro-active')) scheduleAd();
    window.setTimeout(() => {
      if (!started && !document.body.classList.contains('intro-active')) scheduleAd();
    }, 10500);
  }, { once: true });
})();
