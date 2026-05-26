# 배금도시 v2 가상 인터넷/폰 이식 계획

결론: `PEPEANT/MammonCity`의 시작 화면, 로그인, 스마트폰, 커뮤니티, 주식 시스템은 “게임 UI”가 아니라 배금도시 세계관의 `가상 인터넷 레이어`로 보고 단계적으로 이식한다.

## 원본 기준

- 원본 저장소: `https://github.com/PEPEANT/MammonCity`
- 확인 커밋: `91305e829b3a112a80778b7ffaef4a20b658e49b`
- 주요 원본 화면: `index.html`
- 핵심 문서: `docs/device-internet-structure.md`, `docs/phone-system.md`, `docs/account-progression-plan.md`

## 현재 이식 상태

현재는 MammonCity 원본 휴대폰 셸과 DIS 커뮤니티 디자인을 배금도시 v2 본게임 위에 올렸다.

- 원본 보관 위치: `vendor/mammon-city/`
- 원본 검증: `tools/check-mammon-city-vendor.cjs`
- 로드 중인 원본 디자인: `vendor/mammon-city/css/phone.css`
- 원본 DIS 고정 파일: `vendor/mammon-city/js/apps/dis/dis-manifest.js`, `vendor/mammon-city/js/apps/dis/dis-community-service.js`
- 배금도시 연결 CSS: `src/styles/mammon-phone-integration.css`
- 배금도시 연결 JS: `src/devices/phone/mammon-phone-shell.js`
- 본게임 연결 위치: `index.html`

현재 동작:

1. 본게임 우하단에 MammonCity 원본 휴대폰 버튼이 보인다.
2. 버튼 또는 `P` 키로 휴대폰을 열고 닫을 수 있다.
3. 휴대폰 홈에는 원본 스타일 앱 아이콘이 보인다.
4. 확장 버튼으로 원본 스타일 큰 휴대폰 스테이지를 띄울 수 있다.
5. DIS 앱을 누르면 원본 `.dis-community-*` 디자인 기반의 오프라인 게시판 미리보기가 열린다.
6. 다른 앱을 누르면 기능 실행이 아니라 “아직 연결하지 않음” 안내만 보인다.
7. MammonCity 원본에 있던 폰 옆 지도 퀵버튼은 배금도시 v2에서는 숨긴다.

현재 의도적 제한:

- DIS 커뮤니티 디자인은 연결했지만, 실제 글쓰기/댓글/Firebase 기능은 아직 연결하지 않았다.
- 주식/뉴스/은행 앱 기능도 아직 연결하지 않았다.
- 지도 앱/지도 퀵버튼은 휴대폰 안에 넣지 않는다. 월드 지도는 Iron Line 미니맵 계열로 별도 처리한다.
- 현재 본게임은 Iron Line 원본 `renderer-minimap.js`를 별도 로드해 우하단 미니맵으로 사용한다.
- Firebase 로그인이나 실시간 네트워크는 아직 연결하지 않았다.
- 원본 DIS JS 파일은 vendor에 고정했지만, 현재 본게임에서는 직접 실행하지 않는다. 배금도시 쪽 `src/devices/phone/dis-preview.js`가 원본 CSS class 구조로 오프라인 미리보기만 렌더링한다.

## 이번 시스템의 의미

배금도시 v2에는 실제 도시 월드와 별개로 “네트워크 안의 도시”가 있어야 한다.

- 도시 월드: 플레이어가 걸어 다니는 실제 맵, 건물, NPC, 실내 씬.
- 스마트폰: 플레이어가 들고 다니는 개인 단말기.
- 가상 인터넷: 앱, 커뮤니티, 뉴스, 주식, 은행, 구인, 마켓이 연결되는 정보망.
- 계정/로그인: 회차 진행, 랭킹, 커뮤니티 작성자, 나중의 온라인 저장을 잇는 메타 계층.
- 월드 시간: 뉴스/커뮤니티/주식/루머가 언제 올라오고 갱신되는지 정하는 기준.

따라서 폰은 단순 메뉴가 아니라 게임 안에서 경제와 사회를 움직이는 두 번째 월드다.
가상 인터넷 구현은 `docs/baegeum-city-v2-world-clock.md`의 `WorldClock`을 기준으로 한다.

## 바로 가져올 1차 범위

### 1. 시작 화면/로그인 껍데기

가져올 것:

