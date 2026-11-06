# CLAUDE.md — pricerecall.com (사이트 repo)

「얼마였지?」(PriceRecall) iOS 앱의 랜딩 + 블로그 + 릴리즈노트 + 정책 페이지.

앱 코드는 `~/dev/price-recal/` 에 있다. 두 repo 는 분리.

## AI 지침 진입점

- Codex의 `AGENTS.md`는 이 파일을 가리키는 상대 심볼릭 링크다. 사이트 규칙은 이 원문 한 곳에서 관리한다.
- 앱 출시와 연결된 작업은 앱의 [AGENTS.md](/Users/eee/dev/price-recal/AGENTS.md)와 필요한 제출·게시 근거도 실제로 읽는다. 사이트 지침을 앱 코드·심사 제출의 승인으로 확대하지 않는다.
- 공통 문서와 아래 도구별 메모리는 저장소 밖의 의존 자료다. 링크만으로 본문 전달을 가정하지 않고, 필요한 파일이 없으면 누락을 알린다.

## Clone 위치 / 도메인 / 호스팅

- Repo: `~/dev/pricerecall.com/`
- 원격: `git@github.com:soulwawa/pricerecall.com.git` (main 브랜치)
- 도메인: `https://pricerecall.com` (CNAME 파일로 설정됨)
- 호스팅: GitHub Pages — `main` 브랜치 push 시 자동 배포
- 배포 확인: `git push` 후 약 1–2분 뒤 사이트 반영

## 권한 규칙 (앱 repo 와 다름)

- **사이트 수정은 autonomous OK** — 앱 코드 수정 승인 룰의 예외
- 글/스타일/레이아웃 변경은 사용자 승인 없이 진행 가능
- 단, 출시 연계 게시물은 아래 게시 전 검토 승인을 먼저 받는다. 이는 앱의 심사 제출 승인과 별개이며 Apple 승인 후 앱 자동 출시에는 추가 게이트를 만들지 않는다.
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
  5. 푸터: `---` + 스토어 링크 + 일반 출시의 블로그 글 링크 (핫픽스/명시 생략 예외에서는 없는 블로그 링크를 만들지 않음)
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

### 출시 유형별 게시물
- 일반 출시 = 릴리즈노트 1편 + 블로그 1편. 핫픽스 = 릴리즈노트 1편만, 별도 홍보 블로그 없음.
- 일반 출시의 릴리즈노트 푸터에서 블로그 글 링크
- 같은 날짜로 발행
- 사용자가 명시한 버전별 생략 예외는 기록·보존한다.

## 글 작성 후 절차

1. `_posts/` 에 마크다운 추가
2. (선택) 로컬 프리뷰: `bundle exec jekyll serve`
3. [공통 절차](/Users/eee/dev/app-growth/playbooks/release-review.md)에 따라 완성 초안·앱/버전/핫픽스 여부·언어·목표 URL·원고 식별·출시 근거·기존 게시 권한을 현행 출시 검토 채팅 `01a125cc-4995-7340-9489-e13906287929` (local)에 전달한다. [2026-10-10 인계](/Users/eee/dev/app-growth/research/release-review-session-handoff-2026-10-10.md)에 따라 새 요청·결과 수신처만 전환하며 과거 승인 원본·발행자 ID·해시 및 철회/실패 기록은 보존한다. 이관만으로 재승인·재제출하지 않는다. 기존 자료를 재사용하며 검토 담당은 출시 사실·사용자 가치·기본 SEO·내부/설치 링크를 확인한다.
4. 2026-10-09 사용자 위임에 따라 출시 검토 담당의 실제 `출시 게시물 검토 승인` 회신에서 앱·버전·글·목표 URL·최종 원고와 게시 승인 포함 여부를 확인·보존한다. 게시 승인이 포함되면 사용자에게 다시 묻지 않고 해당 글의 수정·사이트 검증 및 아래 commit/push·기존 배포·공개 확인까지 수행한다. 유효한 기존 사용자 직접 승인도 보존·대조하고 철회된 승인은 재사용하지 않는다. 미승인/불일치이면 게시하지 않으며, 최종본 변경 부분은 이 담당에게 다시 검토받는다. 앱 저장소 main/tag/GitHub Release, App Review 제출·스토어 변경, 가격·유료 광고·가입, DNS·권한·새 추적·사용자 데이터 업로드 및 독립 채널 운영은 이 위임에 포함하지 않는다. 이 검토 때문에 앱 자동 출시를 기다리게 하지 않는다.
5. `git add _posts/<파일> [기타 변경]`
6. `git commit -m "post(release): vX.Y.Z"` 또는 `"post(blog): <slug>"`
7. `git push origin main`
8. 해당 Pages 배포 완료와 https://pricerecall.com 의 실제 본문/링크 반영을 확인한다. 최종 URL·게시/확인 시각(시간대와 한계 포함)·최종 내용/버전·검증 결과를 출시 검토 담당에게 한 번 보고한다. 현행 성장 담당 `01a125cd-6f0f-7c63-be12-0c83c6cc3bbe` (local)은 개별 근거를 기존 일일 실행에서 인수하며, 단계별 기술 보고 자동 중계·새 예약·추적은 하지 않는다.

이 절차는 출시 연계 게시물에만 적용한다. 독립 콘텐츠·키워드·채널 전략과 성과·공통 상태표는 성장 담당이 소유하며, 이번 정책 반영으로 새 글 게시나 과거 글 소급 검토를 시작하지 않는다.

## 강제 업데이트 JSON (앱 코드 연동)

`price-recall.json` / `*-testflight.json` / `*-dev.json` — 앱이 fetch 해서 강제/권장 업데이트 트리거. 새 빌드 출시 시 `minimumVersion` 갱신 여부 검토.

## 메모리 연동

- 이 Mac의 Claude Code 참고 메모리는 [reference_site.md](/Users/eee/.claude/projects/-Users-eee-dev-price-recal/memory/reference_site.md)다. 앱 저장소 파일이 아니며 clone/push에 포함되지 않는다.
- 그 파일의 게시·권한·출시 요약은 과거 기록이다. 현행 사이트 규칙은 이 `CLAUDE.md`, 앱의 현재 재개 상태는 [docs/codex-memory.md](/Users/eee/dev/price-recal/docs/codex-memory.md)를 따른다. 과거의 일반 게시 절차로 위 출시 게시물 승인 조건을 대체하지 않는다.
- 사이트 변경 시 관련 원문과 실제 검증 기록을 갱신한다. 도구별 참고 메모리까지 일괄 갱신하지 않으며, 해당 메모리 작업을 요청받았을 때만 현행 원문과 대조한다.
