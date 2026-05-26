# 배금도시 v2 오픈소스 참고 후보

결론: 현재 규칙은 **보류: 코드/엔진 직접 도입 금지, 참고/에셋/작은 알고리즘만 후보로 기록**이다.

## 사용 원칙

- 프로젝트 계약이 안정되기 전에는 엔진이나 큰 라이브러리를 바로 가져오지 않는다.
- CC0, MIT, Apache, BSD 계열을 우선 검토한다.
- GPL, NC, 출처 불명 자료는 코드/에셋을 직접 쓰지 않고 참고 전용으로 둔다.
- 모든 후보는 용도, 현재 상태, 가져올 시점, 위험을 같이 기록한다.
- 나중에 도입할 때도 본 코드에 바로 섞지 않고 adapter 또는 spike branch에서 먼저 검증한다.

## 후보 목록

### Tiled Map Editor

- 링크: https://www.mapeditor.org/
- JSON 문서: https://doc.mapeditor.org/en/stable/reference/json-map-format/
- 용도: 현재 맵을 외부 2D 맵 에디터에서 열 수 있게 하는 export/import 브리지 후보.
- 현재 상태: export-only spike는 가능하지만 import는 아직 보류.
- 가져올 시점: 자체 맵에디터가 커져서 외부 시각 편집/검증이 필요해질 때.
- 위험: import를 너무 빨리 만들면 Tiled schema와 런타임 맵 schema가 서로 어긋날 수 있다.

### Dead Valley

- 링크: https://github.com/dmcinnes/dead-valley
- 용도: 2D 탑다운 GTA식 도시, JSON 맵, 에디터 흐름 참고.
- 현재 상태: 참고 전용.
- 가져올 시점: 차량, 도시 이동감, 맵에디터 UX를 비교 검토할 때.
- 위험: CC BY-NC 4.0 성격이라 배포/상업 가능성을 고려하면 코드와 에셋 직접 사용은 피한다.

### Matter.js

- 링크: https://github.com/liabru/matter-js
- 용도: 차량 충돌, 파괴 가능한 벤치/가로등/간판 물리 후보.
- 현재 상태: 보류.
- 가져올 시점: 자동차가 실제로 오브젝트를 밀거나 부수는 v0 이후.
- 위험: 기존 충돌 시스템과 역할이 겹친다. 도입한다면 차량/파괴 레이어에만 adapter로 제한한다.

### Phaser Top-Down Car Example

- 링크: https://phaser.io/examples/v3.85.0/physics/matterjs/view/top-down-car-body
- 용도: 탑다운 자동차 조향, 마찰, 회전감 참고.
- 현재 상태: 참고 전용. Phaser 자체는 가져오지 않는다.
- 가져올 시점: 차량 조작감 프로토타입을 만들 때.
- 위험: 엔진 전환으로 번지면 현재 배금도시 구조가 흔들릴 수 있다.

### casino-server

- 링크: https://github.com/floatinghotpot/casino-server
- 용도: 서버 권위 도박방, Blackjack/Holdem/Rummy, socket.io/Redis 구조 참고.
- 현재 상태: 보류.
- 가져올 시점: 온라인 도박방과 서버 확정 베팅이 필요해질 때.
- 위험: 지금 붙이면 서버 범위가 너무 커진다. 현재는 ledger-first 로컬 구조가 우선이다.

### Shopkeepr

- 링크: https://npm.io/package/shopkeepr
- 용도: 상점, 재고, 구매/판매 API 참고.
- 현재 상태: 참고 전용.
- 가져올 시점: 칩교환소와 상점 UI가 `ledger` 계약 위에 올라간 뒤.
- 위험: 외부 상태 모델이 배금도시 `ledger`와 충돌할 수 있다.

### IsoCity

- 링크: https://github.com/victorqribeiro/isocity
- 용도: 도시 건설 배치 UX 참고.
- 현재 상태: 참고 전용.
- 가져올 시점: 건설 카드, 도로/건물 배치 UX를 더 게임처럼 만들 때.
- 위험: 등각 도시 빌더 감각이 배금도시 탑다운 구조와 다를 수 있다.

### 12x12 City Tiles - Top Down

- 링크: https://opengameart.org/content/12x12-city-tiles-top-down
- 용도: 도로, 건물, 표지판, 차량, NPC의 탑다운 도시 시각 참고 또는 CC0 에셋 후보.
- 현재 상태: 참고/에셋 후보. 실제 파일은 가져오기 전에 다시 확인한다.
- 가져올 시점: 건물 외형 규칙과 도로 타일 스타일을 정리할 때.
- 위험: 픽셀 크기와 시점이 현재 렌더러와 맞는지 검증이 필요하다.

### Kenney City Kit Roads / Kenney Assets

- 링크: https://www.kenney.nl/assets/city-kit-roads
- 전체 에셋: https://www.kenney.nl/assets
- 용도: 도로, 도시 오브젝트, 상점/건물 시각 참고. CC0 에셋 후보.
- 현재 상태: 참고/가능 에셋 후보.
- 가져올 시점: 배금도시 전용 `buildingStyle`과 도로/장식물 디자인 규칙을 만들 때.
- 위험: 3D/아이소메트릭 에셋은 바로 쓰기보다 2D 기준으로 다시 해석해야 한다.

## 우선순위

1. 지금은 목록만 만든다.
2. 칩교환소 전에는 Shopkeepr와 casino-server를 API/규칙 참고로만 본다. 구현은 `ledger`를 먼저 따른다.
3. 차량 전에는 간단한 kinematic vehicle부터 만든다. 충돌/파괴가 복잡해질 때 Matter.js를 다시 검토한다.
4. 건물 아트 패스 전에는 CC0 에셋을 참고해 배금도시식 절차적 `buildingStyle`을 만든다.

## 현재 결정

```js
{
  codeImport: false,
  assetImport: "maybe-after-art-rule",
  referenceStatus: "active",
  nextReview: ["chip-exchange", "vehicle-v0", "building-style-v0"]
}
```
