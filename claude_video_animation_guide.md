# Claude Code 영상/애니메이션 제작 가이드

> Claude Code와 Remotion, Manim, Blender, FFmpeg 등을 활용하여 프로그래밍 방식으로 영상과 애니메이션을 제작하는 실전 가이드입니다.
> 최종 업데이트: 2026년 3월 | Claude Code v2.1.72 기반

---

## 목차

1. [개요](#1-개요)
2. [Remotion Agent Skills](#2-remotion-agent-skills)
3. [특수 용도 도구](#3-특수-용도-도구)
4. [트러블슈팅 & 참고자료](#4-트러블슈팅--참고자료)

---

## 1. 개요

### 1.1 2026년 영상/애니메이션 생태계

2026년 초 기준, Claude Code로 영상을 만드는 방식은 **"스킬 하나 설치하고 프롬프트"**로 단순화되었습니다. Remotion Agent Skills가 주간 135,500회 이상 설치(skills.sh 기준)를 기록하며 사실상 표준으로 자리 잡았고, 나머지 도구들은 특수 목적을 위해 보조적으로 사용됩니다.

```
영상 제작 생태계 (2026.03)
├── 🎬 Remotion Agent Skills ─── 범용 영상 제작 (핵심)
│   ├── 37개 룰 파일
│   ├── React/TypeScript 기반
│   └── 주간 135,500+ 설치 (skills.sh 기준)
├── 📐 Manim ─────────────────── 수학/교육 애니메이션
├── 🎨 Blender MCP ───────────── 3D 모델링/렌더링
├── 🔧 FFmpeg MCP ────────────── 영상 후처리/변환
└── 기타
    ├── json2video MCP (API 기반 생성)
    ├── Videocut Skills (토킹헤드 편집)
    └── YouTube Clipper (다운로드+자막)
```

### 1.2 도구 선택 가이드

| 만들고 싶은 것 | 추천 도구 | 난이도 |
|--------------|----------|--------|
| 제품 데모, 소셜미디어 영상, 프레젠테이션 | **Remotion** | ⭐ 쉬움 |
| 수학 공식 설명, 교육 콘텐츠 | **Manim** | ⭐⭐ 보통 |
| 3D 모델링, 렌더링 영상 | **Blender MCP** | ⭐⭐⭐ 어려움 |
| 기존 영상 편집, 포맷 변환 | **FFmpeg MCP** | ⭐⭐ 보통 |
| 토킹헤드 영상 자동 편집 | **Videocut** | ⭐ 쉬움 |

> **결론: 90%의 경우 Remotion만으로 충분합니다.** 수학 애니메이션이나 3D가 필요한 특수한 경우에만 다른 도구를 고려하세요.

### 1.3 스킬 마켓플레이스

스킬을 검색하고 설치할 수 있는 마켓플레이스:

| 마켓플레이스 | 규모 | URL |
|------------|------|-----|
| **SkillsMP** | 66,500+ 스킬 | skillsmp.com |
| **SkillHub** | 7,000+ 스킬 | skillhub.club |
| **awesome-skills** | 123+ 큐레이션 | awesome-skills.com |

**스킬 CLI** (Vercel 제공):
```bash
npx skills add <repo>       # 설치
npx skills list              # 목록
npx skills find <keyword>    # 검색
npx skills update            # 업데이트
npx skills remove            # 삭제
```

---

## 2. Remotion Agent Skills

### 2.1 Remotion이란

Remotion은 **"React for Video"** — React 컴포넌트로 영상의 각 프레임을 정의하고, 렌더러가 MP4로 출력하는 프로그래밍 방식의 영상 제작 도구입니다.

| 항목 | 내용 |
|------|------|
| **저장소** | github.com/remotion-dev/skills |
| **스킬 이름** | `remotion-best-practices` |
| **룰 파일** | 37개 (영상, 오디오, 3D, 차트, 자막 등) |
| **주간 설치** | 135,500회 (Claude Code 98,000 / Gemini CLI 96,200 / Cursor 82,300) |
| **GitHub Stars** | ~2,000 (스킬) / 39,047 (Remotion 본체) |
| **라이선스** | 매출 $100M 미만 기업 무료, 그 이상은 유료 |

### 2.2 설치 및 설정

#### 방법 1: 새 프로젝트 생성 (권장)

```bash
# 1. Remotion 프로젝트 생성
npx create-video@latest
# → Blank 템플릿 선택, TailwindCSS 활성화, Skills 설치 선택

# 2. 프로젝트 이동 및 의존성 설치
cd my-video
pnpm install

# 3. 프리뷰 서버 시작 (터미널 1)
pnpm run dev
# → http://localhost:3000 에서 Remotion Studio 열림

# 4. Claude Code 시작 (터미널 2)
cd my-video
claude
```

#### 방법 2: 기존 프로젝트에 스킬 추가

```bash
# 스킬만 설치 (.claude/skills 에 저장됨)
npx skills add remotion-dev/skills

# 또는 URL로 직접 지정
npx skills add https://github.com/remotion-dev/skills --skill remotion-best-practices
```

#### 방법 3: 스킬 업데이트

```bash
npx remotion skills update
```

#### 필수 요건

- Node.js 16+ (20 LTS 권장)
- Claude Code 유료 구독
- pnpm 권장 (npm도 가능)

### 2.3 37개 룰 파일 카탈로그

Remotion Agent Skills는 `skills/remotion/rules/` 디렉토리에 37개 마크다운 룰 파일을 포함합니다. Claude Code가 이 룰을 참조하여 올바른 Remotion 코드를 작성합니다.

#### 영상/이미지 관련

| 룰 파일 | 설명 |
|---------|------|
| `videos.md` | 영상 삽입 — 트리밍, 볼륨, 속도, 루프, 피치 조절 |
| `images.md` | 이미지 삽입 — `<Img>` 컴포넌트 사용 |
| `assets.md` | 에셋 관리 — 이미지, 영상, 오디오, 폰트 임포트 |
| `gifs.md` | GIF 표시 — 타임라인과 동기화 |
| `transparent-videos.md` | 투명 배경 영상 렌더링 |
| `trimming.md` | 애니메이션 시작/끝 잘라내기 |
| `extract-frames.md` | 특정 타임스탬프에서 프레임 추출 (Mediabunny) |

#### 오디오 관련

| 룰 파일 | 설명 |
|---------|------|
| `audio.md` | 오디오 삽입 — 볼륨, 속도, 피치, 트리밍 |
| `sfx.md` | 효과음 연동 |
| `voiceover.md` | AI 보이스오버 — ElevenLabs TTS 연동 |
| `audio-visualization.md` | 스펙트럼 바, 파형, 베이스 반응 이펙트 |
| `get-audio-duration.md` | 오디오 파일 길이 가져오기 (Mediabunny) |

#### 텍스트/타이포그래피

| 룰 파일 | 설명 |
|---------|------|
| `text-animations.md` | 텍스트 애니메이션 패턴 |
| `fonts.md` | Google Fonts, 로컬 폰트 로딩 |
| `measuring-text.md` | 텍스트 크기 측정, 오버플로 체크 |

#### 자막/캡션

| 룰 파일 | 설명 |
|---------|------|
| `subtitles.md` | 자막 처리 |
| `display-captions.md` | 캡션 표시 |
| `import-srt-captions.md` | SRT 자막 파일 임포트 |
| `transcribe-captions.md` | 캡션 자동 생성 |

#### 애니메이션/타이밍

| 룰 파일 | 설명 |
|---------|------|
| `animations.md` | 기본 애니메이션 스킬 |
| `timing.md` | 보간 곡선 — linear, easing, spring |
| `transitions.md` | 장면 전환 패턴 |
| `sequencing.md` | 시퀀싱 — 딜레이, 트림, 지속시간 제한 |
| `light-leaks.md` | 라이트 리크 오버레이 이펙트 |

#### 구조/설정

| 룰 파일 | 설명 |
|---------|------|
| `compositions.md` | 컴포지션, 스틸, 폴더, 기본 props 정의 |
| `calculate-metadata.md` | 동적으로 지속시간, 크기, props 설정 |
| `parameters.md` | Zod 스키마로 영상 파라미터화 |
| `tailwind.md` | TailwindCSS 사용 |
| `measuring-dom-nodes.md` | DOM 요소 크기 측정 |

#### 미디어 분석 (Mediabunny)

| 룰 파일 | 설명 |
|---------|------|
| `can-decode.md` | 브라우저 디코딩 가능 여부 확인 |
| `get-video-dimensions.md` | 영상 가로/세로 크기 |
| `get-video-duration.md` | 영상 길이 (초) |
| `ffmpeg.md` | FFmpeg 작업 — 트리밍, 무음 감지 |

#### 특수 기능

| 룰 파일 | 설명 |
|---------|------|
| `3d.md` | 3D 콘텐츠 — Three.js, React Three Fiber |
| `charts.md` | 차트 — 바, 파이, 라인, 주식 차트 |
| `lottie.md` | Lottie 애니메이션 삽입 |
| `maps.md` | Mapbox 지도 + 애니메이션 |

### 2.4 기본 사용법 — 프롬프트로 영상 만들기

#### 프로젝트 구조

```
my-video/
├── src/
│   ├── Root.tsx           # 컴포지션 등록
│   ├── Composition.tsx    # 메인 영상 컴포넌트
│   └── ...
├── public/                # 이미지, 영상, 폰트 에셋
├── .claude/
│   └── skills/            # Remotion 스킬 파일
├── package.json
└── remotion.config.ts
```

#### 프롬프트 예시

**제품 데모 영상:**
```
1920x1080, 30fps, 15초짜리 제품 소개 영상을 만들어줘.
- 처음 3초: 로고 페이드인 (logo.png는 public 폴더에 있어)
- 3~8초: 주요 기능 3개를 순서대로 텍스트로 보여줘
- 8~13초: 스크린샷 슬라이드쇼 (public/screenshots/ 폴더)
- 마지막 2초: CTA 텍스트 "지금 시작하세요" 페이드아웃
```

**소셜미디어 숏폼:**
```
1080x1920 세로 영상, 30fps, 10초.
배경 그라데이션 위에 큰 텍스트가 하나씩 나타나는 구성.
텍스트: "AI로", "영상을", "만드세요"
각 텍스트는 spring 애니메이션으로 등장, 2초 간격.
```

#### 핵심 API 패턴

```tsx
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

export const MyVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 프레임 기반 애니메이션
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  // 스프링 애니메이션
  const scale = spring({ frame, fps, config: { damping: 12 } });

  return (
    <div style={{ opacity, transform: `scale(${scale})` }}>
      <h1>Hello, Video!</h1>
    </div>
  );
};
```

### 2.5 프롬프트 갤러리

Remotion 공식 사이트(remotion.dev/prompts)에서 검증된 프롬프트 템플릿을 제공합니다:

| 템플릿 | 설명 |
|--------|------|
| Travel Route on Map | 3D 랜드마크가 있는 여행 경로 |
| News Headline Highlight | 뉴스 기사 헤드라인 강조 |
| Launch Video on X | X(트위터) 출시 영상 |
| Product Demo | 제품 데모 영상 |
| Rocket Launches Timeline | 타임라인 형태의 데이터 시각화 |
| Three.js Top 20 Games | 3D 랭킹 영상 |
| Transparent CTA Overlay | 투명 배경 CTA 오버레이 |
| Cinematic Tech Intro | 시네마틱 테크 인트로 |
| Bar + Line Chart | 복합 차트 애니메이션 |
| Music CD Store Promo | 음악 스토어 프로모션 |

### 2.6 영상 조정 방법

#### 방법 1: 프롬프트로 조정 (가장 쉬움)

```
"로고 등장을 3초에서 5초로 늘려줘"
"배경색을 #1a1a2e로 바꿔줘"
"텍스트 페이드인을 spring으로 바꾸고 damping 8로"
"두 번째 장면과 세 번째 장면 사이에 fade 트랜지션 추가"
```

Claude가 코드를 수정하면 Remotion Studio에서 자동으로 프리뷰가 반영됩니다.

#### 방법 2: Remotion Studio에서 시각적 조정

`pnpm run dev`로 열리는 브라우저 프리뷰:
- **타임라인 슬라이더**: 프레임별로 결과 확인
- **Props 패널**: Zod 스키마 기반 파라미터를 실시간 변경
- **렌더 버튼**: 최종 MP4 출력

#### 방법 3: 코드 직접 수정

React 컴포넌트이므로 직접 수정도 가능합니다. `useCurrentFrame()`, `interpolate()`, `spring()` 등의 API를 사용합니다.

### 2.7 실전 예시

#### 예시 1: 제품 소개 영상

```bash
# 프로젝트 생성 및 설정
npx create-video@latest --template blank
cd my-product-video
pnpm install
pnpm run dev

# Claude Code에서 프롬프트
claude
```

프롬프트:
```
제품 소개 영상을 만들어줘.
- 해상도: 1920x1080, 30fps, 총 20초
- 장면 1 (0~4초): 로고 spring 등장, 배경 #0f0f23
- 장면 2 (4~10초): 기능 카드 3개가 왼쪽에서 슬라이드인
  - "빠른 속도" / "쉬운 사용" / "강력한 기능"
- 장면 3 (10~16초): public/demo.mp4 영상 삽입, 둥근 모서리
- 장면 4 (16~20초): CTA "무료로 시작하세요" + 가격 "월 9,900원"
- 장면 전환은 fade transition 사용
- 폰트: Pretendard
```

#### 예시 2: 데이터 시각화 영상

```
바 차트 레이스 영상을 만들어줘.
- 1920x1080, 30fps, 15초
- 데이터: 한국, 미국, 일본, 중국의 연도별 GDP
- 막대가 spring 애니메이션으로 성장
- 각 나라별 색상 다르게
- 하단에 연도 카운터 표시
```

#### 예시 3: 유튜브 쇼츠

```
1080x1920 세로, 30fps, 30초 유튜브 쇼츠.
- 배경: 어두운 그라데이션 (#0a0a0a → #1a1a2e)
- 상단 제목: "알아두면 좋은 단축키 5가지" (노란 글씨)
- 5개 팁이 3초 간격으로 등장 (아래에서 위로 슬라이드)
- 각 팁 옆에 키보드 아이콘 (이모지 사용)
- 마지막 5초: "좋아요 & 구독" CTA
- BGM: public/bgm.mp3 볼륨 0.3
```

### 2.8 프롬프트 작성 팁

효과적인 프롬프트를 위한 규칙:

| 규칙 | 나쁜 예 | 좋은 예 |
|------|--------|--------|
| 구체적 수치 사용 | "큰 글씨" | "80px, Bold" |
| 해상도/FPS 명시 | "영상 만들어" | "1920x1080, 30fps, 15초" |
| 타이밍 지정 | "천천히 나타나" | "1초 동안 fade in" |
| 에셋 경로 명시 | "로고 넣어" | "public/logo.png 사용" |
| 색상 코드 사용 | "파란 배경" | "배경 #1e40af" |
| 단계별 구성 | "멋진 영상" | "장면 1 (0~3초): ..., 장면 2 (3~7초): ..." |

**핵심 원칙:**
- 한 번에 완성하려 하지 말고 **반복적으로 다듬기**
- 복잡한 멀티 이펙트보다 **깔끔한 단일 효과** 추천
- 에셋은 반드시 `public/` 폴더에 먼저 넣고 경로 알려주기

### 2.9 렌더링 및 출력

```bash
# 프리뷰에서 확인 후 최종 렌더링
npx remotion render src/index.ts MyComposition out/video.mp4

# 옵션
npx remotion render src/index.ts MyComposition out/video.mp4 \
  --codec h264 \
  --quality 80 \
  --frames 0-300
```

또는 Remotion Studio 브라우저에서 **Render** 버튼 클릭.

### 2.10 라이선스 및 제한사항

| 항목 | 내용 |
|------|------|
| **무료 대상** | 연매출 $100M 미만 기업 및 개인 |
| **유료 대상** | 연매출 $100M 이상 기업 (remotion.pro) |
| **스킬 라이선스** | 저장소에 명시적 라이선스 없음 |
| **복잡한 애니메이션** | 요소 겹침, 타이밍 꼬임 발생 가능 |
| **보안 감사** | Gen Agent Trust Hub: Pass / Socket: Pass / Snyk: Warn |

---

## 3. 특수 용도 도구

### 3.1 Manim — 수학/교육 애니메이션

3Blue1Brown 스타일의 수학/과학 애니메이션을 만드는 Python 기반 도구입니다.

| 항목 | 내용 |
|------|------|
| **GitHub Stars** | 85,100 (3b1b 원본) / 36,200 (커뮤니티) |
| **MCP 서버** | abhiemj/manim-mcp-server (567 stars) |
| **플러그인** | Yusuke710/manim-skill |
| **언어** | Python |
| **용도** | 수학 공식, 기하학, 그래프, 교육 콘텐츠 |

#### MCP 서버 설치

```bash
# 필수: Python 3.8+, Manim Community Edition
uv pip install manim mcp
git clone https://github.com/abhiemj/manim-mcp-server.git
```

Claude Desktop 또는 Claude Code 설정:
```json
{
  "mcpServers": {
    "manim-server": {
      "command": "python",
      "args": ["path/to/manim-mcp-server/src/manim_server.py"],
      "env": {
        "MANIM_EXECUTABLE": "path/to/manim"
      }
    }
  }
}
```

#### 플러그인 설치 (대안)

```bash
/plugin marketplace add Yusuke710/manim-skill
```

#### 사용 예시

```
이차방정식 ax² + bx + c = 0의 근의 공식 유도 과정을
3Blue1Brown 스타일 애니메이션으로 만들어줘.
완전제곱식으로 변환하는 과정을 단계별로 보여줘.
```

### 3.2 Blender MCP — 3D 모델링/렌더링

Blender를 MCP 서버로 변환하여 Claude Code에서 3D 작업을 제어합니다.

| 항목 | 내용 |
|------|------|
| **GitHub** | poly-mcp/Blender-MCP-Server (19 stars) |
| **도구 수** | 51+ |
| **필수** | Blender 3.0.0+ |
| **카테고리** | 오브젝트, 변환, 머터리얼, 모델링, 애니메이션, 카메라, 렌더링, 물리, 지오메트리 노드 |

#### 설치

1. `blender_mcp.py` 다운로드
2. Blender → Edit → Preferences → Add-ons → Install from Disk
3. N-panel → MCP Server 탭에서 서버 시작
4. `http://localhost:8000`에서 실행

#### 사용 예시

```
파란색 구체가 경사면을 따라 굴러 내려오는
물리 시뮬레이션 3D 애니메이션을 만들어줘.
카메라는 측면에서 따라가도록 설정해줘.
```

### 3.3 FFmpeg MCP — 영상 후처리

기존 영상의 편집, 변환, 후처리를 위한 MCP 서버입니다.

| 항목 | 내용 |
|------|------|
| **GitHub** | dubnium0/ffmpeg-mcp (15 stars) |
| **도구 수** | 40+ (8개 카테고리) |
| **필수** | Python 3.10+, FFmpeg |

#### 8개 카테고리

| 카테고리 | 도구 수 | 주요 기능 |
|---------|--------|----------|
| 미디어 분석 | 7 | 코덱, 해상도, 비트레이트 정보 |
| 포맷 변환 | 5 | MP4↔WebM, 코덱 변환 |
| 영상 편집 | 10 | 트리밍, 연결, 리사이즈, 속도, PiP |
| 오디오 처리 | 7 | 추출, 믹스, 볼륨, 노이즈 제거 |
| 비주얼 이펙트 | 7 | 텍스트/이미지 오버레이, 필터 |
| 자막 | 3 | 삽입, 추출, 변환 |
| 스트리밍 | 4 | HLS, DASH 생성 |
| 고급 처리 | 14 | 스태빌라이저, 2-pass 인코딩 |

#### 설치

```bash
# FFmpeg 설치
# Windows: winget install ffmpeg
# macOS: brew install ffmpeg

git clone https://github.com/dubnium0/ffmpeg-mcp.git
cd ffmpeg-mcp
uv pip install -r requirements.txt
```

#### Remotion + FFmpeg 파이프라인

```bash
# 1. Remotion으로 영상 생성
npx remotion render src/index.ts MyComp out/raw.mp4

# 2. FFmpeg MCP로 후처리 (Claude Code에서)
"raw.mp4를 720p로 리사이즈하고, 볼륨 정규화하고,
 intro.mp4와 연결해서 final.mp4로 만들어줘"
```

### 3.4 기타 도구

#### json2video MCP — API 기반 영상 생성

```bash
# 설치 (json2video API 키 필요)
env JSON2VIDEO_API_KEY=your_key npx -y @omerrgocmen/json2video-mcp
```

JSON으로 씬을 정의하면 서버에서 영상을 생성합니다. 텍스트, 이미지, 영상 클립, TTS, HTML, 자막 지원. **유료 API 키 필요.**

#### Videocut Skills — 토킹헤드 편집

```bash
git clone https://github.com/Ceeon/videocut-skills ~/.claude/skills/videocut
```

AI 기반 토킹헤드 영상 자동 편집 + 자막 생성. (1,092 stars)

#### YouTube Clipper — 영상 다운로드 + 자막

```bash
npx skills add https://github.com/op7418/Youtube-clipper-skill
```

유튜브 영상 다운로드, 시맨틱 챕터 분할, 이중 자막 생성.

#### Claude Design Skillstack — 웹 3D/애니메이션

```bash
/plugin marketplace add freshtechbro/claudedesignskills
/plugin install core-3d-animation   # 번들 (5개 스킬)
```

22개 스킬 + 5개 번들: Three.js WebGL, GSAP ScrollTrigger, React Three Fiber, Framer Motion, Babylon.js, A-Frame WebXR, PixiJS, Lottie 등.

---

## 4. 트러블슈팅 & 참고자료

### 4.1 자주 묻는 질문

**Q: Remotion으로 실사 영상 생성이 가능한가요?**
A: 아닙니다. Remotion은 **프로그래밍 방식의 모션 그래픽** 도구입니다. 기존 실사 영상을 삽입하고 편집하는 것은 가능하지만, AI가 실사 영상을 생성하는 것은 Sora, Runway 같은 생성형 AI 도구의 영역입니다.

**Q: 여러 도구를 조합해야 하나요?**
A: 대부분의 경우 Remotion 하나로 충분합니다. 이미지, 영상, 오디오, 텍스트, 차트, 3D까지 모두 지원합니다. 수학 애니메이션(Manim)이나 전문 3D 모델링(Blender)이 필요한 경우에만 다른 도구를 추가하세요.

**Q: 무료로 사용할 수 있나요?**
A: Remotion은 연매출 $100M 미만이면 무료입니다. Manim(MIT), FFmpeg(LGPL)은 완전 무료입니다. json2video는 유료 API 키가 필요합니다.

**Q: 영상 품질이 좋은가요?**
A: React 컴포넌트 기반이므로 해상도 제한이 없습니다. 4K(3840x2160)도 가능합니다. 다만 복잡한 효과가 겹치면 렌더링 시간이 늘어납니다.

### 4.2 라이선스 요약

| 도구 | 라이선스 | 비용 |
|------|---------|------|
| Remotion | Custom | 매출 $100M 미만 무료 |
| Manim | MIT | 무료 |
| Blender | GPL | 무료 |
| FFmpeg | LGPL | 무료 |
| json2video | 상용 | API 키 유료 |
| Videocut | 확인 필요 | - |

### 4.3 참고 튜토리얼 및 문서

| 자료 | 출처 |
|------|------|
| Remotion + Claude Code 공식 가이드 | remotion.dev/docs/ai/claude-code |
| Remotion 프롬프트 갤러리 | remotion.dev/prompts |
| Remotion AI Skills 문서 | remotion.dev/docs/ai/skills |
| Claude Code Can Make Videos Now (Full Guide) | Alex McFarland (Substack) |
| Making Videos with Code: Complete Guide | Kristopher Dunham (Medium) |
| Claude Code Remotion: Best Motion Guide 2026 | dplooy.com |
| 10 Must-Have Skills for Claude in 2026 | unicodeveloper (Medium) |
| Manim Community 문서 | docs.manim.community |
| Blender MCP 가이드 | github.com/poly-mcp/Blender-MCP-Server |

### 4.4 에이전트별 지원 현황

Remotion Skills는 Claude Code 외에도 다양한 AI 에이전트를 지원합니다:

| 에이전트 | 주간 설치 |
|---------|----------|
| Claude Code | 98,000 |
| Gemini CLI | 96,200 |
| Cursor | 82,300 |
| OpenCode | 82,200 |
| Codex | 80,900 |
| Antigravity | 69,100 |

---

*© 2025-2026 MyCoding Book. Claude Code 영상/애니메이션 제작 가이드.*
