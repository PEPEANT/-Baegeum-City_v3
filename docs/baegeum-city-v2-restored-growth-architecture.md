# 배금도시 V2 복원판 성장 설계

결론: 현재 활성 빌드는 `baegeum-city-v2-dice.html` 단일 HTML이지만, 앞으로 AI 연인, 감정선, 도박, 보유 자산, 대화, 일러스트를 키우려면 **복원판 전용 모듈 구조**로 천천히 분리해야 한다.

## 현재 기준

현재 플레이어-facing 빌드:

```text
index.html -> singularity-race-first launcher
sub mode -> baegeum-city-v2-dice.html
```

현재 복원판 특징:

- Dice City V10.5 기반 단일 HTML이다.
- 저장 키는 `baegeum_city_v2_dice_restore`다.
- 하단 탭은 `내정보 / 휴대폰 / 부동산 / 도박 / 상점`이다.
- 뉴스, 주식, 코인선물은 휴대폰 안의 앱이다.
- 기존 `src/` 도시 코어, 맵에디터, ledger/action 구조는 보관 상태다.

이 문서는 기존 온라인-ready 도시 코어를 다시 켜는 문서가 아니다. 현재 재미가 더 살아있는 복원판을 망치지 않고 키우기 위한 문서다.

## 지금 이상한 구조

현재 구조에서 위험한 부분:

- `baegeum-city-v2-dice.html`이 1300줄을 넘는다.
- HTML, CSS, 데이터, 상태, 저장, 렌더링, 도박, 연애, 거래가 한 파일에 있다.
- `gameState` 하나가 모든 시스템의 원본이라 기능 간 경계가 약하다.
- `cash`, `luxury`, `stocks`, `futures`, `partners`가 직접 수정된다.
- 대화와 감정선은 `love` 숫자 하나에 거의 전부 묶여 있다.
- 일러스트, 캐릭터, 선물, 관계 이벤트를 위한 asset manifest가 없다.
- 새 기능을 HTML에 계속 붙이면 AI가 중복 함수, 깨진 버튼, 저장 호환성 문제를 만들 가능성이 높다.

## 목표 정체성

복원판 배금도시 V2는 당분간 아래 정체성으로 간다.

```text
돈을 벌고 잃는 경제 게임
+ AI 연인과 대화하며 감정선을 쌓는 관계 게임
+ 보유 자산과 도박 결과가 관계 대화에 영향을 주는 성장 게임
```

핵심은 “도시 전체 시뮬레이션”이 아니라 아래 연결이다.

```text
보유 상태 -> 대화 분기 -> 감정 변화 -> 이벤트/일러스트 -> 선택 욕구 -> 돈/도박/상점으로 복귀
```

## 새 폴더 원칙

복원판 전용 코드는 기존 도시 코어와 섞지 않는다.

현재 생성된 최소 골격:

```text
src/restored/README.md
src/restored/data/city-catalog.js
src/restored/state/initial-state.js
src/restored/state/save-contract.js
src/restored/state/selectors.js
src/restored/state/storage.js
tools/check-restored-growth-architecture.cjs
```

권장 구조:

```text
src/restored/
  app/
    main.js                 앱 시작, 이벤트 연결만 담당
    tabs.js                 내정보/휴대폰/부동산/도박/상점 전환
    dom.js                  DOM 조회 helper
  state/
    initial-state.js        초기 상태와 버전
    storage.js              저장/불러오기/마이그레이션
    selectors.js            총자산, 랭크, 폰 보유 같은 계산
  data/
    ranks.js
    market-catalog.js
    asset-catalog.js
    partner-catalog.js
    dialogue-catalog.js
    illustration-catalog.js
  systems/
    economy-system.js       현금/자산 증감의 단일 입구
    ownership-system.js     명품/휴대폰/부동산 보유
    market-system.js        주식/코인 가격 변화
    gambling-system.js      공통 베팅 지갑과 결과 기록
    relationship-system.js  호감도, 신뢰, 질투, 안정감
    conversation-system.js  대화 분기 선택과 결과
    emotion-system.js       감정 상태 변화와 decay
    event-system.js         관계/보유/도박 조건 이벤트
  games/
    odd-even-game.js
    blackjack-game.js
    futures-game.js
  phone/
    phone-shell.js
    news-app.js
    stock-app.js
    futures-app.js
  ui/
    my-info-view.js
    partner-list-view.js
    interaction-modal.js
    shop-view.js
    casino-view.js
    realestate-view.js
    toast-view.js
  assets/
    asset-loader.js
```

