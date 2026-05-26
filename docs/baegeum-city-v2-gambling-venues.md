# 배금도시 v2 도박장 건물 설계

결론: 배금도시의 건물은 단순 실내가 아니라 `도박장 종류`, `한국어 간판`, `입구`, `실내 씬`, `온라인 방 ID`를 가진 장소 단위로 관리한다.

## 현재 구현

- Iron Line 원본 건물 장애물 13개를 배금도시 도박장으로 분류한다.
- 각 건물 위에는 한국어 간판을 그린다.
- 각 건물 입구는 `E` 키로 별도 실내 씬에 들어간다.
- 실내 씬은 아직 실제 도박 게임이 아니라 전용 테이블/창구/대기석이 있는 준비 공간이다.
- 카지노 테이블 근처에서 `E` 또는 모바일 `ACTION`을 누르면 `table_seated` 상태가 되고, 다시 누르면 `venue_lobby`로 돌아온다.
- 홀짝카지노 테이블에 앉으면 홀/짝 선택과 10/50/100칩 선택 UI가 표시된다. 시작 버튼은 `bet_reserved`로 칩을 예약하지만, 결과/승패/정산은 아직 실행하지 않는다.
- 모든 도박장 실내에는 `환전 ATM`을 기본 배치한다. 근처에서 `E` 또는 모바일 `ACTION`을 누르면 바로 교환하지 않고 ATM 패널만 연다.
- ATM 패널은 DiceLand 환전 규칙처럼 10/50/100칩 단위로 `cash -> chips`, `chips -> cash`를 선택하고, 버튼을 누를 때만 ledger를 기록한다.
- 실제 온라인 서버는 아직 붙이지 않았지만, 각 건물은 `onlineRoomId`를 미리 가진다.
- `editor.html`의 배금도시 확장 패널에서 간판, 입구, 실내 씬, 온라인 채널을 편집할 수 있다.

## Dice-city copied venue anchors

Current rule: dice-city has copied casino anchors, while baegeum-city originals remain untouched.

- `bg-dice-blackjack-casino-01` copies `blackjack-casino`.
- `bg-dice-odd-even-casino-01` copies `odd-even-casino`.
- `bg-dice-horse-track-01` copies `horse-track`.
- All copied venues use `channels.world = world:dice-city`.
- Copied venues reuse existing base interiors first, so blackjack, odd-even, and horse-racing interior behavior stays consistent.
- Dice-city `building_shell` objects are not trusted as venue metadata and must stay placement-only until a separate venue-anchor editor slice exists.
- `tools/smoke-casino-copy-contract.cjs` guards the migration rule: source casinos remain in baegeum-city, copied casinos use separate ids/doors/channels/online rooms, and only signs, game types, and proven interiors are reused.
- Browser verification has confirmed `?map=dice-city&spawn=dice-blackjack-casino-01` detects the copied blackjack door and enters `블랙잭카지노` with `chat: venue:dice-blackjack-casino-01`.
- Dice-city casino street v1 now renders scenery through `src/renderers/simple-scenery-renderer.js`, including extra frontage road, streetlights, and billboards around the copied venues.

## 1차 도박장 종류

- `블랙잭카지노`: 블랙잭 테이블
- `홀짝카지노`: 홀짝 테이블
- `경마장`: 경마 중계/마권 창구
- `룰렛카지노`: 룰렛 테이블
- `슬롯카지노`: 슬롯 머신
- `바카라카지노`: 바카라 테이블
- `포커룸`: 포커 테이블
- `주사위카지노`: 주사위 테이블
- `복권방`: 복권 판매대
- `칩교환소`: 현금/칩 교환 지원 시설
- `사설토토`: 경기 배팅 접수대
- `하이로우카지노`: 하이로우 카드 테이블
- `VIP카지노`: 고액 배팅 전용 공간

## 데이터 규칙

건물 메타데이터는 `src/data/gambling-venues.js`에서 관리한다.

```js
{
  id: "blackjack-casino",
  sign: "블랙잭카지노",
  gameType: "blackjack",
  minBet: 1000,
  venueType: "gambling",
  entrance: { x: 4008, y: 1678 },
  signAnchor: { x: 4008, y: 1636 },
  interiorId: "interior-blackjack-casino",
  onlineRoomId: "venue:blackjack-casino-01",
  channels: {
    world: "world:baegeum-city",
    venue: "venue:blackjack-casino-01",
    table: "table:blackjack-casino-01:main",
    spectator: "spectator:blackjack-casino-01",
    admin: "admin:blackjack-casino-01"
  }
}
```

## Current metadata edit guardrail

Venue metadata drafts are stored through `readStoredVenueMetadata`, `writeStoredVenueMetadata`, and `upsertStoredVenueMetadata` in `src/data/gambling-venues.js`.

The stored draft may keep only editable venue-owned fields: `id`, `sign`, `gameType`, `venueType`, `minBet`, `entrance`, `signAnchor`, and `interiorId`.

`channels`, `onlineRoomId`, `doorId`, and `rect` are not trusted from stored drafts. They stay derived from the base venue contract during `mergeVenueMetadata`.

규칙:

- 원본 Iron Line 맵 파일은 수정하지 않는다.
- 간판, 입구, 도박장 종류는 배금도시 런타임 레이어에서 얹는다.
- 실제 도박 결과와 돈 계산은 나중에 서버 권위 구조로 옮길 수 있게 `onlineRoomId` 기준으로 분리한다.
- 플레이어, 관전자, 관리자, 테이블 참가자가 섞이지 않도록 채널 ID는 처음부터 분리한다.
- 랭킹은 건물 자체가 아니라 플레이어의 베팅 기록과 손익 기록에서 계산한다.
- 온라인 상태 전이와 서버 권위 규칙은 `docs/baegeum-city-v2-online-state-protocol.md`를 따른다.
- 미니게임/환전 UI 참고는 고정 vendor인 `vendor/diceland`를 먼저 본다. 특히 `src/features/exchange/exchangeRules.js`의 10/50/100칩 옵션, ATM형 환전 모달, `roulette`의 odd/even 베팅 UI를 기준으로 삼는다.

## 다음 구현 순서

1. 홀짝카지노 첫 결과 처리는 `bet_refunded`/`bet_settled` 결과만 사용한다.
2. 그 다음 랭킹 HUD는 `ledger`를 읽어서 표시한다.
3. 관전자 채널은 테이블 착석과 분리해서 붙인다.

## 경마장 실내 디자인 초안

현재 규칙: `interior-horse-track`은 맵 디자인 전용 실내다.

- 제공된 경마장 HTML 초안은 캔버스 오브젝트 `horse-scoreboard`, `horse-track`, `horse-grandstand`, `horse-betting-station`으로 옮긴다.
- 경마장 안에도 기본 `exchange-atm`을 둬서 플레이어가 도박장 내부에서 현금/칩 흐름을 테스트할 수 있게 한다.
- 전광판, 참가마 목록, 배당률, 트랙 레인, 관람석, 티켓/배팅 창구는 현재 시각적 레이아웃만 담당한다.
- 경주 시뮬레이션, 배당 정산, 지급 ledger, 랭킹 반영, 온라인 방 권위는 별도 경마 라운드 계약이 생기기 전까지 붙이지 않는다.
