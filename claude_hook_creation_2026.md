# Claude Code Hook 생성 가이드 (2026년 3월 업데이트)

**작성일:** 2026년 1월 → **최종 업데이트:** 2026년 3월
**기반:** Claude Code v2.1.72+

Claude Code Hook 시스템의 **완전한 가이드**입니다. 2026년 3월 기준 18개 이벤트, 4가지 Hook 타입, 고급 Matcher 시스템을 모두 다룹니다.

---

## 목차

1. [Hook 개요](#1-hook-개요)
2. [Hook 이벤트 (18가지)](#2-hook-이벤트-18가지)
3. [Hook 타입 (4가지)](#3-hook-타입-4가지)
4. [Matcher 시스템](#4-matcher-시스템)
5. [Hook 설정 위치](#5-hook-설정-위치)
6. [입력/출력 형식](#6-입력출력-형식)
7. [선택 가이드 및 조합 패턴](#7-선택-가이드-및-조합-패턴)
8. [실전 예시](#8-실전-예시)
9. [Agent/Skill 내장 Hooks](#9-agentskill-내장-hooks)
10. [디버깅 및 보안](#10-디버깅-및-보안)
11. [마이그레이션 가이드](#11-마이그레이션-가이드)

---

## 1. Hook 개요

**Hook**은 Claude Code의 특정 시점에 실행되는 **검증/변환/알림** 로직입니다.

### 주요 변경사항 (v2.1.0 → v2.1.72)

| 항목 | v2.1.0 (2026년 1월) | v2.1.72 (2026년 3월) |
|------|---------------------|----------------------|
| **이벤트 수** | 5개 | **18개** |
| **Hook 타입** | command, prompt | **command, http, prompt, agent** |
| **Matcher** | 도구명 매칭 | **이벤트별 다양한 매칭** |
| **비동기** | 미지원 | **async hooks 지원** |
| **관리** | JSON 직접 편집 | **`/hooks` 인터랙티브 메뉴** |

---

## 2. Hook 이벤트 (18가지)

### 2.1 전체 이벤트 표

| 이벤트 | 발동 시점 | Matcher 대상 | 차단 가능 | Hook 타입 |
|--------|----------|-------------|----------|----------|
| **SessionStart** | 세션 시작/재개 | `startup`, `resume`, `clear`, `compact` | ❌ | command만 |
| **InstructionsLoaded** | CLAUDE.md/rules 로딩 | 없음 | ❌ | command만 |
| **UserPromptSubmit** | 사용자 프롬프트 제출 | 없음 | ✅ | 4가지 모두 |
| **PreToolUse** | 도구 실행 전 | 도구명 (정규식) | ✅ | 4가지 모두 |
| **PermissionRequest** | 권한 대화상자 표시 | 도구명 (정규식) | ✅ | 4가지 모두 |
| **PostToolUse** | 도구 실행 성공 후 | 도구명 (정규식) | ❌ | 4가지 모두 |
| **PostToolUseFailure** | 도구 실행 실패 후 | 도구명 (정규식) | ❌ | 4가지 모두 |
| **Notification** | 알림 전송 | `permission_prompt`, `idle_prompt`, `auth_success`, `elicitation_dialog` | ❌ | command만 |
| **SubagentStart** | 서브에이전트 생성 | 에이전트 타입명 | ❌ | command만 |
| **SubagentStop** | 서브에이전트 종료 | 에이전트 타입명 | ✅ | 4가지 모두 |
| **Stop** | Claude 응답 완료 | 없음 | ✅ | 4가지 모두 |
| **TeammateIdle** | 팀 에이전트 대기 | 없음 | ✅ | command만 |
| **TaskCompleted** | 태스크 완료 표시 | 없음 | ✅ | 4가지 모두 |
| **ConfigChange** | 설정 파일 변경 | `user_settings`, `project_settings` 등 | ✅ | command만 |
| **WorktreeCreate** | Worktree 생성 | 없음 | ✅ | command만 |
| **WorktreeRemove** | Worktree 제거 | 없음 | ❌ | command만 |
| **PreCompact** | 컨텍스트 압축 전 | `manual`, `auto` | ❌ | command만 |
| **SessionEnd** | 세션 종료 | `clear`, `logout`, `prompt_input_exit`, `bypass_permissions_disabled`, `other` | ❌ | command만 |

### 2.2 이벤트 상세 설명

#### 세션 생명주기 이벤트

**SessionStart** — 세션이 시작되거나 재개될 때
```json
{
  "session_id": "abc123",
  "source": "startup|resume|clear|compact",
  "model": "claude-sonnet-4-6",
  "agent_type": "AgentName"
}
```
- `CLAUDE_ENV_FILE` 환경변수로 후속 Bash 명령에 환경변수 전달 가능

**SessionEnd** — 세션이 종료될 때
```json
{
  "reason": "clear|logout|prompt_input_exit|bypass_permissions_disabled|other"
}
```

**InstructionsLoaded** — CLAUDE.md나 rules 파일이 로딩될 때
```json
{
  "file_path": "/absolute/path/to/file.md",
  "memory_type": "User|Project|Local|Managed",
  "load_reason": "session_start|nested_traversal|path_glob_match|include"
}
```

#### 도구 관련 이벤트

**PreToolUse** — 도구 실행 직전 (차단/수정 가능)
```json
{
  "tool_name": "Edit",
  "tool_input": {
    "file_path": "/path/to/file.ts",
    "old_string": "...",
    "new_string": "..."
  }
}
```

**PostToolUse** — 도구 실행 성공 후
```json
{
  "tool_name": "Write",
  "tool_input": { "file_path": "...", "content": "..." },
  "tool_response": { "...": "..." },
  "tool_use_id": "toolu_01ABC123..."
}
```

**PostToolUseFailure** — 도구 실행 실패 후
```json
{
  "tool_name": "Bash",
  "tool_input": { "command": "..." },
  "error": "Error description",
  "is_interrupt": false
}
```

**PermissionRequest** — 권한 확인 대화상자 표시 시
```json
{
  "tool_name": "Bash",
  "tool_input": { "command": "..." },
  "permission_suggestions": [
    { "type": "toolAlwaysAllow", "tool": "Bash" }
  ]
}
```

#### 에이전트 관련 이벤트

**SubagentStart** — 서브에이전트 생성 시
```json
{ "agent_id": "agent-abc123", "agent_type": "Explore" }
```

**SubagentStop** — 서브에이전트 종료 시 (결과 검증 가능)
```json
{
  "agent_id": "agent-abc123",
  "agent_type": "Explore",
  "agent_transcript_path": "/path/to/transcript.jsonl",
  "last_assistant_message": "서브에이전트의 최종 응답"
}
```

**Stop** — Claude 응답 완료 시
```json
{
  "stop_hook_active": true,
  "last_assistant_message": "Claude의 최종 응답"
}
```
> ⚠️ `stop_hook_active` 필드를 체크하여 무한 루프를 방지하세요.

#### Agent Teams 이벤트 (실험적)

**TeammateIdle** — 팀 에이전트가 대기 상태로 전환될 때
```json
{ "teammate_name": "researcher", "team_name": "my-project" }
```

**TaskCompleted** — 태스크가 완료로 표시될 때
```json
{
  "task_id": "task-001",
  "task_subject": "태스크 제목",
  "task_description": "설명",
  "teammate_name": "implementer",
  "team_name": "my-project"
}
```

#### 환경 관련 이벤트

**ConfigChange** — 설정 파일 변경 시
```json
{ "source": "user_settings|project_settings|local_settings|policy_settings|skills", "file_path": "/path/to/file" }
```

**WorktreeCreate** — Git Worktree 생성 시
```json
{ "name": "feature-auth" }
```
> stdout으로 worktree 절대 경로를 출력해야 합니다.

**WorktreeRemove** — Worktree 제거 시
```json
{ "worktree_path": "/absolute/path/to/worktree" }
```

**PreCompact** — 컨텍스트 압축 직전
```json
{ "trigger": "manual|auto", "custom_instructions": "" }
```

---

## 3. Hook 타입 (4가지)

### 3.1 Command Hook (기존)

셸 명령을 실행합니다. 가장 빠르고 정확합니다.

```jsonc
{
  "type": "command",
  "command": "node .claude/scripts/validate.js",
  "timeout": 600,          // 초 (기본 600)
  "statusMessage": "검증 중...",  // 스피너 메시지
  "async": false,          // 비동기 실행
  "once": false            // Skill에서 1회만 실행
}
```

**입출력:**
- 입력: stdin으로 JSON
- 종료 코드: `0` = 성공, `2` = 차단, 기타 = 비차단 오류
- 출력: stdout으로 JSON (선택)

**특징:**
- ✅ 빠름 (< 100ms)
- ✅ 100% 정확 (규칙 기반)
- ✅ 파일 조작, 외부 API 호출 가능
- ✅ 비동기(`async: true`) 지원
- ❌ 자연어 처리 불가

### 3.2 HTTP Hook (신규)

외부 URL로 POST 요청을 보냅니다. 팀 공유 감사 서비스에 적합합니다.

```jsonc
{
  "type": "http",
  "url": "https://hooks.example.com/validate",
  "headers": {
    "Authorization": "Bearer $MY_TOKEN",
    "Content-Type": "application/json"
  },
  "allowedEnvVars": ["MY_TOKEN"],
  "timeout": 30,
  "statusMessage": "서버 검증 중..."
}
```

**입출력:**
- 입력: POST body로 JSON (Command Hook과 동일한 형식)
- 출력: HTTP 응답 body로 JSON
- 비2xx 응답 = 비차단 오류 (실행 계속)

**특징:**
- ✅ 팀 전체 공유 검증 로직
- ✅ 중앙화된 감사/로깅
- ✅ 환경변수 보간 (`$VAR_NAME`)
- ❌ 네트워크 의존
- ❌ 로컬보다 느림

**보안 설정:**
```jsonc
// settings.json에서 허용할 URL 패턴
{
  "allowedHttpHookUrls": ["https://hooks.example.com/*"],
  "httpHookAllowedEnvVars": ["MY_TOKEN", "HOOK_SECRET"]
}
```

### 3.3 Prompt Hook (기존)

Claude 모델에 단일 턴 프롬프트를 보내 yes/no 판단을 받습니다.

```jsonc
{
  "type": "prompt",
  "prompt": "다음 파일 수정이 안전한지 검증하세요: $ARGUMENTS",
  "model": "fast-model",    // 기본: 빠른 모델 (Haiku급)
  "timeout": 30             // 초 (기본 30)
}
```

**모델 응답 형식:**
```json
{ "ok": true, "reason": "안전한 수정입니다." }
{ "ok": false, "reason": ".env 파일은 수정할 수 없습니다." }
```

**특징:**
- ✅ 유연함 (컨텍스트 기반)
- ✅ 자연어 정책 정의
- ✅ `$ARGUMENTS` 플레이스홀더로 동적 입력
- ⚠️ 느림 (~1-2초)
- ⚠️ 정확도 ~95% (LLM 판단)

### 3.4 Agent Hook (신규)

서브에이전트를 생성하여 파일 읽기, 명령 실행 등 **멀티턴** 검증을 수행합니다.

```jsonc
{
  "type": "agent",
  "prompt": "변경된 파일의 테스트가 존재하는지 확인하고, 없으면 이유를 설명하세요.",
  "model": "fast-model",    // 기본: 빠른 모델
  "timeout": 60             // 초 (기본 60)
}
```

**특징:**
- ✅ Read, Grep, Glob, Bash 등 도구 사용 가능
- ✅ 최대 50턴 멀티턴 대화
- ✅ 파일 검사, 테스트 실행 등 복잡한 검증
- ⚠️ 가장 느림 (수십 초)
- ⚠️ 토큰 비용 높음

**응답 형식:** Prompt Hook과 동일 (`ok`/`reason`)

### 3.5 타입별 비교표

| 기준 | Command | HTTP | Prompt | Agent |
|------|---------|------|--------|-------|
| **속도** | ⚡ < 100ms | 🔄 ~500ms | 🐢 ~1-2초 | 🐌 수십 초 |
| **정확도** | 100% | 100% | ~95% | ~97% |
| **유연성** | 낮음 | 중간 | 높음 | 매우 높음 |
| **자연어** | ❌ | ❌ | ✅ | ✅ |
| **파일 접근** | ✅ (직접) | ❌ | ❌ | ✅ (도구) |
| **외부 API** | ✅ | ✅ (자체) | ❌ | ✅ |
| **비동기** | ✅ | ❌ | ❌ | ❌ |
| **비용** | 무료 | 무료 | 토큰 소비 | 높은 토큰 |

---

## 4. Matcher 시스템

### 4.1 이벤트별 Matcher 대상

| 이벤트 | Matcher 대상 | 예시 |
|--------|-------------|------|
| PreToolUse, PostToolUse, PostToolUseFailure, PermissionRequest | **도구명** (정규식) | `Edit\|Write`, `mcp__github__.*` |
| SessionStart | **세션 소스** | `startup\|resume` |
| SessionEnd | **종료 사유** | `clear\|logout` |
| Notification | **알림 타입** | `permission_prompt\|idle_prompt` |
| SubagentStart, SubagentStop | **에이전트 타입명** | `Explore\|Plan` |
| PreCompact | **압축 트리거** | `manual\|auto` |
| ConfigChange | **설정 소스** | `user_settings\|project_settings` |
| 그 외 | Matcher 없음 (항상 발동) | — |

### 4.2 도구명 Matcher 패턴

```jsonc
{
  "matcher": "Bash",                      // 정확히 Bash만
  "matcher": "Edit|Write",               // Edit 또는 Write
  "matcher": "mcp__memory__.*",          // memory 서버의 모든 도구
  "matcher": "mcp__.*__write.*",         // 모든 MCP 서버의 write 계열
  "matcher": "mcp__github__create_pull_request",  // 특정 MCP 도구
  "matcher": "Notebook.*",              // Notebook으로 시작하는 모든 도구
  "matcher": "*"                         // 모든 도구 (생략과 동일)
}
```

**빌트인 도구:** `Bash`, `Edit`, `Write`, `Read`, `Glob`, `Grep`, `Agent`, `WebFetch`, `WebSearch`
**MCP 도구:** `mcp__<서버명>__<도구명>` 패턴

### 4.3 Matcher 생략

Matcher를 생략하거나 `"*"` 또는 `""`을 사용하면 **모든 대상에 매칭**됩니다.

---

## 5. Hook 설정 위치

### 5.1 설정 스코프 (우선순위 순)

| 위치 | 범위 | 파일 |
|------|------|------|
| **Managed** | 조직 전체 (관리자) | 관리 정책 설정 |
| **Plugin** | 플러그인 활성화 시 | `hooks/hooks.json` |
| **User** | 모든 프로젝트 | `~/.claude/settings.json` |
| **Project** | 프로젝트 (Git 공유) | `.claude/settings.json` |
| **Project Local** | 프로젝트 (개인) | `.claude/settings.local.json` |
| **Agent** | 특정 Agent 내부 | `.claude/agents/{name}.md` frontmatter |
| **Skill** | 특정 Skill 실행 중 | `.claude/skills/{name}/SKILL.md` frontmatter |

### 5.2 settings.json 전체 스키마

```jsonc
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/scripts/validate.js",
            "timeout": 600,
            "statusMessage": "파일 검증 중...",
            "async": false,
            "once": false
          },
          {
            "type": "http",
            "url": "https://hooks.example.com/validate",
            "headers": { "Authorization": "Bearer $TOKEN" },
            "allowedEnvVars": ["TOKEN"],
            "timeout": 30
          },
          {
            "type": "prompt",
            "prompt": "파일 수정이 안전한지 검증: $ARGUMENTS",
            "model": "fast-model",
            "timeout": 30
          },
          {
            "type": "agent",
            "prompt": "변경 파일의 테스트 존재 여부 확인",
            "timeout": 60
          }
        ]
      }
    ]
  },
  "disableAllHooks": false,
  "allowedHttpHookUrls": ["https://hooks.example.com/*"],
  "httpHookAllowedEnvVars": ["TOKEN", "SECRET"]
}
```

### 5.3 환경변수

| 변수 | 사용 가능 범위 | 설명 |
|------|--------------|------|
| `CLAUDE_PROJECT_DIR` | 모든 Hook | 프로젝트 루트 디렉토리 |
| `CLAUDE_PLUGIN_ROOT` | Plugin Hook만 | 플러그인 루트 |
| `CLAUDE_CODE_REMOTE` | 원격 환경만 | `"true"` (원격/웹) |
| `CLAUDE_ENV_FILE` | SessionStart만 | 환경변수 파일 경로 |

---

## 6. 입력/출력 형식

### 6.1 공통 입력 필드

모든 Hook에 전달되는 공통 필드:

```json
{
  "session_id": "abc123",
  "transcript_path": "/path/to/transcript.jsonl",
  "cwd": "/current/working/directory",
  "permission_mode": "default|plan|acceptEdits|dontAsk|bypassPermissions",
  "hook_event_name": "PreToolUse",
  "agent_id": "agent-xyz",
  "agent_type": "AgentName"
}
```

### 6.2 Command Hook 종료 코드

| 종료 코드 | 의미 | 동작 |
|----------|------|------|
| `0` | 성공 | stdout JSON 파싱 |
| `2` | 차단 오류 | stderr를 에러로 표시, 작업 중단 |
| 기타 | 비차단 오류 | verbose에서 stderr 표시, 실행 계속 |

### 6.3 JSON 출력 형식

#### 공통 출력 필드 (모든 이벤트)

```json
{
  "continue": true,
  "stopReason": "continue=false일 때 메시지",
  "suppressOutput": false,
  "systemMessage": "사용자에게 표시할 경고"
}
```

#### PreToolUse 출력 (hookSpecificOutput)

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow|deny|ask",
    "permissionDecisionReason": "차단 사유",
    "updatedInput": { "file_path": "수정된 경로" },
    "additionalContext": "Claude에게 전달할 추가 컨텍스트"
  }
}
```

> 💡 `updatedInput`으로 도구 입력을 **실시간 수정** 가능! 예: 파일 경로 변환, 명령어 필터링

#### PermissionRequest 출력

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PermissionRequest",
    "decision": {
      "behavior": "allow|deny",
      "updatedInput": { "command": "수정된 명령" },
      "updatedPermissions": ["..."],
      "message": "deny 시 메시지",
      "interrupt": false
    }
  }
}
```

#### PostToolUse 출력

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "additionalContext": "Claude에게 전달할 컨텍스트",
    "updatedMCPToolOutput": "MCP 도구 결과 수정 (MCP만)"
  },
  "decision": "block",
  "reason": "차단 사유"
}
```

#### Prompt/Agent Hook 응답

```json
{ "ok": true, "reason": "검증 통과" }
{ "ok": false, "reason": "위험한 작업 감지" }
```

---

## 7. 선택 가이드 및 조합 패턴

### 7.1 4가지 타입 선택 가이드

| 상황 | 권장 타입 | 이유 |
|------|----------|------|
| API 키 형식 체크 | **Command** | 100% 정확성, 빠름 |
| SQL 쿼리 안전성 분석 | **Prompt** | 의미 분석 필요 |
| 팀 공유 감사 로그 | **HTTP** | 중앙화된 서비스 |
| 테스트 존재 여부 확인 | **Agent** | 파일 탐색 필요 |
| PR 내용 품질 검토 | **Prompt** | 자연어 이해 |
| 빌드 통과 확인 | **Command** | 명령 실행 |
| 코드 리뷰 자동화 | **Agent** | 멀티턴 분석 |
| 정책 자주 변경 | **Prompt** | 유지보수 용이 |
| 외부 승인 시스템 연동 | **HTTP** | API 통합 |
| 파일 크기 확인 | **Command** | 단순 계산 |

### 7.2 조합 패턴

**패턴 1: Command → Prompt (2단계 검증)**
```jsonc
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [
        { "type": "command", "command": "node .claude/scripts/format-check.js" },
        { "type": "prompt", "prompt": "코드 품질 및 보안 검증: $ARGUMENTS" }
      ]
    }]
  }
}
```
- 1단계: 형식 검증 (빠름, 정확)
- 2단계: 의미/품질 검증 (유연)

**패턴 2: Command + HTTP (로컬 검증 + 감사)**
```jsonc
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Bash",
      "hooks": [
        { "type": "command", "command": "node .claude/scripts/log-command.js" },
        { "type": "http", "url": "https://audit.example.com/log", "headers": { "Authorization": "Bearer $AUDIT_TOKEN" }, "allowedEnvVars": ["AUDIT_TOKEN"] }
      ]
    }]
  }
}
```

**패턴 3: Prompt → Agent (판단 → 심층 검증)**
```jsonc
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Write",
      "hooks": [
        { "type": "prompt", "prompt": "이 파일 생성이 프로젝트 구조에 적합한가?" },
        { "type": "agent", "prompt": "기존 코드베이스에서 유사 파일/중복 확인하고 보고" }
      ]
    }]
  }
}
```

### 7.3 비동기 Hook 패턴

**감사 로그 (비차단):**
```jsonc
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "node .claude/scripts/audit-log.js",
        "async": true,
        "statusMessage": "감사 로그 기록 중..."
      }]
    }]
  }
}
```

- `async: true`: 백그라운드 실행, Claude 작업 계속
- 출력은 다음 대화 턴에 전달
- ⚠️ 차단 불가, `command` 타입만 지원

---

## 8. 실전 예시

### 8.1 파일 보호 (Command + Prompt 2단계)

```jsonc
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [
        {
          "type": "command",
          "command": "python3 -c \"import json,sys; p=json.load(sys.stdin).get('tool_input',{}).get('file_path',''); sys.exit(2 if any(x in p for x in ['.env', 'credentials', 'secrets']) else 0)\"",
          "statusMessage": "보호 파일 체크..."
        },
        {
          "type": "prompt",
          "prompt": "다음 파일 수정을 검토하세요:\n- 프로젝트 설정 파일(package.json, tsconfig.json 등)은 사유 확인\n- 보안 민감 파일은 차단\n문제 시 차단하고 사유 설명."
        }
      ]
    }]
  }
}
```

### 8.2 코드 품질 검증 (Agent Hook)

```jsonc
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write",
      "hooks": [{
        "type": "agent",
        "prompt": "방금 생성된 파일을 검증하세요:\n1. 해당 파일에 대한 테스트 파일이 존재하는가?\n2. TypeScript 타입이 올바른가?\n3. 기존 코드와 스타일이 일관적인가?\n문제 발견 시 구체적으로 보고.",
        "timeout": 60
      }]
    }]
  }
}
```

### 8.3 팀 감사 로그 (HTTP Hook)

```jsonc
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Bash|Edit|Write",
      "hooks": [{
        "type": "http",
        "url": "https://hooks.myteam.com/audit",
        "headers": {
          "Authorization": "Bearer $TEAM_HOOK_TOKEN",
          "X-Project": "my-project"
        },
        "allowedEnvVars": ["TEAM_HOOK_TOKEN"],
        "statusMessage": "감사 로그 전송..."
      }]
    }]
  }
}
```

### 8.4 Database 쿼리 안전성 (Prompt Hook)

```jsonc
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "mcp__database__execute_query",
      "hooks": [{
        "type": "prompt",
        "prompt": "데이터베이스 쿼리 실행 전 검증:\n\n1. **읽기 전용 여부**: SELECT만 허용, UPDATE/DELETE/DROP 차단\n2. **성능 영향**: 전체 테이블 스캔, 과도한 JOIN, LIMIT 없는 조회\n3. **보안**: SQL 인젝션, 민감 테이블(users, credentials) 접근\n\n위험하거나 비효율적이면 차단하고 대안 제시."
      }]
    }]
  }
}
```

### 8.5 GitHub PR 검증 (Command + Prompt 2단계)

```jsonc
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "mcp__github__create_pull_request",
      "hooks": [
        {
          "type": "command",
          "command": "node .claude/scripts/pr-format-check.js",
          "statusMessage": "1단계: PR 형식 검증"
        },
        {
          "type": "prompt",
          "prompt": "2단계: PR 품질 검증:\n1. 제목이 [FEAT]/[FIX] 접두사를 사용하고 구체적인가?\n2. 설명에 '무엇을' + '왜' 변경했는지 명시되었나?\n3. 테스트 계획 포함되었나?\n4. 여러 기능이 섞여있지 않은가?\n문제 발견 시 개선 제안."
        }
      ]
    }]
  }
}
```

### 8.6 Worktree 커스텀 생성 (Command Hook)

```jsonc
{
  "hooks": {
    "WorktreeCreate": [{
      "hooks": [{
        "type": "command",
        "command": "bash .claude/scripts/create-worktree.sh"
      }]
    }]
  }
}
```

> WorktreeCreate Hook은 stdout으로 생성된 worktree의 **절대 경로를 출력**해야 합니다.

### 8.7 세션 시작 시 환경 설정 (SessionStart)

```jsonc
{
  "hooks": {
    "SessionStart": [{
      "matcher": "startup",
      "hooks": [{
        "type": "command",
        "command": "echo 'NODE_ENV=development' >> $CLAUDE_ENV_FILE && echo 'AWS_PROFILE=dev' >> $CLAUDE_ENV_FILE"
      }]
    }]
  }
}
```

### 8.8 Agent Teams 품질 게이트 (TaskCompleted)

```jsonc
{
  "hooks": {
    "TaskCompleted": [{
      "hooks": [{
        "type": "agent",
        "prompt": "완료된 태스크를 검증하세요:\n1. 코드 변경사항이 실제로 구현되었는가?\n2. 테스트가 통과하는가?\n3. 빌드에 문제가 없는가?\n불완전하면 차단하고 누락 사항 보고.",
        "timeout": 60
      }]
    }]
  }
}
```

---

## 9. Agent/Skill 내장 Hooks

### 9.1 Agent Hooks (AGENT.md frontmatter)

```yaml
---
name: test-creator
description: 테스트 생성 Agent
model: inherit
permissionMode: acceptEdits
hooks:
  PreToolUse:
    - matcher: Write
      hooks:
        - type: prompt
          prompt: |
            테스트 파일 생성 전 검증:
            1. 파일 경로가 적절한가?
            2. 중복 파일이 아닌가?
            3. 필수 필드 모두 있는가?
  PostToolUse:
    - matcher: Write
      hooks:
        - type: prompt
          prompt: |
            생성된 파일 검증:
            1. TypeScript 타입 에러 없는가?
            2. 필수 필드 존재하는가?
            문제 발견 시 자동 수정.
