/**
 * MyCoding Book - public site catalog.
 *
 * HTML pages are the source of truth for reading.
 * Keep this file as the lightweight index for cards, search, and navigation.
 */

const DocsConfig = {
  site: {
    title: "MyCoding Book",
    description: "Codex 중심 Agent AI Coding 학습 노트",
    author: "MyCoding",
    version: "2.1.0",
    lastUpdated: "2026-05-26"
  },

  documents: [
    {
      id: "codex-overview",
      title: "Codex 학습 허브",
      shortTitle: "Codex Hub",
      file: "codex/index.html",
      icon: "C",
      category: "codex",
      description: "Codex를 개인 개발, 문서화, 검증, 자동화에 쓰기 위한 전체 학습 지도입니다.",
      lastUpdated: "2026-05-26",
      readingTime: 10,
      tags: ["codex", "agent-ai-coding", "workflow", "study"]
    },
    {
      id: "agent-workflow",
      title: "Agent AI Coding 작업 흐름",
      shortTitle: "Agent Workflow",
      file: "codex/agent-workflow.html",
      icon: "A",
      category: "codex",
      description: "작은 작업, 장기 목표, 병렬 에이전트, 리뷰 루프를 언제 어떻게 나눌지 정리합니다.",
      lastUpdated: "2026-05-26",
      readingTime: 12,
      tags: ["agent", "goal-mode", "review", "workflow"]
    },
    {
      id: "agent-design",
      title: "Agent 설계와 운영 기준",
      shortTitle: "Agent Design",
      file: "codex/agent-design.html",
      icon: "G",
      category: "codex",
      description: "Codex subagents, skills, hooks, MCP, RAG를 어떤 기준으로 나누고 운영할지 정리합니다.",
      lastUpdated: "2026-05-26",
      readingTime: 14,
      tags: ["agent", "subagents", "skills", "hooks", "mcp", "rag"]
    },
    {
      id: "custom-agents",
      title: "Custom Agents 템플릿",
      shortTitle: "Custom Agents",
      file: "codex/custom-agents.html",
      icon: "W",
      category: "codex",
      description: "반복되는 explorer, worker, reviewer, docs-maintainer 역할을 Codex custom agent로 분리하는 기준과 템플릿입니다.",
      lastUpdated: "2026-05-26",
      readingTime: 14,
      tags: ["custom-agents", "subagents", "explorer", "worker", "reviewer"]
    },
    {
      id: "agentic-roadmap",
      title: "Agentic Coding Roadmap",
      shortTitle: "Roadmap",
      file: "codex/roadmap.html",
      icon: "P",
      category: "codex",
      description: "AI 코딩 학습 사이트를 어떤 순서로 확장할지 정리한 장기 계획입니다.",
      lastUpdated: "2026-05-26",
      readingTime: 10,
      tags: ["roadmap", "agentic-coding", "planning"]
    },
    {
      id: "agentic-stack",
      title: "Agentic Coding Stack 변화",
      shortTitle: "Agentic Stack",
      file: "codex/agentic-stack.html",
      icon: "D",
      category: "codex",
      description: "벡터 저장소, RAG, 멀티 agent, eval, MCP가 코딩 환경을 어떻게 바꾸는지 정리합니다.",
      lastUpdated: "2026-05-26",
      readingTime: 12,
      tags: ["vector-store", "rag", "multi-agent", "evals", "mcp"]
    },
    {
      id: "agentic-rag",
      title: "Agentic RAG 운영 기준",
      shortTitle: "Agentic RAG",
      file: "codex/agentic-rag.html",
      icon: "R",
      category: "codex",
      description: "repo search, file search, vector store, eval을 agentic coding workflow에 언제 연결할지 정리합니다.",
      lastUpdated: "2026-05-26",
      readingTime: 15,
      tags: ["rag", "retrieval", "vector-store", "file-search", "evals"]
    },
    {
      id: "versioning-policy",
      title: "Claude Legacy와 모델 업데이트 정책",
      shortTitle: "Version Policy",
      file: "codex/versioning-policy.html",
      icon: "V",
      category: "reference",
      description: "Claude Code 자료를 어떻게 재작성하고, GPT-5.5처럼 계속 바뀌는 모델 기준을 어떻게 관리할지 정리합니다.",
      lastUpdated: "2026-05-26",
      readingTime: 9,
      tags: ["claude-code", "model-updates", "versioning", "maintenance"]
    },
    {
      id: "codex-update-routine",
      title: "Codex 업데이트 루틴",
      shortTitle: "Update Routine",
      file: "codex/update-routine.html",
      icon: "U",
      category: "codex",
      description: "Codex changelog, feature maturity, models, subagents, skills, hooks, MCP를 월간으로 확인하고 반영하는 기준입니다.",
      lastUpdated: "2026-05-26",
      readingTime: 12,
      tags: ["updates", "maintenance", "changelog", "models", "codex"]
    },
    {
      id: "codex-skills",
      title: "Codex Skills와 재사용 루틴",
      shortTitle: "Skills",
      file: "codex/skills.html",
      icon: "S",
      category: "codex",
      description: "반복 작업을 skill, 체크리스트, 자동화 중 어디에 둘지 판단하는 기준입니다.",
      lastUpdated: "2026-05-26",
      readingTime: 9,
      tags: ["skills", "automation", "reuse"]
    },
    {
      id: "codex-hooks",
      title: "Codex Hooks 운영 기준",
      shortTitle: "Hooks",
      file: "codex/hooks.html",
      icon: "H",
      category: "codex",
      description: "Codex hook을 언제 쓰고, 언제 AGENTS.md, 테스트, 리뷰 루프로 충분한지 정리합니다.",
      lastUpdated: "2026-05-26",
      readingTime: 13,
      tags: ["hooks", "guardrails", "automation", "verification"]
    },
    {
      id: "mcp-connectors",
      title: "MCP, Plugins, Connectors",
      shortTitle: "Tools",
      file: "codex/mcp-connectors.html",
      icon: "T",
      category: "tools",
      description: "외부 도구 연결을 기능보다 권한, 검증, 실패 복구 관점에서 정리합니다.",
      lastUpdated: "2026-05-26",
      readingTime: 11,
      tags: ["mcp", "plugins", "connectors", "security"]
    },
    {
      id: "browser-computer-use",
      title: "Browser와 Computer Use",
      shortTitle: "Browser",
      file: "codex/browser-computer-use.html",
      icon: "B",
      category: "tools",
      description: "프론트엔드, 로컬 앱, 원격 컴퓨터 작업을 화면 증거와 함께 검증하는 방식입니다.",
      lastUpdated: "2026-05-26",
      readingTime: 9,
      tags: ["browser", "computer-use", "frontend", "verification"]
    },
    {
      id: "updates",
      title: "업데이트 루틴",
      shortTitle: "Updates",
      file: "updates/index.html",
      icon: "U",
      category: "updates",
      description: "빠르게 변하는 AI 코딩 도구를 월간 루틴으로 확인하고 발행하는 방식입니다.",
      lastUpdated: "2026-05-26",
      readingTime: 8,
      tags: ["updates", "release-notes", "routine"]
    },
    {
      id: "codex-2026-05",
      title: "2026년 5월 Codex 업데이트 메모",
      shortTitle: "2026-05",
      file: "updates/2026-05-codex.html",
      icon: "M",
      category: "updates",
      description: "Appshots, goal mode, browser annotations, remote access 등 2026년 5월 변화 정리입니다.",
      lastUpdated: "2026-05-26",
      readingTime: 7,
      tags: ["codex", "release-notes", "goal-mode", "appshots"]
    },
    {
      id: "update-2026",
      title: "Claude Code 2026 종합 업데이트",
      shortTitle: "2026 Update",
      file: "update-2026.html",
      icon: "U",
      category: "legacy",
      description: "원격에 추가되어 있던 Claude Code 2026 업데이트 HTML 문서입니다.",
      lastUpdated: "2026-03-01",
      readingTime: 18,
      tags: ["claude-code", "legacy", "update"]
    },
    {
      id: "monorepo",
      title: "AI 시대 모노레포 가이드",
      shortTitle: "Monorepo",
      file: "monorepo.html",
      icon: "M",
      category: "practice",
      description: "AI 코딩 도구와 함께 효율적으로 개발하기 위한 모노레포 구조 가이드입니다.",
      lastUpdated: "2026-03-01",
      readingTime: 25,
      tags: ["monorepo", "pnpm", "turborepo", "typescript", "ai-coding"]
    },
    {
      id: "product-page",
      title: "제품 상세페이지 가이드",
      shortTitle: "Product Page",
      file: "product-page.html",
      icon: "P",
      category: "practice",
      description: "AI와 함께 제품 상세페이지를 설계하고 구현하는 공개 학습 자료입니다.",
      lastUpdated: "2026-03-01",
      readingTime: 20,
      tags: ["product-page", "design", "copywriting"]
    },
    {
      id: "video-animation",
      title: "영상/애니메이션 가이드",
      shortTitle: "Video",
      file: "video-animation.html",
      icon: "V",
      category: "practice",
      description: "AI 시대의 영상과 애니메이션 제작 흐름을 정리한 자료입니다.",
      lastUpdated: "2026-03-01",
      readingTime: 20,
      tags: ["video", "animation", "creative"]
    },
    {
      id: "orchestration",
      title: "Claude Code 오케스트레이션 가이드",
      shortTitle: "Claude Legacy",
      file: "orchestration.html",
      icon: "L",
      category: "legacy",
      description: "Claude Code 기준으로 작성된 Skill, Agent, Hook 조합 자료입니다. Codex 기준으로 재해석할 참고 자료로 보관합니다.",
      lastUpdated: "2026-01-09",
      readingTime: 20,
      tags: ["claude-code", "legacy", "agent", "hook", "workflow"]
    },
    {
      id: "mcp",
      title: "Claude Code MCP 연계 가이드",
      shortTitle: "MCP Legacy",
      file: "mcp-guide.html",
      icon: "M",
      category: "legacy",
      description: "Claude Code 기준 MCP 연계 자료입니다. Codex의 MCP, plugin, connector 설명으로 점진적으로 옮깁니다.",
      lastUpdated: "2026-01-09",
      readingTime: 25,
      tags: ["mcp", "claude-code", "legacy", "integration"]
    },
    {
      id: "reference",
      title: "출처와 용어 지도",
      shortTitle: "Reference",
      file: "reference/index.html",
      icon: "R",
      category: "reference",
      description: "공식 출처, 확인 주기, 용어를 한 곳에 모아 최신성을 관리합니다.",
      lastUpdated: "2026-05-26",
      readingTime: 6,
      tags: ["sources", "glossary", "reference"]
    },
    {
      id: "content-audit",
      title: "기존 자료 감사표",
      shortTitle: "Content Audit",
      file: "reference/content-audit.html",
      icon: "A",
      category: "reference",
      description: "기존 Claude Code 원본과 공개 HTML 문서를 keep, rewrite, legacy, later로 분류한 작업 지도입니다.",
      lastUpdated: "2026-05-26",
      readingTime: 12,
      tags: ["audit", "legacy", "rewrite", "roadmap"]
    },
    {
      id: "legacy-map",
      title: "Legacy 원본 매핑",
      shortTitle: "Legacy Map",
      file: "reference/legacy-map.html",
      icon: "M",
      category: "reference",
      description: "Claude Code 원본 MD, 기존 HTML, 새 Codex 문서의 흡수 관계를 1:1로 추적합니다.",
      lastUpdated: "2026-05-26",
      readingTime: 10,
      tags: ["legacy", "mapping", "claude-code", "audit"]
    },
    {
      id: "legacy",
      title: "Claude Code Legacy 자료",
      shortTitle: "Legacy",
      file: "legacy/index.html",
      icon: "L",
      category: "legacy",
      description: "기존 Claude Code 문서를 Codex 기준과 혼동하지 않도록 보관합니다.",
      lastUpdated: "2026-05-26",
      readingTime: 5,
      tags: ["legacy", "claude-code", "archive"]
    }
  ],

  categories: {
    codex: { name: "Codex Core", color: "indigo" },
    tools: { name: "Tools and Context", color: "emerald" },
    updates: { name: "Updates", color: "amber" },
    practice: { name: "Practice Guides", color: "rose" },
    reference: { name: "Reference", color: "cyan" },
    legacy: { name: "Legacy", color: "slate" }
  },

  theme: {
    defaultMode: "light",
    colors: {
      primary: "#6366f1",
      secondary: "#8b5cf6",
      accent: "#06b6d4"
    }
  },

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

const DocsUtils = {
  getDocById(id) {
    return DocsConfig.documents.find(doc => doc.id === id);
  },

  getCurrentDoc() {
    const path = window.location.pathname.replace(/^\/+/, "");
    const filename = path || "index.html";
    return DocsConfig.documents.find(doc => doc.file === filename || doc.file.endsWith(filename));
  },

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

  getDocsByTag(tag) {
    return DocsConfig.documents.filter(doc => doc.tags.includes(tag));
  },

  getAllTags() {
    const tags = new Set();
    DocsConfig.documents.forEach(doc => {
      doc.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  },

  formatReadingTime(minutes) {
    return `약 ${minutes}분`;
  },

  formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }
};

window.DocsConfig = DocsConfig;
window.DocsUtils = DocsUtils;
