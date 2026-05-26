# 배금도시 v2 OST

결론: 현재 OST는 `PEPEANT/dis-site`의 `RECLAIM_2.5` BGM 세 곡을 원본 파일명 그대로 가져와 설정 패널에서만 수동 재생한다.

## Current Behavior

- OST 파일 위치: `assets/audio/ost/reclaim-2.5`
- 재생 UI 위치: 게임 화면 오른쪽 상단 설정 패널 안
- 자동 재생 없음: 브라우저 정책과 플레이 화면 단순화를 위해 사용자가 `OST 재생`을 눌러야 시작한다.
- 곡이 끝나면 다음 곡으로 넘어간다.

## Imported Tracks

- `bgm_0.mp3`
- `bgm_1.mp3`
- `bgm_2.mp3`

## Rules

- OST 버튼은 메인 HUD에 따로 빼지 않는다.
- 새 음악을 추가할 때는 `assets/audio/ost/VENDOR.md`에 출처를 먼저 남긴다.
- 온라인 도박/도시 기능과 분리해서, OST는 클라이언트 로컬 연출로만 둔다.