---
```

**특징:**
- Agent frontmatter의 hooks 구조는 settings.json과 **동일한 형식**
- 해당 Agent 내부에서만 발동
- `Stop` 이벤트는 자동으로 `SubagentStop`으로 변환
- 4가지 Hook 타입 모두 사용 가능

### 9.2 Skill Hooks (SKILL.md frontmatter)

```yaml
---
name: content-workflow
description: 콘텐츠 생성 워크플로우
context: fork
hooks:
  PreToolUse:
    - matcher: Write
      hooks:
        - type: command
          command: "./scripts/validate-content.sh"
          once: true
---
```

**`once: true`:** Skill에서만 사용, 세션당 1회만 실행 후 자동 제거

---

## 10. 디버깅 및 보안

### 10.1 디버깅

**디버그 모드:**
```bash
claude --debug
```

**디버그 출력 예시:**
```
[DEBUG] Executing hooks for PostToolUse:Write
[DEBUG] Found 1 hook matchers in settings
[DEBUG] Matched 1 hooks for query "Write"
[DEBUG] Hook command completed with status 0: {...}
```

**`/hooks` 메뉴:** 설정된 Hook 확인, 추가, 삭제, 전체 비활성화
**`Ctrl+O`:** 상세 모드에서 Hook 진행 상황 표시

**자주 발생하는 문제:**
| 증상 | 원인 | 해결 |
|------|------|------|
| Hook 미발동 | Matcher 오타 | `--debug`로 매칭 확인 |
| JSON 파싱 실패 | 셸 프로필 출력 | `.bashrc` 비대화형 체크 추가 |
| Stop Hook 무한루프 | `stop_hook_active` 미체크 | 해당 필드 확인 후 조기 종료 |
| 설정 변경 미반영 | 스냅샷 캐시 | `/hooks` 메뉴에서 리뷰 |

### 10.2 보안 주의사항

**Command Hook은 사용자의 전체 권한으로 실행됩니다:**
- ✅ 셸 변수 항상 인용: `"$VAR"` (not `$VAR`)
- ✅ 입력 검증 및 새니타이징
- ✅ 경로 순회 차단: `..` 포함 경로 검사
- ✅ 절대 경로 사용
- ✅ `$CLAUDE_PROJECT_DIR` 기반 경로 참조
- ❌ `.env`, `.git/`, 키 파일 접근 주의

**HTTP Hook 보안:**
```jsonc
{
  "allowedHttpHookUrls": ["https://hooks.myteam.com/*"],
  "httpHookAllowedEnvVars": ["TEAM_TOKEN"]
}
```
- `allowedHttpHookUrls`: URL 패턴 화이트리스트 (`*` 와일드카드)
- `httpHookAllowedEnvVars`: 보간 허용 환경변수 화이트리스트
- 미등록 변수는 빈 문자열로 치환

**관리 정책:**
- `allowManagedHooksOnly`: 사용자/프로젝트/플러그인 Hook 차단, 관리 Hook만 허용
- `disableAllHooks`: 관리 Hook은 비활성화 불가

---

## 11. 마이그레이션 가이드

### 11.1 v2.1.0 → v2.1.72 주요 변경

| 변경 사항 | 이전 | 현재 |
|----------|------|------|
| 이벤트명 | `preToolUse` (소문자) | **`PreToolUse` (PascalCase)** |
| Hook 배열 구조 | hooks 배열 직접 | **matcher별 hooks 중첩** |
| Agent frontmatter | `type: prompt`만 | **settings.json과 동일 구조** |
| Skill frontmatter | `event` 필드 | **이벤트명 키** |
| Task 도구 | `Task` | **`Agent` (v2.1.63에서 리네임)** |

### 11.2 Bash Hook → 4가지 타입 전환 판단

#### Command 유지가 적합한 경우
- [ ] 100% 정확성 필요 (형식 검증, 존재 확인)
- [ ] 빠른 실행 필수 (< 100ms)
- [ ] 파일 조작/외부 API 직접 호출
- [ ] 비동기 실행 필요

#### HTTP 전환 고려 시
- [ ] 팀 전체 공유 검증 로직
- [ ] 중앙화된 감사/로깅
- [ ] 외부 승인 시스템 연동

#### Prompt 전환 고려 시
- [ ] 복잡한 if-else가 많은 검증
- [ ] 자연어/의미 분석 필요
- [ ] 정책이 자주 변경됨
- [ ] 성능이 덜 중요

#### Agent 전환 고려 시
- [ ] 파일 탐색이 필요한 검증
- [ ] 멀티턴 대화가 필요
- [ ] 테스트 실행 등 복합 검증
- [ ] 가장 높은 정확도 필요

### 11.3 Skill Hooks 마이그레이션

**이전 (v2.1.0):**
```yaml
hooks:
  - event: PreSkillUse
    prompt: |
      검증 프롬프트...
  - event: PostSkillUse
    prompt: |
      결과 검증...
