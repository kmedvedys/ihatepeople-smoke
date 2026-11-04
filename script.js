(() => {
  document.documentElement.classList.add('js');
  const video = document.querySelector('#hero-video');
  const hero = document.querySelector('.hero');
  const sound = document.querySelector('#sound-button');
  const music = document.querySelector('#second-screen-audio');
  const musicButton = document.querySelector('#music-button');
  const musicSubtitle = document.querySelector('#music-subtitle');
  const mobile = matchMedia('(max-width: 700px)');
  let heroVisible = true;
  video.loop = true;
  video.playsInline = true;
  video.autoplay = true;
  const resumeVideo = () => {
    if (document.visibilityState === 'hidden' || !heroVisible || !video.src || !video.paused) return;
    video.play().catch(() => {});
  };
  const chooseVideo = () => {
    const src = mobile.matches ? 'assets/intro-mobile.mp4' : 'assets/intro-desktop.mp4';
    if (video.dataset.src !== src) {
      video.dataset.src = src;
      video.src = src;
      video.load();
    }
    resumeVideo();
  };
  chooseVideo();
  mobile.addEventListener('change', chooseVideo);
  video.addEventListener('playing', () => {
    hero.classList.add('is-video-playing');
  });
  video.addEventListener('error', () => hero.classList.remove('is-video-playing'));
  video.addEventListener('canplay', resumeVideo, { once: true });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') video.pause();
    else resumeVideo();
  });
  if ('IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      if (heroVisible) resumeVideo();
      else video.pause();
    }, { threshold: 0.01 });
    heroObserver.observe(hero);
  }
  sound.addEventListener('click', async () => {
    const willEnable = video.muted;
    if (willEnable) {
      if (!music.paused) {
        music.pause();
        musicButton.setAttribute('aria-pressed', 'false');
        musicButton.setAttribute('aria-label', 'Включить музыку');
      }
      try { await video.play(); } catch {}
      video.muted = false;
      video.volume = 1;
    } else {
      video.muted = true;
    }
    sound.setAttribute('aria-pressed', String(willEnable));
    sound.setAttribute('aria-label', willEnable ? 'Turn sound off' : 'Turn sound on');
  });

  musicButton.addEventListener('click', async () => {
    if (music.paused) {
      const wasVideoMuted = video.muted;
      video.muted = true;
      sound.setAttribute('aria-pressed', 'false');
      sound.setAttribute('aria-label', 'Turn sound on');
      try {
        await music.play();
        musicButton.setAttribute('aria-pressed', 'true');
        musicButton.setAttribute('aria-label', 'Выключить музыку');
      } catch (error) {
        video.muted = wasVideoMuted;
        musicButton.setAttribute('aria-label', 'Не удалось включить музыку');
      }
      return;
    }
    music.pause();
    musicButton.setAttribute('aria-pressed', 'false');
    musicButton.setAttribute('aria-label', 'Включить музыку');
  });
  music.addEventListener('ended', () => {
    musicButton.setAttribute('aria-pressed', 'false');
    musicButton.setAttribute('aria-label', 'Включить музыку');
  });

  if (music && musicSubtitle) {
    let musicCaptions = [];
    let activeMusicCaption = -2;
    const musicCaptionLeadIn = 3;
    const parseSrtTime = (stamp) => {
      const match = stamp.trim().match(/^(\d{2}):(\d{2}):(\d{2})[,.](\d{3})$/);
      if (!match) return 0;
      return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]) + Number(match[4]) / 1000;
    };
    const updateMusicSubtitle = () => {
      const nextCaption = music.paused || music.ended
        ? -1
        : musicCaptions.findIndex((caption) => music.currentTime + musicCaptionLeadIn >= caption.from && music.currentTime + musicCaptionLeadIn < caption.to);
      if (nextCaption === activeMusicCaption) return;
      activeMusicCaption = nextCaption;
      musicSubtitle.classList.remove('is-visible', 'is-hiding');
      if (nextCaption < 0) {
        if (musicSubtitle.textContent) musicSubtitle.classList.add('is-hiding');
        return;
      }
      musicSubtitle.textContent = musicCaptions[nextCaption].text;
      void musicSubtitle.offsetWidth;
      musicSubtitle.classList.add('is-visible');
    };
    let subtitleFrame = 0;
    const followMusicTimeline = () => {
      updateMusicSubtitle();
      if (!music.paused && !music.ended) {
        subtitleFrame = requestAnimationFrame(followMusicTimeline);
      } else {
        subtitleFrame = 0;
      }
    };
    music.addEventListener('timeupdate', updateMusicSubtitle);
    music.addEventListener('playing', () => {
      updateMusicSubtitle();
      if (!subtitleFrame) subtitleFrame = requestAnimationFrame(followMusicTimeline);
    });
    music.addEventListener('seeked', updateMusicSubtitle);
    music.addEventListener('pause', () => {
      if (subtitleFrame) cancelAnimationFrame(subtitleFrame);
      subtitleFrame = 0;
      updateMusicSubtitle();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && !music.paused && !subtitleFrame) {
        subtitleFrame = requestAnimationFrame(followMusicTimeline);
      }
    });
    fetch('assets/saori-yuki-long-black-hair-ja.srt')
      .then((response) => response.ok ? response.text() : Promise.reject(new Error('SRT unavailable')))
      .then((contents) => {
        musicCaptions = contents.trim().split(/\r?\n(?:[ \t]*\r?\n)+/).flatMap((block) => {
          const lines = block.split(/\r?\n/);
          const timeLineIndex = lines.findIndex((line) => line.includes('-->'));
          if (timeLineIndex < 0) return [];
          const [from, to] = lines[timeLineIndex].split('-->').map(parseSrtTime);
          const text = lines.slice(timeLineIndex + 1).join('\n').trim();
          return text ? [{ from, to, text }] : [];
        });
        updateMusicSubtitle();
      })
      .catch(() => {});
  }

  const nameCaseCard = document.querySelector('#name-case-card');
  const nameCaseBody = document.querySelector('#name-case-body');
  const nameCasePortrait = document.querySelector('#name-case-portrait');
  const nameCaseClose = document.querySelector('#name-case-close');
  const nameEntries = {
    'C. Firth': 'person-colin-firth-cgi-v1.png',
    'S. Lavrov': 'person-sergey-lavrov-cgi-v1.png',
    'K. Bogomolov': 'person-bogomolov-cgi-v1.png',
    'R. Mara': 'person-rooney-mara-cgi-v1.png',
    'T. Leung': 'person-tony-leung-cgi-v1.png',
    'M. Cheung': 'person-maggie-cheung-cgi-v1.png',
    'F. Wong': 'person-faye-wong-cgi-v1.png',
    'K. Medvedev': 'person-kirill-medvedev-cgi-v1.png',
    'H. Bogart': 'person-bogart-cgi-v1.png',
    'C. Eastwood': 'person-eastwood-cgi-v1.png',
    'V. Livanov': 'person-livanov-cgi-v1.png',
    'S. Stone': 'person-sharon-stone-cgi-v1.png',
    'J.-P. Belmondo': 'person-belmondo-cgi-v1.png',
    'B. Bardot': 'person-bardot-cgi-v1.png',
    'A. Hepburn': 'person-audrey-hepburn-cgi-v1.png',
    'J. Brodsky': 'person-brodsky-cgi-v1.png',
    'A. Brody': 'person-adrien-brody-cgi-v1.png',
  };
  const nameButtons = Array.from(document.querySelectorAll('.surname-name'));
  const caseFields = [
    ['Category', 'Кинообраз / свет / композиция'],
    ['Short description', 'Визуальный разбор выбранного эпизода: положение в кадре, свет, направление взгляда и ритм монтажа.'],
    ['Role', 'Материал для визуального разбора'],
    ['Before', 'Сначала фиксируем только то, что видно: план, позу, жест и работу света.'],
    ['After', 'Затем отделяем наблюдение от интерпретации и связываем их с драматургией сцены.'],
    ['Metrics', 'Крупность плана · свет · взгляд · жест · пауза · монтаж'],
    ['Stack', 'Фильм · эпизод · таймкод · источник'],
    ['Tagline', 'Сначала кадр — затем его прочтение.'],
  ];
  let activeNameButton = null;
  let pinnedNameCard = false;
  let nameCardCloseTimer = 0;
  let nameCardHideTimer = 0;
  const placeNameCaseAtButton = (button) => {
    const rect = button.getBoundingClientRect();
    const isMobile = matchMedia('(max-width: 700px)').matches;
    const cardWidth = isMobile ? Math.min(420, window.innerWidth - 24) : Math.min(540, window.innerWidth * 0.43);
    const cardHeight = isMobile
      ? Math.max(340, Math.min(window.innerHeight * 0.78, 700))
      : Math.max(420, Math.min(window.innerHeight * 0.82, 760));
    const anchorX = rect.left + rect.width / 2;
    const anchorY = rect.top + rect.height / 2;
    const left = window.innerWidth - cardWidth - 12;
    const top = isMobile ? 58 : 12;
    const originX = Math.max(14, Math.min(anchorX - left, cardWidth - 14));
    const originY = Math.max(14, Math.min(anchorY - top, cardHeight - 14));
    nameCaseCard.style.setProperty('--case-left', `${left}px`);
    nameCaseCard.style.setProperty('--case-top', `${top}px`);
    nameCaseCard.style.setProperty('--case-origin-x', `${originX}px`);
    nameCaseCard.style.setProperty('--case-origin-y', `${originY}px`);
  };
  const renderNameCase = (name) => {
    nameCaseBody.replaceChildren();
    const header = document.createElement('header');
    header.className = 'name-case-card__header';
    const titleLabel = document.createElement('h3');
    titleLabel.className = 'name-case-card__label';
    titleLabel.textContent = '/ Title';
    const title = document.createElement('h2');
    title.className = 'name-case-card__value name-case-card__title';
    title.id = 'name-case-title';
    title.textContent = name;
    header.append(titleLabel, title);
    nameCaseBody.append(header);
    caseFields.forEach(([label, value]) => {
      const field = document.createElement('section');
      field.className = 'name-case-card__field';
      const heading = document.createElement('h3');
      heading.className = 'name-case-card__label';
      heading.textContent = `/ ${label}`;
      const paragraph = document.createElement('p');
      paragraph.className = 'name-case-card__value';
      paragraph.textContent = value;
      field.append(heading, paragraph);
      nameCaseBody.append(field);
    });
  };
  const closeNameCase = () => {
    if (nameCaseCard.hidden) return;
    const cardRect = nameCaseCard.getBoundingClientRect();
    const portraitRect = nameCasePortrait.getBoundingClientRect();
    if (portraitRect.width && cardRect.width) {
      nameCaseCard.style.setProperty('--case-origin-x', `${portraitRect.left + portraitRect.width / 2 - cardRect.left}px`);
      nameCaseCard.style.setProperty('--case-origin-y', `${portraitRect.top + portraitRect.height / 2 - cardRect.top}px`);
    }
    nameCaseCard.classList.remove('is-open');
    nameCaseCard.classList.add('is-closing');
    nameCaseCard.setAttribute('aria-hidden', 'true');
    nameButtons.forEach((button) => button.setAttribute('aria-expanded', 'false'));
    activeNameButton = null;
    pinnedNameCard = false;
    window.clearTimeout(nameCardHideTimer);
    nameCardHideTimer = window.setTimeout(() => {
      if (!nameCaseCard.classList.contains('is-open')) nameCaseCard.hidden = true;
    }, 1550);
  };
  const showNameCase = (button, pinned = false) => {
    const name = button.textContent.trim();
    const portrait = nameEntries[name];
    if (!portrait) return;
    window.clearTimeout(nameCardCloseTimer);
    window.clearTimeout(nameCardHideTimer);
    nameButtons.forEach((item) => item.setAttribute('aria-expanded', String(item === button)));
    activeNameButton = button;
    pinnedNameCard = pinned;
    placeNameCaseAtButton(button);
    nameCasePortrait.src = `assets/${portrait}`;
    nameCasePortrait.alt = `Стилизованный портрет: ${name}`;
    renderNameCase(name);
    nameCaseCard.classList.remove('is-closing');
    if (nameCaseCard.hidden) {
      nameCaseCard.hidden = false;
      nameCaseCard.classList.remove('is-open');
      requestAnimationFrame(() => requestAnimationFrame(() => nameCaseCard.classList.add('is-open')));
    } else {
      nameCaseCard.classList.add('is-open');
    }
    nameCaseCard.setAttribute('aria-hidden', 'false');
  };
  const scheduleNameCardClose = () => {
    window.clearTimeout(nameCardCloseTimer);
    nameCardCloseTimer = window.setTimeout(() => {
      if (!pinnedNameCard) closeNameCase();
    }, 700);
  };
  nameButtons.forEach((button) => {
    button.setAttribute('role', 'button');
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-controls', 'name-case-card');
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', () => {
      if (pinnedNameCard && activeNameButton === button) {
        closeNameCase();
      } else {
        showNameCase(button, true);
      }
    });
    button.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        button.click();
      }
    });
  });
  if (nameCaseCard && nameCaseClose) {
    nameCaseCard.addEventListener('pointerenter', () => window.clearTimeout(nameCardCloseTimer));
    nameCaseCard.addEventListener('pointerleave', scheduleNameCardClose);
    nameCaseClose.addEventListener('click', closeNameCase);
    nameCaseClose.addEventListener('pointerenter', () => window.clearTimeout(nameCardCloseTimer));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeNameCase();
    });
  }

  const introSubtitle = document.querySelector('#intro-subtitle');
  if (introSubtitle) {
    const captions = [
      { from: 13, to: 15.7, text: 'Мы все еще партнеры?' },
      { from: 16, to: 18.8, text: 'Мы работаем уже 155 недель' },
      { from: 19.1, to: 21.6, text: 'Сегодня мы впервые сидим рядом' },
      { from: 21.9, to: 24.2, text: 'Мы редко видимся' },
      { from: 24.5, to: 27.8, text: 'Я знаю, как трудно контролировать влечение' },
      { from: 28.1, to: 30.95, text: 'Партнеры не должны давать волю чувствам' },
    ];
    let activeCaption = -2;
    const introStartedAt = performance.now();
    let videoHasPlayed = false;
    video.addEventListener('playing', () => { videoHasPlayed = true; });
    const updateIntroCaption = () => {
      const fallbackTime = (performance.now() - introStartedAt) / 1000;
      const currentTime = videoHasPlayed ? Math.max(video.currentTime, fallbackTime) : fallbackTime;
      const nextCaption = captions.findIndex((item) => currentTime >= item.from && currentTime < item.to);
      if (nextCaption === activeCaption) return;
      activeCaption = nextCaption;
      introSubtitle.classList.remove('is-visible', 'is-hiding');
      if (nextCaption < 0) {
        introSubtitle.classList.add('is-hiding');
        return;
      }
      introSubtitle.textContent = captions[nextCaption].text;
      void introSubtitle.offsetWidth;
      introSubtitle.classList.add('is-visible');
    };
    window.setInterval(updateIntroCaption, 200);
  }
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const glitchMarkers = [.5];
    const playedMarkers = new Set();
    let lastGlitchTime = 0;
    let glitchRemoveTimer = 0;
    const triggerMidpointGlitch = () => {
      if (document.visibilityState !== 'visible') return;
      hero.classList.remove('is-glitching');
      void hero.offsetWidth;
      hero.classList.add('is-glitching');
      window.clearTimeout(glitchRemoveTimer);
      glitchRemoveTimer = window.setTimeout(() => hero.classList.remove('is-glitching'), 790);
    };
    video.addEventListener('timeupdate', () => {
      if (!video.duration) return;
      lastGlitchTime = video.currentTime;
      const progress = video.currentTime / video.duration;
      glitchMarkers.forEach((marker) => {
        if (progress >= marker && !playedMarkers.has(marker)) {
          playedMarkers.add(marker);
          triggerMidpointGlitch();
        }
      });
    });
  }
  const nextSection = document.querySelector('.next-section');
  const codeScreen = document.querySelector('.code-screen');
  if (nextSection && codeScreen) {
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const codeLines = [
      'const frame = {',
      '  light: "carmine afterimage",',
      '  shadow: "soft, almost black",',
      '  camera: "wait one beat",',
      '  time: "held between cuts",',
      '  grain: "visible in the dark",',
      '  memory: "not quite in focus",',
      '  silence: "a part of the score",',
      '  reflection: "another way to look",',
      '  scene: "begin again"',
      '};',
      '',
      'render(frame, { movement: "slow", contrast: "low" });',
    ];
    const horizontalCode = codeLines.join('   ');
    const codeFontSize = mobile.matches ? 6 : Math.max(6.1, Math.min(window.innerWidth * .005, 8.4));
    const codeCharsPerLine = Math.ceil((window.innerWidth * .92) / (codeFontSize * .58));
    const codeLinesPerScreen = Math.ceil((nextSection.clientHeight || window.innerHeight) / (codeFontSize * 1.08));
    const codeRepeatCount = Math.max(18, Math.min(180, Math.ceil((codeCharsPerLine * codeLinesPerScreen * 1.18) / horizontalCode.length)));
    const source = Array.from({ length: codeRepeatCount }, () => horizontalCode).join('   ');
    let started = false;
    const startCode = () => {
      if (started) return;
      started = true;
      codeScreen.textContent = source;
      if (reduceMotion) {
        codeScreen.classList.add('is-holding');
        return;
      }
      const runCycle = () => {
        codeScreen.classList.remove('is-holding', 'is-disappearing');
        codeScreen.classList.add('is-appearing');
        window.setTimeout(() => {
          codeScreen.classList.remove('is-appearing');
          codeScreen.classList.add('is-holding');
          window.setTimeout(() => {
            codeScreen.classList.remove('is-holding');
            codeScreen.classList.add('is-disappearing');
            window.setTimeout(runCycle, 14000);
          }, 4000);
        }, 12000);
      };
      runCycle();
    };
    const syncCodeHeight = () => {
      codeScreen.style.height = `${nextSection.clientHeight}px`;
    };
    syncCodeHeight();
    window.addEventListener('resize', syncCodeHeight, { passive: true });
    if ('ResizeObserver' in window) {
      const layoutObserver = new ResizeObserver(syncCodeHeight);
      layoutObserver.observe(nextSection);
    }
    if ('IntersectionObserver' in window) {
      const codeObserver = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          startCode();
          codeObserver.disconnect();
        }
      }, { threshold: 0.01 });
      codeObserver.observe(nextSection);
    } else {
      startCode();
    }
  }
  const particleCursor = document.querySelector('#particle-cursor');
  const finePointer = matchMedia('(pointer: fine)');
  if (particleCursor && finePointer.matches) {
    const context = particleCursor.getContext('2d');
    const reduceCursorMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const particles = [];
    const particleSprite = document.createElement('canvas');
    particleSprite.width = 96;
    particleSprite.height = 48;
    const spriteContext = particleSprite.getContext('2d');
    const softParticle = spriteContext.createRadialGradient(48, 24, 1, 48, 24, 46);
    softParticle.addColorStop(0, 'rgba(255,255,255,.9)');
    softParticle.addColorStop(.2, 'rgba(255,255,255,.58)');
    softParticle.addColorStop(.58, 'rgba(255,255,255,.18)');
    softParticle.addColorStop(1, 'rgba(255,255,255,0)');
    spriteContext.fillStyle = softParticle;
    spriteContext.fillRect(0, 0, 96, 48);
    let cursorX = -100;
    let cursorY = -100;
    let renderedCursor = null;
    let hasCursor = false;
    let frameRequested = false;
    let pixelRatio = 1;
    let previousPointer = null;
    let lastCursorFrame = 0;
    const maxParticles = 220;
    const resizeCursor = () => {
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.25);
      particleCursor.width = Math.round(window.innerWidth * pixelRatio);
      particleCursor.height = Math.round(window.innerHeight * pixelRatio);
      particleCursor.style.width = `${window.innerWidth}px`;
      particleCursor.style.height = `${window.innerHeight}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      particles.length = 0;
      renderedCursor = null;
      drawCursor();
    };
    const addParticle = (x, y, vx, vy, size, life) => {
      particles.push({ x, y, vx, vy, size, life, age: 0 });
    };
    const requestCursorFrame = () => {
      if (frameRequested) return;
      frameRequested = true;
      requestAnimationFrame(drawCursor);
    };
    const drawCursor = (now) => {
      const time = typeof now === 'number' ? now : performance.now();
      if (time - lastCursorFrame < 32 && particles.length) {
        requestAnimationFrame(drawCursor);
        return;
      }
      frameRequested = false;
      const dt = Math.min((time - (drawCursor.lastTime || time)) / 1000, 0.04);
      drawCursor.lastTime = time;
      lastCursorFrame = time;
      let dirtyLeft = Infinity;
      let dirtyTop = Infinity;
      let dirtyRight = -Infinity;
      let dirtyBottom = -Infinity;
      const includeBounds = (x, y, padX, padY = padX) => {
        dirtyLeft = Math.min(dirtyLeft, x - padX);
        dirtyTop = Math.min(dirtyTop, y - padY);
        dirtyRight = Math.max(dirtyRight, x + padX);
        dirtyBottom = Math.max(dirtyBottom, y + padY);
      };
      if (renderedCursor) includeBounds(renderedCursor.x, renderedCursor.y, 8);
      if (hasCursor) includeBounds(cursorX, cursorY, 8);
      particles.forEach((particle) => {
        const radius = particle.size * 6;
        includeBounds(particle.x, particle.y, radius);
      });
      context.fillStyle = '#fff';
      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const particle = particles[i];
        const previousX = particle.x;
        const previousY = particle.y;
        particle.age += dt;
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.vx *= 0.992;
        particle.vy *= 0.992;
        const progress = Math.min(particle.age / particle.life, 1);
        const radius = particle.size * 6;
        includeBounds(previousX, previousY, radius);
        includeBounds(particle.x, particle.y, radius);
        if (progress >= 1) {
          particles.splice(i, 1);
        }
      }
      if (dirtyLeft < dirtyRight && dirtyTop < dirtyBottom) {
        context.clearRect(
          Math.max(0, dirtyLeft - 2),
          Math.max(0, dirtyTop - 2),
          Math.min(window.innerWidth, dirtyRight + 2) - Math.max(0, dirtyLeft - 2),
          Math.min(window.innerHeight, dirtyBottom + 2) - Math.max(0, dirtyTop - 2),
        );
        for (const particle of particles) {
          const progress = Math.min(particle.age / particle.life, 1);
          context.globalAlpha = Math.pow(1 - progress, 1.8) * 0.62;
          const width = particle.size * 12;
          const height = particle.size * 7;
          context.drawImage(particleSprite, particle.x - width / 2, particle.y - height / 2, width, height);
        }
      }
      context.globalAlpha = 1;
      if (hasCursor) {
        context.beginPath();
        context.arc(cursorX, cursorY, 3.4, 0, Math.PI * 2);
        context.fill();
        renderedCursor = { x: cursorX, y: cursorY };
      } else {
        renderedCursor = null;
      }
      if (particles.length) requestCursorFrame();
    };
    particleCursor.style.display = 'block';
    resizeCursor();
    window.addEventListener('resize', resizeCursor, { passive: true });
    window.addEventListener('pointermove', (event) => {
      if (event.pointerType === 'touch') return;
      cursorX = event.clientX;
      cursorY = event.clientY;
      hasCursor = true;
      if (previousPointer && !reduceCursorMotion) {
        const dx = cursorX - previousPointer.x;
        const dy = cursorY - previousPointer.y;
        const distance = Math.hypot(dx, dy);
        const count = Math.min(Math.ceil(distance / 5), 24);
        for (let index = 0; index < count; index += 1) {
          const t = (index + 1) / count;
          const x = previousPointer.x + dx * t;
          const y = previousPointer.y + dy * t;
          const spread = 0.65 + Math.random() * 1.8;
          const directionX = distance ? -dx / distance : 0;
          const directionY = distance ? -dy / distance : 0;
          const speed = 150 + Math.random() * 240;
          addParticle(
            x,
            y,
            directionX * speed + (Math.random() - 0.5) * 34,
            directionY * speed + (Math.random() - 0.5) * 28,
            spread,
            0.38 + Math.random() * 0.45,
          );
        }
        if (particles.length > maxParticles) particles.splice(0, particles.length - maxParticles);
      }
      previousPointer = { x: cursorX, y: cursorY };
      requestCursorFrame();
    }, { passive: true });
    window.addEventListener('pointerleave', () => {
      hasCursor = false;
      previousPointer = null;
      requestCursorFrame();
    }, { passive: true });
  }
  video.addEventListener('timeupdate', () => {
    if (video.duration && video.currentTime >= video.duration - 0.75) {
      hero.classList.add('is-ended');
    }
  });
})();
