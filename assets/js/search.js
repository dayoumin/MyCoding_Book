/**
 * MyCoding Book - Search Modal
 * Ctrl+K 검색 기능
 */

(function() {
  'use strict';

  const SearchModal = {
    searchData: [],

    init() {
      this.modal = document.querySelector('.search-modal');
      this.content = document.querySelector('.search-modal-content');
      this.input = document.querySelector('.search-input');
      this.results = document.querySelector('.search-results');
      this.searchBtn = document.querySelector('.search-btn');

      if (!this.modal) return;

      this.buildSearchIndex();
      this.bindEvents();
    },

    buildSearchIndex() {
      this.searchData = [];

      // 현재 페이지의 섹션들 인덱싱
      document.querySelectorAll('section[id]').forEach(section => {
        const title = section.querySelector('h2, h3, h4');
        const content = section.textContent.slice(0, 200);

        if (title) {
          this.searchData.push({
            type: 'section',
            id: section.id,
            title: title.textContent,
            content: content,
            url: `#${section.id}`
          });
        }
      });

      // config.js의 문서 목록 추가
      if (window.DocsConfig?.documents) {
        window.DocsConfig.documents.forEach(doc => {
          this.searchData.push({
            type: 'document',
            id: doc.id,
            title: doc.title,
            content: doc.description,
            url: doc.file,
            icon: doc.icon
          });

          // 각 문서의 섹션도 추가
          if (doc.sections) {
            doc.sections.forEach(section => {
              this.searchData.push({
                type: 'doc-section',
                id: section.id,
                title: `${doc.shortTitle} > ${section.title}`,
                content: '',
                url: `${doc.file}#${section.id}`,
                icon: section.icon
              });
            });
          }
        });
      }
    },

    bindEvents() {
      // 검색 버튼 클릭
      if (this.searchBtn) {
        this.searchBtn.addEventListener('click', () => this.open());
      }

      // 모달 외부 클릭 시 닫기
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.close();
        }
      });

      // ESC 키로 닫기
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen()) {
          this.close();
        }
      });

      // 입력 이벤트
      if (this.input) {
        this.input.addEventListener('input', () => {
          this.search(this.input.value);
        });

        // 키보드 네비게이션
        this.input.addEventListener('keydown', (e) => {
          this.handleKeyboard(e);
        });
      }

      // Ctrl+K 단축키
      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          this.toggle();
        }
      });
    },

    handleKeyboard(e) {
      const items = this.results?.querySelectorAll('.search-result-item');
      if (!items || items.length === 0) return;

      const selectedItem = this.results.querySelector('.search-result-item.selected');
      let selectedIndex = selectedItem ? Array.from(items).indexOf(selectedItem) : -1;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
          this.selectItem(items, selectedIndex);
          break;

        case 'ArrowUp':
          e.preventDefault();
          selectedIndex = Math.max(selectedIndex - 1, 0);
          this.selectItem(items, selectedIndex);
          break;

        case 'Enter':
          e.preventDefault();
          if (selectedItem) {
            const url = selectedItem.getAttribute('href');
            if (url) {
              if (url.startsWith('#')) {
                // 같은 페이지 내 이동
                this.close();
                const target = document.querySelector(url);
                if (target) {
                  window.Sidebar?.scrollToElement?.(target) ||
                  target.scrollIntoView({ behavior: 'smooth' });
                }
              } else {
                // 다른 페이지로 이동
                window.location.href = url;
              }
            }
          }
          break;
      }
    },

    selectItem(items, index) {
      items.forEach((item, i) => {
        if (i === index) {
          item.classList.add('selected');
          item.scrollIntoView({ block: 'nearest' });
        } else {
          item.classList.remove('selected');
        }
      });
    },

    search(query) {
      if (!this.results) return;

      const trimmedQuery = query.trim().toLowerCase();

      if (trimmedQuery.length === 0) {
        this.showDefaultResults();
        return;
      }

      const results = this.searchData.filter(item => {
        return item.title.toLowerCase().includes(trimmedQuery) ||
               item.content.toLowerCase().includes(trimmedQuery);
      }).slice(0, 10);

      this.renderResults(results, trimmedQuery);
    },

    showDefaultResults() {
      // 기본: 문서 목록 + 최근 본 섹션
      const defaultResults = this.searchData
        .filter(item => item.type === 'document')
        .slice(0, 5);

      this.renderResults(defaultResults);
    },

    renderResults(results, query = '') {
      if (results.length === 0) {
        this.results.innerHTML = `
          <div class="search-no-results" style="padding: 2rem; text-align: center; color: var(--color-text-muted);">
            <p>검색 결과가 없습니다.</p>
            <p style="font-size: 0.875rem; margin-top: 0.5rem;">다른 키워드로 검색해보세요.</p>
          </div>
        `;
        return;
      }

      this.results.innerHTML = results.map((item, index) => {
        const icon = item.icon || (item.type === 'document' ? '📄' : '📑');
        const title = query ? this.highlightMatch(item.title, query) : item.title;
        const desc = item.content ? (query ? this.highlightMatch(item.content.slice(0, 80), query) : item.content.slice(0, 80)) : '';

        return `
          <a href="${item.url}" class="search-result-item ${index === 0 ? 'selected' : ''}" data-type="${item.type}">
            <div class="search-result-title">
              <span class="search-result-icon">${icon}</span>
              ${title}
            </div>
            ${desc ? `<div class="search-result-desc">${desc}...</div>` : ''}
          </a>
        `;
      }).join('');

      // 결과 항목 클릭 이벤트
      this.results.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', (e) => {
          const url = item.getAttribute('href');
          if (url.startsWith('#')) {
            e.preventDefault();
            this.close();
            const target = document.querySelector(url);
            if (target) {
              setTimeout(() => {
                window.Sidebar?.scrollToElement?.(target) ||
                target.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }
          }
        });

        // 마우스 호버 시 선택
        item.addEventListener('mouseenter', () => {
          this.results.querySelectorAll('.search-result-item').forEach(i => i.classList.remove('selected'));
          item.classList.add('selected');
        });
      });
    },

    highlightMatch(text, query) {
      const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
      return text.replace(regex, '<mark style="background: rgba(99, 102, 241, 0.3); padding: 0 2px; border-radius: 2px;">$1</mark>');
    },

    escapeRegex(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    open() {
      this.modal.classList.add('active');
      document.body.style.overflow = 'hidden';

      setTimeout(() => {
        this.input?.focus();
        this.input.value = '';
        this.showDefaultResults();
      }, 100);
    },

    close() {
      this.modal.classList.remove('active');
      document.body.style.overflow = '';
      this.searchBtn?.focus();
    },

    toggle() {
      if (this.isOpen()) {
        this.close();
      } else {
        this.open();
      }
    },

    isOpen() {
      return this.modal?.classList.contains('active');
    }
  };

  // 전역 내보내기
  window.SearchModal = SearchModal;

  // 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SearchModal.init());
  } else {
    SearchModal.init();
  }
})();
