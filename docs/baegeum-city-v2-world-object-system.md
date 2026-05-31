# 배금도시 v2 월드 오브젝트 시스템

결론: 배금도시의 배치 오브젝트는 단순 장식물이 아니라 **시각 형태, 충돌 판정, 파괴 가능성, 배치 규칙, 런타임 상태가 분리된 물체**로 다룬다.

## 목적

온라인까지 고려하면 벤치, 가로등, 나무, 자동차, 간판은 모두 서버가 이해할 수 있는 규칙을 가져야 한다. 클라이언트는 그 물체를 그려주고 입력을 보내지만, 충돌과 파괴 결과는 나중에 서버 권위로 확정해야 한다.

## 현재 구현

- `src/data/world-object-presets.js`가 월드 오브젝트 프리셋의 기준이다.
- `src/data/billboard-ads.js`는 광고판의 시각 광고 목록과 `variant` 기반 자동 배정을 담당한다.
- `src/tools/baegeum-world-editor-build.js`는 건설 카드를 이 프리셋에서 만든다.
- `src/data/world-placement-validation.js`는 새 오브젝트 배치 시 맵 경계, 보호구역, 건물/벽, 다른 충돌 오브젝트, 도로 점유를 검사한다.
- 에디터에서 새로 배치한 장식물은 `presetId`, `objectLayer`, `collision`, `destructibleSpec`, `buildRules`를 함께 저장한다.
- 에디터의 `도시` 인프라 카드와 `빈 상가`, `빈 카지노`, `골목 상가` 건물 카드 v0는 `objectLayer: "obstacle"`, `kind: "building"`, `objectKind: "building_shell"`로 저장되며, 입장/실내/경제 동작은 아직 만들지 않는다.
- `building_shell` 크기 편집은 기존 `w/h`와 `collision.w/h`만 바꾸며, 이름/색 편집은 placement-only `shellName`과 `shellColor`만 바꾼다. doors/channels/interior/economy/online 필드는 만들지 않는다.
- 건물 쉘 스모크 검증은 `createWorldEditorDraft` 이후에도 건물 카드가 `obstacles`에 남고, `building:*` 계약 ID와 `building_shell` 분류 및 `shellName`/`shellColor` 외형 필드를 유지하며, venue/economy 필드를 갖지 않는지 확인한다.
- 광고판은 오브젝트 위치와 충돌은 그대로 두고, `adId`만 바꿔 광고 내용을 교체한다.
- `collision`은 현재 물체가 실제로 막는 범위를 정의한다.
- `destructibleSpec`은 체력, 파괴 원인, 파괴 후 충돌 처리, 잔해 프리셋을 정의한다.
- `buildRules`는 입구/스폰 회피 같은 배치 검증 규칙을 위한 자리다.
- `충돌/파괴 레이어` 토글은 프리셋 기반 충돌 범위를 에디터에서 보여준다.

## 데이터 형태

## 분류 계약

오브젝트는 앞으로 한 가지 이름만으로 판단하지 않고 세 축으로 본다.

1. `objectLayer`: 맵/에디터에서 어느 레이어에 놓이는가. 현재는 `scenery`, `obstacle`, `interior` 중심이며, 런타임 전용 오브젝트는 나중에 별도 레이어로 둔다.
2. `objectKind`: 물체의 정체. 현재 코드는 `presetId`, `type`, `kind`, `role`에서 유추하지만, 새 프리셋은 이 분류를 의식해서 만든다.
3. `capabilities`: 무엇을 할 수 있는가. 예를 들어 `collidable`, `destructible`, `interactable`, `advertises`, `entrance`, `economyActor`, `timeReactive` 같은 능력은 타입과 분리한다.

현재 기준 분류:

```text
decoration      나무, 수풀처럼 장식/충돌/파괴만 가진 물체
signage         광고판, 간판처럼 표시 내용을 교체할 수 있는 물체
building_shell  배치만 가능한 건물 외형
venue_anchor    입장, 채널, 실내 씬 계약이 붙은 건물
table           카지노 테이블처럼 착석/베팅 요청을 받는 물체
shop_shelf      상점 진열대, 칩교환 창구처럼 거래 후보가 되는 물체
vending_machine 자판기처럼 독립 상호작용을 가진 물체
vehicle         열쇠/면허/충돌/파괴 이벤트를 가진 이동 물체
door            씬 전환 또는 출입 상태 전환 지점
npc             시간/장소/상호작용 상태를 가진 캐릭터
collider        보이지 않거나 단순한 충돌 경계
```

중요한 경계:

- `building_shell`은 도시 위에 놓인 건물 외형일 뿐이며, 입장 가능 건물이 아니다.
- `venue_anchor`는 `doors`, `channels`, `venueId`, `interiorId`, `gameType` 같은 venue 계약이 붙은 뒤에만 된다.
- `destructible`은 타입이 아니라 capability다. 벤치, 가로등, 차량, 일부 간판은 모두 같은 파괴 규칙을 공유할 수 있다.
- 광고판은 `signage + advertises`이고, 광고 교체는 위치/충돌을 바꾸지 않는다.
- 칩교환소/카지노 테이블은 맵 배치보다 action/ledger 계약이 먼저다.

