# 배금도시 v2 멀티맵 계약

Conclusion: 배금시티와 다이스시티는 같은 게임 안의 별도 도시로 다루며, 각 도시는 고유 `mapId`, `sceneId`, `draftKey`, 월드 채팅 채널, 기본 스폰을 가진다.

## 목적

멀티맵 전환의 첫 목표는 현재 맵을 바로 줄이거나 카지노를 삭제하는 것이 아니다. 먼저 맵별 저장소와 이동 계약을 고정해서 배금시티 편집본과 다이스시티 편집본이 서로 덮이지 않게 만든다.

## 현재 맵

```text
mapId: baegeum-city
sceneId: city:baegeum
displayName: 배금시티
baseMapId: baegeum-city-prototype
draftKey: baegeum-city-v2-world-editor-draft:baegeum-city
legacyDraftKey: baegeum-city-v2-world-editor-draft-v0
defaultSpawnId: baegeum-main-spawn
worldChannelId: world:baegeum-city
```

배금시티만 기존 `legacyDraftKey`를 fallback으로 읽을 수 있다. 이 fallback은 이전 단일맵 에디터 저장본을 살리기 위한 호환 규칙이며, 자동 삭제나 자동 이전은 하지 않는다.

## 다음 맵

```text
mapId: dice-city
sceneId: city:dice
displayName: 다이스시티
baseMapId: dice-city-v0
draftKey: baegeum-city-v2-world-editor-draft:dice-city
legacyDraftKey: none
defaultSpawnId: dice-terminal-arrival
worldChannelId: world:dice-city
```

다이스시티는 legacy draft를 읽으면 안 된다. 다이스시티가 기존 배금시티 draft를 읽으면 카지노 이전, 도로, NPC 경로, 스폰 위치가 섞일 수 있다.

## Draft 저장 규칙

맵 에디터는 항상 `activeMapId`를 가진다.

```text
activeMapId: baegeum-city -> baegeum-city-v2-world-editor-draft:baegeum-city
activeMapId: dice-city    -> baegeum-city-v2-world-editor-draft:dice-city
```

기존 단일 저장키는 아래 상황에서만 읽는다.

```text
mapId === baegeum-city
new draftKey is missing
legacyDraftKey exists
```

이 규칙은 읽기 fallback이다. 멀티맵 저장 기능이 붙은 뒤 새 저장은 반드시 map-specific `draftKey`로만 한다.

## 현재 구현 상태

- `src/data/map-registry.js`가 `baegeum-city`와 `dice-city` registry를 소유한다.
- `src/data/world-editor-draft.js`는 map-specific draft key를 먼저 읽는다.
- `baegeum-city`는 새 draft가 없을 때만 `baegeum-city-v2-world-editor-draft-v0` legacy draft를 fallback으로 읽는다.
- `dice-city`는 legacy draft를 절대 읽지 않는다.
- `src/tools/baegeum-world-editor.js`는 `activeMapId` 기반으로 저장/초기화한다.
- `src/data/dice-city-map.js`가 `dice-city-v0` 기본 맵 데이터를 소유한다.
- 현재 에디터 selector는 `baegeum-city`와 `dice-city`를 둘 다 열 수 있다.
- `dice-city-v0`는 아직 도박장 이전 맵이 아니라 도로, 스폰, 빈 건물 셸, 장식물만 있는 편집용 기본 골격이다.
- `src/data/runtime-contract.js`의 기본 월드 채널은 이제 `world:baegeum-city`이며, `world:city` legacy 채널은 새 검증에서 거절한다.
- `src/systems/player-state.js`는 `city` 상태에 `mapId`, `sceneId`, `spawnId`, `worldChannelId`, `chatChannelId`를 함께 넣는다.
- `src/data/map-transitions.js`가 배금시티/다이스시티 버스터미널 `map_transition` 계약을 소유한다.
- `src/systems/map-transition-runtime.js`는 버스터미널 이동을 `map_transition` action과 `player_state_patch` effect로 만든다.
- `src/systems/map-transition-interaction.js`는 각 도시의 시외버스터미널 근처에서 PC `E` / 모바일 `ACTION` 후보를 만든다.
- `src/scenes/city-scene.js`는 전환 실행 후 런타임 맵, 충돌, 카메라, NPC, 플레이어 상태, 채팅 채널을 함께 `dice-city`로 바꾼다.
- `src/scenes/city-startup.js`는 개발용 `?map=` / `?spawn=` URL을 해석해 특정 도시와 문 근처에서 시작할 수 있게 한다.
- `src/renderers/simple-scenery-renderer.js`는 다이스시티 같은 비원본 맵의 나무, 브러시, 가로등, 광고판을 그린다.
- `dice-city`의 `building_shell`은 런타임 카지노로 자동 변환하지 않는다. 카지노 이전은 별도 복사 계획에서만 진행한다.
- `src/systems/local-storage-diagnostics.js`는 `baegeum-city`, `dice-city`, legacy draft key를 분리해서 진단한다.
- 맵에디터에는 `activeMapId` 선택기가 있고, 선택한 맵별 draft key로 저장/초기화한다.
- 맵에디터는 현재 맵에 저장 안 된 변경이 있으면 다른 `activeMapId`로 전환하지 않는다. 먼저 저장해야 다른 도시 draft를 불러올 수 있다.

