# 배금도시 v2 맵 에디터 v1

결론: 맵 에디터 v1은 **Iron Line 원본 맵 데이터를 배금도시용으로 가져오되, 실제 게임 렌더러로 보면서 장식물/건물/도로를 직접 옮기는 월드 에디터**이다.

## 현재 구현

- `vendor/iron-line/`에 원본 Iron Line 에디터/맵 파일을 고정했다.
- `editor.html`은 배금도시 월드 에디터 화면으로 교체했다.
- 에디터는 `IronLine.Renderer`를 사용해 게임과 같은 도로, 장식물, 건물 렌더링을 보여준다.
- `장식물`, `건설`, `건물`, `도로`, `보기` 모드를 제공한다.
- `장식물` 모드에서는 `world.scenery` 항목을 선택하고 드래그해 옮긴다.
- `건설` 모드에서는 하단 건설 목록을 잠깐 열고, 카드를 선택하면 목록을 숨긴 뒤 맵 위 고스트 미리보기로 새 오브젝트를 배치한다.
- 건설 목록은 `고정`, `도시`, `건물`, `자연물`, `거리 시설`, `광고/간판` 접이식 그룹으로 나뉘며, 가로등/광고판/벤치를 상단 고정 프리셋으로 보여준다.
- `도시` 그룹은 배금시티 전용 인프라 배치 카드로 집, 고급집, 편의점, 패스트푸드점, 자동차매장, 주유소, 백화점, 물류센터, 경찰서, 부동산, 주식시장, 버스정류장, 시외버스터미널을 제공한다.
- 배치 중에는 작은 상태바만 남기고, 필요할 때 `목록` 버튼으로 건설 목록을 다시 연다.
- 현재 건설 카드는 빈 상가, 빈 카지노, 골목 상가, 활엽수, 침엽수, 가로등, 광고판, 벤치, 수풀을 제공한다.
- 건설 카드로 생성한 새 장식물과 배치 전용 건물은 `presetId`, `objectLayer`, `collision`, `destructibleSpec`, `buildRules`를 함께 가진다.
- 배치 검증은 맵 경계, 입구/스폰/거점 보호구역, 기존 건물/벽, 새 충돌 오브젝트, 도로 점유를 막고 상태 문구로 이유를 보여준다.
- 광고판은 `adId`로 표시 내용을 분리하며, 기존 흩어진 광고판은 `variant`를 기준으로 광고를 자동 배정한다.
- 광고판을 선택하면 하단 광고판 팔레트에서 `DIS Inside`, 카지노 야간, 수상한 대출, 거리 알바, 도시 경고 광고를 썸네일로 보고 바꿀 수 있다.
- 선택한 장식물/건물은 하단 액션바에서 좌표 잠금, 레이어 잠금, 원위치 복귀, 회전, 복제, 삭제를 바로 실행한다.
- 선택한 `building_shell` 건물은 하단 액션바에서 `크기` 버튼으로 소형/기본/대형을 순환하며, `w/h`와 충돌 범위만 함께 바꾼다.
- `원위치 복귀`는 원본 Iron Line 맵을 기준으로 선택한 장식물/건물의 위치와 모양을 되돌리며, 원본을 찾을 수 없는 새 복제 항목에서는 비활성화된다.
- 우측 패널은 선택 정보, 좌표, 기본 토글, 저장만 남기고 JSON/초기화/복사는 `고급` 영역으로 접었다.
- `충돌/파괴 레이어` 토글로 새 오브젝트의 실제 충돌 판정 범위를 확인할 수 있다.
- `건물` 모드에서는 `obstacles` 항목을 선택하고 드래그해 옮긴다.
- `도로` 모드에서는 도로 포인트를 직접 옮기거나, 도로 몸통을 잡아 전체 도로를 이동한다.
- `보기` 모드와 빈 공간 드래그로 카메라를 이동하고, 마우스 휠로 확대/축소한다.
- 선택 항목은 우측 패널에서 ID/타입을 확인하고 `x`, `y` 입력으로 좌표를 보정할 수 있다.
- 스냅은 40px 단위이며, 필요하면 패널에서 끌 수 있다.
- `되돌리기`/`다시 실행` 버튼과 `Ctrl+Z`, `Ctrl+Y`, `Ctrl+Shift+Z` 단축키로 최근 편집을 복구한다.
- 우측 패널의 작업 기록 영역은 현재 드래프트가 저장 기준과 달라졌는지 `저장 안 됨`/`저장됨`으로 보여준다.
- 작업 기록 영역은 저장 기준 대비 오브젝트 추가/삭제/수정, 도로점 변경, 기본 맵 크기 변경 요약을 함께 보여준다.
- 우측 패널은 `mapVersion`, `schemaVersion`, `editorRevision`, 오브젝트/도로 요약을 함께 보여준다.
- 우측 패널은 `activeMapId` 선택기를 보여주며, `배금시티`와 `다이스시티` 기본 맵을 전환해 편집할 수 있다.
- 현재 편집 맵에 저장 안 된 변경이 있으면 맵 전환을 막고 `저장 후 맵을 전환`하라는 상태 문구를 보여준다.
- 우측 패널은 저장 전 검증 리포트로 ID, 맵 밖 좌표, 충돌 겹침, 막힌 입구를 확인한다.
- 검증 리포트 상위 항목은 버튼처럼 눌러 해당 오브젝트 또는 도로점으로 이동하고 선택할 수 있다.
- 저장은 원본 맵 파일을 수정하지 않고 `activeMapId`별 `localStorage` draft key에 월드 드래프트를 저장한다.
- `baegeum-city`는 `baegeum-city-v2-world-editor-draft:baegeum-city`에 저장하고, 기존 `baegeum-city-v2-world-editor-draft-v0`은 읽기 fallback으로만 사용한다.
- `dice-city`는 `baegeum-city-v2-world-editor-draft:dice-city`에 저장하며, legacy draft fallback을 읽지 않는다.
- 저장 draft에는 `schemaVersion`, `draftVersion`, `source`, `baseMapVersion`, `editorRevision`, `summary`, `savedAt`이 포함된다.
- 새 건설 오브젝트는 `bench:0001`, `billboard:0001`, `building:0001` 같은 prefix ID를 사용한다.
- 기존 장애물/건물처럼 ID가 없는 오브젝트는 저장 draft 생성 시 `building:0001`, `obstacle:0001`, `wall:0001` 형태로 정규화된다.
- 게임은 시작 시 `src/data/world-editor-draft.js`를 통해 저장된 드래프트를 `cityMap`에 덮어쓴다.
- 게임 탭을 새로고침하면 에디터에서 저장한 배치가 실제 도시 맵에 반영된다.

