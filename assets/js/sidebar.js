/**
 * MyCoding Book - Sidebar Navigation
 * 목차 네비게이션 + 스크롤 스파이
 */

(function() {
  'use strict';

  const Sidebar = {
    init() {
      this.sidebar = document.querySelector('.sidebar-nav');
      this.sections = document.querySelectorAll('section[id]');
      this.sectionLinks = document.querySelectorAll('.sidebar-section-title[data-section]');
      this.itemLinks = document.querySelectorAll('.sidebar-item[href^="#"]');

      if (!this.sidebar || this.sections.length === 0) return;

      this.bindEvents();
      this.initCollapsible();
      this.updateActiveState();
    },

    bindEvents() {
      // 스크롤 이벤트 (쓰로틀 적용)
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            this.updateActiveState();
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });

      // 섹션 제목 클릭 (접기/펼치기 + 이동)
      this.sectionLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          const section = link.closest('.sidebar-section');
          const targetId = link.getAttribute('data-section');

          // 접기/펼치기
          if (section.classList.contains('expanded')) {
            // 이미 펼쳐진 상태면 해당 섹션으로 이동
            if (targetId) {
              const target = document.getElementById(targetId);
              if (target) {
                this.scrollToElement(target);
              }
            }
          } else {
            // 펼치기
            this.toggleSection(section, true);
          }
        });

        // 키보드 접근성
        link.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            link.click();
          }
        });
      });

      // 하위 항목 클릭
      this.itemLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = link.getAttribute('href').slice(1);
          const target = document.getElementById(targetId);

          if (target) {
            this.scrollToElement(target);

            // 모바일에서 사이드바 닫기
            if (window.innerWidth <= 768) {
              const mobileMenu = document.querySelector('.sidebar');
              const overlay = document.querySelector('.sidebar-overlay');
              mobileMenu?.classList.remove('active');
              overlay?.classList.remove('active');
              document.body.style.overflow = '';
            }
          }
        });
      });
    },

    initCollapsible() {
      const sections = document.querySelectorAll('.sidebar-section');

      sections.forEach((section, index) => {
        // 첫 번째 섹션은 기본으로 펼침
        if (index === 0) {
          section.classList.add('expanded');
        }

        // 화살표 버튼 클릭
        const arrow = section.querySelector('.sidebar-section-arrow');
        if (arrow) {
          arrow.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleSection(section);
          });
        }
      });
    },

    toggleSection(section, forceOpen = null) {
      const isExpanded = section.classList.contains('expanded');
      const shouldOpen = forceOpen !== null ? forceOpen : !isExpanded;

      if (shouldOpen) {
        section.classList.add('expanded');
      } else {
        section.classList.remove('expanded');
      }

      // ARIA 상태 업데이트
      const title = section.querySelector('.sidebar-section-title');
      if (title) {
        title.setAttribute('aria-expanded', shouldOpen);
      }
    },

    updateActiveState() {
      const scrollPos = window.scrollY;
      const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 64;
      const offset = headerHeight + 100;

      let activeSection = null;
      let activeItem = null;

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

        // 하위 섹션 확인
        const subsections = activeSection.querySelectorAll('[id]');
        subsections.forEach(sub => {
          const rect = sub.getBoundingClientRect();
          const top = rect.top + scrollPos - offset;

          if (scrollPos >= top) {
            activeItem = sub;
          }
        });

        // 사이드바 업데이트
        this.highlightSection(sectionId);
        if (activeItem) {
          this.highlightItem(activeItem.id);
        }
      }
    },

    highlightSection(sectionId) {
      // 모든 섹션 비활성화
      this.sectionLinks.forEach(link => {
        link.classList.remove('active');
      });

      // 활성 섹션 강조
      const activeLink = document.querySelector(`.sidebar-section-title[data-section="${sectionId}"]`);
      if (activeLink) {
        activeLink.classList.add('active');

        // 해당 섹션 펼치기
        const section = activeLink.closest('.sidebar-section');
        if (section && !section.classList.contains('expanded')) {
          this.toggleSection(section, true);
        }
      }
    },

    highlightItem(itemId) {
      // 모든 항목 비활성화
      this.itemLinks.forEach(link => {
        link.classList.remove('active');
      });

      // 활성 항목 강조
      const activeLink = document.querySelector(`.sidebar-item[href="#${itemId}"]`);
      if (activeLink) {
        activeLink.classList.add('active');

        // 뷰포트에 없으면 스크롤
        this.scrollIntoViewIfNeeded(activeLink);
      }
    },

    scrollIntoViewIfNeeded(element) {
      const sidebar = document.querySelector('.sidebar');
      if (!sidebar) return;

      const sidebarRect = sidebar.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      if (elementRect.top < sidebarRect.top + 100 || elementRect.bottom > sidebarRect.bottom - 50) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    },

    scrollToElement(element) {
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
    }
  };

  // 전역 내보내기
  window.Sidebar = Sidebar;

  // 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Sidebar.init());
  } else {
    Sidebar.init();
  }
})();