- `index.html`의 `#start-screen`
- `#auth-modal`
- Google/이메일/게스트 버튼 구조
- 닉네임, 이어하기, 시작하기 버튼 구조

주의:

- Firebase 실제 로그인은 1차에서는 붙이지 않는다.
- 버튼 UI와 상태 구조만 먼저 가져온다.
- 실제 계정은 `localStorage` 기반 게스트/로컬 계정으로 시작한다.

### 2. 스마트폰 셸

가져올 것:

- `#phone-panel`
- `#phone-stage`
- `#phone-focus-dim`
- `#phone-controls`
- `js/devices/phone/phone-session.js`
- `js/devices/phone/phone-app-registry.js`
- `js/devices/phone/phone-shell-ui.js`
- `js/devices/phone/phone-router.js`

주의:

- 원본은 전역 함수 기반이다. 배금도시 v2에서는 바로 섞지 말고 vendor로 고정한 뒤 어댑터를 만든다.
- 현재 캔버스 게임 위에 DOM 폰 오버레이로 붙인다.
- `P` 키 또는 HUD 버튼으로 폰을 열고 닫는 테스트부터 한다.

### 3. 가상 인터넷 앱 최소 3종

처음부터 재미가 나는 조합은 아래 3개다.

- `dis`: 커뮤니티/게시판/검색/실시간 글 구조
- `stocks`: 휴대폰 안 증권 앱
- `news`: 주식/경제 분위기를 설명하는 뉴스 앱

가져올 후보:

- `js/apps/dis/dis-community-service.js`
- `js/apps/dis/dis-manifest.js`
- `js/apps/stocks/stocks-manifest.js`
- `js/apps/news/news-manifest.js`
- `js/apps/trading-terminal.js`
- `js/systems/economy/market-cycle-service.js`
- `js/data/economy/economy-calendar.js`

주의:

- `dis`와 `stocks`는 파일이 크다. 바로 수정하지 말고 원본 vendor + 해시 검증 후 배금도시 어댑터를 둔다.
- Firebase 실시간 커뮤니티는 1차에서는 오프라인 미리보기로 둔다.
- 주식은 실제 돈 시스템과 연결하기 전, 가격 차트/매수/매도 테스트만 먼저 한다.

## 가져오지 않을 것

1차에서 제외:

- 전체 12턴 생활 시뮬레이션
- 수저 뽑기 전체
- 방청소/알바 미니게임
- 모든 시장/은행/버스/카지노/배달 앱
- 전체 경제 밸런스
- 원본 `logic.js`, `ui.js` 통째 이식
- Firebase 실제 운영 연결

이유: 지금 배금도시 v2는 캔버스 도시 코어가 중심이다. 원본 전체를 통째로 넣으면 월드 이동, 씬 전환, 저장 구조가 한 번에 충돌한다.

## 권장 구조

```text
vendor/mammon-city/
  index.html
  css/
  js/devices/phone/
  js/apps/dis/
  js/apps/stocks/
  js/apps/news/
  js/apps/trading-terminal.js
  js/systems/economy/market-cycle-service.js
  docs/

src/meta/
  account-session.js
  start-screen.js

src/devices/phone/
  phone-overlay.js
  phone-adapter.js
  phone-state.js

src/internet/
  internet-state.js
  virtual-feed.js

src/apps/
  dis-adapter.js
  stocks-adapter.js
  news-adapter.js
```

## 상태 설계

배금도시 v2의 상태는 아래처럼 나눈다.

```js
{
  player: {},
  world: {},
  account: {
    mode: "guest",
    nickname: "",
    localId: "",
    loggedIn: false
  },
  devices: {
    phone: {
      unlocked: true,
      open: false,
      route: "home",
      stageExpanded: false,
      installedApps: ["dis", "news", "stocks"]
    }
  },
  internet: {
    community: {},
    feeds: {},
    notifications: []
  },
  economy: {
    cash: 0,
    bank: 0,
    stocks: {}
  }
}
```

규칙:

- 도시 이동 로직은 폰 앱을 직접 알면 안 된다.
- 폰 셸은 앱 내부 경제 계산을 직접 하면 안 된다.
- 앱은 `economy`와 `internet` 서비스에 요청만 보낸다.
- 로그인은 처음엔 로컬 계정으로 처리하고, 서버/Firebase는 나중에 실제 온라인 단계에서 붙인다.

## 구현 순서

### 1단계: 원본 고정