```

**현재 (v2.1.72):**
```yaml
hooks:
  PreToolUse:
    - matcher: Write
      hooks:
        - type: prompt
          prompt: |
            검증 프롬프트...
  PostToolUse:
    - matcher: Write
      hooks:
        - type: prompt
          prompt: |
            결과 검증...
```

### 11.4 Global → Agent/Skill Hook 전환

**전환 권장 기준:**
- [ ] 특정 Agent/Skill에서만 필요한 검증인가?
- [ ] 다른 곳에서는 불필요한가?
- [ ] Agent/Skill별로 다른 검증 필요한가?

**2개 이상 YES → Agent/Skill Hook 전환 권장**

---

## 참고 문서

- **공식 Hooks 가이드**: https://code.claude.com/docs/en/hooks-guide.md
- **공식 Hooks 레퍼런스**: https://code.claude.com/docs/en/hooks.md
- **Skill 생성**: [claude_skill_creation_2026.md](claude_skill_creation_2026.md)
- **오케스트레이션**: [claude_orchestration_guide.md](claude_orchestration_guide.md)
- **MCP 통합**: [claude_mcp_integration_guide.md](claude_mcp_integration_guide.md)

---

**작성자**: Claude Sonnet 4.5 → Claude Opus 4.6
**최종 업데이트**: 2026년 3월 11일