일러스트 파일은 코드와 분리한다.

```text
assets/restored/
  images/
    partners/
      college-student/
        portrait-neutral.png
        portrait-happy.png
        event-date-01.png
      office-worker/
        portrait-neutral.png
    characters/
    items/
    backgrounds/
    singularity-race/
  audio/
  source/
  manifests/
```

## 스크립트 분리 규칙

새 기능을 추가할 때 지킬 규칙:

- 새 로직은 `baegeum-city-v2-dice.html`의 inline script에 추가하지 않는다.
- 기존 파일을 바로 전부 쪼개지 않는다. 기능을 만지는 순간 그 기능부터 분리한다.
- 새 JS 파일은 250줄 이하를 목표로 한다.
- 300줄을 넘으면 다음 작업 전에 분리 후보를 문서나 TODO로 남긴다.
- 500줄을 넘기는 새 JS 파일은 만들지 않는다.
- 한 함수는 50줄 이하를 목표로 한다.
- 렌더 함수는 상태를 직접 바꾸지 않는다.
- 시스템 함수는 DOM을 직접 만지지 않는다.
- 데이터 catalog는 순수 데이터만 둔다.
- 저장 구조가 바뀌면 `saveVersion`과 migration 함수를 먼저 만든다.

현재 `npm run check`는 `tools/check-restored-growth-architecture.cjs`를 실행한다.

이 검사 스크립트가 막는 것:

- `docs/INDEX.md`에서 이 문서 링크가 빠지는 것
- `baegeum-city-v2-dice.html`이 1500줄을 넘는 것
- 뉴스/주식/코인선물이 하단 네비게이션으로 되돌아가는 것
- `src/restored/` 모듈이 250줄을 넘는 것
- 배금도시와 다이스시티 city id/role이 섞이는 것
- 다이스시티에서 casino 도메인이 빠지는 것

금지:

- `gameState.cash += ...`를 UI 버튼에서 직접 호출하는 새 코드
- `partner.love += ...`를 대화 버튼에서 직접 호출하는 새 코드
- 새 캐릭터/대화/일러스트를 HTML 문자열 안에 하드코딩
- 도박 결과가 관계 감정을 직접 만지는 코드

허용되는 흐름:

```text
UI click
-> system action
-> state patch/result
-> save
-> render
```

## 상태 모델 v2 초안

기존 `love` 하나만으로는 감정선이 너무 빨리 납작해진다. 다음 관계 확장은 최소 아래 필드를 쓴다.

```js
{
  id: "partner:college-student",
  name: "대학생",
  archetype: "romantic",
  stage: "acquaintance",
  affection: 40,
  trust: 20,
  tension: 0,
  jealousy: 0,
  comfort: 10,
  lastTalkAt: 0,
  memory: [
    { type: "gift_received", itemId: "ring", value: 5000 },
    { type: "casino_loss_seen", amount: 3000 }
  ],
  flags: {
    isLover: false,
    isSpouse: false,
    firstDateSeen: false
  }
}
```

필드 의미:

- `affection`: 좋아함, 현재 love의 후속 필드
- `trust`: 돈, 약속, 반복 대화로 쌓이는 안정감
- `tension`: 갈등, 실망, 위험한 선택에서 증가
- `jealousy`: 다른 파트너, 과한 선물, 특정 이벤트에서 증가
- `comfort`: 집/데이트/성공 대화에서 증가
- `memory`: 대화 분기를 여는 과거 사건

## 대화 시스템 초안

대화는 단순 랜덤 문장 대신 조건과 결과를 가진다.

```js
{
  id: "talk:college-student:market-loss-comfort",
  partnerId: "partner:college-student",
  trigger: {
    minAffection: 30,
    recentEvent: "market_loss",
    maxTension: 60
  },
  line: "오늘 표정 안 좋아 보여. 또 무리한 거 아니지?",
  choices: [
    {
      id: "honest",
      text: "솔직히 좀 잃었어.",
      effects: { trust: 4, tension: -2 }
    },
    {
      id: "bluff",
      text: "괜찮아. 금방 복구해.",
      effects: { affection: 1, trust: -3, tension: 3 }
    }
  ],
  illustrationId: "college-student:concerned"
}
```

대화 분기 우선순위:

1. 현재 관계 단계
2. 최근 사건
3. 보유 자산/현금 상태
4. 도박 승패 기록
5. 받은 선물과 기억
6. 랜덤 일상 대화

## 도박과 감정 연결

