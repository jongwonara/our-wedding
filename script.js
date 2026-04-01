/**
 * Nature Green Wedding Invitation
 * Korean Mobile 청첩장 - Script
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════
     Utility Helpers
     ═══════════════════════════════════════════ */

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  function formatDate(dateStr, timeStr) {
    const d = new Date(`${dateStr}T${timeStr}:00`);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const date = d.getDate();
    const day = days[d.getDay()];
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const period = hours < 12 ? '오전' : '오후';
    const h12 = hours % 12 || 12;
    const minuteStr = minutes > 0 ? ` ${minutes}분` : '';
    return `${year}년 ${month}월 ${date}일 ${day}요일 ${period} ${h12}시${minuteStr}`;
  }

  function getWeddingDateTime() {
    return new Date(`${CONFIG.wedding.date}T${CONFIG.wedding.time}:00`);
  }

  /* ═══════════════════════════════════════════
     Image Auto-Detection
     ═══════════════════════════════════════════ */

  function loadImagesFromFolder(folder, maxAttempts = 50) {
    return new Promise(resolve => {
        const images = [];
        let current = 1;
        let consecutiveFails = 0;

        function tryNext() {
            if (current > maxAttempts || consecutiveFails >= 3) {
                resolve(images);
                return;
            }
            const img = new Image();
            const path = `images/${folder}/${current}.jpg`;
            img.onload = function() {
                images.push(path);
                consecutiveFails = 0;
                current++;
                tryNext();
            };
            img.onerror = function() {
                consecutiveFails++;
                current++;
                tryNext();
            };
            img.src = path;
        }

        tryNext();
    });
  }

  /* ═══════════════════════════════════════════
     Toast
     ═══════════════════════════════════════════ */

  let toastTimer = null;
  function showToast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2500);
  }

  /* ═══════════════════════════════════════════
     Clipboard
     ═══════════════════════════════════════════ */

  async function copyToClipboard(text, successMsg) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0;left:-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      showToast(successMsg || '복사되었습니다');
    } catch {
      showToast('복사에 실패했습니다');
    }
  }

  /* ═══════════════════════════════════════════
     OG Meta Tags
     ═══════════════════════════════════════════ */

  function setMetaTags() {
    const m = CONFIG.meta;
    document.title = m.title;
    const setMeta = (attr, val, content) => {
      const el = document.querySelector(`meta[${attr}="${val}"]`);
      if (el) el.setAttribute('content', content);
    };
    setMeta('property', 'og:title', m.title);
    setMeta('property', 'og:description', m.description);
    setMeta('property', 'og:image', 'https://jongwonara.github.io/images/og/1.jpg');
    setMeta('name', 'description', m.description);
  }

  /* ═══════════════════════════════════════════
     Curtain
     ═══════════════════════════════════════════ */

  function initCurtain() {
    const curtain = $('#curtain');
    const btn = $('#curtainBtn');
    const namesEl = $('#curtainNames');

    // If useCurtain is false, skip the curtain entirely
    if (CONFIG.useCurtain === false) {
      curtain.style.display = 'none';
      initFallingLeaves();
      return;
    }

    namesEl.textContent = `${CONFIG.groom.name}  &  ${CONFIG.bride.name}`;

    // 커튼 더블탭 줌 방지
    let lastTapCurtain = 0;
    curtain.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTapCurtain < 300) {
        e.preventDefault();
      }
      lastTapCurtain = now;
    }, { passive: false });

    btn.addEventListener('click', () => {
      curtain.classList.add('is-open');
      document.body.classList.remove('no-scroll');
      setTimeout(() => {
        curtain.classList.add('is-hidden');
        initFallingLeaves();
      }, 1400);
    });

    document.body.classList.add('no-scroll');
  }

  /* ═══════════════════════════════════════════
     Falling Leaves Animation
     ═══════════════════════════════════════════ */

  function initFallingLeaves() {
    const canvas = $('#leafCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    const leaves = [];
    const LEAF_COUNT = 20;

    // Leaf color palette: green and golden tones
    const leafColors = [
      { fill: 'rgba(139, 158, 126, 0.6)', stroke: 'rgba(74, 94, 59, 0.3)' },   // sage green
      { fill: 'rgba(74, 94, 59, 0.5)', stroke: 'rgba(58, 75, 46, 0.3)' },       // forest green
      { fill: 'rgba(168, 184, 158, 0.5)', stroke: 'rgba(139, 158, 126, 0.3)' },  // light sage
      { fill: 'rgba(180, 165, 120, 0.5)', stroke: 'rgba(139, 115, 85, 0.3)' },   // golden
      { fill: 'rgba(160, 175, 130, 0.5)', stroke: 'rgba(100, 120, 70, 0.3)' },   // yellow-green
    ];

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    resize();
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });

    class Leaf {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height * -1 : -30;
        this.size = 10 + Math.random() * 14;
        this.speedY = 0.4 + Math.random() * 0.8;
        this.speedX = -0.2 + Math.random() * 0.4;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.025;
        this.oscillateAmp = 25 + Math.random() * 35;
        this.oscillateSpeed = 0.008 + Math.random() * 0.015;
        this.oscillateOffset = Math.random() * Math.PI * 2;
        this.opacity = 0.15 + Math.random() * 0.35;
        this.t = 0;
        this.colorSet = leafColors[Math.floor(Math.random() * leafColors.length)];
        this.leafType = Math.floor(Math.random() * 3); // 3 leaf shape variants
      }

      update() {
        this.t++;
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.t * this.oscillateSpeed + this.oscillateOffset) * 0.4;
        this.rotation += this.rotSpeed;
        if (this.y > height + 30) this.reset();
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;

        const s = this.size;

        if (this.leafType === 0) {
          // Oval leaf
          ctx.beginPath();
          ctx.moveTo(0, -s * 0.5);
          ctx.bezierCurveTo(s * 0.5, -s * 0.4, s * 0.5, s * 0.4, 0, s * 0.5);
          ctx.bezierCurveTo(-s * 0.5, s * 0.4, -s * 0.5, -s * 0.4, 0, -s * 0.5);
          ctx.fillStyle = this.colorSet.fill;
          ctx.fill();
          // Vein
          ctx.beginPath();
          ctx.moveTo(0, -s * 0.45);
          ctx.lineTo(0, s * 0.45);
          ctx.strokeStyle = this.colorSet.stroke;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        } else if (this.leafType === 1) {
          // Pointed leaf
          ctx.beginPath();
          ctx.moveTo(0, -s * 0.6);
          ctx.bezierCurveTo(s * 0.4, -s * 0.2, s * 0.35, s * 0.3, 0, s * 0.6);
          ctx.bezierCurveTo(-s * 0.35, s * 0.3, -s * 0.4, -s * 0.2, 0, -s * 0.6);
          ctx.fillStyle = this.colorSet.fill;
          ctx.fill();
          // Vein
          ctx.beginPath();
          ctx.moveTo(0, -s * 0.5);
          ctx.lineTo(0, s * 0.5);
          ctx.strokeStyle = this.colorSet.stroke;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        } else {
          // Round leaf
          ctx.beginPath();
          ctx.ellipse(0, 0, s * 0.35, s * 0.45, 0, 0, Math.PI * 2);
          ctx.fillStyle = this.colorSet.fill;
          ctx.fill();
          // Vein
          ctx.beginPath();
          ctx.moveTo(0, -s * 0.4);
          ctx.lineTo(0, s * 0.4);
          ctx.moveTo(0, -s * 0.1);
          ctx.lineTo(s * 0.2, -s * 0.25);
          ctx.moveTo(0, 0.1);
          ctx.lineTo(-s * 0.2, -s * 0.05);
          ctx.strokeStyle = this.colorSet.stroke;
          ctx.lineWidth = 0.4;
          ctx.stroke();
        }

        ctx.restore();
      }
    }

    for (let i = 0; i < LEAF_COUNT; i++) {
      leaves.push(new Leaf());
    }

    function animate() {
      if (document.hidden) {
        requestAnimationFrame(animate);
        return;
      }
      ctx.clearRect(0, 0, width, height);
      leaves.forEach(l => {
        l.update();
        l.draw();
      });
      requestAnimationFrame(animate);
    }

    animate();
  }

  /* ═══════════════════════════════════════════
     Hero Section
     ═══════════════════════════════════════════ */

  function initHero() {
    $('#heroPhoto').src = 'images/hero/1.jpg';
    $('#heroNames').textContent = `${CONFIG.groom.name}  ·  ${CONFIG.bride.name}`;
    $('#heroDate').textContent = formatDate(CONFIG.wedding.date, CONFIG.wedding.time);
    $('#heroVenue').innerHTML = `${CONFIG.wedding.venue}<br>${CONFIG.wedding.hall}`;

    // 페이지 로드 시 viewport 높이를 CSS 변수로 딱 한 번 고정
    // 주소창/하단바가 사라져도 hero 높이가 변하지 않음
    function setVh() {
      document.documentElement.style.setProperty('--vh100', window.innerHeight + 'px');
    }
    setVh();
    // 가로/세로 회전 시에만 다시 측정
    window.addEventListener('orientationchange', function() {
      setTimeout(setVh, 300);
    });
  }

  /* ═══════════════════════════════════════════
     Countdown
     ═══════════════════════════════════════════ */

  function initCountdown() {
    const target = getWeddingDateTime();

    function update() {
      const now = new Date();
      const diff = target - now;

      const labelEl = $('#countdownLabel');

      if (diff <= 0) {
        $('#countDays').textContent = '0';
        $('#countHours').textContent = '0';
        $('#countMinutes').textContent = '0';
        $('#countSeconds').textContent = '0';
        labelEl.textContent = '결혼식이 시작되었습니다';
        return;
      }

      const totalDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
      labelEl.textContent = `결혼식까지 D-${totalDays}`;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      $('#countDays').textContent = days;
      $('#countHours').textContent = String(hours).padStart(2, '0');
      $('#countMinutes').textContent = String(minutes).padStart(2, '0');
      $('#countSeconds').textContent = String(seconds).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
  }

  /* ═══════════════════════════════════════════
     Greeting Section
     ═══════════════════════════════════════════ */

  function initGreeting() {
    $('#greetingTitle').textContent = CONFIG.greeting.title;
    $('#greetingContent').textContent = CONFIG.greeting.content;

    const g = CONFIG.groom;
    const b = CONFIG.bride;

    function parentLine(father, mother, fatherDeceased, motherDeceased) {
      const fd = fatherDeceased ? ' deceased' : '';
      const md = motherDeceased ? ' deceased' : '';
      return `<span class="${fd}">${father}</span> · <span class="${md}">${mother}</span>`;
    }

    const parentsHTML = `
      <div class="parent-row">
        ${parentLine(g.father, g.mother, g.fatherDeceased, g.motherDeceased)}
        의 장남 <span class="child-name">${g.name}</span>
      </div>
      <div class="parent-row">
        ${parentLine(b.father, b.mother, b.fatherDeceased, b.motherDeceased)}
        의 장녀 <span class="child-name">${b.name}</span>
      </div>
    `;

    $('#greetingParents').innerHTML = parentsHTML;
  }

  /* ═══════════════════════════════════════════
     Calendar Section
     ═══════════════════════════════════════════ */

  function initCalendar() {
    const dt = getWeddingDateTime();
    const year = dt.getFullYear();
    const month = dt.getMonth();
    const weddingDay = dt.getDate();

    const grid = $('#calendarGrid');

    // Header
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    grid.innerHTML = `<div class="calendar__header">${monthNames[month]} ${year}</div>`;

    // Weekdays
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const wdRow = document.createElement('div');
    wdRow.className = 'calendar__weekdays';
    weekdays.forEach(wd => {
      const el = document.createElement('span');
      el.className = 'calendar__weekday';
      el.textContent = wd;
      wdRow.appendChild(el);
    });
    grid.appendChild(wdRow);

    // Days
    const daysContainer = document.createElement('div');
    daysContainer.className = 'calendar__days';

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('span');
      empty.className = 'calendar__day is-empty';
      daysContainer.appendChild(empty);
    }

    for (let d = 1; d <= lastDate; d++) {
      const dayEl = document.createElement('span');
      dayEl.className = 'calendar__day';
      if (d === weddingDay) dayEl.classList.add('is-today');
      dayEl.textContent = d;
      daysContainer.appendChild(dayEl);
    }

    grid.appendChild(daysContainer);

    // Google Calendar link
    const startDate = dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDt = new Date(dt.getTime() + 2 * 60 * 60 * 1000);
    const endDate = endDt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(CONFIG.groom.name + ' ♥ ' + CONFIG.bride.name + ' 결혼식')}&dates=${startDate}/${endDate}&location=${encodeURIComponent(CONFIG.wedding.venue + ' ' + CONFIG.wedding.address)}&details=${encodeURIComponent('결혼식에 초대합니다.')}`;
    $('#googleCalBtn').href = gcalUrl;

    // ICS download (Apple Calendar)
    $('#icsDownloadBtn').addEventListener('click', () => {
      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Wedding//Invitation//KO',
        'BEGIN:VEVENT',
        `DTSTART:${startDate}`,
        `DTEND:${endDate}`,
        `SUMMARY:${CONFIG.groom.name} ♥ ${CONFIG.bride.name} 결혼식`,
        `LOCATION:${CONFIG.wedding.venue} ${CONFIG.wedding.address}`,
        'DESCRIPTION:결혼식에 초대합니다.',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'wedding.ics';
      a.click();
      URL.revokeObjectURL(url);
      showToast('캘린더 파일이 다운로드됩니다');
    });
  }

  /* ═══════════════════════════════════════════
     Gallery Section
     ═══════════════════════════════════════════ */

  function initGallery(galleryImages) {
    const grid = $('#galleryGrid');
    const placeholder = grid.querySelector('.loading-placeholder');
    if (placeholder) placeholder.remove();

    if (galleryImages.length === 0) {
      const gallerySection = $('#gallery');
      if (gallerySection) gallerySection.style.display = 'none';
      return;
    }

    galleryImages.forEach((src, i) => {
      const div = document.createElement('div');
      div.className = 'gallery__item animate-item';
      div.setAttribute('data-animate', 'scale-in');
      div.innerHTML = `<img src="${src}" alt="갤러리 사진 ${i + 1}" loading="lazy">`;
      div.addEventListener('click', () => openPhotoModal(galleryImages, i));
      grid.appendChild(div);
    });
  }

  /* ═══════════════════════════════════════════
     Photo Modal (with swipe)
     ═══════════════════════════════════════════ */

  let modalImages = [];
  let modalIndex = 0;
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let touchEndY = 0;

  let savedScrollY = 0;

  function openPhotoModal(images, index) {
    modalImages = images;
    modalIndex = index;
    showModalImage();
    $('#photoModal').classList.add('is-open');
    savedScrollY = window.scrollY;
    document.body.classList.add('no-scroll');
    document.body.style.top = `-${savedScrollY}px`;
  }

  function closePhotoModal() {
    $('#photoModal').classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    document.body.style.top = '';
    window.scrollTo(0, savedScrollY);
  }

  function showModalImage() {
    const img = $('#modalImg');
    img.src = modalImages[modalIndex];
    $('#modalCounter').textContent = `${modalIndex + 1} / ${modalImages.length}`;

    $('#modalPrev').style.display = modalIndex > 0 ? '' : 'none';
    $('#modalNext').style.display = modalIndex < modalImages.length - 1 ? '' : 'none';
  }

  function modalNavigate(dir) {
    const newIndex = modalIndex + dir;
    if (newIndex >= 0 && newIndex < modalImages.length) {
      modalIndex = newIndex;
      showModalImage();
    }
  }

  function initPhotoModal() {
    $('#modalClose').addEventListener('click', closePhotoModal);

  // 더블탭 줌 방지
    let lastTap = 0;
    $('#photoModal').addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTap < 300) {
        e.preventDefault();  // 300ms 내 두 번째 탭 → 줌 차단
      }
      lastTap = now;
    }, { passive: false });  // passive: false 필수 (preventDefault 사용하므로)

    $('#modalPrev').addEventListener('click', () => modalNavigate(-1));
    $('#modalNext').addEventListener('click', () => modalNavigate(1));

    const modal = $('#photoModal');
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.id === 'modalContainer') {
        closePhotoModal();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('is-open')) return;
      if (e.key === 'Escape') closePhotoModal();
      if (e.key === 'ArrowLeft') modalNavigate(-1);
      if (e.key === 'ArrowRight') modalNavigate(1);
    });

    // Swipe support
    const container = $('#modalContainer');

    container.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    // 핀치줌(두 손가락) 방지
    container.addEventListener('touchmove', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });

    container.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    }, { passive: true });
  }

  function handleSwipe() {
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    const minSwipe = 50;

    if (Math.abs(diffX) < minSwipe || Math.abs(diffX) < Math.abs(diffY)) return;

    if (diffX > 0) {
      modalNavigate(1);  // swipe left -> next
    } else {
      modalNavigate(-1); // swipe right -> prev
    }
  }

  /* ═══════════════════════════════════════════
     Location Section
     ═══════════════════════════════════════════ */

  function initLocation() {
    const w = CONFIG.wedding;
    $('#locationVenue').textContent = w.venue;
    $('#locationHall').textContent = w.hall;
    $('#locationAddress').textContent = w.address;
    $('#locationTel').textContent = w.tel ? `Tel. ${w.tel}` : '';
    $('#locationMapImg').src = 'images/location/1.jpg';
    $('#kakaoMapBtn').href = w.mapLinks.kakao || '#';
    $('#naverMapBtn').href = w.mapLinks.naver || '#';

    $('#copyAddressBtn').addEventListener('click', () => {
      copyToClipboard(w.address, '주소가 복사되었습니다');
    });
  }

  /* ═══════════════════════════════════════════
     Account Section (축의금)
     ═══════════════════════════════════════════ */

  function renderAccounts(accounts, containerId) {
    const container = $(`#${containerId}`);
    accounts.forEach((acc) => {
      const item = document.createElement('div');
      item.className = 'account-item';
      item.innerHTML = `
        <div class="account-item__info">
          <div class="account-item__role">${acc.role}</div>
          <div class="account-item__detail">
            <span class="account-item__name">${acc.name || ''}</span>
            ${acc.bank} ${acc.number}
          </div>
        </div>
        <button class="account-item__copy" data-account="${acc.bank} ${acc.number} ${acc.name || ''}">
          복사
        </button>
      `;
      container.appendChild(item);
    });
  }

  function initAccordion(triggerId, panelId) {
    const trigger = $(`#${triggerId}`);
    const panel = $(`#${panelId}`);

    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', !expanded);

      if (!expanded) {
        panel.style.maxHeight = panel.scrollHeight + 'px';
      } else {
        panel.style.maxHeight = '0';
      }
    });
  }

  function initAccounts() {
    renderAccounts(CONFIG.accounts.groom, 'groomAccountList');
    renderAccounts(CONFIG.accounts.bride, 'brideAccountList');

    initAccordion('groomAccordion', 'groomAccordionPanel');
    initAccordion('brideAccordion', 'brideAccordionPanel');

    // Copy account delegates
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.account-item__copy');
      if (!btn) return;
      const text = btn.dataset.account;
      copyToClipboard(text, '계좌번호가 복사되었습니다');
    });
  }

  /* ═══════════════════════════════════════════
     Footer
     ═══════════════════════════════════════════ */

  function initFooter() {
    const dt = getWeddingDateTime();
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    $('#footerText').textContent = `${CONFIG.groom.name} & ${CONFIG.bride.name} — ${year}.${month}.${day}`;
  }

  /* ═══════════════════════════════════════════
     Loading Placeholders
     ═══════════════════════════════════════════ */

  function showLoadingPlaceholders() {
    const storyPhotos = $('#storyPhotos');
    const galleryGrid = $('#galleryGrid');

    const placeholderHTML = '<div class="loading-placeholder"><span class="loading-dot"></span><span class="loading-dot"></span><span class="loading-dot"></span></div>';

    if (storyPhotos) storyPhotos.innerHTML = placeholderHTML;
    if (galleryGrid) galleryGrid.innerHTML = placeholderHTML;
  }

  /* ═══════════════════════════════════════════
     Scroll Animations (IntersectionObserver)
     ═══════════════════════════════════════════ */

  function initScrollAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    // Observe initial static items
    $$('.animate-item').forEach((el) => observer.observe(el));

    // Re-observe after dynamic content is added (MutationObserver)
    const mutObs = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          if (node.classList && node.classList.contains('animate-item')) {
            observer.observe(node);
          }
          if (node.querySelectorAll) {
            node.querySelectorAll('.animate-item').forEach((el) => observer.observe(el));
          }
        });
      });
    });

    mutObs.observe(document.body, { childList: true, subtree: true });
  }

  /* ═══════════════════════════════════════════
     RSVP - 참석 여부
     ═══════════════════════════════════════════ */

  /**
   * ★ Google 폼 연결 방법 ★
   * 1. Google 폼을 만들고 항목 순서를 아래와 맞게 설정하세요:
   *    항목1: 어느 측 하객 (객관식)
   *    항목2: 참석여부 (객관식)
   *    항목3: 식사여부 (객관식)
   *    항목4: 성함 (단답형)
   *    항목5: 동행인 수 (단답형)
   *    항목6: 전달사항 (장문형)
   *
   * 2. 폼 URL에서 ID를 복사하세요:
   *    https://docs.google.com/forms/d/e/1FAIpQLSevS704mNvwIRYybDC3-9k_xzb6CtyqX1DEOKevV57SXam8MQ/viewform?usp=header
   *
   * 3. 각 항목의 entry ID 확인 방법:
   *    폼 미리보기 페이지에서 F12 → 개발자 도구 → 항목 클릭 후 name="entry.XXXXXXX" 확인
   *
   * 4. 아래 GOOGLE_FORM 설정을 채워주세요:
   */
  const GOOGLE_FORM = {
    formId: '1FAIpQLSevS704mNvwIRYybDC3-9k_xzb6CtyqX1DEOKevV57SXam8MQ',
    entries: {
      attend:  'entry.877086558',     // ← 참석여부
      side:    'entry.1498135098',    // ← 어느 측 하객
      meal:    'entry.1424661284',    // ← 식사 여부
      name:    'entry.2606285',       // ← 성함
      guests:  'entry.1211118885',    // ← 동행인 수
      message: 'entry.1881827127',    // ← 전달사항
    }
  };

  function initRSVP() {
    const popup  = $('#rsvpPopup');
    const modal  = $('#rsvpModal');
    const openBtn = $('#rsvpOpenBtn'); // 섹션 내 버튼

    // ── 팝업 열기 (오늘 보지않기 체크)
    const skipKey = 'rsvp_skip_date';
    const today = new Date().toDateString();
    const skipped = localStorage.getItem(skipKey);

    function openPopup() {
      popup.classList.add('is-open');
      document.body.classList.add('no-scroll');
      // 팝업 정보 채우기
      const w = CONFIG.wedding;
      const g = CONFIG.groom;
      const b = CONFIG.bride;
      $('#rsvpPopupNames').innerHTML = `♡ 신랑 <strong>${g.name}</strong>, 신부 <strong>${b.name}</strong>`;
      $('#rsvpPopupDate').textContent  = `☐ ${formatDate(w.date, w.time)}`;
      $('#rsvpPopupVenue').textContent = `▶ ${w.venue} ${w.hall}`;
    }

    function closePopup() {
      popup.classList.remove('is-open');
      document.body.classList.remove('no-scroll');
    }

    function openModal() {
      closePopup();
      modal.classList.add('is-open');
      document.body.classList.add('no-scroll');
    }

    function closeModal() {
      modal.classList.remove('is-open');
      document.body.classList.remove('no-scroll');
    }

    // 커튼이 닫힌 후 1.5초 뒤 팝업 (오늘 보지않기 아닐 때)
    if (skipped !== today) {
      // 커튼 닫힘 감지 후 표시
      const curtainEl = $('#curtain');
      if (CONFIG.useCurtain === false) {
        setTimeout(openPopup, 500);
      } else {
        const observer = new MutationObserver(() => {
          if (curtainEl.classList.contains('is-hidden')) {
            observer.disconnect();
            setTimeout(openPopup, );
          }
        });
        observer.observe(curtainEl, { attributes: true, attributeFilter: ['class'] });
      }
    }

    // 섹션 내 버튼 → 팝업 없이 바로 폼 열기
    if (openBtn) openBtn.addEventListener('click', openModal);

    // 팝업 이벤트
    $('#rsvpPopupBtn').addEventListener('click', openModal);
    $('#rsvpPopupClose').addEventListener('click', closePopup);
    $('#rsvpPopupBackdrop').addEventListener('click', closePopup);
    $('#rsvpPopupSkip').addEventListener('click', () => {
      localStorage.setItem(skipKey, today);
      closePopup();
    });

    // 폼 모달 이벤트
    $('#rsvpModalClose').addEventListener('click', closeModal);
    $('#rsvpModalBackdrop').addEventListener('click', closeModal);

    // ── 토글 버튼 선택
    $$('.rsvp-toggle-group').forEach(group => {
      group.addEventListener('click', e => {
        const btn = e.target.closest('.rsvp-toggle');
        if (!btn) return;
        group.querySelectorAll('.rsvp-toggle').forEach(b => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');
      });
    });

    // ── 제출
    $('#rsvpSubmitBtn').addEventListener('click', () => {
      const side    = $('#rsvpSide .rsvp-toggle.is-selected')?.dataset.value;
      const attend  = $('#rsvpAttend .rsvp-toggle.is-selected')?.dataset.value;
      const meal    = $('#rsvpMeal .rsvp-toggle.is-selected')?.dataset.value;
      const name    = $('#rsvpName').value.trim();
      const guests  = $('#rsvpGuests').value.trim();
      const message = $('#rsvpMessage').value.trim();

      // 필수값 검증
      if (!side)   { showToast('어느 측 하객인지 선택해주세요'); return; }
      if (!attend) { showToast('참석 여부를 선택해주세요'); return; }
      if (!meal)   { showToast('식사 여부를 선택해주세요'); return; }
      if (!name)   { showToast('성함을 입력해주세요'); return; }

      // Google 폼 ID가 설정되지 않은 경우
      if (GOOGLE_FORM.formId === 'YOUR_FORM_ID_HERE') {
        showToast('Google 폼 ID를 설정해주세요 (script.js 참조)');
        return;
      }

      // 전송할 URL 및 데이터 준비
      const url = `https://docs.google.com/forms/d/e/${GOOGLE_FORM.formId}/formResponse`;
      const params = new URLSearchParams();
      params.append(GOOGLE_FORM.entries.attend,  attend);
      params.append(GOOGLE_FORM.entries.side,    side);
      params.append(GOOGLE_FORM.entries.meal,    meal);
      params.append(GOOGLE_FORM.entries.name,    name);
      params.append(GOOGLE_FORM.entries.guests,  guests || '0');
      params.append(GOOGLE_FORM.entries.message, message);

      // ── 숨겨진 iframe으로 전송 (no-cors 응답 문제 우회)
      let rsvpFrame = document.getElementById('rsvpHiddenFrame');
      if (!rsvpFrame) {
        rsvpFrame = document.createElement('iframe');
        rsvpFrame.name = 'rsvpHiddenFrame';
        rsvpFrame.id   = 'rsvpHiddenFrame';
        rsvpFrame.style.display = 'none';
        document.body.appendChild(rsvpFrame);
      }

      // iframe이 로드되면 성공으로 간주
      // 최신 fetch API를 사용한 백그라운드 전송
      fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        body: params
      }).then(() => {
        closeModal();
        showToast('참석 여부가 전달되었습니다 🌿');
      }).catch((error) => {
        console.error('RSVP Submit Error:', error);
        showToast('전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
      });
    });
  } // initRSVP 함수 닫기

  /* ═══════════════════════════════════════════
     Init
     ═══════════════════════════════════════════ */

  async function init() {
    setMetaTags();
    initCurtain();
    initHero();
    initCountdown();
    initGreeting();
    initCalendar();

    // Show loading placeholders while detecting images
    showLoadingPlaceholders();

    // Init sections that don't depend on image detection
    initPhotoModal();
    initLocation();
    initAccounts();
    initRSVP();
    initFooter();
    initScrollAnimations();

    // Auto-detect gallery images
    const galleryImages = await loadImagesFromFolder('gallery');

    // Render gallery with discovered images
    initGallery(galleryImages);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
