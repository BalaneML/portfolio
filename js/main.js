/* ============================================================
   PORTFOLIO — main.js
   ============================================================ */

(function () {
  'use strict';

  // ===== ナビゲーション =====
  const nav       = document.getElementById('nav');
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu   = document.querySelector('.nav-menu');
  const navLinks  = document.querySelectorAll('.nav-link');

  // スクロール時にナビの背景を変える
  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 20);
    updateActiveLink();
  }

  // ハンバーガーメニュー
  navToggle.addEventListener('click', function () {
    const isOpen = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // メニューリンクをクリックしたら閉じる
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // ===== スクロールスパイ（アクティブなセクションをナビに反映） =====
  const sections = Array.from(document.querySelectorAll('section[id]'));

  function updateActiveLink() {
    const offset = window.scrollY + 100;

    let current = sections[0].id;
    sections.forEach(function (section) {
      if (section.offsetTop <= offset) {
        current = section.id;
      }
    });

    navLinks.forEach(function (link) {
      const isActive = link.getAttribute('href') === '#' + current;
      link.classList.toggle('active', isActive);
    });
  }

  // ===== フェードインアニメーション（IntersectionObserver） =====
  function initFadeIn() {
    const targets = document.querySelectorAll(
      '.section-header, .timeline-item, .vision-card, ' +
      '.research-card, .research-figure, .tool-card, .skill-bar, ' +
      '.hobby-card, .edu-item, .pub-item, .work-card, .gallery-item'
    );

    targets.forEach(function (el) {
      el.classList.add('fade-in');
    });

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            // 少しずつ遅延してフェードイン
            setTimeout(function () {
              entry.target.classList.add('visible');
            }, i * 60);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ===== スキルバーアニメーション =====
  function initSkillBars() {
    const fills = document.querySelectorAll('.skill-bar-fill');
    if (fills.length === 0) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    fills.forEach(function (fill) {
      observer.observe(fill);
    });
  }

  // ===== フォトギャラリー ライトボックス =====
  function initLightbox() {
    const items = document.querySelectorAll('.gallery-item img');
    if (items.length === 0) return;

    // オーバーレイを生成
    const box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.innerHTML =
      '<button class="lightbox-close" aria-label="閉じる">&times;</button>' +
      '<img alt="">' +
      '<p class="lightbox-caption"></p>';
    document.body.appendChild(box);

    const boxImg     = box.querySelector('img');
    const boxCaption = box.querySelector('.lightbox-caption');
    const closeBtn   = box.querySelector('.lightbox-close');

    function open(src, alt, caption) {
      boxImg.src = src;
      boxImg.alt = alt;
      boxCaption.textContent = caption;
      box.classList.add('open');
    }
    function close() {
      box.classList.remove('open');
    }

    items.forEach(function (img) {
      img.addEventListener('click', function () {
        const fig = img.closest('.gallery-item');
        const cap = fig ? fig.querySelector('figcaption') : null;
        open(img.src, img.alt, cap ? cap.textContent : '');
      });
    });

    closeBtn.addEventListener('click', close);
    box.addEventListener('click', function (e) {
      if (e.target === box) close(); // 背景クリックで閉じる
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  // ===== 初期化 =====
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // 初回実行

  if ('IntersectionObserver' in window) {
    initFadeIn();
    initSkillBars();
  }
  initLightbox();
})();
