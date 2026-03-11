# AI 제품 상세페이지 제작 가이드

> **Claude Code + AI 이미지 생성 도구를 활용한 한국 이커머스 상세페이지 제작 실전 가이드**
> 최종 업데이트: 2026-03-11 | 대상: 네이버 스마트스토어, 쿠팡, 11번가 등 국내 플랫폼

## 목차

1. [개요](#1-개요)
2. [이미지 제작](#2-이미지-제작)
3. [레이아웃 제작](#3-레이아웃-제작)
4. [이미지 변환 및 업로드](#4-이미지-변환-및-업로드)
5. [자동화](#5-자동화)
6. [실전 예시](#6-실전-예시)
7. [트러블슈팅 및 참고자료](#7-트러블슈팅-및-참고자료)

---

## 1. 개요

### 1.1 한국 이커머스 상세페이지 특성

한국 이커머스 상세페이지는 해외와 근본적으로 다릅니다:

| 특성 | 한국 | 해외 (Amazon 등) |
|------|------|------------------|
| **포맷** | 긴 세로 스크롤 이미지 | HTML 텍스트 + 사진 |
| **폭** | 고정폭 (860px, 780px 등) | 반응형 |
| **핵심** | 이미지 안에 텍스트 삽입 | 텍스트 위주 |
| **분량** | 3,000~10,000px 세로 길이 | 짧은 불릿 포인트 |
| **제작 방식** | 포토샵/캔바 → 이미지 업로드 | CMS 에디터 직접 입력 |

### 1.2 플랫폼별 규격

| 플랫폼 | 권장 폭 | 최대 파일 크기 | 허용 포맷 | HTML 에디터 |
|--------|---------|---------------|-----------|------------|
| 네이버 스마트스토어 | 860px | 10MB/장 | JPG, PNG, GIF | O (제한적) |
| 쿠팡 | 780px | 10MB/장 | JPG, PNG | O (제한적) |
| 11번가 | 860px | 5MB/장 | JPG, PNG, GIF | O |
| G마켓/옥션 | 860px | 3MB/장 | JPG, PNG | O |
| 위메프 | 800px | 5MB/장 | JPG, PNG | O |

### 1.3 워크플로우 전체 그림

```
┌─────────────────────────────────────────────────────────────┐
│                    제품 상세페이지 제작 워크플로우               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [1단계] 이미지 제작 (외부 도구 + Gemini MCP)                │
│  ├── 나노바나나 2: 제품컷, 라이프스타일컷, 배너              │
│  ├── Flair.ai: 컨셉 씬 구성                                │
│  └── Photoroom: 배경 제거/교체                              │
│                                                             │
│  [2단계] 분석 & 카피 (Google AI Studio / NotebookLM)        │
│  ├── 경쟁사 페이지 분석                                      │
│  ├── 리뷰 분석 → 셀링포인트 추출                             │
│  └── 제품 설명 카피 생성                                     │
│                                                             │
│  [3단계] 레이아웃 (Claude Code)                              │
│  ├── Frontend Design Skill: HTML 상세페이지 생성             │
│  └── 이미지 배치 + 텍스트 배치                               │
│                                                             │
│  [4단계] 변환 & 업로드 (Claude Code)                         │
│  ├── Playwright MCP: HTML → 긴 스크린샷                     │
│  ├── 이미지 분할/최적화                                      │
│  └── 플랫폼 업로드                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.4 필요 도구 한눈에 보기

| 단계 | 도구 | 유형 | 가격 | 역할 |
|------|------|------|------|------|
| 이미지 | **나노바나나 2** | Gemini 앱/API | 앱 무료, API $0.067/1K | 핵심 이미지 생성 |
| 이미지 | Flair.ai | 웹 서비스 | 무료 5장, Pro $8/월 | 컨셉 씬 구성 |
| 이미지 | Photoroom | 앱/웹 | 무료~$9.99/월 | 배경 제거/교체 |
| 분석 | Google AI Studio | 웹 | 무료 | 경쟁사 분석, 카피 생성 |
| 분석 | NotebookLM | 웹 | 무료 | 리뷰 분석, 셀링포인트 추출 |
| 레이아웃 | **Claude Code** | CLI | 구독 포함 | HTML 상세페이지 생성 |
| 레이아웃 | Frontend Design Skill | Skill | 무료 (Claude Code 내) | 고퀄리티 UI 생성 |
| 레이아웃 | Pencil.dev | MCP | 무료 | 사전 디자인/와이어프레임 |
| 변환 | Playwright MCP | MCP | 무료 | HTML → 스크린샷 |
| API 연동 | Gemini MCP | MCP | API 쿼터 별도 | 나노바나나 API 호출 |

---

## 2. 이미지 제작

### 2.1 나노바나나 2 (핵심)

#### 나노바나나 2란?

2026년 2월 27일 출시된 Google의 최신 이미지 생성 모델입니다.

| 항목 | 내용 |
|------|------|
| 정식명 | Gemini 3.1 Flash Image |
| 코드명 | Nano Banana 2 |
| 이전 버전 | 나노바나나 Pro (유료 중심) |
| 해상도 | 최대 4K (3840×2160) |
| 텍스트 렌더링 | 한글/영문 이미지 내 텍스트 선명 렌더링 |
| 일관성 | 캐릭터 5명 + 오브젝트 14개까지 일관 유지 |
| 속도 | 실시간에 가까운 저지연 |
| 실시간 정보 | Google 검색 연동으로 최신 정보 반영 |

#### 사용 방법 2가지

**방법 A: Gemini 앱에서 무료 사용 (권장, 초보자)**

```
1. gemini.google.com 접속
2. 프롬프트 입력 (이미지 생성 요청)
3. 생성된 이미지 다운로드
4. Claude Code에서 HTML에 이미지 배치
```

**방법 B: Gemini MCP로 Claude Code에서 직접 호출 (고급)**

```bash
# Gemini MCP 설치
claude mcp add gemini npx @anthropic-ai/gemini-mcp@latest

# 또는 .mcp.json에 설정
{
  "mcpServers": {
    "gemini": {
      "command": "npx",
      "args": ["@anthropic-ai/gemini-mcp@latest"],
      "env": {
        "GEMINI_API_KEY": "your-api-key"
      }
    }
  }
}
```

> **주의**: Gemini 앱은 무료 무제한이지만, API는 쿼터 제한이 있습니다.
> 무료 쿼터: 분당 10회, 일 500회 (2026.03 기준)
> 유료: $0.067 / 1K 해상도 이미지

#### 제품 사진 프롬프트 예시

**제품컷 (깔끔한 배경)**

```
하얀 배경 위에 놓인 [제품명] 제품 사진.
정면 45도 각도, 부드러운 스튜디오 조명.
그림자는 자연스럽게, 제품 디테일이 선명하게 보이도록.
해상도 1024x1024, 제품 촬영 스타일.
```

**라이프스타일컷 (사용 장면)**

```
밝고 깨끗한 주방에서 [제품명]을 사용하는 30대 한국인 여성.
자연광이 들어오는 창가 옆, 따뜻한 분위기.
제품이 화면 중앙에 자연스럽게 배치.
한국 가정집 인테리어 스타일.
```

**프로모션 배너 (텍스트 포함)**

```
쇼핑몰 상세페이지용 프로모션 배너.
배경: 그라데이션 민트-화이트.
중앙에 큰 텍스트: "오늘만 특가 39,900원"
하단에 작은 텍스트: "무료배송 | 100% 정품"
제품 이미지가 우측에 배치. 860x400 비율.
```

**스펙 비교 이미지**

```
제품 A와 제품 B의 비교 이미지.
좌측: 일반 제품 (흐릿하게), 우측: 우리 제품 (선명하게).
중앙에 "VS" 텍스트.
하단에 주요 스펙 3가지를 아이콘과 함께 표시.
깔끔한 인포그래픽 스타일.
```

#### 벌크 이미지 생성 (BananaBatch)

대량 제품 이미지가 필요한 경우:

```
BananaBatch (bananabatch.com)
├── 스프레드시트에서 제품 정보 가져오기
├── 나노바나나 API로 벌크 생성
├── 클라우드 스토리지 자동 저장
└── 스프레드시트에 이미지 URL 자동 기록
```

### 2.2 Flair.ai — 컨셉 씬 구성

Flair.ai는 드래그앤드롭 캔버스에서 제품 사진의 구도를 직접 조절할 수 있는 도구입니다.

| 항목 | 내용 |
|------|------|
| 특징 | 3D 소품(돌, 나뭇잎, 물방울 등)을 캔버스에 배치 → AI가 씬 생성 |
| 강점 | 구도를 직접 잡을 수 있어 "우연에 맡기지 않는" 이미지 제작 |
| 가격 | 무료 5장, Pro $8/월 (150장), Enterprise 별도 |
| AI 모델 | 패션 착용컷, 주얼리 착용컷 자동 생성 |

**사용 시나리오**:
- 나노바나나로 구도 잡기 어려울 때
- 제품+소품+배경의 배치를 정밀하게 조절하고 싶을 때
- 패션/뷰티 카테고리에서 모델 착용컷이 필요할 때

### 2.3 보조 도구

| 도구 | 용도 | 가격 | 특징 |
|------|------|------|------|
| **Photoroom** | 배경 제거/교체 | 무료~$9.99/월 | 배경 제거 정확도 최고, 150M+ 다운로드 |
| **SellerPic** | 패션 모델 착용컷 | 유료 | 평면 사진 → AI 모델 착용컷 + 10초 영상 |
| **Draph Art** | 한국 스마트스토어 특화 | 유료 | 한국 이커머스 규격에 최적화 |
| **Claid.ai** | 올인원 제품 사진 | 유료 | 카탈로그~라이프스타일 전 범위 |

### 2.4 Google AI Studio / NotebookLM 활용

#### Google AI Studio — 경쟁사 분석 & 카피 생성

Google AI Studio (aistudio.google.com)는 **무료**로 사용할 수 있습니다.

**경쟁사 상세페이지 분석**:

```
[AI Studio에서]
1. "Tools" 버튼 클릭
2. 경쟁사 상세페이지 URL 붙여넣기
3. 프롬프트: "이 상세페이지의 구성을 분석해줘.
   - 어떤 섹션으로 구성되어 있는지
   - 각 섹션의 역할
   - 강점과 약점
   - 우리가 차별화할 수 있는 포인트"
```

**제품 카피 생성**:

```
[AI Studio에서]
프롬프트: "다음 제품의 상세페이지 카피를 작성해줘.
제품: [제품명]
타겟: 30대 여성, 건강에 관심 많음
톤: 신뢰감 있으면서 친근한
필요 섹션: 헤드카피, 제품 특장점 3가지, 사용 방법, 고객 후기 요약, CTA"
```

**앱 프로토타이핑**:

```
AI Studio에서 "앱 만들기" 기능으로
React + Tailwind 코드를 즉시 생성 가능.
간단한 상세페이지 프로토타입을 빠르게 확인할 때 유용.
```

#### NotebookLM — 리뷰 분석 & 셀링포인트 추출

```
[NotebookLM에서]
1. 고객 리뷰 파일(CSV, PDF, 텍스트) 업로드
2. 프롬프트: "이 리뷰들에서 가장 많이 언급되는
   긍정적 키워드와 부정적 키워드를 추출해줘.
   상세페이지에 넣을 셀링포인트 5가지를 제안해줘."
3. 결과를 Claude Code에 붙여넣어 HTML에 반영
```

> **참고**: NotebookLM은 문서 분석 도구입니다. 이미지 편집/배경제거는 Gemini 앱에서 하세요. Gemini 앱에서 이미지를 업로드하고 "배경을 하얀색으로 바꿔줘"와 같이 요청하면 됩니다.

---

## 3. 레이아웃 제작

### 3.1 Frontend Design Skill (핵심)

Anthropic 공식 스킬로, Claude Code에서 고퀄리티 HTML/CSS 페이지를 직접 생성합니다.

**설치**:

```bash
# 플러그인으로 설치 (권장)
claude plugin add @anthropics/frontend-design

# 또는 스킬로 설치
npx skills add anthropics/claude-code/frontend-design
```

**상세페이지 생성 프롬프트 예시**:

```
/frontend-design

네이버 스마트스토어용 제품 상세페이지 HTML을 만들어줘.

제품: 유기농 꿀 (500g)
가격: 29,900원
타겟: 건강에 관심 많은 30~50대

규격:
- 폭 860px 고정 (반응형 아님)
- 배경 흰색
- 이미지는 placeholder로 (나중에 교체)

섹션 구성:
1. 헤드 배너 (제품명 + 핵심 카피 + 제품 이미지)
2. 신뢰 배지 (유기농 인증, HACCP, 무료배송 아이콘)
3. 제품 특장점 3가지 (아이콘 + 설명)
4. 상세 스펙 테이블
5. 사용 방법 (step by step)
6. 고객 리뷰 요약 (별점 + 한줄평)
7. 구매 안내 (배송, 교환, 환불)
8. CTA 배너 ("지금 구매하기")

스타일:
- 폰트: Pretendard
- 메인 컬러: #D4A574 (꿀색)
- 깔끔하고 신뢰감 있는 디자인
- 섹션 간 충분한 여백
```

### 3.2 플랫폼별 HTML 템플릿 패턴

**네이버 스마트스토어 (860px)**:

```html
<!-- 네이버 스마트스토어 상세페이지 기본 구조 -->
<div style="width: 860px; margin: 0 auto; font-family: 'Pretendard', sans-serif;">

  <!-- 1. 헤드 배너 -->
  <div style="position: relative; width: 860px;">
    <img src="head-banner.jpg" alt="제품 헤드 배너" style="width: 100%;">
  </div>

  <!-- 2. 신뢰 배지 -->
  <div style="display: flex; justify-content: center; gap: 40px; padding: 30px 0; background: #f8f8f8;">
    <div style="text-align: center;">
      <img src="badge-organic.png" alt="유기농 인증" style="width: 60px;">
      <p style="margin-top: 8px; font-size: 13px; color: #666;">유기농 인증</p>
    </div>
    <!-- 배지 반복 -->
  </div>

  <!-- 3. 특장점 -->
  <div style="padding: 60px 40px;">
    <h2 style="text-align: center; font-size: 28px; margin-bottom: 40px;">
      왜 우리 꿀이 다를까요?
    </h2>
    <!-- 특장점 항목 -->
  </div>

  <!-- 4. 스펙 테이블 -->
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <th style="width: 200px; padding: 12px; background: #f5f5f5; border: 1px solid #ddd;">제품명</th>
      <td style="padding: 12px; border: 1px solid #ddd;">유기농 아카시아 꿀</td>
    </tr>
    <!-- 스펙 행 반복 -->
  </table>

  <!-- 5~8. 추가 섹션 -->
</div>
```

**쿠팡 (780px)**:

```html
<!-- 쿠팡 상세페이지 기본 구조 -->
<div style="width: 780px; margin: 0 auto; font-family: 'Noto Sans KR', sans-serif;">
  <!-- 쿠팡은 인라인 스타일만 허용, 외부 CSS 불가 -->
  <!-- 이미지 중심 + 최소한의 HTML 텍스트 -->
  <img src="section1-hero.jpg" style="width: 100%;" alt="제품 소개">
  <img src="section2-features.jpg" style="width: 100%;" alt="제품 특장점">
  <img src="section3-spec.jpg" style="width: 100%;" alt="상세 스펙">
  <!-- 각 섹션을 이미지로 만들어 순서대로 배치 -->
</div>
```

> **핵심**: 쿠팡은 대부분의 CSS를 필터링합니다. **이미지 위주**로 제작하고, HTML은 이미지 나열 용도로만 사용하는 것이 안전합니다.

### 3.3 섹션 구성 패턴 (업종 공통)

효과적인 한국 상세페이지의 검증된 섹션 순서:

```
1. 헤드 배너 ────── 제품 이미지 + 핵심 카피 (3초 내 관심 유도)
2. 신뢰 배지 ────── 인증마크, 수상 이력, 판매 실적
3. 고객 고민 ────── "이런 고민 있으셨죠?" 공감 유도
4. 솔루션 제시 ──── "이 제품이 해결해드립니다" 특장점 3~5개
5. 상세 설명 ────── 성분, 제조 과정, 기술 설명
6. 사용 방법 ────── Step-by-step 가이드
7. 비교 우위 ────── 경쟁사 대비 차별점 (표 형태)
8. 후기/소셜프루프 ── 실제 고객 리뷰, 체험단 후기
9. 스펙 테이블 ──── 공식 제품 사양
10. 배송/교환/환불 ── 구매 안내
11. CTA ──────────── "지금 구매하기" 최종 유도
```

### 3.4 보조 디자인 도구

#### Pencil.dev (MCP)

무한 캔버스에서 레이아웃을 시각적으로 잡고, Claude Code가 코드로 변환합니다.

```bash
# Pencil MCP 설치 (Pencil.dev 앱 설치 후 자동 설정)
# MCP 서버가 자동으로 등록됨

# 워크플로우:
# 1. Pencil.dev에서 상세페이지 레이아웃 러프 스케치
# 2. Claude Code에서 "Pencil 캔버스의 디자인을 HTML로 변환해줘"
# 3. Frontend Design Skill이 코드 생성
```

#### Google Stitch (MCP)

AI로 UI 디자인을 생성하는 Google 도구입니다. 앱 UI에 특화되어 있어 상세페이지 직접 제작보다는 **레이아웃 아이디어 참고용**으로 활용합니다.

```bash
# Stitch MCP 설치
claude mcp add stitch npx stitch-mcp@latest

# Stitch Skills 설치
npx skills add google-labs-code/stitch-skills
```

---

## 4. 이미지 변환 및 업로드

### 4.1 Playwright MCP — HTML → 긴 스크린샷

Claude Code에서 생성한 HTML 상세페이지를 이미지로 변환합니다.

**Playwright MCP 설치**:

```bash
claude mcp add playwright npx @playwright/mcp@latest
```

**HTML → 이미지 변환 프롬프트**:

```
Playwright를 사용해서 product-page.html을 전체 페이지 스크린샷으로 캡처해줘.
- 뷰포트 폭: 860px (네이버 규격)
- 전체 페이지 캡처 (스크롤 전체)
- PNG 형식으로 저장
- 저장 경로: ./output/product-page-full.png
```

**스크린샷 자동화 스크립트**:

```javascript
// capture-page.js
const { chromium } = require('playwright');

async function captureProductPage(htmlPath, outputPath, width = 860) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setViewportSize({ width, height: 800 });
  await page.goto(`file://${htmlPath}`);

  // 전체 페이지 스크린샷
  await page.screenshot({
    path: outputPath,
    fullPage: true,
    type: 'png'
  });

  await browser.close();
  console.log(`캡처 완료: ${outputPath}`);
}

// 네이버용 (860px)
captureProductPage('./product-page.html', './output/naver-860.png', 860);
// 쿠팡용 (780px)
captureProductPage('./product-page.html', './output/coupang-780.png', 780);
```

### 4.2 이미지 분할

긴 이미지를 플랫폼 제한에 맞게 분할합니다:

```bash
# ImageMagick으로 분할 (2000px 단위)
magick ./output/product-page-full.png -crop 860x2000 ./output/section-%d.png

# 또는 Claude Code에서 Sharp 라이브러리 사용
```

```javascript
// split-image.js
const sharp = require('sharp');

async function splitImage(inputPath, outputDir, height = 2000) {
  const metadata = await sharp(inputPath).metadata();
  const totalHeight = metadata.height;
  const width = metadata.width;

  let index = 1;
  for (let top = 0; top < totalHeight; top += height) {
    const sliceHeight = Math.min(height, totalHeight - top);
    await sharp(inputPath)
      .extract({ left: 0, top, width, height: sliceHeight })
      .toFile(`${outputDir}/section-${index}.png`);
    index++;
  }
  console.log(`${index - 1}개 이미지로 분할 완료`);
}

splitImage('./output/product-page-full.png', './output/sections');
```

### 4.3 이미지 최적화

```bash
# PNG → JPG 변환 (용량 절감)
magick ./output/section-1.png -quality 85 ./output/section-1.jpg

# 또는 Sharp 사용
```

```javascript
// optimize.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeImages(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));

  for (const file of files) {
    const input = path.join(dir, file);
    const output = path.join(dir, file.replace('.png', '.jpg'));

    const result = await sharp(input)
      .jpeg({ quality: 85, progressive: true })
      .toFile(output);

    const origSize = fs.statSync(input).size;
    console.log(`${file}: ${(origSize/1024).toFixed(0)}KB → ${(result.size/1024).toFixed(0)}KB`);
  }
}

optimizeImages('./output/sections');
```

### 4.4 업로드 팁

| 플랫폼 | 팁 |
|--------|-----|
| 네이버 | HTML 에디터에서 이미지 순서대로 삽입. `<img>` 태그 직접 입력도 가능 |
| 쿠팡 | "상품 상세 설명" 에디터에서 이미지 업로드. HTML 소스 모드 활용 |
| 11번가 | HTML 에디터 지원이 좋은 편. CSS 일부 허용 |
| 공통 | 이미지 ALT 텍스트에 키워드 삽입 (SEO 효과) |

---

## 5. 자동화

### 5.1 단일 상품 워크플로우 (Claude Code)

```bash
# 1. 프로젝트 초기화
mkdir product-pages && cd product-pages
claude

# 2. Claude Code에서 전체 프로세스 실행
```

```
[Claude Code 프롬프트]

제품 상세페이지를 만들어줘.

제품 정보:
- 이름: 유기농 아카시아 꿀 500g
- 가격: 29,900원
- 특장점: 100% 국내산, 유기농 인증, 무첨가
- 타겟: 건강 관심 30~50대

작업 순서:
1. /frontend-design 으로 네이버 스마트스토어용 HTML 생성 (860px 고정폭)
2. Playwright로 전체 페이지 스크린샷 캡처
3. 2000px 단위로 이미지 분할
4. JPG로 변환 및 최적화 (장당 3MB 이하)

이미지 placeholder는 "[헤드배너]", "[특장점1]" 형태로 표시해줘.
나중에 나노바나나로 만든 이미지로 교체할 거야.
```

### 5.2 대량 상품 자동화 (템플릿 + 데이터)

```javascript
// bulk-generate.js
const fs = require('fs');
const path = require('path');

// 제품 데이터 (CSV에서 읽어올 수도 있음)
const products = [
  { name: '유기농 꿀 500g', price: '29,900', category: 'food', features: ['100% 국내산', '유기농 인증', '무첨가'] },
  { name: '프로폴리스 스프레이', price: '19,800', category: 'health', features: ['브라질산 프로폴리스', '휴대 간편', '무알코올'] },
  // ... 더 많은 제품
];

// HTML 템플릿
function generateHTML(product) {
  return `
<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><style>
  body { margin: 0; font-family: 'Pretendard', sans-serif; }
  .container { width: 860px; margin: 0 auto; }
  .hero { background: linear-gradient(135deg, #f5f0e8, #fff); padding: 60px 40px; text-align: center; }
  .hero h1 { font-size: 32px; color: #333; margin-bottom: 12px; }
  .hero .price { font-size: 36px; font-weight: 700; color: #e74c3c; }
  .features { padding: 60px 40px; }
  .feature-item { display: flex; align-items: center; margin-bottom: 30px; }
  .feature-icon { width: 60px; height: 60px; background: #f0f0f0; border-radius: 50%; margin-right: 20px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
  .spec-table { width: 100%; border-collapse: collapse; }
  .spec-table th, .spec-table td { padding: 12px 16px; border: 1px solid #eee; font-size: 14px; }
  .spec-table th { background: #f8f8f8; width: 200px; text-align: left; }
  .cta { background: #e74c3c; color: white; text-align: center; padding: 40px; font-size: 24px; font-weight: 700; }
</style></head>
<body>
  <div class="container">
    <div class="hero">
      <p style="color: #888; font-size: 14px;">[ 제품 이미지 영역 ]</p>
      <h1>${product.name}</h1>
      <p class="price">${product.price}원</p>
    </div>
    <div class="features">
      <h2 style="text-align: center; margin-bottom: 40px;">주요 특장점</h2>
      ${product.features.map((f, i) => `
        <div class="feature-item">
          <div class="feature-icon">${i + 1}</div>
          <div><strong>${f}</strong></div>
        </div>
      `).join('')}
    </div>
    <div class="cta">지금 구매하기</div>
  </div>
</body>
</html>`;
}

// 벌크 생성
products.forEach((product, index) => {
  const html = generateHTML(product);
  const filename = `product-${index + 1}-${product.category}.html`;
  fs.writeFileSync(path.join('./output', filename), html);
  console.log(`생성 완료: ${filename}`);
});
```

### 5.3 Gemini MCP 벌크 이미지 생성

```
[Claude Code 프롬프트]

Gemini MCP를 사용해서 다음 제품들의 이미지를 벌크 생성해줘.

제품 목록: products.csv (컬럼: name, category, color, background)

각 제품마다 3장씩 생성:
1. 제품컷 (흰 배경, 정면 45도)
2. 라이프스타일컷 (사용 장면)
3. 배너 (가격 텍스트 포함)

output/images/ 폴더에 {제품번호}-{타입}.png로 저장해줘.
```

> **주의**: Gemini API 무료 쿼터(일 500회)를 초과하면 과금됩니다. 대량 생성 시 쿼터를 먼저 확인하세요.

---

## 6. 실전 예시

### 6.1 식품/건강식품

```
[프롬프트 — 나노바나나]
"한국 온라인 쇼핑몰 상세페이지에 사용할 유기농 꿀 제품 사진.
유리병에 담긴 황금빛 꿀, 나무 꿀 디퍼에서 꿀이 흘러내리는 장면.
배경은 자연스러운 나무 테이블, 뒤에 벌집과 꽃이 보이는 따뜻한 분위기.
고급스럽고 자연친화적인 느낌. 860x500 비율."
```

```
[프롬프트 — Claude Code]
/frontend-design
식품 상세페이지를 만들어줘.
제품: 유기농 아카시아 꿀 500g / 29,900원
스타일: 자연 친화적, 따뜻한 색상 (#D4A574 메인)
섹션: 헤드배너 → 유기농 인증 배지 → "왜 우리 꿀인가?" 3가지 →
      원산지 소개 → 섭취 방법 → 고객 후기 → 스펙 → 구매 안내
폭: 860px 고정
```

### 6.2 전자제품

```
[프롬프트 — 나노바나나]
"무선 블루투스 이어폰 제품 사진.
매트 블랙 이어폰이 충전 케이스 위에 놓여 있는 모습.
배경은 진한 다크 그레이, 은은한 빛 반사.
프리미엄 전자제품 촬영 스타일. 깔끔하고 미니멀."
```

```
[프롬프트 — Claude Code]
/frontend-design
전자제품 상세페이지를 만들어줘.
제품: 무선 블루투스 이어폰 / 89,000원
스타일: 다크 테마, 프리미엄, 미니멀 (#1a1a2e 배경, #e94560 포인트)
섹션: 시네마틱 헤드 → 핵심 스펙 3가지 (아이콘) →
      "일반 이어폰 vs 우리 이어폰" 비교표 → 기술 설명 →
      착용 장면 → 패키지 구성 → 스펙 테이블 → 구매 안내
폭: 860px 고정
```

### 6.3 패션/뷰티

```
[프롬프트 — Flair.ai 또는 SellerPic]
평면 사진(flat-lay)을 업로드 → AI 모델 착용컷 자동 생성
→ 다양한 체형, 피부톤의 모델 선택 가능

[프롬프트 — Claude Code]
/frontend-design
패션 상세페이지를 만들어줘.
제품: 오버사이즈 린넨 셔츠 / 45,000원
스타일: 깔끔하고 세련된, 화이트 기반 (#f5f5f5 배경)
섹션: 모델 착용 메인 → 컬러 옵션 → 소재 클로즈업 →
      사이즈 가이드 (표) → 세탁 방법 → 코디 제안 →
      후기 → 교환/환불 안내
폭: 860px 고정
```

---

## 7. 트러블슈팅 및 참고자료

### 7.1 자주 묻는 질문

**Q: 나노바나나로 만든 이미지를 상업적으로 사용해도 되나요?**

Gemini로 생성한 이미지는 Google의 이용약관에 따라 상업적 사용이 가능합니다. 단, 생성된 이미지에 SynthID 워터마크가 포함되며, 이는 육안으로는 보이지 않습니다.

**Q: 플랫폼에서 HTML이 깨지면 어떻게 하나요?**

각 플랫폼이 허용하는 HTML 태그와 CSS 속성이 다릅니다. 안전한 방법은:
1. HTML 상세페이지를 이미지로 변환 (Playwright 스크린샷)
2. 이미지를 순서대로 업로드
3. 이미지 사이에 최소한의 HTML만 사용

**Q: 이미지 용량이 너무 크면?**

- PNG → JPG 변환 (50~70% 용량 절감)
- JPG quality 80~85가 최적 (품질 대비 용량)
- 긴 이미지를 2000px 단위로 분할
- WebP는 일부 플랫폼에서 미지원이므로 JPG가 안전

**Q: Gemini MCP 설정이 안 될 때?**

```bash
# API 키 확인
echo $GEMINI_API_KEY

# MCP 서버 목록 확인
claude mcp list

# 재설치
claude mcp remove gemini
claude mcp add gemini npx @anthropic-ai/gemini-mcp@latest
```

**Q: 한글 텍스트가 이미지에서 깨지면?**

나노바나나 2는 한글 렌더링이 대폭 개선되었지만, 간혹 깨질 수 있습니다:
- 프롬프트에 "한글 텍스트를 정확하게 렌더링해줘" 추가
- 텍스트가 많은 경우 HTML로 만들고 Playwright 스크린샷이 더 확실함

### 7.2 도구별 라이선스 요약

| 도구 | 라이선스 | 비용 |
|------|---------|------|
| 나노바나나 2 (Gemini 앱) | Google ToS | 무료 |
| 나노바나나 2 (API) | Google ToS | $0.067/1K 해상도 |
| Flair.ai | 상용 | 무료 5장, Pro $8/월 |
| Photoroom | 상용 | 무료~$9.99/월 |
| SellerPic | 상용 | 유료 |
| Draph Art | 상용 | 유료 |
| Claid.ai | 상용 | 유료 |
| Google AI Studio | Google ToS | 무료 |
| NotebookLM | Google ToS | 무료 |
| Pencil.dev | 무료 | 무료 |
| Google Stitch | Google ToS | 무료 |
| Playwright | Apache 2.0 | 무료 |
| Frontend Design Skill | Anthropic | Claude Code 구독 포함 |

### 7.3 참고 자료

| 자료 | 출처 |
|------|------|
| 나노바나나 2 공식 발표 | blog.google |
| 나노바나나 총정리 가이드 | carat.im |
| 나노바나나 × n8n 자동화 | irumhahn.com |
| 나노바나나 콘텐츠 자동화 KIT | fastcampus.co.kr |
| Gemini API 이미지 생성 문서 | ai.google.dev |
| BananaBatch 벌크 생성 | bananabatch.com |
| Flair.ai 공식 | flair.ai |
| Photoroom AI 도구 | photoroom.com |
| Claude Code Frontend Design | github.com/anthropics |
| Pencil.dev + Claude Code | atalupadhyay.wordpress.com |
| Stitch MCP | github.com/davideast/stitch-mcp |
| Google AI Studio 이커머스 가이드 | medium.com/@seanku44 |
| Playwright MCP 스크린샷 | shipyard.build |
| AI Product Photo Tools 2026 | wearview.co |
| Blender MCP 가이드 | github.com/poly-mcp |

### 7.4 Gemini 생태계 활용 요약

```
Google 무료 도구 생태계 (모두 무료)
├── Gemini 앱 ──────── 나노바나나 이미지 생성 + 편집 + 배경 조정
├── Google AI Studio ── 카피 생성 + 경쟁사 분석 + 앱 프로토타이핑
├── NotebookLM ──────── 리뷰 분석 + 셀링포인트 추출 + 콘텐츠 생성
├── Stitch ──────────── UI 디자인 + HTML/CSS 코드 생성
└── Mixboard ─────────── 무드보드 + 컨셉 시각화 + 아이디어 탐색

Claude Code에서 연동 가능:
├── Gemini MCP ──────── 이미지 생성 API 직접 호출
├── Stitch MCP ──────── UI 디자인 자동 생성
└── Stitch Skills ───── 프롬프트 최적화, 빌드 루프
```