## Vendored Source

원본 기준 commit:

```text
717f71e Add admin room slot controls and spectator cleanup
```

고정 파일:

- `vendor/iron-line/editor.html`
- `vendor/iron-line/map-editor.css`
- `vendor/iron-line/src/core/math.js`
- `vendor/iron-line/src/data/scenery-catalog.js`
- `vendor/iron-line/src/data/map01.js`
- `vendor/iron-line/src/data/map01-custom-layout.js`
- `vendor/iron-line/src/tools/map-editor-utils.js`
- `vendor/iron-line/src/tools/map-editor.js`

배금도시 확장 파일:

- `src/data/world-editor-draft.js`
- `src/data/world-map-contract.js`
- `src/data/world-map-validation-report.js`
- `src/data/billboard-ads.js`
- `src/data/world-object-presets.js`
- `src/data/world-placement-validation.js`
- `src/renderers/billboard-ad-renderer.js`
- `src/tools/baegeum-world-editor-actions.js`
- `src/tools/baegeum-world-editor-billboards.js`
- `src/tools/baegeum-world-editor-contract.js`
- `src/tools/baegeum-world-editor.js`
- `src/tools/baegeum-world-editor-build.js`
- `src/tools/baegeum-world-editor-utils.js`
- `src/styles/baegeum-world-editor.css`

## 검증 기준

`tools/check-iron-line-vendor.cjs`가 아래를 확인한다.

- vendor 파일 SHA-256 해시가 바뀌지 않았는가
- 최종 맵 폭이 `8200`인가
- 최종 맵 높이가 `5600`인가
- 도로가 `6`개인가
- 장애물이 `36`개인가
- 장식물이 `54`개인가
- NavGraph 노드가 `37`개인가
- NavGraph 엣지가 `49`개인가

Project-owned runtime/editor behavior then applies `baegeum-city-compact-layout-v2` from `src/data/baegeum-city-compact-layout.js`, so baegeum editing and gameplay use the compact height `2800` while the raw vendored Iron Line source remains fixed at `5600`.

## 실행

```powershell
npm start
```

브라우저:

```text
http://127.0.0.1:4173/editor.html
```

## 현재 한계

- 원본 `vendor/iron-line` 파일은 수정하지 않는다.
- 현재 드래프트 저장은 브라우저 `localStorage` 기준이며, 맵별 draft key로 분리한다.
- 새 장식물 배치와 선택 항목 회전/복제/삭제, 건설 목록 카테고리 접기는 가능하다.
- 건물 카드 v1는 `activeMapId`와 `buildingType` 계약으로 필터링된다. 배금시티에서는 `도시` 인프라 카드와 `빈 상가`, `빈 주택`, `빈 공공건물`이 보이고, 다이스시티에서는 `빈 카지노`, `골목 상가`, `빈 사채업소`, `빈 모텔`만 보인다.
- 모든 건물 카드는 배치 전용 `building_shell` 장애물이며, 선택 후 소형/기본/대형 크기 편집만 지원한다. 아직 입장, 실내, 경제, venue 메타데이터는 붙이지 않는다.
- `dice-city-v0` 기본 맵은 도로, 스폰, 빈 건물 셸, 장식물과 복사된 카지노 venue anchor 3개를 가진다. 현재 월드 에디터 draft는 도로/장식물/장애물 중심이며, 복사 카지노의 venue 메타데이터 편집은 별도 slice로 남긴다.
- 충돌/파괴 레이어는 현재 새 월드 오브젝트 프리셋 기반 장식물에 우선 적용된다.
- 저장 전 검증 리포트는 문제를 보여주지만 아직 저장을 차단하지는 않는다.
- 도박장 간판/입구/실내 씬 같은 venue 메타데이터 편집은 다음 단계에서 월드 에디터 안으로 다시 합쳐야 한다.
- 온라인 연결은 아직 실제 서버 없이 채널 ID와 상태 설계만 예약했다.

## 다음 단계

1. 건물 카드의 이름/색 편집이나 venue 메타데이터 편집을 붙이되, `building_shell`과 `venue_anchor` 경계를 유지한다.
2. venue 메타데이터 편집을 선택 액션/하단 팔레트 구조로 합친다.
3. 도로 폭, 도로 타입, 교차로 모양을 에디터에서 직접 조정할 수 있게 한다.
4. 2인 온라인 위치 동기화와 건물 입장 상태 테스트를 붙인다.
