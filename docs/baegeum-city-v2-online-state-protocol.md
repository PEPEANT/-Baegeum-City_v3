# 배금도시 v2 온라인 상태/프로토콜 설계

결론: 온라인/도박/DIS를 붙이기 전에 `src/data/runtime-contract.js`를 런타임 계약의 기준 파일로 둔다. 상태 전이와 채널 스키마는 `tools/smoke-state-protocol.cjs`에서 검증한다.

## 현재 고정된 계약

```js
MAP_VERSION = "baegeum-city-v2-map-001"
VENUE_SCHEMA_VERSION = "venue-schema-001"
WORLD_CHANNEL_ID = "world:baegeum-city"
```

맵 데이터와 런타임 맵은 `mapVersion`, `venueSchemaVersion`을 가진다. 서버를 붙일 때 클라이언트 버전이 다르면 월드 입장 또는 건물 입장을 거절해야 한다.
도시별 월드 채널은 `src/data/map-registry.js`에서 가져오며, `world:city` legacy 채널은 새 계약에서 거절한다.

## playerState

플레이어는 항상 하나의 주요 모드만 가진다.

```js
{
  playerId: "p_123",
  nickname: "guest",
  role: "player",
  mode: "city",
  mapId: "baegeum-city",
  sceneId: "city:baegeum",
  spawnId: "baegeum-main-spawn",
  worldChannelId: "world:baegeum-city",
  venueId: null,
  tableId: null,
  spectatorTargetId: null,
  adminScopeId: null,
  position: { x: 4000, y: 1700, angle: 0 },
  scene: "city",
  mapVersion: "baegeum-city-v2-map-001"
}
```

허용 역할: `player`, `spectator`, `moderator`, `admin`, `owner`

허용 모드: `city`, `venue_lobby`, `table_seated`, `spectating`, `admin_observing`, `disconnected`

## roomProtocol

초기 온라인 이벤트는 아래만 허용한다.

```js
enter_venue
leave_venue
sit_table
leave_table
spectate_table
stop_spectating
admin_watch
admin_unwatch
chat_send
position_update
```

상태 전이:

```text
city -> enter_venue -> venue_lobby
venue_lobby -> leave_venue -> city
venue_lobby -> sit_table -> table_seated
table_seated -> leave_table -> venue_lobby
city | venue_lobby -> spectate_table -> spectating
spectating -> stop_spectating -> city
city | venue_lobby -> admin_watch -> admin_observing
admin_observing -> admin_unwatch -> city
```

금지 전이:

- `city`에서 바로 `sit_table` 금지
- `table_seated`에서 다른 `enter_venue` 금지
- `spectator` 역할의 `sit_table` 금지
- 일반 `player`의 `admin_watch` 금지
- `disconnected` 상태의 `chat_send` 금지

## 채널 스키마

도박장 채널은 건물 ID에서 자동 생성한다. `chat:<id>` 같은 별도 채팅 채널은 만들지 않는다.

```js
{
  world: "world:baegeum-city",
  venue: "venue:blackjack-casino-01",
  table: "table:blackjack-casino-01:main",
  spectator: "spectator:blackjack-casino-01",
  admin: "admin:blackjack-casino-01"
}
```

현재 채팅 채널 선택 규칙:

- `city`는 현재 `mapId`의 월드 채널이다. 예: `world:baegeum-city`, `world:dice-city`
- `venue_lobby`는 `venue:<venue-id>`
- `table_seated`는 `table:<venue-id>:main`
- `spectating`은 `spectator:<venue-id>`
- `admin_observing`은 `admin:<venue-id>`

## 검증

`npm run check`는 아래를 포함한다.

- 원본 vendor 해시 검증
- JS 파일 크기/문법 검증
- 도시 코어 스모크 검증
- 상태 전이/채널 스키마/채팅 로그 분리 검증

현재 검증 파일:

- `tools/smoke-city-core.cjs`
- `tools/smoke-state-protocol.cjs`

## 다음 구현 기준

1. 폰 DIS 커뮤니티는 `Runtime Contract v1` 위에서 붙인다.
2. DIS는 실시간 월드 채팅이 아니라 게시판/댓글형 앱으로 분리한다.
3. 온라인 서버 도입 전까지 클라이언트는 요청만 만든다는 원칙을 유지한다.
4. 돈, 칩, 베팅 결과, 랭킹은 서버 권위와 append-only ledger 원칙을 따른다.
5. 관리자 페이지는 `admin_observing`과 별도 권한 모델이 준비된 뒤 붙인다.
