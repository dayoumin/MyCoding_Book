# Claude Code Skill 생성 가이드 (2026년 업데이트)

**작성일:** 2026년 1월
**기반:** Claude Code v2.1.0+

Claude Code 내장 `/skill-creator` 스킬이 아직 반영하지 못한 **2026년 1월 신규 기능**을 포함한 완전한 Skill 생성 가이드입니다.

---

## 목차

1. [Skill 구조](#1-skill-구조)
2. [2026년 신규 Frontmatter 필드](#2-2026년-신규-frontmatter-필드)
3. [context: fork (컨텍스트 격리)](#3-context-fork-컨텍스트-격리)
4. [agent: 위임](#4-agent-위임)
5. [skills: 자동 로딩](#5-skills-자동-로딩)
6. [hooks: Skill-level Hooks](#6-hooks-skill-level-hooks)
7. [완전한 예시](#7-완전한-예시)
8. [마이그레이션 가이드](#8-마이그레이션-가이드)

---

## 1. Skill 구조

### 기본 구조

```
skill-name/
├── SKILL.md (필수)
│   ├── YAML frontmatter (필수)
│   └── Markdown 본문 (필수)
└── Bundled Resources (선택)
    ├── scripts/
    ├── references/
    └── assets/
```

### SKILL.md 최소 구조

```yaml
---
name: skill-name
description: When to use this skill
---

# Skill Instructions

Skill 사용 방법...
```

---

## 2. 2026년 신규 Frontmatter 필드

| 필드 | 필수 | 기본값 | 설명 |
|------|------|--------|------|
| `name` | ✅ | - | Skill 이름 (소문자, 하이픈) |
| `description` | ✅ | - | 언제 사용하는지 (트리거) |
| `context` | ❌ | `default` | 컨텍스트 격리 여부 |
| `agent` | ❌ | - | 작업 위임할 Agent |
| `skills` | ❌ | - | 자동 로딩할 하위 Skill |
| `hooks` | ❌ | - | Skill-level Hooks |

### 완전한 Frontmatter 예시

```yaml
---
name: advanced-workflow
description: 복잡한 워크플로우 처리. "전체 검증해줘" 요청 시 자동 실행.
context: fork
agent: general-purpose
skills:
  - validation-skill
  - reporting-skill
hooks:
  - event: PreSkillUse
    prompt: |
      사용자 요청이 다음 조건을 만족하는지 확인:
      1. 충분히 구체적인가?
      2. 필요한 파일이 존재하는가?
      불충분하면 차단하고 필요한 정보 요청.
  - event: PostSkillUse
    prompt: |
      워크플로우 결과 검증:
      1. 모든 단계가 완료되었는가?
      2. 에러가 없는가?
      문제 발견 시 상세 보고.
---
```

---

## 3. context: fork (컨텍스트 격리)

**도입:** 2026년 1월 (Claude Code v2.1.0+)

### 개념

Skill이 Agent를 호출할 때 **컨텍스트 공유 여부**를 제어합니다.

| 값 | 설명 |
|-----|------|
| `default` | Agent가 메인 세션의 전체 대화 기록 볼 수 있음 (기본값) |
| `fork` | Agent가 Skill 프롬프트만 보고 시작 (격리) |

### 언제 사용하나?

| 상황 | context | 이유 |
|------|---------|------|
| 순차 작업 (파이프라인) | `default` | 이전 결과 필요 |
| 독립 검증 (리뷰) | `fork` | 편향 제거 |
| 병렬 분석 | `fork` | 독립 판단 |
| 사용자 대화 연속 | `default` | 맥락 유지 |

### 예시

**검증 워크플로우 (fork 사용):**

```yaml
---
name: code-audit
description: 코드 감사 워크플로우. 3단계 독립 검증.
context: fork
---

# 코드 감사 워크플로우

## 프로세스

```
Step 1: code-analyzer Agent (구조 분석)
   ↓
Step 2: security-reviewer Agent (보안 검증, 독립)
   ↓
Step 3: performance-checker Agent (성능 검증, 독립)
```

**각 Agent가 이전 결과의 영향 없이 독립적으로 분석합니다.**

## 실행

1. Task 도구로 code-analyzer 호출
2. Task 도구로 security-reviewer 호출 (격리)
3. Task 도구로 performance-checker 호출 (격리)
4. 세 결과를 종합하여 최종 리포트 생성
```

**효과:**
- ✅ analyzer가 "괜찮다"고 해도 reviewer는 독립 판단
- ✅ 진정한 3중 검증
- ✅ 편향 없는 분석

---

## 4. agent: 위임

**도입:** 2026년 1월 (Claude Code v2.1.0+)

### 개념

Skill이 작업을 **특정 Agent에게 위임**할 수 있습니다.

```yaml
---
name: complex-task
agent: general-purpose  # 이 Agent가 작업 수행
---
```

### 사용 가능한 값

- `general-purpose` - 범용 Agent
- 프로젝트의 커스텀 Agent 이름

### 언제 사용하나?

| 상황 | agent | 이유 |
|------|-------|------|
| 단순 명령 | (없음) | Skill이 직접 처리 |
| 복잡한 탐색 필요 | `general-purpose` | Agent가 판단 |
| 전문화된 작업 | `custom-agent` | 특화된 Agent |

### 예시

```yaml
---
name: test-workflow
description: 테스트 생성 전체 워크플로우
context: fork
agent: general-purpose
---

# 테스트 생성 워크플로우

이 Skill은 general-purpose Agent에게 작업을 위임합니다.

## Agent가 할 일

1. test-creator Agent 호출
2. test-auditor Agent 호출
3. test-reviewer Agent 호출
4. 결과 통합

**Agent가 자율적으로 판단하고 실행합니다.**
```

---

## 5. skills: 자동 로딩

**도입:** 2026년 1월 (Claude Code v2.1.0+)

### 개념

Skill이 **다른 Skill을 자동으로 사용**할 수 있게 명시합니다.

```yaml
---
name: parent-skill
skills:
  - validation-skill
  - helper-skill
---
```

### 효과

- ✅ Skill이 하위 Skill 존재를 인지
- ✅ 프롬프트에 "validation-skill을 사용하세요" 불필요
- ✅ 자동 워크플로우 가능

### 예시

**콘텐츠 생성 Skill:**

```yaml
---
name: content-creator
description: 퀴즈/투표 생성
skills:
  - fact-collector
  - fact-parser
  - content-generator
  - content-validator
---

# 콘텐츠 생성

## 워크플로우

1. **팩트 수집**: fact-collector로 웹검색
2. **팩트 파싱**: fact-parser로 구조화
3. **콘텐츠 생성**: content-generator로 생성
4. **검증**: content-validator로 자동 검증

**각 단계에서 해당 Skill을 자동으로 사용합니다.**
```

### Before vs After

**Before (2025):**
```markdown
## 프로세스

1. "/fact-collector"를 실행하여 팩트 수집
2. "/fact-parser"를 실행하여 파싱
3. "/content-generator"를 실행하여 생성

사용자가 각 명령을 입력해야 합니다.
```

**After (2026):**
```yaml
---
skills:
  - fact-collector
  - fact-parser
  - content-generator
---

## 프로세스

1. fact-collector로 팩트 수집
2. fact-parser로 파싱
3. content-generator로 생성

**자동으로 실행됩니다. 사용자 입력 불필요.**
```

---

## 6. hooks: Skill-level Hooks

**도입:** 2026년 1월 (Claude Code v2.1.0+)

### 개념

Skill 실행 **전/후에 LLM 프롬프트로 검증**할 수 있습니다.

### Hook 이벤트

| 이벤트 | 시점 | 용도 |
|--------|------|------|
| `PreSkillUse` | Skill 실행 전 | 요청 검증, 전제조건 확인 |
| `PostSkillUse` | Skill 실행 후 | 결과 검증, 품질 확인 |

### 구조

```yaml
---
name: my-skill
hooks:
  - event: PreSkillUse
    prompt: |
      검증 내용...
  - event: PostSkillUse
    prompt: |
      검증 내용...
---
```

### 예시 1: 요청 검증

```yaml
---
name: content-workflow
hooks:
  - event: PreSkillUse
    prompt: |
      사용자 요청을 분석하여 다음을 확인:

      1. **성인 콘텐츠 여부**:
         - 술/도박/성적 암시 관련인가?
         - 연령 제한 필요한가?

      2. **저작권 문제**:
         - 특정 브랜드/저작물 언급하는가?
         - 허가 없이 사용 가능한가?

      3. **윤리적 문제**:
         - 차별/혐오/폭력 조장하는가?

      문제 발견 시 차단하고 사유 설명.
---
```

### 예시 2: 결과 검증

```yaml
---
name: test-workflow
hooks:
  - event: PostSkillUse
    prompt: |
      테스트 생성 결과 검증:

      1. **파일 생성 확인**:
         - subjects/{name}.ts 생성되었는가?
         - 모든 필수 파일 수정되었는가?

      2. **빌드 성공**:
         - npm run build 통과했는가?
         - 타입 에러 없는가?

      3. **품질 확인**:
         - 질문 수가 적절한가? (10-20개)
         - 중복 질문 없는가?

      문제 발견 시 상세 보고.
---
```

### Bash Hook vs Prompt Hook

| 기준 | Bash Hook | Prompt Hook |
|------|-----------|-------------|
| 구현 | `.claude/settings.json` | Skill frontmatter |
| 범위 | 전역/도구별 | Skill별 |
| 로직 | 스크립트 | LLM 프롬프트 |
| 정확성 | 100% (규칙) | ~95% (판단) |
| 유연성 | 낮음 | 높음 |

---

## 7. 완전한 예시

### 예시 1: 테스트 생성 워크플로우

```yaml
---
name: test-workflow
description: 테스트 생성 전체 워크플로우. "whiskey 테스트 만들어줘" 요청 시 자동 실행. 3개 Agent 순차 호출로 3중 검증.
context: fork
agent: general-purpose
skills:
  - research-parser
  - test-generator
  - test-validator
hooks:
  - event: PreSkillUse
    prompt: |
      테스트 생성 요청 검증:
      1. 리서치 파일이 있는가? (research/{subject}.md)
      2. 중복 테스트가 아닌가? (subjects/{subject}.ts 확인)
      3. 적절한 주제인가? (성인/저작권 문제)
      문제 시 차단하고 안내.
  - event: PostSkillUse
    prompt: |
      생성 결과 검증:
      1. 8개 파일 모두 수정되었는가?
      2. 빌드 성공했는가?
      3. 태그 매핑 추가되었는가?
      문제 발견 시 상세 보고.
---

# 테스트 생성 워크플로우

## 워크플로우 (필수 순서!)

```
Step 1: test-creator Agent (생성 + 자체검증)
   ↓
Step 2: test-auditor Agent (통계 검증, 독립 컨텍스트)
   ↓
Step 3: 빌드 확인
   ↓
Step 4: test-reviewer Agent (코드 리뷰, 독립 컨텍스트)
   ↓
Step 5: 결과 통합 및 보고
```

## 실행

1. **리서치 파일 확인**
   - research/{subject}.md 존재 확인
   - 없으면 fact-collector로 생성

2. **test-creator 호출**
   ```
   Task 도구로 test-creator Agent 호출
   - 리서치 파일 전달
   - 8개 파일 생성/수정
   ```

3. **test-auditor 호출** (독립 검증)
   ```
   Task 도구로 test-auditor Agent 호출
   - context: fork로 격리
   - 통계적 검증
   ```

4. **빌드 확인**
   ```
   npm run build
   에러 시 즉시 수정
   ```

5. **test-reviewer 호출** (최종 리뷰)
   ```
   Task 도구로 test-reviewer Agent 호출
   - context: fork로 격리
   - 코드 품질 검증
   ```

## 에러 처리

각 단계에서 에러 발생 시:
1. 에러 원인 분석
2. 자동 수정 시도
3. 재검증
4. 실패 시 사용자에게 보고
```

### 예시 2: 콘텐츠 생성 워크플로우

```yaml
---
name: content-workflow
description: 퀴즈/투표/상황반응 생성. "고양이 퀴즈 10개 만들어줘" 요청 시 자동 실행. 3중 검증.
context: fork
agent: general-purpose
skills:
  - fact-collector
  - fact-parser
  - content-generator
  - content-validator
hooks:
  - event: PreSkillUse
    prompt: |
      콘텐츠 생성 요청 검증:
      1. 성인 콘텐츠인가? (술/도박/성적 암시)
      2. 저작권 문제 있는가?
      3. 개수가 적절한가? (1-20개)
      문제 시 차단하고 대안 제시.
  - event: PostSkillUse
    prompt: |
      생성된 콘텐츠 검증:
      1. 형식이 정확한가?
      2. 중복 내용 없는가?
      3. 품질이 충분한가?
      문제 발견 시 개선 제안.
---

# 콘텐츠 생성 워크플로우

## 워크플로우

```
Step 1: fact-collector (팩트 수집)
   ↓
Step 2: content-generator (콘텐츠 생성)
   ↓
Step 3: content-auditor (형식 검증, 독립)
   ↓
Step 4: content-validator (품질 검증, 독립)
```

## 지원 콘텐츠 타입

1. **Quiz** - 지식 퀴즈 (정답 있음)
2. **Poll** - 투표 (VS, 선택, 정답 없음)
3. **Reaction** - 상황별 반응

## 실행

1. **팩트 수집**
   ```
   fact-collector로 웹검색
   - 주제 관련 정보 수집
   - research/facts/{category}.md에 저장
   ```

2. **콘텐츠 생성**
   ```
   content-generator로 생성
   - 수집된 팩트 기반
   - 타입별 형식 준수
   ```

3. **형식 검증** (독립)
   ```
   content-auditor로 검증
   - 연령 등급, 태그, 형식 확인
   - context: fork로 격리
   ```

4. **품질 검증** (독립)
   ```
   content-validator로 검증
   - 의미 일치, 차별성, 균형 확인
   - context: fork로 격리
   ```
```

---

## 8. 마이그레이션 가이드

### 기존 Skill 업그레이드

**Before (2025):**
```yaml
---
name: my-skill
description: 내 스킬
---

# 스킬 사용법

1. "/helper-skill"을 먼저 실행하세요
2. 결과를 확인하세요
3. 문제 없으면 진행하세요
```

**After (2026):**
```yaml
---
name: my-skill
description: 내 스킬
context: fork
agent: general-purpose
skills:
  - helper-skill
hooks:
  - event: PreSkillUse
    prompt: "요청이 적절한지 검증"
  - event: PostSkillUse
    prompt: "결과가 올바른지 검증"
---

# 스킬 사용법

1. helper-skill이 자동 실행됨
2. 결과가 자동 검증됨
3. 문제 발견 시 자동 보고
```

### 업그레이드 체크리스트

- [ ] **context 추가**: 독립 검증 필요하면 `fork`
- [ ] **agent 추가**: 복잡한 탐색 필요하면 `general-purpose`
- [ ] **skills 추가**: 하위 Skill 사용하면 명시
- [ ] **hooks 추가**: 검증 로직이 있으면 Hook으로 전환
- [ ] **프롬프트 정리**: "~를 실행하세요" → 자동 실행으로 변경

### 마이그레이션 예시

#### 1단계: 현재 Skill 분석

```yaml
---
name: old-skill
description: 오래된 스킬
---

# 사용법

1. "/validation-skill"을 실행하여 검증
2. 통과하면 작업 진행
3. 실패하면 수정 후 재시도
```

#### 2단계: 2026 기능 적용

```yaml
---
name: old-skill
description: 오래된 스킬
context: default          # 순차 작업이므로 default
skills:
  - validation-skill      # 자동 로딩
hooks:
  - event: PreSkillUse
    prompt: |
      작업 전 검증:
      1. 필수 파일 존재하는가?
      2. 권한이 충분한가?
  - event: PostSkillUse
    prompt: |
      작업 후 검증:
      1. 결과가 올바른가?
      2. 에러 없는가?
---

# 사용법

**자동 워크플로우:**
1. PreSkillUse Hook이 전제조건 검증
2. validation-skill이 자동 실행
3. 작업 진행
4. PostSkillUse Hook이 결과 검증

**사용자 개입 불필요.**
```

---

## 참고 문서

- **Agent 생성**: subagent-creator (2026 기능 완전 반영됨)
- **Hook 생성**: [claude_hook_creation_2026.md](claude_hook_creation_2026.md)
- **오케스트레이션**: [claude_orchestration_guide.md](claude_orchestration_guide.md)
- **MCP 통합**: [claude_mcp_integration_guide.md](claude_mcp_integration_guide.md)

---

**작성자**: Claude Sonnet 4.5
**최종 업데이트**: 2026년 1월 9일
