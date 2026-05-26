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

## Restored gambling replacement rule

Current rule: the restored build's existing gambling code is legacy scaffolding, not the system to extend.

The human direction is to replace the old Dice City gambling layer with a new venue-by-venue system. Treat the current odd-even, blackjack, casino tab, and copied venue behavior as reference/prototype material only until each game has its own restored contract.

Replacement order:

1. Keep Dice City split into separate places first: casino street, pawnshop, loan office, hotel, and later individual casino interiors.
2. For each gambling game, write a small restored contract before UI work: rules, bet input, result event, ledger effect, emotional event hook, and online authority boundary.
3. Build each game as a separate module under `src/restored/games/` or a narrower restored gambling folder, not as more inline HTML script.
4. Use DiceLand and the current Dice City code as visual/reference material, not as copy-paste runtime authority.
5. Casino outcomes should emit neutral events such as `gambling_bet_placed`, `gambling_win`, `gambling_loss`, `debt_created`, or `collateral_sold`; relationship, chat, and illustration systems react to those events later.
6. Do not preserve old payout odds, direct cash mutation, or modal layout just because they already exist.

Current contract module: `src/restored/games/gambling-replacement-contract.js`.

The contract is intentionally not connected to the live restored HTML yet. It only defines the shared vocabulary for the replacement layer:

- Events: `gambling_venue_visit`, `gambling_bet_placed`, `gambling_win`, `gambling_loss`, `gambling_refund`, `debt_created`, `collateral_posted`, `collateral_redeemed`, and `collateral_sold`.
- Effects: `gambling_event_record`, `economy_ledger_entry`, `relationship_emotion_hook`, and `online_authority_request`.
- Ledger bridge for implemented casino flows: placed bets map to `bet_reserved`, wins/losses map to `bet_settled`, and refunds map to `bet_refunded`.
- Debt and collateral are event vocabulary only until a separate debt/collateral ledger contract exists.
- Relationship and emotion reactions must consume `relationship_emotion_hook` later instead of casino code mutating partner state directly.

Immediate implication: future gambling work should not "fix" the old casino scripts unless the fix is needed to keep the current playable shell from breaking. New feature work starts from replacement contracts.

## Restored gambling anti-spaghetti gate

Current rule: animated casino screens are allowed to be flashy, but restored game contracts must stay boring, deterministic, and easy to test.

Expansion order for roulette, baccarat, horse racing, slots, and future Dice City games:

1. Add pure game contracts under `src/restored/games/`.
2. Add one smoke check for the contract before any visual work.
3. Build animation adapters or standalone design-test pages after the rules are guarded.
4. Connect a venue UI only after the adapter reads contract output instead of inventing money/result logic.
5. Route cash, chips, debt, collateral, relationship reactions, and online authority through event/effect envelopes.

Contract purity rules:

- No `document`, `window`, `localStorage`, `Math.random`, or timers in pure game contracts.
- No DOM queries, class toggles, HTML strings, audio playback, browser navigation, or direct storage writes in pure game contracts.
- Random-looking outcomes must receive their result input from a caller, test fixture, or future authority layer.
- Animation timing belongs in animation adapters or design-test pages, not in the rule contract.
- Each new contract needs an explicit version export, validation function, smoke check, and a `npm run check` entry.

Current guard: `tools/check-restored-game-contract-purity.cjs`.

## Blackjack design prototype handoff

Current standalone prototype: `blackjack-design-test.html`.

Future integration target: `다이스시티 -> 카지노거리 -> 블랙잭카지노`.

Do not connect it to the live restored game yet. Keep it as a design-test page until the human explicitly says to apply it in-game.

Current prototype direction:

1. The table layout is good enough to become the future in-game blackjack base.
2. The page should stay fully Korean in visible UI copy.
3. The chip visuals should feel more like premium casino chips than simple buttons.
4. Clicking a chip should animate a chip flying onto the table and stacking in the betting area.
5. The later in-game version should preserve the table/hand/control feel, but route all money changes through the restored gambling replacement contract before integration.

## Blackjack replacement contract v0

Current pure rules module: `src/restored/games/blackjack-contract.js`.
Current pure round module: `src/restored/games/blackjack-round-contract.js`.

Version: `restored-blackjack-001`.
Round version: `restored-blackjack-round-001`.

This module is the first replacement-game layer on top of the restored gambling event contract. It is not wired to `blackjack-design-test.html` or `baegeum-city-v2-dice.html` yet.

Current scope:

- Scores blackjack hands with ace downgrade, soft totals, bust detection, and natural blackjack detection.
- Compares player/dealer hands into `player_blackjack`, `dealer_blackjack`, `player_win`, `player_loss`, `push`, `player_bust`, or `dealer_bust`.
- Creates bet envelopes that map blackjack bets to `gambling_bet_placed` and the `bet_reserved` ledger bridge.
- Creates result envelopes that map wins/losses/pushes to `gambling_win`, `gambling_loss`, or `gambling_refund`.
- Keeps blackjack payouts as event output only: normal win returns `bet * 2`, natural blackjack returns `bet * 2.5`, push returns the original bet through `bet_refunded`.
- Keeps relationship/emotion reaction as hook output, not direct partner mutation.

Round-state scope:

