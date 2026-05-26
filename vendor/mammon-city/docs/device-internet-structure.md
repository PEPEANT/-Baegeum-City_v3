# 디바이스/가상 인터넷 구조
결론: 폰과 PC는 `기기 셸`, 앱은 `기능 모듈`, 인터넷은 `공용 서비스`, 경제는 `전역 시스템`으로 분리해야 이후 확장이 덜 꼬인다.

## 목적

- 현재 폰 앱은 버튼을 누르면 바로 결과가 나는 구조지만, 앞으로는 실제 앱 화면 안에서 탐색과 선택이 일어나게 된다.
- 같은 앱이 폰과 PC 양쪽에서 열릴 수 있으므로, `폰 전용 로직`과 `앱 자체 로직`을 분리해야 한다.
- 가상 인터넷이 생기면 메일, 광고, 중고장터, 주식, 주문, 알림이 서로 연결되므로 공용 서비스 레이어가 먼저 필요하다.
- 경제 시스템은 특정 앱 안에 묻히면 안 되고, 모든 디바이스와 앱이 공유하는 전역 규칙으로 관리해야 한다.

## 현재 구조에서 먼저 보이는 문제

- 현재 폰 관련 화면 조립이 `js/ui.js`에 크게 모여 있다.
- 폰 사용 흐름과 상태 변경이 `js/logic.js`에 함께 들어 있다.
- `dayOffers`, `interviewResult`, `nextDayShift` 같은 앱 성격 데이터가 루트 상태에 직접 놓여 있다.
- 이 상태로 PC 인터넷까지 붙이면 `기기 UI`, `앱 규칙`, `경제 계산`, `스토리 이벤트`가 한 파일 안에서 섞일 가능성이 크다.

## 권장 폴더 구조

아래 구조를 기준으로 천천히 옮기는 편이 좋다.

```text
assets/
  devices/
    phone/
    pc/
  internet/
    sites/
      jobs/
      bank/
      market/
      stocks/
  apps/
    shared/
    jobs/
    stocks/
    delivery/

docs/
  phone-system.md
  save-system.md
  device-internet-structure.md
  economy-system.md              # future
  pc-system.md                   # future

js/
  core/
    boot/
      init-game.js
    state/
      game-state.js
      save-state.js
    runtime/
      game-loop.js
      scene-router.js
      time-service.js

  systems/
    economy/
      economy-engine.js
      wallet-service.js
      inventory-service.js
      pricing-service.js
      billing-service.js
    internet/
      internet-engine.js
      service-registry.js
      notification-service.js
      message-service.js
      feed-service.js
    jobs/
      job-engine.js
      interview-service.js
      shift-scheduler.js

  devices/
    shared/
      device-session.js
      device-route-helpers.js
    phone/
      phone-shell-ui.js
      phone-router.js
      phone-app-registry.js
      phone-session.js
    pc/
      pc-shell-ui.js
      pc-router.js
      pc-app-registry.js
      pc-session.js

  apps/
    jobs/
      jobs-manifest.js
      jobs-routes.js
      jobs-app-ui.js
      jobs-app-actions.js
      jobs-app-state.js
    stocks/
      stocks-manifest.js
      stocks-routes.js
      stocks-app-ui.js
      stocks-app-actions.js
      stocks-app-state.js
    delivery/
      delivery-manifest.js
      delivery-routes.js
      delivery-app-ui.js
      delivery-app-actions.js
      delivery-app-state.js

  data/
    days/
      day01/
      day02/
    apps/
      jobs/
        jobs-copy.js
        jobs-layout-data.js
      stocks/
      delivery/
    internet/
      sites/
        jobs-site-data.js
        market-site-data.js
        bank-site-data.js
      feeds/
        ads-feed-data.js
        news-feed-data.js
    economy/
      items/
      markets/
      subscriptions/
      price-tables/
```

## 폴더별 책임

### `js/devices/`

- 폰/PC의 외형, 열기/닫기, 뒤로가기, 라우팅 히스토리, 현재 열린 앱 상태를 관리한다.
- 여기에는 `기기 프레임`과 `기기 네비게이션`만 둔다.
- 경제 계산이나 앱 고유 규칙은 넣지 않는다.

### `js/apps/`

- 앱 화면 구성, 앱 내부 탭 이동, 앱 버튼 액션을 관리한다.
- 같은 `jobs` 앱이라도 폰과 PC에서 보이는 레이아웃이 다를 수는 있지만, 핵심 액션은 같은 모듈을 공유하는 편이 좋다.
- 앱은 `manifest`를 통해 어느 기기에서 실행 가능한지 등록한다.

### `js/systems/`

- 경제, 인터넷, 구인/면접/출근 같은 게임 전역 규칙을 담당한다.
- 어떤 앱에서 실행하든 결과가 같아야 하는 규칙은 여기로 모은다.
- 예를 들어 급여 지급, 수수료 차감, 예약 근무 생성, 주식 가격 변동은 앱 파일이 아니라 시스템 파일에 둔다.

### `js/data/`

- 정적 데이터, 카피, 레이아웃 정의, 사이트 목록, 피드 샘플을 둔다.
- 데이터는 읽기 전용 기준으로 관리하고, 실제 상태 변화는 `state`나 `systems`에서 처리한다.
- day 데이터는 계속 `js/data/days/`에 두되, 앱 UI 정의까지 day 폴더에 넣지는 않는다.