- `vendor/mammon-city/`에 원본 파일을 고정한다.
- `tools/check-mammon-city-vendor.cjs`를 만든다.
- 시작 화면, 폰 셸, DIS, 주식 관련 파일 해시를 검증한다.

완료 조건:

- 원본 파일을 수정하지 않아도 해시 검증이 통과한다.
- 어떤 파일을 가져왔는지 문서에 남는다.

현재 상태: 휴대폰 셸과 DIS 앱 원본 파일 고정은 완료. 주식/뉴스 앱 기능 파일은 다음 단계에서 따로 고정한다.

### 2단계: 시작 화면만 연결

- 현재 `index.html`의 HUD 바로 진입을 막고 시작 화면을 먼저 띄운다.
- 게스트 시작, 닉네임 저장, 이어하기 버튼만 동작시킨다.
- Firebase 버튼은 “준비 중” 또는 로컬 로그인 UI로 둔다.

완료 조건:

- 게임 시작 전 화면이 뜬다.
- 게스트로 시작하면 기존 도시맵으로 진입한다.
- 기존 `skin-lab.html`, `editor.html` 이동은 깨지지 않는다.

### 3단계: 폰 셸 테스트

- 본게임 위에 스마트폰 DOM 오버레이를 붙인다.
- 홈 화면과 앱 아이콘만 띄운다.
- 앱 라우팅은 `home`, `dis/home`, `stocks/home`, `news/home`까지만 연다.

완료 조건:

- 폰 열기/닫기/뒤로가기/홈이 된다.
- 캔버스 이동과 폰 클릭 입력이 서로 충돌하지 않는다.
- 모바일 화면에서도 폰이 화면 밖으로 밀리지 않는다.

현재 상태: 기본 열기/닫기/홈/확장/뒤로가기 테스트 완료. DIS는 원본 디자인 오프라인 미리보기까지 표시하고, 나머지 앱은 잠금 안내만 표시한다.

### 4단계: DIS 커뮤니티 오프라인 모드

- 커뮤니티 글 목록, 글 보기, 글쓰기, 댓글 UI를 연결한다.
- Firebase 없이 로컬 미리보기로 먼저 동작시킨다.
- 나중에 온라인 붙일 수 있게 작성자 ID는 `account.localId`를 사용한다.

완료 조건:

- 폰 안에서 게시판을 열 수 있다.
- 로컬 글 작성/댓글/추천 테스트가 된다.
- 게임 월드와 무관하게 앱 상태가 저장된다.

### 5단계: 주식 앱 + 가상 경제

- `stocks` 앱과 `market-cycle-service`를 연결한다.
- 처음에는 플레이어 돈과 분리된 테스트 잔고로 매수/매도한다.
- 이후 `economy.cash/bank`와 연결한다.

완료 조건:

- 폰 안에서 주식 목록과 차트가 보인다.
- 매수/매도 테스트가 된다.
- 시간 또는 턴 변화에 따라 가격이 움직인다.

### 6단계: 세계관 연결

- 뉴스가 주식 가격 변동 이유를 설명한다.
- DIS 게시글이 특정 사건, NPC, 장소, 주식 루머와 연결된다.
- 도시 건물 안 PC/인터넷 카페에서도 같은 앱 일부를 열 수 있게 확장한다.

완료 조건:

- 플레이어가 도시에서 본 사건이 폰 인터넷에 반영된다.
- 커뮤니티/뉴스/주식이 서로 영향을 주는 느낌이 난다.

## 리스크

- 원본 CSS `phone.css`가 매우 크기 때문에 전체 적용 시 현재 HUD와 충돌할 수 있다.
- 원본 앱들은 전역 `state`, `renderGame`, `firebase` 같은 이름에 기대는 부분이 많다.
- `DIS`와 `stocks` 앱은 파일이 커서 그대로 수정하면 유지보수가 어렵다.
- 로그인/Firebase를 너무 빨리 붙이면 게임 코어보다 인증 오류를 먼저 고치게 된다.
- 주식 돈을 바로 본게임 현금과 연결하면 밸런스가 망가질 수 있다.

## 내 추천

다음 실제 작업은 `MammonCity` 전체 이식이 아니라 `vendor/mammon-city` 원본 고정과 `start-screen.html` 수준의 시작 화면 테스트다. 그 다음에 폰 셸, 그 다음에 DIS/주식 순서가 안전하다.
