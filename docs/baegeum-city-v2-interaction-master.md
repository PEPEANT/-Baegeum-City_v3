# 배금도시 v2 Interaction Master

결론: 플레이어가 문, 자동차, NPC, 테이블, 자판기, 편의점 진열대를 만나는 흐름은 모두 같은 상호작용 후보 규칙을 따른다.

## 목적

앞으로 배금도시에는 “E로 입장”, “ACTION으로 테이블 앉기”, “차키로 차량 열기”, “자격증 없으면 운전 불가”, “편의점 음식 구매”, “NPC와 대화” 같은 행동이 늘어난다. 기능마다 따로 만들면 모바일/온라인/관리자/관전자 상태가 금방 꼬인다.

그래서 모든 상호작용은 아래 흐름을 따른다.

```text
근처 후보 수집
-> 거리/충돌/상태 검사
-> requiredItems 검사
-> PC E 또는 모바일 ACTION
-> GameAction 생성
-> GameEffect 적용
```

## 현재 구현

현재 기준 모듈:

```text
src/systems/interaction-master.js
```

도시 맵 이동 후보는 `src/systems/map-transition-interaction.js`에서 만든다. 현재 구현된 후보는 배금시티 `intercity-bus-terminal`의 `다이스시티로 이동`과 다이스시티 `dice-return-bus-terminal`의 `배금시티로 이동`이다.

현재 버전:

```text
interaction-001
```

## 후보 형태

```js
{
  schemaVersion: "interaction-001",
  id: "drive:vehicle-sedan-001",
  type: "drive",
  label: "운전",
  targetId: "vehicle-sedan-001",
  targetLabel: "낡은 세단",
  requiredItems: [
    { id: "license:driver", type: "license" },
    { id: "vehicle_key:sedan-001", type: "vehicle_key" }
  ],
  enabled: true,
  disabledReason: null
}
```

## 상호작용 타입

```text
enter       건물/실내 입장
exit        실내/건물 나가기
talk        NPC 대화
use         일반 사용
buy         구매
sit_table   카지노/테이블 착석
drive       차량 운전
map_transition 도시/맵 이동
```

## 핵심 규칙

- PC `E`와 모바일 `ACTION`은 같은 후보를 실행한다.
- 후보는 UI 표시 전에 `enabled`, `requiredItems`, `disabledReason`을 가진다.
- 요구 아이템은 `Inventory Master`의 id/type을 사용한다.
- 관전자/관리자/좌석 상태에 따라 후보가 비활성화될 수 있다.
- 온라인에서는 클라이언트가 결과를 확정하지 않고 `GameAction` request만 보낸다.
- 실제 결과는 `Game Action / Effect Master`의 effect로만 적용한다.

## 다음 구현 기준

1. 현재 `nearbyDoor` 입장/나가기를 interaction candidate로 감싼다.
2. 현재 카지노 내부 테이블은 `sit_table` candidate로 표시되고 `table_seated` 상태로 연결된다.
3. 현재 `table_seated` 상태에서는 `일어나기` candidate로 `venue_lobby`에 돌아온다.
4. 현재 칩교환소 창구는 `use` candidate로 표시되고 `exchange_chips` action으로 연결된다.
5. 차량은 `drive` candidate로 만들고 `license:driver`, `vehicle_key:*`를 요구한다.
6. 편의점 진열대는 `buy` candidate로 만들고 결과는 economy ledger + inventory delta로 남긴다.
7. 버스터미널은 `map_transition` candidate로 만들고, v0에서는 요금/티켓/시간표 없이 `mapId`, `sceneId`, `spawnId`, `chatChannelId`만 바꾼다. 배금시티와 다이스시티 왕복 모두 같은 후보/액션 구조를 쓴다.
