# 배금도시 v2 플레이어 상태 런타임

결론: 온라인을 붙이기 전에 로컬 런타임부터 `playerState`를 명확히 보이게 했다. 현재는 `city`, `venue_lobby`, `table_seated`를 실제 게임 입장/퇴장/착석 흐름에 연결했다.

## 현재 구현

- 기준 파일: `src/systems/player-state.js`
- 도시 상태: `createCityPlayerState()`
- 멀티맵 기본값: `src/data/map-registry.js`와 `src/data/runtime-contract.js`
- 건물 내부 상태: `createVenuePlayerState()`
- 테이블 착석 상태: `createTablePlayerState()`
- 테이블 나가기 상태: `createVenueLobbyPlayerState()`
- 입장/퇴장 요청: `src/systems/local-action-runtime.js`의 `enter_venue`, `leave_venue` action envelope
- 테이블 요청: `src/systems/local-action-runtime.js`의 `sit_table`, `leave_table` action envelope
- 맵 이동 요청: `src/systems/map-transition-runtime.js`의 `map_transition` action envelope
- 맵 이동 후보: `src/systems/map-transition-interaction.js`의 `map_transition` interaction candidate
- 검증: `tools/smoke-state-protocol.cjs`
- action 검증: `tools/smoke-local-action-runtime.cjs`

## 현재 상태 필드

```js
{
  mode: "city" | "venue_lobby" | "table_seated",
  scene: "city" | "interior-id",
  sceneId: "city:baegeum" | "city:dice" | "interior-id",
  mapId: "baegeum-city" | "dice-city",
  spawnId: "baegeum-main-spawn" | "dice-terminal-arrival",
  worldChannelId: "world:baegeum-city" | "world:dice-city",
  venueId: null,
  venueName: null,
  onlineRoomId: null,
  venueChannelId: null,
  tableId: null,
  spectatorChannelId: null,
  adminChannelId: null,
  chatChannelId: "world:baegeum-city",
  mapVersion: "baegeum-city-v2-map-001",
  venueSchemaVersion: "venue-schema-001"
}
```

`city` 상태에서는 `mapId`, `sceneId`, `spawnId`, `chatChannelId`가 한 묶음으로 움직인다. 다이스시티 전환 후에는 `dice-city`, `city:dice`, `dice-terminal-arrival`, `world:dice-city`가 같이 적용되어야 한다. 배금시티 귀환 후에는 `baegeum-city`, `city:baegeum`, `baegeum-main-spawn`, `world:baegeum-city`가 같이 복원되어야 한다.

## 설정 패널 디버그

설정 패널에 아래 값이 표시된다.

- `mode`
- `chat`
- `venue`
- `room`
- `map`

이 디버그 HUD는 나중에 온라인 입장, 관전자, 관리자 페이지, 테이블 착석이 붙었을 때 유령 플레이어와 채널 잔류 문제를 빨리 찾기 위한 안전장치다.

## 다음 단계

1. 다이스시티 카지노 거리 시각 검증에서도 `mapId`, `sceneId`, `spawnId`, `chatChannelId`가 같이 바뀌는 규칙을 유지한다.
2. `spectating` 상태를 테이블 관전자 모드에 연결한다.
3. 서버가 붙으면 클라이언트 `playerState`는 표시용 미러가 되고, 최종 상태 전이는 서버가 확정한다.
