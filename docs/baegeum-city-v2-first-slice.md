# 배금도시 v2 첫 수직 조각

결론: 첫 구현은 **오프라인 도시 코어가 실제 브라우저에서 실행되는 상태**까지 완료했다.

## 현재 구현

- 정적 서버와 브라우저용 `index.html`을 추가했다.
- Iron Line 원본 `map01.js` + `map01-custom-layout.js`를 vendor에서 로드해 최종 원본 맵을 사용한다.
- 게임 화면은 원본 `renderer.js` + `renderer-scenery.js`의 지형/도로/장애물/장식물 렌더링을 사용한다.
- 우하단 미니맵은 Iron Line 원본 `renderer-minimap.js`를 vendor에서 로드해 사용한다.
- 플레이어 이동, 카메라 추적, 건물/장애물 충돌을 구현했다.
- `WorldClock`을 추가해 중앙 시간 HUD, 휴대폰 시간 표시, 낮밤 조명 기준을 연결했다.
- 왼쪽 상단 개발 패널은 기본 화면에서 제거하고, 오른쪽 상단 톱니바퀴 설정 패널로 숨겼다.
- 미니맵은 오른쪽 상단으로 옮겼다.
- NPC 10명이 NavGraph 경로를 따라 도시를 배회한다.
- Iron Line 건물 13개는 블랙잭카지노, 홀짝카지노, 경마장 같은 도박장 종류로 분류했다.
- 각 건물 위에는 한국어 간판을 표시하고, `E`로 전용 실내 씬에 입장/퇴장할 수 있다.
- `editor.html`에는 배금도시 도박장 메타데이터 확장 패널을 붙였다.
- 도박장마다 `world`, `venue`, `table`, `spectator`, `admin`, `chat` 채널 ID를 예약했다.
- 도박장 실내 씬은 `src/data/interiors.js`에서 생성한다.
- 개발자 HUD는 현재 씬, 좌표, 가까운 문을 표시한다.
- `G` 키로 NavGraph 디버그 표시를 켜고 끌 수 있다.
- `?spawn=blackjack-casino`, `?spawn=odd-even-casino`, `?spawn=horse-track` 같은 개발용 시작 위치를 지원한다.
- 멀티맵 검증용으로 `?map=dice-city&spawn=dice-blackjack-casino-01` 같은 개발용 map/spawn 시작 위치를 지원한다.

## 실행

```powershell
npm start
```

브라우저:

```text
http://127.0.0.1:4173/index.html
```

문 테스트:

```text
http://127.0.0.1:4173/index.html?spawn=blackjack-casino
```

다이스시티 복사 카지노 테스트:

```text
http://127.0.0.1:4173/index.html?map=dice-city&spawn=dice-blackjack-casino-01
```

## 검증

실행한 검증:

- `npm run check`
- 브라우저 로드 확인
- 콘솔 에러 없음 확인
- `?spawn=blackjack-casino`에서 블랙잭카지노 문 감지 확인
- `?map=dice-city&spawn=dice-blackjack-casino-01`에서 다이스시티 복사 블랙잭카지노 문 감지 확인
- `E`로 블랙잭카지노 실내 입장 확인
- 다시 `E`로 도시 복귀 확인
- Iron Line vendor 해시와 최종 맵 카운트 확인
- Iron Line 미니맵 원본 해시 확인
- 도박장 간판/입구/관전자/관리자 채널 스모크 확인
- `WorldClock` 시간 진행과 반복 이벤트 스모크 확인

## 현재 의도적 한계

- 온라인은 아직 붙이지 않았다.
- 맵 에디터는 Iron Line 원본 에디터로 복원했다.
- 휴대폰 안 지도/지도 퀵버튼은 의도적으로 숨겼고, 월드 지도는 Iron Line 미니맵으로 분리했다.
- 관리자 페이지는 아직 이식하지 않았다.
- NPC는 도시 배회만 한다. 전투, 대화, 범죄, 추격은 없다.
- 건물 내부는 실제 월드 내부가 아니라 별도 씬 텔레포트 방식이다.
- 실제 블랙잭/홀짝/경마 게임 규칙은 아직 붙이지 않았다. 현재는 장소와 실내 씬 구조만 준비했다.

## 다음 단계

1. `홀짝카지노`에 최소 베팅/승패/손익 기록을 붙인다.
2. 개발자 패널에 충돌 박스, NPC 경로, 선택 건물 정보를 추가한다.
3. 온라인은 도박장별 `onlineRoomId` 기준으로 2~4명 위치 동기화부터 시작한다.
