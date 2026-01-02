/**
 * MyCoding Book - Main JavaScript
 * 초기화, 다크모드, 공통 유틸리티
 */

(function() {
  'use strict';

  // ========================================
  // Theme Management (Dark Mode)
  // ========================================
  const ThemeManager = {
    STORAGE_KEY: 'mycoding-book-theme',

    init() {
      this.applyTheme(this.getSavedTheme());
      this.bindEvents();
    },

    getSavedTheme() {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) return saved;

      // 시스템 설정 확인
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      return 'light';
    },

    applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      this.updateToggleIcon(theme);
    },

    toggle() {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      this.applyTheme(next);
      localStorage.setItem(this.STORAGE_KEY, next);
    },

    updateToggleIcon(theme) {
      const toggle = document.querySelector('.theme-toggle-thumb');
      if (toggle) {
        toggle.textContent = theme === 'dark' ? '🌙' : '☀️';
      }
    },

    bindEvents() {
      const toggle = document.querySelector('.theme-toggle');
      if (toggle) {
        toggle.addEventListener('click', () => this.toggle());
        toggle.setAttribute('role', 'switch');
        toggle.setAttribute('aria-label', '다크모드 전환');
      }

      // 시스템 테마 변경 감지
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
          this.applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  };

  // ========================================
  // Mobile Menu
  // ========================================
  const MobileMenu = {
    init() {
      this.sidebar = document.querySelector('.sidebar');
      this.overlay = document.querySelector('.sidebar-overlay');
      this.menuBtn = document.querySelector('.mobile-menu-btn');
      this.closeBtn = document.querySelector('.sidebar-close');

      if (!this.sidebar) return;

      this.bindEvents();
    },

    bindEvents() {
      if (this.menuBtn) {
        this.menuBtn.addEventListener('click', () => this.open());
      }

      if (this.closeBtn) {
        this.closeBtn.addEventListener('click', () => this.close());
      }

      if (this.overlay) {
        this.overlay.addEventListener('click', () => this.close());
      }

      // ESC 키로 닫기
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen()) {
          this.close();
        }
      });

      // 화면 크기 변경 시 닫기
      window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && this.isOpen()) {
          this.close();
        }
      });
    },

    open() {
      this.sidebar.classList.add('active');
      this.overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      this.closeBtn?.focus();
    },

    close() {
      this.sidebar.classList.remove('active');
      this.overlay.classList.remove('active');
      document.body.style.overflow = '';
      this.menuBtn?.focus();
    },

    isOpen() {
      return this.sidebar?.classList.contains('active');
    }
  };

  // ========================================
  // Reading Progress
  // ========================================
  const ReadingProgress = {
    init() {
      this.progressBar = document.querySelector('.reading-progress-bar');
      if (!this.progressBar) return;

      this.update();
      window.addEventListener('scroll', () => this.update(), { passive: true });
      window.addEventListener('resize', () => this.update(), { passive: true });
    },

    update() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      this.progressBar.style.width = `${Math.min(progress, 100)}%`;
    }
  };

  // ========================================
  // Back to Top Button
  // ========================================
  const BackToTop = {
    init() {
      this.button = document.querySelector('.back-to-top');
      if (!this.button) return;

      this.bindEvents();
      this.checkVisibility();
    },

    bindEvents() {
      window.addEventListener('scroll', () => this.checkVisibility(), { passive: true });
      this.button.addEventListener('click', () => this.scrollToTop());
    },

    checkVisibility() {
      if (window.scrollY > 300) {
        this.button.classList.add('visible');
      } else {
        this.button.classList.remove('visible');
      }
    },

    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // ========================================
  // Document Selector Dropdown
  // ========================================
  const DocSelector = {
    init() {
      this.container = document.querySelector('.doc-selector');
      this.btn = document.querySelector('.doc-selector-btn');

      if (!this.container || !this.btn) return;

      this.bindEvents();
    },

    bindEvents() {
      this.btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });

      document.addEventListener('click', (e) => {
        if (!this.container.contains(e.target)) {
          this.close();
        }
      });

      // 키보드 접근성
      this.btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggle();
        } else if (e.key === 'Escape') {
          this.close();
        }
      });
    },

    toggle() {
      this.container.classList.toggle('active');
      const isOpen = this.container.classList.contains('active');
      this.btn.setAttribute('aria-expanded', isOpen);
    },

    close() {
      this.container.classList.remove('active');
      this.btn.setAttribute('aria-expanded', 'false');
    }
  };

  // ========================================
  // Smooth Scroll for Anchor Links
  // ========================================
  const SmoothScroll = {
    init() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          const targetId = anchor.getAttribute('href');
          if (targetId === '#') return;

          const target = document.querySelector(targetId);
          if (target) {
            e.preventDefault();
            this.scrollTo(target);

            // 모바일에서 사이드바 닫기
            if (window.innerWidth <= 768) {
              MobileMenu.close();
            }
          }
        });
      });
    },

    scrollTo(element) {
      const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height'));
      const cardTabHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--card-tab-height')) || 0;
      const offset = headerHeight + cardTabHeight + 24;

      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // URL 해시 업데이트
      history.pushState(null, null, `#${element.id}`);
    }
  };

  // ========================================
  // Keyboard Navigation
  // ========================================
  const KeyboardNav = {
    init() {
      document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K: 검색 열기
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          window.SearchModal?.open();
        }

        // /: 검색 열기 (입력 필드가 아닐 때)
        if (e.key === '/' && !this.isInputFocused()) {
          e.preventDefault();
          window.SearchModal?.open();
        }
      });
    },

    isInputFocused() {
      const activeEl = document.activeElement;
      return activeEl.tagName === 'INPUT' ||
             activeEl.tagName === 'TEXTAREA' ||
             activeEl.isContentEditable;
    }
  };

  // ========================================
  // Touch Gestures (Mobile)
  // ========================================
  const TouchGestures = {
    init() {
      if (!('ontouchstart' in window)) return;

      let startX = 0;
      let startY = 0;

      document.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }, { passive: true });

      document.addEventListener('touchend', (e) => {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const diffX = endX - startX;
        const diffY = endY - startY;

        // 수평 스와이프가 수직보다 클 때만 처리
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
          if (diffX > 0 && startX < 30) {
            // 왼쪽 가장자리에서 오른쪽으로 스와이프 → 사이드바 열기
            MobileMenu.open();
          } else if (diffX < 0 && MobileMenu.isOpen()) {
            // 왼쪽으로 스와이프 → 사이드바 닫기
            MobileMenu.close();
          }
        }
      }, { passive: true });
    }
  };

  // ========================================
  // Lazy Loading for Mermaid Diagrams
  // ========================================
  const LazyMermaid = {
    init() {
      if (typeof mermaid === 'undefined') return;

      // Mermaid 초기화
      mermaid.initialize({
        startOnLoad: false,
        theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default',
        securityLevel: 'loose',
        fontFamily: 'var(--font-sans)'
      });

      // Intersection Observer로 다이어그램 지연 렌더링
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.renderDiagram(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: '100px' });

      document.querySelectorAll('.mermaid:not([data-processed])').forEach(el => {
        observer.observe(el);
      });

      // 테마 변경 시 다이어그램 다시 렌더링
      const themeToggle = document.querySelector('.theme-toggle');
      if (themeToggle) {
        themeToggle.addEventListener('click', () => {
          setTimeout(() => this.updateTheme(), 100);
        });
      }
    },

    renderDiagram(element) {
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      element.setAttribute('id', id);

      try {
        mermaid.init(undefined, element);
        element.setAttribute('data-processed', 'true');
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        element.innerHTML = `<p class="text-red-500">다이어그램 렌더링 오류</p>`;
      }
    },

    updateTheme() {
      const theme = document.documentElement.getAttribute('data-theme');
      mermaid.initialize({
        theme: theme === 'dark' ? 'dark' : 'default'
      });

      // 모든 다이어그램 다시 렌더링
      document.querySelectorAll('.mermaid[data-processed]').forEach(el => {
        el.removeAttribute('data-processed');
        el.innerHTML = el.getAttribute('data-original') || el.innerHTML;
        this.renderDiagram(el);
      });
    }
  };

  // ========================================
  // Utilities
  // ========================================
  const Utils = {
    // 디바운스
    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    // 쓰로틀
    throttle(func, limit) {
      let inThrottle;
      return function(...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    },

    // 요소가 뷰포트에 있는지 확인
    isInViewport(element) {
      const rect = element.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    },

    // 현재 섹션 ID 가져오기
    getCurrentSectionId() {
      const sections = document.querySelectorAll('section[id]');
      let currentId = '';

      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 150) {
          currentId = section.id;
        }
      });

      return currentId;
    }
  };

  // 전역 유틸리티 내보내기
  window.Utils = Utils;

  // ========================================
  // Initialize Everything
  // ========================================
  function init() {
    ThemeManager.init();
    MobileMenu.init();
    ReadingProgress.init();
    BackToTop.init();
    DocSelector.init();
    SmoothScroll.init();
    KeyboardNav.init();
    TouchGestures.init();

    // Mermaid가 로드된 후 초기화
    if (typeof mermaid !== 'undefined') {
      LazyMermaid.init();
    } else {
      window.addEventListener('load', () => LazyMermaid.init());
    }
  }

  // DOM 로드 후 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
