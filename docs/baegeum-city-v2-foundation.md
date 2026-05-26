# 배금도시 v2 기초 토대

결론: 배금도시 v2는 **오프라인 도시 코어를 먼저 만들되, 모든 상태 구조는 온라인 전환이 가능하게** 설계한다.

## 목적

이 문서는 배금도시 v2를 만들기 전에 프로젝트가 터지지 않도록 고정하는 공사 전 기준이다. 이후 AI 작업자는 이 문서를 먼저 읽고, 범위를 넓히기 전에 현재 단계의 완료 조건을 확인해야 한다.

## 첫 목표

첫 알파 목표는 다음 4가지만 완성한다.

- 기존 Iron Line 맵 기반 도시에서 플레이어가 이동한다.
- NPC 10명이 NavGraph 기반으로 도시를 배회한다.
- 건물 13개를 도박장 종류로 분류하고 입장/퇴장할 수 있다.
- 맵 에디터로 건물/문/실내 연결 메타데이터를 수정할 수 있다.

## 개발 순서

1. 문서와 수입 규칙을 먼저 잠근다.
2. 기존 맵을 임시 도시맵으로 가져온다.
3. 플레이어 이동, 카메라, 충돌, 렌더링을 붙인다.
4. NPC 배회만 구현한다. 전투 AI는 가져오지 않는다.
5. 건물 입장은 텔레포트 기반 씬 전환으로 구현한다.
6. 월드 시간과 반복 이벤트 기준을 만든다.
7. 맵 에디터에 건물/문/도박장/씬 메타데이터를 추가한다.
8. 개발자 패널을 만든다.
9. 온라인은 위치 동기화부터 최소로 붙인다.

## 코드 크기 제한

대형 파일은 AI가 가장 자주 망가뜨리는 지점이다. 새 코드는 아래 제한을 기본값으로 따른다.

- 한 파일은 기본 300줄 이하로 유지한다.
- 500줄을 넘기면 반드시 모듈 분리 후보로 표시한다.
- 800줄을 넘기는 새 파일은 만들지 않는다.
- 한 함수는 기본 60줄 이하로 유지한다.
- 100줄을 넘기는 함수는 단계 종료 전에 쪼갠다.
- 한 파일에는 하나의 주요 책임만 둔다.
- `main.js`, `game.js`, `renderer.js` 같은 중앙 파일에 새 기능 본문을 계속 쌓지 않는다.

예외는 데이터 파일, 맵 파일, 자동 생성 파일뿐이다. 예외가 필요하면 문서에 이유를 남긴다.

## 폴더 원칙

초기 구조는 아래처럼 책임을 나눈다.

```text
src/core/          공용 수학, 입력, 시간, 이벤트
src/data/          맵, 건물, 문, 씬, NPC 설정
src/entities/      player, npc, door, vehicle 같은 상태 객체
src/scenes/        city, interior 등 씬 단위 로직
src/systems/       movement, collision, interaction, camera
src/renderers/     world, scenery, npc, ui 렌더링
src/tools/         맵 에디터 같은 개발 도구
server/            나중에 온라인 API/WebSocket
docs/              설계와 작업 규칙
```

처음에는 완벽한 엔진보다 “기능이 어디에 들어가야 하는지 헷갈리지 않는 구조”가 더 중요하다.

## Iron Line 수입 규칙

Iron Line은 통째로 이식하지 않는다. 배금도시에 필요한 도시 엔진 부품만 가져온다.

### 1차 수입 허용

- `src/core/math.js`
- `src/core/input.js`
- 이동/충돌에 필요한 `src/systems/physics.js` 일부
- `src/ai/pathfinding.js`
- NPC 목적지 이동에 필요한 `src/ai/navigation-agent.js` 일부
- 카메라/캔버스 기본 구조
- 건물/도로/장애물 렌더링 일부
- 월드 확인용 `src/systems/renderer-minimap.js`
- `src/data/scenery-catalog.js`
- `src/data/map01-custom-layout.js`
- `editor.html`
- `src/tools/map-editor.js`

### 나중에 수입

- `server/websocket.js`
- `server/room-registry.js`
- 온라인 입장/방 구조
- `player_state` 위치 동기화 구조
- 관리자 페이지

### 수입 금지

- 탱크 전투 전체
- 보병 전투 AI 전체
- 지휘관 AI
- BotCommander
- Tactical Map 전투 판단
- 50vs50 관련 코드
- 관리자/관전자 시스템 전체
- 대형 HUD 전체
- test-lab 실험 기능 전체
- 서버 권위 전투 코드 전체

필요해 보여도 금지 목록은 바로 가져오지 않는다. 먼저 “왜 필요한지, 무엇만 필요한지”를 문서에 추가한다.

## 맵과 건물 원칙

처음 맵 디자인은 `map01-custom-layout.js`를 그대로 가져온다. 목표는 새 맵 제작이 아니라 도시 루프 검증이다.

