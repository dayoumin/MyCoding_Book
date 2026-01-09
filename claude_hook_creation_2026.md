# Claude Code Hook 생성 가이드 (2026년 업데이트)

**작성일:** 2026년 1월
**기반:** Claude Code v2.1.0+

Claude Code 내장 `/hook-creator` 스킬이 아직 반영하지 못한 **2026년 1월 신규 기능**을 포함한 완전한 Hook 생성 가이드입니다.

---

## 목차

1. [Hook 개요](#1-hook-개요)
2. [Hook 종류 (3가지)](#2-hook-종류-3가지)
3. [Global Hooks (settings.json)](#3-global-hooks-settingsjson)
4. [Agent Hooks (AGENT.md)](#4-agent-hooks-agentmd)
5. [Skill Hooks (SKILL.md)](#5-skill-hooks-skillmd)
6. [Prompt-Based Hooks (2026 신규)](#6-prompt-based-hooks-2026-신규)
7. [Bash vs Prompt 선택 가이드](#7-bash-vs-prompt-선택-가이드)
8. [실전 예시](#8-실전-예시)
9. [마이그레이션 가이드](#9-마이그레이션-가이드)

---

## 1. Hook 개요

**Hook**은 Claude Code의 특정 시점에 실행되는 **검증/변환/알림** 로직입니다.

### Hook 실행 시점

| Hook 이벤트 | 시점 | 용도 |
|------------|------|------|
| `preToolUse` | 도구 실행 전 | 차단, 검증, 승인 |
| `postToolUse` | 도구 실행 후 | 검증, 변환, 알림 |
| `SubagentStop` | Agent 종료 후 | 결과 검증, 통합 |
| `PreSkillUse` | Skill 실행 전 | 요청 검증 |
| `PostSkillUse` | Skill 실행 후 | 결과 검증 |

### Hook 종류 (저장 위치별)

| 위치 | 범위 | 파일 |
|------|------|------|
| **Global** | 전역 (모든 프로젝트) | `~/.claude/settings.json` |
| **Project** | 프로젝트별 | `.claude/settings.json` |
| **Agent** | 특정 Agent | `.claude/agents/{name}.md` |
| **Skill** | 특정 Skill | `.claude/skills/{name}/SKILL.md` |

---

## 2. Hook 종류 (3가지)

### 2.1 Global/Project Hooks

**위치**: `.claude/settings.json` 또는 `~/.claude/settings.json`
**범위**: 모든 도구 호출
**타입**: Bash Hook, Prompt Hook

### 2.2 Agent Hooks

**위치**: `.claude/agents/{name}.md` frontmatter
**범위**: 해당 Agent 내부에서만
**타입**: Prompt Hook만

### 2.3 Skill Hooks

**위치**: `.claude/skills/{name}/SKILL.md` frontmatter
**범위**: 해당 Skill 실행 전/후
**타입**: Prompt Hook만

---

## 3. Global Hooks (settings.json)

### 3.1 Bash Hook (기존)

**구조:**
```jsonc
// .claude/settings.json
{
  "hooks": {
    "<EventName>": [
      {
        "matcher": "<ToolPattern>",
        "hooks": [
          {
            "type": "command",
            "command": "<shell-command>"
          }
        ]
      }
    ]
  }
}
```

**예시:**
```jsonc
{
  "hooks": {
    "preToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/scripts/validate-file.js"
          }
        ]
      }
    ]
  }
}
```

**특징:**
- ✅ 빠름 (< 100ms)
- ✅ 정확함 (규칙 기반)
- ❌ 복잡한 로직 구현 어려움
- ❌ 자연어 처리 불가

### 3.2 Prompt Hook (2026 신규)

**구조:**
```jsonc
{
  "hooks": {
    "<EventName>": [
      {
        "matcher": "<ToolPattern>",
        "hooks": [
          {
            "type": "prompt",
            "prompt": "<validation-prompt>"
          }
        ]
      }
    ]
  }
}
```

**예시:**
```jsonc
{
  "hooks": {
    "preToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "prompt",
            "prompt": "다음 파일 수정을 검증하세요:\n1. .env, package.json은 차단\n2. 중요한 설정 파일인가?\n3. 수정이 안전한가?\n문제 시 차단하고 사유 설명."
          }
        ]
      }
    ]
  }
}
```

**특징:**
- ✅ 유연함 (컨텍스트 기반)
- ✅ 자연어 처리 가능
- ⚠️ 느림 (~1-2초)
- ⚠️ 정확도 ~95% (LLM)

### 3.3 Matcher 패턴

| Matcher | 매칭 대상 |
|---------|----------|
| `*` | 모든 도구 |
| `Bash` | Bash 도구만 |
| `Edit\|Write` | Edit 또는 Write |
| `Read` | Read 도구만 |
| `mcp__*` | 모든 MCP 도구 |
| `mcp__github__*` | GitHub MCP 도구 |

### 3.4 Exit Code (Bash Hook)

| 종료 코드 | 의미 |
|----------|------|
| `0` | 성공 (계속 진행) |
| `2` | 차단 (작업 중단) |

---

## 4. Agent Hooks (AGENT.md)

**도입:** 2026년 1월 (Claude Code v2.1.0+)

### 개념

Agent frontmatter에 Hook을 정의하면 **해당 Agent 내부에서만 발동**합니다.

### 구조

```yaml
---
name: my-agent
description: 내 에이전트
hooks:
  preToolUse:
    - matcher: Write
      type: prompt
      prompt: |
        파일 생성 전 검증...
  postToolUse:
    - matcher: Bash
      type: prompt
      prompt: |
        명령 실행 후 검증...
---
```

### 특징

- ✅ Agent별 맞춤 검증
- ✅ 전역 Hook과 분리
- ✅ Agent 재사용성 향상
- ⚠️ Prompt Hook만 지원 (Bash 불가)

### 예시

```yaml
---
name: test-creator
description: 테스트 생성 Agent
model: inherit
permissionMode: acceptEdits
hooks:
  preToolUse:
    - matcher: Write
      type: prompt
      prompt: |
        테스트 파일 생성 전 검증:
        1. 파일 경로가 subjects/*.ts인가?
        2. 중복 파일이 아닌가?
        3. 필수 필드 모두 있는가?
        문제 시 차단.
  postToolUse:
    - matcher: Write
      type: prompt
      prompt: |
        생성된 파일 검증:
        1. TypeScript 타입 에러 없는가?
        2. 모든 필수 필드 존재하는가?
        3. 테스트 ID 중복 없는가?
        문제 발견 시 자동 수정.
---
```

---

## 5. Skill Hooks (SKILL.md)

**도입:** 2026년 1월 (Claude Code v2.1.0+)

### 개념

Skill frontmatter에 Hook을 정의하면 **Skill 실행 전/후**에 발동합니다.

### 구조

```yaml
---
name: my-skill
description: 내 스킬
hooks:
  - event: PreSkillUse
    prompt: |
      Skill 실행 전 검증...
  - event: PostSkillUse
    prompt: |
      Skill 실행 후 검증...
---
```

### 특징

- ✅ Skill별 맞춤 검증
- ✅ 요청/결과 검증 자동화
- ✅ Skill 품질 보장
- ⚠️ Prompt Hook만 지원

### 예시

```yaml
---
name: content-workflow
description: 콘텐츠 생성 워크플로우
context: fork
agent: general-purpose
hooks:
  - event: PreSkillUse
    prompt: |
      콘텐츠 생성 요청 검증:

      1. **성인 콘텐츠 여부**:
         - 술/도박/성적 암시 관련인가?
         - 연령 제한 필요한가?

      2. **저작권 문제**:
         - 특정 브랜드/저작물 언급하는가?
         - 허가 없이 사용 가능한가?

      3. **적절한 개수**:
         - 1-20개 범위인가?

      문제 발견 시 차단하고 대안 제시.

  - event: PostSkillUse
    prompt: |
      생성된 콘텐츠 검증:

      1. **형식 정확성**:
         - JSON 형식이 올바른가?
         - 필수 필드 모두 있는가?

      2. **품질 확인**:
         - 중복 내용 없는가?
         - 의미 일치하는가?
         - 태그가 적절한가?

      3. **차별성**:
         - 선택지가 명확히 구분되는가?

      문제 발견 시 개선 제안.
---
```

---

## 6. Prompt-Based Hooks (2026 신규)

### 6.1 Bash Hook의 한계

**기존 Bash Hook:**
```javascript
// .claude/scripts/validate-pr.js
const input = JSON.parse(process.env.CLAUDE_TOOL_INPUT || '{}');

if (input.base === 'main') {
  const title = input.title || '';
  if (!title.startsWith('[FEAT]') && !title.startsWith('[FIX]')) {
    console.error("PR 제목은 [FEAT] 또는 [FIX]로 시작해야 합니다.");
    process.exit(2);
  }
}

process.exit(0);
```

**문제점:**
- PR **내용의 의미**를 분석할 수 없음
- "왜 변경했는지" 판단 불가
- 규칙 추가할 때마다 코드 수정

### 6.2 Prompt Hook의 강점

**Prompt Hook:**
```jsonc
{
  "hooks": {
    "preToolUse": [{
      "matcher": "mcp__github__create_pull_request",
      "hooks": [{
        "type": "prompt",
        "prompt": `GitHub PR 생성 전 검증:

        1. **제목 규칙**:
           - main 브랜치 PR은 [FEAT] 또는 [FIX]로 시작
           - 명확하고 구체적인 설명

        2. **내용 품질**:
           - PR 설명이 충분히 상세한가?
           - "무엇을" 뿐만 아니라 "왜" 변경했는지 설명되었나?
           - 테스트 계획이 있는가?

        3. **브랜치 전략**:
           - main으로 직접 PR하는 게 적절한가?

        문제가 있으면 차단하고 개선 제안.`
      }]
    }]
  }
}
```

**효과:**
- ✅ PR 내용의 **의미** 분석
- ✅ "왜"를 이해하고 판단
- ✅ 자연어로 정책 정의
- ✅ 규칙 변경이 쉬움

### 6.3 2단계 검증 패턴

**Best Practice: Bash + Prompt 조합**

```jsonc
{
  "hooks": {
    "preToolUse": [
      {
        "matcher": "mcp__github__create_pull_request",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/scripts/pr-basic-check.js",
            "description": "1단계: 형식 검증 (빠름, 정확)"
          },
          {
            "type": "prompt",
            "prompt": "2단계: 내용 품질 검증 (의미 분석)",
            "description": "상세 검증"
          }
        ]
      }
    ]
  }
}
```

**전략:**
1. **Bash Hook**: 빠른 형식 검증 (< 100ms)
   - 제목 길이, 브랜치명 형식
   - 파일 존재, 확장자 체크

2. **Prompt Hook**: 의미/품질 검증 (~1-2초)
   - 설명 충실도, 테스트 계획
   - 코드 품질, 보안 검토

---

## 7. Bash vs Prompt 선택 가이드

### 7.1 비교표

| 기준 | Bash Hook | Prompt Hook |
|------|-----------|-------------|
| **속도** | 빠름 (< 100ms) | 느림 (~1-2초) |
| **정확도** | 100% (규칙 기반) | ~95% (LLM 판단) |
| **유연성** | 낮음 (하드코딩) | 높음 (컨텍스트) |
| **유지보수** | 어려움 (코드 수정) | 쉬움 (프롬프트) |
| **자연어 처리** | 불가 | 가능 |
| **파일 조작** | 가능 | 불가 |
| **외부 API** | 가능 | 불가 |
| **복잡한 계산** | 가능 | 부적합 |

### 7.2 선택 가이드

| 상황 | 권장 | 이유 |
|------|------|------|
| API 키 형식 체크 | Bash | 100% 정확성 필요 |
| SQL 쿼리 안전성 | Prompt | 의미 분석 필요 |
| 파일 크기 확인 | Bash | 단순 계산 |
| PR 내용 품질 | Prompt | 의미 이해 필요 |
| 빠른 검증 필요 | Bash | 성능 우선 |
| 정책 자주 변경 | Prompt | 유지보수 우선 |
| 파일 읽기/쓰기 | Bash | 파일 조작 필요 |
| 비용 예측 | Prompt | LLM 추론 필요 |

### 7.3 조합 패턴

**패턴 1: 순차 검증**
```jsonc
{
  "preToolUse": [
    { "type": "command", "command": "basic-check.js" },  // 1단계
    { "type": "prompt", "prompt": "상세 검증..." }       // 2단계
  ]
}
```

**패턴 2: 역할 분담**
```jsonc
{
  "preToolUse": [
    { "matcher": "Edit", "type": "command", "command": "format-check.js" },
    { "matcher": "Edit", "type": "prompt", "prompt": "품질 검증..." }
  ],
  "postToolUse": [
    { "matcher": "Edit", "type": "command", "command": "lint.js" },
    { "matcher": "Edit", "type": "prompt", "prompt": "코드 리뷰..." }
  ]
}
```

---

## 8. 실전 예시

### 8.1 파일 보호 (Global Hook)

**Bash Hook (빠름, 정확):**
```jsonc
{
  "hooks": {
    "preToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{
        "type": "command",
        "command": "python3 -c \"import json,sys; p=json.load(sys.stdin).get('tool_input',{}).get('file_path',''); sys.exit(2 if any(x in p for x in ['.env', 'package.json', 'CLAUDE.md']) else 0)\""
      }]
    }]
  }
}
```

**Prompt Hook (유연):**
```jsonc
{
  "hooks": {
    "preToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{
        "type": "prompt",
        "prompt": `다음 파일은 수정 금지:
        - .env (환경 변수)
        - package.json (의존성)
        - CLAUDE.md (프로젝트 규칙)

        수정 시도 시 차단하고 사유 설명.`
      }]
    }]
  }
}
```

### 8.2 코드 품질 검증 (Agent Hook)

```yaml
---
name: code-writer
description: 코드 작성 Agent
model: inherit
permissionMode: acceptEdits
hooks:
  preToolUse:
    - matcher: Write
      type: prompt
      prompt: |
        새 파일 생성 전 검증:
        1. 파일명이 적절한가?
        2. 디렉토리 구조가 올바른가?
        3. 중복 파일이 아닌가?

  postToolUse:
    - matcher: Write
      type: prompt
      prompt: |
        생성된 코드 검증:
        1. TypeScript 타입 에러 없는가?
        2. ESLint 규칙 준수하는가?
        3. console.log 디버깅 코드 남아있는가?
        4. TODO 주석 있는가?

        문제 발견 시 자동 수정.
---
```

### 8.3 워크플로우 검증 (Skill Hook)

```yaml
---
name: test-workflow
description: 테스트 생성 워크플로우
context: fork
hooks:
  - event: PreSkillUse
    prompt: |
      테스트 생성 전 검증:

      1. **리서치 파일**:
         - research/{subject}.md 존재하는가?
         - 형식이 올바른가? (RESEARCH_RESULT.md 형식)

      2. **중복 확인**:
         - subjects/{subject}.ts 이미 있는가?
         - 덮어쓰기를 원하는가?

      3. **주제 적절성**:
         - 성인 콘텐츠 아닌가?
         - 저작권 문제 없는가?

      문제 시 차단하고 필요한 조치 안내.

  - event: PostSkillUse
    prompt: |
      테스트 생성 결과 검증:

      1. **파일 생성**:
         - 8개 파일 모두 수정되었는가?
           * subjects/{subject}.ts
           * types.ts, config.ts, index.ts
           * Icons.js, page.tsx
           * validate-test-data.mjs
           * test-tag-mappings.ts

      2. **빌드 성공**:
         - npm run build 통과했는가?
         - 타입 에러 없는가?

      3. **품질 확인**:
         - 질문 수 적절한가? (10-20개)
         - 중복 질문 없는가?
         - 태그 매핑 추가되었는가?

      문제 발견 시 상세 보고 및 수정 제안.
---
```

### 8.4 Database 쿼리 안전성 (Global + Prompt)

```jsonc
{
  "hooks": {
    "preToolUse": [{
      "matcher": "mcp__database__execute_query",
      "hooks": [{
        "type": "prompt",
        "prompt": `데이터베이스 쿼리 실행 전 검증:

        1. **읽기 전용 여부**:
           - SELECT만 허용
           - UPDATE/DELETE/DROP 차단
           - WHERE 절 없는 UPDATE/DELETE 절대 금지

        2. **성능 영향**:
           - 전체 테이블 스캔 예상되는가?
           - JOIN이 과도한가?
           - LIMIT 절 필요한가?

        3. **보안**:
           - SQL 인젝션 위험 있는가?
           - 민감한 테이블(users, credentials) 조회하는가?

        위험하거나 비효율적이면 차단하고 대안 제시.`
      }]
    }]
  }
}
```

### 8.5 MCP GitHub PR 검증 (2단계)

```jsonc
{
  "hooks": {
    "preToolUse": [
      {
        "matcher": "mcp__github__create_pull_request",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/scripts/pr-format-check.js",
            "description": "1단계: 형식 검증"
          },
          {
            "type": "prompt",
            "prompt": `2단계: PR 내용 품질 검증:

            1. **제목**:
               - [FEAT]/[FIX] 접두사 있는가?
               - 명확하고 구체적인가?

            2. **설명**:
               - "무엇을" 변경했는지 명확한가?
               - "왜" 변경했는지 설명되었나?
               - 테스트 계획 포함되었나?

            3. **변경 범위**:
               - 변경 파일 수가 적절한가?
               - 여러 기능이 섞여있지 않은가?
               - 더 작은 PR로 나눌 수 있는가?

            문제 발견 시 개선 제안.`,
            "description": "2단계: 품질 검증"
          }
        ]
      }
    ]
  }
}
```

---

## 9. 마이그레이션 가이드

### 9.1 Bash Hook → Prompt Hook

**Before (Bash):**
```javascript
// .claude/scripts/validate-edit.js
const fs = require('fs');
const input = JSON.parse(process.env.CLAUDE_TOOL_INPUT || '{}');
const filePath = input.file_path || '';

// .env 파일 차단
if (filePath.includes('.env')) {
  console.error(".env 파일은 수정할 수 없습니다.");
  process.exit(2);
}

// package.json 차단
if (filePath.includes('package.json')) {
  console.error("package.json은 신중하게 수정해야 합니다.");
  process.exit(2);
}

process.exit(0);
```

**After (Prompt):**
```jsonc
{
  "hooks": {
    "preToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{
        "type": "prompt",
        "prompt": `파일 수정 전 검증:

        1. **보호 파일**:
           - .env, .env.* 파일은 절대 차단
           - package.json은 신중하게 (이유 확인)
           - CLAUDE.md는 차단 (프로젝트 규칙)

        2. **민감한 파일**:
           - credentials, secrets, keys 포함 경로는 검토
           - 수정 이유가 명확한가?

        문제 시 차단하고 대안 제시.`
      }]
    }]
  }
}
```

### 9.2 Global Hook → Agent Hook

**Before (Global):**
```jsonc
// .claude/settings.json
{
  "hooks": {
    "postToolUse": [{
      "matcher": "Write",
      "hooks": [{
        "type": "command",
        "command": "node .claude/scripts/validate-test.js"
      }]
    }]
  }
}
```

**문제점:**
- 모든 Write에 발동 (불필요한 검증)
- test-creator 외에도 발동

**After (Agent Hook):**
```yaml
# .claude/agents/test-creator.md
---
name: test-creator
hooks:
  postToolUse:
    - matcher: Write
      type: prompt
      prompt: |
        테스트 파일 생성 후 검증:
        1. 형식이 올바른가?
        2. 필수 필드 있는가?
        3. 중복 없는가?
---
```

**효과:**
- ✅ test-creator 내부에서만 발동
- ✅ 정확한 타겟팅
- ✅ 다른 Agent에 영향 없음

### 9.3 체크리스트

#### Bash → Prompt 전환 고려 시

- [ ] 복잡한 if-else 로직이 많은가?
- [ ] 자연어 처리가 필요한가?
- [ ] 의미/맥락 이해가 필요한가?
- [ ] 정책이 자주 변경되는가?
- [ ] 성능이 크게 중요하지 않은가?

**3개 이상 YES → Prompt Hook 전환 고려**

#### Global → Agent/Skill Hook 전환 고려 시

- [ ] 특정 Agent/Skill에서만 필요한가?
- [ ] 다른 곳에서는 불필요한 검증인가?
- [ ] Agent/Skill별로 다른 검증 필요한가?

**2개 이상 YES → Agent/Skill Hook 전환 권장**

---

## 참고 문서

- **Skill 생성**: [claude_skill_creation_2026.md](claude_skill_creation_2026.md)
- **Agent 생성**: subagent-creator (2026 기능 완전 반영됨)
- **오케스트레이션**: [claude_orchestration_guide.md](claude_orchestration_guide.md)
- **MCP 통합**: [claude_mcp_integration_guide.md](claude_mcp_integration_guide.md)

---

**작성자**: Claude Sonnet 4.5
**최종 업데이트**: 2026년 1월 9일
