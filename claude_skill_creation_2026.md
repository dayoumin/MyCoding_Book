# Claude Code Skill 생성 가이드 (2026년 3월 업데이트)

**작성일:** 2026년 1월 → **최종 업데이트:** 2026년 3월
**기반:** Claude Code v2.1.72+

Claude Code Skill 시스템의 **완전한 가이드**입니다. 번들 스킬, 전체 frontmatter 필드, 문자열 치환, 동적 컨텍스트 주입 등 최신 기능을 포함합니다.

---

## 목차

1. [Skill 개요](#1-skill-개요)
2. [번들 스킬 (5가지)](#2-번들-스킬-5가지)
3. [Skill 구조](#3-skill-구조)
4. [Frontmatter 전체 필드](#4-frontmatter-전체-필드)
5. [문자열 치환 변수](#5-문자열-치환-변수)
6. [context: fork (컨텍스트 격리)](#6-context-fork-컨텍스트-격리)
7. [agent: 위임](#7-agent-위임)
8. [skills: 자동 로딩](#8-skills-자동-로딩)
9. [hooks: Skill-level Hooks](#9-hooks-skill-level-hooks)
10. [동적 컨텍스트 주입](#10-동적-컨텍스트-주입)
11. [호출 제어 및 권한](#11-호출-제어-및-권한)
12. [Skill 탐색 및 로딩](#12-skill-탐색-및-로딩)
13. [완전한 예시](#13-완전한-예시)
14. [마이그레이션 가이드](#14-마이그레이션-가이드)

---

## 1. Skill 개요

**Skill**은 Claude Code에 프롬프트 기반 기능을 추가하는 확장 단위입니다. `/skill-name`으로 호출하거나 Claude가 자동으로 로딩합니다.

### 주요 변경사항 (v2.1.0 → v2.1.72)

| 항목 | v2.1.0 (2026년 1월) | v2.1.72 (2026년 3월) |
|------|---------------------|----------------------|
| **번들 스킬** | 없음 | **/simplify, /batch, /debug, /loop, /claude-api** |
| **Frontmatter** | 6개 필드 | **10개 필드** |
| **문자열 치환** | 없음 | **$ARGUMENTS, $N, ${CLAUDE_SESSION_ID} 등** |
| **동적 주입** | 없음 | **!`command` 구문** |
| **호출 제어** | 없음 | **disable-model-invocation, user-invocable** |
| **도구 제한** | 없음 | **allowed-tools** |
| **모노레포** | 수동 | **중첩 디렉토리 자동 탐색** |
| **플러그인** | 없음 | **플러그인 마켓플레이스 지원** |

---

## 2. 번들 스킬 (5가지)

Claude Code에 기본 내장된 공식 스킬입니다.

### /simplify — 코드 품질 리뷰

최근 변경된 파일을 리뷰하여 코드 재사용, 품질, 효율성 문제를 찾고 수정합니다.

```bash
/simplify                           # 기본 실행
/simplify focus on memory efficiency  # 선택적 포커스
```

**동작:** 3개 리뷰 에이전트를 **병렬** 실행 (코드 재사용, 코드 품질, 효율성)

### /batch — 대규모 병렬 변경

코드베이스 전반에 걸친 대규모 변경을 병렬로 오케스트레이션합니다.

```bash
/batch migrate src/ from Solid to React
/batch update all API endpoints to v2 format
```

**동작:**
1. 코드베이스 조사
2. 작업을 5-30개 독립 단위로 분해
3. 계획 승인 요청
4. **격리된 git worktree**에서 백그라운드 에이전트 실행
5. 각 에이전트가 구현 → 테스트 → PR 생성

> ⚠️ Git 저장소에서만 사용 가능

### /debug — 세션 디버깅

현재 Claude Code 세션의 디버그 로그를 읽어 문제를 해결합니다.

```bash
/debug                          # 전체 로그 분석
/debug hook not firing          # 특정 문제 포커스
```

### /loop — 반복 실행

프롬프트를 지정한 간격으로 반복 실행합니다.

```bash
/loop 5m check if the deploy finished   # 5분마다 확인
/loop 10m /babysit-prs                  # 10분마다 PR 관리
/loop check build status                # 기본 10분 간격
```

**특징:**
- 기본 간격: 10분
- 비활성 스케줄 3일 후 만료
- Cron 표현식 지원

### /claude-api — API 레퍼런스 로딩

프로젝트 언어에 맞는 Claude API/SDK 레퍼런스를 자동 로딩합니다.

```bash
/claude-api             # 프로젝트 언어 자동 감지
```

**자동 활성화 조건:**
- 코드에서 `anthropic`, `@anthropic-ai/sdk`, `claude_agent_sdk` import 시
- Python, TypeScript, Java, Go, Ruby, C#, PHP, cURL 지원

---

## 3. Skill 구조

### 디렉토리 구조

```
skill-name/
├── SKILL.md              (필수 - 메인 지침)
├── reference.md          (선택 - 상세 레퍼런스)
├── examples.md           (선택 - 사용 예시)
├── template.md           (선택 - 템플릿)
└── scripts/
    └── validate.sh       (선택 - 실행 스크립트)
```

> `SKILL.md`만 필수. 다른 파일은 참조될 때만 로딩됩니다. 500줄 이상이면 별도 파일로 분리 권장.

### SKILL.md 기본 구조

```yaml
---
name: skill-name
description: When to use this skill
---

# Skill Instructions

구체적인 지침과 단계...
```

### 레거시 호환

`.claude/commands/deploy.md`와 `.claude/skills/deploy/SKILL.md` 모두 `/deploy`를 생성합니다. 동일 이름일 경우 **Skill이 우선**합니다.

---

## 4. Frontmatter 전체 필드

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `name` | String | ❌ | 디렉토리명 | Skill 이름 (소문자, 숫자, 하이픈, 최대 64자) |
| `description` | String | 권장 | 본문 첫 단락 | 언제 사용하는지 (Claude 자동 판단 기준) |
| `argument-hint` | String | ❌ | 없음 | 자동완성 시 인수 힌트 (예: `[issue-number]`) |
| `disable-model-invocation` | Boolean | ❌ | `false` | `true`: Claude 자동 로딩 방지 (수동 전용) |
| `user-invocable` | Boolean | ❌ | `true` | `false`: `/` 메뉴에서 숨김 (Claude만 호출) |
| `allowed-tools` | String | ❌ | 없음 | 권한 없이 사용할 도구 목록 |
| `model` | String | ❌ | 현재 모델 | Skill 활성화 시 사용할 모델 |
| `context` | String | ❌ | `default` | `fork`: 격리된 서브에이전트에서 실행 |
| `agent` | String | ❌ | `general-purpose` | `context: fork` 시 사용할 에이전트 타입 |
| `hooks` | YAML | ❌ | 없음 | Skill 생명주기 Hook 정의 |

### 완전한 Frontmatter 예시

```yaml
---
name: advanced-workflow
description: 복잡한 워크플로우 처리. "전체 검증해줘" 요청 시 자동 실행.
argument-hint: [subject] [type]
disable-model-invocation: false
user-invocable: true
allowed-tools: Read, Grep, Glob, Bash(git *), Bash(npm *)
model: inherit
context: fork
agent: general-purpose
hooks:
  PreToolUse:
    - matcher: Write
      hooks:
        - type: prompt
          prompt: |
            파일 생성 전 검증...
---
```

### 호출 제어 조합

| 설정 | 사용자 호출 | Claude 호출 | 컨텍스트 로딩 |
|------|-----------|-----------|-------------|
| 기본값 (제한 없음) | ✅ | ✅ | description 항상 로딩 |
| `disable-model-invocation: true` | ✅ | ❌ | description 미로딩 |
| `user-invocable: false` | ❌ | ✅ | description 항상 로딩 |

---

## 5. 문자열 치환 변수

Skill 호출 시 **자동으로 치환**되는 변수입니다.

| 변수 | 설명 | 예시 |
|------|------|------|
| `$ARGUMENTS` | 전달된 모든 인수 | `/fix 123` → `$ARGUMENTS` = `123` |
| `$ARGUMENTS[N]` | N번째 인수 (0-based) | `/migrate A B C` → `$ARGUMENTS[1]` = `B` |
| `$N` | `$ARGUMENTS[N]`의 단축형 | `$0`, `$1`, `$2` |
| `${CLAUDE_SESSION_ID}` | 현재 세션 UUID | 로깅, 세션별 파일 생성 |
| `${CLAUDE_SKILL_DIR}` | SKILL.md가 있는 디렉토리 경로 | 스크립트 참조 |

### 사용 예시

```yaml
---
name: migrate-component
description: 컴포넌트 마이그레이션
argument-hint: [component] [from-framework] [to-framework]
---

# $0 컴포넌트 마이그레이션

$ARGUMENTS[0] 컴포넌트를 $ARGUMENTS[1]에서 $ARGUMENTS[2]로 마이그레이션합니다.

검증 스크립트: `python ${CLAUDE_SKILL_DIR}/scripts/validate.py`
로그 파일: `logs/${CLAUDE_SESSION_ID}.log`
```

**인수 자동 추가:** Skill 본문에 `$ARGUMENTS`가 없으면 `ARGUMENTS: <값>`이 자동 추가됩니다.

---

## 6. context: fork (컨텍스트 격리)

### 개념

Skill 실행 시 **대화 기록 공유 여부**를 제어합니다.

| 모드 | 동작 | 용도 |
|------|------|------|
| `default` (기본) | 현재 대화에서 인라인 실행, 대화 기록 접근 가능 | 레퍼런스, 가이드라인, 순차 작업 |
| `fork` | 격리된 서브에이전트에서 실행, 대화 기록 없음 | 독립 검증, 대규모 작업, 병렬 분석 |

### fork 사용 시 주의사항

> ⚠️ `context: fork` 사용 시 Skill 본문에 **명시적인 작업 지침**이 필요합니다.
> - ✅ "Research $ARGUMENTS thoroughly..." (실행 가능한 태스크)
> - ❌ "Use these API conventions..." (가이드라인만 → 서브에이전트가 출력 없이 종료)

### 선택 가이드

| 상황 | context | 이유 |
|------|---------|------|
| 순차 작업 (파이프라인) | `default` | 이전 결과 필요 |
| 독립 검증 (리뷰) | `fork` | 편향 제거 |
| 병렬 분석 | `fork` | 독립 판단 |
| 대규모 변경 | `fork` | 컨텍스트 보호 |
| 배경 지식 제공 | `default` | 맥락 유지 |

### 예시: 3중 독립 검증

```yaml
---
name: code-audit
description: 코드 감사 워크플로우. 3단계 독립 검증.
context: fork
agent: general-purpose
---

# 코드 감사

각 Agent가 이전 결과의 영향 없이 **독립적으로 분석**합니다.

## 프로세스

1. code-analyzer Agent → 구조 분석
2. security-reviewer Agent → 보안 검증 (독립)
3. performance-checker Agent → 성능 검증 (독립)
4. 세 결과를 종합하여 최종 리포트 생성
```

---

## 7. agent: 위임

### 개념

`context: fork` 시 어떤 에이전트 타입에서 실행할지 지정합니다.

| 에이전트 | 도구 | 용도 |
|---------|------|------|
| `general-purpose` (기본) | 모든 도구 | 범용 작업 |
| `Explore` | 읽기 전용 도구 | 코드베이스 조사 |
| `Plan` | 계획/분석 도구 | 아키텍처 분석 |
| 커스텀 이름 | 에이전트 정의에 따름 | 전문화된 작업 |

### 예시

```yaml
---
name: deep-research
description: 코드베이스 심층 조사
context: fork
agent: Explore
---

# 코드베이스 심층 조사

$ARGUMENTS에 대해 코드베이스를 철저히 분석하고 보고합니다.
```

---

## 8. skills: Sub-agent에 Skill 사전 로딩

### 개념

> **참고:** `skills` 필드는 **Skill이 아닌 Sub-agent(Agent) frontmatter**의 필드입니다.
> Sub-agent가 시작 시 지정된 Skill의 전체 내용을 컨텍스트에 주입합니다.

```yaml
# .claude/agents/api-developer.md (Sub-agent 정의)
---
name: api-developer
description: API 엔드포인트 구현 전문
skills:
  - api-conventions
  - error-handling-patterns
---

API 엔드포인트를 구현하세요. 사전 로딩된 스킬의 규칙을 따르세요.
```

### 동작 방식

- Skill **설명**만 로딩하는 일반 세션과 달리, **전체 내용**이 주입됨
- Sub-agent는 부모 대화의 Skill을 상속하지 않으므로 명시적 나열 필요
- `context: fork`를 사용하는 Skill의 역방향 패턴

### Skill에서 `context: fork` vs Agent에서 `skills`

| 접근 방식 | 시스템 프롬프트 | 태스크 |
|----------|---------------|--------|
| Skill + `context: fork` | Agent 타입에서 가져옴 | SKILL.md 내용 |
| Agent + `skills` | Agent의 마크다운 본문 | Claude의 위임 메시지 |

---

## 9. hooks: Skill-level Hooks

### 구조

Skill frontmatter의 hooks는 settings.json과 **동일한 형식**입니다.

```yaml
---
name: my-skill
hooks:
  PreToolUse:
    - matcher: Write
      hooks:
        - type: command
          command: "./scripts/validate.sh"
          once: true
  PostToolUse:
    - matcher: Bash
      hooks:
        - type: prompt
          prompt: |
            명령 실행 결과 검증...
---
```

### 특징

- Skill 실행 중에만 발동 (Skill 종료 시 자동 정리)
- 4가지 Hook 타입 모두 지원 (command, http, prompt, agent)
- `once: true`: 세션당 1회만 실행 후 자동 제거
- 프로젝트 레벨 Hook과 독립적

### 예시: 콘텐츠 검증

```yaml
---
name: content-workflow
description: 콘텐츠 생성 워크플로우
context: fork
hooks:
  PreToolUse:
    - matcher: Write
      hooks:
        - type: prompt
          prompt: |
            콘텐츠 파일 생성 전 검증:
            1. 성인 콘텐츠 아닌가?
            2. 저작권 문제 없는가?
            3. 형식이 올바른가?
            문제 시 차단.
  PostToolUse:
    - matcher: Write
      hooks:
        - type: prompt
          prompt: |
            생성된 콘텐츠 검증:
            1. JSON 형식 올바른가?
            2. 필수 필드 존재하는가?
            3. 중복 내용 없는가?
            문제 발견 시 개선 제안.
---
```

---

## 10. 동적 컨텍스트 주입

### `` !`command` `` 구문

셸 명령을 Skill 렌더링 전에 실행하여 결과를 주입합니다.

```yaml
---
name: pr-summary
description: PR 요약 생성
---

# PR 요약

현재 PR diff:
!`gh pr diff`

PR 댓글:
!`gh pr view --comments`

위 내용을 분석하여 PR 요약을 작성하세요.
```

**동작:**
1. Skill 로딩 시 `` !`command` `` 실행
2. 출력이 해당 위치에 치환
3. Claude는 실제 데이터가 포함된 최종 결과를 받음

### Extended Thinking

Skill 본문에 **"ultrathink"** 키워드를 포함하면 확장 사고 모드가 활성화됩니다.

```markdown
이 분석에는 ultrathink 추론을 사용하여 깊이 있게 검토하세요.
```

---

## 11. 호출 제어 및 권한

### allowed-tools

Skill 활성화 시 승인 없이 사용할 도구를 지정합니다.

```yaml
allowed-tools: Read, Grep, Glob, Bash(git *), Bash(npm *)
```

**지원 형식:**
- 도구명: `Read`, `Write`, `Edit`, `Glob`, `Grep`, `WebFetch`, `WebSearch`, `Agent`
- Bash 패턴: `Bash(git *)`, `Bash(npm *)`, `Bash(npx jest *)`

### 권한 제어 (settings)

```
# 특정 Skill만 허용
Skill(commit)
Skill(review-pr *)

# 특정 Skill 차단
Skill(deploy *)

# 모든 Skill 차단
Skill
```

---

## 12. Skill 탐색 및 로딩

### 로딩 우선순위 (높은 → 낮은)

| 순위 | 스코프 | 경로 |
|------|--------|------|
| 1 | Enterprise | 관리 설정 (서버 관리) |
| 2 | Personal | `~/.claude/skills/<name>/SKILL.md` |
| 3 | Project | `.claude/skills/<name>/SKILL.md` |
| 4 | Plugin | `<plugin>/skills/<name>/SKILL.md` |
| 5 | Additional dirs | `<added-dir>/.claude/skills/<name>/SKILL.md` |
| 6 | Legacy | `.claude/commands/<name>.md` |

### 모노레포 자동 탐색

```
monorepo/
├── .claude/skills/         ← 루트 스킬
├── packages/
│   ├── frontend/
│   │   └── .claude/skills/ ← frontend 편집 시 자동 발견
│   └── backend/
│       └── .claude/skills/ ← backend 편집 시 자동 발견
```

- `packages/frontend/` 내 파일 편집 시 해당 디렉토리의 스킬 자동 로딩
- `--add-dir` 플래그로 추가한 디렉토리도 자동 탐색

### Description 예산

- 컨텍스트 윈도우의 **2%** (폴백 16,000자)
- `/context` 명령으로 초과 여부 확인
- `SLASH_COMMAND_TOOL_CHAR_BUDGET` 환경변수로 조정 가능

---

## 13. 완전한 예시

### 예시 1: 테스트 생성 워크플로우

```yaml
---
name: test-workflow
description: 테스트 생성 전체 워크플로우. "whiskey 테스트 만들어줘" 요청 시 자동 실행.
argument-hint: [subject-name]
context: fork
agent: general-purpose
allowed-tools: Read, Grep, Glob, Bash(npm *)
skills:
  - research-parser
  - test-generator
  - test-validator
hooks:
  PreToolUse:
    - matcher: Write
      hooks:
        - type: prompt
          prompt: |
            테스트 파일 생성 전 검증:
            1. 경로가 올바른가?
            2. 중복 파일이 아닌가?
            문제 시 차단.
---

# 테스트 생성 워크플로우

$0 테스트를 생성합니다.

## 워크플로우 (필수 순서!)

1. **리서치 확인** — research/$0.md 존재 확인
2. **test-creator Agent** — 생성 + 자체검증
3. **test-auditor Agent** — 통계 검증 (독립)
4. **빌드 확인** — npm run build
5. **test-reviewer Agent** — 코드 리뷰 (독립)
6. **결과 통합** — 최종 보고
```

### 예시 2: PR 리뷰 자동화

```yaml
---
name: review-pr
description: PR 자동 리뷰. 보안, 성능, 테스트 커버리지 분석.
argument-hint: [pr-number]
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Bash(git *), Bash(gh *)
---

# PR #$0 리뷰

PR diff:
!`gh pr diff $0`

PR 정보:
!`gh pr view $0`

## 리뷰 항목

1. **보안** — SQL 인젝션, XSS, 인증 우회
2. **성능** — N+1 쿼리, 불필요한 루프, 메모리 누수
3. **테스트** — 변경 사항에 대한 테스트 존재 여부
4. **코드 품질** — 네이밍, 중복, 복잡도

각 항목별 점수(1-5)와 개선 제안을 포함한 리뷰를 작성하세요.
```

### 예시 3: 배경 지식 스킬 (Claude만 호출)

```yaml
---
name: api-conventions
description: 이 프로젝트의 API 설계 규칙. API 관련 코드 작성 시 자동 적용.
user-invocable: false
---

# API 설계 규칙

## 엔드포인트 네이밍
- RESTful 규칙 준수
- 복수형 명사 사용: `/users`, `/posts`
- 중첩 최대 2단계: `/users/{id}/posts`

## 응답 형식
- 성공: `{ data: T, meta?: {} }`
- 에러: `{ error: { code: string, message: string } }`
- 항상 적절한 HTTP 상태 코드 사용
```

---

## 14. 마이그레이션 가이드

### v2.1.0 → v2.1.72 주요 변경

| 변경 사항 | 이전 | 현재 |
|----------|------|------|
| Hooks 형식 | `event: PreSkillUse` | **이벤트명 키 + hooks 배열** |
| 인수 전달 | 프롬프트에 직접 | **$ARGUMENTS 치환** |
| 도구 제한 | 불가 | **allowed-tools 필드** |
| 호출 제어 | 불가 | **disable-model-invocation, user-invocable** |

### 업그레이드 체크리스트

- [ ] **hooks 형식 변경**: `event: PreSkillUse` → `PreToolUse: [...]` (settings.json 형식)
- [ ] **$ARGUMENTS 활용**: 하드코딩된 값 → 치환 변수
- [ ] **argument-hint 추가**: 사용자 편의를 위한 인수 힌트
- [ ] **allowed-tools 추가**: 빈번한 승인 요청 제거
- [ ] **호출 제어 설정**: 수동 전용/자동 전용 분류
- [ ] **동적 주입 활용**: `` !`command` `` 으로 실시간 데이터 주입

### 마이그레이션 예시

**Before (v2.1.0):**
```yaml
---
name: old-skill
description: 오래된 스킬
context: fork
hooks:
  - event: PreSkillUse
    prompt: "요청 검증..."
  - event: PostSkillUse
    prompt: "결과 검증..."
---
# 사용법
1. "/helper-skill"을 먼저 실행하세요
```

**After (v2.1.72):**
```yaml
---
name: old-skill
description: 오래된 스킬
argument-hint: [target]
context: fork
agent: general-purpose
allowed-tools: Read, Grep, Glob
skills:
  - helper-skill
hooks:
  PreToolUse:
    - matcher: Write
      hooks:
        - type: prompt
          prompt: "파일 생성 전 검증..."
  PostToolUse:
    - matcher: Write
      hooks:
        - type: prompt
          prompt: "결과 검증..."
---
# $0 처리
helper-skill이 자동 실행됩니다.
```

---

## 참고 문서

- **공식 Skills 문서**: https://code.claude.com/docs/en/skills.md
- **Hook 생성**: [claude_hook_creation_2026.md](claude_hook_creation_2026.md)
- **오케스트레이션**: [claude_orchestration_guide.md](claude_orchestration_guide.md)
- **MCP 통합**: [claude_mcp_integration_guide.md](claude_mcp_integration_guide.md)

---

**작성자**: Claude Sonnet 4.5 → Claude Opus 4.6
**최종 업데이트**: 2026년 3월 11일
