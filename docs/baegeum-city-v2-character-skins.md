# 배금도시 v2 캐릭터 스킨

결론: `PEPEANT/-drawing-world`의 캐릭터 스킨 시스템은 원본 파일을 `vendor/drawing-world/`에 고정하고, 배금도시 전용 연결은 `src/skins/`에서만 한다.

## 목적

캐릭터 스킨은 게임 감각을 빨리 확인하는 기준이다. 그래서 정식 로비보다 먼저 `skin-lab.html` 테스트장을 만들고, 여기서 플레이어 스킨과 NPC 프리셋을 확인한 뒤 본게임에 적용한다.

## 현재 구현

- 원본 출처: `https://github.com/PEPEANT/-drawing-world`
- 고정 커밋: `ab60cc00753aae303bde8feffebb0faf94347185`
- 원본 파일 위치: `vendor/drawing-world/`
- 원본 검증: `tools/check-drawing-world-vendor.cjs`
- 배금도시 어댑터: `src/skins/drawing-world-adapter.js`
- 테스트장: `skin-lab.html`, `src/skins/skin-lab.js`, `src/skins/skin-lab-stage.js`

## 현재 흐름

1. `skin-lab.html`에서 Drawing World 프리셋 4종과 `+ 커스텀`을 확인한다.
2. 커스텀 스킨은 32x32 픽셀 캔버스에서 편집한다.
3. `본게임에 적용`을 누르면 `localStorage`에 배금도시 스킨으로 저장한다.
4. `index.html`의 플레이어는 저장된 스킨을 읽는다.
5. NPC는 Drawing World 프리셋을 순서대로 배정받는다.

## 규칙

- `vendor/drawing-world/` 안의 파일은 직접 수정하지 않는다.
- 원본을 바꿔야 한다면 새 커밋 기준으로 vendor 파일과 해시를 함께 갱신한다.
- 배금도시 전용 렌더링, 저장 키, UI 연결은 `src/skins/`에서 처리한다.
- 정식 시작 화면/로비 통합은 나중 단계로 둔다. 지금은 테스트장에서 먼저 검증한다.

## 다음 단계

- 시작 화면에 스킨 선택을 자연스럽게 합치기.
- NPC별 직업/성격에 맞는 스킨 배정표 만들기.
- 온라인 구조를 붙일 때 플레이어 스킨 데이터 전송 규격 정하기.