도박 결과는 바로 연애 수치를 바꾸지 않는다. 먼저 사건으로 기록한다.

```text
playOddEven
-> gambling result
-> event: casino_win/casino_loss
-> relationship-system reads event
-> 다음 대화에서 반응
```

예시:

- 큰 승리: 파트너가 기대하거나 걱정한다.
- 큰 패배: 신뢰가 흔들리고 tension이 오른다.
- 연속 도박: 특정 파트너는 호감, 다른 파트너는 불안감을 느낀다.
- 명품 선물: affection은 오르지만 trust나 jealousy가 같이 흔들릴 수 있다.

## 보유 시스템과 감정 연결

보유 자산은 단순 총자산 계산이 아니라 대화 소재가 된다.

연결 예시:

- 휴대폰 보유: 연락/문자/AI 대화 가능
- 스마트폰 보유: 코인선물 앱, 고급 대화, 사진/일러스트 이벤트 가능
- 집 등급: 데이트/휴식 이벤트 해금
- 반지: 결혼 이벤트 조건
- 명품: 선물, 질투, 과시 대화 조건
- 부동산: 안정감과 trust 대화 조건

## 일러스트 추가 규칙

일러스트는 대화와 감정선에 붙인다.

필수 메타데이터:

```js
{
  id: "college-student:happy",
  partnerId: "partner:college-student",
  src: "assets/restored/partners/college-student/portrait-happy.png",
  type: "portrait",
  mood: "happy",
  unlock: { minAffection: 60 }
}
```

규칙:

- HTML에 이미지 경로를 직접 박지 않는다.
- `illustration-catalog.js`에서 id로 관리한다.
- 대화는 `illustrationId`만 참조한다.
- 없는 이미지는 기본 portrait로 fallback한다.
- 성인/선정적 이미지 확장은 별도 수위 규칙 문서 없이는 하지 않는다.

## 우선 작업 순서

1. `baegeum-city-v2-dice.html`를 그대로 유지하면서 이 문서를 기준선으로 둔다.
2. `src/restored/state/initial-state.js`와 `storage.js`부터 만든다.
3. `partners`, `luxury`, `realEstate`, `stocks`, `crypto` catalog를 데이터 파일로 뺀다.
4. `relationship-system.js`를 만들어 기존 `love`를 `affection`으로 감싸되 저장 호환성을 유지한다.
5. `conversation-system.js`를 만들어 AI 대화 버튼이 catalog 기반 분기를 고르게 한다.
6. `illustration-catalog.js`와 기본 placeholder portrait를 붙인다.
7. 도박 결과를 `recentEvents`에 기록하고, 대화가 그 사건을 읽게 한다.
8. 마지막에 HTML inline script를 기능별 모듈로 줄인다.

## 구현 전 체크리스트

새 기능 시작 전 질문:

- 이 기능은 연인/감정선, 도박, 보유, 대화, 일러스트 중 어디에 속하는가?
- 새 상태 필드가 저장에 들어가는가?
- 저장 버전과 migration이 필요한가?
- 기존 save code 현금 복구와 충돌하는가?
- UI에서 직접 상태를 바꾸고 있지 않은가?
- 대화 결과와 도박 결과가 중간 event 없이 직접 엮이지 않았는가?
- 새 이미지 파일은 manifest로 참조되는가?
- 파일이 250줄을 넘을 조짐이 있는가?

## 지금 하지 말 것

- 단일 HTML을 한 번에 전면 분해하지 않는다.
- 기존 도시 코어 `src/` 구조와 복원판 구조를 섞지 않는다.
- AI 연인 대화를 API/외부 계정에 연결하지 않는다.
- 실제 결제, 실제 도박, 외부 재화 환전과 연결하지 않는다.
- 일러스트를 먼저 대량 추가하고 대화/감정 조건을 나중에 붙이지 않는다.

## 다음 Codex 작업 지시문

복원판을 이어받는 AI에게는 이렇게 지시한다.

```text
현재 활성 빌드는 `baegeum-city-v2-dice.html`이다.
새 기능을 inline script에 계속 붙이지 말고 `docs/baegeum-city-v2-restored-growth-architecture.md`의 `src/restored/` 구조를 따른다.
가장 먼저 state/storage/catalog를 분리하고, 그 다음 AI 연인 대화와 감정선 시스템을 확장한다.
기존 modular city-core는 삭제하지 말고 보관한다.
검증은 `npm run check`, `git diff --check`, 그리고 브라우저에서 현재 탭 동작 확인으로 한다.
```