- The round state flow is `ready -> player_turn -> dealer_turn -> settled`.
- A provided shoe is consumed from the front and never reshuffled or refilled by the round module.
- Initial deal alternates player/dealer/player/dealer.
- Natural blackjack auto-settles immediately after the initial deal.
- Hit draws one player card and auto-settles on bust.
- Stand moves to dealer turn, draws until 17 or higher, then settles.
- A settled round can create a result envelope through the restored gambling contract; unsettled rounds return no result envelope.

## Roulette replacement contract v0

Current pure rules module: `src/restored/games/roulette-contract.js`.

Version: `restored-roulette-001`.

This module is not wired to the live restored HTML yet. It only defines the future roulette table's rules and event output.

Current scope:

- Supports single-zero roulette numbers `0` through `36`.
- Supports bet types: `straight / red / black / odd / even / low / high / dozen / column`.
- Treats `0` as green; outside bets lose on `0`.
- Pays straight bets at `36x`, dozen/column at `3x`, and outside bets at `2x`, including stake after bet reservation.
- Creates bet envelopes through `gambling_bet_placed` and the `bet_reserved` ledger bridge.
- Creates result envelopes through `gambling_win` or `gambling_loss` and the `bet_settled` ledger bridge.
- Keeps relationship/emotion reaction as hook output, not direct partner mutation.

## Baccarat replacement contract v0

Current pure rules module: `src/restored/games/baccarat-contract.js`.

Version: `restored-baccarat-001`.

This module is not wired to the live restored HTML yet. It only defines the future baccarat table's rules and event output.

Current scope:

- Supports provided final hands for player / banker / tie comparison.
- Scores baccarat hands by the ones digit only; aces count as 1 and 10/J/Q/K count as 0.
- Detects natural 8/9 on two-card hands, but does not draw cards or implement table animation.
- Supports player / banker / tie bets.
- Pays player bets at `2x`, banker bets at `1.95x` after commission, and tie bets at `9x`, including stake after bet reservation.
- Refunds player/banker bets on a tied hand through `gambling_refund` and the `bet_refunded` ledger bridge.
- Creates bet/result envelopes through the restored gambling event contract.
- Keeps relationship/emotion reaction as hook output, not direct partner mutation.

## Slot replacement contract v0

Current pure rules module: `src/restored/games/slot-contract.js`.

Version: `restored-slot-001`.

This module is not wired to the live restored HTML yet. It only defines the future slot machine's provided-result rules and event output.

Current scope:

- Supports three provided reel symbols: `blank`, `cherry`, `lemon`, `bell`, `bar`, and `seven`.
- Does not generate random reel results. A caller, fixture, animation adapter, or future server authority must provide the reel symbols.
- Classifies outcomes as jackpot / triple / pair / loss.
- Pays three sevens at `50x`, three bars at `20x`, three bells at `10x`, other triples at `5x`, two sevens at `3x`, and two cherries at `2x`, including stake after bet reservation.
- Creates bet envelopes through `gambling_bet_placed` and the `bet_reserved` ledger bridge.
- Creates result envelopes through `gambling_win` or `gambling_loss` and the `bet_settled` ledger bridge.
- Keeps relationship/emotion reaction as hook output, not direct partner mutation.

## Pawnshop collateral contract v0

Current pure collateral module: `src/restored/games/pawnshop-contract.js`.

Version: `restored-pawnshop-001`.

This module is not wired to the live restored HTML yet. It only defines the future pawnshop's quote and collateral event output.

Current scope:

- Creates pawnshop quotes from item id/name/count, appraised cash value, loan rate, fee rate, and term days.
- Uses default loan math of `50%` of appraised value and `15%` redemption fee.
- Emits `collateral_posted` when an item is pawned, `collateral_redeemed` when the item is bought back, and `collateral_sold` when the item is forfeited/sold.
- Produces local pawnshop effects for item hold, item return, collateral sold, and cash delta.
- Keeps pawnshop cash/item mutation out of the live UI until a debt/collateral ledger contract exists.
- Keeps relationship/emotion reaction as hook output, not direct partner mutation.

## Loan office debt contract v0

Current pure debt module: `src/restored/games/loan-office-contract.js`.

Version: `restored-loan-office-001`.

This module is not wired to the live restored HTML yet. It only defines the future Dice City loan office's debt quote and local effect output.

Current scope:

- Creates loan quotes from principal cash, service fee rate, interest rate, and term days.
- Uses default loan math of `5%` upfront service fee and `30%` due interest.
- Emits shared `debt_created` only when a loan is borrowed.
- Produces local loan-office effects for debt registration, cash delta, payment, delinquency, and default state.
- Keeps repayment, delinquency, and default as local contract effects until a separate debt ledger/event vocabulary exists.
- Does not project loan-office cash changes into the economy ledger yet.
- Keeps relationship/emotion reaction as hook output on borrow, not direct partner mutation.

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
- 미니게임/환전 UI 참고는 고정 vendor인 `vendor/diceland`와 라이브 참고 페이지 `https://pepeant.github.io/diceland/`를 먼저 본다. 특히 10/50/100칩 환전, 슬롯 머신, 블랙잭 전략 패널, 룰렛 배당표/0 규칙은 다이스시티 안에서 각각 독립 업장 또는 독립 게임 패널로 분리한다.

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
