# Claude Code 2026년 3월 종합 업데이트 가이드

**작성일:** 2026년 3월 11일
**기반:** Claude Code v2.1.72

Claude Code v2.1.0 이후 추가된 **주요 신규 기능**을 종합 정리한 가이드입니다. 기존 가이드에서 다루지 않는 독립적인 기능들을 포함합니다.

---

## 목차

1. [Plugins 시스템](#1-plugins-시스템)
2. [Plan Mode](#2-plan-mode)
3. [Voice Mode](#3-voice-mode)
4. [Auto Memory](#4-auto-memory)
5. [Output Styles](#5-output-styles)
6. [Effort Levels](#6-effort-levels)
7. [번들 스킬 요약](#7-번들-스킬-요약)
8. [슬래시 명령어 전체 목록](#8-슬래시-명령어-전체-목록)
9. [IDE 통합](#9-ide-통합)
10. [주요 개선사항 (v2.1.0 → v2.1.72)](#10-주요-개선사항)

---

## 1. Plugins 시스템

**Plugins**는 Skills, Agents, Hooks, MCP 서버, LSP 서버를 하나로 묶어 배포하는 확장 패키지입니다.

### 구조

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json          # 매니페스트 (필수)
├── skills/                  # 스킬 번들
│   └── deploy/SKILL.md
├── agents/                  # 에이전트 번들
│   └── reviewer.md
├── hooks/                   # Hook 번들
│   └── hooks.json
├── .mcp.json               # MCP 서버 설정
└── .lsp.json               # LSP 서버 설정
```

### 매니페스트 (plugin.json)

```json
{
  "name": "my-plugin",
  "description": "플러그인 설명",
  "version": "1.0.0",
  "author": { "name": "작성자" },
  "homepage": "https://...",
  "license": "MIT"
}
```

### 설치 및 관리

```bash
# 인터랙티브 메뉴
/plugin                              # 검색, 설치, 관리
/plugin install plugin-name          # 직접 설치

# 마켓플레이스 관리
/plugin marketplace add owner/repo   # GitHub에서 추가
/plugin marketplace add ./path       # 로컬 경로
/plugin marketplace list             # 목록
/plugin marketplace update name      # 업데이트
/plugin marketplace remove name      # 제거

# 변경 적용
/reload-plugins                      # 재시작 없이 적용
```

### 설치 스코프

| 스코프 | 위치 | 범위 |
|--------|------|------|
| User | `~/.claude/plugins/` | 모든 프로젝트 |
| Project | `.claude/settings.json` | 팀 공유 |
| Local | `.claude/settings.local.json` | 개인 |
| Managed | 관리자 배포 | 조직 전체 |

---

## 2. Plan Mode

코드 변경 없이 **분석과 계획만** 수행하는 안전한 모드입니다.

### 활성화

```bash
# CLI 옵션
claude --permission-mode plan

# 세션 중 전환
Shift+Tab   # 권한 모드 순환 (default → acceptEdits → plan)

# 기본 설정
```

```json
{ "permissions": { "defaultMode": "plan" } }
```

### 사용 방식

```
1. Plan Mode 진입
2. "인증 시스템을 OAuth2로 리팩토링해야 해" → Claude가 분석 + 계획 제시
3. "하위 호환성은?" → 계획 보완
4. Ctrl+G → 에디터에서 계획 편집
5. Plan Mode 해제 → Claude가 계획 기반으로 구현
```

### 특징

- 읽기 전용 도구만 사용 (Read, Grep, Glob 등)
- `AskUserQuestion`으로 명확화 질문
- 코드 분석 → 계획 제시 → 사용자 승인 후 구현
- Headless 모드: `claude --permission-mode plan -p "분석할 내용..."`

---

## 3. Voice Mode

Push-to-talk 방식의 **음성 입력** 모드입니다.

### 활성화 및 사용

```bash
/voice    # 음성 모드 활성화
```

- **스페이스바 길게 누르기** → 말하기 → 놓기
- 실시간 음성 → 텍스트 변환
- 터미널 안전을 위해 의도적 push-to-talk 설계 (상시 청취 없음)

### 지원

- Pro, Max, Team, Enterprise 플랜
- 추가 비용 없음
- 리포 이름, 개발 용어에 최적화된 전사 정확도

---

## 4. Auto Memory

Claude가 세션을 넘어 **자동으로 학습 내용을 저장**합니다.

### 저장 위치

```
~/.claude/projects/<project>/memory/
├── MEMORY.md          # 인덱스 (처음 200줄 자동 로딩)
├── debugging.md       # 토픽 파일 (온디맨드)
├── api-conventions.md
└── ...
```

- `<project>` = git 저장소 (worktree는 메모리 공유)
- 파일은 일반 마크다운, 직접 편집/삭제 가능

### 관리

```bash
/memory    # 인터랙티브 관리
```

- 로딩된 CLAUDE.md 확인
- 자동 메모리 파일 확인
- 자동 메모리 켜기/끄기
- 메모리 폴더 열기

### 저장 내용

- 빌드 명령어
- 디버깅 인사이트
- 아키텍처 노트
- 코드 스타일 선호
- 워크플로우 습관

### 비활성화

```bash
export CLAUDE_CODE_DISABLE_AUTO_MEMORY=1
# 또는 settings.json: { "autoMemoryEnabled": false }
# 또는 /memory 메뉴에서 토글
```

---

## 5. Output Styles

Claude Code의 응답 스타일을 변경합니다.

### 내장 스타일

| 스타일 | 설명 |
|--------|------|
| **Default** | 표준 — 효율적 소프트웨어 엔지니어링 |
| **Explanatory** | 설명형 — 구현 선택의 이유와 패턴 설명 |
| **Learning** | 학습형 — 코드 작성 실습 유도 |

### 변경

```bash
/output-style              # 인터랙티브 메뉴
/output-style explanatory  # 직접 변경
```

프로젝트별 `.claude/settings.local.json`에 저장.

### 커스텀 스타일 생성

```yaml
# ~/.claude/output-styles/my-style.md
---
name: My Custom Style
description: 간단한 설명
keep-coding-instructions: false   # true면 코딩 지침 유지
---

# 커스텀 지침

당신은 [역할]입니다...
[커스텀 시스템 프롬프트]
```

**저장 위치:**
- 사용자: `~/.claude/output-styles/`
- 프로젝트: `.claude/output-styles/`

---

## 6. Effort Levels

Claude의 추론 깊이를 조절합니다.

### 3단계

| 레벨 | 표시 | 설명 |
|------|------|------|
| **Low** | ○ | 빠름, 저비용, 최소 추론 |
| **Medium** | ◐ | 균형 (Opus 4.6 기본) |
| **High** | ● | 깊은 추론, 더 많은 thinking 토큰 |

### 설정

```bash
# 키보드
Alt+P (Windows/Linux) / Option+P (macOS)

# /model 명령에서 좌/우 화살표

# 환경변수
export CLAUDE_CODE_EFFORT_LEVEL=high

# settings.json
{ "effortLevel": "medium" }
```

### Adaptive Reasoning

- Opus 4.6, Sonnet 4.6에서 지원
- effort level에 따라 thinking 토큰 동적 할당
- 고정 예산이 아닌 복잡도 기반 스케일링
- 비활성화: `CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING=1`

---

## 7. 번들 스킬 요약

| 스킬 | 호출 | 설명 |
|------|------|------|
| `/simplify` | 수동/자동 | 코드 재사용, 품질, 효율성 리뷰 (3 에이전트 병렬) |
| `/batch` | 수동/자동 | 대규모 코드베이스 병렬 변경 (worktree 격리) |
| `/debug` | 수동/자동 | 세션 디버그 로그 분석 |
| `/loop` | 수동/자동 | 프롬프트 반복 실행 (기본 10분 간격) |
| `/claude-api` | 자동 | Claude API/SDK 레퍼런스 자동 로딩 |

상세: [Skill 생성 가이드](claude_skill_creation_2026.md)

---

## 8. 슬래시 명령어 전체 목록

### 워크플로우

| 명령어 | 설명 |
|--------|------|
| `/agents` | 서브에이전트 관리 |
| `/plan` | Plan Mode 진입 |
| `/fork` | 대화 포크 생성 |
| `/batch` | 대규모 병렬 변경 |
| `/simplify` | 코드 품질 리뷰 |
| `/debug` | 세션 디버깅 |
| `/loop` | 반복 실행 |

### 메모리 & 컨텍스트

| 명령어 | 설명 |
|--------|------|
| `/memory` | CLAUDE.md 및 자동 메모리 관리 |
| `/clear` | 대화 기록 초기화 |
| `/compact` | 컨텍스트 압축 (포커스 옵션) |
| `/context` | 컨텍스트 사용량 시각화 |
| `/copy` | 응답 클립보드 복사 (picker) |

### 코드 & Git

| 명령어 | 설명 |
|--------|------|
| `/diff` | 인터랙티브 diff 뷰어 |
| `/rewind` | 대화 되감기/체크포인트 |
| `/resume` | 이전 세션 재개 |
| `/remote-control` | 원격 접근 가능 세션 |

### 설정

| 명령어 | 설명 |
|--------|------|
| `/config` | 설정 열기 |
| `/permissions` | 권한 관리 |
| `/hooks` | Hook 관리 |
| `/keybindings` | 키 바인딩 설정 |
| `/mcp` | MCP 서버 관리 |
| `/terminal-setup` | 터미널 키 바인딩 |
| `/statusline` | 상태줄 설정 |
| `/model` | 모델 선택/변경 |
| `/fast` | Fast 모드 토글 |

### 정보

| 명령어 | 설명 |
|--------|------|
| `/help` | 명령어 도움말 |
| `/cost` | 토큰 사용 통계 |
| `/status` | 버전/모델/계정 정보 |
| `/release-notes` | 체인지로그 |
| `/doctor` | 설치 진단 |

### 기타

| 명령어 | 설명 |
|--------|------|
| `/output-style` | 출력 스타일 변경 |
| `/theme` | 색상 테마 변경 |
| `/vim` | Vim 편집 모드 토글 |
| `/voice` | 음성 모드 |
| `/plugin` | 플러그인 관리 |

---

## 9. IDE 통합

### VS Code Extension

- Effort level 표시 (입력 테두리)
- Activity Bar에 모든 세션 목록 (Spark 아이콘)
- Plan 모드: 마크다운 문서 뷰 + 댓글
- MCP 서버 관리 다이얼로그
- 플러그인 마켓플레이스 통합

### JetBrains IDEs

- PyCharm, IntelliJ, WebStorm 등 지원
- Remote Development 및 WSL 지원

### Desktop Apps

- macOS 및 Windows 데스크톱 앱
- 원격 세션 지원
- Cowork 탭 (협업 세션)
- Preview 서버 자동 검증

### Chrome Extension

- 브라우저 자동화 (테스트/디버깅)
- 멀티사이트 워크플로우

### Slack Integration

- Slack에서 직접 Claude Code 실행
- 저장소 선택 및 컨텍스트 수집

---

## 10. 주요 개선사항 (v2.1.0 → v2.1.72)

### 성능

- 번들 크기 ~510KB 감소
- Bash 명령 파싱 개선 (빠른 초기화, 메모리 누수 수정)
- 음성 전사 정확도 개선 (리포 이름, 개발 용어)
- 느린 종료 수정 (백그라운드 태스크/Hook 미응답)

### 안정성

- Skill Hook 이중 발동 수정
- 음성 모드 입력 지연 및 오탐 수정
- `--continue` + `--compact` 호환 수정
- 와일드카드/heredoc 권한 규칙 매칭 수정
- 병렬 도구 호출 시 실패한 Read/WebFetch/Glob이 형제 도구 취소하던 문제 수정
- Worktree 격리 + 태스크 재개 호환 수정

### 새 도구/명령어

- `/copy`에 `w` 키 추가 (파일 직접 쓰기, SSH 유용)
- `/plan`에 선택적 설명 인수 (`/plan 인증 버그 수정`)
- `ExitWorktree` 도구 추가
- Bash 자동 승인 확장 (`lsof`, `pgrep`, `ss`, `fd` 등)
- Agent 도구에 `model` 파라미터 복원
- `CLAUDE_CODE_DISABLE_CRON` 환경변수 추가

---

## 참고 문서

- [Skill 생성 가이드](claude_skill_creation_2026.md)
- [Hook 생성 가이드](claude_hook_creation_2026.md)
- [오케스트레이션 가이드](claude_orchestration_guide.md)
- [MCP 연계 가이드](claude_mcp_integration_guide.md)
- [공식 Changelog](https://code.claude.com/docs/en/changelog.md)

---

**작성자**: Claude Opus 4.6
**최종 업데이트**: 2026년 3월 11일
