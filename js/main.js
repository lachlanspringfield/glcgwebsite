/**
 * Guiding Light Care Group — Main JavaScript
 * Handles: sticky header, mobile nav, dropdowns, FAQ accordion,
 * availability finder filter, scroll animations, contact form, smooth scroll
 */

(function () {
  'use strict';

  /* ============================================================
     Sticky Header
     ============================================================ */
  function initStickyHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    function onScroll() {
      if (window.scrollY > 10) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ============================================================
     Mobile Hamburger Toggle
     ============================================================ */
  function initHamburger() {
    const hamburger = document.querySelector('.nav-hamburger');
    const header = document.querySelector('.site-header');
    if (!hamburger || !header) return;

    hamburger.addEventListener('click', function () {
      header.classList.toggle('nav-open');
      const isOpen = header.classList.contains('nav-open');
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Close nav on outside click
    document.addEventListener('click', function (e) {
      if (!header.contains(e.target)) {
        header.classList.remove('nav-open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });

    // Close nav on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        header.classList.remove('nav-open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ============================================================
     Services Dropdown — click on mobile, hover on desktop
     ============================================================ */
  function initDropdown() {
    const dropdownItems = document.querySelectorAll('.nav-item.has-dropdown');
    if (!dropdownItems.length) return;

    dropdownItems.forEach(function (item) {
      const link = item.querySelector('.nav-link');

      // Click handler for mobile (toggle) or desktop (prevent nav)
      link.addEventListener('click', function (e) {
        // On mobile, toggle the dropdown
        if (window.innerWidth <= 1024) {
          e.preventDefault();
          const isOpen = item.classList.contains('open');
          // Close all dropdowns
          dropdownItems.forEach(function (i) { i.classList.remove('open'); });
          if (!isOpen) {
            item.classList.add('open');
          }
        }
      });

      // Desktop hover is handled by CSS, but we need JS for accessibility
      item.addEventListener('mouseenter', function () {
        if (window.innerWidth > 1024) {
          item.classList.add('open');
        }
      });

      item.addEventListener('mouseleave', function () {
        if (window.innerWidth > 1024) {
          item.classList.remove('open');
        }
      });
    });

    // Close dropdowns on outside click
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav-item.has-dropdown')) {
        dropdownItems.forEach(function (item) { item.classList.remove('open'); });
      }
    });
  }

  /* ============================================================
     FAQ Accordion
     ============================================================ */
  function initAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    if (!faqItems.length) return;

    faqItems.forEach(function (item) {
      const question = item.querySelector('.faq-question');
      if (!question) return;

      question.addEventListener('click', function () {
        const isOpen = item.classList.contains('open');

        // Close all items
        faqItems.forEach(function (i) {
          i.classList.remove('open');
          const q = i.querySelector('.faq-question');
          if (q) q.setAttribute('aria-expanded', 'false');
        });

        // Open clicked item if it was closed
        if (!isOpen) {
          item.classList.add('open');
          question.setAttribute('aria-expanded', 'true');
        }
      });

      // Set initial aria attributes
      question.setAttribute('aria-expanded', 'false');
    });
  }

  /* ============================================================
     Availability Finder Filter
     ============================================================ */
  function initAvailabilityFinder() {
    const filterService   = document.getElementById('filter-service');
    const filterRegion    = document.getElementById('filter-region');
    const filterSupport   = document.getElementById('filter-support');
    const filterRoom      = document.getElementById('filter-room');
    const clearBtn        = document.getElementById('clear-filters');
    const cards           = document.querySelectorAll('.availability-card');
    const resultsCountEl  = document.getElementById('results-count');
    const noResultsEl     = document.getElementById('no-results');

    if (!cards.length) return;

    const totalCards = cards.length;

    function getFilterValue(select) {
      return select ? select.value : 'all';
    }

    function applyFilters() {
      const service = getFilterValue(filterService);
      const region  = getFilterValue(filterRegion);
      const support = getFilterValue(filterSupport);
      const room    = getFilterValue(filterRoom);

      let visibleCount = 0;

      cards.forEach(function (card) {
        const cardService = (card.dataset.service || '').toLowerCase();
        const cardRegion  = (card.dataset.region  || '').toLowerCase();
        const cardSupport = (card.dataset.support || '').toLowerCase();
        const cardRoom    = (card.dataset.room    || '').toLowerCase();

        const matchService = service === 'all' || cardService === service.toLowerCase();
        const matchRegion  = region  === 'all' || cardRegion  === region.toLowerCase();
        const matchSupport = support === 'all' || cardSupport === support.toLowerCase();
        const matchRoom    = room    === 'all' || cardRoom    === room.toLowerCase();

        if (matchService && matchRegion && matchSupport && matchRoom) {
          card.classList.remove('hidden');
          visibleCount++;
          // Re-trigger animation
          card.classList.remove('visible');
          requestAnimationFrame(function () {
            card.classList.add('visible');
          });
        } else {
          card.classList.add('hidden');
        }
      });

      // Update results count
      if (resultsCountEl) {
        resultsCountEl.innerHTML = 'Showing <strong>' + visibleCount + '</strong> of <strong>' + totalCards + '</strong> vacancies';
      }

      // Show no-results message
      if (noResultsEl) {
        if (visibleCount === 0) {
          noResultsEl.classList.add('visible');
        } else {
          noResultsEl.classList.remove('visible');
        }
      }
    }

    // Attach filter change events
    [filterService, filterRegion, filterSupport, filterRoom].forEach(function (select) {
      if (select) {
        select.addEventListener('change', applyFilters);
      }
    });

    // Clear filters
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        [filterService, filterRegion, filterSupport, filterRoom].forEach(function (select) {
          if (select) select.value = 'all';
        });
        applyFilters();
      });
    }

    // Initial count display
    applyFilters();
  }

  /* ============================================================
     Scroll Animations (IntersectionObserver)
     ============================================================ */
  function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: show all elements immediately
      document.querySelectorAll('.fade-in-up').forEach(function (el) {
        el.classList.add('visible');
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    document.querySelectorAll('.fade-in-up').forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ============================================================
     Contact Form Demo
     ============================================================ */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    const successMsg = document.getElementById('form-success');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Basic validation
      const required = form.querySelectorAll('[required]');
      let valid = true;

      required.forEach(function (field) {
        if (!field.value.trim()) {
          field.style.borderColor = '#e74c3c';
          valid = false;
        } else {
          field.style.borderColor = '';
        }
      });

      if (!valid) return;

      // Simulate submission
      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.textContent = 'Sending…';
        submitBtn.disabled = true;
      }

      setTimeout(function () {
        form.style.display = 'none';
        if (successMsg) {
          successMsg.style.display = 'block';
        }
      }, 1200);
    });

    // Clear error styling on input
    form.querySelectorAll('input, textarea, select').forEach(function (field) {
      field.addEventListener('input', function () {
        field.style.borderColor = '';
      });
    });
  }

  /* ============================================================
     Smooth Scroll for anchor links
     ============================================================ */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const href = anchor.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10) || 72;
          const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;

          window.scrollTo({
            top: targetTop,
            behavior: 'smooth',
          });

          // Close mobile nav if open
          const header = document.querySelector('.site-header');
          if (header) header.classList.remove('nav-open');
        }
      });
    });
  }

  /* ============================================================
     Active Nav Link Highlighting
     ============================================================ */
  function initActiveNav() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link, .dropdown-item');

    navLinks.forEach(function (link) {
      const href = link.getAttribute('href');
      if (!href) return;

      // Normalise paths for comparison
      const linkPath = href.replace(/^\.\.\//, '/').replace(/^\.\//, '/');
      const normCurrent = currentPath.replace(/\/index\.html$/, '/');

      if (href !== '#' && (normCurrent.endsWith(href) || normCurrent.includes(href.replace('../', '')))) {
        link.classList.add('active');
      }
    });
  }

  /* ============================================================
     Services Tab Panel
     ============================================================ */
  function initServicesTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    if (!tabBtns.length) return;

    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const targetTab = btn.dataset.tab;

        // Update buttons
        tabBtns.forEach(function (b) {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        // Update panels
        tabPanels.forEach(function (panel) {
          panel.classList.remove('active');
        });

        const targetPanel = document.getElementById('panel-' + targetTab);
        if (targetPanel) {
          targetPanel.classList.add('active');
        }
      });
    });
  }

  /* ============================================================
     Init All
     ============================================================ */
  document.addEventListener('DOMContentLoaded', function () {
    initStickyHeader();
    initHamburger();
    initDropdown();
    initAccordion();
    initAvailabilityFinder();
    initScrollAnimations();
    initContactForm();
    initSmoothScroll();
    initActiveNav();
    initServicesTabs();
  });
})();
