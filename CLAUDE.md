# CLAUDE.md — pricerecall.com (사이트 repo)

「얼마였지?」(PriceRecall) iOS 앱의 랜딩 + 블로그 + 릴리즈노트 + 정책 페이지.

앱 코드는 `~/dev/price-recal/` 에 있다. 두 repo 는 분리.

## Clone 위치 / 도메인 / 호스팅

- Repo: `~/dev/pricerecall.com/`
- 원격: `git@github.com:soulwawa/pricerecall.com.git` (main 브랜치)
- 도메인: `https://pricerecall.com` (CNAME 파일로 설정됨)
- 호스팅: GitHub Pages — `main` 브랜치 push 시 자동 배포
- 배포 확인: `git push` 후 약 1–2분 뒤 사이트 반영

## 권한 규칙 (앱 repo 와 다름)

- **사이트 수정은 autonomous OK** — 앱 코드 수정 승인 룰의 예외
- 글/스타일/레이아웃 변경은 사용자 승인 없이 진행 가능
- 단, 도메인/_config.yml 의 url 같은 인프라 설정은 사용자 확인 후 수정

## Jekyll 구조

```
pricerecall.com/
├── CNAME                              # pricerecall.com
├── _config.yml                        # 사이트 메타 + app_store_url 등
├── Gemfile                            # jekyll 4.3 + webrick + feed + seo-tag
├── _layouts/
│   ├── default.html                   # head + header + footer wrapping
│   ├── home.html                      # 랜딩 (hero + CTA)
│   ├── page.html                      # 정적 페이지 (privacy 등)
│   └── post.html                      # 블로그 / 릴리즈 글
├── _includes/
│   ├── head.html                      # <head>: title, meta, feed, seo
│   ├── header.html                    # 상단 nav (랜딩에선 hide_header: true)
│   └── footer.html                    # 푸터 + 정책 링크
├── _posts/
│   ├── YYYY-MM-DD-vX-Y-Z.md          # 릴리즈노트 (categories: release)
│   └── YYYY-MM-DD-<slug>.md          # 블로그 (categories: blog)
├── assets/css/main.css                # 전 페이지 공용 스타일
├── index.html                         # 랜딩 (layout: home)
├── privacy/index.html                 # 개인정보 처리방침
├── release/index.html                 # 릴리즈노트 목록 (permalink: /release/)
├── blog/index.html                    # 블로그 목록 (permalink: /blog/)
├── price-recall.json                  # 강제 업데이트 endpoint (production)
├── price-recall-testflight.json       # 강제 업데이트 endpoint (testflight)
└── price-recall-dev.json              # 강제 업데이트 endpoint (debug)
```

`permalink: /:categories/:title/` 설정 — 글의 categories(release/blog)가 URL 경로가 됨.

## 톤 가이드 (글 쓰기)

### 공통
- 한국어. 사용자 언어로 (기술 용어 최소화).
- `##` 만 사용. `###` 안 씀.
- CTA 없이 차분하게. 구독 유도 X.
- 마지막 줄은 제품 철학 한 문장으로 닫음.
- 짧은 문단. 한 호흡에 읽히게.

### 릴리즈노트 (`categories: release`)
- 파일명: `YYYY-MM-DD-vX-Y-Z.md`
- 제목: `"vX.Y.Z — <한줄 테마>"` (예: `"v1.0.0 — 시작"`)
- 구조:
  1. 한 문장 오프닝 (출시 사실)
  2. `## 새로운 기능` — 기능 짧은 설명
  3. `## 개선` — 사소한 개선
  4. `## 시스템 요구사항`
  5. 푸터: `---` + 스토어 링크 + 블로그 글 링크
- 기능 중심. 사용자가 무엇을 받았는지가 핵심.

### 블로그 (`categories: blog`)
- 파일명: `YYYY-MM-DD-<slug>.md`
- 제목: 정서적 한 줄
- 구조:
  1. 짧은 오프닝 (2문단)
  2. 헤딩 **3개 내외** — 결정의 *왜*, 철학
  3. 마무리는 잔잔한 한 줄
  4. 푸터: `---` + 스토어 링크
- 길이: **35–40줄 권장**
- 시간이 지나도 가치 있는 글로. 기능 디테일보다 결정 배경.

### 두 편 쌍 패턴
- 한 릴리스 = 릴리즈노트 1편 + 블로그 1편
- 릴리즈노트 푸터에서 블로그 글 링크
- 같은 날짜로 발행

## 글 작성 후 절차

1. `_posts/` 에 마크다운 추가
2. (선택) 로컬 프리뷰: `bundle exec jekyll serve`
3. `git add _posts/<파일> [기타 변경]`
4. `git commit -m "post(release): vX.Y.Z"` 또는 `"post(blog): <slug>"`
5. `git push origin main`
6. 1–2분 후 https://pricerecall.com 반영 확인

## 강제 업데이트 JSON (앱 코드 연동)

`price-recall.json` / `*-testflight.json` / `*-dev.json` — 앱이 fetch 해서 강제/권장 업데이트 트리거. 새 빌드 출시 시 `minimumVersion` 갱신 여부 검토.

## 메모리 연동

이 사이트 정보는 앱 repo 의 메모리 `reference_site.md` 에도 요약되어 있다. 둘 다 같이 갱신.
