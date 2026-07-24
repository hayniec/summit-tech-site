// =========================================================
// Summit Technologies — Accessible JS Engine
// WCAG 2.1 AA Compliant Navigation & Interaction
// =========================================================

document.addEventListener('DOMContentLoaded', () => {

  // ===== SPA NAVIGATION & FOCUS MANAGEMENT =====
  const pages = document.querySelectorAll('.page');
  const navLinks = document.querySelectorAll('[data-page]');
  const mainContent = document.getElementById('main-content');
  const mobileToggle = document.getElementById('mobileToggle');
  const mainNav = document.getElementById('mainNav');
  const aboutDropdownBtn = document.getElementById('aboutDropdownBtn');
  const aboutDropdown = document.getElementById('aboutDropdown');

  function showPage(pageId, focusMain = true) {
    let target = document.getElementById(`page-${pageId}`);
    if (!target) {
      pageId = 'home';
      target = document.getElementById('page-home');
    }

    pages.forEach(p => {
      p.classList.remove('active');
      p.setAttribute('aria-hidden', 'true');
    });

    target.classList.add('active');
    target.removeAttribute('aria-hidden');

    // Update active nav states
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.getAttribute('data-page') === pageId) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    // Close mobile nav & dropdowns
    closeMobileNav();
    closeDropdown();

    // Scroll to top & set focus for accessibility
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (focusMain && mainContent) {
      setTimeout(() => {
        mainContent.focus({ preventScroll: true });
      }, 100);
    }
  }

  // Click handlers for all data-page links
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-page]');
    if (link) {
      const pageId = link.getAttribute('data-page');
      if (pageId) {
        e.preventDefault();
        showPage(pageId);
        history.pushState({ page: pageId }, '', `#${pageId}`);
      }
    }
  });

  // Browser back/forward button support
  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.page) {
      showPage(e.state.page, false);
    } else {
      const hash = window.location.hash.replace('#', '');
      showPage(hash || 'home', false);
    }
  });

  // Check initial URL hash
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash) {
    showPage(initialHash, false);
  }

  // ===== ACCESSIBLE DROPDOWN NAVIGATION =====
  function toggleDropdown() {
    const isExpanded = aboutDropdownBtn.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }

  function openDropdown() {
    aboutDropdownBtn.setAttribute('aria-expanded', 'true');
    aboutDropdown.classList.add('open');
  }

  function closeDropdown() {
    aboutDropdownBtn.setAttribute('aria-expanded', 'false');
    aboutDropdown.classList.remove('open');
  }

  aboutDropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown();
  });

  // Keyboard support for dropdown
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDropdown();
      closeMobileNav();
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#aboutNavContainer')) {
      closeDropdown();
    }
  });

  // ===== MOBILE MENU ACCESSIBILITY =====
  function toggleMobileNav() {
    const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  }

  function openMobileNav() {
    mobileToggle.setAttribute('aria-expanded', 'true');
    mobileToggle.classList.add('active');
    mainNav.classList.add('open');
  }

  function closeMobileNav() {
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileToggle.classList.remove('active');
    mainNav.classList.remove('open');
  }

  mobileToggle.addEventListener('click', toggleMobileNav);

  // ===== HEADER SHADOW ON SCROLL =====
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  // ===== SCROLL REVEAL (Prefers-Reduced-Motion safe) =====
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  } else {
    // Instantly reveal all if reduced motion is requested
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }

  // ===== FORM VALIDATION WITH ACCESSIBLE ERROR MESSAGES =====
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      const nameInput = document.getElementById('contact-name');
      const emailInput = document.getElementById('contact-email');
      const messageInput = document.getElementById('contact-message');

      // Name validation
      const groupName = document.getElementById('group-name');
      if (!nameInput.value.trim()) {
        groupName.classList.add('has-error');
        isValid = false;
      } else {
        groupName.classList.remove('has-error');
      }

      // Email validation
      const groupEmail = document.getElementById('group-email');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
        groupEmail.classList.add('has-error');
        isValid = false;
      } else {
        groupEmail.classList.remove('has-error');
      }

      // Message validation
      const groupMessage = document.getElementById('group-message');
      if (!messageInput.value.trim()) {
        groupMessage.classList.add('has-error');
        isValid = false;
      } else {
        groupMessage.classList.remove('has-error');
      }

      if (isValid) {
        alert('Thank you! Your message has been sent successfully. A Summit Technologies representative will contact you shortly.');
        contactForm.reset();
        document.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-error'));
      } else {
        // Focus first error input
        const firstError = contactForm.querySelector('.has-error input, .has-error textarea');
        if (firstError) {
          firstError.focus();
        }
      }
    });
  }

  // ===== DYNAMIC NEWS RENDERER (ISOLATED) =====
  async function loadDynamicNews() {
    const newsContainer = document.querySelector('#page-news .news-grid');
    if (!newsContainer) return;

    try {
      const response = await fetch('data/news.json?v=' + Date.now());
      if (!response.ok) return;
      const newsItems = await response.json();
      if (!Array.isArray(newsItems) || newsItems.length === 0) return;

      newsContainer.innerHTML = newsItems.map(item => `
        <article class="news-card">
          <div class="news-date">${escapeHTML(item.date)}</div>
          <h3>${escapeHTML(item.title)}</h3>
          <p>${escapeHTML(item.summary)}</p>
        </article>
      `).join('');
    } catch (e) {
      // Keep static fallback if fetch is unavailable
    }
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // Load news dynamically when visiting #news or initial page load
  loadDynamicNews();
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#news') {
      loadDynamicNews();
    }
  });

});
