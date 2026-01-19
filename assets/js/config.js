/**
 * MyCoding Book - Document Configuration
 * 새 문서 추가 시 이 파일만 수정하면 됩니다.
 */

const DocsConfig = {
  // 사이트 정보
  site: {
    title: "MyCoding Book",
    description: "Claude Code 개발 가이드 모음",
    author: "MyCoding",
    version: "1.1.0",
    lastUpdated: "2025-01-19"
  },

  // 문서 목록
  documents: [
    {
      id: "orchestration",
      title: "멀티 에이전트 오케스트레이션 가이드",
      shortTitle: "오케스트레이션",
      file: "orchestration.html",
      icon: "🎭",
      category: "claude-code",
      description: "Skill, Agent, Hook을 조합하여 신뢰할 수 있는 멀티 에이전트 워크플로우 구축",
      lastUpdated: "2025-01-02",
      readingTime: 20,
      tags: ["skill", "agent", "hook", "workflow", "pipeline"],
      sections: [
        { id: "overview", title: "개요", icon: "📋" },
        { id: "architecture", title: "핵심 아키텍처", icon: "🏗️" },
        { id: "patterns", title: "조합 패턴", icon: "🧩" },
        { id: "hooks", title: "Hook 시스템", icon: "🪝" },
        { id: "advanced", title: "고급 워크플로우", icon: "⚡" },
        { id: "examples", title: "실전 예시", icon: "💻" },
        { id: "limitations", title: "한계점 및 확장", icon: "🚀" }
      ]
    },
    {
      id: "mcp",
      title: "MCP 연계 가이드",
      shortTitle: "MCP 연계",
      file: "mcp-guide.html",
      icon: "🔌",
      category: "claude-code",
      description: "Model Context Protocol을 활용하여 외부 시스템과 연동하는 방법",
      lastUpdated: "2025-01-02",
      readingTime: 25,
      tags: ["mcp", "github", "database", "api", "integration"],
      sections: [
        { id: "mcp-overview", title: "MCP 개요", icon: "📋" },
        { id: "mcp-setup", title: "MCP 설정", icon: "⚙️" },
        { id: "skill-mcp", title: "Skill + MCP", icon: "🎭" },
        { id: "agent-mcp", title: "Agent + MCP", icon: "🤖" },
        { id: "orchestration-mcp", title: "오케스트레이션 + MCP", icon: "🎼" },
        { id: "popular-servers", title: "인기 MCP 서버", icon: "⭐" },
        { id: "security", title: "보안 Best Practices", icon: "🔒" },
        { id: "hook-mcp", title: "Hook + MCP 연계", icon: "🪝" },
        { id: "workflows", title: "실전 워크플로우", icon: "💻" }
      ]
    },
    {
      id: "monorepo",
      title: "AI 시대 모노레포 가이드",
      shortTitle: "모노레포",
      file: "monorepo.html",
      icon: "📦",
      category: "dev-env",
      description: "AI 코딩 도구와 함께 효율적으로 개발하기 위한 모노레포 구조",
      lastUpdated: "2025-01-19",
      readingTime: 25,
      tags: ["monorepo", "pnpm", "uv", "turborepo", "typescript", "ai-coding"],
      sections: [
        { id: "intro", title: "모노레포란?", icon: "📋" },
        { id: "structure", title: "기본 구조", icon: "🏗️" },
        { id: "config", title: "핵심 설정", icon: "⚙️" },
        { id: "dependencies", title: "패키지 의존성", icon: "🔗" },
        { id: "shared", title: "공유 패키지", icon: "📦" },
        { id: "ai-optimization", title: "AI 코딩 최적화", icon: "🤖" },
        { id: "commands", title: "주요 명령어", icon: "💻" },
        { id: "practice", title: "실전", icon: "🔧" },
        { id: "reference", title: "참고", icon: "📚" },
        { id: "package-managers-ai", title: "AI용 패키지 매니저", icon: "⚡" }
      ]
    }
  ],

  // 카테고리 정의
  categories: {
    "claude-code": { name: "Claude Code 가이드", icon: "🤖", color: "indigo" },
    "dev-env": { name: "개발 환경 가이드", icon: "🛠️", color: "emerald" },
    reference: { name: "레퍼런스", icon: "📚", color: "amber" },
    tutorial: { name: "튜토리얼", icon: "📝", color: "rose" }
  },

  // 테마 설정
  theme: {
    defaultMode: "light", // "light" | "dark" | "system"
    colors: {
      primary: "#6366f1",
      secondary: "#8b5cf6",
      accent: "#06b6d4"
    }
  },

  // 기능 플래그
  features: {
    search: true,
    darkMode: true,
    readingProgress: true,
    readingTime: true,
    tableOfContents: true,
    cardTabs: true,
    codeHighlight: true,
    codeCopy: true,
    mermaidDiagrams: true,
    printStyles: true
  }
};

// 유틸리티 함수
const DocsUtils = {
  // 문서 ID로 문서 찾기
  getDocById(id) {
    return DocsConfig.documents.find(doc => doc.id === id);
  },

  // 현재 페이지의 문서 정보 가져오기
  getCurrentDoc() {
    const filename = window.location.pathname.split('/').pop() || 'index.html';
    return DocsConfig.documents.find(doc => doc.file === filename);
  },

  // 카테고리별 문서 그룹화
  getDocsByCategory() {
    const grouped = {};
    DocsConfig.documents.forEach(doc => {
      if (!grouped[doc.category]) {
        grouped[doc.category] = [];
      }
      grouped[doc.category].push(doc);
    });
    return grouped;
  },

  // 태그로 문서 검색
  getDocsByTag(tag) {
    return DocsConfig.documents.filter(doc => doc.tags.includes(tag));
  },

  // 모든 태그 가져오기
  getAllTags() {
    const tags = new Set();
    DocsConfig.documents.forEach(doc => {
      doc.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  },

  // 읽기 시간 포맷
  formatReadingTime(minutes) {
    return `약 ${minutes}분`;
  },

  // 날짜 포맷
  formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
};

// 전역으로 내보내기
window.DocsConfig = DocsConfig;
window.DocsUtils = DocsUtils;
