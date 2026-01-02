/**
 * MyCoding Book - Card Tabs
 * 섹션 카드 탭 네비게이션
 */

(function() {
  'use strict';

  const CardTabs = {
    init() {
      this.container = document.querySelector('.card-tabs');
      this.tabs = document.querySelectorAll('.card-tab');
      this.sections = document.querySelectorAll('section[id]');

      if (!this.container || this.tabs.length === 0) return;

      this.bindEvents();
      this.updateActiveTab();
    },

    bindEvents() {
      // 탭 클릭
      this.tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = tab.getAttribute('data-section') || tab.getAttribute('href')?.slice(1);

          if (targetId) {
            const target = document.getElementById(targetId);
            if (target) {
              this.scrollToSection(target);
              this.setActiveTab(tab);
            }
          }
        });

        // 키보드 접근성
        tab.addEventListener('keydown', (e) => {
          this.handleKeyboard(e, tab);
        });
      });

      // 스크롤 시 활성 탭 업데이트
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            this.updateActiveTab();
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });

      // 터치 스와이프 for mobile
      this.initTouchScroll();
    },

    handleKeyboard(e, currentTab) {
      const tabs = Array.from(this.tabs);
      const currentIndex = tabs.indexOf(currentTab);

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
          tabs[prevIndex].focus();
          break;

        case 'ArrowRight':
          e.preventDefault();
          const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
          tabs[nextIndex].focus();
          break;

        case 'Home':
          e.preventDefault();
          tabs[0].focus();
          break;

        case 'End':
          e.preventDefault();
          tabs[tabs.length - 1].focus();
          break;

        case 'Enter':
        case ' ':
          e.preventDefault();
          currentTab.click();
          break;
      }
    },

    initTouchScroll() {
      if (!('ontouchstart' in window)) return;

      let isScrolling = false;

      this.container.addEventListener('touchstart', () => {
        isScrolling = true;
      }, { passive: true });

      this.container.addEventListener('touchend', () => {
        isScrolling = false;
      }, { passive: true });

      // 활성 탭이 보이도록 스크롤
      const observer = new MutationObserver(() => {
        if (!isScrolling) {
          this.scrollActiveTabIntoView();
        }
      });

      this.tabs.forEach(tab => {
        observer.observe(tab, { attributes: true, attributeFilter: ['class'] });
      });
    },

    scrollToSection(element) {
      const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 64;
      const cardTabHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--card-tab-height')) || 56;
      const offset = headerHeight + cardTabHeight + 24;

      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // URL 해시 업데이트
      history.pushState(null, null, `#${element.id}`);
    },

    updateActiveTab() {
      const scrollPos = window.scrollY;
      const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 64;
      const offset = headerHeight + 150;

      let activeSection = null;

      // 현재 보이는 섹션 찾기
      this.sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const top = rect.top + scrollPos - offset;

        if (scrollPos >= top) {
          activeSection = section;
        }
      });

      if (activeSection) {
        const sectionId = activeSection.id;
        const activeTab = document.querySelector(`.card-tab[data-section="${sectionId}"]`) ||
                          document.querySelector(`.card-tab[href="#${sectionId}"]`);

        if (activeTab && !activeTab.classList.contains('active')) {
          this.setActiveTab(activeTab);
          this.scrollActiveTabIntoView();
        }
      }
    },

    setActiveTab(tab) {
      // 모든 탭 비활성화
      this.tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
        t.setAttribute('tabindex', '-1');
      });

      // 선택된 탭 활성화
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      tab.setAttribute('tabindex', '0');
    },

    scrollActiveTabIntoView() {
      const activeTab = document.querySelector('.card-tab.active');
      if (!activeTab || !this.container) return;

      const containerRect = this.container.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();

      // 탭이 컨테이너 밖에 있으면 스크롤
      if (tabRect.left < containerRect.left || tabRect.right > containerRect.right) {
        activeTab.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    },

    // 외부에서 특정 탭 활성화
    activateTab(sectionId) {
      const tab = document.querySelector(`.card-tab[data-section="${sectionId}"]`) ||
                  document.querySelector(`.card-tab[href="#${sectionId}"]`);

      if (tab) {
        this.setActiveTab(tab);
        this.scrollActiveTabIntoView();
      }
    }
  };

  // 전역 내보내기
  window.CardTabs = CardTabs;

  // 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CardTabs.init());
  } else {
    CardTabs.init();
  }
})();
