/**
 * MyCoding Book - Code Block Features
 * 코드 복사, 언어 표시
 */

(function() {
  'use strict';

  const CodeBlock = {
    init() {
      this.wrapCodeBlocks();
      this.bindEvents();
    },

    wrapCodeBlocks() {
      // 이미 래핑된 것 제외
      document.querySelectorAll('pre code:not([data-wrapped])').forEach(codeEl => {
        const pre = codeEl.parentElement;
        if (!pre || pre.closest('.code-block-wrapper')) return;

        // 언어 감지
        const langClass = Array.from(codeEl.classList).find(c => c.startsWith('language-'));
        const language = langClass ? langClass.replace('language-', '') : 'text';

        // 래퍼 생성
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';

        // 헤더 생성
        const header = document.createElement('div');
        header.className = 'code-block-header';
        header.innerHTML = `
          <span class="code-block-lang">${this.getLanguageDisplay(language)}</span>
          <div class="code-block-actions">
            <button class="code-copy-btn" aria-label="코드 복사">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>복사</span>
            </button>
          </div>
        `;

        // 래핑
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(header);
        wrapper.appendChild(pre);

        codeEl.setAttribute('data-wrapped', 'true');
      });
    },

    getLanguageDisplay(lang) {
      const langMap = {
        'js': 'JavaScript',
        'javascript': 'JavaScript',
        'ts': 'TypeScript',
        'typescript': 'TypeScript',
        'json': 'JSON',
        'jsonc': 'JSON',
        'html': 'HTML',
        'css': 'CSS',
        'scss': 'SCSS',
        'python': 'Python',
        'py': 'Python',
        'bash': 'Bash',
        'shell': 'Shell',
        'sh': 'Shell',
        'yaml': 'YAML',
        'yml': 'YAML',
        'markdown': 'Markdown',
        'md': 'Markdown',
        'sql': 'SQL',
        'go': 'Go',
        'rust': 'Rust',
        'java': 'Java',
        'text': 'Text',
        'plaintext': 'Text'
      };

      return langMap[lang.toLowerCase()] || lang.toUpperCase();
    },

    bindEvents() {
      // 복사 버튼 클릭 이벤트 (이벤트 위임)
      document.addEventListener('click', async (e) => {
        const copyBtn = e.target.closest('.code-copy-btn');
        if (!copyBtn) return;

        const wrapper = copyBtn.closest('.code-block-wrapper');
        const code = wrapper?.querySelector('code');

        if (code) {
          await this.copyToClipboard(code.textContent, copyBtn);
        }
      });
    },

    async copyToClipboard(text, button) {
      try {
        await navigator.clipboard.writeText(text);
        this.showCopiedState(button);
      } catch (err) {
        // Fallback for older browsers
        this.fallbackCopy(text, button);
      }
    },

    fallbackCopy(text, button) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();

      try {
        document.execCommand('copy');
        this.showCopiedState(button);
      } catch (err) {
        console.error('Failed to copy:', err);
        this.showErrorState(button);
      }

      document.body.removeChild(textarea);
    },

    showCopiedState(button) {
      const originalHTML = button.innerHTML;

      button.classList.add('copied');
      button.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>복사됨!</span>
      `;

      setTimeout(() => {
        button.classList.remove('copied');
        button.innerHTML = originalHTML;
      }, 2000);
    },

    showErrorState(button) {
      const originalHTML = button.innerHTML;

      button.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        <span>실패</span>
      `;

      setTimeout(() => {
        button.innerHTML = originalHTML;
      }, 2000);
    }
  };

  // 전역 내보내기
  window.CodeBlock = CodeBlock;

  // 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CodeBlock.init());
  } else {
    CodeBlock.init();
  }

  // 동적으로 추가되는 코드 블록을 위한 MutationObserver
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length) {
        CodeBlock.wrapCodeBlocks();
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();