## City role contract

`src/data/map-registry.js` now includes `cityRoleId` for each map.

```text
baegeum-city -> life_hub
dice-city    -> gambling_night
```

The detailed role, district, and building-type rules live in `docs/baegeum-city-v2-city-district-contract.md` and `src/data/city-district-contract.js`.

Current rule: new lifestyle buildings belong in `baegeum-city`, and new gambling/nightlife/risk buildings belong in `dice-city`. Existing baegeum casino originals remain only as `legacy_preserved` until copied dice-city venues are stable and the human decides whether to delete, shrink, or mark them as relocated.

## Scene 상태 규칙

플레이어 상태는 맵 전환 이후 아래 필드를 명시해야 한다.

```js
{
  mode: "city",
  mapId: "baegeum-city",
  sceneId: "city:baegeum",
  spawnId: "baegeum-main-spawn",
  chatChannelId: "world:baegeum-city"
}
```

다이스시티 전환 후에는 `mapId`, `sceneId`, `spawnId`, `chatChannelId`가 함께 바뀌어야 한다.

## 버스터미널 전환 계약

처음 버스터미널은 건물 내부 씬이 아니라 `map_transition` 오브젝트로 둔다.

```js
{
  id: "transition:baegeum-to-dice-bus-terminal",
  type: "map_transition",
  from: "baegeum-city",
  objectId: "intercity-bus-terminal",
  label: "시외버스터미널",
  fromMapId: "baegeum-city",
  targetMapId: "dice-city",
  targetSpawnId: "dice-terminal-arrival",
  interactionLabel: "다이스시티로 이동",
  anchor: "player_spawn"
}
```

v0에서는 요금, 티켓, 시간표, 온라인 방 이동을 붙이지 않는다. 먼저 텔레포트와 상태 전환만 검증한다.
현재 구현은 배금시티 시작 지점 근처의 `intercity-bus-terminal` 상호작용 앵커로 연결되어 있다. 터미널 위치는 고정 좌표가 아니라 현재 런타임 맵의 `playerSpawn` 기준으로 잡는다. 터미널 근처에서 PC `E` 또는 모바일 `ACTION`을 누르면 `dice-city`의 `dice-terminal-arrival`로 이동한다.

다이스시티에는 같은 방식의 귀환 터미널을 둔다.

```js
{
  id: "transition:dice-to-baegeum-bus-terminal",
  type: "map_transition",
  from: "dice-city",
  objectId: "dice-return-bus-terminal",
  label: "시외버스터미널",
  fromMapId: "dice-city",
  targetMapId: "baegeum-city",
  targetSpawnId: "baegeum-main-spawn",
  interactionLabel: "배금시티로 이동",
  anchor: "player_spawn"
}
```

현재 구현은 다이스시티 도착 지점 근처의 `dice-return-bus-terminal` 상호작용 앵커로 연결되어 있다. 터미널 근처에서 PC `E` 또는 모바일 `ACTION`을 누르면 `baegeum-city`의 `baegeum-main-spawn`으로 돌아간다.

## 카지노 이전 규칙

기존 카지노 건물은 삭제하지 않는다.

```text
1. 현재 배치와 채널을 백업한다.
2. 다이스시티에 복사 배치한다.
3. 다이스시티에서 입장, 간판, 채널, 실내 이동을 검증한다.
4. 배금시티 카지노는 이전 예정 또는 폐건물로 남긴다.
5. 마지막에 삭제 또는 축소 여부를 결정한다.
```

현재 백업 기준점은 `C:\Users\rneet\OneDrive\문서\baegeum-city-v2-backups\pre-multimap-20260526-114932`이다.
`tools/smoke-casino-copy-contract.cjs`는 이 규칙을 자동 검증한다. 원본 `bg-blackjack-casino`, `bg-odd-even-casino`, `bg-horse-track`이 배금시티에 남아 있는지, 다이스시티 복사본이 별도 id/door/channel/onlineRoomId를 쓰는지, 그리고 같은 한국어 간판/게임 타입/검증된 실내 씬을 재사용하는지 확인한다.

