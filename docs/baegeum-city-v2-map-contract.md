# 배금도시 v2 맵 계약

결론: 에디터 드래프트와 인게임 런타임 맵은 같은 데이터를 쓰더라도 **스키마 버전, 원본 맵 버전, 에디터 리비전, 요약 검증 정보**를 항상 함께 가진다.

## 목적

맵에디터, 인게임, 온라인/경제 작업이 여러 흐름에서 동시에 진행되면 구버전 드래프트가 새 런타임을 덮을 수 있다. 그래서 저장물에는 사람이 보는 좌표 데이터뿐 아니라, 어떤 계약으로 저장됐는지 확인할 수 있는 메타데이터가 필요하다.

## 현재 구현

- `src/data/world-map-contract.js`가 맵 계약 상수와 요약/검증 함수를 가진다.
- 현재 `schemaVersion`은 `world-map-001`이다.
- 현재 `draftVersion`은 `1`이다.
- 현재 `source`는 `baegeum-world-editor`이다.
- `src/data/world-editor-draft.js`는 드래프트 생성 시 계약 메타데이터를 함께 저장한다.
- 드래프트 생성 시 기존 장애물/건물처럼 ID가 없는 오브젝트는 `building:0001`, `obstacle:0001`, `wall:0001` 같은 계약형 ID로 자동 정규화한다.
- 새 건설 오브젝트는 `bench:0001`, `billboard:0001`, `streetlight:0001`, `tree:broadleaf:0001` 같은 prefix ID를 쓴다.
- `src/data/world-map-validation-report.js`는 저장 전 검증 리포트를 만든다.
- 에디터 우측 패널은 `mapVersion`, `schemaVersion`, `editorRevision`, 요약 상태를 보여준다.
- 에디터 우측 패널은 저장 전 `ID`, 맵 밖 좌표, 충돌 겹침, 막힌 입구 검증 결과를 보여준다.
- 검증 리포트 상위 항목을 클릭하면 해당 오브젝트 또는 도로점으로 이동하고 선택한다.
- `tools/smoke-world-editor-draft-contract.cjs`가 드래프트 계약이 깨지지 않는지 확인한다.

## Draft 형태

```js
{
  schemaVersion: "world-map-001",
  draftVersion: 1,
  source: "baegeum-world-editor",
  id: "map01",
  mapVersion: "2026-05-22",
  baseMapVersion: "2026-05-22",
  editorRevision: 3,
  savedAt: "2026-05-26T12:00:00.000Z",
  summary: {
    width: 8200,
    height: 2800,
    roads: 6,
    roadPoints: 37,
    obstacles: 36,
    scenery: 54,
    navNodes: 37,
    navEdges: 49,
    contractIds: 36,
    legacyIds: 54,
    missingIds: 0,
    invalidIds: [],
    duplicateIds: []
  }
}
```

## Compact layout note

Current `baegeum-city` editor/runtime maps apply `baegeum-city-compact-layout-v2` after loading the fixed Iron Line vendor source. Raw vendor verification still expects `8200 x 5600`, but project-owned baegeum drafts should now summarize height `2800` after the compact transform.

## Urban visual note

Current `baegeum-city` editor/runtime maps also apply `baegeum-city-urban-layout-v1` through the same project-owned layout path. This is a city reskin layer, not a vendor edit.

The urban layer:

- Replaces the dark battle-green terrain with muted pavement/soil tones.
- Uses warmer asphalt road styling.
- Places a layout-owned city infrastructure block set: 집, 고급집, 편의점, 패스트푸드점, 자동차매장, 주유소, 백화점, 물류센터, 경찰서, 부동산, 주식시장, 버스정류장, 시외버스터미널.
- Keeps those infrastructure buildings as `building_shell` obstacles plus sign-only runtime labels; they do not add doors, venue channels, interiors, or economy behavior.
- Removes combat `capturePoints`, red/blue `safeZones`, and old base exit markers from the city view.
- Replaces legacy `base-wall` obstacles with `city-boundary` outer wall/tunnel obstacles.
- Removes battlefield scenery types `sandbag`, `barricade`, and `rubble`.
- Keeps the transform after draft loading so stale baegeum drafts do not reintroduce visible enemy/ally base walls.
- Keeps non-combat city maps from reusing Iron Line combat overlay fields for visible UI. Bus terminals and spawn protection should use map-transition/spawn data, not `safeZones`, `capturePoints`, `baseExitPoints`, or `base-wall` labels.

`tools/smoke-baegeum-city-urban-layout.cjs` guards that the city view has no legacy `base-wall`, no combat zone/base-exit overlays, city-boundary tunnel walls, and no editor collision warnings for intentional city-boundary corner joins.

## 규칙

- `schemaVersion`은 드래프트 구조가 바뀔 때 올린다.
- `draftVersion`은 에디터 저장 형식이 바뀔 때 올린다.
- `mapVersion`은 이 드래프트가 대상으로 삼는 맵 버전이다.
- `baseMapVersion`은 드래프트가 출발한 원본 맵 버전이다.
- `editorRevision`은 저장된 편집본의 리비전이다.
- `summary`는 저장 전후 검증과 디버깅을 위한 빠른 지도 지문이다.
- 비교용 draft snapshot은 `savedAt`을 빼고 만든다. 시간 때문에 undo/redo dirty 판정이 흔들리면 안 된다.
- 에디터가 새로 만든 오브젝트 ID는 사람이 읽을 수 있는 prefix와 4자리 번호를 쓴다.
- 기존 Iron Line 원본 ID는 `legacyIds`로 인정하되, 새로 저장되는 ID 없는 장애물은 계약형 ID로 바꾼다.

## ID Prefix

현재 허용하는 새 오브젝트 prefix:

```text
tree:broadleaf
tree:pine
streetlight
billboard
bench
brush
scenery
building
obstacle
wall
```

예:

```text
bench:0001
billboard:0001
tree:broadleaf:0001
building:0001
wall:0001
```

## 찾은 리스크

- 기존 Iron Line `obstacles`에는 ID가 없었다.
- 지금은 인덱스로 이동할 수 있지만, 나중에 파괴/온라인/저장 diff가 붙으면 같은 장애물을 추적할 수 없다.
- 그래서 draft 생성 단계에서 ID 없는 장애물을 자동 정규화하도록 했다.
- 기본 맵의 `base-wall` 일부는 의도적으로 맞물려 있으므로 충돌 겹침 리포트에서 제외한다.

## 저장 전 검증 리포트

현재 리포트가 보는 항목:

- 지원하지 않는 스키마/미래 draft 버전/맵 크기 오류
- 중복 ID, 잘못된 ID, ID 누락
- 맵 밖 오브젝트와 맵 밖 도로점
- 충돌 오브젝트끼리 겹친 경우
- 건물 입구 주변이 다른 충돌 오브젝트로 막힌 경우

## 다음 단계

1. published map과 local draft 저장소를 명확히 분리한다.
2. road/entrance/venue ID도 같은 prefix 계약으로 확장한다.
3. 저장 전 검증 리포트가 저장을 차단해야 하는 조건을 정한다.
