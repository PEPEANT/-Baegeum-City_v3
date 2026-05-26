# 배금도시 v2 Economy Master

결론: 카지노, 칩교환소, 은행, 주식, 랭킹, 관리자 기능은 모두 `cash / bank / chips / ledger` 계약을 먼저 따른다.

## 목적

배금도시 v2에서 돈은 단순 HUD 숫자가 아니다. 돈은 도박 베팅, 칩 교환, 폰 은행, 주식, 랭킹, 관리자 보정, 환불, 재접속 복구의 기준이다. 그래서 기능별 UI가 각자 돈을 바꾸면 안 되고, 모든 변화는 경제 계약을 거쳐야 한다.

## 현재 필드

현재 플레이어 경제 상태는 `src/systems/player-economy-state.js`가 소유한다.

```js
{
  economyVersion: "economy-state-001",
  cash: 100000,
  bank: 0,
  chips: 0,
  stamina: 100,
  energy: 100,
  hunger: 100,
  hungerMax: 100,
  bagSlots: 12,
  inventory: []
}
```

## 필드 의미

- `cash`: 플레이어가 즉시 쓸 수 있는 게임 내 현금이다.
- `bank`: 폰 은행/계좌 앱에서 관리할 게임 내 예치금이다.
- `chips`: 카지노 테이블에서만 쓰는 게임 내 칩이다.
- `inventory`: 음식, 교환권, 이벤트 아이템처럼 물건으로 존재하는 항목이다.

금지:

- 실제 화폐, 결제, 포인트, 암호화폐와 연결하지 않는다.
- `cash`, `bank`, `chips`를 음수로 저장하지 않는다.
- 카지노 베팅이 `cash`를 직접 깎지 않는다.
- UI 컴포넌트가 잔고를 직접 확정하지 않는다.

## 변경 경로

현재 허용되는 경로는 두 가지다.

- `record(entryInput)`: 경제 변화의 정식 경로. ledger entry를 만들고 상태에 적용한다.
- `update(patch)`: 로컬 디버그/임시 UI 확인용. 칩교환소, 카지노, 은행, 주식에서는 사용하지 않는다.

향후 온라인에서는 `record(entryInput)`도 클라이언트 확정이 아니라 서버 요청으로 바뀐다. 서버가 승인한 ledger entry만 클라이언트 HUD에 반영한다.

## 우선 구현 순서

1. `cash -> chips` 칩교환소
2. `chips -> cash` 칩환전
3. 테이블 착석 상태
4. `bet_reserved` 베팅 예약
5. `bet_settled` 승패 정산
6. ledger 기반 랭킹 집계
7. 폰 은행/주식 앱 연결

## 검증 기준

`npm run check`는 아래를 확인한다.

- 기본 `cash`, `bank`, `chips`가 음수로 저장되지 않는다.
- 칩교환은 `cash`와 `chips`가 반대 방향으로 움직여야 한다.
- 베팅 예약은 `chips`만 음수로 예약할 수 있다.
- 베팅 정산은 `chips`를 음수로 만들 수 없다.
- 아이템 지급은 양수 아이템 delta만 허용한다.

## 다음 문서

- `baegeum-city-v2-economy-ledger.md`: append-only ledger entry 상세 규칙
- `baegeum-city-v2-inventory-master.md`: 인벤토리/아이템 상세 규칙