따라서 건물 카드 v0는 `building_shell` 배치까지만 구현하고, venue 입장/실내/경제/온라인 채널은 별도 루프에서 붙인다.

## 정적 맵, 런타임 상태, 사건 기록

정적 맵은 “원래 무엇이 어디에 있는가”만 가진다. 현재 상태와 사건은 분리한다.

```text
static map object  id, presetId, objectLayer, visual, collision, buildRules
runtime state      id, hp, destroyed, enabled, locked, ownerId, revision
event ledger       id, type, objectId, actorId, gameTime, channelId, payload
```

자동차가 벤치를 부수거나, 밤에 광고판 내용이 바뀌거나, 카지노 테이블에 베팅 예약이 생기는 일은 정적 맵을 직접 고치지 않는다. 런타임 상태와 사건 기록이 먼저 바뀌고, 저장/온라인 동기화는 그 기록을 기준으로 확장한다.

```js
placedObject = {
  schemaVersion: "world-object-001",
  id,
  presetId,
  objectLayer: "scenery",
  type,
  label,
  variant,
  adId,
  x,
  y,
  collision: {
    kind,
    shape,
    blocksPlayers,
    blocksVehicles
  },
  destructibleSpec: {
    enabled,
    maxHp,
    breakBy,
    destroyedCollision,
    debrisPreset
  },
  buildRules: {
    category,
    avoidEntrances,
    avoidSpawns
  },
  interactions: [
    { id, type, label, event }
  ],
  requiredItems: [
    { id: "vehicle_key:sedan-001", type: "vehicle_key" }
  ],
  state: {
    locked,
    enabled,
    ownerId,
    revision
  }
}
```

## 마스터 타입

`src/systems/world-object-master.js`는 향후 런타임 오브젝트를 아래 타입으로 정규화한다.

```text
vehicle
door
npc
shop_shelf
vending_machine
table
decoration
collider
```

자동차, 문, NPC, 쓰레기통, 자판기, 편의점 진열대, 카지노 테이블은 모두 이 구조를 공유한다. 차이는 `type`, `collision`, `interactions`, `requiredItems`, `state`로 표현한다.

## 런타임 상태

맵 원본과 현재 상태는 분리한다.

```js
objectRuntimeState = {
  id,
  hp,
  destroyed,
  lastDamageBy,
  revision
}
```

이 구조를 쓰면 자동차가 벤치를 부수거나, 폭발로 가로등이 쓰러지거나, 파괴 후 충돌이 사라지는 처리를 같은 규칙으로 확장할 수 있다.

## Current Implementation Note

- Current building shell presets are split by city role. `baegeum-city` shows `building-shop-shell`, `building-home-shell`, and `building-civic-shell`; `dice-city` shows `building-casino-shell`, `building-alley-shell`, `building-loan-shell`, and `building-motel-shell`.
- `baegeum-city` also exposes a `도시` build category with placement-only infrastructure shells for home, luxury home, convenience store, fast food, car dealer, gas station, department store, logistics center, police station, real estate, stock market, bus stop, and intercity bus terminal.
- These cards are placement-only `building_shell` objects and must not carry doors, channels, interiors, economy, or online metadata.
- City role placement now has a separate contract in `src/data/city-district-contract.js`. `src/tools/baegeum-world-editor-build.js` filters build presets with `canPlaceNewBuildingType(typeId, mapId)`. Existing baegeum casino anchors are only `legacy_preserved`, not permission to create new baegeum casino shells.
- Building shell size editability currently cycles compact, standard, and large dimensions while preserving the object center and collision rectangle.
- Building shell name/color editability uses `shellName` and `shellColor` as visual editor metadata only. These fields can be saved in world editor drafts, but they do not create venue anchors, doors, channels, interiors, economy, or online ownership.
- Venue metadata edits now flow through `readStoredVenueMetadata`, `writeStoredVenueMetadata`, and `upsertStoredVenueMetadata`. Those APIs normalize stored drafts to editable venue-owned fields only, while channels, room IDs, doors, and building rects stay derived from the base `venue_anchor` contract.
- `tools/smoke-venue-metadata-storage.cjs` covers this guardrail and is part of `npm run check`.

## 다음 단계

1. venue 메타데이터 편집을 월드 에디터에 붙이되 `building_shell`의 `shellName`/`shellColor` 외형 필드와 `venue_anchor`의 입장/채널/실내 계약 경계를 유지한다.
2. 기존 Iron Line 장식물도 가능한 범위에서 `presetId` 기반으로 정규화한다.
3. 카지노 테이블과 칩교환 창구를 `table`, `shop_shelf` 계열 오브젝트로 표현한다.
4. 차량은 `vehicle_key:*`와 `license:driver` 요구 조건을 가진 `vehicle`로 붙인다.
5. 차량 충돌 이벤트가 `destructibleSpec.breakBy`를 통해 피해를 적용하도록 런타임 시스템을 붙인다.
