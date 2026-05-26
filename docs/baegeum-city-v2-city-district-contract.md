# 배금도시 v2 도시 구역 계약

Conclusion: `baegeum-city`는 생활/허브 도시, `dice-city`는 도박/밤거리/위험 구역으로 고정한다. 새 건물 배치는 이 역할 계약을 먼저 통과해야 한다.

## 목적

멀티맵이 생긴 뒤 가장 큰 위험은 AI가 다시 모든 건물을 한 도시 안에 섞는 것이다. 이 문서는 배금시티와 다이스시티가 어떤 역할을 갖는지, 어떤 건물이 어느 도시에서 새로 배치될 수 있는지 고정한다.

이 계약은 현재 남아 있는 원본 카지노를 즉시 삭제하라는 뜻이 아니다. 배금시티의 기존 카지노는 이전 검증이 끝날 때까지 `legacy_preserved` 상태로 남기고, 새 카지노 배치는 다이스시티에만 허용한다.

## 현재 역할

```text
baegeum-city
roleId: life_hub
meaning: 생활 / 허브 / 합법 경제 / 주거 / 교통
worldChannelId: world:baegeum-city
```

```text
dice-city
roleId: gambling_night
meaning: 도박 / 밤거리 / 위험 / 불법 경제 / 고위험 보상
worldChannelId: world:dice-city
```

`src/data/map-registry.js`의 각 map config는 `cityRoleId`를 가진다. 세부 계약은 `src/data/city-district-contract.js`가 가진다.

## 배금시티 건물 규칙

새로 배치 가능한 건물:

- `home`: 집
- `luxury_home`: 고급집
- `convenience_store`: 편의점
- `fast_food`: 패스트푸드점
- `police_station`: 경찰서
- `real_estate`: 부동산
- `stock_market`: 주식시장
- `bus_stop`: 버스정류장
- `intercity_bus_terminal`: 시외버스터미널

임시 보존만 허용되는 건물:

- `blackjack_casino`
- `odd_even_casino`
- `horse_track`

주의: 위 3개는 기존 원본 카지노를 안전하게 이전하기 위한 보존 상태다. 새 배금시티 배치 프리셋이나 새 venue anchor로 만들면 안 된다.

## 다이스시티 건물 규칙

새로 배치 가능한 건물:

- `blackjack_casino`: 블랙잭카지노
- `odd_even_casino`: 홀짝카지노
- `horse_track`: 경마장
- `chip_exchange`: 칩교환소
- `loan_office`: 사채업소
- `pawnshop`: 전당포
- `motel`: 모텔
- `nightlife`: 유흥업소
- `back_alley`: 뒷골목
- `intercity_bus_terminal`: 귀환 터미널

새로 배치하면 안 되는 건물:

- `home`
- `luxury_home`
- `police_station`
- `stock_market`
- `bus_stop`

다이스시티에도 `intercity_bus_terminal`은 허용한다. 이유는 왕복 이동을 위해 귀환 터미널이 필요하기 때문이다.

## 구역 계약

배금시티 구역:

- `baegeum-residential`: 집, 고급집, 편의점
- `baegeum-civic`: 경찰서, 부동산, 주식시장
- `baegeum-commerce`: 편의점, 패스트푸드점, 부동산
- `baegeum-transport`: 버스정류장, 시외버스터미널

다이스시티 구역:

- `dice-casino-strip`: 블랙잭카지노, 홀짝카지노, 경마장, 칩교환소
- `dice-back-alley`: 사채업소, 전당포, 뒷골목
- `dice-nightlife`: 모텔, 유흥업소
- `dice-support`: 칩교환소, 시외버스터미널

## 코드 계약

`src/data/city-district-contract.js`는 다음 함수를 제공한다.

```js
getCityRoleConfig(mapId)
buildingTypeStatusForMap(typeId, mapId)
canPlaceNewBuildingType(typeId, mapId)
districtAllowedInMap(districtId, mapId)
defaultDistrictForBuildingType(typeId, mapId)
```

상태 의미:

```text
new_allowed       새 배치 가능
legacy_preserved  기존 원본 보존만 가능
blocked           새 배치 금지
```

`tools/smoke-city-district-contract.cjs`가 이 규칙을 검증한다.

## 다음 구현 순서

1. 맵에디터 건물 프리셋을 생활/위험 역할별로 나눈다.
2. 배금시티 생활구역 v1을 배치한다.
3. 다이스시티 카지노 거리/뒷골목 v1을 배치한다.
4. 각 건물에 PC `E` / 모바일 `ACTION` skeleton만 붙인다.
5. 실제 기능은 편의점/칩교환소/주식시장/사채업소 순서로 별도 ledger/action 계약을 통해 붙인다.

## 금지 순서

- 이 계약 없이 건물 프리셋을 늘리지 않는다.
- 배금시티에 새 카지노 프리셋을 만들지 않는다.
- 다이스시티에 주거/경찰/주식시장 프리셋을 만들지 않는다.
- 기존 배금시티 카지노를 바로 삭제하지 않는다.
- 도박 결과, 사채, 전당포, 주식 정산을 클라이언트 단독 계산으로 붙이지 않는다.