## Dice-city copied venues v0

Current rule: dice-city uses copied venue anchors, not moved originals.

Implemented copied anchors:

- `bg-dice-blackjack-casino-01` from `blackjack-casino`, with `channels.world = world:dice-city`.
- `bg-dice-odd-even-casino-01` from `odd-even-casino`, with `channels.world = world:dice-city`.
- `bg-dice-horse-track-01` from `horse-track`, with `channels.world = world:dice-city`.

These copied anchors reuse the proven base interiors:

- `interior-blackjack-casino`
- `interior-odd-even-casino`
- `interior-horse-track`

The copied anchors deliberately keep betting logic unchanged. The first goal is map navigation, signs, doors, interior loading, and per-map chat/venue channel separation.

Important safety boundary: `building_shell` obstacles in dice-city remain placement-only shells. They are not automatically converted into enterable casino venues.
Important migration boundary: copied casino anchors must never reuse the source object id, source door id, source `onlineRoomId`, or source venue channel. They may reuse the proven base interior id until a dice-city-specific interior is intentionally created.

Browser-verified copied entry path:

```text
http://127.0.0.1:4173/index.html?map=dice-city&spawn=dice-blackjack-casino-01
```

This starts near `bg-dice-blackjack-casino-01`, detects `nearby: 블랙잭카지노 (dice-blackjack-casino-01-front)`, and enters the reused blackjack interior with `chat: venue:dice-blackjack-casino-01`.

Current visual tuning: `dice-city-v0` has a casino frontage road, extra streetlights, and casino/loan/job billboards around the copied blackjack, odd-even, and horse-track venues. Browser verification confirmed the props render with zero console errors. Future tuning should reduce billboard/sign overlap before the street is treated as final.

## Baegeum-city compact vertical relayout

Current rule: `baegeum-city` shrinking is implemented as a project-owned relayout transform, not by editing vendored Iron Line source and not by changing only `height`.

The runtime/editor pages load the vendored Iron Line browser map first (`window.IronLine.map01`), and `vendor/iron-line/src/data/map01-custom-layout.js` stretches it to `8200 x 5600`. As of 2026-05-26, the lower road points reach `y=5600`, base-wall content reaches `y=5588`, and the player spawn is near the bottom at `y=4992`. The fallback `src/data/city-map.js` also has bottom roads/walls touching its own height limit.

`src/data/baegeum-city-compact-layout.js` applies `baegeum-city-compact-layout-v1` after vendor load and after baegeum draft application. The first compact target is height `4600`; the transform scales y positions, object heights/radii, spawns, bus terminal inputs, scenery, roads, and nav nodes together. This means old `5600`-height baegeum drafts can be compacted in memory without clearing localStorage.

`tools/smoke-baegeum-map-shrink-readiness.cjs` guards this. It currently verifies the compact browser map has height `4600`, max bottom `4600`, player spawn y `4101`, and an in-bounds intercity bus terminal transition.

Further vertical shrink requires another relayout slice:

1. Backup/export the current baegeum draft.
2. Pick a new target bottom boundary below `4600`.
3. Move, scale, or redraw bottom roads, base walls, player spawn, bus terminal anchor, NPC nav nodes, scenery, and minimap-relevant bounds together.
4. Verify spawn, bus transition, NPC pathing, collision, minimap, editor load/save, and browser console.

## 금지 순서

- 멀티맵 draftKey 분리 전 현재 맵 세로 크기를 줄이지 않는다.
- 다이스시티가 legacy draft를 읽게 하지 않는다.
- 기존 카지노 건물을 먼저 삭제하지 않는다.
- mapId 없는 world chat, ranking, online room state를 새로 추가하지 않는다.
- 버스터미널 v0에 요금, 시간표, 티켓, 온라인 매칭을 같이 붙이지 않는다.

## 다음 구현 순서

1. `src/data/map-registry.js`로 registry를 고정한다. 완료.
2. smoke test로 mapId, sceneId, draftKey, legacy fallback 규칙을 검증한다. 완료.
3. world editor draft helper가 mapId별 key를 받을 수 있게 한다. 완료.
4. 맵에디터에 active map selector를 붙인다. 완료.
5. dice-city-v0 기본 맵 데이터를 만든다. 완료.
6. 버스터미널 transition 오브젝트와 텔레포트 상태 패치를 붙인다. 완료.
7. 인게임 배금시티/다이스시티에 버스터미널 오브젝트를 배치하고 `map_transition` 후보를 연결한다. 완료.
8. 카지노 복사 계획을 실행한다. 완료: `blackjack-casino`, `odd-even-casino`, `horse-track` copied to dice-city as separate venue anchors.