건물은 처음부터 실제 내부 공간을 월드에 심지 않는다. 건물은 한국어 간판을 가진 도박장으로 분류하고, 입장은 아래 방식으로 처리한다.

```text
도시 씬 -> 문 접촉 -> 실내 씬 로드 -> 나가기 -> 원래 건물 앞 좌표 복귀
```

건물 데이터는 최소한 아래 필드를 가진다.

```js
{
  id: "blackjack-casino-01",
  name: "블랙잭카지노",
  sign: "블랙잭카지노",
  gameType: "blackjack",
  minBet: 1000,
  districtId: "gambling-blackjack",
  rect: { x: 1000, y: 900, w: 240, h: 160 },
  signAnchor: { x: 1120, y: 1018 },
  doors: [
    {
      id: "blackjack-casino-front",
      x: 1120,
      y: 1060,
      targetSceneId: "interior-blackjack-casino",
      returnSpawnId: "bank-front-out"
    }
  ],
  channels: {
    world: "world:baegeum-city",
    venue: "venue:blackjack-casino-01",
    table: "table:blackjack-casino-01:main",
    spectator: "spectator:blackjack-casino-01",
    admin: "admin:blackjack-casino-01"
  }
}
```

## NPC 원칙

초기 NPC는 똑똑할 필요가 없다. 살아있는 도시처럼 보이면 충분하다.

- NPC는 목적지를 고르고 이동한다.
- 장애물과 건물을 피한다.
- 일정 시간 멈추거나 방향을 바꾼다.
- 플레이어와 충돌하면 살짝 비켜난다.
- 전투, 범죄, 추격, 대화 AI는 나중에 붙인다.

## 온라인 원칙

처음부터 온라인 게임으로 상상하되, 첫 구현은 오프라인이다.

온라인 1차 목표는 전투가 아니다.

- 같은 방에 2~4명이 접속한다.
- 서로의 위치와 방향만 보인다.
- 같은 도시맵에 존재한다.
- 같은 건물 입장 상태를 표현할 수 있다.
- `world`, `venue`, `table`, `spectator`, `admin`, `chat` 채널을 섞지 않는다.
- 돈, 도박 결과, 랭킹은 서버 권위로 확정한다.

처음 온라인에서 금지할 것:

- 경제 동기화
- 전투 판정
- 경찰/범죄 시스템 동기화
- NPC 전체 서버 권위화
- MMO식 오픈월드 샤딩

온라인 상태 전이와 서버 권위 규칙은 `docs/baegeum-city-v2-online-state-protocol.md`를 따른다.
운영/데이터/권한/안티치트/재접속/감사 로그 규칙은 `docs/baegeum-city-v2-operations-data-rules.md`를 따른다.
월드 시간과 반복 이벤트 규칙은 `docs/baegeum-city-v2-world-clock.md`를 따른다.

## 관리자와 에디터

맵 에디터는 초반에 가져온다. 배금도시는 건물, 문, 실내 연결, NPC 경로가 중요하기 때문이다.

관리자 페이지는 나중에 가져온다. 초반에는 작은 개발자 패널만 만든다.

개발자 패널 1차 항목:

- 현재 씬 ID
- 플레이어 좌표
- 바라보는 건물 ID
- 가까운 문 ID
- NPC 수
- NavGraph 표시
- 충돌 박스 표시

## 단계 게이트

다음 단계로 넘어가기 전에는 항상 아래를 확인한다.

- 실제로 플레이해 봤는가?
- 현재 단계의 목표만 구현했는가?
- 새 코드가 파일 크기 제한을 넘지 않는가?
- Iron Line 금지 목록을 우회해서 가져오지 않았는가?
- 버그나 미완성은 문서에 남겼는가?
- 다음 사람이 이어받아도 어디부터 보면 되는지 명확한가?

## AI 작업자 시작 스크립트

새 작업자는 작업 전에 아래 순서로 확인한다.

```text
1. docs/INDEX.md를 읽는다.
2. docs/baegeum-city-v2-foundation.md를 읽는다.
3. 현재 단계가 무엇인지 확인한다.
4. Iron Line에서 가져올 파일이 허용 목록에 있는지 확인한다.
5. 금지 목록에 걸리면 구현을 멈추고 대체안을 제안한다.
6. 파일이 300줄을 넘기기 시작하면 분리 계획을 먼저 세운다.
7. 온라인/경제/관리자 기능이면 online-state-protocol과 operations-data-rules를 먼저 확인한다.
8. UI를 추가하거나 옮기면 ui-design-rules를 먼저 확인한다.
9. 구현 후 실행/검증 결과를 사용자에게 짧게 보고한다.
```

## 다음 문서 후보

필요해질 때만 아래 문서를 추가한다.

- `baegeum-city-v2-scene-flow.md`
- `baegeum-city-v2-map-editor-plan.md`
- `baegeum-city-v2-online-plan.md`
- `baegeum-city-v2-npc-plan.md`
