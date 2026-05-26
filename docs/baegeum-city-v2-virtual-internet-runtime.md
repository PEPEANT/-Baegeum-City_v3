# 배금도시 v2 가상 인터넷 런타임

결론: DIS는 이제 단순 고정 미리보기가 아니라 `WorldClock`, 현재 채팅 채널, 현재 장소, 최근 채팅을 읽어서 게시글 피드를 만든다. 원본 MammonCity 디자인 클래스는 그대로 유지한다.

## 현재 구현

- 데이터 생성 기준 파일은 `src/systems/virtual-internet.js`다.
- 폰 DIS 렌더러는 `src/devices/phone/dis-preview.js`다.
- 원본 디자인 고정 파일은 `vendor/mammon-city/js/apps/dis/dis-manifest.js`, `vendor/mammon-city/js/apps/dis/dis-community-service.js`, `vendor/mammon-city/css/phone.css`다.
- DIS 마크업은 `.dis-community-shell`, `.dis-community-post-row`, `.dis-community-tabs` 같은 원본 클래스 구조를 유지한다.

## 데이터 흐름

```text
CityGame
  -> WorldClock snapshot
  -> WorldChat current channel/history
  -> current scene/interior
  -> createVirtualInternetSnapshot()
  -> buildDisPreviewMarkup()
  -> Mammon phone DIS screen
```

## 게시글 규칙

- `world:baegeum-city`와 `world:dice-city`에서는 각 도시 전체 게시판 느낌의 글을 만든다.
- `venue:*` 채널에서는 해당 카지노/장소 채널이 열린 것처럼 표시한다.
- 최근 채팅이 있으면 `방금 채팅:` 게시글로 DIS 피드에 반영한다.
- 밤 시간대에는 밤 루머 글을, 19:00-20:59에는 카지노 피크타임 글을 우선 생성한다.

## 아직 안 한 것

- 실제 글쓰기/댓글/추천 저장은 아직 없다.
- Firebase/서버 실시간 게시판도 아직 붙이지 않는다.
- DIS는 월드 채팅을 대체하지 않는다. 월드 채팅은 실시간 채널, DIS는 게시판형 가상 인터넷이다.

## 다음 순서

1. 글쓰기 버튼을 눌렀을 때 로컬 게시글 draft를 만들 수 있게 한다.
2. 게시글에 `sourceEventId`, `venueId`, `channelId`, `createdAtGameTime`을 붙인다.
3. 온라인 서버가 생기면 DIS 글 저장과 검열/신고/관리자 로그를 서버 권위로 옮긴다.
