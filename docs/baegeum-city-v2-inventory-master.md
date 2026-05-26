# 배금도시 v2 Inventory Master

결론: 인벤토리는 카지노 보상, 음식, 교환권, 이벤트 아이템을 담는 공통 저장소이며, 모든 아이템은 `id / type / count / stack / source` 계약을 따른다.

## 목적

칩교환소와 카지노를 붙이기 전에 가방 규칙이 필요하다. 음식은 배고픔에, 교환권은 칩/보상에, 입장권은 건물/테이블 접근에, 이벤트 아이템은 퀘스트와 랭킹에 연결될 수 있다. 그래서 단순 문자열 배열이 아니라 정규화된 아이템 객체로 다룬다.

## 현재 구현

현재 기준 모듈:

```text
src/systems/inventory-master.js
```

현재 버전:

```text
inventory-001
```

## 아이템 형태

```js
{
  id: "food:triangle-gimbap",
  type: "food",
  name: "삼각김밥",
  count: 2,
  maxStack: 10,
  stackable: true,
  consumable: true,
  tradeable: true,
  source: "convenience-store",
  description: "배고픔 회복용 음식"
}
```

## 타입

```text
food      음식, 배고픔/에너지 회복
ticket    입장권, 경마장/이벤트/특수 테이블 접근
token     교환권, 칩/보상/쿠폰
license   자격증, 운전면허/직업 자격 같은 권한
quest     이벤트 진행 아이템
key       열쇠, 특정 공간 접근
vehicle_key 차량 소유/사용 키
material  제작/교환 재료
misc      기타
```

## 핵심 규칙

- 아이템 id는 `type:name` 형태의 영문 소문자 시스템 ID를 사용한다.
- UI 표시 이름은 `name`에 둔다.
- `food`는 기본 `maxStack: 10`, `consumable: true`다.
- `key`, `quest`, `license`, `vehicle_key`는 기본 `maxStack: 1`, `tradeable: false`다.
- `license`는 `ownership: "permission"`으로 권한을 뜻한다.
- `vehicle_key`는 `ownership: "vehicle"`로 차량 소유/사용 권한을 뜻한다.
- `token`, `ticket`, `material`, `misc`는 기본적으로 거래 가능하다.
- 같은 id의 stackable 아이템은 한 슬롯으로 합친다.
- `bagSlots`를 넘는 새 슬롯 추가는 막는다.
- 아이템 증감은 economy ledger의 `itemDeltas`로 기록한다.

## UI 연결

현재 가방 UI는 MammonCity 원본 구조의 `inventory-panel`을 사용한다.

현재 표시:

- 슬롯 사용량
- 현재 칩
- 전체 탭
- 아이템 이름
- 아이템 타입 라벨
- 수량

## 다음 구현 기준

1. 음식 사용은 `itemDeltas: [{ count: -1 }]`와 hunger 회복을 같이 처리한다.
2. 칩교환권은 `token`으로 만들고, 칩교환소에서 `chip_exchange`와 함께 처리한다.
3. 카지노 보상 아이템은 `item_granted` entry로만 지급한다.
4. 관리자 지급은 `admin_adjustment`와 auditLog에 같이 남긴다.
5. 인벤토리 거래/양도는 온라인 서버 권위가 생기기 전까지 만들지 않는다.