## 의존성 규칙

구조가 오래 버티려면 아래 규칙을 미리 정해두는 게 좋다.

1. `devices/*`는 `apps/*`를 직접 import 하지 말고 `app-registry`를 통해 연다.
2. `apps/*`는 `systems/*`를 호출할 수 있지만, 다른 앱의 UI 파일을 직접 호출하지 않는다.
3. `systems/*`는 `data/*`를 읽을 수 있지만, `devices/*`를 알면 안 된다.
4. `data/*`는 순수 데이터만 두고 실행 로직을 넣지 않는다.
5. day 이벤트는 `앱 화면`을 직접 조작하지 말고, `systems`에 필요한 입력만 넘긴다.

## 상태 구조 권장안

현재 루트 상태에 직접 놓인 값을 앞으로는 도메인별로 나누는 편이 좋다.

```text
state = {
  player: { ... },
  world: { ... },
  devices: {
    phone: {
      unlocked: true,
      minimized: false,
      route: "home",
      history: [],
      notifications: []
    },
    pc: {
      unlocked: false,
      powerOn: false,
      route: "desktop",
      history: [],
      tabs: []
    }
  },
  apps: {
    jobs: {
      dailyOffers: [],
      selectedOfferId: null,
      lastInterviewResult: null
    },
    stocks: {},
    delivery: {}
  },
  internet: {
    accounts: {},
    messages: [],
    feeds: {},
    bookmarks: []
  },
  economy: {
    cash: 0,
    bank: 0,
    debt: 0,
    inventory: [],
    subscriptions: [],
    listings: [],
    orders: []
  }
}
```

### 현재 루트 상태에서 옮기기 좋은 항목

- `phoneMinimized` -> `state.devices.phone.minimized`
- `phoneView` -> `state.devices.phone.route`
- `phoneStageExpanded` -> `state.devices.phone.stageExpanded`
- `dayOffers` -> `state.apps.jobs.dailyOffers`
- `interviewResult` -> `state.apps.jobs.lastInterviewResult`
- `nextDayShift` -> `state.systems.jobs.scheduledShift` 또는 `state.jobs.scheduledShift`

## 앱 등록 방식 권장안

새 앱이 늘어날수록 하드코딩 분기보다 레지스트리 방식이 낫다.

```text
APP_REGISTRY = {
  jobs: {
    id: "jobs",
    label: "공고",
    icon: "💼",
    devices: ["phone", "pc"],
    openRoute: "jobs/home",
    renderer: renderJobsApp,
    actions: jobsAppActions
  }
}
```

이 방식으로 두면:

- 폰 홈 아이콘 구성
- PC 바탕화면 아이콘 구성
- 앱 실행 가능 기기 확인
- 앱별 라우트 시작점

을 같은 정의에서 재사용할 수 있다.

## 경제 시스템을 분리해야 하는 이유

경제 규칙을 앱 안에 넣으면 나중에 중고장터, 은행, 배달, 알바, 쇼핑이 서로 연결될 때 중복 계산이 생긴다.

권장 기준은 이렇다.

- 앱은 `무슨 행동을 시도했는지`만 전달한다.
- 경제 시스템은 `돈이 얼마 빠지고, 무엇이 생기고, 어떤 예약이 생성되는지`를 계산한다.
- 인터넷 시스템은 `메시지, 피드, 알림, 주문 상태`를 갱신한다.

예시:

- 구인 앱 지원 버튼 -> `jobs/interview-service.js`
- 면접 합격 -> `jobs/shift-scheduler.js`
- 배달 주문 -> `economy/billing-service.js` + `internet/notification-service.js`
- 중고거래 등록 -> `economy/inventory-service.js` + `internet/feed-service.js`

## 구현 순서 권장안

한 번에 다 갈아엎기보다 아래 순서가 안전하다.

1. 폰 셸 관련 코드를 `js/devices/phone/` 기준으로 분리한다.
2. 현재 폰 앱 4개를 `app-registry` 기반으로 바꾼다.
3. `jobs` 앱부터 실제 앱 화면 구조로 이동시킨다.
4. `dayOffers`, `interviewResult`, `nextDayShift`를 앱/시스템 상태로 옮긴다.
5. 같은 규칙으로 `pc/` 셸을 추가한다.
6. 이후 `internet/`과 `economy/`를 붙여 가상 인터넷을 확장한다.

## 주의할 점

- 폰 UI 파일 안에서 돈 계산을 하지 않는다.
- PC를 추가할 때 앱을 복붙해서 `phone-jobs-app.js`, `pc-jobs-app.js`처럼 갈라놓지 않는다.
- day 데이터는 계속 day 폴더에 두되, 인터넷 사이트 구조 정의까지 day 안으로 넣지 않는다.
- 저장 데이터는 `기기 상태`, `앱 상태`, `경제 상태`, `인터넷 상태`로 나눠야 세이브 호환성이 좋아진다.

## 추천 다음 문서

- `phone-system.md`
- `save-system.md`
- `economy-system.md` 작성
- `pc-system.md` 작성
