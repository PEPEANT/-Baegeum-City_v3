# 배금도시 v2 경제 Ledger 설계

결론: 현금, 계좌, 칩, 아이템 변화는 현재 잔고만 바꾸지 말고 append-only ledger entry로 먼저 남긴다.

## 목적

배금도시는 도박장, 칩교환소, 랭킹, 관리자 페이지가 모두 돈을 건드린다. 그래서 UI가 직접 돈을 확정하면 온라인 전환 때 베팅 중복, 잔고 불일치, 랭킹 조작, 환불 누락이 생긴다.

현재 로컬 구현은 `src/systems/economy-ledger.js`에 entry 생성/저장/검증/투영 함수를 둔다. 실제 온라인에서는 같은 entry 형식을 서버가 확정하고 클라이언트는 요청만 보낸다.

## 현재 구현

현재 storage key:

```text
baegeum-city:v2:economy
baegeum-city:v2:economy-ledger
```

현재 entry 버전:

```text
economy-ledger-001
```

현재 허용 entry type:

```text
economy_init
cash_grant
chip_exchange
bet_reserved
bet_refunded
bet_settled
item_granted
admin_adjustment
```

## Entry 형태

```js
{
  id: "ledger:player:local:20260525193000",
  version: "economy-ledger-001",
  type: "chip_exchange",
  actorId: "player:local",
  authority: "local-prototype",
  deltas: { cash: -10000, bank: 0, chips: 10 },
  itemDeltas: [],
  reason: "칩 교환소",
  channelId: "world:baegeum-city",
  venueId: "chip-exchange",
  tableId: null,
  roundId: null,
  mapVersion: "baegeum-city-v2-map-001",
  createdAt: "2026-05-25T19:30:00.000Z",
  serverTimeMs: null
}
```

## 핵심 규칙

- `cash`, `bank`, `chips`는 delta로만 기록한다.
- 잔고가 음수가 되는 entry는 적용하지 않는다.
- 없는 아이템을 음수 count로 제거하지 않는다.
- `chip_exchange`는 `cash`와 `chips`가 반드시 반대 방향으로 움직여야 한다.
- `bet_reserved`는 `chips`만 음수로 예약할 수 있고 `cash`, `bank`를 직접 건드릴 수 없다.
- `bet_refunded`는 `chips`만 양수로 돌려준다.
- `bet_settled`는 `chips`를 0 또는 양수로만 반영한다.
- `item_granted`는 양수 아이템 delta만 허용한다.
- 도박 결과, 베팅 확정, 랭킹 반영은 나중에 서버 authority만 신뢰한다.
- 클라이언트 localStorage ledger는 오프라인 프로토타입과 UI 검증용이다.
- 관리자 지급/차감은 `admin_adjustment`로 남기고, 온라인에서는 별도 `auditLog`도 같이 남긴다.

## UI 연결

`src/ui/player-status-hud.js`는 `window.BaegeumCity.economy`에 아래 API를 노출한다.

```js
getState()
getLedger()
record(entryInput)
update(patch)
```

`record(entryInput)`은 ledger entry를 만든 뒤 현재 HUD 상태에 적용한다. `update(patch)`는 로컬 디버그/임시 표시용이며 도박 구현에서는 사용하지 않는다.

## 현재 연결 상태

- 도박장 실내 `환전 ATM` 근처에서 `E` 또는 모바일 `ACTION`을 누르면 ATM 패널만 열린다.
- ATM 버튼을 누를 때 `exchange_chips` action이 생성되고, 해당 action의 `economy_ledger_entry` effect가 `chip_exchange` entry를 남긴다.
- 현재 고정 교환 비율은 DiceLand 기준과 맞춘 1칩 = 1,000원이며, 선택 단위는 10/50/100칩이다.
- `cash -> chips`, `chips -> cash` 모두 같은 `chip_exchange` entry를 쓰고, 현금 또는 칩이 부족하면 ledger entry를 만들지 않는다.
- 홀짝카지노 테이블 시작 버튼은 현재 `bet_reserved` action만 만들고, `chips` 음수 ledger entry로 베팅 칩을 예약한다.
- 홀짝 결과, 환불, 정산, 랭킹 반영은 아직 연결하지 않는다.

## 다음 구현 기준

1. 승패 결과는 `bet_refunded`/`bet_settled`로만 반영한다.
2. 랭킹은 현재 잔고가 아니라 ledger 집계 결과를 기준으로 만든다.
